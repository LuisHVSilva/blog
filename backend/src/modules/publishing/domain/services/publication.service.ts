import type {EditionInput, ImportResult, Operator} from '../editorial.types';
import {PublishingConflictError, PublishingValidationError} from '../publishing.errors';
import {EditorialRules, Article, ArticleTranslation} from '../article';
import {defaultAuthorId} from './authorProfile.service';
import type {IPublicationService} from './publication.service.interface';
import type {IEditorialArticleService} from './editorialArticle.service.interface';
import type {IEditorialTranslationService} from './editorialTranslation.service.interface';
import type {IAuthorProfileService} from './authorProfile.service.interface';
import type {ICatalogService} from './catalog.service.interface';
import type {IRevisionService} from './revision.service.interface';
import type {IArticlePathService} from './articlePath.service.interface';
import type {IContentValidationService} from './contentValidation.service.interface';
import type {IEditorialClock, IContentHashService, IEditorialUnitOfWork} from './editorialRuntime.interface';

export class PublicationService implements IPublicationService {
    constructor(private readonly unitOfWork: IEditorialUnitOfWork, private readonly articles: IEditorialArticleService,
        private readonly translations: IEditorialTranslationService, private readonly authors: IAuthorProfileService,
        private readonly catalog: ICatalogService, private readonly revisions: IRevisionService,
        private readonly paths: IArticlePathService, private readonly validation: IContentValidationService,
        private readonly hashes: IContentHashService, private readonly clock: IEditorialClock) {}
    async applyEdition(input: EditionInput): Promise<ImportResult> {
        if (input.operator.kind !== 'operator' || !input.operator.id || !input.operator.sourceRevision) throw new PublishingValidationError('An operational actor and source revision are required.');
        if (!input.articles.length) throw new PublishingValidationError('An edition must contain translations.');
        const validation = this.validation.validate(input.articles.map((item) => ({...item, file: item.translationId, body: item.bodyMarkdown})));
        if (!validation.valid) throw new PublishingValidationError('Edition content is invalid.');
        const revision = input.operator.sourceRevision; const contentHash = this.hashes.hash({articles: input.articles, catalog: input.catalog});
        return await this.unitOfWork.execute(async () => {
            const current = await this.revisions.current(true);
            const previousEdition = await this.revisions.find(revision);
            if (previousEdition) {
                if (previousEdition.contentHash !== contentHash) throw new PublishingConflictError('An existing revision cannot identify different content.');
                return {revision: current.revision!, changed: false, changes: []};
            }
            if (current.revision && input.expectedRevision !== current.revision) throw new PublishingConflictError('Edition revision does not match the current revision.');
            if (!current.revision && input.expectedRevision) throw new PublishingConflictError('The empty catalogue does not accept a non-empty expected revision.');
            const changes: ImportResult['changes'][number][] = [];
            for (const article of input.articles) {
                await this.paths.assertAvailable(article.locale, article.slug, article.translationId);
                const row = await this.translations.findById(article.translationId);
                if (article.sourceRevision && article.sourceRevision !== this.hashes.revision(article)) throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
                if ([article.updatedAt, article.publishedAt].some((value) => value && (!Number.isFinite(Date.parse(value)) || Date.parse(value) > this.clock.now().getTime()))) throw new PublishingValidationError('Invalid or future editorial date.');
                if (row && (row.articleId !== article.articleId || row.locale !== article.locale)) throw new PublishingConflictError('Translation identity cannot be reassigned.');
                const unchanged = row && row.slug === article.slug && row.title === article.title && row.description === article.description && row.bodyMarkdown === article.bodyMarkdown && this.hashes.hash(row.seo) === this.hashes.hash(article.seo);
                changes.push({kind: !row ? 'created' : unchanged ? 'unchanged' : 'updated', subject: article.translationId});
            }
            if (input.catalog) await this.catalog.validate(input.catalog);
            if (input.dryRun) return {revision: current.revision ?? '', changed: true, changes};
            if (input.catalog) await this.catalog.write(input.catalog, this.clock.now());
            await this.writeEdition(input);
            if (input.catalog) await this.catalog.writeRelations(input.catalog, this.clock.now());
            await this.revisions.record({revision, contentHash, gitCommit: revision, actorId: input.operator.id, appliedAt: this.clock.now(), report: {changes, operations: input.catalog?.operations ?? []}});
            return {revision, changed: true, changes};
        });
    }

    async publish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>): Promise<ImportResult> { return await this.visibility(input, 'published'); }
    async unpublish(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator; targetState: 'draft' | 'archived'}>): Promise<ImportResult> { return await this.visibility(input, input.targetState); }
    async restore(input: Readonly<{articleId: string; locale?: string; expectedRevision: string; operator: Operator; reason: string; dryRun?: boolean}>): Promise<ImportResult> {
        return await this.unitOfWork.execute(async () => {
            const operation = input.locale ? 'restoreTranslation' : 'restoreArticle';
            const retry = await this.prepareOperation(input, operation, input.reason);
            if (retry) return retry;
            if (input.dryRun) {
                const article = await this.articles.findById(input.articleId);
                const translations = await this.translations.listForArticle(input.articleId);
                const visible = translations.filter((translation) => input.locale
                    ? translation.locale === input.locale && translation.status === 'archived'
                    : Boolean(article?.archivedAt) && translation.status === 'published');
                return {revision: input.expectedRevision, changed: visible.length > 0, changes: visible.map((item) => ({kind: input.locale ? 'updated' : 'published', subject: item.id}))};
            }
            const article = await this.articles.findById(input.articleId);
            if (!article) throw new PublishingValidationError('Article was not found.');
            if (input.locale) {
                if (!EditorialRules.isLocale(input.locale)) throw new PublishingValidationError('Translation locale is not supported.');
                const translation = await this.translations.findByArticleLocale(input.articleId, input.locale);
                if (!translation) throw new PublishingValidationError('Translation was not found.');
                await this.translations.save(translation.restore(article, this.clock.now()));
            } else {
                await this.articles.save(article.restore());
            }
            return await this.recordOperation(input, operation, [{kind: 'updated', subject: input.articleId}], input.reason);
        });
    }
    async archive(input: Readonly<{articleId: string; expectedRevision: string; operator: Operator; reason: string}>): Promise<ImportResult> {
        if (!input.reason.trim()) throw new PublishingValidationError('Archive reason is required.');
        return await this.unitOfWork.execute(async () => {
            const retry = await this.prepareOperation(input, 'archive', input.reason);
            if (retry) return retry;
            const article = await this.articles.findById(input.articleId);
            if (!article) throw new PublishingValidationError('Article was not found.');
            await this.articles.save(article.archivedAt ? article : article.archive(this.clock.now()));
            return await this.recordOperation(input, 'archive', [{kind: 'archived', subject: input.articleId}], input.reason);
        });
    }

    private async visibility(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>, status: 'published' | 'draft' | 'archived'): Promise<ImportResult> {
        return await this.unitOfWork.execute(async () => {
            if (!EditorialRules.isLocale(input.locale)) throw new PublishingValidationError('Translation locale is not supported.');
            const retry = await this.prepareOperation(input, status);
            if (retry) return retry;
            const article = await this.articles.findById(input.articleId);
            const translation = await this.translations.findByArticleLocale(input.articleId, input.locale);
            if (!article || !translation) throw new PublishingValidationError('Translation was not found.');
            const now = this.clock.now();
            const next = status === 'published' ? translation.publish(article, now)
                : status === 'archived' ? translation.archive(article, now)
                : translation.status === 'draft' ? ArticleTranslation.rehydrate({...translation.getProps(), updatedAt: now})
                : translation.unpublish(article, now);
            await this.translations.save(next);
            return await this.recordOperation(input, status, [{kind: status === 'published' ? 'published' : 'unpublished', subject: translation.id}]);
        });
    }

    private async assertRevision(expectedRevision: string) {
        const current = await this.revisions.current(true);
        if (!current.revision || current.revision !== expectedRevision) throw new PublishingConflictError('Edition revision does not match the current revision.');
    }
    private operationHash(input: {articleId: string; locale?: string; operator: Operator}, operation: string, reason = input.operator.reason) {
        return this.hashes.hash({operation, articleId: input.articleId, locale: input.locale, reason});
    }
    private async prepareOperation(input: {articleId: string; locale?: string; expectedRevision: string; operator: Operator}, operation: string, reason = input.operator.reason): Promise<ImportResult | null> {
        if (!EditorialRules.isUuid(input.articleId) || input.operator.kind !== 'operator' || !input.operator.id.trim() || !input.operator.sourceRevision.trim() || !reason?.trim()) throw new PublishingValidationError('Operation requires a UUID, operator, new revision and reason.');
        const current = await this.revisions.current(true);
        const previous = await this.revisions.find(input.operator.sourceRevision);
        if (previous) {
            if (previous.contentHash !== this.operationHash(input, operation, reason)) throw new PublishingConflictError('An existing revision cannot identify another operation.');
            return {revision: current.revision!, changed: false, changes: []};
        }
        await this.assertRevision(input.expectedRevision);
        return null;
    }
    private async recordOperation(input: {articleId: string; locale?: string; operator: Operator}, operation: string, changes: ImportResult['changes'], reason = input.operator.reason): Promise<ImportResult> {
        const revision = input.operator.sourceRevision;
        await this.revisions.record({revision, contentHash: this.operationHash(input, operation, reason), gitCommit: revision, actorId: input.operator.id, appliedAt: this.clock.now(), report: {operation, reason, changes}});
        return {revision, changed: true, changes};
    }
    private async writeEdition(input: EditionInput) {
        await this.authors.ensureDefault(this.clock.now());
        for (const item of input.articles) {
            const shared = input.catalog?.articles.find((article) => article.id === item.articleId);
            const previousArticle = await this.articles.findById(item.articleId);
            const article = previousArticle
                ? Article.rehydrate({...previousArticle.getProps(), difficulty: item.difficulty})
                : new Article({id: item.articleId, sourceLocale: item.sourceLocale, authorId: shared?.authorId ?? defaultAuthorId,
                    difficulty: item.difficulty, createdAt: shared ? new Date(shared.createdAt) : this.clock.now(), archivedAt: null});
            await this.articles.save(article);
            const previous = await this.translations.findById(item.translationId);
            if (previous && (previous.articleId !== item.articleId || previous.locale !== item.locale)) throw new PublishingConflictError('Translation identity cannot be reassigned.');
            const revision = this.hashes.revision(item);
            if (item.sourceRevision && item.sourceRevision !== revision) throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
            let translation = new ArticleTranslation({
                id: item.translationId, articleId: item.articleId, locale: item.locale, slug: item.slug,
                title: item.title, description: item.description, bodyMarkdown: item.bodyMarkdown, seo: item.seo,
                status: previous?.status ?? 'draft', publishedAt: previous?.publishedAt ?? null,
                updatedAt: previous?.sourceRevision === revision ? previous.updatedAt : item.updatedAt ? new Date(item.updatedAt) : this.clock.now(),
                sourceRevision: revision, translatedFromRevision: item.translatedFromRevision ?? null,
                readingMinutes: item.readingMinutes ?? Math.max(1, Math.ceil(item.bodyMarkdown.trim().split(/\s+/u).length / 200)),
            });
            if (item.status === 'published') {
                if (!translation.publishedAt && item.publishedAt) translation = ArticleTranslation.rehydrate({...translation.getProps(), publishedAt: new Date(item.publishedAt)});
                const published = translation.publish(article, this.clock.now());
                translation = ArticleTranslation.rehydrate({...published.getProps(), updatedAt: translation.updatedAt});
            } else if (item.status && item.status !== translation.status) throw new PublishingValidationError('Withdrawing or restoring content requires an explicit operation.');
            await this.translations.save(translation);
            await this.paths.assign(item.locale, item.slug, item.translationId, previous?.slug, Boolean(previous?.publishedAt));
        }
    }
}
