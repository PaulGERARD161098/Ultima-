# Supervision réutilisable du code

## 1. Cadrer en avance

Relier le travail au résultat utilisateur final. Établir but, étapes, moyens réellement accessibles, réussite vérifiable, hors-périmètre et risques. Réutiliser le cadrage, les composants et les preuves encore valables. Lire les instructions applicables avant toute action sur un projet ; ne pas figer ici un dépôt, une branche ou un état historique.

Identifier versions source/cible, fichiers concernés, travaux concurrents et effets des scripts ou déploiements automatiques. Isoler le travail si nécessaire, préserver les modifications d'autrui et éviter les restaurations globales. Tenir un horizon glissant de prochaines étapes utiles, sans imposer un nombre artificiel.

Appliquer ZS avant un choix produit ou technique (simplicité, rapidité, coût total, pertinence du format), puis MS au résultat professionnel visé et à son indicateur. Lire les compétences **directive-zs** et **methode-paul** ; ne pas supposer qu’une technologie récente est meilleure.

## 2. Faire un pré-mortem proportionné

Supposer que la livraison a échoué et retenir les trois à cinq causes les plus plausibles : mauvais compte, rupture de contrat, doublon, interruption, données perdues, fuite ou déploiement involontaire. Pour chacune, préciser signal détectable, prévention, contrôle et retour arrière. Adapter la profondeur au risque ; ne pas transformer un petit correctif en audit global.

## 3. Contrôler robustesse et cohérence

Partir du diff puis suivre les consommateurs et dépendances affectés. Vérifier les contrats d'entrée/sortie, types, validations, unités, règles métier, états et conventions. Chercher les implémentations concurrentes d'une même règle et modifier la source de référence plutôt qu'ajouter un doublon.

Éprouver les cas matériels : entrée invalide ou vide, erreur distante, timeout, interruption, concurrence, rejeu et issue inconnue. Vérifier idempotence lorsque nécessaire, nettoyage des ressources, reprise et erreurs observables. Contrôler la cohérence entre interface, API, stockage et documents générés si le changement les traverse.

## 4. Réduire le code mort et les fuites

Distinguer code démontré inutilisé et code simplement non rencontré. Rechercher références statiques, imports dynamiques, routes, tâches planifiées, configuration et consommateurs externes. Supprimer seulement après preuve suffisante et dans un changement versionné vérifiable. Si un consommateur reste inconnu, signaler le candidat sans conclure à sa mort.

Examiner les fuites pertinentes : secrets ou données personnelles dans logs, erreurs et bundles ; accès entre utilisateurs ou projets ; mémoire, timers, listeners, connexions et abonnements non libérés ; appels IA répétés et contexte inutile. Mesurer un gain de coût ou performance avant de le chiffrer. Préférer lectures ciblées, sorties bornées et calculs déterministes sans sacrifier un contrôle critique.

## 5. Détecter et corriger les failles

Décrire pour chaque constat surface, condition, impact, preuve et niveau de certitude. Distinguer suspicion, défaut confirmé par lecture et exploitation reproduite en environnement isolé. Vérifier selon la surface : authentification, autorisation au niveau objet, cloisonnement, validation, injection, signatures des webhooks, uploads, exposition des secrets et dépendances.

Préparer puis appliquer les correctifs dans le mandat autorisé, ajouter une régression utile et ré-éprouver le scénario. Ne pas exploiter une faille en production ni lire des secrets pour la démontrer. Préparer une migration sensible sans l'exécuter sur des données réelles sans autorisation adaptée. Ne pas déclarer le produit exempt de failles à partir d'une revue partielle.

## 6. Comparer avant et après quand cela éclaire la décision

Pour un changement significatif, utiliser un tableau : critère, avant constaté, après proposé, après éprouvé, preuve et limite. Choisir les critères utiles : parcours, architecture, sécurité, maintenance, coût, performance ou données. Employer les mêmes conditions de mesure ; utiliser captures ou maquette pour une modification visuelle importante. Séparer gains estimés et gains mesurés. Omettre le tableau pour un correctif trivial.

## 7. Faire le dry run avant merge

Vérifier le changement exact et son intégration à la cible courante dans un environnement isolé, sans envoi, dépense, migration réelle ou publication implicite. Examiner scripts et hooks avant exécution. Réutiliser les contrôles du projet : compilation/types, tests pertinents, contrats, parcours et scénarios négatifs proportionnés au risque.

Confirmer que les données ou fichiers testés sont chargés, que les contrôles s'exécutent réellement et que les scénarios ne sont pas ignorés. Éprouver les garde-fous critiques avec un cas négatif connu. Une CI verte seule ne prouve pas le parcours métier. Relire le diff en adversaire dans une passe distincte ; qualifier honnêtement l'indépendance de la revue et suivre les exigences de réception LV1.

Rendre un verdict : prêt dans le périmètre vérifié, prêt avec limites explicites, ou bloqué. Consigner versions, commandes/contrôles, résultats et risques résiduels, sans secrets. Si source ou cible change, ré-évaluer les preuves affectées. Le dry run n'autorise pas le merge : appliquer le contrat et les autorisations déjà données, demander seulement l'accord réellement manquant, puis vérifier une fusion autorisée.

## 8. Relier les projets et fermer la boucle

Rechercher une réutilisation pertinente de composant, contrat, test, règle métier ou leçon. Qualifier le lien établi, hypothétique ou à explorer et citer sa provenance. Proposer le bénéfice et le coût d'adaptation ; ne pas copier des données privées, modifier un second projet ou étendre le mandat par analogie.

Clôturer avec fait et preuves, restant et bloqué, responsable et prochaine action utile. Ne pas annoncer un test, une sauvegarde, un merge ou une publication non observé. Capitaliser seulement les incidents réels dans la mémoire existante et vérifier l'écriture. Ne pas promettre de travail en arrière-plan sans mécanisme activé.
