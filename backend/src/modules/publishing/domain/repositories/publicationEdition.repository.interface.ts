import type {PublicationEdition, PublicationEditionProps} from '../entities/publicationEdition';

export interface IPublicationEditionRepository {
    find(filter: Partial<PublicationEditionProps>, lock?: boolean): Promise<readonly PublicationEdition[]>;
    save(entity: PublicationEdition): Promise<void>;
}
