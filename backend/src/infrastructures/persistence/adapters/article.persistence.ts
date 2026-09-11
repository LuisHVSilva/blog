import type {Sequelize, Repository} from 'sequelize-typescript';
import type {Article} from '../../../modules/publishing/domain/article';
import type {IArticleRepository} from '../../../modules/publishing/domain/repositories/article.repository.interface';
import {ArticleModel} from '../ORM/models/article.model';
import {ArticlePersistenceMapper} from '../mappers/article.persistence.mapper';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';

export class ArticlePersistence implements IArticleRepository {
    private readonly model: Repository<ArticleModel>;
    constructor(sequelize: Sequelize, private readonly context: IPersistenceContext) {
        this.model = sequelize.getRepository(ArticleModel);
    }
    async findById(id: string): Promise<Article | null> {
        const transaction = this.context.getTransaction();
        const row = await this.model.findByPk(id, {transaction, ...(transaction ? {lock: transaction.LOCK.UPDATE} : {})});
        return row ? ArticlePersistenceMapper.toEntity(row) : null;
    }
    async save(entity: Article): Promise<Article> {
        const transaction = this.context.requireTransaction();
        await this.model.upsert(ArticlePersistenceMapper.toPersistence(entity), {transaction});
        const saved = await this.findById(entity.id);
        if (!saved) throw new Error('Persisted article was not found.');
        return saved;
    }
}
