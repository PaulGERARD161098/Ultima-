# Supervision et réemploi

> Cadrage validé par Paul le 31/10/2026 (recommandations 1 à 4). Contrat et
> juge d'origine reçus le même jour (prompt ChatGPT, revu par Gemini), repris
> sans modification de leur logique ; les défauts relevés en revue sont traités
> par l'hôte, décrits au §4.

## 1. Ce que fait la techno

L'agent **propose**, l'hôte **contrôle**, le responsable **tranche**. Une
proposition porte sur un objet existant (une techno, un dépôt, un outil de
l'agent) et recommande de le conserver, le mesurer, l'améliorer, le mutualiser,
le simplifier, le suspendre ou d'en proposer le retrait.

Elle traverse quatre sas, et le premier refus arrête tout :

1. **Forme** — `forme.mjs` contre `CONTRAT.schema.json` : champs prévus seuls,
   types, listes fermées, dates RFC 3339, tailles bornées.
2. **Logique** — `supervision-valeur.mjs` : chronologie, fraîcheur, preuves
   exigées par la recommandation. Seul le statut `presentable` continue.
3. **Matière** — chaque identifiant de preuve est retrouvé dans une source que
   l'agent ne peut pas écrire.
4. **Inertie** — une empreinte calculée par la base ; un doublon est reconnu,
   et un **refus tient jusqu'à sa date de réexamen** (voir §2).

`presentable` veut dire **dossier complet**, jamais autorisation :
`executionAutorisee` vaut toujours `false`. Aucune décision n'est exécutée par
cette techno.

## 2. Les trois principes

- **Zéro confiance dans l'agent.** Il ne déclare pas « dépendances vérifiées » ;
  il cite un identifiant, et l'hôte le retrouve.
- **L'existence n'est pas la pertinence.** Le sas de matière prouve qu'une
  preuve existe, pas qu'elle concerne l'objet. Le responsable reste le seul juge,
  et la présentation le dit.
- **Terminer les boucles.** Un refus bloque le même objet avec la même
  recommandation, **quelles que soient les preuves**, jusqu'à la date de
  réexamen que le responsable fixe en refusant ; sans date, il tient sans
  limite. *(Décision de Paul du 31/10, après la revue S1 : la version reçue —
  « une preuve différente la rouvre » — se contournait en ajoutant une preuve
  sans rapport. Le cas « Déblocage » de la recette reçue est remplacé par
  celui-ci.)* Une fois la date passée, la même proposition revient en attente.

## 3. Décisions du 31/10/2026

1. **Preuves typées par préfixe** — `zoh:<techno>`, `finubar:<dépôt>`. Un préfixe
   inconnu est refusé. Les journaux écrits par l'agent sont **exclus** : citer
   ses propres traces reviendrait à fabriquer ses preuves.
2. **Objets supervisables** — technos ZOH, dépôts Finubar, outils de l'agent.
3. **Pas de purge** — une décision devenue caduque passe à `OBSOLETE` ; rien
   n'est supprimé, sinon le blocage d'une proposition refusée disparaîtrait.
4. **Proposer est une écriture de l'anneau ORANGE** (révisé le 31/10, choix de
   Paul : un dossier de vingt champs rédigés par l'agent n'est jamais mot pour
   mot dans la dictée, le vert n'aurait jamais joué). Le responsable clique pour
   SOUMETTRE ; une proposition en attente se retire au cockpit (`OBSOLETE`).
   L'agent n'a **aucun** moyen d'arbitrer ni de retirer.
5. **Lieu** — le quadrant FINUBAR (choix de Paul du 31/10), réservé au
   propriétaire. L'outil est **coupé par défaut** (`LEO_SUPERVISION` doit valoir
   exactement `active`) tant que la migration et le cockpit ne sont pas en place.

Moyens : une fonction SQL et le client Supabase déjà en place ; ni `pg` ni
`ajv` (décision de Paul).

## 4. Règles d'hôte — les défauts de la version reçue

| # | Défaut reçu | Règle retenue |
|---|---|---|
| 1 | `maintenant: Date.now()` (un nombre) : `Date.parse` rend `NaN`, tout part en `a_completer` | L'hôte passe une date ISO 8601 ; un test verrouille le piège |
| 2 | `ANY($1::uuid[])` : un faux ID fait planter la requête, le refus vient de l'erreur | Preuves typées, vérifiées avant toute requête ; un faux ID est refusé par le contrôle, pas par une exception |
| 3 | Un `COUNT` prouve l'existence, pas l'appartenance ; un ID répété fausse le compte | Identifiants dédoublonnés et refusés s'ils sont répétés ; lecture limitée au propriétaire |
| 4 | Empreinte par concaténation brute : `ab`+`c` = `a`+`bc` | Empreinte calculée en base, champs séparés, preuves de dépendances et de protections comprises |
| 5 | La purge efface l'empreinte d'un refus | Pas de purge : `OBSOLETE` |
| 6 | `ON CONFLICT DO NOTHING` : l'agent ignore qu'il a déjà été tranché | Réponse explicite : `inseree`, `deja_en_attente`, `deja_tranchee` |
| 7 | `format: date-time` exige un module de plus en Ajv strict | `forme.mjs` lit ce format et refuse tout mot-clé inconnu |
| 8 | Table sans propriétaire ni RLS | `owner_id` et RLS, comme toutes les tables de l'agent |
| 9 | Contrôle et insertion séparés : course possible | Une seule fonction SQL, atomique |
| 10 | Aucun client visé | Gain sur les coûts fixes ; indicateur : montant mensuel des suspensions acceptées |
| 11 | « Une preuve différente rouvre un refus » : contournable par une preuve sans rapport (revue S1) | Le refus tient pour l'objet et la recommandation jusqu'à la date de réexamen |

## 5. Ce que contient ce dossier

| Fichier | Rôle |
|---|---|
| `CONTRAT.schema.json` | Le contrat d'une proposition (reçu tel quel) |
| `supervision-valeur.mjs` | Le juge logique (reçu tel quel) |
| `forme.mjs` | Le sas de forme sans dépendance |
| `TECHNO.md` | Ce fichier |

Côté hôte (Ultima), le sas de matière vit dans `api/_lib/supervision-preuves.mjs` :
identifiants au format `type:nom` (128 caractères au plus, casse exacte),
retrouvés dans le catalogue ZOH et le relevé Finubar versionnés ; un dépôt dont
la collecte a échoué, ou dont la date de mesure est illisible, ne prouve rien ;
une observation déclarée après le jour de mesure est refusée (fraîcheur
inventée). Fraîcheur maximale initiale : 30 jours pour une fiche ZOH, 7 pour un
grain Finubar — au-delà, réserve et non refus.

Le dossier `zohshia/` n'est pas déployé. Le code servi en production en sera
une copie générée sous `api/_lib/`, vérifiée octet pour octet par un test.

## 6. Pilotage

Le contrôle précède l'activation. Avant que l'agent puisse proposer pour de
vrai : la liste des propositions et l'arbitrage sont utilisables par le seul
responsable, les refus d'accès sont éprouvés, et l'arrêt est possible
(retrait de l'outil). Une maquette ne vaut pas preuve de raccordement.

## 7. Recette

Exécutée réellement : tests unitaires pour les sas de forme et de logique,
PostgreSQL local (PGlite) pour la fonction SQL. Une case ne se coche jamais sur
une relecture. Chaque garde-fou est éprouvé par un sabotage qui doit rendre son
test rouge.
