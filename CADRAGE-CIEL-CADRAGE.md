# CADRAGE — Le ciel tient dans l'écran

> Format 6 points (**directive EL**). Demande de Paul, 2026-08-12, capture à
> l'appui : *« j'aimerais tout voir sur le même écran, toutes mes
> constellations d'un coup d'œil »*. Arbitrage retenu : **corriger le cadrage
> du ciel existant**, pas créer une vue à plat.

---

## 0. Le défaut — et la première hypothèse, fausse, que la mesure a tuée

**Ma première hypothèse était fausse, et je la laisse écrite.** J'avais calculé
que le monde construit atteignait un rayon de **322** là où `distanceIdeale()`
n'en suppose que **300** : le monde débordait donc « par construction ». J'avais
pris `rr = rayonAmas` à pleine valeur et oublié la compression verticale
(`× 0,72`) comme la modulation du rayon d'amas.

**Mesuré sur six configurations, dont trois pires cas construits :**

| Réseau | Rayon **mesuré** | Étoiles hors cadre (ancien calcul) |
|---|---|---|
| démo (9 nœuds) | 256 | **0** |
| réseau de Paul (~15) | 273 | **0** |
| 14 constellations à 1 nœud | 278 | **0** |
| 20 constellations à 1 nœud | 278 | **0** |
| 1 constellation de 40 | 255 | **0** |
| 30 constellations mixtes (90 nœuds) | 277 | **0** |

**Le rayon ne dépasse jamais 300, et aucune étoile ne sortait jamais du
viewBox.** Le cadrage n'était pas le défaut. *Si j'avais « corrigé » sur cette
hypothèse, j'aurais éloigné la caméra — donc rapetissé le ciel — pour résoudre
un problème inexistant, et Paul aurait vu l'inverse de ce qu'il demandait.*

### Le vrai défaut, mesuré au navigateur

Sur l'écran de la capture de Paul (**1670 × 900**) :

| | |
|---|---|
| Hauteur de la scène `#ciel-scene` | **689 px** |
| Hauteur du SVG à l'intérieur | **934 px** |
| **Coupé par `overflow: hidden`** | **245 px — un quart du ciel** |
| Page défilable ? | **non** (`scrollHeight` = `innerHeight`) |

`.ciel-svg` portait `height: auto` : sa hauteur se déduisait de la **proportion
du viewBox** (`vbH = vbW × 0,56`) appliquée à la largeur rendue. Sur un écran
**large et court**, cette proportion réclame plus de hauteur que la page n'en
offre. Le bas du réseau n'était pas « hors champ » — il était **supprimé, sans
que rien ne le dise**, et sans possibilité de défiler pour l'atteindre.

Sur mobile (390 × 844) le défaut **n'existe pas** : la proportion 1,02 tient
dans la boîte. **C'était le seul écran éprouvé par le harnais** — l'échantillon
favorable, encore une fois.

### Ce que le harnais ne pouvait pas voir

`smoke-ciel.mjs` mesurait les couleurs, les motifs de liens, la cible tactile
et le clavier. **Jamais le rapport entre le dessin et sa boîte.** Une géométrie
se mesure (règle du 2026-08-01) — mais on l'avait entendue comme « les éléments
tiennent dans le viewBox », alors que le viewBox lui-même peut être coupé.
*La bonne question n'est pas « le dessin tient-il dans son cadre ? » mais
« le cadre tient-il dans l'écran ? ».*

## 1. ① Le but

À l'ouverture du Ciel, **toutes les constellations de Paul sont visibles dans
le cadre**, quel que soit leur nombre et quelle que soit la taille de l'écran.
Et après avoir zoomé, **un geste** y ramène.

## 2. ② Les étapes

1. **LE CORRECTIF : le cadre suit la boîte réelle.** `.ciel-svg` passe en
   `height: 100%`, `.ciel-scene` prend la hauteur restante (`flex: 1`), et
   `dimensionner()` déduit `vbH` de `clientHeight` au lieu d'une proportion
   choisie a priori. Le SVG remplit exactement sa boîte : plus rien à couper.
2. **Mesurer le monde au lieu de le supposer.** `construireMonde` renvoie le
   **rayon réellement occupé**. Comme il est PLUS PETIT que la constante,
   cadrer dessus **rapproche** la caméra : les étoiles grossissent.
3. **Le plancher `430` disparaît.** C'était une constante de confort ; elle
   contredit le principe même de la fonction — le recul se DÉDUIT, il ne se
   plafonne pas par le bas. Provision de libellé réglée à **20**, valeur
   mesurée suffisante sur les six configurations — et pas davantage.
4. **Bouton « Tout voir »** à côté de `+` / `−` : remet `zoom = 1`, donc le
   cadrage mesuré. Libellé accessible, cible ≥ 24 px.
5. **Harnais** : `tests/smoke-ciel.mjs` reçoit une passe **géométrie** —
   chaque étoile et chaque libellé **dans** le cadre — sur un **pire cas
   construit**, pas sur la démo.

## 3. ③ Les moyens

| Fichier | Nature |
|---|---|
| `css/ciel.css` | **le correctif** : `height: 100%`, `flex: 1` sur la scène |
| `js/ciel.js` | `dimensionner()` suit la boîte ; rayon mesuré ; `toutVoir()` |
| `riven.html` | 1 bouton dans `.ciel-zoom` |
| `js/app.js` | **7 lignes** : le branchement du bouton, rien d'autre |
| `tests/smoke-ciel.mjs` | passe « tient dans la boîte » + pire cas |

> *Amendé pendant l'implantation* : j'avais écrit « `js/app.js` intouché » et
> « `css/styles.css` touché ». Les deux étaient faux — le bouton se branche
> forcément dans `app.js` (7 lignes), et son habillage appartient à
> `css/ciel.css`, pas au parchemin. Corrigé plutôt qu'effacé.

**Intouchés, et c'est un critère** : `js/arbre.js`, `js/carte.js`,
`api/**`, `supabase/**`. Aucune donnée, aucune migration.

## 4. ④ Les critères de réussite — vérifiables

- **C1 (LE critère)** — le SVG tient **dans sa scène** : aucune coupe en haut,
  en bas, à gauche ni à droite (tolérance 1 px de sous-pixel), à 390 px **et**
  sur **1670 × 900**, l'écran de la capture. Et **le harnais doit virer au
  ROUGE si on rétablit l'ancien code** — sans quoi il ne prouve rien.
- **C2** — les étoiles et les libellés dans le viewBox, sur un **pire cas
  construit**. Ce critère passait déjà : il est ajouté pour qu'une régression
  future ne puisse plus passer inaperçue, pas parce qu'il est rouge aujourd'hui.
- **C3** — le ciel de la **démo** reste correct : aucune régression des 
  verdicts existants de `smoke-ciel`.
- **C4** — « Tout voir » après un zoom avant : le pire écart d'une étoile au
  centre **redevient** celui de l'ouverture (à la tolérance d'animation près).
- **C5** — la cible tactile de « Tout voir » **mesurée** ≥ 24 px à 390 px.
- **C6** — `js/arbre.js`, `js/carte.js`, `api/**`, `supabase/**` : **zéro
  ligne de diff** ; `js/app.js` limité au branchement du bouton.
- **C8** — **aucun verdict ne dépend d'une attente à l'heure.** La caméra
  converge par interpolation : un `waitForTimeout` fixe mesure un transitoire
  et vire au rouge dès que la machine est chargée. Les verdicts attendent la
  **stabilité mesurée**.
- **C7** — patrimoine COMPLET vert.

## 5. ⑤ Ce qu'on ne fait PAS

- **Pas de vue à plat.** Arbitrage de Paul : on corrige le ciel existant.
- **Pas de refonte du placement** des constellations. Le monde est bon ; c'est
  la **caméra** qui le cadre mal. Déplacer les étoiles pour les faire tenir
  serait traiter le symptôme et casser la lecture « le réseau a un cœur ».
- **Pas de changement des bornes de zoom** ni de la dérive.

## 6. ⑥ Pre-mortem

| # | Mode de défaillance | Ce qui le prévient |
|---|---|---|
| **P1** | **On corrige sur la démo, et ça déborde encore chez Paul.** La démo a 9 nœuds bien répartis : c'est l'échantillon favorable qui a masqué le défaut pendant un mois. | **C1 exige un PIRE CAS CONSTRUIT**, pas les données du jour. Le harnais fabrique le réseau qui maximise l'éloignement. |
| **P2** | **On oublie le libellé.** Les étoiles tiennent, les noms de constellations sont coupés en haut — et c'est ce que Paul voit en premier. | **C2 le mesure séparément.** Le libellé a son propre verdict. |
| **P3** | **Reculer trop** : tout tient, mais le réseau devient un pointillé illisible au centre. | La provision est **calculée**, pas majorée à la louche : rayon mesuré + débord de libellé, et rien de plus. Le rendu de la démo est comparé avant/après (C3). |
| **P4** | **Le rayon mesuré coûte cher** s'il est recalculé à chaque image. | Il est calculé **une fois** dans `construireMonde` (fonction pure, appelée au montage), jamais dans la boucle d'animation. |
| **P5** | **Réseau vide ou à un seul nœud** : rayon 0 → division par zéro ou recul absurde. | Plancher explicite sur le rayon mesuré, testé sur un réseau à **une** fiche. |
| **P6** | **« Tout voir » ne fait rien de visible** parce que le zoom était déjà à 1. | Le verdict C4 zoome AVANT, puis mesure le retour. Un bouton qu'on ne peut pas voir agir n'est pas testé. |
| **P8** | **Un verdict flottant** : vert lancé seul, rouge dans la suite complète. C'est arrivé, et deux fois. | Les mesures d'animation attendent la **convergence** (deux relevés identiques), jamais une durée. *Un test qui dépend de la charge machine ne prouve rien : il annonce au hasard.* |
| **P7** | **Une session parallèle nous double.** | Rebase et fusion sans délai ; conflit sur `JOURNAL-DECISIONS.md` résolu **par concaténation**. |
