import express, {type ErrorRequestHandler, Express, type RequestHandler} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type {Config} from '../config/env';
import type {ILogger} from '../infrastructure/logging/logger.interface';
import {createCorsOptions} from './cors';
import {HttpBoundaryError} from './http-error';
import {requestContextMiddleware} from './request-context';
import {requestLog} from './request-log';
import {HealthRoutes, type Readiness} from './health.routes';
import {createErrorHandler} from './error-handler';

export const jsonMutation: RequestHandler[] = [
    (req, _res, next) => {
        if (!req.is('application/json')) {
            next(new HttpBoundaryError('UNSUPPORTED_MEDIA_TYPE', 415, 'Content-Type must be application/json.'));
        }

        return next();
    },
    express.json({limit: 16 * 1024, strict: true, inflate: false}),
];

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
