import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ArchiveInput, ImportResult} from '../../../domain/editorial.types';

export interface IArchiveArticleUseCase extends IUseCase<ArchiveInput, ImportResult> {}
