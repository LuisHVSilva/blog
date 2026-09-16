import type {IListArticlesUseCase} from './useCases/listArticles/listArticles.useCase.interface';
import type {IGetArticleUseCase} from './useCases/getArticle/getArticle.useCase.interface';
import type {IListTagsUseCase} from './useCases/listTags/listTags.useCase.interface';
import type {IListSeriesUseCase} from './useCases/listSeries/listSeries.useCase.interface';
import type {IGetSeriesUseCase} from './useCases/getSeries/getSeries.useCase.interface';
import type {ProjectService} from '../domain/services/project.service';

/** Public query operations exposed to HTTP adapters by the publishing application. */
export type PublicUseCases = Readonly<{
    listArticles: IListArticlesUseCase;
    getArticle: IGetArticleUseCase;
    listTags: IListTagsUseCase;
    listSeries: IListSeriesUseCase;
    getSeries: IGetSeriesUseCase;
    projects: ProjectService;
}>;
