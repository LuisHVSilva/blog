import type {IAuthorProfileService} from './authorProfile.service.interface';
import type {IAuthorProfileRepository} from '../repositories/authorProfile.repository.interface';
import type {EditorialCatalog} from '../editorial-catalog';
import {AuthorProfile} from '../entities/authorProfile';
import {PublishingConflictError} from '../publishing.errors';
export const defaultAuthorId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export class AuthorProfileService implements IAuthorProfileService {
    constructor(private readonly repository: IAuthorProfileRepository) {}
    async validate(values: EditorialCatalog['authors']): Promise<void> {
        for (const value of values) if ((await this.repository.find({profileSlug: value.profileSlug})).some((owner) => owner.id !== value.id)) throw new PublishingConflictError('Author profile slug is already reserved.');
    }
    async write(values: EditorialCatalog['authors'], now: Date): Promise<void> {
        await this.validate(values);
        for (const value of values) {
            const previous = (await this.repository.find({id: value.id}))[0];
            await this.repository.save(new AuthorProfile({...value, links: [...value.links], createdAt: previous?.createdAt ?? now}));
        }
    }
    async ensureDefault(now: Date): Promise<void> {
        if (!(await this.repository.find({id: defaultAuthorId})).length) await this.repository.save(new AuthorProfile({id: defaultAuthorId, displayName: 'Editorial maintainer', profileSlug: 'editorial-maintainer', bio: null, links: [], createdAt: now}));
    }
}
