import {oneArticleSnapshot} from './published-snapshot.mjs';

export const editorialSnapshot = structuredClone(oneArticleSnapshot);
editorialSnapshot.revision = 'fixture-e04-e05';
editorialSnapshot.siteOrigin = 'http://127.0.0.1';
const base = editorialSnapshot.articles[0];
const en = structuredClone(base);
en.locale = 'en';
en.translationId = '44444444-4444-4444-8444-444444444444';
en.slug = 'test-article';
en.title = 'Test article';
editorialSnapshot.articles.push(en);
for (const article of editorialSnapshot.articles) {
    article.canonical = `${editorialSnapshot.siteOrigin}/${article.locale}/articles/${article.slug}`;
    article.updatedAt = '2026-09-13T00:30:00.000Z';
    article.readingMinutes = 17;
    article.tags = [{id: '55555555-5555-4555-8555-555555555555', key: 'test', name: 'Test', slug: 'test'}];
    article.series = [{id: '66666666-6666-4666-8666-666666666666', slug: 'test-series', title: 'Test series', position: 1}];
    article.bodyMarkdown = `# ${article.title}\n\n[Jump](#repeat)\n\n## Repeat\n\nTexto público de teste que precisa sobreviver ao carregamento do JavaScript e ao funcionamento do menu e do tema.\n\n## Repeat\n\n# Real section\n\n### Inline *emphasis* and \`code\`\n\n\`\`\`js\n# Not a heading\n${'const example = 123456789; '.repeat(15)}\n\`\`\`\n\n| A | B |\n| - | - |\n| One | Two |\n\n- Parent\n  - Child\n\n![Fixture](/fixture.svg)\n\n[Safe](https://example.test) [Attack](javascript:alert%281%29)\n\n<script>window.hostile=true</script>\n`;
}
for (const article of editorialSnapshot.articles) article.alternates = editorialSnapshot.articles.map(item => ({locale: item.locale, slug: item.slug, url: item.canonical}));
editorialSnapshot.tags = editorialSnapshot.articles.map(article => ({...article.tags[0], locale: article.locale, articleCount: 1, canonical: `${editorialSnapshot.siteOrigin}/${article.locale}/tags/test`}));
editorialSnapshot.series = editorialSnapshot.articles.map(article => ({...article.series[0], locale: article.locale, articleCount: 1, canonical: `${editorialSnapshot.siteOrigin}/${article.locale}/series/test-series`, description: 'Synthetic series', hasTranslationGaps: false, members: [{position: 1, article}]}));
editorialSnapshot.urlCatalog = [
    ...editorialSnapshot.articles.map(article => ({url: article.canonical, kind: 'article', locale: article.locale, lastmod: article.updatedAt, alternates: article.alternates})),
    ...editorialSnapshot.tags.map(tag => ({url: tag.canonical, kind: 'tag', locale: tag.locale, lastmod: base.updatedAt, alternates: []})),
    ...editorialSnapshot.series.map(series => ({url: series.canonical, kind: 'series', locale: series.locale, lastmod: base.updatedAt, alternates: []})),
];
