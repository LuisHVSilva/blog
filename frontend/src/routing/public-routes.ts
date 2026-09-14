import type {PublishedSnapshot} from '../content/published-schema';

export const supportedLocales = ['pt-BR', 'en'] as const;
export type PublishedLocale = (typeof supportedLocales)[number];
export const defaultLocale: PublishedLocale = 'pt-BR';
export const institutionalPages = ['about', 'projects', 'privacy', 'contact', 'security'] as const;
export type InstitutionalPage = (typeof institutionalPages)[number];

export function publicPath(locale: string, section: string, slug?: string): string {
    if (!isPublishedLocale(locale) || !['articles', 'tags', 'series', ...institutionalPages].includes(section)) {
        throw new Error('Invalid public route.');
    }

    return `/${locale}/${section}${slug ? `/${slug}` : ''}`;
}

export function archivePath(locale: string, page = 1): string {
    if (!Number.isSafeInteger(page) || page < 1) {
        throw new Error('Invalid archive page.');
    }

    return publicPath(locale, 'articles') + (page === 1 ? '' : `/page/${page}`);
}

type CatalogItem = PublishedSnapshot['urlCatalog'][number];

export type PublicRoute =
    | { kind: 'redirect'; locale: PublishedLocale; to: string }
    | { kind: 'home'; locale: PublishedLocale; pathname: string }
    | { kind: 'archive'; locale: PublishedLocale; pathname: string; page: number }
    | { kind: 'site'; locale: PublishedLocale; pathname: string; page: InstitutionalPage }
    | { kind: 'index'; locale: PublishedLocale; pathname: string }
    | { kind: CatalogItem['kind']; locale: PublishedLocale; pathname: string }
    | { kind: 'not-found'; locale: PublishedLocale; pathname: string };

export function isPublishedLocale(value: string | undefined): value is PublishedLocale {
    return value !== undefined && supportedLocales.includes(value as PublishedLocale);
}

export function normalizePathname(pathname: string): string {
    if (!pathname.startsWith('/')) {
        return '/__invalid__';
    }

    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }

    return pathname;
}

export function localeFromPathname(pathname: string): PublishedLocale | null {
    const segment = normalizePathname(pathname).split('/')[1];
    return isPublishedLocale(segment) ? segment : null;
}

export function canonicalPath(url: string): string {
    return normalizePathname(new URL(url).pathname);
}

export function rootRedirects(): ReadonlyArray<{ from: string; to: string }> {
    return [
        {from: '/', to: `/${defaultLocale}`},
    ];
}

export function enumerateStaticPaths(snapshot: PublishedSnapshot): string[] {
    return [
        ...supportedLocales.flatMap((locale) => {
            const articleCount = snapshot.articles.filter((article) => article.locale === locale).length;
            const archivePages = Math.max(1, Math.ceil(articleCount / 12));
            return [`/${locale}`, `/${locale}/articles`, ...Array.from({length: archivePages - 1}, (_, index) => `/${locale}/articles/page/${index + 2}`), `/${locale}/tags`, `/${locale}/series`, ...institutionalPages.map((page) => `/${locale}/${page}`)];
        }),
        ...snapshot.urlCatalog.map((item) => canonicalPath(item.url)),
    ];
}

export function resolvePublicRoute(snapshot: PublishedSnapshot, rawPathname: string): PublicRoute {
    const pathname = normalizePathname(rawPathname);
    const redirect = rootRedirects().find((item) => item.from === pathname);
    if (redirect) {
        return {kind: 'redirect', locale: localeFromPathname(redirect.to) ?? defaultLocale, to: redirect.to};
    }

    const alias = snapshot.redirects.find((item) => item.from === pathname);
    if (alias) {
        return {kind: 'redirect', locale: localeFromPathname(alias.to) ?? defaultLocale, to: alias.to};
    }

    const locale = localeFromPathname(pathname);
    if (!locale) {
        return {kind: 'not-found', locale: defaultLocale, pathname};
    }

    if (pathname === `/${locale}`) {
        return {kind: 'home', locale, pathname};
    }

    if (pathname === `/${locale}/articles`) {
        return {kind: 'archive', locale, pathname, page: 1};
    }

    const archivePage = new RegExp(`^/${locale}/articles/page/([1-9]\\d*)$`, 'u').exec(pathname);

    if (archivePage) {
        const page = Number(archivePage[1]);
        const totalPages = Math.max(1, Math.ceil(snapshot.articles.filter((article) => article.locale === locale).length / 12));
        return page >= 2 && page <= totalPages ? {kind: 'archive', locale, pathname, page} : {
            kind: 'not-found',
            locale,
            pathname
        };
    }

    if ([`/${locale}/tags`, `/${locale}/series`].includes(pathname)) {
        return {kind: 'index', locale, pathname};
    }

    const sitePage = institutionalPages.find((page) => pathname === `/${locale}/${page}`);
    if (sitePage) {
        return {kind: 'site', locale, pathname, page: sitePage};
    }

    const item = snapshot.urlCatalog.find((candidate) => canonicalPath(candidate.url) === pathname);
    if (!item || item.locale !== locale) {
        return {kind: 'not-found', locale, pathname};
    }

    return {kind: item.kind, locale, pathname};
}

export function nginxRedirects(snapshot: PublishedSnapshot): string {
    const redirects = [...rootRedirects(), ...snapshot.redirects.map((item) => ({from: item.from, to: item.to}))];
    return redirects.flatMap((item) => [item, ...(item.from === '/' ? [] : [{from: `${item.from}/`, to: item.to}])])
        .map((item) => `location = ${item.from} { return 308 ${item.to}$is_args$args; }`).join('\n');
}
