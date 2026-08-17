# CADRAGE LV5 — la galaxie prend l'écran

> **Format 6 points (directive EL).** Ce document **succède** à
> `CADRAGE-LV4-CIEL-DEPLIE.md`, il ne le remplace pas : LV4 reste vrai — le
> modèle « survol = aperçu, clic = zoom » est acquis, le moteur et l'adaptateur
> sont livrés, la coque pilote est en production. LV5 pousse trois choses plus
> loin et **renverse deux interdits de LV4**, écrits noir sur blanc au §2.
>
> **Statut au 2026-08-17 : P0, P1 et P2 LIVRÉES** (§11, §12 et §13). Le gate du
> §10 a été levé le soir même — Paul a tranché la question bloquante, puis les
> deux arbitrages de forme (« fond avec les étoiles génial », « charge ok »).
> Les paliers suivants restent fermés. *Cet en-tête annonçait « aucune ligne de
> code » ; le laisser tel quel aurait fait de ce document un état périmé qui se
> recopie — exactement ce que la leçon du 2026-08-13 interdit.*

---

## 0. La demande — dictée par Paul, 2026-08-16 (soir)

> *« On a bien avancé sur la refonte du thème stellaire, c'est très bien. Il
> faut qu'on aille plus loin : qu'on n'ait plus la boussole, qu'on soit vraiment
> sur tout l'écran — toute la page, la galaxie. Quand j'arrive sur Ultima LV3,
> la page d'accueil avec les trois subdivisions, je veux une galaxie avec mes
> trois nébuleuses. Je passe le curseur dessus, ça le met en surbrillance ; je
> clique, ça zoome, ça sélectionne une nébuleuse, et dedans j'ai mes
> constellations. Il faut que ça prenne tout l'écran. L'affichage actuel, il y
> avait une version qui était très bien, c'était vraiment un amas d'étoiles,
> plein de filaments — c'est assez grossier. On a une bonne base, on va
> travailler dessus pour rendre ça plus fin, plus beau, plus esthétique, avoir
> plus de finesse. Première étape : tout l'écran d'accueil. Ensuite il faudra
> faire pareil dans l'affichage de chaque constellation et de chaque étoile.
> Par exemple quand je vais dans VRANESH, que je n'aie plus l'ancien affichage
> de la boussole — il faut que ce soit dans l'affichage global, avec le
> principal et les autres. Ça, c'est très important. »*

### Ce que je retiens — reformulation, protocole de dictée

Quatre demandes, et **elles sont distinctes** ; les traiter comme une seule est
le premier piège de ce chantier :

| | La demande | Ce que ça touche vraiment |
|---|---|---|
| **A** | **Le plein écran** — plus de plateau encadré, la galaxie EST la page | la **mise en page**, pas le moteur |
| **B** | **La finesse** — l'amas est « une bonne base » mais « assez grossier » | le **moteur de rendu**, pas la mise en page |
| **C** | **Le geste** — survol = surbrillance, clic = zoome et sélectionne | **déjà livré** en LV4, à conserver tel quel |
| **D** | **La propagation** — les constellations ET les étoiles, VRANESH le premier | le **modèle de navigation** — le plus lourd |

### Les trois mots que la dictée a abîmés — je le signale au lieu de deviner

1. **« ça le met en surveillance »** → *en **surbrillance***. Aucune ambiguïté
   réelle : c'est le survol qui éclaire, il existe déjà (`ciel-halo-choix`).
2. **« place des filands »** → *« **plein de filaments** »*. Le point était
   bloquant — Paul désignait une maquette qu'il avait trouvée « très bien », et
   deux étaient candidates. ✅ **Tranché le soir même** : c'est le mode
   **« Galaxie »** de **`preview-riven-galaxie.html`**, en charge dense. Voir
   §11, où la comparaison des sept maquettes est chiffrée.
3. **« mes trois nébuleuses »** → dans le vocabulaire posé en LV4, les trois
   objets de l'accueil sont des **galaxies** (ULTIMA, ALPHA, ALTHEA), et les
   nébuleuses sont ce qu'elles contiennent. **Le mot n'est pas le sujet** : le
   geste décrit est exactement celui de LV4 (trois objets à la racine → on
   plonge). Je garde le vocabulaire LV4 dans le code ; si Paul préfère appeler
   « nébuleuse » ce que LV4 nomme « galaxie », c'est un renommage de libellés,
   pas un changement de modèle. Question 6 du §10.

---

## 1. L'état RÉEL — mesuré ce soir, pas recopié

*Un état qui se recopie de document en document n'est pas un état vérifié
(leçon du 2026-08-13). Tout ce tableau a été lu dans le code ce soir.*

| Ce qui est | Le fait mesuré |
|---|---|
| **Au ciel** | **1 coque sur 9** : `ultima.html`. Plus RIVEN (`riven.html`), qui a son propre ciel de réseau. |
| **Encore à la boussole** | **8 coques** : `index`, `alpha`, `grima`, `naga`, `bcp`, `tao`, `imladrik`, `adramelech` — toutes chargent `js/boussole-noyau.mjs`. |
| **Plus VRANESH** | `vranesh.html` charge `boussole-noyau.mjs` + `css/boussole.css` + `css/vranesh-boussole.css` : sa « boussole des futurs » est **la cible explicite de la demande D**. |
| **Le registre** | **25 nœuds**, dont **9 écrans porteurs de caps** et **16 pages de travail** (les « étoiles »). |
| **Le moteur** | `js/ciel.js`, **1130 lignes**, **zéro bibliothèque**. Projection perspective maison (15 lignes de trigonométrie), rendu **100 % SVG**, boucle `requestAnimationFrame`. |
| **Le fond aujourd'hui** | **130 grains** de poussière, `r` entre 0,3 et 1,1, opacité 0,10–0,36. Une constante, pas une densité. **C'est ça, le « grossier ».** |
| **Une étoile** | **8 éléments SVG** (halo de choix, halo de focus, lueur, branches, corolle, cœur, nom, zone tactile), tous repositionnés par `setAttribute` à chaque image. |
| **Le plein écran** | **N'existe pas.** `.ciel-noeud-coque { max-width: 760px; padding: .8rem }`, plus un bandeau, une légende sous le ciel et le cartouche de Léo **dans le flux**. |
| **L'encoche** | `<meta name="viewport">` **sans `viewport-fit=cover`** sur les trois coques vérifiées. En plein écran, la barre système d'iOS mangera le bas du ciel. |
| **Le patrimoine** | **60 harnais**. Dont `smoke-vranesh` **232 assertions**, `smoke-quadrants` 67, `smoke-boussole` 63, `smoke-console` 47, `smoke-lv4-coque` 32. |

**Ce que ce tableau dit et qu'il faut entendre : LV4 n'est pas fini.** Sept
coques ordinaires et la racine attendent (`CADRAGE-LV4 §13.3`, étapes ④b et
④c). LV5 ne peut pas les sauter — il les **absorbe**, sinon on repeindrait deux
fois les mêmes huit écrans.

---

## 2. LES DEUX RENVERSEMENTS — regardés en face

### ① Le plein écran renverse la mise en page, pas le moteur

LV4 a livré une coque **centrée, à 760 px, dans une colonne**. Ce n'était pas
une négligence : c'est la mise en page de toute la console depuis l'origine
(`console.css`, `boussole.css`, `styles.css` posent tous une colonne centrée).
Le plein écran n'est donc **pas un `max-width` à retirer** : c'est le passage
d'un modèle « page qui défile, plateau dedans » à un modèle **« scène qui tient
l'écran, mobilier posé dessus »** — un HUD. Détail au §3.2.

### ② Les pages de travail entrent au ciel — et `CADRAGE-LV4 §13.6` l'interdisait

Le texte de LV4 dit, mot pour mot :

> *« On ne passe pas VRANESH, DRAUKHAIN ni RIVEN au ciel. Ce sont des pages de
> travail, pas des étages de navigation. »*

**Paul demande l'inverse ce soir, et c'est son droit le plus strict.** Mais
l'argument de LV4 ne devient pas faux parce qu'on change d'avis : une page de
travail porte des formulaires, des listes, des `<details>`, un registre
détaillé — VRANESH en a trois blocs. **Un ciel ne remplace pas un formulaire.**
Ce qui change, c'est ce qui **entoure** le travail : la boussole interne de
VRANESH (« la boussole des futurs ») devient un ciel, et le mobilier de
navigation devient céleste. Trois lectures sont possibles, elles ne coûtent pas
la même chose, et **je ne les tranche pas seul** — question 2 du §10.

---

## 3. LA LECTURE D'EXPERT — trois problèmes qu'on confond à ses dépens

### 3.1 La finesse : c'est une question de MOTEUR DE RENDU

**Le diagnostic.** Le ciel est « grossier » pour une raison précise et
mesurable : **130 grains fixes, en SVG**. Un vrai champ stellaire demande
3 000 à 8 000 points avec parallaxe, 3 à 6 voiles de nébuleuse en dégradé, et
des filaments. En SVG animé, c'est **hors budget d'un ordre de grandeur** :
chaque grain est un nœud du document que le navigateur re-style et re-peint à
chaque image. Le plafond praticable est de l'ordre de **1 000 à 1 500 éléments
animés** sur un ordinateur, **nettement moins sur un téléphone de 390 px** —
et c'est le téléphone qui décide, parce que c'est là que Paul travaille.

**La réponse d'architecture : le ciel à DEUX COUCHES, une seule caméra.**

| Couche | Support | Ce qu'elle porte | Interaction |
|---|---|---|---|
| **Le fond** | `<canvas>` 2D, `aria-hidden` | poussière (milliers de grains), voiles de nébuleuse, filaments, halo galactique | **aucune** — `pointer-events: none` |
| **Les objets** | **SVG, inchangé** | étoiles, noms, liens, halos, zones tactiles | tout : clic, focus clavier, lecteur d'écran |

**Pourquoi canvas 2D et pas WebGL.** WebGL se justifie au-delà de ~50 000
points ; on vise 5 000. Le canvas 2D offre `globalCompositeOperation = 'lighter'`
— **l'addition lumineuse, qui EST le secret du rendu stellaire** : deux grains
qui se superposent s'additionnent au lieu de se recouvrir, et c'est ce qui
donne le cœur brillant d'un amas. Et il n'y a ni shader à maintenir, ni perte
de contexte à gérer, ni 600 Ko à vendoriser sous une CSP `script-src 'self'`.

**Pourquoi PAS tout en canvas.** Parce qu'on perdrait exactement ce que ce repo
a payé cher : le focus clavier, le texte réel, le lecteur d'écran, et des
harnais qui lisent le DOM. **Règle dure, non négociable : si une information
n'existe que dans le canvas, elle n'existe pas.** Le canvas est décor, rien
d'autre.

**Les quatre techniques qui font la différence entre fin et grossier** — elles
sont connues, elles ne s'improvisent pas :

1. **Le grain pré-rendu.** Peindre un point lumineux (dégradé radial, 16×16)
   **une fois** dans un canvas hors écran, puis le `drawImage` des milliers de
   fois. Un `arc()+fill` par grain et par image coûte ~10× plus cher.
2. **Le voile qui ne se repeint pas.** Un `createRadialGradient` par image et
   par voile est le poste le plus cher qu'on puisse s'offrir. Les voiles se
   peignent une fois hors écran et se **transforment** (translation, échelle)
   selon la caméra.
3. **La densité, pas le nombre.** 130 grains est une **constante** : elle sature
   un écran de 390 px et laisse vide un 1670. Le nombre se déduit de la surface
   — *n* grains par 10 000 px², plafonné.
4. **La parallaxe.** Ce qui donne le volume n'est pas le nombre de points, c'est
   que les lointains bougent **moins** que les proches. Trois nappes de
   profondeur suffisent à créer l'illusion ; c'est peu de code et beaucoup
   d'effet.

**Le vrai risque technique de cette couche, et il n'est pas la performance :
c'est la PHASE.** Deux systèmes de coordonnées (le `viewBox` du SVG, les pixels
du canvas × `devicePixelRatio`) qui dérivent l'un de l'autre donnent un fond qui
glisse sous les étoiles. La parade est structurelle : **le canvas consomme la
même fonction `projeter()` et le même `viewBox` que le SVG**, et un harnais
vérifie qu'un **point témoin** tombe au même pixel dans les deux couches
(tolérance 1 px). C'est le premier test à écrire, avant le premier grain.

### 3.2 Le plein écran : c'est une question de MISE EN PAGE

Ce qui doit changer, concrètement, et rien de tout cela n'est dans le moteur :

- **La scène quitte la colonne** : `100dvw × 100dvh` — **`dvh`, pas `vh`** :
  sur mobile `100vh` inclut la barre d'URL qui se rétracte, et la scène
  déborderait de 60 à 90 px selon le navigateur.
- **`viewport-fit=cover` + `env(safe-area-inset-*)`** : sans quoi l'encoche et
  la barre système d'iOS recouvrent le ciel. **Absent aujourd'hui** (§1).
- **Tout le mobilier devient HUD** : bandeau, fil d'Ariane, cartouche de Léo,
  retour, légende, sceau — posés **sur** le ciel, en `position: fixed`.
- **Le HUD ne doit pas voler les clics** : chaque conteneur en
  `pointer-events: none`, chaque contrôle en `pointer-events: auto`. Sans ça,
  une bande transparente rend un tiers du ciel inerte, et **personne ne le voit
  en regardant** — ça ne se découvre qu'en cliquant.
- **Le contraste change de nature.** Aujourd'hui le texte se lit sur un jeton
  CSS connu. Sur un ciel qui bouge, il se lit sur **un pixel qui varie**. Deux
  conséquences : il faut un **voile local** (scrim) sous chaque bloc de texte du
  HUD, et **l'instrument de mesure doit changer** — le contraste se mesure
  contre le **pire pixel réellement peint** sous la boîte de texte, pas contre
  une couleur déclarée. C'est un harnais à réécrire, pas à paramétrer.
- **Le défilement disparaît.** Ce qui débordait doit devenir un **panneau** :
  c'est le point où le plein écran touche les pages de travail (§3.3).
- **Le repli `<noscript>`** : en plein écran, il ne peut plus être « sous la
  scène » — il n'y a plus de sous. Il devient le contenu par défaut, que le ciel
  recouvre une fois peint.

### 3.3 La propagation : c'est une question de MODÈLE DE NAVIGATION

Ce que Paul décrit pour VRANESH — « pas l'ancien affichage de la boussole », et
« dans l'affichage global, avec le principal et les autres » — se lit de trois
façons. Elles coûtent de 1 à 8, et je recommande la troisième.

| | La lecture | Ce que ça veut dire | Coût | Risque |
|---|---|---|---|---|
| **A** | **Le ciel de contexte** | La page de travail s'ouvre **en surcouche** au-dessus du ciel ; l'étoile courante brille, ses sœurs restent visibles et cliquables autour. On ne quitte jamais la galaxie. | **8** | le travail se fait dans une fenêtre posée sur une animation — lenteur, batterie, lisibilité |
| **B** | **Le ciel de bordure** | La page prend l'écran ; le mobilier de navigation devient une **mini-carte céleste** en coin : l'étoile principale et ses voisines. | **4** | une seconde vue à tenir en phase avec la première |
| **C** | **La boussole interne devient un ciel** | Là où une page de travail affiche **sa propre boussole** (VRANESH : « la boussole des futurs »), elle affiche un ciel. Le reste de la page ne bouge pas. | **2** | aucun — c'est la lecture littérale de la phrase de Paul |

**Ma recommandation : C pour demain, A comme horizon.** C'est ce que la phrase
dit littéralement (« l'ancien affichage de la boussole » désigne un objet précis
et existant dans VRANESH), c'est ce qui ferme la boucle en un jour au lieu d'une
semaine, et **A reste atteignable ensuite** — alors que faire A d'abord et
découvrir qu'on travaille mal dans une surcouche coûterait tout le chantier.
**Question 2 du §10 : c'est à Paul de trancher, pas à moi.**

### 3.4 Ce qui est simple, ce qui est moyen, ce qui est dur

*Demandé explicitement par Paul. Les cotes sont mes estimations, elles engagent.*

| Difficulté | Le travail | Pourquoi |
|---|---|---|
| 🟢 **Simple** | Les **7 coques ordinaires** au ciel (LV4 ④b) | Le module `ciel-noeud.mjs` existe et a été éprouvé sur `ultima.html`. C'est de la répétition, une par une. |
| 🟢 **Simple** | La densité de poussière, la parallaxe, les filaments | ~80 lignes dans le fond. L'effet est spectaculaire pour le prix. |
| 🟡 **Moyen** | Le **plein écran** sur une coque | Mécanique connue, mais `dvh`, safe-area et `pointer-events` sont trois pièges à payer une fois. |
| 🟡 **Moyen** | La **racine** `index.html` (LV4 ④c) | Le seul écran à mobilier propre (bandeau « Bienvenue »), et **l'écran que Paul juge**. Il passe en dernier. |
| 🟡 **Moyen** | La **disposition sur écran large** | En 760 px, la colonne allait. En plein écran 1670, trois objets en colonne laissent 70 % de vide. **La forme se rouvre** (question 3). |
| 🔴 **Dur** | La **couche canvas en phase** avec le SVG | Deux repères, un `devicePixelRatio`, un redimensionnement, `prefers-reduced-motion`, l'onglet caché. Le point témoin est obligatoire. |
| 🔴 **Dur** | Le **contraste sur fond animé** | L'instrument actuel mesure contre un jeton. Il devra mesurer contre un **pixel peint**. Un harnais neuf, pas un réglage. |
| 🔴 **Dur** | La **performance à 390 px** | C'est là que ça casse, et c'est là que Paul travaille. Budget d'image mesuré, dégradation automatique. |
| 🔴 **Dur** | **VRANESH** | 232 assertions, un plateau bâti sur `css/boussole.css`, trois blocs de travail. C'est la pièce la plus lourde du chantier. |
| ⚫ **Le plus dur** | **Les 16 pages de travail** (les « étoiles ») | Ce sont des **applications**, pas des menus. Rien ne dit qu'elles doivent toutes y passer. **Question 4.** |

---

## 4. ① LE BUT — ce qui sera vrai à la fin

**Ultima s'ouvre sur une galaxie qui occupe tout l'écran.** Trois objets
lumineux dans un champ d'étoiles fin — de la poussière, des voiles, des
filaments, du volume. Le curseur en éclaire un ; le clic y plonge, et la
caméra descend dans la nébuleuse jusqu'à ses constellations, puis ses étoiles.
**Aucun encadrement, aucune colonne, aucun plateau** : le ciel EST la page, et
le peu de mobilier nécessaire — le fil, la parole de Léo, le retour — flotte
dessus.

**Et le même ciel continue à l'intérieur** : une constellation ouverte, une
étoile ouverte, VRANESH ouvert ne renvoient plus à l'ancienne boussole. Le
principal et les autres sont là, au même registre visuel.

**Ce qui ne change pas :** le registre reste la source unique de ce qui existe
et de ce qui mène où. **Léo parle à chaque étage** (critère 4bis de LV4). Le
travail ne devient pas plus lent ni plus long qu'avant.

---

## 5. ② LES ÉTAPES — et les PALIERS DE SAUVEGARDE

*Demandé explicitement par Paul. **Un palier de sauvegarde, c'est un point où
l'on peut s'arrêter net** : tout est vert, tout est fusionné, et Ultima marche
**mieux** qu'avant — pas un chantier à moitié ouvert. Chaque palier = une PR.*

### P0 — La maquette : la finesse et le plein écran, sans toucher à la production
`design/preview-lv5-galaxie.html`. Le fond à deux couches, le plein écran, la
disposition sur écran large. **Zéro écran de production touché.**
→ **Palier : réversible à coût nul.** C'est là que Paul juge la forme, et c'est
là qu'on itère — pas dans le produit. *(La maquette avant le code : leçon du
2026-08-01, désormais une application directe d'EL.)*

### P1 — Le fond fin entre dans le moteur, **inactif par défaut**
`js/ciel.js` reçoit la couche canvas derrière une option, exactement comme les
trois capacités de LV4. RIVEN et `ultima.html` tournent **sans l'activer** et
leurs harnais passent **sans une retouche**.
→ **PALIER MAJEUR.** Le rendu fin existe, il est éprouvé, et rien ne peut casser
puisque personne ne l'appelle encore. Si le chantier s'arrête ici, on n'a rien
perdu et on a gagné un moteur.

### P2 — Le plein écran sur la coque pilote (`ultima.html`), seule
Le HUD, `dvh`, la safe-area, `pointer-events`, le contraste mesuré au pixel, le
`<noscript>`. Un seul écran, tous les pièges du §3.2 payés une fois.
→ **PALIER.** Un écran en plein écran, huit à l'ancienne : c'est visiblement un
chantier, mais rien n'est cassé et le modèle est prouvé.

### P3 — Les sept coques ordinaires + leurs harnais
`alpha`, `grima`, `naga`, `bcp`, `tao`, `imladrik`, `adramelech`. Une par une,
sur le module éprouvé. Les six harnais de navigation repris **assertion par
assertion**, chacune déclarée **portée / remplacée / abandonnée avec sa raison**.
→ **PALIER.** Huit écrans cohérents. `boussole-noyau.mjs` ne sert plus qu'à
`index.html` et VRANESH.

### P4 — La racine (`index.html`) — l'écran que Paul juge
En dernier, sur un module éprouvé huit fois. Le bandeau « Bienvenue sur Ultima »
et l'invite deviennent du HUD.
→ **PALIER LE PLUS IMPORTANT.** À ce point, **la demande A + B + C est tenue
entièrement** : on arrive sur une galaxie plein écran, fine, où l'on plonge.
**Si le chantier s'arrête là, Paul a ce qu'il a demandé ce soir en priorité
n°1.** Tout ce qui suit est la demande D.

### P5 — VRANESH : la boussole des futurs devient un ciel
Selon l'arbitrage A/B/C du §3.3. `smoke-vranesh` (232 assertions) tourne
**avant la première ligne et après la dernière**.
→ **PALIER.** La première page de travail au ciel — le modèle des suivantes.

### P6 — Les autres pages de travail, **sur décision, une par une**
DRAUKHAIN, ALTHEA, l'abaque, le registre… **Aucune n'est engagée par ce
cadrage** : chacune se rouvre avec son propre gate. *Seize pages d'un coup,
c'est le contraire d'« une boucle à la fois ».*

### Règle de conduite entre les paliers
- **Un palier ouvert à la fois** (EB). Fusionné avant d'ouvrir le suivant.
- **Après chaque squash-merge**, repartir de `origin/main` avant tout nouveau
  commit (règle du 2026-07-22).
- **Patrimoine COMPLET** (`bash tests/lancer.sh` en entier) avant chaque fusion,
  pas seulement les harnais du fichier modifié (renfort du 2026-07-22).
- **Preview Vercel** en fin de chaque palier, avec la page à ouvrir.

---

## 6. ③ LES MOYENS

| | Fichiers |
|---|---|
| **Créé** | `design/preview-lv5-galaxie.html` (+ `.js`, `.css`) · `js/ciel-fond.mjs` (la couche canvas) · `css/ciel-plein-ecran.css` · `tests/smoke-lv5-fond.mjs` · `tests/smoke-lv5-plein-ecran.mjs` |
| **Modifié** | `js/ciel.js` (**une option de plus, inactive par défaut**) · `js/ciel-noeud.mjs` · `css/ciel-noeud.css` · les **9 coques** · les **6 harnais** de navigation · les `<meta viewport>` (ajout de `viewport-fit=cover`) |
| **Intouché** | `js/registre-lv3.mjs` · `js/blasons.mjs` · `css/styles.css` · **`css/boussole.css`** · `js/boussole-noyau.mjs` tant qu'une page l'appelle · RIVEN · les API · la base |

**`css/boussole.css` reste intouchable jusqu'à P5 inclus**, et la raison est
écrite depuis LV4 §13.0 ② : `vranesh.html` la charge et bâtit dessus, son
plateau utilise la classe `.cap`. La retoucher pour arranger le ciel
déshabillerait VRANESH **en silence** — seul `smoke-vranesh` le verrait.

---

## 7. ④ LES CRITÈRES DE RÉUSSITE — mesurés, jamais regardés

*« Ça a l'air bien » n'est pas un critère : c'est l'absence de critère
(leçon du 2026-08-01).*

**Le plein écran**
1. **La scène occupe l'écran** : sa boîte fait ≥ 98 % de `innerWidth` et de
   `innerHeight` visible, à **390 × 844** et **1670 × 900**. Mesuré, pas déduit.
2. **Aucun débordement** : `document.scrollHeight ≤ innerHeight + 1`. Un plein
   écran qui défile n'est pas un plein écran.
3. **Le HUD ne vole aucun clic** : pour chaque objet du ciel,
   `elementFromPoint` au centre de sa zone rend bien l'objet, pas le HUD.
4. **La safe-area est respectée** : aucun contrôle du HUD sous les
   `env(safe-area-inset-*)` simulés.

**La finesse**
5. **Le fond a peint** : luminance **moyenne et variance** relevées par
   `getImageData` sur trois zones. Variance nulle = le fond n'a pas peint —
   *un canvas vide est noir, exactement comme un ciel réussi, et c'est
   précisément pourquoi ce test se mesure au lieu de se regarder.*
6. **Le fond est EN PHASE avec les étoiles** : un point témoin de coordonnées
   monde connues tombe au même pixel dans les deux couches, **tolérance 1 px**,
   à trois orientations de caméra et après un redimensionnement.
7. **La densité s'adapte** : le nombre de grains à 1670 px est ≥ 2,5 × celui à
   390 px. Une constante échouerait ce test, et c'est le but.
8. **Le budget d'image tient** : temps moyen sur 120 images **< 16,7 ms** en
   1670 × 900 et **< 33 ms** en 390 × 844. Au-delà, la densité se dégrade
   automatiquement — et cette dégradation est **elle-même testée**.
9. **`prefers-reduced-motion`** : aucune dérive, mais **le fond reste peint**.
   Une préférence d'animation n'est pas une demande d'écran vide.

**Ce qui ne doit pas régresser**
10. **Aucune cible perdue** : registre ↔ DOM, automatique, sur les 9 coques.
11. **Lisibilité WCAG AA** — mesurée contre le **pire pixel réellement peint**
    sous chaque boîte de texte, scrim compris. Nouvel instrument (§3.2).
12. **Le clavier survit** : chaque objet atteignable en tabulation, le focus
    n'est pas détruit par le re-dessin (défaut connu de LV4 ④a).
13. **Le chemin ne s'allonge pas** : gestes pour atteindre une page de travail,
    comptés **avant et après**, coque par coque. *Un ciel qui rallonge le
    travail est un échec, si beau soit-il.*
14. **RIVEN et VRANESH intacts** : `smoke-ciel` et `smoke-vranesh` verts **sans
    une retouche**, avant la première ligne et après la dernière.
15. **Zéro PII dans un ciel de navigation** — éprouvé **par l'absence** : le
    harnais cherche le contenu interdit dans ce qui est rendu et exige de **ne
    pas l'y trouver** (règle du 2026-07-30).
16. **Patrimoine COMPLET vert, sortie 0**, à chaque palier.

---

## 8. ⑤ CE QU'ON NE FAIT PAS

- **On ne touche pas au registre** : ni nœud ajouté, ni renommé, ni recâblé.
- **On n'importe aucune bibliothèque 3D.** La CSP pose `script-src 'self'`, et
  600 Ko pour vingt étoiles serait un mauvais marché — l'argument du moteur tient
  toujours.
- **On ne passe pas en WebGL.** Pas à 5 000 points. Ce serait de la complexité
  achetée sans besoin.
- **On ne met AUCUNE information dans le canvas.** Décor uniquement.
- **On n'engage pas les 16 pages de travail** : P6 se rouvre page par page.
- **On ne supprime pas `css/boussole.css`** tant que VRANESH y bâtit.
- **On ne réécrit pas les ~236 assertions d'un bloc** : une par une, chacune
  déclarée portée / remplacée / **abandonnée avec sa raison écrite**.
- **On ne fait pas d'animation gratuite** : le mouvement dit où l'on va.
- **On ne rouvre pas les arbitrages LV4 déjà rendus** (geste tactile : premier
  appui déplie, second entre) — sauf la disposition, que le plein écran rouvre
  de fait (question 3).

---

## 9. ⑥ PRE-MORTEM — « le chantier LV5 a échoué : pourquoi ? »

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **Le fond glisse sous les étoiles** : deux repères qui dérivent. Le plus probable de tous, et le plus laid. | Critère 6 : point témoin, 1 px, à trois orientations et après redimensionnement. Écrit **avant** le premier grain. |
| 2 | **Ça rame sur le téléphone de Paul.** Le fond est beau sur un 1670 et l'accueil devient poussif à 390. | Critère 8 : budget d'image mesuré aux deux tailles, **dégradation automatique testée**. |
| 3 | **Le HUD rend le ciel inerte** par bandes — invisible en regardant, découvert en cliquant. | Critère 3 : `elementFromPoint` sur chaque objet. |
| 4 | **Le texte devient illisible** par endroits parce qu'un voile clair passe dessous. | Critère 11 : contraste mesuré contre le **pire pixel peint**, pas contre un jeton. Instrument neuf. |
| 5 | **`100vh` ment sur mobile** : la scène déborde de la hauteur de la barre d'URL. | `dvh` + `viewport-fit=cover` + safe-area, critères 1, 2, 4. |
| 6 | **VRANESH se déshabille en silence** : on a retouché `.cap` ou `boussole.css`. | Feuille déclarée intouchable (§6) ; `smoke-vranesh` avant/après (critère 14). |
| 7 | **Le chantier s'étale** : huit coques, un moteur, une couche neuve, seize pages — et plus rien ne ferme. | Les paliers du §5, **un seul ouvert à la fois**, chacun fusionnable. |
| 8 | **On raffine dans la mauvaise direction** parce qu'on n'a pas identifié la maquette que Paul a aimée. | **Question 1 du §10, bloquante avant P0.** |
| 9 | **Le canvas mange la batterie** en onglet caché. | `arreter()` existe déjà ; la boucle s'arrête sur `document.hidden`, assertion dédiée. |
| 10 | **Le beau mange l'outil** : un ciel splendide où travailler devient lent. | Critère 13 : le chemin est **compté**, avant et après. C'est le critère qui peut faire **abandonner** un palier. |
| 11 | **Le repli sans JavaScript disparaît** : en plein écran il n'a plus de « sous ». Personne ne le verrait partir. | §3.2, dernier point : il devient le contenu par défaut, que le ciel recouvre. Assertion dédiée. |
| 12 | **Une assertion est abandonnée en douce** parce qu'elle gênait. | Chacune classée portée / remplacée / abandonnée **avec sa raison écrite** (§8). |
| 13 | **On croit LV4 fini** et on repeint deux fois les mêmes huit écrans. | §1 : LV5 **absorbe** ④b et ④c, il ne les contourne pas. |
| 14 | **La disposition en colonne survit au plein écran** et l'accueil de Paul est vide à 70 %. | Question 3, à trancher **en P0**, sur maquette mesurée. |
| 15 | **Mon instrument suppose ce qu'il mesure.** Un canvas qui n'a pas peint est noir — comme un beau ciel. | Critère 5 : **variance**, pas luminance seule. Et une capture d'écran regardée à chaque palier. |

---

## 10. LE GATE — ce qui doit être vrai avant la première ligne

**Ce qui est déjà fait (ce soir) :**
- ✅ L'état réel mesuré sur le code, pas recopié (§1).
- ✅ Les deux renversements par rapport à LV4 identifiés et écrits (§2).
- ✅ L'architecture de rendu arbitrée et argumentée (§3.1).
- ✅ Les paliers de sauvegarde posés (§5).
- ✅ Les pièges connus inventoriés (§9).

**Ce qui attend Paul — le gate ne se lève pas sans ces réponses :**

| # | La question | Ma recommandation |
|---|---|---|
| **1** | ~~Quelle maquette était « très bien, un amas d'étoiles, plein de filaments » ?~~ | ✅ **TRANCHÉ le 2026-08-16 par Paul** : le **mode « Galaxie » de `preview-riven-galaxie.html`, en charge dense**. Voir §11. |
| **2** | **VRANESH : A, B ou C** (§3.3) ? | **C** — la boussole interne devient un ciel. Littéral, coût 2, et A reste atteignable après. |
| **3** | **La disposition en plein écran** sur grand écran : la colonne validée en LV4, ou une forme qui remplit (couronne, spirale, amas libre) ? | **Une forme qui remplit.** La colonne avait été validée dans un cadre de 760 px ; le plein écran change la donne. À juger sur maquette en P0. |
| **4** | **Jusqu'où va « chaque étoile »** ? Les 16 pages de travail, ou seulement les cadrans (VRANESH, DRAUKHAIN, ALTHEA…) ? | **Les cadrans d'abord, une par une.** N'engageons pas 16 pages sur une phrase. |
| **5** | **Les paliers** du §5 : ce découpage te va, ou tu veux P4 (la racine) plus tôt puisque c'est l'écran que tu juges ? | **Garder l'ordre.** La racine en dernier, sur un module éprouvé huit fois — c'est ce qui a marché en LV4. |
| **6** | **Le vocabulaire** : tu as dit « trois nébuleuses » là où LV4 dit « trois galaxies ». On renomme, ou on garde ? | **Garder LV4** (galaxie › nébuleuse › constellation › étoile). Si tu préfères l'autre, c'est un renommage de libellés, pas de modèle. |

---

### ⏳ Actions Paul

- **Répondre aux questions 2 à 6** — la n°1 est tranchée (§11).
- Rien d'autre : aucune migration, aucun secret, aucune dépense dans ce cadrage.

---

# 11. P0 — la maquette plein écran et la couche de fond. Livrée le 2026-08-16.

**La question 1 est tranchée** : Paul a désigné le **mode « Galaxie » de
`design/preview-riven-galaxie.html`, en charge dense**, et a précisé la
direction — « l'étape d'après, c'est le LV5 avec la 3D ».

### Ce que la comparaison des maquettes a établi — et qui a orienté tout P0

Les captures des sept maquettes ont été mises côte à côte, puis vérifiées au
`grep` plutôt qu'à l'œil :

| | La maquette | Perspective ? |
|---|---|---|
| Référence de Paul | `preview-riven-galaxie.html`, mode Galaxie | **aucune** — `FOCALE\|projeter\|yaw\|pitch` → **0** occurrence |
| Le moteur en production | `js/ciel.js` | **26** occurrences |

**La richesse était du côté de la 2D, la profondeur du côté de la 3D, et
personne n'avait les deux.** C'est la définition exacte du travail de P0 :
porter la densité de l'une dans la géométrie de l'autre. Sans cette
vérification, j'aurais pu passer la soirée à raffiner la mauvaise couche.

### Ce qui a été livré

| Fichier | Ce qu'il fait |
|---|---|
| `js/ciel-fond.js` | **Neuf** — la couche de décor sur canvas : grain pré-rendu, trois nappes de profondeur, voiles, filaments, densité par surface, dégradation. |
| `js/ciel.js` | **Une option `fond`, inactive par défaut**, plus la mesure du coût d'image et la correction du redimensionnement en hauteur. |
| `css/ciel.css` | L'empilement des deux couches, **sans toucher à celui de RIVEN**. |
| `design/preview-lv5-galaxie.*` | La maquette plein écran, avec son bandeau de mesure. |
| `tests/smoke-lv5-fond.mjs` | **Neuf** — 27 verdicts. Ajouté à `tests/lancer.sh`. |

### Les chiffres — mesurés, pas regardés

| | 390 × 844 | 1670 × 900 |
|---|---|---|
| Grains | **1 266** | **5 200** (rapport **4,11** — une constante donnerait 1,00) |
| Plein écran | 100 % × 100 % | 100 % × 100 % |
| Débordement | 0 px | 0 px |
| Écart de phase | **0,00 px** | **0,00 px** (à 3 orientations **et** après redimensionnement) |
| Travail par image, charge réelle | **0,52 ms** | **2,29 ms** |
| Cadence, charge réelle | 16,4 ms | 18,5 ms |

Rappel du chemin : **130 grains fixes** hier → **1 266 à 5 200 selon la
surface** aujourd'hui, pour un travail JavaScript qui reste sous 4 ms.

**RIVEN et la coque LV4 sont intacts** : `smoke-ciel`, `smoke-lv4-ciel` et
`smoke-lv4-coque` ont tourné **avant la première ligne et après la dernière**,
verts les deux fois, **sans une retouche**.

**Patrimoine COMPLET vert, sortie 0** — `bash tests/lancer.sh` en entier, et
non les seuls harnais des fichiers modifiés (renfort du 2026-07-22 : c'est un
changement du moteur et d'une feuille partagée, exactement le cas où une
vérification partielle laisse passer un rouge invisible).

### 🔻 CINQ DÉFAUTS TROUVÉS — trois par la mesure, deux en regardant

1. **MON INSTRUMENT DE PERFORMANCE NE MESURAIT RIEN.** Le premier lisait
   l'intervalle entre deux images et répondait **16,4 ms partout** — sur un
   téléphone comme sur un écran de bureau, à 3 objets comme à 40. Il lisait la
   **cadence de rafraîchissement de l'écran**, pas le travail. Il aurait dit
   « budget tenu » jusqu'au jour où le ciel rame, et ce jour-là il aurait
   encore dit 16,4.
2. **ET LE SECOND NON PLUS, PAS TOUT SEUL.** Le remplaçant chronomètre
   l'intérieur de la boucle : il discrimine enfin (0,52 → 3,60 ms selon la
   charge). Mais sur 1670 × 900 à 40 objets, il annonçait **3,14 ms** pendant
   que la cadence réelle tombait à **44,6 ms**. Le coût n'est pas dans le
   JavaScript, il est dans ce que le navigateur paie à **composer** six
   mégapixels de canvas et quarante étoiles SVG. **Il faut les DEUX
   instruments** : chacun est aveugle à ce que l'autre voit.
3. **LA DÉGRADATION AUTOMATIQUE MANQUAIT.** Le cadrage l'exigeait au critère 8 ;
   je ne l'avais pas écrite. Ajoutée et **éprouvée** : au pire cas, le fond
   prend **1 cran** et rend de la place. Le critère distingue désormais *là où
   le produit vit* (≤ 12 objets — le registre n'en donne jamais plus de 4 à un
   écran) de *ce qui est construit pour casser*, où l'on exige la **réaction**
   et non la cadence. Même logique que le plancher d'occupation de LV4 : un
   seuil qui baisse se justifie par la physique, jamais par l'envie de passer.
4. **LE DÉCOR ÉCRASAIT CE QU'ON VIENT CHERCHER.** Toutes les mesures vertes, et
   sur l'image **ALTHEA était moins visible qu'un grain de poussière**. Un fond
   qui rivalise avec les objets n'est plus un fond. Corrigé par l'éclat (0,58)
   et la taille des grains (2,6 au lieu de 3,2, plafond 6 au lieu de 9) — et le
   grain lui-même était **laiteux** : son plateau central à 0,22 en faisait un
   flocon. À 0,10, c'est une étoile. *Aucun de ces deux défauts n'était visible
   dans un chiffre.*
5. **MON HARNAIS INTERROGEAIT UN POINT HORS CHAMP.** La phase revenait `null`
   dès qu'on tournait le monde — non parce que le moteur se trompait, mais
   parce que `projeter` rend `null` pour ce qui est passé **derrière** la
   caméra, ce qu'on lui demande. L'instrument choisit maintenant une étoile
   réellement dessinée, et « aucune étoile visible » est un **échec**, pas une
   excuse pour ne rien mesurer.

Et un seuil corrigé pour la même raison : « le fond reste-t-il sombre ? »
comptait les pixels au-dessus de **1/255** et trouvait 26,5 % d'un ciel que
l'œil voit noir. Le seuil d'un critère de **perception** doit être celui de la
perception : **8/255**. Fixé une fois, avec sa raison — pas remonté jusqu'à ce
que la mesure passe.

### 🔻 CE QUI N'EST PAS RÉSOLU, ET QUI DEVIENT L'OBJET DE P2

**LE MOBILIER RECOUVRE LES OBJETS.** Sur 390 px, vu sur capture : le bloc de
titre masque ULTIMA en haut, le bandeau de mesure masque ALPHA en bas. Le HUD
**ne vole aucun clic** (le harnais le prouve : au point d'une étoile, c'est
l'étoile que le document rend) — il les **cache**, ce qui est un défaut
distinct et que le critère 3 ne voit pas.

La cause est structurelle : le cadrage serré remplit 60 à 75 % de la plus
petite dimension, donc les objets vont jusqu'aux bords — précisément là où le
mobilier est posé. **La solution n'est pas de rétrécir le ciel, c'est
d'apprendre au cadrage qu'une partie du cadre est occupée** : une option de
marges réservées dans `distanceIdeale()`, haut et bas. C'est le cœur de P2, et
c'est trop près du cadrage serré pour être touché à la légère en fin de
soirée.

**Et la disposition en colonne est confirmée creuse** en plein écran : sur
1670, trois objets alignés verticalement laissent la largeur vide. La
question 3 reste ouverte, elle a maintenant une image pour l'illustrer.

---

# 12. P1 — le fond sur la coque de production. Livrée le 2026-08-16.

**Les deux arbitrages de forme sont rendus** par Paul, le soir même, sur la
maquette : « **fond avec les étoiles génial** », « **charge ok** ». L'éclat du
décor (0,58) et la densité sont donc **fixés** ; ils sortent des questions
ouvertes et ne se rejugent pas sans demande.

`ultima.html` — la seule coque déjà au ciel — allume la couche de fond. Le
changement tient en deux lignes : l'option dans `js/ciel-noeud.mjs`, et la
balise `<script>` dans la coque.

| | 390 × 844 | 1280 × 860 |
|---|---|---|
| Grains | **769** | **1 470** |
| Écart de phase | **0,23 px** | **0,21 px** |
| Travail par image | 0,39 ms | 0,77 ms |
| Poussière SVG restante | **0** | **0** |

### 🔻 DEUX DÉFAUTS, ET AUCUN N'ÉTAIT DANS LE RENDU

1. **UN GARDE QUI PROTÈGE D'UNE PANNE MASQUE AUSSI UN OUBLI.** Premier essai :
   option activée, **aucun canvas**, **zéro erreur console**, page
   parfaitement fonctionnelle. La coque n'avait pas la balise `<script>`, et
   le garde `options.fond && window.UltimaCielFond` du moteur avait fait
   exactement son travail — laisser vivre une page sans le module. Rien ne
   distinguait « pas demandé » de « demandé et introuvable ».
   **Le harnais EXIGE désormais le canvas sur cette coque** au lieu de s'en
   remettre au garde. Sans cette assertion, les huit coques de P3 auraient pu
   passer une à une avec la même option morte.
2. **LE REPÈRE D'UNE MESURE DE POSITION DOIT ÊTRE CELUI DE L'OBJET MESURÉ.**
   La maquette annonçait **0,00 px** de phase, la coque **1,60 px** — pour un
   code de projection *identique*. Le fond n'y était pour rien : la scène de
   production porte une **bordure d'1 px**, `getBoundingClientRect()` la compte
   (border box) et le canvas commence à l'intérieur (padding box). Je mesurais
   depuis un bord, le fond dessinait depuis l'autre. Depuis le repère du
   canvas : **0,21 px**. *Une bordure d'un pixel suffit à faire mentir un
   instrument juste par ailleurs — et c'est le quatrième de la journée.*

### Ce que P1 ne donne PAS encore

Le fond est visible sur la production, mais **discret** : la scène reste un
plateau encadré de 734 × 524, soit 1 470 grains contre 4 234 en plein écran, et
le dégradé du plateau l'éclaircit. **Le rendu que Paul a validé sur la maquette
demande le plein écran** — c'est P2, et c'est là que la finesse paiera vraiment.

### Prochaine action unique

**Ouvrir P2** — le plein écran sur `ultima.html`, avec le point dur déjà
identifié et cadré : les **marges réservées** dans `distanceIdeale()`, pour que
le cadrage sache qu'une partie du cadre est occupée par le mobilier.

---

# 13. P2 — le plein écran sur la coque de production. Livrée le 2026-08-17.

`ultima.html` **est** la galaxie : plus de plateau encadré, plus de colonne de
760 px. Le plateau devient le fond de l'écran, et tout le mobilier — retour,
bandeau, cartouche de Léo, légende — flotte dessus.

## 13.1 Le point dur n'était pas la CSS

Retirer le `max-width` n'aurait rien donné : la coque empilait dans le flux un
retour, un bandeau, un plateau et un cartouche ; la scène n'aurait eu que la
place restante, simplement plus large. **Le vrai obstacle était que le cadrage
ignore le mobilier** — il remplit 60 à 75 % de la plus petite dimension du cadre
ENTIER, donc il pousse les objets jusqu'aux bords, précisément là où le mobilier
est posé.

D'où la capacité ajoutée au moteur : **`margesUtiles`**, une zone où le ciel n'a
pas le droit de peindre. **Et elle demande DEUX choses, pas une** — c'est le
piège de l'étape :

1. la caméra **recule**, puisque la place utile est plus petite ;
2. le **centre optique se décale**, puisque le milieu de la zone utile n'est plus
   celui du viewBox. **Sans ②, on aurait reculé pour rien** : les objets
   resteraient centrés dans le cadre entier et continueraient d'entrer sous le
   mobilier, simplement plus petits.

Inactive par défaut : sans marges déclarées, `centreX()` et `centreY()` rendent
exactement le milieu du viewBox, et RIVEN comme la maquette ne voient aucune
différence — vérifié avant d'aller plus loin.

## 13.2 Les chiffres — mesurés

| | 390 × 844 | 1280 × 860 | 1670 × 900 |
|---|---|---|---|
| Plein écran | 100 % × 100 % | 100 % × 100 % | 100 % × 100 % |
| Débordement | 0 px | 0 px | 0 px |
| **Étoiles recouvertes** | **0** | **0** | **0** |
| Occupation de la **zone utile** | **71,8 %** | **72,2 %** | **69,4 %** |
| Occupation du cadre entier | 51,7 % | 54,8 % | 53,5 % |
| Marge réservée (haut / bas) | 153 / 84 | 119 / 81 | 91 / 62 |
| Contraste du titre | **16,4:1** | **10,6:1** | **11,6:1** |
| Grains | 1 266 | 4 234 | 5 200 |

Le fond passe de **1 470 grains** (P1, dans un plateau de 734 × 524) à **4 234**
en plein écran : c'est le rendu que Paul a validé sur la maquette.

## 13.3 ⚠️ UNE ASSERTION REMPLACÉE — le dénominateur, pas le seuil

`smoke-lv4-coque` a viré au rouge sur un seul point : « le ciel remplit le cadre
(≥ 60 %) — 51,7 % ». **C'est une conséquence arithmétique, pas une régression** :
un quart du cadre est désormais rendu au mobilier, donc exiger 60 % du cadre
entier revient à demander au ciel **83 % de la place qui lui reste** — ce que les
marges de libellé rendent impossible.

L'assertion est **remplacée**, avec sa raison écrite dans le harnais : le
contrôle ne change pas, **son dénominateur change**. Le ciel remplit sa **zone
utile** à 71,8 %, dans la fourchette de LV4 (65–75 %). *Baisser le seuil aurait
masqué le fait qu'il remplit très bien ce qu'on lui laisse ; un seuil qui baisse
se justifie par la géométrie, jamais par l'envie de passer.*

## 13.4 🔻 QUATRE DÉFAUTS TROUVÉS — deux dans le produit, deux dans mes instruments

1. **LE BANDEAU CHEVAUCHAIT LE BOUTON DE RETOUR** à 390 px : le retour occupait
   12→115 px, le bandeau centré commençait à 108. Sept pixels, vus sur capture.
   Un bandeau centré ne peut pas cohabiter avec un bouton d'angle sur 390 px,
   c'est de l'arithmétique : il descend sous la ligne du retour. Le cadrage n'a
   pas eu besoin d'être prévenu — la marge étant **mesurée**, elle a suivi.
2. **UNE MESURE PRISE UNE FOIS EST UNE CONSTANTE QUI A EU RAISON UN JOUR.**
   Premier jet : la coque mesurait le mobilier et passait un **objet** au moteur.
   Le harnais l'a pris en défaut en grossissant le titre — la marge haute restait
   à 119 pendant que le bandeau doublait de hauteur. `margesUtiles` accepte
   désormais une **fonction**, que le moteur rappelle à chaque redimensionnement :
   **c'est lui qui sait quand il a besoin de la réponse.** Vérifié : 119 → 315.
3. **MON INSTRUMENT COMPTAIT UN ÉLÉMENT INVISIBLE COMME UN DÉBORD.** Il déclarait
   « hors cadre » à 1670 px : l'étiquette de constellation, à (−30, −10). En
   cadrage serré, le moteur la **tait** (`opacity: 0`) et ne la positionne donc
   jamais — elle reste à l'origine avec son texte. `smoke-lv4-ciel` filtrait déjà
   sur l'opacité ; **reprendre sa définition valait mieux que d'en écrire une
   seconde**, et c'est la leçon : deux harnais qui mesurent la même chose de deux
   façons finissent par se contredire.
4. **ÊTRE CLIQUABLE ET ÊTRE VISIBLE SONT DEUX PROPRIÉTÉS DISTINCTES.** Le défaut
   qui a motivé P2 était invisible aux assertions existantes : `elementFromPoint`
   disait « l'étoile reçoit le geste » et c'était **vrai** — elle était
   simplement cachée sous le bandeau. Il fallait une **seconde** mesure, le
   chevauchement des boîtes peintes. Une assertion de captation ne dira jamais
   qu'un objet est masqué.

## 13.5 Ce qui reste ouvert — et P2 lui donne une image

**LA COLONNE EST CONFIRMÉE CREUSE.** Sur 1670 × 900, deux objets alignés
verticalement remplissent 69 % de la hauteur utile et laissent la largeur
presque vide. Verticalement le cadrage est juste ; c'est la **forme** qui est en
cause, et c'est la **question 3** du §10 — un parti pris visuel (couronne, ligne,
grille), pas une correction de cadrage. Je ne le prends pas seul.

## 13.6 Prochaine action unique

**Ouvrir P3** — les sept coques ordinaires, sur un module désormais éprouvé en
plein écran. Le piège est connu et le harnais le tient déjà : chaque coque doit
**exiger son canvas** au lieu de s'en remettre au garde du moteur.

---

# 14. P3 — les sept coques ordinaires au ciel. Livrée le 2026-08-17.

Les sept coques (`alpha`, `grima`, `naga`, `bcp`, `tao`, `imladrik`,
`adramelech`) rendent leur nœud en ciel, en plein écran. **`js/boussole-noyau.mjs`
ne sert plus qu'à `index.html`** — la racine, qui est P4.

## 14.1 La conversion est faite par un script qui REFUSE d'à-peu-près

Sept éditions à la main sur la même transformation, c'est sept occasions de
diverger. Le script exige les six motifs et **échoue bruyamment** si l'un manque
— ce qu'il a fait sur `imladrik.html`, dont le `<body>` porte un attribut de plus
(`data-quadrant`). Traitée à part, en conservant cet attribut : il n'appartient
pas à la boussole et rien ne dit qu'il ne sert pas ailleurs.

## 14.2 Le nom gravé sur la passerelle — une fonction à moitié portée depuis LV4

L'inventaire LV4 §13.1 listait comme fonction ④ « **la passerelle ET SON NOM
GRAVÉ** ». Le trait avait été porté ; le nom, non — l'adaptateur créait la
relation et **jetait `lienLibelle`**.

**Et la coque pilote ne pouvait pas s'en apercevoir** : `ultima-perso` n'a aucun
cap jumeau. La fonction avait donc été déclarée portée sur un écran *incapable de
la contredire* — exactement le piège du cap « à venir » en LV4, et il se referme
de la même façon : on éprouve une fonction là où elle EXISTE. Un seul écran en a,
TAO (reshiram ⇄ zekrom), et c'est désormais lui qui la garde.

Le nom vit dans son propre groupe, **pas** dans celui des traits : `gLiens` est
`aria-hidden` — un trait n'a rien à dire à un lecteur d'écran, mais
« ⇄ rétroplanning » est une information que l'étiquette d'aucune des deux étoiles
ne porte. L'y laisser aurait été peindre pour l'œil et se taire pour tout le
reste.

## 14.3 ~200 assertions reprises, chacune classée

`tests/_caps.mjs` — la lecture des caps, indépendante du support. Six harnais
posaient la même question (« qu'est-ce qu'un cap, comment le lit-on ») ; six
réécritures séparées, c'étaient six occasions de diverger. Il sert **les deux
supports**, ce qui est sa raison d'être pendant une migration en cours : la
racine reste en boussole jusqu'à P4.

| Abandonnée | Sa raison, écrite dans le harnais |
|---|---|
| Passerelle en `<path>`, en arc, milieu hors du médaillon | L'arc **contournait le médaillon central**, qui n'existe plus (descendu en sceau). Le détour n'a plus d'objet. |
| Le libellé suit le tracé (`textPath`) | Sur un segment qui tourne en volume, il s'écrirait **à l'envers** la moitié du temps. |
| « n aiguilles tracées » | L'aiguille joignait un **moyeu** ; un ciel n'en a pas. Remplacée par « n étoiles ». |
| « les caps dans l'ordre du registre » | Une constellation range par **géométrie**. |
| « est un lien `<a>` », `href`, `target`, `rel` | L'étoile est un `<g role="button">` : enveloppée d'une ancre, elle **perdait le focus clavier**. Remplacées par le clic et le repli. |

**Les assertions d'ordre sont SCINDÉES, pas abandonnées en bloc** : elles
portaient deux garanties de natures différentes. Que le *registre* déclare
GRIMA→[RIVEN, NICOL BOLAS] dans cet ordre ne dépend d'aucun support — c'est
conservé. Que le *DOM* les rende dans le même ordre, non.

## 14.4 🔻 CE QUE LA REPRISE A FAIT SORTIR

1. **UN DÉFAUT DE PRODUIT, ANTÉRIEUR À TOUT CE CHANTIER.** Le repli
   `<noscript>` d'IMLADRIK annonçait VRANESH et DRAUKHAIN « à venir » et **sans
   lien**, alors qu'ils sont bâtis depuis. **Deux tiers du quadrant étaient
   inatteignables sans JavaScript** — et personne ne pouvait le voir : on ne
   regarde ce repli qu'avec JS désactivé. Même faute qu'ALTHEA le 2026-08-06.
   Corrigé, et le harnais compare désormais **le repli au registre sur les sept
   coques**, pour que la liste ne puisse plus se périmer en silence.
2. **UN FAUX VERT DE MA MAIN.** « Halo allumé au survol » passait sur ALPHA par
   chance de timing : le halo a une transition de 120 ms et surtout **la scène
   glisse sous le curseur immobile** (approche asymptotique de la caméra), si
   bien que le `:hover` s'active et se désactive et que la valeur lue dépend de
   l'instant du déclic — 0,146 sur ALPHA, 0 sur IMLADRIK, pour un `:hover`
   pourtant actif dans les deux cas. Mesuré désormais **au focus**, qui ne dépend
   d'aucune position de souris et porte la garantie qui compte le plus.
3. **UNE ERREUR DE MÉTHODE DE MA PART.** Pour remplacer ce bloc dans deux
   harnais, j'ai appliqué un **regex structurel** — il a mangé le début des deux
   fichiers. Restaurés depuis git, réappliqués par **ancrage sur du texte
   exact**. *Un remplacement doit s'accrocher à ce qui est écrit, jamais à une
   structure devinée.*
4. **`hover()` VISE LE CENTRE D'UNE BOÎTE, PAS UNE SURFACE UTILE.** Celle du
   groupe englobe le nom peint sous l'étoile : son centre tombe **entre les
   deux**, sur du vide. On survole la zone de captation, faite pour le geste.

## 14.5 Vérification

**Patrimoine COMPLET vert, sortie 0** — dont `smoke-vranesh` (232 assertions),
`smoke-ciel`, et les trois harnais LV5. Relancé **sans aucune édition en cours
d'exécution** : le run précédent avait été pollué par mes modifications, et un
verdict rendu pendant qu'on change le code ne vaut rien.

## 14.6 Prochaine action unique

**Ouvrir P4 — la racine (`index.html`)**, le seul écran encore en boussole et
celui que Paul juge. Elle passe en dernier, sur un module éprouvé huit fois.

---

# 15. La couronne, l'étoile affinée, le fond partout. 2026-08-17.

## 15.1 « Il faut les mêmes standards partout »

Paul, devant ULTIMA : « la rotation n'est pas folle, ça ne me paraît pas à la
page par rapport à ce qui existe ailleurs ». **Réponse : les Gémeaux ne sont pas
un cas spécial, c'est le cas n = 2 d'une COURONNE** qui range tous les écrans de
navigation. La veille, j'avais réservé l'opposition aux caps *jumeaux* en
arguant qu'opposer deux caps sans lien « affirmerait une symétrie que le registre
ne déclare pas » ; c'était défendable et ça faisait une **exception**. Un outil
qui range ses écrans de trois façons n'a pas de forme.

| Écran | Avant (écart horizontal) | Après |
|---|---|---|
| ULTIMA (2 caps) | **0** | **905** |
| NAGA (3), NICOL BOLAS (4) | amas de réseau | couronne, 0,75–0,78 d'occupation |

## 15.2 L'étoile affinée

« Peut-on affiner ? une étoile plus brillante et fine peut-être ? » Le coupable
était la **corolle** : un disque de 1,7 rayon à 75 % d'opacité qui écrasait tout
le reste — d'où la « pastille grise ». Réduite à un liseré (1,15) ; les branches
deviennent des **rais** (4,6 rayons de long, base 4× plus fine) ; le cœur passe
au blanc pur.

Et surtout : **sur un menu, la profondeur n'a plus le droit d'éteindre une
entrée.** Les caps sortaient à 0,49 / 0,66 / 0,69 d'opacité — la moitié de
l'éclat perdue par un effet réglé pour RIVEN, où l'estompage porte une
information (des centaines de fiches se chevauchent) et où il la garde. Sur un
menu de deux à quatre caps, il n'informe de rien et fait hésiter à cliquer.
Plancher à **0,82**.

## 15.3 Le fond étoilé sur RIVEN aussi — mais pas la couronne

« Mettre le fond aux étoiles partout. » Fait, y compris sur le ciel du réseau.
**Le fond est un décor, la disposition est une donnée** : l'un se partage
partout, l'autre non — chez RIVEN la position d'une étoile dit son métier.

## 15.4 🔻 QUATRE CORRECTIONS MESURÉES, ET UNE RETIRÉE

La couronne, à son premier jet, a **cassé le mobile** : elle étalait
horizontalement là où la largeur est la dimension courte (ULTIMA 0,72 → 0,55).

1. **Elle devient une ELLIPSE**, d'aspect calculé sur la place laissée aux
   étoiles et non sur le cadre brut. *NAGA 0,20 → 0,696.*
2. **L'axe de l'opposition suit la dimension LONGUE.** « En opposé » ne dit pas
   « à l'horizontale » : haut/bas en est une aussi, et c'est la seule qui
   remplisse un cadre étroit. *ULTIMA 0,55 → 0,718.*
3. **Les noms longs vont aux positions verticales.** Un nom en position latérale
   extrême déborde de toute sa demi-largeur, et c'est elle qui borne la caméra ;
   le même nom en haut ne coûte qu'une ligne. *ADRAMELECH 0,337 → 0,608 — son cap
   s'appelle « RAPPROCHEMENTS ».*
4. **Lever le plancher de distance : RETIRÉ.** Je pensais que ce garde-fou
   bridait la couronne (elle est plate, donc rien à traverser). Mesuré : 0,588 et
   0,500 **avant comme après**. Diagnostic faux, modification retirée — *une
   correction qui ne prouve rien ne reste pas dans le code.*

**Deux défauts de ma main**, et le second explique le premier :
- une étoile recouverte par le bandeau sur les **quatre** écrans à 3-4 caps. J'ai
  accusé la couronne ; la cause était un remplacement de bloc fait **aux
  indices**, qui avait supprimé `margesUtiles` en passant ;
- **mon harnais n'éprouvait qu'`ultima.html`**, à 2 caps. Le critère central de
  P2 était juste et regardait ailleurs. Il couvre désormais les **sept** coques,
  aux deux tailles. *Un critère qui vaut pour une famille s'éprouve sur toute la
  famille, et d'abord sur ses cas extrêmes.*

## 15.5 ⚠️ CE QUI RESTE OUVERT — un rouge non élucidé, consigné et non contourné

`smoke-alpha` échoue sur **une** assertion : « halo allumé au focus ».

**Le produit est juste** — mesuré sur `alpha.html` : `:focus-visible` actif,
opacité du halo **0,9**. Reproduit aussi la séquence survol → focus du harnais :
`:focus-visible` reste vrai. Le rouge vient donc de l'enchaînement complet du
fichier, et **je n'ai pas la cause**.

Deux hypothèses éliminées par la mesure : (a) `:focus-visible` perdu après un
clic souris — faux, la repro le garde ; (b) un `hover()` qui échouait
silencieusement avant la couronne et réussit depuis — faux également.

**Rien n'est fusionné dans `main` tant que ce point n'est pas élucidé**, et trois
retouches du harnais l'ont déplacé sans l'expliquer : elles ont été **annulées**,
le harnais est remis dans sa version d'origine. *Un test qu'on fait passer sans
comprendre pourquoi il échouait ne prouve plus rien — cette session a déjà
corrigé deux faux verts, on n'en fabrique pas un troisième.*

**Piste pour la reprise** : instrumenter la modalité (`:focus-visible`) à chaque
étape du fichier plutôt qu'à la fin, pour trouver *laquelle* la fait basculer.

---

# 16. CADRAGE P5/P6 — les pages de travail entrent au ciel

> Demandé par Paul le 2026-08-17 : « **go embarque-les aussi et crée un affichage
> cohérent en conséquence, en fonction des projets** ».
> Format 6 points. **Cadrage : rien n'est écrit avant le gate du §16.7.**

## 16.1 Le piège à éviter, nommé d'avance

« Mettre le fond partout » sur seize pages, page par page, donnerait **seize
décisions séparées** — c'est-à-dire aucune forme. Et une page de travail n'est
pas un menu : elle porte des formulaires, des listes, des tableaux de chiffres,
un registre détaillé. **Un ciel ne remplace pas un formulaire** (l'argument de
LV4 §13.6 reste vrai ; ce qui a changé, c'est qu'on ne s'en sert plus pour
refuser le chantier).

## 16.2 ① Le but — le principe unificateur

**Le fond étoilé devient le SOL COMMUN d'Ultima. Ce qui varie d'une page à
l'autre, ce n'est pas le fond : c'est la densité du mobilier posé dessus.**

C'est ça, « cohérent en fonction des projets » : une seule règle, trois
applications, déduites de ce que la page **fait** — et non du quadrant auquel
elle appartient, qui ne dit rien de son ergonomie.

| Registre | Ce que la page fait | Le mobilier | Pages |
|---|---|---|---|
| **① Ciel** | on explore, on choisit | aucun : la galaxie EST la page | les 8 coques + RIVEN — **fait** |
| **② Atelier** | on saisit, on relie, on écrit | cartouches de parchemin **posés sur** la nuit, le fond visible autour | VRANESH, DRAUKHAIN, MINETHNIR, ÉCRIRE, les archipels, les rapprochements |
| **③ Instrument** | on lit des chiffres, on compare | le parchemin **domine**, la nuit n'est qu'une bordure | l'abaque, les impôts, l'échéancier, revenus-charges, ALTHEA |

**La règle qui départage ②/③, et qui est mesurable** : si la page porte un
tableau ou une série de chiffres à comparer, elle est un **instrument** — un fond
mouvant derrière des colonnes de nombres nuit à la lecture, et aucune beauté ne
rachète un chiffre mal lu. Sinon, c'est un **atelier**.

## 16.3 ② Les étapes — une par registre, pas une par page

1. **P5a — la couche de fond commune.** `css/ciel-fond-page.css` : le canvas en
   fond fixe, `aria-hidden`, `pointer-events: none`, derrière tout contenu. Un
   seul fichier, inclus par les pages des registres ② et ③. **Aucun contenu
   déplacé.**
2. **P5b — le registre ATELIER sur une page pilote : VRANESH.** C'est la plus
   lourde (232 assertions, trois blocs de travail) et celle que Paul a nommée. Si
   le registre tient sur VRANESH, il tient partout.
3. **P5c — sa boussole interne devient un ciel** (« que je n'aie plus l'ancien
   affichage de la boussole »). C'est l'arbitrage **C** du §3.3, que Paul avait
   laissé ouvert et que cette demande tranche de fait.
4. **P6a — les cinq autres ateliers**, sur le registre éprouvé.
5. **P6b — le registre INSTRUMENT**, sur l'abaque d'abord (le plus chargé en
   chiffres).
6. **P6c — les quatre autres instruments.**

## 16.4 ③ Les moyens

| Créé | `css/ciel-fond-page.css` · `tests/smoke-lv5-pages.mjs` |
|---|---|
| **Modifié** | les `<head>` des pages concernées (deux lignes chacune) · `css/vranesh-boussole.css` (P5c) |
| **Intouché** | **`css/boussole.css`** tant qu'une page y bâtit · le registre · les API · la base · les formulaires et leur logique — **on change le sol, pas le travail** |

## 16.5 ④ Critères de réussite — mesurés

1. **Aucun contenu ne bouge** : pour chaque page, la boîte de chaque bloc de
   travail est comparée **avant/après**, tolérance 2 px. Le fond arrive derrière,
   il ne pousse rien.
2. **Aucun geste volé** : `elementFromPoint` sur chaque champ, chaque bouton,
   chaque lien — c'est le canvas qui doit être transparent, pas la page.
3. **Le contraste tient**, mesuré contre le **pire pixel réellement peint** sous
   chaque bloc de texte (l'instrument de P2, réemployé).
4. **Les instruments restent lisibles** : sur les pages du registre ③, la
   luminance du fond sous un tableau ne dépasse pas un seuil mesuré — le fond y
   est une bordure, pas une nappe.
5. **Le budget d'image tient** aux deux tailles, dégradation comprise.
6. **VRANESH INTACT** : `smoke-vranesh` (232 assertions) vert **avant la première
   ligne et après la dernière**.
7. **Patrimoine COMPLET vert.**

## 16.6 ⑤ Ce qu'on ne fait PAS

- **On ne touche à aucun formulaire, aucune liste, aucun calcul.** Le sol change,
  le travail non.
- **On ne met pas de ciel 3D sur une page de travail** : le fond est peint, il
  n'est pas navigable. Deux ciels sur un écran, dont un décoratif, se
  disputeraient le regard.
- **On ne convertit pas seize pages d'un coup** : une page pilote par registre.
- **On ne fusionne rien** tant que le rouge du §15.5 n'est pas élucidé.

## 16.7 ⑥ Pre-mortem — et le gate

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **Un fond mouvant derrière des chiffres** rend un tableau pénible à lire. | Le registre ③ : la nuit devient une bordure. Critère 4, mesuré. |
| 2 | **Le canvas vole un clic** dans un formulaire — et on ne le voit qu'en essayant de saisir. | Critère 2, sur chaque champ. |
| 3 | **Le fond pousse le contenu** et la page se met à défiler autrement. | Critère 1, avant/après à 2 px. |
| 4 | **VRANESH se déshabille** : sa feuille bâtit sur `boussole.css`. | Critère 6, et `boussole.css` intouchée. |
| 5 | **Seize pages, seize décisions.** | §16.2 : une règle, trois registres, une pilote par registre. |
| 6 | **La batterie** : un canvas animé sur une page où l'on reste vingt minutes à écrire. | Le fond des pages de travail est **peint une fois**, sans boucle d'animation — il n'y a pas de caméra à suivre. À éprouver. |

**Le gate.** Une seule question pour Paul, et elle décide du reste :
**le classement ②/③ ci-dessus est-il le bon ?** Nommément : l'abaque, les impôts,
l'échéancier, revenus-charges et ALTHEA en **instruments** (parchemin dominant,
fond discret) ; VRANESH, DRAUKHAIN, MINETHNIR, écrire, archipels, rapprochements
en **ateliers** (cartouches posés sur la nuit). Si ce partage est juste, le reste
n'est que de l'exécution.
