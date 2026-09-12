import type {PublicationEditionProps} from '../entities/publicationEdition';
import type {PublicationRevisionProps} from '../entities/publicationRevision';

export interface IRevisionService {
    current(lock?: boolean): Promise<PublicationRevisionProps>;
    find(revision: string): Promise<PublicationEditionProps | null>;
    record(edition: PublicationEditionProps): Promise<void>;
}
