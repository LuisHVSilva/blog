import {useI18n} from "../../i18n/useI18n";
import {Icon} from "../ui/Icon";
import {Container} from "./Container";
import "../style/SiteFooter.scss";

export function SiteFooter() {
    const {locale} = useI18n();
    const portuguese = locale === "pt-BR";
    const links = portuguese ? ["Status", "Segurança", "Privacidade", "Open source"] : ["Status", "Security", "Privacy", "Open source"];
    return (
        <footer className="site-footer"><Container className="site-footer__inner">
            <div>
                <strong>DEVHUB</strong>
                <p>© {new Date().getFullYear()} DevHub
                    Engineering. {portuguese ? "Conhecimento sistemático para arquitetos de software." : "Systematic knowledge for software architects."}
                </p>
            </div>
            <nav aria-label={portuguese ? "Rodapé" : "Footer"} className="site-footer__links">{links.map((link) =>
                <a href="#top" key={link}>{link}</a>)}
            </nav>
            <nav aria-label={portuguese ? "Redes sociais" : "Social links"} className="site-footer__social">
                <a aria-label="GitHub" href="https://github.com" rel="noreferrer" target="_blank"><Icon name="github"/></a>
                <a aria-label="Terminal" href="#top"><Icon name="terminal"/></a>
            </nav>
        </Container>
        </footer>
    );
}
