import {z} from 'zod';

const locale = z.enum(['pt-BR', 'en']);
const slug = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const author = z.object({id: z.uuid(), displayName: z.string().min(1), profileSlug: slug, bio: z.string().optional(), links: z.array(z.url()).optional()});
const summary = z.object({articleId: z.uuid(), translationId: z.uuid(), locale, slug, title: z.string().min(1).max(200), description: z.string().min(1).max(500),
    difficulty: z.enum(['foundational', 'intermediate', 'advanced']), publishedAt: z.iso.datetime(), updatedAt: z.iso.datetime(), readingMinutes: z.number().int().positive(),
    canonical: z.url(), author, tags: z.array(z.object({id: z.uuid(), key: z.string(), name: z.string(), slug})),
    series: z.array(z.object({id: z.uuid(), slug, title: z.string(), position: z.number().int().positive()}))});
export const snapshotSchema = z.object({schemaVersion: z.literal(1), revision: z.string().min(1), generatedAt: z.iso.datetime(), siteOrigin: z.url(),
    articles: z.array(summary.extend({bodyMarkdown: z.string().min(1), seo: z.object({title: z.string().min(1), description: z.string().min(1), socialImagePath: z.string().optional(), imageAlt: z.string().optional()}), alternates: z.array(z.object({locale, slug, url: z.url()}))})),
    tags: z.array(z.object({id: z.uuid(), locale, key: z.string(), name: z.string(), slug, description: z.string().optional(), articleCount: z.number().int().nonnegative(), canonical: z.url()})),
    series: z.array(z.object({id: z.uuid(), locale, slug, title: z.string(), description: z.string(), articleCount: z.number().int().nonnegative(), canonical: z.url(),
        difficulty: z.string().optional(), hasTranslationGaps: z.boolean(), members: z.array(z.object({position: z.number().int().positive(), article: summary, previousArticleId: z.uuid().optional(), nextArticleId: z.uuid().optional()}))})),
    redirects: z.array(z.object({from: z.string().startsWith('/'), to: z.string().startsWith('/'), status: z.literal(308)})),
    urlCatalog: z.array(z.object({url: z.url(), kind: z.enum(['article', 'tag', 'series']), locale, lastmod: z.iso.datetime(), alternates: z.array(z.object({locale, url: z.url()}))})),
}).superRefine((snapshot, ctx) => {
    const paths = new Set<string>();
    for (const item of snapshot.urlCatalog) {
        const url = new URL(item.url);
        if (url.origin !== snapshot.siteOrigin || paths.has(url.pathname)) ctx.addIssue({code: 'custom', message: 'Invalid or duplicate canonical URL.'});
        paths.add(url.pathname);
    }
    for (const article of snapshot.articles) {
        if (article.canonical !== `${snapshot.siteOrigin}/${article.locale}/articles/${article.slug}` || !paths.has(new URL(article.canonical).pathname)) ctx.addIssue({code: 'custom', message: 'Article URL is absent or inconsistent.'});
    }
    for (const redirect of snapshot.redirects) {
        if (!/^\/(pt-BR|en)\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(redirect.from) || paths.has(redirect.from) || !paths.has(redirect.to)) ctx.addIssue({code: 'custom', message: 'Invalid redirect.'});
    }
});
export type PublishedSnapshot = z.infer<typeof snapshotSchema>;
