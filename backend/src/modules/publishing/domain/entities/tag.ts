import {EntityAuditBase} from '../../../../shared/domain/entity-audit.base';

export type TagProps = Readonly<{id: string; key: string; createdAt: Date}>;
export class Tag extends EntityAuditBase<TagProps, Tag> {
    constructor(props: TagProps) { super(props); Object.freeze(this); }
    protected recreate(props: TagProps): Tag { return new Tag(props); }
    toData(): TagProps {
        const props = this.getProps();
        return {id: props.id, key: props.key, createdAt: props.createdAt};
    }
}
