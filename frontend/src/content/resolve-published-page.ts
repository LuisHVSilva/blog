import type {PublishedSnapshot} from './published-schema';
import type {InstitutionalPage, PublishedLocale} from '../routing/public-routes';
import {canonicalPath, resolvePublicRoute} from '../routing/public-routes';

export type ResolvedPublishedPage = {
    locale: PublishedLocale;
    pathname: string;
    article?: PublishedSnapshot['articles'][number];
    series?: PublishedSnapshot['series'][number];
    tag?: PublishedSnapshot['tags'][number];
    project?: PublishedSnapshot['projects'][number];
    archivePage?: number;
    home?: true;
    sitePage?: InstitutionalPage;
    redirect?: string;
    found: boolean;
};

export function resolvePublishedPageFromSnapshot(snapshot: PublishedSnapshot, pathname: string): ResolvedPublishedPage {
    const route = resolvePublicRoute(snapshot, pathname);
    const article = route.kind === 'article'
        ? snapshot.articles.find((item) => canonicalPath(item.canonical) === route.pathname)
        : undefined;
    const series = route.kind === 'series'
        ? snapshot.series.find((item) => canonicalPath(item.canonical) === route.pathname)
        : undefined;
    const tag = route.kind === 'tag'
        ? snapshot.tags.find((item) => canonicalPath(item.canonical) === route.pathname)
        : undefined;
    const project = route.kind === 'project' ? snapshot.projects.find((item) => canonicalPath(item.canonical) === route.pathname) : undefined;

    return {
        locale: route.locale,
        pathname: route.kind === 'redirect' ? route.to : route.pathname,
        article,
        series,
        tag,
        project,
        archivePage: route.kind === 'archive' ? route.page : undefined,
        home: route.kind === 'home' ? true : undefined,
        sitePage: route.kind === 'site' ? route.page : undefined,
        redirect: route.kind === 'redirect' ? route.to : undefined,
        found: route.kind !== 'not-found' && route.kind !== 'redirect'
    };
}
