import {readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

it('E08: publishes a named search dialog and keeps bodies out of its client data', () => {
    const build = buildFixture(catalogSnapshot);
    try {
        const html = readFileSync(path.join(build.dist, 'en', 'articles', 'index.html'), 'utf8');
        const index = readFileSync(path.join(build.dist, 'en', 'catalog-index.json'), 'utf8');
        expect(html).toContain('data-search-dialog'); expect(html).toContain('data-search-open');
        expect(html).toContain('aria-labelledby="published-search-title"'); expect(html).not.toContain('FICT');
        expect(index).toContain('fixture-e06-catalog'); expect(index).not.toContain('Corpo privado'); expect(index).not.toContain('bodyMarkdown');
    } finally { build.dispose(); }
}, 120_000);
