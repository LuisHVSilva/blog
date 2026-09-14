import type {ArticleDetail, SeriesDetail, TagSummary} from './public-content.types';
import type {Locale} from './publishing.types';

/** Public references only; selection is made within the snapshot transaction. */
export type HomeContent = Readonly<{
    locale: Locale;
    featuredTranslationIds: readonly string[];
    latestTranslationIds: readonly string[];
    tagIds: readonly string[];
    seriesIds: readonly string[];
    projectsStatus: 'preparing';
    newsletterStatus: 'preparing';
}>;

export function homeContent(articles: readonly ArticleDetail[], tags: readonly TagSummary[], series: readonly SeriesDetail[]): HomeContent[] {
    return (['pt-BR', 'en'] as const).map(locale => {
        const ordered = articles.filter(article => article.locale === locale)
            .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.articleId.localeCompare(b.articleId));
        return {
            locale,
            featuredTranslationIds: ordered.slice(0, 3).map(article => article.translationId),
            latestTranslationIds: ordered.slice(0, 3).map(article => article.translationId),
            tagIds: tags.filter(tag => tag.locale === locale && tag.articleCount > 0).slice(0, 4).map(tag => tag.id),
            seriesIds: series.filter(item => item.locale === locale && item.articleCount > 0).slice(0, 2).map(item => item.id),
            projectsStatus: 'preparing',
            newsletterStatus: 'preparing',
        };
    });
}
