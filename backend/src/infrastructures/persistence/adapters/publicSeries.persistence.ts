import type {Difficulty, Locale} from '../../../modules/publishing/domain/publishing.types';
import {PublishedSeries} from '../../../modules/publishing/domain/entities/publishedSeries';
import type {
    IPublicSeriesRepository
} from '../../../modules/publishing/domain/repositories/publicSeries.repository.interface';
import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {PersistenceNumbers} from '../utils/persistence-numbers';
import {visible} from '../queries/publicVisibility.query';
import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';

type QueryReplacements = Readonly<Record<string, unknown>>;

type PublicSeriesRow = Readonly<{
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty | null;
    article_count: string;
}>;

type CountRow = Readonly<{
    total: string;
}>;

export class PublicSeriesPersistence implements IPublicSeriesRepository {
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

    async list(locale: Locale): Promise<readonly PublishedSeries[]> {
        const rows = await this.query<PublicSeriesRow>(
            `SELECT s.id,st.slug,st.title,st.description,s.difficulty,
                count(DISTINCT a.id)::text article_count
            FROM series s
            JOIN series_translations st ON st.series_id=s.id
                AND st.locale=:locale
                AND st.status='published'
            JOIN series_articles sa ON sa.series_id=s.id
            JOIN articles a ON a.id=sa.article_id
            JOIN article_translations t ON t.article_id=a.id AND t.locale=:locale
            WHERE s.status='published' AND ${visible}
            GROUP BY s.id,st.slug,st.title,st.description,s.difficulty
            ORDER BY st.slug`,
            {locale}
        );

        return rows.map((row) => new PublishedSeries({
            id: row.id,
            locale,
            slug: row.slug,
            title: row.title,
            description: row.description,
            ...(row.difficulty ? {difficulty: row.difficulty} : {}),
            articleCount: PersistenceNumbers.count(row.article_count),
            canonical: `${this.siteOrigin}/${locale}/series/${row.slug}`
        }));
    }

    async countMembers(seriesId: string): Promise<number> {
        const rows = await this.query<CountRow>(
            'SELECT count(*)::text total FROM series_articles WHERE series_id=:seriesId',
            {seriesId}
        );

        return PersistenceNumbers.count(rows[0]!.total);
    }
}
