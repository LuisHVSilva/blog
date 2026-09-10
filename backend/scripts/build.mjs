import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync, realpathSync, rmSync} from 'node:fs';
import {dirname, join, relative, isAbsolute, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
// A normal build replaces only its generated dist. Isolated test outputs are fresh directories.
if (!args.length && existsSync(join(root, 'dist'))) {
    const target = realpathSync(join(root, 'dist'));
    const within = relative(root, target);
    if (within !== 'dist' || isAbsolute(within) || within.split(sep).includes('..')) throw new Error('Build output is not the backend dist directory.');
    for (const entry of readdirSync(target)) rmSync(join(target, entry), {recursive: true, force: true});
}
const result = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(root, 'tsconfig.json'), ...args], {
    cwd: root, stdio: 'inherit', shell: false,
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
