import {readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

it('E07: pre-renders localized tag and series routes with sequence and gaps', () => {
    const build = buildFixture(catalogSnapshot);
    try {
        const tags = readFileSync(path.join(build.dist, 'pt-BR', 'tags', 'index.html'), 'utf8');
        const tag = readFileSync(path.join(build.dist, 'pt-BR', 'tags', 'platform', 'index.html'), 'utf8');
        const series = readFileSync(path.join(build.dist, 'pt-BR', 'series', 'plataforma', 'index.html'), 'utf8');
        const englishSeries = readFileSync(path.join(build.dist, 'en', 'series', 'platform', 'index.html'), 'utf8');
        const article = readFileSync(path.join(build.dist, 'pt-BR', 'articles', 'artigo-1', 'index.html'), 'utf8');
        expect(tags).toContain('Plataforma'); expect(tags).toContain('Qualidade');
        expect(tag).toContain('Artigo 2'); expect(tag).not.toContain('Article 2');
        expect(series).toContain('Etapa 1'); expect(series).toContain('Etapa 3'); expect(series).toContain('sem traducao');
        expect(englishSeries).toContain('not yet translated'); expect(englishSeries).not.toContain('Artigo 3');
        expect(article).toContain('Plataforma'); expect(article).toContain('Qualidade');
        expect(article).toContain('Proximo: Artigo 3'); expect(article).toContain('Proximo: Artigo 2');
        expect(article).toContain('href="https://catalog.example.test/pt-BR/articles/artigo-1"');
    } finally { build.dispose(); }
}, 120_000);
