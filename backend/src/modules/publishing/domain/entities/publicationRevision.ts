import {EntityAuditBase} from '../../../../shared/domain/entity-audit.base';

export type PublicationRevisionProps = Readonly<{singleton: boolean; revision: string | null; updatedAt: Date}>;
export class PublicationRevision extends EntityAuditBase<PublicationRevisionProps & {readonly id: string}, PublicationRevision> {
    constructor(props: PublicationRevisionProps) { super({...props, id: JSON.stringify([props.singleton])}); Object.freeze(this); }
    protected recreate(props: PublicationRevisionProps): PublicationRevision { return new PublicationRevision(props); }
    toData(): PublicationRevisionProps {
        const props = this.getProps();
        return {singleton: props.singleton, revision: props.revision, updatedAt: props.updatedAt};
    }
}
