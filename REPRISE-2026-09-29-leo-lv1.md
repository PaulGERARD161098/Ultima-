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
