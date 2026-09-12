import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import {ConnectionError} from 'sequelize';
import {Router} from 'express';
import {httpFixture, testConfig} from '../helpers/http';
import {captureLogger} from '../helpers/logging';
import {createApp} from '../../src/http/app';

test('E02-A01: health responses are minimal, no-store and independent from private config', async () => {
    const {app, state} = httpFixture();
    for (const route of ['/health/live', '/health/ready']) {
        const response = await request(app).get(route).expect(200);
        assert.deepEqual(response.body, {status: 'UP'});
        assert.equal(response.headers['cache-control'], 'no-store');
        assert.ok(response.headers['x-request-id']);
    }
    state.stopping = true;
    assert.deepEqual((await request(app).get('/health/ready').expect(503)).body, {status: 'DOWN'});
    await request(app).get('/health/live').expect(200);
    await request(app).get('/api/health').expect(404);
    await request(app).get('/api/').expect(404);
});

test('E02-A01: CORS rejects without echo, keeps correlation and exposes the header to allowed origins', async () => {
    const {app, records} = httpFixture();
    const rejected = await request(app).get('/health/live').set('Origin', 'https://private.example').set('X-Request-Id', 'cors-id').expect(403);
    assert.equal(rejected.body.error.code, 'ORIGIN_NOT_ALLOWED');
    assert.equal(rejected.body.requestId, 'cors-id');
    assert.equal(rejected.headers['access-control-allow-origin'], undefined);
    assert.ok(rejected.headers['x-content-type-options']);
    assert.doesNotMatch(JSON.stringify([rejected.body, records]), /private\.example/);
    const allowed = await request(app).get('/health/live').set('Origin', 'http://localhost:5173').expect(200);
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.match(allowed.headers['access-control-expose-headers'], /X-Request-Id/);
});

test('E02-A01: mutation parser enforces valid JSON, 16 KiB and content type; query is bounded', async () => {
    const {app, records} = httpFixture();
    assert.equal((await request(app).post('/fixture').set('Content-Type', 'application/json').send('{bad').expect(400)).body.error.code, 'INVALID_JSON');
    const exact = JSON.stringify({value: 'x'.repeat(16 * 1024 - 12)});
    assert.equal(Buffer.byteLength(exact), 16 * 1024);
    await request(app).post('/fixture').set('Content-Type', 'application/json').send(exact).expect(200);
    await request(app).post('/fixture').set('Content-Type', 'application/json').send(exact + ' ').expect(413);
    await request(app).post('/fixture').type('form').send('value=private').expect(415);
    await request(app).get('/health/live?' + 'q'.repeat(2049)).expect(413);
    await request(app).post('/fixture').send({value: 'private-body-marker'}).expect(200);
    assert.doesNotMatch(JSON.stringify(records), /private-body-marker|value=private/);
});

test('E02-A02: application kinds map to envelopes; unknown and dependency errors expose no internals', async () => {
    const {app, records} = httpFixture();
    for (const [kind, status] of Object.entries({validation: 400, unauthenticated: 401, unauthorized: 403, 'not-found': 404, conflict: 409, 'business-rule': 422, unavailable: 503, 'rate-limited': 429})) {
        const result = await request(app).get('/error/' + kind).expect(status);
        assert.deepEqual(result.body.error, {code: 'FIXTURE_ERROR', message: 'Safe fixture message.', fields: [{path: 'title', code: 'INVALID_VALUE', message: 'Invalid value.'}]});
        assert.equal(result.body.requestId, result.headers['x-request-id']);
    }
    const unknown = await request(app).get('/unknown').expect(500);
    assert.equal(unknown.body.error.code, 'INTERNAL_ERROR');
    assert.doesNotMatch(JSON.stringify([unknown.body, records]), /unstructured-secret|private SQL|unsafe supplied|stack/);
    const router = Router();
    router.get('/db', () => { throw new ConnectionError(new Error('private driver details')); });
    const dbApp = createApp({config: testConfig, logger: captureLogger().logger, readiness: {isStopping: () => false, check: async () => false}, routes: [router]});
    assert.equal((await request(dbApp).get('/db').expect(503)).body.error.code, 'DEPENDENCY_UNAVAILABLE');
});

test('E02-A02: invalid request IDs are replaced, valid IDs are retained and 404 is JSON', async () => {
    const {app} = httpFixture();
    for (const id of ['bad space', 'á', 'x'.repeat(129)]) {
        const result = await request(app).get('/missing').set('X-Request-Id', id).expect(404);
        assert.match(result.body.requestId, /^[0-9a-f-]{36}$/);
        assert.notEqual(result.body.requestId, id);
    }
    const valid = await request(app).get('/missing').set('X-Request-Id', 'valid._-123').expect(404);
    assert.equal(valid.body.requestId, 'valid._-123');
    assert.equal(valid.body.error.code, 'NOT_FOUND');
});
