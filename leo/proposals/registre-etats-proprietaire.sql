-- PROPOSITION NON APPLIQUEE (audit du 05/10, constat C11/W7). Porte rouge :
-- SQL metier sur base reelle = accord exact de Paul + revue de migration.
-- Reprend a l'identique leo_private.write_memory_impl de
-- registre-conflicts-pt409.sql et n'ajoute qu'une garde : les etats
-- approved_for_merge et merged, qui se liraient comme un accord, ne sont
-- poses que par le proprietaire de la mission. Ne change ni donnees, ni
-- ACL/RLS, ni signature, ni privileges ; un rejeu exact reste idempotent.
-- Limite a dire : dans le site, Leo agit avec le jeton de Paul (meme
-- auth.uid) ; cette garde separe le proprietaire des autres writers, elle ne
-- separe pas Leo de Paul tant que les identites ne sont pas distinctes (E1).
-- Miroir runtime deja eprouve : leo/runtime/broker.py (owner_state_required).
begin;
-- Refuser une installation absente ; CREATE OR REPLACE conserve les grants.
do $$ begin
  if pg_catalog.to_regprocedure('leo_private.write_memory_impl(uuid,text,bigint,jsonb)') is null then
    raise exception 'registre_not_installed';
  end if;
end $$;

create or replace function leo_private.write_memory_impl(
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
  if p_patch->>'state' in ('approved_for_merge', 'merged') and v_m.owner <> v_uid then
    raise exception using errcode = '42501', message = 'owner_state_required';
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

commit;
