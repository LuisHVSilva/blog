import {createReadiness} from './infrastructures/readiness';
import {PublishingQueriesComposition} from './infrastructures/di/publishingQueries.composition';
import type {Express, RequestHandler, Router} from 'express';
import type {Config} from './config/env';
import {createApp} from './http/app';
import type {Readiness} from './infrastructures/readiness';
import {Logger} from './infrastructures/logger';
import {Database} from './infrastructures/database';
import {PublishingHttpContainer} from './infrastructures/di/publishingHttp.container';
import {buildArticlesRouter} from './modules/publishing/adapters/http/routes/articles.router';

/**
 * Builds the process-local HTTP application and its infrastructure dependencies.
 *
 * @param config - Validated runtime configuration.
 * @param routes - Additional routers installed before the public publishing routes.
 */
export function createComposition(config: Config, routes: readonly RequestHandler[] = []) {
    const state = {stopping: false};
    const logger = new Logger({service: config.service});
    const database = new Database(config.database);


    const readiness: Readiness = createReadiness(() => database.checkReady(), () => state.stopping);
    const articleRoute: Router = buildArticlesRouter(new PublishingHttpContainer(PublishingQueriesComposition.create(
        database.getSequelize(),
        config.publicSiteUrl.replace(/\/$/u, '')
    )));

    const app: Express = createApp({
        config,
        logger,
        readiness,
        routes: [
            ...routes,
            articleRoute
        ]
    });

    return {app, database, logger, state, readiness};
}
