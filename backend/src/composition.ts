import {PublishingQueriesComposition} from './infrastructures/di/publishingQueries.composition';
import type {Express, RequestHandler} from 'express';
import type {Config} from './config/env';
import {createApp} from './http/app';
import {HealthRoutes, Readiness} from './http/health.routes';
import {Logger} from './infrastructures/logger';
import {Database} from './infrastructures/database';
import {ArticlesRouter} from './modules/publishing/adapters/http/articles.routes';

// export class Composition {
//     private readonly _config: Config;
//     private readonly _routes: RequestHandler[]
//
//     constructor(config: Config, routes: RequestHandler[]) {
//         this._config = config;
//         this._routes = routes;
//     }
//
//     createComposition() {
//         const state = {stopping: false};
//         const logger = new Logger({service: this._config.service});
//         const database = new Database(this._config.database);
//
//         const models = new Models(database.getSequelize());
//         models.registerEditorialModels();
//
//         const readiness: Readiness = HealthRoutes.createReadiness(() => database.checkReady(), () => state.stopping);
//         const app: Express = createApp({
//             config: this._config,
//             logger,
//             readiness,
//             routes: [...this._routes, createArticleRouter(articleReader)]
//         });
//
//         return {app, database, logger, state, readiness};
//     }
// }

export function createComposition(config: Config, routes: readonly RequestHandler[] = []) {
    const state = {stopping: false};
    const logger = new Logger({service: config.service});
    const database = new Database(config.database);


    const readiness: Readiness = HealthRoutes.createReadiness(() => database.checkReady(), () => state.stopping);
    const app: Express = createApp({
        config,
        logger,
        readiness,
        routes: [...routes, new ArticlesRouter(PublishingQueriesComposition.create(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, ''))).createRouter()]
    });

    return {app, database, logger, state, readiness};
}
