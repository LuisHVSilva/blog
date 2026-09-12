import {LogFormatter} from '../../src/infrastructures/logging/formatter';
import type {ILogger} from '../../src/infrastructures/logging/logger.interface';

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
