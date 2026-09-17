import type {ResolvedPublishedPage} from '../content/resolve-published-page';
import type {PublishedSnapshot} from '../content/published-schema';
import {sitePageCopy} from '../features/site/site-page-content';
import {canonicalPath, enumerateStaticPaths, type PublishedLocale, supportedLocales} from '../routing/public-routes';

export type PageMetadata = {
    title: string;
    description: string;
    canonical?: string;
    locale: PublishedLocale;
    alternates: Array<{ locale: PublishedLocale; url: string }>;
    robots: 'index, follow' | 'noindex, follow';
    openGraphType: 'article' | 'website';
    jsonLd: Record<string, unknown>;
};

function absolute(snapshot: PublishedSnapshot, pathname: string) {
    return new URL(pathname, snapshot.siteOrigin).toString();
}

function isPublished(snapshot: PublishedSnapshot, url: string) {
    return snapshot.urlCatalog.some((item) => item.url === url);
}

function uniqueAlternates(items: Array<{ locale: PublishedLocale; url: string }>) {
    return supportedLocales.flatMap((locale) => {
        const match = items.find((item) => item.locale === locale);
        return match ? [match] : [];
    });
}

function structuralAlternates(snapshot: PublishedSnapshot, page: ResolvedPublishedPage) {
    const staticPaths = new Set(enumerateStaticPaths(snapshot));
    return supportedLocales.flatMap((locale) => {
        const path = page.home ? `/${locale}`
            : page.archivePage ? (page.archivePage === 1 ? `/${locale}/articles` : `/${locale}/articles/page/${page.archivePage}`)
            : page.sitePage ? `/${locale}/${page.sitePage}`
                : page.pathname.endsWith('/tags') ? `/${locale}/tags`
                    : page.pathname.endsWith('/series') ? `/${locale}/series` : undefined;
        return path && staticPaths.has(path) ? [{locale, url: absolute(snapshot, path)}] : [];
    });
}

function metadataText(page: ResolvedPublishedPage) {
    const pt = page.locale === 'pt-BR';
    if (page.article) return {
        name: page.article.title,
        title: page.article.seo.title,
        description: page.article.seo.description
    };
    if (page.tag) return {
        name: page.tag.name,
        title: `${page.tag.name} | Stackcraft`,
        description: page.tag.description ?? (pt ? `Artigos publicados sobre ${page.tag.name}.` : `Published articles about ${page.tag.name}.`)
    };
    if (page.series) return {
        name: page.series.title,
        title: `${page.series.title} | Stackcraft`,
        description: page.series.description
    };
    if (page.project) return {name: page.project.title, title: `${page.project.title} | Stackcraft`, description: page.project.description};
    if (page.sitePage) {
        const copy = sitePageCopy(page.locale, page.sitePage);
        return {name: copy.title, title: `${copy.title} | Stackcraft`, description: copy.paragraphs[0]};
    }
    if (page.home) return {
        name: 'Stackcraft',
        title: pt ? 'Stackcraft | Engenharia de software' : 'Stackcraft | Software Engineering Knowledge Hub',
        description: pt ? 'Artigos técnicos, séries de leitura e projetos sobre engenharia de software.' : 'Technical articles, reading series, and projects about software engineering.'
    };
    if (page.archivePage) {
        const name = pt ? `Artigos publicados${page.archivePage > 1 ? ` - pagina ${page.archivePage}` : ''}` : `Published articles${page.archivePage > 1 ? ` - page ${page.archivePage}` : ''}`;
        return {
            name,
            title: `${name} | Stackcraft`,
            description: pt ? 'Textos tecnicos publicados, organizados por assunto e nivel.' : 'Published technical writing, organized by topic and level.'
        };
    }
    if (page.pathname.endsWith('/tags')) return {
        name: pt ? 'Tags publicadas' : 'Published tags',
        title: `${pt ? 'Tags publicadas' : 'Published tags'} | Stackcraft`,
        description: pt ? 'Assuntos que organizam os textos publicados.' : 'Topics that organize published writing.'
    };
    if (page.pathname.endsWith('/series')) return {
        name: pt ? 'Series publicadas' : 'Published series',
        title: `${pt ? 'Series publicadas' : 'Published series'} | Stackcraft`,
        description: pt ? 'Sequencias de leitura definidas pela ordem editorial.' : 'Reading sequences defined by editorial order.'
    };
    return {name: '404', title: '404 | Stackcraft', description: pt ? 'Pagina nao encontrada.' : 'Page not found.'};
}

function alternateUrls(snapshot: PublishedSnapshot, page: ResolvedPublishedPage, canonical: string | undefined) {
    if (!canonical) {
        return [];
    }
    if (page.article) {
        const current = page.article;
        return uniqueAlternates([{
            locale: current.locale,
            url: current.canonical
        }, ...current.alternates.flatMap((alternate) => {
            const target = snapshot.articles.find((article) => article.canonical === alternate.url && article.locale === alternate.locale && article.articleId === current.articleId);
            return target && isPublished(snapshot, target.canonical) && target.alternates.some((item) => item.url === current.canonical) ? [{
                locale: alternate.locale,
                url: target.canonical
            }] : [];
        })]);
    }
    if (page.tag) {
        return uniqueAlternates(snapshot.tags.filter((item) => item.id === page.tag!.id && isPublished(snapshot, item.canonical)).map((item) => ({
            locale: item.locale,
            url: item.canonical
        })));
    }
    if (page.series) {
        return uniqueAlternates(snapshot.series.filter((item) => item.id === page.series!.id && isPublished(snapshot, item.canonical)).map((item) => ({
            locale: item.locale,
            url: item.canonical
        })));
    }
    if (page.project) return uniqueAlternates(snapshot.projects.filter((item) => item.id === page.project!.id && isPublished(snapshot, item.canonical)).map((item) => ({locale: item.locale, url: item.canonical})));
    return uniqueAlternates(structuralAlternates(snapshot, page));
}

function jsonLd(snapshot: PublishedSnapshot, page: ResolvedPublishedPage, canonical: string | undefined, text: ReturnType<typeof metadataText>) {
    if (page.article && canonical) return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: page.article.title,
        description: page.article.description,
        datePublished: page.article.publishedAt,
        dateModified: page.article.updatedAt,
        inLanguage: page.locale,
        author: {'@type': 'Person', name: page.article.author.displayName},
        mainEntityOfPage: {'@type': 'WebPage', '@id': canonical},
        keywords: page.article.tags.map((tag) => tag.name),
    };
    return {
        '@context': 'https://schema.org',
        '@type': page.archivePage || page.tag || page.series || page.pathname.endsWith('/tags') || page.pathname.endsWith('/series') || page.pathname.endsWith('/projects') ? 'CollectionPage' : 'WebPage',
        name: text.name,
        description: text.description,
        inLanguage: page.locale,
        url: canonical ?? absolute(snapshot, '/404.html')
    };
}

export function pageMetadata(snapshot: PublishedSnapshot, page: ResolvedPublishedPage): PageMetadata {
    const canonical = page.found ? page.article?.canonical ?? page.series?.canonical ?? page.tag?.canonical ?? page.project?.canonical ?? absolute(snapshot, page.pathname) : undefined;
    const text = metadataText(page);
    return {
        title: text.title, description: text.description, canonical, locale: page.locale,
        alternates: alternateUrls(snapshot, page, canonical), robots: page.found ? 'index, follow' : 'noindex, follow',
        openGraphType: page.article ? 'article' : 'website', jsonLd: jsonLd(snapshot, page, canonical, text),
    };
}

export function safeJsonLd(value: Record<string, unknown>) {
    return JSON.stringify(value).replace(/[<>&\u2028\u2029]/gu, (character) => ({
        '<': '\\u003c',
        '>': '\\u003e',
        '&': '\\u0026',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029'
    }[character] ?? character));
}

export function sitemapLastmod(snapshot: PublishedSnapshot, canonical: string) {
    return snapshot.urlCatalog.find((item) => item.url === canonical)?.lastmod;
}

export function canonicalForPath(snapshot: PublishedSnapshot, pathname: string) {
    return absolute(snapshot, canonicalPath(pathname));
}
