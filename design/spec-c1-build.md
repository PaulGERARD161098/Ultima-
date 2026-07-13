# Spec C1 — Build de la console (production) — CADRÉ, à lancer à la reprise

> Étape suivante de la boucle C1. Les previews sont **validées par Paul**
> (2026-07-13) : direction **Atlas**, maquette de référence
> `design/preview-console-atlas-v5.html` (4 emblèmes définitifs). Cette spec
> cadre l'intégration de cette maquette dans la **vraie app**, à exécuter à la
> prochaine session (Paul a mis Ultima en pause après validation de l'Atlas).
> **Rien n'est à coder tant que Paul n'a pas dit « go build ».**

## 1. Objectif

Faire de la console d'accueil l'**entrée de l'app** (après authentification),
en **réutilisant** la maquette Atlas v5, **sans aucune régression** sur l'app
existante (qui devient le quadrant TRAVELLER).

## 2. Source visuelle (à porter, ne pas redessiner)

`design/preview-console-atlas-v5.html` = référence normative :
- Bandeau « Bienvenue sur Ultima » + invite « Sur quoi on travaille aujourd'hui ? ».
- 4 quadrants en grille 2×2 qui remplit l'écran ; nom → rôle (sous le nom) → devise.
- Emblèmes SVG inline **définitifs** (tokens R1, encre + or) :
  - TRAVELLER = rose des vents/compas · BCP = balance ·
    ADRAMELECH = dragon en vol (réf. Paul, `.embleme--dragon` scale 1.32) ·
    IMLADRIK = épée pointe-bas + soleil flamboyant.
- États : **TRAVELLER actif** (lien) ; BCP/ADRAMELECH/IMLADRIK **« à venir »**
  (boutons désactivés, cadre pointillé + pastille + emblème estompé 0,55).
- Contrastes AA (corps ~10:1), 0 requête réseau, responsive sans scroll-X.

Porter le markup dans `index.html` et les styles dans `css/styles.css`
(scopés, ex. `.vue-console` / `#espace-console`), **sans dupliquer** les tokens
`:root` déjà présents. Aucune nouvelle dépendance, aucun asset, aucun CDN.

## 3. Modèle de routage (décision actée — ne pas re-débattre)

L'app bascule déjà les vues via `activerOnglet(nom)` (`js/app.js` ~L336-360) :
mappe `accueil/arbre/carte/contacts` → `#espace-*` en `.hidden`, met à jour la
barre d'onglets. Le build s'insère ainsi :

- **Nouvel espace `#espace-console`** (l'Atlas), et une entrée console dans le
  routage. Après auth, la **vue par défaut = la console** (remplace l'arrivée
  actuelle sur l'Arbre).
- **La barre d'onglets (Accueil/Arbre/Carte/Contacts) appartient à TRAVELLER** :
  masquée quand la console est affichée, visible quand on est dans TRAVELLER.
- **Quadrant TRAVELLER (clic/entrée)** → ouvre l'espace de travail TRAVELLER
  (affiche la barre d'onglets + la vue TRAVELLER par défaut = l'Arbre, décision
  A3 conservée). Les 3 autres quadrants sont inertes (« à venir »).
- **Retour à la console** : une affordance persistante et accessible (ex. le
  cartouche/monogramme « Ultima » de l'entête, ou un contrôle « ◊ Console »),
  focusable, `aria`, qui ré-affiche `#espace-console` et masque la barre
  d'onglets. À spécifier finement par interface-ux au moment du build.
- **Auth** : la console ne s'affiche que connecté (même garde que le reste ;
  l'overlay de connexion A1 et `requireUser` **ne sont pas touchés** — RB5).

> Simplicité v1 assumée : on boote sur la console à chaque session (pas de
> mémorisation de la dernière vue). Mémorisation = vivier ultérieur si besoin.

## 4. Zéro régression (garde-fous)

- Les 4 onglets existants, l'auth invisible, l'Arbre, la Carte, les Contacts,
  la recherche, la dictée, le géocodage : **inchangés fonctionnellement**.
- Ne pas toucher `middleware.js`, `api/`, `js/carte.js`, `js/arbre.js` sauf
  branchement de navigation strictement nécessaire.
- `inert`/focus : quand la console est affichée, l'espace de travail est masqué
  (`hidden`), et inversement — pas de piège de focus, pas de double tabulation.
- Déterminisme de l'Arbre et de la Carte préservé (aucune ré-entrée parasite).

## 5. Patrimoine (obligatoire, charte)

- **Nouveau harnais** `tests/smoke-console.mjs` : la console s'affiche connecté,
  les 4 quadrants présents, TRAVELLER seul actif (focusable) vs 3 boutons
  « à venir » désactivés, clic TRAVELLER → barre d'onglets + Arbre, retour
  console OK, 0 scroll-X (320→1440), 0 requête réseau, 0 erreur console,
  contraste bandeau/corps mesuré.
- **Tous les harnais existants restent verts** (`bash tests/lancer.sh`) —
  non-régression des flux TRAVELLER.

## 6. Sécurité / accessibilité (rappels)

- Aucune nouvelle surface serveur ; pas de secret ; CSP OK (SVG inline, pas de
  `on*` inline superflu, JS en fin de body).
- AA : cibles ≥ 44 px, `:focus-visible` net, `prefers-reduced-motion`, décor
  `aria-hidden`, ordre de tabulation logique (console → quadrant actif → retour).

## 7. Chaîne d'exécution (à la reprise, sur « go build »)

1. `interface-ux` : spec fine du parcours console↔TRAVELLER (affordance de
   retour, wording, états, focus) — déposée en fichier.
2. `front-carto` : implémentation (port Atlas v5 + routage), commit atomique.
3. Contre-passe **indépendante** : `securite-auditeur` (RB5/auth/CSP/inert) +
   `verificateur` (exerce les flux au navigateur, harnais).
4. Merge sur go Paul (gate).

## 8. État à la clôture (2026-07-13)

- ✅ Previews livrées et validées : direction Atlas, 4 emblèmes définitifs
  (dragon d'après réf. Paul, agrandi ; épée-soleil). Itérations v1→v5 sur PR #39.
- ⏳ **Build NON lancé** (Ultima en pause, décision Paul). Cette spec = point
  d'entrée de la reprise. Déclencheur : « go build ».
