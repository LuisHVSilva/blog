import type {ErrorRequestHandler} from 'express';
import {ConnectionAcquireTimeoutError, ConnectionError} from 'sequelize';
import {ApplicationError} from '../shared/errors/application.error';
import type {ILogger} from '../infrastructures/logging/logger.interface';
import {LoggerContext} from '../infrastructures/logging/logger.context';
import {mapApplicationErrorStatus} from './error-status';
import {getRequestId} from './request-context';
import {HttpBoundaryError} from './http-error';
import {safelyLog} from './request-log';

function mapError(err: unknown) {
    if (err instanceof HttpBoundaryError) {
        return {status: err.status, code: err.code, message: err.message};
    }

    if (err instanceof Error) {
        const type: string | undefined = (err as Error & { type?: string }).type;
        if (type === 'entity.too.large') return {
            status: 413,
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request body is too large.'
        };
        if (type === 'entity.parse.failed') return {status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body.'};
        if (type === 'charset.unsupported' || type === 'encoding.unsupported') return {
            status: 415,
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Unsupported content type or encoding.'
        };
    }

    if (err instanceof ApplicationError) {
        const fields = err.fields?.slice(0, 32).filter((field) => /^[A-Za-z0-9_.\[\]-]{1,128}$/.test(field.path)).map((field) => ({
            path: field.path, code: /^[A-Z_a-z0-9-]{1,64}$/.test(field.code) ? field.code : 'INVALID_VALUE',
            message: 'Invalid value.',
        }));
        return {
            status: mapApplicationErrorStatus(err.kind),
            code: err.code,
            message: err.message, ...(fields?.length ? {fields} : {})
        };
    }

    if (err instanceof ConnectionError || err instanceof ConnectionAcquireTimeoutError) {
        return {status: 503, code: 'DEPENDENCY_UNAVAILABLE', message: 'A required dependency is unavailable.'};
    }

    return {status: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.'};
}

export function createErrorHandler(logger: ILogger): ErrorRequestHandler {
    return (err: unknown, req, res, next) => {
        if (res.headersSent) {
            next(err);
            return;
        }
        const {status, ...error} = mapError(err);
        const requestId: string = getRequestId(req, res);
        res.locals.errorCode = error.code;

        // Never serialize arbitrary exceptions, SQL, parser body or request data.
        safelyLog(() => logger.logError(new LoggerContext('HTTP', 'error'), 'Request failed.', undefined, {errorCode: error.code}, status));
        res.setHeader('Cache-Control', 'no-store');
        res.status(status).json({error, requestId});
    };
}
