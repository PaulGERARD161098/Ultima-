# CADRAGE — ZOH SHIA : le générateur de devis PRO, en techno neutre (08/10/2026)

> Paul : *« dans Zoh il faut implanter le générateur de devis automatique en
> techno neutre en se basant sur mon outil de générateur de devis RénoBoost —
> voici le modèle de devis en PJ qui sera la base de la techno »*.
>
> ⛔ **Le PDF modèle n'entre pas dans le dépôt** : il porte un client réel et
> les coordonnées bancaires de l'émetteur. Seule sa STRUCTURE est relevée ici.

## 0. Ce qui a été mesuré avant de cadrer

- **L'outil source est RenoDevis** (`PaulGERARD161098/RenoDevis`, tête
  `038d2bc` du 08/10, 18:59), pas RénoBoost : aucune marque du modèle n'existe
  dans RénoBoost. ZOH SHIA en extrait déjà le code (`zohshia/renodevis/`).
- **RenoDevis génère ses devis PDF** avec `pdf-lib`, par deux chemins
  (`lib/pdfDevis.ts`) : une mise en page **générique** (texte qui s'écoule, sans
  tableau) et une mise en page **propre à un pro** (`lib/pdfSola.ts`). La
  « matrice neutre » de la bibliothèque est un PDF figé, pas un générateur.
- **Déjà là** : lignes à TVA par ligne et totaux (`chiffrageDocument`,
  `totauxDevis` ventile la TVA par ligne), `validite_jours` (30 par défaut),
  identité légale de l'émetteur (`siret`, `adresse`, `tva_intra`), logo
  (`artisans.logo_url`), numérotation de FACTURE (`lib/facture.ts`), signature
  par lien à jeton.
- **Absent** : tableau des lignes, détail TVA par taux, bloc paiement générique
  (IBAN/BIC — seule la mise en page propre à un pro en porte un), forme
  juridique et capital, SIREN/TVA du client pro, « type de vente », et **les
  mentions B2B obligatoires** (pénalités de retard, indemnité forfaitaire de
  recouvrement, escompte) — nulle part dans le dépôt.

## Arbitrages de Paul (panneaux, 08/10)

| Question | Tranché |
|---|---|
| Où vit le code ? | **Dans RenoDevis**, extrait en neutre par ZOH SHIA — une seule version |
| Quels clients ? | **Clients professionnels seulement** (le modèle) |
| Signature ? | **Le lien à jeton de RenoDevis** ; « Bon pour accord » imprimé, pas de balises de prestataire externe |
| Numérotation ? | **`D-AAAA-MM-NNN`** pour les devis FUTURS ; les `RR-…` émis ne se renomment jamais |

## La structure du modèle — ce que le gabarit doit rendre, dans cet ordre

1. **En-tête** : logo · « Envoyée par » (raison sociale, adresse) · « À
   destination de » (raison sociale, SIREN, adresse, n° de TVA du client).
2. **Cartouche du devis** : numéro · date d'émission · date d'expiration
   (émission + `validite_jours`) · type de vente (prestations de services /
   vente de biens / mixte).
3. **Tableau** : Produits · Qté (+ unité) · Prix u. HT · TVA (%) · Total HT ·
   Total TTC — et, sous chaque ligne, sa description en clair.
4. **Détails TVA** : une ligne par taux — taux · montant de TVA · base HT.
5. **Récapitulatif** : Total HT · Total TVA · Total TTC (mis en avant).
6. **Paiement** : établissement · IBAN · BIC — et la **mention spéciale**
   (conditions d'acompte et de solde).
7. **Mentions B2B** : pénalités de retard · indemnité forfaitaire de
   recouvrement · escompte.
8. **« Date et signature précédées de la mention “Bon pour accord” »**.
9. **Pied de page légal** : raison sociale · forme et capital · SIREN · TVA
   intracom · pagination « n / N ».

## ① Le but

Un devis destiné à un **client professionnel** sort de RenoDevis au format du
modèle, **automatiquement** depuis les données du devis — rien à mettre en page
à la main —, et ZOH SHIA en porte la version **neutre**, extraite et prouvée,
prête pour n'importe quel émetteur.

## ② Les étapes — dans cet ordre, aucune n'ouvre avant que la précédente ne ferme

1. **Le document, pur et typé** — `lib/documentDevisPro.ts` : une fonction pure
   `documentDevisPro(devis, emetteur, client, le)` → l'objet du gabarit
   (sections 1 à 9), validé Zod. Aucun dessin, aucun réseau. C'est lui qu'on
   teste ; le PDF ne fait que le peindre.
2. **La numérotation** — `lib/numeroDevis.ts` : `D-AAAA-MM-NNN`, séquence
   mensuelle calculée sur les numéros déjà émis (même forme que
   `prochaineSequence` des factures), pour les devis neufs seulement.
3. **Les mentions B2B** — constantes **sourcées et datées** (article du Code de
   commerce, montant de l'indemnité), une seule table, relue comme `lib/tva.ts`.
4. **Le gabarit PDF** — `lib/pdfDevisPro.ts` (pdf-lib, police déjà embarquée) :
   peint l'objet de l'étape 1, pagine, répète l'en-tête du tableau sur une page
   neuve.
5. **L'aiguillage** — `genererPdfDevis` emprunte le gabarit pro **si et
   seulement si** le devis porte un client professionnel identifié (SIREN
   présent et valide). Tout autre devis garde son chemin d'aujourd'hui.
6. **Les données manquantes** — émetteur : IBAN, BIC, forme juridique, capital ;
   client pro : raison sociale, SIREN, TVA ; devis : type de vente. ⛔ Ce qui
   touche le schéma est une **migration sur la base partagée** : rédigée ici,
   appliquée par Paul (gate). Le client pro peut vivre dans `devis.extra` sans
   migration ; l'émetteur, non.
7. **Le spécimen** — un PDF de démonstration **entièrement fictif** (émetteur,
   client, IBAN de test), généré par le code, montré à Paul **avant** toute
   fusion (preview obligatoire).
8. **ZOH SHIA** — la série de neutralisation couvre les nouveaux modules ;
   `extraire.mjs --verifier` rend l'arbre neutre prouvé ; `TECHNO.md` gagne le
   maillon « devis pro » ; `tests/unit-zohshia.mjs` vert.

### État des étapes — mesuré le 08/10/2026 au soir

| Étape | État | Preuve |
|---|---|---|
| 1 · 2 · 3 | ✅ | `lib/documentDevisPro.ts`, `lib/numeroDevis.ts`, `lib/mentionsB2B.ts` + tests |
| 4 | ✅ | `lib/pdfDevisPro.ts` : 9 sections, pagination, blocs insécables ; spécimen fictif + `pdftotext` |
| 5 | ✅ | aiguillage sur `extra.devis_pro` (posé si SIREN client saisi) ; aperçu aligné |
| 6 | ✅ | ⚠️ **écart au cadrage, plus économe** : IBAN/BIC NON migrés — repris de `extra.reglement`, déjà saisi et contrôlé. Migration réduite à forme juridique + capital + index unique du numéro, **appliquée le 08/10 sur autorisation de Paul** et éprouvée (doublon refusé, miroirs acceptés) |
| 7 | 🟡 | spécimen montré ; preview Vercel non lisible depuis la séance (403) |
| 8 | ⏸ **arrêtée, à cadrer à part** | voir ci-dessous |

⛔ **ÉTAPE 8 — LA SÉRIE A 122 COMMITS DE RETARD, CE N'EST PLUS UN AJOUT.**
`derive.mjs` (08/10, 21:54 UTC) : série `f1f9fb3` → tête `2291842`, 122 commits,
dont 63 sur 75 fichiers qu'elle retouche. Fusion d'essai de la tête dans un clone
neutre reconstruit : **46 conflits** (14 fichiers propres à l'instance supprimés
côté neutre et modifiés en amont ; 32 fichiers, ~60 blocs, où l'amont a tissé la
logique propre à l'instance — matrice, règles, marge, artisan sans client — dans
le chemin générique). Les cinq modules du devis pro, eux, ne portent aucun nom
propre. ⇒ Le rafraîchissement de la série est une **boucle dédiée** (cadrage
propre, pre-mortem), PAS la queue de celle-ci. Ne pas la reprendre en
« finissant l'étape 8 » : on rejouerait 46 conflits sans plan.

## ③ Les moyens

RenoDevis : `lib/documentDevisPro.ts`, `lib/numeroDevis.ts`,
`lib/mentionsB2B.ts`, `lib/pdfDevisPro.ts`, `lib/pdfDevis.ts` (aiguillage),
leurs `*.test.ts`, une migration rédigée (non appliquée). Ultima :
`zohshia/renodevis/TECHNO.md`, la série `outils/zohshia/renodevis/neutre/`,
`inventaire.json` recollecté.

## ④ Critères de réussite — vérifiables

- Le spécimen rend les **9 sections, dans l'ordre**, lues par extraction de
  texte du PDF (pas à l'œil).
- **Somme des lignes = Total HT au centime ; Σ Détails TVA = Total TVA ;
  HT + TVA = TTC** — sur un devis **à deux taux**, et sur 50 pages de lignes.
- Un devis **sans client pro** sort **octet pour octet** comme aujourd'hui
  (le chemin existant n'est pas touché).
- Un IBAN invalide (clé mod 97) **refuse** la génération avec un message clair ;
  aucun IBAN n'apparaît dans un log.
- Numéros : séquence continue, pas de collision sur deux générations du même
  mois, jamais appliquée à un `RR-…` existant.
- `unit-zohshia` vert : aucun nom propre, aucune valeur dans l'arbre extrait.
- Chaque test **vu rouge** en cassant la règle qu'il garde.

## ⑤ Ce qu'on ne fait PAS

- Pas de devis particuliers dans ce gabarit (arbitrage) ; leurs mentions
  consommateur restent un chantier à part.
- Pas de prestataire de signature électronique ; pas de nouvelle dépense.
- Pas de facture au nouveau format (le devis d'abord).
- Pas de modification de la mise en page propre à un pro existante.
- Aucune écriture en base réelle ni migration appliquée sans le go de Paul.

## ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Signal | Prévention |
|---|---|---|
| Un devis à un **particulier** sort avec les mentions B2B | mentions de pénalités chez un consommateur | aiguillage sur SIREN **valide** seulement ; test : sans SIREN → chemin d'aujourd'hui, octet pour octet |
| Les totaux du PDF divergent de ceux du devis (arrondis par ligne vs par taux) | Σ TVA ≠ Total TVA d'un centime | le gabarit **lit** `totauxDevis`, ne recalcule rien ; contrôle d'égalité au centime dans le document |
| IBAN faux ou d'un autre pro imprimé | client vire au mauvais compte | IBAN lu sur l'émetteur du devis seulement, clé mod 97 vérifiée, contrôle d'émetteur déjà en place (`controle_professionnel`) |
| Le PDF modèle (client réel, IBAN réel) finit dans un dépôt | — | jamais versionné ; spécimen 100 % fictif ; sonde PII sur le spécimen |
| Collision ou trou de numérotation | deux devis `D-…-007` | séquence calculée sur l'existant, test de concurrence ; à terme contrainte d'unicité (migration, gate) |
| Mentions légales périmées (montant, article) | — | table datée et sourcée, péremption **signalée** à l'écran, pas de CI rouge à 90 jours (règle `lib/tva.ts`) |
| L'extraction ZOH laisse passer un nom ou casse le build | `extraire --verifier` rouge | la série couvre les nouveaux fichiers dès leur création ; on corrige la série, jamais l'arbre |
| La migration de l'émetteur casse une autre brique (base partagée) | — | colonnes **ajoutées**, nullables, aucune contrainte resserrée ; contrôle des quatre dépôts avant application |
| Le gabarit déborde (longues descriptions, 40 lignes) | texte coupé | pagination testée sur 50 lignes et une description de 2 000 caractères |

## Gates

- **Migration** (émetteur : IBAN, BIC, forme, capital ; type de vente) : rédigée
  dans la boucle, **appliquée par Paul**.
- **Saisie des vraies coordonnées bancaires** : Paul, dans l'écran — jamais par
  une séance.
- **Fusion** RenoDevis puis Ultima : go explicite (SHA, cible, CI).
