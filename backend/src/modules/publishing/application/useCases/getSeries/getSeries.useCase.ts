import type {IGetSeriesUseCase} from './getSeries.useCase.interface';
import type {ISeriesService} from '../../../domain/services/series.service.interface';

export class GetSeriesUseCase implements IGetSeriesUseCase {
    constructor(private readonly service: ISeriesService) {}

    async execute(payload: Parameters<IGetSeriesUseCase['execute']>[0]) {
        return await this.service.getBySlug(payload);
    }
}
