import {Icon} from '../../../components/ui/Icon';
import type {PublishedLocale} from '../../../routing/public-routes';
import {searchCopy} from '../../../i18n/published-copy';

export function PublishedSearchDialog({locale}: { locale: PublishedLocale }) {
    const copy = searchCopy[locale];
    return (
        <dialog id="published-search-dialog" className="published-search-dialog" data-search-dialog
                data-locale={locale} data-index-url={`/${locale}/catalog-index.json`}
                aria-labelledby="published-search-title">
            <section className="published-search-dialog__panel">
                <header>
                    <Icon name="search"/>
                    <label className="sr-only" htmlFor="published-search-input">{copy.input}</label>
                    <input id="published-search-input" data-search-input type="search" maxLength={200}
                           autoComplete="off"
                           placeholder={copy.input}/>
                    <button type="button" data-search-close aria-label={copy.close}><Icon name="x"/></button>
                </header>
                <p id="published-search-title" className="search-dialog__label">{copy.title}</p>
                <p data-search-status role="status" aria-live="polite">{copy.hint}</p>
                <div data-search-results></div>
                <button type="button" data-search-retry hidden>{copy.retry}</button>
            </section>
        </dialog>
    );
}
