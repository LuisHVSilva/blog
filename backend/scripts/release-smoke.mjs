import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export function validateSnapshot(snapshot, revision) {
    if (snapshot.schemaVersion !== 1 || !revision || snapshot.revision !== revision) throw new Error('Release revision diverges from the snapshot.');
    for (const field of ['articles', 'tags', 'series', 'redirects', 'urlCatalog']) if (!Array.isArray(snapshot[field])) throw new Error(`Invalid snapshot ${field}.`);
    const origin = new URL(snapshot.siteOrigin).origin;
    if (origin !== snapshot.siteOrigin || !Number.isFinite(Date.parse(snapshot.generatedAt))) throw new Error('Invalid snapshot metadata.');
    const ids = new Set(); const urls = new Set();
    for (const article of snapshot.articles) {
        if (!article.translationId || ids.has(article.translationId) || !article.bodyMarkdown?.trim() || !article.title || !article.author?.id || !Array.isArray(article.tags) || !Array.isArray(article.series) || !Array.isArray(article.alternates)) throw new Error('Invalid article projection.');
        if (article.canonical !== `${origin}/${article.locale}/articles/${article.slug}` || !['pt-BR', 'en'].includes(article.locale)) throw new Error('Invalid canonical URL.');
        if ('status' in article || 'sourceRevision' in article || 'operator' in article) throw new Error('Private editorial fields in snapshot.');
        ids.add(article.translationId);
    }
    for (const item of snapshot.urlCatalog) {
        if (urls.has(item.url) || new URL(item.url).origin !== origin) throw new Error('Duplicate or foreign URL.');
        urls.add(item.url);
    }
    for (const article of snapshot.articles) if (!urls.has(article.canonical)) throw new Error('Article absent from URL catalogue.');
    return snapshot;
}
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
export async function smoke(snapshot, revision, base, apiBase = base) {
    validateSnapshot(snapshot, revision);
    if (!base) return {revision, articles: snapshot.articles.length, mode: 'offline'};
    const get = async (pathname) => {
        const response = await fetch(new URL(pathname, pathname.startsWith('/api/') ? apiBase : base), {redirect: 'manual', signal: AbortSignal.timeout(5000)});
        return response;
    };
    const manifestResponse = await get('/publication.json');
    if (!manifestResponse.ok) throw new Error('Site publication manifest is unavailable.');
    const manifest = await manifestResponse.json();
    if (manifest.revision !== revision || !Array.isArray(manifest.urls)) throw new Error('Site revision diverges.');
    const sitemap = await (await get('/sitemap.xml')).text();
    for (const url of manifest.urls) {
        const parsed = new URL(url);
        if (parsed.origin !== snapshot.siteOrigin || parsed.search || parsed.hash || !sitemap.includes(`<loc>${url}</loc>`)) throw new Error('Site discovery artifact diverges.');
        const pageResponse = await get(parsed.pathname); const pageHtml = await pageResponse.text();
        if (!pageResponse.ok || !pageHtml.includes(`rel="canonical" href="${url}"`)) throw new Error('Site canonical artifact diverges.');
    }
    for (const article of snapshot.articles) {
        if (apiBase) {
            const response = await get(`/api/v1/articles/by-slug/${article.locale}/${article.slug}`);
            if (!response.ok) throw new Error('Public article API is unavailable.');
            const live = await response.json();
            if (live.translationId !== article.translationId || live.bodyMarkdown !== article.bodyMarkdown || live.updatedAt !== article.updatedAt) throw new Error('API and snapshot diverge.');
        }
        const htmlResponse = await get(new URL(article.canonical).pathname);
        const html = await htmlResponse.text();
        if (!htmlResponse.ok || !html.includes(`lang="${article.locale}"`) || !html.includes(escape(article.title)) || !html.includes(`content="${revision}"`) || !html.includes('<article') || !html.includes('<p>')) throw new Error('Article HTML is incomplete or stale.');
        if (!sitemap.includes(article.canonical.replaceAll('&', '&amp;'))) throw new Error('Article is absent from sitemap.');
    }
    if (apiBase) for (const locale of ['pt-BR', 'en']) {
        const response = await get(`/api/v1/articles?locale=${locale}&limit=50`);
        const page = await response.json();
        if (!response.ok || page.pagination.total !== snapshot.articles.filter((article) => article.locale === locale).length) throw new Error('API catalogue count diverges.');
    }
    const missing = await get('/p0-smoke-missing-path');
    if (missing.status !== 404 || missing.headers.get('x-robots-tag') !== 'noindex, follow') throw new Error('Unknown site paths must return noindex 404.');
    for (const redirect of [{from: '/', to: '/pt-BR/articles'}, {from: '/pt-BR', to: '/pt-BR/articles'}, {from: '/en', to: '/en/articles'}, ...snapshot.redirects]) {
        const response = await get(redirect.from);
        if (response.status !== 308 || new URL(response.headers.get('location'), base).pathname !== redirect.to) throw new Error('Redirect diverges.');
    }
    return {revision, articles: snapshot.articles.length, mode: apiBase ? 'api-and-html' : 'html-only'};
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const [filename, revision, base, apiBase] = process.argv.slice(2);
    Promise.resolve().then(() => smoke(JSON.parse(readFileSync(filename, 'utf8')), revision, base, apiBase === '-' ? false : apiBase)).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
