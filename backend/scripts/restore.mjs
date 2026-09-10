import {createDecipheriv, createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {backupKey, pgCommand, pgEnvironment} from './backup.mjs';

export function restoreTarget(target) {
    if (!/^blog_test_[a-z0-9_]+$/u.test(target ?? '')) throw new Error('Restore target must be an explicit blog_test_* database.');
    return target;
}
export function decryptDump(encrypted, key, expectedChecksum) {
    if (createHash('sha256').update(encrypted).digest('hex') !== expectedChecksum.trim()) throw new Error('Backup checksum mismatch.');
    const envelope = JSON.parse(encrypted.toString('utf8'));
    if (envelope.version !== 1) throw new Error('Unsupported backup version.');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]);
}
export function execute(args = process.argv.slice(2), env = process.env) {
    const database = restoreTarget(args[0]);
    if (args.length === 1) return {database, guardOnly: true};
    const input = args[1];
    if (!input || args[2] !== '--execute' || args.length !== 3) throw new Error('Use restore <blog_test_database> <encrypted-backup> --execute.');
    const dump = decryptDump(readFileSync(input), backupKey(env), readFileSync(input + '.sha256', 'utf8'));
    const pgEnv = pgEnvironment(database, env);
    const objects = pgCommand('psql', ['--no-psqlrc', '--tuples-only', '--no-align', '--set=ON_ERROR_STOP=1', '--command', "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND c.relkind IN ('r','v','m','S')"], pgEnv).toString().trim();
    if (objects !== '0') throw new Error('Restore requires an empty isolated database.');
    const started = performance.now();
    pgCommand('pg_restore', ['--dbname', database, '--no-owner', '--single-transaction', '--exit-on-error'], pgEnv, dump);
    const evidence = pgCommand('psql', ['--no-psqlrc', '--tuples-only', '--no-align', '--set=ON_ERROR_STOP=1', '--command', "SELECT json_build_object('revision',(SELECT revision FROM publication_current_revision WHERE singleton=true),'translations',(SELECT count(*) FROM article_translations))"], pgEnv).toString().trim();
    return {database, durationMs: Math.round(performance.now() - started), recovered: JSON.parse(evidence)};
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    try { console.log(JSON.stringify(execute())); } catch { console.error('Restore rejected or failed. Verify target, key and backup integrity.'); process.exitCode = 1; }
}
