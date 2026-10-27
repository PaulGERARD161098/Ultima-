# Mettre le pilotage en service

## 1. Avant livraison

Cette recette commence au cadrage, avant de construire le système métier.
Le pilotage est prévu avant le projet et rendu utilisable dès ses premiers
incréments ; il n'est pas ajouté en fin de construction. Les cases se remplissent
à partir du travail mesuré ; une fonction bloquée reste visible avec sa prochaine action.

- Définir une seule unité d'exécution active, avec résultat utile, périmètre borné et condition de sortie.
- Prévoir un point de reprise versionné avant une opération longue et après chaque résultat utile.
- Borner les lectures, sorties d'outils et essais au besoin courant ; alléger le contexte avant de perdre la maîtrise du suivi.
- Recenser toutes les fonctions et leurs effets ; choisir le responsable du pilotage.
- Localiser le cockpit miroir dans l’interface d’administration de l’outil supervisé ; une console centrale ne l’héberge pas.
- Réutiliser son cockpit existant lorsque sa couverture suffit, sans dupliquer les sources ni le moteur métier.
- Préparer une première coque privée avec accès du responsable, fonctions prévues, décisions et moyen d'arrêt, même sans moteur métier.
- Mapper chaque fonction à une observation réelle, datée, et au parcours autorisé de contrôle.
- Couvrir tous les contrôles de `CONTRAT.json`, avec preuves datées et version de l'environnement.
- Vérifier lecture normale, refus d'accès, perte de source, état périmé, décisions sensibles et arrêt.
- Éprouver les contrôles avant toute action réelle, autonomie, mise en ligne ou extension du périmètre.
- Consigner ce qui est préparé, testé, déployé, actif ou bloqué.
- Garder le dossier d'attestations privé dans le projet concerné.

## 2. Déroulement

| Jalon | Avant quoi | Condition de passage |
|---|---|---|
| Cadrage | Construction métier | Responsable, fonctions, localisation dans l’administration de l’outil, permissions, risques et arrêt prévus |
| Première coque | Prototype métier avancé ou intégration difficile à défaire | Onglet privé de l’outil accessible ; fonctions prévues et blocages visibles ; simulations identifiées |
| Ouverture du réel | Action réelle, autonomie ou mise en ligne, même privée | Sources raccordées ; contrôles et arrêt éprouvés de bout en bout sur la version concernée ; mandat effectif |
| Extension | Nouvelle fonction, nouveau branchement, nouveaux droits ou hausse d'autonomie | Couverture actualisée et contrôles affectés ré-éprouvés avant ouverture de la nouvelle capacité |

Raccorder les sources communes et les parcours de contrôle, éprouver les succès
et les refus sous isolation adaptée, puis relire les preuves avec le responsable.
Une preview strictement isolée, sans données sensibles ni effets externes, peut
servir à construire le pilotage ; elle ne valide pas l'ouverture du réel.

Contrôle local du dossier : `node zohshia/pilotage-back-office/collecter.mjs --dossier <fichier-prive>`.

Le dossier JSON contient `fonctions` (noms techniques), `couverture` (preuves par fonction) et `controles` (preuves par contrôle). Chaque preuve porte `etat: "mesure"`, une `reference` privée et `le` (date ISO). Le rapport de structure ne publie jamais ces références.

## 3. Gates et entretien

Un jalon manquant bloque le passage concerné ; la capacité reste fermée ou en simulation. Un contrôle manquant ou seulement déclaré empêche de dire la supervision complète. Un dossier vide est refusé. Une fonction nouvelle demande une nouvelle preuve de couverture.

La recette de fonctionnement précède l'ouverture de la capacité et l'annonce de livraison. Un résultat structurel favorable est explicitement une vérification d'attestations, pas une sonde distante. Le collecteur ne bloque techniquement ni un déploiement ni une action : chaque projet doit implémenter et éprouver ses propres verrous. Mettre à jour les preuves après changement de version, de branchement ou de droits.

Respecter les autorisations effectives : déploiement public, dépense, migration, suppression ou envoi réel exigent le mandat correspondant. Le pilotage n'élargit jamais ces autorisations. L'activation d'un automate reste distincte de sa présence dans le code.

## 4. Vérifier la continuité sans surcharger

Sur une copie ou un environnement isolé, interrompre une unité après son point de sauvegarde. Reprendre à partir du point versionné et de l'état distant : le résultat déjà prouvé doit être retrouvé sans recommencer toute l'analyse ; la prochaine action doit être unique et exécutable. Un travail non sauvegardé reste indiqué comme tel.

Contre-épreuve : retirer la version ou la preuve du point de reprise. La reprise doit signaler ce manque et revalider seulement l'élément concerné, sans déclarer l'unité terminée. Vérifier aussi qu'un élargissement du périmètre est reporté explicitement et qu'une étape autorisée n'attend pas un nouveau « go » par simple découpage.

Ces critères décrivent la recette à mener dans chaque projet. L'ajout de cette règle ne prouve pas sa recette réelle et ne constitue aucun verrou automatique de charge ou de contexte.
