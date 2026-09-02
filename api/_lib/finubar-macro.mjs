// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.
// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.
// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit
// l'IMPORTER pour que Vercel l'embarque dans le paquet de la fonction, et
// que `api/_lib/` est le seul motif d'import éprouvé en production ici.
export default {
  "le": "2026-09-02",
  "projets": [
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
          "le": "2026-09-01",
          "quoi": "SOIRÉE À DEUX SÉANCES SUR LA MÊME TABLE, et c'est le fait principal. Ma séance avait retiré `trg_artisans_protege_champs` comme redondant ; l'autre, qui corrigeait au même moment un vrai défaut de ce trigger (SECURITY DEFINER ⇒ `current_user` vaut le propriétaire, donc son échappement `= 'service_role'` n'est jamais vrai et l'Edge Function écrivait dans le vide), l'a constaté « disparu » et l'a re",
          "commit": "4b672a7"
        },
        "prochaine_action": "Brancher la mesure d'audience exemptée (`window.__audience`) — seul point de code restant après le retrait de GA. ⚠️ Ce n'est PAS une tâche sans dépendance : elle exige de choisir un fournisseur (Plausible, Matomo en mode exempté, analytics Vercel), ce qui engage un tiers et un traitement de données personnelles. Arbitrage de Paul. Le chemin, lui, est dé-risqué depuis le 01/09 : le branchement se ",
        "bloque_par": [
          "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
          "Mentions légales : des `[À compléter]` sont visibles ; à lever AU PREMIER EURO ENCAISSÉ, pas à une date",
          "Relecture juriste des CGU avant la première signature client"
        ],
        "en_attente_depuis": "2026-07-15",
        "boucles_ouvertes": [
          {
            "quoi": "Le lot C ne vérifie QUE le RGE (annuaire ADEME). « L'entreprise existe-t-elle et est-elle active » reste à faire, et la matière est prête : `api/_lib/verif-entreprise.mjs` et ses 19 tests, livrés par la PR #60. À PLIER DANS l'Edge Function `verifier-siret`, pas à brancher à côté — une deuxième voie de vérification serait une deuxième vérité de plus sur ce dépôt, qui vient d'en payer trois.",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⚠️ LEÇON DU 01/09 AU SOIR, à ne pas reperdre : deux séances ont travaillé la même table le même soir et se sont mutuellement défait un trigger, chacune en toute bonne foi. Ni l'une ni l'autre n'aurait pu le voir dans les fichiers — seule la base le disait. Avant de toucher un trigger, une policy ou un droit sur `artisans`, RELIRE L'ÉTAT RÉEL (pg_trigger, pg_policies, pg_get_functiondef) et non le ",
            "depuis": "2026-09-01"
          }
        ],
        "maj": "2026-09-01"
      },
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 1,
      "jours_en_attente": 49,
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
        "rattache_a": "ROADMAP-MASTER.md · REPRISE-2026-09-01-jalon-0.md · REPRISE-2026-09-01-fiche-client-acompte.md",
        "etat": "en_attente_de_paul",
        "jalon": {
          "nom": "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
          "critere_de_sortie": "`stickers` > 0 · fiche Google visible publiquement · `stripe_charges_enabled` = true"
        },
        "dernier_arret": {
          "le": "2026-09-01",
          "quoi": "ACQ-2 MERGÉ (PR #313) et ACQ-1 complété côté RenoAgenda (PR #60, mergée aussi). Puis dry run sur `main`, pas sur les branches : 818 tests verts + lint propre côté RenoBoost, 19 tests côté RenoAgenda, 9 sondes vertes sur la base RenoAgenda. ⛔ LE DRY RUN A TROUVÉ UN VRAI ÉCART : `api/leads-artisan.mjs` était mergée et déployée alors qu'AUCUNE des 12 colonnes qu'elle écrit n'existait dans `artisan_le",
          "commit": "acbee69"
        },
        "prochaine_action": "⚠️ LE JALON 0 EST REPORTÉ — décision de Paul le 01/09 au soir (« jalon 0 plus tard »), qui renverse la consigne de clôture prise plus tôt le même jour. Ne PLUS ouvrir une séance en exigeant les trois compteurs : ils restent à zéro et c'est assumé. ⛔ Mais ne pas les perdre de vue non plus — fiche Google à valider, lot de stickers à générer (le piège de l'URL est refermé depuis le 01/09, RénoPredict",
        "bloque_par": [
          "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08",
          "Générer un lot de stickers QR puis imprimer — ouvert depuis le 11/08 (`stickers` = 0). ✅ La vérification manuelle de l'URL n'est plus à faire : corrigée à la source le 01/09 côté RénoPredict (PR #60), les QR portent toujours l'origine de production et l'écran affiche la destination. Il ne reste que le geste physique.",
          "Déployer `main` PUIS finir l'embarquement Stripe de SOLA — dans cet ordre, jamais l'inverse"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "PR #304 (brouillon) — le point de reprise du 31/08. ✅ DEV-A1 tranché et livré le 31/08 (« trois rendus »). ✅ ALT-A2 livré et mergé le 01/09 (PR #310). 🅿️ MKT-A4 SORTI DU PÉRIMÈTRE le 01/09 avec tous les contrats d'entretien. ⚠️ Mais il redevient le PREMIER geste le jour où ce chantier rouvre : il est gratuit tant que `contracts` est vide (0 aujourd'hui) et devient une renégociation après la premi",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "⛔ Les QR des stickers portent l'URL de la page qui GÉNÈRE le PDF (`window.location.origin`, RenoPredict `src/components/stickers/PDFGenerator.jsx:56`) — aucun domaine de production n'est configuré. Générer un lot depuis un preview Vercel ou depuis localhost produit des QR morts, et l'erreur ne se découvre que chez le client, sur du papier déjà collé. Le CLAUDE.md demande de vérifier l'URL à la mai",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⚠️ Copie de PII entre comptes, constatée le 01/09 et NON corrigée : le keyspace kv_store de `henry.huvey@gmail.com` porte une copie du carnet de Paul — 110 fiches clients, 5 pros avec SIRET, téléphones et adresses. Cause : `data.js` filtre le write-through des `clients` (règle posée après l'incident du 03/08) mais RIEN ne filtre le `kv_store`, qu'un second admin repousse sous SON owner_id. La purg",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⚠️ Constat du 01/09, à ne pas reperdre : le backlog du CADRAGE-2026-08-19-audit-gemini.md AFFICHE plus de stock qu'il n'en reste. Vérifié lot par lot dans le code ce jour : lot 3 (récap), lot 4 (fiche pro + passerelle savoir_faire, dashboard.js:4687), lot 5 (frise des relances, produits/renorelance.html) et lot 7 (tarifs) sont LIVRÉS. Ne restent que 6 et 8, tous deux bloqués par une matière que se",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "ACQ-2 (simulateur de zone) — arbitrages RENDUS le 01/09 : Paul a validé les cinq recos. G2 (paniers et marges) est LEVÉ, G3 (part de marché promise) est SUPPRIMÉ du calcul. ⛔ Reste G1, et lui seul : les volumes de recherche par département × métier, que seul Paul peut fournir (export Keyword Planner, ACTIONS-PAUL.md §5). Sans lui, `estimerMarche()` répond « indisponible » — c'est voulu. Restent à ",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⛔ ACQ-1 est écrit mais N'EST PAS ACTIF : trois gestes de Paul manquent, tous dans RenoAgenda. (1) Appliquer `supabase-artisan-verification-schema.sql` sur le projet poskdialgzwxmcfyklvk — il referme au passage une faille constatée le 01/09 : `has_column_privilege('authenticated','artisans','statut','UPDATE')` = true, donc un artisan connecté peut aujourd'hui écrire lui-même `statut = 'valide'` et ",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "⛔ PANNE DE PRODUCTION dans RénoAgenda, trouvée le 01/09 en testant le garde d'ACQ-1 : six policies RLS reconnaissent l'admin par un SELECT sur `auth.users`, que ni `anon` ni `authenticated` n'ont le droit de lire. Une policy permissive qui LÈVE ne renvoie pas « faux » — elle fait échouer toute la requête. Mesuré en base (transaction annulée) : l'inscription artisan (`INSERT … RETURNING`) échoue, e",
            "depuis": "2026-09-01"
          },
          {
            "quoi": "ACQ-2c — l'écran du simulateur sur index.html. Tout l'amont est mergé et prouvé (moteur, référentiel sourcé, route de lead, colonnes en base). ⛔ Il ne reste QUE le gate G1 : les volumes de recherche par département × métier, que seul Paul peut fournir (export Keyword Planner, ACTIONS-PAUL.md §5). Sans lui, `estimerMarche()` répond « indisponible » — volontairement.",
            "depuis": "2026-09-01"
          }
        ],
        "maj": "2026-09-01"
      },
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 1,
      "jours_en_attente": 29,
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
          "le": "2026-09-01",
          "quoi": "Le piège qui rendait le jalon des stickers IRRÉVERSIBLEMENT risqué est refermé, sur GO de Paul. L'URL gravée dans les QR valait `window.location.origin` — donc l'adresse de la page depuis laquelle le PDF était généré : un lot produit depuis un preview Vercel ou depuis localhost portait des QR morts, et l'erreur ne se découvrait qu'au premier flash, sur du papier déjà collé chez un client. Elle vie",
          "commit": "ac5cc1c"
        },
        "prochaine_action": "Rien à coder avant le sticker. La chaîne est finie, testée, mergée — et elle n'a jamais tourné une seule fois, faute d'objet physique.",
        "bloque_par": [
          "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ✅ Le piège de l'URL est refermé le 01/09 (src/lib/qr-url.js : origine de production toujours, destination affichée à l'écran) — il ne reste que le geste physique",
          "Valider la fiche Google Business — sans elle, le cron d'avis J+7 produit des brouillons avec un marqueur à la place du lien",
          "Embarquement Stripe côté RénoPredict — jamais commencé (0 profil sur 2)"
        ],
        "en_attente_depuis": "2026-08-04",
        "boucles_ouvertes": [
          {
            "quoi": "⚖️ Cinq arbitrages MKT-Ax du cadrage marketplace (27/08), recommandations écrites, aucun validé. Celui qui presse est MKT-A4 — qui est partie au contrat d'entretien : son pre-mortem le classe en cause d'échec n°5 (« l'exit se prépare sur un actif qui n'appartient pas à RénoBoost, découvert en due diligence ») et pose la condition qui le rend gratuit : le trancher tant que `contracts` est vide. ✅ V",
            "depuis": "2026-08-27"
          },
          {
            "quoi": "Migre-t-on les données (interventions, entretien_produits, rp_digests, ~81 fiches GHL) de RenoBoost vers le projet renopredict ? Question posée le 12/07, revérifiée le 12/08, jamais tranchée",
            "depuis": "2026-07-12"
          }
        ],
        "maj": "2026-09-01"
      },
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 1,
      "jours_en_attente": 29,
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
        "rattache_a": "ROADMAP-RENORELANCE.md · RenoBoost/ROADMAP-MASTER.md (jalon 1, boucle A)",
        "etat": "en_cours",
        "jalon": {
          "nom": "Jalon 1 boucle A — le premier euro encaissé",
          "critere_de_sortie": "un `1` dans la table `paiements` (0 aujourd'hui)"
        },
        "dernier_arret": {
          "le": "2026-09-01",
          "quoi": "LOT A LIVRÉ, sur GO de Paul. L'UUID d'un devis ne vaut plus un droit de le signer : `sign_devis_public` refuse tout appelant `anon` sur un devis dont le drapeau `signature_uuid_ouverte` est faux — 17 devis sur 18. ⛔ Pas de coupure sèche : le seul devis dont le lien parti chez le client EST un UUID (RR-20260813-9006, jeton créé 4 jours après l'envoi) garde sa voie, sans quoi ce client tomberait sur",
          "commit": "a6fb035"
        },
        "prochaine_action": "⏳ L'OUTIL DE RELANCE — le rendre propre, clair, coloré et rapide d'utilisation. SOLA teste cette semaine. Restent ensuite T2 (identité : colonnes siret / adresse / tva_intra / rge / decennale + report automatique) et le chargement des 9 matrices en base. ⊕ Le lot A n'attend plus rien de nous : sa DERNIÈRE étape se déclenche sur un fait, pas sur une décision — quand la sonde « devis encore signable",
        "bloque_par": [
          "Embarquement Stripe de SOLA : COMMENCÉ mais pas fini. ⚠️ Corrigé le 01/09 — cette ligne disait « stripe_account_id = 0, aucun artisan embarqué », c'est faux depuis un moment : SOLA GROUPE a bien un compte Stripe. Ce qui manque est `stripe_charges_enabled`, encore à false : le compte existe, il n'encaisse pas. DOKLES, lui, n'a toujours aucun compte. Mesuré en base ce jour."
        ],
        "en_attente_depuis": "2026-08-17",
        "boucles_ouvertes": [
          {
            "quoi": "✅ SIGNATURE fermée le 01/09 (garde `signature_uuid_ouverte` dans `sign_devis_public`, réduite à 1 devis sur 18). ⚠️ MAIS LA LECTURE RESTE OUVERTE : `get_devis_public` et `log_devis_open` sont toujours accessibles à `anon` sans condition — quiconque détient l'UUID d'un devis peut en lire le contenu (nom du client, montants, lignes). Divulgation, plus capacité d'écriture. Hors de ce lot À DESSEIN : ",
            "depuis": "2026-08-17"
          },
          {
            "quoi": "✅ PR #103 mergée. ⚠️ L'écart reste : la page devis publique de RénoBoost en chemin UUID ignore `extra.rendu` — un client qui y atterrit voit le détail ligne à ligne quel que soit le rendu choisi. Ne concerne plus qu'UN devis depuis le lot A, et disparaît avec la coupure finale.",
            "depuis": "2026-08-31"
          }
        ],
        "maj": "2026-09-01"
      },
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 1,
      "jours_en_attente": 16,
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
        "rattache_a": "CADRAGE-ULTIMA.md (section ÉTAT) · CADRAGE-FINUBAR.md · CADRAGE-LV6-CIEL-VIVANT.md",
        "etat": "en_cours",
        "jalon": {
          "nom": "FINUBAR — le pilotage des huit dépôts en un seul endroit",
          "critere_de_sortie": "les 8 grains lus par la collecte, le rappel d'ouverture de séance actif dans les 8 dépôts, l'écran /finubar en ligne"
        },
        "dernier_arret": {
          "le": "2026-08-31",
          "quoi": "Deux boucles fermées et FUSIONNÉES sur main. ① L'isolement du ciel resserré à UN SEUL ÉTAGE à la demande de Paul : isoler un nœud peint ses enfants DIRECTS et eux seuls (NAGA → IMLADRIK, ADRAMELECH, TAO), et cliquer l'un d'eux descend d'un cran — la profondeur est contingente à ce qu'il y a dedans, le geste identique à tous les étages (#179, 64bbb93). Le pire cas construit a été RECALCULÉ et non r",
          "commit": "f7f27d1"
        },
        "prochaine_action": "La vérification Finubar ① reste la SEULE de la fusion du 21/08 encore ouverte : recaler les grains des 7 AUTRES dépôts, dont les `dernier_arret.commit` pointent dans le vide depuis le squash-merge. Elle exige d'attacher ces dépôts à la session — refusé par le contrôle de permissions le 31/08, donc à débloquer avec Paul. Elle vient d'être illustrée sur Ultima même : les deux fusions du jour étaient",
        "bloque_par": [
          "Le top départ de LV6 (le cadrage est déposé, l'exécution est gelée à la demande de Paul)",
          "`ANTHROPIC_API_KEY` en env Vercel",
          "Les advisors Supabase post-DDL",
          "L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE)"
        ],
        "en_attente_depuis": "2026-08-20",
        "boucles_ouvertes": [
          {
            "quoi": "Les huit coques de navigation (grima.html, naga.html…) ne sont plus le CHEMIN depuis l'isolement — elles restent des PORTES (repli <noscript>, lien direct, adresse). Leur sort — les garder telles quelles, les réduire, les retirer — n'est pas tranché : à voir avec Paul quand l'isolement aura vécu",
            "depuis": "2026-08-28"
          },
          {
            "quoi": "Angle mort connu du patrimoine : les pages AUTHENTIFIÉES ne sont pas couvertes par les harnais (fixture de session à financer)",
            "depuis": "2026-08-20"
          },
          {
            "quoi": "La constellation : faire entrer les projets dans le ciel — arbitré par Paul le 21/08 (« tout projet d'ampleur doit y être, on en reparle »), volontairement reporté. `versConstellation()` est écrit et testé, branché sur aucune page",
            "depuis": "2026-08-21"
          },
          {
            "quoi": "Le top départ de LV6 reste attendu — le cadrage est déposé, l'exécution gelée",
            "depuis": "2026-08-20"
          }
        ],
        "maj": "2026-08-31"
      },
      "hors_seance": false,
      "derive": {
        "tete": null,
        "tete_le": null,
        "commits_depuis": 0,
        "commit_inconnu": false
      },
      "jours_depuis_maj": 2,
      "jours_en_attente": 13,
      "rang": 2
    },
    {
      "ok": false,
      "hors_seance": true,
      "motif": "dépôt non attaché à cette séance",
      "depot": "paggerard-boop/ripair",
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
    "derives": 0,
    "commits_inconnus": 0,
    "boucles_ouvertes": 18,
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
        "projet": "RénoBoost",
        "geste": "Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08"
      },
      {
        "projet": "RénoBoost",
        "geste": "Générer un lot de stickers QR puis imprimer — ouvert depuis le 11/08 (`stickers` = 0). ✅ La vérification manuelle de l'URL n'est plus à faire : corrigée à la source le 01/09 côté RénoPredict (PR #60), les QR portent toujours l'origine de production et l'écran affiche la destination. Il ne reste que le geste physique."
      },
      {
        "projet": "RénoBoost",
        "geste": "Déployer `main` PUIS finir l'embarquement Stripe de SOLA — dans cet ordre, jamais l'inverse"
      },
      {
        "projet": "RénoPredict",
        "geste": "Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ✅ Le piège de l'URL est refermé le 01/09 (src/lib/qr-url.js : origine de production toujours, destination affichée à l'écran) — il ne reste que le geste physique"
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
        "geste": "Embarquement Stripe de SOLA : COMMENCÉ mais pas fini. ⚠️ Corrigé le 01/09 — cette ligne disait « stripe_account_id = 0, aucun artisan embarqué », c'est faux depuis un moment : SOLA GROUPE a bien un compte Stripe. Ce qui manque est `stripe_charges_enabled`, encore à false : le compte existe, il n'encaisse pas. DOKLES, lui, n'a toujours aucun compte. Mesuré en base ce jour."
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
        "projet": "RénoAgenda",
        "dit": "attend un geste : Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux — ouvert depuis 49 j",
        "pourquoi": "attente"
      },
      {
        "projet": "RénoBoost",
        "dit": "attend un geste : Valider la fiche Google Business « Rénoboost IA » — ouverte depuis le 04/08 — ouvert depuis 29 j",
        "pourquoi": "attente"
      },
      {
        "projet": "RénoPredict",
        "dit": "attend un geste : Générer et imprimer un lot de stickers QR — `stickers` = 0 depuis le 11/08. ✅ Le piège de l'URL est refermé le 01/09 (src/lib/qr-url.js : origine de production toujours, destination affichée à l'écran) — il ne reste que le geste physique — ouvert depuis 29 j",
        "pourquoi": "attente"
      }
    ],
    "action": {
      "projet": "RénoAgenda",
      "nature": "geste",
      "faire": "Recruter et valider des artisans — le dispatch et le dashboard pilotage pointent dans le vide sans eux",
      "cap": "Marketplace particuliers ↔ artisans RGE : la demande arrive, se qualifie et se dispatche toute seule."
    },
    "illisibles": 0,
    "hors_seance": 3
  },
  "constellation": {
    "noeuds": [
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
        "signal": 0
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
