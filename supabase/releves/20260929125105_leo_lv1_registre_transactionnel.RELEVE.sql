-- ⛔ CE FICHIER EST UN RELEVÉ, PAS L'ORIGINAL — et le suffixe .RELEVE le dit.
--
-- La migration `leo_lv1_registre_transactionnel` a été APPLIQUÉE en base le
-- 2026-09-29 à 12:51 UTC (supabase_migrations.schema_migrations), mais son
-- fichier n'a JAMAIS été commité dans ce dépôt. Constaté le 30/09 :
--   · 0 fichier la contenant dans supabase/migrations/ ;
--   · 0 référence à `leo_missions` / `leo_operations` dans .js/.mjs/.ts/.md.
--
-- ⛔ LE PROBLÈME QUE ÇA POSE, et il est plus grave que deux tables inconnues :
-- LE DÉPÔT NE DÉCRIT PLUS LA BASE. Une séance qui lit `supabase/migrations/`
-- pour savoir ce qui existe conclut que ces tables n'existent pas — c'est
-- exactement l'erreur que j'ai commise le 29/09 en concevant `leo_ecritures`
-- sans les voir.
--
-- Ce fichier est donc un CONSTAT rétroactif, relevé depuis la base
-- (information_schema, pg_constraint, pg_policies, pg_indexes). Il est
-- idempotent pour être relisible sans danger, mais ⚠️ il peut différer de
-- l'original dans des détails que le catalogue ne rend pas (ordre des
-- clauses, commentaires). L'original est à retrouver dans la séance qui l'a
-- appliquée.
--
-- ---- CE QUE CE DISPOSITIF EST -------------------------------------------
-- Le moteur d'exécution d'un agent : missions autorisées, quotas, idempotence,
-- verrou optimiste. C'est l'étape ④ de B1 (cadrage §12.9), construite ailleurs.
--   · `leo_missions`   : l'autorisation et les quotas (state, max_units/calls,
--     used_units/calls, stopped, expires_at, readers/writers, version) ;
--   · `leo_operations` : le registre des opérations, idempotent par
--     PK (mission_id, operation_id), avec base_version pour le verrou.
-- ⚠️ APPEND-ONLY PAR LE SILENCE DES POLICIES, comme `leo_ecritures` : seul
-- SELECT est accordé à `authenticated`, aucune policy d'écriture n'existe.

create table if not exists public.leo_missions (
  id               uuid primary key,
  owner            uuid not null references auth.users (id),
  readers          uuid[] not null default '{}'::uuid[]
                   check (cardinality(readers) <= 200 and array_position(readers, null::uuid) is null),
  writers          uuid[] not null default '{}'::uuid[]
                   check (cardinality(writers) <= 200 and array_position(writers, null::uuid) is null),
  version          bigint not null default 1 check (version >= 1 and version <= 9007199254740991),
  state            text not null default 'proposed' check (state in (
                     'proposed','authorized','in_progress','ready_for_review',
                     'approved_for_merge','merged','closed','blocked','suspended','abandoned')),
  next_action      text not null default '' check (char_length(next_action) <= 4000),
  scope            text not null default 'memory',
  contract_version text not null default '1.1',
  skill_version    text not null default '1.0',
  expires_at       timestamptz not null,
  max_units        bigint not null check (max_units >= 0 and max_units <= 100000),
  max_calls        bigint not null check (max_calls >= 0 and max_calls <= 100000),
  used_units       bigint not null default 0,
  calls            bigint not null default 0,
  stopped          boolean not null default false,
  created_at       timestamptz not null default clock_timestamp(),
  updated_at       timestamptz not null default clock_timestamp(),
  -- Les quotas ne peuvent pas être dépassés : la base le refuse.
  check (used_units >= 0 and used_units <= max_units),
  check (calls >= 0 and calls <= max_calls)
);

create table if not exists public.leo_operations (
  mission_id   uuid not null references public.leo_missions (id),
  -- IDEMPOTENCE : la clé primaire EST la garantie qu'une opération rejouée
  -- n'est pas exécutée deux fois.
  operation_id text not null check (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  base_version bigint not null check (base_version >= 1 and base_version <= 9007199254740991),
  payload      jsonb not null
               check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 16384),
  status       text not null default 'completed' check (status in ('pending','unknown','completed')),
  result       jsonb,
  created_at   timestamptz not null default clock_timestamp(),
  primary key (mission_id, operation_id),
  -- Un `completed` PORTE son résultat ; un `pending` n'en a pas. La base
  -- interdit l'état bâtard « terminé sans résultat ».
  check ( (status = 'completed' and result is not null
             and jsonb_typeof(result) = 'object' and octet_length(result::text) <= 16384)
       or (status in ('pending','unknown') and result is null) )
);

create index if not exists leo_missions_owner_idx   on public.leo_missions (owner);
create index if not exists leo_missions_readers_idx on public.leo_missions using gin (readers);
create index if not exists leo_missions_writers_idx on public.leo_missions using gin (writers);
create index if not exists leo_operations_recent_idx
  on public.leo_operations (mission_id, created_at desc, operation_id);

alter table public.leo_missions   enable row level security;
alter table public.leo_operations enable row level security;
