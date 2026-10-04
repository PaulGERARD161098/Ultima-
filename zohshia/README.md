# ZOH SHIA — le dragon de la technologie

> Créé par Paul le 04/10/2026, étoile de la constellation des DRAGONS
> d'IMLADRIK : *« Dans ZOH SHIA je regroupe toute ma techno »* — puis : *« on
> garde uniquement la technologie en pur — pas de données techniques, pas de nom
> d'artisan : la technologie elle-même, avec tout ce qu'elle fait, ce qu'elle
> comporte »*.

## Ce qu'il contient

| Élément | Ce qu'on y trouve |
|---|---|
| `renodevis/` | Le plan de la techno RénoDevis (`TECHNO.md`), le guide et la check-list pour la mettre en service chez un pro (`AJOUTER-UN-ARTISAN.md`), l'inventaire mesuré (`inventaire.json`), l'extraction du code neutre (`extraire.mjs`) et la base neuve prouvée (`base/`) |

## Comment on l'invoque

Par la compétence **`zohshia`** (`.claude/skills/zohshia/SKILL.md`) : remesurer,
prouver la couverture, dérouler le guide, s'arrêter à chaque gate.

## Les cinq règles du dossier, et ce qu'elles préviennent

| Règle | Le danger qu'elle écarte |
|---|---|
| **La techno pure** — aucun nom d'artisan, de client, de fournisseur ni de marque ; aucune valeur propre à un pro. La liste des noms à bannir vit HORS du dossier (`outils/zohshia/noms-propres.json`) ; testé | Une instance particulière prise pour la techno |
| **Mesurer, ne pas recopier** — les listes viennent de `collecter.mjs`, avec le commit d'origine ; un nom technique qui porte un nom propre devient `[nom propre]` | Un plan écrit de mémoire, qui diverge du code sans que rien ne le dise |
| **Le plan nomme tout ce qui est mesuré** — `tests/unit-zohshia.mjs` rougit sinon | Une pièce oubliée le jour de la mise en service |
| **Des noms, jamais des valeurs** — ni secret, ni identifiant, ni adresse ; testé | Le plan devient la carte d'attaque du système |
| **Ni déployé, ni servi** — `.vercelignore` + préfixe privé `/zohshia` du middleware | La carte publiée sur le site public |

⚠️ **Ce qui n'est pas là, nommément** : une page à l'écran pour ZOH SHIA (elle
exigera une route authentifiée) ; et le code neutre lui-même, qui ne se STOCKE
pas — il s'EXTRAIT à la demande d'un commit du dépôt de référence, pour être
toujours à jour (`renodevis/extraire.mjs`).
