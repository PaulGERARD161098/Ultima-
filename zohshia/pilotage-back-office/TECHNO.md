# Pilotage systématique en back-office

> Règle adoptée et précisée le 13/10/2026 : prévoir le contrôle dès le cadrage, même avant l'existence du système métier ; disposer d'un pilotage utilisable avant tout avancement important ou mise en ligne.

## 1. Ce que fait la techno

Toute création comprend le service rendu et son moyen de supervision. Le système peut exécuter ses fonctions dans les permissions accordées ; son responsable doit pouvoir comprendre son état, ses branchements, ses blocages et les décisions attendues, puis intervenir avec les mêmes contrôles serveur.

Le contrôle précède l'exécution. On peut préparer le pilotage avant d'avoir le système à piloter : responsable, périmètre, fonctions prévues, droits, décisions et moyen d'arrêt sont définis au cadrage. Une première coque privée est utilisable dès les premiers incréments. Les capacités restent fermées ou en simulation tant que leurs contrôles réels ne sont pas éprouvés.

Avant une action réelle, une autonomie, une mise en ligne ou une extension, vérifier le jalon de pilotage correspondant. La mise en ligne inclut un hébergement privé utilisant des données réelles ou produisant des effets externes. Le projet ne doit pas atteindre un stade coûteux à corriger ou difficile à arrêter avant d'avoir son contrôle ; les jalons concrets sont décrits dans le guide.

Le back-office est une fonction distincte du parcours utilisateur. Chaque outil de données possède son propre cockpit miroir dans son interface d’administration, accessible uniquement à ses responsables autorisés. Ce cockpit vit dans l’outil qu’il supervise ; une console centrale ne l’héberge pas et ne le remplace pas. Réutiliser le pilotage administratif existant dans cet outil lorsqu’il couvre le besoin.

« Miroir » désigne une vue de contrôle des sources et fonctions existantes : état, activité, consommations, coûts, budgets, alertes, journal et commandes autorisées. Il ne crée ni copie concurrente des données métier, ni second moteur de calcul, ni nouvelles permissions. Toute observation précise sa source et sa fraîcheur. Les données absentes sont signalées ; elles ne deviennent pas des zéros.

Cette règle de localisation complète, sans les remplacer, les jalons de contrôle définis ci-dessus. La coque peut précéder le moteur métier, mais une maquette ne vaut jamais preuve de raccordement réel.

## 2. Couverture minimale

| Contrôle | Ce qui doit être visible ou possible |
|---|---|
| cockpit_local | Cockpit propre à l’outil, dans son interface d’administration ; aucune copie concurrente des données ou du moteur |
| acces_prive | Identité et droits du responsable ; refus effectif des accès non autorisés |
| etat_reel | Une observation datée par fonction ; déclaré, mesuré, inféré et non vérifié distincts |
| fraicheur | Source, version et date ; un échec conserve un état périmé explicitement signalé |
| connecteurs | Branché, absent, expiré, indisponible ; raison et prochaine correction |
| informations_manquantes | Ce qui manque pour avancer, responsable et parcours de correction |
| travaux_en_cours | Dossiers, tâches, propositions et étapes en préparation |
| validations_humaines | Décision attendue sur la version courante ; toute modification invalide l'accord concerné |
| alertes_avant_action | Échéances et réserves visibles avant l'action, avec nouvelle vérification côté serveur |
| journal | Tentative, résultat et provenance ; aucune donnée sensible inutile |
| arret_maitrise | Moyen existant de suspendre ou arrêter, limité au périmètre autorisé et éprouvé |
| droits_serveur | Autorisations contrôlées là où l'action est exécutée ; le navigateur ne les crée pas |

Toutes les fonctions métier doivent avoir une observation de pilotage. Certaines fonctions se supervisent par un lien vers un écran existant. Les actions de contrôle respectent le moteur, les validations et les limites du produit.

## 3. Structure réutilisable

Le contrat neutre est dans `CONTRAT.json`. `collecter.mjs` contrôle un dossier d'attestations privé, conservé dans le projet concerné : liste des fonctions, preuves de couverture, preuves des contrôles. Le rapport ne rend que les comptes et les manques, sans URL ni valeur des preuves.

Le contrôleur mesure la complétude du dossier, pas la réalité du fonctionnement. Une attestation ne remplace pas une recette depuis le parcours réel. Il n'active rien, n'écrit dans aucune base et ne change aucun droit.

## 4. Ce qui autorise un passage

Une lecture normale aboutit de bout en bout ; une lecture refusée reste refusée ; un connecteur coupé produit une erreur utile ; un état périmé reste visible ; une décision sensible attend son accord ; l'arrêt prévu fonctionne dans son périmètre.

Distinguer contrôle prévu (plan), utilisable (parcours accessible) et éprouvé (preuves sur la version et le périmètre concernés). Un écran visible avec une source en erreur est un pilotage préparé, pas une lecture fonctionnelle. Une démonstration, une preview et la production portent des états distincts. La disponibilité du cockpit ne prouve aucune autonomie permanente.

Une capacité nouvelle ne passe pas avant son pilotage. Si le jalon manque, garder cette capacité fermée et poursuivre la préparation de son contrôle dans l'environnement isolé. Cette règle organise les passages du projet ; un verrou automatique exige une implémentation et une preuve propres au projet.

## 5. Sécurité et limites

Secrets au serveur, accès privés et cloisonnement des comptes. Aucune copie des données métier, des calculs ou des permissions dans un moteur concurrent. Aucune action réelle ne découle de l'ajout de cette règle au registre. Un système ne peut pas modifier son propre contrôle par ce dispositif.

Les alertes et lectures répétées sont bornées ; elles respectent la visibilité de la page et le budget. Une supervision permanente requiert un mécanisme autorisé et une preuve séparée.


