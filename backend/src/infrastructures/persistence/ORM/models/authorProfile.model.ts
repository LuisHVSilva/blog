import {DataType, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes} from 'sequelize';
import {BaseCreatedModel} from '../base/baseAudit.model';
import {DbColumn} from '../decorators/dbColumn';

@Table({tableName: 'author_profiles', timestamps: false, freezeTableName: true})
export class AuthorProfileModel extends BaseCreatedModel<InferAttributes<AuthorProfileModel>, InferCreationAttributes<AuthorProfileModel>> {
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare id: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare displayName: string;

    @DbColumn(DataType.TEXT, {allowNull: false, unique: true})
    declare profileSlug: string;

    @DbColumn(DataType.TEXT, {allowNull: true})
    declare bio: string | null;

    @DbColumn(DataType.JSONB, {allowNull: false})
    declare links: string[];

}
