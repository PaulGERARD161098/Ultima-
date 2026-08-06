# CADRAGE-ALTHEA — le suivi ludique des performances physiques et psychiques

> Dicté par Paul le **2026-08-06**. Boucle **B0 : cadrer, zéro code produit,
> zéro migration écrite.** Gate EL : le COMMENT est posé ici avant la première
> ligne de travail ; tant que les décisions du §9 ne sont pas prises, on ne
> commence pas. Sources amont — `CADRAGE-LV3.md` (l'arbre, la règle nœud/feuille),
> `CADRAGE-IMLADRIK.md` (DRAUKHAIN : serments et flammes),
> `CADRAGE-RESHIRAM-ZEKROM.md` (RESHIRAM : les talents prouvés). Ce fichier ne
> double aucun autre doc : il cadre un quadrant neuf et **écrit ses frontières**
> avec ceux qui existent.

---

## 0. Ce que Paul a dicté (reformulation retenue)

1. **Un nouveau quadrant d'Ultima Lv3, nommé ALTHEA.**
2. Objet : le **suivi des performances physiques et psychiques** — ce que Paul
   fait, ce qu'il sait faire, où il en est de sa pratique.
3. Forme : **un cadran unique portant des « talents »**, pas une arborescence
   de pages. Exemple donné : le talent *peak performance*.
4. Remplissage **quotidien ou hebdomadaire**, explicitement **non obligatoire**,
   et qui doit être **rigolo à remplir**. Exemple donné : « aujourd'hui je n'ai
   pas fumé, je n'ai pas bu d'alcool ».
5. Le suivi porte aussi la **pratique quotidienne** : le japonais, l'espagnol,
   le sport.
6. Mécanique : **progression par paliers**, **récompenses**, système **ludique**
   — un arbre de capacités, au sens des jeux.
7. Finalité assumée : **installer des talents et une progression pour améliorer
   réellement ses skills**. Le jeu est le moyen, pas le but.

**Deux passages dictés restés incertains, non devinés** : *« combien de temps
est-ce que je suis bien en ma science de sport »* → lu comme « où j'en suis, et
depuis combien de temps, dans ma pratique du sport » ; *« une arme de capacité »*
→ lu comme « un arbre de capacités ». À confirmer par Paul.

---

## 1. Pourquoi ce quadrant n'existe pas déjà — et les trois collisions

Avant de construire, la question EB : **est-ce que l'existant le fait déjà ?**
Non — mais trois objets d'Ultima s'en approchent assez pour qu'on trace la
frontière **par écrit**, sinon on construira un doublon.

### 1.1 Collision de MOT — « talent » est déjà pris (RESHIRAM)

`talents` est une **table en base** depuis la migration `0009`. Un talent
RESHIRAM, c'est *un savoir-faire réel adossé à une preuve* : trois crans
(`notion` / `pratique` / `maitrise`), aucune progression automatique, et une
**règle cardinale — rien d'idéalisé, un talent sans preuve est « à étayer »**.

Le « talent » d'ALTHEA est un tout autre animal : il **monte tout seul** à
mesure qu'on le nourrit, il a des paliers, il récompense. Employer le même mot
pour les deux, c'est fracturer le lexique de Paul **et** le schéma (le nom de
table est littéralement occupé).

> **Ce n'est pas un conflit, c'est une articulation.** Un talent RESHIRAM
> réclame une preuve ; ALTHEA **fabrique** de la preuve (« 214 jours de
> japonais nourris »). La bonne réponse à terme est une passerelle
> ALTHEA → RESHIRAM, pas un mot commun. Voir §8.

**Proposition** : dans ALTHEA, l'unité s'appelle **une DISCIPLINE**. Le mot
porte les deux natures (la discipline du japonais, la discipline de la garde),
il tient le registre antique, et il dit exactement ce que Paul veut installer.
→ **Décision D2 au §9.**

### 1.2 Collision d'OBJET — « je n'ai pas fumé aujourd'hui » ressemble à DRAUKHAIN

DRAUKHAIN porte les **serments** (« ne plus jamais perdre mon calme ») et les
**flammes** (les victoires écrites, datées de leur survenue). La première flamme
d'Ultima a été écrite le 2026-08-03. Un « aujourd'hui je n'ai pas fumé » pourrait
s'y ranger — et ce serait une erreur.

**La frontière, écrite une fois pour toutes :**

| | DRAUKHAIN | ALTHEA |
| --- | --- | --- |
| Nature | **la volonté** | **la mesure** |
| Objet | le serment — un engagement moral, rare, solennel | la discipline — un geste répété, ordinaire |
| Ce qu'on y écrit | *pourquoi je tiens* (un récit, une flamme) | *combien de fois j'ai tenu* (une marque) |
| Rythme | quand ça arrive | tous les jours, ou pas |
| Ton | des rappels, jamais du jugement | un jeu, jamais du jugement |

Un serment DRAUKHAIN peut **avoir son bras armé** dans ALTHEA : « ne plus fumer »
est un serment ; « garde du tabac » est la discipline qui le compte. Une
passerelle, pas une copie (§8).

### 1.3 Collision de FORME — un cadran n'est pas une boussole

Paul dit « un cadran unique ». La règle Lv3 §2.1 tranche déjà : **est une
boussole tout nœud qui a au moins deux enfants ; reste un outil toute feuille**.
ALTHEA n'a qu'une porte → **ALTHEA est une FEUILLE**, une page de travail
`althea.html`, exactement comme RIVEN. Le jour où un deuxième cap naît (le
palmarès, l'histoire longue), ALTHEA prend la forme boussole sans qu'on touche
à autre chose — une entrée de registre suffit.

Attention réelle : le cadran d'ALTHEA **ressemblera** à une rose de caps
(des médaillons gravés en cercle). Il ne doit pas se **confondre** avec une
boussole, sinon Paul cliquera en croyant naviguer. Parade au §4.

---

## 2. Ce qu'est ALTHEA, en une phrase

> **ALTHEA est le cadran où les gestes répétés de Paul deviennent visibles et
> montent en rang** — le corps et l'esprit, la langue et le sport, la garde et
> la pratique. Léo y compte, y félicite et y relance. Elle n'y juge jamais.

---

## 3. La constitution d'ALTHEA — cinq règles cardinales

Elles se décident **maintenant**, parce que chacune d'elles, si on l'oublie,
tue le quadrant en trois semaines. Ce sont les critères de réussite d'ALTHEA
autant que ses garde-fous.

1. **Un jour non renseigné n'est pas un échec.** Trois états et trois seulement :
   *nourri* · *manqué (déclaré par Paul)* · *non renseigné*. Le troisième ne
   s'infère jamais dans les deux autres. Paul a dit « ce n'est pas obligatoire » :
   un système qui transforme le silence en faute contredit sa dictée.
2. **Un rang acquis ne se perd jamais.** La gravure reste. Seul **l'élan** (la
   série en cours) respire — il redescend, il ne détruit rien. C'est le contraire
   exact du *streak* qui remet à zéro et qu'on abandonne après le premier trou.
3. **Aucun jugement.** Héritage direct de DRAUKHAIN (« des rappels, pas du
   jugement »). Léo dit « il te manque trois jours pour La Constance », jamais
   « tu as encore raté ».
4. **Le compteur ne ment pas.** Un jour = une ligne, unicité en base sur
   (propriétaire, discipline, jour) ; jamais de jour futur ; le rattrapage d'une
   semaine passée est permis (Paul l'a demandé) mais reste **un geste explicite**,
   jamais un remplissage automatique.
5. **ALTHEA porte la donnée la plus intime d'Ultima.** Tabac, alcool, corps,
   psychisme : c'est de la donnée de santé. Elle ne sort **pas du quadrant** —
   ni vers l'IA, ni dans les logs, ni dans le cockpit. Détail au §7.

---

## 4. La forme — le cadran (à trancher sur maquette)

Ce que le cadran doit montrer, dans cet ordre de priorité :

1. **Où j'en suis** — chaque discipline, son rang, sa progression vers le
   suivant. C'est le cœur ; c'est ce qui se regarde même sans rien remplir.
2. **Le geste du jour** — nourrir ses disciplines doit coûter **un geste par
   discipline**, pas un formulaire. C'est la condition du « rigolo à remplir ».
3. **La parole de Léo** — ce qui est proche, ce qui dort, ce qui vient d'être
   franchi.

**Anatomie proposée (forme A — « la rose des disciplines ») :**

- Chaque discipline = **un médaillon gravé**, cerné d'un **anneau d'or qui se
  remplit** à mesure qu'on approche du palier suivant, avec **son rang en
  chiffres romains gravé dessous**. L'anneau est ce qu'une boussole n'a jamais :
  c'est lui qui dit « ceci n'est pas une navigation ».
- **Au centre, le sceau du jour** — la date gravée ; c'est le bouton de saisie,
  pas un cap. Aucune aiguille pointillée, aucun « clique pour entrer ↝ ».
- **Sous le cadran, le relevé** — la semaine en sept colonnes, le jour courant
  mis en avant ; on coche, on referme.

**Forme B — « le registre gravé »** : une colonne de disciplines, chacune avec
sa jauge en ligne et sa case du jour. Plus dense, moins désirable, plus lisible
en mobile à 390 px.

> **Les deux formes seront maquettées et comparées avant tout code** — c'est la
> méthode éprouvée sur VRANESH et DRAUKHAIN (l'image d'abord), et c'est Paul qui
> tranche sur l'image, jamais sur une description.

**Contrainte de mesure (règle 2026-08-01, non négociable)** : le cadran se
**mesure**, il ne se regarde pas. `getBBox()` comparée au `viewBox`, et éprouvée
sur un **pire cas construit — douze disciplines aux noms interminables** — pas
sur les trois disciplines du premier jour, qui sont un échantillon favorable.

---

## 5. Le moteur de progression

### 5.1 Deux natures de discipline (v1)

| Nature | Ce qu'on déclare | Exemples de Paul |
| --- | --- | --- |
| **Pratique** | « j'ai pratiqué aujourd'hui » (+ durée, facultative) | japonais, espagnol, sport |
| **Garde** | « j'ai tenu aujourd'hui » | pas de tabac, pas d'alcool |

Une seule mécanique de comptage pour les deux — c'est ce qui rend le moteur
petit. La différence est de **mot** (« pratiqué » / « tenu ») et de blason.

### 5.2 Ce qui compte : le **jour nourri**, pas le point

Le compteur d'une discipline est son **nombre de jours nourris**. Choix délibéré
contre un système de points (XP) : un point est arbitraire et se gonfle ; un jour
est un fait, il ne se négocie pas. Les **minutes** existent pour les pratiques,
mais elles **ornent** (« 42 h de japonais ») — elles ne font pas monter le rang.
Sinon on récompense celui qui déclare des heures, pas celui qui pratique.

### 5.3 Les paliers — cinq rangs, gravés

| Rang | Nom | Seuil par défaut (jours nourris) |
| --- | --- | --- |
| I | **L'Éveil** | 7 |
| II | **La Constance** | 30 |
| III | **L'Endurance** | 90 |
| IV | **La Maîtrise** | 180 |
| V | **Le Renom** | 365 |

Les seuils sont **par discipline** et modifiables : le sport et le japonais
n'ont pas le même tempo. Les noms, eux, sont communs — c'est ce qui fait la
langue du quadrant.

### 5.4 L'élan

**L'élan** = la série de jours nourris en cours. Il s'affiche, il motive, et
**il ne détruit rien** quand il retombe (règle 2). Le **meilleur élan** reste
gravé comme un record — un trou n'efface pas un exploit passé.

### 5.5 Les récompenses

Deux niveaux, à trancher (D5) :

- **Symbolique, automatique** : le palier lui-même. Le sceau s'allume, le rang
  se grave, Léo l'annonce. C'est gratuit et c'est déjà une récompense.
- **Réelle, déclarée par Paul** : « au rang III de japonais, je m'offre X ».
  Un texte que Paul pose lui-même sur le palier ; Léo l'annonce au franchissement
  et Paul la marque *réclamée*. Ultima ne décide **jamais** d'une récompense à
  la place de Paul.

---

## 6. Le modèle de données (esquisse — **aucune migration écrite en B0**)

Trois tables, motif standard du schéma (RLS dès la création, une policy par
opération, `owner_id` NOT NULL default `auth.uid()`, `(select auth.uid())` pour
l'advisor initplan, CHECK d'énumération miroir de la validation API).

- **`althea_disciplines`** — `nom`, `nature` (`pratique` | `garde`),
  `mesure` (`presence` | `duree`), `seuils` (5 entiers croissants, bornés),
  `blason`, `active`.
- **`althea_paliers`** — `discipline_id`, `rang` (1..5), `recompense` (texte,
  facultatif), `reclame_le`. On ne stocke **pas** « atteint » : c'est dérivé du
  comptage, et une donnée dérivée stockée finit toujours par mentir.
- **`althea_releves`** — `discipline_id`, `jour` (date), `tenu` (booléen),
  `minutes` (nullable), `mot` (facultatif, court). **Unicité
  (owner_id, discipline_id, jour)** ; `jour <= current_date` ; pas de ligne =
  non renseigné (règle 1, exprimée dans le schéma et pas seulement dans l'UI).
- Une **vue dérivée** `althea_progression` en `security_invoker` : jours nourris,
  élan courant, meilleur élan, rang atteint.

Point de vigilance déjà identifié (leçon `0020`/`0021` du 2026-08-04) : **tout
CHECK conditionnel se teste par le REFUS et sur le cas NULL d'abord** — la
logique ternaire SQL laisse passer en silence ce qu'on croit interdire.

Second point : **le fuseau**. « Aujourd'hui » est une date locale (Europe/Paris),
décidée côté client et **validée serveur** ; sinon un relevé pris à 23 h 40 se
range la veille ou le lendemain selon l'humeur d'UTC, et le compteur ment
(règle 4).

---

## 7. Sécurité — le quadrant le plus sensible d'Ultima

RIVEN est de la PII. ALTHEA est de la **donnée de santé** : consommation de
tabac et d'alcool, état psychique. Elle mérite un cran de plus que le standard
maison.

- **RLS** comme partout, sans exception.
- **Cockpit** : ALTHEA n'expose que des **entiers** (« 2 disciplines à nourrir
  aujourd'hui »). Jamais un intitulé — parce que l'intitulé *est* l'information
  (« garde du tabac » dit tout).
- **Les yeux de Léo** (`/api/leo`, champ `etat`) transportent aujourd'hui
  « comptes **et intitulés** bornés ». **Pour ALTHEA, les intitulés sont
  exclus** : seuls des comptes partent. C'est une exception explicite au contrat
  existant, à écrire dans `validerEtatQuadrant`, pas une consigne de prudence.
- **Preuve par l'ABSENCE** (règle 2026-07-30) : le harnais cherche le nom d'une
  discipline sensible dans ce qui sort (charge `/api/leo`, réponse `/api/cockpit`,
  HTML servi, logs) et **exige de ne pas l'y trouver**. Vérifier la présence du
  permis ne prouve rien.
- **Zéro donnée dans le HTML servi** : `althea.html` est muette, tout arrive
  après authentification (invariant Lv3).

---

## 8. Les passerelles — plus tard, et pas par copie

Deux liens naturels, **hors v1** (EB : une boucle à la fois), notés ici pour
qu'on ne les réinvente pas :

- **ALTHEA → RESHIRAM** : une discipline mûre **étaye** un talent prouvé.
  « 214 jours de japonais nourris » est exactement la preuve chiffrée que
  RESHIRAM réclame et que Paul n'a aujourd'hui aucun moyen de produire. Lien en
  **lecture seule, sens unique**, sur le motif `talent_refs_reseau` (`0013`).
- **ALTHEA ↔ DRAUKHAIN** : une discipline peut être **le bras armé d'un serment**.
  Le serment reste le récit, la discipline reste le compteur ; on relie, on ne
  recopie pas.

---

## 9. Décisions attendues de Paul (le gate EL ne se lève pas avant)

| # | Question | Recommandation de Léo |
| --- | --- | --- |
| **D1** | **Où ALTHEA s'accroche** : quadrant sous **NAGA** (« ce qui fait grandir », aux côtés d'IMLADRIK, ADRAMELECH, TAO) ou cap **dans** IMLADRIK ? | **Sous NAGA.** Tu as dit « quadrant », et le corps n'est pas un sous-chapitre du développement personnel. NAGA passe de 3 à 4 caps — géométrie déjà éprouvée (NICOL BOLAS en a 4). |
| **D2** | **Le mot** : « talent » (le tien) ou « **discipline** » ? | **Discipline.** « Talent » est occupé par RESHIRAM avec un sens précis et opposé (prouvé, statique). Deux sens pour un mot, c'est une faute de lexique — et le nom de table est déjà pris. |
| **D3** | **Le moteur** : cumul + élan qui respire, ou série dure qui remet à zéro ? | **Cumul + élan.** Tu as dit « pas obligatoire » ; une série dure punit le silence et se fait abandonner. Le rang acquis ne se reperd pas. |
| **D4** | **Périmètre v1** : les disciplines seules, ou aussi deux jauges quotidiennes « forme physique / forme psychique » (note du jour) ? | **Les disciplines seules.** Une jauge n'a pas de palier : c'est une courbe, pas un rang — un autre objet, donc une autre boucle. On la fait juste après, pas en même temps. |
| **D5** | **Récompenses** : symbolique seule en v1, ou récompense réelle déclarée par toi dès le départ ? | **Les deux dès la v1** — c'est un champ de texte sur le palier, le coût est nul et c'est là que ton système prend du mordant. |
| **D6** | **Le blason d'ALTHEA** (gravure du cap dans le registre Lv3) | **La couronne de laurier** — le mérite gagné, registre antique, aucune collision avec les blasons existants. Tranchable sur la maquette. |

---

## 10. Le format 6 points de la boucle suivante (B1), sous réserve du §9

**① But** — ALTHEA existe en tant que quadrant navigable, et Paul peut nourrir
ses trois premières disciplines réelles, voir son rang et son élan.

**② Étapes** — (a) maquette comparative **forme A / forme B**, Paul tranche ;
(b) entrée au registre Lv3 + coque `althea.html` ; (c) migration `0022` écrite,
**non appliquée** (gate) ; (d) `api/althea.js` + validation miroir ; (e) le
cadran et le relevé ; (f) harnais.

**③ Moyens** — `js/registre-lv3.mjs`, `js/blasons.mjs`, `althea.html`,
`css/althea.css`, `api/althea.js`, `api/_lib/validate.js`,
`supabase/migrations/0022_althea_disciplines.sql`, `middleware.js` (chemin privé),
`tests/smoke-althea.mjs`, `tests/unit-althea-validate.mjs`,
`tests/unit-althea-progression.mjs` (moteur de rangs et d'élan, **fonctions
pures, testées sans navigateur**).

**④ Critères de réussite (vérifiables)** — le patrimoine COMPLET vert ;
`unit-althea-progression` prouve les cinq règles cardinales du §3, **dont
l'absence de punition du silence** ; la géométrie du cadran mesurée contre son
`viewBox` sur un pire cas à **douze disciplines** ; la preuve par l'ABSENCE sur
`/api/leo` et `/api/cockpit` ; un relevé pris à 23 h 40 se range au bon jour.

**⑤ Ce qu'on ne fait PAS en B1** — les passerelles (§8), les jauges physique /
psychique, l'historique long (courbes), la moindre notification, l'application
de la migration (gate Paul).

**⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »**

| Mode de défaillance | Ce qui le prévient |
| --- | --- |
| **Le quadrant meurt en trois semaines** — le vrai risque de tout suivi d'habitudes. | Un geste par discipline, zéro formulaire, aucun zéro punitif, rang jamais perdu. Si nourrir coûte plus de 5 secondes, la forme est ratée — c'est un critère, pas un souhait. |
| **Le mot « talent » fracture le lexique** avec RESHIRAM. | D2 tranchée **avant** la première ligne, et actée au `LEXIQUE-VOCAL.md`. |
| **ALTHEA redevient DRAUKHAIN** (on y écrit du récit, on y jure des serments). | La frontière du §1.2, écrite ; le relevé n'accepte qu'un **mot court**, jamais une page. |
| **Le silence compté comme un échec.** | Trois états au schéma (pas de ligne = non renseigné), assertions dédiées au harnais. |
| **Le cadran déborde** à douze disciplines. | Mesure `getBBox()` vs `viewBox` sur pire cas construit — leçon DRAUKHAIN, déjà payée une fois. |
| **La donnée de santé fuit** par le cockpit, l'IA ou un log. | Comptes seuls, intitulés exclus des yeux de Léo, preuve par l'ABSENCE aux quatre sorties. |
| **Le compteur ment** (fuseau, double saisie, jour futur). | Unicité en base, `jour <= current_date`, date locale validée serveur, CHECK **testés par le refus, cas NULL d'abord**. |
| **On construit sur une dictée mal entendue** (« arbre de capacités », « science de sport »). | Les deux passages sont signalés au §0 et confirmés par Paul avant B1. |

---

## 11. État de la boucle

- **B0 — cadrage** : ce document. ✅ livré le 2026-08-06. **Zéro code, zéro
  migration** — conforme au gate EL.
- **Bloquant** : les décisions **D1 → D4** du §9. Tant qu'elles ne sont pas
  prises, la maquette elle-même partirait sur un mot et une accroche
  hypothétiques.
- **Prochaine action unique** : les quatre décisions, puis la **maquette
  comparative forme A / forme B** (`design/preview-althea-cadran.html`,
  **sans `<script>` inline** — CSP `script-src 'self'`, cinq maquettes
  antérieures sont muettes en preview pour cette raison exacte).
