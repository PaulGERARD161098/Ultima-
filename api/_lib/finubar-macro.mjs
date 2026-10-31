// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-10-31",
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "33bdcf0",
        "tete_le": "2026-10-13T12:57:54+02:00",
        "commits_depuis": 14,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 31,
      "jours_en_attente": 108,
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "c188c46",
        "tete_le": "2026-10-13T12:57:58+02:00",
        "commits_depuis": 2,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 25,
      "jours_en_attente": 88,
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
          "le": "2026-10-22",
          "quoi": "22/10 : #615 FUSIONNÉE (merge 96301be, go de Paul sur 7096b00) — onglet Profil & accord, commission estimée lue dans profil_accord, abonnement 1 000 € HT/mois dès le 01/01/2027…",
          "commit": "96301be9e905215f457ff6d9aa52ac87c963b13a"
        },
        "prochaine_action": "Paul donne son go de fusion, sur le SHA, à la PR de branche claude/spc-profil-accord (verrou anti-écrasement étendu aux dictionnaires du kv_store) ; ensuite : Devis assisté…",
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
            "quoi": "⛔ Verrou anti-écrasement du kv_store : il ne couvrait que les TABLEAUX. Le profil SPC (dictionnaire rb_pros_overrides), écrit côté serveur le 22/10 (13:27 UTC, complété avant…",
            "depuis": "2026-10-22"
          },
          {
            "quoi": "SPC (22/10) : accord propre à SPC (7 % du devis HT signé jusqu'au 31/12/2026 inclus, puis 1 000 € HT/mois) — code FUSIONNÉ (#615), profil dans rb_pros_overrides du compte…",
            "depuis": "2026-10-22"
          },
          {
            "quoi": "Revue Codex de #611 (21/10, arrivée APRÈS la fusion) : 9 constats P2, fils ouverts, aucun traité. Sept sur scripts/importer-leads-helloartisan.mjs (déjà joué : doublons internes à…",
            "depuis": "2026-10-21"
          },
          {
            "quoi": "Coûts fixes Vercel/GitHub (19/10) : #611 FUSIONNÉE le 21/10 (2015249) — en production, les .md répondent 404 (lu le 21/10). À constater sur la durée, non encore observé : un seul…",
            "depuis": "2026-10-19"
          },
          {
            "quoi": "Leads helloArtisan DOKLÈS/SPC (19/10) : 9 fiches et 5 RDV en base, script fusionné avec #611 le 21/10. Restent : tenir les RDV, issue des RDV sans écran, décisions RGPD/origine de…",
            "depuis": "2026-10-19"
          },
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
          }
        ],
        "maj": "2026-10-22"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "db62c43",
        "tete_le": "2026-10-22T21:32:45+02:00",
        "commits_depuis": 2,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-23",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.109Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 9,
      "jours_en_attente": 88,
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "94d2cdd",
        "tete_le": "2026-10-13T18:08:46+02:00",
        "commits_depuis": 5,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 22,
      "jours_en_attente": 71,
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "97f65ec",
        "tete_le": "2026-10-14T00:42:58+02:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 18,
      "jours_en_attente": 71,
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
          "le": "2026-10-20",
          "quoi": "Liens publics préparés sur le go de Paul : fiche /r conservée, réservation /rdv directe partagée par espace pro et SMS, copie sans jeton et guide Google. 966/966 tests, build, 66…",
          "commit": "a08aa1264920d97a81a959b2cea12eeb0e524df9"
        },
        "prochaine_action": "Recevoir CI et aperçu de cette branche, vérifier la redirection courte, puis publier le front. Ensuite l’opérateur ayant les droits déploie twilio-voice et numero-artisan depuis…",
        "bloque_par": [
          "⏳ 20/10 — Liens publics : CI/route courte sur aperçu à recevoir ; accès Supabase Artidispo refusé par le connecteur (lecture seule tentée, aucune écriture). Les déploiements Edge…",
          "✅ 19/10 J2-bis SOLA FERMÉ : #150 et #152 fusionnées ; 4 migrations collées et contrôlées ; offrir-abonnement déployée ; SOLA déposée, offerte, publiée, numérotée. ⛔ PÉRIMÉ : «…",
          "⏳ Avant tout envoi de sa fiche à Matthieu : photos de chantiers de SOLA à mettre à jour (Paul, via « Photos de sa fiche »). La photo d'équipe est en tête et la fiche publique est…",
          "✅ MESURÉ le 20/10 dans le navigateur public : « climatisation » + 69130 retrouve SOLA GROUPE ; sa fiche /r/sola-groupe-ecully ouvre le bon formulaire de réservation et ses…",
          "⏳ Téléphone SOLA : vérification Twilio + appel test (Paul), renvoi **61* (Matthieu, opérateur inconnu).",
          "⚠️ CGV : le parrainage a ajouté un paragraphe à src/cgv.html sans changer sa date (« 18/09 ») — SOLA a accepté sur mandat « cgv-2026-09-18 » dont le texte a changé le 19/10…",
          "⚠️ Abonnement offert × parrainage : un abonnement offert compte « actif » → SOLA peut devenir parrain ; décider si un pro offert touche une récompense (P3/P5).",
          "⏭ F1 suite (mise de côté par Paul le 19/10) : autres photos (réalisation PV) ; F2 site + avis Google (D2) ; C3 purge des photos orphelines ; recette Managed Payments avant de…",
          "✅ 19/10 PARRAINAGE P2 FERMÉ : #151 fusionnée (d6ee419) ; migration P1 20261019190000 posée par Paul (historique posé, contrôle OK, déclaré) ; create-checkout déployé depuis…",
          "⏳ #150 (J2-bis suite : dépôt sur mandat, abonnement offert) est FUSIONNÉE dans main par une autre séance ; ses gestes pour Paul sont dans DEPLOIEMENT §4.9 (migration…"
        ],
        "en_attente_depuis": "2026-09-08",
        "boucles_ouvertes": [],
        "maj": "2026-10-19"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]"
      ],
      "ciel": "alpha",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "c8d0d09",
        "tete_le": "2026-10-20T20:02:49+02:00",
        "commits_depuis": 14,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-21",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 12,
      "jours_en_attente": 53,
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "602a19b",
        "tete_le": "2026-10-13T12:58:01+02:00",
        "commits_depuis": 11,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 31,
      "jours_en_attente": 51,
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
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "4c707b1",
        "tete_le": "2026-10-13T12:58:09+02:00",
        "commits_depuis": 14,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-18",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 31,
      "jours_en_attente": 38,
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
          "le": "2026-10-23",
          "quoi": "23/10, trois séances : (1) V2 PUBLIÉE (#419, fusionnée 10:33 UTC sur demande explicite de Paul ; elle lève le gel décidé le 22/10) ; (2) Relances automatiques bloquées (RD#404…",
          "commit": "7959e1159e4b9b73e14fb286371db3f655a71d0c"
        },
        "prochaine_action": "Lire battement:rr-stripe-embarquement après le 24/10 06:30 UTC : attendu test=false, remplaces=2 (comptes réels de SOLA et DOKLES, sans mail) ; si oui, A6b (Matthieu termine son…",
        "bloque_par": [
          "Relances automatiques BLOQUÉES depuis le 21/10 (interrupteur relances:envoi-auto, fermé par défaut) : la réouverture est une décision de Paul, après relecture de la file.",
          "KYC Stripe de SOLA (A6b) : 0 compte sur 2 peut encaisser (remesuré le 23/10 07:56 UTC). Il s'ouvre après la création des comptes réels par le cron ; le KYC réel reste à l'artisan…",
          "A6a : clé sk_live_ posée par Paul et production redéployée le 23/10 ; le battement du 23/10 06:30 UTC dit encore test:true — la preuve est le battement du 24/10.",
          "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "Coûts fixes (21/10, boucle pilotée depuis Ultima-/CLAUDE.md « BUDGET FIXE ») : ci.yml saute npm test, poppler et le corpus quand seuls des .md changent (≈ 146 s sur 478, run…",
            "depuis": "2026-10-21"
          },
          {
            "quoi": "Étude d’économies : 0 devis chiffré dans l’app au 13/10, donc aucun PDF réel ; 0 audit tracé (devis.extra.audit_pac).",
            "depuis": "2026-10-13"
          },
          {
            "quoi": "Agent SOLA : accès base reçu, précontrôle quota/budget complété ; Meta refuse encore son API. Lire la restriction Meta puis lever, recontrôler et reconduire la fenêtre pilote sans…",
            "depuis": "2026-10-14"
          },
          {
            "quoi": "Synchro Gmail : un mail-devis devient une ligne de journal sur la fiche RB (43 posées), plus aucun dossier RD — prouvé au cron du 21/10. Boucle close le 21/10 (5 dossiers sans…",
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
          }
        ],
        "maj": "2026-10-23"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-23",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-31T14:56:31.110Z",
        "statut": "non_examine",
        "examines": [],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ]
      },
      "motif_controle": "repli GitHub désactivé",
      "jours_depuis_maj": 8,
      "jours_en_attente": 75,
      "rang": 2
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
          "le": "2026-10-31",
          "quoi": "Supervision et réemploi construite sur branche (étapes 1 à 8, cadrage validé par Paul : preuves typées zoh:/finubar:, pas de purge, outil proposer_supervision ORANGE sur FINUBAR…",
          "commit": "8961c8c460bcb3245213dbeba85516b97efe60f8"
        },
        "prochaine_action": "Lire la CI et la revue de sécurité de la PR supervision ; puis gate ⑧ (Paul applique la migration et lance les deux vérifications de RUNBOOK-GATES.md), et seulement après…",
        "bloque_par": [
          "proposer_contact en production (fusionné 77b475a, 23/10) : la preuve réelle est un geste de Paul — dicter un contact à Léo sur RIVEN, puis « rappelle-le lundi » ; la lecture en…",
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
            "quoi": "Supervision et réemploi : construite et éprouvée sur branche (PR à lire). Restent : revue de sécurité indépendante, CI, fusion sur accord de Paul, gate ⑧ (migration non…",
            "depuis": "2026-10-31"
          },
          {
            "quoi": "Retour RenoDevis du 29/10 : leçons v111 et contrat R29 documentés sur branche, sans fusion ni activation. Sources : memoire/JOURNAL-DECISIONS.md et zohshia/renodevis/TECHNO.md…",
            "depuis": "2026-10-29"
          },
          {
            "quoi": "Léo → stock ZOH : aperçu issu des fiches, système et handler réels raccordés ; sept comportements simulés, refus et contre-épreuves passent. Cartouche complet ajouté au harnais…",
            "depuis": "2026-10-25"
          },
          {
            "quoi": "Présentations claires : compétences raccordées aux cinq onglets ZOH et étoile sous ZOH SHIA, source a791dd655b6ea1c2243f9d99bd80beb06a3eebf9. Registre, adaptateur, neutralité…",
            "depuis": "2026-10-25"
          },
          {
            "quoi": "proposer_contact — douzième outil de Léo (RIVEN, vert confirmé par Paul, type requis) : cadré, construit et FUSIONNÉ le 23/10 (CADRAGE-RIVEN-SAISIE.md §8, #415 → 77b475a), aucune…",
            "depuis": "2026-10-23"
          },
          {
            "quoi": "Chaîne RB — audit du 22/10 (AUDIT-2026-10-22-chaine-RB.md §5) : #394 et RenoDevis #372 fusionnées (étape 1 ✅) ; A6a geste fait, preuve au battement du 24/10 06:30 UTC ; restent…",
            "depuis": "2026-10-22"
          },
          {
            "quoi": "AMATSU : boucles 1 (l'étoile), 2a (la voix de Léo), 2b-α (maquette) et 2b-β (la page de la rose des vents) FERMÉES — 2b fusionnée le 19/10 (#403, d4ff809 ; amatsu.html en…",
            "depuis": "2026-10-18"
          },
          {
            "quoi": "Coûts (19/10 → 21/10) : leviers posés et fusionnés le 21/10 dans tous les dépôts où ils sont rentables — RenoBoost#611 (L3 + .md hors déploiement), RenoDevis#407 (L2 + .md exclus…",
            "depuis": "2026-10-19"
          },
          {
            "quoi": "Pilotage ZOH : accès HTTP avec une vraie session propriétaire encore non éprouvé depuis Work (protection Vercel après redirection ; CLI absent). Source et tests sont livrés.…",
            "depuis": "2026-10-13"
          },
          {
            "quoi": "LEÇONS v91 (12–13/10, quatre leçons) dans Ultima seulement : propager aux neuf dépôts (procédure LECONS-PROCEDURE.md, lecons-chemins à 0 d'abord).",
            "depuis": "2026-10-12"
          }
        ],
        "maj": "2026-10-25"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "racine",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-31",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-31T14:56:31.109Z",
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
      "jours_depuis_maj": 6,
      "jours_en_attente": 72,
      "rang": 2
    }
  ],
  "macro": {
    "total": 10,
    "lisibles": 10,
    "illisibles": 0,
    "hors_seance": 0,
    "repris": 9,
    "en_cours": 8,
    "en_attente_de_paul": 2,
    "au_repos": 0,
    "derives": 8,
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
        "geste": "⏳ 20/10 — Liens publics : CI/route courte sur aperçu à recevoir ; accès Supabase Artidispo refusé par le connecteur (lecture seule tentée, aucune écriture). Les déploiements Edge…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ 19/10 J2-bis SOLA FERMÉ : #150 et #152 fusionnées ; 4 migrations collées et contrôlées ; offrir-abonnement déployée ; SOLA déposée, offerte, publiée, numérotée. ⛔ PÉRIMÉ : «…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ Avant tout envoi de sa fiche à Matthieu : photos de chantiers de SOLA à mettre à jour (Paul, via « Photos de sa fiche »). La photo d'équipe est en tête et la fiche publique est…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ MESURÉ le 20/10 dans le navigateur public : « climatisation » + 69130 retrouve SOLA GROUPE ; sa fiche /r/sola-groupe-ecully ouvre le bon formulaire de réservation et ses…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ Téléphone SOLA : vérification Twilio + appel test (Paul), renvoi **61* (Matthieu, opérateur inconnu)."
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ CGV : le parrainage a ajouté un paragraphe à src/cgv.html sans changer sa date (« 18/09 ») — SOLA a accepté sur mandat « cgv-2026-09-18 » dont le texte a changé le 19/10…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ Abonnement offert × parrainage : un abonnement offert compte « actif » → SOLA peut devenir parrain ; décider si un pro offert touche une récompense (P3/P5)."
      },
      {
        "projet": "Artidispo",
        "geste": "⏭ F1 suite (mise de côté par Paul le 19/10) : autres photos (réalisation PV) ; F2 site + avis Google (D2) ; C3 purge des photos orphelines ; recette Managed Payments avant de…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ 19/10 PARRAINAGE P2 FERMÉ : #151 fusionnée (d6ee419) ; migration P1 20261019190000 posée par Paul (historique posé, contrôle OK, déclaré) ; create-checkout déployé depuis…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ #150 (J2-bis suite : dépôt sur mandat, abonnement offert) est FUSIONNÉE dans main par une autre séance ; ses gestes pour Paul sont dans DEPLOIEMENT §4.9 (migration…"
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
        "projet": "RénoDevis",
        "geste": "Relances automatiques BLOQUÉES depuis le 21/10 (interrupteur relances:envoi-auto, fermé par défaut) : la réouverture est une décision de Paul, après relecture de la file."
      },
      {
        "projet": "RénoDevis",
        "geste": "KYC Stripe de SOLA (A6b) : 0 compte sur 2 peut encaisser (remesuré le 23/10 07:56 UTC). Il s'ouvre après la création des comptes réels par le cron ; le KYC réel reste à l'artisan…"
      },
      {
        "projet": "RénoDevis",
        "geste": "A6a : clé sk_live_ posée par Paul et production redéployée le 23/10 ; le battement du 23/10 06:30 UTC dit encore test:true — la preuve est le battement du 24/10."
      },
      {
        "projet": "RénoDevis",
        "geste": "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
      },
      {
        "projet": "Ultima",
        "geste": "proposer_contact en production (fusionné 77b475a, 23/10) : la preuve réelle est un geste de Paul — dicter un contact à Léo sur RIVEN, puis « rappelle-le lundi » ; la lecture en…"
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
      "PaulGERARD161098/Ultima-"
    ],
    "inaccessibles": [],
    "non_examines": [
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
        "projet": "RénoBoost",
        "dit": "a avancé de 2 commit(s) depuis sa dernière note",
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
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
        "constellation": "en_cours",
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
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 0
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
    "reprise": true,
    "mesure_le": "2026-10-18",
    "alerte": true,
    "phrase": "(mesure du 2026-10-18, reprise : dépôt de référence absent de cette séance) ZOH SHIA — ⚠️ EN RETARD : RénoDevis a avancé de 361 commit(s) depuis la série (f1f9fb3 → dd806dc) (date de relevé du clone inconnue), dont 145 sur des fichiers qu'elle retouche (111 fichier(s)) : l'extraction refusera probablement. Report décidé le 2026-10-10 : rafraîchir juste après J4 (la formule de l'instance de référence devenue paramètres du pro) — 25 des 32 conflits sont dans les fichiers que J4 réécrit ; rafraîchie avant, la série le serait deux fois (arbitrage de Paul) (TECHNO §8)."
  }
};
