import {BelongsTo, DataType, ForeignKey, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Locale, TranslationStatus} from '../../../../modules/publishing/domain/publishing.types';
import type {TranslationSeo} from '../../../../modules/publishing/domain/entities/articleTranslation';
import {ArticleModel} from './article.model';

@Table({tableName: 'article_translations', timestamps: false, freezeTableName: true})
export class ArticleTranslationModel extends BaseModel<InferAttributes<ArticleTranslationModel>, InferCreationAttributes<ArticleTranslationModel>> {
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare id: string;

    @ForeignKey(() => ArticleModel)
    @DbColumn(DataType.UUID, {allowNull: false})
    declare articleId: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare locale: Locale;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare slug: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare title: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare description: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare bodyMarkdown: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare status: TranslationStatus;

    @DbColumn(DataType.DATE, {allowNull: true})
    declare publishedAt: Date | null;

    @DbColumn(DataType.DATE, {allowNull: false})
    declare updatedAt: Date;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare sourceRevision: string;

    @DbColumn(DataType.TEXT, {allowNull: true})
    declare translatedFromRevision: string | null;

    @DbColumn(DataType.INTEGER, {allowNull: false})
    declare readingMinutes: number;

    @DbColumn(DataType.JSONB, {allowNull: false})
    declare seo: TranslationSeo;

    @BelongsTo(() => ArticleModel, {foreignKey: 'articleId', onDelete: 'RESTRICT'})
    declare article?: NonAttribute<ArticleModel>;
}
