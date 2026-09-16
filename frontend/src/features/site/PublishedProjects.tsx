import type {PublishedSnapshot} from '../../content/published-schema';
import type {PublishedLocale} from '../../routing/public-routes';

export function PublishedProjects({snapshot, locale, project}: {
    snapshot: PublishedSnapshot;
    locale: PublishedLocale;
    project?: PublishedSnapshot['projects'][number]
}) {
    const projects = snapshot.projects.filter((item) => item.locale === locale);
    if (project) return (
        <section className="site-page">
            <header className="site-page__hero"><p>{locale === 'pt-BR' ? 'Projeto' : 'Project'}</p>
                <h1>{project.title}</h1>
            </header>
            <div className="site-page__content"><p>{project.description}</p>{project.technologies.length > 0 &&
                <p>{project.technologies.join(' · ')}</p>}
                <nav aria-label={locale === 'pt-BR' ? 'Links do projeto' : 'Project links'}>{project.repositoryUrl &&
                    <a href={project.repositoryUrl}
                       rel="noopener noreferrer">{locale === 'pt-BR' ? 'Repositório' : 'Repository'}</a>}{project.demoUrl &&
                    <a href={project.demoUrl}
                       rel="noopener noreferrer">{locale === 'pt-BR' ? 'Demonstração' : 'Demo'}</a>}</nav>
            </div>
        </section>
    );
    return (
        <section className="site-page">
            <header className="site-page__hero"><p>{locale === 'pt-BR' ? 'Projetos' : 'Projects'}</p>
                <h1>{locale === 'pt-BR' ? 'Projetos publicados' : 'Published projects'}</h1></header>
            <div className="site-page__content">{projects.length ? projects.map((item) => <article key={item.id}><h2><a
                    href={`/${locale}/projects/${item.slug}`}>{item.title}</a></h2><p>{item.description}</p></article>) :
                <p>{locale === 'pt-BR' ? 'Ainda não há projetos publicados.' : 'There are no published projects yet.'}</p>}</div>
        </section>
    );
}
