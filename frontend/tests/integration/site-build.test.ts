import {readFileSync} from 'node:fs';
import path from 'node:path';
import {expect, it} from 'vitest';
import {buildFixture} from '../build-fixture.mjs';
import {catalogSnapshot} from '../fixtures/catalog.mjs';

it('E09: builds localized institutional pages with useful links and no placeholder controls', () => {
    const build = buildFixture(catalogSnapshot);
    try {
        const about = readFileSync(path.join(build.dist, 'pt-BR', 'about', 'index.html'), 'utf8');
        const privacy = readFileSync(path.join(build.dist, 'en', 'privacy', 'index.html'), 'utf8');
        const contact = readFileSync(path.join(build.dist, 'pt-BR', 'contact', 'index.html'), 'utf8');
        const security = readFileSync(path.join(build.dist, 'en', 'security', 'index.html'), 'utf8');
        const projects = readFileSync(path.join(build.dist, 'pt-BR', 'projects', 'index.html'), 'utf8');
        expect(about).toContain('Sobre este site'); expect(about).toContain('apache.org/licenses/LICENSE-2.0');
        expect(privacy).toContain('Frontend privacy scope'); expect(privacy).toContain('blog.theme');
        expect(contact).toContain('github.com/LuisHVSilva/blog/issues'); expect(contact).not.toContain('<form'); expect(contact).not.toContain('mailto:');
        expect(security).toContain('No private security-reporting channel'); expect(security).toContain('github.com/LuisHVSilva/blog');
        expect(projects).toContain('Ainda nao ha projetos publicados.');
        for (const html of [about, privacy, contact, security]) { expect(html).not.toContain('<img'); expect(html).toContain('href="/'); }
    } finally { build.dispose(); }
}, 120_000);
