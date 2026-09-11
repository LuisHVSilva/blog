import type {Locale} from '../article';
import type {PublishedSeries} from '../entities/publishedSeries';
export interface IPublicSeriesRepository {
    list(locale: Locale): Promise<readonly PublishedSeries[]>;
    countMembers(seriesId: string): Promise<number>;
}
