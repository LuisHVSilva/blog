import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {join} from 'node:path';
import test, {type TestContext} from 'node:test';
import request from 'supertest';
import {createApp} from '../../src/http/app';
import {HealthRoutes} from '../../src/http/health.routes';
import {loadConfig} from '../../src/config/env';
import {Database} from '../../src/infrastructure/database';
import {captureLogger, httpFixture, localEnv, testConfig} from '../helpers/http';
import {backendRoot} from '../helpers/tooling';

type Message = { event: string; port?: number; stopping?: boolean };

function processFixture(t: TestContext, overrides: NodeJS.ProcessEnv = {}) {
    const env: NodeJS.ProcessEnv = {
        ...process.env, ...localEnv,
        DB_HOST: process.env.TEST_DB_HOST ?? '127.0.0.1', DB_PORT: process.env.TEST_DB_PORT ?? '15432', ...overrides
    };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_OPTIONS;
    const child = spawn(process.execPath, ['--import', 'tsx', join(backendRoot, 'tests/fixtures/e02-process.ts')], {
        cwd: backendRoot, env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'], windowsHide: true,
    });
    let output = '';
    child.stdout!.on('data', (data) => {
        output += data.toString();
    });
    child.stderr!.on('data', (data) => {
        output += data.toString();
    });
    const messages: Message[] = [];
    child.on('message', (message) => messages.push(message as Message));
    const exited = new Promise<number | null>((done, reject) => {
        child.once('exit', done);
        child.once('error', reject);
    });
    t.after(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    });
    const waitFor = (event: string): Promise<Message> => {
        const existing = messages.find((message) => message.event === event);
        if (existing) return Promise.resolve(existing);
        return new Promise((done, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error('Timed out waiting for ' + event + '\n' + output));
            }, 15_000);
            const onMessage = (message: unknown) => {
                if ((message as Message).event === event) {
                    cleanup();
                    done(message as Message);
                }
            };
            const onExit = () => {
                cleanup();
                reject(new Error('Process exited before ' + event + '\n' + output));
            };
            const cleanup = () => {
                clearTimeout(timer);
                child.off('message', onMessage);
                child.off('exit', onExit);
            };
            child.on('message', onMessage);
            child.once('exit', onExit);
        });
    };
    return {child, exited, waitFor, messages, output: () => output};
}

test('E02-I01: liveness ignores DB failure; readiness deadlines do not stack probes and shutdown wins', async () => {
    const {logger} = captureLogger();
    let calls = 0;
    let release!: () => void;
    const operation = new Promise<void>((done) => {
        release = done;
    });
    const state = {stopping: false};
    const readiness = HealthRoutes.createReadiness(() => {
        calls++;
        return operation;
    }, () => state.stopping, 25);
    const app = createApp({config: testConfig, logger, readiness});
    await request(app).get('/health/live').expect(200);
    await Promise.all(Array.from({length: 4}, () => request(app).get('/health/ready').expect(503)));
    await request(app).get('/health/ready').expect(503);
    assert.equal(calls, 1);
    release();
    await operation;
    await Promise.resolve();
    await request(app).get('/health/ready').expect(200);
    state.stopping = true;
    await request(app).get('/health/ready').expect(503);
    const failing = createApp({
        config: testConfig, logger, readiness: HealthRoutes.createReadiness(async () => {
            throw new Error('private DB');
        }, () => false)
    });
    await request(failing).get('/health/ready').expect(503);
    await request(failing).get('/health/live').expect(200);
    const fixture = httpFixture();
    await request(fixture.app).get('/health/live').set('Origin', 'https://blocked.test').expect(403);
    await request(fixture.app).post('/fixture').type('json').send('{bad').expect(400);
    await request(fixture.app).post('/fixture').type('json').send('x'.repeat(16385)).expect(413);
    await request(fixture.app).post('/fixture').type('text').send('body').expect(415);
});

test('E02-I02: SIGTERM marks stopping before draining an in-flight request and closes the real pool', {timeout: 25_000}, async (t) => {
    const fixture = processFixture(t);
    const {port} = await fixture.waitFor('ready');
    await request('http://127.0.0.1:' + port).get('/health/ready').expect(200);
    const response = request('http://127.0.0.1:' + port).get('/slow').then((value) => value);
    await fixture.waitFor('request-started');
    if (process.platform === 'win32') fixture.child.send('signal');
    else fixture.child.kill('SIGTERM');
    assert.equal((await fixture.waitFor('state')).stopping, true);
    fixture.child.send('release');
    assert.deepEqual((await response).body, {drained: true});
    assert.equal(await fixture.exited, 0, fixture.output());
    assert.ok(fixture.messages.some((message) => message.event === 'pool-closed'));
    await assert.rejects(fetch('http://127.0.0.1:' + port + '/health/live'));
});

test('E02-I02: occupied port and refused DB connection exit 1 after pool cleanup', {timeout: 30_000}, async (t) => {
    const occupied = createServer();
    await new Promise<void>((done) => occupied.listen(0, done));
    t.after(() => occupied.close());
    const address = occupied.address();
    assert.ok(address && typeof address === 'object');
    const conflict = processFixture(t, {FIXTURE_PORT: String(address.port)});
    assert.equal(await conflict.exited, 1, conflict.output());
    assert.match(conflict.output(), /STARTUP_FAILED/);
    assert.ok(conflict.messages.some((message) => message.event === 'pool-closed'));
    // Port 1 is a controlled non-PostgreSQL dependency; all DB credentials are synthetic.
    const refused = processFixture(t, {DB_PORT: '1'});
    assert.equal(await refused.exited, 1, refused.output());
    assert.match(refused.output(), /DEPENDENCY_UNAVAILABLE/);
    assert.ok(refused.messages.some((message) => message.event === 'pool-closed'));
});

test('E02-I02: fatal exceptions/rejections stop the listener even when logging fails; SIGINT exits normally', {timeout: 30_000}, async (t) => {
    for (const event of ['fatal', 'rejection', 'interrupt']) {
        const fixture = processFixture(t, {FIXTURE_LOG_FAIL: 'true'});
        const {port} = await fixture.waitFor('ready');
        if (event === 'interrupt' && process.platform !== 'win32') fixture.child.kill('SIGINT');
        else fixture.child.send(event);
        assert.equal(await fixture.exited, event === 'interrupt' ? 0 : 1, fixture.output());
        assert.ok(fixture.messages.some((message) => message.event === 'pool-closed'));
        assert.doesNotMatch(fixture.output(), /private-fatal|private-rejection|private-logger/);
        await assert.rejects(fetch('http://127.0.0.1:' + port + '/health/live'));
    }
});

test('E02-I02: a shutdown that never resolves is forcibly terminated at its deadline', {timeout: 20_000}, async (t) => {
    const fixture = processFixture(t, {FIXTURE_HANG: 'true', FIXTURE_DEADLINE: '100', FIXTURE_LOG_FAIL: 'true'});
    const {port} = await fixture.waitFor('ready');
    const started = performance.now();
    fixture.child.send('signal');
    assert.equal(await fixture.exited, 1);
    assert.ok(performance.now() - started < 5000);
    await assert.rejects(fetch('http://127.0.0.1:' + port + '/health/live'));
});

test('E02-I02: real PostgreSQL queries are bounded at the driver/server and health recovers', {timeout: 15_000}, async (t) => {
    const database = new Database(loadConfig({
        ...localEnv, DB_HOST: process.env.TEST_DB_HOST ?? '127.0.0.1',
        DB_PORT: process.env.TEST_DB_PORT ?? '15432', DB_STATEMENT_TIMEOUT_MS: '100'
    }).database);
    t.after(() => database.disconnect());
    await database.connect();
    await assert.rejects(database.getSequelize().query('SELECT pg_sleep(1)'));
    await database.checkReady();
    await database.disconnect();
    await database.disconnect();
});

test('E02-A02 integration: errors after headers are sent terminate the stream without another JSON or leaked logs', {timeout: 20_000}, async (t) => {
    const fixture = processFixture(t);
    const {port} = await fixture.waitFor('ready');
    await assert.rejects(async () => {
        const response = await fetch('http://127.0.0.1:' + port + '/partial');
        await response.text();
    });
    assert.doesNotMatch(fixture.output(), /private-partial-error/);
    fixture.child.send('signal');
    assert.equal(await fixture.exited, 0);
});
