import type {Article} from './article';
import type {ArticleTranslation} from './entities/articleTranslation';
import type {TranslationStatus} from './publishing.types';

/** Editorial visibility operation that may be applied to an article translation. */
export type PublicationOperation = 'publish' | 'unpublish' | 'restore';
/** Resulting visibility state and translation-review status after an editorial operation. */
export type PublicationDecision = Readonly<{
    status: TranslationStatus;
    publishedAt: Date | null;
    updatedAt: Date;
    translationNeedsReview: boolean
}>;

/** Centralizes the translation state transition used by publication operations. */
export class PublicationPolicy {
    /**
     * Applies an operation and derives whether the translation needs review against its source revision.
     */
    static transition(
        article: Article,
        translation: ArticleTranslation,
        operation: PublicationOperation,
        now: Date,
        currentSourceRevision?: string
    ): PublicationDecision {
        const next = translation[operation](article, now);
        return Object.freeze({
            status: next.status, publishedAt: next.publishedAt, updatedAt: next.updatedAt,
            translationNeedsReview: next.needsReview(article.sourceLocale, currentSourceRevision)
        });
    }
}
