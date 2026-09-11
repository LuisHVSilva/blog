import type {IUnpublishArticleUseCase} from './unpublishArticle.useCase.interface';
import type {IPublicationService} from '../../../domain/services/publication.service.interface';
import type {UnpublishInput, ImportResult} from '../../../domain/editorial.types';
export class UnpublishArticleUseCase implements IUnpublishArticleUseCase {
    constructor(private readonly service: IPublicationService) {}
    async execute(payload: UnpublishInput): Promise<ImportResult> {
        return await this.service.unpublish(payload);
    }
}
