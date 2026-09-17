# Blog Backend

[Leia em português](./README-PT-BR.md)

The Blog Backend is the publishing and public-reading service for an open programming library. It turns reviewed, versioned Markdown content into a controlled editorial catalogue, a public REST API, and a consistent snapshot that the frontend pre-renders into indexable pages.

This repository is the backend of the wider `blog` workspace. The companion frontend consumes the public snapshot; content lives in the workspace-level `content/` directory.

## What it delivers

- A PostgreSQL-backed editorial catalogue with stable article and translation IDs.
- Reviewed Markdown import with YAML frontmatter, content hashing, UTF-8, GFM-aware validation, and a catalogue of authors, tags, and series.
- Explicit editorial operations: import, publish, unpublish, archive, and guarded restore.
- Localized public reading API for published articles, tags, and ordered series.
- Localized slugs, redirects for public aliases, stable canonical URLs, and no silent locale fallback.
- A revision-consistent public snapshot for static frontend generation.
- Versioned migrations, separate application and migrator database roles, and no runtime schema synchronization.
- Health checks, safe error envelopes, request correlation, strict CORS, bounded database queries, graceful shutdown, and structured redacted logs.
- Docker images and Compose definitions for development and standalone API/database operation.
- Encrypted PostgreSQL backup and an intentionally restricted restore path for isolated test databases.

## Scope

The completed P0 is an editorial publishing backend. It does **not** currently provide public accounts, GitHub sign-in, comments, likes, view counters, user progress, or an admin web UI. Those capabilities require later backend phases and are deliberately not simulated by this API.

## Architecture

```text
content/ (reviewed Markdown + catalogue)
          │
          ├─ validate → import/revision → PostgreSQL
          │                              │
          │                              ├─ public API
          │                              └─ consistent snapshot → frontend SSG
          │
          └─ explicit publish/archive/restore operations
```

The application follows a layered, dependency-inverted design. Domain and application code depend on contracts; HTTP, PostgreSQL, CLI, logging, and process lifecycle are adapters. The detailed implementation record is available in [`../docs/implementacao-back`](../docs/implementacao-back/00_COMECE_AQUI.md).

## Requirements

- Node.js **22.23.2** (see [`.node-version`](./.node-version)).
- npm, supplied with Node.js.
- PostgreSQL 16 for a host-based development setup, or Docker Desktop/Compose.
- For backup and restore on the host: PostgreSQL client tools (`pg_dump`, `pg_restore`, and `psql`). The operations image includes them.

## Quick start: local development

From `backend/`:

```bash
npm ci
Copy-Item .env.example .env.dev     # PowerShell
# cp .env.example .env.dev          # macOS/Linux
npm run dev
```

`npm run dev` starts the development PostgreSQL container and runs the API with file watching. It exposes the API on the `PORT` declared in `.env.dev` (default `3010`). This command starts an empty development database; apply migrations and seed the local editorial fixture before expecting published content:

```bash
npm run build
npm run migrate
npm run seed:local -- --root ../content
```

The local seed accepts only `blog_dev` or an explicit `blog_test_*` database, refuses production, and imports the eight fixture translations as published local content. It will not overwrite an operational revision.

For the complete workspace, including snapshot generation, frontend build, Nginx, and API, run this from the workspace root:

```bash
docker compose up --build
```

The local site is then available at `http://localhost:8080`; the API is proxied through `/api/` and is also exposed by the API container at `http://localhost:3010` when using the backend-only Compose file.

## Configuration

Copy `.env.example` to `.env.dev` for development. Never commit `.env.dev`, `.env.production`, or any real secret.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | `dev`, `test`, or `production`. Production only uses injected environment values. |
| `PORT` | Yes | HTTP listening port. |
| `PUBLIC_SITE_URL` | Yes | Absolute public site origin. Production requires HTTPS; paths, credentials, queries, and fragments are rejected. |
| `CORS_ORIGINS` | Yes | Comma-separated allowed HTTP(S) origins. Empty disables browser cross-origin access. |
| `TRUST_PROXY` | No | `false`/empty or explicit controlled IP/CIDR values. `true` and public `/0` networks are rejected. |
| `LOG_SERVICE` | No | Structured log service name; defaults to `blog-api`. |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Yes | Application PostgreSQL connection. |
| `DB_USERNAME`, `DB_PASSWORD` | Yes | Application role. The supplied Compose setup expects the least-privileged `blog_app` role. |
| `DB_DIALECT` | Yes | Must be `postgres`. |
| `DB_POOL_MAX`, `DB_ACQUIRE_MS`, `DB_STATEMENT_TIMEOUT_MS` | No | Pool and database query bounds; defaults are 5, 5000 ms, and 3000 ms. |
| `MIGRATOR_DB_HOST`, `MIGRATOR_DB_PORT`, `MIGRATOR_DB_NAME` | For migrations | PostgreSQL connection for the DDL-capable migrator role. |
| `MIGRATOR_DB_USERNAME`, `MIGRATOR_DB_PASSWORD` | For migrations | Migrator credentials. Keep them separate from application credentials. |
| `SYNC` | Yes | Must be `false` or empty. Schema changes happen only through migrations. |

`BACKUP_KEY` is required only for backup/restore. It must be a 32-byte key represented as 64 hexadecimal characters. `BACKUP_UPLOAD_URL`, when used, must be HTTPS.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts local PostgreSQL then watches/runs the API. |
| `npm run dev:compose` | Runs the backend development Compose stack. |
| `npm run build` | Compiles TypeScript to `dist/`. |
| `npm start` | Runs the compiled API. Run `npm run build` first. |
| `npm run lint` | Runs ESLint with zero warnings allowed. |
| `npm run typecheck` | Checks production and test TypeScript without emitting files. |
| `npm test` | Runs unit, integration, and API tests. The runner uses the isolated test database defaults from `docker-compose-test.yml`; start it with `npm run test:database:up` first. |
| `npm run test:unit` / `test:api` | Runs only unit tests or HTTP/API tests. |
| `npm run test:integration` | Runs integration tests against the isolated PostgreSQL database. |
| `npm run ci` | Runs lint, typecheck, the complete test suite, and build. |
| `npm run migrate` / `migrate:status` | Applies or lists versioned migrations using the migrator role. |
| `npm run seed:local` | Seeds safe local fixture content. |
| `npm run content:*` | Validates, imports, changes publication state, or exports a snapshot. |
| `npm run content:release:local` | In dev/test, validates and imports the complete `content/` edition, exports the frontend snapshot, and builds the frontend. It respects source `published` states and is blocked in production. |
| `npm run content:release:local:dry-run` | Safely previews the local edition import without changing the database, snapshot, or frontend build. |

Start and stop the isolated test database with:

```bash
npm run test:database:up
npm test
npm run test:database:down
```

## Editorial workflow

The canonical source is the workspace `content/` directory. It contains `catalog.yaml` and one Markdown file per locale beneath `articles/<article-id>/`. The importer checks containment, duplicate YAML keys, frontmatter fields, content hashes, IDs, locale/filename agreement, Markdown safety, and catalogue relationships.

Build the backend before using TypeScript-based CLIs:

```bash
npm run build
```

Validate a content revision without connecting to the database:

```bash
npm run content:validate -- --root ../content --format json
```

Import a reviewed revision. `empty` is valid only for the initial import:

```bash
npm run content:import -- \
  --root ../content \
  --expected-revision empty \
  --operator-id editorial-maintainer \
  --revision <reviewed-source-revision>
```

Use `--dry-run` with `content:import` to preview an import. Later imports must use the current revision returned by the prior operation, preventing an unnoticed overwrite.

Publication state operations require the article UUID, expected revision, operator ID, source revision, and reviewed reason. `publish` and `unpublish` additionally require a locale:

```bash
npm run content:publish -- \
  --article-id <article-uuid> --locale pt-BR \
  --expected-revision <current-revision> \
  --operator-id editorial-maintainer --revision <source-revision> \
  --reason "Editorial review completed"
```

`content:unpublish` accepts `--target-state draft|archived`; `content:archive` applies to the article; and `content:restore` requires a dry-run before an explicit `--confirm-reexposure` when restoring an article. All write operations are revision-checked and audited through the editorial model.

Export the exact public revision consumed by the frontend:

```bash
npm run content:export -- --output ../frontend/generated/published-content.json
```

The export writes a temporary file and atomically renames it into place after a consistent, read-only snapshot completes.

## Public HTTP API

The complete contract is [OpenAPI 3.1](./openapi.yaml). All public content is localized and only published data is returned.

| Endpoint | Description |
| --- | --- |
| `GET /health/live` | Process liveness; independent of PostgreSQL. |
| `GET /health/ready` | Readiness; returns `503` while PostgreSQL is unavailable or shutdown begins. |
| `GET /api/v1/articles` | Paginated published article summaries. Supports `locale`, `page`, `limit` (max 50), `tag`, `series`, `difficulty`, `q`, and `sort`. |
| `GET /api/v1/articles/by-slug/{locale}/{slug}` | Published article detail. A public alias returns `308` to the current localized slug. |
| `GET /api/v1/tags?locale=pt-BR` | Localized tags with public-article counts. |
| `GET /api/v1/series?locale=pt-BR` | Localized series with visible members. |
| `GET /api/v1/series/by-slug/{locale}/{slug}` | Localized series detail and ordered navigation. |

Locales are `pt-BR` and `en`; the API also accepts `pt-br` where documented. Invalid or repeated query parameters return a safe `400` response. Missing or non-public resources return `404`. Dependency failures return `503`. Error envelopes include a correlation `requestId`, but never SQL, stack traces, request bodies, or secrets.

Successful public representations support conditional requests and conservative shared caching. Errors and health responses use `Cache-Control: no-store`.

Example:

```bash
curl "http://localhost:3010/api/v1/articles?locale=pt-BR&limit=20"
curl "http://localhost:3010/health/ready"
```

## Docker and production operation

`docker-compose.yml` is a standalone backend/API deployment definition. It creates PostgreSQL, runs migrations once, and starts the read-only API container only after migrations succeed:

```bash
# Create backend/.env.production with real, uncommitted values.
npm run production:compose
```

At minimum, production needs `DB_NAME`, `DB_PASSWORD`, `MIGRATOR_DB_USERNAME`, `MIGRATOR_DB_PASSWORD`, and `PUBLIC_SITE_URL`; set `CORS_ORIGINS` and `TRUST_PROXY` for the real deployment. The Compose API binds to `127.0.0.1:3010`, so place a TLS-terminating reverse proxy in front of it. Do not expose PostgreSQL publicly.

Before a production release, define the actual domain, host/region, operational owner, incident channel, external backup storage, RPO/RTO, and distinct app/migrator credentials. The repository cannot safely infer those choices.

After importing/exporting a reviewed revision and deploying the site, run the cross-boundary smoke check:

```bash
npm run release:smoke -- \
  <snapshot-file> <revision> https://site.example https://api.example
```

It verifies snapshot structure and revision, public API/detail parity, generated article HTML, sitemap entries, aliases, and a real `404` path.

## Backup and recovery

The backup command creates an AES-256-GCM encrypted PostgreSQL custom dump and a SHA-256 sidecar. It requires `BACKUP_KEY`, `PGHOST`, `PGUSER`, `PGPASSWORD`, and explicit database/output arguments:

```bash
BACKUP_KEY=<64-hex-characters> \
PGHOST=<host> PGUSER=<migrator-or-backup-role> PGPASSWORD=<password> \
npm run backup -- <database> <encrypted-output>
```

Use the operations image or an environment with PostgreSQL client tools installed. An optional `BACKUP_UPLOAD_URL` must be HTTPS.

Restore is intentionally limited to an **empty** database named `blog_test_*`; it cannot restore into development or production:

```bash
BACKUP_KEY=<64-hex-characters> \
PGHOST=<host> PGUSER=<role> PGPASSWORD=<password> \
npm run restore -- blog_test_recovery <encrypted-output> --execute
```

Validate the restored revision and run the release smoke test before promoting any recovered data. A Docker volume is not a backup.

## Security and operational behavior

- Configuration rejects invalid database settings, URLs, proxy trust, and implicit schema synchronization.
- Application database credentials have data privileges; migrations use the separate DDL-capable role.
- JSON mutations require JSON content type and are limited to 16 KiB; query strings are bounded.
- Helmet, strict CORS, request IDs, response error boundaries, and structured redacted logs are configured at the HTTP edge.
- Readiness probes are bounded and do not stack concurrent probes; liveness does not report database status.
- SIGTERM/SIGINT and fatal startup/runtime failures close the HTTP listener and database pool safely.
- The public snapshot omits drafts, archived/private editorial fields, operators, and database details.

Report security issues through the repository's private security channel rather than a public issue once that channel is configured. Do not include credentials, production snapshots containing sensitive information, or database dumps in tickets.

## Repository layout

```text
backend/
├── src/                 application, domain, HTTP, infrastructure, and publishing adapters
├── migrations/          ordered, checksummed PostgreSQL migrations
├── scripts/             build, migration, seed, backup, restore, and release utilities
├── tests/               unit, integration, API, and process fixtures
├── openapi.yaml         public API contract
├── docker-compose*.yml  local development, test, and backend-only production stacks
└── Dockerfile*          runtime, development, and operations images

../content/              canonical reviewed editorial source
../frontend/             static site built from the exported snapshot
```

## Verification

Run the complete backend gate before opening a pull request:

```bash
npm run ci
```

The suite covers configuration, HTTP lifecycle, migrations and privileges, content validation, immutable domain behavior, publication/revision flows, public API contracts, snapshot consistency, backup guards, and compiled/runtime startup. Integration tests use an isolated `blog_test_*` PostgreSQL database.

## License and contribution

The repository-level license and contribution policy govern this backend. Contributions that change public behavior should update [OpenAPI](./openapi.yaml), tests, and relevant implementation documentation. Editorial changes should follow the reviewed-content workflow above so the site and API remain on one revision.
