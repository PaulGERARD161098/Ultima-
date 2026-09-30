# Raccordement LV1 à Ultima — proposition d'activation

## Canal R21 depuis Work — préparation du 30/09/2026

**État : aucun canal d'accord réel installé.** Le banc `trial_host.py` ne sert
que sur loopback dans une isolation vérifiée. Les commandes `status`, `execute`,
`reconcile` et `stop` existent ; leur disponibilité locale dans la CI ne les
rend pas accessibles depuis Work. Le registre Postgres installé ci-dessous
porte la mémoire produit ; il n'accorde aucun pouvoir d'exécution R21.

### Diagnostic clos — captures de Paul et accès réels du 30/09/2026

- Captures fournies par Paul : dépôt privé ; environnements `copilot`,
  `Preview`, `Production` ; Preview sur `No restriction` sans option
  Required reviewers visible ; aucune protection classique ; offre
  **GitHub Team**, un siège utilisé sur un. L'API rulesets renvoie `[]`.
- L'application ChatGPT Codex Connector est installée pour tous les dépôts
  de l'organisation. Permissions affichées : checks/statuts/métadonnées en
  lecture ; Actions/code/issues/PR/workflows en lecture-écriture ; aucun
  droit Administration affiché. L'accès aux dépôts ne supprime pas le 403
  mesuré sur les protections.
- `get_user_login` retourne `paggerard-boop`, ID `277032273` ;
  rôle dépôt `admin`. PR306 et les runs issus de nos écritures portent ce
  même utilisateur. L'outil `add_review_to_pr` permet APPROVE/COMMENT.
  **Une identité native de revue de ce compte ne distingue donc pas à elle
  seule une validation humaine d'une action de Work.** Aucune revue publiée.
- Les approbations obligatoires d'environnement ne sont pas disponibles
  sur un dépôt privé sous Team. La piste ci-dessous est écartée pour la
  configuration actuelle. Les reviewers de PR et ceux d'environnement
  sont deux contrôles distincts. Aucun abonnement ou réglage modifié.
- La collecte manuelle par captures a remplacé l'inspection navigateur
  proposée. Aucun navigateur initialisé ; ne pas redemander la même collecte.
- Les trois workflows du commit documentaire `c462743` sont terminés
  success : Tests `36690374581`, LV1 `36690374620`, Auth `36690374628`.
  Aucun nouvel artefact de ce commit n'hérite de la revue R21 de
  `11084992584`. Les preuves techniques détaillées restent celles de
  `9833b80`.

### Autre canal à préparer — contrôle privé hors accès de Work

Proposition à éprouver, **aucun adaptateur ni dépôt de contrôle installé**.
Un dépôt privé de contrôle, par exemple `leo-control-r21`, pourrait rester
dans l'offre actuelle. Paul le créerait vide pour établir et vérifier son exclusion
de tous les accès de l'agent ; il importerait le kit seulement après sa préparation
et sa revue. L'application devrait
passer de All repositories à Only select repositories en conservant les dépôts
existants, avant création du dépôt de contrôle. Ce changement n'est pas fait.

L'exclusion doit être mesurée, pas supposée : refus effectif en lecture par
le connecteur, inventaire de tous les autres accès CLI/API/browser/instances,
absence de chemin alternatif d'écriture, de dispatch ou d'accès aux secrets.
Une simple règle « ne pas approuver » dans le prompt ne suffit pas.

Paul importe le lanceur revu et figé dans ce dépôt hors Work. Il déclenche
lui-même un `workflow_dispatch` de ce dépôt avec l'accord exact. Le hôte
associe l'événement serveur à son identité, au SHA du lanceur, au mandat,
aux expirations, au paquet exact, à sa revue et à la cible fixture avant de
construire `Binding/Approval`. Aucun champ `approved` du paquet ou
d'Ultima ne crée cette autorité. Le fait de partager le même nom de compte
n'est acceptable que si le chemin d'approbation est réellement inaccessible
aux identifiants et outils de Work.

Le contrôleur temporaire peut lire des propositions `status/execute/reconcile/stop`
dans Ultima depuis un accès séparé détenu uniquement côté contrôle. Le kit
doit préciser l'API, le protocole, les privilèges minimaux, les délais et les
bornes de coût ; aucun jeton ni configuration de secret n'est préparé ici.
L'applicatif reste dans l'isolation Docker fermée déjà éprouvée. Les quatre
commandes doivent agir sur un seul registre et un seul dépôt fixture.

La voie retour doit empêcher Work de fabriquer un reçu recevable : checkpoint
signé par une clé détenue uniquement côté contrôle, clé publique ancrée par Paul
hors requête, ou conservation vérifiable dans le dépôt exclu avec un transfert
humain attesté. Un simple fichier résultat écrit dans Ultima n'est pas suffisant.
Pour le premier pilote, privilégier un téléchargement puis transfert par Paul
du checkpoint signé, afin d'éviter un jeton d'écriture vers Ultima. Le hôte doit
tenir une séquence monotone et lier chaque checkpoint au précédent ; une ancienne
copie signée ne doit pas redevenir l'état courant. Les accès GitHub et clés de
signature restent dans le lanceur de confiance, jamais dans le conteneur
applicatif. Les propositions sont des données bornées, jamais des commandes shell.
Le choix et son protocole sont encore à implémenter et à éprouver.

La signature d'accord hors Work reste une autre option : clé privée uniquement
chez Paul, clé publique/propriétaire et code d'admission figés hors écritures
de l'agent. Une clé choisie par le paquet/proposition serait auto-approuvée.
Elle ne résout pas à elle seule l'hôte, l'arrêt ni la reprise.

**Prochaine action utile — fondation de confiance, Paul puis Léo :** après cette
proposition relue, limiter l'installation ChatGPT Codex Connector aux douze
dépôts existants en les conservant tous, puis créer un dépôt de contrôle privé
qui reste exclu. Cette fondation n'installe aucun lanceur, n'exécute aucun effet
et ne consomme pas de run. Les douze dépôts accessibles relus :
RenoAgenda, RenoBoost, artisan-builder, mon-dpe.fr, Wingman-, DATARENO-, Ultima-,
RenoPredict, RenoDevis, Renodevis-archive, renoboost-console, Artidispo.
Léo mesure ensuite l'exclusion et les autres accès possibles avant de retenir
ce canal et de construire le kit concret (admission, quatre commandes,
état canonique, arrêt, checkpoint, reprise). L'installation du kit sera proposée
après préparation et revue ; l'accord fictif exact viendra après revalidation
du transfert et du nouveau contexte.
Ni création du dépôt, exclusion d'application, secret, signature, dispatch,
effet fictif ni contrôle global des outils Work réalisés.

La capture de budget affiche Actions 25,33/30 USD, Stop usage:Yes ; c'est une
mesure de la page, pas un coût imputable à ce lot ni un budget nouveau accordé.
Aucun forfait ou plafond ne doit être relevé. Aucun nouveau run utile ne doit
être lancé sans cadrer sa consommation réelle et réutiliser les preuves existantes.

### Piste écartée pour la configuration actuelle : job PR avec environnement protégé

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

### Accès mesurés lors de la préparation initiale — avant les captures

Le 30/09, lecture de `main` et écriture de branche GitHub utilisables ; lecture
des protections de main refusée **403 Resource not accessible by integration**.
Le connecteur ne fournit pas l'administration des environnements, l'accord de
job, ni les commandes dispatch/cancel. Docker/Podman absents ; `unshare` refuse
uid_map (lecture seule), `bwrap` refuse la création de namespace. Aucun code
applicatif n'a été lancé hors isolation. La CI isolée demeure le moyen d'épreuve.

**Collecte initialement proposée, désormais résolue par les captures de Paul :**
lecture des réglages Actions/environnements, protections du dépôt et permissions
visibles de l'application GitHub. Aucun navigateur initialisé ni réglage modifié.
Ce diagnostic n'est pas un accord R21. L'option est indisponible sur ce dépôt privé
Team ; la prochaine action actuelle est le kit de contrôle séparé décrit plus haut.

Sources officielles relues le 30/09 :
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments

Revue indépendante de la variante contrôle privé : modèle recevable en principe,
sous exclusion complète, admission figée, secrets séparés, continuité et coût
bornés. Pas de bloqueur documentaire relevé. Aucun adaptateur d'accord réel, aucun
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
