import {TagTranslation, type TagTranslationProps} from '../../../modules/publishing/domain/entities/tagTranslation';
import type {TagTranslationModel} from '../ORM/models/tagTranslation.model';

export class TagTranslationPersistenceMapper {
    static toEntity(row: TagTranslationModel): TagTranslation {
        return new TagTranslation({
            tagId: row.tagId,
            locale: row.locale,
            name: row.name,
            slug: row.slug,
            description: row.description,
            status: row.status,
            publishedOnce: row.publishedOnce
        });
    }

    static toPersistence(entity: TagTranslation): TagTranslationProps {
        return entity.toData();
    }
}
