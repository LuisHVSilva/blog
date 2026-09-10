import type {EditionInput, ImportResult} from './content.dto';
import type {PublicationStore} from './ports/publication-store';
export async function importContent(store: PublicationStore, input: EditionInput): Promise<ImportResult> { return await store.applyEdition(input); }
