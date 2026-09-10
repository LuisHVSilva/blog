import {createComposition} from '../../src/composition';
import {loadConfig} from '../../src/config/env';
import {testEnvironment} from './database';

export function createTestComposition(env = testEnvironment()) {
    return createComposition(loadConfig({
        NODE_ENV: 'test', PORT: '3010', DB_DIALECT: 'postgres', DB_HOST: env.TEST_DB_HOST,
        DB_PORT: env.TEST_DB_PORT, DB_NAME: env.TEST_DB_NAME, DB_USERNAME: env.TEST_DB_USERNAME,
        DB_PASSWORD: env.TEST_DB_PASSWORD, PUBLIC_SITE_URL: 'http://localhost:5173', SYNC: 'false',
    }));
}
