import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {ArticleTagModel} from '../ORM/models/articleTag.model';
import {ArticleTagPersistenceMapper as Mapper} from '../mappers/articleTag.persistence.mapper';
import type {ArticleTag, ArticleTagProps} from '../../../modules/publishing/domain/entities/articleTag';
import type {IArticleTagRepository} from '../../../modules/publishing/domain/repositories/articleTag.repository.interface';
export class ArticleTagPersistence implements IArticleTagRepository {
    private readonly model: Repository<ArticleTagModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(ArticleTagModel); }
    async find(filter: Partial<ArticleTagProps>, lock = false): Promise<readonly ArticleTag[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<ArticleTagModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: ArticleTag): Promise<void> {
        await this.model.upsert(Mapper.toPersistence(entity), {transaction: this.context.requireTransaction()});
    }
    async remove(filter: Partial<ArticleTagProps>): Promise<void> {
        if (!Object.keys(filter).length) throw new Error('An explicit deletion filter is required.');
        await this.model.destroy({where: filter as WhereOptions<InferAttributes<ArticleTagModel>>, transaction: this.context.requireTransaction()});
    }
}
