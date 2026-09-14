import type {PublishedSnapshot} from './published-schema';
import type {PublishedLocale} from '../routing/public-routes';

type PublishedArticle = PublishedSnapshot['articles'][number];

/** Deliberately excludes Markdown, SEO and language alternates from browser indexes. */
export type ArticleSummary = Pick<PublishedArticle,
    'articleId' | 'translationId' | 'locale' | 'slug' | 'title' | 'description' | 'difficulty' |
    'publishedAt' | 'updatedAt' | 'readingMinutes' | 'canonical' | 'author' | 'tags' | 'series'>;

export const archivePageSize = 12;

export type ArchiveState = { tagId?: string; page: number };

export type LocalCatalogIndex = {
    revision: string;
    locale: PublishedLocale;
    articles: ArticleSummary[];
};

export function articleSummary(article: PublishedArticle): ArticleSummary {
    return {
        articleId: article.articleId,
        translationId: article.translationId,
        locale: article.locale,
        slug: article.slug,
        title: article.title,
        description: article.description,
        difficulty: article.difficulty,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        readingMinutes: article.readingMinutes,
        canonical: article.canonical,
        author: article.author,
        tags: article.tags,
        series: article.series,
    };
}

export function localizedArticleSummaries(snapshot: PublishedSnapshot, locale: PublishedLocale): ArticleSummary[] {
    return snapshot.articles
        .filter((article) => article.locale === locale)
        .map(articleSummary)
        .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt) || left.articleId.localeCompare(right.articleId));
}

export function localCatalogIndex(snapshot: PublishedSnapshot, locale: PublishedLocale): LocalCatalogIndex {
    return {revision: snapshot.revision, locale, articles: localizedArticleSummaries(snapshot, locale)};
}

export function parseArchiveState(search: URLSearchParams): ArchiveState {
    const tagId = search.get('tag');
    const pageValue = search.get('page');
    const parsedPage = pageValue && /^[1-9]\d*$/u.test(pageValue) ? Number(pageValue) : 1;
    return {
        tagId: tagId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(tagId) ? tagId : undefined,
        page: Number.isSafeInteger(parsedPage) ? parsedPage : 1
    };
}

export function filterArticleSummaries(articles: readonly ArticleSummary[], state: ArchiveState): ArticleSummary[] {
    return state.tagId ? articles.filter((article) => article.tags.some((tag) => tag.id === state.tagId)) : [...articles];
}

export function paginateArticleSummaries(articles: readonly ArticleSummary[], page: number, pageSize = archivePageSize) {
    const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
    const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
    const currentPage = Math.min(safePage, totalPages);
    const offset = (currentPage - 1) * pageSize;
    return {items: articles.slice(offset, offset + pageSize), currentPage, totalPages, totalItems: articles.length};
}
