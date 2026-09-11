import {readFileSync, writeFileSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {parse, stringify} from 'yaml';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import {ContentHashService} from '../dist/src/modules/publishing/adapters/content-revision.js';

const project = realpathSync(path.resolve(import.meta.dirname, '../..'));
const entries = [
    ['11111111-1111-4111-8111-111111111111', 'js-ts-demystified', 'javascript-typescript-sem-misterio.pt-BR.md', 'javascript-typescript-demystified.en.md'],
    ['12222222-2222-4222-8222-222222222222', 'ts-config-explanation', 'TSConfig_artigo_blog_didatico.md', 'TSConfig_blog_article_english.md'],
    ['13333333-3333-4333-8333-333333333333', 'nodejs-por-baixo-do-framework', 'nodejs-por-baixo-do-framework.pt-BR.md', 'nodejs-under-the-framework.en.md'],
    ['14444444-4444-4444-8444-444444444444', 'backend-architecture-ts-node-foundation', 'arquitetura-backend-base-ts-node.pt-BR.md', 'backend-architecture-ts-node-foundation.en.md'],
];
const mapping = [];
for (const [articleId, directory, pt, en] of entries) {
    for (const [locale, filename] of [['pt-BR', pt], ['en', en]]) {
        const source = readFileSync(path.join(project, 'frontend/artigo', directory, filename), 'utf8').replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
        const heading = source.search(/^# /mu);
        if (heading < 0) throw new Error('Legacy source has no article heading.');
        const metadata = parse(source.slice(0, heading).trim().replace(/^---\n/u, '').replace(/\n---$/u, ''));
        const target = realpathSync(path.join(project, 'content/articles', articleId, `${locale}.md`));
        if (!target.startsWith(path.join(project, 'content/articles') + path.sep)) throw new Error('Invalid content target.');
        const current = readFileSync(target, 'utf8').replace(/^\uFEFF/u, '');
        const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/u.exec(current);
        const header = parse(match[1]);
        header.articleId = articleId;
        header.title = metadata.title;
        header.description = metadata.description;
        writeFileSync(target, `---\n${stringify(header)}---\n\n${source.slice(heading)}`, 'utf8');
        mapping.push({source: `frontend/artigo/${directory}/${filename}`, articleId, translationId: header.translationId, locale, legacyPath: `/article/${directory}`, path: `/${locale}/articles/${header.slug}`});
    }
}
writeFileSync(path.join(project, 'content/legacy-map.json'), JSON.stringify({schemaVersion: 1, entries: mapping}, null, 2) + '\n');
const normalized = [];
for (const entry of mapping) {
    const target = path.join(project, 'content/articles', entry.articleId, `${entry.locale}.md`);
    const source = readFileSync(target, 'utf8');
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/u.exec(source);
    const header = parse(match[1]); let body = match[2];
    const stack = [unified().use(remarkParse).use(remarkGfm).parse(body)]; const replacements = [];
    while (stack.length) {
        const node = stack.pop();
        if (node.type === 'link' && node.url.startsWith('/')) {
            const destination = mapping.find((candidate) => candidate.locale === entry.locale && (candidate.legacyPath === node.url || candidate.path === node.url || `/blog/${candidate.path.split('/').at(-1)}` === node.url));
            const start = node.position.start.offset; const end = node.position.end.offset;
            const original = body.slice(start, end);
            // Unwritten suggested readings retain their text without a broken public link.
            replacements.push({start, end, text: destination ? original.replace(node.url, destination.path) : original.replace(/^\[([\s\S]*)\]\([\s\S]*\)$/u, '$1')});
        }
        if (node.children) stack.push(...node.children);
    }
    for (const change of replacements.sort((a, b) => b.start - a.start)) body = body.slice(0, change.start) + change.text + body.slice(change.end);
    header.sourceRevision = new ContentHashService().revision({locale: entry.locale, slug: header.slug, title: header.title, description: header.description, bodyMarkdown: body, seo: {title: header.title, description: header.description}});
    normalized.push({entry, target, header, body});
}
for (const item of normalized) {
    if (item.entry.locale !== 'pt-BR') item.header.translatedFromRevision = normalized.find((source) => source.entry.articleId === item.entry.articleId && source.entry.locale === 'pt-BR').header.sourceRevision;
    writeFileSync(item.target, `---\n${stringify(item.header)}---\n${item.body}`);
}
console.log('Normalized eight legacy bodies in UTF-8, preserving translation UUIDs and canonical slugs.');
