import {ArticlesController} from '../../modules/publishing/adapters/http/controllers/articles.controller';
import type {PublicUseCases} from '../../modules/publishing/application/public-use-cases';
import type {ControllerContainer} from '../../modules/publishing/adapters/http/routes/articles.router';

/** A small, per-composition container prevents HTTP adapters from reaching into use cases. */
export class PublishingHttpContainer implements ControllerContainer {
    private readonly articlesController: ArticlesController;

    constructor(useCases: PublicUseCases) {
        this.articlesController = new ArticlesController(useCases);
    }

    /** Resolves a controller explicitly registered for this HTTP composition. */
    resolve<T>(token: Function & { prototype: T }): T {
        if (token === (ArticlesController as unknown as Function & {
            prototype: T
        })) {
            return this.articlesController as T;
        }

        throw new Error(`HTTP controller is not registered: ${token.name}.`);
    }
}
