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
  "rattache_a": "CADRAGE-2026-09-25-carte-celeste.md · specs/README.md · specs/ARBITRAGES.md · specs/INDEX.md (généré) · AUDIT-2026-09-14.md · REPRISE-2026-09-06-leo-partout-mail-matin.md · REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md · CADRAGE-RIVEN-IMPORT.md",
  "etat": "en_cours",
  "jalon": {
    "nom": "B1 — Léo AGIT dans l'anneau vert (cadrage §12)",
    "critere_de_sortie": "Léo écrit sans demander dans l'anneau vert et rien au-delà ; chaque écriture journalisée avant l'acte et défaisable d'un clic. ⛔ ①② faits ; ③ ouvre sur un gate"
  },
  "dernier_arret": {
    "le": "2026-09-29",
    "commit": "0e60dbedd13347cc4faf088702ce4430f4129980",
    "quoi": "OMEGA fusionné (#310) : Ultima→Omega, Grima/Naga supprimés, Imladrik macro-projet. IFULVIN cadré sans code — voir CADRAGE-IFULVIN.md."
  },
  "prochaine_action": "B1 étape ③ — le journal des écritures. ⛔ Il commence par le gate : créer la table `leo_ecritures`. On n'écrit pas le module avant la table.",
  "bloque_par": [
    "Gestes Ycome en attente depuis le 28/09 : archiver le dépôt sur GitHub, supprimer le projet Vercel ycome",
    "Créer la table `leo_ecritures` (journal des écritures de Léo) : migration SQL en production — gate, que le mode solo ne lève pas. Elle ouvre B1 ③",
    "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation",
    "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée",
    "La précision sur « mon dpe.fr » (VITRUVE)",
    "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis",
    "Vérifier que les inscriptions Supabase sont FERMÉES (« Allow new signups ») — un compte tiers pourrait remplir le quota par la route d'import"
  ],
  "en_attente_depuis": "2026-08-20",
  "boucles_ouvertes": [
    {
      "quoi": "Étiquettes vocales des caps : chacune finit par « 0 lien » sur les menus, du bruit pour un lecteur d'écran. Préexistant, relevé au dry run du 27/09 (carte-celeste §28).",
      "depuis": "2026-09-27"
    },
    {
      "quoi": "MESURÉ le 13/09 et démenti : la note annonçait des copies divergentes du rappel Finubar. Les sept fichiers ont la même empreinte. Voir CADRAGE-FINUBAR.md.",
      "depuis": "2026-09-13"
    },
    {
      "quoi": "COLLECTE — `collecter.mjs` VIDE le grain d'un dépôt hors séance au lieu de garder sa dernière mesure. Cran de sûreté posé le 07/09 (refus d'écrire) ; la FUSION reste à faire.",
      "depuis": "2026-09-07"
    },
    {
      "quoi": "ripair (paggerard-boop) reste en LEÇONS v7 : hors de depots.json et fork partagé avec un tiers — exclu à dessein le 28/09. À trancher par Paul.",
      "depuis": "2026-09-11"
    },
    {
      "quoi": "Aucun contrôle croisé ne compare la copie des leçons d'un dépôt à sa source. Payé le 28/09 : RenoBoost portait 2 leçons absentes de la source, vues au diff avant écrasement.",
      "depuis": "2026-09-11"
    },
    {
      "quoi": "⚠️ Les Routines DR visent une session persistante AVEC ses dépôts, mais le tir d'essai du 06/09 ne l'a pas réveillée. À vérifier à 12 h ; sinon, GitHub Action par dépôt.",
      "depuis": "2026-09-06"
    },
    {
      "quoi": "Le mail du matin lit l'agrégat COMMITÉ : il vieillit les jours sans séance (il le dit). Le rendre frais tout seul = GitHub Action nocturne qui recollecte et commite",
      "depuis": "2026-09-06"
    },
    {
      "quoi": "Direction posée le 05/09, toujours valable : Ouvrir REPRISE-2026-09-05-apres-la-semaine.md §5 : la mesure d'abord (collecter.mjs + les 4 jalons en SQL), jamais la lecture du doc.",
      "depuis": "2026-09-05"
    },
    {
      "quoi": "238 fiches d'autres comptes dans kv_store : E1 rend le cas inoffensif mais ne l'explique pas. Origine à trouver — REPRISE-2026-09-05-apres-la-semaine.md §3",
      "depuis": "2026-09-05"
    },
    {
      "quoi": "VESTA (ADR-010) hors classement : nom à acter, rôle de Fahrenheit à confirmer, 3 questions à poser. Julien = Julien Laudy, celui de PROTÉE. Détail : adramelech/IDEES.md",
      "depuis": "2026-09-05"
    },
    {
      "quoi": "P4 est cadré et volontairement NON ouvert : les signaux du cockpit sur le même ciel que ceux de Finubar. Arbitré par Paul le 02/09 — après P3, jamais avant",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "Trois dépôts (mon-dpe.fr, artisan-builder, ripair) n'ont pas d'accroche vérifiée et tombent sous ALPHA par défaut. Leur place se tranchera quand ils seront lus",
      "depuis": "2026-09-02"
    },
    {
      "quoi": "Les huit coques de navigation restent des PORTES et non le chemin. Les garder, les réduire ou les retirer n'est pas tranché — à voir quand l'isolement aura vécu",
      "depuis": "2026-08-28"
    },
    {
      "quoi": "Audit 14/09 : les parcours authentifiés simulés sont couverts, notamment capture et changements de compte. Le parcours avec un vrai compte sur le déploiement reste à éprouver après livraison ; voir AUDIT-2026-09-14.md.",
      "depuis": "2026-08-20"
    },
    {
      "quoi": "Faire entrer les projets dans le ciel : cadré le 02/09, maquette éprouvée, en attente du go. `versConstellation()` reste écrite et branchée nulle part",
      "depuis": "2026-08-21"
    },
    {
      "quoi": "Le top départ de LV6 reste attendu — le cadrage est déposé, l'exécution gelée",
      "depuis": "2026-08-20"
    }
  ],
  "maj": "2026-09-29"
}
```

<!-- finubar:fin -->

## Journal de reprise

> Les séances, de la plus récente à la plus ancienne. Une entrée = une date, un
> fait vérifié, une décision. La mémoire longue ; le bloc ci-dessus est la mémoire
> courte, et c'est lui qui est lu automatiquement.

### 2026-09-14 — livraison de l’audit terminée

Go de Paul reçu. PR #242 fusionnée au commit `fc2aafc6128567e63ae729607cfe9aabc96380f2`.
Migration enregistrée par Supabase sous `20260914152259`, contrôles post-DDL
validés, CI GitHub verte et déploiement Vercel réussi. Les trois fichiers JS
corrigés contrôlés en production correspondent aux fichiers testés. La migration
et la fusion ne sont plus bloquantes. Détail, sondes HTTP et limites :
**`AUDIT-2026-09-14.md` §Livraison**. Le jalon J3/P4 reste celui de Paul.

### 2026-09-14 — audit correctif prêt à livrer

Code et tests poussés dans `fix/audit-2026-09-14`, commit
`a7280bbf2c256658b75bc6db9d5f42f8ac1a814b`. Les 36 suites unitaires et les
41 harnais navigateur passent localement. Les constats, preuves, réserves et
l’ordre de migration sont dans **`AUDIT-2026-09-14.md`**. La base réelle a été
consultée en lecture seule ; les FK RIVEN 0025 sont déjà appliquées. Ne pas
rejouer cette ancienne action. Le go SQL/fusion reste requis ; aucun jalon
produit n’a été rouvert. Les autres dépôts et Notion n’ont pas été synchronisés.

### 2026-09-05 (fin) — la semaine est fermée, et quatre notes fausses avec elle

Table de marche exécutée jusqu'au bout : **10 PR fusionnées** (RenoDevis #127
#128 #129 #130 · RenoAgenda #68 #69 #70 · RenoBoost #348 #351 #352 #353 · Ultima
#192 #193 #194 #195), **une fermée sans fusion** (RenoBoost #349 — après
réconciliation avec `main`, le diff était **vide** : `main` portait déjà les deux
récits, mesuré et non supposé), **zéro PR ouverte à la clôture**, et
`node finubar/collecter.mjs` qui ne signale plus **ni dérive ni troncature** sur
les cinq dépôts attachés. Reprise déposée dans
**`REPRISE-2026-09-05-apres-la-semaine.md`**.

⛔ **Le vrai gain de la séance n'est pas le code livré — c'est quatre notes
fausses trouvées et corrigées.** Une note fausse coûte plus cher qu'une note
absente : on ne la rejoue pas, puisqu'on la croit.

1. **ACQ-2b** annoncé « à faire » était **livré** depuis `4f4733f` — je l'aurais
   réécrit.
2. **L3 / L4** (RenoDevis) annoncés « restent » sont **gelés à dessein** jusqu'à
   la mesure L5 — je les aurais codés contre la décision de Paul.
3. **La panne RLS de RenoAgenda** annoncée « correctif non appliqué » était
   **réparée** : 0 policy ne lit `auth.users`, sonde éprouvée d'abord sur un cas
   dont on connaissait la réponse (22 policies, 13 citent `auth.uid`).
4. **Mon propre correctif E1**, dans sa première version, poussait la liste
   *filtrée* : sur les 23 lignes réelles de `kv_store` il aurait **écrasé 109
   fiches par 11**, et le pull suivant aurait ramené la perte en local. Corrigé
   en refus **total** de la clé — et ce défaut n'a été vu ni par la revue ni par
   les tests unitaires, mais par le **dry run contre les données réelles**.

⚠️ **Ce qui reste ouvert et n'est pas refermable ici.** Le `kv_store` central
porte **249 fiches dont 238 appartiennent à d'autres comptes, et aucune à son
propre propriétaire** — recouvrement nul, sur des `_owner_id` qui sont de vrais
comptes `auth.users`. E1 rend le cas **inoffensif**, il ne l'**explique pas** :
c'est la première question de la prochaine séance. Et les **16 branches mortes**
restent : `git push --delete` rend **403** depuis une séance et **aucun outil de
suppression de branche n'existe** (create / list / update, pas delete) — établi,
mesuré, à faire sur la machine de Paul.

⚠️ **Trois instruments pris en défaut le même jour**, tous de la même famille :
un script de purge qui comparait **deux pointes** (`git diff origin/main
<branche>`) et annonçait « 2576 suppressions » sur des branches qui ne portaient
rien ; un « 168 caractères » annoncé sans être mesuré, qui en faisait **198** ;
un fichier local pris pour la branche distante. *Corollaire, encore : une
longueur s'assert avant d'être écrite, jamais après.*

### 2026-09-05 (suite) — la semaine est inventoriée, et elle se ferme dans une seule séance

Paul : *« beaucoup de sessions ouvertes sur ces mêmes repos… tout compiler pour
avancer dans une seule session, étape par étape, ne rien perdre, boucler tout
ce qui a été lancé depuis lundi »*. Inventaire fait **aux sources** (13 séances
depuis le 31/08, PR ouvertes des 8 dépôts, diff réel de chaque branche vivante,
grain JSON des 5 dépôts) et compilé dans
**`PLAN-2026-09-05-boucler-la-semaine.md`** — une table de marche qui indexe
les roadmaps, elle ne les recopie pas.

Ce que l'inventaire a établi : **5 PR ouvertes nées cette semaine** (#127, #68,
#348, #349, #192 — plus #15 sur artisan-builder dont la séance tourne encore),
**12 branches mortes** dont le contenu est prouvé sur main, **un grain RenoBoost
plus récent sur sa branche que sur main** (#349, à concaténer avec celui du
radar #346 — mergé par Paul à 11:48 pendant l'inventaire), et **8 gestes qui
n'attendent que Paul**, dont trois ouverts depuis août. Trois POV posés
(adversaire, mainteneur, mentor), pre-mortem à six risques. Étapes 1 à 3
gatées : GO de Paul.

### 2026-09-05 — ADRAMELECH capture une reprise d'entreprise, et refuse de la scorer

Dictée de Paul : la **reprise d'une société existante** de climatisation,
ventilation et travaux tous corps d'état, née d'une discussion avec **Julien
Laudy** (mentor des affaires de Paul, pro DOKLÈS) autour de la société
**Fahrenheit**. La dictée disait « Julien Ramsé » — corrigé par Paul le jour même. Capturée en **ADR-010**, nom de registre proposé
**VESTA** — la déesse du foyer, dont les Vestales n'allumaient pas le feu mais
l'entretenaient et se le transmettaient : le geste exact d'une reprise, et un
registre thermique qui répond au métier. ⏳ Le nom reste **à acter par Paul**.

**Ce qui a été classé** : quadrant ADRAMELECH (capture), ancrages RIVEN (la
relation) et NICOL BOLAS (une acquisition est un acte financier) ; type business,
croissance externe ; rôle **multiplicateur par acquisition** — VESTA ne
concurrence pas Renoboost IA, elle **achète d'un coup ce que le socle construit
lentement** (clients, équipes, agréments, parc à entretenir).

**Le pont qui structure la fiche** : VESTA est **la voie d'exécution alternative
de PROTÉE (ADR-002)** — même destination, moyen opposé, bâtir contre acheter. Et
elle donne au simulateur NICOL BOLAS de VERTUMNE (ADR-007, bloc G) une **seconde
entrée : reprendre**, à côté de créer. Le parc d'entretien repris tombe
directement dans **Ripair et Foresight** (RénoPredict), qui tournent aujourd'hui
sans portefeuille.

⛔ **Et ce qui n'a PAS été fait, délibérément : la grille des 7 blocs.** Elle
demande un business model chiffré et un score pondéré. Sur une **reprise**, le
prix, les comptes, l'effectif et la part de récurrent ne sont pas des hypothèses
raisonnables à poser — ils **existent réellement chez le vendeur** et se
demandent. Un score fabriqué sur ce vide aurait eu l'exacte apparence des six
autres lignes du classement, et il aurait été **cru**. La ligne du tableau porte
donc « à instruire » et aucun rang. C'est la règle du registre appliquée à
lui-même : *une preuve fausse coûte plus cher qu'une preuve absente.*

✅ **Paul a tranché dans la foulée : le « Julien » de PROTÉE est Julien Laudy.**
ADR-002 et ADR-010 se lisent donc comme un seul dossier à deux voies (bâtir /
acheter), chaque fiche gardant son score et ses risques propres. ⏳ **Reste à
acter le nom VESTA.** Trois zones dictées
restent marquées ⚠️ dans la fiche, non déduites : l'orthographe et le rôle de
Fahrenheit, et le segment « en tout temps France », consigné mot pour mot comme l'avait été
« avec mon dpe.fr » pour VITRUVE.

✅ **Les deux dettes de la passe sont soldées dans ce commit.**
`dernier_arret.commit` portait `32a816b`, que `git cat-file` déclare *Not a valid
object name* — un orphelin du squash de la PR #190, donc une empreinte qui ne
recalait plus rien. Remplacé par **`b500a42`**, tête réelle de `main` (PR #191),
vérifiée ancêtre de la branche. ⏳ Recalage habituel à faire après le squash de
cette PR, comme aux #181, #183, #186 et #188.
Et **`carto-idees.html` a été régénérée** (`node adramelech/generer-carto.mjs`) :
*10 idées, 5 archipels, 28 ponts* — VESTA prend place dans l'archipel **Bâtiment**
avec 7 ponts (001, 002, 003, 004, 006, 007, 009). `tests/unit-carto-generee.mjs`,
qui fige les données de référence du registre, a été mis à jour en conséquence —
et porte désormais un `!cles.has('ADR-005|ADR-010')` : la fiche ne cite pas
CHAMBRE CLAIRE, et le test mesure le registre au lieu de supposer ses voisins.

### 2026-09-03 — Finubar cesse d'être un journal

Constat de Paul en regardant l'écran : *« les éléments écrits sur Finubar sont
très longs »*. Mesuré avant de toucher quoi que ce soit, et le chiffre tranche :
`dernier_arret.quoi` valait **exactement 400** — la borne haute du moteur — sur
les **cinq** grains lus. Autrement dit coupé au milieu d'une phrase sur les cinq,
et rien ne le disait. En source, RénoBoost portait 2 075 caractères dans ce seul
champ, 1 444 dans `prochaine_action` et ~4 000 dans `bloque_par` ; l'écran, lui,
dépliait d'office huit boucles ouvertes, soit près de 3 000 caractères de plus.

**La cause n'était pas l'affichage** : `boucles_ouvertes` était devenu le
dépotoir des leçons de séance. C'est le mode de défaillance n° 2 du pre-mortem du
cadrage — *« Finubar devient une 22ᵉ roadmap »* — et la borne à 400 ne l'a pas
empêché : elle l'a rendu **invisible** en tronquant.

**G1 — l'écran se resserre.** Les boucles ouvertes passent dans un `<details>`
replié, résumé par leur compte. Elles ne sont pas retirées : une boucle ouverte
qui disparaît se lit comme une boucle fermée (règle ⑤).

**G2 — les grains rétrécissent.** `MAX_RECIT = 180` s'applique à
`dernier_arret.quoi`, `prochaine_action`, `bloque_par[]` et
`boucles_ouvertes[].quoi`. La coupe se fait **au mot** (une coupe au caractère se
lit comme un fichier corrompu) et surtout elle **se nomme** : `lireGrain` rend la
liste des champs coupés et la collecte les affiche, dépôt par dépôt. Sans ce cri,
les grains regonfleraient et le moteur les rognerait en silence — exactement
l'état trouvé ce matin. C'est la règle du 2026-08-17 appliquée à Finubar
lui-même : *un filtre qui exclut des cas doit compter et nommer ce qu'il exclut*.

Les cinq grains ont été réécrits, leur détail descendu dans le journal de chaque
dépôt. Trois boucles ont été **fermées au passage, en les relisant** : les QR de
RénoBoost (« l'URL vaut `window.location.origin` ») étaient corrigés depuis le
01/09 — le grain le disait lui-même deux champs plus bas ; T2 et R0a de RénoDevis
s'ouvraient sur un « ✅ ».

⚠️ **Et la leçon de la séance porte sur le harnais, pas sur le produit.** Le test
de la borne était **vert au premier jet**, y compris quand on portait `MAX_RECIT`
à 99 999 et quand on remplaçait la coupe au mot par une coupe au caractère. Deux
défauts, la même famille : ① les longueurs et le seuil attendus étaient **dérivés
de la constante testée**, donc la sonde se recalibrait sur son objet ; ② le texte
d'épreuve (« mot mot mot… », période 4) avait une frontière de mot pile à la
180ᵉ position, si bien qu'une coupe brutale y tombait juste **par chance**. La
valeur attendue est désormais écrite **en dur** (181) et le cas est **construit**
pour que la 180ᵉ position tombe au milieu d'un mot — ce qu'une assertion vérifie
avant de s'en servir. Les trois fautes injectées rougissent maintenant, chacune
là où elle casse.

**Les deux leçons qui encombraient `boucles_ouvertes` se rangent ici** — ce sont
des règles de conduite, pas des boucles à fermer :

> ⚠️ LA LEÇON DE LA SÉANCE, et elle a failli être écrite à l'envers : j'ai d'abord conclu que « l'agrégat ment » sur la foi d'un `git rev-list` brut qui comptait les commits de recalage de grain. `collecter.mjs` les exclut explicitement — la mesure était juste, l'instrument fautif était le mien. Avant d'accuser une sonde, lui demander CE qu'elle compte : c'est le pendant de la règle du 17/08 (« demander à une mesure ce qu'elle répond sur un cas dont on connaît la réponse »), vue depuis l'autre bout

> ⚠️ LA LEÇON DU 02/09, à ne pas reperdre : une mesure qui ne peut PAS voir quelque chose doit le dire comme tel, jamais le rendre en constat. La collecte annonçait trois grains manquants qui existaient tous — et le message invitait à aller semer ce qui était déjà semé. Même famille que la règle du 2026-08-21 (« quand on ne PEUT pas vérifier de ce côté-là, on retire l'hypothèse au lieu de la documenter ») et que celle du 2026-08-17 (« un filtre qui exclut des cas doit compter et nommer ce qu'il exclut »). Toute nouvelle sonde de Finubar se relit à travers celle-ci

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
