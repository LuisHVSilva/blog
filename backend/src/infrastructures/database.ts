import {Sequelize} from 'sequelize-typescript';
import {editorialModels} from './persistence/ORM/modelRegistry';
import type {Config} from '../config/env';

/** Database connection settings required by the Sequelize persistence composition. */
export type DatabaseConfig = Config['database'];

/**
 * Owns one Sequelize connection and the registered editorial persistence models.
 *
 * The instance deliberately does not synchronize schema: migrations are the sole DDL mechanism.
 */
export class Database {
    private readonly sequelize: Sequelize;
    private closing?: Promise<void>;

    constructor(config: DatabaseConfig) {
        this.sequelize = new Sequelize({
            repositoryMode: true,
            models: editorialModels,
            dialect: 'postgres',
            database: config.name,
            username: config.username,
            password: config.password,
            host: config.host, port: config.port, logging: false,
            pool: {
                max: config.poolMax,
                min: 0,
                acquire: config.acquireMs
            },
            dialectOptions: {
                connectionTimeoutMillis: config.acquireMs,
                statement_timeout: config.statementTimeoutMs,
                query_timeout: config.statementTimeoutMs,
                application_name: 'blog-api',
            },
        });
    }

    /** Returns the configured connection for dependency composition. */
    public getSequelize(): Sequelize {
        return this.sequelize;
    }

    /** Authenticates the database connection without modifying schema. */
    public async connect(): Promise<void> {
        await this.sequelize.authenticate();
    }

    /** Performs a short transactional probe used by the readiness endpoint. */
    public async checkReady(): Promise<void> {
        await this.sequelize.transaction(async (transaction) => {
            await this.sequelize.query('SET LOCAL statement_timeout = 1000', {transaction});
            await this.sequelize.query('SELECT 1', {transaction});
        });
    }

    /** Closes the connection once, sharing an in-flight shutdown among callers. */
    public disconnect(): Promise<void> {
        return this.closing ??= this.sequelize.close();
    }
}
