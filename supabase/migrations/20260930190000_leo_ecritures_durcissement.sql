-- B1 ④ — DURCISSEMENT DE `leo_ecritures` (revue adversariale du 30/09, S5 + S6).
-- Cadrage : CADRAGE-2026-09-22-leo-pilote-tout.md §13.
--
-- Depuis le 29/09, ce journal est la garde principale de Léo (les dix outils
-- sont verts). Deux écarts entre ce que le CODE promet et ce que la BASE tient :
--
-- S5 · Lire puis insérer n'est pas atomique : deux clôtures concurrentes d'une
--      même trace passaient toutes deux (éprouvé : [200, 200], trace portant
--      'reussie' ET 'echouee'). Un journal qui porte deux issues contradictoires
--      ment — c'est la seule chose qu'il n'a pas le droit de faire.
--      ⇒ index uniques partiels : une tentative, au plus une issue, par trace.
--
-- S6 · Par PostgREST, en contournant la route, la table acceptait ce que la
--      route refuse : un `le` choisi (2099 → plafond bloqué à vie), un `motif`
--      libre sur une réussite (« zéro contenu dicté » faux au niveau de la base),
--      un outil fantaisiste. Gravité faible (seul le détenteur du jeton le peut),
--      mais la promesse était écrite dans la forme des colonnes : elle doit y être.
--      ⇒ le motif en liste fermée, l'outil en forme d'identifiant, et l'INSERT
--        limité aux colonnes que la route pose — `id`, `le`, `owner_id` ne se
--        choisissent plus.
--
-- ⛔ DOUBLE VÉRITÉ ASSUMÉE : le motif ci-dessous est `MOTIF_TECHNIQUE`
-- (`api/_lib/leo-execution.js`). `tests/unit-leo-execution.mjs` lit ce fichier
-- et exige que les deux coïncident, avec son verrou de non-vacuité.
--
-- Non destructive : la table comptait 0 ligne à l'application (mesuré avant).

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

create unique index leo_ecritures_une_tentee
  on public.leo_ecritures (owner_id, trace_id) where phase = 'tentee';
create unique index leo_ecritures_une_issue
  on public.leo_ecritures (owner_id, trace_id) where phase in ('reussie', 'echouee');

alter table public.leo_ecritures
  add constraint leo_ecritures_motif_technique check (motif is null or
    (phase = 'echouee' and motif ~ '^(statut [1-5][0-9]{2}|reseau|reponse illisible)$')),
  add constraint leo_ecritures_outil_forme check (outil ~ '^[a-z_]{1,80}$');

revoke insert on public.leo_ecritures from authenticated;
grant insert (trace_id, outil, quadrant, anneau, phase, cible_id, motif)
  on public.leo_ecritures to authenticated;

commit;
