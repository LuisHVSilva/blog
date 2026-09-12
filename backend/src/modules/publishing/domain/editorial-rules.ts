import {type Locale, supportedLocales} from './publishing.types';
import {EditorialRuleError} from './editorial-rule.error';

export class EditorialRules {
    static isUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    static isLocale(value: string): value is Locale {
        return (supportedLocales as readonly string[]).includes(value);
    }

    static isCanonicalSlug(value: string): boolean {
        return value.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
    }

    static assertDate(value: Date): void {
        if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new EditorialRuleError('Clock produced an invalid date.');
    }
}
