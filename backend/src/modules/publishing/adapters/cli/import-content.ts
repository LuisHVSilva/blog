import {PublishingValidationError} from '../../domain/publishing.errors';
import {ValidateContentUseCase} from '../../application/useCases/validateContent/validateContent.useCase';
import {ContentValidationService} from '../../domain/services/contentValidation.service';
import {loadConfig} from '../../../../config/env';
import {loadEnvironment} from '../../../../config/environment';
import {Database} from '../../../../infrastructures/database';
import {EditorialComposition} from '../../../../infrastructures/di/editorial.composition';
import {argument, validateArguments} from './arguments';
import {parseContentRoot} from './content-parser';
import {reportFailure} from './failure';

export class ImportContentCli {
    static async execute(argv: readonly string[] = process.argv.slice(2)) {
        validateArguments(argv, ['--root', '--expected-revision', '--operator-id', '--revision'], ['--dry-run']);
        const root = argument(argv, '--root');
        const expectedRevisionArgument = argument(argv, '--expected-revision');
        const operatorId = argument(argv, '--operator-id');
        const dryRun = argv.includes('--dry-run');
        const revision = argument(argv, '--revision');
        if (!revision) throw new PublishingValidationError('Provide --revision identifying the reviewed source edition.');
        if (!root || !expectedRevisionArgument || !operatorId) throw new PublishingValidationError('Use --root, --expected-revision and --operator-id. Use empty only for the first import.');
        const expectedRevision = expectedRevisionArgument === 'empty' ? '' : expectedRevisionArgument;
        const parsed = await parseContentRoot(root); const validation = await new ValidateContentUseCase(new ContentValidationService()).execute(parsed); if (!validation.valid) throw new PublishingValidationError('Content validation failed.');
        const env = loadEnvironment(); const config = loadConfig(env); const database = new Database(config.database);
        try {
            await database.connect();
            return await EditorialComposition.create(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, '')).importContent.execute({expectedRevision, dryRun, operator: {kind: 'operator', id: operatorId, sourceRevision: revision}, catalog: parsed.catalog,
                articles: parsed.map((item, index) => ({articleId: item.articleId, translationId: item.translationId, sourceLocale: item.sourceLocale as 'pt-BR' | 'en', locale: item.locale as 'pt-BR' | 'en',
                    authorId: parsed.catalog.articles.find((article) => article.id === item.articleId)!.authorId, difficulty: item.difficulty as 'foundational' | 'intermediate' | 'advanced',
                    slug: item.slug, title: item.title, description: item.description, bodyMarkdown: item.body, readingMinutes: validation.edition[index]!.readingMinutes, seo: item.seo ?? {title: item.title, description: item.description},
                    sourceRevision: item.sourceRevision, translatedFromRevision: item.translatedFromRevision, status: item.status, updatedAt: item.updatedAt, publishedAt: item.publishedAt}))});
        } finally { await database.disconnect(); }
    }
}

if (require.main === module) ImportContentCli.execute().then((result) => process.stdout.write(JSON.stringify(result) + '\n')).catch(reportFailure);
