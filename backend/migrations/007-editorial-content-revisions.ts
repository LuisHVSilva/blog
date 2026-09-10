import type {Migration} from './runner';
export const migration: Migration = {version: '007-editorial-content-revisions', checksum: '7'.repeat(64), async up(sequelize, transaction) {
    await sequelize.query(`
ALTER TABLE article_translations DROP CONSTRAINT article_translations_source_revision_check;
ALTER TABLE article_translations DROP CONSTRAINT article_translations_translated_from_revision_check;
ALTER TABLE article_translations ALTER COLUMN source_revision TYPE text USING ('legacy:' || source_revision::text);
ALTER TABLE article_translations ALTER COLUMN translated_from_revision DROP NOT NULL;
ALTER TABLE article_translations ALTER COLUMN translated_from_revision TYPE text USING ('legacy:' || translated_from_revision::text);
UPDATE article_translations t SET translated_from_revision=NULL FROM articles a WHERE a.id=t.article_id AND t.locale=a.source_locale;
`, {transaction});
}};
