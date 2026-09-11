import type {Sequelize, Repository} from 'sequelize-typescript';
import type {InferAttributes, WhereOptions} from 'sequelize';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {ArticlePathModel} from '../ORM/models/articlePath.model';
import {ArticlePathPersistenceMapper as Mapper} from '../mappers/articlePath.persistence.mapper';
import type {ArticlePath, ArticlePathProps} from '../../../modules/publishing/domain/entities/articlePath';
import type {IArticlePathRepository} from '../../../modules/publishing/domain/repositories/articlePath.repository.interface';
export class ArticlePathPersistence implements IArticlePathRepository {
    private readonly model: Repository<ArticlePathModel>;
    constructor(database: Sequelize, private readonly context: IPersistenceContext) { this.model = database.getRepository(ArticlePathModel); }
    async find(filter: Partial<ArticlePathProps>, lock = false): Promise<readonly ArticlePath[]> {
        const transaction = lock ? this.context.requireTransaction() : this.context.getTransaction();
        const rows = await this.model.findAll({where: filter as WhereOptions<InferAttributes<ArticlePathModel>>, transaction, ...(lock && transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return rows.map((row) => Mapper.toEntity(row));
    }
    async save(entity: ArticlePath): Promise<void> {
        const transaction = this.context.requireTransaction();
        const values = Mapper.toPersistence(entity);
        const [row] = await this.model.findOrCreate({where: {locale: values.locale, slug: values.slug}, defaults: values, transaction});
        // Never transfer path ownership, even if another writer claimed a previously empty path.
        if (row.translationId === values.translationId) await row.update({kind: values.kind}, {transaction});
    }
    async remove(filter: Partial<ArticlePathProps>): Promise<void> {
        if (!Object.keys(filter).length) throw new Error('An explicit deletion filter is required.');
        await this.model.destroy({where: filter as WhereOptions<InferAttributes<ArticlePathModel>>, transaction: this.context.requireTransaction()});
    }
}
