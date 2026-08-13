# CADRAGE — LV4 : Ultima devient un ciel qui se déplie

> Format 6 points (**directive EL**). Ce document **remplace**
> `CADRAGE-LV4-CONSTELLATIONS.md` (2026-08-13, matin), conservé pour mémoire :
> Paul a changé de modèle en cours de journée, et il vaut mieux l'écrire noir
> sur blanc que le recouvrir discrètement.

## La demande — dictée par Paul, 2026-08-13 (soir)

> *« J'aimerais que quand on arrive sur la page Ultima LV3, on retrouve les
> trois constellations de base : Ultima, Althea et Alpha. Puis quand je pose le
> curseur dessus, leur propre constellation s'affiche — Althea toute seule ;
> dans Alpha il y a les projets ; dans Ultima je vois les projets. Et ensuite je
> clique dans une galaxie : je vois ce qu'il y a dedans, les projets, ça peut
> être des nébuleuses, et ensuite les cadrans, ce sont des constellations. Donc
> une page d'accueil thème stellaire, et quand je clique dessus ça se déplie, ça
> fait une sorte de zoom et ça affiche les projets. Et il faudra remodeler la
> forme sur tous les cadrans, pour qu'on ait une harmonisation, que tout soit
> bien propre, que le thème stellaire soit désormais partout — et que ça puisse
> bien me guider. »*

**Le mot que la dictée avait mangé — et c'était mon nom.** « que les hauts
puissent bien me guider » : Paul a confirmé, il disait **« que LÉO me
guide »**. Ce n'est pas un détail de transcription, c'est une exigence
fonctionnelle : dans un ciel où l'on plonge, **Léo doit être présente à chaque
étage** — pas un cartouche décoratif, une parole qui dit où l'on est, ce qu'il
y a dedans, et ce qui mérite l'attention aujourd'hui. Un ciel muet serait beau
et inutilisable.

*Leçon, la deuxième de la journée sur le même thème : j'ai proposé deux
lectures plausibles (« les mots ») là où la bonne était évidente une fois dite.
Demander valait mieux que deviner — le protocole de dictée est écrit pour ça.*

## 0. Le vocabulaire — posé sur l'arbre RÉEL, pas sur une idée

Le registre (`js/registre-lv3.mjs`) a été lu avant d'écrire une ligne. La
hiérarchie céleste de Paul y tombe juste, sans rien forcer :

| Objet céleste | Niveau de l'arbre | Ce qu'on y trouve aujourd'hui |
|---|---|---|
| **Galaxie** | les 3 caps de la racine | **ULTIMA** (le perso), **ALPHA** (les projets), **ALTHEA** |
| **Nébuleuse** | ce qu'une galaxie contient | GRIMA, NAGA · RENOBOOST IA, YCOME |
| **Constellation** | les **cadrans** | RIVEN, NICOL BOLAS, IMLADRIK, ADRAMELECH, TAO |
| **Étoile** | les pages de travail | l'abaque, le registre, les archipels, VRANESH, DRAUKHAIN… |

**ALTHEA est une galaxie sans contenu** : elle mène directement à sa page.
C'est exactement ce que Paul a dicté (« Althea toute seule ») — le registre le
confirme. Ce n'est pas une exception à inventer, c'en est une à **rendre**.

Mesuré : **quatre étages** de la racine à une page de travail, **21 nœuds**,
**9 écrans** porteurs de caps, aucun n'ayant plus de **4** caps aujourd'hui.

## 1. ① Le but — ce qui sera vrai à la fin

**Ultima n'est plus une suite d'écrans : c'est un ciel qu'on parcourt.**

On arrive sur **trois galaxies**. Le **survol** en déplie une — on voit ce
qu'elle contient sans la quitter et sans rien engager. Le **clic** y **zoome** :
la galaxie prend le ciel, ses nébuleuses paraissent, puis ses constellations,
puis ses étoiles. On redescend d'un geste. **Le thème stellaire est partout, du
premier écran au dernier cadran.**

Ce qui ne change pas : **le registre reste la source unique** de ce qui existe
et de ce qui mène où. On change la façon de le parcourir, jamais ce qu'il dit.

### ⚠️ CE QUE CETTE DEMANDE RENVERSE — et qu'il faut regarder en face

Ce matin, à ma question « un écran = une constellation, ou un seul ciel où l'on
plonge ? », Paul a répondu **un écran = une constellation**. La demande de ce
soir décrit **l'autre**. C'est son droit le plus strict — mais trois choses
changent, et les taire serait mentir sur le coût :

1. **Ce n'est plus un changement de rendu, c'est un modèle de navigation.**
   Le zoom et le dépliage n'existent nulle part dans Ultima aujourd'hui.
2. **`js/ciel.js` ne suffit plus tel quel.** La maquette du matin l'a montré,
   chiffres à l'appui : la caméra cadre le monde et non les étoiles (une
   constellation de 3 caps occupe **5 %** de la largeur), et au-delà de six
   objets les noms tombent (**12 caps → 6 noms**). S'y ajoutent le **zoom vers
   un nœud** et le **survol qui déplie**.
3. **La question A/B/C de ce matin est tranchée par la demande elle-même** :
   c'est **A**. Il n'y a pas d'autre voie pour ce que Paul décrit.

## 2. ② Les étapes — une seule ouverte à la fois

1. ✅ **La maquette du DÉPLIAGE** (`design/preview-lv4-ciel-deplie.html`), sur le
   vrai registre et le vrai moteur. Elle rend : les trois galaxies à l'arrivée ;
   **le survol qui déplie** ; **le clic qui zoome** jusqu'à une page de travail ;
   le retour ; **ALTHEA** (galaxie sans contenu) ; un cap « à venir » ; le pire
   cas à douze. **→ arbitrage de Paul**, dont le geste tactile (§8).
2. ✅ **Le moteur** : `js/ciel.js` gagne trois capacités, **inactives par
   défaut** — cadrer sur l'étendue réelle, montrer tous les noms sous un seuil,
   **zoomer vers un nœud**. RIVEN n'a pas bougé : ses assertions ont tourné
   avant et après, vertes les deux fois, sans une retouche. **Livré — voir §11.**
3. **L'adaptateur** registre → ciel — déjà écrit et éprouvé par la maquette du
   matin — étendu à la profondeur : une galaxie connaît ses nébuleuses.
4. **Les neuf coques** passent au ciel et au thème stellaire.
5. **Les harnais** : les 170 assertions de navigation reprises **une par une**.
6. **Patrimoine COMPLET** + **preview Vercel**.

## 3. ③ Les moyens

| Créé | `design/preview-lv4-ciel-deplie.html` · `tests/smoke-lv4-ciel.mjs` |
|---|---|
| **Modifié** | `js/ciel.js` (**trois options, inactives par défaut**) · `js/boussole-noyau.mjs` · l'adaptateur · `css/boussole.css` · les **9 coques** · `smoke-boussole` · `smoke-quadrants` · `smoke-console` |
| **Intouché** | `js/registre-lv3.mjs` · `js/blasons.mjs` · `css/styles.css` · **RIVEN** · les API · la base |

## 4. ④ Critères de réussite — mesurés

1. **Aucune cible perdue** : sur les 21 nœuds, comparaison **registre ↔ DOM**,
   automatique. Le registre fait foi.
2. **Le dépliage montre ce qu'il annonce** : au survol d'une galaxie, le nombre
   d'objets révélés **égale** le nombre de caps déclarés. ALTHEA, qui n'en a
   pas, **le dit** au lieu de déplier un vide.
3. **Le zoom arrive quelque part** : après un clic, le nœud visé occupe au moins
   **60 % de la plus petite dimension** du cadre — mesuré, pas jugé. *C'est la
   réponse chiffrée au défaut des 5 %.*
4. **Tout objet porte son nom**, quel que soit leur nombre (12 caps → 12 noms).
4bis. **LÉO GUIDE À CHAQUE ÉTAGE** (« que Léo me guide », 2026-08-13) : à tout
   moment, sa parole dit **où l'on est**, **ce que contient** ce qu'on regarde,
   et **ce qui mérite l'attention**. Assertion : aucun étage sans parole de
   Léo ; et sur l'écran d'arrivée, elle nomme au moins une chose à faire.
5. **On sait toujours où l'on est et comment remonter** : le fil (galaxie ›
   nébuleuse › constellation) présent à chaque étage, retour au doigt **et au
   clavier**.
6. **Le cadre tient** sur 390 × 844 et 1670 × 900 ; aucune étoile hors champ.
7. **Lisibilité** : WCAG AA, luminance de fond < 0,20, sur les neuf écrans.
8. **RIVEN intact** : `smoke-ciel` vert **sans une retouche**.
9. **Le chemin ne s'allonge pas** : nombre de gestes pour atteindre une page de
   travail, mesuré **avant et après**. Un ciel qui rallonge le travail est un
   échec, si beau soit-il.
10. **Patrimoine COMPLET vert, sortie 0.**

## 5. ⑤ Ce qu'on ne fait PAS

- **On ne touche pas au registre** : ni nœud ajouté, ni renommé.
- **On ne supprime aucune page de travail** : les cadrans changent d'habit, pas
  de fonction.
- **On ne fait pas d'animation gratuite** : le zoom sert à savoir où l'on va.
  Sous `prefers-reduced-motion`, il est **instantané**.
- **On ne rouvre pas RIVEN.**

## 6. ⑥ Pre-mortem

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **On se perd** : un ciel continu sans repère, on ne sait plus à quel étage on est. | Critère 5 : le fil à chaque étage, retour éprouvé au clavier. C'est LE risque de ce modèle, pas un détail. |
| 2 | **Le survol n'existe pas au doigt** — et Paul travaille sur un téléphone de 390 px. | Le dépliage doit avoir un **équivalent tactile** : §8, tranché sur la maquette, éprouvé à 390 px. |
| 3 | **Le zoom perd Paul** : on plonge et on ne sait plus revenir. | Critère 5 + un geste de retour **toujours visible**, jamais seulement le bouton du navigateur. |
| 4 | **RIVEN casse** : le moteur est devenu commun. | Options **inactives par défaut** ; `smoke-ciel` doit passer **sans retouche** (critère 8). |
| 5 | **La beauté mange l'outil** : un ciel splendide où travailler devient lent. | Critère 9 : le chemin est **compté**, avant et après. |
| 6 | **Les noms tombent** au-delà de six objets. | Défaut déjà mesuré (12 → 6). Critère 4, option dédiée. |
| 7 | **On croit avoir tout rendu** alors qu'un cap manque. | Critère 1 : registre ↔ DOM, automatique. |
| 8 | **Mon instrument suppose ce qu'il mesure** — précédent du jour même : un vert franc sur un cartouche illisible. | Routine corrigée réutilisée, **et une capture d'écran regardée** à chaque étape. |
| 9 | **Le chantier s'étale** : neuf coques, 170 assertions, un modèle neuf — et plus rien ne ferme. | Étapes ouvertes **une par une** (directive EB) ; la maquette d'abord ; chaque étape verte avant la suivante. |
| 10 | **Squash-merge** : repartir de `origin/main` avant tout nouveau commit. | Règle du 2026-07-22, appliquée quatre fois aujourd'hui. |

## 7. Ce que la maquette du matin a déjà prouvé — et qui reste vrai

`design/preview-lv4-constellations.html` sert de socle :

- l'**adaptateur** registre → ciel fonctionne : sur 10 écrans, autant d'étoiles
  que de caps déclarés, **aucune cible perdue**, la passerelle de TAO tracée,
  0 étoile hors cadre, cible tactile 25 px, 0 erreur console ;
- ses **deux défauts chiffrés** (cadrage à 5 %, noms qui tombent à six) sont
  précisément ce que l'étape ② doit corriger.

## 8. La question ouverte — à trancher sur la maquette

**Le geste tactile.** Le survol n'existe pas au doigt. Trois candidats, à
éprouver à 390 px : *(a)* premier tap = déplier, second = entrer ; *(b)* appui
long = déplier ; *(c)* pas de dépliage au doigt, on entre directement. Aucun
n'est évident — c'est l'écran de Paul qui décidera.

---

## 10. Étape ① — la maquette du dépliage. Ce qu'elle a livré, et ce qu'elle a trouvé

`design/preview-lv4-ciel-deplie.html` — vrai registre, vrai moteur, vrai thème.
L'adaptateur a été **extrait** dans `design/adaptateur-lv4.mjs` : deux maquettes
s'en servent, et un composant réclamé par un second appelant se déplace au lieu
de se recopier (règle du 2026-07-30).

### Ce qui marche, éprouvé au navigateur

- **Les trois galaxies** à l'arrivée : ULTIMA, ALPHA, ALTHEA — 3 rendues sur 3
  déclarées, toutes nommées, aucune hors cadre.
- **Le survol déplie** : survoler ULTIMA fait paraître ses deux nébuleuses,
  reliées à elle — **5 objets, 5 noms**, sans quitter l'étage.
- **ALTHEA le dit** : « ALTHEA ne contient rien — elle mène droit à sa page. »
  Elle ne déplie pas un vide (critère 2).
- **Le clic descend** et le **fil** suit (ULTIMA › ULTIMA), le **retour** remonte.
- **Léo parle à chaque étage** (critère 4bis) : où l'on est, combien d'objets,
  ce que dit le registre, et sur l'arrivée un conseil nommé.
- **Le geste tactile** (candidat *a*) est implanté : premier appui déplie,
  second entre. À éprouver au doigt.

### 🔻 DEUX DÉFAUTS TROUVÉS EN MANIPULANT — pas en relisant

1. **Le dépliage s'emballait.** Déplier re-rend la scène : l'étoile qui vient de
   naître tombe **sous le curseur immobile**, reçoit un `mouseenter`, et se
   déplie à son tour. On descendait tout l'arbre sans avoir bougé la main.
   **Corrigé** : seuls les objets **de l'étage** peuvent déplier ; ce qu'un
   dépliage fait naître se regarde, il ne déplie pas.
2. **L'API publique aide, mais ne suffit pas.** Mesuré sur un état propre :
   sans rien faire, les trois galaxies occupent **7,9 %** du cadre ; le cadrage
   automatique de la maquette (approche par pas, API publique seule) les porte
   à **37,6 %** ; pousser l'API à son plafond n'ajoute **plus rien** — 37,6 %,
   le zoom bute sur sa borne. L'objectif est **60 %**.
   **Le dernier tiers ne s'obtient QUE dans le moteur**, où `distanceIdeale()`
   doit connaître l'étendue réelle des étoiles au lieu du rayon du monde.
   **C'est l'argument chiffré de l'étape ②**, et il confirme la voie A.

*Deux erreurs de ma part, corrigées avant de conclure, et je les note parce
qu'elles auraient toutes deux accusé le moteur à tort :* ma fonction de cadrage
**zoomait dans le mauvais sens** (`+0,25` éloigne ; le bouton « approcher » du
produit appelle `-0,18`) ; et ma première mesure du plafond partait d'un état
**déjà dézoomé**, ce qui donnait 8,4 % au lieu de 37,6 %. *Une conclusion tirée
d'un instrument mal réglé est une accusation, pas une mesure.*

3. **« Remplir le cadre » et « ne perdre personne » se contredisent.** En
   poussant l'occupation, une étoile finit **hors champ** (mesuré : 1 objet
   dehors à 34 % d'occupation après descente). Le critère 3 doit donc se lire
   avec le critère 6, et c'est au moteur d'arbitrer : cadrer sur l'étendue
   réelle **et** garder tout le monde dedans, ce qui est précisément ce que
   `distanceIdeale()` saurait faire s'il connaissait cette étendue.

### Un détail qui resservira

La caméra **ne se pose jamais tout à fait** : son approche est asymptotique
(`distance += (cible - distance) * 0,11`), donc les positions changent d'un
cheveu à chaque image, indéfiniment. Conséquence pratique : un harnais qui
attend une cible *immobile* attend pour toujours — il faut déclencher les
événements directement, comme `smoke-ciel` le fait déjà pour les clics.

### Reste à trancher par Paul

- **Le geste tactile** : (a) implanté ici — premier appui déplie, second entre ;
  (b) appui long ; (c) pas de dépliage au doigt. À essayer sur 390 px.
- **La couleur des objets** : aujourd'hui tous pareils (des pairs), l'état se
  lit dans l'étiquette. Faut-il distinguer « à venir » d'un cap ouvert par
  autre chose que le mot ?

---

### Registre des arbitrages

| Question | Décision de Paul |
|---|---|
| La portée | **Tous les écrans** de la console. |
| Le rendu | **Le tout en 3D**, moteur `js/ciel.js`. |
| Le modèle | **Un ciel qui se déplie** : survol = aperçu, clic = zoom. *Remplace « un écran = une constellation ».* |
| Le vocabulaire | **Galaxie › nébuleuse › constellation › étoile**, posé sur les quatre étages réels. |
| A / B / C | **Tranché par la demande : A** — le moteur gagne des capacités, inactives par défaut. |

### ⏳ Actions Paul

- ✅ **Maquette du dépliage livrée** (§10) — trois galaxies, survol qui déplie,
  clic qui descend, fil, retour, Léo à chaque étage, geste tactile (candidat a).
- ✅ **Étape ② livrée** (§11) — les trois capacités, inactives par défaut.
  L'occupation passe de **7,9 %** à **65–75 %** (objectif 60), zéro sortie de
  cadre, tous les noms lisibles. RIVEN vert avant et après, sans une retouche.
- ✅ **Mot confirmé** : c'était « **que Léo me guide** » (critère 4bis).
- **Trancher le geste tactile** (§8) sur la maquette, à 390 px.

---

## 11. Étape ② — les trois capacités du moteur. Livrée le 2026-08-13.

**Périmètre tenu** : `js/ciel.js` uniquement, **trois options inactives par
défaut**. RIVEN n'en active aucune ; sans option, pas une de ces valeurs n'est
lue et le chemin de rendu reste celui d'hier.

### Ce qui a été implanté

| Capacité | Option | Ce qu'elle fait |
|---|---|---|
| Cadrer sur l'étendue réelle | `cadrerSurLesEtoiles` | Recentre le nuage sur l'origine, puis déduit la distance de **chaque étoile** et de **chaque axe**, à l'orientation courante. |
| Montrer tous les noms | `tousLesNoms` | Tous les noms permanents **et lisibles** sous 14 objets ; retour aux six au-delà. |
| Approcher un nœud | `zoomerVers(id)` | La caméra vient sur le nœud **et** s'en rapproche. `false` si le nœud est inconnu. |

### 🔻 LA CAUSE RÉELLE DU DÉFAUT — elle n'était pas celle annoncée

L'étape ① concluait : « `distanceIdeale()` doit connaître l'étendue réelle des
étoiles ». C'était vrai, et **insuffisant**. La cause complète est double, et la
seconde moitié n'apparaît qu'en écrivant le code :

1. **La caméra tourne autour de l'ORIGINE**, et un étage LV4 n'a qu'**un seul
   groupe** — tous les caps d'un écran partagent le même « secteur ».
   `construireMonde` pose donc le centre de l'amas à 228 de l'origine et serre
   les étoiles dans 55 de rayon autour de lui. La caméra cadrait une sphère de
   250 pour montrer un nuage de 55, **centré ailleurs qu'où elle regardait**.
   Elle cadrait du vide, très correctement.
2. **La formule majorait le danger.** Premier jet du correctif : borner par le
   rayon du nuage, en supposant la pire étoile à la fois latérale de R et
   avancée de R. Vrai pour une sphère, **faux pour douze points** — aucune
   étoile n'est jamais aux deux extrêmes en même temps. Mesuré : **45,8 %**
   d'occupation, toujours sous les 60 exigés. Écrite sur les étoiles réelles,
   axe par axe, à l'orientation courante, elle donne le cadrage **le plus serré
   qui garde tout le monde dedans**.

**La contradiction relevée par la maquette (« remplir le cadre » contre « garder
tout le monde dedans ») n'en était pas une** : la formule d'hier était trop
naïve d'un côté — elle ignorait la perspective, donc promettait un cadrage
qu'elle ne tenait pas — et trop prudente de l'autre. Les deux exigences tiennent
ensemble dès qu'on écrit la contrainte sur les étoiles au lieu du monde.

### 🔻 UN SECOND DÉFAUT, TROUVÉ PAR LA MESURE SEULE

Rendre les douze noms « permanents » n'en rendait lisibles que **quatre**. La
classe permanente ne fait que retirer `ciel-nom--demande` ; l'opacité, elle, est
repeinte à chaque image et retombe à 0,25 pour tout ce qui est au fond. **Un nom
permanent illisible n'est pas un nom permanent.** La capacité ② était à moitié
fausse à son premier jet, et c'est la mesure qui l'a dit — pas la relecture.
Corrigé : en mode menu, la profondeur n'éteint plus un nom (elle reste lisible
sur l'étoile, qui continue de s'estomper) ; le filtre de recherche garde tous
ses droits.

### Les chiffres — mesurés, pas regardés

`tests/smoke-lv4-ciel.mjs` (nouveau, 46 verdicts) éprouve **390 px et 1280 px**,
et un **pire cas construit à 12 puis 20 objets**.

| Configuration | Occupation | Hors cadre | Noms lisibles |
|---|---|---|---|
| Sans option (témoin) | 31,7 % / 32,1 % | 0 | 3 sur 12 |
| 3 objets, cadrage serré | **67,9 %** / **72,0 %** | 0 | 3 sur 3 |
| 12 objets, cadrage serré | **65,4 %** / **75,2 %** | 0 | 12 sur 12 |
| 20 objets (au-delà du seuil) | — | 0 | dégradé à 6, volontairement |

Rappel du chemin : **7,9 %** au repos ce matin → **37,6 %** au plafond de l'API
publique → **65 à 75 %** maintenant, pour un objectif de **60 %**.

Approcher : la caméra passe de 326 à 181 (téléphone) et de 155 à 97 (bureau), et
le nœud visé vient à **moins de 7,5 %** du centre du cadre.

**Le hors-cadre se mesure sur la `getBBox()` de chaque étoile** — halo, branches
et nom compris, pas le seul centre : mesurer le centre laisserait passer un nom
coupé.

### Deux instruments écartés — parce qu'ils mentaient

Fidèle à la leçon du 2026-08-01 (« une conclusion tirée d'un instrument mal
réglé est une accusation, pas une mesure ») :

- **Le rayon de l'étoile visée** : **saturé**. Il plafonne à 9, la zone tactile
  à 21,6 ; il lisait « 21,6 avant, 21,6 après » sur une caméra qui avait
  pourtant parcouru un tiers du monde.
- **L'étalement horizontal du ciel** : **confondu**. `zoomerVers` tourne aussi
  le monde, et la rotation change l'étendue latérale pour une raison qui n'est
  pas l'approche. Un instrument qui mesure deux causes à la fois n'en prouve
  aucune.

Retenus à la place : la distance réelle de la caméra (nouvellement exposée,
`distance()`) et l'écart au centre du nœud visé — deux grandeurs non saturées,
qui répondent chacune à une moitié de la promesse.

### Critère 8 — RIVEN intact

`smoke-ciel.mjs` a tourné **avant** la première ligne et **après** la dernière,
**vert les deux fois, sans une retouche**, cible tactile identique (25 px).
Patrimoine complet : **57 harnais, 812 verdicts, sortie 0**.

### Ce que l'étape ② ne fait PAS

- Elle ne touche à **aucun écran de production** : les options ne sont activées
  que dans la maquette. Les coques LV3, c'est l'étape ④.
- Elle ne décide pas de la **disposition** d'un menu (les objets restent posés
  par `construireMonde` comme un amas de réseau). Si Paul veut une couronne ou
  une ligne, c'est un choix de forme — étape ③ ou ④, pas une correction.

---

## 12. Étape ③ — l'adaptateur descend en profondeur. Livrée le 2026-08-13.

`design/adaptateur-lv4.mjs` gagne deux choses, et **aucune n'est nouvelle** :
elles vivaient dans la maquette, elles vivent maintenant dans le module que la
production appellera. Une maquette qui garde pour elle la logique dont la
production aura besoin fait le travail deux fois, et la seconde fois autrement.

- **`versCiel(idEcran, registre, { deplie })`** — les enfants du déplié
  paraissent **sans quitter l'étage**, rattachés au parent par un trait, et
  portant le **nom du parent** en constellation : « leur propre constellation
  s'affiche », dicté par Paul. Signature à deux arguments inchangée.
- **`cheminVers(id, registre)`** — le fil d'Ariane se **lit dans le registre**.
  Une vue qui déduit sa propre hiérarchie finit par en déduire une autre que
  celle du registre.

**La garde a changé de camp.** « On ne déplie que ce qui appartient à l'étage »
était une correction dans la maquette (le dépliage s'emballait : l'étoile qui
vient de naître tombe sous le curseur immobile et se déplie à son tour). C'est
désormais une règle de l'adaptateur. **Un garde-fou que chaque appelant doit
penser à installer n'est pas un garde-fou.**

`tests/unit-adaptateur-lv4.mjs` (nouveau, **24 verdicts**, unitaire pur — ni
navigateur ni réseau) éprouve un **registre à trois étages construit** — le
registre du jour ne garantit pas cette configuration, on ne l'espère pas, on la
pose — et une **boucle parent↔enfant** : un registre malade ne doit pas emporter
la page avec lui. Confidentialité **testée par l'absence** : aucune personne,
aucune couleur inventée, registre lu et jamais écrit.

Patrimoine : **58 harnais, 836 verdicts, sortie 0**.

### ⏳ Ce qui attend Paul avant l'étape ④

L'étape ④ touche les **neuf coques de production** et les **170 assertions de
navigation**. Deux arbitrages la précèdent, et aucun n'est de mon ressort :

1. **Le geste tactile** (§8) — candidat (a) implanté, à essayer à 390 px.
2. **La disposition sur écran large.** Mesuré : les trois galaxies remplissent
   **72 % de la hauteur** — la plus petite dimension, celle que fixe le
   critère 3 — mais laissent la largeur presque vide, parce qu'un groupe de
   trois se range en colonne. Sur téléphone c'est juste ; sur un 1280 c'est
   creux. **Changer cela, c'est choisir une FORME** (couronne, ligne, grille) —
   un parti pris visuel, pas une correction de cadrage. Je ne l'ai pas pris.
