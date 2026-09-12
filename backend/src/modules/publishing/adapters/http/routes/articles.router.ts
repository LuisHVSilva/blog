import {Router} from 'express';
import {ArticlesController} from '../controllers/articles.controller';

/** Resolves controllers supplied by the HTTP composition without coupling routes to use cases. */
export interface ControllerContainer {
    resolve<T>(token: Function & { prototype: T }): T;
}

/** Routes only declare HTTP endpoints; request handling belongs to ArticlesController. */
export function buildArticlesRouter(container: ControllerContainer): Router {
    const router: Router = Router();
    const controller: ArticlesController = container.resolve(ArticlesController);

    router.get('/api/v1/articles/by-slug/:locale/:slug', controller.getBySlug.bind(controller));
    router.get('/api/v1/articles', controller.list.bind(controller));
    router.get('/api/v1/tags', controller.listTags.bind(controller));
    router.get('/api/v1/series', controller.listSeries.bind(controller));
    router.get('/api/v1/series/by-slug/:locale/:slug', controller.getSeriesBySlug.bind(controller));

    return router;
}
