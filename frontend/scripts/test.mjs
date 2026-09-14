import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';

const suite = process.argv[2] ?? 'all';
const suites = suite === 'all' ? ['unit', 'integration', 'browser'] : [suite];
if (!['all', 'unit', 'integration', 'browser'].includes(suite)) throw new Error(`Unknown test suite: ${suite}`);

for (const currentSuite of suites) {
    const root = `tests/${currentSuite}`;
    const hasTests = existsSync(root) && readdirSync(root, {recursive: true}).some((entry) => /\.(test|spec)\.[cm]?[jt]sx?$/u.test(entry));
    if (!hasTests) throw new Error(`Expected test suite is empty: ${root}`);
    const result = spawnSync('vitest', ['run', '--maxWorkers=1', root], {
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
}
