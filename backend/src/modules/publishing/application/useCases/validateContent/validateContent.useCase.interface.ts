import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ParsedContent, ContentValidation} from '../../../domain/services/contentValidation.service';
export interface IValidateContentUseCase extends IUseCase<readonly ParsedContent[], ContentValidation> {}
