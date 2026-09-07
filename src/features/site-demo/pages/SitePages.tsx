import { type ReactNode } from "react";
import { Container } from "../../../components/layout/Container";
import { SiteFooter } from "../../../components/layout/SiteFooter";
import { SiteHeader } from "../../../components/layout/SiteHeader";
import { getCatalogArticles } from "../../../content/articles";
import { useI18n } from "../../../i18n/useI18n";
import "../../../components/style/SitePages.scss";

function PageShell({ children }: { readonly children: ReactNode }) { return <div className="site-page" id="top"><SiteHeader /><main>{children}</main><SiteFooter /></div>; }
function ArticleLink({ title, description, slug, placeholder }: { readonly title: string; readonly description: string; readonly slug: string; readonly placeholder: boolean }) { return <article className="catalog-card">{placeholder ? <span className="placeholder-badge">CONTEÚDO FICTÍCIO</span> : null}<h2>{title}</h2><p>{description}</p>{placeholder ? <span className="catalog-card__pending">Em breve</span> : <a href={slug}>Ler artigo →</a>}</article>; }

export function CategoriesPage() {
  const { locale } = useI18n(); const articles = getCatalogArticles(locale); const groups = [...new Set(articles.map((article) => article.category))]; const title = locale === "pt-BR" ? "Categorias" : "Categories";
  return <PageShell><Container><header className="collection-hero"><h1>{title}</h1><p>{locale === "pt-BR" ? "Explore os artigos por tema. As contagens refletem as publicações que já estão no catálogo." : "Explore articles by topic. Counts reflect the publications already in the catalogue."}</p></header><section className="catalog-groups">{groups.map((group) => <section className="catalog-group" key={group}><h2>{group}</h2><div className="demo-grid">{articles.filter((article) => article.category === group).map((article) => <ArticleLink description={article.description} key={article.slug} placeholder={article.isPlaceholder} slug={article.slug} title={article.title} />)}</div></section>)}</section></Container></PageShell>;
}

export function SeriesPage() {
  const { locale } = useI18n(); const articles = getCatalogArticles(locale); const series = [...new Set(articles.map((article) => article.series).filter(Boolean))] as string[];
  return <PageShell><Container><header className="collection-hero"><h1>{locale === "pt-BR" ? "Séries" : "Series"}</h1><p>{locale === "pt-BR" ? "Trilhas de leitura que conectam artigos relacionados." : "Reading paths that connect related articles."}</p></header><section className="catalog-groups">{series.map((name) => <section className="catalog-group" key={name}><h2>{name}</h2><div className="demo-grid">{articles.filter((article) => article.series === name).map((article) => <ArticleLink description={article.description} key={article.slug} placeholder={article.isPlaceholder} slug={article.slug} title={article.title} />)}</div></section>)}</section></Container></PageShell>;
}

export function ProjectsPage() {
  const { locale } = useI18n();
  return <PageShell><Container><header className="collection-hero"><h1>{locale === "pt-BR" ? "Projetos" : "Projects"}</h1><p>{locale === "pt-BR" ? "Ainda não há projetos publicados. Quando houver repositórios ou estudos práticos, eles serão listados aqui." : "There are no published projects yet. Repositories and practical studies will be listed here when available."}</p></header><section className="empty-state"><h2>{locale === "pt-BR" ? "Nenhum projeto publicado" : "No published projects"}</h2><p>{locale === "pt-BR" ? "Os artigos continuam disponíveis em Artigos, Categorias e Séries." : "Articles remain available in Articles, Categories, and Series."}</p></section></Container></PageShell>;
}
