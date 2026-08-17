-- Ultima — migration 0017 : VRANESH v1 « les différents futurs potentiels ».
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes → gate + escalade Opus) : le SQL vit ici, Léo
-- l'applique au fil principal après contre-passe sécu et go explicite de Paul.
--
-- VRANESH est un cap du quadrant IMLADRIK : ANTICIPER. Partir d'un cas donné et
-- dérouler ce qui PEUT arriver (jamais ce que Paul VEUT — ça, c'est DRAUKHAIN /
-- ZEKROM). On calque le motif éprouvé ZEKROM/DRAUKHAIN (parent → enfant) :
--   - situations : « un cas donné » (le contexte à anticiper). Miroir de serments.
--   - scenarios  : un futur potentiel de la situation — le déroulé raconté, sa
--                  vraisemblance, ses signaux avant-coureurs, la parade préparée.
--                  0..n par situation. Miroir de flammes/directions.
--
-- Règle cardinale (miroir POSITIF « à raviver »/« à orienter ») : une situation
-- SANS scénario est « à explorer » = INVITATION à imaginer ses futurs, jamais un
-- manque. Posture VRANESH : anticiper sereinement, PUIS revenir au présent — la
-- carte aide à dérouler les embranchements, pas à ruminer (CADRAGE-IMLADRIK §5).
--
-- Périmètre = v1 STRICT du mini-cadrage VRANESH (CADRAGE-IMLADRIK §5) :
--   situations + scenarios uniquement. Additif et non destructif : deux tables
--   neuves + deux vues dérivées, aucune table existante touchée.
--
-- HORS v1 (différé, ne PAS modéliser ici) :
--   - passerelles scénario → objectif DRAUKHAIN (ce qu'un futur menace/sert) ou
--     scénario → page MAEDRETHNIR (d'où vient la question) : boucle ultérieure. Le
--     scellement (owner_id, id) posé ici sur `situations` servira de cible aux FK
--     composites de ces liaisons v2 (motif AD-4), sans retoucher `situations`.
--   - édition d'un scénario : un scénario se crée ou se supprime en v1 (pas
--     d'updated_at, miroir directions/flammes).
--
-- Données INTIMES (§5) : RLS dès la création, une policy PAR opération, WITH
-- CHECK sur les écritures, owner_id = (select auth.uid()) (initplan, cf. 0003),
-- owner_id NOT NULL default auth.uid() (0004), FK auth.users cascade, mono-user
-- strict. CHECK de longueur/énumération miroir de validate.js. Vues en
-- security_invoker (aucune vue security definer → advisor reste à 0).
--
-- PAS DE SEED : les situations à anticiper se consignent à l'usage.

-- ---------------------------------------------------------------------------
-- 1. situations : « un cas donné » à anticiper. intitule (le cas) obligatoire ;
--    contexte (le détail de la situation) optionnel, borné.
-- ---------------------------------------------------------------------------
create table public.situations (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  -- Le cas donné (le quoi) : obligatoire, non vide, borné.
  intitule   text not null check (char_length(intitule) between 1 and 200),

  -- Le contexte : de quoi il s'agit, l'état des lieux. Optionnel, long.
  contexte   text check (contexte is null or char_length(contexte) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cible des FK composites (owner_id, id) : scellement AD-4 pour `scenarios`
  -- (et, en v2, les passerelles vers DRAUKHAIN / MAEDRETHNIR). id étant déjà PK, la
  -- paire est trivialement unique ; owner_id de tête sert aussi le filtrage RLS
  -- et le listing « mes situations ».
  constraint situations_owner_id_uniq unique (owner_id, id)
);

create trigger situations_set_updated_at
  before update on public.situations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. scenarios : un futur potentiel d'une situation. deroule = le futur raconté ;
--    vraisemblance = à quel point il est probable (échelle qualitative à 3 crans,
--    miroir du registre ZEKROM / de la nature DRAUKHAIN) ; signaux = les signes
--    avant-coureurs à surveiller ; parade = la réponse préparée. Pas d'updated_at
--    (un scénario est posé puis remplacé — miroir directions/flammes) → pas de
--    trigger.
-- ---------------------------------------------------------------------------
create table public.scenarios (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid()
               references auth.users (id) on delete cascade,

  -- La situation anticipée. ON DELETE CASCADE : supprimer une situation supprime
  -- ses scénarios.
  situation_id uuid not null references public.situations (id) on delete cascade,

  -- Le futur potentiel, raconté (saisie libre / dictée, registre antique), borné.
  deroule      text not null check (char_length(deroule) between 1 and 2000),

  -- Vraisemblance qualitative (jamais un pourcentage faux-précis) :
  --   'faible' = possible mais peu probable ; 'moyenne' = plausible ;
  --   'forte'  = très probable. Default 'moyenne' (le cran neutre).
  vraisemblance text not null default 'moyenne'
               check (vraisemblance in ('faible', 'moyenne', 'forte')),

  -- Les signaux avant-coureurs à surveiller (« si je vois ceci… »). Optionnel.
  signaux      text check (signaux is null or char_length(signaux) <= 2000),

  -- La parade préparée (« …alors je fais cela »). Optionnel.
  parade       text check (parade is null or char_length(parade) <= 2000),

  created_at   timestamptz not null default now(),

  -- Scellement AD-4 (motif 0008/0009/0010/0016) : un scénario appartient au MÊME
  -- owner que sa situation. Cible = situations_owner_id_uniq (owner_id, id).
  constraint scenarios_situation_scelle
    foreign key (owner_id, situation_id)
    references public.situations (owner_id, id) on delete cascade
);

-- Requête réelle : « tous les scénarios d'une situation » (WHERE situation_id = :x,
-- RLS ajoute owner_id = uid) + jointure de situations_etat. Index composite
-- (owner_id, situation_id) : sert les deux + le scellement + le cascade delete.
-- Miroir de flammes_owner_serment_idx (0016).
create index scenarios_owner_situation_idx
  on public.scenarios (owner_id, situation_id);

-- ---------------------------------------------------------------------------
-- 3. RLS : owner_id = (select auth.uid()) sur les deux tables, une policy par
--    opération, WITH CHECK sur insert/update. Initplan (cf. 0003).
-- ---------------------------------------------------------------------------
alter table public.situations enable row level security;
alter table public.scenarios enable row level security;

create policy situations_select on public.situations
  for select using (owner_id = (select auth.uid()));

create policy situations_insert on public.situations
  for insert with check (owner_id = (select auth.uid()));

create policy situations_update on public.situations
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy situations_delete on public.situations
  for delete using (owner_id = (select auth.uid()));

create policy scenarios_select on public.scenarios
  for select using (owner_id = (select auth.uid()));

create policy scenarios_insert on public.scenarios
  for insert with check (owner_id = (select auth.uid()));

create policy scenarios_update on public.scenarios
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy scenarios_delete on public.scenarios
  for delete using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 4. Vues dérivées (security_invoker). « à explorer » = DÉRIVÉ (nb_scenarios = 0),
--    jamais stocké (même raisonnement qu'a_raviver 0016 / a_orienter 0010).
--    INVITATION positive, pas un manque.
--
--    4a. situations_etat : chaque situation + nb_scenarios + statut « à explorer ».
--        C'est la carte/liste v1 avec le badge « à explorer » (nb_scenarios = 0).
-- ---------------------------------------------------------------------------
create view public.situations_etat
  with (security_invoker = true) as
select
  s.id,
  s.owner_id,
  s.intitule,
  s.contexte,
  s.created_at,
  s.updated_at,
  count(sc.id)       as nb_scenarios,
  (count(sc.id) = 0) as a_explorer   -- true = situation sans futur imaginé
from public.situations s
left join public.scenarios sc on sc.situation_id = s.id
group by s.id;   -- s.id est PK : toutes les colonnes s.* en dépendent

-- 4b. situations_anticipees : « mes situations anticipées » = celles DÉJÀ dotées
--     d'au moins un scénario. Vue d'ENRICHISSEMENT (l'anticipation faite), PAS un
--     filtre de validité : celles « à explorer » restent des situations pleines.
create view public.situations_anticipees
  with (security_invoker = true) as
select
  id, owner_id, intitule, contexte,
  created_at, updated_at, nb_scenarios
from public.situations_etat
where a_explorer = false;

-- rollback :
--   drop view if exists public.situations_anticipees;
--   drop view if exists public.situations_etat;
--   drop policy if exists scenarios_delete on public.scenarios;
--   drop policy if exists scenarios_update on public.scenarios;
--   drop policy if exists scenarios_insert on public.scenarios;
--   drop policy if exists scenarios_select on public.scenarios;
--   drop policy if exists situations_delete on public.situations;
--   drop policy if exists situations_update on public.situations;
--   drop policy if exists situations_insert on public.situations;
--   drop policy if exists situations_select on public.situations;
--   drop table if exists public.scenarios;    -- (index + FK en cascade)
--   drop table if exists public.situations;   -- (trigger + unique en cascade)
--   -- Données : situations/scenarios vides tant que l'usage n'a pas commencé ;
--   -- si des situations existent, EXPORTER avant tout drop (anticipations intimes).
