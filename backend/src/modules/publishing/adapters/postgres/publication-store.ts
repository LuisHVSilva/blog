import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';
import type {EditionInput, ImportResult, Operator} from '../../application/content.dto';
import type {PublicationStore} from '../../application/ports/publication-store';
import {PublishingConflictError, PublishingValidationError} from '../../application/publishing.errors';
import {PublicationPolicy} from '../../domain/publication-policy';
import {EditorialRules, Article, ArticleTranslation} from '../../domain/article';
import {validateContent} from '../../application/validate-content';
import {validateCatalogState, writeCatalog, writeCatalogRelations} from './catalog-store';
import {canonicalHash as hash, contentRevision} from '../content-revision';

const defaultAuthor = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

export class PostgresPublicationStore implements PublicationStore {
    constructor(private readonly sequelize: Sequelize, private readonly now: () => Date = () => new Date()) {}

    async applyEdition(input: EditionInput): Promise<ImportResult> {
        if (input.operator.kind !== 'operator' || !input.operator.id || !input.operator.sourceRevision) throw new PublishingValidationError('An operational actor and source revision are required.');
        if (!input.articles.length) throw new PublishingValidationError('An edition must contain translations.');
        const validation = validateContent(input.articles.map((item) => ({...item, file: item.translationId, body: item.bodyMarkdown})));
        if (!validation.valid) throw new PublishingValidationError('Edition content is invalid.');
        const revision = input.operator.sourceRevision; const contentHash = hash({articles: input.articles, catalog: input.catalog});
        return await this.sequelize.transaction(async (transaction) => {
            const current = await this.current(transaction);
            const previousEdition = await this.sequelize.query<{content_hash: string}>('SELECT content_hash FROM publication_editions WHERE revision=:revision', {transaction, replacements: {revision}, type: QueryTypes.SELECT});
            if (previousEdition[0]) {
                if (previousEdition[0].content_hash !== contentHash) throw new PublishingConflictError('An existing revision cannot identify different content.');
                return {revision: current.revision!, changed: false, changes: []};
            }
            if (current.revision && input.expectedRevision !== current.revision) throw new PublishingConflictError('Edition revision does not match the current revision.');
            if (!current.revision && input.expectedRevision) throw new PublishingConflictError('The empty catalogue does not accept a non-empty expected revision.');
            const changes: ImportResult['changes'][number][] = [];
            for (const article of input.articles) {
                const owners = await this.sequelize.query<{translation_id: string}>('SELECT translation_id FROM article_paths WHERE locale=:locale AND slug=:slug', {transaction, replacements: {locale: article.locale, slug: article.slug}, type: QueryTypes.SELECT});
                if (owners[0] && owners[0].translation_id !== article.translationId) throw new PublishingConflictError('Slug is already reserved.');
                const previous = await this.sequelize.query<{article_id: string; locale: string; slug: string; title: string; description: string; body_markdown: string; seo: unknown}>('SELECT article_id,locale,slug,title,description,body_markdown,seo FROM article_translations WHERE id=:id', {transaction, replacements: {id: article.translationId}, type: QueryTypes.SELECT});
                const row = previous[0];
                if (article.sourceRevision && article.sourceRevision !== contentRevision(article)) throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
                if ([article.updatedAt, article.publishedAt].some((value) => value && (!Number.isFinite(Date.parse(value)) || Date.parse(value) > this.now().getTime()))) throw new PublishingValidationError('Invalid or future editorial date.');
                if (row && (row.article_id !== article.articleId || row.locale !== article.locale)) throw new PublishingConflictError('Translation identity cannot be reassigned.');
                const unchanged = row && row.slug === article.slug && row.title === article.title && row.description === article.description && row.body_markdown === article.bodyMarkdown && hash(row.seo) === hash(article.seo);
                changes.push({kind: !row ? 'created' : unchanged ? 'unchanged' : 'updated', subject: article.translationId});
            }
            if (input.catalog) await validateCatalogState(this.sequelize, transaction, input.catalog);
            if (input.dryRun) return {revision: current.revision ?? '', changed: true, changes};
            if (input.catalog) await writeCatalog(this.sequelize, transaction, input.catalog, this.now());
            await this.writeEdition(input, transaction);
            if (input.catalog) await writeCatalogRelations(this.sequelize, transaction, input.catalog, this.now());
            await this.sequelize.query(`INSERT INTO publication_editions(revision, content_hash, git_commit, actor_id, applied_at, report) VALUES (:revision,:contentHash,:commit,:actor,:now,:report::jsonb)`, {transaction, replacements: {revision, contentHash, commit: revision, actor: input.operator.id, now: this.now(), report: JSON.stringify({changes, operations: input.catalog?.operations ?? []})}});
            await this.sequelize.query('UPDATE publication_current_revision SET revision=:revision, updated_at=:now WHERE singleton=true', {transaction, replacements: {revision, now: this.now()}});
            return {revision, changed: true, changes};
        });
    }

    async publish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>): Promise<ImportResult> { return await this.visibility(input, 'published'); }
    async unpublish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator; targetState: 'draft' | 'archived'}>): Promise<ImportResult> { return await this.visibility(input, input.targetState); }
    async restore(input: Readonly<{articleId: string; locale?: string; expectedRevision: string; operator: Operator; reason: string; dryRun?: boolean}>): Promise<ImportResult> {
        return await this.sequelize.transaction(async (transaction) => {
            const operation = input.locale ? 'restoreTranslation' : 'restoreArticle';
            const retry = await this.prepareOperation(input, operation, transaction, input.reason);
            if (retry) return retry;
            if (input.dryRun) {
                const visible = await this.sequelize.query<{id: string}>(`SELECT t.id FROM article_translations t JOIN articles a ON a.id=t.article_id WHERE a.id=:articleId AND
                    ((:locale IS NULL AND a.archived_at IS NOT NULL AND t.status='published') OR (:locale IS NOT NULL AND t.locale=:locale AND t.status='archived'))`,
                    {transaction, replacements: {articleId: input.articleId, locale: input.locale ?? null}, type: QueryTypes.SELECT});
                return {revision: input.expectedRevision, changed: visible.length > 0, changes: visible.map((item) => ({kind: input.locale ? 'updated' : 'published', subject: item.id}))};
            }
            if (input.locale) {
                if (!EditorialRules.isLocale(input.locale)) throw new PublishingValidationError('Translation locale is not supported.');
                const rows = await this.sequelize.query<{id: string}>(`UPDATE article_translations SET status='draft',updated_at=:now WHERE article_id=:articleId AND locale=:locale AND status='archived' RETURNING id`, {transaction, replacements: {articleId: input.articleId, locale: input.locale, now: this.now()}, type: QueryTypes.SELECT});
                if (!rows.length) throw new PublishingValidationError('Only an archived translation can be restored.');
            } else {
                const rows = await this.sequelize.query<{id: string}>('UPDATE articles SET archived_at=NULL WHERE id=:articleId AND archived_at IS NOT NULL RETURNING id', {transaction, replacements: {articleId: input.articleId}, type: QueryTypes.SELECT});
                if (!rows.length) throw new PublishingValidationError('Only an archived article can be restored.');
            }
            return await this.recordOperation(input, operation, [{kind: 'updated', subject: input.articleId}], transaction, input.reason);
        });
    }
    async archive(input: Readonly<{articleId: string; expectedRevision: string; operator: Operator; reason: string}>): Promise<ImportResult> {
        if (!input.reason.trim()) throw new PublishingValidationError('Archive reason is required.');
        return await this.sequelize.transaction(async (transaction) => {
            const retry = await this.prepareOperation(input, 'archive', transaction, input.reason);
            if (retry) return retry;
            const rows = await this.sequelize.query<{id: string}>('SELECT id FROM articles WHERE id=:articleId FOR UPDATE', {transaction, replacements: {articleId: input.articleId}, type: QueryTypes.SELECT});
            if (!rows[0]) throw new PublishingValidationError('Article was not found.');
            await this.sequelize.query('UPDATE articles SET archived_at=:now WHERE id=:articleId AND archived_at IS NULL', {transaction, replacements: {articleId: input.articleId, now: this.now()}});
            return await this.recordOperation(input, 'archive', [{kind: 'archived', subject: input.articleId}], transaction, input.reason);
        });
    }

    private async visibility(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>, status: 'published' | 'draft' | 'archived'): Promise<ImportResult> {
        return await this.sequelize.transaction(async (transaction) => {
            if (!EditorialRules.isLocale(input.locale)) throw new PublishingValidationError('Translation locale is not supported.');
            const retry = await this.prepareOperation(input, status, transaction);
            if (retry) return retry;
            const rows = await this.sequelize.query<{id: string; published_at: Date | null; status: ArticleTranslation['status']; slug: string; title: string; description: string; body_markdown: string; updated_at: Date; source_revision: string; translated_from_revision: string | null; reading_minutes: number; seo: ArticleTranslation['seo']; source_locale: Article['sourceLocale']; author_id: string; difficulty: Article['difficulty']; created_at: Date; archived_at: Date | null}>(`SELECT t.*,a.source_locale,a.author_id,a.difficulty,a.created_at,a.archived_at FROM article_translations t JOIN articles a ON a.id=t.article_id WHERE t.article_id=:articleId AND t.locale=:locale FOR UPDATE OF t,a`, {transaction, replacements: {articleId: input.articleId, locale: input.locale}, type: QueryTypes.SELECT});
            if (!rows[0]) throw new PublishingValidationError('Translation was not found.');
            const row = rows[0];
            const article = Article.rehydrate({id: input.articleId, sourceLocale: row.source_locale, authorId: row.author_id, difficulty: row.difficulty, createdAt: row.created_at, archivedAt: row.archived_at});
            const translation = ArticleTranslation.rehydrate({id: row.id, articleId: input.articleId, locale: input.locale, slug: row.slug, title: row.title, description: row.description, bodyMarkdown: row.body_markdown, status: row.status, publishedAt: row.published_at, updatedAt: row.updated_at, sourceRevision: row.source_revision, translatedFromRevision: row.translated_from_revision, readingMinutes: row.reading_minutes, seo: row.seo});
            if (status === 'published') PublicationPolicy.transition(article, translation, 'publish', this.now());
            if (status === 'draft' && row.status !== 'draft') PublicationPolicy.transition(article, translation, 'unpublish', this.now());
            if (status === 'published') await this.sequelize.query(`UPDATE article_translations SET status='published', published_at=COALESCE(published_at,:now), updated_at=:now WHERE id=:id`, {transaction, replacements: {id: rows[0].id, now: this.now()}});
            else await this.sequelize.query('UPDATE article_translations SET status=:status, updated_at=:now WHERE id=:id', {transaction, replacements: {id: rows[0].id, status, now: this.now()}});
            return await this.recordOperation(input, status, [{kind: status === 'published' ? 'published' : 'unpublished', subject: rows[0].id}], transaction);
        });
    }

    private async current(transaction: Transaction): Promise<{revision: string | null; contentHash: string | null}> {
        const rows = await this.sequelize.query<{revision: string | null; content_hash: string | null}>(`SELECT current.revision, edition.content_hash FROM publication_current_revision current LEFT JOIN publication_editions edition ON edition.revision=current.revision WHERE current.singleton=true FOR UPDATE OF current`, {transaction, type: QueryTypes.SELECT});
        return {revision: rows[0]?.revision ?? null, contentHash: rows[0]?.content_hash ?? null};
    }
    private async assertRevision(expectedRevision: string, transaction: Transaction) { const current = await this.current(transaction); if (!current.revision || current.revision !== expectedRevision) throw new PublishingConflictError('Edition revision does not match the current revision.'); }
    private operationHash(input: {articleId: string; locale?: string; operator: Operator}, operation: string, reason = input.operator.reason) {
        return hash({operation, articleId: input.articleId, locale: input.locale, reason});
    }
    private async prepareOperation(input: {articleId: string; locale?: string; expectedRevision: string; operator: Operator}, operation: string, transaction: Transaction, reason = input.operator.reason): Promise<ImportResult | null> {
        if (!EditorialRules.isUuid(input.articleId) || input.operator.kind !== 'operator' || !input.operator.id.trim() || !input.operator.sourceRevision.trim() || !reason?.trim()) throw new PublishingValidationError('Operation requires a UUID, operator, new revision and reason.');
        const current = await this.current(transaction);
        const previous = await this.sequelize.query<{content_hash: string}>('SELECT content_hash FROM publication_editions WHERE revision=:revision', {transaction, replacements: {revision: input.operator.sourceRevision}, type: QueryTypes.SELECT});
        if (previous[0]) {
            if (previous[0].content_hash !== this.operationHash(input, operation, reason)) throw new PublishingConflictError('An existing revision cannot identify another operation.');
            return {revision: current.revision!, changed: false, changes: []};
        }
        await this.assertRevision(input.expectedRevision, transaction);
        return null;
    }
    private async recordOperation(input: {articleId: string; locale?: string; operator: Operator}, operation: string, changes: ImportResult['changes'], transaction: Transaction, reason = input.operator.reason): Promise<ImportResult> {
        const revision = input.operator.sourceRevision;
        await this.sequelize.query(`INSERT INTO publication_editions(revision,content_hash,git_commit,actor_id,applied_at,report) VALUES (:revision,:contentHash,:revision,:actor,:now,:report::jsonb)`, {transaction, replacements: {revision, contentHash: this.operationHash(input, operation, reason), actor: input.operator.id, now: this.now(), report: JSON.stringify({operation, reason, changes})}});
        await this.sequelize.query('UPDATE publication_current_revision SET revision=:revision,updated_at=:now WHERE singleton=true', {transaction, replacements: {revision, now: this.now()}});
        return {revision, changed: true, changes};
    }
    private async writeEdition(input: EditionInput, transaction: Transaction) {
        await this.sequelize.query(`INSERT INTO author_profiles(id,display_name,profile_slug) VALUES (:id,'Editorial maintainer','editorial-maintainer') ON CONFLICT(id) DO NOTHING`, {transaction, replacements: {id: defaultAuthor}});
        for (const item of input.articles) {
            const shared = input.catalog?.articles.find((article) => article.id === item.articleId);
            await this.sequelize.query(`INSERT INTO articles(id,source_locale,author_id,difficulty,created_at) VALUES (:id,:sourceLocale,:author,:difficulty,:now) ON CONFLICT(id) DO UPDATE SET difficulty=EXCLUDED.difficulty`, {transaction, replacements: {id: item.articleId, sourceLocale: item.sourceLocale, author: shared?.authorId ?? defaultAuthor, difficulty: item.difficulty, now: shared?.createdAt ?? this.now()}});
            const previous = await this.sequelize.query<{slug: string; status: string; published_at: Date | null; article_id: string; locale: string}>('SELECT slug,status,published_at,article_id,locale FROM article_translations WHERE id=:id FOR UPDATE', {transaction, replacements: {id: item.translationId}, type: QueryTypes.SELECT});
            if (previous[0] && (previous[0].article_id !== item.articleId || previous[0].locale !== item.locale)) throw new PublishingConflictError('Translation identity cannot be reassigned.');
            const revision = contentRevision(item);
            if (item.sourceRevision && item.sourceRevision !== revision) throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
            await this.sequelize.query(`INSERT INTO article_translations(id,article_id,locale,slug,title,description,body_markdown,status,published_at,updated_at,source_revision,translated_from_revision,reading_minutes,seo)
                VALUES (:id,:articleId,:locale,:slug,:title,:description,:body,'draft',NULL,:now,:sourceRevision,:translatedFromRevision,:minutes,:seo::jsonb)
                ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,title=EXCLUDED.title,description=EXCLUDED.description,body_markdown=EXCLUDED.body_markdown,
                updated_at=CASE WHEN article_translations.source_revision IS DISTINCT FROM EXCLUDED.source_revision THEN EXCLUDED.updated_at ELSE article_translations.updated_at END,
                source_revision=EXCLUDED.source_revision,translated_from_revision=EXCLUDED.translated_from_revision,reading_minutes=EXCLUDED.reading_minutes,seo=EXCLUDED.seo`,
                {transaction, replacements: {id: item.translationId, articleId: item.articleId, locale: item.locale, slug: item.slug, title: item.title, description: item.description, body: item.bodyMarkdown,
                    now: item.updatedAt ?? this.now(), sourceRevision: revision, translatedFromRevision: item.translatedFromRevision ?? null, minutes: item.readingMinutes ?? Math.max(1, Math.ceil(item.bodyMarkdown.trim().split(/\s+/u).length / 200)), seo: JSON.stringify(item.seo)}});
            if (previous[0] && previous[0].slug !== item.slug) {
                if (previous[0].published_at) await this.sequelize.query(`UPDATE article_paths SET kind='redirect' WHERE translation_id=:id AND kind='current'`, {transaction, replacements: {id: item.translationId}});
                else await this.sequelize.query(`DELETE FROM article_paths WHERE translation_id=:id AND kind='current'`, {transaction, replacements: {id: item.translationId}});
            }
            await this.sequelize.query(`INSERT INTO article_paths(locale,slug,translation_id,kind) VALUES (:locale,:slug,:id,'current') ON CONFLICT(locale,slug) DO NOTHING`, {transaction, replacements: {locale: item.locale, slug: item.slug, id: item.translationId}});
            const owner = await this.sequelize.query<{translation_id: string}>('SELECT translation_id FROM article_paths WHERE locale=:locale AND slug=:slug FOR UPDATE', {transaction, replacements: {locale: item.locale, slug: item.slug}, type: QueryTypes.SELECT});
            if (owner[0]?.translation_id !== item.translationId) throw new PublishingConflictError('Slug is already reserved.');
            await this.sequelize.query(`UPDATE article_paths SET kind='current' WHERE locale=:locale AND slug=:slug AND translation_id=:id`, {transaction, replacements: {locale: item.locale, slug: item.slug, id: item.translationId}});
            if (item.readingMinutes) await this.sequelize.query('UPDATE article_translations SET reading_minutes=:minutes WHERE id=:id', {transaction, replacements: {minutes: item.readingMinutes, id: item.translationId}});
            if (item.status === 'published') {
                const parents = await this.sequelize.query<{archived_at: Date | null; created_at: Date}>('SELECT archived_at,created_at FROM articles WHERE id=:id', {transaction, replacements: {id: item.articleId}, type: QueryTypes.SELECT});
                const decision = PublicationPolicy.transition(Article.rehydrate({id: item.articleId, sourceLocale: item.sourceLocale, authorId: item.authorId, difficulty: item.difficulty, createdAt: parents[0]!.created_at, archivedAt: parents[0]!.archived_at}),
                    ArticleTranslation.rehydrate({id: item.translationId, articleId: item.articleId, locale: item.locale, slug: item.slug, title: item.title, description: item.description, bodyMarkdown: item.bodyMarkdown,
                        status: (previous[0]?.status ?? 'draft') as ArticleTranslation['status'], publishedAt: previous[0]?.published_at ?? (item.publishedAt ? new Date(item.publishedAt) : null), updatedAt: item.updatedAt ? new Date(item.updatedAt) : this.now(), sourceRevision: revision, translatedFromRevision: item.translatedFromRevision ?? null, readingMinutes: item.readingMinutes ?? 1, seo: item.seo}), 'publish', this.now());
                await this.sequelize.query(`UPDATE article_translations SET status='published',published_at=:publishedAt WHERE id=:id`, {transaction, replacements: {id: item.translationId, publishedAt: decision.publishedAt}});
            } else if (item.status && item.status !== (previous[0]?.status ?? 'draft')) throw new PublishingValidationError('Withdrawing or restoring content requires an explicit operation.');
        }
    }
}
