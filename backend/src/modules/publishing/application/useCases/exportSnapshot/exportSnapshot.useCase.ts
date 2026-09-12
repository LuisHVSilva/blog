import type {IExportSnapshotUseCase} from './exportSnapshot.useCase.interface';
import type {ISnapshotService} from '../../../domain/services/snapshot.service.interface';
import type {PublicSnapshot} from '../../../domain/public-content.types';

export class ExportSnapshotUseCase implements IExportSnapshotUseCase {
    constructor(private readonly service: ISnapshotService) {}

    async execute(): Promise<PublicSnapshot> {
        return await this.service.export();
    }
}
