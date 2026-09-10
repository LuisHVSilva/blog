import {publishedContent as content} from './published-content';
export function resolvePublishedPage(pathname: string) {
    const locale = pathname.split('/')[1] === 'en' ? 'en' : 'pt-BR';
    const article = content.articles.find((item) => new URL(item.canonical).pathname === pathname);
    const series = content.series.find((item) => new URL(item.canonical).pathname === pathname);
    const tag = content.tags.find((item) => new URL(item.canonical).pathname === pathname);
    const index = ['/', `/${locale}`, `/${locale}/articles`, `/${locale}/tags`, `/${locale}/series`].includes(pathname);
    return {locale, article, series, tag, found: Boolean(article || series || tag || index)};
}
