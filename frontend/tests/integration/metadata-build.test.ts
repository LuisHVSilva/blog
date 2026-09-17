import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

function outputFile(dist: string, pathname: string) {
    return path.join(dist, pathname === '/' ? 'index.html' : pathname.slice(1), 'index.html');
}

it('E10: pre-renders specific localized metadata, safe JSON-LD and one-revision discovery files', () => {
    const metadataSnapshot = structuredClone(editorialSnapshot);
    metadataSnapshot.articles[0].title = 'Visible </script><script>window.pwned=true</script> heading';
    metadataSnapshot.articles[0].seo = {title: metadataSnapshot.articles[0].title, description: 'A description for the visible heading.'};
    const build = buildFixture(metadataSnapshot);
    try {
        const article = readFileSync(outputFile(build.dist, '/pt-BR/articles/artigo-de-teste'), 'utf8');
        const privacy = readFileSync(outputFile(build.dist, '/en/privacy'), 'utf8');
        const missing = readFileSync(path.join(build.dist, '404.html'), 'utf8');
        expect(article).toContain('<html lang="pt-BR">'); expect(article).toContain('<meta name="twitter:card" content="summary">');
        expect(article).toContain('<meta property="og:type" content="article">'); expect(article).toContain('rel="canonical" href="http://127.0.0.1/pt-BR/articles/artigo-de-teste"');
        expect(article).toContain('hreflang="en" href="http://127.0.0.1/en/articles/test-article"');
        expect(article).not.toContain('</script><script>window.pwned=true</script>');
        const jsonLd = article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
        expect(jsonLd).toBeTruthy(); expect(JSON.parse(jsonLd ?? '{}').headline).toBe(metadataSnapshot.articles[0].title);
        expect(privacy).toContain('<html lang="en">'); expect(privacy).toContain('Frontend privacy scope | Stackcraft'); expect(privacy).toContain('rel="canonical" href="http://127.0.0.1/en/privacy"');
        expect(missing).toContain('<meta name="robots" content="noindex, follow">'); expect(missing).not.toContain('rel="canonical"');
        expect(readFileSync(path.join(build.dist, 'robots.txt'), 'utf8')).toBe('User-agent: *\nAllow: /\nSitemap: http://127.0.0.1/sitemap.xml\n');
        expect(readFileSync(path.join(build.dist, 'publication.json'), 'utf8')).toContain(metadataSnapshot.revision);
    } finally { build.dispose(); }
}, 120_000);

it('E10: sitemap contains only static canonical 200 destinations from the same snapshot', () => {
    const build = buildFixture(catalogSnapshot);
    try {
        const sitemap = readFileSync(path.join(build.dist, 'sitemap.xml'), 'utf8');
        const urls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu), (match) => match[1]);
        expect(urls).toContain('https://catalog.example.test/pt-BR/articles/page/2');
        expect(urls).toContain('https://catalog.example.test/en/privacy');
        expect(urls).toContain('https://catalog.example.test/pt-BR/tags/platform');
        expect(urls).not.toContain('404'); expect(urls.some((url) => url.includes('?'))).toBe(false);
        const institutional = sitemap.match(/<url><loc>https:\/\/catalog.example.test\/en\/privacy<\/loc>(.*?)<\/url>/u)?.[1];
        expect(institutional).toBeDefined(); expect(institutional).not.toContain('<lastmod>');
        for (const url of urls) {
            const pathname = new URL(url).pathname;
            const file = outputFile(build.dist, pathname);
            expect(existsSync(file)).toBe(true);
            expect(readFileSync(file, 'utf8')).toContain(`rel="canonical" href="${url}"`);
        }
        const nginx = readFileSync(path.resolve(import.meta.dirname, '../../../deploy/nginx.conf'), 'utf8');
        expect(nginx).toContain('map $args $query_robots_tag'); expect(nginx).toContain('add_header X-Robots-Tag $query_robots_tag always');
    } finally { build.dispose(); }
}, 120_000);
