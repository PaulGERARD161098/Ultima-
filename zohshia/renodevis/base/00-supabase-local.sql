-- ZOH SHIA · RénoDevis — LA PLATEFORME, SIMULÉE EN LOCAL. Jamais appliqué ailleurs.
--
-- Une base Supabase arrive avec trois rôles, deux schémas (`auth`, `storage`) et
-- des privilèges par défaut. Les migrations de la techno les supposent. Ce
-- fichier en pose l'équivalent MINIMAL sur un Postgres jetable, pour prouver que
-- la base se reconstruit ; sur un vrai projet Supabase, on ne l'applique PAS —
-- la plateforme fournit déjà tout cela.
--
-- ⛔ Les privilèges par défaut ne sont pas un détail : c'est par eux que `anon`
-- reçoit un droit PROPRE sur toute table ou vue créée dans `public`. Une
-- simulation qui les omettrait rendrait une base PLUS fermée que la vraie, et
-- l'épreuve de cloisonnement passerait sur un mensonge.

create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;

-- ── auth ────────────────────────────────────────────────────────────────────
create schema auth;
grant usage on schema auth to anon, authenticated, service_role;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

-- Identité de l'appelant : lue dans les claims du jeton, comme sur la plateforme.
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claim.role', true), '')::text
$$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role;

-- ── storage ─────────────────────────────────────────────────────────────────
create schema storage;
grant usage on schema storage to anon, authenticated, service_role;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  created_at timestamptz default now()
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant all on storage.buckets, storage.objects to anon, authenticated, service_role;

create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)]
$$;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;
