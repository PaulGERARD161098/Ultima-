-- Ultima — 0002 : fige le search_path de set_updated_at (advisor 0011) [S2].
-- La fonction ne référence que NEW : un search_path vide supprime toute
-- résolution d'objet détournable sans changer le comportement.

alter function public.set_updated_at() set search_path = '';
