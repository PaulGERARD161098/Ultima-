-- Multi-structures professionnelles (Option A — Boucle 1, 2026-11-23).
-- Cloisonnement strict entre les 3 structures pro de Paul :
--   'renoboost-ia' · 'sola-air-paris' · 'amo'
-- + un fil Léo dédié à la vue globale 'direction'.
--
-- Sécurité (régime §5 CADRAGE-CONSOLE + contrat LV1 §11.7) :
--   - RLS active dès la création sur chaque table, owner_id = (select auth.uid()) ;
--   - rien pour public ni anon ; authenticated n'a ni DELETE ni TRUNCATE
--     (suppression réelle = rouge, exécutée par Paul dans Supabase) ;
--   - owner_id et structure_id FIGÉS à la création (non inclus dans GRANT UPDATE) :
--     aucune ligne ne peut être déplacée silencieusement d'une structure à une autre ;
--   - FK composite sur pro_documents(dossier_id, owner_id, structure_id) garantissant
--     qu'un document ne peut jamais être rattaché à un dossier d'une autre structure.
--
-- Additif et non destructif : 4 tables neuves, aucune table existante touchée.

create or replace function public.pro_touche_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 1. Tâches, priorités, échéances et relances par structure
create table public.pro_taches (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  structure_id text not null
               check (structure_id in ('renoboost-ia', 'sola-air-paris', 'amo')),
  titre        text not null
               check (char_length(btrim(titre)) between 1 and 160 and titre = btrim(titre)),
  type         text not null default 'tache'
               check (type in ('tache', 'relance', 'decision')),
  priorite     text not null default 'normale'
               check (priorite in ('haute', 'normale', 'basse')),
  statut       text not null default 'a_faire'
               check (statut in ('a_faire', 'en_cours', 'bloque', 'fait')),
  echeance     date,
  contact_ref  text not null default ''
               check (char_length(contact_ref) <= 120),
  notes        text not null default ''
               check (char_length(notes) <= 2000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index pro_taches_owner_structure_statut_idx
  on public.pro_taches (owner_id, structure_id, statut, echeance);

create trigger pro_taches_touche
  before update on public.pro_taches
  for each row execute function public.pro_touche_updated_at();

revoke all on table public.pro_taches from public, anon, authenticated;
grant select on table public.pro_taches to authenticated;
grant insert (structure_id, titre, type, priorite, statut, echeance, contact_ref, notes)
  on table public.pro_taches to authenticated;
grant update (titre, type, priorite, statut, echeance, contact_ref, notes)
  on table public.pro_taches to authenticated;

alter table public.pro_taches enable row level security;

create policy pro_taches_select on public.pro_taches
  for select to authenticated using (owner_id = (select auth.uid()));
create policy pro_taches_insert on public.pro_taches
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy pro_taches_update on public.pro_taches
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- 2. Dossiers actifs par structure
create table public.pro_dossiers (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid()
                   references auth.users (id) on delete cascade,
  structure_id     text not null
                   check (structure_id in ('renoboost-ia', 'sola-air-paris', 'amo')),
  titre            text not null
                   check (char_length(btrim(titre)) between 1 and 160 and titre = btrim(titre)),
  statut           text not null default 'actif'
                   check (statut in ('actif', 'en_attente', 'clos')),
  synthese         text not null default ''
                   check (char_length(synthese) <= 4000),
  prochaine_action text not null default ''
                   check (char_length(prochaine_action) <= 300),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Clé unique composite utilisée par la FK d'étanchéité de pro_documents.
  unique (id, owner_id, structure_id)
);

create index pro_dossiers_owner_structure_statut_idx
  on public.pro_dossiers (owner_id, structure_id, statut);

create trigger pro_dossiers_touche
  before update on public.pro_dossiers
  for each row execute function public.pro_touche_updated_at();

revoke all on table public.pro_dossiers from public, anon, authenticated;
grant select on table public.pro_dossiers to authenticated;
grant insert (structure_id, titre, statut, synthese, prochaine_action)
  on table public.pro_dossiers to authenticated;
grant update (titre, statut, synthese, prochaine_action)
  on table public.pro_dossiers to authenticated;

alter table public.pro_dossiers enable row level security;

create policy pro_dossiers_select on public.pro_dossiers
  for select to authenticated using (owner_id = (select auth.uid()));
create policy pro_dossiers_insert on public.pro_dossiers
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy pro_dossiers_update on public.pro_dossiers
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- 3. Documents (CR réunions, préparations, brouillons d'emails, synthèses)
create table public.pro_documents (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid()
               references auth.users (id) on delete cascade,
  structure_id text not null
               check (structure_id in ('renoboost-ia', 'sola-air-paris', 'amo')),
  dossier_id   uuid,
  type         text not null
               check (type in ('compte_rendu', 'preparation_reunion', 'brouillon_mail', 'synthese')),
  titre        text not null
               check (char_length(btrim(titre)) between 1 and 160 and titre = btrim(titre)),
  contenu      text not null
               check (char_length(btrim(contenu)) between 1 and 20000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  foreign key (dossier_id, owner_id, structure_id)
    references public.pro_dossiers (id, owner_id, structure_id)
    on delete set null
);

create index pro_documents_owner_structure_created_idx
  on public.pro_documents (owner_id, structure_id, created_at desc);

create trigger pro_documents_touche
  before update on public.pro_documents
  for each row execute function public.pro_touche_updated_at();

revoke all on table public.pro_documents from public, anon, authenticated;
grant select on table public.pro_documents to authenticated;
grant insert (structure_id, dossier_id, type, titre, contenu)
  on table public.pro_documents to authenticated;
grant update (titre, contenu)
  on table public.pro_documents to authenticated;

alter table public.pro_documents enable row level security;

create policy pro_documents_select on public.pro_documents
  for select to authenticated using (owner_id = (select auth.uid()));
create policy pro_documents_insert on public.pro_documents
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy pro_documents_update on public.pro_documents
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- 4. Fils de conversation Léo cloisonnés (1 par structure + 1 vue direction)
create table public.pro_fils_leo (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,
  scope      text not null
             check (scope in ('direction', 'renoboost-ia', 'sola-air-paris', 'amo')),
  messages   jsonb not null default '[]'::jsonb
             check (jsonb_typeof(messages) = 'array' and jsonb_array_length(messages) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, scope)
);

create trigger pro_fils_leo_touche
  before update on public.pro_fils_leo
  for each row execute function public.pro_touche_updated_at();

revoke all on table public.pro_fils_leo from public, anon, authenticated;
grant select on table public.pro_fils_leo to authenticated;
grant insert (scope, messages) on table public.pro_fils_leo to authenticated;
grant update (messages) on table public.pro_fils_leo to authenticated;

alter table public.pro_fils_leo enable row level security;

create policy pro_fils_leo_select on public.pro_fils_leo
  for select to authenticated using (owner_id = (select auth.uid()));
create policy pro_fils_leo_insert on public.pro_fils_leo
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy pro_fils_leo_update on public.pro_fils_leo
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- rollback :
--   drop table if exists public.pro_fils_leo;
--   drop table if exists public.pro_documents;
--   drop table if exists public.pro_dossiers;
--   drop table if exists public.pro_taches;
--   drop function if exists public.pro_touche_updated_at();

-- Vérification après application (éditeur SQL, en tant que postgres) :
--   select tablename, rowsecurity from pg_tables
--     where schemaname = 'public'
--       and tablename in ('pro_taches', 'pro_dossiers', 'pro_documents', 'pro_fils_leo');
--   select not has_column_privilege('authenticated', 'public.pro_taches', 'structure_id', 'update') as structure_figee;
--   select not has_table_privilege('authenticated', 'public.pro_taches', 'delete') as sans_delete;
