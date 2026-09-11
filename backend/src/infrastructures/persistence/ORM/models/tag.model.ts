import {Table, DataType} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes} from 'sequelize';
import {BaseCreatedModel} from '../base/baseAudit.model';
import {DbColumn} from '../decorators/dbColumn';

@Table({tableName: 'tags', timestamps: false, freezeTableName: true})
export class TagModel extends BaseCreatedModel<InferAttributes<TagModel>, InferCreationAttributes<TagModel>> {
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare id: string;

    @DbColumn(DataType.TEXT, {allowNull: false, unique: true})
    declare key: string;

}
