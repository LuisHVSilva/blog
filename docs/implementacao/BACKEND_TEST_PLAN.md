# Planejamento de testes do backend

[Comece aqui — guia de leitura e execução](./00_COMECE_AQUI.md)

<!-- navigation:index:start -->
**Navegação:** [Ordem de implementação](./BACKEND_IMPLEMENTATION_ORDER.md) · [Plano detalhado](./BACKEND_IMPLEMENTATION_PLAN.md) · [Estrutura de arquivos](./BACKEND_IMPLEMENTATION_STRUCTURE.md) · [Regras de negócio](./BACKEND_BUSINESS_RULES.md) · **Plano de testes**

[Arquitetura de referência](./BACKEND_ARCHITECTURE.md)

<a id="indice"></a>

## Índice

- [Estratégia e infraestrutura comuns](#estrat%C3%A9gia-e-infraestrutura-comuns)
- [Matriz de cobertura por implementação](#matriz-de-cobertura-por-implementa%C3%A7%C3%A3o)
- [E01. Tornar executáveis os comandos e preservar a base existente — Para publicar](#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente--para-publicar)
- [E02. Separar composição, HTTP, configuração e ciclo de vida — Para publicar](#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida--para-publicar)
- [E03. Conexão PostgreSQL e executor de migrations — Para publicar](#e03-conex%C3%A3o-postgresql-e-executor-de-migrations--para-publicar)
- [E04. Definir domínio editorial e contratos de aplicação — Para publicar](#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o--para-publicar)
- [E05. Criar schema editorial, constraints e namespace de slugs — Para publicar](#e05-criar-schema-editorial-constraints-e-namespace-de-slugs--para-publicar)
- [E06. Normalizar os oito textos e validar a fonte editorial — Para publicar](#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial--para-publicar)
- [E07. Importar, publicar, despublicar e arquivar atomicamente — Para publicar](#e07-importar-publicar-despublicar-e-arquivar-atomicamente--para-publicar)
- [E08. Consultar artigos, tags e séries publicados — Para publicar](#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados--para-publicar)
- [E09. Expor API REST documentada e cache HTTP simples — Para publicar](#e09-expor-api-rest-documentada-e-cache-http-simples--para-publicar)
- [E10. Exportar snapshot e integrar publicação com o site — Para publicar](#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site--para-publicar)
- [E11. Entregar imagens e Compose reproduzíveis — Para publicar](#e11-entregar-imagens-e-compose-reproduz%C3%ADveis--para-publicar)
- [E12. Automatizar validação e fechar operação do primeiro release — Para publicar](#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release--para-publicar)
- [E13. Criar identidade e persistência de sessões — Após publicação](#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E14. Implementar login GitHub, sessão e logout seguros — Após publicação](#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E15. Aplicar permissões, bloqueio e limites de abuso — Após publicação](#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E16. Entregar curtidas idempotentes e estado privado — Após publicação](#e16-entregar-curtidas-idempotentes-e-estado-privado--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E17. Comentários moderados e denúncias operáveis — Após publicação](#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E18. Registrar views deduplicadas e estatísticas reais — Após publicação](#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E19. Excluir contas, exportar dados e executar retenção — Após publicação](#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E20. Habilitar comunidade com observabilidade e operação completas — Após publicação](#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas--ap%C3%B3s-publica%C3%A7%C3%A3o)
- [E21. Conta local com confirmação e recuperação completas — Evolução futura](#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas--evolu%C3%A7%C3%A3o-futura)
- [E22. Respostas limitadas e progresso explícito de leitura — Evolução futura](#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura--evolu%C3%A7%C3%A3o-futura)
- [E23. Busca por idioma e relacionados editoriais — Evolução futura](#e23-busca-por-idioma-e-relacionados-editoriais--evolu%C3%A7%C3%A3o-futura)
- [E24. Evoluir operação editorial e ativação de releases sob necessidade — Evolução futura](#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade--evolu%C3%A7%C3%A3o-futura)
- [E25. Automatizar atendimento de privacidade quando houver demanda — Evolução futura](#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda--evolu%C3%A7%C3%A3o-futura)
- [E26. Escalar apenas o gargalo medido — Evolução futura](#e26-escalar-apenas-o-gargalo-medido--evolu%C3%A7%C3%A3o-futura)
- [Rastreabilidade de todas as regras](#rastreabilidade-de-todas-as-regras)
<!-- navigation:index:end -->

Data: 09/09/2026. Cada suite é entregue com a etapa correspondente. **Nenhuma funcionalidade é concluída sem seus testes pertinentes.** Os testes abaixo ainda serão implementados; a auditoria atual encontrou npm test quebrado por arquivo ausente, typecheck/build passando e JS sem resolução dos aliases.

<!-- navigation:anchor:start -->
<a id="nav-section-001"></a>
<!-- navigation:anchor:end -->

## Estratégia e infraestrutura comuns

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

- node:test via tsx para TypeScript, Supertest para API; um runner enumera arquivos explicitamente para Windows/Linux e falha se suite esperada estiver vazia. Unitários sem DB; testes reais de constraint jamais mockam PostgreSQL.
- PostgreSQL major16 em Compose isolado com migrations reais. Helpers exigem NODE_ENV=test e database blog_test_* antes de reset. Credenciais separadas de desenvolvimento/produção. Use UUID fixos em fixtures e clock injetado; não inserir dados reais/segredos.
- Fixture editorial comum: A com PT/EN published, B PT published/EN draft, C pai archived, D sem EN; duas séries com posições1/2/3 e lacuna, múltiplas tags, slugs/aliases em conflito; catálogo ampliado de73 traduções e timestamps iguais. Desabilitar seeds de produção.
- Fixture comunidade: A/B ativos, moderator/admin, blocked/deletion_pending, sessões válidas/expiradas/revogadas; comentários em quatro estados; provider GitHub fake local só teste. Simular tempo por função now; nunca depender de sessão de usuário real.
- Concorrência usa duas conexões/processos/barreiras que provam ordem, não sleeps arbitrários. Rollback tem falha injetada entre efeitos; asserts verificam todas as tabelas afetadas. Restaurar somente backups fictícios em DB isolado.
- API valida body/status/headers/no-store/cookie/OpenAPI e ausência de campos privados. Erros devem preservar requestId e não incluir SQL/stack/valores. Smoke de imagem prova JS sem tsx/aliases; smoke frontend prova HTML indexável sem JavaScript.
- Antes de cada commit da etapa: rodar suas suites e lint/typecheck/build pertinentes. PR CI roda unit/API/integração/validação editorial/build; release acrescenta imagem/restore/HTTPS/smoke. Não adiar regressões para gate final.

<!-- navigation:anchor:start -->
<a id="nav-section-002"></a>
<!-- navigation:anchor:end -->

## Matriz de cobertura por implementação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Etapa/fase | Regras | Unitários | Integração/persistência/operação | API |
| --- | --- | --- | --- | --- |
| [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) P0 | [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) | 2 | 2 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) P0 | [R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos), [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo) | 3 | 2 | 2 |
| [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) P0 | [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita) | 1 | 2 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) P0 | [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura) | 3 | 1 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) P0 | [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace) | 1 | 3 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) P0 | [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro) | 3 | 1 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) P0 | [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita) | 2 | 5 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) P0 | [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas) | 2 | 3 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) P0 | [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o) | 2 | 3 | 3 |
| [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) P0 | [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel) | 2 | 2 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) P0 | [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release) | 1 | 2 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) P0 | [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release), [R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos) | 1 | 3 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) P1 | [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas) | 1 | 3 | Sem nova borda HTTP; testar CLI/port conforme etapa |
| [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) P1 | [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas), [R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado) | 2 | 2 | 2 |
| [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) P1 | [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade) | 2 | 2 | 1 |
| [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) P1 | [R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo) | 1 | 2 | 1 |
| [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) P1 | [R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente), [R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria), [R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana) | 3 | 3 | 2 |
| [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) P1 | [R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos) | 2 | 3 | 2 |
| [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) P1 | [R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis) | 2 | 3 | 1 |
| [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) P1 | [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis), [R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana) | 1 | 2 | 1 |
| [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) P2 | [R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo), [R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos) | 2 | 2 | 2 |
| [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) P2 | [R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um), [R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos) | 2 | 2 | 1 |
| [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) P2 | [R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais) | 1 | 2 | 1 |
| [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) P2 | [R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial) | 2 | 2 | 1 |
| [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) P2 | [R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria) | 1 | 2 | 1 |
| [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) P2 | [R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) | 1 | 3 | 1 |

<a id="e01"></a>

## E01. Tornar executáveis os comandos e preservar a base existente — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E01](./BACKEND_IMPLEMENTATION_ORDER.md#01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) · [Implementação E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/eslint.config.mjs`, `backend/scripts/test.mjs`, `backend/src/infrastructures/logger/redact-sensitive.ts`, `backend/src/index.ts`.

**Objetivo:** Entregar um ciclo local e de CI que execute JavaScript compilado e testes reais, sem reconstruir a infraestrutura já corrigida.

**Pré-condições e infraestrutura:** Node e dependências locais; subprocessos em diretório temporário, configuração fictícia; nenhum DB real necessário para regressão de redação.

**Dependências de implementação:** base atual auditada. **Regras:** [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel).

**Entradas do conjunto:** Checkout, lockfile, variáveis injetadas e imagem. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Scripts documentados existem e falham corretamente; testes reais executam; nenhum alias não resolvido no JS; arquivos sensíveis não rastreados; nenhuma reconstrução de funcionalidades já corretas.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E01-U01

**[E01-U01](#e01-u01) — cenário e resultado esperado:** RedactSensitive: objeto/array com token, Authorization, cookie, senha, PEM e URL com code produz [REDACTED]; Date serializa ISO; referência circular termina; dados comuns preservados. Sem mocks, sem conteúdo real de .env.

#### E01-U02

**[E01-U02](#e01-u02) — cenário e resultado esperado:** Runner: diretório sem testes falha em vez de aprovar suite vazia; teste intencionalmente falho em fixture temporária propaga exit code.

### Testes de integração

#### E01-I01

**[E01-I01](#e01-i01) — cenário e resultado esperado:** Subprocesso: npm run build seguido de node no artefato não pode gerar MODULE_NOT_FOUND; configurar banco inacessível controlado e esperar erro de dependência/exit não zero, nunca sucesso de startup.

#### E01-I02

**[E01-I02](#e01-i02) — cenário e resultado esperado:** Instalação npm ci em checkout limpo e lint/typecheck/test:unit/build; validar que arquivos .env.* não entram no contexto e docs não é mais ignorado. Não executar npm audit fix automaticamente.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Runner: diretório sem testes falha em vez de aprovar suite vazia; teste intencionalmente falho em fixture temporária propaga exit code.

### Arquivos e definição de pronto

- `backend/tests/unit/e01-tooling.test.ts` — Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-U de regras e erros de Tornar executáveis os comandos e preservar a base existente.
- `backend/tests/integration/e01-tooling.test.ts` — Cenários [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente)-I das fronteiras reais e persistência/operação de Tornar executáveis os comandos e preservar a base existente.

Unitários: [E01-U01](#e01-u01), [E01-U02](#e01-u02). Integração: [E01-I01](#e01-i01), [E01-I02](#e01-i02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente).

<a id="e02"></a>

## E02. Separar composição, HTTP, configuração e ciclo de vida — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E02](./BACKEND_IMPLEMENTATION_ORDER.md#02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) · [Implementação E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/main.ts`, `backend/src/composition.ts`, `backend/src/config/env.ts`, `backend/src/http/app.ts`, `backend/src/http/health.routes.ts`, `backend/src/http/cors.ts`, `backend/src/http/request-context.ts`, `backend/src/http/request-log.ts`, `backend/src/http/error-handler.ts`, `backend/src/http/error-status.ts`, `backend/src/shared/errors/application.error.ts`, `backend/src/infrastructure/logger.ts`, `backend/src/infrastructure/logging/formatter.ts`, `backend/src/infrastructure/logging/redact-sensitive.ts`, `backend/src/infrastructure/logging/request-context.ts`, `backend/src/infrastructure/logging/logger.interface.ts`, `backend/src/infrastructure/logging/logger.context.ts`, `backend/src/infrastructure/process-handlers.ts`.

**Objetivo:** Evoluir os componentes existentes para a árvore definida, montar app testável sem abrir porta e tornar falhas/encerramento previsíveis.

**Pré-condições e infraestrutura:** Supertest/createApp com health fake para unidade; PostgreSQL16 e subprocesso para lifecycle real, porta efêmera e clock/limites controlados.

**Dependências de implementação:** [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente). **Regras:** [R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos), [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo).

**Entradas do conjunto:** Startup, falha DB, request health, SIGTERM/SIGINT e falha fatal. Headers, path/query/body e exceções de aplicação/infra. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** App é importável sem efeitos globais; nenhuma duplicação da infraestrutura movida; ready muda antes da drenagem; erros/logs obedecem contrato e nenhum segredo aparece.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E02-U01

**[E02-U01](#e02-u01) — cenário e resultado esperado:** Config com PORT NaN/0, ambiente inválido, SYNC=true, URL HTTP em produção ou proxy true falha sem incluir secrets; dev válido normaliza allowlist.

#### E02-U02

**[E02-U02](#e02-u02) — cenário e resultado esperado:** Clock/logger fake: request concorrente mantém correlação própria; header com espaços/Unicode/129 chars é substituído; logs nunca contêm query, cookie ou corpo.

#### E02-U03

**[E02-U03](#e02-u03) — cenário e resultado esperado:** Mapper cobre todos kinds, headersSent chama next uma vez; logger rejeita e cliente ainda recebe envelope.

### Testes de integração

#### E02-I01

**[E02-I01](#e02-i01) — cenário e resultado esperado:** Supertest app isolado: liveness 200 com DB fake indisponível; readiness 503 por timeout/shutdown; erro CORS tem requestId; JSON inválido 400, 16KiB+1 413 e Content-Type inválido 415 em rota fixture de mutação.

#### E02-I02

**[E02-I02](#e02-i02) — cenário e resultado esperado:** Subprocesso com PostgreSQL de teste: sinal SIGTERM drena request em curso e fecha pool; porta ocupada e falha de conexão encerram com 1; erro fatal nunca deixa listener vivo. Testar timer com shutdown que não resolve.

### Testes de API

#### E02-A01

**[E02-A01](#e02-a01) — cenário e resultado esperado:** GET live/ready responde mínimo200/503, sem env; CORS rejeitado possui requestId e403; route fixture JSON inválido400/tamanho413/tipo415.

#### E02-A02

**[E02-A02](#e02-a02) — cenário e resultado esperado:** Endpoint fixture throws ApplicationError→envelope; desconhecido500 sem stack; headersSent não tenta segundo JSON; limite de requestId substitui inválido.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Config com PORT NaN/0, ambiente inválido, SYNC=true, URL HTTP em produção ou proxy true falha sem incluir secrets; dev válido normaliza allowlist.
- Clock/logger fake: request concorrente mantém correlação própria; header com espaços/Unicode/129 chars é substituído; logs nunca contêm query, cookie ou corpo.
- Mapper cobre todos kinds, headersSent chama next uma vez; logger rejeita e cliente ainda recebe envelope.
- Supertest app isolado: liveness 200 com DB fake indisponível; readiness 503 por timeout/shutdown; erro CORS tem requestId; JSON inválido 400, 16KiB+1 413 e Content-Type inválido 415 em rota fixture de mutação.
- Subprocesso com PostgreSQL de teste: sinal SIGTERM drena request em curso e fecha pool; porta ocupada e falha de conexão encerram com 1; erro fatal nunca deixa listener vivo. Testar timer com shutdown que não resolve.
- GET live/ready responde mínimo200/503, sem env; CORS rejeitado possui requestId e403; route fixture JSON inválido400/tamanho413/tipo415.
- Endpoint fixture throws ApplicationError→envelope; desconhecido500 sem stack; headersSent não tenta segundo JSON; limite de requestId substitui inválido.

### Arquivos e definição de pronto

- `backend/tests/unit/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-U de regras e erros de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/integration/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-I das fronteiras reais e persistência/operação de Separar composição, HTTP, configuração e ciclo de vida.
- `backend/tests/api/e02-http-lifecycle.test.ts` — Cenários [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)-A de endpoints/status/DTO/auth de Separar composição, HTTP, configuração e ciclo de vida.

Unitários: [E02-U01](#e02-u01), [E02-U02](#e02-u02), [E02-U03](#e02-u03). Integração: [E02-I01](#e02-i01), [E02-I02](#e02-i02). API: [E02-A01](#e02-a01), [E02-A02](#e02-a02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

<a id="e03"></a>

## E03. Conexão PostgreSQL e executor de migrations — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E03](./BACKEND_IMPLEMENTATION_ORDER.md#03-conex%C3%A3o-postgresql-e-executor-de-migrations) · [Implementação E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/infrastructure/database.ts`, `backend/scripts/migrate.ts`, `backend/migrations/runner.ts`, `backend/tests/support/database.ts`, `backend/tests/support/app.ts`.

**Objetivo:** Preservar a conexão funcional e acrescentar schema versionado, privilégios separados e ambiente real de testes.

**Pré-condições e infraestrutura:** PostgreSQL16 isolado blog_test_migrations, credenciais app/migrator separadas, banco vazio e fixtures de migration deliberadamente falhas.

**Dependências de implementação:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). **Regras:** [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita).

**Entradas do conjunto:** Banco vazio/versão anterior e migrations ordenadas. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Migration idempotente operacionalmente e atômica por versão; app nunca faz DDL; banco de teste real isolado e falha de migration bloqueia startup no Compose futuro.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E03-U01

**[E03-U01](#e03-u01) — cenário e resultado esperado:** Runner com adapter stub: ordem, checksum, falha interrompe próximas migrations; Database fake confirma connect sem sync. Guard de testes recusa nome de produção antes de abrir conexão.

### Testes de integração

#### E03-I01

**[E03-I01](#e03-i01) — cenário e resultado esperado:** PostgreSQL vazio: executar runner duas vezes deixa uma linha por versão; dois migrators concorrentes não aplicam DDL duas vezes; migration fixture com falha deixa schema e controle no estado anterior.

#### E03-I02

**[E03-I02](#e03-i02) — cenário e resultado esperado:** Role de app lê/escreve tabela permitida e falha em CREATE/ALTER; saturação do pool retorna erro limitado e não deixa processo preso.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Executar todos os cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Runner com adapter stub: ordem, checksum, falha interrompe próximas migrations; Database fake confirma connect sem sync. Guard de testes recusa nome de produção antes de abrir conexão.
- PostgreSQL vazio: executar runner duas vezes deixa uma linha por versão; dois migrators concorrentes não aplicam DDL duas vezes; migration fixture com falha deixa schema e controle no estado anterior.
- Role de app lê/escreve tabela permitida e falha em CREATE/ALTER; saturação do pool retorna erro limitado e não deixa processo preso.

### Arquivos e definição de pronto

- `backend/tests/unit/e03-migrations.test.ts` — Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-U de regras e erros de Conexão PostgreSQL e executor de migrations.
- `backend/tests/integration/e03-migrations.test.ts` — Cenários [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations)-I das fronteiras reais e persistência/operação de Conexão PostgreSQL e executor de migrations.

Unitários: [E03-U01](#e03-u01). Integração: [E03-I01](#e03-i01), [E03-I02](#e03-i02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations).

<a id="e04"></a>

## E04. Definir domínio editorial e contratos de aplicação — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E04](./BACKEND_IMPLEMENTATION_ORDER.md#04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) · [Implementação E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/domain/article.ts`, `backend/src/modules/publishing/domain/publication-policy.ts`, `backend/src/modules/publishing/domain/series.ts`, `backend/src/modules/publishing/domain/reading-time.ts`, `backend/src/modules/publishing/application/content.dto.ts`, `backend/src/modules/publishing/application/publishing.errors.ts`, `backend/src/modules/publishing/application/ports/publication-store.ts`, `backend/src/modules/publishing/application/ports/article-reader.ts`, `backend/src/shared/errors/application.error.ts`.

**Objetivo:** Codificar invariantes de identidade, tradução, publicação, séries e leitura antes de persistência e entrada externa.

**Pré-condições e infraestrutura:** Só TypeScript/node:test, clock fixo e reader/store em memória tipados; teste de fronteira via lint. DB é validado nas etapas seguintes.

**Dependências de implementação:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). **Regras:** [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura).

**Entradas do conjunto:** Manifesto com articleId, translationId, sourceLocale e locale. Tradução, operação explícita, expectedRevision e now. seriesId/slug, locale e artigo de contexto opcional. Nível revisado e texto Markdown parseado. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Tipos/ports compilam sem Express, env e Sequelize; invariantes têm casos positivos/negativos; política de estado não depende de SQL e não duplica entidades entre idiomas.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E04-U01

**[E04-U01](#e04-u01) — cenário e resultado esperado:** Matriz de transições: draft completo publica; falta título/corpo ou data futura falha; atualização preserva publishedAt; republicação preserva primeira data; original revisado sinaliza tradução defasada sem ocultá-la. now() fixo.

#### E04-U02

**[E04-U02](#e04-u02) — cenário e resultado esperado:** Série posições 1/3/8, tradução intermediária ausente: count=2 e anterior/próximo usam apenas visíveis; posição 0/duplicada e membro duplicado rejeitados.

#### E04-U03

**[E04-U03](#e04-u03) — cenário e resultado esperado:** Tempo: texto vazio gera mínimo 1 apenas para cálculo (publicação do vazio continua inválida); 200/201 palavras→1/2; fences preservados pelo extrator de [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

### Testes de integração

#### E04-I01

**[E04-I01](#e04-i01) — cenário e resultado esperado:** Contrato em memória de aplicação: fake ArticleReader retorna null sem fallback; dependências de domínio não importam infraestrutura (lint/inspeção AST). Integração PostgreSQL desta regra ocorre em [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) e é requisito dessas etapas.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Matriz de transições: draft completo publica; falta título/corpo ou data futura falha; atualização preserva publishedAt; republicação preserva primeira data; original revisado sinaliza tradução defasada sem ocultá-la. now() fixo.
- Série posições 1/3/8, tradução intermediária ausente: count=2 e anterior/próximo usam apenas visíveis; posição 0/duplicada e membro duplicado rejeitados.
- Tempo: texto vazio gera mínimo 1 apenas para cálculo (publicação do vazio continua inválida); 200/201 palavras→1/2; fences preservados pelo extrator de [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

### Arquivos e definição de pronto

- `backend/tests/unit/e04-publishing-domain.test.ts` — Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-U de regras e erros de Definir domínio editorial e contratos de aplicação.
- `backend/tests/integration/e04-publishing-domain.test.ts` — Cenários [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Definir domínio editorial e contratos de aplicação.

Unitários: [E04-U01](#e04-u01), [E04-U02](#e04-u02), [E04-U03](#e04-u03). Integração: [E04-I01](#e04-i01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o).

<a id="e05"></a>

## E05. Criar schema editorial, constraints e namespace de slugs — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E05](./BACKEND_IMPLEMENTATION_ORDER.md#05-criar-schema-editorial-constraints-e-namespace-de-slugs) · [Implementação E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/001-editorial.ts`, `backend/migrations/002-editorial-paths.ts`, `backend/src/modules/publishing/adapters/postgres/models.ts`, `backend/src/composition.ts`, `backend/src/infrastructure/database.ts`.

**Objetivo:** Persistir o catálogo multilíngue e impedir corridas que validação em memória não resolve.

**Pré-condições e infraestrutura:** PostgreSQL16 vazio e snapshot após migration001; duas conexões dedicadas e barreiras para concorrência, autor/tags/series fixtures.

**Dependências de implementação:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o). **Regras:** [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace).

**Entradas do conjunto:** Manifesto com articleId, translationId, sourceLocale e locale. seriesId/slug, locale e artigo de contexto opcional. translationId, locale, novo slug e revisão esperada. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** DDL vazio e upgrade testados; corrida slug/alias e reordenação protegidas no DB; invariantes do estado persistido equivalem às de domínio; nenhuma tabela comunitária antecipada.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E05-U01

**[E05-U01](#e05-u01) — cenário e resultado esperado:** Validação de shape/model mapping: UUID/string e datas preservados; nenhum id:number do helper legado. Testes de invariantes puros reaproveitam [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o); não mockar unicidade SQL.

### Testes de integração

#### E05-I01

**[E05-I01](#e05-i01) — cenário e resultado esperado:** Banco vazio + 001/002: cadastrar artigo+origem em uma transação passa; artigo sem origem falha no commit; FK autor inexistente e published sem data falham.

#### E05-I02

**[E05-I02](#e05-i02) — cenário e resultado esperado:** Inserções simultâneas de mesmo locale/slug com IDs diferentes: uma vence, outra conflito; alias de A contra slug atual de B também conflita. Mesmo slug em locales diferentes passa.

#### E05-I03

**[E05-I03](#e05-i03) — cenário e resultado esperado:** Trocar posições 1 e 2 na mesma transação passa, duas posições iguais ao commit falham; rollback restaura ordem e caminhos. Migration de 001→002 com catálogo existente preserva UUID/revisões.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Executar todos os cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Banco vazio + 001/002: cadastrar artigo+origem em uma transação passa; artigo sem origem falha no commit; FK autor inexistente e published sem data falham.
- Trocar posições 1 e 2 na mesma transação passa, duas posições iguais ao commit falham; rollback restaura ordem e caminhos. Migration de 001→002 com catálogo existente preserva UUID/revisões.

### Arquivos e definição de pronto

- `backend/tests/unit/e05-editorial-schema.test.ts` — Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-U de regras e erros de Criar schema editorial, constraints e namespace de slugs.
- `backend/tests/integration/e05-editorial-schema.test.ts` — Cenários [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs)-I das fronteiras reais e persistência/operação de Criar schema editorial, constraints e namespace de slugs.

Unitários: [E05-U01](#e05-u01). Integração: [E05-I01](#e05-i01), [E05-I02](#e05-i02), [E05-I03](#e05-i03). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs).

<a id="e06"></a>

## E06. Normalizar os oito textos e validar a fonte editorial — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E06](./BACKEND_IMPLEMENTATION_ORDER.md#06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) · [Implementação E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/adapters/cli/content.schemas.ts`, `backend/src/modules/publishing/adapters/cli/content-parser.ts`, `backend/src/modules/publishing/application/validate-content.ts`, `backend/src/modules/publishing/adapters/cli/validate-content.ts`, `frontend/src/content/articles.ts`.

**Objetivo:** Criar a fonte Git única, manifestos estáveis e validação offline, mantendo o conteúdo aprovado e a identidade dos pares.

**Pré-condições e infraestrutura:** Cópia dos oito textos em diretório temporário, fixtures YAML/AST/links/assets/symlink; validação offline sem DB. Seed fica em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), depois de existir importador.

**Dependências de implementação:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o). **Regras:** [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis), [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro).

**Entradas do conjunto:** Manifesto com articleId, translationId, sourceLocale e locale. Nível revisado e texto Markdown parseado. Edition validada, operador, revisão base e dryRun. Oito arquivos atuais, catálogo, assets e links. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Conteúdo validado sem fallback silencioso, UUID gravados, oito corpos preservados e placeholders excluídos; autoria/datas/licenças revisadas antes de publicar esse lote.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E06-U01

**[E06-U01](#e06-u01) — cenário e resultado esperado:** Parser com os três formatos antigos: migração revisada gera frontmatter canônico sem alterar fences; arquivo normalizado inválido é rejeitado, nunca recebe título TSConfig por fallback.

#### E06-U02

**[E06-U02](#e06-u02) — cenário e resultado esperado:** ValidateContent: locale desconhecido, UUID repetido, tags não mapeadas, título vazio, link interno quebrado, symlink externo, 512KiB+1 e YAML abusivo geram diagnóstico; pares e séries corretos passam.

#### E06-U03

**[E06-U03](#e06-u03) — cenário e resultado esperado:** ReadingTime: AST de código/links/headings não conta sintaxe nem destinos; body não some quando YAML malformado.

### Testes de integração

#### E06-I01

**[E06-I01](#e06-i01) — cenário e resultado esperado:** Fixture dos oito textos: validação sem rede e sem env passa, quatro identidades/oito traduções/duas séries; diff preserva exemplos completos. Rodar CLI em diretório diferente do cwd e comparar resultado.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Parser com os três formatos antigos: migração revisada gera frontmatter canônico sem alterar fences; arquivo normalizado inválido é rejeitado, nunca recebe título TSConfig por fallback.
- ValidateContent: locale desconhecido, UUID repetido, tags não mapeadas, título vazio, link interno quebrado, symlink externo, 512KiB+1 e YAML abusivo geram diagnóstico; pares e séries corretos passam.

### Arquivos e definição de pronto

- `backend/tests/unit/e06-content-validation.test.ts` — Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-U de regras e erros de Normalizar os oito textos e validar a fonte editorial.
- `backend/tests/integration/e06-content-validation.test.ts` — Cenários [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)-I das fronteiras reais e persistência/operação de Normalizar os oito textos e validar a fonte editorial.

Unitários: [E06-U01](#e06-u01), [E06-U02](#e06-u02), [E06-U03](#e06-u03). Integração: [E06-I01](#e06-i01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

<a id="e07"></a>

## E07. Importar, publicar, despublicar e arquivar atomicamente — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E07](./BACKEND_IMPLEMENTATION_ORDER.md#07-importar-publicar-despublicar-e-arquivar-atomicamente) · [Implementação E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/application/import-content.ts`, `backend/src/modules/publishing/application/publish-translation.ts`, `backend/src/modules/publishing/application/unpublish-translation.ts`, `backend/src/modules/publishing/application/archive-article.ts`, `backend/src/modules/publishing/adapters/cli/import-content.ts`, `backend/src/modules/publishing/adapters/postgres/publication-store.ts`, `backend/src/modules/publishing/application/ports/publication-store.ts`, `backend/src/composition.ts`, `backend/seeds/local.ts`.

**Objetivo:** Projetar revisões aprovadas do Git no banco com idempotência, comparação de revisão e retirada explícita de conteúdo.

**Pré-condições e infraestrutura:** PostgreSQL16 com migrations001/002, um draft PT/EN, autor/tags/séries, clock fixo/revisão base; duas conexões/barreiras e injeção de falha dentro da transação.

**Dependências de implementação:** [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial). **Regras:** [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es), [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace), [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita), [R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita).

**Entradas do conjunto:** Tradução, operação explícita, expectedRevision e now. translationId, locale, novo slug e revisão esperada. Edition validada, operador, revisão base e dryRun. Operator {kind,id,sourceRevision}, operação e expectedRevision. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Operações são idempotentes, transacionais e auditáveis; efeitos de retirada explícitos; erro em qualquer item não publica metade da edição; acesso CLI protegido documentado.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E07-U01

**[E07-U01](#e07-u01) — cenário e resultado esperado:** Store fake com revisão conhecida: input inválido não escreve; operador ausente negado; dry-run só lê; primeira publicação e correção usam now fixo/preservam datas; manifesto omitido não gera delete.

#### E07-U02

**[E07-U02](#e07-u02) — cenário e resultado esperado:** Conflito semântico mantém code/kind e não expõe SQL; retorno changed=false não gera novo evento editorial.

### Testes de integração

#### E07-I01

**[E07-I01](#e07-i01) — cenário e resultado esperado:** PostgreSQL com draft PT/EN: importar duas vezes mantém UUID/updatedAt; publicar apenas PT mantém EN privado; remover arquivo do lote não exclui EN; arquivar pai oculta ambos e preserva linhas.

#### E07-I02

**[E07-I02](#e07-i02) — cenário e resultado esperado:** Dois imports da mesma base com conteúdos diferentes: um commit, outro REVISION_CONFLICT; falha após atualizar associações mas antes de tradução faz rollback integral, inclusive revisão/paths.

#### E07-I03

**[E07-I03](#e07-i03) — cenário e resultado esperado:** Alterar slug publicado gera alias, tentativa de usar alias de outro artigo conflita; rollback para texto anterior por nova revisão preserva primeira data e aliases legítimos. Em P1 repetir suite com likes/comentários existentes para provar preservação.

#### E07-I04

**[E07-I04](#e07-i04) — cenário e resultado esperado:** seed:local em DB de teste após [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente): duas execuções mantêm IDs/contagens; em production bloqueia antes de conectar.

#### E07-I05

**[E07-I05](#e07-i05) — cenário e resultado esperado:** Taxonomia já publicada: alteração de slug Tag/Series rejeita TAXONOMY_SLUG_IMMUTABLE e preserva URL; ArchiveTranslation→archived→restore draft→publish preserva primeira data; restore Article lista reexposições e exige intenção explícita. Arquivar/restaurar série nunca arquiva/publica artigos por acidente.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Executar todos os cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Store fake com revisão conhecida: input inválido não escreve; operador ausente negado; dry-run só lê; primeira publicação e correção usam now fixo/preservam datas; manifesto omitido não gera delete.
- Dois imports da mesma base com conteúdos diferentes: um commit, outro REVISION_CONFLICT; falha após atualizar associações mas antes de tradução faz rollback integral, inclusive revisão/paths.
- Alterar slug publicado gera alias, tentativa de usar alias de outro artigo conflita; rollback para texto anterior por nova revisão preserva primeira data e aliases legítimos. Em P1 repetir suite com likes/comentários existentes para provar preservação.
- Taxonomia já publicada: alteração de slug Tag/Series rejeita TAXONOMY_SLUG_IMMUTABLE e preserva URL; ArchiveTranslation→archived→restore draft→publish preserva primeira data; restore Article lista reexposições e exige intenção explícita. Arquivar/restaurar série nunca arquiva/publica artigos por acidente.

### Arquivos e definição de pronto

- `backend/tests/unit/e07-editorial-import.test.ts` — Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-U de regras e erros de Importar, publicar, despublicar e arquivar atomicamente.
- `backend/tests/integration/e07-editorial-import.test.ts` — Cenários [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)-I das fronteiras reais e persistência/operação de Importar, publicar, despublicar e arquivar atomicamente.

Unitários: [E07-U01](#e07-u01), [E07-U02](#e07-u02). Integração: [E07-I01](#e07-i01), [E07-I02](#e07-i02), [E07-I03](#e07-i03), [E07-I04](#e07-i04), [E07-I05](#e07-i05). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

<a id="e08"></a>

## E08. Consultar artigos, tags e séries publicados — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E08](./BACKEND_IMPLEMENTATION_ORDER.md#08-consultar-artigos-tags-e-s%C3%A9ries-publicados) · [Implementação E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/application/get-article.ts`, `backend/src/modules/publishing/application/list-articles.ts`, `backend/src/modules/publishing/application/list-tags.ts`, `backend/src/modules/publishing/application/list-series.ts`, `backend/src/modules/publishing/application/get-series.ts`, `backend/src/modules/publishing/adapters/postgres/article-reader.ts`, `backend/src/modules/publishing/application/content.dto.ts`, `backend/src/modules/publishing/application/ports/article-reader.ts`.

**Objetivo:** Disponibilizar projeções públicas completas e consistentes sem exposição de rascunhos ou N+1.

**Pré-condições e infraestrutura:** PostgreSQL16 com artigos published/draft/archived, locale ausente, timestamps iguais, tags/séries N:N, 73 traduções e spy de query somente em teste.

**Dependências de implementação:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente). **Regras:** [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas).

**Entradas do conjunto:** seriesId/slug, locale e artigo de contexto opcional. Locale e slug/filtros/ID referenciado em interação. locale,page,limit,sort,tag,series,difficulty,q. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Todos caminhos públicos usam o mesmo predicado de visibilidade; contagem/navegação correspondem à lista; filtros e ordem determinísticos; nada de email, ORM ou Markdown em cards.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E08-U01

**[E08-U01](#e08-u01) — cenário e resultado esperado:** Reader stub: null→not-found; redirect contém alvo canônico; não substitui EN ausente por PT; filtro inválido falha antes do reader.

#### E08-U02

**[E08-U02](#e08-u02) — cenário e resultado esperado:** Série com posições 1/2/3 e item 2 draft: anterior/próximo ligam 1 e 3; count=2; contexto estranho dá 422; empty publicado devolve count=0.

### Testes de integração

#### E08-I01

**[E08-I01](#e08-i01) — cenário e resultado esperado:** Fixture DB com PT publicado, EN draft, pai arquivado, duas tags e duas séries: lista/detalhe/tags/séries/alternates filtram todos estados de forma igual.

#### E08-I02

**[E08-I02](#e08-i02) — cenário e resultado esperado:** Mais de 50 artigos com timestamps iguais: páginas sem repetição em snapshot estável; asc/desc determinísticos; q com aspas/%/_ não injeta nem vira wildcard; count não duplica artigo com múltiplas tags.

#### E08-I03

**[E08-I03](#e08-i03) — cenário e resultado esperado:** Medição de queries para 1 e 50 itens confirma quantidade limitada; coluna bodyMarkdown não é selecionada nas listas.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Executar todos os cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Reader stub: null→not-found; redirect contém alvo canônico; não substitui EN ausente por PT; filtro inválido falha antes do reader.
- Mais de 50 artigos com timestamps iguais: páginas sem repetição em snapshot estável; asc/desc determinísticos; q com aspas/%/_ não injeta nem vira wildcard; count não duplica artigo com múltiplas tags.

### Arquivos e definição de pronto

- `backend/tests/unit/e08-public-queries.test.ts` — Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-U de regras e erros de Consultar artigos, tags e séries publicados.
- `backend/tests/integration/e08-public-queries.test.ts` — Cenários [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)-I das fronteiras reais e persistência/operação de Consultar artigos, tags e séries publicados.

Unitários: [E08-U01](#e08-u01), [E08-U02](#e08-u02). Integração: [E08-I01](#e08-i01), [E08-I02](#e08-i02), [E08-I03](#e08-i03). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados).

<a id="e09"></a>

## E09. Expor API REST documentada e cache HTTP simples — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E09](./BACKEND_IMPLEMENTATION_ORDER.md#09-expor-api-rest-documentada-e-cache-http-simples) · [Implementação E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/adapters/http/articles.routes.ts`, `backend/src/modules/publishing/adapters/http/taxonomy.routes.ts`, `backend/src/modules/publishing/adapters/http/article.schemas.ts`, `backend/src/http/public-cache.ts`, `backend/src/http/app.ts`, `backend/src/composition.ts`.

**Objetivo:** Conectar consultas públicas à API v1 com schemas, DTOs, cache correto e contrato verificável pelo frontend.

**Pré-condições e infraestrutura:** Composição real+Supertest e PostgreSQL16 da fixture [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados); documento OpenAPI versionado e agente sem sessão; cache headers inspecionados.

**Dependências de implementação:** [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida). **Regras:** [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo), [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso), [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o).

**Entradas do conjunto:** Headers, path/query/body e exceções de aplicação/infra. Locale e slug/filtros/ID referenciado em interação. locale,page,limit,sort,tag,series,difficulty,q. DTO publicado, domínio configurado, revisão e headers condicionais. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** OpenAPI e respostas reais concordam; locale/visibilidade/limites são uniformes; leitura não exige sessão; cache nunca contém identidade do visitante.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E09-U01

**[E09-U01](#e09-u01) — cenário e resultado esperado:** Schemas: page=0/NaN, limit=51, sort=popular, locale=en-US, arrays e traversal→400; defaults corretos; canonical pt-br permitido.

#### E09-U02

**[E09-U02](#e09-u02) — cenário e resultado esperado:** ETag: mesma representação idêntica; locale/página/revisão diferente invalida; If-None-Match vence data; safe bigint converte, overflow rejeita.

### Testes de integração

#### E09-I01

**[E09-I01](#e09-i01) — cenário e resultado esperado:** Supertest com DB: cada endpoint 200/404/400 compatível com OpenAPI, sem body em resumos/dados internos; rota estática by-slug não capturada como ID.

#### E09-I02

**[E09-I02](#e09-i02) — cenário e resultado esperado:** API cache: ETag→304, publicação→ETag novo, archive→404/no-store; nenhuma resposta editorial contém Set-Cookie. API de slug antigo→308 interno; alias do draft→404.

#### E09-I03

**[E09-I03](#e09-i03) — cenário e resultado esperado:** Payload JSON inválido/grande em fixture de [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) e query abusiva nas rotas reais mantêm envelope; timeout DB retorna 503 seguro; rate limit de edge é validado em [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

### Testes de API

#### E09-A01

**[E09-A01](#e09-a01) — cenário e resultado esperado:** GET articles/by-slug PT e EN publicados200; EN draft404; locale desconhecido400; slug histórico308 apenas se alvo público; API sem autenticação.

#### E09-A02

**[E09-A02](#e09-a02) — cenário e resultado esperado:** GET lista page1/20,max50 e filtros AND; zero resultados com totalPages0; limit51/sort popular/query objeto400; DTO sem body/PII.

#### E09-A03

**[E09-A03](#e09-a03) — cenário e resultado esperado:** GET tags/series só publicados e navegação por visíveis; mesma resposta validada por OpenAPI. Conditional GET304, mudança editorial invalida; erro no-store.

### Testes de persistência

Executar todos os cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- ETag: mesma representação idêntica; locale/página/revisão diferente invalida; If-None-Match vence data; safe bigint converte, overflow rejeita.
- Supertest com DB: cada endpoint 200/404/400 compatível com OpenAPI, sem body em resumos/dados internos; rota estática by-slug não capturada como ID.
- API cache: ETag→304, publicação→ETag novo, archive→404/no-store; nenhuma resposta editorial contém Set-Cookie. API de slug antigo→308 interno; alias do draft→404.
- Payload JSON inválido/grande em fixture de [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) e query abusiva nas rotas reais mantêm envelope; timeout DB retorna 503 seguro; rate limit de edge é validado em [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).
- GET articles/by-slug PT e EN publicados200; EN draft404; locale desconhecido400; slug histórico308 apenas se alvo público; API sem autenticação.

### Arquivos e definição de pronto

- `backend/tests/unit/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-U de regras e erros de Expor API REST documentada e cache HTTP simples.
- `backend/tests/integration/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-I das fronteiras reais e persistência/operação de Expor API REST documentada e cache HTTP simples.
- `backend/tests/api/e09-public-api.test.ts` — Cenários [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples)-A de endpoints/status/DTO/auth de Expor API REST documentada e cache HTTP simples.

Unitários: [E09-U01](#e09-u01), [E09-U02](#e09-u02). Integração: [E09-I01](#e09-i01), [E09-I02](#e09-i02), [E09-I03](#e09-i03). API: [E09-A01](#e09-a01), [E09-A02](#e09-a02), [E09-A03](#e09-a03). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

<a id="e10"></a>

## E10. Exportar snapshot e integrar publicação com o site — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E10](./BACKEND_IMPLEMENTATION_ORDER.md#10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) · [Implementação E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/application/export-snapshot.ts`, `backend/src/modules/publishing/adapters/cli/export-snapshot.ts`, `backend/src/modules/publishing/adapters/postgres/article-reader.ts`, `backend/src/modules/publishing/application/content.dto.ts`, `frontend/src/content/snapshot.ts`, `frontend/src/content/articles.ts`, `frontend/scripts/prerender.tsx`, `frontend/src/App.tsx`, `frontend/src/features/articles/components/article-detail/MarkdownArticle.tsx`, `frontend/tests/publication.test.ts`.

**Objetivo:** Entregar um artefato público completo e consistente que alimente renderização React, URLs e sitemap.

**Pré-condições e infraestrutura:** PostgreSQL16 com73 traduções/revisão fixa, import concorrente; diretório temporário de snapshot, build React e servidor estático local sem JavaScript.

**Dependências de implementação:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples). **Regras:** [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro), [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel).

**Entradas do conjunto:** Oito arquivos atuais, catálogo, assets e links. DTO publicado, domínio configurado, revisão e headers condicionais. Revisão importada, transação read-only e build estático. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Um único snapshot alimenta páginas/metadados/sitemap; release PT/EN renderizado e smoke comprovados; integração é gate P0 mesmo que executada pelo responsável frontend.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E10-U01

**[E10-U01](#e10-u01) — cenário e resultado esperado:** Catálogo: canonical deriva origem autorizada, hreflang apenas publicado/recíproco, og locale pt_BR, tracking não entra, lastmod não muda por export.

#### E10-U02

**[E10-U02](#e10-u02) — cenário e resultado esperado:** Serialização de título com </script> não injeta JSON-LD/HTML; imagem local exige alt; renderer preserva código e links aprovados.

### Testes de integração

#### E10-I01

**[E10-I01](#e10-i01) — cenário e resultado esperado:** DB com 73 traduções e import concorrente: snapshot contém todas de uma única revisão, zero draft; export falho não substitui arquivo bom.

#### E10-I02

**[E10-I02](#e10-i02) — cenário e resultado esperado:** Build estático com snapshot real: sem JavaScript, corpo completo presente, PT↔EN por slugs reais, sitemap corresponde a URLs 200; fail build mantém artefato anterior e produz alerta de revisão divergente.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- DB com 73 traduções e import concorrente: snapshot contém todas de uma única revisão, zero draft; export falho não substitui arquivo bom.

### Arquivos e definição de pronto

- `backend/tests/unit/e10-publication-snapshot.test.ts` — Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-U de regras e erros de Exportar snapshot e integrar publicação com o site.
- `backend/tests/integration/e10-publication-snapshot.test.ts` — Cenários [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site)-I das fronteiras reais e persistência/operação de Exportar snapshot e integrar publicação com o site.

Unitários: [E10-U01](#e10-u01), [E10-U02](#e10-u02). Integração: [E10-I01](#e10-i01), [E10-I02](#e10-i02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

<a id="e11"></a>

## E11. Entregar imagens e Compose reproduzíveis — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E11](./BACKEND_IMPLEMENTATION_ORDER.md#11-entregar-imagens-e-compose-reproduz%C3%ADveis) · [Implementação E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/scripts/smoke-image.mjs`.

**Objetivo:** Completar setup da arquitetura com migrate obrigatório e JS compilado em produção, reaproveitando a simplificação existente.

**Pré-condições e infraestrutura:** Docker engine/Compose, nomes de projeto/volumes exclusivos de teste, imagem build/migrator/runtime e nenhuma credencial externa; nunca reutilizar volume de desenvolvimento para destruir fixture.

**Dependências de implementação:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site). **Regras:** [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release).

**Entradas do conjunto:** Checkout, lockfile, variáveis injetadas e imagem. Banco vazio/versão anterior e migrations ordenadas. Imagem, ambiente real, backup e procedimentos de release/restore. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Setup canônico funciona de ponta a ponta; runtime sem Docker interno e dependências sem uso; migrator precede API; imagem pronta para deploy sem secrets embutidos.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E11-U01

**[E11-U01](#e11-u01) — cenário e resultado esperado:** Configuração: parser de ambiente recusa profile fake/seed local em produção; nomes dos scripts usados nos Dockerfiles/Compose existem no package. Não escrever teste para cada linha YAML; validar comportamento no smoke.

### Testes de integração

#### E11-I01

**[E11-I01](#e11-i01) — cenário e resultado esperado:** Checkout limpo, volume novo isolado de teste: docker compose up --build entrega oito traduções sem credenciais externas; segunda subida preserva IDs/dados; DB lento espera health; migration inválida mantém API parada.

#### E11-I02

**[E11-I02](#e11-i02) — cenário e resultado esperado:** Imagem final executa como não root com devDependencies ausentes; nenhum env/secret/log local em layers/conteúdo; API atende compilada sem tsx/aliases. Reinício e shutdown preservam dados e encerram no prazo.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Checkout limpo, volume novo isolado de teste: docker compose up --build entrega oito traduções sem credenciais externas; segunda subida preserva IDs/dados; DB lento espera health; migration inválida mantém API parada.
- Imagem final executa como não root com devDependencies ausentes; nenhum env/secret/log local em layers/conteúdo; API atende compilada sem tsx/aliases. Reinício e shutdown preservam dados e encerram no prazo.

### Arquivos e definição de pronto

- `backend/tests/unit/e11-containers.test.ts` — Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-U de regras e erros de Entregar imagens e Compose reproduzíveis.
- `backend/tests/integration/e11-containers.test.ts` — Cenários [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis)-I das fronteiras reais e persistência/operação de Entregar imagens e Compose reproduzíveis.

Unitários: [E11-U01](#e11-u01). Integração: [E11-I01](#e11-i01), [E11-I02](#e11-i02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).

<a id="e12"></a>

## E12. Automatizar validação e fechar operação do primeiro release — Para publicar

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E12](./BACKEND_IMPLEMENTATION_ORDER.md#12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) · [Implementação E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/scripts/backup.mjs`, `backend/scripts/restore.mjs`, `backend/scripts/release-smoke.mjs`.

**Objetivo:** Garantir que P0 possa ser publicado, observado e recuperado, com evidências objetivas e responsabilidades operacionais.

**Pré-condições e infraestrutura:** CI isolado e staging configurado, DB/backup cifrado de fixture em destino de teste; proxy HTTPS e canal de alerta de teste; restore nunca aponta produção.

**Dependências de implementação:** [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis). **Regras:** [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel), [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel), [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release), [R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos).

**Entradas do conjunto:** Checkout, lockfile, variáveis injetadas e imagem. Revisão importada, transação read-only e build estático. Imagem, ambiente real, backup e procedimentos de release/restore. Licenças existentes, autores/terceiros e decisões do titular. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** M1/P0 pronto apenas com CI, imagem, HTML PT/EN, backup restaurado e alertas exercitados; mantenedor preenche e aceita domínio/host/licenças/contatos/RPO/RTO. Nenhum requisito comunitário é antecipado.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E12-U01

**[E12-U01](#e12-u01) — cenário e resultado esperado:** Release smoke com manifestos de revisão iguais/diferentes falha apenas na divergência; guard restore impede destino acidental; scrub logs não registra segredo de comando.

### Testes de integração

#### E12-I01

**[E12-I01](#e12-i01) — cenário e resultado esperado:** Pipeline PR de fork com variáveis vazias executa testes sem produção; migration falha aborta deploy; import ok/build falho mantém site anterior e registra divergência; retry conclui sem nova edição.

#### E12-I02

**[E12-I02](#e12-i02) — cenário e resultado esperado:** Restore real de backup em DB isolado recupera IDs/contagens/revisão e passa smoke; medir RPO/RTO e falha de upload dispara alerta de teste.

#### E12-I03

**[E12-I03](#e12-i03) — cenário e resultado esperado:** HTTPS público de staging: headers, rate limit, X-Forwarded-For forjado, 404 sem SPA fallback, retirada urgente do cache e oito artigos renderizados. Verificar licença/contatos/decisões preenchidos no gate manual.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Leitura é pública; não exigir login em testes editoriais. Escrita existe somente na CLI/job protegido; validar origem operacional/sem endpoint admin em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente)/[E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). Testes de entrada inválida não devem conseguir publicar pelo HTTP.

### Erros e casos limites

- Release smoke com manifestos de revisão iguais/diferentes falha apenas na divergência; guard restore impede destino acidental; scrub logs não registra segredo de comando.
- Pipeline PR de fork com variáveis vazias executa testes sem produção; migration falha aborta deploy; import ok/build falho mantém site anterior e registra divergência; retry conclui sem nova edição.
- Restore real de backup em DB isolado recupera IDs/contagens/revisão e passa smoke; medir RPO/RTO e falha de upload dispara alerta de teste.
- HTTPS público de staging: headers, rate limit, X-Forwarded-For forjado, 404 sem SPA fallback, retirada urgente do cache e oito artigos renderizados. Verificar licença/contatos/decisões preenchidos no gate manual.

### Arquivos e definição de pronto

- `backend/tests/unit/e12-release-operations.test.ts` — Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-U de regras e erros de Automatizar validação e fechar operação do primeiro release.
- `backend/tests/integration/e12-release-operations.test.ts` — Cenários [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release)-I das fronteiras reais e persistência/operação de Automatizar validação e fechar operação do primeiro release.

Unitários: [E12-U01](#e12-u01). Integração: [E12-I01](#e12-i01), [E12-I02](#e12-i02), [E12-I03](#e12-i03). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

<a id="e13"></a>

## E13. Criar identidade e persistência de sessões — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E13](./BACKEND_IMPLEMENTATION_ORDER.md#13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) · [Implementação E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/003-identity.ts`, `backend/src/modules/identity/domain/user.ts`, `backend/src/modules/identity/domain/session-policy.ts`, `backend/src/modules/identity/application/identity.dto.ts`, `backend/src/modules/identity/application/ports/identity-store.ts`, `backend/src/modules/identity/application/ports/session-store.ts`, `backend/src/modules/identity/application/ports/oauth-transaction-store.ts`, `backend/src/modules/identity/adapters/postgres/identity-store.ts`, `backend/src/modules/identity/adapters/postgres/session-store.ts`, `backend/src/modules/identity/adapters/postgres/oauth-transaction-store.ts`, `backend/src/config/env.ts`.

**Objetivo:** Adicionar contas GitHub independentes da autoria e sessões revogáveis no PostgreSQL, sem mudar UUID editoriais.

**Pré-condições e infraestrutura:** PostgreSQL16 com catálogo P0 e migration003, dois users/identidades fakes, clock fixo, secrets temporários exclusivos de teste.

**Dependências de implementação:** [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release). **Regras:** [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas).

**Entradas do conjunto:** Provider, providerUserId, perfil mínimo verificado. Token, now, Session e User atuais. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Schema P1 migra sobre catálogo P0 sem mudar IDs; sessão tem validação server-side e operação concorrente testada; flags deixam leitura pública funcionando sem OAuth.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E13-U01

**[E13-U01](#e13-u01) — cenário e resultado esperado:** Clock fixo: limite exato de 7d/24h ou admin 8h/30min expira; revoke e blocked negam; touch não estende absoluto; email nulo não invalida GitHub.

### Testes de integração

#### E13-I01

**[E13-I01](#e13-i01) — cenário e resultado esperado:** Duas resoluções simultâneas de mesmo provider/id criam uma conta, sem órfão; renomear login preserva userId; dois providers/IDs com email igual não vinculam.

#### E13-I02

**[E13-I02](#e13-i02) — cenário e resultado esperado:** Tokens diferentes geram hashes diferentes; busca usa índice; duas instâncias compartilham sessão e revogação imediata; consume OAuth concorrente permite uma vez; dump DB não contém token de sessão ou verifier legível.

#### E13-I03

**[E13-I03](#e13-i03) — cenário e resultado esperado:** Status/role/deletion_pending concorrem com resolve/touch: usuário inelegível nunca obtém sessão nova após commit; prefixo __Host e token não aparecem em projeção pública ou log.

### Testes de API

Esta etapa não cria nova API HTTP. Validar entrada/saída/exit code da CLI ou contrato da port nos cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I; exposição HTTP só na etapa consumidora. Não criar endpoint só para teste.

### Testes de persistência

Executar todos os cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Clock fixo: limite exato de 7d/24h ou admin 8h/30min expira; revoke e blocked negam; touch não estende absoluto; email nulo não invalida GitHub.
- Tokens diferentes geram hashes diferentes; busca usa índice; duas instâncias compartilham sessão e revogação imediata; consume OAuth concorrente permite uma vez; dump DB não contém token de sessão ou verifier legível.
- Status/role/deletion_pending concorrem com resolve/touch: usuário inelegível nunca obtém sessão nova após commit; prefixo __Host e token não aparecem em projeção pública ou log.

### Arquivos e definição de pronto

- `backend/tests/unit/e13-identity-storage.test.ts` — Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-U de regras e erros de Criar identidade e persistência de sessões.
- `backend/tests/integration/e13-identity-storage.test.ts` — Cenários [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)-I das fronteiras reais e persistência/operação de Criar identidade e persistência de sessões.

Unitários: [E13-U01](#e13-u01). Integração: [E13-I01](#e13-i01), [E13-I02](#e13-i02), [E13-I03](#e13-i03). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).

<a id="e14"></a>

## E14. Implementar login GitHub, sessão e logout seguros — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E14](./BACKEND_IMPLEMENTATION_ORDER.md#14-implementar-login-github-sess%C3%A3o-e-logout-seguros) · [Implementação E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/identity/application/ports/oauth-identity-provider.ts`, `backend/src/modules/identity/adapters/github/oauth-provider.ts`, `backend/src/modules/identity/application/github-login.ts`, `backend/src/modules/identity/application/get-me.ts`, `backend/src/modules/identity/application/logout.ts`, `backend/src/modules/identity/adapters/http/auth.routes.ts`, `backend/src/http/session.ts`, `backend/src/http/csrf.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`.

**Objetivo:** Entregar authorization code com state/PKCE, sessão própria e proteções do navegador.

**Pré-condições e infraestrutura:** Provider GitHub fake local via HTTP stub com limites/timeout e DB real; agentes browser A/B com cookies independentes; sem conta GitHub real em CI.

**Dependências de implementação:** [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es). **Regras:** [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email), [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas), [R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado).

**Entradas do conjunto:** Provider, providerUserId, perfil mínimo verificado. Token, now, Session e User atuais. code/state/binding, sessão, Origin, Content-Type e X-CSRF-Token. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Login/expiração/logout/CSRF funcionam sem GitHub real no CI; identidade estável e mínima; callback de replay e cross-browser bloqueados.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E14-U01

**[E14-U01](#e14-u01) — cenário e resultado esperado:** Provider/store fakes: state ausente/inválido/reusado/expirado ou binding de outro browser não chama provider; callback rejeitado limpa transiente; returnPath externo rejeitado.

#### E14-U02

**[E14-U02](#e14-u02) — cenário e resultado esperado:** Cookie flags por ambiente, session fixation gera token novo, CSRF de outra sessão falha, Origin inválida e content-type indevido falham antes do caso de uso.

### Testes de integração

#### E14-I01

**[E14-I01](#e14-i01) — cenário e resultado esperado:** Fake provider em servidor HTTP isolado + DB: login→cookie→me→csrf→logout; após logout me 401; duas requisições callback só uma cria sessão; provider timeout 503 e nenhum token nos logs.

#### E14-I02

**[E14-I02](#e14-i02) — cenário e resultado esperado:** Supertest agents A/B: token CSRF de A não modifica B; bloqueado não loga; role atual do DB prevalece; público não tem Set-Cookie; todos endpoints privados no-store; fake auth recusado com production config.

### Testes de API

#### E14-A01

**[E14-A01](#e14-a01) — cenário e resultado esperado:** GET auth/github emite transiente/redirect fixo; callback válido302+novo cookie, inválido400 seguro sem provider, indisponível503; me401/200 e logout204 apenas com sessão/Origin/CSRF.

#### E14-A02

**[E14-A02](#e14-a02) — cenário e resultado esperado:** Me/auth/csrf no-store; cookie prod tem todos flags; request privado de A com CSRF B403; callback replay/binding estranho não cria sessão.

### Testes de persistência

Executar todos os cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Provider/store fakes: state ausente/inválido/reusado/expirado ou binding de outro browser não chama provider; callback rejeitado limpa transiente; returnPath externo rejeitado.
- Cookie flags por ambiente, session fixation gera token novo, CSRF de outra sessão falha, Origin inválida e content-type indevido falham antes do caso de uso.
- Fake provider em servidor HTTP isolado + DB: login→cookie→me→csrf→logout; após logout me 401; duas requisições callback só uma cria sessão; provider timeout 503 e nenhum token nos logs.
- Supertest agents A/B: token CSRF de A não modifica B; bloqueado não loga; role atual do DB prevalece; público não tem Set-Cookie; todos endpoints privados no-store; fake auth recusado com production config.
- GET auth/github emite transiente/redirect fixo; callback válido302+novo cookie, inválido400 seguro sem provider, indisponível503; me401/200 e logout204 apenas com sessão/Origin/CSRF.
- Me/auth/csrf no-store; cookie prod tem todos flags; request privado de A com CSRF B403; callback replay/binding estranho não cria sessão.

### Arquivos e definição de pronto

- `backend/tests/unit/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-U de regras e erros de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/integration/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-I das fronteiras reais e persistência/operação de Implementar login GitHub, sessão e logout seguros.
- `backend/tests/api/e14-github-auth.test.ts` — Cenários [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros)-A de endpoints/status/DTO/auth de Implementar login GitHub, sessão e logout seguros.

Unitários: [E14-U01](#e14-u01), [E14-U02](#e14-u02). Integração: [E14-I01](#e14-i01), [E14-I02](#e14-i02). API: [E14-A01](#e14-a01), [E14-A02](#e14-a02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

<a id="e15"></a>

## E15. Aplicar permissões, bloqueio e limites de abuso — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E15](./BACKEND_IMPLEMENTATION_ORDER.md#15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) · [Implementação E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/identity/domain/authorization.ts`, `backend/src/modules/identity/application/manage-user.ts`, `backend/src/modules/identity/adapters/cli/manage-user.ts`, `backend/src/modules/identity/adapters/postgres/identity-store.ts`, `backend/migrations/004-security-controls.ts`, `backend/src/http/rate-limit.ts`, `backend/src/infrastructure/rate-limiter.ts`, `backend/src/composition.ts`, `backend/src/config/env.ts`.

**Objetivo:** Definir proteção reutilizável para cada capacidade comunitária e operações administrativas protegidas.

**Pré-condições e infraestrutura:** Users user/moderator/admin/blocked/deletion_pending; duas sessões por usuário e duas instâncias com mesmo PostgreSQL; origem/HMAC/clock fictícios.

**Dependências de implementação:** [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros). **Regras:** [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade).

**Entradas do conjunto:** Actor atual, ação e recurso/owner. Ação, actor/origem pseudonimizada e clock. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Cada ação tem política verificável; bloqueio/roles são imediatos; não há elevação por payload/email; limites são compartilhados e testados em concorrência.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E15-U01

**[E15-U01](#e15-u01) — cenário e resultado esperado:** Matriz roles×ações×ownership: visitante negado, user só próprio, moderator não edita texto alheio/não bloqueia user, admin último protegido; AuthorProfile sem conta não autoriza.

#### E15-U02

**[E15-U02](#e15-u02) — cenário e resultado esperado:** Clock fake no limite 3/min, 20/h e virada de janela: request limítrofe aceito, seguinte 429 com Retry-After correto; falha store→503.

### Testes de integração

#### E15-I01

**[E15-I01](#e15-i01) — cenário e resultado esperado:** Duas instâncias/20 requests concorrentes respeitam teto compartilhado; bloquear user concorre com mutação e impede novas escritas após commit do bloqueio; todas sessões deixam de resolver.

#### E15-I02

**[E15-I02](#e15-i02) — cenário e resultado esperado:** CLI por actor não admin falha; bootstrap explícito auditado; role update revoga sessão antiga e exige login novo; exclusão futura usa mesma disciplina de locks sem deadlock.

### Testes de API

#### E15-A01

**[E15-A01](#e15-a01) — cenário e resultado esperado:** Rotas fixture protegidas por user/moderator/admin: role injetada em payload rejeitada, proprietário errado403; limites concorrentes429+Retry-After, falha limiter503.

### Testes de persistência

Executar todos os cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Clock fake no limite 3/min, 20/h e virada de janela: request limítrofe aceito, seguinte 429 com Retry-After correto; falha store→503.
- Duas instâncias/20 requests concorrentes respeitam teto compartilhado; bloquear user concorre com mutação e impede novas escritas após commit do bloqueio; todas sessões deixam de resolver.
- CLI por actor não admin falha; bootstrap explícito auditado; role update revoga sessão antiga e exige login novo; exclusão futura usa mesma disciplina de locks sem deadlock.
- Rotas fixture protegidas por user/moderator/admin: role injetada em payload rejeitada, proprietário errado403; limites concorrentes429+Retry-After, falha limiter503.

### Arquivos e definição de pronto

- `backend/tests/unit/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-U de regras e erros de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/integration/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-I das fronteiras reais e persistência/operação de Aplicar permissões, bloqueio e limites de abuso.
- `backend/tests/api/e15-authorization-abuse.test.ts` — Cenários [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso)-A de endpoints/status/DTO/auth de Aplicar permissões, bloqueio e limites de abuso.

Unitários: [E15-U01](#e15-u01), [E15-U02](#e15-u02). Integração: [E15-I01](#e15-i01), [E15-I02](#e15-i02). API: [E15-A01](#e15-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

<a id="e16"></a>

## E16. Entregar curtidas idempotentes e estado privado — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E16](./BACKEND_IMPLEMENTATION_ORDER.md#16-entregar-curtidas-idempotentes-e-estado-privado) · [Implementação E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/005-likes.ts`, `backend/src/modules/community/application/ports/like-store.ts`, `backend/src/modules/community/application/set-like.ts`, `backend/src/modules/community/application/get-my-likes.ts`, `backend/src/modules/community/adapters/postgres/like-store.ts`, `backend/src/modules/community/adapters/http/likes.routes.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`.

**Objetivo:** Permitir uma curtida por conta/artigo, compartilhada entre traduções, e leituras públicas/privadas separadas.

**Pré-condições e infraestrutura:** Dois usuários ativos, um bloqueado, artigo PT/EN público e outro arquivado; duas instâncias/50 requests concorrentes e DB real.

**Dependências de implementação:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso). **Regras:** [R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo).

**Entradas do conjunto:** articleId público e Actor da sessão. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Likes são idempotentes entre instâncias e idiomas; estado privado não entra em cache público; imports preservam associações.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E16-U01

**[E16-U01](#e16-u01) — cenário e resultado esperado:** Stub LikeStore: usuário do input não pode sobrescrever actor; estado público requerido; PUT repetido mantém intenção e DELETE repetido mantém ausência.

### Testes de integração

#### E16-I01

**[E16-I01](#e16-i01) — cenário e resultado esperado:** 50 PUT concorrentes do mesmo usuário→uma linha; dois usuários→duas; 50 DELETE→zero apenas do ator; falha/rollback não corrompe outro like.

#### E16-I02

**[E16-I02](#e16-i02) — cenário e resultado esperado:** PT e EN compartilham articleId e uma curtida; import e slug change preservam; privado A não retorna estado de B; CSRF/blocked negam sem escrita.

### Testes de API

#### E16-A01

**[E16-A01](#e16-a01) — cenário e resultado esperado:** PUT/DELETE like autenticados204 idempotentes, anônimo401/blocked403/draft404/CSRF inválido403; GET me/article-likes no-store e só usuário atual.

### Testes de persistência

Executar todos os cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- 50 PUT concorrentes do mesmo usuário→uma linha; dois usuários→duas; 50 DELETE→zero apenas do ator; falha/rollback não corrompe outro like.
- PT e EN compartilham articleId e uma curtida; import e slug change preservam; privado A não retorna estado de B; CSRF/blocked negam sem escrita.
- PUT/DELETE like autenticados204 idempotentes, anônimo401/blocked403/draft404/CSRF inválido403; GET me/article-likes no-store e só usuário atual.

### Arquivos e definição de pronto

- `backend/tests/unit/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-U de regras e erros de Entregar curtidas idempotentes e estado privado.
- `backend/tests/integration/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-I das fronteiras reais e persistência/operação de Entregar curtidas idempotentes e estado privado.
- `backend/tests/api/e16-likes.test.ts` — Cenários [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)-A de endpoints/status/DTO/auth de Entregar curtidas idempotentes e estado privado.

Unitários: [E16-U01](#e16-u01). Integração: [E16-I01](#e16-i01), [E16-I02](#e16-i02). API: [E16-A01](#e16-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado).

<a id="e17"></a>

## E17. Comentários moderados e denúncias operáveis — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E17](./BACKEND_IMPLEMENTATION_ORDER.md#17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) · [Implementação E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/006-comments.ts`, `backend/src/modules/community/domain/comment.ts`, `backend/src/modules/community/application/ports/comment-store.ts`, `backend/src/modules/community/application/ports/report-store.ts`, `backend/src/modules/community/application/comments.ts`, `backend/src/modules/community/application/moderation.ts`, `backend/src/modules/community/adapters/markdown/comment-markdown.ts`, `backend/src/modules/community/adapters/postgres/comment-store.ts`, `backend/src/modules/community/adapters/postgres/report-store.ts`, `backend/src/modules/community/adapters/http/comments.routes.ts`, `backend/src/modules/community/adapters/http/moderation.routes.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`.

**Objetivo:** Abrir discussão localizada com pré-moderação, edição segura, remoção e fila operacional real.

**Pré-condições e infraestrutura:** Usuários A/B/moderator/admin, traduções PT/EN, comentários em todos estados e versões; PostgreSQL real+parser/sanitizer+browser teste para XSS.

**Dependências de implementação:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado). **Regras:** [R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente), [R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria), [R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana).

**Entradas do conjunto:** translationId e bodyMarkdown normalizado. Comment, Actor, ação, expectedVersion e motivo. commentId, reason spam|abuse|personal-data|other, descrição opcional<=500. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Fluxo criar→revisar→publicar→editar→revisar→remover testado; contagem corresponde exatamente a visible; filas/denúncias operáveis e sem exposição de PII.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E17-U01

**[E17-U01](#e17-u01) — cenário e resultado esperado:** Matriz pending→visible→edit→pending→hidden→deleted; deleted não edita/restaura; owner não muda status, moderator não muda body alheio.

#### E17-U02

**[E17-U02](#e17-u02) — cenário e resultado esperado:** Markdown com javascript: link, HTML, iframe, imagem ou 6 links falha; código com sinais HTML dentro de fence preservado como texto; 5000 chars passa/5001 falha; Unicode/CRLF normalizados sem destruir código.

#### E17-U03

**[E17-U03](#e17-u03) — cenário e resultado esperado:** Cursor inválido/outro locale/tradução rejeitado; denunciar não oculta automaticamente.

### Testes de integração

#### E17-I01

**[E17-I01](#e17-i01) — cenário e resultado esperado:** A cria pending: público lista/count zero, privado A mostra pending, B não vê; moderador aprova→lista/count um; edição volta pending/count zero; stale moderation version→409.

#### E17-I02

**[E17-I02](#e17-i02) — cenário e resultado esperado:** DELETE repetido conserva tombstone sem body e count zero; user bloqueado e edição por B→403; tradução draft/archive→404 sem nova interação.

#### E17-I03

**[E17-I03](#e17-i03) — cenário e resultado esperado:** Reports concorrentes mesma conta/alvo→uma aberta; resolver/dismiss auditado, falha de auditoria faz rollback da decisão; XSS renderizado não executa em teste de browser. Cursor pagina timestamps iguais sem duplicação.

### Testes de API

#### E17-A01

**[E17-A01](#e17-a01) — cenário e resultado esperado:** POST comment201 pending/Location; público lista vazio até aprovação; GET me mostra próprio status; B não edita A403; staleVersion409; XSS/5001chars422.

#### E17-A02

**[E17-A02](#e17-a02) — cenário e resultado esperado:** Moderação visible/hidden exige role/reason/version; deleted terminal; report novo201/repetido200, fila privada, resolução auditada; contagem só visible.

### Testes de persistência

Executar todos os cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Markdown com javascript: link, HTML, iframe, imagem ou 6 links falha; código com sinais HTML dentro de fence preservado como texto; 5000 chars passa/5001 falha; Unicode/CRLF normalizados sem destruir código.
- Cursor inválido/outro locale/tradução rejeitado; denunciar não oculta automaticamente.
- A cria pending: público lista/count zero, privado A mostra pending, B não vê; moderador aprova→lista/count um; edição volta pending/count zero; stale moderation version→409.
- DELETE repetido conserva tombstone sem body e count zero; user bloqueado e edição por B→403; tradução draft/archive→404 sem nova interação.
- Reports concorrentes mesma conta/alvo→uma aberta; resolver/dismiss auditado, falha de auditoria faz rollback da decisão; XSS renderizado não executa em teste de browser. Cursor pagina timestamps iguais sem duplicação.
- POST comment201 pending/Location; público lista vazio até aprovação; GET me mostra próprio status; B não edita A403; staleVersion409; XSS/5001chars422.

### Arquivos e definição de pronto

- `backend/tests/unit/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-U de regras e erros de Comentários moderados e denúncias operáveis.
- `backend/tests/integration/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-I das fronteiras reais e persistência/operação de Comentários moderados e denúncias operáveis.
- `backend/tests/api/e17-comments-moderation.test.ts` — Cenários [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis)-A de endpoints/status/DTO/auth de Comentários moderados e denúncias operáveis.

Unitários: [E17-U01](#e17-u01), [E17-U02](#e17-u02), [E17-U03](#e17-u03). Integração: [E17-I01](#e17-i01), [E17-I02](#e17-i02), [E17-I03](#e17-i03). API: [E17-A01](#e17-a01), [E17-A02](#e17-a02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

<a id="e18"></a>

## E18. Registrar views deduplicadas e estatísticas reais — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E18](./BACKEND_IMPLEMENTATION_ORDER.md#18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) · [Implementação E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/007-views.ts`, `backend/src/modules/community/domain/view-policy.ts`, `backend/src/modules/community/application/ports/view-recorder.ts`, `backend/src/modules/community/application/ports/stats-reader.ts`, `backend/src/modules/community/application/record-view.ts`, `backend/src/modules/community/application/get-stats.ts`, `backend/src/modules/community/adapters/postgres/view-recorder.ts`, `backend/src/modules/community/adapters/postgres/stats-reader.ts`, `backend/src/modules/community/adapters/http/views.routes.ts`, `backend/src/modules/community/adapters/http/stats.routes.ts`, `frontend/src/features/articles/useQualifiedView.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`, `backend/src/config/env.ts`.

**Objetivo:** Entregar as três métricas com escopo explícito, deduplicação concorrente e privacidade definida.

**Pré-condições e infraestrutura:** DB com likes/comments e migração007, relógio UTC nos limites de dia, identidades sintéticas, chave HMAC de teste, duas instâncias/100 POST concorrentes.

**Dependências de implementação:** [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado), [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis). **Regras:** [R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos).

**Entradas do conjunto:** Tradução pública, identidade de sessão ou cookie permitido, now servidor e metricVersion. articleId público, locale com tradução pública e versão de métrica. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Likes/comentários/views reais e explicados, dedupe correto sob concorrência/rollback; coleta anônima só com política ativada e nenhuma falsa métrica histórica.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E18-U01

**[E18-U01](#e18-u01) — cenário e resultado esperado:** Clock fake atravessa meia-noite UTC: mesma janela dedupe, próxima aceita; HMAC finalidades diferentes não colidem; identidade ausente não chama recorder; timer conta só visibilidade.

#### E18-U02

**[E18-U02](#e18-u02) — cenário e resultado esperado:** Stats escopo: likes artigo, comments só visible por locale, views versões separadas; número acima de safe integer não arredonda.

### Testes de integração

#### E18-I01

**[E18-I01](#e18-i01) — cenário e resultado esperado:** 100 POST concorrentes mesma chave→uma dedupe e count=1; falha induzida entre insert e upsert desfaz ambos; retry depois conta uma vez; duas traduções/dias/identidades contam independentemente.

#### E18-I02

**[E18-I02](#e18-i02) — cenário e resultado esperado:** GET de artigo/SSG não cria métricas; sem consentimento anônimo não ganha cookie/contagem; consent→POST aceita; retirada cessa novas contagens; response 204 igual em aceito/duplicado.

#### E18-I03

**[E18-I03](#e18-i03) — cenário e resultado esperado:** Stats não revela userId/cookies, cache público de A/B idêntico; pending/hidden/deleted não contam; mudar like/view não altera snapshot lastmod.

### Testes de API

#### E18-A01

**[E18-A01](#e18-a01) — cenário e resultado esperado:** POST views204 indistinguível aceito/duplicado/sem identidade, GET article não incrementa; origem inválida403, draft404, versão inválida400, abuso429; com sessão exige CSRF.

#### E18-A02

**[E18-A02](#e18-a02) — cenário e resultado esperado:** POST consent explícito cria/apaga cookie; stats200 com números/versão/início, sem liked ou sessão; locale ausente de tradução404; overflow503 seguro.

### Testes de persistência

Executar todos os cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Clock fake atravessa meia-noite UTC: mesma janela dedupe, próxima aceita; HMAC finalidades diferentes não colidem; identidade ausente não chama recorder; timer conta só visibilidade.
- 100 POST concorrentes mesma chave→uma dedupe e count=1; falha induzida entre insert e upsert desfaz ambos; retry depois conta uma vez; duas traduções/dias/identidades contam independentemente.
- GET de artigo/SSG não cria métricas; sem consentimento anônimo não ganha cookie/contagem; consent→POST aceita; retirada cessa novas contagens; response 204 igual em aceito/duplicado.
- POST views204 indistinguível aceito/duplicado/sem identidade, GET article não incrementa; origem inválida403, draft404, versão inválida400, abuso429; com sessão exige CSRF.
- POST consent explícito cria/apaga cookie; stats200 com números/versão/início, sem liked ou sessão; locale ausente de tradução404; overflow503 seguro.

### Arquivos e definição de pronto

- `backend/tests/unit/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-U de regras e erros de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/integration/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-I das fronteiras reais e persistência/operação de Registrar views deduplicadas e estatísticas reais.
- `backend/tests/api/e18-views-stats.test.ts` — Cenários [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais)-A de endpoints/status/DTO/auth de Registrar views deduplicadas e estatísticas reais.

Unitários: [E18-U01](#e18-u01), [E18-U02](#e18-u02). Integração: [E18-I01](#e18-i01), [E18-I02](#e18-i02), [E18-I03](#e18-i03). API: [E18-A01](#e18-a01), [E18-A02](#e18-a02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).

<a id="e19"></a>

## E19. Excluir contas, exportar dados e executar retenção — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E19](./BACKEND_IMPLEMENTATION_ORDER.md#19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) · [Implementação E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/008-account-lifecycle.ts`, `backend/src/modules/identity/application/ports/account-lifecycle-store.ts`, `backend/src/modules/identity/application/delete-account.ts`, `backend/src/modules/identity/application/export-account.ts`, `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts`, `backend/src/modules/identity/adapters/http/account.routes.ts`, `backend/src/modules/identity/adapters/cli/account-operations.ts`, `backend/scripts/cleanup.ts`, `backend/src/modules/community/adapters/postgres/stats-reader.ts`, `backend/scripts/restore.mjs`, `backend/src/composition.ts`, `backend/src/http/app.ts`, `backend/src/config/env.ts`.

**Objetivo:** Cumprir política técnica de dados de ponta a ponta, com processo de exportação inicialmente manual autenticado.

**Pré-condições e infraestrutura:** Conta com todas relações e backup anterior à exclusão em DB isolado; ledger de teste separado, artefatos export privados temporários e clock de retenção.

**Dependências de implementação:** [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais). **Regras:** [R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis).

**Entradas do conjunto:** Actor autenticado recentemente e requestId de exclusão. Pedido do titular, now, prazos aprovados e exceções restritas. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Exclusão impede writes e termina em purge real; exportação manual tem pedido/entrega verificável; cleanup executável e restore respeita exclusões; política aprovada antes de coletar.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E19-U01

**[E19-U01](#e19-u01) — cenário e resultado esperado:** Lifecycle stub: authTime vencido nega antes de preparar; deletion_pending bloqueia novas ações; retry finalização não duplica efeitos; export allowlist exclui token/hash/email de terceiros.

#### E19-U02

**[E19-U02](#e19-u02) — cenário e resultado esperado:** Clock fake em fronteira 48h/90d/13meses: elegíveis corretos; exceção legal operacional registrada impede purge daquele alvo apenas.

### Testes de integração

#### E19-I01

**[E19-I01](#e19-i01) — cenário e resultado esperado:** Conta com sessões/likes/comments/reports: DELETE→sessões revogadas imediatamente; finalização parcial com falha faz rollback e retry conclui; body pessoal removido, tombstone e catálogo preservados; PUT like concorrente não sobrevive exclusão.

#### E19-I02

**[E19-I02](#e19-i02) — cenário e resultado esperado:** Export solicitação de A não pode ser atendida/baixada por B; JSON contém só dados pertinentes de A, nenhuma credencial; expiração elimina artefato.

#### E19-I03

**[E19-I03](#e19-i03) — cenário e resultado esperado:** Backup anterior à exclusão restaurado em DB isolado + replay ledger não ressuscita perfil/interações; cleanup duas vezes preserva total daily+monthly, sem apagar dentro da retenção.

### Testes de API

#### E19-A01

**[E19-A01](#e19-a01) — cenário e resultado esperado:** DELETE me com auth recente202 e cookie limpo, auth antiga403 REAUTH_REQUIRED; após preparo me401; POST export202 gera pedido próprio no-store e rate1/dia.

### Testes de persistência

Executar todos os cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Lifecycle stub: authTime vencido nega antes de preparar; deletion_pending bloqueia novas ações; retry finalização não duplica efeitos; export allowlist exclui token/hash/email de terceiros.
- Clock fake em fronteira 48h/90d/13meses: elegíveis corretos; exceção legal operacional registrada impede purge daquele alvo apenas.
- Conta com sessões/likes/comments/reports: DELETE→sessões revogadas imediatamente; finalização parcial com falha faz rollback e retry conclui; body pessoal removido, tombstone e catálogo preservados; PUT like concorrente não sobrevive exclusão.
- Export solicitação de A não pode ser atendida/baixada por B; JSON contém só dados pertinentes de A, nenhuma credencial; expiração elimina artefato.
- DELETE me com auth recente202 e cookie limpo, auth antiga403 REAUTH_REQUIRED; após preparo me401; POST export202 gera pedido próprio no-store e rate1/dia.

### Arquivos e definição de pronto

- `backend/tests/unit/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-U de regras e erros de Excluir contas, exportar dados e executar retenção.
- `backend/tests/integration/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-I das fronteiras reais e persistência/operação de Excluir contas, exportar dados e executar retenção.
- `backend/tests/api/e19-account-lifecycle.test.ts` — Cenários [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)-A de endpoints/status/DTO/auth de Excluir contas, exportar dados e executar retenção.

Unitários: [E19-U01](#e19-u01), [E19-U02](#e19-u02). Integração: [E19-I01](#e19-i01), [E19-I02](#e19-i02), [E19-I03](#e19-i03). API: [E19-A01](#e19-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

<a id="e20"></a>

## E20. Habilitar comunidade com observabilidade e operação completas — Após publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E20](./BACKEND_IMPLEMENTATION_ORDER.md#20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) · [Implementação E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/infrastructure/metrics.ts`, `backend/src/http/request-log.ts`, `backend/src/http/app.ts`, `backend/scripts/community-smoke.mjs`, `frontend/src/features/articles/community.tsx`.

**Objetivo:** Validar comunidade inteira e acrescentar métricas úteis, documentação operacional e ferramentas de contribuição.

**Pré-condições e infraestrutura:** Staging/CI com frontend e backend reais, provider fake só ambiente teste; fixtures de comunidade e carga sintética descrita em relatório.

**Dependências de implementação:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o). **Regras:** [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio), [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade), [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos), [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis), [R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana).

**Entradas do conjunto:** Actor atual, ação e recurso/owner. Ação, actor/origem pseudonimizada e clock. articleId público, locale com tradução pública e versão de métrica. Pedido do titular, now, prazos aprovados e exceções restritas. Flag COMMUNITY_ENABLED e evidências [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)–[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)/políticas/contatos. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** M2/P1 pronto com pacote comunitário completo, testes/autorização/privacidade/moderação humana e métricas reais; nenhuma flag habilitada só porque endpoints respondem.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E20-U01

**[E20-U01](#e20-u01) — cenário e resultado esperado:** Métricas com 100 slugs/usuários resultam mesmas labels de rota; não registrar body/token/ID como dimensão; flag desligada mantém leitura e bloqueia rotas de comunidade.

### Testes de integração

#### E20-I01

**[E20-I01](#e20-i01) — cenário e resultado esperado:** Smoke completo com provider fake isolado em CI, provider real apenas smoke controlado de staging configurado pelo operador; pending/moderação/count e exclusão funcionam ponta a ponta.

#### E20-I02

**[E20-I02](#e20-i02) — cenário e resultado esperado:** Teste de carga com catálogo/interações representativos registra p95/pool/429; indisponibilidade provider/DB/limiter gera alertas e respostas corretas, sem quebrar leitura estática. Gate falha quando runbook obrigatório ou política ainda não aprovado.

### Testes de API

#### E20-A01

**[E20-A01](#e20-a01) — cenário e resultado esperado:** COMMUNITY_ENABLED=false mantém editorial200 e rotas comunitárias404; true permite smoke completo; internal metrics inacessível na rota pública e sem labels privadas.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Teste de carga com catálogo/interações representativos registra p95/pool/429; indisponibilidade provider/DB/limiter gera alertas e respostas corretas, sem quebrar leitura estática. Gate falha quando runbook obrigatório ou política ainda não aprovado.
- COMMUNITY_ENABLED=false mantém editorial200 e rotas comunitárias404; true permite smoke completo; internal metrics inacessível na rota pública e sem labels privadas.

### Arquivos e definição de pronto

- `backend/tests/unit/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-U de regras e erros de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/integration/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Habilitar comunidade com observabilidade e operação completas.
- `backend/tests/api/e20-community-release.test.ts` — Cenários [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Habilitar comunidade com observabilidade e operação completas.

Unitários: [E20-U01](#e20-u01). Integração: [E20-I01](#e20-i01), [E20-I02](#e20-i02). API: [E20-A01](#e20-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

<a id="e21"></a>

## E21. Conta local com confirmação e recuperação completas — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E21](./BACKEND_IMPLEMENTATION_ORDER.md#21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) · [Implementação E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/009-local-credentials.ts`, `backend/src/modules/identity/application/ports/password-hasher.ts`, `backend/src/modules/identity/application/ports/email-sender.ts`, `backend/src/modules/identity/application/local-auth.ts`, `backend/src/modules/identity/adapters/crypto/password-hasher.ts`, `backend/src/modules/identity/adapters/email/email-sender.ts`, `backend/src/modules/identity/adapters/postgres/local-credential-store.ts`, `backend/src/modules/identity/adapters/http/local-auth.routes.ts`, `backend/scripts/send-email-outbox.ts`, `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts`, `backend/scripts/cleanup.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`, `backend/src/config/env.ts`.

**Objetivo:** Adicionar email/senha sem enfraquecer sessões, privacidade e prevenção de abuso existentes.

**Pré-condições e infraestrutura:** DB atualizado, email sandbox (sem destinatários reais), adapter Argon2id real para calibração/integração e fake no caso de uso; clock/tokens de teste.

**Dependências de implementação:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo), [R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos).

**Entradas do conjunto:** Nome público,email,password e desafios de confirmação. Token, purpose, now e nova senha quando reset. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Ativar conta local somente com confirmação/reset/hash/email/abuso/exclusão integrados; nenhuma rota parcial habilitada e nenhuma enumeração direta.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E21-U01

**[E21-U01](#e21-u01) — cenário e resultado esperado:** Hash fake: senha 14/15/128/129 chars, Unicode/espaços sem truncamento; normalização preserva +suffix/pontos; email público nunca sai em DTO.

#### E21-U02

**[E21-U02](#e21-u02) — cenário e resultado esperado:** Clock/tokens fake: propósito errado, vencido/consumido negados; reset não autentica e pede revogação; existente/inexistente respondem mensagem genérica igual.

### Testes de integração

#### E21-I01

**[E21-I01](#e21-i01) — cenário e resultado esperado:** DB+email sandbox: cadastro→email→verify→login→forgot→reset→sessões antigas 401; token concorrente consumido uma vez; falha transacional mantém senha/token anteriores.

#### E21-I02

**[E21-I02](#e21-i02) — cenário e resultado esperado:** Falha do fornecedor faz retry outbox sem duplicar token/vínculo, respeita expiração; dump/log não tem senha/token legíveis; excluir conta remove credenciais/tokens/outbox; OAuth sem email continua funcionando.

### Testes de API

#### E21-A01

**[E21-A01](#e21-a01) — cenário e resultado esperado:** Register/forgot/resend202 genéricos, login inválido401 genérico; verify/reset tokens inválidos400 seguros e propósito errado falha; reset válido204 e não autentica.

#### E21-A02

**[E21-A02](#e21-a02) — cenário e resultado esperado:** Login local reutiliza sessão/CSRF; conta não verificada não comenta/curte; GitHub sem email mantém acesso.

### Testes de persistência

Executar todos os cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Hash fake: senha 14/15/128/129 chars, Unicode/espaços sem truncamento; normalização preserva +suffix/pontos; email público nunca sai em DTO.
- Clock/tokens fake: propósito errado, vencido/consumido negados; reset não autentica e pede revogação; existente/inexistente respondem mensagem genérica igual.
- DB+email sandbox: cadastro→email→verify→login→forgot→reset→sessões antigas 401; token concorrente consumido uma vez; falha transacional mantém senha/token anteriores.
- Falha do fornecedor faz retry outbox sem duplicar token/vínculo, respeita expiração; dump/log não tem senha/token legíveis; excluir conta remove credenciais/tokens/outbox; OAuth sem email continua funcionando.
- Register/forgot/resend202 genéricos, login inválido401 genérico; verify/reset tokens inválidos400 seguros e propósito errado falha; reset válido204 e não autentica.
- Login local reutiliza sessão/CSRF; conta não verificada não comenta/curte; GitHub sem email mantém acesso.

### Arquivos e definição de pronto

- `backend/tests/unit/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-U de regras e erros de Conta local com confirmação e recuperação completas.
- `backend/tests/integration/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-I das fronteiras reais e persistência/operação de Conta local com confirmação e recuperação completas.
- `backend/tests/api/e21-local-auth.test.ts` — Cenários [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)-A de endpoints/status/DTO/auth de Conta local com confirmação e recuperação completas.

Unitários: [E21-U01](#e21-u01), [E21-U02](#e21-u02). Integração: [E21-I01](#e21-i01), [E21-I02](#e21-i02). API: [E21-A01](#e21-a01), [E21-A02](#e21-a02). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas).

<a id="e22"></a>

## E22. Respostas limitadas e progresso explícito de leitura — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E22](./BACKEND_IMPLEMENTATION_ORDER.md#22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) · [Implementação E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/010-learning-threads.ts`, `backend/src/modules/community/domain/comment.ts`, `backend/src/modules/community/adapters/postgres/comment-store.ts`, `backend/src/modules/community/adapters/http/comments.routes.ts`, `backend/src/modules/publishing/application/ports/progress-store.ts`, `backend/src/modules/publishing/application/reading-progress.ts`, `backend/src/modules/publishing/adapters/postgres/progress-store.ts`, `backend/src/modules/publishing/adapters/http/progress.routes.ts`, `backend/src/modules/publishing/domain/series.ts`, `backend/src/modules/publishing/adapters/postgres/publication-store.ts`, `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`.

**Objetivo:** Evoluir comentários e trilhas sem árvores ilimitadas nem confundir view com aprendizado.

**Pré-condições e infraestrutura:** DB com catálogo bilíngue/série com lacuna, comentários raiz/reply/tombstone, contas A/B; ativar fixtures apenas das subcapacidades escolhidas.

**Dependências de implementação:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um), [R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos).

**Entradas do conjunto:** translationId,parentId e comentário autorizado. Actor,articleId,completed boolean; opcional grafo editorial/ação de favorito. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Subcapacidades ativadas têm migrations/API/testes completos; nenhuma ligação entre métrica e aprendizagem; comentários/séries existentes evoluem sem recriar IDs ou quebrar clientes planos.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E22-U01

**[E22-U01](#e22-u01) — cenário e resultado esperado:** Parent próprio/de outra tradução/não raiz rejeita; tombstone permite preservar encadeamento; ciclo A→B→A e self prerequisite rejeitam.

#### E22-U02

**[E22-U02](#e22-u02) — cenário e resultado esperado:** Progresso: true duas vezes preserva data, false remove, série vazia 0, reordenar mantém histórico; view não marca; favorito não incrementa like.

### Testes de integração

#### E22-I01

**[E22-I01](#e22-i01) — cenário e resultado esperado:** Raiz removida com reply visible: body raiz indisponível/tombstone, reply paginado e count 1; corrida criar reply/apagar raiz mantém integridade; árvore maior que profundidade 1 nunca persiste.

#### E22-I02

**[E22-I02](#e22-i02) — cenário e resultado esperado:** Progress em PT aparece em EN pelo articleId; archive altera denominador sem apagar histórico; exclusão conta remove progresso/bookmarks; snapshot nunca expõe marcas privadas; import concorrente de prerequisites não permite ciclo.

### Testes de API

#### E22-A01

**[E22-A01](#e22-a01) — cenário e resultado esperado:** POST reply aceita parent raiz da mesma tradução; reply de reply422; GET replies paginado não revela body apagado. PUT progress true/false idempotente, GET próprio no-store, visitante401.

### Testes de persistência

Executar todos os cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Parent próprio/de outra tradução/não raiz rejeita; tombstone permite preservar encadeamento; ciclo A→B→A e self prerequisite rejeitam.
- Progress em PT aparece em EN pelo articleId; archive altera denominador sem apagar histórico; exclusão conta remove progresso/bookmarks; snapshot nunca expõe marcas privadas; import concorrente de prerequisites não permite ciclo.

### Arquivos e definição de pronto

- `backend/tests/unit/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-U de regras e erros de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/integration/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-I das fronteiras reais e persistência/operação de Respostas limitadas e progresso explícito de leitura.
- `backend/tests/api/e22-learning-threads.test.ts` — Cenários [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura)-A de endpoints/status/DTO/auth de Respostas limitadas e progresso explícito de leitura.

Unitários: [E22-U01](#e22-u01), [E22-U02](#e22-u02). Integração: [E22-I01](#e22-i01), [E22-I02](#e22-i02). API: [E22-A01](#e22-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura).

<a id="e23"></a>

## E23. Busca por idioma e relacionados editoriais — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E23](./BACKEND_IMPLEMENTATION_ORDER.md#23-busca-por-idioma-e-relacionados-editoriais) · [Implementação E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/migrations/011-search.ts`, `backend/src/modules/publishing/adapters/postgres/article-reader.ts`, `backend/src/modules/publishing/adapters/postgres/publication-store.ts`, `backend/src/modules/publishing/application/list-articles.ts`, `backend/src/modules/publishing/application/content.dto.ts`, `backend/src/modules/publishing/adapters/http/article.schemas.ts`, `backend/src/modules/publishing/adapters/cli/content.schemas.ts`.

**Objetivo:** Melhorar descoberta com PostgreSQL antes de introduzir motor externo ou recomendações por IA.

**Pré-condições e infraestrutura:** PostgreSQL16 com volume representativo e termos PT/EN/draft, baseline de busca anterior, AST de conteúdo e medição EXPLAIN em ambiente de teste.

**Dependências de implementação:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais).

**Entradas do conjunto:** q/locale/filtros e articleId/curadoria revisada. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Busca útil medida, índices mantidos atomicamente e API retrocompatível; relacionados reais e localizados, sem preenchimento fictício.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E23-U01

**[E23-U01](#e23-u01) — cenário e resultado esperado:** q ausente mantém ordem antiga; relevance sem q rejeita; curadoria self/duplicada inválida; relacionados sem versão EN são omitidos sem substituir PT.

### Testes de integração

#### E23-I01

**[E23-I01](#e23-i01) — cenário e resultado esperado:** DB com termos PT/EN e draft: resultados/ranking específicos do idioma, nenhum draft; import altera índice na mesma revisão; rollback não deixa texto fantasma; retirar conteúdo invalida resultados.

#### E23-I02

**[E23-I02](#e23-i02) — cenário e resultado esperado:** EXPLAIN/carga representativa compara latência/custo com q anterior; related curado→série→tags mantém ordem/limite sem repetição; highlights maliciosos não injetam HTML.

### Testes de API

#### E23-A01

**[E23-A01](#e23-a01) — cenário e resultado esperado:** GET articles?q=...&sort=relevance aceita com q e rejeita sem q400; filtros antigos intactos, idiomas isolados e relatedArticles sem draft.

### Testes de persistência

Executar todos os cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- q ausente mantém ordem antiga; relevance sem q rejeita; curadoria self/duplicada inválida; relacionados sem versão EN são omitidos sem substituir PT.
- DB com termos PT/EN e draft: resultados/ranking específicos do idioma, nenhum draft; import altera índice na mesma revisão; rollback não deixa texto fantasma; retirar conteúdo invalida resultados.
- EXPLAIN/carga representativa compara latência/custo com q anterior; related curado→série→tags mantém ordem/limite sem repetição; highlights maliciosos não injetam HTML.
- GET articles?q=...&sort=relevance aceita com q e rejeita sem q400; filtros antigos intactos, idiomas isolados e relatedArticles sem draft.

### Arquivos e definição de pronto

- `backend/tests/unit/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-U de regras e erros de Busca por idioma e relacionados editoriais.
- `backend/tests/integration/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-I das fronteiras reais e persistência/operação de Busca por idioma e relacionados editoriais.
- `backend/tests/api/e23-localized-search.test.ts` — Cenários [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais)-A de endpoints/status/DTO/auth de Busca por idioma e relacionados editoriais.

Unitários: [E23-U01](#e23-u01). Integração: [E23-I01](#e23-i01), [E23-I02](#e23-i02). API: [E23-A01](#e23-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais).

<a id="e24"></a>

## E24. Evoluir operação editorial e ativação de releases sob necessidade — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E24](./BACKEND_IMPLEMENTATION_ORDER.md#24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) · [Implementação E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/publishing/application/ports/editorial-proposal-store.ts`, `backend/src/modules/publishing/application/propose-content.ts`, `backend/src/modules/publishing/adapters/http/editorial.routes.ts`, `backend/src/modules/publishing/adapters/git/editorial-proposal-store.ts`, `backend/migrations/012-editorial-releases.ts`, `backend/src/modules/publishing/application/activate-release.ts`, `backend/src/modules/publishing/application/import-content.ts`, `backend/src/modules/publishing/application/publish-translation.ts`, `backend/src/modules/publishing/adapters/postgres/publication-store.ts`, `backend/src/modules/publishing/adapters/postgres/article-reader.ts`, `backend/scripts/release-smoke.mjs`, `backend/src/composition.ts`, `backend/src/http/app.ts`, `backend/src/config/env.ts`.

**Objetivo:** Permitir operação editorial mais acessível sem introduzir duas fontes concorrentes ou publicação parcialmente ativada.

**Pré-condições e infraestrutura:** Provider Git fake com PR/revisões, DB+armazenamento de releases e host estático de teste com releaseId; candidatas boa/falha e cenário de retirada urgente.

**Dependências de implementação:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial).

**Entradas do conjunto:** Proposta autorizada/baseCommit ou release candidata validada. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Autoridade editorial única preservada; subcapacidade escolhida tem fluxo/retry/recuperação testados; ativação não promete atomicidade que host não fornece.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E24-U01

**[E24-U01](#e24-u01) — cenário e resultado esperado:** Autor propõe mas não publica sem revisor; base antiga conflita; preview draft nunca usa DTO público/cache; token Git redigido.

#### E24-U02

**[E24-U02](#e24-u02) — cenário e resultado esperado:** Activate release com expected diferente falha; repetir mesmo ID não duplica; retirada global prevalece sobre snapshot anterior.

### Testes de integração

#### E24-I01

**[E24-I01](#e24-i01) — cenário e resultado esperado:** Provider Git fake: proposta→PR→revisão→import sem editar DB pelo painel; falha/retry não cria propostas duplicadas por idempotency key; preview só autor/revisor.

#### E24-I02

**[E24-I02](#e24-i02) — cenário e resultado esperado:** Artefato candidato falha smoke→active inalterado; concorrência duas ativações→uma vence; cliente de release antiga lê snapshot antigo coerente; rollback preserva likes/comments e denylist impede ressuscitar artigo retirado.

### Testes de API

#### E24-A01

**[E24-A01](#e24-a01) — cenário e resultado esperado:** Proposta/preview editorial exige sessão recente/CSRF/role e no-store; base antiga409, draft nunca em GET público; releaseId inválido não faz fallback para mistura de revisões.

### Testes de persistência

Executar todos os cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Activate release com expected diferente falha; repetir mesmo ID não duplica; retirada global prevalece sobre snapshot anterior.
- Provider Git fake: proposta→PR→revisão→import sem editar DB pelo painel; falha/retry não cria propostas duplicadas por idempotency key; preview só autor/revisor.
- Artefato candidato falha smoke→active inalterado; concorrência duas ativações→uma vence; cliente de release antiga lê snapshot antigo coerente; rollback preserva likes/comments e denylist impede ressuscitar artigo retirado.
- Proposta/preview editorial exige sessão recente/CSRF/role e no-store; base antiga409, draft nunca em GET público; releaseId inválido não faz fallback para mistura de revisões.

### Arquivos e definição de pronto

- `backend/tests/unit/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-U de regras e erros de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/integration/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-I das fronteiras reais e persistência/operação de Evoluir operação editorial e ativação de releases sob necessidade.
- `backend/tests/api/e24-editorial-evolution.test.ts` — Cenários [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade)-A de endpoints/status/DTO/auth de Evoluir operação editorial e ativação de releases sob necessidade.

Unitários: [E24-U01](#e24-u01), [E24-U02](#e24-u02). Integração: [E24-I01](#e24-i01), [E24-I02](#e24-i02). API: [E24-A01](#e24-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade).

<a id="e25"></a>

## E25. Automatizar atendimento de privacidade quando houver demanda — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E25](./BACKEND_IMPLEMENTATION_ORDER.md#25-automatizar-atendimento-de-privacidade-quando-houver-demanda) · [Implementação E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/src/modules/identity/application/export-account.ts`, `backend/src/modules/identity/application/ports/private-export-store.ts`, `backend/src/modules/identity/adapters/storage/private-export-store.ts`, `backend/src/modules/identity/adapters/http/account.routes.ts`, `backend/src/modules/identity/adapters/postgres/account-lifecycle-store.ts`, `backend/migrations/013-private-exports.ts`, `backend/scripts/process-exports.ts`, `backend/scripts/cleanup.ts`, `backend/src/composition.ts`, `backend/src/http/app.ts`, `backend/src/config/env.ts`.

**Objetivo:** Reduzir trabalho operacional de exportação sem ampliar exposição de dados ou alterar política aprovada.

**Pré-condições e infraestrutura:** Storage privado de teste e PostgreSQL, duas instâncias de job, clock para TTL, export de A/B e exclusão concorrente.

**Dependências de implementação:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria).

**Entradas do conjunto:** requestId,token temporário e Actor. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Atendimento automático tem ownership, TTL, cancelamento e retry provados; processo P1 permanece fallback até estabilidade.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E25-U01

**[E25-U01](#e25-u01) — cenário e resultado esperado:** Clock fake: token 15min/arquivo 24h, uso único e retry não estendem prazo; ownership exige userId certo; dados exportados mantêm allowlist [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

### Testes de integração

#### E25-I01

**[E25-I01](#e25-i01) — cenário e resultado esperado:** Dois workers pegam mesmo job→um artefato válido; falha storage→retry seguro; duas tentativas download→um consumo; B não acessa export de A.

#### E25-I02

**[E25-I02](#e25-i02) — cenário e resultado esperado:** Exclusão concorrente cancela job/purga objeto; restore/cleanup não ressuscitam arquivo; TTL efetivo do storage testado com relógio fixture ou objetos de prazo curto.

### Testes de API

#### E25-A01

**[E25-A01](#e25-a01) — cenário e resultado esperado:** GET status/download export exige dono/reautenticação e no-store; token errado/expirado/reusado negado sem informação privada; A não acessa pedido de B.

### Testes de persistência

Executar todos os cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-I que escrevem/leem banco com migrations reais: verificar linhas antes/depois, FKs/UNIQUE/checks, estado após rollback, índices/ordem e isolamento entre atores/locales. Rodar upgrade sobre schema anterior e repetir migration sem reaplicá-la.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Clock fake: token 15min/arquivo 24h, uso único e retry não estendem prazo; ownership exige userId certo; dados exportados mantêm allowlist [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).
- Dois workers pegam mesmo job→um artefato válido; falha storage→retry seguro; duas tentativas download→um consumo; B não acessa export de A.
- Exclusão concorrente cancela job/purga objeto; restore/cleanup não ressuscitam arquivo; TTL efetivo do storage testado com relógio fixture ou objetos de prazo curto.
- GET status/download export exige dono/reautenticação e no-store; token errado/expirado/reusado negado sem informação privada; A não acessa pedido de B.

### Arquivos e definição de pronto

- `backend/tests/unit/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-U de regras e erros de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/integration/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-I das fronteiras reais e persistência/operação de Automatizar atendimento de privacidade quando houver demanda.
- `backend/tests/api/e25-private-exports.test.ts` — Cenários [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda)-A de endpoints/status/DTO/auth de Automatizar atendimento de privacidade quando houver demanda.

Unitários: [E25-U01](#e25-u01). Integração: [E25-I01](#e25-i01), [E25-I02](#e25-i02). API: [E25-A01](#e25-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda).

<a id="e26"></a>

## E26. Escalar apenas o gargalo medido — Evolução futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice) · [Ordem E26](./BACKEND_IMPLEMENTATION_ORDER.md#26-escalar-apenas-o-gargalo-medido) · [Implementação E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) · [Estrutura](./BACKEND_IMPLEMENTATION_STRUCTURE.md#%C3%ADndice) · [Regras](./BACKEND_BUSINESS_RULES.md#%C3%ADndice)
<!-- navigation:section:end -->

**Componente testado:** `backend/scripts/load-test.mjs`, `backend/src/infrastructure/public-cache-store.ts`, `backend/src/infrastructure/rate-limiter.ts`, `backend/src/modules/community/adapters/postgres/view-recorder.ts`, `backend/src/modules/community/adapters/postgres/stats-reader.ts`, `backend/scripts/reconcile-stats.ts`, `backend/src/workers/blog-worker.ts`, `backend/src/infrastructure/tracing.ts`, `backend/src/modules/publishing/application/ports/editorial-asset-store.ts`, `backend/src/modules/publishing/adapters/storage/editorial-asset-store.ts`, `backend/src/infrastructure/database.ts`, `backend/src/composition.ts`, `backend/migrations/014-measured-optimizations.ts`, `backend/src/config/env.ts`.

**Objetivo:** Executar uma otimização por vez, preservando contratos, consistência e operação do monólito.

**Pré-condições e infraestrutura:** Ambiente de carga igual ao baseline; subir só dependências escolhidas (Redis/storage/worker/replica/collector). Injeção de falhas/restarts, nunca em produção.

**Dependências de implementação:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas). **Regras:** [R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica).

**Entradas do conjunto:** Baseline, experimento e adapter candidato. Os valores válidos/inválidos e resultados de cada operação estão nos cenários abaixo.

**Resultado global esperado:** Melhoria entregue somente com diagnóstico/ganho/reversão documentados e regressões funcionais verdes; nenhuma infraestrutura adicionada sem gatilho.

**Mocks/stubs:** unitários substituem apenas ports externas citadas (reader/store/provider/logger/clock), com contadores de chamada e falhas controladas. Funções de domínio/AST e validação são exercitadas de verdade. Na integração, PostgreSQL/constraints/transações/parsers são reais; apenas provider externo, email e destino de alerta usam sandbox/stub isolado. Nenhum mock de DB é evidência de unicidade.

### Testes unitários

#### E26-U01

**[E26-U01](#e26-u01) — cenário e resultado esperado:** Cache key separa locale/revisão/consulta, privado nunca cacheia; invalidation representa retirada; retry worker usa mesma idempotency key; cardinalidade tracing limitada.

### Testes de integração

#### E26-I01

**[E26-I01](#e26-i01) — cenário e resultado esperado:** Antes/depois com mesma carga comprova ganho e preserva suites; publicar/ocultar invalida cache; falha Redis gera fallback público controlado/503 em limiter de mutação, sem liberar abuso.

#### E26-I02

**[E26-I02](#e26-i02) — cenário e resultado esperado:** Worker crash/redelivery produz um efeito; contador materializado reconcilia após falha; múltiplas réplicas preservam sessão/like/view; PgBouncer não rompe transação; réplica atrasada nunca autoriza usuário bloqueado.

#### E26-I03

**[E26-I03](#e26-i03) — cenário e resultado esperado:** Asset com MIME spoof/tamanho excessivo rejeitado, objeto privado não exposto; tracing/log não contém tokens. Cada subcapacidade escolhida executa seus cenários, demais continuam adiadas.

### Testes de API

#### E26-A01

**[E26-A01](#e26-a01) — cenário e resultado esperado:** Suite pública/privada existente passa com adapter otimizado; cache por locale/revisão, retirada provoca404/revalidação; limiter indisponível503 em mutações, nunca acesso liberado.

### Testes de persistência

Aplicar os cenários de integração de banco/artefato descritos acima quando o componente persistir; funções puras não ganham um mock de repository só para classificar teste. As constraints do consumidor são provadas na etapa da migration/store.

### Autenticação e autorização

Usar matriz visitante/ativo/dono/outro usuário/moderator/admin/blocked/deletion_pending. Para cada mutação presente: sem sessão401, sem permissão403, alvo privado404, CSRF/Origin inválidos403; sessão expirada/revogada não grava. Bootstrap/CLI tem autorização operacional explícita; P2 reusa a sessão P1.

### Erros e casos limites

- Antes/depois com mesma carga comprova ganho e preserva suites; publicar/ocultar invalida cache; falha Redis gera fallback público controlado/503 em limiter de mutação, sem liberar abuso.
- Worker crash/redelivery produz um efeito; contador materializado reconcilia após falha; múltiplas réplicas preservam sessão/like/view; PgBouncer não rompe transação; réplica atrasada nunca autoriza usuário bloqueado.
- Asset com MIME spoof/tamanho excessivo rejeitado, objeto privado não exposto; tracing/log não contém tokens. Cada subcapacidade escolhida executa seus cenários, demais continuam adiadas.
- Suite pública/privada existente passa com adapter otimizado; cache por locale/revisão, retirada provoca404/revalidação; limiter indisponível503 em mutações, nunca acesso liberado.

### Arquivos e definição de pronto

- `backend/tests/unit/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-U de regras e erros de Escalar apenas o gargalo medido.
- `backend/tests/integration/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-I das fronteiras reais e persistência/operação de Escalar apenas o gargalo medido.
- `backend/tests/api/e26-measured-scaling.test.ts` — Cenários [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido)-A de endpoints/status/DTO/auth de Escalar apenas o gargalo medido.

Unitários: [E26-U01](#e26-u01). Integração: [E26-I01](#e26-i01), [E26-I02](#e26-i02), [E26-I03](#e26-i03). API: [E26-A01](#e26-a01). Cenários passam, falhas foram vistas durante desenvolvimento do teste (teste sensível ao defeito), resultados documentados na PR/RELEASE_EVIDENCE quando operacionais. Nenhum threshold artificial de cobertura substitui os invariantes acima. Ver [implementação](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido).

<!-- navigation:anchor:start -->
<a id="nav-section-003"></a>
<!-- navigation:anchor:end -->

## Rastreabilidade de todas as regras

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

| Regra | Fase | Cenários mínimos |
| --- | --- | --- |
| [R01](./BACKEND_BUSINESS_RULES.md#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) | P0 | [E01-U01](#e01-u01)/[U02](#e01-u02)/[I01](#e01-i01)/[I02](#e01-i02); [E11-I01](#e11-i01)/[I02](#e11-i02); [E12-I01](#e12-i01). |
| [R02](./BACKEND_BUSINESS_RULES.md#r02-disponibilidade-e-encerramento-honestos) | P0 | [E02-U01](#e02-u01)/[I01](#e02-i01)/[I02](#e02-i02); [E03-I02](#e03-i02). |
| [R03](./BACKEND_BUSINESS_RULES.md#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo) | P0 | [E02-U02](#e02-u02)/[U03](#e02-u03)/[I01](#e02-i01); [E09-U01](#e09-u01)/[I01](#e09-i01)/[I03](#e09-i03). |
| [R04](./BACKEND_BUSINESS_RULES.md#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita) | P0 | [E03-U01](#e03-u01)/[I01](#e03-i01)/[I02](#e03-i02); [E05-I01](#e05-i01)/[I03](#e05-i03). |
| [R05](./BACKEND_BUSINESS_RULES.md#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis) | P0 | [E04-U01](#e04-u01); [E05-I01](#e05-i01)/[I02](#e05-i02); [E06-I01](#e06-i01); [E07-I01](#e07-i01). |
| [R06](./BACKEND_BUSINESS_RULES.md#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es) | P0 | [E04-U01](#e04-u01); [E07-U01](#e07-u01)/[I01](#e07-i01)/[I03](#e07-i03); [E24-U02](#e24-u02)/[I02](#e24-i02). |
| [R07](./BACKEND_BUSINESS_RULES.md#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) | P0 | [E04-U02](#e04-u02); [E05-I03](#e05-i03); [E08-U02](#e08-u02)/[I01](#e08-i01). |
| [R08](./BACKEND_BUSINESS_RULES.md#r08-dificuldade-e-estimativa-de-leitura) | P0 | [E04-U03](#e04-u03); [E06-U03](#e06-u03). |
| [R09](./BACKEND_BUSINESS_RULES.md#r09-slugs-e-aliases-disputam-o-mesmo-namespace) | P0 | [E05-I02](#e05-i02)/[I03](#e05-i03); [E07-I03](#e07-i03); [E09-I02](#e09-i02). |
| [R10](./BACKEND_BUSINESS_RULES.md#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita) | P0 | [E07-U01](#e07-u01)/[U02](#e07-u02)/[I01](#e07-i01)/[I02](#e07-i02)/[I03](#e07-i03); [E16-I02](#e16-i02). |
| [R11](./BACKEND_BUSINESS_RULES.md#r11-cat%C3%A1logo-real-e-markdown-seguro) | P0 | [E06-U01](#e06-u01)/[U02](#e06-u02)/[U03](#e06-u03)/[I01](#e06-i01); [E10-U02](#e10-u02)/[I02](#e10-i02). |
| [R12](./BACKEND_BUSINESS_RULES.md#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita) | P0 | [E07-U01](#e07-u01)/[U02](#e07-u02)/[I02](#e07-i02); [E12-I01](#e12-i01). |
| [R13](./BACKEND_BUSINESS_RULES.md#r13-visibilidade-por-locale-sem-fallback-silencioso) | P0 | [E08-U01](#e08-u01)/[I01](#e08-i01); [E09-U01](#e09-u01)/[I01](#e09-i01)/[I02](#e09-i02); [E18-I02](#e18-i02). |
| [R14](./BACKEND_BUSINESS_RULES.md#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas) | P0 | [E08-I02](#e08-i02)/[I03](#e08-i03); [E09-U01](#e09-u01)/[I01](#e09-i01); [E23-U01](#e23-u01)/[I01](#e23-i01). |
| [R15](./BACKEND_BUSINESS_RULES.md#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o) | P0 | [E09-U02](#e09-u02)/[I02](#e09-i02); [E10-U01](#e10-u01)/[U02](#e10-u02)/[I02](#e10-i02); [E18-I03](#e18-i03). |
| [R16](./BACKEND_BUSINESS_RULES.md#r16-snapshot-consistente-e-release-verific%C3%A1vel) | P0 | [E10-I01](#e10-i01)/[I02](#e10-i02); [E12-I01](#e12-i01)/[I03](#e12-i03); [E24-I02](#e24-i02). |
| [R17](./BACKEND_BUSINESS_RULES.md#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release) | P0 | [E11-I01](#e11-i01)/[I02](#e11-i02); [E12-I01](#e12-i01)/[I02](#e12-i02)/[I03](#e12-i03). |
| [R18](./BACKEND_BUSINESS_RULES.md#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos) | P0 | [E12-I03](#e12-i03) checklist de evidências; [E19-I01](#e19-i01) verifica preservação separada de autoria. |
| [R19](./BACKEND_BUSINESS_RULES.md#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email) | P1 | [E13-I01](#e13-i01); [E14-U01](#e14-u01)/[I02](#e14-i02); [E21-I02](#e21-i02). |
| [R20](./BACKEND_BUSINESS_RULES.md#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas) | P1 | [E13-U01](#e13-u01)/[I02](#e13-i02); [E14-U02](#e14-u02)/[I01](#e14-i01)/[I02](#e14-i02); [E15-I02](#e15-i02). |
| [R21](./BACKEND_BUSINESS_RULES.md#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado) | P1 | [E14-U01](#e14-u01)/[U02](#e14-u02)/[I01](#e14-i01)/[I02](#e14-i02). |
| [R22](./BACKEND_BUSINESS_RULES.md#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio) | P1 | [E15-U01](#e15-u01)/[I01](#e15-i01)/[I02](#e15-i02); [E17-U01](#e17-u01)/[I02](#e17-i02); [E19-I01](#e19-i01). |
| [R23](./BACKEND_BUSINESS_RULES.md#r23-limites-de-abuso-por-capacidade) | P1 | [E15-U02](#e15-u02)/[I01](#e15-i01); [E20-I02](#e20-i02). |
| [R24](./BACKEND_BUSINESS_RULES.md#r24-curtida-%C3%BAnica-e-idempotente-por-artigo) | P1 | [E16-U01](#e16-u01)/[I01](#e16-i01)/[I02](#e16-i02). |
| [R25](./BACKEND_BUSINESS_RULES.md#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente) | P1 | [E17-U02](#e17-u02)/[U03](#e17-u03)/[I01](#e17-i01)/[I02](#e17-i02)/[I03](#e17-i03); [E18-I03](#e18-i03). |
| [R26](./BACKEND_BUSINESS_RULES.md#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria) | P1 | [E17-U01](#e17-u01)/[I01](#e17-i01)/[I02](#e17-i02)/[I03](#e17-i03); [E22-I01](#e22-i01). |
| [R27](./BACKEND_BUSINESS_RULES.md#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana) | P1 | [E17-U03](#e17-u03)/[I03](#e17-i03); [E20-I01](#e20-i01). |
| [R28](./BACKEND_BUSINESS_RULES.md#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico) | P1 | [E18-U01](#e18-u01)/[I01](#e18-i01)/[I02](#e18-i02); [E19-I03](#e19-i03). |
| [R29](./BACKEND_BUSINESS_RULES.md#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos) | P1 | [E18-U02](#e18-u02)/[I02](#e18-i02)/[I03](#e18-i03); [E19-I03](#e19-i03); [E20-I01](#e20-i01). |
| [R30](./BACKEND_BUSINESS_RULES.md#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas) | P1 | [E19-U01](#e19-u01)/[I01](#e19-i01)/[I03](#e19-i03); [E21-I02](#e21-i02); [E22-I02](#e22-i02). |
| [R31](./BACKEND_BUSINESS_RULES.md#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis) | P1 | [E19-U01](#e19-u01)/[U02](#e19-u02)/[I02](#e19-i02)/[I03](#e19-i03); [E20-I02](#e20-i02); [E25-I01](#e25-i01)/[I02](#e25-i02). |
| [R32](./BACKEND_BUSINESS_RULES.md#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana) | P1 | [E20-U01](#e20-u01)/[I01](#e20-i01)/[I02](#e20-i02). |
| [R33](./BACKEND_BUSINESS_RULES.md#r33-conta-pr%C3%B3pria-exige-ciclo-completo) | P2 | [E21-U01](#e21-u01)/[U02](#e21-u02)/[I01](#e21-i01)/[I02](#e21-i02). |
| [R34](./BACKEND_BUSINESS_RULES.md#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos) | P2 | [E21-U02](#e21-u02)/[I01](#e21-i01)/[I02](#e21-i02). |
| [R35](./BACKEND_BUSINESS_RULES.md#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um) | P2 | [E22-U01](#e22-u01)/[I01](#e22-i01). |
| [R36](./BACKEND_BUSINESS_RULES.md#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos) | P2 | [E22-U01](#e22-u01)/[U02](#e22-u02)/[I02](#e22-i02). |
| [R37](./BACKEND_BUSINESS_RULES.md#r37-busca-localizada-e-relacionados-reais) | P2 | [E23-U01](#e23-u01)/[I01](#e23-i01)/[I02](#e23-i02). |
| [R38](./BACKEND_BUSINESS_RULES.md#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial) | P2 | [E24-U01](#e24-u01)/[U02](#e24-u02)/[I01](#e24-i01)/[I02](#e24-i02). |
| [R39](./BACKEND_BUSINESS_RULES.md#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria) | P2 | [E25-U01](#e25-u01)/[I01](#e25-i01)/[I02](#e25-i02). |
| [R40](./BACKEND_BUSINESS_RULES.md#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) | P2 | [E26-U01](#e26-u01)/[I01](#e26-i01)/[I02](#e26-i02)/[I03](#e26-i03). |

Regressões de evolução: [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) adiciona credenciais aos testes lifecycle [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o); [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) amplia comments [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) e lifecycle; [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) conserva paginação/visibilidade [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados)/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples); [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) conserva publicação [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) e snapshot [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site); [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) conserva export [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o); [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) conserva suites de qualquer adapter substituído. Regras opcionais sem gatilho não são testes ignorados de uma feature habilitada: a própria capacidade permanece não implementada/desabilitada.
