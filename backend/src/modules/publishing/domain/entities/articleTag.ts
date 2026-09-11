import {EntityBase} from '../../../../shared/domain/entity.base';

export type ArticleTagProps = Readonly<{articleId: string; tagId: string}>;
export class ArticleTag extends EntityBase<ArticleTagProps & {readonly id: string}, ArticleTag> {
    constructor(props: ArticleTagProps) { super({...props, id: JSON.stringify([props.articleId, props.tagId])}); Object.freeze(this); }
    protected recreate(props: ArticleTagProps): ArticleTag { return new ArticleTag(props); }
    toData(): ArticleTagProps {
        const props = this.getProps();
        return {articleId: props.articleId, tagId: props.tagId};
    }
}
