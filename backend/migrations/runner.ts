import {createHash} from 'node:crypto';
import {QueryTypes, type Sequelize, type Transaction} from 'sequelize';

export type Migration = Readonly<{
    version: string;
    checksum: string;
    up: (sequelize: Sequelize, transaction: Transaction) => Promise<void>;
}>;

export class MigrationError extends Error {
    constructor(message: string) { super(message); this.name = 'MigrationError'; }
}

export const migrationChecksum = (source: string): string => createHash('sha256').update(source).digest('hex');

function validateMigrations(migrations: readonly Migration[]): Migration[] {
    const ordered = [...migrations].sort((left, right) => left.version.localeCompare(right.version));
    for (let index = 0; index < ordered.length; index++) {
        const migration = ordered[index]!;
        if (!/^\d{3,}[-_][a-z0-9-]+$/i.test(migration.version) || !/^[a-f0-9]{64}$/.test(migration.checksum)) {
            throw new MigrationError(`Invalid migration metadata for ${migration.version}.`);
        }
        if (index > 0 && ordered[index - 1]!.version === migration.version) throw new MigrationError(`Duplicate migration ${migration.version}.`);
    }
    return ordered;
}

export async function ensureMigrationTable(sequelize: Sequelize, transaction?: Transaction): Promise<void> {
    await sequelize.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )`, {transaction});
}

export async function migrationStatus(sequelize: Sequelize): Promise<ReadonlyMap<string, string>> {
    try {
        const rows = await sequelize.query<{version: string; checksum: string}>('SELECT version, checksum FROM schema_migrations ORDER BY version', {type: QueryTypes.SELECT});
        return new Map(rows.map((row) => [row.version, row.checksum]));
    } catch (error) {
        if ((error as {original?: {code?: string}}).original?.code === '42P01') return new Map();
        throw error;
    }
}

export async function runMigrations(sequelize: Sequelize, migrations: readonly Migration[], lockTimeoutMs = 5000): Promise<string[]> {
    const ordered = validateMigrations(migrations);
    if (!Number.isSafeInteger(lockTimeoutMs) || lockTimeoutMs < 1) throw new MigrationError('Migration lock timeout must be a positive integer.');
    return await sequelize.transaction(async (transaction) => {
        await sequelize.query(`SET LOCAL lock_timeout = '${lockTimeoutMs}ms'`, {transaction});
        try {
            await sequelize.query('SELECT pg_advisory_xact_lock(84240403)', {transaction});
        } catch (error) {
            throw new MigrationError('Timed out waiting for the migration lock.');
        }
        await ensureMigrationTable(sequelize, transaction);
        const rows = await sequelize.query<{version: string; checksum: string}>('SELECT version, checksum FROM schema_migrations ORDER BY version FOR UPDATE', {transaction, type: QueryTypes.SELECT});
        const applied = new Map(rows.map((row) => [row.version, row.checksum]));
        const performed: string[] = [];
        for (const migration of ordered) {
            const previous = applied.get(migration.version);
            if (previous && previous !== migration.checksum) throw new MigrationError(`Checksum mismatch for applied migration ${migration.version}.`);
            if (previous) continue;
            await migration.up(sequelize, transaction);
            await sequelize.query('INSERT INTO schema_migrations(version, checksum) VALUES (:version, :checksum)', {
                transaction, replacements: {version: migration.version, checksum: migration.checksum},
            });
            performed.push(migration.version);
        }
        return performed;
    });
}
