import {oneArticleSnapshot} from './published-snapshot.mjs';

const siteOrigin = 'https://catalog.example.test';
const tags = [
    {id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', key: 'platform', slug: 'platform', pt: 'Plataforma', en: 'Platform'},
    {id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', key: 'quality', slug: 'quality', pt: 'Qualidade', en: 'Quality'},
];
const id = (number, suffix = '1') => `00000000-0000-4000-8000-${String(number).padStart(11, '0')}${suffix}`;
const iso = (number) => `2026-09-${String(24 - number).padStart(2, '0')}T12:00:00.000Z`;

export const catalogSnapshot = structuredClone(oneArticleSnapshot);
catalogSnapshot.revision = 'fixture-e06-catalog';
catalogSnapshot.siteOrigin = siteOrigin;
catalogSnapshot.generatedAt = '2026-09-24T12:00:00.000Z';
catalogSnapshot.articles = Array.from({length: 23}, (_, index) => {
    const number = index + 1;
    const article = structuredClone(oneArticleSnapshot.articles[0]);
    article.articleId = id(number, '1');
    article.translationId = id(number, '2');
    article.locale = 'pt-BR'; article.slug = `artigo-${number}`;
    article.title = `Artigo ${number}`; article.description = `Resumo publico ${number}.`;
    article.publishedAt = iso(number); article.updatedAt = iso(number);
    article.canonical = `${siteOrigin}/pt-BR/articles/${article.slug}`;
    article.difficulty = number % 3 === 0 ? 'advanced' : number % 2 === 0 ? 'intermediate' : 'foundational';
    article.readingMinutes = number;
    article.tags = [tags[number % 2]].map((tag) => ({id: tag.id, key: tag.key, slug: tag.slug, name: tag.pt}));
    article.bodyMarkdown = `# Artigo ${number}\n\nCorpo privado ${number}, que nao pode ir para o indice.`;
    article.seo = {title: article.title, description: article.description}; article.alternates = [];
    return article;
});
for (const source of catalogSnapshot.articles.slice(0, 2)) {
    const article = structuredClone(source);
    const number = source.slug.replace('artigo-', '');
    article.translationId = id(Number(number), '3'); article.locale = 'en'; article.slug = `article-${number}`;
    article.title = `Article ${number}`; article.description = `Public summary ${number}.`;
    article.canonical = `${siteOrigin}/en/articles/${article.slug}`;
    article.tags = article.tags.map((tag) => ({...tag, name: tags.find((item) => item.id === tag.id)?.en ?? tag.name}));
    catalogSnapshot.articles.push(article);
}
catalogSnapshot.tags = ['pt-BR', 'en'].flatMap((locale) => tags.map((tag) => ({
    id: tag.id, locale, key: tag.key, slug: tag.slug, name: locale === 'pt-BR' ? tag.pt : tag.en,
    articleCount: catalogSnapshot.articles.filter((article) => article.locale === locale && article.tags.some((articleTag) => articleTag.id === tag.id)).length,
    canonical: `${siteOrigin}/${locale}/tags/${tag.slug}`,
})));
const platformSeriesId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const qualitySeriesId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const articleBy = (locale, slug) => catalogSnapshot.articles.find((article) => article.locale === locale && article.slug === slug);
const ptOne = articleBy('pt-BR', 'artigo-1'); const ptTwo = articleBy('pt-BR', 'artigo-2'); const ptThree = articleBy('pt-BR', 'artigo-3');
const enOne = articleBy('en', 'article-1'); const enTwo = articleBy('en', 'article-2');
const reference = (id, slug, title, position) => ({id, slug, title, position});
ptOne.series = [reference(platformSeriesId, 'plataforma', 'Plataforma', 1), reference(qualitySeriesId, 'qualidade', 'Qualidade', 1)];
ptTwo.series = [reference(qualitySeriesId, 'qualidade', 'Qualidade', 2)];
ptThree.series = [reference(platformSeriesId, 'plataforma', 'Plataforma', 3)];
enOne.series = [reference(platformSeriesId, 'platform', 'Platform', 1), reference(qualitySeriesId, 'quality', 'Quality', 1)];
enTwo.series = [reference(qualitySeriesId, 'quality', 'Quality', 2)];
catalogSnapshot.series = [
    {id: platformSeriesId, locale: 'pt-BR', slug: 'plataforma', title: 'Plataforma', description: 'Trilha de plataforma.', articleCount: 2, canonical: `${siteOrigin}/pt-BR/series/plataforma`, difficulty: 'intermediate', hasTranslationGaps: true,
        members: [{position: 1, article: ptOne, nextArticleId: ptThree.articleId}, {position: 3, article: ptThree, previousArticleId: ptOne.articleId}]},
    {id: qualitySeriesId, locale: 'pt-BR', slug: 'qualidade', title: 'Qualidade', description: 'Trilha de qualidade.', articleCount: 2, canonical: `${siteOrigin}/pt-BR/series/qualidade`, difficulty: 'foundational', hasTranslationGaps: false,
        members: [{position: 1, article: ptOne, nextArticleId: ptTwo.articleId}, {position: 2, article: ptTwo, previousArticleId: ptOne.articleId}]},
    {id: platformSeriesId, locale: 'en', slug: 'platform', title: 'Platform', description: 'Platform track.', articleCount: 1, canonical: `${siteOrigin}/en/series/platform`, difficulty: 'intermediate', hasTranslationGaps: true,
        members: [{position: 1, article: enOne}]},
    {id: qualitySeriesId, locale: 'en', slug: 'quality', title: 'Quality', description: 'Quality track.', articleCount: 2, canonical: `${siteOrigin}/en/series/quality`, difficulty: 'foundational', hasTranslationGaps: false,
        members: [{position: 1, article: enOne, nextArticleId: enTwo.articleId}, {position: 2, article: enTwo, previousArticleId: enOne.articleId}]},
];
catalogSnapshot.redirects = [];
catalogSnapshot.urlCatalog = [
    ...catalogSnapshot.articles.map((article) => ({url: article.canonical, kind: 'article', locale: article.locale, lastmod: article.updatedAt, alternates: []})),
    ...catalogSnapshot.tags.map((tag) => ({url: tag.canonical, kind: 'tag', locale: tag.locale, lastmod: catalogSnapshot.generatedAt, alternates: []})),
    ...catalogSnapshot.series.map((series) => ({url: series.canonical, kind: 'series', locale: series.locale, lastmod: catalogSnapshot.generatedAt, alternates: []})),
];
