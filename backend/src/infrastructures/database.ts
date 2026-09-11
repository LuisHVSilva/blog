import {Sequelize} from 'sequelize-typescript';
import {editorialModels} from './persistence/ORM/modelRegistry';
import type {Config} from '../config/env';

export type DatabaseConfig = Config['database'];

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

    public getSequelize(): Sequelize {
        return this.sequelize;
    }

    public async connect(): Promise<void> {
        await this.sequelize.authenticate();
    }

    public async checkReady(): Promise<void> {
        await this.sequelize.transaction(async (transaction) => {
            await this.sequelize.query('SET LOCAL statement_timeout = 1000', {transaction});
            await this.sequelize.query('SELECT 1', {transaction});
        });
    }

    public disconnect(): Promise<void> {
        return this.closing ??= this.sequelize.close();
    }
}
