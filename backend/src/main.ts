import {createServer} from 'node:http';
import {ConnectionAcquireTimeoutError, ConnectionError} from 'sequelize';
import {type Config, loadConfig, loadEnvironment} from './config/env';
import {createComposition} from './composition';
import {installProcessHandlers} from './infrastructures/process-handlers';
import {LoggerContext} from './infrastructures/logging/logger.context';
import {safelyLog} from './http/request-log';
import {ConfigurationError} from "./shared/errors/configuration.error";

export async function startApplication(config: Config, components = createComposition(config), timeoutMs = 10_000) {
    const {app, database, logger, state} = components;
    const server = createServer(app);
    let closing: Promise<void> | undefined;

    const shutdown = (): Promise<void> => closing ??= (async (): Promise<undefined> => {
        // Signals during connect/listen must not allow a listener to appear after cleanup.
        await starting.catch(() => undefined);

        try {
            if (server.listening) await new Promise<void>((done, reject) => {
                server.close((error) => error ? reject(error) : done());
                server.closeIdleConnections();
            });
        } finally {
            await database.disconnect();
        }
    })();

    const handlers = installProcessHandlers({
        logger, markStopping: () => {
            state.stopping = true;
        },
        shutdown, forceClose: () => server.closeAllConnections(), timeoutMs,
    });

    const starting: Promise<void> = (async (): Promise<void> => {
        await database.connect();

        if (state.stopping) {
            return;
        }

        await new Promise<void>((done, reject): void => {
            const listening = () => {
                server.off('error', failed);
                done();
            };
            const failed = (error: Error) => {
                server.off('listening', listening);
                reject(error);
            };
            server.once('error', failed);
            server.once('listening', listening);
            server.listen(config.port);
        });
    })();

    try {
        await starting;

        server.on('error', () => {
            void handlers.terminate(1);
        });

        if (!state.stopping) {
            safelyLog(() => logger.logInfo(new LoggerContext('Process', 'start'), 'Server listening.'));
        }

        return {server, ...components, handlers};
    } catch (error) {
        const errorCode: string =
            error instanceof ConnectionError || error instanceof ConnectionAcquireTimeoutError
                ? 'DEPENDENCY_UNAVAILABLE' : 'STARTUP_FAILED';

        safelyLog(() => logger.logError(new LoggerContext('Process', 'start'), 'Startup failed.', undefined, {errorCode}));

        await handlers.terminate(1);

        throw new Error('Startup failed.'); // terminate exits; preserves the rejection contract for instrumentation.
    }
}

export async function main(): Promise<void> {
    try {
        await startApplication(loadConfig(loadEnvironment()));
    } catch (error) {
        console.error(JSON.stringify({
            error: {
                code: error instanceof ConfigurationError ? 'CONFIG_INVALID' : 'STARTUP_FAILED',
                ...(error instanceof ConfigurationError ? {fields: error.fields} : {})
            }
        }));
        process.exitCode = 1;
    }
}

if (require.main === module) void main();
