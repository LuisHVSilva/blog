import type {PublishedArticle} from '../entities/publishedArticle';
import type {ArticleListQuery, ArticlePage, SlugQuery} from '../public-content.types';
import type {Locale} from '../article';
export type PublicArticleLookup = Readonly<{kind: 'found'; article: PublishedArticle; lastModified?: string}> | Readonly<{kind: 'redirect'; locale: Locale; slug: string}>;
export type PublicArticlePage = Readonly<{data: readonly PublishedArticle[]; pagination: ArticlePage['pagination']}>;
export type SeriesArticleProjection = Readonly<{position: number; article: PublishedArticle}>;
/** Read repository rooted in an article translation. Related tables are read-only projections. */
export interface IPublicArticleRepository {
    allPublished(): Promise<readonly PublishedArticle[]>;
    getBySlug(input: SlugQuery): Promise<PublicArticleLookup | null>;
    list(input: ArticleListQuery): Promise<PublicArticlePage>;
    listSeriesMembers(input: Readonly<{seriesId: string; locale: Locale}>): Promise<readonly SeriesArticleProjection[]>;
}
