# CADRAGE-ULTIMA — audit → patch → améliorations, adapté au réel du projet

## ÉTAT (2026-07-06, après arbitrage)

> **Deux sessions ont tourné en parallèle le 2026-08-01** (fil affichage Lv3
> et fil IMLADRIK). Les deux clôtures sont conservées telles quelles : on
> concatène, on n'arbitre pas — même règle que pour le journal.

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
  - ✅ **MINETHNIR** : boucle ① = diagnostic **sans une ligne de code** — le
    journal est vide **par distance**, pas par forme ni par contenu. Boucle ② =
    **`/ecrire.html`, la capture** (une seule chose à l'écran, pas de titre,
    brouillon local écrit **avant** tout appel réseau).
  - ✅ **Gate coût du 2026-07-19 (PR #60) FERMÉE** : `ANTHROPIC_API_KEY` posée
    en env Vercel par Paul. Preuve en prod : Léo répond, **ses yeux
    fonctionnent**, et **la §5 tient** — comptes et noms de caps, jamais de
    contenu. *Rappel gagné : une variable d'env Vercel n'agit qu'après un
    redéploiement.*
  - ⏳ **Actions à la main de Paul** : ① **déposer une première page sur
    `/ecrire.html`** — la boucle ③ de MINETHNIR (la forme de **lecture**) ne se
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
    par VRANESH et MINETHNIR. Détail : `CADRAGE-IMLADRIK.md §9`.
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
  - **IMLADRIK complet et tissé** (MINETHNIR + DRAUKHAIN + VRANESH + passerelles
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
  `voie-*`/`borne-*`, réemployable par VRANESH et MINETHNIR) + `js/draukhain.js`
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
  identifiant ; MINETHNIR au régime le plus strict (comptes + date de la
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
    **MINETHNIR**, deux nouveaux caps **VRANESH** (les futurs potentiels —
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
    (3 caps — MINETHNIR ouvert, VRANESH + DRAUKHAIN à venir — autour du médaillon
    épée + dragon, légende gravée « Kalamn-talaen ») ; le journal migre vers
    **`minethnir.html`**. **Renommage front seul** : `js/imladrik.js`, API
    `/api/imladrik*`, migrations `0012`/`0014`, RLS et harnais **inchangés** —
    zéro migration, zéro touche à l'auth/données. Réutilise `css/boussole.css`
    (langage caps/aiguilles/parole) ; nouveaux `js/imladrik-carto.js` (clone du
    cœur de `boussole.js`, sans cockpit — carto muette §5) + `css/imladrik-carto.css`
    (sceau + légende). Console : IMLADRIK « En chantier » → « Accéder ». Harnais :
    `smoke-imladrik` reciblé sur MINETHNIR, **`smoke-imladrik-carto` créé**,
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
    (miroir 0011) : **`serment_liens`** (serment → idéal ZEKROM / page MINETHNIR)
    et **`scenario_liens`** (scénario → serment DRAUKHAIN [rapport menace/sert] /
    page MINETHNIR). Migration `0018_imladrik_passerelles.sql` (+ ancrages
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
