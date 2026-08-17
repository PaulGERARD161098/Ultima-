-- Ultima — migration 0018 : IMLADRIK passerelles v2 — la mémoire inter-cap.
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes → gate + escalade Opus). DÉPEND de 0016 (DRAUKHAIN)
-- ET 0017 (VRANESH) : appliquer 0016 → 0017 → 0018 dans l'ordre.
--
-- Ce que relie cette migration (CADRAGE-IMLADRIK §5/§6, « les passerelles v2 ») :
--   - un SERMENT (DRAUKHAIN) → un IDÉAL (ZEKROM 0010)   : « un serment naît d'un idéal ».
--   - un SERMENT (DRAUKHAIN) → une PAGE (MAEDRETHNIR 0012): « se suivre dans le journal ».
--   - un SCÉNARIO (VRANESH)  → un SERMENT (DRAUKHAIN)   : ce que ce futur « menace » ou « sert ».
--   - un SCÉNARIO (VRANESH)  → une PAGE (MAEDRETHNIR)     : « d'où vient la question ».
-- Manuel (Paul crée/valide chaque lien), miroir de la passerelle R↔Z (0011).
--
-- Cible XOR : chaque lien pointe EXACTEMENT une cible parmi deux types (motif
-- node_id/edge_id du journal RIVEN 0005). Le scellement AD-4 est posé sur CHAQUE
-- cible et sur la source → impossible de relier des objets d'owners différents,
-- même si la RLS était mal configurée (composite FK MATCH SIMPLE : non vérifiée
-- quand la colonne cible est NULL, vérifiée dès qu'elle est renseignée).
--
-- Additif et non destructif : deux clés uniques additives (cibles composites qui
-- manquaient) + deux tables neuves. Aucune donnée déplacée, aucune table
-- existante altérée dans ses colonnes.
--
-- Invariants conservés (RLS initplan, une policy par opération, WITH CHECK sur
-- écritures, owner_id NOT NULL default auth.uid(), CHECK miroir de l'API). PAS DE
-- SEED (les liens sont un geste de Paul en session).

-- ---------------------------------------------------------------------------
-- 0. Ancrages composites manquants (cibles des FK scellées AD-4).
--    ideaux (0010), serments (0016), situations (0017) ont déjà unique(owner_id,id).
--    Il manque imladrik_entrees (0012) et scenarios (0017) → on les ajoute. id
--    étant déjà PK, la paire (owner_id, id) est trivialement unique : index
--    additif, aucun conflit possible sur des données existantes.
-- ---------------------------------------------------------------------------
alter table public.imladrik_entrees
  add constraint imladrik_entrees_owner_id_uniq unique (owner_id, id);

alter table public.scenarios
  add constraint scenarios_owner_id_uniq unique (owner_id, id);

-- ---------------------------------------------------------------------------
-- 1. serment_liens : un serment (DRAUKHAIN) relié à UN idéal (ZEKROM) XOR UNE
--    page (MAEDRETHNIR). La source (serment) et la cible sont scellées au même owner.
-- ---------------------------------------------------------------------------
create table public.serment_liens (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  serment_id uuid not null references public.serments (id) on delete cascade,

  -- Cible XOR : exactement une des deux renseignée.
  ideal_id   uuid references public.ideaux (id) on delete cascade,
  entree_id  uuid references public.imladrik_entrees (id) on delete cascade,

  created_at timestamptz not null default now(),

  -- Exactement une cible (motif num_nonnulls du journal RIVEN).
  constraint serment_liens_cible_unique
    check (num_nonnulls(ideal_id, entree_id) = 1),

  -- Scellement AD-4 sur la source ET chaque cible (composite, MATCH SIMPLE :
  -- non vérifié quand la colonne cible est NULL). Cibles = *_owner_id_uniq.
  constraint serment_liens_serment_scelle
    foreign key (owner_id, serment_id)
    references public.serments (owner_id, id) on delete cascade,
  constraint serment_liens_ideal_scelle
    foreign key (owner_id, ideal_id)
    references public.ideaux (owner_id, id) on delete cascade,
  constraint serment_liens_entree_scelle
    foreign key (owner_id, entree_id)
    references public.imladrik_entrees (owner_id, id) on delete cascade
);

-- Listing « les liens d'un serment » (WHERE owner_id, serment_id). Colonne de
-- tête owner_id = filtrage RLS. Miroir de flammes_owner_serment_idx (0016).
create index serment_liens_owner_serment_idx
  on public.serment_liens (owner_id, serment_id);

-- Dédoublonnage par cible (NULL distinct en unique → index partiels par type) :
-- un même serment ne relie pas deux fois le même idéal / la même page.
create unique index serment_liens_ideal_uniq
  on public.serment_liens (owner_id, serment_id, ideal_id)
  where ideal_id is not null;
create unique index serment_liens_entree_uniq
  on public.serment_liens (owner_id, serment_id, entree_id)
  where entree_id is not null;

-- ---------------------------------------------------------------------------
-- 2. scenario_liens : un scénario (VRANESH) relié à UN serment (DRAUKHAIN) XOR
--    UNE page (MAEDRETHNIR). rapport = le sens du lien vers un serment (ce que ce
--    futur « menace » ou « sert ») ; n'a de sens QUE pour une cible serment.
-- ---------------------------------------------------------------------------
create table public.scenario_liens (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid()
              references auth.users (id) on delete cascade,

  scenario_id uuid not null references public.scenarios (id) on delete cascade,

  -- Cible XOR : exactement une des deux renseignée.
  serment_id  uuid references public.serments (id) on delete cascade,
  entree_id   uuid references public.imladrik_entrees (id) on delete cascade,

  -- Le rapport au serment : ce futur le 'menace' ou le 'sert'. Renseigné
  -- UNIQUEMENT quand la cible est un serment (null pour une page).
  rapport     text check (rapport is null or rapport in ('menace', 'sert')),

  created_at  timestamptz not null default now(),

  constraint scenario_liens_cible_unique
    check (num_nonnulls(serment_id, entree_id) = 1),
  -- rapport n'existe qu'avec une cible serment.
  constraint scenario_liens_rapport_scope
    check (rapport is null or serment_id is not null),

  constraint scenario_liens_scenario_scelle
    foreign key (owner_id, scenario_id)
    references public.scenarios (owner_id, id) on delete cascade,
  constraint scenario_liens_serment_scelle
    foreign key (owner_id, serment_id)
    references public.serments (owner_id, id) on delete cascade,
  constraint scenario_liens_entree_scelle
    foreign key (owner_id, entree_id)
    references public.imladrik_entrees (owner_id, id) on delete cascade
);

create index scenario_liens_owner_scenario_idx
  on public.scenario_liens (owner_id, scenario_id);

create unique index scenario_liens_serment_uniq
  on public.scenario_liens (owner_id, scenario_id, serment_id)
  where serment_id is not null;
create unique index scenario_liens_entree_uniq
  on public.scenario_liens (owner_id, scenario_id, entree_id)
  where entree_id is not null;

-- ---------------------------------------------------------------------------
-- 3. RLS : owner_id = (select auth.uid()) sur les deux tables, une policy par
--    opération, WITH CHECK sur insert/update. Initplan (cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.serment_liens enable row level security;
alter table public.scenario_liens enable row level security;

create policy serment_liens_select on public.serment_liens
  for select using (owner_id = (select auth.uid()));
create policy serment_liens_insert on public.serment_liens
  for insert with check (owner_id = (select auth.uid()));
create policy serment_liens_update on public.serment_liens
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy serment_liens_delete on public.serment_liens
  for delete using (owner_id = (select auth.uid()));

create policy scenario_liens_select on public.scenario_liens
  for select using (owner_id = (select auth.uid()));
create policy scenario_liens_insert on public.scenario_liens
  for insert with check (owner_id = (select auth.uid()));
create policy scenario_liens_update on public.scenario_liens
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy scenario_liens_delete on public.scenario_liens
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists scenario_liens_delete on public.scenario_liens;
--   drop policy if exists scenario_liens_update on public.scenario_liens;
--   drop policy if exists scenario_liens_insert on public.scenario_liens;
--   drop policy if exists scenario_liens_select on public.scenario_liens;
--   drop policy if exists serment_liens_delete on public.serment_liens;
--   drop policy if exists serment_liens_update on public.serment_liens;
--   drop policy if exists serment_liens_insert on public.serment_liens;
--   drop policy if exists serment_liens_select on public.serment_liens;
--   drop table if exists public.scenario_liens;   -- (index + FK en cascade)
--   drop table if exists public.serment_liens;    -- (index + FK en cascade)
--   alter table public.scenarios       drop constraint if exists scenarios_owner_id_uniq;
--   alter table public.imladrik_entrees drop constraint if exists imladrik_entrees_owner_id_uniq;
--   -- Données : liens vides tant que le geste manuel n'a pas commencé.
