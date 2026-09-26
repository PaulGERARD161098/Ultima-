# Product

<!-- impeccable:product-schema 1 -->

> Écrit le 2026-09-26 par `impeccable init`, après un tour d'entretien avec Paul
> (trois inférences tirées du dépôt, les trois confirmées). Remplace, pour la
> vérité produit, les sections Vision / Personas / User stories de `PRODUIT.md`
> (juillet 2026), qui décrivaient la carte du réseau d'avant la console.
> `PRODUIT.md` garde les **contrats techniques** — modèle de données, API, front.

## Platform

web

## Users

**Paul, seul** — Ultima est mono-utilisateur (décision du 2026-07-03, confirmée
le 2026-09-26). Il s'en sert plusieurs fois par jour, souvent au téléphone le
soir, et dicte une bonne part de ses messages à la voix. Il y vient pour
**s'orienter** dans toute sa data, professionnelle et personnelle, et **agir** :
savoir où il en est, ce qui l'attend, et le faire avancer.

## Product Purpose

**L'unique interface de travail de Paul** (Directive JL, 2026-07-18, confirmée
le 2026-09-26). Dès qu'il faut travailler sur quoi que ce soit, Paul ouvre
Ultima : elle **absorbe** sa data, la **dispatche** et permet de **tout
naviguer**. Tout nouveau besoin devient une extension d'Ultima, jamais un outil
à côté.

Le succès se mesure à ce que Paul n'ait plus besoin d'ouvrir autre chose pour
savoir où il en est ni pour décider de sa prochaine action.

## Positioning

**Un seul interlocuteur, Léo**, sur **toute** la data de Paul. Aucune console du
marché ne peut prétendre cela, parce qu'aucune ne tient à la fois le réseau
commercial, les finances, les idées, le développement personnel et l'état des
dix dépôts de code de son propriétaire, avec une seule interlocutrice qui
oriente, prépare et contrôle.

## Operating Context

- **Léo** est l'interlocutrice unique (charte : `.claude/agents/leo.md`). Elle
  pilote, dispatche aux agents spécialistes et synthétise ; Paul ne lit jamais
  une sortie d'agent brute.
- **Quatre quadrants personnels** : RIVEN (réseau commercial), NICOL BOLAS
  (pilotage financier), ADRAMELECH (bibliothèque d'idées), IMLADRIK
  (développement personnel), regroupés sous GRIMA (l'utile) et NAGA (ce qui fait
  grandir) — `js/registre-lv3.mjs`, `CADRAGE-CONSOLE.md`.
- **Finubar** tient l'état des dépôts de Paul (`finubar/depots.json`, dix entrées
  au 2026-09-22) ; ils apparaissent comme des astres du ciel.
- **Le ciel est la navigation** : les écrans sont des constellations, les coques
  HTML restent des portes (LV4 à LV6, 2026-08-13 → 2026-08-31).
- Les droits de Léo en écriture sont **cadrés** (trois anneaux,
  `CADRAGE-2026-09-22-leo-pilote-tout.md` §2) et **pas encore construits**.

## Capabilities and Constraints

- Web statique + fonctions serverless Vercel (`api/`), Supabase (RLS sur toutes
  les tables), JavaScript vanilla, en français. Contrats : `PRODUIT.md`.
- Mono-utilisateur ; les inscriptions publiques ne sont pas une fonctionnalité.
- Toute migration SQL, fusion dans `main` ou modification RLS passe par un go
  explicite de Paul (`CLAUDE.md` §Gates).
- **Non décidé** : l'ouverture à un second utilisateur ; ce que Léo écrira sans
  demander (J3 du 2026-09-22).

## Brand Commitments

Confirmés par Paul le 2026-09-26, tous les quatre :

1. **Antique et sérieux** — l'univers de la carte savante, gravure et parchemin
   de nuit ; le registre enfantin est retiré (2026-07-08). Jamais au détriment
   de la lisibilité ni de l'accessibilité.
2. **Sécurité relevée** — finance et intime : RLS partout, aucune donnée
   personnelle en journal ni en message d'erreur, fail-closed
   (`CADRAGE-CONSOLE.md` §5).
3. **Ultima compte, elle ne reproche pas** — aucun signal ne rougit ni ne pâlit ;
   une couleur dit seulement « il y a quelque chose à faire ici » (règle ③
   d'ALTHEA, étendue au produit).
4. **Le ciel est la navigation** — les constellations sont le chemin.

Noms propres du produit : ULTIMA, Léo (au féminin), RIVEN, NICOL BOLAS,
ADRAMELECH, IMLADRIK, GRIMA, NAGA, ALPHA, ALTHEA, TAO, Finubar.

## Evidence on Hand

- La donnée réelle vit dans Supabase (base de production) et dans l'agrégat
  Finubar commité (`finubar/macro.json`).
- ⛔ **À ne pas fabriquer** : aucun témoignage, aucun utilisateur tiers, aucun
  chiffre d'usage. Les volumes de données se **mesurent** en base au moment de
  les citer — un chiffre recopié d'un document se périme.

## Product Principles

1. **Une interface, pas une de plus** — ce qui manque s'ajoute à Ultima.
2. **Le système travaille, Paul contrôle** — l'automatique propose, le manuel
   gagne ; une saisie manuelle obligatoire est une régression.
3. **Rien de ce qui est donné à Paul n'est déduit** — toute valeur affichée est
   lue à sa source et sa provenance peut être citée.
4. **Compter sans reprocher** — l'interface appelle, elle ne juge pas.

## Accessibility & Inclusion

Contraste WCAG AA sur tous les textes, cibles tactiles ≥ 24 px, navigation
complète au clavier, `prefers-reduced-motion` respecté — tenus par les harnais
de `tests/` (`smoke-ciel`, `smoke-clic-exact`, `smoke-lv4-coque`).
