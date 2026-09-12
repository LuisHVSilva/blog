import express, {type ErrorRequestHandler, Express, type RequestHandler} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type {Config} from '../config/env';
import type {ILogger} from '../infrastructures/logging/logger.interface';
import {createCorsOptions} from './cors';
import {HttpBoundaryError} from './http-error';
import {requestContextMiddleware} from './request-context';
import {requestLog} from './request-log';
import {HealthRoutes} from './health.routes';
import type {Readiness} from '../infrastructures/readiness';
import {createErrorHandler} from './error-handler';

/**
 * Configures the Express HTTP boundary with security, observability, health, and error middleware.
 *
 * Registered routes are installed after common protections and before the JSON 404 handler.
 */
export function createApp({readiness, logger, config, routes = [], now}: {
    readiness: Readiness; logger: ILogger; config: Pick<Config, 'trustProxy' | 'corsOrigins'>;
    routes?: readonly RequestHandler[]; now?: () => number;
}): Express {
    const app: Express = express();
    app.disable('x-powered-by');

    app.set('trust proxy', config.trustProxy.length ? [...config.trustProxy] : false);

    app.use(requestContextMiddleware);
    app.use(requestLog(logger, now));
    app.use(helmet());
    app.use(cors(createCorsOptions(config)));
    app.use((req, _res, next) => {
        const query: number = req.originalUrl.indexOf('?');

        if (query >= 0 && Buffer.byteLength(req.originalUrl.slice(query + 1), 'utf8') > 2048) {
            return next(new HttpBoundaryError('QUERY_TOO_LARGE', 413, 'Query string is too large.'));
        }

        return next();
    });
    app.use(HealthRoutes.createHealthRouter(readiness));

    for (const router of routes) {
        app.use(router);
    }

    app.use((_req, _res, next) => next(new HttpBoundaryError('NOT_FOUND', 404, 'Resource not found.')));
    app.use(createErrorHandler(logger));

    const terminatePartialResponse: ErrorRequestHandler = (_error, _req, res, _next) => {
        res.destroy();
    };

    app.use(terminatePartialResponse);

    return app;
}

export {jsonMutation} from './json-mutation';
