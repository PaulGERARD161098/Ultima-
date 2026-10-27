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


## Dry run demandé le 25/10 — correctifs et poursuite

Source vérifiée avant le dry run : `873673192f69010cd2df3985857f8b5b591c3406`, neuf checks verts. La contre-lecture a néanmoins trouvé trois écarts : reproposition/révision de plan réinitialisant les rappels, rappel encore recevable après tous les jalons confirmés, et changement explicite ignoré à cause de mots sans lien avec l'ordre dans le même message. Ces écarts ne sont pas niés par les 27 contrôles précédents : leurs scénarios manquaient.

Correctifs préparés : déduplication d'un plan identique ; révision conservant compteur et confirmations remappées uniquement pour les libellés inchangés ; nouvelle tâche explicitement demandée seule habilitée à repartir à zéro ; filtre de fin de tâche dans le parseur et le client ; analyse des commandes phrase par phrase. La reconnaissance reste une liste bornée de commandes, pas une compréhension exhaustive du langage naturel. La suppression de rappels dans toute prose libre reste à éprouver sur le modèle.

La relecture distincte a ensuite détecté un risque de candidat périmé : un ancien plan encore proposé pouvait être adopté après une nouvelle intention ou une reprise. Ces changements invalident maintenant le candidat précédent, et restituer le plan courant retire une révision devenue sans objet. L’intention de nouvelle tâche est liée au premier candidat reçu ; une priorité différente ou le remplacement de ce candidat la révoque. Chaque bouton conserve la référence du plan affiché et refuse d’adopter un autre candidat à sa place. La détection d'une nouvelle tâche est aussi traitée avant qu'un plan existe. Les smokes vérifient ces chemins en partant de compteurs non nuls et d'un vrai candidat en attente.

Contre-épreuves ajoutées au runner existant : `unit-leo-interaction-sabotages.mjs` charge quatre copies corrompues en mémoire (troisième rappel autorisé, compteur effacé lors d'une révision, suppression du filtre de fin de tâche, négation hors sujet). Chaque preuve doit échouer sur sa corruption puis passer sur la version correcte. Les fichiers applicatifs ne sont pas sabotés. Les unités et le smoke comprennent aussi les scénarios de répétition, révision, nouvelle tâche, achèvement et candidats périmés. Exécution à recevoir en CI isolée ; aucun résultat simulé n'est déclaré réussi avant les logs.

Angles croisés : utilisateur — plafonnement effectif des rappels ; opérateur — validité du candidat après changement d'intention ; adversaire — mutations témoins connues ; dépendances — la mémoire nécessite une extension de registre plutôt qu'un champ texte détourné. Syntaxe statique vérifiée. Le prochain passage ne doit pas relancer les seuls contrôles verts : il doit lire les nouvelles preuves et traiter tout écart.

Poursuite autorisée (« ensuite go ») : préparation de la continuité au registre existant, après correction du dry run. Lecture réelle de métadonnées Ultima le 25/10 : tables `public.leo_missions`, `public.leo_operations` et signatures `leo_status(uuid)`, `leo_write_memory(uuid,text,bigint,jsonb)` présentes ; `leo_missions` porte 18 colonnes historiques et aucun checkpoint. Aucun contenu de mission, aucun contrôle privé R21 ni secret n'a été lu. Aucune donnée, permission ou structure réelle n'a été modifiée.

### Poursuite : proposition de continuité dans le registre existant

## Résultat recherché et périmètre

Retrouver, depuis un autre onglet ou appareil du même propriétaire, le plan adopté, ses confirmations déclarées, les rappels déjà consommés et sa suspension. Réutiliser `public.leo_missions`, `public.leo_operations`, `public.leo_status` et `public.leo_write_memory` ; aucune table de conversation, aucun journal de discussion, aucun nouveau mandat ni RPC de création. Un checkpoint n'est ni une preuve d'exécution ni une permission d'effet externe.

Sources lues dans GitHub, PR #419, tête `873673192f69010cd2df3985857f8b5b591c3406` :

- `api/leo-registre.js` : actions fermées `GET status`, reçu ciblé, `write_memory`, `stop` ; patch actuellement limité à `state` et `next_action`.
- `js/leo-registre-client.js` : CAS sur `mission.version`, identifiant d'opération, réconciliation, journal `sessionStorage` ne contenant que des identifiants/versions ; comparaison de patch actuellement adaptée uniquement aux primitives.
- `js/leo-interaction.mjs` : forme locale du suivi `{titre,etapes,revision,confirmes,rappels,etat}` ; rappel borné à deux ; plan proposé sans achèvement automatique.
- `js/leo-registre-ui.js` : sélection explicite d'une mission existante ; aucun mécanisme de création de mission.
- `leo/proposals/registre-postgres.sql`, `registre-conflicts-pt409.sql`, `registre-etats-proprietaire.sql` ; migrations `20260929125105_leo_lv1_registre_transactionnel.sql`, `20261001070311_leo_registre_conflicts_pt409.sql`, `20260930081500_leo_operations_read_cloisonne.sql` ; tests API, client/parcours, SQL et Auth existants.

Le parent a constaté en métadonnées la présence des tables et RPC. Au 25/10/2026, il a également lu les colonnes : **18 colonnes historiques dans `leo_missions`, checkpoint absent**, sans lire de donnée métier. Cette observation est transmise par le parent, pas remesurée par ce sous-lot. **Elle ne prouve ni la définition exacte actuelle des RPC, ni l'existence d'une mission utilisable, ni l'application de toutes les propositions SQL.** Les contenus de missions et le contrôle privé restent hors périmètre de cette préparation.

### Choix minimal recommandé

Ajouter **une colonne nullable `checkpoint jsonb` à la mission existante**, exposée par la lecture et écrite par la même transaction que `leo_write_memory`. Conserver l'historique d'opérations et tous les verrous existants. Ne pas sérialiser le plan dans `next_action` : cela détournerait une chaîne libre de son contrat et empêcherait une validation structurée.

Les lignes existantes gardent `checkpoint IS NULL`. L'ancien client continue à écrire `state`/`next_action` sans toucher au checkpoint. Le nouveau client désactive les commandes de continuité quand le serveur ne déclare pas cette capacité ; il ne prétend pas sauvegarder dans un ancien backend.

Forme canonique minimale proposée (**sept clés**, identité stable de tâche distincte de la révision du plan ; valeurs d'exemple fictives) :

```json
{
  "task_id": "00000000-0000-4000-8000-000000000001",
  "titre": "Terminer une mission fictive",
  "etapes": ["Préparer le résultat", "Vérifier le résultat"],
  "confirmes": [0],
  "rappels": 1,
  "etat": "en_cours",
  "revision": 1
}
```

Validation à partager entre les lecteurs/rédacteurs applicatifs et à réimplémenter explicitement dans SQL :

- objet simple conforme au contrat retenu, incluant `task_id`, pas de `null` ni champ libre de droits ; la validation stricte doit suivre ce schéma **à sept clés**, pas l'ancienne proposition à six clés ; taille JSONB <= 10 000 octets et maintien du plafond actuel de 16 384 octets pour le payload d'opération ;
- `task_id` : identité opaque stable, émise par l'hôte ou par une commande propriétaire explicite ; jamais déduite d'une révision, d'un titre reformulé ou d'une proposition du modèle. Le format de production recommandé est UUID aléatoire validé ; l'UUID ci-dessus est strictement fictif et ne désigne aucune tâche réelle ;
- `titre` : chaîne non vide <= 160 caractères ;
- `etapes` : tableau de 1 à 10 chaînes non vides <= 160 caractères, sans doublon après normalisation existante ;
- `confirmes` : tableau trié d'entiers uniques, de 0 à `etapes.length - 1`, jamais interprétés comme preuves serveur ;
- `rappels` : entier de 0 à 2 ; `etat` : `en_cours` ou `suspendue` ; `revision` : entier sûr positif <= 9 007 199 254 740 991 ;
- mêmes refus de caractères de contrôle et de balises que `validerPlan`, sans prétendre que cette validation supprime toute donnée personnelle ; le checkpoint ne contient que le minimum utile, sans discussion complète, jeton, secret ou contrôle privé.

La `revision` du checkpoint identifie la **version du plan à l'intérieur de la même tâche**, nécessaire aux boutons de confirmation d'un jalon. `task_id` reste stable à travers ces révisions. La `version` de mission reste **l'unique version CAS transactionnelle** : ne pas créer un second compteur de concurrence. Les objets d'étapes restent immuables au sein d'une révision.

#### Transitions recommandées

1. Première adoption sur `checkpoint IS NULL` : identité de tâche émise par l'hôte, `revision=1`, `confirmes=[]`, `rappels=0`, `etat=en_cours`.
2. Même révision : titre et étapes strictement inchangés ; confirmations seulement ajoutées, rappels non décroissants et augmentés au plus de un ; reprise/suspension explicitement demandée par le propriétaire.
3. Révision de plan explicitement adoptée pour la **même tâche** : même `task_id`, `revision=ancienne+1`, **rappels intégralement conservés**. Les confirmations des libellés d'étapes inchangés sont conservées et remappées vers leurs nouveaux indices ; les étapes ajoutées ou réellement modifiées restent non confirmées. Dédupliquer une proposition identique : titre/étapes inchangés ne créent ni nouvelle révision ni nouvelle tâche. La comparaison des libellés utilise une normalisation canonique partagée ; les doublons normalisés sont interdits afin que le remappage soit univoque.
4. Une nouvelle tâche et son compteur initial à zéro exigent une **commande propriétaire explicite, versionnée et distincte d'une révision**. Elle est liée à l'identité de tâche précédente, à la version CAS de mission et à un candidat courant précis (identifiant, révision et empreinte de son plan). L'intention ne s'applique qu'à ce candidat ; toute nouvelle proposition l'invalide. Une simple approbation de plan, un nouveau titre, une révision, une recharge ou une réponse du modèle n'autorisent jamais ce renouvellement. Après accord explicite du candidat non périmé, l'hôte émet le nouveau `task_id`, `revision=1`, `confirmes=[]`, `rappels=0`. L'ancien plan demeure dans les reçus, sans nouveau magasin.
5. Pas de remise à zéro silencieuse ou de `checkpoint:null`. Le compteur est attaché à `task_id`, pas à `revision`. Une correction importante du plan reste une révision tant que la nouvelle tâche n'a pas été explicitement commandée ; le dispositif n'invente pas une autorisation de retour arrière métier.
6. Tous jalons confirmés : état d'affichage « confirmations complètes », pas modification automatique de `mission.state=closed`, pas « livraison prouvée » ni action externe.

**Correction issue du dry run transmis le 25/10 :** l'ancienne transition qui remettait les rappels à zéro à chaque génération était un contournement du plafond de deux rappels par tâche. Elle est retirée et ne doit pas servir de base à un patch. La distinction identité de tâche / révision de plan est une exigence de réception, pas une optimisation.

### Commande de nouvelle tâche : liaison nécessaire, pas nouveau mandat

Conserver la route `write_memory` et l'opération idempotente ; étendre son contrat par une commande de checkpoint fermée, par exemple `checkpoint_command={kind:"revise_plan"|"new_task"|"update",expected_task_id,candidate_id,candidate_revision,candidate_hash}`. Pour la première adoption, l'identité précédente est explicitement absente selon un cas validé séparé. La commande est enregistrée dans le payload de **cette nouvelle opération**, sans ajouter une clé par défaut aux anciennes opérations.

Le marqueur `new_task` seul n'est pas une preuve suffisante : le cartouche/hôte doit lier l'intention explicite à son candidat courant, la consommer une seule fois et la révoquer dès que le candidat change. Le serveur vérifie en plus owner, CAS, identité précédente et transition autorisée. Si la vérification du candidat courant requiert une attestation hôte, son format et sa vérification devront être définis et éprouvés avant migration ; **ne pas simuler cette garantie par un booléen client ou un champ libre fourni par le modèle**. Le lot reste préparatoire tant que cette liaison exacte n'est pas raccordée.

**Recommandation d'autorité à faire apparaître dans le lot :** réserver les écritures du nouveau champ `checkpoint` au propriétaire de la mission. Les writers existants gardent leurs droits actuels sur les seuls champs historiques. Cela protège les déclarations de suivi contre un autre writer sans élargir les droits existants. Même ainsi, une requête avec le JWT du propriétaire ne distingue pas techniquement Léo de Paul : les confirmations restent déclaratives, et seules des actions UI explicites doivent les produire. La proposition historique `registre-etats-proprietaire.sql` n'est pas supposée appliquée et n'est pas absorbée silencieusement dans ce lot.

### Changements SQL exacts à préparer dans le dépôt

Le fichier final devra être une nouvelle **proposition hors `supabase/migrations/`**, puis une migration revue seulement après lecture des définitions actuellement installées. Ne jamais rejouer le `create schema`/`create table` du bootstrap sur l'instance existante.

1. Vérifier en métadonnées : colonne absente ou définition compatible, définitions exactes `leo_status` et `leo_private.write_memory_impl`, propriétaires des fonctions, `search_path`, invoker/definer, grants, RLS actuelle et empreintes des migrations. Un écart interdit de remplacer une fonction à partir d'un ancien snapshot.
2. Ajouter `leo_missions.checkpoint jsonb NULL`, sans valeur d'instance et sans réécriture de l'historique. Ajouter une contrainte de forme avec un validateur SQL strict ; `SQL NULL` reste réservé aux anciennes missions. Ne changer ni ACL/readers/writers, ni privilège DML, ni budget.
3. Étendre la projection de `leo_status` à `mission.checkpoint` et ajouter une capacité explicite, par exemple `capabilities.checkpoint=1`. Les opérations restent la projection existante et le reçu ciblé reste sous la RLS corrigée. Ne pas renvoyer payload/ACL.
4. Dans `leo_private.write_memory_impl` : étendre l'allowlist à `state,next_action,checkpoint` et à la commande fermée de checkpoint retenue ; validation stricte de l'identité de tâche, du checkpoint et de l'intention versionnée ; authentification, scope/version et verrou de mission inchangés. **Réutiliser le payload exact existant `jsonb_build_object('expected_version',p_expected_version,'patch',p_patch)`** : ne pas y ajouter une clé par défaut, sinon les anciens rejoués deviendraient divergents.
5. Après recherche d'une opération déjà terminée (dont le reçu exact doit rester rejouable), appliquer la garde owner du nouveau champ et les transitions ci-dessus : compteur monotone pour une même tâche, remappage des confirmations sur libellés inchangés, révision de plan sans renouvellement de tâche, intention new_task non périmée. Conserver arrêt, expiration, CAS, épuisement de version et plafonds inchangés. Le conflit reste `PT409`, pas `40001` pour un conflit métier.
6. Dans l'unique `UPDATE` de mission, ajouter la mise à jour conditionnelle du checkpoint ; dans le reçu nouveau, ajouter le checkpoint canonique et l'identité de la commande acceptée (`checkpoint_command`, forme fermée, sans secret) **dans le résultat de la même transaction**. Cela permet de rapprocher la commande de renouvellement sans faire passer une intention pour un champ stocké de mission. `version`, `used_units`, `calls` avancent une seule fois comme aujourd'hui. Pas d'appel IA, de timer ni de nouvelle réservation financière.

Fragment d'intégration précis, **non exécutable seul**, à insérer dans la fonction relue plutôt qu'à appliquer tel quel :

```sql
-- Allowlist étendue AVANT le verrou :
-- Allowlist complétée seulement par la commande fermée de checkpoint retenue.
-- ('state', 'next_action', 'checkpoint', 'checkpoint_command') => clés possibles
-- p_patch ? 'checkpoint' AND NOT checkpoint_valide(p_patch->'checkpoint') => 22023

-- APRÈS le bloc de rejeu exact existant et AVANT tout effet :
if p_patch ? 'checkpoint' and v_m.owner <> v_uid then
  raise exception using errcode = '42501', message = 'owner_checkpoint_required';
end if;
-- Vérifier ici les transitions du plan sous le verrou déjà pris.

-- Dans l'UPDATE existant, pas un second UPDATE :
checkpoint = case when p_patch ? 'checkpoint'
  then p_patch->'checkpoint' else checkpoint end,

-- Dans v_result, en plus des champs historiques :
'checkpoint', v_m.checkpoint
```

Un éventuel validateur `leo_private.checkpoint_valide(jsonb)` est pur, `IMMUTABLE`, avec `search_path=''`, sans accès aux tables. Son nom n'ouvre aucune API : retirer les grants PUBLIC par défaut ; seul le propriétaire de `write_memory_impl` en a besoin. Il ne doit pas être security-definer. Éviter toute exception de cast sur JSON hostile : vérifier les types avant conversion et rendre les mauvais inputs en `22023` dans la RPC. Aucun code de migration complet n'est affirmé prêt tant que le snapshot réel et le banc isolé manquent.

### API, client et interaction : changements nécessaires

| Fichier existant | Modification bornée |
|---|---|
| `api/leo-registre.js` | Accepter `patch.checkpoint` dans la même action `write_memory`, valider la forme avant RPC, garder les clés de corps exactes, auth inchangée et un seul RPC. Les champs de droits/budget/identité restent interdits. GET ne découvre aucune mission nouvelle. |
| `js/leo-interaction.mjs` | Réutiliser `validerPlan`, ajouter `task_id`, validateur complet et import depuis projection serveur. Révision de plan : même task_id/rappels, confirmations des libellés inchangés remappées ; plan identique dédupliqué. Intention explicite de nouvelle tâche liée au candidat courant, jamais héritée par le candidat suivant. Ne pas confondre confirmations déclarées et preuves. |
| `js/leo-registre-client.js` | Étendre `statusValid` et `resultValid` pour le checkpoint, la capacité et le reçu fermé de la commande. Accepter les anciens reçus sans ces champs. Écrire via la même méthode `write`, le même expected_version et operation_id. **Remplacer les comparaisons primitives `op.result[k]===patch[k]` par une comparaison structurelle canonique pour checkpoint et checkpoint_command** : deux objets JSON identiques ne sont jamais égaux par référence après transport. Le reçu nouveau doit restituer la commande acceptée pour ce rapprochement ; ne pas réclamer cette clé sur une ancienne opération qui ne l'avait pas. Garder la comparaison stricte pour state/next_action. |
| `js/leo-registre-client.js` | Conserver le journal de reprise minimal (mission/opération/version, aucun contenu de checkpoint ni patch dans sessionStorage). Après réponse perdue, reçu ciblé par mission+operation_id puis réconciliation ; une absence de reçu ne débloque jamais un nouveau POST automatique. Relecture Auth avant toute nouvelle commande. |
| `js/leo-registre-ui.js` / cartouche consommateur | Rattacher explicitement le suivi à la mission existante sélectionnée par le propriétaire ; hydrater depuis checkpoint après lecture réussie. Si aucune mission choisie ou capacité absente : suivi local clairement non sauvegardé, pas de fausse mémoire durable. Ne pas provisionner une mission depuis le cartouche. |
| Cartouche de suivi | Adoption, confirmation de jalon, pause/reprise, révision et nouvelle tâche => commandes distinctes. Une révision remappe déterministement les confirmations des libellés inchangés, sans remise à zéro des rappels. Seule une nouvelle tâche explicitement demandée et liée au candidat courant peut créer task_id et compteur neufs. Sauvegarde CAS ; affichage « enregistré » seulement après reçu. Un conflit préserve le brouillon et propose comparaison, jamais fusion automatique de versions concurrentes. |
| Contexte du modèle | Utiliser la projection relue du registre pour la reprise, toujours étiquetée non autoritative pour les droits. Aucune donnée de mission voisine injectée, aucune instruction tirée du titre. Le prochain jalon se dérive de `etapes/confirmes` ; ne pas stocker une deuxième copie de ce calcul. `next_action` reste le mémo historique distinct, pas une deuxième source du plan. |

#### Compteur de rappels : ordre qui évite une troisième insistance

Avant de rendre visible un rappel structuré, persister l'incrément `rappels+1` par CAS, attendre le reçu puis afficher le rappel. En cas d'issue inconnue, suspendre le rappel visible et réconcilier le reçu. Un crash entre sauvegarde et affichage peut consommer conservativement un rappel ; il ne remet pas le compteur à zéro. Deux onglets concurrents ne peuvent consommer le même créneau : l'un reçoit `PT409`, relit et ne rejoue pas automatiquement. Une priorité explicitement changée ou une tâche suspendue reste respectée sans troisième rappel.

### Recette à ajouter aux bancs existants — aucune exécutée dans cette préparation

| ID | Épreuve isolée | Attendu |
|---|---|---|
| C01 | Mission historique sans checkpoint ; ancien client state/next_action | Ancien comportement conservé, checkpoint NULL, pas de réinitialisation. |
| C02 | Adoption puis relecture sur nouvelle session/appareil autorisé | Même titre, étapes, confirmes, rappels, état et révision ; zéro contenu de conversation dans stockage local. |
| C03 | Deux writes concurrents même mission.version | Un seul commit, un seul débit et un seul reçu ; second PT409 sans effet. |
| C04 | Réponse perdue après commit ; même opération/version/patch | Reçu original retrouvé, `replayed=true` si rejeu explicite exact, aucun second effet/débit. Client ne rejoue pas automatiquement. |
| C05 | Même operation_id, payload/version différents | PT409, aucune mutation ni nouveau débit. |
| C06 | Reçu hors des 100 plus récents | GET ciblé sous RLS retrouve l'opération ; absence reste issue inconnue. |
| C07 | Propriétaire / writer / reader / étranger / anon / service_role | Owner peut checkpoint ; writer conserve droits historiques mais pas checkpoint ; reader lecture autorisée seulement ; étranger/anon/service_role refusés selon privilèges existants. Aucun élargissement. |
| C08 | JSON null, clés droits, index hors bornes, doublons, rappels=3, révision non sûre, payload trop grand | 400/22023 avant effet, zéro budget/version modifié. |
| C09 | Modification étapes à même révision ; reset confirmes ou rappels ; révision sautée | Refus de transition, données préservées ; une révision adoptée passe seulement par ancienne+1 en conservant task_id/rappels et les confirmations remappables. |
| C10 | Bouton ancien plan après remplacement | Révision du plan divergente : confirmation refusée, aucun index transposé au nouveau plan. |
| C11 | Deux rappels puis rechargement, changement appareil, pause et reprise | Compteur conservé à deux ; aucune nouvelle proposition de recentrage. |
| C12 | Crash après sauvegarde rappel avant affichage | Compteur non réinitialisé ; éventuelle consommation conservatrice annoncée dans la preuve, pas de rappel supplémentaire. |
| C13 | Arrêt propriétaire, expiration, budget épuisé, scope/version inconnus | Nouveaux writes refusés ; reçu exact déjà terminé toujours consultable/rejouable sous droits actuels. |
| C14 | Corps checkpoint reçu par HTTP identique mais ordre des clés différent | Accusé valide, comparaison structurelle vraie, pas d'issue incertaine artificielle. |
| C15 | Mission détenue par autre propriétaire / changement de session pendant lecture | Aucune donnée ancienne affichée ; destruction du client, purge affichage et nouveau chargement autorisé. |
| C16 | Titre contenant une instruction hostile | Texte inerte, aucune permission ni outil supplémentaires ; pas de HTML injecté. |
| C17 | Capacité checkpoint absente (ancienne RPC ou migration non appliquée) | Désactivation explicite de la sauvegarde structurée, pas de repli silencieux dans next_action ou dans un nouveau stockage. |
| C18 | Contrôle témoin retiré sur copie jetable | Le banc owner/CAS/rappel rougit ; un contrôle non exécuté ne compte pas comme succès. |
| C19 | Deux rappels consommés, plan reformulé/réordonné/révisé puis plan identique reproposé | Même task_id et rappels=2 ; pas de nouveau recentrage. Les confirmations de libellés inchangés sont remappées, les changements réels non confirmés. Plan identique dédupliqué sans nouvelle révision. |
| C20 | Nouvelle tâche explicitement demandée, puis candidat remplacé avant adoption ; adoption valide ensuite | L'intention ancienne ne vaut pas pour le nouveau candidat : aucun reset ni nouveau task_id. Une commande explicite liée au candidat courant, owner et CAS valides crée une seule nouvelle tâche et remet son seul compteur à zéro ; rejeu exact sans seconde tâche. |

Réutiliser `tests/unit-leo-registre-api.mjs`, `unit-leo-registre-parcours.mjs`, `unit-leo-registre-recu.mjs`, `unit-leo-registre-sql.mjs`, `leo-registre-auth.mjs`, `unit-leo-interaction.mjs` et le smoke existant. Une simulation de route ne remplace pas Auth/PostgREST/SQL isolés. L'exécution reste bloquée tant que l'isolation requise n'est pas disponible ; aucun lancement de PGlite, navigateur ou application a été fait ici.

### Entrée/sortie du prochain lot utile

Prérequis : définir la mission existante explicitement choisie par le propriétaire, relever les seules métadonnées SQL nécessaires et disposer d'un banc isolé. Livrable : proposition SQL complète relue, patch API/client/cartouche, preuves des refus et du round-trip inter-session. Préparer ensuite le dossier de migration réelle avec son diff exact et ses preuves ; ne pas demander maintenant une approbation sur un SQL encore incomplet.

État présent : **raccord proposé, pas continuité implantée, pas mémoire réelle éprouvée**. La présence du registre est réutilisée ; aucun nouveau magasin de mémoire n'est proposé. Le jalon « 3/5 » ne doit être annoncé atteint qu'après son critère de réception explicite et ses preuves, jamais à partir de ce document seul.

### Reprise autorisée du 25/10 — accès ciblé et projection pure

Après « état des lieux » puis « ok go », la tête distante de PR419 a été relue : `8f522991fb25576f3c242122efe0da5771a96bff`, brouillon ouvert, base `2ef85d53c761000320627bac697de1fc4c189f49`. Les preuves du dry run précédent restent celles de cette version ; elles ne valident pas le nouvel incrément avant ses propres journaux CI.

Le blocage a été précisé : deux requêtes de métadonnées sur Ultima (`leosfqyidgsaescjbfom`) retournent `You do not have permission to perform this action`. `list_projects` réussit mais ne renvoie que **mon-dpe-facile.fr** (`kqjpwcmnhluwliropdgt`). La connexion ne fournit donc plus l'accès Ultima nécessaire. Ce constat remplace l'hypothèse précédente de simple outil SQL inconnu ; il ne prouve pas une panne de la base. Aucun changement de connexion, droit ou projet, aucune lecture de missions, aucun SQL de modification n'a été réalisé. Rétablir la visibilité d'Ultima puis reprendre les métadonnées ; ne pas utiliser mon-dpe-facile comme substitut.

Préparation bornée dans le module commun existant : `validerCheckpoint` impose les sept clés, un UUID syntaxique, un plan valide, des confirmations triées uniques et bornées, rappels 0–2, état fermé, révision entière sûre positive et plafond JSON UTF-8 de 10 000 octets. `hydraterSuiviCheckpoint` restitue une copie indépendante, sans générer d'identité ni remettre compteur, révision ou confirmations à zéro. Une révision du plan conserve désormais le `task_id` lorsqu'il existe ; le suivi local historique n'en reçoit aucun artificiellement.

Cinq scénarios déterministes groupés ajoutent round-trip en mémoire, absence d'alias, refus des clés de droits et données invalides, limites et conservation du compteur/identité lors d'une révision. Deux corruptions témoins complètent les quatre existantes : compteur remis à zéro pendant la restauration et identité perdue pendant la révision. Le harnais doit refuser chacune puis accepter le code correct ; aucun fichier applicatif n'est corrompu. Vérification syntaxique seulement sur l'hôte, tests applicatifs réservés aux conteneurs isolés de la CI existante. Résultats à lire dans les checks et journaux du commit de cet incrément, pas à déduire de cette préparation.

Cet incrément n'importe aucune projection serveur dans le cartouche et n'ouvre aucune nouvelle écriture API/client. Il ne réalise pas le round-trip inter-session, le CAS avant affichage d'un rappel, la validation SQL ou la liaison de nouvelle tâche à son candidat. La restauration de données validées est une brique pure, **pas une sauvegarde durable ni une preuve d'autorisation**. Le lot complet reste conditionné à l'accès réel Ultima, au schéma réconcilié et aux cas C01–C20.

### Après reconnexion — raccord préparé, activation non effectuée

Paul a indiqué « connecté ». Les trois connexions Supabase désormais exposées ont été vérifiées en lecture : une connexion voit **Ultima** (`leosfqyidgsaescjbfom`), RenoBoostIA, RenoPredict et RenoAgenda ; les deux autres voient Mon DPE Facile. L'accès nécessaire à Ultima est rétabli. Les quatre définitions `leo_status`, `leo_write_memory`, `leo_stop`, `leo_private.write_memory_impl`, leurs propriétaires/ACL/search_path ainsi que colonnes, grants et RLS des deux tables ont été relus. Les 18 colonnes historiques, l'absence de checkpoint, les SELECT cloisonnés et l'absence de DML direct authenticated ont été constatés sans lire de mission ni contrôle privé R21. Le snapshot minimal des métadonnées est `leo/proposals/registre-checkpoint-snapshot.json` ; aucun secret ni donnée de mission n'y figure.

Le nouveau lot prépare **une tâche durable par mission existante**, dans le registre actuel. La proposition `leo/proposals/registre-checkpoint.sql` ajoute une colonne nullable, des validateurs purs et des gardes contre une dérive du snapshot ; les RPC existantes sont adaptées sans nouveau grant ni mandat. L'ancien payload et les anciens reçus restent inchangés. Les nouvelles opérations portent le checkpoint et une commande fermée `adopt`, `update` ou `revise_plan`, liée à l'ancien task_id et à la version CAS de mission. Seul l'owner peut modifier ce champ ; les writers conservent leurs seuls droits historiques. Les protections de budget, expiration, arrêt, issue inconnue et idempotence sont conservées.

**Limite explicite de périmètre : `new_task` durable est refusé**, plutôt que de simuler l'attestation hôte non encore définie. Le cartouche conserve le point d'arrêt et ne remet aucun compteur à zéro dans une mission déjà porteuse d'une tâche. Une autre tâche durable demande une autre mission existante explicitement consultée. Cela ne réceptionne pas le cas C20 complet ni la V2 finale. Le parcours local historique reste disponible et déclaré non sauvegardé quand la capacité du serveur est absente ; ce n'est pas un repli silencieux après l'échec d'une écriture durable.

L'API et le client valident la paire checkpoint/commande et la capacité serveur. Les accusés sont comparés structurellement, sans dépendre de l'ordre des clés JSON. Le journal navigateur reste limité à mission/opération/version, sans contenu de suivi ni jeton. Le cartouche se lie explicitement à la mission consultée ; aucun mandat n'est créé et aucune recherche globale de missions n'est ajoutée. Une sauvegarde passe par le client existant, puis une relecture ; le jalon n'avance pas avant confirmation. Le rappel est consommé par CAS **avant** affichage. Une réponse perdue impose une relecture du reçu exact, sans nouveau POST automatique ; une coupure après commit peut donc consommer un rappel sans l'afficher, choix conservateur qui ne renouvelle pas le plafond.

Les boutons gardent leur candidat et les confirmations restent déclaratives. Changement de compte : suivi, propositions et conversation de l'ancien cartouche sont effacés, voix révoquée et réponses en vol écartées. Les continuations asynchrones contrôlent aussi la génération après la sauvegarde d'un rappel, pas seulement après la réponse IA. Une liaison interrompue pendant le chargement du module relit session et version avant d'hydrater.

Recettes ajoutées aux runners existants : `unit-leo-registre-checkpoint-sql.mjs` exécute la proposition sur PGlite jetable après installation des définitions réellement observées, y compris un témoin de dérive qui doit échouer avant DDL ; `unit-leo-registre-checkpoint-client.mjs` éprouve compatibilité, formes, reçu exact, perte de réponse et absence de rejeu ; `smoke-leo-continuite.mjs` compose client, UI du registre et cartouche réels sur HTTP fictif, avec attente de commit, autre page, refus de reset, conflit, perte de réponse et changement de compte. Les simulations de route existantes injectent le validateur partagé. Relecture croisée des lots backend/client/UI effectuée ; syntaxe seulement vérifiée sur l'hôte. Les tests applicatifs de ce lot doivent être reçus dans les conteneurs CI ; **aucun succès n'est déduit de leur présence**. PGlite mono-connexion et HTTP fictif ne prouvent ni Auth/PostgREST réel ni concurrence de deux connexions PostgreSQL.

État courant : raccord en préparation de recette, **non fusionné, non migré, non activé**. Après preuves CI et vérification des définitions/grants/RLS toujours applicables, présenter l'opération SQL exacte pour Ultima et son empreinte à Paul ; sa consigne réserve la migration de production à une autorisation distincte. Ne pas demander un accord sur une proposition non éprouvée. Le premier retour arrière est le retrait du raccord applicatif en conservant colonne et reçus ; aucune suppression automatique de checkpoint ni réinitialisation de compteur. Les dialogues du vrai modèle et la recette finale restent ouverts.

Compléments de recette avant push : le script existant `tests/leo-registre-postgres.sh` prépare les définitions et policies du snapshot dans son cluster jetable, applique la proposition puis mesure deux clients authentifiés réellement bloqués sur le verrou de la même mission. Il exige un seul succès, un conflit PT409, un seul incrément de rappel/version/budget, le rejeu exact sans débit supplémentaire et la conservation du plafond au second rappel avec refus du troisième. Aucun job/cron ajouté ; le coût marginal de ce scénario sera mesuré dans le job PostgreSQL existant. Les gardes de migration couvrent aussi propriétaires/ACL des fonctions, RLS/policies/grants réels, avec témoins de dérive isolés. Le job Auth existant monte seulement le module partagé supplémentaire en lecture seule ; sa copie volontairement corrompue résout le même module via un lien vers ce montage, sans élargir l'environnement du test.

La projection canonique du checkpoint est utilisée avant transport, journal en RAM et comparaison du reçu côté client, et dans la route pour les appels directs ; les labels épurés ne peuvent donc plus provoquer un faux résultat incertain après un commit. La recette HTTP ajoute les courses compte changé pendant la réponse IA et pendant la sauvegarde d'un focus, ainsi que l'effacement d'un cartouche resté local. La commande de reprise réutilise le style existant avec cible tactile de 44 px. Tous ces résultats restent **à recevoir**, pas présumés réussis par l'analyse statique.

Premier passage CI du raccord (`005107bef09911caae964a1e8a2ec5f8aa1ba0e4`) : 76/77 suites unitaires passent ; la garde `checkpoint_grants_drift` bloque la proposition sur PGlite et PostgreSQL réel avant DDL. Les deux jobs navigateur échouent sur le même précontrôle unitaire et n'exécutent pas encore leurs parcours. Auth, registre historique, runtime et LV1 passent. Cause vérifiée par une lecture supplémentaire des **ACL brutes réelles** : `information_schema.role_table_grants.is_grantable` tient compte des droits implicites du propriétaire, contrairement au bit stocké donné par `aclexplode`. Le snapshot est complété par `raw_table_acl`, et le garde compare désormais ce relevé à la même représentation ; aucun grant n'est assoupli ou modifié. Un témoin supplémentaire accorde SELECT WITH GRANT OPTION au seul acteur fictif authenticated et doit être refusé. Nouvelle recette nécessaire avant tout verdict ; aucune migration réelle appliquée.

Passage suivant (`b4a1122cdb182388dca8fe415d3e77389387f3ae`) : les gardes acceptent le snapshot et la première adoption SQL réussit, puis l'update révèle `42883 boolean -> unknown`. Le contrôle d'inclusion `new_cp->'confirmes' @> old_cp->'confirmes'` associait les opérateurs de même priorité à gauche. Les extractions du helper sont maintenant explicitement parenthésées, notamment les deux côtés de `@>`. La contrelecture distingue ce défaut des comparaisons `=`/`<>`, qui ont une priorité différente. Le scénario update et les assertions restent inchangés ; seuls les opérandes sont explicités. Les échecs ont eu lieu dans les bancs jetables, aucune migration n'a été appliquée à Ultima. Réépreuve isolée requise sur le correctif, sans prétendre avoir terminé la mémoire.

### Reprise du 25/10 — accès par choix de mission

Problème observé avec Paul : le parcours publié demandait un identifiant technique non fourni. Lecture agrégée sur Ultima pendant cette reprise : **zéro mission existante** ; aucun contenu utilisateur ni contrôle privé n'a été lu. Le sélecteur seul ne suffit donc pas à réceptionner la continuité avec son compte.

Préparation bornée sur la base main 1e8af7c7b2094ed1d769b5a7dfd8e214b4c1c07e : GET fermé list=missions sous requireUser et auth.client, SELECT avec les policies existantes, cinquante résumés maximum triés de façon stable. Aucun propriétaire transmis par le navigateur, aucune création, aucun grant ni migration. Le dialogue garde ses composants et jetons ; choix par prochaine action/état/date, accès UUID avancé replié. Liste vide, erreur et troncature explicites ; pas de sélection automatique. Compte changé : liste purgée et réponses tardives écartées. Le brouillon et le journal de réconciliation existants sont conservés.

Références de conception : index.html et css/leo-registre.css existants comme cible ; guide Refero craft-details pour labels, focus et formulaire natif. Parcours attendu : Mission Léo → choisir → ouvrir → mémo → reçu/relecture → recharger → choisir la même mission → retrouver le suivi. Trois angles de contrôle : utilisateur sans UUID, opérateur face à une liste vide/panne, accès concurrent ou compte changé. La PR422 de consultation ZOH reste distincte et non fusionnée.

Recettes ajoutées aux suites existantes : projection/auth/borne côté API ; client liste fermée et sans sélection implicite ; UI sélection sans UUID, brouillon, liste vide et réponse tardive ; smokes registre/continuité conservant perte de réponse, relecture et absence de double POST. La suite PGlite vérifie le SELECT de liste sous owner/writer/reader/étranger. Syntaxe Node vérifiée localement ; aucune exécution applicative locale : namespaces/chroot refusés et Landlock indisponible (ENOSYS). Les résultats applicatifs doivent être reçus en CI isolée. Revue indépendante statique : pas de défaut matériel constaté ; initialisation et recette connectée restent manquantes.

Prochain préalable concret : initialiser explicitement **une mission d'épreuve de mémoire uniquement**, liée au propriétaire authentifié vérifié, sans lecteur/writer tiers ni effet externe. Proposition à faire valider : durée 24 h, plafond 20 écritures et 20 appels du registre, état proposé, scope memory, contrat 1.1 et skill 1.0. Ces plafonds bornent le registre ; ils n'autorisent aucun appel à un fournisseur IA. La création et ses limites exigent l'accord explicite prévu dans leo/ACTIVATION.md ; ne pas fabriquer l'identité du propriétaire ni créer la ligne depuis le sélecteur. Après accord, l'initialisation doit être transactionnelle, à UUID généré par la base, contrôlée avant effet et suivie d'une lecture sous le compte concerné.

Restant : recevoir la CI, puis initier le suivi autorisé et vérifier le parcours réel connecté. Ton du modèle réel et essai local restent non reçus ; aucun nouvel appel IA facturé. Aucune fusion ni publication de ce correctif, aucune mission réelle créée dans cette préparation.

### Réception du 25/10 — suivi d'épreuve créé et sélecteur publié

Cette réception remplace les états historiques « zéro mission », « compte non résolu », « tests à recevoir » et « correctif non fusionné » ci-dessus pour ce lot.

Paul a autorisé la création du suivi d'essai sur son compte personnel et la publication de #423. Le compte personnel confirmé a été retrouvé dans Auth ; aucun secret ni jeton n'a été lu. Une mission scope memory est créée, propriétaire seul, aucun lecteur/writer tiers, expiration à 24 h et plafonds 20 écritures / 20 appels du registre. Ces plafonds n'autorisent aucun appel fournisseur ni effet externe.

Un plan d'essai a été sauvegardé via leo_write_memory, sous rôle authenticated et identité du propriétaire fixée dans une transaction administrative contrôlée. Résultat reçu completed, mission version 2 ; une transaction ultérieure a relu le même titre et les deux étapes. Aucune étape n'est déclarée terminée, aucun rappel consommé ; 1 écriture / 1 appel du registre utilisés sur 20. Un SELECT sous une autre identité n'a vu aucune mission. Cela prouve la persistance et la RLS sur la base réelle ; ce n'est pas un parcours HTTP avec un JWT utilisateur réellement connecté.

Pendant cette reprise, #422 a été fusionnée et publiée depuis l'autre session après accord distinct de Paul. Le correctif #423 a intégré main 050bdb98e66420e7fe0c1991e0b5af2428e84702 sans écraser le raccord ZOH. Source intégrée 44ca7075a311da9f74075f436e652973a741eed2 : 80/80 suites unitaires, 63 harnais navigateur (32 + 31), Auth et LV1 verts. Jobs 121308444177 / 121308444338 / 121308444341 ; registre, continuité et stock ZOH exécutés. Fusion #423 : 528a992337679902ea9b614c96169d1408f37d23. Production Vercel dpl_GWkU3YfnpZrkRNUtQCdZPafMfLyA READY sur ce commit.

Les sept essais avec le fournisseur réel du catalogue ZOH sont consignés dans #422 ; ne pas les refaire par défaut. Ils couvrent sélection de briques, besoin hors catalogue, demande simple et refus d'activation fictive ; ils ne réceptionnent pas tous les scénarios relationnels de cette recette.

Limite restante : ouverture de l'aperçu intégré réussie, mais écran de connexion Ultima. La demande browserAuth a été interrompue par l'utilisateur ; aucune relance. Navigation explicite vers l'origine puis observation : toujours l'écran de connexion, Mission Léo désactivée. Aucune sauvegarde ni réouverture n'a donc été vérifiée visuellement depuis son compte connecté. Ne pas annoncer la V2 complète ni l'IA locale reçues.

Parcours prêt pour Paul : accueil → Mission Léo → Choisir une mission → « Vérifier la sauvegarde et la reprise du suivi Léo » → Ouvrir la mission. Le suivi d'essai enregistré porte « Tester la sauvegarde et la reprise de Léo ». Dans le cartouche, utiliser la commande de reprise du suivi consulté. Fermer/recharger puis choisir la même mission pour vérifier la continuité visuelle. Si l'essai est expiré, le lire sans le réarmer automatiquement ; toute extension doit rester explicite. Prochaine action unique : recevoir ce parcours connecté, puis seulement compléter les scénarios relationnels non encore éprouvés. Installation locale et réception complète FINUBAR restent hors de ce lot.
