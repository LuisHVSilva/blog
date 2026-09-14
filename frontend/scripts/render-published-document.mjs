export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/gu, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
}

/** Keeps development SSR and the static release head byte-for-byte equivalent. */
export function renderPublishedDocument(template, {html, pageMetadata, revision, jsonLd}) {
    const head = `<title>${escapeHtml(pageMetadata.title)}</title><meta name="description" content="${escapeHtml(pageMetadata.description)}"><meta name="robots" content="${pageMetadata.robots}"><meta name="publication-revision" content="${escapeHtml(revision)}">`
        + (pageMetadata.canonical ? `<link rel="canonical" href="${escapeHtml(pageMetadata.canonical)}">` : '')
        + pageMetadata.alternates.map((item) => `<link rel="alternate" hreflang="${item.locale}" href="${escapeHtml(item.url)}">`).join('')
        + `<meta property="og:type" content="${pageMetadata.openGraphType}"><meta property="og:title" content="${escapeHtml(pageMetadata.title)}"><meta property="og:description" content="${escapeHtml(pageMetadata.description)}">`
        + (pageMetadata.canonical ? `<meta property="og:url" content="${escapeHtml(pageMetadata.canonical)}">` : '')
        + `<meta property="og:locale" content="${pageMetadata.locale === 'pt-BR' ? 'pt_BR' : 'en_US'}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(pageMetadata.title)}"><meta name="twitter:description" content="${escapeHtml(pageMetadata.description)}"><script type="application/ld+json">${jsonLd}</script>`;
    return template.replace(/<html[^>]*>/u, `<html lang="${pageMetadata.locale}">`).replace(/<title>[\s\S]*?<\/title>/u, '').replace(/<meta\s+name="(?:description|robots)"[^>]*>/gu, '').replace('</head>', head + '</head>').replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}
