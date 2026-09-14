import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {sealReleaseArtifact} from './release-artifact.mjs';
import {escapeHtml, renderPublishedDocument} from './render-published-document.mjs';

const distDir = process.env.FRONTEND_BUILD_OUT_DIR ?? 'dist';
const ssrDir = process.env.FRONTEND_SSR_OUT_DIR ?? '.ssr';
const {
    render,
    metadata,
    safeJsonLd,
    snapshot,
    enumerateStaticPaths,
    nginxRedirects,
    localCatalogIndex
} = await import(pathToFileURL(path.resolve(ssrDir, 'entry-server.js')).href);

const root = path.resolve(distDir);
const template = readFileSync(path.join(root, 'index.html'), 'utf8');
const paths = [...enumerateStaticPaths(snapshot), '/404.html'];
for (const pathname of paths) {
    if (pathname.includes('..') || !/^\/[a-zA-Z0-9/.-]*$/u.test(pathname)) throw new Error('Unsafe output path.');
    const {html} = render(pathname);
    const pageMetadata = metadata(pathname);
    const output = renderPublishedDocument(template, {
        html,
        pageMetadata,
        revision: snapshot.revision,
        jsonLd: safeJsonLd(pageMetadata.jsonLd),
    });
    const target = pathname === '/404.html' ? path.join(root, '404.html') : path.join(root, pathname.slice(1), 'index.html');
    mkdirSync(path.dirname(target), {recursive: true}); writeFileSync(target, output);
}
const urls = enumerateStaticPaths(snapshot).map((pathname) => {
    const pageMetadata = metadata(pathname);
    if (!pageMetadata.canonical || pageMetadata.robots !== 'index, follow') throw new Error(`Non-indexable route in sitemap: ${pathname}`);
    const lastmod = snapshot.urlCatalog.find((item) => item.url === pageMetadata.canonical)?.lastmod;
    return `<url><loc>${escapeHtml(pageMetadata.canonical)}</loc>${lastmod ? `<lastmod>${escapeHtml(lastmod)}</lastmod>` : ''}${pageMetadata.alternates.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${escapeHtml(alternate.url)}"/>`).join('')}</url>`;
}).join('');
writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${snapshot.siteOrigin}/sitemap.xml\n`);
writeFileSync(path.join(root, 'publication.json'), JSON.stringify({
    revision: snapshot.revision,
    urls: enumerateStaticPaths(snapshot).map((pathname) => metadata(pathname).canonical)
}));
for (const locale of ['pt-BR', 'en']) {
    const indexTarget = path.join(root, locale, 'catalog-index.json');
    mkdirSync(path.dirname(indexTarget), {recursive: true});
    writeFileSync(indexTarget, JSON.stringify(localCatalogIndex(snapshot, locale)));
}
writeFileSync(path.join(root, 'redirects.conf'), nginxRedirects(snapshot));
sealReleaseArtifact(root, snapshot);
console.log(`Rendered ${snapshot.articles.length} translations for revision ${snapshot.revision}.`);
