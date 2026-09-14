export type BrowserArticleSummary = {
    articleId: string;
    title: string;
    description: string;
    difficulty: 'foundational' | 'intermediate' | 'advanced';
    publishedAt: string;
    readingMinutes: number;
    canonical: string;
    tags: Array<{ id: string; name: string; slug: string }>;
    series: Array<{ title: string }>;
};
export type BrowserCatalogIndex = { revision: string; locale: string; articles: BrowserArticleSummary[] };

function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
}

export function isCatalogIndex(value: unknown): value is BrowserCatalogIndex {
    if (
        !record(value) ||
        typeof value.revision !== 'string' ||
        !['pt-BR', 'en'].includes(String(value.locale)) ||
        !Array.isArray(value.articles)
    ) {
        return false;
    }

    const locale = value.locale;

    return value.articles.every((article: unknown) => {
        if (
            !record(article) || article.locale !== locale ||
            typeof article.articleId !== 'string' ||
            typeof article.title !== 'string' ||
            typeof article.description !== 'string' ||
            typeof article.canonical !== 'string' ||
            typeof article.publishedAt !== 'string' ||
            !Number.isFinite(Date.parse(article.publishedAt)) ||
            typeof article.readingMinutes !== 'number' ||
            !Number.isSafeInteger(article.readingMinutes) ||
            article.readingMinutes <= 0 ||
            !['foundational', 'intermediate', 'advanced'].includes(String(article.difficulty))
        ) {
            return false;
        }

        try {
            const url = new URL(article.canonical);
            if (
                !['http:', 'https:'].includes(url.protocol)
                || url.username
                || url.password
                || url.search
                || url.hash
                || !new RegExp(`^/${locale}/articles/[a-z0-9]+(?:-[a-z0-9]+)*$`, 'u').test(url.pathname)
            ) {
                return false;
            }
        } catch {
            return false;
        }

        return Array.isArray(article.tags) && article.tags.every(
                (tag: unknown) =>
                    record(tag)
                    && typeof tag.id === 'string'
                    && typeof tag.name === 'string'
                    && typeof tag.slug === 'string'
                    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(tag.slug)
            )
            && Array.isArray(article.series)
            && article.series.every((series: unknown) => record(series) && typeof series.title === 'string');
    });
}
