import {chromium} from '@playwright/test';
import {strict as assert} from 'node:assert';
import {mkdirSync} from 'node:fs';

const origin = process.env.HOME_CHECK_ORIGIN ?? 'http://localhost:8080';
const browser = await chromium.launch();
mkdirSync('node_modules/.tmp/home-review', {recursive: true});
try {
    for (const locale of ['pt-BR', 'en']) for (const width of [390, 1440]) {
        const page = await browser.newPage({viewport: {width, height: 1000}, colorScheme: 'dark'});
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(`${origin}/${locale}`);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('.published-home > section').count(), 7);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('.home-newsletter input').count(), 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.equal(await page.locator('.home-featured').evaluate(el => getComputedStyle(el).display), 'grid');
        await page.screenshot({path: `node_modules/.tmp/home-review/${locale}-${width}.png`, fullPage: true});
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`${locale} ${width}px: HTTP 200, seven sections, CSS grid, no overflow or JS errors`);
    }
} finally { await browser.close(); }
