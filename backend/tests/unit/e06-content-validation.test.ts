import assert from 'node:assert/strict';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {parse} from 'yaml';
import {parseContentRoot} from '../../src/modules/publishing/adapters/cli/content-parser';
import {ContentValidationService} from '../../src/modules/publishing/domain/services/contentValidation.service';
import {ContentHashService} from '../../src/modules/publishing/adapters/content-revision';
import {argument, validateArguments} from '../../src/modules/publishing/adapters/cli/arguments';
import {temporaryDirectory} from '../helpers/tooling';

const contentRoot = existsSync('../content/catalog.yaml') ? '../content' : 'content';

test('E06: the real catalogue has twelve UTF-8 translations with meaningful AST text and references', async () => {
    const result = await parseContentRoot(contentRoot);
    assert.equal(result.length, 12);
    assert.equal(new ContentValidationService().validate(result).valid, true);
    assert.equal(result.catalog.authors[0]?.displayName, 'Luis Henrique de Vasconcelos Silva');
    for (const item of result) { assert.doesNotMatch(item.body, /mistÃ|vocÃ|configuraÃ/u); assert.match(item.sourceRevision!, /^[a-f0-9]{64}$/u); }
});
test('E06: duplicate YAML, traversal, hash mismatch and active HTML fail; fenced code remains text', async (t) => {
    const root = temporaryDirectory(t);
    const catalog = parse(readFileSync(path.join(contentRoot, 'catalog.yaml'), 'utf8'));
    catalog.articles = [catalog.articles[0]]; catalog.series = [];
    writeFileSync(path.join(root, 'catalog.yaml'), JSON.stringify(catalog));
    const directory = path.join(root, 'articles', catalog.articles[0].id); mkdirSync(directory, {recursive: true});
    const target = path.join(directory, 'pt-BR.md');
    const header = `---\ntranslationId: 21111111-1111-4111-8111-111111111111\nlocale: pt-BR\nslug: valid\ntitle: Valid\ndescription: Valid description\n`;
    writeFileSync(target, header + '---\n# Valid\n\n```html\n<script>alert(1)</script>\n```\n');
    assert.equal(new ContentValidationService().validate(await parseContentRoot(root)).valid, true);
    writeFileSync(target, header + 'title: duplicate\n---\nBody');
    await assert.rejects(parseContentRoot(root), /YAML/);
    writeFileSync(target, header + '---\n<script>alert(1)</script>');
    await assert.rejects(parseContentRoot(root), /active HTML/);
    writeFileSync(target, header + `sourceRevision: ${'0'.repeat(64)}\n---\nBody`);
    await assert.rejects(parseContentRoot(root), /SOURCE_REVISION_MISMATCH/);
    catalog.articles[0].id = '../../outside'; writeFileSync(path.join(root, 'catalog.yaml'), JSON.stringify(catalog));
    await assert.rejects(parseContentRoot(root));
});
test('E06/E07: hashes normalize line endings and CLI missing options never read another argument', () => {
    const item = {locale: 'pt-BR', slug: 'valid', title: 'Title', description: 'Description', bodyMarkdown: 'One\r\nTwo', seo: {title: 'Title', description: 'Description'}};
    assert.equal(new ContentHashService().revision(item), new ContentHashService().revision({...item, bodyMarkdown: 'One\nTwo'}));
    assert.notEqual(new ContentHashService().revision(item), new ContentHashService().revision({...item, title: 'Changed'}));
    assert.equal(argument(['--root', 'content'], '--revision'), undefined);
    assert.throws(() => argument(['--root', '--revision', 'x'], '--root'));
    assert.throws(() => validateArguments(['--unknown'], [], []));
    assert.throws(() => validateArguments(['--dry-run', '--dry-run'], [], ['--dry-run']));
    assert.doesNotThrow(() => validateArguments(['--revision', 'edition-1', '--dry-run'], ['--revision'], ['--dry-run']));
});
