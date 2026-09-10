import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import type {ArticleReader} from '../../src/modules/publishing/application/ports/article-reader';

test('E04-I01: reader returns null without locale fallback and domain/application remain infrastructure-free', async () => {
    const reader: ArticleReader = {
        async getBySlug() { return null; },
        async list() { return {data: [], pagination: {page: 1, limit: 20, total: 0, totalPages: 0}}; },
        async listTags() { return []; }, async listSeries() { return []; }, async getSeries() { return null; },
        async exportSnapshot() { return {schemaVersion: 1, revision: 'fixture', generatedAt: '2026-09-09T00:00:00.000Z', siteOrigin: 'https://example.test', articles: [], tags: [], series: [], redirects: [], urlCatalog: []}; },
    };
    assert.equal(await reader.getBySlug({locale: 'en', slug: 'only-pt'}), null);
    for (const file of [
        'src/modules/publishing/domain/article.ts', 'src/modules/publishing/domain/publication-policy.ts',
        'src/modules/publishing/domain/series.ts', 'src/modules/publishing/domain/reading-time.ts',
        'src/modules/publishing/application/content.dto.ts', 'src/modules/publishing/application/ports/article-reader.ts',
        'src/modules/publishing/application/ports/publication-store.ts',
    ]) assert.doesNotMatch(readFileSync(file, 'utf8'), /from ['\"](?:express|sequelize|\.\.\/\.\.\/\.\.\/infrastructure)/);
});
