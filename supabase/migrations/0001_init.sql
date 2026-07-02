-- Ultima — migration 0001 : schéma initial du réseau commercial + RLS.
-- Ne JAMAIS appliquer sans validation Paul explicite (coût / données).
-- RLS activée dès cette première migration : chaque ligne est privée à son owner.

-- Extension pour gen_random_uuid() (fournie par défaut sur Supabase/Postgres 13+).
create extension if not exists pgcrypto;

-- Trigger générique : maintient updated_at à jour sur UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- network_nodes : nœuds du réseau (artisans, partenaires, leads, chantiers).
-- ---------------------------------------------------------------------------
create table public.network_nodes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  type       text not null check (type in ('artisan', 'partenaire', 'lead', 'chantier')),
  nom        text not null check (char_length(nom) between 1 and 200),
  ville      text,
  adresse    text,
  telephone  text check (telephone is null or char_length(telephone) <= 30),
  email      text check (email is null or char_length(email) <= 200),
  statut     text not null default 'prospect'
             check (statut in ('actif', 'prospect', 'en_cours', 'termine', 'inactif')),
  lat        double precision check (lat is null or (lat between -90 and 90)),
  lng        double precision check (lng is null or (lng between -180 and 180)),
  notes      text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index network_nodes_owner_id_idx on public.network_nodes (owner_id);

create trigger network_nodes_set_updated_at
  before update on public.network_nodes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- network_edges : relations orientées entre deux nœuds.
-- ---------------------------------------------------------------------------
create table public.network_edges (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  source_id  uuid not null references public.network_nodes (id) on delete cascade,
  target_id  uuid not null references public.network_nodes (id) on delete cascade,
  type       text not null check (type in ('apport_affaires', 'sous_traitance', 'chantier_commun')),
  notes      text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  -- Une relation ne peut pas relier un nœud à lui-même.
  constraint network_edges_no_self_loop check (source_id <> target_id)
);

create index network_edges_owner_id_idx on public.network_edges (owner_id);
create index network_edges_source_id_idx on public.network_edges (source_id);
create index network_edges_target_id_idx on public.network_edges (target_id);

-- ---------------------------------------------------------------------------
-- RLS : accès strictement limité à owner_id = auth.uid() sur les deux tables.
-- ---------------------------------------------------------------------------
alter table public.network_nodes enable row level security;
alter table public.network_edges enable row level security;

-- network_nodes : une policy par opération.
create policy network_nodes_select on public.network_nodes
  for select using (owner_id = auth.uid());

create policy network_nodes_insert on public.network_nodes
  for insert with check (owner_id = auth.uid());

create policy network_nodes_update on public.network_nodes
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy network_nodes_delete on public.network_nodes
  for delete using (owner_id = auth.uid());

-- network_edges : une policy par opération.
create policy network_edges_select on public.network_edges
  for select using (owner_id = auth.uid());

create policy network_edges_insert on public.network_edges
  for insert with check (owner_id = auth.uid());

create policy network_edges_update on public.network_edges
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy network_edges_delete on public.network_edges
  for delete using (owner_id = auth.uid());
