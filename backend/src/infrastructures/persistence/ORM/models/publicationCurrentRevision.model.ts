import {Table, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import type {InferAttributes, InferCreationAttributes, NonAttribute} from 'sequelize';
import {BaseModel} from '../base/base.model';
import {DbColumn} from '../decorators/dbColumn';
import {PublicationEditionModel} from './publicationEdition.model';

@Table({tableName: 'publication_current_revision', timestamps: false, freezeTableName: true})
export class PublicationCurrentRevisionModel extends BaseModel<InferAttributes<PublicationCurrentRevisionModel>, InferCreationAttributes<PublicationCurrentRevisionModel>> {
    @DbColumn(DataType.BOOLEAN, {primaryKey: true, allowNull: false})
    declare singleton: boolean;

    @ForeignKey(() => PublicationEditionModel)
    @DbColumn(DataType.TEXT, {allowNull: true})
    declare revision: string | null;

    @DbColumn(DataType.DATE, {allowNull: false})
    declare updatedAt: Date;

    @BelongsTo(() => PublicationEditionModel, {foreignKey: 'revision', onDelete: 'RESTRICT'})
    declare edition?: NonAttribute<PublicationEditionModel>;
}
