import {readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

it('E06: builds static archive pages and revision-matched summary-only indexes', () => {
    const build = buildFixture(catalogSnapshot);
    try {
        const first = readFileSync(path.join(build.dist, 'pt-BR', 'articles', 'index.html'), 'utf8');
        const second = readFileSync(path.join(build.dist, 'pt-BR', 'articles', 'page', '2', 'index.html'), 'utf8');
        const index = readFileSync(path.join(build.dist, 'pt-BR', 'catalog-index.json'), 'utf8');
        expect(first).toContain('Artigo 1'); expect(first).toContain('Artigo 12'); expect(first).not.toContain('Artigo 13');
        expect(second).toContain('Artigo 13'); expect(second).toContain('Artigo 23'); expect(second).not.toContain('Artigo 1</a>');
        expect(first).toContain('data-index-url="/pt-BR/catalog-index.json"');
        expect(index).toContain('fixture-e06-catalog'); expect(index).toContain('Resumo publico 1.');
        expect(index).not.toContain('Corpo privado'); expect(index).not.toContain('bodyMarkdown');
        expect(readFileSync(path.join(build.dist, 'en', 'articles', 'index.html'), 'utf8')).toContain('Article 1');
    } finally { build.dispose(); }
}, 120_000);
