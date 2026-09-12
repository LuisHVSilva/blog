import assert from 'node:assert/strict';
import test from 'node:test';
import {ArticleService} from '../../src/modules/publishing/domain/services/article.service';
import {SeriesService} from '../../src/modules/publishing/domain/services/series.service';
import {TagService} from '../../src/modules/publishing/domain/services/tag.service';
import {ListArticlesUseCase} from '../../src/modules/publishing/application/useCases/listArticles/listArticles.useCase';
import {GetArticleUseCase} from '../../src/modules/publishing/application/useCases/getArticle/getArticle.useCase';
import {GetSeriesUseCase} from '../../src/modules/publishing/application/useCases/getSeries/getSeries.useCase';
import {ListTagsUseCase} from '../../src/modules/publishing/application/useCases/listTags/listTags.useCase';
import {ListSeriesUseCase} from '../../src/modules/publishing/application/useCases/listSeries/listSeries.useCase';
import type {
    IPublicArticleRepository,
    PublicArticleLookup
} from '../../src/modules/publishing/domain/repositories/publicArticle.repository.interface';
import type {
    ArticleListQuery,
    ArticleSummary,
    SlugQuery
} from '../../src/modules/publishing/domain/public-content.types';
import type {Locale} from '../../src/modules/publishing/domain/publishing.types';
import {PublishedArticle} from '../../src/modules/publishing/domain/entities/publishedArticle';
import {PublishedSeries} from '../../src/modules/publishing/domain/entities/publishedSeries';
import {PublishedTag} from '../../src/modules/publishing/domain/entities/publishedTag';

const summary: ArticleSummary = {
    articleId: '6fb123dd-76b3-426f-bc70-61cbb1f20b03', translationId: '50ac4ec6-f741-4520-882a-45f3b189e88a',
    locale: 'pt-BR', slug: 'article', title: 'Title', description: 'Description', difficulty: 'foundational',
    publishedAt: '2026-09-09T00:00:00.000Z', updatedAt: '2026-09-09T00:00:00.000Z', readingMinutes: 1,
    canonical: 'https://example.test/pt-BR/articles/article', author: {id: 'author', displayName: 'Author', profileSlug: 'author'},
    tags: [], series: [],
};

class ArticleRepositoryFake implements IPublicArticleRepository {
    calls: ArticleListQuery[] = [];
    lookups: SlugQuery[] = [];
    found: PublicArticleLookup | null = null;
    failure?: Error;
    async allPublished() { return []; }
    async list(input: ArticleListQuery) {
        this.calls.push(input);
        if (this.failure) throw this.failure;
        return {data: [new PublishedArticle(summary)], pagination: {page: input.page, limit: input.limit, total: 1, totalPages: 1}};
    }
    async getBySlug(input: SlugQuery) { this.lookups.push(input); return this.found; }
    async listSeriesMembers() { return [{position: 2, article: new PublishedArticle(summary)}]; }
}

test('Use case depends only on the service contract and returns its result unchanged', async () => {
    const payload = {locale: 'en' as const};
    const expected = {data: [], pagination: {page: 1, limit: 20, total: 0, totalPages: 0}};
    let received: unknown;
    const useCase = new ListArticlesUseCase({
        async allPublished() { return []; },
        async list(input) { received = input; return expected; },
        async getBySlug() { throw new Error('Unexpected lookup'); },
        async listSeriesMembers() { throw new Error('Unexpected series lookup'); },
    });
    assert.equal(await useCase.execute(payload), expected);
    assert.equal(received, payload);
});

test('Use case delegates to the injected service; service normalizes without changing the payload', async () => {
    const repository = new ArticleRepositoryFake();
    const service = new ArticleService(repository);
    const useCase = new ListArticlesUseCase(service);
    const input = Object.freeze({locale: 'pt-BR' as const, q: '  Title  '});
    const result = await useCase.execute(input);
    assert.deepEqual(repository.calls, [{locale: 'pt-BR', q: 'Title', page: 1, limit: 20}]);
    assert.equal(input.q, '  Title  ');
    assert.deepEqual(result.data, [summary]);
    assert.equal(Object.getPrototypeOf(result.data[0]), Object.prototype);
    const failure = new Error('Repository unavailable');
    repository.failure = failure;
    await assert.rejects(useCase.execute({locale: 'en'}), (error: unknown) => error === failure);
});

test('Service rejects invalid queries before any persistence call, including non-HTTP callers', async () => {
    const repository = new ArticleRepositoryFake();
    const useCase = new ListArticlesUseCase(new ArticleService(repository));
    for (const invalid of [
        {page: 0}, {page: 1.5}, {page: Number.MAX_SAFE_INTEGER}, {limit: 0}, {limit: 51},
        {q: ''}, {q: 'a'}, {q: 'a'.repeat(101)}, {tag: 'UPPERCASE'}, {series: '../x'},
        {locale: 'en-US' as Locale}, {sort: 'injected' as 'publishedAt:asc'},
    ]) await assert.rejects(useCase.execute({locale: 'en', ...invalid}), /Invalid|Unsupported/);
    assert.equal(repository.calls.length, 0);
});

test('Article lookup preserves null, locale and redirects; details are detached immutable projections', async () => {
    const repository = new ArticleRepositoryFake();
    const useCase = new GetArticleUseCase(new ArticleService(repository));
    assert.equal(await useCase.execute({locale: 'en', slug: 'only-pt'}), null);
    assert.deepEqual(repository.lookups, [{locale: 'en', slug: 'only-pt'}]);
    repository.found = {kind: 'redirect', locale: 'pt-BR', slug: 'new-slug'};
    assert.deepEqual(await useCase.execute({locale: 'pt-BR', slug: 'old-slug'}), repository.found);
    const author = {...summary.author};
    const entity = new PublishedArticle({...summary, author, bodyMarkdown: 'Body', seo: {title: 'SEO', description: 'SEO description'}, alternates: []});
    author.displayName = 'Mutated input';
    assert.equal(entity.toDetail().author.displayName, 'Author');
    assert.equal(Reflect.set(entity.toDetail().author, 'displayName', 'Mutated output'), false);
    assert.equal(entity.toDetail().author.displayName, 'Author');
    repository.found = {kind: 'found', article: entity, lastModified: summary.updatedAt};
    const found = await useCase.execute({locale: 'pt-BR', slug: 'article'});
    assert.equal(found?.kind, 'found');
    if (found?.kind === 'found') assert.equal(found.article.bodyMarkdown, 'Body');
    await assert.rejects(useCase.execute({locale: 'en', slug: '../x'}), /Invalid slug/);
});

test('Series service coordinates article service, preserves translation gaps and handles missing series', async () => {
    const articles = new ArticleService(new ArticleRepositoryFake());
    const id = '248c19d7-50b8-4ea1-b8a4-819bfcc3af00';
    const series = new SeriesService({
        async list(locale) { return [new PublishedSeries({id, locale, slug: 'series', title: 'Series', description: 'Description', articleCount: 1, canonical: 'https://example.test/series'})]; },
        async countMembers() { return 2; },
    }, articles);
    const detail = await new GetSeriesUseCase(series).execute({locale: 'pt-BR', slug: 'series'});
    assert.equal(detail?.hasTranslationGaps, true);
    assert.equal(detail?.members[0]?.position, 2);
    assert.equal(detail?.members[0]?.previousArticleId, undefined);
    assert.equal(await new GetSeriesUseCase(series).execute({locale: 'en', slug: 'missing'}), null);
    assert.equal((await new ListSeriesUseCase(series).execute({locale: 'en'}))[0]?.locale, 'en');
    const tags = new TagService({async list(locale) { return [new PublishedTag({id, locale, key: 'tag', name: 'Tag', slug: 'tag', articleCount: 1, canonical: 'https://example.test/tag'})]; }});
    assert.equal((await new ListTagsUseCase(tags).execute({locale: 'en'}))[0]?.name, 'Tag');
    await assert.rejects(new ListTagsUseCase(tags).execute({locale: 'invalid' as Locale}), /Unsupported/);
});
