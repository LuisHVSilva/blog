import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ImportResult, RestoreInput} from '../../../domain/editorial.types';

export interface IRestoreArticleUseCase extends IUseCase<RestoreInput, ImportResult> {}
