import {BelongsTo, DataType, ForeignKey, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Locale, TranslationStatus} from '../../../../modules/publishing/domain/publishing.types';
import {SeriesModel} from './series.model';

@Table({tableName: 'series_translations', timestamps: false, freezeTableName: true})
export class SeriesTranslationModel extends BaseModel<InferAttributes<SeriesTranslationModel>, InferCreationAttributes<SeriesTranslationModel>> {
    @ForeignKey(() => SeriesModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare seriesId: string;

    @DbColumn(DataType.TEXT, {primaryKey: true, allowNull: false})
    declare locale: Locale;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare title: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare slug: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare description: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare status: TranslationStatus;

    @DbColumn(DataType.BOOLEAN, {allowNull: false})
    declare publishedOnce: boolean;

    @BelongsTo(() => SeriesModel, {foreignKey: 'seriesId', onDelete: 'RESTRICT'})
    declare series?: NonAttribute<SeriesModel>;
}
