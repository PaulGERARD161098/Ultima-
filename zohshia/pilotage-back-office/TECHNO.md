# Pilotage systématique en back-office

> Règle adoptée le 13/10/2026 : quand on crée un système, s'assurer qu'il possède un cockpit ou un système de pilotage réellement utilisable.

## 1. Ce que fait la techno

Toute création comprend le service rendu et son moyen de supervision. Le système peut exécuter ses fonctions dans les permissions accordées ; son responsable doit pouvoir comprendre son état, ses branchements, ses blocages et les décisions attendues, puis intervenir avec les mêmes contrôles serveur.

Le back-office est une fonction distincte du parcours utilisateur. Il peut vivre dans le même produit, un cockpit privé partagé, une file de décisions ou une console existante. Choisir la forme la plus simple, rapide, économique et pertinente. Un nouveau tableau de bord ou un second moteur ne sont pas obligatoires.

## 2. Couverture minimale

| Contrôle | Ce qui doit être visible ou possible |
|---|---|
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

## 4. Ce qui prouve une livraison

Une lecture normale aboutit de bout en bout ; une lecture refusée reste refusée ; un connecteur coupé produit une erreur utile ; un état périmé reste visible ; une décision sensible attend son accord ; l'arrêt prévu fonctionne dans son périmètre.

Un écran visible avec une source en erreur est un pilotage préparé, pas une lecture fonctionnelle. Une démonstration, une preview et la production portent des états distincts. La disponibilité du cockpit ne prouve aucune autonomie permanente.

## 5. Sécurité et limites

Secrets au serveur, accès privés et cloisonnement des comptes. Aucune copie des données métier, des calculs ou des permissions dans un moteur concurrent. Aucune action réelle ne découle de l'ajout de cette règle au registre. Un système ne peut pas modifier son propre contrôle par ce dispositif.

Les alertes et lectures répétées sont bornées ; elles respectent la visibilité de la page et le budget. Une supervision permanente requiert un mécanisme autorisé et une preuve séparée.

