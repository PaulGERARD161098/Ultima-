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

1. **La maquette du DÉPLIAGE** (`design/preview-lv4-ciel-deplie.html`), sur le
   vrai registre et le vrai moteur. Elle rend : les trois galaxies à l'arrivée ;
   **le survol qui déplie** ; **le clic qui zoome** jusqu'à une page de travail ;
   le retour ; **ALTHEA** (galaxie sans contenu) ; un cap « à venir » ; le pire
   cas à douze. **→ arbitrage de Paul**, dont le geste tactile (§8).
2. **Le moteur** : `js/ciel.js` gagne trois capacités, **inactives par défaut** —
   cadrer sur l'étendue réelle, montrer tous les noms sous un seuil, **zoomer
   vers un nœud** (la caméra sait déjà viser : `viser()` existe). RIVEN ne bouge
   pas : ses **54 assertions** tournent avant et après.
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
- 🔴 **L'étape ② est justifiée par la mesure** : l'API publique plafonne à
  **37,6 %** d'occupation là où il en faut **60**. Le cadrage se corrige dans le
  moteur, options inactives par défaut, RIVEN protégé par ses 54 assertions.
- ✅ **Mot confirmé** : c'était « **que Léo me guide** » (critère 4bis).
- **Trancher le geste tactile** (§8) sur la maquette, à 390 px.
