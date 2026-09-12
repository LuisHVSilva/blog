import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {EditionInput, ImportResult} from '../../../domain/editorial.types';

export interface IImportContentUseCase extends IUseCase<EditionInput, ImportResult> {}
