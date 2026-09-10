import {useState} from "react";
import {Container} from "../../../components/layout/Container";
import {SiteFooter} from "../../../components/layout/SiteFooter";
import {SiteHeader} from "../../../components/layout/SiteHeader";
import {Icon, type IconName} from "../../../components/ui/Icon";
import {getCatalogArticles} from "../../../content/articles";
import {useI18n} from "../../../i18n/useI18n";
import {
    DomainCard,
    type EditorialArticle,
    EditorialArticleCard
} from "../components/articles-index/EditorialArticleCard";
import "../../../components/style/ArticlesPage.scss";

const images = ["https://lh3.googleusercontent.com/aida-public/AB6AXuBxo121hsbUtzl4BzvDKnWETgb5cCtlMbTqxM2zaQHBAQq0U_-Zy0vlaGdmzX-wrJClAQKkzrKkXGIRjwFjyFnVM7-zn7Uk1TXxFQ301A9B_krH6j87AgwwL8MLrRmIgnBxwJ74G0FrAGtTR0eYJJGStX8rZkFzu2mItdxtqHjTmtmr0vi7YHQYI1sQVeqtISEqTAh-QaaOivE1_bw9-8fKT0zIYxugEpgCYm704DP97CGJd8fSTd_x", "https://lh3.googleusercontent.com/aida-public/AB6AXuDWAjAuMJ6vS93fsZM9zydr97XxUNuM6QuKRX5xq2KIhc_lxYENociXbVM-IKooGiid3jBZnWI7vrDkn4TFgVBzjaaWx-Am_BJ20_boAP-FProvLCEsG18uRQekSLfkaCihZgFUkrQr4YfKEoQjWB3XmrgXnHqDkedFYnIEzkMAcxV-cPq65qbr1PYBIDWcnbQ0k3lwF7eErGg9V6SsKL5XJIty5udcGxIQKn4lQS4gvppUQq3HssSt"] as const;
const copy = {
    "pt-BR": {
        edition: "Edição 01 // Caderno de Engenharia",
        title: "Conhecimento para construir software com clareza.",
        description: "Artigos publicados sobre JavaScript, TypeScript e os fundamentos que tornam sistemas mais fáceis de entender e manter.",
        explore: "Ver todos os artigos",
        featured: "Publicações em destaque",
        viewAll: "Arquivo completo",
        domains: "Categorias",
        series: "Série em andamento",
        ongoing: "Fundamentos de TypeScript",
        seriesDescription: "Comece entendendo JavaScript e TypeScript, depois avance para a configuração real de um projeto.",
        start: "Começar a ler",
        chapters: "2 artigos publicados",
        projects: "Projetos",
        placeholder: "Projeto fictício",
        newsletter: "Receba novas publicações",
        newsletterDescription: "Um espaço preparado para sua newsletter. Conecte um provedor quando estiver pronto para publicar.",
        join: "Participar"
    },
    en: {
        edition: "Edition 01 // Engineering Ledger",
        title: "Knowledge for building software with clarity.",
        description: "Published articles about JavaScript, TypeScript, and the fundamentals that make systems easier to understand and maintain.",
        explore: "Browse all articles",
        featured: "Featured publications",
        viewAll: "Full archive",
        domains: "Categories",
        series: "Ongoing series",
        ongoing: "TypeScript fundamentals",
        seriesDescription: "Start by understanding JavaScript and TypeScript, then move into real project configuration.",
        start: "Start reading",
        chapters: "2 published articles",
        projects: "Projects",
        placeholder: "Fictional project",
        newsletter: "Receive new publications",
        newsletterDescription: "A newsletter space ready for a provider connection when you are ready to publish.",
        join: "Join"
    }
} as const;

export function ArticlesPage() {
    const {locale} = useI18n();
    const text = copy[locale];
    const catalog = getCatalogArticles(locale);
    const published = catalog.filter((article) => !article.isPlaceholder);
    const chapterLabel = `${published.length} ${locale === "pt-BR" ? "artigos publicados" : "published articles"}`;
    const [subscribed, setSubscribed] = useState(false);
    const categories = [...new Set(published.map((article) => article.category))];
    const toEditorial = (index: number): EditorialArticle => ({
        category: published[index].category,
        description: published[index].description,
        href: published[index].slug,
        image: images[index],
        meta: published[index].publishedAt,
        title: published[index].title
    });
    return (
        <div className="articles-page" id="top">
            <SiteHeader/>
            <main>
                <Container>
                    <section className="articles-hero">
                        <span>{text.edition}</span>
                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                        <div>
                            <a className="articles-button articles-button--primary" href="/artigos">{text.explore}</a>
                            <a className="articles-button" href="https://github.com" rel="noreferrer" target="_blank">
                                <Icon name="github"/> GitHub
                            </a>
                        </div>
                    </section>

                    <section className="articles-section">
                        <header className="articles-section__header">
                            <h2>{text.featured}</h2>
                            <a href="/artigos">{text.viewAll}
                                <Icon name="arrowRight"/>
                            </a>
                        </header>

                        <div className="featured-grid">
                            <EditorialArticleCard article={toEditorial(0)} featured/>
                            <div className="featured-grid__side">
                                <EditorialArticleCard article={toEditorial(1)}/>
                            </div>
                        </div>
                    </section>
                    <section className="articles-section">
                        <header className="articles-section__header">
                            <h2>{text.domains}</h2>
                        </header>
                        <div className="domains-grid">{categories.map((category, index) =>
                            <DomainCard
                                count={`${published.filter((article) =>
                                    article.category === category).length} 
                                    ${locale === "pt-BR" ? "artigo" : "article"}
                                    ${published.filter((article) => article.category === category).length > 1 ? "s" : ""}`
                                }
                                icon={(["javascript", "code"] as IconName[])[index] ?? "article"} key={category}
                                name={category}/>)}</div>
                    </section>

                    <section className="articles-section">
                        <header className="articles-section__header">
                            <h2>{text.series}</h2>
                        </header>
                        <div className="series-grid">
                            <article className="series-card series-card--primary">
                                <div>
                                    <span>{text.series}</span>
                                    <h3>{text.ongoing}</h3>
                                    <p>{text.seriesDescription}</p>
                                </div>
                                <div className="series-card__actions">
                                    <a className="articles-button articles-button--light" href={published[1].slug}>
                                        {text.start}
                                    </a>
                                    <p><Icon name="list"/> {chapterLabel}</p>
                                </div>
                                <Icon name="database"/>
                            </article>
                            <article className="series-card">
                                <div>
                                    <span>{text.projects}</span>
                                    <h3>{text.placeholder}</h3>
                                    <p>{locale === "pt-BR" ? "Os projetos reais aparecerão aqui quando forem publicados." : "Real projects will appear here when they are published."}</p>
                                </div>
                                <span className="placeholder-badge">{text.placeholder}</span>
                            </article>
                        </div>
                    </section>

                    <section className="articles-newsletter">
                        <h2>{text.newsletter}</h2>
                        <p>{text.newsletterDescription}</p>
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            setSubscribed(true);
                        }}>
                            <input aria-label="Email" placeholder="you@company.com" required type="email"/>
                            <button type="submit">{subscribed ? "✓" : text.join}</button>
                        </form>
                    </section>
                </Container>
            </main>
            <SiteFooter/>
        </div>
    );
}
