import 'reflect-metadata';
import {Column} from 'sequelize-typescript';
import type {DataType, ModelAttributeColumnOptions} from 'sequelize';

/** Explicit type avoids reliance on emitted design metadata (including tsx tests). */
export class ColumnNaming {
    static snakeCase(name: string): string { return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(); }
}
export function DbColumn(type: DataType, options: Partial<ModelAttributeColumnOptions> = {}): PropertyDecorator {
    return (target, key) => {
        if (typeof key !== 'string') throw new TypeError('Database columns require string property names.');
        Column({...options, type, field: options.field ?? ColumnNaming.snakeCase(key)})(target, key);
    };
}
