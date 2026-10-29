// GÉNÉRÉ par `node zohshia/publier.mjs` — ne pas modifier à la main.
// La techno de ZOH SHIA, à l’état pur, servie au SEUL propriétaire par /api/zohshia.
export default {
 "publie_le": "2026-10-29",
 "technos": [
  {
   "id": "renodevis",
   "ordre": 1,
   "badge": "Outil de création de devis / relance automatique",
   "etat": "En service",
   "mesure": {
    "commit": "92225cb",
    "le": "2026-10-10"
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
         "Le relevé historique ci-dessous décrit le cycle d'",
         ""
        ],
        [
         "un devis",
         "b"
        ],
        [
         ", qui naît brouillon et avance d'état en état. Le contrat de réception multi-propositions issu du retour d'usage du 29 octobre figure dans « Retour d’usage du 29 octobre 2026 » ; il ne constitue pas une preuve de mise à jour de l'extraction.",
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
           " (dictée en temps réel, ou note vocale transcrite), ou ",
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
           " : le taux de TVA. En création assistée, la techno propose la configuration, les références produit et les quantités ; le pro confirme ou corrige chaque proposition, contrôlée côté serveur. Un ",
           ""
          ],
          [
           "aperçu PDF",
           "b"
          ],
          [
           " s'affiche pendant la création, rendu par le même générateur que les vrais devis, sans rien écrire.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Devis entre professionnels",
           "b"
          ]
         ],
         [
          [
           "Quand le client est une entreprise identifiée par son SIREN, le devis emprunte un ",
           ""
          ],
          [
           "gabarit dédié",
           "b"
          ],
          [
           " : numéro ",
           ""
          ],
          [
           "D-AAAA-MM-NNN",
           "c"
          ],
          [
           " (pour les devis futurs seulement, les références déjà émises ne se renomment jamais), tableau des lignes, détail de la TVA par taux, coordonnées bancaires saisies et contrôlées à chaque devis, mentions obligatoires entre professionnels tirées d'",
           ""
          ],
          [
           "une seule table sourcée et datée",
           "b"
          ],
          [
           ", forme juridique et capital de l'émetteur. Le générateur n'est ouvert qu'aux émetteurs listés ; une liste vide le ferme pour tous.",
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
           ", une fois son DNS vérifié. Le mail ne part que sur ",
           ""
          ],
          [
           "la version affichée",
           "b"
          ],
          [
           " : si le devis a changé depuis l'aperçu, l'envoi est refusé et l'écran demande de relire. Un envoi en cours ne se rejoue pas (opération réservée, puis acceptée).",
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
        ],
        [
         [
          [
           "canal_messages",
           "c"
          ]
         ],
         [
          [
           "En construction",
           "b"
          ],
          [
           " : le dédoublonnage des messages reçus par un canal de messagerie (identifiant du message, pro résolu, type, résultat). Aucun contenu, aucun numéro, aucun nom. Écrite par le serveur seul ; le pro lit ses lignes. Le canal lui-même n'est pas encore branché",
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
           "/api/devis/[id]/fiches",
           "c"
          ]
         ],
         [
          [
           "Les fiches techniques de la bibliothèque du pro, listées et jointes au devis tant qu'il est modifiable ; lecture par lien signé de courte durée",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/apercu",
           "c"
          ]
         ],
         [
          [
           "L'aperçu PDF d'un devis en création : rien n'est écrit, l'émetteur est résolu côté serveur, jamais pris du navigateur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/choisir-reference",
           "c"
          ]
         ],
         [
          [
           "Création assistée : rechercher et confirmer les références produit et la configuration comprises, ajuster les quantités",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/confirmer-quantite",
           "c"
          ]
         ],
         [
          [
           "Création assistée : confirmer une quantité corrigée, y compris avant le choix du client",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/devis/depot-document",
           "c"
          ]
         ],
         [
          [
           "Dépôt d'un document à importer, par envoi direct au stockage (URL signée) ; format réel et taille contrôlés, débit borné ; retrait limité aux dépôts du compte",
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
           "/api/dictee/session",
           "c"
          ]
         ],
         [
          [
           "Ouvre une session de dictée en temps réel auprès du service de transcription, par un secret éphémère ; la clé serveur ne quitte jamais le serveur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "/api/dictee/transcrire",
           "c"
          ]
         ],
         [
          [
           "Transcrit une note vocale enregistrée ; en cas d'échec, la note reste à l'écran pour réessayer",
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
           "OpenAI",
           ""
          ]
         ],
         [
          [
           "La dictée : session en temps réel et transcription des notes vocales",
           ""
          ]
         ],
         [
          [
           "La dictée s'annonce indisponible ; la saisie au clavier reste",
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
           "derive.mjs",
           "c"
          ]
         ],
         [
          [
           "Dit de combien la tête du dépôt de référence a dépassé la série, et combien de ces commits touchent un fichier qu'elle retouche — à l'ouverture de chaque séance d'Ultima (hook) et sur l'écran Finubar (collecte)",
           ""
          ]
         ],
         [
          [
           "Des comptes, jamais des chemins ; « non mesurable » dit avec sa raison ; date du dernier relevé du clone ; ne bloque jamais une séance. Éprouvé sur un faux dépôt et sur le cas réel connu (",
           ""
          ],
          [
           "7d21217",
           "c"
          ],
          [
           " → ",
           ""
          ],
          [
           "f1f9fb3",
           "c"
          ],
          [
           " : 8 commits, 6 sur la série)",
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
         "⚠️ ",
         ""
        ],
        [
         "État de la série au 04/10/2026, 19 h (mesuré)",
         "b"
        ],
        [
         " : rafraîchie sur RénoDevis ",
         ""
        ],
        [
         "f1f9fb3",
         "c"
        ],
        [
         " (tête du jour, PR #274 à #281 comprises). Extraction prouvée sur ",
         ""
        ],
        [
         "--ref origin/main",
         "c"
        ],
        [
         " : 495 fichiers sans nom propre, typage sans erreur nouvelle, ",
         ""
        ],
        [
         "979 tests verts",
         "b"
        ],
        [
         " (931 sur ",
         ""
        ],
        [
         "7d21217",
         "c"
        ],
        [
         "), build vert. Les apports amont propres à l'instance de référence (regroupement des sections du PDF, conditions de paiement de la facture miroir) sont neutralisés comme le reste : seul le chemin générique demeure. Un SHA nu est accepté par ",
         ""
        ],
        [
         "--ref",
         "c"
        ],
        [
         " depuis le dry run du 04/10.",
         ""
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
         "État au 10/10/2026 (mesuré) : le plan et la base suivent la tête, la série non, et c'est délibéré.",
         "b"
        ],
        [
         " Le plan et la base neuve sont remis à jour sur la tête du jour. Le rejeu applique les 45 migrations, et l'étalon est validé contre la référence le 10/10. Il reste ",
         ""
        ],
        [
         "4 écarts constatés",
         "b"
        ],
        [
         ", tous sur ",
         ""
        ],
        [
         "artisans",
         "c"
        ],
        [
         " (colonne, contrainte, index et déclencheur) : ils viennent d'une brique voisine, que cette techno ne lit pas, et la base neuve ne les porte donc pas. La validation a aussi trouvé un vrai défaut, corrigé dans la finition. Son ",
         ""
        ],
        [
         "revoke",
         "c"
        ],
        [
         " effaçait les droits par colonne posés par une migration du 09/10, ce qui reproduisait dans la base neuve le refus d'enregistrement du profil vu en production ce jour-là. La série, elle, reste sur ",
         ""
        ],
        [
         "f1f9fb3",
         "c"
        ],
        [
         ". Une extraction à blanc rend ",
         ""
        ],
        [
         "32 conflits réels",
         "b"
        ],
        [
         ", dont ",
         ""
        ],
        [
         "25",
         "b"
        ],
        [
         " dans des fichiers où l'amont a tissé la formule de l'instance de référence dans le chemin générique. Le prochain chantier de RénoDevis retire justement cette formule du code pour en faire des ",
         ""
        ],
        [
         "paramètres du pro",
         "b"
        ],
        [
         ", lus en base (jalon J4). Il traite donc la cause de ces conflits. La série se rafraîchit ",
         ""
        ],
        [
         "une fois, juste après J4",
         "b"
        ],
        [
         ", sur un code déjà démêlé : rafraîchie avant, elle l'aurait été deux fois sur les mêmes fichiers (arbitrage de Paul, 10/10). D'ici là, ",
         ""
        ],
        [
         "extraire.mjs",
         "c"
        ],
        [
         " refuse, et c'est le signal attendu : ",
         ""
        ],
        [
         "aucun pro ne s'intègre en voie B avant J4",
         "b"
        ],
        [
         ". La voie A, qui ne demande pas d'extraction, reste ouverte.",
         ""
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
         "ZOH SHIA SE TIENT À JOUR DE LA TÊTE",
         "b"
        ],
        [
         " ",
         ""
        ],
        [
         "(Paul, 04/10 : « ZOH doit rester à jour de toute façon : Ultima en porte le code et travaille toujours avec les autres dépôts »)",
         "i"
        ],
        [
         ". Quand RénoDevis avance sur des fichiers que la série retouche, l'extraction refuse : c'est le signal. La série se rafraîchit alors (fusion de la tête dans le clone neutre, apports neutralisés, ",
         ""
        ],
        [
         "serie.mjs",
         "c"
        ],
        [
         ", ",
         ""
        ],
        [
         "extraire.mjs --verifier",
         "c"
        ],
        [
         ") — jamais en corrigeant l'arbre extrait. Le retard ne se cherche pas : ",
         ""
        ],
        [
         "derive.mjs",
         "c"
        ],
        [
         " le dit à l'ouverture de chaque séance d'Ultima et sur l'écran Finubar. Il INDIQUE quand rafraîchir ; seule l'extraction prouve.",
         ""
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
      },
      {
       "t": "h2",
       "r": [
        [
         "Retour d'usage du 29 octobre 2026 et réception de la prochaine extraction",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Déclaré par Paul :",
         "b"
        ],
        [
         " le nouveau système est utilisé et les méthodes de création et de calcul redéfinies fonctionnent bien. Le délai reste trop long. Cette confirmation d'usage est à conserver ; elle ne vaut ni mesure de performance, ni validation de toutes les sources métier, ni recette de la prochaine extraction neutre. Les inventaires, commits et preuves historiques du §8 restent inchangés.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les exigences ci-dessous sont un ",
         ""
        ],
        [
         "contrat à vérifier sur la version source stabilisée",
         "b"
        ],
        [
         ", pas une liste de fonctions déjà reçues. Elles capitalisent les difficultés de préparation, de reprise et d'envoi observées dans une instance, sans importer ses données ni ses règles commerciales.",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Repère",
          ""
         ]
        ],
        [
         [
          "Exigence réutilisable",
          ""
         ]
        ],
        [
         [
          "Preuve de réception attendue",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "R29-01",
           ""
          ]
         ],
         [
          [
           "Un dossier rassemble plusieurs propositions avec des groupes d'alternatives et des compléments facultatifs ou indépendants. Un devis complémentaire conserve son rôle de devis ; une fiche produit conserve son rôle documentaire. Aucun total ne cumule des alternatives.",
           ""
          ]
         ],
         [
          [
           "Dossier fictif avec deux alternatives, un devis complémentaire et trois fiches ; ordre, sélection, total, signature et relance cohérents.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-02",
           ""
          ]
         ],
         [
          [
           "Un lien unique donne accès au manifeste complet des documents autorisés, avec leurs versions. Les pièces jointes au mail et les documents accessibles par le lien sont deux sélections explicites.",
           ""
          ]
         ],
         [
          [
           "Comparaison du manifeste, de la page client, de l'aperçu final et de l'archive d'envoi ; lien expiré ou révoqué refusé.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-03",
           ""
          ]
         ],
         [
          [
           "Destinataires, objet, texte, canal et sélection des pièces appartiennent au brouillon partagé. Une note privée ou un stockage local ne suffit pas à le déclarer prêt.",
           ""
          ]
         ],
         [
          [
           "Rechargement puis reprise depuis une autre session autorisée : même brouillon et mêmes pièces ; divergence signalée avant l'envoi.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-04",
           ""
          ]
         ],
         [
          [
           "L'import conserve l'original et une représentation canonique des montants HT, taxes et TTC. Un montant absent est inconnu, jamais zéro par défaut. Les lecteurs compatibles ne recalculent pas silencieusement un PDF signé ou fourni.",
           ""
          ]
         ],
         [
          [
           "Import neuf, lecture, reprise et second import identique sans réparation manuelle ; variantes cohérentes entre PDF et écran, anomalies explicites.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-05",
           ""
          ]
         ],
         [
          [
           "La chaîne distingue document original, préparation, contrôle, acceptation par le prestataire, livraison et ouverture. Le statut affiché dérive des événements disponibles.",
           ""
          ]
         ],
         [
          [
           "Un import marqué « envoyé » ne fabrique aucun reçu ; une acceptation ne prouve pas la réception ; timeout puis reprise sans double envoi.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-06",
           ""
          ]
         ],
         [
          [
           "Le contrôle porte sur le contenu exact du dossier : documents, versions, destinataires et message. Une modification invalide les seules preuves dépendantes et impose un nouvel aperçu. L'historique reste conservé.",
           ""
          ]
         ],
         [
          [
           "Changer une pièce après contrôle empêche l'emploi de la validation périmée ; aucune fabrication manuelle d'empreinte ni effacement d'historique.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-07",
           ""
          ]
         ],
         [
          [
           "Les corrections explicites et sources d'achat qualifiées précèdent l'application de la matrice. Une ressemblance technique ou un ancien prix de vente ne remplace pas une preuve d'achat. Un forfait déjà exprimé en vente ne subit pas une seconde marge.",
           ""
          ]
         ],
         [
          [
           "Source absente, contradictoire ou non datée visible ; comparaison historique séparée et périmètre comparable ; règles propres au professionnel configurées hors socle.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-08",
           ""
          ]
         ],
         [
          [
           "Une remise commerciale modifie la vente, conserve les achats et recalcule la marge résultante selon la définition du professionnel. Marge sur produits, marge chantier et résultat net restent distincts.",
           ""
          ]
         ],
         [
          [
           "Réconciliation lignes/totaux/arrondis avant et après remise, achats inchangés, fiscalité justifiée par l'instance.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-09",
           ""
          ]
         ],
         [
          [
           "Le texte du professionnel est conservé avec correction de langue et d'unités vérifiable, sans inventer une performance, une économie ni un accord technique. Les questions ouvertes restent dans la note professionnelle.",
           ""
          ]
         ],
         [
          [
           "Aperçu fidèle à la demande et au canal choisi ; aucune hypothèse transformée en engagement client.",
           ""
          ]
         ]
        ],
        [
         [
          [
           "R29-10",
           ""
          ]
         ],
         [
          [
           "La rapidité se mesure de la demande au dossier réellement contrôlable. Réutiliser contexte et preuves encore valides, mutualiser les lectures et ne recalculer que les dépendances modifiées.",
           ""
          ]
         ],
         [
          [
           "Même jeu fictif avant/après : durée par étape, nombre de reprises et actions manuelles ; aucun gain chiffré annoncé sans mesure.",
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
         "Ce qui appartient au socle et ce qui reste à l'instance",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le socle porte les rôles documentaires, relations entre propositions, contrats d'import, événements, persistance, empreintes, provenance et mécanismes de calcul paramétrables. Les identités, catalogues privés, achats, prix, marges, coefficients, forfaits, fiscalité applicable, modèles commerciaux et documents clients restent dans la configuration et les données autorisées de chaque instance. Aucun tarif ou seuil issu du retour d'usage ne devient une constante universelle. Éprouver le même contrat sur deux professionnels fictifs aux règles différentes, avec refus de lecture entre comptes.",
         ""
        ]
       ]
      },
      {
       "t": "h3",
       "r": [
        [
         "Ordre de réception",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Après stabilisation de la version source : relire les changements déjà livrés pour éviter un second moteur, épingler le commit complet, rapprocher chaque repère de son implémentation et de sa preuve, puis lancer l'extracteur existant et les contrôles de neutralité. Si le schéma change, rejouer aussi la base dans une instance isolée. Recevoir ensuite le parcours complet avec service d'envoi simulé et données fictives, y compris reprise de session et modification après contrôle. Ne changer les manifestes, inventaires ou états de disponibilité qu'après ces preuves. Une réparation de dossier en production ne remplace pas cette réception. La présente capitalisation n'active aucun envoi, relance, paiement ou consommateur.",
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
           "Forme juridique, capital social",
           ""
          ]
         ],
         [
          [
           "forme_juridique",
           "c"
          ],
          [
           ", ",
           ""
          ],
          [
           "capital_social",
           "c"
          ]
         ],
         [
          [
           "✅ forme juridique s'il émet des devis à des professionnels (le devis pro refuse de se générer sans elle) ; capital facultatif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Coordonnées bancaires (bénéficiaire, IBAN, BIC)",
           ""
          ]
         ],
         [
          [
           "saisies et contrôlées ",
           ""
          ],
          [
           "à chaque devis pro",
           "b"
          ],
          [
           " (",
           ""
          ],
          [
           "extra.reglement",
           "c"
          ],
          [
           " du devis)",
           ""
          ]
         ],
         [
          [
           "✅ pour un devis pro",
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
        ],
        [
         [
          [
           "13",
           ""
          ]
         ],
         [
          [
           "Devis entre professionnels",
           "b"
          ],
          [
           " (s'il en émet) : ajouter son SIREN à ",
           ""
          ],
          [
           "DEVIS_PRO_EMETTEURS",
           "c"
          ],
          [
           " ; sa fiche porte sa forme juridique. Sans cela, ses devis gardent le chemin ordinaire.",
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
         "⛔ ",
         ""
        ],
        [
         "Au 10/10/2026, B1 refuse, et c'est attendu.",
         "b"
        ],
        [
         " La série de neutralisation se rafraîchit juste après le chantier qui fait de la formule de l'instance de référence des paramètres du pro (",
         ""
        ],
        [
         "TECHNO.md",
         "c"
        ],
        [
         " §8). Aucune voie B ne s'ouvre avant ; la voie A reste ouverte.",
         ""
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
        ],
        [
         [
          "Ses devis entre professionnels",
          "b"
         ],
         [
          " : en émet-il ? Si oui, étape 13.",
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
         " du §2 : la fiche (1), la commission (2), le compte (3), l'expéditeur sur son domaine (6), le catalogue (8), la bibliothèque de devis (9), les règles de prix (10), la synchronisation mail (11), l'ouverture du devis pro (13). Le plus fréquent est le 3. Chacun, automatisé, fait gagner une étape à ",
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
           "OPENAI_API_KEY",
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
           " de la dictée (session en temps réel, transcription des notes) — jamais importée par le code du navigateur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "DEVIS_PRO_EMETTEURS",
           "c"
          ]
         ],
         [
          [
           "SIREN des émetteurs ouverts au générateur de devis pro, séparés par des virgules — vide = fermé pour tous (étape 13). Un identifiant public, pas un secret",
           ""
          ]
         ]
        ],
        [
         [
          [
           "RECETTE_PDF",
           "c"
          ]
         ],
         [
          [
           "Tests seulement",
           "b"
          ],
          [
           " : chemin local d'un PDF réel pour une recette de lecture des documents. Jamais posée en production ; le fichier ne se committe jamais",
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
  },
  {
   "id": "pilotage-back-office",
   "ordre": 2,
   "badge": "Pilotage systématique en back-office",
   "etat": "Règle adoptée · chaque instance reste à éprouver",
   "mesure": null,
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la techno",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Ce que fait la techno",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Toute création comprend le service rendu et son moyen de supervision. Le système peut exécuter ses fonctions dans les permissions accordées ; son responsable doit pouvoir comprendre son état, ses branchements, ses blocages et les décisions attendues, puis intervenir avec les mêmes contrôles serveur.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le contrôle précède l'exécution. On peut préparer le pilotage avant d'avoir le système à piloter : responsable, périmètre, fonctions prévues, droits, décisions et moyen d'arrêt sont définis au cadrage. Une première coque privée est utilisable dès les premiers incréments. Les capacités restent fermées ou en simulation tant que leurs contrôles réels ne sont pas éprouvés.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Avant une action réelle, une autonomie, une mise en ligne ou une extension, vérifier le jalon de pilotage correspondant. La mise en ligne inclut un hébergement privé utilisant des données réelles ou produisant des effets externes. Le projet ne doit pas atteindre un stade coûteux à corriger ou difficile à arrêter avant d'avoir son contrôle ; les jalons concrets sont décrits dans le guide.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le back-office est une fonction distincte du parcours utilisateur. Chaque outil de données possède son propre cockpit miroir dans son interface d’administration, accessible uniquement à ses responsables autorisés. Ce cockpit vit dans l’outil qu’il supervise ; une console centrale ne l’héberge pas et ne le remplace pas. Réutiliser le pilotage administratif existant dans cet outil lorsqu’il couvre le besoin.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "« Miroir » désigne une vue de contrôle des sources et fonctions existantes : état, activité, consommations, coûts, budgets, alertes, journal et commandes autorisées. Il ne crée ni copie concurrente des données métier, ni second moteur de calcul, ni nouvelles permissions. Toute observation précise sa source et sa fraîcheur. Les données absentes sont signalées ; elles ne deviennent pas des zéros.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Cette règle de localisation complète, sans les remplacer, les jalons de contrôle définis ci-dessus. La coque peut précéder le moteur métier, mais une maquette ne vaut jamais preuve de raccordement réel.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Couverture minimale",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Contrôle",
          ""
         ]
        ],
        [
         [
          "Ce qui doit être visible ou possible",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "cockpit_local",
           ""
          ]
         ],
         [
          [
           "Cockpit propre à l’outil, dans son interface d’administration ; aucune copie concurrente des données ou du moteur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "acces_prive",
           ""
          ]
         ],
         [
          [
           "Identité et droits du responsable ; refus effectif des accès non autorisés",
           ""
          ]
         ]
        ],
        [
         [
          [
           "etat_reel",
           ""
          ]
         ],
         [
          [
           "Une observation datée par fonction ; déclaré, mesuré, inféré et non vérifié distincts",
           ""
          ]
         ]
        ],
        [
         [
          [
           "fraicheur",
           ""
          ]
         ],
         [
          [
           "Source, version et date ; un échec conserve un état périmé explicitement signalé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "connecteurs",
           ""
          ]
         ],
         [
          [
           "Branché, absent, expiré, indisponible ; raison et prochaine correction",
           ""
          ]
         ]
        ],
        [
         [
          [
           "informations_manquantes",
           ""
          ]
         ],
         [
          [
           "Ce qui manque pour avancer, responsable et parcours de correction",
           ""
          ]
         ]
        ],
        [
         [
          [
           "travaux_en_cours",
           ""
          ]
         ],
         [
          [
           "Dossiers, tâches, propositions et étapes en préparation",
           ""
          ]
         ]
        ],
        [
         [
          [
           "validations_humaines",
           ""
          ]
         ],
         [
          [
           "Décision attendue sur la version courante ; toute modification invalide l'accord concerné",
           ""
          ]
         ]
        ],
        [
         [
          [
           "alertes_avant_action",
           ""
          ]
         ],
         [
          [
           "Échéances et réserves visibles avant l'action, avec nouvelle vérification côté serveur",
           ""
          ]
         ]
        ],
        [
         [
          [
           "journal",
           ""
          ]
         ],
         [
          [
           "Tentative, résultat et provenance ; aucune donnée sensible inutile",
           ""
          ]
         ]
        ],
        [
         [
          [
           "arret_maitrise",
           ""
          ]
         ],
         [
          [
           "Moyen existant de suspendre ou arrêter, limité au périmètre autorisé et éprouvé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "droits_serveur",
           ""
          ]
         ],
         [
          [
           "Autorisations contrôlées là où l'action est exécutée ; le navigateur ne les crée pas",
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
         "Toutes les fonctions métier doivent avoir une observation de pilotage. Certaines fonctions se supervisent par un lien vers un écran existant. Les actions de contrôle respectent le moteur, les validations et les limites du produit.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Structure réutilisable",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le contrat neutre est dans ",
         ""
        ],
        [
         "CONTRAT.json",
         "c"
        ],
        [
         ". ",
         ""
        ],
        [
         "collecter.mjs",
         "c"
        ],
        [
         " contrôle un dossier d'attestations privé, conservé dans le projet concerné : liste des fonctions, preuves de couverture, preuves des contrôles. Le rapport ne rend que les comptes et les manques, sans URL ni valeur des preuves.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le contrôleur mesure la complétude du dossier, pas la réalité du fonctionnement. Une attestation ne remplace pas une recette depuis le parcours réel. Il n'active rien, n'écrit dans aucune base et ne change aucun droit.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Ce qui autorise un passage",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une lecture normale aboutit de bout en bout ; une lecture refusée reste refusée ; un connecteur coupé produit une erreur utile ; un état périmé reste visible ; une décision sensible attend son accord ; l'arrêt prévu fonctionne dans son périmètre.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Distinguer contrôle prévu (plan), utilisable (parcours accessible) et éprouvé (preuves sur la version et le périmètre concernés). Un écran visible avec une source en erreur est un pilotage préparé, pas une lecture fonctionnelle. Une démonstration, une preview et la production portent des états distincts. La disponibilité du cockpit ne prouve aucune autonomie permanente.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une capacité nouvelle ne passe pas avant son pilotage. Si le jalon manque, garder cette capacité fermée et poursuivre la préparation de son contrôle dans l'environnement isolé. Cette règle organise les passages du projet ; un verrou automatique exige une implémentation et une preuve propres au projet.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. Sécurité et limites",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Secrets au serveur, accès privés et cloisonnement des comptes. Aucune copie des données métier, des calculs ou des permissions dans un moteur concurrent. Aucune action réelle ne découle de l'ajout de cette règle au registre. Un système ne peut pas modifier son propre contrôle par ce dispositif.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les alertes et lectures répétées sont bornées ; elles respectent la visibilité de la page et le budget. Une supervision permanente requiert un mécanisme autorisé et une preuve séparée.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Continuité et charge de travail",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Travailler par unités courtes, terminables et vérifiables, en gardant une seule boucle d'exécution active. Le plan conserve la destination ; chaque unité produit un résultat utile, sa preuve et un point de reprise avant d'ouvrir la suivante. Enchaîner les unités autorisées sans demander une nouvelle confirmation à chaque étape.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Avant une unité, fixer son résultat, les seuls fichiers et contrôles nécessaires, sa condition de sortie et sa limite d'effort. Si elle grossit, réduire son périmètre et consigner le reste avant de poursuivre. Ne pas accumuler simultanément recherches, modifications et vérifications sur plusieurs fronts.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Sauvegarder le travail versionné et le point de reprise dès qu'un résultat utile est obtenu, avant une opération longue ou un changement de sujet. Le point de reprise contient : objectif, version source, fait avec preuve, travail en cours, prochaine action unique, blocage et autorisation réellement manquante. Après interruption, relire ce point et l'état distant ; ne pas recommencer une étape déjà prouvée sur la même version.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Borner les lectures, recherches, sorties d'outils, essais et tâches concurrentes au besoin de l'unité courante. Résumer les résultats volumineux et conserver les références utiles. Si le contexte devient difficile à maîtriser, terminer ou sécuriser l'unité en cours, enregistrer la reprise et repartir dans un contexte allégé. Aucun seuil numérique de surcharge n'est présumé universel.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Retour d'expérience déclaré : une session de travail interrompue a nécessité une recherche du dernier état pour pouvoir reprendre. La cause technique du plantage et sa durée ne sont pas établies ; la surcharge est un risque à prévenir, pas une cause démontrée. Cette règle vise une reprise fiable et une charge bornée ; elle ne garantit pas l'absence de panne et n'active aucun automate.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "checklist",
     "titre": "Avant livraison",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Avant livraison",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Cette recette commence au cadrage, avant de construire le système métier. Le pilotage est prévu avant le projet et rendu utilisable dès ses premiers incréments ; il n'est pas ajouté en fin de construction. Les cases se remplissent à partir du travail mesuré ; une fonction bloquée reste visible avec sa prochaine action.",
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
          "Définir une seule unité d'exécution active, avec résultat utile, périmètre borné et condition de sortie.",
          ""
         ]
        ],
        [
         [
          "Prévoir un point de reprise versionné avant une opération longue et après chaque résultat utile.",
          ""
         ]
        ],
        [
         [
          "Borner les lectures, sorties d'outils et essais au besoin courant ; alléger le contexte avant de perdre la maîtrise du suivi.",
          ""
         ]
        ],
        [
         [
          "Recenser toutes les fonctions et leurs effets ; choisir le responsable du pilotage.",
          ""
         ]
        ],
        [
         [
          "Localiser le cockpit miroir dans l’interface d’administration de l’outil supervisé ; une console centrale ne l’héberge pas.",
          ""
         ]
        ],
        [
         [
          "Réutiliser son cockpit existant lorsque sa couverture suffit, sans dupliquer les sources ni le moteur métier.",
          ""
         ]
        ],
        [
         [
          "Préparer une première coque privée avec accès du responsable, fonctions prévues, décisions et moyen d'arrêt, même sans moteur métier.",
          ""
         ]
        ],
        [
         [
          "Mapper chaque fonction à une observation réelle, datée, et au parcours autorisé de contrôle.",
          ""
         ]
        ],
        [
         [
          "Couvrir tous les contrôles de ",
          ""
         ],
         [
          "CONTRAT.json",
          "c"
         ],
         [
          ", avec preuves datées et version de l'environnement.",
          ""
         ]
        ],
        [
         [
          "Vérifier lecture normale, refus d'accès, perte de source, état périmé, décisions sensibles et arrêt.",
          ""
         ]
        ],
        [
         [
          "Éprouver les contrôles avant toute action réelle, autonomie, mise en ligne ou extension du périmètre.",
          ""
         ]
        ],
        [
         [
          "Consigner ce qui est préparé, testé, déployé, actif ou bloqué.",
          ""
         ]
        ],
        [
         [
          "Garder le dossier d'attestations privé dans le projet concerné.",
          ""
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
         "2. Déroulement",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Jalon",
          ""
         ]
        ],
        [
         [
          "Avant quoi",
          ""
         ]
        ],
        [
         [
          "Condition de passage",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Cadrage",
           ""
          ]
         ],
         [
          [
           "Construction métier",
           ""
          ]
         ],
         [
          [
           "Responsable, fonctions, localisation dans l’administration de l’outil, permissions, risques et arrêt prévus",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Première coque",
           ""
          ]
         ],
         [
          [
           "Prototype métier avancé ou intégration difficile à défaire",
           ""
          ]
         ],
         [
          [
           "Onglet privé de l’outil accessible ; fonctions prévues et blocages visibles ; simulations identifiées",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Ouverture du réel",
           ""
          ]
         ],
         [
          [
           "Action réelle, autonomie ou mise en ligne, même privée",
           ""
          ]
         ],
         [
          [
           "Sources raccordées ; contrôles et arrêt éprouvés de bout en bout sur la version concernée ; mandat effectif",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Extension",
           ""
          ]
         ],
         [
          [
           "Nouvelle fonction, nouveau branchement, nouveaux droits ou hausse d'autonomie",
           ""
          ]
         ],
         [
          [
           "Couverture actualisée et contrôles affectés ré-éprouvés avant ouverture de la nouvelle capacité",
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
         "Raccorder les sources communes et les parcours de contrôle, éprouver les succès et les refus sous isolation adaptée, puis relire les preuves avec le responsable. Une preview strictement isolée, sans données sensibles ni effets externes, peut servir à construire le pilotage ; elle ne valide pas l'ouverture du réel.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Contrôle local du dossier : ",
         ""
        ],
        [
         "node zohshia/pilotage-back-office/collecter.mjs --dossier <fichier-prive>",
         "c"
        ],
        [
         ".",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le dossier JSON contient ",
         ""
        ],
        [
         "fonctions",
         "c"
        ],
        [
         " (noms techniques), ",
         ""
        ],
        [
         "couverture",
         "c"
        ],
        [
         " (preuves par fonction) et ",
         ""
        ],
        [
         "controles",
         "c"
        ],
        [
         " (preuves par contrôle). Chaque preuve porte ",
         ""
        ],
        [
         "etat: \"mesure\"",
         "c"
        ],
        [
         ", une ",
         ""
        ],
        [
         "reference",
         "c"
        ],
        [
         " privée et ",
         ""
        ],
        [
         "le",
         "c"
        ],
        [
         " (date ISO). Le rapport de structure ne publie jamais ces références.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Gates et entretien",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Un jalon manquant bloque le passage concerné ; la capacité reste fermée ou en simulation. Un contrôle manquant ou seulement déclaré empêche de dire la supervision complète. Un dossier vide est refusé. Une fonction nouvelle demande une nouvelle preuve de couverture.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La recette de fonctionnement précède l'ouverture de la capacité et l'annonce de livraison. Un résultat structurel favorable est explicitement une vérification d'attestations, pas une sonde distante. Le collecteur ne bloque techniquement ni un déploiement ni une action : chaque projet doit implémenter et éprouver ses propres verrous. Mettre à jour les preuves après changement de version, de branchement ou de droits.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Respecter les autorisations effectives : déploiement public, dépense, migration, suppression ou envoi réel exigent le mandat correspondant. Le pilotage n'élargit jamais ces autorisations. L'activation d'un automate reste distincte de sa présence dans le code.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Vérifier la continuité sans surcharger",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Sur une copie ou un environnement isolé, interrompre une unité après son point de sauvegarde. Reprendre à partir du point versionné et de l'état distant : le résultat déjà prouvé doit être retrouvé sans recommencer toute l'analyse ; la prochaine action doit être unique et exécutable. Un travail non sauvegardé reste indiqué comme tel.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Contre-épreuve : retirer la version ou la preuve du point de reprise. La reprise doit signaler ce manque et revalider seulement l'élément concerné, sans déclarer l'unité terminée. Vérifier aussi qu'un élargissement du périmètre est reporté explicitement et qu'une étape autorisée n'attend pas un nouveau « go » par simple découpage.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Ces critères décrivent la recette à mener dans chaque projet. L'ajout de cette règle ne prouve pas sa recette réelle et ne constitue aucun verrou automatique de charge ou de contexte.",
         ""
        ]
       ]
      }
     ]
    }
   ]
  },
  {
   "id": "anti-pattern",
   "ordre": 3,
   "badge": "Anti-pattern — approches croisées",
   "etat": "Méthode documentée · application à éprouver par sujet",
   "mesure": null,
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la techno",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Résultat et rétrocadrage",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Toujours aborder un même sujet par au moins deux approches réellement différentes. Partir du résultat utile attendu, définir sa preuve de réussite, puis remonter aux données, hypothèses et étapes nécessaires. Chercher ce qui pourrait invalider la conclusion. Appliquer au minimum 2 points de vue pour tout sujet, 3 pour une tâche complexe et 4 pour un plan ou rétroplanning. Le seuil le plus élevé s'applique si les catégories se cumulent. Une tâche à dépendances multiples, forte incertitude, plusieurs composants ou conséquences matérielles est complexe. Garder les angles brefs pour une petite tâche.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La méthode s'applique aux calculs, diagnostics, décisions et méthodes de travail. Elle prévient les automatismes, les erreurs de dénominateur, les validations circulaires et les tentatives répétées sans information nouvelle. Elle ne remplace pas les règles métier.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Deux approches et leurs dépendances",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Calcul : détail depuis les entrées puis contrôle inverse, conservation, ordre de grandeur ou rapprochement à une référence distincte. Travail : chemin depuis les moyens puis chemin remonté depuis la preuve attendue. Diagnostic : hypothèse principale puis cause concurrente et observation qui les départage. Livraison : parcours normal puis échec ou limite pertinente en environnement isolé.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Préciser ce qui change entre les approches : raisonnement, source ou observation. Une reformulation, un autre outil ou un autre modèle exécutant la même méthode ne suffit pas. Nommer les hypothèses communes : un contrôle inverse ne prouve ni le bon tarif ni la bonne convention métier. Pour un plan ou rétroplanning, examiner quatre angles par défaut : résultat et utilisateur ; exécution et moyens ; calendrier et dépendances ; risques, échecs et marges de manœuvre. Adapter les angles sans réduire le minimum.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Calculs et écarts",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Définir grandeur, dénominateur, unités, période, base hors taxes ou toutes taxes comprises, formule autorisée, provenance et arrondis avant calcul. Définir la tolérance avant comparaison, la justifier et ne pas la desserrer après résultat. Ne stocker ici aucune formule ou valeur propre à un professionnel.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Comparer les résultats et leurs hypothèses. Ne pas moyenner des réponses incompatibles ni faire voter les outils. Résoudre la cause de l'écart puis refaire les contrôles affectés. Suspendre seulement la conclusion ou l'action dépendante ; poursuivre le travail indépendant autorisé. Une deuxième tentative sans information nouvelle exige un changement d'hypothèse ou de méthode.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Contrat réutilisable et limites",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le dossier de preuve précise typeSujet (tache, plan ou retroplanning) et complexe (booléen), puis décrit le résultat, le critère, les approches, leurs dépendances communes, les observations sourcées, l'écart, sa résolution et les limites. Le collecteur collecter.mjs vérifie seulement sa structure et ses déclarations ; il ne vérifie pas la vérité des sources, l'indépendance réelle du raisonnement ou la justesse métier. Un résultat structurel favorable ne constitue pas une validation du calcul ou du produit.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La fiche et son badge utilisent le mécanisme de publication existant. Aucun moteur métier, service, base, compte ou dépense supplémentaire. Les preuves propres à une instance restent dans son dossier privé, hors de cette technologie neutre. La compétence de travail applique le protocole ; le présent contrat décrit sa version réutilisable sans donnée client.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. Bibliothèque de 100 points de vue",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La bibliothèque points-de-vue.json contient 100 fiches identifiées de PDV-001 à PDV-100, avec alias, question directrice, preuve à chercher et limite. Dix familles : usagers, commerce, économie, preuves, causalité, systèmes, calendrier, risques, décisions et collectif. L'index BIBLIOTHEQUE.md sert à choisir sans charger les cent fiches.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Invoquer un identifiant ou alias avec bibliotheque.py --id PDV-021 ; rechercher avec --search calendrier ; sélectionner avec --pack plan ou --pack retroplanning. Les packs fournissent des points de départ conformes aux minima 2/3/4, à adapter au sujet. Une sélection ne constitue pas une analyse exécutée. Les cent fiches sont des guides, sans expertise autonome ni certitude garantie.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La recherche publique et les rapprochements conceptuels sont documentés dans sources-pdv.md. Les fiches françaises sont une synthèse originale : aucun installateur ni code tiers n'est exécuté ou embarqué. La copie distribuée dans la compétence de travail conserve exactement le même catalogue JSON ; comparer les empreintes lors d'une mise à jour. Les sources et le catalogue restent exclus du déploiement statique par le dossier privé existant.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Invocation par l'interlocutrice de pilotage",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "L'interlocutrice choisit les angles selon le résultat recherché, les contraintes et les incertitudes, puis applique leurs questions et confronte les constats. Les angles demandés sont respectés ; une analyse globale est complétée jusqu'au minimum 2/3/4. Une invocation isolée reste possible sans prétendre couvrir toute la méthode. Les packs sont adaptés à l'idée ou au plan, sans sélection aveugle par mots-clés.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le lecteur local donne les fiches détaillées dans un environnement autorisé. Pour une conversation qui ne peut pas lire le dépôt, publier-leo.mjs génère un index compact de 100 IDs, alias et questions pour le prompt serveur. Ce module est une projection du même catalogue, liée par empreinte ; le contrôle --verifier refuse une version périmée. Mettre à jour cette projection lors d'un changement du catalogue. Elle ne crée aucun outil, accès externe ou exécution autonome ; une preuve absente reste non vérifiée.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "7. Grille de contre-épreuve d'un projet calculé et sauvegardé",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Réutiliser trois angles : utilisateur qui édite pendant une requête ; serveur confronté à une entrée forgée ; calcul contrôlé par ses dépendances et sa décomposition. Adapter les cas au risque. Cette grille guide une recette ; sa présence ne prouve pas son exécution.",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Risque",
          ""
         ]
        ],
        [
         [
          "Contre-épreuve",
          ""
         ]
        ],
        [
         [
          "Preuve attendue",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Résultat ou champ protégé fourni par le client",
           ""
          ]
         ],
         [
          [
           "Modifier directement la requête, sans passer par l'interface",
           ""
          ]
         ],
         [
          [
           "Refus avant écriture ou reconstruction serveur ; identité et révision contrôlées séparément",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Saisie perdue pendant une sauvegarde ou un calcul",
           ""
          ]
         ],
         [
          [
           "Retarder la réponse, éditer à nouveau, puis laisser arriver la réponse ancienne",
           ""
          ]
         ],
         [
          [
           "Dernière saisie conservée, révision de base actualisée et état encore modifié si nécessaire",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Diagnostic ou export périmé",
           ""
          ]
         ],
         [
          [
           "Modifier séparément chaque entrée thermique, sa provenance, puis besoins et montants",
           ""
          ]
         ],
         [
          [
           "Empreinte couvrant les dépendances effectives ; résultat périmé ou appréciation reconstruite selon son contrat ; version du moteur identifiable",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Valeur absente assimilée à zéro",
           ""
          ]
         ],
         [
          [
           "Comparer absent, inconnu et zéro explicite",
           ""
          ]
         ],
         [
          [
           "Calcul partiel et donnée manquante visibles ; total complet seulement quand les entrées nécessaires sont connues",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Poste énergétique compté deux fois",
           ""
          ]
         ],
         [
          [
           "Décomposer l'existant et la cible par usage avant de totaliser",
           ""
          ]
         ],
         [
          [
           "Chaque consommation comptée une seule fois ; hypothèses d'eau chaude et de chauffage explicites",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Tests verts trop faibles",
           ""
          ]
         ],
         [
          [
           "Exécuter la régression sur l'ancienne version dans une copie isolée",
           ""
          ]
         ],
         [
          [
           "Échec pour le défaut visé, puis réussite sur le correctif ; un échec d'environnement ne vaut pas détection du défaut",
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
         "8. Portée des preuves et arrêt de séance",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une preuve porte date, version et environnement. Distinguer code préparé, tests locaux, contrôle continu, préversion disponible, recette utilisateur et publication effective. Pour une évolution de base : migration préparée, simulation exécutée, simulation réussie et application effective sont quatre états distincts. Une base simulée ne valide pas une base réelle ; un contrôle continu vert ne prouve ni une migration appliquée ni un parcours utilisateur validé. Qualifier aussi la relecture : une passe du même auteur n'est pas une revue indépendante.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Avant de compiler, identifier les sorties réseau des extensions de construction, même si la télémétrie du framework est désactivée. L'absence de configuration d'exécution ne prouve pas l'absence de télémétrie de compilation. Un refus de la plateforme arrête l'action concernée : ne pas contourner, poursuivre les vérifications indépendantes autorisées et nommer la couverture manquante.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "À l'arrêt demandé, clôturer le périmètre réellement prouvé et reporter nommément les validations restantes. Ne pas transformer une correction terminée en produit entièrement validé. Les incidents et leurs preuves restent dans le fichier canonique des leçons, hors de la technologie neutre ; cette grille n'active aucun contrôle permanent et n'élargit aucun droit.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "9. Livrer avec une vérification proportionnée",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le résultat utile comprend le délai et la fiabilité. Croiser le parcours de l'utilisateur, la provenance des données et le cas défavorable ; les minima de points de vue ne multiplient pas automatiquement les campagnes complètes de tests.",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": true,
       "items": [
        [
         [
          "Avant le code, relire la maquette validée, les composants existants et les contrats de style, de données et de publication. Réutiliser leurs classes et leurs jetons ; prévoir le survol, le clavier, le toucher et les données absentes dès le premier lot.",
          ""
         ]
        ],
        [
         [
          "Définir les preuves nécessaires selon le risque et distinguer contrôles obligatoires, contrôles ciblés et approfondissements facultatifs. Conserver tous les contrôles obligatoires. Un changement de présentation appelle d'abord une recette du composant et un cas défavorable pertinent ; un changement de calcul, de droits ou d'envoi exige les contre-épreuves correspondantes.",
          ""
         ]
        ],
        [
         [
          "Regrouper le changement cohérent, ses limites connues et ses vérifications dans un lot avant publication. Exécuter les contrôles ciblés avant de déclencher la campagne complète ; intégrer la recette au mécanisme déjà exécuté. Une nouvelle campagne demande un changement pertinent, un échec ou une incertitude nommée.",
          ""
         ]
        ],
        [
         [
          "Lire chaque preuve avec sa version. Réutiliser une preuve seulement si le diff démontre que son périmètre est inchangé ; tester séparément le nouveau périmètre. Une réussite sur la version précédente ne devient jamais une réussite de la version finale. Aucun contrôle requis encore en attente ou en échec n'est levé par cette règle.",
          ""
         ]
        ],
        [
         [
          "Fixer un budget d'attente des outils externes selon l'enjeu. Au dépassement, diagnostiquer la dépendance et changer de moyen si une voie autorisée existe. Deux observations identiques sans progression déclenchent ce diagnostic, pas une nouvelle série de relances. Distinguer défaut produit, outil indisponible et résultat non vérifié ; ne pas modifier les critères de réussite pour obtenir du vert.",
          ""
         ]
        ],
        [
         [
          "Après un refus d'accès, poursuivre les tâches indépendantes autorisées, utiliser si utile le schéma et des données fictives, puis déclarer la couverture manquante. Ne pas contourner le refus par un autre canal ni annoncer une vérification réelle à partir d'un essai fictif.",
          ""
         ]
        ],
        [
         [
          "Montrer le résultat livré avec son lien ou une capture identifiée, puis donner fait, restant et bloqué. Une préversion, une capture de recette et une publication effective sont nommées séparément. Clore la boucle utile quand les preuves requises sont réunies ; ne pas rouvrir une recette verte sans changement ou risque nouveau.",
          ""
         ]
        ]
       ]
      }
     ]
    },
    {
     "id": "checklist",
     "titre": "Avant livraison",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Avant livraison",
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
          "Nommer résultat, preuve de réussite, périmètre et données nécessaires.",
          ""
         ]
        ],
        [
         [
          "Qualifier le sujet et vérifier le minimum : 2 points de vue pour tout sujet, 3 pour une tâche complexe, 4 pour un plan ou rétroplanning. Appliquer le seuil le plus élevé et documenter les dépendances communes.",
          ""
         ]
        ],
        [
         [
          "Définir unités, conventions et tolérance avant comparaison.",
          ""
         ]
        ],
        [
         [
          "Conserver au moins une observation sourcée par approche ; qualifier mesuré, déclaré, inféré et non vérifié.",
          ""
         ]
        ],
        [
         [
          "Expliquer l'écart et suspendre la conclusion dépendante tant qu'il reste non résolu.",
          ""
         ]
        ],
        [
         [
          "Vérifier un cas limite ou défavorable pertinent et les limites restantes.",
          ""
         ]
        ],
        [
         [
          "Pour une livraison, appliquer TECHNO.md §9 : maquette et contrats relus, contrôles ciblés avant campagne complète, lot regroupé, version des preuves et budget d'attente annoncés. Une preuve antérieure ne couvre que le périmètre démontré inchangé ; les contrôles obligatoires restent requis.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une seconde approche inaccessible rend la vérification partielle. Des résultats convergents avec une hypothèse commune fragile restent limités par celle-ci. Ne jamais annoncer une confiance chiffrée sans mesure justifiée.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Vérifier la bibliothèque avec ",
         ""
        ],
        [
         "python bibliotheque.py --validate",
         "c"
        ],
        [
         " : cent identifiants, alias et noms résolus, dix familles et packs valides. Éprouver aussi un identifiant inconnu, un angle répété et une sélection sous le seuil requis. La diversité sémantique reste à examiner sur le sujet réel.",
         ""
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
         "2. Mise en service",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Charger la compétence de travail anti-pattern dans le contexte autorisé. Appliquer le protocole au sujet existant, sans lancer un nouveau projet. Conserver la preuve avec sa version et les sources propres à l'instance. Utiliser collecter.mjs sur un dossier privé seulement pour vérifier les champs requis ; le contrôle reste déclaratif et sans appel externe.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Rééprouver sur des données fictives : ambiguïté de convention, pourcentage pondéré, source vide et deux approches identiques présentées comme différentes. Vérifier qu'un écart non résolu interdit le verdict structurel favorable. Conserver une preuve de bon fonctionnement et une preuve de refus.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Livraison et maintien",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Distinguer compétence enregistrée, fichiers poussés, publication générée et affichage réel. Une préparation sur branche ne prouve pas la mise en ligne. La présence de la règle ne constitue pas une surveillance permanente ni un verrou externe effectif.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Mettre à jour les preuves affectées quand les méthodes, données ou conventions changent. Arrêter la vérification lorsque les critères sont éprouvés et les écarts résolus ou explicitement qualifiés. Dépense, opération destructive, migration réelle et envoi suivent les autorisations existantes ; la méthode n'ajoute aucun droit.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Si un outil externe cesse de progresser, diagnostiquer au dépassement du budget d'attente et après deux observations identiques ; poursuivre le travail indépendant, sans répéter des campagnes complètes inchangées. Le compte rendu distingue blocage d'outil, défaut produit et couverture non vérifiée. Montrer le résultat et clore la boucle une fois les preuves requises réunies.",
         ""
        ]
       ]
      }
     ]
    }
   ]
  },
  {
   "id": "presentations-claires",
   "ordre": 4,
   "badge": "Présentations claires — narration et compositions",
   "etat": "Socle local · réception par présentation requise",
   "mesure": null,
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la techno",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Résultat et périmètre",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Transformer un brief en présentation claire, sobre et vérifiable, avec un titre-message par page, une composition adaptée et des visuels qui expliquent. Le bénéfice commercial est indirect : préparer plus vite un rendez-vous, une proposition ou un pitch crédible. Aucun gain de conversion n'est établi.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le socle comporte six compétences coordonnées : narration et synthèse ; direction artistique ; composition et typographie ; conception de visuels ; représentation des preuves et données ; recette éditoriale et visuelle. Une compétence de conduite les applique ensemble ; six agents distincts ne sont pas nécessaires.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les règles complètes vivent dans ",
         ""
        ],
        [
         "references/GRAMMAIRE.md",
         "c"
        ],
        [
         ", les dix compositions dans ",
         ""
        ],
        [
         "assets/exemple.json",
         "c"
        ],
        [
         ", les variables graphiques dans ",
         ""
        ],
        [
         "assets/theme.json",
         "c"
        ],
        [
         ", le moteur dans ",
         ""
        ],
        [
         "scripts/composer.py",
         "c"
        ],
        [
         ". La compétence de conduite est ",
         ""
        ],
        [
         ".claude/skills/presentations-claires/SKILL.md",
         "c"
        ],
        [
         ". La provenance et l'analyse du document de référence restent hors du socle neutre, dans ",
         ""
        ],
        [
         "outils/presentations-claires/ANALYSE.md",
         "c"
        ],
        [
         ".",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Entrées et sorties",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les deux modules sont consultables directement dans les onglets « Composition éditoriale » et « Pitch sourcé ». Le badge lit leurs sections de méthode depuis les compétences du dépôt, sans copie parallèle. Les licences et la provenance restent attachées aux compétences ; la publication ne reprend que les instructions neutres et leurs empreintes de source.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Navigation : ouvrir l'étoile de la technologie dans le catalogue de technologies, puis la fiche correspondante. Les quatre technologies existantes restent accessibles au même niveau ; une ancre ouvre seulement une fiche reçue par l'API réservée au propriétaire.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Entrées : public, décision attendue, durée, objectif, preuves disponibles, identité visuelle et contraintes de diffusion. Demander seulement les manques qui changent réellement le résultat. Préserver les informations connues et marquer les inconnues.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Sorties : synopsis, storyboard, présentation via la capacité d'édition disponible, export de lecture, contrôle qualité et sources. Le moteur local de ce kit produit un PDF de composition et des pages SVG éditables ; il ne produit pas de présentation native ni de fichier de diapositives natif. Utiliser la compétence de présentation de l'environnement pour une livraison native.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Parcours rapide",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": true,
       "items": [
        [
         [
          "Manuel assisté : préciser la décision et sélectionner les seules preuves utiles.",
          ""
         ]
        ],
        [
         [
          "Manuel assisté : écrire les titres comme une histoire lisible sans les corps de texte.",
          ""
         ]
        ],
        [
         [
          "Auto : repartir des compositions et des variables communes ; ne pas reconstruire la grille.",
          ""
         ]
        ],
        [
         [
          "Manuel assisté : créer ou sélectionner les visuels, puis les adapter à la marque du projet.",
          ""
         ]
        ],
        [
         [
          "Auto puis manuel : contrôler les débordements, les données et les rendus page par page.",
          ""
         ]
        ],
        [
         [
          "Manuel : relire comme destinataire et livrer avec les limites ; tout envoi exige son mandat.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Choix de moyen",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le kit local ne demande ni abonnement supplémentaire, ni service permanent. Le coût de génération d'images dépend de l'outil utilisé et doit être vérifié au moment de l'usage. Le temps complet reste à mesurer sur un vrai brief.",
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
          "Simplicité et rapidité",
          ""
         ]
        ],
        [
         [
          "Coût et pertinence",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Socle versionné et capacité de présentation disponible",
           ""
          ]
         ],
         [
          [
           "Réutilise la grille et les consignes ; conserve l'édition native lorsque disponible",
           ""
          ]
         ],
         [
          [
           "Pas de nouvelle interface à maintenir ; compromis retenu",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Reconstruction de chaque présentation",
           ""
          ]
         ],
         [
          [
           "Répète les décisions de composition",
           ""
          ]
         ],
         [
          [
           "Effort récurrent ; garder pour une direction artistique différente",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Application dédiée de génération",
           ""
          ]
         ],
         [
          [
           "Intégration et maintenance supplémentaires",
           ""
          ]
         ],
         [
          [
           "Non justifiée pour ce besoin ; ne pas la construire dans cette boucle",
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
         "5. Garde-fous et preuve",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Ne pas reprendre les chiffres, logos, portraits, captures ou données d'une autre organisation. Les exemples sont explicitement fictifs. Une image décorative ne devient pas une preuve produit. Une projection ne devient pas un résultat. La beauté d'un support ne valide pas ses affirmations.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le moteur refuse une composition inconnue, un champ inattendu, une entrée vide, du texte trop long ou un débordement mesuré. Il conserve une taille lisible au lieu de réduire automatiquement les caractères. Les sorties existantes sont refusées ; utiliser un dossier neuf.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le badge expose la méthode et sa recette au même endroit que les autres technologies. Le moteur est un outil local, pas un bouton de génération dans l'écran. Présence dans le dépôt, publication générée et affichage réel sont trois états à distinguer.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "grammaire",
     "titre": "Règles de création",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Lire et raconter",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Commencer par la décision attendue. Pour un pitch, choisir dans cette séquence : promesse, problème concret, difficulté du fonctionnement actuel, moment opportun, solution, preuve, marché accessible, différenciation, modèle économique, plan, demande. L'équipe se place là où elle répond à une objection. Les détails techniques vont en annexe. Ne pas imposer dix-neuf pages ni une levée de fonds à une présentation commerciale.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Écrire chaque titre comme une conclusion compréhensible : « Une demande devient un dossier complet » plutôt que « La solution ». Une page porte une idée, éventuellement trois manifestations de cette idée. Lire les titres seuls : ils doivent raconter le raisonnement. Retirer slogans vagues, superlatifs sans preuve et répétitions.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Composer",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Format de référence : 1440 × 810, rapport 16:9. Marge latérale 90 unités, zone utile 1260 ; repère de section vers y=80, titre vers y=118, contenu à partir de y=235, sources vers y=730 et pied vers y=770. Sur un support de 13,333 pouces de large, diviser ces tailles par 1,5 pour obtenir des points typographiques usuels.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Titres intérieurs autour de 40,5 unités, couverture 60, corps 22 à 24 pour le nouveau socle ; les corps plus petits de la référence conviennent surtout à la lecture de près. Les notes de source ne portent jamais une information indispensable à la compréhension. Une police sans empattements disponible et licenciée ; sa famille exacte ne peut pas être déduite d'une fonte PDF anonyme. Le moteur utilise une famille disponible explicitement substituée.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Palette : fond blanc, encre très sombre, un accent bleu, une teinte claire et un gris secondaire. Les valeurs de ",
         ""
        ],
        [
         "assets/theme.json",
         "c"
        ],
        [
         " sont des choix de reproduction, pas la charte d'une organisation. Le bleu #2B7FFF observé dans des éléments de la référence reste décoratif dans le kit ; le texte bleu utilise une nuance plus sombre pour la lisibilité. Une couleur distingue une fonction, elle ne décore pas chaque mot.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Aligner les éléments sur les mêmes repères. Espacer davantage les groupes que les lignes d'un groupe. Limiter bordures, ombres et encarts ; les panneaux ne servent qu'à comparer des éléments parallèles. Un panneau sombre peut porter la conclusion, avec texte clair et contraste vérifié. Ne pas recopier le même triptyque sur toutes les pages.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Choisir une composition",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Code",
          ""
         ]
        ],
        [
         [
          "Usage",
          ""
         ]
        ],
        [
         [
          "Discipline",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "couverture",
           ""
          ]
         ],
         [
          [
           "Promesse et visuel principal",
           ""
          ]
         ],
         [
          [
           "Phrase courte à gauche, visuel signifiant à droite",
           ""
          ]
         ]
        ],
        [
         [
          [
           "triptyque",
           ""
          ]
         ],
         [
          [
           "Trois manifestations ou trois options",
           ""
          ]
         ],
         [
          [
           "Titres parallèles et textes de longueur comparable",
           ""
          ]
         ]
        ],
        [
         [
          [
           "chaine",
           ""
          ]
         ],
         [
          [
           "Entrée, transformation, résultat",
           ""
          ]
         ],
         [
          [
           "Verbes et objets concrets ; trois étapes maximum",
           ""
          ]
         ]
        ],
        [
         [
          [
           "preuves",
           ""
          ]
         ],
         [
          [
           "Trois indicateurs",
           ""
          ]
         ],
         [
          [
           "Valeur, unité, périmètre, période et source",
           ""
          ]
         ]
        ],
        [
         [
          [
           "comparaison",
           ""
          ]
         ],
         [
          [
           "Quelques critères discriminants",
           ""
          ]
         ],
         [
          [
           "Distinguer absent, inconnu et annoncé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "offre",
           ""
          ]
         ],
         [
          [
           "Deux modalités",
           ""
          ]
         ],
         [
          [
           "Tarification et unité explicites ; rien d'inventé",
           ""
          ]
         ]
        ],
        [
         [
          [
           "feuille-route",
           ""
          ]
         ],
         [
          [
           "Jalons",
           ""
          ]
         ],
         [
          [
           "Séparer réalisé, en cours et prévu ; pas de fausse certitude",
           ""
          ]
         ]
        ],
        [
         [
          [
           "produit",
           ""
          ]
         ],
         [
          [
           "Texte et capture ou visuel",
           ""
          ]
         ],
         [
          [
           "Captures réelles pour les capacités existantes",
           ""
          ]
         ]
        ],
        [
         [
          [
           "interlude",
           ""
          ]
         ],
         [
          [
           "Changement de partie",
           ""
          ]
         ],
         [
          [
           "Respiration, aucun paragraphe dense",
           ""
          ]
         ]
        ],
        [
         [
          [
           "decision",
           ""
          ]
         ],
         [
          [
           "Demande finale",
           ""
          ]
         ],
         [
          [
           "Décision précise, condition et prochaine étape",
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
         "Ces compositions sont un vocabulaire, pas une obligation de tout utiliser. Pour une projection courte, scinder toute page dense. Pour un support envoyé, fournir plus de contexte sans réduire la police jusqu'à l'illisible.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Concevoir les images",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Choisir le mode selon le rôle : photo réelle pour une équipe ou un événement ; capture réelle pour un produit existant ; schéma vectoriel pour un mécanisme exact ; image générée pour une métaphore ou une projection explicitement désignée. La provenance de génération des images du PDF n'est pas démontrée.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Construire un visuel central par page quand il apporte une information. Définir sujet, transformation à montrer, cadrage, lumière, fond et espace réservé au texte. Garder palette et matière cohérentes sur l'ensemble. Produire des variantes seulement si elles changent la compréhension. Garder les titres et chiffres hors des images générées : les poser en texte éditable.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Patron de prompt : « Illustration éditoriale de [objet du métier], montrant [transformation observable], [matière et lumière], fond clair, sujet placé à droite, espace vide à gauche pour le titre, palette [accent], sans texte, sans logo, sans chiffres, sans interface inventée. » Décliner un seul univers visuel ; éviter les robots, cerveaux lumineux, poignées de main et assemblages décoratifs sans lien avec le sujet.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Exemple neutre : « Des feuilles de chantier éparses qui se regroupent en un dossier structuré, papier et matière réalistes, lumière latérale douce, fond blanc, composition à droite, sans texte ni marque. » Cet exemple est une direction d'illustration, jamais une preuve de résultat commercial.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. Montrer des preuves",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Associer une assertion importante à sa source, sa date et son périmètre. Séparer mesuré, déclaré, hypothèse et non vérifié. Distinguer chiffre d'affaires signé, encaissé et pipeline ; ne pas transformer une discussion en client. Distinguer marché total théorique et marché effectivement accessible. Une étude rétrospective ne démontre pas une performance future.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Construire les tableaux et graphiques avec des données structurées et des éléments éditables. Indiquer unités et dénominateurs. Comparer à période et périmètre constants. Ne pas mettre de chiffres dans une image générée. Les logos ne prouvent ni contrat, ni partenariat, ni revenu.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Contrôler et arrêter",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Passage lecteur : identifier le message de chaque page et ce qu'il permet de décider. Passage opérateur : rejouer depuis le brief et les ressources sans reconstruire la grille. Passage contradicteur : chercher une promesse non étayée, une source manquante et un état présenté trop favorablement. Ces angles partagent les données d'entrée ; ils ne valident pas une source fausse.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Contrôler les titres seuls, puis chaque page à taille de lecture et le montage de l'ensemble. Vérifier marges, lisibilité, alignements, crops, glyphes, contraste et absence de recouvrement. Le succès d'un export ne remplace pas cette inspection. Corriger puis rendre à nouveau les seules pages affectées. Arrêter lorsque les critères sont éprouvés ; ne pas annoncer une durée de production rapide avant de l'avoir mesurée sur un vrai dossier.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "composition",
     "titre": "Composition éditoriale",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "Partir du sujet et de la référence",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Lire presentations-claires et sa grammaire. Définir la décision du destinataire et l'idée à rendre visible. Conserver la direction artistique validée : sobriété, blancs, hiérarchie et visuel signifiant. Ne pas ouvrir un nouveau choix de thème si la référence suffit.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Rédiger une direction artistique courte : sujet visuel central, matière, palette, famille de caractères, grille, rapport texte/image. Une image doit illustrer le mécanisme, le métier ou la transformation ; une forme décorative ne démontre rien.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Composer",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Choisir une seule famille de caractères disponible, avec des graisses et tailles clairement hiérarchisées. Mesurer les retours de ligne. Préserver la grille et les marges du socle. Faire varier la composition selon le contenu, sans changer l'identité à chaque page.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Construire un point focal. Laisser respirer les éléments qui l'entourent. La précision des alignements et du rythme remplace les effets décoratifs. Ne pas ajouter de graphiques pour donner artificiellement une impression de sophistication.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Préserver les éléments exacts sous forme éditable : titres, chiffres, labels et sources. Ne pas rasteriser une page entière pour contourner les problèmes de mise en page.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Créer les images",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Choisir photo ou capture réelle pour un fait, schéma vectoriel pour un mécanisme exact, image générée pour une métaphore désignée comme telle. Utiliser l'outil d'image réellement disponible ; aucun fournisseur ni achat n'est imposé.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Décrire sujet, transformation, cadrage, matière, lumière, palette et zone vide pour le texte. Garder une cohérence d'une page à l'autre. Éviter les clichés génériques et les interfaces inventées.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Pour le registre retenu par Paul : un objet lié au métier, une transformation lisible, fond clair, lumière douce, sujet placé pour préserver la zone du titre, aucun mot ni chiffre incorporé dans l'image.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Polir et vérifier",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Rendre la page. Examiner hiérarchie, lisibilité, cadrage, netteté, marges et recouvrements. Lorsqu'une fidélité est demandée, comparer référence et résultat à même échelle, dans une même planche. Une illustration de principe n'équivaut pas à une image finale de la qualité attendue.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Faire une passe de simplification : retirer ce qui n'explique rien, puis affiner les éléments conservés. Respecter les contraintes du format natif choisi par la compétence de présentation. Si le rendu est impossible, signaler la vérification bloquée ; ne pas annoncer un résultat professionnel comme éprouvé.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "pitch",
     "titre": "Pitch sourcé",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "Construire l'histoire",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Identifier destinataire, décision, temps de parole et preuves disponibles. Choisir un angle investisseur ou client selon la demande ; ne pas transformer automatiquement une présentation commerciale en demande de financement.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Construire un parcours dans les seuls sujets utiles : promesse, problème vécu, fonctionnement actuel, solution, preuve, différenciation, modèle économique, suite et demande finale. Mettre les détails en annexe. L'ordre et le nombre de pages servent le raisonnement ; ils ne sont pas imposés par le modèle amont.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Écrire des titres qui énoncent un message, pas des rubriques. Lire les titres seuls comme un raisonnement. Pour un client, partir de son travail et du résultat qu'il cherche. Pour un investisseur, distinguer besoin, mécanisme, preuve, marché accessible et besoin de financement.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Rendre le contenu précis",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une idée principale par page. Garder les corps courts et parallèles dans les comparaisons. Ne pas supprimer une nuance ou une source indispensable pour respecter un quota arbitraire de mots.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Préférer un fait précis à un adjectif vague. Ne pas reprendre comme fait les exemples de performance du dépôt amont. Une promesse chiffrée sans source reste une hypothèse ou disparaît.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Chaque indicateur conserve valeur, unité, dénominateur, période, périmètre et provenance. Distinguer projeté, mesuré, déclaré et non vérifié ; pipeline, signé et encaissé ; discussion, pilote et client payant. Les logos ne remplacent pas ces qualifications.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Choisir la preuve visuelle",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Faire correspondre message et forme : métrique dominante pour une preuve unique ; comparaison pour des options ; étapes pour une séquence ; capture réelle pour une capacité existante ; illustration pour une métaphore.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Construire les graphiques à partir des données exactes avec des éléments éditables. Ne jamais générer un graphique de données par image IA. Les styles visuels et la palette de presentations-claires restent prioritaires : ne pas importer le rouge ou les effets de signature du module consulting.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Terminer utilement",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Formuler une demande finale précise, compatible avec les informations connues : accord de principe, démonstration, essai, prochaine réunion ou financement cadré. Ne pas laisser entendre gratuité, engagement ou disponibilité sans preuve.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Relire par trois voies : titres seuls (récit), sources et calculs (fond), destinataire sceptique (objections). Puis rendre et inspecter les pages avec la compétence de présentation.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "service",
     "titre": "Utilisation et recette",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Avant livraison",
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
          "Une décision attendue, un public et une durée sont connus ou explicitement supposés.",
          ""
         ]
        ],
        [
         [
          "Chaque titre porte un message ; leur lecture seule raconte l'histoire.",
          ""
         ]
        ],
        [
         [
          "La marque du projet est fournie ; aucun logo, chiffre ou portrait de la référence n'est recopié.",
          ""
         ]
        ],
        [
         [
          "Chaque donnée importante a une source datée, un périmètre et une qualification.",
          ""
         ]
        ],
        [
         [
          "Chaque visuel explique le sujet ; une illustration générée est identifiable comme telle.",
          ""
         ]
        ],
        [
         [
          "Les pages sont rendues et inspectées ; les débordements sont corrigés sans réduction automatique du corps.",
          ""
         ]
        ],
        [
         [
          "Le moteur est vérifié sur une entrée valable et sur une entrée volontairement trop longue.",
          ""
         ]
        ],
        [
         [
          "L'édition native, la lecture PDF et l'envoi sont des capacités distinctes ; indiquer celles effectivement éprouvées.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Invocation et moyens",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Manuel assisté : invoquer la compétence « présentations-claires » avec le public, la décision et les preuves. Lire ",
         ""
        ],
        [
         "references/GRAMMAIRE.md",
         "c"
        ],
        [
         ", puis adapter le storyboard au temps disponible. Réutiliser la capacité de présentation de l'environnement pour une présentation native.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Auto local : exécuter ",
         ""
        ],
        [
         "python3 zohshia/presentations-claires/scripts/composer.py --brief zohshia/presentations-claires/assets/exemple.json --sortie /tmp/compositions-neuves",
         "c"
        ],
        [
         ". Le dossier de sortie doit être neuf. Le rendu requiert le module de dessin PDF indiqué dans le script. Aucune API externe, aucun compte et aucun service permanent ne sont appelés.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Manuel : remplacer les textes fictifs dans une copie du brief placée hors du socle ; ne pas stocker les données clients dans le kit. Les fichiers SVG portent du texte et des objets éditables. Le PDF sert à la lecture et à la recette. L'export natif reste du ressort de la capacité de présentation disponible.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Recette et état réel",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Auto : vérifier la génération des dix compositions ; les fichiers sont non vides et les entrées invalides sont refusées. Vérifier la publication du badge avec ",
         ""
        ],
        [
         "node zohshia/publier.mjs --verifier",
         "c"
        ],
        [
         ".",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Manuel : inspecter les rendus et consigner les défauts corrigés. Chronométrer séparément la composition automatique et le travail complet à partir d'un vrai brief. Un temps de rendu n'est pas un temps de création de présentation.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La preuve détaillée est dans ",
         ""
        ],
        [
         "outils/presentations-claires/RECETTE.md",
         "c"
        ],
        [
         ", hors du socle neutre. La fusion exige l'accord lié à la version dans ce dépôt. La visibilité sur le site se vérifie après publication avec une session propriétaire ; elle n'est pas déduite d'une génération locale. Aucun envoi réel n'est autorisé par ce kit.",
         ""
        ]
       ]
      }
     ]
    }
   ]
  },
  {
   "id": "pitch-commercial",
   "ordre": 5,
   "badge": "Pitch commercial",
   "etat": "Ossature documentée · discours à adapter et éprouver",
   "mesure": null,
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la techno",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "Résultat attendu",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Préparer des discours courts pour les appels et les mails, adaptés au profil contacté, à son besoin, au service vendu et au client représenté. Obtenir une discussion ou un rendez-vous pertinent avec les bons participants.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le prospect reste le centre de chaque phrase : son activité, ses difficultés, le résultat utile pour lui. La présentation du vendeur, de ses outils et de sa technologie ne constitue pas l'argumentaire.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Règles de rédaction",
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
          "Être direct et aller à l'essentiel ; annoncer le motif du contact.",
          ""
         ]
        ],
        [
         [
          "Partir d'un besoin connu ; sinon poser une question courte pour le confirmer.",
          ""
         ]
        ],
        [
         [
          "Ne jamais présenter un problème supposé comme un fait établi chez le prospect.",
          ""
         ]
        ],
        [
         [
          "En cas de doute, poser la question ; reformuler la réponse avant d'argumenter.",
          ""
         ]
        ],
        [
         [
          "Une priorité, une réponse concrète et une prochaine action principale.",
          ""
         ]
        ],
        [
         [
          "Une preuve sociale sert à éclairer le résultat du prospect ; elle ne devient pas une présentation du vendeur.",
          ""
         ]
        ],
        [
         [
          "Aucun chiffre, témoignage, client de référence, résultat ou territoire exclusif inventé.",
          ""
         ]
        ],
        [
         [
          "Une capacité en pilote reste présentée comme un test ou une démonstration.",
          ""
         ]
        ],
        [
         [
          "Le rendez-vous sert à examiner son cas ; une signature ou un chiffre d'affaires ne sont jamais garantis.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Méthode AIDA",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Étape",
          ""
         ]
        ],
        [
         [
          "Fonction",
          ""
         ]
        ],
        [
         [
          "Formulation de départ",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Accroche",
           ""
          ]
         ],
         [
          [
           "Montrer pourquoi ce profil est contacté",
           ""
          ]
         ],
         [
          [
           "Cet échange concerne les professionnels de [métier] sur [zone].",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Intérêt",
           ""
          ]
         ],
         [
          [
           "Confirmer une difficulté du prospect",
           ""
          ]
         ],
         [
          [
           "Entre [tâche] et [tâche], qu'est-ce qui vous prend le plus de temps aujourd'hui ?",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Désir",
           ""
          ]
         ],
         [
          [
           "Relier une preuve réelle à son besoin",
           ""
          ]
         ],
         [
          [
           "Un confrère comparable a obtenu [résultat vérifié, période et périmètre]. Pour votre activité, l'enjeu serait [bénéfice adapté].",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Action",
           ""
          ]
         ],
         [
          [
           "Proposer un échange concret",
           ""
          ]
         ],
         [
          [
           "Vous préférez [créneau 1] ou [créneau 2] pour regarder votre cas ?",
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
         "Entrées et sorties",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Entrées : campagne, profil et rôle contactés, métier, zone, service vendu, client représenté, besoin confirmé ou à confirmer, bénéfice visé, preuves autorisées, canal, objectif et créneaux.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Sorties : discours adapté, variantes, questions de qualification, informations encore manquantes, prochaine action et version. Un discours incomplet porte le statut « à compléter » ; une hypothèse ne devient pas une offre prête à employer.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Séparation des données",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Ce dossier porte la méthode neutre. Les marques, offres, noms, coordonnées, résultats, prix, notes d'appel et preuves propres aux campagnes vivent dans leur outil métier. Aucun fichier neutre n'embarque de données d'un professionnel.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "L'utilisation en prospection ne vaut pas autorisation d'appeler, d'envoyer un message ou d'inscrire une personne dans une séquence automatique.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "discours",
     "titre": "Ossature des discours",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "Appel principal",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Bonjour [prénom]. Cet appel concerne votre activité de [métier] sur [zone], pour convenir d'un rendez-vous autour de [besoin ou résultat pertinent]. Ce n'est pas un hasard si vous êtes contacté.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Entre [difficulté 1] et [difficulté 2], vos journées peuvent laisser peu de temps pour [activité essentielle]. Comment cela se passe chez vous ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Écouter ; reprendre son besoin avec ses mots.]",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Donc votre priorité, c'est bien [besoin confirmé] ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Si une référence pertinente est autorisée et vérifiée :] Un de vos confrères à [ville] avait le même enjeu. Il a obtenu [résultat vérifié sur une période précisée]. Pour votre entreprise, l'objectif serait [bénéfice concret], en tenant compte de votre zone.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Sans preuve disponible :] Pour votre entreprise, l'intérêt serait de [bénéfice visé]. Le rendez-vous permettrait de vérifier ce que cette démarche peut vous apporter sur votre cas.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Pour en parler concrètement, vous seriez disponible plutôt [créneau 1] ou [créneau 2] ?",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Variante CVC",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Cet échange concerne uniquement les professionnels du chauffage et de la climatisation comme vous.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Entre l'administratif, les devis et les relances, qu'est-ce qui vous prend le plus de temps au détriment de vos chantiers et de vos clients ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Reprendre le besoin confirmé, présenter la réponse adaptée puis proposer deux créneaux.]",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Variantes de rendez-vous",
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
          "Directe : Pour regarder ce que cela peut vous apporter concrètement, vous préférez [créneau 1] ou [créneau 2] ?",
          ""
         ]
        ],
        [
         [
          "Prospect pressé : Quel moment vous conviendrait pour un rappel court : [créneau 1] ou [créneau 2] ?",
          ""
         ]
        ],
        [
         [
          "Ton espiègle, selon le contexte : C'est quand le pire moment pour vous voir ? [Écouter.] Alors évitons ce créneau. Vous préférez [créneau 1] ou [créneau 2] ?",
          ""
         ]
        ],
        [
         [
          "Participant supplémentaire : Qui s'occupe de ces sujets avec vous et aurait intérêt à participer au rendez-vous ?",
          ""
         ]
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le rappel court est une alternative au rendez-vous immédiat, pas un second objectif à ajouter systématiquement. Laisser la possibilité de refuser ou de proposer un autre créneau.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Qualification en fin d'échange",
         ""
        ]
       ]
      },
      {
       "t": "table",
       "entetes": [
        [
         [
          "Information utile",
          ""
         ]
        ],
        [
         [
          "Question naturelle",
          ""
         ]
        ],
        [
         [
          "Ce qu'il faut distinguer",
          ""
         ]
        ]
       ],
       "lignes": [
        [
         [
          [
           "Sous-traitance",
           ""
          ]
         ],
         [
          [
           "Vos chantiers viennent surtout de vos clients directs ou de la sous-traitance ? Cela vous convient ?",
           ""
          ]
         ],
         [
          [
           "Travailler pour un donneur d'ordre ou confier ses chantiers à une autre entreprise",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Relance des devis",
           ""
          ]
         ],
         [
          [
           "Vos devis envoyés, qui les relance chez vous ? Cela vous prend beaucoup de temps ?",
           ""
          ]
         ],
         [
          [
           "Charge réelle, responsable et fonctionnement actuel",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Perte de clients",
           ""
          ]
         ],
         [
          [
           "Des demandes ou des devis restent-ils sans suite faute de temps pour les suivre ?",
           ""
          ]
         ],
         [
          [
           "Perte confirmée, motif déclaré ou simple absence de réponse",
           ""
          ]
         ]
        ],
        [
         [
          [
           "Personne à inclure",
           ""
          ]
         ],
         [
          [
           "Qui s'occupe de ces sujets avec vous et devrait participer au rendez-vous ?",
           ""
          ]
         ],
         [
          [
           "Utilisateur, associé, décideur et rôle de chacun",
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
         "Question de priorité : Parmi ces sujets, lequel vous pose le plus de difficultés aujourd'hui ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "En cas d'ambiguïté : Quand vous dites sous-traitance, vous travaillez pour d'autres entreprises ou vous leur confiez vos chantiers ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les quatre points sont une fiche de qualification, pas un questionnaire à réciter. Les adapter à l'offre : ne pas imposer un problème de relance à une campagne dont le service ne le traite pas. Noter « inconnu » pour une réponse non obtenue ; ne jamais remplacer par « non ».",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Mail",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Objet : [bénéfice concret] pour votre activité de [métier]",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Bonjour [prénom],",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Votre activité de [métier] sur [zone] vous amène à [enjeu connu ou question à confirmer]. Aujourd'hui, comment gérez-vous [problème ciblé] ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Preuve sociale autorisée et vérifiée si disponible ; sinon omettre ce passage.]",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Pour votre entreprise, l'objectif serait [bénéfice pertinent]. Un échange permettrait de vérifier cette démarche sur votre cas.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Vous seriez disponible plutôt [créneau 1] ou [créneau 2] ?",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "[Signature d'identification]",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Objections courantes",
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
          "Pas le temps : Quel moment serait moins chargé pour un rappel court ? [Deux créneaux si approprié.]",
          ""
         ]
        ],
        [
         [
          "Déjà équipé : Votre organisation actuelle vous convient sur [besoin ciblé], ou reste-t-il un point qui vous prend du temps ?",
          ""
         ]
        ],
        [
         [
          "Envoyez un mail : Quel sujet serait le plus utile pour vous dans ce mail ? [Préparer le contenu ciblé, confirmer le destinataire avant tout envoi autorisé.]",
          ""
         ]
        ],
        [
         [
          "Aucun besoin ou refus : prendre acte ; ne pas forcer un rendez-vous. Consigner le résultat selon les règles de l'outil métier.",
          ""
         ]
        ]
       ]
      }
     ]
    },
    {
     "id": "service",
     "titre": "Adaptation et utilisation",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "Préparer une campagne",
         ""
        ]
       ]
      },
      {
       "t": "liste",
       "ordonnee": true,
       "items": [
        [
         [
          "Identifier l'offre, le client représenté, la cible, la zone et l'objectif du contact.",
          ""
         ]
        ],
        [
         [
          "Relier chaque problème ciblé à une réponse réellement disponible.",
          ""
         ]
        ],
        [
         [
          "Confirmer les capacités en production, en pilote et non disponibles.",
          ""
         ]
        ],
        [
         [
          "Pour chaque preuve : source, période, périmètre, montant HT ou TTC si pertinent et droit d'utilisation. Un chiffre d'affaires signé ne devient pas un chiffre encaissé ni un résultat causé par le service sans preuve.",
          ""
         ]
        ],
        [
         [
          "Rédiger une version appel et une version mail, avec une seule priorité et une prochaine action.",
          ""
         ]
        ],
        [
         [
          "Si une information change la pertinence, la demander avant de finaliser le discours dépendant ; continuer les parties indépendantes.",
          ""
         ]
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Utilisation dans l'outil de prospection",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La méthode est conservée dans le catalogue des technos. Les discours propres aux campagnes vivent dans la rubrique Prospection de l'outil métier, avec choix du client représenté, du service, du profil et du canal.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une fiche discours porte : identifiant stable, version, statut (à compléter, brouillon, validé, archivé), cible, offre, canal, texte, variantes, questions, références des preuves et date de révision. Les notes de qualification restent rattachées au prospect, pas au socle partagé.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Avant toute intégration : inspecter le stockage, les accès et les parcours existants. Réutiliser leur cloisonnement ; ne pas créer une deuxième base de prospects. Cette documentation décrit le raccord attendu, pas une interface déjà livrée.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Faire vivre les discours",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Conserver une version de référence par campagne et profil ; réviser à partir des objections et réponses réellement entendues. Préserver l'historique dans le versionnement existant, sans dupliquer les versions actives.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Évaluer les échanges avec leur dénominateur : conversations obtenues, besoins confirmés, rendez-vous acceptés, rendez-vous tenus et suites utiles. Aucun taux d'efficacité ni lien causal n'est déclaré avant mesure comparable.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "Recette avant utilisation",
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
          "Angle prospect : le bénéfice et le motif du contact sont compréhensibles dès le début ; lecture à voix haute pour repérer les lourdeurs.",
          ""
         ]
        ],
        [
         [
          "Angle opérateur : la bonne campagne, l'offre, le canal, les preuves et la version sont identifiables ; les inconnues restent visibles.",
          ""
         ]
        ],
        [
         [
          "Angle adverse : enlever la preuve sociale ne provoque aucune invention ; une sous-traitance ambiguë déclenche une question ; une offre inconnue reste à compléter ; un refus n'est pas transformé en intérêt.",
          ""
         ]
        ],
        [
         [
          "Vérifier que le discours ne parle pas du vendeur pour meubler et ne promet pas une capacité non disponible.",
          ""
         ]
        ],
        [
         [
          "Vérifier que les deux créneaux sont réels et que les bons participants sont inclus.",
          ""
         ]
        ],
        [
         [
          "Une recette documentaire ne prouve ni affichage dans l'outil de prospection, ni envoi, ni efficacité commerciale réelle.",
          ""
         ]
        ]
       ]
      }
     ]
    }
   ]
  },
  {
   "id": "diligence-correspondance",
   "ordre": 6,
   "badge": "Diligence et correspondance documentaire",
   "etat": "Socle neutre testé ; raccord et recette requis par agent",
   "mesure": null,
   "onglets": [
    {
     "id": "techno",
     "titre": "Ce que fait la technologie",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Ce que fait la technologie",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Un agent reprend le contexte professionnel autorisé, la demande et ses corrections, puis recherche les sources et les précédents avant de produire un livrable. Une donnée absente reste inconnue : une analogie ne la transforme pas en fait. Le moteur ne promet pas une absence absolue d'erreurs ; il refuse les entrées invalides et rend visibles les limites des preuves.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "2. Recherche et contrôle",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le compte est résolu par les accès serveur. Les mots de la conversation orientent la recherche, sans donner de droits ni changer silencieusement de compte. Chaque caractéristique comparée porte un repère documentaire. Les critères et leurs poids sont explicites avant le calcul ; leur somme est égale à cent. Une valeur inconnue ou sans source rapporte zéro, sans changer le dénominateur.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Les documents sont classés par points, date puis identifiant. Les versions d'un même chantier sont regroupées avant de retenir un ou deux précédents distincts. Une correspondance à zéro point ne constitue pas un précédent utile. Le meilleur est cité dans la note professionnelle, avec ses différences et ses inconnues. Le second sert au contrôle interne. Aucun précédent n'est joint automatiquement.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Les prix restent un autre contrôle",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Une similarité technique ne valide ni prix ni signature. La comparaison financière exige un périmètre et des conditions compatibles documentés ainsi que des totaux réconciliés avec les lignes, en unités monétaires entières. Sinon elle reste non vérifiable. Un ancien prix de vente ne remplace jamais une source d'achat. Les règles tarifaires et fiscales appartiennent à l'instance ; aucune valeur n'est imposée par ce socle.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "4. Livraison et réemploi",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le document client contient les lignes chiffrées et les mentions du professionnel. Les hypothèses, sources et différences historiques vont dans une note séparée. Un produit inconnu ou non chiffré empêche de déclarer le document complet. La génération ne constitue jamais une permission d'envoi. Après un incident constaté, corriger le code ou la procédure et éprouver un cas qui reproduit l'erreur.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le code neutre s'extrait du commit indiqué dans le manifeste : il n'est pas recopié dans ce dossier. Le collecteur vérifie le commit et les empreintes des fichiers exacts. Il ne certifie pas la vérité des sources métier. Les essais du moteur sont distincts de l'audit d'une instance et de l'activation des autres agents.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "5. État vérifié au 29 octobre 2026",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le socle et son catalogue sont fusionnés dans les dépôts de référence : correction RenoDevis nº 435 et correction Ultima nº 426. Les déploiements de ces deux corrections sont prêts. Le manifeste conserve son commit source exact et ses empreintes ; une fusion ne justifie pas de modifier une extraction déjà vérifiée.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Contrôles exécutés : 53 contrôles ciblés du moteur métier après fusion ; 8 contre-épreuves de collecte et de neutralité après fusion. Les intégrations continues des corrections sont réussies. Ces preuves concernent les scénarios exécutés, pas une garantie universelle de précision.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le rendu client reconnaît le format préparé, avec note professionnelle séparée. Le raccord automatique des consommateurs reste à réaliser et à éprouver agent par agent. La qualification des sources de prix dans la banque réelle reste également à réaliser par un administrateur ; aucune donnée de production n'a été modifiée pour la simuler. Aucun pilote ni envoi automatique n'est activé par cette livraison.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le contrôle HTTP direct du catalogue en production a été bloqué par l'authentification du déploiement. Le fonctionnement en session propriétaire reste donc non vérifié ; ne pas confondre ce blocage avec une recette applicative réussie.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Pour la prochaine instance : résoudre le compte autorisé, sélectionner sa matrice, qualifier les sources, raccorder le consommateur, puis éprouver le document et la note sur un dossier réel sans envoi. La cible de délai doit être mesurée sur ce parcours complet avant d'être annoncée comme acquise.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "6. Retour d'usage confirmé le 29 octobre 2026",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Paul confirme l'utilisation du nouveau système et le bon fonctionnement des méthodes de création et de calcul redéfinies. Le délai de préparation reste à améliorer. Cette déclaration positive complète les preuves techniques du §5 ; elle ne certifie ni la qualification de chaque source de prix ni le raccord de tous les consommateurs ou la future extraction.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Conserver le calcul éprouvé et mesurer le parcours complet avant de l'optimiser. Réutiliser le contexte déjà acquis et les preuves dont les dépendances n'ont pas changé ; limiter les relectures et recalculs aux éléments affectés. La rapidité ne doit pas supprimer la provenance, la note professionnelle ou le contrôle final. Le contrat de réception réutilisable est centralisé dans ",
         ""
        ],
        [
         "zohshia/renodevis/TECHNO.md",
         "c"
        ],
        [
         ", section « Retour d’usage du 29 octobre 2026 », repères R29-01 à R29-10 : il couvre aussi import, dossier multi-propositions, brouillon partagé et preuves d'envoi. Ces exigences restent à éprouver sur chaque version et chaque consommateur concernés.",
         ""
        ]
       ]
      }
     ]
    },
    {
     "id": "checklist",
     "titre": "Avant livraison",
     "blocs": [
      {
       "t": "h2",
       "r": [
        [
         "1. Avant livraison",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "La vérification suit les étapes ci-dessous, avec une preuve propre à chaque instance. Une liste cochée sans document ou sans scénario exécuté ne constitue pas une réception.",
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
          "Manuel : identifier le professionnel, le compte, le livrable, le destinataire et le mandat.",
          ""
         ]
        ],
        [
         [
          "Manuel : qualifier les sources autorisées et leurs dates ; distinguer fait, déclaration, hypothèse et inconnu.",
          ""
         ]
        ],
        [
         [
          "Manuel : adapter les critères et pondérations au métier ; ne pas copier les valeurs d'une autre instance.",
          ""
         ]
        ],
        [
         [
          "Auto : refuser les mélanges de comptes, poids invalides, identifiants dupliqués et montants incohérents.",
          ""
         ]
        ],
        [
         [
          "Auto : dédoublonner les chantiers et classer les correspondances documentées.",
          ""
         ]
        ],
        [
         [
          "Manuel : vérifier les différences techniques, le périmètre et les conditions avant toute comparaison de prix.",
          ""
         ]
        ],
        [
         [
          "Auto : séparer le document client de la note professionnelle et conserver les contrôles du moteur métier.",
          ""
         ]
        ],
        [
         [
          "Manuel : autoriser explicitement l'envoi de la version contrôlée ; conserver son résultat avant tout rejeu.",
          ""
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
         "2. Extraction et raccord",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le manifeste décrit un commit du dépôt de référence et les empreintes des deux fichiers neutres. Depuis un clone local contenant ce commit : ",
         ""
        ],
        [
         "node zohshia/diligence-correspondance/collecter.mjs --depot <clone>",
         "c"
        ],
        [
         " vérifie la source sans appeler de service externe. ",
         ""
        ],
        [
         "--sortie <dossier-neuf>",
         "c"
        ],
        [
         " extrait uniquement ces fichiers. Aucune extraction de base ou de donnée professionnelle.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le raccord reçoit des caractéristiques structurées et des localisateurs de preuves, jamais une décision libre du modèle présentée comme une preuve. La fonction de classement est pure ; elle ne lit aucun compte. L'appelant serveur conserve la responsabilité de filtrer les sources avant l'appel et d'en vérifier le contenu. Les résultats peuvent être réutilisés par plusieurs agents uniquement après leur propre intégration et recette.",
         ""
        ]
       ]
      },
      {
       "t": "h2",
       "r": [
        [
         "3. Recette et limites",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Éprouver : scénario valide, valeur inconnue, preuve absente, aucun comparable utile, versions du même chantier, mélange de comptes, modification de note après aperçu, montant altéré, source absente, document non chiffré et tentative d'envoi sans mandat. Un scénario sauté ne passe pas. Le test structurel ne prouve pas une source vraie ou un accès de production.",
         ""
        ]
       ]
      },
      {
       "t": "p",
       "r": [
        [
         "Le badge est publié par le mécanisme existant ; il décrit un socle préparé, sans agent permanent activé. Le présent guide n'autorise aucune dépense, migration, fusion, publication de données professionnelles ou envoi réel.",
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
  "anti-pattern/badge.json": "cadb852886a315cfbb0004cb251068660161853622eb9493c7c738413564961c",
  "anti-pattern/TECHNO.md": "7554b1caa4bbb686155ee2ed628aaf99c05bc30811cc4c75ba46fd2b37be77a3",
  "anti-pattern/MISE-EN-SERVICE.md": "865fac3156cf81ab161aa625e815be8c39bdd051ea0d6e57e28c6f0a2d5fbfa2",
  "diligence-correspondance/badge.json": "2011fbf865919f9914953f9608771e73ae2cceaeff6ba01acc85123665111f10",
  "diligence-correspondance/TECHNO.md": "8be9e42d4c338dd34399afbc500f325dc3a5dd362697f788798bf56ec6ebbf05",
  "diligence-correspondance/MISE-EN-SERVICE.md": "7995eb0b4db82d1dac8669db1e40cf29dc63f24c3abb62b6bc3ec5fef2dada13",
  "pilotage-back-office/badge.json": "98968dd3835594efc11d996b58f026f4c2f7eccaae8313859aa3796b07a1fcbb",
  "pilotage-back-office/TECHNO.md": "67390bd2d0adfb89e01eea4aad0db900c87bf35905f217836396da8bb63620f7",
  "pilotage-back-office/MISE-EN-SERVICE.md": "a2074a5ae227fd59674c5956f77e16c76aa14c14f319f6fd1278b71b91319cab",
  "pitch-commercial/badge.json": "982cb6f0bc69c54dda6881032b021cdb18305243c8de03b76d805e6dad397dae",
  "pitch-commercial/TECHNO.md": "bb55a381cf40ff2bed27a5c9918001fd75bfb4c072a6716983df43d0870f759f",
  "pitch-commercial/OSSATURE.md": "98e3592525077747112a59f1733f7392117c842225486bde3bab7d4bea52e213",
  "pitch-commercial/MISE-EN-SERVICE.md": "56ea24e91d128ef50c4adf50e0abe7e6603ca80662404eb4b6104b42f4483ed5",
  "presentations-claires/badge.json": "11ecaae35ca6c5ee6e543f32fd5682269365ce02561ab5586ce737283e6fa282",
  "presentations-claires/TECHNO.md": "b622c1c5e641300bee9cccb986ab418758e164f36842fe0b9187c284c433e4e0",
  "presentations-claires/references/GRAMMAIRE.md": "343047605a16e4781017c013fc2c1df0ed0ad30d68f354ce7ed21af1773fe358",
  "presentations-claires/../../.claude/skills/composition-editoriale/SKILL.md": "4eb18a840d55838e2c9f7a6bdff3137ad9662e8ff03bc9f98e6b188c49b7d298",
  "presentations-claires/../../.claude/skills/pitch-source/SKILL.md": "0e61ae12858e83ea40b94068710e1b7155aec2eea2e3d44460a95814744dc06f",
  "presentations-claires/MISE-EN-SERVICE.md": "0d8b5e72958663a287cb81f9e7e9590bdd02584dce516ab28e887bbfa6bfd09d",
  "renodevis/badge.json": "cdf0f06c4c492ccc21be7bb97a3d5f2da690832d1e1728d2e0a12bd0482fb1ff",
  "renodevis/TECHNO.md": "1fd94acf4e4a8a166f02c9a8a0dd0f794fefe21600aa17a786cb969a5232d4cd",
  "renodevis/AJOUTER-UN-ARTISAN.md": "8ec42d12a4be63eab0cf311a234251612c30e7998c2009e06c447cebe2b8358f"
 }
};
