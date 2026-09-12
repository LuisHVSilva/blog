import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import {PublishingHttpContainer} from '../../src/infrastructures/di/publishingHttp.container';
import {ArticlesController} from '../../src/modules/publishing/adapters/http/controllers/articles.controller';
import type {PublicUseCases} from '../../src/modules/publishing/application/public-use-cases';
import {buildArticlesRouter} from '../../src/modules/publishing/adapters/http/routes/articles.router';

test('E08-U01: public routes resolve an injected controller instead of handling use cases directly', async () => {
    const received: unknown[] = [];
    const useCases = {
        listArticles: {execute: async () => undefined},
        getArticle: {execute: async () => undefined},
        listTags: {execute: async (input: unknown) => { received.push(input); return [{slug: 'architecture'}]; }},
        listSeries: {execute: async () => []},
        getSeries: {execute: async () => undefined}
    } as unknown as PublicUseCases;
    const container = new PublishingHttpContainer(useCases);

    assert.equal(container.resolve(ArticlesController), container.resolve(ArticlesController));
    const app = express();
    app.use(buildArticlesRouter(container));
    const response = await request(app).get('/api/v1/tags?locale=pt-br').expect(200);

    assert.deepEqual(received, [{locale: 'pt-BR'}]);
    assert.deepEqual(response.body, [{slug: 'architecture'}]);
});
