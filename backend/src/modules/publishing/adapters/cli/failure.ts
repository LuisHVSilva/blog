import {ApplicationError} from '../../../../shared/errors/application.error';

export function reportFailure(error: unknown): void {
    const conflict = error instanceof ApplicationError && error.kind === 'conflict';
    const validation = error instanceof ApplicationError && error.kind === 'business-rule';
    const code = conflict
        ? 'REVISION_CONFLICT'
        : validation
            ? error.code
            : 'COMMAND_FAILED';
    const message = conflict
        ? 'The requested revision conflicts with current content.'
        : validation
            ? error.message
            : 'Command failed. Check arguments, content and database configuration.';

    process.stderr.write(JSON.stringify({error: {code, message}}) + '\n');
    process.exitCode = conflict ? 3 : validation ? 2 : 1;
}
