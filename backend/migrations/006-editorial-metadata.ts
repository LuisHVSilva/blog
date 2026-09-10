import type {Migration} from './runner';
export const migration: Migration = {version: '006-editorial-metadata', checksum: '6'.repeat(64), async up(sequelize, transaction) {
    await sequelize.query(`ALTER TABLE author_profiles ADD COLUMN links jsonb NOT NULL DEFAULT '[]';
ALTER TABLE series ADD COLUMN updated_at timestamptz NOT NULL DEFAULT clock_timestamp();
ALTER TABLE tag_translations ADD COLUMN published_once boolean NOT NULL DEFAULT false;
ALTER TABLE series_translations ADD COLUMN published_once boolean NOT NULL DEFAULT false;
UPDATE tag_translations SET published_once=true WHERE status='published';
UPDATE series_translations SET published_once=true WHERE status='published';`, {transaction});
}};
