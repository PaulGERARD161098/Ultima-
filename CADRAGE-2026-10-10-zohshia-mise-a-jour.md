# CADRAGE — ZOH SHIA : remettre la techno RénoDevis à jour de la tête (10/10/2026)

> Paul, 10/10 : *« Terminons cette boucle pour attaquer la remise en forme de ZOH
> parce qu'on a du retard sur le suivi des technos. Tu me cadreras bien la MAJ de
> ZOH. »*
>
> Ce cadrage **prolonge** la « boucle dédiée » annoncée le 08/10
> (`CADRAGE-2026-10-08-zohshia-generateur-devis-pro.md`, étape 8) ; il ne la
> remplace pas. Mode d'emploi des outils : `.claude/skills/zohshia/SKILL.md`.

## 0. Ce qui a été mesuré avant de cadrer (10/10, entre 11:08 et 11:20 UTC)

Mesures prises sur RénoDevis `9bbd35e`. Depuis, main est passée à `3597495`
(fusion de #326), qui ne touche que trois fichiers `.md`. La série retire tous les
`.md` (`retirer.txt`, motif `**/*.md`) et la collecte ne lit pas les `.md`. Les
mesures ci-dessous valent donc aussi pour la tête actuelle.

ZOH SHIA porte la techno en **trois couches**. Elles n'ont ni le même retard ni
la même dépendance à J4.

| Couche | Ce qu'elle porte | Où | Mesure du 10/10 | Dépend de J4 ? |
|---|---|---|---|---|
| **A. Le plan** | ce que fait la techno, ses pièces, la check-list du pro, le badge à l'écran | `zohshia/renodevis/TECHNO.md`, `AJOUTER-UN-ARTISAN.md`, `inventaire.json`, publication `api/_lib/zohshia-technos.mjs` | La collecte relève **42 variables, 4 tâches planifiées, 26 routes, 45 migrations et 8 tables hors dépôt**. `tests/unit-zohshia.mjs` : **2 verdicts en échec**, soit **3 variables** et **7 routes** que le plan ne nomme pas. Quatre mécanismes livrés depuis le 04/10 n'apparaissent nulle part dans le plan (`grep`) : le canal de messages, la dictée, le devis pro et l'accord d'envoi | **non** |
| **B. La base neuve** | le schéma reconstruit et prouvé contre la base de référence | `zohshia/renodevis/base/` | `rejouer.mjs` **refuse avant de rejouer** : **4 migrations sans place relevée** (06/10, 08/10, 09/10 ×2), et l'ordre relevé ne coïncide plus avec le tri des noms. L'une de ces quatre migrations (le rattachement au pro) porte **2 noms propres** à neutraliser | **non** |
| **C. Le code neutre** | la série qui retire l'instance du code | `outils/zohshia/renodevis/neutre/` (BASE `f1f9fb3`, 216 fichiers retouchés, 49 retraits) | **169 commits** de retard. Une extraction à blanc rend **32 conflits réels**. **25 d'entre eux** se trouvent dans des fichiers qui portent la logique de l'instance de référence, celle que J4 réécrit ; **7** sont neutres | **oui, 25 sur 32** |

⛔ **Ce que ces 25 conflits disent vraiment.** Le 08/10, le constat était déjà
celui-ci : *« l'amont a tissé la logique propre à l'instance — matrice, règles,
marge, artisan sans client — dans le chemin générique »*. Or J4 consiste
justement à retirer cette logique du chemin générique pour en faire des
paramètres du pro. **J4 traite donc la cause des conflits de la série.**
Rafraîchir la série avant J4 revient à neutraliser à la main du code que J4
démêlera quelques jours plus tard. Il faudrait ensuite rafraîchir la série une
seconde fois, sur ces mêmes 25 fichiers.

## L'arbitrage à rendre : ce que couvre « la MAJ de ZOH »

| Option | Ce qu'on fait maintenant | Ce que ça coûte |
|---|---|---|
| **1 — recommandée** | **A + B maintenant** ; C juste après J4 | `derive.mjs` continue d'annoncer « EN RETARD » jusqu'à J4. Le message est daté et expliqué ici et au TECHNO §8 |
| 2 | A + B + C maintenant | 32 conflits à résoudre maintenant, puis les 25 fichiers une seconde fois après J4, soit deux rafraîchissements |
| 3 | A seul | la base neuve reste non prouvée pour les 4 migrations récentes |

**Pourquoi l'option 1 respecte la règle du 04/10, « ZOH se tient à jour de la
tête ».** La règle existe pour qu'un code neutre soit prouvé **au moment où l'on
intègre un pro**. Or aucun pro ne sera intégré avant J4 : c'est J4 qui permet
d'ajouter un deuxième pro sans écrire de code. Jusque-là, personne n'utilise la
couche C. Les couches A et B, en revanche, servent tout de suite : A est ce que
Paul suit à l'écran, et B est la base que recevrait un nouveau pro.

## ① Le but

À la fin de la boucle, trois choses sont vraies :

1. L'écran `/zohshia` décrit RénoDevis tel qu'il est à la tête de main : le test
   du plan est vert et sa liste de manquants est vide.
2. La base neuve est reconstruite et validée contre la base de référence à cette
   même tête.
3. Le retard de la série est **dit**, avec sa raison et son échéance, et jamais
   tu.

## ② Les étapes, dans cet ordre (option 1)

**A — le plan**

- **A1. Recollecter** sur la tête :
  `node zohshia/renodevis/collecter.mjs --depot <RenoDevis>`. L'inventaire porte
  son commit.
- **A2. Nommer les manquants** dans `TECHNO.md`, sous forme de **noms, jamais de
  valeurs** :
  - les 3 variables : `DEVIS_PRO_EMETTEURS`, `OPENAI_API_KEY`, `RECETTE_PDF`.
    `RECETTE_PDF` n'est lue dans aucun fichier du code : il faut chercher où elle
    sert avant de la décrire ;
  - les 7 routes : `/api/devis/[id]/fiches`, `/api/devis/apercu`,
    `/api/devis/choisir-reference`, `/api/devis/confirmer-quantite`,
    `/api/devis/depot-document`, `/api/dictee/session`, `/api/dictee/transcrire`.

  ⛔ Chaque route et chaque mécanisme se **lit dans le code** avant d'être décrit.
  Le test vérifie les noms, pas leur sens : une description déduite passerait au
  vert.
- **A3. Les maillons livrés depuis le 04/10** :
  - l'accord d'envoi (le mail ne part que sur la version affichée) ;
  - le devis pro (numérotation `D-AAAA-MM-NNN`, mentions B2B, forme juridique et
    capital ; c'est l'étape 8 du cadrage du 08/10) ;
  - la table de dédoublonnage du canal de messages. Elle est décrite comme une
    **pièce en construction**, sans plus : l'étoile « Réno sur WhatsApp » vient
    après le code de W1, comme décidé le 09/10.
- **A4. Check-list du pro** (`AJOUTER-UN-ARTISAN.md`) : ajouter ce que la techno
  exige désormais, à savoir la forme juridique, le capital social et l'émetteur
  du devis pro. Retirer ce qui n'existe plus.
- **A5. Publier puis prouver** : `node zohshia/publier.mjs`, puis
  `node tests/unit-zohshia.mjs` vert.

**B — la base neuve**

- **B1. Relever l'ordre réel** des 4 migrations dans la base de référence, **en
  lecture seule** : liste des migrations appliquées, sans aucune écriture.
- **B2. Neutraliser** les 2 noms propres de la migration de rattachement, dans la
  recette (`outils/zohshia/renodevis/recette.json`, hors de `zohshia/`).
- **B3. Rejouer** : `base/rejouer.mjs` doit répondre « ✓ prête et prouvée ».
  Si l'étalon a bougé, on passe par `--sql-reference`. La requête produite est
  relue avant envoi, puis passée **en lecture seule** sur la référence. Si elle
  rend 0 ligne, on termine par `--reference-validee --le 2026-10-10`.
- **B4. TECHNO §8** : mettre à jour la note d'état, datée et mesurée, en
  y ajoutant la phrase qui explique le retard de la série et son échéance (« après
  J4 »).

**Fin de séance**

- Mettre à jour le grain `FINUBAR.md` d'Ultima : la boucle « ZOH · série » et la
  prochaine action.
- Mettre à jour le grain de RénoDevis : `dernier_arret.commit` prend le SHA de
  main, et l'ordre redevient ZOH A+B → J4 → ZOH C. La ligne « Ordre décidé » du
  cadrage J4 est corrigée dans le même commit.
- Ouvrir une PR par dépôt, en fin de séance.

**C — le code neutre, après J4.** On fusionne la tête dans le clone neutre et on
résout les conflits **dans la série**, jamais dans l'arbre extrait. Les nouveaux
fichiers qui portent un nom propre sont neutralisés. Puis on lance `serie.mjs`,
`extraire.mjs --verifier` (typage, tests, build), et on met BASE à jour.

## ③ Les moyens

- **Fichiers touchés.** Dans `zohshia/renodevis/` : TECHNO, check-list,
  inventaire, `base/` (ordre, étalon) ; `api/_lib/zohshia-technos.mjs`
  (régénéré) ; `outils/zohshia/renodevis/recette.json` ; les deux `FINUBAR.md` ;
  une ligne du cadrage J4 de RénoDevis.
- **Outils.** Les scripts de `zohshia/` ; un Postgres 16 local et jetable pour le
  rejeu ; la base de référence **en lecture seule** uniquement (liste des
  migrations, requête de validation).
- **Ce qu'on ne touche pas** : le code de RénoDevis, aucune migration, aucune
  écriture en base réelle.

## ④ Les critères de réussite, vérifiables

- `node tests/unit-zohshia.mjs` : 0 verdict en échec et `manquants` vide.
- `inventaire.json` porte le commit de la tête mesurée.
- `rejouer.mjs` répond « ✓ La base neuve est prête et prouvée », et l'étalon est
  validé contre la référence avec 0 écart, à la date du 10/10.
- Aucun nom propre et aucune valeur dans `zohshia/` (le test existant).
- La publication est synchrone (le test existant), et l'écran `/zohshia`
  affiche le badge à jour.
- `derive.mjs` dit le retard de la couche C avec sa raison, et le TECHNO §8 dit
  la même chose.
- **Le harnais vire au rouge quand on le casse** (Directive DR) : retirer un
  nom de route du plan fait échouer le test, et une migration à l'ordre faussé
  fait refuser le rejeu.

## ⑤ Ce qu'on ne fait PAS dans cette boucle

- Pas de couche C (option 1). Pas de code J4.
- Pas d'étoile « Réno sur WhatsApp » avant le code de W1.
- Aucune retouche de l'arbre extrait. Aucune écriture dans la base de référence.
- Pas de deuxième techno dans ZOH.

## ⑥ Le pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode d'échec | Signal précoce | Ce qui le prévient |
|---|---|---|
| Le plan décrit une route de mémoire, et la décrit faux | une phrase du plan qu'aucune ligne de code ne soutient | lire chaque route avant de l'écrire ; relire le diff du plan en adversaire |
| Un nom propre entre dans `zohshia/` par une description ou la check-list | test rouge, ou pire, test vert si le nom n'est pas dans la liste (7 motifs connus) | décrire par identifiants de code ; relire la check-list ligne à ligne contre la liste des pros connus |
| Une valeur fuit (identifiant d'émetteur, URL) | un UUID ou une adresse dans le plan | le test « des noms, jamais des valeurs » ; `DEVIS_PRO_EMETTEURS` se nomme, son contenu ne s'écrit nulle part |
| L'ordre des migrations est relevé faux, et l'étalon est validé sur un mauvais ordre | écart dans la requête de validation | ordre lu dans la référence, pas déduit des noms ; `--sql-reference` prouve l'égalité |
| La requête de validation écrit dans la référence | — | relue avant envoi ; lecture seule exclusivement |
| Paul croit ZOH « tout à jour » alors que le code ne l'est pas (option 1) | l'écran ne dit rien de la série | `derive.mjs` et le TECHNO §8 le disent, avec une date et une échéance |
| main avance pendant la séance | la collecte vise un commit dépassé | l'inventaire porte son commit ; on remesure avant de publier |
| La publication est oubliée, et l'écran montre l'ancien plan | test de synchronisation rouge | l'étape A5 est obligatoire avant le commit |

## Trois points de vue à éprouver (Paul choisit lesquels creuser)

- **L'adversaire, qui lit le plan publié.** Le plan liste des routes, des tables
  et des noms de variables : c'est une carte d'attaque. *La page `/zohshia`
  reste-t-elle réservée au propriétaire, alors que l'inscription Supabase
  d'Ultima est mesurée ouverte depuis le 04/10 ? Une route nouvellement décrite
  (dépôt de document, dictée) révèle-t-elle une entrée mal gardée ?*
- **Le deuxième pro, qui reçoit la techno.** *La check-list lui demande-t-elle
  tout ce que la techno exige aujourd'hui, et rien de ce qui n'existe plus ?
  Sait-il ce qu'il doit fournir pour émettre un devis pro ?*
- **Le mainteneur, dans trois mois.** *Comprendra-t-il pourquoi la série est
  restée en retard, et quand la rafraîchir, sans avoir à relire ce cadrage ?*
