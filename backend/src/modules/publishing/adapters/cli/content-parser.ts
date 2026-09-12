import {loadMarkdownReader} from './markdown-reader';
import {readdirSync, readFileSync, realpathSync, statSync} from 'node:fs';
import path from 'node:path';
import {parseDocument} from 'yaml';
import {z} from 'zod';
import type {EditorialCatalog} from '../../domain/editorial-catalog';
import type {ParsedContent} from '../../application/validate-content';
import {EditorialRules} from '../../domain/editorial-rules';
import {ContentHashService} from '../content-revision';
import {catalogSchema} from './catalog-schema';

type YamlRecord = Record<string, unknown>;
type ParsedCatalog = ParsedContent[] & Readonly<{ catalog: EditorialCatalog }>;

function record(value: unknown, label: string): YamlRecord {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${label}: expected an object.`);
    }

    return value as YamlRecord;
}

function yaml(source: string, label: string): YamlRecord {
    const document = parseDocument(source, {uniqueKeys: true});
    if (document.errors.length) {
        throw new Error(`${label}: invalid YAML.`);
    }

    return record(document.toJS({maxAliasCount: 0}), label);
}

function text(value: unknown, label: string): string {
    if (typeof value !== 'string') {
        throw new Error(`${label}: expected a string.`);
    }

    return value;
}

function contained(root: string, candidate: string): string {
    const resolved = realpathSync(candidate);
    const relative = path.relative(root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('Content path escapes its root.');
    }

    return resolved;
}

/**
 * Reads an editorial content directory while enforcing containment, frontmatter shape, and source revisions.
 *
 * @param root - Content directory containing `catalog.yaml` and article translation folders.
 * @returns Parsed translations augmented with their validated catalog.
 */
export async function parseContentRoot(root: string): Promise<ParsedCatalog> {
    const readMarkdown = await loadMarkdownReader();
    const base = realpathSync(root);
    const catalog = catalogSchema.parse(yaml(readFileSync(contained(base, path.join(base, 'catalog.yaml')), 'utf8').replace(/^\uFEFF/u, ''), 'catalog'));
    if (!Array.isArray(catalog.articles)) throw new Error('catalog.articles must be an array.');
    const seen = new Set<string>(); const result: ParsedContent[] = [];
    for (const entry of catalog.articles) {
        const article = record(entry, 'article');
        const articleId = text(article.id, 'articleId');
        if (!EditorialRules.isUuid(articleId) || seen.has(articleId)) throw new Error('Catalog article IDs must be unique UUIDs.');
        seen.add(articleId);
        const directory = contained(base, path.join(base, 'articles', articleId));
        for (const name of readdirSync(directory).filter((value) => value.endsWith('.md')).sort()) {
            const file = contained(base, path.join(directory, name));
            if (statSync(file).size > 512 * 1024) throw new Error(`${name}: file exceeds 512 KiB.`);
            const source = new TextDecoder('utf-8', {fatal: true}).decode(readFileSync(file)).replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n');
            const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/u.exec(source);
            if (!match) throw new Error(`${name}: missing delimited frontmatter.`);
            const values = yaml(match[1]!, name);
            const allowed = ['translationId', 'articleId', 'locale', 'slug', 'title', 'description', 'status', 'publishedAt', 'updatedAt', 'sourceRevision', 'translatedFromRevision', 'seoTitle', 'seoDescription', 'socialImagePath', 'imageAlt'];
            if (Object.keys(values).some((key) => !allowed.includes(key))) throw new Error(`${name}: unknown frontmatter field.`);
            if (values.articleId !== undefined && values.articleId !== articleId) throw new Error(`${name}: articleId does not match its directory.`);
            const locale = text(values.locale, 'locale');
            if (name !== `${locale}.md`) throw new Error(`${name}: filename does not match locale.`);
            const body = match[2]!;
            const seo = {title: text(values.seoTitle ?? values.title, 'seoTitle'), description: text(values.seoDescription ?? values.description, 'seoDescription'),
                ...(values.socialImagePath ? {socialImagePath: text(values.socialImagePath, 'socialImagePath'), imageAlt: text(values.imageAlt, 'imageAlt')} : {})};
            if (seo.socialImagePath) {
                if (path.isAbsolute(seo.socialImagePath) || seo.socialImagePath.split(/[\\/]/u).includes('..')) throw new Error(`${name}: invalid image path.`);
                contained(base, path.join(base, seo.socialImagePath));
            }
            const status = z.enum(['draft', 'published', 'archived']).parse(values.status ?? 'draft');
            const updatedAt = values.updatedAt === undefined ? undefined : z.iso.datetime().parse(values.updatedAt);
            const publishedAt = values.publishedAt === undefined ? undefined : z.iso.datetime().parse(values.publishedAt);
            if ([updatedAt, publishedAt].some((date) => date && Date.parse(date) > Date.now())) throw new Error(`${name}: future editorial date.`);
            const revision = new ContentHashService().revision({locale, slug: text(values.slug, 'slug'), title: text(values.title, 'title'), description: text(values.description, 'description'), bodyMarkdown: body, seo});
            if (values.sourceRevision !== undefined && values.sourceRevision !== revision) throw new Error(`${name}: SOURCE_REVISION_MISMATCH.`);
            const translatedFromRevision = values.translatedFromRevision === undefined ? undefined : z.string().regex(/^[a-f0-9]{64}$/u).parse(values.translatedFromRevision);
            const readingText = readMarkdown(body, name);
            result.push({file, articleId, translationId: text(values.translationId, 'translationId'), sourceLocale: text(article.sourceLocale, 'sourceLocale'), locale,
                slug: text(values.slug, 'slug'), title: text(values.title, 'title'), description: text(values.description, 'description'), body,
                difficulty: text(article.difficulty, 'difficulty'), readingText, sourceRevision: revision, translatedFromRevision, status, seo, updatedAt, publishedAt});
        }
    }
    return Object.assign(result, {catalog});
}
