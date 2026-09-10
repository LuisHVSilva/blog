import {FindOptions, Op, Order, WhereOptions} from 'sequelize';
import {SortInput} from '../../../../shared/types/persistence.type';

export type FilterMode = 'exact' | 'partial';

type AssociationMap<T> = Partial<Record<keyof T, string>>;

type FilterOperatorValue = null | unknown | unknown[];

type FilterOperatorObject = {
    eq?: FilterOperatorValue;
    ne?: FilterOperatorValue;
    in?: unknown[];
    notIn?: unknown[];
    like?: string;
    iLike?: string;

    lt?: FilterOperatorValue;
    lte?: FilterOperatorValue;
    gt?: FilterOperatorValue;
    gte?: FilterOperatorValue;
};

export type PaginationInput = {
    page?: number; // 1..n
    limit?: number; // 1..maxLimit
    maxLimit?: number; // default 100
};

export const PAGE_START = 1;
export const PAGE_LIMIT_DEFAULT = 20;
export const PAGE_LIMIT_MAX = 500;

export class SequelizeWhereBuilderHelper<TFilter> {
    private readonly filters?: TFilter;
    private readonly mode: FilterMode;
    private _page: number = PAGE_START;
    private _limit: number = PAGE_LIMIT_MAX;

    constructor(filters?: TFilter, mode: FilterMode = 'exact') {
        this.filters = filters;
        this.mode = mode;
    }

    get page(): number {
        return this._page;
    }

    get limit(): number {
        return this._limit;
    }

    // ================================
    // Value normalization (infra-safe)
    // ================================
    private normalizeValue(value: unknown): unknown {
        if (value === null || value === undefined) return value;

        if (typeof value === 'object') {
            if ('getValue' in value && typeof (value as any).getValue === 'function') {
                return (value as any).getValue();
            }

            if ('value' in value) {
                return (value as any).value;
            }
        }

        return value;
    }

    private isOperatorObject(value: unknown): value is FilterOperatorObject {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }

        const operatorKeys = ['eq', 'ne', 'in', 'notIn', 'like', 'iLike'];
        return Object.keys(value).some((key) => operatorKeys.includes(key));
    }

    private normalizeOperatorObject(value: FilterOperatorObject): FilterOperatorObject {
        return {
            eq: Array.isArray(value.eq)
                ? value.eq.map((item) => this.normalizeValue(item))
                : this.normalizeValue(value.eq),

            ne: Array.isArray(value.ne)
                ? value.ne.map((item) => this.normalizeValue(item))
                : this.normalizeValue(value.ne),

            in: value.in?.map((item) => this.normalizeValue(item)),
            notIn: value.notIn?.map((item) => this.normalizeValue(item)),

            like: value.like,
            iLike: value.iLike,

            lt: this.normalizeValue(value.lt),
            lte: this.normalizeValue(value.lte),
            gt: this.normalizeValue(value.gt),
            gte: this.normalizeValue(value.gte),
        };
    }

    private buildOperatorCondition(value: FilterOperatorObject): Record<symbol, unknown> | unknown {
        const normalized = this.normalizeOperatorObject(value);
        const condition: Record<symbol, unknown> = {};

        if (normalized.eq !== undefined) {
            return normalized.eq;
        }

        if (normalized.ne !== undefined) {
            condition[Op.ne] = normalized.ne;
        }

        if (normalized.in?.length) {
            condition[Op.in] = normalized.in;
        }

        if (normalized.notIn?.length) {
            condition[Op.notIn] = normalized.notIn;
        }

        if (normalized.like !== undefined) {
            condition[Op.like] = `%${normalized.like}%`;
        }

        if (normalized.iLike !== undefined) {
            condition[Op.iLike] = `%${normalized.iLike}%`;
        }

        if (normalized.lt !== undefined) {
            condition[Op.lt] = normalized.lt;
        }

        if (normalized.lte !== undefined) {
            condition[Op.lte] = normalized.lte;
        }

        if (normalized.gt !== undefined) {
            condition[Op.gt] = normalized.gt;
        }

        if (normalized.gte !== undefined) {
            condition[Op.gte] = normalized.gte;
        }

        return condition;
    }

    // ================================
    // Where builder
    // ================================
    build(associationMap?: AssociationMap<TFilter>): WhereOptions {
        const where: WhereOptions = {};
        if (!this.filters) return where;

        Object.entries(this.filters).forEach(([key, rawValue]) => {
            if (rawValue === undefined || rawValue === null) return;

            const normalized = this.isOperatorObject(rawValue)
                ? this.buildOperatorCondition(rawValue)
                : Array.isArray(rawValue)
                    ? rawValue.map((v) => this.normalizeValue(v))
                    : this.normalizeValue(rawValue);

            const fieldKey = associationMap?.[key as keyof TFilter]
                ? `$${associationMap[key as keyof TFilter]}$`
                : key;

            // EXACT MODE
            if (this.mode === 'exact') {
                (where as any)[fieldKey] = Array.isArray(normalized) ? {[Op.in]: normalized} : normalized;
                return;
            }

            // PARTIAL MODE
            if (Array.isArray(normalized)) {
                (where as any)[fieldKey] = {[Op.in]: normalized};
            } else if (typeof normalized === 'string') {
                (where as any)[fieldKey] = {[Op.iLike]: `%${normalized}%`};
            } else {
                (where as any)[fieldKey] = normalized;
            }
        });

        return where;
    }

    // ================================
    // Pagination + sorting builder
    // ================================
    buildQueryOptions(
        params?: {
            associationMap?: AssociationMap<TFilter>;
            pagination?: PaginationInput;
            sort?: SortInput;
        },
        removeLimit: boolean = false,
    ): FindOptions {
        const where: WhereOptions = this.build(params?.associationMap);
        const order: Order = params?.sort?.order ?? [['id', 'ASC']];

        if (removeLimit) {
            return {
                where,
                order,
            };
        }

        const page: number = Math.max(params?.pagination?.page ?? PAGE_START, 1);
        const maxLimit: number = Math.max(params?.pagination?.maxLimit ?? PAGE_LIMIT_MAX, 1);
        const limitRaw: number = params?.pagination?.limit ?? PAGE_LIMIT_DEFAULT;
        const limit: number = Math.min(Math.max(limitRaw, 1), maxLimit);
        const offset: number = (page - 1) * limit;

        this._page = page;
        this._limit = limitRaw;

        return {
            where,
            limit,
            offset,
            order,
        };
    }
}
