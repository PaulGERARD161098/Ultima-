# CADRAGE — LV6 : le ciel vivant (constellations partout + Léo proactive)

> Format 6 points (**directive EL**). Dicté par Paul le 2026-08-20 : *« on va
> passer du temps à bien implanter les constellations partout, et à rendre
> l'interface plus proactive — que l'interface me pousse à l'usage et à
> l'amélioration continue »*. Précision du soir : *« un gros cadrage pour
> exécution la semaine prochaine — un plan très détaillé et précis, pas
> d'exécution avant mon top départ »*.
>
> **⛔ GATE : AUCUNE EXÉCUTION AVANT LE TOP DÉPART DE PAUL.** Ce document est
> le seul livrable de la boucle courante. La première boucle de code s'ouvrira
> au go, palier par palier, une boucle à la fois (EB).

## 0. Le constat — mesuré le 2026-08-20

### 0.1 Où le ciel EST déjà — rien à refaire (EB : capitaliser)

| Acquis | Preuve |
|---|---|
| **La navigation entière est au ciel** : la racine + les 9 coques (LV4-LV5), rendues par le moteur unique `js/ciel.js` via `js/adaptateur-lv4.mjs` + `js/ciel-noeud.mjs` | PR #163→#172, `smoke-lv4-ciel`, `smoke-lv5-plein-ecran` |
| **RIVEN** est un ciel de données depuis 2026-08-11 | `smoke-ciel` (54 assertions) |
| **La boussole des futurs de VRANESH** est un ciel dans une fenêtre de nuit (P5c) | `smoke-vranesh` (250 verdicts) |
| **Le sol étoilé** est le fond commun de 11 pages de travail (3 registres : ciel / atelier / instrument) | `smoke-fond-contraste`, P5a/P5b/P6 |
| Le moteur sait déjà : cadrage serré, tous-les-noms, Gémeaux (opposition), plancher des réseaux minuscules, vue à plat de secours, focus clavier, cibles ≥ 24 px | options LV4, par défaut inactives |

**« Partout » ne veut donc plus dire la navigation — elle y est.** Ce qui
reste hors du ciel, ce sont les **vues de données**.

### 0.2 Où le ciel N'EST PAS — les vues de données, une par une

| Page | Ce qu'elle affiche aujourd'hui | Ses données | Verdict proposé |
|---|---|---|---|
| `idees.html` (ADRAMELECH) | l'archipel — une carte d'îles dessinée | `idees` + `idees_liens` : des nœuds et des LIENS | **Candidate n° 1** : son modèle (idées reliées par rapprochements) est EXACTEMENT celui du ciel. LV4 §5 disait « son sort se cadrera seul » — c'est maintenant. |
| `reshiram.html` + `zekrom.html` (TAO) | listes de talents / d'idéaux | `talents`, `preuves`, `ideaux`, `directions`, rétroplanning | **Candidate n° 2, en option** : la double constellation jumelle (les Gémeaux existent déjà dans le moteur). À décider après avoir vu P4. |
| `althea.html` / `althea-cadran.html` | l'instrument du Système | — | **Ne bouge pas** : exception actée « l'antique vu de nuit » (P6). |
| `abaque.html` | l'instrument financier | — | **Ne bouge pas** : on lit des chiffres, registre instrument. |
| `maedrethnir`, `ecrire`, `draukhain`, `vranesh`, `registre` | les ateliers — on saisit, on relie | — | **Ne bougent pas** : le ciel est leur FOND (P5b), pas leur forme. Le ciel n'avale pas les formulaires. |

### 0.3 La machinerie proactive existante — on capitalise

| Existant | Ce qu'il sait faire | Ce qu'il ne sait PAS faire |
|---|---|---|
| `js/leo-accueil.js` (1 063 l.) | le cartouche d'accueil par quadrant (L1), la voix (L2), les mains sur confirmation (L2b) ; dialog accessible, une fois par session, fail-closed | il ne parle qu'à l'ENTRÉE d'un quadrant, jamais à la racine ; il dit l'état, il ne dit pas **l'appel** |
| `api/cockpit.js` | agrégats derrière auth : talents / à étayer, idéaux / à orienter, liens, **relances dues** — head+count, zéro PII | la **fraîcheur** (depuis quand chaque quadrant n'a pas été nourri), les **orphelines** (idées sans lien), l'**élan ALTHEA** |
| `js/althea-progression.mjs` | module PUR : élan, jours tenus, « tenu / en sommeil » — sans jugement (règle ③) | il n'est lu que par ALTHEA, jamais remonté à l'accueil |

### 0.4 La donnée en base — le vrai goulot (mesuré en prod, à re-mesurer à l'ouverture de P1)

| Table | Lignes | Ce que ça veut dire |
|---|---|---|
| `network_nodes` (RIVEN) | **5** | le réseau commence à peine |
| `personnes` (RIVEN) | **0** | aucune personne derrière les structures |
| `journal` (RIVEN) | **0** | **`relances_dues` tourne à VIDE** : la machinerie de relance existe et n'a rien à relancer |
| `talents` / `preuves` | 3 / **0** | trois talents, aucun étayé |
| `idees` / `idees_liens` | 4 / 4 | la bibliothèque est un carnet |
| `imladrik_entrees`, `intendant_*`, `passerelles` | **0** | jamais nourris |
| `althea_releves` | 7 — **dernier : 2026-08-10** | l'élan dort depuis dix jours |

**La proactivité sans donnée est un haut-parleur dans une pièce vide.** Le
volet D (la saisie — actions Paul, §8) conditionne la valeur de tout le reste,
et il peut commencer AVANT le top départ : il ne dépend d'aucun code.

---

## 1. ① Le but — ce qui sera vrai à la fin

1. **Les constellations rendent les DONNÉES, plus seulement la navigation** :
   les idées d'ADRAMELECH sont un ciel — une idée est une étoile, un
   rapprochement est un trait, un thème est une constellation. (Et si Paul
   l'arbitre après P4 : TAO devient la double constellation talents ⇄ idéaux.)
2. **Le ciel appelle** : sur les écrans de navigation, l'étoile d'un quadrant
   porteur d'un signal (relance due, élan en sommeil, talent sans preuve,
   idée orpheline) porte une lueur d'appel, et son libellé dit le compte au
   survol. D'un coup d'œil depuis la racine, on voit OÙ Ultima attend Paul.
3. **Léo ouvre la journée** : à la première entrée du jour, un cartouche
   « trois signaux, une action » — déterministe, borné, jamais culpabilisant.
   C'est lui qui pousse à l'usage ET à l'amélioration continue : il dit quoi
   nourrir, il propose UNE prochaine action, il se ferme d'un Échap.

## 2. ② Les étapes — cinq paliers, chacun = une boucle = une PR

**Ordre proposé : la proactivité d'abord (P1→P3), les constellations ensuite
(P4→P5).** Raison : c'est la proactivité qui « pousse à l'usage », elle est
petite, et elle rend service même pendant que la base se remplit. (Arbitrage
n° 1, §7.)

### P1 — le socle des signaux (`api/cockpit.js` v3)

Étendre les agrégats — **toujours des comptes et des nombres de jours, jamais
un contenu, jamais un intitulé** :
- `fraicheur.<quadrant>` : jours depuis la dernière écriture (max de date par
  table, une requête head par quadrant) ; un quadrant JAMAIS nourri répond
  `jamais: true` — un silence n'est pas un « tout va bien » ;
- `adramelech.orphelines` : idées sans aucun lien ;
- `althea.jours_sans_releve` + `althea.elan_etat` (« tenu » / « en sommeil »),
  calculés par le module PUR `js/althea-progression.mjs` déjà éprouvé ;
- `riven.fiches`, `riven.personnes` (les deux comptes qui disent le goulot).

Livrables : `api/cockpit.js` modifié, `tests/unit-signaux.mjs` (cas connus),
harnais d'**absence** (la réponse cockpit ne contient AUCUN intitulé connu de
la base — règle 2026-07-30).

### P2 — les étoiles qui appellent

- `js/ciel-noeud.mjs` (qui lit déjà `/api/cockpit` pour les nœuds
  `cockpit: true`) passe à l'adaptateur un dictionnaire `signaux` par id ;
- `js/adaptateur-lv4.mjs` pose sur l'étoile concernée un attribut
  `data-signal="N"` ; `css/stellaire.css` en fait une **lueur d'appel**
  discrète (halo pulsé lent, `prefers-reduced-motion` → statique) ;
- le libellé au survol/focus dit le compte : « RIVEN — 3 relances dues » ;
- **fail-closed** : pas de session, ou cockpit en erreur → zéro signal → le
  ciel est STRICTEMENT celui d'hier.
- `js/ciel.js` : **intouché si possible**. Si poser l'attribut exige une
  option de rendu, elle suit la jurisprudence LV4 : option par défaut
  inactive, `smoke-ciel` (54) avant/après.

### P3 — le cartouche du matin

- Les règles vivent dans un **module PUR** `js/leo-matin.mjs` : entrée = la
  réponse cockpit, sortie = `{ signaux (≤3), action (1) }`. Priorité :
  relance due la plus ancienne > élan ALTHEA en sommeil > talent sans preuve >
  idée orpheline la plus ancienne > quadrant jamais nourri. Unit-testable
  sans navigateur (l'angle mort des pages authentifiées ne le couvre pas).
- Le rendu réutilise le cartouche existant (`accueillirQuadrant` :
  dialog accessible, focus piégé, Échap) sur la **racine**, **une fois par
  jour** (clé `ultima-leo-matin-<date>`).
- **Un seul fetch cockpit partagé** entre les étoiles (P2) et le cartouche —
  jamais deux sources de vérité.
- Le wording est écrit et pesé (EL ④) : chaque libellé consigné dans le
  module, et une liste de mots interdits assertée (« retard », « échec »,
  « faute », « seulement ») — **Ultima compte, elle ne reproche pas** (règle
  ③ d'ALTHEA, étendue à tout le produit).

### P4 — le ciel des idées (le gros morceau visuel)

1. **La maquette d'abord** (EL) : `design/preview-ciel-idees.html`, chargeant
   le **vrai** `js/ciel.js` et des fixtures de forme réelle. Elle éprouve :
   le réel d'aujourd'hui (**4 idées** — réseau minuscule, plancher existant),
   un **pire cas construit** (60 idées, 8 thèmes, 30 liens), l'idée sans
   thème, l'idée orpheline, le focus clavier. Bandeau de mesure embarqué.
   **→ arbitrage de Paul sur le rendu.**
2. L'adaptateur PUR `js/adaptateur-idees.mjs` : `idees` + `idees_liens` →
   `{ noeuds, relations }`, thème → constellation. `tests/unit-adaptateur-idees.mjs`.
3. `idees.html` bascule : le ciel remplace l'archipel (arbitrage n° 2, §7) ;
   `registre.html` RESTE la vue de travail en liste — on ne perd aucun outil.
4. `tests/smoke-ciel-idees.mjs` : la routine éprouvée — données ↔ DOM (aucune
   idée perdue), `getBBox()` ⊂ `viewBox` aux deux largeurs ET sur le pire
   cas, AA, cibles ≥ 24 px.

### P5 — TAO, la double constellation (SEULEMENT si arbitré après P4)

RESHIRAM et ZEKROM en deux constellations jumelles liées par le rétroplanning
— `disposerEnOpposition` (les Gémeaux) existe déjà. Même méthode : maquette →
arbitrage → adaptateur pur → harnais. Si Paul dit non : P5 tombe, rien
d'autre ne bouge.

### Volet D — la donnée (actions Paul, EN PARALLÈLE, dès maintenant)

Voir §8. Aucun code n'attend dessus, rien n'attend le top départ.

## 3. ③ Les moyens

| | |
|---|---|
| **Créé** | `js/leo-matin.mjs` · `js/adaptateur-idees.mjs` · `design/preview-ciel-idees.html` (+ `.js`) · `tests/unit-signaux.mjs` · `tests/unit-leo-matin.mjs` · `tests/unit-adaptateur-idees.mjs` · `tests/smoke-ciel-idees.mjs` · (P5 : `design/preview-ciel-tao.html`, `js/adaptateur-tao.mjs`, harnais) |
| **Modifié** | `api/cockpit.js` · `js/ciel-noeud.mjs` · `js/adaptateur-lv4.mjs` · `css/stellaire.css` · `index.html` (cartouche du matin) · `idees.html` (bascule P4) · `tests/lancer.sh` (chaque palier ENRÔLE son harnais) · les smoke touchés, assertions reprises **une à une** |
| **Intouché** | `js/ciel.js` (sauf option arbitrée, par défaut inactive, `smoke-ciel` avant/après) · `js/registre-lv3.mjs` (les 21 nœuds) · **la base : AUCUNE migration, aucune table, aucune écriture nouvelle — LV6 ne fait que LIRE** · RIVEN · auth / middleware · ALTHEA · l'abaque |

**Aucune gate Supabase dans tout LV6** : pas une ligne de SQL.

## 4. ④ Les critères de réussite — mesurés, jamais « à l'œil »

1. **P1** — chaque agrégat nouveau validé contre **une valeur connue en base**
   (l'instrument se valide sur un cas dont on connaît la réponse — règle
   2026-08-17) ; harnais d'absence vert sur la réponse cockpit.
2. **P2** — signaux à 0 ou sans session → DOM du ciel **strictement identique**
   à aujourd'hui (diff automatisé) ; signal ≥ 1 → lueur présente + compte au
   survol ; `prefers-reduced-motion` respecté ; `smoke-ciel` 54/54 avant/après.
3. **P3** — une seule ouverture par jour (deux visites simulées) ; les règles
   de priorité unit-testées cas par cas ; jamais plus de 3 signaux + 1 action ;
   liste des mots interdits assertée sur tous les libellés du module.
4. **P4** — aucune idée perdue (comparaison données ↔ DOM, automatique) ;
   `getBBox()` ⊂ `viewBox` sur 390 × 844 ET 1670 × 900 ET le pire cas
   construit ; navigation clavier ; AA sur tous les textes.
5. **Chaque palier** — patrimoine **COMPLET** vert (`bash tests/lancer.sh`,
   84 sections + les nouvelles), sortie 0, avant chaque fusion.
6. **Zéro assertion supprimée en bloc** — reprise une à une, méthode de l'arbre.

## 5. ⑤ Ce qu'on ne fait PAS dans LV6

- **Aucune migration, aucune table, aucune écriture nouvelle** — on lit.
- **Pas de notification hors d'Ultima** (mail, push) : la proactivité vit DANS
  l'interface. Un rappel externe serait une boucle future, sur demande de Paul.
- On ne touche pas au registre de navigation (21 nœuds, aucun renommage).
- On ne refond ni ALTHEA (exception nuit actée) ni l'abaque (instrument).
- Les ateliers restent des ateliers : aucun formulaire ne devient un ciel.
- **Pas d'IA dans les signaux** : P1-P3 sont déterministes de bout en bout ;
  la voix de Léo (L2) reste ce qu'elle est, on ne l'élargit pas ici.
- On ne supprime pas la carto déterministe d'ADRAMELECH (`generer-carto.mjs`).

## 6. ⑥ Pre-mortem — « LV6 a échoué : pourquoi ? »

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **Le moteur touché « juste un peu », RIVEN casse** — trois écrans partagent désormais `ciel.js`. | Jurisprudence LV4 : option par défaut inactive, `smoke-ciel` avant/après. L'adaptateur absorbe tout ce qu'il peut. |
| 2 | **La proactivité culpabilise** — Ultima devient une app qui gronde, Paul la fuit : l'effet inverse du but. | Règle ③ d'ALTHEA étendue ; mots interdits assertés ; la lueur APPELLE, rien ne rougit, rien ne pâlit. |
| 3 | **Le cartouche du matin devient un péage** — agaçant dès le 3ᵉ jour. | Une fois par jour, Échap immédiat, jamais bloquant, 3 signaux MAX. Et Paul peut demander le silence — réglage consigné, pas enterré. |
| 4 | **Les signaux mentent sur le vide** — table jamais nourrie → silence → « tout va bien ». | Un quadrant jamais nourri est un SIGNAL (`jamais: true`), pas un silence : le filtre qui écarte compte et nomme (règle 2026-08-17). |
| 5 | **Une PII fuit dans un agrégat ou un libellé.** | Harnais d'ABSENCE sur la réponse cockpit ET sur le DOM du cartouche : le contenu interdit cherché, exigé absent. |
| 6 | **Le ciel des idées est illisible à 4 idées** (le réel d'aujourd'hui). | La maquette éprouve le réseau minuscule EN PREMIER ; plancher `reseauMinusculeGardeUnPlancher` déjà mesuré. |
| 7 | **Illisible à 60+ idées** (le réel de demain). | Le pire cas construit vit dans la maquette ET dans le harnais — pas seulement les données du jour (leçon DRAUKHAIN). |
| 8 | **Deux sources de vérité pour les signaux** — l'étoile dit 3, le cartouche dit 2. | Un seul fetch cockpit partagé ; les deux rendus lisent le MÊME objet. |
| 9 | **Un instrument de mesure neuf ment** (trois précédents le 2026-08-17). | Chaque harnais neuf répond d'abord sur un cas dont la réponse est connue ; une réponse trop uniforme = alarme. |
| 10 | **L'angle mort des pages authentifiées s'élargit** — le cartouche ne se voit qu'en session. | Les règles sont un module PUR unit-testé sans session ; l'angle mort DOM reste nommé à chaque rapport, jamais tu. |
| 11 | **Squash-merge : la branche empile sur l'historique pré-squash.** | Règle 2026-07-22 : `git checkout -B <branche> origin/main` après CHAQUE fusion. |
| 12 | **Le cadrage se périme avant le top départ** — la base bouge d'ici là. | Les chiffres du §0.4 portent leur date ; ils se RE-MESURENT à l'ouverture de P1 (règle RADAR : un constat d'état se périme). |

## 7. Les arbitrages attendus de Paul — AVANT le top départ

| # | La question | Ma recommandation |
|---|---|---|
| 1 | **L'ordre** : proactivité d'abord (P1→P3) puis constellations (P4→P5), ou l'inverse ? | **Proactivité d'abord** — petite, utile tout de suite, et elle pousse à nourrir la base pendant que P4 se prépare. |
| 2 | **P4** : le ciel REMPLACE l'archipel sur `idees.html`, ou vit à côté ? | **Remplace** — un écran, un rendu (JL) ; `registre.html` reste la vue de travail en liste, rien n'est perdu. |
| 3 | **P5 TAO** : dans LV6, ou pas ? | **Décider APRÈS P4** — même moteur, on connaîtra le coût réel à ce moment-là. Le cadrer maintenant, le trancher au vu du résultat. |
| 4 | **Le signal visuel** : lueur d'appel sur signal, ou éclat permanent qui varie avec la fraîcheur ? | **La lueur sur signal** — un thermomètre permanent pâlirait les quadrants délaissés : un reproche silencieux, contraire à la règle ③. |
| 5 | **Le cartouche du matin** : racine seulement, ou aussi à la première entrée de chaque quadrant ? | **Racine seulement** — les quadrants ont déjà leur cartouche L1 ; deux cartouches par trajet, c'est un péage. |

## 8. ⏳ Actions Paul — dès maintenant, sans attendre le top départ

C'est la réponse à « les contacts dans RIVEN c'est sûr, mais quoi d'autre ? » :

1. **Les contacts dans RIVEN** (5 fiches, 0 personne aujourd'hui) — et pour
   chaque fiche, **sa prochaine relance** (`relance_at` au journal) : sans
   elle, `relances_dues` reste à zéro et P2/P3 n'ont rien à dire. *La relance
   est le carburant n° 1 de la proactivité.*
2. **Une preuve par talent** (RESHIRAM : 3 talents, 0 preuve) — c'est ce qui
   transforme « mon offre » en offre étayée.
3. **Reprendre les relevés ALTHEA** (dernier : 2026-08-10) — l'élan est la
   matière première du signal « amélioration continue ».
4. Au fil de l'eau : **les idées dans ADRAMELECH** (4 aujourd'hui) — chaque
   idée saisie rendra le ciel de P4 plus vrai le jour où il s'allume.
5. **Le top départ LV6** + les 5 arbitrages du §7.
