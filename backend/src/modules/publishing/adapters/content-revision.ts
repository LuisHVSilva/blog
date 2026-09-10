import {createHash} from 'node:crypto';
import type {TranslationSeo} from '../domain/article';
export function canonicalHash(value: unknown): string {
    const normalize = (item: unknown): unknown => Array.isArray(item) ? item.map(normalize) : item && typeof item === 'object'
        ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => [key, normalize(val)])) : item;
    return createHash('sha256').update(JSON.stringify(normalize(value))).digest('hex');
}
export function contentRevision(item: {locale: string; slug: string; title: string; description: string; bodyMarkdown: string; seo: TranslationSeo}): string {
    return canonicalHash({locale: item.locale, slug: item.slug, title: item.title.trim().normalize('NFC'), description: item.description.trim().normalize('NFC'),
        bodyMarkdown: item.bodyMarkdown.replace(/\r\n?/gu, '\n').trim(), seo: item.seo});
}
