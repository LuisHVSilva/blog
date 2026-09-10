import {Order} from 'sequelize';

export type FilterLimiterType = {
    page?: number;
    limit?: number;
    exact?: 'exact' | 'partial';
    notIn?: boolean;
    removeLimit?: boolean;
};

export type SortInput = {
    // exemplo: ["createdAt", "DESC"]
    order?: Order;
};

export type FindAllType<T> = {
    entities: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
};

export type FieldFilter<T> =
    | T
    | T[]
    | {
    eq?: T;
    ne?: T | null;
    in?: T[];
    notIn?: T[];
    like?: string;
    iLike?: string;

    lt?: T;
    lte?: T;
    gt?: T;
    gte?: T;
};
