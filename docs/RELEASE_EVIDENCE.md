# Evidências de release

## Ensaio local — 10/09/2026

Revisão `local-f4c91cc17c72f8194ab292139c120f68a175a6548937deec2562e1658fae2f8d`: oito traduções, PostgreSQL 16, build Linux Node 22.23.2, HTML PT/EN e smoke API/site aprovados. Backup cifrado restaurado em banco isolado com mesma revisão/contagens e smoke da API restaurada. Detalhes e limitações na [auditoria](implementacao/implementado/AUDITORIA-P0.md).

Este ensaio não comprova Actions remota, backup off-host, deploy/rollback de produção ou RPO/RTO. Registrar também SHA-256 do snapshot e execução CI na aprovação efetiva do release.

Registrar por release: revisão editorial, hash do snapshot, CI, migration, smoke, destino de backup/restore e responsável. Nenhuma publicação está aprovada enquanto domínio, host, contatos e RPO/RTO não estiverem preenchidos no runbook operacional.
