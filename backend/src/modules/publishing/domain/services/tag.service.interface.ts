import type {Locale} from '../article';
import type {TagSummary} from '../public-content.types';
export interface ITagService { list(locale: Locale): Promise<readonly TagSummary[]>; }
