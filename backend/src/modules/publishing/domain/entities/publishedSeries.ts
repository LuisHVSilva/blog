import {EntityBase} from '../../../../shared/domain/entity.base';
import type {SeriesSummary} from '../public-content.types';

export class PublishedSeries extends EntityBase<SeriesSummary, PublishedSeries> {
    constructor(props: SeriesSummary) {
        super(props);
    }

    protected recreate(props: SeriesSummary): PublishedSeries {
        return new PublishedSeries(props);
    }
}
