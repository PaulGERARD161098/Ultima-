# SPEC A3 — L'Arbre des contacts (le pivot)

> Boucle A3 (REFONTE-ARBRE §1.2 + §3-A3). Décisions Paul actées 2026-07-09 :
> D2a (l'arbre devient l'écran connecté, **la carte reste en onglet
> secondaire** — rien de jeté), D4 (go preview). Style antique et sérieux.
> Référence visuelle validée : `design/preview-arbre-contacts.html`.

## Objectif

Un **arbre** devient l'écran d'arrivée une fois connecté : tronc (le réseau
de Paul) → **grosses branches = secteurs d'activité** (champ `secteur_activite`
livré en A2) → **ramifications terminales = contacts** (une étiquette par
contact). L'arbre est DESSINÉ À PARTIR DES DONNÉES (`etat.noeuds`), pas
statique : à chaque visite le même jeu de données donne le même arbre.

La preview est le **registre visuel cible** (parchemin, tronc/branches à
l'encre, bannières de secteur, étiquettes-feuilles = pastille couleur du
type + nom + type en toutes lettres). Mais ses positions sont peintes à la
main : A3 doit produire ces positions par un **layout déterministe calculé**.

## Navigation — l'arbre entre dans les onglets (D2a)

- Nouvel onglet **« Arbre »** + section `#espace-arbre` (comme
  `#espace-carte`/`#espace-contacts`). Ajouter l'entrée dans `SECTIONS_ONGLETS`
  (js/app.js ~333) et un bouton dans `.barre-onglets` (index.html ~587).
- **Arrivée connecté = l'arbre** : à l'init, remplacer `activerOnglet('carte')`
  (js/app.js ~2523, le commentaire « R1 : arrivée sur la carte ») par
  l'arbre QUAND une session existe. En **mode démo** (pas de session) :
  conserver l'arrivée actuelle (la carte reste le hub de démo) OU l'arbre
  sur les fixtures — au choix de l'implémenteur, du moment que c'est cohérent
  et testé. La **carte reste un onglet** pleinement accessible (D2a — rien de
  supprimé ; géocodage v3-⑤ et recherche v3-⑥ y vivent).
- Ordre suggéré des onglets : Accueil · Arbre · Carte · Contacts. À ajuster
  avec interface-ux si besoin, sans casser les flux existants.

## Rendu — SVG vanilla, déterministe, accessible

- **SVG généré côté client** en `createElementNS` (cohérent avec le décor
  accueil js/app.js ~410 et l'écran A1), **aucune dépendance nouvelle**,
  aucun CDN, aucun canvas (canvas = inaccessible aux lecteurs d'écran et aux
  harnais — écarté par le cadrage).
- **Regroupement par secteur normalisé** : réutiliser `normaliserTexte`
  (NFD + accents + minuscules) pour grouper « Plomberie » et « plomberie »
  sous une seule branche ; l'étiquette de branche garde la première graphie
  rencontrée (même règle que la datalist A2, `secteursConnus`).
- **Branche « À classer »** : les contacts sans `secteur_activite` forment
  une branche dédiée au pied de l'arbre (même principe que « À placer » pour
  les sans-position). Personne ne disparaît.
- **Layout déterministe** (à concevoir par l'implémenteur, contraintes) :
  ordre des branches stable (tri déterministe, ex. `localeCompare('fr')` sur
  la forme normalisée, « À classer » en dernier) ; ordre des contacts dans
  une branche stable (ex. par nom) ; **aucun chevauchement** d'étiquettes
  (espacement vertical/horizontal garanti) ; le même jeu de données produit
  toujours le même arbre. Le `viewBox` s'adapte au nombre de branches/contacts
  (croissance verticale + scroll interne si nécessaire, pas de scroll
  horizontal de page).
- **Étiquette-feuille** = un `<g>` par contact contenant : pastille ronde à
  la **couleur du type existante** (artisan/partenaire/lead/chantier — mêmes
  couleurs que la carte/légende), **nom** (texte réel, `textContent`, jamais
  `innerHTML`) et **type en toutes lettres** (double codage : l'information
  n'est pas portée que par la couleur — exigence accessibilité).
- **Accessibilité** : `<svg role="img">` avec `aria-label` d'ensemble ; chaque
  étiquette-contact atteignable au clavier (élément focusable, `tabindex`,
  ordre de tabulation = ordre déterministe du layout) et activable
  (Entrée/Espace) ; libellés = texte réel lisible par lecteur d'écran ;
  contrastes **AA** mesurés sur capture (texte foncé sur feuille claire).
  Prévoir un équivalent liste/texte si le SVG seul est insuffisant pour un
  lecteur d'écran (à trancher avec interface-ux si besoin).

## Interactions

- **Tap / activation d'une étiquette-contact** → ouvre la **fiche existante**
  (`rendreFiche` / `ouvrirPanneau`) du bon nœud — réutilisation stricte, pas
  de nouvelle fiche.
- **Bouton flottant « + »** → ouvre le **formulaire de contact existant**
  (`ouvrirFormNoeud`), désormais enrichi du champ secteur (A2). À l'ajout,
  le contact apparaît sur l'arbre (re-render depuis `etat.noeuds`).
- **Recherche v3-⑥ conservée** : la barre de recherche reste disponible ;
  filtrer met en évidence / réduit l'arbre aux contacts correspondants
  (comportement à préciser avec interface-ux ; a minima ne pas la casser).
- Cartouche « Ultima » en haut de l'écran arbre (registre R1/preview).

## Performance

- **Budget 150 contacts** rendus fluides au scroll (critère A3). Génération
  SVG en une passe, pas de reflow par contact ; pas d'écouteur par étiquette
  si un délégué suffit. Mesurer/attester dans le harnais (temps de rendu
  raisonnable, pas de gel).

## Vérification (harnais patrimoine — enrichir, jamais jeter)

Nouveau `tests/smoke-arbre.mjs` (ajouté à `tests/lancer.sh`) prouvant, en
mode démo/fixtures :
1. **N contacts → exactement N étiquettes** sur l'arbre, groupées par secteur
   normalisé (fixtures avec « Plomberie »/« plomberie » → une seule branche).
2. Contacts sans secteur → présents sous la branche « À classer ».
3. **Tap sur une étiquette ouvre la bonne fiche** (nom attendu dans le
   panneau).
4. Étiquettes lisibles : **contraste mesuré sur capture ≥ 4,5:1** ; type en
   toutes lettres présent (double codage), pas seulement la couleur.
5. **Navigation clavier** : les étiquettes sont focusables dans l'ordre
   déterministe et activables au clavier.
6. Déterminisme : deux rendus du même jeu de données → même structure
   (mêmes branches, même ordre).
7. Perf : 150 contacts en fixtures → rendu sans erreur, budget de temps
   attesté.
8. **Onglet** : connecté → arrivée sur l'arbre ; la carte reste accessible
   par son onglet (non-régression carte/recherche/géocodage).
9. Non-régression : `bash tests/lancer.sh` 100 % vert (tous les harnais
   préexistants inclus).

## Ce qui ne change PAS

Fiche contact, formulaire (avec secteur A2), onglet Contacts, carte (reléguée
mais intacte), recherche v3-⑥, géocodage v3-⑤, auth/RLS/middleware/CSP,
dictée v3-④. A3 ajoute un écran, n'en retire aucun.

## Note d'ordonnancement

Le rendu de l'arbre lit `etat.noeuds` : **testable en mode démo dès
maintenant** (fixtures avec `secteur_activite`). La donnée réelle
`secteur_activite` en base dépend de l'application de la migration 0006
(gate Paul, boucle A2) — sans elle, les contacts réels n'auront pas encore
de secteur et tomberont tous sous « À classer », ce qui est le comportement
correct et non un bug.
