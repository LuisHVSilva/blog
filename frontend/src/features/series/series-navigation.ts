import type {ArticleSummary} from '../../content/article-projections';
import type {PublishedSnapshot} from '../../content/published-schema';
import type {PublishedLocale} from '../../routing/public-routes';

type PublishedArticle = PublishedSnapshot['articles'][number];
type PublishedSeries = PublishedSnapshot['series'][number];
type SeriesMember = PublishedSeries['members'][number];

export type ArticleSeriesContext = {
    series: PublishedSeries;
    member: SeriesMember;
    previous?: ArticleSummary;
    next?: ArticleSummary;
};

export function orderedSeriesMembers(series: PublishedSeries): SeriesMember[] {
    return [...series.members].sort((left, right) => left.position - right.position || left.article.articleId.localeCompare(right.article.articleId));
}

export function articleSeriesContexts(snapshot: PublishedSnapshot, article: PublishedArticle, locale: PublishedLocale): ArticleSeriesContext[] {
    return article.series.flatMap((reference) => {
        const series = snapshot.series.find((candidate) => candidate.id === reference.id && candidate.locale === locale);
        const member = series?.members.find((candidate) => candidate.article.articleId === article.articleId);

        if (!series || !member) {
            return [];
        }

        const byId = new Map(series.members.map((candidate) => [candidate.article.articleId, candidate.article]));
        return [{
            series,
            member,
            previous: member.previousArticleId ? byId.get(member.previousArticleId) : undefined,
            next: member.nextArticleId ? byId.get(member.nextArticleId) : undefined
        }];
    });
}
