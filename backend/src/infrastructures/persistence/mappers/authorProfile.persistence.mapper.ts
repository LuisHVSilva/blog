import {AuthorProfile, type AuthorProfileProps} from '../../../modules/publishing/domain/entities/authorProfile';
import type {AuthorProfileModel} from '../ORM/models/authorProfile.model';

export class AuthorProfilePersistenceMapper {
    static toEntity(row: AuthorProfileModel): AuthorProfile {
        return new AuthorProfile({
            id: row.id,
            displayName: row.displayName,
            profileSlug: row.profileSlug,
            bio: row.bio,
            links: row.links,
            createdAt: row.createdAt
        });
    }

    static toPersistence(entity: AuthorProfile): AuthorProfileProps {
        return entity.toData();
    }
}
