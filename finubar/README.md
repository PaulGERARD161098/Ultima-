# Finubar — le pilotage des huit dépôts

> *« Beaucoup de projets tournent en même temps, et j'ai peur de m'y perdre. »*
> — Paul, 21/08/2026. Finubar est la réponse à cette phrase, et à rien d'autre.

## En une image

```
<dépôt>/FINUBAR.md ──┐
        × 8          │   collecter.mjs        agreger.mjs (PUR)
                     ├──► lit les 8 grains ──► ordre + cartouche ──► macro.json
   git (mesuré) ─────┘    mesure la dérive     + constellation           │
                          vérifie les copies                             │
                                              ┌──────────────────────────┤
                                              ▼                          ▼
                              finubar/macro.json          api/_lib/finubar-macro.mjs
                              (lisible, bloqué au public)  (importé par api/finubar.js)
                                                                         │
                    ┌────────────────────────────────────────────────────┤
                    ▼                                                    ▼
    .claude/finubar-rappel.mjs                               /finubar (derrière session)
    (hook SessionStart, dans les 8 dépôts)
```

⛔ **Rien de tout cela n'est servi en public.** Le middleware bloque `/finubar/`
(préfixe privé) et tous les `*.md` ; seul le chemin exact `/finubar` passe, et
cette page-là ne porte aucune donnée — tout vient de `/api/finubar`, authentifiée.
Sans cette ligne dans `middleware.js`, `macro.json` serait en lecture libre :
Vercel sert **tout** fichier commité en statique.

## Les trois usages

| Quand | Quoi | Comment |
|---|---|---|
| **À l'ouverture d'une séance** | le grain du dépôt courant, injecté tout seul | rien à faire — le hook s'en charge |
| **Pour l'état d'ensemble** | les 8 dépôts, rangés par ce qui appelle | `node finubar/collecter.mjs` · ou `/finubar` |
| **En fin de séance** | mettre à jour le grain, puis recollecter | voir `.claude/skills/finubar/SKILL.md` |

## Ce que Finubar ne fait pas, et pourquoi

- **Il ne remplace aucune roadmap.** `ROADMAP-MASTER.md`, les `CADRAGE-*.md`,
  les `REPRISE-*.md` restent la source détaillée. Finubar les **pointe**. Un
  index qui recopie ce qu'il indexe devient un deuxième original, et les deux
  divergent.
- **Il ne va rien chercher en direct** — ni base, ni API GitHub, ni cron. L'état
  est figé au dernier commit, et la page **affiche sa date**. Un pilotage qui ne
  dit pas de quand il date est un piège ; un pilotage qui exige un secret, un
  quota et une surveillance pour dire trois lignes coûte plus qu'il ne rapporte.
- **Il n'envoie aucune notification.** Arbitrage de Paul du 21/08 : le rappel
  arrive **à l'ouverture d'une séance**, pas par cron le matin. Ce qui tourne les
  jours où il ne travaille pas, il ne le lit pas.

## Rafraîchir

```bash
node finubar/collecter.mjs             # date du jour
node finubar/collecter.mjs 2026-08-21  # date forcée (rejouable, comparable)
```

La collecte **relit ce qu'elle vient d'écrire** et sort en erreur si les deux
formes divergent : une écriture à moitié faite et une écriture réussie ont la
même tête côté appel.

## Vérifier

```bash
node tests/unit-finubar.mjs           # le moteur + la cohérence des deux formes servies
node tests/smoke-finubar.mjs          # l'écran, session stubée (serveur local requis)
node tests/unit-adramelech-guard.mjs  # le garde qui empêche /finubar/ d'être public
```
