// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-09-13",
  "projets": [
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoBoost",
      "grain": {
        "projet": "RénoBoost",
        "depot": "PaulGERARD161098/RenoBoost",
        "cap": "Un individu seul fait tourner le business entier, aidé par l'automatisation (Directive IA). RénoBoost est le hub : acquisition, rendez-vous, dashboard, et la roadmap maîtresse des quatre briques.",
        "rattache_a": "ROADMAP-SECURITE.md · REPRISE-2026-09-05-landing-forme.md · REPRISE-2026-09-03-boucles-ete.md · ROADMAP-MASTER.md · ACTIONS-PAUL.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-09-11",
          "quoi": "Audit sécurité : 8 lots livrés, fusionnés, en production. Détail ROADMAP-SECURITE.md (S7, S8). Deux gestes de Paul restent ouverts.",
          "commit": "1da0e80"
        },
        "prochaine_action": "Paul : appliquer la migration revoke (voie UUID) puis lire les rapports CSP. Détail en tête d'ACTIONS-PAUL.md.",
        "bloque_par": [
          "Migration revoke : la voie UUID des devis (ACTIONS-PAUL.md, en tête) — 11/09",
          "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09",
          "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09",
          "Valider la fiche Google Business (ACTIONS-PAUL.md §1) — ouverte depuis le 04/08",
          "Imprimer un lot de stickers QR (ACTIONS-PAUL.md §2) — reporté par Paul le 07/09",
          "Embarquement Stripe de SOLA (ACTIONS-PAUL.md §3)",
          "Accès Google Ads Basic (ACTIONS-PAUL.md §5) — relance le 03/10"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "⛔ LE RULESET DE main NE MORD PAS — mesuré deux fois le 11/09. Posé par Paul, il laisse merger une PR dont la CI échoue. Enforcement status à passer à « Active », contrôle requis…",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "Travail multi-agents sans propriétaire de fichier : 2 séances sur RenoBoost le 11/09, toutes sous paggerard-boop, donc aucune revue croisée possible (GitHub interdit d'approuver…",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "Audit sécurité : 8 lots en production, gardés par 6 harnais de comportement. Restent 2 gestes de Paul (ACTIONS-PAUL.md) et le backlog mesuré (ROADMAP-SECURITE.md).",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "✅ FERMÉE le 07/09 — la cause n'était pas la CSS mais une injection HTML : les initiales d'avatar sortaient brutes d'un nom venu de GoHighLevel. La leçon qui reste : une donnée de…",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "Landing : lot 1 « retenue » fait (07/09). Restent lot 2 (photo en hero, attend la séance photo) et lot 3 (sections R1 : centrage, cartes uniformes). Cadrage 2026-09-07. 08/09…",
            "depuis": "2026-09-06"
          },
          {
            "quoi": "L'API GHL rend 401 sur les champs personnalisés à chaque synchro depuis le 03/09 : `ghl_custom_fields` vide. Les contacts passent — portée de jeton, pas panne",
            "depuis": "2026-09-05"
          },
          {
            "quoi": "Radar BTP : R-1 à R-4 livrés, migration appliquée, R-3 l'ingesteur écrit et câblé. ⏳ NE RESTE QUE L'ACCÈS BASIC (17/09 inquiétude, 03/10 relance) — plus une seule ligne de code à…",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "ALT-A1/ALT-A3 ouverts (qui reçoit quoi ; sortir Henri de la supervision technique). ⚠️ La PR #304 qui les portait est MERGÉE depuis le 31/08 — le doc vivant est…",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "Un interrupteur système dans un `kv_store` par utilisateur, lu au `rows[0]` : il dépend du compte qui répond en premier et meurt avec lui. Sa place est `sentinelle_etat`",
            "depuis": "2026-09-04"
          },
          {
            "quoi": "`/api/digest` rend 200 sans battement ni log quand la veille est inactive : c'est ce silence qui a caché la panne. Un cron muet et un cron mort doivent se distinguer",
            "depuis": "2026-09-04"
          }
        ],
        "maj": "2026-09-07"
      },
      "recits": [
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": true,
      "derive": {
        "tete": "23e7b95",
        "tete_le": "2026-09-11T15:48:55+02:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "reprise": true,
      "mesure_le": "2026-09-11",
      "jours_depuis_maj": 6,
      "jours_en_attente": 40,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/artisan-builder",
      "grain": {
        "projet": "artisan-builder",
        "depot": "PaulGERARD161098/artisan-builder",
        "cap": "Un artisan a son site vitrine en ligne en quelques minutes : il décrit son activité, les textes sont générés, les sections et le thème se règlent sans écrire de code. Depuis le 2026-09-11, la chaîne qui porte ce cap est le Studio (SiteSpec/blocks), pas le wizard.",
        "rattache_a": "CADRAGE-AB-MULTIACTIVITE-2026-09-11.md (la carte du dépôt et le plan AB1→AB5 du chantier multi-activité) · CADRAGE-REPRISE-AB1-STUDIO.md (la reprise cadrée : décisions actées, AB1 au format 6 points) · CADRAGE-REPRISE-07-09.md (l'état cadré du 2026-09-07 : ce qui bloque, de qui, et pourquoi on attend) · CRITIQUE-DESIGN-SPC-2026-09-11.md (les 8 constats design mesurés sur la page SPC, banc Refero) ",
        "etat": "en_cours",
        "jalon": {
          "nom": "Faire du Studio la base du générateur : plusieurs activités, intentions explicites, contexte conservé jusqu'à la demande (dossier 1)",
          "critere_de_sortie": "Les six lots AB0→AB5 fermés, chacun sur son critère écrit dans CADRAGE-AB-MULTIACTIVITE-2026-09-11.md. AB0 est fait. Le jalon « publication SPC » n'est pas abandonné : il reste bloqué par 7 informations qui n'appartiennent pas au dépôt, et aucune ligne de ce chantier n'en fait tomber une."
        },
        "dernier_arret": {
          "le": "2026-09-13",
          "quoi": "Chantier multi-activité FERMÉ (AB0→AB5). Passation éprouvée par une séance indépendante : verdict NON, 11 points corrigés dont 2 défauts de garde. 204 tests.",
          "commit": "b826914"
        },
        "prochaine_action": "SI EZZEDINE NE RÉPOND PAS : seconde épreuve du document de passation par une séance neuve. Sa version corrigée n'a pas été suivie. Porter sur le §9.",
        "bloque_par": [
          "EZZEDINE — assureur décennale, numéro de police, couverture géographique. Obligations d'affichage, rien ne les remplace.",
          "EZZEDINE — le téléphone réel. DEUX champs : `site.telephone` ET `site.telephoneHref`, que la garde exige désormais cohérents.",
          "EZZEDINE — de vrais avis obtenus avec accord (`publication.avisReels`). Les avis en ligne sont fictifs : publier serait trompeur.",
          "EZZEDINE — relecture des textes de chantiers (`publication.textesConfirmes`). Détail dans CADRAGE-REPRISE-07-09.md.",
          "EZZEDINE — le NOM du domaine. C'est son enseigne et son référencement. Disponibilité mesurée le 2026-09-07.",
          "PAUL — achat du domaine puis NEXT_PUBLIC_SITE_URL en env Vercel, APRÈS réponse d'Ezzedine. Action payante ET credential.",
          "PAUL — appliquer supabase/migrations/0004_leads_contexte.sql. Additive, 4 colonnes nullables. Gate, sans exception.",
          "RÉSERVE, pas un blocage : l'adresse du siège est une DOMICILIATION (SOFRADOM). Voir le README du site, §Ce qui bloque."
        ],
        "en_attente_depuis": "2026-08-21",
        "boucles_ouvertes": [],
        "maj": "2026-09-13"
      },
      "recits": [],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "ba1e36b",
        "tete_le": "2026-09-13T16:28:28+00:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-13",
      "jours_depuis_maj": 0,
      "jours_en_attente": 23,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/Ultima-",
      "grain": {
        "projet": "Ultima",
        "depot": "PaulGERARD161098/Ultima-",
        "cap": "Ultima est l'unique interface de travail de Paul (Directive JL) : elle absorbe toute sa data, la dispatche, la navigue — avec Léo pour seule interlocutrice. Rien d'autre ne sera créé : tout nouveau besoin est une extension d'Ultima.",
        "rattache_a": "REPRISE-2026-09-06-leo-partout-mail-matin.md · REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "J3 — le ciel porte aussi l'état PERSONNEL (P4 : les signaux du cockpit)",
          "critere_de_sortie": "ALTHEA en sommeil, idées orphelines et relances dues appellent sur le MÊME ciel et avec la MÊME couleur que les dépôts — un seul fetch, une seule règle de priorité. ⛔ N'ouvre qu'après que P3 ait vécu et que Paul ait dit ce que l'accueil lui fait"
        },
        "dernier_arret": {
          "le": "2026-09-13",
          "quoi": "Leçons v8 propagées dans les sept dépôts atteignables, sceau vérifié sur main partout. Le rappel Finubar, lui, était DÉJÀ aligné : la note demandait de réparer ce qui l'était.",
          "commit": "753d2fb"
        },
        "prochaine_action": "Plus aucune propagation en attente. Reprendre le jalon J3 du cockpit. Seul ripair reste en v7, et il est inatteignable depuis une séance ouverte sur les dépôts de PaulGERARD161098.",
        "bloque_par": [
          "Vérifier `renoboostia.fr` sur resend.com/domains — sans ça le mail du matin ne peut partir QU'à paul.gerard@renoboostia.fr",
          "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation",
          "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
          "Les advisors Supabase post-DDL",
          "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "MESURÉ le 13/09 et démenti : la note annonçait des copies divergentes du rappel Finubar. Les sept fichiers ont la même empreinte. Voir CADRAGE-FINUBAR.md.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "COLLECTE — `collecter.mjs` VIDE le grain d'un dépôt hors séance au lieu de garder sa dernière mesure. Cran de sûreté posé le 07/09 (refus d'écrire) ; la FUSION reste à faire.",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "ripair (paggerard-boop) reste en LEÇONS v7 : une séance ouverte sur les dépôts de PaulGERARD161098 ne peut pas l'atteindre. Angle mort connu, pas un oubli.",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "Aucun contrôle croisé ne compare la copie des leçons d'un dépôt à sa source : le sceau rend la divergence VISIBLE, il ne la corrige pas. `head -1` la montre.",
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
          }
        ],
        "maj": "2026-09-13"
      },
      "recits": [],
      "ciel": "racine",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-13",
      "jours_depuis_maj": 0,
      "jours_en_attente": 24,
      "rang": 2
    },
    {
      "ok": false,
      "hors_seance": true,
      "reprise": false,
      "motif": "dépôt non attaché à cette séance",
      "depot": "paggerard-boop/ripair",
      "ciel": "alpha",
      "grain": null,
      "derive": null,
      "mesure_le": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "reprise": false,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/mon-dpe.fr",
      "ciel": "alpha",
      "grain": null,
      "derive": null,
      "mesure_le": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "reprise": false,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/RenoAgenda",
      "ciel": "renoboost-ia",
      "grain": null,
      "derive": null,
      "mesure_le": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "reprise": false,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/RenoDevis",
      "ciel": "renoboost-ia",
      "grain": null,
      "derive": null,
      "mesure_le": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "reprise": false,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/RenoPredict",
      "ciel": "renoboost-ia",
      "grain": null,
      "derive": null,
      "mesure_le": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    }
  ],
  "macro": {
    "total": 8,
    "lisibles": 3,
    "illisibles": 0,
    "hors_seance": 5,
    "repris": 1,
    "en_cours": 2,
    "en_attente_de_paul": 1,
    "au_repos": 0,
    "derives": 2,
    "commits_inconnus": 0,
    "boucles_ouvertes": 20,
    "gestes_de_paul": [
      {
        "projet": "RénoBoost",
        "geste": "Migration revoke : la voie UUID des devis (ACTIONS-PAUL.md, en tête) — 11/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Valider la fiche Google Business (ACTIONS-PAUL.md §1) — ouverte depuis le 04/08"
      },
      {
        "projet": "RénoBoost",
        "geste": "Imprimer un lot de stickers QR (ACTIONS-PAUL.md §2) — reporté par Paul le 07/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Embarquement Stripe de SOLA (ACTIONS-PAUL.md §3)"
      },
      {
        "projet": "RénoBoost",
        "geste": "Accès Google Ads Basic (ACTIONS-PAUL.md §5) — relance le 03/10"
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — assureur décennale, numéro de police, couverture géographique. Obligations d'affichage, rien ne les remplace."
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — le téléphone réel. DEUX champs : `site.telephone` ET `site.telephoneHref`, que la garde exige désormais cohérents."
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — de vrais avis obtenus avec accord (`publication.avisReels`). Les avis en ligne sont fictifs : publier serait trompeur."
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — relecture des textes de chantiers (`publication.textesConfirmes`). Détail dans CADRAGE-REPRISE-07-09.md."
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — le NOM du domaine. C'est son enseigne et son référencement. Disponibilité mesurée le 2026-09-07."
      },
      {
        "projet": "artisan-builder",
        "geste": "PAUL — achat du domaine puis NEXT_PUBLIC_SITE_URL en env Vercel, APRÈS réponse d'Ezzedine. Action payante ET credential."
      },
      {
        "projet": "artisan-builder",
        "geste": "PAUL — appliquer supabase/migrations/0004_leads_contexte.sql. Additive, 4 colonnes nullables. Gate, sans exception."
      },
      {
        "projet": "artisan-builder",
        "geste": "RÉSERVE, pas un blocage : l'adresse du siège est une DOMICILIATION (SOFRADOM). Voir le README du site, §Ce qui bloque."
      },
      {
        "projet": "Ultima",
        "geste": "Vérifier `renoboostia.fr` sur resend.com/domains — sans ça le mail du matin ne peut partir QU'à paul.gerard@renoboostia.fr"
      },
      {
        "projet": "Ultima",
        "geste": "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation"
      },
      {
        "projet": "Ultima",
        "geste": "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)"
      },
      {
        "projet": "Ultima",
        "geste": "Les advisors Supabase post-DDL"
      },
      {
        "projet": "Ultima",
        "geste": "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
      }
    ]
  },
  "cartouche": {
    "signaux": [
      {
        "projet": "RénoBoost",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "artisan-builder",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "Ultima",
        "dit": "arrêté sur : Leçons v8 propagées dans les sept dépôts atteignables, sceau vérifié sur main partout. Le rappel Finubar, lui, était DÉJÀ aligné : la note demandait de réparer ce qui l'était.",
        "pourquoi": "en_cours"
      }
    ],
    "action": {
      "projet": "RénoBoost",
      "nature": "geste",
      "faire": "Migration revoke : la voie UUID des devis (ACTIONS-PAUL.md, en tête) — 11/09",
      "cap": "Un individu seul fait tourner le business entier, aidé par l'automatisation (Directive IA). RénoBoost est le hub : acquisition, rendez-vous, dashboard, et la roadmap maîtresse des quatre briques."
    },
    "illisibles": 0,
    "hors_seance": 5
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
        "constellation": "en_attente_de_paul",
        "ciel": "renoboost-ia",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/artisan-builder",
        "libelle": "artisan-builder",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/Ultima-",
        "libelle": "Ultima",
        "constellation": "en_cours",
        "ciel": "racine",
        "signal": 0
      }
    ],
    "relations": []
  }
};
