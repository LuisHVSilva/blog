import type {EditionArticleInput} from '../editorial.types';

export interface IEditorialClock { now(): Date; }
export interface IContentHashService {
    hash(value: unknown): string;
    revision(item: Pick<EditionArticleInput, 'locale' | 'slug' | 'title' | 'description' | 'bodyMarkdown' | 'seo'>): string;
}
export interface IEditorialUnitOfWork { execute<T>(work: () => Promise<T>): Promise<T>; }
