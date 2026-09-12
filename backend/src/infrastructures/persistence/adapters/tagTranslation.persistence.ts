import type {Repository, Sequelize} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {TagTranslationModel} from '../ORM/models/tagTranslation.model';
import {TagTranslationPersistenceMapper as Mapper} from '../mappers/tagTranslation.persistence.mapper';
import type {TagTranslation, TagTranslationProps} from '../../../modules/publishing/domain/entities/tagTranslation';
import type {
    ITagTranslationRepository
} from '../../../modules/publishing/domain/repositories/tagTranslation.repository.interface';

export class TagTranslationPersistence implements ITagTranslationRepository {
    private readonly model: Repository<TagTranslationModel>;

    constructor(database: Sequelize, private readonly context: IPersistenceContext) {
        this.model = database.getRepository(TagTranslationModel);
    }

    async find(filter: Partial<TagTranslationProps>, lock = false): Promise<readonly TagTranslation[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows: TagTranslationModel[] = await this.model.findAll({
            where: filter as WhereOptions<InferAttributes<TagTranslationModel>>,
            transaction,
            ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return rows.map((row) => Mapper.toEntity(row));
    }

    async save(entity: TagTranslation): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {
            transaction: this.context.requireTransaction()
        });
    }

    async remove(filter: Partial<TagTranslationProps>): Promise<void> {
        if (!Object.keys(filter).length) {
            throw new Error('An explicit deletion filter is required.');
        }

        await this.model.destroy({
            where: filter as WhereOptions<InferAttributes<TagTranslationModel>>,
            transaction: this.context.requireTransaction()
        });
    }
}
