import type {IRestoreArticleUseCase} from './restoreArticle.useCase.interface';
import type {IPublicationService} from '../../../domain/services/publication.service.interface';
import type {ImportResult, RestoreInput} from '../../../domain/editorial.types';

export class RestoreArticleUseCase implements IRestoreArticleUseCase {
    constructor(private readonly service: IPublicationService) {}

    async execute(payload: RestoreInput): Promise<ImportResult> {
        return await this.service.restore(payload);
    }
}
