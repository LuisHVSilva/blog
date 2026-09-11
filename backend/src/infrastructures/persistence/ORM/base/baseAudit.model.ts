import {DataType} from 'sequelize-typescript';
import type {CreationOptional} from 'sequelize';
import {BaseModel} from './base.model';
import {DbColumn} from '../decorators/dbColumn';

/** No IAM foreign keys or automatic timestamps: the editorial operation owns dates. */
export abstract class BaseCreatedModel<T extends object, C extends object = T> extends BaseModel<T, C> {
    @DbColumn(DataType.DATE, {allowNull: false})
    declare createdAt: CreationOptional<Date>;
}
export abstract class BaseAuditModel<T extends object, C extends object = T> extends BaseCreatedModel<T, C> {
    @DbColumn(DataType.DATE, {allowNull: false})
    declare updatedAt: CreationOptional<Date>;
}
