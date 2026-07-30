-- Ultima — SEED RESHIRAM : les talents réels de Paul (dictée 2026-07-30).
-- CE N'EST PAS UNE MIGRATION. À exécuter APRÈS 0009 appliquée, quand l'owner_id
-- de Paul est connu. Miroir strict du motif de `seed-zekrom-paul.sql`.
--
-- owner_id JAMAIS en dur : passé en paramètre psql. Exemple :
--   psql "$DATABASE_URL" -v owner_id="'<uuid-de-paul>'" -f supabase/seed-reshiram-paul.sql
-- ou, depuis la session authentifiée de Paul, en laissant le défaut base fixer
-- owner_id = auth.uid() (retirer alors la colonne owner_id des INSERT).
--
-- Idempotent SANS créer d'objet de schéma : chaque talent n'est inséré que s'il
-- n'existe pas déjà pour cet owner (WHERE NOT EXISTS sur le nom) → relancer ne
-- crée pas de doublon. Aucune contrainte unique ajoutée (pas d'invariant de
-- schéma hors migration 0009). Non destructif (aucun DROP/DELETE/UPDATE).
--
-- ⚠️ RÈGLE CARDINALE RESHIRAM (§7) : ces talents naissent SANS preuve, donc
-- « à étayer » — ils n'entrent PAS dans `talents_offre_reelle` tant que Paul
-- n'a pas donné un fait ou un chiffre. Les preuves ne sont PAS seedées : elles
-- se saisissent depuis `/reshiram` (Léo challenge « sur quoi tu bases ça ? »),
-- c'est le geste produit, pas un script.
--
-- Registre : les deux talents ci-dessous sont TRANSVERSAUX (secteurs = '{}').
-- Paul est appelé « pour une thématique très large » — le sourcing sectoriel
-- (CVC, cuisine, salle de bain, rénovation, §7 n°1) est un talent distinct, non
-- encore dicté en donnée réelle, donc non seedé ici.

\set owner :owner_id

-- ── Talent n°1 — l'anticipation : il y a toujours une porte de sortie ────────
-- « J'ai assez de planification en tête et de visualisation des problèmes et des
--   futurs potentiels, bons comme mauvais, que j'ai toujours une solution de
--   repli. » (dictée Paul 2026-07-30)
insert into public.talents (owner_id, nom, secteurs, niveau, plus_value)
select :owner,
  'Toujours avoir un plan B',
  '{}',
  'pratique',
  'Planification et visualisation des futurs possibles — les bons comme les mauvais — assez en amont pour qu''il y ait toujours une solution de repli prête. Ce n''est pas « résoudre les problèmes » : c''est ne jamais rester bloqué.'
where not exists (
  select 1 from public.talents
  where owner_id = :owner and nom = 'Toujours avoir un plan B'
);

-- ── Talent n°2 — l'analyse qui découpe jusqu'à la résolution ─────────────────
-- « Décortiquer précisément le problème, savoir comment l'analyser pour le
--   résoudre de manière la plus rapide, la plus efficace et la moins chère
--   possible. » (dictée Paul 2026-07-30)
insert into public.talents (owner_id, nom, secteurs, niveau, plus_value)
select :owner,
  'Décortiquer précisément un problème',
  '{}',
  'pratique',
  'Découper le problème pièce par pièce pour choisir la résolution la plus rapide, la plus efficace et la moins chère. La méthode d''analyse est le livrable, pas seulement la solution.'
where not exists (
  select 1 from public.talents
  where owner_id = :owner and nom = 'Décortiquer précisément un problème'
);

-- ── Talent n°3 — le sang-froid : l'imprévu ne prend jamais de vitesse ────────
-- « Toujours savoir quoi faire. Ne jamais être pris par surprise. »
--   (dictée Paul 2026-07-30)
-- Distinct du n°1, et la frontière compte : le n°1 se joue AVANT (l'alternative
-- préparée en amont), le n°3 se joue PENDANT (l'imprévu tombe, la marche à
-- suivre est immédiate). L'un est de la prévoyance, l'autre du sang-froid.
insert into public.talents (owner_id, nom, secteurs, niveau, plus_value)
select :owner,
  'Toujours savoir quoi faire',
  '{}',
  'pratique',
  'Ne jamais être pris par surprise : quand l''imprévu tombe, la marche à suivre est immédiate — aucun temps mort, aucune sidération. Là où le plan B est préparé en amont, celui-ci se joue dans l''instant.'
where not exists (
  select 1 from public.talents
  where owner_id = :owner and nom = 'Toujours savoir quoi faire'
);
