# Operação do backend

## Revisão operacional — 10/09/2026

Entrada local canônica: na raiz `D:\Projetos\blog`, executar `docker compose up --build -d`. Site em `http://localhost:8080`, API em `/api/v1` e health em `/health/live` e `/health/ready`. Banco/API ficam internos. A composição aguarda migrations, seed/export e build antes do web.

Na auditoria foi usado o projeto `blog-p0-audit`: reutilizar com `docker compose -p blog-p0-audit up --build -d`. O projeto padrão é separado e pode disputar a porta 8080. Diagnóstico: `docker compose ps -a` e `docker compose logs --tail=100`. Não executar `down -v`: volumes são dados. Compose legado backend é conveniência da API, não o ciclo completo; volumes antigos não reexecutam initdb e mudanças de papéis/senhas exigem administração explícita.

Editar somente `content/catalog.yaml` e `content/articles/<articleId>/<locale>.md`, mantendo UUIDs. Atualizar hashes pelo conteúdo normalizado; a tradução referencia o hash da origem efetivamente revisada. `normalize-legacy-content.mjs` foi utilitário de migração inicial, não rotina editorial.

Em backend, com configuração de ambiente válida:

```text
npm run build
npm run content:validate -- --root ../content
npm run migrate
npm run content:import -- --root ../content --expected-revision REV_ATUAL --revision REV_NOVA --operator-id OPERADOR --dry-run
npm run content:import -- --root ../content --expected-revision REV_ATUAL --revision REV_NOVA --operator-id OPERADOR
npm run content:export -- --output ../frontend/generated/published-content.json
```

Primeiro banco vazio exige `--expected-revision empty`. Não reutilizar revisão com conteúdo diferente. Dry-run não reserva a revisão e ainda não é o relatório completo de visibilidade previsto; revisar o manifesto. Em frontend, `npm ci` e `npm run build` consomem o snapshot. No Compose, os serviços content/site-build fazem export/build via volumes. Alterações de redirects exigem `docker compose exec web nginx -s reload`; DNS da API é reavaliado automaticamente.

Smoke antes de anunciar, em backend: `npm run release:smoke -- SNAPSHOT REVISAO URL_SITE [URL_API]`. Sem URLs, apenas valida o artefato offline.

Publish/unpublish/archive/restore exigem `--article-id`, `--expected-revision`, `--revision`, `--operator-id`, `--reason`; publish/unpublish também `--locale`. Unpublish aceita `--target-state draft|archived`. Restore com locale produz draft. Restore do artigo inteiro pode reexpor traduções: usar primeiro `--dry-run` e depois `--confirm-reexposure`. Atualizar Git após intervenção operacional.

Backup real requer PostgreSQL client 16 (`backend/Dockerfile.operations`) e `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `BACKUP_KEY` injetados com segurança. A chave tem 32 bytes em hexadecimal, guardada separadamente com recuperação testada; nunca em Git/argumentos.

```text
npm run backup -- BANCO /destino/backup.enc
npm run restore -- blog_test_restore /destino/backup.enc --execute
```

Manter `.sha256` junto do arquivo. Restore exige banco existente vazio `blog_test_*`, checksum e autenticação GCM válidos. Confirmar revisão/contagens e smoke da API isolada antes de qualquer promoção. Sem `--execute`, o guard de nome não é recuperação. Limites atuais: 120 segundos por comando PostgreSQL e 64 MiB de buffer. `BACKUP_UPLOAD_URL` permite PUT HTTPS, mas sucesso de upload não prova recuperação externa; definir retenção, transferência do checksum e teste de download/restore.

O Compose local escreve no volume do site: não é estratégia atômica de produção. O host final deve construir release separado, validar e só então trocar referência ativa, mantendo o anterior em caso de falha. Evidências e pendências técnicas: [auditoria P0](implementacao/implementado/AUDITORIA-P0.md).

## Gate antes de produção

Preencher e aprovar: domínio, host/região, responsável operacional, canal de incidente, armazenamento externo de backup, RPO/RTO e credenciais separadas de app/migrator. Estes valores não são inferidos pelo repositório.

## Rotina

Executar migrations uma vez com a credencial de migrador, importar conteúdo com CAS, exportar o snapshot e rodar `npm run release:smoke -- <snapshot> <revision>`. Falha mantém o site anterior; não anunciar a revisão.

## Retirada urgente

Executar unpublish/archive com revisão e motivo, atualizar a fonte Git, exportar/deployar o snapshot e confirmar 404 na API e no site. Se o build estiver indisponível, bloquear a URL no edge.

## Restore

Restore só aponta a banco explícito `blog_test_*`; validar UUIDs, revisão e smoke antes de promover qualquer ambiente. Volume Docker não é backup.
