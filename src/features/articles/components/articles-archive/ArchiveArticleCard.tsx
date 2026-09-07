import {Icon} from "../../../../components/ui/Icon";

export interface ArchiveArticle {
    readonly category: string;
    readonly description: string;
    readonly difficulty: "advanced" | "foundational" | "intermediate";
    readonly isPlaceholder: boolean;
    readonly meta: string;
    readonly series?: string;
    readonly slug: string;
    readonly tags: readonly string[];
    readonly title: string;
}

export function ArchiveArticleCard({article, labels}: {
    readonly article: ArchiveArticle;
    readonly labels: { readonly placeholder: string; readonly read: string }
}) {
    return (
        <article className="archive-card">
            <div className="archive-card__header">
                <div>{article.isPlaceholder ?
                    <span className="archive-card__placeholder">{labels.placeholder}</span> : null}{article.series ?
                    <span className="archive-card__series">{article.series}</span> : null}<p>{article.meta}</p></div>
                <span
                    className={`archive-card__difficulty archive-card__difficulty--${article.difficulty}`}>{article.difficulty}</span>
            </div>

            <h2>{article.title}</h2>
            <p className="archive-card__description">{article.description}</p>

            <footer>
                <div>
                    {article.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                {article.isPlaceholder ? <span className="archive-card__no-source">{labels.placeholder}</span> :
                    <a href={article.slug}><Icon name="article"/> {labels.read}</a>}</footer>
        </article>
    );
}
