import {createServer} from 'node:http';
import {renderToStaticMarkup} from 'react-dom/server';
import {chromium} from '@playwright/test';
import {expect, it} from 'vitest';
import {PublishedMarkdown} from '../../src/features/articles/components/article-detail/PublishedMarkdown';

it('E05: PT/EN TOC navigates to actual sections with and without JavaScript; hostile markup stays inert', async () => {
    const body = '# Section\n\n## Same\n\n## Same\n\n```js\n# Code only\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- Parent\n  - Child\n\n[Attack](javascript:alert%281%29)\n\n<script>window.hostile=true</script>';
    const server = createServer((request, response) => {
        const locale = request.url?.startsWith('/en') ? 'en' : 'pt-BR';
        response.setHeader('content-type', 'text/html; charset=utf-8');
        response.end('<!doctype html><html lang="' + locale + '"><body><h1>Editorial</h1>' + renderToStaticMarkup(<PublishedMarkdown title="Editorial" locale={locale} body={body}/>) + '</body></html>');
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing TCP address');
    const browser = await chromium.launch();
    try {
        for (const locale of ['pt-BR', 'en']) for (const javaScriptEnabled of [true, false]) {
            const context = await browser.newContext({javaScriptEnabled});
            const page = await context.newPage();
            await page.goto(`http://127.0.0.1:${address.port}/${locale}`);
            const nav = page.getByRole('navigation', {name: locale === 'en' ? 'On this page' : 'Nesta página'});
            expect(await nav.getByRole('link').count()).toBe(3);
            await nav.getByRole('link', {name: 'Same', exact: true}).last().click();
            expect(new URL(page.url()).hash).toBe('#section-same-2');
            expect(await page.locator('#section-same-2').textContent()).toBe('Same');
            expect(await page.locator('table tbody td').allTextContents()).toEqual(['1', '2']);
            expect(await page.locator('li li').textContent()).toBe('Child');
            expect(await page.locator('script').count()).toBe(0);
            expect(await page.getByText('Attack', {exact: true}).getAttribute('href')).toBeNull();
            await context.close();
        }
    } finally {
        await browser.close();
        await new Promise<void>(resolve => server.close(() => resolve()));
    }
}, 30_000);
