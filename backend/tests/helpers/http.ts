import {captureLogger} from './logging';
import {createReadiness} from '../../src/infrastructures/readiness';
import {Router} from 'express';
import {loadConfig} from '../../src/config/env';
import {createApp} from '../../src/http/app';
import {jsonMutation} from '../../src/http/json-mutation';
import {ApplicationError, type ApplicationErrorKind} from '../../src/shared/errors/application.error';

export const localEnv = {
    NODE_ENV: 'test',
    PORT: '3010',
    DB_DIALECT: 'postgres',
    DB_HOST: process.env.TEST_DB_HOST ?? '127.0.0.1',
    DB_PORT: process.env.TEST_DB_PORT ?? '15432',
    DB_NAME: process.env.TEST_DB_NAME ?? 'blog_test_migrations',
    DB_USERNAME: process.env.TEST_DB_USERNAME ?? 'blog_app',
    DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? 'blog_app_test_only',
    PUBLIC_SITE_URL: 'http://localhost:5173',
    CORS_ORIGINS: 'http://localhost:5173',
    SYNC: 'false',
};
export const testConfig = loadConfig(localEnv);

export class FixtureError extends ApplicationError {
    readonly code = 'FIXTURE_ERROR';

    constructor(readonly kind: ApplicationErrorKind) {
        super('Safe fixture message.', [{
            path: 'title',
            code: 'INVALID_VALUE',
            message: 'unsafe supplied field detail'
        }]);
    }
}

export function httpFixture() {
    const capture = captureLogger();
    const state = {stopping: false};
    const router = Router();
    router.post('/fixture', ...jsonMutation, (req, res) => res.json({received: Boolean(req.body)}));
    router.get('/error/:kind', (req, _res, next) => next(new FixtureError(req.params.kind as ApplicationErrorKind)));
    router.get('/unknown', () => {
        throw new Error('private SQL and password=unstructured-secret');
    });
    const readiness = createReadiness(async () => undefined, () => state.stopping);
    const app = createApp({config: testConfig, logger: capture.logger, readiness, routes: [router]});
    return {app, state, readiness, ...capture};
}
