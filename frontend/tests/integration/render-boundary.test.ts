import {readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

it('E04/E05: built HTML preserves public metadata, shell, outline and excludes bodies from client assets', () => {
    const build = buildFixture(editorialSnapshot);
    try {
        for (const article of editorialSnapshot.articles) {
            const html = readFileSync(path.join(build.dist, article.locale, 'articles', article.slug, 'index.html'), 'utf8');
            expect(html).toContain(article.title);
            expect(html).toContain(article.author.displayName);
            expect(html).toContain('17');
            expect(html).toContain(`dateTime="${article.publishedAt}"`);
            expect(html).toContain(`dateTime="${article.updatedAt}"`);
            expect(html).toContain(article.locale === 'en' ? 'September 13, 2026' : '13 de setembro de 2026');
            expect(html).toContain(`href="/${article.locale}/tags/test"`);
            expect(html).toContain(`href="/${article.locale}/series/test-series"`);
            expect(html).toContain('id="section-repeat-2"');
            expect(html).toContain('href="#section-repeat-2"');
            expect(html).toContain('class="site-footer"');
            expect(html).not.toContain('window.hostile=true');
            expect(html).not.toContain('javascript:alert');
            const assets = Array.from(html.matchAll(/src="(\/assets\/[^"]+\.js)"/g), match => match[1]);
            expect(assets.length).toBeGreaterThan(0);
            for (const asset of assets) {
                const code = readFileSync(path.join(build.dist, asset.slice(1)), 'utf8');
                expect(code).not.toContain('Texto público de teste');
                expect(code).not.toContain('fixture-e04-e05');
            }
            expect(html).toContain('/theme-init.js');
            const css = html.match(/href="(\/assets\/[^"]+\.css)"/)?.[1];
            expect(css).toBeTruthy();
            if (!css) throw new Error('Missing CSS');
            const styles = readFileSync(path.join(build.dist, css.slice(1)), 'utf8');
            expect(styles).toContain('site-header__menu-button');
            expect(styles).toContain('article-code');
        }
        expect(readFileSync(path.join(build.dist, 'redirects.conf'), 'utf8')).toContain('location = / { return 308 /pt-BR$is_args$args; }');
    } finally { build.dispose(); }
}, 120_000);
