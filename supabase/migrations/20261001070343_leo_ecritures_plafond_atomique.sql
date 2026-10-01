-- Réserve le plafond dans la transaction INSERT, même entre deux onglets.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create function leo_private.ecritures_plafond()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.phase <> 'tentee' then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('leo_ecritures:' || new.owner_id::text, 0));
  -- Fonction volatile : cette lecture voit les transactions terminées pendant
  -- l'attente du verrou. RLS et privilèges de l'appelant restent applicables.
  if (select count(*) from public.leo_ecritures
      where owner_id = new.owner_id and phase = 'tentee'
      and le >= pg_catalog.clock_timestamp() - interval '1 hour') >= 40 then
    raise exception using errcode = 'PT429', message = 'leo_write_quota_exhausted';
  end if;
  new.le := pg_catalog.clock_timestamp();
  return new;
end;
$$;
revoke all on function leo_private.ecritures_plafond() from public, anon, authenticated;
create trigger leo_ecritures_plafond_before_insert
before insert on public.leo_ecritures for each row
execute function leo_private.ecritures_plafond();
commit;
