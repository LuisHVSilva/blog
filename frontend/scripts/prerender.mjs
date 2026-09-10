import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {render, snapshot} from '../.ssr/entry-server.js';

const root = path.resolve('dist');
const template = readFileSync(path.join(root, 'index.html'), 'utf8');
const escape = (text) => String(text).replace(/[&<>"']/gu, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const paths = ['/', '/pt-BR/articles', '/en/articles', '/pt-BR/tags', '/en/tags', '/pt-BR/series', '/en/series', ...snapshot.urlCatalog.map((item) => new URL(item.url).pathname), '/404.html'];
for (const pathname of paths) {
    if (pathname.includes('..') || !/^\/[a-zA-Z0-9/.-]*$/u.test(pathname)) throw new Error('Unsafe output path.');
    const {html, page} = render(pathname);
    const canonical = snapshot.siteOrigin + pathname;
    const title = page.article?.seo.title ?? page.series?.title ?? page.tag?.name ?? (page.found ? 'DevHub' : '404');
    const description = page.article?.seo.description ?? page.series?.description ?? page.tag?.description ?? '';
    const alternates = page.article?.alternates ?? [];
    const head = `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="publication-revision" content="${escape(snapshot.revision)}">`
        + (page.found ? `<link rel="canonical" href="${escape(canonical)}">` : '<meta name="robots" content="noindex">')
        + alternates.map((item) => `<link rel="alternate" hreflang="${item.locale}" href="${escape(item.url)}">`).join('')
        + `<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}">`;
    const output = template.replace(/<html[^>]*>/u, `<html lang="${page.locale}">`).replace(/<title>[\s\S]*?<\/title>/u, '').replace(/<meta\s+name="(?:description|robots)"[^>]*>/gu, '').replace('</head>', head + '</head>').replace('<div id="root"></div>', `<div id="root">${html}</div>`);
    const target = pathname === '/404.html' ? path.join(root, '404.html') : path.join(root, pathname.slice(1), 'index.html');
    mkdirSync(path.dirname(target), {recursive: true}); writeFileSync(target, output);
}
const urls = snapshot.urlCatalog.map((item) => `<url><loc>${escape(item.url)}</loc><lastmod>${item.lastmod}</lastmod>${item.alternates.map((alternate) => `<xhtml:link rel="alternate" hreflang="${alternate.locale}" href="${escape(alternate.url)}"/>`).join('')}</url>`).join('');
writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
writeFileSync(path.join(root, 'publication.json'), JSON.stringify({revision: snapshot.revision, urls: snapshot.urlCatalog.map((item) => item.url)}));
writeFileSync(path.join(root, 'redirects.conf'), snapshot.redirects.map((item) => `location = ${item.from} { return 308 ${item.to}; }`).join('\n'));
console.log(`Rendered ${snapshot.articles.length} translations for revision ${snapshot.revision}.`);
