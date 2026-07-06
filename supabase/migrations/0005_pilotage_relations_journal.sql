-- Ultima — migration 0005 : hybride v1×v2 (arbitrage Paul 2026-07-06).
-- La carte réseau v1 reste le socle ; on y greffe le pilotage du pivot v2 :
--   1. network_edges devient un RAPPROCHEMENT pilotable : cycle de vie
--      idée → contact établi → en cours → fructueux / arrêté, qualitatif
--      d'abord, chiffré ensuite (efforts 1..5), arrêt justifié OBLIGATOIRE.
--   2. journal « où j'en suis » : entrées datées sur un nœud OU une relation,
--      avec prochaine étape + date de relance (radar).
-- Invariants 0001-0004 conservés : RLS une policy par opération avec
-- (select auth.uid()), WITH CHECK, search_path épinglé, la base contraint
-- ce que l'API valide.

-- ---------------------------------------------------------------------------
-- 1. network_edges → rapprochement pilotable.
-- ---------------------------------------------------------------------------
alter table public.network_edges
  add column statut text not null default 'idee'
    check (statut in ('idee', 'contact_etabli', 'en_cours', 'fructueux', 'arrete')),
  -- Étape 1 — qualitatif d'abord : pourquoi ce rapprochement a du sens.
  add column interet_qualitatif text
    check (interet_qualitatif is null or char_length(interet_qualitatif) <= 2000),
  -- Étape 2 — chiffré ensuite : coût en temps et en énergie (échelle 1..5).
  add column effort_temps smallint
    check (effort_temps is null or effort_temps between 1 and 5),
  add column effort_energie smallint
    check (effort_energie is null or effort_energie between 1 and 5),
  -- Fin de vie : « échec pour de bonnes raisons », documenté.
  add column raison_arret text
    check (raison_arret is null or char_length(raison_arret) <= 1000),
  add column updated_at timestamptz not null default now();

-- Un arrêt DOIT être justifié (contrainte en base, pas seulement en API).
alter table public.network_edges
  add constraint network_edges_arret_justifie
    check (statut <> 'arrete' or raison_arret is not null);

create trigger network_edges_set_updated_at
  before update on public.network_edges
  for each row execute function public.set_updated_at();

create index network_edges_owner_statut_idx
  on public.network_edges (owner_id, statut);

-- Résout U5 selon la règle v2 : UNE seule relation ACTIVE par paire (non
-- orientée) et par type — les relations closes restent en historique.
create unique index network_edges_paire_active_uniq
  on public.network_edges (
    owner_id,
    least(source_id, target_id),
    greatest(source_id, target_id),
    type
  )
  where statut in ('idee', 'contact_etabli', 'en_cours');

-- ---------------------------------------------------------------------------
-- 2. journal « où j'en suis » : cible exclusive nœud OU relation.
-- ---------------------------------------------------------------------------
create table public.journal (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid()
                  references auth.users (id) on delete cascade,

  node_id         uuid references public.network_nodes (id) on delete cascade,
  edge_id         uuid references public.network_edges (id) on delete cascade,

  date_entree     date not null default current_date,
  note            text not null check (char_length(note) between 1 and 2000),

  -- Prochaine étape + date de relance (radar de Léo).
  prochaine_etape text check (prochaine_etape is null or char_length(prochaine_etape) <= 500),
  relance_at      date,
  relance_faite   boolean not null default false,

  created_at      timestamptz not null default now(),

  -- Exactement une cible.
  constraint journal_cible_exclusive
    check (num_nonnulls(node_id, edge_id) = 1),
  -- Une relance suppose une prochaine étape décrite.
  constraint journal_relance_coherente
    check (relance_at is null or prochaine_etape is not null)
);

create index journal_owner_id_idx on public.journal (owner_id);
create index journal_node_idx     on public.journal (node_id);
create index journal_edge_idx     on public.journal (edge_id);
-- Radar : relances dues non traitées (index partiel très sélectif).
create index journal_relance_idx
  on public.journal (owner_id, relance_at)
  where relance_faite = false and relance_at is not null;

alter table public.journal enable row level security;

create policy journal_select on public.journal
  for select using (owner_id = (select auth.uid()));
create policy journal_insert on public.journal
  for insert with check (owner_id = (select auth.uid()));
create policy journal_update on public.journal
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy journal_delete on public.journal
  for delete using (owner_id = (select auth.uid()));
