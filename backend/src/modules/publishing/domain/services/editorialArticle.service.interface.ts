import type {Article} from '../article';
export interface IEditorialArticleService {
    findById(id: string): Promise<Article | null>;
    save(entity: Article): Promise<Article>;
}
