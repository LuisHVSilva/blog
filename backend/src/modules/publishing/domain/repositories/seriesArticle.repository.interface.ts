import type {SeriesArticle, SeriesArticleProps} from '../entities/seriesArticle';
export interface ISeriesArticleRepository {
    find(filter: Partial<SeriesArticleProps>, lock?: boolean): Promise<readonly SeriesArticle[]>;
    save(entity: SeriesArticle): Promise<void>;
    remove(filter: Partial<SeriesArticleProps>): Promise<void>;
}
