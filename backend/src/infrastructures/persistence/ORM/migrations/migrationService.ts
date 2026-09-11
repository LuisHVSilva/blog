import type {Sequelize} from 'sequelize';
import {migrationStatus, runMigrations, type Migration} from '../../../../../migrations/runner';

/** Migrations own DDL; model registration never creates or alters tables. */
export class MigrationService {
    constructor(private readonly sequelize: Sequelize) {}
    status(): Promise<ReadonlyMap<string, string>> { return migrationStatus(this.sequelize); }
    up(migrations: readonly Migration[]): Promise<string[]> { return runMigrations(this.sequelize, migrations); }
}
