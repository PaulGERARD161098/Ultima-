-- 0025 — Double-scellement des FK de network_edges et journal (constat S1,
-- AUDIT-2026-08-12). Migration CORRECTIVE, ADDITIVE, NON DESTRUCTIVE.
--
-- ⛔ GATE PAUL : comme toute migration, ce fichier n'est JAMAIS appliqué sans
--    validation explicite de Paul. Il est écrit, prouvé sûr, et attend.
--
-- ── LE CONSTAT ────────────────────────────────────────────────────────────
-- network_edges (0001) et journal (0005) sont les DEUX seules tables encore
-- sur l'ancien motif de FK « simple » : leurs clés étrangères pointent
-- `references network_nodes (id)` — l'identifiant SEUL, sans l'owner. La
-- convention de double-scellement (owner_id, id) → (owner_id, id), adoptée à
-- partir de 0008 et systématique depuis (jusqu'à personne_noeuds en 0024), ne
-- les a jamais rejointes.
--
-- Conséquence : l'API (api/reseau/edges.js) ne revérifie pas la propriété des
-- nœuds à la création d'un edge — elle s'en remet à la base. Or la FK simple
-- n'exige que l'EXISTENCE du nœud cible, pas qu'il appartienne au même owner.
-- Un utilisateur authentifié peut donc créer, DANS SON graphe, un edge dont la
-- source ou la cible est le nœud d'un AUTRE owner (200 si l'UUID existe, 400
-- sinon) : un oracle d'existence d'UUID transversal aux owners. Idem journal.
--
-- Gravité FAIBLE : les UUID sont des v4 (~122 bits), l'oracle n'est pas
-- énumérable ; pas de fuite de PII (le GET filtre nodes et edges par RLS
-- séparément), pas d'altération des données d'autrui. C'est une incohérence de
-- défense en profondeur, pas une brèche ouverte. On la ferme parce qu'une
-- règle qui vaut pour 25 tables doit valoir pour les 27.
--
-- ── LE CORRECTIF ──────────────────────────────────────────────────────────
-- Remplacer les FK simples par des FK composites (owner_id, col) référençant
-- (owner_id, id). La base refuse alors, par construction, tout edge ou toute
-- entrée de journal qui croiserait deux owners.
--
-- Prérequis présents : network_nodes_owner_id_uniq (index unique créé par 0008).
-- On crée l'équivalent sur network_edges pour que journal.edge_id puisse le
-- viser. Additif : les colonnes owner_id existent déjà partout.

begin;

-- ── Garde préalable : refuser d'agir si des données croisent déjà deux owners.
-- Sur un repo mono-owner, ces comptes valent 0 ; la migration ne doit corrompre
-- aucune donnée existante, et un ADD CONSTRAINT échouerait de toute façon — ce
-- garde donne un message clair plutôt qu'une erreur de contrainte opaque.
do $$
declare
  n_edges_src bigint;
  n_edges_tgt bigint;
  n_journal_node bigint;
  n_journal_edge bigint;
begin
  select count(*) into n_edges_src
    from public.network_edges e
    join public.network_nodes n on n.id = e.source_id
    where n.owner_id <> e.owner_id;
  select count(*) into n_edges_tgt
    from public.network_edges e
    join public.network_nodes n on n.id = e.target_id
    where n.owner_id <> e.owner_id;
  select count(*) into n_journal_node
    from public.journal j
    join public.network_nodes n on n.id = j.node_id
    where n.owner_id <> j.owner_id;
  select count(*) into n_journal_edge
    from public.journal j
    join public.network_edges e on e.id = j.edge_id
    where e.owner_id <> j.owner_id;

  if n_edges_src + n_edges_tgt + n_journal_node + n_journal_edge > 0 then
    raise exception
      'S1: % ligne(s) croisent deux owners (edges src=%, tgt=%, journal node=%, edge=%). Nettoyer avant de sceller.',
      n_edges_src + n_edges_tgt + n_journal_node + n_journal_edge,
      n_edges_src, n_edges_tgt, n_journal_node, n_journal_edge;
  end if;
end $$;

-- ── network_edges : cible unique composite (pour que journal.edge_id la vise).
create unique index if not exists network_edges_owner_id_uniq
  on public.network_edges (owner_id, id);

-- ── network_edges : FK simples → composites (owner_id, col) → (owner_id, id).
alter table public.network_edges
  drop constraint if exists network_edges_source_id_fkey,
  drop constraint if exists network_edges_target_id_fkey,
  add constraint network_edges_source_scelle
    foreign key (owner_id, source_id)
    references public.network_nodes (owner_id, id) on delete cascade,
  add constraint network_edges_target_scelle
    foreign key (owner_id, target_id)
    references public.network_nodes (owner_id, id) on delete cascade;

-- ── journal : FK simples → composites. node_id/edge_id sont NULLABLES et
-- mutuellement exclusifs (journal_cible_exclusive) : une FK composite dont une
-- colonne est NULL n'est pas vérifiée (MATCH SIMPLE), ce qui préserve
-- exactement le comportement « soit un nœud, soit un edge ».
alter table public.journal
  drop constraint if exists journal_node_id_fkey,
  drop constraint if exists journal_edge_id_fkey,
  add constraint journal_node_scelle
    foreign key (owner_id, node_id)
    references public.network_nodes (owner_id, id) on delete cascade,
  add constraint journal_edge_scelle
    foreign key (owner_id, edge_id)
    references public.network_edges (owner_id, id) on delete cascade;

commit;

-- ── TEST DE FERMETURE (à jouer sur un projet de test à deux owners seedés) ──
-- Avant : insérer dans network_edges un target_id appartenant à l'autre owner
--   RÉUSSIT (oracle). Après cette migration : ÉCHOUE en 23503.
--   Idem journal avec un edge_id d'autrui.
-- Le cas légitime (edge/journal vers un nœud du MÊME owner) continue de passer.
