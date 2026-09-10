import {createCipheriv, createHash, randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export function backupKey(env = process.env) {
    if (!/^[0-9a-f]{64}$/iu.test(env.BACKUP_KEY ?? '')) throw new Error('BACKUP_KEY must contain a 32-byte hexadecimal key.');
    return Buffer.from(env.BACKUP_KEY, 'hex');
}
export function pgEnvironment(database, env = process.env) {
    if (!/^[a-z][a-z0-9_]*$/iu.test(database ?? '') || !env.PGHOST || !env.PGUSER || !env.PGPASSWORD) throw new Error('Provide an explicit database and PGHOST/PGUSER/PGPASSWORD.');
    return {...env, PGDATABASE: database, PGCONNECT_TIMEOUT: '5'};
}
export function pgCommand(command, args, env, input) {
    const result = spawnSync(command, args, {env, input, shell: false, timeout: 120_000, maxBuffer: 64 * 1024 * 1024});
    if (result.error || result.status !== 0) throw new Error(`${command} failed; inspect the database with operational access.`);
    return result.stdout;
}
export function encryptDump(dump, key) {
    const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(dump), cipher.final()]);
    return Buffer.from(JSON.stringify({version: 1, createdAt: new Date().toISOString(), iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), data: encrypted.toString('base64')}));
}
export async function execute(args = process.argv.slice(2), env = process.env) {
    const [database, output] = args;
    if (!output) throw new Error('Use backup <database> <encrypted-output>.');
    const key = backupKey(env);
    const dump = pgCommand('pg_dump', ['--format=custom', '--no-owner'], pgEnvironment(database, env));
    const encrypted = encryptDump(dump, key);
    writeFileSync(output, encrypted, {flag: 'wx', mode: 0o600});
    const checksum = createHash('sha256').update(encrypted).digest('hex');
    if (createHash('sha256').update(readFileSync(output)).digest('hex') !== checksum) throw new Error('Backup read-back checksum failed.');
    writeFileSync(output + '.sha256', checksum + '\n', {flag: 'wx', mode: 0o600});
    if (env.BACKUP_UPLOAD_URL) {
        const target = new URL(env.BACKUP_UPLOAD_URL);
        if (target.protocol !== 'https:') throw new Error('Backup upload requires HTTPS.');
        const result = await fetch(target, {method: 'PUT', body: encrypted, redirect: 'error', signal: AbortSignal.timeout(120_000), headers: {'content-type': 'application/octet-stream'}});
        if (!result.ok) throw new Error('Backup upload failed.');
    }
    return {database, checksum, bytes: encrypted.length, uploaded: Boolean(env.BACKUP_UPLOAD_URL)};
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) execute().then((result) => console.log(JSON.stringify(result))).catch(() => { console.error('Backup failed. No successful off-host backup is recorded.'); process.exitCode = 1; });
