import {z} from 'zod';

const locale = z.enum(['pt-BR', 'en']);
const slug = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const author = z.object({
    id: z.uuid(),
    displayName: z.string().min(1),
    profileSlug: slug,
    bio: z.string().optional(),
    links: z.array(z.url()).optional()
});

const summary = z.object({
    articleId: z.uuid(),
    translationId: z.uuid(),
    locale,
    slug,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(500),
    difficulty: z.enum(['foundational', 'intermediate', 'advanced']),
    publishedAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    readingMinutes: z.number().int().positive(),
    canonical: z.url(), author,
    tags: z.array(z.object({id: z.uuid(), key: z.string(), name: z.string(), slug})),
    series: z.array(z.object({id: z.uuid(), slug, title: z.string(), position: z.number().int().positive()}))
});

export const snapshotSchema = z.object({
    schemaVersion: z.literal(1),
    revision: z.string().min(1),
    generatedAt: z.iso.datetime(),
    siteOrigin: z.url(),
    home: z.array(z.object({
        locale,
        featuredTranslationIds: z.array(z.uuid()).max(3),
        latestTranslationIds: z.array(z.uuid()).max(3),
        tagIds: z.array(z.uuid()).max(4),
        seriesIds: z.array(z.uuid()).max(2),
        projectsStatus: z.literal('preparing'),
        newsletterStatus: z.literal('preparing'),
    })).max(2).optional(),
    articles: z.array(summary.extend({
        bodyMarkdown: z.string().min(1),
        seo: z.object({
            title: z.string().min(1),
            description: z.string().min(1),
            socialImagePath: z.string().optional(),
            imageAlt: z.string().optional()
        }),
        alternates: z.array(z.object({locale, slug, url: z.url()}))
    })),
    tags: z.array(z.object({
        id: z.uuid(),
        locale,
        key: z.string(),
        name: z.string(),
        slug,
        description: z.string().optional(),
        articleCount: z.number().int().nonnegative(),
        canonical: z.url()
    })),
    series: z.array(z.object({
        id: z.uuid(),
        locale,
        slug,
        title: z.string(),
        description: z.string(),
        articleCount: z.number().int().nonnegative(),
        canonical: z.url(),
        difficulty: z.string().optional(), hasTranslationGaps: z.boolean(), members: z.array(z.object({
            position: z.number().int().positive(),
            article: summary,
            previousArticleId: z.uuid().optional(),
            nextArticleId: z.uuid().optional()
        }))
    })),
    redirects: z.array(z.object({
        from: z.string().startsWith('/'), to: z.string().startsWith('/'), status: z.literal(308)
    })),
    urlCatalog: z.array(z.object({
        url: z.url(),
        kind: z.enum(['article', 'tag', 'series']),
        locale,
        lastmod: z.iso.datetime(),
        alternates: z.array(z.object({locale, url: z.url()}))
    })),
}).superRefine((snapshot, ctx) => {
    const homeLocales = new Set<string>();
    for (const home of snapshot.home ?? []) {
        if (homeLocales.has(home.locale)) ctx.addIssue({code: 'custom', message: 'Duplicate home locale.'});
        homeLocales.add(home.locale);
        for (const [ids, available] of [
            [home.featuredTranslationIds, snapshot.articles.filter(a => a.locale === home.locale).map(a => a.translationId)],
            [home.latestTranslationIds, snapshot.articles.filter(a => a.locale === home.locale).map(a => a.translationId)],
            [home.tagIds, snapshot.tags.filter(a => a.locale === home.locale).map(a => a.id)],
            [home.seriesIds, snapshot.series.filter(a => a.locale === home.locale).map(a => a.id)],
        ]) {
            if (new Set(ids).size !== ids.length || ids.some(id => !available.includes(id))) {
                ctx.addIssue({code: 'custom', message: 'Invalid localized home reference.'});
            }
        }
    }
    const paths = new Set<string>();
    const origin = new URL(snapshot.siteOrigin);

    if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== snapshot.siteOrigin) {
        ctx.addIssue({
            code: 'custom',
            message: 'Invalid site origin.'
        });
    }

    for (const item of snapshot.urlCatalog) {
        const url = new URL(item.url);
        if (url.origin !== snapshot.siteOrigin || url.search || url.hash || paths.has(url.pathname)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Invalid or duplicate canonical URL.'
            });
        }
        paths.add(url.pathname);
    }

    const entities = [
        ...snapshot.articles.map((item) => ({...item, kind: 'article' as const, collection: 'articles'})),
        ...snapshot.tags.map((item) => ({...item, kind: 'tag' as const, collection: 'tags'})),
        ...snapshot.series.map((item) => ({...item, kind: 'series' as const, collection: 'series'})),
    ];
    const entityUrls = new Set<string>();

    for (const entity of entities) {
        if (
            entityUrls.has(entity.canonical)
            || entity.canonical !== `${snapshot.siteOrigin}/${entity.locale}/${entity.collection}/${entity.slug}`
            || !snapshot.urlCatalog.some((item) =>
                item.url === entity.canonical && item.kind === entity.kind && item.locale === entity.locale)
        ) {
            ctx.addIssue({code: 'custom', message: 'Published entity and URL catalogue diverge.'});
        }
        entityUrls.add(entity.canonical);
    }

    if (snapshot.urlCatalog.some((item) => !entityUrls.has(item.url))) {
        ctx.addIssue({
            code: 'custom',
            message: 'URL catalogue contains an absent entity.'
        });
    }

    const translationIds = new Set<string>();
    const localizedIds = new Set<string>();

    for (const article of snapshot.articles) {
        if (
            article.canonical !== `${snapshot.siteOrigin}/${article.locale}/articles/${article.slug}`
            || !paths.has(new URL(article.canonical).pathname)
        ) {
            ctx.addIssue({code: 'custom', message: 'Article URL is absent or inconsistent.'});
        }

        const identity = `${article.articleId}:${article.locale}`;
        if (translationIds.has(article.translationId) || localizedIds.has(identity)) ctx.addIssue({
            code: 'custom',
            message: 'Duplicate article identity.'
        });
        translationIds.add(article.translationId);
        localizedIds.add(identity);

        for (const tag of article.tags) {
            if (!snapshot.tags.some((item) => item.id === tag.id && item.locale === article.locale && item.slug === tag.slug)
            ) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Article references an absent tag.'
                });
            }
        }

        for (const reference of article.series) {
            if (!snapshot.series.some((item) => item.id === reference.id && item.locale === article.locale && item.slug === reference.slug
                && item.members.some((member) => member.article.translationId === article.translationId && member.position === reference.position))
            ) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Article references an absent series membership.'
                });
            }
        }

        for (const alternate of article.alternates) {
            const target = snapshot.articles.find((item) =>
                item.articleId === article.articleId
                && item.locale === alternate.locale
                && item.canonical === alternate.url
                && item.slug === alternate.slug
            );

            if (!target || (target !== article && !target.alternates.some((item) =>
                    item.locale === article.locale && item.url === article.canonical)
            )
            ) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Invalid article alternate.'
                });
            }
        }
    }

    for (const series of snapshot.series) {
        const positions = new Set<number>();
        const members = new Set<string>();
        for (const member of series.members) {
            if (
                positions.has(member.position)
                || members.has(member.article.articleId)
                || !snapshot.articles.some((article) =>
                    article.translationId === member.article.translationId
                    && article.articleId === member.article.articleId
                    && article.locale === series.locale
                    && article.canonical === member.article.canonical
                )
                || [member.previousArticleId, member.nextArticleId].some((id) =>
                    id
                    && !series.members.some((item) => item.article.articleId === id))
            ) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Invalid series member or navigation.'
                });
            }
            positions.add(member.position);
            members.add(member.article.articleId);
        }
    }

    const redirectPaths = new Set<string>();
    for (const redirect of snapshot.redirects) {
        if (
            !/^\/(pt-BR|en)\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(redirect.from)
            || redirectPaths.has(redirect.from)
            || paths.has(redirect.from)
            || !paths.has(redirect.to)
        ) {
            ctx.addIssue({
                code: 'custom',
                message: 'Invalid redirect.'
            });
        }
        redirectPaths.add(redirect.from);
    }
});

export type PublishedSnapshot = z.infer<typeof snapshotSchema>;
