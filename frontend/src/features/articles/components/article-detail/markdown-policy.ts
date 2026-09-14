import {defaultUrlTransform} from 'react-markdown';
import type {Nodes, Root} from 'mdast';

function plainText(node: Nodes): string {
    if (node.type === 'text' || node.type === 'inlineCode') {
        return node.value ?? '';
    }

    if (node.type === 'image') {
        return node.alt ?? '';
    }

    return 'children' in node ? node.children.map(plainText).join('') : '';
}

export function articleOutline(options: { title: string; locale: string }) {
    return (tree: Root) => {
        const first = tree.children[0];
        if (first?.type === 'heading' && first.depth === 1 && plainText(first).trim() === options.title.trim()) {
            tree.children.shift();
        }

        const entries: { id: string; text: string }[] = [];
        const used = new Set<string>();
        const fragmentIds = new Map<string, string>();

        function hasH1(node: Nodes): boolean {
            return node.type === 'heading' && node.depth === 1 || 'children' in node && node.children.some(hasH1);
        }

        const shift = hasH1(tree);

        function walk(nodes: Nodes[]) {
            for (const node of nodes) {
                if (node.type === 'heading') {
                    const text = plainText(node);
                    const base = 'section-' + (text.normalize('NFKD').toLowerCase().replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'heading');
                    let id = base;
                    let suffix = 2;
                    while (used.has(id)) id = `${base}-${suffix++}`;
                    used.add(id);

                    if (!fragmentIds.has(base.slice(8))) {
                        fragmentIds.set(base.slice(8), id);
                    }

                    node.data = {...node.data, hProperties: {...node.data?.hProperties, id}};

                    // The page supplies the editorial h1; keep every section and its hierarchy.
                    if (shift) {
                        node.depth = ({1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6} as const)[node.depth];
                    }

                    entries.push({id, text});
                }
                if ('children' in node) walk(node.children);
            }
        }

        walk(tree.children);

        function resolveFragments(node: Nodes) {
            if (node.type === 'link' && node.url.startsWith('#')) {
                const target = fragmentIds.get(node.url.slice(1));

                if (target) {
                    node.url = `#${target}`;
                }
            }

            if ('children' in node) {
                node.children.forEach(resolveFragments);
            }
        }

        resolveFragments(tree);

        if (entries.length) tree.children.unshift({
            type: 'blockquote',
            data: {
                hName: 'nav',
                hProperties: {
                    className: ['published-toc'],
                    ariaLabel: options.locale === 'pt-BR' ? 'Nesta página' : 'On this page'
                }
            },
            children: [{
                type: 'list', ordered: false, spread: false, children: entries.map(({id, text}) => ({
                    type: 'listItem',
                    spread: false,
                    children: [{
                        type: 'paragraph',
                        children: [{type: 'link', url: `#${id}`, children: [{type: 'text', value: text}]}]
                    }],
                }))
            }],
        });
    };
}

export function safeArticleUrl(url: string, key: string): string | undefined {
    const safe = defaultUrlTransform(url);

    if (!safe || Array.from(safe).some(char => char.charCodeAt(0) <= 32 || char === '\\')) {
        return undefined;
    }

    if (key === 'src' && !/^(https?:\/\/|\/[^/]|\.\.?\/|[^:/?#]+(?:\/|\.|$))/iu.test(safe)) {
        return undefined;
    }

    return safe;
}
