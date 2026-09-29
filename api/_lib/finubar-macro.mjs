// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-09-29",
  "projets": [
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
          "le": "2026-09-21",
          "quoi": "DEUX SÉANCES ONT TRAVAILLÉ CE DÉPÔT LE MÊME JOUR, et ce grain porte les deux — il a d'ailleurs fini en CONFLIT, deux versions écrites à quelques heures d'écart. (A) E7 ÉTAPE 1…",
          "commit": "2d5e542"
        },
        "prochaine_action": "DEUX CHEMINS, ET LE PREMIER A UNE DATE. (1) BATIMAT, CHEMIN CRITIQUE — À PAUL, ~5 minutes sur son téléphone : rejouer le geste 07 (le P0 est corrigé et fusionné mais JAMAIS rejoué…",
        "bloque_par": [
          "KYC Stripe de SOLA : charges_enabled = 0/2 le 14/09. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul",
          "La clé sk_live_ en prod — le battement disait encore test:true le 14/09",
          "Le verdict de Paul sur la DENSITÉ du cockpit (PR #160) : les tests prouvent la conformité, aucun ne dit si la liste est lisible en usage"
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "✅ MOTEUR DE RAPPROCHEMENT ALIMENTÉ (15/09, PR #168) — 27 devis du corpus + 13 de l'application + 9 archives, dans cet ordre de priorité. `estChantierDeLArtisan` tient l'unique…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "✅ TVA BRANCHÉE (15/09) — `lib/tva.ts` + `controlerTauxRepris` sont appelés par l'écran, plus seulement testés. Le croisement type × taux du corpus prouve la règle : `pac_air_air`…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "✅ CORPUS LIVRÉ ET PEUPLÉ (15/09, PR #167) : 27 devis, 28 lignes d'équipement. Unicité sur (source, empreinte) et JAMAIS sur numero — DEV00000189 désigne deux propositions…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⛔ LEÇON DU 15/09 — UN BLOCKLIST NE GARANTIT RIEN, IL NETTOIE. Le garde-fou PII a attrapé 12 patronymes puis laissé passer « BARKY » : le nom de fichier l'orthographie autrement…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⛔ ET SON MIROIR, LE FAUX POSITIF, qui coûte autant : le détecteur mettait le SQL ENTIER à plat, ce qui colle les champs voisins et FABRIQUE des fuites — `694.0,0` (un prix suivi…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⛔ LEÇON DU 15/09, PORTÉE AUSSI DANS RenoBoost (PR #464) — DOUZE CAS CONCORDANTS NE FONT PAS UNE LOI. « L'acompte SOLA est TOUJOURS de 40 % » tenait sur 12 devis. À 27, DEV00000139…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "✅ RLS ARTISAN ACTIVE (15/09) — elle était livrée le matin et INERTE (0 artisan rattaché). Le compte de Matthieu ouvert à 09:30 UTC l'a activée. Mesurée sous son identité RÉELLE…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "✅ Cockpit aligné sur les specs RenoBoost (PR #160, 14/09). ⏳ Reste le verdict densité de Paul. ⚠️ Dette déclarée : plafond d'ombres = 3 dans lib/langageCockpit.test.ts",
            "depuis": "2026-09-14"
          },
          {
            "quoi": "✅ RELECTURE EXTERNE ENTIÈREMENT FERMÉE, CODE ET BASE : #146 fusionnée le 11/09, ses RETOURS fusionnés le 13/09 (#150, squash 4e11495), et la MIGRATION RR-10 APPLIQUÉE le 13/09 sur…",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "⛔ LE CATALOGUE DES LEÇONS A DIVERGÉ SOUS UN SCEAU IDENTIQUE, réparé le 13/09. Les copies Ultima et RenoDevis annonçaient toutes deux `v8 85cca6330a86` ; le corps réel de RenoDevis…",
            "depuis": "2026-09-13"
          }
        ],
        "maj": "2026-09-21"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "806867f",
        "tete_le": "2026-09-22T09:16:37+02:00",
        "commits_depuis": 7,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 8,
      "jours_en_attente": 43,
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
        "rattache_a": "ROADMAP-ARTIDISPO.md (dates, produit fini) · CADRAGE-2026-09-03-rdv-omnicanal.md (raisonnement) · CADRAGE-OFFRE.md · TODO-PAUL.md · RenoBoost/ROADMAP-MASTER.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Artidispo — 20 artisans payants au 30/11/2026",
          "critere_de_sortie": "20 abonnements actifs chez Stripe ; paliers 5 au 31/10, 12 au 15/11"
        },
        "dernier_arret": {
          "le": "2026-09-11",
          "quoi": "D10, D11, D12 validées par Paul : D1-D12 toutes fermées. Retard acté au §2 : ni Twilio (08/09) ni le domaine/dépôt/base/landing v0 (10/09) n'ont été faits. Nom du dépôt corrigé…",
          "commit": "4c27f1d"
        },
        "prochaine_action": "EN RETARD — Twilio : compte + numéro FR, et LIRE 3 valeurs (prix du numéro, portée du bundle, commande par API — D10). Sans lui, le gate du 15/09 n'a rien à éprouver. Puis domaine…",
        "bloque_par": [
          "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
          "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date",
          "Relecture juriste des CGU avant la première signature client"
        ],
        "en_attente_depuis": "2026-07-15",
        "boucles_ouvertes": [
          {
            "quoi": "⛔ EN RETARD depuis le 08/09 — Twilio (compte, numéro FR, bundle) et le domaine artidispo.fr + dépôt + base + landing v0 du 10/09 ne sont pas faits. Le gate du 15/09 et les cartes…",
            "depuis": "2026-09-08"
          },
          {
            "quoi": "La marge de D6 (69 € HT) repose sur DEUX inconnues qui se regardent ensemble : le prix réel d'Artisaner (Q4, à lire sur leur page tarifs) et le prix mensuel d'un numéro Twilio…",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "11/09 — Paul ou Henri : 3 captures des pages Artisaner (fiche, prise de RDV, tarifs). artisaner.fr est bloqué par le proxy : ce geste ne peut PAS être automatisé.",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "⛔ GATE 15/09 — test à 5 questions (roadmap §11.8) sur un vrai mobile : renvoi activé, appel reçu, SMS parti, expéditeur, lien. Bloqué par Twilio (Paul, 08/09).",
            "depuis": "2026-09-06"
          },
          {
            "quoi": "Salon Batimat/Interclima 28/09-01/10 : kit (landing v0, cartes QR, script, collecte, mail de relance au 02/10) à avoir le 27/09. Objectifs N cartes / M inscrits à fixer par Paul.",
            "depuis": "2026-09-06"
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
        "maj": "2026-09-07"
      },
      "recits": [
        "dernier_arret.quoi",
        "prochaine_action",
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "ec20a1f",
        "tete_le": "2026-09-22T10:36:52+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 22,
      "jours_en_attente": 76,
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
          "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ⏸️ REPORTÉ par Paul le 07/09 — pas de date. Le piège de l'URL est refermé le 01/09 : il ne reste que le…",
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
      "recits": [
        "bloque_par[]"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "ded8b3a",
        "tete_le": "2026-09-22T10:36:52+00:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 26,
      "jours_en_attente": 56,
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
          "critere_de_sortie": "Mot de passe SMTP posé · un lot de brouillons généré, relu par Paul et ENVOYÉ · au moins une réponse reçue et tracée. Détail et preuves : REPRISE.md"
        },
        "dernier_arret": {
          "le": "2026-09-22",
          "quoi": "Grain Finubar semé et dépôt déclaré au registre d'Ultima. Le travail métier reste au 19/09 (gate 1 franchi). Détail : PR #35",
          "commit": "952d932abd1a773d3bce229ddf2dd6ead6252043"
        },
        "prochaine_action": "Poser le mot de passe SMTP — c'est le SEUL blocage restant avant le premier envoi réel (REPRISE.md, section blocages).",
        "bloque_par": [
          "⛔ MOT DE PASSE SMTP — action de Paul, seul blocage du gate 2 (constaté le 19/09)",
          "⚠️ La page de désinscription réécrite (PR #31) est À REDÉPOSER sur Netlify Drop : la version en ligne n'est pas encore celle du dépôt"
        ],
        "en_attente_depuis": "2026-09-19",
        "boucles_ouvertes": [],
        "maj": "2026-09-22"
      },
      "recits": [],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 7,
      "jours_en_attente": 10,
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
        "rattache_a": "ROADMAP-2026-09-21-fin-de-session.md (LA source de la reprise) · ROADMAP-2026-09-20-fin-de-session.md · REPRISE-COHERENCE-PALIER1-2026-09-21.md · ROADMAP-2026-09-19-nuit-fin-de-session.md (LA source de la reprise du 20/09) · ROADMAP-2026-09-19-specs-hopus.md (le détail des specs) · ROADMAP-2026-09-18-fin-de-session.md (le plus récent) · SPECS.md · Ultima-/specs/ARBITRAGES.md · ROADMAP-2026-09-15-f",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-09-22",
          "quoi": "#528 : DESIGN-LANGAGE abroge « la console garde ses thèmes ». Un défaut de la vitrine y est nommé : --line borde les champs à 1,32:1 (WCAG exige 3:1).",
          "commit": "366302d1382c0ed09af5c511e9f6f8fe875be1dc"
        },
        "prochaine_action": "Valider les paliers 1 et 2 en preview après CI verte, puis poursuivre le shell commun et les vues métier. Le sujet antérieur du simulateur de zone reste dans…",
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
            "quoi": "⚠️ HOPUS CLOS à 13/15 par Paul le 20/09 — puis la vitrine REFONDUE (326064e). Patterns NON re-mesurés depuis. Détail : ROADMAP-2026-09-20-fin-de-session.md",
            "depuis": "2026-09-19"
          },
          {
            "quoi": "⚖️ DEUX RÈGLES D'ARGENT DIVERGENT — la part fixe s'ajoute-t-elle à la commission (landing-core.js, testé) ou s'en déduit-elle (index.html §modele, arbitrage du 13/09) ? 900 €…",
            "depuis": "2026-09-19"
          },
          {
            "quoi": "✅ FERMÉE — la CI est REVENUE le 21/09 22h12 après 3,5 jours. Cause inconnue. Un rouge est de nouveau un VRAI rouge. Détail : ROADMAP-2026-09-21-fin-de-session.md §1",
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
            "quoi": "⛔ LEÇON DU 15/09 — LA CLÉ SERVICE PASSE OUTRE LA RLS, LE PÉRIMÈTRE SE POSE À LA MAIN. Trouvé par l'audit de fin de séance, APRÈS la fusion de #467 : `kv_store` a pour clé primaire…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⛔ LEÇON DU 15/09 — UN GARDE-FOU QU'ON NE PEUT PAS CASSER N'EN EST PAS UN. Trois fois dans la même journée : cinq lignes de validation d'entrée dont la suppression laissait les…",
            "depuis": "2026-09-15"
          },
          {
            "quoi": "⛔ LEÇON DU 15/09 — RÉPARER UN DÉCLENCHEUR SANS LIRE CE QU'IL DÉCLENCHE. `/api/rp-digest` DÉDUISAIT son mode : le passer en quotidien sans rien d'autre aurait envoyé un digest du…",
            "depuis": "2026-09-15"
          }
        ],
        "maj": "2026-09-22"
      },
      "recits": [
        "prochaine_action",
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
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 7,
      "jours_en_attente": 56,
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
        "rattache_a": "CADRAGE-2026-09-25-carte-celeste.md · specs/README.md · specs/ARBITRAGES.md · specs/INDEX.md (généré) · AUDIT-2026-09-14.md · REPRISE-2026-09-06-leo-partout-mail-matin.md · REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md · CADRAGE-RIVEN-IMPORT.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "B1 — Léo AGIT dans l'anneau vert (cadrage §12)",
          "critere_de_sortie": "Léo écrit sans demander dans l'anneau vert et rien au-delà ; chaque écriture journalisée avant l'acte et défaisable d'un clic. ⛔ ①② faits ; ③ ouvre sur un gate"
        },
        "dernier_arret": {
          "le": "2026-09-29",
          "quoi": "Cadrage §12 (Léo agit, 2 POV creusés) + B1 ①② : l'anneau est un champ du catalogue, 3 verts, 19 contrôles éprouvés par 6 sabotages.",
          "commit": "7e779e673e864a0293d955df9f4d1e4620e9a82b"
        },
        "prochaine_action": "B1 étape ③ — le journal des écritures. ⛔ Il commence par le gate : créer la table `leo_ecritures`. On n'écrit pas le module avant la table.",
        "bloque_par": [
          "Gestes Ycome en attente depuis le 28/09 : archiver le dépôt sur GitHub, supprimer le projet Vercel ycome",
          "Créer la table `leo_ecritures` (journal des écritures de Léo) : migration SQL en production — gate, que le mode solo ne lève pas. Elle ouvre B1 ③",
          "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation",
          "LV6 ne démarre que quand tout est propre (Paul, 28/09) : cadrage déposé, exécution gelée",
          "La précision sur « mon dpe.fr » (VITRUVE)",
          "Région Vercel `cdg1` pour les fonctions — MESURÉ le 28/09 : production en `iad1` (Washington), base Ultima en `eu-west-3` (Paris) ; gate déploiement, CADRAGE-RIVEN-IMPORT.md §7 bis",
          "Vérifier que les inscriptions Supabase sont FERMÉES (« Allow new signups ») — un compte tiers pourrait remplir le quota par la route d'import"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "Étiquettes vocales des caps : chacune finit par « 0 lien » sur les menus, du bruit pour un lecteur d'écran. Préexistant, relevé au dry run du 27/09 (carte-celeste §28).",
            "depuis": "2026-09-27"
          },
          {
            "quoi": "MESURÉ le 13/09 et démenti : la note annonçait des copies divergentes du rappel Finubar. Les sept fichiers ont la même empreinte. Voir CADRAGE-FINUBAR.md.",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "COLLECTE — `collecter.mjs` VIDE le grain d'un dépôt hors séance au lieu de garder sa dernière mesure. Cran de sûreté posé le 07/09 (refus d'écrire) ; la FUSION reste à faire.",
            "depuis": "2026-09-07"
          },
          {
            "quoi": "ripair (paggerard-boop) reste en LEÇONS v7 : hors de depots.json et fork partagé avec un tiers — exclu à dessein le 28/09. À trancher par Paul.",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "Aucun contrôle croisé ne compare la copie des leçons d'un dépôt à sa source. Payé le 28/09 : RenoBoost portait 2 leçons absentes de la source, vues au diff avant écrasement.",
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
          }
        ],
        "maj": "2026-09-29"
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
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 0,
      "jours_en_attente": 40,
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
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "078de67",
        "tete_le": "2026-09-19T18:50:58+02:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 39,
      "jours_en_attente": 39,
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
          "le": "2026-09-15",
          "quoi": "Etat vide de /studio tranche (option A) et livre ; le harnais du parcours l'exige et mesure enfin apres hydratation.",
          "commit": "9ab0b08"
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
        "boucles_ouvertes": [],
        "maj": "2026-09-15"
      },
      "recits": [],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "12af06d",
        "tete_le": "2026-09-19T18:49:35+02:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 14,
      "jours_en_attente": 39,
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
        "rattache_a": "ROADMAPARTIDISPO.md (dates, gestes G1-G17, decisions ; §0quater : l'etat MESURE du code) · CADRAGE-2026-09-15-tunnel-artisan.md (le chantier du revenu, T0-T5) · CADRAGE-2026-09-14-annuaire-particulier.md (le chantier annuaire, B1-B9) · docs/SECRETS.md (les variables ET les trois purges) · docs/SPEC-RENOBOOST-LIEN-ARTIDISPO.md (le contrat du lien, pour la seance Renoboost) · docs/REPRISE_RAPIDE.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "Sprint finition 48 h : cohérence RénoBoost et parcours Artidispo recettables de bout en bout.",
          "critere_de_sortie": "Voir ROADMAPARTIDISPO.md, Sprint finition 48 h du 21/09/2026 : chaque parcours convenu exécuté avec preuve, aucun défaut bloquant ouvert et version candidate présentée avant production."
        },
        "dernier_arret": {
          "le": "2026-09-22",
          "quoi": "Audit consolidé après PR53–57 : téléphonie pas seule étape restante. Diagnostic HTTP corrigé contre faux feu vert ; build et 496 tests locaux verts, mutation détectée. Voir…",
          "commit": "e2c347782c7ed84b17fba8c4de84573741e5cc83"
        },
        "prochaine_action": "Confirmer les capacités Voice et la disponibilité du numéro de Henry pour figer le montage, puis corriger et recetter la chaîne d’appels.",
        "bloque_par": [
          "[À CORRIGER AVANT APPELS] twilio-voice encore Brevo, annonce SMS inconditionnelle, callback vocal absent ; claim_missed_call exécutable par anon en production. Migration de droits…",
          "[NON VÉRIFIÉ] Compte Henry : accord, Trial/payant, numéro Voice libre et configuration existante. Aucun nouveau fournisseur choisi ni numéro acheté.",
          "[INCOMPLET] Synchronisation Google réelle, vocal/transcription et notification artisan/.ics non prouvés de bout en bout.",
          "[SÉCURITÉ] Constats historiques à reprendre dans la roadmap ; ancien nombre « dix » non reconfirmé. La sonde HTTP ne valide ni schéma ni isolation métier.",
          "[À CONFIGURER/RECETTER] Schéma et fonctions notifications déployés, SMS désactivés. Identifiants OVH et expéditeur à vérifier avec Paul, puis recette réelle autorisée avant cron.",
          "[À VÉRIFIER] Retour Stripe réel après persistance de session ; isolation entre deux comptes. Le parcours récupération et la lecture réelle de l’agenda sont validés par Paul.",
          "[À APPLIQUER] Modèle email français docs/emails/recuperation-mot-de-passe.html prêt, configuration Supabase non modifiée.",
          "CRON_SECRET et secrets OVH : saisie par Paul. Aucun cron notification créé ; procédure minute du worker dans docs/SECRETS, remplace l’ancien cron horaire rappels-j1.",
          "⏳ ARBITRAGE A REVOIR : SCORE_MINIMUM = 0.3 dans lib/geo/geocodage.js. Valeur arbitree, pas deduite — les scores de la BAN sont bas meme pour de bonnes correspondances (l exemple…",
          "⚠️ TROIS CLIENTS STRIPE ORPHELINS crees par les clics de recette : create-checkout appelle customers.create AVANT l appel qui echoue. Sans gravite en test, a nettoyer avant le…"
        ],
        "en_attente_depuis": "2026-09-08",
        "boucles_ouvertes": [],
        "maj": "2026-09-22"
      },
      "recits": [
        "dernier_arret.quoi",
        "bloque_par[]"
      ],
      "ciel": "alpha",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": "ca445fb",
        "tete_le": "2026-09-22T10:26:49+02:00",
        "commits_depuis": null,
        "commit_inconnu": true
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 7,
      "jours_en_attente": 21,
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
          "le": "2026-09-22",
          "quoi": "J2b livré et sécurisé : API officielle des aides branchée, modèle de repli sorti des dépendances npm (35 vulnérabilités → 0). PR #6, #8",
          "commit": "df377a2508a403a8d870c8958f2167f0fd13d8c1"
        },
        "prochaine_action": "Enrichir la situation envoyée au moteur (gestes de travaux, logement) : aujourd'hui plusieurs aides rendent « infos à recueillir » faute de contexte.",
        "bloque_par": [
          "⚠️ Le modèle officiel est FIGÉ : betagouv/reno arrêté au 18/12/2025, repris par l'ANAH. github.com/anahgouv pas encore ouvert — à surveiller.",
          "⚠️ Le repli embarqué (v2.3.1, 08/04/2025) porte des barèmes du guide Anah 2024. Il dépanne, il ne fait pas autorité. Empreinte SHA-256 gardée par test.",
          "GEMINI_API_KEY en variable d'environnement : action de Paul"
        ],
        "en_attente_depuis": "2026-09-10",
        "boucles_ouvertes": [],
        "maj": "2026-09-22"
      },
      "recits": [],
      "ciel": "renoboost-ia",
      "hors_seance": false,
      "reprise": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-29",
      "jours_depuis_maj": 7,
      "jours_en_attente": 19,
      "rang": 2
    }
  ],
  "macro": {
    "total": 10,
    "lisibles": 10,
    "illisibles": 0,
    "hors_seance": 0,
    "repris": 0,
    "en_cours": 7,
    "en_attente_de_paul": 3,
    "au_repos": 0,
    "derives": 1,
    "commits_inconnus": 5,
    "boucles_ouvertes": 40,
    "gestes_de_paul": [
      {
        "projet": "RénoDevis",
        "geste": "KYC Stripe de SOLA : charges_enabled = 0/2 le 14/09. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul"
      },
      {
        "projet": "RénoDevis",
        "geste": "La clé sk_live_ en prod — le battement disait encore test:true le 14/09"
      },
      {
        "projet": "RénoDevis",
        "geste": "Le verdict de Paul sur la DENSITÉ du cockpit (PR #160) : les tests prouvent la conformité, aucun ne dit si la liste est lisible en usage"
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
        "geste": "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ⏸️ REPORTÉ par Paul le 07/09 — pas de date. Le piège de l'URL est refermé le 01/09 : il ne reste que le…"
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
        "geste": "⛔ MOT DE PASSE SMTP — action de Paul, seul blocage du gate 2 (constaté le 19/09)"
      },
      {
        "projet": "DATA RÉNO",
        "geste": "⚠️ La page de désinscription réécrite (PR #31) est À REDÉPOSER sur Netlify Drop : la version en ligne n'est pas encore celle du dépôt"
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
        "geste": "Gestes Ycome en attente depuis le 28/09 : archiver le dépôt sur GitHub, supprimer le projet Vercel ycome"
      },
      {
        "projet": "Ultima",
        "geste": "Créer la table `leo_ecritures` (journal des écritures de Léo) : migration SQL en production — gate, que le mode solo ne lève pas. Elle ouvre B1 ③"
      },
      {
        "projet": "Ultima",
        "geste": "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation"
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
        "geste": "[À CORRIGER AVANT APPELS] twilio-voice encore Brevo, annonce SMS inconditionnelle, callback vocal absent ; claim_missed_call exécutable par anon en production. Migration de droits…"
      },
      {
        "projet": "Artidispo",
        "geste": "[NON VÉRIFIÉ] Compte Henry : accord, Trial/payant, numéro Voice libre et configuration existante. Aucun nouveau fournisseur choisi ni numéro acheté."
      },
      {
        "projet": "Artidispo",
        "geste": "[INCOMPLET] Synchronisation Google réelle, vocal/transcription et notification artisan/.ics non prouvés de bout en bout."
      },
      {
        "projet": "Artidispo",
        "geste": "[SÉCURITÉ] Constats historiques à reprendre dans la roadmap ; ancien nombre « dix » non reconfirmé. La sonde HTTP ne valide ni schéma ni isolation métier."
      },
      {
        "projet": "Artidispo",
        "geste": "[À CONFIGURER/RECETTER] Schéma et fonctions notifications déployés, SMS désactivés. Identifiants OVH et expéditeur à vérifier avec Paul, puis recette réelle autorisée avant cron."
      },
      {
        "projet": "Artidispo",
        "geste": "[À VÉRIFIER] Retour Stripe réel après persistance de session ; isolation entre deux comptes. Le parcours récupération et la lecture réelle de l’agenda sont validés par Paul."
      },
      {
        "projet": "Artidispo",
        "geste": "[À APPLIQUER] Modèle email français docs/emails/recuperation-mot-de-passe.html prêt, configuration Supabase non modifiée."
      },
      {
        "projet": "Artidispo",
        "geste": "CRON_SECRET et secrets OVH : saisie par Paul. Aucun cron notification créé ; procédure minute du worker dans docs/SECRETS, remplace l’ancien cron horaire rappels-j1."
      },
      {
        "projet": "Artidispo",
        "geste": "⏳ ARBITRAGE A REVOIR : SCORE_MINIMUM = 0.3 dans lib/geo/geocodage.js. Valeur arbitree, pas deduite — les scores de la BAN sont bas meme pour de bonnes correspondances (l exemple…"
      },
      {
        "projet": "Artidispo",
        "geste": "⚠️ TROIS CLIENTS STRIPE ORPHELINS crees par les clics de recette : create-checkout appelle customers.create AVANT l appel qui echoue. Sans gravite en test, a nettoyer avant le…"
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
  "cartouche": {
    "signaux": [
      {
        "projet": "RénoDevis",
        "dit": "a avancé de 7 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoAgenda",
        "dit": "n'est rattaché à aucun commit atteignable — sa fraîcheur n'est plus mesurable, à recaler",
        "pourquoi": "commit_inconnu"
      },
      {
        "projet": "RénoPredict",
        "dit": "n'est rattaché à aucun commit atteignable — sa fraîcheur n'est plus mesurable, à recaler",
        "pourquoi": "commit_inconnu"
      }
    ],
    "action": {
      "projet": "RénoDevis",
      "nature": "code",
      "faire": "DEUX CHEMINS, ET LE PREMIER A UNE DATE. (1) BATIMAT, CHEMIN CRITIQUE — À PAUL, ~5 minutes sur son téléphone : rejouer le geste 07 (le P0 est corrigé et fusionné mais JAMAIS rejoué…",
      "cap": "Le devis part, se relance tout seul tant qu'il n'est pas signé, se signe et s'encaisse — sans que Paul y touche."
    },
    "illisibles": 0,
    "hors_seance": 0
  },
  "constellation": {
    "noeuds": [
      {
        "id": "PaulGERARD161098/RenoDevis",
        "libelle": "RénoDevis",
        "constellation": "en_cours",
        "ciel": "renoboost-ia",
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
