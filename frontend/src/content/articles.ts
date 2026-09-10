import articleEnglish from "../../artigo/ts-config-explanation/TSConfig_blog_article_english.md?raw";
import articlePortuguese from "../../artigo/ts-config-explanation/TSConfig_artigo_blog_didatico.md?raw";
import javascriptTypeScriptEnglish from "../../artigo/js-ts-demystified/javascript-typescript-demystified.en.md?raw";
import javascriptTypeScriptPortuguese
    from "../../artigo/js-ts-demystified/javascript-typescript-sem-misterio.pt-BR.md?raw";
import nodeJsEnglish from "../../artigo/nodejs-por-baixo-do-framework/nodejs-under-the-framework.en.md?raw";
import nodeJsPortuguese from "../../artigo/nodejs-por-baixo-do-framework/nodejs-por-baixo-do-framework.pt-BR.md?raw";
import backendArchitectureEnglish
    from "../../artigo/backend-architecture-ts-node-foundation/backend-architecture-ts-node-foundation.en.md?raw";
import backendArchitecturePortuguese
    from "../../artigo/backend-architecture-ts-node-foundation/arquitetura-backend-base-ts-node.pt-BR.md?raw";
import type {Locale} from "../i18n/locale.types";

export interface Article {
    readonly slug: string;
    readonly locale: Locale;
    readonly title: string;
    readonly description: string;
    readonly tags: readonly string[];
    readonly body: string;
}

export interface CatalogArticle extends Article {
  readonly category: string;
  readonly difficulty: "advanced" | "foundational" | "intermediate";
  readonly isPlaceholder: boolean;
  readonly publishedAt: string;
  readonly series?: string;
}

function parseArticle(source: string): Article {
    const [, frontmatter = "", body = ""] = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/) ?? [];
    const values = Object.fromEntries(
        frontmatter
            .split(/\r?\n/)
            .map((line) => line.match(/^(\w+):\s*"?(.*?)"?$/))
            .filter((match): match is RegExpMatchArray => Boolean(match))
            .map((match) => [match[1], match[2]]),
    );

    return {
        slug: values.slug ?? "/article/ts-config-explanation",
        locale: values.lang === "en" || values.language === "en" ? "en" : "pt-BR",
        title: values.title ?? "TSConfig",
        description: values.description ?? "",
        tags: (values.tags ?? "").match(/[\w-]+/g)?.filter((tag) => tag !== "tags")
            ?? [...frontmatter.matchAll(/^\s*-\s+(.+)$/gm)].map((match) => match[1].trim()),
        body,
    };
}

export const articleSlugs = [
    "backend-architecture-ts-node-foundation",
    "nodejs-por-baixo-do-framework",
    "ts-config-explanation",
    "js-ts-demystified",
] as const;
export type ArticleSlug = (typeof articleSlugs)[number];

const articles: Record<ArticleSlug, Record<Locale, Article>> = {
    "backend-architecture-ts-node-foundation": {
        "pt-BR": parseArticle(backendArchitecturePortuguese),
        en: parseArticle(backendArchitectureEnglish),
    },
    "nodejs-por-baixo-do-framework": {
        "pt-BR": parseArticle(nodeJsPortuguese),
        en: parseArticle(nodeJsEnglish),
    },
    "ts-config-explanation": {
        "pt-BR": parseArticle(articlePortuguese),
        en: parseArticle(articleEnglish),
    },
    "js-ts-demystified": {
        "pt-BR": parseArticle(javascriptTypeScriptPortuguese),
        en: parseArticle(javascriptTypeScriptEnglish),
    },
};

export function getArticle(slug: ArticleSlug, locale: Locale) {
  return articles[slug][locale];
}

const catalogMetadata = {
  "backend-architecture-ts-node-foundation": {
    "pt-BR": { category: "Arquitetura backend", difficulty: "intermediate", publishedAt: "07 set, 2026", series: "Base TS/Node" },
    en: { category: "Backend architecture", difficulty: "intermediate", publishedAt: "Sep 07, 2026", series: "TS/Node Foundation" },
  },
  "nodejs-por-baixo-do-framework": {
    "pt-BR": { category: "Node.js", difficulty: "foundational", publishedAt: "07 set, 2026", series: "Base TS/Node" },
    en: { category: "Node.js", difficulty: "foundational", publishedAt: "Sep 07, 2026", series: "TS/Node Foundation" },
  },
  "ts-config-explanation": {
    "pt-BR": { category: "TypeScript", difficulty: "foundational", publishedAt: "06 set, 2026", series: "Fundamentos de TypeScript" },
    en: { category: "TypeScript", difficulty: "foundational", publishedAt: "Sep 06, 2026", series: "TypeScript fundamentals" },
  },
  "js-ts-demystified": {
    "pt-BR": { category: "JavaScript e TypeScript", difficulty: "foundational", publishedAt: "05 set, 2026", series: "Fundamentos de TypeScript" },
    en: { category: "JavaScript & TypeScript", difficulty: "foundational", publishedAt: "Sep 05, 2026", series: "TypeScript fundamentals" },
  },
} as const;

const placeholders = {
  "pt-BR": [
    { slug: "/article/example-observability", title: "Observabilidade para serviços distribuídos", description: "Exemplo fictício para demonstrar como um próximo artigo será apresentado no catálogo.", tags: ["Observabilidade", "SRE"], category: "Sistemas distribuídos", difficulty: "intermediate", publishedAt: "Em breve", series: "Sistemas em produção" },
    { slug: "/article/example-react-performance", title: "Uma estratégia de performance para React", description: "Exemplo fictício para manter a leitura visual da página até a próxima publicação real.", tags: ["React", "Performance"], category: "Frontend", difficulty: "intermediate", publishedAt: "Em breve" },
  ],
  en: [
    { slug: "/article/example-observability", title: "Observability for distributed services", description: "Fictional example showing how a future article will appear in the catalogue.", tags: ["Observability", "SRE"], category: "Distributed systems", difficulty: "intermediate", publishedAt: "Coming soon", series: "Production systems" },
    { slug: "/article/example-react-performance", title: "A performance strategy for React", description: "Fictional example preserving the page rhythm until the next real publication.", tags: ["React", "Performance"], category: "Frontend", difficulty: "intermediate", publishedAt: "Coming soon" },
  ],
} as const;

export function getCatalogArticles(locale: Locale): readonly CatalogArticle[] {
  const published = articleSlugs.map((slug) => ({ ...getArticle(slug, locale), ...catalogMetadata[slug][locale], isPlaceholder: false }));
  return [...published, ...placeholders[locale].map((article) => ({ ...article, locale, body: "", isPlaceholder: true }))];
}

export function getReadingTime(article: Article) {
    return Math.max(1, Math.ceil(article.body.split(/\s+/).filter(Boolean).length / 200));
}

export function getArticleHeadings(article: Article) {
    return article.body
        .split(/\r?\n/)
        .map((line) => line.match(/^(#{2})\s+(.+)$/))
        .filter((match): match is RegExpMatchArray => Boolean(match) && !["Suggested next readings", "Próximas leituras sugeridas"].includes(match![2]))
        .map((match) => ({
            id: match[2]
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
            label: match[2],
        }));
}
