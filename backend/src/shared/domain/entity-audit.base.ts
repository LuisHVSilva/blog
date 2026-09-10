import {EntityBase} from './entity.base';

export type AuditProps = Readonly<{createdAt?: Date; updatedAt?: Date; createdBy?: string; updatedBy?: string}>;

/** Audit values are supplied explicitly; there is no ambient clock or actor. */
export abstract class EntityAuditBase<T extends {readonly id: string} & AuditProps, TEntity> extends EntityBase<T, TEntity> {
    protected constructor(props: T) {
        super(props);
        for (const date of [props.createdAt, props.updatedAt]) {
            if (date !== undefined && (!(date instanceof Date) || !Number.isFinite(date.getTime()))) throw new TypeError('Invalid audit date.');
        }
    }
    get createdAt(): T['createdAt'] { return this.read('createdAt'); }
    get updatedAt(): T['updatedAt'] { return this.read('updatedAt'); }
    get createdBy(): T['createdBy'] { return this.read('createdBy'); }
    get updatedBy(): T['updatedBy'] { return this.read('updatedBy'); }
}
