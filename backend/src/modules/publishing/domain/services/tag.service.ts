import type {ITagService} from './tag.service.interface';
import type {IPublicTagRepository} from '../repositories/publicTag.repository.interface';
import type {Locale} from '../publishing.types';
import {PublicQueryValidation} from './publicQuery.validation';

/** Validates locale input and exposes public tag summaries from the read repository. */
export class TagService implements ITagService {
    constructor(private readonly repository: IPublicTagRepository) {}

    async list(locale: Locale) {
        PublicQueryValidation.locale(locale);
        return (await this.repository.list(locale)).map((tag) => tag.getProps());
    }
}
