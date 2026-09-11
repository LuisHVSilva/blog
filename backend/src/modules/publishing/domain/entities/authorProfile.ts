import {EntityAuditBase} from '../../../../shared/domain/entity-audit.base';

export type AuthorProfileProps = Readonly<{id: string; displayName: string; profileSlug: string; bio: string | null; links: string[]; createdAt: Date}>;
export class AuthorProfile extends EntityAuditBase<AuthorProfileProps, AuthorProfile> {
    constructor(props: AuthorProfileProps) { super(props); Object.freeze(this); }
    protected recreate(props: AuthorProfileProps): AuthorProfile { return new AuthorProfile(props); }
    toData(): AuthorProfileProps {
        const props = this.getProps();
        return {id: props.id, displayName: props.displayName, profileSlug: props.profileSlug, bio: props.bio, links: props.links, createdAt: props.createdAt};
    }
}
