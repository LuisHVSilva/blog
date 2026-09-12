import assert from 'node:assert/strict';
import test from 'node:test';
import {loadMarkdownReader} from '../../src/modules/publishing/adapters/cli/markdown-reader';

test('Markdown reading retains visible text and accepts fenced HTML as code', async () => {
    const read = await loadMarkdownReader();
    assert.equal(read('# Title\n\nPlain **text** and [link](https://example.test).', 'en.md'), 'TitlePlain text and link.');
    assert.match(read('\x60\x60\x60html\n<script>alert(1)</script>\n\x60\x60\x60', 'en.md'), /<script>/);
});

test('Markdown reading rejects active HTML and unsafe links with the original file diagnostic', async () => {
    const read = await loadMarkdownReader();
    for (const body of ['<script>alert(1)</script>', '<div onclick="run()">text</div>']) {
        assert.throws(() => read(body, 'en.md'), {
            name: 'Error', message: 'en.md: active HTML is not allowed outside code fences.'
        });
    }
    for (const url of ['javascript:alert(1)', 'vbscript:run', 'data:text/plain,body']) {
        assert.throws(() => read('[link](' + url + ')', 'pt-BR.md'), {
            name: 'Error', message: 'pt-BR.md: unsafe URL.'
        });
    }
});
