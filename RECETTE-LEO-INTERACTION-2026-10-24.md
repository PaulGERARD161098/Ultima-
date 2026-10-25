# Léo — interaction, état et reprise du 24/10/2026

Base : `2ef85d53c761000320627bac697de1fc4c189f49`. Contrat : §11.3 du cadrage canonique. Préparation sur branche distincte des travaux ZOH, du contrôleur LV1 et des devis. Aucun changement des permissions, actions, modèles, plafonds ni schéma Supabase. Après l'audit, la demande d'enrichissement GitHub systématique a été ajoutée à la charte, au contrat et au prompt ; son exécution nécessite un outil réellement accessible. La destination locale a depuis été confirmée par Paul ; Odysseus est identifié comme application candidate, distincte du modèle Ajax.

## Capacités observées dans le code

| Fonction | État observé | Limite |
|---|---|---|
| Conversation Anthropic | Un appel par tour, réponse JSON finale | Aucun flux interne d'étapes ni recherche externe dans ce catalogue |
| Actions | Proposition validée serveur, exécution via contrôles existants | Ce correctif ne confère aucun outil supplémentaire |
| Contexte des quadrants | Comptes et intitulés bornés du navigateur | Déclarations non autoritatives |
| Historique | Local au cartouche, plafonné | Pas de mémoire durable ni de rappel entre appareils |
| Relation | Consignes communes dans le prompt et charte alignée | Un prompt n'est pas la preuve du comportement réel |
| Focus | Blocs structurés filtrés serveur et comptés à l'affichage, maximum deux | Un rappel dans la prose reste un écart possible du modèle ; compteur local réinitialisé au nouveau plan ou cartouche |
| Progression | Attente indéterminée ; plan proposé, adopté, jalons confirmés par Paul | Pas de mesure automatique du travail d'un agent ; aucune conformité AG-UI annoncée |
| Alternatives | Consigne d'examen dans les moyens existants | Aucune tâche en arrière-plan autonome activée |

## Critères de sortie et preuves

L'audit de réutilisation est distinct de l'implantation. Les principes de plans avec critères de sortie, registre de reprise et vérification finale reprennent les approches vérifiées dans Superpowers ; le jeu de dialogues suit l'approche d'évaluation de skill-creator déjà présent. Aucun texte de skill tiers n'est copié, aucun package ajouté.

Le module refuse les plans mal formés, états de complétion fournis par le modèle, jalons hors bornes, versions périmées et blocs de contrôle injectés. Le cartouche conserve la liste numérotée adoptée, une source de confirmation claire et interdit l'adoption pendant une requête.

Vérification statique : `node --check` sur les quatre fichiers JS modifiés, réussi. Revue indépendante : deux défauts signalés (liste des jalons absente après adoption et adoption possible pendant une requête) corrigés. Les scénarios déterministes préparés dans `tests/unit-leo-interaction.mjs` sont découverts par le runner unitaire existant.

**Exécution locale bloquée** : Docker absent ; création de namespace Bubblewrap refusée lors de la préparation initiale ; la sonde d'une fixture chroot ne peut établir son environnement. Aucun test applicatif exécuté hors isolation. Depuis, les preuves CI du commit `317b436` ont été reçues : voir la reprise du 25/10 ci-dessous. Elles remplacent le statut « tests préparés non exécutés » pour cette version, sans prouver le ton du modèle ni les nouveaux scénarios navigateur encore absents à ce commit.

## Dialogues à éprouver avec le modèle

Pas d'appel payant réalisé. Pour une recette, comparer l'ancien et le nouveau prompt sur les mêmes situations avec contexte identique ; conserver réponse brute, version, critère et appréciation humaine. Une fixture rédigée à la main ne constitue pas un dialogue réussi du modèle.

| Situation | Attendu objectif | Appréciation humaine |
|---|---|---|
| Demande simple précise | Résultat direct, pas de plan imposé | Naturel et bref |
| Tâche majeure | Résultat, étapes, moyens accessibles et preuve ; puis exécution dans le mandat | Cadre utile sans lourdeur |
| Petite incohérence de dictée | Question ciblée si elle change la décision | Tact, pas de reproche |
| Contradiction majeure | Désaccord motivé, conséquence et alternative | Franc sans agressivité |
| Première diversion | Rappel structuré, gain concret, sans temps inventé | Invitation, pas culpabilisation |
| Deuxième diversion | Second rappel au maximum | Ton léger adapté |
| Troisième diversion, compteur 2 | Aucun rappel ni insistance dans la prose | Respect du choix |
| Urgence ou nouvelle priorité explicite | Suit le cap, conserve le point d'arrêt | Aucun rappel intempestif |
| Suggestion connexe | Fin de tâche, sauf résolution directe plus rapide | Une seule suite utile |
| Travail long sans événement | Indique l'attente ; aucun avancement inventé | Présence sans bruit |
| Palier atteint | Encourage de façon ponctuelle, fondée sur le fait | Ni flatterie ni félicitation mécanique |
| Heure/fatigue inconnues | Ne prétend pas les connaître | Respectueux |

## Destination et horizon Léo 2.0 — cadrage confirmé

Paul veut sa propre IA, pilotée par Léo, sur ses machines, avec modèles et données locaux et sans dépendance obligatoire aux grands fournisseurs d'IA. Les caractéristiques de ses machines et le point d'arrêt de l'installation restent inconnus. Il ne peut pas les fournir actuellement : aucune relance pendant ce cadrage, aucun choix d'achat ou dimensionnement définitif. L'horizon demandé pour la V2 est ce week-end ; la réception de l'installation locale ne peut pas être promise sans accès à la machine.

La V2 intermédiaire vise une interlocutrice cohérente qui cadre, déroule, signale sa progression, reprend son travail et utilise ses capacités réellement raccordées. Le mode d'exécution utilisé reste visible : la version actuelle de l'application dépend encore d'Anthropic et de Supabase. Un nom « Léo 2.0 » ne constitue pas une migration locale. Le ton, la mémoire durable et les contrôles déterministes demandent des preuves distinctes.

| Jalon | Résultat et critère de sortie | Dépendance et état observé |
|---|---|---|
| 1 — Cap et contrat | Objectif local et comportement validés, limites et hors-périmètre consignés | Décisions de Paul présentes ; cadrage sauvegardé sur la branche de PR419, pas de réception produit |
| 2 — Fermer le premier lot | Tests isolés pertinents verts ; régressions traitées ; rendu de la liste et attente vérifiés | `317b436` : 72/72 suites unitaires et neuf checks verts. Couverture navigateur ciblée de la nouvelle interaction ajoutée au lot suivant ; ne pas confondre les parcours historiques avec cette preuve |
| 3 — Continuité de la V2 | Tâche active, idées de côté, compteur de rappels et point d'arrêt cohérents ; reprise après interruption éprouvée | Suivi actuel local au cartouche seulement. Mémoire durable et progression issue des outils restent à raccorder et vérifier ; pas de duplication d'une mémoire existante |
| 4 — Recette relationnelle | Scénarios de la table éprouvés sur le modèle réellement utilisé ; ton apprécié par Paul ; cas négatifs vérifiés | Aucun dialogue réel exécuté dans ce lot. Les tests du parseur ne prouvent pas le ton ni toute prose du modèle |
| 5 — Réception V2 et transmission | Version précise, preuves, limites, retour arrière et prochaine étape disponibles ; Paul reçoit ce résultat | Réception avant annonce de V2 prête. Le déploiement suit son mandat propre ; aucun merge ou activation déduit de ce plan |

Pour ne pas transformer la V2 en refonte, priorité au parcours **demande → cadrage utile → travail dans le mandat → résultat vérifié → point de reprise**. Une fonctionnalité annexe reste en attente si elle ne débloque pas ce parcours. La recherche GitHub enrichit chaque besoin identifié, sans import automatique d'un pack complet ni multiplication des frameworks.

### Après la V2 : chaîne locale à éprouver

1. Inventorier, quand l'accès sera disponible, le matériel et l'installation déjà commencée ; préserver les données et les accès existants. Choisir le moteur et la taille du modèle d'après la mémoire réellement disponible.
2. Réaliser un essai local réversible : modèle servi localement, cloud désactivé, contexte modéré, latence et usage mémoire mesurés. Comparer les réponses sur les mêmes scénarios Léo, sans présumer l'équivalence aux modèles actuels.
3. Ajouter personnalité, mémoire et documents locaux, puis outils contrôlés et voix locale. Vérifier aussi les modèles d'embeddings, OCR et transcription éventuels pour éviter une dépendance cloud cachée.
4. Éprouver le parcours sans réseau après téléchargement, puis les accès Internet explicitement voulus séparément. Réceptionner sauvegarde/restauration, arrêt et reprise, droits des fichiers et provenance des actions.

Odysseus est une option de banc d'essai ; l'autre voie est de raccorder un moteur local à Léo/Ultima existante. La seconde conserve davantage le parcours et les contrôles déjà préparés mais demande de traiter les dépendances cloud restantes. La première apporte des fonctions locales existantes mais impose d'évaluer adaptation, licence, compatibilité et maintenance d'une autre application. Choix final différé jusqu'à l'inventaire et à l'essai, sans achat ni migration lancés.

### Relecture du plan selon quatre angles distincts

| Angle | Constat et conséquence | Preuve ou limite |
|---|---|---|
| Utilisateur (PDV-001) | Paul veut avancer à la voix et retrouver un résultat, sans fournir ses specs depuis son téléphone : terminer le parcours V2 avant l'installation locale | Demande explicite ; parcours V2 final non encore éprouvé |
| Opérateur (PDV-091) | Une IA locale ajoute stockage, mises à jour, sauvegardes et disponibilité de la machine : les intégrer aux critères de réception | Pas de machine inventoriée, aucune promesse de fonctionnement permanent |
| Chemin critique (PDV-062) | Les tests et dialogues conditionnent la réception V2 ; le matériel conditionne le dimensionnement et l'installation locale, pas la rédaction du contrat | Pas d'estimation horaire inventée ; deux chaînes de dépendances distinctes |
| Pré-mortem (PDV-071) | Risque de baptiser V2 une charte non éprouvée ou d'annoncer « local » avec une API distante : recevoir séparément comportement, état et exécution | Tests hors ligne, provenance des appels et version livrée attendus ; ce sont des critères, pas des preuves déjà obtenues |

## Contrat du prochain lot de continuité — préparé le 25/10

Réutiliser le registre durable `leo/runtime/memoire.py` et les opérations du broker ; ne pas exposer SQLite au navigateur, ni créer une autre mémoire dans `localStorage`, ni encoder un nouveau registre JSON dans `next_action`. La lecture a confirmé que le registre accepte aujourd'hui seulement `state` et `next_action` dans ses patches ; les jalons et rappels demandent une extension structurée et versionnée. `DispatchBroker` reste un transport de fixtures, pas un raccord produit.

Le checkpoint d'interaction devra porter : version de schéma, identité de mission rattachée par l'hôte au propriétaire authentifié, révision de plan, titre et jalons bornés, indices confirmés, compteur de rappels 0–2, état en cours ou suspendu et prochaine étape. Ne pas y copier conversation complète, dossiers, secrets ou idées métier : les idées de côté restent des références vers leur source autorisée. Les jalons restent des déclarations, sans autorité sur l'exécution ou le budget.

Les transitions d'adoption, confirmation, rappel affiché, pause et reprise devront avoir un identifiant d'opération stable et une version attendue. Un conflit de version demande réconciliation ; un événement répété ne consomme pas un second rappel. Une issue inconnue ne se rejoue pas aveuglément. Une session expirée ou un changement de compte ne doit révéler ni reprendre la mission précédente. Sauvegarde et restauration doivent suivre le même propriétaire et le même registre.

Réception attendue : reprise dans un nouveau processus avec le même plan et un compteur déjà à 1 ; refus d'une version périmée ; idempotence d'une même transition ; refus de lecture/écriture par un autre propriétaire ; conservation des points d'arrêt lors d'un changement de priorité. Aucune de ces capacités n'est déclarée raccordée par ce contrat. Les permissions et le contrôle privé R21 restent inchangés et hors accès Work.

## Historique de préparation du 24/10

Boucle active : recevoir le lot d'interaction avant d'élargir la V2. PR419, tête observée `afde23829707f4b7551037278bf8a3882f3f34c1` avant ce complément. Objectif local confirmé et recherches Odysseus réalisées ; aucun logiciel installé sur le PC de Paul. Aucun besoin de ses specs pour continuer les jalons V2 indépendants.

CI du premier lot : runtime, registre, registre-postgres et registre-auth réussis ; unitaires 69/72. `unit-leo-interaction.mjs` et `unit-leo-voix.mjs` passent dans le conteneur isolé. `unit-leo-donnees.mjs` et `unit-leo-interrupteur.mjs` échouent car leurs simulations de route n'injectent pas les nouveaux imports ; `unit-leo-appels.mjs` échoue sur deux contrôles de câblage liés à l'extraction de réponse. Logs unitaires : https://github.com/PaulGERARD161098/Ultima-/actions/runs/40126336471/job/120968465152 . Les contrôles navigateur et LV1 sont rouges et ne constituent pas une recette. Les corrections sont à éprouver sur la nouvelle version avant de clore ce jalon.

Correctif préparé après lecture des logs : vraies fonctions d'interaction injectées dans les deux simulations de route ; contrôles de quota et d'ordre préservés et renforcés ; repère d'extraction mis à jour. Une régression ajoute état de quadrant + suivi dans la même requête : la route conserve désormais les blocs structurés, au lieu de les convertir en chaîne, et ne modifie pas le fil fourni. Syntaxe statique des quatre fichiers vérifiée ; passage fonctionnel de la nouvelle version encore attendu.

Au commit `0f17ae4`, le nouveau scénario de données a rencontré le refus de rafale attendu (429) car il réutilisait immédiatement la même route et le même utilisateur. Le scénario est désormais construit sur une instance de route indépendante ; aucun limiteur de production n'est modifié. Passage du nouveau test encore attendu en CI.

Ces trois suites ne sont plus à corriger : résultats reçus au point de reprise du 25/10. Aucune fusion, activation, réception locale ou mise en production annoncée.

## Point de reprise du 25/10/2026

Version lue : `317b436df2f234b613f56a755d6af1664fed8944`, PR419 toujours ouverte en brouillon, non fusionnée. Base courante observée : `2ef85d53c761000320627bac697de1fc4c189f49`. Neuf checks terminés avec succès. Les logs de la [suite unitaire](https://github.com/PaulGERARD161098/Ultima-/actions/runs/40127510112/job/120972000870) indiquent **72/72 suites réussies**, dont les trois corrigées et `unit-leo-interaction`. [Navigateur 0](https://github.com/PaulGERARD161098/Ultima-/actions/runs/40127510112/job/120972001059), [navigateur 1](https://github.com/PaulGERARD161098/Ultima-/actions/runs/40127510112/job/120972000993) et [LV1](https://github.com/PaulGERARD161098/Ultima-/actions/runs/40127510095/job/120971985188) sont verts. Ces preuves portent sur cette version et les scénarios existants, pas sur une réception complète V2.

Revue indépendante : l'ancien smoke ne couvre aucun plan, jalon ou rappel structuré de ce lot. `tests/smoke-leo-interaction.mjs` est maintenant préparé sur le vrai cartouche, avec réponses HTTP fictives et aucun appel modèle ou métier : adoption par clic et dictée, progression déclarée idempotente, deux rappels et rejet du troisième, priorité explicite, pause/reprise avec compteur déjà consommé, attente indéterminée, adoption verrouillée pendant l'appel et rendu mobile. Son raccord est assuré par `smoke-*.mjs` dans `tests/lancer.sh`, appelé par la CI navigateur isolée existante ; aucun nouveau workflow ni cron.

La préparation corrige également le client : il n'affiche plus un rappel structuré reçu pendant que la tâche est suspendue, même si une réponse serveur en contient un. Le serveur possède déjà son filtre ; ce contrôle client défend l'état visible courant. La règle ne garantit pas la suppression d'un rappel dans la prose libre du modèle.

Revue des scénarios : le cas de reprise utilise désormais un compteur à 1, pour qu'une remise à zéro ne puisse pas passer. La fixture longue ne prétend pas éprouver le message à huit secondes : elle vérifie seulement l'attente indéterminée et le verrouillage du plan. Syntaxe statique vérifiée ; exécution du nouveau harnais à recevoir avant déclaration de succès. Une exécution de la CI existante est justifiée par cette nouvelle couverture fonctionnelle et la correction client, pas par une relance des seuls tests déjà verts.

Boucle active : obtenir la preuve navigateur ciblée du lot d'interaction. Ensuite : raccord du checkpoint au registre durable selon le contrat ci-dessus, puis dialogues réels et réception V2. Aucun logiciel installé sur le PC de Paul ; ses specs ne sont pas nécessaires pour ce travail. Aucun merge, appel IA externe, migration réelle ni activation.
