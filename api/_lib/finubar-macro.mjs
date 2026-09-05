// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-09-05",
  "projets": [
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/Ultima-",
      "grain": {
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
          "le": "2026-09-05",
          "quoi": "ADR-010 VESTA et la table de marche sont mergées (#192). Étapes 1-4 exécutées sur GO de Paul : 5 PR fusionnées, #349 fermé sur mesure, 19 contrôles rejoués en base. Détail…",
          "commit": "e4a53daa8afdc97c281ba1e6a6f4ddae4cb1c070"
        },
        "prochaine_action": "Faire acter le nom VESTA par Paul. (Julien = celui de PROTÉE : confirmé le 05/09, ADR-002 et ADR-010 sont un seul dossier à deux voies.)",
        "bloque_par": [
          "`ANTHROPIC_API_KEY` en env Vercel — la voix est CONSTRUITE partout, elle répond 503 tant que la clé n'est pas posée",
          "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
          "Les advisors Supabase post-DDL",
          "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "Table de marche de la semaine : étapes 1-3 faites, 4 faite. Reste l'étape 1 (16 branches, refusée en 403 depuis une session) — cf. PLAN-2026-09-05-boucler-la-semaine.md §3 bis",
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
            "quoi": "Angle mort connu du patrimoine : les pages AUTHENTIFIÉES ne sont pas couvertes par les harnais (fixture de session à financer)",
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
        "maj": "2026-09-05"
      },
      "recits": [
        "dernier_arret.quoi"
      ],
      "ciel": "racine",
      "hors_seance": false,
      "derive": {
        "tete": "dd3e57a",
        "tete_le": "2026-09-05T15:24:57+02:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 16,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoAgenda",
      "grain": {
        "projet": "RénoAgenda",
        "depot": "PaulGERARD161098/RenoAgenda",
        "cap": "Marketplace particuliers ↔ artisans RGE : la demande arrive, se qualifie et se dispatche toute seule.",
        "rattache_a": "CADRAGE-OFFRE.md · TODO-PAUL.md · RenoBoost/ROADMAP-MASTER.md (jalons 2.3, 3.2, 3.3) · CADRAGE-2026-09-03-rdv-omnicanal.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "L'offre — recruter et valider les premiers artisans",
          "critere_de_sortie": "au moins 1 artisan validé en base (0 aujourd'hui : les écrans pro tournent dans le vide)"
        },
        "dernier_arret": {
          "le": "2026-09-04",
          "quoi": "RénoRDV — montage D « la ligne RDV » (§3ter) : second numéro dédié par artisan, appelé par les clients, toujours suivi d'un SMS du même numéro. Retire le risque n°1 (renvoi…",
          "commit": "df7af5d12deed7319aecd0e9add3897106d10ed7"
        },
        "prochaine_action": "J0 par Paul (§17, réécrit le 04/09) : compte Twilio, numéro FR avec Voice+SMS, Studio Flow renvoi→SMS, test en deux passes. Rapporter : SMS reçu ?, depuis quel expéditeur ?, quel…",
        "bloque_par": [
          "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
          "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date",
          "Relecture juriste des CGU avant la première signature client"
        ],
        "en_attente_depuis": "2026-07-15",
        "boucles_ouvertes": [
          {
            "quoi": "RénoRDV — P0 non fait : prouver le SMS sur appel manqué (Twilio) sur UN artisan, à la main, avant tout dev. Bloqué par 2 gestes de Paul : compte Twilio + achat d'un numéro FR…",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "RénoRDV — reste ouvert : nom définitif + domaine + prix (hypothèse 69 € HT/mois, calquée sur Artisaner, NON VÉRIFIÉE). Non bloquant : le nom de code RénoRDV permet d'avancer",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "Le lot C ne vérifie QUE le RGE. « L'entreprise existe-t-elle et est-elle active » reste à faire : `verif-entreprise.mjs` est prêt, à PLIER DANS l'Edge Function `verifier-siret`",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "verifier-siret v3 écrite et testée côté logique, mais JAMAIS déployée ni exécutée — le déploiement est un geste humain",
            "depuis": "2026-09-03"
          }
        ],
        "maj": "2026-09-03"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 2,
      "jours_en_attente": 52,
      "rang": 1
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoPredict",
      "grain": {
        "projet": "RénoPredict",
        "depot": "PaulGERARD161098/RenoPredict",
        "cap": "Le fonds de commerce se remplit tout seul : sticker collé, flashé en partant, la date de pose existe, Foresight s'allume — zéro saisie.",
        "rattache_a": "docs/ROADMAP.md · docs/CADRAGE-RIPAIR-OFFRE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle B)",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 1 boucle B — le premier contrat Ripair",
          "critere_de_sortie": "un `1` dans la table `contracts` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-09-03",
          "quoi": "Les QR des stickers portent désormais toujours l'origine de production (`src/lib/qr-url.js`), et l'écran des lots affiche la destination. Le journal ci-dessous en donne le détail.",
          "commit": "b842a46"
        },
        "prochaine_action": "Rien à coder avant le sticker. La chaîne est finie, testée, mergée — et elle n'a jamais tourné une seule fois, faute d'objet physique.",
        "bloque_par": [
          "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. Le piège de l'URL est refermé le 01/09 : il ne reste que le geste physique",
          "Valider la fiche Google Business — sans elle, le cron d'avis J+7 produit des brouillons avec un marqueur à la place du lien",
          "Embarquement Stripe côté RénoPredict — jamais commencé (0 profil sur 2)"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "Cinq arbitrages MKT-Ax du cadrage marketplace (27/08), recommandations écrites, aucun validé. MKT-A4 presse : il est gratuit tant que `contracts` est vide (0 au 01/09)",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "Migre-t-on les données (interventions, entretien_produits, rp_digests, ~81 fiches GHL) de RenoBoost vers le projet renopredict ? Posée le 12/07, jamais tranchée",
            "depuis": "2026-07-12"
          }
        ],
        "maj": "2026-09-03"
      },
      "recits": [],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 2,
      "jours_en_attente": 32,
      "rang": 1
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoBoost",
      "grain": {
        "projet": "RénoBoost",
        "depot": "PaulGERARD161098/RenoBoost",
        "cap": "Un individu seul fait tourner le business entier, aidé par l'automatisation (Directive IA). RénoBoost est le hub : acquisition, rendez-vous, dashboard, et la roadmap maîtresse des quatre briques.",
        "rattache_a": "REPRISE-2026-09-03-boucles-ete.md · ROADMAP-MASTER.md · ACTIONS-PAUL.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-09-05",
          "quoi": "Deux séances le 05/09. (a) Le dispositif du mail unique est éprouvé de bout en bout : la veille BTP est repartie (8 articles), 4 des 5 sources déposent réellement, la panne de…",
          "commit": "b6158f1"
        },
        "prochaine_action": "Arbitrer les deux garde-fous proposés (interrupteur système en `sentinelle_etat` · `/api/digest` qui parle quand il se saute) et le 401 GHL sur les champs personnalisés. Puis les…",
        "bloque_par": [
          "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08",
          "Générer un lot de stickers QR puis l'imprimer (`stickers` = 0). L'URL des QR est corrigée à la source depuis le 01/09 : il ne reste que le geste physique",
          "Embarquement Stripe de SOLA : le cron du 02/09 fait le reste, la clé est posée. Ne resterait qu'un clic dans le tunnel de test si Stripe refusait la complétion par API",
          "Jeton Google Ads : demande d'accès Basic déposée le 03/09, réponse de Google attendue. Chemin et 5 variables : ACTIONS-PAUL.md §5"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "L'API GHL rend 401 sur les champs personnalisés à CHAQUE synchro (toutes les 15 min) depuis au moins le 03/09 : `ghl_custom_fields` reste vide. La synchro des contacts, elle…",
            "depuis": "2026-09-05"
          },
          {
            "quoi": "Radar de demande BTP : PR #346 MERGÉE le 05/09 (squash 1e074e5). Bouclé côté Léo. Attend Paul, 4 gestes sans code : CLIENT_ID/SECRET/REFRESH_TOKEN · retour sur le geste (variation…",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "PR #304 (brouillon) : restent ALT-A1/ALT-A3 — qui reçoit quoi, et faut-il sortir Henri de la supervision technique. MKT-A4 est hors périmètre, à rouvrir avant la 1ʳᵉ signature",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "Un interrupteur système dans un `kv_store` par utilisateur, lu au `rows[0]` : il dépend du compte qui répond en premier et meurt avec lui. Sa place est `sentinelle_etat`",
            "depuis": "2026-09-04"
          },
          {
            "quoi": "`/api/digest` rend 200 sans battement ni log quand la veille est inactive : c'est ce silence qui a caché la panne. Un cron muet et un cron mort doivent se distinguer",
            "depuis": "2026-09-04"
          },
          {
            "quoi": "E1 : cause fermée (#351 mergée). Dry run sur les 23 lignes réelles — 6 clés refusées, 242 items jamais recopiés, et la copie touche 3 entités, pas que les clients. Reste…",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "PR #304 (brouillon) : restent ALT-A1/ALT-A3 — qui reçoit quoi, et faut-il sortir Henri de la supervision technique. MKT-A4 est hors périmètre, à rouvrir avant la 1ʳᵉ signature",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "Le backlog de CADRAGE-2026-08-19-audit-gemini.md affiche plus de stock qu'il n'en reste : seuls les lots 6 et 8 restent, tous deux tenus par une matière de Paul",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "ACQ-2 : G2 levé, G3 supprimé, ACQ-2b LIVRÉ (4f4733f, vérifié sur main le 05/09). Reste G1, les volumes Keyword Planner — geste de Paul",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "ACQ-1 est écrit mais INACTIF : trois gestes dans RenoAgenda — appliquer la migration de vérification, poser AGENDA_SUPABASE_SERVICE_KEY, déployer",
            "depuis": "2026-09-01"
          }
        ],
        "maj": "2026-09-05"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 32,
      "rang": 1
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoDevis",
      "grain": {
        "projet": "RénoDevis",
        "depot": "PaulGERARD161098/RenoDevis",
        "cap": "Le devis part, se relance tout seul tant qu'il n'est pas signé, se signe et s'encaisse — sans que Paul y touche.",
        "rattache_a": "ROADMAP-2026-09-03-audit-pac.md (l'audit PAC, et la procédure de V0) · ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-09-03",
          "quoi": "Deux séances dans la même journée. (1) Matrices SOLA : les 3 « écarts » étaient déjà corrigés dans le code, document remis d'aplomb (#125). (2) Lots A2 et B fusionnés (#122, #124…",
          "commit": "da4b1fda4afefb9b0a7460321ef4cd2adc66be71"
        },
        "prochaine_action": "Jalon V0 — Paul calcule UN audit sur UN dossier réel (0 audit calculé au 03/09 11:41 UTC). Il éprouve d'un coup le secret, le pont, l'écran, le dimensionnement et la feuille.…",
        "bloque_par": [
          "Embarquement Stripe de SOLA : le compte de TEST existe depuis le 19/08 mais n'encaisse pas encore. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul"
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "L3 et L4 sont GELÉS À DESSEIN — pas « à faire ». Ils attendent la mesure L5, qui attend un devis émis depuis l'app, donc Paul. Cf. REPRISE-2026-09-01-outil-relance.md",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "Le logo de SOLA reste la seule pièce d'identité manquante — il ne s'extrait d'aucun PDF, il faut le fichier",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "Le catalogue central ne porte AUCUN consommable : sur un gainable à 11 075 € HT ils pèsent 1 500 € et 11 lignes sur 18. Le déblocage est d'obtenir UN devis SOLA réel — celui du…",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⛔ La chaîne de bout en bout d'un dossier NÉ D'UN RELEVÉ n'a AUCUNE empreinte en base. L'unique `devis_events.reminded` porte sur RR-20260805-6053, créé le 05/08 — avant la fusion…",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "La coupure de la voie UUID est DÉBLOQUÉE : `devis encore signables par UUID` est tombé à 0 le 03/09. Le gate 4 dépôts est fait — seul RenoBoost/db.js:411 appelle sign_devis_public…",
            "depuis": "2026-09-03"
          },
          {
            "quoi": "La LECTURE par UUID reste ouverte : `get_devis_public` et `log_devis_open` sont accessibles à `anon`. Divulgation, pas écriture — à traiter avec la coupure finale",
            "depuis": "2026-08-17"
          },
          {
            "quoi": "La page devis publique de RénoBoost en chemin UUID ignore `extra.rendu` : le client y voit le détail ligne à ligne. Ne concerne plus qu'UN devis, disparaît à la coupure finale",
            "depuis": "2026-08-31"
          },
          {
            "quoi": "Trois arbitrages attendent Paul sur l'audit en visite : V-A1 (où l'appeler), V-A2 (sans réseau), V-A3 (la feuille part-elle chez le client, et par quel lien)",
            "depuis": "2026-09-02"
          },
          {
            "quoi": "Catalogue consommables : bloqué par la matière, pas par le code — les 6 devis SOLA ne sont pas en base (2 devis sur 19 portent des lignes)",
            "depuis": "2026-09-01"
          }
        ],
        "maj": "2026-09-03"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 2,
      "jours_en_attente": 19,
      "rang": 2
    },
    {
      "ok": false,
      "hors_seance": true,
      "motif": "dépôt non attaché à cette séance",
      "depot": "paggerard-boop/ripair",
      "ciel": "alpha",
      "grain": null,
      "derive": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/artisan-builder",
      "ciel": "alpha",
      "grain": null,
      "derive": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    },
    {
      "ok": false,
      "hors_seance": true,
      "motif": "dépôt non attaché à cette séance",
      "depot": "PaulGERARD161098/mon-dpe.fr",
      "ciel": "alpha",
      "grain": null,
      "derive": null,
      "jours_depuis_maj": null,
      "jours_en_attente": null,
      "rang": 9
    }
  ],
  "macro": {
    "total": 8,
    "lisibles": 5,
    "illisibles": 0,
    "hors_seance": 3,
    "en_cours": 2,
    "en_attente_de_paul": 3,
    "au_repos": 0,
    "derives": 1,
    "commits_inconnus": 0,
    "boucles_ouvertes": 33,
    "gestes_de_paul": [
      {
        "projet": "Ultima",
        "geste": "`ANTHROPIC_API_KEY` en env Vercel — la voix est CONSTRUITE partout, elle répond 503 tant que la clé n'est pas posée"
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
      },
      {
        "projet": "RénoAgenda",
        "geste": "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux"
      },
      {
        "projet": "RénoAgenda",
        "geste": "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date"
      },
      {
        "projet": "RénoAgenda",
        "geste": "Relecture juriste des CGU avant la première signature client"
      },
      {
        "projet": "RénoPredict",
        "geste": "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. Le piège de l'URL est refermé le 01/09 : il ne reste que le geste physique"
      },
      {
        "projet": "RénoPredict",
        "geste": "Valider la fiche Google Business — sans elle, le cron d'avis J+7 produit des brouillons avec un marqueur à la place du lien"
      },
      {
        "projet": "RénoPredict",
        "geste": "Embarquement Stripe côté RénoPredict — jamais commencé (0 profil sur 2)"
      },
      {
        "projet": "RénoBoost",
        "geste": "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08"
      },
      {
        "projet": "RénoBoost",
        "geste": "Générer un lot de stickers QR puis l'imprimer (`stickers` = 0). L'URL des QR est corrigée à la source depuis le 01/09 : il ne reste que le geste physique"
      },
      {
        "projet": "RénoBoost",
        "geste": "Embarquement Stripe de SOLA : le cron du 02/09 fait le reste, la clé est posée. Ne resterait qu'un clic dans le tunnel de test si Stripe refusait la complétion par API"
      },
      {
        "projet": "RénoBoost",
        "geste": "Jeton Google Ads : demande d'accès Basic déposée le 03/09, réponse de Google attendue. Chemin et 5 variables : ACTIONS-PAUL.md §5"
      },
      {
        "projet": "RénoDevis",
        "geste": "Embarquement Stripe de SOLA : le compte de TEST existe depuis le 19/08 mais n'encaisse pas encore. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul"
      }
    ]
  },
  "cartouche": {
    "signaux": [
      {
        "projet": "Ultima",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoAgenda",
        "dit": "attend un geste : Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux — ouvert depuis 52 j",
        "pourquoi": "attente"
      },
      {
        "projet": "RénoPredict",
        "dit": "attend un geste : Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. Le piège de l'URL est refermé le 01/09 : il ne reste que le geste physique — ouvert depuis 32 j",
        "pourquoi": "attente"
      }
    ],
    "action": {
      "projet": "Ultima",
      "nature": "code",
      "faire": "Faire acter le nom VESTA par Paul. (Julien = celui de PROTÉE : confirmé le 05/09, ADR-002 et ADR-010 sont un seul dossier à deux voies.)",
      "cap": "Ultima est l'unique interface de travail de Paul (Directive JL) : elle absorbe toute sa data, la dispatche, la navigue — avec Léo pour seule interlocutrice. Rien d'autre ne sera créé : tout nouveau besoin est une extension d'Ultima."
    },
    "illisibles": 0,
    "hors_seance": 3
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/Ultima-",
        "libelle": "Ultima",
        "constellation": "en_cours",
        "ciel": "racine",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoAgenda",
        "libelle": "RénoAgenda",
        "constellation": "en_attente_de_paul",
        "ciel": "renoboost-ia",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoPredict",
        "libelle": "RénoPredict",
        "constellation": "en_attente_de_paul",
        "ciel": "renoboost-ia",
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
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 0
      }
    ],
    "relations": []
  }
};
