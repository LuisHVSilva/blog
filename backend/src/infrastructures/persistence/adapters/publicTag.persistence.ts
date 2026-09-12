import type {Locale} from '../../../modules/publishing/domain/publishing.types';
import {PublishedTag} from '../../../modules/publishing/domain/entities/publishedTag';
import type {
    IPublicTagRepository
} from '../../../modules/publishing/domain/repositories/publicTag.repository.interface';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {PersistenceNumbers} from '../utils/persistence-numbers';
import {visible} from '../queries/publicVisibility.query';
import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';

type QueryReplacements = Readonly<Record<string, unknown>>;

type PublicTagRow = Readonly<{
    id: string;
    key: string;
    name: string;
    slug: string;
    description: string | null;
    article_count: string;
}>;

export class PublicTagPersistence implements IPublicTagRepository {
    constructor(
        private readonly sequelize: Sequelize,
        private readonly siteOrigin: string,
        private readonly transaction?: Transaction | IPersistenceContext
    ) {
    }

    private async query<T extends object>(
        sql: string,
        replacements: QueryReplacements = {}
    ): Promise<T[]> {
        return await this.sequelize.query<T>(sql, {
            replacements,
            type: QueryTypes.SELECT,
            transaction: this.resolveTransaction()
        });
    }

    private resolveTransaction(): Transaction | undefined {
        if (this.transaction && 'getTransaction' in this.transaction) {
            return this.transaction.getTransaction();
        }

        return this.transaction;
    }

    async list(locale: Locale): Promise<readonly PublishedTag[]> {
        const rows = await this.query<PublicTagRow>(
            `SELECT g.id,g.key,gt.name,gt.slug,gt.description,
                count(DISTINCT a.id)::text article_count
            FROM tags g
            JOIN tag_translations gt ON gt.tag_id=g.id
                AND gt.locale=:locale
                AND gt.status='published'
            JOIN article_tags ag ON ag.tag_id=g.id
            JOIN articles a ON a.id=ag.article_id
            JOIN article_translations t ON t.article_id=a.id AND t.locale=:locale
            WHERE ${visible}
            GROUP BY g.id,g.key,gt.name,gt.slug,gt.description
            ORDER BY gt.slug`,
            {locale}
        );

        return rows.map((row) => new PublishedTag({
            id: row.id,
            key: row.key,
            locale,
            name: row.name,
            slug: row.slug,
            ...(row.description === null ? {} : {description: row.description}),
            articleCount: PersistenceNumbers.count(row.article_count),
            canonical: `${this.siteOrigin}/${locale}/tags/${row.slug}`
        }));
    }
}
