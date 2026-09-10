import {Router} from 'express';
import type {ArticleReader} from '../../application/ports/article-reader';
import {getArticle} from '../../application/get-article';
import {listArticles} from '../../application/list-articles';
import {type Difficulty, EditorialRules, type Locale} from '../../domain/article';
import {HttpBoundaryError} from '../../../../http/http-error';
import {sendPublicJson} from '../../../../http/public-cache';
//
// export class ArticlesRouter {
//     private invalid(): never {
//         throw new HttpBoundaryError('INVALID_QUERY', 400, 'Request parameters are invalid.');
//     }
//
//     private locale(value: unknown): Locale {
//         const result = value === 'pt-br' ? 'pt-BR' : value;
//         if (typeof result !== 'string' || !EditorialRules.isLocale(result)) return this.invalid();
//         return result;
//     }
//
//     private scalar(value: unknown): string | undefined {
//         if (value !== undefined && typeof value !== 'string') return this.invalid();
//         return value;
//     }
//
//     private slug(value: unknown): string {
//         const result = this.scalar(value);
//         if (!result || !EditorialRules.isCanonicalSlug(result)) return this.invalid();
//         return result;
//     }
//
//     private queryKeys(query: object, allowed: readonly string[]) {
//         if (Object.keys(query).some((key) => !allowed.includes(key))) this.invalid();
//     }
//
//     private integer(value: unknown, fallback: number, maximum: number): number {
//         const text = this.scalar(value);
//         if (text === undefined) return fallback;
//         if (!/^[1-9]\d*$/u.test(text)) return this.invalid();
//         const result = Number(text);
//         if (!Number.isSafeInteger(result) || result > maximum) return this.invalid();
//         return result;
//     }
//
//     private missing(): never {
//         throw new HttpBoundaryError('RESOURCE_NOT_FOUND', 404, 'Resource not found.');
//     }
//
//     createArticleRouter(reader: ArticleReader) {
//         const router = Router();
//         router.get('/api/v1/articles/by-slug/:locale/:slug', async (req, res) => {
//             this.queryKeys(req.query, []);
//             const item = await getArticle(reader, {
//                 locale: this.locale(req.params.locale),
//                 slug: this.slug(req.params.slug)}
//             );
//
//             if (!item) {
//                 return this.missing();
//             }
//
//             if (item.kind === 'redirect') {
//                 res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
//                 res.redirect(308, `/api/v1/articles/by-slug/${item.locale}/${item.slug}`);
//                 return;
//             }
//             sendPublicJson(req, res, item.article, item.article.updatedAt);
//         });
//         router.get('/api/v1/articles', async (req, res) => {
//             queryKeys(req.query, ['locale', 'page', 'limit', 'tag', 'series', 'difficulty', 'q', 'sort']);
//             const page = integer(req.query.page, 1, Math.floor(Number.MAX_SAFE_INTEGER / 50));
//             const limit = integer(req.query.limit, 20, 50);
//             const difficulty = scalar(req.query.difficulty) as Difficulty | undefined;
//             const sort = scalar(req.query.sort) as 'publishedAt:asc' | 'publishedAt:desc' | undefined;
//             if (sort !== undefined && !['publishedAt:asc', 'publishedAt:desc'].includes(sort)) this.invalid();
//             if (difficulty !== undefined && !['foundational', 'intermediate', 'advanced'].includes(difficulty)) this.invalid();
//             const q = scalar(req.query.q)?.trim();
//             if (q !== undefined && (q.length < 2 || q.length > 100)) this.invalid();
//             const item = await listArticles(reader, {
//                 locale: locale(req.query.locale ?? 'pt-BR'),
//                 page,
//                 limit,
//                 difficulty,
//                 q,
//                 sort,
//                 tag: req.query.tag === undefined ? undefined : slug(req.query.tag),
//                 series: req.query.series === undefined ? undefined : slug(req.query.series)
//             });
//             sendPublicJson(req, res, item);
//         });
//         router.get('/api/v1/tags', async (req, res) => {
//             queryKeys(req.query, ['locale']);
//             sendPublicJson(req, res, await reader.listTags(locale(req.query.locale ?? 'pt-BR')));
//         });
//         router.get('/api/v1/series', async (req, res) => {
//             queryKeys(req.query, ['locale']);
//             sendPublicJson(req, res, await reader.listSeries(locale(req.query.locale ?? 'pt-BR')));
//         });
//         router.get('/api/v1/series/by-slug/:locale/:slug', async (req, res) => {
//             queryKeys(req.query, []);
//             const item = await reader.getSeries({locale: locale(req.params.locale), slug: slug(req.params.slug)});
//             if (!item) return missing();
//             sendPublicJson(req, res, item);
//         });
//         return router;
//     }
// }

function invalid(): never {
    throw new HttpBoundaryError('INVALID_QUERY', 400, 'Request parameters are invalid.');
}

function locale(value: unknown): Locale {
    const result = value === 'pt-br' ? 'pt-BR' : value;
    if (typeof result !== 'string' || !EditorialRules.isLocale(result)) return invalid();
    return result;
}

function scalar(value: unknown): string | undefined {
    if (value !== undefined && typeof value !== 'string') return invalid();
    return value;
}

function slug(value: unknown): string {
    const result = scalar(value);
    if (!result || !EditorialRules.isCanonicalSlug(result)) return invalid();
    return result;
}

function queryKeys(query: object, allowed: readonly string[]) {
    if (Object.keys(query).some((key) => !allowed.includes(key))) invalid();
}

function integer(value: unknown, fallback: number, maximum: number): number {
    const text = scalar(value);
    if (text === undefined) return fallback;
    if (!/^[1-9]\d*$/u.test(text)) return invalid();
    const result = Number(text);
    if (!Number.isSafeInteger(result) || result > maximum) return invalid();
    return result;
}

function missing(): never {
    throw new HttpBoundaryError('RESOURCE_NOT_FOUND', 404, 'Resource not found.');
}

export function createArticleRouter(reader: ArticleReader) {
    const router = Router();
    router.get('/api/v1/articles/by-slug/:locale/:slug', async (req, res) => {
        queryKeys(req.query, []);
        const item = await getArticle(reader, {locale: locale(req.params.locale), slug: slug(req.params.slug)});
        if (!item) return missing();
        if (item.kind === 'redirect') {
            res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
            res.redirect(308, `/api/v1/articles/by-slug/${item.locale}/${item.slug}`);
            return;
        }
        sendPublicJson(req, res, item.article, item.lastModified);
    });
    router.get('/api/v1/articles', async (req, res) => {
        queryKeys(req.query, ['locale', 'page', 'limit', 'tag', 'series', 'difficulty', 'q', 'sort']);
        const page = integer(req.query.page, 1, Math.floor(Number.MAX_SAFE_INTEGER / 50));
        const limit = integer(req.query.limit, 20, 50);
        const difficulty = scalar(req.query.difficulty) as Difficulty | undefined;
        const sort = scalar(req.query.sort) as 'publishedAt:asc' | 'publishedAt:desc' | undefined;
        if (sort !== undefined && !['publishedAt:asc', 'publishedAt:desc'].includes(sort)) invalid();
        if (difficulty !== undefined && !['foundational', 'intermediate', 'advanced'].includes(difficulty)) invalid();
        const q = scalar(req.query.q)?.trim();
        if (q !== undefined && (q.length < 2 || q.length > 100)) invalid();
        const item = await listArticles(reader, {
            locale: locale(req.query.locale ?? 'pt-BR'),
            page,
            limit,
            difficulty,
            q,
            sort,
            tag: req.query.tag === undefined ? undefined : slug(req.query.tag),
            series: req.query.series === undefined ? undefined : slug(req.query.series)
        });
        sendPublicJson(req, res, item);
    });
    router.get('/api/v1/tags', async (req, res) => {
        queryKeys(req.query, ['locale']);
        sendPublicJson(req, res, await reader.listTags(locale(req.query.locale ?? 'pt-BR')));
    });
    router.get('/api/v1/series', async (req, res) => {
        queryKeys(req.query, ['locale']);
        sendPublicJson(req, res, await reader.listSeries(locale(req.query.locale ?? 'pt-BR')));
    });
    router.get('/api/v1/series/by-slug/:locale/:slug', async (req, res) => {
        queryKeys(req.query, []);
        const item = await reader.getSeries({locale: locale(req.params.locale), slug: slug(req.params.slug)});
        if (!item) return missing();
        sendPublicJson(req, res, item);
    });
    return router;
}
