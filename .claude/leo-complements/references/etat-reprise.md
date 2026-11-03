# État de travail et reprise fiable

Cette procédure concrétise le §10 du contrat LV1 ; elle n'installe aucun stockage, verrou, ordonnanceur ou contrôle d'accès. Vérifier les capacités réelles avant de les annoncer.

## État minimal réutilisable

Adapter les champs ci-dessous à la structure canonique existante. Garder les détails dans les sources plutôt que dupliquer leurs contenus. Employer des identifiants stables de mission et d'opération ; ne stocker ni secrets ni données privées inutiles.

| Champ | Contenu nécessaire |
|---|---|
| Mission | Identifiant, projet et cible exacte, objectif utilisateur, responsable |
| Cadre | Périmètre, hors-périmètre, interdits, critères de sortie |
| Mandat | Autorisations et provenance, cible/effets couverts, conditions et limites ; aucun droit déduit d'un simple statut |
| Source | Emplacement canonique, révision attendue, version de départ et dernière observation datée |
| Situation | État de mission, fait prouvé, restant, blocages et responsables ; séparer déclaré, mesuré, inféré et non vérifié |
| Décisions | Décision actuelle, provenance, date, conditions ; marquer les décisions remplacées et leur successeur |
| Opérations | Identifiant, cible, effet, état (préparée, engagée, résultat confirmé, échouée ou issue inconnue), preuve et moyen de recherche avant rejeu |
| Preuves | Exigence, source/version, environnement/rôle protégé, date, contrôle, attendu/observé, statut, limites et emplacement |
| Suite | Prochaine action unique, préconditions, risques, contrôles et autorisations réellement manquantes |

Distinguer état de mission, état d'opération et statut de preuve. Une mission suspendue peut contenir une opération réussie ; une préparation terminée n'est pas une publication. Une preuve peut devenir périmée sans effacer le fait historique qu'un test a réussi.

## Écrire sans écraser

1. Identifier la source canonique et les lecteurs/rédacteurs habilités, finalité, conservation et statut des copies temporaires.
2. Lire sa révision actuelle et comparer à la version attendue. Examiner les modifications concurrentes avant de préparer une mise à jour ciblée.
3. Utiliser la précondition de version, transaction ou mécanisme effectif disponible. Une simple relecture ne garantit pas l'absence de concurrence entre contrôle et écriture. Si cette garantie manque pour une écriture sensible, préparer le changement et suspendre cette écriture ; poursuivre les tâches indépendantes.
4. En cas de conflit, relire, conserver les deux apports utiles et résoudre les contradictions avec leur provenance. Ne jamais appliquer une priorité implicite au dernier écrivain. Une contradiction qui change matériellement le mandat exige l'arbitrage manquant.
5. Confirmer la nouvelle révision et le contenu ciblé par lecture après écriture. Une réponse perdue laisse l'issue inconnue : rechercher par identifiant avant de réessayer. Ne pas annoncer une sauvegarde réussie sans preuve.

## Reprendre après interruption

- Relire le mandat actuel et l'état canonique. Relever les instructions applicables et les changements de cible, versions, compte, environnement et travaux concurrents.
- Inventorier les actions engagées et leurs effets possibles. Pour chacune d'issue inconnue, chercher le résultat via identifiant/reçu/état distant avant tout rejeu. Si la recherche est impossible, bloquer seulement l'opération concernée.
- Réutiliser les preuves dont les conditions restent valables ; marquer périmées celles affectées et refaire les contrôles nécessaires. Ne pas refaire tout l'audit par principe.
- Conserver les autorisations toujours applicables ; réévaluer seulement celles liées à une version, une cible, un effet ou une condition changée. « Go solo » ne vaut pas permission nouvelle.
- Rendre brièvement fait vérifié, boucle active et prochaine action ; poursuivre dans le mandat. Ne pas traiter l'historique de conversation comme mesure actuelle.

Si la source est indisponible, conserver au besoin un point de reprise temporaire daté et marqué « non réconcilié », dans un emplacement autorisé. Ne pas créer une seconde source canonique. Continuer les lectures et préparations indépendantes ; réconcilier avant clôture définitive.

## Arrêter et clôturer

À une demande d'arrêt, ne plus lancer de nouvelle action ; relever les opérations en cours sans promettre leur annulation. Sauvegarder et vérifier le point de reprise si l'accès le permet, sinon déclarer l'échec. À la clôture, ne marquer vérifié/clôturé que si les critères sont éprouvés et l'état durable réconcilié ; qualifier explicitement une préparation terminée avec opération restante bloquée.

Sur demande de récap, produire un seul bloc final copiable : objectif, cadre et interdits, source/révision et observations datées, décisions et autorisations applicables, fait/restant/bloqué, opérations d'issue inconnue, preuves périmées et prochaine action avec responsable. Ne pas exposer de données sensibles.

## Épreuves de réception de la procédure

Utiliser des scénarios fictifs : réponse perdue après écriture réussie ; deux sessions modifiant des champs distincts ; décisions contradictoires ; source canonique indisponible ; ancienne CI et autorisation de fusion périmée ; arrêt avec opération en cours ; reprise d'un petit correctif dont les preuves restent valides. Attendre recherche avant rejeu, préservation des apports, arbitrage limité, absence de seconde vérité, contrôles ciblés et clôture honnête. Ces simulations ne prouvent aucun verrou ou mécanisme de stockage réel.

## Évaluation initiale — 05/10/2026

Une instance distincte a traité huit scénarios fictifs ; ses réponses ont été relues dans la maintenance v1.3. Huit décisions conformes observées : recherche avant rejeu après réponse perdue ; réconciliation 7→8 avec préservation de l'apport concurrent ; arbitrage limité pour contradiction de mandat ; point temporaire non canonique ; intégration et accord réévalués après changement de cible ; arrêt sans promesse d'annulation ; réutilisation de preuves valides pour petit correctif ; écriture sensible suspendue sans contrôle effectif de concurrence.

Limite : une seule évaluation qualitative, avec cas annoncés et aucun stockage réel. Les mécanismes techniques et des variantes combinées non annoncées restent non éprouvés. Prochaine étape : matrice des outils, accès et contrôles nécessaires, sans attribuer une capacité avant vérification réelle.
