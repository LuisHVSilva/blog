import type {IListArticlesUseCase} from './listArticles.useCase.interface';
import type {IArticleService} from '../../../domain/services/article.service.interface';

export class ListArticlesUseCase implements IListArticlesUseCase {
    constructor(private readonly service: IArticleService) {}

    async execute(payload: Parameters<IListArticlesUseCase['execute']>[0]) {
        return await this.service.list(payload);
    }
}
