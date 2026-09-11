import path from 'node:path';
import {parseContentRoot} from './content-parser';
import {ContentValidationService} from '../../domain/services/contentValidation.service';
import {ValidateContentUseCase} from '../../application/useCases/validateContent/validateContent.useCase';

export class ValidateContentCli {
    static async execute(argv = process.argv.slice(2)) {
        const rootIndex = argv.indexOf('--root'); const formatIndex = argv.indexOf('--format');
        if (rootIndex < 0 || !argv[rootIndex + 1] || argv.some((value, index) => value.startsWith('--') && !['--root', '--format'].includes(value) && index !== rootIndex + 1 && index !== formatIndex + 1)) throw new Error('Use --root <content directory> [--format json|text].');
        const format = formatIndex < 0 ? 'text' : argv[formatIndex + 1]; if (!['json', 'text'].includes(format ?? '')) throw new Error('Format must be json or text.');
        const result = await new ValidateContentUseCase(new ContentValidationService()).execute(await parseContentRoot(path.resolve(argv[rootIndex + 1]!)));
        process.stdout.write(format === 'json' ? JSON.stringify(result) + '\n' : `${result.valid ? 'valid' : 'invalid'}: ${result.errors.length} error(s)\n`);
        if (!result.valid) process.exitCode = 2;
        return result;
    }
}

if (require.main === module) ValidateContentCli.execute().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Content validation failed.'); process.exitCode = 2; });
