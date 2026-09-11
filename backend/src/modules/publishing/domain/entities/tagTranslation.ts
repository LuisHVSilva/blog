import {EntityBase} from '../../../../shared/domain/entity.base';
import type {Locale, TranslationStatus} from '../article';
export type TagTranslationProps = Readonly<{tagId: string; locale: Locale; name: string; slug: string; description: string | null; status: TranslationStatus; publishedOnce: boolean}>;
export class TagTranslation extends EntityBase<TagTranslationProps & {readonly id: string}, TagTranslation> {
    constructor(props: TagTranslationProps) { super({...props, id: JSON.stringify([props.tagId, props.locale])}); Object.freeze(this); }
    protected recreate(props: TagTranslationProps): TagTranslation { return new TagTranslation(props); }
    toData(): TagTranslationProps {
        const props = this.getProps();
        return {tagId: props.tagId, locale: props.locale, name: props.name, slug: props.slug, description: props.description, status: props.status, publishedOnce: props.publishedOnce};
    }
}
