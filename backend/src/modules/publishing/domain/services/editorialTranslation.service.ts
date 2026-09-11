import type {IEditorialTranslationService} from './editorialTranslation.service.interface';
import type {IArticleTranslationRepository} from '../repositories/articleTranslation.repository.interface';
import {ArticleTranslation, EditorialRules, type Locale} from '../article';
import {PublishingValidationError} from '../publishing.errors';
export class EditorialTranslationService implements IEditorialTranslationService {
    constructor(private readonly repository: IArticleTranslationRepository) {}
    async findById(id: string) {
        if (!EditorialRules.isUuid(id)) throw new PublishingValidationError('Invalid entity ID.');
        return await this.repository.findById(id);
    }
    async save(entity: ArticleTranslation) { return await this.repository.save(ArticleTranslation.rehydrate(entity.getProps())); }
    async findByArticleLocale(articleId: string, locale: Locale) {
        if (!EditorialRules.isLocale(locale)) throw new PublishingValidationError('Translation locale is not supported.');
        return await this.repository.findByArticleLocale(articleId, locale);
    }
    async listForArticle(articleId: string) { return await this.repository.listForArticle(articleId); }
}
