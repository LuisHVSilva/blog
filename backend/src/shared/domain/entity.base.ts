/** Domain state is limited to primitives, dates, arrays and plain records. */
export abstract class EntityBase<T extends {readonly id: string}, TEntity> {
    readonly #state: T;

    protected constructor(props: T) {
        this.#state = EntityBase.copy(props);
    }

    private static copy<V>(value: V): V {
        if (value instanceof Date) return new Date(value.getTime()) as V;
        if (Array.isArray(value)) return Object.freeze(value.map((item: unknown) => EntityBase.copy(item))) as V;
        if (value !== null && typeof value === 'object') {
            if (Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError('Entity properties must be plain domain data.');
            return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, EntityBase.copy(item)]))) as V;
        }
        return value;
    }

    protected read<K extends keyof T>(key: K): T[K] { return EntityBase.copy(this.#state[key]); }
    get id(): string { return this.#state.id; }
    /** Detached snapshot: even mutable Date instances cannot change the entity. */
    getProps(): T { return EntityBase.copy(this.#state); }
    protected abstract recreate(props: T): TEntity;
    protected cloneWith(overrides: Partial<Omit<T, 'id'>>): TEntity {
        return this.recreate({...this.getProps(), ...overrides, id: this.id});
    }
}
