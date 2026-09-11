export type {Operator, EditionInput, EditionArticleInput, Change, ImportResult} from '../domain/editorial.types';
import type {Locale, TranslationStatus} from '../domain/article';
export type {ArticleSummary, ArticleDetail, ArticleLookup, TagSummary, SeriesSummary, SeriesDetail, PublicSnapshot, ArticlePage} from '../domain/public-content.types';
export type TranslationProjection = Readonly<{articleId: string; translationId: string; locale: Locale; slug: string; status: TranslationStatus}>;
