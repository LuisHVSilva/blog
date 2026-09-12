import type {IValidateContentUseCase} from './validateContent.useCase.interface';
import type {IContentValidationService} from '../../../domain/services/contentValidation.service.interface';
import type {ContentValidation, ParsedContent} from '../../../domain/content-validation.types';

export class ValidateContentUseCase implements IValidateContentUseCase {
    constructor(private readonly service: IContentValidationService) {}

    async execute(payload: readonly ParsedContent[]): Promise<ContentValidation> {
        return this.service.validate(payload);
    }
}
