import {Container} from "../../../components/layout/Container";
import {SiteFooter} from "../../../components/layout/SiteFooter";
import {SiteHeader} from "../../../components/layout/SiteHeader";
import {type ArticleSlug, getArticle, getArticleHeadings, getReadingTime} from "../../../content/articles";
import {useI18n} from "../../../i18n/useI18n";
import {MarkdownArticle} from "../components/article-detail/MarkdownArticle";
import "../../../components/style/ArticleDetailPage.scss";

export function ArticleDetailPage({articleSlug}: { readonly articleSlug: ArticleSlug }) {
    const {locale} = useI18n();
    const article = getArticle(articleSlug, locale);
    const headings = getArticleHeadings(article);
    const readingTime = getReadingTime(article);
    const readingTimeLabel = locale === "pt-BR" ? `${readingTime} min de leitura` : `${readingTime} min read`;

    return (
        <div className="article-detail" id="top">
            <SiteHeader/>
            <main className="article-detail__main">
                <Container>
                    <a className="article-back"
                       href="/artigos">{locale === "pt-BR" ? "← Todos os artigos" : "← All articles"}</a>
                    <header className="article-detail__header">
                        <div className="article-tags">{article.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                        <h1>{article.title}</h1>
                        <p>{article.description}</p>
                        <p className="article-reading-time">{readingTimeLabel}</p>
                    </header>
                    <div className="article-detail__layout">
                        <aside className="article-toc"
                               aria-label={locale === "pt-BR" ? "Índice do artigo" : "Article contents"}>
                            <div className="article-toc__sticky">
                                <h2>{locale === "pt-BR" ? "Neste artigo" : "In this article"}</h2>
                                <nav>{headings.map((heading) => <a href={`#${heading.id}`}
                                                                   key={heading.id}>{heading.label}</a>)}</nav>
                            </div>
                        </aside>
                        <article className="article-content">
                            <MarkdownArticle markdown={article.body}/>
                        </article>
                    </div>
                </Container>
            </main>
            <SiteFooter/>
        </div>
    );
}
