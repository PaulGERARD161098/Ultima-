// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il existe parce que `api/finubar.js` doit l'IMPORTER pour que Vercel
// l'embarque dans le paquet de la fonction (un readFileSync ne serait pas tracé).
export default {
  "le": "2026-08-21",
  "projets": [
    {
      "ok": true,
      "motif": "",
      "depot": "paggerard-boop/ripair",
      "grain": {
        "projet": "ripair (dépôt d'origine)",
        "depot": "paggerard-boop/ripair",
        "cap": "À nommer ou à archiver. Ce dépôt est l'ancêtre Base44 de RénoPredict ; son rôle actuel n'est écrit nulle part.",
        "rattache_a": "RenoPredict/docs/DECISION-2-repos.md",
        "etat": "au_repos",
        "jalon": {
          "nom": "Trancher : archiver, ou nommer ce que ce dépôt porte encore",
          "critere_de_sortie": "une décision écrite — dépôt archivé, ou rôle explicite dans son propre FINUBAR"
        },
        "dernier_arret": {
          "le": "2026-07-12",
          "quoi": "Mise à jour des paquets Base44, après la landing marketing et le retrait du contenu de démonstration",
          "commit": "dbc2475"
        },
        "prochaine_action": "Décider avec Paul. Aucun commit depuis le 12/07/2026 — le jour même de la décision « 2 logiciels, 2 repos » qui a fait de RénoPredict le logiciel autonome.",
        "bloque_par": [
          "Une décision de Paul : ce dépôt est-il archivé, ou porte-t-il encore quelque chose que RénoPredict n'a pas repris ?"
        ],
        "en_attente_depuis": "2026-07-12",
        "boucles_ouvertes": [],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "1c98509",
        "tete_le": "2026-08-21T10:41:36+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 40,
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
        "rattache_a": "CADRAGE-OFFRE.md · TODO-PAUL.md · RenoBoost/ROADMAP-MASTER.md (jalons 2.3, 3.2, 3.3)",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "L'offre — recruter et valider les premiers artisans",
          "critere_de_sortie": "au moins 1 artisan validé en base (0 aujourd'hui : les écrans pro tournent dans le vide)"
        },
        "dernier_arret": {
          "le": "2026-08-20",
          "quoi": "CGU + confidentialité alignées sur le produit réel ; Google Analytics retiré — il ne mesurait rien et déposait `_ga` sans consentement (PR #56)",
          "commit": "cf2c439"
        },
        "prochaine_action": "Brancher la mesure d'audience exemptée (`window.__audience`) — c'est le seul point de code restant après le retrait de GA.",
        "bloque_par": [
          "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
          "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date",
          "Relecture juriste des CGU avant la première signature client"
        ],
        "en_attente_depuis": "2026-07-15",
        "boucles_ouvertes": [],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "62765bb",
        "tete_le": "2026-08-21T10:41:29+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 37,
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
        "rattache_a": "ROADMAP-MASTER.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-08-21",
          "quoi": "ROADMAP-MASTER rafraîchie intégralement puis corrigée — elle se contredisait dans son propre en-tête (PR #299 et #300)",
          "commit": "e54f659"
        },
        "prochaine_action": "Le jalon 0. Il n'y a rien à construire avant lui : tout est livré, testé, mergé, et aucun compteur n'est jamais passé à 1.",
        "bloque_par": [
          "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08",
          "Générer un lot de stickers QR, VÉRIFIER l'URL d'un QR, puis imprimer — ouvert depuis le 11/08 (`stickers` = 0)",
          "Déployer `main` PUIS finir l'embarquement Stripe de SOLA — dans cet ordre, jamais l'inverse"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "65e7390",
        "tete_le": "2026-08-21T10:42:08+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 17,
      "rang": 0
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
          "le": "2026-08-21",
          "quoi": "Nettoyage de fin de session : deux exports que seuls leurs tests appelaient (PR #56)",
          "commit": "ee69b20"
        },
        "prochaine_action": "Rien à coder avant le sticker. La chaîne est finie, testée, mergée — et elle n'a jamais tourné une seule fois, faute d'objet physique.",
        "bloque_par": [
          "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ⚠️ Ouvrir l'URL d'un QR AVANT d'imprimer : c'est la seule étape irréversible du programme",
          "Valider la fiche Google Business — sans elle, le cron d'avis J+7 produit des brouillons avec un marqueur à la place du lien",
          "Embarquement Stripe côté RénoPredict — jamais commencé (0 profil sur 2)"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "Migre-t-on les données (interventions, entretien_produits, rp_digests, ~81 fiches GHL) de RenoBoost vers le projet renopredict ? Question posée le 12/07, revérifiée le 12/08, jamais tranchée",
            "depuis": "2026-07-12"
          }
        ],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "91cc24f",
        "tete_le": "2026-08-21T10:41:31+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 17,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoDevis",
      "grain": {
        "projet": "RénoDevis",
        "depot": "PaulGERARD161098/RenoDevis",
        "cap": "Le devis part, se relance tout seul tant qu'il n'est pas signé, se signe et s'encaisse — sans que Paul y touche.",
        "rattache_a": "ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-08-21",
          "quoi": "Le cron de relance tient 200 devis — budget élargi, passe silence en O(1) (PR #100) ; l'audit énergétique entre dans le relevé (PR #99)",
          "commit": "a593a8f"
        },
        "prochaine_action": "Vérifier que la prod Vercel est à jour (elle a déjà eu plusieurs commits de retard), puis l'embarquement Stripe de SOLA — le rail complet n'a jamais porté un euro.",
        "bloque_par": [
          "Embarquement Stripe de SOLA : `stripe_account_id` = 0, aucun artisan embarqué"
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "PR #101 (brouillon) — mémoire de séance du 21/08, capacité du cron",
            "depuis": "2026-08-21"
          },
          {
            "quoi": "⛔ Risque connu, ouvert et ASSUMÉ : l'UUID d'un devis vaut un droit de signer (révoquer un lien ne révoque rien). Corriger exige de faire passer la page devis publique de RénoBoost par un jeton.",
            "depuis": "2026-08-17"
          }
        ],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "316f704",
        "tete_le": "2026-08-21T10:41:27+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 4,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/artisan-builder",
      "grain": {
        "projet": "artisan-builder",
        "depot": "PaulGERARD161098/artisan-builder",
        "cap": "Un artisan a son site vitrine en ligne en quelques minutes : wizard en 5 étapes, textes générés, template au choix.",
        "rattache_a": "app/sites/solution-plomberie-chauffage/README.md (checklist de mise en ligne)",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Mettre en ligne le premier site client réel — SPC (Solution Plomberie Chauffage)",
          "critere_de_sortie": "les quatre informations bloquantes de la checklist renseignées dans `content.ts`, puis le site publié"
        },
        "dernier_arret": {
          "le": "2026-08-21",
          "quoi": "Site SPC : page réalisations, espace Questions, formulaire enrichi, SEO technique (robots, sitemap, `NEXT_PUBLIC_SITE_URL`) et checklist de mise en ligne (PR #11)",
          "commit": "46e2b62"
        },
        "prochaine_action": "Obtenir du client les quatre informations bloquantes de la checklist : téléphone/e-mail réels, ville et adresse complète, zone d'intervention, SIRET + forme juridique + assureur décennale.",
        "bloque_par": [
          "Les quatre informations bloquantes du client SPC — dont le SIRET et l'assurance décennale, qui sont une obligation légale avant toute mise en ligne publique",
          "Les photos réelles des chantiers (les visuels actuels sont des illustrations provisoires)"
        ],
        "en_attente_depuis": "2026-08-21",
        "boucles_ouvertes": [],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "c0a7612",
        "tete_le": "2026-08-21T10:41:35+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 0,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/mon-dpe.fr",
      "grain": {
        "projet": "mon-dpe.fr",
        "depot": "PaulGERARD161098/mon-dpe.fr",
        "cap": "Outil DPE gratuit et grand public → génération de leads rénovation. Porte aussi le MOTEUR d'audit énergétique PAC, qu'aucune autre brique ne doit recopier.",
        "rattache_a": "CADRAGE-2026-08-21-audit-pac.md · lib/audit-pac/PONT-RENODEVIS.md · RenoBoost/ROADMAP-2026-08-21-audit-et-acquisition.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "Un audit énergétique vendu et calculé chez un vrai client",
          "critere_de_sortie": "un audit calculé en réel, chez un client, depuis le relevé RénoDevis"
        },
        "dernier_arret": {
          "le": "2026-08-21",
          "quoi": "Moteur d'audit énergétique PAC + pont serveur-à-serveur `POST /api/audit-pac` (PR #193)",
          "commit": "16c52ce"
        },
        "prochaine_action": "Poser les secrets (`AUDIT_PAC_API_SECRET` des DEUX côtés) et redéployer : le pont est écrit et testé, il n'est branché nulle part.",
        "bloque_par": [
          "Poser les secrets Vercel du pont audit-PAC, puis redéployer",
          "`MAGIC_LINK_SECRET` + `RESEND_API_KEY` + domaine Resend (magic link cross-device)",
          "`lib/site.ts` : passer `legalForm` d'EURL à SAS une fois publié au greffe",
          "Vérifier le statut du sitemap dans la Search Console (13 URLs)"
        ],
        "en_attente_depuis": "2026-08-21",
        "boucles_ouvertes": [
          {
            "quoi": "10 PR ouvertes — 6 dependabot (react, next, @types/node, SDK, actions) et 4 brouillons dormants : #183 (12/07), #170 (02/07), #164 et #163 (06/06). À trier : ce qui dort depuis juin ne se réveillera pas tout seul",
            "depuis": "2026-06-06"
          }
        ],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "b088b9e",
        "tete_le": "2026-08-21T10:41:32+00:00",
        "commits_depuis": 1
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 0,
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
        "rattache_a": "CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md · CADRAGE-LV6-CIEL-VIVANT.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "FINUBAR — le pilotage des huit dépôts en un seul endroit",
          "critere_de_sortie": "les 8 grains lus par la collecte, le rappel d'ouverture de séance actif dans les 8 dépôts, l'écran /finubar en ligne"
        },
        "dernier_arret": {
          "le": "2026-08-21",
          "quoi": "Finubar livré et poussé sur les 8 dépôts : moteur pur + harnais (éprouvé rouge puis vert), collecte avec mesure de dérive, rappel d'ouverture de séance, écran /finubar. Patrimoine complet vert (88 sections).",
          "commit": "73ea8c3"
        },
        "prochaine_action": "Faire entrer les projets dans la constellation générale — arbitré par Paul le 21/08 (« à terme, tout projet d'ampleur doit y être ») et volontairement reporté : `versConstellation()` est déjà écrit et testé, il n'est branché sur aucune page.",
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
          }
        ],
        "maj": "2026-08-21"
      },
      "derive": {
        "tete": "73ea8c3",
        "tete_le": "2026-08-21T10:42:10+00:00",
        "commits_depuis": 0
      },
      "jours_depuis_maj": 0,
      "jours_en_attente": 1,
      "rang": 2
    }
  ],
  "macro": {
    "total": 8,
    "lisibles": 8,
    "illisibles": 0,
    "en_cours": 3,
    "en_attente_de_paul": 4,
    "au_repos": 1,
    "derives": 7,
    "boucles_ouvertes": 5,
    "gestes_de_paul": [
      {
        "projet": "ripair (dépôt d'origine)",
        "geste": "Une décision de Paul : ce dépôt est-il archivé, ou porte-t-il encore quelque chose que RénoPredict n'a pas repris ?"
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
        "projet": "RénoBoost",
        "geste": "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08"
      },
      {
        "projet": "RénoBoost",
        "geste": "Générer un lot de stickers QR, VÉRIFIER l'URL d'un QR, puis imprimer — ouvert depuis le 11/08 (`stickers` = 0)"
      },
      {
        "projet": "RénoBoost",
        "geste": "Déployer `main` PUIS finir l'embarquement Stripe de SOLA — dans cet ordre, jamais l'inverse"
      },
      {
        "projet": "RénoPredict",
        "geste": "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ⚠️ Ouvrir l'URL d'un QR AVANT d'imprimer : c'est la seule étape irréversible du programme"
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
        "projet": "RénoDevis",
        "geste": "Embarquement Stripe de SOLA : `stripe_account_id` = 0, aucun artisan embarqué"
      },
      {
        "projet": "artisan-builder",
        "geste": "Les quatre informations bloquantes du client SPC — dont le SIRET et l'assurance décennale, qui sont une obligation légale avant toute mise en ligne publique"
      },
      {
        "projet": "artisan-builder",
        "geste": "Les photos réelles des chantiers (les visuels actuels sont des illustrations provisoires)"
      },
      {
        "projet": "mon-dpe.fr",
        "geste": "Poser les secrets Vercel du pont audit-PAC, puis redéployer"
      },
      {
        "projet": "mon-dpe.fr",
        "geste": "`MAGIC_LINK_SECRET` + `RESEND_API_KEY` + domaine Resend (magic link cross-device)"
      },
      {
        "projet": "mon-dpe.fr",
        "geste": "`lib/site.ts` : passer `legalForm` d'EURL à SAS une fois publié au greffe"
      },
      {
        "projet": "mon-dpe.fr",
        "geste": "Vérifier le statut du sitemap dans la Search Console (13 URLs)"
      },
      {
        "projet": "Ultima",
        "geste": "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)"
      },
      {
        "projet": "Ultima",
        "geste": "`ANTHROPIC_API_KEY` en env Vercel"
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
        "projet": "ripair (dépôt d'origine)",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoAgenda",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoBoost",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      }
    ],
    "action": {
      "projet": "ripair (dépôt d'origine)",
      "nature": "code",
      "faire": "Décider avec Paul. Aucun commit depuis le 12/07/2026 — le jour même de la décision « 2 logiciels, 2 repos » qui a fait de RénoPredict le logiciel autonome.",
      "cap": "À nommer ou à archiver. Ce dépôt est l'ancêtre Base44 de RénoPredict ; son rôle actuel n'est écrit nulle part."
    },
    "illisibles": 0
  },
  "constellation": {
    "noeuds": [
      {
        "id": "paggerard-boop/ripair",
        "libelle": "ripair (dépôt d'origine)",
        "constellation": "au_repos",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoAgenda",
        "libelle": "RénoAgenda",
        "constellation": "en_attente_de_paul",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
        "constellation": "en_attente_de_paul",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoPredict",
        "libelle": "RénoPredict",
        "constellation": "en_attente_de_paul",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/artisan-builder",
        "libelle": "artisan-builder",
        "constellation": "en_attente_de_paul",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/mon-dpe.fr",
        "libelle": "mon-dpe.fr",
        "constellation": "en_cours",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/Ultima-",
        "libelle": "Ultima",
        "constellation": "en_cours",
        "signal": 0
      }
    ],
    "relations": []
  }
};
