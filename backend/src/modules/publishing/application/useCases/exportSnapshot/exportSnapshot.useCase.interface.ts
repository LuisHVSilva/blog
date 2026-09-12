import type {IUseCase} from '../../../../../shared/interfaces/useCase.interface';
import type {PublicSnapshot} from '../../../domain/public-content.types';

export interface IExportSnapshotUseCase extends IUseCase<void, PublicSnapshot> {}
