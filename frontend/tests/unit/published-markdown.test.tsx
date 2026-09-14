import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {PublishedMarkdown} from '../../src/features/articles/components/article-detail/PublishedMarkdown';
import {safeArticleUrl} from '../../src/features/articles/components/article-detail/markdown-policy';

export const body = '# Editorial\n\n# Seção *real*\n\n## Repetido\n\n## Repetido\n\n## Repetido 2\n\n```ts\n# Fora do sumário\n```\n\n| A | B |\n| - | - |\n| um | dois |\n\n- Pai\n  - Filho\n\n![Imagem](/image.png)\n\n[Seguro](https://example.test) [Perigoso](javascript:alert%281%29)\n\n<script>window.hostile=true</script>\n';

describe('E05 Markdown', () => {
    it('keeps ordinary h2/h3 hierarchy and existing internal links', () => {
        const html = renderToStaticMarkup(<PublishedMarkdown title="Editorial" locale="en" body={'# Editorial\n\n[Jump](#intro)\n\n## Intro\n\n### Detail'}/>);
        expect(html).toContain('<h2 id="section-intro">Intro</h2>');
        expect(html).toContain('<h3 id="section-detail">Detail</h3>');
        expect(html).toContain('href="#section-intro">Jump</a>');
        expect(html).not.toContain('<h1');
    });
    it('uses unique matching TOC targets and preserves GFM and sections', () => {
        const html = renderToStaticMarkup(<PublishedMarkdown body={body} title="Editorial" locale="pt-BR"/>);
        expect(html).toContain('aria-label="Nesta página"');
        const ids = Array.from(html.matchAll(/ id="([^"]+)"/g), match => match[1]);
        expect(ids).toEqual(['section-secao-real', 'section-repetido', 'section-repetido-2', 'section-repetido-2-2']);
        for (const id of ids) expect(html).toContain(`href="#${id}"`);
        expect(html).not.toContain('<h1');
        expect(html).toContain('<h2 id="section-secao-real">Seção <em>real</em></h2>');
        expect(html).toContain('<table>');
        expect(html).toContain('<li>Filho</li>');
        expect(html).toContain('src="/image.png"');
        expect(html).toContain('# Fora do sumário');
        expect(ids).not.toContain('section-fora-do-sumario');
        expect(html).not.toContain('<script');
        expect(html).not.toContain('href="javascript:');
    });
    it('rejects executable asset protocols and preserves safe destinations', () => {
        expect(safeArticleUrl('data:text/html,payload', 'src')).toBeUndefined();
        expect(safeArticleUrl('javascript:alert(1)', 'href')).toBeUndefined();
        expect(safeArticleUrl('mailto:author@example.test', 'href')).toBe('mailto:author@example.test');
        expect(safeArticleUrl('/image.png', 'src')).toBe('/image.png');
    });
});
