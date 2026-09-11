import type {ILogger} from './logging/logger.interface';
import {LoggerContext} from './logging/logger.context';

// Installed only by the process entrypoint; importing this module has no side effects.
export function installProcessHandlers(options: {
    logger: ILogger; markStopping(): void; shutdown(): Promise<void>; forceClose(): void;
    timeoutMs?: number;
}) {
    let pending: Promise<void> | undefined;
    let exitCode = 0;
    const terminate = (code: number): Promise<void> => {
        exitCode = Math.max(exitCode, code);
        process.exitCode = exitCode;
        options.markStopping();
        if (pending) return pending;
        const timer = setTimeout(() => {
            options.forceClose();
            process.exit(1);
        }, options.timeoutMs ?? 10_000);
        // Do not await the logger: rejected or hung logging cannot delay resource cleanup.
        try {
            void options.logger.logInfo(new LoggerContext('Process', 'shutdown'), 'Process stopping.', undefined, {fatal: exitCode === 1}).catch(() => undefined);
        } catch { /* The shutdown deadline remains active. */ }
        pending = Promise.resolve().then(options.shutdown).catch(() => { exitCode = 1; }).finally(() => {
            clearTimeout(timer);
            dispose();
            process.exit(exitCode);
        });
        return pending;
    };
    const signal = () => { void terminate(0); };
    const fatal = () => { void terminate(1); };
    const dispose = () => {
        process.off('SIGTERM', signal);
        process.off('SIGINT', signal);
        process.off('uncaughtException', fatal);
        process.off('unhandledRejection', fatal);
    };
    process.on('SIGTERM', signal);
    process.on('SIGINT', signal);
    process.on('uncaughtException', fatal);
    process.on('unhandledRejection', fatal);
    return {terminate, dispose};
}
