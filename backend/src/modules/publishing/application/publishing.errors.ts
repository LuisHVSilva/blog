import {ApplicationError} from '../../../shared/errors/application.error';

export class PublishingValidationError extends ApplicationError {
    readonly code = 'PUBLISHING_VALIDATION';
    readonly kind = 'business-rule' as const;
    constructor(message: string) { super(message); }
}

export class PublishingConflictError extends ApplicationError {
    readonly code = 'PUBLISHING_CONFLICT';
    readonly kind = 'conflict' as const;
    constructor(message: string) { super(message); }
}

export class PublishingNotFoundError extends ApplicationError {
    readonly code = 'PUBLISHING_NOT_FOUND';
    readonly kind = 'not-found' as const;
    constructor(message: string) { super(message); }
}
