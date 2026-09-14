import {readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

const evidence = path.resolve('node_modules/.tmp/e11-build-metrics.json');

function filesRecursively(directory: string): string[] {
    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? filesRecursively(target) : [target];
    });
}

it('E11: records bounded client assets and keeps editorial bodies out of them', () => {
    const build = buildFixture(editorialSnapshot);
    try {
        const assets = filesRecursively(path.join(build.dist, 'assets'));
        const javascript = assets.filter((file) => file.endsWith('.js'));
        const styles = assets.filter((file) => file.endsWith('.css'));
        const metrics = {
            javascriptBytes: javascript.reduce((total, file) => total + statSync(file).size, 0),
            cssBytes: styles.reduce((total, file) => total + statSync(file).size, 0),
            javascriptFiles: javascript.length,
            cssFiles: styles.length,
            fixtureRevision: editorialSnapshot.revision,
        };
        writeFileSync(evidence, JSON.stringify(metrics, null, 2));
        // Baseline: 8,283 B JS / 35,458 B CSS. Allow bounded growth for validation and recovery UI.
        expect(metrics.javascriptBytes).toBeLessThan(14_000);
        expect(metrics.cssBytes).toBeLessThan(45_000);
        expect(metrics.javascriptFiles).toBeGreaterThan(0); expect(metrics.cssFiles).toBeGreaterThan(0);
        const clientCode = javascript.map((file) => readFileSync(file, 'utf8')).join('\n');
        expect(clientCode).not.toContain('Texto pÃºblico de teste'); expect(clientCode).not.toContain(editorialSnapshot.revision);
    } finally { build.dispose(); }
}, 120_000);
