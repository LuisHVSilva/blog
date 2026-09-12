import type {SeriesTranslation, SeriesTranslationProps} from '../entities/seriesTranslation';

export interface ISeriesTranslationRepository {
    find(filter: Partial<SeriesTranslationProps>, lock?: boolean): Promise<readonly SeriesTranslation[]>;
    save(entity: SeriesTranslation): Promise<void>;
    remove(filter: Partial<SeriesTranslationProps>): Promise<void>;
}
