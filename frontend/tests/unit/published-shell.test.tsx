import {renderToStaticMarkup} from 'react-dom/server';
import {expect, it} from 'vitest';
import {SiteHeader} from '../../src/components/layout/SiteHeader';
import {SiteFooter} from '../../src/components/layout/SiteFooter';

it('E04: SSR shell uses supplied locale, actual alternates, and operable published destinations', () => {
    const html = renderToStaticMarkup(<><SiteHeader locale="en" pathname="/en/articles" languageLinks={[{locale: 'pt-BR', url: '/pt-BR/articles/test'}]}/><SiteFooter locale="en"/></>);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('href="/pt-BR/articles/test"');
    expect(html).not.toContain('href="#top"');
    expect(html).toContain('data-search-open="true"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('href="#search"');
    expect(html).toContain('hidden=""');
    expect(html).toContain('href="/en/tags"');
});
