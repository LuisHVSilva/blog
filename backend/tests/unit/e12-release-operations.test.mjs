import assert from 'node:assert/strict';
import {createHash, randomBytes} from 'node:crypto';
import test from 'node:test';
import {encryptDump} from '../../scripts/backup.mjs';
import {decryptDump, restoreTarget} from '../../scripts/restore.mjs';
import {validateSnapshot} from '../../scripts/release-smoke.mjs';

test('E12: encrypted backup authenticates bytes and restore rejects unsafe targets', () => {
    const key = randomBytes(32); const dump = Buffer.from('database fixture'); const encrypted = encryptDump(dump, key);
    const checksum = createHash('sha256').update(encrypted).digest('hex');
    assert.deepEqual(decryptDump(encrypted, key, checksum), dump);
    assert.throws(() => decryptDump(encrypted, randomBytes(32), checksum));
    assert.throws(() => decryptDump(Buffer.concat([encrypted, Buffer.from('x')]), key, checksum), /checksum/);
    for (const name of ['blog_production', '', 'blog_test_', 'blog_test_x;drop database test']) assert.throws(() => restoreTarget(name));
    assert.equal(restoreTarget('blog_test_restore'), 'blog_test_restore');
});
test('E12: snapshot validation rejects missing projections and revision divergence', () => {
    const snapshot = {schemaVersion: 1, revision: 'r1', generatedAt: '2026-09-09T00:00:00Z', siteOrigin: 'https://example.test', articles: [], tags: [], series: [], redirects: [], urlCatalog: []};
    assert.equal(validateSnapshot(snapshot, 'r1'), snapshot);
    assert.throws(() => validateSnapshot(snapshot, 'r2'), /revision/);
    assert.throws(() => validateSnapshot({...snapshot, series: undefined}, 'r1'), /series/);
});
