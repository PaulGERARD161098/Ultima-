# Bibliothèque UI — patterns marketing inspirés de Hopus

> ⚠️ **DOCUMENT REÇU, NON ÉCRIT PAR CE DÉPÔT.** Versionné ici le 2026-09-18,
> tel qu'il a été remis par Paul (deux fichiers `.docx` transmis, **identiques** —
> `md5 316cde708113b96b807e4124d82aadea` —, donc un seul document).
> Texte extrait du `.docx` : les tableaux du fichier d'origine y apparaissent
> aplatis, une cellule par ligne. **Il est versionné parce qu'une séance web est
> éphémère** : un cahier des charges qui ne vit que dans une conversation est
> perdu au contexte suivant, et le lot d'après repart d'un souvenir.
>
> **Ce qu'il est** : la source d'où sont tirés les contrats de `specs/contrats/`.
> **Ce qu'il n'est pas** : la référence à citer. On cite le contrat, jamais ce
> fichier — un document reçu ne se modifie pas, et un contrat, si.
>
> **Statut d'arbitrage** : Paul a tranché le 2026-09-18 que **ce document gagne**
> contre le registre visuel en vigueur (`RenoBoost/DESIGN-LANGAGE.md`).
> Portée exacte, et ce qui y survit : `specs/ARBITRAGES.md` § A1.

---

Bibliothèque UI — Patterns marketing inspirés de Hopus
Document maître pour Claude Code — absorption des specs + implantation Bibliothèque et RénoBoost IA
18 septembre 2026 • Spécification d’implémentation • Source visuelle : captures Hopus fournies dans le projet
0. Directive pour Claude Code
Ce document devient la référence du lot. Il ne s’agit pas de copier Hopus : extraire ses mécaniques de composition, les transformer en briques génériques, puis les décliner avec l’identité et les contenus RénoBoost IA.
Auditer l’existant avant de coder ; réutiliser/étendre les composants propres plutôt que dupliquer.
Aucune reprise servile de palette, illustrations, wording, logo ou formes décoratives Hopus.
Bibliothèque d’abord générique ; RénoBoost consomme les patterns via tokens et props.
Desktop/tablette/mobile, clavier, reduced-motion et performance font partie de la Definition of Done.
Ne rien merger automatiquement : préparer une branche/PR propre et documentée.
1. Architecture cible de la Bibliothèque
Niveau
Contenu
01 — Foundations
Couleurs/tokens, typographie, spacing, radius, ombres, surfaces, textures, motion, ratios de layout.
02 — Components
Button, Card, Input, Badge, Tabs, Accordion, Navbar, IconTile, CTAGroup, MetricChip, StepCard.
03 — Patterns
Sections marketing complètes : hero, ticker, bento, steps, produit, comparaison, pricing, FAQ, calculateur, CTA.
04 — Compositions
Assemblages documentés : SaaS Landing, Artisan Local, Lead Generation, Product Launch, Premium Service.
2. Foundations à compiler
Surface system : base | neutral | tinted-soft | tinted-strong | glass | dark. Valeurs injectées par les tokens de chaque marque.
BackgroundTexture : none | dot-grid | soft-grid | radial-glow | noise | gradient-mesh. Une seule texture dominante par section.
Layout ratios : 50/50 | 60/40 | 40/60 | 2/3+1/3 | grand+2 petits | text+product | product+text | full-width-impact.
Section rhythm : calm | medium | impact. Interdiction d’enchaîner plus de deux sections avec simultanément même structure, contraste et densité.
Motion centralisée : durées/easings en tokens ; animations décoratives compatibles prefers-reduced-motion.
Radius : échelle sm/md/lg/xl ; elevation : bordure subtile + ombre douce, pas d’ombres lourdes arbitraires.
3. Components à compiler
Composant
Variantes / rôle
FeatureCard
compact | standard | featured ; neutral | tinted | dark
IconTile
Conteneur d’icône cohérent piloté par tokens.
CTAGroup
CTA primaire + secondaire ; responsive.
MetricChip
Métrique/statut/preuve courte pour UI produit.
StepCard
Numéro + titre + texte.
ComparisonCell
yes/no/limited/text/metric, sans couleurs codées en dur.
AccordionItem
Grande zone cliquable, états clavier/focus accessibles.
FloatingNav
Navigation élevée/arrondie en option, sticky paramétrable.
4. Patterns marketing à compiler
Pattern
Fonction
API minimale
HeroSplit
Promesse + CTA + représentation produit
mediaSide, align, surface, proof
TrustTicker
Bandeau horizontal continu de preuves/USP
items, speed, direction, pauseOnHover
ReasonCards
3 bénéfices principaux
items, icon, surface
BentoBenefits
1 bénéfice dominant + secondaires
featured, secondary[], layout
Steps
Parcours en 3–5 étapes
steps, numbered
FeatureGrid
Grille d’outils/fonctions
items, columns, cardVariant
ProductShowcase
Texte + interface produit tangible
media, metrics, bullets, mediaSide
MobileShowcase
Texte + mockup mobile
deviceMedia, bullets
LeadMagnet
Contenu offert + formulaire
benefits, fields, submit
InteractiveCalculator
Diagnostic/calculateur de conversion
inputs, formula adapter, result, CTA
BeforeAfter
Contraste ancien/nouveau fonctionnement
before, after, darkVariant
ComparisonMatrix
Comparaison structurée
columns, rows, highlightedColumn?
PricingCards
2–4 offres
plans, billingToggle?, featuredPlan
FAQSplitAccordion
Intro gauche + accordéon droite
items, defaultOpen
FinalCTA
Grand panneau de conversion
title, subtitle, CTAs, surface
5. Règles du TrustTicker
Défilement lent, continu et discret ; jamais effet ticker financier agressif.
Dupliquer visuellement les items seulement pour la boucle ; doublons non annoncés aux technologies d’assistance.
Pause hover/focus lorsque pertinent.
prefers-reduced-motion: reduce => aucun défilement automatique ; version statique/overflow contrôlé.
Texte, mini-icônes ou badges autorisés ; dépendance JS lourde interdite si CSS suffit.
6. Règles de composition
Une landing ne doit pas être une succession de grilles identiques.
Alterner : calme → structurée → impact, puis recommencer selon le contenu.
Au moins une démonstration tangible du produit sur une landing SaaS.
Donner plus d’espace aux bénéfices importants via BentoBenefits ; ne pas égaliser artificiellement toutes les fonctions.
Les sections sombres ponctuent la page ; elles ne deviennent pas le fond systématique.
Le contenu commercial dicte le layout, pas l’inverse.
Hiérarchie CTA stable : primaire plein, secondaire outline/ghost selon le thème.
7. Compositions à enregistrer
SaaS Landing : HeroSplit → TrustTicker → ReasonCards → BentoBenefits → Steps → FeatureGrid → ProductShowcase → BeforeAfter → Calculator/LeadMagnet → Comparison → FAQ → FinalCTA
Artisan Local : Hero appel/devis → preuves locales → services → réalisations → zones → avis → processus → FAQ → CTA
Lead Generation : Hero → preuve → problème → diagnostic/calculateur → bénéfices → cas/preuves → formulaire → FAQ → CTA
Product Launch : Hero produit → ticker → showcase → benefits → workflow → comparison → pricing → FAQ → CTA
Premium Service : Hero → preuves → problème → méthode → accompagnement → résultats/cas → offre → FAQ → CTA
8. Déclinaison RénoBoost IA
Pattern
Application RénoBoost
HeroSplit
Conserver l’identité RénoBoost ; rendre le produit beaucoup plus tangible via UI/mockup métier.
TrustTicker
RELANCE DE DEVIS · SUIVI COMMERCIAL · CLIENTS À RAPPELER · AVIS GOOGLE · PILOTAGE DU CA · PENSÉ POUR LES ARTISANS · IA AU SERVICE DU TERRAIN
BentoBenefits
Dominant : « Vos devis ne disparaissent plus après leur envoi. » Secondaires : bon moment de relance / priorités du jour.
ProductShowcase
Exemples de démo : 12 devis à relancer ; 4 clients chauds ; 18 450 € de devis en attente ; relance recommandée aujourd’hui. Marquer clairement les données comme démonstratives.
BeforeAfter
Avant : « Vous pensez à relancer. » → Avec RénoBoost : « RénoBoost vous dit qui appeler aujourd’hui. »
InteractiveCalculator
« Combien de chiffre d’affaires dort dans vos devis ? » Entrées : devis/mois, panier moyen, taux de signature ; hypothèses explicites.
ComparisonMatrix
Préférer Sans système / Avec RénoBoost à une attaque concurrentielle.
FinalCTA
Grand bloc de conversion cohérent avec les CTA déjà retenus sur le site.
9. À ne pas reprendre de Hopus
Rose/bleu marine exacts, illustrations humaines, formes décoratives reconnaissables.
Textes, wording, identité de marque ou copie pixel-perfect.
Pricing ou informations concurrentielles Hopus : la référence est ici UI/UX uniquement.
Accumulation de cartes sans hiérarchie.
10. Plan d’implantation
Étape
Action
A — Audit
Identifier stack, tokens, composants, route Bibliothèque, homepage RénoBoost, responsive, animations et tests. Produire mapping existant → cible.
B — Foundations
Normaliser surfaces, backgrounds, rhythm, ratios, motion, radius sans casser l’existant.
C — Components
Créer/étendre les composants génériques de la section 3.
D — Patterns
Implémenter les 15 patterns comme composants configurables.
E — Bibliothèque
Navigation Foundations / Components / Patterns / Compositions ; preview, variantes, props, responsive et exemple pour chaque pattern.
F — RénoBoost
Mapper puis migrer progressivement. Priorité : TrustTicker, rythme de surfaces, BentoBenefits, ProductShowcase, BeforeAfter.
G — Interactivité
Accordéon, ticker, calculateur et autres interactions utiles seulement.
H — QA
Lint/typecheck/tests/build + mobile/tablette/desktop + clavier + reduced-motion + perf selon pipeline.
I — Livraison
Résumé fichiers, décisions, captures si possible, dettes restantes et commandes de test. Ne pas merge.
11. Definition of Done
Patterns génériques sans branding Hopus.
RénoBoost consomme les briques via tokens/props, pas duplication.
Bibliothèque expose patterns et variantes utiles.
Pas plus de deux sections RénoBoost successives de même structure + contraste + densité.
TrustTicker accessible/reduced-motion.
Responsive validé mobile/tablette/desktop.
Aucune donnée fictive présentée comme réelle.
Build/lint/typecheck/tests existants passent.
Aucun merge.
12. Prompt prêt à coller dans Claude Code
Tu travailles sur la Bibliothèque UI et le site vitrine RénoBoost IA.Lis intégralement ce document et considère-le comme la référence fonctionnelle de ce lot.OBJECTIF1. Absorber ces règles dans la documentation/specs du repo pour qu’elles restent la référence du projet.2. Auditer l’existant avant toute modification.3. Transformer les mécaniques retenues en foundations/components/patterns génériques dans la Bibliothèque.4. Décliner ces patterns dans RénoBoost IA sans copier l’identité Hopus.5. Préparer une implémentation propre et testée, SANS MERGE.CONTRAINTES- Ne supprime/réécris pas aveuglément les composants existants ; réutilise et étends ce qui est propre.- Aucune couleur, illustration, wording ou décoration Hopus copiée.- Pas de données métier fictives présentées comme réelles.- Responsive, clavier, prefers-reduced-motion et performance obligatoires.- TrustTicker discret, continu et accessible.- Règle de rythme : pas plus de deux sections successives avec même structure + contraste + densité.- RénoBoost reste terrain + artisan + technologie + performance commerciale.- Ne merge rien.ORDREA. État des lieux du repo et fichiers/routes concernés.B. Mapping existant → cible + conflits avec specs actuelles.C. Foundations → Components → Patterns.D. Mise à jour de la Bibliothèque avec previews/variantes/docs.E. Déclinaison progressive dans RénoBoost, priorité TrustTicker/Bento/ProductShowcase/BeforeAfter.F. QA complète selon la Definition of Done.G. Termine par un compte rendu : fichiers modifiés, architecture, tests exécutés/résultats, écarts, reste à faire. Ne merge pas.
