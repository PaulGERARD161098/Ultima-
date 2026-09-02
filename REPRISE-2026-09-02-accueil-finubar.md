# REPRISE — L'accueil piloté par Finubar (séance du 2026-09-02)

> Écrit en fin de séance, pour la séance suivante. Il **décrit** un état, il ne
> le dérive pas : il est juste à la minute où il est écrit. En cas d'écart avec
> le dépôt ou avec `FINUBAR.md`, **c'est le dépôt qui gagne** — on corrige ce
> fichier, jamais l'inverse.

## 1. Où on en est — vérifié, pas rappelé de mémoire

`main` = **`c9c4587`**. Zéro PR ouverte. Patrimoine complet vert.

**En production** (`https://ultima-plum.vercel.app` — adresse relevée dans
`memoire/LEXIQUE-VOCAL.md`, elle ne se déduit pas du nom du projet Vercel) :

- **La porte d'entrée est au ciel.** L'écran de connexion porte le champ
  d'étoiles commun ; la mer, la moirure et la carte antique sont parties de
  `index.html` et de `riven.html`.
- **L'accueil est piloté par Finubar.** Les 8 dépôts sont des astres de l'arbre
  (les 4 briques sous RENOBOOST IA, Ultima à la racine, le reste sous ALPHA), la
  **lueur d'appel monte** des astres vers leurs constellations, et le **bandeau
  du bas** porte « collecté le <date> », les comptes, ≤ 3 signaux cliquables et
  l'action unique de Léo.

**Ce qui n'a PAS été fait, et c'est délibéré** : **P4** — les signaux du cockpit
(ALTHEA en sommeil, idées orphelines, relances dues) sur le même ciel et la même
couleur. Arbitré par Paul : *après* que P3 ait vécu. Une boucle à la fois.

## 2. La première chose à faire à la reprise

**Demander à Paul ce que l'accueil lui a fait.** Il ne l'a pas encore regardé en
production au moment où ces lignes sont écrites, et c'est le seul juge de la
question qui commandait toute la boucle : *est-ce que la couleur oriente ?*

Trois réponses possibles, trois suites différentes — ne pas les confondre :

| Ce qu'il dit | Ce que ça veut dire | La suite |
|---|---|---|
| « ça m'oriente » | P3 a vécu | **P4** : le cockpit rejoint le même ciel |
| « je ne vois pas bien la différence » | le signal est trop discret, ou le portefeuille trop uniforme (3 projets sur 5 en or) | mesurer avant de régler : si tout appelle, ce n'est pas la couleur qu'il faut changer, c'est le **portefeuille** — les gestes en attente sont à faire, pas à repeindre |
| « ça me met la pression » | la règle ③ d'ALTHEA est violée quelque part | retirer, pas atténuer. Une interface qui gronde se fuit |

## 3. La roadmap, en partant de l'objectif final

**Objectif final (directive JL)** : Ultima est l'unique interface de travail de
Paul — elle absorbe sa data, la dispatche, la navigue, avec Léo pour seule
interlocutrice.

| Jalon | Ce qui sera vrai à la fin | État |
|---|---|---|
| **J1 — le ciel est la navigation** | tous les écrans se rejoignent par un seul geste | ✅ LV3 → LV5 |
| **J2 — le ciel PORTE l'état** | on voit où ça appelle avant de savoir quoi | ✅ **cette séance** (Finubar) |
| **J3 — le ciel porte l'état PERSONNEL** | les quadrants (ALTHEA, ADRAMELECH, TAO) appellent sur le même ciel, avec la même couleur | ⏭ **P4**, cadré, en attente du go |
| **J4 — le ciel rend les DONNÉES** | les idées d'ADRAMELECH sont un ciel (une idée = une étoile, un rapprochement = un trait) | ⏭ LV6 P4-P5, gelé |
| **J5 — Ultima absorbe le reste** | tout nouveau besoin devient une extension, jamais un outil à côté | horizon |

⛔ **Le goulot n'est PAS le code.** Mesuré le 20/08 et toujours vrai : `personnes`
= 0, `journal` = 0, `talents/preuves` = 3/0, `althea_releves` dort depuis le
10/08. **La proactivité sans donnée est un haut-parleur dans une pièce vide** —
J3 rendra service en proportion de ce que Paul aura nourri, pas de ce qu'on aura
codé. C'est la seule chose de cette liste qui n'attend que lui.

## 4. Pre-mortem à trois mois — « on est en décembre, l'accueil a échoué »

| # | Ce qui s'est passé | Le signal précoce | Ce qui l'aurait évité |
|---|---|---|---|
| 1 | **L'agrégat a trois semaines et personne ne l'a vu.** La collecte tourne à la main, en fin de séance ; les séances se sont espacées, la date au bandeau est devenue un détail qu'on ne lit plus. Paul pilote sur un état mort. | la date affichée recule de plus de 5 jours | rendre la collecte **automatique** (elle ne dépend d'aucun secret, seulement de git). La date au bandeau est un pansement, pas une solution — elle dit le mal, elle ne le soigne pas |
| 2 | **Tout est or.** Les gestes en attente s'accumulent (ils sont 3 sur 5 aujourd'hui, ouverts depuis 29 à 49 jours) ; le ciel s'allume partout, donc plus rien n'appelle, donc on n'y regarde plus. | 4 projets sur 5 en or pendant deux semaines | c'est un problème de PORTEFEUILLE, pas d'écran. Le bandeau dit déjà lequel commencer ; si rien ne bouge, la question à poser à Paul n'est pas « quelle couleur » mais « lequel de ces trois gestes on abandonne » |
| 3 | **L'écran est devenu un tableau de bord qu'on regarde au lieu de travailler.** | Paul décrit l'accueil au lieu de décrire ce qu'il y fait | l'accueil n'a le droit qu'à **3 signaux + 1 action**. Toute demande d'en ajouter se refuse par défaut ; ce qui doit s'étendre, c'est `/finubar`, pas la porte |
| 4 | **P4 a été ouvert trop tôt** et les deux sources de signaux se sont marché dessus (l'étoile dit 3, le bandeau dit 2). | deux fetch, deux objets | un seul fetch partagé, `cartoucheDuMatin` seule juge — c'est déjà la règle, elle devra tenir avec deux sources |
| 5 | **Un dépôt a disparu du ciel sans que personne ne le voie.** Son `ciel` mal orthographié dans `depots.json` l'a rangé sous ALPHA. | la ligne « N dépôt(s) sans accroche » au rapport de collecte | elle existe déjà et **nomme** les cas ; encore faut-il lire la sortie de la collecte au lieu de la lancer les yeux fermés |
| 6 | **La séance suivante a rouvert un arbitrage déjà rendu** (les teintes, le bandeau permanent, le dépliage). | une question qui commence par « et si plutôt… » | les cinq réponses sont dans `memoire/JOURNAL-DECISIONS.md` du 02/09 **et** au §8 du cadrage. Les relire avant de proposer |

## 5. Les fichiers qui comptent

- `CADRAGE-ACCUEIL-FINUBAR.md` — les 6 points, le pre-mortem, les 5 arbitrages
  et leurs réponses, annoté de ce qui a été livré et des écarts assumés.
- `js/adaptateur-finubar.mjs` — module **pur** : la greffe et les signaux.
  `tests/unit-adaptateur-finubar.mjs` le tient (éprouvé rouge).
- `js/finubar-bandeau.mjs` + `css/finubar-bandeau.css` — le bandeau.
- `js/ecran-connexion-ciel.js` — la porte au ciel (ne touche pas à l'auth).
- `finubar/depots.json` — **l'accroche des dépôts au ciel** vit ici, pas dans les
  grains. C'est le fichier à ouvrir pour déplacer une étoile.
- `design/preview-accueil-finubar.html` — la maquette, qui importe désormais le
  vrai adaptateur au lieu d'en porter une copie.
