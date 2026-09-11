import type {ArticleTag, ArticleTagProps} from '../entities/articleTag';
export interface IArticleTagRepository {
    find(filter: Partial<ArticleTagProps>, lock?: boolean): Promise<readonly ArticleTag[]>;
    save(entity: ArticleTag): Promise<void>;
    remove(filter: Partial<ArticleTagProps>): Promise<void>;
}
