import {EditorialRules, type Locale} from '../domain/article';
import {ReadingTime} from '../domain/reading-time';
import type {TranslationSeo, TranslationStatus} from '../domain/article';

export type ParsedContent = Readonly<{file: string; articleId: string; translationId: string; sourceLocale: string; locale: string; slug: string; title: string; description: string; body: string; difficulty: string; readingText?: string; sourceRevision?: string; translatedFromRevision?: string; status?: TranslationStatus; seo?: TranslationSeo; updatedAt?: string; publishedAt?: string}>;
export type ContentDiagnostic = Readonly<{file: string; field: string; code: string; message: string}>;
export type ContentValidation = Readonly<{valid: boolean; errors: readonly ContentDiagnostic[]; warnings: readonly ContentDiagnostic[]; edition: readonly Readonly<{articleId: string; translationId: string; locale: Locale; readingMinutes: number}>[]}>;

export function validateContent(items: readonly ParsedContent[]): ContentValidation {
    const errors: ContentDiagnostic[] = []; const articles = new Set<string>(); const translations = new Set<string>(); const localeSlugs = new Set<string>(); const articleLocales = new Set<string>();
    for (const item of items) {
        const error = (field: string, code: string, message: string) => errors.push({file: item.file, field, code, message});
        if (!EditorialRules.isUuid(item.articleId) || !EditorialRules.isUuid(item.translationId)) error('id', 'INVALID_UUID', 'Article and translation IDs must be UUIDs.');
        if (!EditorialRules.isLocale(item.locale) || !EditorialRules.isLocale(item.sourceLocale)) error('locale', 'UNSUPPORTED_LOCALE', 'Locale is not supported.');
        if (!EditorialRules.isCanonicalSlug(item.slug)) error('slug', 'INVALID_SLUG', 'Slug must be canonical.');
        if (!item.title.trim() || !item.description.trim() || !(item.readingText ?? item.body).trim()) error('content', 'REQUIRED_CONTENT', 'Title, description and body are required.');
        if (item.title.trim().length > 200 || item.description.trim().length > 500) error('content', 'CONTENT_TOO_LONG', 'Title or description exceeds the editorial limit.');
        const articleLocale = `${item.articleId}:${item.locale}`;
        if (articleLocales.has(articleLocale)) error('locale', 'DUPLICATE_ARTICLE_LOCALE', 'Article locale is repeated.');
        articleLocales.add(articleLocale);
        if (!['foundational', 'intermediate', 'advanced'].includes(item.difficulty)) error('difficulty', 'INVALID_DIFFICULTY', 'Difficulty is invalid.');
        if (translations.has(item.translationId)) error('translationId', 'DUPLICATE_TRANSLATION', 'Translation ID is repeated.');
        translations.add(item.translationId); articles.add(item.articleId);
        const key = `${item.locale}\u0000${item.slug}`; if (localeSlugs.has(key)) error('slug', 'DUPLICATE_SLUG', 'Locale slug is repeated.'); localeSlugs.add(key);
    }
    for (const articleId of articles) if (!items.some((item) => item.articleId === articleId && item.locale === item.sourceLocale)) errors.push({file: 'catalog', field: 'sourceLocale', code: 'MISSING_SOURCE', message: `Article ${articleId} has no source translation.`});
    return {valid: errors.length === 0, errors, warnings: [], edition: items.filter((item): item is ParsedContent & {locale: Locale} => EditorialRules.isLocale(item.locale)).map((item) => ({articleId: item.articleId, translationId: item.translationId, locale: item.locale, readingMinutes: ReadingTime.estimateMinutes(item.readingText ?? item.body)}))};
}
