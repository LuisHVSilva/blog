import {Router} from 'express';
import {loadConfig} from '../../src/config/env';
import {createApp, jsonMutation} from '../../src/http/app';
import {HealthRoutes} from '../../src/http/health.routes';
import {LogFormatter} from '../../src/infrastructure/logging/formatter';
import type {ILogger} from '../../src/infrastructure/logging/logger.interface';
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

export function captureLogger() {
    const records: Record<string, unknown>[] = [];
    const formatter = new LogFormatter();
    const logger: ILogger = {
        async logInfo(context, message, status, info) {
            records.push(JSON.parse(formatter.format('INFO', context.className, context.method, message, status, info)));
        },
        async logWarn(context, message, status, info) {
            records.push(JSON.parse(formatter.format('WARN', context.className, context.method, message, status, info)));
        },
        async logError(context, message, _stack, info, status) {
            records.push(JSON.parse(formatter.format('ERROR', context.className, context.method, message, status, info)));
        },
        async logException(context, error, info, status) {
            records.push(JSON.parse(formatter.format('ERROR', context.className, context.method, error.message, status, info)));
        },
    };
    return {logger, records};
}

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
    const readiness = HealthRoutes.createReadiness(async () => undefined, () => state.stopping);
    const app = createApp({config: testConfig, logger: capture.logger, readiness, routes: [router]});
    return {app, state, readiness, ...capture};
}
