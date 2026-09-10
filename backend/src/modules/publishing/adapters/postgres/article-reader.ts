import {QueryTypes, Transaction, type Sequelize} from 'sequelize';
import type {ArticleDetail, ArticleLookup, ArticlePage, ArticleSummary, PublicSnapshot, SeriesDetail, SeriesSummary, TagSummary} from '../../application/content.dto';
import type {ArticleReader} from '../../application/ports/article-reader';
import type {Difficulty, Locale} from '../../domain/article';
import {Series} from '../../domain/series';

const visible = `t.status='published' AND a.archived_at IS NULL`;
const columns = `a.id article_id,t.id translation_id,t.locale,t.slug,t.title,t.description,a.difficulty,t.published_at,t.updated_at,t.reading_minutes,
 jsonb_build_object('id',au.id,'displayName',au.display_name,'profileSlug',au.profile_slug) author,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',g.id,'key',g.key,'name',gt.name,'slug',gt.slug) ORDER BY gt.slug)
 FROM article_tags ag JOIN tags g ON g.id=ag.tag_id JOIN tag_translations gt ON gt.tag_id=g.id
 WHERE ag.article_id=a.id AND gt.locale=t.locale AND gt.status='published'),'[]') tags,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',s.id,'title',st.title,'slug',st.slug,'position',sa.position) ORDER BY st.slug)
 FROM series_articles sa JOIN series s ON s.id=sa.series_id JOIN series_translations st ON st.series_id=s.id
 WHERE sa.article_id=a.id AND s.status='published' AND st.locale=t.locale AND st.status='published'),'[]') series`;
const joins = `FROM article_translations t JOIN articles a ON a.id=t.article_id JOIN author_profiles au ON au.id=a.author_id`;
type Row = {article_id: string; translation_id: string; locale: Locale; slug: string; title: string; description: string; difficulty: Difficulty; published_at: Date; updated_at: Date; reading_minutes: number; body_markdown?: string; seo?: ArticleDetail['seo']; author: ArticleSummary['author']; tags: ArticleSummary['tags']; series: ArticleSummary['series']; bio?: string; links?: readonly string[]; alternates?: {locale: Locale; slug: string}[]; kind?: string; position?: number};
function count(value: string): number {
    const result = Number(value);
    if (!Number.isSafeInteger(result) || result < 0) throw new Error('Public count exceeds the supported integer range.');
    return result;
}

export class PostgresArticleReader implements ArticleReader {
    constructor(private readonly sequelize: Sequelize, private readonly siteOrigin: string, private readonly transaction?: Transaction) {}
    private async query<T extends object>(sql: string, replacements: Record<string, unknown> = {}): Promise<T[]> {
        return await this.sequelize.query<T>(sql, {replacements, type: QueryTypes.SELECT, transaction: this.transaction});
    }
    private summary(row: Row): ArticleSummary {
        return {articleId: row.article_id, translationId: row.translation_id, locale: row.locale, slug: row.slug, title: row.title, description: row.description,
            difficulty: row.difficulty, publishedAt: row.published_at.toISOString(), updatedAt: row.updated_at.toISOString(), readingMinutes: row.reading_minutes,
            author: row.author, tags: row.tags, series: row.series, canonical: `${this.siteOrigin}/${row.locale}/articles/${row.slug}`};
    }
    private detail(row: Row): ArticleDetail {
        return {...this.summary(row), author: {...row.author, bio: row.bio ?? '', links: row.links ?? []}, bodyMarkdown: row.body_markdown!,
            seo: {title: row.seo?.title || row.title, description: row.seo?.description || row.description,
                ...(row.seo?.socialImagePath ? {socialImagePath: row.seo.socialImagePath, imageAlt: row.seo.imageAlt} : {})},
            alternates: (row.alternates ?? []).map((item) => ({...item, url: `${this.siteOrigin}/${item.locale}/articles/${item.slug}`}))};
    }
    private detailColumns() {
        return `${columns},t.body_markdown,t.seo,au.bio,au.links,
        COALESCE((SELECT jsonb_agg(jsonb_build_object('locale',other.locale,'slug',other.slug) ORDER BY other.locale)
        FROM article_translations other WHERE other.article_id=a.id AND other.status='published'),'[]') alternates`;
    }
    async getBySlug(input: Readonly<{locale: Locale; slug: string}>): Promise<ArticleLookup | null> {
        const rows = await this.query<Row & {representation_modified_at: Date}>(`SELECT ${this.detailColumns()},p.kind,
            (SELECT updated_at FROM publication_current_revision WHERE singleton=true) representation_modified_at ${joins} JOIN article_paths p ON p.translation_id=t.id
            WHERE p.locale=:locale AND p.slug=:slug AND ${visible}`, input);
        const row = rows[0];
        if (!row) return null;
        return row.kind === 'redirect' ? {kind: 'redirect', locale: row.locale, slug: row.slug} : {kind: 'found', article: this.detail(row), lastModified: row.representation_modified_at.toISOString()};
    }
    async list(input: Readonly<{locale: Locale; page: number; limit: number; tag?: string; series?: string; difficulty?: Difficulty; q?: string; sort?: 'publishedAt:asc' | 'publishedAt:desc'}>): Promise<ArticlePage> {
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
        const total = count(totals[0]!.total);
        const rows = await this.query<Row>(`SELECT ${columns} ${joins} WHERE ${where} ORDER BY t.published_at ${direction},t.id ${direction} LIMIT :limit OFFSET :offset`, {...replacements, offset: (input.page - 1) * input.limit});
        return {data: rows.map((row) => this.summary(row)), pagination: {page: input.page, limit: input.limit, total, totalPages: Math.ceil(total / input.limit)}};
    }
    async listTags(locale: Locale): Promise<readonly TagSummary[]> {
        const rows = await this.query<{id: string; key: string; name: string; slug: string; description: string | null; article_count: string}>(`SELECT g.id,g.key,gt.name,gt.slug,gt.description,count(DISTINCT a.id)::text article_count
            FROM tags g JOIN tag_translations gt ON gt.tag_id=g.id AND gt.locale=:locale AND gt.status='published'
            JOIN article_tags ag ON ag.tag_id=g.id JOIN articles a ON a.id=ag.article_id JOIN article_translations t ON t.article_id=a.id AND t.locale=:locale
            WHERE ${visible} GROUP BY g.id,g.key,gt.name,gt.slug,gt.description ORDER BY gt.slug`, {locale});
        return rows.map((row) => ({id: row.id, key: row.key, locale, name: row.name, slug: row.slug, ...(row.description === null ? {} : {description: row.description}), articleCount: count(row.article_count), canonical: `${this.siteOrigin}/${locale}/tags/${row.slug}`}));
    }
    async listSeries(locale: Locale): Promise<readonly SeriesSummary[]> {
        const rows = await this.query<{id: string; slug: string; title: string; description: string; difficulty: Difficulty | null; article_count: string}>(`SELECT s.id,st.slug,st.title,st.description,s.difficulty,count(DISTINCT a.id)::text article_count
            FROM series s JOIN series_translations st ON st.series_id=s.id AND st.locale=:locale AND st.status='published'
            JOIN series_articles sa ON sa.series_id=s.id JOIN articles a ON a.id=sa.article_id JOIN article_translations t ON t.article_id=a.id AND t.locale=:locale
            WHERE s.status='published' AND ${visible} GROUP BY s.id,st.slug,st.title,st.description,s.difficulty ORDER BY st.slug`, {locale});
        return rows.map((row) => ({id: row.id, locale, slug: row.slug, title: row.title, description: row.description, ...(row.difficulty ? {difficulty: row.difficulty} : {}), articleCount: count(row.article_count), canonical: `${this.siteOrigin}/${locale}/series/${row.slug}`}));
    }
    async getSeries(input: Readonly<{locale: Locale; slug: string}>): Promise<SeriesDetail | null> {
        const found = (await this.listSeries(input.locale)).find((item) => item.slug === input.slug);
        if (!found) return null;
        const rows = await this.query<Row>(`SELECT ${columns},sa.position ${joins} JOIN series_articles sa ON sa.article_id=a.id WHERE sa.series_id=:id AND t.locale=:locale AND ${visible} ORDER BY sa.position`, {id: found.id, locale: input.locale});
        const totals = await this.query<{total: string}>('SELECT count(*)::text total FROM series_articles WHERE series_id=:id', {id: found.id});
        const series = new Series({id: found.id, members: rows.map((row) => ({articleId: row.article_id, position: row.position!, locale: row.locale, translationPublished: true, articleArchived: false}))});
        return {...found, hasTranslationGaps: count(totals[0]!.total) > rows.length, members: rows.map((row) => {
            const navigation = series.navigation(input.locale, row.article_id);
            return {position: row.position!, article: this.summary(row),
                ...(navigation.previousArticleId ? {previousArticleId: navigation.previousArticleId} : {}),
                ...(navigation.nextArticleId ? {nextArticleId: navigation.nextArticleId} : {})};
        })};
    }
    async exportSnapshot(): Promise<PublicSnapshot> {
        if (!this.transaction) return await this.sequelize.transaction({isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ, readOnly: true}, async (transaction) => new PostgresArticleReader(this.sequelize, this.siteOrigin, transaction).exportSnapshot());
        const revision = await this.query<{revision: string | null; updated_at: Date}>('SELECT revision,updated_at FROM publication_current_revision WHERE singleton=true');
        if (!revision[0]?.revision) throw new Error('Cannot export an unpublished catalogue revision.');
        const rows = await this.query<Row>(`SELECT ${this.detailColumns()} ${joins} WHERE ${visible} ORDER BY t.locale,t.slug`);
        const articles = rows.map((row) => this.detail(row));
        const tags: TagSummary[] = []; const series: SeriesDetail[] = [];
        for (const locale of ['pt-BR', 'en'] as const) {
            tags.push(...await this.listTags(locale));
            for (const item of await this.listSeries(locale)) series.push((await this.getSeries({locale, slug: item.slug}))!);
        }
        const paths = await this.query<{locale: Locale; old_slug: string; slug: string}>(`SELECT p.locale,p.slug old_slug,t.slug FROM article_paths p JOIN article_translations t ON t.id=p.translation_id JOIN articles a ON a.id=t.article_id WHERE p.kind='redirect' AND ${visible} ORDER BY p.locale,p.slug`);
        const lastmod = revision[0].updated_at.toISOString();
        return {schemaVersion: 1, revision: revision[0].revision, generatedAt: new Date().toISOString(), siteOrigin: this.siteOrigin, articles, tags, series,
            redirects: paths.map((p) => ({from: `/${p.locale}/articles/${p.old_slug}`, to: `/${p.locale}/articles/${p.slug}`, status: 308})),
            urlCatalog: [...articles.map((a) => ({url: a.canonical, kind: 'article' as const, locale: a.locale, lastmod: a.updatedAt, alternates: a.alternates.map(({locale, url}) => ({locale, url}))})),
                ...tags.map((t) => ({url: t.canonical, kind: 'tag' as const, locale: t.locale, lastmod, alternates: []})),
                ...series.map((s) => ({url: s.canonical, kind: 'series' as const, locale: s.locale, lastmod, alternates: []}))]};
    }
}
