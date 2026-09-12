import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {ArticleLookup, SlugQuery} from '../../../domain/public-content.types';

export interface IGetArticleUseCase extends IUseCase<SlugQuery, ArticleLookup | null> {}
