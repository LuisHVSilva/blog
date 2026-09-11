import {EntityBase} from '../../../../shared/domain/entity.base';
import type {Locale} from '../article';
export type ArticlePathProps = Readonly<{locale: Locale; slug: string; translationId: string; kind: 'current' | 'redirect'}>;
export class ArticlePath extends EntityBase<ArticlePathProps & {readonly id: string}, ArticlePath> {
    constructor(props: ArticlePathProps) { super({...props, id: JSON.stringify([props.locale, props.slug])}); Object.freeze(this); }
    protected recreate(props: ArticlePathProps): ArticlePath { return new ArticlePath(props); }
    toData(): ArticlePathProps {
        const props = this.getProps();
        return {locale: props.locale, slug: props.slug, translationId: props.translationId, kind: props.kind};
    }
}
