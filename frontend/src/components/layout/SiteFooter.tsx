import {navigationCopy} from '../../i18n/published-copy';
import {publicPath} from '../../routing/public-routes';
import {Container} from './Container';
import '../style/SiteFooter.scss';

export function SiteFooter({locale = 'pt-BR'}: { locale?: string }) {
    const copy = navigationCopy[locale === 'pt-BR' ? 'pt-BR' : 'en'];
    return (
        <footer className="site-footer"><Container className="site-footer__inner">
            <strong>Stackcraft</strong>
            <nav className="site-footer__links" aria-label={copy.footer}>
                <a href={publicPath(locale, 'articles')}>{copy.articles}</a>
                <a href={publicPath(locale, 'tags')}>Tags</a><a href={publicPath(locale, 'series')}>{copy.series}</a>
                <a href={publicPath(locale, 'projects')}>{copy.projects}</a>
                <a href={publicPath(locale, 'about')}>{copy.about}</a><a
                href={publicPath(locale, 'privacy')}>{copy.privacy}</a>
                <a href={publicPath(locale, 'contact')}>{copy.contact}</a><a
                href={publicPath(locale, 'security')}>{copy.security}</a>
            </nav>
        </Container>
        </footer>
    )
}
