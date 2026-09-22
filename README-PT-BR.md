# Blog — Plataforma Fullstack de Publicação

[Read in English](./README.md)

Este repositório contém um blog técnico fullstack, bilíngue e localizado, construído como projeto público de portfólio. Ele combina um backend editorial, uma experiência de leitura em React, uma fonte versionada de conteúdo Markdown e uma stack de entrega com Docker/Nginx.

O projeto foi desenhado para demonstrar mais do que uma aplicação CRUD isolada: sua principal preocupação é manter o conteúdo editorial validado, publicado, versionado e renderizado de forma consistente entre a API, o site gerado e o artefato de release.

## Visão geral

A plataforma oferece uma experiência pública e somente leitura em `pt-BR` e `en`, com artigos, tags, séries, projetos, rotas localizadas, índices de busca, páginas institucionais e metadados de SEO. O conteúdo editorial é mantido como Markdown revisado e dados de catálogo, importado para o PostgreSQL e exportado como um snapshot de publicação consumido pelo frontend.

O navegador recebe HTML pré-renderizado e um pequeno bundle de aprimoramento. Ele não consulta a API para obter o conteúdo dos artigos nem recebe o snapshot editorial completo. Assim, o site público permanece rápido, indexável e independente da API depois que um release é gerado.

> Este é um projeto de portfólio e demonstração. A configuração Compose usa credenciais exclusivas para o ambiente local e conteúdo de exemplo. Uma implantação real ainda exige domínio, secrets, armazenamento de backups, responsáveis operacionais, monitoramento e processo de incidentes.

## Principais destaques

- Arquitetura fullstack com Node.js, Express, TypeScript, PostgreSQL, React, Vite, Docker e Nginx.
- Experiência pública bilíngue em `pt-BR` e `en`, incluindo slugs localizados e URLs canônicas.
- Fluxo editorial com Markdown, frontmatter YAML, validação de catálogo, hashes de conteúdo, revisões, estados de publicação e informações de auditoria.
- Contrato de snapshot entre backend e frontend, validado com Zod e vinculado a uma revisão exata de publicação.
- SSR e geração estática com React para páginas indexáveis, metadados, Open Graph, JSON-LD, sitemap, robots.txt, redirects e uma página 404 estática real.
- Backend em camadas com inversão de dependências, casos de uso explícitos, contratos de repositórios, adaptadores PostgreSQL, migrations e contrato público OpenAPI 3.1.
- Artefatos imutáveis de release do frontend com hashes de arquivos, digest do snapshot, promoção atômica e rollback protegido.
- Limites de segurança e operação, como papéis separados de banco para aplicação/migrador, CORS estrito, Helmet, correlação de requisições, envelopes de erro seguros, consultas limitadas, encerramento gracioso e rate limiting no Nginx.
- Gates automatizados de qualidade cobrindo verificação de tipos, lint, testes unitários, de integração, de API, de navegador, hospedagem de release e smoke tests do release público entre as camadas.

## Arquitetura

```text
content/
  catalog.yaml + Markdown localizado
                |
                v
CLI do backend -- validar/importar/publicar/exportar --> PostgreSQL
       |                                                   |
       |                                                   +--> API REST pública
       v
published-content.json
                |
                v
Validação Zod --> build Vite + SSR React --> release pré-renderizado
                                                        |
                                                        v
                                                     Nginx
                                      páginas estáticas + proxy /api
```

A stack local completa é orquestrada pelo `compose.yaml` da raiz:

1. O PostgreSQL inicia com os papéis de banco locais.
2. O serviço de migrations aplica o schema versionado.
3. O serviço de conteúdo valida/carrega a fixture editorial local e exporta `published-content.json`.
4. A API inicia somente depois que o banco e o conteúdo estão prontos.
5. O frontend gera um release estático imutável a partir do snapshot.
6. O Nginx serve o site estático e faz proxy de `/api/` e `/health/` para o Express.

## Stack tecnológica

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Conteúdo | Markdown, YAML | Fonte localizada revisada e catálogo editorial. |
| Backend | Node.js `22.23.2`, Express 5, TypeScript, Sequelize, PostgreSQL 16 | Validação, operações editoriais, persistência, exportação do snapshot e API pública. |
| Frontend | React 19, React DOM SSR, Vite, TypeScript, Sass, React Markdown | Páginas localizadas, SSR, geração estática, projeção Markdown, busca e acessibilidade. |
| Validação | Zod, Unified, remark-gfm | Contratos em runtime, parsing de Markdown e regras de segurança do conteúdo. |
| Entrega | Docker Compose, Nginx | Stack local reproduzível, hospedagem estática, proxy da API, redirects, headers e rate limiting. |
| Qualidade | ESLint, Vitest, Playwright, GitHub Actions | Análise estática, testes unitários/de integração/navegador, testes de host e gates de CI. |

## Estrutura do repositório

```text
.
├── backend/                  API Node.js + Express e pipeline editorial
│   ├── src/                  domínio, aplicação, HTTP e infraestrutura
│   ├── migrations/            migrations versionadas do PostgreSQL
│   ├── scripts/               build, seed, migration, backup, restore e smoke tests
│   ├── tests/                 testes unitários, de integração, API e processo
│   └── openapi.yaml           contrato da API pública
├── frontend/                 site React SSR/estático
│   ├── src/                  rotas, páginas, projeções de conteúdo, SEO e UI
│   ├── scripts/               desenvolvimento, build, prerender e operações de release
│   ├── tests/                 testes unitários, integração, navegador, host e snapshots
│   └── generated/             diretório ignorado de entrada do snapshot
├── content/                  fonte editorial canônica
│   ├── catalog.yaml           autores, tags, séries, projetos e identidade dos artigos
│   └── articles/              um Markdown localizado por artigo/locale
├── deploy/nginx.conf          configuração de hospedagem estática e proxy da API
├── compose.yaml               stack completa do workspace local
└── .github/workflows/         CI automatizada e verificação do release público
```

## Requisitos

- Docker Desktop com Docker Compose, recomendado para a stack completa.
- Node.js **22.23.2** e npm para trabalhar no backend ou frontend de forma independente.
- Chromium para os testes de navegador do frontend; instale com `npx playwright install chromium`.
- PostgreSQL 16 e ferramentas cliente do PostgreSQL somente ao executar operações do backend diretamente no host.

## Início rápido: stack local completa

Na raiz do repositório, execute:

```bash
npm run dev:all
```

O comando gera as imagens do backend e frontend, cria ou reutiliza o PostgreSQL local, aplica as migrations, carrega a fonte revisada em `content/`, exporta o snapshot público, gera o release estático e inicia o Nginx. Ele recria os serviços de migration, conteúdo e build a cada execução, portanto artigos, catálogo, tags e séries alterados são incluídos sem apagar o volume do banco.

Acesse o site em [`http://localhost:8080`](http://localhost:8080). Alguns endpoints locais úteis:

```bash
curl "http://localhost:8080/pt-BR"
curl "http://localhost:8080/api/v1/articles?locale=pt-BR&limit=20"
curl "http://localhost:8080/health/ready"
```

A stack da raiz expõe o site em `127.0.0.1:8080`; a API fica disponível pelo proxy `/api/` do Nginx. O serviço PostgreSQL não é exposto publicamente.

Pare a stack com:

```bash
docker compose down
```

O comando padrão preserva os volumes nomeados, incluindo o banco local. Remover volumes é opcional e apaga permanentemente os dados locais de banco/snapshot/release:

```bash
docker compose down --volumes
```

## Desenvolvimento independente do backend

Dentro de `backend/`:

```bash
npm ci
Copy-Item .env.example .env.dev     # PowerShell
# cp .env.example .env.dev          # macOS/Linux
npm run build
npm run dev:database
npm run migrate
npm run seed:local -- --root ../content
npm run dev:api
```

A API escuta em `http://localhost:3010` com a configuração de exemplo. `npm run dev` é um atalho que inicia o banco de desenvolvimento e a API com atualização automática; as migrations e os dados locais precisam ser preparados conforme descrito acima.

O backend oferece os seguintes endpoints públicos:

| Endpoint | Finalidade |
| --- | --- |
| `GET /health/live` | Liveness do processo, independente do PostgreSQL. |
| `GET /health/ready` | Status de readiness, incluindo disponibilidade do banco. |
| `GET /api/v1/articles` | Resumos paginados de artigos publicados, com filtros de idioma, tag, série, dificuldade, busca e ordenação. |
| `GET /api/v1/articles/by-slug/{locale}/{slug}` | Detalhe localizado de artigo publicado; aliases públicos redirecionam com `308`. |
| `GET /api/v1/tags` | Tags localizadas e quantidade de artigos públicos. |
| `GET /api/v1/series` | Séries localizadas. |
| `GET /api/v1/series/by-slug/{locale}/{slug}` | Detalhe da série com navegação ordenada de artigos. |
| `GET /api/v1/projects` | Projetos localizados publicados. |
| `GET /api/v1/projects/by-slug/{locale}/{slug}` | Detalhe de projeto publicado. |

O contrato completo, com schemas, parâmetros, status HTTP e representações de erro, está em [`backend/openapi.yaml`](./backend/openapi.yaml).

## Desenvolvimento independente do frontend

A entrada do build do frontend é o snapshot publicado em `frontend/generated/published-content.json`. Esse arquivo é ignorado pelo Git de propósito, pois é gerado a partir dos dados de publicação do backend.

Exporte um snapshot local a partir de um banco do backend já preparado:

```bash
cd backend
npm run content:export -- --output ../frontend/generated/published-content.json
cd ../frontend
npm ci
npm run dev
```

Acesse `http://127.0.0.1:5173`. O servidor de desenvolvimento usa React SSR com o mesmo snapshot que alimenta o build estático. Ele oferece rotas localizadas, redirects, índices de catálogo e respostas 404 sem consultar a API pelo navegador.

Para gerar e visualizar um build estático:

```bash
npm run build
npm run preview
```

O build valida o snapshot, cria os bundles de cliente e SSR e pré-renderiza o site em `dist/`. Um snapshot ausente, malformado, inconsistente ou desatualizado faz o build falhar, em vez de gerar uma publicação parcial.

## Fluxo editorial

A fonte canônica de conteúdo é `content/`. Cada artigo possui uma identidade estável em `catalog.yaml` e arquivos Markdown localizados em `content/articles/<article-id>/`.

O fluxo normal é:

1. Adicionar ou editar o catálogo e os arquivos Markdown localizados.
2. Validar a revisão sem alterar o banco:

   ```bash
   cd backend
   npm run build
   npm run content:validate -- --root ../content --format json
   ```

3. Importar a revisão avaliada informando a revisão atual esperada e os dados do operador.
4. Publicar, despublicar, arquivar ou restaurar conteúdo pelos comandos editoriais protegidos.
5. Exportar a revisão pública exata consumida pelo frontend:

   ```bash
   npm run content:export -- --output ../frontend/generated/published-content.json
   ```

6. Gerar e validar o release do frontend.

O backend verifica IDs, correspondência entre locale e nome de arquivo, chaves YAML duplicadas, frontmatter, hashes de conteúdo, regras de Markdown, relações do catálogo e contenção de caminhos de assets. As operações de importação e publicação verificam a revisão atual, impedindo que uma sobrescrita não percebida substitua silenciosamente o estado editorial. Consulte [`backend/README-PT-BR.md`](./backend/README-PT-BR.md) e [`content/README.md`](./content/README.md) para a referência completa de comandos.

Para aplicar uma edição local completa, use o atalho do backend depois de preparar o banco local e as migrations:

```bash
cd backend
npm run content:release:local:dry-run
npm run content:release:local
```

Ele importa a revisão inteira da fonte validada, exporta o snapshot do frontend e gera o build do frontend. O comando é propositalmente bloqueado em produção; os estados `published` na fonte continuam sendo a declaração do que se torna público.

## Modelo de publicação e release

O sistema separa publicação editorial e entrega do site:

- O PostgreSQL é a fonte do estado editorial publicado atual.
- O backend exporta um snapshot consistente, somente leitura e contendo apenas dados públicos.
- O frontend valida o schema do snapshot e a revisão de publicação antes de renderizar.
- O gerador de release cria páginas pré-renderizadas, catálogos localizados, metadados, sitemap, robots.txt, redirects e dados de integridade.
- O Nginx ativa somente o artefato de release validado e mantém separada a fronteira da API do conteúdo estático.

Os releases do frontend são imutáveis. A promoção altera o ponteiro ativo `current` somente depois da validação, e um artefato antigo só pode ser promovido novamente com uma revisão explicitamente autorizada. Isso permite corrigir apenas o frontend sem alterar o conteúdo editorial e mantém o rollback vinculado a uma revisão de publicação conhecida.

## Segurança e limites operacionais

- Arquivos `.env` locais e artefatos gerados são ignorados; secrets reais nunca devem ser commitados.
- Os papéis de banco da aplicação e do migrador são separados. A aplicação não é dona do schema, e a sincronização implícita de schema está desabilitada.
- O Express usa Helmet, CORS estrito, request IDs, limites para JSON/query, envelopes de erro seguros e logs estruturados com dados sensíveis redigidos.
- Consultas PostgreSQL, verificações de readiness, timeouts HTTP e pools de conexão possuem limites explícitos.
- O Nginx adiciona headers de segurança, limita leituras públicas, oculta internals do release e faz proxy somente dos caminhos de API/health previstos.
- Snapshots publicados não incluem drafts, conteúdo arquivado, operadores, detalhes do banco ou outros campos editoriais/privados.
- A renderização Markdown suporta GFM sem HTML cru e rejeita protocolos executáveis inseguros em URLs.
- O encerramento gracioso fecha o listener HTTP e o pool de banco em `SIGTERM`/`SIGINT`.

A superfície pública atual é deliberadamente somente leitura. Ela não inclui contas, login com GitHub, comentários, reações, contadores de visualização, progresso de usuário, processamento de envios de contato, newsletter, analytics ou interface administrativa web.

## Testes e integração contínua

Verificações do backend:

```bash
cd backend
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:api
npm run build
npm run content:validate -- --root ../content --format json
```

Para os testes de integração do backend, inicie antes o PostgreSQL isolado:

```bash
npm run test:database:up
npm run ci
npm run test:database:down
```

Verificações do frontend:

```bash
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:host
```

O workflow em [`.github/workflows/backend-ci.yml`](./.github/workflows/backend-ci.yml) executa verificações do frontend, tooling do backend em Linux e Windows, testes de integração com PostgreSQL, smoke test do release público integrado e uma verificação de leitura estática depois que a API é parada.

## Mais documentação

- [README do backend](./backend/README-PT-BR.md) · [Backend README em inglês](./backend/README.md)
- [README do frontend](./frontend/README-PT-BR.md) · [Frontend README em inglês](./frontend/README.md)
- [README do conteúdo editorial](./content/README.md)
- [Contrato da API pública](./backend/openapi.yaml)

## Licença e contribuições

O repositório atualmente inclui o texto da Apache License 2.0 em [`frontend/LICENSE`](./frontend/LICENSE). Revise o escopo pretendido da licença antes de redistribuir o workspace completo.

Contribuições que alterem o comportamento público devem atualizar, quando aplicável, o contrato da API, os testes, o conteúdo localizado, as rotas geradas, os metadados, os redirects e a validação de release. Não inclua secrets, snapshots de produção, dumps de banco ou arquivos de ambiente locais nos commits.
