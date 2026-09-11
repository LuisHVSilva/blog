import {EntityBase} from '../../../../shared/domain/entity.base';
import type {TagSummary} from '../public-content.types';

export class PublishedTag extends EntityBase<TagSummary, PublishedTag> {
    constructor(props: TagSummary) { super(props); }
    protected recreate(props: TagSummary): PublishedTag { return new PublishedTag(props); }
}
