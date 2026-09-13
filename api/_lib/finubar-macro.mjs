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
      "hors_seance": true,
      "reprise": true,
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
      "depot": "PaulGERARD161098/RenoBoost",
      "grain": {
        "projet": "RénoBoost",
        "depot": "PaulGERARD161098/RenoBoost",
        "cap": "Un individu seul fait tourner le business entier, aidé par l'automatisation (Directive IA). RénoBoost est le hub : acquisition, rendez-vous, dashboard, et la roadmap maîtresse des quatre briques.",
        "rattache_a": "ROADMAP-2026-09-13-soir-fin-de-session.md (§7 = le plus récent) · CADRAGE-2026-09-13-boussole.md · BOUSSOLE-recherches-google.pdf · ROADMAP-SECURITE.md · ROADMAP-MASTER.md · ACTIONS-PAUL.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-09-13",
          "quoi": "Revue adverse de ChatGPT triée puis appliquée : 8 défauts actifs fermés, 5 « exigences » écartées comme specs. Détail : ROADMAP §7 et PR #432/#433.",
          "commit": "8757733"
        },
        "prochaine_action": "⛔ NE RIEN CODER. Mesure d'ouverture : select count(*) from paiements. Goulot inchangé : 2 variables Vercel + KYC SOLA. Reprise complète : ROADMAP-2026-09-13-soir §7.6.",
        "bloque_par": [
          "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09",
          "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09",
          "Valider la fiche Google Business (ACTIONS-PAUL.md §1) — ouverte depuis le 04/08",
          "Imprimer un lot de stickers QR (ACTIONS-PAUL.md §2) — reporté par Paul le 07/09",
          "Embarquement Stripe de SOLA (ACTIONS-PAUL.md §3)"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "⏳ ATTEND PAUL — 2 fragments de dictée non interprétés (« campagnes d'obligations », « quand on en ligne ne trouve pas »). Sans eux, aucune source ne bouge.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "📋 LA BOUSSOLE RESTE CADRÉE, PAS COMMENCÉE. Veille, calendrier daté, plancher, annotations = des SPECS, pas des correctifs. CADRAGE-2026-09-13-boussole.md.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⚠️ LA BOUSSOLE EST CADRÉE, PAS COMMENCÉE — CADRAGE-2026-09-13-boussole.md. Son étape A ne produit AUCUN écran et passe pourtant devant tout : mesurer combien de mois Google peut…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⚠️ GESTE DE SÉCURITÉ NON CONFIRMÉ — le refresh token Google Ads est apparu EN CLAIR sur une capture d'écran le 07/09 et n'a jamais été confirmé régénéré. Tant qu'il ne l'est pas…",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "⛔ LEÇON DU 13/09 — UN REVOKE SUR LES RÔLES NOMMÉS NE RÉVOQUE RIEN. `revoke all on function ... from anon, authenticated` a rendu success:true et n'a rien fait : `create function`…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⚠️ OUVERT, NOMMÉ, NON TRAITÉ — le bruit de fond de Google. 89,6 % des lignes de l'Oise valent 0 ou 10 par mois (134 372 à zéro, 167 839 à dix). La coupe au top-3000 les écarte de…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⚠️ CE QUE LE « 0 » DU CONTRASTE NE COUVRE PAS, et qu'il ne faut pas lire comme « le dashboard est accessible » : 59 textes sur DÉGRADÉ sont hors de portée de la sonde par…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⛔ LEÇON DU 13/09 SOIR — ÉLARGIR UN GARDE-FOU EST UN GESTE DANGEREUX EN SOI. La regex de langage-encres ne voyait pas color: var(--primary-dark) (sky-600, 4,10:1) : le suffixe lui…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⛔ LEÇON DU 13/09 — UNE MESURE JUSTE N'EST PAS UNE CONCLUSION JUSTE. Mesuré que le repli d'A1 décidait de 100 % des dossiers (171 clients sur 171 sans origine) : exact. Conclu…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⛔ LEÇON DU 13/09 — MES PROPRES SONDES ONT MENTI QUATRE FOIS DANS LA JOURNÉE : pages ouvertes en file:// alors que leurs feuilles sont en racine-relatif (9 verdicts verts sur des…",
            "depuis": "2026-09-13"
          }
        ],
        "maj": "2026-09-13"
      },
      "recits": [
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
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
      "jours_en_attente": 40,
      "rang": 1
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
          "quoi": "LEÇONS v16 (sceau 4528d4b8af12) : 7 leçons de la première revue adverse externe. Détail : memoire/LECONS.md §1, §2, §3.",
          "commit": "3f71e6a"
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
    "derives": 1,
    "commits_inconnus": 0,
    "boucles_ouvertes": 20,
    "gestes_de_paul": [
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
        "projet": "artisan-builder",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoBoost",
        "dit": "attend un geste : Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09 — ouvert depuis 40 j",
        "pourquoi": "attente"
      },
      {
        "projet": "Ultima",
        "dit": "arrêté sur : LEÇONS v16 (sceau 4528d4b8af12) : 7 leçons de la première revue adverse externe. Détail : memoire/LECONS.md §1, §2, §3.",
        "pourquoi": "en_cours"
      }
    ],
    "action": {
      "projet": "artisan-builder",
      "nature": "code",
      "faire": "SI EZZEDINE NE RÉPOND PAS : seconde épreuve du document de passation par une séance neuve. Sa version corrigée n'a pas été suivie. Porter sur le §9.",
      "cap": "Un artisan a son site vitrine en ligne en quelques minutes : il décrit son activité, les textes sont générés, les sections et le thème se règlent sans écrire de code. Depuis le 2026-09-11, la chaîne qui porte ce cap est le Studio (SiteSpec/blocks), pas le wizard."
    },
    "illisibles": 0,
    "hors_seance": 5
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/artisan-builder",
        "libelle": "artisan-builder",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
        "constellation": "en_attente_de_paul",
        "ciel": "renoboost-ia",
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
