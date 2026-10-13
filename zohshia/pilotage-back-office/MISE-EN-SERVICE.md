# Mettre le pilotage en service

## 1. Avant livraison

Cette recette accompagne chaque création. Les cases se remplissent à partir du
travail mesuré ; une fonction bloquée reste visible avec sa prochaine action.

- Recenser toutes les fonctions et leurs effets ; choisir le responsable du pilotage.
- Réutiliser le cockpit ou la console existante lorsque sa couverture suffit.
- Mapper chaque fonction à une observation réelle, datée, et au parcours autorisé de contrôle.
- Couvrir tous les contrôles de `CONTRAT.json`, avec preuves datées et version de l'environnement.
- Vérifier lecture normale, refus d'accès, perte de source, état périmé, décisions sensibles et arrêt.
- Consigner ce qui est préparé, testé, déployé, actif ou bloqué.
- Garder le dossier d'attestations privé dans le projet concerné.

## 2. Déroulement

| Étape | Mode | Résultat attendu |
|---|---|---|
| Cadrer | Assisté | Fonctions, moyens de pilotage, responsables, permissions, risques |
| Raccorder | Dans le mandat | Sources communes, lectures minimales, liens aux écrans existants |
| Éprouver | Automatisé et humain | Preuves du parcours réel et de ses refus, sous isolation adaptée |
| Contrôler le dossier | Automatisé local | `node zohshia/pilotage-back-office/collecter.mjs --dossier <fichier-prive>` |
| Recevoir | Humain | Limites connues ; couverture de chaque fonction attestée et recette relue |

Le dossier JSON contient `fonctions` (noms techniques), `couverture` (preuves par fonction) et `controles` (preuves par contrôle). Chaque preuve porte `etat: "mesure"`, une `reference` privée et `le` (date ISO). Le rapport de structure ne publie jamais ces références.

## 3. Gates et entretien

Un contrôle manquant ou seulement déclaré empêche de dire la supervision complète. Un dossier vide est refusé. Une fonction nouvelle demande une nouvelle preuve de couverture.

La recette de fonctionnement précède l'annonce de livraison. Un résultat structurel favorable est explicitement une vérification d'attestations, pas une sonde distante. Mettre à jour les preuves après changement de version, de branchement ou de droits.

Respecter les autorisations effectives : déploiement public, dépense, migration, suppression ou envoi réel exigent le mandat correspondant. Le pilotage n'élargit jamais ces autorisations. L'activation d'un automate reste distincte de sa présence dans le code.

