import {describe, expect, it} from 'vitest';
import {parseSearchQuery, searchPublishedArticles} from '../../src/features/search/search-catalog';
import {localCatalogIndex} from '../../src/content/article-projections';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

describe('published search catalog', () => {
    it('validates shared queries with a bounded length', () => {
        expect(parseSearchQuery(null)).toBe('');
        expect(parseSearchQuery('  query  ')).toBe('query');
        expect(parseSearchQuery('a'.repeat(201))).toHaveLength(200);
    });
    it('searches only the localized published summaries, including tags and series', () => {
        const pt = localCatalogIndex(catalogSnapshot, 'pt-BR');
        const en = localCatalogIndex(catalogSnapshot, 'en');
        expect(searchPublishedArticles(pt.articles, 'Artigo 1').map((article) => article.slug)).toEqual(['artigo-1', 'artigo-10', 'artigo-11', 'artigo-12', 'artigo-13', 'artigo-14', 'artigo-15', 'artigo-16', 'artigo-17', 'artigo-18', 'artigo-19']);
        expect(searchPublishedArticles(pt.articles, 'qualidade')).toHaveLength(13);
        expect(searchPublishedArticles(en.articles, 'Artigo')).toEqual([]);
        expect(searchPublishedArticles(en.articles, 'Article 1').map((article) => article.slug)).toEqual(['article-1']);
    });

    it('normalizes accents and distinguishes an empty query from no results', () => {
        const articles = localCatalogIndex(catalogSnapshot, 'pt-BR').articles;
        expect(searchPublishedArticles(articles, 'plataforma')).toHaveLength(13);
        expect(searchPublishedArticles(articles, 'Plataforma')).toHaveLength(13);
        expect(searchPublishedArticles(articles, '')).toEqual([]);
        expect(searchPublishedArticles(articles, 'inexistente')).toEqual([]);
    });
});
