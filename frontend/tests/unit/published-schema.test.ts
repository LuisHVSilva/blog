import {describe, expect, it} from 'vitest';
import {snapshotSchema} from '../../src/content/published-schema';
import {emptySnapshot, oneArticleSnapshot} from '../fixtures/published-snapshot.mjs';

describe('snapshotSchema', () => {
    it('rejects ghost catalogue routes, duplicate identities, query canonicals and absent alternates', () => {
        const ghost = structuredClone(oneArticleSnapshot);
        ghost.articles = [];
        expect(snapshotSchema.safeParse(ghost).success).toBe(false);
        const duplicate = structuredClone(oneArticleSnapshot);
        duplicate.articles.push(duplicate.articles[0]);
        expect(snapshotSchema.safeParse(duplicate).success).toBe(false);
        const query = structuredClone(oneArticleSnapshot);
        query.urlCatalog[0].url += '?filter=x';
        expect(snapshotSchema.safeParse(query).success).toBe(false);
        const alternate = {...oneArticleSnapshot, articles: [{...oneArticleSnapshot.articles[0], alternates: [{locale: 'en', slug: 'missing', url: 'https://example.test/en/articles/missing'}]}]};
        expect(snapshotSchema.safeParse(alternate).success).toBe(false);
    });
    it('accepts deterministic empty and one-article public snapshots', () => {
        expect(snapshotSchema.parse(emptySnapshot).articles).toHaveLength(0);
        expect(snapshotSchema.parse(oneArticleSnapshot).articles).toHaveLength(1);
    });

    it('rejects malformed or internally inconsistent snapshots', () => {
        expect(() => snapshotSchema.parse({})).toThrow();
        const inconsistent = structuredClone(oneArticleSnapshot);
        inconsistent.articles[0].canonical = 'https://example.test/en/articles/artigo-de-teste';
        expect(() => snapshotSchema.parse(inconsistent)).toThrow('Article URL is absent or inconsistent.');
    });
});
