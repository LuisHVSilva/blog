import {SeriesArticle} from '../../../modules/publishing/domain/entities/seriesArticle';
import type {SeriesArticleModel} from '../ORM/models/seriesArticle.model';
export class SeriesArticlePersistenceMapper {
    static toEntity(row: SeriesArticleModel): SeriesArticle {
        return new SeriesArticle({seriesId: row.seriesId, articleId: row.articleId, position: row.position});
    }
    static toPersistence(entity: SeriesArticle) { return entity.toData(); }
}
