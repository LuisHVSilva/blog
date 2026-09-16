import type {ISnapshotService} from './snapshot.service.interface';
import type {IArticleService} from './article.service.interface';
import type {ITagService} from './tag.service.interface';
import type {ISeriesService} from './series.service.interface';
import type {IRevisionService} from './revision.service.interface';
import type {IArticlePathService} from './articlePath.service.interface';
import type {IEditorialClock, IEditorialUnitOfWork} from './editorialRuntime.interface';
import type {PublicSnapshot, SeriesDetail, TagSummary} from '../public-content.types';
import {homeContent} from '../home-content';
import type {IPublicProjectRepository} from './project.service';

/** Produces a transactionally consistent, deployable view of all public publishing data. */
export class SnapshotService implements ISnapshotService {
    constructor(
        private readonly scope: IEditorialUnitOfWork, private readonly articles: IArticleService,
        private readonly tagsService: ITagService, private readonly seriesService: ISeriesService, private readonly projectsService: IPublicProjectRepository,
        private readonly revisions: IRevisionService, private readonly paths: IArticlePathService,
        private readonly clock: IEditorialClock, private readonly siteOrigin: string
    ) {
    }

    /** Exports articles, taxonomies, redirects, and URL metadata from one read snapshot. */
    async export(): Promise<PublicSnapshot> {
        return await this.scope.execute(async () => {
            const revision = await this.revisions.current();

            if (!revision.revision) {
                throw new Error('Cannot export an unpublished catalogue revision.');
            }

            const articles = (await this.articles.allPublished()).map((article) => article.toDetail());
            const tags: TagSummary[] = [], series: SeriesDetail[] = [];
            const projects = [] as PublicSnapshot['projects'][number][];

            for (const locale of ['pt-BR', 'en'] as const) {
                tags.push(...await this.tagsService.list(locale));
                for (const summary of await this.seriesService.list(locale)) {
                    const detail = await this.seriesService.getBySlug({locale, slug: summary.slug});
                    if (!detail) {
                        throw new Error('Series disappeared within the snapshot.');
                    }
                    series.push(detail);
                }
                for (const project of await this.projectsService.list(locale)) {
                    const detail = await this.projectsService.getBySlug({locale, slug: project.slug});
                    if (detail) projects.push(detail);
                }
            }

            const translations = new Map(articles.map((article) => [article.translationId, article]));
            const redirects: PublicSnapshot['redirects'][number][] = [];

            for (const path of await this.paths.redirects()) {
                const article = translations.get(path.translationId);
                if (article) {
                    redirects.push({
                        from: `/${path.locale}/articles/${path.slug}`,
                        to: `/${article.locale}/articles/${article.slug}`,
                        status: 308
                    });
                }
            }

            const lastmod = revision.updatedAt.toISOString();
            return {
                schemaVersion: 1,
                revision: revision.revision,
                generatedAt: this.clock.now().toISOString(),
                siteOrigin: this.siteOrigin,
                home: homeContent(articles, tags, series),
                articles,
                tags,
                series,
                projects,
                redirects,
                urlCatalog: [
                    ...articles.map((a) => ({
                        url: a.canonical,
                        kind: 'article' as const,
                        locale: a.locale,
                        lastmod: a.updatedAt,
                        alternates: a.alternates.map(({locale, url}) => ({locale, url}))
                    })),
                    ...tags.map((t) => ({
                        url: t.canonical, kind: 'tag' as const, locale: t.locale, lastmod, alternates: []
                    })),
                    ...series.map((s) => ({
                        url: s.canonical, kind: 'series' as const, locale: s.locale, lastmod, alternates: []
                    })),
                    ...projects.map((p) => ({url: p.canonical, kind: 'project' as const, locale: p.locale, lastmod: p.updatedAt, alternates: []}))]
            };
        });
    }
}
