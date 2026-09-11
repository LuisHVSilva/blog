import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {AuthorProfileModel} from '../ORM/models/authorProfile.model';
import {AuthorProfilePersistenceMapper as Mapper} from '../mappers/authorProfile.persistence.mapper';
import type {AuthorProfile, AuthorProfileProps} from '../../../modules/publishing/domain/entities/authorProfile';
import type {IAuthorProfileRepository} from '../../../modules/publishing/domain/repositories/authorProfile.repository.interface';
export class AuthorProfilePersistence implements IAuthorProfileRepository {
    private readonly model: Repository<AuthorProfileModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(AuthorProfileModel); }
    async find(filter: Partial<AuthorProfileProps>, lock = false): Promise<readonly AuthorProfile[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<AuthorProfileModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: AuthorProfile): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {transaction: this.context.requireTransaction()});
    }
    async remove(filter: Partial<AuthorProfileProps>): Promise<void> {
        if (!Object.keys(filter).length) throw new Error('An explicit deletion filter is required.');
        await this.model.destroy({where: filter as WhereOptions<InferAttributes<AuthorProfileModel>>, transaction: this.context.requireTransaction()});
    }
}
