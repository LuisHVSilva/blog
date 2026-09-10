export type ApplicationErrorKind =
    | 'validation'
    | 'unauthenticated'
    | 'unauthorized'
    | 'not-found'
    | 'conflict'
    | 'business-rule'
    | 'unavailable'
    | 'rate-limited';

export type ErrorField = Readonly<{path: string; code: string; message: string}>;

export abstract class ApplicationError extends Error {
    abstract readonly code: string;
    abstract readonly kind: ApplicationErrorKind;

    protected constructor(message: string, public readonly fields?: readonly ErrorField[]) {
        super(message);
        this.name = this.constructor.name;
    }
}
