-- CORRECTIF RLS — `leo_operations` fuyait entre propriétaires.
-- ✅ APPLIQUÉ le 2026-09-30 sur le projet Ultima (leosfqyidgsaescjbfom).
--
-- ⛔ LA POLICY NE VÉRIFIAIT QUE L'EXISTENCE DE LA MISSION, jamais son
-- propriétaire :
--   EXISTS (SELECT 1 FROM leo_missions m WHERE m.id = leo_operations.mission_id)
-- Tout compte authentifié pouvait donc lire les `payload` et `result` (jusqu'à
-- 16 Ko de jsonb chacun) des opérations de N'IMPORTE QUELLE mission.
--
-- Sa policy SŒUR, `leo_missions_read`, faisait le contrôle correctement.
-- L'écart entre les deux est ce qui a rendu la faille visible : une table
-- cloisonnée, sa fille ouverte.
--
-- ⚠️ MESURÉ AVANT DE CORRIGER, et ça borne la portée : 1 seul compte dans
-- auth.users, 0 ligne dans les deux tables. RIEN NE FUYAIT à cet instant.
-- Mais `readers` / `writers` existent par conception — le multi-utilisateur
-- est prévu, donc c'était une bombe à retardement, pas un détail théorique.
--
-- ⛔ POURQUOI CE DURCISSEMENT NE POUVAIT PAS CASSER LE MOTEUR (leçon du
-- 17/08 — ne jamais restreindre un droit sans vérifier qui l'emprunte) :
--   · `service_role` n'est PAS soumis à la RLS ;
--   · `authenticated` n'a que SELECT sur ces tables (aucune policy d'écriture) ;
--   · le repli est fail-closed : en cas d'erreur, la lecture est refusée.
-- Un code qui dépendrait de l'ancienne policy lirait les opérations d'autrui :
-- ce serait un bug, pas une fonctionnalité.
--
-- ⚠️ ÉPROUVÉ DES DEUX CÔTÉS, en transaction annulée, sur un cas FABRIQUÉ —
-- les tables étant vides, « rien ne fuit » aurait été vrai par vacuité :
--   · intrus authentifié (sub inconnu) → 0 opération, 0 mission ;
--   · propriétaire                    → 1 opération, 1 mission ;
--   · verrou de non-vacuité : la ligne fabriquée existait bien (1).
drop policy if exists leo_operations_read on public.leo_operations;

create policy leo_operations_read on public.leo_operations
  for select using (
    exists (
      select 1 from public.leo_missions m
       where m.id = leo_operations.mission_id
         and (select auth.uid()) is not null
         and ( m.owner = (select auth.uid())
            or m.readers @> array[(select auth.uid())]
            or m.writers @> array[(select auth.uid())] )
    )
  );
