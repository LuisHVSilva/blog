import {createHash} from 'node:crypto';
import type {IContentHashService} from '../domain/services/editorialRuntime.interface';
import type {TranslationSeo} from '../domain/article';
export class ContentHashService implements IContentHashService {
    private normalize(item: unknown): unknown {
        return Array.isArray(item) ? item.map((value) => this.normalize(value)) : item && typeof item === 'object'
            ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => [key, this.normalize(val)])) : item;
    }
    hash(value: unknown): string { return createHash('sha256').update(JSON.stringify(this.normalize(value))).digest('hex'); }
    revision(item: {locale: string; slug: string; title: string; description: string; bodyMarkdown: string; seo: TranslationSeo}): string {
        return this.hash({locale: item.locale, slug: item.slug, title: item.title.trim().normalize('NFC'), description: item.description.trim().normalize('NFC'),
            bodyMarkdown: item.bodyMarkdown.replace(/\r\n?/gu, '\n').trim(), seo: item.seo});
    }
}
