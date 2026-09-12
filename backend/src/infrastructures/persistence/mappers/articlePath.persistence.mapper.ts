import {ArticlePath, type ArticlePathProps} from '../../../modules/publishing/domain/entities/articlePath';
import type {ArticlePathModel} from '../ORM/models/articlePath.model';

export class ArticlePathPersistenceMapper {
    static toEntity(row: ArticlePathModel): ArticlePath {
        return new ArticlePath({
            locale: row.locale,
            slug: row.slug,
            translationId: row.translationId,
            kind: row.kind
        });
    }

    static toPersistence(entity: ArticlePath): ArticlePathProps {
        return entity.toData();
    }
}
