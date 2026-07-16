-- Ultima — migration 0007 : bibliothèque d'idées ADRAMELECH « en base » (AD-4).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) :
-- le SQL vit ici, Léo l'applique au fil principal après contre-passe sécu.
--
-- Additif et non destructif : deux nouvelles tables (idees, idees_liens),
-- aucune table existante touchée, aucune donnée déplacée. Le quadrant
-- ADRAMELECH passe du registre `adramelech/IDEES.md` (source de capture) à un
-- socle relationnel privé par owner — miroir du couple network_nodes /
-- network_edges (nœuds + arêtes non orientées).
--
-- Invariants 0001-0006 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003).
--   - owner_id NOT NULL, default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API validera, la base le contraint aussi : CHECK de longueur et
--     d'énumération miroir de la future validation serveur (validate.js), FK,
--     NOT NULL, unicité métier — la défense ne repose jamais sur une couche.
--   - Trigger set_updated_at (search_path épinglé en 0002) sur before update.
--
-- PAS DE SEED ICI : l'insertion des 4 idées existantes (ADR-001..004) dépend de
-- l'owner_id de Paul, qui n'a pas encore de compte auth. Le peuplement est un
-- script d'import séparé et GATÉ (`adramelech/importer-idees.mjs`, paramétré par
-- owner_id, jamais en dur), à jouer quand le compte existera. Une migration ne
-- doit pas dépendre d'un utilisateur applicatif.

-- ---------------------------------------------------------------------------
-- 1. idees : une idée du registre ADRAMELECH (cf. adramelech/IDEES.md).
--    Bornes de longueur miroir du registre et de la future validation API.
--    adr_num : le numéro ### de l'ID ADR-### ; unique PAR owner (deux owners
--    peuvent avoir chacun leur ADR-001 sans collision — l'ID métier est local).
-- ---------------------------------------------------------------------------
create table public.idees (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  adr_num    int  not null check (adr_num >= 1),
  nom        text not null check (char_length(nom) between 1 and 120),
  -- Type non vide et borné (miroir : le parseur échoue si **Type** absent).
  type       text not null check (char_length(type) between 1 and 60),
  -- Thème : texte libre « a · b · c » (le 1er token = thème principal, calculé
  --   côté application/agent, pas en base) ; optionnel, borné.
  theme      text check (theme is null or char_length(theme) <= 200),
  statut     text not null default 'à raffiner'
             check (statut in ('brute', 'à raffiner', 'exploitable', 'close')),
  -- Partenaire envisagé : null = aucun (le « — » du registre est traduit en
  --   NULL par l'import, jamais stocké tel quel).
  partenaire text check (partenaire is null or char_length(partenaire) <= 120),
  epigraphe  text check (epigraphe is null or char_length(epigraphe) <= 300),
  essence    text check (essence is null or char_length(essence) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- ID métier local à l'owner : un seul ADR-### par personne.
  constraint idees_owner_adr_num_uniq unique (owner_id, adr_num)
);

-- Requête réelle : « liste des idées d'un owner, triées par adr_num ». L'index
-- de la contrainte unique (owner_id, adr_num) est un btree composite dont la
-- colonne de tête est owner_id : il sert À LA FOIS le filtrage par owner (RLS)
-- ET le tri par adr_num. Un index (owner_id) seul serait donc redondant — on ne
-- le crée pas (« index justifiés par les requêtes réelles »).

create trigger idees_set_updated_at
  before update on public.idees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. idees_liens : ponts NON ORIENTÉS idée ↔ idée (synergies ADR↔ADR).
--    Motif calqué sur network_edges (0001/0005), mais relation non orientée :
--    un pont entre A et B est le même que le pont entre B et A.
-- ---------------------------------------------------------------------------
create table public.idees_liens (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  source_id  uuid not null references public.idees (id) on delete cascade,
  target_id  uuid not null references public.idees (id) on delete cascade,

  created_at timestamptz not null default now(),

  -- Un pont ne relie pas une idée à elle-même.
  constraint idees_liens_no_self_loop check (source_id <> target_id)
);

-- Unicité de la PAIRE NON ORIENTÉE par owner : (A,B) et (B,A) sont un seul
-- pont. Exprimée par un index d'expression sur least/greatest des UUID (même
-- motif que network_edges_paire_active_uniq en 0005). Sert aussi le filtrage
-- « liens d'un owner » (colonne de tête owner_id).
create unique index idees_liens_paire_uniq
  on public.idees_liens (
    owner_id,
    least(source_id, target_id),
    greatest(source_id, target_id)
  );

-- Traversée « tous les ponts d'une idée » : la requête est
--   where source_id = :x or target_id = :x (relation non orientée),
-- d'où un index par extrémité (miroir network_edges source/target).
create index idees_liens_source_id_idx on public.idees_liens (source_id);
create index idees_liens_target_id_idx on public.idees_liens (target_id);

-- ---------------------------------------------------------------------------
-- 3. RLS : accès strictement limité à owner_id = (select auth.uid()) sur les
--    deux tables. Une policy par opération, WITH CHECK sur insert/update.
--    `(select auth.uid())` = évalué une fois par requête (initplan, cf. 0003),
--    pas une fois par ligne.
-- ---------------------------------------------------------------------------
alter table public.idees       enable row level security;
alter table public.idees_liens enable row level security;

-- idees : une policy par opération.
create policy idees_select on public.idees
  for select using (owner_id = (select auth.uid()));

create policy idees_insert on public.idees
  for insert with check (owner_id = (select auth.uid()));

create policy idees_update on public.idees
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy idees_delete on public.idees
  for delete using (owner_id = (select auth.uid()));

-- idees_liens : une policy par opération.
create policy idees_liens_select on public.idees_liens
  for select using (owner_id = (select auth.uid()));

create policy idees_liens_insert on public.idees_liens
  for insert with check (owner_id = (select auth.uid()));

create policy idees_liens_update on public.idees_liens
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy idees_liens_delete on public.idees_liens
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists idees_liens_delete on public.idees_liens;
--   drop policy if exists idees_liens_update on public.idees_liens;
--   drop policy if exists idees_liens_insert on public.idees_liens;
--   drop policy if exists idees_liens_select on public.idees_liens;
--   drop policy if exists idees_delete on public.idees;
--   drop policy if exists idees_update on public.idees;
--   drop policy if exists idees_insert on public.idees;
--   drop policy if exists idees_select on public.idees;
--   drop table if exists public.idees_liens;  -- (drop index + trigger en cascade)
--   drop table if exists public.idees;
--   -- Données : idees/idees_liens sont vides tant que le seed n'a pas tourné ;
--   -- aucune sauvegarde requise à ce stade (source de vérité = IDEES.md).
