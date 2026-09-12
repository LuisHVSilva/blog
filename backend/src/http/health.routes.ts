import {Router} from 'express';

import {type Readiness} from '../infrastructures/readiness';

export class HealthRoutes {
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
