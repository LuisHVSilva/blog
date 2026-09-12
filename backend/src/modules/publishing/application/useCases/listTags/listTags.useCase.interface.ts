import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {TagSummary} from '../../../domain/public-content.types';
import type {Locale} from '../../../domain/publishing.types';

export interface IListTagsUseCase extends IUseCase<Readonly<{locale: Locale}>, readonly TagSummary[]> {}
