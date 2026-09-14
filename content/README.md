# Conteúdo editorial

Esta é a única fonte de Markdown editorial do projeto. O frontend não importa Markdown, catálogo raw ou arquivos de demonstração.

## Estrutura

```text
content/
  catalog.yaml
  articles/
    <article-id>/
      pt-BR.md
      en.md
```

`catalog.yaml` define a identidade compartilhada do artigo, autoria, tags, dificuldade e séries. Cada arquivo de locale contém frontmatter localizado e o corpo Markdown GFM. O nome do arquivo deve ser exatamente o locale declarado no frontmatter.

## Fluxo

1. Crie ou edite `catalog.yaml` e `articles/<article-id>/<locale>.md`.
2. Em `backend/`, execute `npm run build` e `npm run content:validate -- --root ../content --format json`.
3. Importe a edição revisada com `npm run content:import` e publique as traduções aprovadas com `npm run content:publish`.
4. Exporte o snapshot público: `npm run content:export -- --output ../frontend/generated/published-content.json`.
5. Gere ou atualize o site com `docker compose up --build` na raiz do projeto.

O backend valida IDs, relações do catálogo, frontmatter, hashes, Markdown e caminhos de assets antes da importação. O frontend só apresenta o snapshot exportado.
