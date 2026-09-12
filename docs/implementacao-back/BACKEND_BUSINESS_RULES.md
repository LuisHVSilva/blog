# Regras de negócio e decisões aplicáveis ao backend

[Comece aqui — guia de leitura e execução](./00_COMECE_AQUI.md)

<!-- navigation:index:start -->
**Navegação:** [Ordem de implementação](./BACKEND_IMPLEMENTATION_ORDER.md) · [Plano detalhado](./BACKEND_IMPLEMENTATION_PLAN.md) · [Estrutura de arquivos](./BACKEND_IMPLEMENTATION_STRUCTURE.md) · **Regras de negócio** · [Plano de testes](./BACKEND_TEST_PLAN.md)

[Arquitetura de referência](./BACKEND_ARCHITECTURE.md)

<a id="indice"></a>

## Índice

- [Operação e fronteiras](#opera%C3%A7%C3%A3o-e-fronteiras)
  - [R01. Instalação, credenciais e artefato reproduzível](#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel)
  - [R02. Disponibilidade e encerramento honestos](#r02-disponibilidade-e-encerramento-honestos)
  - [R03. Entrada estrita, erro estável e log mínimo](#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo)
  - [R04. Schema versionado e transação explícita](#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita)
- [Publicação](#publica%C3%A7%C3%A3o)
  - [R05. Identidade do artigo e traduções estáveis](#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis)
  - [R06. Estados, primeira publicação e revisões](#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es)
  - [R07. Série localizada e navegação pela lista visível](#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel)
  - [R08. Dificuldade e estimativa de leitura](#r08-dificuldade-e-estimativa-de-leitura)
  - [R09. Slugs e aliases disputam o mesmo namespace](#r09-slugs-e-aliases-disputam-o-mesmo-namespace)
  - [R10. Git único, import idempotente e retirada explícita](#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita)
  - [R11. Catálogo real e Markdown seguro](#r11-cat%C3%A1logo-real-e-markdown-seguro)
  - [R12. Operador e efeitos auditáveis de escrita](#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita)
- [Leitura pública](#leitura-p%C3%BAblica)
  - [R13. Visibilidade por locale sem fallback silencioso](#r13-visibilidade-por-locale-sem-fallback-silencioso)
  - [R14. Paginação e busca limitadas e determinísticas](#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas)
  - [R15. URLs, metadata e cache representam a tradução](#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o)
- [Publicação e operação](#publica%C3%A7%C3%A3o-e-opera%C3%A7%C3%A3o)
  - [R16. Snapshot consistente e release verificável](#r16-snapshot-consistente-e-release-verific%C3%A1vel)
- [Operação e fronteiras](#opera%C3%A7%C3%A3o-e-fronteiras-1)
  - [R17. Deploy e recuperação são parte do release](#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release)
  - [R18. Direitos editoriais e responsáveis explícitos](#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos)
- [Identidade](#identidade)
  - [R19. GitHub estável e vínculo sem merge por email](#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email)
  - [R20. Sessão opaca, expiração e revogação imediatas](#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas)
  - [R21. OAuth de uso único e CSRF vinculado](#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado)
- [Autorização](#autoriza%C3%A7%C3%A3o)
  - [R22. Negação por padrão, ownership e bloqueio](#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio)
  - [R23. Limites de abuso por capacidade](#r23-limites-de-abuso-por-capacidade)
- [Comunidade](#comunidade)
  - [R24. Curtida única e idempotente por artigo](#r24-curtida-%C3%BAnica-e-idempotente-por-artigo)
  - [R25. Comentário pertence à tradução e nasce pendente](#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente)
  - [R26. Edição, moderação e remoção preservam autoria](#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria)
  - [R27. Denúncia única aberta e decisão humana](#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana)
- [Métricas](#m%C3%A9tricas)
  - [R28. View qualificada estimada com dedupe atômico](#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico)
  - [R29. Stats verdadeiras com escopo e início públicos](#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos)
- [Privacidade](#privacidade)
  - [R30. Exclusão efetiva com bloqueio de escritas](#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas)
  - [R31. Exportação e retenção executáveis](#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis)
- [Operação comunitária](#opera%C3%A7%C3%A3o-comunit%C3%A1ria)
  - [R32. Habilitação depende de capacidade humana](#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana)
- [Identidade futura](#identidade-futura)
  - [R33. Conta própria exige ciclo completo](#r33-conta-pr%C3%B3pria-exige-ciclo-completo)
  - [R34. Tokens de confirmação/reset são restritos e únicos](#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos)
- [Discussão futura](#discuss%C3%A3o-futura)
  - [R35. Respostas têm profundidade máxima um](#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um)
- [Aprendizagem futura](#aprendizagem-futura)
  - [R36. Progresso explícito e grafo sem ciclos](#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos)
- [Descoberta futura](#descoberta-futura)
  - [R37. Busca localizada e relacionados reais](#r37-busca-localizada-e-relacionados-reais)
- [Publicação futura](#publica%C3%A7%C3%A3o-futura)
  - [R38. Colaboração mantém única autoridade editorial](#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial)
- [Privacidade futura](#privacidade-futura)
  - [R39. Entrega automática continua privada e temporária](#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria)
- [Escala futura](#escala-futura)
  - [R40. Mudança de infraestrutura preserva semântica](#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica)
- [Complementos normativos do mesmo catálogo](#complementos-normativos-do-mesmo-cat%C3%A1logo)
<!-- navigation:index:end -->

Data: 09/09/2026. Fonte principal: [arquitetura](./BACKEND_ARCHITECTURE.md); estado atual e contratos concretos em [plano](./BACKEND_IMPLEMENTATION_PLAN.md). Este catálogo centraliza regras P0/P1/P2, incluindo restrições e exceções.

**Proveniência:** [REGRA EXPLÍCITA] vem da arquitetura; [REGRA INFERIDA] fecha uma necessidade inevitável e informa motivo; [DECISÃO TÉCNICA] define mecanismo/parâmetro sem fingir ser regra de negócio. Quando uma regra mistura requisito e mecanismo, a origem explica a distinção. Defaults propostos dependentes do mantenedor não são fatos de produção nem prazos legais.

| Regra | Domínio | Fase | Etapas |
| --- | --- | --- | --- |
| [R01](#r01-instala%C3%A7%C3%A3o-credenciais-e-artefato-reproduz%C3%ADvel) — Instalação, credenciais e artefato reproduzível | Operação e fronteiras | Para publicar | [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente), [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) |
| [R02](#r02-disponibilidade-e-encerramento-honestos) — Disponibilidade e encerramento honestos | Operação e fronteiras | Para publicar | [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) |
| [R03](#r03-entrada-estrita-erro-est%C3%A1vel-e-log-m%C3%ADnimo) — Entrada estrita, erro estável e log mínimo | Operação e fronteiras | Para publicar | [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) |
| [R04](#r04-schema-versionado-e-transa%C3%A7%C3%A3o-expl%C3%ADcita) — Schema versionado e transação explícita | Operação e fronteiras | Para publicar | [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) |
| [R05](#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis) — Identidade do artigo e traduções estáveis | Publicação | Para publicar | [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) |
| [R06](#r06-estados-primeira-publica%C3%A7%C3%A3o-e-revis%C3%B5es) — Estados, primeira publicação e revisões | Publicação | Para publicar | [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) |
| [R07](#r07-s%C3%A9rie-localizada-e-navega%C3%A7%C3%A3o-pela-lista-vis%C3%ADvel) — Série localizada e navegação pela lista visível | Publicação | Para publicar | [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) |
| [R08](#r08-dificuldade-e-estimativa-de-leitura) — Dificuldade e estimativa de leitura | Publicação | Para publicar | [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) |
| [R09](#r09-slugs-e-aliases-disputam-o-mesmo-namespace) — Slugs e aliases disputam o mesmo namespace | Publicação | Para publicar | [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) |
| [R10](#r10-git-%C3%BAnico-import-idempotente-e-retirada-expl%C3%ADcita) — Git único, import idempotente e retirada explícita | Publicação | Para publicar | [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) |
| [R11](#r11-cat%C3%A1logo-real-e-markdown-seguro) — Catálogo real e Markdown seguro | Publicação | Para publicar | [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) |
| [R12](#r12-operador-e-efeitos-audit%C3%A1veis-de-escrita) — Operador e efeitos auditáveis de escrita | Publicação | Para publicar | [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) |
| [R13](#r13-visibilidade-por-locale-sem-fallback-silencioso) — Visibilidade por locale sem fallback silencioso | Leitura pública | Para publicar | [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) |
| [R14](#r14-pagina%C3%A7%C3%A3o-e-busca-limitadas-e-determin%C3%ADsticas) — Paginação e busca limitadas e determinísticas | Leitura pública | Para publicar | [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) |
| [R15](#r15-urls-metadata-e-cache-representam-a-tradu%C3%A7%C3%A3o) — URLs, metadata e cache representam a tradução | Leitura pública | Para publicar | [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) |
| [R16](#r16-snapshot-consistente-e-release-verific%C3%A1vel) — Snapshot consistente e release verificável | Publicação e operação | Para publicar | [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) |
| [R17](#r17-deploy-e-recupera%C3%A7%C3%A3o-s%C3%A3o-parte-do-release) — Deploy e recuperação são parte do release | Operação e fronteiras | Para publicar | [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) |
| [R18](#r18-direitos-editoriais-e-respons%C3%A1veis-expl%C3%ADcitos) — Direitos editoriais e responsáveis explícitos | Operação e fronteiras | Para publicar | [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) |
| [R19](#r19-github-est%C3%A1vel-e-v%C3%ADnculo-sem-merge-por-email) — GitHub estável e vínculo sem merge por email | Identidade | Após publicação | [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es), [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) |
| [R20](#r20-sess%C3%A3o-opaca-expira%C3%A7%C3%A3o-e-revoga%C3%A7%C3%A3o-imediatas) — Sessão opaca, expiração e revogação imediatas | Identidade | Após publicação | [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es), [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) |
| [R21](#r21-oauth-de-uso-%C3%BAnico-e-csrf-vinculado) — OAuth de uso único e CSRF vinculado | Identidade | Após publicação | [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) |
| [R22](#r22-nega%C3%A7%C3%A3o-por-padr%C3%A3o-ownership-e-bloqueio) — Negação por padrão, ownership e bloqueio | Autorização | Após publicação | [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) |
| [R23](#r23-limites-de-abuso-por-capacidade) — Limites de abuso por capacidade | Autorização | Após publicação | [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) |
| [R24](#r24-curtida-%C3%BAnica-e-idempotente-por-artigo) — Curtida única e idempotente por artigo | Comunidade | Após publicação | [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) |
| [R25](#r25-coment%C3%A1rio-pertence-%C3%A0-tradu%C3%A7%C3%A3o-e-nasce-pendente) — Comentário pertence à tradução e nasce pendente | Comunidade | Após publicação | [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) |
| [R26](#r26-edi%C3%A7%C3%A3o-modera%C3%A7%C3%A3o-e-remo%C3%A7%C3%A3o-preservam-autoria) — Edição, moderação e remoção preservam autoria | Comunidade | Após publicação | [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) |
| [R27](#r27-den%C3%BAncia-%C3%BAnica-aberta-e-decis%C3%A3o-humana) — Denúncia única aberta e decisão humana | Comunidade | Após publicação | [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) |
| [R28](#r28-view-qualificada-estimada-com-dedupe-at%C3%B4mico) — View qualificada estimada com dedupe atômico | Métricas | Após publicação | [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) |
| [R29](#r29-stats-verdadeiras-com-escopo-e-in%C3%ADcio-p%C3%BAblicos) — Stats verdadeiras com escopo e início públicos | Métricas | Após publicação | [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) |
| [R30](#r30-exclus%C3%A3o-efetiva-com-bloqueio-de-escritas) — Exclusão efetiva com bloqueio de escritas | Privacidade | Após publicação | [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) |
| [R31](#r31-exporta%C3%A7%C3%A3o-e-reten%C3%A7%C3%A3o-execut%C3%A1veis) — Exportação e retenção executáveis | Privacidade | Após publicação | [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) |
| [R32](#r32-habilita%C3%A7%C3%A3o-depende-de-capacidade-humana) — Habilitação depende de capacidade humana | Operação comunitária | Após publicação | [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) |
| [R33](#r33-conta-pr%C3%B3pria-exige-ciclo-completo) — Conta própria exige ciclo completo | Identidade futura | Evolução futura | [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) |
| [R34](#r34-tokens-de-confirma%C3%A7%C3%A3oreset-s%C3%A3o-restritos-e-%C3%BAnicos) — Tokens de confirmação/reset são restritos e únicos | Identidade futura | Evolução futura | [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) |
| [R35](#r35-respostas-t%C3%AAm-profundidade-m%C3%A1xima-um) — Respostas têm profundidade máxima um | Discussão futura | Evolução futura | [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) |
| [R36](#r36-progresso-expl%C3%ADcito-e-grafo-sem-ciclos) — Progresso explícito e grafo sem ciclos | Aprendizagem futura | Evolução futura | [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) |
| [R37](#r37-busca-localizada-e-relacionados-reais) — Busca localizada e relacionados reais | Descoberta futura | Evolução futura | [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) |
| [R38](#r38-colabora%C3%A7%C3%A3o-mant%C3%A9m-%C3%BAnica-autoridade-editorial) — Colaboração mantém única autoridade editorial | Publicação futura | Evolução futura | [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) |
| [R39](#r39-entrega-autom%C3%A1tica-continua-privada-e-tempor%C3%A1ria) — Entrega automática continua privada e temporária | Privacidade futura | Evolução futura | [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) |
| [R40](#r40-mudan%C3%A7a-de-infraestrutura-preserva-sem%C3%A2ntica) — Mudança de infraestrutura preserva semântica | Escala futura | Evolução futura | [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) |

<!-- navigation:anchor:start -->
<a id="nav-section-001"></a>
<!-- navigation:anchor:end -->

## Operação e fronteiras

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r01"></a>

### R01. Instalação, credenciais e artefato reproduzível

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Instalação, credenciais e artefato reproduzível.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§2,15,18,21.

**Descrição:** Segredos não entram no Git/contexto/imagem/frontend; dependências são instaladas por lockfile e produção executa JS compilado com usuário não root. Correções já presentes são mantidas.

**Entrada:** Checkout, lockfile, variáveis injetadas e imagem.

**Resultado esperado:** Build executável, scripts reais e nenhum segredo no artefato.

**Restrições:** Não expor socket Docker, .env ou VITE_* com secrets. Não usar teste vazio como sucesso.

**Exceções:** Defaults públicos só para ambiente local; rotação apenas quando exposição confirmada.

**Casos inválidos:** Alias só resolvido por tsx em produção; migration/script ausente; segredo rastreado.

**Onde a regra será aplicada:** [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente) tooling, [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) imagem, [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) CI e operação. Arquivos e responsabilidade detalhados em [E01](./BACKEND_IMPLEMENTATION_PLAN.md#e01-tornar-execut%C3%A1veis-os-comandos-e-preservar-a-base-existente), [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**Como será testada:** [E01-U01](./BACKEND_TEST_PLAN.md#e01-u01)/[U02](./BACKEND_TEST_PLAN.md#e01-u02)/[I01](./BACKEND_TEST_PLAN.md#e01-i01)/[I02](./BACKEND_TEST_PLAN.md#e01-i02); [E11-I01](./BACKEND_TEST_PLAN.md#e11-i01)/[I02](./BACKEND_TEST_PLAN.md#e11-i02); [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r02"></a>

### R02. Disponibilidade e encerramento honestos

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Disponibilidade e encerramento honestos.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§2,18,20.

**Descrição:** Live mede processo; ready mede banco com prazo e estado de encerramento. Conectar antes de escutar; erro fatal encerra; sinais drenam com timeout.

**Entrada:** Startup, falha DB, request health, SIGTERM/SIGINT e falha fatal.

**Resultado esperado:** Live 200; ready 200/503; stop fecha listener/pool; fatal/startup falho sai 1.

**Restrições:** Ready não expõe ambiente/owners e não fica UP durante shutdown. Deadline 1s health e 10s shutdown são parâmetros técnicos.

**Exceções:** Live pode estar UP com DB DOWN.

**Casos inválidos:** Swallow de conexão, listener ativo após fatal, await sem prazo.

**Onde a regra será aplicada:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) main/app/health/process-handlers; [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) Database. Arquivos e responsabilidade detalhados em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida).

**Como será testada:** [E02-U01](./BACKEND_TEST_PLAN.md#e02-u01)/[I01](./BACKEND_TEST_PLAN.md#e02-i01)/[I02](./BACKEND_TEST_PLAN.md#e02-i02); [E03-I02](./BACKEND_TEST_PLAN.md#e03-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r03"></a>

### R03. Entrada estrita, erro estável e log mínimo

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Entrada estrita, erro estável e log mínimo.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§9,15,20.

**Descrição:** Toda borda valida formato/tamanho; erro público contém code/message/fields seguros e requestId validado. Log é JSON com rota normalizada/status/duração, sem query/body/credenciais.

**Entrada:** Headers, path/query/body e exceções de aplicação/infra.

**Resultado esperado:** 400 formato,401 sessão,403 permissão,404 invisível,409 conflito,413 tamanho,415 tipo,422 negócio,429 limite,500 inesperado,503 dependência.

**Restrições:** UUID substitui requestId fora do formato; logger não bloqueia resposta; headersSent usa next. Limites e allowlists em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida)/[E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

**Exceções:** Stack apenas diagnóstico restrito redigido; fields não ecoa valor sensível.

**Casos inválidos:** Mass assignment, SQL/stack no cliente, requestId arbitrário, CORS antes de correlação.

**Onde a regra será aplicada:** [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida) HTTP; [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) schemas/OpenAPI; todos adapters posteriores. Arquivos e responsabilidade detalhados em [E02](./BACKEND_IMPLEMENTATION_PLAN.md#e02-separar-composi%C3%A7%C3%A3o-http-configura%C3%A7%C3%A3o-e-ciclo-de-vida), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

**Como será testada:** [E02-U02](./BACKEND_TEST_PLAN.md#e02-u02)/[U03](./BACKEND_TEST_PLAN.md#e02-u03)/[I01](./BACKEND_TEST_PLAN.md#e02-i01); [E09-U01](./BACKEND_TEST_PLAN.md#e09-u01)/[I01](./BACKEND_TEST_PLAN.md#e09-i01)/[I03](./BACKEND_TEST_PLAN.md#e09-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r04"></a>

### R04. Schema versionado e transação explícita

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Schema versionado e transação explícita.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§3,5,17.

**Descrição:** Migration aplicada uma vez com versão/checksum; app não executa sync ou DDL. Persistência e testes usam PostgreSQL da major alvo. Operações atômicas compartilham a mesma conexão/transação.

**Entrada:** Banco vazio/versão anterior e migrations ordenadas.

**Resultado esperado:** Schema compatível, controle junto do DDL e falha sem migração parcial.

**Restrições:** Não editar versão aplicada; não testar constraint com SQLite/mock. Migrations P1/P2 não antecipadas no P0.

**Exceções:** Rollback destrutivo não obrigatório; preferir correção para frente e expand/contract.

**Casos inválidos:** DDL pela API, jobs migrando concorrentes sem lock, teste em banco produção.

**Onde a regra será aplicada:** [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations) runner/Database; [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) e migrations seguintes. Arquivos e responsabilidade detalhados em [E03](./BACKEND_IMPLEMENTATION_PLAN.md#e03-conex%C3%A3o-postgresql-e-executor-de-migrations), [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis).

**Como será testada:** [E03-U01](./BACKEND_TEST_PLAN.md#e03-u01)/[I01](./BACKEND_TEST_PLAN.md#e03-i01)/[I02](./BACKEND_TEST_PLAN.md#e03-i02); [E05-I01](./BACKEND_TEST_PLAN.md#e05-i01)/[I03](./BACKEND_TEST_PLAN.md#e05-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-002"></a>
<!-- navigation:anchor:end -->

## Publicação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r05"></a>

### R05. Identidade do artigo e traduções estáveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Identidade do artigo e traduções estáveis.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§5–6.

**Descrição:** Article compartilha autor/tags/dificuldade/séries entre idiomas; tradução possui UUID próprio e conteúdo/status/datas/slug locais. Todo artigo nasce com tradução sourceLocale na mesma transação.

**Entrada:** Manifesto com articleId, translationId, sourceLocale e locale.

**Resultado esperado:** Um artigo por conceito, uma tradução por artigo/locale, UUID persistido entre imports.

**Restrições:** UUID não derivado de título/slug; sourceLocale precisa de tradução; locales iniciais pt-BR/en, texto extensível sem enum SQL fechado.

**Exceções:** sourceLocale pt-BR para os quatro pares é inferência editorial adotada em [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), não fato documental de autoria.

**Casos inválidos:** Recriar UUID em cada import, duplicar artigo por idioma, criar pai sem origem.

**Onde a regra será aplicada:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) article.ts, [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) schema/trigger, [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) manifesto, [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) store. Arquivos e responsabilidade detalhados em [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

**Como será testada:** [E04-U01](./BACKEND_TEST_PLAN.md#e04-u01); [E05-I01](./BACKEND_TEST_PLAN.md#e05-i01)/[I02](./BACKEND_TEST_PLAN.md#e05-i02); [E06-I01](./BACKEND_TEST_PLAN.md#e06-i01); [E07-I01](./BACKEND_TEST_PLAN.md#e07-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r06"></a>

### R06. Estados, primeira publicação e revisões

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Estados, primeira publicação e revisões.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§6,8.

**Descrição:** Tradução draft/published/archived publica independentemente quando revisada e válida. Preservar primeira publishedAt ao corrigir ou republicar; updatedAt muda só em alteração editorial. Revisão original diferente da traduzida gera aviso editorial, sem despublicar automaticamente.

**Entrada:** Tradução, operação explícita, expectedRevision e now.

**Resultado esperado:** Transição conforme tabela de [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o)/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente), erro semântico para inválida; edição auditada.

**Restrições:** Pai arquivado impede publicar; título/corpo/metadata válidos; data futura não agenda. Restore archived→draft é explícito.

**Exceções:** Data histórica requer metadado revisado; correção crítica exige revisão/aviso editorial das traduções.

**Casos inválidos:** Publicar vazio, regredir publishedAt, publicar por timestamp futuro, reaplicar retry alterando datas.

**Onde a regra será aplicada:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) publication-policy; [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) publish/unpublish/archive; [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) evolui candidato de release. Arquivos e responsabilidade detalhados em [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Como será testada:** [E04-U01](./BACKEND_TEST_PLAN.md#e04-u01); [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01)/[I01](./BACKEND_TEST_PLAN.md#e07-i01)/[I03](./BACKEND_TEST_PLAN.md#e07-i03); [E24-U02](./BACKEND_TEST_PLAN.md#e24-u02)/[I02](./BACKEND_TEST_PLAN.md#e24-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r07"></a>

### R07. Série localizada e navegação pela lista visível

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Série localizada e navegação pela lista visível.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§5,7.

**Descrição:** Série global e apresentação localizada devem estar publicadas. Membros N:N têm posição positiva única por série. Listagem, count e anterior/próximo usam apenas traduções publicadas de artigos ativos no locale.

**Entrada:** seriesId/slug, locale e artigo de contexto opcional.

**Resultado esperado:** Ordem editorial preservada; lacunas indicadas sem nomes/IDs de drafts; count igual ao número de membros visíveis.

**Restrições:** Membro não repetido; múltiplas séries permitidas; contexto não muda canonical.

**Exceções:** Série publicada vazia permitida pelo plano com count=0; posições podem ter lacunas.

**Casos inválidos:** Posição 0/duplicada, link para draft, contar membros sem tradução, contexto de outra série.

**Onde a regra será aplicada:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) series.ts, [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) schema, [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) get-series/reader. Arquivos e responsabilidade detalhados em [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados).

**Como será testada:** [E04-U02](./BACKEND_TEST_PLAN.md#e04-u02); [E05-I03](./BACKEND_TEST_PLAN.md#e05-i03); [E08-U02](./BACKEND_TEST_PLAN.md#e08-u02)/[I01](./BACKEND_TEST_PLAN.md#e08-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r08"></a>

### R08. Dificuldade e estimativa de leitura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Dificuldade e estimativa de leitura.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§7,19; fórmula é [DECISÃO TÉCNICA] do plano.

**Descrição:** Dificuldade editorial foundational/intermediate/advanced é compartilhada entre idiomas e independente do tempo. Leitura estimada usa texto extraído do AST e 200 palavras/minuto, mínimo 1.

**Entrada:** Nível revisado e texto Markdown parseado.

**Resultado esperado:** readingMinutes inteiro >=1 por tradução; código textual conta, sintaxe/frontmatter/destinos URL não.

**Restrições:** Não inferir nível de duração ou tamanho. foundational pressupõe introdução, intermediate familiaridade com fundamentos, advanced aprofundamento com pré-requisitos explícitos.

**Exceções:** Texto vazio tem estimativa mínima apenas como função; publicação vazia segue proibida.

**Casos inválidos:** Contar frontmatter como leitura, valor fracionário/negativo, dificuldade livre.

**Onde a regra será aplicada:** [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o) reading-time; [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) parser/metadados. Arquivos e responsabilidade detalhados em [E04](./BACKEND_IMPLEMENTATION_PLAN.md#e04-definir-dom%C3%ADnio-editorial-e-contratos-de-aplica%C3%A7%C3%A3o), [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial).

**Como será testada:** [E04-U03](./BACKEND_TEST_PLAN.md#e04-u03); [E06-U03](./BACKEND_TEST_PLAN.md#e06-u03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r09"></a>

### R09. Slugs e aliases disputam o mesmo namespace

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Slugs e aliases disputam o mesmo namespace.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§5–6.

**Descrição:** Slug é segmento canônico e único por locale mesmo draft. Mudança após publicação preserva alias; unicidade inclui aliases e caminhos atuais transacionalmente.

**Entrada:** translationId, locale, novo slug e revisão esperada.

**Resultado esperado:** Slug livre vira atual; antigo publicado redireciona diretamente para alvo público; conflito gera SLUG_CONFLICT sem efeitos.

**Restrições:** Não reutilizar alias de outra tradução; resolver alias privado dá 404; fonte P0 é article_paths com PK(locale,slug).

**Exceções:** Mesmo slug em locales diferentes permitido. Nunca publicado pode liberar slug antigo.

**Casos inválidos:** Duas tabelas independentes permitindo alias A colidir com slug B; cadeia/ciclo de redirect.

**Onde a regra será aplicada:** [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs) paths/trigger, [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) publication-store, [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) reader e [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) HTTP. Arquivos e responsabilidade detalhados em [E05](./BACKEND_IMPLEMENTATION_PLAN.md#e05-criar-schema-editorial-constraints-e-namespace-de-slugs), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Como será testada:** [E05-I02](./BACKEND_TEST_PLAN.md#e05-i02)/[I03](./BACKEND_TEST_PLAN.md#e05-i03); [E07-I03](./BACKEND_TEST_PLAN.md#e07-i03); [E09-I02](./BACKEND_TEST_PLAN.md#e09-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r10"></a>

### R10. Git único, import idempotente e retirada explícita

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Git único, import idempotente e retirada explícita.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§8,17.

**Descrição:** Git/Markdown é fonte editorial; DB é projeção. Import não sobrescreve contas/interações e não apaga arquivo omitido. Reimport da mesma revisão/hash é no-op; mudança CAS concorrente falha integralmente.

**Entrada:** Edition validada, operador, revisão base e dryRun.

**Resultado esperado:** Diff seguro ou commit atômico de toda edição, IDs preservados e resultado changed explícito.

**Restrições:** Publicação CLI protegida; expectedRevision obrigatória fora do banco vazio; mesma revisão/hash diferente conflita; dryRun zero writes.

**Exceções:** Unpublish/archive emergencial deve ser refletido no Git antes do próximo import. P2 painel propõe PR, sem segunda autoridade.

**Casos inválidos:** DELETE físico por ausência de arquivo, import parcial, frontend com token operacional.

**Onde a regra será aplicada:** [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) validação, [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) import/store/CLI, [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) proposta editorial. Arquivos e responsabilidade detalhados em [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Como será testada:** [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01)/[U02](./BACKEND_TEST_PLAN.md#e07-u02)/[I01](./BACKEND_TEST_PLAN.md#e07-i01)/[I02](./BACKEND_TEST_PLAN.md#e07-i02)/[I03](./BACKEND_TEST_PLAN.md#e07-i03); [E16-I02](./BACKEND_TEST_PLAN.md#e16-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r11"></a>

### R11. Catálogo real e Markdown seguro

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Catálogo real e Markdown seguro.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§8,15,17; normalização do acervo observada no código.

**Descrição:** Importar quatro pares reais e duas séries com autoria revisada, tags canônicas e conteúdo preservado. YAML/Markdown/paths são dados não confiáveis; sem MDX, execução ou fetch remoto.

**Entrada:** Oito arquivos atuais, catálogo, assets e links.

**Resultado esperado:** Conteúdo normalizado, diagnóstico por arquivo/campo e snapshot sem placeholders.

**Restrições:** UUID gravados; títulos H1 normalizados fora de fences; tags sinônimas mapeadas explicitamente; links internos públicos resolvidos. Limites 512KiB/arquivo,10MiB/lote são técnicos.

**Exceções:** Preview privado pode referenciar draft; sem publicar URLs inexistentes. Não inventar autoria/datas/licença.

**Casos inválidos:** Fallback silencioso para TSConfig, traversal/symlink externo, HTML ativo/JS URL, placeholders públicos.

**Onde a regra será aplicada:** [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) parser/validate-content, [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) renderer/snapshot. Arquivos e responsabilidade detalhados em [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

**Como será testada:** [E06-U01](./BACKEND_TEST_PLAN.md#e06-u01)/[U02](./BACKEND_TEST_PLAN.md#e06-u02)/[U03](./BACKEND_TEST_PLAN.md#e06-u03)/[I01](./BACKEND_TEST_PLAN.md#e06-i01); [E10-U02](./BACKEND_TEST_PLAN.md#e10-u02)/[I02](./BACKEND_TEST_PLAN.md#e10-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r12"></a>

### R12. Operador e efeitos auditáveis de escrita

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Operador e efeitos auditáveis de escrita.

**Origem:** [REGRA INFERIDA] Arquitetura §§3,8,20 exige CLI confiável e auditoria; CAS/motivo/relatório concretizam o contrato.

**Descrição:** Toda escrita editorial registra operador e revisão, com motivo em mudanças de visibilidade. A identidade operacional vem de job/acesso protegido, nunca de payload web.

**Entrada:** Operator {kind,id,sourceRevision}, operação e expectedRevision.

**Resultado esperado:** Auditoria na transação e relatório pós-commit; falha de log não transforma commit bem-sucedido em falso rollback.

**Restrições:** Ambiente operacional deve restringir quem pode fornecer operador; parâmetro id sozinho não autentica pessoa. Sem endpoint admin P0.

**Exceções:** Teste usa operador fixture claramente local; não criar credencial padrão de produção.

**Casos inválidos:** Usuário da API enviando role/operator para publicar; falha de auditoria permitindo commit sem registro.

**Onde a regra será aplicada:** [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente) CLI/use cases/store; [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) workflow/runbook. Arquivos e responsabilidade detalhados em [E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente).

**Como será testada:** [E07-U01](./BACKEND_TEST_PLAN.md#e07-u01)/[U02](./BACKEND_TEST_PLAN.md#e07-u02)/[I02](./BACKEND_TEST_PLAN.md#e07-i02); [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-003"></a>
<!-- navigation:anchor:end -->

## Leitura pública

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r13"></a>

### R13. Visibilidade por locale sem fallback silencioso

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Visibilidade por locale sem fallback silencioso.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§6,9.

**Descrição:** Só tradução published com Article não arquivado é pública em detalhe/lista/taxonomia/alternates/snapshot. Locale desconhecido é erro; ausência naquele idioma é 404 e não substituição pelo original.

**Entrada:** Locale e slug/filtros/ID referenciado em interação.

**Resultado esperado:** DTO público ou 404 indistinguível de draft/inexistente; alternates apenas versões acessíveis.

**Restrições:** Locale normalizado via allowlist; pt-br→pt-BR, en-US rejeitado. Dados internos/conta fora do DTO.

**Exceções:** Leitura não exige login; role admin não revela draft por endpoint público.

**Casos inválidos:** By-id contornando filtro, alias apontando draft, dado privado no author.

**Onde a regra será aplicada:** [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) reader/casos, [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) routes, [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) snapshot, [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)–[E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) alvos de interação. Arquivos e responsabilidade detalhados em [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

**Como será testada:** [E08-U01](./BACKEND_TEST_PLAN.md#e08-u01)/[I01](./BACKEND_TEST_PLAN.md#e08-i01); [E09-U01](./BACKEND_TEST_PLAN.md#e09-u01)/[I01](./BACKEND_TEST_PLAN.md#e09-i01)/[I02](./BACKEND_TEST_PLAN.md#e09-i02); [E18-I02](./BACKEND_TEST_PLAN.md#e18-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r14"></a>

### R14. Paginação e busca limitadas e determinísticas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Paginação e busca limitadas e determinísticas.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §9.

**Descrição:** Lista usa page 1/limit20,max50 e sort publishedAt asc/desc com UUID como desempate. Busca P0 literal parametrizada em título/descrição; filtros localizados combinam AND.

**Entrada:** locale,page,limit,sort,tag,series,difficulty,q.

**Resultado esperado:** Resumos sem body e pagination {page,limit,total,totalPages}; filtro válido desconhecido gera vazio; page além do fim vazio.

**Restrições:** q 2..100, strings escalares, query strict; não repassar req.query ao ORM; COUNT não duplica joins.

**Exceções:** total=0 implica totalPages=0 e data=[]; client deve suportar vazio.

**Casos inválidos:** page0/NaN/limit51, sort arbitrário, SQL injection/wildcards acidentais e N+1.

**Onde a regra será aplicada:** [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados) list-articles/reader; [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) schemas; [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) evolui busca. Arquivos e responsabilidade detalhados em [E08](./BACKEND_IMPLEMENTATION_PLAN.md#e08-consultar-artigos-tags-e-s%C3%A9ries-publicados), [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples).

**Como será testada:** [E08-I02](./BACKEND_TEST_PLAN.md#e08-i02)/[I03](./BACKEND_TEST_PLAN.md#e08-i03); [E09-U01](./BACKEND_TEST_PLAN.md#e09-u01)/[I01](./BACKEND_TEST_PLAN.md#e09-i01); [E23-U01](./BACKEND_TEST_PLAN.md#e23-u01)/[I01](./BACKEND_TEST_PLAN.md#e23-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r15"></a>

### R15. URLs, metadata e cache representam a tradução

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** URLs, metadata e cache representam a tradução.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§6,9,22; TTL/ETag são [DECISÃO TÉCNICA].

**Descrição:** Canonical é URL autorizada da própria tradução; alternates recíprocos e sitemap só publicados 200. lastmod muda por revisão editorial relevante, nunca like/view/deploy. Cache público não contém estado de sessão.

**Entrada:** DTO publicado, domínio configurado, revisão e headers condicionais.

**Resultado esperado:** URLs /{locale}/articles|series|tags/{slug}, metadata coerente; ETag/304 válidos por representação.

**Restrições:** Hreflang pt-BR, OG pt_BR; tracking fora do canonical; sem x-default sem entrada neutra real. Erros/privados no-store.

**Exceções:** Override SEO revisado permitido; canonical externo exige decisão editorial específica e fica fora do import automático inicial.

**Casos inválidos:** Fallback EN→PT, metadata de draft, cache /me/CSRF, TTL indefinido de removido.

**Onde a regra será aplicada:** [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples) public-cache, [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) snapshot/renderer, [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) stats. Arquivos e responsabilidade detalhados em [E09](./BACKEND_IMPLEMENTATION_PLAN.md#e09-expor-api-rest-documentada-e-cache-http-simples), [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site).

**Como será testada:** [E09-U02](./BACKEND_TEST_PLAN.md#e09-u02)/[I02](./BACKEND_TEST_PLAN.md#e09-i02); [E10-U01](./BACKEND_TEST_PLAN.md#e10-u01)/[U02](./BACKEND_TEST_PLAN.md#e10-u02)/[I02](./BACKEND_TEST_PLAN.md#e10-i02); [E18-I03](./BACKEND_TEST_PLAN.md#e18-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-004"></a>
<!-- navigation:anchor:end -->

## Publicação e operação

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r16"></a>

### R16. Snapshot consistente e release verificável

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Snapshot consistente e release verificável.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§8,21.

**Descrição:** Exportar todo catálogo em snapshot curto consistente, fechar DB antes do build, gerar páginas/sitemap da mesma revisão e anunciar só após smoke. Banco/site podem divergir temporariamente no P0 com falha visível e retry.

**Entrada:** Revisão importada, transação read-only e build estático.

**Resultado esperado:** Artefato imutável completo; falha mantém site anterior e alerta de divergência.

**Restrições:** Não usar só página1/limite50; arquivo de saída substituído atomicamente; retirada urgente precisa API e site/edge.

**Exceções:** P2 pode introduzir ativação se janela for inaceitável; não fingir transação distribuída.

**Casos inválidos:** Snapshot misturando revisões, 73 artigos virando20, API oculta mas HTML abusivo continua indefinidamente.

**Onde a regra será aplicada:** [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site) export/build, [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) deploy/smoke, [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) ativação futura. Arquivos e responsabilidade detalhados em [E10](./BACKEND_IMPLEMENTATION_PLAN.md#e10-exportar-snapshot-e-integrar-publica%C3%A7%C3%A3o-com-o-site), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**Como será testada:** [E10-I01](./BACKEND_TEST_PLAN.md#e10-i01)/[I02](./BACKEND_TEST_PLAN.md#e10-i02); [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01)/[I03](./BACKEND_TEST_PLAN.md#e12-i03); [E24-I02](./BACKEND_TEST_PLAN.md#e24-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-005"></a>
<!-- navigation:anchor:end -->

## Operação e fronteiras

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r17"></a>

### R17. Deploy e recuperação são parte do release

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Deploy e recuperação são parte do release.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§15,18,20–21.

**Descrição:** Produção usa HTTPS/proxy conhecido, DB privado/privilégio mínimo, migration antes da API, backup fora do host e restore ensaiado. Operação recebe alertas testados e registra revisão entregue.

**Entrada:** Imagem, ambiente real, backup e procedimentos de release/restore.

**Resultado esperado:** Sistema recuperável e disponibilidade/backup/publicação monitorados.

**Restrições:** RPO/RTO propostos24h e backup diário/30d precisam aceitação e medição; volume não é backup; PR de fork não recebe secrets.

**Exceções:** Fornecedor/topologia são definidos pelo mantenedor no gate, sem bloquear desenvolvimento local.

**Casos inválidos:** Porta PG pública, API antes de migration, só copiar arquivo sem testar restore, confiar em proxy true.

**Onde a regra será aplicada:** [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis) Compose/imagem; [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) workflows/backup/runbook. Arquivos e responsabilidade detalhados em [E11](./BACKEND_IMPLEMENTATION_PLAN.md#e11-entregar-imagens-e-compose-reproduz%C3%ADveis), [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**Como será testada:** [E11-I01](./BACKEND_TEST_PLAN.md#e11-i01)/[I02](./BACKEND_TEST_PLAN.md#e11-i02); [E12-I01](./BACKEND_TEST_PLAN.md#e12-i01)/[I02](./BACKEND_TEST_PLAN.md#e12-i02)/[I03](./BACKEND_TEST_PLAN.md#e12-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r18"></a>

### R18. Direitos editoriais e responsáveis explícitos

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Direitos editoriais e responsáveis explícitos.

**Origem:** [REGRA INFERIDA] Arquitetura §§16,23–24: autoria/licença e contatos reais são decisões do mantenedor, não atributos inferíveis do código.

**Descrição:** Preservar direitos existentes e registrar escopo de código/textos/traduções/assets e contatos de segurança/privacidade antes da publicação. Não aplicar licença frontend automaticamente ao backend.

**Entrada:** Licenças existentes, autores/terceiros e decisões do titular.

**Resultado esperado:** Política preenchida e atribuída a responsável; pendências impedem gate correspondente.

**Restrições:** Não inventar nome, email, domínio ou autorização jurídica; planejamento técnico de retenção não determina prazo legal.

**Exceções:** Crédito editorial pode sobreviver conta conforme política específica aprovada.

**Casos inválidos:** Relicenciamento silencioso, contato fictício, assumir que soft delete é exclusão suficiente.

**Onde a regra será aplicada:** [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial) revisão editorial; [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release) documentação/gate; [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) crédito pós-exclusão. Arquivos e responsabilidade detalhados em [E12](./BACKEND_IMPLEMENTATION_PLAN.md#e12-automatizar-valida%C3%A7%C3%A3o-e-fechar-opera%C3%A7%C3%A3o-do-primeiro-release).

**Como será testada:** [E12-I03](./BACKEND_TEST_PLAN.md#e12-i03) checklist de evidências; [E19-I01](./BACKEND_TEST_PLAN.md#e19-i01) verifica preservação separada de autoria. Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Para publicar (P0). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-006"></a>
<!-- navigation:anchor:end -->

## Identidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r19"></a>

### R19. GitHub estável e vínculo sem merge por email

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** GitHub estável e vínculo sem merge por email.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§10–11.

**Descrição:** OAuth identifica por providerUserId textual estável; nome é mutável e email opcional privado. Não vincular contas automaticamente por email nem reativar bloqueadas ao logar.

**Entrada:** Provider, providerUserId, perfil mínimo verificado.

**Resultado esperado:** Conta única por identidade externa, mesmo UUID após renomear; nova sessão só para ativo.

**Restrições:** Token GitHub descartado, escopos mínimos; AuthorProfile independente; cadastro não aceita role.

**Exceções:** Conta local P2 tem email necessário, sem alterar regra GitHub.

**Casos inválidos:** Identidade por username/email, dois usuários órfãos por corrida, admin por primeiro login.

**Onde a regra será aplicada:** [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) IdentityStore; [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) OAuth; [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) local auth. Arquivos e responsabilidade detalhados em [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es), [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

**Como será testada:** [E13-I01](./BACKEND_TEST_PLAN.md#e13-i01); [E14-U01](./BACKEND_TEST_PLAN.md#e14-u01)/[I02](./BACKEND_TEST_PLAN.md#e14-i02); [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r20"></a>

### R20. Sessão opaca, expiração e revogação imediatas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Sessão opaca, expiração e revogação imediatas.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §10; prazos admin/reautenticação são [DECISÃO TÉCNICA] [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es).

**Descrição:** Cookie guarda token aleatório e DB hash. Resolver verifica estado atual do usuário, absoluta/idle e revogação. Login e mudança de privilégio invalidam sessão anterior; logout revoga no DB.

**Entrada:** Token, now, Session e User atuais.

**Resultado esperado:** Ativo dentro dos prazos recebe Actor; inválido/expirado/revogado401, bloqueado sem permissão.

**Restrições:** Normal7d/24h, admin8h/30min, auth recente5min, lastSeen granular5min; cookie prod __Host Secure HttpOnly Lax Path=/ sem Domain.

**Exceções:** Dev HTTP usa nome/flags distintos apenas ambiente local; leitura pública segue sem sessão.

**Casos inválidos:** MemoryStore produção, token localStorage, senha/token puro no banco, expiração só no browser.

**Onde a regra será aplicada:** [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es) SessionPolicy/Store; [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) middleware/logout; [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) block/role. Arquivos e responsabilidade detalhados em [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es), [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

**Como será testada:** [E13-U01](./BACKEND_TEST_PLAN.md#e13-u01)/[I02](./BACKEND_TEST_PLAN.md#e13-i02); [E14-U02](./BACKEND_TEST_PLAN.md#e14-u02)/[I01](./BACKEND_TEST_PLAN.md#e14-i01)/[I02](./BACKEND_TEST_PLAN.md#e14-i02); [E15-I02](./BACKEND_TEST_PLAN.md#e15-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r21"></a>

### R21. OAuth de uso único e CSRF vinculado

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** OAuth de uso único e CSRF vinculado.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§10,15.

**Descrição:** State imprevisível, binding ao browser e PKCE S256 protegem callback; code só é trocado após consumo válido. Mutações autenticadas exigem Origin e CSRF da mesma sessão.

**Entrada:** code/state/binding, sessão, Origin, Content-Type e X-CSRF-Token.

**Resultado esperado:** Callback cria sessão nova uma vez; mutação sem prova correta não chama caso de uso.

**Restrições:** Callback/returnPath allowlist; transação10min; /auth/me/csrf no-store. CORS/SameSite não substituem CSRF.

**Exceções:** Callback usa state/binding, não token CSRF de sessão ainda inexistente; views anônimas têm proteção própria por Origin/limite.

**Casos inválidos:** State reutilizado/outro browser, open redirect, CSRF de outra conta, token em HTML CDN.

**Onde a regra será aplicada:** [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros) auth routes/OAuthTransactionStore/csrf. Arquivos e responsabilidade detalhados em [E14](./BACKEND_IMPLEMENTATION_PLAN.md#e14-implementar-login-github-sess%C3%A3o-e-logout-seguros).

**Como será testada:** [E14-U01](./BACKEND_TEST_PLAN.md#e14-u01)/[U02](./BACKEND_TEST_PLAN.md#e14-u02)/[I01](./BACKEND_TEST_PLAN.md#e14-i01)/[I02](./BACKEND_TEST_PLAN.md#e14-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-007"></a>
<!-- navigation:anchor:end -->

## Autorização

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r22"></a>

### R22. Negação por padrão, ownership e bloqueio

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Negação por padrão, ownership e bloqueio.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §11; proteção do último admin é [REGRA INFERIDA] para evitar perda de operação.

**Descrição:** Visitante lê; ativo interage; dono edita seu texto; moderator/admin moderam/removem sem editar assinatura alheia. Admin gerencia papéis/bloqueio; autor editorial não tem esse poder.

**Entrada:** Actor atual, ação e recurso/owner.

**Resultado esperado:** Permissão explícita ou403; status/role update revoga todas sessões; bloqueio impede novas escritas após commit.

**Restrições:** Último admin ativo protegido; bootstrap por operação protegida/UUID, não email. Store revalida ator na transação para concorrência.

**Exceções:** Desbloquear exige novo login e não altera publicações anteriores; moderação de conteúdo anterior é decisão separada.

**Casos inválidos:** Role no body, autorização só botão UI, edição de comentário alheio pelo moderador.

**Onde a regra será aplicada:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) authorization/manage-user; [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)–[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) stores; [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) gate. Arquivos e responsabilidade detalhados em [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Como será testada:** [E15-U01](./BACKEND_TEST_PLAN.md#e15-u01)/[I01](./BACKEND_TEST_PLAN.md#e15-i01)/[I02](./BACKEND_TEST_PLAN.md#e15-i02); [E17-U01](./BACKEND_TEST_PLAN.md#e17-u01)/[I02](./BACKEND_TEST_PLAN.md#e17-i02); [E19-I01](./BACKEND_TEST_PLAN.md#e19-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r23"></a>

### R23. Limites de abuso por capacidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Limites de abuso por capacidade.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§13–15; valores concretos em [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso).

**Descrição:** Limitar tentativas/ações por conta e origem com estado compartilhado; devolver429 e Retry-After; não usar IP cru como identidade de domínio.

**Entrada:** Ação, actor/origem pseudonimizada e clock.

**Resultado esperado:** Até o teto operação elegível; excesso negado com tempo para retry; falha limiter mutação503.

**Restrições:** Comentário3/min20/h, report5/h, like60/min e demais limites da [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso); cleanup das chaves temporárias. Proxy confiável é pré-condição.

**Exceções:** Ajustes após métricas são permitidos sem mudar regra de ownership; redes compartilhadas requerem observação.

**Casos inválidos:** Limite só em memória com réplicas, spoof de XFF, CAPTCHA obrigatório sem abuso comprovado.

**Onde a regra será aplicada:** [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso) rate-limiter, [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado)–[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) ações, [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) métricas. Arquivos e responsabilidade detalhados em [E15](./BACKEND_IMPLEMENTATION_PLAN.md#e15-aplicar-permiss%C3%B5es-bloqueio-e-limites-de-abuso), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Como será testada:** [E15-U02](./BACKEND_TEST_PLAN.md#e15-u02)/[I01](./BACKEND_TEST_PLAN.md#e15-i01); [E20-I02](./BACKEND_TEST_PLAN.md#e20-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-008"></a>
<!-- navigation:anchor:end -->

## Comunidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r24"></a>

### R24. Curtida única e idempotente por artigo

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Curtida única e idempotente por artigo.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §12.

**Descrição:** Uma conta ativa curte um articleId uma vez, compartilhado entre traduções. PUT garante presença, DELETE garante ausência somente da própria associação.

**Entrada:** articleId público e Actor da sessão.

**Resultado esperado:** 204 com estado desejado; repetição não duplica/desfaz intenção. Totais COUNT canônico; minhas curtidas privadas.

**Restrições:** PK(articleId,userId), sem toggle, recurso público e CSRF/limite; sem contador derivado inicial.

**Exceções:** DELETE de associação ausente de artigo público é204; artigo não público404.

**Casos inválidos:** Like anônimo, userId enviado por cliente, PT+EN duplicando associação, race read-modify-write.

**Onde a regra será aplicada:** [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado) set-like/LikeStore/routes; [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) stats. Arquivos e responsabilidade detalhados em [E16](./BACKEND_IMPLEMENTATION_PLAN.md#e16-entregar-curtidas-idempotentes-e-estado-privado).

**Como será testada:** [E16-U01](./BACKEND_TEST_PLAN.md#e16-u01)/[I01](./BACKEND_TEST_PLAN.md#e16-i01)/[I02](./BACKEND_TEST_PLAN.md#e16-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r25"></a>

### R25. Comentário pertence à tradução e nasce pendente

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Comentário pertence à tradução e nasce pendente.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §13; pré-moderação é default adotado.

**Descrição:** Conta ativa cria texto na tradução pública, autoria da sessão; status pending até revisão. Somente visible aparece/conta publicamente; autor vê seus estados em área privada.

**Entrada:** translationId e bodyMarkdown normalizado.

**Resultado esperado:** 201/Location e pending; leitura pública lista visible com cursor estável, sem email.

**Restrições:** 1..5000 caracteres Unicode, max5links, Markdown restrito, HTML/imagem/iframe negados, URLs permitidas; 3/min20/h.

**Exceções:** Código com caracteres HTML dentro de fence é texto permitido; não destruir indentação.

**Casos inválidos:** userId/status no payload, publicar sem revisão, contagem de pending/hidden/deleted, XSS.

**Onde a regra será aplicada:** [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) comments.ts, markdown adapter, stores/routes; [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) stats. Arquivos e responsabilidade detalhados em [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

**Como será testada:** [E17-U02](./BACKEND_TEST_PLAN.md#e17-u02)/[U03](./BACKEND_TEST_PLAN.md#e17-u03)/[I01](./BACKEND_TEST_PLAN.md#e17-i01)/[I02](./BACKEND_TEST_PLAN.md#e17-i02)/[I03](./BACKEND_TEST_PLAN.md#e17-i03); [E18-I03](./BACKEND_TEST_PLAN.md#e18-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r26"></a>

### R26. Edição, moderação e remoção preservam autoria

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Edição, moderação e remoção preservam autoria.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §13; CAS de versão e purge imediato são [REGRA INFERIDA] para não aprovar texto concorrente/remanescente pessoal.

**Descrição:** Dono pode editar texto não deletado e volta a pending. Moderator/admin decide visible/hidden com motivo, nunca muda body alheio. Delete autorizado é terminal e conserva só tombstone, com body apagado.

**Entrada:** Comment, Actor, ação, expectedVersion e motivo.

**Resultado esperado:** Versão incrementada/updatedAt; conflito409; auditoria de moderação no mesmo commit; deleted não conta.

**Restrições:** Deleted não restaura/edita; update com versão antiga não sobrescreve; dono não define status.

**Exceções:** Sem threads P1, tombstone fica persistido porém fora da lista pública; P2 exibe raiz tombstone necessária.

**Casos inválidos:** Aprovar versão editada sem revisar, moderador reescrever texto alheio, body pessoal retido só porque soft delete.

**Onde a regra será aplicada:** [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) comment.ts/CommentStore; [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) threads. Arquivos e responsabilidade detalhados em [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

**Como será testada:** [E17-U01](./BACKEND_TEST_PLAN.md#e17-u01)/[I01](./BACKEND_TEST_PLAN.md#e17-i01)/[I02](./BACKEND_TEST_PLAN.md#e17-i02)/[I03](./BACKEND_TEST_PLAN.md#e17-i03); [E22-I01](./BACKEND_TEST_PLAN.md#e22-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r27"></a>

### R27. Denúncia única aberta e decisão humana

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Denúncia única aberta e decisão humana.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §13.

**Descrição:** Conta ativa denuncia comentário público com motivo categorizado; uma aberta por conta/alvo. Quantidade não esconde conteúdo automaticamente. Responsável humano resolve/dismiss com auditoria.

**Entrada:** commentId, reason spam|abuse|personal-data|other, descrição opcional<=500.

**Resultado esperado:** Nova201 ou existente200; fila privada; resolução auditada e terminal.

**Restrições:** 5/h por conta, sessão/CSRF; nenhum body de denúncia em logs; moderator/admin decide.

**Exceções:** Canal manual é alternativa arquitetural inicial, mas este plano entrega reports estruturados em P1 para não deixar fluxo sem implementação.

**Casos inválidos:** Denúncias duplicadas abertas, voto de brigada removendo automaticamente, usuário comum acessando fila.

**Onde a regra será aplicada:** [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis) ReportStore/moderation/routes; [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) runbook. Arquivos e responsabilidade detalhados em [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

**Como será testada:** [E17-U03](./BACKEND_TEST_PLAN.md#e17-u03)/[I03](./BACKEND_TEST_PLAN.md#e17-i03); [E20-I01](./BACKEND_TEST_PLAN.md#e20-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-009"></a>
<!-- navigation:anchor:end -->

## Métricas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r28"></a>

### R28. View qualificada estimada com dedupe atômico

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** View qualificada estimada com dedupe atômico.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §14; consentimento explícito de cookie anônimo é default técnico/produto proposto.

**Descrição:** Não contar GET/SSG. Browser observa10s visíveis e envia POST; servidor usa identidade permitida, HMAC diário/versão e UNIQUE por tradução/janela UTC. Dedupe inserido e daily incrementado juntos.

**Entrada:** Tradução pública, identidade de sessão ou cookie permitido, now servidor e metricVersion.

**Resultado esperado:** 204 igual para aceito/duplicado/sem identidade; mesmo identificador/tradução/dia conta no máximo1.

**Restrições:** Sem fingerprint/IP cru; dedupe48h; origin/limite; payload não fornece identidade/dia. Cookie anônimo só com escolha permitida; sem escolha não conta.

**Exceções:** Outro dia, dispositivo, cookie apagado ou anon→login pode contar novamente; cliente simulado pode passar; não prometer pessoa única.

**Casos inválidos:** Incrementar GET, soma mesmo dia duplicada, dedupe commit e daily rollback separados, confiar elapsedTime como antifraude.

**Onde a regra será aplicada:** [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) view-policy/RecordView/recorder/client; [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) cleanup. Arquivos e responsabilidade detalhados em [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais).

**Como será testada:** [E18-U01](./BACKEND_TEST_PLAN.md#e18-u01)/[I01](./BACKEND_TEST_PLAN.md#e18-i01)/[I02](./BACKEND_TEST_PLAN.md#e18-i02); [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r29"></a>

### R29. Stats verdadeiras com escopo e início públicos

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Stats verdadeiras com escopo e início públicos.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§12–14.

**Descrição:** Likes são artigo; comentários contam visible por tradução; views somam visitas locais versionadas. Totais incluem apenas traduções atualmente públicas, com nome/definição/início de instrumentação documentados.

**Entrada:** articleId público, locale com tradução pública e versão de métrica.

**Resultado esperado:** likesTotal,commentsTotal/commentsInLocale,viewsTotal/viewsInLocale,definition e measurementStartedAt numéricos seguros.

**Restrições:** Nunca semear popularidade; não misturar raw requests/analytics antigos/versões distintas; minhas curtidas ficam fora do cache público.

**Exceções:** Publicação em dois idiomas pode contar duas visitas do mesmo usuário; agregados podem subcontar sem identificador/JS.

**Casos inválidos:** Contar drafts, pending/deleted, chamar views de pessoas únicas, bigint arredondado.

**Onde a regra será aplicada:** [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais) StatsReader/GetStats, [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) mensal, [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) UI/métricas. Arquivos e responsabilidade detalhados em [E18](./BACKEND_IMPLEMENTATION_PLAN.md#e18-registrar-views-deduplicadas-e-estat%C3%ADsticas-reais), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Como será testada:** [E18-U02](./BACKEND_TEST_PLAN.md#e18-u02)/[I02](./BACKEND_TEST_PLAN.md#e18-i02)/[I03](./BACKEND_TEST_PLAN.md#e18-i03); [E19-I03](./BACKEND_TEST_PLAN.md#e19-i03); [E20-I01](./BACKEND_TEST_PLAN.md#e20-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-010"></a>
<!-- navigation:anchor:end -->

## Privacidade

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r30"></a>

### R30. Exclusão efetiva com bloqueio de escritas

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Exclusão efetiva com bloqueio de escritas.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §16; comentários body=null na exclusão é default conservador do plano.

**Descrição:** Pedido autenticado recente revoga sessões e coloca deletion_pending imediatamente. Finalização idempotente remove identidade/credenciais/perfil privado/likes e conteúdo pessoal de comentários; preserve apenas tombstones e crédito editorial tratado separadamente.

**Entrada:** Actor autenticado recentemente e requestId de exclusão.

**Resultado esperado:** 202 persistido, novas mutações negadas e purge verificável com retry; export não ressuscita dados.

**Restrições:** Transação/locks impedem corrida com novas interações; remover userId não é suficiente para anonimizar texto; ledger restrito reaplica exclusões após restore.

**Exceções:** Atribuição/licença de artigos requer processo editorial informado, não remoção automática do acervo.

**Casos inválidos:** Soft delete sozinho, sessão ainda válida, restore revivendo conta, comentário com nome/email ainda público.

**Onde a regra será aplicada:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) DeleteAccount/LifecycleStore/restore; [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas)/[E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) ampliam dados removidos. Arquivos e responsabilidade detalhados em [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o).

**Como será testada:** [E19-U01](./BACKEND_TEST_PLAN.md#e19-u01)/[I01](./BACKEND_TEST_PLAN.md#e19-i01)/[I03](./BACKEND_TEST_PLAN.md#e19-i03); [E21-I02](./BACKEND_TEST_PLAN.md#e21-i02); [E22-I02](./BACKEND_TEST_PLAN.md#e22-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r31"></a>

### R31. Exportação e retenção executáveis

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Exportação e retenção executáveis.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §16; prazos são hipóteses operacionais sujeitas a validação, não obrigações legais afirmadas.

**Descrição:** Exportar dados pertinentes do próprio titular por pedido autenticado, inicialmente manual protegido. Executar cleanup em lotes e preservar totais ao converter diário para mensal. Inventário inclui logs/proxy/provedores.

**Entrada:** Pedido do titular, now, prazos aprovados e exceções restritas.

**Resultado esperado:** 202 e entrega controlada de JSON sem hashes/secrets/terceiros; expiração efetiva e auditoria mínima.

**Restrições:** Dedupe48h,logs14d,audit90d,backup30d,diário13meses são defaults; holds específicos revisados. Registro de exclusão35d proposto cobre restore, não retém perfil.

**Exceções:** Enquadramento/base legal/prazos obrigatórios exigem validação do mantenedor; não assumir que LGPD/Marco Civil dispensa ou exige prazo particular para este projeto.

**Casos inválidos:** Arquivo export público, purge de dado sob hold, cleanup que só marca e nunca apaga, somar mês+dia duplicado.

**Onde a regra será aplicada:** [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) export/cleanup/runbook; [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) gate; [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) automatiza. Arquivos e responsabilidade detalhados em [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o), [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Como será testada:** [E19-U01](./BACKEND_TEST_PLAN.md#e19-u01)/[U02](./BACKEND_TEST_PLAN.md#e19-u02)/[I02](./BACKEND_TEST_PLAN.md#e19-i02)/[I03](./BACKEND_TEST_PLAN.md#e19-i03); [E20-I02](./BACKEND_TEST_PLAN.md#e20-i02); [E25-I01](./BACKEND_TEST_PLAN.md#e25-i01)/[I02](./BACKEND_TEST_PLAN.md#e25-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-011"></a>
<!-- navigation:anchor:end -->

## Operação comunitária

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r32"></a>

### R32. Habilitação depende de capacidade humana

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Habilitação depende de capacidade humana.

**Origem:** [REGRA INFERIDA] Arquitetura §§13,20,24 exige moderação/privacidade antes da comunidade; flag conjunta torna o gate executável.

**Descrição:** Comunidade só habilita quando auth/abuso/moderação/métricas/exclusão/retention e responsável estão operantes. Observabilidade acrescenta latência/erros/filas sem IDs arbitrários como labels.

**Entrada:** Flag COMMUNITY_ENABLED e evidências [E13](./BACKEND_IMPLEMENTATION_PLAN.md#e13-criar-identidade-e-persist%C3%AAncia-de-sess%C3%B5es)–[E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o)/políticas/contatos.

**Resultado esperado:** Fluxo comunitário completo liberado ou flag permanece desligada, leitura pública permanece.

**Restrições:** Fake provider nunca produção; sem funcionalidades simuladas; métricas internas protegidas/PII redigida.

**Exceções:** Validação unit/integration usa fake provider isolado; smoke real de staging é operação configurada.

**Casos inválidos:** Habilitar comentário sem fila/responsável, métricas fictícias, labels userId/slug sem limite.

**Onde a regra será aplicada:** [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas) app/metrics/runbook/RELEASE_EVIDENCE. Arquivos e responsabilidade detalhados em [E20](./BACKEND_IMPLEMENTATION_PLAN.md#e20-habilitar-comunidade-com-observabilidade-e-opera%C3%A7%C3%A3o-completas).

**Como será testada:** [E20-U01](./BACKEND_TEST_PLAN.md#e20-u01)/[I01](./BACKEND_TEST_PLAN.md#e20-i01)/[I02](./BACKEND_TEST_PLAN.md#e20-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Após publicação (P1). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-012"></a>
<!-- navigation:anchor:end -->

## Identidade futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r33"></a>

### R33. Conta própria exige ciclo completo

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Conta própria exige ciclo completo.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §10.

**Descrição:** Conta local só habilita com hashing adequado, verificação de email, login, reset, envio confiável e abuso. Confirmar posse antes de interagir; sessão é a mesma do GitHub.

**Entrada:** Nome público,email,password e desafios de confirmação.

**Resultado esperado:** Cadastro/resend genéricos202, login válido cria sessão, não verificado sem interação.

**Restrições:** Email sem remoção de pontos/+suffix; passphrases longas sem truncar; Argon2id calibrado; role proibida; sem auto-link por email.

**Exceções:** GitHub sem email permanece utilizável; futura vinculação requer provas das duas contas.

**Casos inválidos:** Senha plaintext/SHA rápido, OAuth com senha vazia, enumeração direta, conta local sem envio/reset.

**Onde a regra será aplicada:** [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) local-auth/Hasher/EmailSender/stores. Arquivos e responsabilidade detalhados em [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas).

**Como será testada:** [E21-U01](./BACKEND_TEST_PLAN.md#e21-u01)/[U02](./BACKEND_TEST_PLAN.md#e21-u02)/[I01](./BACKEND_TEST_PLAN.md#e21-i01)/[I02](./BACKEND_TEST_PLAN.md#e21-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<a id="r34"></a>

### R34. Tokens de confirmação/reset são restritos e únicos

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Tokens de confirmação/reset são restritos e únicos.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §10; verify24h/reset30min são defaults técnicos.

**Descrição:** Token aleatório armazenado como hash tem propósito/prazo/consumo único. Reset altera senha e revoga sessões atomicamente, sem autenticar automaticamente. Links vêm de domínio fixo.

**Entrada:** Token, purpose, now e nova senha quando reset.

**Resultado esperado:** Uma execução válida; expirado/consumido/propósito errado nega; falha preserva consistência.

**Restrições:** Respostas forgot/resend não enumeram; outbox cifrada/temporária, token não logado; envio limitado e observável.

**Exceções:** Falha de envio usa retry até expiração, depois novo pedido controlado.

**Casos inválidos:** Token reset servindo verify, dois resets concorrentes, token em log/analytics, Host forjando link.

**Onde a regra será aplicada:** [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas) local-auth/token store/outbox/cleanup. Arquivos e responsabilidade detalhados em [E21](./BACKEND_IMPLEMENTATION_PLAN.md#e21-conta-local-com-confirma%C3%A7%C3%A3o-e-recupera%C3%A7%C3%A3o-completas).

**Como será testada:** [E21-U02](./BACKEND_TEST_PLAN.md#e21-u02)/[I01](./BACKEND_TEST_PLAN.md#e21-i01)/[I02](./BACKEND_TEST_PLAN.md#e21-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-013"></a>
<!-- navigation:anchor:end -->

## Discussão futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r35"></a>

### R35. Respostas têm profundidade máxima um

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Respostas têm profundidade máxima um.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §13.

**Descrição:** Reply referencia raiz da mesma tradução; parent removido vira tombstone para preservar resposta. Paginar raízes e replies separadamente.

**Entrada:** translationId,parentId e comentário autorizado.

**Resultado esperado:** Raiz ou resposta de um nível, sem árvore/ciclo; contagem considera só mensagens visible.

**Restrições:** Não self-reference, parent de outro locale/tradução ou reply de reply; moderação/edição continuam [E17](./BACKEND_IMPLEMENTATION_PLAN.md#e17-coment%C3%A1rios-moderados-e-den%C3%BAncias-oper%C3%A1veis).

**Exceções:** Tombstone de raiz pode aparecer em P2 para encadear filhos, sem body e sem contar.

**Casos inválidos:** Árvore sem limite, leak de body deletado, reply de tradução diferente.

**Onde a regra será aplicada:** [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) comment/store/routes e stats existentes. Arquivos e responsabilidade detalhados em [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura).

**Como será testada:** [E22-U01](./BACKEND_TEST_PLAN.md#e22-u01)/[I01](./BACKEND_TEST_PLAN.md#e22-i01). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-014"></a>
<!-- navigation:anchor:end -->

## Aprendizagem futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r36"></a>

### R36. Progresso explícito e grafo sem ciclos

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Progresso explícito e grafo sem ciclos.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §7; favoritos constam checklist P2 e são condicionais ao uso.

**Descrição:** Conclusão é escolha autenticada por artigo, compartilhada entre traduções, persistida apesar de reordenação. Denominador usa membros publicados no locale. Pré-requisitos estruturados não podem conter ciclos.

**Entrada:** Actor,articleId,completed boolean; opcional grafo editorial/ação de favorito.

**Resultado esperado:** PUT idempotente de conclusão; false remove; progresso privado e denominador visível, série vazia0.

**Restrições:** Nada de scroll/view como conclusão; UNIQUE(user,article), grafo sem self/ciclo; favorito separado de like e sem métrica pública.

**Exceções:** Marcas ocultas de artigo arquivado ficam até usuário/exclusão remover; só contam ao republicar. Subcapacidades opcionais aguardam gatilho.

**Casos inválidos:** Perder progresso na reordenação, ciclo de prerequisite, expor progresso no snapshot.

**Onde a regra será aplicada:** [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura) progress/series/store; [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) lifecycle evoluído. Arquivos e responsabilidade detalhados em [E22](./BACKEND_IMPLEMENTATION_PLAN.md#e22-respostas-limitadas-e-progresso-expl%C3%ADcito-de-leitura).

**Como será testada:** [E22-U01](./BACKEND_TEST_PLAN.md#e22-u01)/[U02](./BACKEND_TEST_PLAN.md#e22-u02)/[I02](./BACKEND_TEST_PLAN.md#e22-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-015"></a>
<!-- navigation:anchor:end -->

## Descoberta futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r37"></a>

### R37. Busca localizada e relacionados reais

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Busca localizada e relacionados reais.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§7,9,22.

**Descrição:** Full-text usa idioma e fallback técnico explícito, só público. Relacionados priorizam curadoria/série/tags, excluem atual/duplicados e versões ausentes.

**Entrada:** q/locale/filtros e articleId/curadoria revisada.

**Resultado esperado:** Ranking determinístico e até4 relacionados reais, sem obrigatoriedade de preencher.

**Restrições:** Mesmas validações/visibilidade/cache de P0; queries parametrizadas; sem recomendação por IA/perfil para acervo pequeno.

**Exceções:** Índice só entra com necessidade medida; sem stemmer usar simple documentado.

**Casos inválidos:** Draft no resultado, PT sob EN, highlights XSS, quatro cards fictícios.

**Onde a regra será aplicada:** [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais) reader/import/schema/DTO. Arquivos e responsabilidade detalhados em [E23](./BACKEND_IMPLEMENTATION_PLAN.md#e23-busca-por-idioma-e-relacionados-editoriais).

**Como será testada:** [E23-U01](./BACKEND_TEST_PLAN.md#e23-u01)/[I01](./BACKEND_TEST_PLAN.md#e23-i01)/[I02](./BACKEND_TEST_PLAN.md#e23-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-016"></a>
<!-- navigation:anchor:end -->

## Publicação futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r38"></a>

### R38. Colaboração mantém única autoridade editorial

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Colaboração mantém única autoridade editorial.

**Origem:** [REGRA EXPLÍCITA] Arquitetura §§8,11,24; protocolo concreto de release é [DECISÃO TÉCNICA] [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade).

**Descrição:** Painel proposto cria PR Git e usa revisão existente; não escreve texto no banco como segunda fonte. Ativação futura usa snapshot candidato e CAS, IDs editoriais preservados.

**Entrada:** Proposta autorizada/baseCommit ou release candidata validada.

**Resultado esperado:** Conflito não sobrescreve revisão; preview privado; candidato só ativa após smoke, retry idempotente.

**Restrições:** Autor não publica sem capacidade/revisão; trocar para CMS exige nova ADR de autoridade; não prometer transação API/CDN.

**Exceções:** Janela P0 continua válida até necessidade real; subcapacidades painel/ativação independentes.

**Casos inválidos:** Git+CRUD DB concorrentes, draft público, rollback que ressuscita conteúdo retirado.

**Onde a regra será aplicada:** [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade) propose/import/publish/activate/reader. Arquivos e responsabilidade detalhados em [E24](./BACKEND_IMPLEMENTATION_PLAN.md#e24-evoluir-opera%C3%A7%C3%A3o-editorial-e-ativa%C3%A7%C3%A3o-de-releases-sob-necessidade).

**Como será testada:** [E24-U01](./BACKEND_TEST_PLAN.md#e24-u01)/[U02](./BACKEND_TEST_PLAN.md#e24-u02)/[I01](./BACKEND_TEST_PLAN.md#e24-i01)/[I02](./BACKEND_TEST_PLAN.md#e24-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-017"></a>
<!-- navigation:anchor:end -->

## Privacidade futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r39"></a>

### R39. Entrega automática continua privada e temporária

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Entrega automática continua privada e temporária.

**Origem:** [REGRA INFERIDA] Arquitetura §§16,24 prevê export temporário; tokens15min/artefato24h e vínculo à sessão concretizam a entrega segura.

**Descrição:** Automatizar pedido P1 sem ampliar dados exportados; download de uso único exige dono autenticado recentemente, TTL e cancelamento ao excluir conta.

**Entrada:** requestId,token temporário e Actor.

**Resultado esperado:** Status privado/download no-store ou negação; expiração apaga artefato/tokens e retries não estendem validade.

**Restrições:** Storage privado, idempotência por pedido, sem dados pessoais no job/log/URL pública permanente.

**Exceções:** Falha de stream exige novo token autenticado; atendimento manual permanece fallback.

**Casos inválidos:** B baixar export de A, token reusado, arquivo sobreviver exclusão, job recriar PII.

**Onde a regra será aplicada:** [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda) export/lifecycle/PrivateExportStore/cleanup. Arquivos e responsabilidade detalhados em [E25](./BACKEND_IMPLEMENTATION_PLAN.md#e25-automatizar-atendimento-de-privacidade-quando-houver-demanda).

**Como será testada:** [E25-U01](./BACKEND_TEST_PLAN.md#e25-u01)/[I01](./BACKEND_TEST_PLAN.md#e25-i01)/[I02](./BACKEND_TEST_PLAN.md#e25-i02). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-018"></a>
<!-- navigation:anchor:end -->

## Escala futura

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

<a id="r40"></a>

### R40. Mudança de infraestrutura preserva semântica

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

**Nome:** Mudança de infraestrutura preserva semântica.

**Origem:** [DECISÃO TÉCNICA] Arquitetura §§14,22.

**Descrição:** Adicionar cache/Redis/jobs/réplicas/tracing/storage somente por gargalo medido; cada evolução preserva autorização/visibilidade/consistência ou declara versão nova de métrica.

**Entrada:** Baseline, experimento e adapter candidato.

**Resultado esperado:** Ganho comprovado, rollback e testes de falha/concorrência; subcapacidade sem gatilho permanece adiada.

**Restrições:** Nunca cache privado, stale indefinido de retirado, lag de autorização, worker sem idempotência; pools somados respeitam DB.

**Exceções:** Dedupe eventual requer nova metricVersion e limites assumidos; não fingir equivalência a v1.

**Casos inválidos:** Infra por número arbitrário de visitantes, Kafka/Kubernetes sem requisito, contador read-modify-write inseguro.

**Onde a regra será aplicada:** [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido) adapters/worker/db/runbook; suites existentes ampliadas. Arquivos e responsabilidade detalhados em [E26](./BACKEND_IMPLEMENTATION_PLAN.md#e26-escalar-apenas-o-gargalo-medido).

**Como será testada:** [E26-U01](./BACKEND_TEST_PLAN.md#e26-u01)/[I01](./BACKEND_TEST_PLAN.md#e26-i01)/[I02](./BACKEND_TEST_PLAN.md#e26-i02)/[I03](./BACKEND_TEST_PLAN.md#e26-i03). Cenários detalhados em [plano de testes](./BACKEND_TEST_PLAN.md).

**Fase em que entra:** Evolução futura (P2). Evoluções posteriores conservam a regra base salvo mudança de contrato explicitamente versionada.

<!-- navigation:anchor:start -->
<a id="nav-section-019"></a>
<!-- navigation:anchor:end -->

## Complementos normativos do mesmo catálogo

<!-- navigation:section:start -->
[↑ Voltar ao índice](#%C3%ADndice)
<!-- navigation:section:end -->

As tabelas de [transições/contratos](./BACKEND_IMPLEMENTATION_PLAN.md#contratos-comuns-e-detalhes-de-persist%C3%AAncia) fazem parte de [R05](#r05-identidade-do-artigo-e-tradu%C3%A7%C3%B5es-est%C3%A1veis)–[R16](#r16-snapshot-consistente-e-release-verific%C3%A1vel): restore Article reexpõe estados published já preservados (dry-run obrigatório), restore Series passa por draft, ausência de arquivo não exclui, slug de Tag/Series já publicada é imutável no P0 até suportar redirects. Este último é [REGRA INFERIDA] para preservar URLs sem inventar histórico: entrada novo slug de taxonomia publicada; resultado TAXONOMY_SLUG_IMMUTABLE, nenhum commit; sem exceção automática, teste [E07-I05](./BACKEND_TEST_PLAN.md#e07-i05).

Decisões editoriais iniciais [REGRA INFERIDA]: sourceLocale pt-BR dos pares; trilha JS/TS→TSConfig e Node→arquitetura; slugs propostos em [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial). Necessárias para normalizar o acervo sem duplicar artigos. Entrada catálogo revisado; resultado quatro identidades/oito traduções/duas séries; inválido par com UUID divergente ou ordem duplicada; aplicação [E06](./BACKEND_IMPLEMENTATION_PLAN.md#e06-normalizar-os-oito-textos-e-validar-a-fonte-editorial)/[E07](./BACKEND_IMPLEMENTATION_PLAN.md#e07-importar-publicar-despublicar-e-arquivar-atomicamente); testes [E06-I01](./BACKEND_TEST_PLAN.md#e06-i01)/[E07-I01](./BACKEND_TEST_PLAN.md#e07-i01). Autoria/licenças/datas históricas dependem de revisão humana identificada e não recebem valores fictícios.

A tabela de prazos [E19](./BACKEND_IMPLEMENTATION_PLAN.md#e19-excluir-contas-exportar-dados-e-executar-reten%C3%A7%C3%A3o) é política técnica inicial proposta. O mantenedor registra decisões reais de privacidade/retention/provedores antes de ativar a coleta; este material não determina enquadramento jurídico. Gates não autorizam o desenvolvedor a inventar contato, licença ou fornecedor.
