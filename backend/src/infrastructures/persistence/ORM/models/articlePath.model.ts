import {Table, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Locale} from '../../../../modules/publishing/domain/article';
import {ArticleTranslationModel} from './articleTranslation.model';

@Table({tableName: 'article_paths', timestamps: false, freezeTableName: true})
export class ArticlePathModel extends BaseModel<InferAttributes<ArticlePathModel>, InferCreationAttributes<ArticlePathModel>> {
    @DbColumn(DataType.TEXT, {primaryKey: true, allowNull: false})
    declare locale: Locale;

    @DbColumn(DataType.TEXT, {primaryKey: true, allowNull: false})
    declare slug: string;

    @ForeignKey(() => ArticleTranslationModel)
    @DbColumn(DataType.UUID, {allowNull: false})
    declare translationId: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare kind: 'current' | 'redirect';

    @BelongsTo(() => ArticleTranslationModel, {foreignKey: 'translationId', onDelete: 'RESTRICT'})
    declare translation?: NonAttribute<ArticleTranslationModel>;
}
