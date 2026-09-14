import type {PublishedSnapshot} from '../../content/published-schema';
import {localizedArticleSummaries} from '../../content/article-projections';
import type {PublishedLocale} from '../../routing/public-routes';
import {publicPath} from '../../routing/public-routes';
import {Icon} from '../../components/ui/Icon';
import {HomeArticle, HomeHeading, Preparation} from './home/HomeComponents';

export function PublishedHome({snapshot, locale}: { snapshot: PublishedSnapshot; locale: PublishedLocale }) {
    const pt = locale === 'pt-BR';
    const articles = localizedArticleSummaries(snapshot, locale);
    const selection = snapshot.home?.find(item => item.locale === locale);
    const featured = selection ? selection.featuredTranslationIds.flatMap(id => articles.filter(a => a.translationId === id)) : articles.slice(0, 3);
    const latest = selection ? selection.latestTranslationIds.flatMap(id => articles.filter(a => a.translationId === id)) : articles.slice(0, 3);
    const tags = snapshot.tags.filter(tag => tag.locale === locale && tag.articleCount > 0 && (!selection || selection.tagIds.includes(tag.id))).slice(0, 4);
    const series = snapshot.series.filter(item => item.locale === locale && item.articleCount > 0 && (!selection || selection.seriesIds.includes(item.id))).slice(0, 2);

    return (
        <div className="published-home">
            <section className="home-hero">
                <p className="home-label">{pt ? 'Caderno de engenharia // DevHub' : 'Engineering Ledger // DevHub'}</p>
                <h1>{pt ? 'Engenharia de sistemas e clareza arquitetural.' : 'Advanced Systems Engineering & Architectural Clarity.'}</h1>
                <p className="home-hero__description">{pt ? 'Um espaço dedicado à construção de software, ao conhecimento técnico e ao estudo de sistemas distribuídos e infraestrutura frontend.' : 'A resource for software craftsmanship, technical knowledge, and deep dives into distributed systems and frontend infrastructure.'}</p>
                <div className="home-actions"><a className="home-button home-button--primary"
                                                 href={publicPath(locale, 'articles')}>{pt ? 'Explorar artigos' : 'Explore Articles'}</a><a
                    className="home-button" href="https://github.com/LuisHVSilva/blog" rel="noopener noreferrer"><Icon
                    name="code"/>GitHub</a></div>
            </section>
            <section className="home-section">
                <HomeHeading title={pt ? 'Destaques editoriais' : 'Featured Editorial'}
                             href={publicPath(locale, 'articles')} linkLabel={pt ? 'Ver todos' : 'View all'}/>
                <div className="home-featured"><HomeArticle article={featured[0]} locale={locale} primary/>
                    <div className="home-featured__side">{[1, 2].map(index => <HomeArticle key={index}
                                                                                           article={featured[index]}
                                                                                           locale={locale}/>)}</div>
                </div>
            </section>
            <section className="home-section">
                <HomeHeading title={pt ? 'Áreas de conhecimento' : 'Knowledge Domains'}/>
                <div className="home-domains">{Array.from({length: 4}, (_, index) => {
                    const tag = tags[index];
                    return tag ?
                        <a className="home-domain" key={tag.id} href={publicPath(locale, 'tags', tag.slug)}><Icon
                            name={(['hub', 'code', 'database', 'cloud'] as const)[index]}/><h3>{tag.name}</h3>
                            <p>{tag.articleCount} {pt ? 'artigos' : 'articles'}</p></a> :
                        <div className="home-domain" key={index}><Icon name="layers"/><Preparation locale={locale}
                                                                                                   title={pt ? 'Novo assunto' : 'New topic'}/>
                        </div>;
                })}</div>
            </section>
            <section className="home-section">
                <HomeHeading title={pt ? 'Séries técnicas selecionadas' : 'Curated Technical Series'}/>
                <div className="home-series">{[0, 1].map(index => {
                    const item = series[index];
                    return <article className={`home-series__card${index === 0 ? ' home-series__card--primary' : ''}`}
                                    key={index}>
                        <div><p className="home-label">{pt ? 'Série técnica' : 'Technical series'}</p>{item ? <>
                                <h3>{item.title}</h3><p>{item.description}</p></> :
                            <Preparation locale={locale} title={pt ? 'Nova trilha de leitura' : 'New reading path'}/>}
                        </div>
                        {item && <div className="home-actions"><a className="home-button"
                                                                  href={publicPath(locale, 'series', item.slug)}>{pt ? 'Começar a leitura' : 'Start reading'}<Icon
                            name="arrowRight"/></a><span><Icon
                            name="list"/>{item.articleCount} {pt ? 'capítulos' : 'chapters'}</span></div>}
                        {index === 0 && <Icon className="home-series__decoration" name="database"/>}
                    </article>;
                })}</div>
            </section>
            <section className="home-section">
                <HomeHeading title={pt ? 'Laboratório de projetos' : 'Open Source Labs'}
                             href={publicPath(locale, 'projects')} linkLabel={pt ? 'Ver projetos' : 'View projects'}/>
                <div className="home-projects">{(['memory', 'shield', 'monitoring'] as const).map((icon, index) =>
                    <article className="home-project" key={icon}><Icon name={icon}/><Preparation locale={locale}
                                                                                                 title={`${pt ? 'Projeto' : 'Project'} ${String(index + 1).padStart(2, '0')}`}/>
                        <p>{pt ? 'Repositório, descrição e tecnologias em preparação.' : 'Repository, description, and technologies in preparation.'}</p>
                    </article>)}</div>
            </section>
            <section className="home-notes home-section">
                <HomeHeading title={pt ? 'Últimas publicações' : 'Latest Notes'}/>
                {latest.length ? latest.map(article => <article className="home-note" key={article.translationId}>
                        <div>
                            <p>
                                <time dateTime={article.publishedAt}>{new Intl.DateTimeFormat(locale, {
                                    dateStyle: 'medium',
                                    timeZone: 'UTC'
                                }).format(new Date(article.publishedAt))}</time>
                                <span>{article.tags[0]?.name}</span></p>
                            <h3><a href={publicPath(locale, 'articles', article.slug)}>{article.title}</a></h3></div>
                        <Icon name="arrowUpRight"/></article>) :
                    <Preparation locale={locale} title={pt ? 'Novas publicações' : 'New publications'}/>}
                <a className="home-more"
                   href={publicPath(locale, 'articles')}>{pt ? 'Ver todas as publicações' : 'View all entries'}</a>
            </section>
            <section className="home-newsletter"><h2>{pt ? 'Engenharia semanal' : 'Engineering Weekly'}</h2>
                <p>{pt ? 'Uma seleção de artigos técnicos e projetos de software.' : 'A curated digest of technical articles and software projects.'}</p>
                <div className="home-newsletter__form"><span>you@company.com</span>
                    <button disabled type="button">{pt ? 'Em preparação' : 'In preparation'}</button>
                </div>
                <p className="home-label">{pt ? 'Inscrições ainda não disponíveis. Nenhum email é coletado.' : 'Subscriptions are not available yet. No email is collected.'}</p>
            </section>
        </div>
    );
}
