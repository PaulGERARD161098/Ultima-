# Contrat 03 — Compositions

> Source : `specs/recu/2026-09-18-hopus-bibliotheque-ui.md` § 6 et § 7.
> Une composition est un **assemblage documenté** de patterns — un point de
> départ, jamais un gabarit à remplir.

| Composition | Enchaînement |
|---|---|
| **SaaS Landing** | HeroSplit → TrustTicker → ReasonCards → BentoBenefits → Steps → FeatureGrid → ProductShowcase → BeforeAfter → Calculator/LeadMagnet → ComparisonMatrix → FAQ → FinalCTA |
| **Artisan Local** | Hero appel/devis → preuves locales → services → réalisations → zones → avis → processus → FAQ → CTA |
| **Lead Generation** | Hero → preuve → problème → diagnostic → bénéfices → cas → formulaire → FAQ → CTA |
| **Product Launch** | Hero produit → ticker → showcase → benefits → workflow → comparison → pricing → FAQ → CTA |
| **Premium Service** | Hero → preuves → problème → méthode → accompagnement → résultats → offre → FAQ → CTA |

## Les sept règles de composition

1. Une landing n'est pas une succession de grilles identiques.
2. Alterner **calme → structurée → impact**, puis recommencer selon le contenu.
3. Au moins **une démonstration tangible du produit** sur une landing SaaS.
4. Les bénéfices importants prennent **plus de place** (c'est le rôle du bento) —
   on n'égalise pas artificiellement toutes les fonctions.
5. Les sections sombres **ponctuent** ; elles ne deviennent pas le fond.
6. **Le contenu commercial dicte le layout**, jamais l'inverse.
7. Hiérarchie de CTA **stable sur toute la page** : primaire plein, secondaire
   outline ou ghost selon le thème.

## ⛔ Une composition ne se recopie pas d'un dépôt à l'autre

Elle se **cite** : « cette page suit *SaaS Landing*, moins le LeadMagnet, plus
un bloc de tarification maison ». L'écart se dit — c'est lui qui est
intéressant, pas la conformité.

---

## Critères de conformité

| # | Ce qui doit être vrai | Comment on le mesure |
|---|---|---|
| X1 | La page déclare la composition qu'elle suit, et ses écarts | une ligne dans la spec de la page |
| X2 | Règle 2 tenue : pas 3 sections identiques sur les 3 axes | inventaire structure / contraste / densité |
| X3 | Une démonstration tangible existe | la section produit est identifiable dans le rendu |
| X4 | Un seul niveau de CTA primaire par page | comptage des CTA primaires rendus |
