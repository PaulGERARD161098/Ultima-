# REPRISE — Finubar, séance du 21/08/2026

> Point d'arrêt daté à la minute, écrit **après** la fusion. Un `REPRISE-*.md`
> décrit un état, il ne le dérive pas : il est juste à l'heure où il est écrit
> et faux au geste suivant. La source qui, elle, se maintient toute seule, c'est
> le **grain** — `FINUBAR.md` de chaque dépôt, lu automatiquement à l'ouverture
> de séance. Ce document est le récit ; le grain est l'état.

## 1. Ce qui a été livré

**FINUBAR** — la couche de pilotage des huit dépôts, née d'une phrase de Paul :
*« beaucoup de projets tournent, j'ai un peu peur de m'y perdre. »*

| Où | Quoi |
|---|---|
| **Les 8 dépôts** | `FINUBAR.md` (le grain) + un hook `SessionStart` qui l'injecte à chaque ouverture, ~250 tokens, zéro geste |
| **Ultima** | le moteur pur `finubar/agreger.mjs`, la collecte `finubar/collecter.mjs`, la route `api/finubar.js`, l'écran `/finubar`, le skill `.claude/skills/finubar/`, les harnais `unit-finubar` et `smoke-finubar` |

**Ce que Finubar N'EST PAS**, et c'est le cœur de l'arbitrage : ce n'est pas une
roadmap de plus. RénoBoost en porte 21. Le problème n'était pas l'absence de
mémoire — c'est qu'elle était éparpillée sur huit dépôts et qu'aucune n'était
lue automatiquement. **Finubar indexe, il ne recopie pas** (`rattache_a`).

## 2. Les arbitrages rendus par Paul — ne pas les reposer

| # | Question | Réponse |
|---|---|---|
| **F-1** | Périmètre | les **8 dépôts de code** (les quadrants perso d'Ultima restent hors Finubar) |
| **F-2** | Le rappel arrive par où ? | **à l'ouverture d'une séance**, et rien d'autre : ni cron, ni notification, ni e-mail |
| **F-3** | Forme dans Ultima | page + cartouche maintenant, **constellation plus tard** (« tout projet d'ampleur doit y être, on en reparle ») |

## 3. Le diagnostic — quatorze écarts, quatorze corrigés

Détail complet et raisonnement : **`CADRAGE-FINUBAR.md` §7 bis**.

Quatre étaient **rouges**, et ils ont tous la même forme : *un contrôle qui a
l'air structurel et ne l'est qu'à une requête près.*

1. **`macro.json` était publiquement lisible** — Vercel sert tout fichier commité.
2. **`api/finubar.js` importait hors de l'arbre `api/`** — motif non éprouvé, 500 possible en production.
3. **`api/_lib/` n'était protégé que par une convention de plateforme.**
4. **Le garde était éprouvé sur une liste écrite à la main** — il énumère désormais le système de fichiers.

⛔ **La règle qui en sort, et qui vaut au-delà de Finubar** : un garde-fou se
vérifie du côté où il peut être contourné, pas du côté où il a été écrit. Et
quand on ne PEUT pas le vérifier de ce côté-là, on retire l'hypothèse au lieu
de la documenter.

## 4. ⛔ CE QUI RESTE À FAIRE — les deux vérifications de la fusion

**Elles passent avant tout autre travail sur Ultima.** Elles sont aussi écrites
dans le grain d'Ultima, donc le rappel les présentera tout seul à l'ouverture.

### 4.1 Recaler les huit grains sur `main`
La fusion s'est faite en **squash** : les commits des branches ont disparu au
profit d'un commit neuf par dépôt. Chaque `dernier_arret.commit` pointe donc
dans le vide, et **la mesure de fraîcheur est à l'arrêt**.

Elle ne s'arrête pas en silence — c'est le correctif ⑭ de cette séance : le
rappel de chaque dépôt annonce « le commit noté est introuvable — fusion en
squash, très probablement… tête courante : `xxxxxxx`. À recaler en fin de
séance. » **Il suffit donc d'ouvrir chaque dépôt et de suivre ce qu'il dit.**

### 4.2 Vérifier l'exposition en conditions réelles
C'est **la seule vérification du lot qui n'a jamais pu être faite** : l'egress
du bac à sable est bloqué (403 du proxy au `curl` comme au `WebFetch`), constat
déjà consigné dans `mon-dpe.fr/docs/JOURNAL.md`. Sur la production Ultima :

| URL | Attendu |
|---|---|
| `/finubar/macro.json` | **refus** |
| `/api/_lib/finubar-macro.mjs` | **refus** |
| `/finubar` (connecté) | **la page s'affiche** |

Les trois ensemble, et pas seulement les deux premières : c'est le couple
refus/réponse qui prouve que le garde **discrimine**, au lieu de tout bloquer.

## 5. La roadmap Finubar, dans l'ordre

| | Quoi | Conditionné à |
|---|---|---|
| **1** | Les deux vérifications ci-dessus | rien — c'est la première chose |
| **2** | Vivre avec pendant quelques séances | rien. **Ne rien ajouter avant d'avoir la preuve d'usage** : le pre-mortem dit que la cause d'échec n° 1 est un grain qu'on ne tient plus, pas une fonctionnalité manquante |
| **3** | La constellation (F-3) | l'accord de Paul. `versConstellation()` est écrit et testé, branché sur rien : c'est un branchement, pas une réécriture |
| **4** | Le top départ de LV6 | Paul (cadrage déposé, exécution gelée) |

## 6. Pre-mortem à 3 mois — « on est en novembre 2026, Finubar ne sert plus »

| # | Cause probable | Signal précoce | P × I | Mitigation |
|---|---|---|---|---|
| **1** | **Les grains ne sont plus tenus.** Le geste de fin de séance saute une fois, puis toujours | un `maj` de plus de deux semaines sur un dépôt actif | 🔴 Forte × 🔴 Fort | La note **dit qu'elle a vieilli** (dérive mesurée, remontée en tête). C'est déjà dans le code. Ce qui manque est hors code : que la première séance de la semaine prochaine fasse le geste. **Le §4.1 est le test grandeur nature** |
| **2** | **La fusion en squash a tué la mesure et personne ne l'a vu** | huit rappels qui annoncent « commit introuvable » et que l'on ignore | Moyenne × 🔴 Fort | Traité à la source (⑭) : l'avertissement est explicite et porte la tête pour recaler. Mais **il faut le faire** — c'est le §4.1 |
| **3** | **Finubar devient la 22ᵉ roadmap** — on recopie les jalons dedans | un grain qui grossit, un détail qui n'existe que là | Moyenne × 🔴 Fort | `rattache_a` pointe ; `lireGrain` borne à 400 caractères — un grain **ne peut pas** devenir une roadmap |
| **4** | **L'écran n'est jamais ouvert** — le rappel de séance suffit, la page dort | zéro visite | Moyenne × Faible | Ce ne serait **pas un échec** : F-2 dit que le rappel est le canal. La page est la vue d'ensemble, pas le quotidien. Ne pas la « sauver » en y ajoutant des fonctions |
| **5** | **Un neuvième projet naît hors Finubar** | un dépôt actif absent de `depots.json` | Moyenne × Moyen | La recette d'ajout est dans le skill (3 gestes). À faire **le jour où le dépôt naît**, pas plus tard |
| **6** | **Les compteurs sont toujours à zéro** — Finubar affiche joliment un business qui n'a pas démarré | `stickers`, `contracts`, `paiements` encore à 0 en novembre | 🔴 Forte × 🔴 Fort | **Ce n'est pas un risque Finubar, c'est LE risque.** Le cartouche propose déjà le *geste de Paul* plutôt qu'une tâche de code quand le projet de tête l'attend. Finubar ne peut pas faire plus : il peut nommer le goulot, pas le franchir |

**Ce que le pre-mortem dit de l'ordre** : la cause n° 6 domine tout le reste, et
elle ne se traite pas par du code. Les trois gestes du jalon 0 de
`RenoBoost/ROADMAP-MASTER.md` restent le seul chemin critique du programme.

## 7. Prompt de reprise

> Reprise Ultima après la séance Finubar du 21/08. Le hook d'ouverture de séance
> te donne déjà l'état — commence par le lire, et par faire ce qu'il demande.
>
> **Contexte** : Finubar est livré et fusionné sur les huit dépôts. C'est
> l'index de pilotage : un `FINUBAR.md` par dépôt, agrégé par `finubar/`,
> affiché sur `/finubar`, lu à chaque ouverture de séance.
>
> **Première action, avant tout le reste** : les deux vérifications du §4 de
> `REPRISE-2026-08-21-finubar.md` — recaler les huit grains sur `main` (la
> fusion en squash les a détachés, chaque rappel le dit) et vérifier en réel
> que `/finubar/macro.json` et `/api/_lib/finubar-macro.mjs` refusent, et que
> `/finubar` répond.
>
> **Ne pas** ajouter de fonctionnalité à Finubar avant d'avoir vécu avec
> quelques séances : le pre-mortem dit que le risque est un grain qu'on ne
> tient plus, pas une fonction manquante.
>
> **Sources** : `CADRAGE-FINUBAR.md` (cadrage, pre-mortem, §7 bis le
> diagnostic) · `.claude/skills/finubar/SKILL.md` (le geste de fin de séance) ·
> `CADRAGE-ULTIMA.md` section ÉTAT · `CADRAGE-LV6-CIEL-VIVANT.md` (gelé).
