-- Ultima — migration 0010 : ZEKROM v1 « la carte des idéaux, tournée vers le cap ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- ZEKROM est le MIROIR de RESHIRAM (0009). Là où RESHIRAM ancre un talent RÉEL sur
-- une PREUVE (règle cardinale : rien d'idéalisé), ZEKROM capte un IDÉAL et le
-- formule en DIRECTION (le « cap »). Règle cardinale INVERSE (CADRAGE-RESHIRAM-
-- ZEKROM.md §2) : ici le réel ne bride pas l'expression — un idéal SANS direction
-- reste un idéal plein (« à orienter » = INVITATION à formuler le cap, jamais un
-- défaut ni une dévaluation ; le lien au réel se fait via la passerelle, pas en
-- censurant).
--
-- Périmètre = v1 STRICT du mini-cadrage ZEKROM (CADRAGE-RESHIRAM-ZEKROM.md §8) :
--   - ideaux     : un idéal / une vision / un projet idéal de Paul (le rêve).
--   - directions : « un idéal → une direction » (le cap directionnel). 0..n par
--     idéal ; 0 direction => « à orienter » (vue §4). Symétrique de preuves(0009).
-- Additif et non destructif : deux tables neuves + deux vues dérivées, aucune
-- table existante touchée, aucune donnée déplacée.
--
-- HORS v1 (différé, ne PAS modéliser ici) :
--   - table de liaison idéal ↔ talent (la passerelle vers RESHIRAM, rétroplanning
--     idéal → réel) : boucle passerelle R↔Z (LV2-③), manuelle en v1 côté produit.
--     Le scellement (owner_id, id) posé ici sur `ideaux` sert DÉJÀ de cible aux FK
--     composites de cette table v2 (même motif AD-4 que 0008/0009), donc la
--     passerelle s'ajoutera sans retoucher `ideaux`.
--   - sens/valeurs (chevauche IMLADRIK, cf. §4) : hors ZEKROM v1.
--
-- Invariants 0001-0009 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003) —
--     jamais auth.uid() nu (advisor 0003 auth_rls_initplan).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi : CHECK d'énumération et de
--     longueur (miroir de la validation serveur validate.js), FK, NOT NULL.
--   - Trigger set_updated_at (search_path figé en 0002, advisor 0011) sur before
--     update — uniquement là où updated_at existe.
--   - Vues en security_invoker (la RLS des tables sous-jacentes s'applique au
--     lecteur ; aucune vue security definer → advisor security_definer_view reste
--     à 0).
-- PAS DE SEED : les 3 idéaux réels de Paul (§8) dépendent de son owner_id. Le
-- peuplement est un script d'import séparé et GATÉ (supabase/seed-zekrom-paul.sql),
-- paramétré par owner_id (jamais en dur) — une migration ne dépend pas d'un
-- utilisateur applicatif. Les 3 exemples en fin de fichier ne servent qu'à VALIDER
-- que le modèle accueille les 3 formes (vision / volonté / projet).

-- ---------------------------------------------------------------------------
-- 1. ideaux : un idéal / une vision / un projet idéal de Paul (le rêve, le cap).
--
--    registre : la NATURE de l'idéal, échelle à 3 crans (miroir du `niveau` de
--      RESHIRAM), tournée vers l'avenir plutôt que le faire :
--        'vision'  = une aspiration, une image du futur (le plus libre).
--        'volonte' = une intention formulée, un vouloir directionnel.
--        'projet'  = un projet idéal, un rêve à réaliser (le plus incarné).
--      TEXT + CHECK (motif d'énumération de tout le schéma, cf. talents.niveau /
--      idees.statut) plutôt qu'un type enum Postgres : cohérent avec l'existant,
--      miroir direct de la validation API. Default 'vision' = le cran le plus
--      libre — un idéal naît d'abord aspiration ; l'incarner en projet est un
--      geste conscient (symétrie inverse du 'notion' humble de RESHIRAM : ici on
--      part du rêve, pas de la modestie).
--
--    horizon : le SENS de l'idéal — vers quoi il pointe, pourquoi il compte
--      (ex. « enraciner, transmettre, faire vivre le lieu »). Optionnel, borné.
--      Miroir de plus_value (RESHIRAM). N'est PAS une contrainte du réel : c'est
--      la direction, pas la faisabilité (celle-ci vit dans la passerelle v2).
-- ---------------------------------------------------------------------------
create table public.ideaux (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  intitule   text not null check (char_length(intitule) between 1 and 200),

  registre   text not null default 'vision'
             check (registre in ('vision', 'volonte', 'projet')),

  horizon    text check (horizon is null or char_length(horizon) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cible des FK composites (owner_id, id) : scellement AD-4 pour `directions`
  -- (et, en v2, la liaison idéal↔talent de la passerelle). id étant déjà PK, la
  -- paire est trivialement unique — index additif, aucun conflit possible. Sa
  -- colonne de tête owner_id sert AUSSI le filtrage par owner (RLS) et le listing
  -- « mes idéaux » : un index (owner_id) seul serait redondant, on ne le crée
  -- donc pas (« index justifiés par les requêtes réelles », cf. 0007/0009).
  constraint ideaux_owner_id_uniq unique (owner_id, id)
);

create trigger ideaux_set_updated_at
  before update on public.ideaux
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. directions : « un idéal → une direction » (le cap). Formulation concrète du
--    bearing vers lequel l'idéal oriente. Un idéal est orienté par 0..n
--    directions ; 0 direction => « à orienter » (vue §4, INVITATION positive).
--    Pas d'updated_at : une direction est une formulation posée, pas un état qui
--    évolue (miroir de preuves 0009 : { contenu, created_at }). Donc pas de
--    trigger ici.
-- ---------------------------------------------------------------------------
create table public.directions (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- L'idéal orienté. ON DELETE CASCADE : supprimer un idéal supprime ses directions.
  ideal_id   uuid not null references public.ideaux (id) on delete cascade,

  -- La direction elle-même : le cap formulé (saisie libre / dictée, registre
  -- antique), bornée comme les autres textes longs (cf. notes 0001).
  formulation text not null check (char_length(formulation) between 1 and 2000),

  created_at timestamptz not null default now(),

  -- Scellement AD-4 (motif 0008/0009) : une direction appartient au MÊME owner
  -- que son idéal — impossible d'orienter l'idéal d'un autre owner, même si la RLS
  -- était mal configurée. Cible = ideaux_owner_id_uniq (owner_id, id).
  constraint directions_ideal_scelle
    foreign key (owner_id, ideal_id)
    references public.ideaux (owner_id, id) on delete cascade
);

-- Requête réelle : « toutes les directions d'un idéal » (WHERE ideal_id = :x, la
-- RLS ajoute owner_id = uid) ET la jointure de la vue ideaux_etat (LEFT JOIN
-- directions ON ideal_id, owner constant sous security_invoker). L'index composite
-- (owner_id, ideal_id) sert les deux, plus le scellement composite et le cascade
-- delete de l'idéal. Colonne de tête owner_id = filtrage RLS. Miroir de
-- preuves_owner_talent_idx (0009).
create index directions_owner_ideal_idx
  on public.directions (owner_id, ideal_id);

-- ---------------------------------------------------------------------------
-- 3. RLS : accès strictement limité à owner_id = (select auth.uid()) sur les
--    deux tables. Une policy par opération, WITH CHECK sur insert/update.
--    `(select auth.uid())` évalué une fois par requête (initplan, cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.ideaux enable row level security;
alter table public.directions enable row level security;

-- ideaux : une policy par opération.
create policy ideaux_select on public.ideaux
  for select using (owner_id = (select auth.uid()));

create policy ideaux_insert on public.ideaux
  for insert with check (owner_id = (select auth.uid()));

create policy ideaux_update on public.ideaux
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy ideaux_delete on public.ideaux
  for delete using (owner_id = (select auth.uid()));

-- directions : une policy par opération.
create policy directions_select on public.directions
  for select using (owner_id = (select auth.uid()));

create policy directions_insert on public.directions
  for insert with check (owner_id = (select auth.uid()));

create policy directions_update on public.directions
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy directions_delete on public.directions
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Vues dérivées (security_invoker : la RLS du lecteur s'applique).
--
--    Choix « à orienter » : DÉRIVÉ, jamais stocké (même raisonnement que
--    a_etayer en 0009 : un booléen stocké devrait être maintenu par trigger et
--    pourrait diverger). La vue recalcule à la lecture → toujours exact.
--    ⚠️ Sémantique ZEKROM : « à orienter » n'exclut ni ne dévalue l'idéal
--    (règle cardinale inverse de RESHIRAM). C'est une INVITATION à formuler le
--    cap. La seconde vue (mon cap directionnel) est donc un ENRICHISSEMENT, pas
--    un filtre de validité comme « mon offre réelle » côté RESHIRAM.
--
--    4a. ideaux_etat : chaque idéal + nombre de directions + statut « à orienter ».
--        C'est la carte/liste v1 avec le badge « à orienter » (nb_directions = 0).
-- ---------------------------------------------------------------------------
create view public.ideaux_etat
  with (security_invoker = true) as
select
  i.id,
  i.owner_id,
  i.intitule,
  i.registre,
  i.horizon,
  i.created_at,
  i.updated_at,
  count(d.id)          as nb_directions,
  (count(d.id) = 0)    as a_orienter   -- true = idéal non encore formulé en cap
from public.ideaux i
left join public.directions d on d.ideal_id = i.id
group by i.id;   -- i.id est PK : toutes les colonnes i.* en dépendent

-- 4b. ideaux_cap : « mon cap directionnel » = les idéaux DÉJÀ formulés en
--     direction (au moins une direction). Vue d'ENRICHISSEMENT (le cap incarné),
--     PAS une sélection des « vrais » idéaux : ceux « à orienter » restent des
--     idéaux pleins, simplement en attente de leur cap.
create view public.ideaux_cap
  with (security_invoker = true) as
select
  id, owner_id, intitule, registre, horizon,
  created_at, updated_at, nb_directions
from public.ideaux_etat
where a_orienter = false;

-- ---------------------------------------------------------------------------
-- Validation du modèle par les 3 idéaux réels seed (§8) — NON insérés ici, juste
-- la preuve que les champs accueillent les 3 formes (dictée Paul 2026-07-23) :
--   n°1 projet (prendre soin du lieu) :
--     intitule='Prendre soin du domaine et des terres autour du moulin',
--     registre='projet', horizon='enraciner, transmettre, faire vivre le lieu' ;
--     directions à formuler (restaurer/entretenir le domaine, cultiver les terres)
--     → tant que 0 direction : a_orienter=true (invitation), présent partout.
--   n°2 vision (partir avec une femme aimée) :
--     intitule='Partir avec une femme aimée — un moment dans un village de pêcheurs',
--     registre='vision', horizon='partager une vie et un ailleurs à deux' ;
--     direction = « rencontrer, bâtir une vie mobile à deux ».
--   n°3 projet (liberté géographique) :
--     intitule='Travailler d''où je veux, libre de voyager et d''ouvrir des business partout',
--     registre='projet', horizon='liberté, mobilité, sans contrainte de lieu' ;
--     directions = revenus délocalisables ; ouvrir des business en plusieurs lieux.
--   Les 3 rentrent sans champ manquant. ✅
-- ---------------------------------------------------------------------------

-- rollback :
--   drop view if exists public.ideaux_cap;
--   drop view if exists public.ideaux_etat;
--   drop policy if exists directions_delete on public.directions;
--   drop policy if exists directions_update on public.directions;
--   drop policy if exists directions_insert on public.directions;
--   drop policy if exists directions_select on public.directions;
--   drop policy if exists ideaux_delete on public.ideaux;
--   drop policy if exists ideaux_update on public.ideaux;
--   drop policy if exists ideaux_insert on public.ideaux;
--   drop policy if exists ideaux_select on public.ideaux;
--   drop table if exists public.directions;   -- (index + FK en cascade)
--   drop table if exists public.ideaux;       -- (trigger + unique en cascade)
--   -- Données : ideaux/directions vides tant que le seed/usage n'a pas commencé ;
--   -- aucune sauvegarde requise à ce stade.
