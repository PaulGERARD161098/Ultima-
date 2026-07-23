-- Ultima — migration 0011 : LV2-③ la passerelle R↔Z « le rétroplanning, manuel v1 ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- C'est le CŒUR du doublet réel ↔ idéal : la table qui RELIE un idéal ZEKROM
-- (0010) à un talent RESHIRAM (0009). Manuel en v1 : Paul crée/valide chaque lien.
-- Cadrage : CADRAGE-RESHIRAM-ZEKROM.md §9.
--
-- Additif et non destructif : une table neuve + une vue dérivée, aucune table
-- existante (talents/preuves/ideaux/directions) touchée.
--
-- HORS v1 (différé) :
--   - miroir côté RESHIRAM (un talent liste les idéaux qu'il sert) : v2 — la table
--     porte DÉJÀ les deux sens, la vue miroir s'ajoutera sans retoucher `passerelles`.
--   - chiffrage du coût : délégué à NICOL BOLAS (§6.4) ; ici seule la `note`
--     qualitative amorce le besoin.
--   - auto-suggestion de liens : v2.
--
-- Invariants 0001-0010 conservés (RLS initplan, une policy par opération, WITH
-- CHECK sur écritures, owner_id NOT NULL default auth.uid(), CHECK miroir de l'API,
-- vues security_invoker). PAS DE SEED (les liens sont un geste de Paul en session).

-- ---------------------------------------------------------------------------
-- 1. passerelles : un lien idéal ↔ talent, du même owner, porteur d'une nature.
--
--    nature : le sens du lien (miroir des CHECK côté API validatePasserelle) :
--      'acquis'      = ce talent réel (que j'ai) REND POSSIBLE cet idéal.
--      'a_construire' = cet idéal APPELLE ce talent, qui reste à acquérir/renforcer
--                       (le « manque » du rétroplanning).
--
--    note : le besoin/le « comment » qualitatif (optionnel, borné). Le CHIFFRAGE
--      n'est pas ici (délégué à NICOL BOLAS) — la note ne fait que l'amorcer.
-- ---------------------------------------------------------------------------
create table public.passerelles (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  ideal_id   uuid not null references public.ideaux (id) on delete cascade,
  talent_id  uuid not null references public.talents (id) on delete cascade,

  nature     text not null
             check (nature in ('acquis', 'a_construire')),

  note       text check (note is null or char_length(note) <= 2000),

  created_at timestamptz not null default now(),

  -- DOUBLE scellement AD-4 (motif 0008/0009/0010) : un lien ne relie qu'un idéal
  -- ET un talent du MÊME owner — impossible de croiser les données d'autrui, même
  -- si la RLS était mal configurée. Cibles = ideaux_owner_id_uniq (0010) et
  -- talents_owner_id_uniq (0009).
  constraint passerelles_ideal_scelle
    foreign key (owner_id, ideal_id)
    references public.ideaux (owner_id, id) on delete cascade,
  constraint passerelles_talent_scelle
    foreign key (owner_id, talent_id)
    references public.talents (owner_id, id) on delete cascade,

  -- Un seul lien par (idéal, talent) pour un owner : relier deux fois la même
  -- paire n'a pas de sens (la nature se met à jour, elle ne se duplique pas). La
  -- colonne de tête owner_id sert AUSSI le filtrage RLS et le listing « les liens
  -- d'un idéal » (WHERE owner_id, ideal_id) — un index (owner_id, ideal_id) seul
  -- serait redondant, on ne le crée donc pas.
  constraint passerelles_owner_ideal_talent_uniq unique (owner_id, ideal_id, talent_id)
);

-- Requête miroir (v2, et cascade delete d'un talent) : « les liens d'un talent »
-- (WHERE owner_id, talent_id). L'unique ci-dessus (tête owner_id, ideal_id) ne la
-- couvre pas → index composite dédié (owner_id, talent_id). Miroir de
-- preuves_owner_talent_idx (0009) / directions_owner_ideal_idx (0010).
create index passerelles_owner_talent_idx
  on public.passerelles (owner_id, talent_id);

-- ---------------------------------------------------------------------------
-- 2. RLS : owner_id = (select auth.uid()) sur la table, une policy par opération.
-- ---------------------------------------------------------------------------
alter table public.passerelles enable row level security;

create policy passerelles_select on public.passerelles
  for select using (owner_id = (select auth.uid()));

create policy passerelles_insert on public.passerelles
  for insert with check (owner_id = (select auth.uid()));

create policy passerelles_update on public.passerelles
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy passerelles_delete on public.passerelles
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. Vue dérivée (security_invoker) : le rétroplanning par idéal.
--    Chaque idéal + combien de talents ACQUIS (déjà là) et combien À CONSTRUIRE
--    (manquants). C'est le bilan « ce que j'ai / ce qui me manque » (§9). Dérivé,
--    jamais stocké (toujours exact car recalculé à la lecture, cf. 0009/0010).
-- ---------------------------------------------------------------------------
create view public.ideaux_retroplanning
  with (security_invoker = true) as
select
  i.id,
  i.owner_id,
  i.intitule,
  i.registre,
  count(p.id) filter (where p.nature = 'acquis')       as nb_acquis,
  count(p.id) filter (where p.nature = 'a_construire')  as nb_a_construire,
  count(p.id)                                           as nb_liens
from public.ideaux i
left join public.passerelles p on p.ideal_id = i.id
group by i.id;   -- i.id est PK : toutes les colonnes i.* en dépendent

-- rollback :
--   drop view if exists public.ideaux_retroplanning;
--   drop policy if exists passerelles_delete on public.passerelles;
--   drop policy if exists passerelles_update on public.passerelles;
--   drop policy if exists passerelles_insert on public.passerelles;
--   drop policy if exists passerelles_select on public.passerelles;
--   drop table if exists public.passerelles;   -- (index + FK en cascade)
--   -- Données : passerelles vides tant que le lien manuel n'a pas commencé.
