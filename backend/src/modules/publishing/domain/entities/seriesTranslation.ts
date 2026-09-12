import {EntityBase} from '../../../../shared/domain/entity.base';
import type {Locale, TranslationStatus} from '../publishing.types';

export type SeriesTranslationProps = Readonly<{
    seriesId: string;
    locale: Locale;
    title: string;
    slug: string;
    description: string;
    status: TranslationStatus;
    publishedOnce: boolean;
}>;
export class SeriesTranslation extends EntityBase<SeriesTranslationProps & {readonly id: string}, SeriesTranslation> {
    constructor(props: SeriesTranslationProps) {
        super({...props, id: JSON.stringify([props.seriesId, props.locale])});
        Object.freeze(this);
    }

    protected recreate(props: SeriesTranslationProps): SeriesTranslation {
        return new SeriesTranslation(props);
    }

    toData(): SeriesTranslationProps {
        const props = this.getProps();
        return {
            seriesId: props.seriesId,
            locale: props.locale,
            title: props.title,
            slug: props.slug,
            description: props.description,
            status: props.status,
            publishedOnce: props.publishedOnce
        };
    }
}
