import type {IEditorialArticleService} from './editorialArticle.service.interface';
import type {IArticleRepository} from '../repositories/article.repository.interface';
import {Article} from '../article';
import {EditorialRules} from '../editorial-rules';
import {PublishingValidationError} from '../publishing.errors';

export class EditorialArticleService implements IEditorialArticleService {
    constructor(private readonly repository: IArticleRepository) {}

    async findById(id: string) {
        if (!EditorialRules.isUuid(id)) throw new PublishingValidationError('Invalid entity ID.');
        return await this.repository.findById(id);
    }

    async save(entity: Article) { return await this.repository.save(Article.rehydrate(entity.getProps())); }
}
