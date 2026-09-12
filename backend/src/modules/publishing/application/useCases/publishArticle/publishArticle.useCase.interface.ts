import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ImportResult, VisibilityInput} from '../../../domain/editorial.types';

export interface IPublishArticleUseCase extends IUseCase<VisibilityInput, ImportResult> {}
