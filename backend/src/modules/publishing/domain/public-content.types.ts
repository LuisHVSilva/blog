import type {Difficulty, Locale, TranslationSeo} from './article';

export type ArticleSummary = Readonly<{articleId: string; translationId: string; locale: Locale; slug: string; title: string;
    description: string; difficulty: Difficulty; publishedAt: string; updatedAt: string; readingMinutes: number; canonical: string;
    author: Readonly<{id: string; displayName: string; profileSlug: string; bio?: string; links?: readonly string[]}>;
    tags: readonly Readonly<{id: string; key: string; name: string; slug: string}>[];
    series: readonly Readonly<{id: string; slug: string; title: string; position: number}>[]}>;
export type ArticleDetail = Readonly<ArticleSummary & {bodyMarkdown: string; seo: TranslationSeo; alternates: readonly Readonly<{locale: Locale; slug: string; url: string}>[]}>;
export type ArticleLookup = Readonly<{kind: 'found'; article: ArticleDetail; lastModified?: string}> | Readonly<{kind: 'redirect'; locale: Locale; slug: string}>;
export type TagSummary = Readonly<{id: string; key: string; locale: Locale; name: string; slug: string; description?: string; articleCount: number; canonical: string}>;
export type SeriesSummary = Readonly<{id: string; locale: Locale; slug: string; title: string; description: string; difficulty?: Difficulty; articleCount: number; canonical: string}>;
export type SeriesDetail = Readonly<SeriesSummary & {hasTranslationGaps: boolean; members: readonly Readonly<{position: number; article: ArticleSummary; previousArticleId?: string; nextArticleId?: string}>[]}>;
export type PublicSnapshot = Readonly<{schemaVersion: 1; revision: string; generatedAt: string; siteOrigin: string; articles: readonly ArticleDetail[]; tags: readonly TagSummary[]; series: readonly SeriesDetail[]; redirects: readonly Readonly<{from: string; to: string; status: 308}>[]; urlCatalog: readonly Readonly<{url: string; kind: 'article' | 'tag' | 'series'; locale: Locale; lastmod: string; alternates: readonly Readonly<{locale: Locale; url: string}>[]}>[]}>;
export type ArticlePage = Readonly<{data: readonly ArticleSummary[]; pagination: Readonly<{page: number; limit: number; total: number; totalPages: number}>}>;

export type ArticleListInput = Readonly<{locale: Locale; page?: number; limit?: number; tag?: string; series?: string; difficulty?: Difficulty; q?: string; sort?: 'publishedAt:asc' | 'publishedAt:desc'}>;
export type ArticleListQuery = ArticleListInput & Readonly<{page: number; limit: number}>;
export type SlugQuery = Readonly<{locale: Locale; slug: string}>;
