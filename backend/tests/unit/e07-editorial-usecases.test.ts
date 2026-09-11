import assert from 'node:assert/strict';
import test from 'node:test';
import {ImportContentUseCase} from '../../src/modules/publishing/application/useCases/importContent/importContent.useCase';
import {PublishArticleUseCase} from '../../src/modules/publishing/application/useCases/publishArticle/publishArticle.useCase';
import {UnpublishArticleUseCase} from '../../src/modules/publishing/application/useCases/unpublishArticle/unpublishArticle.useCase';
import {ArchiveArticleUseCase} from '../../src/modules/publishing/application/useCases/archiveArticle/archiveArticle.useCase';
import {RestoreArticleUseCase} from '../../src/modules/publishing/application/useCases/restoreArticle/restoreArticle.useCase';
import {ExportSnapshotUseCase} from '../../src/modules/publishing/application/useCases/exportSnapshot/exportSnapshot.useCase';
import {ValidateContentUseCase} from '../../src/modules/publishing/application/useCases/validateContent/validateContent.useCase';
import type {IPublicationService} from '../../src/modules/publishing/domain/services/publication.service.interface';
import type {EditionInput, ImportResult, VisibilityInput, UnpublishInput, ArchiveInput, RestoreInput} from '../../src/modules/publishing/domain/editorial.types';
import {ContentValidationService} from '../../src/modules/publishing/domain/services/contentValidation.service';
import {ArticlePathService} from '../../src/modules/publishing/domain/services/articlePath.service';
import {ArticlePath} from '../../src/modules/publishing/domain/entities/articlePath';
import {AuthorProfile} from '../../src/modules/publishing/domain/entities/authorProfile';
import {PublicationEdition} from '../../src/modules/publishing/domain/entities/publicationEdition';
import {AuthorProfileService} from '../../src/modules/publishing/domain/services/authorProfile.service';
import {SnapshotService} from '../../src/modules/publishing/domain/services/snapshot.service';

class PublicationServiceFake implements IPublicationService {
    readonly calls: unknown[] = [];
    readonly result: ImportResult = {revision: 'edition', changed: true, changes: []};
    async applyEdition(input: EditionInput) { this.calls.push(input); return this.result; }
    async publish(input: VisibilityInput) { this.calls.push(input); return this.result; }
    async unpublish(input: UnpublishInput) { this.calls.push(input); return this.result; }
    async archive(input: ArchiveInput) { this.calls.push(input); return this.result; }
    async restore(input: RestoreInput) { this.calls.push(input); return this.result; }
}

test('Editorial use cases inject only service contracts and forward payload/result unchanged', async () => {
    const service = new PublicationServiceFake();
    const actor = {kind: 'operator' as const, id: 'operator', sourceRevision: 'edition', reason: 'reviewed'};
    const edition = {expectedRevision: '', dryRun: true, operator: actor, articles: []};
    const operation = {articleId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', locale: 'pt-BR', expectedRevision: 'before', operator: actor};
    const unpublish = {...operation, targetState: 'draft' as const};
    const archive = {...operation, reason: 'reviewed'};
    assert.equal(await new ImportContentUseCase(service).execute(edition), service.result);
    assert.equal(await new PublishArticleUseCase(service).execute(operation), service.result);
    assert.equal(await new UnpublishArticleUseCase(service).execute(unpublish), service.result);
    assert.equal(await new ArchiveArticleUseCase(service).execute(archive), service.result);
    assert.equal(await new RestoreArticleUseCase(service).execute(archive), service.result);
    [edition, operation, unpublish, archive, archive].forEach((payload, index) => assert.equal(service.calls[index], payload));
    const failure = new Error('Snapshot unavailable');
    await assert.rejects(new ExportSnapshotUseCase({async export() { throw failure; }}).execute(), (error: unknown) => error === failure);
    const validation = await new ValidateContentUseCase(new ContentValidationService()).execute([{
        file: 'invalid', articleId: 'invalid', translationId: 'invalid', sourceLocale: 'pt-BR', locale: 'pt-BR',
        slug: '../invalid', title: '', description: '', body: '', difficulty: 'invalid',
    }]);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length >= 4);
});

test('Author service rejects duplicate slugs before writing and preserves creation audit', async () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const author = new AuthorProfile({id: 'author', displayName: 'Original', profileSlug: 'author', bio: '', links: [], createdAt});
    const saved: AuthorProfile[] = [];
    const service = new AuthorProfileService({
        async find() { return [author]; },
        async save(entity) { saved.push(entity); },
        async remove() { assert.fail('Unexpected deletion'); },
    });
    await assert.rejects(service.write([{id: 'other', displayName: 'Other', profileSlug: 'author', bio: '', links: []}], new Date()), /reserved/);
    assert.equal(saved.length, 0);
    await service.write([{id: 'author', displayName: 'Updated', profileSlug: 'author', bio: '', links: []}], new Date());
    assert.equal(saved[0]?.createdAt.getTime(), createdAt.getTime());
    createdAt.setFullYear(2000);
    assert.equal(author.createdAt.getUTCFullYear(), 2026);
    const copy = author.createdAt;
    copy.setFullYear(2001);
    assert.equal(author.createdAt.getUTCFullYear(), 2026);
    const report = {changes: [{subject: 'original'}]};
    const edition = new PublicationEdition({revision: 'rev', contentHash: 'hash', gitCommit: 'commit', actorId: 'operator', appliedAt: new Date(), report});
    report.changes[0]!.subject = 'mutated';
    assert.deepEqual(edition.toData().report, {changes: [{subject: 'original'}]});
});

test('Path service rechecks ownership after persistence to reject a competing claim', async () => {
    let competingOwner = false;
    const service = new ArticlePathService({
        async find() { return competingOwner ? [new ArticlePath({locale: 'pt-BR', slug: 'reserved', translationId: 'other', kind: 'current'})] : []; },
        async save() { competingOwner = true; },
        async remove() { assert.fail('Unexpected deletion'); },
    });
    await assert.rejects(service.assign('pt-BR', 'reserved', 'mine'), /reserved/);
});

test('Snapshot service keeps every read within the injected consistent scope and cleans up on failure', async () => {
    let active = false;
    let fail = false;
    const events: string[] = [];
    const snapshot = new SnapshotService({
        async execute<T>(work: () => Promise<T>): Promise<T> {
            active = true; events.push('begin');
            try { return await work(); } finally { active = false; events.push('end'); }
        },
    }, {
        async allPublished() { assert.ok(active); events.push('articles'); if (fail) throw new Error('Read failure'); return []; },
        async list() { assert.fail('Unexpected pagination'); },
        async getBySlug() { assert.fail('Unexpected lookup'); },
        async listSeriesMembers() { assert.fail('Unexpected members'); },
    }, {
        async list() { assert.ok(active); return []; },
    }, {
        async list() { assert.ok(active); return []; },
        async getBySlug() { assert.fail('Unexpected series detail'); },
    }, {
        async current() { assert.ok(active); events.push('revision'); return {singleton: true, revision: 'rev', updatedAt: new Date('2026-09-10T00:00:00Z')}; },
        async find() { assert.fail('Unexpected edition lookup'); },
        async record() { assert.fail('Snapshots cannot write'); },
    }, {
        async redirects() { assert.ok(active); return []; },
        async assertAvailable() { assert.fail('Snapshots cannot claim slugs'); },
        async assign() { assert.fail('Snapshots cannot write'); },
    }, {now() { return new Date('2026-09-11T00:00:00Z'); }}, 'https://example.test');
    const result = await new ExportSnapshotUseCase(snapshot).execute();
    assert.equal(result.revision, 'rev');
    assert.equal(result.generatedAt, '2026-09-11T00:00:00.000Z');
    assert.deepEqual(events, ['begin', 'revision', 'articles', 'end']);
    assert.equal(active, false);
    fail = true;
    await assert.rejects(snapshot.export(), /Read failure/);
    assert.equal(active, false);
});
