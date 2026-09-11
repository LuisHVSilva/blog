import type {Article} from '../article';

export interface IArticleRepository {
    findById(id: string): Promise<Article | null>;

    save(entity: Article): Promise<Article>;
}
