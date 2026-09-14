import type {ArticleSummary} from '../../../content/article-projections';
import type {PublishedLocale} from '../../../routing/public-routes';
import {publicPath} from '../../../routing/public-routes';
import {Icon} from '../../../components/ui/Icon';

export function Preparation({locale, title}: { locale: PublishedLocale; title: string }) {
    return <div className="home-preparation"><h3>{title}</h3><p
        className="home-label">{locale === 'pt-BR' ? 'Em preparação' : 'In preparation'}</p></div>;
}

export function HomeHeading({title, href, linkLabel}: { title: string; href?: string; linkLabel?: string }) {
    return <header className="home-section-heading"><h2>{title}</h2>{href &&
        <a href={href}>{linkLabel}<Icon name="arrowRight"/></a>}</header>;
}

export function HomeArticle({article, locale, primary = false}: {
    article?: ArticleSummary;
    locale: PublishedLocale;
    primary?: boolean
}) {
    const pt = locale === 'pt-BR';
    return (
        <article className={`home-article${primary ? ' home-article--primary' : ''}`}>
            <div className="home-cover"><Icon
                name={primary ? 'memory' : 'hub'}/><span>{pt ? 'Capa em preparação' : 'Cover in preparation'}</span>
            </div>
            {article ? <>
                    <div className="home-article__meta">
                        <span>{article.tags[0]?.name ?? (pt ? 'Artigo' : 'Article')}</span>{primary &&
                        <span>{article.readingMinutes} {pt ? 'min de leitura' : 'min read'}</span>}</div>
                    <h3><a href={publicPath(locale, 'articles', article.slug)}>{article.title}</a></h3>{primary ?
                    <p>{article.description}</p> : <p className="home-article__date">
                        <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                            timeZone: 'UTC'
                        }).format(new Date(article.publishedAt))}</time>
                        · {article.readingMinutes} min</p>}</> :
                <Preparation locale={locale} title={pt ? 'Novo destaque editorial' : 'New editorial feature'}/>}
        </article>
    );
}
