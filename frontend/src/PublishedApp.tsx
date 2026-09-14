import {SiteHeader} from './components/layout/SiteHeader';
import {SiteFooter} from './components/layout/SiteFooter';
import {PublishedMarkdown} from './features/articles/components/article-detail/PublishedMarkdown';
import {PublishedArchive} from './features/articles/components/archive/PublishedArchive';
import {PublishedTags} from './features/tags/components/PublishedTags';
import {PublishedSeries} from './features/series/components/PublishedSeries';
import {ArticleSeriesNavigation} from './features/series/components/ArticleSeriesNavigation';
import {PublishedSearchDialog} from './features/search/components/PublishedSearchDialog';
import {PublishedSitePage} from './features/site/PublishedSitePage';
import {PublishedHome} from './features/site/PublishedHome';
import {publishedContent as content} from './content/published-content';
import {type ResolvedPublishedPage, resolvePublishedPage} from './content/published-page';
import {pageMetadata} from './seo/metadata';
import './components/style/ArticleDetailPage.scss';
import './components/style/ArticlesArchivePage.scss';
import './components/style/TaxonomyPages.scss';
import './components/style/SiteHeader.scss';
import './components/style/Container.scss';
import './components/style/PublishedSearchDialog.scss';
import './components/style/SiteInstitutionalPage.scss';
import './components/style/PublishedHome.scss';

export default function PublishedApp({pathname}: {pathname: string}) {
    const page: ResolvedPublishedPage = resolvePublishedPage(pathname);

    const pt: boolean = page.locale === 'pt-BR';
    const article = page.article;
    const title = article?.title ?? page.series?.title ?? page.tag?.name ?? (page.found ? (pt ? 'Artigos publicados' : 'Published articles') : '404');
    const languageLinks = page.found ? pageMetadata(content, page).alternates : [{
        locale: 'pt-BR',
        url: '/pt-BR/articles'
    }, {locale: 'en', url: '/en/articles'}];
    const isCollectionPage = page.found && Boolean(page.home || page.archivePage || page.tag || page.series || page.sitePage || page.pathname.endsWith('/tags') || page.pathname.endsWith('/series'));

    return (
        <div className={`app-shell article-detail${page.home ? ' home-shell' : ''}`} id="top">
            <a className="skip-link" href="#main-content">{pt ? 'Pular para o conteudo' : 'Skip to content'}</a>
            <SiteHeader locale={page.locale} pathname={pathname} languageLinks={languageLinks}/>
            <PublishedSearchDialog locale={page.locale}/>
            <main className="container article-detail__main" id="main-content" tabIndex={-1}>
                {!isCollectionPage &&
                    <header className="article-detail__header"><h1>{title}</h1><p>{article?.description}</p>
                        {article && <>
                            <p>{article.author.displayName} · {article.readingMinutes} min
                                · {pt ? 'Publicado em' : 'Published'}
                                <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(page.locale, {
                                    dateStyle: 'long',
                                    timeZone: 'UTC'
                                }).format(new Date(article.publishedAt))}</time>
                                {article.updatedAt !== article.publishedAt && <> · {pt ? 'Atualizado em' : 'Updated'}
                                    <time dateTime={article.updatedAt}>{new Intl.DateTimeFormat(page.locale, {
                                        dateStyle: 'long',
                                        timeZone: 'UTC'
                                    }).format(new Date(article.updatedAt))}</time>
                                </>}</p>
                            {article.tags.length > 0 &&
                                <nav aria-label="Tags" className="article-tags">{article.tags.map((tag) => <a
                                    key={tag.id}
                                    href={`/${article.locale}/tags/${tag.slug}`}>{tag.name}</a>)}</nav>}</>}
                    </header>}
                {article ?
                    <PublishedMarkdown body={article.bodyMarkdown} title={article.title} locale={article.locale}/>
                    : !page.found ? <p>{pt ? 'Pagina nao encontrada.' : 'Page not found.'}</p>
                        : page.home ? <PublishedHome snapshot={content} locale={page.locale}/>
                        : page.archivePage ?
                            <PublishedArchive snapshot={content} locale={page.locale} page={page.archivePage}/>
                            : page.sitePage ? <PublishedSitePage locale={page.locale} page={page.sitePage}/>
                                : page.tag || page.pathname.endsWith('/tags') ?
                                    <PublishedTags snapshot={content} locale={page.locale} tagId={page.tag?.id}/>
                                    : page.series || page.pathname.endsWith('/series') ?
                                        <PublishedSeries snapshot={content} locale={page.locale}
                                                         seriesId={page.series?.id}/>
                                        : null}
                {article && (
                    <ArticleSeriesNavigation snapshot={content} article={article} locale={page.locale}/>
                )}
        </main>
            <SiteFooter locale={page.locale}/>
        </div>
    )
}
