import type {EditionInput, ImportResult, VisibilityInput, UnpublishInput, ArchiveInput, RestoreInput} from '../editorial.types';
export interface IPublicationService {
    applyEdition(input: EditionInput): Promise<ImportResult>;
    publish(input: VisibilityInput): Promise<ImportResult>;
    unpublish(input: UnpublishInput): Promise<ImportResult>;
    archive(input: ArchiveInput): Promise<ImportResult>;
    restore(input: RestoreInput): Promise<ImportResult>;
}
