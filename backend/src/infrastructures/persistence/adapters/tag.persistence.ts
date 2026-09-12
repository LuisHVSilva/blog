import type {Repository, Sequelize} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {TagModel} from '../ORM/models/tag.model';
import {TagPersistenceMapper as Mapper} from '../mappers/tag.persistence.mapper';
import type {Tag, TagProps} from '../../../modules/publishing/domain/entities/tag';
import type {ITagRepository} from '../../../modules/publishing/domain/repositories/tag.repository.interface';

export class TagPersistence implements ITagRepository {
    private readonly model: Repository<TagModel>;

    constructor(database: Sequelize, private readonly context: IPersistenceContext) {
        this.model = database.getRepository(TagModel);
    }

    async find(filter: Partial<TagProps>, lock = false): Promise<readonly Tag[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows: TagModel[] = await this.model.findAll({
            where: filter as WhereOptions<InferAttributes<TagModel>>,
            transaction,
            ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return rows.map((row) => Mapper.toEntity(row));
    }

    async save(entity: Tag): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {
            transaction: this.context.requireTransaction()
        });
    }

    async remove(filter: Partial<TagProps>): Promise<void> {
        if (!Object.keys(filter).length) {
            throw new Error('An explicit deletion filter is required.');
        }

        await this.model.destroy({
            where: filter as WhereOptions<InferAttributes<TagModel>>,
            transaction: this.context.requireTransaction()
        });
    }
}
