const siteOrigin = 'https://example.test';
const articleId = '11111111-1111-4111-8111-111111111111';
const translationId = '22222222-2222-4222-8222-222222222222';
const authorId = '33333333-3333-4333-8333-333333333333';
const publishedAt = '2026-09-12T12:00:00.000Z';

const article = {
    articleId,
    translationId,
    locale: 'pt-BR',
    slug: 'artigo-de-teste',
    title: 'Artigo de teste',
    description: 'Descrição sintética para validar a fronteira pública.',
    difficulty: 'foundational',
    publishedAt,
    updatedAt: publishedAt,
    readingMinutes: 1,
    canonical: `${siteOrigin}/pt-BR/articles/artigo-de-teste`,
    author: {id: authorId, displayName: 'Autora de teste', profileSlug: 'autora-de-teste'},
    tags: [],
    series: [],
    bodyMarkdown: '# Leitura sem JavaScript\n\nConteúdo de fixture.',
    seo: {title: 'Artigo de teste', description: 'Descrição sintética para validar a fronteira pública.'},
    alternates: [],
};

export const oneArticleSnapshot = {
    schemaVersion: 1,
    revision: 'fixture-one-article',
    generatedAt: publishedAt,
    siteOrigin,
    articles: [article],
    tags: [],
    series: [],
    redirects: [],
    urlCatalog: [{url: article.canonical, kind: 'article', locale: article.locale, lastmod: publishedAt, alternates: []}],
};

export const emptySnapshot = {...oneArticleSnapshot, revision: 'fixture-empty', articles: [], urlCatalog: []};
