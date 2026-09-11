import type {IValidateContentUseCase} from './validateContent.useCase.interface';
import type {IContentValidationService} from '../../../domain/services/contentValidation.service.interface';
import type {ParsedContent, ContentValidation} from '../../../domain/services/contentValidation.service';
export class ValidateContentUseCase implements IValidateContentUseCase {
    constructor(private readonly service: IContentValidationService) {}
    async execute(payload: readonly ParsedContent[]): Promise<ContentValidation> {
        return await this.service.validate(payload);
    }
}
