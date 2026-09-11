import {SeriesDefinition} from '../../../modules/publishing/domain/entities/seriesDefinition';
import type {SeriesModel} from '../ORM/models/series.model';
export class SeriesDefinitionPersistenceMapper {
    static toEntity(row: SeriesModel): SeriesDefinition {
        return new SeriesDefinition({id: row.id, key: row.key, difficulty: row.difficulty, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt});
    }
    static toPersistence(entity: SeriesDefinition) { return entity.toData(); }
}
