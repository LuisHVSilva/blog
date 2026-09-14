import type {PublishedLocale} from '../../../../routing/public-routes';
import {publicPath} from '../../../../routing/public-routes';
import type {ArticleSummary} from '../../../../content/article-projections';
import {difficultyLabel} from './catalog-labels';

export function ArticleSummaryCard({article, locale}: { article: ArticleSummary; locale: PublishedLocale }) {
    return (
        <article className="archive-card" data-article-id={article.articleId}>
            <a className="archive-card__link" href={article.canonical}
               aria-label={locale === 'pt-BR' ? `Ler artigo: ${article.title}` : `Read article: ${article.title}`}/>
            <header className="archive-card__header">
            <span className={`archive-card__difficulty archive-card__difficulty--${article.difficulty}`}>
                {difficultyLabel(article.difficulty, locale)}
            </span>
                <p>
                    <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(locale, {
                        dateStyle: 'medium',
                        timeZone: 'UTC'
                    }).format(new Date(article.publishedAt))}</time>
                </p>
            </header>

            <h2>{article.title}</h2>

            <p className="archive-card__description">{article.description}</p>

            <footer>
                <div>{article.tags.map((tag) =>
                    <a key={tag.id} href={publicPath(locale, 'tags', tag.slug)}>{tag.name}</a>)}
                </div>
                <span>{article.readingMinutes} min</span>
            </footer>
        </article>
    );
}
