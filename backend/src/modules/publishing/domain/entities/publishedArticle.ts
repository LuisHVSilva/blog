import {EntityBase} from '../../../../shared/domain/entity.base';
import type {ArticleSummary, ArticleDetail} from '../public-content.types';

/** Immutable public projection, not an ORM model or a writable editorial aggregate. */
export class PublishedArticle extends EntityBase<Readonly<{id: string; article: ArticleSummary | ArticleDetail}>, PublishedArticle> {
    constructor(article: ArticleSummary | ArticleDetail) { super({id: article.translationId, article}); }
    protected recreate(props: Readonly<{id: string; article: ArticleSummary | ArticleDetail}>): PublishedArticle {
        return new PublishedArticle(props.article);
    }
    toSummary(): ArticleSummary {
        const {articleId, translationId, locale, slug, title, description, difficulty, publishedAt, updatedAt, readingMinutes, canonical, author, tags, series} = this.read('article');
        return {articleId, translationId, locale, slug, title, description, difficulty, publishedAt, updatedAt, readingMinutes, canonical, author, tags, series};
    }
    toDetail(): ArticleDetail {
        const article = this.read('article');
        if (!('bodyMarkdown' in article)) throw new Error('Article detail was not loaded.');
        return article;
    }
}
