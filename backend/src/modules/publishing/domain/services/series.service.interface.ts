import type {Locale} from '../publishing.types';
import type {SeriesDetail, SeriesSummary, SlugQuery} from '../public-content.types';

export interface ISeriesService {
    list(locale: Locale): Promise<readonly SeriesSummary[]>;
    getBySlug(input: SlugQuery): Promise<SeriesDetail | null>;
}
