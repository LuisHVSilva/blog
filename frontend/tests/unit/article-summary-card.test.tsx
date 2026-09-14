import {renderToStaticMarkup} from 'react-dom/server';
import {expect, it} from 'vitest';
import {ArticleSummaryCard} from '../../src/features/articles/components/catalog/ArticleSummaryCard';
import {articleSummary} from '../../src/content/article-projections';
import {oneArticleSnapshot} from '../fixtures/published-snapshot.mjs';

it('uses one full-card article link while keeping tag links independently operable', () => {
    const article = articleSummary(oneArticleSnapshot.articles[0]);
    const html = renderToStaticMarkup(<ArticleSummaryCard article={article} locale="pt-BR"/>);
    expect(html).toContain(`class="archive-card__link" href="${article.canonical}"`);
    expect(html).toContain(`aria-label="Ler artigo: ${article.title}"`);
    expect(html).not.toContain(`<h2><a href="${article.canonical}"`);
});
