import {Article, type ArticleProps} from '../../../modules/publishing/domain/article';
import type {ArticleModel} from '../ORM/models/article.model';

export class ArticlePersistenceMapper {
    static toEntity(model: ArticleModel): Article {
        return Article.rehydrate({
            id: model.id,
            sourceLocale: model.sourceLocale,
            authorId: model.authorId,
            difficulty: model.difficulty,
            createdAt: model.createdAt,
            archivedAt: model.archivedAt
        });
    }

    static toPersistence(entity: Article): ArticleProps {
        return entity.getProps();
    }
}
