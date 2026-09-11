import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {RestoreInput, ImportResult} from '../../../domain/editorial.types';
export interface IRestoreArticleUseCase extends IUseCase<RestoreInput, ImportResult> {}
