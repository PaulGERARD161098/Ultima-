# CADRAGE — Reprise du 07/09/2026, sur les dépôts

> Écrit le 06/09 au soir, en fin de séance, **sur l'état réel lu dans chaque
> dépôt** — grains Finubar, branches, têtes de `main`. Aucune valeur n'est
> reprise de mémoire.
>
> ⚠️ **Périmètre lu : CINQ dépôts sur huit.** RenoBoost, RenoDevis, RenoAgenda,
> RenoPredict et Ultima sont attachés à la session ; les trois autres
> (mon-dpe.fr, Ycome, systeme-commercial) ne le sont pas et **ne sont pas
> décrits ici**. Dire « l'état de tous les dépôts » à partir de cinq serait
> exactement l'erreur que ce fichier existe pour empêcher.

---

## 1. LE CONSTAT, et il tient en une ligne

**Quinze blocages recensés sur les cinq dépôts. Aucun n'est du code.**

| Dépôt | État | Dernier arrêt | En attente depuis |
|---|---|---|---|
| **RenoBoost** | `en_attente_de_paul` | 06/09 · `3d5eea5` | **04/08** — 33 jours |
| **RenoDevis** | `en_cours` | 03/09 · `da4b1fd` | 17/08 — 20 jours |
| **RenoAgenda** | `en_attente_de_paul` | 04/09 · `df7af5d` | **15/07 — 53 jours** |
| **RenoPredict** | `en_attente_de_paul` | 03/09 · `b842a46` | 04/08 — 33 jours |
| **Ultima** | `en_cours` | 05/09 · `dd3e57a` | 20/08 — 17 jours |

⛔ **Ce que ça veut dire, sans le tourner autrement** : quatre des cinq dépôts
sont finis, testés, mergés, déployés — et **attendent un geste physique de
Paul**. RenoPredict le dit dans son propre grain : *« Rien à coder avant le
sticker. La chaîne est finie, testée, mergée — et elle n'a jamais tourné une
seule fois, faute d'objet physique. »*

**Continuer à écrire du code ajoute à une pile qui ne peut pas tourner.**
C'est la Directive EB prise à revers : on ne travaille plus pour l'objectif
final, on travaille pour ne pas s'arrêter.

---

## 2. LA DÉCOUVERTE DU CADRAGE — trois gestes débloquent trois dépôts

Les quinze blocages ne sont pas quinze choses. **Trois gestes reviennent d'un
dépôt à l'autre**, et c'est ça qui change l'ordre de la journée :

| Le geste | Débloque | Depuis |
|---|---|---|
| 🏷️ **Imprimer un lot de stickers QR** | **RenoBoost** + **RenoPredict** | 11/08 |
| 📍 **Valider la fiche Google Business** | **RenoBoost** + **RenoPredict** | 04/08 |
| 💳 **Embarquement Stripe de SOLA** | **RenoBoost** + **RenoDevis** + **RenoPredict** | 17/08 |

⇒ **Trois gestes referment huit des quinze entrées, sur trois dépôts.**

⛔ **Donc on ne reprend pas dépôt par dépôt, on reprend geste par geste.**
Travailler RenoPredict « à fond » demain ne produira rien de plus qu'hier : son
grain dit qu'il n'y a rien à y coder.

⚠️ **Et aucun de ces trois n'est un travail** : un lot à imprimer, un bouton
« Valider » chez Google, un tunnel Stripe. Ce sont des minutes, étalées sur un
mois.

---

## 3. CE QUI PEUT AVANCER SANS PAUL — la liste honnête

| Dépôt | Ce qui part sans rien attendre | Ce qui n'avancera PAS |
|---|---|---|
| **RenoBoost** | **Lot COPY** (A8 catalogue en problème → solution · A9 anti-piège hors FAQ · A6 « 60+ » retiré · A3 rappel « le jour même »). Puis **R1 « trop IA »** traité d'un bloc : 6 pastilles, 6 titres centrés-à-mot-coloré | Le jalon 0 (stickers, Google, Stripe) |
| **RenoDevis** | Rien de neuf : le grain pointe le **jalon V0** — *Paul calcule UN audit sur UN dossier réel*. C'est un geste, pas du code | Le premier euro encaissé |
| **RenoAgenda** | Rien : dispatch et dashboard « pointent dans le vide » sans artisans | Tout. **53 jours d'attente**, le plus ancien |
| **RenoPredict** | **Rien, et c'est écrit dans son grain** | Tout, tant que `stickers` = 0 |
| **Ultima** | Faire acter le **nom VESTA** ; LV6 est **gelé à la demande de Paul** | La voix (`ANTHROPIC_API_KEY` absente → 503) |

⇒ **Un seul dépôt a du travail de code qui ne dépend de personne : RenoBoost.**

---

## 4. L'ORDRE DE LA JOURNÉE (Directive JL — rétroplanning)

**Objectif final** : un individu seul fait tourner le business entier, aidé par
l'automatisation. Chaque brique est prête ; **aucune n'a de données réelles qui
y entrent**.

1. **Ouvrir la séance sur les trois gestes**, pas sur le code. Une ligne
   chacun, sans insister — s'ils sont faits, trois dépôts redémarrent le jour
   même. *(RenoPredict impose déjà ce rappel dans son propre `CLAUDE.md`.)*
2. **Pendant ce temps, exécuter le lot COPY de RenoBoost** — la seule chose qui
   ne dépend de personne. Une PR, avec l'URL de son preview.
3. **Puis R1 en entier**, d'un bloc : c'est l'uniformité qui fait « trop IA »,
   la casser section par section ne marchera pas.
4. **Ne PAS ouvrir de nouveau chantier** sur RenoDevis, RenoAgenda ou
   RenoPredict tant que leurs gestes ne sont pas faits (Directive EB : boucler
   avant d'ouvrir).

---

## 5. PRE-MORTEM À 3 MOIS — décembre 2026, rien n'a démarré

| # | Cause probable | Signal précoce | P×I | Mitigation |
|---|---|---|---|---|
| 1 | **Les trois gestes n'ont toujours pas été faits.** Ils attendent depuis un mois ; rien n'indique que le 34ᵉ jour sera différent du 33ᵉ | `stickers` = 0, fiche non visible, `stripe_charges_enabled` = false | **fort × fatal** | Les rappeler **en une ligne** à chaque ouverture de séance, jamais en paragraphe : un rappel qui pèse se contourne. Et **ne pas compenser par du code** — c'est ce qui les a rendus invisibles |
| 2 | **Le code a continué d'avancer pendant l'attente**, et la pile de fonctionnalités jamais exécutées grandit. Chaque ligne ajoutée est une ligne non éprouvée en réel | des PR mergées sur des dépôts `en_attente_de_paul` | fort × fort | Réserver le code au seul dépôt qui n'attend personne. Sur les autres : rien, et le dire |
| 3 | **RenoAgenda dort depuis le 15/07** et personne ne le rouvre parce qu'il n'a plus d'actualité | son grain ne bouge plus | moyen × fort | Il attend des **artisans**, pas du code. C'est un sujet commercial : le traiter comme tel ou l'assumer en pause |
| 4 | **La preuve de RenoBoost reste à un métier, un artisan.** Le bandeau montre trois chantiers de clim | « Climatisation » six fois de suite dans le bandeau | fort × moyen | Paul l'a dit : *« pour l'instant j'ai que ça »*. Assumer le positionnement clim dans le discours plutôt que le masquer |
| 5 | **Un grain Finubar ment** et une séance repart sur un état faux | la collecte annonce une dérive, ou pire : n'en annonce pas alors qu'il y en a une | moyen × fort | Le grain se renseigne **après** la fusion, avec le SHA de `main` — règle posée le 06/09 après un SHA de branche détruit par un squash |
| 6 | **Une mesure fausse rassure** — trois cas dans la seule séance du 06/09 | une réponse trop uniforme, ou trop belle | moyen × fort | Demander à l'instrument ce qu'il répond **sur un cas dont on connaît déjà la réponse** |

**Ce que le pre-mortem commande** : ① avant tout. Aucune des cinq autres ne se
traite tant que les trois gestes n'ont pas été faits ou explicitement abandonnés.

---

## 6. PROMPT DE REPRISE (à coller tel quel)

> **Reprise du 07/09 — les dépôts.** Lis d'abord ce fichier
> (`CADRAGE-2026-09-07-reprise-depots.md`), puis le `FINUBAR.md` du dépôt sur
> lequel on travaille.
>
> **Le constat de départ, mesuré le 06/09** : quinze blocages sur cinq dépôts,
> **aucun n'est du code**. Quatre dépôts sur cinq attendent un geste physique de
> Paul, dont RenoAgenda depuis 53 jours.
>
> **Ouvre la séance par les trois gestes, en une ligne chacun** (pas un
> paragraphe — un rappel qui pèse se contourne) : le lot de **stickers QR** à
> imprimer, la **fiche Google Business** à valider, l'**embarquement Stripe** de
> SOLA. Ces trois-là referment huit blocages sur trois dépôts.
>
> **Puis exécute la seule chose qui ne dépend de personne : le lot COPY de
> RenoBoost** — catalogue en problème → solution (A8), anti-piège sorti de la
> FAQ (A9), « 60+ professionnels » retiré (A6), rappel « le jour même » affiché
> (A3, vérifier qu'il ne double pas le rotator du hero). Détail :
> `RenoBoost/REPRISE-2026-09-05-landing-forme.md` §4 et
> `CADRAGE-2026-09-05-landing-capture.md` §8 — **les 12 arbitrages y sont
> rendus, ne les repose pas.**
>
> **Ensuite R1 « trop IA », d'un bloc** : 6 pastilles de section et 6 titres
> centrés-à-mot-coloré. C'est l'uniformité qui crée l'effet ; section par
> section, ça ne marchera pas.
>
> ⛔ **N'ouvre aucun chantier de code sur RenoDevis, RenoAgenda ou RenoPredict**
> tant que leurs gestes ne sont pas faits. Leurs grains le disent eux-mêmes —
> celui de RenoPredict écrit noir sur blanc « rien à coder avant le sticker ».
>
> **La seule question ouverte pour Paul côté produit** : la ville des entrées 3
> et 4 du bandeau chantiers RenoBoost (photos 05+04, et la façade 03). ⛔ Elle
> ne se déduit **jamais** de l'image — l'essayer a produit « Paris » et
> « Longjumeau » sous des chantiers de Lyon et Saint-Étienne.
>
> **Règles de la maison, non négociables** : toute couleur se **mesure** (WCAG,
> les deux thèmes) · toute géométrie se **mesure** au rendu · un garde-fou se
> **prouve en le cassant** avant d'être gardé · une PR par lot, avec l'URL de
> son preview · le grain Finubar se renseigne **après** la fusion, avec le SHA
> de `main`.

---

## 7. CE QUI A ÉTÉ FAIT LE 06/09, POUR NE PAS LE REFAIRE

Séance RenoBoost, cinq PR mergées (#363 → #367), `main` = `57507ea` :

- le **goulot est levé** — 7 photos de chantier en ligne, `realisations.json`
  n'est plus vide ;
- la vitrine en cartes est remplacée par un **bandeau défilant** en pied de page
  + un badge de navigation ;
- le **H1 est celui de Paul**, une ligne par idée, réglage calculé
  (`taille × 12,095 em ≤ largeur utile`), vérifié à 320/390/768/1024/1440 ;
- **trois contrastes** remontés au-dessus du seuil dans les deux thèmes, dont un
  défaut **hérité** du bandeau partenaires ;
- la **source des images passe en liste blanche** — le JSON arrive par le
  réseau, une URL tierce y devenait une requête sortante du navigateur ;
- **14 garde-fous** sur `tests/chantiers-bandeau.test.mjs`, chacun prouvé en le
  cassant. `npm test` = **1041**, 0 échec.
