import type {Locale} from '../article';
import type {SeriesSummary, SeriesDetail, SlugQuery} from '../public-content.types';
export interface ISeriesService {
    list(locale: Locale): Promise<readonly SeriesSummary[]>;
    getBySlug(input: SlugQuery): Promise<SeriesDetail | null>;
}
