# Blog Técnico

Uma aplicação de blog técnico construída para publicar estudos sobre desenvolvimento de software e, ao mesmo tempo, apresentar práticas de frontend com React e TypeScript.

O projeto prioriza uma experiência editorial responsiva, leitura confortável e uma base de código organizada por responsabilidades.

## Demonstração

Execute o projeto localmente e acesse `http://localhost:5173`.

## Funcionalidades

- Página inicial editorial com artigos em destaque, categorias e série de conteúdos.
- Catálogo e páginas de detalhe de artigos.
- Artigos escritos em Markdown e carregados diretamente pela aplicação.
- Renderizador Markdown próprio para títulos, parágrafos, listas, citações, blocos de código e links.
- Alternância entre português (PT-BR) e inglês (EN), com preferência persistida no navegador.
- Tema claro/escuro que respeita a preferência inicial do sistema e salva a escolha do visitante.
- Busca de conteúdo e navegação para artigos, categorias, projetos e séries.
- Interface responsiva criada com Sass e componentes reutilizáveis.

## Tecnologias

- React 19
- TypeScript
- Vite
- Sass
- ESLint

## Como executar

Pré-requisito: Node.js instalado (versão LTS recomendada).

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Para verificar a qualidade do código:

```bash
npm run lint
```

## Rotas disponíveis

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial com publicações e destaques |
| `/artigos` | Arquivo de artigos |
| `/article/ts-config-explanation` | Artigo sobre configuração do TypeScript |
| `/article/js-ts-demystified` | Artigo sobre JavaScript e TypeScript |
| `/categories` | Categorias de conteúdo |
| `/projects` | Projetos |
| `/series` | Séries de artigos |

## Estrutura do projeto

```text
src/
├── components/   # Componentes de layout, interface e estilos globais
├── content/      # Catálogo e metadados dos artigos
├── features/     # Páginas e componentes organizados por domínio
├── i18n/         # Contexto e resolução de idioma
└── theme/        # Contexto e persistência de tema

artigo/           # Fontes Markdown dos artigos, em PT-BR e EN
```

## Destaques de implementação

- Componentização de layout, navegação, cartões de artigo e elementos de UI.
- Context API para estado global de idioma e tema.
- Preferências de usuário persistidas com `localStorage`.
- Tipagem de catálogo, artigos, rotas e componentes com TypeScript.
- Importação de arquivos Markdown como conteúdo bruto pelo Vite e transformação em uma experiência de leitura nativa.

## Próximos passos

- Substituir conteúdos demonstrativos por projetos e publicações reais.
- Integrar uma fonte de dados ou CMS para publicação de artigos.
- Adicionar testes de componentes e fluxos de navegação.
- Publicar uma demonstração com Vercel, Netlify ou GitHub Pages.

---

Desenvolvido como projeto de portfólio para demonstrar desenvolvimento de interfaces modernas com React.
