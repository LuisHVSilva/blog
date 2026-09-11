import type {IArchiveArticleUseCase} from './archiveArticle.useCase.interface';
import type {IPublicationService} from '../../../domain/services/publication.service.interface';
import type {ArchiveInput, ImportResult} from '../../../domain/editorial.types';
export class ArchiveArticleUseCase implements IArchiveArticleUseCase {
    constructor(private readonly service: IPublicationService) {}
    async execute(payload: ArchiveInput): Promise<ImportResult> {
        return await this.service.archive(payload);
    }
}
