import {EntityBase} from '../../../../shared/domain/entity.base';
import type {ArticleDetail, ArticleSummary} from '../public-content.types';

type PublishedArticleProps = Readonly<{
    id: string;
    article: ArticleSummary | ArticleDetail;
}>;

/** Immutable public projection, not an ORM model or a writable editorial aggregate. */
export class PublishedArticle extends EntityBase<PublishedArticleProps, PublishedArticle> {
    constructor(article: ArticleSummary | ArticleDetail) {
        super({id: article.translationId, article});
    }

    protected recreate(props: PublishedArticleProps): PublishedArticle {
        return new PublishedArticle(props.article);
    }

    toSummary(): ArticleSummary {
        const article = this.read('article');

        return {
            articleId: article.articleId,
            translationId: article.translationId,
            locale: article.locale,
            slug: article.slug,
            title: article.title,
            description: article.description,
            difficulty: article.difficulty,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            readingMinutes: article.readingMinutes,
            canonical: article.canonical,
            author: article.author,
            tags: article.tags,
            series: article.series
        };
    }

    toDetail(): ArticleDetail {
        const article = this.read('article');
        if (!('bodyMarkdown' in article)) {
            throw new Error('Article detail was not loaded.');
        }

        return article;
    }
}
