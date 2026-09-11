import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import test from 'node:test';
import {Router, type Request, type Response} from 'express';
import request from 'supertest';
import {loadConfig, loadEnvironment, findProjectRoot} from '../../src/config/env';
import {createApp} from '../../src/http/app';
import {createErrorHandler} from '../../src/http/error-handler';
import {mapApplicationErrorStatus} from '../../src/http/error-status';
import {readCorrelationId} from '../../src/http/request-context';
import {RequestContext} from '../../src/infrastructures/logging/request-context';
import type {ApplicationErrorKind} from '../../src/shared/errors/application.error';
import {localEnv, testConfig, captureLogger} from '../helpers/http';
import {temporaryDirectory} from '../helpers/tooling';
import {installProcessHandlers} from '../../src/infrastructures/process-handlers';

test('E02-U01: invalid config fails with paths only; valid config normalizes and freezes nested values', () => {
    for (const patch of [
        {PORT: 'NaN'}, {PORT: '0'}, {PORT: '65536'}, {PORT: '1.5'}, {NODE_ENV: 'staging'}, {SYNC: 'true'},
        {NODE_ENV: 'production'}, {TRUST_PROXY: 'true'}, {TRUST_PROXY: '0.0.0.0/0'}, {TRUST_PROXY: '127.0.0.1/33'},
        {DB_PASSWORD: ''}, {DB_PORT: '0'}, {DB_DIALECT: 'mysql'}, {PUBLIC_SITE_URL: 'file:///tmp/file'},
        {CORS_ORIGINS: 'https://example.test/path'}, {CORS_ORIGINS: 'https://user:private@example.test'},
    ]) {
        assert.throws(() => loadConfig({...localEnv, ...patch}), (error: unknown) => {
            assert.ok(error instanceof Error);
            assert.doesNotMatch(error.message, /blog_test_only|private|user:|mysql|staging/);
            return true;
        });
    }
    const config = loadConfig({...localEnv, CORS_ORIGINS: ' http://localhost:5173 ,http://localhost:5173/ ', TRUST_PROXY: '127.0.0.1/32,::1/128'});
    assert.deepEqual(config.corsOrigins, ['http://localhost:5173']);
    assert.deepEqual(config.trustProxy, ['127.0.0.1/32', '::1/128']);
    assert.equal(config.database.poolMax, 5);
    assert.equal(config.database.acquireMs, 5000);
    assert.equal(config.database.statementTimeoutMs, 3000);
    assert.ok(Object.isFrozen(config) && Object.isFrozen(config.database) && Object.isFrozen(config.corsOrigins) && Object.isFrozen(config.trustProxy));
    assert.equal(loadConfig({...localEnv, NODE_ENV: 'production', PUBLIC_SITE_URL: 'https://example.test'}).nodeEnv, 'production');
});

test('E02-U01: local files resolve from project root, injected values win and production never loads files', (t) => {
    const directory = temporaryDirectory(t);
    mkdirSync(join(directory, 'dist/src'), {recursive: true});
    writeFileSync(join(directory, 'package.json'), '{}');
    writeFileSync(join(directory, '.env.test'), 'E02_MARKER=local\nPORT=9999\n');
    writeFileSync(join(directory, '.env.production'), 'E02_MARKER=must-not-load\n');
    assert.equal(findProjectRoot(join(directory, 'dist/src')), directory);
    assert.equal(loadEnvironment({NODE_ENV: 'test', PORT: '3010'}, directory).PORT, '3010');
    assert.equal(loadEnvironment({NODE_ENV: 'test'}, directory).E02_MARKER, 'local');
    assert.equal(loadEnvironment({NODE_ENV: 'production'}, directory).E02_MARKER, undefined);
});

test('E02-U02: concurrent requests retain independent correlation and logs contain templates only', async () => {
    const {logger, records} = captureLogger();
    const router = Router();
    let arrivals = 0;
    let release!: () => void;
    const barrier = new Promise<void>((done) => { release = done; });
    const contexts: unknown[] = [];
    router.get('/users/:id', async (_req, res) => {
        if (++arrivals === 2) release();
        await barrier;
        contexts.push({...RequestContext.get()});
        res.json({ok: true});
    });
    let ticks = 0;
    const before = process.listenerCount('SIGTERM');
    const app = createApp({config: testConfig, logger, readiness: {isStopping: () => false, check: async () => true}, routes: [router], now: () => ++ticks});
    assert.equal(process.listenerCount('SIGTERM'), before);
    await Promise.all(['one', 'two'].map((id) => request(app).get('/users/private-person?code=private-query')
        .set('Cookie', 'session=private-cookie').set('X-Request-Id', id).set('X-Trace-Id', 'trace-' + id).expect(200)));
    assert.deepEqual(records.map((entry) => entry.requestId).sort(), ['one', 'two']);
    assert.deepEqual(records.map((entry) => entry.traceId).sort(), ['trace-one', 'trace-two']);
    assert.equal(contexts.length, 2);
    assert.doesNotMatch(JSON.stringify(records), /private-person|private-query|private-cookie|\?code/);
    for (const record of records) {
        const details = record.details as {route: string; status: number; durationMs: number};
        assert.equal(details.route, '/users/:id');
        assert.equal(details.status, 200);
        assert.ok(details.durationMs > 0);
    }
    for (const id of ['bad space', '日本語', 'x'.repeat(129), ' leading']) assert.equal(readCorrelationId(id), undefined);
});

test('E02-U03: every kind is mapped; headersSent delegates exactly once', () => {
    const kinds: Record<ApplicationErrorKind, number> = {validation: 400, unauthenticated: 401, unauthorized: 403, 'not-found': 404,
        conflict: 409, 'business-rule': 422, unavailable: 503, 'rate-limited': 429};
    for (const [kind, status] of Object.entries(kinds)) assert.equal(mapApplicationErrorStatus(kind as ApplicationErrorKind), status);
    let calls = 0;
    const error = new Error('fixture');
    createErrorHandler(captureLogger().logger)(error, {} as Request, {headersSent: true} as Response, (passed) => {
        assert.equal(passed, error); calls++;
    });
    assert.equal(calls, 1);
});

test('E02-U03: process handlers can be removed without affecting other listeners', () => {
    const events = ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection'] as const;
    const before = events.map((event) => process.listenerCount(event));
    const handlers = installProcessHandlers({logger: captureLogger().logger, markStopping() {}, shutdown: async () => undefined, forceClose() {}});
    events.forEach((event, index) => assert.equal(process.listenerCount(event), before[index]! + 1));
    handlers.dispose();
    handlers.dispose();
    events.forEach((event, index) => assert.equal(process.listenerCount(event), before[index]));
});

test('E02-U03: throwing/rejecting loggers cannot block an error response, fallback IDs are validated', async () => {
    for (const sync of [true, false]) {
        const {logger} = captureLogger();
        logger.logError = () => { if (sync) throw new Error('fake logger failure'); return Promise.reject(new Error('fake logger failure')); };
        logger.logInfo = async () => { throw new Error('fake completion logger failure'); };
        const router = Router();
        router.get('/failure', () => { throw new Error('private'); });
        const app = createApp({config: testConfig, logger, readiness: {isStopping: () => false, check: async () => true}, routes: [router]});
        const result = await request(app).get('/failure').set('X-Request-Id', 'invalid space').expect(500);
        assert.match(result.body.requestId, /^[0-9a-f-]{36}$/);
        assert.equal(result.body.error.code, 'INTERNAL_ERROR');
    }
    let envelope: {requestId: string} | undefined;
    const res = {headersSent: false, locals: {requestId: 'unsafe space'}, setHeader() {}, status() {return this;}, json(body: {requestId: string}) {envelope = body;}};
    createErrorHandler(captureLogger().logger)(new Error(), {header: () => 'unsafe space'} as unknown as Request, res as unknown as Response, () => assert.fail());
    assert.match(envelope!.requestId, /^[0-9a-f-]{36}$/);
});
