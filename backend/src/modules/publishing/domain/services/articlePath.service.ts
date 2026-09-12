import {ArticlePath, type ArticlePathProps} from '../entities/articlePath';
import type {Locale} from '../publishing.types';
import {PublishingConflictError} from '../publishing.errors';
import type {IArticlePathRepository} from '../repositories/articlePath.repository.interface';
import type {IArticlePathService} from './articlePath.service.interface';

export class ArticlePathService implements IArticlePathService {
    constructor(private readonly repository: IArticlePathRepository) {}

    async assertAvailable(locale: Locale, slug: string, translationId: string): Promise<void> {
        const owner = (await this.repository.find({locale, slug}, true))[0]?.toData();
        if (owner && owner.translationId !== translationId) {
            throw new PublishingConflictError('Slug is already reserved.');
        }
    }

    async assign(locale: Locale, slug: string, translationId: string, previousSlug?: string, publishedBefore = false): Promise<void> {
        await this.assertAvailable(locale, slug, translationId);
        if (previousSlug && previousSlug !== slug) {
            for (const old of await this.repository.find({translationId, kind: 'current'})) {
                if (publishedBefore) await this.repository.save(new ArticlePath({...old.toData(), kind: 'redirect'}));
                else await this.repository.remove({locale: old.toData().locale, slug: old.toData().slug});
            }
        }
        await this.repository.save(new ArticlePath({locale, slug, translationId, kind: 'current'}));
        await this.assertAvailable(locale, slug, translationId);
    }

    async redirects(): Promise<readonly ArticlePathProps[]> {
        return (await this.repository.find({kind: 'redirect'}))
            .map((path) => path.toData())
            .sort((left, right) => left.locale.localeCompare(right.locale) || left.slug.localeCompare(right.slug));
    }
}
