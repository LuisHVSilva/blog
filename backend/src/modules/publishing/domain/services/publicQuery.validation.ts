import type {Locale} from '../publishing.types';
import {EditorialRuleError} from '../editorial-rule.error';
import {EditorialRules} from '../editorial-rules';
import type {ArticleListInput, ArticleListQuery, SlugQuery} from '../public-content.types';

/** Validates public read-model inputs before a repository is queried. */
export class PublicQueryValidation {

    static locale(locale: Locale): void {
        if (!EditorialRules.isLocale(locale)) throw new EditorialRuleError('Unsupported locale.');
    }

    static slug(input: SlugQuery): void {
        this.locale(input.locale);
        if (typeof input.slug !== 'string' || !EditorialRules.isCanonicalSlug(input.slug)) {
            throw new EditorialRuleError('Invalid slug.');
        }
    }

    static list(input: ArticleListInput): ArticleListQuery {
        this.locale(input.locale);
        const page = input.page ?? 1;
        const limit = input.limit ?? 20;
        if (!Number.isSafeInteger(page) || page < 1 || page > Math.floor(Number.MAX_SAFE_INTEGER / 50)) {
            throw new EditorialRuleError('Invalid page.');
        }

        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
            throw new EditorialRuleError('Invalid limit.');
        }

        for (const slug of [input.tag, input.series]) {
            if (slug !== undefined) {
                this.slug({locale: input.locale, slug});
            }
        }

        if (input.difficulty !== undefined && !['foundational', 'intermediate', 'advanced'].includes(input.difficulty)) {
            throw new EditorialRuleError('Invalid difficulty.');
        }

        if (input.sort !== undefined && !['publishedAt:asc', 'publishedAt:desc'].includes(input.sort)) {
            throw new EditorialRuleError('Invalid sort.');
        }

        if (input.q !== undefined && typeof input.q !== 'string') {
            throw new EditorialRuleError('Invalid search.');
        }

        const q = input.q?.trim();

        if (q !== undefined && (q.length < 2 || q.length > 100)) {
            throw new EditorialRuleError('Invalid search.');
        }

        return {...input, page, limit, ...(q === undefined ? {} : {q})};
    }
}
