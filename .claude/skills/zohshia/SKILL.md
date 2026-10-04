---
name: zohshia
description: ZOH SHIA, le dragon de la technologie — la techno de Paul à l'état pur, à invoquer. Premier élément : RénoDevis — son plan complet (ce qu'elle fait, ses mécanismes, ses données, ses routes, ses services) et le guide pour la mettre en service chez un autre artisan. À charger quand Paul veut dupliquer la techno pour un pro, savoir de quoi elle est faite, ou de quoi un pro doit décider avant de s'en servir. Couvre la recollecte mesurée, la lecture de la dérive, le guide pas à pas et ses gates. Aucun nom d'artisan, aucune valeur.
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

## L'invocation — dans cet ordre, aucun pas n'est facultatif

1. **Remesurer.** Le dépôt de référence doit être attaché à la séance et
   récupéré (`git -C <dépôt> fetch origin main`). Puis :
   `node zohshia/renodevis/collecter.mjs --depot <chemin du dépôt>`.
   Le script dit la **dérive**, et s'arrête en erreur s'il rencontre une lecture
   de variable qu'il ne sait pas résoudre, ou un nom propre qu'il n'a pas pu
   neutraliser.
   ⛔ Sans le dépôt attaché, on ne remesure pas : on le DIT, et on donne la date
   de la dernière mesure avant tout chiffre.
2. **Prouver.** `node tests/unit-zohshia.mjs`. S'il rougit, une pièce mesurée
   manque au plan, ou un nom propre y est entré : on corrige le plan **d'abord**,
   en lisant la pièce dans le code, jamais en devinant son rôle.
3. **Dérouler le guide** pour le pro nommé par Paul, étape par étape, en disant à
   chaque fois qui agit et si c'est auto ou manuel. Les valeurs du pro (ses
   règles de prix, sa commission) viennent de Paul et du pro, jamais du plan.
4. **S'arrêter à chaque gate.** Toute écriture en base réelle, création de
   compte, envoi réel ou variable de production est un **effet métier réel** :
   elle attend le mandat précis de Paul (contrat LV1, `CLAUDE.md` d'Ultima).
   Préparer est permis ; exécuter sans mandat, jamais.
5. **Rendre compte** : étapes faites, étapes en attente de Paul, et ce que le pro
   doit faire lui-même (son domaine, son compte de paiement).

## Ce qu'il ne faut pas faire

- ⛔ **Écrire un nom propre ou une valeur dans `zohshia/`** : le test le refuse.
  Le nom d'un pro se dit à Paul, en séance ; il ne s'écrit pas dans la techno.
- ⛔ **Cloner l'instance** à la place d'ajouter un pro : la base porte des tables
  que le dépôt ne sait pas créer (`TECHNO.md` §4).
- ⛔ **Croire le plan sans le remesurer** : un plan d'hier se lit exactement
  comme un plan juste.

## Ajouter un élément à ZOH SHIA

Une technologie nouvelle entre sous `zohshia/<nom>/` avec la même forme : une
collecte qui mesure et neutralise, un plan qui pointe sans recopier, un test qui
rougit quand le plan oublie une pièce ou laisse passer un nom propre, et
l'exclusion du déploiement.
