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
