-- Ultima — migration 0009 : mémoire de Léo-au-site (L3 v1).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations) :
-- le SQL vit ici, Léo l'applique au fil principal après contre-passe sécu.
-- Rédigée le 2026-07-20 (escalade Opus signalée : modèle de données + RLS).
--
-- Spec d'origine : CADRAGE-LEO-SITE.md §4 « L3 — la mémoire apprenante »,
-- Cadrage v1 (2026-07-20, go Paul). Séquence ① « SQL rédigé » — cette
-- migration N'EST QUE l'étape ① : ni branchement de route, ni boucle de
-- préférence ici.
--
-- Une seule table neuve, additive et non destructive : `leo_memoire`, mémoire
-- mono-owner de l'assistante au fil du site, 3 genres :
--   - trace_action    : chaque action confirmée OU annulée par Paul (matière
--                       brute de l'apprentissage) — append-only à l'usage.
--   - resume_quadrant : le dernier « où on en est » par quadrant (upsert :
--                       une seule ligne par owner × quadrant).
--   - preference      : règle/agrégat appris (clé + contenu) — une ligne par
--                       owner × quadrant × clé.
--
-- ÉCRITURES 100 % DÉTERMINISTES CÔTÉ SERVEUR (cadrage §4 L3) : c'est la route
-- qui écrit (trace à la confirmation/annulation, résumé en fin d'échange,
-- agrégats de préférence). L'IA n'a AUCUN outil d'écriture mémoire : pas
-- d'autorité nouvelle, pas de surface d'injection nouvelle. En base il n'y a
-- donc RIEN à faire au-delà du RLS mono-owner strict ci-dessous — le serveur
-- écrit sous le JWT de Paul, même autorité que les endpoints CRUD.
--
-- ROTATION : PAS de trigger de purge en v1. Le plafonnement « au-delà de M
-- traces par quadrant » (cadrage §4 « Bornes ») est assuré par la ROUTE, pas
-- par la base — aucune suppression pilotable par l'IA, aucun DELETE automatique
-- ici. Le CHECK de longueur (contenu ≤ 2000) est la seule borne exprimée en base.
--
-- Invariants 0001-0008 conservés :
--   - RLS active dès la création, une policy PAR opération, WITH CHECK sur les
--     écritures, condition owner_id = (select auth.uid()) (initplan, cf. 0003).
--   - owner_id NOT NULL default auth.uid() (cf. 0004), FK auth.users cascade.
--   - Ce que l'API valide, la base le contraint aussi : CHECK d'énumération, de
--     longueur, de cohérence par genre, unicité métier — défense multi-couche.
--   - Trigger set_updated_at (fonction public.set_updated_at, search_path épinglé
--     en 0002 ; motif 0007/0008) sur before update.
-- DURCISSEMENT L3 (au-delà de 0007/0008) : RLS non seulement ENABLE mais FORCE
--   (le propriétaire de la table est lui aussi soumis aux policies). La mémoire
--   de Léo touche au financier et à l'intime (CADRAGE-CONSOLE §5, sécurité
--   relevée) : on ne laisse aucune voie de contournement au rôle propriétaire.
-- PAS DE SEED : la mémoire se peuple à l'usage, dépend de l'owner_id de Paul.

-- ---------------------------------------------------------------------------
-- 1. leo_memoire : une ligne de mémoire de l'assistante, mono-owner strict.
--
--    Nullabilité de `quadrant` et `cle` PAR GENRE (colonne nullable, cohérence
--    forcée par CHECK plus bas) :
--      - quadrant : NON NULL pour trace_action et resume_quadrant (toute trace
--        et tout résumé appartiennent à un quadrant précis). NULLABLE pour la
--        seule `preference` : une préférence peut être TRANSVERSE (« Paul
--        préfère des réponses courtes ») et non rattachée à un quadrant. C'est
--        le seul genre qui justifie le NULL (cf. spec « NULLABLE seulement si un
--        genre le justifie »).
--      - cle : réservée à `preference` (clé de la règle/agrégat, ex.
--        'annule_relances'). NULL pour trace_action et resume_quadrant. Cette
--        exclusivité (cle non nulle ⇔ preference) est un durcissement assumé :
--        la spec impose cle NULL pour resume_quadrant et cle NON NULL pour
--        preference, et reste muette sur trace_action ; on tranche cle NULL pour
--        trace_action (une trace brute n'a pas de clé d'agrégat) — plus simple à
--        raisonner, plus contraint.
-- ---------------------------------------------------------------------------
create table public.leo_memoire (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid()
             references auth.users (id) on delete cascade,

  genre      text not null
             check (genre in ('trace_action', 'resume_quadrant', 'preference')),
  -- Nullable au niveau colonne ; la cohérence par genre est forcée plus bas.
  quadrant   text
             check (quadrant is null
                    or quadrant in ('traveler', 'bcp', 'adramelech', 'imladrik')),
  -- Clé de préférence / d'agrégat (bornée). Nulle hors 'preference'.
  cle        text
             check (cle is null or char_length(cle) between 1 and 120),
  -- Corps de la mémoire (résumé, description de trace, formulation d'agrégat).
  -- Borne ≤ 2000 chars (cadrage §4 « Bornes ») — miroir de la validation API.
  contenu    text not null check (char_length(contenu) between 1 and 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cohérence par genre (la base contraint ce que l'API valide). `genre` étant
  -- déjà borné aux 3 valeurs, ces trois branches sont exhaustives :
  --   resume_quadrant -> quadrant NON NULL, cle NULL
  --   trace_action    -> quadrant NON NULL, cle NULL
  --   preference      -> cle NON NULL, quadrant libre (NULL = préférence transverse)
  constraint leo_memoire_coherence_genre check (
    (genre = 'resume_quadrant' and quadrant is not null and cle is null)
    or (genre = 'trace_action'    and quadrant is not null and cle is null)
    or (genre = 'preference'      and cle is not null)
  )
);

-- Unicité 1 : un seul résumé par owner × quadrant (upsert du « où on en est »).
-- Index unique PARTIEL sur le seul genre resume_quadrant.
create unique index leo_memoire_resume_quadrant_uniq
  on public.leo_memoire (owner_id, quadrant)
  where genre = 'resume_quadrant';

-- Unicité 2 : une seule préférence par owner × quadrant × clé. Index unique
-- PARTIEL sur le seul genre preference. NULLS NOT DISTINCT (PG15+) : deux
-- préférences transverses (quadrant NULL) de même clé DOIVENT collisionner —
-- sans cette clause, Postgres traiterait les quadrants NULL comme distincts et
-- laisserait passer des doublons de préférence globale.
create unique index leo_memoire_preference_uniq
  on public.leo_memoire (owner_id, quadrant, cle)
  nulls not distinct
  where genre = 'preference';

-- Requête réelle (lecture, cadrage §4) : « N dernières traces d'un quadrant »
--   where owner_id = :o and genre = 'trace_action' and quadrant = :q
--   order by created_at desc limit :N
-- Index partiel sur les seules traces, colonnes de tête owner_id+quadrant
-- (filtrage RLS + quadrant) puis created_at desc (tri du limit).
create index leo_memoire_trace_recent_idx
  on public.leo_memoire (owner_id, quadrant, created_at desc)
  where genre = 'trace_action';

create trigger leo_memoire_set_updated_at
  before update on public.leo_memoire
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS : accès strictement limité à owner_id = (select auth.uid()).
--    ENABLE + FORCE (cf. en-tête « durcissement L3 »). Une policy par opération,
--    WITH CHECK sur insert/update. `(select auth.uid())` évalué une fois par
--    requête (initplan, cf. 0003), pas une fois par ligne.
--    Aucune écriture IA : ces policies suffisent — le serveur écrit sous le JWT
--    de Paul (même autorité que les API directes), l'IA n'a aucun outil mémoire.
-- ---------------------------------------------------------------------------
alter table public.leo_memoire enable  row level security;
alter table public.leo_memoire force   row level security;

create policy leo_memoire_select on public.leo_memoire
  for select using (owner_id = (select auth.uid()));

create policy leo_memoire_insert on public.leo_memoire
  for insert with check (owner_id = (select auth.uid()));

create policy leo_memoire_update on public.leo_memoire
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy leo_memoire_delete on public.leo_memoire
  for delete using (owner_id = (select auth.uid()));

-- rollback :
--   drop policy if exists leo_memoire_delete on public.leo_memoire;
--   drop policy if exists leo_memoire_update on public.leo_memoire;
--   drop policy if exists leo_memoire_insert on public.leo_memoire;
--   drop policy if exists leo_memoire_select on public.leo_memoire;
--   drop table if exists public.leo_memoire;  -- (index + trigger en cascade)
--   -- Données : leo_memoire est vide tant que la route L3 n'écrit pas ; aucune
--   -- sauvegarde requise à ce stade.
