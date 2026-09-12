import type {IGetEditorialRevisionUseCase} from './getEditorialRevision.useCase.interface';
import type {IRevisionService} from '../../../domain/services/revision.service.interface';

export class GetEditorialRevisionUseCase implements IGetEditorialRevisionUseCase {
    constructor(private readonly service: IRevisionService) {}

    async execute() {
        return await this.service.current();
    }
}
