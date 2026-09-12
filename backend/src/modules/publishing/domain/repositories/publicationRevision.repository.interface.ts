import type {PublicationRevision, PublicationRevisionProps} from '../entities/publicationRevision';

export interface IPublicationRevisionRepository {
    find(filter: Partial<PublicationRevisionProps>, lock?: boolean): Promise<readonly PublicationRevision[]>;
    save(entity: PublicationRevision): Promise<void>;
    remove(filter: Partial<PublicationRevisionProps>): Promise<void>;
}
