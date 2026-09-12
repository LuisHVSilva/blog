import {PublishedArticle} from '../entities/publishedArticle';
import {EditorialRuleError} from '../editorial-rule.error';
import {EditorialRules} from '../editorial-rules';
import {type Locale} from '../publishing.types';
import type {ArticleListInput, ArticleLookup, ArticlePage, SlugQuery} from '../public-content.types';
import type {
    IPublicArticleRepository,
    PublicArticleLookup,
    SeriesArticleProjection
} from '../repositories/publicArticle.repository.interface';
import type {IArticleService} from './article.service.interface';
import {PublicQueryValidation} from './publicQuery.validation';

/** Coordinates validated public article queries and maps entities to detached DTOs. */
export class ArticleService implements IArticleService {
    constructor(private readonly repository: IPublicArticleRepository) {}

    /** Returns all published article entities for a consistent snapshot export. */
    async allPublished(): Promise<readonly PublishedArticle[]> {
        return await this.repository.allPublished();
    }

    /** Validates list filters and returns public summaries with pagination metadata. */
    async list(input: ArticleListInput): Promise<ArticlePage> {
        const page = await this.repository.list(PublicQueryValidation.list(input));
        return {
            data: page.data.map((article) => article.toSummary()),
            pagination: {...page.pagination}
        };
    }

    /** Resolves a localized slug to an article detail, redirect, or `null`. */
    async getBySlug(input: SlugQuery): Promise<ArticleLookup | null> {
        PublicQueryValidation.slug(input);
        const found: PublicArticleLookup | null = await this.repository.getBySlug(input);

        if (!found || found.kind === 'redirect') {
            return found;
        }
        return {...found, article: found.article.toDetail()};
    }

    async listSeriesMembers(
        input: Readonly<{ seriesId: string; locale: Locale }>
    ): Promise<readonly SeriesArticleProjection[]> {
        PublicQueryValidation.locale(input.locale);
        if (!EditorialRules.isUuid(input.seriesId)) {
            throw new EditorialRuleError('Invalid series ID.');
        }
        return await this.repository.listSeriesMembers(input);
    }
}
