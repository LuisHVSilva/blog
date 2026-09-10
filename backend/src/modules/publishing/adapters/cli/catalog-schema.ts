import {z} from 'zod';
const locale = z.enum(['pt-BR', 'en']);
const slug = z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
const status = z.enum(['draft', 'published', 'archived']);
const difficulty = z.enum(['foundational', 'intermediate', 'advanced']);
const text = (max: number) => z.string().trim().min(1).max(max);
export const catalogSchema = z.object({
    schemaVersion: z.literal(1),
    authors: z.array(z.object({id: z.uuid(), displayName: text(100), profileSlug: slug, bio: z.string().max(2000), links: z.array(z.url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol)))}).strict()),
    tags: z.array(z.object({id: z.uuid(), key: slug, translations: z.array(z.object({locale, name: text(200), slug, description: z.string().max(500).optional(), status}).strict())}).strict()),
    series: z.array(z.object({id: z.uuid(), key: slug, status, difficulty: difficulty.optional(), translations: z.array(z.object({locale, title: text(200), slug, description: text(500), status}).strict()), members: z.array(z.object({articleId: z.uuid(), position: z.number().int().positive()}).strict())}).strict()),
    articles: z.array(z.object({id: z.uuid(), sourceLocale: locale, authorId: z.uuid(), difficulty, tagIds: z.array(z.uuid()), createdAt: z.iso.datetime()}).strict()),
    operations: z.array(z.object({kind: z.enum(['unpublish', 'archiveTranslation', 'archive', 'restore', 'restoreTranslation']), articleId: z.uuid(), locale: locale.optional(), reason: text(500)}).strict()),
}).strict().superRefine((catalog, ctx) => {
    const unique = (values: readonly (string | number)[], label: string) => { if (new Set(values).size !== values.length) ctx.addIssue({code: 'custom', message: `Repeated ${label}.`}); };
    unique(catalog.authors.map((item) => item.id), 'author'); unique(catalog.authors.map((item) => item.profileSlug), 'profile slug');
    unique(catalog.tags.map((item) => item.id), 'tag'); unique(catalog.tags.map((item) => item.key), 'tag key');
    unique(catalog.series.map((item) => item.id), 'series'); unique(catalog.articles.map((item) => item.id), 'article');
    const authors = new Set(catalog.authors.map((item) => item.id)); const tags = new Set(catalog.tags.map((item) => item.id)); const articles = new Set(catalog.articles.map((item) => item.id));
    for (const article of catalog.articles) {
        if (!authors.has(article.authorId) || article.tagIds.some((id) => !tags.has(id))) ctx.addIssue({code: 'custom', message: 'Missing author or tag reference.'});
        unique(article.tagIds, 'article tag');
    }
    for (const series of catalog.series) {
        unique(series.members.map((member) => member.articleId), 'series member'); unique(series.members.map((member) => member.position), 'series position');
        if (series.members.some((member) => !articles.has(member.articleId))) ctx.addIssue({code: 'custom', message: 'Missing series article.'});
    }
    for (const entity of [...catalog.tags, ...catalog.series]) unique(entity.translations.map((item) => item.locale), 'translation locale');
    unique(catalog.tags.flatMap((item) => item.translations.map((t) => `${t.locale}:${t.slug}`)), 'tag slug');
    unique(catalog.series.flatMap((item) => item.translations.map((t) => `${t.locale}:${t.slug}`)), 'series slug');
});
