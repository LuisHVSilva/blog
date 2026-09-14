export type SearchableArticle = {
    title: string;
    description: string;
    canonical: string;
    tags: Array<{ name: string }>;
    series: Array<{ title: string }>
};

export function parseSearchQuery(value: string | null) {
    return (value ?? '').trim().slice(0, 200);
}

export function normalizeSearchText(value: string) {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
}

export function searchPublishedArticles(articles: readonly SearchableArticle[], query: string) {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery) {
        return [];
    }

    return articles
        .filter((article) =>
            normalizeSearchText([
                article.title,
                article.description,
                ...article.tags.map((tag) => tag.name),
                ...article.series.map((series) => series.title)
            ].join(' ')).includes(normalizedQuery)
        );
}
