import {EntityAuditBase} from '../../../shared/domain/entity-audit.base';
import {ApplicationError} from '../../../shared/errors/application.error';

export const supportedLocales = Object.freeze(['pt-BR', 'en'] as const);
export type Locale = (typeof supportedLocales)[number];
export type Difficulty = 'foundational' | 'intermediate' | 'advanced';
export type TranslationStatus = 'draft' | 'published' | 'archived';

export type ArticleProps = Readonly<{
    id: string;
    sourceLocale: Locale;
    authorId: string;
    difficulty: Difficulty;
    createdAt: Date;
    archivedAt: Date | null;
}>;

export type TranslationSeo = Readonly<{
    title: string;
    description: string;
    socialImagePath?: string;
    imageAlt?: string;
}>;

export type ArticleTranslationProps = Readonly<{
    id: string;
    articleId: string;
    locale: Locale;
    slug: string;
    title: string;
    description: string;
    bodyMarkdown: string;
    status: TranslationStatus;
    publishedAt: Date | null;
    updatedAt: Date;
    sourceRevision: string;
    translatedFromRevision: string | null;
    readingMinutes: number;
    seo: TranslationSeo;
}>;

export class EditorialRuleError extends ApplicationError {
    readonly code = 'PUBLISHING_VALIDATION';
    readonly kind = 'business-rule' as const;

    constructor(message: string) {
        super(message);
    }
}

export class EditorialRules {
    static isUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    static isLocale(value: string): value is Locale {
        return (supportedLocales as readonly string[]).includes(value);
    }

    static isCanonicalSlug(value: string): boolean {
        return value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
    }

    static assertDate(value: Date): void {
        if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new EditorialRuleError('Clock produced an invalid date.');
    }
}

export class Article extends EntityAuditBase<ArticleProps, Article> {
    constructor(props: ArticleProps) {
        super(props);
        EditorialRules.assertDate(props.createdAt);
        if (!EditorialRules.isUuid(props.id) || !EditorialRules.isUuid(props.authorId)) throw new EditorialRuleError('Article and author IDs must be UUIDs.');
        if (!EditorialRules.isLocale(props.sourceLocale)) throw new EditorialRuleError('Article locale is not supported.');
        if (!['foundational', 'intermediate', 'advanced'].includes(props.difficulty)) throw new EditorialRuleError('Difficulty is invalid.');
        if (props.archivedAt !== null) EditorialRules.assertDate(props.archivedAt);
        Object.freeze(this);
    }

    static rehydrate(props: ArticleProps): Article {
        return new Article(props);
    }

    protected recreate(props: ArticleProps): Article {
        return new Article(props);
    }

    get sourceLocale(): Locale {
        return this.read('sourceLocale');
    }

    get authorId(): string {
        return this.read('authorId');
    }

    get difficulty(): Difficulty {
        return this.read('difficulty');
    }

    get archivedAt(): Date | null {
        return this.read('archivedAt');
    }

    archive(now: Date): Article {
        EditorialRules.assertDate(now);
        return this.cloneWith({archivedAt: now});
    }

    restore(): Article {
        if (!this.archivedAt) throw new EditorialRuleError('Only an archived article can be restored.');
        return this.cloneWith({archivedAt: null});
    }
}

export class ArticleTranslation extends EntityAuditBase<ArticleTranslationProps, ArticleTranslation> {
    constructor(props: ArticleTranslationProps) {
        super(props);
        EditorialRules.assertDate(props.updatedAt);
        if (!EditorialRules.isUuid(props.id) || !EditorialRules.isUuid(props.articleId)) throw new EditorialRuleError('Translation and article IDs must be UUIDs.');
        if (!EditorialRules.isLocale(props.locale)) throw new EditorialRuleError('Translation locale is not supported.');
        if (!['draft', 'published', 'archived'].includes(props.status)) throw new EditorialRuleError('Translation status is invalid.');
        if (!Number.isSafeInteger(props.readingMinutes) || props.readingMinutes < 1) throw new EditorialRuleError('Reading minutes must be positive.');
        if (props.publishedAt !== null) EditorialRules.assertDate(props.publishedAt);
        if (props.status === 'published' && !props.publishedAt) throw new EditorialRuleError('A published translation needs its first publication date.');
        Object.freeze(this);
    }

    static rehydrate(props: ArticleTranslationProps): ArticleTranslation {
        return new ArticleTranslation(props);
    }

    protected recreate(props: ArticleTranslationProps): ArticleTranslation {
        return new ArticleTranslation(props);
    }

    get articleId(): string {
        return this.read('articleId');
    }

    get locale(): Locale {
        return this.read('locale');
    }

    get slug(): string {
        return this.read('slug');
    }

    get title(): string {
        return this.read('title');
    }

    get description(): string {
        return this.read('description');
    }

    get bodyMarkdown(): string {
        return this.read('bodyMarkdown');
    }

    get status(): TranslationStatus {
        return this.read('status');
    }

    get publishedAt(): Date | null {
        return this.read('publishedAt');
    }

    get sourceRevision(): string {
        return this.read('sourceRevision');
    }

    get translatedFromRevision(): string | null {
        return this.read('translatedFromRevision');
    }

    get readingMinutes(): number {
        return this.read('readingMinutes');
    }

    get seo(): TranslationSeo {
        return this.read('seo');
    }

    hasEditorialContent(): boolean {
        return Boolean(this.title.trim() && this.description.trim() && this.bodyMarkdown.trim() && EditorialRules.isCanonicalSlug(this.slug));
    }

    needsReview(sourceLocale: Locale, currentSourceRevision?: string): boolean {
        return this.locale !== sourceLocale && (!currentSourceRevision || currentSourceRevision !== this.translatedFromRevision);
    }

    private assertOperation(article: Article, now: Date): void {
        if (article.id !== this.articleId) throw new EditorialRuleError('Translation does not belong to the article.');
        EditorialRules.assertDate(now);
    }

    publish(article: Article, now: Date): ArticleTranslation {
        this.assertOperation(article, now);
        if (article.archivedAt) throw new EditorialRuleError('An archived article cannot be published.');
        if (this.status === 'archived') throw new EditorialRuleError('Restore an archived translation before publishing it.');
        if (!this.hasEditorialContent()) throw new EditorialRuleError('A published translation needs title, description, body and canonical slug.');
        if (this.updatedAt.getTime() > now.getTime()) throw new EditorialRuleError('A future editorial update cannot be published.');
        if (this.publishedAt && this.publishedAt.getTime() > now.getTime()) throw new EditorialRuleError('A future publication date cannot be published.');
        return this.cloneWith({status: 'published', publishedAt: this.publishedAt ?? now, updatedAt: now});
    }

    unpublish(article: Article, now: Date): ArticleTranslation {
        this.assertOperation(article, now);
        if (this.status !== 'published') throw new EditorialRuleError('Only a published translation can be unpublished.');
        return this.cloneWith({status: 'draft', updatedAt: now});
    }

    archive(article: Article, now: Date): ArticleTranslation {
        this.assertOperation(article, now);
        return this.cloneWith({status: 'archived', updatedAt: now});
    }

    restore(article: Article, now: Date): ArticleTranslation {
        this.assertOperation(article, now);
        if (this.status !== 'archived') throw new EditorialRuleError('Only an archived translation can be restored.');
        return this.cloneWith({status: 'draft', updatedAt: now});
    }
}
