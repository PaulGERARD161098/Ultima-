-- VÉRIFICATION EN LECTURE SEULE — migration 20261031150000_supervision_decisions.sql (31/10/2026).
-- Où : dashboard Supabase → projet `ultima` → SQL Editor → coller → Run. Aucune écriture.
-- Résultat attendu : 12 lignes, TOUTES avec ok = true. Une ligne à false nomme ce qui manque.
-- Éprouvé par `tests/unit-supervision-verifs.mjs` (PGlite, migration intacte, sabotée, absente).
-- Un objet absent rend false (CASE : l'ordre d'évaluation est garanti), jamais une erreur.
select n, verif, ok from (values
  (1,  'la table public.supervision_decisions existe',
       to_regclass('public.supervision_decisions') is not null),
  (2,  'les colonnes sont exactes',
       coalesce((select string_agg(column_name, ',' order by ordinal_position)
          from information_schema.columns
         where table_schema = 'public' and table_name = 'supervision_decisions')
       = 'id,owner_id,proposition_id,objet_id,recommandation,statut,empreinte_materielle,preuves_ids,proposition,cree_le,tranche_le,decision_notes,prochain_reexamen_le', false)),
  (3,  'la sécurité par ligne (RLS) est activée',
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.supervision_decisions')), false)),
  (4,  'une seule policy, en lecture : supervision_select',
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'supervision_decisions') = 1
       and exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'supervision_decisions'
                     and policyname = 'supervision_select' and cmd = 'SELECT')),
  (5,  'une empreinte est unique par propriétaire',
       exists (select 1 from pg_constraint where conrelid = to_regclass('public.supervision_decisions')
                 and conname = 'supervision_unicite_empreinte' and contype = 'u')),
  (6,  'les trois fonctions sont security definer, search_path vide',
       (select count(*) from pg_proc p join pg_namespace s on s.oid = p.pronamespace
         where s.nspname = 'public'
           and p.proname in ('supervision_soumettre', 'supervision_arbitrer', 'supervision_retirer')
           and p.prosecdef and coalesce(p.proconfig, '{}') @> array['search_path=""']) = 3),
  (7,  'l''empreinte ne se calcule que dans la base (ni anon ni authenticated)',
       case when to_regprocedure('public.supervision_empreinte(text,text,text[])') is null then false else (
       not has_function_privilege('anon', 'public.supervision_empreinte(text,text,text[])', 'EXECUTE')
       and not has_function_privilege('authenticated', 'public.supervision_empreinte(text,text,text[])', 'EXECUTE')
       ) end),
  (8,  'authenticated appelle les trois fonctions ; anon aucune',
       case when to_regprocedure('public.supervision_soumettre(text,text,text,text[],jsonb)') is null or to_regprocedure('public.supervision_arbitrer(uuid,text,text,timestamptz)') is null or to_regprocedure('public.supervision_retirer(uuid)') is null then false else (
       has_function_privilege('authenticated', 'public.supervision_soumettre(text,text,text,text[],jsonb)', 'EXECUTE')
       and has_function_privilege('authenticated', 'public.supervision_arbitrer(uuid,text,text,timestamptz)', 'EXECUTE')
       and has_function_privilege('authenticated', 'public.supervision_retirer(uuid)', 'EXECUTE')
       and not has_function_privilege('anon', 'public.supervision_soumettre(text,text,text,text[],jsonb)', 'EXECUTE')
       and not has_function_privilege('anon', 'public.supervision_arbitrer(uuid,text,text,timestamptz)', 'EXECUTE')
       and not has_function_privilege('anon', 'public.supervision_retirer(uuid)', 'EXECUTE')
       ) end),
  (9,  'aucun accès anonyme à la table',
       case when to_regclass('public.supervision_decisions') is null then false else (
       not has_table_privilege('anon', 'public.supervision_decisions', 'SELECT')
       and not has_table_privilege('anon', 'public.supervision_decisions', 'INSERT')
       ) end),
  (10, 'authenticated lit, et n''écrit RIEN directement',
       case when to_regclass('public.supervision_decisions') is null then false else (
       has_table_privilege('authenticated', 'public.supervision_decisions', 'SELECT')
       and not has_table_privilege('authenticated', 'public.supervision_decisions', 'INSERT')
       and not has_table_privilege('authenticated', 'public.supervision_decisions', 'UPDATE')
       and not has_table_privilege('authenticated', 'public.supervision_decisions', 'DELETE')
       and not has_table_privilege('authenticated', 'public.supervision_decisions', 'TRUNCATE')
       ) end),
  (11, 'les statuts sont bornés et la date de décision cohérente',
       exists (select 1 from pg_constraint where conrelid = to_regclass('public.supervision_decisions')
                 and conname = 'supervision_tranche_coherent' and contype = 'c')
       and exists (select 1 from pg_constraint where conrelid = to_regclass('public.supervision_decisions')
                     and contype = 'c' and pg_get_constraintdef(oid) like '%EN_ATTENTE%ACCEPTEE%REFUSEE%OBSOLETE%')),
  (12, 'les index du cockpit sont posés',
       to_regclass('public.supervision_owner_statut_idx') is not null
       and to_regclass('public.supervision_owner_objet_idx') is not null)
) as v(n, verif, ok)
order by n;
