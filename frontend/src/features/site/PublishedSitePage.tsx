import type {PublishedLocale} from '../../routing/public-routes';
import {type SitePage, sitePageCopy} from './site-page-content';

export type {SitePage} from './site-page-content';

export function PublishedSitePage({locale, page}: { locale: PublishedLocale; page: SitePage }) {
    const copy = sitePageCopy(locale, page);

    return (
        <section className="site-page">
            <header className="site-page__hero"><p>{copy.eyebrow}</p><h1>{copy.title}</h1></header>
            <div className="site-page__content">
                {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {copy.links.length > 0 &&
                    <nav aria-label={locale === 'pt-BR' ? 'Referencias' : 'References'}>
                        {copy.links.map((link) =>
                            <a key={link.href} href={link.href} rel="noopener noreferrer">{link.label}</a>
                        )}
                    </nav>
                }
            </div>
        </section>
    );
}
