-- PROPOSITION NON APPLIQUEE, hors migrations. Snapshot metadata du 25/10/2026.
-- Ne pas executer en production : generation CLI, revue et recette isolee requises.
-- Extension du registre existant, aucun nouveau magasin, mandat ou effet externe.
-- Les quatre empreintes portent sur pg_get_functiondef EXACT, pas sur un SQL normalise.
-- Une derive de definition exige un nouveau snapshot et une nouvelle revue.
begin;
set local search_path=public,pg_catalog;
do $guard$
declare r record; observed jsonb;
begin
  for r in select * from (values
    ('public.leo_stop(uuid)','4a684553f686c27de00204c55ceddf02'),
    ('public.leo_status(uuid)','56b078e077a60e5dd3ef6d9342b9208f'),
    ('public.leo_write_memory(uuid,text,bigint,jsonb)','b645d0e99134e350c5366339cbaa6afb'),
    ('leo_private.write_memory_impl(uuid,text,bigint,jsonb)','8ac16fff5dd76320e2544f9807ed482a')
  ) as expected(signature, fingerprint) loop
    if pg_catalog.to_regprocedure(r.signature) is null or
       pg_catalog.md5(pg_catalog.pg_get_functiondef(pg_catalog.to_regprocedure(r.signature))) is distinct from r.fingerprint then
      raise exception using errcode='P0001', message='checkpoint_snapshot_drift';
    end if;
    if not exists(select 1 from pg_catalog.pg_proc p where p.oid=pg_catalog.to_regprocedure(r.signature)
      and pg_catalog.pg_get_userbyid(p.proowner)='postgres'
      and array(select a::text from pg_catalog.unnest(p.proacl) a order by a::text)
        =array['authenticated=X/postgres','postgres=X/postgres']::text[]) then
      raise exception using errcode='P0001', message='checkpoint_authority_drift';
    end if;
  end loop;
  if exists(select 1 from pg_catalog.pg_attribute where attrelid='public.leo_missions'::regclass
            and attname='checkpoint' and not attisdropped)
     or not exists(select 1 from pg_catalog.pg_class where oid='public.leo_missions'::regclass and relrowsecurity and not relforcerowsecurity)
     or not exists(select 1 from pg_catalog.pg_class where oid='public.leo_operations'::regclass and relrowsecurity and not relforcerowsecurity) then
    raise exception using errcode='P0001', message='checkpoint_schema_drift';
  end if;
  -- Comparaison des policies sous search_path fixe et des ACL reels, PUBLIC
  -- inclus. ACL relevees via aclexplode, pas information_schema.is_grantable :
  -- ce dernier inclut les droits implicites du proprietaire et ne decrit pas
  -- les bits de grant option stockes (false ici, meme pour postgres).
  -- MAINTAIN du seul owner postgres est ignore : sa representation
  -- depend de la version PG et n'est pas exposee par le snapshot information_schema.
  -- Tout MAINTAIN d'un autre acteur reste une derive refusee.
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'policyname',policyname,'schemaname',schemaname,'tablename',tablename,
    'permissive',permissive,'roles',roles,'cmd',cmd,'qual',qual,'with_check',with_check)
    order by tablename,policyname),'[]'::jsonb) into observed
    from pg_catalog.pg_policies where schemaname='public' and tablename in ('leo_missions','leo_operations');
  if observed<>$metadata$[{"cmd":"SELECT","qual":"((( SELECT auth.uid() AS uid) IS NOT NULL) AND ((owner = ( SELECT auth.uid() AS uid)) OR (readers @> ARRAY[( SELECT auth.uid() AS uid)]) OR (writers @> ARRAY[( SELECT auth.uid() AS uid)])))","roles":["authenticated"],"tablename":"leo_missions","permissive":"PERMISSIVE","policyname":"leo_missions_read","schemaname":"public","with_check":null},{"cmd":"SELECT","qual":"(EXISTS ( SELECT 1\n   FROM leo_missions m\n  WHERE ((m.id = leo_operations.mission_id) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((m.owner = ( SELECT auth.uid() AS uid)) OR (m.readers @> ARRAY[( SELECT auth.uid() AS uid)]) OR (m.writers @> ARRAY[( SELECT auth.uid() AS uid)])))))","roles":["public"],"tablename":"leo_operations","permissive":"PERMISSIVE","policyname":"leo_operations_read","schemaname":"public","with_check":null}]$metadata$::jsonb then
    raise exception using errcode='P0001', message='checkpoint_policy_drift';
  end if;
  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'table_name',c.relname,'grantee',case when a.grantee=0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end,
    'grantor',pg_catalog.pg_get_userbyid(a.grantor),'privilege_type',a.privilege_type,'is_grantable',a.is_grantable)
    order by c.relname,case when a.grantee=0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(a.grantee) end,a.privilege_type),'[]'::jsonb)
    into observed from pg_catalog.pg_class c
    cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))) a
    where c.oid in ('public.leo_missions'::regclass,'public.leo_operations'::regclass)
      and not (a.privilege_type='MAINTAIN' and a.grantee=c.relowner
        and pg_catalog.pg_get_userbyid(c.relowner)='postgres');
  if observed<>$metadata$[{"table_name":"leo_missions","grantee":"authenticated","grantor":"postgres","privilege_type":"SELECT","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"DELETE","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"INSERT","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"REFERENCES","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"SELECT","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"TRIGGER","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"TRUNCATE","is_grantable":false},{"table_name":"leo_missions","grantee":"postgres","grantor":"postgres","privilege_type":"UPDATE","is_grantable":false},{"table_name":"leo_operations","grantee":"authenticated","grantor":"postgres","privilege_type":"SELECT","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"DELETE","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"INSERT","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"REFERENCES","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"SELECT","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"TRIGGER","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"TRUNCATE","is_grantable":false},{"table_name":"leo_operations","grantee":"postgres","grantor":"postgres","privilege_type":"UPDATE","is_grantable":false}]$metadata$::jsonb then
    raise exception using errcode='P0001', message='checkpoint_grants_drift';
  end if;
end;
$guard$;

-- Labels canoniques : meme trim ECMAScript et borne UTF-16 que validerPlan.
-- Rejet des controles U+0001..001F (U+0000 est deja interdit par JSONB) et <>.
create function leo_private.checkpoint_label_valid(p text) returns boolean
language plpgsql immutable security invoker set search_path=''
as $label$
declare trimmed text; units integer:=0; i integer; c integer;
begin
  if p is null then return false; end if;
  trimmed:=pg_catalog.btrim(p,U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF');
  if p<>trimmed or p='' or pg_catalog.char_length(p)>160 then return false; end if;
  for i in 1..pg_catalog.char_length(p) loop
    c:=pg_catalog.ascii(pg_catalog.substr(p,i,1));
    if c<32 or c in (60,62) then return false; end if;
    units:=units+case when c>65535 then 2 else 1 end;
  end loop;
  return units<=160;
end;
$label$;

create function leo_private.checkpoint_valid(p jsonb) returns boolean
language plpgsql immutable security invoker set search_path=''
as $valid$
declare e jsonb; n numeric; previous numeric:=-1;
begin
  if p is null or pg_catalog.jsonb_typeof(p)<>'object' then return false; end if;
  if pg_catalog.octet_length(p::text)>10000
     or (select count(*) from pg_catalog.jsonb_object_keys(p))<>7
     or exists(select 1 from pg_catalog.jsonb_object_keys(p) k where k not in
       ('task_id','titre','etapes','confirmes','rappels','etat','revision')) then return false; end if;
  if pg_catalog.jsonb_typeof(p->'task_id')<>'string' or (p->>'task_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
     or pg_catalog.jsonb_typeof(p->'titre')<>'string'
     or not leo_private.checkpoint_label_valid(p->>'titre')
     or pg_catalog.jsonb_typeof(p->'etapes')<>'array'
     or pg_catalog.jsonb_typeof(p->'confirmes')<>'array'
     or pg_catalog.jsonb_typeof(p->'rappels')<>'number'
     or pg_catalog.jsonb_typeof(p->'revision')<>'number'
     or pg_catalog.jsonb_typeof(p->'etat')<>'string'
     or (p->>'etat') not in ('en_cours','suspendue') then return false; end if;
  if pg_catalog.jsonb_array_length(p->'etapes') not between 1 and 10 then return false; end if;
  for e in select value from pg_catalog.jsonb_array_elements(p->'etapes') loop
    if pg_catalog.jsonb_typeof(e)<>'string' or not leo_private.checkpoint_label_valid(e#>>'{}') then return false; end if;
  end loop;
  if (select count(distinct pg_catalog.lower(value)) from pg_catalog.jsonb_array_elements_text(p->'etapes'))
     <>pg_catalog.jsonb_array_length(p->'etapes') then return false; end if;
  n:=(p->>'rappels')::numeric;
  if n<>pg_catalog.trunc(n) or n not between 0 and 2 then return false; end if;
  n:=(p->>'revision')::numeric;
  if n<>pg_catalog.trunc(n) or n not between 1 and 9007199254740991 then return false; end if;
  for e in select value from pg_catalog.jsonb_array_elements(p->'confirmes') loop
    if pg_catalog.jsonb_typeof(e)<>'number' then return false; end if;
    n:=(e#>>'{}')::numeric;
    if n<>pg_catalog.trunc(n) or n<0 or n>=pg_catalog.jsonb_array_length(p->'etapes') or n<=previous then return false; end if;
    previous:=n;
  end loop;
  return true;
end;
$valid$;

create function leo_private.checkpoint_transition_valid(old_cp jsonb,new_cp jsonb,command jsonb) returns boolean
language plpgsql immutable security invoker set search_path=''
as $transition$
declare kind text:=command->>'kind'; expected jsonb;
begin
  if not leo_private.checkpoint_valid(new_cp) then return false; end if;
  if kind='adopt' then
    return old_cp is null and command->'expected_task_id'='null'::jsonb
      and (new_cp->>'revision')::numeric=1 and new_cp->'confirmes'='[]'::jsonb
      and (new_cp->>'rappels')::numeric=0 and new_cp->>'etat'='en_cours';
  end if;
  if old_cp is null or new_cp->>'task_id'<>old_cp->>'task_id'
     or command->>'expected_task_id'<>old_cp->>'task_id' then return false; end if;
  if kind='update' then
    if new_cp->'revision'<>old_cp->'revision' or new_cp->'titre'<>old_cp->'titre'
       or new_cp->'etapes'<>old_cp->'etapes' or not (new_cp->'confirmes' @> old_cp->'confirmes')
       or (new_cp->>'rappels')::integer not between (old_cp->>'rappels')::integer and (old_cp->>'rappels')::integer+1 then return false; end if;
    if new_cp->'rappels'<>old_cp->'rappels' and (old_cp->>'etat'='suspendue' or new_cp->>'etat'='suspendue'
       or pg_catalog.jsonb_array_length(old_cp->'confirmes')=pg_catalog.jsonb_array_length(old_cp->'etapes')
       or pg_catalog.jsonb_array_length(new_cp->'confirmes')=pg_catalog.jsonb_array_length(new_cp->'etapes')) then return false; end if;
    return true;
  end if;
  if kind='revise_plan' then
    if (new_cp->>'revision')::numeric<>(old_cp->>'revision')::numeric+1
       or new_cp->'rappels'<>old_cp->'rappels' or new_cp->'etat'<>old_cp->'etat'
       or (new_cp->'titre'=old_cp->'titre' and new_cp->'etapes'=old_cp->'etapes') then return false; end if;
    select coalesce(pg_catalog.jsonb_agg(n.ord-1 order by n.ord),'[]'::jsonb) into expected
      from pg_catalog.jsonb_array_elements_text(new_cp->'etapes') with ordinality n(label,ord)
      where exists(select 1 from pg_catalog.jsonb_array_elements_text(old_cp->'etapes') with ordinality o(label,ord)
        where pg_catalog.lower(o.label)=pg_catalog.lower(n.label) and old_cp->'confirmes' @> pg_catalog.jsonb_build_array(o.ord-1));
    return new_cp->'confirmes'=expected;
  end if;
  return false;
end;
$transition$;

revoke all on function leo_private.checkpoint_label_valid(text),leo_private.checkpoint_valid(jsonb),
  leo_private.checkpoint_transition_valid(jsonb,jsonb,jsonb) from public,anon,authenticated,service_role;
alter table public.leo_missions add column checkpoint jsonb
  check (checkpoint is null or leo_private.checkpoint_valid(checkpoint));

-- Les RPC publiques restent invoker ; l'implementation privee garde ses ACL.
-- Aucun GRANT nouveau sur les RPC, tables, schemas ou acteurs.
CREATE OR REPLACE FUNCTION public.leo_status(p_mission uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
      'expires_at', m.expires_at, 'stopped', m.stopped, 'checkpoint', m.checkpoint),
    'capabilities', pg_catalog.jsonb_build_object('checkpoint', 1, 'checkpoint_write', m.owner = v_uid),
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
$function$;

CREATE OR REPLACE FUNCTION leo_private.write_memory_impl(p_mission uuid, p_operation text, p_expected_version bigint, p_patch jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
             where field.name not in ('state', 'next_action', 'checkpoint', 'checkpoint_command')) then
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

  if (p_patch ? 'checkpoint') <> (p_patch ? 'checkpoint_command') then
    raise exception using errcode='22023', message='checkpoint_command_required';
  end if;
  if p_patch ? 'checkpoint' then
    if not leo_private.checkpoint_valid(p_patch->'checkpoint') then
      raise exception using errcode='22023', message='invalid_checkpoint';
    end if;
    if pg_catalog.jsonb_typeof(p_patch->'checkpoint_command') <> 'object' then
      raise exception using errcode='22023', message='invalid_checkpoint_command';
    end if;
    if (select count(*) from pg_catalog.jsonb_object_keys(p_patch->'checkpoint_command')) <> 2
       or not (p_patch->'checkpoint_command' ?& array['kind','expected_task_id'])
       or pg_catalog.jsonb_typeof(p_patch->'checkpoint_command'->'kind') <> 'string'
       or p_patch->'checkpoint_command'->>'kind' not in ('adopt','update','revise_plan') then
      raise exception using errcode='22023', message='invalid_checkpoint_command';
    end if;
    if p_patch->'checkpoint_command'->>'kind'='adopt' then
      if p_patch->'checkpoint_command'->'expected_task_id'<>'null'::jsonb then
        raise exception using errcode='22023', message='invalid_checkpoint_command';
      end if;
    elsif pg_catalog.jsonb_typeof(p_patch->'checkpoint_command'->'expected_task_id')<>'string'
       or (p_patch->'checkpoint_command'->>'expected_task_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception using errcode='22023', message='invalid_checkpoint_command';
    end if;
  end if;

  -- Une seule ligne est verrouillee, seulement si l'identite a le droit d'ecrire.
  select * into v_m from public.leo_missions m where m.id = p_mission
    and (m.owner = v_uid or v_uid = any(m.writers)) for update;
  if not found then
    raise exception using errcode = '42501', message = 'writer_required';
  end if;
  if p_patch ? 'checkpoint' and v_m.owner <> v_uid then
    raise exception using errcode='42501', message='checkpoint_owner_required';
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

  -- Valider la transition APRES le rejeu exact et le CAS : un recu termine
  -- reste restituable apres evolution du checkpoint, arret ou expiration.
  if p_patch ? 'checkpoint' and not leo_private.checkpoint_transition_valid(
    v_m.checkpoint,p_patch->'checkpoint',p_patch->'checkpoint_command') then
    raise exception using errcode='PT409', message='checkpoint_transition_conflict';
  end if;

  update public.leo_missions set
    state = coalesce(p_patch->>'state', state),
    next_action = coalesce(p_patch->>'next_action', next_action),
    checkpoint = case when p_patch ? 'checkpoint' then p_patch->'checkpoint' else checkpoint end,
    version = version + 1, used_units = used_units + 1, calls = calls + 1,
    updated_at = pg_catalog.clock_timestamp()
    where id = p_mission returning * into v_m;
  v_result := pg_catalog.jsonb_build_object('mission_version', v_m.version,
                                         'state', v_m.state, 'next_action', v_m.next_action);
  if p_patch ? 'checkpoint' then
    v_result:=v_result || pg_catalog.jsonb_build_object('checkpoint',v_m.checkpoint,
      'checkpoint_command',p_patch->'checkpoint_command');
  end if;
  insert into public.leo_operations(mission_id, operation_id, base_version, payload, status, result)
    values (p_mission, p_operation, p_expected_version, v_payload, 'completed', v_result);
  return pg_catalog.jsonb_build_object('operation_id', p_operation, 'status', 'completed',
                                      'result', v_result, 'replayed', false);
end;
$function$;

commit;
