import type {IArticlePathService} from './articlePath.service.interface';
import type {IArticlePathRepository} from '../repositories/articlePath.repository.interface';
import {ArticlePath} from '../entities/articlePath';
import type {Locale} from '../article';
import {PublishingConflictError} from '../publishing.errors';
export class ArticlePathService implements IArticlePathService {
    constructor(private readonly repository: IArticlePathRepository) {}
    async assertAvailable(locale: Locale, slug: string, translationId: string): Promise<void> {
        const owner = (await this.repository.find({locale, slug}, true))[0]?.toData();
        if (owner && owner.translationId !== translationId) throw new PublishingConflictError('Slug is already reserved.');
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
    async redirects() { return (await this.repository.find({kind: 'redirect'})).map((path) => path.toData()).sort((a, b) => a.locale.localeCompare(b.locale) || a.slug.localeCompare(b.slug)); }
}
