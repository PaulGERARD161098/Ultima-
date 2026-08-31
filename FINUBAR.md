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
    "le": "2026-08-31",
    "quoi": "L'isolement du ciel, resserré par Paul à UN SEUL ÉTAGE : isoler un nœud peint ses enfants DIRECTS et eux seuls (NAGA → IMLADRIK, ADRAMELECH, TAO), et cliquer l'un d'eux descend d'un cran de plus — la profondeur est contingente à ce qu'il y a dedans, le geste identique à tous les étages. Deux suites obligées : le groupement par tête retiré, la passerelle RESHIRAM ⇄ ZEKROM descendue sous TAO. Le pire cas construit a été RECALCULÉ (24 enfants directs) et non relancé : à un étage, l'ancien n'aurait peint que 4 étoiles sous un intitulé annonçant 24. Six verdicts éprouvés rouges avant d'être crus, dont un d'ABSENCE ; mesure neuve : la récursion dans le navigateur. Patrimoine complet : 18 harnais, zéro échec.",
    "commit": "639c2d6"
  },
  "prochaine_action": "Le retour de Paul sur l'isolement à un étage (liens page par page dans le rapport de séance) et son go pour fusionner la PR #179 — la fusion est une gate. À défaut, reprendre les DEUX vérifications Finubar de la fusion du 21/08, qui n'ont TOUJOURS pas été faites : (1) recaler les grains des 7 autres dépôts sur `main`, (2) éprouver en conditions RÉELLES que /finubar/macro.json et /api/_lib/finubar-macro.mjs refusent et que /finubar répond.",
  "bloque_par": [
    "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
    "`ANTHROPIC_API_KEY` en env Vercel",
    "Les advisors Supabase post-DDL",
    "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
  ],
  "en_attente_depuis": "2026-08-20",
  "boucles_ouvertes": [
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
  "maj": "2026-08-31"
}
```

<!-- finubar:fin -->

## Journal de reprise

> Les séances, de la plus récente à la plus ancienne. Une entrée = une date, un
> fait vérifié, une décision. La mémoire longue ; le bloc ci-dessus est la mémoire
> courte, et c'est lui qui est lu automatiquement.

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
