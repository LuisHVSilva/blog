import type {ICatalogService} from './catalog.service.interface';
import type {IAuthorProfileService} from './authorProfile.service.interface';
import type {ITagEditorialService} from './tagEditorial.service.interface';
import type {ISeriesEditorialService} from './seriesEditorial.service.interface';
import type {IEditorialArticleService} from './editorialArticle.service.interface';
import type {IEditorialTranslationService} from './editorialTranslation.service.interface';
import type {IArticleTagRepository} from '../repositories/articleTag.repository.interface';
import type {EditorialCatalog} from '../editorial-catalog';
import {Article, ArticleTranslation} from '../article';
import {ArticleTag} from '../entities/articleTag';
import {PublishingValidationError} from '../publishing.errors';

export class CatalogService implements ICatalogService {
    constructor(private readonly authors: IAuthorProfileService, private readonly tags: ITagEditorialService,
                private readonly series: ISeriesEditorialService, private readonly articles: IEditorialArticleService,
                private readonly translations: IEditorialTranslationService, private readonly articleTags: IArticleTagRepository) {
    }

    async validate(catalog: EditorialCatalog): Promise<void> {
        await this.authors.validate(catalog.authors);
        await this.tags.validate(catalog.tags);
        await this.series.validate(catalog.series);
        for (const operation of catalog.operations) if (!operation.reason.trim()) throw new PublishingValidationError('Visibility operations require a reason.');
    }

    async write(catalog: EditorialCatalog, now: Date): Promise<void> {
        await this.authors.write(catalog.authors, now);
        await this.tags.write(catalog.tags, now);
        await this.series.write(catalog.series, now);
    }

    async writeRelations(catalog: EditorialCatalog, now: Date): Promise<void> {
        for (const value of catalog.articles) {
            const article = await this.articles.findById(value.id);
            if (!article) throw new PublishingValidationError('Article was not found.');
            await this.articles.save(Article.rehydrate({
                ...article.getProps(),
                authorId: value.authorId,
                sourceLocale: value.sourceLocale,
                difficulty: value.difficulty
            }));
            await this.articleTags.remove({articleId: value.id});
            for (const tagId of value.tagIds) await this.articleTags.save(new ArticleTag({articleId: value.id, tagId}));
        }
        await this.series.writeMembers(catalog.series);
        for (const operation of catalog.operations) {
            if (!operation.reason.trim()) throw new PublishingValidationError('Visibility operations require a reason.');
            const article = await this.articles.findById(operation.articleId);
            if (!article) throw new PublishingValidationError('Article was not found.');
            if (operation.kind === 'archive' || operation.kind === 'restore') {
                await this.articles.save(operation.kind === 'archive' ? article.archive(now) : article.archivedAt ? article.restore() : article);
            } else {
                if (!operation.locale) throw new PublishingValidationError('Translation operations require a locale.');
                const translation = await this.translations.findByArticleLocale(operation.articleId, operation.locale);
                if (!translation || (operation.kind === 'restoreTranslation' && translation.status !== 'archived')) throw new PublishingValidationError('Invalid translation operation.');
                // Catalogue operations retain the explicitly reviewed target-state semantics.
                await this.translations.save(ArticleTranslation.rehydrate({
                    ...translation.getProps(),
                    status: operation.kind === 'archiveTranslation' ? 'archived' : 'draft',
                    updatedAt: now
                }));
            }
        }
    }
}
