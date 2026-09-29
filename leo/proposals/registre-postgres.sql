-- BROUILLON DE REVUE, hors supabase/migrations : NON APPLIQUE.
-- Backend memoire uniquement, sur Supabase existant. Pas de merge, delegation,
-- fournisseur IA, tarif ou nouveau service. Initialisation des missions/ACL/
-- versions/plafonds reservee a l'administrateur SQL : aucun RPC de creation.
-- Ne jamais exposer leo_private dans les schemas Data API. Une activation exige
-- revue, migration generee par CLI, verification des grants/RLS et advisors.
-- Ne pas executer ce brouillon sur une base reelle pendant les tests.
--
-- RPC authenticated, identite uniquement auth.uid() du JWT verifie :
-- public.leo_status(p_mission uuid) ->
-- {mission:{id,version,state,next_action,scope,contract_version,skill_version,
--           expires_at,stopped}, budget:{max_units,max_calls,used_units,calls},
--  operations:[{operation_id,status,result}], operations_truncated:boolean}
-- operations = les 100 plus recentes ; pas de payload/ACL dans cette projection.
-- public.leo_write_memory(p_mission uuid,p_operation text,
--                         p_expected_version bigint,p_patch jsonb) ->
-- {operation_id,status:'completed',result:{mission_version,state,next_action},
--  replayed:boolean}. Meme requete JSONB = recu original, sans nouvel effet,
-- meme apres arret/expiration. Changer patch OU version = conflit d'operation.
-- Un pending/unknown importe par admin ne se rejoue jamais : operation_unresolved.
-- public.leo_stop(p_mission uuid) -> meme forme que status. Owner uniquement,
-- version +1 une seule fois, sans depense. Pas de reprise/deblocage par RPC.
--
-- Erreurs (messages sans donnees personnelles, SQLSTATE stable) :
-- 42501 authentication_required | mission_unavailable | writer_required | owner_required
-- 22023 invalid_request | invalid_operation_id | invalid_expected_version |
--       invalid_patch | invalid_state | invalid_next_action
-- PT409 version_conflict | operation_conflict (conflits métier, sans rejeu REST)
-- P0001 version_scope_denied | operation_unresolved | mission_stopped |
--       mission_expired | budget_exhausted | version_exhausted
-- Aucune tentative refusee ne modifie compteurs/resultat/version. Une nouvelle
-- ecriture reussie coute exactement 1 unite abstraite et 1 appel. Le verrou de
-- mission serialise CAS, budget et operation ; resultat et effet commit ensemble.
-- Les etats sont descriptifs, jamais une permission d'action externe.
--
-- Docs lues 2026-09-29 : supabase.com/changelog (repli HTML car .md non rendu),
-- /docs/guides/database/functions, /database/postgres/row-level-security,
-- /api/securing-your-api. Breaking change PostgreSQL 15.19/17.11 examine : ce
-- brouillon n'emploie ni ltree, pgcrypto, btree_gist ni operateur personnalise.
-- Retention : suivi technique conserve jusqu'a disposition explicitement
-- autorisee ; aucune purge. Ne pas mettre de secrets ou faits metier personnels.

begin;

-- Echec volontaire en cas de collision : ne pas modifier silencieusement un
-- schema existant dont le contenu/proprietaire n'a pas ete examine.
create schema leo_private;
revoke all on schema leo_private from public, anon, authenticated, service_role;
grant usage on schema leo_private to authenticated;

create table public.leo_missions (
  id uuid primary key,
  owner uuid not null references auth.users(id),
  readers uuid[] not null default '{}'::uuid[],
  writers uuid[] not null default '{}'::uuid[],
  version bigint not null default 1 check (version between 1 and 9007199254740991),
  state text not null default 'proposed' check (state in (
    'proposed','authorized','in_progress','ready_for_review','approved_for_merge',
    'merged','closed','blocked','suspended','abandoned')),
  next_action text not null default '' check (pg_catalog.char_length(next_action) <= 4000),
  scope text not null default 'memory',
  contract_version text not null default '1.1',
  skill_version text not null default '1.0',
  expires_at timestamptz not null,
  max_units bigint not null check (max_units between 0 and 100000),
  max_calls bigint not null check (max_calls between 0 and 100000),
  used_units bigint not null default 0 check (used_units >= 0 and used_units <= max_units),
  calls bigint not null default 0 check (calls >= 0 and calls <= max_calls),
  stopped boolean not null default false,
  created_at timestamptz not null default pg_catalog.clock_timestamp(),
  updated_at timestamptz not null default pg_catalog.clock_timestamp(),
  check (pg_catalog.cardinality(readers) <= 200 and pg_catalog.array_position(readers, null) is null),
  check (pg_catalog.cardinality(writers) <= 200 and pg_catalog.array_position(writers, null) is null)
);

create index leo_missions_owner_idx on public.leo_missions(owner);
create index leo_missions_readers_idx on public.leo_missions using gin(readers);
create index leo_missions_writers_idx on public.leo_missions using gin(writers);

create table public.leo_operations (
  mission_id uuid not null references public.leo_missions(id),
  operation_id text not null check (operation_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'),
  base_version bigint not null check (base_version between 1 and 9007199254740991),
  payload jsonb not null check (pg_catalog.jsonb_typeof(payload) = 'object'
                              and pg_catalog.octet_length(payload::text) <= 16384),
  status text not null default 'completed' check (status in ('pending','unknown','completed')),
  result jsonb,
  created_at timestamptz not null default pg_catalog.clock_timestamp(),
  primary key (mission_id, operation_id),
  check ((status = 'completed' and result is not null
          and pg_catalog.jsonb_typeof(result) = 'object'
          and pg_catalog.octet_length(result::text) <= 16384)
         or (status in ('pending','unknown') and result is null))
);
create index leo_operations_recent_idx on public.leo_operations(mission_id, created_at desc, operation_id);

alter table public.leo_missions enable row level security;
alter table public.leo_operations enable row level security;

create policy leo_missions_read on public.leo_missions for select to authenticated
  using ((select auth.uid()) is not null and (
    owner = (select auth.uid())
    or readers @> array[(select auth.uid())]
    or writers @> array[(select auth.uid())]));
create policy leo_operations_read on public.leo_operations for select to authenticated
  using (exists (select 1 from public.leo_missions m where m.id = mission_id));

-- DML ferme aussi par grants, pas seulement par l'absence de policy d'ecriture.
-- service_role n'initialise pas ce registre via l'API : l'administration est SQL.
revoke all on table public.leo_missions, public.leo_operations from public, anon, authenticated, service_role;
grant select on table public.leo_missions, public.leo_operations to authenticated;

-- Lecture invoker + RLS ; controle explicite egalement, car stop_impl l'appelle
-- apres sa propre authentification sous les droits de son proprietaire.
create function public.leo_status(p_mission uuid) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_status jsonb;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  -- Une requete unique : mission, budget et operations partagent le snapshot.
  -- VOLATILE conserve la visibilite d'un stop_impl effectue juste auparavant.
  select pg_catalog.jsonb_build_object(
    'mission', pg_catalog.jsonb_build_object('id', m.id, 'version', m.version,
      'state', m.state, 'next_action', m.next_action, 'scope', m.scope,
      'contract_version', m.contract_version, 'skill_version', m.skill_version,
      'expires_at', m.expires_at, 'stopped', m.stopped),
    'budget', pg_catalog.jsonb_build_object('max_units', m.max_units, 'max_calls', m.max_calls,
      'used_units', m.used_units, 'calls', m.calls),
    'operations', (select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'operation_id', o.operation_id, 'status', o.status, 'result', o.result)
      order by o.created_at desc, o.operation_id), '[]'::jsonb)
      from (select operation_id, status, result, created_at from public.leo_operations
            where mission_id = m.id order by created_at desc, operation_id limit 100) o),
    'operations_truncated', exists(select 1 from public.leo_operations where mission_id = m.id
                                  offset 100 limit 1))
    into v_status from public.leo_missions m where m.id = p_mission
      and (m.owner = v_uid or v_uid = any(m.readers) or v_uid = any(m.writers));
  if not found then
    raise exception using errcode = '42501', message = 'mission_unavailable';
  end if;
  return v_status;
end;
$$;

create function leo_private.write_memory_impl(
  p_mission uuid, p_operation text, p_expected_version bigint, p_patch jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_m public.leo_missions%rowtype;
  v_previous public.leo_operations%rowtype;
  v_payload jsonb;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if p_mission is null then
    raise exception using errcode = '22023', message = 'invalid_request';
  end if;
  if p_operation is null or p_operation !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$' then
    raise exception using errcode = '22023', message = 'invalid_operation_id';
  end if;
  if p_expected_version is null or p_expected_version < 1 or p_expected_version > 9007199254740991 then
    raise exception using errcode = '22023', message = 'invalid_expected_version';
  end if;
  if p_patch is null or pg_catalog.jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb
     or pg_catalog.octet_length(p_patch::text) > 16300 then
    raise exception using errcode = '22023', message = 'invalid_patch';
  end if;
  if exists (select 1 from pg_catalog.jsonb_object_keys(p_patch) as field(name)
             where field.name not in ('state', 'next_action')) then
    raise exception using errcode = '22023', message = 'invalid_patch';
  end if;
  if p_patch ? 'state' then
    if pg_catalog.jsonb_typeof(p_patch->'state') <> 'string' or p_patch->>'state' not in (
      'proposed','authorized','in_progress','ready_for_review','approved_for_merge',
      'merged','closed','blocked','suspended','abandoned') then
      raise exception using errcode = '22023', message = 'invalid_state';
    end if;
  end if;
  if p_patch ? 'next_action' then
    if pg_catalog.jsonb_typeof(p_patch->'next_action') <> 'string'
       or pg_catalog.char_length(p_patch->>'next_action') > 4000 then
      raise exception using errcode = '22023', message = 'invalid_next_action';
    end if;
  end if;

  -- Une seule ligne est verrouillee, seulement si l'identite a le droit d'ecrire.
  select * into v_m from public.leo_missions m where m.id = p_mission
    and (m.owner = v_uid or v_uid = any(m.writers)) for update;
  if not found then
    raise exception using errcode = '42501', message = 'writer_required';
  end if;
  if v_m.scope <> 'memory' or v_m.contract_version <> '1.1' or v_m.skill_version <> '1.0' then
    raise exception using errcode = 'P0001', message = 'version_scope_denied';
  end if;
  v_payload := pg_catalog.jsonb_build_object('expected_version', p_expected_version, 'patch', p_patch);
  if pg_catalog.octet_length(v_payload::text) > 16384 then
    raise exception using errcode = '22023', message = 'invalid_patch';
  end if;
  select * into v_previous from public.leo_operations
    where mission_id = p_mission and operation_id = p_operation;
  if found then
    if v_previous.payload <> v_payload then
      raise exception using errcode = 'PT409', message = 'operation_conflict';
    end if;
    if v_previous.status <> 'completed' then
      raise exception using errcode = 'P0001', message = 'operation_unresolved';
    end if;
    return pg_catalog.jsonb_build_object('operation_id', p_operation, 'status', 'completed',
                                        'result', v_previous.result, 'replayed', true);
  end if;
  if v_m.stopped then
    raise exception using errcode = 'P0001', message = 'mission_stopped';
  end if;
  if pg_catalog.clock_timestamp() >= v_m.expires_at then
    raise exception using errcode = 'P0001', message = 'mission_expired';
  end if;
  if v_m.version <> p_expected_version then
    raise exception using errcode = 'PT409', message = 'version_conflict';
  end if;
  if v_m.version >= 9007199254740991 then
    raise exception using errcode = 'P0001', message = 'version_exhausted';
  end if;
  if v_m.used_units >= v_m.max_units or v_m.calls >= v_m.max_calls then
    raise exception using errcode = 'P0001', message = 'budget_exhausted';
  end if;

  update public.leo_missions set
    state = coalesce(p_patch->>'state', state),
    next_action = coalesce(p_patch->>'next_action', next_action),
    version = version + 1, used_units = used_units + 1, calls = calls + 1,
    updated_at = pg_catalog.clock_timestamp()
    where id = p_mission returning * into v_m;
  v_result := pg_catalog.jsonb_build_object('mission_version', v_m.version,
                                         'state', v_m.state, 'next_action', v_m.next_action);
  insert into public.leo_operations(mission_id, operation_id, base_version, payload, status, result)
    values (p_mission, p_operation, p_expected_version, v_payload, 'completed', v_result);
  return pg_catalog.jsonb_build_object('operation_id', p_operation, 'status', 'completed',
                                      'result', v_result, 'replayed', false);
end;
$$;

create function leo_private.stop_impl(p_mission uuid) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_m public.leo_missions%rowtype;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  select * into v_m from public.leo_missions m where m.id = p_mission and m.owner = v_uid for update;
  if not found then
    raise exception using errcode = '42501', message = 'owner_required';
  end if;
  if not v_m.stopped then
    if v_m.version >= 9007199254740991 then
      raise exception using errcode = 'P0001', message = 'version_exhausted';
    end if;
    update public.leo_missions set stopped = true, version = version + 1,
      updated_at = pg_catalog.clock_timestamp() where id = p_mission;
  end if;
  return public.leo_status(p_mission);
end;
$$;

create function public.leo_write_memory(p_mission uuid, p_operation text,
                                      p_expected_version bigint, p_patch jsonb) returns jsonb
language sql security invoker set search_path = ''
as $$ select leo_private.write_memory_impl(p_mission, p_operation, p_expected_version, p_patch); $$;

create function public.leo_stop(p_mission uuid) returns jsonb
language sql security invoker set search_path = ''
as $$ select leo_private.stop_impl(p_mission); $$;

revoke all on function public.leo_status(uuid), public.leo_write_memory(uuid,text,bigint,jsonb),
  public.leo_stop(uuid), leo_private.write_memory_impl(uuid,text,bigint,jsonb), leo_private.stop_impl(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.leo_status(uuid), public.leo_write_memory(uuid,text,bigint,jsonb),
  public.leo_stop(uuid), leo_private.write_memory_impl(uuid,text,bigint,jsonb), leo_private.stop_impl(uuid)
  to authenticated;

commit;
