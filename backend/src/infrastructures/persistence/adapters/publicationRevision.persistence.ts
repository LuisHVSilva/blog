import type {Repository, Sequelize} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {PublicationCurrentRevisionModel} from '../ORM/models/publicationCurrentRevision.model';
import {PublicationRevisionPersistenceMapper as Mapper} from '../mappers/publicationRevision.persistence.mapper';
import type {
    PublicationRevision,
    PublicationRevisionProps
} from '../../../modules/publishing/domain/entities/publicationRevision';
import type {
    IPublicationRevisionRepository
} from '../../../modules/publishing/domain/repositories/publicationRevision.repository.interface';

export class PublicationRevisionPersistence implements IPublicationRevisionRepository {
    private readonly model: Repository<PublicationCurrentRevisionModel>;

    constructor(database: Sequelize, private readonly context: IPersistenceContext) {
        this.model = database.getRepository(PublicationCurrentRevisionModel);
    }

    async find(filter: Partial<PublicationRevisionProps>, lock = false): Promise<readonly PublicationRevision[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows: PublicationCurrentRevisionModel[] = await this.model.findAll({
            where: filter as WhereOptions<InferAttributes<PublicationCurrentRevisionModel>>,
            transaction,
            ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return rows.map((row) => Mapper.toEntity(row));
    }

    async save(entity: PublicationRevision): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {
            transaction: this.context.requireTransaction()
        });
    }

    async remove(filter: Partial<PublicationRevisionProps>): Promise<void> {
        if (!Object.keys(filter).length) {
            throw new Error('An explicit deletion filter is required.');
        }

        await this.model.destroy({
            where: filter as WhereOptions<InferAttributes<PublicationCurrentRevisionModel>>,
            transaction: this.context.requireTransaction()
        });
    }
}
