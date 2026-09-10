import type {ArticleReader} from './ports/article-reader';
export async function exportSnapshot(reader: ArticleReader) { return await reader.exportSnapshot(); }
