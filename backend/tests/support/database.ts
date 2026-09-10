import {Sequelize} from 'sequelize';
import {loadConfig, type Config} from '../../src/config/env';

export function testEnvironment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    const env = {...process.env, ...overrides};
    if (env.NODE_ENV !== 'test') throw new Error('Database test helpers require NODE_ENV=test.');
    const name = env.TEST_DB_NAME;
    if (!name || !/^blog_test_[a-z0-9_]+$/i.test(name)) throw new Error('Refusing a database outside the blog_test_* namespace.');
    for (const key of ['TEST_DB_HOST', 'TEST_DB_PORT', 'TEST_DB_USERNAME', 'TEST_DB_PASSWORD'] as const) {
        if (!env[key]) throw new Error(`Missing ${key}.`);
    }
    return env;
}

export function appConfig(env: NodeJS.ProcessEnv): Config['database'] {
    const safe = testEnvironment(env);
    return loadConfig({
        NODE_ENV: 'test', PORT: '3010', DB_DIALECT: 'postgres',
        DB_HOST: safe.TEST_DB_HOST, DB_PORT: safe.TEST_DB_PORT, DB_NAME: safe.TEST_DB_NAME,
        DB_USERNAME: safe.TEST_DB_USERNAME, DB_PASSWORD: safe.TEST_DB_PASSWORD,
        PUBLIC_SITE_URL: 'http://localhost:5173', SYNC: 'false',
    }).database;
}

export function migratorConfig(env: NodeJS.ProcessEnv): Config['database'] {
    const safe = testEnvironment(env);
    return loadConfig({
        NODE_ENV: 'test', PORT: '3010', DB_DIALECT: 'postgres',
        DB_HOST: safe.MIGRATOR_DB_HOST, DB_PORT: safe.MIGRATOR_DB_PORT, DB_NAME: safe.MIGRATOR_DB_NAME,
        DB_USERNAME: safe.MIGRATOR_DB_USERNAME, DB_PASSWORD: safe.MIGRATOR_DB_PASSWORD,
        PUBLIC_SITE_URL: 'http://localhost:5173', SYNC: 'false',
    }).database;
}

export function databaseFor(config: Config['database']): Sequelize {
    return new Sequelize({
        dialect: 'postgres', database: config.name, host: config.host, port: config.port,
        username: config.username, password: config.password, logging: false,
        pool: {max: config.poolMax, min: 0, acquire: config.acquireMs},
        dialectOptions: {connectionTimeoutMillis: config.acquireMs, statement_timeout: config.statementTimeoutMs, query_timeout: config.statementTimeoutMs},
    });
}

export async function resetTestObjects(sequelize: Sequelize): Promise<void> {
    await sequelize.query('DROP TABLE IF EXISTS e03_app_probe, e03_failure_probe, e03_concurrency_probe CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
}
