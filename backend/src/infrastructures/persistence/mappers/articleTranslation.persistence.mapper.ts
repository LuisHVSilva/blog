import {
    ArticleTranslation,
    type ArticleTranslationProps
} from '../../../modules/publishing/domain/entities/articleTranslation';
import type {ArticleTranslationModel} from '../ORM/models/articleTranslation.model';

export class ArticleTranslationPersistenceMapper {
    static toEntity(model: ArticleTranslationModel): ArticleTranslation {
        return ArticleTranslation.rehydrate({
            id: model.id,
            articleId: model.articleId,
            locale: model.locale,
            slug: model.slug,
            title: model.title,
            description: model.description,
            bodyMarkdown: model.bodyMarkdown,
            status: model.status,
            publishedAt: model.publishedAt,
            updatedAt: model.updatedAt,
            sourceRevision: model.sourceRevision,
            translatedFromRevision: model.translatedFromRevision,
            readingMinutes: model.readingMinutes,
            seo: model.seo
        });
    }

    static toPersistence(entity: ArticleTranslation): ArticleTranslationProps {
        return entity.getProps();
    }
}
