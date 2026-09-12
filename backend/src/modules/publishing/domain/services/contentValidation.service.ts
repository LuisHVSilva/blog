import type {ParsedContent, ContentDiagnostic, ContentValidation} from '../content-validation.types';
import {EditorialRules} from '../editorial-rules';
import {type Locale} from '../publishing.types';
import {ReadingTime} from '../reading-time';
import type {IContentValidationService} from './contentValidation.service.interface';

export class ContentValidationService implements IContentValidationService {
    private error(errors: ContentDiagnostic[], file: string, field: string, code: string, message: string): void { errors.push({file, field, code, message}); }

    validate(items: readonly ParsedContent[]): ContentValidation {
        const errors: ContentDiagnostic[] = []; const articles = new Set<string>(); const translations = new Set<string>(); const localeSlugs = new Set<string>(); const articleLocales = new Set<string>();
        for (const item of items) {

            if (!EditorialRules.isUuid(item.articleId) || !EditorialRules.isUuid(item.translationId)) {
                this.error(errors, item.file, 'id', 'INVALID_UUID', 'Article and translation IDs must be UUIDs.');
            }

            if (!EditorialRules.isLocale(item.locale) || !EditorialRules.isLocale(item.sourceLocale)) {
                this.error(errors, item.file, 'locale', 'UNSUPPORTED_LOCALE', 'Locale is not supported.');
            }

            if (!EditorialRules.isCanonicalSlug(item.slug)) {
                this.error(errors, item.file, 'slug', 'INVALID_SLUG', 'Slug must be canonical.');
            }

            if (!item.title.trim() || !item.description.trim() || !(item.readingText ?? item.body).trim()) {
                this.error(errors, item.file, 'content', 'REQUIRED_CONTENT', 'Title, description and body are required.');
            }

            if (item.title.trim().length > 200 || item.description.trim().length > 500) {
                this.error(errors, item.file, 'content', 'CONTENT_TOO_LONG', 'Title or description exceeds the editorial limit.');
            }

            const articleLocale = `${item.articleId}:${item.locale}`;

            if (articleLocales.has(articleLocale)) {
                this.error(errors, item.file, 'locale', 'DUPLICATE_ARTICLE_LOCALE', 'Article locale is repeated.');
            }

            articleLocales.add(articleLocale);

            if (!['foundational', 'intermediate', 'advanced'].includes(item.difficulty)) {
                this.error(errors, item.file, 'difficulty', 'INVALID_DIFFICULTY', 'Difficulty is invalid.');
            }

            if (translations.has(item.translationId)) {
                this.error(errors, item.file, 'translationId', 'DUPLICATE_TRANSLATION', 'Translation ID is repeated.');
            }

            translations.add(item.translationId); articles.add(item.articleId);

            const key = `${item.locale}\u0000${item.slug}`;

            if (localeSlugs.has(key)) {
                this.error(errors, item.file, 'slug', 'DUPLICATE_SLUG', 'Locale slug is repeated.');
                localeSlugs.add(key);
            }
        }

        for (const articleId of articles) {
            if (!items.some((item) => item.articleId === articleId && item.locale === item.sourceLocale)) {
                errors.push({
                    file: 'catalog',
                    field: 'sourceLocale',
                    code: 'MISSING_SOURCE',
                    message: `Article ${articleId} has no source translation.`
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings: [],
            edition: items.filter((item): item is ParsedContent & {
                locale: Locale
            } => EditorialRules.isLocale(item.locale)).map((item) => ({
                articleId: item.articleId,
                translationId: item.translationId,
                locale: item.locale,
                readingMinutes: ReadingTime.estimateMinutes(item.readingText ?? item.body)
            }))
        };
    }

}

export type {ParsedContent, ContentDiagnostic, ContentValidation} from '../content-validation.types';
