-- Ultima — migration 0012 : IMLADRIK v1 « pouvoir écrire » — le journal intime.
-- (Renumérotée 0010→0012 après merge : ZEKROM a pris 0010, la passerelle R↔Z 0011.)
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Périmètre = v1 STRICT du mini-cadrage IMLADRIK dicté par Paul (2026-07-23) :
--   « rendre IMLADRIK opérationnel, pouvoir écrire ». On pose UNIQUEMENT le socle
--   d'écriture — le journal daté, privé par owner. Le reste du cadrage §3.4
--   (objectifs de vie, valeurs, citations, quart d'heure, suggestions culturelles)
--   est DIFFÉRÉ : une boucle à la fois, pas dix lièvres.
--
-- Données INTIMES (§5 du CADRAGE-CONSOLE) : le niveau d'exigence monte d'un cran.
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003).
--   - owner_id NOT NULL, default auth.uid() (cf. 0004), FK auth.users cascade :
--     l'owner_id n'est JAMAIS accepté du client, il est imposé par la base.
--   - Mono-utilisateur strict : le contenu intime n'est lisible que par son auteur.
--   - Ce que l'API validera, la base le contraint aussi : CHECK de longueur
--     miroir de validate.js (validateEntreeImladrik) — la défense ne repose
--     jamais sur une seule couche.
--   - Trigger set_updated_at (search_path épinglé en 0002) sur before update.
--
-- Additif et non destructif : une seule table neuve (imladrik_entrees), aucune
-- table existante touchée, aucune donnée déplacée.
--
-- PAS DE SEED : un journal intime démarre vide. La première dictée écrit la
-- première page.
--
-- Compat-avant (boucle Drive à venir, synchro deux sens — décision Paul
-- 2026-07-23) : la synchronisation Google Drive s'ajoutera par une migration
-- ADDITIVE ultérieure (colonnes d'ancrage : drive_file_id, drive_modified_at,
-- sync_state…), jamais en retouchant cette table. On ne les modélise PAS ici
-- (spéculation interdite tant que la boucle Drive n'est pas cadrée avec
-- securite-auditeur).

-- ---------------------------------------------------------------------------
-- imladrik_entrees : une page de journal. titre optionnel, contenu obligatoire.
--   Bornes de longueur miroir de la future validation API (validate.js).
-- ---------------------------------------------------------------------------
create table public.imladrik_entrees (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Titre facultatif : null = page sans titre (jamais stocké comme chaîne vide).
  titre      text check (titre is null or char_length(titre) between 1 and 200),
  -- Le corps de l'écrit : obligatoire, non vide, borné (≈ 4000 mots).
  contenu    text not null check (char_length(contenu) between 1 and 20000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Requête réelle : « le journal d'un owner, page la plus récente en tête »
--   where owner_id = :me order by created_at desc.
-- Index composite (owner_id, created_at desc) : sert À LA FOIS le filtrage par
-- owner (RLS) ET le tri chronologique inverse (« index justifiés par les
-- requêtes réelles »).
create index imladrik_entrees_owner_created_idx
  on public.imladrik_entrees (owner_id, created_at desc);

create trigger imladrik_entrees_set_updated_at
  before update on public.imladrik_entrees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS : accès strictement limité à owner_id = (select auth.uid()). Une policy
--   par opération, WITH CHECK sur insert/update. `(select auth.uid())` = évalué
--   une fois par requête (initplan, cf. 0003), pas une fois par ligne.
-- ---------------------------------------------------------------------------
alter table public.imladrik_entrees enable row level security;

create policy imladrik_entrees_select on public.imladrik_entrees
  for select using (owner_id = (select auth.uid()));

create policy imladrik_entrees_insert on public.imladrik_entrees
  for insert with check (owner_id = (select auth.uid()));

create policy imladrik_entrees_update on public.imladrik_entrees
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy imladrik_entrees_delete on public.imladrik_entrees
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists imladrik_entrees_delete on public.imladrik_entrees;
--   drop policy if exists imladrik_entrees_update on public.imladrik_entrees;
--   drop policy if exists imladrik_entrees_insert on public.imladrik_entrees;
--   drop policy if exists imladrik_entrees_select on public.imladrik_entrees;
--   drop table if exists public.imladrik_entrees;  -- (drop index + trigger en cascade)
--   -- Données : la table est vide tant qu'aucune page n'a été écrite ; si des
--   -- pages existent, EXPORTER avant tout drop (contenu intime irremplaçable).
