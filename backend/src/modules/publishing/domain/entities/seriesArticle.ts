import {EntityBase} from '../../../../shared/domain/entity.base';

export type SeriesArticleProps = Readonly<{ seriesId: string; articleId: string; position: number }>;
export class SeriesArticle extends EntityBase<SeriesArticleProps & {readonly id: string}, SeriesArticle> {
    constructor(props: SeriesArticleProps) {
        super({...props, id: JSON.stringify([props.seriesId, props.articleId])});
        Object.freeze(this);
    }

    protected recreate(props: SeriesArticleProps): SeriesArticle {
        return new SeriesArticle(props);
    }

    toData(): SeriesArticleProps {
        const props = this.getProps();
        return {seriesId: props.seriesId, articleId: props.articleId, position: props.position};
    }
}
