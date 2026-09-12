import assert from 'node:assert/strict';
import test from 'node:test';
import {Article} from '../../src/modules/publishing/domain/article';
import {ArticleTranslation, type ArticleTranslationProps} from '../../src/modules/publishing/domain/entities/articleTranslation';
import {ReadingTime} from '../../src/modules/publishing/domain/reading-time';
import {PublicationPolicy} from '../../src/modules/publishing/domain/publication-policy';
import {Series, type SeriesMember} from '../../src/modules/publishing/domain/series';

const now = new Date('2026-09-09T12:00:00.000Z');
const article = new Article({id: '123e4567-e89b-42d3-a456-426614174000', sourceLocale: 'pt-BR', authorId: '223e4567-e89b-42d3-a456-426614174000',
    difficulty: 'foundational', createdAt: now, archivedAt: null});

function translation(overrides: Partial<ArticleTranslationProps> = {}): ArticleTranslation {
    return new ArticleTranslation({id: '323e4567-e89b-42d3-a456-426614174000', articleId: article.id, locale: 'pt-BR', slug: 'valid-title', title: 'Valid title',
        description: 'Valid description', bodyMarkdown: 'Valid body', status: 'draft', publishedAt: null, updatedAt: new Date('2026-09-08T12:00:00.000Z'),
        sourceRevision: 'revision-2', translatedFromRevision: 'revision-2', readingMinutes: 1, seo: {title: 'Valid title', description: 'Valid description'}, ...overrides});
}

test('E04-U01: publication transitions preserve first publication and flag stale translations', () => {
    const published = PublicationPolicy.transition(article, translation(), 'publish', now);
    assert.deepEqual(published.status, 'published');
    assert.equal(published.publishedAt?.toISOString(), now.toISOString());
    assert.throws(() => PublicationPolicy.transition(article, translation({title: ' '}), 'publish', now), /needs title/);
    assert.throws(() => PublicationPolicy.transition(article, translation({updatedAt: new Date('2026-09-10T00:00:00.000Z')}), 'publish', now), /future/);

    const firstPublication = new Date('2026-09-01T12:00:00.000Z');
    const corrected = PublicationPolicy.transition(article, translation({status: 'published', publishedAt: firstPublication}), 'publish', now);
    assert.deepEqual(corrected.publishedAt, firstPublication);
    const republished = PublicationPolicy.transition(article, translation({status: 'published', publishedAt: firstPublication}), 'unpublish', now);
    assert.equal(republished.status, 'draft');
    assert.deepEqual(republished.publishedAt, firstPublication);

    const stale = PublicationPolicy.transition(article, translation({locale: 'en', sourceRevision: 'revision-3', translatedFromRevision: 'revision-2'}), 'publish', now);
    assert.equal(stale.translationNeedsReview, true);
    assert.equal(stale.status, 'published');
    const reviewed = PublicationPolicy.transition(article, translation({locale: 'en', sourceRevision: 'english-hash', translatedFromRevision: 'origin-hash'}), 'publish', now, 'origin-hash');
    assert.equal(reviewed.translationNeedsReview, false);
    assert.throws(() => PublicationPolicy.transition(article.archive(now), translation(), 'publish', now), /archived article/);
    assert.throws(() => PublicationPolicy.transition(article, translation({status: 'archived'}), 'publish', now), /Restore/);
    assert.equal(PublicationPolicy.transition(article, translation({status: 'archived'}), 'restore', now).status, 'draft');
});

const members: readonly SeriesMember[] = [
    {articleId: 'a', position: 1, locale: 'pt-BR', translationPublished: true, articleArchived: false},
    {articleId: 'b', position: 3, locale: 'pt-BR', translationPublished: false, articleArchived: false},
    {articleId: 'c', position: 8, locale: 'pt-BR', translationPublished: true, articleArchived: false},
];

test('E04-U02: series navigation uses only visible localized members and validates membership', () => {
    assert.deepEqual(Series.visibleNavigation(members, 'pt-BR', 'a'), {count: 2, nextArticleId: 'c', previousArticleId: undefined});
    assert.deepEqual(Series.visibleNavigation(members, 'pt-BR', 'c'), {count: 2, previousArticleId: 'a', nextArticleId: undefined});
    assert.deepEqual(Series.visibleNavigation(members, 'en'), {count: 0, previousArticleId: undefined, nextArticleId: undefined});
    assert.throws(() => Series.validateMembers([{...members[0]!, position: 0}]), /positive/);
    assert.throws(() => Series.validateMembers([members[0]!, {...members[0]!, position: 2}]), /repeated/);
    assert.throws(() => Series.validateMembers([members[0]!, {...members[2]!, position: 1}]), /unique/);
});

test('E04-U03: reading time uses extracted text with a minimum of one minute', () => {
    assert.equal(ReadingTime.estimateMinutes(''), 1);
    assert.equal(ReadingTime.estimateMinutes(Array.from({length: 200}, () => 'word').join(' ')), 1);
    assert.equal(ReadingTime.estimateMinutes(Array.from({length: 201}, () => 'word').join(' ')), 2);
    assert.equal(ReadingTime.estimateMinutes('const code = 1; visible words'), 1);
});

test('Entities protect dates, nested state and identity while returning validated new instances', () => {
    const props = translation().getProps();
    const entity = ArticleTranslation.rehydrate(props);
    const timestamp = entity.updatedAt.getTime();
    props.updatedAt.setFullYear(2000);
    entity.updatedAt.setFullYear(2001);
    entity.getProps().updatedAt.setFullYear(2002);
    assert.equal(entity.updatedAt.getTime(), timestamp);
    assert.throws(() => Object.assign(entity.seo, {title: 'Tampered'}), TypeError);
    assert.throws(() => Object.assign(entity, {id: 'changed'}), TypeError);
    const published = entity.publish(article, now);
    assert.notEqual(published, entity);
    assert.equal(entity.status, 'draft');
    assert.equal(published.status, 'published');
    assert.equal(published.id, entity.id);
    const withdrawn = published.unpublish(article, now);
    assert.equal(published.status, 'published');
    assert.equal(withdrawn.status, 'draft');
    assert.deepEqual(withdrawn.publishedAt, published.publishedAt);
    const archived = published.archive(article, now);
    assert.equal(archived.restore(article, now).status, 'draft');
    assert.throws(() => ArticleTranslation.rehydrate({...entity.getProps(), id: 'invalid'}), /UUID/);
    assert.throws(() => ArticleTranslation.rehydrate({...entity.getProps(), updatedAt: new Date(NaN)}), /date/);
    const archivedArticle = article.archive(now);
    archivedArticle.archivedAt!.setFullYear(1999);
    assert.deepEqual(archivedArticle.archivedAt, now);
    assert.equal(article.archivedAt, null);
    assert.equal(archivedArticle.restore().archivedAt, null);
    assert.throws(() => article.restore(), /archived article/);
});

test('Series snapshots detach input arrays and member objects; replacements preserve identity', () => {
    const input = members.map((member) => ({...member}));
    const series = new Series({id: article.id, members: input});
    input[0]!.position = 50;
    input.pop();
    assert.equal(series.members.length, 3);
    assert.equal(series.members[0]!.position, 1);
    assert.throws(() => Object.assign(series.members[0]!, {position: 0}), TypeError);
    const replaced = series.withMembers([members[0]!]);
    assert.equal(replaced.id, series.id);
    assert.equal(replaced.members.length, 1);
    assert.equal(series.members.length, 3);
    assert.deepEqual(series.navigation('pt-BR', 'a'), {count: 2, previousArticleId: undefined, nextArticleId: 'c'});
    assert.throws(() => series.withMembers([{...members[0]!, position: 0}]), /positive/);
});
