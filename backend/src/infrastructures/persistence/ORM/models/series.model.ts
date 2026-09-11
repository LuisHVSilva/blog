import {Table, DataType} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes} from 'sequelize';
import {BaseAuditModel} from '../base/baseAudit.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Difficulty, TranslationStatus} from '../../../../modules/publishing/domain/article';

@Table({tableName: 'series', timestamps: false, freezeTableName: true})
export class SeriesModel extends BaseAuditModel<InferAttributes<SeriesModel>, InferCreationAttributes<SeriesModel>> {
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare id: string;

    @DbColumn(DataType.TEXT, {allowNull: false, unique: true})
    declare key: string;

    @DbColumn(DataType.TEXT, {allowNull: true})
    declare difficulty: Difficulty | null;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare status: TranslationStatus;

}
