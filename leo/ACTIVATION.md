# Raccordement LV1 à Ultima — proposition d'activation

## Décision d'architecture

Réutiliser Vercel, `requireUser` et le Supabase existant. Le contrôleur Python
reste le banc de conformité fictif ; aucune base SQLite parallèle ne doit être
activée pour le produit. Le registre produit proposé est Postgres, sous les
droits de l'utilisateur réellement authentifié. Un nouveau serveur n'est pas
nécessaire pour cette première capacité. Les tests de code continuent dans les
conteneurs GitHub Actions ; leur orchestration depuis Léo reste à raccorder.

Cette décision remplace l'hypothèse antérieure d'un hôte Python permanent.
Elle résulte d'une relecture distincte de l'architecture existante le 29/09/2026.

## Changement concret préparé

- `api/leo-registre.js` : consultation d'une mission, écriture de son état et
  prochaine action, arrêt par le propriétaire. Identité vérifiée par
  `requireUser`, client Supabase sous identité utilisateur, aucun service role.
- `proposals/registre-postgres.sql` : registre, droits de lecture par mission,
  aucune mutation directe autorisée aux utilisateurs ; écritures transactionnelles
  via des fonctions bornées. Mandats, budgets et ACL initialisés administrativement,
  jamais par un champ de proposition du modèle.
- Les lecteurs habilités d'une mission ont un accès SELECT aux deux tables pour
  cette mission, incluant ACL et contenu technique des opérations. La projection
  RPC réduit les champs transmis, mais ne constitue pas une interdiction de
  lecture de ces champs par un lecteur habilité. Ne jamais y mettre de secrets.
- Les mêmes appels enregistrent effet, résultat, version et consommation de
  budget. En cas de réponse perdue, lecture ou rejeu du même identifiant retrouve
  le résultat sans nouvel effet. Un identifiant réutilisé avec autre contenu est
  refusé. Une opération inconnue ne donne pas permission de réexécuter.

Le périmètre est `memory` : aucun mail, migration, appel payant, fusion,
déploiement ou commande shell n'est accessible par cette route. Le budget compte
les écritures du registre, pas une facture fournisseur. Cette tranche n'est pas
la réception complète du contrôleur d'effets externes, de délégation ou de R21.

## Cible et préflight observés

Projet Supabase d'Ultima : `leosfqyidgsaescjbfom`, lu dans la configuration
publique existante. Une requête **strictement en lecture** le 29/09/2026 a
confirmé PostgreSQL 17.6 et l'absence du schéma `leo_private`, des tables
`public.leo_missions` / `public.leo_operations` et des trois fonctions RPC.
Aucune donnée métier ni valeur de secret n'a été lue pour ce contrôle.
Ces absences doivent être revérifiées juste avant toute installation.

## Activation réelle — pas encore autorisée

Le contrat canonique LV1 §7 et la compétence Léo LV1 classent une application
SQL/RLS sur la base métier réelle comme rouge. « Finir V1 » autorise la préparation
et ses tests, mais ne révise pas explicitement cet interdit. Avant application,
présenter à Paul le SQL exact, son commit, les tests et la revue indépendante ;
obtenir la révision du mandat pour cette installation précise. Ne pas activer
par déduction ni demander une réception globale à ce stade.

Le fichier est volontairement une **proposition**, hors du répertoire des
migrations appliquées. Après accord et préflight, générer la migration avec le
CLI, appliquer seulement le SQL relu, vérifier privilèges et advisors, puis
exécuter le parcours autorisé avec une mission d'épreuve appartenant à Paul.
La création de cette mission et ses limites devront être explicites ; aucune
mission réelle, délégation ou dépense n'est créée par la proposition SQL seule.

La publication de l'API requiert également un accord précis de livraison : le
merge pourrait publier Ultima, ce qui reste rouge dans le mandat actuel. Une
approbation SQL n'est pas une approbation de merge ou de publication.

## Retour arrière et limites

Avant activation, l'API répond fermé si le registre n'est pas installé. Après
installation, privilégier l'arrêt des missions puis la révocation des droits
EXECUTE des wrappers de mutation **et des deux implémentations privées**
`leo_private.write_memory_impl` et `leo_private.stop_impl`. Conserver la lecture
`leo_status`, les tables et les résultats pour consultation et réconciliation.
Ne pas supprimer une table contenant des opérations ou relancer une mutation
dont le résultat est inconnu. L'arrêt bloque les nouveaux effets sans effacer
les résultats déjà engagés. Les sauvegardes et la rétention suivent l'hébergement
existant et restent à vérifier avant réception opérationnelle.
