import {PublishingValidationError} from '../../application/publishing.errors';

export function validateArguments(args: readonly string[], values: readonly string[], flags: readonly string[] = []): void {
    const seen = new Set<string>();
    for (let index = 0; index < args.length; index++) {
        const name = args[index]!;
        if (seen.has(name) || (!values.includes(name) && !flags.includes(name))) throw new PublishingValidationError('Unknown or repeated CLI argument.');
        seen.add(name);
        if (values.includes(name)) {
            if (!args[index + 1] || args[index + 1]!.startsWith('--')) throw new PublishingValidationError(`Provide a value for ${name}.`);
            index++;
        }
    }
}
export function argument(args: readonly string[], name: string): string | undefined {
    const index = args.indexOf(name);
    if (index < 0) return undefined;
    if (args.lastIndexOf(name) !== index || !args[index + 1] || args[index + 1]!.startsWith('--')) throw new PublishingValidationError(`Provide one value for ${name}.`);
    return args[index + 1];
}
