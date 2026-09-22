import {
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
    symlinkSync,
    writeFileSync
} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

function outputFile(root, pathname) {
    return pathname === '/' ? path.join(root, 'index.html') : path.join(root, pathname.slice(1), 'index.html');
}

const escape = (text) => String(text).replace(/[&<>"']/gu, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[char]));
const digest = (value) => createHash('sha256').update(value).digest('hex');

function stableJson(value) {
    if (Array.isArray(value)) return value.map(stableJson);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, stableJson(value[key])]));
    return value;
}

function snapshotForIntegrity(snapshot) {
    // `publishedContent` parses this through snapshotSchema, which supplies an
    // empty projects collection when an older snapshot omits it. Seal and
    // verification must hash that same representation.
    return {projects: [], ...snapshot};
}

const snapshotDigest = (snapshot) => digest(JSON.stringify(stableJson(snapshotForIntegrity(snapshot))));

function artifactFiles(root, relative = '') {
    return readdirSync(path.join(root, relative), {withFileTypes: true}).flatMap((entry) => {
        const name = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isSymbolicLink()) throw new Error('Release artifact contains a symbolic link.');
        return entry.isDirectory() ? artifactFiles(root, name) : name === 'integrity.json' ? [] : [name];
    }).sort();
}

export function sealReleaseArtifact(root, snapshot) {
    const files = Object.fromEntries(artifactFiles(root).map((file) => [file, digest(readFileSync(path.join(root, file)))]));
    writeFileSync(path.join(root, 'integrity.json'), JSON.stringify({
        revision: snapshot.revision,
        snapshotDigest: snapshotDigest(snapshot),
        files
    }));
}

export function releaseDirectory(releaseRoot, revision) {
    return path.join(releaseRoot, 'releases', createHash('sha256').update(revision).digest('hex'));
}

export function validateReleaseArtifact(root, snapshot) {
    const integrity = JSON.parse(readFileSync(path.join(root, 'integrity.json'), 'utf8'));
    const files = artifactFiles(root);
    if (integrity.revision !== snapshot.revision || !integrity.files || JSON.stringify(files) !== JSON.stringify(Object.keys(integrity.files).sort())
        || files.some((file) => digest(readFileSync(path.join(root, file))) !== integrity.files[file])
        || (snapshot.schemaVersion && integrity.snapshotDigest !== snapshotDigest(snapshot))) throw new Error('Release integrity diverges from its validated build.');
    const publicationFile = path.join(root, 'publication.json');
    const sitemapFile = path.join(root, 'sitemap.xml');
    if (!existsSync(publicationFile) || !existsSync(sitemapFile) || !existsSync(path.join(root, 'robots.txt')) || !existsSync(path.join(root, 'redirects.conf'))) throw new Error('Release artifact is incomplete.');
    const publication = JSON.parse(readFileSync(publicationFile, 'utf8'));
    if (publication.revision !== snapshot.revision || !Array.isArray(publication.urls) || !publication.urls.every((url) => typeof url === 'string')) throw new Error('Release publication manifest diverges from the snapshot.');
    const urls = new Set(publication.urls);
    if (urls.size !== publication.urls.length || snapshot.urlCatalog.some((item) => !urls.has(item.url))) throw new Error('Release manifest is missing published catalogue URLs.');
    const sitemap = readFileSync(sitemapFile, 'utf8');
    for (const url of publication.urls) {
        const parsed = new URL(url);
        if (parsed.origin !== snapshot.siteOrigin || parsed.search || parsed.hash) throw new Error('Release manifest contains a non-canonical URL.');
        const htmlFile = outputFile(root, parsed.pathname);
        if (!existsSync(htmlFile)) throw new Error(`Release HTML is missing for ${parsed.pathname}.`);
        const html = readFileSync(htmlFile, 'utf8');
        if (!html.includes(`rel="canonical" href="${escape(url)}"`) || !html.includes(`name="publication-revision" content="${escape(snapshot.revision)}"`) || !sitemap.includes(`<loc>${escape(url)}</loc>`)) throw new Error(`Release metadata diverges for ${parsed.pathname}.`);
    }
    const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gu)].map((match) => match[1]);
    if (sitemapUrls.length !== urls.size || sitemapUrls.some((url) => !publication.urls.some((item) => escape(item) === url))) throw new Error('Release sitemap contains extra URLs.');
    for (const locale of ['pt-BR', 'en']) {
        const index = JSON.parse(readFileSync(path.join(root, locale, 'catalog-index.json'), 'utf8'));
        if (index.revision !== snapshot.revision || index.locale !== locale || !Array.isArray(index.articles)
            || index.articles.some((article) => !urls.has(article.canonical) || article.locale !== locale || 'bodyMarkdown' in article)) throw new Error('Release catalog index diverges.');
    }
    return publication;
}

export function promoteRelease(releaseRoot, revision, approvedRevision, artifactDirectory = releaseDirectory(releaseRoot, revision)) {
    if (!approvedRevision || revision !== approvedRevision) throw new Error('Rollback or promotion requires the exact approved revision.');
    const target = path.resolve(artifactDirectory);
    if (path.dirname(target) !== path.resolve(releaseRoot, 'releases')) throw new Error('Release target is outside the release directory.');
    if (!existsSync(target)) throw new Error('Approved release artifact does not exist.');
    const publication = JSON.parse(readFileSync(path.join(target, 'publication.json'), 'utf8'));
    validateReleaseArtifact(target, {
        revision,
        siteOrigin: new URL(publication.urls[0]).origin,
        urlCatalog: publication.urls.map((url) => ({url}))
    });
    const current = path.join(releaseRoot, 'current');
    const next = path.join(releaseRoot, `.current-${process.pid}-${Date.now()}`);
    mkdirSync(releaseRoot, {recursive: true});
    symlinkSync(path.relative(releaseRoot, target), next, process.platform === 'win32' ? 'junction' : 'dir');
    try {
        renameSync(next, current);
    } catch (error) {
        if (process.platform !== 'win32' || !existsSync(current)) throw error;
        // Windows has no replacement rename for an existing directory junction. Production runs this path in Linux.
        if (!lstatSync(current).isSymbolicLink()) throw error;
        rmSync(current, {recursive: true, force: true});
        renameSync(next, current);
    } finally {
        if (existsSync(next) && lstatSync(next).isSymbolicLink()) rmSync(next, {force: true});
    }
    writeFileSync(path.join(releaseRoot, 'current-revision.txt'), `${revision}\n`);
    return target;
}
