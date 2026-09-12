import type {IListSeriesUseCase} from './listSeries.useCase.interface';
import type {ISeriesService} from '../../../domain/services/series.service.interface';

export class ListSeriesUseCase implements IListSeriesUseCase {
    constructor(private readonly service: ISeriesService) {}

    async execute(payload: Parameters<IListSeriesUseCase['execute']>[0]) {
        return await this.service.list(payload.locale);
    }
}
