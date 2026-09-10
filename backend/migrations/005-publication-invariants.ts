import type {Migration} from './runner';

export const migration: Migration = {
    version: '005-publication-invariants', checksum: '5'.repeat(64),
    async up(sequelize, transaction) {
        await sequelize.query(`
DO $$ DECLARE constraint_name text; BEGIN
 FOR constraint_name IN SELECT conname FROM pg_constraint
 WHERE conrelid='article_translations'::regclass AND contype='c'
 AND pg_get_constraintdef(oid) LIKE '%published_at%'
 LOOP EXECUTE format('ALTER TABLE article_translations DROP CONSTRAINT %I', constraint_name); END LOOP;
END $$;
ALTER TABLE article_translations ADD CONSTRAINT published_requires_date CHECK (status <> 'published' OR published_at IS NOT NULL);
CREATE OR REPLACE FUNCTION verify_editorial_integrity() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF EXISTS (SELECT 1 FROM articles a WHERE NOT EXISTS
   (SELECT 1 FROM article_translations t WHERE t.article_id=a.id AND t.locale=a.source_locale))
 THEN RAISE EXCEPTION 'article source locale requires a translation'; END IF;
 IF EXISTS (SELECT 1 FROM article_translations t WHERE NOT EXISTS
   (SELECT 1 FROM article_paths p WHERE p.translation_id=t.id AND p.kind='current' AND p.locale=t.locale AND p.slug=t.slug))
 OR EXISTS (SELECT 1 FROM article_paths p JOIN article_translations t ON t.id=p.translation_id
   WHERE p.locale<>t.locale OR (p.kind='current' AND p.slug<>t.slug))
 THEN RAISE EXCEPTION 'translation requires exactly one matching current path'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER translations_verify_integrity AFTER INSERT OR UPDATE OR DELETE ON article_translations
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION verify_editorial_integrity();
CREATE CONSTRAINT TRIGGER paths_verify_integrity AFTER INSERT OR UPDATE OR DELETE ON article_paths
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION verify_editorial_integrity();
`, {transaction});
    },
};
