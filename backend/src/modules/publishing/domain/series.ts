import {EntityBase} from '../../../shared/domain/entity.base';
import {EditorialRules} from './editorial-rules';
import {type Locale} from './publishing.types';
import {ApplicationError} from '../../../shared/errors/application.error';

export type SeriesMember = Readonly<{
    articleId: string;
    position: number;
    locale: Locale;
    translationPublished: boolean;
    articleArchived: boolean;
}>;

export type SeriesNavigation = Readonly<{
    count: number;
    previousArticleId?: string;
    nextArticleId?: string;
}>;

class SeriesRuleError extends ApplicationError {
    readonly code = 'PUBLISHING_VALIDATION';
    readonly kind = 'business-rule' as const;

    constructor(message: string) {
        super(message);
    }
}

export type SeriesProps = Readonly<{ id: string; members: readonly SeriesMember[] }>;

export class Series extends EntityBase<SeriesProps, Series> {
    constructor(props: SeriesProps) {
        super(props);
        if (!EditorialRules.isUuid(props.id)) throw new SeriesRuleError('Series ID must be a UUID.');
        Series.validateMembers(props.members);
        Object.freeze(this);
    }

    static rehydrate(props: SeriesProps): Series {
        return new Series(props);
    }

    protected recreate(props: SeriesProps): Series {
        return new Series(props);
    }

    get members(): readonly SeriesMember[] {
        return this.read('members');
    }

    withMembers(members: readonly SeriesMember[]): Series {
        return this.cloneWith({members});
    }

    navigation(locale: Locale, articleId?: string): SeriesNavigation {
        return Series.visibleNavigation(this.members, locale, articleId);
    }

    static validateMembers(members: readonly SeriesMember[]): void {
        const articles = new Set<string>();
        const positions = new Set<number>();
        for (const member of members) {
            if (!Number.isSafeInteger(member.position) || member.position < 1) throw new SeriesRuleError('Series position must be a positive integer.');
            if (articles.has(member.articleId)) throw new SeriesRuleError('An article cannot be repeated in a series.');
            if (positions.has(member.position)) throw new SeriesRuleError('A series position must be unique.');
            articles.add(member.articleId);
            positions.add(member.position);
        }
    }

    static visibleNavigation(members: readonly SeriesMember[], locale: Locale, articleId?: string): SeriesNavigation {
        Series.validateMembers(members);
        const visible = members.filter((member) => member.locale === locale && member.translationPublished && !member.articleArchived)
            .sort((left, right) => left.position - right.position);
        const index = articleId === undefined ? -1 : visible.findIndex((member) => member.articleId === articleId);
        return Object.freeze({
            count: visible.length, previousArticleId: index > 0 ? visible[index - 1]!.articleId : undefined,
            nextArticleId: index >= 0 && index < visible.length - 1 ? visible[index + 1]!.articleId : undefined
        });
    }
}
