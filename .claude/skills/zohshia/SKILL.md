---
name: zohshia
description: ZOH SHIA, le dragon de la technologie — toute la techno de Paul, à invoquer. Premier élément : RénoDevis, et le geste « ajouter un artisan » pour le dupliquer chez un autre artisan. À charger quand Paul veut dupliquer RénoDevis, embarquer un nouvel artisan, savoir de quoi RénoDevis est fait (variables, services, tâches planifiées, tables), ou ce qui est encore codé pour SOLA. Couvre la recollecte mesurée, la lecture de la dérive, le guide pas à pas et ses gates.
---

# ZOH SHIA — invoquer la techno

## Ce que c'est, en une phrase

Le dossier `zohshia/` d'Ultima porte la techno de Paul, **mesurée** dans ses
dépôts et jamais recopiée de mémoire. Premier élément : `zohshia/renodevis/`.

| Fichier | Ce qu'il dit |
|---|---|
| `zohshia/renodevis/TECHNO.md` | De quoi RénoDevis est fait, et où vit chaque pièce |
| `zohshia/renodevis/AJOUTER-UN-ARTISAN.md` | Le guide pas à pas : qui agit, auto ou manuel, quel gate |
| `zohshia/renodevis/inventaire.json` | Ce que la collecte a MESURÉ, avec le commit d'origine |
| `zohshia/renodevis/collecter.mjs` | La collecte (des noms, jamais des valeurs) |

## L'invocation — dans cet ordre, aucun pas n'est facultatif

1. **Remesurer.** RénoDevis doit être attaché à la séance et récupéré
   (`git -C <RenoDevis> fetch origin main`). Puis :
   `node zohshia/renodevis/collecter.mjs --depot <chemin de RenoDevis>`.
   Le script dit la **dérive** (« RénoDevis a avancé de N commits ») et s'arrête
   en erreur s'il rencontre une lecture de variable qu'il ne sait pas résoudre.
   ⛔ Sans RénoDevis attaché, on ne remesure pas : on le DIT, et on donne la
   date de la dernière mesure avant tout chiffre.
2. **Prouver la couverture.** `node tests/unit-zohshia.mjs`. S'il rougit, une
   pièce mesurée n'est pas dans la fiche : on complète la fiche **d'abord**, en
   lisant la pièce dans RénoDevis, jamais en devinant son rôle.
3. **Dérouler le guide** (`AJOUTER-UN-ARTISAN.md` §1) pour l'artisan nommé par
   Paul, étape par étape, en disant à chaque fois qui agit et si c'est auto ou
   manuel.
4. **S'arrêter à chaque gate.** Toute écriture en base réelle, création de
   compte, envoi réel ou variable de production est un **effet métier réel** :
   elle attend le mandat précis de Paul (contrat LV1, `CLAUDE.md` d'Ultima).
   Préparer est permis ; exécuter sans mandat, jamais.
5. **Rendre compte** : étapes faites, étapes en attente de Paul, et ce que
   l'artisan doit faire lui-même (domaine, Stripe).

## Ce qu'il ne faut pas faire

- ⛔ **Cloner l'instance** à la place d'ajouter un artisan : la base partagée
  porte des tables que RénoDevis ne sait pas créer (`TECHNO.md` §5). C'est
  l'option B, écartée le 04/10/2026 tant que cette liste n'est pas vide.
- ⛔ **Écrire une valeur** (secret, adresse, identifiant) dans `zohshia/` : le
  test le refuse, et le dossier est la carte du système.
- ⛔ **Croire la fiche sans la remesurer** : un guide d'hier se lit exactement
  comme un guide juste.
- ⛔ **Supposer qu'un deuxième artisan hérite de règles neutres** : le code
  écrit pour SOLA (`AJOUTER-UN-ARTISAN.md` §2) s'applique à lui tant qu'il
  n'est pas généralisé.

## Ajouter un élément à ZOH SHIA

Une technologie nouvelle (autre dépôt, autre outil) entre sous `zohshia/<nom>/`
avec la même forme : une collecte qui mesure, une fiche qui pointe, un test qui
rougit quand la fiche oublie une pièce, et l'exclusion du déploiement.
