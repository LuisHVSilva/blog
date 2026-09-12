import type {ArticleTranslation} from '../../../modules/publishing/domain/entities/articleTranslation';
import type {Locale} from '../../../modules/publishing/domain/publishing.types';
import type {
    IArticleTranslationRepository
} from '../../../modules/publishing/domain/repositories/articleTranslation.repository.interface';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {ArticleTranslationModel} from '../ORM/models/articleTranslation.model';
import {ArticleTranslationPersistenceMapper} from '../mappers/articleTranslation.persistence.mapper';
import type {Repository, Sequelize} from 'sequelize-typescript';

export class ArticleTranslationPersistence implements IArticleTranslationRepository {
    private readonly model: Repository<ArticleTranslationModel>;

    constructor(sequelize: Sequelize, private readonly context: IPersistenceContext) {
        this.model = sequelize.getRepository(ArticleTranslationModel);
    }

    async findById(id: string): Promise<ArticleTranslation | null> {
        const transaction = this.context.getTransaction();
        const row: ArticleTranslationModel | null = await this.model.findByPk(id, {
            transaction,
            ...(transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return row ? ArticleTranslationPersistenceMapper.toEntity(row) : null;
    }

    async listForArticle(articleId: string): Promise<readonly ArticleTranslation[]> {
        const rows: ArticleTranslationModel[] = await this.model.findAll({
            where: {articleId},
            transaction: this.context.getTransaction()
        });

        return rows.map((row) => ArticleTranslationPersistenceMapper.toEntity(row));
    }

    async save(entity: ArticleTranslation): Promise<ArticleTranslation> {
        const transaction = this.context.requireTransaction();
        await this.model.upsert(ArticleTranslationPersistenceMapper.toPersistence(entity), {transaction});
        const saved = await this.findById(entity.id);

        if (!saved) {
            throw new Error('Persisted articleTranslation was not found.');
        }

        return saved;
    }

    async findByArticleLocale(articleId: string, locale: Locale): Promise<ArticleTranslation | null> {
        const transaction = this.context.getTransaction();
        const row: ArticleTranslationModel | null = await this.model.findOne({
            where: {articleId, locale},
            transaction,
            ...(transaction ? {lock: transaction.LOCK.UPDATE} : {})
        });

        return row ? ArticleTranslationPersistenceMapper.toEntity(row) : null;
    }
}
