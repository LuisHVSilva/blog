import {createRequire} from 'node:module';
import {createServer, type Server} from 'node:http';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {chromium, expect as browserExpect, type Browser} from '@playwright/test';
import {afterAll, beforeAll, expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const evidence = path.resolve('node_modules/.tmp/e11-evidence');
const reportPath = path.join(evidence, 'browser-metrics.json');
let build: ReturnType<typeof buildFixture>;
let server: Server;
let browser: Browser;
let origin: string;
const metrics: Array<{locale: string; width: number; colorScheme: string; domContentLoaded: number; load: number}> = [];

beforeAll(async () => {
    const snapshot = structuredClone(editorialSnapshot);
    for (const article of snapshot.articles) {
        article.title = `${article.locale === 'pt-BR' ? 'Titulo editorial muito extenso' : 'A deliberately very long editorial title'} ${'para validar reflow e leitura '.repeat(5)}`;
        article.seo = {title: article.title, description: article.description};
    }
    for (const series of snapshot.series) for (const member of series.members) {
        const article = snapshot.articles.find((item) => item.articleId === member.article.articleId && item.locale === member.article.locale);
        if (article) member.article.title = article.title;
    }
    server = createServer((request, response) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        let file = path.resolve(build.dist, '.' + pathname);
        if (!file.startsWith(build.dist + path.sep) || !existsSync(file)) { response.writeHead(404).end(); return; }
        if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
        const mime: Record<string, string> = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json'};
        response.writeHead(200, {'content-type': mime[path.extname(file)] ?? 'application/octet-stream'}); response.end(readFileSync(file));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('Missing TCP port');
    origin = `http://127.0.0.1:${address.port}`;
    build = buildFixture(JSON.parse(JSON.stringify(snapshot).replaceAll(snapshot.siteOrigin, origin)));
    browser = await chromium.launch(); mkdirSync(evidence, {recursive: true});
}, 120_000);

afterAll(async () => {
    writeFileSync(reportPath, JSON.stringify({environment: {browser: 'Chromium', origin}, metrics}, null, 2));
    await browser?.close(); if (server) await new Promise<void>((resolve) => server.close(() => resolve())); build?.dispose();
});

it('E11: has no automated WCAG A/AA violations in the published reading shell', async () => {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, colorScheme: 'light'});
    const page = await context.newPage(); await page.goto(origin + '/pt-BR/articles/artigo-de-teste');
    await page.addScriptTag({content: axeSource});
    const violations = await page.evaluate(async () => {
        const axe = (window as unknown as {axe: {run: (context: Document, options: object) => Promise<{violations: Array<{id: string; impact: string | null; nodes: unknown[]}>}>}}).axe;
        return (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']}})).violations;
    });
    expect(violations).toEqual([]); await context.close();
}, 30_000);

it('E11: collection, institutional pages and open search pass automated checks in both themes', async () => {
    for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({viewport: {width: 375, height: 900}, colorScheme});
        const page = await context.newPage();
        for (const route of ['/pt-BR/articles', '/en/tags', '/pt-BR/series', '/en/about', '/pt-BR/privacy', '/en/contact', '/pt-BR/security']) {
            await page.goto(origin + route);
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
            await page.addScriptTag({content: axeSource});
            const violations = await page.evaluate(async () => {
                const axe = (window as unknown as {axe: {run: (context: Document, options: object) => Promise<{violations: Array<{id: string}>}>}}).axe;
                return (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']}})).violations;
            });
            expect(violations, `${route} ${colorScheme}`).toEqual([]);
        }
        await page.locator('[data-search-open]').click();
        const violations = await page.evaluate(async () => {
            const axe = (window as unknown as {axe: {run: (context: Document, options: object) => Promise<{violations: Array<{id: string}>}>}}).axe;
            return (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']}})).violations;
        });
        expect(violations, `search ${colorScheme}`).toEqual([]);
        await context.close();
    }
}, 120_000);

it('E11: long PT/EN reading reflows and keeps focus visible from 320 to 1440 pixels', async () => {
    for (const locale of ['pt-BR', 'en']) for (const width of [320, 375, 768, 1024, 1440]) {
        const context = await browser.newContext({viewport: {width, height: 900}, colorScheme: locale === 'pt-BR' ? 'light' : 'dark'});
        const page = await context.newPage(); const articlePath = locale === 'pt-BR' ? '/pt-BR/articles/artigo-de-teste' : '/en/articles/test-article';
        await page.goto(origin + articlePath);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        await page.keyboard.press('Tab'); await browserExpect(page.locator('.skip-link')).toBeFocused(); await browserExpect(page.locator('.skip-link')).toBeInViewport();
        await page.keyboard.press('Enter'); await browserExpect(page.locator('main')).toBeFocused();
        const [header, title] = await Promise.all([page.locator('[data-site-header]').boundingBox(), page.locator('h1').boundingBox()]);
        expect(header).toBeTruthy(); expect(title).toBeTruthy(); expect((title?.y ?? 0) >= (header?.y ?? 0) + (header?.height ?? 0)).toBe(true);
        for (const selector of ['.article-content img', '.article-code', '.metrics-table']) await browserExpect(page.locator(selector)).toBeVisible();
        expect(await page.locator('.article-content img').getAttribute('loading')).toBe('lazy'); expect(await page.locator('.article-content img').getAttribute('decoding')).toBe('async');
        if (width <= 375) {
            expect(await page.locator('.article-code').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
            expect(await page.locator('.metrics-table').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
        }
        const timing = await page.evaluate(() => { const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming; return {domContentLoaded: navigation.domContentLoadedEventEnd, load: navigation.loadEventEnd}; });
        metrics.push({locale, width, colorScheme: locale === 'pt-BR' ? 'light' : 'dark', ...timing});
        if (width === 320 || width === 1440) await page.screenshot({path: path.join(evidence, `${locale}-${width}.png`), fullPage: true});
        await context.close();
    }
}, 120_000);

it('E11: reduced-motion preference removes transition time without hiding content', async () => {
    const context = await browser.newContext({viewport: {width: 375, height: 900}, reducedMotion: 'reduce'});
    const page = await context.newPage(); await page.goto(origin + '/en/articles/test-article');
    const transitionSeconds = await page.locator('#main-navigation a').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
    expect(transitionSeconds).toBeLessThanOrEqual(0.001); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await context.close();
});
