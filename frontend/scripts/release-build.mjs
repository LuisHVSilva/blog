import {existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {promoteRelease, releaseDirectory, validateReleaseArtifact} from './release-artifact.mjs';

const releaseRoot = path.resolve(process.env.FRONTEND_RELEASE_ROOT ?? '/release');
const snapshotFile = path.resolve(process.env.FRONTEND_SNAPSHOT_PATH ?? 'generated/published-content.json');
const snapshot = JSON.parse(readFileSync(snapshotFile, 'utf8'));
const revisionDirectory = releaseDirectory(releaseRoot, snapshot.revision);
const staging = path.join(releaseRoot, `.staging-${process.pid}-${Date.now()}`);
// Keep SSR below /app so Node can resolve the application's node_modules while prerendering.
const ssr = path.resolve(`.release-ssr-${process.pid}-${Date.now()}`);

mkdirSync(path.dirname(revisionDirectory), {recursive: true});
const currentManifest = path.join(releaseRoot, 'current', 'publication.json');
const currentRevision = existsSync(currentManifest) ? JSON.parse(readFileSync(currentManifest, 'utf8')).revision : undefined;
const existed = readdirSync(path.dirname(revisionDirectory)).some((name) => name === path.basename(revisionDirectory) || name.startsWith(path.basename(revisionDirectory) + '-'));
const approvedRevision = process.env.FRONTEND_RELEASE_APPROVED_REVISION ?? (existed && currentRevision !== snapshot.revision ? undefined : snapshot.revision);
if (approvedRevision !== snapshot.revision) throw new Error('Rebuilding an older revision requires the exact approved revision.');
try {
    const result = spawnSync(process.execPath, ['scripts/build.mjs'], {stdio: 'inherit',
        env: {
            ...process.env,
            FRONTEND_SNAPSHOT_PATH: snapshotFile,
            FRONTEND_BUILD_OUT_DIR: staging,
            FRONTEND_SSR_OUT_DIR: ssr
        }
    });
    if (result.status !== 0) throw new Error(`Frontend build failed with status ${result.status ?? 'unknown'}.`);
    validateReleaseArtifact(staging, snapshot);
    // The same editorial revision can receive a frontend fix. Never silently reuse its old code.
    const buildDigest = createHash('sha256').update(readFileSync(path.join(staging, 'integrity.json'))).digest('hex');
    const target = `${revisionDirectory}-${buildDigest}`;
    if (existsSync(target)) validateReleaseArtifact(target, snapshot);
    else renameSync(staging, target);
    promoteRelease(releaseRoot, snapshot.revision, approvedRevision, target);
    console.log(`Promoted frontend release ${snapshot.revision}; artifact ${path.basename(target)}.`);
} finally {
    if (existsSync(staging)) rmSync(staging, {recursive: true, force: true});
    if (existsSync(ssr)) rmSync(ssr, {recursive: true, force: true});
}
