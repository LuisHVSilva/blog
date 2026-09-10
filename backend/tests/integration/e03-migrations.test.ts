import assert from 'node:assert/strict';
import test from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';
import {QueryTypes} from 'sequelize';
import {migrationChecksum, migrationStatus, runMigrations, type Migration} from '../../migrations/runner';
import {appConfig, databaseFor, migratorConfig, resetTestObjects, testEnvironment} from '../support/database';

const environment = testEnvironment();
const migrator = databaseFor(migratorConfig(environment));
const app = databaseFor(appConfig(environment));

test.before(async () => { await migrator.authenticate(); await app.authenticate(); });
test.after(async () => { await app.close(); await migrator.close(); });
test.beforeEach(async () => { await resetTestObjects(migrator); });

function migration(version: string, sql: string): Migration {
    return {version, checksum: migrationChecksum(sql), async up(sequelize, transaction) { await sequelize.query(sql, {transaction}); }};
}

test('E03-I01: real PostgreSQL applies each migration once and serializes concurrent migrators', async () => {
    const one = migration('001-create', 'CREATE TABLE e03_concurrency_probe (id integer PRIMARY KEY)');
    const two = migration('002-index', 'CREATE INDEX e03_concurrency_probe_id_index ON e03_concurrency_probe(id)');
    assert.deepEqual(await runMigrations(migrator, [two, one]), ['001-create', '002-index']);
    assert.deepEqual(await runMigrations(migrator, [one, two]), []);
    assert.equal((await migrationStatus(migrator)).size, 2);
    await resetTestObjects(migrator);
    const slow: Migration = {version: '001-slow', checksum: migrationChecksum('slow'), async up(sequelize, transaction) {
        await sequelize.query('CREATE TABLE e03_concurrency_probe (id integer PRIMARY KEY)', {transaction});
        await sequelize.query('SELECT pg_sleep(0.15)', {transaction});
    }};
    const [first, second] = await Promise.all([runMigrations(migrator, [slow]), runMigrations(migrator, [slow])]);
    assert.deepEqual([first, second].sort((left, right) => right.length - left.length), [['001-slow'], []]);
    const rows = await migrator.query<{count: string}>('SELECT count(*)::text AS count FROM schema_migrations', {type: QueryTypes.SELECT});
    assert.equal(rows[0]!.count, '1');
});

test('E03-I01: an error rolls back DDL and its ledger entry; changed checksum is rejected', async () => {
    const failed: Migration = {version: '001-failure', checksum: migrationChecksum('failure'), async up(sequelize, transaction) {
        await sequelize.query('CREATE TABLE e03_failure_probe (id integer PRIMARY KEY)', {transaction});
        throw new Error('deliberate migration failure');
    }};
    await assert.rejects(runMigrations(migrator, [failed]));
    const tables = await migrator.query<{exists: boolean}>("SELECT to_regclass('public.e03_failure_probe') IS NOT NULL AS exists", {type: QueryTypes.SELECT});
    assert.equal(tables[0]!.exists, false);
    assert.equal((await migrationStatus(migrator)).size, 0);
    const good = migration('001-create', 'CREATE TABLE e03_failure_probe (id integer PRIMARY KEY)');
    await runMigrations(migrator, [good]);
    await assert.rejects(runMigrations(migrator, [{...good, checksum: migrationChecksum('changed')}]), /Checksum mismatch/);
});

test('E03-I02: app role can use granted data but cannot create or alter schema', async () => {
    await migrator.query('CREATE TABLE e03_app_probe (id integer PRIMARY KEY, label text NOT NULL)');
    await migrator.query('GRANT SELECT, INSERT, UPDATE, DELETE ON e03_app_probe TO blog_app');
    await app.query("INSERT INTO e03_app_probe(id, label) VALUES (1, 'allowed')");
    const rows = await app.query<{label: string}>('SELECT label FROM e03_app_probe WHERE id = 1', {type: QueryTypes.SELECT});
    assert.equal(rows[0]!.label, 'allowed');
    await assert.rejects(app.query('CREATE TABLE e03_app_forbidden (id integer)'));
    await assert.rejects(app.query('ALTER TABLE e03_app_probe ADD COLUMN forbidden integer'));
});

test('E03-I02: pool saturation is bounded and recovers after the checked-out connection is released', async () => {
    const limited = databaseFor({...appConfig(environment), poolMax: 1, acquireMs: 75, statementTimeoutMs: 1000});
    await limited.authenticate();
    try {
        const transaction = await limited.transaction();
        const started = performance.now();
        await assert.rejects(limited.query('SELECT 1'));
        assert.ok(performance.now() - started < 1000);
        await transaction.rollback();
        await delay(5);
        await limited.query('SELECT 1');
    } finally { await limited.close(); }
});
