import type {ArticleTranslation} from '../entities/articleTranslation';
import type {Locale} from '../publishing.types';

export interface IArticleTranslationRepository {
    findById(id: string): Promise<ArticleTranslation | null>;

    findByArticleLocale(articleId: string, locale: Locale): Promise<ArticleTranslation | null>;

    listForArticle(articleId: string): Promise<readonly ArticleTranslation[]>;

    save(entity: ArticleTranslation): Promise<ArticleTranslation>;
}
