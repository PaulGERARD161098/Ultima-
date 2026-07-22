-- Ultima — migration 0008 : INTENDANT v1 « outil interne » (ADR-003, boucle AD-5c).
--
-- ✅ APPLIQUÉE le 2026-07-16 sur le projet Ultima (leosfqyidgsaescjbfom), gate
--    Paul ouverte (« appliquer avec le scellement » + « Go »). Post-application
--    vérifiée : les 2 tables existent avec RLS activée (rls_enabled=true).
--    ⏳ À finir : contre-passe adversariale d'isolation (interrompue par limite de
--    session) + advisors sécurité (serveur MCP indispo au moment de l'application).
--    Le bloc OPTION (scellement network_nodes) est INCLUS (choix Paul).
--
-- Périmètre v1 = check-list de rapprochement, PAS un ERP (risque n°1 du prémortem
-- ADR-003 §D : sur-ingénierie). Deux tables neuves, additives et non destructives :
--   - intendant_chantiers : le chantier PILOTÉ + sa date de pose (satellite 1-1
--     de network_nodes, s'accroche à la fiche chantier RIVEN, ne la recrée pas).
--   - intendant_besoins   : les lignes de besoin (le cœur du matching à 3 sources),
--     avec l'état dérivé (couvert / commande_en_attente / manquant) en colonne
--     GÉNÉRÉE — la base est l'unique source de vérité de l'état, il ne peut pas
--     diver de ce que l'API affiche.
--
-- HORS v1 (différé, ne PAS modéliser ici) :
--   - Import/parsing des BC/devis fournisseurs = GATE (coût, fragilité) → en v1
--     `commande_ref` est une saisie manuelle/vocale libre.
--   - Vraie gestion de stock (inventaire quantifié, décrément) → en v1 le stock
--     est une COUVERTURE par ligne (mode='stock'), pas un ledger.
--   - En-tête de commande (1 BC → n lignes) + fournisseur normalisé → dénormalisé
--     sur la ligne en v1.
--   - Généralisation SaaS multi-tenant, feeds inter-idées (GLANEUR/MYCÉLIUM).
--
-- Invariants 0001-0007 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi : CHECK d'énumération et de
--     longueur, cohérence commande/livraison/contrôle, FK, NOT NULL, unicité.
--   - Trigger set_updated_at (search_path épinglé en 0002) sur before update.
-- PAS DE SEED : les besoins sont saisis à l'usage, dépendent de l'owner_id de Paul.

-- ---------------------------------------------------------------------------
-- OPTION — scellement transversal (décision Léo/Paul, cf. AD-4 durcissement).
--   Pour interdire EN BASE qu'une ligne pointe le chantier d'un autre owner, on
--   scelle l'appartenance croisée par des FK composites (owner_id, x). Cela exige
--   une clé unique (owner_id, id) sur la table cible. Sur network_nodes (table
--   existante 0001) c'est le SEUL geste qui touche l'existant : additif (index
--   unique ; id étant déjà PK, la paire est trivialement unique, aucun conflit de
--   données), mais c'est une modif de table déjà en base → à acter.
--   Si Paul/Léo préfèrent NE PAS toucher network_nodes, retirer ce bloc ET la
--   contrainte intendant_chantiers_node_scelle plus bas ; la protection cross-owner
--   repose alors sur RLS + validation API (défense à une couche de moins).
-- ---------------------------------------------------------------------------
create unique index if not exists network_nodes_owner_id_uniq
  on public.network_nodes (owner_id, id);

-- ---------------------------------------------------------------------------
-- 1. intendant_chantiers : un chantier piloté par l'INTENDANT + sa date de pose.
--    Satellite 1-1 d'un network_node de type 'chantier' (l'accroche à RIVEN).
--    date_pose nullable : un chantier peut être ouvert avant que la date soit
--    connue ; l'alerte J-2 ne se déclenche que lorsqu'elle est renseignée.
-- ---------------------------------------------------------------------------
create table public.intendant_chantiers (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- La fiche chantier existante (network_nodes type='chantier'). On ne recrée
  -- pas d'objet chantier : on s'y accroche. Le type='chantier' est validé par
  -- l'API (un CHECK inter-tables n'est pas exprimable en FK ; cf. SPEC §note).
  node_id    uuid not null references public.network_nodes (id) on delete cascade,

  date_pose  date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un seul dossier INTENDANT par chantier et par owner.
  constraint intendant_chantiers_owner_node_uniq unique (owner_id, node_id),
  -- Cible des FK composites (owner_id, id) venant de intendant_besoins.
  constraint intendant_chantiers_owner_id_uniq unique (owner_id, id),
  -- OPTION scellement : le node référencé appartient bien au même owner.
  constraint intendant_chantiers_node_scelle
    foreign key (owner_id, node_id)
    references public.network_nodes (owner_id, id) on delete cascade
);

-- Requête réelle : scan J-2 « chantiers dont la pose approche » (owner + date).
-- Partiel (date_pose not null) : n'indexe pas les chantiers sans date de pose,
-- qui ne peuvent pas déclencher d'alerte — index plus petit et sélectif.
create index intendant_chantiers_owner_pose_idx
  on public.intendant_chantiers (owner_id, date_pose)
  where date_pose is not null;

create trigger intendant_chantiers_set_updated_at
  before update on public.intendant_chantiers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. intendant_besoins : une ligne = une pièce exigée par le chantier. Cœur du
--    matching à 3 sources, exprimé au niveau de la ligne (check-list, pas ERP) :
--    la COUVERTURE de la ligne est portée par `mode` (stock | commande | aucune)
--    et, pour une commande, par le cycle livraison → contrôle réception.
--    L'ÉTAT (couvert / commande_en_attente / manquant) est DÉRIVÉ, jamais saisi.
--    Une ligne couverte partiellement par stock + partiellement par commande se
--    saisit en DEUX lignes (philosophie check-list ; pas de table d'allocation).
-- ---------------------------------------------------------------------------
create table public.intendant_besoins (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid()
               references auth.users (id) on delete cascade,

  chantier_id  uuid not null references public.intendant_chantiers (id) on delete cascade,

  -- La pièce (ex. « aile de recouvrement »). Saisie libre (registre antique /
  -- dictée vocale ADRAMELECH), bornée.
  designation  text not null check (char_length(designation) between 1 and 200),
  quantite     numeric(12,3) not null default 1 check (quantite > 0),
  unite        text check (unite is null or char_length(unite) <= 20),
  -- Réf produit/SKU : aide au rapprochement, optionnelle et bornée.
  reference    text check (reference is null or char_length(reference) <= 120),

  -- COUVERTURE de la ligne. 'aucune' = rien décidé/disponible = manquant.
  mode         text not null default 'aucune'
               check (mode in ('stock', 'commande', 'aucune')),

  -- Volet commande (dénormalisé, seulement signifiant quand mode='commande') :
  commande_ref        text
                      check (commande_ref is null or char_length(commande_ref) <= 120),
  -- Fournisseur = un contact du réseau (optionnel, s'accroche à RIVEN).
  fournisseur_node_id uuid references public.network_nodes (id) on delete set null,
  -- Cycle de vie : livree_le null = pas encore livrée.
  livree_le           date,
  -- Contrôle réception intégré au pilotage : la casse = un manquant.
  controle            text not null default 'en_attente'
                      check (controle in ('en_attente', 'conforme', 'casse')),

  -- ÉTAT DÉRIVÉ (colonne générée stockée) — règle métier déterministe, unique
  -- source de vérité. Ne référence que des colonnes de la même ligne (requis).
  --   stock                         -> couvert
  --   commande + contrôlé conforme  -> couvert
  --   commande + cassé              -> manquant  (livré cassé = manquant)
  --   commande (sinon)              -> commande_en_attente (livré mais pas encore
  --                                    contrôlé conforme y compris)
  --   aucune                        -> manquant
  etat text generated always as (
    case
      when mode = 'stock' then 'couvert'
      when mode = 'commande' and controle = 'conforme' then 'couvert'
      when mode = 'commande' and controle = 'casse' then 'manquant'
      when mode = 'commande' then 'commande_en_attente'
      else 'manquant'
    end
  ) stored,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Cohérence : hors mode 'commande', aucun attribut de commande n'est porté
  -- (la base contraint ce que l'API valide).
  constraint intendant_besoins_commande_coherence check (
    mode = 'commande' or (
      commande_ref is null
      and fournisseur_node_id is null
      and livree_le is null
      and controle = 'en_attente'
    )
  ),
  -- On ne contrôle (conforme/cassé) qu'une ligne effectivement livrée.
  constraint intendant_besoins_controle_apres_livraison check (
    controle = 'en_attente' or livree_le is not null
  ),

  -- Scellement AD-4 : la ligne appartient au même owner que son chantier
  -- (impossible d'accrocher un besoin au chantier d'un autre owner, même si RLS
  -- était mal configurée). Cible = intendant_chantiers_owner_id_uniq.
  constraint intendant_besoins_chantier_scelle
    foreign key (owner_id, chantier_id)
    references public.intendant_chantiers (owner_id, id) on delete cascade
);

-- Requête réelle 1 : check-list d'un chantier (toutes les lignes d'un chantier).
--   La colonne de tête owner_id sert aussi le filtrage RLS.
create index intendant_besoins_owner_chantier_idx
  on public.intendant_besoins (owner_id, chantier_id);

-- Requête réelle 2 : alerte J-2 « reste-t-il un manquant ? » — index partiel très
--   sélectif sur les seules lignes manquantes (l'état recherché par l'alerte).
create index intendant_besoins_manquant_idx
  on public.intendant_besoins (owner_id, chantier_id)
  where etat = 'manquant';

create trigger intendant_besoins_set_updated_at
  before update on public.intendant_besoins
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS : accès strictement limité à owner_id = (select auth.uid()) sur les
--    deux tables. Une policy par opération, WITH CHECK sur insert/update.
--    `(select auth.uid())` évalué une fois par requête (initplan, cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.intendant_chantiers enable row level security;
alter table public.intendant_besoins   enable row level security;

-- intendant_chantiers : une policy par opération.
create policy intendant_chantiers_select on public.intendant_chantiers
  for select using (owner_id = (select auth.uid()));

create policy intendant_chantiers_insert on public.intendant_chantiers
  for insert with check (owner_id = (select auth.uid()));

create policy intendant_chantiers_update on public.intendant_chantiers
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy intendant_chantiers_delete on public.intendant_chantiers
  for delete using (owner_id = (select auth.uid()));

-- intendant_besoins : une policy par opération.
create policy intendant_besoins_select on public.intendant_besoins
  for select using (owner_id = (select auth.uid()));

create policy intendant_besoins_insert on public.intendant_besoins
  for insert with check (owner_id = (select auth.uid()));

create policy intendant_besoins_update on public.intendant_besoins
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy intendant_besoins_delete on public.intendant_besoins
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists intendant_besoins_delete   on public.intendant_besoins;
--   drop policy if exists intendant_besoins_update   on public.intendant_besoins;
--   drop policy if exists intendant_besoins_insert   on public.intendant_besoins;
--   drop policy if exists intendant_besoins_select   on public.intendant_besoins;
--   drop policy if exists intendant_chantiers_delete on public.intendant_chantiers;
--   drop policy if exists intendant_chantiers_update on public.intendant_chantiers;
--   drop policy if exists intendant_chantiers_insert on public.intendant_chantiers;
--   drop policy if exists intendant_chantiers_select on public.intendant_chantiers;
--   drop table if exists public.intendant_besoins;    -- (index + trigger en cascade)
--   drop table if exists public.intendant_chantiers;  -- (index + trigger en cascade)
--   drop index if exists public.network_nodes_owner_id_uniq;  -- OPTION scellement
--   -- Données : tables vides tant que le seed/usage n'a pas commencé ; aucune
--   -- sauvegarde requise à ce stade.
