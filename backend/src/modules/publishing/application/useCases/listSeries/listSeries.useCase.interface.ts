import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {SeriesSummary} from '../../../domain/public-content.types';
import type {Locale} from '../../../domain/article';

export interface IListSeriesUseCase extends IUseCase<Readonly<{locale: Locale}>, readonly SeriesSummary[]> {}
