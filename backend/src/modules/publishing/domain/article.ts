import {EntityAuditBase} from '../../../shared/domain/entity-audit.base';
import type {Locale, Difficulty} from './publishing.types';
import {EditorialRules} from './editorial-rules';
import {EditorialRuleError} from './editorial-rule.error';

export type ArticleProps = Readonly<{
    id: string;
    sourceLocale: Locale;
    authorId: string;
    difficulty: Difficulty;
    createdAt: Date;
    archivedAt: Date | null;
}>;

export class Article extends EntityAuditBase<ArticleProps, Article> {
    constructor(props: ArticleProps) {
        super(props);
        EditorialRules.assertDate(props.createdAt);
        if (!EditorialRules.isUuid(props.id) || !EditorialRules.isUuid(props.authorId)) throw new EditorialRuleError('Article and author IDs must be UUIDs.');
        if (!EditorialRules.isLocale(props.sourceLocale)) throw new EditorialRuleError('Article locale is not supported.');
        if (!['foundational', 'intermediate', 'advanced'].includes(props.difficulty)) throw new EditorialRuleError('Difficulty is invalid.');
        if (props.archivedAt !== null) EditorialRules.assertDate(props.archivedAt);
        Object.freeze(this);
    }

    static rehydrate(props: ArticleProps): Article {
        return new Article(props);
    }

    protected recreate(props: ArticleProps): Article {
        return new Article(props);
    }

    get sourceLocale(): Locale {
        return this.read('sourceLocale');
    }

    get authorId(): string {
        return this.read('authorId');
    }

    get difficulty(): Difficulty {
        return this.read('difficulty');
    }

    get archivedAt(): Date | null {
        return this.read('archivedAt');
    }

    archive(now: Date): Article {
        EditorialRules.assertDate(now);
        return this.cloneWith({archivedAt: now});
    }

    restore(): Article {
        if (!this.archivedAt) throw new EditorialRuleError('Only an archived article can be restored.');
        return this.cloneWith({archivedAt: null});
    }
}

export {supportedLocales, type Locale, type Difficulty, type TranslationStatus} from './publishing.types';

export {EditorialRuleError} from './editorial-rule.error';

export {EditorialRules} from './editorial-rules';

export {ArticleTranslation, type ArticleTranslationProps, type TranslationSeo} from './entities/articleTranslation';
