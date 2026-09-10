import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {redactSensitive} from '../../src/infrastructure/logging/redact-sensitive';
import {backendRoot, runnerPath, runNode, temporaryDirectory} from '../helpers/tooling';

test('E01-U01: redacts nested objects and arrays without changing ordinary values or the input', () => {
    const input = {
        title: 'Artigo público', count: 3, enabled: true, absent: null,
        nested: {token: 'fake-token', Authorization: 'Bearer fake-auth', cookie: 'fake-session'},
        items: [{password: 'fake-password', client_secret: 'fake-secret', api_key: 'fake-key'}, 'plain'],
        date: new Date('2026-09-09T12:00:00.000Z'),
    };
    assert.deepEqual(redactSensitive(input), {
        title: 'Artigo público', count: 3, enabled: true, absent: null,
        nested: {token: '[REDACTED]', Authorization: '[REDACTED]', cookie: '[REDACTED]'},
        items: [{password: '[REDACTED]', client_secret: '[REDACTED]', api_key: '[REDACTED]'}, 'plain'],
        date: '2026-09-09T12:00:00.000Z',
    });
    assert.equal(input.nested.token, 'fake-token');
    assert.equal(redactSensitive(undefined), undefined);
});

test('E01-U01: sanitizes PEM, credentials and OAuth query strings, including Error messages/stacks', () => {
    const input = 'Bearer fake-bearer Basic fake-basic https://example.test/callback?code=fake-code&token=fake-token&lang=pt '
        + '-----BEGIN PRIVATE KEY-----\nfake-pem\n-----END PRIVATE KEY----- password-reset/fake-reset';
    const expected = 'Bearer [REDACTED] Basic [REDACTED] https://example.test/callback?code=[REDACTED]&token=[REDACTED]&lang=pt '
        + '-----BEGIN PRIVATE KEY-----[REDACTED]-----END PRIVATE KEY----- password-reset/[REDACTED]';
    assert.equal(redactSensitive(input), expected);
    const error = new Error(input);
    error.stack = `Error: ${input}`;
    assert.deepEqual(redactSensitive(error), {name: 'Error', message: expected, stack: `Error: ${expected}`});
});

test('E01-U01: terminates circular objects and arrays', () => {
    const circular: Record<string, unknown> = {title: 'preserved'};
    circular.self = circular;
    const array: unknown[] = [];
    array.push(array);
    assert.deepEqual(redactSensitive(circular), {title: 'preserved', self: '[Circular]'});
    assert.deepEqual(redactSensitive(array), ['[Circular]']);
});

test('E01-U02: missing/empty suites and unknown arguments fail', (t) => {
    const root = temporaryDirectory(t);
    for (const suite of ['unit', 'integration', 'api']) {
        const missing = runNode([runnerPath, suite, '--root', root]);
        assert.equal(missing.status, 1, missing.output);
        assert.match(missing.output, /No tests found/);
        mkdirSync(join(root, suite));
        const empty = runNode([runnerPath, suite, '--root', root]);
        assert.equal(empty.status, 1, empty.output);
    }
    assert.equal(runNode([runnerPath, 'typo', '--root', root]).status, 1);
});

test('E01-U02: discovers nested TypeScript tests with spaces in paths and propagates failure', (t) => {
    const root = temporaryDirectory(t);
    const nested = join(root, 'unit', 'nested with spaces');
    mkdirSync(nested, {recursive: true});
    writeFileSync(join(nested, 'passing.test.ts'),
        "import test from 'node:test'; import assert from 'node:assert/strict'; const value: number = 2; test('fixture pass', () => assert.equal(value, 2));");
    const passing = runNode([runnerPath, 'unit', '--root', root], root);
    assert.equal(passing.status, 0, passing.output);
    assert.match(passing.output, /fixture pass/);
    writeFileSync(join(nested, 'failing.test.ts'),
        "import test from 'node:test'; import assert from 'node:assert/strict'; test('fixture deliberate failure', () => assert.fail('expected failure'));");
    const failing = runNode([runnerPath, 'unit', '--root', root], root);
    assert.equal(failing.status, 1, failing.output);
    assert.match(failing.output, /fixture deliberate failure/);
});

test('E01: lint rejects forbidden dependencies and accepts domain/ports', (t) => {
    const directory = temporaryDirectory(t);
    const fixtures = [
        ['domain', "import fs from 'node:fs';", false],
        ['domain', "import fs from 'fs';", false],
        ['domain', "import type {Request} from 'express';", false],
        ['domain', 'export const value = process.env.NODE_ENV;', false],
        ['domain', "export * from '../application/service';", false],
        ['domain', "export type T = import('sequelize').Transaction;", false],
        ['application', "import {db} from '../adapters/postgres/store';", false],
        ['application', "const driver = require('pg');", false],
        ['application', "const driver = import('node:fs');", false],
        ['application', "import type {SortInput} from '../../../shared/types/persistence.type';", false],
        ['adapters', "import {router} from '../../identity/adapters/http/router';", false],
        ['domain', "import {article} from './article';", true],
        ['domain', "import {EntityBase} from '../../../shared/domain/entity.base';", true],
        ['domain', "import {EntityAuditBase} from '../../../shared/domain/entity-audit.base';", true],
        ['domain', "import {Other} from '../../../shared/domain/other';", false],
        ['application', "import {article} from '../domain/article'; import type {Store} from './ports/store';", true],
        ['application', "import type {Identity} from '../../identity/application/ports/identity';", true],
        ['adapters', "import {getArticle} from '../application/get-article';", true],
    ] as const;
    // lintText applies the real config to virtual future module paths.
    for (const [layer, code, valid] of fixtures) {
        const script = join(directory, 'lint-input.mjs');
        writeFileSync(script, `import {ESLint} from ${JSON.stringify(pathToFileURL(join(backendRoot, 'node_modules/eslint/lib/api.js')).href)};\n`
            + `const eslint = new ESLint({cwd: ${JSON.stringify(backendRoot)}});\n`
            + `const results = await eslint.lintText(${JSON.stringify(code)}, {filePath: 'src/modules/publishing/${layer}/fixture.ts'});\n`
            + 'console.log(JSON.stringify(results[0].messages)); process.exitCode = results[0].errorCount ? 1 : 0;');
        const result = runNode([script]);
        assert.equal(result.status, valid ? 0 : 1, `${code}\n${result.output}`);
        assert.doesNotMatch(result.output, /Parsing error/);
        if (!valid) assert.match(result.output, /architecture\/boundaries|no-restricted-globals/);
    }
});
