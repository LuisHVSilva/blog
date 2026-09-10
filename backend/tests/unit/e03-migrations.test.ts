import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {migrationChecksum, MigrationError, runMigrations} from '../../migrations/runner';
import {Database} from '../../src/infrastructure/database';
import {testEnvironment} from '../support/database';

function migration(version: string, body: () => Promise<void> | void) {
    return {version, checksum: migrationChecksum(version), async up() { await body(); }};
}

test('E03-U01: runner orders migrations, records each one, and does not run a known version twice', async () => {
    const applied = new Map<string, string>();
    const calls: string[] = [];
    const transaction = {id: 'transaction'};
    const sequelize = {
        async query(sql: string, options?: {replacements?: {version: string; checksum: string}}) {
            if (sql.startsWith('SELECT version')) return [...applied].map(([version, checksum]) => ({version, checksum}));
            if (sql.startsWith('INSERT')) { applied.set(options!.replacements!.version, options!.replacements!.checksum); return []; }
            return [];
        },
        async transaction(callback: (value: unknown) => Promise<string[]>) { return await callback(transaction); },
    };
    const migrations = [migration('002-second', () => { calls.push('second'); }), migration('001-first', () => { calls.push('first'); })];
    assert.deepEqual(await runMigrations(sequelize as never, migrations), ['001-first', '002-second']);
    assert.deepEqual(calls, ['first', 'second']);
    assert.deepEqual(await runMigrations(sequelize as never, migrations), []);
    assert.deepEqual(calls, ['first', 'second']);
});

test('E03-U01: checksum mismatch and failure prevent subsequent migrations', async () => {
    const applied = new Map<string, string>([['001-applied', migrationChecksum('old')]]);
    const calls: string[] = [];
    const sequelize = {
        async query(sql: string, options?: {replacements?: {version: string; checksum: string}}) {
            if (sql.startsWith('SELECT version')) return [...applied].map(([version, checksum]) => ({version, checksum}));
            if (sql.startsWith('INSERT')) { applied.set(options!.replacements!.version, options!.replacements!.checksum); return []; }
            return [];
        },
        async transaction(callback: (value: unknown) => Promise<string[]>) { return await callback({}); },
    };
    await assert.rejects(runMigrations(sequelize as never, [migration('001-applied', () => undefined)]), MigrationError);
    applied.clear();
    const failing = migration('002-failing', () => { calls.push('failing'); throw new Error('fixture'); });
    await assert.rejects(runMigrations(sequelize as never, [migration('001-base', () => undefined), failing, migration('003-later', () => { calls.push('later'); })]));
    assert.deepEqual(calls, ['failing']);
});

test('E03-U01: Database connects without schema synchronization and guards reject unsafe test targets before a connection', () => {
    const source = readFileSync('src/infrastructure/database.ts', 'utf8');
    assert.doesNotMatch(source, /\.sync\s*\(/);
    assert.ok(new Database({host: '127.0.0.1', name: 'blog_test_unit', username: 'app', password: 'fixture', port: 5432,
        dialect: 'postgres', poolMax: 1, acquireMs: 50, statementTimeoutMs: 50}).getSequelize());
    for (const env of [
        {NODE_ENV: 'production', TEST_DB_NAME: 'blog_test_migrations'},
        {NODE_ENV: 'test', TEST_DB_NAME: 'blog_dev'},
    ]) {
        assert.throws(() => testEnvironment(env), /require NODE_ENV=test|blog_test_\*|Missing TEST_DB_HOST/);
    }
    assert.doesNotThrow(() => testEnvironment({NODE_ENV: 'test', TEST_DB_NAME: 'blog_test_migrations', TEST_DB_HOST: '127.0.0.1', TEST_DB_PORT: '5432', TEST_DB_USERNAME: 'app', TEST_DB_PASSWORD: 'fixture'}));
});
