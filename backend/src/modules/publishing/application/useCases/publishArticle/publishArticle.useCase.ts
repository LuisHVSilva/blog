import type {IPublishArticleUseCase} from './publishArticle.useCase.interface';
import type {IPublicationService} from '../../../domain/services/publication.service.interface';
import type {VisibilityInput, ImportResult} from '../../../domain/editorial.types';
export class PublishArticleUseCase implements IPublishArticleUseCase {
    constructor(private readonly service: IPublicationService) {}
    async execute(payload: VisibilityInput): Promise<ImportResult> {
        return await this.service.publish(payload);
    }
}
