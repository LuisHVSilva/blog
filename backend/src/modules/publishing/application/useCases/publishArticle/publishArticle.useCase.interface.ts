import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {VisibilityInput, ImportResult} from '../../../domain/editorial.types';
export interface IPublishArticleUseCase extends IUseCase<VisibilityInput, ImportResult> {}
