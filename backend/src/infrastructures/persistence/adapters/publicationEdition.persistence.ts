import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {PublicationEditionModel} from '../ORM/models/publicationEdition.model';
import {PublicationEditionPersistenceMapper as Mapper} from '../mappers/publicationEdition.persistence.mapper';
import type {PublicationEdition, PublicationEditionProps} from '../../../modules/publishing/domain/entities/publicationEdition';
import type {IPublicationEditionRepository} from '../../../modules/publishing/domain/repositories/publicationEdition.repository.interface';
export class PublicationEditionPersistence implements IPublicationEditionRepository {
    private readonly model: Repository<PublicationEditionModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(PublicationEditionModel); }
    async find(filter: Partial<PublicationEditionProps>, lock = false): Promise<readonly PublicationEdition[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<PublicationEditionModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: PublicationEdition): Promise<void> {
        await this.model.create(Mapper.toPersistence(entity), {transaction: this.context.requireTransaction()});
    }
}
