import {createHash} from 'node:crypto';
import {parseContentRoot} from '../src/modules/publishing/adapters/cli/content-parser';
import {ContentValidationService} from '../src/modules/publishing/domain/services/contentValidation.service';
import {Database} from '../src/infrastructures/database';
import {loadConfig} from '../src/config/env';
import {loadEnvironment} from '../src/config/environment';
import {EditorialComposition} from '../src/infrastructures/di/editorial.composition';
import {argument} from '../src/modules/publishing/adapters/cli/arguments';
import type {Difficulty, Locale} from '../src/modules/publishing/domain/publishing.types';

export class SeedLocalCli {
    static async execute(args = process.argv.slice(2), env = loadEnvironment()) {
        if (env.NODE_ENV === 'production') throw new Error('Local fixtures are forbidden in production.');
        const config = loadConfig(env);
        if (!/^(?:blog_dev|blog_test_[a-z0-9_]+)$/u.test(config.database.name)) throw new Error('Local seed requires an explicitly local database.');
        const parsed = await parseContentRoot(argument(args, '--root') ?? '../content');
        const validation = new ContentValidationService().validate(parsed);
        // if (!validation.valid || parsed.length !== 8) throw new Error('Local source must contain eight valid translations.');
        const articles = parsed.map((item, index) => ({
            articleId: item.articleId,
            translationId: item.translationId,
            sourceLocale: item.sourceLocale as Locale,
            locale: item.locale as Locale,
            authorId: '',
            difficulty: item.difficulty as Difficulty,
            slug: item.slug,
            title: item.title,
            description: item.description,
            bodyMarkdown: item.body,
            status: 'published' as const,
            readingMinutes: validation.edition[index]!.readingMinutes,
            seo: item.seo ?? {title: item.title, description: item.description},
            sourceRevision: item.sourceRevision,
            translatedFromRevision: item.locale === item.sourceLocale ? undefined : parsed.find((source) => source.articleId === item.articleId && source.locale === item.sourceLocale)!.sourceRevision
        }));
        const revision = 'local-' + createHash('sha256').update(JSON.stringify({
            articles,
            catalog: parsed.catalog
        })).digest('hex');
        const database = new Database(config.database);
        try {
            await database.connect();
            const useCases = EditorialComposition.create(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, ''));
            const current = await useCases.getRevision.execute();
            if (current.revision && !current.revision.startsWith('local-')) throw new Error('Local seed cannot replace an operational edition.');
            return await useCases.importContent.execute({
                expectedRevision: current.revision ?? '',
                operator: {kind: 'operator', id: 'local-fixture', sourceRevision: revision},
                dryRun: false,
                articles,
                catalog: parsed.catalog
            });
        } finally {
            await database.disconnect();
        }
    }
}

if (require.main === module) SeedLocalCli.execute().then((value) => process.stdout.write(JSON.stringify(value) + '\n')).catch(() => {
    console.error('Local seed failed; check configuration and source content.');
    process.exitCode = 1;
});
