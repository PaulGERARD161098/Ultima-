-- VÉRIFICATION EN LECTURE SEULE — migration 20261019160000_leo_appels.sql (19/10/2026).
-- Où : dashboard Supabase → projet `ultima` → SQL Editor → coller → Run. Aucune écriture.
-- Résultat attendu : 16 lignes, TOUTES avec ok = true. Une ligne à false nomme ce qui manque.
-- Éprouvé par `tests/leo-appels-postgres.sh` (PostgreSQL jetable, avec et sans sabotage).
select n, verif, ok from (values
  (1,  'la table public.leo_appels existe',
       to_regclass('public.leo_appels') is not null),
  (2,  'les colonnes sont exactes (aucun message, aucune réponse, aucun intitulé)',
       (select string_agg(column_name, ',' order by ordinal_position)
          from information_schema.columns
         where table_schema = 'public' and table_name = 'leo_appels')
       = 'id,owner_id,trace_id,quadrant,modele,phase,tokens_entree,tokens_sortie,le'),
  (3,  'la sécurité par ligne (RLS) est activée',
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.leo_appels')), false)),
  (4,  'exactement 2 policies : leo_appels_select et leo_appels_insert',
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'leo_appels') = 2
       and (select count(*) from pg_policies where schemaname = 'public' and tablename = 'leo_appels'
              and policyname in ('leo_appels_select', 'leo_appels_insert')) = 2),
  (5,  'le trigger du plafond est posé (avant insertion)',
       exists (select 1 from pg_trigger
                where tgrelid = to_regclass('public.leo_appels')
                  and tgname = 'leo_appels_plafond_before_insert' and not tgisinternal)),
  (6,  'la fonction du plafond tourne avec les droits de l''appelant, search_path vide',
       exists (select 1 from pg_proc p join pg_namespace s on s.oid = p.pronamespace
                where s.nspname = 'leo_private' and p.proname = 'appels_plafond'
                  and not p.prosecdef and coalesce(p.proconfig, '{}') @> array['search_path=""'])),
  (7,  'la fonction du plafond ne s''appelle pas directement (ni anon ni authenticated)',
       not has_function_privilege('anon', 'leo_private.appels_plafond()', 'EXECUTE')
       and not has_function_privilege('authenticated', 'leo_private.appels_plafond()', 'EXECUTE')),
  (8,  'aucun accès anonyme à la table',
       not has_any_column_privilege('anon', 'public.leo_appels', 'SELECT')
       and not has_any_column_privilege('anon', 'public.leo_appels', 'INSERT')
       and not has_any_column_privilege('anon', 'public.leo_appels', 'UPDATE')),
  (9,  'un journal ne se corrige pas : ni UPDATE, ni DELETE, ni TRUNCATE pour authenticated',
       not has_any_column_privilege('authenticated', 'public.leo_appels', 'UPDATE')
       and not has_table_privilege('authenticated', 'public.leo_appels', 'DELETE')
       and not has_table_privilege('authenticated', 'public.leo_appels', 'TRUNCATE')),
  (10, 'authenticated peut LIRE ses lignes (le plafond compte à travers ce droit)',
       has_table_privilege('authenticated', 'public.leo_appels', 'SELECT')),
  (11, 'authenticated écrit seulement 6 colonnes : trace_id, quadrant, modele, phase, tokens_entree, tokens_sortie',
       has_column_privilege('authenticated', 'public.leo_appels', 'trace_id', 'INSERT')
       and has_column_privilege('authenticated', 'public.leo_appels', 'quadrant', 'INSERT')
       and has_column_privilege('authenticated', 'public.leo_appels', 'modele', 'INSERT')
       and has_column_privilege('authenticated', 'public.leo_appels', 'phase', 'INSERT')
       and has_column_privilege('authenticated', 'public.leo_appels', 'tokens_entree', 'INSERT')
       and has_column_privilege('authenticated', 'public.leo_appels', 'tokens_sortie', 'INSERT')),
  (12, 'authenticated ne choisit NI id, NI owner_id, NI le (horloge de la base)',
       not has_column_privilege('authenticated', 'public.leo_appels', 'id', 'INSERT')
       and not has_column_privilege('authenticated', 'public.leo_appels', 'owner_id', 'INSERT')
       and not has_column_privilege('authenticated', 'public.leo_appels', 'le', 'INSERT')),
  (13, 'une trace = une seule tentative (index unique partiel)',
       exists (select 1 from pg_indexes
                where schemaname = 'public' and tablename = 'leo_appels'
                  and indexname = 'leo_appels_une_tentee'
                  and indexdef ilike 'create unique index%' and indexdef ilike '%tentee%')),
  (14, 'une trace = une seule issue (index unique partiel)',
       exists (select 1 from pg_indexes
                where schemaname = 'public' and tablename = 'leo_appels'
                  and indexname = 'leo_appels_une_issue'
                  and indexdef ilike 'create unique index%'
                  and indexdef ilike '%reussie%' and indexdef ilike '%echouee%')),
  (15, 'la valeur du plafond : 100 tentatives par 24 h (lue dans la fonction)',
       exists (select 1 from pg_proc p join pg_namespace s on s.oid = p.pronamespace
                where s.nspname = 'leo_private' and p.proname = 'appels_plafond'
                  and p.prosrc ~ '>= 100 then' and p.prosrc ~ 'leo_calls_quota_exhausted')),
  (16, 'la borne de volume : 400 lignes par 24 h (lue dans la fonction)',
       exists (select 1 from pg_proc p join pg_namespace s on s.oid = p.pronamespace
                where s.nspname = 'leo_private' and p.proname = 'appels_plafond'
                  and p.prosrc ~ '>= 400 then' and p.prosrc ~ 'leo_calls_volume_exhausted'))
) as t(n, verif, ok)
order by n;
