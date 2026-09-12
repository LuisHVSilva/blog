import {BelongsTo, DataType, ForeignKey, Table} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import type {Locale, TranslationStatus} from '../../../../modules/publishing/domain/publishing.types';
import {TagModel} from './tag.model';

@Table({tableName: 'tag_translations', timestamps: false, freezeTableName: true})
export class TagTranslationModel extends BaseModel<InferAttributes<TagTranslationModel>, InferCreationAttributes<TagTranslationModel>> {
    @ForeignKey(() => TagModel)
    @DbColumn(DataType.UUID, {primaryKey: true, allowNull: false})
    declare tagId: string;

    @DbColumn(DataType.TEXT, {primaryKey: true, allowNull: false})
    declare locale: Locale;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare name: string;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare slug: string;

    @DbColumn(DataType.TEXT, {allowNull: true})
    declare description: string | null;

    @DbColumn(DataType.TEXT, {allowNull: false})
    declare status: TranslationStatus;

    @DbColumn(DataType.BOOLEAN, {allowNull: false})
    declare publishedOnce: boolean;

    @BelongsTo(() => TagModel, {foreignKey: 'tagId', onDelete: 'RESTRICT'})
    declare tag?: NonAttribute<TagModel>;
}
