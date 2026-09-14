import {searchCopy} from './i18n/published-copy';
import './components/style/globals.scss';
import './components/style/SiteHeader.scss';
import './components/style/SiteFooter.scss';
import './components/style/Container.scss';
import './components/style/Button.scss';
import './components/style/ArticleDetailPage.scss';
import './components/style/ArticlesArchivePage.scss';
import './components/style/TaxonomyPages.scss';
import './components/style/PublishedSearchDialog.scss';
import './components/style/SiteInstitutionalPage.scss';
import './components/style/PublishedHome.scss';
import {type BrowserArticleSummary, type BrowserCatalogIndex, isCatalogIndex} from './content/browser-catalog';
import {parseSearchQuery, searchPublishedArticles} from './features/search/search-catalog';
import {archivePath, publicPath} from './routing/public-routes';
import {difficultyLabel} from './features/articles/components/catalog/catalog-labels';

const root = document.documentElement;
const publicationRevision = document.querySelector<HTMLMetaElement>('meta[name="publication-revision"]')?.content;
const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const navigation = document.querySelector<HTMLElement>('#main-navigation');
const header = document.querySelector<HTMLElement>('[data-site-header]');

function updateThemeButton() {
    themeButton?.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
}

if (themeButton) {
    updateThemeButton();
    themeButton.hidden = false;
    themeButton.addEventListener('click', () => {
        const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = theme;
        try {
            localStorage.setItem('blog.theme', theme);
        } catch { /* Session preference still works. */
        }
        updateThemeButton();
    });
}

function setMenu(open: boolean, restoreFocus = false) {
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', (open ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel) ?? '');
    navigation?.classList.toggle('site-header__nav--open', open);
    if (restoreFocus) menuButton?.focus();
}

if (menuButton && navigation && header) {
    menuButton.hidden = false;
    header.dataset.shellReady = 'true';
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    header.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            event.preventDefault();
            setMenu(false, true);
        }
    });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    let lastFocused: EventTarget | null = null;
    document.addEventListener('focusin', event => {
        lastFocused = event.target;
    });
    const desktop = matchMedia('(min-width: 48rem)');
    desktop.addEventListener('change', () => {
        // A media query can hide the focused element before its change event runs.
        const active = document.activeElement === document.body ? lastFocused : document.activeElement;
        const focusInside = active instanceof Node && navigation.contains(active);
        if (desktop.matches && active === menuButton) navigation.querySelector('a')?.focus();
        setMenu(false, !desktop.matches && focusInside);
    });
}

function initializeArchive() {
    const archive = document.querySelector<HTMLElement>('[data-archive]');
    const controls = document.querySelector<HTMLFormElement>('[data-archive-controls]');
    const select = document.querySelector<HTMLSelectElement>('[data-archive-tag]');
    const results = document.querySelector<HTMLElement>('[data-archive-results]');
    const empty = document.querySelector<HTMLElement>('[data-archive-empty]');
    const pagination = document.querySelector<HTMLElement>('[data-archive-pagination]');
    const error = document.querySelector<HTMLElement>('[data-archive-error]');
    const retry = document.querySelector<HTMLButtonElement>('[data-archive-retry]');

    if (!archive || !controls || !select || !results || !empty || !pagination) {
        return;
    }

    const indexUrl = archive.dataset.indexUrl;
    const locale = archive.dataset.locale;
    const initialPage = Number(archive.dataset.page ?? '1');
    const pageSize = Number(archive.dataset.pageSize ?? '12');

    if (!indexUrl || !locale || !Number.isSafeInteger(initialPage) || !Number.isSafeInteger(pageSize)) {
        return;
    }

    const archiveSelect = select;
    const archiveControls = controls;
    const archiveIndexUrl = indexUrl;
    const archiveLocale = locale;
    const archiveResults = results;
    const archiveEmpty = empty;
    const archivePagination = pagination;

    function state() {
        const params = new URLSearchParams(location.search);
        const requestedTag = params.get('tag') ?? '';
        const tagId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(requestedTag) ? requestedTag : '';
        const queryPage = params.get('page');
        const routePage = new RegExp(`^/${locale}/articles/page/([1-9]\\d*)/?$`, 'u').exec(location.pathname);
        const fallbackPage = routePage ? Number(routePage[1]) : 1;
        const page = queryPage && /^[1-9]\d*$/u.test(queryPage) ? Number(queryPage) : fallbackPage;
        return {tagId, page: Number.isSafeInteger(page) ? page : initialPage};
    }

    function label(difficulty: BrowserArticleSummary['difficulty']) {
        return difficultyLabel(difficulty, locale === 'pt-BR' ? 'pt-BR' : 'en');
    }

    function pageUrl(page: number, tagId: string) {
        if (!tagId) {
            return archivePath(archiveLocale, page);
        }

        const url = new URL(`/${locale}/articles`, location.origin);
        url.searchParams.set('tag', tagId);

        if (page > 1) {
            url.searchParams.set('page', String(page));
        }
        return url.pathname + url.search;
    }

    function articleCard(article: BrowserArticleSummary) {
        const card = document.createElement('article');
        card.className = 'archive-card';
        card.dataset.articleId = article.articleId;

        const header = document.createElement('header');
        header.className = 'archive-card__header';

        const difficulty = document.createElement('span');
        difficulty.className = `archive-card__difficulty archive-card__difficulty--${article.difficulty}`;
        difficulty.textContent = label(article.difficulty);

        const date = document.createElement('p');
        const time = document.createElement('time');
        time.dateTime = article.publishedAt;
        time.textContent = new Intl.DateTimeFormat(locale, {
            dateStyle: 'medium',
            timeZone: 'UTC'
        }).format(new Date(article.publishedAt));
        date.append(time);
        header.append(difficulty, date);

        const heading = document.createElement('h2');
        const articleLink = document.createElement('a');
        articleLink.href = article.canonical;
        articleLink.textContent = article.title;
        heading.append(articleLink);

        const description = document.createElement('p');
        description.className = 'archive-card__description';
        description.textContent = article.description;

        const footer = document.createElement('footer');
        const tags = document.createElement('div');

        for (const tag of article.tags) {
            const tagLink = document.createElement('a');
            tagLink.href = publicPath(archiveLocale, 'tags', tag.slug);
            tagLink.textContent = tag.name;
            tags.append(tagLink);
        }

        const minutes = document.createElement('span');
        minutes.textContent = `${article.readingMinutes} min`;
        footer.append(tags, minutes);
        card.append(header, heading, description, footer);

        return card;
    }

    function render(index: BrowserCatalogIndex) {
        const current = state();
        archiveSelect.value = current.tagId;

        document.querySelectorAll<HTMLAnchorElement>('.published-language a').forEach((link) => {
            const url = new URL(link.href);
            if (current.tagId) {
                url.searchParams.set('tag', current.tagId);
            } else {
                url.searchParams.delete('tag');
            }

            link.href = url.toString();
        });

        const filtered = current.tagId
            ? index.articles.filter((article) =>
                article.tags.some((tag) => tag.id === current.tagId))
            : index.articles;
        const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
        const page = Math.min(current.page, pages);
        const items = filtered.slice((page - 1) * pageSize, page * pageSize);

        archiveResults.replaceChildren(...items.map(articleCard));
        archiveEmpty.hidden = items.length > 0;
        archivePagination.replaceChildren();
        archivePagination.hidden = pages <= 1;

        for (let number = 1; number <= pages; number += 1) {
            const link = document.createElement('a');
            link.href = pageUrl(number, current.tagId);
            link.textContent = String(number);

            if (number === page) {
                link.setAttribute('aria-current', 'page');
            }
            archivePagination.append(link);
        }
    }

    let catalog: BrowserCatalogIndex | undefined;
    archiveSelect.addEventListener('change', () => {
        if (!catalog) {
            return;
        }

        const url = new URL(location.href);
        url.pathname = `/${locale}/articles`;

        if (archiveSelect.value) {
            url.searchParams.set('tag', archiveSelect.value);
        } else {
            url.searchParams.delete('tag');
        }

        url.searchParams.delete('page');
        history.pushState({}, '', url);
        render(catalog);
    });

    addEventListener('popstate', () => {
        if (catalog) {
            render(catalog);
        }
    });

    function load() {
        if (retry) {
            retry.disabled = true;
        }
        void fetch(archiveIndexUrl).then((response) => response.ok ? response.json() : Promise.reject(new Error('Catalog unavailable'))).then((value: unknown) => {
            if (!isCatalogIndex(value) || value.locale !== locale || value.revision !== publicationRevision) throw new Error('Invalid catalog');
            catalog = value;
            if (error) error.hidden = true;
            archiveControls.hidden = archiveSelect.options.length <= 1;
            render(value);
        }).catch(() => {
            if (error) error.hidden = false;
        }).finally(() => {
            if (retry) retry.disabled = false;
        });
    }

    retry?.addEventListener('click', load);
    load();
}

initializeArchive();

function initializeSearch() {
    const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
    const openers = document.querySelectorAll<HTMLButtonElement>('[data-search-open]');
    const input = document.querySelector<HTMLInputElement>('[data-search-input]');
    const close = document.querySelector<HTMLButtonElement>('[data-search-close]');
    const retry = document.querySelector<HTMLButtonElement>('[data-search-retry]');
    const status = document.querySelector<HTMLElement>('[data-search-status]');
    const results = document.querySelector<HTMLElement>('[data-search-results]');

    if (!dialog || !openers.length || !input || !close || !retry || !status || !results) {
        return;
    }

    const locale = dialog.dataset.locale;
    const indexUrl = dialog.dataset.indexUrl;

    if (!locale || !indexUrl) {
        return;
    }

    const searchDialog = dialog;
    const searchInput = input;
    const searchRetry = retry;
    const searchStatus = status;
    const searchResults = results;
    const searchIndexUrl = indexUrl;
    const copy = searchCopy[locale === 'pt-BR' ? 'pt-BR' : 'en'];
    let catalog: BrowserCatalogIndex | undefined;
    let controller: AbortController | undefined;
    let requestId = 0;
    let unavailable = false;
    let opener: HTMLButtonElement | undefined;

    function setStatus(message: string) {
        searchStatus.textContent = message;
    }

    function render() {
        searchResults.replaceChildren();
        searchRetry.hidden = true;

        if (unavailable) {
            searchRetry.hidden = false;
            setStatus(copy.unavailable);
            return;
        }

        const query = searchInput.value.trim();
        if (!query) {
            setStatus(copy.hint);
            return;
        }

        if (!catalog) {
            setStatus(copy.loading);
            return;
        }
        const matches = searchPublishedArticles(catalog.articles, query);
        if (!matches.length) {
            setStatus(copy.empty);
            return;
        }
        setStatus(copy.results(matches.length));
        for (const article of matches.slice(0, 12)) {
            const link = document.createElement('a');
            link.href = article.canonical;
            const title = document.createElement('strong');
            title.textContent = article.title;
            const description = document.createElement('small');
            description.textContent = article.description;
            link.append(title, description);
            searchResults.append(link);
        }
    }

    async function loadCatalog() {
        controller?.abort();
        const currentRequest = ++requestId;
        controller = new AbortController();
        unavailable = false;
        searchRetry.hidden = true;
        setStatus(copy.loading);
        try {
            const response = await fetch(searchIndexUrl, {signal: controller.signal});
            if (!response.ok) {
                return new Error('Catalog unavailable');
            }

            const value: unknown = await response.json();
            if (!isCatalogIndex(value) || value.locale !== locale || value.revision !== publicationRevision) {
                return new Error('Invalid catalog');
            }

            if (currentRequest !== requestId) {
                return;
            }
            catalog = value;
            controller = undefined;
            render();
        } catch (error) {
            if (currentRequest !== requestId || (error instanceof DOMException && error.name === 'AbortError')) {
                return;
            }

            controller = undefined;
            unavailable = true;
            searchResults.replaceChildren();
            searchRetry.hidden = false;
            setStatus(copy.unavailable);
        }
    }

    function openSearch(button: HTMLButtonElement) {
        opener = button;
        if (!searchDialog.open) searchDialog.showModal();
        searchInput.focus();
        render();
        if (!catalog) void loadCatalog();
    }

    openers.forEach((button) => {
        button.hidden = false;
        button.addEventListener('click', () => openSearch(button));
    });
    close.addEventListener('click', () => searchDialog.close());

    function updateSearchUrl(query: string) {
        const url = new URL(location.href);
        if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
        history.replaceState({}, '', url);
    }

    searchDialog.addEventListener('close', () => {
        controller?.abort();
        requestId += 1;
        updateSearchUrl('');
        opener?.focus();
    });
    searchInput.addEventListener('input', () => {
        updateSearchUrl(parseSearchQuery(searchInput.value));
        render();
    });
    searchRetry.addEventListener('click', () => void loadCatalog());
    document.addEventListener('keydown', (event) => {
        const target = event.target;
        const editable = target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable);
        if (!editable && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            openSearch(openers[0]);
        }
    });
    const sharedQuery = parseSearchQuery(new URLSearchParams(location.search).get('q'));
    if (sharedQuery) {
        searchInput.value = sharedQuery;
        openSearch(openers[0]);
    }
}

initializeSearch();
