import type {PublishedArticle} from '../entities/publishedArticle';
import type {ArticleListInput, ArticlePage, ArticleLookup, SlugQuery} from '../public-content.types';
import type {SeriesArticleProjection} from '../repositories/publicArticle.repository.interface';
import type {Locale} from '../article';
export interface IArticleService {
    allPublished(): Promise<readonly PublishedArticle[]>;
    list(input: ArticleListInput): Promise<ArticlePage>;
    getBySlug(input: SlugQuery): Promise<ArticleLookup | null>;
    listSeriesMembers(input: Readonly<{seriesId: string; locale: Locale}>): Promise<readonly SeriesArticleProjection[]>;
}
