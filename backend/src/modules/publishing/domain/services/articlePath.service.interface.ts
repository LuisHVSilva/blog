import type {Locale} from '../article';
import type {ArticlePathProps} from '../entities/articlePath';
export interface IArticlePathService {
    assertAvailable(locale: Locale, slug: string, translationId: string): Promise<void>;
    assign(locale: Locale, slug: string, translationId: string, previousSlug?: string, publishedBefore?: boolean): Promise<void>;
    redirects(): Promise<readonly ArticlePathProps[]>;
}
