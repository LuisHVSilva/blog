import {Router} from 'express';
import {createComposition} from '../../src/composition';
import {startApplication} from '../../src/main';
import {loadConfig} from '../../src/config/env';

async function fixture() {
    const router = Router();
    let release!: () => void;
    const waiting = new Promise<void>((done) => {
        release = done;
    });
    router.get('/slow', async (_req, res) => {
        process.send?.({event: 'request-started'});
        await waiting;
        await components.database.getSequelize().query('SELECT 1');
        res.json({drained: true});
    });
    router.get('/partial', (_req, res, next) => {
        res.write('partial');
        next(new Error('private-partial-error'));
    });
    const config = {...loadConfig(process.env), port: Number(process.env.FIXTURE_PORT ?? 0)};
    const components = createComposition(config, [router]);
    const disconnect = components.database.disconnect.bind(components.database);
    components.database.disconnect = async () => {
        if (process.env.FIXTURE_HANG === 'true') await new Promise(() => undefined);
        await disconnect();
        process.send?.({event: 'pool-closed'});
    };
    if (process.env.FIXTURE_LOG_FAIL === 'true') components.logger.logInfo = async () => {
        throw new Error('private-logger-error');
    };
    process.on('message', (message) => {
        if (message === 'release') release();
        if (message === 'signal') process.emit('SIGTERM'); // Windows lacks POSIX signal delivery.
        if (message === 'interrupt') process.emit('SIGINT');
        if (message === 'fatal') setImmediate(() => {
            throw new Error('private-fatal-error');
        });
        if (message === 'rejection') void Promise.reject(new Error('private-rejection-error'));
    });
    const running = await startApplication(config, components, Number(process.env.FIXTURE_DEADLINE ?? 10000));
    // Registered after the runtime handlers: this acknowledges that the signal was processed.
    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
        process.on(signal, () => process.send?.({event: 'state', stopping: components.state.stopping}));
    }
    const address = running.server.address();
    process.send?.({event: 'ready', port: typeof address === 'object' ? address?.port : undefined});
}

void fixture();
