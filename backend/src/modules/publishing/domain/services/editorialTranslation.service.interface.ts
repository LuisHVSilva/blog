import type {ArticleTranslation} from '../entities/articleTranslation';
import type {Locale} from '../publishing.types';

export interface IEditorialTranslationService {
    findById(id: string): Promise<ArticleTranslation | null>;
    save(entity: ArticleTranslation): Promise<ArticleTranslation>;
    findByArticleLocale(articleId: string, locale: Locale): Promise<ArticleTranslation | null>;
    listForArticle(articleId: string): Promise<readonly ArticleTranslation[]>;
}
