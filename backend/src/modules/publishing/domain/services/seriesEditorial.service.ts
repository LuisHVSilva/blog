import type {ISeriesEditorialService} from './seriesEditorial.service.interface';
import type {ISeriesDefinitionRepository} from '../repositories/seriesDefinition.repository.interface';
import type {ISeriesTranslationRepository} from '../repositories/seriesTranslation.repository.interface';
import {SeriesDefinition} from '../entities/seriesDefinition';
import {SeriesTranslation} from '../entities/seriesTranslation';
import {SeriesArticle} from '../entities/seriesArticle';
import type {ISeriesArticleRepository} from '../repositories/seriesArticle.repository.interface';
import type {EditorialCatalog} from '../editorial-catalog';
import {PublishingConflictError} from '../publishing.errors';

export class SeriesEditorialService implements ISeriesEditorialService {
    constructor(private readonly repository: ISeriesDefinitionRepository, private readonly translations: ISeriesTranslationRepository, private readonly members: ISeriesArticleRepository) {}

    async validate(values: EditorialCatalog['series']): Promise<void> {
        for (const value of values) {
            if ((await this.repository.find({key: value.key})).some((owner) => owner.id !== value.id)) {
                throw new PublishingConflictError('Taxonomy key is already reserved.');
            }

            for (const translation of value.translations) {
                if ((await this.translations.find({
                    locale: translation.locale,
                    slug: translation.slug
                })).some((owner) => owner.toData().seriesId !== value.id)) {
                    throw new PublishingConflictError('Taxonomy slug is already reserved.');
                }

                const previous = (await this.translations.find({seriesId: value.id, locale: translation.locale}))[0]?.toData();

                if (previous?.publishedOnce && previous.slug !== translation.slug) {
                    throw new PublishingConflictError('TAXONOMY_SLUG_IMMUTABLE');
                }
            }
        }
    }
    async write(values: EditorialCatalog['series'], now: Date): Promise<void> {
        await this.validate(values);

        for (const value of values) {
            const previous = (await this.repository.find({id: value.id}))[0];
            await this.repository.save(new SeriesDefinition({id: value.id, key: value.key, createdAt: previous?.createdAt ?? now, updatedAt: now, difficulty: value.difficulty ?? null, status: value.status}));
            for (const translation of value.translations) {
                const before = (await this.translations.find({seriesId: value.id, locale: translation.locale}))[0]?.toData();
                await this.translations.save(new SeriesTranslation({seriesId: value.id, ...translation, description: translation.description ?? '', publishedOnce: before?.publishedOnce || translation.status === 'published'}));
            }
        }
    }
    async writeMembers(values: EditorialCatalog['series']): Promise<void> {
        for (const series of values) {
            await this.members.remove({seriesId: series.id});

            for (const member of series.members) {
                await this.members.save(new SeriesArticle({seriesId: series.id, ...member}));
            }
        }
    }
}
