# Contrat 00 — Foundations

> Source : `specs/recu/2026-09-18-hopus-bibliotheque-ui.md` § 2.
> Portée : les huit dépôts. Arbitrage applicable : `specs/ARBITRAGES.md` § A1.
>
> ⛔ **Ce contrat ne porte aucune valeur.** Il dit quels noms doivent exister et
> ce qu'ils garantissent — chaque dépôt les implémente dans sa technique.
> C'est la mécanique déjà éprouvée par `RenoBoost/standards/TOKENS-CONTRAT.md` :
> *« on ne copie pas `design.css`, on mappe les mêmes noms sémantiques »*.
> Copier le code produirait huit copies qui divergent au premier correctif.

## 1. Système de surfaces

Six surfaces, et pas une septième inventée sur place.

| Surface | Rôle | Garantie |
|---|---|---|
| `base` | le papier de la page | porte du texte à ≥ 4,5:1 |
| `neutral` | section adjacente, contraste faible | se distingue de `base` sans bordure |
| `tinted-soft` | teinte de marque diluée | reste un fond, jamais une encre (§ A1) |
| `tinted-strong` | teinte de marque assumée | texte en `*-solide-encre`, pairé |
| `glass` | translucide sur média | lisible sur le pire pixel du média |
| `dark` | ponctuation sombre | **jamais le fond par défaut** |

## 2. Textures de fond

`none` · `dot-grid` · `soft-grid` · `radial-glow` · `noise` · `gradient-mesh`.

⛔ **Une seule texture dominante par section.** Deux textures superposées ne se
lisent pas comme une intention, elles se lisent comme un accident.

## 3. Ratios de layout

`50/50` · `60/40` · `40/60` · `2/3+1/3` · `grand+2 petits` · `text+product` ·
`product+text` · `full-width-impact`. Un ratio hors liste demande une entrée
dans ce fichier, dans le même commit, avec sa raison.

## 4. Rythme de section

`calm` → `medium` → `impact`, puis on recommence selon le contenu.

⛔ **Jamais plus de deux sections successives avec, en même temps, la même
structure, le même contraste et la même densité.** Les trois conditions sont
cumulatives : deux grilles de suite sont permises si l'une est calme et l'autre
d'impact.

## 5. Radius et élévation *(abroge la règle 1 de `DESIGN-LANGAGE.md` — § A1)*

Échelle `sm` / `md` / `lg` / `xl`, définie une fois par dépôt. Élévation =
**bordure subtile + ombre douce** ; aucune ombre arbitraire hors de l'échelle.

## 6. Mouvement

Durées et courbes **en tokens**, jamais en dur dans un composant.

⛔ Toute animation décorative est neutralisée sous `prefers-reduced-motion:
reduce`. Une animation qui ne sait pas s'arrêter n'est pas livrable.

## 7. Couleur — ce que A1 laisse intact

Les **encres** (`--color-primary-ink`, `--color-accent-ink`, `--color-danger-ink`)
et les **paires** `--color-*-solide` / `--color-*-solide-encre` de
`RenoBoost/standards/TOKENS-CONTRAT.md` restent la règle : dès qu'une couleur
**porte des lettres**, c'est une encre. Ce sont des mesures, pas un registre.

⛔ Une encre ne s'emploie **jamais** comme fond, et une paire ne se bascule
**jamais** à moitié — chacune seule donne un bouton illisible.

---

## Critères de conformité (vérifiables, pas jugés)

| # | Ce qui doit être vrai | Comment on le mesure |
|---|---|---|
| F1 | Les six surfaces existent et sont nommées | grep des noms dans la feuille de tokens du dépôt |
| F2 | Aucune valeur de couleur en dur hors du fichier de tokens | grep `#[0-9a-f]{3,6}` dans les CSS applicatifs |
| F3 | Tout texte atteint AA sur sa surface | contraste **calculé**, jamais estimé à l'œil |
| F4 | Aucune section n'anime sous `reduced-motion` | harnais navigateur, média émulé |
| F5 | Pas 3 sections d'affilée identiques sur les 3 axes | inventaire structure/contraste/densité de la page |
