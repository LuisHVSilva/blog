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
5. Para atualizar uma edição local existente, use `npm run content:release:local` em `backend/`; o Compose da raiz é a demonstração inicial e não o fluxo de atualização editorial.

O backend valida IDs, relações do catálogo, frontmatter, hashes, Markdown e caminhos de assets antes da importação. O frontend só apresenta o snapshot exportado.

## Atalho local de publicação

Para desenvolvimento, `backend/` oferece um comando único para aplicar uma edição completa. Ele trata artigos, autores, tags, séries e projetos como uma única revisão: o que estiver declarado como `published` na fonte passa a compor a publicação local.

```powershell
Set-Location ../backend
npm run content:release:local:dry-run
npm run content:release:local
```

O primeiro comando somente consulta o banco e mostra a prévia; o segundo importa a edição, exporta `../frontend/generated/published-content.json` e executa o build do frontend. Ele é bloqueado em produção. Para visualizar o snapshot no desenvolvimento, execute depois `npm run dev` dentro de `frontend/`.

Antes da primeira execução, inicie o banco local, aplique migrations e tenha `backend/.env.dev` configurado. Não use o `seed:local` como fluxo de atualização editorial: ele é uma fixture restrita de desenvolvimento.
