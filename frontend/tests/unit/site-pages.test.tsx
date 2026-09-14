import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {PublishedSitePage} from '../../src/features/site/PublishedSitePage';

describe('institutional pages', () => {
    it('uses confirmed public repository destinations without inventing a contact form', () => {
        const html = renderToStaticMarkup(<PublishedSitePage locale="pt-BR" page="contact"/>);
        expect(html).toContain('https://github.com/LuisHVSilva/blog/issues');
        expect(html).not.toContain('<form'); expect(html).not.toContain('mailto:'); expect(html).not.toContain('<img');
    });

    it('keeps the privacy and security limitations explicit in both locales', () => {
        expect(renderToStaticMarkup(<PublishedSitePage locale="pt-BR" page="privacy"/>)).toContain('nao oferece cadastro');
        expect(renderToStaticMarkup(<PublishedSitePage locale="en" page="security"/>)).toContain('No private security-reporting channel');
    });
});
