import {publishedContent as content} from './published-content';
import {resolvePublishedPageFromSnapshot} from './resolve-published-page';

export {type ResolvedPublishedPage, resolvePublishedPageFromSnapshot} from './resolve-published-page';

export function resolvePublishedPage(pathname: string) {
    return resolvePublishedPageFromSnapshot(content, pathname);
}
