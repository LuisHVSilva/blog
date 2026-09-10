import type {Migration} from './runner';
export const migration: Migration = {version: '003-editorial-paths', checksum: '9521f2687b2a1c3f3e4df4b2819c6de6a12dd681277f3d432d49ff83d5fab7b0', async up(sequelize, transaction) {
    await sequelize.query(`
CREATE TABLE article_paths (locale text NOT NULL, slug text NOT NULL, translation_id uuid NOT NULL REFERENCES article_translations(id) ON DELETE RESTRICT, kind text NOT NULL CHECK(kind IN ('current','redirect')), PRIMARY KEY(locale, slug));
CREATE UNIQUE INDEX article_paths_one_current ON article_paths(translation_id) WHERE kind = 'current';
INSERT INTO article_paths(locale, slug, translation_id, kind) SELECT locale, slug, id, 'current' FROM article_translations;
CREATE VIEW article_slug_redirects AS SELECT locale, slug, translation_id FROM article_paths WHERE kind = 'redirect';
CREATE OR REPLACE FUNCTION require_current_article_path() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM article_paths p WHERE p.translation_id = NEW.id AND p.kind = 'current' AND p.locale = NEW.locale AND p.slug = NEW.slug) THEN RAISE EXCEPTION 'translation requires exactly one matching current path'; END IF; RETURN NULL; END $$;
CREATE CONSTRAINT TRIGGER translations_require_current_path AFTER INSERT OR UPDATE OF locale, slug ON article_translations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_current_article_path();
`, {transaction});
}};
