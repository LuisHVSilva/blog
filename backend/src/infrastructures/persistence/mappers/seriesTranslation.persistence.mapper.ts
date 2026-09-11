import {SeriesTranslation} from '../../../modules/publishing/domain/entities/seriesTranslation';
import type {SeriesTranslationModel} from '../ORM/models/seriesTranslation.model';
export class SeriesTranslationPersistenceMapper {
    static toEntity(row: SeriesTranslationModel): SeriesTranslation {
        return new SeriesTranslation({seriesId: row.seriesId, locale: row.locale, title: row.title, slug: row.slug, description: row.description, status: row.status, publishedOnce: row.publishedOnce});
    }
    static toPersistence(entity: SeriesTranslation) { return entity.toData(); }
}
