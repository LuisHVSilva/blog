import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, readFileSync, readdirSync} from 'node:fs';
import {createServer} from 'node:net';
import {join, resolve} from 'node:path';
import test from 'node:test';
import {backendRoot, runNode, runNpm, temporaryDirectory} from '../helpers/tooling';

async function unavailablePort(): Promise<number> {
    const server = createServer();
    await new Promise<void>((done, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', done);
    });
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    await new Promise<void>((done, reject) => server.close((error) => error ? reject(error) : done()));
    return address.port;
}

async function assertCompiledStartupFailsAtDatabase(project: string) {
    const result = runNode([join(project, 'dist/src/main.js')], project, {
        NODE_ENV: 'test', PORT: '3010', PUBLIC_SITE_URL: 'http://localhost:5173', DB_DIALECT: 'postgres', DB_HOST: '127.0.0.1',
        DB_PORT: String(await unavailablePort()), DB_NAME: 'blog_test_e01',
        DB_USERNAME: 'e01_fixture', DB_PASSWORD: 'e01_fixture_only', SYNC: 'false',
        CORS_ORIGINS: 'http://localhost:5173', LOG_SERVICE: 'e01-fixture',
    });
    assert.equal(result.signal, null, result.output);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /DEPENDENCY_UNAVAILABLE/);
    assert.doesNotMatch(result.output, /MODULE_NOT_FOUND|ERR_MODULE_NOT_FOUND|Cannot find module/);
    assert.doesNotMatch(result.output, /e01_fixture_only/);
}

test('E01-I01: npm build emits JavaScript that reaches the real driver without alias loaders', async (t) => {
    const project = temporaryDirectory(t);
    // The nearest package.json confines dotenv lookup to an empty, synthetic project.
    cpSync(join(backendRoot, 'package.json'), join(project, 'package.json'));
    const build = runNpm(['run', 'build', '--', '--outDir', join(project, 'dist')]);
    assert.equal(build.status, 0, build.output);
    const artifacts = readdirSync(join(project, 'dist'), {recursive: true}) as string[];
    for (const artifact of artifacts.filter((file) => file.endsWith('.js'))) {
        assert.doesNotMatch(readFileSync(join(project, 'dist', artifact), 'utf8'),
            /require\(["']@(shared|framework|logger|infrastructure)\//);
    }
    assert.ok(!artifacts.some((file) => file.startsWith('tests')));
    await assertCompiledStartupFailsAtDatabase(project);
});

test('E01-I02: clean source export installs from lockfile and passes lint/typecheck/unit/build', {timeout: 180_000}, async (t) => {
    const project = temporaryDirectory(t);
    // Export the working tree: git archive would omit this branch's uncommitted implementation.
    for (const filename of [
        'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.test.json',
        'eslint.config.mjs', '.node-version', '.env.example', '.gitignore', '.dockerignore',
        'src', 'scripts', 'migrations', 'tests',
    ]) cpSync(join(backendRoot, filename), join(project, filename), {recursive: true});
    cpSync(resolve(backendRoot, '../content'), join(project, 'content'), {recursive: true});
    assert.ok(!existsSync(join(project, 'node_modules')));
    assert.ok(!existsSync(join(project, 'dist')));
    assert.deepEqual(readdirSync(project).filter((file) => file.startsWith('.env')), ['.env.example']);
    const lock = readFileSync(join(project, 'package-lock.json'), 'utf8');
    // The initial npm ci (local/CI) populates the cache. This second install needs no registry.
    for (const args of [
        ['ci', '--offline', '--no-audit', '--no-fund'],
        ['run', 'lint'], ['run', 'typecheck'], ['run', 'test:unit'], ['run', 'build'],
        ['ci', '--omit=dev', '--offline', '--no-audit', '--no-fund'],
    ]) {
        const result = runNpm(args, project);
        assert.equal(result.status, 0, `npm ${args.join(' ')}\n${result.output}`);
    }
    assert.equal(readFileSync(join(project, 'package-lock.json'), 'utf8'), lock);
    assert.ok(!existsSync(join(project, 'node_modules/tsx')));
    assert.ok(!existsSync(join(project, 'node_modules/tsconfig-paths')));
    await assertCompiledStartupFailsAtDatabase(project);
});

test('E01-I02: Git protects environment paths while documentation is versionable', (t) => {
    const project = temporaryDirectory(t);
    const repository = resolve(backendRoot, '..');
    mkdirSync(join(project, 'backend'));
    cpSync(join(repository, '.gitignore'), join(project, '.gitignore'));
    cpSync(join(backendRoot, '.gitignore'), join(project, 'backend/.gitignore'));
    const git = (args: string[], cwd = project) => spawnSync('git', ['-c', `safe.directory=${cwd.replaceAll('\\', '/')}`, ...args], {
        cwd, encoding: 'utf8', timeout: 10_000, windowsHide: true,
    });
    assert.equal(git(['init', '--quiet']).status, 0);
    for (const file of ['.env', '.env.production', 'backend/.env.dev', 'backend/.env.test', 'frontend/.env.local']) {
        const result = git(['check-ignore', '--quiet', '--', file]);
        assert.equal(result.status, 0, `Not ignored: ${file}\n${result.stderr}`);
    }
    for (const file of ['backend/.env.example', 'docs/implementacao/00_COMECE_AQUI.md', 'docs/implementacao/implementado/P0-E01.md']) {
        assert.equal(git(['check-ignore', '--quiet', '--', file]).status, 1, `Unexpectedly ignored: ${file}`);
    }
    const tracked = git(['ls-files', '--cached'], repository);
    assert.equal(tracked.status, 0, tracked.stderr);
    const sensitive = tracked.stdout.split(/\r?\n/).filter((file) => /(^|\/)\.env(?:\.|$)/.test(file)
        && !/\.example$/.test(file));
    assert.deepEqual(sensitive, [], 'Environment paths must not be tracked (paths only).');
});

test('E01-I02: Docker context protections and runtime version pins remain explicit', () => {
    const patterns = readFileSync(join(backendRoot, '.dockerignore'), 'utf8').split(/\r?\n/)
        .map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
    for (const pattern of ['.env', '.env.*', 'node_modules/', 'dist/', 'LOGS/', '.git/']) {
        assert.ok(patterns.includes(pattern), `Missing context exclusion: ${pattern}`);
    }
    assert.deepEqual(patterns.filter((pattern) => pattern.startsWith('!')), ['!.env.example', '!.env.*.example']);
    const version = readFileSync(join(backendRoot, '.node-version'), 'utf8').trim();
    const pkg = JSON.parse(readFileSync(join(backendRoot, 'package.json'), 'utf8'));
    assert.equal(pkg.engines.node, version);
    assert.match(readFileSync(join(backendRoot, 'Dockerfile.develop'), 'utf8'),
        new RegExp(`^FROM node:${version.replaceAll('.', '\\.')}-alpine`, 'm'));
    const workflow = readFileSync(resolve(backendRoot, '../.github/workflows/backend-ci.yml'), 'utf8');
    assert.match(workflow, /node-version-file: backend\/\.node-version/);
    assert.match(workflow, /npm ci/);
    assert.match(workflow, /npm run ci/);
});
