import type {Difficulty, Locale} from './publishing.types';
import type {TranslationSeo} from './entities/articleTranslation';
import type {HomeContent} from './home-content';

/** Localized, publicly visible article metadata used in collection responses. */
export type ArticleSummary = Readonly<{
    articleId: string;
    translationId: string;
    locale: Locale;
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    publishedAt: string;
    updatedAt: string;
    readingMinutes: number;
    canonical: string;
    author: Readonly<{id: string; displayName: string; profileSlug: string; bio?: string; links?: readonly string[]}>;
    tags: readonly Readonly<{id: string; key: string; name: string; slug: string}>[];
    series: readonly Readonly<{ id: string; slug: string; title: string; position: number }>[]
}

>;
/** Complete public article representation, including its Markdown body and alternate translations. */
export type ArticleDetail = Readonly<ArticleSummary & {
    bodyMarkdown: string;
    seo: TranslationSeo;
    alternates: readonly Readonly<{ locale: Locale; slug: string; url: string }>[]
}>;

/** Result of resolving a public article URL, including canonical redirects. */
export type ArticleLookup = Readonly<{
    kind: 'found'; article: ArticleDetail; lastModified?: string
}> | Readonly<{ kind: 'redirect'; locale: Locale; slug: string }>;

export type TagSummary = Readonly<{
    id: string;
    key: string;
    locale: Locale;
    name: string;
    slug: string;
    description?: string;
    articleCount: number;
    canonical: string
}>;

export type SeriesSummary = Readonly<{
    id: string;
    locale: Locale;
    slug: string;
    title: string;
    description: string;
    difficulty?: Difficulty;
    articleCount: number;
    canonical: string
}>;

export type SeriesDetail = Readonly<SeriesSummary & {
    hasTranslationGaps: boolean;
    members: readonly Readonly<{
        position: number;
        article: ArticleSummary;
        previousArticleId?: string;
        nextArticleId?: string
    }>[]
}>;
export type ProjectSummary = Readonly<{id: string; locale: Locale; slug: string; title: string; description: string; repositoryUrl?: string; demoUrl?: string; publishedAt: string; updatedAt: string; canonical: string}>;
export type ProjectDetail = Readonly<ProjectSummary & {technologies: readonly string[]}>;

/** Immutable export consumed by static publishing, backup, and release operations. */
export type PublicSnapshot = Readonly<{
    schemaVersion: 1;
    revision: string;
    generatedAt: string;
    siteOrigin: string;
    home?: readonly HomeContent[];
    articles: readonly ArticleDetail[];
    tags: readonly TagSummary[];
    series: readonly SeriesDetail[];
    projects: readonly ProjectDetail[];
    redirects: readonly Readonly<{ from: string; to: string; status: 308 }>[];
    urlCatalog: readonly Readonly<{
        url: string;
        kind: 'article' | 'tag' | 'series' | 'project';
        locale: Locale;
        lastmod: string;
        alternates: readonly Readonly<{ locale: Locale; url: string }>[]
    }>[]
}>;

export type ArticlePage = Readonly<{
    data: readonly ArticleSummary[];
    pagination: Readonly<{ page: number; limit: number; total: number; totalPages: number }>
}>;

/** Optional filters and pagination accepted by the public article listing use case. */
export type ArticleListInput = Readonly<{
    locale: Locale;
    page?: number;
    limit?: number;
    tag?: string;
    series?: string;
    difficulty?: Difficulty;
    q?: string;
    sort?: 'publishedAt:asc' | 'publishedAt:desc'
}>;

export type ArticleListQuery = ArticleListInput & Readonly<{page: number; limit: number}>;
export type SlugQuery = Readonly<{locale: Locale; slug: string}>;
