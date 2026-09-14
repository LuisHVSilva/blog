import {describe, expect, it} from 'vitest';
import {resolvePublishedPageFromSnapshot} from '../../src/content/resolve-published-page';
import {pageMetadata, safeJsonLd} from '../../src/seo/metadata';
import {catalogSnapshot} from '../fixtures/catalog.mjs';
import {editorialSnapshot} from '../fixtures/editorial.mjs';

describe('page metadata', () => {
    it('uses canonical published routes and reciprocal alternates only', () => {
        const pt = pageMetadata(editorialSnapshot, resolvePublishedPageFromSnapshot(editorialSnapshot, '/pt-BR/articles/artigo-de-teste'));
        const en = pageMetadata(editorialSnapshot, resolvePublishedPageFromSnapshot(editorialSnapshot, '/en/articles/test-article'));
        expect(pt.canonical).toBe('http://127.0.0.1/pt-BR/articles/artigo-de-teste');
        expect(pt.alternates).toEqual([{locale: 'pt-BR', url: pt.canonical}, {locale: 'en', url: en.canonical}]);
        expect(en.alternates).toEqual([{locale: 'pt-BR', url: pt.canonical}, {locale: 'en', url: en.canonical}]);
    });

    it('provides localized metadata for structural pages and excludes errors', () => {
        const archive = pageMetadata(catalogSnapshot, resolvePublishedPageFromSnapshot(catalogSnapshot, '/pt-BR/articles/page/2'));
        const home = pageMetadata(catalogSnapshot, resolvePublishedPageFromSnapshot(catalogSnapshot, '/pt-BR'));
        const privacy = pageMetadata(catalogSnapshot, resolvePublishedPageFromSnapshot(catalogSnapshot, '/en/privacy'));
        const missing = pageMetadata(catalogSnapshot, resolvePublishedPageFromSnapshot(catalogSnapshot, '/en/unknown'));
        expect(archive.title).toContain('pagina 2'); expect(archive.alternates).toEqual([{locale: 'pt-BR', url: 'https://catalog.example.test/pt-BR/articles/page/2'}]);
        expect(privacy.description).toContain('no sign-up'); expect(privacy.alternates).toHaveLength(2);
        expect(home.canonical).toBe('https://catalog.example.test/pt-BR'); expect(home.alternates).toHaveLength(2);
        expect(missing.canonical).toBeUndefined(); expect(missing.robots).toBe('noindex, follow');
    });

    it('serializes JSON-LD without allowing a script terminator', () => {
        const serialized = safeJsonLd({description: '</script><script>window.pwned=true</script>'});
        expect(serialized).not.toContain('</script>'); expect(JSON.parse(serialized)).toEqual({description: '</script><script>window.pwned=true</script>'});
    });
});
