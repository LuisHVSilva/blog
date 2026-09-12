import {PublishingValidationError} from '../../domain/publishing.errors';

type CliArgumentName = `--${string}`;

function isCliArgumentName(value: string): value is CliArgumentName {
    return value.startsWith('--');
}

export function validateArguments(
    args: readonly string[],
    values: readonly CliArgumentName[],
    flags: readonly CliArgumentName[] = []
): void {
    const seen = new Set<string>();
    for (let index = 0; index < args.length; index++) {
        const name = args[index]!;

        if (!isCliArgumentName(name) || seen.has(name) || (!values.includes(name) && !flags.includes(name))) {
            throw new PublishingValidationError('Unknown or repeated CLI argument.');
        }
        seen.add(name);

        if (values.includes(name)) {
            if (!args[index + 1] || args[index + 1]!.startsWith('--')) {
                throw new PublishingValidationError(`Provide a value for ${name}.`);
            }

            index++;
        }
    }
}

export function argument(
    args: readonly string[],
    name: CliArgumentName
): string | undefined {
    const index = args.indexOf(name);

    if (index < 0) {
        return undefined;
    }

    if (args.lastIndexOf(name) !== index || !args[index + 1] || args[index + 1]!.startsWith('--')) {
        throw new PublishingValidationError(`Provide one value for ${name}.`);
    }

    return args[index + 1];
}
