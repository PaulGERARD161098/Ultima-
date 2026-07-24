-- Ultima — migration 0013 : RESHIRAM → RIVEN « le capital réseau, en lecture seule ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Boucle ④ du reste LV2 (CADRAGE-RESHIRAM-ZEKROM.md §v2 « les connexions ») :
-- brancher un talent RESHIRAM sur les fiches RIVEN réelles qu'il mobilise
--   (n°1 « sourcing d'artisans » → les artisans RIVEN activables ; n°3 « réseau
--   de contacts » → les contacts RIVEN). Ce qui transforme un talent qualitatif
--   en PREUVE CHIFFRÉE : « je couvre le CVC → X artisans RIVEN mobilisables ».
--
-- RÈGLE CARDINALE DE LA BOUCLE — lecture, JAMAIS copie, sens UNIQUE :
--   - RIVEN (network_nodes) reste l'unique source de vérité. On ne stocke ici
--     que des RÉFÉRENCES (node_id), jamais un duplicata d'une fiche : si une
--     fiche bouge ou disparaît, RESHIRAM suit sans resaisie (ON DELETE CASCADE).
--   - RESHIRAM n'écrit JAMAIS dans RIVEN. Cette migration ne touche network_nodes
--     que pour AJOUTER une contrainte d'unicité (cible de FK), aucune donnée
--     déplacée, aucune colonne métier modifiée.
--
-- Additif et non destructif : une contrainte additive sur network_nodes, une
-- table neuve, une vue dérivée. Aucune donnée existante touchée.
--
-- HORS boucle ④ (différé, ne PAS modéliser ici — cf. §v2) :
--   - capacités/moyens mobilisables, plus-values chiffrées automatiquement ;
--   - auto-suggestion de liens talent↔fiche (v2, ici c'est manuel : Paul relie).
--
-- Invariants 0001-0012 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003) —
--     jamais auth.uid() nu (advisor 0003 auth_rls_initplan).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi (FK, NOT NULL, unicité).
--   - Vues en security_invoker (la RLS des tables sous-jacentes s'applique au
--     lecteur ; aucune vue security definer → advisor security_definer_view = 0).
-- PAS DE SEED : les liens sont un geste de Paul en session (comme passerelles/0011).

-- ---------------------------------------------------------------------------
-- 0. Cible de scellement AD-4 sur RIVEN : DÉJÀ EN PLACE (0008), rien à créer.
--
--    Le double scellement (owner_id, node_id) → network_nodes(owner_id, id) exige
--    une cible unique sur (owner_id, id) de network_nodes. Cette cible existe
--    DÉJÀ : l'index unique `network_nodes_owner_id_uniq` a été créé par 0008
--    (intendant) — qui s'en sert lui-même comme cible de sa FK composite
--    `intendant_chantiers_node_scelle`. Postgres accepte un index unique comme
--    cible de FK (prouvé en prod par 0008). On ne le recrée donc PAS ici : le
--    refaire en `alter table ... add constraint` du même nom échoue (42P07,
--    « relation already exists »). Aucun geste sur network_nodes : RESHIRAM lit
--    RIVEN, ne le touche jamais. (Constat 2026-07-24 à l'application de 0013.)
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. talent_refs_reseau : une référence (talent RESHIRAM → fiche RIVEN).
--
--    node_id : la fiche RIVEN référencée (network_nodes). RÉFÉRENCE seule, aucun
--      champ de la fiche recopié — le nom/secteur/type sont lus à la volée via la
--      vue (security_invoker) et l'API (projection minimale), jamais stockés ici.
--
--    ON DELETE CASCADE des DEUX côtés :
--      - supprimer le talent retire ses références (via le scellement talents) ;
--      - supprimer la fiche RIVEN retire la référence (via le scellement RIVEN) —
--        une référence vers une fiche disparue n'a pas de sens.
-- ---------------------------------------------------------------------------
create table public.talent_refs_reseau (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  talent_id  uuid not null references public.talents (id) on delete cascade,
  node_id    uuid not null references public.network_nodes (id) on delete cascade,

  created_at timestamptz not null default now(),

  -- DOUBLE scellement AD-4 (motif 0008/0009/0011) : une référence ne relie qu'un
  -- talent ET une fiche RIVEN du MÊME owner — impossible de pointer vers le réseau
  -- d'autrui, même si la RLS était mal configurée. Cibles = talents_owner_id_uniq
  -- (0009) et network_nodes_owner_id_uniq (index unique créé par 0008, cf. §0).
  constraint talent_refs_reseau_talent_scelle
    foreign key (owner_id, talent_id)
    references public.talents (owner_id, id) on delete cascade,
  constraint talent_refs_reseau_node_scelle
    foreign key (owner_id, node_id)
    references public.network_nodes (owner_id, id) on delete cascade,

  -- Un seul lien par (talent, fiche) pour un owner : référencer deux fois la même
  -- fiche depuis le même talent n'a pas de sens. La colonne de tête owner_id sert
  -- AUSSI le filtrage RLS et le listing « les fiches d'un talent » (WHERE owner_id,
  -- talent_id) — un index (owner_id, talent_id) seul serait redondant, on ne le
  -- crée donc pas (« index justifiés par les requêtes réelles », cf. 0007/0009).
  constraint talent_refs_reseau_owner_talent_node_uniq
    unique (owner_id, talent_id, node_id)
);

-- Requête inverse (cascade delete d'une fiche RIVEN, et « quels talents mobilisent
-- cette fiche » en v2) : WHERE owner_id, node_id. L'unique ci-dessus (tête
-- owner_id, talent_id) ne la couvre pas → index composite dédié (owner_id,
-- node_id). Miroir de passerelles_owner_talent_idx (0011) / preuves (0009).
create index talent_refs_reseau_owner_node_idx
  on public.talent_refs_reseau (owner_id, node_id);

-- ---------------------------------------------------------------------------
-- 2. RLS : owner_id = (select auth.uid()) sur la table, une policy par opération.
--    Pas d'UPDATE : une référence est un lien nu (talent, fiche) — rien à modifier
--    (on la crée ou on la retire), comme un edge RIVEN sans attribut mutable.
-- ---------------------------------------------------------------------------
alter table public.talent_refs_reseau enable row level security;

create policy talent_refs_reseau_select on public.talent_refs_reseau
  for select using (owner_id = (select auth.uid()));

create policy talent_refs_reseau_insert on public.talent_refs_reseau
  for insert with check (owner_id = (select auth.uid()));

create policy talent_refs_reseau_delete on public.talent_refs_reseau
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. Vue dérivée (security_invoker) : le capital réseau par talent.
--    Chaque talent + combien de fiches RIVEN mobilisables + les secteurs couverts
--    par ces fiches (distincts, NULL « à classer » retiré). Dérivé, jamais stocké
--    (toujours exact car recalculé à la lecture, cf. 0009/0010/0011). La jointure
--    sur network_nodes se fait SOUS security_invoker : la RLS de RIVEN s'applique
--    au lecteur, donc seules SES fiches sont comptées — lecture agrégée, jamais
--    de copie ni de fuite cross-owner.
-- ---------------------------------------------------------------------------
create view public.talents_capital_reseau
  with (security_invoker = true) as
select
  t.id          as talent_id,
  t.owner_id,
  t.nom,
  count(r.id)   as nb_contacts,
  -- Secteurs réels couverts par les fiches mobilisées (distincts, sans NULL).
  -- array_remove(..., null) : les fiches « À classer » (secteur_activite null)
  -- comptent dans nb_contacts mais n'ajoutent pas de secteur fantôme.
  coalesce(
    array_remove(array_agg(distinct n.secteur_activite), null),
    '{}'
  )             as secteurs_reseau
from public.talents t
left join public.talent_refs_reseau r on r.talent_id = t.id
left join public.network_nodes n on n.id = r.node_id
group by t.id;   -- t.id est PK : toutes les colonnes t.* en dépendent

-- rollback :
--   drop view if exists public.talents_capital_reseau;
--   drop policy if exists talent_refs_reseau_delete on public.talent_refs_reseau;
--   drop policy if exists talent_refs_reseau_insert on public.talent_refs_reseau;
--   drop policy if exists talent_refs_reseau_select on public.talent_refs_reseau;
--   drop table if exists public.talent_refs_reseau;   -- (index + FK en cascade)
--   -- network_nodes NON touchée : l'index network_nodes_owner_id_uniq appartient
--   -- à 0008 (intendant s'en sert), 0013 ne l'a jamais créé — ne pas le dropper.
--   -- Données : talent_refs_reseau vides tant que le lien manuel n'a pas commencé.
