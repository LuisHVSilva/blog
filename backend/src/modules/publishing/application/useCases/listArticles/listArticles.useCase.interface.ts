import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ArticleListInput, ArticlePage} from '../../../domain/public-content.types';

export interface IListArticlesUseCase extends IUseCase<ArticleListInput, ArticlePage> {}
