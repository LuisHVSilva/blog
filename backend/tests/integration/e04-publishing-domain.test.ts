import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {GetArticleUseCase} from '../../src/modules/publishing/application/useCases/getArticle/getArticle.useCase';
test('E04-I01: public lookup preserves null and inner layers remain infrastructure-free', async () => {
    const useCase = new GetArticleUseCase({
        async getBySlug() { return null; }, async allPublished() { return []; },
        async list() { return {data: [], pagination: {page: 1, limit: 20, total: 0, totalPages: 0}}; },
        async listSeriesMembers() { return []; },
    });
    assert.equal(await useCase.execute({locale: 'en', slug: 'only-pt'}), null);
    for (const file of ['src/modules/publishing/domain/services/publication.service.ts', 'src/modules/publishing/domain/services/snapshot.service.ts']) {
        assert.doesNotMatch(readFileSync(file, 'utf8'), /sequelize|QueryTypes|infrastructures|node:fs/);
    }
});
