import {Router} from 'express';

export interface Readiness {
    isStopping(): boolean;

    check(): Promise<boolean>;
}

export class HealthRoutes {
    static createReadiness(probe: () => Promise<unknown>, isStopping: () => boolean, timeoutMs = 1000): Readiness {
        let pending: Promise<boolean> | undefined;
        let expired: boolean = false;

        return {
            isStopping,
            async check(): Promise<boolean> {
                if (isStopping()) {
                    return false;
                }

                if (!pending) {
                    expired = false;
                    let timer: ReturnType<typeof setTimeout>;
                    const operation: Promise<boolean> = Promise.resolve().then(probe).then((): boolean => true, () => false);

                    const deadline = new Promise<boolean>((done): void => {
                        timer = setTimeout(() => {
                            expired = true;
                            done(false);
                        }, timeoutMs);
                    });

                    pending = Promise.race([operation, deadline]);

                    void operation.finally((): void => {
                        clearTimeout(timer);
                        pending = undefined;
                    });
                }

                if (expired) {
                    return false;
                }

                return await pending && !isStopping();
            },
        };
    }

    static createHealthRouter(readiness: Readiness): Router {
        const router: Router = Router();

        router.get('/health/live', (_req, res) => {
            res.setHeader('Cache-Control', 'no-store');
            res.json({status: 'UP'});
        });

        router.get('/health/ready', async (_req, res) => {
            const ready = !readiness.isStopping() && await readiness.check() && !readiness.isStopping();
            res.setHeader('Cache-Control', 'no-store');
            res.status(ready ? 200 : 503).json({status: ready ? 'UP' : 'DOWN'});
        });

        return router;
    }
}
