export type {Operator, EditionInput, EditionArticleInput, Change, ImportResult} from '../domain/editorial.types';
import type {Locale, TranslationStatus} from '../domain/publishing.types';

export type {ArticleSummary, ArticleDetail, ArticleLookup, TagSummary, SeriesSummary, SeriesDetail, PublicSnapshot, ArticlePage} from '../domain/public-content.types';
/** Identifies a translation while importing or reconciling an editorial edition. */
export type TranslationProjection = Readonly<{articleId: string; translationId: string; locale: Locale; slug: string; status: TranslationStatus}>;
