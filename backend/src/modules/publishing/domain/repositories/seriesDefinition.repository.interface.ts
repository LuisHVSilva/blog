import type {SeriesDefinition, SeriesDefinitionProps} from '../entities/seriesDefinition';

export interface ISeriesDefinitionRepository {
    find(filter: Partial<SeriesDefinitionProps>, lock?: boolean): Promise<readonly SeriesDefinition[]>;
    save(entity: SeriesDefinition): Promise<void>;
    remove(filter: Partial<SeriesDefinitionProps>): Promise<void>;
}
