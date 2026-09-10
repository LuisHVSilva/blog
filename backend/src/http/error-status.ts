import {StatusCodes} from 'http-status-codes';
import type {ApplicationErrorKind} from '../shared/errors/application.error';

const statusByKind: Record<ApplicationErrorKind, StatusCodes> = {
    validation: StatusCodes.BAD_REQUEST,
    unauthenticated: StatusCodes.UNAUTHORIZED,
    unauthorized: StatusCodes.FORBIDDEN,
    'not-found': StatusCodes.NOT_FOUND,
    conflict: StatusCodes.CONFLICT,
    'business-rule': StatusCodes.UNPROCESSABLE_ENTITY,
    unavailable: StatusCodes.SERVICE_UNAVAILABLE,
    'rate-limited': StatusCodes.TOO_MANY_REQUESTS,
};

export function mapApplicationErrorStatus(kind: ApplicationErrorKind): StatusCodes {
    return statusByKind[kind];
}
