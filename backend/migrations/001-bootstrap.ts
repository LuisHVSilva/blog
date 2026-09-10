import type {Migration} from './runner';
import {migrationChecksum} from './runner';

const source = '001-bootstrap: establishes the migration ledger; editorial schema begins in E05.';

export const migration: Migration = {
    version: '001-bootstrap',
    checksum: migrationChecksum(source),
    async up() { /* The ledger is created by the runner in the same operational increment. */ },
};
