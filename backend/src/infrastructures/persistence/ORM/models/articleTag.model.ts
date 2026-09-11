import {Table, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import {ArticleModel} from './article.model';
import {TagModel} from './tag.model';

@Table({tableName: 'article_tags', timestamps: false, freezeTableName: true})
export class ArticleTagModel extends BaseModel<InferAttributes<ArticleTagModel>, InferCreationAttributes<ArticleTagModel>> {
    @ForeignKey(() => ArticleModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare articleId: string;

    @ForeignKey(() => TagModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare tagId: string;

    @BelongsTo(() => ArticleModel, {foreignKey: 'articleId', onDelete: 'RESTRICT'})
    declare article?: NonAttribute<ArticleModel>;
    @BelongsTo(() => TagModel, {foreignKey: 'tagId', onDelete: 'RESTRICT'})
    declare tag?: NonAttribute<TagModel>;
}
