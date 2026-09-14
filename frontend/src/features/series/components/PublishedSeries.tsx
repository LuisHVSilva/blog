import {ArticleSummaryCard} from '../../articles/components/catalog/ArticleSummaryCard';
import {difficultyLabel} from '../../articles/components/catalog/catalog-labels';
import {orderedSeriesMembers} from '../series-navigation';
import type {PublishedSnapshot} from '../../../content/published-schema';
import type {PublishedLocale} from '../../../routing/public-routes';

function seriesDifficultyLabel(value: string, locale: PublishedLocale) {
    return ['foundational', 'intermediate', 'advanced'].includes(value)
        ? difficultyLabel(value as 'foundational' | 'intermediate' | 'advanced', locale)
        : value;
}

export function PublishedSeries({snapshot, locale, seriesId}: {
    snapshot: PublishedSnapshot;
    locale: PublishedLocale;
    seriesId?: string
}) {
    const pt = locale === 'pt-BR';
    const series = seriesId ? snapshot.series.find((item) => item.id === seriesId && item.locale === locale) : undefined;

    if (series) {
        const members = orderedSeriesMembers(series);
        return (
            <section className="taxonomy-page">
                <header className="taxonomy-page__hero"><p>{pt ? 'Trilha editorial' : 'Editorial series'}</p>
                    <h1>{series.title}</h1><p>{series.description}</p>
                    <span>{series.articleCount} {pt ? 'artigos publicados' : 'published articles'}{series.difficulty ? ` · ${seriesDifficultyLabel(series.difficulty, locale)}` : ''}</span>
                </header>

                {
                    series.hasTranslationGaps &&
                    <p className="series-gap" role="status">
                        {pt ? 'Esta trilha possui artigos ainda sem traducao neste idioma.' : 'This series has articles not yet translated into this language.'}
                    </p>
                }

                {members.length ?
                    <ol className="series-members">{
                        members.map((member) =>
                            <li key={member.article.translationId}
                                value={member.position}>
                                <span className="series-members__position">
                                    {pt ? `Etapa ${member.position}` : `Step ${member.position}`}
                                </span>
                                <ArticleSummaryCard article={member.article} locale={locale}/>
                            </li>
                        )
                    }
                    </ol>
                    :
                    <p className="archive-empty">
                        {pt ? 'Esta trilha ainda nao possui artigos publicados neste idioma.' : 'This series has no published articles in this language yet.'}
                    </p>
                }
            </section>
        );
    }

    const seriesList = snapshot.series.filter((item) => item.locale === locale);

    return (
        <section className="taxonomy-page">
            <header className="taxonomy-page__hero"><p>{pt ? 'Trilhas editoriais' : 'Editorial series'}</p>
                <h1>{pt ? 'Series publicadas' : 'Published series'}</h1>
                <p>{pt ? 'Sequencias de leitura definidas pela ordem editorial.' : 'Reading sequences defined by editorial order.'}</p>
            </header>
            {
                seriesList.length ?
                    <ul className="taxonomy-index">
                        {
                            seriesList.map((item) =>
                                <li key={item.id}>
                                    <a href={item.canonical}>
                                        <strong>{item.title}</strong><span>{item.description}</span><small>{item.articleCount} {pt ? 'artigos' : 'articles'}{item.hasTranslationGaps ? ` · ${pt ? 'com lacunas de traducao' : 'translation gaps'}` : ''}</small>
                                    </a>
                                </li>
                            )
                        }
                    </ul>
                    :
                    <p className="archive-empty">{pt ? 'Ainda nao ha series publicadas neste idioma.' : 'There are no published series in this language yet.'}</p>
            }
        </section>
    );
}
