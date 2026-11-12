-- Un mot privé par personne et par jour. Le relevé des quêtes reste indépendant.
create table public.althea_mots_du_jour (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jour date not null,
  mot text not null check (char_length(mot) between 1 and 280 and mot ~ '[^[:space:]]'),
  primary key (owner_id, jour)
);

alter table public.althea_mots_du_jour enable row level security;
revoke all on table public.althea_mots_du_jour from public, anon, authenticated;
grant select, insert, update on table public.althea_mots_du_jour to authenticated;

create policy althea_mots_du_jour_select on public.althea_mots_du_jour
  for select to authenticated using (owner_id = (select auth.uid()));
create policy althea_mots_du_jour_insert on public.althea_mots_du_jour
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy althea_mots_du_jour_update on public.althea_mots_du_jour
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Le jour d'ALTHEA suit Paris même si la connexion PostgreSQL est en UTC.
create or replace function public.althea_refuse_jour_futur()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.jour > pg_catalog.timezone('Europe/Paris', pg_catalog.statement_timestamp())::date then
    raise exception 'ALTHEA : un relevé ne peut pas porter un jour futur (%)', new.jour
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
