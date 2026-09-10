import {renderToString} from 'react-dom/server';
import PublishedApp from './PublishedApp';
import {resolvePublishedPage} from './content/published-page';
import {publishedContent} from './content/published-content';
export const snapshot = publishedContent;
export function render(pathname: string) {
    return {html: renderToString(<PublishedApp pathname={pathname}/>), page: resolvePublishedPage(pathname)};
}
