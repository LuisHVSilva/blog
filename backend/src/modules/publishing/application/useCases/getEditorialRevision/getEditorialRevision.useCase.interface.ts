import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {PublicationRevisionProps} from '../../../domain/entities/publicationRevision';
export interface IGetEditorialRevisionUseCase extends IUseCase<void, PublicationRevisionProps> {}
