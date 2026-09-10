import {useEffect, useState} from "react";
import {Container} from "./Container";
import {Button} from "../ui/Button";
import {Icon} from "../ui/Icon";
import {SearchModal} from "../../features/site-demo/components/SearchModal";
import {localeOptions} from "../../i18n/i18n.data";
import {useI18n} from "../../i18n/useI18n";
import {useTheme} from "../../theme/useTheme";
import "../style/SiteHeader.scss";

export function SiteHeader() {
    const {locale, setLocale} = useI18n();
    const {toggleTheme} = useTheme();
    const [searchOpen, setSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const portuguese = locale === "pt-BR";
    useEffect(() => {
        const open = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", open);
        return () => window.removeEventListener("keydown", open);
    }, []);
    const links = [["/artigos", portuguese ? "Artigos" : "Articles"],
        ["/projects", portuguese ? "Projetos" : "Projects"],
        ["/categories", portuguese ? "Categorias" : "Categories"],
        ["/series", portuguese ? "Séries" : "Series"]] as const;

    return (
        <>
            <header className="site-header"><Container className="site-header__inner">
                <a className="site-header__brand" href="/">DevHub</a>
                <button
                    aria-controls="main-navigation"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? (portuguese ? "Fechar menu" : "Close menu") : (portuguese ? "Abrir menu" : "Open menu")}
                    className="site-header__menu-button"
                    onClick={() => setMenuOpen((open) => !open)}
                    type="button"
                >
                    <Icon name={menuOpen ? "x" : "menu"}/>
                </button>
                <nav aria-label={portuguese ? "Principal" : "Main"}
                     className={`site-header__nav ${menuOpen ? "site-header__nav--open" : ""}`}
                     id="main-navigation">
                    {
                        links.map(([href, label]) => <a
                            aria-current={window.location.pathname === href ? "page" : undefined} href={href}
                            key={href} onClick={() => setMenuOpen(false)}>{label}
                        </a>)
                    }
                </nav>
                <div className="site-header__actions">
                    <button
                        aria-label={portuguese ? "Abrir busca" : "Open search"}
                        className="site-header__search"
                        onClick={() => setSearchOpen(true)}
                        type="button"
                    >
                        <Icon name="search"/>
                        <span>{portuguese ? "Buscar conhecimento" : "Search knowledge"}</span>
                        <kbd>Ctrl K</kbd>
                    </button>
                    <Button
                        icon={<Icon name="contrast"/>}
                        iconOnlyLabel={portuguese ? "Alternar tema" : "Toggle theme"}
                        className="site-header__theme" onClick={toggleTheme} variant="ghost">
                        {portuguese ? "Tema" : "Theme"}
                    </Button>
                    <label className="site-header__language">
                        <span className="sr-only">{portuguese ? "Idioma" : "Language"}</span>
                        <select
                            onChange={(event) => setLocale(event.target.value === "en" ? "en" : "pt-BR")}
                            value={locale}>{localeOptions.map((option) =>
                            <option key={option.locale}
                                    value={option.locale}>
                                {option.label}
                            </option>)}
                        </select>
                    </label>
                </div>
            </Container>
            </header>
            {searchOpen ? <SearchModal onClose={() => setSearchOpen(false)}/> : null}
        </>
    );
}
