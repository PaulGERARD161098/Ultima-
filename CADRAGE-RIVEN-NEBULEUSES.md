# CADRAGE — RIVEN en nébuleuses : à plat et en 3D, groupé par grand secteur

> Format 6 points (**directive EL**). Demande de Paul, **2026-09-30**, après
> l'entrée des 39 contacts du Club de la Concorde : *« je ne vois pas trop les
> étoiles nouvelles, il y a trop d'overlap : créons des nébuleuses par secteur
> d'activité, qui regroupent les domaines, et dedans il doit y avoir les
> étoiles »*. Deux aperçus lui ont été montrés (A : nébuleuses ; B : que les
> étoiles). Sa réponse : *« A, go pour cadrer la boucle. J'aime ta maquette,
> gardons ce format. »* Puis, le même jour : *« Je veux à plat et en 3D. »*
>
> ✅ **Boucle ouverte le 30/09** : Paul a vu l'aperçu des deux vues, puis a
> écrit *« Go. Fais toute la suite jusqu'à la fin de la modélisation des
> nébuleuses, qu'elles soient en ligne. »* Les recommandations en attente sont
> donc prises : la carte à plat s'ouvre par défaut, les neuf nébuleuses sont
> celles du §1. L'exécution est consignée au §7.

---

## 0. Ce qui existe — mesuré le 30/09, pas supposé

**La base** (lecture seule, projet Ultima, remesurée le 30/09 après l'ajout
des 4 cartes du salon BATIMAT) : **54 fiches**, **40 secteurs distincts**,
**4 fiches sans secteur**, **1 relation**, **1 rattachement** (une personne
rattachée à une fiche), 43 personnes. La maquette, elle, a été construite sur les
50 fiches d'avant ce dernier ajout.

**Le Ciel actuel de RIVEN** : `js/ciel.js` (2 071 lignes). Chaque secteur
distinct y devient un amas sur une sphère 3D (`grouper` → `construireMonde`).
Trente-sept secteurs donnent trente-sept amas de une ou deux étoiles, dont les
libellés se recouvrent. C'est le constat de Paul.

**`js/ciel.js` est partagé, largement.** Dix pages le chargent : `adramelech`,
`alpha`, `bcp`, `imladrik`, `index`, `omega`, `riven`, `stellar-v2`, `tao`,
`vranesh`. `js/ciel-noeud.mjs`, `js/leo-navigation.mjs` et `js/vranesh.js`
s'en servent, ainsi que six aperçus de `design/`. RIVEN l'appelle depuis
`js/app.js` (`rendre(scene, …)` avec `surClicNoeud`, `surClicPersonne`,
`correspond`, `plat`, `fond`, `stellarV2`). **Et une autre séance le modifie
en ce moment** : la PR #315 (brouillon, IFULVIN) y ajoute une option
`nebuleuses`, qui peint des brumes autour d'étoiles restées en 3D, pour
IMLADRIK.

**La maquette validée** : deux fichiers HTML autonomes, construits sur les 50
fiches réelles, **gardés hors du dépôt** parce que la liste du cocktail est
confidentielle. Ce qui y a été mesuré au navigateur (Chromium, 1 280 et 390 px
de large) :
- 9 nébuleuses, 50 étoiles, 0 erreur de console ;
- **0 chevauchement de noms** dans chacune des 9 nébuleuses approchées, aux
  deux largeurs. La mesure a été éprouvée sur un cas connu : l'aperçu B, sur
  390 px, en montre 22 ;
- les titres restent lisibles sur 390 px grâce à des noms courts
  (« Conseil & services », « Industrie & tech »…).

### ✅ La décision de Paul — les deux vues

Le 12/08, Paul avait retenu **« le modèle 3D pour tout RIVEN »**
(`CADRAGE-RIVEN-STELLAIRE.md`). Le 30/09, il a d'abord écrit « gardons ce
format » sous la maquette à plat. Interrogé sur ce que cela voulait dire, il a
tranché : **« Je veux à plat et en 3D. »**

**Le volume 3D reste donc dans RIVEN** : la décision du 12/08 tient. La carte
à plat s'y **ajoute**, avec les mêmes neuf nébuleuses. Un seul bouton passe de
l'une à l'autre. La boucle se découpe en **deux lots** :
- **Lot 1 — à plat.** La carte de la maquette, dans un module à part.
  `js/ciel.js` n'est pas touché. Il peut démarrer tout de suite.
- **Lot 2 — en 3D.** Les neuf nébuleuses dans le volume actuel. Il touche
  `js/ciel.js`, que #315 modifie en ce moment. **Il ne démarre qu'après la
  fusion de #315**, et part de son option `nebuleuses` au lieu d'en écrire une
  seconde.

---

## 1. ① Le but — ce qui sera vrai à la fin

**Dans RIVEN, onglet Ciel, Paul voit ses contacts en neuf nébuleuses, à plat
ou en 3D, trouve une étoile nouvelle en deux gestes, et lit chaque nom sans
qu'aucun en recouvre un autre.**

0. **Deux vues, un bouton.** Le bouton « À plat » actuel devient « À plat /
   3D ». Les deux vues montrent **les mêmes neuf nébuleuses**, et chaque étoile
   est dans la même nébuleuse de l'une à l'autre. Le choix est retenu d'une
   visite à l'autre, comme aujourd'hui. Et comme aujourd'hui, si l'appareil
   demande moins d'animation, la vue à plat s'impose, et l'approche se fait
   sans mouvement.

**À plat (lot 1)** — la maquette :

1. **Vue d'ensemble** : les 9 nébuleuses de la maquette, chacune avec son
   titre et le nombre de ses étoiles (le nom court sous 600 px de large).
   Aucun titre n'en recouvre un autre.
2. **S'approcher** : toucher une nébuleuse, ou l'atteindre au clavier puis
   appuyer sur Entrée, la cadre. Les noms de ses étoiles apparaissent,
   **jamais superposés**. Le panneau liste ses domaines, puis sous chacun ses
   étoiles, et les personnes rattachées à ces fiches.
3. **Ouvrir** : toucher une étoile d'une nébuleuse approchée ouvre sa fiche,
   exactement comme aujourd'hui (`surClicNoeud`). Une personne du panneau
   ouvre sa fiche personne (`surClicPersonne`).
4. **Revenir** : « Tout voir », ou la touche Échap, ramène à la vue
   d'ensemble.
5. **Chercher** : le champ de recherche garde son rôle. Les étoiles qui
   correspondent restent vives, les autres s'éteignent. Si elles tiennent
   toutes dans une seule nébuleuse, le Ciel s'en approche.
6. **Ne rien perdre de ce qui s'affiche aujourd'hui** : la relation (un trait
   fin entre deux étoiles) et les personnes rattachées (dans le panneau).

**En 3D (lot 2)** — le volume actuel, regroupé :

7. Les étoiles se groupent par **nébuleuse** au lieu de se grouper par
   secteur : **neuf amas au lieu de quarante et un** (quarante secteurs, plus
   le groupe des fiches sans secteur). Chaque amas baigne dans sa
   brume, de la teinte de sa nébuleuse.
8. Tout ce que le volume sait faire aujourd'hui reste : tourner, approcher,
   dérive lente, recherche, ouvrir une fiche d'un toucher.
9. Sur les autres écrans qui utilisent `ciel.js`, **rien ne change**.

**Les neuf nébuleuses, et ce qu'elles regroupent** (base du 30/09) :

| Nébuleuse | Étoiles | Domaines regroupés (secteurs saisis) |
|---|---|---|
| Conseil & services aux entreprises | 11 | Conseil, Conseil - …, Audit, Recouvrement, Recrutement, Services - finances |
| BTP & rénovation | 12 | BTP - …, Tuyautiste, Isolation - …, CVC, Ventilation - …, Rénovation - IA |
| Industrie & technologie | 6 | Aéronautique…, Holding industrielle, Ingénierie, Logiciel, Technologie |
| Institutions & associatif | 5 | Politique, Études, Associatif, Médico-social, Défense (ajoutée le 02/10, décision de Paul) |
| Médias & édition | 6 | Médias…, Édition |
| Énergie & environnement | 4 | Énergie…, Environnement |
| Finance & banque | 3 | Banque…, Finance - … |
| Commerce, luxe & arts | 3 | Retail, Luxe, Art |
| À classer | 4 | fiches sans secteur, et tout secteur que la table ne reconnaît pas |

La correspondance se fait sur **le début du secteur saisi**, sans casse ni
espaces superflus : « Conseil - direction financière » va dans Conseil. Un
secteur inconnu ne se perd pas : il tombe dans « À classer », qui est **visible
et compté**.

---

## 2. ② Les étapes

### Lot 1 — à plat

0. **Inventaire des harnais.** Quinze harnais `tests/smoke-*.mjs` ouvrent
   `riven.html` et parlent d'étoiles ou du Ciel. Relever, un par un, les
   contrôles qui touchent au bouton « à plat » et au mode à plat actuel, que le
   lot 1 remplace. **Ce relevé fixe la taille réelle du lot** : il se fait
   avant la première ligne de code.
1. **La maquette entre au dépôt, sans donnée réelle** :
   `design/preview-riven-nebuleuses.html`, alimentée par les données de
   démonstration de l'application et par une série fictive de 50 fiches aux
   noms de longueur réelle. C'est elle que les harnais ouvrent.
2. **La logique pure, testée seule.** La table des neuf nébuleuses, les
   règles secteur → nébuleuse et le placement des étoiles vivent dans une
   fonction sans DOM, **lue par les deux vues** (le lot 2 la reprendra telle
   quelle) : `tests/unit-riven-nebuleuses.mjs`. Les 40 secteurs du
   30/09 tombent chacun dans la nébuleuse attendue ; le vide et l'inconnu dans
   « À classer ».
3. **Le module de rendu** : `js/ciel-nebuleuses.js`, exposé en global comme
   `ciel.js` et injecté sans `innerHTML`. Il reprend les options dont RIVEN se
   sert : `surClicNoeud`, `surClicPersonne`, `correspond`, `libellesType`, et
   `choisir()` pour la fiche courante.
4. **Le branchement dans RIVEN** : en vue à plat, `js/app.js` appelle le
   nouveau module ; en vue 3D, il appelle `ciel.js` comme aujourd'hui. Le
   bouton « À plat » devient « À plat / 3D ». « Dérive lente » ne s'affiche
   qu'en 3D, où elle a un objet. Le texte d'aide suit la vue affichée.
5. **Le harnais** : `tests/smoke-riven-nebuleuses.mjs`, à 390 et à 1 280 px.
   Il reprend l'instrument de mesure des chevauchements de la maquette.
6. **Les harnais relevés à l'étape 0** sont réécrits pour le nouveau Ciel,
   dans le même lot. Aucun n'est désactivé ni sauté.
7. **Vérification** : `npm test`, `bash tests/lancer.sh` en entier, en local.
   Puis la preview Vercel, que **Paul regarde sur son téléphone**.

### Lot 2 — en 3D (après la fusion de #315)

8. **Un aperçu 3D d'abord**, comme pour la maquette à plat : le moteur actuel,
   les fiches regroupées par nébuleuse, montré à Paul avant le code.
9. **Une seule option ajoutée à `ciel.js`** : regrouper selon une fonction
   donnée, au lieu du secteur. **Sans cette option, le comportement ne change
   pas d'un pixel** : c'est ce qui protège les dix pages qui chargent
   `ciel.js`. Les brumes viennent de l'option `nebuleuses` apportée par #315,
   alimentée par la table commune.
10. **Harnais 3D** : neuf amas au lieu de quarante et un ; même nébuleuse pour chaque
    étoile dans les deux vues ; les autres consommateurs de `ciel.js` inchangés.
11. **Vérification** : comme l'étape 7, puis la preview, que Paul regarde.

---

## 3. ③ Les moyens

| Touché | Quoi |
|---|---|
| `js/ciel-nebuleuses.js` | lot 1, nouveau : la vue à plat (rendu SVG, interactions, clavier, ARIA) |
| la table des neuf nébuleuses | lot 1, nouvelle : un seul fichier, lu par les deux vues et par le test unitaire |
| `js/app.js` | le branchement de l'onglet Ciel (une quarantaine de lignes) |
| `riven.html` | la balise du module, la barre d'outils du Ciel |
| `css/ciel.css` | les styles des nébuleuses et du panneau, sur les jetons existants |
| `design/preview-riven-nebuleuses.html` | la maquette, données fictives |
| `tests/unit-riven-nebuleuses.mjs`, `tests/smoke-riven-nebuleuses.mjs` | nouveaux |
| harnais de l'étape 0 | réécrits |
| **`js/ciel.js`** | **lot 1 : intouché. Lot 2 : une option de regroupement, sans effet quand elle est absente** |

**Pas de base, pas d'API, pas de migration** : aucun gate SQL. Les données
arrivent déjà par `GET /api/reseau`.

**Qui fait quoi** : `front-carto` implémente, `graphisme` valide la palette
des neuf teintes (contraste des titres sur la brume), `interface-ux` juge les
parcours (approcher, ouvrir, revenir, chercher), `verificateur` éprouve le
tout de bout en bout.

---

## 4. ④ Les critères de réussite — vérifiables

| # | Critère | Comment on le sait |
|---|---|---|
| C1 | Les 40 secteurs du 30/09 tombent dans leur nébuleuse ; seules les 4 fiches sans secteur sont « À classer » | test unitaire |
| C2 | Vue d'ensemble : 0 titre de nébuleuse recouvert, à 390 et à 1 280 px | harnais, mesure des boîtes réellement peintes |
| C3 | Chaque nébuleuse approchée : **0 nom recouvert**, à 390 et à 1 280 px | harnais — et le **sabotage** du placement le fait virer au rouge |
| C4 | Une étoile touchée ouvre sa fiche ; une personne du panneau ouvre la sienne | harnais |
| C5 | Au clavier : Tab atteint les nébuleuses, Entrée approche, Tab parcourt les étoiles, Entrée ouvre, Échap revient ; noms à 12 px au moins, cibles tactiles de 24 px au moins | harnais |
| C6 | Lot 1 : `js/ciel.js` n'a pas bougé d'un octet. Lot 2 : il n'a gagné qu'une option, et sans elle les autres pages se comportent à l'identique. Toute la suite `tests/lancer.sh` est verte | `git diff --stat`, harnais des autres consommateurs, sortie du lanceur |
| C7 | Aucune erreur de console ; aucune tâche de plus de 50 ms pendant l'animation d'approche, en émulation mobile | harnais (`PerformanceObserver` longtask) |
| C8 | Paul valide la preview sur son téléphone, pour chaque lot | son go |
| C9 | Chaque étoile est dans la même nébuleuse à plat et en 3D | test unitaire sur la table commune, harnais du lot 2 |
| C10 | Le bouton « À plat / 3D » bascule d'une vue à l'autre, et le choix est retenu | harnais |

---

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **Les nébuleuses des autres écrans** : ALPHA, OMEGA, IMLADRIK. Pour
  IMLADRIK, c'est #315, portée par une autre séance.
- **Reclasser un secteur depuis l'interface**, ou ranger la table en base. La
  table vit dans le code pour cette boucle. Si Paul veut un jour reclasser
  lui-même, ce sera une boucle à part, avec migration, donc un gate.
- **Les 42 personnes non rattachées** comme étoiles à part : elles sont
  représentées par leurs fiches, et restent dans Contacts → Personnes.
- **La recherche sur les notes** (trouver « Concorde ») : petite évolution
  distincte, déjà signalée à Paul.
- **Toute modification des secteurs saisis.**

---

## 6. ⑥ Le pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| **Conflit avec #315**, qui modifie `ciel.js` en parallèle | Lot 1 : module à part, `ciel.js` intouché (C6). Lot 2 : ne démarre qu'après la fusion de #315, et réutilise son option `nebuleuses`. |
| **#315 ne fusionne pas**, et le lot 2 attend indéfiniment | Le lot 1 se livre seul. L'attente du lot 2 est inscrite au registre des gestes de Paul, avec sa raison. |
| **Les deux vues divergent** : une étoile rangée dans une nébuleuse à plat et dans une autre en 3D | Une seule table, lue par les deux vues (C9). |
| **Les harnais du Ciel 3D virent au rouge**, et on découvre la taille réelle en cours de route | Inventaire à l'étape 0, avant le code ; réécriture dans la même boucle, jamais de test sauté. |
| **Un réseau plus grand** (l'import iPhone prévoit ~500 contacts) : à 100 étoiles dans une nébuleuse, « 0 chevauchement » devient impossible à 12 px | Règle posée dès maintenant : **un nom ne se superpose jamais. S'il n'a pas de place, il se cache, et le panneau le donne.** Le harnais tourne aussi sur une série fictive de 300 fiches. |
| **Les brumes font saccader l'approche sur téléphone** : le filtre de turbulence recalculé à chaque image | Brumes peintes une fois, puis déplacées comme une image pendant le mouvement ; mesuré (C7). |
| **Un secteur nouveau disparaît en silence** | Il tombe dans « À classer », visible et compté ; le test unitaire fige les 40 secteurs du jour. |
| **On perd ce que le Ciel montre aujourd'hui** | La relation reste un trait, les personnes rattachées restent dans le panneau (§1, point 6). |
| **« Gardons ce format » mal lu** (à plat ou en 3D) | Tranché par Paul le 30/09 : les deux (§0). |
| **Une donnée réelle entre au dépôt** par la maquette ou une fixture | Maquette et fixtures fictives ; la maquette aux vraies données reste hors dépôt. |

---

## 7. L'exécution — 30/09

**#315 était déjà fusionnée** (par #316) à l'ouverture de la boucle : son
option `nebuleuses` et ses brumes étaient dans `main`. Le lot 2 n'avait donc
plus à attendre, et les deux lots ont été menés ensemble.

**Étape 0, mesurée** : un seul harnais testait le mode à plat
(`smoke-ciel.mjs`, section 14) ; treize ouvraient le Ciel de RIVEN.

**Ce qui a changé en route, et pourquoi :**
- **La table reconnaît les corps d'état** (Menuiserie, Plomberie, Électricité,
  Toiture, Chauffage, Maçonnerie…) et « Courtage ». Les données de
  démonstration tombaient toutes dans « À classer » ; ce sont les métiers des
  artisans de Paul.
- **Un nom tient compte des bords du cadre et du titre**, pas seulement des
  autres noms : un nom coupé par le bord n'est pas plus lisible qu'un nom
  recouvert (vu sur capture, 390 px).
- **Le cadre d'approche épouse la forme de l'écran** au lieu de rester carré.
- **Nouvelle clé de réglage `ultima-ciel-vue`** : l'ancienne
  (`ultima-ciel-plat`) enregistrait « figer le volume », un autre choix.

**Mesuré** (`tests/smoke-riven-nebuleuses.mjs`, 59 verdicts) : 0 nom recouvert
ni coupé, dans chaque nébuleuse, à 390 et à 1 280 px ; les 54 noms fictifs
lisibles sur grand écran. ⚠️ **Sur téléphone, 3 noms sur 54 se cachent** dans
les deux nébuleuses les plus denses (11 et 12 fiches) : un nom de 26
caractères en 12 px ne tient pas au bord d'un écran de 364 px. Ils sont dans le
panneau, et le harnais le vérifie. Aller plus bas demanderait de passer sous
les 12 px (C5) ou de déplacer les étoiles à l'approche : ni l'un ni l'autre
n'a été fait. Deux sabotages intégrés au harnais (évitement des noms coupé ;
cœurs rendus à leur taille de carte) le font virer au rouge.

**Relecture adverse indépendante** (même jour, avant la PR) : quatorze constats
— focus perdu au retour d'une nébuleuse, étoiles doublement exposées au lecteur
d'écran, Échap qui fermait aussi la fiche, cibles tactiles, recherche relancée
à chaque frappe… Tous corrigés, chacun avec le verdict qui l'aurait attrapé.

**Ce que les anciens harnais ont révélé** (`smoke-ciel.mjs`, rouge après le
lot 2) :
- **Un défaut du moteur 3D, antérieur à la boucle** : la visée au clavier
  recentrait l'étoile à l'horizontale mais sous-corrigeait à la verticale
  (`atan2(p.y, z1 + distance)` au lieu de `atan2(p.y, z1)`). Invisible tant que
  les amas restaient près de l'équateur ; les trois nébuleuses de la démo en
  posent une en hauteur — l'étoile visée restait à 127 unités du centre, 46
  après correction (la borne de 1,15 rad du glissement retient le reste). Les
  dix pages qui partagent le moteur en profitent.
- **Les boutons du ciel visent l'instance vivante du moteur**, plus une
  référence gardée par RIVEN : un rendu direct du moteur (le « pire cas » du
  harnais) la laissait pointer sur une instance arrêtée, et « approcher » ne
  faisait plus rien.
- **Six constellations → trois** dans la démo : attendu, c'est le lot 2.

## 8. Lot 3 — le volume en constellations (30/09, soir)

> Après la fusion de #322, sur la vue 3D en production, Paul : *« je ne veux que
> les noms des nébuleuses, pas les étoiles ; je dois pouvoir cliquer sur une
> nébuleuse ; les étoiles doivent être en volume de constellation dans les
> nébuleuses. »* Sa capture montrait, mesuré sur le code : les noms des
> contacts les plus reliés écrits en permanence (`lourdes`), les titres des
> nébuleuses posés en décor `aria-hidden` (ni cliquables ni atteignables au
> clavier), des amas posés sur une sphère sans tenir compte de leurs voisins
> — d'où des brumes qui se recouvrent et deux titres l'un sur l'autre.

**① Le but** — en 3D, sur RIVEN seulement (option `regrouper`) :
- **vue d'ensemble : seuls les noms des nébuleuses sont écrits.** Aucun nom de
  contact en permanence ; celui d'une étoile ne paraît qu'au survol ou au
  focus, pour savoir ce que l'on vise ;
- **chaque nébuleuse est une constellation en volume** — un amas serré, posé
  dans SA brume — et les nébuleuses ne se recouvrent plus, ni brumes ni titres ;
- **une nébuleuse se clique** (titre ou brume ; Entrée au clavier) : la caméra
  s'en approche jusqu'à ce qu'elle remplisse la vue, les noms de ses étoiles
  apparaissent, les autres pâlissent ; « Tout voir » ou Échap ramène à
  l'ensemble. C'est le geste de la carte à plat, transposé.

**② Les étapes** : 1. prototype dans le moteur et capture sur la maquette
fictive (`design/preview-riven-nebuleuses.html?vue=volume`), montrée à Paul ;
2. harnais ; 3. suite complète ; 4. preview, puis PR, fusion sur go.

**③ Les moyens** : `js/ciel.js` (disposition des amas, titres, approche),
`js/app.js` (rayon des brumes), la maquette, `tests/smoke-riven-nebuleuses.mjs`.

**④ Les critères** — mesurés à 390 et 1 280 px, sur la démo et sur 54 et 300
fiches fictives :
- 0 nom de contact visible en vue d'ensemble (verrou : les étoiles, elles,
  sont toutes dessinées) ;
- 0 chevauchement entre titres ; 0 recouvrement entre brumes projetées, à
  l'orientation d'ouverture ;
- chaque étoile dans la brume de sa nébuleuse ;
- clic sur un titre → la nébuleuse occupe au moins la moitié de la vue, ses
  noms s'écrivent sans se chevaucher ; Échap → retour à l'ensemble ;
- Tab atteint chaque nébuleuse, Entrée s'en approche ;
- les neuf autres pages du moteur : harnais inchangés et verts ;
- sabotages : noms permanents rallumés → rouge ; ancienne disposition → rouge.

**⑤ Ce qu'on ne fait pas** : la carte à plat (validée), la table des
nébuleuses, la base, les autres pages du moteur, un tracé de figures entre
étoiles (non demandé).

**⑥ Pre-mortem** — « le lot 3 a échoué : pourquoi ? »
- *Le moteur est partagé par dix pages* → tout passe sous `regrouper` ; la
  suite complète le prouve.
- *Neuf titres ne tiennent pas sur 390 px* → titres soumis au même évitement
  que les noms à plat ; verdict mesuré, jamais un seuil réglé pour passer.
- *Un titre cliquable reste inatteignable au clavier* → `role="button"`,
  `tabindex`, `aria-label` « Nébuleuse X, N contacts » ; verdict sur l'arbre
  d'accessibilité.
- *L'approche coupe l'amas au bord* → cadrage calculé sur le rayon réel de
  l'amas, pas sur une constante.
- *La brume (couche de fond) se décale de l'amas* → son rayon vient du même
  monde ; verdict « chaque étoile dans sa brume ».

### 8 bis. L'exécution du lot 3 — 30/09, soir

**Le prototype d'abord** (capture sur la maquette fictive, puis preview sur les
vraies fiches), avant tout harnais. Réponse de Paul : *« go, finis le lot 3 et
fusionne »*.

**Le critère des brumes, précisé à la mesure** : un lobe est un dégradé radial
dont l'opacité tombe à 0,05 à mi-rayon et à 0,01 aux trois quarts. « Deux
brumes ne se recouvrent pas » se juge donc sur leur partie VISIBLE : deux lobes
de nébuleuses différentes restent à plus de la moitié de la somme de leurs
rayons. Choix délibéré, pas un seuil réglé pour passer.

**Ce que la mesure a corrigé en route** :
- l'approche se cadre sur le rayon RÉEL de l'amas, avec un plancher
  « rayon + 65 » : « + 90 » plafonnait une petite nébuleuse à 43 % de la vue ;
- un lobe central de brume, posé au centre RÉEL de l'amas (le barycentre d'un
  échantillon de douze étoiles s'en écartait d'un quart de rayon), avec une
  marge de perspective : sans lui, à 300 fiches, 1 à 5 étoiles sortaient de
  leur nébuleuse ;
- la boîte d'un nom a la hauteur du texte peint, et un nom qui se tait
  disparaît sans fondu (un fondu croisait son remplaçant) ;
- la maquette montre son bouton avant que le moteur mesure la scène.

**Relecture adverse indépendante** : dix constats sur le code, plus un sur le
harnais. Tous sont corrigés, et chacun a son verdict. Validation de
l'instrument : **les 18 nouveaux verdicts sont ROUGES sur le code d'avant la
relecture et verts après.** Dans l'ordre :
- les titres seuls se tabulent à l'ensemble (il fallait 301 Tab) ;
- Entrée entre dans la nébuleuse, sans pivoter la grille ;
- les titres effacés sortent de la tabulation ;
- la taille CSS n'écrase plus celle des titres (chevauchement à 320 px) ;
- la grille se recompose quand l'écran tourne ;
- l'approche l'emporte sur le survol ;
- les personnes suivent leur étoile ;
- Échap marche depuis « + » ;
- la recherche garde la nébuleuse approchée ;
- la dérive balance au lieu de tourner sans fin.

**Mesuré** (`tests/smoke-riven-nebuleuses.mjs`, 119 verdicts, section 6) :
- à 320, 390 et 1 280 px, sur la démo et sur 54 et 300 fiches fictives :
  0 nom de contact à l'ensemble, titres sans chevauchement, brumes qui ne se
  touchent pas, chaque étoile dans sa brume ;
- une nébuleuse approchée occupe de 52 à 85 % de la vue, et ses noms ne se
  croisent pas et ne couvrent aucune étoile ;
- trois sabotages du moteur font virer l'instrument : noms permanents
  rallumés, grille resserrée, évitement coupé.

**Relecture Codex sur la PR** : quatre constats, tous vérifiés sur le code puis
corrigés, chacun avec son verdict rouge sur le moteur d'avant :
- un titre effacé (rogné par le bord ou passé derrière la caméra) restait
  cliquable et tabulable ;
- les zones de clic des nébuleuses, peintes au-dessus des personnes rattachées,
  volaient leur clic ;
- pendant une approche, la recherche perdait son contraste chez les voisines
  encore à l'écran (0,20 contre 0,05 désormais).

**Ce qui a résisté à la relecture** :
- les neuf autres pages du moteur : sans `regrouper`, le point visé reste à
  l'origine, et opacité, zoom et distances sont inchangés ;
- les titres sont des boutons nommés, sans texte lu deux fois ;
- aucun titre invisible ne vole le clic d'une étoile ;
- une image coûte de 9,5 à 13 ms à 300 fiches.

**Limite assumée** : une fois une nébuleuse approchée, un nom qui n'a pas de
place se tait ; il reste au survol et au focus. Mesuré au dernier passage, sur
BTP : à 390 px, 7 noms sur 12 (54 fiches) et 4 sur 70 (300 fiches) ; à 1 280 px,
11 sur 12 et 29 sur 70. Un très gros amas sur téléphone se lit donc étoile par
étoile — le chiffre est donné pour qu'on le sache, pas réglé pour passer.
