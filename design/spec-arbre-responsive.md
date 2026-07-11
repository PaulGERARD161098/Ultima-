# Spec — Arbre responsive en largeur (A3)

> Registre antique sérieux, mobile-first, patch minimal. Léo spécifie ;
> `front-carto` implémente ; `verificateur` constate. Aucun code modifié ici.

## (a) Intention (3 lignes)

L'Arbre garde sa croissance en **hauteur** (bon), mais cesse d'être une colonne
étroite figée à ~620 px : sur grand écran il **s'élargit par paliers** (plus de
colonnes de feuilles ⇒ moins de rangées ⇒ arbre plus court et plus large), à
l'échelle physique de feuille **constante** (~178 px de large partout). Le mobile
reste **pixel-identique à aujourd'hui** ; le layout demeure une **fonction pure**
de `(données, largeur-cible)`, donc déterministe et re-render sur `resize` débouncé.

## Principe directeur : palier = fonction en escalier de la largeur mesurée

- Le layout devient `calculerLayout(noeuds, largeurCible)`. `largeurCible` est la
  **largeur réelle du conteneur au rendu** (`#arbre-scene.clientWidth`, en px).
- Un helper **pur** `choisirPalier(largeurPx)` mappe cette largeur continue vers
  un palier **discret** `{ cols, vbW }`. Comme c'est une fonction en escalier,
  une même largeur donne toujours le même palier ⇒ même `VB_W`, mêmes colonnes,
  mêmes positions, même DOM. Déterminisme garanti par construction.
- Règle de choix : **le plus grand palier dont `vbW ≤ largeurCible`**, avec un
  palier de base (mobile) comme plancher. Les seuils `minLargeur` sont **égaux**
  aux `vbW` des paliers desktop : au seuil, le SVG s'affiche à l'échelle 1
  (`width = min(100%, vbW) = largeurCible`), sans jamais dépasser le conteneur.

## (b) Tableau des paliers

`FEUILLE_W = 178`, `GAP_X = 14`. Grille = `cols·178 + (cols−1)·14`.
Garde no-scroll-X **interne** (viewBox) : `grille ≤ VB_W`.

| Palier | `cols` | Grille interne (`cols·178+(cols−1)·14`) | `VB_W` | Marge (`VB_W−grille`) | Déclencheur `clientWidth` | Cap CSS `max-width` |
|-------:|:------:|:----------------------------------------|:------:|:---------------------:|:--------------------------|:-------------------:|
| **Base / mobile** | 3 | `3·178+2·14 = 562` | **620** | 58 | `< 820` (plancher, défaut) | **640 px** (inchangé) |
| **P4** (tablette large / petit desktop) | 4 | `4·178+3·14 = 754` | **820** | 66 | `≥ 820` | **820 px** |
| **P5** (desktop) | 5 | `5·178+4·14 = 946` | **1040** | 94 | `≥ 1040` | **1040 px** |
| **P6** (desktop large) | 6 | `6·178+5·14 = 1138` | **1240** | 82 | `≥ 1240` | **1240 px** |

**Justification des seuils/nombres :**
- **Base = 3 col / VB_W 620 / cap 640 px** : reprend **exactement** les constantes
  actuelles. À 390 px de viewport (≈ 377 px de conteneur), le SVG s'affiche à
  `width:100%` (le cap 640 ne mord pas), échelle `377/620 ≈ 0,608`, feuille ≈ 108 px —
  **identique au rendu d'aujourd'hui**. Couvre téléphones + tablettes portrait
  (~768 px : arbre 620 px centré, non compressé, dans la fourchette « 3-4 col »).
- **Seuils = `vbW`** (820, 1040, 1240) : au déclenchement `clientWidth = vbW`, donc
  `min(100%, vbW)` vaut exactement la largeur dispo ⇒ échelle 1, aucun débordement,
  aucune sur-réduction. Au-dessus du seuil, SVG à taille naturelle **centré** (le
  parent a déjà `justify-content:center`), avec du mou latéral propre.
- **Marges `VB_W − grille` de 58 à 94 px** : ≥ à la marge actuelle (58), donc le
  garde-fou RB1 « broussaille » (espacement mini garanti) n'est **jamais** réduit.
  L'espacement inter-feuilles (`GAP_X = 14`, `GAP_Y = 14`) est **inchangé** à tous
  les paliers — on ajoute des colonnes, on ne resserre rien.
- **Échelle de feuille ≈ constante (~178 px) sur tout le desktop** : chaque palier
  s'affiche à l'échelle ~1. Un daltonien garde le double codage (couleur + type en
  toutes lettres + trait) intact : aucune couleur, police ni graphie ne change.
- **Plafond à 6 colonnes** : au-delà, les rangées deviennent trop larges à balayer
  de l'œil pour un secteur donné ; 6 remplit un 1440 p sans diluer la lecture.
  (Clustering / densité 100+ nœuds : hors scope de cette boucle, le palier ne
  change pas le nombre de feuilles, seulement leur répartition.)

**Preuve no-scroll-X, deux couches :**
1. *Interne (viewBox)* — `grille ≤ VB_W` : `562≤620`, `754≤820`, `946≤1040`,
   `1138≤1240`. ✅ à chaque palier.
2. *Affichage (CSS)* — `svg.width = min(100%, capCSS)` et `capCSS = vbW ≤ clientWidth`
   au palier choisi ; `#arbre-scene` a déjà `overflow-x:hidden`. La page ne peut
   donc pas défiler horizontalement, à aucun palier. ✅

## (c) Mécanique de rendu déterministe + resize débouncé

**Signature pure** (dans `js/arbre.js`) :

```js
// Table de paliers (ordre décroissant). minLargeur == vbW pour les paliers
// desktop : au seuil, l'affichage est à l'échelle 1 sans débordement.
var PALIERS = [
  { minLargeur: 1240, cols: 6, vbW: 1240 },
  { minLargeur: 1040, cols: 5, vbW: 1040 },
  { minLargeur:  820, cols: 4, vbW:  820 },
  { minLargeur:    0, cols: 3, vbW:  620 }  // base / mobile (plancher)
];

// PUR : même entrée -> même sortie. Aucune lecture DOM, aucun état.
function choisirPalier(largeurPx) {
  var l = (typeof largeurPx === 'number' && largeurPx > 0) ? largeurPx : 0;
  for (var i = 0; i < PALIERS.length; i++) {
    if (l >= PALIERS[i].minLargeur) return PALIERS[i];
  }
  return PALIERS[PALIERS.length - 1]; // base
}

// calculerLayout(noeuds, largeurCible) : largeurCible absente/0 -> palier base
// (rétro-compat totale de l'appel existant calculerLayout(noeuds)).
function calculerLayout(noeuds, largeurCible) {
  var palier = choisirPalier(largeurCible);
  // ... remplacer MAX_COL par palier.cols et VB_W par palier.vbW ...
  // layout.largeur = palier.vbW ; layout.viewBox = '0 0 ' + palier.vbW + ' ' + hauteur ;
}
```

**Mesure au rendu** (`rendre(conteneur, noeuds, options)`) :

```js
var largeurCible = conteneur.clientWidth;      // #arbre-scene, px réels
var palier = window.UltimaArbre.choisirPalier(largeurCible);
var layout = calculerLayout(noeuds, largeurCible);
// Marqueur de palier pour la CSS (attribut, PAS de style inline -> CSP OK) :
conteneur.setAttribute('data-palier', String(palier.cols)); // "3" | "4" | "5" | "6"
```

`clientWidth` inclut le padding de `#arbre-scene` (~6,4 px de chaque côté). Les
marges de palier (58–94 px) absorbent largement ces ~13 px : on utilise
`clientWidth` **brut**, sans soustraction, ce qui garde la mesure simple et le
choix déterministe. Un conteneur détaché (`clientWidth === 0`, cf. bloc perf du
test) tombe sur le palier base — déterministe.

**Resize débouncé** (dans `js/app.js`, là où vit `rendreArbre()` / `etat.noeuds`,
enregistré **une seule fois**) :

```js
var _palierArbre = null, _tResize = null;
window.addEventListener('resize', function () {
  clearTimeout(_tResize);
  _tResize = setTimeout(function () {
    var scene = document.querySelector('#arbre-scene');
    if (!scene || !estArbreVisible()) return;                 // pas de travail inutile
    var p = window.UltimaArbre.choisirPalier(scene.clientWidth).cols;
    if (p === _palierArbre) return;                            // palier inchangé -> no-op
    _palierArbre = p;
    rendreArbre();                                            // re-render pur, même chemin
  }, 150);                                                     // débounce 150 ms
});
```

- **Débounce 150 ms** : coalesce les rafales de `resize` (drag de fenêtre).
- **Court-circuit « palier inchangé »** : on ne re-render que si le palier change
  réellement — idempotence, zéro churn tant qu'on reste dans une bande.
- **Aucune dépendance nouvelle** : `window.resize` + `setTimeout` natifs. (Un
  `ResizeObserver` serait plus fin si le conteneur bougeait sans resize fenêtre,
  mais l'espace arbre est pleine largeur : inutile pour cette boucle.)
- **Exposer** `choisirPalier` sur `window.UltimaArbre` (à côté de `calculerLayout`,
  `rendre`) pour la comparaison de palier et pour les tests.

## (d) Règle CSS exacte (`css/styles.css`, section « Espace Arbre », ~l.2079)

**Avant :**

```css
.arbre-svg {
  width: min(100%, 640px);
  height: auto;
  flex: none;
}
```

**Après** (largeur adaptative pilotée par `data-palier`, aucun style inline) :

```css
.arbre-svg {
  width: 100%;
  max-width: 640px;   /* base / mobile : identique à min(100%, 640px) */
  height: auto;
  flex: none;
}
.arbre-scene[data-palier="4"] .arbre-svg { max-width: 820px; }
.arbre-scene[data-palier="5"] .arbre-svg { max-width: 1040px; }
.arbre-scene[data-palier="6"] .arbre-svg { max-width: 1240px; }
```

- `width:100% + max-width:640px` ≡ l'actuel `min(100%,640px)` : **base inchangée**.
- Le SVG s'élargit jusqu'au `VB_W` du palier, **centré** (le `justify-content:center`
  existant de `.arbre-scene` est conservé), **sans jamais** dépasser le conteneur
  (`max-width = vbW ≤ clientWidth` au palier choisi ; `overflow-x:hidden` conservé).
- `#arbre-scene` porte l'attribut ⇒ sélecteur `.arbre-scene[data-palier="…"]`.
  (Si le marqueur DOM réel est `id`, utiliser `#arbre-scene[data-palier="…"]`.)

## (e) Impact sur `tests/smoke-arbre.mjs`

**Fait de cadrage à corriger dans la consigne :** ce harnais tourne **au seul
viewport 390×844** (l.20), pas « 1280 + 375 ». À 390 px, `clientWidth ≈ 377 <
820` ⇒ **palier base (3 col, VB_W 620)** ⇒ le rendu est **strictement identique
à aujourd'hui**. Conséquence : **aucun verdict existant ne change de valeur** au
mobile — ni `groupeParSecteur`, ni `premiereGraphieTri`/`branche0`, ni les
comptages, ni `pasDeScrollHorizontal`. Les fixtures démo et de test ont toutes
des branches ≤ 3 contacts, donc le nombre de rangées ne dépend pas des colonnes.

Ce qui doit être **fait** pour prouver l'élargissement (sinon la feature est
invisible au harnais) :

1. **Pin explicite du palier dans le bloc `pur`** (l.195-196, 206) — remplacer
   `calculerLayout(fixtures)` par `calculerLayout(fixtures, 620)` et
   `rendre(div, gros, …)` inchangé (div attaché → base). Effet : `groupeParSecteur`
   (`nbBranches===3 && nbContacts===5`), `premiereGraphieTri`
   (`branche0==='Plomberie'`, `ordre0===['Alba','Omar','Zébulon']`),
   `aClasserEnDernier`, `determinisme`, `perf150` → **attente inchangée**, mais
   désormais **indépendante** de la largeur ambiante du body. *Raison :* le
   groupement par secteur, les totaux et le tri par nom sont invariants du nombre
   de colonnes ; seules les positions `x` changent.

2. **`pasDeScrollHorizontal` — dédoubler par viewport** (l.63-64). Garder
   l'assertion à 390 (palier 3, SVG mis à l'échelle). **Ajouter** la même à 1280
   (voir run desktop) : attente **`true`** aux deux, mais la version desktop
   prouve que le palier le plus large (SVG 1240 px ≤ conteneur ~1267) ne déborde
   pas.

3. **Ajouter un run desktop 1280×800** (nouveau `browser.newPage({ viewport:{width:1280,height:800} })`
   ou 2ᵉ contexte, sur le motif de `smoke-antique.mjs`) avec **nouveaux verdicts** :
   - `elargissementDesktop` : `#arbre-scene` porte `data-palier === '6'` **et** le
     `viewBox` du `.arbre-svg` commence par `'0 0 1240 '`. (Attente mobile
     symétrique `mobileInchange` : `data-palier === '3'` et `viewBox` `'0 0 620 '`
     à 390.)
   - `pasDeScrollHorizontalDesktop` : `true` (cf. point 2).
   - `branchesDemoDesktop` : les 9 feuilles et les bannières
     (`Menuiserie/Plomberie/Électricité/Courtage/Toiture/À classer`) toujours
     présentes à 1280 — prouve que l'élargissement ne casse pas le groupement.

4. **Comptage de rangées — nouveau verdict paramétré** (`rangeesSelonPalier`),
   via la fonction pure, avec une branche **> 3 contacts** (les fixtures actuelles
   n'exercent pas la différence) :
   ```js
   const six = Array.from({length:6}, (_,i)=>({id:'r'+i, nom:'R'+i, type:'artisan', secteur_activite:'Toiture'}));
   const rM = window.UltimaArbre.calculerLayout(six, 620);   // base : 3 col -> ceil(6/3)=2 rangées
   const rD = window.UltimaArbre.calculerLayout(six, 1240);  // P6 : 6 col -> ceil(6/6)=1 rangée
   ```
   Attente : **2 rangées à 620, 1 rangée à 1240** (mesuré via le nombre de `y`
   distincts de `bandes[0].contacts`, ou via `bandes[0].rangees` si `front-carto`
   expose ce champ — recommandé, coût nul). C'est **le** verdict qui diffère
   volontairement par largeur.

5. **`determinismeDesktop`** : `calculerLayout(fixtures, 1240)` appelé deux fois →
   projections `JSON` égales (mêmes positions `x/y`), en plus du déterminisme base
   déjà couvert.

**Synthèse « attente par viewport » :**

| Verdict | 375/390 (base, 3 col) | 1280 (P6, 6 col) |
|---|---|---|
| `groupeParSecteur`, `premiereGraphieTri`, `aClasserEnDernier` | inchangé (pin `,620`) | identique (invariant colonnes) |
| `pasDeScrollHorizontal(Desktop)` | `true` | `true` (SVG 1240 ≤ conteneur) |
| `elargissement` / `mobileInchange` | `viewBox '0 0 620 …'`, `data-palier "3"` | `viewBox '0 0 1240 …'`, `data-palier "6"` |
| `rangeesSelonPalier` (branche de 6) | **2 rangées** | **1 rangée** |
| `determinisme(Desktop)` | égal | égal |

## Notes d'implémentation pour `front-carto` (points de contact)

- `js/arbre.js` : ajouter `PALIERS` + `choisirPalier` ; retirer les constantes
  `VB_W`/`MAX_COL` figées au profit de `palier.vbW`/`palier.cols` dans
  `calculerLayout`. **Remplacer toutes les références en dur à `VB_W`** hors layout
  par `layout.largeur` : décor l.166 (`cx = VB_W/2`), bannières l.282 (`cx = VB_W/2`)
  et l.284 (clamp `VB_W - 40`). Exposer `choisirPalier` sur `window.UltimaArbre`.
  Optionnel utile aux tests : ajouter `rangees` à l'objet bande.
- `js/app.js` : mesurer `#arbre-scene.clientWidth`, poser `data-palier`, brancher
  le listener `resize` débouncé (une fois) ; le re-render passe par le
  `rendreArbre()` existant.
- `css/styles.css` : la règle (d).

## Preuve d'accessibilité

- **Contraste** : aucune couleur, police ni graphie touchée. Les ratios validés
  en A3/A4 restent en vigueur (feuille ~ mesuré ≥ 4,5:1, bannière ≥ 4,5:1, type
  italique ≥ AA) — le harnais les remesure inchangés à 390 **et** à 1280 (le fill
  ne dépend pas du palier). Double codage (couleur + type en toutes lettres +
  trait) intact.
- **Cibles tactiles** : le mobile est **pixel-identique** (feuille ~108×24 en
  rendu, comme aujourd'hui — non régressé par cette boucle). Sur desktop, chaque
  palier s'affiche à l'échelle ~1 ⇒ feuille ≈ 178×40 px, soit **≥** la taille
  actuelle (arbre 640 px capé). Aucune feuille n'est jamais rendue **plus petite**
  qu'aujourd'hui : `GAP_X/GAP_Y` constants, `FEUILLE_W/H` constants, marges de
  palier ≥ marge actuelle → RB1 « broussaille » préservé.
- **No-scroll-X** : garanti aux deux couches (viewBox + CSS) à **tous** les
  paliers (cf. preuve section b).

## Ce que le `verificateur` doit constater à l'écran

1. **À 375/390** : arbre **identique à avant** — 3 colonnes max, `viewBox`
   `0 0 620 …`, `#arbre-scene[data-palier="3"]`, défilement vertical, **aucun**
   scroll horizontal.
2. **À 820 / 1040 / 1280** : l'arbre **s'élargit** (4 / 5 / 6 colonnes de feuilles),
   `viewBox` `0 0 820|1040|1240 …`, `data-palier="4|5|6"`, SVG **centré**, feuilles
   à taille de lecture (~178 px), **jamais** de scroll horizontal de page.
3. **Redimensionnement live** : élargir/rétrécir la fenêtre par-dessus un seuil
   (ex. 800→850, 1030→1050) → l'arbre **se recompose** (moins/plus de rangées)
   après un court délai (débounce), sans clignotement tant qu'on reste dans une
   bande ; le rendu est **stable et identique** pour une largeur donnée.
4. **Non-régression** : recherche (mise en évidence), tap/clavier sur feuille,
   état vide, pousse animée — tous inchangés à chaque palier. Console sans erreur,
   `bash tests/lancer.sh` vert (mobile + nouveau run desktop).
