import type {AuthorProfile, AuthorProfileProps} from '../entities/authorProfile';

export interface IAuthorProfileRepository {
    find(filter: Partial<AuthorProfileProps>, lock?: boolean): Promise<readonly AuthorProfile[]>;
    save(entity: AuthorProfile): Promise<void>;
    remove(filter: Partial<AuthorProfileProps>): Promise<void>;
}
