# Reprise courante — 10 octobre 2026, test cible réussi, candidat lecture inerte

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


---

## Historique — anciennes prochaines actions remplacées par le relevé ci-dessus

# Reprise courante — 8 octobre 2026, essai cible échoué puis arrêté

Paul a installé le candidat source27664c7 et exécuté lui-même status/prepare/
execute/reconcile/stop dans le contrôle exclu. Aucune voie Work n'a accédé à ce
dépôt. Capture 23h37Paris : stoppedtrue, owner_stop, phaseunknown, séquence5,
exécution37846177261 sans reçu ; préparation37845684569 completed. L'arrêt est
prouvé après l'échec, pas pendant une exécution. Aucune autonomie reçue.

Cause structurelle confirmée dans le code : /trial-output1777 incompatible avec
le verrou FINUBAR. Copilot a déclaré la reproduction ; ses captures montrent
le correctif0700,uid65534,gid65534 mais conservent ancienne identité/source/revue.
Sa PR est non fusionnée selon Paul. Ne pas suivre la proposition de re-seed.

Correctif source et test avec les vrais montages préparés dans PR365, sur sa
tête précédente27664c7, sans écraser main ni les travaux Claude. Main relu :
6203fe407c742fce562de2ae1cc7e6629d9162ac. Montage seul corrigé, garde inchangée.
CI à mesurer au nouveau SHA : argv complets comparés en helper isolé, témoin
1777 refusé précisément, prepare/execute et inspection dans des conteneurs
distincts. Aucun code applicatif exécuté dans Work ou sur le runner hors bac.

Dossier et relevé détaillés : leo/ACTIVATION.md, première section. Les mentions
« contrôle vide », « import à faire » et les anciens succès de tests ci-dessous
sont historiques. La graine connue est ba369884db05db6a4af321620e11790de61a2656.
Ne pas redemander l'installation ni rejouer execute ; garder r21-state et
R21_STATE_SEED inchangés. La correction ne réarme pas l'installation arrêtée.

Prochaine action : recevoir le correctif et ses preuves dans #365, puis préparer
la succession explicite d'installation en préservant l'ancienne ancre. Ce plan
reste ouvert ; aucun nouveau candidat ne peut être installé par simple reset.
Pas de fusion, contrôle direct, secret, migration réelle, envoi ni achat.

---

# Historique — 8 octobre 2026, kit candidat de pilote préparé

Cap : Léo conduit une mission bornée sous contrôle FINUBAR, avec arrêt durable
et reprise sans doublon. Aucune réception d’autonomie acquise.
Mandat de Paul « ok vasy » : construire et éprouver le kit dans Ultima ; pas
installer/importer/activer ni accéder au dépôt de contrôle exclu.

Base du code : main 5848ea99668ec8a901e746e2bed1d628241fb22f. PR365 brouillon,
branche codex/leo-raccord-reel-20261008. PR361 fusionnée depuis le diagnostic ;
préserver les travaux concurrents PR364/366 et la fondation inerte PR351.

Le dossier canonique est leo/ACTIVATION.md, section « Kit candidat du 08/10/2026 ».
Code préparé : état distant à ref courante/seed opérateur, CAS non forcé et nonce,
réserve avant effet, archive conservée, arrêt monotone, hôte Actions et conteneur
sans réseau/secret, deadline interne. Une seule fixture déterministe, pas Léo
modèle. Contrat1.1/runtime skill1.0 inchangés ; compatibilité Work1.4 non reçue.

Preuve initiale : source fc7d343433badea03d0e8cee3a223d6f5afed7b0,
run37811920873, 211 tests runtime verts dont45nouveaux et archive inerte générée.
Le relevé final de la version candidate, revue, contrôles et empreintes figure
dans PR365 ; toute version suivante exige ses propres contrôles. Aucun test local.
Prochaine action après ces contrôles : installation opérateur hors Work du
candidat exact, uniquement après accord distinct. Ne pas importer le squelette
PR351 et ne pas rétablir l’accès Work au dépôt de contrôle.

Le diagnostic du contrôle est clos : capture Paul du08/10 à18h07 Paris, dépôt
privé vide (Quick setup). Ne pas redemander cette capture. Aucun accès direct
Work au contrôle, import ou dispatch manuel. #353/#354 déjà fusionnées : ne pas
rouvrir leur fusion ni confondre leurs tests avec installation des agents.

Restent hors réception : hôte cible et exclusion globale, accord réel exact,
essai sur hôte cible et reprise neuve, identité propre/compatibilité Léo1.4,
autonomie permanente. Budget/cron/suivi continus non activés. Le16/10 n’est pas
une date garantie. Aucun secret, migration réelle, envoi, achat ou fusion.

---

# Historique — 5 octobre 2026, raccord et arrêt FINUBAR préparés

Mandat : raccord Ultima, absence d'auto-contrôle, arrêt externe par FINUBAR.
Code préparé : admission six champs, client, journal anti-rejeu ; garde
FINUBAR et arrêt global partagé entre missions ; dernière admission mémoire
sous verrou. Le détail et les critères sont dans leo/ACTIVATION.md,
section « Raccord Ultima et arrêt FINUBAR ».

Voies mesurées : connecteur exclut le contrôle ; navigateur Work propriétaire
déconnecté, réglages désormais derrière connexion. Autres authentifications
terminal non explorées ; hôte futur non installé. Impossibilité globale de
modifier le contrôle NON CERTIFIÉE. Ne pas faire un test d'écriture par une
voie contournant l'exclusion. Brouillon de garde dans Ultima ≠ contrôle installé.

Revue distincte et CI du nouveau SHA à relever dans PR353. Aucun test
applicatif local ; aucune preuve héritée des 104 tests historiques.
Checkpoint signé/courant, installation hors Léo, arrêt des processus et
réception LV1 restent ouverts. Pas de fusion/import/activation/secret/envoi.

---

# Historique — 5 octobre 2026, accès contrôle révoqué

La révocation par Paul est vérifiée pour le connecteur organisation
160835885 : 12 dépôts conservés, contrôle absent ; GET métadonnées du contrôle
refusé (404), lecture Ultima réussie. Avant ce changement, ses métadonnées
étaient accessibles parmi 13 dépôts. Aucun contenu ni secret du contrôle lu.

La page de réglages confirme l'enregistrement. L'exclusion globale des autres
voies (notamment séance navigateur propriétaire, CLI et applications)
reste non attestée : aucun contournement, import ou activation autorisé par
cette révocation.

Boucle fermée : correction de l'accès du connecteur et preuve avant/après.
Prochain lot cadré, non implémenté : admission, journal durable anti-doublon,
réconciliation après résultat inconnu et checkpoint protégé contre le rollback,
en réutilisant TrialHost/trial_resume/broker. Détail et critères de sortie
dans leo/ACTIVATION.md, section « Révocation vérifiée le 05/10/2026 ».
FINUBAR reste l'index d'état/dérive prévu dans le code.

Aucun code applicatif modifié ou testé dans cette correction documentaire.
Les preuves antérieures du protocole restent liées à leurs propres SHA.
Aucune fusion, import dans le contrôle, activation, nouvelle dépense,
publication, migration, workflow manuel ou émission externe.

---

# Historique — 5 octobre 2026, protocole R21 préparatoire

Demande : débloquer et mettre en ligne. Ultima est déjà déployé READY au main
`9a261c5fb1ac1a77bdf53e5b3f98444297b2599b` ; le dossier Python Léo est exclu de
Vercel. Le nouveau lot est une livraison privée de préparation, sans activation.

Le dossier du 04/10, commit `974099098469c74504eef266b5e4a0b8ba6f41df`, est
réutilisé. Protocole fermé et tests proposés dans
`leo/control_r21/protocol.py` et `tests/runtime/test_control_r21_protocol.py`.
Aucun des sept fichiers PR351 modifié ; PR351 reste ouverte et non fusionnée.
La version du format s'appelle désormais `protocol_version`, distincte de
la version de mission ; divergence préparatoire expliquée dans ACTIVATION.

AGENTS, CLAUDE et §11 LV1 v1.1 réellement relus. Aucun test applicatif local,
secret, import dans le contrôle, workflow manuel, effet métier ou envoi.
Revue indépendante et preuves CI du nouveau SHA à relever dans sa PR ;
la préparation n'hérite pas des preuves de la PR351.

Blocages : contrôle privé absent de l'accès mais existence/exclusion globale
non attestées (404) ; admission/checkpoint non installés ; collecte FINUBAR
autonome et transport privé non raccordés. L'agrégat servi date du 04/10.
La configuration propriétaire est déclarée manquante dans FINUBAR ; elle n'a
pas été remesurée par lecture de variables. Aucun secret n'est demandé.

Prochaine action unique après CI/revue de ce lot : préparer l'admission et
le checkpoint, en réutilisant le banc existant. Paul peut attester le contrôle
hors Work en parallèle. Ne pas importer le seul protocole comme kit complet,
ne pas annoncer d'autonomie ni de réception LV1.
État et rétroplanning : `leo/ACTIVATION.md`, section du 05/10 puis plan du 04/10.

---

# Historique — 4 octobre 2026, cadrage d'autonomie et premier diagnostic

**Boucle actuelle :** demande de Paul de cadrer précisément l'autonomie de Léo
et FINUBAR, puis réaliser la première étape. Dossier opératoire et rétroplanning
dans [leo/ACTIVATION.md](leo/ACTIVATION.md), section « Objectif d'autonomie — plan
du 04/10/2026 ». Ce fichier reste l'index de reprise ; aucun second plan canonique.

**Étape 1 réalisée :** lectures des règles actuelles, comparaison exacte du §11
v1.1 source/main, mesure identité et deux installations GitHub, contrôle des
versions et travaux concurrents, lecture des HEAD et grains des10 entrées
FINUBAR, audit distinct des opérations R21, protocole fermé et essais préparés.
Aucun test applicatif local, secret, import, dispatch, fusion ou publication publique.

**État mesuré :** main initialement `ab60a658ec3a1b06ea07d3c39be69d6051aa879d`, puis
`9a261c5fb1ac1a77bdf53e5b3f98444297b2599b` après fusion externe de PR352 ;
PR351 ouverte, brouillon, source `8c3ff37bb81e19bbe3a08fa0e0c97fbceadb2448`.
Sa préparation et les sept fichiers ne sont pas modifiés.
Rapport de ses CI sain/rouge/restauré/corrigé et revue :
https://github.com/PaulGERARD161098/Ultima-/pull/351
Le nouveau lot documentaire est séparé ; il n'hérite pas d'une CI exécutée sur son SHA.

**Fondation :** l'installation organisation160835885 est déjà
`repository_selection=selected`, avec12 dépôts exposés ; l'installation
personnelle163434661 est `all`, avec2 dépôts. GET métadonnées
PaulGERARD161098/leo-control-r21 renvoie404. Cela ne prouve ni existence ni
exclusion globale ; autres sessions/CLI/browser/App non attestés.
Ne pas redemander le passage all→selected pour l'organisation comme s'il
n'avait pas eu lieu. Ne pas créer/importer le contrôle par déduction.

**Produit distinct :** main consigne une preuve B1 capture/défaire du04/10,
puis un refus de suppression sans outil ; ce n'est pas une réception LV1.
FINUBAR et le mail lisent l'agrégat commité ; garde propriétaire présent.
La configuration de production reste à mesurer sans lecture de variable.
Le crédit épuisé du02/10 n'est plus repris comme blocage actuel.

**Cible proposée :** pilote continu borné le16/10, sous preuve de faisabilité
d'un vrai hôte/réveil borné et du stockage privé au05–06/10, puis après les jalons détaillés
d'ACTIVATION et leurs accords. Calendrier conditionnel, pas activation ni
promesse de service permanent. LV1 initial exclut24/7 et activation des rituels.

**Prochaine action unique :** préparer le schéma fermé des propositions et
ses refus sur une branche distincte, réutiliser trial_host/broker et leur
frontière fixture ; revue indépendante puis CI pull_request isolée.
Aucune ouverture du serveur loopback sur Internet.

**Interdits conservés :** aucune fusion, aucun import dans leo-control-r21,
aucun secret, aucun lancement manuel de workflowR21, aucun test applicatif
hors CI isolée prévue, aucun force-push, aucune publication publique.
L'accord serveur, l'import/ancrage et l'activation continue restent des étapes
réservées/à autoriser précisément une fois leur résultat concret et revu.

**Travail concurrent préservé :** PR352, initialement brouillon pendant le
diagnostic, est désormais fusionnée ailleurs dans main9a261c5. Le lot documentaire
reprend cette base et conserve CADRAGE-ULTIMA, FINUBAR, les deux agrégats et
JOURNAL-DECISIONS. AGENTS/CLAUDE/§11/ACTIVATION/reprise relus au nouveau SHA,
blobs inchangés. La source PR351 reste identique ; ses preuves d'intégration
ancienne ne sont pas promues preuves de la nouvelle cible.

**Revue :** instance distincte, verdict final favorable du cadrage après
précisions sur historique, demandeur/anti-rejeu et faisabilité hôte/réveil.
Aucune installation, CI documentaire ou réception LV1 n'en est déduite.

Les sections ci-dessous conservent les preuves et états historiques avec leurs
dates/version. Les anciennes « prochaines actions » ne remplacent pas celle
ci-dessus ; la revue PR351 ne vaut ni installation ni effet R21 sous accord réel.

---

# Historique — 30 septembre 2026, diagnostic GitHub Team clos

**Fait :** intégration préparatoire de main `ce1ff937465e5d65a269b481b9ee488b65e02ffa`
(PR310/311) dans la branche `codex/leo-lv1-20260929`, source technique
`9833b8096eba8414cc3823c4b877aea4c3f62f2e`. PR306 ouverte, brouillon, non fusionnée.
Intégration CI `3b3933899be60cef7073d1bccc6edfe6680f9f71`, même arbre que la source :
`3467660ee5ae0c20612cba26571b886ca305fb99`. Les cinq recouvrements ont une revue
indépendante favorable. Mission Léo, changements Omega, références B1 §12 et
contrat canonique §11 v1.1 conservés. Le nouveau commit de documentation ne sera
pas présenté comme la source ayant exécuté ces tests.

**Compétences réellement lues dans cette nouvelle session Work :** Léo LV1 1.0
(29/09), contrat embarqué 1.1 comparé au §11 canonique ; Méthode Paul adaptation
v2 (28/09), source déclarée 45ec49a1dd0f. Cela fournit le témoin positif de lecture
R22 ; le cas réel de compétence inattendue reste ouvert. Aucun reçu d'un effet
R21 sous accord réel n'existe encore à reprendre.

## Preuves de l'intégration et portée

Runs LV1 `36688494238` et Auth `36688494325` terminés success et logs relus.
Runtime : 95 tests à 08:15:22 UTC. Auth réelle GoTrue sur comptes fictifs :
AUTH_GETUSER_REQUIRED, HOST_AUTH_REQUIRED et HOST_STOP_REQUIRED détectent leurs
mutants ; arrêt authentifié, réponse perdue puis reçu retrouvé par nouveau hôte
et nouveau processus sans doublon, à 08:15:59–08:16:01 UTC. Accords/revues de ce
harnais simulés ; nouveau processus ne vaut pas nouvelle session Work.
Tests `36688494260` terminé success : 53/53 suites unitaires à 08:15:38 UTC,
53/53 harnais navigateur (groupe 0 : 27 à 08:23:20 UTC ; groupe 1 : 26 à
08:25:33 UTC). Les huit jobs des trois runs sont terminés success. Logs relus :
Mission Léo conserve GET403/503, conflit/brouillon, reçu après réponse perdue,
arrêt et rendu mobile ; navigation Omega et deux témoins cadenceTenue verts.
Les identités/transports navigateur sont simulés ; l'Auth réelle sur comptes
fictifs est éprouvée séparément. Aucun résultat de réception globale déduit.
Les preuves complètes et les gardes ouvertes sont dans `RECETTE-LEO-LV1.md`.

**Disponibilité du paquet historique relue le 30/09 :** artefact 11045864094,
run 36597170079, expired:false ; ZIP 6459 octets téléchargé. SHA256 ZIP/TAR
concordants :74b6001be078215daa9fa979164aff62f3541f7a43789dc989dd74ddbd2f806a
et 9c0aaa2d718d3fcc4084efdaf998edd2ee0480c67c3c892cbbaf2c69f29869de.
Lecture bornée de 37 entrées, sans extraction ni exécution applicative.
Son candidat mandat conserve l'expiration historique 30/09 à 18:22:32 Paris ;
aucune autorité ni validation n'a été importée. Le dossier précis historique
reste consigné ci-dessous ; il ne décrit pas la nouvelle intégration Omega.

## Nouveau dossier candidat R21 — distinct de l'historique

La CI actuelle a préparé un nouveau paquet sans accord ni fusion. Il ne
renouvelle pas un mandat activé et n'hérite pas de la revue de l'ancien paquet.

- Run `36688494238`, artefact `11084992584`, 6505 octets, expired:false,
  conservation annoncée jusqu'au 07/10/2026 à 08:15:23 UTC.
- ZIP SHA256 `8f0addb11fe50e57266f963e621b51d871e2059fa59809fd9ca6a71195c6fddb`.
- TAR SHA256 `163400af72db8c21e801c786d7003c36b20a741e29435810031eaa41e695555e`.
- Provenance : source 9833b8096eba8414cc3823c4b877aea4c3f62f2e,
  cible ce1ff937465e5d65a269b481b9ee488b65e02ffa,
  intégration 3b3933899be60cef7073d1bccc6edfe6680f9f71.
- Contexte fixture : `/trial-output/trial/fixture.git`, compte `fixture-account`,
  environnement `fixture`, source `refs/heads/patch` @ 778c50707af054e3385bee06976b2ce0ee70b9d5,
  cible `refs/heads/main` @ 59ad2653221e8549b63fdaa6636adce8824f5260,
  intégration 3448ac3ff1fe3ed2746c9436893368e2ba809184, mode `integration_commit`.
- Mission `r21-two-items`, version attendue 2, opération `r21-merge-1`,
  seul effet `update_fixture_ref`, publication:false.
- Candidat daté 30/09/2026 à 08:15:23 UTC, expires_at 1790842523.2820578
  (01/10/2026 à 10:15:23.282 Paris). **Candidat de données, pas mandat activé.**
- Hashes/provenance relus ; manifeste `approval_present:false`,
  `independent_review_present:false` : cet état décrit l'archive produite.
  **Revue indépendante nouvelle favorable sur ce paquet exact** : sept objets
  Git/digests/refs, patch minimal et oracle, preuves rouge/vert, deux reçus
  d'inspection et registre version 2 concordants ; aucune opération de fusion,
  budget 2/4 unités et 2/3 appels. Provenance GitHub/run relue indépendamment.
  Lecture statique et SQLite query_only en mémoire, aucun code exécuté,
  Binding/Approval non construits. Cette revue reste externe à l'archive et
  n'est ni une approbation de Paul, ni une autorité importable du paquet.

Aucune fusion de ce paquet n'a eu lieu. Une relocalisation, une nouvelle cible,
un autre moteur ou une évolution du dossier imposent leur revalidation. Le
chemin de fixture ci-dessus appartient à la CI ; ce n'est pas un hôte Work installé.

## Restant, blocages et prochaine action unique

**Diagnostic réel clos par captures de Paul :** GitHub Team, dépôt privé ;
environnements copilot/Preview/Production, Preview No restriction, aucune
protection classique, API rulesets `[]`. L'application couvre tous les dépôts
de l'organisation mais ne dispose pas d'Administration affichée. Connecteur
authentifié `paggerard-boop` (ID277032273), permission admin ; même compte
auteur de PR306 et des runs issus de nos écritures. L'outil de revue natif
existe : une revue de cette seule identité ne prouve pas l'accord humain.

La piste d'approbation d'environnement privé sous Team est donc écartée.
Aucun abonnement ou réglage modifié, aucune revue/commentaire publié.
Paul a fourni les captures utiles ; aucun navigateur ouvert. La demande
d'inspection n'est plus la prochaine action.

Les trois workflows de `c462743` sont tous success : Tests 36690374581,
LV1 36690374620, Auth 36690374628. Les preuves détaillées 95/53/53 restent
rattachées à la source technique 9833b80 ; aucun nouveau candidat R21
n'hérite de la revue de l'artefact 11084992584.

**Prochaine action unique — responsable Paul puis Léo :** établir la fondation
de confiance proposée et relue : application limitée aux douze dépôts existants
en les conservant tous, nouveau dépôt de contrôle privé exclu. Aucun lanceur
ou effet n'est autorisé par cette fondation. Léo vérifie ensuite son exclusion
réelle de tous les accès Work, avant de retenir le canal et de préparer le kit
concret. Le plan et les douze noms sont dans `leo/ACTIVATION.md`.
Dépôt de contrôle, ancrage, jeton, code d'admission, transport et checkpoint ne
sont pas installés. L'installation du kit sera proposée après préparation/revue.
La signature hors Work reste une autre option sous ancrage extérieur non
remplaçable par l'agent.

Après exclusion mesurée et kit préparé/relu : Paul importe le lanceur dans le
contrôle séparé ; dossier R21 transféré et revalidé ; accord exact ; effet fictif
isolé ; reçu conservé ;
reprise en nouvelle session Work ; gardes critiques ; réception finale.
Aucun accord R21, aucune réception globale ou maîtrise générale des outils
Work déduits du diagnostic.

**Évolution concurrente à préserver :** avant l'écriture documentaire, main
est `a2e27d55ae8a0cf97ef53223993fb9ea74b3e913`, deux commits après ce1ff :
PR309 (B1/journal/RLS et cadrage) puis PR313 (constellations IMLADRIK).
Ces changements ne sont pas intégrés ici et les preuves de ce1ff ne les
valident pas. Relevé ciblé effectué, aucune migration SQL/RLS appliquée.
Le contrat LV1 et le lot B1 demeurent à confronter sans confondre leurs numéros
de sections. Ne pas écraser le travail concurrent ni rejouer les migrations
déclarées appliquées dans main.

Autorisés : lectures utiles, préparation sur branche, sauvegarde versionnée,
revue indépendante et tests fictifs isolés. Restent hors périmètre sans accord
supplémentaire : fusion PR306/autre PR, publication/déploiement, migration SQL/RLS
réelle, modification/suppression de données métier, envoi, nouvelle dépense et
exposition de secrets. SQL PT409 toujours proposé, pas appliqué ici.

Les états du 29/09 qui suivent sont historiques ; leurs sources et limites ne
sont pas les preuves de la nouvelle intégration. Ne pas rejouer le registre installé.

---

## Clôture du lot et transfert R21 — 29/09 après 23 h 35 Paris

**Évolution concurrente conservée :** `1cfc66f5184390817abb4d8dea2e84861bde3b40`
ajoute l'arrêt HTTP authentifié et ses épreuves. Les preuves cc03cb8 ci-dessous
ne valident pas automatiquement ce nouveau code ; résultats propres à relever
dans PR306. La présente mise à jour ne modifie aucun fichier exécutable.

Source technique relue cc03cb8674ea6a5c44e1018b84e26f4d88d371d4,
main 2e4f655fbaa3ced4024c7d417ef257e8432d337b ; PR306 ouverte,
brouillon, non fusionnée. CI source cc03cb8 : huit jobs réussis,
91 tests runtime, 53 suites unitaires et 53 harnais navigateur.
Runs Tests 36630912935, LV1 36630912719, Auth 36630912766.
Intégration e3463fa3ed51ae97dd169b539e65e8db04f5f628,
arbre d4918cf3493d131df683206362ba9de484f56f3f identique à la source.
Les journaux runtime et Auth et les conclusions des trois runs ont été relus
pendant cette clôture ; mesures originales du 29/09, 21:05–21:16 UTC.

Correction documentaire nécessaire : les attentes de réépreuve writer_required
et CI du raccord hôte étaient périmées. La matrice est actualisée, sans
changement du contrat ou du code exécutable. Revue indépendante : ne pas
imposer un hébergement permanent (hors périmètre initial), un fournisseur
payant ou la maîtrise des frais internes Work pour recevoir LV1/R27.
Le budget simulé et les témoins CI sont qualifiés dans leur périmètre exact.

**Dossier R21 historique effectivement relu, distinct de la nouvelle fixture :**

- Artefact 11045864094, run 36597170079 ; revue indépendante antérieure
  rattachée à ce paquet, pas accord de Paul.
- ZIP SHA-256 : 74b6001be078215daa9fa979164aff62f3541f7a43789dc989dd74ddbd2f806a.
- TAR SHA-256 : 9c0aaa2d718d3fcc4084efdaf998edd2ee0480c67c3c892cbbaf2c69f29869de.
- Provenance Ultima : source 220fb9515291c9e62c076d06e4fa3dc608166db7,
  cible fb7daac613a0828d4135333fbd27a47102323211,
  intégration 2c8b70638c73949eb8e5485b0f2280627f5526b3.
- Contexte fixture relu par la CI cc03 : dépôt /trial-output/trial/fixture.git,
  compte fixture-account, environnement fixture ;
  source refs/heads/patch @ 778c50707af054e3385bee06976b2ce0ee70b9d5,
  cible refs/heads/main @ 59ad2653221e8549b63fdaa6636adce8824f5260,
  intégration 3448ac3ff1fe3ed2746c9436893368e2ba809184,
  mode integration_commit.
- Mission r21-two-items, version attendue 2, opération r21-merge-1,
  effet limité à update_fixture_ref ; aucune publication.
- Expiration du mandat candidat : 30/09/2026 à 16:22:32 UTC
  (18:22:32 Paris), issue du expires_at 1790785352.3481658.
  Métadonnées relues via l'outil des artefacts du run : expired:false,
  digest ZIP concordant ; expiration de conservation 06/10/2026 à 16:22:33 UTC.
  La validité du mandat expire avant celle du fichier. Disponibilité à relire
  avant transfert ; aucune disponibilité future n'est promise.
- La dernière reprise vérifiée reste ready_for_review, merge_available:false,
  global_v1_accepted:false. Le paquet ne confère aucune autorité.

Ce bloc décrit une proposition d'épreuve, **pas un accord ni une commande à
exécuter**. Le chemin local ci-dessus est celui de la CI, pas un chemin présent
dans Work. Relocalisation, évolution de preuve/code ou renouvellement du mandat :
vérifier leur effet sur le contexte et présenter un nouveau dossier exact.
Le paquet récent 11061493630 de cc03cb8 n'hérite ni de cette revue ni d'un accord.

**Blocage technique mesuré :** le terminal a été rétabli après une panne
exec-server transport disconnected. Docker et Podman sont absents ;
`unshare --user --map-root-user --net --mount /bin/true` échoue sur uid_map,
`bwrap --unshare-all ... /bin/true` échoue sur NETLINK_ROUTE, tous deux avec
Operation not permitted. Aucun code applicatif n'a été exécuté hors isolation.
Le catalogue accessible ne fournit pas de commande pour appeler l'hôte R21
authentifié, lui transmettre une approbation utilisateur vérifiée ou imposer
un contrôle global des outils Work. GitHub permet toujours la préparation
versionnée. Aucun service permanent, plugin ou route d'accord n'est installé.

**Prochaine action unique :** établir un canal temporaire de confiance
effectivement utilisable pour ce dossier d'épreuve, avec identité et accord
fournis hors modèle ; puis présenter l'accord exact et reprendre le reçu dans
une nouvelle session Work. Une session neuve seule ne résout pas le canal absent.
Ne pas demander de nouvel accord générique, ni rejouer les simulations vertes.
Aucune fusion PR306, publication, migration réelle ou dépense ne fait partie
de cette clôture. Les entrées suivantes restent historiques.

---

# Léo LV1 — construction du 29 septembre 2026

**État : lot préparé, réception LV1 ouverte.** Aucun merge ni déploiement autorisé
par ce document. Base lue : `fb7daac613a0828d4135333fbd27a47102323211`.
La PR concurrente #302 et sa branche sont préservées.

## But et méthode

Paul demande de construire ce qui manque et de préciser comment appeler Léo.
Dans Work : « Utilise Léo LV1 pour construire [objectif] dans Ultima. » Le skill
donne les consignes à l'agent de la session ; la construction utilise ses outils
réellement accessibles. Aucun processus permanent n'est créé par le skill.

Réutiliser Léo, les routes authentifiées, Finubar et le cadrage existants ;
préparer les correctifs, leurs fixtures, une revue indépendante et une branche
vérifiable. Critères de ce lot : contexte client sans autorité système, comparaison
atomique de l'essence, refus explicite du rejeu aveugle, collecte bornée et datée,
échecs visibles. Pre-mortem : prendre des fixtures pour une preuve de production,
un prompt pour une barrière de sécurité ou une branche pour une publication.

## Ce qui est construit dans le code

| Partie | Changement | Limite |
|---|---|---|
| Gouvernance | Contrat v1.1 intégré au §11 du cadrage canonique ; CLAUDE, Léo et AGENTS alignés ; erreurs des hooks visibles | Une instruction n'est pas un contrôle d'effet externe |
| Données Léo | État navigateur en bloc JSON utilisateur, provenance non vérifiée, dates inconnues explicites ; clés héritées refusées | Résistance réelle du modèle aux injections non prouvée |
| Enrichissement | `essence_attendue` transmise et filtrée atomiquement avec l'identifiant ; `null` et espaces préservés ; conflit 409 | Les autres PATCH restent compatibles et inconditionnels ; pas de version globale ni protection ABA |
| Écriture incertaine | Réseau/5xx/réponse non lisible signalés comme issue inconnue, sans invitation au rejeu | Pas encore d'identifiant durable d'opération et de réconciliation R25 |
| Finubar | Repli GitHub opt-in, commit épinglé, empreinte blob recalculée, erreurs distinguées, dates conservées et couverture visible | PR, CI, dérive et permissions GitHub non mesurées ; aucun appel réel effectué |
| Tests | Fixtures nouvelles, lanceur Docker fermé sans réseau/secrets, limites ressources et sonde enfant | Exécution bloquée localement ; configuration CI à éprouver |

## Preuves et revue

- Mesuré : contrôle syntaxique des fichiers modifiés (`node --check`, `bash -n`)
  et absence d'erreurs de whitespace (`git diff --check`). Ce ne sont pas des tests
  de comportement.
- Revue indépendante statique : correction d'une interruption de collecte sur
  JSON `null`, de la provenance absente à l'écran et du message 409 trop spécifique.
- Non exécuté localement : suites applicatives et sonde d'isolation. L'environnement
  refuse les namespaces bwrap (`Operation not permitted`), ne fournit pas Landlock
  (`ENOSYS`), refuse chroot (`EPERM`) et n'a pas Docker. Aucune variante non isolée.
- Historique externe : le run main `36483489290` échouait avant toute étape visible
  (runner absent) lors de la lecture du 29/09. Cause non établie. Ce constat ne prouve
  pas une panne du code et ne vaut pas résultat du présent lot.
- La CI prépare une image puis exécute le code avec réseau coupé, système et dépôt
  en lecture seule, utilisateur non privilégié, sans transmettre les variables
  secrètes. Les ID d'images sont enregistrés dans les logs. Les images sont résolues
  au lancement : leur disponibilité et la compatibilité des suites restent à prouver.
- Frontière de confiance : workflows et lanceurs sont du code de contrôle revu ;
  une modification hostile de ces fichiers sur l'hôte contournerait le dispositif.
  Ils ne constituent pas encore un contrôleur indépendant immuable. Le runner LV1
  ne monte que api/js/tests/finubar/package.json ; les suites complètes lisent aussi
  la documentation du dépôt, mais .git est masqué et memoire ne contient que LECONS.md, nécessaire au contrôle d’empreinte.
  Les logs CI restent réservés au dépôt privé. La sonde ne prouve pas l'ensemble
  de R23 ni l'absence de tous les canaux de fuite.

## Réception restant à construire et à éprouver

Le lot ne suffit pas à recevoir LV1. Les exigences complètes et R01–R28 restent
celles du contrat canonique ; aucune ligne n'est déclarée réussie par intention.

1. Disposer d'un moteur d'exécution isolé qui accepte les tests adverses, puis
   éprouver les effets indirects et enfants (R23), pas seulement lire ses options.
2. Brancher un contrôle des effets et des habilitations hors du modèle. Une route
   de propositions et une confirmation visuelle ne sont pas ce contrôleur.
3. Choisir le support transactionnel canonique des mandats, preuves, identifiants
   d'opération et versions de mémoire avec droits/conservation. Réutiliser les
   structures existantes après inventaire ; aucune migration réelle faite ici.
4. Construire les réservations de budget partagées et l'arrêt global hors modèle
   (R27), y compris délégations et appels engagés. Aucun budget facturé activé.
5. Éprouver la réconciliation après réponse perdue (R25), les droits inter-quadrants
   (R24) et la concurrence de mémoire (R28). Le CAS d'une idée n'en est pas l'équivalent.
6. Exécuter le cycle complet R21 sur dépôt d'épreuve, avec revue, accord de fusion
   lié aux versions, vérification et reprise dans une session neuve ; présenter
   ensuite les preuves R01–R28 à Paul pour décision de réception.

Prochaine action technique : lire les résultats de la seconde CI après correction du montage de LECONS.md. Si le
runner reste indisponible, fournir un hôte Docker autorisé pour exécuter
`LV1_NODE_IMAGE=sha256:<ID local> npm run test:lv1`. Ne pas annoncer les tests verts
ni demander la fusion tant que les preuves critiques restent manquantes.

La branche `codex/leo-lv1-20260929` désactive son déploiement automatique Vercel
dans `vercel.json` dès son premier commit. Cela ne désactive pas les autres branches
et ne constitue aucune autorisation de déploiement manuel. Le merge reste soumis
au contrat et pourrait déclencher la production ; il n'est pas demandé ici.

## Première exécution distante — preuve au 29/09, 07:43 UTC

Sur le commit source `b6f33119684edb8f301f523708983d8736c91a0a`, la CI a
réellement éprouvé l’intégration `034c3c08836b1ea0855c822f5e008e49e96bee5c`
avec la cible `fb7daac613a0828d4135333fbd27a47102323211`.

- Run `36538258817`, job `109307270663` : **6/6 suites LV1 réussies** ;
  sonde enfant réseau/écriture réussie. Image ID
  `sha256:88f8ba583a884279252779bbe221bf1ff2c61cf236cc973f8ca97676ae6d07f0`.
- Run `36538258739` : **46/47 suites générales réussies** dans les deux jobs ;
  l’unique échec est LECONS.md rendu absent par le masquage intégral de mémoire.
  Le navigateur n’a pas encore été éprouvé car le harnais s’arrête à cet échec.
- Correction : monter en lecture seule uniquement LECONS.md pour son contrôle
  d’empreinte, en gardant le reste de la mémoire et .git hors de portée. Aucun
  test supprimé ou ignoré. La seconde CI doit valider ce changement.

Ces résultats remplacent le statut « pas d’exécution distante » du bilan initial ;
le blocage local demeure. Ils ne reçoivent ni R23 en entier ni LV1.

## Reprise du 29/09 à 12 h 52 Paris

Le commit `df2a64713e84e6c021cef56e3df72625ea0b6c1c` a obtenu 47/47 suites
unitaires (run 36538966423, job 109309552854) et 6/6 suites ciblées plus la
sonde enfant (run 36538966438, job 109309552407). Le job navigateur 109309552557
a été interrompu à sa limite de 15 minutes pendant smoke-pilotage.mjs.
Les scénarios Léo et Finubar sont passés auparavant ; cela ne valide pas la
suite entière. Les répertoires XDG et le cache de captures sont désormais réglés.

Correction du banc : deux jobs navigateur indépendants, chacun conservant
l'isolation et une limite de 15 minutes. Répartition modulo déterministe des
52 fichiers : 26 + 26, sans doublon ni omission ; les deux jobs sont requis,
aucun test écarté. Leur nouveau résultat reste à lire avant de clôturer le lot.
Le statut courant et les liens de preuve sont tenus dans la PR #306.

## État courant — 29/09, contrôleur éprouvé à 11 h 15 UTC

Ce point remplace les prochaines actions historiques ci-dessus. Paul a demandé
de terminer la V1 complète ; celle-ci n'est pas encore reçue. La matrice
`RECETTE-LEO-LV1.md` relie les 28 exigences aux preuves et aux écarts restants.

Le premier lot au commit distant `591ca521a29c63a7050507109c6abe2707ae933f`
est vert : run Tests 36558482709, jobs unit 109373314761 et browser 109373315139 /
109373315896. Les 52 harnais sont répartis en deux groupes sans omission.
Run LV1 36558482874 vert également. Les défauts de montages Docker observés
plus tôt sont corrigés ; les échecs anciens restent dans l'historique.

Le contrôleur `leo/runtime` est maintenant construit et exécuté en CI isolée :
droits hors proposition du modèle, budget SQLite partagé, mémoire avec ACL et
versions, registre d'opérations et réconciliation, fusion Git locale atomique.
Le code ne possède ni adaptateur métier de production ni connexion à Ultima.
Lire `leo/README.md` pour les limites et le choix du registre technique unique.

Preuve : source `5d75b9922c134ff28d92ae2070a399f678e36ebc`, cible
`fb7daac613a0828d4135333fbd27a47102323211`, intégration testée
`04c9c5b3613523cbd90bf68bc15ae951dfec9c83`. Run 36560513064, job
109379983478 : **55 tests Python uniques réussis** à 11:15:01 UTC,
Git 2.39.5, image Python
`sha256:bb31e660647633ecd0a394013306057121b4fd091e2bf214010558249c5e1eb9`.
Le run initial 36560319735 comportait 71 passages dont 16 doublons dus à
l'héritage de classes de test ; ces doublons ont été supprimés sans perte de cas.

La revue indépendante a fait corriger délégation après arrêt/expiration,
références Git symboliques, règlement après interruption et réconciliation par
un lecteur. Aucun autre blocage identifié dans ce périmètre statique ; cela
n'est pas une revue positive des chemins métier non intégrés. Le test de refus
du lecteur est encore renforcé pour vérifier le motif exact `writer_required`.

Le cycle de test modifie réellement un fichier fictif, observe l'échec avant
correctif puis la réussite, fusionne localement et retrouve le résultat depuis
un nouveau processus après réponse perdue. L'accord et la revue de ce scénario
restent simulés. Les essais réseau/écriture interdite parent et enfant passent.

Prochaine action : achever les parcours de réception et choisir le raccord
exécutable au produit. L'environnement Work présent n'offre pas de service
persistant isolé pour héberger ce contrôleur ; la CI prouve son exécution en
conteneur, pas un service actif. Ne pas créer une base SQLite éphémère dans une
fonction Vercel en prétendant fournir une mémoire durable. Aucun budget externe,
hébergement payant, migration réelle, merge de production ou publication activé.

### Dernière vérification du contrôleur — 11 h 17 UTC

L'oracle précis `writer_required` a également réussi : source
`a2c5ee774bd3dd7f11c230a03e157e41509b8524`, intégration
`e898925a472fb0be6b8d435e93b88034da693789`, même cible. Run 36560818204,
job 109380975084 : 55/55 tests à 11:17:59 UTC, même image Python. Le job
JavaScript LV1 de ce run est vert. Les documents ajoutés ensuite ne modifient
pas ce contrôleur, ses tests ou ses lanceurs.

Sept scénarios comportementaux et le témoin financier positif R13 sont désormais
consignés dans `leo/RECETTE-COMPETENCE.md` et `leo/RECETTE-R13.md`, avec
relecture distincte et sources pour R13. Ils ne valent pas parcours intégré.
La possibilité Sites MCP a été vérifiée : endpoint privé et D1 disponibles,
mais pas hébergement direct du moteur Python/Git isolé préparé ici ; aucune
création de site ou nouvelle base effectuée. Les prochains travaux dépendent
du raccordement de l'exécuteur puis de la recette intégrée, pas d'une répétition
des tests unitaires déjà verts.

## Raccordement aux services existants — état du 29/09, 13 h 51 Paris

L'analyse complémentaire remplace le besoin supposé d'un nouvel hôte pour le
registre : Vercel et Supabase d'Ultima suffisent à préparer la mémoire/budget.
Le moteur Python reste un banc d'épreuve, sans deuxième registre actif.

Commit distant `7dee1984798ae9743c31ed8bf7561650e2bc4317` : API
`api/leo-registre.js`, proposition `leo/proposals/registre-postgres.sql`,
tests API/PGlite et concurrence réelle entre deux connexions PostgreSQL 17.
Les nouveaux tests sont écrits, vérifiés syntaxiquement, mais leur résultat CI
n'est pas encore disponible à ce point de reprise. La branche distante a été
relue et pointe bien ce commit ; ne pas réutiliser les résultats du contrôleur
Python comme preuve SQL/API.

Revue distincte sans bloqueur statique restant après correction du statut en
une requête SQL cohérente. Droits, CAS, budget, résultat et idempotence sont
regroupés transactionnellement ; les tests doivent confirmer ces propriétés.
La portée de SELECT direct pour les lecteurs habilités est documentée.

Préflight Supabase réel en lecture seule : PostgreSQL 17.6, aucun objet du
registre proposé encore présent. Aucune installation effectuée. Lire
`leo/ACTIVATION.md` pour la cible, le périmètre et le changement à approuver
une fois vérifié. Le contrat LV1 exige une révision explicite avant application
SQL/RLS réelle ; la fusion/publication nécessite son propre accord précis.

Prochaine action : obtenir et lire la CI du nouveau commit, corriger tout échec,
puis proposer l'installation exacte du registre. La réception V1 reste ouverte,
notamment le raccord des effets externes et le parcours complet R21.

À 13 h 54 Paris : plusieurs lectures ne montrent encore aucun run pour le
nouveau commit. La référence de branche renvoie `7dee198…`, mais la fiche PR
renvoie encore `c7be5e…`, même après mise à jour de sa description. Cet écart
observé ne permet pas d'annoncer les nouveaux tests en cours ni réussis. Ne pas
relancer les anciens jobs en les prenant pour une preuve du nouveau code.

## Résolution de l'attente CI — 13 h 56 Paris

La CI s'est déclenchée sur `1ac34512cd72f8d22b9f6e3bbbaee7529cd4fe22`,
qui conserve exactement le SQL/API de `7dee198…`. Run `36564708408` entièrement
vert : LV1, 55 tests runtime, API/PGlite, concurrence PostgreSQL 17. Logs relus.
Intégration `49f3b31c085db635e2356e3c9431305544df69d3` avec `fb7daac…`.
Deux clients PostgreSQL mesurés en attente de verrous : un succès, un conflit
40001 ; une opération, un appel, une unité ; reprise du reçu sans double effet.

Le changement exact est maintenant présenté dans `leo/ACTIVATION.md`, avec
son empreinte SQL et sa cible. Prochaine étape nécessitant l'accord manquant :
installation de ce registre neuf dans Supabase réel, sans publication, fusion,
mission créée ni dépense fournisseur. La compétence Léo LV1 et le contrat §7
réservent cette application SQL/RLS réelle à une révision explicite du mandat.
La réception intégrale R01–R28, en particulier les effets externes et R21, n'est
pas prononcée par cette réussite technique.

## Installation SQL — accord du 29/09 à 14 h 50 Paris exécuté

Paul a autorisé le SQL précisément présenté. Après vérification d'empreinte et
préflight sans collision, le connecteur Supabase a confirmé l'application de
`20260929125105_leo_lv1_registre_transactionnel` au projet `leosfqyidgsaescjbfom`.
La migration locale restitue l'exemplaire exact approuvé, numéro issu de l'historique
réel, sans seconde application. Voir `leo/ACTIVATION.md` pour toutes les preuves.

RLS/grants/fonctions vérifiés après installation ; accès anonyme et mutation
directe fermés. Test de refus sans identité en READ ONLY réussi, zéro mission
et zéro opération. Aucun défaut du registre dans Security Advisors ; avertissement
Auth sur protection des mots de passe compromis consigné, sans modification.
L'API n'est pas publiée et aucun merge n'est réalisé. Prochain travail : raccorder
et éprouver le parcours utilisateur sous les autorisations de livraison requises.


## Go solo du 29/09 après 16 h 27 Paris — parcours mémoire construit

Point de départ distant relu : PR306 source e35ac9085da34c53d969e14040c63a778aafa1cf,
cible fb7daac613a0828d4135333fbd27a47102323211. Travail local propre au départ.

L'entrée Mission Léo est ajoutée à l'accueil existant, avec client déterministe
vers la route de registre : lecture, état/prochaine action, arrêt, conflit et
réconciliation par reçu. Le journal minimal de l'onglet est écrit avant POST,
séparé par utilisateur, sans contenu métier ni token. Rechargement du même
onglet couvert par la conception ; fermeture définitive/autre appareil non reçus.
Le changement de compte détruit client et contenu affiché ; aucune action externe
ni délégation n'est ajoutée. Création de mission réelle non exécutée.

Revue indépendante ciblée terminée, sans bloqueur connu restant avant CI.
Corrections issues des passes : entrée initialement dans écran connexion
(déplacée dans accueil), brouillon confirmé pouvant inviter un second envoi,
arrêt inaccessible pendant réconciliation, puis perte du verrou lors d'un arrêt
perdu ou d'une tentative d'arrêt refusée. Le contrôle conserve maintenant la
preuve attendue d'écriture ET d'arrêt lorsque nécessaire.

Épreuves ajoutées : tests/unit-leo-registre-parcours.mjs compose client, route
et SQL PGlite réels avec identité/HTTP fictifs ; tests/smoke-leo-registre.mjs
parcourt index.html sur mobile390px, avec interception des accès. CI registre
branche le nouveau parcours ; navigateur découvert par le runner existant.
Syntaxe et diff vérifiés localement ; aucune exécution applicative locale.
Résultats CI de ce nouveau lot à relever avant toute conclusion de réussite.

Avant/après : aucun accès UI au registre auparavant ; parcours de mémo intégré
maintenant préparé. Même hébergement/auth/SQL, aucune dépendance nouvelle,
aucun appel modèle. Gain de temps et coût non mesurés. Activation API, mandat
de mission réelle et recette globale demeurent distincts.

### Première exécution de cette tranche

Source `1a45948f008ec6a60bfb6d2a2d526ca65d535e5c`, intégration
`b8379c41dfec0585908cdd50f1deaf1fedc09a05`, cible `fb7daac…`.
Run LV1 `36584032243` réussi, log job `109459423347` relu : parcours composé
client→route→SQL réellement exécuté avec succès à 16 h 38 Paris. Unit général
réussi. Les deux groupes navigateur du run `36584032205` ont trouvé un défaut
d'intégration de l'entrée : dans l'en-tête, elle augmente sa hauteur, réduit les
cibles tactiles de la carte et hérite de pointer-events:none. Le nouveau test
refuse le clic intercepté ; l'ancien harnais cibles-telephone détecte cinq écarts.

Correctif : déplacer le bouton hors de l'en-tête mesuré, dans la zone supérieure
de commandes, position fixe et pointer-events:auto. Aucune modification du
moteur de carte ni de ses seuils ; aucun test affaibli. Repreuve CI nécessaire.

## Go solo suivant — transport contrôlé et préparation R21

Reprise distante relue : source `45185d01e900e17e27b6071ecab882318314c1d9`,
cible `fb7daac613a0828d4135333fbd27a47102323211`. Le correctif concurrent
permettant d'abandonner un brouillon après GET refusé est conservé. Les sept
jobs verts du lot précédent `55d8075…` restent une preuve historique distincte.

But : rendre l'épreuve R21 concrète et reprenable. Étapes : contrôler une
transmission fictive, préparer défaut/correctif/oracle/dossier, revue adverse,
CI isolée et conservation du paquet. Moyens : composants Python existants,
nouveaux dispatch/transport/trial et workflow runtime. Réussite attendue :
refus sans transmission, contexte minimal, arrêt/concurrence/réponse perdue,
rouge avant correctif puis vert, reprise sans effet et gate de fusion fermé.
Hors périmètre : données métier, dépense, publication et accord de fusion déduit.
Pré-mortem : fuite via paquet exporté, config Git hostile, doublon après perte
de réponse, simulation prise pour réception. Préventions intégrées au lanceur,
au transport fermé et aux épreuves adverses.

Avant : fonctions de contrôle de délégation sans consommateur de transport,
cycle R21 entièrement créé dans un test avec accord fictif. Après préparé :
DispatchBroker devant un inspecteur déterministe, dossier R21 exportable,
deux transmissions contrôlées et refus de fusion sans accord. Même registre
SQLite d'épreuve/budget partagé, aucune dépendance produit ni service ajouté.
Coût Work/fournisseur non mesuré ; unités fictives seulement. Ce raccord ne
contrôle pas les outils Work ni une délégation externe en production.

Revue indépendante statique : défauts d'export via montage inscriptible, lecture
de configuration Git hostile et requête de test hors schéma corrigés. Export
par sortie bornée, validation sans extraction, inspection isolée et diff externe
désactivé. Syntaxes vérifiées ; aucun test applicatif local lancé. Les résultats
de la CI et l'artefact exact seront rattachés à la PR après exécution, sans
transposer les preuves du commit antérieur à ce nouveau code.

## Confrontation avec « Revue PR306 » — après 18 h 58 Paris

Les traces de l'autre session sont conservées dans la PR. Source commune relue
`220fb9515291c9e62c076d06e4fa3dc608166db7`, cible `fb7daac…`, intégration
`2c8b70638c73949eb8e5485b0f2280627f5526b3`. Sept jobs relus directement,
52 suites unitaires, 53 harnais navigateur et 73 tests runtime. Le journal
registre confirme 101 écritures fictives et une reprise ciblée sans doublon.
Le contenu vivant de l'autre conversation n'est pas accessible directement :
confrontation sur code, bilan PR, CI et paquet conservé, sans prétendre un échange
inter-session. La recherche de conversation n'a retourné aucun résultat utile.

Le paquet courant `11045864094` est téléchargé et son empreinte vérifiée.
ZIP SHA256 `74b6001be078215daa9fa979164aff62f3541f7a43789dc989dd74ddbd2f806a`,
TAR SHA256 `9c0aaa2d718d3fcc4084efdaf998edd2ee0480c67c3c892cbbaf2c69f29869de`.
La revue indépendante réelle rattachée à ce paquet ne constitue pas l'accord.

Prochaine fermeture concrète préparée : reprise du paquet exact dans la CI
existante, vérification de son registre et du contexte, API hôte de fusion avec
accord externe uniquement. La CLI ne propose aucune commande d'approbation.
La revue adverse a trouvé et fait corriger le mauvais acteur d'inspection,
la reprise indûment bloquée après arrêt, puis une course héritée arrêt/fusion.
Le dernier contrôle et l'admission sont maintenant sérialisés ; test dédié.
Bornes d'archive renforcées avant décompression/analyse. Aucune fusion réelle,
activation, publication ou exécution applicative locale. Résultats du nouveau
lot à rattacher à son commit testé dans la PR.

La présentation utilisable de Léo est intégrée à `leo/README.md` : invocation,
capacités démontrées et limites. Elle présente une version candidate, sans
transformer le souhait de terminer ce soir en réception acquise.

Première CI de la reprise : source `60b1f56a6c04d5be6616b0829d966dc296ab3318`,
intégration `30c3459a3be22647b966f77f7b3695220a17ba84`, run LV1 `36602773934`,
job runtime `109524048888`. 81 tests sur 82 passent ; l'assertion d'empreinte DB
détecte une écriture technique du constructeur avant refus d'accord. Correction :
ACL et politique vérifiées en lecture seule avant ouverture du broker ; assertion
stricte conservée. Le contrôle final sous verrou reste en place. La passe adverse
ajoute la capitalisation après effet confirmé : état merged par CAS, sans écraser
une édition concurrente ni rejouer une fusion si cette dernière écriture échoue.
Repreuve nécessaire sur le correctif ; aucune réussite transposée du premier run.

## Réconciliation du 29/09 après 22 h 50 Paris et raccord hôte

Le statut PR indiquait encore la cible fb7daac… : la lecture directe de
git/ref/heads/main a révélé 2e4f655fbaa3ced4024c7d417ef257e8432d337b,
après les squash #307/#308. Comparaison : 2 commits côté main, 23 côté PR,
base commune fb7daac… . Le conflit a été reproduit par merge-file sur le
cadrage : deux ajouts différents au §11. La combinaison du code leo.js
est propre ; les tests des anneaux et les données Finubar de main sont conservés.

Le contrat LV1 garde le §11 ; B1 est déplacé au §12 avec ses références.
L'anneau du catalogue reste une condition d'éligibilité, pas un mandat ni une
preuve d'identité, de budget ou de défaire. La permission historique de migrations
correctives n'est pas applicable au mandat LV1. Préparation isolée possible,
production toujours fermée. Comparer leo_ecritures au registre leo_operations
avant tout nouveau journal produit : aucune deuxième autorité implicite.

But de cette tranche : rendre le consommateur du contrôleur réellement appelable
par un client authentifié dans le bac à sable. Moyens : trial_host/trial_client,
GoTrue réel existant et CI privée ; catalogue status/execute/reconcile seulement.
Critère : mauvais compte, requête injectée, accord absent/inadéquat refusés ;
opération fictive exacte, réponse perdue, reprise depuis un nouveau client sans
double effet ni dépense. Hors périmètre : hébergement permanent, production,
paquet historique fusionné, publication et réception globale. Pré-mortem :
autorité importée depuis HTTP, lecture hors ACL, faux échec après effet,
double registre ; contrôles et tests ciblés.

Revue indépendante : droit ACL du statut renforcé et réponse illisible après
dispatch traitée comme résultat inconnu, jamais comme simple entrée invalide.
Le nouvel hôte reste propre à la fixture et ne pilote pas les connecteurs Work.
Les accords/revues de sa recette sont simulés et explicitement signalés.
Le SQL PT409 préparé précédemment n'est pas appliqué à la base réelle.
Résultats de cette intégration à relever dans PR306, sans transposer les huit
succès b4a1c65/fb7daac à la nouvelle cible main.

# Raccord de l'arrêt authentifié — reprise du 29/09 après 23 h 35 Paris

Source de départ relue : `cc03cb8674ea6a5c44e1018b84e26f4d88d371d4`,
cible `2e4f655fbaa3ced4024c7d417ef257e8432d337b`. Le raccord hôte/Auth
de l'autre session est conservé. Défaut constaté : le client exposait exécution
et réconciliation mais aucune commande d'arrêt ; la recette arrêtait directement
le registre depuis le lanceur de test. Ce n'était pas un arrêt utilisateur.

Boucle : réutiliser le canal HTTP/GoTrue et le verrou SQLite existants pour
rendre l'arrêt accessible à une identité habilitée. Refus sans mutation avant
initialisation inscriptible ; revalidation sous verrou ; conservation du travail
engagé. Épreuves attendues : vrais comptes fictifs, arrêt puis refus de départ
avec accord simulé valide, reprise sur nouvel hôte/client, faux arrêt détecté
par un mutant. Aucune donnée métier, migration réelle, fusion de PR ou
publication. Résultats à rattacher au commit effectivement exécuté dans PR306.

R21 n'est pas reçu par ce raccord : l'identité réelle de Paul et son accord
exact restent à fournir par un canal de confiance. Le serveur fermé d'épreuve
ne constitue pas un hébergement permanent ni un contrôle des outils Work.

