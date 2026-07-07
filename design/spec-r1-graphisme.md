# SPEC R1 — Habillage antique de la carte Leaflet (graphisme → front-carto)

> Auteur : graphisme, 2026-07-07. Sources relues : REFONTE-ACCUEIL.md (décisions
> actées + §2 + RA1-RA5), design/preview-accueil-mythologie.html (référence B),
> js/carte.js, css/styles.css, index.html. Tous les ratios de contraste sont
> CALCULÉS (WCAG relative luminance, simulation exacte des matrices sepia/
> saturate/brightness/contrast sur les couleurs OSM de référence), pas estimés.

## Intention visuelle

La carte devient une carte de royaume « Age of Mythology » : tuiles OSM tirées
vers le parchemin doré, contour de France encré et mers nommées au dézoom,
cartouche doré « ULTIMA » sur bandeau de mer profonde. Le décor est une
surcouche muette (`pointer-events: none` partout) : l'information — points,
traits, étiquettes, radar — reste portée par les couches Leaflet existantes,
avec des contrastes ≥ 3:1 prouvés.

## Écarts assumés par rapport à la preview (à connaître avant d'implémenter)

1. **Anneau crème → cerne encre.** Sur les tuiles OSM filtrées, la « terre »
   vaut ≈ #E6E6C3 : l'anneau crème #fff3d6 y fait **1,15:1** (invisible) et le
   blanc actuel **1,27:1**. Le 10,9:1 de la décision actée valait sur la mer
   sombre DESSINÉE de la preview, qui n'existe pas sur de vraies tuiles. La
   délimitation passe donc au **cerne encre #5a4118** (7,52:1 sur terre
   filtrée). L'anneau crème pourra revenir en R4 en liseré intérieur décoratif.
2. **Palette adoucie (#e08a3c…) NON reprise pour les fills.** Elle était calée
   sur fond sombre ; sur parchemin clair, adoucir = éclaircir = perdre encore
   du contraste. Les 4 couleurs de type actuelles restent inchangées partout
   (carte, légende, badges — cohérence du système).
3. **`filter="url(#rough)"` de la preview JAMAIS repris** : il contient
   `feTurbulence`, interdit ferme sur les couches carte (RA3). Le tremblé est
   déjà dans les courbes des tracés — on copie les `path` SANS l'attribut
   `filter`.

---

## 1. Filtre sépia des tuiles — `.leaflet-tile-pane` SEUL

Nouveaux tokens `:root` (css/styles.css) :

```css
--cerne-carte: #5a4118;      /* cerne encre des marqueurs + cadre */
--or-antique: #a9884a;       /* liserés or (cadre, cartouche, bannières) */
--mer-profonde: #0e3a52;     /* bandeau entête, lavis mer du voile */
--mer-claire: #17506b;
--parchemin-tuile: #e6e2c0;  /* terre OSM filtrée (fond de chargement) */
```

Deux régimes, pilotés par une classe posée sur `#carte` à `zoomend` (et à
l'init) — **une seule classe à la fois** :

| Zoom Leaflet | Classe sur `#carte` | Rôle |
|---|---|---|
| ≤ 5 | `zoom-pays` | voile plein |
| = 6 | `zoom-large` | voile à 65 % (critère R1 : « à zoom 6 le voile est visible ») |
| 7–11 | `zoom-region` | tuiles sépia seules |
| ≥ 12 | `zoom-rue` | sépia allégé (lisibilité des rues) |

```css
/* Régime plein (par défaut, zoom ≤ 11) */
.carte .leaflet-tile-pane {
  filter: sepia(0.9) saturate(1.4) hue-rotate(-8deg) brightness(0.94) contrast(0.92);
}
/* Régime rue (zoom ≥ 12) : on relâche pour garder rues et étiquettes nettes */
.carte.zoom-rue .leaflet-tile-pane {
  filter: sepia(0.75) saturate(1.2) hue-rotate(-8deg) brightness(0.97);
}
/* Fond visible pendant le chargement des tuiles : parchemin, jamais le gris Leaflet */
.leaflet-container { background: var(--parchemin-tuile); }
```

- **Aucune `transition` sur `filter`** (repaint du tile-pane entier = interdit
  perf). Le saut de régime à zoomend est sec et assumé.
- Le filtre ne touche QUE `.leaflet-tile-pane` (z-index Leaflet 200) : les
  panes vecteurs/marqueurs (400/600) restent en couleurs vraies (RA1 :
  « jamais de tout brun »).
- Rendu simulé : terre `#f2efe9` → **#E6E6C3** ; mer `#aad3df` → **#E6D89F** ;
  noms de villes `#333` → **#463E2F** (8,30:1 sur terre — RA2 très au-dessus
  de AA). En régime rue : terre **#F7F7D6**, labels **10,5:1**.
- L'attribution OSM reste visible et non filtrée (c'est un contrôle, pas une
  tuile) — ne jamais la masquer.

## 2. Cadre parchemin (vignettage + coins)

**Technique** : un seul `div.cadre-carte` ajouté dans `.contenu`, frère de
`#carte` (dans index.html, `aria-hidden="true"`), + 4 `span.coin` enfants.
Zéro image lourde, zéro feTurbulence, zéro grain en R1 (si grain un jour :
uniquement en tuile SVG data-URI statique HORS panes, comme `.vue-accueil` —
jamais de filtre live sur la carte).

```css
.cadre-carte {
  position: absolute;
  inset: 0;
  z-index: 640;              /* voir table z-index ci-dessous */
  pointer-events: none;
  box-shadow:
    inset 0 0 0 3px var(--cerne-carte),
    inset 0 0 0 5px var(--or-antique),
    inset 0 0 42px 10px rgba(58, 42, 16, 0.26);  /* vignettage léger */
}
.cadre-carte .coin {
  position: absolute;
  width: 72px;
  height: 72px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cg fill='none'%3E%3Cpath d='M4 68 V16 Q4 4 16 4 H68' stroke='%235a4118' stroke-width='2.5'/%3E%3Cpath d='M10 68 V20 Q10 10 20 10 H68' stroke='%23a9884a' stroke-width='1.2'/%3E%3Cpath d='M16 16 q9 -3 12 5 q-9 3 -12 -5Z' fill='%23a9884a' opacity='.85'/%3E%3C/g%3E%3C/svg%3E") no-repeat;
}
.cadre-carte .coin-no { top: 0; left: 0; }
.cadre-carte .coin-ne { top: 0; right: 0; transform: rotate(90deg); }
.cadre-carte .coin-se { bottom: 0; right: 0; transform: rotate(180deg); }
.cadre-carte .coin-so { bottom: 0; left: 0; transform: rotate(270deg); }
@media (max-width: 720px) { .cadre-carte .coin { width: 48px; height: 48px; background-size: 48px 48px; } }
```

**Z-index — références Leaflet 1.9.4 réelles** (enfants de `#carte`, qui est
`z-index: auto` : tout partage le contexte d'empilement de `.contenu`) :
tile-pane **200** · pane voile custom **300** · overlay-pane (circleMarkers,
polylines) **400** · shadow **500** · marker-pane **600** · tooltip-pane
**650** · popup-pane **700** · contrôles (`.leaflet-top/.leaflet-bottom`)
**1000**. Côté app : légende **900**, barre d'outils **1050**, panneau
**1100**, onglets **1200**, toasts **1300**.

Le cadre à **640** : au-dessus des marqueurs (un point en bord d'écran passe
sous le vignettage, assumé et discret), **sous** tooltips (650), popups (700),
légende (900) et contrôles zoom (1000) — rien d'informatif n'est voilé.
`pointer-events: none` garantit RA4 quoi qu'il arrive.

**Budget perf (RA3)** : 1 div + 4 spans statiques, box-shadow inset rendu une
fois puis composité, 1 data-URI ≈ 400 octets ; aucune animation, aucun repaint
au pan (le pan translate `.leaflet-map-pane`, pas le cadre).

## 3. Voile Ptolémée (zoom ≤ 6)

**Calage : GÉO-ANCRÉ en bloc, pas point à point.** Le SVG (équirectangulaire
artistique) est posé en `L.svgOverlay` sur des bounds fixes : il pan/zoome
AVEC la carte — jamais de désaccord visuel entre contour et points (garde-fou
« voile trompeur »). L'étirement Mercator du dessin est assumé : le contour
est volontairement stylisé « dessin d'époque », semi-transparent, et les
points restent projetés par Leaflet au-dessus (aucune projection maison).

**Implémentation (js/carte.js, dans `init`)** :

```js
var paneVoile = carte.createPane('voile');
paneVoile.style.zIndex = 300;            // entre tuiles (200) et vecteurs (400)
paneVoile.style.pointerEvents = 'none';
paneVoile.classList.add('pane-voile');
var svgVoile = document.getElementById('voile-ptolemee').content.firstElementChild;
L.svgOverlay(svgVoile, [[40.0, -7.8], [52.6, 11.2]], { pane: 'voile', interactive: false }).addTo(carte);
```

Bounds initiaux `[[40.0,-7.8],[52.6,11.2]]` (constante unique, ajustement fin
±1° autorisé à l'œil sur capture zoom 5-6).

**Le SVG** vit dans index.html en `<template id="voile-ptolemee">` (100 %
local, CSP-clean, zéro fetch). `viewBox="0 0 600 640"`,
`preserveAspectRatio="none"`. Contenu, repris de la preview committée **sans
`filter="url(#rough)"`** et sans le `defs` de turbulence :

1. **Lavis mer** : `<rect width="600" height="640" fill="#17506b" opacity="0.45"/>`,
   bord fondu par un `<mask>` en dégradés linéaires (16 px de fondu vers
   transparent sur les 4 bords) — dégradés/masques autorisés, turbulence non.
2. **Lueur littorale** : le path côte de la preview, `stroke #8fd2e0`,
   width 10, opacity 0.22 (tel quel).
3. **Terre** : les 2 paths France + Corse de la preview, mais
   `fill="#ecd9a4" fill-opacity="0.75"` (éclairci vs preview : garde les
   fills de type lisibles dessous, voir preuves), `stroke="#5a4118"`
   stroke-width 2.6 / 2.2.
4. **Verdure, relief, ombres, fleuves** : groupes de la preview tels quels
   (opacités 0.30 / 0.85 / 0.12 / 0.7).
5. **Noms de mers** : les 3 `<text>` de la preview (LA MANCHE, OCÉAN
   ATLANTIQVE, MER MÉDITERRANÉE), fill `#bfe0ea`, tels quels.
6. **Graticule léger** : lignes droites tous les 100 px du viewBox
   (verticales x=100…500, horizontales y=100…600), `stroke="#bfe0ea"`
   `stroke-width="0.8" opacity="0.18"` — sous les textes, au-dessus du lavis.
7. **Monstres marins** : les 3 groupes de la preview (serpent Atlantique,
   créature Méditerranée, souffle Manche) tels quels, opacity 0.45-0.5,
   **statiques** (voir §6).
8. **Exclus** : rose des vents (R4), pastilles de contacts démo, traits de
   relations démo, cartouche (il part dans l'entête).

**Fondu par palier de zoom (CSS, piloté par les classes du §1)** :

```css
.pane-voile { opacity: 0; transition: opacity 400ms ease; }
.carte.zoom-pays  .pane-voile { opacity: 1; }
.carte.zoom-large .pane-voile { opacity: 0.65; }
@media (prefers-reduced-motion: reduce) { .pane-voile { transition: none; } }
```

À zoom ≥ 7 (`zoom-region`/`zoom-rue`) : opacité 0, le voile disparaît —
critère R1 « à zoom 13 absent » tenu. Transition sur `opacity` seule
(compositée), coupée en reduced-motion.

## 4. Cartouche « ULTIMA » (remplace le texte de l'entête)

**index.html** — dans `.entete`, remplacer UNIQUEMENT
`<h1 class="entete-titre">Ultima — Carte réseau</h1>` par :

```html
<div class="cartouche-ultima">
  <h1 class="cartouche-titre">ULTIMA</h1>
  <p class="cartouche-sous">le royaume du réseau</p>
</div>
```

`#bandeau-demo` et `#zone-auth` restent tels quels (leurs pastilles/champs
sont autoportants et lisibles sur fond sombre). Mettre à jour
`<meta name="theme-color">` → `#0e3a52`.

**CSS** (reprend le langage exact de la preview, tailles réduites : c'est un
bandeau d'outil, pas un écran-titre) :

```css
.entete {
  background:
    url("<tuile vaguelettes data-URI de la preview, reprise telle quelle>") ,
    linear-gradient(180deg, var(--mer-claire), var(--mer-profonde));
  border-bottom: 1px solid var(--or-antique);
  justify-content: center;
}
.cartouche-ultima {
  position: relative;
  padding: 0.3rem 1.9rem 0.35rem;
  background: linear-gradient(#f4e6bd, #e3cd93);
  border: 2px solid #6e5320;
  border-radius: 4px;
  box-shadow: inset 0 0 0 3px #f4e6bd, inset 0 0 0 4px var(--or-antique),
              0 2px 6px rgba(0, 10, 20, 0.4);
  text-align: center;
}
.cartouche-ultima::before, .cartouche-ultima::after {
  content: "❦";
  position: absolute; top: 50%; transform: translateY(-52%);
  color: #6e5320; font-size: 0.9rem;
}
.cartouche-ultima::before { left: 0.5rem; }
.cartouche-ultima::after  { right: 0.5rem; }
.cartouche-titre {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;  /* pile système, zéro CDN */
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.22em; text-indent: 0.22em;
  color: #4a3512;
  text-shadow: 0 1px 0 #fff6dd;
}
.cartouche-sous {
  margin: 0;
  font-size: 0.72rem;
  font-variant: small-caps;
  letter-spacing: 0.28em; text-indent: 0.28em;
  color: #6e5320;
}
@media (max-width: 720px) {
  .cartouche-ultima { padding: 0.2rem 1.2rem 0.25rem; }
  .cartouche-titre { font-size: 1.15rem; }
  .cartouche-sous { display: none; }   /* entête ≤ 60px de haut sur mobile */
}
```

- Le cartouche est en flux normal dans le header : il ne recouvre RIEN
  (barre d'outils intacte en dessous), ne vole aucun clic (ce n'est pas un
  bouton en R1 — il le deviendra peut-être en R2 pour « Aujourd'hui »).
- Hauteur totale entête cible : ≤ 72 px desktop, ≤ 60 px mobile.
- H1 réel conservé (texte, pas image) : accessibilité et SEO intacts.

## 5. Marqueurs, halo, relations (js/carte.js — diffs exacts)

```js
// rendre(), circleMarker :
color: '#5a4118',      // était '#ffffff' — cerne encre (--cerne-carte)
weight: 2,             // inchangé
fillColor: COULEURS_TYPE[n.type] || '#555555',   // inchangé (sémantique)
fillOpacity: 1,        // était 0.95 — la transparence boueuse sur parchemin
radius: 9,             // inchangé

// STYLES_RELATION : opacity 0.75 → 0.85 (les 3 types) ; weight/dash inchangés.
// Statuts idée (0.45) / arrêté (0.35 gris) inchangés : l'éteint est voulu.
// surligner() : halo #1f2937 INCHANGÉ (11,6:1 sur terre filtrée — passe large).
// apercu() : inchangé (provisoire, pointillé, sous contrôle utilisateur).
```

**Légende (css)** : `.pastille { border-color: var(--cerne-carte); }` (était
`var(--blanc)`) et suppression du `box-shadow` de rattrapage — la légende
montre exactement ce que montre la carte.

**Backlog R4 consigné ici** : le trait sous-traitance `#e8781e` reste à
2,06:1 sur parchemin même à 0,85 (l'information est portée par le TIRETÉ,
style = information + légende) ; son recalage couleur carte (ex. `#c05a10`)
relève du calibrage final R4, pas de R1.

## 6. Rose des vents + monstres marins

- **Rose des vents : report R4 CONFIRMÉ** (le cadrage §4 l'y place). En R1
  elle entrerait en conflit d'angle avec le contrôle zoom (coin haut-gauche)
  et le cadre ; elle existe déjà sur l'Accueil v3-①, rien n'est perdu.
- **Monstres marins : inclusion minimale JUSTIFIÉE** — ils font partie des
  tracés du voile repris de la preview (coût zéro : 3 groupes de paths
  statiques, opacity ≤ 0.5) et disparaissent avec le voile dès zoom 7.
- **Aucune animation nouvelle en R1** (monstres statiques, pas de houle) ;
  la seule transition est le fondu d'opacité du voile, déjà couverte par
  `prefers-reduced-motion: reduce → transition: none`.

---

## Preuves d'accessibilité (ratios calculés, matrices CSS simulées)

Fonds calculés : terre filtrée **#E6E6C3** · mer filtrée **#E6D89F** · terre
sous voile plein **#D3CBA1** · terre sous voile 65 % (zoom 6) **#DAD5AD** ·
mer sous voile **#899B87** · terre régime rue **#F7F7D6**.

| Élément | vs fond | Ratio | Seuil | Verdict |
|---|---|---|---|---|
| Cerne marqueur #5a4118 | terre filtrée | **7,52:1** | 3:1 | ✅ |
| Cerne #5a4118 | mer filtrée | **6,70:1** | 3:1 | ✅ |
| Cerne #5a4118 | terre voile zoom 6 | **6,40:1** | 3:1 | ✅ |
| Cerne #5a4118 | terre voile plein (≤5) | **5,85:1** | 3:1 | ✅ |
| Cerne #5a4118 | mer sous voile | **3,23:1** | 3:1 | ✅ (cas limite ; contacts en mer quasi inexistants) |
| Fill partenaire #1e6fb8 | terre filtrée | 4,12:1 | 3:1 | ✅ |
| Fill lead #1f8a4c | terre filtrée | 3,45:1 | 3:1 | ✅ |
| Fill chantier #7a3fb5 | terre filtrée | 5,17:1 | 3:1 | ✅ |
| Fill artisan #e8781e | terre filtrée | 2,32:1 | — | ⚠️ porté par le cerne (7,52:1) + tooltip texte : double codage acté |
| Halo recherche #1f2937 | terre filtrée | **11,59:1** | 3:1 | ✅ inchangé |
| Étiquettes villes OSM filtrées | terre filtrée | **8,30:1** | 4,5:1 | ✅ RA2 (10,5:1 en régime rue) |
| Trait apport 0,85 | terre filtrée | 3,29:1 | 3:1 | ✅ |
| Trait chantier commun 0,85 | terre filtrée | 3,97:1 | 3:1 | ✅ |
| Trait sous-traitance 0,85 | terre filtrée | 2,06:1 | — | ⚠️ tireté = information (double codage) ; recalage couleur → R4 |
| « ULTIMA » #4a3512 | #e3cd93 (bas du dégradé) | **7,42:1** | 4,5:1 | ✅ AA |
| Sous-titre #6e5320 | #e3cd93 | **4,59:1** | 4,5:1 | ✅ AA |
| Liseré or #a9884a | entête #0e3a52 | 3,61:1 | 3:1 | ✅ |

Anneaux clairs écartés, chiffres : crème #fff3d6 → 1,15:1 et blanc → 1,27:1
sur terre filtrée. Les 4 fills restent mutuellement distincts (teintes
inchangées : orange/bleu/vert/violet, deltas de teinte > 60°) et le type est
toujours doublé par le texte (tooltip, fiche, légende) — daltonisme couvert.

Les valeurs ci-dessus sont des simulations sur les couleurs OSM de référence :
**la preuve finale RA1/RA2 se fait sur capture** (pixel réel) à zoom 6 ET 13,
comme l'exige le cadrage, avant toute fusion.

---

## Ce que le vérificateur doit constater (base de tests/smoke-antique.mjs)

1. **Arrivée** : au chargement, `#espace-carte` visible sans geste
   (`activerOnglet('carte')` au boot — la ligne fait partie de R1) ;
   l'Accueil v3-① reste accessible par son onglet.
2. **Filtre** : `getComputedStyle(.leaflet-tile-pane).filter` contient
   `sepia(0.9)` à zoom 6 ; après `setZoom(13)`, `#carte` porte `zoom-rue` et
   le filtre calculé contient `sepia(0.75)`.
3. **Paliers** : classes exactes selon zoom — 5→`zoom-pays`, 6→`zoom-large`,
   9→`zoom-region`, 13→`zoom-rue` ; jamais deux à la fois.
4. **Voile** : le pane `voile` existe, `zIndex` calculé `300`,
   `pointer-events: none` ; opacité calculée 1 à zoom 5, 0,65 à zoom 6, 0 à
   zoom 13 (tolérance ±0,05 hors transition ; attendre 500 ms post-zoomend).
5. **Décor muet (RA4)** : `pointer-events` calculé `none` sur `.cadre-carte`
   et le pane voile ; `document.elementFromPoint` au centre de la carte ne
   retourne ni `.cadre-carte` ni un élément du voile ; un clic sur un
   marqueur de fixture ouvre la fiche (`#panneau` non hidden) — y compris un
   marqueur proche du bord (sous le vignettage).
6. **Cartouche** : `h1.cartouche-titre` au texte « ULTIMA » présent dans
   `.entete` ; `.entete-titre` n'existe plus ; hauteur de `.entete` ≤ 72 px
   (viewport 1280) et ≤ 60 px (viewport 375) ; le bouton « + Ajouter » de la
   barre d'outils reçoit le clic (formulaire s'ouvre).
7. **Marqueurs** : le path SVG d'un circleMarker porte `stroke="#5a4118"`,
   `fill-opacity="1"`, fill inchangé par type (les 4 hex de COULEURS_TYPE) ;
   le halo de recherche reste `stroke="#1f2937"`.
8. **Contraste (RA1/RA2)** : capture à zoom 6 et 13 ; ratio cerne/pixel de
   fond adjacent ≥ 3:1 mesuré sur la capture ; « Lyon » lisible à zoom 6.
9. **Reduced-motion** : avec `prefers-reduced-motion: reduce` émulé,
   `transition` calculée du pane voile = `none` (l'opacité saute).
10. **Non-régression** : `bash tests/lancer.sh` — smoke existants verts
    (recherche v3-⑥, géocodage v3-⑤, aperçu, filtres) ; zéro requête réseau
    nouvelle (décor 100 % data-URI/inline).

**Fichiers touchés** : `css/styles.css` (tokens + §1-2-4-5), `index.html`
(cartouche, div cadre, template voile, theme-color), `js/carte.js` (pane
voile + svgOverlay + classes zoomend + 6 valeurs), `js/app.js` (1 ligne boot),
`tests/smoke-antique.mjs` (nouveau, patrimoine).
