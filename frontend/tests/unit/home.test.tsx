import {renderToStaticMarkup} from 'react-dom/server';
import {expect, it} from 'vitest';
import {PublishedHome} from '../../src/features/site/PublishedHome';
import {snapshotSchema} from '../../src/content/published-schema';
import {oneArticleSnapshot, emptySnapshot} from '../fixtures/published-snapshot.mjs';

it('renders every reference section with real content or preparation, without collecting email', () => {
    for (const fixture of [emptySnapshot, oneArticleSnapshot]) {
        const html = renderToStaticMarkup(<PublishedHome snapshot={snapshotSchema.parse(fixture)} locale="pt-BR"/>);
        for (const section of ['Destaques editoriais', 'Áreas de conhecimento', 'Séries técnicas', 'Laboratório de projetos', 'Últimas publicações', 'Engenharia semanal']) expect(html).toContain(section);
        expect(html).toContain('Em preparação');
        expect(html).not.toContain('<form');
        expect(html).not.toContain('href="#"');
        expect(html).not.toContain('4.2k');
        expect(html).not.toContain('Leitura sem JavaScript');
    }
});

it('rejects home references to nonexistent or differently localized articles', () => {
    const home = {locale: 'en', featuredTranslationIds: [oneArticleSnapshot.articles[0].translationId], latestTranslationIds: [], tagIds: [], seriesIds: [], projectsStatus: 'preparing', newsletterStatus: 'preparing'};
    expect(snapshotSchema.safeParse({...oneArticleSnapshot, home: [home]}).success).toBe(false);
    expect(snapshotSchema.safeParse({...oneArticleSnapshot, home: [{...home, locale: 'pt-BR'}]}).success).toBe(true);
});
