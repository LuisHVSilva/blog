#!/bin/sh
set -eu
if [ "${DB_USERNAME:-blog_app}" != 'blog_app' ]; then
  echo 'DB_USERNAME must be blog_app: migrations grant privileges to this role.' >&2
  exit 1
fi
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=ON_ERROR_STOP=1 <<'SQL'
\getenv app_password DB_PASSWORD
SELECT format('CREATE ROLE blog_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'blog_app') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO blog_app', current_database()) \gexec
GRANT USAGE ON SCHEMA public TO blog_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
