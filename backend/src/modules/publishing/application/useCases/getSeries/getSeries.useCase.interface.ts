import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {SlugQuery, SeriesDetail} from '../../../domain/public-content.types';

export interface IGetSeriesUseCase extends IUseCase<SlugQuery, SeriesDetail | null> {}
