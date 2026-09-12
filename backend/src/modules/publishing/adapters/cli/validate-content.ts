import path from 'node:path';
import {ValidateContentUseCase} from '../../application/useCases/validateContent/validateContent.useCase';
import {ContentValidationService} from '../../domain/services/contentValidation.service';
import {parseContentRoot} from './content-parser';

type OutputFormat = 'json' | 'text';

export class ValidateContentCli {
    static async execute(argv: readonly string[] = process.argv.slice(2)) {
        const rootIndex = argv.indexOf('--root');
        const formatIndex = argv.indexOf('--format');
        const hasUnexpectedArgument = argv.some((value, index) =>
            value.startsWith('--')
            && !['--root', '--format'].includes(value)
            && index !== rootIndex + 1
            && index !== formatIndex + 1
        );

        if (rootIndex < 0 || !argv[rootIndex + 1] || hasUnexpectedArgument) {
            throw new Error('Use --root <content directory> [--format json|text].');
        }

        const format = formatIndex < 0 ? 'text' : argv[formatIndex + 1];
        if (format !== 'json' && format !== 'text') {
            throw new Error('Format must be json or text.');
        }

        const root = path.resolve(argv[rootIndex + 1]);
        const result = await new ValidateContentUseCase(
            new ContentValidationService()
        ).execute(await parseContentRoot(root));
        const outputFormat: OutputFormat = format;

        process.stdout.write(
            outputFormat === 'json'
                ? `${JSON.stringify(result)}\n`
                : `${result.valid ? 'valid' : 'invalid'}: ${result.errors.length} error(s)\n`
        );

        if (!result.valid) {
            process.exitCode = 2;
        }

        return result;
    }
}

if (require.main === module) {
    ValidateContentCli.execute().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : 'Content validation failed.');
        process.exitCode = 2;
    });
}
