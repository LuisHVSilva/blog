import type {Article, ArticleTranslation, TranslationStatus} from './article';

export type PublicationOperation = 'publish' | 'unpublish' | 'restore';
export type PublicationDecision = Readonly<{
    status: TranslationStatus;
    publishedAt: Date | null;
    updatedAt: Date;
    translationNeedsReview: boolean
}>;

export class PublicationPolicy {
    static transition(article: Article, translation: ArticleTranslation, operation: PublicationOperation, now: Date, currentSourceRevision?: string): PublicationDecision {
        const next = translation[operation](article, now);
        return Object.freeze({
            status: next.status, publishedAt: next.publishedAt, updatedAt: next.updatedAt,
            translationNeedsReview: next.needsReview(article.sourceLocale, currentSourceRevision)
        });
    }
}
