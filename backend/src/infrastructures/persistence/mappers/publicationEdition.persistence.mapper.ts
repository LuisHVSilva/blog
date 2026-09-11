import {PublicationEdition} from '../../../modules/publishing/domain/entities/publicationEdition';
import type {PublicationEditionModel} from '../ORM/models/publicationEdition.model';
export class PublicationEditionPersistenceMapper {
    static toEntity(row: PublicationEditionModel): PublicationEdition {
        return new PublicationEdition({revision: row.revision, contentHash: row.contentHash, gitCommit: row.gitCommit, actorId: row.actorId, appliedAt: row.appliedAt, report: row.report});
    }
    static toPersistence(entity: PublicationEdition) { return entity.toData(); }
}
