# Plateforme de paiement pour artisan

## État et périmètre

Socle vierge réutilisable, créé le 2 novembre 2026. Aucun compte professionnel, aucune identité, coordonnée bancaire, donnée client, clé, règle commerciale particulière ou fournisseur sélectionné. Aucun encaissement, mandat, connexion bancaire ou surveillance n'est activé.

Le socle contient un calcul déterministe de ventilation en centimes et son adaptateur volontairement fermé. Il ne constitue pas une plateforme de paiement opérationnelle ou un agrément. Les contrats et la recette préparent son raccordement ultérieur.

## Trois flux à distinguer

| Flux | Fonction | Preuve attendue |
| --- | --- | --- |
| Client vers artisan | Acompte, total ou solde du document accepté | Reçu prestataire vérifié, rapprochement bancaire ou déclaration humaine explicitement qualifiée |
| Commission due | Dette commerciale définie par le contrat du professionnel | Assiette, taux, fiscalité, date et règle versionnés |
| Commission reçue | Somme réellement attribuée ou réglée à la plateforme | Reçu d'attribution ou encaissement rapproché, distinct de la dette |

Un paiement déclaré par le client n'est jamais un encaissement confirmé. Une réception déclarée par le professionnel n'est jamais une preuve bancaire indépendante. Une commission due n'est jamais une commission encaissée.

## Modes interchangeables

- Virement direct : fonds sur le compte du professionnel ; suivi déclaratif ou rapprochement autorisé ; commission réglée séparément. Aucune ventilation automatique annoncée.
- Plateforme de paiement : prestataire habilité, compte professionnel vérifié ; ventilation déclarée avant l'encaissement. La plateforme applicative ne reçoit pas les fonds de tiers sur son compte courant.

Le choix est paramétré par professionnel et par environnement. Aucun repli silencieux d'un mode vers l'autre, d'un professionnel vers un autre ou du test vers le réel. Un paiement déjà ouvert reste rattaché à son bénéficiaire et son mode d'origine.

## Moteur et raccords

`moteur.mjs` reçoit des montants validés en centimes entiers : total accepté, reçu avant le paiement, montant courant, commission totale TTC due et commission déjà prélevée. La fiscalité et l'assiette sont résolues en amont ; aucun taux, taxe ou acompte par défaut n'est imposé.

La fonction `ventiler` vérifie les bornes et conserve la somme des parts. En mode plateforme, elle consomme la commission restant due dans la limite de l'encaissement et rend le reliquat explicite. Quand toute la commission est déjà prélevée, le solde revient entièrement au professionnel. En virement direct, aucune commission n'est prélevée par le moteur.

`ouvrirPaiement` est fermé tant qu'un adaptateur validé n'est pas explicitement activé. Le dépôt ne contient pas d'adaptateur externe factice pouvant être confondu avec une connexion réelle.

Réemployer dans l'application d'accueil ses moteurs de montant, identité, signature, autorisation, journal et idempotence. Ce socle ne remplace ni le moteur documentaire ni la facturation. Il ne s'installe dans aucune instance par sa simple présence dans le catalogue.

## Contrats de sécurité et de pilotage

- Les montants et le bénéficiaire viennent du serveur et du document accepté ; aucune valeur financière du navigateur ne fait foi.
- Une réservation atomique précède l'appel au fournisseur ; référence idempotente stable, reprise après délai sans second paiement.
- Signature des notifications, montant, devise, compte, mode réel ou test, statut et identifiant externe sont rapprochés avant effet métier.
- Paiements partiels, doublons, remboursements, contestations, frais et événements en retard ont des états distincts. Le remboursement de la commission n'est jamais supposé.
- Autorisations par professionnel, journal privé non effaçable depuis le formulaire client ; séparation des coordonnées bancaires et du socle neutre.
- Le cockpit de l'outil hôte montre reçu, restant, commission due/reçue, anomalies, dernière synchronisation et actions humaines nécessaires. Sans preuve actuelle, l'état est inconnu et une alerte remplace le statut payé.

## Choisir un fournisseur

Comparer coût total sur un même scénario : abonnement, minimum mensuel, frais d'encaissement et plafond éventuel, ventilation, versement bancaire, compte actif, remboursement, incident, intégration et exploitation. Un prix inconnu reste inconnu, jamais zéro. Les tarifs sont datés et vérifiés à la sélection ; aucun fournisseur n'est désigné comme le moins cher par ce socle.

## Preuves et limites

La recette locale du moteur utilise uniquement des données synthétiques, sans réseau ni clé. Elle couvre acompte puis solde, commission insuffisamment couverte, virement direct, montants invalides et adaptateur fermé. Elle ne prouve ni conformité fiscale de l'instance, ni acceptation fournisseur, ni réception bancaire réelle.
