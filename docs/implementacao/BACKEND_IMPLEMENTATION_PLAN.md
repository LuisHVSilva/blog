# Plano operacional de implementação do backend

[Comece aqui — guia de leitura e execução](./00_COMECE_AQUI.md)

<!-- navigation:index:start -->
**Navegação:** [Ordem de implementação](./BACKEND_IMPLEMENTATION_ORDER.md) · **Plano detalhado** · [Estrutura de arquivos](./BACKEND_IMPLEMENTATION_STRUCTURE.md) · [Regras de negócio](./BACKEND_BUSINESS_RULES.md) · [Plano de testes](./BACKEND_TEST_PLAN.md)

[Arquitetura de referência](./BACKEND_ARCHITECTURE.md)

<a id="indice"></a>

## Índice

- [Como executar](#como-executar)
- [Estado atual verificado](#estado-atual-verificado)
  - [Verificações executadas e limites](#verifica%C3%A7%C3%B5es-executadas-e-limites)
- [Pontos de atenção e decisões abertas delimitadas](#pontos-de-aten%C3%A7%C3%A3o-e-decis%C3%B5es-abertas-delimitadas)
- [Dependências e milestones](#depend%C3%AAncias-e-milestones)
- [Contratos comuns e detalhes de persistência](#contratos-comuns-e-detalhes-de-persist%C3%AAncia)
  - [Tipos e limites editoriais — E04/E06](#tipos-e-limites-editoriais--e04e06)
  - [Transições editoriais — E04/E07](#transi%C3%A7%C3%B5es-editoriais--e04e07)
  - [DDL mínimo — E05](#ddl-m%C3%ADnimo--e05)
  - [Ports e resultados — E04/E07](#ports-e-resultados--e04e07)
  - [DTOs públicos — E08/E09/E10](#dtos-p%C3%BAblicos--e08e09e10)
  - [Contratos comunitários — E13–E20](#contratos-comunit%C3%A1rios--e13e20)
  - [Comandos operacionais esperados ao fim de P0](#comandos-operacionais-esperados-ao-fim-de-p0)
  - [Resumo dos parâmetros adotados](#resumo-dos-par%C3%A2metros-adotados)
- [Para publicar — P0](#para-publicar--p0)
  - [E01. Tornar executáveis os comandos e preservar a base existente](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)
  - [E02. Separar composição, HTTP, configuração e ciclo de vida](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)
  - [E03. Conexão PostgreSQL e executor de migrations](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)
  - [E04. Definir domínio editorial e contratos de aplicação](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)
  - [E05. Criar schema editorial, constraints e namespace de slugs](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)
  - [E06. Normalizar os oito textos e validar a fonte editorial](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)
  - [E07. Importar, publicar, despublicar e arquivar atomicamente](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)
  - [E08. Consultar artigos, tags e séries publicados](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)
  - [E09. Expor API REST documentada e cache HTTP simples](#e09-expor-api-rest-documentada-e-cache-http-simples)
  - [E10. Exportar snapshot e integrar publicação com o site](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)
  - [E11. Entregar imagens e Compose reproduzíveis](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)
  - [E12. Automatizar validação e fechar operação do primeiro release](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)
- [Após publicação — P1](#ap%C3%B3s-publica%C3%A7%C3%A3o--p1)
  - [E13. Criar identidade e persistência de sessões](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)
  - [E14. Implementar login GitHub, sessão e logout seguros](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)
  - [E15. Aplicar permissões, bloqueio e limites de abuso](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)
  - [E16. Entregar curtidas idempotentes e estado privado](#e16-entregar-curtidas-idempotentes-e-estado-privado)
  - [E17. Comentários moderados e denúncias operáveis](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)
  - [E18. Registrar views deduplicadas e estatísticas reais](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)
  - [E19. Excluir contas, exportar dados e executar retenção](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)
  - [E20. Habilitar comunidade com observabilidade e operação completas](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)
- [Evolução futura — P2](#evolu%C3%A7%C3%A3o-futura--p2)
  - [E21. Conta local com confirmação e recuperação completas](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)
  - [E22. Respostas limitadas e progresso explícito de leitura](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)
  - [E23. Busca por idioma e relacionados editoriais](#e23-busca-por-idioma-e-relacionados-editoriais)
  - [E24. Evoluir operação editorial e ativação de releases sob necessidade](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)
  - [E25. Automatizar atendimento de privacidade quando houver demanda](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)
  - [E26. Escalar apenas o gargalo medido](#e26-escalar-apenas-o-gargalo-medido)
- [Evolução explícita dos mesmos componentes](#evolu%C3%A7%C3%A3o-expl%C3%ADcita-dos-mesmos-componentes)
- [Revisão cruzada final do planejamento](#revis%C3%A3o-cruzada-final-do-planejamento)
<!-- navigation:index:end -->

Data da análise: **09/09/2026**. Raiz de todos os caminhos: `D:\Projetos\blog`. Este plano documenta trabalho futuro; não implementa endpoints, migrations ou deploy. Fonte principal lida integralmente: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md), §§1–24 e checklists. A auditoria atual prevalece sobre descrições do estado do código feitas em 08/09. O desenho arquitetural desse documento permanece a referência.

<!-- navigation:anchor:start -->
<a id="nav-section-001"></a>
<!-- navigation:anchor:end -->

## Como executar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

Comece em [BACKEND_IMPLEMENTATION_ORDER.md](./BACKEND_IMPLEMENTATION_ORDER.md). Cada [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)–[E26](#e26-escalar-apenas-o-gargalo-medido) aponta à seção correspondente deste plano, às regras [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel)–[R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) em [BACKEND_BUSINESS_RULES.md](./BACKEND_BUSINESS_RULES.md), aos cenários em [BACKEND_TEST_PLAN.md](./BACKEND_TEST_PLAN.md) e aos arquivos em [BACKEND_IMPLEMENTATION_STRUCTURE.md](./BACKEND_IMPLEMENTATION_STRUCTURE.md). Prefixos E identificam etapas; R regras; [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01)/[E07-I01](./BACKEND_TEST_PLAN.md#e07-i01) cenários. Dependências são gates, não sugestões. A etapa só termina junto dos seus testes.

P0 = **Para publicar**, editorial funcional/seguro. P1 = **Após publicação**, primeira comunidade completa. P2 = **Evolução futura**, capacidades condicionadas aos gatilhos descritos. Não antecipar P1 só para mostrar contadores. Nenhuma tarefa P0 cria contas/comentários/likes/views. P2 é um conjunto ordenado de opções: seguir a sequência, registrar “adiado — gatilho ausente” e não gerar tabelas/arquivos vazios. Quando uma opção for ativada, cumprir integralmente contratos/testes antes de marcá-la pronta.

<!-- navigation:anchor:start -->
<a id="nav-section-002"></a>
<!-- navigation:anchor:end -->

## Estado atual verificado

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

Foram lidos integralmente os **25 arquivos TypeScript** presentes em backend/src, package.json, tsconfig.json, Dockerfile.develop, Compose e ignores; inventariados lockfile, arquivos gerados e diretório test vazio. Busca no projeto não encontrou outra implementação de servidor/backend fora de backend/src. Foram inspecionados catálogo/renderer/package do frontend e metadados dos oito artigos para definir a integração. Dependências vendorizadas, JS gerado em dist, IDE e logs não são fontes adicionais de domínio; dist foi exercitado como artefato. Valores de .env e logs pessoais não foram reproduzidos. Nenhum AGENTS.md aplicável foi encontrado nos diretórios ancestrais/projeto inspecionados.

| Componente/caminho atual | Estado e evidência | Evolução necessária |
| --- | --- | --- |
| backend/package.json; tsconfig.json | typecheck e build passaram; baseUrl removido, strict ativo, scripts ci/build existem | [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): JS ainda contém aliases; test referencia arquivo ausente, faltam start/lint/migrations; não refazer correção do compilador |
| backend/src/index.ts | Composição manual Logger/Database/Server; catch startup define exitCode | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover para main, esperar listening/error e fechar recursos em falha |
| backend/src/bootstrap/env.ts | Resolve raiz pelo package.json e carrega .env.dev independentemente de cwd | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): manter resolução local, validar schema e impedir fallback de produção |
| backend/src/framework/http/server.ts | CORS, Helmet, cookie-parser, requestId e health montados; DB antes de listen | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): separar app/listener, retirar 100mb/trust proxy=true e parser urlencoded global |
| healthCheck.route.ts | /api/ e /api/health existem; health DB retorna503 em falha | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): caminhos /health/live e /health/ready, timeout, shutdown e informação mínima |
| cors.config.ts | Allowlist exata, credentials e X-Request-Id já existem | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): injeção de config, rejeição sem eco de origem; preservar allowlist |
| request-context.middleware.ts | UUID fallback, limite128, ALS por request | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): validar formato, executar antes do CORS e registrar rota sem query |
| application-error-status.mapper.ts; shared/errors/application.error.ts | ApplicationError sem status HTTP e mapping separado já implementados | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): ampliar kinds422/429/503 e envelope; não criar erro semântico do zero |
| shared/middlewares/errorHandler.middleware.ts | JSON inválido400,413, headersSent, fallback requestId e logger assíncrono já existem | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): envelope error:{...}, fallback seguro, log sem originalUrl; manter proteções existentes |
| infrastructures/logger/logger.ts; formatter/logger.formater.ts | JSON stdout, timestamp por evento, service e correlação já corrigidos | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): reusar/mover, allowlist de detalhes, log de término/duração; sem reimplementar stdout |
| logger/redact-sensitive.ts | Redação recursiva de credenciais, URLs, Error, Date e ciclos | [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): testes ausentes, preservação da função; comentário atual promete segurança excessiva para qualquer payload |
| logger/process-error-handlers.ts | uncaughtException/unhandledRejection encerram com1 e timeout10s | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): integrar SIGTERM/SIGINT/cleanup; não tratar handler fatal como inexistente |
| logger/context/request.context.ts, logger.context.ts, logger.interface.ts | ALS sem participantId, contexto e interface próprios | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida): mover, manter isolamento; interface ainda usa any e tipos HTTP em infra |
| infrastructures/persistence/ORM/index.sequelize.ts | Connect propaga falha, disconnect existe, sem hooks repetidos; nenhum model | [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations): injetar config/pool/timeouts, retirar sync; [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) models reais |
| ORM/helpers/sequelizeWhereBuilder.helper.ts; shared/types/persistence.type.ts | Helper genérico existente; Order ORM, max500/removeLimit, _limit guarda raw; isOperatorObject não reconhece só lt/lte/gt/gte | Não usar para contrato editorial; deixar sem expansão, retirar só quando busca confirmar nenhum consumidor. Não gastar etapa reconstruindo helper genérico |
| ORM/decorators/dbColumn.ts; ORM/types/baseModel.type.ts | Decorator snake_case e base id:number sem consumidor editorial | Sem uso no novo domínio UUID; retirar com dependência sequelize-typescript apenas se sem consumidores |
| shared/errors/infrastructure.error.ts | InfrastructureError/RepositoryError existentes | Reusar como detalhe de infraestrutura, traduzir falhas conhecidas na borda; não expor cause |
| shared/constants/logger.constants.ts; messages/common.messages.ts; messages/infrastructure.messages.ts | Constantes existentes; mensagens de diretório/log/encryption sem consumidor atual | Reusar o necessário; não implementar features sugeridas por nomes legados; remover sobras só junto da limpeza de consumidores |
| DI, decorators de log, UoW/context de eventos | Já removidos do worktree | Não criar tarefas para removê-los novamente |
| .dockerignore; .gitignore backend e raiz | Secrets/dependências/logs/IDE ignorados; docs/ também ignorado pela raiz | [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente): .env.example e permitir docs; [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) reusar .dockerignore |
| docker-compose-develop.yml | Só API/PostgreSQL16, NODE_ENV=dev, volume nomeado/health; interpolação --env-file correta nos scripts host | [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis): container chama npm run dev→docker compose interno; separar dev:api; acrescentar migrate/web/entrada canônica |
| Dockerfile.develop; Dockerfile | Dev existe; Dockerfile produção ausente no worktree (deletado em relação ao índice) | [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) criar imagem produção; não afirmar que FFmpeg ainda está em execução |
| Domínio/editorial/migrations/auth/comunidade | Inexistentes | [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)–[E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)/P1 constroem capacidades novas |
| test/ e tests/ | test/ vazio, tests/ inexistente; npm test falha por arquivo ausente | [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) cria regressão e runner; suites surgem em paralelo com cada etapa |
| frontend/artigo; frontend/src/content/articles.ts | Quatro pares reais, três arquivos sem delimitadores YAML, metadata/data/séries em TS e placeholders | [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) normalizar conteúdo; [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) integrar snapshot/HTML sem reconstruir layout |

<!-- navigation:anchor:start -->
<a id="nav-section-003"></a>
<!-- navigation:anchor:end -->

### Verificações executadas e limites

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

- `npm run typecheck`: passou no ambiente local instalado.
- `npm run build`: passou e emitiu dist/src; isso não prova execução do servidor.
- `npm test`: falhou — não existe test/redact-sensitive.test.ts.
- `node dist/src/index.js`: falhou com MODULE_NOT_FOUND para @shared/constants/messages/common.messages. O teste não chegou a autenticar banco.
- Node observado v22.19.0; npm11.6.1. Não foram instaladas dependências nem certificadas versões disponíveis/suportadas no registry nesta análise.
- `git -c safe.directory=D:/Projetos/blog` foi usado apenas por comando para leitura do estado; havia muitas alterações staged/worktree da reorganização. Não alterar índice/histórico alheios como parte do planejamento.
- .env.dev não aparece em git ls-files atual, e a consulta do histórico local disponível desse caminho não retornou commits. Isso corrige B01 no índice atual, mas não certifica todos remotos/históricos. docs está ignorado e não aparece no status comum.
- Não foram iniciados containers, feitas migrations, conexões de DB, testes de produção ou restore. Os cenários correspondentes são critérios futuros, não resultados desta auditoria.

<!-- navigation:anchor:start -->
<a id="nav-section-004"></a>
<!-- navigation:anchor:end -->

## Pontos de atenção e decisões abertas delimitadas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

1. **[PONTO DE ATENÇÃO ARQUITETURAL] Auditoria B01–B18 envelhecida.** BaseUrl, scripts básicos, fatal shutdown, stdout, DI/UoW e ambiente já evoluíram. Repetir checklist literalmente duplicaria trabalho. Usar a matriz acima; preservar direção arquitetural e implementar só gaps atuais.
2. **[PONTO DE ATENÇÃO ARQUITETURAL] Slug atual e redirect em tabelas independentes não asseguram unicidade conjunta.** [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) adota namespace article_paths e view conceitual ArticleSlugRedirect, com constraints diferidas. É concretização da exigência transacional da arquitetura, não nova taxonomia de conteúdo.
3. **[PONTO DE ATENÇÃO ARQUITETURAL] Git e comandos urgentes podem divergir.** [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente) exige patch correspondente no Git e CAS; [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) trata retirada também no site/cache. A falha de build após import é janela aceita de P0, registrada/alertada; [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) só muda esse contrato se necessário.
4. **[PONTO DE ATENÇÃO ARQUITETURAL] Release backend depende do HTML do frontend.** [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) define arquivo/contrato/consumidor e smoke. Entregar só JSON não conclui P0 da arquitetura; layout/SEO de marketing fora desse contrato não é escopo deste plano.
5. **Decisões humanas não inferíveis:** nome/bio do autor e licenças ([E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)/[E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)), domínio/host/orçamento/proxy/contatos/RPO/RTO ([E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)), responsável de moderação/base de tratamento/identificador/retention ([E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)/[E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)). Defaults técnicos permitem implementação local. Gate de release exige decisões reais registradas em RELEASE_EVIDENCE/operations; não há tarefa vaga para o implementador redesenhar arquitetura.
6. **[REGRA INFERIDA] Defaults do plano:** sourceLocale pt-BR dos pares, ordem JS/TS→TSConfig e Node→arquitetura, slugs finais propostos, CAS editorial, versão otimista de comentário, purge de body na exclusão e proteção do último admin. Onde a arquitetura já fornece default (7d/24h, comentário5000, views10s/48h), ele foi adotado e continua parâmetro de produto/técnico, não obrigação legal.

<!-- navigation:anchor:start -->
<a id="nav-section-005"></a>
<!-- navigation:anchor:end -->

## Dependências e milestones

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Milestone | Etapas | Evidência para conclusão |
| --- | --- | --- |
| M0 — base executável | [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)–[E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) | JS executa, app isolado, health/shutdown testados, runner de migration real |
| M1a — catálogo editorial | [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)–[E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente) | Schema com constraints, oito textos validados, import/publicação/retirada atômicos |
| M1b — leitura e snapshot | [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)–[E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) | API/OpenAPI, URLs/locales, export consistente e HTML PT/EN |
| M1 — primeiro release | [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)–[E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release), mais todos anteriores | Compose/imagem/CI, HTTPS, alertas, backup restaurado e decisões operacionais registradas |
| M2a — identidade | [E13](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)–[E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) | OAuth/sessão/CSRF/roles/abuso com testes; comunidade ainda desligada |
| M2b — interações | [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado)–[E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) | Likes/comments/views reais, moderação, direitos/retention/restore |
| M2 — comunidade habilitável | [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) | Smoke completo, capacidade humana/políticas aprovadas e observabilidade |
| M3 — evoluções condicionais | [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)–[E26](#e26-escalar-apenas-o-gargalo-medido) | Cada subcapacidade ativada tem migração/contrato/testes/rollback; adiada não conta como implementada |

Sequência linear [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)→[E26](#e26-escalar-apenas-o-gargalo-medido) é operacional e respeita dependências. [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) depende [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) (pode começar após fundação), [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) depende [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), mas a ordem principal evita exigir trabalho paralelo. P2 [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)/[E23](#e23-busca-por-idioma-e-relacionados-editoriais)/[E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)/[E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)/[E26](#e26-escalar-apenas-o-gargalo-medido) não dependem de conta local [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas); percorrer opções em ordem e pular apenas por gatilho ausente documentado. Dentro de cada etapa, implementar contratos/política + unitários, depois adapter/migration + integração, depois HTTP/CLI + contrato/smoke. Não deixar testes para [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)/[E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

<!-- navigation:anchor:start -->
<a id="nav-section-006"></a>
<!-- navigation:anchor:end -->

## Contratos comuns e detalhes de persistência

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

Estas definições complementam as etapas e evitam formas distintas para o mesmo dado. Nomes camelCase no TypeScript/JSON e snake_case no SQL. Nenhum DTO devolve model Sequelize. Campos opcionais ausentes são omitidos no JSON; valores desconhecidos não recebem defaults que inventem conteúdo.

<!-- navigation:anchor:start -->
<a id="nav-section-007"></a>
<!-- navigation:anchor:end -->

### Tipos e limites editoriais — E04/E06

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Contrato | Campos e invariantes |
| --- | --- |
| Locale | BCP47 canônico na allowlist pt-BR/en. Configuração normaliza grafia; desconhecido400 na API, erro de schema CLI. Sem cadastro Language |
| UUID | UUID validado, gerado e gravado uma vez para artigo/tradução/autor/tag/série; não reconstruir por nome. Associação usa IDs existentes |
| Slug | NFC/lowercase, regex ^[a-z0-9]+(?:-[a-z0-9]+)*$,1..120. Segmento apenas; sem slash,ponto,% ou path. Arquivo exige canônico, não converte silenciosamente path antigo |
| Metadata | title1..200,description1..500 após trim; seoTitle opcional1..200/seoDescription1..500; displayName1..100,bio0..2000. Limites técnicos, não garantia SEO. Texto puro |
| Corpo | Markdown UTF-8 até512KiB/arquivo; publicação exige texto significativo, não só whitespace/markup. Sem HTML ativo/MDX/scripts; fences preservadas como texto |
| Datas | ISO8601 UTC na API, timestamptz no DB; createdAt imutável, primeira publishedAt preservada; clock injetado. Nunca agendar por timestamp futuro |
| Revisão | sourceRevision=SHA256 de campos normalizados relevantes da tradução; translatedFromRevision=hash da origem revisada para não origem. Original não exige translatedFromRevision. Edição global/commit separados da revisão de texto |
| SEO/assets | socialImagePath relativo à raiz local permitida, arquivo existente, imageAlt1..300 obrigatório quando imagem presente; links públicos de autor http/https; avatar local. Canonical gerado do domínio confiável |
| Catalog | schemaVersion1,authors[],tags[],series[],articles[],operations[]. Author id/displayName/profileSlug/bio/avatarPath?/links[]. Tag id/key/translations[]. Series id/status/difficulty?/translations[]/members[{articleId,position}]. Article id/sourceLocale/authorId/difficulty/tagIds[]/createdAt |
| Frontmatter | translationId/articleId/locale/slug/title/description/status/publishedAt?/updatedAt/sourceRevision/translatedFromRevision?/SEO; body após delimitador YAML. Sem repetir tags/autor/dificuldade/séries compartilhados |
| Operações | unpublish ou archiveTranslation {articleId,locale,reason}; archive/restore {articleId,reason}; restoreTranslation {articleId,locale,reason}. Lote recebe expectedRevision separadamente; revisão idempotente impede reaplicar intenção |

sourceRevision pode ser calculado pelo validador, mas, se informado e divergente, falhar com SOURCE_REVISION_MISMATCH; não aceitar hash arbitrário. Entrada do hash: JSON canônico de locale,slug,title,description,bodyMarkdown e overrides SEO normalizados, chaves ordenadas e LF. Excluir o próprio hash, translatedFromRevision, timestamps, readingMinutes e status para evitar autorreferência/cascatas; revisão global da edição inclui também estados/relações e controla mudanças de exposição. Datas de mudança vêm da revisão/now, nunca do mtime do filesystem. Alteração de apresentação/membros/ordem de série atualiza series.updatedAt; lastmod da página da série usa revisão relevante dessa apresentação/lista. AuthorProfile.profileSlug e tag.key são únicos. Não inferir coautoria/licença do nome do arquivo.

<!-- navigation:anchor:start -->
<a id="nav-section-008"></a>
<!-- navigation:anchor:end -->

### Transições editoriais — E04/E07

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Estado atual | Intenção | Próximo estado/efeito |
| --- | --- | --- |
| Tradução inexistente | Import válida, origem no lote/DB | draft por padrão; published somente pela política PublishTranslation |
| draft | Publish | published, exige pai ativo/metadados/corpo/revisões/relações; primeira data histórica revisada ou now |
| published | Corrigir revisão | published, mantém primeira data; updatedAt/revisão só se alteração relevante |
| published | Unpublish explícito | draft, mantém ID/corpo/primeira data/interações, some publicamente |
| draft/published | ArchiveTranslation | archived; operação de unpublish com targetState=archived, mantém dados |
| archived | RestoreTranslation | draft; publicar exige segunda intenção explícita |
| Artigo ativo | ArchiveArticle | archivedAt=now, todas traduções invisíveis, estados internos preservados |
| Artigo arquivado | RestoreArticle | archivedAt=null; traduções previamente published voltam a público; dry-run lista reexposições antes do commit |
| Qualquer | Arquivo ausente | Nenhuma exclusão/retirada automática |
| Qualquer | Mesma revisão/hash | No-op, inclusive datas/auditoria editorial; pode haver log operacional de retry |
| Qualquer | expectedRevision antiga | REVISION_CONFLICT, nenhuma alteração parcial |

Série global/local draft/published/archived: publicar apresentação não publica membros; arquivar série remove página/referências daquela trilha, não artigos; remover membro não apaga artigo. Restore de série passa por draft e nova publicação explícita. Alterações entram em snapshot/ETag/cache. Essas regras estendem [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es)/[R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) sem nova entidade.

<!-- navigation:anchor:start -->
<a id="nav-section-009"></a>
<!-- navigation:anchor:end -->

### DDL mínimo — E05

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Tabela | Colunas/constraints |
| --- | --- |
| author_profiles | id UUID PK,display_name,profile_slug UNIQUE,bio,avatar_path nullable,links JSONB validado pelo adapter |
| articles | id UUID PK,source_locale text,author_id FK RESTRICT,difficulty CHECK,created_at timestamptz,archived_at nullable |
| article_translations | id UUID PK,article_id FK,locale,slug,title,description,body_markdown,status CHECK,published_at nullable,updated_at,source_revision,translated_from_revision nullable,reading_minutes CHECK>=1,seo_title/seo_description/social_image_path/image_alt nullable; UNIQUE(article_id,locale),UNIQUE(locale,slug) |
| tags/tag_translations | tags(id UUID PK,key UNIQUE); traduções PK(tag_id,locale),name,slug,description nullable,UNIQUE(locale,slug) |
| article_tags | PK(article_id,tag_id),FKs,índice(tag_id,article_id) |
| series/series_translations | series(id UUID PK,status,difficulty nullable,created_at,updated_at); tradução PK(series_id,locale),slug,title,description,prerequisites_text nullable,status,UNIQUE(locale,slug) |
| series_articles | PK(series_id,article_id),position integer CHECK>0,UNIQUE(series_id,position) diferida,índice(article_id,series_id) |
| publication_editions | revision text PK,content_hash,source_commit,actor_id text,applied_at timestamptz,report JSONB sem body/secrets; IDs/status/revisões, sem event sourcing de textos |
| publication_state | id=1 CHECK,revision FK nullable apenas antes da primeira edição; linha existe desde migration e FOR UPDATE serializa writers/CAS |
| article_paths | locale/slug PK composta,translation_id FK,kind current/redirect; UNIQUE parcial current por tradução; trigger diferida garante correspondência com slug/locale |
| article_slug_redirects | VIEW de article_paths kind=redirect, sem segunda persistência de aliases |

NOT NULL salvo nullable descrito. Checks de comprimento/status/posição/minutos espelham invariantes simples. Trigger diferida Article/source translation cobre criação do pai/remoção da origem ao commit. FKs editoriais RESTRICT evitam deletes físicos acidentais. SQLSTATE23505 é mapeado por nome de constraint: conexão/timeout→unavailable; bug/constraint inesperada→erro interno auditável. Não tratar todo SQL como conflito.

<!-- navigation:anchor:start -->
<a id="nav-section-010"></a>
<!-- navigation:anchor:end -->

### Ports e resultados — E04/E07

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

`PublicationStore.applyEdition({expectedRevision,edition,operator})` retorna `{revision,changed,createdIds,updatedIds,unchangedIds,visibilityChanges,redirects,warnings}`. `planEdition` retorna diff+baseRevision sem DML. publish/unpublish/archive/restore usam o mesmo store/transação/CAS. Publicação em lote chama a política pura por tradução e não N transações independentes.

`ArticleReader.getBySlug` retorna `{kind:'found',article:ArticleDetail}`, `{kind:'redirect',locale,slug}` ou null; aliases privados são null. list/listTags/listSeries/getSeries recebem escalares allowlistados. exportSnapshot lê conteúdo e revision na mesma transação. FKs/constraints não substituem autorização de operador/ator.

<!-- navigation:anchor:start -->
<a id="nav-section-011"></a>
<!-- navigation:anchor:end -->

### DTOs públicos — E08/E09/E10

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| DTO | Campos |
| --- | --- |
| ArticleSummary | articleId,translationId,locale,slug,title,description,difficulty,publishedAt,updatedAt,readingMinutes,author:{id,displayName,profileSlug,avatarPath?},tags:[{id,key,name,slug}],series:[{id,slug,title,position}],canonical |
| ArticleDetail | Summary + bodyMarkdown,author.bio/links públicos,seo:{title,description,socialImagePath?,imageAlt?},alternates:[{locale,slug,url}]. Defasagem/revisão traduzida são diagnóstico editorial privado, não campo público obrigatório |
| Page | data:Summary[],pagination:{page,limit,total,totalPages}; totalPages=ceil(total/limit),zero se total0; nenhum placeholder/category |
| TagSummary | id,key,locale,name,slug,description?,articleCount,canonical; tags traduzidas com conteúdo público |
| SeriesSummary | id,locale,slug,title,description,difficulty?,articleCount,canonical |
| SeriesDetail | Summary + prerequisitesText?,hasTranslationGaps,members:[{position,article:ArticleSummary,previousArticleId?,nextArticleId?}] |
| Error | {error:{code,message,fields?:[{path,code,message}]},requestId}; sem valores sensíveis/SQL/stack; code é contrato de tradução no cliente |
| Snapshot | schemaVersion,revision,generatedAt,siteOrigin,articles:ArticleDetail[],tags,series,redirects:[{from,to,status:308}],urlCatalog:[{url,kind,locale,lastmod,alternates}] |

API não contém status draft,audit,email privado,token hash,ORM metadata,operator ou sessão em rotas editoriais. Snapshot não contém comunidade. Frontend valida contrato sem importar models backend. **[REGRA INFERIDA] Slugs de Tag/Series tornam-se imutáveis após publicação no P0**, pois a arquitetura não define histórico deles: mudança rejeita TAXONOMY_SLUG_IMMUTABLE; se houver necessidade real, estender namespace/redirect e testes antes de permitir, preservando URLs. Teste [E07-I05](./BACKEND_TEST_PLAN.md#e07-i05) cobre rejeição e URL antiga preservada; aplicação no import [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente) (extensão [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace)).

<!-- navigation:anchor:start -->
<a id="nav-section-012"></a>
<!-- navigation:anchor:end -->

### Contratos comunitários — E13–E20

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Capacidade | Contrato |
| --- | --- |
| SessionStore | create(hash,userId,dates,csrfSecret),resolve(hash,now) junta User atual,touch granular,revoke/revokeAll/cleanup; token puro nunca persiste |
| OAuthIdentityProvider | exchange({code,verifier,redirectUri fixo})→{provider:'github',providerUserId:string,displayName}; token externo só temporário no adapter |
| Actor | {userId,role,status,authenticatedAt,sessionId/hash interno}; construído por sessão, não payload; casos não recebem Request |
| Comment input | create {bodyMarkdown}; edit {bodyMarkdown,expectedVersion}; moderate {status,reason,expectedVersion}; não aceitar autor/status no create/edit |
| Comment público | {id,translationId,author:{id?,displayName},bodyMarkdown,renderedHtml,createdAt,updatedAt,edited,version}; renderedHtml só saída sanitizada allowlist do adapter, nunca conteúdo cru executável |
| Comment privado | Público + status; motivo de auditoria só moderador. Listas me/moderação no-store |
| Cursor | base64url JSON {createdAt ISO,id UUID,translationId UUID},<=512 chars, escopo validado; não autoriza recurso, filtro/ownership reaplicados |
| LikeStore | ensurePresent/ensureAbsent({articleId,actorId}) revalida ator/visibilidade na transação; affected boolean interno, HTTP204 constante |
| ViewRecorder | record({translationId,identityKind,identityId,now,metricVersion})→void; HMAC/dedupe/upsert no adapter; no-identity não chama store |
| AccountLifecycleStore | prepareDeletion→requestId; finalizeDeletion idempotente; requestExport→requestId; exportForRequest allowlist; reapplyDeletionLedger no restore |

Ordem de lock P1: user → article → translation → comment/like/report → agregado/auditoria, omitindo alvos não necessários. Archive editorial trava article antes de translation; não trava user. Gestão/exclusão trava user primeiro. Revalidar visibilidade e ator na mesma transação. Operação anterior pode completar antes de archive/block; depois do commit nenhum novo write inelegível entra. Testes de concorrência usam barreiras controladas, não sleeps aleatórios.

CSRF em todas mutações de sessão, inclusive reports/progresso/export/delete. Views anônimas/consent exigem Origin/JSON/limiter e não sessão. **Decisão: com cookie de sessão presente, POST views exige sessão válida e CSRF; não cai silenciosamente para identidade anônima.** Browser obtém token privado. Login start/callback usam state/binding próprios.

Rotas adicionais necessárias: GET /me/article-likes, GET /me/comments, GET /moderation/comments, GET /moderation/reports, PATCH /moderation/reports/:id, POST /views/consent. [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)–[E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)/OpenAPI as implementam; não são CRUD genérico. Bootstrap/block/roles são CLI protegida P1. Exclusão202 com job persistido; depois cookie revogado retorna401 para repetição HTTP, mas job requestId é idempotente. Respostas privadas nunca cacheadas.

<!-- navigation:anchor:start -->
<a id="nav-section-013"></a>
<!-- navigation:anchor:end -->

### Comandos operacionais esperados ao fim de P0

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

Comandos abaixo são o contrato a implementar, não comandos já disponíveis hoje. Rodar a partir de backend; parser rejeita argumentos desconhecidos, saída JSON nunca imprime segredo.

| Comando | Contrato operacional |
| --- | --- |
| npm run dev | Conveniência do host: iniciar PostgreSQL local e executar dev:api. Container usa só dev:api |
| npm run build / npm start | Compilar src/scripts/migrations necessários e executar node dist/src/main.js; não usar tsx em runtime final |
| npm run migrate / npm run migrate:status | Credencial migrator, DB explícito pela config, lock/checksum; status não altera schema |
| npm run content:validate -- --root ../content --format json | Offline: schema, AST, relações/links; erro com arquivo/campo. Não requer DB |
| npm run content:import -- --root ../content --expected-revision REV --operator-id ID --dry-run | Diff sem DML sobre revisão de DB; após revisão, omitir --dry-run para commit. Primeiro banco vazio permite --expected-revision empty como sentinela exclusiva |
| npm run content:publish -- --article-id UUID --locale pt-BR --expected-revision REV --operator-id ID | Publicar tradução validada; metadados aprovados já no conteúdo importado |
| npm run content:unpublish -- --article-id UUID --locale pt-BR --target-state draft --reason MOTIVO --expected-revision REV --operator-id ID | target-state permite draft ou archived; mudança gera edição/operação e exige sincronizar Git |
| npm run content:archive -- --article-id UUID --reason MOTIVO --expected-revision REV --operator-id ID | Arquivar pai e todas exposições; sem delete físico |
| npm run content:restore -- --article-id UUID --reason MOTIVO --expected-revision REV --operator-id ID | Restaurar pai; --locale adicionada significa restaurar tradução para draft. Dry-run lista reexposições e é obrigatório antes de restore de pai |
| npm run content:export -- --output ../frontend/generated/published-content.json | Snapshot público completo, escrita atômica; destino gerado fica fora de fonte editável e é ignorado no Git |
| npm run seed:local | Fixture determinística através de ImportContent; disponível desde [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente), recusada em production antes de abrir DB |
| npm run test:unit / test:integration / test:api | Descoberta real em tests; suite esperada vazia falha; DB de teste explicitamente isolado |

O parâmetro operator-id é atribuição de auditoria, não autenticação: a autorização vem do acesso ao CLI/credencial/job protegido. GitHub Actions de PR não possui esse acesso. Em migrations P2 condicionais, numeração identifica ordem relativa; não exigir sequência numérica sem lacunas quando opção anterior foi adiada, nem criar migration vazia para preencher número.

<!-- navigation:anchor:start -->
<a id="nav-section-014"></a>
<!-- navigation:anchor:end -->

### Resumo dos parâmetros adotados

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

- Zod nas bordas, parser YAML limitado e AST Markdown; versões compatíveis fixadas no lockfile durante implementação. node:test/tsx e Supertest seguem decisão do plano.
- HTTP16KiB/query2KiB/q100/page1,20,max50; import512KiB/arquivo,10MiB/lote. Limites técnicos, não regras legais.
- Cache HTTP editorial60s/stats30s; privado no-store; P1 limites PostgreSQL; nenhum Redis obrigatório ou estado essencial só em memória.
- Pré-moderação e CAS expectedVersion; delete apaga body imediatamente. Prazos de retention são propostas operacionais a validar antes da coleta.
- Conta local, replies/progresso, full-text, painel/ativação, export automático e escala só em P2. Sem newsletter/notificações/recomendação IA/Category/Project/Language/microserviços inventados para preencher fase.

<!-- navigation:anchor:start -->
<a id="nav-section-015"></a>
<!-- navigation:anchor:end -->

## Para publicar — P0

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="e01"></a>

### E01. Tornar executáveis os comandos e preservar a base existente

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E01](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) · [Testes E01](./BACKEND_TEST_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** inventário atual; nenhuma etapa anterior.

#### Objetivo

Entregar um ciclo local e de CI que execute JavaScript compilado e testes reais, sem reconstruir a infraestrutura já corrigida.

#### Estado atual

TypeScript strict, build, typecheck, lockfile e separação dev/runtime já existem. Typecheck e build passaram em 09/09/2026; npm test aponta para test/redact-sensitive.test.ts ausente (test/ está vazio). node dist/src/index.js falha com MODULE_NOT_FOUND para @shared. .gitignore e .dockerignore já excluem ambientes/dependências; docs/ está ignorado pela raiz. Não há .env.example nem start/migrate/seed/lint. Não reinstalar DI/UoW já removidos.

#### Regra de negócio e restrições

[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel).

- **[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) — Instalação, credenciais e artefato reproduzível:** Segredos não entram no Git/contexto/imagem/frontend; dependências são instaladas por lockfile e produção executa JS compilado com usuário não root. Correções já presentes são mantidas. Não expor socket Docker, .env ou VITE_* com secrets. Não usar teste vazio como sucesso.

#### Decisão arquitetural

Manter CommonJS, TypeScript strict, Express e Sequelize existentes. Usar imports relativos nos arquivos mantidos/movidos; nenhum resolvedor de alias de desenvolvimento no runtime. Escolha de testes: node:test executado por tsx; Supertest para HTTP. Validador nas bordas: Zod. YAML/Markdown por parsers de dados/AST, sem execução. Versões exatas serão fixadas no lockfile após verificar compatibilidade no ambiente de implementação; este plano não certifica suporte das versões do registry.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [ALTERAR] | backend/package.json | Scripts executáveis, engines, runner e dependências diretamente usadas. |
| [ALTERAR] | backend/package-lock.json | Lockfile coerente com a instalação reproduzível. |
| [ALTERAR] | backend/tsconfig.json | Build sem aliases irresolúveis, strict preservado e escopo explícito de fontes/scripts. |
| [CRIAR] | backend/eslint.config.mjs | Lint e restrições de dependência por camada. |
| [CRIAR] | backend/scripts/test.mjs | Descobrir e executar suites Node com propagação do exit code. |
| [CRIAR] | backend/.env.example | Contrato de configuração local sem credenciais externas. |
| [CRIAR] | backend/.node-version | Versão Node compartilhada com imagem/CI. |
| [ALTERAR] | .gitignore | Manter proteção existente e permitir docs/. |
| [EXISTENTE] | backend/.gitignore | Ignorar ambientes, dependências e artefatos locais. |
| [EXISTENTE] | backend/.dockerignore | Excluir secrets e artefatos do contexto. |
| [EXISTENTE] | backend/src/infrastructures/logger/redact-sensitive.ts | Redação recursiva existente, preservada ao ajustar imports dos consumidores. |
| [ALTERAR] | backend/src/index.ts | Trocar imports com aliases até migração em [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Corrigir o alvo de teste e criar os testes de regressão da redação existente. Configurar descoberta em tests/unit, tests/integration e tests/api por runner Node que enumera arquivos, sem depender de glob expandido pelo shell Windows.
2. Remover aliases de imports ativos e paths que não terão consumidores. Enquanto a entrada é src/index.ts, start aponta para dist/src/index.js; em [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) evolui para main. Não apagar a correção de baseUrl já realizada.
3. Acrescentar lint com regras de fronteira: domain não importa Node/Express/ORM/env; application só domínio/ports/tipos sem transporte. Adaptadores não importam HTTP de outros módulos. CI passa a chamar lint, typecheck, testes e build. Scripts de DB só entram em [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), sem comandos fictícios que retornem sucesso.
4. Criar .env.example com valores apenas locais; manter ignores existentes. Retirar /docs do ignore da raiz para os documentos serem versionáveis. Índice atual não contém .env.dev e a consulta de histórico disponível não retornou commits desse caminho; não declarar segredo exposto sem evidência. Antes do release revisar histórico/remotos disponíveis por ferramenta que reporte caminhos/tipos, sem imprimir valores; rotação só se exposição confirmada.
5. Node local observado: 22.19.0; Docker dev usa major 22. Fixar a mesma versão suportada e compatível em engine/arquivo de versão/CI/Docker durante a execução; instalação reproduzível via npm ci. Não trocar ORM por preferência.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Node e dependências locais; subprocessos em diretório temporário, configuração fictícia; nenhum DB real necessário para regressão de redação.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E01-U01](./BACKEND_TEST_PLAN.md#e01-u01): RedactSensitive: objeto/array com token, Authorization, cookie, senha, PEM e URL com code produz [REDACTED]; Date serializa ISO; referência circular termina; dados comuns preservados. Sem mocks, sem conteúdo real de .env.
- [E01-U02](./BACKEND_TEST_PLAN.md#e01-u02): Runner: diretório sem testes falha em vez de aprovar suite vazia; teste intencionalmente falho em fixture temporária propaga exit code.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E01-I01](./BACKEND_TEST_PLAN.md#e01-i01): Subprocesso: npm run build seguido de node no artefato não pode gerar MODULE_NOT_FOUND; configurar banco inacessível controlado e esperar erro de dependência/exit não zero, nunca sucesso de startup.
- [E01-I02](./BACKEND_TEST_PLAN.md#e01-i02): Instalação npm ci em checkout limpo e lint/typecheck/test:unit/build; validar que arquivos .env.* não entram no contexto e docs não é mais ignorado. Não executar npm audit fix automaticamente.

Arquivos de teste a criar:

- `backend/tests/unit/e01-tooling.test.ts` — Cenários [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-U de regras e erros de Tornar executáveis os comandos e preservar a base existente.
- `backend/tests/integration/e01-tooling.test.ts` — Cenários [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-I das fronteiras reais e persistência/operação de Tornar executáveis os comandos e preservar a base existente.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E01](./BACKEND_TEST_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar).

#### Critério de aceite

Scripts documentados existem e falham corretamente; testes reais executam; nenhum alias não resolvido no JS; arquivos sensíveis não rastreados; nenhuma reconstrução de funcionalidades já corretas. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e02"></a>

### E02. Separar composição, HTTP, configuração e ciclo de vida

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E02](./BACKEND_IMPLEMENTATION_ORDER.md#02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) · [Testes E02](./BACKEND_TEST_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).

#### Objetivo

Evoluir os componentes existentes para a árvore definida, montar app testável sem abrir porta e tornar falhas/encerramento previsíveis.

#### Estado atual

Server já monta CORS/Helmet/requestId/health e conecta antes de listen; Database propaga falhas; fatal handlers têm timeout de 10s; logger já escreve JSON em stdout com timestamp por evento; ApplicationError já é semântico. Faltam SIGTERM/SIGINT, espera de listening/error, configuração validada, readiness de shutdown, limites seguros e DTO de erro arquitetural. CORS roda antes do contexto, requestId só valida comprimento e originalUrl vaza query ao log.

#### Regra de negócio e restrições

[R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos), [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo).

- **[R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos) — Disponibilidade e encerramento honestos:** Live mede processo; ready mede banco com prazo e estado de encerramento. Conectar antes de escutar; erro fatal encerra; sinais drenam com timeout. Ready não expõe ambiente/owners e não fica UP durante shutdown. Deadline 1s health e 10s shutdown são parâmetros técnicos.
- **[R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo) — Entrada estrita, erro estável e log mínimo:** Toda borda valida formato/tamanho; erro público contém code/message/fields seguros e requestId validado. Log é JSON com rota normalizada/status/duração, sem query/body/credenciais. UUID substitui requestId fora do formato; logger não bloqueia resposta; headersSent usa next. Limites e allowlists em [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)/[E09](#e09-expor-api-rest-documentada-e-cache-http-simples).

#### Decisão arquitetural

Mover implementação, não criar segundo servidor/logger. main é o único dono de process handlers/listener; composition constrói dependências. Domínio/aplicação recebem configuração tipada mínima; ALS fica restrito a log. Manter ApplicationError existente e ampliar kinds.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/main.ts | Dono do processo e do listener; startup, sinais e encerramento. |
| [CRIAR] | backend/src/composition.ts | Composição manual única de adapters e casos de uso. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/config/env.ts | Validação tipada do ambiente e carga local controlada. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/app.ts | Express sem listen e ordem de middlewares. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/health.routes.ts | Liveness/readiness de custo limitado. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/cors.ts | Allowlist existente parametrizada por Config. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/request-context.ts | IDs seguros e contexto sem query. |
| [CRIAR] | backend/src/http/request-log.ts | Log final de cada request com duração e rota normalizada. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/error-handler.ts | Envelope público, mapeamento de parser e proteção de headersSent. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/http/error-status.ts | Mapear kinds semânticos para status. |
| [ALTERAR] | backend/src/shared/errors/application.error.ts | Acrescentar kinds/fields sem importar HTTP. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logger.ts | Reutilizar escrita JSON/stdout e injetar service. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logging/formatter.ts | Formato existente com campos permitidos. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logging/redact-sensitive.ts | Preservar algoritmo testado; retirar promessa de log irrestrito. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logging/request-context.ts | ALS exclusivo de observabilidade. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logging/logger.interface.ts | Contrato existente de logger; unknown em vez de any. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/logging/logger.context.ts | Contexto de origem do evento de log. |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/process-handlers.ts | Reutilizar fatal shutdown, registrar também sinais e permitir cleanup dos handlers em teste. |
| [ALTERAR] | backend/package.json | start passa a node dist/src/main.js; dev:api executa tsx watch src/main.ts. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. createApp({readiness,logger,config,routes}) retorna Express sem listen, sem ler env ou instalar handlers globais. main chama loadConfig, composition, connect, aguarda listening ou error; qualquer falha fecha pool e termina com código 1. SIGINT/SIGTERM sinalizam stopping antes de drenar, fecham listener e pool com limite de 10s; saída normal 0. Preservar saída fatal 1 e timer existentes, inclusive quando logger falhar.
2. loadConfig(env) devolve objeto imutável: NODE_ENV=dev|test|production (manter dev existente), PORT inteiro 1..65535, DB_HOST/NAME/USERNAME/PASSWORD obrigatórios, DB_PORT, dialect fixo postgres, poolMax=5, acquireMs=5000, statementTimeoutMs=3000, PUBLIC_SITE_URL absoluto; HTTPS obrigatório em production; CORS_ORIGINS URLs exatas sem path; TRUST_PROXY vazio/false ou lista de redes do proxy documentado. Nunca aceitar true irrestrito. Arquivo .env só em dev/test, resolvido pela raiz como hoje, quiet e sem log de valores. Produção só ambiente injetado. Rejeitar SYNC=true e remover sync de todos ambientes em [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations).
3. Ordem: request-context → log de término → Helmet → CORS → parsers por rota → routes → 404 JSON → error handler. requestId/traceId aceitam ^[A-Za-z0-9._-]{1,128}$, caso contrário UUID novo; nunca reutilizar header sem validar no fallback. Log: rota template ou unmatched, método, status, durationMs, errorCode; sem query/body/cookies/PII. Redação existente é defesa adicional; corrigir comentário que promete segurança para payload arbitrário.
4. Reutilizar CORS allowlist e X-Request-Id exposto; rejeição gera 403 ORIGIN_NOT_ALLOWED sem eco de origem. Leitura por cliente sem Origin continua permitida. JSON limite padrão de mutação 16 KiB; P0 leitura não precisa parser de body; negar tipos não suportados com 415 e tamanho 413; retirar urlencoded global. Limitar query a 2 KiB; [E09](#e09-expor-api-rest-documentada-e-cache-http-simples) valida campos.
5. Mover health atual para GET /health/live → 200 {status:'UP'} independente do DB; /health/ready → 200/503 {status:'UP'|'DOWN'} com deadline 1s e consulta limitada no driver, sem empilhar consultas após timeout. Durante shutdown sempre 503. Não expor environment, nomes internos ou stack. As rotas antigas /api/ e /api/health não são contrato publicado; substituir e atualizar consumers.
6. Erro padronizado {error:{code,message,fields?},requestId}. Preservar 400 JSON inválido, 413, headersSent→next e falha de log não bloqueando resposta. Acrescentar business-rule→422, unavailable→503, rate-limited→429; manter 401/403/404/409 existentes. Desconhecido→500 INTERNAL_ERROR; falha conhecida de DB indisponível→503 DEPENDENCY_UNAVAILABLE. fields só paths/mensagens seguras.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Supertest/createApp com health fake para unidade; PostgreSQL16 e subprocesso para lifecycle real, porta efêmera e clock/limites controlados.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E02-U01](./BACKEND_TEST_PLAN.md#e02-u01): Config com PORT NaN/0, ambiente inválido, SYNC=true, URL HTTP em produção ou proxy true falha sem incluir secrets; dev válido normaliza allowlist.
- [E02-U02](./BACKEND_TEST_PLAN.md#e02-u02): Clock/logger fake: request concorrente mantém correlação própria; header com espaços/Unicode/129 chars é substituído; logs nunca contêm query, cookie ou corpo.
- [E02-U03](./BACKEND_TEST_PLAN.md#e02-u03): Mapper cobre todos kinds, headersSent chama next uma vez; logger rejeita e cliente ainda recebe envelope.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E02-I01](./BACKEND_TEST_PLAN.md#e02-i01): Supertest app isolado: liveness 200 com DB fake indisponível; readiness 503 por timeout/shutdown; erro CORS tem requestId; JSON inválido 400, 16KiB+1 413 e Content-Type inválido 415 em rota fixture de mutação.
- [E02-I02](./BACKEND_TEST_PLAN.md#e02-i02): Subprocesso com PostgreSQL de teste: sinal SIGTERM drena request em curso e fecha pool; porta ocupada e falha de conexão encerram com 1; erro fatal nunca deixa listener vivo. Testar timer com shutdown que não resolve.

**API/contrato/autorização na borda:**

- [E02-A01](./BACKEND_TEST_PLAN.md#e02-a01): GET live/ready responde mínimo200/503, sem env; CORS rejeitado possui requestId e403; route fixture JSON inválido400/tamanho413/tipo415.
- [E02-A02](./BACKEND_TEST_PLAN.md#e02-a02): Endpoint fixture throws ApplicationError→envelope; desconhecido500 sem stack; headersSent não tenta segundo JSON; limite de requestId substitui inválido.

Arquivos de teste a criar:

- `backend/tests/unit/e02-http-lifecycle.test.ts` — Cenários [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-U de regras e erros de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/integration/e02-http-lifecycle.test.ts` — Cenários [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-I das fronteiras reais e persistência/operação de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/api/e02-http-lifecycle.test.ts` — Cenários [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-A de endpoints/status/DTO/auth de Separar composição, HTTP, configuração e ciclo de vida.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E02](./BACKEND_TEST_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida--para-publicar).

#### Critério de aceite

App é importável sem efeitos globais; nenhuma duplicação da infraestrutura movida; ready muda antes da drenagem; erros/logs obedecem contrato e nenhum segredo aparece. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e03"></a>

### E03. Conexão PostgreSQL e executor de migrations

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E03](./BACKEND_IMPLEMENTATION_ORDER.md#03-conex%C3%A3o-postgresql-e-executor-de-migrations) · [Testes E03](./BACKEND_TEST_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

#### Objetivo

Preservar a conexão funcional e acrescentar schema versionado, privilégios separados e ambiente real de testes.

#### Estado atual

Database já autentica, fecha conexão e propaga erros. Usa env direto e sequelize-typescript sem models; SYNC=true ainda chama sync. Hooks repetidos e UoW legado já foram removidos. Nenhuma migration/seed existe.

#### Regra de negócio e restrições

[R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita).

- **[R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita) — Schema versionado e transação explícita:** Migration aplicada uma vez com versão/checksum; app não executa sync ou DDL. Persistência e testes usam PostgreSQL da major alvo. Operações atômicas compartilham a mesma conexão/transação. Não editar versão aplicada; não testar constraint com SQLite/mock. Migrations P1/P2 não antecipadas no P0.

#### Decisão arquitetural

Sequelize 6 como único adapter de acesso ao PostgreSQL. SQL parametrizado através da mesma instância Sequelize é permitido para constraints/queries específicas; não criar outro pool pg. Models definidos por init/define, sem decorators novos. Transação explícita em cada operação de escrita.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [ALTERAR — MOVER/REUTILIZAR] | backend/src/infrastructure/database.ts | Conexão única, pool/timeouts e nenhuma criação automática de schema. |
| [CRIAR] | backend/scripts/migrate.ts | Executar/consultar migrations versionadas com lock/checksum e credencial operacional. |
| [CRIAR] | backend/migrations/runner.ts | Contrato Migration up(sequelize,transaction), controle e atomicidade sem aparecer no domínio. |
| [CRIAR] | backend/compose.test.yaml | PostgreSQL 16 isolado para testes. |
| [CRIAR] | backend/tests/support/database.ts | Preparar DB seguro, migrar e limpar apenas namespace de teste. |
| [CRIAR] | backend/tests/support/app.ts | Montar composição de teste sem serviços externos. |
| [ALTERAR] | backend/package.json | Scripts migrate, migrate:status, test:integration/test:api e dependências ORM usadas. |
| [ALTERAR] | backend/.env.example | Pool/timeouts e instruções para credenciais distintas, sem segredo de produção. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Database(config,logger) recebe dados validados, logging SQL desligado, pool limitado; connect não altera schema. Remover sync inteiramente. close/disconnect idempotente e checkReady com timeout do servidor/driver. Usar Sequelize diretamente; remover sequelize-typescript/decorator/pg-hstore só após busca de consumidores provar ausência e build passar.
2. scripts/migrate.ts descobre migrations compiladas ordenadas; tabela schema_migrations(version text PK,checksum text,applied_at timestamptz). Adquirir lock advisory de migrations em conexão dedicada enquanto executa; cada migration aplica DDL e registro na mesma transação. Uma segunda execução espera com timeout e falha claramente se excedido. Checksum diferente em migration aplicada falha. Não editar migration já lançada.
3. npm run migrate usa credencial própria do migrator; app só DML nas tabelas necessárias. Ausência de migrations em bootstrap [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) cria apenas controle; [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) adiciona editorial. migrate:status só leitura. seed:local entra [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), rejeita NODE_ENV=production por design; import editorial de produção é outro comando.
4. Compose de teste PostgreSQL major 16, mesmo major do alvo inicial local; DB de nome blog_test_* e credencial exclusiva. Helpers validam NODE_ENV=test e nome antes de reset; nunca usar DB_NAME normal como fallback. Migrations reais, não sync. Preparar conexão administrativa apenas para setup isolado de testes.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 isolado blog_test_migrations, credenciais app/migrator separadas, banco vazio e fixtures de migration deliberadamente falhas.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E03-U01](./BACKEND_TEST_PLAN.md#e03-u01): Runner com adapter stub: ordem, checksum, falha interrompe próximas migrations; Database fake confirma connect sem sync. Guard de testes recusa nome de produção antes de abrir conexão.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E03-I01](./BACKEND_TEST_PLAN.md#e03-i01): PostgreSQL vazio: executar runner duas vezes deixa uma linha por versão; dois migrators concorrentes não aplicam DDL duas vezes; migration fixture com falha deixa schema e controle no estado anterior.
- [E03-I02](./BACKEND_TEST_PLAN.md#e03-i02): Role de app lê/escreve tabela permitida e falha em CREATE/ALTER; saturação do pool retorna erro limitado e não deixa processo preso.

Arquivos de teste a criar:

- `backend/tests/unit/e03-migrations.test.ts` — Cenários [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-U de regras e erros de Conexão PostgreSQL e executor de migrations.
- `backend/tests/integration/e03-migrations.test.ts` — Cenários [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I das fronteiras reais e persistência/operação de Conexão PostgreSQL e executor de migrations.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E03](./BACKEND_TEST_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations--para-publicar).

#### Critério de aceite

Migration idempotente operacionalmente e atômica por versão; app nunca faz DDL; banco de teste real isolado e falha de migration bloqueia startup no Compose futuro. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e04"></a>

### E04. Definir domínio editorial e contratos de aplicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E04](./BACKEND_IMPLEMENTATION_ORDER.md#04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) · [Testes E04](./BACKEND_TEST_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

#### Objetivo

Codificar invariantes de identidade, tradução, publicação, séries e leitura antes de persistência e entrada externa.

#### Estado atual

Não há domínio, casos de uso ou DTOs de blog. BaseModelType usa id:number e o helper genérico expõe Order Sequelize/limites até 500; não atendem UUID/port sem ORM e não serão reutilizados nas capacidades editoriais.

#### Regra de negócio e restrições

[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura).

- **[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis) — Identidade do artigo e traduções estáveis:** Article compartilha autor/tags/dificuldade/séries entre idiomas; tradução possui UUID próprio e conteúdo/status/datas/slug locais. Todo artigo nasce com tradução sourceLocale na mesma transação. UUID não derivado de título/slug; sourceLocale precisa de tradução; locales iniciais pt-BR/en, texto extensível sem enum SQL fechado.
- **[R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es) — Estados, primeira publicação e revisões:** Tradução draft/published/archived publica independentemente quando revisada e válida. Preservar primeira publishedAt ao corrigir ou republicar; updatedAt muda só em alteração editorial. Revisão original diferente da traduzida gera aviso editorial, sem despublicar automaticamente. Pai arquivado impede publicar; título/corpo/metadata válidos; data futura não agenda. Restore archived→draft é explícito.
- **[R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) — Série localizada e navegação pela lista visível:** Série global e apresentação localizada devem estar publicadas. Membros N:N têm posição positiva única por série. Listagem, count e anterior/próximo usam apenas traduções publicadas de artigos ativos no locale. Membro não repetido; múltiplas séries permitidas; contexto não muda canonical.
- **[R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura) — Dificuldade e estimativa de leitura:** Dificuldade editorial foundational/intermediate/advanced é compartilhada entre idiomas e independente do tempo. Leitura estimada usa texto extraído do AST e 200 palavras/minuto, mínimo 1. Não inferir nível de duração ou tamanho. foundational pressupõe introdução, intermediate familiaridade com fundamentos, advanced aprofundamento com pré-requisitos explícitos.

#### Decisão arquitetural

Funções puras e tipos readonly em domain; application define inputs/outputs e ports. Usar UUID string validada na borda, datas UTC em DTO e relógio injetado para regras temporais. Sem BaseRepository, bus, DI decorators ou UoW.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/domain/article.ts | Tipos e invariantes de Article/Translation/locale/difficulty. |
| [CRIAR] | backend/src/modules/publishing/domain/publication-policy.ts | Transições, visibilidade, revisão e publicação pura. |
| [CRIAR] | backend/src/modules/publishing/domain/series.ts | Ordem/membros únicos e navegação localizada. |
| [CRIAR] | backend/src/modules/publishing/domain/reading-time.ts | Contagem determinística sobre texto extraído. |
| [CRIAR] | backend/src/modules/publishing/application/content.dto.ts | EditionInput, Operator, ImportResult e projections públicas explícitas. |
| [CRIAR] | backend/src/modules/publishing/application/publishing.errors.ts | Erros concretos semânticos de conflito/visibilidade/validação. |
| [CRIAR] | backend/src/modules/publishing/application/ports/publication-store.ts | Capacidade de escrita editorial atômica, sem tipos Sequelize. |
| [CRIAR] | backend/src/modules/publishing/application/ports/article-reader.ts | Consultas específicas e snapshot público. |
| [EXISTENTE] | backend/src/shared/errors/application.error.ts | Base semântica ampliada em [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Article: id/sourceLocale/authorId/difficulty/createdAt/archivedAt; Translation: id/articleId/locale/slug/title/description/bodyMarkdown/status/publishedAt/updatedAt/sourceRevision/translatedFromRevision/readingMinutes/SEO. Estados draft|published|archived; série tem estado global e localizado. Documento de contratos abaixo fixa limites, datas e transições; implementar tabela de transições como função que devolve próxima revisão ou erro semântico, sem persistir.
2. publication-policy valida título/corpo não vazios, locale suportado, autor/tags/séries existentes no lote ou store, slug canônico, primeira data e mudança de visibilidade explícita. ArchiveArticle arquiva todas as exposições pelo pai; UnpublishTranslation é published→draft; archived pode voltar a draft por comando explícito. Import com arquivo omitido não exclui nada.
3. PublicationStore.applyEdition(input): Promise<ImportResult>; publish/unpublish/archive recebem expectedRevision e Operator {kind:'operator',id,sourceRevision}; retorno {revision,changed,changes}. Operador é criado exclusivamente pelo adapter CLI protegido, jamais por payload HTTP. validate/dryRun retornam diff sem escrita. O store revalida invariantes de concorrência dentro da transação; domínio não recebe Transaction.
4. ArticleReader: getBySlug({locale,slug}), list({locale,page,limit,tag?,series?,difficulty?,q?,sort}), listTags(locale), listSeries(locale), getSeries({locale,slug}), exportSnapshot(). Retornos DTO públicos ou null, sem model. ID compartilhado permite P1 referenciar artigo/tradução sem mudar identidade.
5. ReadingMinutes calcula max(1,ceil(palavrasVisiveis/200)) usando texto de AST (inclui texto de código, exclui sintaxe, URLs de destinos e frontmatter); AST parsing na borda e função pura de contagem. Não inferir dificuldade pelo tempo.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Só TypeScript/node:test, clock fixo e reader/store em memória tipados; teste de fronteira via lint. DB é validado nas etapas seguintes.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E04-U01](./BACKEND_TEST_PLAN.md#e04-u01): Matriz de transições: draft completo publica; falta título/corpo ou data futura falha; atualização preserva publishedAt; republicação preserva primeira data; original revisado sinaliza tradução defasada sem ocultá-la. now() fixo.
- [E04-U02](./BACKEND_TEST_PLAN.md#e04-u02): Série posições 1/3/8, tradução intermediária ausente: count=2 e anterior/próximo usam apenas visíveis; posição 0/duplicada e membro duplicado rejeitados.
- [E04-U03](./BACKEND_TEST_PLAN.md#e04-u03): Tempo: texto vazio gera mínimo 1 apenas para cálculo (publicação do vazio continua inválida); 200/201 palavras→1/2; fences preservados pelo extrator de [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E04-I01](./BACKEND_TEST_PLAN.md#e04-i01): Contrato em memória de aplicação: fake ArticleReader retorna null sem fallback; dependências de domínio não importam infraestrutura (lint/inspeção AST). Integração PostgreSQL desta regra ocorre em [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)/[E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) e é requisito dessas etapas.

Arquivos de teste a criar:

- `backend/tests/unit/e04-publishing-domain.test.ts` — Cenários [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-U de regras e erros de Definir domínio editorial e contratos de aplicação.
- `backend/tests/integration/e04-publishing-domain.test.ts` — Cenários [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Definir domínio editorial e contratos de aplicação.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E04](./BACKEND_TEST_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o--para-publicar).

#### Critério de aceite

Tipos/ports compilam sem Express, env e Sequelize; invariantes têm casos positivos/negativos; política de estado não depende de SQL e não duplica entidades entre idiomas. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e05"></a>

### E05. Criar schema editorial, constraints e namespace de slugs

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E05](./BACKEND_IMPLEMENTATION_ORDER.md#05-criar-schema-editorial-constraints-e-namespace-de-slugs) · [Testes E05](./BACKEND_TEST_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

#### Objetivo

Persistir o catálogo multilíngue e impedir corridas que validação em memória não resolve.

#### Estado atual

Nenhuma tabela/model de blog existe; nenhuma migration aplicada foi comprovada nesta auditoria.

#### Regra de negócio e restrições

[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace).

- **[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis) — Identidade do artigo e traduções estáveis:** Article compartilha autor/tags/dificuldade/séries entre idiomas; tradução possui UUID próprio e conteúdo/status/datas/slug locais. Todo artigo nasce com tradução sourceLocale na mesma transação. UUID não derivado de título/slug; sourceLocale precisa de tradução; locales iniciais pt-BR/en, texto extensível sem enum SQL fechado.
- **[R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) — Série localizada e navegação pela lista visível:** Série global e apresentação localizada devem estar publicadas. Membros N:N têm posição positiva única por série. Listagem, count e anterior/próximo usam apenas traduções publicadas de artigos ativos no locale. Membro não repetido; múltiplas séries permitidas; contexto não muda canonical.
- **[R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace) — Slugs e aliases disputam o mesmo namespace:** Slug é segmento canônico e único por locale mesmo draft. Mudança após publicação preserva alias; unicidade inclui aliases e caminhos atuais transacionalmente. Não reutilizar alias de outra tradução; resolver alias privado dá 404; fonte P0 é article_paths com PK(locale,slug).

#### Decisão arquitetural

Modelo conceitual da seção 5 da arquitetura, com nomes snake_case no banco e DTO camelCase. Não criar User/likes/comments antes de P1. ArticleSlugRedirect nasce junto da capacidade de alterar slug publicado; namespace transacional compartilhado evita conflito entre alias e slug atual.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/001-editorial.ts | DDL editorial, integridade, índices e controle de revisão. |
| [CRIAR] | backend/migrations/002-editorial-paths.ts | Namespace único de slugs/redirects e consistência diferida. |
| [CRIAR] | backend/src/modules/publishing/adapters/postgres/models.ts | Definições Sequelize explícitas, registro único e mapeamento snake_case. |
| [ALTERAR] | backend/src/composition.ts | Registrar models e criar adapters com a instância única. |
| [EXISTENTE] | backend/src/infrastructure/database.ts | Conexão e transações já preparadas em [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations). |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 001-editorial cria author_profiles, articles, article_translations, tags, tag_translations, article_tags, series, series_translations, series_articles e publication_editions/current revision. Colunas/constraints no contrato de banco abaixo são obrigatórias. Todos IDs editoriais UUID fornecidos pelo manifesto, sem sequência number. Model registrations acontecem uma vez na composition de banco.
2. Migration 002-editorial-paths cria article_paths(locale,slug PK composta, translation_id FK,kind current|redirect). Exigir UNIQUE parcial translation_id WHERE kind=current; article_slug_redirects pode ser VIEW das linhas kind=redirect, preservando o conceito ArticleSlugRedirect sem duas autoridades de unicidade. Cada tradução reserva caminho mesmo draft. Em mudança de slug, linha antiga vira redirect se já publicada; se nunca publicada, remover reserva antiga. Inserir atual novo na mesma transação e apontar aliases diretamente para translationId, evitando cadeia. Consulta de alias só resolve se alvo está público. Migration inclui backfill e falha se conflito; duas tabelas de slug isoladas não bastam.
3. UNIQUE(article_id,locale), UNIQUE(locale,slug) em translation; CHECK position>0 e UNIQUE(series_id,position) DEFERRABLE INITIALLY DEFERRED, PK(series_id,article_id). As duas representações current path/slug só são escritas no adapter transacional; validar consistência ao fim por constraint trigger diferida na migration 002 (exatamente um current correspondente). Trigger diferida em articles/translations impede artigo sem tradução sourceLocale ao commit.
4. Índices de listagem publicados (locale,published_at DESC,id DESC) WHERE status='published'; filtrar pai não arquivado na query. Índices reversos por tag_id e article_id em series_articles; FKs consultadas indexadas. Não criar índice do corpo. Checks de status/difficulty, locale texto sem enum SQL fechado, published implica published_at não nulo, minutos>=1. FK autor RESTRICT; não permitir exclusão física editorial pela API/importador.
5. Publication edition guarda revision/hash/commit/actor/time/report sem corpo extra; current revision em linha singleton atualizada transacionalmente. Controle global de revisão serve CAS/serialização de imports, não event sourcing.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 vazio e snapshot após migration001; duas conexões dedicadas e barreiras para concorrência, autor/tags/series fixtures.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E05-U01](./BACKEND_TEST_PLAN.md#e05-u01): Validação de shape/model mapping: UUID/string e datas preservados; nenhum id:number do helper legado. Testes de invariantes puros reaproveitam [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o); não mockar unicidade SQL.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E05-I01](./BACKEND_TEST_PLAN.md#e05-i01): Banco vazio + 001/002: cadastrar artigo+origem em uma transação passa; artigo sem origem falha no commit; FK autor inexistente e published sem data falham.
- [E05-I02](./BACKEND_TEST_PLAN.md#e05-i02): Inserções simultâneas de mesmo locale/slug com IDs diferentes: uma vence, outra conflito; alias de A contra slug atual de B também conflita. Mesmo slug em locales diferentes passa.
- [E05-I03](./BACKEND_TEST_PLAN.md#e05-i03): Trocar posições 1 e 2 na mesma transação passa, duas posições iguais ao commit falham; rollback restaura ordem e caminhos. Migration de 001→002 com catálogo existente preserva UUID/revisões.

Arquivos de teste a criar:

- `backend/tests/unit/e05-editorial-schema.test.ts` — Cenários [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-U de regras e erros de Criar schema editorial, constraints e namespace de slugs.
- `backend/tests/integration/e05-editorial-schema.test.ts` — Cenários [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I das fronteiras reais e persistência/operação de Criar schema editorial, constraints e namespace de slugs.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E05](./BACKEND_TEST_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs--para-publicar).

#### Critério de aceite

DDL vazio e upgrade testados; corrida slug/alias e reordenação protegidas no DB; invariantes do estado persistido equivalem às de domínio; nenhuma tabela comunitária antecipada. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e06"></a>

### E06. Normalizar os oito textos e validar a fonte editorial

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E06](./BACKEND_IMPLEMENTATION_ORDER.md#06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) · [Testes E06](./BACKEND_TEST_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

#### Objetivo

Criar a fonte Git única, manifestos estáveis e validação offline, mantendo o conteúdo aprovado e a identidade dos pares.

#### Estado atual

Há quatro pares em frontend/artigo, importados por frontend/src/content/articles.ts. Os dois JS/TS e Node EN estão sem delimitadores YAML; há lang/language, slugs como /article/..., tags sinônimas e datas localizadas no TS. TSConfig e arquitetura têm delimitadores. Parser regex atual aplica defaults que podem mascarar texto ausente; não é importador de backend.

#### Regra de negócio e restrições

[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro).

- **[R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis) — Identidade do artigo e traduções estáveis:** Article compartilha autor/tags/dificuldade/séries entre idiomas; tradução possui UUID próprio e conteúdo/status/datas/slug locais. Todo artigo nasce com tradução sourceLocale na mesma transação. UUID não derivado de título/slug; sourceLocale precisa de tradução; locales iniciais pt-BR/en, texto extensível sem enum SQL fechado.
- **[R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura) — Dificuldade e estimativa de leitura:** Dificuldade editorial foundational/intermediate/advanced é compartilhada entre idiomas e independente do tempo. Leitura estimada usa texto extraído do AST e 200 palavras/minuto, mínimo 1. Não inferir nível de duração ou tamanho. foundational pressupõe introdução, intermediate familiaridade com fundamentos, advanced aprofundamento com pré-requisitos explícitos.
- **[R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita) — Git único, import idempotente e retirada explícita:** Git/Markdown é fonte editorial; DB é projeção. Import não sobrescreve contas/interações e não apaga arquivo omitido. Reimport da mesma revisão/hash é no-op; mudança CAS concorrente falha integralmente. Publicação CLI protegida; expectedRevision obrigatória fora do banco vazio; mesma revisão/hash diferente conflita; dryRun zero writes.
- **[R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro) — Catálogo real e Markdown seguro:** Importar quatro pares reais e duas séries com autoria revisada, tags canônicas e conteúdo preservado. YAML/Markdown/paths são dados não confiáveis; sem MDX, execução ou fetch remoto. UUID gravados; títulos H1 normalizados fora de fences; tags sinônimas mapeadas explicitamente; links internos públicos resolvidos. Limites 512KiB/arquivo,10MiB/lote são técnicos.

#### Decisão arquitetural

Filesystem/YAML/AST ficam no adapter CLI. ValidateContent recebe dados parseados, aplica domínio e verifica grafo do lote. Não buscar URLs remotas, executar MDX ou confiar em nome de arquivo como ID. Conteúdo é movido uma vez e frontend passa a consumir snapshot em [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | content/catalog.yaml | Manifesto editorial de IDs, autoria, tags/séries localizadas e relações. |
| [CRIAR] | content/legacy-map.json | Mapa permanente dos oito arquivos de origem para UUID/locales, sem gerar IDs a cada execução. |
| [ALTERAR — MOVER/REUTILIZAR] | content/articles/<articleId>/<locale>.md | Corpos/fontmatter normalizados; caminhos concretos são os UUID registrados uma vez no catálogo. |
| [CRIAR] | backend/src/modules/publishing/adapters/cli/content.schemas.ts | Schemas strict de manifesto/frontmatter e limites externos. |
| [CRIAR] | backend/src/modules/publishing/adapters/cli/content-parser.ts | Filesystem seguro, YAML limitado, AST Markdown e extração textual. |
| [CRIAR] | backend/src/modules/publishing/application/validate-content.ts | Validação de lote/grafo e diagnóstico por arquivo/campo. |
| [CRIAR] | backend/src/modules/publishing/adapters/cli/validate-content.ts | Comando offline sem DB ou credencial de produção. |
| [ALTERAR] | backend/package.json | content:validate e parsers/Zod nas categorias corretas; seed:local entra em [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente). |
| [EXISTENTE] | frontend/src/content/articles.ts | Referência do catálogo real durante migração; substituição do consumo em [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site). |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. content/catalog.yaml é autoridade para Article/Author/Tag/Series e associações; traduções em content/articles/<articleId>/<locale>.md contêm metadados localizados. Gerar UUID uma única vez, gravar no manifesto, jamais recalcular de slug/hash. content/legacy-map.json associa os oito caminhos antigos aos IDs/locales/novos slugs para revisão e eventual redirects. Não misturar metadata compartilhada repetida em cada tradução.
2. Quatro pares: js-ts-demystified (fundacional), ts-config-explanation (fundacional), nodejs-por-baixo-do-framework (fundacional), backend-architecture-ts-node-foundation (intermediário). Trilha TypeScript: JS/TS posição 1, TSConfig posição 2. Trilha Base TS/Node: Node posição 1, arquitetura posição 2. Ordem é decisão editorial adotada do frontend/roadmap, revisada junto dos textos. sourceLocale=pt-BR [REGRA INFERIDA] para esses pares; autor público é o mantenedor identificado por metadado revisado, sem inventar nome/email/bio.
3. Slugs de destino: PT javascript-typescript-sem-misterio, tsconfig-sem-misterio, nodejs-por-baixo-do-framework, arquitetura-backend-base-ts-node; EN javascript-typescript-demystified, tsconfig-demystified, nodejs-under-the-framework, backend-architecture-ts-node-foundation. São decisões editoriais do plano, ainda antes de URL pública confirmada. Mapear aliases históricos somente se realmente publicados; sem prova, legacy-map é migração interna, não redirect permanente.
4. Uniformizar locale, YAML delimitado e datas ISO. Datas de catálogo 05/06/07 set 2026 são fonte editorial provisória, sem hora factual: converter para 00:00:00Z como convenção explicitamente registrada e só usar como publicação histórica após revisão; na falta de evidência usar primeira publicação real, não inventar precisão. Remover H1 redundante fora de fences, preservar código/links/seções; não fazer replace global. Mapear iniciantes/beginners, programação/programming e grafias técnicas por tabela explícita; Base TS/Node é série, podendo manter tag apenas se editorialmente útil. Não importar placeholders, Category ou métricas demonstrativas.
5. CLI validate --root <diretório fixo> --format json|text: realpath deve permanecer sob content, rejeitar symlink escapando raiz, traversal, extensões não .md, YAML tags executáveis/aliases excessivos e arquivo >512 KiB, lote >10 MiB. Schema strict; nomes desconhecidos falham com arquivo/campo/código. Links internos precisam de alvo no catálogo público resultante; links em draft podem apontar draft em preview privado, nunca em página publicada. Assets somente caminhos locais permitidos com existência e alt; links externos http/https/mailto validados, sem fetch. Não interpretar comandos embutidos.
6. validateContent retorna {valid,errors:[{file,field,code,message}],warnings,edition}; não acessa DB. O comando seed:local só é implementado/testado em [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente), pois depende do importador; [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) termina com validação offline independente. CLI import --dry-run em [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente) complementa conflitos com estado do DB.
7. Migração gradual dos arquivos: preparar conteúdo normalizado no destino, manter frontend/artigo somente leitura durante [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)–[E09](#e09-expor-api-rest-documentada-e-cache-http-simples) e concluir a movimentação/retirada da origem em [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) ao remover imports raw. Nunca editar as duas cópias; content é a autoridade da nova publicação. Isso mantém o frontend compilável durante a sequência.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Cópia dos oito textos em diretório temporário, fixtures YAML/AST/links/assets/symlink; validação offline sem DB. Seed fica em [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente), depois de existir importador.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E06-U01](./BACKEND_TEST_PLAN.md#e06-u01): Parser com os três formatos antigos: migração revisada gera frontmatter canônico sem alterar fences; arquivo normalizado inválido é rejeitado, nunca recebe título TSConfig por fallback.
- [E06-U02](./BACKEND_TEST_PLAN.md#e06-u02): ValidateContent: locale desconhecido, UUID repetido, tags não mapeadas, título vazio, link interno quebrado, symlink externo, 512KiB+1 e YAML abusivo geram diagnóstico; pares e séries corretos passam.
- [E06-U03](./BACKEND_TEST_PLAN.md#e06-u03): ReadingTime: AST de código/links/headings não conta sintaxe nem destinos; body não some quando YAML malformado.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E06-I01](./BACKEND_TEST_PLAN.md#e06-i01): Fixture dos oito textos: validação sem rede e sem env passa, quatro identidades/oito traduções/duas séries; diff preserva exemplos completos. Rodar CLI em diretório diferente do cwd e comparar resultado.

Arquivos de teste a criar:

- `backend/tests/unit/e06-content-validation.test.ts` — Cenários [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-U de regras e erros de Normalizar os oito textos e validar a fonte editorial.
- `backend/tests/integration/e06-content-validation.test.ts` — Cenários [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-I das fronteiras reais e persistência/operação de Normalizar os oito textos e validar a fonte editorial.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E06](./BACKEND_TEST_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial--para-publicar).

#### Critério de aceite

Conteúdo validado sem fallback silencioso, UUID gravados, oito corpos preservados e placeholders excluídos; autoria/datas/licenças revisadas antes de publicar esse lote. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e07"></a>

### E07. Importar, publicar, despublicar e arquivar atomicamente

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E07](./BACKEND_IMPLEMENTATION_ORDER.md#07-importar-publicar-despublicar-e-arquivar-atomicamente) · [Testes E07](./BACKEND_TEST_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

#### Objetivo

Projetar revisões aprovadas do Git no banco com idempotência, comparação de revisão e retirada explícita de conteúdo.

#### Estado atual

Ports/políticas e schema estarão prontos; não há implementação preexistente desses fluxos. CLI é a única escrita editorial P0.

#### Regra de negócio e restrições

[R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita).

- **[R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es) — Estados, primeira publicação e revisões:** Tradução draft/published/archived publica independentemente quando revisada e válida. Preservar primeira publishedAt ao corrigir ou republicar; updatedAt muda só em alteração editorial. Revisão original diferente da traduzida gera aviso editorial, sem despublicar automaticamente. Pai arquivado impede publicar; título/corpo/metadata válidos; data futura não agenda. Restore archived→draft é explícito.
- **[R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace) — Slugs e aliases disputam o mesmo namespace:** Slug é segmento canônico e único por locale mesmo draft. Mudança após publicação preserva alias; unicidade inclui aliases e caminhos atuais transacionalmente. Não reutilizar alias de outra tradução; resolver alias privado dá 404; fonte P0 é article_paths com PK(locale,slug).
- **[R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita) — Git único, import idempotente e retirada explícita:** Git/Markdown é fonte editorial; DB é projeção. Import não sobrescreve contas/interações e não apaga arquivo omitido. Reimport da mesma revisão/hash é no-op; mudança CAS concorrente falha integralmente. Publicação CLI protegida; expectedRevision obrigatória fora do banco vazio; mesma revisão/hash diferente conflita; dryRun zero writes.
- **[R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita) — Operador e efeitos auditáveis de escrita:** Toda escrita editorial registra operador e revisão, com motivo em mudanças de visibilidade. A identidade operacional vem de job/acesso protegido, nunca de payload web. Ambiente operacional deve restringir quem pode fornecer operador; parâmetro id sozinho não autentica pessoa. Sem endpoint admin P0.

#### Decisão arquitetural

Casos de uso orquestram política e PublicationStore. Adapter PostgreSQL é dono da transação e protege o mesmo namespace de caminhos. Nunca expor endpoint administrativo P0. Não introduzir UoW universal.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/application/import-content.ts | Coordenar validação, dry-run e applyEdition. |
| [CRIAR] | backend/src/modules/publishing/application/publish-translation.ts | Intenção de publicar e invariantes de primeira data. |
| [CRIAR] | backend/src/modules/publishing/application/unpublish-translation.ts | Retirada localizada explícita sem exclusão física. |
| [CRIAR] | backend/src/modules/publishing/application/archive-article.ts | Arquivar/restaurar identidade editorial e visibilidade global. |
| [CRIAR] | backend/src/modules/publishing/adapters/cli/import-content.ts | Entradas import/dry-run/publicação operacional, autorização pelo ambiente e exit codes. |
| [CRIAR] | backend/src/modules/publishing/adapters/postgres/publication-store.ts | Transação única, CAS, upsert, namespace, rollback e auditoria. |
| [ALTERAR] | backend/src/modules/publishing/application/ports/publication-store.ts | Concretizar assinaturas de diff e resultados sem ORM. |
| [ALTERAR] | backend/src/composition.ts | Injetar store/reader/clock nos comandos. |
| [ALTERAR] | backend/package.json | content:import e content:publish/unpublish/archive/restore documentados. Acrescentar seed:local protegido agora que ImportContent existe. |
| [CRIAR] | backend/seeds/local.ts | Fixture idempotente segura por meio de ImportContent de [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente). |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. ImportContent.execute({edition,expectedRevision,operator,dryRun}) valida lote inteiro e diffs; store inicia transação, bloqueia linha de current revision, compara expectedRevision (revisão ausente só no banco vazio), carrega estado e aplica upsert por UUID. Conflito devolve REVISION_CONFLICT e nenhuma escrita. Mesma revisão e mesmo hash retornam changed=false sem tocar updatedAt; mesmo identificador de revisão com hash divergente é erro. Serializar writers de publicação no DB, não em mutex de processo.
2. Upsert de autor/tags/séries/associações/artigos/traduções na mesma transação. Para objetos presentes, relações são substituídas pelo conjunto validado; objetos ausentes não são apagados. Criar pai e tradução de origem juntos. Revisão de texto é hash determinístico dos campos editoriais normalizados, separado do commit Git; translatedFromRevision aponta à revisão de origem revisada. Revisão global do lote identifica snapshot. Alteração de título/body/SEO/status/associações relevantes atualiza revisão pública; deploy ou retry não atualiza datas.
3. status no manifesto constitui intenção editorial explícita, mas valida transição: draft→published passa PublishTranslation/policy; published→draft exige ação unpublish no manifesto de operações; archive Article exige operação archive com ID. Não aceitar remoção de arquivo como intenção. CLI publish/unpublish/archive exige ID+locale quando aplicável, revisão esperada e motivo não vazio. Mudança operacional urgente exige patch equivalente no Git antes do próximo import para não reverter retirada.
4. publishTranslation verifica operador, pai ativo, locale/autor/metadados e integridade da série; marca primeira publishedAt (data histórica validada ou now), preserva em edições e republicação. unpublish mantém corpo/IDs/interações, altera status para draft; archive pai marca archivedAt e retira todas traduções das leituras sem destruí-las. Restaurar pai exige comando explícito restore, volta ativo mantendo estados das traduções; publicar tradução archived exige restore-to-draft primeiro.
5. Alterar slug chama operação de paths da [E05](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), retém alias publicado e nunca reusa alias de outro artigo. Adapter traduz constraint em SLUG_CONFLICT/SERIES_POSITION_CONFLICT, FK em REFERENCE_NOT_FOUND; falha de dependência em DEPENDENCY_UNAVAILABLE. Auditoria editorial e current revision são gravadas junto das mudanças. Log depois do commit contém IDs/revisão/ator/contagens, sem corpo. Falha de log não desfaz commit nem retorna falso rollback.
6. --dry-run calcula plano contra snapshot transacional de leitura sem DML, devolve created/updated/unchanged/visibilityChanges/conflicts com revisão base; execução posterior ainda faz CAS. CLI exits: 0 sucesso/sem alterações, 2 input/regra inválida, 3 conflito, 1 infraestrutura; JSON diagnóstico seguro. Nunca usar dry-run que modifica e depois simula sucesso.
7. Implementar seed:local agora com fixture segura por meio do mesmo parser/ImportContent, sem copiar regras; rejeitar production antes de conectar. Testar duas execuções com UUID/contagens iguais. Script só passa a integrar package.json nesta etapa.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 com migrations001/002, um draft PT/EN, autor/tags/séries, clock fixo/revisão base; duas conexões/barreiras e injeção de falha dentro da transação.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01): Store fake com revisão conhecida: input inválido não escreve; operador ausente negado; dry-run só lê; primeira publicação e correção usam now fixo/preservam datas; manifesto omitido não gera delete.
- [E07-U02](./BACKEND_TEST_PLAN.md#e07-u02): Conflito semântico mantém code/kind e não expõe SQL; retorno changed=false não gera novo evento editorial.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E07-I01](./BACKEND_TEST_PLAN.md#e07-i01): PostgreSQL com draft PT/EN: importar duas vezes mantém UUID/updatedAt; publicar apenas PT mantém EN privado; remover arquivo do lote não exclui EN; arquivar pai oculta ambos e preserva linhas.
- [E07-I02](./BACKEND_TEST_PLAN.md#e07-i02): Dois imports da mesma base com conteúdos diferentes: um commit, outro REVISION_CONFLICT; falha após atualizar associações mas antes de tradução faz rollback integral, inclusive revisão/paths.
- [E07-I03](./BACKEND_TEST_PLAN.md#e07-i03): Alterar slug publicado gera alias, tentativa de usar alias de outro artigo conflita; rollback para texto anterior por nova revisão preserva primeira data e aliases legítimos. Em P1 repetir suite com likes/comentários existentes para provar preservação.
- [E07-I04](./BACKEND_TEST_PLAN.md#e07-i04): seed:local em DB de teste após [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente): duas execuções mantêm IDs/contagens; em production bloqueia antes de conectar.
- [E07-I05](./BACKEND_TEST_PLAN.md#e07-i05): Taxonomia já publicada: alteração de slug Tag/Series rejeita TAXONOMY_SLUG_IMMUTABLE e preserva URL; ArchiveTranslation→archived→restore draft→publish preserva primeira data; restore Article lista reexposições e exige intenção explícita. Arquivar/restaurar série nunca arquiva/publica artigos por acidente.

Arquivos de teste a criar:

- `backend/tests/unit/e07-editorial-import.test.ts` — Cenários [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-U de regras e erros de Importar, publicar, despublicar e arquivar atomicamente.
- `backend/tests/integration/e07-editorial-import.test.ts` — Cenários [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I das fronteiras reais e persistência/operação de Importar, publicar, despublicar e arquivar atomicamente.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E07](./BACKEND_TEST_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente--para-publicar).

#### Critério de aceite

Operações são idempotentes, transacionais e auditáveis; efeitos de retirada explícitos; erro em qualquer item não publica metade da edição; acesso CLI protegido documentado. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e08"></a>

### E08. Consultar artigos, tags e séries publicados

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E08](./BACKEND_IMPLEMENTATION_ORDER.md#08-consultar-artigos-tags-e-s%C3%A9ries-publicados) · [Testes E08](./BACKEND_TEST_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

#### Objetivo

Disponibilizar projeções públicas completas e consistentes sem exposição de rascunhos ou N+1.

#### Estado atual

ArticleReader e DTOs definidos em [E04](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o); sem consultas editoriais existentes a reaproveitar. Helper genérico legado não respeita contrato e não é entrada de query.

#### Regra de negócio e restrições

[R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas).

- **[R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) — Série localizada e navegação pela lista visível:** Série global e apresentação localizada devem estar publicadas. Membros N:N têm posição positiva única por série. Listagem, count e anterior/próximo usam apenas traduções publicadas de artigos ativos no locale. Membro não repetido; múltiplas séries permitidas; contexto não muda canonical.
- **[R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso) — Visibilidade por locale sem fallback silencioso:** Só tradução published com Article não arquivado é pública em detalhe/lista/taxonomia/alternates/snapshot. Locale desconhecido é erro; ausência naquele idioma é 404 e não substituição pelo original. Locale normalizado via allowlist; pt-br→pt-BR, en-US rejeitado. Dados internos/conta fora do DTO.
- **[R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas) — Paginação e busca limitadas e determinísticas:** Lista usa page 1/limit20,max50 e sort publishedAt asc/desc com UUID como desempate. Busca P0 literal parametrizada em título/descrição; filtros localizados combinam AND. q 2..100, strings escalares, query strict; não repassar req.query ao ORM; COUNT não duplica joins.

#### Decisão arquitetural

Casos de uso finos validam contrato e chamam ArticleReader; SQL/Sequelize usa binds e projeções específicas. Separação leitura/escrita local não introduz buses/CQRS distribuído.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/application/get-article.ts | Detalhe e resolução de alias ou not-found. |
| [CRIAR] | backend/src/modules/publishing/application/list-articles.ts | Filtros/paginação e projeção de resumos. |
| [CRIAR] | backend/src/modules/publishing/application/list-tags.ts | Taxonomia localizada com conteúdo real. |
| [CRIAR] | backend/src/modules/publishing/application/list-series.ts | Séries publicadas e contagem visível. |
| [CRIAR] | backend/src/modules/publishing/application/get-series.ts | Membros ordenados e navegação coerente. |
| [CRIAR] | backend/src/modules/publishing/adapters/postgres/article-reader.ts | Consultas parametrizadas e projections sem hidratar corpos desnecessários. |
| [ALTERAR] | backend/src/modules/publishing/application/content.dto.ts | Finalizar DTOs e retorno discriminado de slug. |
| [ALTERAR] | backend/src/modules/publishing/application/ports/article-reader.ts | Completar assinaturas concretas e semântica de retorno nulo. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. getArticle({locale,slug}) resolve current/redirect e exige translation.status=published + article.archivedAt=null. Retorno discriminado found|redirect|not-found; redirect aponta somente rota local do alvo público. Não fazer fallback de idioma. Alternates só publicados, incluindo a própria tradução; informação de draft não sai em 404.
2. listArticles usa page=1,limit=20,max=50; page além do fim devolve data=[] com total real; sort publishedAt:desc padrão ou asc, id mesmo sentido como desempate. title/description busca q literal case-insensitive com 2..100 caracteres, escapando %/_; filtros tag/series usam slug localizado e difficulty allowlist. Filtro válido inexistente→lista vazia; filtros combinados AND. Não incluir bodyMarkdown em SELECT/DTO; COUNT sem duplicação de joins (EXISTS ou COUNT DISTINCT).
3. listTags retorna só traduções válidas de tag com ao menos um artigo público no locale; count conta identidades únicas. listSeries exige estado global/local published; pode retornar série vazia publicada se apresentação revisada informa trilha em andamento. getSeries devolve membros públicos no locale, position original (lacunas permitidas), count derivado desse conjunto e hasTranslationGaps boolean sem IDs/títulos privados. Anterior/próximo usa exatamente membros retornados e seriesId do contexto; se artigo não pertence, erro 422 SERIES_CONTEXT_INVALID.
4. DTOs de leitura completos no contrato abaixo; autor só perfil público revisado, não conta; canonical construído com PUBLIC_SITE_URL validado. updatedAt de leitura reflete revisão editorial relevante, nunca request time. Um artigo em duas séries retorna ambas; contexto de navegação não muda canonical.
5. Queries por página limitadas: uma de count, uma de resumos e consultas em lote de tags/autor/series conforme necessário; não crescer número de queries com 1→50 itens. Expor query logging somente em testes com parâmetros fictícios.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 com artigos published/draft/archived, locale ausente, timestamps iguais, tags/séries N:N, 73 traduções e spy de query somente em teste.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E08-U01](./BACKEND_TEST_PLAN.md#e08-u01): Reader stub: null→not-found; redirect contém alvo canônico; não substitui EN ausente por PT; filtro inválido falha antes do reader.
- [E08-U02](./BACKEND_TEST_PLAN.md#e08-u02): Série com posições 1/2/3 e item 2 draft: anterior/próximo ligam 1 e 3; count=2; contexto estranho dá 422; empty publicado devolve count=0.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E08-I01](./BACKEND_TEST_PLAN.md#e08-i01): Fixture DB com PT publicado, EN draft, pai arquivado, duas tags e duas séries: lista/detalhe/tags/séries/alternates filtram todos estados de forma igual.
- [E08-I02](./BACKEND_TEST_PLAN.md#e08-i02): Mais de 50 artigos com timestamps iguais: páginas sem repetição em snapshot estável; asc/desc determinísticos; q com aspas/%/_ não injeta nem vira wildcard; count não duplica artigo com múltiplas tags.
- [E08-I03](./BACKEND_TEST_PLAN.md#e08-i03): Medição de queries para 1 e 50 itens confirma quantidade limitada; coluna bodyMarkdown não é selecionada nas listas.

Arquivos de teste a criar:

- `backend/tests/unit/e08-public-queries.test.ts` — Cenários [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-U de regras e erros de Consultar artigos, tags e séries publicados.
- `backend/tests/integration/e08-public-queries.test.ts` — Cenários [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I das fronteiras reais e persistência/operação de Consultar artigos, tags e séries publicados.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E08](./BACKEND_TEST_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados--para-publicar).

#### Critério de aceite

Todos caminhos públicos usam o mesmo predicado de visibilidade; contagem/navegação correspondem à lista; filtros e ordem determinísticos; nada de email, ORM ou Markdown em cards. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e09"></a>

### E09. Expor API REST documentada e cache HTTP simples

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E09](./BACKEND_IMPLEMENTATION_ORDER.md#09-expor-api-rest-documentada-e-cache-http-simples) · [Testes E09](./BACKEND_TEST_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

#### Objetivo

Conectar consultas públicas à API v1 com schemas, DTOs, cache correto e contrato verificável pelo frontend.

#### Estado atual

HTTP base funciona após [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); rotas editoriais e OpenAPI inexistem. Health existente já foi evoluído, não precisa nova implementação.

#### Regra de negócio e restrições

[R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o).

- **[R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo) — Entrada estrita, erro estável e log mínimo:** Toda borda valida formato/tamanho; erro público contém code/message/fields seguros e requestId validado. Log é JSON com rota normalizada/status/duração, sem query/body/credenciais. UUID substitui requestId fora do formato; logger não bloqueia resposta; headersSent usa next. Limites e allowlists em [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)/[E09](#e09-expor-api-rest-documentada-e-cache-http-simples).
- **[R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso) — Visibilidade por locale sem fallback silencioso:** Só tradução published com Article não arquivado é pública em detalhe/lista/taxonomia/alternates/snapshot. Locale desconhecido é erro; ausência naquele idioma é 404 e não substituição pelo original. Locale normalizado via allowlist; pt-br→pt-BR, en-US rejeitado. Dados internos/conta fora do DTO.
- **[R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas) — Paginação e busca limitadas e determinísticas:** Lista usa page 1/limit20,max50 e sort publishedAt asc/desc com UUID como desempate. Busca P0 literal parametrizada em título/descrição; filtros localizados combinam AND. q 2..100, strings escalares, query strict; não repassar req.query ao ORM; COUNT não duplica joins.
- **[R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o) — URLs, metadata e cache representam a tradução:** Canonical é URL autorizada da própria tradução; alternates recíprocos e sitemap só publicados 200. lastmod muda por revisão editorial relevante, nunca like/view/deploy. Cache público não contém estado de sessão. Hreflang pt-BR, OG pt_BR; tracking fora do canonical; sem x-default sem entrada neutra real. Erros/privados no-store.

#### Decisão arquitetural

Routes Express adaptam Request para input tipado, chamam casos de uso e mapeiam saída. Nenhuma consulta ORM em routes. OpenAPI é contrato público e suite verifica respostas reais.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/adapters/http/articles.routes.ts | Rotas de lista/detalhe e redirect HTTP de slug. |
| [CRIAR] | backend/src/modules/publishing/adapters/http/taxonomy.routes.ts | Rotas de tags/lista/detalhe de séries. |
| [CRIAR] | backend/src/modules/publishing/adapters/http/article.schemas.ts | Validação strict de path/query e normalização de locale. |
| [CRIAR] | backend/src/http/public-cache.ts | ETag/Last-Modified e conditional GET sem dados privados. |
| [CRIAR] | backend/openapi.yaml | Contrato v1, health, erros e exemplos. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas públicas antes de 404. |
| [ALTERAR] | backend/src/composition.ts | Injetar casos de uso nas rotas. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Montar GET /api/v1/articles, /articles/by-slug/:locale/:slug, /tags, /series, /series/by-slug/:locale/:slug. locale query padrão pt-BR quando omitido; locale no path obrigatório. Canonicalização BCP47 permite pt-br→pt-BR e en→en pela allowlist; en-US não vira en silenciosamente. Slug de request precisa segmento canônico e não traversal; 400 se inválido. Query desconhecida/repetida/objeto em campo escalar→400; page/limit inteiros decimais positivos, max 50 sem clamp silencioso.
2. Status 200 e DTOs do contrato; alias conhecido→308 Location /api/v1/articles/by-slug/<locale>/<currentSlug> relativo e sem query herdada. Snapshot gera redirect equivalente de site. Draft/archived/alias privado→404 RESOURCE_NOT_FOUND idêntico a inexistente; não criar GET by-id que contorne regra. Métodos de escrita editoriais retornam 404 (rotas inexistentes).
3. Cache público sem personalização: Cache-Control public,max-age=0,s-maxage=60,must-revalidate, ETag por hash de representação estável (inclui locale/filtros/página/revisão), Last-Modified de revisão editorial. If-None-Match prevalece sobre If-Modified-Since; 304 sem body. 404/erros no-store. Se CORS dinâmico, Vary: Origin. Não emitir Set-Cookie na leitura editorial. Arquivamento invalida cache operacional no deploy; TTL máximo 60s com revalidação, sem stale indefinido.
4. OpenAPI define formatos UUID/ISO, limites, exemplos reais e respostas de erro por rota; expose docs como arquivo versionado, UI apenas opcional local. Decisão técnica numérica: todos totais JSON são inteiros seguros; converter bigint explicitamente e falhar de forma observável se exceder MAX_SAFE_INTEGER, jamais arredondar silenciosamente; em [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) acrescentar limite documentado de contadores.
5. Aplicar limites de leitura no proxy P0 (exemplo operacional 120/min por origem/IP com burst 30, ajustável e testado em rede compartilhada), deadline de request 5s compatível com DB 3s; requestId e Retry-After para 429 gerado pela API ou proxy. trust proxy segue topologia real da [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Composição real+Supertest e PostgreSQL16 da fixture [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados); documento OpenAPI versionado e agente sem sessão; cache headers inspecionados.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E09-U01](./BACKEND_TEST_PLAN.md#e09-u01): Schemas: page=0/NaN, limit=51, sort=popular, locale=en-US, arrays e traversal→400; defaults corretos; canonical pt-br permitido.
- [E09-U02](./BACKEND_TEST_PLAN.md#e09-u02): ETag: mesma representação idêntica; locale/página/revisão diferente invalida; If-None-Match vence data; safe bigint converte, overflow rejeita.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E09-I01](./BACKEND_TEST_PLAN.md#e09-i01): Supertest com DB: cada endpoint 200/404/400 compatível com OpenAPI, sem body em resumos/dados internos; rota estática by-slug não capturada como ID.
- [E09-I02](./BACKEND_TEST_PLAN.md#e09-i02): API cache: ETag→304, publicação→ETag novo, archive→404/no-store; nenhuma resposta editorial contém Set-Cookie. API de slug antigo→308 interno; alias do draft→404.
- [E09-I03](./BACKEND_TEST_PLAN.md#e09-i03): Payload JSON inválido/grande em fixture de [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) e query abusiva nas rotas reais mantêm envelope; timeout DB retorna 503 seguro; rate limit de edge é validado em [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**API/contrato/autorização na borda:**

- [E09-A01](./BACKEND_TEST_PLAN.md#e09-a01): GET articles/by-slug PT e EN publicados200; EN draft404; locale desconhecido400; slug histórico308 apenas se alvo público; API sem autenticação.
- [E09-A02](./BACKEND_TEST_PLAN.md#e09-a02): GET lista page1/20,max50 e filtros AND; zero resultados com totalPages0; limit51/sort popular/query objeto400; DTO sem body/PII.
- [E09-A03](./BACKEND_TEST_PLAN.md#e09-a03): GET tags/series só publicados e navegação por visíveis; mesma resposta validada por OpenAPI. Conditional GET304, mudança editorial invalida; erro no-store.

Arquivos de teste a criar:

- `backend/tests/unit/e09-public-api.test.ts` — Cenários [E09](#e09-expor-api-rest-documentada-e-cache-http-simples)-U de regras e erros de Expor API REST documentada e cache HTTP simples.
- `backend/tests/integration/e09-public-api.test.ts` — Cenários [E09](#e09-expor-api-rest-documentada-e-cache-http-simples)-I das fronteiras reais e persistência/operação de Expor API REST documentada e cache HTTP simples.
- `backend/tests/api/e09-public-api.test.ts` — Cenários [E09](#e09-expor-api-rest-documentada-e-cache-http-simples)-A de endpoints/status/DTO/auth de Expor API REST documentada e cache HTTP simples.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E09](./BACKEND_TEST_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples--para-publicar).

#### Critério de aceite

OpenAPI e respostas reais concordam; locale/visibilidade/limites são uniformes; leitura não exige sessão; cache nunca contém identidade do visitante. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e10"></a>

### E10. Exportar snapshot e integrar publicação com o site

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E10](./BACKEND_IMPLEMENTATION_ORDER.md#10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) · [Testes E10](./BACKEND_TEST_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](#e09-expor-api-rest-documentada-e-cache-http-simples).

#### Objetivo

Entregar um artefato público completo e consistente que alimente renderização React, URLs e sitemap.

#### Estado atual

Frontend usa Markdown raw e parser artesanal; não há snapshot/API client/SSG. A arquitetura exige HTML indexável e mesma revisão no catálogo, metadata e sitemap. O trabalho frontend aqui é uma dependência de integração do release, não redesenho de layout.

#### Regra de negócio e restrições

[R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel).

- **[R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro) — Catálogo real e Markdown seguro:** Importar quatro pares reais e duas séries com autoria revisada, tags canônicas e conteúdo preservado. YAML/Markdown/paths são dados não confiáveis; sem MDX, execução ou fetch remoto. UUID gravados; títulos H1 normalizados fora de fences; tags sinônimas mapeadas explicitamente; links internos públicos resolvidos. Limites 512KiB/arquivo,10MiB/lote são técnicos.
- **[R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o) — URLs, metadata e cache representam a tradução:** Canonical é URL autorizada da própria tradução; alternates recíprocos e sitemap só publicados 200. lastmod muda por revisão editorial relevante, nunca like/view/deploy. Cache público não contém estado de sessão. Hreflang pt-BR, OG pt_BR; tracking fora do canonical; sem x-default sem entrada neutra real. Erros/privados no-store.
- **[R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel) — Snapshot consistente e release verificável:** Exportar todo catálogo em snapshot curto consistente, fechar DB antes do build, gerar páginas/sitemap da mesma revisão e anunciar só após smoke. Banco/site podem divergir temporariamente no P0 com falha visível e retry. Não usar só página1/limite50; arquivo de saída substituído atomicamente; retirada urgente precisa API e site/edge.

#### Decisão arquitetural

Exportação CLI confiável consulta banco em transação curta REPEATABLE READ READ ONLY, gera JSON imutável e fecha a transação antes do build. Não consultar página 1 da API como se fosse catálogo completo. Manter React/Vite; prova mínima com renderização React no build, sem trocar para Next.js por preferência.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/application/export-snapshot.ts | Coordenar snapshot público consistente. |
| [CRIAR] | backend/src/modules/publishing/adapters/cli/export-snapshot.ts | Exportar JSON atomicamente e relatório de revisão. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/article-reader.ts | Adicionar exportação consistente, sem limites da API pública. |
| [ALTERAR] | backend/src/modules/publishing/application/content.dto.ts | SnapshotSchema v1 e catálogo de URLs públicos. |
| [CRIAR] | frontend/src/content/snapshot.ts | Validar/consumir contrato de snapshot no build. |
| [ALTERAR] | frontend/src/content/articles.ts | Substituir fonte raw/placeholders por snapshot; manter seletores úteis. |
| [CRIAR] | frontend/scripts/prerender.tsx | Renderizar catálogo completo React e sitemap a partir de uma revisão. |
| [ALTERAR] | frontend/src/App.tsx | Roteamento localizado e alternates reais mantendo layout. |
| [ALTERAR] | frontend/src/features/articles/components/article-detail/MarkdownArticle.tsx | Renderer AST seguro, preservar seções e links/code completos. |
| [ALTERAR] | frontend/package.json | Build com snapshot e pré-renderização, sem segredo backend. |
| [CRIAR] | frontend/tests/publication.test.ts | Contrato de HTML/URLs/sitemap e preservação de conteúdo. |
| [ALTERAR] | backend/package.json | content:export e validação de snapshot. |
| [CRIAR] | frontend/generated/published-content.json | Artefato gerado por export consistente, não fonte editável; schemaVersion/revision/hash e catálogo público completo. |
| [ALTERAR] | frontend/.gitignore | Ignorar snapshot/artefatos gerados de build; preservar fontes e configuração existentes. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. exportSnapshot() lê current revision e todas traduções/series/tags/paths públicos sob mesmo snapshot. Gera {schemaVersion:1,revision,generatedAt,siteOrigin,articles,series,tags,redirects,urlCatalog}; articles incluem bodyMarkdown e metadata pública; drafts nunca entram. urlCatalog contém canonical, locale, alternates recíprocos, lastmod relevante e kind. Salvar em arquivo temporário e rename atômico após validar schema/checksum; generatedAt não altera revisão/ETag editorial.
2. Export CLI --output recebe destino de artefato configurado, sem expor rota de dump privado. Não manter transação durante renderização; se import simultâneo, resultado é integralmente revisão antiga ou nova. Exportar todos os registros sem limite público de 50.
3. Frontend recebe snapshot validado no build; substituir catálogo/demo placeholders e fallback regex. Preservar componentes de layout. Criar rotas localizadas /{locale}/articles/{slug}, /series/{slug}, /tags/{slug}; renderizar React para HTML no build com conteúdo completo/H1 único/links/canonical/hreflang/OG/sitemap e 404 real da hospedagem. Normalização de heading/AST preserva fences; não descartar seções sugeridas como renderer atual. Snapshot é fonte de catálogo e metadata. Browser pode hidratar componentes interativos, sem depender de fetch para corpo inicial.
4. Adaptador build expõe relatório de revision e hash do artefato. Smoke exige uma PT, sua EN, série com lacuna fixture, locale ausente 404, slug antigo redirect, sitemap só URLs 200 e oito textos reais. SITE_ORIGIN local para dev; domínio final entra em [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) e é necessário antes de redirects permanentes.
5. Se build/deploy falhar após import, site anterior continua; registrar divergence API revision/site revision e alertar. Retry com mesma revisão não altera DB. Reverter editorial via nova revisão explícita; não down destrutivo. Publicação só anunciada após smoke. Retirada urgente de artigo exige também remover/invalidar HTML anterior no host; registrar procedimento em [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).
6. Concluir a movimentação editorial iniciada em [E06](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial): após snapshot consumido e testes passarem, retirar os oito arquivos antigos de frontend/artigo e os imports raw. A origem e o destino são evolução do mesmo acervo, não duas fontes de edição.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 com73 traduções/revisão fixa, import concorrente; diretório temporário de snapshot, build React e servidor estático local sem JavaScript.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E10-U01](./BACKEND_TEST_PLAN.md#e10-u01): Catálogo: canonical deriva origem autorizada, hreflang apenas publicado/recíproco, og locale pt_BR, tracking não entra, lastmod não muda por export.
- [E10-U02](./BACKEND_TEST_PLAN.md#e10-u02): Serialização de título com </script> não injeta JSON-LD/HTML; imagem local exige alt; renderer preserva código e links aprovados.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E10-I01](./BACKEND_TEST_PLAN.md#e10-i01): DB com 73 traduções e import concorrente: snapshot contém todas de uma única revisão, zero draft; export falho não substitui arquivo bom.
- [E10-I02](./BACKEND_TEST_PLAN.md#e10-i02): Build estático com snapshot real: sem JavaScript, corpo completo presente, PT↔EN por slugs reais, sitemap corresponde a URLs 200; fail build mantém artefato anterior e produz alerta de revisão divergente.

Arquivos de teste a criar:

- `backend/tests/unit/e10-publication-snapshot.test.ts` — Cenários [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-U de regras e erros de Exportar snapshot e integrar publicação com o site.
- `backend/tests/integration/e10-publication-snapshot.test.ts` — Cenários [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-I das fronteiras reais e persistência/operação de Exportar snapshot e integrar publicação com o site.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E10](./BACKEND_TEST_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site--para-publicar).

#### Critério de aceite

Um único snapshot alimenta páginas/metadados/sitemap; release PT/EN renderizado e smoke comprovados; integração é gate P0 mesmo que executada pelo responsável frontend. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e11"></a>

### E11. Entregar imagens e Compose reproduzíveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E11](./BACKEND_IMPLEMENTATION_ORDER.md#11-entregar-imagens-e-compose-reproduz%C3%ADveis) · [Testes E11](./BACKEND_TEST_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](#e09-expor-api-rest-documentada-e-cache-http-simples), [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

#### Objetivo

Completar setup da arquitetura com migrate obrigatório e JS compilado em produção, reaproveitando a simplificação existente.

#### Estado atual

Compose dev já contém só PostgreSQL/API, NODE_ENV=dev e --env-file correto. Dockerfile.develop e .dockerignore existem; Dockerfile de produção foi removido no worktree. Problema atual: container roda npm run dev, que executa dev:database/docker compose sem Docker dentro da imagem; API não publica porta nem possui web proxy.

#### Regra de negócio e restrições

[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release).

- **[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) — Instalação, credenciais e artefato reproduzível:** Segredos não entram no Git/contexto/imagem/frontend; dependências são instaladas por lockfile e produção executa JS compilado com usuário não root. Correções já presentes são mantidas. Não expor socket Docker, .env ou VITE_* com secrets. Não usar teste vazio como sucesso.
- **[R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita) — Schema versionado e transação explícita:** Migration aplicada uma vez com versão/checksum; app não executa sync ou DDL. Persistência e testes usam PostgreSQL da major alvo. Operações atômicas compartilham a mesma conexão/transação. Não editar versão aplicada; não testar constraint com SQLite/mock. Migrations P1/P2 não antecipadas no P0.
- **[R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release) — Deploy e recuperação são parte do release:** Produção usa HTTPS/proxy conhecido, DB privado/privilégio mínimo, migration antes da API, backup fora do host e restore ensaiado. Operação recebe alertas testados e registra revisão entregue. RPO/RTO propostos24h e backup diário/30d precisam aceitação e medição; volume não é backup; PR de fork não recebe secrets.

#### Decisão arquitetural

Uma API, PostgreSQL e frontend no mesmo ponto de entrada. Migrator é processo operacional de execução única; não montar socket Docker no app para corrigir recursão de comandos.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/Dockerfile | Build, migrator e runtime não root com JS compilado. |
| [ALTERAR] | backend/Dockerfile.develop | Hot reload interno dev:api, sem tentativa de executar Docker. |
| [ALTERAR] | backend/docker-compose-develop.yml | Corrigir comando/portas e apontar setup canônico sem perder volume. |
| [CRIAR] | compose.yaml | db/migrate/api/web com dependências corretas e defaults locais. |
| [CRIAR] | deploy/nginx.conf | Mesmo ponto de entrada, rotas /api/health, estáticos e 404/redirects do snapshot. |
| [ALTERAR] | backend/package.json | Separar dev do host, dev:api de container e comandos de runtime. |
| [EXISTENTE] | backend/.dockerignore | Proteção de contexto já existente, validar alvos multistage. |
| [CRIAR] | backend/scripts/smoke-image.mjs | Verificar processo/health/API/usuário/artefato com dados de teste. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Criar Dockerfile multi-stage deps/build/migrator/runtime, lockfile npm ci, runtime npm ci --omit=dev ou cópia equivalente de dependências produção, USER node, comando node dist/src/main.js. Incluir migrations compiladas no target migrator e apenas runtime necessário no target api. Nenhum .env/COPY secret, FFmpeg, Redis ou uploads. Node fixado na mesma versão validada da [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).
2. Corrigir Dockerfile.develop/CMD e compose backend legado para dev:api (tsx watch), mantendo npm run dev como conveniência no host que inicia DB e depois dev:api. Root compose.yaml vira entrada canônica: db saudável → migrate (migration + seed local explícito permitido só dev) concluído → api → web proxy. Defaults públicos locais permitem clone/up sem OAuth/email. API e db ficam na rede interna; opcional porta DB 127.0.0.1. Porta pública web documentada, /api e /health encaminhados.
3. Reutilizar volume PostgreSQL nomeado existente ou documentar transferência explícita; não criar volume novo silenciosamente parecendo perder dados. Volume node_modules de dev continua separado do Windows. Um único Compose fonte; backend/docker-compose-develop.yml pode ser compatibilidade de curto prazo documentada e depois retirado, sem runtime divergente.
4. Compose de produção separado/configurado no runbook: sem bind mounts de fonte, sem porta PostgreSQL pública, rede/credenciais separadas, recursos CPU/memória e limites de logs no host; app filesystem readonly quando validado. Healthcheck usa endpoints reais. Não instalar ferramenta pesada de health só para curl se Node atende.
5. Documentar primeira execução e retomada sem down -v; OAuth/email desligados e leitura funcional sem conta externa. Falha de migrator impede API, restart não repete seeds de produção e SIGTERM drena conforme [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Docker engine/Compose, nomes de projeto/volumes exclusivos de teste, imagem build/migrator/runtime e nenhuma credencial externa; nunca reutilizar volume de desenvolvimento para destruir fixture.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E11-U01](./BACKEND_TEST_PLAN.md#e11-u01): Configuração: parser de ambiente recusa profile fake/seed local em produção; nomes dos scripts usados nos Dockerfiles/Compose existem no package. Não escrever teste para cada linha YAML; validar comportamento no smoke.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E11-I01](./BACKEND_TEST_PLAN.md#e11-i01): Checkout limpo, volume novo isolado de teste: docker compose up --build entrega oito traduções sem credenciais externas; segunda subida preserva IDs/dados; DB lento espera health; migration inválida mantém API parada.
- [E11-I02](./BACKEND_TEST_PLAN.md#e11-i02): Imagem final executa como não root com devDependencies ausentes; nenhum env/secret/log local em layers/conteúdo; API atende compilada sem tsx/aliases. Reinício e shutdown preservam dados e encerram no prazo.

Arquivos de teste a criar:

- `backend/tests/unit/e11-containers.test.ts` — Cenários [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-U de regras e erros de Entregar imagens e Compose reproduzíveis.
- `backend/tests/integration/e11-containers.test.ts` — Cenários [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-I das fronteiras reais e persistência/operação de Entregar imagens e Compose reproduzíveis.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E11](./BACKEND_TEST_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis--para-publicar).

#### Critério de aceite

Setup canônico funciona de ponta a ponta; runtime sem Docker interno e dependências sem uso; migrator precede API; imagem pronta para deploy sem secrets embutidos. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e12"></a>

### E12. Automatizar validação e fechar operação do primeiro release

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E12](./BACKEND_IMPLEMENTATION_ORDER.md#12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) · [Testes E12](./BACKEND_TEST_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0). **Dependências:** [E11](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).

#### Objetivo

Garantir que P0 possa ser publicado, observado e recuperado, com evidências objetivas e responsabilidades operacionais.

#### Estado atual

Script ci existe mas não workflow; documentação raiz/LICENÇA estão ausentes no worktree, frontend tem README/Apache e backend package ISC. Não há evidência de host/proxy/backup/alertas configurados. Preservar reorganização e não restaurar arquivos antigos automaticamente.

#### Regra de negócio e restrições

[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release), [R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos).

- **[R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) — Instalação, credenciais e artefato reproduzível:** Segredos não entram no Git/contexto/imagem/frontend; dependências são instaladas por lockfile e produção executa JS compilado com usuário não root. Correções já presentes são mantidas. Não expor socket Docker, .env ou VITE_* com secrets. Não usar teste vazio como sucesso.
- **[R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel) — Snapshot consistente e release verificável:** Exportar todo catálogo em snapshot curto consistente, fechar DB antes do build, gerar páginas/sitemap da mesma revisão e anunciar só após smoke. Banco/site podem divergir temporariamente no P0 com falha visível e retry. Não usar só página1/limite50; arquivo de saída substituído atomicamente; retirada urgente precisa API e site/edge.
- **[R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release) — Deploy e recuperação são parte do release:** Produção usa HTTPS/proxy conhecido, DB privado/privilégio mínimo, migration antes da API, backup fora do host e restore ensaiado. Operação recebe alertas testados e registra revisão entregue. RPO/RTO propostos24h e backup diário/30d precisam aceitação e medição; volume não é backup; PR de fork não recebe secrets.
- **[R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos) — Direitos editoriais e responsáveis explícitos:** Preservar direitos existentes e registrar escopo de código/textos/traduções/assets e contatos de segurança/privacidade antes da publicação. Não aplicar licença frontend automaticamente ao backend. Não inventar nome, email, domínio ou autorização jurídica; planejamento técnico de retenção não determina prazo legal.

#### Decisão arquitetural

PR sem privilégio valida; deploy confiável separado aplica migration/import/snapshot/build/smoke. Não executar código de fork com secrets. Host é parâmetro operacional, não nova arquitetura.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | .github/workflows/backend-ci.yml | Validação sem secrets, banco efêmero e gates por implementação. |
| [CRIAR] | .github/workflows/deploy.yml | Release confiável serializado com revisão e rollback operacional. |
| [CRIAR] | backend/scripts/backup.mjs | Disparar backup com credencial operacional e verificar upload/checksum, sem imprimir senha. |
| [CRIAR] | backend/scripts/restore.mjs | Restaurar destino isolado explicitamente e gerar evidência de recuperação. |
| [CRIAR] | backend/scripts/release-smoke.mjs | Comparar revisões/API/site/catálogo e falhar com diagnóstico seguro. |
| [CRIAR] | docs/BACKEND_OPERATIONS.md | Runbooks, contatos, host, proxy, backup, alertas, incidentes e retirada urgente. |
| [CRIAR] | docs/RELEASE_EVIDENCE.md | Evidências datadas de CI/smoke/restore/revisão e decisões de lançamento. |
| [CRIAR] | README.md | Quickstart real por projeto e navegação da documentação. |
| [CRIAR] | CONTRIBUTING.md | Fonte editorial, revisão e comandos de validação. |
| [CRIAR] | SECURITY.md | Canal privado real de vulnerabilidade e acesso operacional. |
| [CRIAR] | docs/CONTENT_LICENSE_POLICY.md | Escopo de direitos de código/artigos/traduções/assets aprovado pelo mantenedor. |
| [CRIAR] | docs/PRIVACY_OPERATIONS.md | Inventário inicial de dados/provedores/logs e decisões pendentes com responsáveis. |
| [CRIAR] | docs/adr/001-modular-monolith.md | Registrar limites de dependência existentes da arquitetura. |
| [CRIAR] | docs/adr/002-editorial-source.md | Git único e banco projeção; CAS e idempotência. |
| [CRIAR] | docs/adr/003-publication-snapshot.md | URLs/renderização e janela de divergência aceita. |
| [ALTERAR] | deploy/nginx.conf | TLS/limites/cache e retirada de conteúdo na topologia escolhida. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. CI: npm ci backend/frontend, lint/typecheck, content:validate offline, unit, PostgreSQL integration/API/OpenAPI, build dos dois projetos e imagem/smoke. PR usa permissões mínimas e Actions pinadas por commit; sem pull_request_target executando checkout não confiável. Test DB efêmero major 16. Deploy workflow confiável recebe revisão revisada/ambiente protegido, serializa releases, migration única, import CAS, snapshot, build estático, deploy e smoke; falha em qualquer passo reporta revisão e não anuncia sucesso.
2. docs/BACKEND_OPERATIONS.md registra host escolhido pelo mantenedor, região/orçamento, domínio/HTTPS, proxy exato (redes/hops), porta pública, PUBLIC_SITE_URL, perfis de acesso app/migrator/operador, armazenamento/backup externos e responsáveis. Não inventar domínio, licença ou fornecedor. Esses são campos obrigatórios de gate, com defaults locais suficientes para desenvolvimento; publicação depende de valores reais.
3. TLS e headers de site testados separadamente de Helmet da API; HSTS somente depois de HTTPS validado. Query/payload/timeouts/rate limit de leitura com 429+Retry-After e IP real; testa spoof de X-Forwarded-For. Alertas mínimos: live/ready indisponível por 2 min, 5xx sustentado (>=5 em 5 min como limiar inicial ajustável), backup sem sucesso >26h, disco >=80%, falha editorial e diferença API/site persistente após deploy. Definir destinatário operacional sem efetuar envio nesta tarefa de planejamento.
4. Backup diário criptografado fora do host, janela proposta 30 dias, RPO alvo 24h/RTO até 24h a serem aceitos pelo mantenedor e medidos. scripts backup/restore exigem destino explícito; restore recusa banco produção por padrão, verifica checksum/decriptação e restaura ambiente isolado; documentar promoção operacional. Ensaiar contagens/UUID/revisão, API e site a partir do restore, registrar duração real. Nunca confundir volume com backup. Em P1 reaplicar registro de exclusões antes de abrir tráfego.
5. Retirada urgente: executar unpublish/archive com revisão/motivo, atualizar Git, export/build/deploy, purgar CDN/HTML/redirects afetados e verificar 404 tanto API quanto site. Se build estiver indisponível, bloquear URL no edge enquanto mantém site anterior. Rollback de texto por nova revisão e imagem/site anterior compatíveis; migrations destrutivas seguem expand/contract, sem down cego.
6. README/CONTRIBUTING/SECURITY/política de conteúdo explicam setup, publicar/traduzir, testes, contatos reais e licença de código/textos/assets confirmada pelo titular. Preservar Apache/ISC existentes até decisão explícita de escopo, sem relicenciar silenciosamente. ADRs 001/002/003 registram arquitetura, fonte única e renderização adotadas; política de privacidade P0 cobre também logs/proxy, sem afirmar bases legais não validadas.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: CI isolado e staging configurado, DB/backup cifrado de fixture em destino de teste; proxy HTTPS e canal de alerta de teste; restore nunca aponta produção.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E12-U01](./BACKEND_TEST_PLAN.md#e12-u01): Release smoke com manifestos de revisão iguais/diferentes falha apenas na divergência; guard restore impede destino acidental; scrub logs não registra segredo de comando.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01): Pipeline PR de fork com variáveis vazias executa testes sem produção; migration falha aborta deploy; import ok/build falho mantém site anterior e registra divergência; retry conclui sem nova edição.
- [E12-I02](./BACKEND_TEST_PLAN.md#e12-i02): Restore real de backup em DB isolado recupera IDs/contagens/revisão e passa smoke; medir RPO/RTO e falha de upload dispara alerta de teste.
- [E12-I03](./BACKEND_TEST_PLAN.md#e12-i03): HTTPS público de staging: headers, rate limit, X-Forwarded-For forjado, 404 sem SPA fallback, retirada urgente do cache e oito artigos renderizados. Verificar licença/contatos/decisões preenchidos no gate manual.

Arquivos de teste a criar:

- `backend/tests/unit/e12-release-operations.test.ts` — Cenários [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-U de regras e erros de Automatizar validação e fechar operação do primeiro release.
- `backend/tests/integration/e12-release-operations.test.ts` — Cenários [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-I das fronteiras reais e persistência/operação de Automatizar validação e fechar operação do primeiro release.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E12](./BACKEND_TEST_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release--para-publicar).

#### Critério de aceite

M1/P0 pronto apenas com CI, imagem, HTML PT/EN, backup restaurado e alertas exercitados; mantenedor preenche e aceita domínio/host/licenças/contatos/RPO/RTO. Nenhum requisito comunitário é antecipado. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<!-- navigation:anchor:start -->
<a id="nav-section-016"></a>
<!-- navigation:anchor:end -->

## Após publicação — P1

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="e13"></a>

### E13. Criar identidade e persistência de sessões

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E13](./BACKEND_IMPLEMENTATION_ORDER.md#13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) · [Testes E13](./BACKEND_TEST_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

#### Objetivo

Adicionar contas GitHub independentes da autoria e sessões revogáveis no PostgreSQL, sem mudar UUID editoriais.

#### Estado atual

P0 tem AuthorProfile editorial e leitura pública, sem User, OAuth ou sessão. cookie-parser já existe; não equivale a autenticação.

#### Regra de negócio e restrições

[R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas).

- **[R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email) — GitHub estável e vínculo sem merge por email:** OAuth identifica por providerUserId textual estável; nome é mutável e email opcional privado. Não vincular contas automaticamente por email nem reativar bloqueadas ao logar. Token GitHub descartado, escopos mínimos; AuthorProfile independente; cadastro não aceita role.
- **[R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas) — Sessão opaca, expiração e revogação imediatas:** Cookie guarda token aleatório e DB hash. Resolver verifica estado atual do usuário, absoluta/idle e revogação. Login e mudança de privilégio invalidam sessão anterior; logout revoga no DB. Normal7d/24h, admin8h/30min, auth recente5min, lastSeen granular5min; cookie prod __Host Secure HttpOnly Lax Path=/ sem Domain.

#### Decisão arquitetural

Módulo identity com domínio/aplicação/ports/adapters próprios. User não é AuthorProfile; associação opcional explícita não concede publicação. Uma instância Sequelize compartilhada pela composição, sem relações de domínio com ORM.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/003-identity.ts | Tabelas de identidade/sessão/OAuth e constraints de unicidade. |
| [CRIAR] | backend/src/modules/identity/domain/user.ts | Estados/roles e perfil público mínimo. |
| [CRIAR] | backend/src/modules/identity/domain/session-policy.ts | Expiração absoluta/idle e reautenticação com clock. |
| [CRIAR] | backend/src/modules/identity/application/identity.dto.ts | Actor, PublicUser e dados privados internos separados. |
| [CRIAR] | backend/src/modules/identity/application/ports/identity-store.ts | Identidade externa e gestão de estado por capacidade. |
| [CRIAR] | backend/src/modules/identity/application/ports/session-store.ts | Persistência/revogação/touch de sessão opaca. |
| [CRIAR] | backend/src/modules/identity/application/ports/oauth-transaction-store.ts | Transação temporária de início OAuth de uso único. |
| [CRIAR] | backend/src/modules/identity/adapters/postgres/identity-store.ts | Resolver identidade externa atomicamente e sem merge por email. |
| [CRIAR] | backend/src/modules/identity/adapters/postgres/session-store.ts | Hashes, expiry/touch/revoke e cleanup. |
| [CRIAR] | backend/src/modules/identity/adapters/postgres/oauth-transaction-store.ts | Binding/state e consumo único, dados temporários protegidos. |
| [ALTERAR] | backend/src/config/env.ts | Feature flag e secrets OAuth obrigatórios somente quando comunidade habilitada. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 003-identity: users(id UUID,name,status active|blocked|deletion_pending,role user|moderator|admin,email nullable privado,email_verified_at nullable,created_at,updated_at); external_identities(id,user_id,provider,provider_user_id text,UNIQUE(provider,provider_user_id)); sessions(token_hash PK,user_id,created_at,authenticated_at,expires_at,last_seen_at,revoked_at,csrf_secret); oauth_transactions(state_hash PK,browser_binding_hash,verifier_ciphertext,return_path,expires_at,consumed_at). Índices user_id/expiração. Nunca persistir token de sessão puro ou token GitHub.
2. SessionStore.create/resolve/revoke/revokeAll/touch/cleanup recebe hash e datas; resolve verifica agora<expiresAt, agora-lastSeen<24h, revogada=null e User active. Token CSPRNG 32 bytes, SHA-256 para armazenamento; sessão normal absoluta 7 dias, idle 24h; admin absoluta 8h, idle 30min [decisão técnica proposta], ações sensíveis authTime<=5min. lastSeen atualiza no máximo a cada 5min sem estender expiresAt.
3. IdentityStore.resolveExternal(provider,id,name): transação cria user+identity ou encontra existente; concorrência UNIQUE não cria usuário órfão. Nome GitHub mutável não identifica; provider ID convertido para texto sem perda. Email ausente é aceito; nenhum merge por email. Bloqueado/deletion_pending nunca reativado pelo login.
4. OAuthTransactionStore.create/consume usa state hash, prazo 10min, cookie transiente de binding (valor aleatório 32 bytes, hash no DB), verifier PKCE cifrado por chave de ambiente fora do DB. Consumo atômico testa binding/expiração/usado e marca consumido antes de troca do code; falha exige reiniciar fluxo. Nunca logar code/state/verifier. Keyring permite rotação enquanto fluxos antigos expiram. Produção exige secrets só quando COMMUNITY_ENABLED=true.
5. IdentityStore.lockActiveUser em operações comunitárias deve ser implementado na mesma conexão/transação da escrita: adapter compartilhado de autorização SQL garante bloqueio/exclusão concorrentes. Port de aplicação não expõe lock Sequelize; capacidades atômicas do store recebem actorId e verificam estado na transação.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 com catálogo P0 e migration003, dois users/identidades fakes, clock fixo, secrets temporários exclusivos de teste.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E13-U01](./BACKEND_TEST_PLAN.md#e13-u01): Clock fixo: limite exato de 7d/24h ou admin 8h/30min expira; revoke e blocked negam; touch não estende absoluto; email nulo não invalida GitHub.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E13-I01](./BACKEND_TEST_PLAN.md#e13-i01): Duas resoluções simultâneas de mesmo provider/id criam uma conta, sem órfão; renomear login preserva userId; dois providers/IDs com email igual não vinculam.
- [E13-I02](./BACKEND_TEST_PLAN.md#e13-i02): Tokens diferentes geram hashes diferentes; busca usa índice; duas instâncias compartilham sessão e revogação imediata; consume OAuth concorrente permite uma vez; dump DB não contém token de sessão ou verifier legível.
- [E13-I03](./BACKEND_TEST_PLAN.md#e13-i03): Status/role/deletion_pending concorrem com resolve/touch: usuário inelegível nunca obtém sessão nova após commit; prefixo __Host e token não aparecem em projeção pública ou log.

Arquivos de teste a criar:

- `backend/tests/unit/e13-identity-storage.test.ts` — Cenários [E13](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-U de regras e erros de Criar identidade e persistência de sessões.
- `backend/tests/integration/e13-identity-storage.test.ts` — Cenários [E13](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I das fronteiras reais e persistência/operação de Criar identidade e persistência de sessões.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E13](./BACKEND_TEST_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Schema P1 migra sobre catálogo P0 sem mudar IDs; sessão tem validação server-side e operação concorrente testada; flags deixam leitura pública funcionando sem OAuth. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e14"></a>

### E14. Implementar login GitHub, sessão e logout seguros

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E14](./BACKEND_IMPLEMENTATION_ORDER.md#14-implementar-login-github-sess%C3%A3o-e-logout-seguros) · [Testes E14](./BACKEND_TEST_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E13](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).

#### Objetivo

Entregar authorization code com state/PKCE, sessão própria e proteções do navegador.

#### Estado atual

Stores e políticas P1 prontos; não há endpoints auth anteriores. Infra CORS/erro/requestId é reutilizada.

#### Regra de negócio e restrições

[R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas), [R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado).

- **[R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email) — GitHub estável e vínculo sem merge por email:** OAuth identifica por providerUserId textual estável; nome é mutável e email opcional privado. Não vincular contas automaticamente por email nem reativar bloqueadas ao logar. Token GitHub descartado, escopos mínimos; AuthorProfile independente; cadastro não aceita role.
- **[R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas) — Sessão opaca, expiração e revogação imediatas:** Cookie guarda token aleatório e DB hash. Resolver verifica estado atual do usuário, absoluta/idle e revogação. Login e mudança de privilégio invalidam sessão anterior; logout revoga no DB. Normal7d/24h, admin8h/30min, auth recente5min, lastSeen granular5min; cookie prod __Host Secure HttpOnly Lax Path=/ sem Domain.
- **[R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado) — OAuth de uso único e CSRF vinculado:** State imprevisível, binding ao browser e PKCE S256 protegem callback; code só é trocado após consumo válido. Mutações autenticadas exigem Origin e CSRF da mesma sessão. Callback/returnPath allowlist; transação10min; /auth/me/csrf no-store. CORS/SameSite não substituem CSRF.

#### Decisão arquitetural

OAuthIdentityProvider é única port de rede externa; secrets só no adapter. Sessão de blog em cookie, sem JWT/localStorage. Provider fake apenas em testes, impossível ativar em produção.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/identity/application/ports/oauth-identity-provider.ts | Trocar code PKCE e devolver identidade verificada mínima. |
| [CRIAR] | backend/src/modules/identity/adapters/github/oauth-provider.ts | HTTP oficial limitado/timeout, tokens descartados e mensagens seguras. |
| [CRIAR] | backend/src/modules/identity/application/github-login.ts | Iniciar/consumir fluxo, resolver user e criar sessão nova. |
| [CRIAR] | backend/src/modules/identity/application/get-me.ts | DTO privado mínimo de sessão ativa. |
| [CRIAR] | backend/src/modules/identity/application/logout.ts | Revogar sessão atual/todas com reautenticação para todas. |
| [CRIAR] | backend/src/modules/identity/adapters/http/auth.routes.ts | Redirects, cookies, me/CSRF/logout e no-store. |
| [CRIAR] | backend/src/http/session.ts | Resolver sessão e anexar Actor tipado, sem confiar no body. |
| [CRIAR] | backend/src/http/csrf.ts | Origin e token sincronizado para mutações. |
| [ALTERAR] | backend/src/composition.ts | Conectar provider/stores/auth/clock; fake só composition de teste. |
| [ALTERAR] | backend/src/http/app.ts | Montar auth sob flag e middlewares privados por rota. |
| [ALTERAR] | backend/openapi.yaml | Contratos auth/me/cookie/CSRF e falhas sem exposição. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. beginGithubLogin({returnPath}) aceita apenas caminhos locais allowlistados (raiz e rotas públicas localizadas), nunca URL //host ou callback fornecido pelo cliente. Cria state/verifier S256/binding e expira em 10min; redireciona para URL oficial configurada estaticamente, escopos mínimos para identidade (sem repositórios/email obrigatório). Callback fixo da config.
2. completeGithubLogin({code,state,bindingCookie}) valida/consome transação antes do provider. Provider troca code com verifier, timeout 5s e resposta tipada limitada; resolve ID estável, descarta access token após obter perfil. Erro/rejeição/provider indisponível retorna erro seguro no-store e limpa cookie transiente; não faz retry cego de code de uso único. Resolve user ativo, revoga sessão anterior do browser se houver, gera nova sessão e redireciona para returnPath limpo.
3. Cookie prod __Host-blog_session: Secure,HttpOnly,SameSite=Lax,Path=/,sem Domain; Max-Age não ultrapassa expiração server-side. Dev HTTP blog_session sem Secure só NODE_ENV=dev/test. Transiente segue Secure/HttpOnly/Lax e prazo OAuth. Session authentication resolve hash, atualiza lastSeen por granularidade; cookie inválido/expirado→401, não fallback para outro usuário.
4. GET /me→{id,displayName,role} para sessão válida e no-store; GET /auth/csrf entrega token sincronizado derivado/armazenado por sessão, nunca em CDN. Para POST/PATCH/PUT/DELETE autenticados verificar sessão, Origin exata, JSON Content-Type quando houver body e X-CSRF-Token em comparação segura. Logout sem body também exige Origin+CSRF. Logout atual revoga e limpa cookie; repetir com token/cookie já revogado retorna 401, resultado de sessão segue revogado; não prometer 204 sem autenticação. logout-all exige authTime<=5min, revoga todas e limpa atual.
5. Não cachear auth/me/CSRF/erros. Acrescentar OpenAPI cookies, headers e redirects 302 do OAuth, 200 me/CSRF e 204 logout. Middleware privado montado apenas em rotas privadas; GET editorial com cookie continua resposta pública não personalizada.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Provider GitHub fake local via HTTP stub com limites/timeout e DB real; agentes browser A/B com cookies independentes; sem conta GitHub real em CI.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E14-U01](./BACKEND_TEST_PLAN.md#e14-u01): Provider/store fakes: state ausente/inválido/reusado/expirado ou binding de outro browser não chama provider; callback rejeitado limpa transiente; returnPath externo rejeitado.
- [E14-U02](./BACKEND_TEST_PLAN.md#e14-u02): Cookie flags por ambiente, session fixation gera token novo, CSRF de outra sessão falha, Origin inválida e content-type indevido falham antes do caso de uso.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E14-I01](./BACKEND_TEST_PLAN.md#e14-i01): Fake provider em servidor HTTP isolado + DB: login→cookie→me→csrf→logout; após logout me 401; duas requisições callback só uma cria sessão; provider timeout 503 e nenhum token nos logs.
- [E14-I02](./BACKEND_TEST_PLAN.md#e14-i02): Supertest agents A/B: token CSRF de A não modifica B; bloqueado não loga; role atual do DB prevalece; público não tem Set-Cookie; todos endpoints privados no-store; fake auth recusado com production config.

**API/contrato/autorização na borda:**

- [E14-A01](./BACKEND_TEST_PLAN.md#e14-a01): GET auth/github emite transiente/redirect fixo; callback válido302+novo cookie, inválido400 seguro sem provider, indisponível503; me401/200 e logout204 apenas com sessão/Origin/CSRF.
- [E14-A02](./BACKEND_TEST_PLAN.md#e14-a02): Me/auth/csrf no-store; cookie prod tem todos flags; request privado de A com CSRF B403; callback replay/binding estranho não cria sessão.

Arquivos de teste a criar:

- `backend/tests/unit/e14-github-auth.test.ts` — Cenários [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-U de regras e erros de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/integration/e14-github-auth.test.ts` — Cenários [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-I das fronteiras reais e persistência/operação de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/api/e14-github-auth.test.ts` — Cenários [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-A de endpoints/status/DTO/auth de Implementar login GitHub, sessão e logout seguros.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E14](./BACKEND_TEST_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Login/expiração/logout/CSRF funcionam sem GitHub real no CI; identidade estável e mínima; callback de replay e cross-browser bloqueados. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e15"></a>

### E15. Aplicar permissões, bloqueio e limites de abuso

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E15](./BACKEND_IMPLEMENTATION_ORDER.md#15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) · [Testes E15](./BACKEND_TEST_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

#### Objetivo

Definir proteção reutilizável para cada capacidade comunitária e operações administrativas protegidas.

#### Estado atual

Sessão e Actor existem, mas nenhuma autorização de ação/ownership foi implementada. Autor editorial continua sem poder administrativo.

#### Regra de negócio e restrições

[R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade).

- **[R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio) — Negação por padrão, ownership e bloqueio:** Visitante lê; ativo interage; dono edita seu texto; moderator/admin moderam/removem sem editar assinatura alheia. Admin gerencia papéis/bloqueio; autor editorial não tem esse poder. Último admin ativo protegido; bootstrap por operação protegida/UUID, não email. Store revalida ator na transação para concorrência.
- **[R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade) — Limites de abuso por capacidade:** Limitar tentativas/ações por conta e origem com estado compartilhado; devolver429 e Retry-After; não usar IP cru como identidade de domínio. Comentário3/min20/h, report5/h, like60/min e demais limites da [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso); cleanup das chaves temporárias. Proxy confiável é pré-condição.

#### Decisão arquitetural

Autorização de negócio nos casos de uso e revalidação do estado do ator no store transacional; HTTP só extrai identidade. Role simples user/moderator/admin, sem framework RBAC.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/identity/domain/authorization.ts | Política pura por ação/role/ownership. |
| [CRIAR] | backend/src/modules/identity/application/manage-user.ts | Block/unblock/role e revogação atômica por capacidade. |
| [CRIAR] | backend/src/modules/identity/adapters/cli/manage-user.ts | Admin operacional com ID e motivo; bootstrap explícito. |
| [ALTERAR] | backend/src/modules/identity/adapters/postgres/identity-store.ts | Lock de usuário, atualização e revogação/auditoria atômicas. |
| [CRIAR] | backend/migrations/004-security-controls.ts | Rate limit temporário e auditoria administrativa restrita. |
| [CRIAR] | backend/src/http/rate-limit.ts | Traduz limites de ação e Retry-After para HTTP. |
| [CRIAR] | backend/src/infrastructure/rate-limiter.ts | Counters temporários PostgreSQL atômicos e chaves de origem pseudonimizadas. |
| [ALTERAR] | backend/src/composition.ts | Injetar política/capacidade de abuso nas mutações. |
| [ALTERAR] | backend/openapi.yaml | Documentar 403/429/503 e necessidade de reautenticação. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) com valores locais seguros e sem secrets reais. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. authorize(actor,action,resource) nega por padrão: ativo interage; só dono edita texto; dono/moderator/admin removem comentário; moderator/admin mudam visibilidade, nunca body alheio; apenas admin bloqueia/atribui roles no P1 (moderador não recebe exceção implícita). AuthorProfile não vira role. Cadastro/login ignoram nenhum role enviado: rejeitam campo inesperado.
2. Gestão via CLI operacional identity-admin --actor-user-id <admin> --target <UUID> --action block|unblock|role --reason; bootstrap inicial é comando distinto restrito à credencial operacional com ID explícito e auditoria, nunca primeiro login/email. Alteração de role/status trava User, atualiza e revoga todas sessões na mesma transação. Unblock volta active sem ressuscitar sessões nem publicações; novo login necessário. Proibir remover/bloquear último admin ativo para evitar perda de operação; recuperação é bootstrap operacional auditado.
3. Comente/like/modere obtém lock no User na mesma transação de escrita; deletion_pending/blocked impede commit. Sessão consultada em cada request, role/status atuais, nada de claims antigos. ID UUID não concede permissão.
4. RateLimiter.consume({action,actorId?,originKey,now}) usa contadores PostgreSQL por janela com upsert atômico/TTL, para limites funcionarem entre instâncias sem Redis. Comentário: 3/min +20/h conta, complemento 60/h IP pseudonimizado; OAuth 10 inícios/10min por origem, callback 20/10min; likes 60/min conta; views 30/min identificador +120/min origem; reports 5/h conta; export 1/dia. Valores técnicos iniciais ajustáveis, 429 Retry-After até a maior janela bloqueadora. Não guardar IP cru: chave HMAC de finalidade separada; retenção curta em [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o). Edge limita tráfego total conforme [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).
5. Falha do limiter de mutação fecha operação com 503 (não libera sem controle); leitura pública continua conforme DB/cache. Audit registra ator/alvo/ação/motivo/timestamp e requestId sem body/email. Mecanismo de roles e deny-by-default se aplica mesmo sem UI administrativa.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Users user/moderator/admin/blocked/deletion_pending; duas sessões por usuário e duas instâncias com mesmo PostgreSQL; origem/HMAC/clock fictícios.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E15-U01](./BACKEND_TEST_PLAN.md#e15-u01): Matriz roles×ações×ownership: visitante negado, user só próprio, moderator não edita texto alheio/não bloqueia user, admin último protegido; AuthorProfile sem conta não autoriza.
- [E15-U02](./BACKEND_TEST_PLAN.md#e15-u02): Clock fake no limite 3/min, 20/h e virada de janela: request limítrofe aceito, seguinte 429 com Retry-After correto; falha store→503.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E15-I01](./BACKEND_TEST_PLAN.md#e15-i01): Duas instâncias/20 requests concorrentes respeitam teto compartilhado; bloquear user concorre com mutação e impede novas escritas após commit do bloqueio; todas sessões deixam de resolver.
- [E15-I02](./BACKEND_TEST_PLAN.md#e15-i02): CLI por actor não admin falha; bootstrap explícito auditado; role update revoga sessão antiga e exige login novo; exclusão futura usa mesma disciplina de locks sem deadlock.

**API/contrato/autorização na borda:**

- [E15-A01](./BACKEND_TEST_PLAN.md#e15-a01): Rotas fixture protegidas por user/moderator/admin: role injetada em payload rejeitada, proprietário errado403; limites concorrentes429+Retry-After, falha limiter503.

Arquivos de teste a criar:

- `backend/tests/unit/e15-authorization-abuse.test.ts` — Cenários [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-U de regras e erros de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/integration/e15-authorization-abuse.test.ts` — Cenários [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-I das fronteiras reais e persistência/operação de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/api/e15-authorization-abuse.test.ts` — Cenários [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-A de endpoints/status/DTO/auth de Aplicar permissões, bloqueio e limites de abuso.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E15](./BACKEND_TEST_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Cada ação tem política verificável; bloqueio/roles são imediatos; não há elevação por payload/email; limites são compartilhados e testados em concorrência. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e16"></a>

### E16. Entregar curtidas idempotentes e estado privado

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E16](./BACKEND_IMPLEMENTATION_ORDER.md#16-entregar-curtidas-idempotentes-e-estado-privado) · [Testes E16](./BACKEND_TEST_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

#### Objetivo

Permitir uma curtida por conta/artigo, compartilhada entre traduções, e leituras públicas/privadas separadas.

#### Estado atual

P0 preserva UUID do artigo; nenhum like existe. Infra de sessão/permissões/limites é dependência pronta, não reimplementada.

#### Regra de negócio e restrições

[R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo).

- **[R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo) — Curtida única e idempotente por artigo:** Uma conta ativa curte um articleId uma vez, compartilhado entre traduções. PUT garante presença, DELETE garante ausência somente da própria associação. PK(articleId,userId), sem toggle, recurso público e CSRF/limite; sem contador derivado inicial.

#### Decisão arquitetural

LikeStore garante intenção PUT/DELETE por constraint e transação; sem toggle e sem contador materializado inicial.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/005-likes.ts | Unicidade conta/artigo, FKs e índice reverso. |
| [CRIAR] | backend/src/modules/community/application/ports/like-store.ts | ensurePresent/ensureAbsent/listMine sem operadores ORM. |
| [CRIAR] | backend/src/modules/community/application/set-like.ts | Intenção idempotente, autorização e recurso público. |
| [CRIAR] | backend/src/modules/community/application/get-my-likes.ts | Consulta privada limitada de preferências. |
| [CRIAR] | backend/src/modules/community/adapters/postgres/like-store.ts | INSERT/DELETE atômicos e consultas indexadas. |
| [CRIAR] | backend/src/modules/community/adapters/http/likes.routes.ts | PUT/DELETE + sessão/CSRF/limite e GET privado. |
| [ALTERAR] | backend/src/composition.ts | Ligar likes a auth/limiter/persistência. |
| [ALTERAR] | backend/openapi.yaml | Semântica idempotente, estado privado e 204/404. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado) sob flags e proteções corretas, antes do 404. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 005-likes: article_likes(article_id FK,user_id FK,created_at,PK(article_id,user_id)), índice user_id para exclusão/export. Article público para interação significa pai ativo e ao menos uma tradução published. As contagens vêm de COUNT por artigo.
2. putLike({articleId,actor}) recebe usuário da sessão, verifica ativo/recurso público e limiter, insere ON CONFLICT DO NOTHING. DELETE remove apenas associação do ator e exige o mesmo recurso público; ambos 204 inclusive ausência de linha no DELETE. Recurso não público/inexistente→404, sem remover/alterar outro usuário por payload. Transação trava User antes de verificar artigo/associação; concorrência editorial respeita lock do artigo, para arquivamento e escrita terem ordem definida.
3. GET /api/v1/me/article-likes?articleIds=<UUIDs> recebe até 50 IDs distintos; retorna somente {articleId,liked} dos artigos públicos solicitados, no-store. Nenhum estado meu em stats público. APIs de lista não fazem query de likes por card. [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) adiciona stats públicas em lote/por artigo.
4. Reexecutar import/renomear slug/reordenar série conserva likes por UUID. DELETE de conta em [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) remove associações e COUNT passa a refletir isso sem job de contador.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Dois usuários ativos, um bloqueado, artigo PT/EN público e outro arquivado; duas instâncias/50 requests concorrentes e DB real.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E16-U01](./BACKEND_TEST_PLAN.md#e16-u01): Stub LikeStore: usuário do input não pode sobrescrever actor; estado público requerido; PUT repetido mantém intenção e DELETE repetido mantém ausência.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E16-I01](./BACKEND_TEST_PLAN.md#e16-i01): 50 PUT concorrentes do mesmo usuário→uma linha; dois usuários→duas; 50 DELETE→zero apenas do ator; falha/rollback não corrompe outro like.
- [E16-I02](./BACKEND_TEST_PLAN.md#e16-i02): PT e EN compartilham articleId e uma curtida; import e slug change preservam; privado A não retorna estado de B; CSRF/blocked negam sem escrita.

**API/contrato/autorização na borda:**

- [E16-A01](./BACKEND_TEST_PLAN.md#e16-a01): PUT/DELETE like autenticados204 idempotentes, anônimo401/blocked403/draft404/CSRF inválido403; GET me/article-likes no-store e só usuário atual.

Arquivos de teste a criar:

- `backend/tests/unit/e16-likes.test.ts` — Cenários [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado)-U de regras e erros de Entregar curtidas idempotentes e estado privado.
- `backend/tests/integration/e16-likes.test.ts` — Cenários [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado)-I das fronteiras reais e persistência/operação de Entregar curtidas idempotentes e estado privado.
- `backend/tests/api/e16-likes.test.ts` — Cenários [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado)-A de endpoints/status/DTO/auth de Entregar curtidas idempotentes e estado privado.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E16](./BACKEND_TEST_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Likes são idempotentes entre instâncias e idiomas; estado privado não entra em cache público; imports preservam associações. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e17"></a>

### E17. Comentários moderados e denúncias operáveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E17](./BACKEND_IMPLEMENTATION_ORDER.md#17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) · [Testes E17](./BACKEND_TEST_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado).

#### Objetivo

Abrir discussão localizada com pré-moderação, edição segura, remoção e fila operacional real.

#### Estado atual

Não há comentários, estados, renderer comunitário, moderação ou denúncias. Reutilizar sessão, autorização e rate limit de [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)/[E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

#### Regra de negócio e restrições

[R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente), [R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria), [R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana).

- **[R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente) — Comentário pertence à tradução e nasce pendente:** Conta ativa cria texto na tradução pública, autoria da sessão; status pending até revisão. Somente visible aparece/conta publicamente; autor vê seus estados em área privada. 1..5000 caracteres Unicode, max5links, Markdown restrito, HTML/imagem/iframe negados, URLs permitidas; 3/min20/h.
- **[R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria) — Edição, moderação e remoção preservam autoria:** Dono pode editar texto não deletado e volta a pending. Moderator/admin decide visible/hidden com motivo, nunca muda body alheio. Delete autorizado é terminal e conserva só tombstone, com body apagado. Deleted não restaura/edita; update com versão antiga não sobrescreve; dono não define status.
- **[R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana) — Denúncia única aberta e decisão humana:** Conta ativa denuncia comentário público com motivo categorizado; uma aberta por conta/alvo. Quantidade não esconde conteúdo automaticamente. Responsável humano resolve/dismiss com auditoria. 5/h por conta, sessão/CSRF; nenhum body de denúncia em logs; moderator/admin decide.

#### Decisão arquitetural

CommentStore/ReportStore são capacidades transacionais. Markdown restrito é política própria, distinta do editorial. Moderador muda visibilidade, nunca texto com assinatura alheia. Comunidade permanece desabilitada até [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/006-comments.ts | Comments/reports/audit, índices, estados e concorrência por versão. |
| [CRIAR] | backend/src/modules/community/domain/comment.ts | Estados, ownership, versionamento e transições. |
| [CRIAR] | backend/src/modules/community/application/ports/comment-store.ts | Criar/editar/moderar/remover e ler conjuntos visíveis/privados atomicamente. |
| [CRIAR] | backend/src/modules/community/application/ports/report-store.ts | Denúncia aberta única e resolução auditada. |
| [CRIAR] | backend/src/modules/community/application/comments.ts | Casos create/edit/delete/listMine/listPublic, entradas e permissões explícitas. |
| [CRIAR] | backend/src/modules/community/application/moderation.ts | Fila, decisão de visibilidade, denúncia e resolução. |
| [CRIAR] | backend/src/modules/community/adapters/markdown/comment-markdown.ts | AST restrito, limite de links e sanitização segura de saída. |
| [CRIAR] | backend/src/modules/community/adapters/postgres/comment-store.ts | Predicado público, cursor, CAS version e auditoria transacional. |
| [CRIAR] | backend/src/modules/community/adapters/postgres/report-store.ts | Deduplicação/resolução e consulta restrita. |
| [CRIAR] | backend/src/modules/community/adapters/http/comments.routes.ts | Rotas públicas/privadas e schema strict de body/cursor. |
| [CRIAR] | backend/src/modules/community/adapters/http/moderation.routes.ts | Fila/decisão/denúncias com RBAC e no-store. |
| [ALTERAR] | backend/openapi.yaml | Comentários localizados, filas, versões, reports e exemplos de estados. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) sob flags e proteções corretas, antes do 404. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 006-comments: comments(id UUID,translation_id FK,user_id nullable FK,body_markdown nullable,status pending|visible|hidden|deleted,created_at,updated_at,deleted_at,version integer default 1); índice (translation_id,status,created_at,id), reverso user_id. moderation_actions(id,actor_id nullable,target_id,action,reason,at,request_id) restrita. reports(id,comment_id,reporter_id,reason spam|abuse|personal-data|other,description<=500,status open|resolved|dismissed,created_at,resolved_at), UNIQUE parcial(reporter_id,comment_id) WHERE status=open.
2. POST translation comments: pai/tradução públicos, ativo/CSRF/limite, body 1..5000 pontos de código Unicode após NFC, CRLF→LF e trim só extremidades; preservar indentação/fences internos. Máximo 5 links, URL http/https/mailto, zero HTML cru/iframe/imagens externas. Parser AST allowlist de parágrafo/lista/ênfase/link/código; rejeitar nós não permitidos com 422, não regex. Novo status pending, 201 Location, autor da sessão; resposta privada explica awaitingReview. Timestamp clock servidor.
3. GET público só visible com cursor base64url JSON validado {createdAt,id,translationId}, ordenado asc; limit 20,max50; cursor de outra tradução/malformado→400; não retornar body de pending/hidden/deleted. GET /me/comments lista próprios envios/status em no-store. Moderator GET /moderation/comments?status=pending e /moderation/reports em no-store paginado; estes endpoints extras concretizam fila exigida pela arquitetura.
4. PATCH próprio body exige expectedVersion inteiro (otimismo), status diferente de deleted; edição visible/hidden/pending volta pending, updatedAt=now/version+1; motivo anterior de moderação fica restrito. Retry de versão antiga→409 COMMENT_VERSION_CONFLICT. Não aceitar userId/translationId/status no payload. DELETE dono ou moderator/admin marca deleted, body=null imediatamente, deletedAt/version atualizados; repetição pelo ator autorizado→204; manter tombstone ID, sem retornar como comentário público plano nem contar.
5. PATCH /moderation/comments/:id {status:visible|hidden,reason,expectedVersion}: só pending/visible/hidden, deleted terminal; auditoria na mesma transação. Moderação não altera body; conflito de versão impede aprovar texto que foi editado após revisão. Denúncia de comentário visible por usuário ativo, até 5/h, repetida aberta retorna existente (200; nova 201); não muda visibilidade pelo volume. PATCH /moderation/reports/:id resolve/dismiss com motivo e auditoria; transição terminal não reabre automaticamente.
6. Renderer seguro devolve renderedHtml sanitizado allowlist junto de bodyMarkdown no DTO, links com rel ugc nofollow noopener noreferrer; bodyMarkdown bruto não pode ser injetado como HTML. Logs não recebem body/descrição de denúncia. Bloquear conta não oculta retrospectivamente comentários: moderação decide caso a caso; edição posterior exige ativo. Canal de denúncia/responsável/pre-moderação e retenção [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)/[E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) são condições para habilitar.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Usuários A/B/moderator/admin, traduções PT/EN, comentários em todos estados e versões; PostgreSQL real+parser/sanitizer+browser teste para XSS.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E17-U01](./BACKEND_TEST_PLAN.md#e17-u01): Matriz pending→visible→edit→pending→hidden→deleted; deleted não edita/restaura; owner não muda status, moderator não muda body alheio.
- [E17-U02](./BACKEND_TEST_PLAN.md#e17-u02): Markdown com javascript: link, HTML, iframe, imagem ou 6 links falha; código com sinais HTML dentro de fence preservado como texto; 5000 chars passa/5001 falha; Unicode/CRLF normalizados sem destruir código.
- [E17-U03](./BACKEND_TEST_PLAN.md#e17-u03): Cursor inválido/outro locale/tradução rejeitado; denunciar não oculta automaticamente.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E17-I01](./BACKEND_TEST_PLAN.md#e17-i01): A cria pending: público lista/count zero, privado A mostra pending, B não vê; moderador aprova→lista/count um; edição volta pending/count zero; stale moderation version→409.
- [E17-I02](./BACKEND_TEST_PLAN.md#e17-i02): DELETE repetido conserva tombstone sem body e count zero; user bloqueado e edição por B→403; tradução draft/archive→404 sem nova interação.
- [E17-I03](./BACKEND_TEST_PLAN.md#e17-i03): Reports concorrentes mesma conta/alvo→uma aberta; resolver/dismiss auditado, falha de auditoria faz rollback da decisão; XSS renderizado não executa em teste de browser. Cursor pagina timestamps iguais sem duplicação.

**API/contrato/autorização na borda:**

- [E17-A01](./BACKEND_TEST_PLAN.md#e17-a01): POST comment201 pending/Location; público lista vazio até aprovação; GET me mostra próprio status; B não edita A403; staleVersion409; XSS/5001chars422.
- [E17-A02](./BACKEND_TEST_PLAN.md#e17-a02): Moderação visible/hidden exige role/reason/version; deleted terminal; report novo201/repetido200, fila privada, resolução auditada; contagem só visible.

Arquivos de teste a criar:

- `backend/tests/unit/e17-comments-moderation.test.ts` — Cenários [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-U de regras e erros de Comentários moderados e denúncias operáveis.
- `backend/tests/integration/e17-comments-moderation.test.ts` — Cenários [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-I das fronteiras reais e persistência/operação de Comentários moderados e denúncias operáveis.
- `backend/tests/api/e17-comments-moderation.test.ts` — Cenários [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-A de endpoints/status/DTO/auth de Comentários moderados e denúncias operáveis.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E17](./BACKEND_TEST_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Fluxo criar→revisar→publicar→editar→revisar→remover testado; contagem corresponde exatamente a visible; filas/denúncias operáveis e sem exposição de PII. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e18"></a>

### E18. Registrar views deduplicadas e estatísticas reais

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E18](./BACKEND_IMPLEMENTATION_ORDER.md#18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) · [Testes E18](./BACKEND_TEST_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado), [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

#### Objetivo

Entregar as três métricas com escopo explícito, deduplicação concorrente e privacidade definida.

#### Estado atual

Nenhuma métrica própria existe; leitura pública P0 não conta visitas. Likes/comentários reais já disponíveis, sem números de demonstração.

#### Regra de negócio e restrições

[R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos).

- **[R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico) — View qualificada estimada com dedupe atômico:** Não contar GET/SSG. Browser observa10s visíveis e envia POST; servidor usa identidade permitida, HMAC diário/versão e UNIQUE por tradução/janela UTC. Dedupe inserido e daily incrementado juntos. Sem fingerprint/IP cru; dedupe48h; origin/limite; payload não fornece identidade/dia. Cookie anônimo só com escolha permitida; sem escolha não conta.
- **[R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos) — Stats verdadeiras com escopo e início públicos:** Likes são artigo; comentários contam visible por tradução; views somam visitas locais versionadas. Totais incluem apenas traduções atualmente públicas, com nome/definição/início de instrumentação documentados. Nunca semear popularidade; não misturar raw requests/analytics antigos/versões distintas; minhas curtidas ficam fora do cache público.

#### Decisão arquitetural

ViewRecorder encapsula transação de dedupe+agregado. PostgreSQL é estado compartilhado, sem histórico eterno por request. Stats públicos separados do estado do usuário e do snapshot editorial.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/007-views.ts | Dedupe temporário e agregados diários versionados. |
| [CRIAR] | backend/src/modules/community/domain/view-policy.ts | Identidade/janela/versão e elegibilidade da métrica. |
| [CRIAR] | backend/src/modules/community/application/ports/view-recorder.ts | Registrar observação atomicamente sem expor aceitação ao cliente. |
| [CRIAR] | backend/src/modules/community/application/ports/stats-reader.ts | Contagens públicas por escopo e versão. |
| [CRIAR] | backend/src/modules/community/application/record-view.ts | Validar recurso, identidade permitida e chamar recorder. |
| [CRIAR] | backend/src/modules/community/application/get-stats.ts | Stats com definições/escopos e limites numéricos. |
| [CRIAR] | backend/src/modules/community/adapters/postgres/view-recorder.ts | Dedupe e upsert em única transação. |
| [CRIAR] | backend/src/modules/community/adapters/postgres/stats-reader.ts | Agregação de likes/comments/views sem N+1. |
| [CRIAR] | backend/src/modules/community/adapters/http/views.routes.ts | Observação, consentimento técnico/cookie opcional e 204. |
| [CRIAR] | backend/src/modules/community/adapters/http/stats.routes.ts | Stats públicos cacheáveis, sem personalização. |
| [CRIAR] | frontend/src/features/articles/useQualifiedView.ts | Timer de visibilidade e envio limitado sob preferência de privacidade. |
| [CRIAR] | docs/adr/005-metrics-privacy.md | Semântica/versionamento/limitações e identificador aprovado. |
| [ALTERAR] | backend/openapi.yaml | Views/consent/stats, números e início da medição. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) sob flags e proteções corretas, antes do 404. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) com valores locais seguros e sem secrets reais. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Antes de coletar, docs/adr/005-metrics-privacy.md registra versão v1, início real, identificador permitido e finalidade. Default conservador do plano: sessão para autenticado; anônimo conta só após opção explícita permitindo cookie de métrica de primeira parte. Sem identificador permitido, POST validado devolve 204 sem incrementar; não classificar IP/UA como pessoa. Essa opção é política técnica/produto proposta, não declaração de base legal. Registrar decisão real do mantenedor em [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).
2. Migration 007-views: view_deduplication(key_hash,translation_id,window_date UTC,metric_version,expires_at,PK(key_hash,translation_id,window_date,metric_version)); article_view_daily(translation_id,date_utc,metric_version,count_accepted bigint>=0,PK(...)). Dedupe expira 48h após início da janela, índice expires_at. key=HMAC(segredo diário, finalidade|v1|tipoIdentidade|id); seleção de dia usa now servidor, nunca date do payload. Chaves diárias necessárias ficam até janela expirar; rotação não muda chave dentro do dia ativo.
3. Browser envia POST /article-translations/:id/views após 10 segundos acumulados de aba visível; não usar GET/SSG/prefetch. API valida origem, translationId público, limite e payload estrito {metricVersion:'v1'} sem userId/elapsed confiável. Cookie anônimo aleatório só é emitido por POST /views/consent {enabled:true,policyVersion} com Origin/JSON/limite e opção explícita; enabled:false apaga cookie e deixa de contar anônimo, não apaga agregado não identificável. Requisição autenticada usa sessão validada; cookie de sessão inválido não gera identidade anônima automaticamente.
4. Transação tenta INSERT dedupe ON CONFLICT DO NOTHING; só inserted incrementa daily com count=count+1 por upsert. Ambos falham/commit juntos. Duas abas mesmo identificador/tradução/dia→1; PT+EN→2, novo dia→novo, anon→login pode duplicar (limitação publicada). 204 não revela aceitação/duplicidade. 400 input,404 não público,429 abuso,503 DB. Bots óbvios podem ser descartados sem prometer antifraude.
5. GET /articles/:id/stats?locale=pt-BR→{articleId,locale,likesTotal,commentsTotal,commentsInLocale,viewsTotal,viewsInLocale,metricVersion,measurementStartedAt,definition}. Article público e tradução do locale publicada obrigatórios; commentsTotal/viewsTotal somam somente traduções atualmente públicas. likesTotal é artigo global; comments contam só visible; excluídos/bloqueados seguem política [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)/[E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o). Somar dias de versão escolhida, nunca misturar v1/v2. Sem histórico anterior inventado. Bigint→inteiro JSON seguro conforme [E09](#e09-expor-api-rest-documentada-e-cache-http-simples); overflow gera diagnóstico e 503 STATS_UNAVAILABLE antes de arredondar.
6. Cache stats curto 30s público e sem liked/session/cookie; minhas curtidas permanecem [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado) no-store. Metadados/sitemap/lastmod editorial não mudam por interações. Cleanup em [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) purga chaves sem apagar agregado. Índices e COUNT em lote inicialmente, nenhum contador derivado de likes/comentários.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: DB com likes/comments e migração007, relógio UTC nos limites de dia, identidades sintéticas, chave HMAC de teste, duas instâncias/100 POST concorrentes.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E18-U01](./BACKEND_TEST_PLAN.md#e18-u01): Clock fake atravessa meia-noite UTC: mesma janela dedupe, próxima aceita; HMAC finalidades diferentes não colidem; identidade ausente não chama recorder; timer conta só visibilidade.
- [E18-U02](./BACKEND_TEST_PLAN.md#e18-u02): Stats escopo: likes artigo, comments só visible por locale, views versões separadas; número acima de safe integer não arredonda.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E18-I01](./BACKEND_TEST_PLAN.md#e18-i01): 100 POST concorrentes mesma chave→uma dedupe e count=1; falha induzida entre insert e upsert desfaz ambos; retry depois conta uma vez; duas traduções/dias/identidades contam independentemente.
- [E18-I02](./BACKEND_TEST_PLAN.md#e18-i02): GET de artigo/SSG não cria métricas; sem consentimento anônimo não ganha cookie/contagem; consent→POST aceita; retirada cessa novas contagens; response 204 igual em aceito/duplicado.
- [E18-I03](./BACKEND_TEST_PLAN.md#e18-i03): Stats não revela userId/cookies, cache público de A/B idêntico; pending/hidden/deleted não contam; mudar like/view não altera snapshot lastmod.

**API/contrato/autorização na borda:**

- [E18-A01](./BACKEND_TEST_PLAN.md#e18-a01): POST views204 indistinguível aceito/duplicado/sem identidade, GET article não incrementa; origem inválida403, draft404, versão inválida400, abuso429; com sessão exige CSRF.
- [E18-A02](./BACKEND_TEST_PLAN.md#e18-a02): POST consent explícito cria/apaga cookie; stats200 com números/versão/início, sem liked ou sessão; locale ausente de tradução404; overflow503 seguro.

Arquivos de teste a criar:

- `backend/tests/unit/e18-views-stats.test.ts` — Cenários [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-U de regras e erros de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/integration/e18-views-stats.test.ts` — Cenários [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-I das fronteiras reais e persistência/operação de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/api/e18-views-stats.test.ts` — Cenários [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-A de endpoints/status/DTO/auth de Registrar views deduplicadas e estatísticas reais.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E18](./BACKEND_TEST_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Likes/comentários/views reais e explicados, dedupe correto sob concorrência/rollback; coleta anônima só com política ativada e nenhuma falsa métrica histórica. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e19"></a>

### E19. Excluir contas, exportar dados e executar retenção

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E19](./BACKEND_IMPLEMENTATION_ORDER.md#19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) · [Testes E19](./BACKEND_TEST_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).

#### Objetivo

Cumprir política técnica de dados de ponta a ponta, com processo de exportação inicialmente manual autenticado.

#### Estado atual

User/session/interações existem; nenhuma exclusão/exportação/retenção operacional anterior. Backup/restore P0 já definido e precisa evoluir para não ressuscitar dados pessoais.

#### Regra de negócio e restrições

[R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis).

- **[R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas) — Exclusão efetiva com bloqueio de escritas:** Pedido autenticado recente revoga sessões e coloca deletion_pending imediatamente. Finalização idempotente remove identidade/credenciais/perfil privado/likes e conteúdo pessoal de comentários; preserve apenas tombstones e crédito editorial tratado separadamente. Transação/locks impedem corrida com novas interações; remover userId não é suficiente para anonimizar texto; ledger restrito reaplica exclusões após restore.
- **[R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis) — Exportação e retenção executáveis:** Exportar dados pertinentes do próprio titular por pedido autenticado, inicialmente manual protegido. Executar cleanup em lotes e preservar totais ao converter diário para mensal. Inventário inclui logs/proxy/provedores. Dedupe48h,logs14d,audit90d,backup30d,diário13meses são defaults; holds específicos revisados. Registro de exclusão35d proposto cobre restore, não retém perfil.

#### Decisão arquitetural

Caso de uso em identity solicita capacidade AccountLifecycleStore que coordena SQL das tabelas necessárias em transação explícita; exceção deliberada de integração entre módulos na infraestrutura, sem expor models à aplicação ou criar UoW genérico.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/008-account-lifecycle.ts | Solicitações de exclusão/exportação, ledger/retenção e agregado mensal versionado. |
| [CRIAR] | backend/src/modules/identity/application/ports/account-lifecycle-store.ts | Preparar/finalizar exclusão e solicitar/exportar dados atomicamente. |
| [CRIAR] | backend/src/modules/identity/application/delete-account.ts | Reautenticação, bloqueio imediato e resultado 202 idempotente operacional. |
| [CRIAR] | backend/src/modules/identity/application/export-account.ts | Solicitação autenticada e projeção segura para atendimento. |
| [CRIAR] | backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | Integração transacional com comunidade, purge e replay de exclusões. |
| [CRIAR] | backend/src/modules/identity/adapters/http/account.routes.ts | DELETE me/POST export com CSRF/no-store. |
| [CRIAR] | backend/src/modules/identity/adapters/cli/account-operations.ts | Finalizar/extrair/atender pedidos por ID protegido. |
| [CRIAR] | backend/scripts/cleanup.ts | Retenção em lotes e agregação mensal com checkpoints. |
| [ALTERAR] | backend/src/modules/community/adapters/postgres/stats-reader.ts | Somar agregados mensais+diários sem duplicação. |
| [ALTERAR] | backend/scripts/restore.mjs | Reaplicar ledger antes de liberar sistema restaurado. |
| [ALTERAR] | docs/PRIVACY_OPERATIONS.md | Inventário P1, prazos aprovados, atendimento, ledger e exceções. |
| [ALTERAR] | backend/openapi.yaml | Fluxos 202, reautenticação e solicitação de direitos. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) sob flags e proteções corretas, antes do 404. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) com valores locais seguros e sem secrets reais. |
| [ALTERAR] | backend/package.json | Registrar comandos operacionais da [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e somente dependências realmente usadas, mantendo lockfile coerente. |
| [ALTERAR] | backend/package-lock.json | Fixar dependências adicionadas para [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), sem atualização de pacotes não relacionados. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. DELETE /me exige sessão ativa+Origin+CSRF e authTime<=5min; marcar deletion_pending, revogar sessões e gravar deletion request em uma transação de preparação com lock User. API retorna 202 {requestId,status:'deletion_pending'} e limpa cookie. Interações futuras proibidas. Processar inline após preparação ou por comando operacional periódico simples; falhas ficam persistidas para retry, sem exigir worker/Redis. Interface operacional consulta status, não endpoint público de PII.
2. finalizeDeletion(requestId) idempotente remove likes, identities, sessions, email/avatar privado e credenciais futuras; comentários do usuário viram deleted/body=null/userId=null (escolha mais restritiva do plano para não supor que texto é anônimo), preservando tombstone. Reports removem reporterId e descrição pessoal; auditoria mantém decisão/alvo/motivo revisado dentro da retenção, pseudonimizando ator conforme política. AuthorProfile não é apagado automaticamente: relação/crédito/licença requer tratamento editorial separado registrado ao titular. Remover User após dependências ou manter tombstone apenas UUID sem perfil se auditoria exigir; default remover, FKs nullable onde necessário.
3. Registrar UUIDs de exclusões e versão/tempo em registro restrito mínimo separado do backup restaurável, por janela de 30 dias+tempo de restore (default operacional 35 dias). Sua finalidade é reaplicar deleções, não histórico de perfil. Restore de [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) executa replay idempotente antes de reabrir tráfego; registrar conclusão e purgar ledger após janela aprovada. Prazos sujeitos à validação operacional/legal do mantenedor, não regras legais deste plano.
4. POST /me/export com sessão/CSRF e limite 1/dia gera solicitação persistida, 202 e identificador opaco; não manda dados para email do payload. Processo manual por operador autenticado usa CLI export-account --request-id, gera JSON allowlist {profile,externalProviderName,comments,likes,progress futuro} sem hashes/tokens/dados de terceiros; entrega pelo canal autenticado definido, prazo operacional inicial 7 dias a validar, trilha de atendimento e expiração do arquivo em 24h. Não gerar link público permanente. [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) automatiza entrega, não redefine escopo.
5. Cleanup --now usa clock servidor, batches 500 e execução idempotente: sessões expiradas/revogadas conforme janela aprovada (default purge imediato no próximo job), OAuth expirado, rate windows expiradas+1h, view dedupe >=48h, body de deleted já nulo, audit 90d, logs 14d, backups 30d; view daily 13 meses agrega mensal por tradução/versão antes de remover dias, preservando total. Migration inclui article_view_monthly; stats soma diário+mensal sem sobreposição e mantém mesma versão. Não deletar automaticamente registro sujeito a retenção excepcional documentada; hold restrito por ID/finalidade/prazo, sem congelar todo banco.
6. Scheduler cron do host executa cleanup/finalize e alerta atraso/falha; não fazer trabalho pesado dentro de cada request. Inventário documenta fornecedores/IP no proxy e políticas de comentário/conta/consentimento. Não concluir enquadramento jurídico; mantenedor valida política antes da ativação [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).
7. Migration008 adapta FKs de reports.reporter_id e atores de auditoria para nullable/ON DELETE SET NULL quando ainda não forem; comments.user_id já admite nulo. External identities/sessions/likes são removidos explicitamente na finalização. Pedidos finalizados não conservam perfil/email em payload JSON; guardar só IDs/estado/prazo necessários ao atendimento/ledger. Teste de exclusão verifica cada FK e ausência de órfãos pessoais.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Conta com todas relações e backup anterior à exclusão em DB isolado; ledger de teste separado, artefatos export privados temporários e clock de retenção.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E19-U01](./BACKEND_TEST_PLAN.md#e19-u01): Lifecycle stub: authTime vencido nega antes de preparar; deletion_pending bloqueia novas ações; retry finalização não duplica efeitos; export allowlist exclui token/hash/email de terceiros.
- [E19-U02](./BACKEND_TEST_PLAN.md#e19-u02): Clock fake em fronteira 48h/90d/13meses: elegíveis corretos; exceção legal operacional registrada impede purge daquele alvo apenas.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E19-I01](./BACKEND_TEST_PLAN.md#e19-i01): Conta com sessões/likes/comments/reports: DELETE→sessões revogadas imediatamente; finalização parcial com falha faz rollback e retry conclui; body pessoal removido, tombstone e catálogo preservados; PUT like concorrente não sobrevive exclusão.
- [E19-I02](./BACKEND_TEST_PLAN.md#e19-i02): Export solicitação de A não pode ser atendida/baixada por B; JSON contém só dados pertinentes de A, nenhuma credencial; expiração elimina artefato.
- [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03): Backup anterior à exclusão restaurado em DB isolado + replay ledger não ressuscita perfil/interações; cleanup duas vezes preserva total daily+monthly, sem apagar dentro da retenção.

**API/contrato/autorização na borda:**

- [E19-A01](./BACKEND_TEST_PLAN.md#e19-a01): DELETE me com auth recente202 e cookie limpo, auth antiga403 REAUTH_REQUIRED; após preparo me401; POST export202 gera pedido próprio no-store e rate1/dia.

Arquivos de teste a criar:

- `backend/tests/unit/e19-account-lifecycle.test.ts` — Cenários [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-U de regras e erros de Excluir contas, exportar dados e executar retenção.
- `backend/tests/integration/e19-account-lifecycle.test.ts` — Cenários [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Excluir contas, exportar dados e executar retenção.
- `backend/tests/api/e19-account-lifecycle.test.ts` — Cenários [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-A de endpoints/status/DTO/auth de Excluir contas, exportar dados e executar retenção.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E19](./BACKEND_TEST_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

Exclusão impede writes e termina em purge real; exportação manual tem pedido/entrega verificável; cleanup executável e restore respeita exclusões; política aprovada antes de coletar. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e20"></a>

### E20. Habilitar comunidade com observabilidade e operação completas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E20](./BACKEND_IMPLEMENTATION_ORDER.md#20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) · [Testes E20](./BACKEND_TEST_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1). **Dependências:** [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

#### Objetivo

Validar comunidade inteira e acrescentar métricas úteis, documentação operacional e ferramentas de contribuição.

#### Estado atual

P0 já possui logs JSON/requestId/health/alertas; P1 possui auth/interações/privacidade implementados nas etapas anteriores, ainda atrás de flag.

#### Regra de negócio e restrições

[R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis), [R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana).

- **[R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio) — Negação por padrão, ownership e bloqueio:** Visitante lê; ativo interage; dono edita seu texto; moderator/admin moderam/removem sem editar assinatura alheia. Admin gerencia papéis/bloqueio; autor editorial não tem esse poder. Último admin ativo protegido; bootstrap por operação protegida/UUID, não email. Store revalida ator na transação para concorrência.
- **[R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade) — Limites de abuso por capacidade:** Limitar tentativas/ações por conta e origem com estado compartilhado; devolver429 e Retry-After; não usar IP cru como identidade de domínio. Comentário3/min20/h, report5/h, like60/min e demais limites da [E15](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso); cleanup das chaves temporárias. Proxy confiável é pré-condição.
- **[R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos) — Stats verdadeiras com escopo e início públicos:** Likes são artigo; comentários contam visible por tradução; views somam visitas locais versionadas. Totais incluem apenas traduções atualmente públicas, com nome/definição/início de instrumentação documentados. Nunca semear popularidade; não misturar raw requests/analytics antigos/versões distintas; minhas curtidas ficam fora do cache público.
- **[R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis) — Exportação e retenção executáveis:** Exportar dados pertinentes do próprio titular por pedido autenticado, inicialmente manual protegido. Executar cleanup em lotes e preservar totais ao converter diário para mensal. Inventário inclui logs/proxy/provedores. Dedupe48h,logs14d,audit90d,backup30d,diário13meses são defaults; holds específicos revisados. Registro de exclusão35d proposto cobre restore, não retém perfil.
- **[R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana) — Habilitação depende de capacidade humana:** Comunidade só habilita quando auth/abuso/moderação/métricas/exclusão/retention e responsável estão operantes. Observabilidade acrescenta latência/erros/filas sem IDs arbitrários como labels. Fake provider nunca produção; sem funcionalidades simuladas; métricas internas protegidas/PII redigida.

#### Decisão arquitetural

Reutilizar logs e controles; métricas de baixa cardinalidade por rota template/status/ação, endpoint interno restrito. Nenhum tracing distribuído ou plataforma de dashboards obrigatória.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/infrastructure/metrics.ts | Métricas limitadas de HTTP/pool/ações, sem PII em labels. |
| [ALTERAR] | backend/src/http/request-log.ts | Acrescentar observação de histogramas mantendo logs e redação. |
| [ALTERAR] | backend/src/http/app.ts | Métricas internas protegidas e gate comunitário. |
| [CRIAR] | backend/scripts/community-smoke.mjs | Fluxo integrado staging com usuários de teste e cleanup. |
| [CRIAR] | docs/COMMUNITY_OPERATIONS.md | Fila, abuso, papéis, métricas e capacidade humana. |
| [CRIAR] | docs/adr/004-sessions.md | Cookies opacos, revogação e CSRF. |
| [CRIAR] | CODE_OF_CONDUCT.md | Conduta e canal/responsável verdadeiros. |
| [CRIAR] | .github/ISSUE_TEMPLATE/bug.yml | Reprodução de bug sem solicitar secrets. |
| [CRIAR] | .github/ISSUE_TEMPLATE/content.yml | Correção/tradução referenciando artigo e locale. |
| [CRIAR] | .github/pull_request_template.md | Problema, verificação e revisão editorial. |
| [ALTERAR] | docs/RELEASE_EVIDENCE.md | Evidências comunitárias, políticas aprovadas e carga medida. |
| [CRIAR] | frontend/src/features/articles/community.tsx | Integração de login/likes/comments/stats reais com estados privados fora do HTML cacheado. |
| [ALTERAR] | backend/package.json | Registrar comandos operacionais da [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente. |
| [ALTERAR] | backend/package-lock.json | Fixar dependências adicionadas para [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Instrumentar duração p50/p95/p99, 5xx/429, falhas OAuth por categoria, pool DB, pendências de moderação, falhas de cleanup/exclusão, views rejeitadas agregadas sem identidade. Histogramas limitados; não label userId/slug/requestId. Endpoint /internal/metrics em rede privada ou collector do host, não API pública. Logs de segurança redigidos e source maps protegidos se adotar error tracking.
2. docs/COMMUNITY_OPERATIONS.md define moderador responsável, turno/capacidade de resposta, canal de denúncia real, conta admin protegida/MFA no GitHub, política pending/visible/hidden/deleted, tratamento de bloqueados, reautenticação, consentimento e retenção aprovados. ADR004 explica sessões/revogação/CSRF. CODE_OF_CONDUCT e templates de issue/PR úteis entram aqui, sem inventar contatos.
3. Gate COMMUNITY_ENABLED=true somente quando [E13](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)–[E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) passam e fake provider impossível em produção. Smoke staging: login→me/CSRF→like→comentário pending→moderação visible→view→stats→logout; depois conta de fixture excluída e purge/restore ensaiados. Frontend deve mostrar pending, rejeições/429 e escopos das métricas, sem números placeholders. Rota editorial continua sem sessão.
4. Testar carga representativa antes de otimizar: registrar fixture/duração/concorrência/latências/pool/erros; objetivo inicial p95 leitura <=500ms em carga acordada no runbook, não promessa sem ambiente. Queries lentas usam EXPLAIN em teste. Ajustar índices com evidência, sem Redis/fila por antecipação. Alertar backlog de moderação >24h e cleanup atrasado >2 execuções como defaults operacionais ajustáveis.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Staging/CI com frontend e backend reais, provider fake só ambiente teste; fixtures de comunidade e carga sintética descrita em relatório.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E20-U01](./BACKEND_TEST_PLAN.md#e20-u01): Métricas com 100 slugs/usuários resultam mesmas labels de rota; não registrar body/token/ID como dimensão; flag desligada mantém leitura e bloqueia rotas de comunidade.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E20-I01](./BACKEND_TEST_PLAN.md#e20-i01): Smoke completo com provider fake isolado em CI, provider real apenas smoke controlado de staging configurado pelo operador; pending/moderação/count e exclusão funcionam ponta a ponta.
- [E20-I02](./BACKEND_TEST_PLAN.md#e20-i02): Teste de carga com catálogo/interações representativos registra p95/pool/429; indisponibilidade provider/DB/limiter gera alertas e respostas corretas, sem quebrar leitura estática. Gate falha quando runbook obrigatório ou política ainda não aprovado.

**API/contrato/autorização na borda:**

- [E20-A01](./BACKEND_TEST_PLAN.md#e20-a01): COMMUNITY_ENABLED=false mantém editorial200 e rotas comunitárias404; true permite smoke completo; internal metrics inacessível na rota pública e sem labels privadas.

Arquivos de teste a criar:

- `backend/tests/unit/e20-community-release.test.ts` — Cenários [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-U de regras e erros de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/integration/e20-community-release.test.ts` — Cenários [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/api/e20-community-release.test.ts` — Cenários [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Habilitar comunidade com observabilidade e operação completas.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E20](./BACKEND_TEST_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas--ap%C3%B3s-publica%C3%A7%C3%A3o).

#### Critério de aceite

M2/P1 pronto com pacote comunitário completo, testes/autorização/privacidade/moderação humana e métricas reais; nenhuma flag habilitada só porque endpoints respondem. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<!-- navigation:anchor:start -->
<a id="nav-section-017"></a>
<!-- navigation:anchor:end -->

## Evolução futura — P2

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="e21"></a>

### E21. Conta local com confirmação e recuperação completas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E21](./BACKEND_IMPLEMENTATION_ORDER.md#21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) · [Testes E21](./BACKEND_TEST_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Adicionar email/senha sem enfraquecer sessões, privacidade e prevenção de abuso existentes.

#### Estado atual

Identity/User/Session/CSRF/cleanup/exclusão já atendem GitHub. Não existe senha/email transacional; OAuth não deve ganhar senha vazia. Executar quando a necessidade de acesso sem GitHub estiver comprovada e houver fornecedor/canal de email.

#### Regra de negócio e restrições

[R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo), [R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos).

- **[R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo) — Conta própria exige ciclo completo:** Conta local só habilita com hashing adequado, verificação de email, login, reset, envio confiável e abuso. Confirmar posse antes de interagir; sessão é a mesma do GitHub. Email sem remoção de pontos/+suffix; passphrases longas sem truncar; Argon2id calibrado; role proibida; sem auto-link por email.
- **[R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos) — Tokens de confirmação/reset são restritos e únicos:** Token aleatório armazenado como hash tem propósito/prazo/consumo único. Reset altera senha e revoga sessões atomicamente, sem autenticar automaticamente. Links vêm de domínio fixo. Respostas forgot/resend não enumeram; outbox cifrada/temporária, token não logado; envio limitado e observável.

#### Decisão arquitetural

Mesma User e SessionStore; acrescentar LocalCredential, AccountToken, PasswordHasher e EmailSender. Uma fonte de identidade por vínculo explícito; não mesclar por coincidência de email.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/009-local-credentials.ts | Credenciais locais, tokens por finalidade e outbox cifrada. |
| [CRIAR] | backend/src/modules/identity/application/ports/password-hasher.ts | hash/verify/needsRehash sem dependência de algoritmo no domínio. |
| [CRIAR] | backend/src/modules/identity/application/ports/email-sender.ts | Entrega transacional por propósito sem acoplamento a fornecedor. |
| [CRIAR] | backend/src/modules/identity/application/local-auth.ts | Register/login/verify/resend/forgot/reset e antienumeração. |
| [CRIAR] | backend/src/modules/identity/adapters/crypto/password-hasher.ts | Argon2id calibrado e upgrade de hash. |
| [CRIAR] | backend/src/modules/identity/adapters/email/email-sender.ts | Fornecedor real/sandbox e timeouts/retries seguros. |
| [CRIAR] | backend/src/modules/identity/adapters/postgres/local-credential-store.ts | Unicidade email e consumo atômico de token. |
| [CRIAR] | backend/src/modules/identity/adapters/http/local-auth.routes.ts | Schemas e endpoints locais sobre sessão existente. |
| [CRIAR] | backend/scripts/send-email-outbox.ts | Envio confiável idempotente e observável. |
| [ALTERAR] | backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | Excluir novos dados sensíveis e preservar allowlist do export. |
| [ALTERAR] | backend/scripts/cleanup.ts | Expirar account tokens/outbox sem reter conteúdo pessoal. |
| [ALTERAR] | backend/openapi.yaml | Contratos locais e erros genéricos. |
| [ALTERAR] | docs/PRIVACY_OPERATIONS.md | Email obrigatório local/fornecedor/retention e nova finalidade. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) sob flags e proteções corretas, antes do 404. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) com valores locais seguros e sem secrets reais. |
| [ALTERAR] | backend/package.json | Registrar comandos operacionais da [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente. |
| [ALTERAR] | backend/package-lock.json | Fixar dependências adicionadas para [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 009-local-credentials: local_credentials(user_id PK,email_normalized UNIQUE,password_hash,changed_at), account_tokens(id,user_id,purpose verify|reset,token_hash UNIQUE,expires_at,consumed_at), email_outbox(id,purpose,encrypted_payload,status pending|sent|failed,attempts,next_attempt_at). Senha só hash Argon2id com salt e parâmetros calibrados no container, registrados no hash; verificar referência oficial vigente na execução, sem assumir valores do documento de 2026 eternos. Port hash/verify/needsRehash; nunca SHA rápido para senha.
2. Cadastro input {displayName,email,password}; normalize email trim+domínio lowercase, preservar local part e não remover pontos/+suffix. Passphrase 15..128 pontos de código, aceitar espaços sem trim/truncamento, máximo de bytes do request continua valendo. Confirmar posse antes de interagir. Resposta 202 genérica para novo/existente; não conceder role nem auto-vincular GitHub de mesmo email. Login mensagem genérica 401 e comparação dummy para conta ausente; sem bloqueio permanente por tentativa externa. Local não verificado não interage; GitHub com email ausente segue válido por identidade externa.
3. Token 32 bytes CSPRNG/hash SHA-256, propósito e uso único; verify expira 24h, reset 30min [defaults técnicos]; reenvio invalida anteriores da mesma finalidade; resposta forgot/resend 202 genérica. Links usam PUBLIC_SITE_URL fixo, sem Host cliente; não colocar tokens nos logs/analytics/referrer. Limites envio 3/h por email pseudonimizado +10/h origem, login 5/15min por conta+origem com backoff temporário.
4. Reset consome token e troca hash/revoga todas sessões numa transação, sem login automático. Concorrência no token só uma vence; falha não consome parcialmente. Verify marca emailVerifiedAt; token de reset não confirma email por acidente. Login local cria mesma sessão/CSRF/expiração do GitHub.
5. EmailSender.send recebe envelope mínimo; outbox com payload cifrado e TTL curto é gravada na mesma transação de geração do token, job Node pequeno envia com idempotency key/retries 1m/5m/30m/2h até expiração. Falha não registra corpo/token e alerta; não enviar token expirado. Credenciais fornecedor fora do banco, configuração SPF/DKIM/DMARC e canal sandbox verificados antes de habilitar. Não exigir Redis.
6. Vincular OAuth e local exige sessão recente e prova das duas identidades; explicitamente não implementar auto-link. Para evitar redesenho, vinculação fica comando/fluxo protegido futuro após necessidade, com conflito ACCOUNT_LINK_REQUIRED ao tentar cadastrar sobre identidade já vinculada. [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) exclui credenciais/tokens/outbox pessoal e export nunca inclui hash.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: DB atualizado, email sandbox (sem destinatários reais), adapter Argon2id real para calibração/integração e fake no caso de uso; clock/tokens de teste.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E21-U01](./BACKEND_TEST_PLAN.md#e21-u01): Hash fake: senha 14/15/128/129 chars, Unicode/espaços sem truncamento; normalização preserva +suffix/pontos; email público nunca sai em DTO.
- [E21-U02](./BACKEND_TEST_PLAN.md#e21-u02): Clock/tokens fake: propósito errado, vencido/consumido negados; reset não autentica e pede revogação; existente/inexistente respondem mensagem genérica igual.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E21-I01](./BACKEND_TEST_PLAN.md#e21-i01): DB+email sandbox: cadastro→email→verify→login→forgot→reset→sessões antigas 401; token concorrente consumido uma vez; falha transacional mantém senha/token anteriores.
- [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02): Falha do fornecedor faz retry outbox sem duplicar token/vínculo, respeita expiração; dump/log não tem senha/token legíveis; excluir conta remove credenciais/tokens/outbox; OAuth sem email continua funcionando.

**API/contrato/autorização na borda:**

- [E21-A01](./BACKEND_TEST_PLAN.md#e21-a01): Register/forgot/resend202 genéricos, login inválido401 genérico; verify/reset tokens inválidos400 seguros e propósito errado falha; reset válido204 e não autentica.
- [E21-A02](./BACKEND_TEST_PLAN.md#e21-a02): Login local reutiliza sessão/CSRF; conta não verificada não comenta/curte; GitHub sem email mantém acesso.

Arquivos de teste a criar:

- `backend/tests/unit/e21-local-auth.test.ts` — Cenários [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-U de regras e erros de Conta local com confirmação e recuperação completas.
- `backend/tests/integration/e21-local-auth.test.ts` — Cenários [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Conta local com confirmação e recuperação completas.
- `backend/tests/api/e21-local-auth.test.ts` — Cenários [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Conta local com confirmação e recuperação completas.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E21](./BACKEND_TEST_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Ativar conta local somente com confirmação/reset/hash/email/abuso/exclusão integrados; nenhuma rota parcial habilitada e nenhuma enumeração direta. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e22"></a>

### E22. Respostas limitadas e progresso explícito de leitura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E22](./BACKEND_IMPLEMENTATION_ORDER.md#22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) · [Testes E22](./BACKEND_TEST_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Evoluir comentários e trilhas sem árvores ilimitadas nem confundir view com aprendizado.

#### Estado atual

Comentários planos possuem tombstone, User e Article IDs estáveis; séries ordenadas já funcionam. Executar quando uso demonstrar necessidade de continuidade de discussão/aprendizagem; favoritos são condicionais ao mesmo pedido real, não parte de P0/P1.

#### Regra de negócio e restrições

[R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um), [R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos).

- **[R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um) — Respostas têm profundidade máxima um:** Reply referencia raiz da mesma tradução; parent removido vira tombstone para preservar resposta. Paginar raízes e replies separadamente. Não self-reference, parent de outro locale/tradução ou reply de reply; moderação/edição continuam [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).
- **[R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos) — Progresso explícito e grafo sem ciclos:** Conclusão é escolha autenticada por artigo, compartilhada entre traduções, persistida apesar de reordenação. Denominador usa membros publicados no locale. Pré-requisitos estruturados não podem conter ciclos. Nada de scroll/view como conclusão; UNIQUE(user,article), grafo sem self/ciclo; favorito separado de like e sem métrica pública.

#### Decisão arquitetural

Reutilizar comment.ts/store/routes e módulos existentes; learning é subárea de publishing application apoiada em port própria de progresso. Não criar LMS genérico ou coletar scrolls.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/010-learning-threads.ts | parentId e progresso; incluir prerequisitos/bookmarks só ao ativar respectivas subcapacidades. |
| [ALTERAR] | backend/src/modules/community/domain/comment.ts | Profundidade/mesma tradução e tombstone de raiz. |
| [ALTERAR] | backend/src/modules/community/adapters/postgres/comment-store.ts | Validar parent atomicamente e paginar raízes/respostas. |
| [ALTERAR] | backend/src/modules/community/adapters/http/comments.routes.ts | parentId opcional e rota paginada de replies. |
| [CRIAR] | backend/src/modules/publishing/application/ports/progress-store.ts | Marcação explícita/lista de progresso privado por artigo. |
| [CRIAR] | backend/src/modules/publishing/application/reading-progress.ts | Conclusão por membros visíveis e preferências privadas opcionais. |
| [CRIAR] | backend/src/modules/publishing/adapters/postgres/progress-store.ts | Upsert idempotente e queries privadas. |
| [CRIAR] | backend/src/modules/publishing/adapters/http/progress.routes.ts | PUT/GET autenticados; bookmarks apenas se ativados. |
| [ALTERAR] | backend/src/modules/publishing/domain/series.ts | Pré-requisitos sem ciclos quando subcapacidade for ativada. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/publication-store.ts | Persistir grafo de pré-requisitos validado no import se ativado. |
| [ALTERAR] | backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | Excluir/exportar progresso e bookmarks. |
| [ALTERAR] | backend/openapi.yaml | Respostas, progresso e contratos condicionais efetivamente entregues. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) sob flags e proteções corretas, antes do 404. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 010-learning-threads adiciona parent_id nullable em comments e índice para respostas. Parent deve existir na mesma translationId e ser raiz (parent.parentId=null), profundidade máxima 1, sem self-reference/ciclo. Validar transacionalmente e constraint trigger com lock dos nós; raiz removida continua tombstone para filhos visíveis. Root listing paginado separado de replies GET /comments/:id/replies; incluir tombstone da raiz apenas quando necessário para encadear filhos, nunca body apagado. commentsTotal/commentsInLocale continuam número de mensagens visible, raízes+respostas; tombstone não conta.
2. reading_progress(user_id,article_id,completed_at,PK(user_id,article_id)); PUT /me/progress/:articleId {completed:true|false}: true upsert sem trocar primeira completedAt em retry, false remove; ativo/CSRF, artigo público. GET /me/progress?seriesId=&locale= retorna concluídos visíveis/total visível e percent, empty→0; progresso é compartilhado PT/EN e reordenação não perde histórico. Arquivamento tira denominador/visibilidade, preserva marca até exclusão/retirada pelo usuário; republicação volta a considerar. Nunca inferir conclusão de view/scroll.
3. article_prerequisites(article_id,prerequisite_id PK,sem self), somente se texto de pré-requisito não bastar. Escrita editorial sob mesmo lock do import; DFS/topological validation de lote e estado final rejeita ciclos e referências inexistentes. Query pública só aponta pré-requisito publicado no locale, indica lacuna sem expor draft. Importador valida e preserva UUID.
4. Favoritos só se prioridade de produto confirmada: bookmarks(user_id,article_id PK,created_at) com PUT/DELETE /me/bookmarks/:articleId, lista privada paginada; nenhuma contagem pública de favorito, nenhuma equivalência com like. Mesmos estados/locks/exclusão de progresso. Enquanto gatilho ausente, não criar tabela/rotas de bookmarks nem prerequisites; registrar subcapacidade adiada no milestone.
5. Exclusão/export de [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) passa a tratar progresso/favoritos; snapshot editorial pode incluir prerequisitos públicos, sem dados privados. Testes novos ampliam as suites existentes de comments, stats, import e lifecycle, preservando histórico do mesmo componente.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: DB com catálogo bilíngue/série com lacuna, comentários raiz/reply/tombstone, contas A/B; ativar fixtures apenas das subcapacidades escolhidas.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E22-U01](./BACKEND_TEST_PLAN.md#e22-u01): Parent próprio/de outra tradução/não raiz rejeita; tombstone permite preservar encadeamento; ciclo A→B→A e self prerequisite rejeitam.
- [E22-U02](./BACKEND_TEST_PLAN.md#e22-u02): Progresso: true duas vezes preserva data, false remove, série vazia 0, reordenar mantém histórico; view não marca; favorito não incrementa like.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E22-I01](./BACKEND_TEST_PLAN.md#e22-i01): Raiz removida com reply visible: body raiz indisponível/tombstone, reply paginado e count 1; corrida criar reply/apagar raiz mantém integridade; árvore maior que profundidade 1 nunca persiste.
- [E22-I02](./BACKEND_TEST_PLAN.md#e22-i02): Progress em PT aparece em EN pelo articleId; archive altera denominador sem apagar histórico; exclusão conta remove progresso/bookmarks; snapshot nunca expõe marcas privadas; import concorrente de prerequisites não permite ciclo.

**API/contrato/autorização na borda:**

- [E22-A01](./BACKEND_TEST_PLAN.md#e22-a01): POST reply aceita parent raiz da mesma tradução; reply de reply422; GET replies paginado não revela body apagado. PUT progress true/false idempotente, GET próprio no-store, visitante401.

Arquivos de teste a criar:

- `backend/tests/unit/e22-learning-threads.test.ts` — Cenários [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-U de regras e erros de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/integration/e22-learning-threads.test.ts` — Cenários [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-I das fronteiras reais e persistência/operação de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/api/e22-learning-threads.test.ts` — Cenários [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-A de endpoints/status/DTO/auth de Respostas limitadas e progresso explícito de leitura.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E22](./BACKEND_TEST_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Subcapacidades ativadas têm migrations/API/testes completos; nenhuma ligação entre métrica e aprendizagem; comentários/séries existentes evoluem sem recriar IDs ou quebrar clientes planos. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e23"></a>

### E23. Busca por idioma e relacionados editoriais

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E23](./BACKEND_IMPLEMENTATION_ORDER.md#23-busca-por-idioma-e-relacionados-editoriais) · [Testes E23](./BACKEND_TEST_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Melhorar descoberta com PostgreSQL antes de introduzir motor externo ou recomendações por IA.

#### Estado atual

ListArticles aceita q em título/descrição; tags/séries/snapshot funcionam. Não há busca full-text/curadoria relacionada. Executar quando catálogo/consultas reais mostrarem limitação da busca simples.

#### Regra de negócio e restrições

[R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais).

- **[R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais) — Busca localizada e relacionados reais:** Full-text usa idioma e fallback técnico explícito, só público. Relacionados priorizam curadoria/série/tags, excluem atual/duplicados e versões ausentes. Mesmas validações/visibilidade/cache de P0; queries parametrizadas; sem recomendação por IA/perfil para acervo pequeno.

#### Decisão arquitetural

Evoluir ArticleReader/list-articles, mesma fonte Git e predicado público. Search index é projeção derivada da tradução; não nova fonte de verdade.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/migrations/011-search.ts | Índice textual localizado e backfill/rebuild compatível. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/article-reader.ts | Full-text/ranking e relacionados com predicado público. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/publication-store.ts | Atualizar projeção textual/curadoria junto do import. |
| [ALTERAR] | backend/src/modules/publishing/application/list-articles.ts | q com relevância opcional, preservando filtros. |
| [ALTERAR] | backend/src/modules/publishing/application/content.dto.ts | relatedArticles opcional e sort=relevance. |
| [ALTERAR] | backend/src/modules/publishing/adapters/http/article.schemas.ts | Relevância somente com q e query limitada. |
| [ALTERAR] | backend/src/modules/publishing/adapters/cli/content.schemas.ts | Curadoria explícita por UUID e ordem. |
| [ALTERAR] | backend/openapi.yaml | Busca/relacionados e fallback de idioma explícitos. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Migration 011-search adiciona tsvector/index GIN por tradução com configuração de locale (pt-BR→portuguese,en→english; locale futuro sem stemmer→simple explícito); título peso A, descrição B e texto extraído do body C. Atualizar na transação de import; backfill paginado sobre catálogo publicado/draft, queries sempre filtram publicação. Escolher gerado/trigger conforme compatibilidade validada da major, documentar custo de rebuild.
2. q continua 2..100 chars parametrizado; websearch/plain query segura, sem interpolação de operadores arbitrários. Adicionar sort=relevance somente quando q presente, tie-break publishedAt/id; filtros/paginação existentes mantidos. Sem q, comportamento anterior idêntico. Sanitizar highlights como texto/tokens, nunca HTML arbitrário.
3. Relacionados: relatedArticleIds curados no manifesto, ordem explícita, sem self/duplicado/inexistente; retornar publicados do locale na ordem, depois membros da série e overlap de tags sem repetição, máximo 4. Não exigir preencher quatro se catálogo insuficiente. Sem perfil de usuário/IA. ArticleReader.getRelated pode compor projeções em lote; canonical/alternates não mudam.
4. Snapshot e OpenAPI evoluem com campo opcional relatedArticles e schemaVersion compatível; cache chave contém q/sort/locale/revisão, invalida em import/retirada. Teste EXPLAIN/largura de catálogo compara baseline de [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas); não adicionar serviço externo se GIN satisfaz carga.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: PostgreSQL16 com volume representativo e termos PT/EN/draft, baseline de busca anterior, AST de conteúdo e medição EXPLAIN em ambiente de teste.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E23-U01](./BACKEND_TEST_PLAN.md#e23-u01): q ausente mantém ordem antiga; relevance sem q rejeita; curadoria self/duplicada inválida; relacionados sem versão EN são omitidos sem substituir PT.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E23-I01](./BACKEND_TEST_PLAN.md#e23-i01): DB com termos PT/EN e draft: resultados/ranking específicos do idioma, nenhum draft; import altera índice na mesma revisão; rollback não deixa texto fantasma; retirar conteúdo invalida resultados.
- [E23-I02](./BACKEND_TEST_PLAN.md#e23-i02): EXPLAIN/carga representativa compara latência/custo com q anterior; related curado→série→tags mantém ordem/limite sem repetição; highlights maliciosos não injetam HTML.

**API/contrato/autorização na borda:**

- [E23-A01](./BACKEND_TEST_PLAN.md#e23-a01): GET articles?q=...&sort=relevance aceita com q e rejeita sem q400; filtros antigos intactos, idiomas isolados e relatedArticles sem draft.

Arquivos de teste a criar:

- `backend/tests/unit/e23-localized-search.test.ts` — Cenários [E23](#e23-busca-por-idioma-e-relacionados-editoriais)-U de regras e erros de Busca por idioma e relacionados editoriais.
- `backend/tests/integration/e23-localized-search.test.ts` — Cenários [E23](#e23-busca-por-idioma-e-relacionados-editoriais)-I das fronteiras reais e persistência/operação de Busca por idioma e relacionados editoriais.
- `backend/tests/api/e23-localized-search.test.ts` — Cenários [E23](#e23-busca-por-idioma-e-relacionados-editoriais)-A de endpoints/status/DTO/auth de Busca por idioma e relacionados editoriais.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E23](./BACKEND_TEST_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Busca útil medida, índices mantidos atomicamente e API retrocompatível; relacionados reais e localizados, sem preenchimento fictício. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e24"></a>

### E24. Evoluir operação editorial e ativação de releases sob necessidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E24](./BACKEND_IMPLEMENTATION_ORDER.md#24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) · [Testes E24](./BACKEND_TEST_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Permitir operação editorial mais acessível sem introduzir duas fontes concorrentes ou publicação parcialmente ativada.

#### Estado atual

Git é fonte única; import CAS e snapshot consistente funcionam, aceitando janela API nova/site antigo. Executar quando colaboração por PR ou divergência de release tiver custo comprovado. Painel/CMS não é tarefa de P0.

#### Regra de negócio e restrições

[R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial).

- **[R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial) — Colaboração mantém única autoridade editorial:** Painel proposto cria PR Git e usa revisão existente; não escreve texto no banco como segunda fonte. Ativação futura usa snapshot candidato e CAS, IDs editoriais preservados. Autor não publica sem capacidade/revisão; trocar para CMS exige nova ADR de autoridade; não prometer transação API/CDN.

#### Decisão arquitetural

Caminho preferido do plano: painel propõe alterações como PR Git; publicação continua CLI/job revisado. Não criar CRUD direto do banco em paralelo. Ativação de snapshot é subcapacidade independente, apenas se janela P0 se tornar inaceitável.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | backend/src/modules/publishing/application/ports/editorial-proposal-store.ts | Propor revisão Git com CAS e repositório fixo quando painel for necessário. |
| [CRIAR] | backend/src/modules/publishing/application/propose-content.ts | Autorizar proposta editorial usando validação existente. |
| [CRIAR] | backend/src/modules/publishing/adapters/http/editorial.routes.ts | Proposta/preview privado e aprovação protegida. |
| [CRIAR] | backend/src/modules/publishing/adapters/git/editorial-proposal-store.ts | Branch/PR em repositório permitido, token só backend. |
| [CRIAR] | backend/migrations/012-editorial-releases.ts | Snapshots/ponteiro ativo somente se ativação for necessária. |
| [CRIAR] | backend/src/modules/publishing/application/activate-release.ts | CAS/ativação/rollback idempotente de snapshot validado. |
| [ALTERAR] | backend/src/modules/publishing/application/import-content.ts | Preparar release candidata preservando autoridade Git e interações. |
| [ALTERAR] | backend/src/modules/publishing/application/publish-translation.ts | Associar publicação validada à candidata sem alterar identidade/datas. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/publication-store.ts | Persistir revisões imutáveis/candidato quando subcapacidade ativada. |
| [ALTERAR] | backend/src/modules/publishing/adapters/postgres/article-reader.ts | Ler release fixada e denylist de retirada urgente. |
| [ALTERAR] | backend/scripts/release-smoke.mjs | Verificar artefato candidato antes da ativação e releaseId cliente/API. |
| [CRIAR] | docs/adr/006-editorial-evolution.md | Gatilho, única fonte escolhida e consistência/recuperação de release. |
| [ALTERAR] | backend/openapi.yaml | Apenas contratos editoriais/release realmente ativados. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) sob flags e proteções corretas, antes do 404. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) com valores locais seguros e sem secrets reais. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Role/capacidade editorial author somente quando painel existir, atribuída por admin com auditoria; autor propõe revisão, revisor autorizado publica. HTTP editorial usa sessão recente, CSRF, strict schemas, limites e mesmos ValidateContent/PublicationPolicy. Proposta gera branch/PR no repositório permitido via port EditorialProposalStore; callback/provider limitado, sem URL/repos arbitrários. Nenhum token Git no frontend. Preview privado autenticado/no-store, sem draft em sitemap/export público.
2. Versão inicial do painel armazena rascunho como proposta Git identificada por commit; conflito de base→409, nunca overwrite de revisão nova. Uma segunda fonte CMS só entra após ADR explícito substituindo Git com migração de autoridade; não implementá-la junto da versão preferida. Import não sobrescreve usuários/interações.
3. Se ativação for necessária: migration 012-editorial-releases e snapshots imutáveis por release. Projeções de leitura se vinculam a active_release_id; construir/validar artefato da release candidata antes de trocar ponteiro. Publicar artefato em URL versionada no host, smoke privado, depois ativar manifesto de site e API com protocolo do host que preserve consistência observável (cliente envia releaseId e servidor lê mesma release; acesso sem release usa ativo). Não prometer transação distribuída: falha de troca mantém release anterior e retry por ID; retirar conteúdo abusivo exige denylist global independente da release ativa.
4. Ativar release por CAS de activeReleaseId; retry da mesma release idempotente, rollback troca ponteiro para snapshot compatível após verificar schema. Preservar articleId/translationId de interações entre snapshots. Import-content continua preparando projeção/versionamento; publish-translation mantém invariantes de data/estado, ganha candidato releaseId, não vira outro caso de uso de nome igual.
5. Desdobramento controlado: painel pode ser entregue mantendo publicação P0; ativação pode ser entregue sem painel. Cada subcapacidade só é marcada pronta com seus testes. Registrar decisão de qual executar em RELEASE_EVIDENCE; sem gatilho, status adiado e nenhum código/tabela criado.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Provider Git fake com PR/revisões, DB+armazenamento de releases e host estático de teste com releaseId; candidatas boa/falha e cenário de retirada urgente.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E24-U01](./BACKEND_TEST_PLAN.md#e24-u01): Autor propõe mas não publica sem revisor; base antiga conflita; preview draft nunca usa DTO público/cache; token Git redigido.
- [E24-U02](./BACKEND_TEST_PLAN.md#e24-u02): Activate release com expected diferente falha; repetir mesmo ID não duplica; retirada global prevalece sobre snapshot anterior.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E24-I01](./BACKEND_TEST_PLAN.md#e24-i01): Provider Git fake: proposta→PR→revisão→import sem editar DB pelo painel; falha/retry não cria propostas duplicadas por idempotency key; preview só autor/revisor.
- [E24-I02](./BACKEND_TEST_PLAN.md#e24-i02): Artefato candidato falha smoke→active inalterado; concorrência duas ativações→uma vence; cliente de release antiga lê snapshot antigo coerente; rollback preserva likes/comments e denylist impede ressuscitar artigo retirado.

**API/contrato/autorização na borda:**

- [E24-A01](./BACKEND_TEST_PLAN.md#e24-a01): Proposta/preview editorial exige sessão recente/CSRF/role e no-store; base antiga409, draft nunca em GET público; releaseId inválido não faz fallback para mistura de revisões.

Arquivos de teste a criar:

- `backend/tests/unit/e24-editorial-evolution.test.ts` — Cenários [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-U de regras e erros de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/integration/e24-editorial-evolution.test.ts` — Cenários [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-I das fronteiras reais e persistência/operação de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/api/e24-editorial-evolution.test.ts` — Cenários [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-A de endpoints/status/DTO/auth de Evoluir operação editorial e ativação de releases sob necessidade.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E24](./BACKEND_TEST_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Autoridade editorial única preservada; subcapacidade escolhida tem fluxo/retry/recuperação testados; ativação não promete atomicidade que host não fornece. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e25"></a>

### E25. Automatizar atendimento de privacidade quando houver demanda

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E25](./BACKEND_IMPLEMENTATION_ORDER.md#25-automatizar-atendimento-de-privacidade-quando-houver-demanda) · [Testes E25](./BACKEND_TEST_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Reduzir trabalho operacional de exportação sem ampliar exposição de dados ou alterar política aprovada.

#### Estado atual

P1 já tem solicitação autenticada, export CLI/manual, exclusão/purge e cleanup agendado. Automatização não deve ser descrita como criar esses mecanismos novamente.

#### Regra de negócio e restrições

[R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria).

- **[R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria) — Entrega automática continua privada e temporária:** Automatizar pedido P1 sem ampliar dados exportados; download de uso único exige dono autenticado recentemente, TTL e cancelamento ao excluir conta. Storage privado, idempotência por pedido, sem dados pessoais no job/log/URL pública permanente.

#### Decisão arquitetural

Mesmos casos de uso/store de lifecycle; adicionar entrega temporária por port privada. Reusar scheduler/outbox simples conforme volume, sem exigir fila distribuída.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [ALTERAR] | backend/src/modules/identity/application/export-account.ts | Automatizar pedido existente e estado de entrega sem mudar escopo de dados. |
| [CRIAR] | backend/src/modules/identity/application/ports/private-export-store.ts | Gravar/ler/apagar artefato privado temporário. |
| [CRIAR] | backend/src/modules/identity/adapters/storage/private-export-store.ts | Storage privado com TTL e paths controlados. |
| [ALTERAR] | backend/src/modules/identity/adapters/http/account.routes.ts | Status/download temporário com ownership e reautenticação. |
| [ALTERAR] | backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | Estado de job/token consumível e cancelamento na exclusão. |
| [CRIAR] | backend/migrations/013-private-exports.ts | Metadados/tokens/jobs de export automático, sem body de dados no job. |
| [CRIAR] | backend/scripts/process-exports.ts | Processar fila PostgreSQL pequena com lease/retry idempotente. |
| [ALTERAR] | backend/scripts/cleanup.ts | Expirar artefatos/leases/tokens e reconciliar órfãos. |
| [ALTERAR] | docs/PRIVACY_OPERATIONS.md | Atendimento automático e fallback manual. |
| [ALTERAR] | backend/openapi.yaml | Status/download privado sem exposição de links em caches. |
| [ALTERAR] | backend/src/composition.ts | Conectar ports/adapters/casos de uso de [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e injetar controles existentes sem duplicá-los. |
| [ALTERAR] | backend/src/http/app.ts | Montar rotas de [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) sob flags e proteções corretas, antes do 404. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) com valores locais seguros e sem secrets reais. |
| [ALTERAR] | backend/package.json | Registrar comandos operacionais da [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e somente dependências realmente usadas, mantendo lockfile coerente. |
| [ALTERAR] | backend/package-lock.json | Fixar dependências adicionadas para [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda), sem atualização de pacotes não relacionados. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Solicitação existente ganha job idempotente por requestId e status queued|processing|ready|delivered|expired|failed, tentativas limitadas; gerar JSON da allowlist P1, cifrar em armazenamento privado e expirar em 24h. Hash de token download aleatório com prazo 15min e uso único vinculado a userId/requestId; GET download exige sessão recente do mesmo usuário, no-store e sem referrer/log de token. Nome de arquivo fixo seguro, nenhum path do cliente.
2. Consumo de token deve ser atômico ao iniciar stream; interrupção de download exige emissão autenticada de token novo, não reabrir token anterior. Excluir conta durante geração cancela export e apaga artefato; export não restaura PII removida. Auditoria de atendimento guarda IDs/status/tempo, não o JSON.
3. Cleanup P1 passa a expirar objetos/tokens e detectar órfãos; retries não prolongam prazo absoluto. Se object storage externo for necessário, habilitar private bucket, encryption e URL/rota de download autenticada; links assinados nunca públicos permanentes. Reavaliar fornecedor/retention no inventário.
4. Remover procedimento manual apenas depois de fallback e suporte documentados; mesmo contrato 202 inicial preservado com endpoint de status privado adicional GET /me/exports/:requestId. No-store e ownership em todas etapas.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Storage privado de teste e PostgreSQL, duas instâncias de job, clock para TTL, export de A/B e exclusão concorrente.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E25-U01](./BACKEND_TEST_PLAN.md#e25-u01): Clock fake: token 15min/arquivo 24h, uso único e retry não estendem prazo; ownership exige userId certo; dados exportados mantêm allowlist [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E25-I01](./BACKEND_TEST_PLAN.md#e25-i01): Dois workers pegam mesmo job→um artefato válido; falha storage→retry seguro; duas tentativas download→um consumo; B não acessa export de A.
- [E25-I02](./BACKEND_TEST_PLAN.md#e25-i02): Exclusão concorrente cancela job/purga objeto; restore/cleanup não ressuscitam arquivo; TTL efetivo do storage testado com relógio fixture ou objetos de prazo curto.

**API/contrato/autorização na borda:**

- [E25-A01](./BACKEND_TEST_PLAN.md#e25-a01): GET status/download export exige dono/reautenticação e no-store; token errado/expirado/reusado negado sem informação privada; A não acessa pedido de B.

Arquivos de teste a criar:

- `backend/tests/unit/e25-private-exports.test.ts` — Cenários [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-U de regras e erros de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/integration/e25-private-exports.test.ts` — Cenários [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-I das fronteiras reais e persistência/operação de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/api/e25-private-exports.test.ts` — Cenários [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-A de endpoints/status/DTO/auth de Automatizar atendimento de privacidade quando houver demanda.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E25](./BACKEND_TEST_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Atendimento automático tem ownership, TTL, cancelamento e retry provados; processo P1 permanece fallback até estabilidade. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<a id="e26"></a>

### E26. Escalar apenas o gargalo medido

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E26](./BACKEND_IMPLEMENTATION_ORDER.md#26-escalar-apenas-o-gargalo-medido) · [Testes E26](./BACKEND_TEST_PLAN.md#e26-escalar-apenas-o-gargalo-medido--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2). **Dependências:** [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

#### Objetivo

Executar uma otimização por vez, preservando contratos, consistência e operação do monólito.

#### Estado atual

P1 tem queries paginadas/indexadas, cache HTTP, PostgreSQL para sessões/limites/dedupe e métricas. Nada exige Redis, workers, réplicas ou tracing ainda.

#### Regra de negócio e restrições

[R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica).

- **[R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) — Mudança de infraestrutura preserva semântica:** Adicionar cache/Redis/jobs/réplicas/tracing/storage somente por gargalo medido; cada evolução preserva autorização/visibilidade/consistência ou declara versão nova de métrica. Nunca cache privado, stale indefinido de retirado, lag de autorização, worker sem idempotência; pools somados respeitam DB.

#### Decisão arquitetural

Ports existentes permitem trocar mecanismo externo sem duplicar aplicação. Cada tecnologia é uma subcapacidade condicional; não executar toda lista por estar em P2.

#### Arquivos envolvidos e responsabilidade

| Ação | Caminho relativo à raiz | Responsabilidade |
| --- | --- | --- |
| [CRIAR] | docs/PERFORMANCE_DECISIONS.md | Baseline, gargalo, experimento, ganho e critério de rollback por subcapacidade. |
| [CRIAR] | backend/scripts/load-test.mjs | Carga reproduzível com dados sintéticos e relatório sem PII. |
| [CRIAR] | backend/src/infrastructure/public-cache-store.ts | Cache externo opcional de representações públicas com invalidação. |
| [ALTERAR] | backend/src/infrastructure/rate-limiter.ts | Adapter Redis opcional só se PG for gargalo, preservando contrato. |
| [ALTERAR] | backend/src/modules/community/adapters/postgres/view-recorder.ts | Manter v1 ou adaptar batching versionado somente sob ADR explícito. |
| [ALTERAR] | backend/src/modules/community/adapters/postgres/stats-reader.ts | Counters materializados/replicas apenas após medida e sem mudar escopo. |
| [CRIAR] | backend/scripts/reconcile-stats.ts | Reconciliar counters quando materialização existir. |
| [CRIAR] | backend/src/workers/blog-worker.ts | Consumir outbox idempotente apenas sob backlog comprovado. |
| [CRIAR] | backend/src/infrastructure/tracing.ts | Tracing opcional sem dados privados quando houver múltiplos processos. |
| [CRIAR] | backend/src/modules/publishing/application/ports/editorial-asset-store.ts | Capacidade de mídia editorial autorizada quando necessária. |
| [CRIAR] | backend/src/modules/publishing/adapters/storage/editorial-asset-store.ts | Object storage e validação de assets, sem filesystem efêmero. |
| [ALTERAR] | backend/src/infrastructure/database.ts | Pools/topologia de réplicas/PgBouncer mediante teste. |
| [ALTERAR] | backend/src/composition.ts | Selecionar adapters por config validada, sem opções mortas. |
| [ALTERAR] | docs/BACKEND_OPERATIONS.md | Novas dependências, restore, rollback, métricas e recuperação. |
| [CRIAR] | backend/migrations/014-measured-optimizations.ts | Apenas alterações efetivamente escolhidas: outbox/counters/partições; dividir em novas versões se entregas distintas. |
| [ALTERAR] | backend/src/config/env.ts | Validar configurações/secrets/prazos da capacidade [E26](#e26-escalar-apenas-o-gargalo-medido) somente quando habilitada; não permitir defaults inseguros em produção. |
| [ALTERAR] | backend/.env.example | Documentar variáveis e flags da [E26](#e26-escalar-apenas-o-gargalo-medido) com valores locais seguros e sem secrets reais. |
| [ALTERAR] | backend/package.json | Registrar comandos operacionais da [E26](#e26-escalar-apenas-o-gargalo-medido) e somente dependências realmente usadas, mantendo lockfile coerente. |
| [ALTERAR] | backend/package-lock.json | Fixar dependências adicionadas para [E26](#e26-escalar-apenas-o-gargalo-medido), sem atualização de pacotes não relacionados. |

Movimentações preservam a implementação e retiram o caminho de origem ao atualizar consumidores. Não manter cópias de servidor/logger/store com duas autoridades. Imports com aliases nos arquivos atuais afetados também são ajustados em [E01](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)/[E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida); isso é evolução mecânica do mesmo arquivo. O histórico consolidado está em [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#hist%C3%B3rico-de-arquivos-que-evoluem).

#### Implementação esperada

1. Primeiro reproduzir gargalo com carga representativa e registrar baseline/p95/pool/CPU/plano SQL. Corrigir query/payload/índice e medir novamente. Redis cache só se leitura repetida ainda onerar DB; chave inclui locale/query/revisão, TTL limitado e invalidação de publish/archive/moderation, nenhuma resposta privada. Rate limit compartilhado já é PG: mover ao Redis apenas por contenção provada, mantendo atomicidade/429 e comportamento fechado de falha para mutações.
2. Dedupe views pode permanecer PG enquanto cache/rate migrar. Se mover dedupe/batching, nova metricVersion e ADR de perda/duplicidade/atraso são obrigatórios; não misturar contagem eventual com v1 transacional. Antes de trocar, teste falha Redis/retry/redelivery e custo de aceitação. Counters materializados de likes/comments só após COUNT ser gargalo; atualizar apenas linha afetada na mesma transação e reconciliar por script com dados canônicos.
3. Jobs assíncronos só com backlog/latência (email/export/indexação): outbox transacional, idempotency key, lease/ack, retries backoff e limite/dead-letter operável; payload IDs mínimos sem secrets. Worker novo atende blog, nunca reaproveita worker de eventos excluído. Testar crash antes/depois efeito e ack, duplicidade e recuperação.
4. Réplicas HTTP quando saturação persistir: sessões/limites/dedupe já externos, shutdown/readiness prontos; load balance/proxy validado e soma dos pools <= capacidade DB reservando operação. PgBouncer só se pressão de conexões comprovada e transações Sequelize/migrator testadas. Réplica de leitura exige aceitar lag e enviar ownership/moderação/privacidade/read-after-write ao primário. Particionar métricas apenas se tamanho/retenção causar custo medido.
5. Object storage de mídia editorial quando artefato não comportar assets ou contribuição autorizada exigir: port de storage, MIME/tamanho/dimensões validados, nomes aleatórios, acesso controlado e URL canônica; nunca upload persistente no container ou fetch de URL arbitrária. Sem feature de uploads públicos por default.
6. Tracing/collector apenas para diagnosticar múltiplos processos reais; propagação de trace ID validada, spans sem PII, cardinalidade/amostragem/retenção limitadas. Kubernetes/Kafka/sharding/multi-region writes continuam fora do plano por ausência de requisito. Desativar mudança se benchmark não trouxer ganho ou degradar garantia funcional.

#### Testes obrigatórios em paralelo

Infraestrutura/pré-condições: Ambiente de carga igual ao baseline; subir só dependências escolhidas (Redis/storage/worker/replica/collector). Injeção de falhas/restarts, nunca em produção.

**Unitários** (mocks apenas nas fronteiras; casos puros sem mock):

- [E26-U01](./BACKEND_TEST_PLAN.md#e26-u01): Cache key separa locale/revisão/consulta, privado nunca cacheia; invalidation representa retirada; retry worker usa mesma idempotency key; cardinalidade tracing limitada.

**Integração/persistência/operação** (PostgreSQL real quando há invariantes de banco):

- [E26-I01](./BACKEND_TEST_PLAN.md#e26-i01): Antes/depois com mesma carga comprova ganho e preserva suites; publicar/ocultar invalida cache; falha Redis gera fallback público controlado/503 em limiter de mutação, sem liberar abuso.
- [E26-I02](./BACKEND_TEST_PLAN.md#e26-i02): Worker crash/redelivery produz um efeito; contador materializado reconcilia após falha; múltiplas réplicas preservam sessão/like/view; PgBouncer não rompe transação; réplica atrasada nunca autoriza usuário bloqueado.
- [E26-I03](./BACKEND_TEST_PLAN.md#e26-i03): Asset com MIME spoof/tamanho excessivo rejeitado, objeto privado não exposto; tracing/log não contém tokens. Cada subcapacidade escolhida executa seus cenários, demais continuam adiadas.

**API/contrato/autorização na borda:**

- [E26-A01](./BACKEND_TEST_PLAN.md#e26-a01): Suite pública/privada existente passa com adapter otimizado; cache por locale/revisão, retirada provoca404/revalidação; limiter indisponível503 em mutações, nunca acesso liberado.

Arquivos de teste a criar:

- `backend/tests/unit/e26-measured-scaling.test.ts` — Cenários [E26](#e26-escalar-apenas-o-gargalo-medido)-U de regras e erros de Escalar apenas o gargalo medido.
- `backend/tests/integration/e26-measured-scaling.test.ts` — Cenários [E26](#e26-escalar-apenas-o-gargalo-medido)-I das fronteiras reais e persistência/operação de Escalar apenas o gargalo medido.
- `backend/tests/api/e26-measured-scaling.test.ts` — Cenários [E26](#e26-escalar-apenas-o-gargalo-medido)-A de endpoints/status/DTO/auth de Escalar apenas o gargalo medido.

Detalhes de entrada, resultado, infraestrutura, mocks e classificações: [testes E26](./BACKEND_TEST_PLAN.md#e26-escalar-apenas-o-gargalo-medido--evolu%C3%A7%C3%A3o-futura).

#### Critério de aceite

Melhoria entregue somente com diagnóstico/ganho/reversão documentados e regressões funcionais verdes; nenhuma infraestrutura adicionada sem gatilho. Todos os cenários acima passam e os contratos/OpenAPI afetados são atualizados no mesmo incremento. Falha ou ausência de teste relevante mantém a etapa aberta.

<!-- navigation:anchor:start -->
<a id="nav-section-018"></a>
<!-- navigation:anchor:end -->

## Evolução explícita dos mesmos componentes

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Componente | Arquivo(s) | Estado após P0 | Alteração P1/motivo | Alteração P2/motivo | Novos testes |
| --- | --- | --- | --- | --- | --- |
| Publicação | backend/src/modules/publishing/application/publish-translation.ts | [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/P0 nasce: política de estado/primeira data e CLI protegido. | [E16](#e16-entregar-curtidas-idempotentes-e-estado-privado)–[E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)/P1 testes comprovam que import/publicação conserva interações; nenhuma nova regra auth pública de publicar. | [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)/P2 se ativação necessária, acrescenta release candidata, preservando UUID/datas. | [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01)/[I01](./BACKEND_TEST_PLAN.md#e07-i01)/[I03](./BACKEND_TEST_PLAN.md#e07-i03); [E16-I02](./BACKEND_TEST_PLAN.md#e16-i02); [E24-U02](./BACKEND_TEST_PLAN.md#e24-u02)/[I02](./BACKEND_TEST_PLAN.md#e24-i02) |
| Consulta | backend/src/modules/publishing/adapters/postgres/article-reader.ts | [E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)/P0 listas/detalhe/séries, [E10](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) export snapshot consistente. | P1 continua editorial sem estado privado/contadores embutidos. | [E23](#e23-busca-por-idioma-e-relacionados-editoriais) full-text/related; [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) leitura por release; mesmas regras públicas. | [E08-I01](./BACKEND_TEST_PLAN.md#e08-i01)/[I02](./BACKEND_TEST_PLAN.md#e08-i02)/[I03](./BACKEND_TEST_PLAN.md#e08-i03); [E10-I01](./BACKEND_TEST_PLAN.md#e10-i01); [E23-I01](./BACKEND_TEST_PLAN.md#e23-i01)/[I02](./BACKEND_TEST_PLAN.md#e23-i02); [E24-I02](./BACKEND_TEST_PLAN.md#e24-i02) |
| Escrita editorial | backend/src/modules/publishing/adapters/postgres/publication-store.ts | [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/P0 CAS/upsert/paths atômicos. | P1 regressão com likes/comments preservados. | [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) prerequisites opcionais; [E23](#e23-busca-por-idioma-e-relacionados-editoriais) índice/curadoria; [E24](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) candidatos imutáveis. | [E07-I01](./BACKEND_TEST_PLAN.md#e07-i01)/[I02](./BACKEND_TEST_PLAN.md#e07-i02)/[I03](./BACKEND_TEST_PLAN.md#e07-i03); [E16-I02](./BACKEND_TEST_PLAN.md#e16-i02); [E22-I02](./BACKEND_TEST_PLAN.md#e22-i02); [E23-I01](./BACKEND_TEST_PLAN.md#e23-i01); [E24-I02](./BACKEND_TEST_PLAN.md#e24-i02) |
| Infra de processo | backend/src/main.ts; backend/src/http/app.ts; backend/src/infrastructure/database.ts | [E02](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)/[E03](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) movem/reusam startup/HTTP/DB e completam limites. | [E14](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) rotas auth; [E20](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) gate/métricas, sem recriar app. | [E26](#e26-escalar-apenas-o-gargalo-medido) topologia/pools/adapters opcionais. | [E02-I02](./BACKEND_TEST_PLAN.md#e02-i02); [E14-I01](./BACKEND_TEST_PLAN.md#e14-i01)/[I02](./BACKEND_TEST_PLAN.md#e14-i02); [E20-U01](./BACKEND_TEST_PLAN.md#e20-u01); [E26-I02](./BACKEND_TEST_PLAN.md#e26-i02) |
| Comentários | backend/src/modules/community/domain/comment.ts; adapters/postgres/comment-store.ts | P0 ausente. | [E17](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)/P1 plano/pending/CAS/tombstone, moderação real. | [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)/P2 parent de mesmo locale/profundidade1, preserva política anterior. | [E17-U01](./BACKEND_TEST_PLAN.md#e17-u01)/[I01](./BACKEND_TEST_PLAN.md#e17-i01)/[I02](./BACKEND_TEST_PLAN.md#e17-i02)/[I03](./BACKEND_TEST_PLAN.md#e17-i03); [E22-U01](./BACKEND_TEST_PLAN.md#e22-u01)/[I01](./BACKEND_TEST_PLAN.md#e22-i01) |
| Stats | backend/src/modules/community/adapters/postgres/stats-reader.ts | P0 ausente. | [E18](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) COUNT/agregado diário; [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) mensal sem duplicação. | [E26](#e26-escalar-apenas-o-gargalo-medido) materialização/replica apenas com necessidade e reconciliação. | [E18-I01](./BACKEND_TEST_PLAN.md#e18-i01)/[I03](./BACKEND_TEST_PLAN.md#e18-i03); [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03); [E26-I02](./BACKEND_TEST_PLAN.md#e26-i02) |
| Privacidade | backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts | P0 ausente. | [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) purge/export manual/ledger transacional. | [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) credenciais; [E22](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) progresso; [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) entrega automática/cancelamento. | [E19-I01](./BACKEND_TEST_PLAN.md#e19-i01)/[I02](./BACKEND_TEST_PLAN.md#e19-i02)/[I03](./BACKEND_TEST_PLAN.md#e19-i03); [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02); [E22-I02](./BACKEND_TEST_PLAN.md#e22-i02); [E25-I01](./BACKEND_TEST_PLAN.md#e25-i01)/[I02](./BACKEND_TEST_PLAN.md#e25-i02) |
| Restore e cleanup | backend/scripts/restore.mjs; backend/scripts/cleanup.ts | [E12](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) restore comprovado (cleanup de dados pessoais ainda não existe). | [E19](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) restore reaplica ledger; cleanup purge/diário→mensal. | [E21](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) tokens/outbox; [E25](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) artefatos; [E26](#e26-escalar-apenas-o-gargalo-medido) novas dependências no runbook. | [E12-I02](./BACKEND_TEST_PLAN.md#e12-i02); [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03); [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02); [E25-I02](./BACKEND_TEST_PLAN.md#e25-i02) |
| OpenAPI e composição | backend/openapi.yaml; backend/src/composition.ts | P0 rotas públicas/health, contratos e injeções. | P1 mesmos arquivos recebem sessão/community/privacidade. | P2 apenas capacidades ativadas; não criar v2 para campo opcional. | Todas suites API; lint de fronteiras e contrato em cada etapa |

<!-- navigation:anchor:start -->
<a id="nav-section-019"></a>
<!-- navigation:anchor:end -->

## Revisão cruzada final do planejamento

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Verificação exigida | Resultado da revisão documental |
| --- | --- |
| 1. Toda funcionalidade possui fase | 26 etapas com P0/P1/P2; subcapacidades P2 condicionais explicitadas. |
| 2. Toda implementação possui arquivos | Cada etapa lista ações/responsabilidades; árvore consolidada gerada a partir do mesmo inventário. |
| 3. Implementação relevante possui testes | Cada etapa inclui unitários, integração e API quando possui borda HTTP; não existe gate de feature sem suite. |
| 4. Toda regra possui teste | [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel)–[R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) têm referências a cenários; regras adicionais de transição/taxonomia entram nas suites [E07](#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E08](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)/[E09](#e09-expor-api-rest-documentada-e-cache-http-simples). |
| 5. Nenhuma reconstrução de código correto | Matriz atual distingue resolvido/parcial/ausente; moves reaproveitam saúde/log/erros/fatal/DI já corrigidos. |
| 6. Ordem respeita dependências | Todas dependências apontam para etapas anteriores; P2 sem gatilho é adiado, não pré-requisito artificial. |
| 7. Evolução de arquivos explícita | Tabela acima e histórico por caminho na estrutura mostram criação→alterações/reuso. |
| 8. Regras importantes explícitas | Contratos/DLL/DTO/estados/concorrência/erros/defaults/gates humanos registrados; nenhuma decisão jurídica/licença/domínio inventada. |
| 9. Consistente com arquitetura | Monólito Express/TS/Sequelize/PostgreSQL, hexagonal leve, Git único, P0 editorial/P1 comunidade/P2 proporcional; pontos de atenção identificados. |
| 10. Execução sequencial | ORDER aponta para PLAN/RULES/STRUCTURE/TEST por IDs; cada etapa tem resultado e definição de pronto. |

Esta revisão valida a consistência do plano e dos vínculos, não certifica implementações futuras. A documentação foi produzida após a leitura integral e auditoria; nenhum teste futuro foi declarado executado.
