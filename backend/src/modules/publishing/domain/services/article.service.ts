import type {IArticleService} from './article.service.interface';
import type {IPublicArticleRepository} from '../repositories/publicArticle.repository.interface';
import type {ArticleListInput, ArticlePage, ArticleLookup, SlugQuery} from '../public-content.types';
import {EditorialRules, EditorialRuleError, type Locale} from '../article';
import {PublicQueryValidation} from './publicQuery.validation';

export class ArticleService implements IArticleService {
    constructor(private readonly repository: IPublicArticleRepository) {}
    async allPublished() { return await this.repository.allPublished(); }
    async list(input: ArticleListInput): Promise<ArticlePage> {
        const page = await this.repository.list(PublicQueryValidation.list(input));
        return {data: page.data.map((article) => article.toSummary()), pagination: {...page.pagination}};
    }
    async getBySlug(input: SlugQuery): Promise<ArticleLookup | null> {
        PublicQueryValidation.slug(input);
        const found = await this.repository.getBySlug(input);
        if (!found || found.kind === 'redirect') return found;
        return {...found, article: found.article.toDetail()};
    }
    async listSeriesMembers(input: Readonly<{seriesId: string; locale: Locale}>) {
        PublicQueryValidation.locale(input.locale);
        if (!EditorialRules.isUuid(input.seriesId)) throw new EditorialRuleError('Invalid series ID.');
        return await this.repository.listSeriesMembers(input);
    }
}
