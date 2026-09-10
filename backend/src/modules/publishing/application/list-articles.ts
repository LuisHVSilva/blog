import type {ArticlePage} from './content.dto';
import type {ArticleReader} from './ports/article-reader';
import type {Difficulty, Locale} from '../domain/article';
import {PublishingValidationError} from './publishing.errors';

export async function listArticles(reader: ArticleReader, input: Readonly<{
    locale: Locale;
    page?: number;
    limit?: number;
    tag?: string;
    series?: string;
    difficulty?: Difficulty;
    q?: string;
    sort?: 'publishedAt:asc' | 'publishedAt:desc'
}>): Promise<ArticlePage> {
    if (input.page !== undefined && (!Number.isSafeInteger(input.page) || input.page < 1)) throw new PublishingValidationError('Invalid page.');
    if (input.limit !== undefined && (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 50)) throw new PublishingValidationError('Invalid limit.');
    return await reader.list({...input, page: input.page ?? 1, limit: input.limit ?? 20});
}
