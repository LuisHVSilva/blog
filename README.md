# Blog — Full-Stack Publishing Platform

[Leia em português](./README-PT-BR.md)

This repository contains a bilingual, full-stack technical blog built as a public portfolio project. It combines an editorial backend, a localized React reading experience, a versioned Markdown content source, and a Docker/Nginx delivery stack.

The project was designed to demonstrate more than an isolated CRUD application: its main concern is keeping editorial content validated, published, versioned, and rendered consistently across the API, the generated website, and the release artifact.

## Overview

The platform supports a public read-only experience in `pt-BR` and `en`, with articles, tags, series, projects, localized routes, search indexes, institutional pages, and SEO metadata. Editorial content is maintained as reviewed Markdown and catalog data, imported into PostgreSQL, and exported as a publication snapshot consumed by the frontend.

The browser receives pre-rendered HTML and a small enhancement bundle. It does not query the API for article content or receive the complete editorial snapshot. This keeps the public site fast, indexable, and independent of the API after a release has been generated.

> This is a portfolio and demonstration project. The Compose configuration uses local-only credentials and sample content. A real production deployment still requires a domain, secrets, backup storage, operational ownership, monitoring, and an incident process.

## Main highlights

- Full-stack architecture with Node.js, Express, TypeScript, PostgreSQL, React, Vite, Docker, and Nginx.
- Bilingual public experience with `pt-BR` and `en`, including localized slugs and canonical URLs.
- Editorial workflow with Markdown, YAML frontmatter, catalog validation, content hashes, revisions, publication states, and audit information.
- Snapshot contract between backend and frontend, validated with Zod and tied to an exact publication revision.
- React SSR and static generation for indexable pages, metadata, Open Graph, JSON-LD, sitemap, robots.txt, redirects, and a real static 404 page.
- Layered backend with dependency inversion, explicit use cases, repository contracts, PostgreSQL adapters, migrations, and a public OpenAPI 3.1 contract.
- Immutable frontend release artifacts with file hashes, snapshot digest, atomic promotion, and guarded rollback.
- Security and operational boundaries such as separate application/migrator database roles, strict CORS, Helmet, request correlation, safe error envelopes, bounded queries, graceful shutdown, and Nginx rate limiting.
- Automated quality gates covering type checks, linting, unit tests, integration tests, API tests, browser tests, release hosting, and cross-boundary public-release smoke tests.

## Architecture

```text
content/
  catalog.yaml + localized Markdown
                |
                v
backend CLI -- validate/import/publish/export --> PostgreSQL
       |                                           |
       |                                           +--> public REST API
       v
published-content.json
                |
                v
frontend Zod validation --> Vite client + React SSR --> pre-rendered release
                                                               |
                                                               v
                                                            Nginx
                                             static pages + /api proxy
```

The complete local stack is orchestrated by the root `compose.yaml`:

1. PostgreSQL starts with the local database roles.
2. The migration service applies versioned schema migrations.
3. The content service validates/seeds the local editorial fixture and exports `published-content.json`.
4. The API starts only after the database and content steps are ready.
5. The frontend builds an immutable static release from the snapshot.
6. Nginx serves the static site and proxies `/api/` and `/health/` to Express.

## Technology stack

| Layer | Technologies | Responsibility |
| --- | --- | --- |
| Content | Markdown, YAML | Reviewed localized source and editorial catalog. |
| Backend | Node.js `22.23.2`, Express 5, TypeScript, Sequelize, PostgreSQL 16 | Validation, editorial operations, persistence, snapshot export, and public API. |
| Frontend | React 19, React DOM SSR, Vite, TypeScript, Sass, React Markdown | Localized pages, SSR, static generation, Markdown projection, search, and accessibility. |
| Validation | Zod, Unified, remark-gfm | Runtime contracts, Markdown parsing, and content safety rules. |
| Delivery | Docker Compose, Nginx | Reproducible local stack, static hosting, API proxy, redirects, headers, and rate limiting. |
| Quality | ESLint, Vitest, Playwright, GitHub Actions | Static analysis, unit/integration/browser tests, host tests, and CI gates. |

## Repository structure

```text
.
├── backend/                  Node.js + Express API and editorial pipeline
│   ├── src/                  domain, application, HTTP, and infrastructure code
│   ├── migrations/            versioned PostgreSQL migrations
│   ├── scripts/               build, seed, migration, backup, restore, and smoke tools
│   ├── tests/                 unit, integration, API, and process tests
│   └── openapi.yaml           public API contract
├── frontend/                 React SSR/static site
│   ├── src/                  routes, pages, content projections, SEO, and UI
│   ├── scripts/               development, build, prerender, and release operations
│   ├── tests/                 unit, integration, browser, host, and snapshot tests
│   └── generated/             ignored snapshot input directory
├── content/                  canonical editorial source
│   ├── catalog.yaml           authors, tags, series, projects, and article identity
│   └── articles/              one localized Markdown file per article/locale
├── deploy/nginx.conf          static hosting and API proxy configuration
├── compose.yaml               complete local workspace stack
└── .github/workflows/         automated CI and public-release verification
```

## Requirements

- Docker Desktop with Docker Compose, recommended for the complete stack.
- Node.js **22.23.2** and npm for working on the backend or frontend independently.
- Chromium for frontend browser tests; install it with `npx playwright install chromium`.
- PostgreSQL 16 and PostgreSQL client tools only when running backend operations directly on the host.

## Quick start: complete local stack

From the repository root:

```bash
docker compose up --build
```

The first run builds the backend and frontend images, creates the local PostgreSQL database, applies migrations, seeds the reviewed fixture from `content/`, exports the public snapshot, builds the static release, and starts Nginx.

Open the site at [`http://localhost:8080`](http://localhost:8080). Useful local endpoints include:

```bash
curl "http://localhost:8080/pt-BR"
curl "http://localhost:8080/api/v1/articles?locale=pt-BR&limit=20"
curl "http://localhost:8080/health/ready"
```

The root stack exposes the website on `127.0.0.1:8080`; the API is available through the Nginx `/api/` proxy. The PostgreSQL service is not exposed publicly.

Stop the stack with:

```bash
docker compose down
```

The default command preserves named volumes, including the local database. Removing volumes is optional and permanently removes local database/snapshot/release data:

```bash
docker compose down --volumes
```

## Working on the backend independently

From `backend/`:

```bash
npm ci
Copy-Item .env.example .env.dev     # PowerShell
# cp .env.example .env.dev          # macOS/Linux
npm run build
npm run dev:database
npm run migrate
npm run seed:local -- --root ../content
npm run dev:api
```

The API listens on `http://localhost:3010` with the example configuration. `npm run dev` is a convenience command that starts the development database and the API with file watching; migrations and local seed data must still be prepared as described above.

The backend provides the following public endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /health/live` | Process liveness, independent of PostgreSQL. |
| `GET /health/ready` | Readiness status, including database availability. |
| `GET /api/v1/articles` | Paginated published article summaries with locale, tag, series, difficulty, search, and sort filters. |
| `GET /api/v1/articles/by-slug/{locale}/{slug}` | Localized published article detail; public aliases redirect with `308`. |
| `GET /api/v1/tags` | Localized tags and public article counts. |
| `GET /api/v1/series` | Localized series. |
| `GET /api/v1/series/by-slug/{locale}/{slug}` | Series detail with ordered article navigation. |
| `GET /api/v1/projects` | Published localized projects. |
| `GET /api/v1/projects/by-slug/{locale}/{slug}` | Published project detail. |

The complete contract, schemas, parameters, status codes, and error representations are in [`backend/openapi.yaml`](./backend/openapi.yaml).

## Working on the frontend independently

The frontend build input is the published snapshot at `frontend/generated/published-content.json`. It is intentionally ignored by Git because it is generated from backend publication data.

Export a local snapshot from a prepared backend database:

```bash
cd backend
npm run content:export -- --output ../frontend/generated/published-content.json
cd ../frontend
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. The development server uses React SSR with the same snapshot that feeds the static build. It supports localized routes, redirects, catalog indexes, and 404 responses without querying the API from the browser.

To generate and preview a static build:

```bash
npm run build
npm run preview
```

The build validates the snapshot, creates client and SSR bundles, and pre-renders the site into `dist/`. A missing, malformed, inconsistent, or outdated snapshot fails the build instead of producing a partial publication.

## Editorial workflow

The canonical content source is `content/`. Each article has a stable identity in `catalog.yaml` and localized Markdown files below `content/articles/<article-id>/`.

The normal workflow is:

1. Add or edit the catalog and the localized Markdown files.
2. Validate the revision without changing the database:

   ```bash
   cd backend
   npm run build
   npm run content:validate -- --root ../content --format json
   ```

3. Import the reviewed revision with the expected current revision and operator information.
4. Publish, unpublish, archive, or restore content through the guarded editorial commands.
5. Export the exact public revision consumed by the frontend:

   ```bash
   npm run content:export -- --output ../frontend/generated/published-content.json
   ```

6. Build and validate the frontend release.

The backend checks IDs, locale/file agreement, duplicate YAML keys, frontmatter, content hashes, Markdown rules, catalog relationships, and asset path containment. Import and publication operations are revision-checked so an unnoticed overwrite cannot silently replace the current editorial state. See [`backend/README.md`](./backend/README.md) and [`content/README.md`](./content/README.md) for the complete command reference.

For a complete local edition, use the backend shortcut after the local database and migrations are ready:

```bash
cd backend
npm run content:release:local:dry-run
npm run content:release:local
```

It imports the entire validated source revision, exports the frontend snapshot, and builds the frontend. It is intentionally blocked in production; source `published` states remain the declaration of what becomes public.

## Publication and release model

The system separates editorial publication from website delivery:

- PostgreSQL is the source of the current editorial publication state.
- The backend exports a consistent, read-only snapshot containing only public data.
- The frontend validates the snapshot schema and publication revision before rendering.
- The release builder creates pre-rendered pages, localized catalogs, metadata, sitemap, robots.txt, redirects, and integrity data.
- Nginx activates only the validated release artifact and keeps the API boundary separate from static content.

Frontend releases are immutable. Promotion changes the active `current` pointer only after validation, and an older artifact can be promoted again only with an explicitly authorized revision. This makes a frontend-only fix possible without changing editorial content and keeps rollback tied to a known publication revision.

## Security and operational boundaries

- Local `.env` files and generated artifacts are ignored; real secrets must never be committed.
- Application and migration database roles are separate. The application role does not own the schema, and implicit schema synchronization is disabled.
- Express uses Helmet, strict CORS, request IDs, bounded JSON/query input, safe error envelopes, and structured redacted logs.
- PostgreSQL queries, readiness checks, HTTP timeouts, and connection pools have explicit bounds.
- Nginx adds security headers, rate-limits public reads, hides release internals, and proxies only the intended API/health paths.
- Published snapshots omit drafts, archived content, operators, database details, and other editorial/private fields.
- Markdown rendering uses GFM support without raw HTML and rejects unsafe executable URL protocols.
- Graceful shutdown closes the HTTP listener and database pool on `SIGTERM`/`SIGINT`.

The current public surface is deliberately read-only. It does not include accounts, GitHub sign-in, comments, reactions, view counters, user progress, contact submission processing, newsletters, analytics, or an administrative web interface.

## Testing and continuous integration

Backend checks:

```bash
cd backend
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:api
npm run build
npm run content:validate -- --root ../content --format json
```

For backend integration tests, start the isolated PostgreSQL database first:

```bash
npm run test:database:up
npm run ci
npm run test:database:down
```

Frontend checks:

```bash
cd frontend
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:host
```

The workflow in [`.github/workflows/backend-ci.yml`](./.github/workflows/backend-ci.yml) runs frontend checks, backend tooling on Linux and Windows, PostgreSQL integration tests, the integrated public-release smoke test, and a static-reading check after the API is stopped.

## More documentation

- [Backend README](./backend/README.md) · [Backend README em português](./backend/README-PT-BR.md)
- [Frontend README](./frontend/README.md) · [Frontend README em português](./frontend/README-PT-BR.md)
- [Editorial content README](./content/README.md)
- [Public API contract](./backend/openapi.yaml)

## License and contributions

The repository currently includes the Apache License 2.0 text at [`frontend/LICENSE`](./frontend/LICENSE). Review the intended licensing scope before redistributing the complete workspace.

Contributions that change public behavior should update the API contract, tests, localized content, generated routes, metadata, redirects, and release validation as applicable. Keep secrets, production snapshots, database dumps, and local environment files out of commits.
