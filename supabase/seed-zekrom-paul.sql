-- Ultima — SEED ZEKROM : les 3 idéaux réels de Paul (dictée 2026-07-23).
-- CE N'EST PAS UNE MIGRATION. À exécuter UNE fois, APRÈS 0010 appliquée et
-- SEULEMENT sur validation Paul (gate), quand son owner_id est connu.
--
-- owner_id JAMAIS en dur : passé en paramètre psql. Exemples :
--   psql "$DATABASE_URL" -v owner_id="'<uuid-de-paul>'" -f supabase/seed-zekrom-paul.sql
-- ou, depuis la session authentifiée de Paul, en laissant la RLS/défaut base
-- fixer owner_id = auth.uid() (retirer alors la colonne owner_id des INSERT).
--
-- Idempotent SANS créer d'objet de schéma : chaque idéal n'est inséré que s'il
-- n'existe pas déjà pour cet owner (WHERE NOT EXISTS). Ses directions ne sont
-- posées que lorsque l'idéal vient d'être créé (la CTE `ins` ne renvoie de ligne
-- que dans ce cas) → relancer ne crée ni idéal ni direction en double. Aucune
-- contrainte unique ajoutée (pas d'invariant de schéma hors migrations 0010) :
-- l'idempotence est portée par le seed lui-même, non par le schéma. Non destructif
-- (aucun DROP/DELETE/UPDATE).

\set owner :owner_id

-- ── Idéal n°1 — le domaine du moulin (projet) ───────────────────────────────
with ins as (
  insert into public.ideaux (owner_id, intitule, registre, horizon)
  select :owner,
    'Prendre soin du domaine et des terres autour du moulin',
    'projet',
    'enraciner, transmettre, faire vivre le lieu'
  where not exists (
    select 1 from public.ideaux
    where owner_id = :owner
      and intitule = 'Prendre soin du domaine et des terres autour du moulin'
  )
  returning id
)
insert into public.directions (owner_id, ideal_id, formulation)
select :owner, id, f.formulation from ins,
  (values
    ('Restaurer et entretenir le domaine'),
    ('Cultiver et gérer les terres autour du moulin')
  ) as f(formulation);

-- ── Idéal n°2 — partir avec une femme aimée (vision) ────────────────────────
with ins as (
  insert into public.ideaux (owner_id, intitule, registre, horizon)
  select :owner,
    'Partir avec une femme aimée — un moment dans un village de pêcheurs',
    'vision',
    'partager une vie et un ailleurs à deux'
  where not exists (
    select 1 from public.ideaux
    where owner_id = :owner
      and intitule = 'Partir avec une femme aimée — un moment dans un village de pêcheurs'
  )
  returning id
)
insert into public.directions (owner_id, ideal_id, formulation)
select :owner, id, f.formulation from ins,
  (values
    ('Rencontrer et bâtir une vie mobile à deux')
  ) as f(formulation);

-- ── Idéal n°3 — la liberté géographique (projet) ────────────────────────────
with ins as (
  insert into public.ideaux (owner_id, intitule, registre, horizon)
  select :owner,
    'Travailler d''où je veux, libre de voyager et d''ouvrir des business partout',
    'projet',
    'liberté, mobilité, sans contrainte de lieu'
  where not exists (
    select 1 from public.ideaux
    where owner_id = :owner
      and intitule = 'Travailler d''où je veux, libre de voyager et d''ouvrir des business partout'
  )
  returning id
)
insert into public.directions (owner_id, ideal_id, formulation)
select :owner, id, f.formulation from ins,
  (values
    ('Se constituer des revenus délocalisables'),
    ('Ouvrir des business en plusieurs lieux')
  ) as f(formulation);
