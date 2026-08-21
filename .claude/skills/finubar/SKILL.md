---
name: finubar
description: Le pilotage transverse des huit dépôts de Paul — « où on en est, où on s'est arrêté, par quoi on reprend, vers quoi ». À charger quand Paul demande un état d'ensemble (« où j'en suis », « on en est où sur tout », « qu'est-ce qui reste », « je m'y perds »), quand il faut METTRE À JOUR le grain d'un dépôt en fin de séance, ou quand une séance s'ouvre sur un rappel Finubar dont l'état paraît périmé. Couvre le format du grain, la règle de mise à jour, la collecte et l'écran /finubar.
---

# FINUBAR — piloter huit dépôts sans se perdre

## Ce que c'est, en une phrase

Un **index** : un fichier `FINUBAR.md` par dépôt, agrégé par Ultima. Il dit
*où on en est, où on s'est arrêté, par quoi on reprend, et vers quoi*.
**Il n'est pas une roadmap** — les roadmaps restent où elles vivent, et le grain
les pointe (`rattache_a`).

## Le geste de fin de séance — le seul qui compte

Tout le dispositif tient à ça. Une séance qui a modifié un dépôt met à jour son
`FINUBAR.md` **avant de pousser**, dans le même commit que le travail :

| Champ | Ce qu'on y met | Ce qui ne doit PAS y aller |
|---|---|---|
| `dernier_arret.le` | la date du jour | une date approximative |
| `dernier_arret.quoi` | ce qui vient d'être fait, en une phrase | un journal complet |
| `dernier_arret.commit` | **le commit qu'on vient de pousser** | un commit ancien, ou rien |
| `prochaine_action` | **UNE** action, celle par quoi on reprendra | une liste de trois |
| `etat` | `en_cours` · `en_attente_de_paul` · `au_repos` | un état inventé |
| `bloque_par` | les gestes que **seul Paul** peut faire | des tâches de code |
| `en_attente_depuis` | la date du **plus ancien** geste en attente | la date du jour par défaut |
| `maj` | la date du jour | — |

Puis, depuis Ultima : `node finubar/collecter.mjs` et commiter
`finubar/macro.json` + `finubar/macro.mjs`.

⛔ **`dernier_arret.commit` n'est pas décoratif.** La collecte et le rappel de
séance comparent ce commit à la tête réelle du dépôt. S'ils divergent, Finubar
affiche « ce dépôt a avancé de N commits depuis cette note » et le remonte en
tête. C'est le seul garde-fou contre une note qui ment — ne pas le vider.

## À l'ouverture d'une séance

Le hook `SessionStart` de chaque dépôt (`.claude/finubar-rappel.mjs`) injecte
déjà le grain : cap, jalon, dernier arrêt, prochaine action, gestes en attente.
**Il n'y a rien à aller chercher.** Trois cas :

1. **Aucune dérive annoncée** → l'état est frais. Restituer à Paul en 3 lignes
   (où on en est · où on s'est arrêté · par quoi on reprend) et se mettre au travail.
2. **Une dérive est annoncée** (« a avancé de N commits ») → **vérifier avant de
   croire** : `git log` du dépôt, PR ouvertes, et pour RénoDevis / RénoBoost la
   requête de cadrage en base de leur `CLAUDE.md`. Puis corriger le grain.
3. **Aucun rappel n'apparaît** → le dépôt n'a pas de `FINUBAR.md`, ou son bloc
   est cassé. Le dire, et le semer.

## Quand Paul demande l'état d'ENSEMBLE

Ne pas relire les huit dépôts — c'est exactement ce que Finubar évite.

```bash
node finubar/collecter.mjs        # depuis Ultima- : recollecte et affiche le cartouche
cat finubar/macro.json | head -40 # ou lire l'agrégat déjà collecté
```

Puis restituer dans l'ordre rendu par le moteur — il n'est pas arbitraire :
**dérive d'abord** (ce qu'on croit à tort coûte plus cher que ce qu'on ignore),
**puis ce qui attend un geste de Paul**, le plus anciennement ouvert en premier,
**puis l'en-cours**, **puis le repos**.

L'écran : `/finubar` sur Ultima (derrière session).

## Les cinq règles qui font tenir le dispositif

1. **Le grain se met à jour en FIN de séance, jamais au début.** Une note écrite
   avant vérification est un souvenir. *(Leçon du 05/08 sur RénoDevis : un doc de
   reprise a vieilli en vingt minutes et la séance suivante a failli rejouer une
   étape déjà consommée.)*
2. **Finubar indexe, il ne recopie pas.** Recopier une roadmap dans le grain
   fabrique deux vérités qui divergent — et on croit toujours la mauvaise.
3. **Ce qui se dérive de git ne s'écrit pas à la main.** Le nombre de commits,
   la tête du dépôt, l'ancienneté : mesurés à la collecte.
4. **Finubar compte, il ne reproche pas.** On dit « ouvert depuis 17 jours »,
   jamais « en retard ». Une liste de mots interdits est assertée par
   `tests/unit-finubar.mjs` — ne pas la contourner.
5. **Un dépôt illisible reste affiché, avec son motif.** Le faire disparaître le
   ferait lire comme « rien à signaler ».

## Où vit quoi

| Fichier | Rôle |
|---|---|
| `<dépôt>/FINUBAR.md` | le grain — **la source**, une par dépôt |
| `<dépôt>/.claude/finubar-rappel.mjs` | le rappel d'ouverture de séance (copie ⚠️) |
| `Ultima-/finubar/agreger.mjs` | le moteur PUR : lecture, ordre, cartouche, constellation |
| `Ultima-/finubar/collecter.mjs` | la collecte : lit les 8, mesure git, écrit l'agrégat |
| `Ultima-/finubar/macro.json` · `macro.mjs` | l'agrégat (généré — ne pas éditer) |
| `Ultima-/finubar/depots.json` | la liste des dépôts suivis |
| `Ultima-/api/finubar.js` · `finubar.html` · `js/finubar.js` | l'écran, derrière session |
| `Ultima-/tests/unit-finubar.mjs` · `smoke-finubar.mjs` | les harnais |

⚠️ **`finubar-rappel.mjs` est copié à l'identique dans les huit dépôts.** Sa
source unique est `Ultima-/finubar/rappel.mjs`. Toute évolution se fait là, puis
se re-copie — jamais sur une copie, sinon les huit divergent.

## Ajouter un dépôt

1. Semer son `FINUBAR.md` (copier la structure d'un existant, remplir le grain
   **depuis l'état réel**, jamais de mémoire).
2. Copier `Ultima-/finubar/rappel.mjs` vers `<dépôt>/.claude/finubar-rappel.mjs`
   et ajouter le hook `SessionStart` : `node .claude/finubar-rappel.mjs`.
3. Ajouter une ligne à `Ultima-/finubar/depots.json`, recollecter, commiter.
