import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {promoteRelease, releaseDirectory, validateReleaseArtifact} from './release-artifact.mjs';

const args = process.argv.slice(2);
const value = (name) => {
    const index = args.indexOf(name);
    return index < 0 || args[index + 1]?.startsWith('--') ? undefined : args[index + 1];
};
const revision = value('--revision');
const approvedRevision = value('--approved-revision');
const releaseRoot = path.resolve(process.env.FRONTEND_RELEASE_ROOT ?? '/release');
if (!revision || !approvedRevision) throw new Error('Provide --revision and --approved-revision.');
const base = releaseDirectory(releaseRoot, revision);
const artifactName = value('--artifact');
const candidates = readdirSync(path.dirname(base)).filter((name) => name === path.basename(base) || name.startsWith(path.basename(base) + '-'));
if (!artifactName && candidates.length !== 1) throw new Error('Provide --artifact with the exact directory printed by release:build.');
if (artifactName && (!candidates.includes(artifactName) || path.basename(artifactName) !== artifactName)) throw new Error('Invalid release artifact.');
const artifact = path.join(path.dirname(base), artifactName ?? candidates[0]);
const publication = JSON.parse(readFileSync(path.join(artifact, 'publication.json'), 'utf8'));
validateReleaseArtifact(artifact, {
    revision,
    siteOrigin: new URL(publication.urls[0] ?? 'http://localhost').origin,
    urlCatalog: publication.urls.map((url) => ({url}))
});
promoteRelease(releaseRoot, revision, approvedRevision, artifact);
console.log(`Promoted authorized frontend release ${revision}.`);
