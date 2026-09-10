import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import test from 'node:test';
import {QueryTypes} from 'sequelize';
import request from 'supertest';
import {migration as editorial} from '../../migrations/002-editorial';
import {migration as paths} from '../../migrations/003-editorial-paths';
import {migration as grants} from '../../migrations/004-editorial-app-grants';
import {migration as invariants} from '../../migrations/005-publication-invariants';
import {migration as metadata} from '../../migrations/006-editorial-metadata';
import {migration as revisions} from '../../migrations/007-editorial-content-revisions';
import {PostgresPublicationStore} from '../../src/modules/publishing/adapters/postgres/publication-store';
import {PostgresArticleReader} from '../../src/modules/publishing/adapters/postgres/article-reader';
import {createArticleRouter} from '../../src/modules/publishing/adapters/http/articles.routes';
import {createApp} from '../../src/http/app';
import {HealthRoutes} from '../../src/http/health.routes';
import {captureLogger} from '../helpers/http';
import type {EditionInput} from '../../src/modules/publishing/application/content.dto';
import {appConfig, databaseFor, migratorConfig, testEnvironment} from '../support/database';

const env = testEnvironment();
const migrator = databaseFor(migratorConfig(env));
const appDb = databaseFor(appConfig(env));
const schema = 'p0_' + randomUUID().replaceAll('-', '');
const now = new Date('2026-09-09T12:00:00Z');
const store = new PostgresPublicationStore(appDb, () => now);
const reader = new PostgresArticleReader(appDb, 'https://example.test');
const api = createApp({
    config: {trustProxy: [], corsOrigins: []}, logger: captureLogger().logger,
    readiness: HealthRoutes.createReadiness(async () => true, () => false), routes: [createArticleRouter(reader)]
});
const articleId = randomUUID();
const translationId = randomUUID();
const item = {
    articleId,
    translationId,
    sourceLocale: 'pt-BR' as const,
    locale: 'pt-BR' as const,
    authorId: '',
    difficulty: 'foundational' as const,
    slug: 'original',
    title: 'Literal 100% title',
    description: 'A meaningful description',
    bodyMarkdown: '# Article\n\nMeaningful body.',
    seo: {title: 'Title', description: 'Description'}
};
const edition = (revision: string, expectedRevision: string, overrides: Partial<EditionInput> = {}): EditionInput => ({
    operator: {
        kind: 'operator',
        id: 'fixture',
        sourceRevision: revision
    }, expectedRevision, dryRun: false, articles: [item], ...overrides
});
const operation = (revision: string, expectedRevision: string) => ({
    articleId,
    locale: 'pt-BR',
    expectedRevision,
    operator: {kind: 'operator' as const, id: 'fixture', sourceRevision: revision, reason: 'Reviewed test operation'}
});

test.before(async () => {
    await migrator.authenticate();
    // Each suite owns its schema; it never drops another suite's ledger or editorial data.
    await migrator.query(`CREATE SCHEMA ${schema}; GRANT USAGE ON SCHEMA ${schema} TO blog_app`);
    migrator.addHook('afterConnect', async (connection: unknown) => {
        await (connection as { query(sql: string): Promise<unknown> }).query(`SET search_path TO ${schema}`);
    });
    appDb.addHook('afterConnect', async (connection: unknown) => {
        await (connection as { query(sql: string): Promise<unknown> }).query(`SET search_path TO ${schema}`);
    });
    await migrator.transaction(async (transaction) => {
        await migrator.query(`SET LOCAL search_path TO ${schema}`, {transaction});
        for (const migration of [editorial, paths, grants, invariants, metadata, revisions]) await migration.up(migrator, transaction);
    });
});
test.after(async () => {
    await appDb.close();
    await migrator.query(`DROP SCHEMA ${schema} CASCADE`);
    await migrator.close();
});

test('P0: atomic import, revision CAS, publication, alias, withdrawal, snapshot and public API', async () => {
    assert.equal((await store.applyEdition(edition('import-1', '', {dryRun: true}))).changed, true);
    assert.equal(await reader.getBySlug({locale: 'pt-BR', slug: 'original'}), null);
    await store.applyEdition(edition('import-1', ''));
    assert.equal((await store.applyEdition(edition('import-1', ''))).changed, false);
    await assert.rejects(store.applyEdition(edition('import-1', 'import-1', {
        articles: [{
            ...item,
            title: 'Different'
        }]
    })), /existing revision/);
    await assert.rejects(store.applyEdition(edition('import-stale', 'old')), /revision/);
    assert.equal((await request(api).get('/api/v1/articles/by-slug/pt-BR/original')).status, 404);
    await store.publish(operation('publish-1', 'import-1'));
    const first = await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    assert.equal(first.body.publishedAt, now.toISOString());
    assert.equal(first.body.author.displayName, 'Editorial maintainer');
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').set('If-None-Match', `W/${first.headers.etag}, "other"`).expect(304);
    for (const query of ['page=0', 'page=1e2', 'limit=51', 'page=1&page=2', 'locale=en-US', 'tag[]=x', 'q=']) {
        const response = await request(api).get(`/api/v1/articles?${query}`).expect(400);
        assert.equal(response.headers['cache-control'], 'no-store');
    }
    assert.equal((await request(api).get('/api/v1/articles?tag=missing').expect(200)).body.pagination.total, 0);
    assert.equal((await reader.list({locale: 'pt-BR', page: 1, limit: 20, q: '100%'})).pagination.total, 1);
    assert.equal((await reader.list({locale: 'en', page: 1, limit: 20})).pagination.total, 0);
    await store.applyEdition(edition('rename', 'publish-1', {articles: [{...item, slug: 'renamed'}]}));
    const alias = await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(308);
    assert.equal(alias.headers.location, '/api/v1/articles/by-slug/pt-BR/renamed');
    const snapshot = await reader.exportSnapshot();
    assert.equal(snapshot.revision, 'rename');
    assert.equal(snapshot.articles.length, 1);
    assert.equal(snapshot.redirects.length, 1);
    assert.equal(snapshot.urlCatalog[0]?.url, 'https://example.test/pt-BR/articles/renamed');
    await store.unpublish({...operation('withdraw', 'rename'), targetState: 'draft'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(404);
    assert.equal((await reader.exportSnapshot()).articles.length, 0);
    assert.equal((await store.unpublish({...operation('withdraw', 'rename'), targetState: 'draft'})).changed, false);
    await store.publish(operation('republish', 'withdraw'));
    const second = await request(api).get('/api/v1/articles/by-slug/pt-BR/renamed').expect(200);
    assert.equal(second.body.publishedAt, first.body.publishedAt);
    await store.applyEdition(edition('return-slug', 'republish'));
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    await store.archive({...operation('archive', 'return-slug'), reason: 'Archive reviewed fixture'});
    await assert.rejects(store.publish(operation('forbidden', 'archive')), /archived article/);
    assert.equal((await reader.exportSnapshot()).articles.length, 0);
    const revisions = await appDb.query<{
        revision: string
    }>('SELECT revision FROM publication_current_revision', {type: QueryTypes.SELECT});
    assert.equal(revisions[0]?.revision, 'archive');
    assert.equal((await store.applyEdition(edition('import-1', ''))).changed, false);
    await assert.rejects(appDb.query('DELETE FROM article_paths WHERE translation_id=:id', {replacements: {id: translationId}}), /matching current path/);
    const preview = await store.restore({...operation('restore', 'archive'), locale: undefined, reason: 'Restore reviewed fixture', dryRun: true});
    assert.equal(preview.revision, 'archive');
    assert.equal(preview.changes.length, 1);
    assert.equal((await reader.exportSnapshot()).articles.length, 0);
    await store.restore({...operation('restore', 'archive'), locale: undefined, reason: 'Restore reviewed fixture'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    await store.unpublish({...operation('archive-translation', 'restore'), targetState: 'archived'});
    await assert.rejects(store.publish(operation('no-restore', 'archive-translation')), /Restore/);
    await store.restore({...operation('restore-translation', 'archive-translation'), reason: 'Restore reviewed translation'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(404);
});
