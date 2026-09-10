import type {ArticleLookup} from './content.dto'; import type {ArticleReader} from './ports/article-reader'; import type {Locale} from '../domain/article';
export async function getArticle(reader: ArticleReader, input: Readonly<{locale: Locale; slug: string}>): Promise<ArticleLookup | null> { return await reader.getBySlug(input); }
