-- Ultima — migration 0019 : VRANESH « la branche qui a poussé » (l'advenu).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes) : le SQL vit ici, Léo l'applique au fil principal
-- après contre-passe sécu et go explicite de Paul.
--
-- Dictée Paul (2026-08-01, redite et confirmée après réserve de Léo) :
--   « une fois une branche choisie (quand le futur est advenu) alors je peux
--     revenir sur l'arbre et choisir la branche qui a poussé, ou en créer une
--     autre si nouvelle branche, et ça supprimera les autres branches
--     potentielles. »
--
-- DÉCISION DE PAUL, APPLIQUÉE TELLE QUELLE : les branches potentielles qui ne
-- se sont pas réalisées sont **réellement supprimées**. Léo avait proposé de
-- les élaguer sans les détruire ; Paul a redit sa consigne, elle prime.
--   Ce que la suppression exige en retour, et qui est tenu ici :
--     ① elle est PORTÉE PAR L'API, pas par la base — aucun ON DELETE en cascade
--        ni trigger ne coupe une branche tout seul. Rien ne disparaît sans que
--        le geste ait été demandé explicitement ;
--     ② le front la fait CONFIRMER avant de l'émettre (geste irréversible) ;
--     ③ la branche retenue est protégée par une FK avant que les autres ne
--        soient coupées : impossible de tout perdre en cas d'échec au milieu.
--
-- Périmètre : additif et non destructif. Cette migration ne supprime AUCUNE
-- donnée ; elle ouvre seulement la possibilité du dénouement. Aucune policy
-- retouchée (celles de 0017 portent sur owner_id et couvrent les colonnes
-- nouvelles). Aucun objet de 0017/0018 modifié hormis l'extension de la vue.

-- ---------------------------------------------------------------------------
-- 1. Cible de scellement sur `scenarios`.
--    (owner_id, id) est déjà unique par construction (id est PK) ; on déclare
--    le TRIPLET (owner_id, situation_id, id) pour que la FK du dénouement
--    garantisse D'UN SEUL COUP, sans trigger :
--      - le scénario retenu appartient au même owner que la situation,
--      - il appartient bien À CETTE situation (impossible de désigner comme
--        advenu le futur d'un AUTRE thème),
--      - il existe.
-- ---------------------------------------------------------------------------
alter table public.scenarios
  add constraint scenarios_situation_id_uniq unique (owner_id, situation_id, id);

-- ---------------------------------------------------------------------------
-- 2. Le dénouement, porté par la SITUATION (une situation = au plus un futur
--    advenu). `scenario_advenu_id` NULL = le futur n'a pas encore tranché.
--
--    « En créer une autre si nouvelle branche » ne demande AUCUN objet
--    supplémentaire : on insère un scénario ordinaire dans `scenarios` (c'est
--    un futur, simplement constaté au lieu d'être anticipé), puis on le désigne
--    ici. Le modèle situations → scénarios de 0017 absorbe le cas tel quel.
-- ---------------------------------------------------------------------------
alter table public.situations
  add column scenario_advenu_id uuid,
  add column advenu_le timestamptz;

-- Scellement AD-4 étendu (motif 0008/0009/0010/0016/0017), cible = le triplet
-- ci-dessus. ON DELETE SET NULL, JAMAIS CASCADE : supprimer la branche retenue
-- rouvre la situation au lieu de détruire le thème. La suppression des branches
-- potentielles reste un geste de l'API, jamais un effet de bord de la base.
alter table public.situations
  add constraint situations_advenu_scelle
  foreign key (owner_id, id, scenario_advenu_id)
  references public.scenarios (owner_id, situation_id, id)
  on delete set null;

-- Cohérence : advenu AVEC une date, ou pas advenu du tout. Jamais l'un sans
-- l'autre (une date sans branche ne dirait rien de ce qui est arrivé).
alter table public.situations
  add constraint situations_advenu_coherent
  check ((scenario_advenu_id is null) = (advenu_le is null));

-- ---------------------------------------------------------------------------
-- 3. La vue d'état : on AJOUTE les colonnes du dénouement en FIN de select —
--    CREATE OR REPLACE l'exige (les colonnes existantes gardent nom, type et
--    ordre). `a_explorer` est inchangé : une situation advenue reste anticipée,
--    elle n'est pas « à explorer ».
--
--    Rien de plus n'est dérivé : une fois le futur tranché, la situation ne
--    porte plus qu'UNE branche — `nb_scenarios` dit déjà tout.
-- ---------------------------------------------------------------------------
create or replace view public.situations_etat
  with (security_invoker = true) as
select
  s.id,
  s.owner_id,
  s.intitule,
  s.contexte,
  s.created_at,
  s.updated_at,
  count(sc.id)       as nb_scenarios,
  (count(sc.id) = 0) as a_explorer,   -- true = situation sans futur imaginé
  -- Le dénouement (nouveau en 0019).
  s.scenario_advenu_id,
  s.advenu_le,
  (s.scenario_advenu_id is not null) as advenue
from public.situations s
left join public.scenarios sc on sc.situation_id = s.id
group by s.id;   -- s.id est PK : toutes les colonnes s.* en dépendent

-- rollback :
--   -- restaurer situations_etat dans sa forme 0017 (sans les 3 colonnes du
--   -- dénouement) : rejouer le bloc `create or replace view` de 0017.
--   alter table public.situations drop constraint if exists situations_advenu_coherent;
--   alter table public.situations drop constraint if exists situations_advenu_scelle;
--   alter table public.situations drop column if exists advenu_le;
--   alter table public.situations drop column if exists scenario_advenu_id;
--   alter table public.scenarios drop constraint if exists scenarios_situation_id_uniq;
--   -- Données : cette migration et son rollback ne suppriment aucun scénario ;
--   -- seuls les dénouements (quelle branche a poussé) seraient perdus. Les
--   -- branches coupées par un dénouement le sont par l'API, à la demande de
--   -- Paul, et ne sont pas récupérables — EXPORTER avant si un doute existe.
