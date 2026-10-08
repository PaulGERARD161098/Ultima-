// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-10-08",
  "projets": [
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
          "le": "2026-10-06",
          "quoi": "#587 fusionnée : la frise du projet ne lit plus « À envoyer » comme « envoyé » (clientToStage, harnais tests/projet-etape-devis.test.mjs). Même jour, Q10 en production, NON…",
          "commit": "e570f499268afd8dd0410fbea9ba30c24d01b6c3"
        },
        "prochaine_action": "Devis assisté : recette authentifiée avec RenoDevis, corpus et Gmail. Livraison #566/#218 faite. La chaîne A→Z conserve sa route dans Ultima-/PLAN-2026-09-30-chaine-A-Z.md.",
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
        "dernier_arret.quoi",
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "380e7a2",
        "tete_le": "2026-10-08T12:36:49+00:00",
        "commits_depuis": 5,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-08",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-08T22:12:05.004Z",
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
      "jours_depuis_maj": 2,
      "jours_en_attente": 65,
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
          "le": "2026-10-08",
          "quoi": "08/10 : #366, #361, #367, #368 et #369 fusionnées (RIVEN, dictée, Léo seul en bas, leçons v77). Nuit : devis pro livré dans RenoDevis (#314).",
          "commit": "6203fe407c742fce562de2ae1cc7e6629d9162ac"
        },
        "prochaine_action": "Reprendre « Léo partout sans candidats » (boucle du 06/10) : fournir les candidats, ou ne pas offrir l'outil là où la page ne peut pas l'exécuter.",
        "bloque_par": [
          "Inscription Supabase d'Ultima MESURÉE OUVERTE le 04/10 (e-mail + Google) — geste de Paul : Authentication › Sign In / Providers › désactiver « Allow new users to sign up ». Le…",
          "R1 (B4) en production, non prouvée : Réno a rendu 502 le 02/10 à 16:43 UTC. Le crédit étant rechargé, lui demander « Où en est Artidispo ? » et comparer à la base (PLAN §2).",
          "B1 ⑤ — choix d'accès : le mail du matin lit-il le journal de Léo ? reco : fonction SQL dédiée + secret (migration) · `updated_at` sur journal/scenarios (migration)",
          "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée",
          "La précision sur « mon dpe.fr » (VITRUVE)",
          "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "ZOH · série neutre à rafraîchir (130 commits de retard, 46 conflits) : séance dédiée décidée le 08/10. Voir CADRAGE-2026-10-08-zohshia-generateur-devis-pro.md.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Dictée qui suit les pauses (#367) : non prouvée sur téléphone (le harnais simule les coupures). Recette = une dictée réelle de Paul, avec des pauses.",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "LEÇONS v77 propagées dans RenoDevis et Artidispo seulement : les sept autres dépôts sont en retard, et lecons-chemins n'a pas pu tourner (clones absents de la séance).",
            "depuis": "2026-10-08"
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
            "quoi": "Chaîne — B4 réduite à R1 (Paul, 02/10 : Calendly gardé, agenda unique écarté). R1 en production, non prouvée : critère au PLAN §2. B2 fermée (RenoDevis #218, RenoBoost #566).",
            "depuis": "2026-10-02"
          },
          {
            "quoi": "LEÇON À CONSIGNER + PROPAGER (9 dépôts) : rechute de « un droit se vérifie du côté où il peut être contourné » — la prémisse de l'arbitrage §12.8 quater avait été mesurée en…",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "smoke-accueil-finubar ④c (« le remettre remonte le ciel là où il était ») rougit par intermittence, toujours 577 → 581 px : ~1 passage sur 10, MESURÉ sur main pur (b01afed) le…",
            "depuis": "2026-09-30"
          }
        ],
        "maj": "2026-10-08"
      },
      "recits": [
        "bloque_par[]",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "racine",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "a1c3bc0",
        "tete_le": "2026-10-08T22:02:45+00:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-08",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-08T22:12:04.994Z",
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
      "jours_depuis_maj": 0,
      "jours_en_attente": 49,
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
          "le": "2026-10-08",
          "quoi": "08/10 : #120 — SOLA GROUPE premier vrai artisan : décisions D-SOLA et mode opératoire du 09/10 (roadmap §5quinquies). Mail de préparation gardé pour vendredi.",
          "commit": "965b176bb9ed0b9e003c8d05e4946e0c90a21ab1"
        },
        "prochaine_action": "Ven. 09/10 avec Matthieu : brancher SOLA (roadmap §5quinquies). Sortie : fiche publiée avec numéro Twilio ; requête de la procédure → sent et appelant_preserve.",
        "bloque_par": [
          "08/10 [MESURÉ Gmail] : le mail « ce qu'il faut préparer » est parti à Henry seul ; Paul le fait avec Matthieu vendredi. ⛔ PÉRIMÉ : « envoyer le brouillon à Matthieu ».",
          "Avant vendredi, gestes Paul : crédits OVH, solde Twilio, bundle France Business Approved. Henry propose d'y relier le Google Agenda de Matthieu : à trancher par Paul.",
          "Hors séance du 09/10, la boucle de Claude reste P2 (G17), à ouvrir par son cadrage six points.",
          "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : P1 PROUVÉE EN PRODUCTION (connexion 13:34, créneau retiré à 13:50, rendu à 13:55 ; révocation détectée à 14:05 → agenda périmé, 0…",
          "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : migration 33 (cron_delai_30s) APPLIQUÉE EN PRODUCTION sur go de Paul : agenda-sync et purge-stockage replanifiés sous le même nom…",
          "⚠️ CONSTAT DU 06/10, MINEUR : google-oauth-callback ne remet pas last_sync_error à nul en reconnectant ; jusqu'au passage suivant (≤ 5 min) la fiche reste « périmée » et ne vend…",
          "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : CRON_SECRET posé (secrets des fonctions + coffre, 64 car.), pg_net 0.20.4, crons agenda-sync (*/5) et purge-stockage (h+10) ; les…",
          "⏳ PAUL — ROTATION DU CRON_SECRET : la valeur a été montrée sur une capture le 06/10 (63 caractères sur 64 : ~1 000 essais suffisent) ; le coffre n'a PAS été mis à jour (updated_at…",
          "⚠️ GOOGLE EN MODE TESTING (06/10) : le jeton est coupé à J+7 ; l'agenda devient alors périmé et, par D-STALE, LA FICHE CESSE DE VENDRE. Sans gravité pour la fiche de recette…",
          "⚠️ CONSTAT DU 06/10, HORS BOUCLE : google-oauth-callback fait deux fetch SANS délai (règle « tout appel sortant a un délai ») et renvoie à la racine (/?calendar=…) — le site le…"
        ],
        "en_attente_depuis": "2026-09-08",
        "boucles_ouvertes": [],
        "maj": "2026-10-08"
      },
      "recits": [
        "bloque_par[]"
      ],
      "ciel": "alpha",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "1659852",
        "tete_le": "2026-10-08T18:59:35+00:00",
        "commits_depuis": 2,
        "commit_inconnu": false
      },
      "mesure_le": "2026-10-08",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_depuis_maj": 0,
      "jours_en_attente": 30,
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
          "le": "2026-09-30",
          "quoi": "Bouclage transverse : CI une fois par push, LEÇONS v45. La démo sans inscription (?demo=1) du 25/09 est sur main (#78).",
          "commit": "d96c42c944885bfe6fa6d815c52012690a808c91"
        },
        "prochaine_action": "Rien à coder avant le sticker. La chaîne est finie, testée, mergée — et elle n'a jamais tourné une seule fois, faute d'objet physique.",
        "bloque_par": [
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
        "maj": "2026-09-30"
      },
      "recits": [],
      "ciel": "renoboost-ia",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "e82aa0a",
        "tete_le": "2026-10-04T19:22:39+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_en_attente": 65,
      "rang": 1
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
        "tete": "9ab3318",
        "tete_le": "2026-10-04T19:22:48+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_en_attente": 15,
      "rang": 1
    },
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
        "tete": "e053dd6",
        "tete_le": "2026-10-04T19:22:37+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_en_attente": 85,
      "rang": 2
    },
    {
      "ok": true,
      "motif": "",
      "depot": "PaulGERARD161098/RenoDevis",
      "grain": {
        "projet": "RénoDevis",
        "depot": "PaulGERARD161098/RenoDevis",
        "cap": "Le devis part, se relance tout seul tant qu'il n'est pas signé, se signe et s'encaisse — sans que Paul y touche.",
        "rattache_a": "CADRAGE-2026-09-15-corpus-rapprochement.md §9–13 (socle livré, voix/PDF, maquette reçue et implantation) · REPRISE-PILOTE-V3.md · LOT-PILOTE-2026-09-14.md · ROADMAP-2026-09-03-audit-pac.md (l'audit PAC, et la procédure de V0) · ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-10-08",
          "quoi": "08/10 nuit : #314 fusionnée — devis entre pros au format du modèle (D-AAAA-MM-NNN, aiguillage sur SIREN client). Migration rd_devis_pro appliquée sur go de Paul.",
          "commit": "541a1d5477a1ec49e6cdb055a3a26e2c85ff1086"
        },
        "prochaine_action": "Recette du devis pro par Paul : forme juridique sur la fiche émetteur, puis un devis au SIREN d'un vrai client pro. Sortie : 1 devis avec extra.devis_pro en base.",
        "bloque_par": [
          "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul.",
          "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true, ouverts:0 — remesuré le 08/10 à 06:30 UTC.",
          "Synchro e-mail : le cron tourne à vide, Gmail n'est pas configuré (battement actif=false, 01/10 04:45 UTC).",
          "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "Devis pro (#314) : logo non imprimé ; mentions B2B à faire relire par un comptable ; parcours connecté jamais joué (session sans connexion, preview 403).",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Série ZOH à 130 commits de retard sur main (46 conflits à l'essai) : séance dédiée décidée par Paul le 08/10 (Ultima, CADRAGE-2026-10-08-zohshia-…, étape 8).",
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
            "quoi": "Brancher la synchro Gmail (décidé par Paul le 08/10 comme prochaine boucle) : le cron tourne à vide (actif=false, gmail_non_configure) ; 9 des 16 devis viennent de la boîte mail…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "101 branches mortes à supprimer (65 non fusionnées + 36 fusionnées, liste avec SHA) : suppression refusée par le garde-fou de la séance ; Paul choisit entre une règle…",
            "depuis": "2026-10-08"
          },
          {
            "quoi": "Réponse-type dictée → devis (cadrage du 06/10, lots A/B/C) : cadrée, NON codée par cette séance ; #297 (création guidée, fusionnée le 08/10) en couvre peut-être une partie, à…",
            "depuis": "2026-10-06"
          },
          {
            "quoi": "Reportée telle quelle du 03/10, non revérifiée le 06/10 : Paul pose RELANCE_MODE=auto (Vercel, Production) et redépose les PDF des catalogues SOLA ; fusion d'Ultima #342 (leçon…",
            "depuis": "2026-10-03"
          },
          {
            "quoi": "Consommables : prix de vente à obtenir de Matthieu (kit 30/38 €, forfait 100/200 €). Midea non commencé. AY42 : 5,2 kW (brochure) vs 5,4 kW (doc 02/10).",
            "depuis": "2026-10-03"
          },
          {
            "quoi": "Arbitrages hérités de #249 : TVA SOLA à 5,5 % hors tauxApplicable ; conditions_tva 3 vs 6 ; déconnexion globale/locale ; retour Stripe vers écran admin.",
            "depuis": "2026-10-03"
          }
        ],
        "maj": "2026-10-08"
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
      "mesure_le": "2026-10-08",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-08T22:12:05.014Z",
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
      "jours_depuis_maj": 0,
      "jours_en_attente": 52,
      "rang": 2
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
          "quoi": "Moteur d'audit énergétique PAC + pont serveur-à-serveur `POST /api/audit-pac` (PR #193), puis Finubar posé (grain + rappel d'ouverture de séance)",
          "commit": "b5c0a72"
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
            "quoi": "10 PR ouvertes — 6 dependabot (react, next, @types/node, SDK, actions) et 4 brouillons dormants : #183 (12/07), #170 (02/07), #164 et #163 (06/06). À trier : ce qui dort depuis…",
            "depuis": "2026-06-06"
          }
        ],
        "maj": "2026-08-21"
      },
      "recits": [
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "alpha",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "e115117",
        "tete_le": "2026-10-04T19:22:43+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_depuis_maj": 48,
      "jours_en_attente": 48,
      "rang": 2
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
          "le": "2026-09-30",
          "quoi": "Bouclage transverse : LEÇONS v45 ; grain remis au format (27 boucles en texte nu que la collecte écartait), 5 retirées : fermées, périmées ou déjà dans LECONS.",
          "commit": "ecef58995515575b6f9797cf4e41dbcdc3768170"
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
          },
          {
            "quoi": "DÉPENDANCES — `npm ci` rapporte 8 vulnérabilités (1 critique, 5 hautes). Non traitées : `npm audit fix` peut changer une majeure.",
            "depuis": "2026-09-13"
          }
        ],
        "maj": "2026-09-30"
      },
      "recits": [],
      "ciel": "alpha",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "0c6a3d1",
        "tete_le": "2026-10-04T19:22:44+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_en_attente": 48,
      "rang": 2
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
        "tete": "15c43f5",
        "tete_le": "2026-10-04T19:22:41+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-10-04",
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-08T22:12:05.015Z",
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
      "jours_en_attente": 28,
      "rang": 2
    }
  ],
  "macro": {
    "total": 10,
    "lisibles": 10,
    "illisibles": 0,
    "hors_seance": 0,
    "repris": 7,
    "en_cours": 8,
    "en_attente_de_paul": 2,
    "au_repos": 0,
    "derives": 3,
    "commits_inconnus": 6,
    "boucles_ouvertes": 45,
    "gestes_de_paul": [
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
        "projet": "Ultima",
        "geste": "Inscription Supabase d'Ultima MESURÉE OUVERTE le 04/10 (e-mail + Google) — geste de Paul : Authentication › Sign In / Providers › désactiver « Allow new users to sign up ». Le…"
      },
      {
        "projet": "Ultima",
        "geste": "R1 (B4) en production, non prouvée : Réno a rendu 502 le 02/10 à 16:43 UTC. Le crédit étant rechargé, lui demander « Où en est Artidispo ? » et comparer à la base (PLAN §2)."
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
        "projet": "Artidispo",
        "geste": "08/10 [MESURÉ Gmail] : le mail « ce qu'il faut préparer » est parti à Henry seul ; Paul le fait avec Matthieu vendredi. ⛔ PÉRIMÉ : « envoyer le brouillon à Matthieu »."
      },
      {
        "projet": "Artidispo",
        "geste": "Avant vendredi, gestes Paul : crédits OVH, solde Twilio, bundle France Business Approved. Henry propose d'y relier le Google Agenda de Matthieu : à trancher par Paul."
      },
      {
        "projet": "Artidispo",
        "geste": "Hors séance du 09/10, la boucle de Claude reste P2 (G17), à ouvrir par son cadrage six points."
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : P1 PROUVÉE EN PRODUCTION (connexion 13:34, créneau retiré à 13:50, rendu à 13:55 ; révocation détectée à 14:05 → agenda périmé, 0…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : migration 33 (cron_delai_30s) APPLIQUÉE EN PRODUCTION sur go de Paul : agenda-sync et purge-stockage replanifiés sous le même nom…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ CONSTAT DU 06/10, MINEUR : google-oauth-callback ne remet pas last_sync_error à nul en reconnectant ; jusqu'au passage suivant (≤ 5 min) la fiche reste « périmée » et ne vend…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 06/10 — NE PAS LE REJOUER : CRON_SECRET posé (secrets des fonctions + coffre, 64 car.), pg_net 0.20.4, crons agenda-sync (*/5) et purge-stockage (h+10) ; les…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ PAUL — ROTATION DU CRON_SECRET : la valeur a été montrée sur une capture le 06/10 (63 caractères sur 64 : ~1 000 essais suffisent) ; le coffre n'a PAS été mis à jour (updated_at…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ GOOGLE EN MODE TESTING (06/10) : le jeton est coupé à J+7 ; l'agenda devient alors périmé et, par D-STALE, LA FICHE CESSE DE VENDRE. Sans gravité pour la fiche de recette…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ CONSTAT DU 06/10, HORS BOUCLE : google-oauth-callback fait deux fetch SANS délai (règle « tout appel sortant a un délai ») et renvoie à la racine (/?calendar=…) — le site le…"
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
        "projet": "DATA RÉNO",
        "geste": "⚠️ Domaine renoadomicile.fr expire le 16/10/2026 — renouvellement à vérifier par Paul"
      },
      {
        "projet": "DATA RÉNO",
        "geste": "⚠️ Deux PC : seul C:\\Users\\User envoie ; le PC « pagge » a un .env incomplet et n'envoie jamais"
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
        "projet": "RénoDevis",
        "geste": "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul."
      },
      {
        "projet": "RénoDevis",
        "geste": "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true, ouverts:0 — remesuré le 08/10 à 06:30 UTC."
      },
      {
        "projet": "RénoDevis",
        "geste": "Synchro e-mail : le cron tourne à vide, Gmail n'est pas configuré (battement actif=false, 01/10 04:45 UTC)."
      },
      {
        "projet": "RénoDevis",
        "geste": "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
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
      "PaulGERARD161098/RenoDevis"
    ],
    "inaccessibles": [],
    "non_examines": [
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
        "projet": "RénoBoost",
        "dit": "a avancé de 5 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "Ultima",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "Artidispo",
        "dit": "a avancé de 2 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      }
    ],
    "action": {
      "projet": "RénoBoost",
      "nature": "code",
      "faire": "Devis assisté : recette authentifiée avec RenoDevis, corpus et Gmail. Livraison #566/#218 faite. La chaîne A→Z conserve sa route dans Ultima-/PLAN-2026-09-30-chaine-A-Z.md.",
      "cap": "Un individu seul fait tourner le business entier, aidé par l'automatisation (Directive IA). RénoBoost est le hub : acquisition, rendez-vous, dashboard, et la roadmap maîtresse des quatre briques."
    },
    "illisibles": 0,
    "hors_seance": 0
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
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
        "id": "paggerard-boop/Artidispo",
        "libelle": "Artidispo",
        "constellation": "en_cours",
        "ciel": "alpha",
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
        "id": "PaulGERARD161098/DATARENO-",
        "libelle": "DATA RÉNO",
        "constellation": "en_attente_de_paul",
        "ciel": "alpha",
        "signal": 1
      },
      {
        "id": "PaulGERARD161098/RenoAgenda",
        "libelle": "RénoAgenda",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 0
      },
      {
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
        "signal": 0
      },
      {
        "id": "PaulGERARD161098/mon-dpe.fr",
        "libelle": "mon-dpe.fr",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 0
      },
      {
        "id": "PaulGERARD161098/artisan-builder",
        "libelle": "artisan-builder",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 0
      },
      {
        "id": "PaulGERARD161098/renoboost-console",
        "libelle": "RénoBoost Console",
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
    "tete": "541a1d5",
    "commits": 130,
    "touchent": 67,
    "fichiers_touches": 80,
    "releve_le": "2026-10-08T22:09:55.238Z",
    "reprise": false,
    "mesure_le": "2026-10-08",
    "alerte": true,
    "phrase": "ZOH SHIA — ⚠️ EN RETARD : RénoDevis a avancé de 130 commit(s) depuis la série (f1f9fb3 → 541a1d5) (clone relevé le 2026-10-08 22:09 UTC), dont 67 sur des fichiers qu'elle retouche (80 fichier(s)) : l'extraction refusera probablement. Rafraîchir la série (TECHNO §8)."
  }
};
