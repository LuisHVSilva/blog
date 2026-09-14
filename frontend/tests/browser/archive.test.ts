import {createServer, type Server} from 'node:http';
import {existsSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {chromium, expect as browserExpect, type Browser} from '@playwright/test';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

let build: ReturnType<typeof buildFixture>;
let server: Server;
let browser: Browser;
let origin: string;

beforeAll(async () => {
    server = createServer((request, response) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        let file = path.resolve(build.dist, '.' + pathname);
        if (!file.startsWith(build.dist + path.sep) || !existsSync(file)) { response.writeHead(404).end(); return; }
        if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
        const mime: Record<string, string> = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json'};
        response.writeHead(200, {'content-type': mime[path.extname(file)] ?? 'application/octet-stream'}); response.end(readFileSync(file));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('Missing TCP port');
    origin = `http://127.0.0.1:${address.port}`;
    build = buildFixture(JSON.parse(JSON.stringify(catalogSnapshot).replaceAll(catalogSnapshot.siteOrigin, origin)));
    browser = await chromium.launch();
}, 120_000);

afterAll(async () => { await browser?.close(); if (server) await new Promise<void>((resolve) => server.close(() => resolve())); build?.dispose(); });

describe('E06 archive', () => {
    it('serves pages without repetition and preserves a shared filter after reload', async () => {
        const page = await browser.newPage();
        await page.goto(origin + '/pt-BR/articles/page/2');
        await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(11);
        await browserExpect(page.locator('[data-archive-results]')).toContainText('Artigo 13');
        await browserExpect(page.locator('[data-archive-controls]')).toBeVisible();
        const select = page.locator('[data-archive-tag]');
        await select.selectOption('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
        await browserExpect(page).toHaveURL(/\/pt-BR\/articles\?tag=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb$/);
        await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(12);
        await browserExpect(page.locator('[data-archive-pagination]')).toBeHidden();
        await page.reload();
        await browserExpect(select).toHaveValue('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
        await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(12);
        await page.goto(origin + '/en/articles');
        await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(2);
        expect(await page.locator('body').innerText()).not.toContain('Corpo privado');
        await page.close();
    }, 30_000);

    it('shows an honest empty state for a valid filter with no localized articles', async () => {
        const page = await browser.newPage();
        await page.goto(origin + '/en/articles?tag=cccccccc-cccc-4ccc-8ccc-cccccccccccc');
        await browserExpect(page.locator('[data-archive-empty]')).toBeVisible();
        await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(0);
        await page.close();
    });
});

describe('E07 tags and series', () => {
    it('shows ordered tracks, translation gaps and independent article series contexts', async () => {
        const page = await browser.newPage();
        await page.goto(origin + '/pt-BR/series/plataforma');
        await browserExpect(page.locator('.series-members__position')).toHaveText(['Etapa 1', 'Etapa 3']);
        await browserExpect(page.locator('.series-gap')).toBeVisible();
        await page.locator('.published-language').getByRole('link', {name: 'EN', exact: true}).click();
        await browserExpect(page).toHaveURL(/\/en\/series\/platform$/);
        await browserExpect(page.locator('.series-gap')).toContainText('not yet translated');
        await page.goto(origin + '/pt-BR/articles/artigo-1');
        await browserExpect(page.locator('.article-series-contexts nav')).toHaveCount(2);
        await browserExpect(page.getByRole('link', {name: 'Proximo: Artigo 3'})).toHaveAttribute('href', new RegExp(`${origin}/pt-BR/articles/artigo-3$`));
        await browserExpect(page.getByRole('link', {name: 'Proximo: Artigo 2'})).toHaveAttribute('href', new RegExp(`${origin}/pt-BR/articles/artigo-2$`));
        await page.close();
    }, 30_000);

    it('keeps tag and series pages useful with JavaScript disabled', async () => {
        const context = await browser.newContext({javaScriptEnabled: false});
        const page = await context.newPage();
        await page.goto(origin + '/pt-BR/tags/platform');
        await browserExpect(page.locator('h1')).toHaveText('Plataforma');
        await browserExpect(page.locator('[data-article-id]')).toHaveCount(11);
        await page.goto(origin + '/pt-BR/series/plataforma');
        await browserExpect(page.locator('.series-members__position')).toHaveText(['Etapa 1', 'Etapa 3']);
        await context.close();
    });
});

describe('E08 search dialog', () => {
    it('restores a shared query after reload and clears it when search is closed', async () => {
        const page = await browser.newPage();
        await page.goto(origin + '/en/tags?q=Article+1');
        await browserExpect(page.locator('[data-search-dialog]')).toBeVisible();
        await browserExpect(page.locator('[data-search-input]')).toHaveValue('Article 1');
        await browserExpect(page.locator('[data-search-results] a')).toHaveCount(1);
        await page.reload();
        await browserExpect(page.locator('[data-search-results] a')).toHaveCount(1);
        await page.locator('[data-search-input]').fill('Article 2');
        await browserExpect(page).toHaveURL(/q=Article\+2$/);
        await page.keyboard.press('Escape');
        await browserExpect(page).toHaveURL(origin + '/en/tags');
        await page.close();
    });
    it('rejects an index from another revision and malformed links without replacing the static archive', async () => {
        for (const invalid of ['revision', 'link']) {
            const page = await browser.newPage();
            await page.route('**/en/catalog-index.json', async (route) => {
                const response = await route.fetch();
                const value = await response.json();
                if (invalid === 'revision') value.revision = 'withdrawn-revision';
                else value.articles[0].canonical = 'javascript:alert(1)';
                await route.fulfill({json: value});
            });
            await page.goto(origin + '/en/articles');
            await page.locator('[data-search-open]').click();
            await browserExpect(page.locator('[data-search-status]')).toContainText('Search is unavailable');
            await browserExpect(page.locator('[data-search-retry]')).toBeVisible();
            await browserExpect(page.locator('[data-archive-results] [data-article-id]')).toHaveCount(2);
            await page.close();
        }
    });
    it('opens by button and shortcut, contains focus, returns it and searches only the active locale', async () => {
        const page = await browser.newPage();
        await page.goto(origin + '/en/articles');
        const opener = page.locator('[data-search-open]');
        await browserExpect(opener).toBeVisible();
        await opener.click();
        const dialog = page.locator('[data-search-dialog]');
        const input = page.locator('[data-search-input]');
        await browserExpect(dialog).toBeVisible(); await browserExpect(input).toBeFocused();
        await input.fill('Article 1');
        await browserExpect(page.locator('[data-search-results] a')).toHaveCount(1);
        await browserExpect(page.locator('[data-search-results]')).toContainText('Article 1');
        await page.locator('[data-search-close]').focus(); await page.keyboard.press('Tab');
        expect(await page.evaluate(() => document.querySelector('[data-search-dialog]')?.contains(document.activeElement))).toBe(true);
        await page.keyboard.press('Escape');
        await browserExpect(dialog).toBeHidden(); await browserExpect(opener).toBeFocused();
        await page.keyboard.press('Control+k'); await browserExpect(dialog).toBeVisible();
        await input.fill('Artigo'); await browserExpect(page.locator('[data-search-status]')).toContainText('No articles found.');
        const valueBeforeShortcut = await input.inputValue(); await page.keyboard.press('Control+k');
        expect(await input.inputValue()).toBe(valueBeforeShortcut);
        await page.close();
    }, 30_000);

    it('separates an unavailable catalog from an empty result and permits retry', async () => {
        const page = await browser.newPage();
        let requestCount = 0;
        await page.route('**/pt-BR/catalog-index.json', async (route) => {
            requestCount += 1;
            if (requestCount === 1) await route.fulfill({status: 503, contentType: 'application/json', body: '{}'});
            else await route.continue();
        });
        await page.goto(origin + '/pt-BR/tags');
        await page.locator('[data-search-open]').click();
        await browserExpect(page.locator('[data-search-status]')).toContainText('Busca indisponivel');
        await page.locator('[data-search-input]').fill('Artigo');
        await browserExpect(page.locator('[data-search-status]')).toContainText('Busca indisponivel');
        await browserExpect(page.locator('[data-search-retry]')).toBeVisible();
        await page.locator('[data-search-retry]').click();
        await page.locator('[data-search-input]').fill('Artigo 1');
        await browserExpect(page.locator('[data-search-results] a')).toHaveCount(11);
        expect(requestCount).toBe(2);
        await page.close();
    }, 30_000);

    it('ignores a delayed response from a closed search dialog', async () => {
        const page = await browser.newPage();
        let requestCount = 0;
        await page.route('**/en/catalog-index.json', async (route) => {
            requestCount += 1;
            if (requestCount === 1) {
                await new Promise<void>((resolve) => setTimeout(resolve, 200));
                await route.fulfill({status: 503, contentType: 'application/json', body: '{}'}).catch(() => undefined);
            } else await route.continue();
        });
        await page.goto(origin + '/en/tags');
        await page.locator('[data-search-open]').click();
        await browserExpect(page.locator('[data-search-status]')).toContainText('Loading catalog');
        await page.locator('[data-search-close]').click();
        await page.locator('[data-search-open]').click();
        await page.locator('[data-search-input]').fill('Article 1');
        await browserExpect(page.locator('[data-search-results] a')).toHaveCount(1);
        await new Promise<void>((resolve) => setTimeout(resolve, 250));
        await browserExpect(page.locator('[data-search-status]')).not.toContainText('unavailable');
        expect(requestCount).toBe(2);
        await page.close();
    }, 30_000);
});

describe('E09 institutional pages', () => {
    it('publishes useful localized content and links without simulated forms', async () => {
        const context = await browser.newContext({javaScriptEnabled: false});
        const page = await context.newPage();
        await page.goto(origin + '/pt-BR/contact');
        await browserExpect(page.locator('h1')).toHaveText('Contato e correcoes');
        await browserExpect(page.getByRole('link', {name: 'Abrir ou consultar issues'})).toHaveAttribute('href', 'https://github.com/LuisHVSilva/blog/issues');
        expect(await page.locator('form, img, input[type="email"]').count()).toBe(0);
        await page.locator('.published-language').getByRole('link', {name: 'EN', exact: true}).click();
        await browserExpect(page).toHaveURL(/\/en\/contact$/);
        await browserExpect(page.locator('h1')).toHaveText('Contact and corrections');
        await page.goto(origin + '/en/security');
        await browserExpect(page.locator('.site-page__content')).toContainText('No private security-reporting channel');
        await context.close();
    });
});
