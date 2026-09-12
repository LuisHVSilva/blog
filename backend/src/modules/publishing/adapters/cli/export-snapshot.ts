import {randomUUID} from 'node:crypto';
import {mkdirSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {loadConfig} from '../../../../config/env';
import {loadEnvironment} from '../../../../config/environment';
import {Database} from '../../../../infrastructures/database';
import {EditorialComposition} from '../../../../infrastructures/di/editorial.composition';
import {argument} from './arguments';

export class ExportSnapshotCli {
    static async execute(argv: readonly string[] = process.argv.slice(2)) {
        const output = argument(argv, '--output');
        if (!output) {
            throw new Error('Use --output <file>.');
        }

        const config = loadConfig(loadEnvironment());
        const database = new Database(config.database);
        let snapshot: Awaited<ReturnType<ReturnType<typeof EditorialComposition.create>['exportSnapshot']['execute']>>;

        try {
            await database.connect();
            snapshot = await EditorialComposition
                .create(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, ''))
                .exportSnapshot.execute();
        } finally {
            await database.disconnect();
        }

        const destination = path.resolve(output);
        mkdirSync(path.dirname(destination), {recursive: true});
        const temporary = `${destination}.${randomUUID()}.tmp`;

        try {
            writeFileSync(temporary, JSON.stringify(snapshot, null, 2) + '\n', {
                encoding: 'utf8',
                flag: 'wx'
            });
            renameSync(temporary, destination);
        } finally {
            rmSync(temporary, {force: true});
        }

        return snapshot;
    }
}

if (require.main === module) {
    ExportSnapshotCli.execute()
        .then((snapshot) => {
            process.stdout.write(JSON.stringify({
                revision: snapshot.revision,
                articles: snapshot.articles.length
            }) + '\n');
        })
        .catch((error: unknown) => {
            console.error(error instanceof Error ? error.message : 'Export failed.');
            process.exitCode = 1;
        });
}
