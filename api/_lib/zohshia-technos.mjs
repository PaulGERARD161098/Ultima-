// GÉNÉRÉ par `node zohshia/publier.mjs` — ne pas modifier à la main.
// La techno de ZOH SHIA, à l’état pur, servie au SEUL propriétaire par /api/zohshia.
export default {
 "publie_le": "2026-10-04",
 "technos": [
  {
   "id": "renodevis",
   "ordre": 1,
   "badge": "Outil de création de devis / relance automatique",
   "etat": "En service",
   "mesure": {
    "commit": "d6eba9c",
    "le": "2026-10-04"
   },
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la techno",
     "blocs": [
      {
       "t": "note",
       "paras": [
        [
         [
          "Premier élément de ZOH SHIA, le dragon de la technologie.",
          "b"
         ],
         [
          " Paul, 04/10/2026 : ",
          ""
         ],
         [
          "« dans ZOH SHIA on garde uniquement la technologie en pur — pas de données techniques, pas de nom d'artisan : la technologie elle-même, avec tout ce qu'elle fait, ce qu'elle comporte »",
          "i"
         ],
         [
          ".",
          ""
         ]
        ],
        [
         [
          "Ce document est le ",
          ""
         ],
         [
          "plan",
          "b"
         ],
         [
          " de la techno : ce qu'elle fait, maillon par maillon, les mécanismes qui la tiennent, les données qu'elle manipule et ce qu'elle exige de l'extérieur. Il ne porte ",
          ""
         ],
         [
          "aucune valeur",
          "b"
         ],
         [
          " (prix, taux, coefficient, durée propre à un pro), ",
          ""
         ],
         [
          "aucun nom",
          "b"
         ],
         [
          " d'artisan, de client, de fournisseur ou de marque, ",
          ""
         ],
         [
          "aucun secret",
          "b"
         ],
         [
          ". Les noms techniques (tables, routes, variables) sont gardés : ils décrivent la machine, pas ses données.",
          ""
         ]
        ],
        [
         [
          "⛔ ",
          ""
         ],
         [
          "Les listes sont mesurées, pas écrites de mémoire",
          "b"
         ],
         [
          " : ",
          ""
         ],
         [
          "inventaire.json",
          "c"
         ],
         [
          ", par ",
          ""
         ],
         [
          "collecter.mjs",
          "c"
         ],
         [
          ", sur le dépôt de référence. Un nom technique qui portait un nom propre y est remplacé par ",
          ""
         ],
         [
          "[nom propre]",
          "c"
         ],
         [
          ". ",
          ""
         ],
         [
          "tests/unit-zohshia.mjs",
          "c"
         ],
         [
          " rougit si ce plan oublie une pièce mesurée, ou si un nom propre y entre.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "1. Ce que fait la techno, en une phrase",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Un pro du bâtiment passe d'une ",
         ""
        ],
        [
         "visite de chantier",
         "b"
        ],
        [
         " à un ",
         ""
        ],
        [
         "devis signé et payé",
         "b"
        ],
        [
         ", puis à la ",
         ""
        ],
        [
         "facture",
         "b"
        ],
        [
         ", sans ressaisie : la techno relève, chiffre, contrôle, envoie, suit, relance, fait signer, encaisse et facture — et c'est le pro qui valide, pas qui saisit.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Le parcours, maillon par maillon",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Un dossier est ",
         ""
        ],
        [
         "un devis",
         "b"
        ],
        [
         ", qui naît brouillon et avance d'état en état.",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Maillon",
          ""
         ]
        ],
        [
         [
          "Ce que fait la techno",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Relevé",
           "b"
          ]
         ],
         [
          [
           "Visite sur place, sur téléphone, ",
           ""
          ],
          [
           "hors réseau",
           "b"
          ],
          [
           " : le métré, les équipements, les conditions de TVA réduite. L'appareil est seul propriétaire du relevé jusqu'à sa ",
           ""
          ],
          [
           "remontée explicite",
           "b"
          ],
          [
           " — jamais de synchronisation dans les deux sens.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Chiffrage",
           "b"
          ]
         ],
         [
          [
           "Les lignes se construisent depuis la ",
           ""
          ],
          [
           "bibliothèque de prix du pro",
           "b"
          ],
          [
           " (produits, achats datés, prestations) et le ",
           ""
          ],
          [
           "catalogue fournisseur",
           "b"
          ],
          [
           ". Le prix de vente se calcule par les ",
           ""
          ],
          [
           "règles du pro",
           "b"
          ],
          [
           " (§3). Le prix d'achat ne quitte jamais le serveur.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Devis",
           "b"
          ]
         ],
         [
          [
           "Création à la main, ",
           ""
          ],
          [
           "à la voix",
           "b"
          ],
          [
           ", ou ",
           ""
          ],
          [
           "depuis un devis proche",
           "b"
          ],
          [
           " déjà réalisé (bibliothèque de devis passés, rapprochement par type de chantier). Ce qui se recopie d'un devis proche : structure, équipements, libellés ; ce qui se ",
           ""
          ],
          [
           "recalcule toujours",
           "b"
          ],
          [
           " : le taux de TVA.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Contrôles avant devis",
           "b"
          ]
         ],
         [
          [
           "Coordonnées, mentions légales de l'émetteur, garanties, moyens de paiement, TVA : vérifiés ",
           ""
          ],
          [
           "avant",
           "b"
          ],
          [
           " validation. Toute modification qui invalide une confirmation la fait retomber.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Audit énergétique",
           "b"
          ]
         ],
         [
          [
           "Simulation pompe à chaleur et aides, ",
           ""
          ],
          [
           "calculée ailleurs",
           "b"
          ],
          [
           ", appelée par HTTP serveur à serveur. Le moteur ne se recopie jamais dans cette techno ; hors réseau, on garde la dernière réponse datée.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Envoi",
           "b"
          ]
         ],
         [
          [
           "Le devis part ",
           ""
          ],
          [
           "au nom du pro",
           "b"
          ],
          [
           " : soit avec son nom sur le domaine de la plateforme (réponse directe au pro), soit depuis ",
           ""
          ],
          [
           "son propre domaine",
           "b"
          ],
          [
           ", une fois son DNS vérifié.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Suivi",
           "b"
          ]
         ],
         [
          [
           "Le client ouvre son devis par un ",
           ""
          ],
          [
           "lien à jeton révocable",
           "b"
          ],
          [
           ". Chaque ouverture est tracée ; les devis « chauds » (consultés souvent, ou par paliers) alertent le pro ; un devis jamais ouvert au bout d'un délai signale un mail sans doute perdu.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Signature",
           "b"
          ]
         ],
         [
          [
           "Par le jeton, ",
           ""
          ],
          [
           "côté serveur",
           "b"
          ],
          [
           " : le jeton est résolu en devis sur le serveur, jamais exposé comme une capacité permanente.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Paiement",
           "b"
          ]
         ],
         [
          [
           "Acompte ou totalité, au choix du client, carte ou virement. ",
           ""
          ],
          [
           "Aucune détention de fonds",
           "b"
          ],
          [
           " : la plateforme encaisse pour le compte du pro et prélève sa commission au passage ; la confirmation (y compris le virement, asynchrone) vient du prestataire de paiement, jamais d'un formulaire.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Relance",
           "b"
          ]
         ],
         [
          [
           "Tant que le devis n'est pas signé, un ",
           ""
          ],
          [
           "moteur",
           "b"
          ],
          [
           " prépare les relances selon le comportement du client et le temps écoulé. Par défaut, il ",
           ""
          ],
          [
           "propose",
           "b"
          ],
          [
           " et le pro tranche ; un seul brouillon en attente par devis. Une ",
           ""
          ],
          [
           "prévenance",
           "b"
          ],
          [
           " passe quelques heures avant le moteur.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Synchronisation mail",
           "b"
          ]
         ],
         [
          [
           "Les devis envoyés ",
           ""
          ],
          [
           "hors plateforme",
           "b"
          ],
          [
           " (par la messagerie du pro) sont retrouvés dans la boîte mail et entrent dans le suivi.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Facture",
           "b"
          ]
         ],
         [
          [
           "Une facture client ",
           ""
          ],
          [
           "miroir",
           "b"
          ],
          [
           " du devis se prépare dès sa création et devient définitive après signature, sur action du pro. Les ",
           ""
          ],
          [
           "factures fournisseurs",
           "b"
          ],
          [
           " se rattachent à chaque devis émis (pièce déposée, montant d'achat).",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Assistant",
           "b"
          ]
         ],
         [
          [
           "Un assistant conversationnel répond au pro sur ses dossiers, et recueille ses retours.",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Les mécanismes qui tiennent la techno",
         ""
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "Les règles de prix — l'ossature commune, les détails au pro",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Ce qu'il faut savoir d'",
         ""
        ],
        [
         "un pro",
         "b"
        ],
        [
         " pour calculer la marge d'un chantier — chaque pro y met ",
         ""
        ],
        [
         "ses",
         "b"
        ],
        [
         " valeurs, la techno n'en impose aucune. Mesuré dans le schéma qui les valide (",
         ""
        ],
        [
         "banques_reno.regles",
         "c"
        ],
        [
         ", 04/10/2026) :",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Champ",
          ""
         ]
        ],
        [
         [
          "Rôle",
          ""
         ]
        ],
        [
         [
          "Bornes",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "coefficient_produits",
           "c"
          ]
         ],
         [
          [
           "Prix de vente = achat × coefficient, arrondi ",
           ""
          ],
          [
           "au centime supérieur",
           "b"
          ]
         ],
         [
          [
           "1 à 5",
           ""
          ]
         ]
        ],
        [
         [
          [
           "demi_journee_ht",
           "c"
          ]
         ],
         [
          [
           "Prix HT d'une demi-journée de main-d'œuvre",
           ""
          ]
         ],
         [
          [
           "> 0",
           ""
          ]
         ]
        ],
        [
         [
          [
           "validite_prix_jours",
           "c"
          ]
         ],
         [
          [
           "Âge maximal d'un prix d'achat retenu",
           ""
          ]
         ],
         [
          [
           "1 à 366 jours",
           ""
          ]
         ]
        ],
        [
         [
          [
           "validite_catalogue_jours",
           "c"
          ]
         ],
         [
          [
           "Fraîcheur maximale d'un catalogue",
           ""
          ]
         ],
         [
          [
           "1 à 366 jours",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "À côté, la ",
         ""
        ],
        [
         "bibliothèque de prix",
         "b"
        ],
        [
         " du pro (",
         ""
        ],
        [
         "banques_reno.banque",
         "c"
        ],
        [
         ") : ses produits et leurs prix d'achat sourcés, ses catalogues, ses fiches techniques, ses prix fixes (kits, forfaits), ses prestations et leurs prix de vente historiques. Elle n'accepte aucune donnée personnelle (refus à l'import).",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "⛔ Le dépôt de référence porte en plus une ",
         ""
        ],
        [
         "formule propre à un pro",
         "b"
        ],
        [
         " (son modèle de prix, sa présentation, ses contrôles). Ce n'est pas la techno : la ",
         ""
        ],
        [
         "série de neutralisation",
         "b"
        ],
        [
         " (§8) la retire, et le code extrait n'en contient rien.",
         ""
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "La TVA — la règle légale, datée, jamais recopiée",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": false,
       "items": [
        [
         [
          "Une ",
          ""
         ],
         [
          "table datée et sourcée",
          "b"
         ],
         [
          " des règles, et une fonction pure qui rend le taux applicable pour un type de chantier, ",
          ""
         ],
         [
          "à la date du devis",
          "b"
         ],
         [
          " (obligatoire, sans valeur par défaut : un devis rouvert plus tard ne change pas de taux).",
          ""
         ]
        ],
        [
         [
          "Repli vers le taux plein",
          "b"
         ],
         [
          " : une condition inconnue ne donne jamais le taux réduit. Une condition « inconnue » se distingue d'une condition « non » : seule la première se répare.",
          ""
         ]
        ],
        [
         [
          "La table se modifie ",
          ""
         ],
         [
          "dans le code relu",
          "b"
         ],
         [
          ", jamais depuis un écran ; sa péremption se ",
          ""
         ],
         [
          "signale",
          "b"
         ],
         [
          ", elle ne casse rien.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "La vente, le vendeur, la commission",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": false,
       "items": [
        [
         [
          "Vendeur de référence",
          "b"
         ],
         [
          " décidé par client (la plateforme ou le pro), avec un repli vers le pro — un repli se choisit sur ce qu'il coûte quand il se trompe.",
          ""
         ]
        ],
        [
         [
          "Commission",
          "b"
         ],
         [
          " en pourcentage ",
          ""
         ],
         [
          "du HT",
          "b"
         ],
         [
          " du devis entier, par pro, prélevée sur le paiement.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "La donnée",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": false,
       "items": [
        [
         [
          "Achat côté serveur, vente embarquée",
          "b"
         ],
         [
          " : le prix d'achat n'existe pas dans le navigateur ; le pro lit une ",
          ""
         ],
         [
          "vue de vente",
          "b"
         ],
         [
          " qui ne le porte pas.",
          ""
         ]
        ],
        [
         [
          "Le manuel gagne, l'auto propose",
          "b"
         ],
         [
          " : une correction humaine est marquée et aucune synchronisation ne l'écrase.",
          ""
         ]
        ],
        [
         [
          "La base prouve",
          "b"
         ],
         [
          " : chaque lot laisse une ",
          ""
         ],
         [
          "empreinte",
          "b"
         ],
         [
          " vérifiable par requête ; chaque tâche planifiée pose un ",
          ""
         ],
         [
          "battement",
          "b"
         ],
         [
          ", et un second signal dit si elle tourne ",
          ""
         ],
         [
          "à vide",
          "b"
         ],
         [
          ".",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Les données",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les tables",
         "b"
        ],
        [
         " que le code lit (mesurées) et leur rôle :",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Table",
          ""
         ]
        ],
        [
         [
          "Rôle",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "artisans",
           "c"
          ]
         ],
         [
          [
           "La fiche du pro : identité commerciale et légale, commission, compte de paiement, expéditeur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "profiles",
           "c"
          ]
         ],
         [
          [
           "Les comptes (admin, pro)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "clients",
           "c"
          ]
         ],
         [
          [
           "Les clients finaux, rattachés à leur pro, avec leur vendeur de référence",
           ""
          ]
         ]
        ],
        [
         [
          [
           "devis",
           "c"
          ]
         ],
         [
          [
           "Le dossier, ses lignes, ses états",
           ""
          ]
         ]
        ],
        [
         [
          [
           "devis_events",
           "c"
          ]
         ],
         [
          [
           "Le journal du dossier (envoi, ouverture, relance, paiement…)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "relance_queue",
           "c"
          ]
         ],
         [
          [
           "Les échéances du moteur de relance",
           ""
          ]
         ]
        ],
        [
         [
          [
           "relance_brouillons",
           "c"
          ]
         ],
         [
          [
           "Les relances proposées, une seule en attente par dossier",
           ""
          ]
         ]
        ],
        [
         [
          [
           "relance_gabarits",
           "c"
          ]
         ],
         [
          [
           "Les textes de relance, modifiables par l'administration",
           ""
          ]
         ]
        ],
        [
         [
          [
           "relance_liens",
           "c"
          ]
         ],
         [
          [
           "Les jetons de lien client, révocables",
           ""
          ]
         ]
        ],
        [
         [
          [
           "relance_etat_par_client",
           "c"
          ]
         ],
         [
          [
           "L'état de relance agrégé par client",
           ""
          ]
         ]
        ],
        [
         [
          [
           "messages_envoyes",
           "c"
          ]
         ],
         [
          [
           "La trace de chaque mail parti, constatée par le serveur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "paiements",
           "c"
          ]
         ],
         [
          [
           "Les paiements, constatés par le prestataire, jamais déclarés",
           ""
          ]
         ]
        ],
        [
         [
          [
           "banques_reno",
           "c"
          ]
         ],
         [
          [
           "La bibliothèque de prix d'un pro et ses règles",
           ""
          ]
         ]
        ],
        [
         [
          [
           "catalogue_[nom propre]",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "catalogue_vente",
           "c"
          ]
         ],
         [
          [
           "Le catalogue fournisseur (achat réservé à l'administration) et sa vue de vente",
           ""
          ]
         ]
        ],
        [
         [
          [
           "corpus_devis",
           "c"
          ]
         ],
         [
          [
           "La bibliothèque de devis passés, sans donnée personnelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "realisations",
           "c"
          ]
         ],
         [
          [
           "Les réalisations du pro, montrées au client",
           ""
          ]
         ]
        ],
        [
         [
          [
           "feedbacks",
           "c"
          ]
         ],
         [
          [
           "Les retours des utilisateurs",
           ""
          ]
         ]
        ],
        [
         [
          [
           "sentinelle_etat",
           "c"
          ]
         ],
         [
          [
           "Les battements des tâches planifiées",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les tables que le dépôt de référence ne sait pas créer",
         "b"
        ],
        [
         " — nées dans une base partagée, ailleurs : ",
         ""
        ],
        [
         "catalogue_[nom propre]",
         "c"
        ],
        [
         " (le catalogue fournisseur, nommé ",
         ""
        ],
        [
         "catalogue_fournisseur",
         "c"
        ],
        [
         " dans la techno) · ",
         ""
        ],
        [
         "clients",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "devis",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "devis_events",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "feedbacks",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "profiles",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "relance_queue",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "sentinelle_etat",
         "c"
        ],
        [
         " · ",
         ""
        ],
        [
         "stock",
         "c"
        ],
        [
         " (que la signature décrémente).",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "✅ ",
         ""
        ],
        [
         "Depuis le 04/10/2026, une base neuve se reconstruit quand même",
         "b"
        ],
        [
         " : ZOH SHIA porte leur ",
         ""
        ],
        [
         "socle",
         "b"
        ],
        [
         " (leur état avant la première migration de la techno), et la ",
         ""
        ],
        [
         "finition",
         "b"
        ],
        [
         " que la référence porte après (droits par colonne, gardes de sécurité). ",
         ""
        ],
        [
         "base/rejouer.mjs",
         "c"
        ],
        [
         " reconstruit le tout sur un Postgres jetable et le compare à un ",
         ""
        ],
        [
         "étalon validé par la base de référence elle-même",
         "b"
        ],
        [
         ", en lecture seule — §8.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. Les routes serveur (mesurées)",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Route",
          ""
         ]
        ],
        [
         [
          "Rôle",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "/api/bibliotheque/catalogues",
           "c"
          ]
         ],
         [
          [
           "Dépôt d'un catalogue fournisseur : envoi direct au stockage par URL signée, puis relecture et empreinte côté serveur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/bibliotheque/documents",
           "c"
          ]
         ],
         [
          [
           "Dépôt d'un document de la bibliothèque, après autorisation sur le pro",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/bibliotheque/matrices/neutre-court",
           "c"
          ]
         ],
         [
          [
           "La matrice de devis neutre, en PDF",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/bibliotheque/matrices/[nom propre]",
           "c"
          ]
         ],
         [
          [
           "La matrice de devis propre à un pro, en PDF spécimen",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/bibliotheque/reno",
           "c"
          ]
         ],
         [
          [
           "Lecture et écriture de la bibliothèque de prix d'un pro",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/bibliotheque/reno/fiche",
           "c"
          ]
         ],
         [
          [
           "Fiche technique d'un produit, par lien signé de courte durée",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/corpus/[id]/pdf",
           "c"
          ]
         ],
         [
          [
           "Le PDF d'un devis de la bibliothèque, sous contrôle d'accès",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/[id]/documents",
           "c"
          ]
         ],
         [
          [
           "Les documents d'un devis (dont le PDF d'origine d'un devis importé)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/[id]/facture-fournisseur",
           "c"
          ]
         ],
         [
          [
           "La pièce d'achat d'un devis, par lien privé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/extraire",
           "c"
          ]
         ],
         [
          [
           "Extraction des lignes d'un devis PDF importé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/proposer",
           "c"
          ]
         ],
         [
          [
           "Proposition assistée de lignes à partir d'une demande de travaux",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/reno",
           "c"
          ]
         ],
         [
          [
           "L'assistant conversationnel",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/reno/retour",
           "c"
          ]
         ],
         [
          [
           "Les retours des utilisateurs",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/stripe/webhook",
           "c"
          ]
         ],
         [
          [
           "L'état des paiements et des comptes de paiement, dit par le prestataire",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/sms/stop",
           "c"
          ]
         ],
         [
          [
           "Le désabonnement SMS, rendu effectif côté produit",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/cron/prevenance",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "/api/cron/relances",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "/api/cron/stripe-embarquement",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "/api/cron/sync-email",
           "c"
          ]
         ],
         [
          [
           "Les tâches planifiées (",
           ""
          ],
          [
           "AJOUTER-UN-ARTISAN.md",
           "c"
          ],
          [
           " §4)",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Ce que la techno exige de l'extérieur",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Service",
          ""
         ]
        ],
        [
         [
          "Pour quoi",
          ""
         ]
        ],
        [
         [
          "Sans lui",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Supabase",
           ""
          ]
         ],
         [
          [
           "Base, comptes, fichiers",
           ""
          ]
         ],
         [
          [
           "Rien ne tourne",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Vercel",
           ""
          ]
         ],
         [
          [
           "Hébergement et tâches planifiées",
           ""
          ]
         ],
         [
          [
           "Rien ne tourne",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Stripe Connect",
           ""
          ]
         ],
         [
          [
           "Paiement en ligne, un compte connecté par pro",
           ""
          ]
         ],
         [
          [
           "Pas de paiement ; le reste fonctionne",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Resend",
           ""
          ]
         ],
         [
          [
           "Envoi des mails",
           ""
          ]
         ],
         [
          [
           "Aucun mail ne part",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Gmail",
           ""
          ]
         ],
         [
          [
           "Synchronisation des devis envoyés hors plateforme",
           ""
          ]
         ],
         [
          [
           "Synchronisation arrêtée, rien ne casse",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Twilio",
           ""
          ]
         ],
         [
          [
           "SMS de relance",
           ""
          ]
         ],
         [
          [
           "Canal muet, dégradation propre",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Anthropic",
           ""
          ]
         ],
         [
          [
           "L'assistant",
           ""
          ]
         ],
         [
          [
           "Il répond « non configuré »",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Moteur d'audit énergétique",
           ""
          ]
         ],
         [
          [
           "Simulation pompe à chaleur et aides",
           ""
          ]
         ],
         [
          [
           "L'écran d'audit s'annonce indisponible",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Service d'extraction PDF",
           ""
          ]
         ],
         [
          [
           "Lecture des devis importés",
           ""
          ]
         ],
         [
          [
           "Extraction indisponible",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Chaque service absent ",
         ""
        ],
        [
         "dégrade proprement",
         "b"
        ],
        [
         " : la fonction s'annonce indisponible, le reste du produit ne bouge pas.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "7. Sécurité et cloisonnement",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": false,
       "items": [
        [
         [
          "Chaque pro ne voit que ses dossiers",
          "b"
         ],
         [
          ", par la RLS de la base ; l'administration voit tout. Un pro ne supprime rien et ne change pas le vendeur d'un client.",
          ""
         ]
        ],
        [
         [
          "Les fonctions de la base",
          "b"
         ],
         [
          " ne sont ouvertes qu'à qui en a besoin : les fonctions de déclencheur ne sont pas des RPC ; la voie publique passe par jeton.",
          ""
         ]
        ],
        [
         [
          "Les secrets ne vont jamais au navigateur",
          "b"
         ],
         [
          " (jamais de préfixe public sur une clé serveur) ; aucune donnée personnelle dans les journaux.",
          ""
         ]
        ],
        [
         [
          "Aucune policy d'écriture",
          "b"
         ],
         [
          " sur ce qui doit être constaté (paiements, messages partis) : le silence des policies est la règle.",
          ""
         ]
        ],
        [
         [
          "Les données d'un pro ne servent qu'à lui",
          "b"
         ],
         [
          " : sa bibliothèque, ses devis passés, ses prix ne sont jamais proposés à un autre.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "8. Le code et la base neutres — ce que ZOH SHIA fabrique",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Pièce",
          ""
         ]
        ],
        [
         [
          "Ce qu'elle fait",
          ""
         ]
        ],
        [
         [
          "Ce qui la garde",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "neutraliser.mjs",
           "c"
          ]
         ],
         [
          [
           "Le moteur : applique la recette privée (renommages, remplacements épinglés par empreinte, retouches exactes) ; retire les lignes de commentaire porteuses d'un nom propre",
           ""
          ]
         ],
         [
          [
           "Refus si une retouche a périmé, si un original a changé, si un nom propre survit hors commentaire",
           ""
          ]
         ]
        ],
        [
         [
          [
           "scanner.mjs",
           "c"
          ]
         ],
         [
          [
           "Lit un arbre entier, chemins et contenus",
           ""
          ]
         ],
         [
          [
           "Refus sur un arbre vide ; même détecteur que le test d'Ultima",
           ""
          ]
         ]
        ],
        [
         [
          [
           "base/",
           "c"
          ],
          [
           " + ",
           ""
          ],
          [
           "base/rejouer.mjs",
           "c"
          ]
         ],
         [
          [
           "La base neuve : plateforme simulée (local seulement), socle, migrations neutralisées dans l'ordre relevé, finition",
           ""
          ]
         ],
         [
          [
           "Socle qui ne masque aucune migration ; chaque objet cité existe ; empreinte = étalon validé par la référence. Éprouvé en cassant : 6 sabotages sur 6 au rouge",
           ""
          ]
         ]
        ],
        [
         [
          [
           "extraire.mjs",
           "c"
          ]
         ],
         [
          [
           "Le code : série de neutralisation appliquée ",
           ""
          ],
          [
           "en 3 voies",
           "b"
          ],
          [
           " (elle encaisse les évolutions du dépôt), migrations neutralisées, base ajoutée, export ",
           ""
          ],
          [
           "sans historique",
           "b"
          ]
         ],
         [
          [
           "Conflit réel = arrêt ; un nom propre = sortie effacée ; ",
           ""
          ],
          [
           "--verifier",
           "c"
          ],
          [
           " : typage, tests, build",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "⛔ ",
         ""
        ],
        [
         "Ce qui reste hors de ZOH SHIA, délibérément",
         "b"
        ],
        [
         " : la recette et la série de neutralisation ",
         ""
        ],
        [
         "nomment",
         "b"
        ],
        [
         " ce qu'elles retirent ; elles vivent donc dans ",
         ""
        ],
        [
         "outils/zohshia/renodevis/",
         "c"
        ],
        [
         ", hors du dossier, comme la liste des noms propres.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "checklist",
     "titre": "Check-list du pro",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "0. Deux voies — à choisir d'abord, avec Paul",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Voie",
          ""
         ]
        ],
        [
         [
          "Ce que le pro reçoit",
          ""
         ]
        ],
        [
         [
          "Quand",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "A — il rejoint la plateforme existante",
           "b"
          ]
         ],
         [
          [
           "un compte sur l'instance en place, cloisonné par la RLS",
           ""
          ]
         ],
         [
          [
           "le cas courant : rien à créer, tout à renseigner",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B — une instance à lui",
           "b"
          ]
         ],
         [
          [
           "son code",
           "b"
          ],
          [
           " (extrait neutre) et ",
           ""
          ],
          [
           "sa base",
           "b"
          ],
          [
           " (reconstruite et prouvée), sur ses propres comptes de service",
           ""
          ]
         ],
         [
          [
           "il exige l'isolement de ses données, ou une marque à lui",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La check-list du §1 sert ",
         ""
        ],
        [
         "aux deux voies",
         "b"
        ],
        [
         ". La voie B ajoute le §3.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "1. La check-list — ce qu'il faut obtenir du pro",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Chaque ligne dit ",
         ""
        ],
        [
         "où l'information va",
         "b"
        ],
        [
         " (table · colonne, ou variable) et si elle est ",
         ""
        ],
        [
         "obligatoire",
         "b"
        ],
        [
         " pour que la techno tourne. Rien n'est à inventer : une case vide reste vide, et l'écran le montre.",
         ""
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.1 Son identité — fiche du pro (",
         ""
        ],
        [
         "artisans",
         "c"
        ],
        [
         ", et ",
         ""
        ],
        [
         "profiles",
         "c"
        ],
        [
         " pour son compte)",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ],
        [
         [
          "Obligatoire",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Raison sociale",
           ""
          ]
         ],
         [
          [
           "entreprise",
           "c"
          ]
         ],
         [
          [
           "✅",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Nom du contact, téléphone, e-mail",
           ""
          ]
         ],
         [
          [
           "contact_nom",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "tel",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "email",
           "c"
          ]
         ],
         [
          [
           "✅",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SIRET (la TVA intracommunautaire s'en déduit)",
           ""
          ]
         ],
         [
          [
           "siret",
           "c"
          ],
          [
           " → ",
           ""
          ],
          [
           "tva_intra",
           "c"
          ]
         ],
         [
          [
           "✅ mention légale",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Adresse du siège",
           ""
          ]
         ],
         [
          [
           "adresse",
           "c"
          ]
         ],
         [
          [
           "✅ mention légale",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Qualification RGE (numéro)",
           ""
          ]
         ],
         [
          [
           "rge",
           "c"
          ]
         ],
         [
          [
           "si travaux aidés",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Assurance décennale (assureur, numéro)",
           ""
          ]
         ],
         [
          [
           "decennale",
           "c"
          ]
         ],
         [
          [
           "✅ mention légale",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Logo",
           ""
          ]
         ],
         [
          [
           "logo_url",
           "c"
          ],
          [
           " (stockage ",
           ""
          ],
          [
           "artisan-logos",
           "c"
          ],
          [
           ")",
           ""
          ]
         ],
         [
          [
           "facultatif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Site, page professionnelle, page d'avis",
           ""
          ]
         ],
         [
          [
           "site_url",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "linkedin_url",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "google_page_url",
           "c"
          ]
         ],
         [
          [
           "facultatif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Savoir-faire, produits mis en avant",
           ""
          ]
         ],
         [
          [
           "savoir_faire",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "produits",
           "c"
          ]
         ],
         [
          [
           "facultatif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Attestations (assurance, garanties, qualifications) et leur date de validité",
           ""
          ]
         ],
         [
          [
           "assurance_url",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "garanties_url",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "qualifications_url",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "attestations_valides_jusqu_au",
           "c"
          ]
         ],
         [
          [
           "facultatif — le bloc disparaît seul à expiration",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.2 Ses comptes",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ],
        [
         [
          "Obligatoire",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "E-mail de chaque personne qui se connecte (le pro, ses collaborateurs)",
           ""
          ]
         ],
         [
          [
           "utilisateurs de la base + ",
           ""
          ],
          [
           "profiles",
           "c"
          ],
          [
           " (rôle ",
           ""
          ],
          [
           "pro",
           "c"
          ],
          [
           ") + ",
           ""
          ],
          [
           "artisans.profile_id",
           "c"
          ]
         ],
         [
          [
           "✅",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.3 Ses règles de prix — SA marge, elle ne se devine pas (",
         ""
        ],
        [
         "banques_reno.regles",
         "c"
        ],
        [
         ")",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Champ",
          ""
         ]
        ],
        [
         [
          "Bornes contrôlées",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Coefficient appliqué au prix d'achat",
           ""
          ]
         ],
         [
          [
           "coefficient_produits",
           "c"
          ]
         ],
         [
          [
           "1 à 5",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Prix HT d'une demi-journée de main-d'œuvre",
           ""
          ]
         ],
         [
          [
           "demi_journee_ht",
           "c"
          ]
         ],
         [
          [
           "> 0",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Âge maximal d'un prix d'achat retenu (jours)",
           ""
          ]
         ],
         [
          [
           "validite_prix_jours",
           "c"
          ]
         ],
         [
          [
           "1 à 366",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Fraîcheur maximale d'un catalogue (jours)",
           ""
          ]
         ],
         [
          [
           "validite_catalogue_jours",
           "c"
          ]
         ],
         [
          [
           "1 à 366",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La ",
         ""
        ],
        [
         "TVA",
         "b"
        ],
        [
         " n'est pas à fournir : elle se calcule par la règle légale datée (",
         ""
        ],
        [
         "TECHNO.md",
         "c"
        ],
        [
         "), sur les conditions relevées au chantier.",
         ""
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.4 Ses produits et ses fournisseurs",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ],
        [
         [
          "Obligatoire",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Ses fournisseurs, et pour chaque référence : désignation, catégorie, prix public HT, prix net HT, délai de commande, unité",
           ""
          ]
         ],
         [
          [
           "catalogue_fournisseur",
           "c"
          ],
          [
           " (le prix net ne descend jamais dans le navigateur)",
           ""
          ]
         ],
         [
          [
           "✅ pour chiffrer",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses factures d'achat récentes (prix réellement payés)",
           ""
          ]
         ],
         [
          [
           "banques_reno.banque",
           "c"
          ],
          [
           " · achats",
           ""
          ]
         ],
         [
          [
           "recommandé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses catalogues fournisseurs (PDF, date d'édition) et fiches techniques",
           ""
          ]
         ],
         [
          [
           "banques_reno.banque",
           "c"
          ],
          [
           " · catalogues, fiches",
           ""
          ]
         ],
         [
          [
           "recommandé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses prix fixes (kits, forfaits sans prix d'achat)",
           ""
          ]
         ],
         [
          [
           "banques_reno.banque",
           "c"
          ],
          [
           " · prix fixes",
           ""
          ]
         ],
         [
          [
           "facultatif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses prestations (main-d'œuvre, mise en service, déplacement, maintenance, dépose) et leurs prix de vente",
           ""
          ]
         ],
         [
          [
           "banques_reno.banque",
           "c"
          ],
          [
           " · prestations",
           ""
          ]
         ],
         [
          [
           "recommandé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses devis passés (PDF) et leur issue (signé, en attente, refusé)",
           ""
          ]
         ],
         [
          [
           "corpus (",
           ""
          ],
          [
           "corpus_devis",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "corpus_lignes",
           "c"
          ],
          [
           ") — seul l'identifiant client traverse",
           ""
          ]
         ],
         [
          [
           "facultatif — c'est ce qui rend le premier devis « déjà presque prêt »",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.5 Ses clients existants (facultatif)",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Liste de ses clients à reprendre",
           ""
          ]
         ],
         [
          [
           "clients",
           "c"
          ],
          [
           " rattachés à sa fiche (",
           ""
          ],
          [
           "artisan_id",
           "c"
          ],
          [
           ") — un client créé ensuite par lui s'y rattache tout seul",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.6 Ses mails aux clients",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ],
        [
         [
          "Obligatoire",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Le nom qui signe les mails",
           ""
          ]
         ],
         [
          [
           "identité du pro (voie « au nom du pro », sans rien faire)",
           ""
          ]
         ],
         [
          [
           "✅",
           ""
          ]
         ]
        ],
        [
         [
          [
           "S'il veut envoyer depuis SON domaine : l'adresse d'expédition, et l'accès à sa zone DNS",
           ""
          ]
         ],
         [
          [
           "email_expediteur",
           "c"
          ],
          [
           ", puis ",
           ""
          ],
          [
           "domaine_verifie",
           "c"
          ],
          [
           " ",
           ""
          ],
          [
           "après",
           "b"
          ],
          [
           " contrôle",
           ""
          ]
         ],
         [
          [
           "facultatif — ⛔ le drapeau se pose après vérification, sinon tous ses mails sont refusés",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ses textes de mails (envoi, relances par température, renvoi, communication douce)",
           ""
          ]
         ],
         [
          [
           "relance_gabarits",
           "c"
          ],
          [
           " (clé · variante · sujet · corps)",
           ""
          ]
         ],
         [
          [
           "facultatif — sinon la banque de textes livrée",
           ""
          ]
         ]
        ],
        [
         [
          [
           "S'il envoie des devis hors de l'application : son adresse d'envoi",
           ""
          ]
         ],
         [
          [
           "SYNC_EMAIL_EXPEDITEURS",
           "c"
          ]
         ],
         [
          [
           "si besoin",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.7 Ses relances",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Le moteur propose et il valide, ou il envoie seul",
           ""
          ]
         ],
         [
          [
           "RELANCE_MODE",
           "c"
          ],
          [
           " (",
           ""
          ],
          [
           "valide",
           "c"
          ],
          [
           " / ",
           ""
          ],
          [
           "auto",
           "c"
          ],
          [
           ") — par instance",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SMS : oui ou non, à partir de quelle relance ; consentement de ses clients",
           ""
          ]
         ],
         [
          [
           "RELANCE_SMS_A_PARTIR_DE",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "clients.sms_consent_at",
           "c"
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "1.8 Son paiement en ligne",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information",
          ""
         ]
        ],
        [
         [
          "Où",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Paiement en ligne : oui ou non",
           ""
          ]
         ],
         [
          [
           "—",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Le vendeur de référence, client par client : lui, ou la plateforme",
           ""
          ]
         ],
         [
          [
           "clients.origine",
           "c"
          ],
          [
           " (vide = lui)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Son taux de commission (% du HT)",
           ""
          ]
         ],
         [
          [
           "artisans.commission_pct",
           "c"
          ],
          [
           " — ⛔ sans valeur par défaut : un taux absent se voit",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Son compte de paiement connecté",
           ""
          ]
         ],
         [
          [
           "créé par lui, sur invitation (",
           ""
          ],
          [
           "STRIPE_INVITE_ENABLED",
           "c"
          ],
          [
           ")",
           ""
          ]
         ]
        ]
       ]
      }
     ]
    },
    {
     "id": "service",
     "titre": "Mise en service",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "2. Voie A — il rejoint la plateforme existante",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Chaque ligne dit ",
         ""
        ],
        [
         "qui",
         "b"
        ],
        [
         " agit et ",
         ""
        ],
        [
         "comment",
         "b"
        ],
        [
         " : ",
         ""
        ],
        [
         "Auto",
         "i"
        ],
        [
         " (le système le fait), ",
         ""
        ],
        [
         "Auto partiel",
         "i"
        ],
        [
         ", ou ",
         ""
        ],
        [
         "Manuel",
         "i"
        ],
        [
         ". Les lignes ",
         ""
        ],
        [
         "Manuel",
         "i"
        ],
        [
         " sont la liste de ce qu'il reste à automatiser (§3).",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "#",
          ""
         ]
        ],
        [
         [
          "Étape",
          ""
         ]
        ],
        [
         [
          "Qui",
          ""
         ]
        ],
        [
         [
          "Mode",
          ""
         ]
        ],
        [
         [
          "Gate",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "1",
           ""
          ]
         ],
         [
          [
           "Fiche du pro",
           "b"
          ],
          [
           " : entreprise, contact, logo, savoir-faire, produits, note publique, attestations, identité légale (SIRET, adresse, qualifications, assurance). La TVA intracommunautaire se déduit du SIRET.",
           ""
          ]
         ],
         [
          [
           "Paul (admin)",
           ""
          ]
         ],
         [
          [
           "Manuel — TVA intracom Auto",
           ""
          ]
         ],
         [
          [
           "Écriture en base réelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "2",
           ""
          ]
         ],
         [
          [
           "Commission",
           "b"
          ],
          [
           " : le pourcentage du HT prélevé par la plateforme, propre à ce pro.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "Décision commerciale",
           ""
          ]
         ]
        ],
        [
         [
          [
           "3",
           ""
          ]
         ],
         [
          [
           "Compte de connexion",
           "b"
          ],
          [
           " : créer l'utilisateur, lui donner le rôle de pro, rattacher sa fiche à son compte. Aucune fonction ni aucun écran ne le fait aujourd'hui.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Comptes et données réelles : mandat précis + revue",
           ""
          ]
         ]
        ],
        [
         [
          [
           "4",
           ""
          ]
         ],
         [
          [
           "Cloisonnement prouvé sous son identité réelle",
           "b"
          ],
          [
           " : il voit ses clients et le catalogue de vente ; il ne voit ni client d'un autre pro, ni prix d'achat, ni droits d'administration. Ce qu'il voit compte autant que ce qu'il ne voit pas.",
           ""
          ]
         ],
         [
          [
           "Paul / Léo (lecture)",
           ""
          ]
         ],
         [
          [
           "Manuel (mesure)",
           ""
          ]
         ],
         [
          [
           "Lecture seule",
           ""
          ]
         ]
        ],
        [
         [
          [
           "5",
           ""
          ]
         ],
         [
          [
           "Clients",
           "b"
          ],
          [
           " : un client créé par le pro connecté lui est rattaché tout seul. Les clients existants se rattachent par l'administration. Un pro ne change ni le vendeur ni le pro d'un client.",
           ""
          ]
         ],
         [
          [
           "Système / Paul",
           ""
          ]
         ],
         [
          [
           "Auto (nouveaux) — Manuel (existants)",
           ""
          ]
         ],
         [
          [
           "Écriture en base réelle (existants)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "6",
           ""
          ]
         ],
         [
          [
           "Expéditeur des mails",
           "b"
          ],
          [
           " : « au nom du pro » sur le domaine de la plateforme, sans rien faire ; depuis son propre domaine, seulement après vérification DNS chez lui ",
           ""
          ],
          [
           "et",
           "b"
          ],
          [
           " validation chez le service d'envoi.",
           ""
          ]
         ],
         [
          [
           "Système / pro / Paul",
           ""
          ]
         ],
         [
          [
           "Auto (nom) — Manuel (domaine)",
           ""
          ]
         ],
         [
          [
           "⛔ Le drapeau « domaine vérifié » se pose APRÈS le contrôle, sinon tous ses mails sont refusés",
           ""
          ]
         ]
        ],
        [
         [
          [
           "7",
           ""
          ]
         ],
         [
          [
           "Paiement en ligne",
           "b"
          ],
          [
           " : le compte connecté du pro est créé et relu chaque jour par une tâche planifiée ; l'invitation ne part QUE si ",
           ""
          ],
          [
           "STRIPE_INVITE_ENABLED",
           "c"
          ],
          [
           " est ouvert.",
           ""
          ]
         ],
         [
          [
           "Système / pro",
           ""
          ]
         ],
         [
          [
           "Auto partiel",
           ""
          ]
         ],
         [
          [
           "⛔ Envoi réel à un tiers : décision de Paul",
           ""
          ]
         ]
        ],
        [
         [
          [
           "8",
           ""
          ]
         ],
         [
          [
           "Catalogue de ses fournisseurs",
           "b"
          ],
          [
           " : ses références et leurs prix d'achat dans le catalogue fournisseur (",
           ""
          ],
          [
           "catalogue_[nom propre]",
           "c"
          ],
          [
           ", multi-fournisseur), lues par le pro via la vue de vente, sans prix d'achat.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "Écriture en base réelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "9",
           ""
          ]
         ],
         [
          [
           "Bibliothèque de ses devis passés",
           "b"
          ],
          [
           " (facultatif) : moissonner, structurer, rattacher, verser. Seul l'identifiant traverse vers la base, aucune donnée personnelle.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "Écriture en base réelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "10",
           ""
          ]
         ],
         [
          [
           "Ses règles de prix et sa bibliothèque de prix",
           "b"
          ],
          [
           " (§1.3, §1.4 ; ",
           ""
          ],
          [
           "TECHNO.md",
           "c"
          ],
          [
           " §3) : coefficient, demi-journée de main-d'œuvre, validités ; ses produits, achats, prestations. Ce sont SES valeurs : la techno n'en propose aucune.",
           ""
          ]
         ],
         [
          [
           "Paul (décision)",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "Décision commerciale, puis écriture en base réelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "11",
           ""
          ]
         ],
         [
          [
           "Synchronisation des devis envoyés par mail",
           "b"
          ],
          [
           " (s'il en envoie hors plateforme) : ajouter son adresse d'envoi à ",
           ""
          ],
          [
           "SYNC_EMAIL_EXPEDITEURS",
           "c"
          ],
          [
           ". Ne jamais compter sur la valeur par défaut du code : la poser explicitement.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel (variable de production)",
           ""
          ]
         ],
         [
          [
           "Variable de production",
           ""
          ]
         ]
        ],
        [
         [
          [
           "12",
           ""
          ]
         ],
         [
          [
           "Preuve",
           "b"
          ],
          [
           " : rejouer la requête d'empreinte de la base, puis un devis de bout en bout sur l'écran du pro.",
           ""
          ]
         ],
         [
          [
           "Paul / Léo",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Un essai réel est un effet métier : mandat",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Voie B — une instance à lui : son code, sa base",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "#",
          ""
         ]
        ],
        [
         [
          "Étape",
          ""
         ]
        ],
        [
         [
          "Qui",
          ""
         ]
        ],
        [
         [
          "Mode",
          ""
         ]
        ],
        [
         [
          "Gate",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "B1",
           ""
          ]
         ],
         [
          [
           "Le code",
           "b"
          ],
          [
           " : ",
           ""
          ],
          [
           "node zohshia/renodevis/extraire.mjs --depot <dépôt de référence> --sortie <dossier neuf> --verifier --modules <node_modules>",
           "c"
          ],
          [
           ". Il applique la série de neutralisation en 3 voies, neutralise les migrations, ajoute la base, exporte sans historique, refuse au premier nom propre, et prouve typage, tests et build.",
           ""
          ]
         ],
         [
          [
           "Léo",
           ""
          ]
         ],
         [
          [
           "Auto",
           ""
          ]
         ],
         [
          [
           "Lecture seule — aucun effet",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B2",
           ""
          ]
         ],
         [
          [
           "La base, prouvée avant d'être posée",
           "b"
          ],
          [
           " : ",
           ""
          ],
          [
           "node zohshia/renodevis/base/rejouer.mjs --depot <dépôt>",
           "c"
          ],
          [
           " la reconstruit sur un Postgres jetable et la compare à l'étalon validé par la référence.",
           ""
          ]
         ],
         [
          [
           "Léo",
           ""
          ]
         ],
         [
          [
           "Auto",
           ""
          ]
         ],
         [
          [
           "Lecture seule",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B3",
           ""
          ]
         ],
         [
          [
           "Son dépôt de code",
           "b"
          ],
          [
           " : y pousser l'arbre extrait.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Création d'un dépôt : mandat",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B4",
           ""
          ]
         ],
         [
          [
           "Son projet de base",
           "b"
          ],
          [
           " (région UE) : appliquer, dans l'ordre de ",
           ""
          ],
          [
           "supabase/base/ordre.txt",
           "c"
          ],
          [
           ", le socle, les migrations, la finition. ",
           ""
          ],
          [
           "Pas",
           "b"
          ],
          [
           " le fichier de plateforme simulée : le projet la fournit.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Nouveau projet et écriture en base : mandat, et dépense éventuelle",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B5",
           ""
          ]
         ],
         [
          [
           "Son hébergement",
           "b"
          ],
          [
           " : relier le dépôt, poser TOUTES les variables du §6 avec SES valeurs (clés de ses services), générer un ",
           ""
          ],
          [
           "CRON_SECRET",
           "c"
          ],
          [
           " neuf, vérifier les tâches du §7.",
           ""
          ]
         ],
         [
          [
           "Paul",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Variables de production et dépense : mandat",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B6",
           ""
          ]
         ],
         [
          [
           "Ses services",
           "b"
          ],
          [
           " : domaine d'envoi des mails vérifié, compte de paiement plateforme, SMS si voulu.",
           ""
          ]
         ],
         [
          [
           "Paul / pro",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Comptes tiers, dépense",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B7",
           ""
          ]
         ],
         [
          [
           "Puis la voie A, étapes 1 à 12, sur SON instance",
           "b"
          ],
          [
           " — avec la check-list du §1.",
           ""
          ]
         ],
         [
          [
           "Paul / Léo",
           ""
          ]
         ],
         [
          [
           "voir §2",
           ""
          ]
         ],
         [
          [
           "voir §2",
           ""
          ]
         ]
        ],
        [
         [
          [
           "B8",
           ""
          ]
         ],
         [
          [
           "Preuve sur l'instance",
           "b"
          ],
          [
           " : rejouer la requête d'empreinte de la base, puis un devis de bout en bout sur l'écran du pro.",
           ""
          ]
         ],
         [
          [
           "Paul / Léo",
           ""
          ]
         ],
         [
          [
           "Manuel",
           ""
          ]
         ],
         [
          [
           "⛔ Un essai réel est un effet métier : mandat",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "⚠️ ",
         ""
        ],
        [
         "Le code et la base vont ensemble.",
         "b"
        ],
        [
         " L'extraction note le commit source ; la base livrée est celle que B2 prouve conforme pour ce même état du dépôt. Une extraction d'un commit et une base d'un autre ne se mélangent pas.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Ce qui se décide avec le pro, avant la première ligne",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": false,
       "items": [
        [
         [
          "Ses règles de prix",
          "b"
         ],
         [
          " (étape 10) — c'est SA marge, elle ne se devine pas.",
          ""
         ]
        ],
        [
         [
          "Son vendeur de référence",
          "b"
         ],
         [
          " : la plateforme ou lui, client par client.",
          ""
         ]
        ],
        [
         [
          "Son expéditeur",
          "b"
         ],
         [
          " : son nom sur le domaine de la plateforme, ou son domaine.",
          ""
         ]
        ],
        [
         [
          "Son paiement en ligne",
          "b"
         ],
         [
          " : oui ou non, et son taux de commission.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. Ce qui reste manuel — à automatiser",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Lu dans la colonne ",
         ""
        ],
        [
         "Mode",
         "i"
        ],
        [
         " du §2 : la fiche (1), la commission (2), le compte (3), l'expéditeur sur son domaine (6), le catalogue (8), la bibliothèque de devis (9), les règles de prix (10), la synchronisation mail (11). Le plus fréquent est le 3. Chacun, automatisé, fait gagner une étape à ",
         ""
        ],
        [
         "tous",
         "b"
        ],
        [
         " les pros suivants.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Les variables d'environnement (mesurées)",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Elles sont ",
         ""
        ],
        [
         "par instance",
         "b"
        ],
        [
         " : en voie A, le pro n'en touche qu'une (",
         ""
        ],
        [
         "SYNC_EMAIL_EXPEDITEURS",
         "c"
        ],
        [
         ", étape 11) ; en voie B, ",
         ""
        ],
        [
         "toutes",
         "b"
        ],
        [
         " se posent pour son instance (§3, étape B5). Les noms seulement, jamais les valeurs. ⛔ Les clés marquées ",
         ""
        ],
        [
         "serveur",
         "i"
        ],
        [
         " ne portent ",
         ""
        ],
        [
         "jamais",
         "b"
        ],
        [
         " le préfixe ",
         ""
        ],
        [
         "NEXT_PUBLIC_",
         "c"
        ],
        [
         " : elles seraient publiées dans le navigateur.",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Variable",
          ""
         ]
        ],
        [
         [
          "Rôle",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "SUPABASE_URL",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "NEXT_PUBLIC_SUPABASE_URL",
           "c"
          ]
         ],
         [
          [
           "Adresse du projet de base",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SUPABASE_ANON_KEY",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "NEXT_PUBLIC_SUPABASE_ANON_KEY",
           "c"
          ]
         ],
         [
          [
           "Clé publique de la base (soumise à la RLS)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SUPABASE_SERVICE_ROLE_KEY",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "SUPABASE_SERVICE_KEY",
           "c"
          ]
         ],
         [
          [
           "Clé ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           " de la base — contourne la RLS",
           ""
          ]
         ]
        ],
        [
         [
          [
           "APP_URL",
           "c"
          ]
         ],
         [
          [
           "Adresse publique de l'application (liens des mails)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "CRON_SECRET",
           "c"
          ]
         ],
         [
          [
           "Protège les tâches planifiées",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RESEND_API_KEY",
           "c"
          ]
         ],
         [
          [
           "Clé ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           " d'envoi des mails",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RR_FROM",
           "c"
          ]
         ],
         [
          [
           "Expéditeur produit — ne se change pas en cours de séquence de relance",
           ""
          ]
         ]
        ],
        [
         [
          [
           "FEEDBACK_ADMINS",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "FEEDBACK_NOTIFY_FROM",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "FEEDBACK_NOTIFY_TO",
           "c"
          ]
         ],
         [
          [
           "Retours des utilisateurs",
           ""
          ]
         ]
        ],
        [
         [
          [
           "STRIPE_SECRET_KEY",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "STRIPE_WEBHOOK_SECRET",
           "c"
          ]
         ],
         [
          [
           "Clés ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           " du paiement (la seconde accepte une liste)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "STRIPE_INVITE_ENABLED",
           "c"
          ]
         ],
         [
          [
           "Interrupteur des invitations de paiement — fermé par défaut, délibérément",
           ""
          ]
         ]
        ],
        [
         [
          [
           "GMAIL_CLIENT_ID",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "GMAIL_CLIENT_SECRET",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "GMAIL_REFRESH_TOKEN",
           "c"
          ]
         ],
         [
          [
           "Lecture de la boîte mail pour la synchronisation",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SYNC_EMAIL_EXPEDITEURS",
           "c"
          ]
         ],
         [
          [
           "★ Adresses d'envoi des pros suivis — ",
           ""
          ],
          [
           "à compléter pour chaque pro",
           "b"
          ]
         ]
        ],
        [
         [
          [
           "SYNC_EMAIL_INTERNES",
           "c"
          ]
         ],
         [
          [
           "Adresses internes, jamais prises pour un client",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SYNC_EMAIL_OWNER_ID",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "SYNC_EMAIL_FENETRE",
           "c"
          ]
         ],
         [
          [
           "Propriétaire des devis synchronisés, fenêtre de recherche",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RELANCE_MODE",
           "c"
          ]
         ],
         [
          [
           "valide",
           "c"
          ],
          [
           " (le moteur propose, le pro tranche) ou ",
           ""
          ],
          [
           "auto",
           "c"
          ]
         ]
        ],
        [
         [
          [
           "RELANCE_SMS_A_PARTIR_DE",
           "c"
          ]
         ],
         [
          [
           "Relance à partir de laquelle un SMS s'ajoute ; 0 = jamais",
           ""
          ]
         ]
        ],
        [
         [
          [
           "TWILIO_ACCOUNT_SID",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "TWILIO_AUTH_TOKEN",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "TWILIO_FROM",
           "c"
          ]
         ],
         [
          [
           "SMS",
           ""
          ]
         ]
        ],
        [
         [
          [
           "TRACK_DEDUPE_SECONDES",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "CHAUD_PAS_JOUR",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "CHAUD_PALIERS_OUVERTURES",
           "c"
          ]
         ],
         [
          [
           "Calibrage du suivi : doublons d'ouverture, alertes « devis chaud »",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SILENCE_HEURES",
           "c"
          ]
         ],
         [
          [
           "Devis jamais ouvert au bout de N heures : on prévient le pro que son mail n'est sans doute pas arrivé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "ANTHROPIC_API_KEY",
           "c"
          ]
         ],
         [
          [
           "Clé ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           " de l'assistant",
           ""
          ]
         ]
        ],
        [
         [
          [
           "AUDIT_PAC_BASE_URL",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "AUDIT_PAC_API_SECRET",
           "c"
          ]
         ],
         [
          [
           "Appel du moteur d'audit énergétique (le second est ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           ")",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RENOBOOST_API_URL",
           "c"
          ]
         ],
         [
          [
           "Service d'extraction des PDF",
           ""
          ]
         ]
        ],
        [
         [
          [
           "HUB_DEVIS_URL",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "NEXT_PUBLIC_HUB_URL",
           "c"
          ]
         ],
         [
          [
           "Page devis historique du hub",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RENO_CREATION_SECRET",
           "c"
          ]
         ],
         [
          [
           "Clé ",
           ""
          ],
          [
           "serveur",
           "i"
          ],
          [
           " qui signe les propositions de la création assistée",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "6 bis. Propres au code extrait (voie B)",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le code neutre retire tout défaut d'instance : ce qui avait une valeur écrite en dur se règle désormais, ou se refuse.",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Variable",
          ""
         ]
        ],
        [
         [
          "Rôle",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "MATRICES_PRIVEES_COMPTES",
           "c"
          ]
         ],
         [
          [
           "Comptes autorisés à lire les matrices privées — vide = personne",
           ""
          ]
         ]
        ],
        [
         [
          [
           "CORPUS_DOMAINE_ARTISAN",
           "c"
          ]
         ],
         [
          [
           "Domaine d'envoi du pro, pour l'outil local de moisson du corpus (facultatif)",
           ""
          ]
         ]
        ],
        [
         [
          [
           "SYNC_EMAIL_EXPEDITEURS",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "SYNC_EMAIL_INTERNES",
           "c"
          ],
          [
           " · ",
           ""
          ],
          [
           "SYNC_EMAIL_OWNER_ID",
           "c"
          ]
         ],
         [
          [
           "Obligatoires",
           "b"
          ],
          [
           " pour la synchronisation mail : sans elles, elle refuse de tourner (plus aucun défaut)",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "⚠️ Les tarifs, marges et coefficient du relevé portent des ",
         ""
        ],
        [
         "valeurs d'exemple",
         "b"
        ],
        [
         ", marquées comme telles dans le code : elles se remplacent par les règles du pro (§1.3) avant le premier devis.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "7. Les tâches planifiées (mesurées, heures UTC)",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Tâche",
          ""
         ]
        ],
        [
         [
          "Horaire",
          ""
         ]
        ],
        [
         [
          "Ce qu'elle fait",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "/api/cron/prevenance",
           "c"
          ]
         ],
         [
          [
           "02:00",
           ""
          ]
         ],
         [
          [
           "Prévient le pro quelques heures avant le passage du moteur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/cron/sync-email",
           "c"
          ]
         ],
         [
          [
           "04:45",
           ""
          ]
         ],
         [
          [
           "Synchronise les devis envoyés par mail",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/cron/stripe-embarquement",
           "c"
          ]
         ],
         [
          [
           "06:30",
           ""
          ]
         ],
         [
          [
           "Crée et relit les comptes de paiement connectés ; invite si autorisé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/cron/relances",
           "c"
          ]
         ],
         [
          [
           "08:00",
           ""
          ]
         ],
         [
          [
           "Le moteur de relance",
           ""
          ]
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Chacune pose un ",
         ""
        ],
        [
         "battement",
         "b"
        ],
        [
         " dans ",
         ""
        ],
        [
         "sentinelle_etat",
         "c"
        ],
        [
         " : la requête d'empreinte dit si elle tourne, et si elle tourne à vide.",
         ""
        ]
       ]
      }
     ]
    }
   ]
  }
 ],
 "sources": {
  "renodevis/badge.json": "cdf0f06c4c492ccc21be7bb97a3d5f2da690832d1e1728d2e0a12bd0482fb1ff",
  "renodevis/TECHNO.md": "2ce8eca1658506aa51e857d7903157e72621e18183c8297b271d6eb59c0f4df5",
  "renodevis/AJOUTER-UN-ARTISAN.md": "7ebfc2b34bcc2a7766c1bb20d92f65217efe7d5b3cb579b9bdbd77eba4c9ec99"
 }
};
