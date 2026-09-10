import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import type {TestContext} from 'node:test';

export const backendRoot = resolve(__dirname, '../..');
export const runnerPath = join(backendRoot, 'scripts/test.mjs');

export function temporaryDirectory(t: TestContext): string {
    const parent = join(backendRoot, 'tmp');
    mkdirSync(parent, {recursive: true});
    const directory = mkdtempSync(join(parent, 'e01-test-'));
    t.after(() => {
        const target = resolve(directory);
        const within = relative(parent, target);
        if (!within || isAbsolute(within) || within.split(sep).includes('..')) {
            throw new Error('Refusing cleanup outside the test workspace.');
        }
        rmSync(target, {recursive: true, force: true});
    });
    return directory;
}

export function runNode(args: string[], cwd = backendRoot, overrides: NodeJS.ProcessEnv = {}) {
    const env = {...process.env, ...overrides};
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_OPTIONS;
    const result = spawnSync(process.execPath, args, {
        cwd, env, encoding: 'utf8', timeout: 120_000, maxBuffer: 10 * 1024 * 1024,
        windowsHide: true, shell: false,
    });
    if (result.error) throw result.error;
    return {...result, output: result.stdout + result.stderr};
}

export function runNpm(args: string[], cwd = backendRoot) {
    // npm supplies its CLI path, so subprocesses retain the exact Node under test.
    const candidates = [
        process.env.npm_execpath,
        join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
        resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    ];
    const cli = candidates.find((candidate) => candidate && existsSync(candidate));
    if (!cli) throw new Error('Run integration through npm test or npm run test:integration.');
    return runNode([cli, ...args], cwd);
}
