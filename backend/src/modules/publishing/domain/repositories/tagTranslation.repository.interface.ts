import type {TagTranslation, TagTranslationProps} from '../entities/tagTranslation';

export interface ITagTranslationRepository {
    find(filter: Partial<TagTranslationProps>, lock?: boolean): Promise<readonly TagTranslation[]>;
    save(entity: TagTranslation): Promise<void>;
    remove(filter: Partial<TagTranslationProps>): Promise<void>;
}
