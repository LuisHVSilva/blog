import type {PublishedLocale} from '../../routing/public-routes';

export type SitePage = 'about' | 'privacy' | 'contact' | 'security';

type Link = { href: string; label: string };
export type SitePageCopy = { eyebrow: string; title: string; paragraphs: string[]; links: Link[] };

const pages: Record<PublishedLocale, Record<SitePage, SitePageCopy>> = {
    'pt-BR': {
        about: {
            eyebrow: 'Sobre',
            title: 'Sobre este site',
            paragraphs: ['DevHub e uma publicacao tecnica organizada em artigos, tags e trilhas editoriais.', 'Esta versao publica somente conteudo editorial confirmado. Projetos e biografia nao sao exibidos enquanto nao houver material aprovado para eles.'],
            links: [{
                href: 'https://github.com/LuisHVSilva/blog',
                label: 'Repositorio do projeto'
            }, {href: 'https://www.apache.org/licenses/LICENSE-2.0', label: 'Licenca Apache-2.0'}]
        },
        privacy: {
            eyebrow: 'Privacidade',
            title: 'Escopo de privacidade do frontend',
            paragraphs: ['O frontend publico atual nao oferece cadastro, formulario de contato, newsletter ou analitica.', 'A preferencia de tema pode ser guardada somente no navegador com a chave blog.theme. Esta pagina nao descreve logs, backups ou configuracoes do provedor de hospedagem; esses dados operacionais ainda precisam de uma politica confirmada antes do release.'],
            links: []
        },
        contact: {
            eyebrow: 'Contato',
            title: 'Contato e correcoes',
            paragraphs: ['O canal publico confirmado para correcoes e sugestoes sobre o repositorio e o rastreador de issues.', 'Nao ha endereco de email nem formulario de contato publicado nesta versao. Nao envie credenciais ou dados sensiveis em uma issue publica.'],
            links: [{href: 'https://github.com/LuisHVSilva/blog/issues', label: 'Abrir ou consultar issues'}]
        },
        security: {
            eyebrow: 'Seguranca',
            title: 'Relato de seguranca',
            paragraphs: ['Nenhum canal privado de relato de seguranca esta configurado ou documentado neste checkout.', 'Nao publique credenciais, snapshots ou detalhes exploraveis em issues. Antes de aceitar relatos de seguranca em producao, o responsavel operacional precisa configurar e divulgar um canal privado.'],
            links: [{href: 'https://github.com/LuisHVSilva/blog', label: 'Repositorio do projeto'}]
        },
    },
    en: {
        about: {
            eyebrow: 'About',
            title: 'About this site',
            paragraphs: ['DevHub is a technical publication organized into articles, tags, and editorial series.', 'This version publishes only confirmed editorial material. Projects and a biography are not shown until approved material exists.'],
            links: [{
                href: 'https://github.com/LuisHVSilva/blog',
                label: 'Project repository'
            }, {href: 'https://www.apache.org/licenses/LICENSE-2.0', label: 'Apache-2.0 license'}]
        },
        privacy: {
            eyebrow: 'Privacy',
            title: 'Frontend privacy scope',
            paragraphs: ['The current public frontend has no sign-up, contact form, newsletter, or analytics.', 'A theme preference may be stored only in the browser under the blog.theme key. This page does not describe hosting-provider logs, backups, or configuration; those operational facts need a confirmed policy before release.'],
            links: []
        },
        contact: {
            eyebrow: 'Contact',
            title: 'Contact and corrections',
            paragraphs: ['The confirmed public channel for repository corrections and suggestions is the issue tracker.', 'This version publishes no email address or contact form. Do not send credentials or sensitive data in a public issue.'],
            links: [{href: 'https://github.com/LuisHVSilva/blog/issues', label: 'Open or browse issues'}]
        },
        security: {
            eyebrow: 'Security',
            title: 'Security reporting',
            paragraphs: ['No private security-reporting channel is configured or documented in this checkout.', 'Do not publish credentials, snapshots, or exploitable details in issues. Before accepting production security reports, the operational owner must configure and publish a private channel.'],
            links: [{href: 'https://github.com/LuisHVSilva/blog', label: 'Project repository'}]
        },
    },
};

export function sitePageCopy(locale: PublishedLocale, page: SitePage): SitePageCopy {
    return pages[locale][page];
}
