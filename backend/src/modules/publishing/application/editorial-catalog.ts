import type {Difficulty, Locale, TranslationStatus} from '../domain/article';
export type EditorialCatalog = Readonly<{
    schemaVersion: 1;
    authors: readonly Readonly<{id: string; displayName: string; profileSlug: string; bio: string; links: readonly string[]}>[];
    tags: readonly Readonly<{id: string; key: string; translations: readonly Readonly<{locale: Locale; name: string; slug: string; description?: string; status: TranslationStatus}>[]}>[];
    series: readonly Readonly<{id: string; key: string; status: TranslationStatus; difficulty?: Difficulty; translations: readonly Readonly<{locale: Locale; title: string; slug: string; description: string; status: TranslationStatus}>[]; members: readonly Readonly<{articleId: string; position: number}>[]}>[];
    articles: readonly Readonly<{id: string; sourceLocale: Locale; authorId: string; difficulty: Difficulty; tagIds: readonly string[]; createdAt: string}>[];
    operations: readonly Readonly<{kind: 'unpublish' | 'archiveTranslation' | 'archive' | 'restore' | 'restoreTranslation'; articleId: string; locale?: Locale; reason: string}>[];
}>;
