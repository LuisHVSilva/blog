import {cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {buildFixture} from '../build-fixture.mjs';
import {oneArticleSnapshot, emptySnapshot} from '../fixtures/published-snapshot.mjs';
import {promoteRelease, releaseDirectory, validateReleaseArtifact} from '../../scripts/release-artifact.mjs';

const tempRoot = path.resolve('node_modules/.tmp');
mkdirSync(tempRoot, {recursive: true});
const root = mkdtempSync(path.join(tempRoot, 'nginx-audit-'));
const config = path.join(root, 'compose.json');
const project = `frontend-audit-${process.pid}`;
const docker = (...args) => execFileSync('docker', ['compose', '-p', project, '-f', config, ...args], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
const releaseRoot = path.join(root, 'site');
// Relative Linux symlinks are created inside the Linux container, not Windows junctions.
const revisionA = {...structuredClone(oneArticleSnapshot), revision: 'host-a'};
revisionA.redirects = [{from: '/pt-BR/articles/old-title', to: '/pt-BR/articles/artigo-de-teste', status: 308}];
const revisionC = {...structuredClone(emptySnapshot), revision: 'host-c-withdrawn'};
function artifact(snapshot) {
    const build = buildFixture(snapshot);
    try {
        const target = releaseDirectory(releaseRoot, snapshot.revision);
        mkdirSync(path.dirname(target), {recursive: true});
        cpSync(build.dist, target, {recursive: true});
        validateReleaseArtifact(target, snapshot);
        return path.basename(target);
    } finally { build.dispose(); }
}
function activate(directory) {
    docker('run', '--rm', '--no-deps', '--entrypoint', 'sh', 'writer', '-c', `ln -s releases/${directory} /site/next && mv -Tf /site/next /site/current`);
}
try {
    writeFileSync(config, JSON.stringify({services: {
        writer: {image: 'nginx:alpine', volumes: [{type: 'bind', source: releaseRoot, target: '/site'}]},
        web: {image: 'nginx:alpine', ports: ['127.0.0.1::80'], volumes: [
            {type: 'bind', source: releaseRoot, target: '/usr/share/nginx/html', read_only: true},
            {type: 'bind', source: path.resolve('../deploy/nginx.conf'), target: '/etc/nginx/nginx.conf', read_only: true},
        ]},
    }}));
    const a = artifact(revisionA);
    const c = artifact(revisionC);
    activate(a);
    docker('up', '-d', 'web');
    docker('exec', '-T', 'web', 'nginx', '-t');
    const origin = `http://${docker('port', 'web', '80').trim()}`;
    async function response(url, status) {
        const result = await fetch(origin + url, {redirect: 'manual'});
        assert.equal(result.status, status, url);
        return result;
    }
    function assertSecurityHeaders(result) {
        assert.equal(result.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(result.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
        assert.equal(result.headers.get('x-frame-options'), 'DENY');
    }
    for (const [url, destination] of [['/', '/pt-BR'], ['/pt-BR/articles/old-title/', '/pt-BR/articles/artigo-de-teste']]) {
        const result = await response(url, 308);
        assert.equal(new URL(result.headers.get('location'), origin).pathname, destination);
    }
    for (const url of ['/fr/articles', '/en/articles/missing', '/pt-BR/articles/page/1']) {
        const result = await response(url, 404);
        assert.equal(result.headers.get('cache-control'), 'no-store');
        assert.match(result.headers.get('x-robots-tag'), /noindex/);
        assertSecurityHeaders(result);
    }
    const manifest = await (await response('/publication.json', 200)).json();
    for (const url of manifest.urls) {
        const page = await response(new URL(url).pathname, 200);
        assertSecurityHeaders(page);
        const html = await page.text();
        assert.ok(html.includes(`rel="canonical" href="${url}"`));
        assert.ok(html.includes('content="host-a"'));
    }
    assert.match((await response('/en/articles?tag=test', 200)).headers.get('x-robots-tag'), /noindex/);
    assert.throws(() => buildFixture({}));
    assert.equal((await (await response('/publication.json', 200)).json()).revision, revisionA.revision);
    activate(c); docker('exec', '-T', 'web', 'nginx', '-s', 'reload');
    // New requests use a new connection so old workers draining keep-alives cannot mask activation.
    const withdrawn = await fetch(origin + '/pt-BR/articles/artigo-de-teste', {headers: {connection: 'close'}});
    assert.equal(withdrawn.status, 404);
    const deadline = Date.now() + 10_000;
    let aliasStatus;
    do {
        aliasStatus = (await fetch(origin + '/pt-BR/articles/old-title', {redirect: 'manual', headers: {connection: 'close'}})).status;
        if (aliasStatus === 404) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
    } while (Date.now() < deadline);
    assert.equal(aliasStatus, 404, 'withdrawn alias after configuration reload');
    assert.ok(!(await (await response('/sitemap.xml', 200)).text()).includes('artigo-de-teste'));
    assert.throws(() => promoteRelease(releaseRoot, revisionA.revision, revisionC.revision), /approved revision/);
    activate(a); docker('exec', '-T', 'web', 'nginx', '-s', 'reload');
    await response('/pt-BR/articles/artigo-de-teste', 200);
    console.log(JSON.stringify({host: 'nginx:alpine', api: 'absent throughout', valid: manifest.urls.length, invalidBuild: 'preserved A', withdrawal: '404 and absent from sitemap', rollback: 'explicitly authorized A', status: 'passed'}, null, 2));
} finally {
    if (path.dirname(root) !== tempRoot || !path.basename(root).startsWith('nginx-audit-')) throw new Error('Unsafe audit directory');
    try {
        // Docker-created Linux symlinks on a Windows bind mount must be unlinked by Linux.
        docker('run', '--rm', '--no-deps', '--entrypoint', 'sh', 'writer', '-c', 'if [ -L /site/current ]; then unlink /site/current; fi');
    } finally {
        docker('down', '--remove-orphans');
        rmSync(root, {recursive: true, force: true});
    }
}
