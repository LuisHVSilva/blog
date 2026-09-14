import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {emptySnapshot, oneArticleSnapshot} from '../fixtures/published-snapshot.mjs';
import {buildFixture} from '../build-fixture.mjs';

describe('public snapshot boundary in isolated builds', () => {
    it('rejects an absent snapshot', () => {
        expect(() => buildFixture(undefined)).toThrow();
    }, 120_000);
    it('rejects malformed JSON', () => {
        expect(() => buildFixture('{invalid')).toThrow();
    }, 120_000);
    it('rejects an invalid contract', () => {
        expect(() => buildFixture({})).toThrow();
    }, 120_000);
    it('renders empty and one-article snapshots', () => {
        for (const snapshot of [emptySnapshot, oneArticleSnapshot]) {
            const build = buildFixture(snapshot);
            try {
                expect(readFileSync(path.join(build.dist, 'pt-BR/articles/index.html'), 'utf8')).toContain('Artigos publicados');
                if (snapshot.articles.length) expect(readFileSync(path.join(build.dist, 'pt-BR/articles/artigo-de-teste/index.html'), 'utf8')).toContain('Leitura sem JavaScript');
            } finally { build.dispose(); }
        }
    }, 180_000);
});
