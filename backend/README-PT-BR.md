# Backend do Blog

[Read in English](./README.md)

O Backend do Blog é o serviço de publicação e leitura pública de uma biblioteca aberta de programação. Ele transforma conteúdo Markdown revisado e versionado em catálogo editorial controlado, API REST pública e snapshot consistente para o frontend pré-renderizar páginas indexáveis.

Este diretório é o backend do workspace `blog`. O frontend consome o snapshot público; o conteúdo canônico fica em `../content/`.

## O que entrega

- Catálogo editorial em PostgreSQL, com IDs estáveis de artigos e traduções.
- Importação de Markdown revisado com frontmatter YAML, hash de conteúdo, UTF-8, validação compatível com GFM e catálogo de autores, tags e séries.
- Operações editoriais explícitas: importar, publicar, despublicar, arquivar e restaurar com proteção.
- API pública localizada para artigos publicados, tags e séries ordenadas.
- Slugs por idioma, redirects de aliases públicos, URLs canônicas estáveis e sem fallback silencioso de idioma.
- Snapshot público consistente por revisão para geração estática do frontend.
- Migrations versionadas, papéis de banco separados para aplicação e migrador, sem sincronização implícita de schema.
- Health checks, envelopes de erro seguros, correlação de requisições, CORS estrito, consultas limitadas, encerramento gracioso e logs estruturados com redação de dados sensíveis.
- Imagens Docker e Compose para desenvolvimento e operação independente da API/banco.
- Backup PostgreSQL criptografado e restauração deliberadamente limitada a bancos de teste isolados.

## Escopo

O P0 concluído é um backend editorial. Ele ainda não oferece contas públicas, login com GitHub, comentários, curtidas, contadores de visualização, progresso de usuário ou painel administrativo. Essas capacidades pertencem a fases posteriores e não são simuladas pela API atual.

## Arquitetura

```text
content/ (Markdown revisado + catálogo)
          │
          ├─ validar → importar/revisão → PostgreSQL
          │                              │
          │                              ├─ API pública
          │                              └─ snapshot consistente → SSG do frontend
          │
          └─ operações explícitas de publicar/arquivar/restaurar
```

A aplicação usa camadas com dependências invertidas. Domínio e aplicação dependem de contratos; HTTP, PostgreSQL, CLI, logs e ciclo de vida do processo são adaptadores. O histórico detalhado está em [`../docs/implementacao-back`](../docs/implementacao-back/00_COMECE_AQUI.md).

## Requisitos

- Node.js **22.23.2** (ver [`.node-version`](./.node-version)).
- npm, distribuído com o Node.js.
- PostgreSQL 16 para desenvolvimento no host, ou Docker Desktop/Compose.
- Para backup/restauração no host: clientes PostgreSQL (`pg_dump`, `pg_restore` e `psql`). A imagem de operações já os inclui.

## Início rápido: desenvolvimento local

Dentro de `backend/`:

```bash
npm ci
Copy-Item .env.example .env.dev     # PowerShell
# cp .env.example .env.dev          # macOS/Linux
npm run dev
```

`npm run dev` inicia o PostgreSQL local e executa a API em modo watch. A API usa a `PORT` de `.env.dev` (padrão `3010`). O banco começa vazio; aplique migrations e carregue a fixture editorial antes de esperar conteúdo publicado:

```bash
npm run build
npm run migrate
npm run seed:local -- --root ../content
```

O seed local aceita somente bancos `blog_dev` ou `blog_test_*` explícitos, recusa produção e importa as oito traduções de fixture como conteúdo publicado. Ele não substitui uma revisão operacional.

Para executar o workspace completo, com geração de snapshot, build do frontend, Nginx e API, use a raiz do repositório:

```bash
docker compose up --build
```

O site local fica em `http://localhost:8080`. A API é encaminhada por `/api/` e também é exposta em `http://localhost:3010` pelo Compose exclusivo do backend.

## Configuração

Copie `.env.example` para `.env.dev` no desenvolvimento. Nunca versione `.env.dev`, `.env.production` ou segredos reais.

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `NODE_ENV` | Sim | `dev`, `test` ou `production`. Produção usa somente ambiente injetado. |
| `PORT` | Sim | Porta HTTP. |
| `PUBLIC_SITE_URL` | Sim | Origem pública absoluta. Em produção exige HTTPS; paths, credenciais, query e fragmento são rejeitados. |
| `CORS_ORIGINS` | Sim | Origens HTTP(S) permitidas, separadas por vírgula. Vazio desabilita acesso browser cross-origin. |
| `TRUST_PROXY` | Não | `false`/vazio ou IPs/CIDRs controlados. `true` e redes públicas `/0` são rejeitados. |
| `LOG_SERVICE` | Não | Nome do serviço nos logs estruturados; padrão `blog-api`. |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Sim | Conexão PostgreSQL da aplicação. |
| `DB_USERNAME`, `DB_PASSWORD` | Sim | Papel da aplicação. O Compose usa o papel de menor privilégio `blog_app`. |
| `DB_DIALECT` | Sim | Deve ser `postgres`. |
| `DB_POOL_MAX`, `DB_ACQUIRE_MS`, `DB_STATEMENT_TIMEOUT_MS` | Não | Limites de pool e consulta; padrões 5, 5000 ms e 3000 ms. |
| `MIGRATOR_DB_HOST`, `MIGRATOR_DB_PORT`, `MIGRATOR_DB_NAME` | Em migrations | Conexão do papel com permissão DDL. |
| `MIGRATOR_DB_USERNAME`, `MIGRATOR_DB_PASSWORD` | Em migrations | Credenciais do migrador; mantenha-as separadas das credenciais da aplicação. |
| `SYNC` | Sim | Deve ser `false` ou vazio. Schema muda somente por migrations. |

`BACKUP_KEY` só é necessária em backup/restauração. Ela deve conter 32 bytes como 64 caracteres hexadecimais. Quando usada, `BACKUP_UPLOAD_URL` precisa ser HTTPS.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia PostgreSQL local e a API em watch. |
| `npm run dev:compose` | Executa o Compose de desenvolvimento do backend. |
| `npm run build` | Compila TypeScript para `dist/`. |
| `npm start` | Inicia a API compilada; rode o build antes. |
| `npm run lint` | Executa ESLint sem permitir warnings. |
| `npm run typecheck` | Verifica TypeScript de produção e testes sem emitir arquivos. |
| `npm test` | Executa testes unitários, integração e API. O runner usa os defaults isolados de `docker-compose-test.yml`; antes, suba o banco de testes. |
| `npm run test:unit` / `test:api` | Executa somente testes unitários ou HTTP/API. |
| `npm run test:integration` | Executa integração contra PostgreSQL isolado. |
| `npm run ci` | Executa lint, typecheck, toda a suíte e build. |
| `npm run migrate` / `migrate:status` | Aplica ou lista migrations pelo papel migrador. |
| `npm run seed:local` | Carrega conteúdo local seguro. |
| `npm run content:*` | Valida, importa, muda estado editorial ou exporta snapshot. |
| `npm run content:release:local` | Em dev/test, valida e importa a edição completa de `content/`, exporta o snapshot do frontend e gera o build do frontend. Respeita os estados `published` da fonte e é bloqueado em produção. |
| `npm run content:release:local:dry-run` | Mostra com segurança a prévia da importação local, sem alterar banco, snapshot ou build do frontend. |

Para o banco de testes:

```bash
npm run test:database:up
npm test
npm run test:database:down
```

## Fluxo editorial

A fonte canônica é `../content/`. Ela contém `catalog.yaml` e arquivos Markdown por idioma em `articles/<article-id>/`. O importador verifica contenção de caminhos, chaves YAML duplicadas, campos de frontmatter, hashes, IDs, idioma/nome do arquivo, segurança Markdown e relações do catálogo.

Compile antes de usar as CLIs TypeScript:

```bash
npm run build
```

Valide uma revisão sem conectar ao banco:

```bash
npm run content:validate -- --root ../content --format json
```

Importe uma revisão revisada. `empty` só vale na primeira importação:

```bash
npm run content:import -- \
  --root ../content \
  --expected-revision empty \
  --operator-id editorial-maintainer \
  --revision <revisao-da-fonte-revisada>
```

Use `--dry-run` em `content:import` para prévia. As importações seguintes devem usar a revisão atual retornada pela operação anterior, evitando sobrescrita despercebida.

Operações de estado exigem UUID do artigo, revisão esperada, operador, revisão da fonte e motivo revisado. `publish` e `unpublish` também exigem locale:

```bash
npm run content:publish -- \
  --article-id <uuid-do-artigo> --locale pt-BR \
  --expected-revision <revisao-atual> \
  --operator-id editorial-maintainer --revision <revisao-da-fonte> \
  --reason "Revisão editorial concluída"
```

`content:unpublish` aceita `--target-state draft|archived`; `content:archive` opera no artigo; `content:restore` exige prévia `--dry-run` antes de `--confirm-reexposure` ao restaurar um artigo. Todas as escritas verificam revisão e são auditáveis pelo modelo editorial.

Exporte a revisão pública usada pelo frontend:

```bash
npm run content:export -- --output ../frontend/generated/published-content.json
```

A exportação grava temporário e faz rename atômico depois de terminar um snapshot consistente e somente leitura.

## API HTTP pública

O contrato completo está em [OpenAPI 3.1](./openapi.yaml). Todo conteúdo é localizado e somente dados publicados são retornados.

| Endpoint | Descrição |
| --- | --- |
| `GET /health/live` | Liveness do processo; independe do PostgreSQL. |
| `GET /health/ready` | Readiness; retorna `503` sem banco ou durante início do shutdown. |
| `GET /api/v1/articles` | Resumos paginados. Aceita `locale`, `page`, `limit` (máximo 50), `tag`, `series`, `difficulty`, `q` e `sort`. |
| `GET /api/v1/articles/by-slug/{locale}/{slug}` | Detalhe publicado; alias público responde `308` para o slug atual. |
| `GET /api/v1/tags?locale=pt-BR` | Tags localizadas e contagem de artigos públicos. |
| `GET /api/v1/series?locale=pt-BR` | Séries localizadas com membros visíveis. |
| `GET /api/v1/series/by-slug/{locale}/{slug}` | Detalhe de série e navegação ordenada. |

Os idiomas são `pt-BR` e `en`; onde documentado, a API também aceita `pt-br`. Parâmetros inválidos ou repetidos retornam `400` seguro. Recursos ausentes ou não públicos retornam `404`. Falhas de dependência retornam `503`. Erros incluem `requestId`, mas nunca SQL, stack trace, corpo da requisição ou segredo.

Representações públicas aceitam requisições condicionais e cache compartilhado conservador. Erros e health checks usam `Cache-Control: no-store`.

```bash
curl "http://localhost:3010/api/v1/articles?locale=pt-BR&limit=20"
curl "http://localhost:3010/health/ready"
```

## Docker e produção

`docker-compose.yml` é a definição de operação independente do backend/API. Ele cria PostgreSQL, executa migrations uma vez e inicia a API read-only somente depois do sucesso das migrations:

```bash
# Crie backend/.env.production com valores reais não versionados.
npm run production:compose
```

Produção requer ao menos `DB_NAME`, `DB_PASSWORD`, `MIGRATOR_DB_USERNAME`, `MIGRATOR_DB_PASSWORD` e `PUBLIC_SITE_URL`; defina também `CORS_ORIGINS` e `TRUST_PROXY` para a topologia real. A API do Compose é ligada em `127.0.0.1:3010`, portanto use proxy reverso com TLS à frente dela. Não exponha PostgreSQL publicamente.

Antes do release, defina domínio, host/região, responsável operacional, canal de incidente, armazenamento externo de backup, RPO/RTO e credenciais distintas de aplicação/migrador. O repositório não pode inferir essas decisões com segurança.

Depois de importar/exportar revisão revisada e publicar o site, execute o smoke entre fronteiras:

```bash
npm run release:smoke -- \
  <arquivo-do-snapshot> <revisao> https://site.example https://api.example
```

Ele verifica estrutura/revisão do snapshot, paridade da API, HTML de artigos, sitemap, aliases e rota `404` real.

## Backup e recuperação

O backup cria dump PostgreSQL custom criptografado com AES-256-GCM e arquivo lateral SHA-256. Exige `BACKUP_KEY`, `PGHOST`, `PGUSER`, `PGPASSWORD`, banco e arquivo de saída explícitos:

```bash
BACKUP_KEY=<64-caracteres-hex> \
PGHOST=<host> PGUSER=<papel-migrador-ou-backup> PGPASSWORD=<senha> \
npm run backup -- <banco> <saida-criptografada>
```

Use a imagem de operações ou ambiente com clientes PostgreSQL. `BACKUP_UPLOAD_URL`, se configurada, precisa ser HTTPS.

Restauração é propositalmente limitada a banco **vazio** chamado `blog_test_*`; não restaura desenvolvimento ou produção:

```bash
BACKUP_KEY=<64-caracteres-hex> \
PGHOST=<host> PGUSER=<papel> PGPASSWORD=<senha> \
npm run restore -- blog_test_recovery <saida-criptografada> --execute
```

Valide a revisão recuperada e execute o smoke de release antes de promover dados. Volume Docker não é backup.

## Segurança e comportamento operacional

- A configuração rejeita banco, URL, confiança de proxy e sincronização implícita inválidos.
- Credenciais da aplicação têm privilégios de dados; migrations usam papel DDL separado.
- Mutações JSON exigem content type JSON e aceitam no máximo 16 KiB; query string também é limitada.
- Helmet, CORS estrito, request IDs, fronteira de erros e logs estruturados com redação ficam na borda HTTP.
- Probes de readiness são limitados e não acumulam verificações concorrentes; liveness não representa estado do banco.
- SIGTERM/SIGINT e falhas fatais de startup/runtime encerram listener e pool de banco com segurança.
- Snapshot público omite drafts, campos editoriais privados, operadores e detalhes do banco.

Reporte vulnerabilidades pelo canal privado de segurança do repositório quando ele estiver configurado. Não inclua credenciais, snapshots de produção com dados sensíveis ou dumps de banco em issues.

## Estrutura

```text
backend/
├── src/                 aplicação, domínio, HTTP, infraestrutura e adaptadores editoriais
├── migrations/          migrations PostgreSQL ordenadas e com checksum
├── scripts/             build, migration, seed, backup, restore e release
├── tests/               testes unitários, integração, API e fixtures de processo
├── openapi.yaml         contrato público da API
├── docker-compose*.yml  stacks local, teste e produção exclusiva do backend
└── Dockerfile*          imagens runtime, desenvolvimento e operações

../content/              fonte editorial canônica revisada
../frontend/             site estático gerado do snapshot exportado
```

## Verificação

Antes de abrir um pull request, execute:

```bash
npm run ci
```

A suíte cobre configuração, ciclo de vida HTTP, migrations e privilégios, validação editorial, domínio imutável, publicação/revisões, contrato público, consistência de snapshot, guardas de backup e startup compilado. Integrações usam PostgreSQL `blog_test_*` isolado.

## Licença e contribuições

A licença e a política de contribuição da raiz do repositório governam este backend. Mudanças de comportamento público devem atualizar [OpenAPI](./openapi.yaml), testes e documentação de implementação aplicável. Mudanças editoriais devem seguir o fluxo revisado acima para manter API e site na mesma revisão.
