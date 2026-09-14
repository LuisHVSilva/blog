import {describe, expect, it} from 'vitest';
import {filterArticleSummaries, localizedArticleSummaries, paginateArticleSummaries, parseArchiveState} from '../../src/content/article-projections';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

describe('article catalog projections', () => {
    it('keeps Markdown outside the localized catalog and paginates 23 summaries without repetition', () => {
        const articles = localizedArticleSummaries(catalogSnapshot, 'pt-BR');
        const first = paginateArticleSummaries(articles, 1);
        const second = paginateArticleSummaries(articles, 2);
        expect(articles).toHaveLength(23); expect(first.items).toHaveLength(12); expect(second.items).toHaveLength(11);
        expect(new Set([...first.items, ...second.items].map((article) => article.articleId))).toHaveLength(23);
        expect(JSON.stringify(articles)).not.toContain('Corpo privado');
    });

    it('validates URL state and filters by language-independent tag ID', () => {
        const articles = localizedArticleSummaries(catalogSnapshot, 'pt-BR');
        const state = parseArchiveState(new URLSearchParams('tag=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb&page=2'));
        expect(state).toEqual({tagId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', page: 2});
        expect(filterArticleSummaries(articles, state)).toHaveLength(12);
        expect(parseArchiveState(new URLSearchParams('tag=bad&page=-2'))).toEqual({tagId: undefined, page: 1});
        expect(filterArticleSummaries(articles, {tagId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', page: 1})).toEqual([]);
    });
});
