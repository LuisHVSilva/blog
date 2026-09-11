import type {Locale} from '../article';
import type {PublishedTag} from '../entities/publishedTag';
export interface IPublicTagRepository { list(locale: Locale): Promise<readonly PublishedTag[]>; }
