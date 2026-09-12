import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ImportResult, UnpublishInput} from '../../../domain/editorial.types';

export interface IUnpublishArticleUseCase extends IUseCase<UnpublishInput, ImportResult> {}
