/** Loads the ESM Markdown parser and keeps AST validation at the content boundary. */
export async function loadMarkdownReader() {
    const [{unified}, {default: remarkParse}, {default: remarkGfm}, {toString}] = await Promise.all([
        import('unified'), import('remark-parse'), import('remark-gfm'), import('mdast-util-to-string'),
    ]);

    return (body: string, name: string): string => {
        const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
        const stack: unknown[] = [tree];
        while (stack.length) {
            const node = stack.pop() as { type?: string; value?: string; url?: string; children?: unknown[] };
            if (node.type === 'html' && /<(?:script|iframe|object|embed|style|link|meta|form)\b|\bon\w+\s*=|(?:javascript|vbscript|data)\s*:/iu.test(node.value ?? '')) {
                throw new Error(`${name}: active HTML is not allowed outside code fences.`);
            }

            if (node.url && /^(?:javascript|vbscript|data):/iu.test(node.url.replace(/[\u0000-\u0020]/gu, ''))) {
                throw new Error(`${name}: unsafe URL.`);
            }

            if (node.children) {
                stack.push(...node.children);
            }
        }
        return toString(tree);
    };
}
