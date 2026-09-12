import type {Repository, Sequelize} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {SeriesArticleModel} from '../ORM/models/seriesArticle.model';
import {SeriesArticlePersistenceMapper as Mapper} from '../mappers/seriesArticle.persistence.mapper';
import type {SeriesArticle, SeriesArticleProps} from '../../../modules/publishing/domain/entities/seriesArticle';
import type {
    ISeriesArticleRepository
} from '../../../modules/publishing/domain/repositories/seriesArticle.repository.interface';

export class SeriesArticlePersistence implements ISeriesArticleRepository {
    private readonly model: Repository<SeriesArticleModel>;

    constructor(database: Sequelize, private readonly context: IPersistenceContext) {
        this.model = database.getRepository(SeriesArticleModel);
    }

    async find(filter: Partial<SeriesArticleProps>, lock = false): Promise<readonly SeriesArticle[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows: SeriesArticleModel[] = await this.model.findAll({
            where: filter as WhereOptions<InferAttributes<SeriesArticleModel>>,
            transaction,
            ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return rows.map((row) => Mapper.toEntity(row));
    }

    async save(entity: SeriesArticle): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {
            transaction: this.context.requireTransaction()
        });
    }

    async remove(filter: Partial<SeriesArticleProps>): Promise<void> {
        if (!Object.keys(filter).length) {
            throw new Error('An explicit deletion filter is required.');
        }

        await this.model.destroy({
            where: filter as WhereOptions<InferAttributes<SeriesArticleModel>>,
            transaction: this.context.requireTransaction()
        });
    }
}
