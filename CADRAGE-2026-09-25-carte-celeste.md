# CADRAGE — La carte céleste : un clic exact, une vraie figure, tous les dépôts

> Format 6 points (**directive EL**). Dicté par Paul le 2026-09-25 au soir :
> *« on va continuer un peu le thème stellaire — la brillance des étoiles et le
> chemin de la situation des astres, il est moins fin que ce que je voudrais,
> j'aimerais qu'on le refonde, que ce soit plus une vraie carte ; là on est sur
> des constellations un peu brutes. Les chemins, quand je clique, ne sont pas
> très précis : quand je clique sur NAGA, sur GRIMA, parfois la sélection n'est
> pas bonne. Ce que je veux : je clique sur NAGA, ça fait un zoom et ça affiche
> toutes les étoiles de la constellation, vraiment sous forme de constellation,
> sans chevauchement. On va peut-être pas bosser dessus ce soir, mais cadrons.
> Et, important : que les constellations représentent aussi tous mes projets,
> tous mes repos, afin que Léo devienne mon macro-agent de navigation et de
> contrôle, lecture plus écriture, de tous mes git importants. Utilise le skill
> impeccable, et les skills de mise en forme GitHub. »*
>
> ⛔ **Ce document CADRE. Il n'exécute rien** — c'est ce que Paul a demandé ce
> soir. La première boucle de code s'ouvre à son go, lot par lot (EB).
>
> ⚠️ **Le skill `impeccable` a été chargé** (`impeccable context`, depuis
> `artisan-builder/.claude/skills/impeccable`, qui est le seul dépôt à le porter).
> Sa réponse conditionne la suite, et elle est reproduite ici plutôt que
> contournée : *« NO_PRODUCT_MD — init doit capturer PRODUCT.md avec l'humain
> avant tout `shape` ou refonte »*. Ce dépôt porte un `PRODUIT.md` — mais il
> décrit **la carte du réseau RIVEN de juillet** (P0, « carte interactive du
> réseau commercial »), pas Ultima. C'est l'arbitrage **A3** ci-dessous. Le
> playbook `shape` demande aussi un tour de questions avant d'écrire le brief :
> Paul n'est pas en ligne pendant la rédaction, donc les questions sont posées
> **dans le registre des arbitrages** (§8), pas inventées — et la substitution
> est dite ici, pas en fin de document.

---

## 0. Ce qui existe déjà — on capitalise, on ne recommence pas (EB)

| Acquis | Livré | Preuve |
|---|---|---|
| Un seul moteur de ciel, 3D en SVG sans bibliothèque | 2026-08-11 → LV4/LV5 | `js/ciel.js` (1 693 l.), `smoke-ciel` (**71 verdicts** mesurés le 25/09 — 54 à sa naissance, le chiffre des docs) |
| **L'isolement au clic** : ce qui CONTIENT s'isole sur place, un étage par clic ; trois sorties ; l'adresse suit (`#naga`) | 28/08, resserré le 31/08 | `js/ciel-noeud.mjs` §`isoler`, `smoke-lv5-plein-ecran` |
| **L'étoile affinée** (cœur blanc, quatre rais, lueur resserrée) | 17/08 (LV5) | `js/ciel.js` l. 940-960 |
| **Les dépôts sont des astres** : 10 dans l'agrégat du 24/09 — Ultima à la racine, 5 sous RENOBOOST IA, 4 sous ALPHA — avec la couleur d'appel Finubar | 02/09 + J1 du 22/09 | `finubar/macro.json`, `js/adaptateur-finubar.mjs` |
| **Léo lit et écrit sur tout le parc** : trois anneaux de droits (vert / orange / rouge), J1 fermé, J3 « Léo écrit » cadré | 22/09 | `CADRAGE-2026-09-22-leo-pilote-tout.md` §2, §4, §9 |

⛔ **Le dernier point n'est PAS re-cadré ici.** « Que Léo devienne mon
macro-agent de navigation et de contrôle, lecture plus écriture » est
exactement l'objectif du cadrage du 22/09, dont le modèle de droits est rendu
et le J1 livré. Ce document lui donne un **écran** — les dépôts visibles et
cliquables dans la carte — il ne lui redonne pas un plan. Deux cadrages du même
objectif seraient deux vérités.

## 0 bis. Ce qui a été MESURÉ le 25/09 — et c'est ça qui fonde les lots

Toutes les mesures : `ultima.html` servi en local, Chromium, `/api/finubar` et
`/api/cockpit` stubés (agrégat vide, puis l'agrégat réel commité). Desktop
1280 × 860 sauf mention.

### M1 · ⛔ Le clic sur NAGA échoue dans 4 gestes sur 5 — la cause est mesurée

| Geste (depuis `ultima.html`, position de NAGA mesurée AVANT le geste) | Résultat |
|---|---|
| Clic instantané au centre de l'étoile | **rien** — `#` vide, les 5 étoiles restent |
| Survol 400 ms, **re-mesure**, puis clic à la **nouvelle** position | ✅ isolé (`#naga`, 3 étoiles) |
| Survol, appui 150 ms (un clic humain) | **rien** |
| Clic Playwright sur l'élément (`locator.click`) | **rien** |
| Clic instantané, `prefers-reduced-motion` | **rien** |

**Le déplacement de NAGA après survol** : 0 px à 16 ms, 0 px à 100 ms,
**119 px à 250 ms**, stable ensuite. Le survol déclenche le **dépliage**
(`deplier` → `dessiner()`, `js/ciel-noeud.mjs` l. 463-472) : la scène est
re-dessinée avec les 3 enfants, le cadrage se recentre, et l'étoile qu'on
visait **part de sous le curseur**. Le clic tombe dans le vide.

**Le témoin, sur un cas dont on connaît la réponse** : sur l'écran isolé
`#naga`, où le dépliage au survol est déjà coupé (l. 469), survol de TAO →
**0 px** de déplacement, clic → `#tao`, RESHIRAM et ZEKROM peints. Le clic
n'est donc pas imprécis : **il est exact partout où le survol ne redessine
pas**. Ce que Paul appelle « la sélection n'est pas bonne » est le dépliage au
survol de LV4 (13/08), qui survit à la racine de chaque coque alors qu'il a été
retiré sous isolement le 31/08 pour une raison voisine (perte du focus).

⚠️ **Sur mobile, il n'y a pas de survol** : le défaut est propre au pointeur.
Non mesuré au doigt ce soir — à faire dans le lot 1, pas à déduire.

### M2 · Le ciel déplié tasse les étoiles sur un axe, et ça se voit

Capture après survol de NAGA : les 5 étoiles s'alignent sur une **verticale**,
« ADRAMELECH » et « TAO » se chevauchent, GRIMA et IMLADRIK passent **sous le
cartouche** de Léo. C'est le constat déjà écrit le 02/09 pour l'accueil (« tasse
cinq étoiles sur un même axe ») — il vaut ici aussi. Sur les écrans **isolés**
(NAGA : 3 étoiles, GRIMA : 2, ALPHA avec session : 6), **0 chevauchement de
zone** et 0 libellé masqué, aux deux largeurs — ALPHA re-mesuré au dry run de
21:13 : 6 étoiles, 6 noms visibles, 0 chevauchement de zone ni de nom, 0 hors
écran, à 1280 × 860 et 390 × 844. C'est donc le **dépliage** qui
fait « le bazar », pas l'isolement.

### M3 · Les cibles de clic ne sont pas en cause

Rayon de captation 13–18 px (`RAYON_CAPTATION_MIN` 12,5 ; `r × 2,4`), cœur
5–7 px, **0 chevauchement** entre zones sur les 6 écrans mesurés. Agrandir les
cibles ne corrigerait rien : ce n'est pas là que le clic se perd.

### M4 · Une constellation n'a pas de figure

`liens = 0` sur la racine, NAGA et GRIMA. Le seul trait du produit est la
passerelle RESHIRAM ⇄ ZEKROM (sous TAO). **Une constellation est aujourd'hui
un nuage de 2 à 6 points qui portent le même nom d'amas** — il n'y a ni ligne
d'astérisme, ni gabarit stable, ni hiérarchie d'éclat entre les étoiles d'un
même écran (les caps sont « des pairs, même éclat » — choix explicite de
`js/adaptateur-lv4.mjs`, laissé « à arbitrer par Paul »). C'est ce que Paul
nomme « constellations brutes », et « le chemin de la situation des astres »
qu'il ne trouve pas : il n'existe pas.

### M5 · Les dépôts sont bien là — deux crans plus bas, et avec une session

Avec l'agrégat réel et une session posée : `alpha.html` peint **6 étoiles**
(mon-dpe.fr · artisan-builder · Artidispo · DATA RÉNO + RENOBOOST IA · YCOME),
avec leur couleur d'appel (DATA RÉNO et RENOBOOST IA en or, les trois autres en
bleu). Les 5 briques RenoBoost sont sous RENOBOOST IA (un clic de plus).
**Sans session, aucun astre** — fail-closed voulu, à ne pas desserrer.

⚠️ **Trouvé au passage** : `alpha.html#renoboost-ia` **n'isole pas** — la greffe
des astres arrive APRÈS la lecture de l'adresse, et RENOBOOST IA n'a pas encore
d'enfants quand `#renoboost-ia` est lu. Un lien partagé vers un dépôt s'ouvre
donc sur ALPHA entier. Petit, mesuré, à corriger dans le lot 3.

---

## 1. ① Le but — ce qui sera vrai à la fin

1. **Le clic est exact.** Un clic sur une étoile isole ou ouvre CETTE étoile,
   **5 gestes sur 5**, à la souris ET au doigt, à la racine comme sous isolement.
   Le survol montre, il ne déplace jamais ce qu'on va cliquer.
2. **Une constellation a une figure.** Isolée, elle se lit comme sur une carte
   céleste : ses étoiles reliées par des **traits fins** (l'astérisme), une
   **hiérarchie d'éclat** lisible, un gabarit **stable** d'une visite à l'autre,
   aucun chevauchement — sur le plus petit écran (2 étoiles) comme sur le plus
   chargé (RENOBOOST IA isolé : 5 astres + sa porte).
3. **Chaque écran montre les projets.** Les 10 dépôts se lisent en **≤ 2 clics**
   depuis la racine, un lien `#<dépôt>` s'ouvre isolé, et l'étoile d'un dépôt
   dit ce que Léo peut y faire — l'anneau du 22/09, pas un droit nouveau.

## 2. ② Les étapes — quatre lots, une PR par séance, dans cet ordre

**Lot 0 — `impeccable init` (une demi-heure, avec Paul).** PRODUCT.md capturé
en entretien (init exige « un vrai tour de réponses »), depuis ce qui est déjà
écrit : `CLAUDE.md` §Objectif final, `CADRAGE-CONSOLE.md`, la charte de Léo,
l'état d'esprit « antique et sérieux ». Ce n'est pas une doc de plus : c'est
la clé d'entrée du skill que Paul a choisi, et sans elle `shape` refuse de
tourner. → arbitrage **A3** (PRODUCT.md remplace PRODUIT.md).

**Lot 1 — le clic exact (chirurgical, il ne touche pas au dessin).**
1. Le harnais **d'abord**, rouge : `tests/smoke-clic-exact.mjs` rejoue les cinq
   gestes de M1 sur NAGA et GRIMA, + le témoin `#naga`, + un tap tactile
   (`hasTouch`). Il doit voir **4 rouges sur 5** avant le correctif — c'est
   l'instrument validé sur un cas dont on connaît la réponse.
2. Le correctif, selon **A1** : le dépliage au survol **ne recentre plus** (la
   scène garde son cadrage, les enfants apparaissent autour de leur tête), OU
   le dépliage au survol est **retiré** de la racine comme il l'a été sous
   isolement (le survol n'affiche que le cartouche de Léo, comme aujourd'hui).
   Recommandation : **retirer** — c'est ce que Paul décrit (« je clique, ça
   zoome, ça affiche »), c'est le comportement déjà en place sous isolement
   depuis le 31/08, et un survol qui redessine reste un survol qui bouge.
3. `smoke-lv4-ciel` / `smoke-lv5-plein-ecran` : assertions reprises **une à
   une**, jamais supprimées en bloc.

**Lot 2 — la figure (le gros morceau, EL : la maquette avant le code).**
1. `design/preview-carte-celeste.html`, chargeant le **vrai** `js/ciel.js` et
   le **vrai** registre — jamais une copie. Elle rend : la racine (2), NAGA (3),
   ALPHA avec dépôts (6), RENOBOOST IA isolé (5 + porte), le **pire cas
   construit** (24 enfants directs, celui du 31/08), et les états : étoile
   d'appel, passerelle, focus clavier. Bandeau de mesure embarqué :
   chevauchements, noms hors cadre, contraste AA, cibles ≥ 24 px.
2. Ce qu'elle éprouve, et que Paul juge sur capture (→ **A2**, **A5**) :
   - **les traits d'astérisme** entre les étoiles d'une même constellation —
     finesse ~0,6 px, or pâle à 0,35, jamais un graphe complet ;
   - **la hiérarchie d'éclat** : la tête plus vive que ses caps, le signal
     Finubar en couleur (déjà là), le repos sans marque — jamais un reproche ;
   - **le gabarit stable** : la figure d'une constellation ne dépend que de son
     contenu, pas du chemin qu'on a pris pour y arriver.
3. Passage `impeccable critique` sur la maquette (deux sous-agents isolés,
   détecteur `impeccable detect`), puis `polish`. Le monde visuel est **établi**
   (carte savante, encre, or pâle) : c'est *extend an existing surface* de
   `new-work.md`, **pas** un tournoi de directions — aucune identité nouvelle.
4. Le code : ce qui peut vivre dans `js/adaptateur-lv4.mjs` (les traits sont des
   `relations`, le moteur les dessine déjà) y vit ; ce qui exige le moteur
   (l'éclat par rang) entre par une **option par défaut inactive**,
   `smoke-ciel` 71/71 avant et après — jurisprudence LV4 §7 voie A.

**Lot 3 — les dépôts partout.** `#<dépôt>` isole après greffe (M5) ; les astres
d'un dépôt portent dans leur libellé au survol l'anneau de Léo (« lecture ·
écriture verte ») lu depuis le même agrégat ; et le **J3 du 22/09** garde son
propre cadrage — ce lot lui donne un écran, il n'écrit rien à sa place.

## 3. ③ Les moyens

| | |
|---|---|
| **Créé** | `PRODUCT.md` (lot 0) · `tests/smoke-clic-exact.mjs` · `design/preview-carte-celeste.html` (+ `.js`, `.css`) · `tests/smoke-carte-celeste.mjs` |
| **Modifié** | `js/ciel-noeud.mjs` (dépliage) · `js/adaptateur-lv4.mjs` (traits, rang) · `css/stellaire.css` · `js/ciel.js` **seulement** par option inactive par défaut · `smoke-lv4-ciel`, `smoke-lv5-plein-ecran` (reprise une à une) · `tests/lancer.sh` (enrôlement) |
| **Intouché** | `js/registre-lv3.mjs` (21 nœuds, aucun renommage) · `finubar/` et `/api/finubar` · RIVEN (`riven.html`, ses 71 verdicts sont le garde-fou) · auth / middleware · **la base : aucune migration, aucune lecture nouvelle** |
| **Outils** | skill `impeccable` (`context` fait ; `init` → `shape` → `critique` → `polish` → `detect`) · Chromium local, `bash tests/lancer.sh` · aucune bibliothèque nouvelle |

**Aucune gate Supabase dans tout ce cadrage** : pas une ligne de SQL.

## 4. ④ Les critères de réussite — mesurés, jamais « à l'œil »

1. **Lot 1** — `smoke-clic-exact` : 5/5 gestes isolent NAGA et GRIMA, le tap
   aussi ; **vu rouge avant** (4/5) ; déplacement après survol = **0 px**.
2. **Lot 2** — sur les 6 écrans de la maquette **et** le pire cas construit :
   0 chevauchement entre libellés et entre zones, `getBBox()` ⊂ `viewBox` à
   390 × 844 et 1670 × 900, AA sur tous les textes, cibles ≥ 24 px, traits
   d'astérisme = nombre d'étoiles − 1 par constellation (un arbre, pas un
   graphe), `smoke-ciel` 71/71.
3. **Lot 3** — `alpha.html#renoboost-ia` peint 5 astres + la porte, et rien
   d'autre ; sans session : **strictement** le ciel d'aujourd'hui (diff DOM).
4. **Chaque lot** — patrimoine **complet** vert (`bash tests/lancer.sh`,
   sortie 0), preview Vercel donné à Paul, une PR par séance.
5. **Impeccable** — `impeccable detect --json` sur les fichiers touchés : 0
   finding non traité ; critique : score Nielsen « contrôle utilisateur » ≥ 3.

## 5. ⑤ Ce qu'on ne fait PAS

- **Pas de second moteur, pas de bibliothèque 3D, pas de canvas** : `ciel.js`
  reste le seul, alimenté par l'adaptateur (LV4 §1, jamais défait).
- **On ne touche pas au registre** (21 nœuds) ni à l'ordre des étages.
- **On ne desserre pas le fail-closed** : sans session, aucun astre de dépôt.
- **On ne redonne pas de cadrage à Léo-écrit** : c'est le J3 du 22/09.
- **Pas de « graphe complet »** entre étoiles, pas de tracé d'orbites, pas de
  nom en manuscrit : registre antique et sérieux, sans clin d'œil.
- **On ne refond pas RIVEN** — même moteur, autre écran, ses assertions sont
  le garde-fou, pas la cible.
- **Aucune migration, aucune écriture en base.**

## 6. ⑥ Pre-mortem — « la carte céleste a échoué : pourquoi ? »

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **On corrige le clic en agrandissant les cibles** — ça ne change rien (M3), et on croit avoir fini. | Le harnais mesure le **déplacement après survol**, pas la taille de la zone. |
| 2 | **Le survol retiré, Paul perd l'aperçu** qu'il avait au 13/08 et le vit comme une régression. | A1 est un arbitrage de Paul, pas le mien ; l'option « ne recentre plus » reste sur la table avec son coût. |
| 3 | **Les traits d'astérisme deviennent un plat de nouilles** à 24 étoiles. | Un **arbre** (n − 1 traits), le pire cas construit dans la maquette ET dans le harnais. |
| 4 | **La hiérarchie d'éclat devient un thermomètre** : le quadrant délaissé pâlit — un reproche silencieux. | Règle ③ d'ALTHEA : le repos est sans marque ; seul le signal Finubar colore (déjà arbitré le 20/08, LV6 §7 q.4). |
| 5 | **On touche `ciel.js` « juste un peu » et RIVEN casse.** | Option par défaut inactive, `smoke-ciel` 71/71 avant/après — trois écrans partagent le moteur. |
| 6 | **La maquette redessine son propre ciel** et fait juger une régression que personne n'a décidée (12/08). | Elle importe le vrai moteur et le vrai registre ; un contrôle vérifie que ses classes existent mot pour mot dans la production. |
| 7 | **Le dépliage retiré à la racine casse une assertion de `smoke-lv4-ciel`** qui parlait de navigation, pas de survol. | Reprise une à une (méthode de l'arbre, sept sauvées sur 55). |
| 8 | **`impeccable init` écrit une vérité produit inventée** parce que Paul n'était pas là. | Init ne tourne qu'en entretien ; jusqu'au lot 0, aucun `shape`. |
| 9 | **Le lien `#<dépôt>` marche en local et pas en prod** — la greffe dépend du délai réel de `/api/finubar`. | Le correctif attend la greffe (promesse), pas un délai ; le harnais retarde le stub de 800 ms et exige l'isolement. |
| 10 | **Squash-merge** : la branche repart de `origin/main` avant tout nouveau commit. | Règle du 22/07 ; `dernier_arret.commit` = SHA de `main`, jamais de la branche (15/09). |
| 11 | **Le mobile n'a pas été mesuré** et le lot 1 se déclare fini sur desktop. | Le tap est dans le harnais (critère 1) ; « non mesuré » est écrit ici, pas tu. |
| 12 | **Le cadrage se périme** : l'agrégat du 24/09 bouge d'ici le lot 3. | Les chiffres portent leur date ; M5 se re-mesure à l'ouverture du lot 3. |

## 7. Test POV — trois regards, Paul arbitre lesquels creuser

1. 🗡️ **L'adversaire** — *« votre clic exact, je le casse en glissant »*. Le
   seuil de glissement est de 4 px (`ciel.js` l. 1070) : un doigt qui tremble
   sur un tap ne déclenche rien, et rien ne le dit. Objection : et si le
   survol retiré, le **glissement** devient la prochaine « sélection pas
   bonne » ? → le harnais du lot 1 doit rejouer un tap de 6 px.
2. 👤 **Paul au téléphone, le soir** — *« je veux voir mes 10 dépôts sans
   descendre deux fois »*. Objection : la règle « un étage par clic » (31/08)
   contredit « ≤ 2 clics pour tout voir » dès que RENOBOOST IA gagne un 6ᵉ
   dépôt. Faut-il une **vue à plat** de tous les astres (un « tout voir » des
   dépôts) à côté de la plongée ? → arbitrage A4.
3. 🔧 **Le mainteneur en décembre** — *« pourquoi trois endroits décident du
   dessin ? »* (`ciel.js`, `adaptateur-lv4`, `ciel-noeud`). Objection : si
   les traits vivent dans l'adaptateur et l'éclat dans le moteur, la figure se
   règle à deux endroits. → le lot 2 écrit **où vit chaque règle** avant de
   coder (§3), et un seul fichier porte le gabarit.

## 8. Les arbitrages attendus de Paul — AVANT le lot 1

| # | La question | Ma recommandation |
|---|---|---|
| **A1** | Le dépliage au survol : **retiré** de la racine (comme sous isolement), ou **gardé sans recentrage** ? | **Retiré.** C'est le geste que tu décris (« je clique, ça zoome, ça affiche »), et c'est déjà le comportement sous isolement depuis le 31/08. Le survol garde le cartouche de Léo. |
| **A2** | La figure : un **arbre** de traits (tête → caps, n − 1 traits) ou une figure **dessinée à la main** par constellation (comme les vraies cartes) ? | **L'arbre**, calculé — une figure à la main pour 21 nœuds + 10 dépôts se périme au premier ajout. La main reste possible plus tard, par constellation, si l'arbre déçoit sur capture. |
| **A3** | `PRODUCT.md` (exigé par impeccable) **remplace** `PRODUIT.md` — qui décrit la carte RIVEN de juillet — ou vit à côté ? | **Remplace** (un fichier, une vérité — EB). `PRODUIT.md` est périmé depuis le 12/07 ; sa disparition se note dans `CADRAGE-ULTIMA.md`. Se fait en entretien, lot 0. |
| **A4** | Une vue **à plat de tous les dépôts** (10 astres d'un coup) en plus de la plongée un étage par clic ? | **Pas dans ce cadrage.** ≤ 2 clics suffit aujourd'hui ; on l'ouvre le jour où un ciel dépasse 8 astres. |
| **A5** | L'éclat d'une étoile dit quoi ? **Son rang** (tête > cap) · **son signal** Finubar (déjà) · **rien** (pairs) | **Rang + signal**, jamais la fraîcheur : un délaissé qui pâlit est un reproche (LV6 §7 q.4). |
| **A6** | L'ordre : lot 1 seul d'abord (une séance courte, un correctif prouvé), puis lots 0 + 2 ? | **Oui.** Le lot 1 se prouve en une séance et ferme le défaut que tu vois tous les jours ; le lot 2 attend l'entretien du lot 0. |

## 9. La prochaine action, unique

**Paul rend A1 et A6** (les deux tiennent en un mot chacun). Au go : ouvrir le
**lot 1** — le harnais `smoke-clic-exact` écrit **en premier**, vu rouge 4/5,
puis le correctif, puis le patrimoine complet, puis le preview Vercel. Une
séance, une PR.

---

## 10. Le brief `shape` (impeccable, phase 3) — reproduit ici pour ne pas le perdre

- **Job et audience** — Paul, seul utilisateur, plusieurs fois par jour, souvent
  au téléphone le soir. Mode **Operate** : il vient *aller quelque part* (un
  quadrant, un dépôt), pas contempler.
- **Résultat et preuve** — l'action première est *cliquer une étoile et arriver
  où elle mène* ; la preuve est un harnais qui rejoue les gestes réels.
- **Direction retenue** — monde **établi** (carte savante, encre, or pâle,
  Georgia) : on l'étend, on ne le remplace pas. Thèse : *une constellation est
  une figure, pas un nuage*. Moment focal : l'isolement — la figure se dessine
  quand on plonge.
- **Périmètre** — `ultima.html`, `alpha.html`, `index.html` et les coques ; RIVEN
  intouché ; aucune identité nouvelle.
- **États et gammes** — 2 à 6 étoiles par écran réel, 24 au pire cas ; états :
  appel Finubar, passerelle, focus clavier, sans session, `reduced-motion`.
- **Interaction** — survol = cartouche seulement ; clic = plonger ou ouvrir ;
  Échap / clic dans le vide / fil = remonter ; l'adresse suit.
- **Contraintes et choix à ne pas inventer** — A1 à A6 ci-dessus.

---

## 11. Arbitrages rendus par Paul le 25/09 (soir) — et le lot 1 précisé à la ligne

| # | Décision de Paul | Effet |
|---|---|---|
| **A1** | « go reco » → **le dépliage au survol est retiré** de la racine des coques, comme il l'est déjà sous isolement depuis le 31/08. | Le survol ne montre plus que le cartouche de Léo ; le clic plonge. |
| **A6** | « cadrage d'abord et précision du travail, **pas de travail sans mon go explicite** ». | ⛔ **Gate absolu** : ce paragraphe précise le lot 1 ; **aucune ligne de code ne s'écrit avant un go explicite de Paul**, ni sur ce lot ni sur les suivants. A2 à A5 restent ouverts. |

### Lot 1 — le travail, précisé (lu dans le code le 25/09, rien de déduit)

**Ce qui se retire** — `js/ciel-noeud.mjs`, et lui seul :

| Ligne | Aujourd'hui | Après |
|---|---|---|
| 443 | `mouseenter` → `minuteur = setTimeout(() => deplier(id), SURVOL_MS)` | le `mouseenter` ne fait plus que `montrer()` |
| 452 | `focus` → `focusARendre = id; deplier(id)` | le `focus` ne fait plus que `montrer()` — clavier = souris, dans les deux sens |
| 72 · 113 · 463-472 | `SURVOL_MS`, `let deplie`, `minuteur`, `focusARendre`, `function deplier` | **retirés** : un dépliage qui n'est plus appelé est du code mort, et le code mort se lit comme une capacité |
| 345 | `versCiel(idNoeud, registre, { deplie, isole })` | `versCiel(idNoeud, registre, { isole })` |

**Ce qui ne bouge PAS, et pourquoi** : `js/adaptateur-lv4.mjs` garde son option
`deplie` (l. 198-231) — elle est **pure, tenue par **6 verdicts** (sur 49) de
`tests/unit-adaptateur-lv4.mjs`, et la maquette `design/preview-lv4-ciel-deplie.html`
(harnais `smoke-lv4-ciel`) s'en sert encore. La retirer serait un second lot,
avec sa propre reprise d'assertions. ⚠️ Elle devient une option **sans appelant
en production** : c'est écrit ici pour qu'on ne la croie pas active.

**Le harnais, écrit AVANT le correctif** — `tests/smoke-clic-exact.mjs`, enrôlé
dans `tests/lancer.sh` par sa seule présence (`smoke-*.mjs`) :

| Verdict | Attendu AVANT (rouge) | Attendu APRÈS (vert) |
|---|---|---|
| Clic instantané au centre de NAGA → `#naga`, 3 étoiles | ✗ | ✓ |
| Survol 400 ms puis clic à la position **d'avant** le survol | ✗ | ✓ |
| Appui 150 ms (clic humain) | ✗ | ✓ |
| `locator.click` sur `g[data-noeud-id="naga"]` | ✗ | ✓ |
| Même série sur **GRIMA** | ✗ | ✓ |
| **Déplacement de l'étoile survolée = 0 px** (mesuré à 16, 100, 250, 500 ms) | ✗ (119 px) | ✓ |
| **Tap tactile** (`hasTouch`, `page.tap`) → isole | à mesurer | ✓ |
| Tap **glissé de 6 px** (POV adversaire) → **rien**, et un libellé le dit ? | à mesurer | verdict écrit après mesure |
| **Témoin** : sur `#naga`, survol de TAO = 0 px, clic → `#tao` | ✓ | ✓ (doit rester vert : un harnais qui ne sait que rougir ne prouve rien) |
| Focus clavier sur NAGA puis Entrée → `#naga`, le focus retombe sur la 1ʳᵉ étoile | à mesurer | ✓ |

⛔ **Le rouge se constate d'abord, il ne se suppose pas** : le harnais tourne une
fois sur `main` et son décompte (attendu **4 gestes sur 5** sur NAGA) est écrit
dans le rapport avant la première ligne du correctif.

**Les assertions à reprendre une à une** (jamais supprimées en bloc) :

| Harnais | Ligne | Assertion | Sort |
|---|---|---|---|
| `tests/smoke-lv4-coque.mjs` | 181-186 | « Le survol déplie ce que le cap contient » | **inversée** : le survol ne déplie plus, le compte d'objets reste `CAPS.length` |
| `tests/smoke-lv4-coque.mjs` | 187-188 | les caps restent présents après survol | **gardée** telle quelle |
| `tests/smoke-lv4-coque.mjs` | 163-180 | Léo nomme le cap survolé / au focus | **gardée** — c'est ce que le survol fait encore |
| `tests/smoke-lv4-ciel.mjs` | — | tourne sur la **maquette**, pas sur la coque | **intouché** |
| `tests/smoke-lv5-plein-ecran.mjs` | — | 0 occurrence de « dépli » | **intouché** |

**Critère de sortie du lot 1** : `smoke-clic-exact` 100 % vert · `smoke-lv4-coque`
vert avec son assertion inversée · patrimoine complet (`bash tests/lancer.sh`)
sortie 0 · preview Vercel donné à Paul avec le geste à faire (« clique NAGA sans
attendre »). ⚠️ Ce qu'il ne prouvera pas : le tap sur un **vrai** téléphone —
Chromium simule le toucher, il ne le remplace pas ; c'est Paul qui recette.

**Ce que le lot 1 ne fait pas** : aucun trait, aucun éclat, aucune option moteur
(lot 2) ; `alpha.html#renoboost-ia` (lot 3) ; `PRODUIT.md` (lot 0).

---

## 12. Dry run DR — 21:13 UTC, sur ce document (palier 20 min)

**Sondé** : les 22 numéros de ligne cités (`ciel-noeud.mjs`, `adaptateur-lv4.mjs`,
`ciel.js`, `smoke-lv4-coque.mjs`), les comptes de verdicts, le chevauchement
d'ALPHA avec session, le déclencheur du job `browser` de la CI.

**Cédé, et corrigé sur place :**
1. ⛔ **« 13 verdicts »** sur l'option `deplie` de l'adaptateur était un compte de
   LIGNES contenant « depli » (`grep -c`), pas de verdicts. Mesuré : **6 `dit(`
   sur 49**. Une preuve fausse coûte plus qu'une preuve absente — corrigé.
2. ⚠️ **« `smoke-ciel` 54 assertions »** était recopié des cadrages LV4/LV6
   (chiffre du 11/08). Mesuré aujourd'hui : **71 verdicts**. Le garde-fou est
   plus large qu'écrit ; toutes les occurrences portent maintenant 71.
3. ⚠️ **« 0 chevauchement … ALPHA avec session »** n'avait PAS été mesuré :
   la mesure de chevauchement ne tournait que sur l'agrégat vide. Re-mesuré
   avec l'agrégat réel et une session, aux deux largeurs : l'affirmation
   tient (0 / 0 / 0), et elle porte désormais sa mesure.
4. Le seuil de glissement est à la ligne **1070**, pas 1071 (1071 est l'effet).

**Résisté** : les 22 lignes citées désignent bien ce qu'elles disent ; `lancer.sh`
enrôle tout `smoke-*.mjs` par sa présence ; la CI `browser` lance
`npm run test:browser` après `playwright install`, donc un harnais neuf y
tourne sans réglage ; `smoke-lv5-plein-ecran` ne parle pas du dépliage.

**Ce que ce dry run ne voit pas** : le preview Vercel (proxy), le tap sur un
vrai téléphone.

---

## 13. Lot 1 — LIVRÉ le 25/09 au soir, sur go explicite de Paul (mesuré)

**Le harnais d'abord, vu rouge.** `tests/smoke-clic-exact.mjs` a tourné sur
`main` (`8698739`) AVANT la première ligne du correctif : **15 verdicts rouges
sur 21**. Pas 4 sur 5 : le tap tactile échouait aussi (le tap émet les
événements souris de compatibilité, donc le survol, donc le re-dessin), et le
focus clavier redessinait le ciel. GRIMA se déplaçait de **965 px** après
survol, NAGA de 118. Le témoin (`#naga`, TAO : 0 px, clic exact) était vert —
il l'est resté après.

**Le correctif, en deux temps — et le second n'était PAS dans le §11.**

| Temps | Fichier | Ce qui change | Résultat |
|---|---|---|---|
| 1 | `js/ciel-noeud.mjs` | `SURVOL_MS`, `deplie`, `minuteur`, `focusARendre`, `deplier()` retirés ; `mouseenter` et `focus` ne font plus que `montrer()` ; `versCiel(…, { isole })` | 15 rouges → **2** |
| 2 | `js/ciel.js` l. 1025 | `focusin` ne **vise** l'étoile que si `g.matches(':focus-visible')` | 2 rouges → **0** |

⛔ **L'écart au §11, dit en toutes lettres** : le §11 promettait « `js/ciel.js`
intouché au lot 1 ». Les deux rouges restants étaient l'**appui de 150 ms** —
un clic humain. Mesuré : au `mousedown`, Chromium donne le focus à l'étoile ;
le moteur `viser()` la recentrait ; NAGA partait de **176 → 630 px en 300 ms**
et le relâchement tombait dans le vide. Un clic instantané passait, un clic
réel non — « parfois », disait Paul. La garde `:focus-visible` (faux sur un
focus donné par un pointeur, vrai sur un focus donné par Tab) est la
discrimination que le navigateur fournit lui-même ; elle tient en une
condition, et le clavier garde sa visée. **Ce choix est soumis à Paul au moment
de la fusion, pas glissé.** `smoke-ciel` (RIVEN, même moteur) : **71/71 avant
et après** — une seule assertion reprise, pas supprimée (le focus programmatique
du harnais est précédé d'une touche neutre, pour être un focus *clavier*).

**Les assertions reprises une à une** : `smoke-lv4-coque` « le survol déplie »
→ **inversée** (« le survol ne déplie plus : le ciel garde ses seuls caps »),
deux voisines gardées ; `smoke-ciel` § clavier : une ligne ajoutée. Aucune
assertion supprimée.

**Mesures de sortie** : `smoke-clic-exact` **21/21** · déplacement après survol
**0 px** à 16, 100, 250 et 500 ms · tap → isolé · tap glissé de 6 px → rien
(rotation, seuil 4 px — le POV adversaire du §7 est couvert, par événements
synthétiques et non par un vrai doigt) · patrimoine complet **41 suites
unitaires + 46 harnais navigateur, sortie 0**.

**Dry run DR (22:06)** — sondé : le diff en adversaire, l'enrôlement du harnais,
le témoin. Cédé et corrigé : `idsDuNiveau` était devenu une variable **assignée
et jamais lue** (le garde qu'elle servait a disparu avec `deplier`) ; un
commentaire d'`eteindreSauf` parlait encore d'un « aperçu déplié ». Résisté :
`lancer.sh` enrôle `smoke-clic-exact` par sa seule présence (vu dans le log),
le témoin reste vert, `adaptateur-lv4` garde son option `deplie` intacte
(6 verdicts) avec un commentaire qui explique pourquoi on ne déplie pas au
survol — toujours juste.

**Ce que ce lot ne prouve pas** : le tap sur un vrai téléphone (Chromium simule
le toucher). C'est Paul qui recette, sur le preview : *clique NAGA sans
attendre, puis GRIMA — chaque clic doit plonger, du premier coup.*
