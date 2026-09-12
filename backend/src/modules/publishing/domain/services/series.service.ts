import type {ISeriesService} from './series.service.interface';
import type {IArticleService} from './article.service.interface';
import type {IPublicSeriesRepository} from '../repositories/publicSeries.repository.interface';
import type {Locale} from '../publishing.types';
import type {SeriesDetail, SlugQuery} from '../public-content.types';
import {Series} from '../series';
import {PublicQueryValidation} from './publicQuery.validation';

/** Assembles public series views and localized member navigation. */
export class SeriesService implements ISeriesService {
    constructor(private readonly repository: IPublicSeriesRepository, private readonly articles: IArticleService) {}

    async list(locale: Locale) {
        PublicQueryValidation.locale(locale);
        return (await this.repository.list(locale)).map((series) => series.getProps());
    }

    /** Returns a localized series with visible members and translation-gap information. */
    async getBySlug(input: SlugQuery): Promise<SeriesDetail | null> {
        PublicQueryValidation.slug(input);
        const found = (await this.list(input.locale)).find((series) => series.slug === input.slug);
        if (!found) return null;
        const members = await this.articles.listSeriesMembers({seriesId: found.id, locale: input.locale});
        const total = await this.repository.countMembers(found.id);
        const series = new Series({id: found.id, members: members.map(({position, article}) => ({
            articleId: article.toSummary().articleId, position, locale: input.locale, translationPublished: true, articleArchived: false,
        }))});
        return {...found, hasTranslationGaps: total > members.length, members: members.map(({position, article}) => {
            const summary = article.toSummary();
            const navigation = series.navigation(input.locale, summary.articleId);
            return {position, article: summary,
                ...(navigation.previousArticleId ? {previousArticleId: navigation.previousArticleId} : {}),
                ...(navigation.nextArticleId ? {nextArticleId: navigation.nextArticleId} : {})};
        })};
    }
}
