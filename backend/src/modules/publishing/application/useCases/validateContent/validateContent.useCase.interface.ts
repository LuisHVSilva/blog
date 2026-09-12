import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ContentValidation, ParsedContent} from '../../../domain/content-validation.types';

export interface IValidateContentUseCase extends IUseCase<readonly ParsedContent[], ContentValidation> {}
