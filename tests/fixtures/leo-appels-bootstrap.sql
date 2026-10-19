-- Amorce MINIMALE de Supabase pour éprouver `20261019160000_leo_appels.sql` sur un
-- PostgreSQL jetable : les deux rôles, le schéma `auth` (users + uid()), le schéma
-- privé de Léo avec les mêmes droits que `20260929125105_leo_lv1_registre_
-- transactionnel.sql`, et les privilèges par défaut que Supabase pose sur les
-- tables de `public` (c'est ce qui rend les `revoke` de la migration nécessaires).
-- Aucune donnée réelle : des identifiants de test, rien d'autre.
create role anon nologin;
create role authenticated nologin;

create schema auth;
create table auth.users (id uuid primary key, created_at timestamptz not null default now());
create function auth.uid() returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;

create schema leo_private;
revoke all on schema leo_private from public, anon, authenticated;
grant usage on schema leo_private to authenticated;

grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222'),
  ('33333333-3333-4333-8333-333333333333'),
  ('44444444-4444-4444-8444-444444444444');
