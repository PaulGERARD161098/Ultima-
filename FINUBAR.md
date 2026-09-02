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
  "rattache_a": "CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md · CADRAGE-LV6-CIEL-VIVANT.md",
  "etat": "en_cours",
  "jalon": {
    "nom": "FINUBAR — le pilotage des huit dépôts en un seul endroit",
    "critere_de_sortie": "les 8 grains lus par la collecte, le rappel d'ouverture de séance actif dans les 8 dépôts, l'écran /finubar en ligne"
  },
  "dernier_arret": {
    "le": "2026-09-02",
    "quoi": "LA COLLECTE NE CONFOND PLUS « PAS LU » AVEC « ILLISIBLE », et c'est le fait principal. Elle lit le disque ; une séance ne clone que les dépôts qui lui sont attachés, et les autres tombaient dans la branche « FINUBAR.md absent » — un constat SUR LE DÉPÔT là où il n'y avait qu'un angle mort de l'observateur. Ce matin-là elle annonçait « 3 projets sans grain lisible » : les trois grains existaient, intacts (mon-dpe.fr et artisan-builder relus sur GitHub, ripair non attachable en cross-tier), et deux de ces dépôts n'avaient même pas bougé depuis le 21/08. Deux compteurs séparés désormais (`illisibles` et `hors_seance`), un motif distinct, un libellé d'écran qui n'accuse plus le dépôt — et le hors-séance RESTE affiché, car sortir du compte ne doit jamais valoir sortir de la liste. C'est la tension que le harnais §5bis verrouille, avec son cas de référence sans hors-séance. Posé au passage : la routine « Finubar — récap du matin » (8 h, heure de Paris, push + e-mail), qui porte la même leçon dans son prompt.",
    "commit": "à recaler à la fusion"
  },
  "prochaine_action": "Recaler les grains de `mon-dpe.fr` et `artisan-builder` : leurs `dernier_arret.commit` (b5c0a72, 1924e58) ne sont pas leurs têtes réelles (9f8f0b7, 3ee806d) — reliquat du squash-merge du 21/08, et ces deux dépôts n'ont pas bougé depuis. ⚠️ Les 5 dépôts attachés, eux, sont RECALÉS : mesuré le 02/09, `commits_depuis = 0` et commit retrouvé sur les cinq — cette moitié de la vérification du 21/08 est close. `ripair` reste hors de portée (autre propriétaire, `add_repo` refuse le cross-tier), donc jamais mesurable depuis une séance RénoBoost",
  "bloque_par": [
    "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
    "`ANTHROPIC_API_KEY` en env Vercel",
    "Les advisors Supabase post-DDL",
    "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
  ],
  "en_attente_depuis": "2026-08-20",
  "boucles_ouvertes": [
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
      "quoi": "La constellation : faire entrer les projets dans le ciel — arbitré par Paul le 21/08 (« tout projet d'ampleur doit y être, on en reparle »), volontairement reporté. `versConstellation()` est écrit et testé, branché sur aucune page",
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
