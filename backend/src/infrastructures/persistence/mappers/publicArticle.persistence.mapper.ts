import type {ArticleDetail, ArticleSummary} from '../../../modules/publishing/application/content.dto';
import type {Difficulty, Locale} from '../../../modules/publishing/domain/publishing.types';

export type ArticleAlternateRow = Readonly<{
    locale: Locale;
    slug: string;
}>;

export type ArticleReadRow = Readonly<{
    article_id: string;
    translation_id: string;
    locale: Locale;
    slug: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    published_at: Date;
    updated_at: Date;
    reading_minutes: number;
    body_markdown?: string;
    seo?: ArticleDetail['seo'];
    author: ArticleSummary['author'];
    tags: ArticleSummary['tags'];
    series: ArticleSummary['series'];
    bio?: string;
    links?: readonly string[];
    alternates?: readonly ArticleAlternateRow[];
}>;

export class PublicArticlePersistenceMapper {
    constructor(private readonly siteOrigin: string) {}

    summary(row: ArticleReadRow): ArticleSummary {
        return {
            articleId: row.article_id,
            translationId: row.translation_id,
            locale: row.locale,
            slug: row.slug,
            title: row.title,
            description: row.description,
            difficulty: row.difficulty,
            publishedAt: row.published_at.toISOString(),
            updatedAt: row.updated_at.toISOString(),
            readingMinutes: row.reading_minutes,
            author: row.author,
            tags: row.tags,
            series: row.series,
            canonical: `${this.siteOrigin}/${row.locale}/articles/${row.slug}`
        };
    }

    detail(row: ArticleReadRow): ArticleDetail {
        if (row.body_markdown === undefined) {
            throw new Error('A detailed public article row requires body_markdown.');
        }

        return {
            ...this.summary(row),
            author: {
                ...row.author,
                bio: row.bio ?? '',
                links: row.links ?? []
            },
            bodyMarkdown: row.body_markdown,
            seo: {
                title: row.seo?.title || row.title,
                description: row.seo?.description || row.description,
                ...(row.seo?.socialImagePath
                    ? {
                        socialImagePath: row.seo.socialImagePath,
                        imageAlt: row.seo.imageAlt
                    }
                    : {})
            },
            alternates: (row.alternates ?? []).map((item) => ({
                ...item,
                url: `${this.siteOrigin}/${item.locale}/articles/${item.slug}`
            }))
        };
    }
}

export {PersistenceNumbers} from '../utils/persistence-numbers';
