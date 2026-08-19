# SPEC P5c — la « boussole des futurs » de VRANESH devient un ciel

Boucle 3 de la session 2026-08-19 (PR #172). Arbitrage **C** du cadrage LV5
§3.3, tranché par Paul (« que je n'aie plus l'ancien affichage de la
boussole ») : *là où une page de travail affiche sa propre boussole, elle
affiche un ciel. Le reste de la page ne bouge pas.*

## ① Le but (vrai à la fin)

Le plateau `#vranesh-plateau` de la section « La boussole des futurs » rend les
thèmes de futurs comme un **ciel du moteur commun** (`window.UltimaCiel`) —
une étoile par thème, tous les noms visibles — au lieu de la rose (aiguilles +
cœur + caps). Clic/Entrée sur une étoile ouvre l'arbre du thème exactement
comme le clic d'un cap aujourd'hui ; survol/focus dépose la même parole.
`js/boussole-noyau.mjs` n'a plus aucun appelant et est supprimé.

## ② Les étapes

1. **AVANT toute ligne** : `cd tests && node smoke-vranesh.mjs` → consigner le
   VERT de départ (232 assertions).
2. `vranesh.html` :
   - charger `js/ciel.js` (script classique) AVANT `js/vranesh.js` ;
   - retirer la balise `js/boussole-noyau.mjs` (fin de page) et son commentaire,
     remplacés par un commentaire disant que le ciel a remplacé la rose (P5c).
3. `js/vranesh.js` — le rendu du plateau (zone ~1260-1400, fonctions autour de
   `positionsCaps` / du dessin aiguilles+cœur+caps) :
   - **adaptateur local minimal** : les thèmes déjà en mémoire →
     `{ noeuds: [{ id, nom }], personnes: [], rattachements: [], relations: [] }`.
     AUCUNE autre donnée. Les intitulés restent absents du HTML **servi**
     (ils n'arrivent que de `/api/situations` après session — invariant §5,
     harnais d'absence existant).
   - rendu : `window.UltimaCiel.rendre(scene, donnees, options)` où `scene` est
     un conteneur que le moteur peut vider (`textContent = ''`) — l'état vide
     et tout ce qui doit survivre restent HORS de la scène (leçon ciel-noeud).
   - **options** (motif exact de `js/ciel-noeud.mjs` ~l.200, avec DEUX écarts
     délibérés) : `libellesType: { cap: '' }`, `libellesStatut: {}`,
     `cadrerSurLesEtoiles: true`, `tousLesNoms: true`, `couronne: true`,
     **`fond: false`** (écart 1 — la page a DÉJÀ son sol étoilé P5b : deux
     fonds se disputeraient le regard, interdit §16.6), **pas de
     `margesUtiles`** (écart 2 — le ciel vit dans un cadre borné du cartouche,
     pas en plein écran derrière un HUD).
   - **interactions portées** : `surClicNoeud: (id) => ouvrir le thème id`
     (même chemin de code que le clic de cap actuel) ; écouteurs
     `mouseenter`/`mouseleave`/`focus`/`blur` sur les groupes d'étoiles
     (`.ciel-etoile[data-noeud-id]`) → la parole existante de `#vranesh-parole`
     (motif ciel-noeud l.270-287). Le clavier (Entrée/Espace) passe par le
     moteur (`role="button"`).
   - **`is-pret` conservé** : le signal `.boussole-plateau.is-pret` sur
     `#vranesh-plateau` reste posé au même moment logique (fin du premier
     rendu) — `tests/_caps.mjs` et d'autres harnais l'attendent.
   - **état vide conservé** tel quel (message `vranesh-boussole-vide`, aucun
     ciel monté).
   - re-rendu (ajout/dénouement d'une situation) : même point d'accroche
     qu'aujourd'hui — la fonction repeint, `rendre()` vide et remonte.
   - la fonction `positionsCaps` et tout code de la rose devenus morts sont
     RETIRÉS (pas commentés).
4. `css/vranesh-boussole.css` (MODIFIABLE — cadrage LV5 §16.4) :
   - le plateau devient une **fenêtre de nuit** dans le cartouche de parchemin :
     fond de nuit du ciel (jetons de `css/ciel.css` — les classes, pas des
     valeurs recopiées), bord gravé du registre antique (pas d'arrondi),
     hauteur du même ordre qu'aujourd'hui ;
   - les règles de la rose (aiguilles, cœur…) propres à CE fichier et devenues
     mortes sont retirées. **`css/boussole.css` : INTERDITE DE TOUTE RETOUCHE**
     (d'autres pages y bâtissent).
5. Suppression du noyau (règle LV4 §13.4 : « seulement si plus aucune page ne
   l'appelle — vérifié par recherche, pas supposé ») :
   - re-vérifier par `grep -rn "boussole-noyau"` qu'aucun HTML/JS ne le charge ;
   - supprimer `js/boussole-noyau.mjs` ;
   - `tests/unit-registre-lv3.mjs` : `ligneVivante`/`signalDe` s'importent
     désormais de `../js/cockpit-parole.mjs` (où ils vivent depuis le
     2026-08-13) ; les assertions sur `positions` (l.119-127) sont ABANDONNÉES
     avec leur raison écrite en commentaire : la trigonométrie de la rose est
     morte avec la dernière rose — le ciel a sa propre géométrie, éprouvée par
     `smoke-lv4-ciel` et le pire cas couronne(12).
6. `tests/smoke-vranesh.mjs` : chaque assertion de la boussole (~6 zones)
   reclassée **portée / remplacée / abandonnée avec raison écrite en marge**
   (motif : smoke-console.mjs §A, smoke-boussole.mjs §A). Les remplacements
   type : attente `is-pret` (portée), caps → étoiles `text.ciel-nom` comparées
   AU CONTENU de la fixture (ensembles, ordre abandonné : la géométrie range),
   clic cap → dispatchEvent('click') sur l'étoile (hover() expire sur un ciel :
   dispatch mouseenter/mouseleave), contrastes mesurés contre le fond
   réellement peint. AJOUT : la **géométrie se mesure** — `getBBox()` de la
   scène comparée au `viewBox` du SVG de LA scène (`ownerSVGElement`, jamais
   `querySelector('svg')` — leçon du blason 72×72), aux deux largeurs, ET sur
   un **pire cas construit** de 12 thèmes injectés par la fixture (règle
   2026-08-01 : les données du jour sont un échantillon favorable).
7. `node smoke-vranesh.mjs` APRÈS → vert ; puis `bash tests/lancer.sh` ENTIER.

## ③ Les moyens (fichiers touchés — et EUX SEULS)

`vranesh.html` · `js/vranesh.js` · `css/vranesh-boussole.css` ·
`tests/smoke-vranesh.mjs` · `tests/unit-registre-lv3.mjs` ·
suppression `js/boussole-noyau.mjs`.

## ④ Critères de réussite (mesurés, jamais regardés)

1. `smoke-vranesh` vert avant ET après, chaque assertion boussole classée.
2. Patrimoine COMPLET vert (`bash tests/lancer.sh`), sortie 0.
3. Zéro intitulé de thème dans le HTML servi (harnais d'absence existant).
4. Clic ET clavier ouvrent l'arbre du thème ; survol ET focus déposent la
   parole ; sortie → parole par défaut.
5. `getBBox()` ⊂ `viewBox` aux deux largeurs (390/1280) et sur couronne(12).
6. Zéro erreur console sur vranesh.html, les deux largeurs.
7. `grep -rn "boussole-noyau" --include="*.html" --include="*.js"
   --include="*.mjs"` ne rend plus que des mentions en COMMENTAIRES/prose
   d'autres fichiers (à laisser) — aucun import, aucune balise script.

## ⑤ Ce qu'on ne fait PAS

- Toucher à `css/boussole.css`, aux API, à la base, aux formulaires, au
  registre Lv3, à `js/ciel.js`, à `js/ciel-noeud.mjs`.
- Activer `fond: true` (deux ciels sur un écran).
- Committer : le fil principal (Léo) contre-vérifie puis committe.
- Réécrire les entrées passées des journaux/cadrages.

## ⑥ Pre-mortem (« la boucle a échoué : pourquoi ? »)

| Mode de défaillance | Prévention |
|---|---|
| Le moteur vide la scène et emporte l'état vide / un morceau du cartouche. | Tout ce qui survit vit HORS de la scène (leçon ciel-noeud, écrite en ②3). |
| Un intitulé intime se retrouve dans le HTML servi. | Aucun changement au flux de données ; harnais d'absence au vert exigé. |
| La géométrie déborde du cadre borné. | Critère 5 : `getBBox()` vs `viewBox` via `ownerSVGElement`, + couronne(12). |
| `is-pret` change de moment et des harnais patrimoniaux expirent. | ②3 : signal conservé au même moment logique ; patrimoine complet en ⑦. |
| Le clavier perd l'ouverture des thèmes. | Critère 4 éprouvé AU CLAVIER, pas à la souris. |
| `boussole.css` retouchée « juste un peu » pour arranger la fenêtre. | INTERDITE (⑤) ; toute retouche vit dans `vranesh-boussole.css`. |
| Le harnais est adapté « en douce » pour passer. | ②6 : chaque assertion classée, les abandons portent leur raison écrite. |
