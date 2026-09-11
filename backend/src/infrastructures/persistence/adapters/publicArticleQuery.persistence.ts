import type {IPersistenceContext} from '../ORM/context/persistenceContext.interface';
import {QueryTypes, type Transaction, type Sequelize} from 'sequelize';
import {PublicArticlePersistenceMapper, PersistenceNumbers, type ArticleReadRow} from '../mappers/publicArticle.persistence.mapper';
import {visible, columns, joins} from '../queries/publicArticle.query';
import {PublishedArticle} from '../../../modules/publishing/domain/entities/publishedArticle';
import type {IPublicArticleRepository, PublicArticleLookup, PublicArticlePage, SeriesArticleProjection} from '../../../modules/publishing/domain/repositories/publicArticle.repository.interface';
import type {Difficulty, Locale} from '../../../modules/publishing/domain/article';

export class PublicArticleQueryPersistence implements IPublicArticleRepository {
    private readonly mapper: PublicArticlePersistenceMapper;
    constructor(private readonly sequelize: Sequelize, siteOrigin: string, private readonly transaction?: Transaction | IPersistenceContext) {
        this.mapper = new PublicArticlePersistenceMapper(siteOrigin);
    }
    private async query<T extends object>(sql: string, replacements: Record<string, unknown> = {}): Promise<T[]> {
        return await this.sequelize.query<T>(sql, {replacements, type: QueryTypes.SELECT, transaction: this.transaction && 'getTransaction' in this.transaction ? this.transaction.getTransaction() : this.transaction});
    }
    private detailColumns() {
        return `${columns},t.body_markdown,t.seo,au.bio,au.links,
        COALESCE((SELECT jsonb_agg(jsonb_build_object('locale',other.locale,'slug',other.slug) ORDER BY other.locale)
        FROM article_translations other WHERE other.article_id=a.id AND other.status='published'),'[]') alternates`;
    }
    async getBySlug(input: Readonly<{locale: Locale; slug: string}>): Promise<PublicArticleLookup | null> {
        const rows = await this.query<ArticleReadRow & {representation_modified_at: Date}>(`SELECT ${this.detailColumns()},p.kind,
            (SELECT updated_at FROM publication_current_revision WHERE singleton=true) representation_modified_at ${joins} JOIN article_paths p ON p.translation_id=t.id
            WHERE p.locale=:locale AND p.slug=:slug AND ${visible}`, input);
        const row = rows[0];
        if (!row) return null;
        return row.kind === 'redirect' ? {kind: 'redirect', locale: row.locale, slug: row.slug} : {kind: 'found', article: new PublishedArticle(this.mapper.detail(row)), lastModified: row.representation_modified_at.toISOString()};
    }
    async list(input: Readonly<{locale: Locale; page: number; limit: number; tag?: string; series?: string; difficulty?: Difficulty; q?: string; sort?: 'publishedAt:asc' | 'publishedAt:desc'}>): Promise<PublicArticlePage> {
        const direction = input.sort === 'publishedAt:asc' ? 'ASC' : 'DESC';
        const filters = ['t.locale=:locale', visible];
        const replacements: Record<string, unknown> = {...input};
        if (input.difficulty) filters.push('a.difficulty=:difficulty');
        if (input.q) {
            filters.push(`(t.title ILIKE :q ESCAPE '\\' OR t.description ILIKE :q ESCAPE '\\')`);
            replacements.q = '%' + input.q.replace(/[\\%_]/gu, '\\$&') + '%';
        }
        if (input.tag) filters.push(`EXISTS (SELECT 1 FROM article_tags ag JOIN tag_translations gt ON gt.tag_id=ag.tag_id WHERE ag.article_id=a.id AND gt.locale=t.locale AND gt.slug=:tag AND gt.status='published')`);
        if (input.series) filters.push(`EXISTS (SELECT 1 FROM series_articles sa JOIN series s ON s.id=sa.series_id JOIN series_translations st ON st.series_id=s.id WHERE sa.article_id=a.id AND st.locale=t.locale AND st.slug=:series AND st.status='published' AND s.status='published')`);
        const where = filters.join(' AND ');
        const totals = await this.query<{total: string}>(`SELECT count(*)::text total ${joins} WHERE ${where}`, replacements);
        const total = PersistenceNumbers.count(totals[0]!.total);
        const rows = await this.query<ArticleReadRow>(`SELECT ${columns} ${joins} WHERE ${where} ORDER BY t.published_at ${direction},t.id ${direction} LIMIT :limit OFFSET :offset`, {...replacements, offset: (input.page - 1) * input.limit});
        return {data: rows.map((row) => new PublishedArticle(this.mapper.summary(row))), pagination: {page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit)}};
    }

    async allPublished(): Promise<readonly PublishedArticle[]> {
        const rows = await this.query<ArticleReadRow>(`SELECT ${this.detailColumns()} ${joins} WHERE ${visible} ORDER BY t.locale,t.slug`);
        return rows.map((row) => new PublishedArticle(this.mapper.detail(row)));
    }
    async listSeriesMembers(input: Readonly<{seriesId: string; locale: Locale}>): Promise<readonly SeriesArticleProjection[]> {
        const rows = await this.query<ArticleReadRow>(`SELECT ${columns},sa.position ${joins} JOIN series_articles sa ON sa.article_id=a.id WHERE sa.series_id=:seriesId AND t.locale=:locale AND ${visible} ORDER BY sa.position`, input);
        return rows.map((row) => ({position: row.position!, article: new PublishedArticle(this.mapper.summary(row))}));
    }
}
