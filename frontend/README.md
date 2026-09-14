# Blog Frontend

[Leia em português](./README-PT-BR.md)

The Blog Frontend is the public, localized reading site for an open programming library. It validates a published-content snapshot during the build and pre-renders static, indexable HTML for pt-BR and en.

This directory contains only the frontend application. It consumes generated/published-content.json; it does not query an API in the browser or ship editorial/private data to the published site.

## What it delivers

- Static article, tag, series, archive, and institutional pages in Portuguese and English.
- Canonical URLs, alternate-language links, Open Graph metadata, JSON-LD, sitemap.xml, robots.txt, and a real static 404.html.
- Permanent (308) root and article-alias redirects, generated as an Nginx include.
- Validated localized catalog indexes for client-side search and filters, without article Markdown.
- Safe GFM Markdown rendering, generated table of contents, no raw HTML, and blocked executable link protocols.
- Accessible responsive navigation, keyboard support, and light/dark/system theme behavior that remains useful without JavaScript.
- Immutable release artifacts with manifest, file hashes, snapshot digest, and guarded atomic promotion/rollback.

## Scope

This is a public read-only frontend. It has no accounts, sign-in, comments, reactions, contact submissions, newsletters, analytics, or administrative interface. A theme preference may be stored locally in the browser under blog.theme.

The frontend does not import editorial Markdown directly, publish content, keep a database, or expose an API. Its input is the already-published snapshot mounted or written to generated/published-content.json.

## Architecture

~~~text
published-content.json
          |
          +--> Zod validation --> Vite client build + React SSR build
                                                 |
                                                 +--> prerendered HTML, metadata, sitemap,
                                                      search indexes, redirects, manifest,
                                                      and integrity record
                                                                    |
                                                                    +--> immutable release artifact
                                                                         --> current --> Nginx
~~~

React renders pages during the build. The small browser entry enhances already-rendered pages with theme, navigation, search, and filters; it neither mounts the application nor transfers the full snapshot to the client.

## Requirements

- Node.js **22.23.2**.
- npm, supplied with Node.js.
- A valid generated/published-content.json snapshot for npm run build or npm run release:build.
- Chromium for browser tests (npx playwright install chromium).
- Docker Desktop/Compose only for the Nginx host-release test or the integrated local workspace stack.

## Quick start

From frontend/:

~~~bash
npm ci
npm run build
npm run preview
~~~

Before the build, place a valid public snapshot at generated/published-content.json. npm run build checks TypeScript, creates Vite client and SSR bundles, and pre-renders the site into dist/; npm run preview serves that output locally.

## Development server

`npm run dev` renders the same published snapshot through React SSR and lets Vite update browser assets while source files change. It does not write `dist/`, release artifacts, or change the Docker deployment flow.

First make the current public snapshot available to the frontend. When the local Compose stack has already generated it, copy it from the `content` service:

~~~bash
cd ..
docker compose cp content:/snapshot/published-content.json frontend/generated/published-content.json
cd frontend
npm run dev
~~~

Or export it from a local backend environment:

~~~bash
cd backend
npm run content:export -- --output ../frontend/generated/published-content.json
cd ../frontend
npm run dev
~~~

Open http://127.0.0.1:5173. The development server also serves redirects, localized catalog indexes, and 404 pages from that snapshot. Use `FRONTEND_DEV_PORT` or `FRONTEND_DEV_HOST` to change its address. The Docker/Nginx site at http://localhost:8080 remains the release-like environment for validating static files, headers, cache behavior, and release promotion.

For the complete local workspace, run the root Compose configuration. It supplies the snapshot, promotes the release artifact, and serves the site through Nginx:

~~~bash
docker compose up --build
~~~

The local site is available at http://localhost:8080.

## Build input and configuration

The snapshot is parsed by the frontend's Zod schema. It must use schema version 1 and contain a revision, site origin, localized public articles/tags/series, a canonical URL catalogue, and valid redirects. Invalid or inconsistent input fails the build rather than producing a partial site.

| Variable | Required | Purpose |
| --- | --- | --- |
| FRONTEND_SNAPSHOT_PATH | No | Snapshot path; defaults to generated/published-content.json. |
| FRONTEND_DEV_HOST | No | Development server host; defaults to 127.0.0.1. |
| FRONTEND_DEV_PORT | No | Development server port; defaults to 5173. |
| FRONTEND_BUILD_OUT_DIR | No | Client/static output directory; defaults to dist. |
| FRONTEND_SSR_OUT_DIR | No | Temporary SSR bundle directory; defaults to .ssr. |
| FRONTEND_RELEASE_ROOT | For release operations | Directory containing releases/ and active current; defaults to /release. |
| FRONTEND_RELEASE_APPROVED_REVISION | When rebuilding an older release | Exact revision explicitly authorized for promotion. |

For an isolated build:

~~~bash
FRONTEND_SNAPSHOT_PATH=/path/to/published-content.json npm run build
~~~

## Published behavior

- Routes use /{locale}/..., with pt-BR and en supported.
- Archives paginate at 12 articles per locale. Tags, series, and about, privacy, contact, and security are generated for both locales.
- Article aliases and root locale routes redirect permanently. Nginx reads generated redirects.conf, preserving query strings.
- Every indexable page receives canonical and alternate links, localized metadata, Open Graph fields, JSON-LD, and a sitemap entry.
- Localized catalog indexes share the HTML publication revision and exclude article bodies.
- Markdown uses remark-gfm; raw HTML is not rendered and unsafe protocols are rejected.
- Theme initialization occurs before paint and falls back to the system preference when storage or JavaScript is unavailable.

## Commands

| Command | Description |
| --- | --- |
| npm run dev | Starts the SSR development server from the published snapshot, with Vite asset updates. |
| npm run build | Checks types, builds client/SSR bundles, validates the snapshot, and prerenders dist/. |
| npm run preview | Serves the static build locally. |
| npm run release:build | Builds, validates, seals, and atomically promotes a release artifact. |
| npm run release:promote | Validates and explicitly promotes an authorized existing artifact. |
| npm run lint / npm run typecheck | Runs ESLint or TypeScript project checks. |
| npm test | Runs unit, integration, and browser suites sequentially. |
| npm run test:unit / test:integration / test:browser | Runs the selected test suite. |
| npm run test:host | Verifies release-hosting behavior with Nginx and Docker. |

## Release artifacts and rollback

npm run release:build writes a versioned artifact below FRONTEND_RELEASE_ROOT/releases/. It includes pre-rendered pages, publication.json, sitemap.xml, robots.txt, redirects.conf, localized catalog indexes, and integrity.json. The integrity record binds file hashes and the snapshot digest to the publication revision.

Only after validating all files does the operation point current at the artifact; a failure preserves the previous active release. A frontend-only fix can create another artifact for the same editorial revision.

To explicitly promote or roll back to an existing artifact, supply the requested and approved revision. Where a revision has several artifacts, include the exact directory printed by the release build:

~~~bash
FRONTEND_RELEASE_ROOT=/release npm run release:promote -- \
  --revision <revision> \
  --approved-revision <same-revision> \
  --artifact <artifact-directory>
~~~

After changing current on a running Nginx host, verify and reload it to read new redirects:

~~~bash
docker compose exec -T web nginx -t
docker compose exec -T web nginx -s reload
~~~

Do not promote an artifact unless its snapshot revision is approved for public exposure.

## Verification

~~~bash
npx playwright install chromium
npm run typecheck
npm run lint
npm test
~~~

Tests use versioned synthetic snapshots and isolated temporary frontend copies, so they preserve the working snapshot and dist/. Coverage includes snapshot validation, routes, metadata, Markdown policy, article projections, search, archive/series navigation, static builds, release integrity/promotion, and browser behavior across locales, themes, viewport sizes, keyboard navigation, denied storage, and disabled JavaScript.

With Docker available:

~~~bash
npm run test:host
~~~

It verifies Nginx release hosting, including atomic activation, aliases, withdrawn paths, and explicitly authorized rollback.

## Repository layout

~~~text
frontend/
├── src/                 React pages, rendering, routes, content validation, SEO, and UI
├── public/              static browser assets, including early theme initialization
├── scripts/             build, prerender, release sealing, promotion, and test runner
├── tests/               unit, integration, browser, host, and snapshot fixtures
├── generated/           ignored input directory for published-content.json
├── dist/                ignored static build output
├── Dockerfile.local     local release-builder image
└── vite.config.ts       Vite and snapshot-path configuration
~~~

## License and contribution

The repository-level license and contribution policy govern this frontend. Public-page changes should update relevant tests and keep generated URLs, metadata, redirects, localized catalogs, and release validation consistent.
