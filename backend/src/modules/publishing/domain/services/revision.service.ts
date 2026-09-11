import type {IRevisionService} from './revision.service.interface';
import type {IPublicationEditionRepository} from '../repositories/publicationEdition.repository.interface';
import type {IPublicationRevisionRepository} from '../repositories/publicationRevision.repository.interface';
import {PublicationEdition, type PublicationEditionProps} from '../entities/publicationEdition';
import {PublicationRevision} from '../entities/publicationRevision';
export class RevisionService implements IRevisionService {
    constructor(private readonly revisions: IPublicationRevisionRepository, private readonly editions: IPublicationEditionRepository) {}
    async current(lock = false) {
        const row = (await this.revisions.find({singleton: true}, lock))[0];
        if (!row) throw new Error('Publication revision singleton is missing.');
        return row.toData();
    }
    async find(revision: string) { return (await this.editions.find({revision}))[0]?.toData() ?? null; }
    async record(edition: PublicationEditionProps): Promise<void> {
        await this.editions.save(new PublicationEdition(edition));
        await this.revisions.save(new PublicationRevision({singleton: true, revision: edition.revision, updatedAt: edition.appliedAt}));
    }
}
