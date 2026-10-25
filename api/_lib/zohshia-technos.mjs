// GÉNÉRÉ par `node zohshia/publier.mjs` — ne pas modifier à la main.
// La techno de ZOH SHIA, à l’état pur, servie au SEUL propriétaire par /api/zohshia.
export default {
 "publie_le": "2026-10-25",
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
       "t": "note",
       "paras": [
        [
         [
          "Règle adoptée et précisée le 13/10/2026 : prévoir le contrôle dès le cadrage, même avant l'existence du système métier ; disposer d'un pilotage utilisable avant tout avancement important ou mise en ligne.",
          ""
         ]
        ]
       ]
      },
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
  }
 ],
 "sources": {
  "anti-pattern/badge.json": "cadb852886a315cfbb0004cb251068660161853622eb9493c7c738413564961c",
  "anti-pattern/TECHNO.md": "7554b1caa4bbb686155ee2ed628aaf99c05bc30811cc4c75ba46fd2b37be77a3",
  "anti-pattern/MISE-EN-SERVICE.md": "865fac3156cf81ab161aa625e815be8c39bdd051ea0d6e57e28c6f0a2d5fbfa2",
  "pilotage-back-office/badge.json": "9e50e6b7c62eb14f971d074560bec3bcfeac9867806e887df7ca0c21e019cb1b",
  "pilotage-back-office/TECHNO.md": "a6a3c2ec7645ab99bb9a472de5f721adab65627a094b81e153e23e3ce7f7f589",
  "pilotage-back-office/MISE-EN-SERVICE.md": "da99219e5142485ac53b49a5563d4ff0d406e966b5775a932ca7a72382c8be53",
  "presentations-claires/badge.json": "f558419d741f39bb1ab902d5a26931862e560bbe3219a3992c8c02269f907e27",
  "presentations-claires/TECHNO.md": "9d0026e09740e7e4a7ef0212b1c5a43b2edd64477e4b88e03fe6ca852bdf75a3",
  "presentations-claires/references/GRAMMAIRE.md": "343047605a16e4781017c013fc2c1df0ed0ad30d68f354ce7ed21af1773fe358",
  "presentations-claires/MISE-EN-SERVICE.md": "0d8b5e72958663a287cb81f9e7e9590bdd02584dce516ab28e887bbfa6bfd09d",
  "renodevis/badge.json": "cdf0f06c4c492ccc21be7bb97a3d5f2da690832d1e1728d2e0a12bd0482fb1ff",
  "renodevis/TECHNO.md": "aeb32b5b9820a7a30ea450074ea838bb6a1f69bd5d12cdd472c60748832f2932",
  "renodevis/AJOUTER-UN-ARTISAN.md": "8ec42d12a4be63eab0cf311a234251612c30e7998c2009e06c447cebe2b8358f"
 }
};
