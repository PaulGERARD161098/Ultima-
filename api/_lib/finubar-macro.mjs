// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-10-18",
  "projets": [
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoAgenda",
      "grain": {
        "projet": "RénoAgenda",
        "depot": "PaulGERARD161098/RenoAgenda",
        "cap": "Marketplace particuliers ↔ artisans RGE : la demande arrive, se qualifie et se dispatche toute seule.",
        "rattache_a": "CADRAGE-2026-09-22-vitrine-particuliers.md (la vitrine, décisions D1-D6) · ROADMAP-ARTIDISPO.md (dates, produit fini) · CADRAGE-2026-09-03-rdv-omnicanal.md (raisonnement) · CADRAGE-OFFRE.md · TODO-PAUL.md · RenoBoost/ROADMAP-MASTER.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "Artidispo — 20 artisans payants au 30/11/2026",
          "critere_de_sortie": "20 abonnements actifs chez Stripe ; paliers 5 au 31/10, 12 au 15/11"
        },
        "dernier_arret": {
          "le": "2026-09-30",
          "quoi": "Bouclage transverse : CI une fois par push, LEÇONS v45, grain élagué (6 boucles : D4 déjà en prochaine action, 5 faites ou reprises par le dépôt Artidispo).",
          "commit": "1372ad071f6aa882369b05697d1798cce67633cf"
        },
        "prochaine_action": "Boucle D4 : réduire partenaires.html au logo et fermer les colonnes démarchables de artisans_vitrine. Puis V1 : inventaire des réalisations avec accord.",
        "bloque_par": [
          "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
          "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date",
          "Relecture juriste des CGU avant la première signature client"
        ],
        "en_attente_depuis": "2026-07-15",
        "boucles_ouvertes": [
          {
            "quoi": "Le lot C ne vérifie que le RGE. « L'entreprise existe-t-elle et est-elle active » : `verif-entreprise.mjs` est prêt, à plier dans l'Edge Function `verifier-siret`.",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "`verifier-siret` v3 écrite et testée côté logique, jamais déployée ni exécutée : le déploiement est un geste humain.",
            "depuis": "2026-09-03"
          }
        ],
        "maj": "2026-09-30"
      },
      "recits": [],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "33bdcf0",
        "tete_le": "2026-10-13T12:57:54+02:00",
        "commits_depuis": 14,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.636Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 18,
      "jours_en_attente": 95,
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
          "le": "2026-10-06",
          "quoi": "Q10 : migration `dossier_ref` appliquée (clients.dossier_ref, interventions.devis_ref, une pose par devis ET par artisan) ; « Fin de pose » liste les chantiers signés RénoBoost et…",
          "commit": "7de74569102e582a3bc060896e3f47953680fa83"
        },
        "prochaine_action": "Rien à coder : la chaîne Q10 attend trois prérequis — le secret CHAINE_POSE_SECRET (déclaré posé par Paul le 06/10, non vérifié), l'inscription de Matthieu, un sticker. Preuve de…",
        "bloque_par": [
          "Inscription RenoPredict de Matthieu (Login → Onboarding) — sans elle, « Fin de pose » n'a aucun chantier à proposer.",
          "CHAINE_POSE_SECRET sur les deux projets Vercel : déclaré posé par Paul le 06/10 (« fait »), NON vérifiable depuis une séance (proxy). Absent, `demanderARenoboost` rend «…",
          "Imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08, reporté par Paul le 07/09 sans date. Le piège de l'URL est refermé depuis le 01/09.",
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
        "maj": "2026-10-06"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "c188c46",
        "tete_le": "2026-10-13T12:57:58+02:00",
        "commits_depuis": 2,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.651Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 12,
      "jours_en_attente": 75,
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
        "rattache_a": "CADRAGE-2026-09-15-corpus-rapprochement.md §9–13 (socle livré, voix/PDF, maquette reçue et implantation) · REPRISE-PILOTE-V3.md · LOT-PILOTE-2026-09-14.md · ROADMAP-2026-09-03-audit-pac.md (l'audit PAC, et la procédure de V0) · ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A) · docs/whatsapp/roadmap-implementation.md (état WhatsApp courant)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-10-14",
          "quoi": "Point WhatsApp : base centrale accessible, installation reçue, limites mesurées et précontrôle complété. Diagnostic Production Meta 14/10 23h25 : API access blocked ; canal/budget…",
          "commit": "73f34fadd47c2f8fc04d04b8dd4363a0e460f387"
        },
        "prochaine_action": "Paul chiffre un devis RR et un devis RO sur RECETTE F6 et télécharge les deux études PDF ; relecture des chiffres avant le rendez-vous SOLA.",
        "bloque_par": [
          "Paul valide les devis e-mail sur /devis/email (B3) avant la clé Stripe live (A6a).",
          "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul.",
          "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true, ouverts:0 — remesuré le 08/10 à 06:30 UTC.",
          "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "Étude d’économies : 0 devis chiffré dans l’app au 13/10, donc aucun PDF réel ; 0 audit tracé (devis.extra.audit_pac).",
            "depuis": "2026-10-13"
          },
          {
            "quoi": "Agent SOLA : accès base reçu, précontrôle quota/budget complété ; Meta refuse encore son API. Lire la restriction Meta puis lever, recontrôler et reconduire la fenêtre pilote sans…",
            "depuis": "2026-10-14"
          },
          {
            "quoi": "Synchro Gmail branchée le 10/10 (actif:true 15:31 UTC, 47 devis email, 0 doublon). 38 devis à compléter (sans montant), donc pas relançables : voir E7.",
            "depuis": "2026-10-10"
          },
          {
            "quoi": "Ordre (Paul, 10/10) : ZOH plan et base faits le 10/10, puis J4, puis la série ZOH (report déclaré dans Ultima), puis l'étoile « Réno sur WhatsApp » après W1.",
            "depuis": "2026-10-09"
          },
          {
            "quoi": "Devis pro : ligne vue en production par Paul le 09/10, aucun devis pro émis (0). Logo non imprimé ; mentions B2B à faire relire par un comptable.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Série ZOH : 32 conflits réels au 10/10, dont 25 dans les fichiers de J4. Rafraîchie juste après J4 (Ultima, CADRAGE-2026-10-10-zohshia-mise-a-jour.md).",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Dictée qui suit les pauses (#311) : non prouvée sur téléphone (le harnais simule les coupures). Recette = une dictée réelle de Paul ou Matthieu, avec des pauses.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Dater les tarifs fournisseur : 112 prix d'achat SOLA sans date, donc inutilisables (CADRAGE-2026-10-08-equivalences-references.md §7). Prochaine action jusqu'au 08/10.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "101 branches mortes à supprimer (65 non fusionnées + 36 fusionnées, liste avec SHA) : suppression refusée par le garde-fou de la séance ; Paul choisit entre une règle…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Réponse-type dictée → devis (cadrage du 06/10, lots A/B/C) : cadrée, NON codée par cette séance ; #297 (création guidée, fusionnée le 08/10) en couvre peut-être une partie, à…",
            "depuis": "2026-10-06"
          }
        ],
        "maj": "2026-10-13"
      },
      "recits": [
        "dernier_arret.quoi",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "dd806dc",
        "tete_le": "2026-10-16T01:08:28+02:00",
        "commits_depuis": 23,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.623Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 5,
      "jours_en_attente": 62,
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
        "rattache_a": "PLAN-2026-09-30-chaine-A-Z.md (la route de la chaîne Rénoboost et son état vivant) · CADRAGE-RIVEN-NEBULEUSES.md · CADRAGE-2026-09-25-carte-celeste.md · specs/README.md · specs/ARBITRAGES.md · specs/INDEX.md (généré) · AUDIT-2026-09-14.md · REPRISE-2026-09-06-leo-partout-mail-matin.md · REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-",
        "etat": "en_cours",
        "jalon": {
          "nom": "Léo et FINUBAR — activation du site et des commandes",
          "critere_de_sortie": "Léo écrit sans demander dans l'anneau vert et rien au-delà ; chaque écriture journalisée avant l'acte et défaisable d'un clic. ✅ PROUVÉ EN PRODUCTION le 04/10 à 16:11 UTC pour l'anneau vert : une trace, tentee (16:11:39, avant l'acte) → reussie (16:11:40) → defaite (16:11:54). ✅ « Rien au-delà » constaté le même jour : « Supprime l'idée GLANEUR » → Léo refuse, 0 ligne nouvelle dans leo_ecritures, "
        },
        "dernier_arret": {
          "le": "2026-10-15",
          "quoi": "15/10 : « notre Kelvin » devient VITRUVE (sur Mon DPE Facile) ; fiche RDV kelvin° prête.",
          "commit": "5f3bc13c852f8c29ea13a2d324db050616b0c51a"
        },
        "prochaine_action": "Après le RDV kelvin° : reporter ses réponses dans la fiche et trancher construire ou s'abonner (VITRUVE).",
        "bloque_par": [
          "Paramétrage ChatGPT et Gemini PÉRIMÉ depuis le 10/10 (Directive ZS) : Paul recolle les blocs §7–9 d'EXPORT-METHODE-CHATGPT.md et §2–4 d'EXPORT-METHODE-GEMINI.md (empreinte…",
          "Inscription Supabase d'Ultima MESURÉE OUVERTE le 04/10 (e-mail + Google) — geste de Paul : Authentication › Sign In / Providers › désactiver « Allow new users to sign up ». Le…",
          "B4 (Réno lit Artidispo) : code vert (9/9), preuve impossible depuis la séance — Paul demande « Où en est Artidispo ? » à Réno (dashboard) ; la trace Artidispo est dans un projet…",
          "B1 ⑤ — choix d'accès : le mail du matin lit-il le journal de Léo ? reco : fonction SQL dédiée + secret (migration) · `updated_at` sur journal/scenarios (migration)",
          "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée",
          "La précision sur « mon dpe.fr » (VITRUVE)",
          "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "Pilotage ZOH : accès HTTP avec une vraie session propriétaire encore non éprouvé depuis Work (protection Vercel après redirection ; CLI absent). Source et tests sont livrés.…",
            "depuis": "2026-10-13"
          },
          {
            "quoi": "LEÇONS v91 (12–13/10, quatre leçons) dans Ultima seulement : propager aux neuf dépôts (procédure LECONS-PROCEDURE.md, lecons-chemins à 0 d'abord).",
            "depuis": "2026-10-12"
          },
          {
            "quoi": "ZOH · plan et base à jour le 10/10 (CADRAGE-2026-10-10-zohshia-mise-a-jour.md). Série : 32 conflits, dont 25 dans les fichiers de J4 ; à rafraîchir juste après J4 de RenoDevis…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Dictée qui suit les pauses (#367) : non prouvée sur téléphone (le harnais simule les coupures). Recette = une dictée réelle de Paul, avec des pauses.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "LEÇONS v86 dans Ultima seulement (les neuf autres en v85). À la propagation, préfixer l.663 `outils/` et l.2330 `package-lock.json` : lecons-chemins les signale.",
            "depuis": "2026-10-10"
          },
          {
            "quoi": "RIVEN deux cartes — à trancher par Paul : la bascule s'ouvre sur « Tout » (choix de séance : rien ne disparaît, et 9 harnais comptent les 9 fiches de démo). Passer le défaut à «…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "smoke-riven-nebuleuses : verdict maquette300_390_noms ROUGE dans le Chromium du conteneur de séance, sur main pur (8485ed5) comme sur la branche — mais VERT en CI le 08/10…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Léo partout (js/leo-partout.js) monte la voix SANS candidats : sur adramelech.html et toute page hors /registre, « Crée une idée … » finit en carte « Action impossible en l'état »…",
            "depuis": "2026-10-06"
          },
          {
            "quoi": "LEÇON À CONSIGNER + PROPAGER (9 dépôts) : une erreur générique cache sa cause — « Léo n'a pas pu répondre » a masqué pendant des jours un crédit Anthropic épuisé (0 écriture en…",
            "depuis": "2026-10-02"
          },
          {
            "quoi": "Chaîne — B3 codée le 12/10 (RenoDevis #348). B1 : code déjà en place, recette sur un devis réel issu d'un relevé. B4 : attend le geste de Paul. Détail : PLAN §2.",
            "depuis": "2026-10-12"
          }
        ],
        "maj": "2026-10-13"
      },
      "recits": [
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "racine",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "4c13879",
        "tete_le": "2026-10-18T09:20:19+00:00",
        "commits_depuis": 3,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.588Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 5,
      "jours_en_attente": 59,
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
        "rattache_a": "CADRAGE-AUTH-SUPABASE.md (connexion par compte Supabase : cadré le 14/09, LIVRÉ et prouvé en production le 15/09 — le lire comme un compte rendu, pas comme un chantier à ouvrir) · PROMPT-REPRISE-AB2-AB5.md (prompt de reprise daté du 2026-09-13 : PÉRIMÉ sur l'auth, encore juste sur AB2→AB5) · CADRAGE-AB-MULTIACTIVITE-2026-09-11.md (la carte du dépôt et le plan AB1→AB5 du chantier multi-activité) · ",
        "etat": "en_cours",
        "jalon": {
          "nom": "Faire du Studio la base du générateur : plusieurs activités, intentions explicites, contexte conservé jusqu'à la demande (dossier 1)",
          "critere_de_sortie": "Les six lots AB0→AB5 fermés, chacun sur son critère écrit dans CADRAGE-AB-MULTIACTIVITE-2026-09-11.md. AB0 est fait. Le jalon « publication SPC » n'est pas abandonné : il reste bloqué par 7 informations qui n'appartiennent pas au dépôt, et aucune ligne de ce chantier n'en fait tomber une."
        },
        "dernier_arret": {
          "le": "2026-10-09",
          "quoi": "SPC : plus aucune mention de Le Raincy ni du 93 sur le site (PR 104), en-tête « Île-de-France » et ligne sous le H1 supprimée (PR 105) ; règle « captures plutôt que lien d'aperçu…",
          "commit": "167dcef6aea00b3c8597acbc0b8c162aa85ce4b5"
        },
        "prochaine_action": "Ouvrir AB1 sur CADRAGE-AB-MULTIACTIVITE-2026-09-11.md (multi-activite dans le dossier artisan et la SiteSpec), au format 6 points avant toute ligne de code.",
        "bloque_par": [
          "EZZEDINE — assureur décennale, numéro de police, couverture géographique. Obligations d'affichage, rien ne les remplace.",
          "EZZEDINE — de vrais avis obtenus avec accord (`publication.avisReels`). Les avis en ligne sont fictifs : publier serait trompeur.",
          "EZZEDINE — relecture des textes de chantiers (`publication.textesConfirmes`). Détail dans CADRAGE-REPRISE-07-09.md.",
          "EZZEDINE — le NOM du domaine. C'est son enseigne et son référencement. Disponibilité mesurée le 2026-09-07.",
          "PAUL — achat du domaine puis NEXT_PUBLIC_SITE_URL en env Vercel, APRÈS réponse d'Ezzedine. Action payante ET credential.",
          "RÉSERVE, pas un blocage : l'adresse du siège est une DOMICILIATION (SOFRADOM). Voir le README du site, §Ce qui bloque."
        ],
        "en_attente_depuis": "2026-08-21",
        "boucles_ouvertes": [
          {
            "quoi": "DÉMO SPC — Paul a ajouté ARTISAN_DEPLOY_TARGET=spc en env Preview le 09/10. Sa PORTÉE n'est pas mesurée (lecture des env refusée en séance) : la preview de main sert SPC, donc…",
            "depuis": "2026-10-09"
          },
          {
            "quoi": "A RETIRER — la clé Studio. STUDIO_TOKEN SIGNE encore la session (lib/ownerSession.ts) : son retrait impose une clé de signature dédiée. Ne pas retirer l'un sans l'autre.",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "ENV Preview — STUDIO_TOKEN absent (mesuré le 14/09, PR 76) et SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY à vérifier : sans eux, une preview ne teste aucune connexion.",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "PRODUCTION verte le 14/09 (fab2dbe, READY). Ne pas croire la note « production rouge et VOULU » du commit 10143d2 : elle visait l'ancien déploiement couplé.",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "BASE — artisan_leads est VIDE (count(*) = 0 le 13/09 ; list_tables annonçait 1, c'était une estimation reltuples). Aucune demande n'y a jamais été enregistrée.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "BASE — artisan_leads : RLS active et ZÉRO policy. L'écriture passe par la service role de /api/lead ; anon et authenticated ne peuvent rien. Voulu, signalé INFO par l'advisor.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "PASSATION — la version CORRIGÉE du document n'a pas été suivie par une séance neuve. Seconde épreuve sur le §9 : c'est là que le critère se joue.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "VÉRIFICATION — 15 harnais navigateur (mesuré le 15/09) ; 3 tournent en CI (connexion par clé, par compte, parcours de l'atelier). Les 12 autres restent à la main.",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "DÉCISION OUVERTE — « un artisan, pas un dépanneur » est tranché pour SPC (14/09). Le générateur porte-t-il la même règle ? Un artisan dépanneur doit pouvoir le dire.",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "GARDE — `site.email` n'est pas signalé, et ce n'est pas un oubli : adresse plausible sous un domaine non acheté. À confirmer avec le domaine.",
            "depuis": "2026-09-13"
          }
        ],
        "maj": "2026-10-09"
      },
      "recits": [
        "dernier_arret.quoi",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "94d2cdd",
        "tete_le": "2026-10-13T18:08:46+02:00",
        "commits_depuis": 5,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.693Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 9,
      "jours_en_attente": 58,
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
        "rattache_a": "CADRAGE-2026-10-12-zone-pro.md · CADRAGE-2026-08-21-audit-pac.md · lib/audit-pac/PONT-RENODEVIS.md · RenoBoost/ROADMAP-2026-08-21-audit-et-acquisition.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "Un audit énergétique vendu et calculé chez un vrai client",
          "critere_de_sortie": "un audit calculé en réel, chez un client, depuis le relevé RénoDevis"
        },
        "dernier_arret": {
          "le": "2026-10-13",
          "quoi": "13/10 : audit PAC verrouillé RR/RO (#248) : appoint air/air, TVA du devis, part chauffage élec, prix oct. 2026, CEE estimés, MPR 0 si appoint fossile.",
          "commit": "f1288b285b005384003a3dca6205beb3d2d2cedd"
        },
        "prochaine_action": "Relire à la main les deux études PDF (RR et RO) que Paul chiffre sur RECETTE F6, avant le rendez-vous SOLA de fin de semaine.",
        "bloque_par": [
          "Paul ouvre les 4 sources lues en extrait (Tarif Bleu, prix repère gaz CRE, ELECDOM, eau chaude 800 kWh/occupant) : CADRAGE-2026-10-13-audit-pac-verrou.md §②",
          "Poser les secrets Vercel du pont audit-PAC, puis redéployer",
          "`MAGIC_LINK_SECRET` + `RESEND_API_KEY` + domaine Resend (magic link cross-device)",
          "`lib/site.ts` : passer `legalForm` d'EURL à SAS une fois publié au greffe",
          "Vérifier le statut du sitemap dans la Search Console (13 URLs)"
        ],
        "en_attente_depuis": "2026-08-21",
        "boucles_ouvertes": [
          {
            "quoi": "Prix repère gaz mensuel (0,1576 €/kWh annoncé au 01/11) : references.ts périme seul. Site grand public : CEE encore en montants fixes.",
            "depuis": "2026-10-13"
          },
          {
            "quoi": "10 PR ouvertes — 6 dependabot (react, next, @types/node, SDK, actions) et 4 brouillons dormants : #183 (12/07), #170 (02/07), #164 et #163 (06/06). À trier : ce qui dort depuis…",
            "depuis": "2026-06-06"
          }
        ],
        "maj": "2026-10-13"
      },
      "recits": [
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "97f65ec",
        "tete_le": "2026-10-14T00:42:58+02:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.679Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 5,
      "jours_en_attente": 58,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "paggerard-boop/Artidispo",
      "grain": {
        "projet": "Artidispo",
        "depot": "paggerard-boop/Artidispo",
        "cap": "Une plateforme d'abonnement pour artisans tous corps d'etat qui tourne en PASSIF : l'appel manque devient un RDV sans intervention humaine. Cible : 20 abonnements actifs au 30/11/2026, puis moins de 2 h par semaine de Paul a partir du 01/12/2026.",
        "rattache_a": "ROADMAPARTIDISPO.md (dates, gestes G1-G17, decisions ; §0quater : l'etat MESURE du code) · CADRAGE-2026-09-15-tunnel-artisan.md (le chantier du revenu, T0-T5) · CADRAGE-2026-09-22-six-semaines-pro.md (le cadre 22/09→03/11 : ce que « cote pro fini » veut dire) · CADRAGE-2026-09-14-annuaire-particulier.md (le chantier annuaire, B1-B9) · docs/SECRETS.md (les variables ET les trois purges) · docs/SPEC",
        "etat": "en_cours",
        "jalon": {
          "nom": "J1 — socle de l’inscription artisan autonome (sprint produit en cinq jours).",
          "critere_de_sortie": "ROADMAPARTIDISPO.md, Sprint inscription autonome : correctifs testés, contrat du parcours, accès et dépendances mesurés, puis preuves externes de docs/PREREQUIS_PRODUCTION.md. J1 reste ouvert tant que ces dernières manquent."
        },
        "dernier_arret": {
          "le": "2026-10-18",
          "quoi": "18/10 : voie A fusionnée (#137 → 42a8e82, CI verte) — inscription en 5 écrans guidés, le SIRET remplit tout. Détail : roadmap, entrée du 18/10.",
          "commit": "42a8e82b9d6b15678f9264cca27afbc942297364"
        },
        "prochaine_action": "Lundi 19/10 : Paul et Henry jouent la recette chrono de la voie A, montre en main, sur téléphone (#/artisan, ≤ 10 min) ; consigner temps et hésitations.",
        "bloque_par": [
          "⛔ PÉRIMÉ 18/10 : « #137 attend sa fusion », « déployer numero-artisan », « fusion #134 » — faits [MESURÉ]. Secrets Twilio non relus [NON VÉRIFIÉ].",
          "⛔ 17/10 — MANDAT MIGRATIONS DU 25/09 SUSPENDU (CLAUDE.md, Gates) : projet Supabase dans une nouvelle organisation, compte du connecteur LECTEUR (choix de Paul : pas de surcoût).…",
          "[MESURÉ 17/10 09:46 UTC, lecture seule, ids uniquement] 0 abonnement actif sur 20 visés : 2 artisans (505c5c4e… numéro technique posé ; db2c5f06… sans numéro), 0 publié, 0…",
          "[DÉCIDÉ par Paul — rapporté par B vers 12:40 UTC, CONFIRMÉ à la coordination vers 13:20 UTC] J2-bis « création déléguée par un admin » PAR LE BROUILLON DE J2 : fonction…",
          "[RAPPORTÉ par la séance A, 17/10 12:35 UTC, d’après les journaux d’auth] Le compte 488aca67… (créé le 13/10, sans fiche) est celui de Matthieu (SOLA), pas un compte de test…",
          "[MESURÉ 17/10 13:14 UTC] Base : migrations B (20261017140000) et C (20261017150000) NON appliquées, dernière migration 20261017095845 ; 2 artisans, 0 fiche publiée, 0 abonnement…",
          "[MESURÉ 17/10 12:06 UTC] Advisors Supabase (angle mort des revues) : aucun bloquant. Sécurité — 12 tables RLS sans policy (voulu : accès service_role seul) ; 14 fonctions definer…",
          "⏳ PAUL — LISTE UNIQUE ORDONNÉE DES GESTES (tenue par la séance coordination, complétée au fil des séances ; COMMENT les faire : docs/DEPLOIEMENT.md §4 — migration collable depuis…",
          "✅ 17/10 — conflit #126 sans objet : D a fusionné main (e0a2b78) dans sa branche (3805b46) avant la fusion ; FINUBAR.md et ROADMAPARTIDISPO.md se sont fusionnés sans conflit. #127…",
          "✅ FAIT ET MESURÉ LE 17/10 — NE PAS LE REJOUER : historique des migrations réaligné (39 entrées, 37 fichiers couverts ; administrateur_paul et verification_pilotage_paul restent…"
        ],
        "en_attente_depuis": "2026-09-08",
        "boucles_ouvertes": [],
        "maj": "2026-10-08"
      },
      "recits": [
        "bloque_par[]"
      ],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "fdec13f",
        "tete_le": "2026-10-18T09:24:07+00:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.708Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 10,
      "jours_en_attente": 40,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/renoboost-console",
      "grain": {
        "projet": "RénoBoost Console",
        "depot": "PaulGERARD161098/renoboost-console",
        "cap": "La console des AIDES DE L'ÉTAT : être toujours à jour sur les dispositifs et leurs tunnels, et conseiller juste en trois clics — particuliers, pros, entreprises. Règle d'or posée le 22/09 : la console n'implémente AUCUN barème, elle appelle le moteur officiel et cite sa source.",
        "rattache_a": "Ultima-/CADRAGE-2026-09-22-leo-pilote-tout.md §0bis (les mesures) et §3 (la règle des aides) · DATARENO-/CLAUDE.md (les garde-fous conformité applicables au conseil au particulier)",
        "etat": "en_cours",
        "jalon": {
          "nom": "J3 — l'écran des aides devient un outil de conseil (contexte logement, gestes, restitution client)",
          "critere_de_sortie": "Paul conseille un dossier de bout en bout sans quitter la console ni ressaisir une donnée"
        },
        "dernier_arret": {
          "le": "2026-09-30",
          "quoi": "PR #13 fusionnée, refonte en production. 44 tests et CI verts ; domaine et ressources HTTP 200. J3 et services réels restent à recevoir.",
          "commit": "baff92a53ca935671485291d41c03093c3f12f02"
        },
        "prochaine_action": "Reprendre J3 : enrichir gestes et contexte logement envoyés au moteur, puis recevoir les services métier réels. La refonte graphique est validée et publiée.",
        "bloque_par": [
          "⚠️ Le modèle officiel est FIGÉ : betagouv/reno arrêté au 18/12/2025, repris par l'ANAH. github.com/anahgouv pas encore ouvert — à surveiller.",
          "⚠️ Le repli embarqué (v2.3.1, 08/04/2025) porte des barèmes du guide Anah 2024. Il dépanne, il ne fait pas autorité. Empreinte SHA-256 gardée par test.",
          "GEMINI_API_KEY en variable d'environnement : action de Paul"
        ],
        "en_attente_depuis": "2026-09-10",
        "boucles_ouvertes": [],
        "maj": "2026-09-30"
      },
      "recits": [],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "602a19b",
        "tete_le": "2026-10-13T12:58:01+02:00",
        "commits_depuis": 11,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.663Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 18,
      "jours_en_attente": 38,
      "rang": 0
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/DATARENO-",
      "grain": {
        "projet": "DATA RÉNO",
        "depot": "PaulGERARD161098/DATARENO-",
        "cap": "Transformer une base acquise de 12 554 contacts réno (consentement client) en RDV qualifiés PAC, par cold outreach EMAIL segmenté par méthode de chauffage. Le plus automatique possible : clic humain uniquement pour envoyer et pour booker. Autonome, hors stack RénoBoost.",
        "rattache_a": "REPRISE.md (LE point de reprise, tenu en fin de chaque séance) · ROADMAP.md · TASKS.md (séquencement des phases) · SPEC.md (contrat de build figé) · PREMORTEM.md · GUIDE.md · LAUNCH.md · DEPLOY.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Gate 2 — le premier envoi réel : la chaîne brouillon → envoi → réponse tourne de bout en bout",
          "critere_de_sortie": "Preflight GO (✅ 23/09) · test à blanc réussi (mail-tester ≥ 9/10, Gmail + Outlook en boîte de réception) · micro-lot de 25 relu par Paul et ENVOYÉ · au moins une réponse reçue et tracée. Détail : REPRISE.md"
        },
        "dernier_arret": {
          "le": "2026-09-30",
          "quoi": "Bouclage transverse : CI une fois par push, LEÇONS v45. Rien d'autre n'a bougé depuis le 23/09 (preflight GO, garde-fou liens_a_jour).",
          "commit": "ea9f1a873f9c74800ee3bd37c62cf64854fb5cdb"
        },
        "prochaine_action": "Sur le PC d'envoi (C:\\Users\\User) seulement : relancer le preflight (liens_a_jour doit passer), puis le test à blanc sur test.sqlite, port 8766. Pas à pas : REPRISE.md.",
        "bloque_par": [
          "⚠️ Domaine renoadomicile.fr expire le 16/10/2026 — renouvellement à vérifier par Paul",
          "⚠️ Deux PC : seul C:\\Users\\User envoie ; le PC « pagge » a un .env incomplet et n'envoie jamais"
        ],
        "en_attente_depuis": "2026-09-23",
        "boucles_ouvertes": [],
        "maj": "2026-09-30"
      },
      "recits": [],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "4c707b1",
        "tete_le": "2026-10-13T12:58:09+02:00",
        "commits_depuis": 14,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.723Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 18,
      "jours_en_attente": 25,
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
        "rattache_a": "RenoDevis/CADRAGE-2026-09-15-corpus-rapprochement.md §9 (devis assisté, preuves et boucles) · Ultima-/PLAN-2026-09-30-chaine-A-Z.md (LA route de la chaîne A→Z et son état vivant) · CADRAGE-2026-09-30-chaine-A-Z.md (l'inventaire et le raisonnement) · ROADMAP-2026-09-29-fin-de-session.md (LA source de la reprise du 30/09) · Présentation commerciale (Artifact) : https://claude.ai/artifact/RKoFTEYyXd9",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-10-18",
          "quoi": "18/10 : #609 fusionnée (aperçu de partage « Le client vous attend »), en production ; nouvelle image vue par Paul sur WhatsApp.",
          "commit": "cc35e89669dccf4603ff3db34b29e61a1495873a"
        },
        "prochaine_action": "Devis assisté : recette authentifiée avec RenoDevis, corpus et Gmail (Ultima-/PLAN-2026-09-30-chaine-A-Z.md).",
        "bloque_par": [
          "Q10 : inscription RenoPredict de Matthieu (geste de Paul, « on verra plus tard » 06/10), puis vérification de liaison §3.3 quater et, si l'adresse diffère, une ligne SQL de lien…",
          "Crédit API Anthropic épuisé (02/10, 16:43 UTC) : Réno rend 502 en production. Recharger = dépense, geste de Paul.",
          "PAUL : vérifier que Stripe est en LIVE côté Artidispo — la vitrine dit « déjà disponible ! » depuis le 29/09 (3259da4) ; sans Stripe live, un artisan inscrit ne peut pas payer",
          "Les 14 PDF SOLA à déposer dans Drive + la réponse sur DEV235/201 (Paul, 30/09) ; le total des 9 devis signés (Paul)",
          "Validation d'Henry sur la présentation commerciale, et partage de l'Artifact avec lui par Paul (menu Partager) — 28/09",
          "Calendly : un seul événement actif sur le plan gratuit — tout nouvel événement créé par Paul coupe le site (mesuré 27/09)",
          "Photo du centre DEKRA : accord du client + la renvoyer (non versionnée) — 22/09",
          "Bandeau partenaires : le fichier du logo + l'accord d'y figurer (CLAUDE.md §12.5) — 22/09",
          "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09",
          "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "Q10 — chaîne en production, NON éprouvée : 0 pose rattachée. Attend l'inscription RenoPredict de Matthieu puis un sticker (A9). Activation : CADRAGE-2026-09-30-chaine-A-Z.md §3.3…",
            "depuis": "2026-10-06"
          },
          {
            "quoi": "CA par artisan (05/10) : onglet « Devis & CA » + barre des cartes pros, sur branche claude/dazzling-brahmagupta-vrbbin. Reste la recette connectée de Paul sur la preview, puis la…",
            "depuis": "2026-10-05"
          },
          {
            "quoi": "Devis assisté : #566 et RenoDevis #218 fusionnés et déployés le 01/10. Restent trajet authentifié de bout en bout, corpus incomplet et Gmail ; aucun appel IA réel encore éprouvé.",
            "depuis": "2026-10-01"
          },
          {
            "quoi": "⚠️ HOPUS CLOS à 13/15 par Paul le 20/09 — puis la vitrine REFONDUE (326064e). Patterns NON re-mesurés depuis. Détail : ROADMAP-2026-09-20-fin-de-session.md",
            "depuis": "2026-09-19"
          },
          {
            "quoi": "⚖️ DEUX RÈGLES D'ARGENT DIVERGENT — la part fixe s'ajoute-t-elle à la commission (landing-core.js, testé) ou s'en déduit-elle (index.html §modele, arbitrage du 13/09) ? 900 €…",
            "depuis": "2026-09-19"
          },
          {
            "quoi": "Console lot 1 — PR #459 : indicateurs et raccourcis fiabilisés (le bilan serveur lisait un cache de 140 clients contre 169 fiches ; 7 devis « en attente » incluaient 2 Perdus).…",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "Console — PR #454 : corrections de mise en page, filtre Refusés, budgets et détails de RDV, testées (59 contrôles, jobs GitHub verts). ⚠️ LE CONTRÔLE VISUEL CONNECTÉ N'A JAMAIS…",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "Reprise radar : relancer l'import du 69 (« Rhone,… · département 69 ») — la mesure directe ET l'écart d'un couple douteux sont en ligne (#451). Ensuite : décider du ré-import de…",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "⚠️ AUCUNE PREUVE QUE LES CRONS PARTENT — le correctif du 15/09 est fusionné et déployé, mais rien ne prouve encore qu'il fonctionne. Mesure armée : `/api/linkedin` le 16/09 08:00…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⏳ ATTEND PAUL — les 3 gestes du rail mail (Resend, Vercel, filtre Gmail), et le post LinkedIn de la semaine qui n'a jamais été généré : à publier à la main, le correctif ne vaut…",
            "depuis": "2026-09-15"
          }
        ],
        "maj": "2026-10-06"
      },
      "recits": [
        "bloque_par[]",
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
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-18T09:24:09.603Z",
        "examines": [
          "FINUBAR.md",
          "derive_git"
        ],
        "non_examines": [
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "jours_depuis_maj": 12,
      "jours_en_attente": 75,
      "rang": 2
    }
  ],
  "macro": {
    "total": 10,
    "lisibles": 10,
    "illisibles": 0,
    "hors_seance": 0,
    "repris": 0,
    "en_cours": 8,
    "en_attente_de_paul": 2,
    "au_repos": 0,
    "derives": 9,
    "commits_inconnus": 0,
    "boucles_ouvertes": 46,
    "gestes_de_paul": [
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
        "geste": "Inscription RenoPredict de Matthieu (Login → Onboarding) — sans elle, « Fin de pose » n'a aucun chantier à proposer."
      },
      {
        "projet": "RénoPredict",
        "geste": "CHAINE_POSE_SECRET sur les deux projets Vercel : déclaré posé par Paul le 06/10 (« fait »), NON vérifiable depuis une séance (proxy). Absent, `demanderARenoboost` rend «…"
      },
      {
        "projet": "RénoPredict",
        "geste": "Imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08, reporté par Paul le 07/09 sans date. Le piège de l'URL est refermé depuis le 01/09."
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
        "geste": "Paul valide les devis e-mail sur /devis/email (B3) avant la clé Stripe live (A6a)."
      },
      {
        "projet": "RénoDevis",
        "geste": "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul."
      },
      {
        "projet": "RénoDevis",
        "geste": "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true, ouverts:0 — remesuré le 08/10 à 06:30 UTC."
      },
      {
        "projet": "RénoDevis",
        "geste": "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
      },
      {
        "projet": "Ultima",
        "geste": "Paramétrage ChatGPT et Gemini PÉRIMÉ depuis le 10/10 (Directive ZS) : Paul recolle les blocs §7–9 d'EXPORT-METHODE-CHATGPT.md et §2–4 d'EXPORT-METHODE-GEMINI.md (empreinte…"
      },
      {
        "projet": "Ultima",
        "geste": "Inscription Supabase d'Ultima MESURÉE OUVERTE le 04/10 (e-mail + Google) — geste de Paul : Authentication › Sign In / Providers › désactiver « Allow new users to sign up ». Le…"
      },
      {
        "projet": "Ultima",
        "geste": "B4 (Réno lit Artidispo) : code vert (9/9), preuve impossible depuis la séance — Paul demande « Où en est Artidispo ? » à Réno (dashboard) ; la trace Artidispo est dans un projet…"
      },
      {
        "projet": "Ultima",
        "geste": "B1 ⑤ — choix d'accès : le mail du matin lit-il le journal de Léo ? reco : fonction SQL dédiée + secret (migration) · `updated_at` sur journal/scenarios (migration)"
      },
      {
        "projet": "Ultima",
        "geste": "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée"
      },
      {
        "projet": "Ultima",
        "geste": "La précision sur « mon dpe.fr » (VITRUVE)"
      },
      {
        "projet": "Ultima",
        "geste": "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis"
      },
      {
        "projet": "artisan-builder",
        "geste": "EZZEDINE — assureur décennale, numéro de police, couverture géographique. Obligations d'affichage, rien ne les remplace."
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
        "geste": "RÉSERVE, pas un blocage : l'adresse du siège est une DOMICILIATION (SOFRADOM). Voir le README du site, §Ce qui bloque."
      },
      {
        "projet": "mon-dpe.fr",
        "geste": "Paul ouvre les 4 sources lues en extrait (Tarif Bleu, prix repère gaz CRE, ELECDOM, eau chaude 800 kWh/occupant) : CADRAGE-2026-10-13-audit-pac-verrou.md §②"
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
        "projet": "Artidispo",
        "geste": "⛔ PÉRIMÉ 18/10 : « #137 attend sa fusion », « déployer numero-artisan », « fusion #134 » — faits [MESURÉ]. Secrets Twilio non relus [NON VÉRIFIÉ]."
      },
      {
        "projet": "Artidispo",
        "geste": "⛔ 17/10 — MANDAT MIGRATIONS DU 25/09 SUSPENDU (CLAUDE.md, Gates) : projet Supabase dans une nouvelle organisation, compte du connecteur LECTEUR (choix de Paul : pas de surcoût).…"
      },
      {
        "projet": "Artidispo",
        "geste": "[MESURÉ 17/10 09:46 UTC, lecture seule, ids uniquement] 0 abonnement actif sur 20 visés : 2 artisans (505c5c4e… numéro technique posé ; db2c5f06… sans numéro), 0 publié, 0…"
      },
      {
        "projet": "Artidispo",
        "geste": "[DÉCIDÉ par Paul — rapporté par B vers 12:40 UTC, CONFIRMÉ à la coordination vers 13:20 UTC] J2-bis « création déléguée par un admin » PAR LE BROUILLON DE J2 : fonction…"
      },
      {
        "projet": "Artidispo",
        "geste": "[RAPPORTÉ par la séance A, 17/10 12:35 UTC, d’après les journaux d’auth] Le compte 488aca67… (créé le 13/10, sans fiche) est celui de Matthieu (SOLA), pas un compte de test…"
      },
      {
        "projet": "Artidispo",
        "geste": "[MESURÉ 17/10 13:14 UTC] Base : migrations B (20261017140000) et C (20261017150000) NON appliquées, dernière migration 20261017095845 ; 2 artisans, 0 fiche publiée, 0 abonnement…"
      },
      {
        "projet": "Artidispo",
        "geste": "[MESURÉ 17/10 12:06 UTC] Advisors Supabase (angle mort des revues) : aucun bloquant. Sécurité — 12 tables RLS sans policy (voulu : accès service_role seul) ; 14 fonctions definer…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ PAUL — LISTE UNIQUE ORDONNÉE DES GESTES (tenue par la séance coordination, complétée au fil des séances ; COMMENT les faire : docs/DEPLOIEMENT.md §4 — migration collable depuis…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ 17/10 — conflit #126 sans objet : D a fusionné main (e0a2b78) dans sa branche (3805b46) avant la fusion ; FINUBAR.md et ROADMAPARTIDISPO.md se sont fusionnés sans conflit. #127…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 17/10 — NE PAS LE REJOUER : historique des migrations réaligné (39 entrées, 37 fichiers couverts ; administrateur_paul et verification_pilotage_paul restent…"
      },
      {
        "projet": "RénoBoost Console",
        "geste": "⚠️ Le modèle officiel est FIGÉ : betagouv/reno arrêté au 18/12/2025, repris par l'ANAH. github.com/anahgouv pas encore ouvert — à surveiller."
      },
      {
        "projet": "RénoBoost Console",
        "geste": "⚠️ Le repli embarqué (v2.3.1, 08/04/2025) porte des barèmes du guide Anah 2024. Il dépanne, il ne fait pas autorité. Empreinte SHA-256 gardée par test."
      },
      {
        "projet": "RénoBoost Console",
        "geste": "GEMINI_API_KEY en variable d'environnement : action de Paul"
      },
      {
        "projet": "DATA RÉNO",
        "geste": "⚠️ Domaine renoadomicile.fr expire le 16/10/2026 — renouvellement à vérifier par Paul"
      },
      {
        "projet": "DATA RÉNO",
        "geste": "⚠️ Deux PC : seul C:\\Users\\User envoie ; le PC « pagge » a un .env incomplet et n'envoie jamais"
      },
      {
        "projet": "RénoBoost",
        "geste": "Q10 : inscription RenoPredict de Matthieu (geste de Paul, « on verra plus tard » 06/10), puis vérification de liaison §3.3 quater et, si l'adresse diffère, une ligne SQL de lien…"
      },
      {
        "projet": "RénoBoost",
        "geste": "Crédit API Anthropic épuisé (02/10, 16:43 UTC) : Réno rend 502 en production. Recharger = dépense, geste de Paul."
      },
      {
        "projet": "RénoBoost",
        "geste": "PAUL : vérifier que Stripe est en LIVE côté Artidispo — la vitrine dit « déjà disponible ! » depuis le 29/09 (3259da4) ; sans Stripe live, un artisan inscrit ne peut pas payer"
      },
      {
        "projet": "RénoBoost",
        "geste": "Les 14 PDF SOLA à déposer dans Drive + la réponse sur DEV235/201 (Paul, 30/09) ; le total des 9 devis signés (Paul)"
      },
      {
        "projet": "RénoBoost",
        "geste": "Validation d'Henry sur la présentation commerciale, et partage de l'Artifact avec lui par Paul (menu Partager) — 28/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Calendly : un seul événement actif sur le plan gratuit — tout nouvel événement créé par Paul coupe le site (mesuré 27/09)"
      },
      {
        "projet": "RénoBoost",
        "geste": "Photo du centre DEKRA : accord du client + la renvoyer (non versionnée) — 22/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Bandeau partenaires : le fichier du logo + l'accord d'y figurer (CLAUDE.md §12.5) — 22/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09"
      },
      {
        "projet": "RénoBoost",
        "geste": "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09"
      }
    ]
  },
  "couverture": {
    "attendus": [
      "PaulGERARD161098/Ultima-",
      "PaulGERARD161098/RenoBoost",
      "PaulGERARD161098/RenoDevis",
      "PaulGERARD161098/RenoAgenda",
      "PaulGERARD161098/RenoPredict",
      "PaulGERARD161098/renoboost-console",
      "PaulGERARD161098/mon-dpe.fr",
      "PaulGERARD161098/artisan-builder",
      "paggerard-boop/Artidispo",
      "PaulGERARD161098/DATARENO-"
    ],
    "controles": [
      "PaulGERARD161098/Ultima-",
      "PaulGERARD161098/RenoBoost",
      "PaulGERARD161098/RenoDevis",
      "PaulGERARD161098/RenoAgenda",
      "PaulGERARD161098/RenoPredict",
      "PaulGERARD161098/renoboost-console",
      "PaulGERARD161098/mon-dpe.fr",
      "PaulGERARD161098/artisan-builder",
      "paggerard-boop/Artidispo",
      "PaulGERARD161098/DATARENO-"
    ],
    "inaccessibles": [],
    "non_examines": [],
    "anomalies": [],
    "portee": "Registre seulement. PR, contrôles, permissions et dépendances non examinés."
  },
  "cartouche": {
    "signaux": [
      {
        "projet": "RénoAgenda",
        "dit": "a avancé de 14 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoPredict",
        "dit": "a avancé de 2 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoDevis",
        "dit": "a avancé de 23 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      }
    ],
    "action": {
      "projet": "RénoAgenda",
      "nature": "code",
      "faire": "Boucle D4 : réduire partenaires.html au logo et fermer les colonnes démarchables de artisans_vitrine. Puis V1 : inventaire des réalisations avec accord.",
      "cap": "Marketplace particuliers ↔ artisans RGE : la demande arrive, se qualifie et se dispatche toute seule."
    },
    "illisibles": 0,
    "hors_seance": 0
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/RenoAgenda",
        "libelle": "RénoAgenda",
        "constellation": "en_cours",
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
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/Ultima-",
        "libelle": "Ultima",
        "constellation": "en_cours",
        "ciel": "racine",
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
        "id": "PaulGERARD161098/mon-dpe.fr",
        "libelle": "mon-dpe.fr",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "paggerard-boop/Artidispo",
        "libelle": "Artidispo",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/renoboost-console",
        "libelle": "RénoBoost Console",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/DATARENO-",
        "libelle": "DATA RÉNO",
        "constellation": "en_attente_de_paul",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 0
      }
    ],
    "relations": []
  },
  "zohshia": {
    "mesurable": true,
    "base": "f1f9fb3",
    "tete": "dd806dc",
    "commits": 361,
    "touchent": 145,
    "fichiers_touches": 111,
    "releve_le": null,
    "report": {
      "valide": true,
      "le": "2026-10-10",
      "condition": "juste après J4 (la formule de l'instance de référence devenue paramètres du pro)",
      "pourquoi": "25 des 32 conflits sont dans les fichiers que J4 réécrit ; rafraîchie avant, la série le serait deux fois (arbitrage de Paul)"
    },
    "reprise": false,
    "mesure_le": "2026-10-18",
    "alerte": true,
    "phrase": "ZOH SHIA — ⚠️ EN RETARD : RénoDevis a avancé de 361 commit(s) depuis la série (f1f9fb3 → dd806dc) (date de relevé du clone inconnue), dont 145 sur des fichiers qu'elle retouche (111 fichier(s)) : l'extraction refusera probablement. Report décidé le 2026-10-10 : rafraîchir juste après J4 (la formule de l'instance de référence devenue paramètres du pro) — 25 des 32 conflits sont dans les fichiers que J4 réécrit ; rafraîchie avant, la série le serait deux fois (arbitrage de Paul) (TECHNO §8)."
  }
};
