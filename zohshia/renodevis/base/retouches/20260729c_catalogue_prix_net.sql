-- Le prix d'ACHAT installateur, à côté du prix de vente.
--
-- Les deux prix COEXISTENT : le net est la base de saisie, le public reste le
-- repère de marge affiché au pro. Le prix d'achat ne descend jamais dans le
-- navigateur : la vue de vente ne le porte pas (migration 20260817b).
--
-- ⛔ Version NEUTRE : la migration d'origine verse aussi le barème d'un
-- fournisseur. Ce barème est une donnée du pro, il se charge à sa mise en
-- service (guide « ajouter un artisan », catalogue) — jamais par la techno.

alter table public.catalogue_fournisseur
  add column if not exists prix_net_u numeric;

comment on column public.catalogue_fournisseur.prix_vente_u is
  'Tarif public HT du fournisseur.';
comment on column public.catalogue_fournisseur.prix_net_u is
  'Tarif net installateur HT, réservé aux professionnels.';
