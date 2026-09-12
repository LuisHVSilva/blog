import type {Sequelize} from 'sequelize-typescript';
import {PersistenceContext} from '../persistence/ORM/context/persistenceContext';
import {UnitOfWork} from '../persistence/ORM/unitOfWork/unitOfWork';
import {ReadSnapshotUnitOfWork} from '../persistence/ORM/unitOfWork/readSnapshotUnitOfWork';
import {ArticlePersistence} from '../persistence/adapters/article.persistence';
import {ArticleTranslationPersistence} from '../persistence/adapters/articleTranslation.persistence';
import {PublicArticleQueryPersistence} from '../persistence/adapters/publicArticleQuery.persistence';
import {PublicTagPersistence} from '../persistence/adapters/publicTag.persistence';
import {PublicSeriesPersistence} from '../persistence/adapters/publicSeries.persistence';
import {AuthorProfilePersistence} from '../persistence/adapters/authorProfile.persistence';
import {TagPersistence} from '../persistence/adapters/tag.persistence';
import {TagTranslationPersistence} from '../persistence/adapters/tagTranslation.persistence';
import {SeriesDefinitionPersistence} from '../persistence/adapters/seriesDefinition.persistence';
import {SeriesTranslationPersistence} from '../persistence/adapters/seriesTranslation.persistence';
import {ArticleTagPersistence} from '../persistence/adapters/articleTag.persistence';
import {SeriesArticlePersistence} from '../persistence/adapters/seriesArticle.persistence';
import {PublicationEditionPersistence} from '../persistence/adapters/publicationEdition.persistence';
import {PublicationRevisionPersistence} from '../persistence/adapters/publicationRevision.persistence';
import {ArticlePathPersistence} from '../persistence/adapters/articlePath.persistence';
import {ArticleService} from '../../modules/publishing/domain/services/article.service';
import {TagService} from '../../modules/publishing/domain/services/tag.service';
import {SeriesService} from '../../modules/publishing/domain/services/series.service';
import {EditorialArticleService} from '../../modules/publishing/domain/services/editorialArticle.service';
import {EditorialTranslationService} from '../../modules/publishing/domain/services/editorialTranslation.service';
import {AuthorProfileService} from '../../modules/publishing/domain/services/authorProfile.service';
import {TagEditorialService} from '../../modules/publishing/domain/services/tagEditorial.service';
import {SeriesEditorialService} from '../../modules/publishing/domain/services/seriesEditorial.service';
import {CatalogService} from '../../modules/publishing/domain/services/catalog.service';
import {RevisionService} from '../../modules/publishing/domain/services/revision.service';
import {ArticlePathService} from '../../modules/publishing/domain/services/articlePath.service';
import {PublicationService} from '../../modules/publishing/domain/services/publication.service';
import {SnapshotService} from '../../modules/publishing/domain/services/snapshot.service';
import {ContentValidationService} from '../../modules/publishing/domain/services/contentValidation.service';
import {ImportContentUseCase} from '../../modules/publishing/application/useCases/importContent/importContent.useCase';
import {
    PublishArticleUseCase
} from '../../modules/publishing/application/useCases/publishArticle/publishArticle.useCase';
import {
    UnpublishArticleUseCase
} from '../../modules/publishing/application/useCases/unpublishArticle/unpublishArticle.useCase';
import {
    ArchiveArticleUseCase
} from '../../modules/publishing/application/useCases/archiveArticle/archiveArticle.useCase';
import {
    RestoreArticleUseCase
} from '../../modules/publishing/application/useCases/restoreArticle/restoreArticle.useCase';
import {
    ExportSnapshotUseCase
} from '../../modules/publishing/application/useCases/exportSnapshot/exportSnapshot.useCase';
import {
    ValidateContentUseCase
} from '../../modules/publishing/application/useCases/validateContent/validateContent.useCase';
import {ContentHashService} from '../../modules/publishing/adapters/content-revision';
import {EditorialClock} from './editorialClock';
import type {IEditorialClock} from '../../modules/publishing/domain/services/editorialRuntime.interface';
import {
    GetEditorialRevisionUseCase
} from '../../modules/publishing/application/useCases/getEditorialRevision/getEditorialRevision.useCase';

/**
 * Composes the write-side editorial use cases with persistence-backed domain services.
 */
export class EditorialComposition {
    /**
     * Creates a self-contained editorial command graph for a database connection.
     *
     * @param database - Sequelize connection used by repositories and transaction scopes.
     * @param siteOrigin - Canonical public-site origin used while producing content URLs.
     * @param clock - Clock injected by tests or operations that require deterministic audit dates.
     */
    static create(database: Sequelize, siteOrigin: string, clock: IEditorialClock = new EditorialClock()) {
        const context = new PersistenceContext();
        const article = new EditorialArticleService(new ArticlePersistence(database, context));
        const translation = new EditorialTranslationService(new ArticleTranslationPersistence(database, context));
        const authors = new AuthorProfileService(new AuthorProfilePersistence(database, context));
        const tags = new TagEditorialService(new TagPersistence(database, context), new TagTranslationPersistence(database, context));
        const series = new SeriesEditorialService(new SeriesDefinitionPersistence(database, context), new SeriesTranslationPersistence(database, context), new SeriesArticlePersistence(database, context));
        const catalogue = new CatalogService(authors, tags, series, article, translation, new ArticleTagPersistence(database, context));
        const revisions = new RevisionService(new PublicationRevisionPersistence(database, context), new PublicationEditionPersistence(database, context));
        const paths = new ArticlePathService(new ArticlePathPersistence(database, context));
        const validation = new ContentValidationService();
        const publication = new PublicationService(new UnitOfWork(database, context), article, translation, authors, catalogue, revisions, paths, validation, new ContentHashService(), clock);
        const publicArticles = new ArticleService(new PublicArticleQueryPersistence(database, siteOrigin, context));
        const publicTags = new TagService(new PublicTagPersistence(database, siteOrigin, context));
        const publicSeries = new SeriesService(new PublicSeriesPersistence(database, siteOrigin, context), publicArticles);
        const snapshot = new SnapshotService(new ReadSnapshotUnitOfWork(database, context), publicArticles, publicTags, publicSeries, revisions, paths, clock, siteOrigin);
        return {
            importContent: new ImportContentUseCase(publication),
            publishArticle: new PublishArticleUseCase(publication),
            unpublishArticle: new UnpublishArticleUseCase(publication),
            archiveArticle: new ArchiveArticleUseCase(publication),
            restoreArticle: new RestoreArticleUseCase(publication),
            exportSnapshot: new ExportSnapshotUseCase(snapshot),
            validateContent: new ValidateContentUseCase(validation),
            getRevision: new GetEditorialRevisionUseCase(revisions),
        };
    }
}
