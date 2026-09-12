import assert from 'node:assert/strict';
import test from 'node:test';
import {Sequelize} from 'sequelize-typescript';
import type {Transaction} from 'sequelize';
import {editorialModels} from '../../src/infrastructures/persistence/ORM/modelRegistry';
import {ArticleModel} from '../../src/infrastructures/persistence/ORM/models/article.model';
import {ArticleTranslationModel} from '../../src/infrastructures/persistence/ORM/models/articleTranslation.model';
import {ArticleTagModel} from '../../src/infrastructures/persistence/ORM/models/articleTag.model';
import {ArticlePersistenceMapper} from '../../src/infrastructures/persistence/mappers/article.persistence.mapper';
import {ArticleTranslationPersistenceMapper} from '../../src/infrastructures/persistence/mappers/articleTranslation.persistence.mapper';
import {PersistenceContext} from '../../src/infrastructures/persistence/ORM/context/persistenceContext';
import {ArticlePersistence} from '../../src/infrastructures/persistence/adapters/article.persistence';
import {Article} from '../../src/modules/publishing/domain/article';
import {ArticleTranslation} from '../../src/modules/publishing/domain/entities/articleTranslation';

const date = new Date('2026-09-09T12:00:00Z');
const id = '123e4567-e89b-42d3-a456-426614174000';
const authorId = '223e4567-e89b-42d3-a456-426614174000';

test('ORM: decorators map snake_case, composite keys and separate repositories per connection', async () => {
    const first = new Sequelize({dialect: 'postgres', logging: false, repositoryMode: true, models: editorialModels});
    const second = new Sequelize({dialect: 'postgres', logging: false, repositoryMode: true, models: editorialModels});
    try {
        const a = first.getRepository(ArticleModel), b = second.getRepository(ArticleModel);
        assert.notEqual(a, b);
        assert.equal(a.sequelize, first); assert.equal(b.sequelize, second);
        assert.equal(a.getAttributes().sourceLocale.field, 'source_locale');
        assert.equal(a.options.timestamps, false);
        assert.equal(String(a.getAttributes().id.type), 'UUID');
        const join = first.getRepository(ArticleTagModel);
        assert.deepEqual(join.primaryKeyAttributes, ['articleId', 'tagId']);
        assert.equal('id' in join.getAttributes(), false);
        assert.equal(Object.keys(first.models).length, 12);
    } finally { await first.close(); await second.close(); }
});

test('ORM: mappers reconstruct immutable entities and preserve UUID, null, JSON and dates', async () => {
    const db = new Sequelize({dialect: 'postgres', logging: false, repositoryMode: true, models: editorialModels});
    try {
        const model = db.getRepository(ArticleModel).build({id, authorId, sourceLocale: 'pt-BR', difficulty: 'foundational', createdAt: date, archivedAt: null});
        const entity = ArticlePersistenceMapper.toEntity(model);
        assert.ok(entity instanceof Article);
        assert.deepEqual(ArticlePersistenceMapper.toPersistence(entity), entity.getProps());
        model.createdAt.setFullYear(2000);
        assert.equal(entity.createdAt.getUTCFullYear(), 2026);
        const translationModel = db.getRepository(ArticleTranslationModel).build({id: authorId, articleId: id, locale: 'en', slug: 'mapped',
            title: 'Mapped', description: 'Mapped description', bodyMarkdown: '# Body', status: 'draft', publishedAt: null,
            updatedAt: new Date('2026-09-09T12:00:00Z'), sourceRevision: 'hash', translatedFromRevision: null, readingMinutes: 1,
            seo: {title: 'SEO', description: 'SEO description'}});
        const translation = ArticleTranslationPersistenceMapper.toEntity(translationModel);
        assert.ok(translation instanceof ArticleTranslation);
        assert.equal(translation.translatedFromRevision, null);
        assert.deepEqual(ArticleTranslationPersistenceMapper.toPersistence(translation), translation.getProps());
        translationModel.seo = {title: 'Changed', description: 'Changed'};
        assert.equal(translation.seo.title, 'SEO');
        const repository = new ArticlePersistence(db, new PersistenceContext());
        await assert.rejects(repository.save(entity), /unit of work/);
    } finally { await db.close(); }
});

test('ORM: transaction context isolates concurrent operations and clears after errors', async () => {
    const context = new PersistenceContext();
    const first = {id: 'first'} as unknown as Transaction, second = {id: 'second'} as unknown as Transaction;
    await Promise.all([first, second].map((transaction) => context.run(transaction, async () => {
        await Promise.resolve();
        assert.equal(context.requireTransaction(), transaction);
    })));
    assert.equal(context.getTransaction(), undefined);
    await assert.rejects(context.run(first, async () => { throw new Error('rollback'); }), /rollback/);
    assert.throws(() => context.requireTransaction(), /unit of work/);
});
