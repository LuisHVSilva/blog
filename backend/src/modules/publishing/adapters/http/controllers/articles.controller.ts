import type {PublicUseCases} from '../../../application/public-use-cases';
import type {Request, Response} from 'express';
import {type Difficulty, type Locale} from '../../../domain/publishing.types';
import {EditorialRules} from '../../../domain/editorial-rules';
import {HttpBoundaryError} from '../../../../../http/http-error';
import {sendPublicJson} from '../../../../../http/public-cache';
import {ArticleLookup} from "../../../domain/public-content.types";

export type {PublicUseCases} from '../../../application/public-use-cases';

/** HTTP boundary for public publishing queries. Dependencies are supplied by composition. */
export class ArticlesController {
    constructor(
        private readonly useCases: PublicUseCases
    ) {
    }

    async getBySlug(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, []);

        const item: ArticleLookup | null = await this.useCases.getArticle.execute({
            locale: this.locale(req.params.locale),
            slug: this.slug(req.params.slug)
        });

        if (!item) {
            return this.missing();
        }

        if (item.kind === 'redirect') {
            res.set('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
            res.redirect(308, `/api/v1/articles/by-slug/${item.locale}/${item.slug}`);
            return;
        }

        sendPublicJson(req, res, item.article, item.lastModified);
    }

    async list(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, ['locale', 'page', 'limit', 'tag', 'series', 'difficulty', 'q', 'sort']);

        const page: number = this.integer(req.query.page, 1, Math.floor(Number.MAX_SAFE_INTEGER / 50));
        const limit: number = this.integer(req.query.limit, 20, 50);
        const difficulty = this.scalar(req.query.difficulty) as Difficulty | undefined;
        const sort = this.scalar(req.query.sort) as 'publishedAt:asc' | 'publishedAt:desc' | undefined;

        if (sort !== undefined && !['publishedAt:asc', 'publishedAt:desc'].includes(sort)) {
            this.invalid();
        }

        if (difficulty !== undefined && !['foundational', 'intermediate', 'advanced'].includes(difficulty)) {
            this.invalid();
        }

        const q: string | undefined = this.scalar(req.query.q)?.trim();
        if (q !== undefined && (q.length < 2 || q.length > 100)) {
            this.invalid();
        }

        const item = await this.useCases.listArticles.execute({
            locale: this.locale(req.query.locale ?? 'pt-BR'), page, limit, difficulty, q, sort,
            tag: req.query.tag === undefined ? undefined : this.slug(req.query.tag),
            series: req.query.series === undefined ? undefined : this.slug(req.query.series)
        });

        sendPublicJson(req, res, item);
    }

    async listTags(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, ['locale']);
        sendPublicJson(req, res, await this.useCases.listTags.execute({locale: this.locale(req.query.locale ?? 'pt-BR')}));
    }

    async listSeries(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, ['locale']);
        sendPublicJson(req, res, await this.useCases.listSeries.execute({locale: this.locale(req.query.locale ?? 'pt-BR')}));
    }

    async getSeriesBySlug(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, []);
        const item = await this.useCases.getSeries.execute({
            locale: this.locale(req.params.locale), slug: this.slug(req.params.slug)
        });

        if (!item) {
            return this.missing();
        }

        sendPublicJson(req, res, item);
    }
    async listProjects(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, ['locale']);
        sendPublicJson(req, res, await this.useCases.projects.list(this.locale(req.query.locale ?? 'pt-BR')));
    }
    async getProjectBySlug(req: Request, res: Response): Promise<void> {
        this.queryKeys(req.query, []);
        const project = await this.useCases.projects.getBySlug({locale: this.locale(req.params.locale), slug: this.slug(req.params.slug)});
        if (!project) return this.missing();
        sendPublicJson(req, res, project, project.updatedAt);
    }

    private invalid(): never {
        throw new HttpBoundaryError('INVALID_QUERY', 400, 'Request parameters are invalid.');
    }

    private locale(value: unknown): Locale {
        const result = value === 'pt-br' ? 'pt-BR' : value;

        if (typeof result !== 'string' || !EditorialRules.isLocale(result)) {
            return this.invalid();
        }

        return result;
    }

    private scalar(value: unknown): string | undefined {
        if (value !== undefined && typeof value !== 'string') {
            return this.invalid();
        }

        return value;
    }

    private slug(value: unknown): string {
        const result: string | undefined = this.scalar(value);
        if (!result || !EditorialRules.isCanonicalSlug(result)) {
            return this.invalid();
        }
        return result;
    }

    private queryKeys(query: object, allowed: readonly string[]): void {
        if (Object.keys(query).some((key) => !allowed.includes(key))) {
            this.invalid();
        }
    }

    private integer(value: unknown, fallback: number, maximum: number): number {
        const text: string | undefined = this.scalar(value);

        if (text === undefined) {
            return fallback;
        }

        if (!/^[1-9]\d*$/u.test(text)) {
            return this.invalid();
        }

        const result: number = Number(text);
        if (!Number.isSafeInteger(result) || result > maximum) {
            return this.invalid();
        }

        return result;
    }

    private missing(): never {
        throw new HttpBoundaryError('RESOURCE_NOT_FOUND', 404, 'Resource not found.');
    }
}
