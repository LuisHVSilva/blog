import {Article} from '../article';
import {ArticleTranslation} from '../entities/articleTranslation';
import type {EditionInput, ImportResult} from '../editorial.types';
import {PublishingConflictError, PublishingValidationError} from '../publishing.errors';
import {defaultAuthorId} from './authorProfile.service';
import type {IArticlePathService} from './articlePath.service.interface';
import type {IAuthorProfileService} from './authorProfile.service.interface';
import type {ICatalogService} from './catalog.service.interface';
import type {IContentValidationService} from './contentValidation.service.interface';
import type {IEditorialArticleService} from './editorialArticle.service.interface';
import type {IContentHashService, IEditorialClock, IEditorialUnitOfWork} from './editorialRuntime.interface';
import type {IEditorialTranslationService} from './editorialTranslation.service.interface';
import type {IRevisionService} from './revision.service.interface';

/** Applies a complete editorial edition within one revision-controlled transaction. */
export class EditionImportService {
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

    async applyEdition(input: EditionInput): Promise<ImportResult> {
        if (input.operator.kind !== 'operator' || !input.operator.id || !input.operator.sourceRevision) {
            throw new PublishingValidationError('An operational actor and source revision are required.');
        }
        if (!input.articles.length) {
            throw new PublishingValidationError('An edition must contain translations.');
        }

        const validation = this.validation.validate(input.articles.map((item) => ({
            ...item,
            file: item.translationId,
            body: item.bodyMarkdown
        })));
        if (!validation.valid) {
            throw new PublishingValidationError('Edition content is invalid.');
        }

        const revision = input.operator.sourceRevision;
        const contentHash = this.hashes.hash({articles: input.articles, catalog: input.catalog});

        return await this.unitOfWork.execute(async () => {
            const current = await this.revisions.current(true);
            const previousEdition = await this.revisions.find(revision);
            if (previousEdition) {
                if (previousEdition.contentHash !== contentHash) {
                    throw new PublishingConflictError('An existing revision cannot identify different content.');
                }

                return {revision: current.revision!, changed: false, changes: []};
            }

            if (current.revision && input.expectedRevision !== current.revision) {
                throw new PublishingConflictError('Edition revision does not match the current revision.');
            }

            if (!current.revision && input.expectedRevision) {
                throw new PublishingConflictError('The empty catalogue does not accept a non-empty expected revision.');
            }

            const changes: ImportResult['changes'][number][] = [];
            for (const article of input.articles) {
                await this.paths.assertAvailable(article.locale, article.slug, article.translationId);
                const row = await this.translations.findById(article.translationId);
                if (article.sourceRevision && article.sourceRevision !== this.hashes.revision(article)) {
                    throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
                }

                if ([article.updatedAt, article.publishedAt].some((value) =>
                    value && (!Number.isFinite(Date.parse(value)) || Date.parse(value) > this.clock.now().getTime()))) {
                    throw new PublishingValidationError('Invalid or future editorial date.');
                }

                if (row && (row.articleId !== article.articleId || row.locale !== article.locale)) {
                    throw new PublishingConflictError('Translation identity cannot be reassigned.');
                }

                const unchanged = row && row.slug === article.slug && row.title === article.title && row.description === article.description && row.bodyMarkdown === article.bodyMarkdown && this.hashes.hash(row.seo) === this.hashes.hash(article.seo);
                changes.push({
                    kind: !row ? 'created' : unchanged ? 'unchanged' : 'updated',
                    subject: article.translationId
                });
            }

            if (input.catalog) {
                await this.catalog.validate(input.catalog);
            }

            if (input.dryRun) {
                return {revision: current.revision ?? '', changed: true, changes};
            }

            if (input.catalog) {
                await this.catalog.write(input.catalog, this.clock.now());
            }
            await this.writeEdition(input);

            if (input.catalog) {
                await this.catalog.writeRelations(input.catalog, this.clock.now());
            }

            await this.revisions.record({
                revision,
                contentHash,
                gitCommit: revision,
                actorId: input.operator.id,
                appliedAt: this.clock.now(),
                report: {changes, operations: input.catalog?.operations ?? []}
            });
            return {revision, changed: true, changes};
        });
    }

    private async writeEdition(input: EditionInput) {
        await this.authors.ensureDefault(this.clock.now());
        for (const item of input.articles) {
            const shared = input.catalog?.articles.find((article) => article.id === item.articleId);
            const previousArticle = await this.articles.findById(item.articleId);
            const article = previousArticle
                ? Article.rehydrate({...previousArticle.getProps(), difficulty: item.difficulty})
                : new Article({
                    id: item.articleId,
                    sourceLocale: item.sourceLocale,
                    authorId: shared?.authorId ?? defaultAuthorId,
                    difficulty: item.difficulty,
                    createdAt: shared ? new Date(shared.createdAt) : this.clock.now(),
                    archivedAt: null
                });
            await this.articles.save(article);
            const previous = await this.translations.findById(item.translationId);

            if (previous && (previous.articleId !== item.articleId || previous.locale !== item.locale)) {
                throw new PublishingConflictError('Translation identity cannot be reassigned.');
            }

            const revision = this.hashes.revision(item);

            if (item.sourceRevision && item.sourceRevision !== revision) {
                throw new PublishingValidationError('SOURCE_REVISION_MISMATCH');
            }

            let translation = new ArticleTranslation({
                id: item.translationId, articleId: item.articleId, locale: item.locale, slug: item.slug,
                title: item.title, description: item.description, bodyMarkdown: item.bodyMarkdown, seo: item.seo,
                status: previous?.status ?? 'draft', publishedAt: previous?.publishedAt ?? null,
                updatedAt: previous?.sourceRevision === revision ? previous.updatedAt : item.updatedAt ? new Date(item.updatedAt) : this.clock.now(),
                sourceRevision: revision, translatedFromRevision: item.translatedFromRevision ?? null,
                readingMinutes: item.readingMinutes ?? Math.max(1, Math.ceil(item.bodyMarkdown.trim().split(/\s+/u).length / 200)),
            });

            if (item.status === 'published') {
                if (!translation.publishedAt && item.publishedAt) translation = ArticleTranslation.rehydrate({
                    ...translation.getProps(),
                    publishedAt: new Date(item.publishedAt)
                });
                const published = translation.publish(article, this.clock.now());
                translation = ArticleTranslation.rehydrate({...published.getProps(), updatedAt: translation.updatedAt});
            } else if (item.status && item.status !== translation.status) throw new PublishingValidationError('Withdrawing or restoring content requires an explicit operation.');

            await this.translations.save(translation);
            await this.paths.assign(item.locale, item.slug, item.translationId, previous?.slug, Boolean(previous?.publishedAt));
        }
    }
}
