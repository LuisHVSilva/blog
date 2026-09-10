# Ordem operacional de desenvolvimento do backend

[Comece aqui — guia de leitura e execução](./00_COMECE_AQUI.md)

<!-- navigation:index:start -->
**Navegação:** **Ordem de implementação** · [Plano detalhado](./BACKEND_IMPLEMENTATION_PLAN.md) · [Estrutura de arquivos](./BACKEND_IMPLEMENTATION_STRUCTURE.md) · [Regras de negócio](./BACKEND_BUSINESS_RULES.md) · [Plano de testes](./BACKEND_TEST_PLAN.md)

[Arquitetura de referência](./BACKEND_ARCHITECTURE.md)

<a id="indice"></a>

## Índice

- [Sequência única](#sequ%C3%AAncia-%C3%BAnica)
- [01. Tornar executáveis os comandos e preservar a base existente](#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)
- [02. Separar composição, HTTP, configuração e ciclo de vida](#02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)
- [03. Conexão PostgreSQL e executor de migrations](#03-conex%C3%A3o-postgresql-e-executor-de-migrations)
- [04. Definir domínio editorial e contratos de aplicação](#04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)
- [05. Criar schema editorial, constraints e namespace de slugs](#05-criar-schema-editorial-constraints-e-namespace-de-slugs)
- [06. Normalizar os oito textos e validar a fonte editorial](#06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)
- [07. Importar, publicar, despublicar e arquivar atomicamente](#07-importar-publicar-despublicar-e-arquivar-atomicamente)
- [08. Consultar artigos, tags e séries publicados](#08-consultar-artigos-tags-e-s%C3%A9ries-publicados)
- [09. Expor API REST documentada e cache HTTP simples](#09-expor-api-rest-documentada-e-cache-http-simples)
- [10. Exportar snapshot e integrar publicação com o site](#10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)
- [11. Entregar imagens e Compose reproduzíveis](#11-entregar-imagens-e-compose-reproduz%C3%ADveis)
- [12. Automatizar validação e fechar operação do primeiro release](#12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)
- [13. Criar identidade e persistência de sessões](#13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)
- [14. Implementar login GitHub, sessão e logout seguros](#14-implementar-login-github-sess%C3%A3o-e-logout-seguros)
- [15. Aplicar permissões, bloqueio e limites de abuso](#15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)
- [16. Entregar curtidas idempotentes e estado privado](#16-entregar-curtidas-idempotentes-e-estado-privado)
- [17. Comentários moderados e denúncias operáveis](#17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)
- [18. Registrar views deduplicadas e estatísticas reais](#18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)
- [19. Excluir contas, exportar dados e executar retenção](#19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)
- [20. Habilitar comunidade com observabilidade e operação completas](#20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)
- [21. Conta local com confirmação e recuperação completas](#21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)
- [22. Respostas limitadas e progresso explícito de leitura](#22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)
- [23. Busca por idioma e relacionados editoriais](#23-busca-por-idioma-e-relacionados-editoriais)
- [24. Evoluir operação editorial e ativação de releases sob necessidade](#24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)
- [25. Automatizar atendimento de privacidade quando houver demanda](#25-automatizar-atendimento-de-privacidade-quando-houver-demanda)
- [26. Escalar apenas o gargalo medido](#26-escalar-apenas-o-gargalo-medido)
- [Gates que não podem ser substituídos por “build passou”](#gates-que-n%C3%A3o-podem-ser-substitu%C3%ADdos-por-build-passou)
<!-- navigation:index:end -->

Data: 09/09/2026. Execute uma etapa por vez. Cada item é um incremento verificável com contratos, arquivos e testes no mesmo trabalho. Não implementar novamente a base marcada existente. Detalhes em [plano](./BACKEND_IMPLEMENTATION_PLAN.md), [regras](./BACKEND_BUSINESS_RULES.md), [estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md) e [testes](./BACKEND_TEST_PLAN.md).

<!-- navigation:anchor:start -->
<a id="nav-section-001"></a>
<!-- navigation:anchor:end -->

## Sequência única

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

1. **01. Tornar executáveis os comandos e preservar a base existente** — Para publicar (P0); [instruções E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).
2. **02. Separar composição, HTTP, configuração e ciclo de vida** — Para publicar (P0); [instruções E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).
3. **03. Conexão PostgreSQL e executor de migrations** — Para publicar (P0); [instruções E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations).
4. **04. Definir domínio editorial e contratos de aplicação** — Para publicar (P0); [instruções E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).
5. **05. Criar schema editorial, constraints e namespace de slugs** — Para publicar (P0); [instruções E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs).
6. **06. Normalizar os oito textos e validar a fonte editorial** — Para publicar (P0); [instruções E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).
7. **07. Importar, publicar, despublicar e arquivar atomicamente** — Para publicar (P0); [instruções E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).
8. **08. Consultar artigos, tags e séries publicados** — Para publicar (P0); [instruções E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados).
9. **09. Expor API REST documentada e cache HTTP simples** — Para publicar (P0); [instruções E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).
10. **10. Exportar snapshot e integrar publicação com o site** — Para publicar (P0); [instruções E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).
11. **11. Entregar imagens e Compose reproduzíveis** — Para publicar (P0); [instruções E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).
12. **12. Automatizar validação e fechar operação do primeiro release** — Para publicar (P0); [instruções E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).
13. **13. Criar identidade e persistência de sessões** — Após publicação (P1); [instruções E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).
14. **14. Implementar login GitHub, sessão e logout seguros** — Após publicação (P1); [instruções E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).
15. **15. Aplicar permissões, bloqueio e limites de abuso** — Após publicação (P1); [instruções E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).
16. **16. Entregar curtidas idempotentes e estado privado** — Após publicação (P1); [instruções E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado).
17. **17. Comentários moderados e denúncias operáveis** — Após publicação (P1); [instruções E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).
18. **18. Registrar views deduplicadas e estatísticas reais** — Após publicação (P1); [instruções E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).
19. **19. Excluir contas, exportar dados e executar retenção** — Após publicação (P1); [instruções E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).
20. **20. Habilitar comunidade com observabilidade e operação completas** — Após publicação (P1); [instruções E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).
21. **21. Conta local com confirmação e recuperação completas** — Evolução futura (P2); [instruções E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas).
22. **22. Respostas limitadas e progresso explícito de leitura** — Evolução futura (P2); [instruções E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura).
23. **23. Busca por idioma e relacionados editoriais** — Evolução futura (P2); [instruções E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais).
24. **24. Evoluir operação editorial e ativação de releases sob necessidade** — Evolução futura (P2); [instruções E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade).
25. **25. Automatizar atendimento de privacidade quando houver demanda** — Evolução futura (P2); [instruções E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda).
26. **26. Escalar apenas o gargalo medido** — Evolução futura (P2); [instruções E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido).

P0 termina em12; P1 em20. Em21–26, verifique o gatilho documentado; se ausente, registre adiado e passe à próxima opção, sem criar esqueleto. Etapas futuras não são dependências artificiais entre si.

<a id="e01"></a>

## 01. Tornar executáveis os comandos e preservar a base existente

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) · [Testes E01](./BACKEND_TEST_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** auditoria atual concluída.

**Consultar antes de alterar:** [E01 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente), [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [testes E01](./BACKEND_TEST_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar).

**Arquivos criados:**

- `backend/eslint.config.mjs` — Lint e restrições de dependência por camada.
- `backend/scripts/test.mjs` — Descobrir e executar suites Node com propagação do exit code.
- `backend/.env.example` — Contrato de configuração local sem credenciais externas.
- `backend/.node-version` — Versão Node compartilhada com imagem/CI.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/package.json` — alterar; Scripts executáveis, engines, runner e dependências diretamente usadas.
- `backend/package-lock.json` — alterar; Lockfile coerente com a instalação reproduzível.
- `backend/tsconfig.json` — alterar; Build sem aliases irresolúveis, strict preservado e escopo explícito de fontes/scripts.
- `.gitignore` — alterar; Manter proteção existente e permitir docs/.
- `backend/src/index.ts` — alterar; Trocar imports com aliases até migração em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Dependências existentes reutilizadas:**

- `backend/.gitignore` — Ignorar ambientes, dependências e artefatos locais.
- `backend/.dockerignore` — Excluir secrets e artefatos do contexto.
- `backend/src/infrastructures/logger/redact-sensitive.ts` — Redação recursiva existente, preservada ao ajustar imports dos consumidores.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e01-tooling.test.ts` — Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-U de regras e erros de Tornar executáveis os comandos e preservar a base existente.
- `backend/tests/integration/e01-tooling.test.ts` — Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-I das fronteiras reais e persistência/operação de Tornar executáveis os comandos e preservar a base existente.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E01-U01](./BACKEND_TEST_PLAN.md#e01-u01), [E01-U02](./BACKEND_TEST_PLAN.md#e01-u02). Integração: [E01-I01](./BACKEND_TEST_PLAN.md#e01-i01), [E01-I02](./BACKEND_TEST_PLAN.md#e01-i02).

**Resultado esperado:** Entregar um ciclo local e de CI que execute JavaScript compilado e testes reais, sem reconstruir a infraestrutura já corrigida.

**Definição de pronto:** Scripts documentados existem e falham corretamente; testes reais executam; nenhum alias não resolvido no JS; arquivos sensíveis não rastreados; nenhuma reconstrução de funcionalidades já corretas. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

<a id="e02"></a>

## 02. Separar composição, HTTP, configuração e ciclo de vida

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) · [Testes E02](./BACKEND_TEST_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).

**Consultar antes de alterar:** [E02 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida), [R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos), [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo), [testes E02](./BACKEND_TEST_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida--para-publicar).

**Arquivos criados:**

- `backend/src/composition.ts` — Composição manual única de adapters e casos de uso.
- `backend/src/http/request-log.ts` — Log final de cada request com duração e rota normalizada.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/main.ts` — mover de backend/src/index.ts; Dono do processo e do listener; startup, sinais e encerramento.
- `backend/src/config/env.ts` — mover de backend/src/bootstrap/env.ts; Validação tipada do ambiente e carga local controlada.
- `backend/src/http/app.ts` — mover de backend/src/framework/http/server.ts; Express sem listen e ordem de middlewares.
- `backend/src/http/health.routes.ts` — mover de backend/src/framework/http/healthCheck.route.ts; Liveness/readiness de custo limitado.
- `backend/src/http/cors.ts` — mover de backend/src/framework/http/cors.config.ts; Allowlist existente parametrizada por Config.
- `backend/src/http/request-context.ts` — mover de backend/src/framework/http/request-context.middleware.ts; IDs seguros e contexto sem query.
- `backend/src/http/error-handler.ts` — mover de backend/src/shared/middlewares/errorHandler.middleware.ts; Envelope público, mapeamento de parser e proteção de headersSent.
- `backend/src/http/error-status.ts` — mover de backend/src/framework/http/application-error-status.mapper.ts; Mapear kinds semânticos para status.
- `backend/src/shared/errors/application.error.ts` — alterar; Acrescentar kinds/fields sem importar HTTP.
- `backend/src/infrastructure/logger.ts` — mover de backend/src/infrastructures/logger/logger.ts; Reutilizar escrita JSON/stdout e injetar service.
- `backend/src/infrastructure/logging/formatter.ts` — mover de backend/src/infrastructures/logger/formatter/logger.formater.ts; Formato existente com campos permitidos.
- `backend/src/infrastructure/logging/redact-sensitive.ts` — mover de backend/src/infrastructures/logger/redact-sensitive.ts; Preservar algoritmo testado; retirar promessa de log irrestrito.
- `backend/src/infrastructure/logging/request-context.ts` — mover de backend/src/infrastructures/logger/context/request.context.ts; ALS exclusivo de observabilidade.
- `backend/src/infrastructure/logging/logger.interface.ts` — mover de backend/src/infrastructures/logger/logger.interface.ts; Contrato existente de logger; unknown em vez de any.
- `backend/src/infrastructure/logging/logger.context.ts` — mover de backend/src/infrastructures/logger/context/logger.context.ts; Contexto de origem do evento de log.
- `backend/src/infrastructure/process-handlers.ts` — mover de backend/src/infrastructures/logger/process-error-handlers.ts; Reutilizar fatal shutdown, registrar também sinais e permitir cleanup dos handlers em teste.
- `backend/package.json` — alterar; start passa a node dist/src/main.js; dev:api executa tsx watch src/main.ts.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-U de regras e erros de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/integration/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-I das fronteiras reais e persistência/operação de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/api/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-A de endpoints/status/DTO/auth de Separar composição, HTTP, configuração e ciclo de vida.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E02-U01](./BACKEND_TEST_PLAN.md#e02-u01), [E02-U02](./BACKEND_TEST_PLAN.md#e02-u02), [E02-U03](./BACKEND_TEST_PLAN.md#e02-u03). Integração: [E02-I01](./BACKEND_TEST_PLAN.md#e02-i01), [E02-I02](./BACKEND_TEST_PLAN.md#e02-i02). API: [E02-A01](./BACKEND_TEST_PLAN.md#e02-a01), [E02-A02](./BACKEND_TEST_PLAN.md#e02-a02).

**Resultado esperado:** Evoluir os componentes existentes para a árvore definida, montar app testável sem abrir porta e tornar falhas/encerramento previsíveis.

**Definição de pronto:** App é importável sem efeitos globais; nenhuma duplicação da infraestrutura movida; ready muda antes da drenagem; erros/logs obedecem contrato e nenhum segredo aparece. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations).

<a id="e03"></a>

## 03. Conexão PostgreSQL e executor de migrations

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) · [Testes E03](./BACKEND_TEST_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Consultar antes de alterar:** [E03 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita), [testes E03](./BACKEND_TEST_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations--para-publicar).

**Arquivos criados:**

- `backend/scripts/migrate.ts` — Executar/consultar migrations versionadas com lock/checksum e credencial operacional.
- `backend/migrations/runner.ts` — Contrato Migration up(sequelize,transaction), controle e atomicidade sem aparecer no domínio.
- `backend/compose.test.yaml` — PostgreSQL 16 isolado para testes.
- `backend/tests/support/database.ts` — Preparar DB seguro, migrar e limpar apenas namespace de teste.
- `backend/tests/support/app.ts` — Montar composição de teste sem serviços externos.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/infrastructure/database.ts` — mover de backend/src/infrastructures/persistence/ORM/index.sequelize.ts; Conexão única, pool/timeouts e nenhuma criação automática de schema.
- `backend/package.json` — alterar; Scripts migrate, migrate:status, test:integration/test:api e dependências ORM usadas.
- `backend/.env.example` — alterar; Pool/timeouts e instruções para credenciais distintas, sem segredo de produção.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e03-migrations.test.ts` — Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-U de regras e erros de Conexão PostgreSQL e executor de migrations.
- `backend/tests/integration/e03-migrations.test.ts` — Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I das fronteiras reais e persistência/operação de Conexão PostgreSQL e executor de migrations.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E03-U01](./BACKEND_TEST_PLAN.md#e03-u01). Integração: [E03-I01](./BACKEND_TEST_PLAN.md#e03-i01), [E03-I02](./BACKEND_TEST_PLAN.md#e03-i02).

**Resultado esperado:** Preservar a conexão funcional e acrescentar schema versionado, privilégios separados e ambiente real de testes.

**Definição de pronto:** Migration idempotente operacionalmente e atômica por versão; app nunca faz DDL; banco de teste real isolado e falha de migration bloqueia startup no Compose futuro. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

<a id="e04"></a>

## 04. Definir domínio editorial e contratos de aplicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) · [Testes E04](./BACKEND_TEST_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Consultar antes de alterar:** [E04 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura), [testes E04](./BACKEND_TEST_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o--para-publicar).

**Arquivos criados:**

- `backend/src/modules/publishing/domain/article.ts` — Tipos e invariantes de Article/Translation/locale/difficulty.
- `backend/src/modules/publishing/domain/publication-policy.ts` — Transições, visibilidade, revisão e publicação pura.
- `backend/src/modules/publishing/domain/series.ts` — Ordem/membros únicos e navegação localizada.
- `backend/src/modules/publishing/domain/reading-time.ts` — Contagem determinística sobre texto extraído.
- `backend/src/modules/publishing/application/content.dto.ts` — EditionInput, Operator, ImportResult e projections públicas explícitas.
- `backend/src/modules/publishing/application/publishing.errors.ts` — Erros concretos semânticos de conflito/visibilidade/validação.
- `backend/src/modules/publishing/application/ports/publication-store.ts` — Capacidade de escrita editorial atômica, sem tipos Sequelize.
- `backend/src/modules/publishing/application/ports/article-reader.ts` — Consultas específicas e snapshot público.

**Arquivos alterados/movidos (preservar implementação útil):**

- Nenhum arquivo de produção existente precisa mudar nesta etapa.

**Dependências existentes reutilizadas:**

- `backend/src/shared/errors/application.error.ts` — Base semântica ampliada em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e04-publishing-domain.test.ts` — Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-U de regras e erros de Definir domínio editorial e contratos de aplicação.
- `backend/tests/integration/e04-publishing-domain.test.ts` — Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Definir domínio editorial e contratos de aplicação.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E04-U01](./BACKEND_TEST_PLAN.md#e04-u01), [E04-U02](./BACKEND_TEST_PLAN.md#e04-u02), [E04-U03](./BACKEND_TEST_PLAN.md#e04-u03). Integração: [E04-I01](./BACKEND_TEST_PLAN.md#e04-i01).

**Resultado esperado:** Codificar invariantes de identidade, tradução, publicação, séries e leitura antes de persistência e entrada externa.

**Definição de pronto:** Tipos/ports compilam sem Express, env e Sequelize; invariantes têm casos positivos/negativos; política de estado não depende de SQL e não duplica entidades entre idiomas. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs).

<a id="e05"></a>

## 05. Criar schema editorial, constraints e namespace de slugs

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) · [Testes E05](./BACKEND_TEST_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

**Consultar antes de alterar:** [E05 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace), [testes E05](./BACKEND_TEST_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs--para-publicar).

**Arquivos criados:**

- `backend/migrations/001-editorial.ts` — DDL editorial, integridade, índices e controle de revisão.
- `backend/migrations/002-editorial-paths.ts` — Namespace único de slugs/redirects e consistência diferida.
- `backend/src/modules/publishing/adapters/postgres/models.ts` — Definições Sequelize explícitas, registro único e mapeamento snake_case.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/composition.ts` — alterar; Registrar models e criar adapters com a instância única.

**Dependências existentes reutilizadas:**

- `backend/src/infrastructure/database.ts` — Conexão e transações já preparadas em [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations).

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e05-editorial-schema.test.ts` — Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-U de regras e erros de Criar schema editorial, constraints e namespace de slugs.
- `backend/tests/integration/e05-editorial-schema.test.ts` — Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I das fronteiras reais e persistência/operação de Criar schema editorial, constraints e namespace de slugs.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E05-U01](./BACKEND_TEST_PLAN.md#e05-u01). Integração: [E05-I01](./BACKEND_TEST_PLAN.md#e05-i01), [E05-I02](./BACKEND_TEST_PLAN.md#e05-i02), [E05-I03](./BACKEND_TEST_PLAN.md#e05-i03).

**Resultado esperado:** Persistir o catálogo multilíngue e impedir corridas que validação em memória não resolve.

**Definição de pronto:** DDL vazio e upgrade testados; corrida slug/alias e reordenação protegidas no DB; invariantes do estado persistido equivalem às de domínio; nenhuma tabela comunitária antecipada. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

<a id="e06"></a>

## 06. Normalizar os oito textos e validar a fonte editorial

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) · [Testes E06](./BACKEND_TEST_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

**Consultar antes de alterar:** [E06 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro), [testes E06](./BACKEND_TEST_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial--para-publicar).

**Arquivos criados:**

- `content/catalog.yaml` — Manifesto editorial de IDs, autoria, tags/séries localizadas e relações.
- `content/legacy-map.json` — Mapa permanente dos oito arquivos de origem para UUID/locales, sem gerar IDs a cada execução.
- `backend/src/modules/publishing/adapters/cli/content.schemas.ts` — Schemas strict de manifesto/frontmatter e limites externos.
- `backend/src/modules/publishing/adapters/cli/content-parser.ts` — Filesystem seguro, YAML limitado, AST Markdown e extração textual.
- `backend/src/modules/publishing/application/validate-content.ts` — Validação de lote/grafo e diagnóstico por arquivo/campo.
- `backend/src/modules/publishing/adapters/cli/validate-content.ts` — Comando offline sem DB ou credencial de produção.

**Arquivos alterados/movidos (preservar implementação útil):**

- `content/articles/<articleId>/<locale>.md` — mover de frontend/artigo (oito arquivos); Corpos/fontmatter normalizados; caminhos concretos são os UUID registrados uma vez no catálogo.
- `backend/package.json` — alterar; content:validate e parsers/Zod nas categorias corretas; seed:local entra em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Dependências existentes reutilizadas:**

- `frontend/src/content/articles.ts` — Referência do catálogo real durante migração; substituição do consumo em [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e06-content-validation.test.ts` — Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-U de regras e erros de Normalizar os oito textos e validar a fonte editorial.
- `backend/tests/integration/e06-content-validation.test.ts` — Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-I das fronteiras reais e persistência/operação de Normalizar os oito textos e validar a fonte editorial.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E06-U01](./BACKEND_TEST_PLAN.md#e06-u01), [E06-U02](./BACKEND_TEST_PLAN.md#e06-u02), [E06-U03](./BACKEND_TEST_PLAN.md#e06-u03). Integração: [E06-I01](./BACKEND_TEST_PLAN.md#e06-i01).

**Resultado esperado:** Criar a fonte Git única, manifestos estáveis e validação offline, mantendo o conteúdo aprovado e a identidade dos pares.

**Definição de pronto:** Conteúdo validado sem fallback silencioso, UUID gravados, oito corpos preservados e placeholders excluídos; autoria/datas/licenças revisadas antes de publicar esse lote. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

<a id="e07"></a>

## 07. Importar, publicar, despublicar e arquivar atomicamente

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) · [Testes E07](./BACKEND_TEST_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

**Consultar antes de alterar:** [E07 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita), [testes E07](./BACKEND_TEST_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente--para-publicar).

**Arquivos criados:**

- `backend/src/modules/publishing/application/import-content.ts` — Coordenar validação, dry-run e applyEdition.
- `backend/src/modules/publishing/application/publish-translation.ts` — Intenção de publicar e invariantes de primeira data.
- `backend/src/modules/publishing/application/unpublish-translation.ts` — Retirada localizada explícita sem exclusão física.
- `backend/src/modules/publishing/application/archive-article.ts` — Arquivar/restaurar identidade editorial e visibilidade global.
- `backend/src/modules/publishing/adapters/cli/import-content.ts` — Entradas import/dry-run/publicação operacional, autorização pelo ambiente e exit codes.
- `backend/src/modules/publishing/adapters/postgres/publication-store.ts` — Transação única, CAS, upsert, namespace, rollback e auditoria.
- `backend/seeds/local.ts` — Fixture idempotente segura por meio de ImportContent de [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/publishing/application/ports/publication-store.ts` — alterar; Concretizar assinaturas de diff e resultados sem ORM.
- `backend/src/composition.ts` — alterar; Injetar store/reader/clock nos comandos.
- `backend/package.json` — alterar; content:import e content:publish/unpublish/archive/restore documentados. Acrescentar seed:local protegido agora que ImportContent existe.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e07-editorial-import.test.ts` — Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-U de regras e erros de Importar, publicar, despublicar e arquivar atomicamente.
- `backend/tests/integration/e07-editorial-import.test.ts` — Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I das fronteiras reais e persistência/operação de Importar, publicar, despublicar e arquivar atomicamente.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01), [E07-U02](./BACKEND_TEST_PLAN.md#e07-u02). Integração: [E07-I01](./BACKEND_TEST_PLAN.md#e07-i01), [E07-I02](./BACKEND_TEST_PLAN.md#e07-i02), [E07-I03](./BACKEND_TEST_PLAN.md#e07-i03), [E07-I04](./BACKEND_TEST_PLAN.md#e07-i04), [E07-I05](./BACKEND_TEST_PLAN.md#e07-i05).

**Resultado esperado:** Projetar revisões aprovadas do Git no banco com idempotência, comparação de revisão e retirada explícita de conteúdo.

**Definição de pronto:** Operações são idempotentes, transacionais e auditáveis; efeitos de retirada explícitos; erro em qualquer item não publica metade da edição; acesso CLI protegido documentado. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados).

<a id="e08"></a>

## 08. Consultar artigos, tags e séries publicados

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) · [Testes E08](./BACKEND_TEST_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Consultar antes de alterar:** [E08 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas), [testes E08](./BACKEND_TEST_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados--para-publicar).

**Arquivos criados:**

- `backend/src/modules/publishing/application/get-article.ts` — Detalhe e resolução de alias ou not-found.
- `backend/src/modules/publishing/application/list-articles.ts` — Filtros/paginação e projeção de resumos.
- `backend/src/modules/publishing/application/list-tags.ts` — Taxonomia localizada com conteúdo real.
- `backend/src/modules/publishing/application/list-series.ts` — Séries publicadas e contagem visível.
- `backend/src/modules/publishing/application/get-series.ts` — Membros ordenados e navegação coerente.
- `backend/src/modules/publishing/adapters/postgres/article-reader.ts` — Consultas parametrizadas e projections sem hidratar corpos desnecessários.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/publishing/application/content.dto.ts` — alterar; Finalizar DTOs e retorno discriminado de slug.
- `backend/src/modules/publishing/application/ports/article-reader.ts` — alterar; Completar assinaturas concretas e semântica de retorno nulo.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e08-public-queries.test.ts` — Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-U de regras e erros de Consultar artigos, tags e séries publicados.
- `backend/tests/integration/e08-public-queries.test.ts` — Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I das fronteiras reais e persistência/operação de Consultar artigos, tags e séries publicados.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E08-U01](./BACKEND_TEST_PLAN.md#e08-u01), [E08-U02](./BACKEND_TEST_PLAN.md#e08-u02). Integração: [E08-I01](./BACKEND_TEST_PLAN.md#e08-i01), [E08-I02](./BACKEND_TEST_PLAN.md#e08-i02), [E08-I03](./BACKEND_TEST_PLAN.md#e08-i03).

**Resultado esperado:** Disponibilizar projeções públicas completas e consistentes sem exposição de rascunhos ou N+1.

**Definição de pronto:** Todos caminhos públicos usam o mesmo predicado de visibilidade; contagem/navegação correspondem à lista; filtros e ordem determinísticos; nada de email, ORM ou Markdown em cards. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

<a id="e09"></a>

## 09. Expor API REST documentada e cache HTTP simples

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) · [Testes E09](./BACKEND_TEST_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Consultar antes de alterar:** [E09 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples), [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o), [testes E09](./BACKEND_TEST_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples--para-publicar).

**Arquivos criados:**

- `backend/src/modules/publishing/adapters/http/articles.routes.ts` — Rotas de lista/detalhe e redirect HTTP de slug.
- `backend/src/modules/publishing/adapters/http/taxonomy.routes.ts` — Rotas de tags/lista/detalhe de séries.
- `backend/src/modules/publishing/adapters/http/article.schemas.ts` — Validação strict de path/query e normalização de locale.
- `backend/src/http/public-cache.ts` — ETag/Last-Modified e conditional GET sem dados privados.
- `backend/openapi.yaml` — Contrato v1, health, erros e exemplos.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/http/app.ts` — alterar; Montar rotas públicas antes de 404.
- `backend/src/composition.ts` — alterar; Injetar casos de uso nas rotas.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-U de regras e erros de Expor API REST documentada e cache HTTP simples.
- `backend/tests/integration/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-I das fronteiras reais e persistência/operação de Expor API REST documentada e cache HTTP simples.
- `backend/tests/api/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-A de endpoints/status/DTO/auth de Expor API REST documentada e cache HTTP simples.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E09-U01](./BACKEND_TEST_PLAN.md#e09-u01), [E09-U02](./BACKEND_TEST_PLAN.md#e09-u02). Integração: [E09-I01](./BACKEND_TEST_PLAN.md#e09-i01), [E09-I02](./BACKEND_TEST_PLAN.md#e09-i02), [E09-I03](./BACKEND_TEST_PLAN.md#e09-i03). API: [E09-A01](./BACKEND_TEST_PLAN.md#e09-a01), [E09-A02](./BACKEND_TEST_PLAN.md#e09-a02), [E09-A03](./BACKEND_TEST_PLAN.md#e09-a03).

**Resultado esperado:** Conectar consultas públicas à API v1 com schemas, DTOs, cache correto e contrato verificável pelo frontend.

**Definição de pronto:** OpenAPI e respostas reais concordam; locale/visibilidade/limites são uniformes; leitura não exige sessão; cache nunca contém identidade do visitante. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

<a id="e10"></a>

## 10. Exportar snapshot e integrar publicação com o site

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) · [Testes E10](./BACKEND_TEST_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

**Consultar antes de alterar:** [E10 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site), [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel), [testes E10](./BACKEND_TEST_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site--para-publicar).

**Arquivos criados:**

- `backend/src/modules/publishing/application/export-snapshot.ts` — Coordenar snapshot público consistente.
- `backend/src/modules/publishing/adapters/cli/export-snapshot.ts` — Exportar JSON atomicamente e relatório de revisão.
- `frontend/src/content/snapshot.ts` — Validar/consumir contrato de snapshot no build.
- `frontend/scripts/prerender.tsx` — Renderizar catálogo completo React e sitemap a partir de uma revisão.
- `frontend/tests/publication.test.ts` — Contrato de HTML/URLs/sitemap e preservação de conteúdo.
- `frontend/generated/published-content.json` — Artefato gerado por export consistente, não fonte editável; schemaVersion/revision/hash e catálogo público completo.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/publishing/adapters/postgres/article-reader.ts` — alterar; Adicionar exportação consistente, sem limites da API pública.
- `backend/src/modules/publishing/application/content.dto.ts` — alterar; SnapshotSchema v1 e catálogo de URLs públicos.
- `frontend/src/content/articles.ts` — alterar; Substituir fonte raw/placeholders por snapshot; manter seletores úteis.
- `frontend/src/App.tsx` — alterar; Roteamento localizado e alternates reais mantendo layout.
- `frontend/src/features/articles/components/article-detail/MarkdownArticle.tsx` — alterar; Renderer AST seguro, preservar seções e links/code completos.
- `frontend/package.json` — alterar; Build com snapshot e pré-renderização, sem segredo backend.
- `backend/package.json` — alterar; content:export e validação de snapshot.
- `frontend/.gitignore` — alterar; Ignorar snapshot/artefatos gerados de build; preservar fontes e configuração existentes.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e10-publication-snapshot.test.ts` — Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-U de regras e erros de Exportar snapshot e integrar publicação com o site.
- `backend/tests/integration/e10-publication-snapshot.test.ts` — Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-I das fronteiras reais e persistência/operação de Exportar snapshot e integrar publicação com o site.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E10-U01](./BACKEND_TEST_PLAN.md#e10-u01), [E10-U02](./BACKEND_TEST_PLAN.md#e10-u02). Integração: [E10-I01](./BACKEND_TEST_PLAN.md#e10-i01), [E10-I02](./BACKEND_TEST_PLAN.md#e10-i02).

**Resultado esperado:** Entregar um artefato público completo e consistente que alimente renderização React, URLs e sitemap.

**Definição de pronto:** Um único snapshot alimenta páginas/metadados/sitemap; release PT/EN renderizado e smoke comprovados; integração é gate P0 mesmo que executada pelo responsável frontend. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).

<a id="e11"></a>

## 11. Entregar imagens e Compose reproduzíveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) · [Testes E11](./BACKEND_TEST_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

**Consultar antes de alterar:** [E11 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis), [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release), [testes E11](./BACKEND_TEST_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis--para-publicar).

**Arquivos criados:**

- `backend/Dockerfile` — Build, migrator e runtime não root com JS compilado.
- `compose.yaml` — db/migrate/api/web com dependências corretas e defaults locais.
- `deploy/nginx.conf` — Mesmo ponto de entrada, rotas /api/health, estáticos e 404/redirects do snapshot.
- `backend/scripts/smoke-image.mjs` — Verificar processo/health/API/usuário/artefato com dados de teste.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/Dockerfile.develop` — alterar; Hot reload interno dev:api, sem tentativa de executar Docker.
- `backend/docker-compose-develop.yml` — alterar; Corrigir comando/portas e apontar setup canônico sem perder volume.
- `backend/package.json` — alterar; Separar dev do host, dev:api de container e comandos de runtime.

**Dependências existentes reutilizadas:**

- `backend/.dockerignore` — Proteção de contexto já existente, validar alvos multistage.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e11-containers.test.ts` — Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-U de regras e erros de Entregar imagens e Compose reproduzíveis.
- `backend/tests/integration/e11-containers.test.ts` — Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-I das fronteiras reais e persistência/operação de Entregar imagens e Compose reproduzíveis.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E11-U01](./BACKEND_TEST_PLAN.md#e11-u01). Integração: [E11-I01](./BACKEND_TEST_PLAN.md#e11-i01), [E11-I02](./BACKEND_TEST_PLAN.md#e11-i02).

**Resultado esperado:** Completar setup da arquitetura com migrate obrigatório e JS compilado em produção, reaproveitando a simplificação existente.

**Definição de pronto:** Setup canônico funciona de ponta a ponta; runtime sem Docker interno e dependências sem uso; migrator precede API; imagem pronta para deploy sem secrets embutidos. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

<a id="e12"></a>

## 12. Automatizar validação e fechar operação do primeiro release

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) · [Testes E12](./BACKEND_TEST_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release--para-publicar) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Para publicar (P0).

**Dependências:** [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).

**Consultar antes de alterar:** [E12 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release), [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release), [R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos), [testes E12](./BACKEND_TEST_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release--para-publicar).

**Arquivos criados:**

- `.github/workflows/backend-ci.yml` — Validação sem secrets, banco efêmero e gates por implementação.
- `.github/workflows/deploy.yml` — Release confiável serializado com revisão e rollback operacional.
- `backend/scripts/backup.mjs` — Disparar backup com credencial operacional e verificar upload/checksum, sem imprimir senha.
- `backend/scripts/restore.mjs` — Restaurar destino isolado explicitamente e gerar evidência de recuperação.
- `backend/scripts/release-smoke.mjs` — Comparar revisões/API/site/catálogo e falhar com diagnóstico seguro.
- `docs/BACKEND_OPERATIONS.md` — Runbooks, contatos, host, proxy, backup, alertas, incidentes e retirada urgente.
- `docs/RELEASE_EVIDENCE.md` — Evidências datadas de CI/smoke/restore/revisão e decisões de lançamento.
- `README.md` — Quickstart real por projeto e navegação da documentação.
- `CONTRIBUTING.md` — Fonte editorial, revisão e comandos de validação.
- `SECURITY.md` — Canal privado real de vulnerabilidade e acesso operacional.
- `docs/CONTENT_LICENSE_POLICY.md` — Escopo de direitos de código/artigos/traduções/assets aprovado pelo mantenedor.
- `docs/PRIVACY_OPERATIONS.md` — Inventário inicial de dados/provedores/logs e decisões pendentes com responsáveis.
- `docs/adr/001-modular-monolith.md` — Registrar limites de dependência existentes da arquitetura.
- `docs/adr/002-editorial-source.md` — Git único e banco projeção; CAS e idempotência.
- `docs/adr/003-publication-snapshot.md` — URLs/renderização e janela de divergência aceita.

**Arquivos alterados/movidos (preservar implementação útil):**

- `deploy/nginx.conf` — alterar; TLS/limites/cache e retirada de conteúdo na topologia escolhida.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e12-release-operations.test.ts` — Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-U de regras e erros de Automatizar validação e fechar operação do primeiro release.
- `backend/tests/integration/e12-release-operations.test.ts` — Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-I das fronteiras reais e persistência/operação de Automatizar validação e fechar operação do primeiro release.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E12-U01](./BACKEND_TEST_PLAN.md#e12-u01). Integração: [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01), [E12-I02](./BACKEND_TEST_PLAN.md#e12-i02), [E12-I03](./BACKEND_TEST_PLAN.md#e12-i03).

**Resultado esperado:** Garantir que P0 possa ser publicado, observado e recuperado, com evidências objetivas e responsabilidades operacionais.

**Definição de pronto:** M1/P0 pronto apenas com CI, imagem, HTML PT/EN, backup restaurado e alertas exercitados; mantenedor preenche e aceita domínio/host/licenças/contatos/RPO/RTO. Nenhum requisito comunitário é antecipado. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).

<a id="e13"></a>

## 13. Criar identidade e persistência de sessões

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) · [Testes E13](./BACKEND_TEST_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**Consultar antes de alterar:** [E13 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es), [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas), [testes E13](./BACKEND_TEST_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/migrations/003-identity.ts` — Tabelas de identidade/sessão/OAuth e constraints de unicidade.
- `backend/src/modules/identity/domain/user.ts` — Estados/roles e perfil público mínimo.
- `backend/src/modules/identity/domain/session-policy.ts` — Expiração absoluta/idle e reautenticação com clock.
- `backend/src/modules/identity/application/identity.dto.ts` — Actor, PublicUser e dados privados internos separados.
- `backend/src/modules/identity/application/ports/identity-store.ts` — Identidade externa e gestão de estado por capacidade.
- `backend/src/modules/identity/application/ports/session-store.ts` — Persistência/revogação/touch de sessão opaca.
- `backend/src/modules/identity/application/ports/oauth-transaction-store.ts` — Transação temporária de início OAuth de uso único.
- `backend/src/modules/identity/adapters/postgres/identity-store.ts` — Resolver identidade externa atomicamente e sem merge por email.
- `backend/src/modules/identity/adapters/postgres/session-store.ts` — Hashes, expiry/touch/revoke e cleanup.
- `backend/src/modules/identity/adapters/postgres/oauth-transaction-store.ts` — Binding/state e consumo único, dados temporários protegidos.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/config/env.ts` — alterar; Feature flag e secrets OAuth obrigatórios somente quando comunidade habilitada.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e13-identity-storage.test.ts` — Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-U de regras e erros de Criar identidade e persistência de sessões.
- `backend/tests/integration/e13-identity-storage.test.ts` — Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I das fronteiras reais e persistência/operação de Criar identidade e persistência de sessões.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E13-U01](./BACKEND_TEST_PLAN.md#e13-u01). Integração: [E13-I01](./BACKEND_TEST_PLAN.md#e13-i01), [E13-I02](./BACKEND_TEST_PLAN.md#e13-i02), [E13-I03](./BACKEND_TEST_PLAN.md#e13-i03).

**Resultado esperado:** Adicionar contas GitHub independentes da autoria e sessões revogáveis no PostgreSQL, sem mudar UUID editoriais.

**Definição de pronto:** Schema P1 migra sobre catálogo P0 sem mudar IDs; sessão tem validação server-side e operação concorrente testada; flags deixam leitura pública funcionando sem OAuth. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

<a id="e14"></a>

## 14. Implementar login GitHub, sessão e logout seguros

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) · [Testes E14](./BACKEND_TEST_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).

**Consultar antes de alterar:** [E14 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros), [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas), [R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado), [testes E14](./BACKEND_TEST_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/src/modules/identity/application/ports/oauth-identity-provider.ts` — Trocar code PKCE e devolver identidade verificada mínima.
- `backend/src/modules/identity/adapters/github/oauth-provider.ts` — HTTP oficial limitado/timeout, tokens descartados e mensagens seguras.
- `backend/src/modules/identity/application/github-login.ts` — Iniciar/consumir fluxo, resolver user e criar sessão nova.
- `backend/src/modules/identity/application/get-me.ts` — DTO privado mínimo de sessão ativa.
- `backend/src/modules/identity/application/logout.ts` — Revogar sessão atual/todas com reautenticação para todas.
- `backend/src/modules/identity/adapters/http/auth.routes.ts` — Redirects, cookies, me/CSRF/logout e no-store.
- `backend/src/http/session.ts` — Resolver sessão e anexar Actor tipado, sem confiar no body.
- `backend/src/http/csrf.ts` — Origin e token sincronizado para mutações.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/composition.ts` — alterar; Conectar provider/stores/auth/clock; fake só composition de teste.
- `backend/src/http/app.ts` — alterar; Montar auth sob flag e middlewares privados por rota.
- `backend/openapi.yaml` — alterar; Contratos auth/me/cookie/CSRF e falhas sem exposição.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-U de regras e erros de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/integration/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-I das fronteiras reais e persistência/operação de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/api/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-A de endpoints/status/DTO/auth de Implementar login GitHub, sessão e logout seguros.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E14-U01](./BACKEND_TEST_PLAN.md#e14-u01), [E14-U02](./BACKEND_TEST_PLAN.md#e14-u02). Integração: [E14-I01](./BACKEND_TEST_PLAN.md#e14-i01), [E14-I02](./BACKEND_TEST_PLAN.md#e14-i02). API: [E14-A01](./BACKEND_TEST_PLAN.md#e14-a01), [E14-A02](./BACKEND_TEST_PLAN.md#e14-a02).

**Resultado esperado:** Entregar authorization code com state/PKCE, sessão própria e proteções do navegador.

**Definição de pronto:** Login/expiração/logout/CSRF funcionam sem GitHub real no CI; identidade estável e mínima; callback de replay e cross-browser bloqueados. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

<a id="e15"></a>

## 15. Aplicar permissões, bloqueio e limites de abuso

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) · [Testes E15](./BACKEND_TEST_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

**Consultar antes de alterar:** [E15 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade), [testes E15](./BACKEND_TEST_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/src/modules/identity/domain/authorization.ts` — Política pura por ação/role/ownership.
- `backend/src/modules/identity/application/manage-user.ts` — Block/unblock/role e revogação atômica por capacidade.
- `backend/src/modules/identity/adapters/cli/manage-user.ts` — Admin operacional com ID e motivo; bootstrap explícito.
- `backend/migrations/004-security-controls.ts` — Rate limit temporário e auditoria administrativa restrita.
- `backend/src/http/rate-limit.ts` — Traduz limites de ação e Retry-After para HTTP.
- `backend/src/infrastructure/rate-limiter.ts` — Counters temporários PostgreSQL atômicos e chaves de origem pseudonimizadas.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/identity/adapters/postgres/identity-store.ts` — alterar; Lock de usuário, atualização e revogação/auditoria atômicas.
- `backend/src/composition.ts` — alterar; Injetar política/capacidade de abuso nas mutações.
- `backend/openapi.yaml` — alterar; Documentar 403/429/503 e necessidade de reautenticação.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) com valores locais seguros e sem secrets reais.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-U de regras e erros de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/integration/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-I das fronteiras reais e persistência/operação de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/api/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-A de endpoints/status/DTO/auth de Aplicar permissões, bloqueio e limites de abuso.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E15-U01](./BACKEND_TEST_PLAN.md#e15-u01), [E15-U02](./BACKEND_TEST_PLAN.md#e15-u02). Integração: [E15-I01](./BACKEND_TEST_PLAN.md#e15-i01), [E15-I02](./BACKEND_TEST_PLAN.md#e15-i02). API: [E15-A01](./BACKEND_TEST_PLAN.md#e15-a01).

**Resultado esperado:** Definir proteção reutilizável para cada capacidade comunitária e operações administrativas protegidas.

**Definição de pronto:** Cada ação tem política verificável; bloqueio/roles são imediatos; não há elevação por payload/email; limites são compartilhados e testados em concorrência. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado).

<a id="e16"></a>

## 16. Entregar curtidas idempotentes e estado privado

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) · [Testes E16](./BACKEND_TEST_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

**Consultar antes de alterar:** [E16 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado), [R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo), [testes E16](./BACKEND_TEST_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/migrations/005-likes.ts` — Unicidade conta/artigo, FKs e índice reverso.
- `backend/src/modules/community/application/ports/like-store.ts` — ensurePresent/ensureAbsent/listMine sem operadores ORM.
- `backend/src/modules/community/application/set-like.ts` — Intenção idempotente, autorização e recurso público.
- `backend/src/modules/community/application/get-my-likes.ts` — Consulta privada limitada de preferências.
- `backend/src/modules/community/adapters/postgres/like-store.ts` — INSERT/DELETE atômicos e consultas indexadas.
- `backend/src/modules/community/adapters/http/likes.routes.ts` — PUT/DELETE + sessão/CSRF/limite e GET privado.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/composition.ts` — alterar; Ligar likes a auth/limiter/persistência.
- `backend/openapi.yaml` — alterar; Semântica idempotente, estado privado e 204/404.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) sob flags e proteções corretas, antes do 404.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-U de regras e erros de Entregar curtidas idempotentes e estado privado.
- `backend/tests/integration/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-I das fronteiras reais e persistência/operação de Entregar curtidas idempotentes e estado privado.
- `backend/tests/api/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-A de endpoints/status/DTO/auth de Entregar curtidas idempotentes e estado privado.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E16-U01](./BACKEND_TEST_PLAN.md#e16-u01). Integração: [E16-I01](./BACKEND_TEST_PLAN.md#e16-i01), [E16-I02](./BACKEND_TEST_PLAN.md#e16-i02). API: [E16-A01](./BACKEND_TEST_PLAN.md#e16-a01).

**Resultado esperado:** Permitir uma curtida por conta/artigo, compartilhada entre traduções, e leituras públicas/privadas separadas.

**Definição de pronto:** Likes são idempotentes entre instâncias e idiomas; estado privado não entra em cache público; imports preservam associações. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

<a id="e17"></a>

## 17. Comentários moderados e denúncias operáveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) · [Testes E17](./BACKEND_TEST_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado).

**Consultar antes de alterar:** [E17 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis), [R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente), [R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria), [R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana), [testes E17](./BACKEND_TEST_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/migrations/006-comments.ts` — Comments/reports/audit, índices, estados e concorrência por versão.
- `backend/src/modules/community/domain/comment.ts` — Estados, ownership, versionamento e transições.
- `backend/src/modules/community/application/ports/comment-store.ts` — Criar/editar/moderar/remover e ler conjuntos visíveis/privados atomicamente.
- `backend/src/modules/community/application/ports/report-store.ts` — Denúncia aberta única e resolução auditada.
- `backend/src/modules/community/application/comments.ts` — Casos create/edit/delete/listMine/listPublic, entradas e permissões explícitas.
- `backend/src/modules/community/application/moderation.ts` — Fila, decisão de visibilidade, denúncia e resolução.
- `backend/src/modules/community/adapters/markdown/comment-markdown.ts` — AST restrito, limite de links e sanitização segura de saída.
- `backend/src/modules/community/adapters/postgres/comment-store.ts` — Predicado público, cursor, CAS version e auditoria transacional.
- `backend/src/modules/community/adapters/postgres/report-store.ts` — Deduplicação/resolução e consulta restrita.
- `backend/src/modules/community/adapters/http/comments.routes.ts` — Rotas públicas/privadas e schema strict de body/cursor.
- `backend/src/modules/community/adapters/http/moderation.routes.ts` — Fila/decisão/denúncias com RBAC e no-store.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/openapi.yaml` — alterar; Comentários localizados, filas, versões, reports e exemplos de estados.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) sob flags e proteções corretas, antes do 404.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-U de regras e erros de Comentários moderados e denúncias operáveis.
- `backend/tests/integration/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-I das fronteiras reais e persistência/operação de Comentários moderados e denúncias operáveis.
- `backend/tests/api/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-A de endpoints/status/DTO/auth de Comentários moderados e denúncias operáveis.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E17-U01](./BACKEND_TEST_PLAN.md#e17-u01), [E17-U02](./BACKEND_TEST_PLAN.md#e17-u02), [E17-U03](./BACKEND_TEST_PLAN.md#e17-u03). Integração: [E17-I01](./BACKEND_TEST_PLAN.md#e17-i01), [E17-I02](./BACKEND_TEST_PLAN.md#e17-i02), [E17-I03](./BACKEND_TEST_PLAN.md#e17-i03). API: [E17-A01](./BACKEND_TEST_PLAN.md#e17-a01), [E17-A02](./BACKEND_TEST_PLAN.md#e17-a02).

**Resultado esperado:** Abrir discussão localizada com pré-moderação, edição segura, remoção e fila operacional real.

**Definição de pronto:** Fluxo criar→revisar→publicar→editar→revisar→remover testado; contagem corresponde exatamente a visible; filas/denúncias operáveis e sem exposição de PII. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).

<a id="e18"></a>

## 18. Registrar views deduplicadas e estatísticas reais

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) · [Testes E18](./BACKEND_TEST_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado), [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

**Consultar antes de alterar:** [E18 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais), [R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos), [testes E18](./BACKEND_TEST_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/migrations/007-views.ts` — Dedupe temporário e agregados diários versionados.
- `backend/src/modules/community/domain/view-policy.ts` — Identidade/janela/versão e elegibilidade da métrica.
- `backend/src/modules/community/application/ports/view-recorder.ts` — Registrar observação atomicamente sem expor aceitação ao cliente.
- `backend/src/modules/community/application/ports/stats-reader.ts` — Contagens públicas por escopo e versão.
- `backend/src/modules/community/application/record-view.ts` — Validar recurso, identidade permitida e chamar recorder.
- `backend/src/modules/community/application/get-stats.ts` — Stats com definições/escopos e limites numéricos.
- `backend/src/modules/community/adapters/postgres/view-recorder.ts` — Dedupe e upsert em única transação.
- `backend/src/modules/community/adapters/postgres/stats-reader.ts` — Agregação de likes/comments/views sem N+1.
- `backend/src/modules/community/adapters/http/views.routes.ts` — Observação, consentimento técnico/cookie opcional e 204.
- `backend/src/modules/community/adapters/http/stats.routes.ts` — Stats públicos cacheáveis, sem personalização.
- `frontend/src/features/articles/useQualifiedView.ts` — Timer de visibilidade e envio limitado sob preferência de privacidade.
- `docs/adr/005-metrics-privacy.md` — Semântica/versionamento/limitações e identificador aprovado.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/openapi.yaml` — alterar; Views/consent/stats, números e início da medição.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) sob flags e proteções corretas, antes do 404.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) com valores locais seguros e sem secrets reais.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-U de regras e erros de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/integration/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-I das fronteiras reais e persistência/operação de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/api/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-A de endpoints/status/DTO/auth de Registrar views deduplicadas e estatísticas reais.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E18-U01](./BACKEND_TEST_PLAN.md#e18-u01), [E18-U02](./BACKEND_TEST_PLAN.md#e18-u02). Integração: [E18-I01](./BACKEND_TEST_PLAN.md#e18-i01), [E18-I02](./BACKEND_TEST_PLAN.md#e18-i02), [E18-I03](./BACKEND_TEST_PLAN.md#e18-i03). API: [E18-A01](./BACKEND_TEST_PLAN.md#e18-a01), [E18-A02](./BACKEND_TEST_PLAN.md#e18-a02).

**Resultado esperado:** Entregar as três métricas com escopo explícito, deduplicação concorrente e privacidade definida.

**Definição de pronto:** Likes/comentários/views reais e explicados, dedupe correto sob concorrência/rollback; coleta anônima só com política ativada e nenhuma falsa métrica histórica. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

<a id="e19"></a>

## 19. Excluir contas, exportar dados e executar retenção

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) · [Testes E19](./BACKEND_TEST_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).

**Consultar antes de alterar:** [E19 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis), [testes E19](./BACKEND_TEST_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/migrations/008-account-lifecycle.ts` — Solicitações de exclusão/exportação, ledger/retenção e agregado mensal versionado.
- `backend/src/modules/identity/application/ports/account-lifecycle-store.ts` — Preparar/finalizar exclusão e solicitar/exportar dados atomicamente.
- `backend/src/modules/identity/application/delete-account.ts` — Reautenticação, bloqueio imediato e resultado 202 idempotente operacional.
- `backend/src/modules/identity/application/export-account.ts` — Solicitação autenticada e projeção segura para atendimento.
- `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts` — Integração transacional com comunidade, purge e replay de exclusões.
- `backend/src/modules/identity/adapters/http/account.routes.ts` — DELETE me/POST export com CSRF/no-store.
- `backend/src/modules/identity/adapters/cli/account-operations.ts` — Finalizar/extrair/atender pedidos por ID protegido.
- `backend/scripts/cleanup.ts` — Retenção em lotes e agregação mensal com checkpoints.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/community/adapters/postgres/stats-reader.ts` — alterar; Somar agregados mensais+diários sem duplicação.
- `backend/scripts/restore.mjs` — alterar; Reaplicar ledger antes de liberar sistema restaurado.
- `docs/PRIVACY_OPERATIONS.md` — alterar; Inventário P1, prazos aprovados, atendimento, ledger e exceções.
- `backend/openapi.yaml` — alterar; Fluxos 202, reautenticação e solicitação de direitos.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) sob flags e proteções corretas, antes do 404.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) com valores locais seguros e sem secrets reais.
- `backend/package.json` — alterar; Registrar comandos operacionais da [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) e somente dependências realmente usadas, mantendo lockfile coerente.
- `backend/package-lock.json` — alterar; Fixar dependências adicionadas para [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), sem atualização de pacotes não relacionados.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-U de regras e erros de Excluir contas, exportar dados e executar retenção.
- `backend/tests/integration/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Excluir contas, exportar dados e executar retenção.
- `backend/tests/api/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-A de endpoints/status/DTO/auth de Excluir contas, exportar dados e executar retenção.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E19-U01](./BACKEND_TEST_PLAN.md#e19-u01), [E19-U02](./BACKEND_TEST_PLAN.md#e19-u02). Integração: [E19-I01](./BACKEND_TEST_PLAN.md#e19-i01), [E19-I02](./BACKEND_TEST_PLAN.md#e19-i02), [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03). API: [E19-A01](./BACKEND_TEST_PLAN.md#e19-a01).

**Resultado esperado:** Cumprir política técnica de dados de ponta a ponta, com processo de exportação inicialmente manual autenticado.

**Definição de pronto:** Exclusão impede writes e termina em purge real; exportação manual tem pedido/entrega verificável; cleanup executável e restore respeita exclusões; política aprovada antes de coletar. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

<a id="e20"></a>

## 20. Habilitar comunidade com observabilidade e operação completas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) · [Testes E20](./BACKEND_TEST_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas--ap%C3%B3s-publica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Após publicação (P1).

**Dependências:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

**Consultar antes de alterar:** [E20 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas), [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis), [R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana), [testes E20](./BACKEND_TEST_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas--ap%C3%B3s-publica%C3%A7%C3%A3o).

**Arquivos criados:**

- `backend/src/infrastructure/metrics.ts` — Métricas limitadas de HTTP/pool/ações, sem PII em labels.
- `backend/scripts/community-smoke.mjs` — Fluxo integrado staging com usuários de teste e cleanup.
- `docs/COMMUNITY_OPERATIONS.md` — Fila, abuso, papéis, métricas e capacidade humana.
- `docs/adr/004-sessions.md` — Cookies opacos, revogação e CSRF.
- `CODE_OF_CONDUCT.md` — Conduta e canal/responsável verdadeiros.
- `.github/ISSUE_TEMPLATE/bug.yml` — Reprodução de bug sem solicitar secrets.
- `.github/ISSUE_TEMPLATE/content.yml` — Correção/tradução referenciando artigo e locale.
- `.github/pull_request_template.md` — Problema, verificação e revisão editorial.
- `frontend/src/features/articles/community.tsx` — Integração de login/likes/comments/stats reais com estados privados fora do HTML cacheado.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/http/request-log.ts` — alterar; Acrescentar observação de histogramas mantendo logs e redação.
- `backend/src/http/app.ts` — alterar; Métricas internas protegidas e gate comunitário.
- `docs/RELEASE_EVIDENCE.md` — alterar; Evidências comunitárias, políticas aprovadas e carga medida.
- `backend/package.json` — alterar; Registrar comandos operacionais da [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente.
- `backend/package-lock.json` — alterar; Fixar dependências adicionadas para [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-U de regras e erros de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/integration/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/api/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Habilitar comunidade com observabilidade e operação completas.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E20-U01](./BACKEND_TEST_PLAN.md#e20-u01). Integração: [E20-I01](./BACKEND_TEST_PLAN.md#e20-i01), [E20-I02](./BACKEND_TEST_PLAN.md#e20-i02). API: [E20-A01](./BACKEND_TEST_PLAN.md#e20-a01).

**Resultado esperado:** Validar comunidade inteira e acrescentar métricas úteis, documentação operacional e ferramentas de contribuição.

**Definição de pronto:** M2/P1 pronto com pacote comunitário completo, testes/autorização/privacidade/moderação humana e métricas reais; nenhuma flag habilitada só porque endpoints respondem. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas).

<a id="e21"></a>

## 21. Conta local com confirmação e recuperação completas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) · [Testes E21](./BACKEND_TEST_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E21 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas), [R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo), [R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos), [testes E21](./BACKEND_TEST_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `backend/migrations/009-local-credentials.ts` — Credenciais locais, tokens por finalidade e outbox cifrada.
- `backend/src/modules/identity/application/ports/password-hasher.ts` — hash/verify/needsRehash sem dependência de algoritmo no domínio.
- `backend/src/modules/identity/application/ports/email-sender.ts` — Entrega transacional por propósito sem acoplamento a fornecedor.
- `backend/src/modules/identity/application/local-auth.ts` — Register/login/verify/resend/forgot/reset e antienumeração.
- `backend/src/modules/identity/adapters/crypto/password-hasher.ts` — Argon2id calibrado e upgrade de hash.
- `backend/src/modules/identity/adapters/email/email-sender.ts` — Fornecedor real/sandbox e timeouts/retries seguros.
- `backend/src/modules/identity/adapters/postgres/local-credential-store.ts` — Unicidade email e consumo atômico de token.
- `backend/src/modules/identity/adapters/http/local-auth.routes.ts` — Schemas e endpoints locais sobre sessão existente.
- `backend/scripts/send-email-outbox.ts` — Envio confiável idempotente e observável.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts` — alterar; Excluir novos dados sensíveis e preservar allowlist do export.
- `backend/scripts/cleanup.ts` — alterar; Expirar account tokens/outbox sem reter conteúdo pessoal.
- `backend/openapi.yaml` — alterar; Contratos locais e erros genéricos.
- `docs/PRIVACY_OPERATIONS.md` — alterar; Email obrigatório local/fornecedor/retention e nova finalidade.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) sob flags e proteções corretas, antes do 404.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) com valores locais seguros e sem secrets reais.
- `backend/package.json` — alterar; Registrar comandos operacionais da [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) e somente dependências realmente usadas, mantendo lockfile coerente.
- `backend/package-lock.json` — alterar; Fixar dependências adicionadas para [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas), sem atualização de pacotes não relacionados.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-U de regras e erros de Conta local com confirmação e recuperação completas.
- `backend/tests/integration/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Conta local com confirmação e recuperação completas.
- `backend/tests/api/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Conta local com confirmação e recuperação completas.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E21-U01](./BACKEND_TEST_PLAN.md#e21-u01), [E21-U02](./BACKEND_TEST_PLAN.md#e21-u02). Integração: [E21-I01](./BACKEND_TEST_PLAN.md#e21-i01), [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02). API: [E21-A01](./BACKEND_TEST_PLAN.md#e21-a01), [E21-A02](./BACKEND_TEST_PLAN.md#e21-a02).

**Resultado esperado:** Adicionar email/senha sem enfraquecer sessões, privacidade e prevenção de abuso existentes.

**Definição de pronto:** Ativar conta local somente com confirmação/reset/hash/email/abuso/exclusão integrados; nenhuma rota parcial habilitada e nenhuma enumeração direta. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura).

<a id="e22"></a>

## 22. Respostas limitadas e progresso explícito de leitura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) · [Testes E22](./BACKEND_TEST_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E22 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura), [R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um), [R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos), [testes E22](./BACKEND_TEST_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `backend/migrations/010-learning-threads.ts` — parentId e progresso; incluir prerequisitos/bookmarks só ao ativar respectivas subcapacidades.
- `backend/src/modules/publishing/application/ports/progress-store.ts` — Marcação explícita/lista de progresso privado por artigo.
- `backend/src/modules/publishing/application/reading-progress.ts` — Conclusão por membros visíveis e preferências privadas opcionais.
- `backend/src/modules/publishing/adapters/postgres/progress-store.ts` — Upsert idempotente e queries privadas.
- `backend/src/modules/publishing/adapters/http/progress.routes.ts` — PUT/GET autenticados; bookmarks apenas se ativados.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/community/domain/comment.ts` — alterar; Profundidade/mesma tradução e tombstone de raiz.
- `backend/src/modules/community/adapters/postgres/comment-store.ts` — alterar; Validar parent atomicamente e paginar raízes/respostas.
- `backend/src/modules/community/adapters/http/comments.routes.ts` — alterar; parentId opcional e rota paginada de replies.
- `backend/src/modules/publishing/domain/series.ts` — alterar; Pré-requisitos sem ciclos quando subcapacidade for ativada.
- `backend/src/modules/publishing/adapters/postgres/publication-store.ts` — alterar; Persistir grafo de pré-requisitos validado no import se ativado.
- `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts` — alterar; Excluir/exportar progresso e bookmarks.
- `backend/openapi.yaml` — alterar; Respostas, progresso e contratos condicionais efetivamente entregues.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) sob flags e proteções corretas, antes do 404.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-U de regras e erros de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/integration/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-I das fronteiras reais e persistência/operação de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/api/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-A de endpoints/status/DTO/auth de Respostas limitadas e progresso explícito de leitura.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E22-U01](./BACKEND_TEST_PLAN.md#e22-u01), [E22-U02](./BACKEND_TEST_PLAN.md#e22-u02). Integração: [E22-I01](./BACKEND_TEST_PLAN.md#e22-i01), [E22-I02](./BACKEND_TEST_PLAN.md#e22-i02). API: [E22-A01](./BACKEND_TEST_PLAN.md#e22-a01).

**Resultado esperado:** Evoluir comentários e trilhas sem árvores ilimitadas nem confundir view com aprendizado.

**Definição de pronto:** Subcapacidades ativadas têm migrations/API/testes completos; nenhuma ligação entre métrica e aprendizagem; comentários/séries existentes evoluem sem recriar IDs ou quebrar clientes planos. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais).

<a id="e23"></a>

## 23. Busca por idioma e relacionados editoriais

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) · [Testes E23](./BACKEND_TEST_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E23 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais), [R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais), [testes E23](./BACKEND_TEST_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `backend/migrations/011-search.ts` — Índice textual localizado e backfill/rebuild compatível.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/publishing/adapters/postgres/article-reader.ts` — alterar; Full-text/ranking e relacionados com predicado público.
- `backend/src/modules/publishing/adapters/postgres/publication-store.ts` — alterar; Atualizar projeção textual/curadoria junto do import.
- `backend/src/modules/publishing/application/list-articles.ts` — alterar; q com relevância opcional, preservando filtros.
- `backend/src/modules/publishing/application/content.dto.ts` — alterar; relatedArticles opcional e sort=relevance.
- `backend/src/modules/publishing/adapters/http/article.schemas.ts` — alterar; Relevância somente com q e query limitada.
- `backend/src/modules/publishing/adapters/cli/content.schemas.ts` — alterar; Curadoria explícita por UUID e ordem.
- `backend/openapi.yaml` — alterar; Busca/relacionados e fallback de idioma explícitos.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-U de regras e erros de Busca por idioma e relacionados editoriais.
- `backend/tests/integration/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-I das fronteiras reais e persistência/operação de Busca por idioma e relacionados editoriais.
- `backend/tests/api/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-A de endpoints/status/DTO/auth de Busca por idioma e relacionados editoriais.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E23-U01](./BACKEND_TEST_PLAN.md#e23-u01). Integração: [E23-I01](./BACKEND_TEST_PLAN.md#e23-i01), [E23-I02](./BACKEND_TEST_PLAN.md#e23-i02). API: [E23-A01](./BACKEND_TEST_PLAN.md#e23-a01).

**Resultado esperado:** Melhorar descoberta com PostgreSQL antes de introduzir motor externo ou recomendações por IA.

**Definição de pronto:** Busca útil medida, índices mantidos atomicamente e API retrocompatível; relacionados reais e localizados, sem preenchimento fictício. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade).

<a id="e24"></a>

## 24. Evoluir operação editorial e ativação de releases sob necessidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) · [Testes E24](./BACKEND_TEST_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E24 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade), [R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial), [testes E24](./BACKEND_TEST_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `backend/src/modules/publishing/application/ports/editorial-proposal-store.ts` — Propor revisão Git com CAS e repositório fixo quando painel for necessário.
- `backend/src/modules/publishing/application/propose-content.ts` — Autorizar proposta editorial usando validação existente.
- `backend/src/modules/publishing/adapters/http/editorial.routes.ts` — Proposta/preview privado e aprovação protegida.
- `backend/src/modules/publishing/adapters/git/editorial-proposal-store.ts` — Branch/PR em repositório permitido, token só backend.
- `backend/migrations/012-editorial-releases.ts` — Snapshots/ponteiro ativo somente se ativação for necessária.
- `backend/src/modules/publishing/application/activate-release.ts` — CAS/ativação/rollback idempotente de snapshot validado.
- `docs/adr/006-editorial-evolution.md` — Gatilho, única fonte escolhida e consistência/recuperação de release.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/publishing/application/import-content.ts` — alterar; Preparar release candidata preservando autoridade Git e interações.
- `backend/src/modules/publishing/application/publish-translation.ts` — alterar; Associar publicação validada à candidata sem alterar identidade/datas.
- `backend/src/modules/publishing/adapters/postgres/publication-store.ts` — alterar; Persistir revisões imutáveis/candidato quando subcapacidade ativada.
- `backend/src/modules/publishing/adapters/postgres/article-reader.ts` — alterar; Ler release fixada e denylist de retirada urgente.
- `backend/scripts/release-smoke.mjs` — alterar; Verificar artefato candidato antes da ativação e releaseId cliente/API.
- `backend/openapi.yaml` — alterar; Apenas contratos editoriais/release realmente ativados.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) sob flags e proteções corretas, antes do 404.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) com valores locais seguros e sem secrets reais.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-U de regras e erros de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/integration/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-I das fronteiras reais e persistência/operação de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/api/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-A de endpoints/status/DTO/auth de Evoluir operação editorial e ativação de releases sob necessidade.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E24-U01](./BACKEND_TEST_PLAN.md#e24-u01), [E24-U02](./BACKEND_TEST_PLAN.md#e24-u02). Integração: [E24-I01](./BACKEND_TEST_PLAN.md#e24-i01), [E24-I02](./BACKEND_TEST_PLAN.md#e24-i02). API: [E24-A01](./BACKEND_TEST_PLAN.md#e24-a01).

**Resultado esperado:** Permitir operação editorial mais acessível sem introduzir duas fontes concorrentes ou publicação parcialmente ativada.

**Definição de pronto:** Autoridade editorial única preservada; subcapacidade escolhida tem fluxo/retry/recuperação testados; ativação não promete atomicidade que host não fornece. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda).

<a id="e25"></a>

## 25. Automatizar atendimento de privacidade quando houver demanda

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) · [Testes E25](./BACKEND_TEST_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E25 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda), [R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria), [testes E25](./BACKEND_TEST_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `backend/src/modules/identity/application/ports/private-export-store.ts` — Gravar/ler/apagar artefato privado temporário.
- `backend/src/modules/identity/adapters/storage/private-export-store.ts` — Storage privado com TTL e paths controlados.
- `backend/migrations/013-private-exports.ts` — Metadados/tokens/jobs de export automático, sem body de dados no job.
- `backend/scripts/process-exports.ts` — Processar fila PostgreSQL pequena com lease/retry idempotente.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/modules/identity/application/export-account.ts` — alterar; Automatizar pedido existente e estado de entrega sem mudar escopo de dados.
- `backend/src/modules/identity/adapters/http/account.routes.ts` — alterar; Status/download temporário com ownership e reautenticação.
- `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts` — alterar; Estado de job/token consumível e cancelamento na exclusão.
- `backend/scripts/cleanup.ts` — alterar; Expirar artefatos/leases/tokens e reconciliar órfãos.
- `docs/PRIVACY_OPERATIONS.md` — alterar; Atendimento automático e fallback manual.
- `backend/openapi.yaml` — alterar; Status/download privado sem exposição de links em caches.
- `backend/src/composition.ts` — alterar; Conectar ports/adapters/casos de uso de [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e injetar controles existentes sem duplicá-los.
- `backend/src/http/app.ts` — alterar; Montar rotas de [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) sob flags e proteções corretas, antes do 404.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) com valores locais seguros e sem secrets reais.
- `backend/package.json` — alterar; Registrar comandos operacionais da [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) e somente dependências realmente usadas, mantendo lockfile coerente.
- `backend/package-lock.json` — alterar; Fixar dependências adicionadas para [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda), sem atualização de pacotes não relacionados.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-U de regras e erros de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/integration/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-I das fronteiras reais e persistência/operação de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/api/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-A de endpoints/status/DTO/auth de Automatizar atendimento de privacidade quando houver demanda.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E25-U01](./BACKEND_TEST_PLAN.md#e25-u01). Integração: [E25-I01](./BACKEND_TEST_PLAN.md#e25-i01), [E25-I02](./BACKEND_TEST_PLAN.md#e25-i02). API: [E25-A01](./BACKEND_TEST_PLAN.md#e25-a01).

**Resultado esperado:** Reduzir trabalho operacional de exportação sem ampliar exposição de dados ou alterar política aprovada.

**Definição de pronto:** Atendimento automático tem ownership, TTL, cancelamento e retry provados; processo P1 permanece fallback até estabilidade. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido).

<a id="e26"></a>

## 26. Escalar apenas o gargalo medido

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Implementação E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) · [Testes E26](./BACKEND_TEST_PLAN.md#e26-escalar-apenas-o-gargalo-medido--evolu%C3%A7%C3%A3o-futura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Fase:** Evolução futura (P2).

**Dependências:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Consultar antes de alterar:** [E26 no plano](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido), [R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica), [testes E26](./BACKEND_TEST_PLAN.md#e26-escalar-apenas-o-gargalo-medido--evolu%C3%A7%C3%A3o-futura).

**Arquivos criados:**

- `docs/PERFORMANCE_DECISIONS.md` — Baseline, gargalo, experimento, ganho e critério de rollback por subcapacidade.
- `backend/scripts/load-test.mjs` — Carga reproduzível com dados sintéticos e relatório sem PII.
- `backend/src/infrastructure/public-cache-store.ts` — Cache externo opcional de representações públicas com invalidação.
- `backend/scripts/reconcile-stats.ts` — Reconciliar counters quando materialização existir.
- `backend/src/workers/blog-worker.ts` — Consumir outbox idempotente apenas sob backlog comprovado.
- `backend/src/infrastructure/tracing.ts` — Tracing opcional sem dados privados quando houver múltiplos processos.
- `backend/src/modules/publishing/application/ports/editorial-asset-store.ts` — Capacidade de mídia editorial autorizada quando necessária.
- `backend/src/modules/publishing/adapters/storage/editorial-asset-store.ts` — Object storage e validação de assets, sem filesystem efêmero.
- `backend/migrations/014-measured-optimizations.ts` — Apenas alterações efetivamente escolhidas: outbox/counters/partições; dividir em novas versões se entregas distintas.

**Arquivos alterados/movidos (preservar implementação útil):**

- `backend/src/infrastructure/rate-limiter.ts` — alterar; Adapter Redis opcional só se PG for gargalo, preservando contrato.
- `backend/src/modules/community/adapters/postgres/view-recorder.ts` — alterar; Manter v1 ou adaptar batching versionado somente sob ADR explícito.
- `backend/src/modules/community/adapters/postgres/stats-reader.ts` — alterar; Counters materializados/replicas apenas após medida e sem mudar escopo.
- `backend/src/infrastructure/database.ts` — alterar; Pools/topologia de réplicas/PgBouncer mediante teste.
- `backend/src/composition.ts` — alterar; Selecionar adapters por config validada, sem opções mortas.
- `docs/BACKEND_OPERATIONS.md` — alterar; Novas dependências, restore, rollback, métricas e recuperação.
- `backend/src/config/env.ts` — alterar; Validar configurações/secrets/prazos da capacidade [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) somente quando habilitada; não permitir defaults inseguros em produção.
- `backend/.env.example` — alterar; Documentar variáveis e flags da [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) com valores locais seguros e sem secrets reais.
- `backend/package.json` — alterar; Registrar comandos operacionais da [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) e somente dependências realmente usadas, mantendo lockfile coerente.
- `backend/package-lock.json` — alterar; Fixar dependências adicionadas para [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido), sem atualização de pacotes não relacionados.

**Dependências existentes reutilizadas:**

- Componentes entregues pelas dependências acima; não recriá-los.

**Testes criados no mesmo incremento:**

- `backend/tests/unit/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-U de regras e erros de Escalar apenas o gargalo medido.
- `backend/tests/integration/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-I das fronteiras reais e persistência/operação de Escalar apenas o gargalo medido.
- `backend/tests/api/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-A de endpoints/status/DTO/auth de Escalar apenas o gargalo medido.

**Execução dentro da etapa:** ler estado/contratos → construir políticas/inputs com unitários → migration/adapter com integração real → HTTP/CLI e contrato quando aplicável → rodar suites e checks afetados. Unitários: [E26-U01](./BACKEND_TEST_PLAN.md#e26-u01). Integração: [E26-I01](./BACKEND_TEST_PLAN.md#e26-i01), [E26-I02](./BACKEND_TEST_PLAN.md#e26-i02), [E26-I03](./BACKEND_TEST_PLAN.md#e26-i03). API: [E26-A01](./BACKEND_TEST_PLAN.md#e26-a01).

**Resultado esperado:** Executar uma otimização por vez, preservando contratos, consistência e operação do monólito.

**Definição de pronto:** Melhoria entregue somente com diagnóstico/ganho/reversão documentados e regressões funcionais verdes; nenhuma infraestrutura adicionada sem gatilho. Todas as suites da etapa passam; documentação e OpenAPI refletindo comportamento implementado. Não avançar com erro conhecido de segurança/consistência.

**Próximo passo:** registrar resultados/adiamentos e manter operação; nenhuma infraestrutura futura automática.

<!-- navigation:anchor:start -->
<a id="nav-section-002"></a>
<!-- navigation:anchor:end -->

## Gates que não podem ser substituídos por “build passou”

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

- Antes de [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) concluir/P0 publicar: imagem executável, DB migrado, catálogo real, HTML completo PT/EN, alertas e backup restaurado; domínio/host/licenças/contatos/objetivos de recuperação reais preenchidos.
- Antes de [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) concluir/P1 habilitar: OAuth/sessão/CSRF/abuso/ownership, moderação humana, métricas verdadeiras, exclusão/export/retention e replay pós-restore provados.
- P2: cada subcapacidade precisa gatilho real, contrato completo, testes novos e regressões dos arquivos evoluídos; registrar adiado se gatilho ausente. Não confundir opção planejada com entrega concluída.
