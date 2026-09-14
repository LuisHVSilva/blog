import {articleSeriesContexts} from '../series-navigation';
import type {PublishedSnapshot} from '../../../content/published-schema';
import type {PublishedLocale} from '../../../routing/public-routes';

export function ArticleSeriesNavigation({snapshot, article, locale}: {
    snapshot: PublishedSnapshot;
    article: PublishedSnapshot['articles'][number];
    locale: PublishedLocale
}) {
    const pt = locale === 'pt-BR';
    const contexts = articleSeriesContexts(snapshot, article, locale);

    if (!contexts.length) {
        return null;
    }

    return (
        <section className="article-series-contexts" aria-label={pt ? 'Contextos de serie' : 'Series contexts'}>
            {
                contexts.map(({series, member, previous, next}) =>
                    <nav
                        key={series.id}
                        aria-label={`${series.title}: ${pt ? 'navegacao na serie' : 'series navigation'}`}
                    >
                        <p>
                            <a href={`/${locale}/series/${series.slug}`}>
                                {series.title}
                            </a> · {pt ? `Etapa ${member.position}` : `Step ${member.position}`}
                        </p>
                        <div>{
                            previous ?
                                <a href={previous.canonical}>{pt ? `Anterior: ${previous.title}` : `Previous: ${previous.title}`}</a> :
                                <span>{pt ? 'Inicio da trilha' : 'Start of series'}</span>
                        }
                            {
                                next ?
                                    <a href={next.canonical}>{pt ? `Proximo: ${next.title}` : `Next: ${next.title}`}</a> :
                                    <span>{pt ? 'Fim da trilha' : 'End of series'}</span>
                            }
                        </div>
                    </nav>
                )
            }
        </section>
    );
}
