-- Ultima — migration 0020 : VRANESH, deux NATURES de thème (la greffe).
-- Ne JAMAIS appliquer sans validation Paul explicite (gate migrations, ET §5
-- IMLADRIK = données intimes) : le SQL vit ici, Léo l'applique au fil principal
-- après contre-passe sécu et go explicite de Paul.
--
-- Dictée Paul (2026-08-04, forme B retenue sur maquette) :
--   « THORIOL a besoin de se construire, c'est un intermédiaire de base, il
--     correspond à un élément de la terre, puisque c'est à partir de là qu'on va
--     construire les choses. Ce n'est pas une direction comme LIANDRA, c'est
--     plutôt une construction, et l'idée c'est de toujours avoir des plans B.
--     Anticiper les causes d'échec, mais bien surtout anticiper l'adaptation à
--     un nouveau plan — comment faire pousser une nouvelle branche, même projet,
--     pour qu'au final ça marche. »
--
-- CE QUE CETTE MIGRATION POSE, ET RIEN DE PLUS :
--   ① une NATURE sur la situation. `direction` (défaut) = le modèle actuel, un
--      futur t'arrive et l'un pousse ; `construction` = le but ne bouge pas, ce
--      sont les MOYENS qui cassent et se remplacent. La valeur par défaut est
--      `direction` : AUCUN thème existant ne change de comportement.
--   ② un ÉTAT sur le scénario, qui n'a de sens que dans une construction :
--      `tenu` (le plan qui porte), `reserve` (le plan B, prêt et pas encore
--      employé — l'objet que l'arbre ne savait pas dire), `ecarte` (il a cassé).
--   ③ une CAUSE, et une seule règle autour d'elle : elle n'existe que sur un
--      plan écarté. C'est elle qu'on anticipe — pas l'échec, l'adaptation.
--
-- Périmètre : additif et non destructif. Aucune donnée supprimée, aucune policy
-- retouchée (celles de 0017 portent sur owner_id et couvrent les colonnes
-- nouvelles), aucun objet de 0017/0018/0019 modifié hormis l'extension de la vue.

-- ---------------------------------------------------------------------------
-- 1. La NATURE du thème. `direction` par défaut, donc l'existant est inchangé
--    et le restera tant que Paul n'aura pas dit d'un thème qu'il se construit.
-- ---------------------------------------------------------------------------
alter table public.situations
  add column nature text not null default 'direction'
  check (nature in ('direction', 'construction'));

-- ---------------------------------------------------------------------------
-- 2. L'ÉTAT d'un plan et sa CAUSE.
--    `etat` NULL = le scénario est un futur ordinaire (thème `direction`) : on
--    ne force rien sur l'existant, et un thème qui bascule en construction n'a
--    pas ses plans invalidés — ils sont simplement « pas encore qualifiés ».
-- ---------------------------------------------------------------------------
alter table public.scenarios
  add column etat text check (etat in ('tenu', 'reserve', 'ecarte')),
  add column cause text check (cause is null or char_length(cause) between 1 and 2000);

-- La cause n'existe QUE sur un plan écarté : ailleurs elle ne voudrait rien
-- dire, et une donnée qui ne veut rien dire finit par être lue de travers.
--
-- ⚠️ CETTE FORME EST DÉFECTUEUSE — corrigée par 0021, à lire avant de rejouer
-- ce fichier. `etat = 'ecarte'` vaut NULL quand `etat` est NULL, et un CHECK ne
-- rejette que sur FALSE : la contrainte ne refusait donc RIEN sur les plans non
-- qualifiés. Elle est conservée telle quelle ici parce que 0020 a été appliquée
-- en l'état (une migration appliquée ne se réécrit pas — elle se corrige par la
-- suivante). Toute reconstruction depuis zéro doit enchaîner 0020 puis 0021.
alter table public.scenarios
  add constraint scenarios_cause_scope
  check (cause is null or etat = 'ecarte');

-- ---------------------------------------------------------------------------
-- 3. La vue d'état : on AJOUTE `nature` en FIN de select — CREATE OR REPLACE
--    l'exige (les colonnes existantes gardent nom, type et ordre).
--    Rien d'autre n'est dérivé : « combien de plans tenus / en réserve » se
--    compte côté front sur les scénarios déjà servis, sans requête de plus.
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
  (count(sc.id) = 0) as a_explorer,
  s.scenario_advenu_id,
  s.advenu_le,
  (s.scenario_advenu_id is not null) as advenue,
  -- La nature (nouveau en 0020) : elle décide de la FORME que prend le thème.
  s.nature
from public.situations s
left join public.scenarios sc on sc.situation_id = s.id
group by s.id;   -- s.id est PK : toutes les colonnes s.* en dépendent

-- rollback :
--   -- restaurer situations_etat dans sa forme 0019 (sans `nature`) : rejouer le
--   -- bloc `create or replace view` de 0019.
--   alter table public.scenarios drop constraint if exists scenarios_cause_scope;
--   alter table public.scenarios drop column if exists cause;
--   alter table public.scenarios drop column if exists etat;
--   alter table public.situations drop column if exists nature;
--   -- Données : ce rollback ne supprime aucun scénario ni aucune situation ;
--   -- seuls la nature des thèmes et la qualification des plans (tenu/réserve/
--   -- écarté et leurs causes) seraient perdus. EXPORTER avant si un doute existe.
