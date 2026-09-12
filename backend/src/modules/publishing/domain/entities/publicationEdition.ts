import { EntityBase } from '../../../../shared/domain/entity.base';

export type PublicationEditionProps = Readonly<{
    revision: string;
    contentHash: string;
    gitCommit: string;
    actorId: string;
    appliedAt: Date;
    report: Record<string, unknown>;
}>;
export class PublicationEdition extends EntityBase<PublicationEditionProps & {readonly id: string}, PublicationEdition> {
    constructor(props: PublicationEditionProps) {
        super({ ...props, id: JSON.stringify([props.revision]) });
        Object.freeze(this);
    }

    protected recreate(props: PublicationEditionProps): PublicationEdition {
        return new PublicationEdition(props);
    }

    toData(): PublicationEditionProps {
        const props = this.getProps();
        return {
            revision: props.revision,
            contentHash: props.contentHash,
            gitCommit: props.gitCommit,
            actorId: props.actorId,
            appliedAt: props.appliedAt,
            report: props.report
        };
    }
}
