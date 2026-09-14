import {cpSync, mkdirSync, mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tempRoot = path.join(root, 'node_modules', '.tmp');
export function buildFixture(snapshot) {
    mkdirSync(tempRoot, {recursive: true});
    const directory = mkdtempSync(path.join(tempRoot, 'editorial-'));
    const dispose = () => {
        if (path.dirname(directory) !== tempRoot || !path.basename(directory).startsWith('editorial-')) throw new Error('Unsafe test directory');
        rmSync(directory, {recursive: true, force: true});
    };
    try {
        for (const entry of ['src', 'scripts', 'public', 'index.html', 'package.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'vite.config.ts']) cpSync(path.join(root, entry), path.join(directory, entry), {recursive: true});
        mkdirSync(path.join(directory, 'generated'));
        if (snapshot !== undefined) writeFileSync(path.join(directory, 'generated', 'published-content.json'), typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot));
        writeFileSync(path.join(directory, 'public', 'fixture.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><rect width="80" height="40" fill="blue"/></svg>');
        execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: directory, stdio: 'pipe', timeout: 120000});
        return {dist: path.join(directory, 'dist'), dispose};
    } catch (error) {
        dispose();
        if (error && typeof error === 'object' && 'stdout' in error) {
            throw new Error(`Fixture build failed:\n${error.stdout?.toString() ?? ''}\n${error.stderr?.toString() ?? ''}`, {cause: error});
        }
        throw error;
    }
}
