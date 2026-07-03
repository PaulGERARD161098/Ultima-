-- Ultima — migration 0002 : correctifs advisors consignés dans AUDIT-2026-07-03.md.
-- Appliquée sur go explicite de Paul (2026-07-03).
--
-- S2 — set_updated_at : search_path épinglé (lint function_search_path_mutable).
-- P1 — policies RLS : auth.uid() encapsulé en sous-requête pour n'être évalué
--      qu'une fois par requête au lieu d'une fois par ligne (lint auth_rls_initplan).

-- S2 : la fonction ne résout plus rien via un search_path ambiant.
alter function public.set_updated_at() set search_path = '';

-- P1 : recréation des 8 policies avec (select auth.uid()).
-- network_nodes
drop policy network_nodes_select on public.network_nodes;
create policy network_nodes_select on public.network_nodes
  for select using (owner_id = (select auth.uid()));

drop policy network_nodes_insert on public.network_nodes;
create policy network_nodes_insert on public.network_nodes
  for insert with check (owner_id = (select auth.uid()));

drop policy network_nodes_update on public.network_nodes;
create policy network_nodes_update on public.network_nodes
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy network_nodes_delete on public.network_nodes;
create policy network_nodes_delete on public.network_nodes
  for delete using (owner_id = (select auth.uid()));

-- network_edges
drop policy network_edges_select on public.network_edges;
create policy network_edges_select on public.network_edges
  for select using (owner_id = (select auth.uid()));

drop policy network_edges_insert on public.network_edges;
create policy network_edges_insert on public.network_edges
  for insert with check (owner_id = (select auth.uid()));

drop policy network_edges_update on public.network_edges;
create policy network_edges_update on public.network_edges
  for update using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy network_edges_delete on public.network_edges;
create policy network_edges_delete on public.network_edges
  for delete using (owner_id = (select auth.uid()));
