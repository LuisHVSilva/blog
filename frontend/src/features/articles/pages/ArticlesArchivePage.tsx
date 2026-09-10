import {useMemo, useState} from "react";
import {Container} from "../../../components/layout/Container";
import {SiteFooter} from "../../../components/layout/SiteFooter";
import {SiteHeader} from "../../../components/layout/SiteHeader";
import {Icon} from "../../../components/ui/Icon";
import {getCatalogArticles} from "../../../content/articles";
import {useI18n} from "../../../i18n/useI18n";
import {type ArchiveArticle, ArchiveArticleCard} from "../components/articles-archive/ArchiveArticleCard";
import "../../../components/style/ArticlesArchivePage.scss";

const labels = {
    "pt-BR": {
        title: "Arquivo de artigos",
        description: "Artigos publicados e próximos estudos sobre desenvolvimento web, TypeScript e engenharia de software.",
        search: "Buscar artigos, tags ou séries...",
        categories: "Categorias",
        technologies: "Tecnologias",
        difficulty: "Dificuldade",
        all: "Todos os artigos",
        foundational: "Fundamental",
        intermediate: "Intermediário",
        advanced: "Avançado",
        placeholder: "Conteúdo fictício",
        read: "Ler artigo",
        previous: "Página anterior",
        next: "Próxima página",
        empty: "Nenhum artigo encontrado."
    },
    en: {
        title: "Article archive",
        description: "Published articles and upcoming studies on web development, TypeScript, and software engineering.",
        search: "Search articles, tags, or series...",
        categories: "Categories",
        technologies: "Technologies",
        difficulty: "Difficulty",
        all: "All articles",
        foundational: "Foundational",
        intermediate: "Intermediate",
        advanced: "Advanced",
        placeholder: "Fictional content",
        read: "Read article",
        previous: "Previous page",
        next: "Next page",
        empty: "No articles found."
    }
} as const;
const levels = ["foundational", "intermediate", "advanced"] as const;

export function ArticlesArchivePage() {
    const {locale} = useI18n();
    const text = labels[locale];
    const catalog = getCatalogArticles(locale);
    const categories = [...new Set(catalog.map((article) => article.category))];
    const technologies = [...new Set(catalog.flatMap((article) => article.tags))];
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<string>(text.all);
    const [difficulties, setDifficulties] = useState<string[]>([]);
    const articles = useMemo(() => catalog.filter((article) => {
        const searchable = `${article.title} ${article.description} ${article.tags.join(" ")} ${article.series ?? ""}`.toLocaleLowerCase();
        return searchable.includes(query.toLocaleLowerCase()) && (category === text.all || article.category === category) && (!difficulties.length || difficulties.includes(article.difficulty));
    }), [catalog, category, difficulties, query, text.all]);
    const toggleDifficulty = (value: string) => setDifficulties((selected) => selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

    return (
        <div className="articles-archive" id="top">
            <SiteHeader/>
            <main>
                <Container>
                    <section className="archive-hero">
                        <h1>{text.title}</h1>
                        <p>{text.description}</p>
                        <label>
                            <Icon name="search"/>
                            <input
                                onChange={(event) => setQuery(event.target.value)} placeholder={text.search}
                                type="search"
                                value={query}
                            />
                            <kbd>Ctrl K</kbd>
                        </label>
                    </section>
                    <div className="archive-layout">
                        <aside className="archive-filters">
                            <fieldset>
                                <legend>
                                    <Icon name="layers"/> {text.categories}
                                </legend>
                                {[text.all, ...categories].map((item) => <button
                                    aria-pressed={category === item}
                                    key={item}
                                    onClick={() => setCategory(item)}
                                    type="button">{item}</button>
                                )}
                            </fieldset>
                            <fieldset>
                                <legend>
                                    <Icon name="terminal"/> {text.technologies}
                                </legend>
                                <div className="archive-technologies">
                                    {technologies.map((technology) =>
                                        <button
                                            key={technology}
                                            onClick={() => setQuery(technology)}
                                            type="button">{technology}
                                        </button>
                                    )}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>
                                    <Icon name="monitoring"/> {text.difficulty}
                                </legend>
                                {levels.map((level) =>
                                    <label key={level}>
                                        <input checked={difficulties.includes(level)}
                                               onChange={() => toggleDifficulty(level)}
                                               type="checkbox"/>{text[level]}
                                    </label>
                                )}
                            </fieldset>
                        </aside>
                        <section className="archive-results">
                            <div className="archive-grid">
                                {articles.map((article) =>
                                    <ArchiveArticleCard
                                        article={{...article, meta: article.publishedAt} as ArchiveArticle}
                                        key={article.slug}
                                        labels={{placeholder: text.placeholder, read: text.read}}
                                    />
                                )}
                            </div>

                            {!articles.length ? <p className="archive-empty">{text.empty}</p> : null}

                            <nav aria-label="Paginação" className="archive-pagination">
                                <button aria-label={text.previous} disabled type="button">‹</button>
                                <button aria-current="page" type="button">1</button>
                                <button type="button">2</button>
                                <button type="button">3</button>
                                <span>…</span>
                                <button type="button">12</button>
                                <button aria-label={text.next} type="button">›</button>
                            </nav>
                        </section>
                    </div>
                </Container>
            </main>
            <SiteFooter/>
        </div>
    );
}
