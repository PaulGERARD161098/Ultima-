---
name: sobriete-tokens
description: Routine de sobriété tokens d'Ultima — réflexes économes à appliquer AVANT toute boucle qui lit beaucoup de fichiers, dispatche des agents ou explore le repo. À consulter quand Léo planifie une boucle d'ampleur, quand une session "brûle trop de tokens", ou avant d'ouvrir/lire de gros volumes. Fixe des seuils concrets (sous-agents, lectures ciblées, jamais de re-scan, syntheses seules) plutôt que des principes vagues.
---

# Sobriété tokens — Ultima

> Objectif : livrer la même qualité en consommant beaucoup moins de contexte.
> Le gaspillage vient presque toujours de **contenu qui entre dans le fil
> principal sans avoir besoin d'y être** (gros fichiers relus, sorties d'agents
> brutes, re-scans du repo, allers-retours de permission). On coupe à la source.

## Les 7 réflexes (par ordre de gain)

1. **Sous-agent pour tout gros volume de lecture / exploration.**
   Dès qu'une réponse demande de balayer plusieurs fichiers, répertoires ou
   conventions de nommage, déléguer à `Explore` / `general-purpose` et ne
   garder QUE la conclusion. Le fil principal de Léo ne doit jamais absorber
   des dumps de fichiers. Seuil : > ~2 fichiers à parcourir OU > ~150 lignes à
   lire pour trancher → sous-agent.

2. **Lecture ciblée, jamais de lecture aveugle.**
   `Grep`/`Glob` pour localiser, puis `Read` avec `offset`/`limit` sur la
   plage utile. Ne jamais `Read` un fichier entier > ~400 lignes « pour voir ».
   Ne jamais relire un fichier déjà lu dans la session (le harness suit l'état ;
   après une Edit, ne pas relire pour « vérifier »).

3. **Capitaliser sur le cadrage, jamais re-scanner.**
   `CADRAGE-ULTIMA.md` (ÉTAT), `CADRAGE-CONSOLE.md`, `AUDIT-*.md`, `memoire/`
   et les roadmaps sont la source unique de vérité. Ce qui y est consigné ne se
   re-découvre pas — on le lit une fois, on s'y réfère.

4. **Briefs d'agents : exiger une SYNTHÈSE, pas la sortie brute.**
   Chaque prompt d'agent finit par « rends une synthèse (pas de sortie brute),
   N lignes max par point ». Les agents renvoient des données/verdicts, pas des
   transcriptions. Léo ne relaie jamais une sortie d'agent brute à Paul.

5. **Outils dédiés plutôt que shell.**
   `Grep`/`Glob`/`Read` au lieu de `find`/`grep`/`cat`/`sed`/`head`/`tail` :
   plus sûr, intégré aux permissions (pas de prompt), et souvent moins verbeux.

6. **Appels d'outils en parallèle.**
   Toutes les lectures/commandes indépendantes dans un seul message (plusieurs
   tool_uses) — moins de tours = moins de ré-injection du contexte système.

7. **Permissions pré-accordées.**
   Les opérations en lecture seule sont dans `.claude/settings.json` (allowlist)
   → zéro aller-retour de permission. Ne jamais y ajouter une écriture/opération
   destructive (les gates de `CLAUDE.md` priment).

## Contre-exemples (ce qui brûle des tokens — à ne pas faire)

- Relire un fichier « pour être sûr » après l'avoir édité.
- `Read` d'un module de 800 lignes quand un `Grep` ciblé suffisait.
- Faire remonter dans le fil principal la sortie complète d'un agent.
- Re-scanner le repo au lieu de lire l'ÉTAT du cadrage.
- Committer un checkpoint verbeux à chaque micro-étape sans nécessité.
- Enchaîner des tours mono-outil alors que les appels sont indépendants.

## Quand cette skill se déclenche

- Au début d'une boucle qui va lire/explorer beaucoup.
- Quand une session consomme visiblement trop (Paul le signale).
- Avant de dispatcher un ou plusieurs agents (calibrer les briefs).

> La sobriété n'est pas l'à-peu-près : on ne coupe jamais sur la vérification,
> la sécurité ni l'accessibilité. On coupe sur le contexte inutile, pas sur la
> rigueur.
