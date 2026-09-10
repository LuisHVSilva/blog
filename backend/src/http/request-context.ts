import {randomUUID} from 'node:crypto';
import type {NextFunction, Request, Response} from 'express';
import {RequestContext} from '../infrastructure/logging/request-context';

export function readCorrelationId(value: unknown): string | undefined {
    return typeof value === 'string' && /^[A-Za-z0-9._-]{1,128}$/.test(value) ? value : undefined;
}

export function getRequestId(req: Request, res: Response): string {
    const requestId: string = readCorrelationId(res.locals.requestId) ?? readCorrelationId(req.header('x-request-id')) ?? randomUUID();
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    return requestId;
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId: string = getRequestId(req, res);
    const rawTraceId: string | undefined = req.header('x-trace-id');
    const traceId: string = rawTraceId === undefined ? requestId : readCorrelationId(rawTraceId) ?? randomUUID();
    RequestContext.run({requestId, traceId, method: req.method, path: 'unmatched'}, next);
}
