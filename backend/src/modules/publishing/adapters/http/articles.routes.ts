import {Router} from 'express';
import {type Difficulty, EditorialRules, type Locale} from '../../domain/article';
import {HttpBoundaryError} from '../../../../http/http-error';
import {sendPublicJson} from '../../../../http/public-cache';
import type {IListArticlesUseCase} from '../../application/useCases/listArticles/listArticles.useCase.interface';
import type {IGetArticleUseCase} from '../../application/useCases/getArticle/getArticle.useCase.interface';
import type {IListTagsUseCase} from '../../application/useCases/listTags/listTags.useCase.interface';
import type {IListSeriesUseCase} from '../../application/useCases/listSeries/listSeries.useCase.interface';
import type {IGetSeriesUseCase} from '../../application/useCases/getSeries/getSeries.useCase.interface';

export type PublicUseCases = Readonly<{
    listArticles: IListArticlesUseCase;
    getArticle: IGetArticleUseCase;
    listTags: IListTagsUseCase;
    listSeries: IListSeriesUseCase;
    getSeries: IGetSeriesUseCase;
}>;

export class ArticlesRouter {
    constructor(private readonly useCases: PublicUseCases) {
    }

    private invalid(): never {
        throw new HttpBoundaryError('INVALID_QUERY', 400, 'Request parameters are invalid.');
    }

    private locale(value: unknown): Locale {
        const result = value === 'pt-br' ? 'pt-BR' : value;
        if (typeof result !== 'string' || !EditorialRules.isLocale(result)) return this.invalid();
        return result;
    }

    private scalar(value: unknown): string | undefined {
        if (value !== undefined && typeof value !== 'string') return this.invalid();
        return value;
    }

    private slug(value: unknown): string {
        const result = this.scalar(value);
        if (!result || !EditorialRules.isCanonicalSlug(result)) return this.invalid();
        return result;
    }

    private queryKeys(query: object, allowed: readonly string[]) {
        if (Object.keys(query).some((key) => !allowed.includes(key))) this.invalid();
    }

    private integer(value: unknown, fallback: number, maximum: number): number {
        const text = this.scalar(value);
        if (text === undefined) return fallback;
        if (!/^[1-9]\d*$/u.test(text)) return this.invalid();
        const result = Number(text);
        if (!Number.isSafeInteger(result) || result > maximum) return this.invalid();
        return result;
    }

    private missing(): never {
        throw new HttpBoundaryError('RESOURCE_NOT_FOUND', 404, 'Resource not found.');
    }

    createRouter() {
        const router = Router();
        router.get('/api/v1/articles/by-slug/:locale/:slug', async (req, res) => {
            this.queryKeys(req.query, []);
            const item = await this.useCases.getArticle.execute({
                locale: this.locale(req.params.locale),
                slug: this.slug(req.params.slug)
            });
            if (!item) return this.missing();
            if (item.kind === 'redirect') {
                res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
                res.redirect(308, `/api/v1/articles/by-slug/${item.locale}/${item.slug}`);
                return;
            }
            sendPublicJson(req, res, item.article, item.lastModified);
        });
        router.get('/api/v1/articles', async (req, res) => {
            this.queryKeys(req.query, ['locale', 'page', 'limit', 'tag', 'series', 'difficulty', 'q', 'sort']);
            const page = this.integer(req.query.page, 1, Math.floor(Number.MAX_SAFE_INTEGER / 50));
            const limit = this.integer(req.query.limit, 20, 50);
            const difficulty = this.scalar(req.query.difficulty) as Difficulty | undefined;
            const sort = this.scalar(req.query.sort) as 'publishedAt:asc' | 'publishedAt:desc' | undefined;
            if (sort !== undefined && !['publishedAt:asc', 'publishedAt:desc'].includes(sort)) this.invalid();
            if (difficulty !== undefined && !['foundational', 'intermediate', 'advanced'].includes(difficulty)) this.invalid();
            const q = this.scalar(req.query.q)?.trim();
            if (q !== undefined && (q.length < 2 || q.length > 100)) this.invalid();
            const item = await this.useCases.listArticles.execute({
                locale: this.locale(req.query.locale ?? 'pt-BR'),
                page,
                limit,
                difficulty,
                q,
                sort,
                tag: req.query.tag === undefined ? undefined : this.slug(req.query.tag),
                series: req.query.series === undefined ? undefined : this.slug(req.query.series)
            });
            sendPublicJson(req, res, item);
        });
        router.get('/api/v1/tags', async (req, res) => {
            this.queryKeys(req.query, ['locale']);
            sendPublicJson(req, res, await this.useCases.listTags.execute({locale: this.locale(req.query.locale ?? 'pt-BR')}));
        });
        router.get('/api/v1/series', async (req, res) => {
            this.queryKeys(req.query, ['locale']);
            sendPublicJson(req, res, await this.useCases.listSeries.execute({locale: this.locale(req.query.locale ?? 'pt-BR')}));
        });
        router.get('/api/v1/series/by-slug/:locale/:slug', async (req, res) => {
            this.queryKeys(req.query, []);
            const item = await this.useCases.getSeries.execute({
                locale: this.locale(req.params.locale),
                slug: this.slug(req.params.slug)
            });
            if (!item) return this.missing();
            sendPublicJson(req, res, item);
        });
        return router;
    }
}
