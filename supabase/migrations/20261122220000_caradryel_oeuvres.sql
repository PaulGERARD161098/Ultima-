-- CARADRYEL — boucle C1 « la porte » (CADRAGE-CARADRYEL.md §7, 2026-11-22).
-- Le registre des œuvres de Paul : un titre, un ordre d'affichage, et
-- l'identifiant du Google Doc d'origine. Le TEXTE des œuvres n'est jamais ici :
-- il vit dans Google Docs (Directive ZS : Docs reste l'éditeur).
--
-- Sécurité (régime §5 de CADRAGE-CONSOLE : intime) :
--   - RLS active dès la création, une policy par opération utile,
--     owner_id = (select auth.uid()) ;
--   - rien pour anon ; authenticated n'a ni DELETE ni TRUNCATE (une suppression
--     réelle est rouge : elle se fait dans Supabase, par Paul) ;
--   - owner_id figé à la création : la colonne n'est pas modifiable par l'API.
--   - drive_file_id : l'IDENTIFIANT seul (jamais une URL), alphabet fermé.
--
-- Additif et non destructif : une table neuve, aucune table existante touchée.
-- PAS DE SEED : les titres ne vivent pas dans le dépôt. L'API les crée, après
-- connexion, sur la demande de Paul (POST {action:'initialiser'}).

create table public.caradryel_oeuvres (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  titre         text not null
                check (char_length(btrim(titre)) between 1 and 120
                       and titre = btrim(titre)),
  drive_file_id text
                check (drive_file_id is null
                       or drive_file_id ~ '^[A-Za-z0-9_-]{20,128}$'),
  ordre         smallint not null default 0 check (ordre between 0 and 999),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (owner_id, titre)
);

-- Requête réelle : « les œuvres d'un propriétaire, dans l'ordre d'affichage ».
create index caradryel_oeuvres_owner_ordre_idx
  on public.caradryel_oeuvres (owner_id, ordre);

-- updated_at tenu par la base (pas de fonction partagée requise).
create or replace function public.caradryel_oeuvres_touche()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger caradryel_oeuvres_touche
  before update on public.caradryel_oeuvres
  for each row execute function public.caradryel_oeuvres_touche();

-- Droits : le strict nécessaire, colonne par colonne en écriture.
revoke all on table public.caradryel_oeuvres from public, anon, authenticated;
grant select on table public.caradryel_oeuvres to authenticated;
grant insert (titre, ordre) on table public.caradryel_oeuvres to authenticated;
grant update (drive_file_id, ordre) on table public.caradryel_oeuvres to authenticated;

alter table public.caradryel_oeuvres enable row level security;

create policy caradryel_oeuvres_select on public.caradryel_oeuvres
  for select to authenticated using (owner_id = (select auth.uid()));

create policy caradryel_oeuvres_insert on public.caradryel_oeuvres
  for insert to authenticated with check (owner_id = (select auth.uid()));

create policy caradryel_oeuvres_update on public.caradryel_oeuvres
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- rollback :
--   drop table if exists public.caradryel_oeuvres;  -- policies, index, trigger en cascade
--   drop function if exists public.caradryel_oeuvres_touche();
--   -- Données : titres + identifiants de Docs seulement ; les textes restent dans Drive.

-- Vérification après application (éditeur SQL, en tant que postgres) :
-- chaque ligne doit valoir true.
--   select relrowsecurity as rls_active
--     from pg_class where oid = 'public.caradryel_oeuvres'::regclass;
--   select count(*) = 3 as trois_policies
--     from pg_policies where schemaname = 'public' and tablename = 'caradryel_oeuvres';
--   select not has_table_privilege('anon', 'public.caradryel_oeuvres', 'select') as anon_sans_lecture;
--   select not has_table_privilege('authenticated', 'public.caradryel_oeuvres', 'delete') as sans_delete;
--   select not has_column_privilege('authenticated', 'public.caradryel_oeuvres', 'owner_id', 'update')
--     as owner_fige;
