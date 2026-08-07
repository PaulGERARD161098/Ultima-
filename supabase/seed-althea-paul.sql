-- Ultima — SEED ALTHEA (les skills réels de Paul, dictés le 2026-08-06).
-- ⚠️ CE N'EST PAS UNE MIGRATION. Un seed dépend d'un utilisateur applicatif ;
-- une migration, jamais. À exécuter à la main, APRÈS 0022, avec l'owner_id de
-- Paul en paramètre — jamais en dur (motif RESHIRAM/ZEKROM).
--
--   psql "$DATABASE_URL" -v owner="'00000000-0000-0000-0000-000000000000'" \
--        -f supabase/seed-althea-paul.sql
--
-- IDEMPOTENT : rejouable sans doublon (on ne crée que ce qui manque, on ne
-- touche jamais aux relevés). Un seed qui casse au second passage est un seed
-- qu'on n'ose plus lancer.
--
-- ⚠️ CE FICHIER PORTE DE LA DONNÉE DE SANTÉ (tabac, alcool). Il est au dépôt
-- parce que `middleware.js` interdit de servir les chemins internes — mais il
-- ne doit JAMAIS être recopié dans une maquette, un harnais, ni un message
-- (CADRAGE-ALTHEA.md §9).

begin;

-- 1. Le personnage. « Paul Gerard, niveau 48, Farsight — celui qui voit loin ».
--    Le niveau 48 est un SOCLE DÉCLARÉ : on n'entre pas dans sa propre vie au
--    niveau 1. Ce qui se gagne ensuite s'y ajoute.
insert into public.althea_avatar (owner_id, nom, titre_code, socle_niveau)
values (:owner::uuid, 'Paul Gerard', 'farsight', 48)
on conflict (owner_id) do nothing;

-- 2. Les cinq stats et leur SOCLE. « Les stats sont arbitraires, elles
--    augmentent avec les niveaux — chaque niveau fait gagner un point partout. »
--    Le socle est donc la SEULE chose qui distingue une stat d'une autre.
insert into public.althea_stats (owner_id, code, socle) values
  (:owner::uuid, 'force',        14),
  (:owner::uuid, 'endurance',    10),
  (:owner::uuid, 'agilite',       9),
  (:owner::uuid, 'intelligence', 21),
  (:owner::uuid, 'charisme',     16)
on conflict (owner_id, code) do nothing;

-- 3. Les cinq skills. Chacun porte son ÉNONCÉ — la phrase au présent sur le
--    joueur. C'est le cœur du skill ; le compteur n'en est que la preuve.
insert into public.althea_skills
  (owner_id, nom, enonce, nourriture, unite_seuil, seuils, meta, rang_affichage)
values
  (:owner::uuid, 'PEAK PERFORMANCE', 'Le joueur est au top de sa forme !',
   'tous', 'jour', '{7,30,90,180,365}', false, 1),
  (:owner::uuid, 'TRADUCTEUR', 'Le joueur sait parler au moins 2 langues à haut niveau.',
   'tous', 'jour', '{7,30,90,180,365}', false, 2),
  -- CONSTANCE est un MÉTA-SKILL : ses conditions lisent l'état des autres
  -- skills, pas des gestes. « Se relève toujours après avoir chuté. »
  (:owner::uuid, 'CONSTANCE', 'Le joueur se relève toujours après avoir chuté, il ne reste pas au sol.',
   'tous', 'jour', '{7,30,90,180,365}', true, 3),
  -- PIEDS LÉGERS se compte en SEMAINES tenues : « 10 km par semaine » n'a pas
  -- de sens à l'échelle du jour.
  (:owner::uuid, 'PIEDS LÉGERS', 'Le joueur court au moins 10 km par semaine.',
   'tous', 'semaine', '{4,12,26,52,104}', false, 4),
  (:owner::uuid, 'OMNIVORE', 'Le joueur peut manger de tout.',
   'tous', 'jour', '{7,30,90,180,365}', false, 5)
on conflict do nothing;

-- 3 bis. L'évolution dictée : TRADUCTEUR → TRADUCTEUR UNIVERSEL (3 langues).
--        Le skill supérieur naît VERROUILLÉ : il se voit, il se nomme, et il
--        donne envie — voir ce qui est verrouillé est la moitié du plaisir.
insert into public.althea_skills
  (owner_id, nom, enonce, nourriture, unite_seuil, seuils, verrouille, rang_affichage)
values
  (:owner::uuid, 'TRADUCTEUR UNIVERSEL', 'Le joueur sait parler 3 langues.',
   'tous', 'jour', '{7,30,90,180,365}', true, 6)
on conflict do nothing;

update public.althea_skills s
   set evolue_en = (select id from public.althea_skills
                     where owner_id = :owner::uuid and nom = 'TRADUCTEUR UNIVERSEL')
 where s.owner_id = :owner::uuid and s.nom = 'TRADUCTEUR' and s.evolue_en is null;

-- 4. Les conditions. Le `groupe` porte le OU : les trois langues sont dans le
--    MÊME groupe, une seule suffit (dicté : « italien ou espagnol ou japonais,
--    30 min par jour »).
insert into public.althea_conditions
  (owner_id, skill_id, libelle, nature, cadence, seuil, unite, groupe, rang_affichage)
select :owner::uuid, s.id, v.libelle, v.nature, v.cadence, v.seuil, v.unite, v.groupe, v.rang
from (values
  -- PEAK PERFORMANCE : quatre exigences, chacune son groupe (règle « tous »).
  -- « Alimentation ok » ne figure PAS ici : c'est OMNIVORE qui la porte
  -- (décision Paul — second méta-lien du jeu, après CONSTANCE).
  ('PEAK PERFORMANCE', 'Pas de recours à substance externe', 'garde', 'quotidien', null::numeric, null, 0, 1),
  ('PEAK PERFORMANCE', 'Sommeil en ordre',                   'garde', 'quotidien', null,          null, 1, 2),
  ('PEAK PERFORMANCE', 'Stop écran tard',                    'garde', 'quotidien', null,          null, 2, 3),
  -- Le sport apparaît volontairement DEUX fois dans le jeu : ici une cadence
  -- (tous les 2 jours), et chez PIEDS LÉGERS un volume (10 km/semaine).
  ('PEAK PERFORMANCE', 'Sport',                              'pratique', 'tous_les_n_jours', 2, 'jours', 3, 4),

  -- TRADUCTEUR : trois langues dans UN SEUL groupe → l'une suffit.
  ('TRADUCTEUR', 'Italien',   'pratique', 'duree_jour', 30, 'min', 0, 1),
  ('TRADUCTEUR', 'Espagnol',  'pratique', 'duree_jour', 30, 'min', 0, 2),
  ('TRADUCTEUR', 'Japonais',  'pratique', 'duree_jour', 30, 'min', 0, 3),

  ('PIEDS LÉGERS', 'Course', 'pratique', 'volume_semaine', 10, 'km', 0, 1),

  ('OMNIVORE', 'Des légumes',  'pratique', 'quotidien', null, null, 0, 1),
  ('OMNIVORE', 'Quatre repas', 'pratique', 'n_par_jour',   4, 'repas', 1, 2)
) as v(skill, libelle, nature, cadence, seuil, unite, groupe, rang)
join public.althea_skills s
  on s.owner_id = :owner::uuid and s.nom = v.skill
where not exists (
  select 1 from public.althea_conditions c
   where c.owner_id = :owner::uuid and c.skill_id = s.id and c.libelle = v.libelle
);

-- CONSTANCE n'a AUCUNE condition en base, et c'est voulu : ses conditions
-- lisent l'état des autres skills (méta-skill). Le moteur pur le sait ; la base
-- n'a pas à connaître la règle du jeu.

commit;
