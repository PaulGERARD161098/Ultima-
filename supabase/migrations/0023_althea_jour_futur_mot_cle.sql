-- Ultima — migration 0023 : ALTHEA, le refus du jour futur refusait TOUT.
-- APPLIQUÉE le 2026-08-06 au go de Paul (gate levée avec 0022).
--
-- ---------------------------------------------------------------------------
-- LE DÉFAUT
-- ---------------------------------------------------------------------------
-- 0022 écrivait, dans le trigger de garde :
--
--     if new.jour > (pg_catalog.current_date) then …
--
-- Or `current_date` est un **MOT-CLÉ SQL**, pas une fonction de `pg_catalog`.
-- La qualification échoue, le trigger lève une erreur — et il la lève à CHAQUE
-- insertion. Résultat : **aucun relevé n'entrait**, pas même celui du jour.
-- ALTHEA aurait été livré avec une seule case impossible à cocher.
--
-- Le search_path figé à '' (invariant 0002) avait motivé cette qualification :
-- réflexe juste, appliqué à un objet qui n'en est pas un. Un mot-clé n'est pas
-- résolu par nom — le search_path ne le concerne pas.
--
-- ---------------------------------------------------------------------------
-- CE QUI REND CE DÉFAUT DANGEREUX — et la règle qu'on en tire
-- ---------------------------------------------------------------------------
-- Le test « un jour futur est-il refusé ? » passait au **VERT**.
-- Il passait pour la MAUVAISE RAISON : tout était refusé.
--
-- Seul le test symétrique — « et le jour COURANT, passe-t-il ? » — l'a démasqué.
--
--   ⚠️ TOUT REFUS DOIT ÊTRE ÉPROUVÉ AVEC SON CONTRE-EXEMPLE.
--      Un refus sans contre-exemple ne prouve pas qu'on a fermé la bonne porte :
--      il prouve seulement qu'une porte est fermée. C'est le prolongement direct
--      de la leçon 0020/0021 (« tester par le refus, cas NULL d'abord ») — mais
--      un cran plus loin : *tester par le refus ET par l'acceptation*.
--
-- Éprouvé après correctif, sur la base réelle, dans une transaction annulée :
--   jour futur → refusé ✔ · jour courant → accepté ✔ ·
--   rattrapage à 30 jours → accepté ✔ · doublon du même jour → refusé ✔.
--
-- Additif et non destructif : remplace le CORPS de la fonction, ne touche ni
-- aux tables, ni aux données, ni au trigger (qui pointe déjà sur elle).

create or replace function public.althea_refuse_jour_futur()
returns trigger
language plpgsql
as $$
begin
  -- `current_date` NON qualifié : c'est un mot-clé, pas une fonction. Ne pas
  -- « corriger » en pg_catalog.current_date — c'est ce qui cassait 0022.
  if new.jour > current_date then
    raise exception 'ALTHEA : un relevé ne peut pas porter un jour futur (%)', new.jour
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- Le search_path reste figé (advisor 0011, invariant 0002). Sans effet sur un
-- mot-clé, mais l'invariant vaut pour toute fonction du schéma.
alter function public.althea_refuse_jour_futur() set search_path = '';
