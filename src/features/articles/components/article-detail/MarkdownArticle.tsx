import {Fragment} from "react";

interface Heading {
    readonly id: string;
    readonly label: string;
    readonly level: 2 | 3;
}

type Block =
    | { readonly type: "heading"; readonly heading: Heading }
    | { readonly type: "paragraph"; readonly text: string }
    | { readonly type: "quote"; readonly text: string }
    | { readonly type: "code"; readonly language: string; readonly code: string }
    | { readonly type: "list"; readonly items: readonly string[]; readonly ordered: boolean };

const omittedHeadings = new Set(["Suggested next readings", "Próximas leituras sugeridas"]);

function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function cleanText(value: string) {
    return value.replace(/\*\*|`|_/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

function parseBlocks(markdown: string): readonly Block[] {
    const lines = markdown.split(/\r?\n/);
    const blocks: Block[] = [];
    let index = 0;
    let omitSection = false;

    while (index < lines.length) {
        const line = lines[index].trim();
        if (!line) {
            index += 1;
            continue;
        }
        if (line.startsWith("<!--")) {
            while (index < lines.length && !lines[index].includes("-->")) index += 1;
            index += 1;
            continue;
        }
        const heading = line.match(/^(#{2,3})\s+(.+)$/);
        if (heading) {
            const label = cleanText(heading[2]);
            omitSection = omittedHeadings.has(label);
            if (!omitSection) blocks.push({
                type: "heading",
                heading: {id: slugify(label), label, level: heading[1].length as 2 | 3}
            });
            index += 1;
            continue;
        }
        if (line.startsWith("# ")) {
            index += 1;
            continue;
        }
        if (line.startsWith("```")) {
            const language = line.slice(3).trim();
            const code: string[] = [];
            index += 1;
            while (index < lines.length && !lines[index].trim().startsWith("```")) code.push(lines[index++]);
            index += 1;
            if (!omitSection) blocks.push({type: "code", language, code: code.join("\n")});
            continue;
        }
        if (line.startsWith(">")) {
            const quote: string[] = [];
            while (index < lines.length && lines[index].trim().startsWith(">")) quote.push(lines[index++].trim().replace(/^>\s?/, ""));
            const text = quote.join(" ");
            if (!omitSection && !text.includes("Related reading:") && !text.includes("Leitura relacionada:")) blocks.push({
                type: "quote",
                text
            });
            continue;
        }
        const list = line.match(/^(\d+\.|[-*])\s+(.+)$/);
        if (list) {
            const ordered = /\d+\./.test(list[1]);
            const items: string[] = [];
            while (index < lines.length) {
                const item = lines[index].trim().match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/);
                if (!item) break;
                items.push(item[1]);
                index += 1;
            }
            if (!omitSection) blocks.push({type: "list", items, ordered});
            continue;
        }
        const paragraph: string[] = [];
        while (index < lines.length && lines[index].trim() && !/^(#{1,3})\s|^```|^>|^(\d+\.|[-*])\s+|^<!--/.test(lines[index].trim())) paragraph.push(lines[index++].trim());
        if (!omitSection && paragraph.length) blocks.push({type: "paragraph", text: paragraph.join(" ")});
        if (!paragraph.length) index += 1;
    }
    return blocks;
}

function Inline({text}: { readonly text: string }) {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|_.*?_ |\[[^\]]+\]\([^)]*\))/g);
    return parts.map((part, index) => {
        if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
        if (link) return <a href={link[2]} key={index} rel={link[2].startsWith("http") ? "noreferrer" : undefined}
                            target={link[2].startsWith("http") ? "_blank" : undefined}>{link[1]}</a>;
        return <Fragment key={index}>{part}</Fragment>;
    });
}

export function MarkdownArticle({markdown}: { readonly markdown: string }) {
    return (
        <>
            {parseBlocks(markdown).map((block, index) => {
                if (block.type === "heading") {
                    const Tag = block.heading.level === 2 ? "h2" : "h3";
                    return <Tag id={block.heading.id} key={`${block.heading.id}-${index}`}>{block.heading.label}</Tag>;
                }
                if (block.type === "paragraph") return <p key={index}><Inline text={block.text}/></p>;
                if (block.type === "quote")
                    return <aside className="article-callout" key={index}>
                        <Inline
                            text={block.text}/>
                    </aside>;
                if (block.type === "code")
                    return <pre className="article-code" key={index}>
                        <code
                            data-language={block.language}>{block.code}
                        </code>
                    </pre>;
                const Tag = block.ordered ? "ol" : "ul";
                return <Tag key={index}>{block.items.map((item) => <li key={item}><Inline text={item}/></li>)}</Tag>;
            })}
        </>
    );
}
