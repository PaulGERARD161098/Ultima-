# Contrat 02 — Patterns marketing

> Source : `specs/recu/2026-09-18-hopus-bibliotheque-ui.md` § 4 et § 5.
> Un pattern est une **section entière**, configurable, sans contenu propre.

| Pattern | Fonction | API minimale |
|---|---|---|
| `HeroSplit` | promesse + CTA + représentation produit | `mediaSide`, `align`, `surface`, `proof` |
| `TrustTicker` | bandeau continu de preuves / USP | `items`, `speed`, `direction`, `pauseOnHover` |
| `ReasonCards` | 3 bénéfices principaux | `items`, `icon`, `surface` |
| `BentoBenefits` | 1 bénéfice dominant + secondaires | `featured`, `secondary[]`, `layout` |
| `Steps` | parcours en 3 à 5 étapes | `steps`, `numbered` |
| `FeatureGrid` | grille d'outils / fonctions | `items`, `columns`, `cardVariant` |
| `ProductShowcase` | texte + interface produit tangible | `media`, `metrics`, `bullets`, `mediaSide` |
| `MobileShowcase` | texte + maquette mobile | `deviceMedia`, `bullets` |
| `LeadMagnet` | contenu offert + formulaire | `benefits`, `fields`, `submit` |
| `InteractiveCalculator` | diagnostic chiffré | `inputs`, adaptateur de formule, `result`, CTA |
| `BeforeAfter` | contraste ancien / nouveau | `before`, `after`, `darkVariant` |
| `ComparisonMatrix` | comparaison structurée | `columns`, `rows`, `highlightedColumn?` |
| `PricingCards` | 2 à 4 offres | `plans`, `billingToggle?`, `featuredPlan` |
| `FAQSplitAccordion` | intro à gauche, accordéon à droite | `items`, `defaultOpen` |
| `FinalCTA` | grand panneau de conversion | `title`, `subtitle`, CTAs, `surface` |

## Les cinq règles du `TrustTicker`

1. Défilement **lent, continu, discret** — jamais un bandeau financier.
2. Les items dupliqués pour boucler sont **invisibles aux technologies
   d'assistance** (`aria-hidden` sur la copie).
3. Pause au survol et au focus quand c'est pertinent.
4. ⛔ Sous `prefers-reduced-motion: reduce` : **aucun défilement**, version
   statique ou débordement maîtrisé.
5. Si le CSS suffit, **pas de JS**. Une dépendance lourde pour faire glisser du
   texte est une dette qu'on paiera ailleurs.

## ⛔ Les trois interdits qui traversent tous les patterns

- **Aucune donnée fictive présentée comme réelle.** Un chiffre d'exemple porte
  sa mention à l'écran, pas en commentaire dans le code. *(Règle maison déjà
  tenue par le skill `livrer-une-page` : le registre de ce qui n'est pas branché.)*
- **Aucune promesse que le produit ne tient pas.** Un pattern ne crée pas la
  promesse, il la met en page. *(Cf. `RenoBoost/CLAUDE.md` § 12.2.)*
- **Aucune reprise d'identité tierce** : ni palette, ni illustration, ni
  wording, ni forme décorative reconnaissable de la source d'inspiration
  (§ 9 du document reçu).

## Ce que le calculateur impose en plus

`InteractiveCalculator` affiche **ses hypothèses** à côté de son résultat, et
sa formule est **traçable jusqu'à une règle métier du dépôt**. ⛔ En cas de
divergence, **la règle métier gagne sur la maquette** — jamais l'inverse.

---

## Critères de conformité

| # | Ce qui doit être vrai | Comment on le mesure |
|---|---|---|
| P1 | Le ticker ne défile pas sous `reduced-motion` | harnais navigateur, média émulé — **prouvé en le cassant** |
| P2 | Les items dupliqués ne sont pas annoncés deux fois | lecture de l'arbre d'accessibilité rendu |
| P3 | Chaque chiffre affiché remonte à sa règle métier | grep de la valeur → test ou source qui la tient |
| P4 | Toute valeur de démonstration est marquée à l'écran | recherche du libellé dans le **texte rendu**, balises retirées |
| P5 | Aucun pattern ne promet ce que le produit ne tient pas | confrontation au registre des promesses du dépôt |
