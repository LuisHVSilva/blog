import type {IListTagsUseCase} from './listTags.useCase.interface';
import type {ITagService} from '../../../domain/services/tag.service.interface';

export class ListTagsUseCase implements IListTagsUseCase {
    constructor(private readonly service: ITagService) {}

    async execute(payload: Parameters<IListTagsUseCase['execute']>[0]) {
        return await this.service.list(payload.locale);
    }
}
