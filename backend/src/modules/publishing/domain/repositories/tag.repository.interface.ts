import type {Tag, TagProps} from '../entities/tag';
export interface ITagRepository {
    find(filter: Partial<TagProps>, lock?: boolean): Promise<readonly Tag[]>;
    save(entity: Tag): Promise<void>;
    remove(filter: Partial<TagProps>): Promise<void>;
}
