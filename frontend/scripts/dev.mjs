import {createServer} from 'node:http';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {createServer as createViteServer} from 'vite';
import {renderPublishedDocument} from './render-published-document.mjs';

const root = path.resolve(import.meta.dirname, '..');
const snapshotPath = path.resolve(process.env.FRONTEND_SNAPSHOT_PATH ?? path.join(root, 'generated', 'published-content.json'));
const port = Number(process.env.FRONTEND_DEV_PORT ?? 5173);
const host = process.env.FRONTEND_DEV_HOST ?? '127.0.0.1';

function fail(message) {
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
}

function json(response, value, method) {
    response.writeHead(200, {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'});
    response.end(method === 'HEAD' ? undefined : JSON.stringify(value));
}

export async function createPublishedDevServer() {
    if (!Number.isSafeInteger(port) || port < 0 || port > 65535) {
        throw new Error('FRONTEND_DEV_PORT must be an integer between 0 and 65535.');
    }

    if (!existsSync(snapshotPath)) {
        throw new Error(`Published snapshot not found at ${snapshotPath}. Export it with: cd ../backend; npm run content:export -- --output ../frontend/generated/published-content.json`);
    }

    const vite = await createViteServer({
        root,
        appType: 'custom',
        server: {middlewareMode: true},
    });
    const server = createServer((request, response) => {
        vite.middlewares(request, response, async (error) => {
            if (error) {
                vite.ssrFixStacktrace(error);
                response.writeHead(500, {'content-type': 'text/plain; charset=utf-8'}).end(error.stack);
                return;
            }
            try {
                if (!request.url || !['GET', 'HEAD'].includes(request.method ?? 'GET')) {
                    response.writeHead(405, {allow: 'GET, HEAD'}).end();
                    return;
                }
                const url = new URL(request.url, 'http://localhost');
                const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
                const catalog = /^\/(pt-BR|en)\/catalog-index\.json$/u.exec(url.pathname);
                if (catalog) {
                    json(response, entry.localCatalogIndex(entry.snapshot, catalog[1]), request.method);
                    return;
                }
                const page = entry.render(url.pathname);
                if (page.page.redirect) {
                    response.writeHead(308, {location: page.page.redirect + url.search, 'cache-control': 'no-store'}).end();
                    return;
                }
                const template = await vite.transformIndexHtml(url.pathname, readFileSync(path.join(root, 'index.html'), 'utf8'));
                const pageMetadata = entry.metadata(url.pathname);
                const document = renderPublishedDocument(template, {
                    html: page.html,
                    pageMetadata,
                    revision: entry.snapshot.revision,
                    jsonLd: entry.safeJsonLd(pageMetadata.jsonLd),
                });
                response.writeHead(page.page.found ? 200 : 404, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow'});
                response.end(request.method === 'HEAD' ? undefined : document);
            } catch (error) {
                vite.ssrFixStacktrace(error);
                response.writeHead(500, {'content-type': 'text/plain; charset=utf-8'}).end(error instanceof Error ? error.stack : 'Development rendering failed.');
            }
        });
    });
    return {server, vite};
}

if (import.meta.main) {
    createPublishedDevServer().then(({server}) => {
        server.listen(port, host, () => {
            const address = server.address();
            const activePort = typeof address === 'object' && address ? address.port : port;
            process.stdout.write(`Published frontend development server: http://${host}:${activePort}\n`);
        });
    }).catch((error) => fail(error instanceof Error ? error.message : 'Unable to start the development server.'));
}
