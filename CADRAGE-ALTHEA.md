# CADRAGE-ALTHEA — le suivi ludique des performances physiques et psychiques

> Dicté par Paul le **2026-08-06**. Boucle **B0 : cadrer, zéro code produit,
> zéro migration écrite.** Gate EL : le COMMENT est posé ici avant la première
> ligne de travail. **Quatre décisions prises par Paul le 2026-08-06 même**
> (§9) : ALTHEA vit **à part** · l'unité s'appelle un **SKILL** · le moteur est
> **cumul + élan** · la v1 livre **les skills, leurs noms et ce qu'il y a
> dedans**. Sources amont — `CADRAGE-LV3.md` (l'arbre, la règle nœud/feuille),
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

**✅ Tranché par Paul (2026-08-06) : dans ALTHEA, l'unité s'appelle un SKILL.**
Le mot est de Paul, il vient de sa dictée d'ouverture (« m'amener vers une
amélioration de mes skills ») et il tranche la collision proprement : *skill*
appartient au registre du **jeu**, *talent* reste au registre du **prouvé**.
Personne ne confondra les deux, et la table `talents` de RESHIRAM n'est pas
touchée. **Conséquence de nommage** : ALTHEA est le seul endroit d'Ultima où
l'anglais est admis — parce que c'est le seul endroit qui est un jeu. Ailleurs,
le registre antique français continue de s'appliquer sans exception.

### 1.2 Collision d'OBJET — « je n'ai pas fumé aujourd'hui » ressemble à DRAUKHAIN

DRAUKHAIN porte les **serments** (« ne plus jamais perdre mon calme ») et les
**flammes** (les victoires écrites, datées de leur survenue). La première flamme
d'Ultima a été écrite le 2026-08-03. Un « aujourd'hui je n'ai pas fumé » pourrait
s'y ranger — et ce serait une erreur.

**La frontière, écrite une fois pour toutes :**

| | DRAUKHAIN | ALTHEA |
| --- | --- | --- |
| Nature | **la volonté** | **la mesure** |
| Objet | le serment — un engagement moral, rare, solennel | le skill — un geste répété, ordinaire, qui monte |
| Ce qu'on y écrit | *pourquoi je tiens* (un récit, une flamme) | *combien de fois j'ai tenu* (une marque) |
| Rythme | quand ça arrive | tous les jours, ou pas |
| Ton | des rappels, jamais du jugement | un jeu, jamais du jugement |

Un serment DRAUKHAIN peut **avoir son bras armé** dans ALTHEA : « ne plus fumer »
est un serment ; « pas de tabac » est le geste ALTHEA qui le compte. Une
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

> **ALTHEA est le cadran où les gestes répétés de Paul font monter ses skills** —
> le corps et l'esprit, la langue et le sport, la garde et la pratique. Léo y
> compte, y félicite et y relance. Elle n'y juge jamais.

**Et c'est un jeu, pas un tableau de bord.** Paul l'a tranché en refusant de le
ranger sous GRIMA (« ce qui est utile ») ou NAGA (« ce qui fait grandir ») :
*« tout seul : c'est un autre système, c'est plutôt un jeu qu'autre chose »*.
Conséquence directe et non décorative — **ALTHEA n'obéit pas aux mêmes lois que
le reste d'Ultima** : l'anglais y est admis (§1.1), le ton y est celui du jeu,
et sa mesure de réussite n'est pas « la donnée est juste » mais **« Paul a envie
de l'ouvrir »**.

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
   (propriétaire, geste, jour) ; jamais de jour futur ; le rattrapage d'une
   semaine passée est permis (Paul l'a demandé) mais reste **un geste explicite**,
   jamais un remplissage automatique.
5. **ALTHEA porte la donnée la plus intime d'Ultima.** Tabac, alcool, corps,
   psychisme : c'est de la donnée de santé. Elle ne sort **pas du quadrant** —
   ni vers l'IA, ni dans les logs, ni dans le cockpit. Détail au §7.

---

## 4. La forme — le cadran (à trancher sur maquette)

Ce que le cadran doit montrer, dans cet ordre de priorité :

1. **Où j'en suis** — chaque skill, son rang, sa progression vers le
   suivant. C'est le cœur ; c'est ce qui se regarde même sans rien remplir.
2. **Le geste du jour** — nourrir ses skills doit coûter **une case par geste**,
   pas un formulaire. C'est la condition du « rigolo à remplir ».
3. **La parole de Léo** — ce qui est proche, ce qui dort, ce qui vient d'être
   franchi.

**Anatomie proposée (forme A — « la rose des skills ») :**

- Chaque skill = **un médaillon gravé**, cerné d'un **anneau d'or qui se
  remplit** à mesure qu'on approche du palier suivant, avec **son rang en
  chiffres romains gravé dessous**. L'anneau est ce qu'une boussole n'a jamais :
  c'est lui qui dit « ceci n'est pas une navigation ».
- **Au centre, le sceau du jour** — la date gravée ; c'est le bouton de saisie,
  pas un cap. Aucune aiguille pointillée, aucun « clique pour entrer ↝ ».
- **Sous le cadran, le relevé** — la semaine en sept colonnes, le jour courant
  mis en avant ; on coche, on referme.

**Forme B — « le registre gravé »** : une colonne de skills, chacun dépliant ses
gestes, avec sa jauge en ligne et ses cases du jour. Plus dense, moins désirable, plus lisible
en mobile à 390 px.

> **Les deux formes seront maquettées et comparées avant tout code** — c'est la
> méthode éprouvée sur VRANESH et DRAUKHAIN (l'image d'abord), et c'est Paul qui
> tranche sur l'image, jamais sur une description.

**Contrainte de mesure (règle 2026-08-01, non négociable)** : le cadran se
**mesure**, il ne se regarde pas. `getBBox()` comparée au `viewBox`, et éprouvée
sur un **pire cas construit — douze skills aux noms interminables, dont un à six
gestes** — pas sur les trois skills du premier jour, qui sont un échantillon
favorable.

---

## 5. Le moteur de progression

### 5.0 DEUX ÉTAGES — le skill et ses gestes (révélé par la réponse D4)

Paul a répondu, sur le périmètre v1 : **« on livre les skills : leurs noms, et
ce qu'il y a dedans »**. Ce *« ce qu'il y a dedans »* n'est pas une figure de
style — il **corrige le modèle** esquissé plus haut dans cette même journée.

Relecture de la dictée d'ouverture à la lumière de cette réponse : *« le talent,
ce sera peak performance […] aujourd'hui je n'ai pas fumé, je n'ai pas bu
d'alcool »*. **Peak performance n'est pas un compteur, c'est un contenant.**
Ne pas fumer et ne pas boire sont **deux gestes distincts qui le nourrissent
tous les deux**. Le premier cadrage écrasait les deux étages en un seul et
aurait produit soit un skill par geste (« pas de tabac » comme skill : maigre,
et l'écran se remplit de bricoles), soit un skill flou qu'on ne sait pas cocher.

> **ALTHEA a donc deux étages, et un seul des deux progresse :**
>
> - **Le SKILL** — ce qui porte un nom, un blason, un rang et des paliers.
>   *Peak performance. Japonais. Espagnol. Sport.*
> - **Le GESTE** — ce qu'on coche, ce qui se fait ou ne se fait pas dans une
>   journée. *Pas de tabac. Pas d'alcool. 30 min de japonais.*
>
> Un skill **contient** ses gestes. Un geste **n'a pas de rang** : il n'existe
> que pour nourrir son skill. C'est la réponse exacte à « leurs noms, et ce
> qu'il y a dedans ».

**Ce que ça règle, et qui n'était pas réglé avant** : la question « qu'est-ce
qu'un jour nourri pour *peak performance* ? ». Réponse posée ici — **un skill
est nourri le jour où TOUS ses gestes du jour sont tenus** (règle par défaut,
modifiable par skill : voir 5.2). Un jour à moitié tenu ne compte pas comme un
jour tenu ; il ne compte pas non plus comme une faute (règle cardinale 1).

### 5.1 Deux natures de geste

| Nature | Ce qu'on déclare | Exemples de Paul |
| --- | --- | --- |
| **Pratique** | « j'ai pratiqué aujourd'hui » (+ durée, facultative) | japonais, espagnol, sport |
| **Garde** | « j'ai tenu aujourd'hui » | pas de tabac, pas d'alcool |

Une seule mécanique de comptage pour les deux — c'est ce qui rend le moteur
petit. La différence est de **mot** (« pratiqué » / « tenu ») et d'icône. La
nature vit sur le **geste**, pas sur le skill : rien n'interdit un skill mixte
(« peak performance » = deux gardes **et** une pratique).

### 5.2 Ce qui compte : le **jour nourri**, pas le point

Le compteur d'un skill est son **nombre de jours nourris**. Choix délibéré
contre un système de points (XP) : un point est arbitraire et se gonfle ; un jour
est un fait, il ne se négocie pas. Les **minutes** existent pour les pratiques,
mais elles **ornent** (« 42 h de japonais ») — elles ne font pas monter le rang.
Sinon on récompense celui qui déclare des heures, pas celui qui pratique.

**Règle de nourriture d'un skill** — un champ du skill, deux valeurs possibles :

- `tous` (défaut) — le jour compte si **tous** les gestes du jour sont tenus.
  C'est l'exigeant, et c'est le bon pour *peak performance* : une journée sans
  tabac mais arrosée n'est pas une journée de peak performance.
- `un` — le jour compte si **au moins un** geste est tenu. C'est le souple, et
  c'est le bon pour un skill à plusieurs portes (« sport » = course *ou* salle
  *ou* vélo : peu importe laquelle, c'est du sport).

Deux valeurs, pas trois : un seuil chiffré (« 2 gestes sur 3 ») serait un
réglage de plus à comprendre pour un gain que rien ne justifie aujourd'hui.

### 5.3 Les paliers — cinq rangs, gravés

| Rang | Nom | Seuil par défaut (jours nourris) |
| --- | --- | --- |
| I | **L'Éveil** | 7 |
| II | **La Constance** | 30 |
| III | **L'Endurance** | 90 |
| IV | **La Maîtrise** | 180 |
| V | **Le Renom** | 365 |

Les seuils sont **par skill** et modifiables : le sport et le japonais n'ont pas
le même tempo. Les noms, eux, sont communs — c'est ce qui fait la langue du
quadrant. (Registre mixte assumé : le contenant est en anglais — *skill* — les
rangs restent gravés en français. C'est le jeu qui emprunte à Ultima, pas
l'inverse.)

### 5.4 L'élan

**✅ Tranché par Paul (2026-08-06) : cumul + élan qui respire.**

**L'élan** = la série de jours nourris en cours, au niveau du **skill**. Il
s'affiche, il motive, et **il ne détruit rien** quand il retombe (règle 2). Le
**meilleur élan** reste gravé comme un record — un trou n'efface pas un exploit
passé. Le rang, lui, ne bouge jamais vers le bas.

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

**Quatre tables** — les deux étages du §5.0 s'y lisent directement. Motif
standard du schéma (RLS dès la création, une policy par opération, `owner_id`
NOT NULL default `auth.uid()`, `(select auth.uid())` pour l'advisor initplan,
CHECK d'énumération miroir de la validation API, FK **composites scellées**
`(owner_id, id)` au motif AD-4 de `0008`/`0009` — un geste ne peut pas se
raccrocher au skill d'un autre propriétaire).

- **`althea_skills`** — `nom`, `blason`, `seuils` (5 entiers croissants, bornés),
  `nourriture` (`tous` | `un`, défaut `tous`), `actif`. **C'est l'étage qui
  progresse** ; il ne porte aucune nature (elle vit sur le geste).
- **`althea_gestes`** — `skill_id`, `libelle`, `nature` (`pratique` | `garde`),
  `mesure` (`presence` | `duree`), `rang_affichage`, `actif`. **Aucun compteur
  ici** : un geste ne progresse pas, il nourrit.
- **`althea_paliers`** — `skill_id`, `rang` (1..5), `recompense` (texte,
  facultatif), `reclame_le`. On ne stocke **pas** « atteint » : c'est dérivé du
  comptage, et une donnée dérivée stockée finit toujours par mentir.
- **`althea_releves`** — `geste_id`, `jour` (date), `tenu` (booléen), `minutes`
  (nullable), `mot` (facultatif, court). **Unicité (owner_id, geste_id, jour)** ;
  `jour <= current_date` ; pas de ligne = non renseigné (règle 1, exprimée dans
  le schéma et pas seulement dans l'UI).
- Une **vue dérivée** `althea_progression` en `security_invoker`, **par skill** :
  jours nourris (au sens de sa règle `nourriture`), élan courant, meilleur élan,
  rang atteint.

> **Le point de vigilance propre à ce modèle** : un skill dont on **désactive**
> un geste change rétroactivement le sens de son passé (un jour jadis « à moitié
> tenu » devient « tenu »). Le rang pourrait bouger tout seul — ce qui violerait
> la règle 2. Parade retenue : **désactiver un geste ne réécrit pas le passé** —
> `actif=false` vaut à partir du jour de la désactivation, et le calcul
> d'antériorité ne considère que les gestes actifs **à la date du jour
> considéré**. C'est le genre de piège qu'on ne voit qu'en écrivant le modèle,
> et jamais en écrivant l'écran.

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

- **RLS** comme partout, sans exception. Le libellé d'un geste (« pas de tabac »)
  est aussi sensible que le nom du skill qui le porte — les deux étages sont
  protégés à l'identique, aucun n'est « juste une étiquette ».
- **Cockpit** : ALTHEA n'expose que des **entiers** (« 2 skills à nourrir
  aujourd'hui »). Jamais un intitulé — parce que l'intitulé *est* l'information
  (« garde du tabac » dit tout).
- **Les yeux de Léo** (`/api/leo`, champ `etat`) transportent aujourd'hui
  « comptes **et intitulés** bornés ». **Pour ALTHEA, les intitulés sont
  exclus** : seuls des comptes partent. C'est une exception explicite au contrat
  existant, à écrire dans `validerEtatQuadrant`, pas une consigne de prudence.
- **Preuve par l'ABSENCE** (règle 2026-07-30) : le harnais cherche le nom d'une
  geste sensible dans ce qui sort (charge `/api/leo`, réponse `/api/cockpit`,
  HTML servi, logs) et **exige de ne pas l'y trouver**. Vérifier la présence du
  permis ne prouve rien.
- **Zéro donnée dans le HTML servi** : `althea.html` est muette, tout arrive
  après authentification (invariant Lv3).

---

## 8. Les passerelles — plus tard, et pas par copie

Deux liens naturels, **hors v1** (EB : une boucle à la fois), notés ici pour
qu'on ne les réinvente pas :

- **ALTHEA → RESHIRAM** : un skill mûr **étaye** un talent prouvé.
  « 214 jours de japonais nourris » est exactement la preuve chiffrée que
  RESHIRAM réclame et que Paul n'a aujourd'hui aucun moyen de produire. Lien en
  **lecture seule, sens unique**, sur le motif `talent_refs_reseau` (`0013`).
- **ALTHEA ↔ DRAUKHAIN** : un skill peut être **le bras armé d'un serment**.
  Le serment reste le récit, le skill reste le compteur ; on relie, on ne
  recopie pas.

---

## 9. Les décisions de Paul (prises le 2026-08-06)

| # | Question | ✅ Décision de Paul |
| --- | --- | --- |
| **D1** | **Où ALTHEA s'accroche** dans l'arbre Lv3 | **« Tout seul : c'est un autre système, car c'est plutôt un jeu qu'autre chose. »** Ni sous GRIMA, ni sous NAGA, ni dans IMLADRIK. **Une précision reste due** — voir §9.1. |
| **D2** | **Le mot** de l'unité qui monte | **Un SKILL.** Le mot de Paul, tiré de sa dictée d'ouverture. La collision avec les `talents` de RESHIRAM est tranchée par le registre : *skill* = le jeu, *talent* = le prouvé (§1.1). |
| **D3** | **Le moteur** de progression | **Cumul + élan qui respire.** Le rang ne se reperd jamais ; seule la série en cours redescend (§5.4). |
| **D4** | **Périmètre v1** | **« On livre les skills : leurs noms, et ce qu'il y a dedans. »** Pas de jauge physique/psychique en v1 — et surtout, ce *« ce qu'il y a dedans »* a **révélé les deux étages** du modèle (§5.0). |
| **D5** | **Récompenses** | *Non posée à Paul — reste au choix de Léo pour la v1.* Retenu : le palier symbolique **et** le champ « récompense réelle » que Paul remplit lui-même. Coût nul, mordant maximal. Réversible. |
| **D6** | **Le blason d'ALTHEA** | *Non posée — tranchable sur la maquette.* Proposition : **la couronne de laurier** (le mérite gagné, aucune collision avec les blasons existants). |

### 9.1 La seule question qui reste — que veut dire « tout seul » ?

Paul a dit ce qu'ALTHEA **n'est pas** (ni « utile », ni « ce qui fait grandir »).
L'arbre Lv3 offre deux places pour un nœud qui n'appartient à aucune catégorie,
et elles ne produisent **pas le même Ultima** :

- **① Troisième cadran d'ULTIMA**, aux côtés de GRIMA et NAGA. ALTHEA reste
  dans le personnel (il l'est), mais il
  n'est rangé sous aucune des deux devises. Chemin : *accueil → ULTIMA → ALTHEA*
  (2 clics). C'est le « tout seul » **au sein du perso**.
- **② Troisième cap de la RACINE**, aux côtés d'ULTIMA et d'ALPHA. ALTHEA sort
  du personnel et du professionnel : il devient un **monde à part**, visible dès
  la porte d'entrée. Chemin : *accueil → ALTHEA* (1 clic). C'est le « tout seul »
  **au sens fort**, et c'est aussi le plus cohérent avec « c'est un autre
  système » — au prix d'une racine où un jeu pèse autant que tout le travail.

> **Recommandation de Léo : ②, la racine.** Un jeu qui demande d'être ouvert tous
> les jours doit être à **un clic**, pas deux — c'est la seule des deux options
> qui sert la règle « rigolo à remplir ». Et « un autre système » est exactement
> ce que dit une place hors des deux supra-divisions.

---

## 10. Le format 6 points de la boucle suivante (B1)

Recalé sur la réponse D4 de Paul : **« on livre les skills : leurs noms, et ce
qu'il y a dedans »**. B1 n'est donc pas « une page avec des cases » — c'est
**le catalogue réel des skills de Paul**, posé et rendu visible.

**① But** — ALTHEA existe, et **les skills réels de Paul y sont posés** : leur
nom, leur blason, leurs gestes, leurs paliers. Paul peut les nourrir pour
aujourd'hui et pour les jours de la semaine écoulée, et voir son rang et son élan.

**② Étapes** — (a) **Paul dicte ses skills et leur contenu** (§10bis) ;
(b) maquette comparative **forme A / forme B**, Paul tranche sur l'image ;
(c) place dans l'arbre (§9.1) : entrée au registre Lv3 + coque `althea.html` ;
(d) migration `0022` écrite, **non appliquée** (gate Paul) ; (e) `api/althea.js`
+ validation miroir ; (f) le cadran et le relevé ; (g) harnais ; (h) seed
paramétré par `owner_id` pour les skills dictés (motif RESHIRAM/ZEKROM :
idempotent, jamais d'`owner_id` en dur).

**③ Moyens** — `js/registre-lv3.mjs`, `js/blasons.mjs`, `althea.html`,
`css/althea.css`, `api/althea.js`, `api/_lib/validate.js`,
`supabase/migrations/0022_althea_skills.sql`, `supabase/seed-althea-paul.sql`,
`middleware.js` (chemin privé), `api/_lib/leo.js` (l'exception d'intitulés, §7),
`tests/smoke-althea.mjs`, `tests/unit-althea-validate.mjs`,
`tests/unit-althea-progression.mjs` (le moteur de rangs, d'élan et de règle de
nourriture — **fonctions pures, testées sans navigateur**).

**④ Critères de réussite (vérifiables)** — le patrimoine COMPLET vert ;
`unit-althea-progression` prouve les cinq règles cardinales du §3 **et** les
deux règles de nourriture (`tous` / `un`), **dont l'absence de punition du
silence** et **le passé qu'une désactivation de geste ne réécrit pas** (§6) ;
la géométrie du cadran mesurée contre son `viewBox` sur un pire cas à **douze
skills, dont un à six gestes** ; la preuve par l'ABSENCE sur `/api/leo` et
`/api/cockpit` ; un relevé pris à 23 h 40 se range au bon jour ; **nourrir un
skill coûte moins de cinq secondes** (mesuré au harnais en nombre de gestes
d'interface, pas à l'œil).

**⑤ Ce qu'on ne fait PAS en B1** — les passerelles (§8), les jauges physique /
psychique, l'historique long (courbes), la moindre notification, l'application
de la migration (gate Paul).

**⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »**

| Mode de défaillance | Ce qui le prévient |
| --- | --- |
| **Le quadrant meurt en trois semaines** — le vrai risque de tout suivi d'habitudes. | Une case par geste, zéro formulaire, aucun zéro punitif, rang jamais perdu. Si nourrir coûte plus de 5 secondes, la forme est ratée — c'est un critère mesuré, pas un souhait. |
| **On livre un écran vide** — la forme est prête, les skills de Paul n'y sont pas. C'est le risque n°1 de B1, et c'est précisément ce que la réponse D4 demande d'éviter. | Étape (a) **avant** tout : Paul dicte ses skills et leur contenu ; le seed les pose. Un ALTHEA sans les skills de Paul n'est pas livré. |
| **Les deux étages s'écrasent en un seul** (un skill par geste, ou un skill flou). | Le §5.0, et une assertion de harnais : *peak performance* porte **plusieurs** gestes et **un seul** rang. |
| **ALTHEA redevient DRAUKHAIN** (on y écrit du récit, on y jure des serments). | La frontière du §1.2, écrite ; le relevé n'accepte qu'un **mot court**, jamais une page. |
| **Le silence compté comme un échec.** | Trois états au schéma (pas de ligne = non renseigné), assertions dédiées au harnais. |
| **Un rang qui bouge tout seul** quand un geste est désactivé. | La règle de non-réécriture du passé (§6), éprouvée par un cas de test dédié. |
| **Le cadran déborde** à douze skills. | Mesure `getBBox()` vs `viewBox` sur pire cas construit — leçon DRAUKHAIN, déjà payée une fois. |
| **La donnée de santé fuit** par le cockpit, l'IA ou un log. | Comptes seuls, intitulés de skills **et de gestes** exclus des yeux de Léo, preuve par l'ABSENCE aux quatre sorties. |
| **Le compteur ment** (fuseau, double saisie, jour futur). | Unicité en base, `jour <= current_date`, date locale validée serveur, CHECK **testés par le refus, cas NULL d'abord**. |
| **On construit sur une dictée mal entendue** (« arbre de capacités », « science de sport »). | Les deux passages sont signalés au §0 et confirmés par Paul avant B1. |

---

## 10bis. Ce que Léo attend de Paul pour l'étape (a) — ses skills

Le format, pour que la dictée soit directement exploitable. **Un skill = un nom
+ ce qu'il y a dedans.** Ce qui est déjà connu de la dictée d'ouverture, à
confirmer et compléter :

| Skill (nom) | Ce qu'il y a dedans (les gestes) | Nature |
| --- | --- | --- |
| **PEAK PERFORMANCE** | « pas fumé » · « pas bu d'alcool » · *(à compléter : sommeil ? sport ?)* | garde |
| **JAPONAIS** | « pratiqué le japonais » *(+ minutes, facultatif)* | pratique |
| **ESPAGNOL** | « pratiqué l'espagnol » *(+ minutes, facultatif)* | pratique |
| **SPORT** | *(à préciser : une seule case, ou plusieurs portes — course / salle / vélo ?)* | pratique |

Trois questions ouvertes sur ce tableau, à trancher en dictant :

1. **Peak performance** — quels gestes exactement, et faut-il **tous** les tenir
   pour que le jour compte (règle `tous`) ? C'est le réglage qui décide si le
   skill est exigeant ou complaisant.
2. **Sport** — un seul geste, ou plusieurs portes en règle `un` ?
3. **Le rythme des paliers** — les seuils par défaut sont 7 / 30 / 90 / 180 /
   365 jours nourris. Trop lents pour le japonais ? Trop rapides pour la garde ?

---

## 11. État de la boucle

- **B0 — cadrage** : ce document. ✅ livré le 2026-08-06. **Zéro code, zéro
  migration** — conforme au gate EL. Les décisions **D1 → D4 sont prises** le
  jour même, et D4 a **corrigé le modèle** (les deux étages, §5.0) avant qu'une
  seule ligne ne soit écrite : c'est exactement ce que le gate d'entrée existe
  pour produire.
- **Reste bloquant pour ouvrir B1** : ① la place exacte d'ALTHEA dans l'arbre
  (§9.1 — racine ou cadran d'ULTIMA) ; ② **les skills de Paul, dictés** (§10bis).
- **Prochaine action unique** : Paul dicte ses skills et leur contenu (§10bis),
  en tranchant au passage la place (§9.1). Ensuite seulement, la **maquette
  comparative forme A / forme B** (`design/preview-althea-cadran.html`, **sans
  `<script>` inline** — CSP `script-src 'self'`, cinq maquettes antérieures sont
  muettes en preview pour cette raison exacte).
