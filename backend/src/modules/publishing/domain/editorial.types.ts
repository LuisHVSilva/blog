import type {Difficulty, Locale, TranslationSeo, TranslationStatus} from './article';
import type {EditorialCatalog} from './editorial-catalog';

export type Operator = Readonly<{kind: 'operator'; id: string; sourceRevision: string; reason?: string}>;
export type EditionInput = Readonly<{
    expectedRevision: string;
    dryRun: boolean;
    operator: Operator;
    articles: readonly EditionArticleInput[];
    catalog?: EditorialCatalog;
}>;
export type EditionArticleInput = Readonly<{
    articleId: string;
    translationId: string;
    sourceLocale: Locale;
    locale: Locale;
    authorId: string;
    difficulty: Difficulty;
    slug: string;
    title: string;
    description: string;
    bodyMarkdown: string;
    seo: TranslationSeo;
    status?: TranslationStatus;
    readingMinutes?: number;
    sourceRevision?: string;
    translatedFromRevision?: string;
    updatedAt?: string;
    publishedAt?: string;
}>;
export type Change = Readonly<{kind: 'created' | 'updated' | 'unchanged' | 'published' | 'unpublished' | 'archived'; subject: string}>;
export type ImportResult = Readonly<{revision: string; changed: boolean; changes: readonly Change[]}>;


export type VisibilityInput = Readonly<{articleId: string; locale: string; expectedRevision: string; operator: Operator}>;
export type UnpublishInput = VisibilityInput & Readonly<{targetState: 'draft' | 'archived'}>;
export type ArchiveInput = Readonly<{articleId: string; expectedRevision: string; operator: Operator; reason: string}>;
export type RestoreInput = ArchiveInput & Readonly<{locale?: string; dryRun?: boolean}>;
