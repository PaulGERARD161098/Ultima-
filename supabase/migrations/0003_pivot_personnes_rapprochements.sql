-- Ultima — migration 0003 : pivot du modèle de données.
-- Actée par Paul le 2026-07-03 (« go pour tout »).
--
-- Ce que cette migration fait :
--   1. Supprime network_nodes / network_edges (tables VIDES, 0 utilisateur —
--      base neuve, autarcie mono-utilisateur : aucune donnée à sauvegarder).
--   2. Fait de la PERSONNE le seul nœud de la carte (l'entreprise n'est qu'un
--      attribut). Champs d'affinité structurés (valeurs, état d'esprit) pour
--      alimenter les suggestions de passerelles.
--   3. Fait du RAPPROCHEMENT un objet pilotable de plein droit reliant deux
--      personnes, portant la méthode de Paul (qualitatif → chiffré → pilotage)
--      avec cycle de vie idée → contact établi → en cours → fructueux / arrêté.
--   4. Ajoute le JOURNAL « où j'en suis » : entrées datées rattachées à une
--      personne OU à un rapprochement, avec prochaine étape + date de relance
--      (exploitée par le radar de Léo en arrière-plan).
--
-- Invariants respectés (comme 0001/0002) :
--   - RLS activée dès la création, une policy par opération, WITH CHECK sur
--     insert/update, owner_id = (select auth.uid()) (motif initplan de 0002).
--   - Toute fonction a un search_path épinglé.
--   - Ce que l'API valide, la base le contraint (CHECK, FK, NOT NULL, unicité).
--
-- ⚠️ GATE PAUL : cette migration DROP deux tables et modifie le schéma. Elle
--    ne doit JAMAIS être appliquée par un agent seul. Paul valide l'application.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 0. Dépose de l'ancien modèle (edges d'abord : FK vers nodes).
--    Base vide confirmée (0 ligne, 0 utilisateur) — pas de sauvegarde requise.
-- ---------------------------------------------------------------------------
drop table if exists public.network_edges;
drop table if exists public.network_nodes;

-- ---------------------------------------------------------------------------
-- 1. Fonction utilitaire : validation des tableaux de tags (double couche).
--    IMMUTABLE + search_path épinglé. Bornage cardinalité + longueur unitaire,
--    miroir exact de ce que validera l'API. Pas de SECURITY DEFINER (inutile).
-- ---------------------------------------------------------------------------
create or replace function public.tags_valides(tags text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select tags is null or (
    cardinality(tags) <= 20
    and not exists (
      select 1 from unnest(tags) as t
      where t is null
         or char_length(btrim(t)) < 1
         or char_length(t) > 40
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. personnes : le seul nœud de la carte. L'entreprise est un attribut.
-- ---------------------------------------------------------------------------
create table public.personnes (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,

  -- Identité (au moins le nom).
  prenom        text check (prenom is null or char_length(prenom) <= 120),
  nom           text not null check (char_length(nom) between 1 and 200),

  -- Structure = simple attribut de la personne.
  structure     text check (structure is null or char_length(structure) <= 200),
  role          text check (role is null or char_length(role) <= 120),

  -- Métier : catégorie grossière (couleur carte) + libellé précis.
  categorie     text not null default 'autre'
                check (categorie in ('artisan', 'partenaire', 'lead', 'autre')),
  metier        text check (metier is null or char_length(metier) <= 120),

  -- Coordonnées.
  ville         text check (ville is null or char_length(ville) <= 200),
  adresse       text check (adresse is null or char_length(adresse) <= 500),
  telephone     text check (telephone is null or char_length(telephone) <= 30),
  email         text check (email is null or char_length(email) <= 200),

  -- Géolocalisation.
  lat           double precision check (lat is null or (lat between -90 and 90)),
  lng           double precision check (lng is null or (lng between -180 and 180)),

  -- Statut relationnel (où en est le lien avec cette personne).
  statut_relation text not null default 'a_contacter'
                check (statut_relation in
                  ('a_contacter', 'en_relation', 'de_confiance', 'dormant', 'perdu')),

  -- Affinité STRUCTURÉE : moteur des suggestions de passerelles.
  valeurs       text[] not null default '{}' check (public.tags_valides(valeurs)),
  etat_esprit   text[] not null default '{}' check (public.tags_valides(etat_esprit)),

  notes         text check (notes is null or char_length(notes) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index personnes_owner_id_idx        on public.personnes (owner_id);
create index personnes_owner_categorie_idx on public.personnes (owner_id, categorie);
create index personnes_owner_statut_idx    on public.personnes (owner_id, statut_relation);
-- GIN : recherche de recouvrement de tags (opérateur &&) pour les passerelles.
create index personnes_valeurs_gin     on public.personnes using gin (valeurs);
create index personnes_etat_esprit_gin on public.personnes using gin (etat_esprit);

create trigger personnes_set_updated_at
  before update on public.personnes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. rapprochements : objet pilotable reliant DEUX personnes.
--    Paire canonique (a < b) => symétrie garantie + unicité triviale.
-- ---------------------------------------------------------------------------
create table public.rapprochements (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,

  personne_a_id uuid not null references public.personnes (id) on delete cascade,
  personne_b_id uuid not null references public.personnes (id) on delete cascade,

  -- Cycle de vie.
  statut        text not null default 'idee'
                check (statut in
                  ('idee', 'contact_etabli', 'en_cours', 'fructueux', 'arrete')),

  -- Nature de la passerelle envisagée (héritée des anciens types de relation).
  nature        text check (nature is null or nature in
                  ('apport_affaires', 'sous_traitance', 'chantier_commun', 'autre')),

  -- Étape 1 — qualitatif d'abord : pourquoi ce rapprochement a du sens.
  interet_qualitatif text
                check (interet_qualitatif is null or char_length(interet_qualitatif) <= 2000),

  -- Étape 2 — chiffré ensuite : coût en temps et en énergie (échelle 1..5).
  effort_temps   smallint check (effort_temps  is null or effort_temps  between 1 and 5),
  effort_energie smallint check (effort_energie is null or effort_energie between 1 and 5),

  -- Fin de vie : raison documentée (« échec pour de bonnes raisons »).
  raison_arret  text check (raison_arret is null or char_length(raison_arret) <= 1000),

  notes         text check (notes is null or char_length(notes) <= 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Paire ordonnée et distincte (symétrie + pas de boucle sur soi).
  constraint rapprochements_paire_ordonnee check (personne_a_id < personne_b_id),
  -- Un arrêt DOIT être justifié (contrainte en base, pas seulement en API).
  constraint rapprochements_arret_justifie
    check (statut <> 'arrete' or raison_arret is not null)
);

create index rapprochements_owner_id_idx     on public.rapprochements (owner_id);
create index rapprochements_owner_statut_idx on public.rapprochements (owner_id, statut);
create index rapprochements_personne_a_idx   on public.rapprochements (personne_a_id);
create index rapprochements_personne_b_idx   on public.rapprochements (personne_b_id);
-- Un seul rapprochement ACTIF par paire (les clos restent en historique).
create unique index rapprochements_paire_active_uniq
  on public.rapprochements (owner_id, personne_a_id, personne_b_id)
  where statut in ('idee', 'contact_etabli', 'en_cours');

create trigger rapprochements_set_updated_at
  before update on public.rapprochements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. journal « où j'en suis » : entrée datée rattachée à UNE personne
--    OU UN rapprochement (jamais les deux, jamais aucun).
-- ---------------------------------------------------------------------------
create table public.journal (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id) on delete cascade,

  personne_id      uuid references public.personnes (id) on delete cascade,
  rapprochement_id uuid references public.rapprochements (id) on delete cascade,

  date_entree      date not null default current_date,
  note             text not null check (char_length(note) between 1 and 2000),

  -- Prochaine étape + date de relance (radar de Léo).
  prochaine_etape  text check (prochaine_etape is null or char_length(prochaine_etape) <= 500),
  relance_at       date,
  relance_faite    boolean not null default false,

  created_at       timestamptz not null default now(),

  -- Cible exclusive : exactement une des deux références.
  constraint journal_cible_exclusive
    check (num_nonnulls(personne_id, rapprochement_id) = 1),
  -- Une relance suppose une prochaine étape décrite.
  constraint journal_relance_coherente
    check (relance_at is null or prochaine_etape is not null)
);

create index journal_owner_id_idx      on public.journal (owner_id);
create index journal_personne_idx      on public.journal (personne_id);
create index journal_rapprochement_idx on public.journal (rapprochement_id);
-- Radar : relances dues et non traitées (index partiel, très sélectif).
create index journal_relance_idx
  on public.journal (owner_id, relance_at)
  where relance_faite = false and relance_at is not null;

-- ---------------------------------------------------------------------------
-- 5. RLS : owner_id = (select auth.uid()) sur les trois tables.
--    Une policy par opération, WITH CHECK sur insert/update (motif 0002).
-- ---------------------------------------------------------------------------
alter table public.personnes      enable row level security;
alter table public.rapprochements enable row level security;
alter table public.journal        enable row level security;

-- personnes
create policy personnes_select on public.personnes
  for select using (owner_id = (select auth.uid()));
create policy personnes_insert on public.personnes
  for insert with check (owner_id = (select auth.uid()));
create policy personnes_update on public.personnes
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy personnes_delete on public.personnes
  for delete using (owner_id = (select auth.uid()));

-- rapprochements
create policy rapprochements_select on public.rapprochements
  for select using (owner_id = (select auth.uid()));
create policy rapprochements_insert on public.rapprochements
  for insert with check (owner_id = (select auth.uid()));
create policy rapprochements_update on public.rapprochements
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy rapprochements_delete on public.rapprochements
  for delete using (owner_id = (select auth.uid()));

-- journal
create policy journal_select on public.journal
  for select using (owner_id = (select auth.uid()));
create policy journal_insert on public.journal
  for insert with check (owner_id = (select auth.uid()));
create policy journal_update on public.journal
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy journal_delete on public.journal
  for delete using (owner_id = (select auth.uid()));

-- ===========================================================================
-- rollback (à exécuter manuellement pour annuler — base vide, sans perte) :
--
--   drop table if exists public.journal;
--   drop table if exists public.rapprochements;
--   drop table if exists public.personnes;
--   drop function if exists public.tags_valides(text[]);
--   -- puis ré-appliquer 0001_init.sql et 0002_advisors… pour restaurer
--   -- network_nodes / network_edges (conservés dans l'historique git).
-- ===========================================================================
