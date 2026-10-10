# Raccordement LV1 à Ultima — proposition d'activation

## Recette cible cadrée — 10/10/2026, reprise à 18 h 11 Paris

Cette section est la reprise courante. Paul a choisi « serveur existant » ;
nom, fournisseur, système et accès opérateur restent NON VÉRIFIÉS. Aucun
serveur n'est connecté à Work pour cette recette ; ne pas confondre ce choix
avec une compatibilité mesurée. Les sections suivantes sont historiques.

But : établir la compatibilité de cet hôte, puis éprouver le kit figé comme
service ponctuel de lecture hors réseau dans une instance de recette dédiée,
avant toute installation métier. Moyens : kit CI existant, Docker/systemd de
l'hôte, état fictif séparé et registre de preuves ci-dessous. Aucun nouveau
service acheté, modèle facturé, mémoire concurrente ou dépendance applicative.
L'étape actuelle prépare le protocole ; aucune commande cible n'a été exécutée.

### Preuves désormais fermées

Source applicative : daba3ebf6a91522f02eab9fce3d93df5ebd137c6.
Les trois workflows sont réussis, relus à cette reprise :
LV1 38065281406, Auth 38065281403, Tests 38065281402.
294 tests runtime et 14 scénarios Docker réussis ; deux groupes navigateur
désormais réussis. La mention « navigateurs encore en cours » est périmée.

Kit exact :
https://github.com/PaulGERARD161098/Ultima-/actions/runs/38065281406/artifacts/11674652639
Expiration : 24/10/2026 15:52:50 UTC (17:52:50 Paris).
SHA256 du ZIP : 8a12036f2d2b32688b2a796558ae329d6af4798e300335d81dd5b27541294c3f.
SHA256 du read-service.tar.gz intérieur :
a376bd49f0b9cf91477edc43481ac19c3b131a38b4b0763c39d65621ae423235.
Installation figée : d52d53cd5d174544b6a2f73f39d34362.
Empreinte code : 7e86fb65a6260d2b94273ebd20a539a1b6fe0143f8f2d2e395c9e34affc60873.
approved=false, installed=false, autonomous_agent=false ; ces valeurs ne sont
pas des paramètres à basculer automatiquement lors de la copie.

### Étape 1 — identifier et observer l'hôte sans le modifier

Obtenir le nom du serveur dans le panneau fournisseur, sa distribution et
le mode d'accès opérateur déjà disponible. Aucune clé ou mot de passe en chat.
Exécuter seulement sur le serveur identifié, dans son terminal opérateur :

~~~sh
uname -srm
cat /proc/1/comm
systemctl --version
/usr/bin/python3 --version
/usr/bin/python3 -I -c 'import os; print("pidfd_api", hasattr(os, "pidfd_open"))'
~~~

Ces lectures ne prouvent pas les droits effectifs, le sandbox ou la disponibilité
de pidfd à l'exécution. Le transport utilise exactement PATH=/usr/bin:/bin, LANG=C.UTF-8 et HOME=/tmp,
sans hériter de DOCKER_HOST/DOCKER_CONTEXT. Un nom de contexte affiché dans
le shell habituel ne qualifie donc pas sa cible. Lire sa configuration locale
avec ce même environnement ; ne pas afficher une éventuelle URI distante.
Les requêtes suivantes ne sont permises que si l'endpoint effectif correspond
au socket local attendu. Ce préflight exige que la configuration Docker locale
reste stable entre qualification et lectures ; sinon suspendre.

~~~sh
if leo_docker_endpoint=$(/usr/bin/env -i PATH=/usr/bin:/bin LANG=C.UTF-8 HOME=/tmp /usr/bin/docker context inspect --format '{{.Endpoints.docker.Host}}' 2>/dev/null) && [ "$leo_docker_endpoint" = 'unix:///var/run/docker.sock' ]; then
  /usr/bin/env -i PATH=/usr/bin:/bin LANG=C.UTF-8 HOME=/tmp /usr/bin/docker version --format '{{.Server.Version}}'
  /usr/bin/env -i PATH=/usr/bin:/bin LANG=C.UTF-8 HOME=/tmp /usr/bin/docker info --format 'os={{.OSType}} arch={{.Architecture}} cgroup={{.CgroupVersion}}'
  systemctl is-active docker.service
else
  printf '%s\n' 'Cible Docker non qualifiee : suspendre sans modifier le contexte.'
fi
~~~

Une erreur de lecture ou un endpoint différent refuse ces requêtes : ni
changement de contexte, ni affichage des overrides/secrets du shell.

Critère : hôte Linux identifié, systemd réel en PID1, Python attendu disponible,
API pidfd puis mécanisme effectif à éprouver, Docker local disponible, image
épinglée compatible avec l'architecture. Absence ou erreur bloque uniquement
l'installation concernée ; pas d'installation implicite de dépendances,
changement de contexte, ajout au groupe Docker ou élévation silencieuse.

### Étape 2 — recette isolée et préparation opérateur

Préparer hors Work une VM/instance de recette dédiée utilisant les mêmes versions
que l'hôte cible. Les scénarios d'arrêt forcé ne s'exécutent pas sur la machine
métier ; aucun arrêt du daemon Docker partagé. Sans environnement réellement
isolé, ces essais restent bloqués, comme prévu par AGENTS.md et le contrat LV1.

Vérifier les deux empreintes avant extraction, inventorier les chemins de
l'archive avant copie, puis faire contrôler le code_digest et le modèle d'unité
par l'opérateur. Ne pas importer le dépôt privé depuis Work. Les 24 fichiers
du kit n'autorisent ni migration ni remplacement de contrôle existant.
Le bootstrap de l'état de recette doit être préparé et revu séparément :
le kit ne fournit pas de seed métier. Pas d'initialisation improvisée via CLI.

Chemins figés :
- code : /opt/leo-read/d52d53cd5d174544b6a2f73f39d34362/code ;
- configuration : /etc/leo-read/d52d53cd5d174544b6a2f73f39d34362/installation.json ;
- état de recette : /var/lib/leo-read/d52d53cd5d174544b6a2f73f39d34362.

Vérifier propriétaire et droits conformément aux validations du code :
configuration privée 0600 et son répertoire privé 0700 pour l'identité opérateur
attendue ; état privé existant, claims privés, staging visible par Docker.
Code et configuration non modifiables par le worker ; protections systemd
effectives à éprouver. UID opérateur distinct de 65534 ; accès Docker réservé
à l'opérateur, jamais au worker. Pas de socket Docker, contrôle, credential ou
montage supplémentaire dans le worker. Aucune approbation automatique.

L'opérateur devra fournir un mandat de recette minimal et une seule opération
figée, après revue de l'état fictif. Conserver Restart=no et l'absence de timer.
Ne pas activer au démarrage du serveur ni remplacer le pilote R21 completed.

### Étape 3 — grille de réception à remplir, pas déjà passée

| Cas sur instance isolée | Preuve exigée |
|---|---|
| Kit non approuvé | Refus avant création/démarrage ; aucun effet métier |
| Lecture nominale approuvée pour fixture | Un reçu completed, un effet fictif, aucun worker restant ; nouvelle tentative sans replay |
| SIGKILL propriétaire puis gardien (essais distincts) | Arrêt durable, nettoyage attribué au bon propriétaire ; unknown et réserve conservée si reçu absent |
| SIGKILL de tous les processus de l'unité de recette | ExecStopPost réellement exécuté par systemd ; worker absent par CID ET nom, voisin conservé, preuve .reaper cohérente |
| Docker indisponible simulé dans la seule instance de recette | Refus de preuve positive, arrêt conservé ; délai et raison relevés, intervention requise |
| Mauvais label, CID renommé ou configuration/code altéré | Refus sûr ; aucun conteneur tiers supprimé, aucune nouvelle opération |
| Réconciliation depuis processus neuf | completed retrouvé ou unknown maintenu selon reçu ; jamais de relance ni libération fictive de réserve |

Chaque scénario destructif sur fixture utilise une instance de recette neuve :
un seul claim par installation, aucun reset pour faire repasser un essai.
Le protocole d'initialisation et d'injection des fautes doit être préparé avant
exécution ; cette grille seule n'est pas un harnais exécutable.

Preuves conservées hors données métier : versions, date, SHA/empreintes,
cas joué, état systemd, CID attendu, absence observée, transition du journal,
réservation et témoin. Pas de snapshots, logs Docker bruts ou secrets en PR.
TimeoutStopSec=90 est une borne configurée du chemin d'arrêt, pas une preuve
mesurée d'arrêt global en 90 s : chronométrer chaque cas et qualifier les délais.
Un oneshot sans RemainAfterExit n'est pas attendu « active » après succès :
valider reçu, code de sortie et absence du worker plutôt qu'un voyant seul.

Références officielles consultées le 10/10/2026 :
https://github.com/systemd/systemd/blob/main/man/systemd.service.xml
(modèle oneshot et ExecStopPost). Vérifier la documentation correspondant à
la version réellement relevée sur l'hôte avant d'exécuter la recette.

### Hors périmètre, risques et sortie

Aucune fusion, installation privée, activation métier, dépense, migration,
reset/effacement d'état existant ou accès Work au contrôle exclu.
Risque principal : croire l'hôte compatible sans mesure, ou traiter les essais
Docker CI comme une preuve systemd réelle ; préflight et recette dédiée exigés.
Si VM ou daemon indisponibles, le nettoyage n'est pas garanti : arrêt inconnu
et traitement opérateur, jamais completed fabriqué ni autonomie annoncée.

Réception de ce jalon : identité cible confirmée + préflight mesuré + protocole
fixture/injections revu + tous les cas requis mesurés sur instance dédiée.
La réception LV1 entière, l'acquisition réelle, modèle/budget facturé et la
compatibilité skill1.4 restent distincts et non livrés.
Prochaine action unique : identifier le serveur existant et son accès console
afin de préparer le préflight ciblé. Aucun secret à transmettre.


## Kit de service FINUBAR préparé — 10/10/2026, accord à 17 h 25 Paris

Reprise courante : préparer la supervision extérieure au guardian et un kit
opérateur figé. Préparation sur PR365, aucun accès Work au contrôle exclu,
aucune fusion, installation, dépense ou activation.

Choix ZS : Linux/systemd comme référence accessible pour superviser un service
ponctuel hors de ses processus ; modules, latch, claims et builder existants
réutilisés, bibliothèque standard uniquement. Aucun hébergement actuel choisi
ou compatible vérifié, aucun coût de serveur inventé. Cette référence ne vaut
pas validation d'un hébergement permanent ni autonomie 24/7.

- Le guardian inscrit atomiquement le nom et le CID dans claim.container avant
  tout démarrage. Une création inconnue ne peut produire une preuve positive.
  Le conteneur reçoit un label d'appartenance figé ; aucun label choisi par worker.
- ReadReaper ne crée et ne démarre rien : tombstone STOP, CID enregistré,
  vérification CID/nom/label avant rm, absence CID ET nom après suppression.
  Conteneur renommé, label incorrect, erreur Docker et absence de registration
  refusent la preuve. Un seul claim par installation, inventaire limité à 16
  entrées ; commandes Docker bornées, aucun nettoyage général de la machine.
- La preuve .reaper ne remplace pas une ancienne attestation .watchdog. Elle
  ancre le CID enregistré ; reconcile_interrupted valide contexte/principal/
  writer et conserve unknown et budget réservé, sans replay ni faux completed.
- Builder existant : option --read-service, 24 fichiers figés dont modèle
  systemd ; code_digest, image et source/cible/intégration enregistrés.
  Configuration approved:false, revue et mission à fournir ; aucun registre
  initial/reset, aucun secret et aucun timer. Le kit pilote R21 legacy et son
  installation completed restent distincts et conservés.
- Unité préparée : Type=oneshot, Restart=no, KillMode=control-group,
  ExecStopPost=cleanup, TimeoutStopSec=90 ; code/configuration en lecture seule,
  état privé en écriture. PrivateTmp désactivé pour que Docker voie le staging.
  Hôte opérateur distinct de UID65534 worker ; accès Docker jamais au worker.
  CLI run/cleanup/reconcile fixe ; aucune identité ou proposition libre du worker.
- Seize tests runtime nouveaux préparés : dix reaper, quatre kit, deux
  réconciliation extérieure. Deux scénarios Docker ajoutés au relais fermé :
  SIGKILL du guardian ; puis destruction réelle de tout le helper contenant
  propriétaire ET guardian, worker Running constaté, nouveau helper indépendant
  lisant l'état privé conservé, suppression et reprise unknown sans doublon.
  Conteneur voisin préservé dans les deux. Quatorze scénarios préparés au total,
  dont le mutant connu de suppression ; résultats du nouveau SHA à mesurer.
- CI prépare une archive read-service.tar.gz séparée du kit pilote existant,
  après tests isolés, puis la conserve comme candidat uniquement.

Revue indépendante statique : favorable après correction du cas de création
inconnue et de la recherche par nom ; marqueur child-ready fragmenté traité
par buffer borné. AST et YAML vérifiés statiquement ; systemd-analyze verify réussi sur unité rendue
avec dépendance Docker factice (validation statique seulement). Aucun test
applicatif local.
Le gestionnaire systemd réel n'est pas éprouvé par le relais Docker : cette
recette sur la machine cible reste obligatoire, avec perte guardian/scope,
droits code/config/contrôle, reçu/reprise, Docker indisponible et arrêt borné.

État antérieur vérifié : f88889d6ad79b49b5f565db859f9b1814a5a1f1c, les trois
workflows LV138061650392/Auth38061650414/Tests38061650316 réussis ; 278 tests
runtime et 12 scénarios Docker réussis. Ne pas transférer cette preuve au
présent changement sans ses résultats.

Prochaine action : éprouver et conserver ce kit exact en CI, puis vérifier
l'hébergement opérateur et cadrer la recette cible avant toute installation.
Restent hors boucle : modèle/appels facturés, acquisition GitHub réelle,
identité opérateur authentifiée, compatibilité skill1.4 et réception LV1.
Une VM ou Docker indisponible ne peut être nettoyée par un service inexécutable.


## FINUBAR externe préparé — 10/10/2026, accord à 16 h 44 Paris

Cette section définit la reprise courante ; les jalons suivants sont historiques.
But : supprimer le worker hors réseau après SIGKILL du processus propriétaire,
puis reprendre le registre sans rejouer la mission. Préparation dans PR365
seulement ; dépôt privé de contrôle exclu, aucune installation ni activation.

- Le lanceur normal crée un guardian FINUBAR distinct, détaché par setsid.
  Identité du propriétaire épinglée par pidfd Linux, accusé prêt avant create.
  Seul le guardian détient DockerTransport : plan exact, une création et un
  démarrage, requêtes privées bornées ; aucun démarrage tardif par le propriétaire
  après sa mort. Pendant une commande Docker, la détection attend sa borne
  existante (15 s) ; les suppressions/observations ont aussi des bornes.
- Perte du propriétaire, échéance ou arrêt : pierre tombale durable existante
  avant nettoyage, sans attendre un verrou SQL. Fermeture du client, suppression
  et observation d'absence sont tentées indépendamment ; une erreur produit une
  preuve négative. Le fichier host-only claim.watchdog est une attestation de
  nettoyage atomique, PAS un reçu de mission ou un second registre.
- reconcile_interrupted recontrôle mandat, source, writer, contexte et preuve
  exacte : pending devient unknown ; unknown reste idempotent. Aucun résultat
  completed inventé et aucune réservation libérée. Reprise refusée après arrêt.
- Huit tests runtime du guardian et quatre de réconciliation ajoutés. Le relais
  Docker éprouve SIGKILL d'un propriétaire distinct du PID 1 du helper pendant
  qu'un enfant détaché tourne ; suppression réelle et conteneur voisin préservé.
  Cas négatif connu : neutraliser rm seulement dans la fixture doit laisser le
  worker réel vivant, produire une preuve false et empêcher la réconciliation.
  Le runner supprimera ensuite ce survivant fictif. Douze scénarios Docker
  préparés au total ; résultats du présent SHA encore à mesurer en CI isolée.
- ZS : réutilisation des modules, claims, latch et registres ; bibliothèque
  standard Python, primitives Linux et Docker existant, aucune dépendance
  additionnelle ni service acheté. Simplicité d'exploitation permanente encore
  à éprouver sur l'hébergement choisi.

Limites : Linux avec pidfd et hôte propriétaire mono-thread ; la perte du
guardian lui-même ou de toute sa cgroup/VM n'est pas couverte par cette boucle.
Un service externe et sa recette d'installation restent nécessaires pour cela.
Aucun modèle, accès GitHub vivant du worker, secret, identité opérateur réelle,
appel payant ou réception LV1. Le kit pilote existant n'inclut pas ce candidat.
Le contrat reste v1.1 et le runtime refuse toujours la compétence incompatible.

État antérieur mesuré : tête a4b28b0d28e1af1b135d77711322c9bf0775fc99,
CI LV138057628222, Tests38057628213 et Auth38057628230 réussies ;
266 tests runtime et dix scénarios Docker réussis. Ces preuves ne sont pas
automatiquement transférables au nouveau changement.
Prochaine action : mesurer le présent candidat en CI, puis préparer la
supervision du guardian et l'installation figée hors droits de Léo.


## Raccord Broker–lanceur préparé — 10/10/2026, accord à 15 h 46 Paris

Cette section définit la reprise courante ; les jalons ci-dessous restent
historiques. But : une mission de lecture hors réseau traverse les autorisations,
réservations et reçus existants avant de lancer le worker. Aucun nouveau moteur
ni registre : ReadBroker, MissionStore, BudgetLedger, ControlLatch et le lanceur
précédent sont réutilisés. Pas de service ou dépendance supplémentaire.

- ReadBroker reçoit une ReadLaunchConfig exacte fournie par l'hôte uniquement.
  Le worker ne choisit toujours que action/operation_id/expected_version ; pas
  de chemin, image, identité, empreinte, configuration ou autorité libre.
- Réserve avant begin_operation ; payload ancré à l'instantané, image, SHA256
  worker, limite temporelle et namespace de claims. Les claims host-only sont
  dérivés de mission/opération et restent une garde anti-rejeu, PAS un reçu.
- Admissions courtes sous ControlLatch puis transaction du registre commun
  avant create et start : mandat, version, identité/writer, source, opération
  pending et réservation exacte recontrôlés. Aucun verrou maintenu durant tout
  le worker ; le poll recontrôle stop global/mission, expiration et version.
- Résultat exact et suppression confirmée du conteneur avant complete_operation,
  puis settle. Si une réponse est perdue APRÈS commit du reçu, un nouvel hôte
  peut le retrouver et solder après stop, sans nouveau lancement. Si la preuve
  n'a pas été committée, pending/unknown garde la réserve et ne repart jamais.
  Ni le claim ni le rapport attendu ne fabriquent un completed manquant.
- 21 scénarios runtime préparés et quatre épreuves Docker de mission ajoutées
  au relais existant : nominal + reprise sans replay, réponse perdue après commit
  puis réconciliation après arrêt, arrêt d'une mission avec enfant réellement
  détaché (marqueur APRÈS setsid), budget nul sans create/start/claim/réservation.
  Dix scénarios Docker au total avec les six précédents. Une reprise d'un second
  hôte pendant poll doit voir pending, sans second départ ni consommation.

État mesuré du jalon précédent, SHA38b6d5747d57dacacceec49055dc89fa3cc92695 :
les trois workflows ont terminé avec succès ; runtime245tests et six scénarios
Docker réussis. Ne PAS transférer ces succès au nouveau SHA sans lecture CI.

Preuve actuelle avant publication : syntaxe AST valide, revue indépendante
statique favorable ; tests du raccord préparés, pas exécutés localement (Docker
absent). Le verdict mesuré sur le SHA final sera consigné dans la PR365.

Limites : fixture offline uniquement, pas d'identité externe réellement résolue,
GitHub live, modèle, appel facturé ou compatibilité skill1.4. Les lectures SQLite
peuvent attendre10s, create Docker15s ; le poll et l'échéance ne garantissent pas
un arrêt instantané entre appels bloquants. SIGKILL de l'hôte entier exige encore
un watchdog FINUBAR externe, non livré. Création incertaine : arrêt persistant et
réconciliation opérateur du nom réservé, jamais relance. Pas de kit installable
pour ce raccord, merge, installation/activation ni accès au contrôle exclu.
Ne pas réinitialiser le pilote completed ni toucher les archives.

Prochaine action après ces preuves : préparer le watchdog externe de l'instance
et sa réconciliation après disparition de l'hôte ; ensuite traiter explicitement
la compatibilité1.4 et les médiateurs GitHub/modèle avant toute mission réelle.


## Lanceur de lecture préparé — 10/10/2026, suite autorisée à 15 h 28 Paris

Cette section est l'état courant ; le candidat et les jalons précédents restent
historiques. Réutilisation de Docker, ControlLatch et de la CI existante, sans
nouveau service ni dépendance : ce choix réduit l'installation et l'exploitation.

- `read_launcher.py` ajoute une capacité hôte offline à usage unique : claim
  privé durable avant création, empreintes SHA256 revues obligatoires, copies
  figées dans un staging privé, commande create fermée, puis start du CID acquis.
- Deux montages RO uniquement côté worker ; réseau none, UID65534, root RO,
  caps retirées, no-new-privileges, PID/mémoire/CPU bornés et aucun log Docker.
- Délai worker <=120s (30s par défaut), collecte stdout <=49153 octets et stderr
  <=4096 octets ; appels de gestion Docker <=15s chacun, métadonnées <=8192
  octets par flux. Nettoyage a ses propres bornes ; le délai worker ne prétend
  pas borner toute la durée hôte à lui seul.
- Sortie comparée octet pour octet au rapport déterministe attendu et état
  Docker exited/code0 sans OOM contrôlé. Client arrêté puis conteneur supprimé
  et absence contrôlée avant succès. Un défaut de nettoyage inscrit l'arrêt.
- Une création sans CID certain refuse le succès et inscrit l'arrêt : aucun
  start ultérieur. Son nom reste dans le claim ; une création différée peut
  laisser un conteneur INERTE à réconcilier par l'opérateur, jamais rejoué.
- 17 scénarios runtime ajoutés (transport réel par pipes dans le bac isolé,
  anti-rejeu depuis hôte neuf, arrêt, timeout, limite, sortie forgée, erreurs de
  nettoyage et empreintes). Six scénarios Docker réels préparés : nominal,
  isolation, arrêt avec descendant passé en nouvelle session, timeout, sortie
  excessive et faux rapport. Le harnais CI fermé exécute l'application dans un
  helper isolé, sans socket ; le runner stdlib ne relaie qu'une commande exacte
  et un CID réservé. Aucun secret ou accès de production dans ces fixtures.

Preuves avant publication : syntaxe AST vérifiée ; revue indépendante favorable sur ce candidat offline et son harnais, après corrections.
Les tests n'ont PAS été exécutés localement (Docker absent). Lire le verdict CI
sur le SHA final dans la PR365 avant de déclarer cette boucle éprouvée.

Limites : lanceur offline autonome du Broker, pas encore un pipeline de mission
ni une admission métier ; claim != reçu métier. Pas de GitHub live, modèle,
credential runtime, facture ni compatibilité skill1.4. Arrêt après SIGKILL de
l'hôte entier nécessite un watchdog FINUBAR externe, non livré ici. Pas de kit
installable pour le nouveau lanceur, pas de modification du contrôle exclu,
pas de merge, installation ou activation ; ne pas réinitialiser le pilote completed.

Prochaine action après CI/revue : relier ce lanceur aux admissions/réservations
et reçus durables existants, puis définir la compatibilité1.4 avant raccord réel.


## Candidat de lecture inerte — 10/10/2026

Préparation autorisée par Paul à 15 h 05 Paris. Aucun accès au contrôle exclu,
aucun appel réseau/modèle, aucune installation ni fusion.

### Portée du candidat
- `read_candidate.py` étend Broker avec read_source sur un instantané fourni
  par l'hôte : Ultima seul, 1 à 20 PR sélectionnées, métadonnées explicites,
  32 Kio maximum. Aucun URL, chemin, secret ou autorité proposé par le worker.
- Réutilisation de MissionStore, BudgetLedger, Policy et ControlLatch :
  réserve avant dispatch, admission finale sous transaction, reçu durable,
  pas de rejeu pending/unknown, récupération d'un reçu completed après stop.
  Les unités sont fictives et NE représentent PAS un prix fournisseur.
- `read_worker.py` est un témoin déterministe hors réseau, pas un modèle Léo :
  instantané en lecture seule, sortie JSON bornée, texte PR traité comme données.
  `autonomous_agent:false`, `publication:false`, `environment:fixture`.
- WorkerPlan prépare une commande Docker figée : image par digest, réseau none,
  UID65534, root read-only, capacités retirées, deux fichiers RO seulement.
  Il ne lance RIEN. L'opérateur doit fournir des fichiers revus, immuables
  pendant le lancement et sans secrets ; chemins validés ne garantissent pas
  seuls leur contenu ni l'absence de remplacement concurrent.

### Preuves et limites
Revue statique indépendante /root/read_candidate_review : deux blocages trouvés
et corrigés (admission finale atomique, réconciliation après arrêt) ; verdict
favorable au candidat INERTE uniquement. Syntaxe AST vérifiée sans exécution.
15 scénarios de tests préparés dans la découverte runtime de la CI isolée
existante : reçu depuis hôte neuf, perte du checkpoint, stop, budget, identité,
versions, changement de snapshot, injection comme données, scope, bornes,
immutabilité et contrat de montages. Leur résultat doit être lu sur le SHA
publié ; cette section n'annonce aucun succès CI avant sa mesure.

Absents volontairement : lanceur réel de cette commande avec timeout mural,
collecte stdout bornée et kill du conteneur ; transport authentifié ; acquisition
GitHub réelle ; médiateur modèle ; accord/coût fournisseur ; compatibilité1.4.
Le candidat conserve le contrat1.1/skill1.0 et refuse une divergence : ne pas
changer seulement la constante pour annoncer compatibilité.
Pas de service permanent, aucune réception LV1 globale.
Les tests d'argv ne prouvent pas la séparation noyau ni un arrêt Docker actif.

### Prochaine boucle
Construire et éprouver le lanceur de confiance (deadline indépendante, sortie
bornée, kill du conteneur entier, perte du résultat et relecture durable), puis
les médiateurs GitHub/modèle avec credentials détenus hors worker et budget
opérateur chiffré. Les appels facturés restent bloqués jusqu'à accord précis.
Conserver l'installation fixture completed ; ne pas la réinitialiser.
La boucle status/prepare/execute du 10/10 est reçue par captures dans PR365 ;
reconcile cible et stop actif ne sont pas encore reçus.


## Incident opérateur du 08/10/2026 — installation arrêtée, correctif en préparation

Cette section remplace les prochaines actions d'installation historiques ci-dessous.
Paul a autorisé puis réalisé l'import et les dispatchs dans son navigateur ;
Work n'a ni lu ni modifié le dépôt de contrôle exclu. Les constats cible viennent
des captures de Paul, pas d'appels GitHub de Work au contrôle.

- Graine externe communiquée : `ba369884db05db6a4af321620e11790de61a2656`.
- Installation : `aaac8d9f565a47748a7e271408a49f76`, source
  `27664c7e9eb6d66be490cdf2fb8a6a064d51add2`, digest initial `b0d20c9de16f89db1d94f3d978ab72e2c99786f4a522e67030daa9b2221c2326`.
- `status` réussi ; `prepare` run `37845684569` terminé, séquence 2.
- `execute` run `37846177261` échoué : `R21 refused: ValueError`.
- `reconcile` réussi (capture 23 h 31 Paris) : préparation completed,
  exécution unknown, reçu null, phase unknown, séquence 4.
- Arrêt réussi (capture 23 h 37) : séquence 5, `stopped: true`,
  `stop_reason: owner_stop`, résultat unknown conservé. Cela prouve l'arrêt
  inscrit après l'échec, pas un arrêt d'un worker en cours ni la réussite R21.

Le code initial montait `/trial-output` en 1777 alors que le worker execute y
crée `control.sqlite` et que `assert_host_private` refuse un parent accessible
en écriture au groupe/autres ou détenu par un autre UID. Copilot a déclaré avoir
reproduit `control_permissions_unsafe` puis réussi après correction. Sa PR reste
ouverte selon Paul ; les captures du diff confirment le seul changement de
montage en `0700,uid=65534,gid=65534`, accompagné d'empreintes recalculées.
Le recalcul statique du kit fourni donne bien
`b12fc47067ae47b806a41b013ae1c070494848c46927d62a68dd85e52ae640c0`.

**Défaut de preuve identifié :** les tests worker utilisaient un parent créé par
TemporaryDirectory (privé), tandis que les appels Docker du host étaient simulés.
Le lanceur CI `tests/lancer-pilot-containers.py` compare désormais les argv
complets avec la fabrique de production dans un helper isolé. Il lance ensuite
prepare puis execute dans deux conteneurs neufs, exige le refus précis de
l'ancien montage 1777, et inspecte le checkpoint final dans un autre conteneur.
Le runner ne fait que stdlib/Docker/transport JSON borné ; imports applicatifs,
consentement synthétique et extraction restent dans des conteneurs sans réseau.
La CI doit encore établir le verdict du nouveau SHA avant toute réception.

**Ne pas fusionner la PR Copilot ni appliquer son re-seed en l'état.** Elle garde
l'identité et le source_sha anciens et remplace mécaniquement review.code_digest
sans nouvelle revue. Une nouvelle empreinte n'actualise pas l'attestation de
revue ni la preuve CI de la version précédente. Le fichier state.json sur main
est la graine historique, pas le registre courant de r21-state.

Le correctif source est préparé dans #365 ; aucune fusion ou installation.
Le générateur existant produit déjà de nouvelles identité/graine et une revue
vide : ne jamais remplacer ces champs par l'attestation de l'ancien kit.
**Le registre unknown/stopped actuel reste figé.** Aucun reset, changement
de R21_STATE_SEED ou nouvel execute n'est autorisé par ce correctif.
La procédure de succession d'installations avec conservation de l'ancienne
ancre et validation opérateur est encore à préparer et à revoir ; le runtime
actuel ne comporte aucun réarmement. Un nouveau candidat inerte n'est pas
une autorisation de l'installer dans un contrôle déjà utilisé.

## Kit candidat du 08/10/2026 — pilote déterministe, installation non autorisée

Mandat complémentaire de Paul : « ok vasy », préparation exécutable et recette
isolée. Base de code reprise : `5848ea99668ec8a901e746e2bed1d628241fb22f`.
PR361 a depuis été fusionnée ; ses changements et ceux de Claude sont préservés.
Une seule PR de travail : #365, toujours brouillon, sans fusion.

### Boucle et portée

- But : livrer un kit exécutable de fixture avec réserve durable, reçu réutilisé,
  arrêt prioritaire et refus de toute relance après résultat inconnu.
- Étapes : architecture et revue distincte → code → recette CI isolée → archive
  candidate → dossier opérateur ; aucune installation dans le contrôle exclu.
- Moyens : modules `leo/control_r21/pilot_*.py`, deux modèles `.yml.in`, tests
  `tests/runtime/test_pilot_*.py`, workflow CI LV1 existant. Réutilisation de
  `trial`, `trial_resume`, `Broker`, budget, fixture Git et verrou FINUBAR.
- Critère : arrêt conservé face à une finalisation concurrente ; un seul départ
  après CAS ; retour du même reçu après réponse perdue ; résultat perdu avant
  checkpoint = `unknown`, sans rejeu ; identité/contexte/anciennes copies refusés.
- Limites : recette déterministe legacy contrat1.1/runtime-skill1.0, pas un
  modèle Léo1.4. Pas de secrets, réseau ou données métier dans le worker.
  Pas de nouvelle dépense autorisée, fusion, import, dispatch R21 ni activation.
- Pré-mortem : arrêt coincé en file → workflow distinct sans groupe concurrency ;
  double admission → nonce de mutation et lease distincts + CAS non forcé ;
  copie d'ancien registre → ancre distante, parent/sequence et transitions
  monotones ; host perdu → deadline PID1 dans le conteneur ; résultat non sauvé
  → `unknown` bloquant, jamais succès inventé.

### Ce que contient le candidat

| Élément | Comportement |
|---|---|
| `pilot_state.py` | Une préparation et une exécution par installation. Réserve avant départ, reçus durables, résultat incertain non rejouable. Arrêt monotone sans réarmement. |
| `pilot_host.py` | Hôte futur seul détenteur du jeton éphémère Actions. Vérifie événement, acteur numérique, dépôt privé, branche, première tentative, code et revue ancrés. Lit la ref courante `r21-state`, valide la chaîne depuis la graine opérateur et met à jour sans force. |
| `pilot_worker.py` | Recette fixe en conteneur sans réseau/capacités/secrets, UID65534, racine/code en lecture seule, mémoire/CPU/PID et durée limités. Rejoue l'oracle connu rouge/vert avant le seul effet `update_fixture_ref`. |
| `pilot_build.py` | Produit hors réseau l'archive `pilot.tar.gz` : arborescence future `main/`, graine future `r21-state/`, image figée par digest. Revue laissée vide : candidat inerte par défaut. |
| Modèles Actions | Dispatch manuel uniquement. `status`, `prepare`, `execute`, `reconcile` d'un côté ; arrêt séparé. Aucun cron, agent permanent ou accès aux dépôts métier. |

La nouvelle admission distante enveloppe la recette existante ; elle ne remplace
pas le protocole HTTP de `AdmissionHost`, qui reste disponible pour un futur
agent. Broker, registres et worker déterministe partagent ici le conteneur :
**ce n'est pas une séparation de droits suffisante pour un agent non fiable**.

Le consentement saisi par Paul porte sur l'empreinte complète du paquet, le
contexte Git exact, l'opération, l'expiration, l'installation et la revue.
`proofs.review=pending` et les inspections synthétiques restent inchangés ;
seule une revue extérieure de la recette ET du lanceur exacts peut fournir
la preuve indépendante ancrée lors de l'installation.

### Installation future, préparée mais non exécutée

1. Recevoir la recette CI de la version exacte et télécharger son artefact
   privé `leo-pilot-candidate-<SHA>`. Vérifier l'empreinte du fichier au journal CI.
2. Faire approuver le contenu exact et vérifier hors Work l'exclusion des voies
   permettant à Léo de modifier le contrôle. Le seul numéro d'acteur GitHub
   n'est pas une preuve qu'un humain était derrière l'événement.
3. Dans le contrôle privé, importer les fichiers de `main/` sur `main`, et
   **seulement** `r21-state/state.json` à la racine d'une branche `r21-state`.
   Ne jamais remplacer une installation existante ni initialiser après perte.
4. Ancrer la revue indépendante (`location`, `reviewer`, date réelle et digest
   exact) dans `pilot-installation.json`. Fixer la variable Actions non secrète
   `R21_STATE_SEED` au SHA du commit initial de la branche d'état.
   Refuser suppression/force-push des branches ; droits Actions limités au
   contrôle. Aucun secret permanent supplémentaire n'est prévu.
   Garder `main`, la configuration et cette variable figés pendant le pilote ;
   aucun redéploiement concurrent du contrôle n'est reçu par cette recette.
5. Après autorisation distincte de la recette cible : `status`, `prepare`, lecture
   du contexte affiché, puis `execute` avec le `context_digest` exact. Depuis un
   nouveau job, `reconcile` retourne le reçu conservé, sans nouveau worker.
6. Éprouver `R21 durable stop` pendant une exécution autorisée, constater arrêt
   distant et terminaison du conteneur, puis refus d'un nouveau départ.

Le stop distant peut attendre l'attribution d'un runner GitHub. Dès qu'il est
inscrit, le host le sonde et tue le conteneur entier ; une deadline interne
115s (+2s de kill) reste indépendante des lectures réseau. L'arrêt ne défait
pas un effet déjà engagé. Une perte du runner avant checkpoint laisse
`running/unknown` : ce pilote refuse la répétition et ne prétend pas retrouver
un reçu disparu. `reconcile` est une relecture, pas une réparation aveugle.

L'ancre est la ref GitHub courante d'un dépôt exclu et de confiance. Le pilote
détecte une ancienne copie réintroduite dans un nouveau commit ; il ne peut pas
prouver l'absence d'un rollback forcé par l'opérateur lui-même. Il n'utilise pas
de HMAC présenté à tort comme signature vérifiable par Work. La réception R21
complète, la compatibilité skill1.4, l'identité propre à Léo et son service
permanent restent des travaux distincts.

**Preuve de livraison :** revue statique indépendante et tests dans le conteneur
CI uniquement. Relever les contrôles et l’artefact attachés au SHA exact de #365 ;
le relevé daté de réception du candidat est dans la reprise courante et la PR.
Aucun test applicatif local, accès au contrôle ou workflow manuel exécuté.
La première version fc7d343 a passé 211 tests runtime (45 nouveaux) dans le
run37811920873 ; ce résultat ne vaut pas automatiquement pour une version suivante.

## Raccord réel — diagnostic et dossier opérateur du 08/10/2026

**État : diagnostic fermé, raccord non installé dans le périmètre observable.**
Mandat de Paul : « ok go » après l'état des lieux du 08/10, pour vérifier
l'environnement réel et préparer le raccord. Cette section est la reprise
opérationnelle ; les sections datées qui suivent conservent leur valeur historique.
Base relue : `8485ed5e0ccee72f94c28ba4c67bc62c5c36e8cd` (`main`, 08/10).
Contrat : §11 LV1 v1.1. **Complément observé à 18 h 07 Paris : le dépôt de
contrôle cible est vide**, d'après la capture fournie par Paul ; voir le relevé
ci-dessous. Aucune conclusion n'est tirée sur un éventuel autre hôte.

### Boucle cadrée et critère de sortie

- **But :** identifier où le raccord s'arrête et préparer l'installation minimale
  réutilisant l'admission, le journal et la garde existants.
- **Étapes :** versions et travaux concurrents → lecture des voies d'exécution →
  séparation mesuré/non vérifié → dossier opérateur → revue distincte.
- **Moyens :** GitHub en lecture, sources à SHA fixé, métadonnées des installations,
  vérifications système sans exécution de code du dépôt. Deux documents existants
  seulement sont modifiés : celui-ci et `REPRISE-2026-09-29-leo-lv1.md`.
- **Réussite de cette boucle :** chaque composant a un état, une preuve et une
  sortie attendue ; l'unique information extérieure indispensable est nommée.
  Une mission réelle, son arrêt et sa reprise restent des critères du raccord futur.
- **Hors périmètre :** import/lecture du contrôle exclu, activation, workflow R21
  manuel, fusion, secret, migration réelle, achat, envoi et changement de droits.
- **Pré-mortem :** confondre site et runtime → chemins de déploiement relus ;
  recopier une installation extérieure existante → relevé hors Work préalable ;
  restaurer un ancien arrêt → ancre extérieure obligatoire ; écraser Claude →
  branche distincte, agrégats et PR351/361/364 conservés.

### Ce qui est effectivement raccordé

| Pièce | Mesure au 08/10 | Conséquence |
|---|---|---|
| Produit web | Production Vercel `READY` sur `8485ed5`, déploiement `dpl_Db8rNRCoaA4nbaEHrfoy8yUQXReu`. Base Ultima : 2 traces ordonnées `tentee → reussie → defaite`, outil `proposer_idee`, dernière fin le 06/10 à 12:00:07 UTC ; 0 ligne dans `leo_missions` et `leo_operations`. Lecture SQL agrégée, pas nouvelle action réelle. | Journal de deux cycles web capture/défaire ; aucune preuve de missions LV1 continues. |
| Code intégré | #353 fusionnée en `560ad78`, #354 en `4519249`. Trois workflows PR de la source #354 `84f5283` terminés avec succès : `37453552018`, `37453551697`, `37453551716`. | Ne pas rouvrir leur fusion. Ces tests ne prouvent pas une installation. |
| Déploiement du runtime | `.vercelignore` exclut `/leo/` et `finubar/`. `vercel.json` ne déclare que les deux horaires du mail Finubar. | Le déploiement du site n'installe pas le contrôleur Python. Les crons existants sont préservés. |
| Hôte préparé | `TrialHost` et son serveur restent sur loopback ; `AdmissionHost` restitue `environment: fixture`. L'intégrateur fournit les `Binding` et `Approval`. | Admission et anti-rejeu existent ; aucun service distant authentifié ni accord humain réel n'est installé par ces modules. |
| Fondation PR351 | Toujours brouillon ouverte, source `8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448`. Son workflow propose `ubuntu-latest`, mais son unique étape finit en `exit 1` ; `runner.py` lève `SystemExit`. | Kit volontairement inerte, pas panne à contourner. Ces fichiers sont lus dans PR351, pas présentés comme déjà sur `main`. |
| FINUBAR contrôle | `leo_control.py` et `leo_process.py` préparent verrou global et arrêt des processus. Aucun `leo/control_r21/checkpoint.py` dans l'arbre Git complet à la base relue (671 entrées, `truncated: false`). | L'enceinte noyau et l'ancre de reprise restent à installer/construire ; une simulation ne les reçoit pas. |
| Identité et accès Work | Connecteur sous `paggerard-boop`. Installation organisation `160835885` : sélection de 12 dépôts ; personnelle `163434661` : 2 dépôts, mode `all`. Pagination suivante vide dans les deux cas ; contrôle absent des listes. | Exclusion de ce connecteur reconstatée. Ni identité GitHub propre à Léo, ni exclusion de toutes les autres voies ne sont prouvées. Aucun accès direct au contrôle tenté. |
| Limites de visibilité | Endpoints Actions runners/workflows non pris en charge par le connecteur (400). Work : PID1 `supervisord`, cgroup non inscriptible, pas de runtime systemd ; Docker/Podman absents du PATH. Git HTTPS ne dispose pas d'authentification utilisable sur Ultima. | Pas de conclusion d'absence de runner distant. Ce terminal n'est pas désigné hôte de confiance et n'est pas utilisé pour exécuter le runtime. |
| Versions | Compétence Work lue : 1.4 ; `leo/runtime/policy.py` attend 1.0 ; contrat 1.1. | Divergence connue D1, encore présente. Aucun mandat 1.4 soumis, aucune constante relevée pour obtenir un succès artificiel. |
| Fraîcheur | Agrégat servi `api/_lib/finubar-macro.mjs` daté du 04/10 ; PR361 d'actualisation toujours ouverte. | Les travaux de Claude sont préservés ; cette boucle ne recollecte ni ne remplace les agrégats. |

### Cible proposée et composants du raccord

**Réutiliser la cible GitHub Actions temporaire déjà prévue par PR351**, dans le
contrôle exclu. Aucun VPS ni abonnement nouveau n'est proposé. Ce choix reste
conditionné à la preuve de faisabilité du stockage, de l'ancre et de l'arrêt ;
une étiquette `ubuntu-latest` n'est pas une preuve de runner installé ou accessible.
Le premier pilote reste une fixture sans accès aux dépôts métier ni API payante.

| Lot | Entrée et moyen réutilisé | Sortie nécessaire avant le suivant | Responsable |
|---|---|---|---|
| 0. Réconcilier l'installation extérieure | Captures de Paul le 08/10 : page Actions de création, puis onglet Code affichant « Quick setup » d'un dépôt vide. | Fermé pour le dépôt cible : emplacement privé créé, aucun kit installé dans ce dépôt. État d'un autre hôte éventuel non établi. | Relevé Paul reçu, lu dans Work |
| 1. Lanceur et identités | Source revue/figée ; `AdmissionHost`, `TrialHost`, `ProcessSupervisor` ; contrôleur détenu par l'opérateur, code Léo dans un conteneur distinct. | Commande fixe ; code/contrôle en lecture seule pour Léo ; UID, capacités, réseau, cgroup et limites vérifiés ; FINUBAR peut arrêter tous les descendants du conteneur/cgroup. | Préparation Léo ; installation opérateur |
| 2. État durable et ancre | Registres existants (mission/budget, arrêt global, journal de transport) ; stockage privé à désigner avec son propriétaire et ses droits. | Conservation atomique et retour du reçu entre jobs ; état manquant refusé ; restauration d'une ancienne copie refusée par une ancre extérieure courante. | Choix opérateur puis préparation Léo |
| 3. Accord exact | Événement humain authentifié hors Work, code figé qui résout l'autorité ; contexte source/cible/intégration, opération, expiration. | Accord lié aux versions, utilisable une seule fois ; mauvais acteur/contexte/accord expiré refusés. Aucun `approved: true` ni manifeste auto-approuvant. | Préparation Léo ; accord Paul |
| 4. Réception sur hôte réel | Kit revu, mandat frais et données fictives ; transport privé choisi et sortie bornée. | Cycle complet, panne après effet sans doublon, arrêt durable après redémarrage, refus de modification du contrôle, puis reprise depuis une session neuve. | Léo + revue distincte + Paul |

Les lots 1 à 3 restent un raccord à concevoir puis éprouver, **pas un kit livré**.
Ne pas rendre le snapshot PR351 exécutable en retirant seulement son `exit 1`.
Le contrôle système (UID/cgroup) est distinct de l'identité GitHub E1 : une fixture
sans accès métier ne reçoit pas la future identité d'exécution sur les vrais dépôts.

**Trou décisif entre deux jobs :** le workspace éphémère et un artefact restauré
ne garantissent ni la persistance de l'arrêt ni l'absence de rollback. Le choix
du stockage courant et de son ancre précède le code de checkpoint. Il faut également
un arrêt accessible à Paul pendant le job ; une simple annulation GitHub ne prouve
pas l'enregistrement durable de cet arrêt. Aucune clé n'est demandée dans le chat.

### Relevé extérieur reçu — 08/10/2026, 18 h 07 Paris

Paul a fourni deux captures, lues visuellement dans cette session :
- `image(20261008-160425).png`, à 18 h 04 : `actions/new`, « Get started
  with GitHub Actions ». Cette page de création seule ne prouvait pas que le
  dépôt était vide.
- `image(20261008-160726).png`, à 18 h 07 : onglet **Code** du dépôt exact
  `PaulGERARD161098/leo-control-r21`, badge **Private**, panneau **Quick setup**
  et invitations à créer/téléverser le premier fichier. C'est l'écran de dépôt
  vide, sans arborescence ni commit présentés.

**Conclusion sur cette cible :** le dépôt privé est créé ; le kit de contrôle
n'y est pas installé. Le blocage « capture/relevé attendu de Paul » est levé.
Aucune nouvelle capture ni réouverture d'accès Work n'est nécessaire pour ce
diagnostic. Les captures restent hors du dépôt ; seuls leurs noms et constats
minimaux sont consignés. L'existence d'un autre hôte extérieur n'est pas déduite.

La suite est la préparation dans Ultima d'un kit exécutable revu, réutilisant
les briques existantes et traitant les lots 1 à 3. Le simple squelette PR351
ne doit pas être importé comme un kit complet. Le dépôt cible vide ne lève
aucun interdit d'import, de déclenchement ou d'activation.

### Clôture et calendrier

Revue indépendante de lecture réalisée par une instance distincte : favorable
au dossier préparatoire ; elle confirme la séparation site/runtime et les trous
d'admission réelle, de persistance et d'ancre. Aucun test applicatif exécuté dans
cette boucle documentaire. La revue précède les captures reçues à 18 h 04/18 h 07 ;
leur interprétation a été ajoutée par le fil principal. Le relevé est désormais
reçu ; la réception reste ouverte, sans nouvelle demande de budget.

L'objectif historique du 16/10 **n'est plus confirmé** : ses prérequis du 05–08/10
ne sont pas reçus. Le lot 0 est maintenant fermé sur la cible ; recaler le planning
sur le travail de raccord restant, sans raccourcir la recette.
Prochaine action unique : préparer le kit d'exécution bornée dans Ultima, avec
choix explicite de l'état durable et de l'ancre avant le code de reprise ; revue
et preuves sur fixture avant toute installation autorisée hors Work.

---

## Correctifs de l'audit indépendant — 06/10/2026

But : que l'arrêt FINUBAR soit écrit à coup sûr, global, impossible à lever
seul et à la main de Paul. Constats, preuves et restes : `AUDIT-2026-10-05-leo-finubar.md`
(source unique ; ce paragraphe l'indexe, il ne la recopie pas).

Fait sur cette branche, sans activation : cibles de contrôle canonicalisées ;
arrêt tenté sur les deux registres et pierre tombale `<verrou>.stopped` posée
avant SQLite (rollback du fichier sans effet) ; marqueur `.installed`
interdisant toute réinitialisation ; UID et modes du verrou vérifiés ;
`owner_stop` (Paul arrête mission + verrou global, sans pouvoir exécuter) ;
stop jamais bloqué par le journal plein ; verrou global obligatoire pour tout
effet du Broker et toute délégation ; états « approuvé/fusionné » réservés au
propriétaire ; superviseur subreaper (aucun descendant ne survit au lancement),
PDEATHSIG, core=0, descripteurs ≤ 256.

Ne change pas : installation bloquée tant qu'un cgroup tué en bloc par FINUBAR,
une identité distincte pour Léo, une ancre extérieure et un canal d'accord
humain (A1) ne sont pas reçus. Le SQL C11 est une proposition non appliquée.

## Supervision des processus FINUBAR — préparation du 05/10/2026

But : préparer l’arrêt d’un processus engagé après une tentative d’auto-contrôle. `finubar/leo_process.py` prépare un superviseur hôte à commande fixe : aucun argument fourni par Léo, environnement minimal sans variables héritées, stdin/sorties fermés, une utilisation sans rejeu implicite dans la même instance. La configuration appartient exclusivement à l’hôte de confiance. Aucun canal produit n’est activé ou raccordé automatiquement par ce module.

Étapes et moyens : admission sous le verrou global, attente SQLite bornée et deadline revalidée avant Popen ; relâcher le verrou dès le départ pour que FINUBAR puisse inscrire l’arrêt pendant le processus ; surveiller le même verrou en lecture sans attente SQLite. Perte du contrôle ou délai atteint = interruption. TERM puis KILL du groupe POSIX, y compris si le parent est sorti. Le PID du parent n’est pas réapprêté avant le dernier signal pour éviter de viser un groupe étranger après recyclage. Le reçu décrit uniquement la fin du processus : tout effet métier demeure inconnu jusqu’à réconciliation par le journal canonique. La prévention durable des doublons reste celle du raccord/journal, pas le booléen d’une instance.

Réussite à mesurer en CI : arrêt avant départ sans marqueur ; deadline expiré avant départ sans Popen ; parent et enfant ignorant TERM arrêtés ; perte du contrôle interrompant l’exécution ; délai borné ; parent sorti avec enfant restant nettoyé ; absence de variables secrètes héritées ; mauvais paramètres refusés ; superviseur installé readonly. Aucun test applicatif local. La préparation et sa revue ne valent pas exécution réussie : résultats du SHA courant à consigner dans la PR353.

Hors périmètre : installation dans le contrôle exclu, identité réelle, activation, fusion, checkpoint signé et nouveau budget. Le groupe POSIX n’est PAS un sandbox : un enfant hostile peut changer de session ou viser le superviseur sous le même UID. Installation bloquée tant qu’un conteneur/cgroup contrôlé uniquement par FINUBAR et une séparation des identités n’empêchent pas ces contournements. Ce composant n’autorise aucun code non éprouvé sur un hôte avec accès réels. Il ne prouve pas un contrôle des outils Work, ni l’arrêt d’un processus noyau non interruptible.

Pré-mortem : signal ignoré -> KILL ; parent sorti trop tôt -> nettoyage du groupe sans recyclage du PID ; contrôle indisponible -> arrêt fermé ; arrêt supprimant un résultat -> aucun effacement ni reçu métier fabriqué, réconciliation obligatoire ; fuite d’environnement -> environnement minimal. Une interruption n’annule pas un effet déjà engagé. Tous les canaux d’effet et l’arrêt noyau de l’hôte extérieur restent à éprouver.

## Raccord Ultima et arrêt FINUBAR — préparation du 05/10/2026

Mandat courant de Paul : préparer le raccord, vérifier que l'environnement
ne peut pas modifier son contrôle, et ajouter à FINUBAR la détection/arrêt
d'une tentative d'auto-contrôle. Cette demande étend la fonction historique
d'index de FINUBAR ; elle n'autorise pas Léo à devenir son propre contrôleur.

**Code préparé :** `AdmissionHost` raccorde les six champs du protocole à
l'identité/ACL et aux opérations existantes de `TrialHost`. Mission et
opération sont confrontées au binding hôte ; version attendue vérifiée.
Le client six champs est distinct du client historique de fixture.
Le journal durable transporte uniquement request_id/empreinte/résultat :
même demande = reçu ; contenu différent = refus ; interruption = inconnu,
réconciliation sans rejeu. Aucun nouveau registre de mission.

**FINUBAR :** `finubar/leo_control.py` ajoute la garde hôte. Une tentative
d'auto-approbation, de désactivation/réarmement ou de mutation de la cible de
contrôle déclenche l'arrêt persistant de la mission ET le verrou global
`ControlLatch`. Toutes les missions raccordées doivent partager le même
verrou externe, y compris sur des registres de mission distincts.
Le nouveau raccord refuse de démarrer sans ce verrou ; aucune commande de
reset n'est offerte au modèle. Les chemins protégés désignent l'installation
effective, pas les brouillons autorisés dans Ultima.

Le verrou global est conservé pendant l'admission/l'effet borné : un arrêt
attend les effets déjà engagés puis interdit les nouveaux départs. L'arrêt
n'annule pas un effet engagé ; le lanceur doit borner/arrêter les processus
qui échappent au canal. Le broker mémoire relit arrêt, budget et mandat sous
le verrou de mutation, comme le merge fictif. Lecture et réconciliation
restent possibles ; aucune reprise ne déduit un droit d'exécution.

Le provisionnement initial du verrou/journal est une opération explicite
de l'hôte. En ouverture runtime, fichier/table/ligne de contrôle manquants
refusés, sans recréation ni réarmement automatique.
**Non installé :** hôte exclu, ancrage signé et courant des checkpoints,
identité/accord réel, accès provider et déclencheurs. Le journal local ne
prouve pas une reprise depuis un checkpoint importé.

### Vérification de cet environnement

- Révocation du connecteur organisation précédemment mesurée : contrôle
  absent des 12 dépôts autorisés ; lecture Ultima disponible.
- Le navigateur Work restait connecté au compte propriétaire et exposait
  les réglages d'installation. Cette voie a été fermée par déconnexion
  du seul compte GitHub dans le navigateur Work ; retour aux réglages =
  page « Sign in to GitHub ». Aucun réglage du dépôt de contrôle modifié,
  aucun contenu ni secret lu, aucune réauthentification entreprise.
- Terminal courant : git disponible ; gh, Docker et Podman non trouvés.
  Aucune recherche de valeur secrète/credential effectuée. La présence de
  git ne démontre pas à elle seule l'absence d'une autre authentification.
- Le futur hôte d'exécution exclu n'est pas installé ni observable ici :
  impossibilité globale de modifier son contrôle **non certifiée**.
  Aucun test d'écriture dans le contrôle n'est tenté pour contourner la révocation.

### Épreuve et réception de ce lot

Moyens : workflow pull_request existant, Python/Git en Docker sans réseau,
sources readonly, seul module FINUBAR de garde ajouté au montage Python ;
pas de montage de l'agrégat métier. Aucun test applicatif local.
Revue indépendante demandée ; observations corrigées : course arrêt/mémoire,
arrêt limité à une mission, client ancien incompatible, réarmement implicite
après perte du contrôle, expiration du mandat avant mutation mémoire.

Cas de sortie : HTTP client→admission→hôte→broker sur fixture ; faux compte,
mauvais contexte/version, doublon/concurrence, réponse perdue, coupure après
effet, arrêt puis refus de départ ; arrêt global entre deux missions,
fichier/ligne manquants refusés, témoin de garde retirée détecté.
Résultats CI à mesurer sur le nouveau SHA, sans transposer les 104 tests
historiques à cette tranche.

**Avant/après :** ancien hôte à une commande et arrêt de mission ; raccord
six champs, journal durable et arrêt global hôte préparés. Aucun contrôle
des outils Work ou arrêt de processus permanent n'est reçu par ces fixtures.

Activation bloquée tant que le contrôle/journal/lanceur ne sont pas figés
hors des droits de Léo et que tous les chemins d'effet ne passent pas par
eux. Il faut ensuite éprouver depuis l'identité réelle d'exécution un refus
de mutation du contrôle et un arrêt global sur fixture. La déclaration de
Léo ou un statut FINUBAR écrit par elle ne constitue pas cette preuve.
Aucun import dans le contrôle, fusion, migration réelle, secret, dépense,
workflow R21 manuel, émission ou activation n'est exécuté.

---

## Révocation vérifiée le 05/10/2026 — correction de la fondation

Paul confirme : « Accès à Léo contrôle révoqué — Continue ».
Mesures effectuées après son intervention :
- Page GitHub de l'installation organisation `160835885` : mise à jour
  confirmée, sélection de 12 dépôts, `leo-control-r21` absent, bouton
  Enregistrer désactivé. Les 12 dépôts habituels sont conservés.
- Inventaire du connecteur pour cette installation : 12 dépôts, contrôle absent.
- GET des métadonnées de `PaulGERARD161098/leo-control-r21` : refus 404 ;
  lecture `AGENTS.md` d'Ultima toujours réussie.

Avant la révocation, ce même contrôle était exposé parmi 13 dépôts et ses
métadonnées étaient accessibles. Ce contraste, la page des réglages et le
témoin positif Ultima prouvent la révocation **du connecteur mesuré** ;
un 404 isolé n'aurait pas suffi. Aucun contenu ni secret du contrôle lu,
aucun import, workflow ou effet exécuté dans ce contrôle.

**Limite conservée :** la séance navigateur propriétaire ayant permis le
réglage, les autres sessions, CLI et applications ne sont pas attestées
exclues. Ne pas utiliser le navigateur comme contournement du connecteur.
L'exclusion globale requise pour l'activation reste ouverte ; elle ne bloque
pas la préparation dans Ultima. Les mesures historiques ci-dessous sont
conservées comme historiques, pas comme état actuel du connecteur.

### Prochain lot cadré : admission et reprise, encore à implémenter

But : qu'une demande validée par le protocole ne provoque un effet fictif
qu'après admission par l'hôte, et qu'une interruption ne permette ni doublon
ni retour à un ancien état.

Étapes et moyens : préparer l'adaptateur autour de
`leo/control_r21/protocol.py`, `leo/trial_host.py`,
`leo/trial_resume.py` et `leo/runtime/broker.py` ; conserver le registre
existant et ses verrous. Le format réseau actuel de TrialHost contient
seulement `command` : l'adaptateur doit contrôler explicitement les six
champs du nouveau protocole, sans simplement les jeter avant cet appel.
Identifier séparément le registre canonique de mission, le journal des
requêtes de transport et la preuve de checkpoint ; aucun second registre
d'autorité de mission.

| Garde à préparer | Épreuve de sortie attendue en CI isolée |
|---|---|
| Identité et autorité obtenues hors proposition | Mauvais compte, autorité injectée et mandat inadéquat refusés avant effet |
| Correspondance mission/opération/version | Identifiant changé et version périmée refusés ; cas nominal admis |
| Journal durable request_id/empreinte | Même requête retrouve son résultat ; même ID et contenu différent refusés ; concurrence sans double effet |
| Arrêt et admission sous verrou commun | Arrêt acquis avant admission interdit le départ ; opérations engagées restent réconciliables |
| Résultat inconnu après interruption | Réconciliation par reçu avant tout rejeu ; aucun second effet après réponse perdue |
| Checkpoint authentifié, lié au contexte et à une version courante hors paquet | Altération, mauvais contexte et rejeu d'un checkpoint ancien refusés ; signature seule insuffisante contre le rollback |

La conception doit traiter la coupure entre admission, effet et conservation
du reçu ; marquer une requête « reçue » ne prouve pas l'effet. L'ancrage du
checkpoint courant et l'identité de confiance appartiennent au futur hôte
exclu, jamais à une archive ou à la proposition Work. Préparer le code ne
crée pas cet ancrage effectif.

Réussite : nouveau SHA, revue par instance distincte, CI isolée liée à ce
SHA et cas négatifs réellement refusés. Un défaut volontaire limité au banc
doit rendre l'épreuve critique rouge. Aucun résultat annoncé avant mesure.

Hors périmètre de ce lot : import/ancrage dans le contrôle exclu, activation,
workflow R21 manuel, secret, merge, publication et dépense externe.
Pré-mortem : parser confondu avec permission, champs ignorés par l'ancien
hôte, journal transport devenu deuxième autorité, coupure causant un doublon,
checkpoint signé mais ancien. Les épreuves ci-dessus portent sur ces mécanismes.

FINUBAR conserve son rôle d'index des états et dérives de projets. Il ne
devient ni l'autorité d'admission ni le contrôleur de Léo. Sa collecte autonome
et son stockage/retour privé restent un lot distinct après fermeture du canal.

---

## Reprise du 05/10/2026 — déblocage et livraison du protocole

Demande courante de Paul : « on reprend alors il faut débloquer et mettre en ligne ».
Cette section décrit les mesures et le lot préparatoire ; elle n'est ni un
accord externe R21 ni une réception LV1.

### Mesures actualisées et effet utile

- `main` mesuré : `9a261c5fb1ac1a77bdf53e5b3f98444297b2599b`.
  PR351 conserve sa tête `8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448`,
  ouverte, brouillon, non fusionnée.
- Le dossier du 04/10 existe déjà dans le commit
  `974099098469c74504eef266b5e4a0b8ba6f41df`, dont le parent est le main mesuré.
  Il est repris dans le nouveau lot ; aucun document canonique concurrent.
- Vercel : projet `ultima` / `prj_M04pcNR3xJUAIuUXKEArOHiQtQzj`,
  production `dpl_DmSDNjNFmXXYbspjFwKDBDpmrji8` READY, même SHA que main.
  Audit distinct en lecture seule. L'alias `https://ultima-plum.vercel.app`
  répond 200 anonymement en racine ; l'URL unique de production redirige
  vers SSO. L'authentification des données n'a pas été testée dans cette séance.
- `.vercelignore` exclut `/leo/` et `*.md`. Les modules Python et
  le dossier opérateur restent dans le dépôt privé, hors du déploiement Vercel.
  Un merge de préparation ne fournit pas l'hôte d'exécution R21.
- `api/finubar.js` sert un agrégat commité, daté du 04/10.
  `api/finubar-matin.mjs` ne collecte pas. Audit Vercel distinct :
  quatre réponses 200 sur cette route en 48 heures, sans lecture des contenus
  de logs. Ces passages ne prouvent ni fraîcheur ni réception de mail.
- Le GET des seules métadonnées de `leo-control-r21` retourne encore 404.
  Existence, propriétaire et exclusion globale restent non attestés.
  Aucun contenu ni secret du contrôle n'a été lu.

Recherche préalable avant nouvelle écriture : 445 références exposées,
92 heads, aucun tag, 353 références PR (352 head et 1 merge) ; 379 pointes
distinctes. Parcours des historiques et parents : 1 311 commits distincts,
330 requêtes, zéro erreur, aucune pointe ou parent restant inconnu.
Pour chacun de `e3817eb`, `c5fb397`, `0f7830e` : zéro occurrence dans ce
graphe, recherche complémentaire GitHub de commits vide.
Limites : objets orphelins, références supprimées/inaccessibles et absence
de transaction globale. Ce constat ne prouve pas une absence globale.

### Lot exécuté : protocole fermé, sans capacité d'exécution

But : distinguer une proposition bien formée d'une autorité et préparer son
format de transport borné. Fichiers nouveaux : `leo/control_r21/protocol.py` et
`tests/runtime/test_control_r21_protocol.py`. Les sept fichiers PR351
ne sont pas modifiés ni reconstruits. Aucun lanceur n'est activé.

Le nom préparatoire `schema_version` du plan précédent devient
`protocol_version`, fixé à 1 : il désigne la version du format de transport,
distincte de `expected_version`, version attendue de la mission.
Le format contient exactement cette version, `command`, `request_id`,
`mission_id`, `operation_id` et `expected_version`. Les quatre commandes
sont `status`, `execute`, `reconcile`, `stop`.

Corps JSON limité à 16 Kio, UTF-8 strict, objet fermé, identifiants ASCII bornés,
types exacts, doublons/champs inconnus/contenus d'autorité refusés. Empreinte
canonique déterministe pour le contenu validé ; aucun accès réseau/disque,
accord, identité, budget, arrêt ou effet dérivé de cette empreinte.
L'anti-rejeu `request_id/digest`, l'habilitation et l'admission restent des
gardes du futur hôte : elles ne sont pas installées par ce décodeur.

Moyens d'épreuve : CI normale `pull_request`, workflow existant
« Léo LV1 — fixtures isolées », puis revue par instance distincte.
Un cas négatif remplace seulement une garde en mémoire dans le test isolé ;
aucun mutant n'est poussé sur une branche ni utilisé dans un environnement réel.
Aucun test applicatif local n'est exécuté. SHA/runs/logs du lot doivent être
relevés dans la PR après exécution ; aucun succès n'est déduit du plan.

### Blocages circonscrits et prochaine action

L'installation du canal nécessite encore l'attestation du contrôle hors Work,
puis un kit complet d'admission/checkpoint, sa revue et son ancrage autorisé.
Le hôte temporaire GitHub Actions exclu reste la voie proposée, sans achat
d'hébergement ni ouverture du serveur loopback. Le présent protocole ne
constitue pas ce kit complet : aucun import ne doit être demandé maintenant.

FINUBAR autonome nécessite un transport de collecte privé et un chemin
de stockage/lecture durable. Le connecteur GitHub Work ne devient pas un
credential disponible à Vercel. Une actualisation conduite en séance est
possible avec cet accès ; elle ne prouve pas une collecte autonome.

Pré-mortem du lot : parser assimilé à autorité, JSON ambigu, propositions
trop grosses, preuve sur mauvais SHA, ou Python annoncé déployé alors qu'exclu.
Prévention : format fermé et borné, aucune IO, revue distincte et logs CI liés
aux versions, périmètres GitHub/Vercel explicitement séparés.
Aucune mission autonome, dépense externe, fusion, publication nouvelle,
migration, secret ou envoi n'est exécuté par ce lot.

Prochaine action après cette épreuve : préparer l'admission et le checkpoint
en réutilisant `trial_host`, `trial_resume`, le broker et leurs refus.
L'attestation d'existence/exclusion du contrôle peut être fournie en parallèle
par Paul sans transférer aucune valeur secrète.

---



## Objectif d'autonomie — plan du 04/10/2026

**Statut : cadrage et première étape réalisés en lecture/préparation ;
aucune activation et aucune réception LV1 prononcées.**
Demande de Paul : cadrer précisément le chemin d'autonomie de Léo et FINUBAR,
établir un rétroplanning, puis réaliser la première étape.
Contrat applicable : §11 canonique LV1 v1.1, effectivement relu sur main
`9a261c5fb1ac1a77bdf53e5b3f98444297b2599b`. Le §11 est identique à celui de
la source R21 `8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448` ; les ajouts
produit B1 du cadrage main sont plus récents. Ils ne donnent pas de droits LV1.

### But, périmètre et résultat utile

Paul retrouve dans Ultima un état frais et sourcé de ses projets ; Léo conduit
une mission bornée de lecture, diagnostic et préparation sans relances
mécaniques, conserve son résultat et sa reprise, et lui présente les décisions
nécessaires. Une mission doit se réveiller par un mécanisme réellement
installé, puis s'arrêter aux limites prévues.

Le premier pilote continu proposé porte sur les dix dépôts de
`finubar/depots.json` : collecte Git/notes, couverture, dérive et priorisation,
avec résultat privé dans Ultima. Les corrections de code restent sur branche,
avec revue et CI isolée. Aucun merge réel ou effet métier n'est inclus dans
ce pilote de surveillance. L'autonomie produit B1 et la réception LV1 sont
deux preuves distinctes ; une réussite sur capture/défaire d'idée ne reçoit
pas le contrôle R21 ni les connecteurs d'exécution.

**Mandat conservé :** ne fusionner aucune PR ; ne rien importer dans
`leo-control-r21` ; ne créer, lire ou afficher aucun secret ; ne déclencher
aucun workflow R21 manuellement ; aucun test applicatif hors de la CI isolée
prévue ; aucun force-push ; aucune publication publique. Ce plan décrit des
étapes ultérieures nécessitant leurs accords ; il ne les autorise pas.
Le fonctionnement continu et les rituels constituent une extension explicite
du contrat initial. Aucun service permanent ni budget externe n'est activé.

### Rétroplanning proposé, depuis le résultat du 16/10/2026

**Cible de travail, pas date garantie ni accord d'activation : vendredi
16 octobre 2026, Europe/Paris.** Dates fondées sur dix jours ouvrés à partir
du 05/10, sous disponibilité des accès, de Paul et de l'environnement.
Chaque date est recalée dès qu'une dépendance glisse. Ne pas diminuer
les contrôles pour tenir le calendrier.

| Date cible | Lot et livrable | Responsable | Dépendance / sortie vérifiable |
|---|---|---|---|
| 16/10 | Bilan du pilote : Léo supervise une boucle et FINUBAR se rafraîchit sans ouverture de séance | Léo + revue distincte + Paul | Deux cycles planifiés consécutifs tracés ; couverture explicite ; une panne provoquée uniquement sur fixture reste visible ; arrêt durable et reprise sans doublon ; aucun effet hors mandat ; verdict sur le périmètre effectivement éprouvé |
| 15/10 | Deuxième cycle et reprise du pilote | Léo | Premier cycle conservé ; nouveau contexte/session relisant la version et le reçu courant ; aucun effet ou appel répété après résultat connu |
| 14/10 | Installation autorisée des déclencheurs et premier cycle | Paul pour les réglages réservés, Léo pour la vérification | Accord précis sur fréquence, périmètre, hébergement existant, budget et arrêt ; accès propriétaire de FINUBAR éprouvé ; déclencheur observé dans ses logs, résultat privé consultable ; aucune nouvelle émission mail/SMS |
| 13/10 | Collecte FINUBAR fraîche et supervision raccordées, prêtes à activer | Léo + revue distincte | Réutiliser collecter/github/agrégateur ; résultat disponible à la lecture sans dépendre d'un merge automatique/publication ; dates, versions, couverture et dernier succès conservés ; chemin de stockage/lecture privé décidé et éprouvé |
| 12/10 | Recette LV1 et revue de réception | Léo + revue distincte ; Paul prononce la réception | R01–R28 actualisés avec preuves applicables ; gardes critiques fermées, R13 positif et R21 complets ; les limites non critiques restent nommées ; aucun succès déduit du seul nombre de tests |
| 09/10 | R21 complet sur fixture, puis reprise en nouvelle session Work | Léo ; accord exact produit par Paul hors Work | Canal réellement installé, mandat frais, paquet/version/revue revalidés ; effet fictif exact, résultat vérifié, checkpoint courant conservé ; session Work neuve retrouve le même reçu sans nouvel effet |
| 08/10 | Fondation de confiance attestée et installation du kit opérationnel, seulement après accord levant les interdits concernés | Paul pour le contrôle exclu ; Léo pour les mesures autorisées | Existence et propriétaire du dépôt de contrôle attestés ; exclusion complète des accès Work ; import/ancrage du kit opérationnel revu et figé par Paul ; aucune autorité issue d'Ultima, d'une archive ou d'une PR |
| 07/10 | Adaptateurs et checkpoint éprouvés, revue indépendante du nouveau SHA | Léo + revue distincte | CI pull_request isolée, défauts connus réellement rouges, nominal vert, logs et SHA conservés ; correction éventuelle = nouveau SHA et preuve adaptée ; aucun déclenchement manuel R21 |
| 05–06/10 | Préparation du canal et preuve de faisabilité du futur hôte/réveil borné | Léo | Schémas fermés, arrêt/concurrence/idempotence, vérificateur de checkpoint ; vérifier un vrai mécanisme de réveil, son transport et ses contrôles, le stockage/retour privés et les bornes, sans activation facturée ; absence de voie recevable = replanification du pilote |
| 04/10 — étape 1 | Diagnostic des accès et de l'existant ; protocole concret et dossier opérateur | Léo + audit distinct | Mesures ci-dessous, liste de fichiers et essais, gestes humains restant identifiés ; documentation versionnée séparément de PR351 ; aucun code applicatif exécuté localement |

**Chemin critique :** faisabilité hôte/réveil/stockage privé attestée → accord hors Work attesté → kit opérationnel éprouvé →
installation autorisée → R21 et reprise Work → réception LV1 →
collecte/lecture FINUBAR raccordées → extension de mandat et déclenchement →
deux cycles du pilote.
Si la faisabilité du vrai réveil/hôte et du stockage privé n'est pas attestée
au 06/10, ou si la fondation manque au 08/10, le pilote du 16/10 doit être
replanifié. Une simple automation de notification n'est pas une exécution de
Léo dotée des outils, permissions et gardes nécessaires. La préparation autorisée peut continuer ;
ni le dépôt exclu ni ses réglages ne sont modifiés par déduction.

### Étape 1 — diagnostic mesuré le 04/10

Lectures GitHub de cette séance, autour de 22 h 51–23 h Paris. Ce sont des
mesures d'accès et du code ; aucune santé métier/production n'est déduite.

| Objet | Mesure et source | Limite |
|---|---|---|
| Identité | `github_get_user_login` : paggerard-boop, ID 277032273 | Nom partagé avec Paul : ne distingue pas à lui seul accord humain et écriture Work |
| Dépôt / versions | Ultima- ID 1264864250, privé ; main ab60a658ec3a1b06ea07d3c39be69d6051aa879d ; PR351 ouverte, brouillon, source 8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448 | PR351 préparatoire, aucune fusion ; son contenu final et ses preuves restent inchangés par ce lot |
| Installation organisation | `github_list_installations` : ID160835885, `repository_selection=selected` ; liste par installation : 12 dépôts, page suivante vide | La consigne du 30/09 demandant le passage de all à selected est dépassée pour cette installation ; le changement et sa date ne sont pas reconstruits |
| Installation personnelle | ID163434661, `repository_selection=all` ; 2 dépôts exposés : paggerard-boop/ripair et paggerard-boop/Artidispo ; page suivante vide | Un contrôle créé sur ce compte pourrait entrer dans cet accès ; ne pas y supposer une exclusion |
| Contrôle proposé | GET métadonnées PaulGERARD161098/leo-control-r21 : 404 ; absent de l'inventaire exposé | Impossible de distinguer dépôt absent et inaccessible ; existence/propriétaire et exclusion globale NON ATTESTÉS. Aucun contenu, branche, secret ou workflow de ce dépôt lu/écrit |
| Autres accès Work | git, bwrap et unshare présents ; gh, Docker et Podman non trouvés dans PATH ; aucun outil R21 de contrôle branché dans le catalogue courant | Aucune valeur d'authentification/secret explorée ; git disponible ne prouve pas absence d'identifiants. Navigateur non initialisé ; autres sessions/CLI/App non attestés. L'exclusion complète reste ouverte |
| Réveil Work | Outil de création d'automations exposé ; inventaire privé actuel : 5 tâches, aucun titre correspondant à Léo/FINUBAR/Ultima/dry run | Aucun nouveau réveil créé. Le filtrage de titres n'est pas une preuve d'absence globale de routines ; capacité d'exécuter la mission avec ses outils/contrôles et résultat privé non éprouvée |
| Contents / PR / Actions | Lectures actuelles utilisables ; écritures Contents/PR et lecture Actions mesurées dans le lot PR351 | Rôle admin ≠ portée du connecteur. Actions en écriture reste non vérifiée ; aucune écriture Actions entreprise |
| Couverture FINUBAR | 10/10 entrées réelles : HEAD main puis FINUBAR.md lus au SHA exact, JSON des dix grains lisible | État métier déclaré dans les notes ; lecture récente ne rajeunit pas leur mesure |
| Retour produit FINUBAR | main : api/finubar.js lit le module agrégat commité et impose requireProprietaire ; api/finubar-matin.mjs n'effectue aucune collecte | Configuration propriétaire et derniers succès en production non vérifiés ici. La note main consigne un réglage propriétaire manquant : traiter comme dépendance à mesurer, sans lire de variable |
| Produit B1 | Le cadrage et FINUBAR main consignent la preuve du 04/10 16:11 UTC : une trace tentee/reussie/defaite ; refus d'une suppression hors catalogue | Preuve consignée, pas relecture de la base dans cette séance. Le crédit épuisé du 02/10 n'est plus repris comme blocage actuel ; aucun chemin orange de demande puis exécution prouvé par ce refus |
| Écritures concurrentes | PR352 brouillon : CADRAGE-ULTIMA, FINUBAR, deux agrégats, JOURNAL-DECISIONS | Aucun de ces cinq fichiers modifié par ce lot ; leur travail reste séparé |

Les 12 dépôts exposés de l'organisation restent :
RenoAgenda, RenoBoost, artisan-builder, mon-dpe.fr, Wingman-, DATARENO-, Ultima-,
RenoPredict, RenoDevis, Renodevis-archive, renoboost-console, Artidispo.
Le registre FINUBAR contient dix entrées, dont
**paggerard-boop/Artidispo** (ID1366017368), distinct d'Artidispo dans
l'organisation (ID1369762998, taille0 dans les métadonnées).
Wingman-, Renodevis-archive et ripair ne sont pas ajoutés au registre par cet audit.

#### Version et date des dix sources lues

Les dates ci-dessous sont celles des notes ; aucun comptage de dérive ou état
de fonctionnement du projet n'a été éprouvé. Les investigations métier
reportées par Paul ne sont pas rouvertes par cet inventaire.

| Dépôt | HEAD main mesuré | Date maj déclarée / dernier arrêt déclaré |
|---|---|---|
| PaulGERARD161098/Ultima- | ab60a658ec3a1b06ea07d3c39be69d6051aa879d | 04/10 / 04/10 |
| PaulGERARD161098/RenoBoost | 5b825327e0bd6c133ac134a7154e66bf0b27c618 | 01/10 / 03/10 |
| PaulGERARD161098/RenoDevis | 2d14e6060569920877f5724adb6d7155840a9e92 | 01/10 / 03/10 |
| PaulGERARD161098/RenoAgenda | 0f7a9efde59f7343b8c9b37df669a4bcf8f1f791 | 30/09 / 30/09 |
| PaulGERARD161098/RenoPredict | 89601caecbe8a43e36205db881dafe31d2c46799 | 30/09 / 30/09 |
| PaulGERARD161098/renoboost-console | b6a0dff14f6834532405899e4fe5466ad2abc843 | 30/09 / 30/09 |
| PaulGERARD161098/mon-dpe.fr | ecb83e86fd03a64fa1661b7d57be3911e80b81d7 | 21/08 / 21/08 |
| PaulGERARD161098/artisan-builder | a374104f59c241ea429de180c1fec05975e25953 | 30/09 / 30/09 |
| paggerard-boop/Artidispo | fb6716e0fa8a475e8066153e182475f6c22aa4c6 | 01/10 / 02/10 |
| PaulGERARD161098/DATARENO- | 4f653ce096e20375f3d61c3a8161744e969c1783 | 30/09 / 30/09 |

#### Recherche avant nouvelle écriture

Nouvel inventaire Git refs paginé : 446 références = 92 heads, 0 tags,
352 PR/head, 2 PR/merge ; 379 pointes distinctes, page6 vide.
Parcours des historiques depuis ces pointes, avec réutilisation des parents :
1310 commits distincts, 328 requêtes d'historique ; toutes les pointes et tous
les parents couverts, zéro erreur. Pour chacun de e3817eb, c5fb397, 0f7830e :
zéro correspondance dans ce graphe accessible, recherche GitHub de commits
vide, résolution directe422. Aucun constat d'absence globale : objets orphelins,
accès refusés et anciennes références supprimées/remplacées restent hors portée ;
l'inventaire n'est pas transactionnel. Les 443 références de l'ancienne revue
PR351 conservent leur périmètre historique ; ce nouvel inventaire ne la réécrit pas.


#### Réconciliation avant sauvegarde

Pendant la revue, main a avancé de `ab60a658ec3a1b06ea07d3c39be69d6051aa879d` à
`9a261c5fb1ac1a77bdf53e5b3f98444297b2599b` : PR352 est désormais fusionnée par un travail extérieur à
ce fil. Les cinq fichiers de son diff sont conservés dans la nouvelle base ;
aucun n'est modifié par ce lot. AGENTS, CLAUDE, le cadrage canonique, ACTIVATION
et la reprise ont été relus au nouveau SHA : mêmes blobs ; §11 v1.1 inchangé.
La branche documentaire est fondée sur ce nouveau main.
PR351 conserve sa source `8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448`, ouverte,
brouillon, non fusionnée. Ses logs/revues restent liés à leurs versions ;
la nouvelle cible n'est pas assimilée à l'intégration CI ancienne.

Réactualisation Git refs avant écriture : 444 références = 91 heads, 0 tags,
352 PR/head, 1 PR/merge ; 378 pointes distinctes, dernière page vide.
Le graphe déjà lu a été réutilisé et complété : une requête d'historique de
plus, soit329 au total et1311 commits distincts examinés dans les deux passes.
Toutes les pointes de cette dernière passe et tous les parents sont couverts,
aucune erreur ; les trois préfixes restent sans correspondance dans le graphe
examiné. Le nombre1311 inclut la passe antérieure, pas un comptage affirmé du
seul graphe courant. Les mêmes limites de couverture/non-transaction s'appliquent.

### Premier raccord à préparer : interfaces et refus

Le choix proposé réutilise les opérations internes du banc existant et un
contrôle temporaire exclu. Ne pas exposer trial_host sur Internet ni desserrer
sa contrainte loopback. Le kit de PR351 est **inactif** (workflow exit1 et runner
refusant) ; importer ce snapshot seul ne rendrait aucune commande utilisable.
L'installation ultérieure vise un kit opérationnel distinct, revu sur son SHA.

**Frontière de confiance :**
Work peut proposer des données et préparer du code dans Ultima.
Le contrôle hors Work détient les ancres et capacités, vérifie le véritable
événement d'accord de Paul et construit Binding/Approval.
Le conteneur fixture reçoit uniquement le contexte et les fichiers bornés
nécessaires. Identifiants GitHub et moyens de signature restent hors de ce
conteneur et hors de Work. Le reçu recevable provient du contrôle.

#### Commandes et transport proposés

Proposition privée versionnée, lisible par le contrôle via GitHub Contents :
`GET /repos/PaulGERARD161098/Ultima-/contents/leo/proposals/r21/<mission_id>/<request_id>.json?ref=<source_sha>`.
Le SHA et l'empreinte sont relus ; la branche mouvante n'est pas une ancre.
Ce transport est un **choix de conception à implémenter**, pas un endpoint
déjà raccordé. Le contrôle ne suit pas une URL, un chemin shell ou un dépôt
choisi par la proposition.

Schéma fermé proposé :
`schema_version`, `request_id`, `mission_id`, `operation_id`,
`command`, `expected_version`.
Version attendue1 ; identifiants ASCII simples de1 à128 caractères ;
commande parmi status/execute/reconcile/stop ; version entier positif.
Aucun champ d'identité, approval, mandat, racine, clé, shell, effet libre
ou réseau libre n'est accepté. Le contexte exact, la cible et les preuves
proviennent de la configuration canonique du contrôle.
Le demandeur réel est résolu depuis une habilitation détenue par le contrôle
et la provenance du transport, jamais depuis le JSON ou le nom du committer
seul. Une proposition versionnée est une donnée, pas un accord.
Le couple request_id/digest est immuable : même identifiant et même contenu
retrouvent le reçu ; même identifiant et contenu différent provoquent un
conflit. Un nouvel identifiant de requête ne permet pas un second effet pour
la même operation_id. Ces propriétés sont exigées avant installation.

| Commande | Admission et résultat attendu |
|---|---|
| status | Lecteur habilité de cette mission ; projection bornée de l'état canonique, version, budget/arrêt et reçu ciblé |
| execute | Propriétaire et mandat encore valides, accord/revue externes liés au contexte exact, version attendue, bornes et absence d'arrêt ; seule opération fixture préautorisée |
| reconcile | Lecture/recherche de la même operation_id ; résultat connu rendu sans nouvel effet ; état inconnu bloque tout rejeu aveugle |
| stop | Autorité propriétaire vérifiée hors proposition ; arrêter durablement les nouvelles admissions avant accusé de réception, conserver opérations engagées et reçu ; ne pas promettre de les annuler |

La sérialisation arrêt/exécution doit réutiliser le mécanisme du broker.
Une version de proposition périmée ne doit pas laisser passer execute ;
le protocole d'arrêt doit toutefois traiter l'état canonique courant et
rendre son issue visible. La sémantique exacte de ce cas sera fixée dans le
code et son test avant installation.

**Bornes de conception proposées, non budget activé :** JSON16Kio maximum,
lecture réseau10s maximum, deux tentatives maximum par lecture ; une mission
active et un consommateur d'effets à la fois ; polling éventuel30s minimum,
20min maximum pour le lanceur pilote. Timeout ou disparition du contrôle =
issue inconnue visible et reprise, jamais nouvel effet supposé sûr.
Chaque valeur sera effectivement testée, liée au mandat et arrêtée hors modèle.

#### Accord, checkpoint et nouvelle session

L'accord réel vient d'un événement serveur du chemin inaccessible à Work.
Le compte seul, une revue GitHub publiable par le connecteur ou un champ
approved ne suffisent pas. L'admission lie au minimum propriétaire, mandat
et version/expiration, SHA du lanceur, paquet SHA256, preuve indépendante,
source/cible/intégration fixture, mode, effet exact et identifiant d'opération.
Un dossier périmé est renouvelé et revu ; le candidat du 30/09 expiré le
01/10 n'est pas réactivé par le plan.

Le checkpoint doit contenir identité du contrôle, mission/opération,
version/arrêt/réservations du registre, références Git avant/après, reçu,
empreinte du contenu, séquence monotone et empreinte du précédent.
Le registre d'épreuve reste une donnée de pilote ; Postgres reste la mémoire
produit. Aucun second registre métier n'est créé.

Retour pilote proposé : transfert du checkpoint vérifiable par Paul depuis
le contrôle exclu, avec provenance et ancre extérieure à la requête.
Si une signature est retenue, ses moyens sont établis exclusivement par Paul
hors Work ; aucun secret ni clé ne sera créé ou lu dans le présent lot.
Une signature seule n'établit pas la fraîcheur : le dernier checkpoint courant
doit être attesté côté contrôle et sa chaîne monotone vérifiée.
Sauvegarde non confirmée ou état inconnu : arrêt, conservation du diagnostic,
aucun rejeu. Rétention et récupération des données du pilote sont à arrêter
dans le dossier d'installation ; leur mécanisme doit être éprouvé avant R21.

La nouvelle session Work relit compétence/version et mandat, reçoit le
checkpoint courant attesté, vérifie empreintes/provenance/contexte, appelle
reconcile sur la même opération et retrouve le reçu. Elle ne reconstruit
pas la réussite à partir d'une copie modifiable dans Ultima. Un processus neuf
de la même CI reste une preuve différente d'une session Work neuve.

#### Fichiers du prochain lot, proposés après cette première étape

| Source à réutiliser / fichier proposé | Modification préparatoire |
|---|---|
| leo/trial_host.py, trial_resume.py ; runtime/broker.py, budget.py, fixture_git.py | Réutiliser call/Binding, validation de paquet, admission, arrêt/verrou et idempotence ; préserver les refus loopback/fixture et les contrôles de références |
| leo/control_r21/protocol.py — nouveau proposé | Schéma fermé des propositions, bornes et erreurs déterministes ; aucune capacité par nom d'outil ou argument |
| leo/control_r21/admission.py — nouveau proposé | Consommer exclusivement le contexte et événement attestés par l'hôte de confiance ; refus si provenance/ancres/revue/mandat manquent |
| leo/control_r21/checkpoint.py — nouveau proposé | Vérifier contenu/provenance/chaîne/état courant et reprise ; aucun secret intégré ; refus de checkpoint ancien/incomplet/étranger |
| tests/runtime/test_control_r21_protocol.py — nouveau proposé | Cas nominaux et refus, version/concurrence/arrêt, relecture sans doublon, mutants connus ; uniquement CI isolée |
| leo/control_r21/foundation/runner.py et control-r21.yml | Restent inactifs dans ce lot ; un futur kit opérationnel requiert versions/empreintes et revue propres, pas une modification silencieuse du snapshot validé |
| finubar/collecter.mjs, github.mjs, agreger.mjs ; api/finubar.js ; registre existant | Au lot FINUBAR seulement : acquisition et lecture de l'état frais, provenance et couverture, chemin privé ; aucune collecte dépendant d'un merge automatique ni stockage métier concurrent |

Pas de fichier applicatif nouveau dans la première étape. Cette liste est une
préparation de périmètre : des lectures ciblées précèdent l'implémentation,
et tout effet/version changé est soumis à ses preuves propres.

#### Essais nécessaires, préparés mais non exécutés dans ce lot documentaire

- Nominal avec autorités fictives explicitement injectées dans l'isolation :
  même opération, même registre et même fixture ; reçu stable et zéro doublon.
- Refus : commande/champs inconnus, corps trop grand, identité/mandat/accord
  manquants, événement proposé par le modèle, revue d'un autre SHA,
  expiration, racine ou cible hors périmètre.
- Source/cible ou version modifiées pendant admission : aucun effet ; arrêt
  concurrent : aucune nouvelle admission après sa prise en compte.
- Réponse perdue et checkpoint incomplet/ancien/étranger : résultat recherché ;
  issue inconnue affichée, aucun rejeu aveugle ni ancienne copie promue courante.
- Faux script et enfant dans la fixture : écriture/réseau/secret hors périmètre
  empêchés par l'environnement, sans destination ni secret réel.
- Un mutant de chaque garde critique concernée doit échouer pour la bonne
  cause ; logs prouvent découverte et exécution des tests, puis nominal sain.
- FINUBAR : cas connu de changement et de refus ; aucune note redatée comme
  mesure actuelle ; couverture et fraîcheur visibles à la lecture propriétaire.
- Reprise Work réelle et accord réel restent ultérieurs : des fixtures de CI
  ne les remplacent pas. Aucun test applicatif local dans cette séance.

### Parcours opérateur et décisions réservées

1. **Léo maintenant :** diagnostic, protocole, préparation de code et revue ;
   aucun accès au contenu du contrôle ni déclenchement.
2. **Paul, quand le kit opérationnel sera concret et revu :** attester
   existence/propriétaire du contrôle et exclusion de toutes les voies Work.
   L'organisation est déjà selected ; ne pas refaire ce réglage à l'aveugle.
   Toute autre session/CLI/App doit également être couverte ; aucune valeur
   d'identifiant n'est demandée dans la conversation.
3. **Paul après révision précise des interdits concernés :** importer/ancrer le
   kit exact et ses accès hors Work. Léo revalide le transfert par les preuves
   autorisées ; ne lit ni ne manipule les secrets.
4. **Paul hors Work :** donner l'accord exact au seul effet fixture et lancer
   le chemin prévu ; Work ne dispatch aucun workflow R21. Résultat et reprise
   sont vérifiés avant réception LV1.
5. **Extension continue :** choisir et autoriser les déclencheurs et le budget,
   puis vérifier l'accès propriétaire et le mécanisme de restitution dans
   Ultima. L'envoi réel historique du matin n'est pas appelé ni modifié ici.

Réglages proposés du premier pilote : une collecte quotidienne à06h45 Paris,
une synthèse privée après la collecte, une mission active, deux tentatives et
un spécialiste maximum. Aucun horaire ne devient une automation par ce plan.
Le plafond global en euros, la durée, les appels/tokens engagés et leurs
réservations doivent être définis sur le moteur effectivement retenu avant
tout appel externe facturé. Sans borne crédible ni arrêt exécutoire, activation
bloquée. Le choix d'un hôte et d'un réveil Work réel reste à vérifier ; un
fichier local de configuration ou une compétence ne les installe pas.

### Pré-mortem et clôture de la première étape

| Échec | Prévention / preuve attendue |
|---|---|
| Même identité assimilée à un accord humain | Exclusion mesurée du chemin d'accord et événement serveur extérieur aux propositions |
| Contrôle absent ou visible par une autre voie | Existence/propriétaire attestés + inventaire de toutes voies ; 404 seul reste insuffisant |
| Préparation inerte importée comme lanceur opérationnel | Versions et finalité distinguées ; admission/run fixture éprouvés avant installation |
| Ancien paquet ou checkpoint signé rejoué | Expiration, contexte exact, état courant attesté et chaîne monotone ; reprise de même operation_id |
| FINUBAR rafraîchi sur disque mais page encore figée | Prouver collecte → stockage privé → lecture propriétaire sans merge/publication automatique |
| État frais confondu avec note fraîche | Dates lecture/mesure séparées, couverture et dérive explicitement conservées |
| Modèle surveille tout ou dépense sans fin | Mission/périmètre fermés, budget partagé, délai/tentatives et arrêt hors modèle |
| Calendrier tenu en masquant une garde | Jalons dépendants ; retard déclaré et cible recalée, aucune réception de convenance |

**Fait :** accès/inventaires/versions et dix sources mesurés, réconciliation
documentaire, audit distinct des briques, protocole et rétroplanning préparés.
**Restant :** implémentation/revue des adaptateurs, fondation attestée,
installation autorisée, R21 complet, recette LV1, collecte/restitution privée
et activation/pilote continu.
**Bloqué avant activation :** existence/exclusion globale du contrôle,
accords d'import/déclenchement hors Work, canal et checkpoint installés,
configuration propriétaire produit, choix du réveil et budget externe.
Ces points ne bloquent pas la préparation de code du prochain lot.
La revue documentaire indépendante finale est favorable après précisions sur
l'historique, l'identité/anti-rejeu des propositions et la faisabilité précoce
du hôte/réveil. Ce verdict porte sur ce cadrage, pas sur des adaptateurs installés.

**Prochaine action unique :** implémenter sur une branche dédiée le protocole
fermé et ses refus, en réutilisant les opérations du banc ; revue indépendante
et CI isolée déclenchée normalement par pull_request. Ne pas changer la PR351
ni ses sept fichiers pour y absorber ce nouveau lot.

---


## Historique conservé — diagnostic et propositions du 30/09/2026

Les états datés ci-dessous conservent leurs preuves d'origine. Pour la prochaine
action et les accès courants, la section du 04/10 ci-dessus prévaut : le mode
organisation est désormais mesuré selected. Les anciennes affirmations « tous
les dépôts » et « ce changement n'est pas fait » ne sont pas réaffirmées comme
actuelles. Les propositions historiques n'accordent aucune autorité nouvelle.

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

