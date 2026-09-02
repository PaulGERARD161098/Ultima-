# FINUBAR — Ultima

> **Finubar** est l'index de pilotage de tous les projets de Paul : *où on en est,
> où on s'est arrêté, par quoi on reprend, et vers quoi*. Ce fichier est le **grain
> de ce dépôt** — un seul par dépôt, huit en tout.
>
> Il est lu **automatiquement à l'ouverture de chaque séance** Claude Code
> (hook `SessionStart` → `.claude/finubar-rappel.mjs`), et agrégé avec les sept
> autres par `Ultima-/finubar/collecter.mjs` (écran `/finubar` d'Ultima).
>
> ⛔ **Trois règles, et elles ont chacune coûté quelque chose :**
> 1. **Il se met à jour EN FIN DE SÉANCE**, jamais au début. Une note écrite avant
>    de vérifier est un souvenir, pas une mesure.
> 2. **Il indexe, il ne recopie pas.** La roadmap détaillée vit où elle vit
>    (champ `rattache_a`) ; la dupliquer ici fabriquerait deux vérités qui
>    divergent — et on croirait la mauvaise.
> 3. **`dernier_arret.commit` n'est pas décoratif** : la collecte compare ce
>    commit à la tête réelle du dépôt. Si le dépôt a avancé depuis, Finubar le dit
>    et remonte ce projet en tête — c'est ce qui empêche cette note de mentir.

<!-- finubar:debut -->
```json
{
  "projet": "Ultima",
  "depot": "PaulGERARD161098/Ultima-",
  "cap": "Ultima est l'unique interface de travail de Paul (Directive JL) : elle absorbe toute sa data, la dispatche, la navigue — avec Léo pour seule interlocutrice. Rien d'autre ne sera créé : tout nouveau besoin est une extension d'Ultima.",
  "rattache_a": "REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md",
  "etat": "en_cours",
  "jalon": {
    "nom": "J3 — le ciel porte aussi l'état PERSONNEL (P4 : les signaux du cockpit)",
    "critere_de_sortie": "ALTHEA en sommeil, idées orphelines et relances dues appellent sur le MÊME ciel et avec la MÊME couleur que les dépôts — un seul fetch, une seule règle de priorité. ⛔ N'ouvre qu'après que P3 ait vécu et que Paul ait dit ce que l'accueil lui fait"
  },
  "dernier_arret": {
    "le": "2026-09-02",
    "quoi": "CLÔTURE DE SÉANCE. L'accueil piloté par Finubar (jalon 0 + P1 + P2 + P3) et la porte d'entrée au ciel sont EN PRODUCTION — PR #185 (b4dc35c) et #186 (c9c4587) fusionnées sur go de Paul, patrimoine complet vert à chaque palier, zéro PR ouverte. Nettoyage de fin : la maquette portait encore ses copies de `greffer`/`signaux` après leur promotion en production — elle importe désormais le vrai module (deux versions de la même règle finissent par diverger, et c'est la copie oubliée qui diverge). Mémoire écrite : journal des 5 arbitrages, radar, et REPRISE-2026-09-02-accueil-finubar.md (roadmap J1→J5 + pre-mortem à 3 mois).",
    "commit": "ea715f0"
  },
  "prochaine_action": "DEMANDER À PAUL CE QUE L'ACCUEIL LUI A FAIT — il ne l'a pas encore regardé en production, et c'est le seul juge de la question qui commandait la boucle : est-ce que la couleur oriente ? Les trois réponses possibles mènent à trois suites différentes (tableau du §2 de REPRISE-2026-09-02-accueil-finubar.md) ; ne pas les confondre, et surtout ne pas enchaîner sur P4 sans sa réponse",
  "bloque_par": [
    "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
    "`ANTHROPIC_API_KEY` en env Vercel",
    "Les advisors Supabase post-DDL",
    "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
  ],
  "en_attente_depuis": "2026-08-20",
  "boucles_ouvertes": [
    {
      "quoi": "P4 est cadré et volontairement NON ouvert : les signaux du cockpit (quadrants personnels) sur le même ciel que ceux de Finubar (les dépôts). Arbitré par Paul le 02/09 — après P3, jamais avant. Une boucle à la fois",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "⚠️ Trois dépôts (mon-dpe.fr, artisan-builder, ripair) n'ont PAS d'accroche vérifiée : ils tombent sous ALPHA par défaut dans finubar/depots.json. Les deux premiers sont attachables à une séance (add_repo les accepte) ; ripair est hors de portée (autre propriétaire). Leur place se tranchera quand ils seront lus",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "⚠️ LA LEÇON DE LA SÉANCE, et elle a failli être écrite à l'envers : j'ai d'abord conclu que « l'agrégat ment » sur la foi d'un `git rev-list` brut qui comptait les commits de recalage de grain. `collecter.mjs` les exclut explicitement — la mesure était juste, l'instrument fautif était le mien. Avant d'accuser une sonde, lui demander CE qu'elle compte : c'est le pendant de la règle du 17/08 (« demander à une mesure ce qu'elle répond sur un cas dont on connaît la réponse »), vue depuis l'autre bout",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "⚠️ LA LEÇON DU 02/09, à ne pas reperdre : une mesure qui ne peut PAS voir quelque chose doit le dire comme tel, jamais le rendre en constat. La collecte annonçait trois grains manquants qui existaient tous — et le message invitait à aller semer ce qui était déjà semé. Même famille que la règle du 2026-08-21 (« quand on ne PEUT pas vérifier de ce côté-là, on retire l'hypothèse au lieu de la documenter ») et que celle du 2026-08-17 (« un filtre qui exclut des cas doit compter et nommer ce qu'il exclut »). Toute nouvelle sonde de Finubar se relit à travers celle-ci",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "Les huit coques de navigation (grima.html, naga.html…) ne sont plus le CHEMIN depuis l'isolement — elles restent des PORTES (repli <noscript>, lien direct, adresse). Leur sort — les garder telles quelles, les réduire, les retirer — n'est pas tranché : à voir avec Paul quand l'isolement aura vécu",
      "depuis": "2026-08-28"
    },
    {
      "quoi": "Angle mort connu du patrimoine : les pages AUTHENTIFIÉES ne sont pas couvertes par les harnais (fixture de session à financer)",
      "depuis": "2026-08-20"
    },
    {
      "quoi": "La constellation : faire entrer les projets dans le ciel — CADRÉE le 02/09 (CADRAGE-ACCUEIL-FINUBAR.md), maquette éprouvée, en attente du go de Paul. `versConstellation()` reste écrite et branchée nulle part ; c'est `greffer()` + `signaux()` de la maquette qui la remplacent, parce qu'elles rendent l'arbre et pas une liste",
      "depuis": "2026-08-21"
    },
    {
      "quoi": "Le top départ de LV6 reste attendu — le cadrage est déposé, l'exécution gelée",
      "depuis": "2026-08-20"
    }
  ],
  "maj": "2026-09-02"
}
```

<!-- finubar:fin -->

## Journal de reprise

> Les séances, de la plus récente à la plus ancienne. Une entrée = une date, un
> fait vérifié, une décision. La mémoire longue ; le bloc ci-dessus est la mémoire
> courte, et c'est lui qui est lu automatiquement.

### 2026-09-02 (6) — Clôture
Nettoyage : la maquette portait encore ses copies de `greffer` / `signaux` après
leur promotion dans `js/adaptateur-finubar.mjs`. Elle **importe** désormais le
vrai module — deux versions de la même règle finissent toujours par diverger, et
c'est la copie oubliée qui diverge, donc la maquette aurait fini par montrer un
autre ciel que celui qui tourne. Patrimoine complet re-passé vert après.

Mémoire écrite : `memoire/JOURNAL-DECISIONS.md` (les 5 arbitrages + l'alerte
retirée), `memoire/RADAR.md`, et `REPRISE-2026-09-02-accueil-finubar.md`
(roadmap J1→J5 et pre-mortem à 3 mois).

### 2026-09-02 (5) — Fusion sur `main`
PR #185 fusionnée en **squash** sur go de Paul → `main` = `b4dc35c`. Le grain
est recalé dans la foulée : les six commits de la branche ont disparu au profit
d'un seul, et `dernier_arret.commit` pointait donc dans le vide — c'est le geste
d'après-squash, et il se fait tout de suite, pas à la séance suivante.

### 2026-09-02 (4) — La porte d'entrée passe au ciel
« Même cette page il faut la changer — thème stellaire aussi » (Paul, sur une
capture de l'écran de connexion). Il était resté une **mer** : dégradé bleu,
moirure d'eau, et une carte antique dessinée en plein écran — une centaine de
lignes de SVG, dans `index.html` **et** dans `riven.html`. Registre de l'accueil
d'avant LV5, alors que l'outil entier est devenu un ciel.

Le champ d'étoiles est celui des huit coques (`js/ciel-fond.js` via
`js/ciel-fond-page.js`), monté par un module de vingt lignes qui **ne touche pas
à l'authentification** : `boussole-auth.js` reste seul à ouvrir la porte, c'est
une surface sous gate, et un décor n'est pas une raison d'y entrer.

⚡ Il ne peint **qu'à la première ouverture** de la porte : le cas ordinaire est
Paul déjà connecté, et peindre pour un élément qui restera `hidden` toute la
session serait du travail rendu à personne. Le `hidden` est **observé**, pas
deviné — un minuteur aurait marché la plupart du temps, c'est-à-dire échoué le
jour où le réseau est lent, sans rien dire.

Le cartouche ULTIMA et la plaque du formulaire n'ont demandé aucune ligne : ils
étaient déjà passés à la nuit. Assertions **reprises** : `decorSvg` devient
`decorCiel` + `decorAPeint` (un canvas peut exister sans avoir rien peint — la
VARIANCE tranche, jamais la luminance) et `plusDeMer`, éprouvé par l'ABSENCE et
éprouvé rouge.

### 2026-09-02 (3) — L'accueil est piloté par Finubar (jalon 0 · P1 · P2 · P3)
Go de Paul sur les cinq arbitrages, tous sur la recommandation. Livré dans la
foulée : les huit dépôts sont des **astres de l'arbre** (les 4 briques sous
RENOBOOST IA, Ultima à la racine, le reste sous ALPHA), la **couleur d'appel**
monte des astres vers leurs constellations, et le **bandeau Finubar** tient le
bas de l'accueil avec les ≤ 3 signaux et l'action unique de Léo.

**Un écart assumé au cadrage** : l'accroche au ciel ne vit pas dans les huit
grains, mais dans `finubar/depots.json`. `renoboost-ia` est un identifiant du
registre de navigation d'ULTIMA ; l'écrire dans le grain de RenoDevis y ferait
fuiter une notion étrangère, et il faudrait toucher quatre dépôts pour déplacer
une étoile. `depots.json` est déjà la liste des huit, tenue par Ultima.

**Trois choses trouvées en manipulant et en regardant, aucune en relisant.**
① La **porte de RENOBOOST IA** se perdait : au ciel, un nœud qui CONTIENT isole
au lieu d'ouvrir — lui greffer ses briques lui retirait, en silence, son lien
vers renoboostia.fr. La greffe lui rend sa cible en cap à part, en tête.
② La **parole de Léo passait derrière le bandeau** : deux cartouches `fixed` au
bas de l'écran, même `z-index`, le dernier arrivé gagne. Vu sur une capture,
pas dans le code. La parole monte désormais d'une hauteur **mesurée**.
③ Le **verdict de recouvrement ne pouvait pas devenir rouge** : la production
déclare son mobilier au moteur (`margesUtiles`), là où la maquette réservait la
place en rétrécissant son conteneur — le symptôme ne s'y déclenche jamais, même
sans la déclaration (mesuré : 604 → 643 px sur un pire cas de 12 astres à
390 px, pour un bandeau qui commence à 656). Il mesure maintenant le
**mécanisme** : retirer le bandeau doit faire redescendre le ciel.

⚠️ Et une **alerte retirée** : j'avais annoncé le matin que l'agrégat mentait
sur la dérive. Faux — `collecter.mjs` exclut du décompte les fichiers que
Finubar écrit lui-même ; c'est mon `git rev-list` brut qui comptait mal. *Avant
d'accuser une sonde, lui demander CE qu'elle compte.*

Patrimoine **complet** vert (78 sections). Deux harnais existants ont dû
apprendre la nouvelle route (`smoke-boussole`, `smoke-lv4-coque`) : toute coque
au ciel demande désormais `/api/finubar`, et un 404 non stubé se présenterait
comme un défaut du produit alors que c'est un manque de l'instrument.

### 2026-09-02 (2) — L'accueil piloté par Finubar : cadrage et maquette
Demande dictée par Paul : *« un seul écran d'accueil, au bas duquel il y a
Finubar, piloté par Léo, qui m'oriente vers la priorité du jour avec une
coloration des sujets en priorité »*.

Le travail a commencé par un constat, pas par du code : **les trois quarts
existent**. Le ciel est l'accueil depuis LV5/P4, l'isolement constellations →
astres est arbitré depuis le 31/08, `finubar/agreger.mjs` **classe déjà** les
huit dépôts, et `versConstellation()` attend, écrite et testée, branchée nulle
part depuis le 21/08. Ce qui manque est **un branchement et une couleur** — et
c'est, mot pour mot, LV6 P2+P3 avec Finubar en source à la place du cockpit à
étendre. La demande **ferme** la boucle du 21/08 au lieu d'en ouvrir une.

Livré : `CADRAGE-ACCUEIL-FINUBAR.md` (6 points, pre-mortem à 10 modes, 5
arbitrages) et la maquette `design/preview-accueil-finubar.html`, qui charge le
**vrai** moteur et le **vrai** registre — une maquette qui redessine le ciel
qu'elle prétend montrer ne montre plus rien.

**Deux défauts trouvés en la MANIPULANT, aucun en la relisant.** ① Une étoile
peinte sous le bandeau n'était plus cliquable : le clic atterrissait sur un
bouton du bandeau, qui isolait un tout autre nœud. L'écran **répondait**, donc
rien ne signalait la panne — le pire des cas. Le ciel s'arrête désormais à la
lisière du bandeau, dont la hauteur est **mesurée** (une constante serait fausse
au premier signal long). ② Déplier d'office la branche qui appelle tasse cinq
étoiles sur un même axe et pose le nom de la branche sur son étoile :
l'orientation rendait l'écran moins lisible que sans elle. Éteinte par défaut,
l'interrupteur reste pour l'arbitrage.

**Et une alerte que j'ai RETIRÉE après vérification, ce qui compte autant.**
J'avais conclu que l'agrégat mentait — « 0 dérive » alors que les cinq grains
pointaient 2 à 3 commits en arrière. Faux : `collecter.mjs` **exclut du
décompte les fichiers que Finubar écrit lui-même**, donc un commit qui ne fait
que recaler un grain ne se signale pas. Sa mesure est juste ; c'est mon
`git rev-list` brut qui comptait mal. Le risque réel est ailleurs, et il naît
de cette boucle : porté sur l'accueil et vu chaque matin, un instantané daté
prend l'autorité du temps réel — d'où le jalon 0, qui tient en trois mots
(« collecté le <date> »).

🔒 Trouvé au passage : **`design/` n'est pas dans `.vercelignore`**, donc servi
en clair. La fixture de la maquette a un contenu **inventé** — y embarquer le
vrai agrégat aurait annulé en une ligne la sortie de `finubar/` du déploiement
(31/08).

### 2026-09-02 — La collecte cesse de confondre « pas lu » et « illisible »
Paul demandait deux choses : *« Finubar est-il à jour de tout ? »* et un récap le
matin. La première a trouvé le défaut. La collecte annonçait **« 3 projets sans
grain lisible »** — `mon-dpe.fr`, `artisan-builder`, `ripair`. Les trois grains
existaient : les deux premiers ont été relus sur GitHub, datés du 21/08, sur des
dépôts qui n'avaient pas bougé depuis ; le troisième appartient à un autre compte
et n'est pas attachable (`add_repo` refuse le cross-tier), donc simplement hors
de portée. Le message envoyait semer ce qui était déjà semé.

La cause : la collecte lit le **disque**, et une séance ne clone que les dépôts
qui lui sont attachés. Les absents tombaient dans la branche « fichier manquant »
et en ressortaient avec un constat **sur le dépôt**, alors qu'il n'y avait qu'un
angle mort de l'observateur. Correction : deux issues distinctes, deux compteurs
(`illisibles` et `hors_seance`), un libellé d'écran qui n'accuse plus, et le
contrôle des copies du rappel qui n'inspecte plus ce qu'il ne voit pas.

⛔ Ce qui n'a **pas** été fait, et c'est la moitié qui compte : le faire
disparaître. Le hors-séance reste dans l'agrégat, à son rang, avec son motif —
règle ⑤. `§5bis` du harnais tient les deux exigences ensemble, et son cas de
référence (aucun hors-séance → `illisibles` retrouve exactement sa valeur d'hier)
répond à la règle du 17/08 : une sonde qui répond pareil dans les deux situations
ne mesure rien.

Posé le même jour : la routine **« Finubar — récap du matin »** (8 h, heure de
Paris, push + e-mail), dont le prompt porte la même leçon pour ne pas la reperdre
dans une séance qui n'aurait pas ce fichier sous les yeux.

**Et les boucles fermées derrière**, à la demande de Paul : les **trois** PR qui
restaient ouvertes sur les cinq dépôts ont été fusionnées — Ultima #182 (ce lot),
RenoBoost #324 (le cadrage du 02/09) et RenoAgenda #62 (`est_admin()` fige son
`search_path`). Zéro PR ouverte à la clôture. Les deux dernières venaient d'un fil
parallèle : leurs diffs ont été relus et leurs CI vérifiées avant fusion, pas
fusionnées sur leur seule couleur.

⚠️ Le conflit de #324 méritait mieux qu'un « prendre le leur » : deux séances
avaient écrit `dernier_arret` à quatre heures d'écart. C'est un objet unique, il
ne se concatène pas — la note de `main` a été gardée parce qu'elle est postérieure
ET ancrée sur la tête réelle, et l'apport de la PR (le fichier de cadrage) est
entré par `rattache_a`. **Ce qui n'a pas été arbitré**, délibérément : les deux
priorisations divergentes (B→A→C contre « G1 puis jalon 0 ») — trancher là aurait
été une décision produit déguisée en résolution de conflit.

Et le garde-fou tout neuf a servi dans l'heure : la collecte a signalé « 1 projet
a avancé » alors que c'était ma propre branche de travail dans RenoBoost. Une
fausse dérive, qui allait être figée dans l'agrégat commité. Les trois grains ont
été recalés sur les têtes réelles avant la dernière collecte.

### 2026-08-28 — Le ciel s'isole
Demande dictée par Paul : « quand je clique sur une constellation, ça m'affiche
uniquement cette constellation et plus les autres ». Le clic sur un nœud qui
contient quelque chose n'ouvre plus sa page : il isole sa descendance sur place,
sur deux étages. Trois sorties, l'adresse qui suit, et les huit coques qui
passent du statut de chemin à celui de portes. Une mesure neuve — le
recouvrement entre le ciel et le mobilier — a trouvé ce que le contrôle de cadre
déclarait vert.

### 2026-08-21 — Finubar
Demande de Paul : « beaucoup de projets tournent, j'ai peur de m'y perdre ».
Livré : le moteur pur `finubar/agreger.mjs` + `tests/unit-finubar.mjs` (éprouvé
rouge sur trois verrous, puis vert), la collecte, le rappel d'ouverture de séance
dans les huit dépôts, les huit grains, et l'écran `/finubar`.
Trois arbitrages rendus par Paul : périmètre = les 8 dépôts de code · rappel = à
l'ouverture de séance (ni cron, ni push, ni e-mail) · forme = page + cartouche
maintenant, **entrée dans la constellation générale plus tard**.

### 2026-08-20 (soir) — Clôture, registre des dettes LV5 vide
`main` = `c5b26d1`, zéro PR ouverte. Trois boucles fermées (#173, #174, #176) ;
le fil parallèle a déposé le cadrage LV6 (#175), **gelé au top départ de Paul**.

### 2026-08-31 — L'isolement se resserre à un étage
Paul tranche l'arbitrage laissé ouvert le 28/08 : isoler un nœud ne montre plus
que ses **grands thèmes** — ses enfants directs — et cliquer l'un d'eux descend
d'un cran de plus. Le pire cas construit du patrimoine a dû être **recalculé**
et non relancé : à un seul étage, l'ancien n'aurait peint que 4 étoiles sous un
intitulé qui en annonçait 24. Commit `639c2d6`, PR #179 en attente du go de Paul.

### 2026-08-31 (2) — Deux fusions, et un garde-fou qui ne tenait qu'à un fil
`#179` (isolement à un étage) et `#180` (sécurité Finubar) fusionnées sur `main`.
La seconde est née de la vérification laissée ouverte le 21/08 : impossible à
faire depuis nos bacs à sable (403 du proxy sur le CONNECT), elle a été
remplacée par un correctif qui **retire l'hypothèse** — `finubar/` ne part plus
au déploiement — et par un verrou vérifiable **hors ligne**.
**La dérive des grains s'est vérifiée en direct** : les deux fusions étant des
squash, `dernier_arret.commit` pointait déjà dans le vide (`639c2d6` a disparu
de `main`). C'est exactement ce que la vérification ① doit corriger sur les
7 autres dépôts — encore ouverte, l'attachement de ces dépôts ayant été refusé.
