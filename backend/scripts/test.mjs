import {spawn} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const suites = ['unit', 'integration', 'api'];

function discover(directory) {
    if (!existsSync(directory)) return [];
    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const filename = join(directory, entry.name);
        if (entry.isDirectory()) return discover(filename);
        return entry.isFile() && /\.test\.(?:ts|mjs|cjs|js)$/.test(entry.name) ? [filename] : [];
    }).sort();
}

try {
    const args = process.argv.slice(2);
    let root = join(backendRoot, 'tests');
    const selected = [];
    while (args.length) {
        const arg = args.shift();
        if (arg === '--root' && args[0]) root = resolve(args.shift());
        else if (suites.includes(arg)) selected.push(arg);
        else throw new Error(`Unknown argument: ${arg}. Use unit, integration, api or --root <directory>.`);
    }

    // E01 requires unit and integration. API joins the default gate when introduced.
    if (!selected.length) {
        selected.push('unit', 'integration');
        if (existsSync(join(root, 'api'))) selected.push('api');
    }
    const files = [...new Set(selected)].flatMap((suite) => {
        const found = discover(join(root, suite));
        if (!found.length) throw new Error(`No tests found for suite "${suite}" in ${join(root, suite)}.`);
        return found;
    });
    console.log(`Running ${files.length} test file(s): ${[...new Set(selected)].join(', ')}.`);
    const env = {...process.env, NODE_ENV: 'test'};
    // A runner exercised from node:test must start its own independent test harness.
    delete env.NODE_TEST_CONTEXT;
    const child = spawn(process.execPath, ['--import', 'tsx', '--test', ...files], {
        cwd: backendRoot, env, stdio: 'inherit', shell: false,
    });
    child.on('error', (error) => {
        console.error(`Could not start tests: ${error.message}`);
        process.exitCode = 1;
    });
    child.on('close', (code) => { process.exitCode = code ?? 1; });
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
