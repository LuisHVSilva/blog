import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {execFileSync} from 'node:child_process';
import {buildFixture} from '../build-fixture.mjs';
import {emptySnapshot, oneArticleSnapshot} from '../fixtures/published-snapshot.mjs';
import {promoteRelease, releaseDirectory, validateReleaseArtifact} from '../../scripts/release-artifact.mjs';

const tempRoot = path.resolve('node_modules/.tmp');

function releaseArtifact(root, snapshot) {
    const build = buildFixture(snapshot);
    try {
        const target = releaseDirectory(root, snapshot.revision);
        mkdirSync(path.dirname(target), {recursive: true}); cpSync(build.dist, target, {recursive: true});
        validateReleaseArtifact(target, snapshot); return target;
    } finally { build.dispose(); }
}

it('E12: keeps the prior release through invalid input, removes withdrawn content, and requires authorized rollback', () => {
    mkdirSync(tempRoot, {recursive: true}); const root = mkdtempSync(path.join(tempRoot, 'release-'));
    const revisionA = structuredClone(oneArticleSnapshot); revisionA.revision = 'fixture-release-a';
    const revisionC = structuredClone(emptySnapshot); revisionC.revision = 'fixture-release-c-withdrawn';
    try {
        releaseArtifact(root, revisionA); promoteRelease(root, revisionA.revision, revisionA.revision);
        const articlePath = 'pt-BR/articles/artigo-de-teste/index.html';
        expect(existsSync(path.join(root, 'current', articlePath))).toBe(true);
        expect(() => buildFixture({})).toThrow();
        expect(JSON.parse(readFileSync(path.join(root, 'current', 'publication.json'), 'utf8')).revision).toBe(revisionA.revision);
        releaseArtifact(root, revisionC); promoteRelease(root, revisionC.revision, revisionC.revision);
        expect(existsSync(path.join(root, 'current', articlePath))).toBe(false);
        expect(readFileSync(path.join(root, 'current', 'sitemap.xml'), 'utf8')).not.toContain(oneArticleSnapshot.articles[0].canonical);
        const target = releaseDirectory(root, revisionC.revision);
        for (const file of ['redirects.conf', 'en/catalog-index.json', 'en/articles/index.html', 'sitemap.xml']) {
            const original = readFileSync(path.join(target, file));
            writeFileSync(path.join(target, file), 'stale or incomplete release');
            expect(() => validateReleaseArtifact(target, revisionC)).toThrow(/integrity/);
            writeFileSync(path.join(target, file), original);
        }
        writeFileSync(path.join(target, 'withdrawn.html'), 'removed article');
        expect(() => validateReleaseArtifact(target, revisionC)).toThrow(/integrity/);
        rmSync(path.join(target, 'withdrawn.html'));
        expect(() => promoteRelease(root, revisionA.revision, revisionC.revision)).toThrow(/approved revision/);
        promoteRelease(root, revisionA.revision, revisionA.revision);
        expect(existsSync(path.join(root, 'current', articlePath))).toBe(true);
    } finally {
        if (path.dirname(root) !== tempRoot || !path.basename(root).startsWith('release-')) throw new Error('Unsafe test directory');
        rmSync(root, {recursive: true, force: true});
    }
}, 120_000);

it('E12: publishes frontend fixes for the same editorial revision and honors the selected snapshot path', () => {
    const build = buildFixture(oneArticleSnapshot);
    const workspace = path.dirname(build.dist);
    const releaseRoot = path.join(workspace, 'release');
    const selectedSnapshot = path.join(workspace, 'selected-snapshot.json');
    writeFileSync(selectedSnapshot, JSON.stringify(oneArticleSnapshot));
    writeFileSync(path.join(workspace, 'generated', 'published-content.json'), '{}');
    const options = {cwd: workspace, encoding: 'utf8', env: {...process.env, FRONTEND_RELEASE_ROOT: releaseRoot, FRONTEND_SNAPSHOT_PATH: selectedSnapshot}};
    try {
        const first = execFileSync(process.execPath, ['scripts/release-build.mjs'], options);
        writeFileSync(path.join(workspace, 'public', 'frontend-fix.txt'), 'new frontend version');
        const second = execFileSync(process.execPath, ['scripts/release-build.mjs'], options);
        expect(first.match(/artifact ([a-f0-9-]+)/u)?.[1]).not.toBe(second.match(/artifact ([a-f0-9-]+)/u)?.[1]);
        expect(readFileSync(path.join(releaseRoot, 'current', 'frontend-fix.txt'), 'utf8')).toBe('new frontend version');
        expect(JSON.parse(readFileSync(path.join(releaseRoot, 'current', 'publication.json'), 'utf8')).revision).toBe(oneArticleSnapshot.revision);
        const invalid = {...options, env: {...options.env, FRONTEND_RELEASE_APPROVED_REVISION: 'another-revision'}};
        expect(() => execFileSync(process.execPath, ['scripts/release-build.mjs'], {...invalid, stdio: 'pipe'})).toThrow();
        expect(readFileSync(path.join(releaseRoot, 'current', 'frontend-fix.txt'), 'utf8')).toBe('new frontend version');
    } finally { build.dispose(); }
}, 120_000);
