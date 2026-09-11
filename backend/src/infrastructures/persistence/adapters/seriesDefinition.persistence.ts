import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {SeriesModel} from '../ORM/models/series.model';
import {SeriesDefinitionPersistenceMapper as Mapper} from '../mappers/seriesDefinition.persistence.mapper';
import type {SeriesDefinition, SeriesDefinitionProps} from '../../../modules/publishing/domain/entities/seriesDefinition';
import type {ISeriesDefinitionRepository} from '../../../modules/publishing/domain/repositories/seriesDefinition.repository.interface';
export class SeriesDefinitionPersistence implements ISeriesDefinitionRepository {
    private readonly model: Repository<SeriesModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(SeriesModel); }
    async find(filter: Partial<SeriesDefinitionProps>, lock = false): Promise<readonly SeriesDefinition[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<SeriesModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: SeriesDefinition): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {transaction: this.context.requireTransaction()});
    }
    async remove(filter: Partial<SeriesDefinitionProps>): Promise<void> {
        if (!Object.keys(filter).length) throw new Error('An explicit deletion filter is required.');
        await this.model.destroy({where: filter as WhereOptions<InferAttributes<SeriesModel>>, transaction: this.context.requireTransaction()});
    }
}
