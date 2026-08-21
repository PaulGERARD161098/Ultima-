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
    "le": "2026-08-21",
    "quoi": "Finubar livré et poussé sur les 8 dépôts : moteur pur + harnais (éprouvé rouge puis vert), collecte avec mesure de dérive, rappel d'ouverture de séance, écran /finubar. Patrimoine complet vert (88 sections). Puis diagnostic complet : dix écarts corrigés, dont une lecture publique de macro.json et un import non éprouvé côté route. Dry run 19/19, patrimoine 88 sections.",
    "commit": "eaad5d5"
  },
  "prochaine_action": "⛔ LES DEUX VÉRIFICATIONS DE LA FUSION, avant tout autre travail. (1) Recaler les 8 grains sur `main` : la fusion s'est faite en SQUASH, donc chaque `dernier_arret.commit` pointe dans le vide — le rappel de chaque dépôt le dira lui-même à l'ouverture. (2) Vérifier en conditions RÉELLES que `/finubar/macro.json` et `/api/_lib/finubar-macro.mjs` refusent bien, et que `/finubar` répond : c'est la seule vérification du lot qui n'a jamais pu être faite (egress bloqué dans le bac à sable, 403 du proxy).",
  "bloque_par": [
    "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
    "`ANTHROPIC_API_KEY` en env Vercel",
    "Les advisors Supabase post-DDL",
    "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
  ],
  "en_attente_depuis": "2026-08-20",
  "boucles_ouvertes": [
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
  "maj": "2026-08-21"
}
```

<!-- finubar:fin -->

## Journal de reprise

> Les séances, de la plus récente à la plus ancienne. Une entrée = une date, un
> fait vérifié, une décision. La mémoire longue ; le bloc ci-dessus est la mémoire
> courte, et c'est lui qui est lu automatiquement.

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
