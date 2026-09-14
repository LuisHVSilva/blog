import {navigationCopy} from '../../i18n/published-copy';
import {publicPath} from '../../routing/public-routes';
import {Container} from './Container';
import {Button} from '../ui/Button';
import {Icon} from '../ui/Icon';
import '../style/SiteHeader.scss';

export function SiteHeader(
    {
        locale = 'pt-BR',
        pathname = '',
        languageLinks = [{
            locale: 'pt-BR',
            url: '/pt-BR/articles'
        }, {
            locale: 'en',
            url: '/en/articles'
        },
        ]
    }: { locale?: string; pathname?: string; languageLinks?: readonly { locale: string; url: string }[] }) {
    const copy = navigationCopy[locale === 'pt-BR' ? 'pt-BR' : 'en'];
    return (
        <header className="site-header" data-site-header>
            <Container className="site-header__inner">
                <a className="site-header__brand" href={`/${locale}`}>
                    DevHub
                </a>
                <button
                    hidden type="button"
                    data-menu-toggle data-open-label={copy.open}
                    data-close-label={copy.close}
                    aria-label={copy.open}
                    aria-controls="main-navigation"
                    aria-expanded="false"
                    className="site-header__menu-button">
                    <Icon name="menu"/>
                </button>
                <nav id="main-navigation" className="site-header__nav" aria-label={copy.main}>
                    {[['articles', copy.articles], ['tags', 'Tags'], ['series', copy.series], ['projects', copy.projects]].map(([route, label]) =>
                        <a key={route} href={publicPath(locale, route)}
                           aria-current={pathname === publicPath(locale, route) ? 'page' : undefined}>{label}</a>)}
                </nav>
                <div className="site-header__actions">
                    <Button
                        hidden
                        data-search-open
                        aria-haspopup="dialog"
                        aria-controls="published-search-dialog"
                        icon={<Icon name="search"/>}
                        variant="ghost"
                        className="site-header__search"
                    >
                        {copy.search}
                    </Button>
                    <Button
                        hidden
                        data-theme-toggle
                        aria-pressed="false"
                        aria-label={copy.dark}
                        iconOnlyLabel={copy.dark}
                        icon={<Icon name="contrast"/>}
                        variant="ghost"
                    >
                        {copy.theme}
                    </Button>

                    <nav
                        className="published-language"
                        aria-label={copy.language}
                    >
                        {languageLinks.map(link =>
                            <a
                                key={link.locale}
                                href={link.url}
                                hrefLang={link.locale}
                                lang={link.locale}
                                aria-current={link.locale === locale ? 'page' : undefined}
                            >
                                {link.locale === 'pt-BR' ? 'PT' : 'EN'}
                            </a>
                        )}
                    </nav>
                </div>
            </Container>
        </header>
    );
}
