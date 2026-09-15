// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-09-15",
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
          "le": "2026-09-14",
          "quoi": "PR #160 fusionnée (squash 87b76a6) : cockpit aligné sur les specs RenoBoost, arrondis 87 → 0, quatre textes repassés au-dessus d'AA. 447 tests verts. Détail : DESIGN-COCKPIT.md",
          "commit": "87b76a6"
        },
        "prochaine_action": "⛔ PAUL — deux gestes, aucun du code, re-mesurés le 14/09 : (1) KYC Stripe de SOLA, charges_enabled = 0/2 ; (2) la clé sk_live_ en prod, le battement dit encore test:true",
        "bloque_par": [
          "Le verdict de Paul sur la DENSITÉ du cockpit (PR #160). Les tests prouvent la conformité et l'accessibilité ; aucun ne dit si la liste est lisible en usage",
          "Embarquement Stripe de SOLA : le compte de TEST existe depuis le 19/08 mais n'encaisse pas encore. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul"
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
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
          },
          {
            "quoi": "⛔ LEÇON DU 13/09, LA PLUS CHÈRE DE LA SÉANCE — UNE MESURE JUSTE N'EST PAS UNE CONCLUSION JUSTE. J'ai mesuré que le repli d'A1 décidait de 100 % des dossiers (171 clients sur 171…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⛔ ET LE GESTE QUI AURAIT ÉVITÉ L'ALLER-RETOUR : vérifier d'abord si le système ne satisfait pas DÉJÀ la demande. Paul voulait « contrôler les flux pour prendre mon cut sans devoir…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "⛔ A5 TIENT, ET C'EST LA LIGNE À NE PAS FRANCHIR. « J'encaisse puis je reverse » ne se code pas littéralement : Stripe ventile à l'instant du paiement, les fonds ne s'arrêtent…",
            "depuis": "2026-09-13"
          },
          {
            "quoi": "Dossier de relecture de la chaîne de relance remis à Paul le 11/09 (8 538 lignes, 4 parties, généré par `scripts/doc-relecture.mjs`, neutralisé et barré). ⚠️ Les RETOURS de la…",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "VOIE C INERTE : le devis part « au nom de » l'artisan depuis notre domaine (voie A). L'envoi DEPUIS le domaine de l'artisan attend un RDV DNS avec Matthieu — mail envoyé à Henry…",
            "depuis": "2026-09-11"
          },
          {
            "quoi": "⛔ LE GOULOT, INCHANGÉ DEPUIS LE 01/09 : 2 devis chiffrés, RE-MESURÉS LE 11/09 sur 13 devis (et non « sur 19 » : 7 relevés ont été supprimés le 08/09, le dénominateur a bougé, pas…",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "Dette mesurée le 07/09, NON traitée à dessein : 42 `.update()` sans `.select()` (chantier, pas une boucle) · ESLint absent (retiré du package.json plutôt qu'installé) ·…",
            "depuis": "2026-09-07"
          }
        ],
        "maj": "2026-09-14"
      },
      "recits": [
        "boucles_ouvertes[].quoi"
      ],
      "ciel": "renoboost-ia",
      "hors_seance": true,
      "reprise": true,
      "derive": {
        "tete": "8f57fbc",
        "tete_le": "2026-09-14T15:41:15+00:00",
        "commits_depuis": 1,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-14",
      "jours_depuis_maj": 1,
      "jours_en_attente": 29,
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
          "quoi": "Revue adverse triée et appliquée : 8 défauts actifs fermés. ⛔ Et l'« échelle ×1,22 » n'a jamais existé — voir ROADMAP §7 et PR #432 à #435.",
          "commit": "3f5c731"
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
            "quoi": "⛔ L'ÉCHELLE DES VOLUMES VIT DANS `ECHELLE_PALIERS` (radar-releves.mjs) : ×1,14 à ×2,24, NON constante. Ne jamais la retaper — elle a divergé dans 7 fichiers.",
            "depuis": "2026-09-13"
          },
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
          }
        ],
        "maj": "2026-09-13"
      },
      "recits": [
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
      "mesure_le": "2026-09-13",
      "jours_depuis_maj": 2,
      "jours_en_attente": 42,
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
        "rattache_a": "AUDIT-2026-09-14.md · REPRISE-2026-09-06-leo-partout-mail-matin.md · REPRISE-2026-09-02-accueil-finubar.md · CADRAGE-ACCUEIL-FINUBAR.md · CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "J3 — le ciel porte aussi l'état PERSONNEL (P4 : les signaux du cockpit)",
          "critere_de_sortie": "ALTHEA en sommeil, idées orphelines et relances dues appellent sur le MÊME ciel et avec la MÊME couleur que les dépôts — un seul fetch, une seule règle de priorité. ⛔ N'ouvre qu'après que P3 ait vécu et que Paul ait dit ce que l'accueil lui fait"
        },
        "dernier_arret": {
          "le": "2026-09-15",
          "quoi": "Séance sur artisan-builder : Ultima n'a reçu que les LEÇONS v22 (quatre leçons payées le 15/09), scellées et propagées à l'octet près. Aucun code Ultima touché.",
          "commit": "08684b7"
        },
        "prochaine_action": "Reprendre le jalon J3/P4 selon l’arbitrage existant, après le retour de Paul sur P3. La migration et la fusion de l’audit sont terminées ; ne pas les rejouer.",
        "bloque_par": [
          "Vérifier `renoboostia.fr` sur resend.com/domains — sans ça le mail du matin ne peut partir QU'à paul.gerard@renoboostia.fr",
          "Régénérer `CRON_SECRET` (projet Vercel `ultima`) : la valeur du 06/09 a circulé en clair dans une conversation",
          "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
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
        "maj": "2026-09-15"
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
      "mesure_le": "2026-09-15",
      "jours_depuis_maj": 0,
      "jours_en_attente": 26,
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
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "mesure_le": "2026-09-15",
      "jours_depuis_maj": 0,
      "jours_en_attente": 25,
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
    "lisibles": 4,
    "illisibles": 0,
    "hors_seance": 4,
    "repris": 2,
    "en_cours": 3,
    "en_attente_de_paul": 1,
    "au_repos": 0,
    "derives": 1,
    "commits_inconnus": 0,
    "boucles_ouvertes": 30,
    "gestes_de_paul": [
      {
        "projet": "RénoDevis",
        "geste": "Le verdict de Paul sur la DENSITÉ du cockpit (PR #160). Les tests prouvent la conformité et l'accessibilité ; aucun ne dit si la liste est lisible en usage"
      },
      {
        "projet": "RénoDevis",
        "geste": "Embarquement Stripe de SOLA : le compte de TEST existe depuis le 19/08 mais n'encaisse pas encore. Le KYC réel en Live reste à l'artisan (LCB-FT), pas à Paul"
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
        "geste": "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
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
      }
    ]
  },
  "cartouche": {
    "signaux": [
      {
        "projet": "RénoDevis",
        "dit": "a avancé de 1 commit(s) depuis sa dernière note",
        "pourquoi": "derive"
      },
      {
        "projet": "RénoBoost",
        "dit": "attend un geste : Promouvoir la CSP Report-Only en enforce, après lecture des rapports (ACTIONS-PAUL.md) — 11/09 — ouvert depuis 42 j",
        "pourquoi": "attente"
      },
      {
        "projet": "Ultima",
        "dit": "arrêté sur : Séance sur artisan-builder : Ultima n'a reçu que les LEÇONS v22 (quatre leçons payées le 15/09), scellées et propagées à l'octet près. Aucun code Ultima touché.",
        "pourquoi": "en_cours"
      }
    ],
    "action": {
      "projet": "RénoDevis",
      "nature": "code",
      "faire": "⛔ PAUL — deux gestes, aucun du code, re-mesurés le 14/09 : (1) KYC Stripe de SOLA, charges_enabled = 0/2 ; (2) la clé sk_live_ en prod, le battement dit encore test:true",
      "cap": "Le devis part, se relance tout seul tant qu'il n'est pas signé, se signe et s'encaisse — sans que Paul y touche."
    },
    "illisibles": 0,
    "hors_seance": 4
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
      },
      {
        "id": "PaulGERARD161098/artisan-builder",
        "libelle": "artisan-builder",
        "constellation": "en_cours",
        "ciel": "alpha",
        "signal": 0
      }
    ],
    "relations": []
  }
};
