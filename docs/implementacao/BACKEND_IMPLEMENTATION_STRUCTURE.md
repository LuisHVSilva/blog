# Estrutura de implementação do backend

[Comece aqui — guia de leitura e execução](./00_COMECE_AQUI.md)

<!-- navigation:index:start -->
**Navegação:** [Ordem de implementação](./BACKEND_IMPLEMENTATION_ORDER.md) · [Plano detalhado](./BACKEND_IMPLEMENTATION_PLAN.md) · **Estrutura de arquivos** · [Regras de negócio](./BACKEND_BUSINESS_RULES.md) · [Plano de testes](./BACKEND_TEST_PLAN.md)

[Arquitetura de referência](./BACKEND_ARCHITECTURE.md)

<a id="indice"></a>

## Índice

- [Árvore de destino incremental](#%C3%A1rvore-de-destino-incremental)
- [Responsabilidade, camada e dependências por arquivo](#responsabilidade-camada-e-depend%C3%AAncias-por-arquivo)
  - [.github/ISSUE_TEMPLATE](#githubissue_template)
  - [.github/pull_request_template.md](#githubpull_request_templatemd)
  - [.github/workflows](#githubworkflows)
  - [.gitignore](#gitignore)
  - [backend/.dockerignore](#backenddockerignore)
  - [backend/.env.dev](#backendenvdev)
  - [backend/.env.example](#backendenvexample)
  - [backend/.gitignore](#backendgitignore)
  - [backend/.node-version](#backendnode-version)
  - [backend/compose.test.yaml](#backendcomposetestyaml)
  - [backend/docker-compose-develop.yml](#backenddocker-compose-developyml)
  - [backend/Dockerfile](#backenddockerfile)
  - [backend/Dockerfile.develop](#backenddockerfiledevelop)
  - [backend/eslint.config.mjs](#backendeslintconfigmjs)
  - [backend/migrations](#backendmigrations)
  - [backend/openapi.yaml](#backendopenapiyaml)
  - [backend/package-lock.json](#backendpackage-lockjson)
  - [backend/package.json](#backendpackagejson)
  - [backend/scripts](#backendscripts)
  - [backend/seeds](#backendseeds)
  - [backend/src](#backendsrc)
  - [backend/src/modules/community](#backendsrcmodulescommunity)
  - [backend/src/modules/identity](#backendsrcmodulesidentity)
  - [backend/src/modules/publishing](#backendsrcmodulespublishing)
  - [backend/tests](#backendtests)
  - [backend/tsconfig.json](#backendtsconfigjson)
  - [CODE_OF_CONDUCT.md](#code_of_conductmd)
  - [compose.yaml](#composeyaml)
  - [content/articles](#contentarticles)
  - [content/catalog.yaml](#contentcatalogyaml)
  - [content/legacy-map.json](#contentlegacy-mapjson)
  - [CONTRIBUTING.md](#contributingmd)
  - [deploy/nginx.conf](#deploynginxconf)
  - [docs/adr](#docsadr)
  - [docs/BACKEND_ARCHITECTURE.md](#docsbackend_architecturemd)
  - [docs/BACKEND_OPERATIONS.md](#docsbackend_operationsmd)
  - [docs/COMMUNITY_OPERATIONS.md](#docscommunity_operationsmd)
  - [docs/CONTENT_LICENSE_POLICY.md](#docscontent_license_policymd)
  - [docs/PERFORMANCE_DECISIONS.md](#docsperformance_decisionsmd)
  - [docs/PRIVACY_OPERATIONS.md](#docsprivacy_operationsmd)
  - [docs/RELEASE_EVIDENCE.md](#docsrelease_evidencemd)
  - [frontend/.gitignore](#frontendgitignore)
  - [frontend/generated](#frontendgenerated)
  - [frontend/LICENSE](#frontendlicense)
  - [frontend/package.json](#frontendpackagejson)
  - [frontend/README.md](#frontendreadmemd)
  - [frontend/scripts](#frontendscripts)
  - [frontend/src](#frontendsrc)
  - [frontend/tests](#frontendtests)
  - [frontend/vite.config.ts](#frontendviteconfigts)
  - [README.md](#readmemd)
  - [SECURITY.md](#securitymd)
- [Histórico de arquivos que evoluem](#hist%C3%B3rico-de-arquivos-que-evoluem)
  - [Mapa de reuso da base atual](#mapa-de-reuso-da-base-atual)
<!-- navigation:index:end -->

Data: 09/09/2026. Caminhos relativos a D:\Projetos\blog. A árvore usa a arquitetura real modules/{domain,application,adapters}, infrastructure, http e composição manual. Pastas P1/P2 só surgem ao executar suas capacidades; não criar esqueletos vazios. Frontend/content/deploy aparecem apenas para dependências de integração do release.

Legenda: [EXISTENTE], [CRIAR - PARA PUBLICAR], [ALTERAR - PARA PUBLICAR], [CRIAR - APÓS PUBLICAÇÃO], [EVOLUÇÃO FUTURA]. Arquivo movido é evolução/reuso, não outra implementação. A primeira marca indica a primeira ação; o histórico detalha todas as seguintes.

<!-- navigation:anchor:start -->
<a id="nav-section-001"></a>
<!-- navigation:anchor:end -->

## Árvore de destino incremental

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

```text
blog/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml [CRIAR - APÓS PUBLICAÇÃO]
│   │   └── content.yml [CRIAR - APÓS PUBLICAÇÃO]
│   ├── pull_request_template.md [CRIAR - APÓS PUBLICAÇÃO]
│   └── workflows/
│       ├── backend-ci.yml [CRIAR - PARA PUBLICAR]
│       └── deploy.yml [CRIAR - PARA PUBLICAR]
├── .gitignore [ALTERAR - PARA PUBLICAR]
├── backend/
│   ├── .dockerignore [EXISTENTE]
│   ├── .env.dev [EXISTENTE]
│   ├── .env.example [CRIAR - PARA PUBLICAR]
│   ├── .gitignore [EXISTENTE]
│   ├── .node-version [CRIAR - PARA PUBLICAR]
│   ├── compose.test.yaml [CRIAR - PARA PUBLICAR]
│   ├── docker-compose-develop.yml [ALTERAR - PARA PUBLICAR]
│   ├── Dockerfile [CRIAR - PARA PUBLICAR]
│   ├── Dockerfile.develop [ALTERAR - PARA PUBLICAR]
│   ├── eslint.config.mjs [CRIAR - PARA PUBLICAR]
│   ├── migrations/
│   │   ├── 001-editorial.ts [CRIAR - PARA PUBLICAR]
│   │   ├── 002-editorial-paths.ts [CRIAR - PARA PUBLICAR]
│   │   ├── 003-identity.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 004-security-controls.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 005-likes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 006-comments.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 007-views.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 008-account-lifecycle.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 009-local-credentials.ts [EVOLUÇÃO FUTURA]
│   │   ├── 010-learning-threads.ts [EVOLUÇÃO FUTURA]
│   │   ├── 011-search.ts [EVOLUÇÃO FUTURA]
│   │   ├── 012-editorial-releases.ts [EVOLUÇÃO FUTURA]
│   │   ├── 013-private-exports.ts [EVOLUÇÃO FUTURA]
│   │   ├── 014-measured-optimizations.ts [EVOLUÇÃO FUTURA]
│   │   └── runner.ts [CRIAR - PARA PUBLICAR]
│   ├── openapi.yaml [CRIAR - PARA PUBLICAR]
│   ├── package-lock.json [ALTERAR - PARA PUBLICAR]
│   ├── package.json [ALTERAR - PARA PUBLICAR]
│   ├── scripts/
│   │   ├── backup.mjs [CRIAR - PARA PUBLICAR]
│   │   ├── cleanup.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── community-smoke.mjs [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── load-test.mjs [EVOLUÇÃO FUTURA]
│   │   ├── migrate.ts [CRIAR - PARA PUBLICAR]
│   │   ├── process-exports.ts [EVOLUÇÃO FUTURA]
│   │   ├── reconcile-stats.ts [EVOLUÇÃO FUTURA]
│   │   ├── release-smoke.mjs [CRIAR - PARA PUBLICAR]
│   │   ├── restore.mjs [CRIAR - PARA PUBLICAR]
│   │   ├── send-email-outbox.ts [EVOLUÇÃO FUTURA]
│   │   ├── smoke-image.mjs [CRIAR - PARA PUBLICAR]
│   │   └── test.mjs [CRIAR - PARA PUBLICAR]
│   ├── seeds/
│   │   └── local.ts [CRIAR - PARA PUBLICAR]
│   ├── src/
│   │   ├── composition.ts [CRIAR - PARA PUBLICAR]
│   │   ├── config/
│   │   │   └── env.ts [ALTERAR - PARA PUBLICAR]
│   │   ├── http/
│   │   │   ├── app.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── cors.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── csrf.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── error-handler.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── error-status.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── health.routes.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── public-cache.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── rate-limit.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── request-context.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── request-log.ts [CRIAR - PARA PUBLICAR]
│   │   │   └── session.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── infrastructures/
│   │   │   ├── database.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── logger.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── logging/
│   │   │   │   ├── formatter.ts [ALTERAR - PARA PUBLICAR]
│   │   │   │   ├── logger.context.ts [ALTERAR - PARA PUBLICAR]
│   │   │   │   ├── logger.interface.ts [ALTERAR - PARA PUBLICAR]
│   │   │   │   ├── redact-sensitive.ts [EXISTENTE]
│   │   │   │   └── request-context.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── metrics.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── process-handlers.ts [ALTERAR - PARA PUBLICAR]
│   │   │   ├── public-cache-store.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── rate-limiter.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   └── tracing.ts [EVOLUÇÃO FUTURA]
│   │   ├── infrastructures/
│   │   │   └── persistence/
│   │   │       └── ORM/
│   │   │           ├── decorators/
│   │   │           │   └── dbColumn.ts [EXISTENTE]
│   │   │           ├── helpers/
│   │   │           │   └── sequelizeWhereBuilder.helper.ts [EXISTENTE]
│   │   │           └── types/
│   │   │               └── baseModel.type.ts [EXISTENTE]
│   │   ├── main.ts [ALTERAR - PARA PUBLICAR]
│   │   ├── modules/
│   │   │   ├── community/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── comments.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── likes.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── moderation.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── stats.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   └── views.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── markdown/
│   │   │   │   │   │   └── comment-markdown.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   └── postgres/
│   │   │   │   │       ├── comment-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── like-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── report-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── stats-reader.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       └── view-recorder.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   ├── application/
│   │   │   │   │   ├── comments.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── get-my-likes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── get-stats.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── moderation.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── ports/
│   │   │   │   │   │   ├── comment-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── like-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── report-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── stats-reader.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   └── view-recorder.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── record-view.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   └── set-like.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   └── domain/
│   │   │   │       ├── comment.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │       └── view-policy.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── identity/
│   │   │   │   ├── adapters/
│   │   │   │   │   ├── cli/
│   │   │   │   │   │   ├── account-operations.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   └── manage-user.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── crypto/
│   │   │   │   │   │   └── password-hasher.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │   ├── email/
│   │   │   │   │   │   └── email-sender.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │   ├── github/
│   │   │   │   │   │   └── oauth-provider.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── http/
│   │   │   │   │   │   ├── account.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── auth.routes.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   └── local-auth.routes.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │   ├── postgres/
│   │   │   │   │   │   ├── account-lifecycle-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── identity-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   ├── local-credential-store.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │   │   ├── oauth-transaction-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   │   └── session-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   └── storage/
│   │   │   │   │       └── private-export-store.ts [EVOLUÇÃO FUTURA]
│   │   │   │   ├── application/
│   │   │   │   │   ├── delete-account.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── export-account.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── get-me.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── github-login.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── identity.dto.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── local-auth.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │   ├── logout.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   ├── manage-user.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │   └── ports/
│   │   │   │   │       ├── account-lifecycle-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── email-sender.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │       ├── identity-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── oauth-identity-provider.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── oauth-transaction-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   │       ├── password-hasher.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │       ├── private-export-store.ts [EVOLUÇÃO FUTURA]
│   │   │   │   │       └── session-store.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │   └── domain/
│   │   │   │       ├── authorization.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │       ├── session-policy.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   │       └── user.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   └── publishing/
│   │   │       ├── adapters/
│   │   │       │   ├── cli/
│   │   │       │   │   ├── content-parser.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── content.schemas.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── export-snapshot.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── import-content.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   └── validate-content.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── git/
│   │   │       │   │   └── editorial-proposal-store.ts [EVOLUÇÃO FUTURA]
│   │   │       │   ├── http/
│   │   │       │   │   ├── article.schemas.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── articles.routes.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── editorial.routes.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   ├── progress.routes.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   └── taxonomy.routes.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── postgres/
│   │   │       │   │   ├── article-reader.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── models.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── progress-store.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   └── publication-store.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   └── storage/
│   │   │       │       └── editorial-asset-store.ts [EVOLUÇÃO FUTURA]
│   │   │       ├── application/
│   │   │       │   ├── activate-release.ts [EVOLUÇÃO FUTURA]
│   │   │       │   ├── archive-article.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── content.dto.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── export-snapshot.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── get-article.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── get-series.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── import-content.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── list-articles.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── list-series.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── list-tags.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── ports/
│   │   │       │   │   ├── article-reader.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   │   ├── editorial-asset-store.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   ├── editorial-proposal-store.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   ├── progress-store.ts [EVOLUÇÃO FUTURA]
│   │   │       │   │   └── publication-store.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── propose-content.ts [EVOLUÇÃO FUTURA]
│   │   │       │   ├── publish-translation.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── publishing.errors.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   ├── reading-progress.ts [EVOLUÇÃO FUTURA]
│   │   │       │   ├── unpublish-translation.ts [CRIAR - PARA PUBLICAR]
│   │   │       │   └── validate-content.ts [CRIAR - PARA PUBLICAR]
│   │   │       └── domain/
│   │   │           ├── article.ts [CRIAR - PARA PUBLICAR]
│   │   │           ├── publication-policy.ts [CRIAR - PARA PUBLICAR]
│   │   │           ├── reading-time.ts [CRIAR - PARA PUBLICAR]
│   │   │           └── series.ts [CRIAR - PARA PUBLICAR]
│   │   ├── shared/
│   │   │   ├── constants/
│   │   │   │   ├── logger.constants.ts [EXISTENTE]
│   │   │   │   └── messages/
│   │   │   │       ├── common.messages.ts [EXISTENTE]
│   │   │   │       └── infrastructure.messages.ts [EXISTENTE]
│   │   │   ├── errors/
│   │   │   │   ├── application.error.ts [ALTERAR - PARA PUBLICAR]
│   │   │   │   └── infrastructure.error.ts [EXISTENTE]
│   │   │   └── types/
│   │   │       └── persistence.type.ts [EXISTENTE]
│   │   └── workers/
│   │       └── blog-worker.ts [EVOLUÇÃO FUTURA]
│   ├── tests/
│   │   ├── api/
│   │   │   ├── e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e09-public-api.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e21-local-auth.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e22-learning-threads.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e23-localized-search.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e25-private-exports.test.ts [EVOLUÇÃO FUTURA]
│   │   │   └── e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA]
│   │   ├── integration/
│   │   │   ├── e01-tooling.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e03-migrations.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e04-publishing-domain.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e05-editorial-schema.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e06-content-validation.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e07-editorial-import.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e08-public-queries.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e09-public-api.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e10-publication-snapshot.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e11-containers.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e12-release-operations.test.ts [CRIAR - PARA PUBLICAR]
│   │   │   ├── e13-identity-storage.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │   │   ├── e21-local-auth.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e22-learning-threads.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e23-localized-search.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA]
│   │   │   ├── e25-private-exports.test.ts [EVOLUÇÃO FUTURA]
│   │   │   └── e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA]
│   │   ├── support/
│   │   │   ├── app.ts [CRIAR - PARA PUBLICAR]
│   │   │   └── database.ts [CRIAR - PARA PUBLICAR]
│   │   └── unit/
│   │       ├── e01-tooling.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e03-migrations.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e04-publishing-domain.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e05-editorial-schema.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e06-content-validation.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e07-editorial-import.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e08-public-queries.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e09-public-api.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e10-publication-snapshot.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e11-containers.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e12-release-operations.test.ts [CRIAR - PARA PUBLICAR]
│   │       ├── e13-identity-storage.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO]
│   │       ├── e21-local-auth.test.ts [EVOLUÇÃO FUTURA]
│   │       ├── e22-learning-threads.test.ts [EVOLUÇÃO FUTURA]
│   │       ├── e23-localized-search.test.ts [EVOLUÇÃO FUTURA]
│   │       ├── e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA]
│   │       ├── e25-private-exports.test.ts [EVOLUÇÃO FUTURA]
│   │       └── e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA]
│   └── tsconfig.json [ALTERAR - PARA PUBLICAR]
├── CODE_OF_CONDUCT.md [CRIAR - APÓS PUBLICAÇÃO]
├── compose.yaml [CRIAR - PARA PUBLICAR]
├── content/
│   ├── articles/
│   │   └── <articleId>/
│   │       └── <locale>.md [ALTERAR - PARA PUBLICAR]
│   ├── catalog.yaml [CRIAR - PARA PUBLICAR]
│   └── legacy-map.json [CRIAR - PARA PUBLICAR]
├── CONTRIBUTING.md [CRIAR - PARA PUBLICAR]
├── deploy/
│   └── nginx.conf [CRIAR - PARA PUBLICAR]
├── docs/
│   ├── adr/
│   │   ├── 001-modular-monolith.md [CRIAR - PARA PUBLICAR]
│   │   ├── 002-editorial-source.md [CRIAR - PARA PUBLICAR]
│   │   ├── 003-publication-snapshot.md [CRIAR - PARA PUBLICAR]
│   │   ├── 004-sessions.md [CRIAR - APÓS PUBLICAÇÃO]
│   │   ├── 005-metrics-privacy.md [CRIAR - APÓS PUBLICAÇÃO]
│   │   └── 006-editorial-evolution.md [EVOLUÇÃO FUTURA]
│   ├── BACKEND_ARCHITECTURE.md [EXISTENTE]
│   ├── BACKEND_OPERATIONS.md [CRIAR - PARA PUBLICAR]
│   ├── COMMUNITY_OPERATIONS.md [CRIAR - APÓS PUBLICAÇÃO]
│   ├── CONTENT_LICENSE_POLICY.md [CRIAR - PARA PUBLICAR]
│   ├── PERFORMANCE_DECISIONS.md [EVOLUÇÃO FUTURA]
│   ├── PRIVACY_OPERATIONS.md [CRIAR - PARA PUBLICAR]
│   └── RELEASE_EVIDENCE.md [CRIAR - PARA PUBLICAR]
├── frontend/
│   ├── .gitignore [ALTERAR - PARA PUBLICAR]
│   ├── generated/
│   │   └── published-content.json [CRIAR - PARA PUBLICAR]
│   ├── LICENSE [EXISTENTE]
│   ├── package.json [ALTERAR - PARA PUBLICAR]
│   ├── README.md [EXISTENTE]
│   ├── scripts/
│   │   └── prerender.tsx [CRIAR - PARA PUBLICAR]
│   ├── src/
│   │   ├── App.tsx [ALTERAR - PARA PUBLICAR]
│   │   ├── content/
│   │   │   ├── articles.ts [EXISTENTE]
│   │   │   └── snapshot.ts [CRIAR - PARA PUBLICAR]
│   │   └── features/
│   │       └── articles/
│   │           ├── community.tsx [CRIAR - APÓS PUBLICAÇÃO]
│   │           ├── components/
│   │           │   └── article-detail/
│   │           │       └── MarkdownArticle.tsx [ALTERAR - PARA PUBLICAR]
│   │           └── useQualifiedView.ts [CRIAR - APÓS PUBLICAÇÃO]
│   ├── tests/
│   │   └── publication.test.ts [CRIAR - PARA PUBLICAR]
│   └── vite.config.ts [EXISTENTE]
├── README.md [CRIAR - PARA PUBLICAR]
└── SECURITY.md [CRIAR - PARA PUBLICAR]
```

Os caminhos <articleId>/<locale> representam os oito arquivos identificados uma única vez em content/catalog.yaml/legacy-map.json; não são oito identidades geradas a cada execução. IDs concretos serão persistidos na normalização [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), pois o acervo atual ainda não os fornece. test/ atual está vazio; testes novos ficam em tests/. dist/node_modules/LOGS/.idea são artefatos locais, não componentes a implementar.

<!-- navigation:anchor:start -->
<a id="nav-section-002"></a>
<!-- navigation:anchor:end -->

## Responsabilidade, camada e dependências por arquivo

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->


<!-- navigation:anchor:start -->
<a id="nav-section-003"></a>
<!-- navigation:anchor:end -->

### .github/ISSUE_TEMPLATE

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| .github/ISSUE_TEMPLATE/bug.yml [CRIAR - APÓS PUBLICAÇÃO] | Reprodução de bug sem solicitar secrets. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| .github/ISSUE_TEMPLATE/content.yml [CRIAR - APÓS PUBLICAÇÃO] | Correção/tradução referenciando artigo e locale. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-004"></a>
<!-- navigation:anchor:end -->

### .github/pull_request_template.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| .github/pull_request_template.md [CRIAR - APÓS PUBLICAÇÃO] | Problema, verificação e revisão editorial. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-005"></a>
<!-- navigation:anchor:end -->

### .github/workflows

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| .github/workflows/backend-ci.yml [CRIAR - PARA PUBLICAR] | Validação sem secrets, banco efêmero e gates por implementação. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| .github/workflows/deploy.yml [CRIAR - PARA PUBLICAR] | Release confiável serializado com revisão e rollback operacional. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-006"></a>
<!-- navigation:anchor:end -->

### .gitignore

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| .gitignore [ALTERAR - PARA PUBLICAR] | Manter proteção existente e permitir docs/. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-007"></a>
<!-- navigation:anchor:end -->

### backend/.dockerignore

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/.dockerignore [EXISTENTE] | Excluir secrets e artefatos do contexto. Proteção de contexto já existente, validar alvos multistage. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): reutilizar; P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): reutilizar |

<!-- navigation:anchor:start -->
<a id="nav-section-008"></a>
<!-- navigation:anchor:end -->

### backend/.env.dev

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/.env.dev [EXISTENTE] | Configuração local existente e ignorada; não versionar/imprimir credenciais. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | Existente; sem implementação nova prevista. |

<!-- navigation:anchor:start -->
<a id="nav-section-009"></a>
<!-- navigation:anchor:end -->

### backend/.env.example

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/.env.example [CRIAR - PARA PUBLICAR] | Contrato de configuração local sem credenciais externas. Pool/timeouts e instruções para credenciais distintas, sem segredo de produção. Documentar variáveis e flags da [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) com valores locais seguros e sem secrets reais. Documentar variáveis e flags da [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) com valores locais seguros e sem secrets reais. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar; P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-010"></a>
<!-- navigation:anchor:end -->

### backend/.gitignore

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/.gitignore [EXISTENTE] | Ignorar ambientes, dependências e artefatos locais. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): reutilizar |

<!-- navigation:anchor:start -->
<a id="nav-section-011"></a>
<!-- navigation:anchor:end -->

### backend/.node-version

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/.node-version [CRIAR - PARA PUBLICAR] | Versão Node compartilhada com imagem/CI. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-012"></a>
<!-- navigation:anchor:end -->

### backend/compose.test.yaml

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/compose.test.yaml [CRIAR - PARA PUBLICAR] | PostgreSQL 16 isolado para testes. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-013"></a>
<!-- navigation:anchor:end -->

### backend/docker-compose-develop.yml

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/docker-compose-develop.yml [ALTERAR - PARA PUBLICAR] | Corrigir comando/portas e apontar setup canônico sem perder volume. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-014"></a>
<!-- navigation:anchor:end -->

### backend/Dockerfile

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/Dockerfile [CRIAR - PARA PUBLICAR] | Build, migrator e runtime não root com JS compilado. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-015"></a>
<!-- navigation:anchor:end -->

### backend/Dockerfile.develop

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/Dockerfile.develop [ALTERAR - PARA PUBLICAR] | Hot reload interno dev:api, sem tentativa de executar Docker. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-016"></a>
<!-- navigation:anchor:end -->

### backend/eslint.config.mjs

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/eslint.config.mjs [CRIAR - PARA PUBLICAR] | Lint e restrições de dependência por camada. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-017"></a>
<!-- navigation:anchor:end -->

### backend/migrations

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/migrations/001-editorial.ts [CRIAR - PARA PUBLICAR] | DDL editorial, integridade, índices e controle de revisão. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): criar |
| backend/migrations/002-editorial-paths.ts [CRIAR - PARA PUBLICAR] | Namespace único de slugs/redirects e consistência diferida. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): criar |
| backend/migrations/003-identity.ts [CRIAR - APÓS PUBLICAÇÃO] | Tabelas de identidade/sessão/OAuth e constraints de unicidade. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/migrations/004-security-controls.ts [CRIAR - APÓS PUBLICAÇÃO] | Rate limit temporário e auditoria administrativa restrita. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/migrations/005-likes.ts [CRIAR - APÓS PUBLICAÇÃO] | Unicidade conta/artigo, FKs e índice reverso. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/migrations/006-comments.ts [CRIAR - APÓS PUBLICAÇÃO] | Comments/reports/audit, índices, estados e concorrência por versão. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/migrations/007-views.ts [CRIAR - APÓS PUBLICAÇÃO] | Dedupe temporário e agregados diários versionados. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/migrations/008-account-lifecycle.ts [CRIAR - APÓS PUBLICAÇÃO] | Solicitações de exclusão/exportação, ledger/retenção e agregado mensal versionado. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/migrations/009-local-credentials.ts [EVOLUÇÃO FUTURA] | Credenciais locais, tokens por finalidade e outbox cifrada. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/migrations/010-learning-threads.ts [EVOLUÇÃO FUTURA] | parentId e progresso; incluir prerequisitos/bookmarks só ao ativar respectivas subcapacidades. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/migrations/011-search.ts [EVOLUÇÃO FUTURA] | Índice textual localizado e backfill/rebuild compatível. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): criar |
| backend/migrations/012-editorial-releases.ts [EVOLUÇÃO FUTURA] | Snapshots/ponteiro ativo somente se ativação for necessária. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/migrations/013-private-exports.ts [EVOLUÇÃO FUTURA] | Metadados/tokens/jobs de export automático, sem body de dados no job. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/migrations/014-measured-optimizations.ts [EVOLUÇÃO FUTURA] | Apenas alterações efetivamente escolhidas: outbox/counters/partições; dividir em novas versões se entregas distintas. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/migrations/runner.ts [CRIAR - PARA PUBLICAR] | Contrato Migration up(sequelize,transaction), controle e atomicidade sem aparecer no domínio. | Infraestrutura de schema | Sequelize/DDL, runner e transaction explícita; não importar HTTP ou casos de uso. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-018"></a>
<!-- navigation:anchor:end -->

### backend/openapi.yaml

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/openapi.yaml [CRIAR - PARA PUBLICAR] | Contrato v1, health, erros e exemplos. Contratos auth/me/cookie/CSRF e falhas sem exposição. Documentar 403/429/503 e necessidade de reautenticação. Semântica idempotente, estado privado e 204/404. Comentários localizados, filas, versões, reports e exemplos de estados. Views/consent/stats, números e início da medição. Fluxos 202, reautenticação e solicitação de direitos. Contratos locais e erros genéricos. Respostas, progresso e contratos condicionais efetivamente entregues. Busca/relacionados e fallback de idioma explícitos. Apenas contratos editoriais/release realmente ativados. Status/download privado sem exposição de links em caches. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-019"></a>
<!-- navigation:anchor:end -->

### backend/package-lock.json

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/package-lock.json [ALTERAR - PARA PUBLICAR] | Lockfile coerente com a instalação reproduzível. Fixar dependências adicionadas para [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), sem atualização de pacotes não relacionados. Fixar dependências adicionadas para [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados. Fixar dependências adicionadas para [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados. Fixar dependências adicionadas para [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda), sem atualização de pacotes não relacionados. Fixar dependências adicionadas para [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido), sem atualização de pacotes não relacionados. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-020"></a>
<!-- navigation:anchor:end -->

### backend/package.json

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/package.json [ALTERAR - PARA PUBLICAR] | Scripts executáveis, engines, runner e dependências diretamente usadas. start passa a node dist/src/main.js; dev:api executa tsx watch src/main.ts. Scripts migrate, migrate:status, test:integration/test:api e dependências ORM usadas. content:validate e parsers/Zod nas categorias corretas; seed:local entra em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente). content:import e content:publish/unpublish/archive/restore documentados. Acrescentar seed:local protegido agora que ImportContent existe. content:export e validação de snapshot. Separar dev do host, dev:api de container e comandos de runtime. Registrar comandos operacionais da [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e somente dependências realmente usadas, mantendo lockfile coerente. Registrar comandos operacionais da [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente. Registrar comandos operacionais da [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente. Registrar comandos operacionais da [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e somente dependências realmente usadas, mantendo lockfile coerente. Registrar comandos operacionais da [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) e somente dependências realmente usadas, mantendo lockfile coerente. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar; P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): alterar; P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): alterar; P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): alterar; P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): alterar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-021"></a>
<!-- navigation:anchor:end -->

### backend/scripts

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/scripts/backup.mjs [CRIAR - PARA PUBLICAR] | Disparar backup com credencial operacional e verificar upload/checksum, sem imprimir senha. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| backend/scripts/cleanup.ts [CRIAR - APÓS PUBLICAÇÃO] | Retenção em lotes e agregação mensal com checkpoints. Expirar account tokens/outbox sem reter conteúdo pessoal. Expirar artefatos/leases/tokens e reconciliar órfãos. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |
| backend/scripts/community-smoke.mjs [CRIAR - APÓS PUBLICAÇÃO] | Fluxo integrado staging com usuários de teste e cleanup. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| backend/scripts/load-test.mjs [EVOLUÇÃO FUTURA] | Carga reproduzível com dados sintéticos e relatório sem PII. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/scripts/migrate.ts [CRIAR - PARA PUBLICAR] | Executar/consultar migrations versionadas com lock/checksum e credencial operacional. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |
| backend/scripts/process-exports.ts [EVOLUÇÃO FUTURA] | Processar fila PostgreSQL pequena com lease/retry idempotente. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/scripts/reconcile-stats.ts [EVOLUÇÃO FUTURA] | Reconciliar counters quando materialização existir. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/scripts/release-smoke.mjs [CRIAR - PARA PUBLICAR] | Comparar revisões/API/site/catálogo e falhar com diagnóstico seguro. Verificar artefato candidato antes da ativação e releaseId cliente/API. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar |
| backend/scripts/restore.mjs [CRIAR - PARA PUBLICAR] | Restaurar destino isolado explicitamente e gerar evidência de recuperação. Reaplicar ledger antes de liberar sistema restaurado. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar |
| backend/scripts/send-email-outbox.ts [EVOLUÇÃO FUTURA] | Envio confiável idempotente e observável. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/scripts/smoke-image.mjs [CRIAR - PARA PUBLICAR] | Verificar processo/health/API/usuário/artefato com dados de teste. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar |
| backend/scripts/test.mjs [CRIAR - PARA PUBLICAR] | Descobrir e executar suites Node com propagação do exit code. | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-022"></a>
<!-- navigation:anchor:end -->

### backend/seeds

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/seeds/local.ts [CRIAR - PARA PUBLICAR] | Fixture idempotente segura por meio de ImportContent de [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente). | Adapter operacional | Config/composição e capacidades específicas, processos CLI; destinos de teste/produção explicitamente separados. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-023"></a>
<!-- navigation:anchor:end -->

### backend/src

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/src/composition.ts [CRIAR - PARA PUBLICAR] | Composição manual única de adapters e casos de uso. Registrar models e criar adapters com a instância única. Injetar store/reader/clock nos comandos. Injetar casos de uso nas rotas. Conectar provider/stores/auth/clock; fake só composition de teste. Injetar política/capacidade de abuso nas mutações. Ligar likes a auth/limiter/persistência. Conectar ports/adapters/casos de uso de [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) e injetar controles existentes sem duplicá-los. Conectar ports/adapters/casos de uso de [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e injetar controles existentes sem duplicá-los. Selecionar adapters por config validada, sem opções mortas. | Bootstrap/composição | Todas dependências concretas para conectar e iniciar/encerrar; não concentrar regras de negócio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar; P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): alterar; P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): alterar; P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): alterar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/config/env.ts [ALTERAR - PARA PUBLICAR] | Validação tipada do ambiente e carga local controlada. Feature flag e secrets OAuth obrigatórios somente quando comunidade habilitada. Validar configurações/secrets/prazos da capacidade [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) somente quando habilitada; não permitir defaults inseguros em produção. Validar configurações/secrets/prazos da capacidade [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) somente quando habilitada; não permitir defaults inseguros em produção. | Configuração | Env/validador e tipos imutáveis; domínio não importa este arquivo. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/bootstrap/env.ts; P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/http/app.ts [ALTERAR - PARA PUBLICAR] | Express sem listen e ordem de middlewares. Montar rotas públicas antes de 404. Montar auth sob flag e middlewares privados por rota. Montar rotas de [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) sob flags e proteções corretas, antes do 404. Montar rotas de [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) sob flags e proteções corretas, antes do 404. Montar rotas de [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) sob flags e proteções corretas, antes do 404. Montar rotas de [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) sob flags e proteções corretas, antes do 404. Métricas internas protegidas e gate comunitário. Montar rotas de [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) sob flags e proteções corretas, antes do 404. Montar rotas de [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) sob flags e proteções corretas, antes do 404. Montar rotas de [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) sob flags e proteções corretas, antes do 404. Montar rotas de [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) sob flags e proteções corretas, antes do 404. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/server.ts; P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): alterar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |
| backend/src/http/cors.ts [ALTERAR - PARA PUBLICAR] | Allowlist existente parametrizada por Config. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/cors.config.ts |
| backend/src/http/csrf.ts [CRIAR - APÓS PUBLICAÇÃO] | Origin e token sincronizado para mutações. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/http/error-handler.ts [ALTERAR - PARA PUBLICAR] | Envelope público, mapeamento de parser e proteção de headersSent. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/shared/middlewares/errorHandler.middleware.ts |
| backend/src/http/error-status.ts [ALTERAR - PARA PUBLICAR] | Mapear kinds semânticos para status. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/application-error-status.mapper.ts |
| backend/src/http/health.routes.ts [ALTERAR - PARA PUBLICAR] | Liveness/readiness de custo limitado. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/healthCheck.route.ts |
| backend/src/http/public-cache.ts [CRIAR - PARA PUBLICAR] | ETag/Last-Modified e conditional GET sem dados privados. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/src/http/rate-limit.ts [CRIAR - APÓS PUBLICAÇÃO] | Traduz limites de ação e Retry-After para HTTP. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/src/http/request-context.ts [ALTERAR - PARA PUBLICAR] | IDs seguros e contexto sem query. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/request-context.middleware.ts |
| backend/src/http/request-log.ts [CRIAR - PARA PUBLICAR] | Log final de cada request com duração e rota normalizada. Acrescentar observação de histogramas mantendo logs e redação. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar |
| backend/src/http/session.ts [CRIAR - APÓS PUBLICAÇÃO] | Resolver sessão e anexar Actor tipado, sem confiar no body. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/infrastructures/database.ts [ALTERAR - PARA PUBLICAR] | Conexão única, pool/timeouts e nenhuma criação automática de schema. Conexão e transações já preparadas em [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations). Pools/topologia de réplicas/PgBouncer mediante teste. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): mover de backend/src/infrastructures/persistence/ORM/index.sequelize.ts; P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): reutilizar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/infrastructures/logger.ts [ALTERAR - PARA PUBLICAR] | Reutilizar escrita JSON/stdout e injetar service. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/logger.ts |
| backend/src/infrastructures/logging/formatter.ts [ALTERAR - PARA PUBLICAR] | Formato existente com campos permitidos. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/formatter/logger.formater.ts |
| backend/src/infrastructures/logging/logger.context.ts [ALTERAR - PARA PUBLICAR] | Contexto de origem do evento de log. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/context/logger.context.ts |
| backend/src/infrastructures/logging/logger.interface.ts [ALTERAR - PARA PUBLICAR] | Contrato existente de logger; unknown em vez de any. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/logger.interface.ts |
| backend/src/infrastructures/logging/redact-sensitive.ts [EXISTENTE] | Redação recursiva existente, preservada ao ajustar imports dos consumidores. Preservar algoritmo testado; retirar promessa de log irrestrito. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): reutilizar (backend/src/infrastructures/logger/redact-sensitive.ts); P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/redact-sensitive.ts |
| backend/src/infrastructures/logging/request-context.ts [ALTERAR - PARA PUBLICAR] | ALS exclusivo de observabilidade. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/context/request.context.ts |
| backend/src/infrastructures/metrics.ts [CRIAR - APÓS PUBLICAÇÃO] | Métricas limitadas de HTTP/pool/ações, sem PII em labels. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| backend/src/infrastructures/process-handlers.ts [ALTERAR - PARA PUBLICAR] | Reutilizar fatal shutdown, registrar também sinais e permitir cleanup dos handlers em teste. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/process-error-handlers.ts |
| backend/src/infrastructures/public-cache-store.ts [EVOLUÇÃO FUTURA] | Cache externo opcional de representações públicas com invalidação. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/src/infrastructures/rate-limiter.ts [CRIAR - APÓS PUBLICAÇÃO] | Counters temporários PostgreSQL atômicos e chaves de origem pseudonimizadas. Adapter Redis opcional só se PG for gargalo, preservando contrato. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/infrastructures/tracing.ts [EVOLUÇÃO FUTURA] | Tracing opcional sem dados privados quando houver múltiplos processos. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/src/infrastructures/persistence/ORM/decorators/dbColumn.ts [EXISTENTE] | Decorator existente sem uso editorial; não criar models novos com dependência dele. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | Existente; sem implementação nova prevista. |
| backend/src/infrastructures/persistence/ORM/helpers/sequelizeWhereBuilder.helper.ts [EXISTENTE] | Helper genérico existente fora do fluxo editorial; sem expansão, remoção apenas com zero consumidores. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | Existente; sem implementação nova prevista. |
| backend/src/infrastructures/persistence/ORM/types/baseModel.type.ts [EXISTENTE] | Base id:number legada, incompatível com UUID editorial; não reutilizar para Article. | Infraestrutura | Node/driver/logger/config e contratos necessários; nunca tornar esses módulos dependências do domínio. | Existente; sem implementação nova prevista. |
| backend/src/main.ts [ALTERAR - PARA PUBLICAR] | Trocar imports com aliases até migração em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). Dono do processo e do listener; startup, sinais e encerramento. | Bootstrap/composição | Todas dependências concretas para conectar e iniciar/encerrar; não concentrar regras de negócio. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar (backend/src/index.ts); P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/index.ts |
| backend/src/shared/constants/logger.constants.ts [EXISTENTE] | Níveis de log existentes reaproveitados pelo formatter. | Base existente | Somente consumidores atuais apropriados; tipos ORM legados não atravessam novas ports. | Existente; sem implementação nova prevista. |
| backend/src/shared/constants/messages/common.messages.ts [EXISTENTE] | Mensagens comuns existentes; não representam capacidades de negócio novas. | Base existente | Somente consumidores atuais apropriados; tipos ORM legados não atravessam novas ports. | Existente; sem implementação nova prevista. |
| backend/src/shared/constants/messages/infrastructure.messages.ts [EXISTENTE] | Mensagens legadas; reusar CORS necessário e não implementar encryption/log filesystem por nomes de constantes. | Base existente | Somente consumidores atuais apropriados; tipos ORM legados não atravessam novas ports. | Existente; sem implementação nova prevista. |
| backend/src/shared/errors/application.error.ts [ALTERAR - PARA PUBLICAR] | Acrescentar kinds/fields sem importar HTTP. Base semântica ampliada em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). | Erro semântico compartilhado | Error/tipos puros; base ApplicationError nunca importa status HTTP. InfrastructureError fica restrito à infraestrutura. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): alterar; P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): reutilizar |
| backend/src/shared/errors/infrastructure.error.ts [EXISTENTE] | InfrastructureError/RepositoryError existentes; reuso em adapter, sem cause no DTO. | Erro semântico compartilhado | Error/tipos puros; base ApplicationError nunca importa status HTTP. InfrastructureError fica restrito à infraestrutura. | Existente; sem implementação nova prevista. |
| backend/src/shared/types/persistence.type.ts [EXISTENTE] | Tipos genéricos ORM legados; não importar em domínio/application novos. | Base existente | Somente consumidores atuais apropriados; tipos ORM legados não atravessam novas ports. | Existente; sem implementação nova prevista. |
| backend/src/workers/blog-worker.ts [EVOLUÇÃO FUTURA] | Consumir outbox idempotente apenas sob backlog comprovado. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-024"></a>
<!-- navigation:anchor:end -->

### backend/src/modules/community

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/src/modules/community/adapters/http/comments.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | Rotas públicas/privadas e schema strict de body/cursor. parentId opcional e rota paginada de replies. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar |
| backend/src/modules/community/adapters/http/likes.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | PUT/DELETE + sessão/CSRF/limite e GET privado. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/src/modules/community/adapters/http/moderation.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | Fila/decisão/denúncias com RBAC e no-store. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/adapters/http/stats.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | Stats públicos cacheáveis, sem personalização. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/adapters/http/views.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | Observação, consentimento técnico/cookie opcional e 204. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/adapters/markdown/comment-markdown.ts [CRIAR - APÓS PUBLICAÇÃO] | AST restrito, limite de links e sanitização segura de saída. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/adapters/postgres/comment-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Predicado público, cursor, CAS version e auditoria transacional. Validar parent atomicamente e paginar raízes/respostas. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar |
| backend/src/modules/community/adapters/postgres/like-store.ts [CRIAR - APÓS PUBLICAÇÃO] | INSERT/DELETE atômicos e consultas indexadas. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/src/modules/community/adapters/postgres/report-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Deduplicação/resolução e consulta restrita. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/adapters/postgres/stats-reader.ts [CRIAR - APÓS PUBLICAÇÃO] | Agregação de likes/comments/views sem N+1. Somar agregados mensais+diários sem duplicação. Counters materializados/replicas apenas após medida e sem mudar escopo. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/modules/community/adapters/postgres/view-recorder.ts [CRIAR - APÓS PUBLICAÇÃO] | Dedupe e upsert em única transação. Manter v1 ou adaptar batching versionado somente sob ADR explícito. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |
| backend/src/modules/community/application/comments.ts [CRIAR - APÓS PUBLICAÇÃO] | Casos create/edit/delete/listMine/listPublic, entradas e permissões explícitas. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/application/get-my-likes.ts [CRIAR - APÓS PUBLICAÇÃO] | Consulta privada limitada de preferências. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/src/modules/community/application/get-stats.ts [CRIAR - APÓS PUBLICAÇÃO] | Stats com definições/escopos e limites numéricos. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/application/moderation.ts [CRIAR - APÓS PUBLICAÇÃO] | Fila, decisão de visibilidade, denúncia e resolução. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/application/ports/comment-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Criar/editar/moderar/remover e ler conjuntos visíveis/privados atomicamente. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/application/ports/like-store.ts [CRIAR - APÓS PUBLICAÇÃO] | ensurePresent/ensureAbsent/listMine sem operadores ORM. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/src/modules/community/application/ports/report-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Denúncia aberta única e resolução auditada. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/src/modules/community/application/ports/stats-reader.ts [CRIAR - APÓS PUBLICAÇÃO] | Contagens públicas por escopo e versão. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/application/ports/view-recorder.ts [CRIAR - APÓS PUBLICAÇÃO] | Registrar observação atomicamente sem expor aceitação ao cliente. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/application/record-view.ts [CRIAR - APÓS PUBLICAÇÃO] | Validar recurso, identidade permitida e chamar recorder. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/src/modules/community/application/set-like.ts [CRIAR - APÓS PUBLICAÇÃO] | Intenção idempotente, autorização e recurso público. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/src/modules/community/domain/comment.ts [CRIAR - APÓS PUBLICAÇÃO] | Estados, ownership, versionamento e transições. Profundidade/mesma tradução e tombstone de raiz. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar |
| backend/src/modules/community/domain/view-policy.ts [CRIAR - APÓS PUBLICAÇÃO] | Identidade/janela/versão e elegibilidade da métrica. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-025"></a>
<!-- navigation:anchor:end -->

### backend/src/modules/identity

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/src/modules/identity/adapters/cli/account-operations.ts [CRIAR - APÓS PUBLICAÇÃO] | Finalizar/extrair/atender pedidos por ID protegido. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/src/modules/identity/adapters/cli/manage-user.ts [CRIAR - APÓS PUBLICAÇÃO] | Admin operacional com ID e motivo; bootstrap explícito. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/src/modules/identity/adapters/crypto/password-hasher.ts [EVOLUÇÃO FUTURA] | Argon2id calibrado e upgrade de hash. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/adapters/email/email-sender.ts [EVOLUÇÃO FUTURA] | Fornecedor real/sandbox e timeouts/retries seguros. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/adapters/github/oauth-provider.ts [CRIAR - APÓS PUBLICAÇÃO] | HTTP oficial limitado/timeout, tokens descartados e mensagens seguras. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/adapters/http/account.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | DELETE me/POST export com CSRF/no-store. Status/download temporário com ownership e reautenticação. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |
| backend/src/modules/identity/adapters/http/auth.routes.ts [CRIAR - APÓS PUBLICAÇÃO] | Redirects, cookies, me/CSRF/logout e no-store. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/adapters/http/local-auth.routes.ts [EVOLUÇÃO FUTURA] | Schemas e endpoints locais sobre sessão existente. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Integração transacional com comunidade, purge e replay de exclusões. Excluir novos dados sensíveis e preservar allowlist do export. Excluir/exportar progresso e bookmarks. Estado de job/token consumível e cancelamento na exclusão. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |
| backend/src/modules/identity/adapters/postgres/identity-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Resolver identidade externa atomicamente e sem merge por email. Lock de usuário, atualização e revogação/auditoria atômicas. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar |
| backend/src/modules/identity/adapters/postgres/local-credential-store.ts [EVOLUÇÃO FUTURA] | Unicidade email e consumo atômico de token. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/adapters/postgres/oauth-transaction-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Binding/state e consumo único, dados temporários protegidos. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/adapters/postgres/session-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Hashes, expiry/touch/revoke e cleanup. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/adapters/storage/private-export-store.ts [EVOLUÇÃO FUTURA] | Storage privado com TTL e paths controlados. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/src/modules/identity/application/delete-account.ts [CRIAR - APÓS PUBLICAÇÃO] | Reautenticação, bloqueio imediato e resultado 202 idempotente operacional. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/src/modules/identity/application/export-account.ts [CRIAR - APÓS PUBLICAÇÃO] | Solicitação autenticada e projeção segura para atendimento. Automatizar pedido existente e estado de entrega sem mudar escopo de dados. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |
| backend/src/modules/identity/application/get-me.ts [CRIAR - APÓS PUBLICAÇÃO] | DTO privado mínimo de sessão ativa. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/application/github-login.ts [CRIAR - APÓS PUBLICAÇÃO] | Iniciar/consumir fluxo, resolver user e criar sessão nova. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/application/identity.dto.ts [CRIAR - APÓS PUBLICAÇÃO] | Actor, PublicUser e dados privados internos separados. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/application/local-auth.ts [EVOLUÇÃO FUTURA] | Register/login/verify/resend/forgot/reset e antienumeração. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/application/logout.ts [CRIAR - APÓS PUBLICAÇÃO] | Revogar sessão atual/todas com reautenticação para todas. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/application/manage-user.ts [CRIAR - APÓS PUBLICAÇÃO] | Block/unblock/role e revogação atômica por capacidade. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/src/modules/identity/application/ports/account-lifecycle-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Preparar/finalizar exclusão e solicitar/exportar dados atomicamente. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/src/modules/identity/application/ports/email-sender.ts [EVOLUÇÃO FUTURA] | Entrega transacional por propósito sem acoplamento a fornecedor. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/application/ports/identity-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Identidade externa e gestão de estado por capacidade. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/application/ports/oauth-identity-provider.ts [CRIAR - APÓS PUBLICAÇÃO] | Trocar code PKCE e devolver identidade verificada mínima. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/src/modules/identity/application/ports/oauth-transaction-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Transação temporária de início OAuth de uso único. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/application/ports/password-hasher.ts [EVOLUÇÃO FUTURA] | hash/verify/needsRehash sem dependência de algoritmo no domínio. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/src/modules/identity/application/ports/private-export-store.ts [EVOLUÇÃO FUTURA] | Gravar/ler/apagar artefato privado temporário. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/src/modules/identity/application/ports/session-store.ts [CRIAR - APÓS PUBLICAÇÃO] | Persistência/revogação/touch de sessão opaca. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/domain/authorization.ts [CRIAR - APÓS PUBLICAÇÃO] | Política pura por ação/role/ownership. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/src/modules/identity/domain/session-policy.ts [CRIAR - APÓS PUBLICAÇÃO] | Expiração absoluta/idle e reautenticação com clock. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/src/modules/identity/domain/user.ts [CRIAR - APÓS PUBLICAÇÃO] | Estados/roles e perfil público mínimo. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-026"></a>
<!-- navigation:anchor:end -->

### backend/src/modules/publishing

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/src/modules/publishing/adapters/cli/content-parser.ts [CRIAR - PARA PUBLICAR] | Filesystem seguro, YAML limitado, AST Markdown e extração textual. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |
| backend/src/modules/publishing/adapters/cli/content.schemas.ts [CRIAR - PARA PUBLICAR] | Schemas strict de manifesto/frontmatter e limites externos. Curadoria explícita por UUID e ordem. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar |
| backend/src/modules/publishing/adapters/cli/export-snapshot.ts [CRIAR - PARA PUBLICAR] | Exportar JSON atomicamente e relatório de revisão. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |
| backend/src/modules/publishing/adapters/cli/import-content.ts [CRIAR - PARA PUBLICAR] | Entradas import/dry-run/publicação operacional, autorização pelo ambiente e exit codes. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |
| backend/src/modules/publishing/adapters/cli/validate-content.ts [CRIAR - PARA PUBLICAR] | Comando offline sem DB ou credencial de produção. | Adapter CLI | Filesystem/parser seguro, config/composição e aplicação; sem endpoint administrativo público. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |
| backend/src/modules/publishing/adapters/git/editorial-proposal-store.ts [EVOLUÇÃO FUTURA] | Branch/PR em repositório permitido, token só backend. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/src/modules/publishing/adapters/http/article.schemas.ts [CRIAR - PARA PUBLICAR] | Validação strict de path/query e normalização de locale. Relevância somente com q e query limitada. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar |
| backend/src/modules/publishing/adapters/http/articles.routes.ts [CRIAR - PARA PUBLICAR] | Rotas de lista/detalhe e redirect HTTP de slug. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/src/modules/publishing/adapters/http/editorial.routes.ts [EVOLUÇÃO FUTURA] | Proposta/preview privado e aprovação protegida. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/src/modules/publishing/adapters/http/progress.routes.ts [EVOLUÇÃO FUTURA] | PUT/GET autenticados; bookmarks apenas se ativados. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/src/modules/publishing/adapters/http/taxonomy.routes.ts [CRIAR - PARA PUBLICAR] | Rotas de tags/lista/detalhe de séries. | Adapter HTTP | Express/schemas, casos de uso, contratos de sessão/log/config; sem regras SQL em routes. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/src/modules/publishing/adapters/postgres/article-reader.ts [CRIAR - PARA PUBLICAR] | Consultas parametrizadas e projections sem hidratar corpos desnecessários. Adicionar exportação consistente, sem limites da API pública. Full-text/ranking e relacionados com predicado público. Ler release fixada e denylist de retirada urgente. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar |
| backend/src/modules/publishing/adapters/postgres/models.ts [CRIAR - PARA PUBLICAR] | Definições Sequelize explícitas, registro único e mapeamento snake_case. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): criar |
| backend/src/modules/publishing/adapters/postgres/progress-store.ts [EVOLUÇÃO FUTURA] | Upsert idempotente e queries privadas. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/src/modules/publishing/adapters/postgres/publication-store.ts [CRIAR - PARA PUBLICAR] | Transação única, CAS, upsert, namespace, rollback e auditoria. Persistir grafo de pré-requisitos validado no import se ativado. Atualizar projeção textual/curadoria junto do import. Persistir revisões imutáveis/candidato quando subcapacidade ativada. | Adapter de persistência | Sequelize único, models privados/SQL com binds, domínio/ports/DTO; sem Express. Lifecycle é integração SQL explícita entre módulos. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar |
| backend/src/modules/publishing/adapters/storage/editorial-asset-store.ts [EVOLUÇÃO FUTURA] | Object storage e validação de assets, sem filesystem efêmero. | Adapter externo | SDK/parser/crypto/storage específico e port implementada; sem dependência inversa do domínio. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/src/modules/publishing/application/activate-release.ts [EVOLUÇÃO FUTURA] | CAS/ativação/rollback idempotente de snapshot validado. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/src/modules/publishing/application/archive-article.ts [CRIAR - PARA PUBLICAR] | Arquivar/restaurar identidade editorial e visibilidade global. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |
| backend/src/modules/publishing/application/content.dto.ts [CRIAR - PARA PUBLICAR] | EditionInput, Operator, ImportResult e projections públicas explícitas. Finalizar DTOs e retorno discriminado de slug. SnapshotSchema v1 e catálogo de URLs públicos. relatedArticles opcional e sort=relevance. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): alterar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar |
| backend/src/modules/publishing/application/export-snapshot.ts [CRIAR - PARA PUBLICAR] | Coordenar snapshot público consistente. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |
| backend/src/modules/publishing/application/get-article.ts [CRIAR - PARA PUBLICAR] | Detalhe e resolução de alias ou not-found. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/src/modules/publishing/application/get-series.ts [CRIAR - PARA PUBLICAR] | Membros ordenados e navegação coerente. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/src/modules/publishing/application/import-content.ts [CRIAR - PARA PUBLICAR] | Coordenar validação, dry-run e applyEdition. Preparar release candidata preservando autoridade Git e interações. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar |
| backend/src/modules/publishing/application/list-articles.ts [CRIAR - PARA PUBLICAR] | Filtros/paginação e projeção de resumos. q com relevância opcional, preservando filtros. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar |
| backend/src/modules/publishing/application/list-series.ts [CRIAR - PARA PUBLICAR] | Séries publicadas e contagem visível. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/src/modules/publishing/application/list-tags.ts [CRIAR - PARA PUBLICAR] | Taxonomia localizada com conteúdo real. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/src/modules/publishing/application/ports/article-reader.ts [CRIAR - PARA PUBLICAR] | Consultas específicas e snapshot público. Completar assinaturas concretas e semântica de retorno nulo. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): alterar |
| backend/src/modules/publishing/application/ports/editorial-asset-store.ts [EVOLUÇÃO FUTURA] | Capacidade de mídia editorial autorizada quando necessária. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/src/modules/publishing/application/ports/editorial-proposal-store.ts [EVOLUÇÃO FUTURA] | Propor revisão Git com CAS e repositório fixo quando painel for necessário. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/src/modules/publishing/application/ports/progress-store.ts [EVOLUÇÃO FUTURA] | Marcação explícita/lista de progresso privado por artigo. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/src/modules/publishing/application/ports/publication-store.ts [CRIAR - PARA PUBLICAR] | Capacidade de escrita editorial atômica, sem tipos Sequelize. Concretizar assinaturas de diff e resultados sem ORM. | Port de aplicação | DTOs/tipos de aplicação/domínio; sem Request, Response, Sequelize ou Transaction. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): alterar |
| backend/src/modules/publishing/application/propose-content.ts [EVOLUÇÃO FUTURA] | Autorizar proposta editorial usando validação existente. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/src/modules/publishing/application/publish-translation.ts [CRIAR - PARA PUBLICAR] | Intenção de publicar e invariantes de primeira data. Associar publicação validada à candidata sem alterar identidade/datas. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar |
| backend/src/modules/publishing/application/publishing.errors.ts [CRIAR - PARA PUBLICAR] | Erros concretos semânticos de conflito/visibilidade/validação. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/src/modules/publishing/application/reading-progress.ts [EVOLUÇÃO FUTURA] | Conclusão por membros visíveis e preferências privadas opcionais. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/src/modules/publishing/application/unpublish-translation.ts [CRIAR - PARA PUBLICAR] | Retirada localizada explícita sem exclusão física. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |
| backend/src/modules/publishing/application/validate-content.ts [CRIAR - PARA PUBLICAR] | Validação de lote/grafo e diagnóstico por arquivo/campo. | Aplicação | Domínio, ports e erros semânticos. Capacidades de outros módulos só por contrato explícito injetado. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |
| backend/src/modules/publishing/domain/article.ts [CRIAR - PARA PUBLICAR] | Tipos e invariantes de Article/Translation/locale/difficulty. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/src/modules/publishing/domain/publication-policy.ts [CRIAR - PARA PUBLICAR] | Transições, visibilidade, revisão e publicação pura. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/src/modules/publishing/domain/reading-time.ts [CRIAR - PARA PUBLICAR] | Contagem determinística sobre texto extraído. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/src/modules/publishing/domain/series.ts [CRIAR - PARA PUBLICAR] | Ordem/membros únicos e navegação localizada. Pré-requisitos sem ciclos quando subcapacidade for ativada. | Domínio | Tipos/funções puros do próprio módulo; sem Express, ORM, Node I/O, env, sessão ou container. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-027"></a>
<!-- navigation:anchor:end -->

### backend/tests

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/tests/api/e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-A de endpoints/status/DTO/auth de Separar composição, HTTP, configuração e ciclo de vida. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar |
| backend/tests/api/e09-public-api.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-A de endpoints/status/DTO/auth de Expor API REST documentada e cache HTTP simples. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/tests/api/e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-A de endpoints/status/DTO/auth de Implementar login GitHub, sessão e logout seguros. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/tests/api/e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-A de endpoints/status/DTO/auth de Aplicar permissões, bloqueio e limites de abuso. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/tests/api/e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-A de endpoints/status/DTO/auth de Entregar curtidas idempotentes e estado privado. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/tests/api/e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-A de endpoints/status/DTO/auth de Comentários moderados e denúncias operáveis. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/tests/api/e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-A de endpoints/status/DTO/auth de Registrar views deduplicadas e estatísticas reais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/tests/api/e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-A de endpoints/status/DTO/auth de Excluir contas, exportar dados e executar retenção. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/tests/api/e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Habilitar comunidade com observabilidade e operação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| backend/tests/api/e21-local-auth.test.ts [EVOLUÇÃO FUTURA] | Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Conta local com confirmação e recuperação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/tests/api/e22-learning-threads.test.ts [EVOLUÇÃO FUTURA] | Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-A de endpoints/status/DTO/auth de Respostas limitadas e progresso explícito de leitura. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/tests/api/e23-localized-search.test.ts [EVOLUÇÃO FUTURA] | Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-A de endpoints/status/DTO/auth de Busca por idioma e relacionados editoriais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): criar |
| backend/tests/api/e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA] | Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-A de endpoints/status/DTO/auth de Evoluir operação editorial e ativação de releases sob necessidade. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/tests/api/e25-private-exports.test.ts [EVOLUÇÃO FUTURA] | Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-A de endpoints/status/DTO/auth de Automatizar atendimento de privacidade quando houver demanda. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/tests/api/e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA] | Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-A de endpoints/status/DTO/auth de Escalar apenas o gargalo medido. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/tests/integration/e01-tooling.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-I das fronteiras reais e persistência/operação de Tornar executáveis os comandos e preservar a base existente. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar |
| backend/tests/integration/e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-I das fronteiras reais e persistência/operação de Separar composição, HTTP, configuração e ciclo de vida. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar |
| backend/tests/integration/e03-migrations.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I das fronteiras reais e persistência/operação de Conexão PostgreSQL e executor de migrations. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |
| backend/tests/integration/e04-publishing-domain.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Definir domínio editorial e contratos de aplicação. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/tests/integration/e05-editorial-schema.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I das fronteiras reais e persistência/operação de Criar schema editorial, constraints e namespace de slugs. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): criar |
| backend/tests/integration/e06-content-validation.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-I das fronteiras reais e persistência/operação de Normalizar os oito textos e validar a fonte editorial. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |
| backend/tests/integration/e07-editorial-import.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I das fronteiras reais e persistência/operação de Importar, publicar, despublicar e arquivar atomicamente. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |
| backend/tests/integration/e08-public-queries.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I das fronteiras reais e persistência/operação de Consultar artigos, tags e séries publicados. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/tests/integration/e09-public-api.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-I das fronteiras reais e persistência/operação de Expor API REST documentada e cache HTTP simples. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/tests/integration/e10-publication-snapshot.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-I das fronteiras reais e persistência/operação de Exportar snapshot e integrar publicação com o site. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |
| backend/tests/integration/e11-containers.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-I das fronteiras reais e persistência/operação de Entregar imagens e Compose reproduzíveis. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar |
| backend/tests/integration/e12-release-operations.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-I das fronteiras reais e persistência/operação de Automatizar validação e fechar operação do primeiro release. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| backend/tests/integration/e13-identity-storage.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I das fronteiras reais e persistência/operação de Criar identidade e persistência de sessões. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/tests/integration/e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-I das fronteiras reais e persistência/operação de Implementar login GitHub, sessão e logout seguros. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/tests/integration/e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-I das fronteiras reais e persistência/operação de Aplicar permissões, bloqueio e limites de abuso. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/tests/integration/e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-I das fronteiras reais e persistência/operação de Entregar curtidas idempotentes e estado privado. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/tests/integration/e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-I das fronteiras reais e persistência/operação de Comentários moderados e denúncias operáveis. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/tests/integration/e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-I das fronteiras reais e persistência/operação de Registrar views deduplicadas e estatísticas reais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/tests/integration/e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Excluir contas, exportar dados e executar retenção. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/tests/integration/e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Habilitar comunidade com observabilidade e operação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| backend/tests/integration/e21-local-auth.test.ts [EVOLUÇÃO FUTURA] | Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Conta local com confirmação e recuperação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/tests/integration/e22-learning-threads.test.ts [EVOLUÇÃO FUTURA] | Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-I das fronteiras reais e persistência/operação de Respostas limitadas e progresso explícito de leitura. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/tests/integration/e23-localized-search.test.ts [EVOLUÇÃO FUTURA] | Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-I das fronteiras reais e persistência/operação de Busca por idioma e relacionados editoriais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): criar |
| backend/tests/integration/e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA] | Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-I das fronteiras reais e persistência/operação de Evoluir operação editorial e ativação de releases sob necessidade. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/tests/integration/e25-private-exports.test.ts [EVOLUÇÃO FUTURA] | Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-I das fronteiras reais e persistência/operação de Automatizar atendimento de privacidade quando houver demanda. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/tests/integration/e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA] | Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-I das fronteiras reais e persistência/operação de Escalar apenas o gargalo medido. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |
| backend/tests/support/app.ts [CRIAR - PARA PUBLICAR] | Montar composição de teste sem serviços externos. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |
| backend/tests/support/database.ts [CRIAR - PARA PUBLICAR] | Preparar DB seguro, migrar e limpar apenas namespace de teste. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |
| backend/tests/unit/e01-tooling.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-U de regras e erros de Tornar executáveis os comandos e preservar a base existente. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar |
| backend/tests/unit/e02-http-lifecycle.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-U de regras e erros de Separar composição, HTTP, configuração e ciclo de vida. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar |
| backend/tests/unit/e03-migrations.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-U de regras e erros de Conexão PostgreSQL e executor de migrations. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): criar |
| backend/tests/unit/e04-publishing-domain.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-U de regras e erros de Definir domínio editorial e contratos de aplicação. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar |
| backend/tests/unit/e05-editorial-schema.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-U de regras e erros de Criar schema editorial, constraints e namespace de slugs. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): criar |
| backend/tests/unit/e06-content-validation.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-U de regras e erros de Normalizar os oito textos e validar a fonte editorial. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |
| backend/tests/unit/e07-editorial-import.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-U de regras e erros de Importar, publicar, despublicar e arquivar atomicamente. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar |
| backend/tests/unit/e08-public-queries.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-U de regras e erros de Consultar artigos, tags e séries publicados. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar |
| backend/tests/unit/e09-public-api.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-U de regras e erros de Expor API REST documentada e cache HTTP simples. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar |
| backend/tests/unit/e10-publication-snapshot.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-U de regras e erros de Exportar snapshot e integrar publicação com o site. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |
| backend/tests/unit/e11-containers.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-U de regras e erros de Entregar imagens e Compose reproduzíveis. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar |
| backend/tests/unit/e12-release-operations.test.ts [CRIAR - PARA PUBLICAR] | Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-U de regras e erros de Automatizar validação e fechar operação do primeiro release. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| backend/tests/unit/e13-identity-storage.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-U de regras e erros de Criar identidade e persistência de sessões. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): criar |
| backend/tests/unit/e14-github-auth.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-U de regras e erros de Implementar login GitHub, sessão e logout seguros. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): criar |
| backend/tests/unit/e15-authorization-abuse.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-U de regras e erros de Aplicar permissões, bloqueio e limites de abuso. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar |
| backend/tests/unit/e16-likes.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-U de regras e erros de Entregar curtidas idempotentes e estado privado. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): criar |
| backend/tests/unit/e17-comments-moderation.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-U de regras e erros de Comentários moderados e denúncias operáveis. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar |
| backend/tests/unit/e18-views-stats.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-U de regras e erros de Registrar views deduplicadas e estatísticas reais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| backend/tests/unit/e19-account-lifecycle.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-U de regras e erros de Excluir contas, exportar dados e executar retenção. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar |
| backend/tests/unit/e20-community-release.test.ts [CRIAR - APÓS PUBLICAÇÃO] | Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-U de regras e erros de Habilitar comunidade com observabilidade e operação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| backend/tests/unit/e21-local-auth.test.ts [EVOLUÇÃO FUTURA] | Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-U de regras e erros de Conta local com confirmação e recuperação completas. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): criar |
| backend/tests/unit/e22-learning-threads.test.ts [EVOLUÇÃO FUTURA] | Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-U de regras e erros de Respostas limitadas e progresso explícito de leitura. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): criar |
| backend/tests/unit/e23-localized-search.test.ts [EVOLUÇÃO FUTURA] | Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-U de regras e erros de Busca por idioma e relacionados editoriais. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): criar |
| backend/tests/unit/e24-editorial-evolution.test.ts [EVOLUÇÃO FUTURA] | Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-U de regras e erros de Evoluir operação editorial e ativação de releases sob necessidade. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |
| backend/tests/unit/e25-private-exports.test.ts [EVOLUÇÃO FUTURA] | Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-U de regras e erros de Automatizar atendimento de privacidade quando houver demanda. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): criar |
| backend/tests/unit/e26-measured-scaling.test.ts [EVOLUÇÃO FUTURA] | Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-U de regras e erros de Escalar apenas o gargalo medido. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-028"></a>
<!-- navigation:anchor:end -->

### backend/tsconfig.json

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| backend/tsconfig.json [ALTERAR - PARA PUBLICAR] | Build sem aliases irresolúveis, strict preservado e escopo explícito de fontes/scripts. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-029"></a>
<!-- navigation:anchor:end -->

### CODE_OF_CONDUCT.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| CODE_OF_CONDUCT.md [CRIAR - APÓS PUBLICAÇÃO] | Conduta e canal/responsável verdadeiros. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-030"></a>
<!-- navigation:anchor:end -->

### compose.yaml

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| compose.yaml [CRIAR - PARA PUBLICAR] | db/migrate/api/web com dependências corretas e defaults locais. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-031"></a>
<!-- navigation:anchor:end -->

### content/articles

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| content/articles/<articleId>/<locale>.md [ALTERAR - PARA PUBLICAR] | Corpos/fontmatter normalizados; caminhos concretos são os UUID registrados uma vez no catálogo. | Fonte editorial | Markdown/YAML/IDs/assets revisados; nunca código executável/secrets. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): mover de frontend/artigo (oito arquivos) |

<!-- navigation:anchor:start -->
<a id="nav-section-032"></a>
<!-- navigation:anchor:end -->

### content/catalog.yaml

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| content/catalog.yaml [CRIAR - PARA PUBLICAR] | Manifesto editorial de IDs, autoria, tags/séries localizadas e relações. | Fonte editorial | Markdown/YAML/IDs/assets revisados; nunca código executável/secrets. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-033"></a>
<!-- navigation:anchor:end -->

### content/legacy-map.json

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| content/legacy-map.json [CRIAR - PARA PUBLICAR] | Mapa permanente dos oito arquivos de origem para UUID/locales, sem gerar IDs a cada execução. | Fonte editorial | Markdown/YAML/IDs/assets revisados; nunca código executável/secrets. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-034"></a>
<!-- navigation:anchor:end -->

### CONTRIBUTING.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| CONTRIBUTING.md [CRIAR - PARA PUBLICAR] | Fonte editorial, revisão e comandos de validação. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-035"></a>
<!-- navigation:anchor:end -->

### deploy/nginx.conf

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| deploy/nginx.conf [CRIAR - PARA PUBLICAR] | Mesmo ponto de entrada, rotas /api/health, estáticos e 404/redirects do snapshot. TLS/limites/cache e retirada de conteúdo na topologia escolhida. | Tooling/deploy/contrato | Runtime/CI/config externa e artefatos declarados; nenhuma credencial embutida. | P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): criar; P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-036"></a>
<!-- navigation:anchor:end -->

### docs/adr

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/adr/001-modular-monolith.md [CRIAR - PARA PUBLICAR] | Registrar limites de dependência existentes da arquitetura. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| docs/adr/002-editorial-source.md [CRIAR - PARA PUBLICAR] | Git único e banco projeção; CAS e idempotência. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| docs/adr/003-publication-snapshot.md [CRIAR - PARA PUBLICAR] | URLs/renderização e janela de divergência aceita. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |
| docs/adr/004-sessions.md [CRIAR - APÓS PUBLICAÇÃO] | Cookies opacos, revogação e CSRF. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| docs/adr/005-metrics-privacy.md [CRIAR - APÓS PUBLICAÇÃO] | Semântica/versionamento/limitações e identificador aprovado. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |
| docs/adr/006-editorial-evolution.md [EVOLUÇÃO FUTURA] | Gatilho, única fonte escolhida e consistência/recuperação de release. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-037"></a>
<!-- navigation:anchor:end -->

### docs/BACKEND_ARCHITECTURE.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/BACKEND_ARCHITECTURE.md [EXISTENTE] | Fonte arquitetural principal existente, não reescrita por este plano. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | Existente; sem implementação nova prevista. |

<!-- navigation:anchor:start -->
<a id="nav-section-038"></a>
<!-- navigation:anchor:end -->

### docs/BACKEND_OPERATIONS.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/BACKEND_OPERATIONS.md [CRIAR - PARA PUBLICAR] | Runbooks, contatos, host, proxy, backup, alertas, incidentes e retirada urgente. Novas dependências, restore, rollback, métricas e recuperação. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-039"></a>
<!-- navigation:anchor:end -->

### docs/COMMUNITY_OPERATIONS.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/COMMUNITY_OPERATIONS.md [CRIAR - APÓS PUBLICAÇÃO] | Fila, abuso, papéis, métricas e capacidade humana. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-040"></a>
<!-- navigation:anchor:end -->

### docs/CONTENT_LICENSE_POLICY.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/CONTENT_LICENSE_POLICY.md [CRIAR - PARA PUBLICAR] | Escopo de direitos de código/artigos/traduções/assets aprovado pelo mantenedor. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-041"></a>
<!-- navigation:anchor:end -->

### docs/PERFORMANCE_DECISIONS.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/PERFORMANCE_DECISIONS.md [EVOLUÇÃO FUTURA] | Baseline, gargalo, experimento, ganho e critério de rollback por subcapacidade. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-042"></a>
<!-- navigation:anchor:end -->

### docs/PRIVACY_OPERATIONS.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/PRIVACY_OPERATIONS.md [CRIAR - PARA PUBLICAR] | Inventário inicial de dados/provedores/logs e decisões pendentes com responsáveis. Inventário P1, prazos aprovados, atendimento, ledger e exceções. Email obrigatório local/fornecedor/retention e nova finalidade. Atendimento automático e fallback manual. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-043"></a>
<!-- navigation:anchor:end -->

### docs/RELEASE_EVIDENCE.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| docs/RELEASE_EVIDENCE.md [CRIAR - PARA PUBLICAR] | Evidências datadas de CI/smoke/restore/revisão e decisões de lançamento. Evidências comunitárias, políticas aprovadas e carga medida. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-044"></a>
<!-- navigation:anchor:end -->

### frontend/.gitignore

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/.gitignore [ALTERAR - PARA PUBLICAR] | Ignorar snapshot/artefatos gerados de build; preservar fontes e configuração existentes. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-045"></a>
<!-- navigation:anchor:end -->

### frontend/generated

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/generated/published-content.json [CRIAR - PARA PUBLICAR] | Artefato gerado por export consistente, não fonte editável; schemaVersion/revision/hash e catálogo público completo. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-046"></a>
<!-- navigation:anchor:end -->

### frontend/LICENSE

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/LICENSE [EXISTENTE] | Licença Apache existente, preservar e confirmar escopo em política de direitos. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | Existente; sem implementação nova prevista. |

<!-- navigation:anchor:start -->
<a id="nav-section-047"></a>
<!-- navigation:anchor:end -->

### frontend/package.json

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/package.json [ALTERAR - PARA PUBLICAR] | Build com snapshot e pré-renderização, sem segredo backend. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar |

<!-- navigation:anchor:start -->
<a id="nav-section-048"></a>
<!-- navigation:anchor:end -->

### frontend/README.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/README.md [EXISTENTE] | README existente do frontend, reutilizar e apontar setup integrado. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | Existente; sem implementação nova prevista. |

<!-- navigation:anchor:start -->
<a id="nav-section-049"></a>
<!-- navigation:anchor:end -->

### frontend/scripts

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/scripts/prerender.tsx [CRIAR - PARA PUBLICAR] | Renderizar catálogo completo React e sitemap a partir de uma revisão. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-050"></a>
<!-- navigation:anchor:end -->

### frontend/src

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/src/App.tsx [ALTERAR - PARA PUBLICAR] | Roteamento localizado e alternates reais mantendo layout. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar |
| frontend/src/content/articles.ts [EXISTENTE] | Referência do catálogo real durante migração; substituição do consumo em [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site). Substituir fonte raw/placeholders por snapshot; manter seletores úteis. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): reutilizar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar |
| frontend/src/content/snapshot.ts [CRIAR - PARA PUBLICAR] | Validar/consumir contrato de snapshot no build. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |
| frontend/src/features/articles/community.tsx [CRIAR - APÓS PUBLICAÇÃO] | Integração de login/likes/comments/stats reais com estados privados fora do HTML cacheado. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): criar |
| frontend/src/features/articles/components/article-detail/MarkdownArticle.tsx [ALTERAR - PARA PUBLICAR] | Renderer AST seguro, preservar seções e links/code completos. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar |
| frontend/src/features/articles/useQualifiedView.ts [CRIAR - APÓS PUBLICAÇÃO] | Timer de visibilidade e envio limitado sob preferência de privacidade. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-051"></a>
<!-- navigation:anchor:end -->

### frontend/tests

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/tests/publication.test.ts [CRIAR - PARA PUBLICAR] | Contrato de HTML/URLs/sitemap e preservação de conteúdo. | Testes | Domínio/aplicação/adapters alvo e fixtures; nunca DB/serviços de produção. | P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-052"></a>
<!-- navigation:anchor:end -->

### frontend/vite.config.ts

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| frontend/vite.config.ts [EXISTENTE] | Vite existente; integrar build/SSR de [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) se configuração exigir, preservando React. | Integração frontend | DTO público/snapshot/React existente, sem modelos Sequelize/secrets backend. | Existente; sem implementação nova prevista. |

<!-- navigation:anchor:start -->
<a id="nav-section-053"></a>
<!-- navigation:anchor:end -->

### README.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| README.md [CRIAR - PARA PUBLICAR] | Quickstart real por projeto e navegação da documentação. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |

<!-- navigation:anchor:start -->
<a id="nav-section-054"></a>
<!-- navigation:anchor:end -->

### SECURITY.md

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Arquivo/marca | Finalidade e responsabilidade | Camada | Dependências permitidas | Surge/evolui |
| --- | --- | --- | --- | --- |
| SECURITY.md [CRIAR - PARA PUBLICAR] | Canal privado real de vulnerabilidade e acesso operacional. | Documentação/decisão | Arquitetura, contratos e evidências reais; nenhum secret ou contato fictício. | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar |

<a id="historico"></a>

## Histórico de arquivos que evoluem

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Destino único | Origem existente | Histórico de alterações | Motivo/testes |
| --- | --- | --- | --- |
| backend/package.json | Criado na primeira etapa indicada | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar; P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): alterar; P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): alterar; P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): alterar; P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): alterar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P0/[E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/package-lock.json | Criado na primeira etapa indicada | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/.env.example | Criado na primeira etapa indicada | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): criar; P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logging/redact-sensitive.ts | backend/src/infrastructures/logger/redact-sensitive.ts | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): reutilizar (backend/src/infrastructures/logger/redact-sensitive.ts); P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/redact-sensitive.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/main.ts | backend/src/index.ts | P0/[E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): alterar (backend/src/index.ts); P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/index.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/composition.ts | Criado na primeira etapa indicada | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar; P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): alterar; P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): alterar; P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): alterar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/config/env.ts | backend/src/bootstrap/env.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/bootstrap/env.ts; P1/[E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/app.ts | backend/src/framework/http/server.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/server.ts; P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): alterar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/health.routes.ts | backend/src/framework/http/healthCheck.route.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/healthCheck.route.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/cors.ts | backend/src/framework/http/cors.config.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/cors.config.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/request-context.ts | backend/src/framework/http/request-context.middleware.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/request-context.middleware.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/request-log.ts | Criado na primeira etapa indicada | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): criar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/error-handler.ts | backend/src/shared/middlewares/errorHandler.middleware.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/shared/middlewares/errorHandler.middleware.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/http/error-status.ts | backend/src/framework/http/application-error-status.mapper.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/framework/http/application-error-status.mapper.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logger.ts | backend/src/infrastructures/logger/logger.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/logger.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logging/formatter.ts | backend/src/infrastructures/logger/formatter/logger.formater.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/formatter/logger.formater.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logging/request-context.ts | backend/src/infrastructures/logger/context/request.context.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/context/request.context.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logging/logger.interface.ts | backend/src/infrastructures/logger/logger.interface.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/logger.interface.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/logging/logger.context.ts | backend/src/infrastructures/logger/context/logger.context.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/context/logger.context.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/process-handlers.ts | backend/src/infrastructures/logger/process-error-handlers.ts | P0/[E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover de backend/src/infrastructures/logger/process-error-handlers.ts | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/database.ts | backend/src/infrastructures/persistence/ORM/index.sequelize.ts | P0/[E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): mover de backend/src/infrastructures/persistence/ORM/index.sequelize.ts; P0/[E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs): reutilizar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/domain/series.ts | Criado na primeira etapa indicada | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/application/content.dto.ts | Criado na primeira etapa indicada | P0/[E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o): criar; P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): alterar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| content/articles/<articleId>/<locale>.md | frontend/artigo (oito arquivos) | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): mover de frontend/artigo (oito arquivos) | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/adapters/cli/content.schemas.ts | Criado na primeira etapa indicada | P0/[E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/application/import-content.ts | Criado na primeira etapa indicada | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/application/publish-translation.ts | Criado na primeira etapa indicada | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/adapters/postgres/publication-store.ts | Criado na primeira etapa indicada | P0/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/application/list-articles.ts | Criado na primeira etapa indicada | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/adapters/postgres/article-reader.ts | Criado na primeira etapa indicada | P0/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados): criar; P0/[E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/publishing/adapters/http/article.schemas.ts | Criado na primeira etapa indicada | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/openapi.yaml | Criado na primeira etapa indicada | P0/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples): criar; P1/[E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros): alterar; P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): alterar; P1/[E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado): alterar; P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): alterar; P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): alterar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais): alterar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/scripts/restore.mjs | Criado na primeira etapa indicada | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/scripts/release-smoke.mjs | Criado na primeira etapa indicada | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P2/[E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| docs/BACKEND_OPERATIONS.md | Criado na primeira etapa indicada | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| docs/RELEASE_EVIDENCE.md | Criado na primeira etapa indicada | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| docs/PRIVACY_OPERATIONS.md | Criado na primeira etapa indicada | P0/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/infrastructures/rate-limiter.ts | Criado na primeira etapa indicada | P1/[E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/community/domain/comment.ts | Criado na primeira etapa indicada | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/community/adapters/postgres/comment-store.ts | Criado na primeira etapa indicada | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/community/adapters/http/comments.routes.ts | Criado na primeira etapa indicada | P1/[E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis): criar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/community/adapters/postgres/view-recorder.ts | Criado na primeira etapa indicada | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/community/adapters/postgres/stats-reader.ts | Criado na primeira etapa indicada | P1/[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais): criar; P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): alterar; P2/[E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/identity/application/export-account.ts | Criado na primeira etapa indicada | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | Criado na primeira etapa indicada | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/src/modules/identity/adapters/http/account.routes.ts | Criado na primeira etapa indicada | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |
| backend/scripts/cleanup.ts | Criado na primeira etapa indicada | P1/[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o): criar; P2/[E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas): alterar; P2/[E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda): alterar | Responsabilidades acima; cenários de cada E referenciado em BACKEND_TEST_PLAN.md. Mesmos contratos anteriores permanecem em regressão. |

<!-- navigation:anchor:start -->
<a id="nav-section-055"></a>
<!-- navigation:anchor:end -->

### Mapa de reuso da base atual

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Origem | Destino | Tratamento |
| --- | --- | --- |
| backend/src/index.ts | backend/src/main.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/bootstrap/env.ts | backend/src/config/env.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/framework/http/server.ts | backend/src/http/app.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/framework/http/healthCheck.route.ts | backend/src/http/health.routes.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/framework/http/cors.config.ts | backend/src/http/cors.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/framework/http/request-context.middleware.ts | backend/src/http/request-context.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/shared/middlewares/errorHandler.middleware.ts | backend/src/http/error-handler.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/framework/http/application-error-status.mapper.ts | backend/src/http/error-status.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/logger.ts | backend/src/infrastructures/logger.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/formatter/logger.formater.ts | backend/src/infrastructures/logging/formatter.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/redact-sensitive.ts | backend/src/infrastructures/logging/redact-sensitive.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/context/request.context.ts | backend/src/infrastructures/logging/request-context.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/logger.interface.ts | backend/src/infrastructures/logging/logger.interface.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/context/logger.context.ts | backend/src/infrastructures/logging/logger.context.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/logger/process-error-handlers.ts | backend/src/infrastructures/process-handlers.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |
| backend/src/infrastructures/persistence/ORM/index.sequelize.ts | backend/src/infrastructures/database.ts | Mover implementação, atualizar imports/consumidores e preservar testes; retirar origem ao concluir, sem dois servidores/loggers. |

Helper genérico Sequelize, DbColumn e BaseModelType legados permanecem identificados como existentes sem expansão. Não são parte das ports editoriais e não precisam ser reconstruídos para o release. Se removidos por ausência de consumidores durante a simplificação, remover também imports/dependências realmente ociosos e rodar build; a remoção não cria nova funcionalidade. DI/UoW/event worker já removidos não aparecem como tarefas.
