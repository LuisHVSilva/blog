import type {Migration} from './runner';

export const migration: Migration = {
    version: '002-editorial', checksum: 'c1d1c49c22e391b8b9fd2c173b03ce407eaec3e2ef4e91ddd4a4d462e431bd28',
    async up(sequelize, transaction) {
        await sequelize.query(`
CREATE TABLE author_profiles (id uuid PRIMARY KEY, display_name text NOT NULL, profile_slug text NOT NULL UNIQUE, bio text, created_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE articles (id uuid PRIMARY KEY, source_locale text NOT NULL, author_id uuid NOT NULL REFERENCES author_profiles(id) ON DELETE RESTRICT, difficulty text NOT NULL CHECK (difficulty IN ('foundational','intermediate','advanced')), created_at timestamptz NOT NULL, archived_at timestamptz);
CREATE TABLE article_translations (id uuid PRIMARY KEY, article_id uuid NOT NULL REFERENCES articles(id) ON DELETE RESTRICT, locale text NOT NULL, slug text NOT NULL, title text NOT NULL, description text NOT NULL, body_markdown text NOT NULL, status text NOT NULL CHECK (status IN ('draft','published','archived')), published_at timestamptz, updated_at timestamptz NOT NULL, source_revision integer NOT NULL CHECK (source_revision >= 1), translated_from_revision integer NOT NULL CHECK (translated_from_revision >= 1), reading_minutes integer NOT NULL CHECK (reading_minutes >= 1), seo jsonb NOT NULL DEFAULT '{}'::jsonb, UNIQUE(article_id, locale), UNIQUE(locale, slug), CHECK ((status = 'published') = (published_at IS NOT NULL)));
CREATE TABLE tags (id uuid PRIMARY KEY, key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE tag_translations (tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE RESTRICT, locale text NOT NULL, name text NOT NULL, slug text NOT NULL, description text, status text NOT NULL CHECK (status IN ('draft','published','archived')), PRIMARY KEY(tag_id, locale), UNIQUE(locale, slug));
CREATE TABLE article_tags (article_id uuid NOT NULL REFERENCES articles(id) ON DELETE RESTRICT, tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE RESTRICT, PRIMARY KEY(article_id, tag_id));
CREATE TABLE series (id uuid PRIMARY KEY, key text NOT NULL UNIQUE, difficulty text CHECK (difficulty IN ('foundational','intermediate','advanced')), status text NOT NULL CHECK (status IN ('draft','published','archived')), created_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE series_translations (series_id uuid NOT NULL REFERENCES series(id) ON DELETE RESTRICT, locale text NOT NULL, title text NOT NULL, slug text NOT NULL, description text NOT NULL, status text NOT NULL CHECK (status IN ('draft','published','archived')), PRIMARY KEY(series_id, locale), UNIQUE(locale, slug));
CREATE TABLE series_articles (series_id uuid NOT NULL REFERENCES series(id) ON DELETE RESTRICT, article_id uuid NOT NULL REFERENCES articles(id) ON DELETE RESTRICT, position integer NOT NULL CHECK(position > 0), PRIMARY KEY(series_id, article_id), UNIQUE(series_id, position) DEFERRABLE INITIALLY DEFERRED);
CREATE TABLE publication_editions (revision text PRIMARY KEY, content_hash text NOT NULL, git_commit text NOT NULL, actor_id text NOT NULL, applied_at timestamptz NOT NULL, report jsonb NOT NULL DEFAULT '{}'::jsonb);
CREATE TABLE publication_current_revision (singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton), revision text REFERENCES publication_editions(revision), updated_at timestamptz NOT NULL DEFAULT clock_timestamp());
INSERT INTO publication_current_revision(singleton, revision) VALUES (true, NULL);
CREATE INDEX article_translations_published_list ON article_translations(locale, published_at DESC, id DESC) WHERE status = 'published';
CREATE INDEX article_tags_by_tag ON article_tags(tag_id, article_id); CREATE INDEX series_articles_by_article ON series_articles(article_id, series_id);
CREATE OR REPLACE FUNCTION require_source_translation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM article_translations t WHERE t.article_id = NEW.id AND t.locale = NEW.source_locale) THEN RAISE EXCEPTION 'article source locale requires a translation'; END IF; RETURN NULL; END $$;
CREATE CONSTRAINT TRIGGER articles_require_source_translation AFTER INSERT OR UPDATE OF source_locale ON articles DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_source_translation();
`, {transaction});
        await sequelize.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON author_profiles, articles, article_translations, tags, tag_translations, article_tags, series, series_translations, series_articles, publication_editions, publication_current_revision TO blog_app`, {transaction});
    },
};
