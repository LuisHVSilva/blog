import type {
    ArchiveInput,
    EditionInput,
    ImportResult,
    RestoreInput,
    UnpublishInput,
    VisibilityInput
} from '../editorial.types';

export interface IPublicationService {
    applyEdition(input: EditionInput): Promise<ImportResult>;
    publish(input: VisibilityInput): Promise<ImportResult>;
    unpublish(input: UnpublishInput): Promise<ImportResult>;
    archive(input: ArchiveInput): Promise<ImportResult>;
    restore(input: RestoreInput): Promise<ImportResult>;
}
