import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {loadConfig} from '../src/config/env';
import {loadEnvironment} from '../src/config/environment';
import {Database} from '../src/infrastructures/database';
import {EditorialComposition} from '../src/infrastructures/di/editorial.composition';
import {ContentHashService} from '../src/modules/publishing/adapters/content-revision';
import {ExportSnapshotCli} from '../src/modules/publishing/adapters/cli/export-snapshot';
import {argument, validateArguments} from '../src/modules/publishing/adapters/cli/arguments';
import {parseContentRoot} from '../src/modules/publishing/adapters/cli/content-parser';
import {ContentValidationService} from '../src/modules/publishing/domain/services/contentValidation.service';
import type {EditionArticleInput} from '../src/modules/publishing/domain/editorial.types';
import type {Difficulty, Locale} from '../src/modules/publishing/domain/publishing.types';

type LocalReleaseOptions = Readonly<{
    contentRoot: string;
    snapshotPath: string;
    operatorId: string;
    revision?: string;
    dryRun: boolean;
    skipFrontendBuild: boolean;
}>;

function parseOptions(argv: readonly string[]): LocalReleaseOptions {
    validateArguments(argv, ['--root', '--snapshot', '--operator-id', '--revision'], ['--dry-run', '--skip-frontend-build']);
    return {
        contentRoot: path.resolve(argument(argv, '--root') ?? '../content'),
        snapshotPath: path.resolve(argument(argv, '--snapshot') ?? '../frontend/generated/published-content.json'),
        operatorId: argument(argv, '--operator-id') ?? 'local-editor',
        revision: argument(argv, '--revision'),
        dryRun: argv.includes('--dry-run'),
        skipFrontendBuild: argv.includes('--skip-frontend-build')
    };
}

function toEditionArticles(
    parsed: Awaited<ReturnType<typeof parseContentRoot>>,
    readingMinutes: readonly number[]
): readonly EditionArticleInput[] {
    return parsed.map((item, index) => ({
        articleId: item.articleId,
        translationId: item.translationId,
        sourceLocale: item.sourceLocale as Locale,
        locale: item.locale as Locale,
        authorId: parsed.catalog.articles.find((article) => article.id === item.articleId)!.authorId,
        difficulty: item.difficulty as Difficulty,
        slug: item.slug,
        title: item.title,
        description: item.description,
        bodyMarkdown: item.body,
        readingMinutes: readingMinutes[index]!,
        seo: item.seo ?? {title: item.title, description: item.description},
        sourceRevision: item.sourceRevision,
        translatedFromRevision: item.translatedFromRevision,
        status: item.status,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt
    }));
}

function buildFrontend(snapshotPath: string): void {
    const frontendRoot = path.resolve(process.cwd(), '../frontend');
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(npm, ['run', 'build'], {
        cwd: frontendRoot,
        env: {...process.env, FRONTEND_SNAPSHOT_PATH: snapshotPath},
        shell: process.platform === 'win32',
        stdio: 'inherit'
    });

    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Frontend build failed with status ${result.status ?? 'unknown'}.`);
}

/**
 * Applies one complete local editorial edition. Tags, series, projects, and articles
 * are taken from the same validated content root so their public state stays consistent.
 */
export async function releaseLocalContent(argv: readonly string[] = process.argv.slice(2)) {
    const options = parseOptions(argv);
    const environment = loadEnvironment();
    const config = loadConfig(environment);

    if (config.nodeEnv === 'production') {
        throw new Error('content:release:local is restricted to dev or test environments.');
    }

    const parsed = await parseContentRoot(options.contentRoot);
    const validation = new ContentValidationService().validate(parsed);
    if (!validation.valid) throw new Error(`Content validation failed: ${validation.errors.join('; ')}`);

    const articles = toEditionArticles(parsed, validation.edition.map((item) => item.readingMinutes));
    const contentHash = new ContentHashService().hash({articles, catalog: parsed.catalog});
    const revision = options.revision ?? `local-${contentHash}`;
    const database = new Database(config.database);
    let result: Awaited<ReturnType<ReturnType<typeof EditorialComposition.create>['importContent']['execute']>>;

    try {
        await database.connect();
        const composition = EditorialComposition.create(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, ''));
        const current = await composition.getRevision.execute();
        result = await composition.importContent.execute({
            expectedRevision: current.revision ?? '',
            dryRun: options.dryRun,
            operator: {kind: 'operator', id: options.operatorId, sourceRevision: revision},
            articles,
            catalog: parsed.catalog
        });
    } finally {
        await database.disconnect();
    }

    if (options.dryRun) {
        return {
            mode: 'dry-run' as const,
            revision: result!.revision,
            changed: result!.changed,
            changes: result!.changes
        };
    }

    const snapshot = await ExportSnapshotCli.execute(['--output', options.snapshotPath]);
    if (!options.skipFrontendBuild) buildFrontend(options.snapshotPath);
    return {
        mode: 'released' as const,
        revision: result!.revision,
        changed: result!.changed,
        changes: result!.changes,
        snapshot: options.snapshotPath,
        publicArticles: snapshot.articles.length,
        frontendBuilt: !options.skipFrontendBuild
    };
}

if (require.main === module) {
    releaseLocalContent()
        .then((result) => process.stdout.write(JSON.stringify(result) + '\n'))
        .catch((error: unknown) => {
            console.error(error instanceof Error ? error.message : 'Local content release failed.');
            process.exitCode = 1;
        });
}
