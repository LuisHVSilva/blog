import {describe, expect, it} from 'vitest';
import {canonicalPath, enumerateStaticPaths, resolvePublicRoute, rootRedirects} from '../../src/routing/public-routes';
import {oneArticleSnapshot} from '../fixtures/published-snapshot.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

describe('public routes', () => {
    it('uses a deterministic root redirect and localized home pages', () => {
        expect(rootRedirects()).toEqual([
            {from: '/', to: '/pt-BR'},
        ]);
        expect(resolvePublicRoute(oneArticleSnapshot, '/')).toMatchObject({kind: 'redirect', to: '/pt-BR'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/pt-BR')).toMatchObject({kind: 'home', locale: 'pt-BR'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/en')).toMatchObject({kind: 'home', locale: 'en'});
    });

    it('only resolves explicit published locales and canonical catalogue paths', () => {
        const articlePath = canonicalPath(oneArticleSnapshot.articles[0].canonical);
        expect(resolvePublicRoute(oneArticleSnapshot, `${articlePath}/`)).toMatchObject({kind: 'article', locale: 'pt-BR', pathname: articlePath});
        expect(resolvePublicRoute(oneArticleSnapshot, '/fr/articles')).toMatchObject({kind: 'not-found'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/en/articles/artigo-de-teste')).toMatchObject({kind: 'not-found', locale: 'en'});
    });

    it('enumerates all localized index pages and public catalogue entries from one registry', () => {
        expect(enumerateStaticPaths(oneArticleSnapshot)).toEqual(expect.arrayContaining([
            '/pt-BR', '/en', '/pt-BR/articles', '/en/articles', '/pt-BR/tags', '/en/tags', '/pt-BR/series', '/en/series', '/pt-BR/about', '/en/privacy', '/pt-BR/contact', '/en/security', '/pt-BR/projects', '/en/projects', '/pt-BR/articles/artigo-de-teste',
        ]));
    });

    it('enumerates and resolves the localized institutional pages from the same registry', () => {
        expect(resolvePublicRoute(oneArticleSnapshot, '/en/privacy')).toMatchObject({kind: 'site', locale: 'en', page: 'privacy'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/pt-BR/projects')).toMatchObject({kind: 'site', locale: 'pt-BR', page: 'projects'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/pt-BR/security')).toMatchObject({kind: 'site', locale: 'pt-BR', page: 'security'});
        expect(resolvePublicRoute(oneArticleSnapshot, '/en/unknown')).toMatchObject({kind: 'not-found'});
    });

    it('enumerates real archive pages and rejects pages beyond the localized catalog', () => {
        expect(enumerateStaticPaths(catalogSnapshot)).toEqual(expect.arrayContaining(['/pt-BR/articles/page/2']));
        expect(resolvePublicRoute(catalogSnapshot, '/pt-BR/articles/page/2')).toMatchObject({kind: 'archive', locale: 'pt-BR', page: 2});
        expect(resolvePublicRoute(catalogSnapshot, '/pt-BR/articles/page/3')).toMatchObject({kind: 'not-found'});
        expect(resolvePublicRoute(catalogSnapshot, '/pt-BR/articles/page/1')).toMatchObject({kind: 'not-found'});
    });
});
