-- Ultima — migration 0009 : RESHIRAM v1 « la carte des talents, ancrée sur preuve ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) : le SQL
-- vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Périmètre = v1 STRICT du mini-cadrage RESHIRAM (CADRAGE-RESHIRAM-ZEKROM.md §7) :
--   - talents : le savoir-faire réel de Paul (sectoriel OU transversal).
--   - preuves : le socle factuel (une réalisation ou un chiffre) qui étaye un
--     talent. Règle cardinale RESHIRAM : rien d'idéalisé ; un talent SANS preuve
--     est « à étayer », pas un talent affirmé.
-- Additif et non destructif : deux tables neuves + deux vues dérivées, aucune
-- table existante touchée, aucune donnée déplacée.
--
-- HORS v1 (différé, ne PAS modéliser ici — cf. §7 v2) :
--   - `talent_refs_reseau` (références LECTURE SEULE vers des fiches RIVEN,
--     jamais de copie) : boucle connexion RESHIRAM → RIVEN.
--   - table de liaison talent ↔ idéal (la passerelle vers ZEKROM) : boucle
--     passerelle, manuelle en v1 côté produit.
--   - capacités/moyens mobilisables, plus-values chiffrées automatiquement.
--   Note de compat-avant : le scellement (owner_id, id) posé ici sur `talents`
--   sert DÉJÀ de cible aux FK composites des tables v2 (même motif AD-4 que 0008),
--   donc la v2 s'ajoutera sans retoucher `talents`.
--
-- Invariants 0001-0008 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003) —
--     jamais auth.uid() nu (advisor 0003 auth_rls_initplan).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi : CHECK d'énumération et de
--     longueur (miroir de la future validation serveur validate.js), FK, NOT NULL.
--   - Trigger set_updated_at (search_path figé en 0002, advisor 0011) sur before
--     update — uniquement là où updated_at existe.
--   - Vues en security_invoker (la RLS des tables sous-jacentes s'applique au
--     lecteur ; aucune vue security definer → advisor security_definer_view reste
--     à 0).
-- PAS DE SEED : les 3 talents réels de Paul (§7) dépendent de son owner_id (pas
-- encore de compte auth). Le peuplement est un script d'import séparé et GATÉ,
-- paramétré par owner_id (jamais en dur) — une migration ne dépend pas d'un
-- utilisateur applicatif. Les 3 exemples ci-dessous ne servent qu'à VALIDER que
-- le modèle accueille les 3 formes (sectoriel / transversal / capital-réseau).

-- ---------------------------------------------------------------------------
-- 1. talents : un savoir-faire réel de Paul.
--
--    secteurs (text[]) : un talent peut couvrir PLUSIEURS secteurs (ex. n°1 =
--      CVC · cuisine · salle de bain · rénovation) OU aucun (n°2 « trancher les
--      situations floues » = talent TRANSVERSAL → tableau vide '{}'). Choix d'un
--      tableau (et non d'une table de jointure talent↔secteur) : en v1 les
--      secteurs sont du texte libre à la RIVEN (cf. 0006 secteur_activite :
--      décision Paul D3 = texte libre + suggestions, PAS de liste fermée), pas
--      un référentiel normalisé. La normalisation d'affichage (minuscules,
--      accents) reste côté client (réutilise normaliserTexte), la base stocke
--      tel que saisi. Défense en base : cardinalité bornée + aucun élément NULL.
--      La borne de longueur PAR élément n'est pas exprimable en CHECK de table
--      sans fonction (subquery interdite) → assurée côté API (miroir validate.js),
--      comme le CHECK inter-tables type='chantier' documenté en 0008.
--
--    niveau : échelle RÉELLE à 3 crans, sobre et adossée au faire — volontairement
--      SANS palier « expert » qui inviterait l'auto-idéalisation que RESHIRAM
--      proscrit (§ règle cardinale). Sens :
--        'notion'   = j'ai des bases, je sais de quoi il s'agit.
--        'pratique' = je le fais couramment, sur le terrain.
--        'maitrise' = c'est une référence pour moi (je peux le transmettre).
--      Implémenté en TEXT + CHECK (motif d'énumération de tout le schéma, cf.
--      network_nodes.statut / idees.statut) plutôt qu'en type enum Postgres :
--      cohérent avec l'existant, plus simple à faire évoluer, miroir direct de
--      la validation API. Default 'notion' = le cran le plus humble (l'INSERT
--      ne peut pas naître idéalisé ; monter de cran est un geste conscient).
--
--    plus_value : ce qui distingue concrètement Paul (ex. n°1 = « rapidité »),
--      chiffré si possible (§7). Optionnel, borné.
-- ---------------------------------------------------------------------------
create table public.talents (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  nom        text not null check (char_length(nom) between 1 and 200),

  -- Secteurs couverts. '{}' = talent transversal (sans secteur). NOT NULL : on
  -- ne distingue pas « aucun secteur » de « secteur inconnu » — un talent est
  -- soit sectoriel (liste non vide) soit transversal (liste vide), jamais NULL.
  secteurs   text[] not null default '{}'
             check (
               -- cardinalité bornée (un talent ne couvre pas 100 secteurs)
               (array_length(secteurs, 1) is null or array_length(secteurs, 1) <= 20)
               -- aucun élément NULL dans le tableau
               and array_position(secteurs, null) is null
             ),

  niveau     text not null default 'notion'
             check (niveau in ('notion', 'pratique', 'maitrise')),

  plus_value text check (plus_value is null or char_length(plus_value) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cible des FK composites (owner_id, id) : scellement AD-4 pour `preuves`
  -- (et, en v2, talent_refs_reseau / liaison talent↔idéal). id étant déjà PK,
  -- la paire est trivialement unique — index additif, aucun conflit possible.
  -- Sa colonne de tête owner_id sert AUSSI le filtrage par owner (RLS) et le
  -- listing « mes talents » : un index (owner_id) seul serait redondant, on ne
  -- le crée donc pas (« index justifiés par les requêtes réelles », cf. 0007).
  constraint talents_owner_id_uniq unique (owner_id, id)
);

create trigger talents_set_updated_at
  before update on public.talents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. preuves : le socle factuel d'un talent (une réalisation ou un chiffre).
--    Un talent est étayé par 0..n preuves ; 0 preuve => « à étayer » (vue §4).
--    Pas d'updated_at : une preuve est un fait consigné, pas un état qui évolue
--    (spec §7 : preuves { contenu, created_at }). Donc pas de trigger ici.
-- ---------------------------------------------------------------------------
create table public.preuves (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Le talent étayé. ON DELETE CASCADE : supprimer un talent supprime ses preuves.
  talent_id  uuid not null references public.talents (id) on delete cascade,

  -- La preuve elle-même : réalisation décrite ou chiffre (saisie libre / dictée,
  -- registre antique), bornée comme les autres textes longs (cf. notes 0001).
  contenu    text not null check (char_length(contenu) between 1 and 2000),

  created_at timestamptz not null default now(),

  -- Scellement AD-4 (motif 0008) : une preuve appartient au MÊME owner que son
  -- talent — impossible d'étayer le talent d'un autre owner, même si la RLS était
  -- mal configurée. Cible = talents_owner_id_uniq (owner_id, id).
  constraint preuves_talent_scelle
    foreign key (owner_id, talent_id)
    references public.talents (owner_id, id) on delete cascade
);

-- Requête réelle : « toutes les preuves d'un talent » (WHERE talent_id = :x, la
-- RLS ajoute owner_id = uid) ET la jointure de la vue talents_etat (LEFT JOIN
-- preuves ON talent_id, owner constant sous security_invoker). L'index composite
-- (owner_id, talent_id) sert les deux, plus le scellement composite et le cascade
-- delet du talent (owner_id + talent_id tous deux connus depuis la ligne talent
-- supprimée). Colonne de tête owner_id = filtrage RLS. Miroir de
-- intendant_besoins_owner_chantier_idx (0008).
create index preuves_owner_talent_idx
  on public.preuves (owner_id, talent_id);

-- ---------------------------------------------------------------------------
-- 3. RLS : accès strictement limité à owner_id = (select auth.uid()) sur les
--    deux tables. Une policy par opération, WITH CHECK sur insert/update.
--    `(select auth.uid())` évalué une fois par requête (initplan, cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.talents enable row level security;
alter table public.preuves enable row level security;

-- talents : une policy par opération.
create policy talents_select on public.talents
  for select using (owner_id = (select auth.uid()));

create policy talents_insert on public.talents
  for insert with check (owner_id = (select auth.uid()));

create policy talents_update on public.talents
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy talents_delete on public.talents
  for delete using (owner_id = (select auth.uid()));

-- preuves : une policy par opération.
create policy preuves_select on public.preuves
  for select using (owner_id = (select auth.uid()));

create policy preuves_insert on public.preuves
  for insert with check (owner_id = (select auth.uid()));

create policy preuves_update on public.preuves
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy preuves_delete on public.preuves
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Vues dérivées (security_invoker : la RLS du lecteur s'applique).
--
--    Choix « à étayer » : DÉRIVÉ, jamais stocké. Un booléen a_etayer stocké sur
--    talents devrait être maintenu par trigger à chaque insert/delete de preuve
--    et pourrait diverger (sur-ingénierie + risque de dérive). Une colonne
--    générée ne peut pas référencer une autre table. La vue est le geste le plus
--    propre : l'état « à étayer » est TOUJOURS exact car recalculé à la lecture,
--    et la base reste l'unique source de vérité.
--
--    4a. talents_etat : chaque talent + nombre de preuves + statut « à étayer ».
--        C'est la carte/liste v1 avec le badge « à étayer » (nb_preuves = 0).
-- ---------------------------------------------------------------------------
create view public.talents_etat
  with (security_invoker = true) as
select
  t.id,
  t.owner_id,
  t.nom,
  t.secteurs,
  t.niveau,
  t.plus_value,
  t.created_at,
  t.updated_at,
  count(p.id)        as nb_preuves,
  (count(p.id) = 0)  as a_etayer   -- true = talent non étayé (« à étayer »)
from public.talents t
left join public.preuves p on p.talent_id = t.id
group by t.id;   -- t.id est PK : toutes les colonnes t.* en dépendent

-- 4b. talents_offre_reelle : « mon offre réelle » = ce que Paul peut proposer
--     AUJOURD'HUI = uniquement les talents ÉTAYÉS (au moins une preuve). Les
--     talents « à étayer » n'y figurent pas (règle cardinale : pas de talent
--     affirmé sans preuve).
create view public.talents_offre_reelle
  with (security_invoker = true) as
select
  id, owner_id, nom, secteurs, niveau, plus_value,
  created_at, updated_at, nb_preuves
from public.talents_etat
where a_etayer = false;

-- ---------------------------------------------------------------------------
-- Validation du modèle par les 3 talents réels seed (§7) — NON insérés ici,
-- juste la preuve que les champs accueillent les 3 formes :
--   n°1 sectoriel multi-secteur :
--     nom='Sourcing d''artisans rapide',
--     secteurs='{CVC,cuisine,salle de bain,rénovation}', niveau='maitrise',
--     plus_value='rapidité' ; preuves à documenter (artisans/chantiers trouvés)
--     → tant que 0 preuve : a_etayer=true, absent de talents_offre_reelle.
--   n°2 transversal SANS secteur :
--     nom='Trancher les situations floues', secteurs='{}' (vide = transversal),
--     niveau='pratique', plus_value='esprit analytique et décisionnel' ;
--     preuves = décisions passées à citer.
--   n°3 capital/réseau :
--     nom='Petit réseau de contacts utiles + capacité à en trouver',
--     secteurs='{}' ou secteurs concernés, niveau libre ; en v1 c'est un talent
--     ordinaire étayé par des preuves textuelles — les RÉFÉRENCES vers les fiches
--     RIVEN sont la v2 (talent_refs_reseau), non modélisées ici.
--   Les 3 rentrent sans champ manquant. ✅
-- ---------------------------------------------------------------------------

-- rollback :
--   drop view if exists public.talents_offre_reelle;
--   drop view if exists public.talents_etat;
--   drop policy if exists preuves_delete on public.preuves;
--   drop policy if exists preuves_update on public.preuves;
--   drop policy if exists preuves_insert on public.preuves;
--   drop policy if exists preuves_select on public.preuves;
--   drop policy if exists talents_delete on public.talents;
--   drop policy if exists talents_update on public.talents;
--   drop policy if exists talents_insert on public.talents;
--   drop policy if exists talents_select on public.talents;
--   drop table if exists public.preuves;   -- (index + FK en cascade)
--   drop table if exists public.talents;   -- (trigger + unique en cascade)
--   -- Données : talents/preuves vides tant que le seed/usage n'a pas commencé ;
--   -- aucune sauvegarde requise à ce stade.
