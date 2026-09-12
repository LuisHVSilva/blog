import {
    PublicationRevision,
    type PublicationRevisionProps
} from '../../../modules/publishing/domain/entities/publicationRevision';
import type {PublicationCurrentRevisionModel} from '../ORM/models/publicationCurrentRevision.model';

export class PublicationRevisionPersistenceMapper {
    static toEntity(row: PublicationCurrentRevisionModel): PublicationRevision {
        return new PublicationRevision({
            singleton: row.singleton,
            revision: row.revision,
            updatedAt: row.updatedAt
        });
    }

    static toPersistence(entity: PublicationRevision): PublicationRevisionProps {
        return entity.toData();
    }
}
