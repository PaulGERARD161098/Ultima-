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
   cas à douze. **Arbitrages rendus** le 2026-08-13 au soir, geste tactile
   compris (§8).
2. ✅ **Le moteur** : `js/ciel.js` gagne trois capacités, **inactives par
   défaut** — cadrer sur l'étendue réelle, montrer tous les noms sous un seuil,
   **zoomer vers un nœud**. RIVEN n'a pas bougé : ses assertions ont tourné
   avant et après, vertes les deux fois, sans une retouche. **Livré — voir §11.**
3. ✅ **L'adaptateur** registre → ciel, étendu à la profondeur : une galaxie
   connaît ses nébuleuses, et le fil d'Ariane se lit dans le registre.
   **Livré — voir §12.**
4. **Les neuf coques** passent au ciel et au thème stellaire. **Cadré en détail
   au §13** — une coque pilote, puis sept, puis la racine.
5. **Les harnais** : les assertions de navigation reprises **une par une**.
   Comptées le 2026-08-13 : **six harnais, ~236 assertions** — et non trois et
   170 comme ce document l'a d'abord écrit (§13.0 ①).
6. **Patrimoine COMPLET** + **preview Vercel**.

## 3. ③ Les moyens

| Créé | `design/preview-lv4-ciel-deplie.html` · `tests/smoke-lv4-ciel.mjs` · `tests/unit-adaptateur-lv4.mjs` |
|---|---|
| **Modifié** | `js/ciel.js` (**trois options, inactives par défaut**) · l'adaptateur · les **9 coques** · les **six** harnais de navigation |
| **Intouché** | `js/registre-lv3.mjs` · `js/blasons.mjs` · `css/styles.css` · **`css/boussole.css`** · **RIVEN** · **VRANESH** · les API · la base |

> **Corrigé le 2026-08-13.** Ce tableau annonçait `css/boussole.css` en
> « modifié » : c'était une erreur, et elle aurait coûté cher. `vranesh.html`
> charge cette feuille et bâtit dessus. Détail et preuve au **§13.0 ②**.

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

## 8. ✅ TRANCHÉ — le geste tactile

**Le geste tactile.** Le survol n'existe pas au doigt. Trois candidats étaient
posés, à éprouver à 390 px : *(a)* premier tap = déplier, second = entrer ;
*(b)* appui long = déplier ; *(c)* pas de dépliage au doigt.

**Décision de Paul, 2026-08-13 au soir — « on valide comme ça » : c'est (a).**
C'est le candidat implanté dans la maquette, celui qu'il a eu sous les yeux.
La question est close ; l'étape ④ le porte tel quel, elle ne le rejuge pas.

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

### ✅ Tranché par Paul le 2026-08-13 au soir

- **Le geste tactile** : **(a)**, tel qu'implanté — premier appui déplie, second
  entre. Voir §8.
- **La disposition** : **la colonne**, telle que mesurée. Sur écran large elle
  remplit 72 % de la hauteur et laisse la largeur creuse ; Paul l'a vue et l'a
  validée. On ne la rejuge pas sans qu'il le demande.
- **La couleur des objets** : reste comme aujourd'hui — tous pareils, des
  pairs, l'état se lisant dans l'étiquette. Aucune seconde vérité chromatique.

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
- ✅ **Étape ③ livrée** (§12) — l'adaptateur en profondeur, sa garde, le fil.
- ✅ **Les deux arbitrages sont rendus** (2026-08-13, « on valide comme ça ») :
  geste au doigt = premier appui déplie / second entre ; disposition = la
  colonne. Ils sortent du registre des questions ouvertes.
- ⏳ **Étape ④ cadrée** (§13) — reste **le go de Paul** sur le découpage
  (pilote → sept → racine) et sur la coque pilote proposée (`ultima.html`).
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

---

# 13. Cadrage détaillé de l'étape ④ — les coques passent au ciel

> Validé par Paul le 2026-08-13 au soir : « **On valide comme ça. Cadre la
> suite.** » Les deux arbitrages ouverts se referment donc sur l'état livré —
> **geste au doigt : premier appui déplie, second entre** ; **disposition : la
> colonne**, telle qu'elle est mesurée. Ils ne sont plus des questions.

## 13.0 Ce que la lecture du réel a corrigé — AVANT de cadrer

Deux chiffres de ce document étaient faux ou incomplets. Ils sont corrigés ici
plutôt que recopiés : *un état qui se recopie de document en document n'est pas
un état vérifié* (leçon du 2026-08-13 sur la migration 0025).

**① Le périmètre des harnais était sous-estimé.** Le §3 nommait trois harnais
(`smoke-boussole`, `smoke-quadrants`, `smoke-console`). Compté : ces trois-là
portent bien **170 assertions** — le chiffre était juste. Mais **trois autres**
tiennent aussi sur la structure de la boussole, et personne ne les avait
comptés :

| Harnais | Assertions | Ce qu'il tient sur la boussole |
|---|---|---|
| `smoke-boussole` | 60 | le moteur lui-même |
| `smoke-quadrants` | 65 | les quadrants |
| `smoke-console` | 45 | la racine |
| `smoke-tao` | 30 | `boussole-parole`, aiguilles, libellé de passerelle |
| `smoke-alpha` | 31 | plateau, cœur, légende, `cap--avenir` |
| `smoke-imladrik-carto` | 25 | plateau, cœur, parole, retour |

**Six harnais, ~236 assertions**, pas trois et 170.

**② `css/boussole.css` NE PEUT PAS être retiré ni réaffecté.** `vranesh.html`
le **charge** et bâtit dessus (`vranesh-boussole.css` « n'ajoute que les… »), et
son plateau utilise la classe `.cap`. VRANESH n'est **pas** une des neuf coques
et **ne passe pas au ciel**. Retirer ou repeindre `.cap` le déshabillerait en
silence — seul `smoke-vranesh` (232 assertions) le verrait. *C'est exactement le
piège du 2026-08-13 : le ciel avait emprunté trois classes à l'arbre, et
supprimer le CSS de l'arbre aurait emporté sa barre d'outils.*

## 13.1 ⚠️ CE QUE LA BOUSSOLE PORTE ET QUE LE CIEL N'A PAS

**Le point dur de l'étape ④, et il n'est pas le rendu.** Remplacer la boussole
par le ciel, ce n'est pas échanger deux dessins : c'est **porter cinq
fonctions**, ou les perdre. Inventaire fait sur `js/boussole-noyau.mjs`, ligne à
ligne, **avant** d'écrire quoi que ce soit — la méthode qui a sauvé sept
assertions lors de la suppression de l'arbre.

| # | Ce que la boussole fait | Le ciel aujourd'hui | Difficulté |
|---|---|---|---|
| 1 | **Le cockpit** — `/api/cockpit` derrière Bearer, comptes vivants dans la parole (« À traiter — 3 relances dues »), **fail-closed** sans session | rien | **la plus haute** : surface de sécurité |
| 2 | **Le blason** — une gravure SVG par cap (`BLASONS`) | une étoile, identique pour tous | moyenne |
| 3 | **Le cœur** — médaillon central (`COEURS`) + **légende gravée** | rien au centre | moyenne |
| 4 | **La passerelle** — arc entre caps jumeaux, **nom gravé sur l'arc** (`lienLibelle`) | un trait droit, sans libellé | moyenne |
| 5 | **Le cap « à venir »** — `role=button`, `aria-disabled`, tabulable, Entrée/Espace montre le résumé **sans naviguer** | l'étoile est cliquable comme les autres | basse, mais **accessibilité** |

S'y ajoute `noeud.expose` → `window[…] = { noms }`, l'introspection dont les
harnais se servent. Elle doit survivre au changement de moteur, sinon ce sont
les harnais eux-mêmes qui s'aveuglent.

**Le cockpit est le seul point qui touche la sécurité** : Bearer, `/api/cockpit`,
comptes entiers, jamais de PII. La règle ne bouge pas — **sans session ou en cas
d'échec, on retombe silencieusement sur le texte figé**. Un port qui perdrait le
fail-closed serait un défaut de sécurité, pas d'ergonomie.

## 13.2 ① Le but — ce qui sera vrai à la fin

Les **neuf coques** (`index`, `ultima`, `alpha`, `grima`, `naga`, `bcp`, `tao`,
`imladrik`, `adramelech`) rendent leur nœud **en ciel**, thème stellaire, avec
le dépliage au survol, le zoom à l'entrée, le fil d'Ariane et **Léo à chaque
étage**. **Les cinq fonctions ci-dessus sont portées, pas perdues.** VRANESH,
DRAUKHAIN et RIVEN ne bougent pas. Le registre ne bouge pas.

## 13.3 ② Les étapes — une coque d'abord, les huit autres ensuite

**Pas de big-bang sur neuf écrans.** « Pas dix lièvres à la fois » vaut ici plus
qu'ailleurs : neuf coques changées d'un coup, c'est six harnais rouges d'un coup
et aucun moyen de savoir lequel accuse quoi.

1. **④a — LA COQUE PILOTE : `ultima.html` (`ultima-perso`).** Choisie parce
   qu'elle **cumule le plus de fonctions à porter** : `cockpit: true`, un cœur,
   une légende, des caps liés, des caps « à venir ». *Si le ciel porte
   `ultima-perso` en entier, il porte les huit autres.* Le pilote livre aussi le
   **module de rendu** (`js/ciel-noeud.mjs`) que les huit reprendront tel quel.
2. **④b — Les sept coques ordinaires**, une par une, sur le module éprouvé.
3. **④c — LA RACINE (`index.html`) EN DERNIER.** C'est la console à quatre
   quadrants, 220 lignes, la seule à porter du mobilier propre (bandeau
   « Bienvenue sur Ultima »). C'est aussi **l'écran que Paul juge**. On y arrive
   avec un module déjà éprouvé huit fois, pas avec un module qui s'invente.
4. **④d — Les six harnais**, repris **un par un** — voir §13.5 et §13.6.
5. **④e — Patrimoine COMPLET + preview Vercel.**

## 13.4 ③ Les moyens

| Créé | `js/ciel-noeud.mjs` (le rendu d'un nœud en ciel — l'équivalent de `boussole-noyau` côté ciel) · `css/ciel-noeud.css` |
|---|---|
| **Modifié** | les **9 coques** · `design/adaptateur-lv4.mjs` (blasons, cœur, cockpit) · `js/ciel.js` **si et seulement si** une fonction ne peut pas être portée par-dessus |
| **Intouché** | `js/registre-lv3.mjs` · `js/blasons.mjs` · `css/styles.css` · **`css/boussole.css`** (VRANESH s'en sert) · **`js/boussole-noyau.mjs`** tant que les neuf coques ne sont pas passées · RIVEN · VRANESH · DRAUKHAIN · les API · la base |

**`js/boussole-noyau.mjs` ne se supprime qu'à la toute fin**, et seulement si
plus aucune page ne l'appelle — vérifié par recherche, pas supposé.

## 13.5 ④ Critères de réussite — mesurés

1. **Aucune cible perdue** : pour chacune des 9 coques, comparaison
   **registre ↔ DOM**, automatique. Le registre fait foi.
2. **Les cinq fonctions sont portées** : une assertion **par fonction et par
   coque concernée**. Le cockpit s'éprouve **avec session et sans** — et *sans*
   doit donner le texte figé, jamais une erreur ni un vide.
3. **Le cap « à venir » reste inerte au clavier** : Entrée/Espace montre le
   résumé et **ne navigue pas**. Éprouvé au clavier, pas à la souris.
4. **`noeud.expose` survit** : les globaux d'introspection existent et disent
   les mêmes noms qu'avant.
5. **VRANESH INTACT** : `smoke-vranesh` (232 assertions) vert **sans une
   retouche**. Même promesse que le critère 8 pour RIVEN, même méthode : il
   tourne **avant** la première ligne et **après** la dernière.
6. **Le cadre tient** : 390 × 844 et 1670 × 900, occupation ≥ 60 %, **zéro
   sortie de cadre** — `getBBox()` contre `viewBox`, étiquettes de constellation
   comprises.
7. **Lisibilité** : WCAG AA, luminance de fond < 0,20, sur les neuf écrans.
8. **Le chemin ne s'allonge pas** : gestes pour atteindre une page de travail,
   comptés **avant et après**, coque par coque. *Un ciel qui rallonge le travail
   est un échec, si beau soit-il.*
9. **Patrimoine COMPLET vert, sortie 0.**

## 13.6 ⑤ Ce qu'on ne fait PAS

- **On ne touche pas au registre** : ni nœud ajouté, ni renommé, ni recâblé.
- **On ne passe pas VRANESH, DRAUKHAIN ni RIVEN au ciel.** Ce sont des pages de
  travail, pas des étages de navigation. RIVEN a **déjà** son ciel, et c'est le
  ciel d'un réseau, pas d'un menu.
- **On ne supprime pas `css/boussole.css`** (§13.0 ②).
- **On ne réécrit pas les 236 assertions d'un bloc** : une par une, en disant
  pour chacune si elle est **portée**, **remplacée** ou **abandonnée** — et si
  elle est abandonnée, **pourquoi**, écrit.
- **On n'invente aucune couleur ni aucun mot** déjà présents dans le produit.
  *Deux fois cette semaine j'ai réinventé ce qui existait — les couleurs de
  type, puis le message d'état vide — et présenté ma version comme un
  arbitrage à rendre.*
- **On ne fusionne rien dans `main`** sans le go de Paul.

## 13.7 ⑥ Pre-mortem — « l'étape ④ a échoué : pourquoi ? »

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **VRANESH se déshabille en silence** : on a retouché `.cap` ou `boussole.css`. | `boussole.css` déclaré intouchable (§13.6) ; `smoke-vranesh` avant/après. |
| 2 | **Le cockpit tombe** : plus de comptes vivants, ou pire, il ne **fail-close** plus et laisse fuir une erreur serveur. | Critère 2 : éprouvé **avec ET sans session**. La règle fail-closed est recopiée telle quelle, pas réécrite. |
| 3 | **Un cap « à venir » devient cliquable** et emmène sur une page qui n'existe pas. | Critère 3, au clavier. |
| 4 | **Les blasons disparaissent** et tous les caps deviennent des points identiques : la console perd son vocabulaire visuel. | Fonction 2 de l'inventaire, assertion dédiée. |
| 5 | **Le chemin s'allonge** : il faut désormais deux gestes là où il en fallait un. | Critère 8, compté avant/après. C'est le critère qui peut faire **abandonner** l'étape. |
| 6 | **Big-bang** : neuf coques d'un coup, six harnais rouges, aucun coupable identifiable. | §13.3 : une coque pilote, puis sept, puis la racine. |
| 7 | **Le module s'invente sur la racine** — l'écran le plus particulier sert de modèle aux huit autres. | La racine passe **en dernier**. |
| 8 | **Une assertion est abandonnée en douce** parce qu'elle gênait. | Chaque assertion est classée portée / remplacée / **abandonnée avec sa raison écrite**. |
| 9 | **On mesure au mauvais étalon** : l'occupation se juge sur un cadre différent d'un écran à l'autre. | Étalon unique, celui de `smoke-lv4-ciel`, inchangé. |
| 10 | **Léo se tait** sur un étage. | Critère 4bis du §4 : aucun étage muet, assertion par coque. |
| 11 | **Le ciel oublie le repli à plat.** Paul l'a demandé pour RIVEN (« si je n'ai pas assez de réseau ») ; il vaut pour les neuf. | `plat()` existe déjà : le module pilote le câble, assertion dédiée. |
| 12 | **Une PII se glisse dans un ciel de navigation.** | Éprouvé **par l'absence**, comme l'adaptateur l'est déjà : aucune personne, aucun rattachement. |

## 13.8 Le gate — ce qui doit être vrai avant d'écrire la première ligne

- ✅ L'inventaire des cinq fonctions est fait (§13.1), sur le code, pas de mémoire.
- ✅ Le périmètre réel des harnais est compté (§13.0 ①).
- ✅ Le piège `boussole.css` / VRANESH est identifié (§13.0 ②).
- ⏳ **Le go de Paul sur le découpage** (§13.3) et sur la **coque pilote**.

---

## 14. Étape ④a — la coque pilote au ciel. Livrée le 2026-08-13.

`ultima.html` est la première coque à quitter la boussole. **Les six fonctions
de l'inventaire §13.1 sont portées**, et le patrimoine est vert.

| # | Fonction | Ce qu'elle est devenue |
|---|---|---|
| ① | **Cockpit** | Réutilisé tel quel (`js/cockpit-parole.mjs`), **fail-closed compris** — éprouvé avec session ET sur erreur 500. |
| ② | **Blasons** | **Déplacé** : la gravure paraît dans le cartouche à l'approche, au lieu d'être peinte sur le cap. Un disque de parchemin clair au milieu d'une nuit perdrait la gravure et le registre. |
| ③ | **Cœur + légende** | **Déplacé** : le médaillon descend en sceau dans l'angle (au centre, il disputait la place aux étoiles — vu sur capture) ; la légende reste, sous le ciel. |
| ④ | **Passerelle** | Le trait entre caps liés est tracé par le moteur. `ultima-perso` n'a pas de caps jumeaux : **le libellé d'arc reste à porter sur une coque qui en a** (GRIMA, NAGA). |
| ⑤ | **Cap « à venir »** | **Porté** : `aria-disabled`, atteignable au clavier, Entrée montre le résumé et ne navigue pas. Éprouvé sur un registre construit — `ultima-perso` n'a aucun cap à venir, la fonction aurait été déclarée portée sans jamais tourner. |
| ⑥ | **Repli `<noscript>`** | **Intact** — et il a failli disparaître : le moteur VIDE son conteneur à chaque dessin. Il vit désormais dans le plateau, à côté de la scène. Personne ne l'aurait vu partir : on ne le regarde qu'avec JavaScript désactivé. |

### 🔻 CE QUI EST PERDU — et qui est écrit ici pour que personne ne le découvre

**Le clic du milieu, « ouvrir dans un nouvel onglet », « copier l'adresse ».**
La boussole faisait de chaque cap un `<a href>` ; l'étoile est un
`<g role="button">`. On a **essayé** de garder le lien en enveloppant chaque
étoile d'une ancre SVG. Mesuré : **enveloppée, l'étoile perd le focus clavier**
— il retombe sur `body` dans l'instant, là où le ciel nu le garde (comparaison
faite sur RIVEN, même geste). **Le clavier passe avant le clic du milieu**,
l'ancre a été retirée. Ce qui reste : le repli `<noscript>` liste toutes les
portes, et les harnais éprouvent désormais chaque cible **en cliquant**, ce qui
est une preuve plus forte qu'un attribut lu.

### Cinq défauts trouvés, et comment

1. **Le repli `<noscript>` allait être effacé** par le premier rendu. Trouvé en
   RELISANT le moteur avant de lancer la page.
2. **`body.boussole` battait `stellaire.css`** (0,1,1 contre 0,0,1) : le thème
   ne s'appliquait pas. Et `.boussole-scene` étirait la scène à **2275 px**.
   La coque ne se réclame plus de la boussole.
3. **Les jetons de nuit de `ciel.css` sont portés par `.espace-ciel`**, la coque
   de RIVEN — pas par `:root`. Une page qui charge la feuille sans cette classe
   perd TOUT le régime chromatique **en silence**, car elle a l'air sombre grâce
   au `body`. Le sélecteur s'allonge ; les valeurs ne se recopient pas.
4. **Le focus clavier se détruisait lui-même** : atteindre un cap au clavier le
   dépliait, le dépliage reconstruit la scène, et l'élément focalisé
   disparaissait. Le focus lui est désormais rendu après le re-dessin.
5. **Le cartouche recouvrait le bas de la scène** (`position: fixed` de la
   boussole) puis débordait à gauche (`translateX(-50%)` résiduel). Les deux vus
   sur capture, corrigés dans la feuille de la coque — `boussole.css` intacte.

### Le cadrage a encore appris quelque chose

Le pire cas **le plus petit** manquait : `smoke-lv4-ciel` éprouvait 3, 12 et 20
objets ; `ultima-perso` en a **DEUX**, et deux objets se rangent aux extrémités
du cadre — la configuration la plus tendue pour le bord. Le nom du cap du bas
touchait le filet. S'y est ajouté le pire cas **latéral** (noms de 20
caractères) : il a répondu **93,7 unités de débord**, et démoli au passage un
raisonnement — « le nom est centré, donc sa moitié suffit ». Une constante ne
peut pas borner une largeur de texte : **la marge latérale se MESURE** sur les
libellés peints, et sur un écran étroit c'est **la police qui cède avant la
caméra**, parce que reculer éloigne les étoiles sans jamais rétrécir leurs noms.

### Assertions reprises — classées, aucune perdue en silence

`smoke-boussole` (5), `smoke-quadrants` (4), `smoke-console` (9) : **portées**
quand le sélecteur seul changeait, **remplacées** quand le support changeait
(les devises se disent maintenant au survol ; les contrastes se mesurent sur la
nuit et non sur le parchemin), **une seule abandonnée** — « une aiguille par
cadran » : l'aiguille joignait le centre de la rose à un cap, et un ciel n'a pas
de moyeu. Elle est remplacée par le contrôle qu'elle approchait, « une étoile
par cadran ». L'**ordre** des caps est abandonné partout, avec sa raison : une
constellation range par géométrie, pas par liste.

Nouveau : `tests/smoke-lv4-coque.mjs` — une entrée par fonction portée.
Patrimoine : **59 harnais, sortie 0**.

### ⏳ Ce qui reste pour finir l'étape ④

- **④b — les sept coques ordinaires**, sur le module éprouvé.
- **④c — la racine**, en dernier.
- Le **libellé de passerelle** (fonction ④) sur une coque qui a des caps
  jumeaux : `ultima-perso` n'en a pas.
- La **disposition en colonne** sur écran large reste celle que Paul a validée ;
  elle laisse la largeur creuse et se rouvrira s'il le demande.
