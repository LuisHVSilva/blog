# Auditoria do fluxo P0 — 10/09/2026

## Resultado

Foram corrigidas divergências de E01–E12 e acrescentada uma revisão datada em cada resumo `P0-E01.md` a `P0-E12.md`. Os relatos iniciais foram preservados como histórico. O fluxo exercitado foi fonte canônica → validação → PostgreSQL/migrations → importação/CAS → API → snapshot consistente → frontend/prerender → nginx → smoke.

| Fronteira | Correções |
| --- | --- |
| Banco | Corrida no ledger, constraints de publicação, proteção diferida de origem/path e migrations incrementais de metadados/hashes |
| Fonte | Oito textos reais UTF-8, IDs estáveis, catálogo autor/tags/séries e parsing YAML/AST com validação |
| Escrita | Edição atômica, CAS/retry, aliases, histórico de publishedAt, restore e seed local protegido |
| HTTP | DTOs completos, filtros reais, visibilidade/locale, séries ordenadas, 308, validação e cache condicional |
| Site | Snapshot conectado, HTML PT/EN, canonical/alternates/OG/sitemap e 404 real |
| Ambiente | Compose completo, API compilada não root, papéis DB separados e DNS dinâmico no proxy |
| Operação | Smoke API/HTML, backup cifrado e restore real isolado |

## Evidências locais

- Backend: suíte de 45 testes, incluindo PostgreSQL real, migrations concorrentes, privilégios, ciclo de vida, publicação/retirada/restore e API; lint/typecheck/build em `npm run ci`.
- Frontend: lint e build Linux Node 22.23.2, prerender de oito traduções.
- Ambiente: projeto Compose `blog-p0-audit`, entrada raiz `compose.yaml`, site `http://localhost:8080`.
- Revisão: `local-f4c91cc17c72f8194ab292139c120f68a175a6548937deec2562e1658fae2f8d`.
- Snapshot: oito traduções, seis tags localizadas, quatro séries localizadas, 18 URLs. Evidência local ignorada pelo Git: `backend/tmp/p0-audit/published-content.json`.
- Smoke API + HTML aprovado; repetido após reconstrução e correção do DNS do proxy.
- Backup AES-256-GCM: 130755 bytes, SHA-256 `ac89275c03ad0c1df802c9e6f8a483ae38ba750a2bfb9084d348b0b944b0bbfa`. Restore em `blog_test_p0_restore`: mesma revisão, oito traduções, 252 ms no processo de restore; smoke aprovado contra API restaurada.

Os 252 ms não são RTO: não incluem provisionamento, download, recuperação da chave e promoção. A chave do ensaio era efêmera; o artefato não é backup operacional reutilizável. Não houve upload externo (`uploaded: false`), deploy de produção ou execução remota de Actions comprovada. Volumes existentes não foram apagados.

## Limites e gates ainda abertos

O fluxo comprovado não substitui todos os cenários do plano. Não declarar P0 integralmente aprovado enquanto permanecerem:

- E07: relatório completo de dry-run com conflicts/visibilityChanges e cobertura de todas as combinações de operações do manifesto. O preview atual verifica identidades, hashes, datas, paths e conflitos de taxonomia; commit revalida CAS/constraints em transação.
- E10: concluir retirada das fontes/componentes raw antigos, fora do runtime público, preservando alterações do mantenedor; ampliar testes específicos de snapshot concorrente com mais de 50 traduções e falha de build preservando release anterior. O volume de build do Compose local não é troca atômica de produção.
- E12: domínio/HTTPS, host/região, licença aprovada, responsáveis/canal de incidente, backup externo/retencão/recuperação de chave, alertas, RPO/RTO e ensaio de deploy/rollback no destino. Valores não foram inventados.
- Audit de dependências: dois avisos moderados na cadeia Sequelize/uuid do backend. Não aplicado downgrade incompatível sugerido por `npm audit fix --force`. Frontend ficou sem avisos após ajuste do lockfile. Avaliar/corrigir o risco antes do release.

Conforme E06, legacy-map é migração interna; aliases históricos só devem ser publicados com prova de URL pública anterior. A integração pública não usa os arquivos raw antigos como segunda fonte editorial.

Reprodução e operação: [runbook](../../BACKEND_OPERATIONS.md). Registro: [evidências](../../RELEASE_EVIDENCE.md).
