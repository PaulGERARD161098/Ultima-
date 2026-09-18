# Contrat 01 — Composants

> Source : `specs/recu/2026-09-18-hopus-bibliotheque-ui.md` § 3.
> Un composant est une brique **sans contenu propre** : il ne connaît ni la
> marque, ni le métier. Ce qu'il affiche lui est donné.

| Composant | Variantes / rôle | Garantie non négociable |
|---|---|---|
| `FeatureCard` | `compact` · `standard` · `featured` × `neutral` · `tinted` · `dark` | le texte reste AA dans les six combinaisons |
| `IconTile` | conteneur d'icône piloté par tokens | l'icône est `aria-hidden` si elle double le texte |
| `CTAGroup` | primaire + secondaire, responsive | hiérarchie stable : primaire plein, secondaire outline/ghost |
| `MetricChip` | métrique, statut, preuve courte | ⛔ une valeur de démonstration est **marquée comme telle** |
| `StepCard` | numéro + titre + texte | le numéro est décoratif, l'ordre est porté par le balisage |
| `ComparisonCell` | `yes` · `no` · `limited` · `text` · `metric` | ⛔ jamais de sens porté par la seule couleur |
| `AccordionItem` | grande zone cliquable | ouvrable au clavier, `aria-expanded` tenu |
| `FloatingNav` | nav élevée / arrondie, sticky paramétrable | ne masque jamais le focus du premier lien |

## Ce que « variante » veut dire selon la stack

| Stack | Forme | Dépôts |
|---|---|---|
| React + Tailwind | props typées, CVA | `artisan-builder` |
| HTML + CSS vanilla | classe modificatrice `bloc--variante`, tokens CSS | `RenoBoost`, `Ultima-` |

⛔ **Un dépôt vanilla n'a pas à se doter d'un framework pour tenir ce contrat.**
Le contrat porte sur le comportement et les noms, pas sur la technique. Exiger
des props là où il n'y a pas de composants, c'est demander une migration que
personne n'a arbitrée.

---

## Critères de conformité

| # | Ce qui doit être vrai | Comment on le mesure |
|---|---|---|
| C1 | Chaque variante annoncée existe vraiment | inventaire des classes/props effectivement rendues |
| C2 | Aucune information portée par la seule couleur | relecture des états `ComparisonCell` en niveaux de gris |
| C3 | Tout élément interactif est atteignable au clavier | parcours `Tab` dans le harnais navigateur |
| C4 | Toute donnée d'exemple est signalée à l'écran | grep du libellé de démonstration dans le rendu |
