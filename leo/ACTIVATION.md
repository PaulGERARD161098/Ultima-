# Raccordement LV1 à Ultima — proposition d'activation

## Canal R21 depuis Work — préparation du 30/09/2026

**État : aucun canal d'accord réel installé.** Le banc `trial_host.py` ne sert
que sur loopback dans une isolation vérifiée. Les commandes `status`, `execute`,
`reconcile` et `stop` existent ; leur disponibilité locale dans la CI ne les
rend pas accessibles depuis Work. Le registre Postgres installé ci-dessous
porte la mémoire produit ; il n'accorde aucun pouvoir d'exécution R21.

### Option à vérifier : un job PR avec environnement protégé

Un lanceur temporaire GitHub Actions pourrait conserver l'isolation existante
et attendre un accord dans GitHub. Il n'est pas nécessaire d'ajouter un serveur
permanent. Un job déclenché par `pull_request` peut utiliser un environnement ;
la présence du workflow sur main n'est exigée que pour la variante
`workflow_dispatch`, pas pour toute solution R21.

Avant de retenir cette option, vérifier dans les réglages réels : environnement
préexistant, reviewer exact correspondant à Paul, propriétaire du mandat,
absence de bypass administrateur,
règles permettant le ref de cette PR, et séparation entre l'identité/droits
accessibles à Work et le pouvoir d'approuver. GitHub Free/Pro/Team ne proposent
les reviewers obligatoires que sur les dépôts publics. Ne pas publier le dépôt,
acheter un forfait ou désactiver une protection pour contourner un manque.

Une auto-revue interdite peut aussi empêcher Paul d'approuver si Work déclenche
le run sous le même compte. Une identité GitHub authentifiée ne prouve pas à
elle seule que l'accord vient de Paul hors du modèle. Le compte reviewer et les
droits effectifs de l'application doivent donc être attestés, pas inférés du
nom du dépôt. Un environnement nommé dans le YAML n'est pas une protection
démontrée ; aucun nouveau workflow d'exécution n'a été ajouté dans ce lot.

Le lanceur devra associer l'événement serveur d'approbation au run, à sa
tentative, au job, au code figé, au digest du paquet, au mandat encore valable,
à la preuve de revue indépendante, aux références fixture et à l'effet exact.
Il construira les autorités typées hors requête et hors archive. Ni commentaire,
ni texte de PR, ni argument `approved` fourni par le modèle n'en tient lieu.

### Arrêt, résultat et reprise : condition supplémentaire

L'option n'est recevable qu'avec un parcours utilisable pour les quatre
commandes sur le même état canonique. Annuler un run n'est pas l'arrêt
applicatif : la cancellation n'inscrit pas `budget_missions.stopped` et peut
interrompre l'export du résultat. Ne pas prétendre qu'elle annule un effet engagé.

Après l'effet fictif autorisé, conserver et vérifier un checkpoint incluant
registre, références Git modifiées, reçu, digest et provenance. Si sa sauvegarde
n'est pas confirmée, l'issue reste inconnue et aucun rejeu n'est permis. Une
nouvelle session Work doit retrouver le reçu de ce même effet ; reconstruire
ou fusionner une ancienne copie n'est pas une reprise recevable.

### Accès mesurés et prochaine action

Le 30/09, lecture de `main` et écriture de branche GitHub utilisables ; lecture
des protections de main refusée **403 Resource not accessible by integration**.
Le connecteur ne fournit pas l'administration des environnements, l'accord de
job, ni les commandes dispatch/cancel. Docker/Podman absents ; `unshare` refuse
uid_map (lecture seule), `bwrap` refuse la création de namespace. Aucun code
applicatif n'a été lancé hors isolation. La CI isolée demeure le moyen d'épreuve.

**Action minimale à autoriser : lecture seule via navigateur** des réglages
Actions/environnements, protections du dépôt et permissions effectives de
l'application GitHub. Aucun réglage, secret, accord de job ou fusion à modifier
pendant cette inspection. Cette permission est distincte de l'accord R21 exact.
Si l'option n'est pas disponible, choisir un autre canal temporaire de confiance
dans le mandat ; ne pas relancer des simulations pour remplacer ce raccord.

Sources officielles relues le 30/09 :
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments

Revue indépendante statique du canal : aucun adaptateur d'accord réel, aucun
checkpoint post-fusion ni reprise Work démontrés. R21 et réception globale
restent bloqués. Le dossier opérationnel est `REPRISE-2026-09-29-leo-lv1.md`.

## Installation autorisée et réalisée — 29/09/2026

Paul a autorisé explicitement l'installation du SQL présenté le 29/09 à
14 h 50 Paris (« Oui j'autorise »). La migration
`20260929125105_leo_lv1_registre_transactionnel` a ensuite été appliquée avec
succès sur `leosfqyidgsaescjbfom`, via le connecteur Supabase, après préflight
sans collision. Le fichier approuvé conserve son SHA-256
`c3931ae2bb84621469a68805e707d1375e48e33172f5bf8db8dd5cce893b0df3`.
La copie dans `supabase/migrations/20260929125105_leo_lv1_registre_transactionnel.sql`
reconstitue exactement cette migration déjà appliquée, avec le numéro réellement
retourné par son historique ; ce n'est pas une seconde application. Son commentaire
initial de brouillon est conservé comme partie de l'exemplaire approuvé.

Vérification sur la base réelle : deux tables présentes avec RLS active ; aucune
lecture anonyme, aucune écriture directe par authenticated, aucun privilège
service_role sur ces tables ; trois wrappers publics invoker et deux fonctions
internes definer, search_path vide et EXECUTE refusé à anon. Les deux politiques
SELECT correspondent aux ACL de mission. Un appel de statut sans identité a
été refusé dans une transaction READ ONLY terminée par ROLLBACK. Comptages :
zéro mission, zéro opération. Aucun parcours avec des données réelles n'a été lancé.

Le contrôle Security Advisors ne signale aucun défaut de ces nouveaux objets.
Il signale la protection des mots de passe compromis désactivée au niveau Auth,
hors modification de ce lot :
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
Aucun paramètre Auth n'a été changé.

Le registre est installé ; l'API demeure sur la branche de préparation. Cet accord
ne couvre ni fusion, ni publication, ni création de mission, ni nouveau budget
fournisseur. La réception complète LV1 et son parcours intégré restent ouverts.
Les sections suivantes conservent le dossier préparatoire ayant fondé cet accord.

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

### Version concrète proposée après épreuves

SQL proposé : `proposals/registre-postgres.sql` au commit
`1ac34512cd72f8d22b9f6e3bbbaee7529cd4fe22` ; SHA-256 du fichier
`c3931ae2bb84621469a68805e707d1375e48e33172f5bf8db8dd5cce893b0df3`.
Le périmètre d'accord demandé est l'installation de ce SQL seulement sur
`leosfqyidgsaescjbfom` : deux tables nouvelles, leurs index/RLS/grants, un schéma
privé avec deux fonctions internes et trois fonctions RPC publiques. Aucune
table métier existante n'est altérée ; aucune mission ni donnée métier n'est
créée par ce script. Ce n'est pas un accord de publication ou de fusion.

Épreuves reçues le 29/09/2026 à 13 h 56 Paris : run `36564708408`, source
`1ac34512cd72f8d22b9f6e3bbbaee7529cd4fe22`, cible
`fb7daac613a0828d4135333fbd27a47102323211`, intégration
`49f3b31c085db635e2356e3c9431305544df69d3`. Job `109393704339` : API et
PGlite verts ; job `109393704397` : deux connexions PostgreSQL 17 concurrentes,
un succès/un conflit, un seul effet et reprise sans doublon. Job `109393704277` :
55 tests Python verts. Revue indépendante statique sans bloqueur identifié
après correction de la cohérence du statut. Ces épreuves isolées ne prononcent
pas la réception globale du produit ni l'activation de ses effets externes.

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
