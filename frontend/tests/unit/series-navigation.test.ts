import {describe, expect, it} from 'vitest';
import {articleSeriesContexts, orderedSeriesMembers} from '../../src/features/series/series-navigation';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

describe('series navigation', () => {
    it('keeps each series context separate when an article belongs to two series', () => {
        const article = catalogSnapshot.articles.find((item) => item.locale === 'pt-BR' && item.slug === 'artigo-1');
        if (!article) throw new Error('Fixture article missing');
        const contexts = articleSeriesContexts(catalogSnapshot, article, 'pt-BR');
        expect(contexts).toHaveLength(2);
        expect(contexts.map((context) => context.next?.slug)).toEqual(['artigo-3', 'artigo-2']);
        expect(contexts.map((context) => context.member.position)).toEqual([1, 1]);
        expect(article.canonical).toBe('https://catalog.example.test/pt-BR/articles/artigo-1');
    });

    it('uses declared editorial positions, including a visible gap', () => {
        const series = catalogSnapshot.series.find((item) => item.locale === 'pt-BR' && item.slug === 'plataforma');
        if (!series) throw new Error('Fixture series missing');
        expect(orderedSeriesMembers({...series, members: [...series.members].reverse()}).map((member) => member.position)).toEqual([1, 3]);
        expect(series.hasTranslationGaps).toBe(true);
    });
});
