import type {EditionInput, ImportResult, Operator} from '../content.dto';

export interface PublicationStore {
    applyEdition(input: EditionInput): Promise<ImportResult>;
    publish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>): Promise<ImportResult>;
    unpublish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator; targetState: 'draft' | 'archived'}>): Promise<ImportResult>;
    archive(input: Readonly<{articleId: string; expectedRevision: string; operator: Operator; reason: string}>): Promise<ImportResult>;
    restore(input: Readonly<{articleId: string; locale?: string; expectedRevision: string; operator: Operator; reason: string; dryRun?: boolean}>): Promise<ImportResult>;
}
