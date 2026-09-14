import {
    archivePageSize,
    localizedArticleSummaries,
    paginateArticleSummaries
} from '../../../../content/article-projections';
import {ArticleSummaryCard} from '../catalog/ArticleSummaryCard';
import type {PublishedSnapshot} from '../../../../content/published-schema';
import type {PublishedLocale} from '../../../../routing/public-routes';
import {archivePath} from '../../../../routing/public-routes';

export function PublishedArchive({snapshot, locale, page}: {
    snapshot: PublishedSnapshot;
    locale: PublishedLocale;
    page: number
}) {
    const pt = locale === 'pt-BR';
    const summaries = localizedArticleSummaries(snapshot, locale);
    const pagination = paginateArticleSummaries(summaries, page, archivePageSize);
    const tags = snapshot.tags.filter((tag) => tag.locale === locale && tag.articleCount > 0);

    return (
        <section className="articles-archive" data-archive data-locale={locale} data-page={pagination.currentPage}
                 data-page-size={archivePageSize} data-index-url={`/${locale}/catalog-index.json`}>
            <header className="archive-hero">
                <p className="archive-hero__eyebrow">{pt ? 'Base editorial' : 'Editorial library'}</p>
                <h1>{pt ? 'Artigos publicados' : 'Published articles'}</h1>
                <p>{pt ? 'Textos tecnicos publicados, organizados por assunto e nivel.' : 'Published technical writing, organized by topic and level.'}</p>
            </header>

            <p data-archive-error role="status" hidden>
                {pt ? 'Filtros indisponíveis. A lista abaixo mostra a página original, sem filtros.' : 'Filters are unavailable. The list below shows the original, unfiltered page.'}
                <button type="button" data-archive-retry>{pt ? 'Tentar novamente' : 'Try again'}</button>
            </p>

            <noscript>
                <p>{pt ? 'Os filtros precisam de JavaScript. A lista abaixo mostra a página sem filtros.' : 'Filters require JavaScript. The list below shows the unfiltered page.'}</p>
            </noscript>

            <form className="archive-controls" data-archive-controls hidden>
                <label htmlFor="archive-tag-filter">{pt ? 'Filtrar por assunto' : 'Filter by topic'}</label>
                <select id="archive-tag-filter" data-archive-tag defaultValue="">
                    <option value="">{pt ? 'Todos os assuntos' : 'All topics'}</option>
                    {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
                </select>
            </form>

            {summaries.length === 0 ?
                <p className="archive-empty">{pt ? 'Ainda nao ha artigos publicados neste idioma.' : 'There are no published articles in this language yet.'}</p>
                : <>
                    <div className="archive-grid" data-archive-results>{pagination.items.map((article) =>
                        <ArticleSummaryCard key={article.translationId} article={article} locale={locale}/>)}</div>
                    <p className="archive-empty" data-archive-empty
                       hidden>{pt ? 'Nenhum artigo corresponde a este filtro.' : 'No articles match this filter.'}</p>
                    <nav className="archive-pagination" data-archive-pagination hidden={pagination.totalPages <= 1}
                         aria-label={pt ? 'Paginacao de artigos' : 'Article pagination'}>
                        {Array.from({length: pagination.totalPages}, (_, index) => index + 1).map((number) => <a
                            key={number} href={archivePath(locale, number)}
                            aria-current={number === pagination.currentPage ? 'page' : undefined}>{number}</a>)}
                    </nav>
                </>
            }
        </section>
    );
}
