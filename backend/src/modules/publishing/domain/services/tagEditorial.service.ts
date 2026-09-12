import type {ITagEditorialService} from './tagEditorial.service.interface';
import type {ITagRepository} from '../repositories/tag.repository.interface';
import type {ITagTranslationRepository} from '../repositories/tagTranslation.repository.interface';
import {Tag} from '../entities/tag';
import {TagTranslation} from '../entities/tagTranslation';

import type {EditorialCatalog} from '../editorial-catalog';
import {PublishingConflictError} from '../publishing.errors';

export class TagEditorialService implements ITagEditorialService {
    constructor(
        private readonly repository: ITagRepository,
        private readonly translations: ITagTranslationRepository
    ) {
    }

    async validate(values: EditorialCatalog['tags']): Promise<void> {
        for (const value of values) {
            if ((await this.repository.find({key: value.key})).some((owner) => owner.id !== value.id)) {
                throw new PublishingConflictError('Taxonomy key is already reserved.');
            }

            for (const translation of value.translations) {
                if ((await this.translations.find({
                    locale: translation.locale,
                    slug: translation.slug
                })).some((owner) => owner.toData().tagId !== value.id)) {
                    throw new PublishingConflictError('Taxonomy slug is already reserved.');
                }

                const previous = (await this.translations.find({tagId: value.id, locale: translation.locale}))[0]?.toData();

                if (previous?.publishedOnce && previous.slug !== translation.slug) {
                    throw new PublishingConflictError('TAXONOMY_SLUG_IMMUTABLE');
                }
            }
        }
    }
    async write(values: EditorialCatalog['tags'], now: Date): Promise<void> {
        await this.validate(values);

        for (const value of values) {
            const previous = (await this.repository.find({id: value.id}))[0];
            await this.repository.save(new Tag({id: value.id, key: value.key, createdAt: previous?.createdAt ?? now}));
            for (const translation of value.translations) {
                const before = (await this.translations.find({tagId: value.id, locale: translation.locale}))[0]?.toData();
                const tagTranslation = new TagTranslation({
                    tagId: value.id, ...translation,
                    description: translation.description ?? null,
                    publishedOnce: before?.publishedOnce || translation.status === 'published'
                })
                await this.translations.save(tagTranslation);
            }
        }
    }
}
