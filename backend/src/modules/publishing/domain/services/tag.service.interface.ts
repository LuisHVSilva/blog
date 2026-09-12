import type {Locale} from '../publishing.types';
import type {TagSummary} from '../public-content.types';

export interface ITagService {
    list(locale: Locale): Promise<readonly TagSummary[]>;
}
