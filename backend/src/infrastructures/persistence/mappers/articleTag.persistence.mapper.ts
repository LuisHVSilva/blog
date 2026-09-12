import {ArticleTag, type ArticleTagProps} from '../../../modules/publishing/domain/entities/articleTag';
import type {ArticleTagModel} from '../ORM/models/articleTag.model';

export class ArticleTagPersistenceMapper {
    static toEntity(row: ArticleTagModel): ArticleTag {
        return new ArticleTag({articleId: row.articleId, tagId: row.tagId});
    }

    static toPersistence(entity: ArticleTag): ArticleTagProps {
        return entity.toData();
    }
}
