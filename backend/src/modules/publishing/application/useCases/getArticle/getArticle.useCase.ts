import type {IGetArticleUseCase} from './getArticle.useCase.interface';
import type {IArticleService} from '../../../domain/services/article.service.interface';

export class GetArticleUseCase implements IGetArticleUseCase {
    constructor(private readonly service: IArticleService) {}
    async execute(payload: Parameters<IGetArticleUseCase['execute']>[0]) {
        return await this.service.getBySlug(payload);
    }
}
