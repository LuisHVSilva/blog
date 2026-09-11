import type {ITagService} from './tag.service.interface';
import type {IPublicTagRepository} from '../repositories/publicTag.repository.interface';
import type {Locale} from '../article';
import {PublicQueryValidation} from './publicQuery.validation';
export class TagService implements ITagService {
    constructor(private readonly repository: IPublicTagRepository) {}
    async list(locale: Locale) {
        PublicQueryValidation.locale(locale);
        return (await this.repository.list(locale)).map((tag) => tag.getProps());
    }
}
