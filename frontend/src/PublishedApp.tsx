import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {publishedContent as content} from './content/published-content';
import {resolvePublishedPage} from './content/published-page';
import './components/style/ArticleDetailPage.scss';
import './components/style/ArticlesArchivePage.scss';
import './components/style/SiteHeader.scss';
import './components/style/Container.scss';

export default function PublishedApp({pathname}: {pathname: string}) {
    const page = resolvePublishedPage(pathname);
    const pt = page.locale === 'pt-BR';
    const article = page.article;
    const title = article?.title ?? page.series?.title ?? page.tag?.name ?? (page.found ? (pt ? 'Artigos publicados' : 'Published articles') : '404');
    const articles = page.series ? page.series.members.map((member) => member.article) : content.articles.filter((item) => item.locale === page.locale && (!page.tag || item.tags.some((tag) => tag.id === page.tag!.id)));
    const languageLinks = article ? article.alternates : [{locale: 'pt-BR', url: '/pt-BR/articles'}, {locale: 'en', url: '/en/articles'}];
    return <div className="app-shell article-detail" id="top">
        <header className="site-header"><div className="container site-header__inner">
            <a className="site-header__brand" href={`/${page.locale}/articles`}>DevHub</a>
            <nav className="site-header__nav" aria-label={pt ? 'Principal' : 'Main'}>
                <a href={`/${page.locale}/articles`}>{pt ? 'Artigos' : 'Articles'}</a>
                <a href={`/${page.locale}/tags`}>Tags</a><a href={`/${page.locale}/series`}>{pt ? 'Séries' : 'Series'}</a>
            </nav>
            <nav aria-label={pt ? 'Idioma' : 'Language'}>{languageLinks.map((link) => <a key={link.locale} href={link.url} hrefLang={link.locale} lang={link.locale}>{link.locale} </a>)}</nav>
        </div></header>
        <main className="container article-detail__main">
            <header className="article-detail__header"><h1>{title}</h1><p>{article?.description ?? page.series?.description ?? page.tag?.description}</p>
                {article && <p>{article.author.displayName} · {article.readingMinutes} min · <time dateTime={article.publishedAt}>{article.publishedAt.slice(0, 10)}</time></p>}
            </header>
            {article ? <article className="article-content"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{h1: ({children}) => <h2>{children}</h2>}}>{article.bodyMarkdown}</ReactMarkdown></article>
                : !page.found ? <p>{pt ? 'Página não encontrada.' : 'Page not found.'}</p>
                : pathname.endsWith('/tags') ? <ul>{content.tags.filter((tag) => tag.locale === page.locale).map((tag) => <li key={tag.id}><a href={tag.canonical}>{tag.name}</a> ({tag.articleCount})</li>)}</ul>
                : pathname.endsWith('/series') ? <ul>{content.series.filter((series) => series.locale === page.locale).map((series) => <li key={series.id}><a href={series.canonical}>{series.title}</a> ({series.articleCount})</li>)}</ul>
                : <div className="articles-archive__grid">{articles.map((item) => <article key={item.translationId}><h2><a href={item.canonical}>{item.title}</a></h2><p>{item.description}</p><p>{item.readingMinutes} min</p></article>)}</div>}
            {article && <nav aria-label={pt ? 'Séries do artigo' : 'Article series'}>{article.series.map((series) => <p key={series.id}><a href={`/${article.locale}/series/${series.slug}`}>{series.title}</a></p>)}</nav>}
        </main>
    </div>;
}
