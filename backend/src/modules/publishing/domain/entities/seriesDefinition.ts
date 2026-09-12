import {EntityAuditBase} from '../../../../shared/domain/entity-audit.base';
import type {Difficulty, TranslationStatus} from '../publishing.types';

export type SeriesDefinitionProps = Readonly<{
    id: string;
    key: string;
    difficulty: Difficulty | null;
    status: TranslationStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export class SeriesDefinition extends EntityAuditBase<SeriesDefinitionProps, SeriesDefinition> {
    constructor(props: SeriesDefinitionProps) {
        super(props);
        Object.freeze(this);
    }

    protected recreate(props: SeriesDefinitionProps): SeriesDefinition {
        return new SeriesDefinition(props);
    }

    toData(): SeriesDefinitionProps {
        const props = this.getProps();
        return {
            id: props.id,
            key: props.key,
            difficulty: props.difficulty,
            status: props.status,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        };
    }
}
