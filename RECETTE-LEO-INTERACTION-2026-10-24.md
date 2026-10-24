# Léo — interaction, état et reprise du 24/10/2026

Base : `2ef85d53c761000320627bac697de1fc4c189f49`. Contrat : §11.3 du cadrage canonique. Préparation sur branche distincte des travaux ZOH, du contrôleur LV1 et des devis. Aucun changement des permissions, actions, modèles, plafonds ni schéma Supabase. Après l'audit, la demande d'enrichissement GitHub systématique a été ajoutée à la charte, au contrat et au prompt ; son exécution nécessite un outil réellement accessible. La piste du moteur à poids ouverts « Odysseus » est consignée pour plus tard.

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

**Exécution locale bloquée** : Docker absent ; création de namespace Bubblewrap refusée par l'hôte ; la sonde d'une fixture chroot ne peut établir son environnement. Aucun test applicatif exécuté hors isolation. Les tests préparés ne sont pas annoncés verts. Le navigateur et le modèle réel restent non éprouvés. La CI existante doit fournir ses propres preuves ; ne pas fusionner sur la seule analyse statique.

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

## Point de reprise

Audit des briques et correctif préparés ; vérification syntaxique et revue réalisées. Reste : tests dans l'isolation du dépôt, recette navigateur desktop/mobile, dialogues réels, puis raccordement de la jauge aux événements vérifiés des outils si l'on veut une progression automatique. Aucune installation d'un framework, aucun merge, aucune activation ni mise en production.
