import type {IImportContentUseCase} from './importContent.useCase.interface';
import type {IPublicationService} from '../../../domain/services/publication.service.interface';
import type {EditionInput, ImportResult} from '../../../domain/editorial.types';

export class ImportContentUseCase implements IImportContentUseCase {
    constructor(private readonly service: IPublicationService) {}

    async execute(payload: EditionInput): Promise<ImportResult> {
        return await this.service.applyEdition(payload);
    }
}
