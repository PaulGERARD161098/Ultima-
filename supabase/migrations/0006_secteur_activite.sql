-- Ultima — migration 0006 : secteur d'activité sur les contacts (boucle A2).
-- ✅ APPLIQUÉE le 2026-07-09 (version 20260709121710) — confirmé en base le
--    2026-07-11 (colonne secteur_activite présente, advisors propres). Gate close.
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations).
-- Socle du futur Arbre (A3) : les contacts d'un même secteur partageront une
-- branche. Décision Paul D3 (REFONTE-ARBRE.md §2) : TEXTE LIBRE + suggestions
-- (datalist alimentée par les valeurs déjà saisies, comme les villes), PAS de
-- liste fermée — les secteurs de Paul évoluent avec son réseau.
--
-- Additif et non destructif : une seule colonne nullable, aucune donnée touchée
-- (network_nodes.rows = 0 au moment du cadrage). Invariants 0001-0005 conservés :
-- RLS déjà active sur network_nodes, ce que l'API valide la base le contraint
-- aussi (CHECK de longueur, miroir de la validation serveur validate.js).

-- ---------------------------------------------------------------------------
-- 1. Colonne secteur_activite : texte libre optionnel, borné en longueur.
--    Garde de longueur cohérente avec les autres colonnes texte courtes
--    (miroir : validate.js NODE_FIELDS, HTML maxlength=120). La normalisation
--    pour le regroupement (minuscules + accents retirés) reste côté client
--    (réutilise normaliserTexte) : la base stocke la valeur telle que saisie,
--    on ne dépend pas d'unaccent (non IMMUTABLE) et l'affichage garde sa casse.
-- ---------------------------------------------------------------------------
alter table public.network_nodes
  add column if not exists secteur_activite text
    check (secteur_activite is null or char_length(secteur_activite) <= 120);

-- ---------------------------------------------------------------------------
-- 2. Index de regroupement.
--    Requêtes réelles justifiant l'index (toutes filtrées par owner via RLS) :
--      - datalist des suggestions : secteurs distincts déjà saisis par l'owner ;
--      - arbre A3 : contacts groupés par secteur pour un owner.
--    Partiel (secteur_activite not null) : n'indexe pas les contacts « À
--    classer » (sans secteur), qui forment une branche à part et n'ont pas
--    besoin d'être ordonnés ici — index plus petit et plus sélectif.
--    Suit le motif de 0005 (network_edges_owner_statut_idx).
-- ---------------------------------------------------------------------------
create index if not exists network_nodes_owner_secteur_idx
  on public.network_nodes (owner_id, secteur_activite)
  where secteur_activite is not null;

-- rollback :
--   drop index if exists public.network_nodes_owner_secteur_idx;
--   alter table public.network_nodes drop column if exists secteur_activite;
