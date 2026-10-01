// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-10-01",
  "projets": [
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/RenoPredict",
        "ref": "HEAD",
        "commit": "c29ab1b1850af1a6ed7d25c5f739c666ffae0aae",
        "blob": "04187b9db3fc6c7d2a0a69b190a3337a3ebe7d37",
        "lecture_le": "2026-10-01T09:40:55.007Z",
        "mesure_le": "2026-10-01T09:40:55.007Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.007Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "c29ab1b1850af1a6ed7d25c5f739c666ffae0aae",
        "ref": "HEAD"
      },
      "ciel": "renoboost-ia",
      "jours_depuis_maj": 1,
      "jours_en_attente": 58,
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/DATARENO-",
        "ref": "HEAD",
        "commit": "bb4feb2dee415ed0543d99bb297601f0a1a06de0",
        "blob": "660618b87b6d64fb0af46b8ddf5c52dbac96b48b",
        "lecture_le": "2026-10-01T09:40:55.011Z",
        "mesure_le": "2026-10-01T09:40:55.011Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.011Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "bb4feb2dee415ed0543d99bb297601f0a1a06de0",
        "ref": "HEAD"
      },
      "ciel": "alpha",
      "jours_depuis_maj": 1,
      "jours_en_attente": 8,
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/RenoAgenda",
        "ref": "HEAD",
        "commit": "585e0f7107a6e6ccdf4cc48612f5d01d3d3009ca",
        "blob": "ef563ea5ec39e6d9a1120546e1dd26c2f42b0989",
        "lecture_le": "2026-10-01T09:40:55.005Z",
        "mesure_le": "2026-10-01T09:40:55.005Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.005Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "585e0f7107a6e6ccdf4cc48612f5d01d3d3009ca",
        "ref": "HEAD"
      },
      "ciel": "renoboost-ia",
      "jours_depuis_maj": 1,
      "jours_en_attente": 78,
      "rang": 2
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
          "le": "2026-10-01",
          "quoi": "Accord de Paul : #566 fusionnée et déployée avant RenoDevis #218. Vercel production READY ; extracteur répond en production. Suite 1 568 tests et navigateur verts avant fusion.…",
          "commit": "b1d3c6257fb18b31010d1ac7f8ecd3f03472db97"
        },
        "prochaine_action": "Devis assisté : recette authentifiée avec RenoDevis, corpus et Gmail. Livraison #566/#218 faite. La chaîne A→Z conserve sa route dans Ultima-/PLAN-2026-09-30-chaine-A-Z.md.",
        "bloque_par": [
          "PAUL : vérifier que Stripe est en LIVE côté Artidispo — la vitrine dit « déjà disponible ! » depuis le 29/09 (3259da4) ; sans Stripe live, un artisan inscrit ne peut pas payer",
          "Les 14 PDF SOLA à déposer dans Drive + la réponse sur DEV235/201 (Paul, 30/09) ; le total des 9 devis signés (Paul)",
          "Validation d'Henry sur la présentation commerciale, et partage de l'Artifact avec lui par Paul (menu Partager) — 28/09",
          "Calendly : un seul événement actif sur le plan gratuit — tout nouvel événement créé par Paul coupe le site (mesuré 27/09)",
          "Photo du centre DEKRA : accord du client + la renvoyer (non versionnée) — 22/09",
          "Bandeau partenaires : le fichier du logo + l'accord d'y figurer (CLAUDE.md §12.5) — 22/09",
          "Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09",
          "Rendre le ruleset de main ACTIF : il ne mord pas (ACTIONS-PAUL.md) — 11/09",
          "Valider la fiche Google Business (ACTIONS-PAUL.md §1) — ouverte depuis le 04/08",
          "Imprimer un lot de stickers QR (ACTIONS-PAUL.md §2) — reporté par Paul le 07/09"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
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
          },
          {
            "quoi": "⚠️ OUVERT, NOMMÉ — POURQUOI les crons hebdomadaires de ce projet ne partaient pas reste INCONNU. L'hypothèse des chemins dupliqués a été retirée (la doc Vercel les autorise…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⚠️ OUVERT, NOMMÉ — le geo_id du Rhône est NULL dans radar_zones. Je ne l'avais pas mesuré au moment de poser le nom, et un identifiant plausible se serait lu comme un fait…",
            "depuis": "2026-09-14"
          }
        ],
        "maj": "2026-10-01"
      },
      "recits": [
        "dernier_arret.quoi",
        "boucles_ouvertes[].quoi"
      ],
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/RenoBoost",
        "ref": "HEAD",
        "commit": "b818899ba453d3584e3aee3d7a71994786f3a0fa",
        "blob": "13b0ef3583da13460022cd2a84be253293b450f0",
        "lecture_le": "2026-10-01T09:40:54.968Z",
        "mesure_le": "2026-10-01T09:40:54.968Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:54.968Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "b818899ba453d3584e3aee3d7a71994786f3a0fa",
        "ref": "HEAD"
      },
      "ciel": "renoboost-ia",
      "jours_depuis_maj": 0,
      "jours_en_attente": 58,
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
        "rattache_a": "CADRAGE-2026-09-15-corpus-rapprochement.md §9 (devis assisté : code, preuves et boucles) · REPRISE-PILOTE-V3.md · LOT-PILOTE-2026-09-14.md · ROADMAP-2026-09-03-audit-pac.md (l'audit PAC, et la procédure de V0) · ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-10-01",
          "quoi": "Production livrée. Recette connectée administrateur : création, modification et réouverture d'un brouillon fictif réussies (240 puis 360 € TTC), prix et TVA conservés. IA/PDF…",
          "commit": "cb775efe1a244a8c59f26db5de2f8dd56a21fd8e"
        },
        "prochaine_action": "Cap précisé par Paul : dictée → correspondance produits/prestations/prix → marge interne → devis et annexe PDF économies/rentabilité client. Plan et critères au cadrage §10. Étape…",
        "bloque_par": [
          "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul.",
          "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true le 30/09 (06:30 UTC).",
          "Synchro e-mail : le cron tourne à vide, Gmail n'est pas configuré (battement actif=false, 01/10 04:45 UTC).",
          "Verdict de Paul sur la DENSITÉ : liste du cockpit (PR #160) et blocs d'un modèle retenu. Les tests prouvent la conformité, pas la lisibilité."
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "Cible finale voix + anciens devis + marge + deux PDF client cadrée au §10. La voix, le rapprochement en arrière-plan et la génération coordonnée des PDF ne sont pas encore livrés.…",
            "depuis": "2026-10-01"
          },
          {
            "quoi": "Devis assisté #218 + RenoBoost #566 fusionnés et déployés. Restent recette authentifiée, 14 libellés génériques dans 6 devis et 6 configurations à compléter ; cadrage §9.",
            "depuis": "2026-10-01"
          },
          {
            "quoi": "Déchèterie pro la plus proche du chantier : faisable (base ADEME SINOE, 0 €, champ DMA/PRO), sans créneau. Reportée par Paul le 30/09, pas de code.",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "DEV00000127 (gainable à 5,5 % le 04/06, AVANT l'arrêté du 18/07) : taux à faire confirmer par le comptable.",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "Corpus : 19 devis sur 27 au sort inconnu (mesuré le 30/09) ; 5 devis restent hors corpus, leurs messages font 7 à 26 Mo.",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "Recette à l'écran jamais faite (13/09) : formulaire scindé, revue des notes au cockpit, bloc de paiement sur un devis SIGNÉ.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "Devis assisté #218 : création et modification éprouvées à 390/1280 px en fixtures. Le parcours authentifié au rôle artisan reste à recevoir.",
            "depuis": "2026-09-25"
          },
          {
            "quoi": "Conditions TVA dans Modifier et confirmation des prix livrées en production (#218, 01/10). Recette authentifiée au rôle artisan encore ouverte.",
            "depuis": "2026-09-25"
          },
          {
            "quoi": "VOIE C INERTE : l'envoi DEPUIS le domaine de l'artisan attend un RDV DNS avec Matthieu (0 artisan en voie C le 11/09). Garde-fou Resend : CLAUDE.md §EXP.",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "GOULOT : 2 devis avec lignes sur 15 (mesure 01/10 avant livraison). Parcours assisté #218 déployé ; mesurer le prochain devis réellement émis et le temps gagné.",
            "depuis": "2026-09-01"
          }
        ],
        "maj": "2026-10-01"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/RenoDevis",
        "ref": "HEAD",
        "commit": "53ec91fd2b2c36c1aafddf3d3370a716ee39969b",
        "blob": "b856d65c2c83dac42be7f12c7b82a54ef712b53d",
        "lecture_le": "2026-10-01T09:40:55.004Z",
        "mesure_le": "2026-10-01T09:40:55.004Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.004Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "53ec91fd2b2c36c1aafddf3d3370a716ee39969b",
        "ref": "HEAD"
      },
      "ciel": "renoboost-ia",
      "jours_depuis_maj": 0,
      "jours_en_attente": 45,
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
          "critere_de_sortie": "Léo écrit sans demander dans l'anneau vert et rien au-delà ; chaque écriture journalisée avant l'acte et défaisable d'un clic. ⛔ ①②③④ faits (④ le 30/09 : exécution sans clic derrière une trace, revue adversariale soldée) ; reste ⑤, le défaire joué + « ce que Léo a fait » au matin"
        },
        "dernier_arret": {
          "le": "2026-10-01",
          "quoi": "Activation Léo/FINUBAR intégrée avec RIVEN #324. 57 suites unitaires, 55 parcours navigateur et concurrence PostgreSQL verts ; correctifs PT409 et plafond atomique appliqués.…",
          "commit": "6ecc81ab7e62252669e4a1323976e6f61e3ce39a"
        },
        "prochaine_action": "Vérifier le déploiement de cette activation puis reprendre le défaire B1, cadrage §15.",
        "bloque_par": [
          "B1 ⑤ attend deux choix de Paul — cadrage §15.2 : ① l'enrichissement repasse-t-il orange faute de défaire (reco : oui) · ② où vit le bouton « défaire » (reco : cartouche + écran «…",
          "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée",
          "La précision sur « mon dpe.fr » (VITRUVE)",
          "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis",
          "Vérifier que les inscriptions Supabase sont FERMÉES (« Allow new signups ») — un compte tiers pourrait remplir le quota par la route d'import"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "LEÇON À CONSIGNER + PROPAGER (9 dépôts) : rechute de « un droit se vérifie du côté où il peut être contourné » — la prémisse de l'arbitrage §12.8 quater avait été mesurée en…",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "smoke-accueil-finubar ④c (« le remettre remonte le ciel là où il était ») rougit par intermittence, toujours 577 → 581 px : ~1 passage sur 10, MESURÉ sur main pur (b01afed) le…",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "Chaîne Rénoboost : route et état vivant dans PLAN-2026-09-30-chaine-A-Z.md (fusionné le 30/09, #321). Reprise : son §0.",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "ÉCARTÉ par Paul le 30/09 — DATARENO- : Vercel rouge en permanence (PYTHON_ENTRYPOINT_NOT_FOUND), sur main aussi. « Vraiment à part, on le laisse de côté. » Ne pas rouvrir.",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "REPORTÉ par Paul le 30/09 — mon-dpe.fr : 62 vulnérabilités Dependabot sur main (4 critiques, 28 hautes). « On va corriger mon dpe plus tard. » Séance dédiée.",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "RIVEN nébuleuses : à 390 px, 3 noms fictifs sur 54 cachés (restent au panneau). Plus bas = sous 12 px ou étoiles déplacées : non tranché. CADRAGE-RIVEN-NEBULEUSES.md §7",
            "depuis": "2026-09-30"
          },
          {
            "quoi": "Étiquettes vocales des caps : chacune finit par « 0 lien » sur les menus, du bruit pour un lecteur d'écran. Préexistant, relevé au dry run du 27/09 (carte-celeste §28).",
            "depuis": "2026-09-27"
          },
          {
            "quoi": "MESURÉ le 13/09 et démenti : la note annonçait des copies divergentes du rappel Finubar. Les sept fichiers ont la même empreinte. Voir CADRAGE-FINUBAR.md.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "ripair (paggerard-boop) reste en LEÇONS v7 : hors de depots.json et fork partagé avec un tiers — exclu à dessein le 28/09. À trancher par Paul.",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "Aucun contrôle croisé ne compare la copie des leçons d'un dépôt à sa source. Payé le 28/09 : RenoBoost portait 2 leçons absentes de la source, vues au diff avant écrasement.",
            "depuis": "2026-09-11"
          }
        ],
        "maj": "2026-10-01"
      },
      "recits": [
        "dernier_arret.quoi",
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
      "mesure_le": "2026-10-01",
      "controle": {
        "type": "disque",
        "statut": "lu",
        "lecture_le": "2026-10-01T09:40:54.967Z",
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
      "jours_en_attente": 42,
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/mon-dpe.fr",
        "ref": "HEAD",
        "commit": "429095400099fac23189f5c20f2627e65b5f25bb",
        "blob": "259bf949857ca11e4d2d5fb5bea23e80d50fb163",
        "lecture_le": "2026-10-01T09:40:55.009Z",
        "mesure_le": "2026-10-01T09:40:55.009Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.009Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "429095400099fac23189f5c20f2627e65b5f25bb",
        "ref": "HEAD"
      },
      "ciel": "alpha",
      "jours_depuis_maj": 41,
      "jours_en_attente": 41,
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/artisan-builder",
        "ref": "HEAD",
        "commit": "6f12a9106beae81573aefcb05eea9b1a9d740df3",
        "blob": "3cef0b93ff9db7d3dd0bea85128842154f00ab54",
        "lecture_le": "2026-10-01T09:40:55.009Z",
        "mesure_le": "2026-10-01T09:40:55.009Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.009Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "6f12a9106beae81573aefcb05eea9b1a9d740df3",
        "ref": "HEAD"
      },
      "ciel": "alpha",
      "jours_depuis_maj": 1,
      "jours_en_attente": 41,
      "rang": 2
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
          "nom": "P1-preuve — l'agenda pro bloque un créneau (critère ⑤ du cadrage six semaines), et la course agenda/réservation laisse une trace.",
          "critere_de_sortie": "CADRAGE-2026-09-26-p1-preuve.md §④ : a-e verts en CI (faits le 26/09) ET f en production — avec un vrai agenda Google connecté : blocs ≥ 1 en base, créneau disparu de l'API, revenu quand l'événement part ; accès révoqué → etat 'perime' et la fiche ne vend plus."
        },
        "dernier_arret": {
          "le": "2026-09-30",
          "quoi": "30/09, 13 h 15 — STRIPE LIVE RÉPARÉ ET PROUVÉ (voir bloque_par) : destination webhook « Comptes connectés » → « Votre compte », secret reposé par Paul, abonnement trialing en…",
          "commit": "d91f959"
        },
        "prochaine_action": "VÉRIFIER EN PRODUCTION après la fusion de #104 : https://artidispo.com/exemple rend la fiche d'Ondrel Plomberie (bandeau « Fiche d'exemple · artisan fictif ») et une vraie fiche…",
        "bloque_par": [
          "✅ 30/09 — ACCORD DE FUSION DONNÉ PAR PAUL (« go fusion », fiche « validée par Henry »). Règle qui reste : aucune PR ne se fusionne sans un mot de Paul qui nomme la fusion ; un…",
          "⏳ LEÇON PAYÉE LE 30/09, NON ÉCRITE : « un avis n'est pas un accord de fusion, et un grain ne s'écrit pas avant le fait » (0318692 annonçait #104 fusionnée avant toute fusion…",
          "✅ FAIT ET MESURÉ LE 30/09 — NE PAS LE REJOUER : migration 32 (declarations_legendes) APPLIQUÉE EN PRODUCTION via le connecteur, bloc de vérification passé ; relue après coup : vue…",
          "⏳ PAUL — 3 PHOTOS LIBRES DE DROITS POUR /exemple : la fiche porte les 2 photos du dépôt (hero.jpg, chantier-artidispo.jpg) quand l'inscription en exige 3. Le proxy de…",
          "⚠️ DÉCOUVERT LE 30/09 (non corrigé, hors boucle) : anon garde le droit UPDATE de TABLE sur public.artisans (défaut Supabase, jamais révoqué) — la RLS le neutralise (0 ligne), la…",
          "⚠️ LA GARDE DE PRÉSENTATION (Edge + navigateur) refuse toujours « décennale » et « diplômé » dans le texte, même quand la fiche les déclare depuis la migration 32. Cohérent (les…",
          "✅ FAIT ET MESURÉ LE 30/09 — NE PAS LE REJOUER : STRIPE LIVE FONCTIONNE DE BOUT EN BOUT. Paiement réel de Paul à 12 h 47 (cs_live_, facture 0,00 € : 14 jours d'essai, 1er…",
          "✅ FAIT ET MESURE LE 28/09 — NE PAS LE REJOUER : expediteur ARTIDISPO VALIDE par OVH ; SMS d'appel manque recu (sent + id OVH) ; migration 29 appliquee ; twilio-voice v13 deployee.…",
          "✅ FAIT LE 28/09 — les regles du SMS vivent EN BASE (claim_missed_call, migration 30) : numero de l'artisan, liste d'exclusion, deja client, 30 jours par appelant et par artisan…",
          "⏳ PAUL — LA FILE DE PURGE NE SE VIDE PAS ENCORE : purge-stockage (fonction Edge) est DEPLOYEE le 27/09 mais NON PLANIFIEE et sans CRON_SECRET (elle rend 503) ; il lui faut pg_net…"
        ],
        "en_attente_depuis": "2026-09-08",
        "boucles_ouvertes": [],
        "maj": "2026-09-30"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "bloque_par[]"
      ],
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "paggerard-boop/Artidispo",
        "ref": "HEAD",
        "commit": "5e2d7203859baf9da8089ad0ecf2a6f7fc9fd5d5",
        "blob": "06e734bc832b4102b38252793c18071fa2d77a64",
        "lecture_le": "2026-10-01T09:40:55.011Z",
        "mesure_le": "2026-10-01T09:40:55.011Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.011Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "5e2d7203859baf9da8089ad0ecf2a6f7fc9fd5d5",
        "ref": "HEAD"
      },
      "ciel": "alpha",
      "jours_depuis_maj": 1,
      "jours_en_attente": 23,
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
      "derive": null,
      "reprise": false,
      "hors_seance": false,
      "mesure_le": "2026-10-01",
      "source": {
        "type": "github",
        "depot": "PaulGERARD161098/renoboost-console",
        "ref": "HEAD",
        "commit": "f242bba74235adab55606a5460c5bd6797f5b966",
        "blob": "1e51d89ca0d2318e8c929c176e9828c86c9868da",
        "lecture_le": "2026-10-01T09:40:55.008Z",
        "mesure_le": "2026-10-01T09:40:55.008Z",
        "qualification": "déclaré",
        "portee": "contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié"
      },
      "controle": {
        "type": "github",
        "lecture_le": "2026-10-01T09:40:55.008Z",
        "statut": "lu",
        "examines": [
          "tete",
          "FINUBAR.md"
        ],
        "non_examines": [
          "derive_git",
          "rappel",
          "pr",
          "controles",
          "permissions",
          "dependances"
        ],
        "commit": "f242bba74235adab55606a5460c5bd6797f5b966",
        "ref": "HEAD"
      },
      "ciel": "renoboost-ia",
      "jours_depuis_maj": 1,
      "jours_en_attente": 21,
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
    "derives": 0,
    "commits_inconnus": 0,
    "boucles_ouvertes": 45,
    "gestes_de_paul": [
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
        "projet": "RénoBoost",
        "geste": "Valider la fiche Google Business (ACTIONS-PAUL.md §1) — ouverte depuis le 04/08"
      },
      {
        "projet": "RénoBoost",
        "geste": "Imprimer un lot de stickers QR (ACTIONS-PAUL.md §2) — reporté par Paul le 07/09"
      },
      {
        "projet": "RénoDevis",
        "geste": "KYC Stripe de SOLA : 0 compte sur 2 peut encaisser (mesuré le 30/09). Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul."
      },
      {
        "projet": "RénoDevis",
        "geste": "La clé sk_live_ en production : le battement d'embarquement dit toujours test:true le 30/09 (06:30 UTC)."
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
        "projet": "Ultima",
        "geste": "B1 ⑤ attend deux choix de Paul — cadrage §15.2 : ① l'enrichissement repasse-t-il orange faute de défaire (reco : oui) · ② où vit le bouton « défaire » (reco : cartouche + écran «…"
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
        "projet": "Ultima",
        "geste": "Vérifier que les inscriptions Supabase sont FERMÉES (« Allow new signups ») — un compte tiers pourrait remplir le quota par la route d'import"
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
        "projet": "Artidispo",
        "geste": "✅ 30/09 — ACCORD DE FUSION DONNÉ PAR PAUL (« go fusion », fiche « validée par Henry »). Règle qui reste : aucune PR ne se fusionne sans un mot de Paul qui nomme la fusion ; un…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ LEÇON PAYÉE LE 30/09, NON ÉCRITE : « un avis n'est pas un accord de fusion, et un grain ne s'écrit pas avant le fait » (0318692 annonçait #104 fusionnée avant toute fusion…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 30/09 — NE PAS LE REJOUER : migration 32 (declarations_legendes) APPLIQUÉE EN PRODUCTION via le connecteur, bloc de vérification passé ; relue après coup : vue…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ PAUL — 3 PHOTOS LIBRES DE DROITS POUR /exemple : la fiche porte les 2 photos du dépôt (hero.jpg, chantier-artidispo.jpg) quand l'inscription en exige 3. Le proxy de…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ DÉCOUVERT LE 30/09 (non corrigé, hors boucle) : anon garde le droit UPDATE de TABLE sur public.artisans (défaut Supabase, jamais révoqué) — la RLS le neutralise (0 ligne), la…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ LA GARDE DE PRÉSENTATION (Edge + navigateur) refuse toujours « décennale » et « diplômé » dans le texte, même quand la fiche les déclare depuis la migration 32. Cohérent (les…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURÉ LE 30/09 — NE PAS LE REJOUER : STRIPE LIVE FONCTIONNE DE BOUT EN BOUT. Paiement réel de Paul à 12 h 47 (cs_live_, facture 0,00 € : 14 jours d'essai, 1er…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT ET MESURE LE 28/09 — NE PAS LE REJOUER : expediteur ARTIDISPO VALIDE par OVH ; SMS d'appel manque recu (sent + id OVH) ; migration 29 appliquee ; twilio-voice v13 deployee.…"
      },
      {
        "projet": "Artidispo",
        "geste": "✅ FAIT LE 28/09 — les regles du SMS vivent EN BASE (claim_missed_call, migration 30) : numero de l'artisan, liste d'exclusion, deja client, 30 jours par appelant et par artisan…"
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ PAUL — LA FILE DE PURGE NE SE VIDE PAS ENCORE : purge-stockage (fonction Edge) est DEPLOYEE le 27/09 mais NON PLANIFIEE et sans CRON_SECRET (elle rend 503) ; il lui faut pg_net…"
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
        "projet": "RénoPredict",
        "dit": "attend un geste : Imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08, reporté par Paul le 07/09 sans date. Le piège de l'URL est refermé depuis le 01/09. — ouvert depuis 58 j",
        "pourquoi": "attente"
      },
      {
        "projet": "DATA RÉNO",
        "dit": "attend un geste : ⚠️ Domaine renoadomicile.fr expire le 16/10/2026 — renouvellement à vérifier par Paul — ouvert depuis 8 j",
        "pourquoi": "attente"
      },
      {
        "projet": "RénoAgenda",
        "dit": "arrêté sur : Bouclage transverse : CI une fois par push, LEÇONS v45, grain élagué (6 boucles : D4 déjà en prochaine action, 5 faites ou reprises par le dépôt Artidispo).",
        "pourquoi": "en_cours"
      }
    ],
    "action": {
      "projet": "RénoPredict",
      "nature": "geste",
      "faire": "Imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08, reporté par Paul le 07/09 sans date. Le piège de l'URL est refermé depuis le 01/09.",
      "cap": "Le fonds de commerce se remplit tout seul : sticker collé, flashé en partant, la date de pose existe, Foresight s'allume — zéro saisie."
    },
    "illisibles": 0,
    "hors_seance": 0
  },
  "constellation": {
    "noeuds": [
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
        "id": "PaulGERARD161098/RenoBoost",
        "libelle": "RénoBoost",
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
        "id": "PaulGERARD161098/Ultima-",
        "libelle": "Ultima",
        "constellation": "en_cours",
        "ciel": "racine",
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
        "id": "paggerard-boop/Artidispo",
        "libelle": "Artidispo",
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
  }
};
