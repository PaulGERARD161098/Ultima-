---
name: zohshia
description: ZOH SHIA, le dragon de la technologie — la techno de Paul à l'état pur, à invoquer. Premier élément : RénoDevis. Sur « j'intègre un nouvel artisan », ZOH SHIA fournit le code neutre extrait et prouvé (typage, tests, build), la base neuve reconstruite et validée contre la référence, et la check-list des informations à obtenir du pro. À charger aussi quand Paul veut savoir de quoi la techno est faite. Couvre la recollecte mesurée, la dérive, l'extraction, le rejeu de la base, le guide et ses gates. Aucun nom d'artisan, aucune valeur.
---

# ZOH SHIA — invoquer la techno

## Ce que c'est, en une phrase

Le dossier `zohshia/` d'Ultima porte la techno de Paul **à l'état pur** : ce
qu'elle fait et ce qu'elle comporte, mesuré dans ses dépôts, sans aucun nom
d'artisan, de client, de fournisseur ni de marque, et sans aucune valeur propre
à un pro (Paul, 04/10/2026).

| Fichier | Ce qu'il dit |
|---|---|
| `zohshia/renodevis/TECHNO.md` | Le plan : parcours, mécanismes, données, routes, services, sécurité |
| `zohshia/renodevis/AJOUTER-UN-ARTISAN.md` | Mettre la techno en service pour un pro : qui agit, auto ou manuel, quel gate |
| `zohshia/renodevis/inventaire.json` | Ce que la collecte a MESURÉ, avec le commit d'origine |
| `zohshia/renodevis/collecter.mjs` | La collecte (des noms, jamais des valeurs ; les noms propres neutralisés) |
| `zohshia/renodevis/extraire.mjs` | Le CODE neutre, extrait d'un commit du dépôt de référence et prouvé |
| `zohshia/renodevis/base/rejouer.mjs` | La BASE neuve, reconstruite sur un Postgres jetable et comparée à l'étalon |

## L'invocation « j'intègre un nouvel artisan » — dans cet ordre

1. **Remesurer.** Le dépôt de référence attaché et récupéré
   (`git -C <dépôt> fetch origin main`), puis
   `node zohshia/renodevis/collecter.mjs --depot <dépôt>` : il dit la **dérive**.
   Et `node zohshia/renodevis/derive.mjs` dit si la **série** de neutralisation
   suit la tête (« à jour » / « EN RETARD » / « non mesurable ») — le même
   message que le rappel d'ouverture de séance. En retard → rafraîchir la série
   (TECHNO §8) AVANT d'extraire.
   ⛔ Sans le dépôt attaché, on ne remesure pas : on le DIT, avec la date de la
   dernière mesure, avant tout chiffre.
2. **La base.** `node zohshia/renodevis/base/rejouer.mjs --depot <dépôt>` :
   « ✓ La base neuve est prête et prouvée », sinon on s'arrête sur le refus.
   Si le dépôt a reçu des migrations depuis l'étalon : `--sql-reference`, passer
   la requête rendue EN LECTURE SEULE sur la base de référence ; 0 ligne →
   `--reference-validee --le <date>`.
3. **Le code.** `node zohshia/renodevis/extraire.mjs --depot <dépôt> --sortie
   <dossier neuf> --verifier --modules <node_modules>`. Un conflit de la série,
   un nom propre ou une preuve rouge ARRÊTE tout : on corrige la série
   (`outils/zohshia/renodevis/neutre/`), jamais l'arbre extrait à la main.
4. **Prouver le plan.** `node tests/unit-zohshia.mjs`.
5. **Rendre à Paul** : le code (dossier, commit source, preuves), la base (étalon,
   date), la **check-list** de `AJOUTER-UN-ARTISAN.md` §1 à faire remplir au pro,
   et la **voie** à choisir avec lui (§0 : il rejoint la plateforme, ou une
   instance à lui).
6. **S'arrêter à chaque gate.** Créer un dépôt, un projet de base, un
   hébergement, un compte ; écrire en base réelle ; poser une variable de
   production ; envoyer un mail réel : **effet métier réel**, mandat précis de
   Paul (contrat LV1). Préparer est permis ; exécuter sans mandat, jamais.

## Ce qu'il ne faut pas faire

- ⛔ **Écrire un nom propre ou une valeur dans `zohshia/`** : le test le refuse.
  Le nom d'un pro se dit à Paul, en séance ; il ne s'écrit pas dans la techno.
- ⛔ **Copier l'instance de référence** (son dépôt, sa base) pour un nouveau pro :
  ses données et sa formule propre partiraient avec. On EXTRAIT, on ne copie pas.
- ⛔ **Corriger l'arbre extrait à la main** : la correction serait perdue à la
  prochaine extraction. Elle va dans la série de neutralisation.
- ⛔ **Croire le plan sans le remesurer** : un plan d'hier se lit exactement
  comme un plan juste.

## Approches croisées

Le dossier `zohshia/anti-pattern/` porte une méthode transversale, sans base ni moteur métier : `TECHNO.md`, `MISE-EN-SERVICE.md`, `collecter.mjs` et un badge. Charger `.claude/skills/anti-pattern/SKILL.md` pour l'appliquer. Le collecteur vérifie la structure des déclarations, sans certifier leur vérité ; ne pas présenter son résultat comme une preuve métier.

## Ajouter un élément à ZOH SHIA

Une technologie nouvelle entre sous `zohshia/<nom>/` avec la même forme : une
collecte qui mesure et neutralise, un plan qui pointe sans recopier, un test qui
rougit quand le plan oublie une pièce ou laisse passer un nom propre, et
l'exclusion du déploiement.
