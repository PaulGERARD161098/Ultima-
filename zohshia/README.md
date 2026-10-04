# ZOH SHIA — le dragon de la technologie

> Créé par Paul le 04/10/2026, étoile de la constellation des DRAGONS
> d'IMLADRIK : *« Dans ZOH SHIA je regroupe toute ma techno »* — puis : *« la
> techno, ce qui la compose, doit vivre dans ZOH — toute la techno RenoDevis
> doit y vivre : le but est de pouvoir l'invoquer pour dupliquer aisément pour
> un autre artisan »*.

## Ce qu'il contient

| Élément | Ce qu'on y trouve | État |
|---|---|---|
| `renodevis/` | La techno de RénoDevis (`TECHNO.md`) et le guide « ajouter un artisan » (`AJOUTER-UN-ARTISAN.md`), sur un inventaire mesuré (`inventaire.json`) | Premier élément — 04/10/2026 |

## Comment on l'invoque

Par la compétence **`zohshia`** (`.claude/skills/zohshia/SKILL.md`) : remesurer,
prouver la couverture, dérouler le guide, s'arrêter à chaque gate.

## Les quatre règles du dossier, et ce qu'elles préviennent

| Règle | Le danger qu'elle écarte |
|---|---|
| **Mesurer, ne pas recopier** — les listes viennent de `collecter.mjs`, avec le commit d'origine | Une fiche écrite de mémoire, qui diverge du code sans que rien ne le dise |
| **La fiche nomme tout ce qui est mesuré** — `tests/unit-zohshia.mjs` rougit sinon | Une pièce nouvelle (variable, tâche, route) oubliée le jour de la duplication |
| **Des noms, jamais des valeurs** — ni secret, ni identifiant, ni adresse ; testé | La fiche devient la carte d'attaque du système |
| **Ni déployé, ni servi** — `.vercelignore` + préfixe privé `/zohshia` du middleware | La carte publiée sur le site public |

⚠️ **Ce qui n'est pas encore là, nommément** : une page à l'écran pour ZOH
SHIA. Elle exigera une route authentifiée (comme `/api/finubar`) : servir ce
dossier en statique le publierait. L'étoile reste donc une étoile d'attente,
qui dit où vit la techno et comment l'invoquer.
