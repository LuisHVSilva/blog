import {Icon, type IconName} from "../../../../components/ui/Icon";

export interface EditorialArticle {
    readonly category: string;
    readonly description?: string;
    readonly href: string;
    readonly image: string;
    readonly meta: string;
    readonly title: string;
}

export function EditorialArticleCard({article, featured = false}: {
    readonly article: EditorialArticle;
    readonly featured?: boolean
}) {
    return (
        <article className={`editorial-article ${featured ? "editorial-article--featured" : ""}`}>
            <a
                aria-label={article.title}
                className="editorial-article__image"
                href={article.href}
            >
                <img alt="" src={article.image}/>
            </a>
            <div className="editorial-article__meta">
                <span className={featured ? "editorial-article__tag" : "editorial-article__category"}>
                    {article.category}
                </span>
                <span>{article.meta}</span>
            </div>
            <h3><a href={article.href}>{article.title}</a></h3>
            {article.description ? <p>{article.description}</p> : null}
        </article>
    );
}

export function DomainCard({icon, name, count}: {
    readonly icon: IconName;
    readonly name: string;
    readonly count: string
}) {
    return (
        <a className="domain-card" href="/categories">
            <Icon name={icon}/>
            <h3>{name}</h3>
            <p>{count}</p>
        </a>
    );
}
