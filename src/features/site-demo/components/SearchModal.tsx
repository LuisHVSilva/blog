import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../../components/ui/Icon";
import "../../../components/style/SearchModal.scss";

const destinations = [
  { title: "Início", description: "Página inicial e destaques", href: "/", placeholder: true },
  { title: "Projetos", description: "Vitrine de projetos fictícios", href: "/projects", placeholder: true },
  { title: "Categorias", description: "Coleções editoriais fictícias", href: "/categories", placeholder: true },
  { title: "Séries", description: "Trilhas de aprendizado fictícias", href: "/series", placeholder: true },
  { title: "TSConfig sem mistério", description: "Artigo real do blog", href: "/article/ts-config-explanation", placeholder: false },
  { title: "JavaScript e TypeScript sem mistério", description: "Artigo real do blog", href: "/article/js-ts-demystified", placeholder: false },
  { title: "Node.js por baixo do framework", description: "Fundamentos do runtime Node.js", href: "/article/nodejs-por-baixo-do-framework", placeholder: false },
];

export function SearchModal({ onClose }: { readonly onClose: () => void }) {
  const [query, setQuery] = useState("");
  useEffect(() => { const key = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [onClose]);
  const results = useMemo(() => destinations.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div aria-modal="true" className="search-modal" onMouseDown={onClose} role="dialog"><section className="search-modal__panel" onMouseDown={(event) => event.stopPropagation()}><header><Icon name="search" /><input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no blog" value={query} /><button aria-label="Fechar busca" onClick={onClose} type="button"><Icon name="x" /></button></header><p className="search-modal__label">Resultados e navegação</p><div>{results.map((item) => <a href={item.href} key={item.href}><span>{item.placeholder ? "FICTÍCIO" : "ARTIGO"}</span><strong>{item.title}</strong><small>{item.description}</small></a>)}</div></section></div>;
}
