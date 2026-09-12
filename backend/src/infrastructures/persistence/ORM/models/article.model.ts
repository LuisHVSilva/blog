import {BelongsTo, DataType, ForeignKey, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseCreatedModel} from '../base/baseAudit.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Difficulty, Locale} from '../../../../modules/publishing/domain/publishing.types';
import {AuthorProfileModel} from './authorProfile.model';

@Table({tableName: 'articles', timestamps: false, freezeTableName: true})
export class ArticleModel extends BaseCreatedModel<InferAttributes<ArticleModel>, InferCreationAttributes<ArticleModel>> {
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare id: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare sourceLocale: Locale;

    @ForeignKey(() => AuthorProfileModel)
    @DbColumn(DataType.UUID, {allowNull: false})
    declare authorId: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare difficulty: Difficulty;

    @DbColumn(DataType.DATE, {allowNull: true})
    declare archivedAt: Date | null;

    @BelongsTo(() => AuthorProfileModel, {foreignKey: 'authorId', onDelete: 'RESTRICT'})
    declare author?: NonAttribute<AuthorProfileModel>;
}
