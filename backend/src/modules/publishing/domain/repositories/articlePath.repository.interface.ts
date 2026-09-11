import type {ArticlePath, ArticlePathProps} from '../entities/articlePath';
export interface IArticlePathRepository {
    find(filter: Partial<ArticlePathProps>, lock?: boolean): Promise<readonly ArticlePath[]>;
    save(entity: ArticlePath): Promise<void>;
    remove(filter: Partial<ArticlePathProps>): Promise<void>;
}
