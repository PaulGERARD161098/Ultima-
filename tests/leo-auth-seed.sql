-- Comptes créés par le vrai serveur Auth, pas de faux auth.users.
-- Appliqué seulement au PostgreSQL jetable du job registre-auth.
-- GoTrue doit d'abord créer ses propres fonctions comme supabase_auth_admin.
-- Son init legacy est ensuite aligné sur les claims JSON vérifiés de PostgREST.
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
$$;
do $$ begin
  if (select count(*) from auth.users where email in
      ('owner@fixture.invalid','reader@fixture.invalid','stranger@fixture.invalid')) <> 3 then
    raise exception 'fixture_auth_users_missing';
  end if;
end $$;
insert into public.leo_missions(id, owner, readers, expires_at, max_units, max_calls)
select '00000000-0000-4000-8000-000000000101', o.id, array[r.id],
  clock_timestamp() + interval '1 hour', 5, 5
from auth.users o cross join auth.users r
where o.email='owner@fixture.invalid' and r.email='reader@fixture.invalid';
insert into public.leo_missions(id, owner, scope, expires_at, max_units, max_calls)
select '00000000-0000-4000-8000-000000000102', id, 'not-authorized-memory',
  clock_timestamp() + interval '1 hour', 5, 5
from auth.users where email='owner@fixture.invalid';
