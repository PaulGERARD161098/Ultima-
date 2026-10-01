#!/usr/bin/env bash
# Uniquement le conteneur PostgreSQL d'épreuve, sans réseau extérieur.
set -euo pipefail
test "${LV1_AUTH_ISOLATED:-}" = 1
test "$(id -u)" = 999
export PGDATA=/tmp/leo-auth-db PGHOST=/tmp PGUSER=postgres PGDATABASE=postgres
printf '%s\n' 'fixture-db-password' > /tmp/fixture-password
initdb --no-locale --encoding=UTF8 --auth-local=trust --auth-host=scram-sha-256 \
  --pwfile=/tmp/fixture-password >/dev/null
postgres -D "$PGDATA" -k /tmp -h 127.0.0.1 > /tmp/postgres.log 2>&1 &
db_pid=$!
trap 'kill "$db_pid" 2>/dev/null || true' EXIT
for attempt in {1..40}; do
  pg_isready -q && break
  sleep 1
done
psql -v ON_ERROR_STOP=1 <<'SQL'
create extension if not exists pgcrypto;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator login noinherit password 'fixture-rest-password';
grant anon, authenticated to authenticator;
create role supabase_auth_admin login createrole password 'fixture-auth-password';
create schema auth authorization supabase_auth_admin;
alter role supabase_auth_admin set search_path = auth, public;
grant usage on schema public to anon, authenticated, authenticator, supabase_auth_admin;
grant usage on schema auth to anon, authenticated;
SQL
touch /tmp/leo-auth-ready
wait "$db_pid"
