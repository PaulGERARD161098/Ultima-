# CADRAGE-ULTIMA — audit → patch → améliorations, adapté au réel du projet

## ÉTAT (mise à jour du 2026-09-14 ; historique conservé)

> **Deux sessions ont tourné en parallèle le 2026-08-01** (fil affichage Lv3
> et fil IMLADRIK). Les deux clôtures sont conservées telles quelles : on
> concatène, on n'arbitre pas — même règle que pour le journal.

- 💾 **SESSION 2026-09-26 (fin d'après-midi) — PALIER SAUVEGARDÉ, PR #293 NON FUSIONNÉE.**
  A8 = V1 (couronne) et A9 rendus ; **lot 2a livré** (noms ≥ 11 px d'écran, Georgia) ;
  **le socle** livré sur capture de Paul (bandeau, dock, parole empilés sans recouvrement ;
  recommandation de Léo dite une fois ; ciel au téléphone 166 → 301 px). Palier : dry run +
  audit de sécurité — **S1 corrigé sur la branche** (noms Finubar en `innerHTML` brut dans le
  cartouche, prouvé au navigateur) ⚠️ **toujours en production tant que #293 n'est pas
  fusionnée** ; variante « figure » retirée. ⛔ La ligne ci-dessous (« A8 et A9 attendent
  Paul ») est PÉRIMÉE : ils sont rendus. Prochaine action : go de Paul sur la fusion de #293,
  puis lot 2b (activation V1). Détail : carte-celeste §18 à §21.

- ✴️ **SESSION 2026-09-26 (après-midi) — LOT 2 : LA FIGURE EST PRÊTE, RIEN N'EST ACTIVÉ.**
  Astérisme (arbre couvrant minimal) et éclat par le rang dans `js/ciel.js`, options
  inactives ; maquette `design/preview-carte-celeste.html` critiquée (impeccable, deux
  évaluations isolées ; constats vérifiés puis corrigés). Corrigé en production : le
  clavier couchait la constellation (877 px → 0). A8 (reco V1) et A9 (lisibilité des
  noms) attendent Paul. Patrimoine 42 + 43 vert. Détail : carte-celeste §17.

- 📜 **SESSION 2026-09-26 (suite) — LOT 0 LIVRÉ : `PRODUCT.md` existe.** Entretien
  `impeccable init` (trois inférences, toutes confirmées) ; `PRODUIT.md` réduit à ses
  contrats techniques (144 → 58 lignes) ; renvois vivants à jour (CLAUDE.md, ROADMAP-SITE,
  quatre agents), archives datées intactes. A7 rendu (oui). Suite : lot 2, au go.

- 🗺️ **SESSION 2026-09-26 — A2 À A5 RENDUS, LOTS 0/2/3 CADRÉS À LA LIGNE, aucun code.**
  `CADRAGE-2026-09-25-carte-celeste.md` §14. Trois constats lus dans le code : les
  étoiles de navigation sont sur une **couronne** (l'arbre y donnerait un arc → A8,
  sur capture) ; la taille d'étoile vient du **nombre de liens** (les traits restent
  hors `relations`) ; `PRODUIT.md` porte les **contrats** de quatre agents (A3 précisée :
  il se réduit à eux). A7 (reco : retirer l'« anneau de Léo » du lot 3) ouvert.

- 🎯 **SESSION 2026-09-25 (soir) — LOT 1 « LE CLIC EXACT » LIVRÉ, sur go explicite de
  Paul.** Cadrage fusionné (#291 → `8698739`). Harnais `smoke-clic-exact` écrit EN
  PREMIER et vu rouge sur `main` (15/21, tap compris) ; dépliage au survol retiré de
  `js/ciel-noeud.mjs` (A1) ; **écart au plan** : une garde `:focus-visible` dans
  `js/ciel.js` — l'appui de 150 ms faisait viser la caméra dès le `mousedown` (176 →
  630 px) — soumise à Paul à la fusion. 21/21, patrimoine 41 + 43 vert (« 46 » annoncé à tort le 25/09, corrigé le 26/09). Détail :
  `CADRAGE-2026-09-25-carte-celeste.md` §13. Reste : recette de Paul sur le preview.

- 🗺️ **SESSION 2026-09-25 — LA CARTE CÉLESTE EST CADRÉE, RIEN N'EST CODÉ** (demande de Paul :
  « cadrons »). `CADRAGE-2026-09-25-carte-celeste.md` : mesuré ce soir, **le clic sur NAGA
  échoue dans 4 gestes sur 5** — le dépliage au survol redessine la scène et déplace l'étoile
  de 119 px sous le curseur (témoin : 0 px et clic exact sous isolement) ; aucune constellation
  n'a de figure (0 trait) ; les 10 dépôts sont bien au ciel, deux crans sous la racine, avec
  session. Quatre lots (init impeccable · clic exact · figure · dépôts partout), six arbitrages
  **A1-A6** attendus de Paul. Léo-écrit reste le J3 du 22/09, non re-cadré.

- ✅ **LIVRAISON 2026-09-14 — GO REÇU, AUDIT DÉPLOYÉ.** PR #242 fusionnée
  au commit `fc2aafc6128567e63ae729607cfe9aabc96380f2` ; CI unitaire et
  navigateur verte. Migration appliquée sous la version Supabase
  `20260914152259` (fichier `20260914142755`), droits et contraintes vérifiés.
  Vercel confirme le déploiement à 15:24:57 UTC. Accueil et API sans session
  contrôlés ; trois fichiers JS de production identiques au code testé.
  **Les gates SQL et fusion sont levés et exécutés : ne pas rejouer ces étapes.**
  Les limites d’accès au connecteur Vercel, aux sondes privées et aux parcours
  avec compte réel figurent dans `AUDIT-2026-09-14.md` §Livraison. Le cap J3/P4
  reste inchangé ; la note de préparation suivante est historique.

- 🔒 **SESSION 2026-09-14 — PRÉPARATION DE L’AUDIT (ÉTAT AVANT LE GO).**
  Code et tests poussés sur `fix/audit-2026-09-14`, commit
  `a7280bbf2c256658b75bc6db9d5f42f8ac1a814b` ; **36/36 suites unitaires et
  41/41 harnais navigateur verts localement**. Capture du journal, brouillons
  par compte, réponses tardives, protection des fichiers internes, OAuth,
  pagination et intégrité SQL corrigés. **Rapport : `AUDIT-2026-09-14.md`.**
  Les 28 tables réelles ont la RLS et les 10 vues sont invoker ; aucun DDL ou
  changement de données de production n’a été exécuté. **Prochaine action :
  valider et livrer la PR, migration `20260914142755` avant le code.** Gates
  SQL et fusion de `CLAUDE.md` ouverts. Les FK RIVEN 0025 sont déjà présentes
  dans la base réelle : les anciennes notes « migration à appliquer » sont
  périmées sur ce point. Le cap produit J3/P4 reste celui acté précédemment.

- 🎨 **SESSION 2026-09-02 — L'ACCUEIL EST PILOTÉ PAR FINUBAR, ET LA PORTE EST
  PASSÉE AU CIEL.** PR #185 (`b4dc35c`) et #186 (`c9c4587`) **fusionnées** sur go
  de Paul. Les 8 dépôts sont des astres de l'arbre, la lueur d'appel monte des
  astres vers leurs constellations, le bandeau du bas porte ≤ 3 signaux et
  l'action unique de Léo, et l'écran de connexion a quitté la mer pour le champ
  d'étoiles commun. Cinq arbitrages rendus par Paul, tous tranchés.
  **État détaillé, roadmap et pre-mortem à 3 mois : `REPRISE-2026-09-02-accueil-finubar.md`.**
  Reste ouvert : **P4** (les signaux du cockpit sur le même ciel), après que P3
  ait vécu — arbitré, pas oublié.

- 🔒 **SESSION 2026-08-31 (2) — FINUBAR NE TENAIT QU'À UNE SEULE BARRIÈRE.**
  PR #179 **fusionnée** (`64bbb93`) sur le go de Paul. En enchaînant sur les deux
  vérifications de la fusion du 21/08 :
  - **La vérification « en conditions réelles » est impossible d'ici et le
    restera** : le proxy refuse le CONNECT vers la production (403 sur le
    tunnel, re-mesuré). La reporter une 3ᵉ fois, c'était la reporter toujours.
  - **L'écart trouvé en cherchant sur quoi le refus reposait** : `.vercelignore`
    couvrait `memoire/` et `adramelech/` mais **pas `finubar/`**. `macro.json`
    est un fichier statique — l'état de pilotage des 8 dépôts ne tenait qu'au
    middleware, sur l'hypothèse invérifiable qu'il intercepte les statiques.
  - **Hypothèse RETIRÉE, pas documentée** (charte §⚡) : `finubar/` sort du
    déploiement ; rien de servi n'en dépendait. **Verrou posé** : tout préfixe
    privé du middleware doit être hors déploiement — vérifié **hors ligne**,
    exception `api/_lib` **nommée** dans le test, instrument éprouvé sur un cas
    connu, verdict **éprouvé rouge** sans le correctif.
  - ⚠️ **Une ligne du middleware** : `PREFIXES_PRIVES` exporté pour être
    mesurable, sans effet sur le comportement — signalé, zone à gates.
  - ⏳ **Reste** : la vérification ① (recaler les grains des 7 autres dépôts sur
    `main`) — elle exige d'attacher ces dépôts, non faite dans cette boucle.

- 🔭 **SESSION 2026-08-31 — L'ISOLEMENT SE RESSERRE À UN SEUL ÉTAGE (livré).**
  Paul tranche l'arbitrage laissé ouvert le 28/08 : *« quand il montre NAGA,
  affiche-moi juste ADRAMELECH, IMLADRIK — les grands thèmes ; ensuite, quand on
  clique dessus, la suivante s'applique »*.
  - **Un seul étage** : isoler peint les enfants DIRECTS, et eux seuls. La
    profondeur n'est plus un réglage, elle est **contingente à ce qu'il y a
    dedans** — un cran par clic. Le geste devient identique à tous les étages.
  - **Deux suites obligées** : la règle de groupement par tête est retirée (elle
    ferait des amas d'une étoile étiquetés du nom de cette étoile) ; la
    passerelle RESHIRAM ⇄ ZEKROM change d'étage (sous TAO, plus sous NAGA) — la
    garde « les deux bouts peints » a rendu le déplacement sûr.
  - **Le pire cas construit a été RECALCULÉ, pas relancé** : « 4 têtes × 5
    projets » n'aurait plus peint que 4 étoiles sous l'intitulé « 24 ». Il vaut
    désormais **24 enfants directs**. *Quand la règle change, un pire cas
    recalculé — sinon il est vert parce qu'il mesure l'ancien monde.*
  - **Six verdicts éprouvés ROUGES** sur l'ancien comportement avant d'être
    crus, dont un qui mesure une **absence** ; une mesure neuve au patrimoine :
    la **récursion dans le navigateur** (fil à trois crans, adresse qui suit).
  - **Patrimoine complet vert** : 18 harnais, zéro échec.

- 🌌 **SESSION 2026-08-28 — LE CIEL S'ISOLE (livré).** Dicté par Paul : *« quand
  je clique sur une constellation, ça m'affiche uniquement cette constellation et
  plus les autres ; on zoome et on fait disparaître ce qui n'a pas été
  sélectionné »*.
  - **Le geste change de nature** : un nœud qui CONTIENT quelque chose ne
    change plus de page, il **s'isole sur place** — extinction des frères,
    approche de la caméra, re-dessin sur sa seule descendance, **deux étages
    d'un coup** (NAGA → ses 3 quadrants ET leurs 8 projets). Le foyer lui-même
    n'est plus peint. **Seules les feuilles ouvrent encore une page.**
  - **Trois sorties** (fil d'Ariane, Échap, clic dans le vide) et **l'adresse
    suit** (`ultima.html#naga`) : la flèche « précédent » remonte d'un cran, et
    un ciel isolé se partage par un lien.
  - **Les huit coques restent des PORTES**, elles cessent d'être le chemin :
    repli `<noscript>`, lien direct, adresse. Cinq assertions « clic → page »
    de trois harnais **remplacées, pas supprimées**, chacune scindée en deux.
  - **Patrimoine complet vert** (88 sections) ; **+27 verdicts unitaires** sur
    l'adaptateur, **+20 au navigateur**, dont le **pire cas construit à 24
    étoiles** et une mesure neuve : le **recouvrement ciel ↔ mobilier**, qui a
    trouvé un défaut que le contrôle de cadre déclarait vert.
  - ⏳ **Reste au registre** : les deux vérifications Finubar de la fusion du
    21/08 (recalage des grains, `/finubar` en conditions réelles) — la demande
    de Paul est passée devant, elles n'ont pas été faites.

- 🔚 **CLÔTURE DE LA SESSION 2026-08-21 — FINUBAR FUSIONNÉ SUR LES HUIT DÉPÔTS.**
  Zéro travail non poussé. Reprise détaillée, roadmap et pre-mortem à 3 mois :
  **`REPRISE-2026-08-21-finubar.md`**.
  - ⛔ **DEUX VÉRIFICATIONS ATTENDENT LA PROCHAINE SÉANCE**, avant tout autre
    travail — elles sont dans le grain, donc le rappel les présentera seul :
    ① **recaler les 8 grains sur `main`** (fusion en SQUASH : chaque
    `dernier_arret.commit` pointe dans le vide ; le rappel de chaque dépôt
    l'annonce et donne la tête courante) · ② **vérifier en conditions RÉELLES**
    que `/finubar/macro.json` et `/api/_lib/finubar-macro.mjs` refusent et que
    `/finubar` répond — la seule vérification du lot jamais faite, l'egress du
    bac à sable étant bloqué (403 du proxy).
  - **14 écarts trouvés au diagnostic, 14 corrigés**, chacun éprouvé rouge avant
    d'être cru. Quatre étaient rouges et partagent une forme : *un contrôle qui
    a l'air structurel et ne l'est qu'à une requête près*.
  - **Une règle versée à la charte** (§⚡) : un garde-fou se vérifie du côté où
    il peut être contourné ; et quand on ne PEUT pas le vérifier de ce côté-là,
    on retire l'hypothèse au lieu de la documenter.

- 🧭 **SESSION 2026-08-21 — FINUBAR : les huit dépôts pilotés depuis un seul
  endroit, livré.** Demande dictée par Paul : *« beaucoup de projets tournent,
  j'ai un peu peur de m'y perdre »*. Cadrage complet, pre-mortem à 7 causes et
  arbitrages : **`CADRAGE-FINUBAR.md`**.
  - **Ce qui est en place** : un `FINUBAR.md` à la racine des **8 dépôts**
    (grain semé depuis l'état RÉEL mesuré le jour même, pas de mémoire) · un
    hook `SessionStart` dans les 8 qui injecte ce grain à l'ouverture de séance
    (~250 tokens, zéro geste) · le moteur PUR `finubar/agreger.mjs` + la
    collecte, qui **mesure la dérive git** de chaque note · l'écran `/finubar`
    derrière session · le skill `.claude/skills/finubar/`.
  - **Trois arbitrages de Paul** : périmètre = les 8 dépôts de code ·
    rappel = **à l'ouverture de séance uniquement** (ni cron, ni push, ni
    e-mail) · forme = **page + cartouche maintenant**, entrée dans la
    constellation générale **plus tard** (« tout projet d'ampleur doit y être,
    on en reparle »). D'où `versConstellation()` : écrit, testé, branché sur
    rien — le jour venu, c'est un branchement, pas une réécriture.
  - **L'ordre affiché a été corrigé en séance** : à rang égal il retombait sur
    l'ALPHABET et plaçait `artisan-builder` devant RénoBoost, dont le geste
    attend depuis le 04/08. Ce qui départage est désormais une **ancienneté**
    (`en_attente_depuis`), jamais un nom. *Un ordre déterministe qui n'est pas
    un ordre juste est pire qu'un ordre absent : on le suit.*
  - **UNE PART DE L'ANGLE MORT DU 20/08 EST FERMÉE** : `smoke-finubar.mjs`
    mesure le contraste des textes rendus **APRÈS authentification** (session
    stubée) — exactement ce qui manquait à `idees.html` quand il portait un
    3,64:1 que le harnais notait à zéro échec. La sonde a été éprouvée à
    **1,76:1** sur une couleur volontairement mauvaise avant d'être crue.
  - **Le harnais du moteur a été éprouvé ROUGE sur trois verrous** (une date
    absente qui répondrait `0` au lieu de `null` · un mot de reproche dans le
    cartouche · un grain illisible écarté en silence), puis vert.

- 🌠 **SESSION 2026-08-20 (soir) — CADRAGE LV6 « LE CIEL VIVANT » DÉPOSÉ,
  exécution GELÉE au top départ de Paul.** Demande dictée : « bien implanter
  les constellations partout + rendre l'interface plus proactive (pousser à
  l'usage et à l'amélioration continue) », avec consigne explicite : plan très
  détaillé, **aucune exécution avant le top départ**. Livrable :
  **`CADRAGE-LV6-CIEL-VIVANT.md`** (format 6 points) — 5 paliers :
  P1 signaux cockpit élargis (fraîcheur, orphelines, élan ALTHEA) ·
  P2 étoiles qui appellent (lueur + compte au survol, fail-closed) ·
  P3 cartouche du matin (3 signaux, 1 action, module pur `leo-matin`) ·
  P4 ciel des idées (maquette d'abord) · P5 TAO en double constellation
  (à trancher après P4). **Aucune migration dans tout LV6 — on ne fait que
  lire.** 5 arbitrages posés (§7), volet donnée en actions Paul (§8 :
  contacts + relances au journal, preuves RESHIRAM, relevés ALTHEA).
  État base mesuré en prod le 2026-08-20 : `journal` = 0 (les relances
  tournent à vide), `personnes` = 0, `preuves` = 0, dernier relevé ALTHEA
  2026-08-10 — chiffres à re-mesurer à l'ouverture de P1.

- 🔚 **CLÔTURE DE LA SESSION 2026-08-20 (soir)** — `main` = `c5b26d1`, **zéro PR
  ouverte, zéro travail non poussé**. Trois boucles fermées et fusionnées :
  **#173** (ADR-009 VITRUVE capturée), **#174** (dette des demi-teintes soldée),
  **#176** (KALAMN-TALAEN recadrée). Le fil parallèle a déposé **#175** (cadrage
  LV6) ; conflit sur le journal résolu par concaténation.
  - **LE REGISTRE DES DETTES LV5 EST VIDE.** Les trois restes cosmétiques
    consignés le 2026-08-19 (5 contrastes de l'abaque, lien ALTHEA, légende
    KALAMN-TALAEN) sont traités et verrouillés par des assertions.
  - **⏳ CE QUI RESTE À LA MAIN DE PAUL** (inchangé, aucune nouvelle dette) :
    advisors Supabase post-DDL, `ANTHROPIC_API_KEY` en env Vercel, l'URL d'YCOME,
    la précision sur « mon dpe.fr » (VITRUVE), et le **top départ LV6**.
  - **⏳ MANQUE CONNU DU PATRIMOINE, nommé le 2026-08-20** : les pages
    **authentifiées** ne sont pas couvertes par les harnais — `idees.html`
    portait un contraste à 3,64:1 que le harnais notait à zéro échec, parce que
    ses textes ne sont pas rendus sans session. Ce n'est pas une régression,
    c'est un angle mort à financer un jour (fixture de session).
  - **Trois règles versées à la charte** (§⚡) : une dette décrite de mémoire
    est un souvenir et se re-mesure ; un verdict différentiel a besoin d'un
    verrou ; un fond supposé est un fond faux.

- 🎨 **SESSION 2026-08-20 (VITRUVE, puis la dette des demi-teintes), FUSIONNÉE
  pour la première moitié.**
  - ✅ **ADR-009 VITRUVE capturée** (PR #173, fusionnée) — bureau d'études
    embarqué dicté par Paul (« Réno Conception »). Fiche complète dans
    `adramelech/IDEES.md` : frontière avec CHAMBRE CLAIRE, les quatre étages de
    captation du potentiel solaire, séquencement v1→v4, sécurité PII.
    **Décisions Paul du soir** : le build vivra sur un **autre repo**, l'outil
    sera **combiné à un élément non révélé**, « avec mon dpe.fr » consigné mot
    pour mot (⏳ précision attendue). La fiche, elle, reste dans ADRAMELECH.
  - ✅ **DETTE DES DEMI-TEINTES SOLDÉE** — les 7 textes sous 4,5:1 que LV5 avait
    laissés en registre. **Trois jetons, sept textes, trois pages** :
    `--encre-pale` #7c6338 → **#695430** (`css/abaque.css`), #8a7147 →
    **#695430** (`css/idees.css` — les deux feuilles partageaient tous leurs
    fonds et avaient divergé sur ce seul jeton : ré-harmonisées), et
    `--parch-bas` #6d8299 → **#788fa8** (`css/althea.css`).
    **Mesuré après : zéro échec, zéro hérité** — pire ratio 5,45 (abaque),
    5,18 (althea-cadran), 7,48 (idees). Thème sombre déjà conforme (4,80
    minimum), non touché.
  - **CE QUE LA MESURE A CORRIGÉ DU REGISTRE** : le registre annonçait « 5 sur
    l'abaque + 1 lien ALTHEA » et « assombrir un jeton ». Faux sur trois points.
    ① Il y avait **7** textes sur **3** pages (`althea-cadran.html` « ↞ Le
    Système » n'était pas listé). ② Sur ALTHEA il fallait **éclaircir**, pas
    assombrir — texte clair sur fond sombre. ③ Le jeton n'était pas global :
    il est **local à chaque feuille**, ce qui a rendu la boucle bien plus petite
    que redouté.
  - **UN FOND SUPPOSÉ EST UN FOND FAUX.** Mon calcul théorique donnait 5,12:1
    pour le lien d'ALTHEA quand le harnais mesurait **4,36**. L'écart n'était pas
    une erreur de calcul : le lien n'est pas posé sur la nuit d'ALTHEA mais sur
    le **sol étoilé**, plus clair. Le fond réel a donc été **déduit du ratio
    mesuré** au lieu d'être supposé — et le calculateur WCAG lui-même a été
    validé d'abord sur quatre cas connus (21:1, 1:1, et le gris #767676 qui est
    le premier à passer sur blanc).
  - **LE VERROU** : `smoke-fond-contraste.mjs` est **différentiel** — il pardonne
    un défaut hérité par construction, et c'est ce qui a laissé ces sept textes
    dormir des semaines dans un rapport vert. Les pages soldées portent désormais
    `dettesSoldees: true` : pour elles le seuil redevient **absolu**. Éprouvé
    rouge (ancienne valeur réinjectée) puis vert.
  - **ANGLE MORT NOMMÉ** : `idees.html` affichait 3,64:1 en calcul — pire que
    l'abaque — et **zéro échec au harnais**, parce que ses textes en
    `--encre-pale` ne sont pas rendus sans session. Un défaut qu'aucune mesure
    ne voyait. Corrigé à la source par le jeton ; la couverture des pages
    authentifiées reste, elle, un manque connu.
  - **Patrimoine COMPLET vert** (84 sections, `bash tests/lancer.sh`).
  - ✅ **KALAMN-TALAEN RECADRÉE** (boucle 2, fusionnée à part) — la légende
    gravée du ciel IMLADRIK sortait de l'écran. Cause : `.kalamn-legende`
    (`css/imladrik-carto.css`) gardait le placement de la **boussole disparue**
    — `position:absolute; left:50%; transform:translate(-50%,0)` — alors que le
    ciel LV5 pose déjà la légende en pleine largeur
    (`.ciel-noeud-plateau > .ciel-legende { left:0; right:0; bottom:… }`). Les
    deux se cumulaient : bloc pleine largeur **translaté de la moitié de cette
    largeur**. Mesuré **−640 px en 1280 et −195 px en 390** — le registre disait
    « en 390 px », c'était **les deux**. Corrigé en ne laissant à la règle que
    sa typographie ; aucune propriété de placement n'y revient.
    *Un positionnement hérité d'un contexte disparu ne devient pas inoffensif :
    il devient invisible, et il agit.*
  - **POURQUOI ÇA A TENU SI LONGTEMPS** : `smoke-imladrik-carto.mjs` vérifiait
    que la légende **existe** et son **contraste** — jamais sa **position**.
    *Un test qui vérifie qu'un texte est là ne dit rien de l'endroit où il est.*
    Deux assertions ajoutées, **aux deux largeurs** : dans le cadre, et centrée
    (tolérance 2 %). Elles mesurent la **boîte du texte** (`Range`), pas celle du
    bloc — un bloc pleine largeur « tient » toujours et ne prouve rien.
    Éprouvées rouges (transform réinjecté) puis vertes.

- 🌌 **SESSION 2026-08-16/17 (LV5 — la galaxie plein écran, puis le sol étoilé
  partout), TOUT FUSIONNÉ dans `main`.** Cadrage :
  **`CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md`** — §§11 à 16.10, c'est LA source pour
  reprendre. Six PR fusionnées : #164 (cadrage + P0→P3), #165 (TAO en Gémeaux +
  règle des liens), #166 (couronne + étoile affinée + fond sur RIVEN + focus
  clavier), #167 (P5a), #168 (renommage MAEDRETHNIR), #169 (P5b).
  `main` = `9130ab1`. **Patrimoine : 84 sections, sortie 0.**

  **CE QUI EST ACQUIS — le sol étoilé est le fond commun d'Ultima.**
  Trois registres, déduits de ce que la page FAIT (§16.2) :
  **① CIEL** (la galaxie EST la page) — 8 coques + RIVEN ;
  **② ATELIER** (on saisit, on relie) — VRANESH, DRAUKHAIN, MAEDRETHNIR,
  registre, RESHIRAM, ZEKROM, écrire, idées ;
  **③ INSTRUMENT** (on lit des chiffres) — l'abaque.
  Soit **9 pages embarquées** (`data-fond-etoile` sur le `<body>`), plus les
  coques déjà sur le ciel.

  **CE QUI RESTE, DANS L'ORDRE :**
  - ✅ **P6 FAIT le 2026-08-19** (session de reprise, PR #172) — `althea.html`
    et `althea-cadran.html` embarquées, **11 pages au total**. Registre
    instrument, mais le support n'est PAS une nappe de parchemin : ALTHEA est
    l'exception actée « l'antique vu de nuit » — ses `.althea-bloc` reçoivent
    leur propre plaque de nuit opaque (`--nuit`), les étoiles restant visibles
    ENTRE les blocs ; l'encre `--parch` est déclarée sur `.althea-page` (sinon
    `body[data-fond-etoile]`, 0,1,1, repeignait tout en crème). Le harnais
    apprend qu'un instrument peut **déclarer son support** (`nappe:` dans
    `CIBLES`) et exige désormais que **TOUS** les supports soient opaques, pas
    seulement le premier — éprouvé rouge en retirant la plaque.
  - ✅ **P4 FAIT le 2026-08-19** (session de reprise, PR #172) — **la racine
    `index.html` est passée au ciel** (étape ④c de LV4, la dernière coque, sur
    le module éprouvé huit fois). La galaxie EST l'accueil : trois étoiles
    (ULTIMA, ALPHA, ALTHEA), bandeau « Bienvenue » + invite en HUD (la racine
    GARDE son invite, contrairement aux coques). **La porte n'a pas bougé d'une
    ligne** : `#ecran-connexion` (z-index 2000) couvre le ciel tant qu'aucune
    session n'est ouverte, `js/boussole-auth.js` est INTOUCHÉ — la coque garde
    la classe `boussole-scene` (sa poignée d'inertie), neutralisée en layout
    par `ciel-noeud.css`. `smoke-boussole` migré assertion par assertion
    (portée / remplacée / abandonnée avec raison écrite), sections verrou et
    cockpit intactes ; la racine ajoutée au harnais plein écran (6 verdicts × 2
    largeurs verts). `js/boussole-noyau.mjs` N'EST PAS supprimé : VRANESH
    l'appelle encore (boussole des futurs — P5c). Les libellés « Boussole »
    (title, retours des coques) sont CONSERVÉS : c'est le nom de l'écran dans
    le vocabulaire de Paul, le renommer serait un choix produit, pas un geste
    technique.
  - ✅ **P5c FAIT le 2026-08-19** (session de reprise, PR #172) — la « boussole
    des futurs » de VRANESH est un **ciel** (arbitrage C), rendu par le moteur
    commun dans une **fenêtre de nuit** ouverte au milieu du cartouche de
    parchemin. Spec déposée AVANT le code (`design/spec-p5c-boussole-futurs-ciel.md`),
    implémentée par `front-carto`, contre-passée par Léo. `smoke-vranesh` passe
    de **234 à 250 verdicts** (11 portées, 7 remplacées, 2+4 abandonnées avec
    raison écrite, 18 ajouts) ; géométrie mesurée `getBBox()` ⊂ `viewBox` via
    `ownerSVGElement`, **zéro débordement** aux deux largeurs ET sur le pire cas
    `couronne(12)`. Deux écarts délibérés au motif des coques : `fond: false`
    (la page a déjà son sol étoilé P5b — deux ciels se disputeraient le regard)
    et pas de `margesUtiles` (cadre borné, pas de HUD plein écran).
    **`js/boussole-noyau.mjs` SUPPRIMÉ** : plus aucun appelant, vérifié par
    recherche. **Plus une seule rose dans Ultima.**

  **LES TROIS RESTES DE LV5 SONT FERMÉS.** Le sol étoilé couvre 11 pages, les
  neuf écrans de navigation ET la racine sont au ciel, et la dernière boussole
  interne a rejoint le moteur commun.

  **COMMENT EMBARQUER UNE PAGE (la recette, éprouvée sur 9)** : quatre ajouts —
  `css/ciel.css` + `css/ciel-fond-page.css` en fin de `<head>`, la classe
  `ciel-noeud-coque` et l'attribut `data-fond-etoile="<registre>"` sur le
  `<body>`, `js/ciel-fond.js` + `js/ciel-fond-page.js` avant les autres scripts.
  Puis **une ligne dans `CIBLES`** de `tests/smoke-fond-contraste.mjs`, et on
  laisse la mesure trancher le registre.

  **LES RÈGLES QUE CETTE SESSION A PAYÉES — à ne pas réapprendre :**
  - **L'ENCRE S'HÉRITE, ELLE NE S'ÉNUMÈRE PAS.** Une liste de sélecteurs
    (`h1, p, li, label, a` sous `body[data-fond-etoile]`) a une spécificité
    (0,1,2) qui **écrase les règles de page légitimes** — lesquelles savent, elles,
    sur quel fond leur texte est posé. Résultat mesuré : 13 textes cassés sur
    l'abaque, 6 libellés à 1,10:1. L'encre de la nuit est posée **une fois sur
    `body`** ; toute surface de parchemin déclare son encre **sur elle-même**.
  - **QUI POSE UN FOND DOIT POSER SON ENCRE** (corollaire) : `.carto-etat` avait
    un fond `--ile` sans `color` → son texte héritait de la crème. 1,10:1.
  - **SUR UN CIEL ÉTOILÉ, UNE ENCRE DE DEMI-TEINTE EST INTENABLE.** Un fond de
    nuit étoilée n'a pas UNE luminance, il en a une **plage** : une encre claire
    reste au-dessus de toutes les étoiles, une demi-teinte finira par en croiser
    une. **Un surtitre garde sa subordination par sa taille et son interlettrage,
    jamais par son assombrissement.**
  - **UNE OMBRE PORTÉE NE RACHÈTE PAS UN FOND TROP CLAIR** : le contraste se
    mesure contre le fond, pas contre un halo.
  - **UN DIAGNOSTIC QUI S'ARRÊTE À LA COULEUR RATE LE SUPPORT** : l'abaque ne
    perdait pas trois couleurs, elle perdait sa **nappe** (venue de `body.abaque`).
    Un geste (`.feuille`) a remplacé douze correctifs.
  - **UN TEST QUI NOMME UNE COULEUR SUPPOSÉE VIEILLIT MAL** : `smoke-idees`
    comparait la devise au jeton `--parchemin` écrit en dur — vrai avant le sol
    étoilé, faux après. Un test qui **lit ce qui est peint** survit au changement
    de sol.
  - **LIRE LE RGB BRUT D'UN CANVAS TRANSPARENT NE MESURE RIEN** (ses pixels sont
    du blanc à faible alpha) : seule la **capture composée** dit ce que l'œil voit.
    Signe d'alerte générique : *une réponse identique pour toutes les entrées
    n'est pas un résultat, c'est une panne d'instrument.*
  - **LE TEXTE LE PLUS FIN EST LE PLUS À RISQUE, ET C'EST CELUI QU'UN INSTRUMENT
    SAUTE** : à densité 1, un petit texte en petites capitales n'a aucun pixel
    opaque, donc aucun « coeur de lettre » — il traversait le harnais en silence.
    Le harnais mesure désormais à **densité 2** et **compte et nomme** les textes
    non mesurables.

  **L'INSTRUMENT DE RÉFÉRENCE** : `tests/smoke-fond-contraste.mjs`. Il peint
  chaque page **deux fois** (normale / texte transparent), en tire **le masque des
  lettres**, et mesure sous les coeurs de lettre. **Verdict différentiel** — avec
  ET sans le fond — car ces pages portent des défauts antérieurs : n'est rouge que
  ce qui est **nouveau**. Éprouvé rouge deux fois exprès.

  **⏳ ACTIONS HUMAINES en attente (aucune ne bloque) :**
  - **5 contrastes préexistants sur l'abaque** (jeton `--encre-pale` sur
    parchemin : « euros », « mois (12 à 24) »… 4,29:1 et 4,46:1 pour un seuil de
    4,5). Les corriger = **assombrir un jeton global** qui sert partout : une
    boucle à soi seule, à ouvrir explicitement.
  - **Légende `KALAMN-TALAEN` coupée au bord gauche** sur le ciel IMLADRIK en
    390 px. Sans rapport avec LV5.
  - **Lien « ↞ Ultima » d'ALTHEA à 4,36:1 en 1280** (jeton `--parch-bas` sur la
    nuit ; 5,10:1 en 390). Préexistant — mesuré identique avec et sans le sol
    étoilé (P6). Même famille que les 5 demi-teintes de l'abaque : à traiter
    dans la boucle « demi-teintes limites », à ouvrir explicitement.
  - ✅ **Opposition de TAO qui bascule en vertical à 390 px** : validée telle
    quelle par Paul le 2026-08-19 (« c'est ok pour TAO »). Rien à changer.
  - **Léo ne peut pas voir la preview Vercel** : le proxy de l'environnement
    refuse l'hôte (403 au CONNECT). Toute vérification est donc **locale**
    (Chromium réel) — le dire à Paul à chaque rapport plutôt que de laisser croire
    que la preview a été regardée.
  - ✅ **FICHE NOTION SYNCHRONISÉE le 2026-08-19** (boucle 0 de la session de
    reprise — la dette de clôture du 17/08 est soldée). L'entrée LV5 complète
    (registres, 9 pages, recette, reste à faire, règles payées, blocs 🔒/⚡) est
    en tête de la fiche « 📦 Repo Ultima- — Fiche projet »
    (`392c68b1-1948-81b0-9efb-fa0bd7b7c2b7`), avec le nota qui renvoie au repo
    pour le détail des sessions 24/07→14/08 — le repo reste la source complète.

- 🌠 **SESSION 2026-08-13/14 (LV4 — Ultima devient un ciel qui se déplie), EN
  COURS — PR #163, brouillon, NON fusionnée.** Cadrage :
  `CADRAGE-LV4-CIEL-DEPLIE.md` (§§10 à 14). Quatre boucles fermées, une ouverte.
  - ✅ **① La maquette du dépliage** : trois galaxies, le survol qui déplie, le
    clic qui zoome, ALTHEA sans contenu, Léo à chaque étage.
  - ✅ **② Le moteur** : `js/ciel.js` gagne trois capacités **inactives par
    défaut** (cadrer sur l'étendue réelle, tous les noms, approcher un nœud).
    L'occupation du cadre passe de **7,9 % à 65-75 %** pour un objectif de 60.
    **RIVEN vert avant et après, sans une retouche.**
  - ✅ **③ L'adaptateur** descend en profondeur et rejoint `js/` ; la garde
    anti-emballement passe de la maquette au module — *un garde-fou que chaque
    appelant doit penser à installer n'en est pas un.*
  - ✅ **④a La coque pilote** : `ultima.html` quitte la boussole. **Six
    fonctions portées** (cockpit fail-closed, blasons, cœur + légende, cap
    « à venir » inerte, repli `<noscript>`, trait entre caps liés).
  - 🔻 **UNE PERTE, DÉCLARÉE** : le clic du milieu et « ouvrir dans un nouvel
    onglet ». L'ancre SVG qui les aurait gardés **fait perdre le focus clavier**
    à l'étoile (mesuré, comparé à RIVEN). *Le clavier passe avant.*
  - 🔻 **LE PIRE CAS QUI MANQUAIT ÉTAIT LE PLUS PETIT** : j'éprouvais 3, 12 et
    20 objets ; la coque réelle en a **DEUX**, et deux objets se rangent aux
    extrémités du cadre. *Un pire cas ne se cherche pas seulement vers le haut.*
  - 🔻 **LES JETONS DE NUIT DE `ciel.css` SONT PORTÉS PAR `.espace-ciel`** — une
    page qui charge la feuille sans cette classe perd **tout** le régime
    chromatique **en silence**, puisqu'elle a l'air sombre grâce au `body`.
  - 🔒 **`css/boussole.css` et `js/boussole-noyau.mjs` intouchés** : VRANESH
    bâtit sur la première, les huit coques restantes sur le second. Le cadrage
    les annonçait « modifiés » — erreur corrigée AVANT d'écrire une ligne.
  - **Patrimoine : 59 harnais, sortie 0.** Restent ④b (sept coques) et ④c (la
    racine, en dernier).

- 🌌 **SESSION 2026-08-13 (RIVEN passe au thème stellaire), FUSIONNÉE** —
  PR #160 (`9b61993`, squash) au go de Paul (« Ok go / Merge tout / Puis
  diagnostique le tout et cadre la suite »). Cadrage : `CADRAGE-RIVEN-STELLAIRE.md`.
  Diagnostic + cadrage de la suite : **`AUDIT-2026-08-13.md`**.
  - ✅ **L'ARBRE et LA CARTE sont supprimés.** RIVEN n'a plus qu'une forme, le
    ciel, et **trois onglets**. `js/arbre.js` (445 l.), `js/carte.js` (273 l.),
    Leaflet, la recherche carte, les filtres, la légende — plus 253 lignes de
    CSS mort trouvées au diagnostic. **VRANESH n'est pas touché.**
  - 🔒 **La surface d'attaque a rétréci** : CSP de **3 hôtes tiers à ZÉRO**,
    `'unsafe-inline'` tombé avec Leaflet. Prouvé **par l'absence**
    (`smoke-csp`, `smoke-antique` sans un seul stub). Advisors rejoués :
    sécurité = 1 WARN sans objet (pas de mot de passe dans Ultima), perf = INFO.
  - 🔻 **DEUX FOIS J'AI INVENTÉ CE QUI EXISTAIT** (maquette) : les couleurs de
    type et le mot de l'état vide vivaient déjà dans `ciel.js` et `app.js`.
    J'ai même présenté à Paul comme arbitrage un mot rendu depuis deux jours.
  - 🔻 **UN NETTOYAGE CSS AUTOMATIQUE A CASSÉ IMLADRIK.** Le motif a mordu sur
    la dernière ligne d'une liste de sélecteurs partagée (`:focus-visible`) :
    corps commun emporté, liste orpheline, formulaire d'écriture mort. **Cinq
    verdicts rouges dans un quadrant que je n'avais pas touché** — le
    patrimoine COMPLET l'a vu, un run ciblé ne l'aurait pas vu. Un contrôle
    d'intégrité CSS (accolades, listes orphelines) entre au patrimoine.
  - 🔻 **Le ciel dépendait de l'arbre sans le dire** : une fonction rangée dans
    son bloc (`ouvrirFicheDepuisArbre`) et trois de ses classes CSS. Un
    écouteur orphelin (`#bouton-ajouter`) a ensuite vidé la page entière sans
    rien casser à l'œil. Les harnais ont tout attrapé.
  - ⚠️ **UNE PERTE FONCTIONNELLE SIGNALÉE, non compensée en douce** :
    « 0 résultat → création pré-remplie » vivait dans la recherche carte.
    **Décision de Paul attendue** : la porter dans le ciel, ou l'abandonner.
  - ⏭ **Reste au cadrage** : étape ④ (le thème stellaire sur la vraie page,
    cadré en 6 points dans `AUDIT-2026-08-13.md`), la bascule 2D du ciel
    (§9 du cadrage), puis la phase 2 — la console LV4 en constellations.
  - ✅ **Patrimoine COMPLET, cache VIERGE : 55 harnais, 742 verdicts, sortie 0.**
- 🌌 **BOUCLE OUVERTE 2026-08-12 (RIVEN passe la nuit) — CADRAGE LIVRÉ, code
  non commencé.** Demande de Paul (dictée) : « remodeling de la forme », thème
  constellation/sombre sur **toute** la page RIVEN, **suppression de l'arbre**,
  « garder que la constellation et le modèle 3D ». Cadrage :
  `CADRAGE-RIVEN-NUIT.md` (6 points, pre-mortem à 10 entrées).
  - **Trois arbitrages pris par Paul** : la **carte est supprimée** elle aussi
    (RIVEN = le ciel, rien d'autre) ; le noir couvre **toute la page** (accueil,
    fiches, formulaires, contacts, onglets) ; l'arbre part **franchement**
    (code, CSS, harnais) — **VRANESH n'est pas touché**.
  - **Mesuré avant de proposer** : le mix est structurel (5 espaces, 2 registres
    chromatiques) ; retrait = `arbre.js` 445 l. + `carte.js` 273 l. + 43 appels
    `UltimaCarte` dans `app.js` + 10 harnais chargeant la fixture Leaflet. Le
    retrait de la carte **rétrécit la CSP** (tuiles OSM + `unpkg` tombent —
    le correctif S3 d'hier devient sans objet). **GATE middleware.**
  - **Moyen conçu pour resservir (EB)** : le registre de nuit devient une
    **couche de jetons** `css/nuit.css` scopée `body[data-registre="nuit"]`,
    `styles.css` intouché — c'est elle que la **phase 2 (console LV4,
    constellations à la place de la boussole)** posera, quand Paul aura jugé le
    rendu de RIVEN. Phase 2 cadrée au §7, **non exécutée**.
  - ⏳ **Action Paul** : go sur la **maquette** `design/preview-riven-nuit.html`
    (tous les états + bandeau de contraste mesuré) — prochaine action unique.
- 🔒 **SESSION 2026-08-12 (diag sécurité complet — `securite-max`), LIVRÉE.**
  Demande de Paul : « corrige les bugs et les failles, sécurise tout ». Audit :
  `AUDIT-2026-08-12.md`. Patrimoine COMPLET : **57 harnais, 1 444 assertions,
  sortie 0**. Opus 4.8 (surface RLS/middleware) — signalé.
  - 🔻 **Mon 1er constat était FAUX** (« aucun header ») : j'avais oublié
    `middleware.js`. Réverté `vercel.json`. L'agent l'a rattrapé.
  - ✅ **S3 (moyenne, fonctionnel) — trouvé par la MESURE** : la CSP bloquait
    **100 % des tuiles OSM** (`*.tile…` ≠ domaine nu) — carte sans fond en prod,
    invisible depuis que le ciel est l'écran d'arrivée. Corrigé `middleware.js`,
    prouvé par `smoke-csp.mjs` (rouge→vert). **GATE merge (middleware).**
  - ✅ **S1 FERMÉ** : double-scellement FK `network_edges`/`journal` (oracle
    UUID cross-owner, atténué v4). Migration **`0025` APPLIQUÉE le 2026-08-12
    à 14 h 45** — vérifié en base le 2026-08-13 : les quatre FK sont
    composites (`*_scelle`), les FK simples ont disparu, et le registre
    `supabase_migrations` porte l'entrée. *Ce document a répété « écrite, non
    appliquée » pendant un jour entier : la ligne était fausse, personne
    n'était allé voir la base.*
  - ✅ **S2 fermé** : advisors rejoués (connecteur autorisé). Sécurité 0 lint
    réel ; perf = INFO. Le travail RIVEN du 12/08 : **sans faille (RAS prouvés)**.
  - ⏳ **Actions Paul** : arbitrer les index perf INFO (S2, non bloquant).
    (Merge fait ; `0025` appliquée — voir S1 ci-dessus.) Ancienne liste :
    arbitrer les index perf INFO (S2, non bloquant).
- ✅ **PR #158 FUSIONNÉE** (`fcc9739`, squash) au go de Paul — elle portait
  **les deux boucles ci-dessous** (RIVEN piloter/corriger/proposer + cadrage du
  ciel). Branche repartie de `origin/main` avant tout nouveau commit.
- 🔭 **SESSION 2026-08-12 (le ciel tient dans l'écran), LIVRÉE.** Demande de
  Paul en cours de session, capture à l'appui. Cadrage :
  `CADRAGE-CIEL-CADRAGE.md`. Patrimoine COMPLET vert : **56 harnais,
  1 430 assertions, sortie 0**.
  - 🔻 **UNE HYPOTHÈSE FAUSSE, ET BELLE, TUÉE PAR LA MESURE.** J'avais
    diagnostiqué « le monde déborde par construction » (rayon 322 pour une
    constante de 300) — élégant, cohérent avec la leçon du 01/08, et **faux** :
    mesuré sur six configurations, le rayon vaut **255 à 278** et **aucune
    étoile ne sortait jamais du viewBox**. *Corriger là-dessus aurait éloigné
    la caméra, donc rapetissé le ciel : l'inverse exact de la demande.*
  - ✅ **LE VRAI DÉFAUT** : sur 1670 × 900, la scène fait **689 px**, le SVG
    dedans **934**. `overflow: hidden` en coupait **245 — un quart du ciel** —
    sans que la page défile. `.ciel-svg` portait `height: auto`, donc une
    hauteur déduite de la **proportion du viewBox**, pas de la place réelle.
    Correctif : **le cadre suit la boîte** (`height: 100%`, `flex: 1`,
    `vbH` déduit de `clientHeight`). Rayon désormais **mesuré** : plus petit
    que la constante, il **rapproche** la caméra. Bouton **« Tout voir »**.
  - 🔻 **La règle du 01/08 est élargie** : « les éléments tiennent dans le
    viewBox » ne suffit pas — **le viewBox lui-même peut être coupé**. La bonne
    question est « **le cadre tient-il dans l'écran ?** ».
  - 🔻 **Un écran non éprouvé est un écran cassé** : le harnais ne tournait
    qu'à 390 px, où le défaut n'existe pas. Il tourne désormais aussi en large.
  - ✅ **Harnais éprouvé CONTRE l'ancien code** : rétabli, il vire au rouge.
  - 🔻 **Deux verdicts flottaient** (verts seuls, rouges en suite chargée) : ils
    mesuraient un transitoire d'animation. Ils attendent la **convergence**.

- 🧭 **SESSION 2026-08-12 (RIVEN : piloter, corriger, proposer), LIVRÉE.**
  Les **trois boucles restantes de RIVEN**, demandées par Paul (« cadre pour
  qu'on boucle les 3 boucles ce jour »). Cadrage : `CADRAGE-RIVEN-PILOTAGE.md`
  (6 points par boucle, pre-mortem à 9 entrées). Patrimoine COMPLET vert :
  **56 harnais, 1 430 assertions, sortie 0** (dont **70 neuves**).
  - 🔻 **MON PROPRE INVENTAIRE SE TROMPAIT, et la mesure l'a dit avant le code.**
    J'avais annoncé à Paul que « Léo qui fait quelque chose de la donnée »
    attendait **entièrement**. Faux : les relances remontent déjà
    (`relancesDues`, `rendreSectionRelances`), Léo suggère déjà
    (`calculerSuggestions`, **quatre règles**), et une section suit les
    rapprochements existants. **Il manquait UNE chose** : proposer un
    rapprochement **inédit**. *Sans ce contrôle, j'aurais réécrit un moteur qui
    existe, et probablement dégradé.*
  - ✅ **A — Piloter.** `interet_qualitatif`, `effort_temps`, `effort_energie`
    (migration **0003**, go de Paul du 2026-07-03) étaient atteignables depuis
    **aucun écran**. Ils vivent désormais sous un pli « Pilotage » du
    formulaire de relation, et s'affichent sur la fiche quand ils sont remplis.
  - ✅ **B — Corriger sans détruire.** Type et note d'une relation, rôle d'une
    personne : réparables **sans supprimer l'objet**, donc **sans perdre le
    journal** qui lui est adossé. `type` dégèle (`EDGE_UPDATE_FIELDS`), validé
    par le **même** contrôle qu'à la création ; **`source_id` et `target_id`
    restent FIGÉS** — ils *définissent* la relation, en changer un en
    désignerait une autre et le journal deviendrait un faux témoignage.
  - ✅ **C — Proposer.** Règle **R5** : deux fiches qui se répondent et ne sont
    pas reliées, **avec la raison énoncée**. Léo **pré-remplit**, Paul valide —
    aucune écriture à l'initiative de Léo, testé par l'**ABSENCE**.
  - 🔻 **Défaut de conception trouvé par le harnais** : R5 rangée en cinquième
    position **ne s'affichait jamais**. Le moteur plafonne à **trois**
    suggestions et R1+R2+R3 remplissent les trois places dans tout réseau réel :
    **la seule règle qui apprend quelque chose à Paul était affamée par trois
    règles d'entretien.** Elle passe juste après les relances en retard.
    *L'ordre des règles n'est pas un détail d'implémentation : c'est un
    arbitrage de valeur, et il doit être écrit comme tel.*
  - 🔻 **Et une fois de plus, le harnais avait tort avant le produit** : mon
    critère C6 confondait « ne plus proposer le rapprochement » et « ne plus
    nommer l'artisan » — R3 le nomme légitimement. Assertion précisée, produit
    inchangé.
  - ⚠️ **Surface à risque touchée, signalée** : `api/_lib/validate.js` — un
    champ entre dans une liste blanche d'écriture. **Aucun changement de RLS,
    de portée `owner` ni de migration** ; `unit-relation-pilotage.mjs` prouve
    que source et cible restent refusées en update et que le type reste borné
    à `EDGE_TYPES`.
  - ✅ **L'affichage n'a pas bougé** : `js/ciel.js`, `js/arbre.js`,
    `js/carte.js`, `supabase/**` = **zéro ligne de diff**.

- 🪶 **SESSION 2026-08-12 (RIVEN se remplit), CLOSE.** PR **#156 fusionnée**
  (`e1e9144`) au go de Paul. Cadrage complet : `CADRAGE-RIVEN-SAISIE.md`
  (format 6 points, pre-mortem à 9 entrées). Patrimoine COMPLET vert :
  **54 harnais, 1 360 assertions, sortie 0** (dont **50 neuves**). Rien de non
  poussé.
  - 🎯 **DÉCISION DE PAUL, 2026-08-12 : l'INGESTION est ABANDONNÉE** — *« pour
    l'instant, je renseigne les contacts à la main »*. La voie ① du peuplement
    (Léo ingère une source existante et propose des fiches pré-remplies) **sort
    du plan** ; la voie ② — la saisie en série, livrée par cette PR — **est la
    seule**. La question « quelle source ? », bloquante depuis le 10/08, **est
    donc close, et sans réponse : elle n'a plus d'objet.** *À ne pas
    reproposer tant que Paul ne rouvre pas le sujet.*
  - ✅ **Le WARN « protection des mots de passe compromis » est SANS OBJET, et
    c'est vérifié, pas supposé.** Ultima n'a **aucune authentification par mot
    de passe** : `signInWithOtp` (lien magique) et `signInWithOAuth` (Google)
    sont les deux seules voies (`js/app.js:4012` et `4034`,
    `js/boussole-auth.js:75` et `92`). Le réglage n'agit que sur un mot de
    passe **saisi** — il n'y en a jamais. **Ce n'est donc PAS une action Paul :
    l'activer ne changerait rien aujourd'hui.** *Il redeviendra pertinent le
    jour où une connexion par mot de passe serait ajoutée — et ce jour-là,
    l'activer AVANT d'ouvrir la voie.*
  - 🔻 **LE CADRAGE SE TROMPAIT, et la vérification l'a dit avant le code.** Le
    tableau annonçait « les trois boutons du panneau de fiche, qui ne font
    encore rien ». **Ils fonctionnent tous les trois** depuis le 10/08 : ce sont
    les boutons de la **maquette** `design/preview-riven-3d.js` qui se
    contentaient d'un `signaler(...)`. *Sans ce contrôle, la boucle aurait
    ré-implanté trois gestes déjà livrés.*
  - 🔻 **Le vrai défaut était un CUL-DE-SAC, invisible en démo.** Mesuré en
    production le 12/08 : **5 fiches, 1 relation, 0 personne, 0 rattachement**.
    Avec zéro personne, `ouvrirFormRattachement` **refusait d'ouvrir** et
    jetait une erreur — le geste central du 10/08 était **inatteignable dans
    la base réelle de Paul**, alors qu'il était livré et testé. *La démo, qui
    livre 3 personnes, ne pouvait pas le voir.*
  - ✅ **Créer une personne DEPUIS la fiche** : le formulaire s'ouvre toujours ;
    un seul envoi crée la personne **et** son rattachement avec son rôle. Les
    existantes restent premières et sélectionnées par défaut — **créer est un
    choix conscient**, c'est la parade au doublon.
  - ✅ **Saisie en série** (fiches et personnes) : « Enregistrer et suivant »
    garde le formulaire, rend le curseur au nom, **conserve le contexte de la
    série** (type, statut, secteur, ville) et annonce le compte en
    `role="status"`. « Enregistrer » n'a pas changé de sens.
  - 🔻 **Défaut trouvé par le harnais, corrigé à la source** : « + Ajouter un
    contact » depuis le registre **basculait sur la Carte**
    (`ouvrirFormDepuisAccueil`) — annuler faisait donc **perdre sa liste**.
    On reste sur Contacts, comme le font déjà l'arbre et le ciel. Et
    `smoke-geocode` **s'appuyait sans le dire sur cette bascule** : sa
    navigation est désormais explicite.
  - ✅ **L'affichage n'a pas bougé d'un pixel** : `js/ciel.js`, `js/arbre.js`,
    `js/carte.js`, `api/**` = **zéro ligne de diff**. Critère écrit d'avance.
  - ✅ **Le ⏳ du 10/08 est FERMÉ** : le connecteur Supabase répond enfin, passe
    `get_advisors` faite. **Zéro alerte sécurité de schéma** — la RLS de
    `personnes` et `personne_noeuds` est propre.
  - ✅ **Aucune action Paul en attente.** Les deux ⏳ ouverts en cours de
    session ont été **fermés par ses réponses et par vérification** (voir les
    deux entrées en tête de cette session) : l'ingestion est abandonnée, le
    WARN mots de passe est sans objet.
  - ⏭ **Reporté, avec sa preuve** : `interet_qualitatif`, `effort_temps` et
    `effort_energie` existent en base depuis la migration **0003**, sont
    validés par l'API (`api/_lib/validate.js:221-241`) et **ne sont
    atteignables depuis aucune interface** — zéro occurrence dans le front,
    zéro dans les harnais. Le `type` d'une relation est en outre **gelé après
    création** par choix délibéré (`validate.js:47`). **C'est une boucle à soi
    seule.**
  - ⏭ **Reporté aussi** : la CSP dans `tests/lancer.sh` (la règle née le 11/08
    n'est appliquée qu'au harnais des maquettes ; **vérifié : aucune page
    produit ne porte de script en ligne**, donc le risque est une régression
    future, pas un défaut présent) ; et les index des deux clés étrangères de
    `personne_noeuds` (INFO advisors, tables à 0 ligne — la migration serait
    du bruit).

- 🕸️ **SESSION 2026-08-10 (RIVEN en détail), CLOSE.** PR **#151 fusionnée**
  (`1f85160`), migration **0024 APPLIQUÉE** au go de Paul, rien de non poussé.
  - ✅ **`personnes` et `personne_noeuds` existent en production**, RLS active
    sur les deux, 0 ligne — prêtes à recevoir. `network_nodes` conserve ses
    **5 fiches** : aucune donnée touchée par l'additif.
  - 🔻 **Le RADAR était périmé** : il notait « RIVEN vide, 0 fiche (30/07) ».
    Faux au 2026-08-10 — **5 fiches**. Paul a commencé à peupler entre les deux
    sessions. *Un constat d'état daté se re-vérifie avant d'être re-cité.*
  - ⏳ **Un seul contrôle manque** : la passe `get_advisors` (sécurité +
    performance) après application — appel **refusé faute d'autorisation du
    connecteur Supabase**. À rejouer dès l'autorisation donnée. **Action Paul.**
  - 🎯 **BOUCLE SUIVANTE, cadrée avec Paul le 2026-08-10 : peupler RIVEN, par
    les DEUX voies** (son arbitrage) — ① Léo **ingère** une source existante
    (contacts, Gmail, tableau, devis) et propose des fiches et des personnes
    pré-remplies que Paul valide ; ② Léo construit la **saisie en série**
    (enchaîner des fiches sans rouvrir le formulaire, rattacher une personne
    depuis sa propre fiche) pour ce qui n'est écrit nulle part. **Dépendance
    bloquante : demander à Paul QUELLE source il apporte — sans elle, ① n'existe
    pas.**

- 🌠 **LE CIEL EST EN PRODUCTION** (2026-08-11, « vasy implante »).
  `js/ciel.js` + `css/ciel.css` + `#espace-ciel` : la vue 3D est l'écran
  d'ARRIVÉE de RIVEN. **Zéro dépendance ajoutée** — la perspective est calculée,
  le rendu reste en SVG, chaque étoile demeure focusable et lisible.
  - ✅ **Rien n'est jeté** : l'Accueil de Léo, l'arbre et la carte gardent leurs
    onglets. *Vérifié avant d'agir : l'écran d'arrivée n'était pas l'Accueil
    mais l'arbre — sans ce contrôle j'aurais supprimé le tableau de bord de Léo.*
  - ✅ `tests/smoke-ciel.mjs` (**31 assertions**) branché au patrimoine, qui est
    vert de bout en bout : **53 harnais, 1310 assertions, sortie 0**.
  - 🔻 **Le défaut le plus grave trouvé par le harnais** : le tri de profondeur
    par `appendChild` **arrachait le focus clavier** à l'étoile sélectionnée —
    Entrée n'ouvrait plus aucune fiche. Le tri se suspend désormais tant qu'une
    étoile a le focus. *Le tri est cosmétique, le focus est fonctionnel.*
  - ⏭ **PROCHAINE BOUCLE** : le renseignement des contacts et la mise en
    relation — les trois boutons du panneau de fiche (« Rattacher une personne »,
    « Créer une relation », « Modifier la fiche ») et la saisie en série.

- 🌌 **SESSION 2026-08-11 (RIVEN au ciel + renommage), LIVRÉE.** PR #154.
  - ✅ **`traveler` → `riven` FAIT**, les trois couches : le fichier et ses liens
    (`git mv`), l'identifiant de quadrant des deux côtés (**vérifié : il n'est
    persisté nulle part**, donc aucune donnée à migrer) avec un **alias de
    transition** pour les onglets restés ouverts, et **deux redirections
    permanentes** dans `vercel.json` pour que le favori de Paul survive.
    Patrimoine COMPLET relancé **deux fois**, tous harnais verts, 1310 assertions.
  - 🔻 **Le cadrage du 10/08 se trompait sur un point** : l'interface DISAIT
    « Traveler » — « Terre ferme de Traveler » sur la carto ADRAMELECH. Corrigé
    à la source ET dans le fichier généré.
  - 🎯 **DÉCIDÉ par Paul : la vue 3D devient l'écran d'arrivée de RIVEN**
    (« la 3d devient accueil, tout me va »). Trois maquettes livrées et mesurées :
    `design/preview-riven-galaxie.html` (planche d'arbitrage),
    `preview-riven-voute.html` (l'écran à plat), `preview-riven-3d.{html,css,js}`
    (le ciel en volume, **zéro bibliothèque**, 60 i/s, cible tactile 25 px).
  - ⏭ **PROCHAINE BOUCLE : implanter la 3D dans `riven.html`.** La maquette est
    le contrat ; la vue à plat et l'arbre restent au bandeau. Puis le
    renseignement des contacts et la mise en relation (les trois boutons
    d'action du panneau de fiche, qui ne font encore rien).
  - 🔻 **RÈGLE NÉE DE CETTE SESSION** : *un harnais qui ne reproduit pas les
    en-têtes de production ne prouve rien sur la production.* Une preview
    déployée est restée **vide** chez Paul (CSP `script-src 'self'` contre un
    `<script>` en ligne) alors que trois passes locales étaient vertes. Les
    harnais servent désormais les pages sous la **CSP recopiée de
    `middleware.js`**, et chaque preview porte son `.js`.

- 🏷️ **PROCHAINE BOUCLE — `traveler` → `riven`, EN OUVERTURE DE SESSION.**
  Décidé par Paul le 2026-08-10 en clôture (« tu mets encore traveler mais c'est
  riven mtn »). Le quadrant est renommé RIVEN depuis le **2026-07-16** ; le
  **fichier** ne l'a jamais été, et il ressort dans chaque URL donnée à Paul.
  L'interface, elle, n'a jamais dit « Traveler » — c'est une dette de nommage,
  pas un bug d'affichage. **À faire AVANT le peuplement** : le nom doit être
  juste avant que Paul saisisse en volume et pose ses favoris.
  - **Trois couches, la troisième est le piège** : ① le fichier et ses liens
    (`traveler.html` → `riven.html` : 8 fichiers produit, `js/registre-lv3.mjs`
    `cible:`, ~20 harnais) ; ② l'**identifiant de quadrant** `'traveler'` dans
    `api/_lib/leo.js` (`OUTILS_PAR_QUADRANT`, les schémas de mains, `js/app.js`
    l. 321) — contrat front/back, il se change **des deux côtés à la fois** ;
    ③ **l'URL publique** : sans redirection permanente dans `vercel.json`, un
    favori ou une icône d'écran d'accueil de Paul tombe en **404**. C'est la
    seule couche qui casse quelque chose de vivant.
  - ⚠️ **Un renommage large est EXACTEMENT ce qui a laissé `smoke-quadrants`
    rouge le 2026-07-22** : patrimoine COMPLET obligatoire avant fusion, pas
    seulement les harnais des fichiers touchés.

- 🕸️ **SESSION 2026-08-10 (RIVEN en détail), LIVRÉE — une gate ouverte.**
  Cadrage complet : `CADRAGE-RIVEN-DETAIL.md` (format 6 points, pre-mortem à
  8 entrées). Patrimoine COMPLET vert à **2 068 assertions** (1 310 `✅` +
  758 `true`, dont **52 neuves**), rien de non poussé.
  - ✅ **La personne cesse d'être un nœud.** Tables `personnes` et
    `personne_noeuds` (personne × nœud × **rôle**) : 0 rattachement = une
    personne sans aucune fiche, N rattachements = la même personne sur N fiches
    avec un rôle sur chacune. Les deux demandes de Paul sont vraies pour la même
    raison — le lien ne vit ni sur la personne ni sur la fiche, mais entre.
  - ✅ **Onze champs de détail** sur `network_nodes`, en quatre axes : nature
    affinée, métiers multiples, capacités concrètes (prestations, zone, rayon,
    effectif, certifications), qualité de la relation (fiabilité, réactivité,
    prix, disponibilité). Repliés sous « Détail » : le flux court au pouce
    (nom + type + statut → Enregistrer) n'est **pas** allongé d'un champ.
  - ✅ **L'arbre n'a pas bougé d'un pixel** — `js/arbre.js` et `js/carte.js` :
    **zéro ligne de diff**, `smoke-arbre` et `smoke-secteur` verts **sans
    retouche**. C'était un critère écrit d'avance, pas un constat d'après-coup.
  - 🔁 **Trois ambiguïtés levées par question AVANT de coder** (leçon du
    2026-08-07 appliquée à la première occasion) : personne ≠ nœud / les quatre
    axes / le métier principal fait la branche.
  - ⏳ **GATE OUVERTE — migration `0024_riven_detail.sql` NON appliquée.**
    Tant qu'elle ne l'est pas, les personnes n'existent qu'en mode démo. C'est
    la **prochaine action** : go de Paul, puis application + advisors.
  - ⏭ **Reporté, sur décision de Paul lui-même** : les archipels et les arbres
    d'affichage différents (« pour l'instant ce n'est plutôt pas mal »).

- 🎯 **SESSION 2026-08-10 (ALTHEA — sa place et sa devise), CLOSE.** PR **#148
  et #149 fusionnées** (`305d574`, `712af96`), patrimoine COMPLET vert à
  **1 310 assertions**, rien de non poussé. **Le ⏳ de la session précédente est
  fermé, et il ne l'a pas été comme je l'avais prédit.**
  - ✅ **ALTHEA siège à la RACINE** — aux côtés d'ULTIMA et d'ALPHA, plus sous la
    supra-division. Nœud **déplacé, jamais dupliqué**. `chemin('althea')` vaut
    `['racine', 'althea']` : on entre dans le jeu **d'un seul geste**. Seul
    cap-feuille entre deux boussoles, et c'est voulu.
  - ✅ **La devise du Système** — *« I am the record of your struggles, the
    evidence of your resistance and the reward of your pain »*, en épigraphe,
    en `--spectre` (elle parle à la première personne : c'est ce qui est
    **annoncé**, jamais ce qui est **gagné**), avec `lang="en"`.
  - ❌ **Mon hypothèse était fausse.** J'avais écrit « c'est sûrement le cache
    navigateur ». Ce n'était pas le cache : **ALTHEA n'avait jamais été sur la
    racine.** Le nom *ULTIMA* désigne **deux étages** — le produit entier
    (*Ultima Lv3*, l'accueil) et la supra-division personnelle. « 3ᵉ cadran
    d'Ultima LV3 » visait le premier, j'ai rangé sous le second. Une journée
    d'écart entre ce que Paul cherchait et ce que j'avais construit, pour une
    ambiguïté levable en une question.
  - ⚠️ **Sept assertions sont tombées** au déplacement, dans quatre harnais —
    dont **trois listes écrites à la main sous un commentaire qui expliquait
    qu'il ne fallait pas en écrire**. Toutes rebranchées sur le registre.
  - ⏳ **Reste ouvert** : la **synchro Notion** (fiche « 📦 Repo Ultima- »), dont
    l'appel est refusé faute d'autorisation du connecteur — l'entrée est
    rédigée, elle n'a pas le droit de s'écrire. **Action Paul.**
  - 🎯 **PROCHAINE BOUCLE : B2 — le journal des quêtes.** Elle est **déjà cadrée
    au format 6 points** dans `CADRAGE-ALTHEA.md` **§16** (pre-mortem compris),
    à la demande de Paul le 2026-08-10. **Le gate d'entrée d'EL est donc levé :
    on n'ouvre pas une phase de cadrage, on lit §16 et on exécute** — après
    avoir vérifié auprès de Paul qu'il n'a pas changé d'avis sur le §16 ⑤ (ce
    qu'on ne fait pas). Premier geste technique : `list_tables`, pas la lecture
    de l'esquisse §8.2, **qui est périmée** (le schéma réel est `0022`+`0023`).

- 🎮 **SESSION 2026-08-06/07 (ALTHEA — le Système), CLOSE.** PR **#146
  fusionnée** dans `main` au go de Paul (`f5d8eb6`), patrimoine COMPLET vert à
  **1 302 assertions**, migrations **0022 + 0023 APPLIQUÉES** et seed joué, rien
  de non poussé. **Un quadrant neuf, de la dictée d'ouverture à la base peuplée,
  en une session.**
  - ✅ **ALTHEA existe** — 3ᵉ cadran d'ULTIMA Lv3 (« tout seul : c'est un autre
    système, c'est plutôt un jeu qu'autre chose »). Le suivi **ludique** du
    quotidien : un personnage (*Paul Gerard, niveau 48, Farsight*), cinq stats,
    cinq skills réels + un verrouillé, dix conditions, un relevé à une case par
    geste, et le cadran dans **sa propre vue en grand**.
  - ✅ **B0 — le cadrage a tenu son rôle : il a été CORRIGÉ quatre fois par les
    réponses de Paul, jamais par une relecture.** ① *« ce qu'il y a dedans »* a
    révélé les **deux étages** (le skill contient des conditions) ; ② *« pas de
    liens »* a rendu ALTHEA **autonome** et l'a rendu livrable seul ; ③ les
    **skills réels** ont fait apparaître l'**ÉNONCÉ**, les **CADENCES**,
    l'**ÉVOLUTION** et le **MÉTA-SKILL** — quatre mécaniques qu'aucune
    spéculation n'avait vues ; ④ *« les stats montent avec les niveaux »* a **tué
    une mécanique dont j'étais content** (le creux du charisme) et mis le
    **niveau** au centre du jeu. 🔻 *Le cadrage ne se valide pas, il se confronte
    au réel de Paul — et ce qu'on a trouvé de beau n'est pas un argument contre
    ce qu'il veut.*
  - ✅ **Cinq collisions écrites AVANT de construire**, aucune trouvée en codant :
    le mot (`talents` était pris par RESHIRAM → **skill**), l'objet (DRAUKHAIN
    est la volonté, ALTHEA la mesure), la forme (un cadran reste une feuille),
    **l'agent** (le Système n'est pas un second personnage : c'est **Léo en tenue
    de jeu**, deux registres de parole pour une seule voix), et le **périmètre**
    (test d'appartenance : *est-ce que ça se coche un soir ?*).
  - ✅ **La sévérité demandée, conçue sans punir le silence** : le **gel** ne se
    déclenche que sur des **engagements acceptés**, jamais sur un jour non
    renseigné ; il coupe le flux et suspend le titre, **il ne touche aucun
    acquis**, et se lève en un geste par quête.
  - 🔻 **LE DÉFAUT LE PLUS INSTRUCTIF DE LA SESSION — un test vert pour la
    mauvaise raison.** Le trigger de garde écrivait `pg_catalog.current_date` ;
    or `current_date` est un **mot-clé SQL**, pas une fonction qualifiable. Le
    trigger levait une erreur **à chaque insertion** : aucun relevé n'entrait.
    Et le test *« un jour futur est-il refusé ? »* **passait au vert** — parce
    que **tout** était refusé. Seul le test symétrique (*« et le jour courant,
    passe-t-il ? »*) l'a démasqué. → **RÈGLE : tout refus doit être éprouvé avec
    son CONTRE-EXEMPLE.** Un refus sans contre-exemple ne prouve pas qu'on a
    fermé la bonne porte, seulement qu'une porte est fermée. Correctif : `0023`.
  - 🔻 **Quatre autres défauts, tous trouvés par la MESURE, aucun par
    relecture** : une **sémantique non tranchée** (une cadence dont la fenêtre
    est vide vaut `null`, pas `false` — sinon l'élan retombe sur un silence) ·
    un **harnais vert sur une page morte** (mon stub de `window.supabase`
    écrasé par le vendor ; le motif de la maison — semer un jeton — l'exerce
    vraiment) · une **page rétractée à 292 px** par le `body` en flex, où le
    cadran tombait à **5,4 px de texte** · et un **repli `<noscript>` qui
    oubliait ALTHEA**, donc inatteignable sans JS.
  - 🔻 **Cinq harnais existants comptaient EN DUR** (« ULTIMA a 2 cadrans »,
    2 aiguilles, 2 blasons, 2 portes, le repli noscript) et tombaient tous à
    l'arrivée d'ALTHEA. **Réécrits pour se comparer au REGISTRE.** *Un test qui
    compte en dur se refait à chaque dictée ; un test qui compare à la source de
    vérité tient.* Enrichis, jamais affaiblis.
  - 🔻 **Mes trois harnais neufs n'étaient PAS branchés** dans `tests/lancer.sh`
    (liste explicite) : ils passaient au vert à la main et le patrimoine complet
    les **ignorait en silence**. *Un test qu'on oublie de brancher est un test
    qui n'existe pas.*
  - ⏳ **À la main de Paul, non résolu** : Paul ne voyait pas ALTHEA depuis la
    boussole ULTIMA au moment de clôturer. La cause n'est **pas identifiée** —
    le harnais prouve que la page rend bien ses trois caps, et le domaine de
    preview est hors de portée depuis l'environnement de Léo. À vérifier **sur
    la production**, avec un **rechargement forcé** (piste la plus probable :
    `js/registre-lv3.mjs` en cache navigateur). Si ça résiste, instrumenter la
    page plutôt que continuer à supposer.
  - **La suite est cadrée** : **B2 — le journal des quêtes** (les trois types,
    l'endormissement, le gel, la montée de niveau qu'une quête accomplie
    déclenche). Rien n'est à retoucher en base : le scellement `(owner_id, id)`
    des skills et des conditions attend déjà les FK composites de B2.

- 🔥 **SESSION 2026-08-04 (DRAUKHAIN — la voûte des serments), CLOSE.**
  PR **#141 fusionnée** dans `main` au go de Paul, patrimoine COMPLET vert à
  **1217 assertions**, rien de non poussé. Deux dictées, deux boucles bouclées.
  - ✅ **État des lieux CHIFFRÉ du cap, avant toute ligne de code** : 1 serment,
    0 flamme, 0 lien sortant, 1 lien entrant — et c'est ce chiffre qui donne le
    diagnostic. Le foyer, sa couronne, son halo croissant : **toute la grammaire
    était du code qui ne s'exprimait jamais**. 🔻 *Une forme se juge sur le
    volume RÉEL qu'elle porte, pas sur celui qu'elle anticipe.*
  - ✅ **La voûte livrée (forme A, choisie par Paul sur maquette comparative)** :
    les serments COEXISTENT enfin, les fils vers ZEKROM / VRANESH / MAEDRETHNIR se
    voient. Chaque vue a désormais UN travail — la voûte l'ensemble, le foyer un
    serment, le registre l'écriture ; la rangée de boutons disparaît (c'était la
    troisième liste des mêmes noms). « Sceller un serment » passe **derrière** la
    carte : miroir de « l'image d'abord » acté sur VRANESH.
  - ✅ **Migration `0020` APPLIQUÉE** (go explicite) : `flammes.survenu_le` — une
    flamme dit **quand** c'est arrivé, distinct de la date d'écriture. Validation
    en miroir exact du CHECK, preuve par l'ABSENCE aux deux bouts.
  - ✅ **La première flamme d'Ultima est écrite** : Paul a dicté sa victoire du
    2026-08-03, consignée sur « ne plus jamais perdre mon calme ». **Le cap
    compte 3 serments dont 1 vivant** — le premier depuis l'ouverture de
    DRAUKHAIN. *Comptes seuls dans les docs : le texte vit en base, derrière RLS.*
  - 🔻 **DEUX défauts trouvés par la MESURE, aucun par l'œil** : ① une étiquette
    débordait de 7 px sur des noms en capitales — le budget de signes *estimait*
    une largeur moyenne, il **mesure** désormais le texte tracé ; ② le correctif
    a alors **vidé toutes les étiquettes**, car la carte se dessinait dans un
    conteneur `hidden` où **`getBBox()` vaut zéro**. La page se montre avant
    d'être dessinée. *Une mesure prise dans un conteneur masqué n'est pas une
    mesure : c'est un zéro qui a l'air d'une mesure.*
  - 🔻 **Le harnais avait le trou correspondant** : « tout tient dans le cadre »
    et « aucun croisement » passaient **aussi** sur une carte aux étiquettes
    vides. Critère ajouté : **la carte NOMME ses serments**. *Vérifier qu'on n'a
    pas satisfait un critère en supprimant ce qu'il mesurait.*
  - 🔻 **Collision de deux sessions sur le même constat** : la PR **#140**, menée
    en parallèle, fermait la passerelle borgne côté serveur pendant que je la
    fermais côté front. **Sa mécanique a été adoptée, la mienne supprimée** — un
    appel réseau de moins. *Quand deux sessions résolvent le même constat, celle
    qui est déjà fusionnée gagne : on rebase dessus, on ne défend pas son code.
    Et avant d'ouvrir une boucle sur un cap, on regarde les PR ouvertes du cap.*
  - 🔻 **Le gate d'entrée EL a servi pour de bon** : la dictée d'ouverture ne
    nommait pas son outil (quatre candidats plausibles). Question posée au lieu
    de deviner → DRAUKHAIN. Sans le gate, toute la boucle partait sur le mauvais
    cap. *Une dictée qui ne nomme pas sa cible est un cadrage incomplet, pas une
    instruction à interpréter.*
  - ⏳ **Registre — à la main de Paul** : **cinq maquettes antérieures** de
    `design/` portent un `<script>` inline et s'ouvrent donc **muettes** sur la
    preview Vercel (CSP `script-src 'self'`). Une passe d'extraction les
    remettrait toutes en état — non traitée ici, discipline EB.

- 🌿 **SESSION 2026-08-04 (VRANESH — le futur advenu se choisit), EN COURS.**
  PR **#137 fusionnée** dans `main` au go de Paul, patrimoine COMPLET vert,
  rien de non poussé.
  - ✅ **Le dénouement rejoint la branche.** Constat de Paul : « je clique sur
    une branche, ça me donne le choix si je la sélectionne, si le futur est
    advenu. En l'état, ce n'est pas le cas. » Diagnostic : le geste **existait**
    (migration `0019` + `PATCH /api/situations`, livrés le 2026-08-01) mais ne
    vivait **que** dans le registre détaillé replié, sous forme de menu
    déroulant. **Une fonction qu'on ne rencontre pas là où on la cherche
    n'existe pas** — leçon à porter à toutes les livraisons futures : la
    livraison ne s'arrête pas au code qui marche, elle s'arrête au geste
    atteignable. Désormais : clic sur branche → « Cette branche a poussé »,
    deux temps, compte exact des branches coupées annoncé avant la coupe.
  - ✅ **Un thème dénoué s'ouvre sur son dénouement** : futur advenu déplié
    d'emblée, en grand, sceau sur l'arbre, plus de coupe proposée mais une
    réouverture. C'est le « méga affichage » demandé.
  - ✅ **L'arbre VRANESH est enfin MESURÉ** (la règle du 2026-08-01 le nommait
    déjà, elle n'y avait jamais été appliquée) : les étiquettes de gauche
    **sortaient du cadre** chez Paul. Repère élargi `240 → 300`, budget de
    signes calculé sur la place réelle de chaque côté, `getBBox()` comparée au
    `viewBox` **et pire cas construit** (6 futurs interminables). +45
    assertions sur `smoke-vranesh`. *Le défaut a été trouvé par une capture de
    vérification, pas par Paul : c'est la mesure qui doit précéder l'envoi.*
  - ✅ **L'IMAGE D'ABORD — formes tranchées par Paul et livrées (PR #138).**
    Étage ① **la rosace** : à l'arrivée, *juste* les noms des thèmes. Notice de
    la boussole supprimée, saisie repliée comme le registre, mission ramenée à
    une ligne, rose et caps agrandis — le premier écran est fait pour regarder,
    pas pour écrire. Étage ③ **la forme A** : une vignette par nature
    d'information (ce qui l'annonce · ce que j'ai prévu · ce que ça touche),
    icône gravée, et une vignette n'existe que si elle a quelque chose à dire.
    Le déroulé n'est plus écrit deux fois. **Le dépouillement est MESURÉ** :
    47 mots visibles à l'arrivée, aucun bloc de plus de 12 mots, aucun champ de
    saisie au premier écran — deux bornes, parce qu'un total bas peut cacher un
    pavé et l'inverse aussi.
  - 🎯 **PREUVE PAR L'USAGE RÉEL, la seule qui manquait.** Paul a exercé le
    dénouement **lui-même, sur ses propres données**, depuis la preview :
    session réelle, RLS réelle, coupe réelle et irréversible. Aucun harnais ne
    pouvait le prouver (`smoke-vranesh` le dit en tête de fichier depuis le
    début). Verdict de Paul : « c'est exactement ça ».
    ⚠️ **À retenir pour toute preview future** : une preview Vercel utilise les
    **mêmes clés Supabase que la production**. Ce qu'on y fait n'est pas un
    essai — c'est écrit dans les vraies données. À dire à Paul chaque fois
    qu'une preview porte un geste destructif.
  - ✅ **THORIOL EST UNE CONSTRUCTION — la greffe livrée (PR #142).** Dictée de
    Paul : « THORIOL n'est pas une direction comme LIANDRA, c'est une
    construction, il correspond à l'élément terre — l'idée c'est de toujours
    avoir des plans B, et surtout d'anticiper l'adaptation : comment faire
    pousser une nouvelle branche, même projet. » Trois formes en maquette
    (`design/preview-thoriol-terre`), **forme B tranchée**. **La forme suit
    désormais la nature du thème** : `direction` garde l'arbre, `construction`
    devient la greffe (le tronc enraciné, la branche qui porte, les moignons
    cicatrisés **avec leur cause**, et les greffes ligaturées — les plans B,
    prêts et pas encore employés, objet que l'arbre ne savait pas dire).
    ⚠️ **Point de sécurité** : le dénouement supprime les branches non retenues
    — sur une construction ce sont les **plans B**, donc il n'est offert nulle
    part, prouvé par deux assertions d'ABSENCE. Défaut vu **en capture**, pas en
    relecture.
  - ✅ **Migrations `0020` + `0021` APPLIQUÉES** (go de Paul), THORIOL basculé en
    `construction`. **`0021` corrige une faille de `0020` trouvée dans la
    minute** : `check (cause is null or etat = 'ecarte')` ne refusait RIEN quand
    `etat` était NULL (l'expression vaut NULL, et un CHECK ne rejette que sur
    FALSE). Trouvée par une **preuve par le refus** jouée en base juste après
    l'application — jamais par relecture. Les deux sens éprouvés ensuite, sans
    laisser une écriture.
  - ✅ **GATE ADVISORS FERMÉE** (ouverte depuis le 2026-08-01) : Security et
    Performance **sans aucune alerte** après `0019`, `0020` et `0021`. RLS
    vérifiée à la main par Paul : active sur `situations`, `scenarios` et
    `scenario_liens`, **4 policies chacune**.
  - ✅ **DRAUKHAIN — le retour de la passerelle (PR #140).** `scenario_liens` ne
    dormait pas (le cadrage du 2026-07-31 le croyait) : elle était **à sens
    unique**. Un serment montre désormais les futurs qui le *menacent* ou le
    *servent*, l'advenu en tête. Le constat ⑤ du fil DRAUKHAIN parallèle est
    donc **périmé et annoté** dans `CADRAGE-IMLADRIK.md`.
  - ⏳ **À la main de Paul** : ① **qualifier les 3 plans de THORIOL** (lequel
    porte, lequel attend, lequel a cassé et pourquoi) — sans cette donnée la
    greffe dessine trois branches en réserve et rien d'autre ; ② l'extraction du
    `<script>` des **5 maquettes antérieures** (registre du fil DRAUKHAIN) ;
    ③ déposer une première page sur `/ecrire.html` (MAEDRETHNIR, inchangé).
  - 🔶 **BOUCLE PRÉCÉDENTE, close par ce qui précède — l'image d'abord.** Dictée :
    « quand j'arrive sur VRANESH il faut m'afficher tout de suite LIANDRA et
    THORIOL […] réduire le texte au maximum, maximiser le visuel […] ensuite
    quand je sélectionne une branche, là je peux avoir du texte, mais il y en a
    trop, c'est du texte brut. » **Maquettes livrées, code non engagé**
    (`design/preview-vranesh-lecture.html`) : étage ① l'arrivée (A les deux
    portes · B la rose épurée · **C les arbres en miniature, reco**) ; étage ③
    la branche choisie (**A trois vignettes gravées, reco** · B le ruban du
    futur · C l'existant, 48 mots dont le déroulé écrit deux fois).
    **Formes choisies : ① la rosace, ③ la forme A.** Boucle refermée ci-dessus.

- 🔥 **SESSION 2026-08-01 (EL gravée + IMLADRIK rendu vivant), CLOSE.** Six
  livraisons fusionnées dans `main` (#126 → #135), patrimoine COMPLET vert à
  **1071 assertions**, rien de non poussé.
  - ✅ **La directive EL (Edouard Lebrun) est gravée** en tête de `CLAUDE.md`,
    à égalité avec EB et JL, et sa relecture devient le **point 0** du protocole
    de début de session. Léo a **explicité le format 6 points** que le principe
    3 invoquait sans le définir — sans lui, le gate d'entrée restait décoratif.
  - ✅ **VRANESH** : forme v1 refusée par Paul → **maquettes comparatives avant
    code**, forme 1 retenue. Grammaire actée et déjà réutilisée : **les noms
    d'abord → un clic déplie un seul item → le survol donne une ligne → le clic
    donne tout.** **L'advenu** livré (migration `0019` appliquée) : la branche
    qui a poussé est désignée, **les autres sont supprimées** — instruction de
    Paul maintenue après objection, donc suppression réelle, encadrée.
  - ✅ **DRAUKHAIN** : le **foyer** (forme A, champ lexical du feu), puis ses
    étiquettes **mesurées** au lieu d'être estimées (#135).
  - ✅ **MAEDRETHNIR** : boucle ① = diagnostic **sans une ligne de code** — le
    journal est vide **par distance**, pas par forme ni par contenu. Boucle ② =
    **`/ecrire.html`, la capture** (une seule chose à l'écran, pas de titre,
    brouillon local écrit **avant** tout appel réseau).
  - ✅ **Gate coût du 2026-07-19 (PR #60) FERMÉE** : `ANTHROPIC_API_KEY` posée
    en env Vercel par Paul. Preuve en prod : Léo répond, **ses yeux
    fonctionnent**, et **la §5 tient** — comptes et noms de caps, jamais de
    contenu. *Rappel gagné : une variable d'env Vercel n'agit qu'après un
    redéploiement.*
  - ⏳ **Actions à la main de Paul** : ① **déposer une première page sur
    `/ecrire.html`** — la boucle ③ de MAEDRETHNIR (la forme de **lecture**) ne se
    cadre **qu'après**, sinon on refait l'erreur de la boucle ① ; ② cadrage
    dicté de **NICOL BOLAS** ; ③ sur VRANESH, un 6ᵉ futur a été demandé alors
    qu'« Autre chose » occupait déjà la 5ᵉ place — garder ou remplacer ? ; ④ le
    registre du 2026-07-31 ci-dessous, toujours ouvert.
  - ⏳ **Toujours bloqués par une approbation d'outil non accordée** :
    **synchronisation de la fiche Notion** (texte de synchro rédigé, refusé à
    l'écriture — `memoire/JOURNAL-DECISIONS.md` reste la source de vérité) et
    **advisors Supabase** post-`0019` (contrôle RLS fait **à la main** : RLS
    active sur `situations` et `scenarios`, 4 politiques chacune, vues en
    `security_invoker`).

- ✅ **SESSION 2026-08-01 (dictée affichage Lv3), CLOSE.** Bandeaux
  « Supra-division Ultima / Alpha » (fini le « — le personnel / le
  professionnel ») et **ULTIMA naviguée en deux macro-quadrants cliquables**,
  tranché par Paul sur preview : **GRIMA — « Ce qui est utile »** (RIVEN,
  NICOL BOLAS, `grima.html`, l'ancre) et **NAGA — « Ce qui fait grandir »**
  (IMLADRIK, ADRAMELECH, TAO, `naga.html`, la pousse) — deux vraies boussoles,
  retours remontant quadrant → macro-quadrant → ULTIMA, cockpit recâblé.
  L'orthographe est **GRIMA** (confirmée par Paul). Patrimoine COMPLET vert,
  harnais recalés sur le nouvel arbre. Détail et itération (regroupement
  visuel → sous-boussoles) : `memoire/JOURNAL-DECISIONS.md` (entrée du jour).
  - ⏳ **À la main de Paul** : la légende sous le médaillon d'ULTIMA
    (« le personnel ») et celle d'ALPHA (« le professionnel ») sont
    conservées — les retirer ou les renommer ? Et les retours des feuilles
    ABAQUE / ARCHIPELS pointent toujours vers `ultima.html` (comportement
    antérieur, hors dictée) — les faire remonter vers leur quadrant ?

- 🎤 **SESSION 2026-07-31 (dictée pure — VRANESH peuplé), CLOSE.** Zéro code
  produit : Paul dicte, Léo reformule, met au propre et grave en base. VRANESH
  passe de **vide** à **2 situations réelles complètes** — **LIANDRA** (l'amour
  et le devoir, 5 scénarios) et **THORIOL** (les premiers pas dans
  l'entrepreneuriat, 3 scénarios ; dictée sous le nom FINUBAR puis renommée).
  PR **#125** fusionnée (lexique vocal seul), patrimoine COMPLET vert avant
  fusion, zéro migration, zéro touche auth/RLS.
  - 🔒 **Règle confirmée par l'usage, à ne plus redécider** : le contenu intime
    **ne touche jamais le repo**. Il vit en base sous RLS, écrit par les mains de
    Léo ; le repo n'en garde que **le nom** (lexique vocal). Corollaire pour
    toute session future : ne jamais chercher LIANDRA/THORIOL dans les fichiers.
  - ⏳ **Registre à la main de Paul** : sort du futur désiré de LIANDRA
    (préambule du contexte — choix actuel — ou scénario, ou serment DRAUKHAIN
    relié) ; pour THORIOL, confirmer « Julien », « d'ici janvier » (ou le 16) et
    « premiers **pas** » vs « premiers **profits** » dans l'intitulé.

- 🎯 **CADRAGE DE LA SUITE — posé le 2026-07-31 (« on cadre, on n'implémente
  pas »).** Les trois boucles du 2026-07-30 (①②③ ci-dessous) **restent valides
  et non engagées**. La dictée du jour en fait apparaître une **quatrième**, qui
  passe devant ① dans l'ordre recommandé parce qu'elle a la même nature que ce
  que Paul vient de faire (dicter du réel) et qu'elle ne coûte presque rien :

  - **⓪ VRANESH — de l'anticipation à la volonté (la passerelle qui dort).**
    **Pourquoi** : la table `scenario_liens` (migration `0018`, appliquée) permet
    de relier un scénario à un serment DRAUKHAIN — *ce qu'un futur menace ou
    sert*. Elle est **construite mais jamais utilisée** : 0 lien en base. Or
    LIANDRA appelle exactement ça — son futur désiré est une **volonté**
    (DRAUKHAIN), pas un futur subi (VRANESH), et l'arbitrage du 2026-07-31 l'a
    laissé en préambule faute de go. **Première action** : demander à Paul le
    sort de ce futur (registre ci-dessus) ; s'il choisit le serment, le créer
    dans DRAUKHAIN et poser le lien depuis les scénarios concernés. **Touche** :
    aucune ligne de code — API et front existent déjà. **Gate** : aucune
    (écriture de donnée, pas de DDL) ; §5 s'applique. **Effort** : une dictée.
    C'est la boucle qui **prouve la passerelle par l'usage** au lieu de la
    laisser théorique.

- 🗃️ **CAP DONNÉE — premier peuplement réel (session 2026-07-30, close).** Le cap
  « assez de code, il faut de la donnée » passe à l'acte sur **RESHIRAM**, qui
  était **vide en base**. ✅ **3 talents réels dictés par Paul et posés en prod**
  (PR #116 + #121 mergées) : ① « Toujours avoir un plan B », ② « Décortiquer
  précisément un problème », ③ « Toujours savoir quoi faire » — tous
  **transversaux**, `niveau='pratique'`. **Énoncé d'offre acté** : ce que Paul
  propose n'est PAS « résoudre les problèmes » (trop large) mais **« on fait appel
  à moi parce que j'ai toujours des solutions »** (un chapeau, pas un talent).
  Seed idempotent `supabase/seed-reshiram-paul.sql`. Zéro migration, zéro DDL.
  - ⚠️ **Les 3 talents sont « à étayer »** (0 preuve) → **« mon offre réelle » est
    VIDE**. C'est la règle cardinale qui joue son rôle, pas un défaut.
  - 🔎 **Goulot identifié (le constat de la session)** : sollicité pour une preuve,
    Paul répond par la **méthode**, pas par l'anecdote (« c'est un cas d'école »).
    Or sa parade — *avoir toujours un second artisan mobilisable* — est
    **chiffrable** : elle se compte en artisans par secteur, ce que produit déjà
    `talents_capital_reseau` (connexion RESHIRAM → RIVEN, `0013`). **Mais
    `network_nodes` est VIDE (0 fiche, vérifié en prod).** Toute la machinerie
    existe, la matière manque.
  - 📏 **État de la donnée en prod (2026-07-31)** : RESHIRAM 3 talents / 0 preuve ;
    ZEKROM 3 idéaux / 5 directions ; passerelles R↔Z **0** ; RIVEN **0** ;
    ADRAMELECH 4 idées ; **VRANESH 2 situations / 8 scénarios** (LIANDRA 5,
    THORIOL 3 — peuplé le 2026-07-31, aucune « à explorer »).
  - ⏭ **Reporté par Paul (décision explicite, fin de session)** : **peupler RIVEN**
    — reco de Léo comme boucle suivante (c'est lui qui débloque les preuves
    chiffrées, donc « mon offre réelle »). « On s'occupera de RIVEN plus tard. »
  - ⏳ **Registre à la main de Paul** (inchangé, reporté) : preuves des 3 talents ;
    confirmation du `niveau` (`maitrise` = cran que seul Paul monte) ; sort des 3
    talents seed du §7 non redictés ; frontière ① / ③ (tranchée par Léo :
    ① = AVANT/prévoyance, ③ = PENDANT/sang-froid) à confirmer.
- 🎯 **PROCHAINES BOUCLES — posées le 2026-07-30 pour la session suivante**
  (demandé par Paul : « implante-toi ces pistes pour la prochaine session »).
  Rien n'est engagé : ce sont trois boucles **prêtes à ouvrir**, cadrées, avec
  leur première action. Ordre recommandé **① → ② → ③** (valeur décroissante,
  effort croissant). Aucune ne demande de migration ni ne touche l'auth.

  - **① Les yeux de Léo sur les autres quadrants** *(reprise de l'acquis #120)*.
    **Pourquoi** : la forme `{ compteurs, listes }` est déjà générique et validée
    fail-closed côté serveur — il ne reste qu'un **branchement page par page**.
    C'est le meilleur rapport valeur/effort en réserve, et ça sert directement le
    cap DONNÉE (rendre le réel visible sans écrire une ligne de schéma).
    **Première action** : lire `CADRAGE-IMLADRIK.md §11` (la forme retenue), puis
    brancher **RIVEN** en premier (c'est là qu'il y a le plus de données réelles).
    **Touche** : `js/leo-accueil.js`, `api/_lib/leo.js` (`OUTILS_PAR_QUADRANT`),
    la page du quadrant. **Gate** : aucune — mais §5 (confidentialité) s'applique,
    et la règle de charte tient : **une règle de confidentialité se teste par
    l'ABSENCE** (le harnais cherche l'interdit dans ce qui part et exige de ne
    pas l'y trouver). **Effort** : une boucle par quadrant, courte.

  - **② NICOL BOLAS — le premier vrai outil financier.** **Pourquoi** : trois caps
    y sont déclarés « à venir » (REVENUS & CHARGES, IMPÔTS, ÉCHÉANCIER) et le
    quadrant ne vit que par l'ABAQUE, qui est un **simulateur**, pas le réel.
    Construire **REVENUS & CHARGES** fait entrer la donnée financière réelle —
    exactement la directive JL. **Première action** : un **cadrage dicté par
    Paul** (ce qui entre, ce qui sort, à quelle maille) — c'est lui qui manque,
    pas le code ; `CADRAGE-NICOL-BOLAS.md` existe déjà pour l'accueillir.
    **Touche** : nouvelle table + RLS (**gate migration**), une API `requireUser`,
    une page-feuille sous la boussole du quadrant. **Effort** : plusieurs boucles.

  - **③ RIVEN en boussole.** **Pourquoi** : c'est le seul quadrant resté une
    **feuille** (règle nœud/feuille §2.1 de `CADRAGE-LV3.md` : une boussole à un
    seul cap n'a pas de sens). Il le deviendra dès qu'un **deuxième cap** existe.
    **Première action** : décider **quel deuxième cap** — candidats : l'arbre des
    relations extrait de `traveler.html`, les chantiers, les secteurs. C'est un
    **choix produit de Paul**, pas une décision technique. **Touche** : une entrée
    dans `js/registre-lv3.mjs` + une coque de 40 lignes + l'extraction de la vue
    choisie. **Effort** : moyen, dominé par l'extraction.

  - **Rappel de méthode acquis en Lv3** : ajouter un projet, un quadrant ou un cap
    = **une entrée dans `js/registre-lv3.mjs`** (+ une coque de 40 lignes si c'est
    un nouveau nœud) ; les harnais **comparent le bandeau au registre**, donc une
    coque ne peut plus dériver en silence.

- 🏁 **CLÔTURE DE SESSION — 2026-07-30 (fil « cheminement + Léo dans IMLADRIK »).**
  Trois boucles ouvertes, **trois boucles fermées et fusionnées dans `main`** ;
  zéro travail non poussé, aucune gate laissée ouverte, aucune migration.
  - ✅ **#114 — la voie jalonnée** (forme A, décidée par Paul sur maquette
    comparée à 2 autres) : un serment = une voie, sur `draukhain.html`.
    Jamais de ligne d'arrivée. `css/voie.css` au vocabulaire neutre, réutilisable
    par VRANESH et MAEDRETHNIR. Détail : `CADRAGE-IMLADRIK.md §9`.
  - ✅ **#118 — les mains de Léo** : 5 outils du quadrant `imladrik` (elle
    propose, Paul confirme, l'app écrit) + le **micro** partagé, **extrait** de
    `js/app.js` vers `js/dictee.js`. Détail : `§10`.
  - ✅ **#120 — les yeux de Léo** : état borné du cap joint à chaque question
    (comptes + intitulés), validé fail-closed côté serveur, hors cache. §5 tenue
    et **prouvée par l'absence** au harnais. Détail : `§11`.
  - **Patrimoine** : 779 → **866 assertions**, vert à chaque fusion.
  - ⏭ **Reporté (non bloquant, prêt à brancher)** : les **yeux sur les autres
    quadrants** — la forme `{ compteurs, listes }` est générique, il ne reste
    qu'un branchement page par page (RIVEN, ADRAMELECH, NICOL BOLAS) ; rien à
    réécrire côté serveur.
  - ⏳ **Reste à la main de Paul (hérité, inchangé)** : advisors post-DDL à lire
    au dashboard Supabase ; preuve live d'écriture dans IMLADRIK.
  - 🔎 **Friction du jour, actée en charte** : `main` a bougé **4 fois** pendant
    la session (fil LV3 parallèle) — rebaser puis fusionner **sans délai**, et
    traiter un conflit de `JOURNAL-DECISIONS.md` en **concaténation**.

- 🧭 **CAP DU JOUR (recalé 2026-07-26 — deux fils réconciliés).** Cap stratégique
  tenu (07-25) : **passer du code à la DONNÉE** (« assez de code, il faut de la
  donnée », directive JL). Deux fils de travail ont avancé en parallèle ; les voici
  fusionnés au réel :
  - **IMLADRIK complet et tissé** (MAEDRETHNIR + DRAUKHAIN + VRANESH + passerelles
    v2 autour de Kalamn-talaen ; Léo guide) — **code livré**, ⏳ **non activé** tant
    que les migrations ne sont pas appliquées (voir registre).
  - **Cockpit v2 — modèle unifié A→B→C** (`CADRAGE-CONSOLE §2bis.1`). ✅ **Palier A
    LIVRÉ (07-26)** : badges « à traiter » au survol sur la **donnée DÉJÀ en base**
    (RIVEN relances dues / RESHIRAM à étayer / ZEKROM à orienter) — **aucun
    connecteur**, sert le cap DONNÉE en rendant le réel visible. **Le « cockpit en
    pause » (07-25) ne concerne QUE la couche connecteurs** = **palier C** (Gmail/
    Agenda, voie A « Léo pilote en direct » / voie B OAuth self-service). Palier C
    reste **EN PAUSE** (décision Paul « chantier technique »). Palier B (cap du jour
    déterministe) non ouvert.
  - **Léo voie A** (piloter Gmail/Agenda en direct à la demande) **fonctionne** —
    disponible « à la demande » (« go cockpit »), pas ré-ouvert en chantier.
  - **✅ IMLADRIK ACTIVÉ (2026-07-26, solo — cap DONNÉE « on commence par b »)** :
    migrations **`0015 → 0016 → 0017 → 0018`** **APPLIQUÉES en prod** (Drive sync +
    DRAUKHAIN + VRANESH + passerelles v2 ; toutes additives, vérifiées sans piège
    de contrainte pré-existante). Front + API IMLADRIK déjà en prod (#96→#106) →
    le quadrant est **vivant** (tables/vues/RLS créées). `0013`+`0014` déjà
    appliquées → **tout le schéma `0001-0018` est en prod.**
  - **⏳ Registre À LA MAIN DE PAUL** : (1) **advisors** post-DDL (0013 + 0015-0018,
    run MCP `get_advisors` bloqué en async → à lire au dashboard Supabase, onglets
    Security/Performance) ; (2) **preuve live** : se connecter, ouvrir IMLADRIK,
    écrire un serment/situation ; (3) synchro Notion. Détail :
    `memoire/JOURNAL-DECISIONS.md` (2026-07-25 / 2026-07-26).
  - **Décision qui reste à Paul** : cap de la suite — (a) continuer **cockpit palier
    B**, (b) revenir au **cap DONNÉE pur** (appliquer les migrations IMLADRIK + Léo
    voie A à la demande), (c) autre. Aucune des deux voies n'est bloquée par l'autre.

- ✅ **Le cheminement — la voie jalonnée LIVRÉE (2026-07-30)** : Paul a tranché
  — **forme A**, **IMLADRIK seul**, **un serment = une voie**. Implantée sur
  **DRAUKHAIN** (la page où les serments vivent déjà derrière auth ; la carto
  `imladrik.html` reste muette, §5 tenue) : `css/voie.css` (vocabulaire neutre
  `voie-*`/`borne-*`, réemployable par VRANESH et MAEDRETHNIR) + `js/draukhain.js`
  (4 fonctions pures : jalons, points, tracé, queue ; SVG `aria-hidden`, toute
  l'information dans la liste des bornes) + `draukhain.html` (une feuille de
  style). **Jamais de ligne d'arrivée** : l'horizon reste devant, la route sort
  de la carte, aucune barre de progression. Harnais : +13 assertions à
  `smoke-draukhain`, **patrimoine COMPLET vert (779)**. Zéro migration, zéro
  touche auth/API/données. Détail : `CADRAGE-IMLADRIK.md §9`.
  **✅ Boucle ④ enchaînée le même jour (go Paul « ok pour tout ») — DICTER DANS
  IMLADRIK** : 5 outils de quadrant `imladrik` dans les mains de Léo (page de
  journal, serment, flamme, situation, scénario), support `enum` au catalogue
  (rejet, jamais correction silencieuse), cartouche de Léo monté sur les 3
  pages du quadrant (comptes seuls, §5 tenue), et le composant de **dictée
  vocale extrait** de `js/app.js` vers **`js/dictee.js`** — le micro équipe
  désormais le champ « Parler à Léo » partout. Chaîne prouvée de bout en bout
  (micro → /api/leo → carte de confirmation → aucune écriture → confirmation →
  POST avec Bearer). **Patrimoine COMPLET vert (824)**. Détail :
  `CADRAGE-IMLADRIK.md §9-§10`.
  **✅ Boucle « lecture » enchaînée (go Paul « go lecture Léo ») — LES YEUX** :
  chaque page d'IMLADRIK joint à la question un **état borné** (comptes +
  intitulés) calculé sur les données déjà chargées ; `validerEtatQuadrant` le
  vérifie **fail-closed** côté serveur et `decrireEtat` le rend en bloc système
  déterministe, **hors cache** (le préfixe stable reste cacheable). §5 tenue :
  jamais un texte de flamme, un déroulé de scénario, un pourquoi/horizon ni un
  identifiant ; MAEDRETHNIR au régime le plus strict (comptes + date de la
  dernière page). `etat` absent → appel inchangé (les autres quadrants ne
  bougent pas). **Patrimoine COMPLET vert (866)**. Détail : `§11`.

- 🗄️ **Le cheminement — la maquette d'origine (dicté 2026-07-30)** :
  constat de Paul — les **gros pavés-quadrants ne sont pas gracieux** pour dire
  les projets en cours ; pour **IMLADRIK** (développement personnel) il faut une
  forme qui montre **une progression, un cheminement** (aller de l'avant,
  devenir meilleur). Livré : maquette statique
  `design/preview-imladrik-cheminement.html` — **3 formes** (A la voie jalonnée
  ★reco, B l'ascension, C les anneaux), **zéro code produit**, chiffres fictifs
  (§5 intime), patrimoine COMPLET vert (aucun harnais concerné). Cadre et
  décisions : `CADRAGE-IMLADRIK.md §9`. **Décisions prises le jour même**
  (voir la ligne ci-dessus) — la maquette reste le témoin des trois formes
  comparées, B et C n'étant pas jetées mais mises en réserve.
  **Constat joint (`CADRAGE-IMLADRIK.md §10`)** : **dicter dans IMLADRIK n'est
  pas possible aujourd'hui** — les mains de Léo ne couvrent que ADRAMELECH +
  RIVEN, le micro par champ n'est que sur RIVEN, et
  `OUTILS_PAR_QUADRANT.imladrik` est resté **vide** alors que les migrations
  `0016 → 0018` sont appliquées. Boucle à ouvrir (gate §5).

- 🧭 **Ultima Lv3 — LIVRÉ ET COMPLET (2026-07-30).** Cap dicté par Paul : deux
  **supra-divisions** — **ULTIMA** (les projets personnels, TAO inclus) et
  **ALPHA** (les projets professionnels : RENOBOOST IA + YCOME) — et **la
  boussole IMLADRIK comme forme unique de tout niveau de navigation**. Cadre
  complet : `CADRAGE-LV3.md`. Quatre boucles, quatre PR fusionnées :
  - ✅ **L1 (#113)** — le **noyau unique** `js/boussole-noyau.mjs` + le **registre
    de l'arbre** `js/registre-lv3.mjs` + le catalogue de gravures
    `js/blasons.mjs` ; `imladrik.html` rebranché dessus. **Iso-rendu prouvé** :
    `smoke-imladrik-carto` inchangé et vert. `js/imladrik-carto.js` supprimé.
  - ✅ **L2 (#115)** — la racine `/` ouvre sur les **2 supra-divisions** ;
    **`alpha.html`** créée ; `ultima.html` perd sa **grille 2×2** pour la
    boussole à 5 caps. `js/boussole.js` supprimé. Le badge cockpit du cap ULTIMA
    **cumule** ce que ses quadrants ont à traiter.
  - ✅ **L3 (#117)** — `tao.html` quitte l'arborescence ; la **passerelle devient
    un ARC** (une corde entre deux caps opposés disparaissait derrière le
    médaillon) avec « ⇄ rétroplanning » gravé dessus. `css/tao.css` supprimé.
  - ✅ **L4 (#119)** — `bcp.html` et `adramelech.html` en boussoles.
    **Arbitrage** : `adramelech.html` n'était pas une antichambre mais une page
    de travail → la vue registre a **déménagé telle quelle** sur
    **`registre.html`** et devient le cap **LE REGISTRE**. `js/antichambre.js`
    supprimé.
  - **Ce que ça change pour la suite** : ajouter un projet, un quadrant ou un cap
    = **une entrée dans `js/registre-lv3.mjs`** (+ une coque de 40 lignes si
    c'est un nouveau nœud). Les harnais **comparent le bandeau au registre** :
    une coque ne peut plus dériver en silence.
  - **⏳ À LA MAIN DE PAUL** : l'**URL d'YCOME** (« i comme moi-même ») — le cap
    existe, il est « à venir » ; une ligne dans le registre et il s'ouvre.
  - Front pur de bout en bout : aucune touche à l'auth, au middleware (hors
    commentaire), aux RLS, aux API, aux migrations ni aux données.

- 🧭 **Ultima LV2 — la boussole (cap dicté par Paul, 2026-07-21)** : une couche
  méta au-dessus de la console. L'accueil `/` devient une **boussole** (carte
  savante, rose des vents) dont chaque **cap = un macro-projet** ; la console à
  4 quadrants est reléguée en macro-projet « Ultima » (`ultima.html`). Registre
  **extensible** : ajouter un macro-projet = une entrée dans `js/boussole.js`
  (`MACRO_PROJETS`), les caps se redistribuent seuls. Survol/focus d'un cap →
  illumination + **résumé de Léo** dans un cartouche sous la rose (zéro
  surcharge : la donnée n'apparaît qu'à la demande).
  - ✅ **LV2-① Coque boussole (2026-07-21)** — livrée + vérifiée : `index.html`
    (boussole) + `ultima.html` (console relogée), `css/boussole.css`,
    `js/boussole.js`, retours « console » des sous-pages repointés vers
    `ultima.html`. Caps seedés : **Ultima** (ouvert → `/ultima`), **Renault
    Boost** et **Ikom** (« à venir », en attente d'URL). Harnais
    `smoke-boussole.mjs` (31 verts) + `smoke-console.mjs` reciblé vert.
    Aucune touche à l'auth/RLS/données. **Non gated.**
  - ✅ **Caps nommés + Renoboost branché (2026-07-21)** : « Renault Boost » →
    **Renoboost IA**, cap ouvert vers sa console **https://www.renoboostia.fr**
    (domaine propre du projet Vercel `renoboost-ia`, nouvel onglet) ; « Ikom » →
    **YCOME** (reste « à venir » — plateforme externe, URL à fournir par Paul).
  - ✅ **RESHIRAM & ZEKROM posés (2026-07-21)** : 2 caps autonomes ajoutés à la
    boussole — RESHIRAM (« le travail de la réalité », blason ancre) et ZEKROM
    (« la quête de l'idéal », blason flambeau), « à venir », reliés par une
    **passerelle pointillée** (champ `lien` du registre). Boussole = 5 caps ;
    harnais 40 verts. Cadre en `CADRAGE-CONSOLE.md §2bis`. Emblèmes changés
    2026-07-22 : RESHIRAM = **aile blanche**, ZEKROM = **aile noire** (miroir).
  - ✅ **RESHIRAM v1 construite (2026-07-22)** : hébergée DANS Ultima (décision
    Paul — même repo/Vercel/Supabase, page interne). Migration `0009` appliquée
    (`talents`/`preuves` + vues `talents_etat`/`talents_offre_reelle`, RLS).
    API `api/talents.js` + `api/preuves.js` (requireUser, owner_id jamais du
    client, validation miroir des CHECK, scellement cross-owner). Front
    `reshiram.html`/`js/reshiram.js` : carte des talents, badge « à étayer » +
    défi de Léo, bascule « mon offre réelle ». Cap boussole ouvert (interne).
    Harnais `unit-reshiram-validate` (27) + `smoke-reshiram` ; patrimoine vert.
    Cadre détaillé (v1+v2) : `CADRAGE-RESHIRAM-ZEKROM.md §7`.
  - ✅ **ZEKROM v1 LIVRÉE + EN PROD (2026-07-23, PR #83 mergée en solo)** : miroir
    de RESHIRAM, hébergée DANS Ultima (même repo/Vercel/Supabase, page interne
    `zekrom.html`). Migration **`0010` APPLIQUÉE en prod (solo)** (`ideaux`/
    `directions` + vues `ideaux_etat`/`ideaux_cap`, RLS miroir strict de 0009). API
    `api/ideaux.js` + `api/directions.js` (requireUser, owner_id jamais du client,
    validation miroir des CHECK, scellement cross-owner). Front `zekrom.html`/
    `js/zekrom.js` : carte des idéaux, badge « à orienter » (INVITATION, pas une
    dévaluation — règle cardinale inverse de RESHIRAM) + Léo qui inspire, bascule
    « mon cap directionnel ». Cap boussole ouvert (interne). **Seed exécuté (solo)** :
    les **3 rêves de Paul** en base (3 idéaux + 5 directions, owner Paul) — vérifiés
    via `ideaux_etat`. Harnais `unit-zekrom-validate` + `smoke-zekrom` (3 scénarios) ;
    patrimoine COMPLET vert. Contre-passe sécu CONFORME ; **advisors post-0010
    propres** (aucun warning RLS/security_definer sur ZEKROM ; les INFO
    `unindexed_fk`/`unused_index` sur `directions` = parité EXACTE de RESHIRAM,
    design accepté). **Doublet réel ↔ idéal complet et vivant.** Cadre : §8 de
    `CADRAGE-RESHIRAM-ZEKROM.md`. **Dette repérée (hors ZEKROM)** : `smoke-quadrants` était rouge depuis #75
    (ABAQUE a fait évoluer `bcp.html` sans resync du test) — resynchronisé ici
    (test-only) pour débloquer le runner partagé.
  - ✅ **IMLADRIK v1 « pouvoir écrire » (2026-07-23, PR #86)** : le journal intime
    en base, calqué RESHIRAM/ADRAMELECH. Migration `0012_imladrik_journal.sql`
    (`imladrik_entrees`, RLS par owner — **APPLIQUÉE en prod (2026-07-23, go Paul)**,
    renumérotée 0010→0012 après merge de ZEKROM 0010 / passerelle 0011). API
    `api/imladrik.js` (GET) + `api/imladrik/entrees.js` (POST/PATCH/DELETE),
    `validateEntreeImladrik` (miroir CHECK). Front `imladrik.html` (atelier
    d'écriture + journal, chrome quadrant) + `js/imladrik.js` : **fail-closed,
    pas de mode démo** (intime §5). Harnais `unit-imladrik-validate` +
    `smoke-imladrik` ; patrimoine COMPLET vert. **Boucle Drive suivante (GATÉE)** :
    Paul veut synchro DEUX SENS + l'app Ultima connectée → projet Google Cloud
    + secret Vercel (actions Paul) + contre-passe `securite-auditeur` avant code.
    Cadre : `CADRAGE-CONSOLE.md §3.4`.
  - ✅ **IMLADRIK B0 — cadrage de la cartographie boussole (2026-07-24, GO
    SOLO)** : dicté Paul — le quadrant devient une **carto en mode boussole**
    (modèle boussole LV2, registre dév. perso) : le journal renommé
    **MAEDRETHNIR**, deux nouveaux caps **VRANESH** (les futurs potentiels —
    anticiper « dans un cas donné ») et **DRAUKHAIN** (la volonté au-delà du
    possible — objectifs, foi, rappels sans jugement), au centre la boussole
    **KALAMN-TALAEN** (épée + dragon) = **le guide, l'agent d'IMLADRIK**
    (successeur nommé de l'« agent-devperso » §7 console ; sous-agent de Léo,
    principe verrouillé respecté). Livré : `CADRAGE-IMLADRIK.md` (vision,
    articulation avec l'acquis — renommage front seul, zéro migration —
    séquencement B1→B3) + **prototype statique**
    `design/preview-imladrik-boussole.html` — **zéro code produit**, harnais
    non concernés. **⏳ Décisions Paul (§8 du cadrage)** : ① noms figés tels
    quels ; ② sigle console « épée au soleil » conservé (boussole épée+dragon
    interne au quadrant, reco oui) ; ③ ordre DRAUKHAIN avant VRANESH (reco
    oui) ; ④ go B1 (implémentation carto).
  - ✅ **IMLADRIK B1 — la cartographie en prod (2026-07-24, GO SOLO, « ok pour
    tes recos, go b1 »)** : `imladrik.html` devient la **boussole Kalamn-talaen**
    (3 caps — MAEDRETHNIR ouvert, VRANESH + DRAUKHAIN à venir — autour du médaillon
    épée + dragon, légende gravée « Kalamn-talaen ») ; le journal migre vers
    **`maedrethnir.html`**. **Renommage front seul** : `js/imladrik.js`, API
    `/api/imladrik*`, migrations `0012`/`0014`, RLS et harnais **inchangés** —
    zéro migration, zéro touche à l'auth/données. Réutilise `css/boussole.css`
    (langage caps/aiguilles/parole) ; nouveaux `js/imladrik-carto.js` (clone du
    cœur de `boussole.js`, sans cockpit — carto muette §5) + `css/imladrik-carto.css`
    (sceau + légende). Console : IMLADRIK « En chantier » → « Accéder ». Harnais :
    `smoke-imladrik` reciblé sur MAEDRETHNIR, **`smoke-imladrik-carto` créé**,
    `smoke-console` mis à jour ; **patrimoine COMPLET (21 harnais) vert**. Recos
    Paul validées (sigle épée au soleil conservé, DRAUKHAIN→VRANESH). **Prochaine
    boucle : B2 — DRAUKHAIN v1.**
  - 🔶 **IMLADRIK B2 — DRAUKHAIN v1 (2026-07-25, GO SOLO « ok go »)** : la volonté
    au-delà du possible, **miroir strict de ZEKROM**. Modèle **serments** (le quoi
    + le pourquoi profond + l'horizon) → **flammes** (rappels de foi :
    citation/victoire/rappel). Serment sans flamme = **« à raviver »** = invitation
    positive (jamais un reproche — « des rappels, pas du jugement »). Migration
    `0016_draukhain_serments.sql` (2 tables + vues `serments_etat`/`serments_vivants`,
    RLS + scellement AD-4, miroir 0010) **ÉCRITE, NON APPLIQUÉE — gate §5 intime
    (go Paul requis)**. API `api/serments.js` + `api/flammes.js` (requireUser,
    owner_id serveur-only, validation miroir CHECK). Front `draukhain.html` +
    `js/draukhain.js` (fail-closed, textContent only, badge « à raviver » en
    invitation, bascule « serments vivants ») — cap DRAUKHAIN ouvert dans la carto
    Kalamn-talaen. Front délégué à `front-carto` (miroir ZEKROM), **contre-passe
    sécu Léo OK** (zéro innerHTML de données, Bearer lectures+écritures,
    fail-closed 401→auth). Harnais `unit-draukhain-validate` + `smoke-draukhain` ;
    **patrimoine COMPLET (22 harnais) vert**. **⏳ Action humaine Paul (bloquant
    fonctionnel) : appliquer la migration `0016` en prod + go** (jusque-là,
    DRAUKHAIN est fail-closed : la page s'ouvre, l'API répond « erreur interne »
    tant que les tables n'existent pas). **Prochaine boucle : B3 — VRANESH v1.**
  - 🔶 **IMLADRIK B3 — VRANESH v1 (2026-07-25, GO SOLO « ensuite on avance »)** :
    les futurs potentiels, **miroir strict de DRAUKHAIN**. Modèle **situations**
    (« un cas donné » + contexte) → **scénarios** (déroulé + vraisemblance
    faible/moyenne/forte + signaux avant-coureurs + parade préparée). Situation
    sans scénario = **« à explorer »** = invitation (anticiper, puis revenir au
    présent). Migration `0017_vranesh_situations.sql` (2 tables + vues
    `situations_etat`/`situations_anticipees`, RLS + AD-4, miroir 0016) **ÉCRITE,
    NON APPLIQUÉE — gate §5 intime (go Paul)**. API `api/situations.js` +
    `api/scenarios.js` ; front `vranesh.html` + `js/vranesh.js` (délégué
    `front-carto`, contre-passe sécu Léo). Cap VRANESH ouvert → **le quadrant
    IMLADRIK est COMPLET (3 caps ouverts autour de Kalamn-talaen ; Léo guide)**.
    Harnais `unit-vranesh-validate` + `smoke-vranesh`. **⏳ Action Paul :
    appliquer `0017` en prod + go.**
  - 🔶 **IMLADRIK B4 — Passerelles v2 (2026-07-25, GO SOLO)** : la mémoire
    inter-cap. Deux tables de liens à **cible XOR** + double scellement AD-4
    (miroir 0011) : **`serment_liens`** (serment → idéal ZEKROM / page MAEDRETHNIR)
    et **`scenario_liens`** (scénario → serment DRAUKHAIN [rapport menace/sert] /
    page MAEDRETHNIR). Migration `0018_imladrik_passerelles.sql` (+ ancrages
    composites sur `imladrik_entrees`/`scenarios`) **ÉCRITE, NON APPLIQUÉE — gate
    §5, dépend de 0016+0017**. API `serment-liens`/`scenario-liens` ; liens
    repliés dans les GET (dégradation propre à `[]`). Front « Passerelles » sur
    draukhain/vranesh (2 agents front-carto, contre-passe sécu Léo). Harnais
    `unit-imladrik-passerelles` + smoke étendus. **⏳ Action Paul : appliquer
    `0016 → 0017 → 0018` en prod + go.** **Le quadrant IMLADRIK est complet et
    tissé (mémoire inter-cap).**
  - 🔶 **LV2-② Auth — Google OAuth (2026-07-22)** : bouton « Se connecter
    avec Google » ajouté À CÔTÉ du lien magique (décision Paul : Google en
    plus, pas à la place). Code livré + vérifié : `js/app.js`
    (`seConnecterGoogle` → `signInWithOAuth({provider:'google'})`),
    `traveler.html` (bouton + séparateur « ou »), `css/styles.css` (registre
    antique, contraste 12,5:1), harnais `smoke-connexion.mjs` enrichi (31
    verts, dont visibilité/clic/contraste Google). Navigation top-level →
    aucune retouche CSP. **⏳ Action humaine Paul (bloquant fonctionnel)** :
    (1) créer des identifiants OAuth dans Google Cloud Console (écran de
    consentement en mode **Test**, adresse de Paul seul « test user » = verrou
    mono-utilisateur, zéro code) ; (2) activer le provider Google dans Supabase
    → Auth → Providers avec Client ID/Secret ; (3) déclarer les URLs de
    redirection (URL de prod + `.../auth/v1/callback`). Sans (2), le bouton
    renvoie « provider not enabled ». Secrets → jamais committés. **✅ Config
    Paul faite (2026-07-22), testée sur preview.**
  - ✅ **LV2-② Auth à l'accueil — porte unique (2026-07-22)** : constat Paul —
    Google (et le lien magique) renvoient sur `origin` = la boussole, qui
    n'avait AUCUN consommateur → jeton bloqué dans l'URL, session jamais
    établie. Corrigé : `index.html` charge désormais `js/config.js` +
    supabase + `js/boussole-auth.js` (module autonome calqué sur `app.js`).
    L'accueil est la **porte de connexion unique et verrouillée** (décision
    Paul) : overlay réutilisé de `traveler.html` (Google + lien magique),
    boussole cachée/inerte tant que non connecté ; le retour OAuth est consommé
    là (`detectSessionInUrl`) et l'URL nettoyée ; session partagée à tous les
    quadrants via `localStorage`. Répare aussi le lien magique (même bug).
    Aucune retouche CSP/RLS/migration/secret. Harnais `smoke-boussole.mjs`
    enrichi (stub Supabase + section verrou déconnecté/connecté) — tout vert,
    `smoke-connexion.mjs` non régressé.
  - 🗺️ **RESTE LV2 — feuille de route (cadrée 2026-07-22, ordonnée par
    dépendances, une boucle à la fois)** :

    **① ✅ Débloqueur levé — LV2-② Auth finalisée (2026-07-22) :** config
    Google Cloud + provider Supabase faite par Paul, ET connexion terminée à
    l'accueil (porte unique verrouillée). Le **verrou d'usage** est levé :
    connecté, RESHIRAM et tout ce qui vit derrière auth sont accessibles.

    **② ✅ ZEKROM v1 construite (2026-07-23)** : mini-cadrage (§8 R/Z) + modèle de
    données (migration `0010` **APPLIQUÉE en prod, solo**) + console interne
    `zekrom.html` (aile noire, cap ouvert) + **seed des 3 rêves de Paul exécuté
    (solo)**. Le doublet réel ↔ idéal est complet et vivant. PR #83 mergée.

    **③ ✅ Passerelle de données R↔Z v1 construite (2026-07-23, solo)** : table
    de liaison `passerelles` (idéal ↔ talent, nature `acquis`/`a_construire`,
    note) — migration `0011` **APPLIQUÉE en prod (solo, advisors propres)** + vue `ideaux_retroplanning`, RLS **double scellement
    AD-4** (miroir 0009/0010). API `api/passerelles.js` (GET/POST/PATCH/DELETE,
    owner_id serveur-only, FK figées en update). Front : panneau **rétroplanning
    par idéal** sur `zekrom.html` (« ce que j'ai déjà / ce qui me manque », relier
    un talent réel + nature, détacher). Harnais `unit-zekrom-validate` +
    `smoke-zekrom` enrichis. **Manuel en v1** (Paul crée/valide les liens).
    Le **chiffrage du coût reste délégué à NICOL BOLAS** (hors v1 ; la note amorce
    le besoin en mots). Cadre : §9 de `CADRAGE-RESHIRAM-ZEKROM.md`. **Le doublet
    réel ↔ idéal devient AGISSANT.** v2 différé : miroir côté RESHIRAM,
    auto-suggestion, chiffrage.

    **④ ✅ Connexions RESHIRAM→RIVEN construites (2026-07-24, PR #93 draft)** :
    `talent_refs_reseau` (référence LECTURE SEULE vers les fiches RIVEN, jamais
    de copie ; double scellement AD-4) + vue `talents_capital_reseau` (par talent :
    nb de contacts mobilisables + secteurs couverts). Migration `0013`, API
    `api/talent-refs.js` (owner_id serveur-only, projection RIVEN minimale — zéro
    PII de contact), `validateTalentRef`. Front `js/reshiram.js` : panneau
    « capital réseau » par talent (relier une fiche, compteur chiffré par secteur,
    détacher ; fail-closed, dégrade en « indisponible » sans casser la carte).
    Le talent qualitatif devient **preuve chiffrée**. Harnais `unit-reshiram-reseau`
    (12) + `smoke-reshiram` enrichi ; contre-passe COMPLÈTE verte (exit 0). Sens
    UNIQUE : RESHIRAM lit RIVEN, n'y écrit jamais. Cadre : §v2 R/Z.
    **✅ Fermée en solo (2026-07-24)** : **PR #93 FUSIONNÉE** (squash) dans `main` ;
    **migration `0013` APPLIQUÉE en prod (solo)**. Correctif à l'application : le
    `§0` (création de `network_nodes_owner_id_uniq`) était fautif — l'index unique
    existe DÉJÀ depuis 0008 (intendant), qui s'en sert comme cible de FK ; Postgres
    accepte un index unique comme cible (prouvé par 0008). 0013 réappliquée SANS le
    §0, et le fichier de migration corrigé en conséquence (rejouable à neuf).
    ⏳ **Reste (registre)** : contre-passe advisors `securite-auditeur` (Paul a
    décliné le run advisors cette session) ; à repasser à la prochaine occasion.

    **⑤ ✅ LV2-⑤ Cockpit — résumés vivants v1 construits (2026-07-23, solo)** :
    endpoint `api/cockpit.js` (agrégats derrière auth, **que des comptes, zéro
    PII** — §5 CADRAGE-CONSOLE) ; la boussole, une fois connectée, remplace le
    texte figé des caps data (RESHIRAM/ZEKROM) par le **vrai « en cours »** au
    survol (« N talents, M à étayer » ; « N idéaux, M à orienter, K reliés »).
    `js/boussole.js` (fetch + `ligneVivante` pure + injection), `boussole-auth.js`
    (livre la session au cockpit), ordre des scripts corrigé (hook défini avant
    sollicitation), CSS `.parole-cockpit`. Fail-closed (sans session → texte figé).
    Harnais `smoke-boussole` enrichi (Bearer, résumés vivants R/Z, cap sans data,
    fonction pure). **La boussole devient un cockpit** (pas un menu).
    **🗺️ Cockpit v2 CADRÉ (2026-07-24, `CADRAGE-CONSOLE §2bis.1`)** : décisions
    Paul = **badges discrets au survol** (pas de bandeau), séquencement **A→B→C**
    une boucle à la fois. **Palier A** (buildable, aucune gate) = signaux sur
    données déjà en base : RIVEN « N relances dues » (journal `relance_at` ≤ jour
    & non faite) + RESHIRAM « à étayer » / ZEKROM « à orienter » promus en badges.
    B = cap du jour (déterministe, après A). C GATÉ : signaux finance (NICOL
    BOLAS), capture-dispatch (clé Anthropic), RDV/email (connecteurs).
    **✅ Palier A LIVRÉ (2026-07-24, solo, PR #107)** : `api/cockpit.js`
    (+`riven.relances_dues`), `js/boussole.js` (`signalDe()` pur + badge
    `.parole-signal` au survol), CSS, `smoke-boussole` enrichi. Harnais COMPLET
    vert. Prochaine boucle candidate : palier B (cap du jour déterministe).

    **Autres caps :**
    - **YCOME** — dès que Paul fournit l'URL (action humaine, 1 ligne dans le
      registre `MACRO_PROJETS`).
    - **NICOL BOLAS (finance, ex-BALTHAZAR GELD, `CADRAGE-CONSOLE.md §3.2`)** :
      quadrant financier — pilote fiscal/tréso qui **alimente les KPIs du
      cockpit** (⑤). Grande boucle à part (son propre mini-cadrage), à
      ordonnancer avec Paul.

    **Gates du reste** : migrations `0010`+ (application = Paul), fusions PR,
    finalisation OAuth (Paul). **Aucune ressource facturée** (tout dans Ultima —
    décision hébergement 2026-07-22).

- ✅ **P0 Fondations** — livrée, vérifiée en navigateur, fusionnée dans `main`
  via PR #1 (7 commits atomiques : cadrage, migration RLS, API, middleware,
  front, docs).
- ✅ **Gate Supabase** — fermée le 2026-07-06 sur go Paul. Pas de création :
  réutilisation du projet existant `ultima` (ref `leosfqyidgsaescjbfom`,
  eu-west-3), ex-« tantot » ; ses 3 tables héritées (`personnes`,
  `rapprochements`, `journal`), vérifiées vides (0 lignes), purgées par
  migration `drop_legacy_tantot_tables`. Migration `0001` appliquée
  (`init_network_schema_rls`). Advisors passés — entrées pour P1 :
  - sécu WARN : `search_path` mutable sur `public.set_updated_at` (lint 0011) ;
  - perf WARN ×8 : policies RLS — remplacer `auth.uid()` par
    `(select auth.uid())` (lint 0003, initplan) ;
  - perf INFO : index inutilisés (base neuve, non actionnable) + stratégie
    connexions Auth en absolu (à revoir si montée en charge).
- ✅ **P1 Audit** — `AUDIT-2026-07-06.md` généré (S1-S6 / U1-U5, advisors
  intégrés). Voir son BILAN : tableau de bord unique.
- ✅ **P2 Sécu** — S1-S6 tous fermés (commits atomiques, migrations 0002/0003
  appliquées, advisors security = 0 lint).
- ✅ **P3 UX (audit)** — U1-U4 fermés (migration 0004 appliquée, smoke
  navigateur vert) ; U5 ⏭ arbitrage Paul. Les évolutions produit (géocodage,
  recherche, clustering…) restent dans ROADMAP-SITE.
- ⏳ **Actions humaines en attente** (mode solo — consignées, non bloquantes) :
  1. ✅ **ARBITRAGE RENDU (2026-07-06)** : « on continue la carte réseau tout
     en liant les fonctionnalités au pivot v2 » → **hybride v1×v2** livré
     (migration 0005 : relations pilotables + journal/relances). La branche
     du pivot intégral reste archivée (`claude/session-protocol-start-opwcmp`).
  2. ✅ **FAIT (2026-07-07)** — Vercel : projet `ultima` créé par import Git
     (équipe paggerard-boops-projects), déploiements actifs — le bot Vercel
     commente les PR avec des previews « Ready ». Les previews de branche
     sont protégées par l'authentification Vercel (bien). Restent à
     vérifier depuis un navigateur de Paul : l'URL de production, et le
     header `Permissions-Policy: … microphone=(self) …` (U6) — l'accès
     sortant vers vercel.app est bloqué par la politique réseau de
     l'environnement de Léo. Nota : le connecteur Vercel de Léo ne voit pas
     encore le projet `ultima` (périmètre d'autorisation à rafraîchir si on
     veut que Léo lise logs/déploiements).
  3. Supabase Auth (dashboard) : inviter le compte de Paul (0 utilisateur en
     base), désactiver « Allow new signups » (complément serveur du
     `shouldCreateUser: false`), configurer Site URL + Redirect URLs sur le
     domaine Vercel.
  4. ✅ U5 résolu par la règle v2 (0005) : une seule relation ACTIVE par paire
     et par type ; les relations closes restent en historique.
  5. Advisor INFO : stratégie de connexions Auth en pourcentage (dashboard,
     utile seulement en montée d'instance).
- ✅ **Hybride v1×v2 (2026-07-06, arbitrage Paul)** : relations = rapprochements
  pilotables (cycle de vie, arrêt justifié, paire active unique) + journal
  « où j'en suis » avec relances (nœud XOR relation). Migration 0005 appliquée,
  API PATCH edges + endpoint journal, fiche enrichie, traits modulés par
  statut. Vérifié en navigateur (flux complets), advisors security = 0 lint.
- ✅ **Boucle v3-① Accueil (2026-07-06)** : Accueil « Bienvenue, Paul » en
  carte de livre d'enfance (specs graphisme + UX par agents, arbitrages
  consignés), relances dues actionnables, pilotage, suggestions R1-R4,
  onglets. Vérifié 2 fois (43 verdicts front-carto + contre-passe Léo,
  non-régression incluse).
- ✅ **Boucle v3-② Contacts (2026-07-06, solo)** : liste + recherche +
  saisie progressive, 4 harnais verts (contre-passe Léo incluse). Incident
  consigné : première fusion vide (commit sur main local), détecté aux stats
  de merge, récupéré au reflog — leçon au RADAR.
- 🟡 **Boucle v3-③ déploiement** : repo prêt (repli publiable PR #13, zéro
  build, zéro env) — reste UNE action Paul : importer le repo sur
  vercel.com/new (registre n°2), puis dashboard Supabase Auth (registre n°3)
  avec l'URL obtenue.
- ✅ **Boucle v3-④ dictée vocale (2026-07-07)** : fusionnée dans `main`
  (PR #16, go Paul). Micro sur les 4 champs de texte libre, harnais
  smoke-dictee 17 verdicts, contre-passe GO (28 indépendants). Inclut U6
  (`microphone=(self)` au middleware). Backlog : U7, U8 (AUDIT).
- 🟡 **Boucle v3-⑤ géocodage (2026-07-07)** : livrée et vérifiée — bouton
  « Trouver sur la carte » (fiche nœud), endpoint `/api/geocode` (Nominatim
  fr, garde 1 req/s, timeout 5 s, réponse projetée, q jamais loggé),
  suggestions ≤3, aperçu carte, lat/lng repliés « avancé » [U10+U11].
  Harnais unit-geocode (18) + smoke-geocode (16) ; contre-passe GO
  (52 verdicts indépendants, injection HTML testée). Commits `b3eb9d2` +
  `bfd5570`. **PR en attente du go de fusion de Paul.** Vivier : U12
  (clic-carte), U13 (dictée adresse) — AUDIT.
- ⏳ **Actions humaines ajoutées (v3-⑤)** :
  6. Env Vercel `GEOCODE_USER_AGENT` (User-Agent Nominatim dédié ; le repli
     committé, publiable, expose l'email de contact de Paul vers Nominatim).
  7. Décision gated : durcir l'auth de `/api/geocode` (et des autres
     endpoints, même motif) par vérification réelle du jeton
     (`auth.getUser()`) — recommandation spec data v3-⑤.
  8. Après mise en ligne : confirmer l'usage réel Nominatim (l'amont n'a été
     exercé qu'en stub ; URL/User-Agent conformes à la politique OSM).
- ✅ **Boucle v3-⑥ recherche & zoom (2026-07-07)** : fusionnée dans `main`
  (PR #18, go Paul). U14-U17 fermés, U18 au vivier (→ R2). 8/8 harnais +
  contre-passe GO. **Le cap v3 ①-⑥ est terminé.**
- ✅ **Boucle R1 — habillage antique (2026-07-07)** : fusionnée dans `main`
  (PR #20, go anticipé de Paul consigné le 2026-07-07). Implémentation
  intégrale de `design/spec-r1-graphisme.md` : sépia 2 régimes par paliers
  de zoom (classes exclusives sur `#carte`), voile Ptolémée `L.svgOverlay`
  (pane 300, 100 % inline), cadre parchemin muet (z 640), cartouche ULTIMA,
  cernes encre #5a4118 + fillOpacity 1, arrivée au boot sur la Carte
  (Accueil v3-① par onglet). Harnais patrimoine `smoke-antique.mjs`
  (22 verdicts, contraste mesuré sur capture : 14,68:1 z6, 4,05:1 z13) ;
  9/9 harnais verts (161 verdicts) ; contre-passe GO (adversariale :
  rafales de zoom, angle sous coin, tuile factice couleurs OSM → « Lyon »
  8,25:1 z9 / 6,51:1 z6 sous voile). Vivier → R4 : table z-index du §2 de
  la spec fausse (transform du map-pane : tooltips/popups passeraient sous
  le vignettage en bord — sans impact actuel, aucun popup dans l'app),
  trait sous-traitance 2,06:1 à recaler, rose des vents, anneau crème
  décoratif. À prouver après déploiement : RA1/RA2 sur vraies tuiles OSM
  (proxy de l'env bloque tile.openstreetmap.org). **Prochaine boucle : R2
  — volet « Aujourd'hui »** (REFONTE-ACCUEIL.md §4, U18 au vivier).
- ✅ **Refonte Accueil — cadrage acté (2026-07-07)** : vision dictée par
  Paul (carte de France antique = entrée d'Ultima). Direction visuelle B
  « Age of Mythology » choisie sur previews ; **auth invisible** actée
  (session persistante — la suppression de connexion est refusée, sécurité).
  Cadrage complet : `REFONTE-ACCUEIL.md` (4 boucles R1-R4, risques RA1-RA5) ;
  référence visuelle : `design/preview-accueil-mythologie.html`. Prochaine
  boucle après v3-⑥ : **R1 habillage antique**.
- ✅ **Pivot Entrée + Arbre — cadrage fusionné (2026-07-08, go merge Paul)** :
  dictée Paul — page de connexion « Ultima » (carte-anneau fantastique
  originale, sans toponyme, bandeau ULTIMA) puis, connecté, **un arbre
  remplace la carte** (branche commune = secteur d'activité, une
  ramification par contact, croissance à l'ajout). Cadrage complet :
  `REFONTE-ARBRE.md` (boucles A1-A4, risques RB1-RB6) + 2 previews
  `design/preview-connexion-ultima.html` et
  `design/preview-arbre-contacts.html`, retravaillées en **registre
  antique et sérieux** (décision style 2026-07-08 : retrait du registre
  enfantin — CLAUDE.md et journal mis à jour). **Suspend REFONTE-ACCUEIL
  R2-R4** (registre R1 réutilisé, rien de jeté). PR #22 fusionnée sur go
  explicite de Paul (« merge and push »).
  **✅ Arbitrages D1-D5 rendus (2026-07-09, « je suis toutes tes recos »)** :
  D1 session persistante + belle page vue 1×/appareil ; D2a carte en onglet
  secondaire (rien de jeté) ; D3 secteur texte libre + suggestions ; D4 go
  previews ; D5 go ordre A1→A4.
- ✅ **Pivot Arbre A1→A4 livré (2026-07-09, solo)** — PR #24 (ready, fusion
  = go Paul). Chaque boucle : agent implémente → contre-passe sécu +
  verificateur indépendants → commit atomique.
  - **A1** page de connexion « Ultima » : overlay plein écran (carte-anneau
    SVG inline, cartouche ULTIMA), formulaire lien-magique rebranché à
    l'identique — **zéro touche auth** (RB5 vérifié). Fix toast au-dessus de
    l'overlay. Double-GO.
  - **A2** secteur d'activité : champ texte libre + datalist (dédoublonnage
    normalisé), validation 3 couches (HTML/API/CHECK, borne 120). Migration
    `0006_secteur_activite.sql` **déposée, NON appliquée — GATE Paul**.
    Double-GO.
  - **A3** l'arbre des contacts (`js/arbre.js`) : rendu SVG déterministe
    depuis `etat.noeuds`, branche « À classer », zéro chevauchement par
    construction ; arrivée connecté = l'arbre, carte en onglet secondaire ;
    tap/clavier → fiche existante, panneau sorti en overlay global ;
    recherche v3-⑥ conservée. Fix sécu S1 (octet NUL → module diffable).
    150 contacts ~5 ms. Double-GO.
  - **A4** croissance & vie : pousse animée (`prefers-reduced-motion`), état
    vide, finitions décor-only (déterminisme préservé), garde-fou `inert`
    derrière l'overlay de connexion, fixtures démo avec secteur (6 branches).
    Double-GO.
  - Patrimoine : 15 harnais verts (2 unit + 13 smoke), 0 erreur console.
  **⏳ Registre Actions humaines (solo — non bloquant) :** ① appliquer
  migration `0006` (puis harnais + `get_advisors`) ; ② Vercel env
  `GEOCODE_USER_AGENT` + URL prod + header `Permissions-Policy` (U6) ;
  ③ Supabase Auth : inviter Paul, couper signups, Site/Redirect URLs ;
  ④ gate `auth.getUser()` endpoints ; ⑤ preuves live après déploiement
  (tuiles OSM réelles RA1/RA2, Nominatim réel, login). **Fusion PR #24 =
  go Paul.**
  **Vivier (passes ultérieures) :** fidélité visuelle « arbre-registre en
  bandes » vs dessin peint (arbitrage esthétique Paul) ; assertions de
  contraste dédiées (aide connexion + bannière secteur) ; relations v2 en
  lianes/greffes entre branches (A3 vivier).
- ✅ **Outillage skills + Léo (2026-07-11, solo)** — recherche GitHub de skills
  utiles à la construction d'Ultima, filtrés au stack vanilla + registre
  antique (pas de landing → marketing écarté). Installés dans `.claude/skills/`
  (anthropics/skills, Apache 2.0, licence conservée) : `frontend-design`,
  `theme-factory`, `algorithmic-art`, `webapp-testing`, `skill-creator`.
  Charte de Léo enrichie (dispatch des skills par agent + mandat recruteur
  étendu aux skills, repère agent vs skill). PR #26, #27 fusionnées.
- ✅ **Boucle « antique et sérieux » (2026-07-11, solo)** — exécution de la
  décision style 2026-07-08 : purge des derniers résidus « enfantins » du
  front. Police manuscrite Caveat → pile old-style 100 % système
  (`--police-ancienne`, zéro asset) ; panneaux de bois (poteau/clous) →
  plaques de parchemin gravées (classes conservées, `app.js` intact) ;
  2 `@font-face` + 2 woff2 (~100 Ko) supprimés, tokens `--bois*` purgés.
  11 harnais verts, AA reconfirmé, contre-passe verificateur GO. PR #28.
- ✅ **Boucle RB2 — verrouillage contrastes (2026-07-11, solo)** — assertions
  de contraste dédiées (bannière secteur 9,34:1 ; aide connexion 5,50:1),
  vidées du vivier ci-dessus. Verrouillage pur (aucune couleur changée).
  PR #29. ⏳ Consigné : sous-titre décoratif du cartouche (`.cartouche-sous`)
  à 4,594:1 (AA mais marge fine) → micro-arbitrage graphisme si Paul le veut.
- ✅ **Gates préparées (2026-07-11, solo — « prépare toutes les gates »)** —
  runbook actionnable dans `RUNBOOK-GATES.md`. **Correction du registre :**
  la **migration `0006` est en réalité DÉJÀ APPLIQUÉE** (vérifié en base :
  version `20260709121710`, colonne `secteur_activite` présente ; advisors
  sécu = 0 lint bloquant, perf = INFO base vide) → gate ① close, le registre
  antérieur qui la disait « à appliquer » est périmé. Restent, préparées :
  ② Vercel env `GEOCODE_USER_AGENT` + URL prod + confirmation header U6 ;
  ③ Supabase Auth (inviter Paul, couper signups, Site/Redirect URLs) ;
  ④ ✅ **durcir `auth.getUser()` — CLOSE** (PR #32 mergée sur go Paul le
  2026-07-11 : `requireUser` valide le jeton sur les 5 endpoints, fail-closed,
  arbitrages geocode-401 + panne-Auth-401 validés ; securite-auditeur +
  verificateur GO) ; ⑤ preuves live post-déploiement ;
  ⑥ optionnels (protection mots de passe compromis WARN — sans objet en
  lien-magique ; sous-titre cartouche ; connecteur Vercel de Léo qui ne voit
  pas encore `ultima`).
- ✅ **Boucle « Arbre responsive en largeur » (2026-07-11, solo)** — réponse à
  la question de Paul (« la carte grandit-elle avec les contacts ? ») :
  l'Arbre grandissait déjà en HAUTEUR avec les contacts, mais sa LARGEUR était
  bloquée (~640 px, colonne étroite). Il s'élargit désormais par paliers de
  colonnes selon la largeur d'écran : 3 col (vb 620, <820) → 4 (820) → 5
  (1040) → 6 (1240) ; mobile pixel-identique. Layout rendu fonction pure
  `calculerLayout(noeuds, largeurCible)` + `choisirPalier` en escalier ;
  `data-palier` (attribut, CSP OK) ; resize débouncé 150 ms re-rendant au seul
  changement de palier. 14 harnais verts, contre-passe verificateur GO
  (déterminisme aux seuils, zéro scroll-X, mobile non régressé). PR #34.
  ⏳ Réserves cosmétiques négligeables : 1 re-render idempotent au 1ᵉʳ resize ;
  `data-palier` non nettoyé en état vide (sans effet). Spec :
  `design/spec-arbre-responsive.md`.
- ✅ **PIVOT PLATEFORME — cadrage acté (2026-07-12)** : dicté par Paul, tournant
  majeur. Ultima devient sa **plateforme personnelle en console à 4 quadrants**
  (RIVEN réseau · NICOL BOLAS finances · ADRAMELECH idées · IMLADRIK dév. perso),
  pilotée par la seule Léo (désormais **féminine**), un repo, mémoire
  inter-segment. Le réseau existant (v1→A4) devient le quadrant RIVEN — rien
  de jeté. Livré en **cadrage pur** (zéro code produit) : `CADRAGE-CONSOLE.md`
  (console, 4 quadrants, sécurité relevée §5, carte agents/skills §7, roadmap
  C0→C5 §8, risques RC1-RC5, arbitrages §10). Mémoire implantée (journal, profil,
  lexique, radar), charte Léo + CLAUDE.md étendus. **Prochaine boucle : C1 — la
  console** (coque réutilisant l'existant) OU le mini-cadrage du quadrant que
  Paul veut voir en premier. **Arbitrages ouverts (décisions Paul)** : ordre des
  quadrants (reco : le moins dépendant d'un service externe d'abord) ; niveau de
  chiffrement au repos NICOL BOLAS/IMLADRIK ; périmètre v1 par quadrant.
- ✅ **ADRAMELECH — premières captures (2026-07-16)** : registre de capture
  `adramelech/IDEES.md` ouvert (format prêt pour l'import en base à la boucle
  ADRAMELECH). Deux idées dictées par Paul, nommées et enrichies :
  **ADR-001 GLANEUR** (récupération invendus/rebuts bâtiment — tournée Leroy
  Merlin, mise à la benne facturée aux artisans, entrepôt achat-revente ;
  avec Godefroy) et **ADR-002 PROTÉE** (entreprise flexible bâtiment/énergie —
  clim/PAC/photovoltaïque selon saisons et modes, équipes polyvalentes,
  subventions captées proprement ; avec Julien), puis **ADR-003 INTENDANT**
  (pilotage d'approvisionnement de chantier — matching besoins client ⟷
  commandes ⟷ stock propre, livraison J-1/J-2 contrôlée, manquants vus avant
  la pose ; besoin propre de Paul, cas d'école : l'aile de recouvrement
  manquante qui a foutu un chantier de fenêtres), puis **ADR-004 MYCÉLIUM**
  (1 client → 2 clients : pilotage par la data client, relances au bon
  moment, séquence post-chantier satisfaction → avis Google → recommandation
  nominative ; maxime « frappez après une victoire »). Lexique vocal enrichi.
  **Fusionné dans `main`** (PR #40, go Paul « Allons-y », 2026-07-16 ; inclut
  la correction globale RIVEN à un seul L). **Carto des idées livrée** :
  `adramelech/carto-idees.html` (archipel gravé — 4 îles, routes de synergie,
  ancrages RIVEN, cartouches de précision ; thèmes clair/sombre, zéro JS,
  vérifiée en navigateur) + artifact Claude pour consultation immédiate.
  ⏳ Sécurité à trancher à la boucle ADRAMELECH : le contenu `adramelech/`
  (idées = données personnelles, §5 CADRAGE-CONSOLE) est servi statiquement
  par Vercel sans auth — à gater (middleware) ou sortir de la racine web.
  **Fusionnée (PR #41, go Paul « merge et push »).**
- ✅ **Verrou architecture agent + blasons (2026-07-16, PR #41)** : un seul
  agent (Léo) pilote tout Ultima — seule en cross-plateforme, seule
  interlocutrice, mémoire unique ; les autres `.claude/agents/` sont ses
  sous-agents. Blasons de quadrant figés : RIVEN = boussole · ADRAMELECH =
  dragon · NICOL BOLAS = balance · IMLADRIK = étoile · Console = sceau ULTIMA.
- 🟡 **Boucle ADRAMELECH — mini-cadrage (2026-07-16, directive EB « on boucle
  Adramelech »)** : `adramelech/CADRAGE-ADRAMELECH.md` déposé (cadrage pur).
  Périmètre v1 recommandé = « bibliothèque vivante sans base » (générateur de
  carto depuis le registre AD-1, `agent-idees` + bilan AD-2, sécurité du
  quadrant AD-3 ; passage en base AD-4 reporté derrière gate). Point sécurité
  résolu au cadrage (idées derrière l'auth). **Décisions Paul en attente** :
  périmètre v1, option sécurité, ordre vs console C1 (voir §6 du cadrage).
  Prochaine sous-boucle constructible sans gate : **AD-1**.
- ✅ **Boucle ADRAMELECH v1 livrée (2026-07-16, solo)** — les 3 sous-boucles
  bouclées :
  - **AD-0 sécuriser** (PR #42 mergée) : garde middleware `estCheminPrive` +
    `.vercelignore` retirent `/adramelech/*`, `/memoire/*` (PII de Paul) et tout
    `*.md` de la surface publique ; contre-passe adversariale GO ; durcissements
    S1/S2/S3 différés à AD-4. Conséquence actée : quadrant « noir en prod » en v1.
  - **AD-1 carto générée** (PR #43 mergée) : `adramelech/generer-carto.mjs`
    déterministe (archipels par thème, ponts, ancrages RIVEN data-driven),
    parseur zéro-perte, harnais de fermeture.
  - **AD-2 agent-idees + bilan** (PR en cours) : sous-agent `agent-idees` recruté
    + bilan chiffré (dashboard statique) dans la carto.
  Chaque brique : agent implémente → Léo vérifie indépendamment (harnais +
  navigateur) → commit → gate/merge Paul.
- 🟡 **AD-4 idées en base (2026-07-16, GO SOLO)** — AD-4a migration `0007`
  (tables `idees`/`idees_liens`, RLS mono-owner) **appliquée en base** (contre-
  passe securite-auditeur GO, `rls_enabled` confirmé) ; AD-4b API idees
  (`requireUser`, validation stricte, 20 verdicts) ; AD-4c durcissements
  S1/S2/S3 du garde PII fermés. **⏳ Gaté (invérifiable sans compte auth Paul)** :
  front carto client-side après auth (fin du « noir en prod ») + seed des 4
  idées (`importer-idees.mjs` prêt). Détail : `adramelech/CADRAGE-ADRAMELECH.md`.
- ✅ **Boucle AD-4c front — « on termine AD » (2026-07-19)** : la carto des
  idées consultable en prod après auth — `idees.html` sur `/idees` (motif
  traveler, middleware et garde AD-0 INTOUCHÉS), `js/idees.js` data-driven
  depuis `GET /api/idees` (archipels par thème, ponts, badges statut, états
  401/vide/erreur/démo), ouverte depuis l'antichambre du quadrant
  (adramelech.html, diffusion Léo PR #55) — réconciliation des deux sessions :
  l'antichambre est la porte, la carte est sa vue « archipels ».
  Harnais `unit-idees-carto` (20) + `smoke-idees` (45) ; suite patrimoine
  verte ×2 (front-carto + contre-passe Léo indépendante, captures vérifiées).
  **Fin du « noir en prod » — le quadrant ADRAMELECH est bouclé** (AD-0→AD-4).
  PR #54, fusion = go Paul. ⏳ Preuve du flux authentifié réel en prod = geste
  Paul (se connecter, ouvrir /idees). Anti-télescopage : session parallèle L1
  identifiée, zones interdites respectées (leo-accueil, traveler, middleware).
- ✅ **DIRECTIVE JL actée (2026-07-18)** : dictée et nommée par Paul — à terme,
  **Ultima = son unique interface de travail** (au sens large), absorbant toute
  sa data (pro et perso), Léo seule interlocutrice qui oriente, dispatche et
  navigue tout ; outil souple qui apprend et s'adapte ; **rien d'autre ne sera
  créé**. Tous les travaux doivent y être conformes. Gravée dans CLAUDE.md (🎯),
  CADRAGE-CONSOLE §1, charte Léo, journal des décisions, lexique. EB = la
  discipline de route, JL = la destination.
- ✅ **Boucle L2 — la voix de Léo (2026-07-19, « Focus Léo »)** : sur ordre de
  Paul (« les projets on verra plus tard, focus Léo » — MYCÉLIUM/PROTÉE
  reportés au registre), la voix conversationnelle est construite :
  `POST /api/leo` (requireUser fail-closed → API Claude, clé env Vercel
  uniquement, timeout 30 s, bornes historique/réponse, garde de débit
  1 appel/3 s/utilisateur [S-L2-1], prompt Jarvis par quadrant sans PII) +
  zone « Parler à Léo » dans le cartouche (RIVEN + ADRAMELECH, session
  réelle exigée ; 503 sincère tant que la clé n'est pas posée). Contre-passe
  securite-auditeur **GO** (S-L2-1 fermé même boucle ; S-L2-2 injection =
  angle mort consigné pour L2b) ; harnais complet vert (24 verdicts unit +
  smoke conversation stubée). **PR #60 (draft, porte aussi le front
  INTENDANT AD-5c-δ), fusion = go Paul.** Détail : CADRAGE-LEO-SITE §4.
  ⏳ Gate coût : clé API + plafond mensuel + env `ANTHROPIC_API_KEY` = Paul.
- ✅ **Reprise 2026-07-20 (« clos les PR en rade, avance sur la suite de
  Léo »)** : PR #59 (RADAR) fusionnée à froid ; PR en rade #25/#38/#39
  closes (contenu livré autrement) ; **PR #60 L2 la voix FUSIONNÉE** (rebase
  de réconciliation RADAR, squash `1fbd00f`) — muette tant que la clé n'est
  pas posée ; fiche Notion resynchronisée (rattrapage du 19/07).
- 🟡 **Boucle L2b — les mains de Léo (2026-07-20)** : agir sur dictée. Spec
  `design/spec-l2b-mains.md` (§0 : l'IA PROPOSE, n'exécute jamais) ; tool use
  sur /api/leo → proposition validée + reformulation déterministe serveur ;
  carte de confirmation (cible RÉSOLUE nommée) ; Confirmer → le front exécute
  via les API existantes (Bearer session, RLS) ; aucun outil de suppression.
  Harnais unit-leo-mains (53) + unit-leo-voix (28) + smoke section C (33),
  suite verte ×3. **Contre-passe securite-auditeur : GO** — S-L2b-1/2/3
  fermés (`bb2ab3f`), S-L2b-4 (info, serveur de confiance) en vivier ;
  ré-audit S-L2-2 : mitigation centrale fermée, résiduel clos par S-L2b-1.
  **PR #61 draft — fusion = go Paul.** ⏳ Gate inchangée : `ANTHROPIC_API_KEY`
  en env Vercel + plafond de dépense (débloque voix ET mains).
- Protocoles permanents de session : voir `CLAUDE.md`.
- Sauvegarde permanente : fiche Notion « 📦 Repo Ultima- — Fiche projet ».

> Adapté du prompt RénoBoost (2026-07-02). Source unique de vérité du pilotage.
> Décisions produit actées avec Paul : **Ultima = carte interactive du réseau
> commercial** (artisans, partenaires, leads, chantiers) · **greenfield**.

## DIFFÉRENCES vs prompt RénoBoost (pourquoi ce cadrage est inversé)

Vérifié le 2026-07-02 :

| Prérequis RénoBoost | Réel Ultima | Conséquence |
|---|---|---|
| `AUDIT-2026-07-02.md` (S1-S6 / U1-U19) | absent — repo = 1 README | l'audit devient un **livrable** (P1), pas une entrée |
| ~16,5k lignes, 13 endpoints `api/`, `middleware.js` | aucun code | phase **P0 Fondations** ajoutée en préalable |
| ROADMAP-SECURITE/SITE/DASHBOARD | absents | initialisés en P0 |
| PR draft #129 | aucune PR sur le repo | PR draft **créée** par ce cadrage |
| Projet Supabase lié | aucun projet « Ultima » | création = **validation Paul** (coût) |
| Fiche Notion | aucune | à créer en fin de P0 si Paul le souhaite |

Principe conservé : construire **sécurisé d'abord**, auditer ensuite, patcher par
gravité, améliorer par impact×effort. On ne re-scanne jamais ce qui est déjà
consigné : `AUDIT-<date>.md` reste le tableau de bord unique.

## CONTEXTE

Ultima : carte interactive du réseau commercial — nœuds (artisans, partenaires,
leads, chantiers) + relations (apport d'affaires, sous-traitance, chantier commun),
filtres métier, fiche au clic. Stack alignée sur l'écosystème existant
(renoboost-leads, systeme-commercial) : HTML/CSS/JS vanilla, endpoints serverless
`api/`, `middleware.js`, Supabase, Vercel.
Repo : `paulgerard161098/Ultima-` · branche : `claude/renobost-audit-remediation-dxv8ql`.

## OBJECTIF — 4 phases

**P0 FONDATIONS (nouveau, préalable)**
- Cadrage produit 1 page : personas, 5 user stories max, modèle de données
  (tables `network_nodes`, `network_edges`, typage des relations).
- Squelette sécurisé : `index.html` + module carte (Leaflet/OSM par défaut —
  gratuit, pas de clé exposée ; bascule Google Maps = décision Paul, coût API),
  `api/` minimal (auth, CRUD réseau), `middleware.js` (headers sécu, rate-limit),
  `vercel.json`.
- Supabase : schéma + **RLS dès la première migration**, SQL déposé dans
  `supabase/migrations/`, **JAMAIS appliqué sans validation Paul explicite**.
  La création du projet Supabase « ultima » elle-même = validation Paul (coût).
- Livrables : MVP déployable en preview Vercel + `ROADMAP-SECURITE.md` +
  `ROADMAP-SITE.md` initialisées.

**P1 AUDIT (détection + solution, sans appliquer)**
- Générer `AUDIT-<date>.md` sur le code P0 : constats indexés **S1-Sn** (sécu,
  gravité décroissante) / **U1-Un** (UX, impact×effort), croisés avec les
  advisors Supabase (`get_advisors`) une fois le projet créé.
- Pour chaque constat : correctif précis (diff proposé + test de fermeture),
  regroupé par fichier. Rien n'est appliqué en P1.

**P2 EXÉCUTION SÉCU** — appliquer par gravité S1 → S2 → S3 → S4/S5.
1 commit atomique + 1 test par faille : `fix(sec): <faille> [S#]`.

**P3 EXÉCUTION UX** — top 5 puis le reste par impact×effort.
1 commit par item : `feat(ux): <item> [U#]`.

## STRATÉGIE MODÈLE (tiering coût/qualité — levier d'optim n°1)

- **Fable 5 par DÉFAUT** : P0 squelette front/CSS, P1 entière (lecture, détection,
  rédaction correctifs + tests), P3 mécanique (responsive, contraste, tap targets,
  favicon, toasts).
- **Escalade Opus 4.8 UNIQUEMENT** sur surface à risque : modèle de données +
  RLS (P0/S1), auth/secrets/`middleware.js` (S2/S3), toute décision d'archi
  (choix lib carte si structurant). Chaque bascule Fable→Opus est signalée
  explicitement avec sa raison.
- **Sous-agents parallèles** sur axes indépendants (levier n°2) : en P0
  front-carte ∥ api ∥ SQL ; en P2/P3 sécu ∥ UX. Temps mur = le plus long,
  pas la somme.

## ENTRÉES / SORTIES

IN : ce fichier (CADRAGE-ULTIMA.md), décisions Paul, style de l'écosystème
existant comme référence, advisors Supabase (après création projet).
OUT : commits atomiques poussés + **PR draft du repo mise à jour** (pas de #129 :
inexistante ici) ; `AUDIT-<date>.md` annoté par constat (✅ corrigé+commit /
⏭ reporté+raison / ❌ non reproduit) — tableau de bord unique, pas de doc
parallèle (levier n°3) ; roadmaps rafraîchies ; rapport final :
fermées / restantes / livrées.

## CONTRAINTES

- Périmètre : code + config du repo. Après P0 : patchs minimaux, style existant,
  pas de refonte.
- Migrations Supabase : SQL dans `supabase/`, jamais appliqué en prod sans
  validation Paul explicite.
- Jamais de secret committé (env Vercel uniquement). Vanilla d'abord : pas de
  dépendance lourde sans justification ; mises à jour seulement si `npm audit`
  le justifie.
- Économe en tokens : P1+ consomme les IDs S#/U# comme backlog, pas de re-audit.

## POINTS DE VALIDATION PAUL (bloquants)

1. Go P0 sur ce cadrage (personas/stories inclus).
2. Création du projet Supabase « ultima » (coût).
3. Application de toute migration (RLS incluse).
4. Leaflet/OSM (défaut) vs Google Maps (clé + coût).
5. Go P0→P1 (MVP validé en preview).

## GESTION D'ERREURS

- Test rouge après patch → corriger avant le suivant.
- Constat non reproductible → ❌ + preuve, pas de patch aveugle.
- Correctif touchant auth/middleware/données/RLS → stop + demande Paul
  (déclenche aussi la bascule Opus 4.8).
- MCP indisponible → continuer en statique et le signaler.
- Décision produit ambiguë → question à Paul, pas d'invention.

## STYLE

Production défensive : validation d'entrées sur tous les endpoints, erreurs
génériques côté client / détaillées côté serveur, timeout sortant sur tout appel
externe, pas de PII en logs (le réseau commercial EST de la PII : noms, adresses,
téléphones → logs = IDs uniquement).
Fin de chaque livraison : blocs 🔒 Retour sécurité + ⚡ Retour optimisation +
`/verify` sur les flux touchés.
