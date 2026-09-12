import {EditionImportService} from './editionImport.service';
import {ArticleTranslation} from '../entities/articleTranslation';
import {EditorialRules} from '../editorial-rules';
import type {EditionInput, ImportResult, Operator} from '../editorial.types';
import {PublishingConflictError, PublishingValidationError} from '../publishing.errors';
import type {IArticlePathService} from './articlePath.service.interface';
import type {IAuthorProfileService} from './authorProfile.service.interface';
import type {ICatalogService} from './catalog.service.interface';
import type {IContentValidationService} from './contentValidation.service.interface';
import type {IEditorialArticleService} from './editorialArticle.service.interface';
import type {IContentHashService, IEditorialClock, IEditorialUnitOfWork} from './editorialRuntime.interface';
import type {IEditorialTranslationService} from './editorialTranslation.service.interface';
import type {IPublicationService} from './publication.service.interface';
import type {IRevisionService} from './revision.service.interface';

type OperationIdentity = Readonly<{
    articleId: string;
    locale?: string;
    operator: Operator;
}>;

/**
 * Orchestrates revision-guarded editorial mutations within a write transaction.
 *
 * Content import is delegated to `EditionImportService`; visibility operations are recorded as
 * idempotent revision entries here.
 */
export class PublicationService implements IPublicationService {
    constructor(
        private readonly unitOfWork: IEditorialUnitOfWork,
        private readonly articles: IEditorialArticleService,
        private readonly translations: IEditorialTranslationService,
        private readonly authors: IAuthorProfileService,
        private readonly catalog: ICatalogService,
        private readonly revisions: IRevisionService,
        private readonly paths: IArticlePathService,
        private readonly validation: IContentValidationService,
        private readonly hashes: IContentHashService,
        private readonly clock: IEditorialClock
    ) {
    }

    /** Applies a complete catalog edition after its content and revision checks succeed. */
    async applyEdition(input: EditionInput): Promise<ImportResult> {
        return await new EditionImportService(
            this.unitOfWork, this.articles, this.translations, this.authors, this.catalog,
            this.revisions, this.paths, this.validation, this.hashes, this.clock
        ).applyEdition(input);
    }

    async publish(input: Readonly<{
        articleId: string;
        locale: string;
        expectedRevision: string;
        operator: Operator
    }>): Promise<ImportResult> {
        return await this.visibility(input, 'published');
    }

    async unpublish(input: Readonly<{
        articleId: string;
        locale: string;
        expectedRevision: string;
        operator: Operator;
        targetState: 'draft' | 'archived'
    }>): Promise<ImportResult> {
        return await this.visibility(input, input.targetState);
    }

    /** Restores an archived article or translation, optionally reporting the effect without writing. */
    async restore(input: Readonly<{articleId: string; locale?: string; expectedRevision: string; operator: Operator; reason: string; dryRun?: boolean}>): Promise<ImportResult> {
        return await this.unitOfWork.execute(async () => {
            const operation = input.locale ? 'restoreTranslation' : 'restoreArticle';
            const retry = await this.prepareOperation(input, operation, input.reason);
            if (retry) {
                return retry;
            }

            if (input.dryRun) {
                const article = await this.articles.findById(input.articleId);
                const translations = await this.translations.listForArticle(input.articleId);
                const visible = translations.filter((translation) => input.locale
                    ? translation.locale === input.locale && translation.status === 'archived'
                    : Boolean(article?.archivedAt) && translation.status === 'published');
                return {
                    revision: input.expectedRevision,
                    changed: visible.length > 0,
                    changes: visible.map((item) => ({kind: input.locale ? 'updated' : 'published', subject: item.id}))
                };
            }

            const article = await this.articles.findById(input.articleId);
            if (!article) {
                throw new PublishingValidationError('Article was not found.');
            }

            if (input.locale) {

                if (!EditorialRules.isLocale(input.locale)) {
                    throw new PublishingValidationError('Translation locale is not supported.');
                }

                const translation = await this.translations.findByArticleLocale(input.articleId, input.locale);

                if (!translation) {
                    throw new PublishingValidationError('Translation was not found.');
                }

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

            if (retry) {
                return retry;
            }
            const article = await this.articles.findById(input.articleId);

            if (!article) {
                throw new PublishingValidationError('Article was not found.');
            }
            await this.articles.save(article.archivedAt ? article : article.archive(this.clock.now()));
            return await this.recordOperation(input, 'archive', [{kind: 'archived', subject: input.articleId}], input.reason);
        });
    }

    private async visibility(input: Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>, status: 'published' | 'draft' | 'archived'): Promise<ImportResult> {
        return await this.unitOfWork.execute(async () => {
            if (!EditorialRules.isLocale(input.locale)) {
                throw new PublishingValidationError('Translation locale is not supported.');
            }

            const retry = await this.prepareOperation(input, status);
            if (retry) {
                return retry;
            }

            const article = await this.articles.findById(input.articleId);
            const translation = await this.translations.findByArticleLocale(input.articleId, input.locale);

            if (!article || !translation) {
                throw new PublishingValidationError('Translation was not found.');
            }

            const now = this.clock.now();
            const next = status === 'published' ? translation.publish(article, now)
                : status === 'archived' ? translation.archive(article, now)
                : translation.status === 'draft' ? ArticleTranslation.rehydrate({...translation.getProps(), updatedAt: now})
                : translation.unpublish(article, now);
            await this.translations.save(next);

            return await this.recordOperation(input, status, [{kind: status === 'published' ? 'published' : 'unpublished', subject: translation.id}]);
        });
    }

    private async assertRevision(expectedRevision: string): Promise<void> {
        const current = await this.revisions.current(true);

        if (!current.revision || current.revision !== expectedRevision) {
            throw new PublishingConflictError('Edition revision does not match the current revision.');
        }
    }

    private operationHash(input: OperationIdentity, operation: string, reason = input.operator.reason): string {
        return this.hashes.hash({operation, articleId: input.articleId, locale: input.locale, reason});
    }

    /**
     * Rejects malformed or stale operations and recognizes an already-recorded identical retry.
     */
    private async prepareOperation(
        input: {
            articleId: string; locale?: string; expectedRevision: string; operator: Operator
        },
        operation: string,
        reason = input.operator.reason
    ): Promise<ImportResult | null> {
        if (
            !EditorialRules.isUuid(input.articleId) ||
            input.operator.kind !== 'operator' ||
            !input.operator.id.trim() ||
            !input.operator.sourceRevision.trim() ||
            !reason?.trim()
        ) {
            throw new PublishingValidationError('Operation requires a UUID, operator, new revision and reason.');
        }

        const current = await this.revisions.current(true);
        const previous = await this.revisions.find(input.operator.sourceRevision);
        if (previous) {
            if (previous.contentHash !== this.operationHash(input, operation, reason)) throw new PublishingConflictError('An existing revision cannot identify another operation.');
            return {revision: current.revision!, changed: false, changes: []};
        }
        await this.assertRevision(input.expectedRevision);
        return null;
    }

    private async recordOperation(
        input: {
            articleId: string; locale?: string; operator: Operator
        },
        operation: string,
        changes: ImportResult['changes'],
        reason = input.operator.reason
    ): Promise<ImportResult> {
        const revision = input.operator.sourceRevision;
        await this.revisions.record({
            revision,
            contentHash: this.operationHash(input, operation, reason),
            gitCommit: revision,
            actorId: input.operator.id,
            appliedAt: this.clock.now(),
            report: {operation, reason, changes}
        });

        return {revision, changed: true, changes};
    }


}
