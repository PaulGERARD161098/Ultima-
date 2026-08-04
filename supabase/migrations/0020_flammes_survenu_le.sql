-- Ultima — migration 0020 : la DATE de ce que la flamme raconte.
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes) : le SQL vit ici, Léo l'applique au fil principal
-- après go explicite de Paul.
--
-- Dictée de Paul (2026-08-04) : « ce qu'on peut associer à chaque serment, on
-- peut associer une date, quelque chose comme ça, une petite histoire, histoire
-- d'étayer. J'ai un exemple parfait qui m'est arrivé cette semaine. »
--
-- Diagnostic : l'HISTOIRE a déjà sa place — c'est une flamme de nature
-- 'victoire' (0016), faite exactement pour ça (« la preuve que c'est
-- possible »). Ce qui manque, c'est LA DATE DE L'ÉVÉNEMENT. Aujourd'hui une
-- flamme ne porte que `created_at`, la date à laquelle elle a été ÉCRITE — or
-- « cette semaine » et « le jour où je l'ai consignée » ne sont pas la même
-- chose, et c'est la première qui étaye.
--
-- D'où UNE colonne, et une seule : `survenu_le`.
--
-- Périmètre STRICT (arbitrage de Paul du 2026-08-04, « sur la flamme ») :
--   - PAS de date de scellement sur `serments` : elle daterait le vœu, pas les
--     histoires qui l'étayent — `serments.created_at` la porte déjà.
--   - PAS de nouvelle nature de flamme : 'victoire' couvre le besoin.
--
-- Additif et NON DESTRUCTIF : une colonne nullable sur une table existante.
-- Aucune donnée touchée, aucune politique RLS modifiée (la colonne hérite des
-- policies de `flammes`, posées en 0016). Aucun index : on ne cherche jamais
-- une flamme PAR sa date — on lit les flammes d'un serment, et l'index
-- flammes_owner_serment_idx sert déjà cette requête.

-- ---------------------------------------------------------------------------
-- survenu_le : le jour où ce que la flamme raconte est ARRIVÉ. Optionnel — une
-- citation n'a pas de date d'événement, une victoire en a une. Type `date` et
-- non `timestamptz` : on consigne un jour, pas un instant ; pas de fuseau à
-- gérer, pas de faux midi.
--
-- Borne HAUTE seulement : une flamme peut raconter l'enfance (donc pas de borne
-- basse arbitraire), mais elle ne peut pas raconter demain — une victoire qui
-- n'a pas eu lieu n'étaye rien. La marge d'un jour absorbe l'écart de fuseau
-- entre le client et le serveur, sans ouvrir la porte à une date inventée.
-- ---------------------------------------------------------------------------
alter table public.flammes
  add column if not exists survenu_le date
    check (survenu_le is null or survenu_le <= (current_date + 1));

comment on column public.flammes.survenu_le is
  'Jour où ce que la flamme raconte est survenu (optionnel). Distinct de created_at, qui date l''écriture.';

-- rollback :
--   alter table public.flammes drop column if exists survenu_le;
--   -- Non destructif à l'aller ; au retour, la colonne emporte ses valeurs :
--   -- EXPORTER avant tout rollback si des dates ont été consignées.
