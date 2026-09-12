import {createReadiness} from '../../src/infrastructures/readiness';
import {PublishingQueriesComposition} from '../../src/infrastructures/di/publishingQueries.composition';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import test from 'node:test';
import {QueryTypes} from 'sequelize';
import {editorialModels} from '../../src/infrastructures/persistence/ORM/modelRegistry';
import {ArticleModel} from '../../src/infrastructures/persistence/ORM/models/article.model';
import {AuthorProfileModel} from '../../src/infrastructures/persistence/ORM/models/authorProfile.model';
import {ArticlePathModel} from '../../src/infrastructures/persistence/ORM/models/articlePath.model';
import {ArticlePersistence} from '../../src/infrastructures/persistence/adapters/article.persistence';
import {ArticleTranslationPersistence} from '../../src/infrastructures/persistence/adapters/articleTranslation.persistence';
import {PersistenceContext} from '../../src/infrastructures/persistence/ORM/context/persistenceContext';
import {UnitOfWork} from '../../src/infrastructures/persistence/ORM/unitOfWork/unitOfWork';
import {ReadSnapshotUnitOfWork} from '../../src/infrastructures/persistence/ORM/unitOfWork/readSnapshotUnitOfWork';
import {PublicationRevisionPersistence} from '../../src/infrastructures/persistence/adapters/publicationRevision.persistence';
import {Article} from '../../src/modules/publishing/domain/article';
import {ArticleTranslation} from '../../src/modules/publishing/domain/entities/articleTranslation';
import {type Difficulty, type Locale} from '../../src/modules/publishing/domain/publishing.types';
import {parseContentRoot} from '../../src/modules/publishing/adapters/cli/content-parser';
import {ContentValidationService} from '../../src/modules/publishing/domain/services/contentValidation.service';
import request from 'supertest';
import {migration as editorial} from '../../migrations/002-editorial';
import {migration as paths} from '../../migrations/003-editorial-paths';
import {migration as grants} from '../../migrations/004-editorial-app-grants';
import {migration as invariants} from '../../migrations/005-publication-invariants';
import {migration as metadata} from '../../migrations/006-editorial-metadata';
import {migration as revisions} from '../../migrations/007-editorial-content-revisions';
import {EditorialComposition} from '../../src/infrastructures/di/editorial.composition';
import {PublishingHttpContainer} from '../../src/infrastructures/di/publishingHttp.container';
import {buildArticlesRouter} from '../../src/modules/publishing/adapters/http/routes/articles.router';
import {createApp} from '../../src/http/app';
import {captureLogger} from '../helpers/logging';
import type {EditionInput} from '../../src/modules/publishing/application/content.dto';
import {appConfig, databaseFor, migratorConfig, testEnvironment} from '../support/database';

const env = testEnvironment();
const migrator = databaseFor(migratorConfig(env));
const appDb = databaseFor(appConfig(env));
const schema = 'p0_' + randomUUID().replaceAll('-', '');
const now = new Date('2026-09-09T12:00:00Z');
const store = EditorialComposition.create(appDb, 'https://example.test', {now: () => now});
const queries = PublishingQueriesComposition.create(appDb, 'https://example.test');
const api = createApp({
    config: {trustProxy: [], corsOrigins: []}, logger: captureLogger().logger,
    readiness: createReadiness(async () => true, () => false),
    routes: [buildArticlesRouter(new PublishingHttpContainer(PublishingQueriesComposition.create(appDb, 'https://example.test')))]
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
    assert.equal((await store.importContent.execute(edition('import-1', '', {dryRun: true}))).changed, true);
    assert.equal(await queries.getArticle.execute({locale: 'pt-BR', slug: 'original'}), null);
    await store.importContent.execute(edition('import-1', ''));
    assert.equal((await store.importContent.execute(edition('import-1', ''))).changed, false);
    await assert.rejects(store.importContent.execute(edition('import-1', 'import-1', {
        articles: [{
            ...item,
            title: 'Different'
        }]
    })), /existing revision/);
    await assert.rejects(store.importContent.execute(edition('import-stale', 'old')), /revision/);
    assert.equal((await request(api).get('/api/v1/articles/by-slug/pt-BR/original')).status, 404);
    await store.publishArticle.execute(operation('publish-1', 'import-1'));
    const first = await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    assert.equal(first.body.publishedAt, now.toISOString());
    assert.equal(first.body.author.displayName, 'Editorial maintainer');
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').set('If-None-Match', `W/${first.headers.etag}, "other"`).expect(304);
    for (const query of ['page=0', 'page=1e2', 'limit=51', 'page=1&page=2', 'locale=en-US', 'tag[]=x', 'q=']) {
        const response = await request(api).get(`/api/v1/articles?${query}`).expect(400);
        assert.equal(response.headers['cache-control'], 'no-store');
    }
    assert.equal((await request(api).get('/api/v1/articles?tag=missing').expect(200)).body.pagination.total, 0);
    assert.equal((await queries.listArticles.execute({locale: 'pt-BR', page: 1, limit: 20, q: '100%'})).pagination.total, 1);
    assert.equal((await queries.listArticles.execute({locale: 'en', page: 1, limit: 20})).pagination.total, 0);
    await store.importContent.execute(edition('rename', 'publish-1', {articles: [{...item, slug: 'renamed'}]}));
    const alias = await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(308);
    assert.equal(alias.headers.location, '/api/v1/articles/by-slug/pt-BR/renamed');
    const snapshot = await store.exportSnapshot.execute();
    assert.equal(snapshot.revision, 'rename');
    assert.equal(snapshot.articles.length, 1);
    assert.equal(snapshot.redirects.length, 1);
    assert.equal(snapshot.urlCatalog[0]?.url, 'https://example.test/pt-BR/articles/renamed');
    await store.unpublishArticle.execute({...operation('withdraw', 'rename'), targetState: 'draft'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(404);
    assert.equal((await store.exportSnapshot.execute()).articles.length, 0);
    assert.equal((await store.unpublishArticle.execute({...operation('withdraw', 'rename'), targetState: 'draft'})).changed, false);
    await store.publishArticle.execute(operation('republish', 'withdraw'));
    const second = await request(api).get('/api/v1/articles/by-slug/pt-BR/renamed').expect(200);
    assert.equal(second.body.publishedAt, first.body.publishedAt);
    await store.importContent.execute(edition('return-slug', 'republish'));
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    await store.archiveArticle.execute({...operation('archive', 'return-slug'), reason: 'Archive reviewed fixture'});
    await assert.rejects(store.publishArticle.execute(operation('forbidden', 'archive')), /archived article/);
    assert.equal((await store.exportSnapshot.execute()).articles.length, 0);
    const revisions = await appDb.query<{
        revision: string
    }>('SELECT revision FROM publication_current_revision', {type: QueryTypes.SELECT});
    assert.equal(revisions[0]?.revision, 'archive');
    assert.equal((await store.importContent.execute(edition('import-1', ''))).changed, false);
    await assert.rejects(appDb.query('DELETE FROM article_paths WHERE translation_id=:id', {replacements: {id: translationId}}), /matching current path/);
    const preview = await store.restoreArticle.execute({...operation('restore', 'archive'), locale: undefined, reason: 'Restore reviewed fixture', dryRun: true});
    assert.equal(preview.revision, 'archive');
    assert.equal(preview.changes.length, 1);
    assert.equal((await store.exportSnapshot.execute()).articles.length, 0);
    await store.restoreArticle.execute({...operation('restore', 'archive'), locale: undefined, reason: 'Restore reviewed fixture'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(200);
    await store.unpublishArticle.execute({...operation('archive-translation', 'restore'), targetState: 'archived'});
    await assert.rejects(store.publishArticle.execute(operation('no-restore', 'archive-translation')), /Restore/);
    await store.restoreArticle.execute({...operation('restore-translation', 'archive-translation'), reason: 'Restore reviewed translation'});
    await request(api).get('/api/v1/articles/by-slug/pt-BR/original').expect(404);
});

test('ORM: every registered model matches the migration columns, nullability and primary key', async () => {
    for (const modelClass of editorialModels) {
        const model = appDb.getRepository(modelClass);
        const columns = await appDb.query<{column_name: string; is_nullable: string; data_type: string}>(
            'SELECT column_name,is_nullable,data_type FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=:table',
            {replacements: {table: model.tableName}, type: QueryTypes.SELECT});
        assert.ok(columns.length, model.tableName);
        const attributes = Object.values(model.getAttributes());
        assert.deepEqual(attributes.map((attribute) => attribute.field).sort(), columns.map((column) => column.column_name).sort(), model.tableName);
        for (const column of columns) {
            assert.equal(attributes.find((attribute) => attribute.field === column.column_name)!.allowNull, column.is_nullable === 'YES', `${model.tableName}.${column.column_name}`);
            assert.equal(String(attributes.find((attribute) => attribute.field === column.column_name)!.type).toLowerCase(), column.data_type, `${model.tableName}.${column.column_name} type`);
        }
        const keys = await appDb.query<{column_name: string}>(`SELECT a.attname column_name FROM pg_index i JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=ANY(i.indkey)
            WHERE i.indrelid=to_regclass(:table) AND i.indisprimary`, {replacements: {table: model.tableName}, type: QueryTypes.SELECT});
        assert.deepEqual(attributes.filter((attribute) => attribute.primaryKey).map((attribute) => attribute.field).sort(), keys.map((key) => key.column_name).sort(), model.tableName);
    }
});

test('ORM: repositories round-trip entities, share nested transactions and roll back atomically', async () => {
    const context = new PersistenceContext();
    const unit = new UnitOfWork(appDb, context);
    const articles = new ArticlePersistence(appDb, context);
    const translations = new ArticleTranslationPersistence(appDb, context);
    const id = randomUUID(), tid = randomUUID(), aid = randomUUID();
    const article = new Article({id, authorId: aid, sourceLocale: 'pt-BR', difficulty: 'foundational', createdAt: now, archivedAt: null});
    const translation = new ArticleTranslation({id: tid, articleId: id, locale: 'pt-BR', slug: 'orm-fixture', title: 'ORM fixture', description: 'Fixture description',
        bodyMarkdown: '# Fixture', status: 'draft', publishedAt: null, updatedAt: now, sourceRevision: 'fixture', translatedFromRevision: null,
        readingMinutes: 1, seo: {title: 'Fixture', description: 'Fixture description'}});
    await unit.execute(async () => {
        const transaction = context.requireTransaction();
        await appDb.getRepository(AuthorProfileModel).create({id: aid, displayName: 'Fixture author', profileSlug: 'orm-fixture-author', bio: null, links: [], createdAt: now}, {transaction});
        await articles.save(article);
        await unit.execute(async () => {
            assert.equal(context.requireTransaction(), transaction);
            await translations.save(translation);
        });
        await appDb.getRepository(ArticlePathModel).create({locale: 'pt-BR', slug: translation.slug, translationId: tid, kind: 'current'}, {transaction});
    });
    assert.deepEqual((await articles.findById(id))!.getProps(), article.getProps());
    assert.deepEqual((await translations.findById(tid))!.getProps(), translation.getProps());
    await assert.rejects(unit.execute(async () => {
        await articles.save(article.archive(now));
        await translations.save(translation.publish(article, now));
        throw new Error('Deliberate rollback');
    }), /Deliberate rollback/);
    assert.equal((await articles.findById(id))!.archivedAt, null);
    assert.equal((await translations.findById(tid))!.status, 'draft');
    assert.equal(context.getTransaction(), undefined);
    await assert.rejects(unit.execute(async () => {
        await articles.save(article.archive(now));
        try {
            await unit.execute(async () => { throw new Error('Caught nested failure'); });
        } catch { /* Catching the error must not permit a partial commit. */ }
    }), /marked for rollback/);
    assert.equal((await articles.findById(id))!.archivedAt, null);
    const joined = await appDb.getRepository(ArticleModel).findByPk(id, {include: [{model: appDb.getRepository(AuthorProfileModel), as: 'author'}]});
    assert.equal(joined?.author?.displayName, 'Fixture author');
});

test('ORM: real editorial catalogue persists authors, localized taxonomy and relations through models', async () => {
    const parsed = await parseContentRoot('../content');
    const validation = new ContentValidationService().validate(parsed);
    assert.equal(validation.valid, true);
    const articles = parsed.map((value, index) => ({articleId: value.articleId, translationId: value.translationId,
        sourceLocale: value.sourceLocale as Locale, locale: value.locale as Locale,
        authorId: parsed.catalog.articles.find((article) => article.id === value.articleId)!.authorId,
        difficulty: value.difficulty as Difficulty, slug: value.slug, title: value.title, description: value.description,
        bodyMarkdown: value.body, seo: value.seo ?? {title: value.title, description: value.description},
        status: 'published' as const, readingMinutes: validation.edition[index]!.readingMinutes,
        sourceRevision: value.sourceRevision, translatedFromRevision: value.translatedFromRevision}));
    const persistence = EditorialComposition.create(appDb, 'https://example.test');
    await persistence.importContent.execute({expectedRevision: 'restore-translation', operator: {kind: 'operator', id: 'orm-catalog-test', sourceRevision: 'orm-catalog-1'},
        dryRun: false, articles, catalog: parsed.catalog});
    const snapshot = await store.exportSnapshot.execute();
    assert.equal(snapshot.articles.length, 8);
    assert.equal(snapshot.tags.length, 6);
    assert.equal(snapshot.series.length, 4);
    assert.ok(snapshot.series.every((series) => series.members.length > 0));
    // Exercise the new controller -> use case -> service -> repository graph against PostgreSQL.
    for (const locale of ['pt-BR', 'en'] as const) {
        const page = await request(api).get('/api/v1/articles').query({locale, limit: 2}).expect(200);
        assert.equal(page.body.pagination.total, snapshot.articles.filter((article) => article.locale === locale).length);
        assert.equal(page.body.data.length, 2);
        const tags = await request(api).get('/api/v1/tags').query({locale}).expect(200);
        assert.deepEqual(tags.body, snapshot.tags.filter((tag) => tag.locale === locale));
        const series = await request(api).get('/api/v1/series').query({locale}).expect(200);
        assert.deepEqual(series.body, snapshot.series.filter((item) => item.locale === locale).map(({hasTranslationGaps: _gaps, members: _members, ...summary}) => summary));
    }
    for (const series of snapshot.series) {
        const detail = await request(api).get('/api/v1/series/by-slug/' + series.locale + '/' + series.slug).expect(200);
        assert.deepEqual(detail.body, series);
    }
    for (const article of snapshot.articles) {
        const detail = await request(api).get('/api/v1/articles/by-slug/' + article.locale + '/' + article.slug).expect(200);
        assert.deepEqual(detail.body, article);
    }
    const author = await appDb.getRepository(AuthorProfileModel).findByPk(parsed.catalog.authors[0]!.id);
    assert.equal(author?.displayName, parsed.catalog.authors[0]!.displayName);
    const createdAt = author!.createdAt.getTime();
    const catalogue = {...parsed.catalog, authors: parsed.catalog.authors.map((value) => ({...value, bio: 'Updated through mapper'}))};
    await persistence.importContent.execute({expectedRevision: 'orm-catalog-1', operator: {kind: 'operator', id: 'orm-catalog-test', sourceRevision: 'orm-catalog-2'},
        dryRun: false, articles, catalog: catalogue});
    const updated = await appDb.getRepository(AuthorProfileModel).findByPk(parsed.catalog.authors[0]!.id);
    assert.equal(updated?.createdAt.getTime(), createdAt);
    assert.equal(updated?.bio, 'Updated through mapper');
    assert.equal((await store.exportSnapshot.execute()).articles[0]?.author.bio, 'Updated through mapper');
});

test('Editorial use cases roll back partial model changes and serialize competing revisions', async () => {
    const commands = EditorialComposition.create(appDb, 'https://example.test');
    const snapshot = await commands.exportSnapshot.execute();
    const target = snapshot.articles[0]!;
    const context = new PersistenceContext();
    const articles = new ArticlePersistence(appDb, context);
    const before = (await articles.findById(target.articleId))!.getProps();
    await assert.rejects(commands.importContent.execute({
        expectedRevision: snapshot.revision, dryRun: false,
        operator: {kind: 'operator', id: 'rollback-test', sourceRevision: 'must-not-commit'},
        articles: [{articleId: target.articleId, translationId: target.translationId, sourceLocale: target.locale,
            locale: target.locale, authorId: target.author.id, difficulty: target.difficulty === 'advanced' ? 'foundational' : 'advanced',
            slug: target.slug, title: target.title, description: target.description, bodyMarkdown: target.bodyMarkdown, seo: target.seo,
            status: 'draft'}],
    }), /explicit operation/);
    assert.deepEqual((await articles.findById(target.articleId))!.getProps(), before);
    assert.equal((await commands.getRevision.execute()).revision, snapshot.revision);
    const ledger = await appDb.query<{count: string}>("SELECT count(*)::text count FROM publication_editions WHERE revision='must-not-commit'", {type: QueryTypes.SELECT});
    assert.equal(ledger[0]!.count, '0');
    const concurrent = await Promise.allSettled(['concurrent-a', 'concurrent-b'].map((revision) =>
        EditorialComposition.create(appDb, 'https://example.test').publishArticle.execute({
            articleId: target.articleId, locale: target.locale, expectedRevision: snapshot.revision,
            operator: {kind: 'operator', id: 'concurrency-test', sourceRevision: revision, reason: 'Reviewed concurrent operation'},
        })));
    assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = concurrent.find((result) => result.status === 'rejected');
    assert.ok(rejected && rejected.status === 'rejected');
    assert.match(String(rejected.reason), /revision/);
});

test('Snapshot scope retains its revision across a committed writer and rejects writes', async () => {
    const commands = EditorialComposition.create(appDb, 'https://example.test');
    const target = (await commands.exportSnapshot.execute()).articles[0]!;
    const context = new PersistenceContext();
    const scope = new ReadSnapshotUnitOfWork(appDb, context);
    const revisions = new PublicationRevisionPersistence(appDb, context);
    await scope.execute(async () => {
        const before = (await revisions.find({singleton: true}))[0]!.toData();
        await commands.publishArticle.execute({articleId: target.articleId, locale: target.locale, expectedRevision: before.revision!,
            operator: {kind: 'operator', id: 'snapshot-test', sourceRevision: 'snapshot-consistency', reason: 'Reviewed snapshot concurrency test'}});
        assert.equal((await revisions.find({singleton: true}))[0]!.toData().revision, before.revision);
    });
    assert.equal(context.getTransaction(), undefined);
    assert.equal((await commands.getRevision.execute()).revision, 'snapshot-consistency');
    const articles = new ArticlePersistence(appDb, context);
    const article = (await articles.findById(target.articleId))!;
    await assert.rejects(scope.execute(() => articles.save(article)), /read.only/i);
    assert.equal(context.getTransaction(), undefined);
});
