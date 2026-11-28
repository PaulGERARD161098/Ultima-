---
name: developpement-rigoureux
description: Discipline de développement pour toute livraison de code dans les dépôts de Paul — cadrer et planifier par petites tâches, écrire le test d'abord, déboguer méthodiquement, relecture par des relecteurs sans contexte (méthode Elephant/Goldfish), vérifier avant d'annoncer, recevoir une revue, paralléliser des sous-agents, migrations et Postgres, gestion d'erreurs, contexte et compactage. Déclencher avant d'implanter une fonctionnalité, sur un bug, avant de déclarer « fini », sur une revue de code reçue, ou pour une spécification à faire relire.
---

# Développement rigoureux — pour Léo

Ce skill **ne remplace pas** `methode-paul` (EB, JL, EL, DR, ZS, MS) : il en
outille l'exécution. En cas d'écart, la méthode de Paul, `CLAUDE.md` et les
gates priment (fusion, migrations, RLS, envois, dépenses).

## La boucle, dans l'ordre
1. **Cadrer** (EL, format 6 points) — pour explorer : `superpowers/brainstorming`.
2. **Chercher avant de coder** : `ecc/search-first` (existant du dépôt, ZOH,
   bibliothèque officielle) — Directive EB.
3. **Spécifier puis faire relire à l'aveugle** : l'« éléphant » rédige la
   spécification, des « poissons rouges » sans contexte la jugent et ne voient
   que le texte. Léger : `egm/egm-lite` ; complet : `egm-draft` → `egm-review`
   → `egm-review-loop` → `egm-resolve`. En séance, les poissons rouges sont des
   sous-agents neufs (`verificateur`, `securite-auditeur`, `general-purpose`)
   qui reçoivent le texte, jamais la conclusion — préférence de Paul :
   séparer génération et évaluation.
4. **Planifier par petites tâches vérifiables** : `superpowers/writing-plans`.
5. **Test d'abord** : `superpowers/test-driven-development` — le test doit
   d'abord échouer pour la bonne raison (règle DR : l'instrument se valide sur
   un cas dont on connaît la réponse).
6. **Déboguer par la cause, pas par l'essai** : `superpowers/systematic-debugging`.
7. **Paralléliser** les axes indépendants : `superpowers/dispatching-parallel-agents`,
   `superpowers/subagent-driven-development` (tiers de modèle économe par défaut).
8. **Vérifier avant d'annoncer** : `superpowers/verification-before-completion`
   et `ecc/verification-loop` — aucune affirmation « vert », « corrigé »,
   « fini » sans sortie fraîche à l'appui, citée.
9. **Recevoir une revue** : `superpowers/receiving-code-review` — vérifier
   chaque remarque avant de l'appliquer ou de la contester.

## Mesurer l'impact avant de toucher le code (graphe du code)
`scripts/graphe-code.sh` (Graphify 0.9.122, Apache-2.0, épinglé) construit en
≈ 12 s le graphe d'un dépôt — 10 010 nœuds, 17 692 liens sur Ultima le 28/11 —
par analyse syntaxique locale : aucun modèle, aucun envoi du code. Il travaille
sur une copie de `HEAD` dans un dossier temporaire, jamais dans le dépôt.
`construire` puis `expliquer "fonction"` (qui l'appelle, ce qu'elle appelle,
quels tests l'importent), `chemin "a.js" "b.js"`, `question "…"`. À lancer
avant de modifier une fonction partagée ou de supprimer du code présumé mort.
Ce que Finubar ne fait pas : Finubar dit où en est chaque dépôt, le graphe dit
qui dépend de quoi. Non utilisés : l'extraction des docs et PDF (elle passe par
un modèle) et le serveur MCP hébergé de Graphify (données chez un tiers).

## Références techniques (stack de Paul : JS/TS, Supabase, Vercel)
`ecc/database-migrations`, `ecc/postgres-patterns` (migration = SQL rédigé,
jamais appliqué sans le go de Paul) · `ecc/error-handling` (erreurs génériques
côté client, détaillées côté serveur) · `ecc/strategic-compact`,
`ecc/context-budget` (au-delà de ≈ 400 k tokens : repartir d'une séance neuve).

## Écarts assumés avec les sources
- Les worktrees et la fin de branche de Superpowers ne sont pas repris : la
  règle d'ici est une branche de séance, une PR en fin de séance (CLAUDE.md).
- Les commandes `npm`, `pytest`… citées par les guides s'adaptent au dépôt :
  `npm test` et `bash tests/lancer.sh` dans Ultima.

## Sources (licences dans `references/`)
`obra/superpowers` @ `22f0b463e7a5` (MIT) · `google/elephant-goldfish-model`
@ `46933754e63c` (Apache-2.0, « pas un produit Google supporté ») ·
`affaan-m/everything-claude-code` @ `4adeee6732a1` (MIT). Récupérés le
28/11/2026 ; textes seulement ; `SKILL.md` amont renommés `GUIDE.md` sous
`references/` (non chargés comme skills autonomes).
