import {RequestContext} from './request-context';
import {redactSensitive} from './redact-sensitive';

const allowedDetails = ['method', 'route', 'status', 'durationMs', 'errorCode', 'fatal', 'signal'] as const;
export class LogFormatter {
    public format(level: string, className: string, method: string, message: string, httpStatus?: number, info?: unknown, service = 'blog-api'): string {
        const request = RequestContext.get();
        const details: Record<string, unknown> = {};
        if (info && typeof info === 'object') for (const key of allowedDetails) {
            const value = (info as Record<string, unknown>)[key];
            if (['string', 'number', 'boolean'].includes(typeof value)) details[key] = redactSensitive(value);
        }
        const entry = {
            timestamp: new Date().toISOString(), level, service, stage: `${className}.${method}`,
            requestId: request?.requestId ?? 'system', traceId: request?.traceId ?? request?.requestId ?? 'system',
            message: redactSensitive(message), ...(httpStatus ? {httpStatus} : {}),
            ...(request ? {request: {method: request.method, route: request.path}} : {}),
            ...(Object.keys(details).length ? {details} : {}),
        };
        return `${JSON.stringify(entry)}\n`;
    }
}
