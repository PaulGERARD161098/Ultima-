-- Ultima — 0003 : advisor 0003 (auth_rls_initplan) [S5].
-- `(select auth.uid())` est évalué une fois par requête (initplan) au lieu
-- d'une fois par ligne. Périmètre d'accès strictement identique à 0001.

alter policy network_nodes_select on public.network_nodes
  using (owner_id = (select auth.uid()));

alter policy network_nodes_insert on public.network_nodes
  with check (owner_id = (select auth.uid()));

alter policy network_nodes_update on public.network_nodes
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy network_nodes_delete on public.network_nodes
  using (owner_id = (select auth.uid()));

alter policy network_edges_select on public.network_edges
  using (owner_id = (select auth.uid()));

alter policy network_edges_insert on public.network_edges
  with check (owner_id = (select auth.uid()));

alter policy network_edges_update on public.network_edges
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

alter policy network_edges_delete on public.network_edges
  using (owner_id = (select auth.uid()));
