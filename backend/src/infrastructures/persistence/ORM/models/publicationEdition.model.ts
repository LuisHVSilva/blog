import {DataType, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';

@Table({tableName: 'publication_editions', timestamps: false, freezeTableName: true})
export class PublicationEditionModel extends BaseModel<InferAttributes<PublicationEditionModel>, InferCreationAttributes<PublicationEditionModel>> {
    @DbColumn(DataType.TEXT, {primaryKey: true, allowNull: false})
    declare revision: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare contentHash: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare gitCommit: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare actorId: string;

    @DbColumn(DataType.DATE, {allowNull: false})
    declare appliedAt: Date;

    @DbColumn(DataType.JSONB, {allowNull: false})
    declare report: Record<string, unknown>;

}
