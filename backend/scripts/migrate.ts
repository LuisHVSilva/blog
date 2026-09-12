import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Sequelize} from 'sequelize';
import {loadConfig, type Config} from '../src/config/env';
import {loadEnvironment} from '../src/config/environment';
import type {Migration} from '../migrations/runner';
import {MigrationService} from '../src/infrastructures/persistence/ORM/migrations/migrationService';

function migrationConfig(config: Config, env: NodeJS.ProcessEnv): Config['database'] {
    const required = ['MIGRATOR_DB_HOST', 'MIGRATOR_DB_NAME', 'MIGRATOR_DB_USERNAME', 'MIGRATOR_DB_PASSWORD'] as const;
    const missing = required.filter((name) => !env[name]?.trim());
    if (missing.length) throw new Error(`Missing migrator configuration: ${missing.join(', ')}.`);
    return {...config.database,
        host: env.MIGRATOR_DB_HOST!, name: env.MIGRATOR_DB_NAME!, username: env.MIGRATOR_DB_USERNAME!, password: env.MIGRATOR_DB_PASSWORD!,
        port: Number(env.MIGRATOR_DB_PORT ?? config.database.port),
    };
}

async function discover(directory: string): Promise<Migration[]> {
    const names = readdirSync(directory).filter((name) => /^\d{3,}[-_].+\.(?:js|ts)$/.test(name)).sort();
    return await Promise.all(names.map(async (name) => {
        const module = await import(pathToFileURL(path.join(directory, name)).href);
        const migration = module.migration as Migration | undefined;
        if (!migration) throw new Error(`Migration ${name} does not export migration.`);
        const sourceChecksum = (await import('../migrations/runner.js')).migrationChecksum(readFileSync(path.join(directory, name), 'utf8'));
        return {...migration, checksum: sourceChecksum};
    }));
}

export async function execute(argv: readonly string[] = process.argv.slice(2), env = loadEnvironment()): Promise<void> {
    const command = argv[0] ?? 'up';
    if (!['up', 'status'].includes(command)) throw new Error('Use migrate up or migrate status.');
    const config = loadConfig(env);
    const database = migrationConfig(config, env);
    const sequelize = new Sequelize({
        dialect: 'postgres', database: database.name, host: database.host, port: database.port,
        username: database.username, password: database.password, logging: false,
        pool: {max: database.poolMax, min: 0, acquire: database.acquireMs},
        dialectOptions: {connectionTimeoutMillis: database.acquireMs, statement_timeout: database.statementTimeoutMs, query_timeout: database.statementTimeoutMs},
    });
    try {
        await sequelize.authenticate();
        const migrations = new MigrationService(sequelize);
        if (command === 'status') {
            for (const [version, checksum] of await migrations.status()) process.stdout.write(`${version} ${checksum}\n`);
            return;
        }
        const directory = path.join(__dirname, '../migrations');
        const applied = await migrations.up(await discover(directory));
        process.stdout.write(applied.length ? `Applied: ${applied.join(', ')}\n` : 'No pending migrations.\n');
    } finally { await sequelize.close(); }
}
if (require.main === module) execute().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Migration failed.'); process.exitCode = 1; });
