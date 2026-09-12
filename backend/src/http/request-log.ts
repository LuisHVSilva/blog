import {safelyLog} from '../infrastructures/logging/safely-log';
import type {RequestHandler} from 'express';
import type {ILogger} from '../infrastructures/logging/logger.interface';
import {LoggerContext} from '../infrastructures/logging/logger.context';
import {RequestContext, RequestLogContext} from '../infrastructures/logging/request-context';

export function requestLog(logger: ILogger, now: () => number = () => performance.now()): RequestHandler {
    return (req, res, next) => {
        const started: number = now();
        const context: RequestLogContext | undefined = RequestContext.get();
        let logged: boolean = false;

        const complete: () => void = (): void => {
            if (logged) return;
            logged = true;

            // Router-declared templates only: no originalUrl, baseUrl or parameter values.
            const route = typeof req.route?.path === 'string' ? req.route.path : 'unmatched';

            if (context) context.path = route;

            const write: () => void = (): void => safelyLog((): Promise<void> =>
                logger.logInfo(
                    new LoggerContext('HTTP', 'complete'),
                    'Request completed.',
                    res.statusCode,
                    {
                        method: req.method, route, status: res.statusCode,
                        durationMs: Math.max(0, now() - started), errorCode: res.locals.errorCode,
                    }));

            if (context) {
                RequestContext.run(context, write);
            } else {
                write();
            }
        };

        res.once('finish', complete);
        res.once('close', complete);
        next();
    };
}

export {safelyLog} from '../infrastructures/logging/safely-log';
