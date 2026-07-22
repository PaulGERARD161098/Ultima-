# CADRAGE-NICOL-BOLAS — le simulateur de lancement d'entreprise (ABAQUE)

> Source de vérité de la première boucle outillée du quadrant **NICOL BOLAS**
> (pilotage financier ; cadrage plateforme : `CADRAGE-CONSOLE.md` §3.2 et §5).
> Écrit en **cadrage pur** (directive EB : cadrer avant de coder, une boucle à la
> fois) — **rien n'est codé ici**. Ne re-décide rien d'acté ailleurs : il **borne**
> ce qu'on construit, dans quel ordre, et où sont les gates.
>
> **Nom de code proposé : ABAQUE** (l'instrument de calcul antique — registre
> savant, cohérent avec CHAMBRE CLAIRE) — *à confirmer par Paul*.

## 1. Cap — pourquoi cet outil

Un simulateur « expert-comptable » qui rend **chiffrable et décidable** tout
**projet monté de zéro** : à partir d'hypothèses saisies, il sort les **besoins
réels** d'un lancement — masse salariale chargée, URSSAF/charges, matériel,
**besoin en fonds de roulement (BFR)**, **trésorerie plancher avant équilibre**,
**seuil de rentabilité** et **échéancier de trésorerie mensuel**.

- **Source du besoin** : la fiche **ADR-007 VERTUMNE** (`adramelech/IDEES.md`),
  blocs **C** (audit de lancement chiffré) et **G** (provision d'exécution :
  « brique-outil n°1 »). VERTUMNE est le **cas d'usage fondateur** de l'outil ;
  l'outil resservira **au-delà** (tout projet de lancement).
- **Cohérence quadrant** : NICOL BOLAS est déjà cadré comme « expert-comptable
  personnel » (revenus/charges, prévision d'impôts, échéancier — `CADRAGE-CONSOLE.md`
  §3.2). ABAQUE en est le **volet prospectif** (avant de lancer), quand le reste
  du quadrant est **rétrospectif** (piloter l'existant). Même identité, autre
  temporalité.
- **Statut d'ABAQUE vis-à-vis de VERTUMNE** : VERTUMNE est **enveloppe-cadre,
  build différé** (ADR-007 bloc F, décision Paul 2026-07-22). ABAQUE est le
  **seul chantier court terme** qu'elle ouvre — précisément parce qu'il faut
  **chiffrer avant de décider d'engager quoi que ce soit**.

**Nature de l'outil (à afficher, non négociable)** : une **aide à la décision
paramétrique**, *jamais un conseil comptable opposable*. Tout taux FR est une
**hypothèse par défaut modifiable, horodatée « à vérifier »** (la réglementation
bouge — esprit HÉRAUT/veille).

## 2. Acquis — d'où on part (rien à refaire)

- **Le modèle de calcul est spécifié** (proposition `data-ingenieur`, 2026-07-22,
  contre-passe Léo) : entrées paramétrables, formules déterministes, arbitrage
  achat/location, recommandation de persistance. §4 ci-dessous en est la synthèse
  de référence.
- **Motifs réutilisables** : migrations `0007_idees.sql` / `0008_intendant.sql`
  (RLS mono-owner, une policy par opération, `owner_id = (select auth.uid())`,
  CHECK d'énumération, trigger `set_updated_at`) — à reprendre **si et seulement
  si** une base devient nécessaire (boucle 3, gate).
- **Harnais patrimoine** `tests/` (fixtures npm en cache, zéro CDN) : le moteur
  déterministe s'y teste et s'y enrichit (jamais de harnais jetable).

## 3. Périmètre v1 — le moteur de calcul, PAS l'ERP comptable

**v1 = « le moteur qui chiffre un lancement », déterministe, sans base.**

1. Une **fonction pure** `simuler(entrées) → sorties` : mêmes entrées → mêmes
   sorties, sans état, sans horloge, sans aléa. C'est la brique-outil n°1.
2. Les **sorties utiles en rendez-vous de décision** : masse salariale chargée,
   coût URSSAF séparé, BFR, **trésorerie plancher + mois du point bas**, besoin de
   financement minimal, seuil de rentabilité (CA point mort) + délai d'atteinte,
   **courbe de trésorerie mensuelle** sur 12-24 mois.
3. L'**arbitrage achat vs location** d'un actif (ex. le parc de clim de VERTUMNE),
   avec la **contrainte de cash prioritaire** (louer si l'achat fait plonger la
   trésorerie plancher — c'est l'argument « louer le parc » du bloc C).
4. Des **scénarios comparables** (prudent / volontariste) en changeant les
   hypothèses, **exportables/importables en JSON** (pas de base).

**Hors v1, explicitement** :
- **Aucune persistance en base** (cf. §5 — surface minimale ; la table `0009`
  n'est ni écrite ni appliquée tant que la boucle 3 n'est pas ouverte).
- **Pas d'import de vrais bulletins/factures** pour caler les hypothèses (surface
  upload = gate + cadrage sécu §5).
- **Pas de moteur fiscal complet** (IS, acomptes, TVA fine) : la TVA et l'IS sont
  un **module activable** en info, pas un décaissement modélisé au centime en v1
  (limite affichée).
- **Pas de conseil** : l'outil calcule et montre, il ne recommande pas de statut
  ni ne remplace un expert-comptable.

## 4. Le modèle de calcul (référence de spec)

> Synthèse de la proposition `data-ingenieur` — la spec d'implémentation de la
> boucle 1. Tous les taux sont des **hypothèses par défaut modifiables** (§8).

**Entrées (hypothèses paramétrables)** — cadre du projet (`horizon_mois` 12-24,
`tresorerie_initiale`, `statut_juridique`) ; **main d'œuvre** (postes : ETP,
brut mensuel, dirigeant ?, `taux_charges_patronales` ajustable par poste,
`coef_annualisation` pour provisionner congés/13ᵉ) ; **investissements achat**
(montant, TVA, amortissement, revente) **vs locations** (mensualité, dépôt) ;
**activité** (CA prévisionnel, saisonnalité 12 coefficients, `marge_brute_cible`,
délais d'encaissement client / règlement fournisseur / paiement charges,
charges de structure) ; **module fiscal** off par défaut.

**Formules clés (déterministes)** :
- `MS_chargée = MS_brute + charges_patronales` (super-brut) ; **URSSAF affiché à
  part** (c'est ce poste, décalé, qui pèse sur le BFR).
- Charges fixes `CF(m) = MS_chargée + rémunération dirigeant + structure +
  amortissement(m) + loyers(m)`.
- **Seuil de rentabilité** `CA_seuil(m) = CF(m) / marge_brute_cible` (garde-fou :
  marge ≤ 0 → sortie « marge invalide », pas de division) ; **délai d'atteinte**
  = premier mois où le résultat d'exploitation devient **durablement** ≥ 0.
- **BFR** = créances clients − dettes fournisseurs − dettes sociales (indicateur
  de tension).
- **Échéancier de trésorerie** : chaque flux différé de `délai` jours par
  interpolation linéaire déterministe ; `trésorerie(m) = trésorerie(m−1) +
  encaissements(m) − décaissements(m)` ; en sortie **`trésorerie_plancher`**,
  `mois_du_point_bas`, `besoin_financement_min = max(0, −plancher)` et un
  **coussin recommandé** (plancher × marge de sécurité).
- **Achat vs location** : comparer les VAN actualisées sur la durée d'usage
  réelle **après** la règle de cash (si l'achat casse la trésorerie plancher →
  louer, quel que soit le coût actualisé).

**Réserve v1 relevée en contre-passe (à raffiner)** : le décaissement URSSAF
modélise les charges **patronales** ; la **part salariale** (brut − net) reversée
à l'URSSAF n'est pas décaissée séparément → **léger optimisme de trésorerie**.
Simplification v1 assumée, à corriger dès la boucle 2 (ou marquée comme telle
dans les sorties).

## 5. Sécurité — finance = surface ultra-sensible (RC2, §5 console)

- **v1 sans base = surface minimale.** Rien n'est stocké : aucune RLS à auditer,
  rien à chiffrer au repos, **aucune finance au repos ni en logs** (règle CLAUDE.md
  étendue : IDs seuls). Décision retenue (contre-passe Léo) : **on ne crée la
  table que quand la sauvegarde de scénarios devient un besoin explicite de Paul**,
  pas avant.
- **Si persistance (boucle 3)** : draft `supabase/migrations/0009_simulateur.sql`
  en **miroir strict de 0007/0008** (RLS mono-owner, une policy par opération,
  `WITH CHECK` sur écritures, CHECK d'énumération, `set_updated_at`, unicité
  `(owner_id, nom)`, en-tête scalaire + soute `hypotheses jsonb` bornée + snapshot
  des sorties clés). **SQL jamais écrit ni appliqué sans gate Paul** + escalade
  Opus (RLS/données sensibles) + contre-passe `securite-auditeur` + advisors.
- **Rattachement optionnel** d'un scénario à l'idée source (`idee_id` vers
  `idees`) : en `on delete set null` ; un scellement croisé dur exigerait un index
  `unique (owner_id, id)` additif sur `idees` (comme en 0008) → **à signaler à
  Paul** si le lien devient une contrainte dure.

## 6. Découpage en sous-boucles (une à la fois, gates respectées)

- **NB-1 — moteur de calcul pur** (JS `js/`/`api/`, zéro base) : `simuler(entrées)`
  + arbitrage achat/location, livré avec **harnais déterministe** dans `tests/`
  (jeux d'entrées → sorties figées ; le test casse si une formule dérive).
  **Non gaté.** C'est la brique-outil n°1 (ADR-007 bloc G).
- **NB-2 — front NICOL BOLAS** : `data-ingenieur` cadre le modèle, `interface-ux`
  conçoit, `front-carto`/`graphisme` implémentent au registre antique. Curseurs
  d'hypothèses → sorties lisibles, scénarios prudent/volontariste, **courbe de
  trésorerie**, bandeau « hypothèses à vérifier » horodaté, export/import JSON.
  **Non gaté** (pas de persistance).
- **NB-3 — persistance (optionnelle, seulement si Paul la demande)** : application
  du draft `0009`. **Gate Paul + escalade Opus + contre-passe sécu + advisors.**
  Ne pas ouvrir tant que NB-1 n'est pas bouclée (EB : une boucle à la fois).

## 7. Garde-fous EB

- **Le moteur, pas l'ERP** — ABAQUE calcule un lancement ; il ne fait ni la paie,
  ni la compta, ni les déclarations. Si NB-1 déborde vers un logiciel comptable,
  stop et recentrage.
- **Aucun taux en dur trompeur** — tout taux FR est affiché, modifiable, horodaté
  « à vérifier » ; mention permanente « aide à la décision non contractuelle, ne
  remplace pas un expert-comptable ».
- **Surface minimale** — pas de base tant que la sauvegarde de scénarios n'est pas
  un besoin réel ; pas d'upload de documents en v1.
- **Déterminisme prouvé au harnais** — mêmes entrées → mêmes sorties, testé.
- **Une boucle à la fois** — NB-1 bouclée (livrée, testée, vérifiée) avant NB-2.

## 8. Hypothèses / taux à horodater « à vérifier » (au 2026-07-22)

Chacun **affiché et modifiable** dans l'UI, jamais un chiffre en dur :

| Hypothèse | Défaut [hyp.] | Risque si périmé |
|---|---|---|
| `taux_charges_patronales` | 0,42 du brut | Faux sur bas salaires (réduction générale) et cadres → **ajustable par poste** |
| `coef_annualisation` | 12,0 | Oublie congés payés / 13ᵉ mois → masse salariale sous-estimée (12,3-12,5 pour provisionner) |
| Régime dirigeant (`statut_juridique`) | assimilé-salarié (SASU) | TNS (EURL/EI) = assiette et taux différents → coût dirigeant faux |
| `taux_tva` | 0,20 | Décalage de TVA oublié = erreur de trésorerie ; 10 %/5,5 % possibles en rénovation |
| `taux_is` + acomptes | 15 %/25 % | IS/acomptes non décaissés en v1 → trésorerie optimiste (limite affichée) |
| Cotisations à seuils | taux moyen linéarisé | Ment sur bas et très hauts salaires → afficher « taux moyen, non barémisé » |
| Part salariale au décaissement URSSAF | non décaissée (v1) | Léger optimisme de trésorerie → à corriger en NB-2 |
| `délais` encaissement / fournisseur / charges | 45 / 30 / 25 j | Sous-estimer le délai client = sous-estimer le BFR (poste le plus dangereux) |
| `marge_brute_cible` | 0,35 | Optimisme → point mort artificiellement bas ; scénario prudent obligatoire |

## 9. Décisions attendues de Paul

1. **Nom** : ABAQUE convient-il pour le simulateur ? (sinon, autre nom au registre.)
2. **Statut juridique par défaut** : SASU (assimilé-salarié) proposé — le confirmer
   ou le changer (structure les formules de charge du dirigeant).
3. **Go NB-1** (moteur de calcul pur, non gaté) comme prochaine boucle de build ?
4. **Persistance** : v1 **sans base** validée par défaut (recommandation) — on
   n'ouvre NB-3 (table `0009`, gate) que si tu veux sauvegarder des scénarios.
