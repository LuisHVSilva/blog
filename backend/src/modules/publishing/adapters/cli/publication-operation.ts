import {Database} from '../../../../infrastructures/database';
import {loadConfig, loadEnvironment} from '../../../../config/env';
import {EditorialComposition} from '../../../../infrastructures/di/editorial.composition';
import {argument as value, validateArguments} from './arguments';
import {reportFailure} from './failure';
export class PublicationOperationCli {
    static async execute(operation: 'publish' | 'unpublish' | 'archive' | 'restore', args = process.argv.slice(2)) {
        validateArguments(args, ['--article-id', '--expected-revision', '--operator-id', '--locale', '--revision', '--reason', '--target-state'], ['--dry-run', '--confirm-reexposure']);
        const articleId = value(args, '--article-id'); const expectedRevision = value(args, '--expected-revision'); const operatorId = value(args, '--operator-id'); const locale = value(args, '--locale');
        const revision = value(args, '--revision'); const reason = value(args, '--reason');
        if (!['publish', 'unpublish', 'archive', 'restore'].includes(operation) || !articleId || !expectedRevision || !operatorId || !revision || !reason?.trim() || (['publish', 'unpublish'].includes(operation) && !locale)) throw new Error('Provide operation, IDs, --expected-revision, --revision and --reason.');
        const database = new Database(loadConfig(loadEnvironment()).database);
        try { await database.connect(); const store = EditorialComposition.create(database.getSequelize(), ''); const operator = {kind: 'operator' as const, id: operatorId, sourceRevision: revision, reason};
            if (operation === 'restore') {
                if (!locale && !args.includes('--dry-run') && !args.includes('--confirm-reexposure')) throw new Error('Preview with --dry-run, then explicitly --confirm-reexposure to restore an article.');
                return await store.restoreArticle.execute({articleId, locale, expectedRevision, operator, reason, dryRun: args.includes('--dry-run')});
            }
            if (args.includes('--dry-run')) throw new Error('Use dry-run with import or restore.');
            const targetState = value(args, '--target-state') ?? 'draft';
            if (!['draft', 'archived'].includes(targetState)) throw new Error('Invalid target state.');
            return operation === 'publish' ? await store.publishArticle.execute({articleId, locale: locale!, expectedRevision, operator}) : operation === 'unpublish' ? await store.unpublishArticle.execute({articleId, locale: locale!, expectedRevision, operator, targetState: targetState as 'draft' | 'archived'}) : await store.archiveArticle.execute({articleId, expectedRevision, operator, reason});
        } finally { await database.disconnect(); }
    }
}

if (require.main === module) { const op = process.argv[2] as 'publish' | 'unpublish' | 'archive' | 'restore'; PublicationOperationCli.execute(op, process.argv.slice(3)).then((result) => process.stdout.write(JSON.stringify(result) + '\n')).catch(reportFailure); }
