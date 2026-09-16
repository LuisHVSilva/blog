import type {Migration} from './runner';

/** Adds localized, independently publishable project records to the editorial catalogue. */
export const migration: Migration = {
    version: '008-projects', checksum: '8'.repeat(64), async up(sequelize, transaction) {
        await sequelize.query(`
CREATE TABLE projects (
  id uuid PRIMARY KEY,
  key text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL
);
CREATE TABLE project_translations (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  locale text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  repository_url text,
  demo_url text,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN ('draft','published','archived')),
  updated_at timestamptz NOT NULL,
  published_at timestamptz,
  PRIMARY KEY(project_id, locale),
  UNIQUE(locale, slug),
  CHECK ((status = 'published') = (published_at IS NOT NULL))
);
CREATE INDEX project_translations_public_list ON project_translations(locale, published_at DESC, project_id) WHERE status='published';
GRANT SELECT, INSERT, UPDATE, DELETE ON projects, project_translations TO blog_app;
`, {transaction});
    }
};
