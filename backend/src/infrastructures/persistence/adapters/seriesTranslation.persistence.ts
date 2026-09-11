import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {SeriesTranslationModel} from '../ORM/models/seriesTranslation.model';
import {SeriesTranslationPersistenceMapper as Mapper} from '../mappers/seriesTranslation.persistence.mapper';
import type {SeriesTranslation, SeriesTranslationProps} from '../../../modules/publishing/domain/entities/seriesTranslation';
import type {ISeriesTranslationRepository} from '../../../modules/publishing/domain/repositories/seriesTranslation.repository.interface';
export class SeriesTranslationPersistence implements ISeriesTranslationRepository {
    private readonly model: Repository<SeriesTranslationModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(SeriesTranslationModel); }
    async find(filter: Partial<SeriesTranslationProps>, lock = false): Promise<readonly SeriesTranslation[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<SeriesTranslationModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: SeriesTranslation): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {transaction: this.context.requireTransaction()});
    }
    async remove(filter: Partial<SeriesTranslationProps>): Promise<void> {
        if (!Object.keys(filter).length) throw new Error('An explicit deletion filter is required.');
        await this.model.destroy({where: filter as WhereOptions<InferAttributes<SeriesTranslationModel>>, transaction: this.context.requireTransaction()});
    }
}
