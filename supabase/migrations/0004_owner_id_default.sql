-- Ultima — 0004 : owner_id rempli par défaut via auth.uid() [U1].
-- L'API n'envoie jamais owner_id (choix conservé) ; sans défaut, tout INSERT
-- échouait en NOT NULL avant même la RLS. Le WITH CHECK des policies insert
-- reste la garantie d'intégrité (owner_id = auth.uid()).

alter table public.network_nodes
  alter column owner_id set default auth.uid();

alter table public.network_edges
  alter column owner_id set default auth.uid();
