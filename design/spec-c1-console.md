# Spec C1 — La console d'accueil d'Ultima (coque à 4 quadrants)

> Boucle C1 du pivot plateforme (`CADRAGE-CONSOLE.md`). But : insérer la
> **console** au-dessus de l'app existante, SANS régression. L'app actuelle
> (onglets accueil/arbre/carte/contacts) devient l'intérieur du quadrant
> **TRAVELLER**. Les 3 autres quadrants sont des **écrans « en construction »**
> (placeholders statiques). **Aucune touche Supabase/données** (décision Paul
> 2026-07-12 : « n'implante rien encore »). Registre **antique et sérieux**,
> contrastes AA, `prefers-reduced-motion` respecté, CSP (zéro inline JS/CDN).

## 1. Modèle de navigation (nouveau niveau au-dessus des onglets)

Introduire une **vue de plateforme** `etat.vue` ∈
`{ console, traveller, bcp, adramelech, imladrik }`, indépendante de
`etat.onglet` (qui reste la navigation INTERNE de TRAVELLER).

- Après connexion (ou en mode démo), la vue initiale est **`console`** — jamais
  directement les onglets. `majAuthUi()` révèle la console, pas l'app TRAVELLER.
- `console` : affiche `#espace-console`, masque la coque TRAVELLER
  (`header.entete`, `main.espaces`, `nav.barre-onglets`) ET les 3 placeholders.
- `traveller` : affiche la coque TRAVELLER existante **inchangée** ; son onglet
  interne par défaut reste celui de l'app (= **`arbre`**, l'écran connecté du
  pivot A3/D2a — imposé par la non-régression `smoke-arbre`/`smoke-connexion`) ;
  masque console + placeholders. [Réconcilié après contre-passe verificateur GO
  2026-07-12 : la première version disait `accueil`, faux vs le réel D2a.]
- `bcp` / `adramelech` / `imladrik` : affiche le placeholder correspondant ;
  masque le reste.

Implémentation attendue : une fonction pure de routage
`activerVue(nom)` dans `app.js`, sur le modèle exact d'`activerOnglet` (toggle
`hidden`, gestion du focus, pas d'inline). `activerOnglet` reste intact.
Garde-fou : `activerVue` ferme le panneau fiche s'il est ouvert (comme
`activerOnglet`).

## 2. DOM à ajouter (index.html)

### 2.1 `#espace-console` (nouvelle `<section>`, avant `header.entete`)
- **Bandeau** : `<h1>` « Bienvenue sur Ultima » (cartouche, même registre que
  `.cartouche-ultima`).
- **Invite** : `<p>` « Sur quoi est-ce qu'on travaille aujourd'hui ? ».
- **Grille de 4 cartouches** (`<button>` ou `<a role>` — cliquables clavier,
  `data-quadrant="traveller|bcp|adramelech|imladrik"`), chacune :
  - Nom de code + libellé de domaine.
  - Une phrase de description (voir §4).
  - Un **état** : TRAVELLER = « ouvert » ; les 3 autres = pastille/mention
    « en construction » (aria-label explicite, pas seulement couleur).
  - Icône SVG inline sobre (gravure), `aria-hidden`.
- La grille est responsive : 1 col mobile → 2 col ≥ 720px (réutiliser les
  paliers/CSS existants si possible, sinon media queries simples).

### 2.2 Placeholders `#espace-bcp`, `#espace-adramelech`, `#espace-imladrik`
Chacun (section masquée par défaut) :
- En-tête cartouche : nom de code + libellé de domaine.
- Un court paragraphe « Ce quadrant arrive bientôt » + la description du §4
  (ce que l'outil fera) — donne du sens, pas une page vide.
- **Bouton « ← Ultima »** (retour console) — `data-retour-console`.
- Aucune donnée, aucun champ, aucun appel réseau.

### 2.3 Retour à la console depuis TRAVELLER
Ajouter dans `header.entete` (coque TRAVELLER) un contrôle **« ← Ultima »**
(`data-retour-console`) qui appelle `activerVue('console')`. Discret, à gauche
du cartouche. Ne casse pas la mise en page existante.

## 3. Câblage (app.js)
- `SECTIONS_VUES = { console:'#espace-console', traveller:<coque>, bcp:…, … }`.
  La coque TRAVELLER = les 3 éléments existants togglés ensemble (helper).
- Écouteurs : clic/clavier sur `[data-quadrant]` → `activerVue(nom)` ;
  `[data-retour-console]` → `activerVue('console')`.
- **Focus** : à l'entrée d'une vue, déplacer le focus sur son titre (`tabindex="-1"`),
  comme le fait déjà le panneau (`#panneau-titre`). Accessibilité clavier
  complète (les cartouches sont des vrais boutons).
- `majAuthUi()` : après connexion, `activerVue('console')` au lieu de laisser
  l'app TRAVELLER visible. Le `inert`/garde-fou de l'overlay de connexion
  (A4) doit couvrir la console aussi quand l'overlay est actif.
- Déterminisme : aucun `Date.now()`/aléatoire ; rendu identique à état égal.

## 4. Contenu des 4 quadrants (textes, registre sobre)
- **TRAVELLER — le réseau** : « Vos relations professionnelles : l'arbre, la
  carte, les contacts et leurs liens. » (état : ouvert)
- **BCP — pilotage financier** : « Vos revenus et vos charges, mois par mois,
  avec prévision d'impôts et échéancier. » (en construction)
- **ADRAMELECH — bibliothèque d'idées** : « Capturez chaque idée, classez-la,
  rapprochez-la, enrichissez-la jusqu'à l'exécutable. » (en construction)
- **IMLADRIK — développement personnel** : « Vos objectifs, votre journal, vos
  valeurs — des rappels et de la prise de recul. » (en construction)

## 5. CSS (css/styles.css)
- Nouveau bloc scopé `.vue-console` / `.console-*` dans le registre parchemin
  existant (réutiliser les tokens `--police-ancienne`, couleurs sépia/encre,
  cartouches). **Aucune couleur nouvelle sans vérifier le contraste AA** (≥ 4,5:1
  texte, viser la marge des boucles RB2).
- Les cartouches : effet plaque de parchemin gravée (réutiliser le motif des
  panneaux déjà en place, pas de bois). Hover/focus visibles (focus-visible).
- Placeholders : même registre, sobres.

## 6. Titre / meta
- `<title>` : « Ultima — console » (au lieu de « Carte réseau »).
- Le sous-titre de connexion « le royaume du réseau » est désormais spécifique
  à TRAVELLER : le laisser tel quel sur l'écran de connexion (la connexion
  ouvre la plateforme, acceptable) — NE PAS élargir le périmètre auth (RB5).

## 7. Patrimoine de tests (tests/ — OBLIGATOIRE, jamais jetable)
Ajouter un harnais **`smoke-console.mjs`** (modèle : les smoke existants,
fixtures npm en cache, zéro CDN) qui prouve :
1. Connecté → la **console** est visible en premier ; la coque TRAVELLER est
   masquée (`hidden`).
2. Clic TRAVELLER → l'app existante s'affiche, onglet interne par défaut =
   `arbre` (D2a) ; les onglets accueil/arbre/carte/contacts fonctionnent
   toujours (non-régression). [Vivier : l'assertion `ongletInterneActif` du
   smoke ne vérifie que « un seul actif », pas lequel — à durcir sur `arbre`.]
3. « ← Ultima » depuis TRAVELLER → retour console.
4. Clic BCP/ADRAMELECH/IMLADRIK → placeholder correspondant, mention « en
   construction », bouton retour fonctionnel.
5. Focus déplacé sur le titre de chaque vue ; navigation clavier OK.
6. Zéro erreur console ; `prefers-reduced-motion` respecté (pas d'animation
   bloquante).
Mettre à jour `tests/lancer.sh` pour inclure le nouveau harnais. Les harnais
existants doivent rester **tous verts** (non-régression = critère de sortie).

## 8. Contraintes de sortie (critères GO)
- Zéro régression : tous les harnais existants verts + le nouveau.
- Zéro appel Supabase/réseau ajouté ; aucune migration ; aucun secret.
- CSP intacte (aucun JS inline, aucun CDN nouveau ; SVG inline OK).
- Contrastes AA vérifiés sur les nouveaux textes.
- Déterminisme du rendu ; accessibilité clavier + focus + aria.
- Patch minimal, style existant, pas de refonte de l'app TRAVELLER.

> Contre-passe `verificateur` indépendante avant commit non trivial : exercer
> réellement les 4 quadrants + le retour + la non-régression des onglets.
