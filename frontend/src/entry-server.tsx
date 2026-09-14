import {renderToString} from 'react-dom/server';
import PublishedApp from './PublishedApp';
import {resolvePublishedPage} from './content/published-page';
import {publishedContent} from './content/published-content';
import {localCatalogIndex} from './content/article-projections';
import {pageMetadata, safeJsonLd} from './seo/metadata';

export {enumerateStaticPaths, nginxRedirects} from './routing/public-routes';
export const snapshot = publishedContent;
export {localCatalogIndex};
export {safeJsonLd};

export function render(pathname: string) {
    return {
        html: renderToString(<PublishedApp pathname={pathname}/>),
        page: resolvePublishedPage(pathname)
    };
}

export function metadata(pathname: string) {
    return pageMetadata(publishedContent, resolvePublishedPage(pathname));
}
