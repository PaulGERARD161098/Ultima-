-- Ultima — migration 0019 : VRANESH « la branche qui a poussé » (l'advenu).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes) : le SQL vit ici, Léo l'applique au fil principal
-- après contre-passe sécu et go explicite de Paul.
--
-- Dictée Paul (2026-08-01), à la suite de la boussole des futurs :
--   « une fois une branche choisie (quand le futur est advenu) alors je peux
--     revenir sur l'arbre et choisir la branche qui a poussé, ou en créer une
--     autre si nouvelle branche, et ça supprimera les autres branches
--     potentielles. »
--
-- ARBITRAGE PRIS ET SIGNALÉ — élaguer, jamais détruire.
--   Paul dit « supprimer ». On tient la PROMESSE VISUELLE (la boussole ne montre
--   plus que la branche qui a poussé) sans exécuter la DESTRUCTION : les futurs
--   qui ne se sont pas réalisés restent en base, marqués ÉLAGUÉS. Trois raisons :
--     ① ce que Paul avait anticipé, comparé à ce qui est arrivé, est précisément
--        ce qui entraîne l'anticipation — c'est la valeur du cap, pas du déchet ;
--     ② une suppression de données non vérifiées vides est bloquante même en
--        mode solo (CLAUDE.md) — la rendre automatique la rendrait invisible ;
--     ③ rien n'est perdu pour qui veut vraiment supprimer : DELETE /api/scenarios
--        existe déjà et reste le geste explicite, un scénario à la fois.
--   Si Paul tranche pour la destruction réelle, elle se fera par un geste dédié
--   et confirmé, pas par un effet de bord du dénouement.
--
-- Périmètre : additif et non destructif. Aucune donnée existante modifiée,
-- aucune colonne supprimée, aucune policy retouchée (les policies de 0017
-- couvrent déjà les nouvelles colonnes : elles portent sur owner_id).
--
-- « Élagué » est DÉRIVÉ, jamais stocké — même discipline que `a_explorer`
-- (0017), `a_raviver` (0016), `a_orienter` (0010) : un seul lieu de vérité
-- (le dénouement de la situation), zéro risque de désynchronisation.

-- ---------------------------------------------------------------------------
-- 1. Cible de scellement sur `scenarios`.
--    La paire (owner_id, id) est déjà unique par construction (id est PK) ; on
--    déclare le TRIPLET (owner_id, situation_id, id) pour que la FK du
--    dénouement garantisse D'UN SEUL COUP trois choses, sans trigger :
--      - le scénario retenu appartient au même owner que la situation,
--      - il appartient bien À CETTE situation (impossible de désigner le futur
--        d'un autre thème),
--      - il existe.
-- ---------------------------------------------------------------------------
alter table public.scenarios
  add constraint scenarios_situation_id_uniq unique (owner_id, situation_id, id);

-- ---------------------------------------------------------------------------
-- 2. Le dénouement, porté par la SITUATION (une situation = au plus un futur
--    advenu). `scenario_advenu_id` NULL = le futur n'a pas encore tranché.
--
--    Créer une branche neuve « si nouvelle branche » ne demande AUCUN objet
--    supplémentaire : on insère un scénario ordinaire dans `scenarios` (c'est
--    un futur, simplement constaté au lieu d'être anticipé), puis on le désigne
--    ici. Le modèle situations → scénarios de 0017 absorbe le cas tel quel.
-- ---------------------------------------------------------------------------
alter table public.situations
  add column scenario_advenu_id uuid,
  add column advenu_le timestamptz;

-- Scellement AD-4 étendu (motif 0008/0009/0010/0016/0017), cible = le triplet
-- ci-dessus. ON DELETE SET NULL : supprimer le scénario retenu rouvre la
-- situation au lieu de la casser — jamais de cascade destructrice ici.
alter table public.situations
  add constraint situations_advenu_scelle
  foreign key (owner_id, id, scenario_advenu_id)
  references public.scenarios (owner_id, situation_id, id)
  on delete set null;

-- Cohérence : on est advenu AVEC une date, ou pas advenu du tout. Jamais l'un
-- sans l'autre (une date sans branche ne dirait rien de ce qui est arrivé).
alter table public.situations
  add constraint situations_advenu_coherent
  check ((scenario_advenu_id is null) = (advenu_le is null));

-- ---------------------------------------------------------------------------
-- 3. Vues dérivées.
--
--    3a. situations_etat : on AJOUTE les colonnes du dénouement en fin de
--        select (CREATE OR REPLACE l'exige : les colonnes existantes gardent
--        leur nom, leur type et leur ordre). `a_explorer` est inchangé — une
--        situation advenue reste anticipée, elle n'est pas « à explorer ».
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
  (s.scenario_advenu_id is not null) as advenue,
  -- Ce que la boussole montre encore : 1 branche si le futur a tranché,
  -- toutes les branches tant qu'il ne l'a pas fait.
  (case when s.scenario_advenu_id is not null then 1 else count(sc.id) end)
    as nb_scenarios_vivants
from public.situations s
left join public.scenarios sc on sc.situation_id = s.id
group by s.id;   -- s.id est PK : toutes les colonnes s.* en dépendent

-- 3b. scenarios_etat : chaque scénario avec son statut vis-à-vis du dénouement
--     de sa situation. C'est ce que lit la boussole pour n'afficher que la
--     branche qui a poussé.
--       advenu = true  → c'est LA branche qui a poussé ;
--       elague = true  → futur potentiel que l'histoire n'a pas retenu ;
--       les deux false → la situation n'a pas encore tranché (futur ouvert).
create view public.scenarios_etat
  with (security_invoker = true) as
select
  sc.id,
  sc.owner_id,
  sc.situation_id,
  sc.deroule,
  sc.vraisemblance,
  sc.signaux,
  sc.parade,
  sc.created_at,
  (s.scenario_advenu_id = sc.id)                             as advenu,
  (s.scenario_advenu_id is not null and s.scenario_advenu_id <> sc.id) as elague
from public.scenarios sc
join public.situations s on s.id = sc.situation_id;

-- rollback :
--   drop view if exists public.scenarios_etat;
--   -- restaurer situations_etat dans sa forme 0017 (sans les 4 colonnes du
--   -- dénouement) : rejouer le bloc `create or replace view` de 0017.
--   alter table public.situations drop constraint if exists situations_advenu_coherent;
--   alter table public.situations drop constraint if exists situations_advenu_scelle;
--   alter table public.situations drop column if exists advenu_le;
--   alter table public.situations drop column if exists scenario_advenu_id;
--   alter table public.scenarios drop constraint if exists scenarios_situation_id_uniq;
--   -- Données : aucun scénario n'est supprimé par cette migration ni par son
--   -- rollback ; seuls les dénouements (quelle branche a poussé) seraient perdus.
