# CADRAGE — IFULVIN, la constellation des ARMES, la constellation des DRAGONS

> Format 6 points (**directive EL**). Dicté par Paul le 2026-09-29, à la suite
> de la restructuration OMEGA. Graphie **IFULVIN**, telle que Paul l'a donnée :
> « Ifu » seul n'existe pas (correction Paul, 29/09) — on ne l'abrège jamais,
> ni dans le registre, ni dans une réponse, ni dans un libellé.
>
> ⛔ **Ce document CADRE. Il n'exécute rien** : Paul a dit « on y viendra plus
> tard, mais c'est comme ça que tu vas le cadrer déjà ». Aucune ligne de code,
> aucune migration. La boucle de code s'ouvre à son go (EB).

## 0. Ce qui existe déjà — on capitalise (EB)

| Acquis | Où |
|---|---|
| IMLADRIK est un **macro-projet** à 5 caps (MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, TAO), rendu par le noyau commun | `js/registre-lv3.mjs` (boucle OMEGA du 29/09) |
| Le réseau **en cercles concentriques** a déjà été dicté le 21/09 : idée **ADR-005 « Le Cercle »**, modèle BNI mesuré, et le point qui bloquait — **plat ou concentrique ?** | `CADRAGE-RESEAU-CERCLES.md` §1, §2, §4 |
| Un voile de nébuleuse existe déjà dans le fond du ciel (pré-rendu 256 px) | `js/ciel-fond.js` l. 76 |
| RIVEN = le réseau commercial (artisans, partenaires, leads) | `riven.html` |

⚠️ **Deux constats à ne pas perdre.**
1. Paul dit maintenant « cercles concentriques de réseau partout » : **il
   tranche §4 de CADRAGE-RESEAU-CERCLES.md en faveur du concentrique.** Ce n'est
   pas encore une règle d'admission — c'est le sens du projet. Le document du
   21/09 reste la source du modèle BNI et de ses modes de défaillance ; on ne le
   recopie pas ici.
2. IFULVIN **n'est pas une deuxième version de RIVEN**. Paul : « ça correspond un
   peu avec RIVEN, mais c'est un projet très spécial ». RIVEN gère un réseau
   commercial **existant** ; IFULVIN est un réseau **à bâtir**, par cercles.

## ① Le but — ce qui sera vrai à la fin de la boucle de structure

Dans IMLADRIK, deux **constellations** — deux nébuleuses lisibles comme telles —
regroupent des caps :

- **La constellation des ARMES.** Premier macro-projet : **IFULVIN**, l'arme
  principale de Paul pour se développer et développer ses projets. *Son réseau,
  son Magnum Opus, sa plus belle arme, son épée.* Cœur : des cercles
  concentriques de réseau, partout.
- **La constellation des DRAGONS.** MAEDRETHNIR, VRANESH, DRAUKHAIN (arbitrage
  Paul 29/09).

ADRAMELECH et TAO restent **directement** sous IMLADRIK (arbitrage Paul 29/09) ;
IMLADRIK passe donc de 5 caps à 4 entrées : les deux constellations + ADRAMELECH
+ TAO.

## ② Les étapes — dans l'ordre, une boucle chacune

1. **Boucle A — la structure, sans contenu métier.** *(30/09 — arbitrage
   Paul : « option 1, assouplis la règle pour les constellations ». Un nœud
   `constellation: true` est une boussole dès UN cap ; l'exception est un
   drapeau explicite, vérifié par `verifierRegistre`, jamais une déduction.)* Deux nœuds-constellation
   dans le registre (`constellation-armes`, `constellation-dragons`) ; les 3
   dragons y sont rangés ; `ifulvin` y entre comme **étoile d'attente** (nom,
   état « À venir », une phrase, aucune cible — modèle DOKLĚS/SYMPHO, Principe 3
   de PRODUCT.md : on ne dit que ce qui est su). Harnais transposés.
2. **Boucle B — les nébuleuses.** Rendu visuel des deux nébuleuses : un voile
   coloré par constellation derrière ses étoiles. Chaque nébuleuse a sa teinte
   (ARMES / DRAGONS), sans jamais coûter la lisibilité ni le contraste des noms.
   Cadrage visuel préalable par `graphisme` (spécifie) → `front-carto`
   (implémente) ; maquette avant le code (EL).
3. **Boucle C — IFULVIN prend corps.** Seulement quand Paul a tranché §⑤ : règle
   d'entrée et unité de mesure des cercles. Elle se cadre alors comme un projet à
   part entière (`CADRAGE-IFULVIN-…`), avec son schéma et sa RLS.

## ③ Les moyens

- Fichiers : `js/registre-lv3.mjs`, `imladrik.html` (repli `<noscript>`),
  `js/adaptateur-lv4.mjs` / `js/ciel-noeud.mjs` (rendu d'un étage à 4 entrées dont
  2 sont des constellations), `js/ciel-fond.js` (voile), `tests/`.
- Agents : `graphisme`, `front-carto`, `interface-ux`, `verificateur`.
- Aucune donnée en base à l'étape A/B : rien à migrer, aucun gate SQL.

## ④ Critères de réussite (vérifiables)

- A : le registre passe `unit-registre-lv3` ; IMLADRIK = 4 entrées ; les deux
  constellations ont chacune ≥ 1 enfant ; IFULVIN est atteignable **sans
  JavaScript** (repli `<noscript>` égal au registre) et `aria-disabled` (aucune
  page promise) ; la graphie IFULVIN est vérifiée par assertion (jamais « Ifu »).
- B : contraste des noms sur nébuleuse mesuré (`smoke-fond-contraste`, étendu) ;
  le clic va à l'étoile visée (`smoke-clic-exact`, étendu aux 2 constellations) ;
  zéro erreur console.
- Chaque harnais est validé par un sabotage volontaire (il doit virer au rouge).

## ⑤ Ce qu'on ne fait PAS dans cette boucle

- Aucune règle d'admission, aucune table, aucun écran de réseau IFULVIN.
- On **ne re-décide pas** plat vs concentrique (dit : concentrique) ni le modèle
  BNI (`CADRAGE-RESEAU-CERCLES.md`).
- On ne touche ni à RIVEN, ni au contenu de MAEDRETHNIR / VRANESH / DRAUKHAIN.
- Pas de nouvel outil à côté d'Ultima (directive JL).

**À trancher par Paul avant la boucle C (registre des arbitrages)** :
1. IFULVIN **remplace-t-il** l'idée ADR-005 « Le Cercle » ou en est-il le projet
   d'exécution ? (Je n'en déduis rien.)
2. Un membre entre-t-il dans un cercle **par parrainage du cercle visé**, ou
   autrement ? (§4 du 21/09.)
3. Le nom des cercles / des niveaux (les gravures de la carte savante).

## ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| On code IFULVIN comme un RIVEN bis (fiches, filtres, leads) | ⑤ : IFULVIN reste étoile d'attente jusqu'à la boucle C |
| Le nom dérive (« Ifu », « Ifulvine »…) | assertion sur la graphie exacte dans le registre et les harnais |
| Les nébuleuses embellissent mais rendent les noms illisibles | critère B mesuré, pas jugé à l'œil ; teinte plafonnée |
| Le clic « rate » une étoile dans une constellation (défaut déjà payé le 25/09) | `smoke-clic-exact` étendu ; dépliage au survol non ajouté |
| Un cap disparaît en changeant de rang (ADRAMELECH, TAO) | test « chaque cap du registre est atteignable depuis l'accueil » |
| On ouvre la boucle C par enthousiasme, sans §⑤ tranché | gate EL : elle ne s'ouvre pas tant que les 3 arbitrages ne sont pas rendus |

**Décisions attendues de Paul** : les 3 arbitrages du §⑤. **Prochaine action
unique** : finir la boucle OMEGA (tests, commit), puis boucle A.
