-- Ultima — migration 0016 : DRAUKHAIN v1 « la volonté au-delà du possible ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes → gate + escalade Opus) : le SQL vit ici, Léo
-- l'applique au fil principal après contre-passe sécu et go explicite de Paul.
--
-- DRAUKHAIN est un cap du quadrant IMLADRIK (développement personnel) : les
-- OBJECTIFS et la VOLONTÉ inébranlable de Paul. On calque le motif éprouvé
-- ZEKROM (0010, idéaux → directions) sur la sémantique DRAUKHAIN :
--   - serments : un objectif tenu, formulé (le quoi + le pourquoi profond +
--                l'horizon). Le vœu que Paul se fait à lui-même. Miroir d'ideaux.
--   - flammes  : les rappels de foi qui entretiennent le serment — une citation
--                choisie, une victoire passée consignée, un rappel. 0..n par
--                serment. Miroir de directions/preuves.
--
-- Règle cardinale (miroir POSITIF de ZEKROM « à orienter ») : un serment SANS
-- flamme n'est ni oublié ni dévalué — il est « à raviver » = INVITATION à
-- nourrir la foi, jamais un reproche. DRAUKHAIN rappelle, il ne juge pas
-- (CADRAGE-CONSOLE §3.4 : « des rappels, PAS du jugement »).
--
-- Périmètre = v1 STRICT du mini-cadrage DRAUKHAIN (CADRAGE-IMLADRIK §6) :
--   serments + flammes uniquement. Additif et non destructif : deux tables
--   neuves + deux vues dérivées, aucune table existante touchée.
--
-- HORS v1 (différé, ne PAS modéliser ici) :
--   - passerelle serment ↔ idéal ZEKROM (un serment né d'un idéal) : boucle
--     ultérieure, manuelle. Le scellement (owner_id, id) posé ici sur `serments`
--     servira de cible aux FK composites de cette liaison v2 (motif AD-4), donc
--     elle s'ajoutera sans retoucher `serments`.
--   - liens vers les pages MAEDRETHNIR (suivre un serment dans le journal) : v2.
--
-- Données INTIMES (§5) : RLS dès la création, une policy PAR opération, WITH
-- CHECK sur les écritures, owner_id = (select auth.uid()) (initplan, cf. 0003),
-- owner_id NOT NULL default auth.uid() (0004), FK auth.users cascade, mono-user
-- strict. CHECK de longueur/énumération miroir de validate.js (défense en
-- profondeur au-dessus de la RLS). Vues en security_invoker (aucune vue
-- security definer → advisor security_definer_view reste à 0).
--
-- PAS DE SEED : la volonté de Paul se consigne à l'usage, jamais en dur dans une
-- migration (elle ne dépend pas d'un owner applicatif).

-- ---------------------------------------------------------------------------
-- 1. serments : un objectif/vœu tenu. intitule (le quoi) obligatoire ; pourquoi
--    (le pourquoi profond) et horizon (l'échéance/portée) optionnels bornés.
-- ---------------------------------------------------------------------------
create table public.serments (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Le serment lui-même (le quoi) : obligatoire, non vide, borné.
  intitule   text not null check (char_length(intitule) between 1 and 200),

  -- Le pourquoi profond : ce qui rend ce serment inébranlable. Optionnel, long.
  pourquoi   text check (pourquoi is null or char_length(pourquoi) <= 2000),

  -- L'horizon : vers quand / jusqu'où (ex. « ma vie », « cette année »). Court.
  horizon    text check (horizon is null or char_length(horizon) <= 200),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cible des FK composites (owner_id, id) : scellement AD-4 pour `flammes` (et,
  -- en v2, la passerelle serment↔idéal). id étant déjà PK, la paire est
  -- trivialement unique ; sa colonne de tête owner_id sert AUSSI le filtrage RLS
  -- et le listing « mes serments » (pas d'index (owner_id) seul redondant).
  constraint serments_owner_id_uniq unique (owner_id, id)
);

create trigger serments_set_updated_at
  before update on public.serments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. flammes : un rappel de foi rattaché à un serment. nature = le genre de
--    flamme ; texte = la flamme elle-même. Pas d'updated_at (une flamme est
--    posée, pas un état qui évolue — miroir de directions/preuves) → pas de
--    trigger.
-- ---------------------------------------------------------------------------
create table public.flammes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Le serment entretenu. ON DELETE CASCADE : supprimer un serment supprime ses
  -- flammes.
  serment_id uuid not null references public.serments (id) on delete cascade,

  -- La nature de la flamme (miroir du motif d'énumération de tout le schéma) :
  --   'citation' = une parole choisie (philosophique, chevaleresque, spirituelle) ;
  --   'victoire' = une victoire passée consignée (la preuve que c'est possible) ;
  --   'rappel'   = un rappel de foi libre (le défaut, le cran le plus ouvert).
  nature     text not null default 'rappel'
             check (nature in ('citation', 'victoire', 'rappel')),

  -- La flamme elle-même (saisie libre / dictée, registre antique), bornée.
  texte      text not null check (char_length(texte) between 1 and 2000),

  created_at timestamptz not null default now(),

  -- Scellement AD-4 (motif 0008/0009/0010) : une flamme appartient au MÊME owner
  -- que son serment — impossible d'entretenir le serment d'un autre owner, même
  -- si la RLS était mal configurée. Cible = serments_owner_id_uniq (owner_id, id).
  constraint flammes_serment_scelle
    foreign key (owner_id, serment_id)
    references public.serments (owner_id, id) on delete cascade
);

-- Requête réelle : « toutes les flammes d'un serment » (WHERE serment_id = :x,
-- la RLS ajoute owner_id = uid) ET la jointure de la vue serments_etat (LEFT
-- JOIN flammes ON serment_id). Index composite (owner_id, serment_id) : sert les
-- deux + le scellement composite + le cascade delete. Miroir de
-- directions_owner_ideal_idx (0010).
create index flammes_owner_serment_idx
  on public.flammes (owner_id, serment_id);

-- ---------------------------------------------------------------------------
-- 3. RLS : owner_id = (select auth.uid()) sur les deux tables, une policy par
--    opération, WITH CHECK sur insert/update. Initplan (cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.serments enable row level security;
alter table public.flammes enable row level security;

create policy serments_select on public.serments
  for select using (owner_id = (select auth.uid()));

create policy serments_insert on public.serments
  for insert with check (owner_id = (select auth.uid()));

create policy serments_update on public.serments
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy serments_delete on public.serments
  for delete using (owner_id = (select auth.uid()));

create policy flammes_select on public.flammes
  for select using (owner_id = (select auth.uid()));

create policy flammes_insert on public.flammes
  for insert with check (owner_id = (select auth.uid()));

create policy flammes_update on public.flammes
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy flammes_delete on public.flammes
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Vues dérivées (security_invoker : la RLS du lecteur s'applique).
--    « à raviver » = DÉRIVÉ (nb_flammes = 0), jamais stocké (même raisonnement
--    qu'a_orienter en 0010 / a_etayer en 0009). INVITATION positive, pas un défaut.
--
--    4a. serments_etat : chaque serment + nb_flammes + statut « à raviver ».
--        C'est la carte/liste v1 avec le badge « à raviver » (nb_flammes = 0).
-- ---------------------------------------------------------------------------
create view public.serments_etat
  with (security_invoker = true) as
select
  s.id,
  s.owner_id,
  s.intitule,
  s.pourquoi,
  s.horizon,
  s.created_at,
  s.updated_at,
  count(f.id)       as nb_flammes,
  (count(f.id) = 0) as a_raviver   -- true = serment sans flamme (à nourrir)
from public.serments s
left join public.flammes f on f.serment_id = s.id
group by s.id;   -- s.id est PK : toutes les colonnes s.* en dépendent

-- 4b. serments_vivants : « mes serments vivants » = ceux DÉJÀ nourris d'au moins
--     une flamme. Vue d'ENRICHISSEMENT (la foi entretenue), PAS une sélection des
--     « vrais » serments : ceux « à raviver » restent des serments pleins.
create view public.serments_vivants
  with (security_invoker = true) as
select
  id, owner_id, intitule, pourquoi, horizon,
  created_at, updated_at, nb_flammes
from public.serments_etat
where a_raviver = false;

-- rollback :
--   drop view if exists public.serments_vivants;
--   drop view if exists public.serments_etat;
--   drop policy if exists flammes_delete on public.flammes;
--   drop policy if exists flammes_update on public.flammes;
--   drop policy if exists flammes_insert on public.flammes;
--   drop policy if exists flammes_select on public.flammes;
--   drop policy if exists serments_delete on public.serments;
--   drop policy if exists serments_update on public.serments;
--   drop policy if exists serments_insert on public.serments;
--   drop policy if exists serments_select on public.serments;
--   drop table if exists public.flammes;    -- (index + FK en cascade)
--   drop table if exists public.serments;   -- (trigger + unique en cascade)
--   -- Données : serments/flammes vides tant que l'usage n'a pas commencé ; si
--   -- des serments existent, EXPORTER avant tout drop (volonté intime).
