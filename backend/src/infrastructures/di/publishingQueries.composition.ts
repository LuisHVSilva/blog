import type {Sequelize, Transaction} from 'sequelize';
import {PublicArticleQueryPersistence} from '../persistence/adapters/publicArticleQuery.persistence';
import {PublicTagPersistence} from '../persistence/adapters/publicTag.persistence';
import {PublicSeriesPersistence} from '../persistence/adapters/publicSeries.persistence';
import {ArticleService} from '../../modules/publishing/domain/services/article.service';
import {TagService} from '../../modules/publishing/domain/services/tag.service';
import {SeriesService} from '../../modules/publishing/domain/services/series.service';
import type {PublicUseCases} from '../../modules/publishing/application/public-use-cases';
import {ListArticlesUseCase} from '../../modules/publishing/application/useCases/listArticles/listArticles.useCase';
import {GetArticleUseCase} from '../../modules/publishing/application/useCases/getArticle/getArticle.useCase';
import {ListTagsUseCase} from '../../modules/publishing/application/useCases/listTags/listTags.useCase';
import {ListSeriesUseCase} from '../../modules/publishing/application/useCases/listSeries/listSeries.useCase';
import {GetSeriesUseCase} from '../../modules/publishing/application/useCases/getSeries/getSeries.useCase';

/** Explicit constructor injection: one graph per connection, no global service locator. */
export class PublishingQueriesComposition {
    /**
     * Creates the read-side use cases, optionally pinned to an existing consistent snapshot.
     */
    static create(sequelize: Sequelize, siteOrigin: string, transaction?: Transaction): PublicUseCases {
        const articles = new ArticleService(new PublicArticleQueryPersistence(sequelize, siteOrigin, transaction));
        const tags = new TagService(new PublicTagPersistence(sequelize, siteOrigin, transaction));
        const series = new SeriesService(new PublicSeriesPersistence(sequelize, siteOrigin, transaction), articles);

        return {
            listArticles: new ListArticlesUseCase(articles), getArticle: new GetArticleUseCase(articles),
            listTags: new ListTagsUseCase(tags), listSeries: new ListSeriesUseCase(series), getSeries: new GetSeriesUseCase(series),
        };
    }
}
