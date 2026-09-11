import {Table, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import {SeriesModel} from './series.model';
import {ArticleModel} from './article.model';

@Table({tableName: 'series_articles', timestamps: false, freezeTableName: true})
export class SeriesArticleModel extends BaseModel<InferAttributes<SeriesArticleModel>, InferCreationAttributes<SeriesArticleModel>> {
    @ForeignKey(() => SeriesModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare seriesId: string;

    @ForeignKey(() => ArticleModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare articleId: string;

    @DbColumn(DataType.INTEGER, {allowNull: false})
    declare position: number;

    @BelongsTo(() => SeriesModel, {foreignKey: 'seriesId', onDelete: 'RESTRICT'})
    declare series?: NonAttribute<SeriesModel>;
    @BelongsTo(() => ArticleModel, {foreignKey: 'articleId', onDelete: 'RESTRICT'})
    declare article?: NonAttribute<ArticleModel>;
}
