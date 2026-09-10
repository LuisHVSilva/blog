import {mkdirSync, renameSync, writeFileSync, rmSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {Database} from '../../../../infrastructure/database';
import {loadConfig, loadEnvironment} from '../../../../config/env';
import {PostgresArticleReader} from '../postgres/article-reader';
import {exportSnapshot} from '../../application/export-snapshot';
import {argument} from './arguments';
export async function execute(argv = process.argv.slice(2)) {
    const output = argument(argv, '--output');
    if (!output) throw new Error('Use --output <file>.');
    const config = loadConfig(loadEnvironment()); const database = new Database(config.database);
    let snapshot;
    try { await database.connect(); snapshot = await exportSnapshot(new PostgresArticleReader(database.getSequelize(), config.publicSiteUrl.replace(/\/$/u, ''))); }
    finally { await database.disconnect(); }
    const destination = path.resolve(output); mkdirSync(path.dirname(destination), {recursive: true});
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try { writeFileSync(temporary, JSON.stringify(snapshot, null, 2) + '\n', {encoding: 'utf8', flag: 'wx'}); renameSync(temporary, destination); }
    finally { rmSync(temporary, {force: true}); }
    return snapshot;
}
if (require.main === module) execute().then((value) => process.stdout.write(JSON.stringify({revision: value.revision, articles: value.articles.length}) + '\n')).catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Export failed.'); process.exitCode = 1; });
