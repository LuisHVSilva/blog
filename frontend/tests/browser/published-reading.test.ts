import {createServer, type Server} from 'node:http';
import {mkdirSync, readFileSync, existsSync, statSync} from 'node:fs';
import path from 'node:path';
import {chromium, expect as browserExpect, type Browser} from '@playwright/test';
import {beforeAll, afterAll, describe, it, expect} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

let build: ReturnType<typeof buildFixture>;
let server: Server;
let browser: Browser;
let origin: string;
const evidence = path.resolve('node_modules/.tmp/e04-e05-evidence');
beforeAll(async () => {
    server = createServer((request, response) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        let file = path.resolve(build.dist, '.' + pathname);
        if (!file.startsWith(build.dist + path.sep) || !existsSync(file)) { response.writeHead(404).end(); return; }
        if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
        const mime: Record<string, string> = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'};
        response.writeHead(200, {'content-type': mime[path.extname(file)] ?? 'application/octet-stream'});
        response.end(readFileSync(file));
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing TCP port');
    origin = `http://127.0.0.1:${address.port}`;
    const snapshot = JSON.parse(JSON.stringify(editorialSnapshot).replaceAll(editorialSnapshot.siteOrigin, origin));
    build = buildFixture(snapshot);
    browser = await chromium.launch();
    mkdirSync(evidence, {recursive: true});
}, 120_000);
afterAll(async () => {
    await browser?.close();
    if (server) await new Promise<void>(resolve => server.close(() => resolve()));
    build?.dispose();
});

describe('E04/E05 built site', () => {
    for (const locale of ['pt-BR', 'en']) for (const width of [320, 1440]) for (const colorScheme of ['light', 'dark'] as const) {
        it(`${locale} ${width}px ${colorScheme}: keyboard, theme and reading`, async () => {
            const context = await browser.newContext({viewport: {width, height: 900}, colorScheme});
            await context.addInitScript(() => { localStorage.setItem('blog.locale', 'invalid'); });
            const page = await context.newPage();
            const errors: string[] = [];
            page.on('pageerror', error => errors.push(error.message));
            const article = editorialSnapshot.articles.find(item => item.locale === locale);
            if (!article) throw new Error('Missing fixture');
            await page.goto(origin + new URL(article.canonical).pathname);
            await browserExpect(page.locator('[data-shell-ready]')).toHaveCount(1);
            await browserExpect(page.locator('html')).toHaveAttribute('lang', locale);
            await browserExpect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
            await page.keyboard.press('Tab');
            await browserExpect(page.locator('.skip-link')).toBeFocused();
            await page.keyboard.press('Enter');
            await browserExpect(page.locator('main')).toBeFocused();
            const menu = page.locator('[data-menu-toggle]');
            const nav = page.locator('#main-navigation');
            if (width === 320) {
                await browserExpect(nav).not.toBeVisible();
                await menu.focus();
                await page.keyboard.press('Enter');
                await browserExpect(menu).toHaveAttribute('aria-expanded', 'true');
                await page.keyboard.press('Tab');
                await browserExpect(nav.locator('a').first()).toBeFocused();
                await page.keyboard.press('Tab');
                await browserExpect(nav.locator('a').nth(1)).toBeFocused();
                await page.keyboard.press('Escape');
                await browserExpect(menu).toBeFocused();
                await browserExpect(menu).toHaveAttribute('aria-expanded', 'false');
                await browserExpect(nav).not.toBeVisible();
            } else {
                await browserExpect(menu).not.toBeVisible();
                await browserExpect(nav).toBeVisible();
            }
            const theme = page.locator('[data-theme-toggle]');
            await theme.focus();
            await page.keyboard.press('Enter');
            const toggled = colorScheme === 'dark' ? 'light' : 'dark';
            await browserExpect(page.locator('html')).toHaveAttribute('data-theme', toggled);
            await page.reload();
            await browserExpect(page.locator('html')).toHaveAttribute('data-theme', toggled);
            await browserExpect(theme).toHaveAttribute('aria-pressed', String(toggled === 'dark'));
            await browserExpect(page.locator('.article-content')).toContainText('Texto público');
            const links = page.locator('.published-toc a');
            const targets = await links.evaluateAll(elements => elements.map(element => element.getAttribute('href')?.slice(1)));
            expect(new Set(targets).size).toBe(targets.length);
            for (const target of targets) await browserExpect(page.locator(`[id="${target}"]`)).toHaveCount(1);
            await links.first().click();
            expect(new URL(page.url()).hash).toBe('#section-repeat');
            await browserExpect(page.locator('.article-content table')).toContainText('Two');
            const tableRegion = page.locator('.metrics-table');
            if (width === 320) {
                await tableRegion.focus();
                await page.keyboard.press('End');
                await page.keyboard.press('ArrowRight');
                await expect.poll(() => tableRegion.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
            }
            await browserExpect(page.locator('.article-content li li')).toHaveText('Child');
            expect(await page.locator('.article-content img').evaluate(image => image instanceof HTMLImageElement && image.naturalWidth > 0)).toBe(true);
            expect(await page.locator('.article-content script').count()).toBe(0);
            expect(await page.getByText('Attack', {exact: true}).getAttribute('href')).toBeNull();
            expect(await page.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
            await browserExpect(page.locator('footer')).toContainText('Stackcraft');
            expect(errors).toEqual([]);
            await theme.focus();
            await page.evaluate(() => scrollTo(0, 0));
            await page.screenshot({path: path.join(evidence, `${locale}-${width}-${toggled}.png`), fullPage: true});
            const otherLocale = locale === 'en' ? 'pt-BR' : 'en';
            const alternate = editorialSnapshot.articles.find(item => item.locale === otherLocale);
            if (!alternate) throw new Error('Missing alternate');
            await page.locator('.published-language').getByRole('link', {name: otherLocale === 'en' ? 'EN' : 'PT', exact: true}).click();
            await browserExpect(page.locator('h1')).toHaveText(alternate.title);
            await page.reload();
            await browserExpect(page.locator('html')).toHaveAttribute('lang', otherLocale);
            await context.close();
        }, 30_000);
    }
    it('storage denied: theme/menu work, reload uses system preference', async () => {
        const context = await browser.newContext({viewport: {width: 320, height: 900}, colorScheme: 'dark'});
        await context.addInitScript(() => { Object.defineProperty(window, 'localStorage', {get() { throw new Error('Denied'); }}); });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(origin + '/en/articles');
        await browserExpect(page.locator('[data-shell-ready]')).toHaveCount(1);
        await browserExpect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await page.locator('[data-theme-toggle]').click();
        await browserExpect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await page.reload();
        await browserExpect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await page.locator('[data-menu-toggle]').click();
        await browserExpect(page.locator('#main-navigation')).toBeVisible();
        await page.getByRole('navigation', {name: 'Main', exact: true}).getByRole('link', {name: 'Tags'}).click();
        await browserExpect(page.locator('html')).toHaveAttribute('lang', 'en');
        expect(new URL(page.url()).pathname).toBe('/en/tags');
        expect(errors).toEqual([]);
        await context.close();
    });
    it('theme bootstrap runs before the deferred client module', async () => {
        const context = await browser.newContext({colorScheme: 'light'});
        await context.addInitScript(() => localStorage.setItem('blog.theme', 'dark'));
        const page = await context.newPage();
        await page.route('**/assets/*.js', route => route.abort());
        await page.goto(origin + '/en/articles');
        await browserExpect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await browserExpect(page.locator('[data-menu-toggle]')).not.toBeVisible();
        await context.close();
    });
    it('viewport transitions do not leave focus in hidden navigation', async () => {
        const context = await browser.newContext({viewport: {width: 320, height: 900}});
        const page = await context.newPage();
        await page.goto(origin + '/en/articles');
        const menu = page.locator('[data-menu-toggle]');
        await menu.click();
        await page.setViewportSize({width: 1440, height: 900});
        await browserExpect(page.locator('#main-navigation a').first()).toBeFocused();
        await page.setViewportSize({width: 320, height: 900});
        await browserExpect(menu).toBeFocused();
        await browserExpect(menu).toHaveAttribute('aria-expanded', 'false');
        await context.close();
    }, 30_000);
    it('without JavaScript PT/EN navigation and TOC remain available on mobile', async () => {
        for (const article of editorialSnapshot.articles) {
            const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 320, height: 900}});
            const page = await context.newPage();
            await page.goto(origin + new URL(article.canonical).pathname);
            await browserExpect(page.locator('#main-navigation')).toBeVisible();
            await browserExpect(page.locator('[data-menu-toggle]')).not.toBeVisible();
            await browserExpect(page.locator('[data-theme-toggle]')).not.toBeVisible();
            await page.locator('.published-toc a').first().click();
            expect(new URL(page.url()).hash).toBe('#section-repeat');
            await browserExpect(page.locator('h1')).toHaveText(article.title);
            await context.close();
        }
    });
});
