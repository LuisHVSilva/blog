import {Tag, type TagProps} from '../../../modules/publishing/domain/entities/tag';
import type {TagModel} from '../ORM/models/tag.model';

export class TagPersistenceMapper {
    static toEntity(row: TagModel): Tag {
        return new Tag({id: row.id, key: row.key, createdAt: row.createdAt});
    }

    static toPersistence(entity: Tag): TagProps {
        return entity.toData();
    }
}
