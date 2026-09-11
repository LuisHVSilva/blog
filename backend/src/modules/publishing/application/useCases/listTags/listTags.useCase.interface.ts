import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {TagSummary} from '../../../domain/public-content.types';
import type {Locale} from '../../../domain/article';

export interface IListTagsUseCase extends IUseCase<Readonly<{locale: Locale}>, readonly TagSummary[]> {}
