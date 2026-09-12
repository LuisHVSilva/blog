import {ApplicationError} from '../../../shared/errors/application.error';

export class EditorialRuleError extends ApplicationError {
    readonly code = 'PUBLISHING_VALIDATION';
    readonly kind = 'business-rule' as const;

    constructor(message: string) {
        super(message);
    }
}
