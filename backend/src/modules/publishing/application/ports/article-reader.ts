import type {ArticleLookup, ArticlePage, PublicSnapshot, SeriesDetail, SeriesSummary, TagSummary} from '../content.dto';
import type {Difficulty, Locale} from '../../domain/article';

export interface ArticleReader {
    getBySlug(input: Readonly<{locale: Locale; slug: string}>): Promise<ArticleLookup | null>;
    list(input: Readonly<{locale: Locale; page: number; limit: number; tag?: string; series?: string; difficulty?: Difficulty; q?: string; sort?: 'publishedAt:asc' | 'publishedAt:desc'}>): Promise<ArticlePage>;
    listTags(locale: Locale): Promise<readonly TagSummary[]>;
    listSeries(locale: Locale): Promise<readonly SeriesSummary[]>;
    getSeries(input: Readonly<{locale: Locale; slug: string}>): Promise<SeriesDetail | null>;
    exportSnapshot(): Promise<PublicSnapshot>;
}
