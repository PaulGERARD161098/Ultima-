# Spec C1 — La console d'accueil (previews d'abord)

> Boucle **C1** de la roadmap console (`CADRAGE-CONSOLE.md` §8). Objectif de
> CETTE étape : produire **3 previews HTML autonomes** de la console d'accueil,
> pour que Paul tranche le rendu AVANT tout code produit. Aucune régression sur
> l'app existante — ce brief ne touche pas `index.html` ni le produit ; il ne
> génère que des maquettes dans `design/`.

## 1. Ce qu'est la console (rappel cadrage)

Ultima devient une **plateforme personnelle en console à 4 quadrants**
(`CADRAGE-CONSOLE.md`). La console est la **page d'accueil** de la plateforme :
- **Bandeau** « Bienvenue sur Ultima ».
- **Invite** « sur quoi on travaille aujourd'hui ? ».
- **4 quadrants** (noms de code figés, écrits par Paul) :
  - **TRAVELLER** — le réseau commercial (artisans, partenaires, leads,
    chantiers + relations). C'est **l'app actuelle** (onglets Accueil / Arbre /
    Carte / Contacts) rangée sous son quadrant → seul quadrant **ACTIF** en C1
    (le clic mène à l'app existante).
  - **BCP** — pilotage financier (revenus/charges, impôts, échéancier).
  - **ADRAMELECH** — bibliothèque d'idées (capturer, classer, rapprocher).
  - **IMLADRIK** — développement personnel (objectifs, journal, valeurs).
  - BCP / ADRAMELECH / IMLADRIK ne sont **pas encore construits** → dans la
    console ils s'affichent avec une mention discrète **« à venir »**
    (non cliquables, mais déjà présents et nommés — Paul voit sa plateforme
    complète dès l'accueil).

## 2. Registre visuel — NON négociable

**Antique et sérieux** (décision Paul 2026-07-08, `CLAUDE.md`) : univers de la
carte savante — gravure à l'encre, parchemin noble, cartouches, typographie à
l'ancienne. **Pas** de registre enfantin, pas d'annotations manuscrites.
La beauté du registre antique EST la désirabilité ; jamais au prix de la
lisibilité, de l'accessibilité ni de la sécurité.

**Réutiliser l'acquis** (`css/styles.css`, `design/spec-r1-graphisme.md`) :
- `--parchemin: #f6eed9` · `--parchemin-carte: #efe3c6` · `--parchemin-ombre: #e3d3ab`
- `--encre-sepia: #3b2f1c` (texte) · `--encre-sepia-douce: #6a5636`
- `--encre-deco: #8c7a55` (décor uniquement, JAMAIS du texte)
- `--or-antique: #a9884a` (liserés) · `--cerne-carte: #5a4118` (cerne encre)
- `--mer-profonde: #0e3a52` (bandeau) · `--mer-claire: #17506b`
- `--danger-parchemin: #a02c1a`
- Police : `--police-ancienne` = pile old-style **100 % système** (Iowan Old
  Style, Palatino Linotype, Book Antiqua, Palatino, Georgia, serif) — **zéro
  @font-face, zéro asset, zéro CDN**.
- Motifs déjà en place réutilisables : cartouche ULTIMA, cadre parchemin,
  cernes encre, voile Ptolémée (`L.svgOverlay` — ici en SVG inline décoratif).

## 3. Contraintes dures (héritage sécurité/patrimoine)

- **Autonome** : chaque preview est UN seul fichier `.html`, **zéro requête
  réseau** (pas de Leaflet, pas de Google Fonts, pas d'image distante). Tout
  décor SVG **inline**. Compatible CSP stricte (aucun `on*=` inline superflu ;
  si JS de démo, un `<script>` en fin de body, pas d'inline handlers).
- **Accessibilité AA** : contrastes texte ≥ 4.5:1 (viser ≥ 7:1 sur le corps),
  chaque quadrant est un vrai contrôle focusable (`<a>`/`<button>`), ordre de
  tabulation logique, `:focus-visible` net, `prefers-reduced-motion` respecté,
  décor en `aria-hidden`. Cible tactile ≥ 44 px.
- **Responsive** : mobile d'abord (1 colonne empilée) → 2×2 dès ~720 px.
  Aucun scroll horizontal à aucune largeur.
- **Distinction d'état claire** : TRAVELLER (actif) vs les 3 « à venir » doit se
  lire au premier coup d'œil SANS dépendre de la seule couleur (forme, mention
  texte, opacité + libellé « à venir »).

## 4. Les 3 directions à rendre (une preview chacune)

Chaque preview porte le même contenu (bandeau + invite + 4 quadrants), rendu
selon une intention distincte, pour que le choix de Paul soit un vrai choix.

- **A — « Atlas / frontispice »** : la console comme la page-titre d'un atlas
  ancien. Bandeau-cartouche « Bienvenue sur Ultima » gravé en tête, l'invite en
  sous-titre à l'encre, puis 4 grandes **cartouches-quadrants** en grille 2×2,
  chacune avec son nom, une courte devise/description et une **vignette-emblème
  gravée** (SVG inline sobre : p.ex. TRAVELLER = rose des vents / réseau de
  routes ; BCP = balance / colonnes de comptes ; ADRAMELECH = lampe-à-huile /
  livre ouvert ; IMLADRIK = étoile polaire / laurier). Riche, chaleureux.

- **B — « Rose des vents / quadrants »** : jouer le mot *quadrant* au sens
  propre. Un médaillon-boussole central porte l'invite « sur quoi on
  travaille aujourd'hui ? » ; les 4 quadrants rayonnent autour (2×2 autour du
  centre, ou en croix). Le plus symbolique ; attention à ne pas sacrifier la
  lisibilité mobile (le rayonnement se replie en pile verticale sous ~720 px).

- **C — « Registre noble »** : sobre et vertical, comme la page de titre d'un
  ouvrage savant. Bandeau ULTIMA, invite, puis les 4 quadrants en **entrées de
  registre** numérotées I–IV, filet or de séparation, nom à gauche, description
  à droite, emblème réduit. Le plus lisible et le plus « sérieux », le moins
  décoratif — le repère de sobriété du panel.

## 5. Livrables attendus de l'agent

- `design/preview-console-atlas.html` (direction A)
- `design/preview-console-boussole.html` (direction B)
- `design/preview-console-registre.html` (direction C)
- Un court en-tête `<!-- … -->` en tête de chaque fichier : direction, intention,
  et 2-3 lignes de justification des choix (couleurs/contrastes réutilisés).
- **Pas** de modification de `index.html`, `css/`, `js/` ni d'aucun fichier
  produit. Uniquement des fichiers de maquette dans `design/`.

## 6. Ce que Léo vérifiera (contre-passe avant présentation à Paul)

- Ouverture réelle des 3 previews (harnais navigateur `tests/`), zéro requête
  réseau, zéro erreur console.
- Contraste mesuré sur le corps de texte de chaque preview (≥ 4.5:1, viser 7:1).
- État TRAVELLER-actif vs 3-à-venir lisible sans couleur seule.
- Cohérence stricte avec les tokens R1 (aucune couleur inventée hors palette).
- Responsive : pas de scroll-X de 320 px à 1440 px ; 2×2 au-delà de ~720 px.
