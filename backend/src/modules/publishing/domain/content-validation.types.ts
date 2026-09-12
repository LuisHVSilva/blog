import type {TranslationSeo} from './entities/articleTranslation';
import type {Locale, TranslationStatus} from './publishing.types';

/** Parsed Markdown translation and frontmatter before domain validation. */
export type ParsedContent = Readonly<{
    file: string;
    articleId: string;
    translationId: string;
    sourceLocale: string;
    locale: string;
    slug: string;
    title: string;
    description: string;
    body: string;
    difficulty: string;
    readingText?: string;
    sourceRevision?: string;
    translatedFromRevision?: string;
    status?: TranslationStatus;
    seo?: TranslationSeo;
    updatedAt?: string;
    publishedAt?: string
}>;

/** File-scoped validation finding suitable for CLI and operator output. */
export type ContentDiagnostic = Readonly<{
    file: string; field: string; code: string; message: string
}>;

/** Validation result including the derived reading-time values used by import. */
export type ContentValidation = Readonly<{
    valid: boolean;
    errors: readonly ContentDiagnostic[];
    warnings: readonly ContentDiagnostic[];
    edition: readonly Readonly<{ articleId: string; translationId: string; locale: Locale; readingMinutes: number }>[]
}>;
