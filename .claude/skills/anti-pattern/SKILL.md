---
name: anti-pattern
description: Toujours croiser plusieurs approches réellement différentes d'un même sujet, pour les calculs et méthodes de travail, cadrages, diagnostics et dry runs. Déclencher aussi sur rétrocadrage, erreur répétée, incohérence ou contrôle inverse.
---

# Anti-pattern — approches croisées

Lire `zohshia/anti-pattern/TECHNO.md` pour la méthode neutre, puis `zohshia/anti-pattern/MISE-EN-SERVICE.md` pour les critères de réception. Appliquer au minimum 2 points de vue pour tout sujet, 3 pour une tâche complexe, 4 pour un plan ou rétroplanning. Retenir le seuil le plus élevé si les catégories se cumulent. Pour planifier, examiner résultat/utilisateur, exécution/moyens, calendrier/dépendances et risques/marges de manœuvre. Réutiliser les six directives et les règles métier ; préciser unités, dénominateurs et conventions avant calcul. Pour une ambiguïté financière, charger la compétence comptable disponible.

Rétrocadrer depuis la preuve attendue, comparer les approches, qualifier les hypothèses communes et traiter les écarts avant la conclusion dépendante. Une reformulation ou un changement d'outil seul ne constitue pas une autre méthode. Un contrôle inverse ne valide pas la source des données. Signaler les contrôles manquants. Le collecteur du dossier reste un contrôle structurel déclaratif, sans valeur de certification métier.

Ne stocker aucune donnée client dans la technologie neutre. Ne modifier aucun droit et ne déduire aucune activation ou mise en ligne de la présence de cette compétence.

## Bibliothèque invocable

Lire `zohshia/anti-pattern/BIBLIOTHEQUE.md` pour l'index des 100 angles. Invoquer une fiche avec `python zohshia/anti-pattern/bibliotheque.py --id PDV-021`, un alias avec `--id marge`, une recherche avec `--search calendrier` et un pack avec `--pack retroplanning`. Adapter les packs au sujet sans diminuer les minima 2/3/4. Pour chaque angle, appliquer sa question, chercher sa preuve, qualifier le constat et la limite puis confronter les résultats. Sélectionner ne prouve pas l'analyse ; des IDs distincts ne garantissent pas un raisonnement différent. Les sources de recherche sont dans `zohshia/anti-pattern/sources-pdv.md`.
