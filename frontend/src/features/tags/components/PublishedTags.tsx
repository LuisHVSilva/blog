import {ArticleSummaryCard} from '../../articles/components/catalog/ArticleSummaryCard';
import {localizedArticleSummaries} from '../../../content/article-projections';
import type {PublishedSnapshot} from '../../../content/published-schema';
import type {PublishedLocale} from '../../../routing/public-routes';

export function PublishedTags({snapshot, locale, tagId}: {
    snapshot: PublishedSnapshot;
    locale: PublishedLocale;
    tagId?: string
}) {
    const pt = locale === 'pt-BR';
    const tag = tagId ? snapshot.tags.find((item) =>
        item.id === tagId && item.locale === locale) : undefined;

    if (tag) {
        const articles = localizedArticleSummaries(snapshot, locale).filter((article) =>
            article.tags.some((articleTag) => articleTag.id === tag.id));

        return (
            <section className="taxonomy-page">
                <header className="taxonomy-page__hero"><p>{pt ? 'Assunto' : 'Topic'}</p>
                    <h1>{tag.name}</h1>{tag.description &&
                        <p>{tag.description}</p>}<span>{tag.articleCount} {pt ? 'artigos publicados' : 'published articles'}</span>
                </header>

                {articles.length ?
                    <div className="archive-grid">{articles.map((article) =>
                        <ArticleSummaryCard
                            key={article.translationId}
                            article={article}
                            locale={locale}/>
                    )}
                    </div>
                    :
                    <p className="archive-empty">{pt ? 'Ainda nao ha artigos publicados neste assunto.' : 'There are no published articles for this topic yet.'}</p>}
            </section>
        );
    }

    const tags = snapshot.tags.filter((item) => item.locale === locale);

    return (
        <section className="taxonomy-page">
            <header className="taxonomy-page__hero"><p>{pt ? 'Assuntos' : 'Topics'}</p>
                <h1>{pt ? 'Tags publicadas' : 'Published tags'}</h1>
                <p>{pt ? 'Assuntos que organizam os textos publicados.' : 'Topics that organize published writing.'}</p>
            </header>

            {tags.length ?
                <ul className="taxonomy-index">{tags.map((item) =>
                    <li key={item.id}>
                        <a href={item.canonical}>
                            <strong>{item.name}</strong><span>{item.description}</span><small>{item.articleCount} {pt ? 'artigos' : 'articles'}</small>
                        </a>
                    </li>
                )}
                </ul>
                :
                <p className="archive-empty">{pt ? 'Ainda nao ha tags publicadas neste idioma.' : 'There are no published tags in this language yet.'}</p>}
        </section>
    );
}
