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
unitaires + 43 harnais navigateur, sortie 0** *(corrigé le 26/09 : « 46 »
comptait trois lignes de verdict comme des harnais — `ls tests/smoke-*.mjs` en
donne 43)*.

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

---

## 14. A2 à A5 rendus (26/09) — et les lots 0, 2, 3 précisés à la ligne

| # | Décision de Paul (26/09, « reco ») | Ce qu'elle engage |
|---|---|---|
| **A2** | La figure est un **arbre calculé** (n − 1 traits par constellation). | Lot 2 |
| **A3** | `PRODUCT.md` **remplace** `PRODUIT.md` pour la vérité produit. | Lot 0 — précisé ci-dessous : les contrats techniques ne disparaissent pas |
| **A4** | **Pas** de vue à plat de tous les dépôts dans ce cadrage. | Rouvert le jour où un ciel dépasse 8 astres |
| **A5** | L'éclat dit **le rang et le signal**, jamais la fraîcheur. | Lot 2 |

⛔ **A6 tient toujours** : ce paragraphe précise, il n'ouvre rien. Chaque lot
attend un go explicite. Ordre recommandé : **0 → 2 → 3** (le lot 0 est un
entretien de vingt minutes, et impeccable refuse `shape`/`critique` sans lui).

### 14.0 Trois constats lus ce matin dans le code, qui corrigent le plan

1. **Les étoiles de navigation sont posées sur une COURONNE**, pas en figure.
   `couronne: true` (`js/ciel-noeud.mjs`, options du moteur) appelle
   `disposerEnCouronne` (`js/ciel.js`, l. 288 au commit `76776ca`) : n points sur une ellipse,
   répartis à angles égaux, les noms longs aux positions verticales. C'est un
   standard **tranché par Paul le 17/08** (« les mêmes standards partout ») pour
   de bonnes raisons mesurées — l'occupation du cadre et la largeur des noms.
   ⇒ Un arbre calculé sur une couronne donne **un arc** : l'anneau moins son plus
   long côté. C'est une figure, mais c'est encore un anneau. Ce que Paul appelle
   « constellations brutes » est, pour une bonne part, **la couronne elle-même**.
   D'où l'arbitrage **A8** (§14.2) — et il se tranche sur capture, pas avant.
2. **La taille d'une étoile vient de son nombre de liens** (`magnitudes`, l. 387 ;
   rayon l. 1259-1260, au commit `76776ca` : `R_ETOILE_MIN + (mag / magMax) × 3,2`). Aujourd'hui les
   écrans de navigation n'ont aucun lien : toutes les étoiles ont la même taille.
   ⛔ **Si les traits d'astérisme passaient par `relations`, l'étoile au milieu
   d'une chaîne grossirait par accident** — un éclat qui ne dirait rien, sinon la
   forme de l'arbre. Les traits vivent donc **hors** de `relations`, et le rang
   entre par un champ **explicite**.
3. **`PRODUIT.md` n'est pas qu'une vision périmée.** Il porte aussi le **modèle de
   données** (l. 34), le **contrat d'API** (l. 118) et les **conventions du front**
   (l. 134 — lignes d'avant le lot 0, qui a réduit le fichier) — et **quatre agents** le déclarent « contexte obligatoire »
   (`graphisme`, `interface-ux`, `front-carto`, `leo`). Le supprimer effacerait
   leur contrat. ⇒ A3 se précise sans se renverser : **la vérité produit va dans
   `PRODUCT.md`, les contrats techniques restent dans `PRODUIT.md`**, réduit à eux.

### 14.1 Lot 0 — `impeccable init` : `PRODUCT.md` (un entretien, une séance courte)

**Ce qui se fait, dans l'ordre :**

1. `impeccable context --target ultima.html` (skill dans
   `artisan-builder/.claude/skills/impeccable`, cwd `Ultima-`), puis
   `reference/init.md`.
2. **Un seul tour de trois questions**, posé avec l'outil de questions, chacune
   **pré-remplie** d'une inférence tirée du dépôt, à confirmer ou corriger — init
   interdit d'écrire `PRODUCT.md` sans une vraie réponse :

   | Question d'init | Inférence proposée (source) |
   |---|---|
   | Qui, dans quelle situation, pour quel travail ? | Paul seul, mono-utilisateur (`PRODUIT.md` §Personas, 03/07), plusieurs fois par jour, souvent au téléphone le soir ; il vient **s'orienter et agir** sur sa data pro et perso. |
   | Ce que le produit rend possible, que rien d'autre ne peut prétendre ? | **L'unique interface de travail**, qui absorbe toute la data et la dispatche, avec **un seul interlocuteur**, Léo ; rien d'autre ne sera créé (Directive JL, `CLAUDE.md`). |
   | Ce qui doit durer ? | Registre **antique et sérieux** (acté 08/07) · sécurité relevée, finance + intime (`CADRAGE-CONSOLE.md` §5) · « Ultima compte, elle ne reproche pas » (règle ③ d'ALTHEA) · le ciel est la navigation (LV4-LV6). |

3. **Écrire `PRODUCT.md`** au gabarit d'init : `Platform: web` (PWA —
   `manifest.webmanifest`) ; **pas** de section `Stack` (le code existant répond) ;
   `Evidence on Hand` dit aussi ce qui **n'existe pas** et ne doit pas s'inventer.
4. **Réduire `PRODUIT.md`** à ses trois sections techniques, sous un en-tête qui
   renvoie la vérité produit à `PRODUCT.md`. Vision, personas, user stories,
   « Interface v3 » (boussole, 06/07) et hors-périmètre P0 en sortent — ils
   restent lisibles dans l'historique git.
5. **Mettre à jour les renvois vivants**, et eux seuls : `CLAUDE.md` l. 116 et
   les quatre agents pointent `PRODUCT.md` pour le produit, `PRODUIT.md` pour les
   contrats ; `ROADMAP-SITE.md` l. 25 idem. ⛔ **Les archives datées ne se
   réécrivent pas** (`REFONTE-ACCUEIL.md`, `AUDIT-2026-08-13.md`,
   `design/spec-registre-antique-serieux.md`) : elles ne valent que par leur
   exactitude au jour où elles ont été écrites.

**Ce qui ne se fait pas** : aucun `DESIGN.md` (init l'interdit ; `document` est
une autre commande, offerte après), aucune direction visuelle, aucun code.

**Critère de sortie** : `impeccable context` ne rend plus `NO_PRODUCT_MD` ; chaque
fait de `PRODUCT.md` cite sa source ou la réponse de Paul ; `grep -rn PRODUIT.md`
ne trouve plus de renvoi vivant vers une section qui a quitté le fichier.

### 14.2 Lot 2 — la figure (la maquette d'abord, le code ensuite)

**Où vit chaque règle — une seule fois chacune :**

| Règle | Fichier | Forme |
|---|---|---|
| Le **rang** (A5) : un cap qui CONTIENT est une tête, les autres des feuilles | `js/adaptateur-lv4.mjs` (`versCiel` et `isolement`) | un champ `poids` par nœud : `1` s'il a des enfants, `0` sinon — lu dans le registre, jamais deviné |
| L'**éclat par le rang** | `js/ciel.js`, calcul du `rayon` des étoiles | option `eclatParPoids`, **inactive par défaut** : la taille lit `poids` au lieu du nombre de liens ; amplitude réglée sur la maquette |
| L'**arbre** (A2) | `js/ciel.js` | fonction **pure** `asterisme(points)` — arbre couvrant minimal (Prim, n ≤ 24), calculé **par constellation** sur les coordonnées **planes** de la disposition, donc sans croisement ; exposée sur `window.UltimaCiel` pour être testée sans DOM |
| Le **tracé** des traits | `js/ciel.js` | option `asterisme`, **inactive par défaut** : un groupe `ciel-asterisme` à part, `aria-hidden`, or pâle `#d8bd82` déjà employé, ~0,6 px, opacité ~0,35 ; **hors de `relations`** (constat 2) et **non allumé au survol** |
| La **disposition** (A8) | `js/ciel.js` | la couronne reste ; une variante `disposition: 'figure'`, déterministe (graine = id), n'existe que si A8 la retient |
| Qui active | `js/ciel-noeud.mjs` | les options, sur les coques de navigation seulement — **RIVEN ne change pas** |

**Ce que le rang change vraiment, mesuré aujourd'hui dans le registre :**

| Écran | Caps (enfants) | Effet du rang |
|---|---|---|
| ULTIMA | GRIMA (2) · NAGA (3) | **aucun** — deux têtes |
| NAGA isolé | IMLADRIK (3) · ADRAMELECH (3) · TAO (2) | **aucun** — trois têtes |
| GRIMA isolé | RIVEN (0) · NICOL BOLAS (4) | NICOL BOLAS plus vif |
| ALPHA, avec session | RENOBOOST IA (5 après greffe) · YCOME (0) · 4 astres (0) | RENOBOOST IA plus vif ; les astres portent déjà leur couleur Finubar |
| Racine | ULTIMA (2) · ALPHA (2) · ALTHEA (0) | ALTHEA moins vive |

⚠️ **Sur NAGA — l'écran cité par Paul — le rang ne change rien** : ses trois
caps contiennent tous quelque chose. La figure y viendra de l'arbre et de la
disposition, pas de l'éclat. Le dire maintenant évite d'attendre de A5 ce
qu'elle ne peut pas donner.

**Les étapes :**

1. **Harnais pur d'abord** : `tests/unit-asterisme.mjs` — n − 1 arêtes, connexe,
   déterministe, **aucun croisement**, cas n = 0, 1, 2 et 24 ; vu rouge sur une
   fonction volontairement fausse avant d'être cru.
2. **La maquette** `design/preview-carte-celeste.html` : elle charge le **vrai**
   `js/ciel.js` et le **vrai** registre, et montre **côte à côte deux variantes**
   sur les six écrans réels et le pire cas à 24 :
   **V1** couronne + arbre + éclat · **V2** figure + arbre + éclat.
   Bandeau de mesure : occupation du cadre, noms qui se chevauchent, noms hors
   cadre, contraste AA, cibles ≥ 24 px — **les mêmes critères qui ont fondé la
   couronne le 17/08**, pour que V2 soit jugée sur ce que V1 garantit déjà.
3. **Passe impeccable** sur la maquette : `critique` (deux sous-agents isolés +
   `impeccable detect`), puis `polish`. Monde **établi** : on l'étend
   (`new-work.md`, « extend an existing surface ») — aucun tournoi de directions.
   `craft-floor.md` est relu avant la première retouche d'interface.
4. **→ Arbitrage A8 de Paul, sur capture** (voir plus bas).
5. Le code de la variante retenue, les options activées sur les coques,
   `tests/smoke-carte-celeste.mjs` (DOM : n − 1 traits par écran, aucun trait
   vers une étoile absente, rien de nouveau en `reduced-motion` qui bouge).

**Critères de sortie** : `unit-asterisme` et `smoke-carte-celeste` verts, vus
rouges d'abord ; **`smoke-ciel` 71/71 avant et après** (RIVEN, options
inactives) ; `smoke-clic-exact` 21/21 (la figure ne doit pas faire revenir un
re-dessin sous le curseur) ; patrimoine complet sortie 0 ; preview donné à Paul.

**A8 — la disposition** (nouvel arbitrage, **sur capture**, jamais avant) :

| Variante | Ce qu'elle garde | Ce qu'elle coûte |
|---|---|---|
| **V1 — couronne + arbre** | tout ce que le 17/08 a mesuré | reste un anneau ; c'est peut-être le « brut » |
| **V2 — figure + arbre** | l'arbre, l'éclat, les noms | rouvre un standard tranché ; doit **égaler** l'occupation et les noms de V1 |

Recommandation **suspendue** : elle se forme en regardant les deux captures, et
V2 n'est retenue que si elle égale V1 sur les critères mesurés.

### 14.3 Lot 3 — les dépôts partout

**Ce qui se fait :**

1. **`alpha.html#renoboost-ia` isole après la greffe.** L'adresse est lue une
   fois (`js/ciel-noeud.mjs` l. 630), **avant** que `/api/finubar` n'ait greffé
   les astres (l. 683) : RENOBOOST IA n'a alors pas d'enfants, `idDeLAdresse`
   (l. 565) répond `null`, et le lien s'ouvre sur ALPHA entier. Correctif : juste
   après la greffe, si aucun foyer n'est posé, relire l'adresse et poser le foyer
   (`sansHistorique`). `idDeLAdresse` garde sa triple garde telle quelle.
2. **Le harnais** : stub `/api/finubar` **retardé de 800 ms** + session ; attendu
   `#renoboost-ia` → 5 astres + LE SITE, et rien d'autre. Vu rouge d'abord.
3. **Mesurer « chaque dépôt en ≤ 2 clics »** depuis la racine, avec l'agrégat
   réel — une ligne du harnais, pas une impression.

**A7 — ce que le lot 3 ne fait PLUS** (nouvel arbitrage, recommandation ferme) :
le §2 promettait que l'étoile d'un dépôt « dit ce que Léo peut y faire ».
⛔ **Aucune donnée ne le porte.** Les anneaux de droits (vert / orange / rouge)
sont un **cadrage** du 22/09, pas un état du système — J3 « Léo écrit » n'est pas
construit, et un astre a `cible: null` (« un astre est un état, pas une porte »,
`js/adaptateur-finubar.mjs`). Afficher « écriture verte » au survol, ce serait
annoncer une capacité qui n'existe pas. **Recommandation : retirer ce point du
lot 3** ; il revient avec J3, lu dans la donnée que J3 produira.

### 14.4 Registre des arbitrages ouverts

| # | Question | Quand | Reco |
|---|---|---|---|
| **A7** | Retirer du lot 3 « l'anneau de Léo au survol » ? | ✅ **rendu le 26/09 : oui** | il reviendra avec J3 |
| **A8** | Couronne + arbre, ou figure + arbre ? | **sur capture** de la maquette (lot 2) | suspendue |
| — | Go du **lot 0** (entretien impeccable init) | ✅ **rendu le 26/09** | livré — §15 |

---

## 15. Lot 0 — LIVRÉ le 26/09, sur go de Paul (« ok »)

**L'entretien d'init** : un tour de trois questions, posé avec l'outil de
questions, chacune pré-remplie d'une inférence du dépôt. **Les trois ont été
confirmées telles quelles** — Paul seul ; l'interface unique avec Léo pour seule
interlocutrice ; les quatre engagements (antique et sérieux, sécurité relevée,
compter sans reprocher, le ciel est la navigation).

| Fait | Fichier |
|---|---|
| Vérité produit écrite au gabarit d'init (schéma 1), `Platform: web`, sans section `Stack` | `PRODUCT.md` |
| Réduit de 144 à 58 lignes : modèle de données, contrat d'API, front — avec un en-tête qui dit ce qui est parti et où | `PRODUIT.md` |
| Renvois vivants mis à jour | `CLAUDE.md` · `ROADMAP-SITE.md` · agents `interface-ux`, `front-carto`, `graphisme`, `leo` |
| Archives datées **non** réécrites | `REFONTE-ACCUEIL.md` · `AUDIT-2026-08-13.md` · `design/spec-registre-antique-serieux.md` |

**Ce qui n'a pas été fait, et pourquoi** : aucun `DESIGN.md` (init l'interdit ;
`impeccable document` reste à offrir) ; aucun `buildPath` enregistré — la séance
n'a pas d'outil natif de génération d'image, donc le chemin est **code d'abord**,
et il n'est pas stocké (init : « une valeur tirée du silence est un défaut que
personne n'a posé »). **A7 rendu** : l'« anneau de Léo » sort du lot 3.

**Critère de sortie, mesuré** : `impeccable context` ne rend plus
`NO_PRODUCT_MD` (voir le commit) ; aucun renvoi vivant ne cite une section qui a
quitté `PRODUIT.md`.

**Suite** : lot 2 (la figure), au go de Paul — harnais pur d'abord, puis la
maquette V1 / V2, puis A8 sur capture.

---

## 16. Dry run DR — 11:21 UTC le 26/09, sur le §14 (palier 20 min)

**Sondé** : chaque « l. N » du §14 remesuré contre la tête de la branche ; les
chiffres du tableau « ce que le rang change » relus dans le registre ; les
promesses du §14 confrontées à ce que le code porte.

**Cédé, et corrigé sur place** : ⚠️ **les numéros de ligne du §14 avaient
périmé dans la journée**, parce que le lot 2 a ajouté ~180 lignes à `js/ciel.js`
(la couronne est passée de l. 288 à 339, `magnitudes` de 387 à 500, le rayon de
1259 à 1424) et que le lot 0 a réduit `PRODUIT.md` (ses trois sections sont
passées aux l. 14, 37, 53). Un renvoi « l. 288 » juste le matin désignait autre
chose l'après-midi. Les citations portent désormais **le commit où elles ont été
lues** (`76776ca`), et le tableau du §14.2 cite la **fonction**, pas la ligne.
⇒ Dans un cadrage qui précède un lot de code, une ligne citée se date par son
commit, sinon le lot qu'elle annonce la rend fausse.

**Résisté** : les renvois de `js/ciel-noeud.mjs` (l. 565, 630, 683) — ce fichier
n'a pas été touché, ils désignent toujours ce qu'ils disent ; `CLAUDE.md` l. 116
et `ROADMAP-SITE.md` l. 25 ; le tableau du rang (relu : GRIMA 2, NAGA 3,
NICOL BOLAS 4, RIVEN 0, ALTHEA 0) ; A7 — aucune donnée ne porte les anneaux de
droits, vérifié (`cible: null` des astres dans `js/adaptateur-finubar.mjs`).

---

## 17. Lot 2 — la figure : moteur prêt, maquette critiquée, A8 attend Paul (26/09)

**Go de Paul : « go lot 2 ».** Livré jusqu'à l'arbitrage A8, pas au-delà : rien
n'est activé sur les coques — la production n'affiche ni traits ni éclat par le
rang. Un seul défaut de production est corrigé en passant (le clavier,
ci-dessous) : il existait déjà, la figure l'a rendu visible.

### Ce qui a été construit

| Pièce | Où | Garde-fou |
|---|---|---|
| `asterisme(points)` — arbre couvrant minimal, pur | `js/ciel.js` | `tests/unit-asterisme.mjs`, écrit **avant**, vu rouge ; l'instrument refuse d'abord deux fausses figures ; deux sabotages rougissent |
| Options `asterisme`, `eclatParPoids`, `disposition: 'figure'` — **inactives par défaut** | `js/ciel.js` | `smoke-ciel` (RIVEN) vert, options non activées |
| `rang(noeud)` — 1 si le cap contient, 0 sinon | `js/adaptateur-lv4.mjs` | `unit-adaptateur-lv4` vert |
| La maquette V0 / V1 / V2 : vraie greffe, fixture inventée, couche d'appel | `design/preview-carte-celeste.*` | mesure embarquée, témoin « aujourd'hui » |

### La critique impeccable — deux évaluations isolées, puis vérifiées

Deux sous-agents isolés (A : revue de design ; B : détecteur + navigateur).
Détecteur : **0 constat** sur la maquette, en CLI comme dans le navigateur (le
témoin `ultima.html` en porte 3, préexistants). Revue de design : **20/36**,
« acceptable » — le monde est propre au produit, la figure l'était moins.

⛔ **Les constats lourds de la revue ont été VÉRIFIÉS par la mesure avant d'être
corrigés** — un rapport de sous-agent se vérifie, il ne se croit pas :

| Constat | Mesure avant | Correctif | Mesure après |
|---|---|---|---|
| **Le clavier couche la constellation** (Tab fait pivoter la caméra) | étendue **877 px → 0** sur NAGA — **en production** | `focusin` ne vise plus sur une couronne | 877 → 877 ; contrôle ajouté à `smoke-clic-exact`, **vu rouge d'abord** |
| **Le rang ne se voit pas** (la perspective l'emporte) | une feuille à 7,74 dépassait une tête à 6,88 | échelle commune ; puis le rang devient un **rapport sous le plafond** — le plafond à 9 écrasait têtes et feuilles (trois rayons à 7,74 sur la racine) | rang visible sur **tous** les écrans à deux rangs, aux deux largeurs |
| **Les traits traversent les noms** | 2 · 2 · 3 · 1 traversées | le trait s'arrête à la **sortie du rectangle du nom** (premier jet « s'il descend » : faux en diagonale, ADRAMELECH le montrait) | **0** sur tous les écrans réels |
| Traits en or, comme l'appel | — | encre parchemin `#cdc3ad`, déjà au produit ; l'or reste à « il y a quelque chose à faire » | vu sur capture, couche d'appel branchée |

**Et deux fautes d'instrument, trouvées en regardant les captures** : la mesure
écartait les noms pâles (0,25) et disait « 0 chevauchement » sur un pire cas où
deux noms se couvraient ; elle mesurait à 0,9 s, avant que la caméra ne se pose.
Corrigées dans la maquette, avec leur raison en commentaire.

### Ce que disent les mesures pour A8

| | V1 — couronne + arbre | V2 — figure + arbre |
|---|---|---|
| Occupation (écrans réels) | **égale à aujourd'hui** | plus basse sur 6 mesures sur 14 |
| Noms qui se chevauchent | **aucun ajouté** | **1 ajouté** (RENOBOOST IA au téléphone) |
| Traits n − 1, traits × noms, rang | tous tenus | tous tenus |
| Identité de la forme | NAGA et la racine dessinent le même chevron (revue A) | chaque constellation a sa silhouette |

**Selon la règle du §14.2, V2 ne se qualifie pas** : elle n'égale pas V1 sur les
critères mesurés. **Recommandation : V1**, et chercher l'identité ailleurs que
dans le déplacement des étoiles (A9, point 3). **C'est à Paul, sur capture.**

### Limites, nommément

- **Pire cas construit (24 étoiles)** : 16 à 21 traits sur 23 deviennent trop
  courts une fois retirés du halo et des noms, et sont masqués — la figure y
  disparaît. Aucun écran réel ne dépasse 6 étoiles aujourd'hui.
- Le pire cas porte **2 à 3 chevauchements de noms qui existaient déjà**
  (témoin « aujourd'hui »), non imputables au lot.
- Le **tap sur un vrai téléphone** n'est toujours pas prouvé.

### A9 — ce que la revue a trouvé hors de ce lot

1. **Les noms font 7,5 px au téléphone** (plancher de `ciel.js`) : illisibles le
   soir, alors que `PRODUCT.md` s'engage sur la lisibilité. Préexistant.
2. **Les noms d'étoiles sont en sans-serif gris**, quand ce sont les noms propres
   du produit ; la revue propose Georgia en capitales espacées, sur les écrans
   de navigation seulement (RIVEN garde le sien).
3. **Un cartouche qui nomme la figure** : l'identité d'une constellation sans
   déplacer ses étoiles.
4. **La question de la revue**, posée telle quelle : un ciel de navigation
   a-t-il besoin d'une caméra 3D, qui brouillait le rang et la figure ?

Recommandation : **1 et 2 dans un lot court, avant l'activation** (la
lisibilité d'abord) ; **3 avec l'activation de V1** ; **4 non**, tant que la
couronne protège (le clavier ne pivote plus, le rang ignore la profondeur).

### ⚠️ Un incident, rattrapé avant de coûter

Le serveur « live » d'impeccable, lancé par l'évaluation B, a écrit
`.impeccable/live/server.json` — un **jeton local** — et un `git add -A` l'a
embarqué dans un commit **jamais poussé**. Retiré de l'historique local,
`.impeccable/live/` ajouté au `.gitignore`. Rien n'a quitté le conteneur.

### Dry run DR du lot 2 (déclenché à 11:37, fait à 12:00)

**Sondé, et résisté** :
- `unit-asterisme` vu rouge sur une fonction absente, puis sur deux sabotages ;
- `smoke-ciel` (RIVEN) et `smoke-clic-exact` verts dans le patrimoine complet ;
- la maquette charge le vrai moteur (`../js/ciel.js`) ;
- **les traits sont bien hors de `relations`** — éprouvé du côté où ça pouvait
  céder : NAGA rendu sans puis avec l'astérisme, comptes de liens identiques (0),
  et rayons identiques **au chiffre près** entre la seconde mesure sans traits et
  la mesure avec. Le **témoin** (deux mesures sans traits) diffère, lui, de la
  même quantité : l'écart vient de la dérive lente du ciel, pas des traits.
  Sans ce témoin, on aurait conclu à tort que les traits changeaient la taille.

**Cédé** : rien de neuf — les failles de ce lot étaient celles de la critique,
déjà corrigées au §17.

---

## 18. A8 et A9 rendus (26/09, 12:10 UTC) — deux lots courts, précisés à la ligne

**Paul : « A8 reco, A9 reco ».** Consigné :

| # | Décision |
|---|---|
| **A8** | **V1 — couronne + arbre + éclat par le rang.** `disposerEnFigure` et `hacher` (`js/ciel.js` l. 429–446) sont **retirés** à l'activation : une variante que personne n'active est du code mort qu'on croira un jour disponible. |
| **A9** | **1 et 2 dans un lot court, AVANT l'activation** (lot 2a) ; **3 avec l'activation** (lot 2b) ; **4 non** — la caméra 3D reste. |

⛔ **Une décision n'est pas un go** (A6). Les deux lots ci-dessous attendent chacun
le sien.

### 18.1 Ce qui a été MESURÉ avant d'écrire le lot 2a (maquette, V1, 2 s de pose)

Taille réellement rendue des noms visibles, en **pixels CSS** (attribut
`font-size` × `getScreenCTM().a`) :

| Écran | 390 px : taille rendue | 390 px : nom le plus large / cadre | 1280 px |
|---|---|---|---|
| ULTIMA | 6,7 – 6,9 | 24 / 356 | 19,1 |
| NAGA | 7,2 – 8,8 | 52 / 356 | 19,1 |
| GRIMA | 6,5 – 6,7 | 46 / 356 | 19,1 |
| Racine | 7,9 – 9,7 | 36 / 356 | 19,1 |
| ALPHA | 6,5 – 6,7 | 53 / 356 | 19,1 |
| RENOBOOST IA | 6,7 – 8,2 | 53 / 356 | 19,1 |
| Pire cas (24) | 6,5 | 82 / 356 | 18,0 – 19,1 |

**Ce que ça dit, et ça corrige A9-1 tel que la revue l'avait posé :**
- le plancher `7.5` (l. 1509, 1559, 1595) est en **unités du viewBox**, pas en
  pixels : au téléphone le viewBox est plus large que l'écran (échelle ≈ 0,87),
  et le « plancher de lisibilité » rend **6,5 px** ;
- ce n'est **pas la place** qui tasse les noms : le plus large occupe 53 px sur
  356. C'est `10 * pr.echelle` (la perspective) qui les tire vers le plancher ;
- la police vue est **sans-serif** : `.ciel-nom` (`css/ciel.css` l. 211–219)
  l'emporte sur le Georgia posé sur le groupe (`js/ciel.js` l. 1082).

### 18.2 Lot 2a — les noms se lisent au téléphone (A9-1 et A9-2)

**① Le but** : sur les écrans de navigation, aucun nom visible sous **11 px CSS**,
à toute largeur ; les noms de caps en Georgia, capitales espacées ; RIVEN inchangé.

**② Les étapes**
1. **Harnais d'abord**, vu rouge sur `main` : `tests/smoke-noms-lisibles.mjs` —
   sur les six écrans réels à 390 et 1280 px, taille rendue ≥ 11 px CSS, police
   de la famille serif, zéro chevauchement de noms **ajouté** (témoin : le même
   écran avant le lot), zéro nom hors cadre. Verrou de non-vacuité : ≥ 2 noms
   mesurés par écran.
2. `js/ciel.js` : option `plancherNomPx` (**inactive par défaut**). Le plancher
   devient `max(7.5, plancherNomPx / échelleÉcran)`, l'échelle lue sur
   `getScreenCTM()` au cadrage (déjà relu à chaque redimensionnement). Les trois
   endroits qui écrivent `7.5` passent par **une** fonction — trois copies d'un
   seuil finissent par diverger.
3. `css/ciel-noeud.css` : sur les coques seulement, `.ciel-nom` en
   `Georgia, "Iowan Old Style", serif`, capitales, `letter-spacing` réglé sur la
   maquette. RIVEN (`css/ciel.css`) ne bouge pas.
4. `js/ciel-noeud.mjs` : `plancherNomPx: 11` dans les options des coques.
5. Maquette : les mêmes mesures, pire cas compris, **avant de pousser**.

**③ Les moyens** : `js/ciel.js`, `js/ciel-noeud.mjs`, `css/ciel-noeud.css`, un
harnais neuf, la maquette. Aucune donnée, aucune route, aucun secret.

**④ Critères de sortie** : `smoke-noms-lisibles` rouge sur `main`, vert après ;
`smoke-ciel` (RIVEN) **inchangé** ; `smoke-clic-exact` vert (les noms sont
`pointer-events: none`, il le prouve) ; patrimoine complet sortie 0 ; preview
donné, avec une capture 390 px de NAGA avant / après.

**⑤ Ce qu'on ne fait PAS** : ni traits, ni éclat, ni cartouche (lot 2b) ; ni
les noms de RIVEN ; ni les noms de constellation (`.ciel-nom-amas`, déjà en
Georgia) ; ni la caméra (A9-4).

**⑥ Pre-mortem**
- *Les noms grossis se chevauchent sur la couronne* → le harnais compte les
  chevauchements contre le témoin ; si le pire cas (24 × 20 caractères) cède,
  il cède déjà aujourd'hui (§17) — on le **dit**, on ne relève pas le plancher
  pour lui seul.
- *Les capitales élargissent un nom au-delà du cadre* → le repli de la l. 1559
  reste, mais **ne descend plus sous le plancher en px** ; s'il le faudrait, le
  nom se tronque (`tronquer`, déjà là) plutôt que de redevenir illisible.
- *Le seuil est juste à 1280 et faux à 390* (la leçon du « bon fond ») → le
  harnais mesure aux deux largeurs, et à 360 px.
- *Un sélecteur trop large touche RIVEN* → `smoke-ciel` inchangé est le témoin.

### 18.3 Lot 2b — l'activation de V1 (A8, A9-3)

1. `js/ciel-noeud.mjs` : `asterisme: true, eclatParPoids: true` sur les coques.
2. `js/ciel.js` : retrait de `disposerEnFigure` et `hacher`.
3. **A9-3, mesuré avant d'être construit** : les noms de constellation
   (`ciel-nom-amas`, Georgia, or pâle) existent déjà ; l'état isolant les éteint
   (`css/ciel-noeud.css` l. 305). On mesure s'ils **reviennent** une fois le foyer
   posé. S'ils nomment déjà la figure, **il n'y a rien à construire** (EB) ;
   sinon, un cartouche, et un seul.
4. `tests/smoke-carte-celeste.mjs` (§14.2 étape 5) : n − 1 traits par écran,
   aucun trait vers une étoile absente, rang visible, rien qui bouge en
   `reduced-motion` ; vu rouge sur la tête du lot 2a.

Critères : ceux du §14.2, plus la maquette et la production en accord sur les
mesures du §17.

### 18.4 Lot 3 — inchangé (§14.3), après 2b.

**La prochaine action, unique** : le go de Paul sur le **lot 2a**.

---

## 19. Lot 2a — LIVRÉ le 26/09, sur go de Paul (« go lot 2a »)

### Une correction du §18.1, d'abord

Le §18.1 écrivait « au téléphone le viewBox est plus large que l'écran
(échelle ≈ 0,87) ». **C'était vrai de la maquette, pas de la production** : en
production à 390 px, `getScreenCTM().a` vaut **1**, et les noms rendaient
**7,5 à 9,2 px**. L'échelle de 0,87 venait du cadre de la maquette. La conclusion
ne change pas (le plancher était trop bas et n'était pas exprimé en pixels) ; la
cause citée, si. Mesuré en ouvrant `ultima.html#naga` à 390 × 844.

### Ce qui a été fait

| Pièce | Où | Ce qu'elle fait |
|---|---|---|
| `plancherNom()` — **une** fonction pour les trois lecteurs du plancher | `js/ciel.js` | `max(7.5, plancherNomPx / échelle écran)` ; échelle lue sur `getScreenCTM`, mise en cache, relue à chaque redimensionnement ; **non retenue** tant que le SVG n'est pas dans le document |
| Le repli de largeur plafonné à 1 | `js/ciel.js` | il ne peut plus **grossir** un nom sur un écran où le plancher dépasserait le plafond |
| `plancherNomPx: 11` | `js/ciel-noeud.mjs` | sur les coques seulement ; RIVEN garde 7,5 |
| Noms gravés : Georgia, capitales, `.12em` | `css/ciel-noeud.css` | `.ciel-noeud-plateau .ciel-nom` ; ni la taille ni la couleur ne changent ici |
| Le harnais | `tests/smoke-noms-lisibles.mjs` | 5 écrans × 360 / 390 / 1280 : taille **rendue** ≥ 11 px, Georgia, capitales, zéro chevauchement, zéro hors cadre, verrou ≥ 2 noms |
| La maquette | `design/preview-carte-celeste.*` | porte le **vrai** plateau (`css/ciel-noeud.css`) au lieu d'une copie de la règle |

### Mesures

**Le harnais, vu rouge puis vert** : **40 rouges sur 91** avant le lot (7,5 px,
sans-serif, casse normale — chevauchements et hors cadre déjà verts : ce sont les
témoins) → **0 rouge sur 91** après. Minimum rendu : **11,0 px** à 360 et 390 ;
16,7 à 19,7 px à 1280 (inchangé : le plancher ne mord qu'au téléphone).

**La maquette, V0 et V1, 390 et 1280** : sur les six écrans réels, **0
chevauchement, 0 hors cadre, 0 trait × nom**, rang visible là où il y a deux
rangs ; occupation égale à V0 à 1280, et à ±0,03 à 390.

⚠️ **Le pire cas construit (24 étoiles × 20 caractères) cède un peu plus** :
**4 chevauchements**, contre 2 à 3 au §17. Des noms plus grands dans le même
anneau. Aucun écran réel n'en approche (6 étoiles au plus) ; le §18.2 disait
qu'on ne relèverait pas le plancher pour lui seul, et on ne le fait pas.

**Le patrimoine** : `npm test` **42/42** ; `bash tests/lancer.sh` sortie 0,
**44/44** harnais (les 43 d'hier + `smoke-noms-lisibles`) — dont `smoke-ciel`
(RIVEN, options non activées) et `smoke-clic-exact` 23/23 : les noms sont
`pointer-events: none`, le clic n'a pas bougé.

### Limites, nommément

- **L'échelle écran est mise en cache** : elle se relit au redimensionnement et à
  chaque nouveau rendu, pas quand la scène change de taille sans prévenir. C'est
  le contrat existant du moteur (le viewBox lui-même suit la même règle). Vu dans
  la maquette seulement : son tableau de mesure, en apparaissant, décale la scène
  de quelques pixels, et un nom y lit **10,9 px**. Aucune coque ne le fait.
- Le tap et la lecture sur un **vrai téléphone** ne sont pas prouvés : la session
  n'a qu'un Chromium.

### Dry run DR du lot 2a (palier 20 min, 12:32 → fait à 12:50)

**Cédé, et corrigé dans le passage** : le harnais ne mesurait qu'à 360, 390 et
1280 px. Or au-dessus de 320 px le viewBox vaut l'écran (échelle 1) : un moteur
qui **ignorerait** l'échelle y rend 11 px quand même. Sabotage joué (conversion
retirée) : **vert partout** sur trois largeurs. Ajouté 300 px, où le viewBox est
borné à 320 et l'échelle tombe à ~0,94 : le même sabotage donne **5 rouges**
(10,3 px). Un garde-fou s'éprouve du côté où il se contourne.

**Ajouté aussi** : ouvert à 1280 puis rétréci à 300 px, le plancher suit.
Sabotage (remise à zéro du cache retirée) : **1 rouge** (10,0 px).

**Résisté** : le harnais est découvert tout seul par `tests/lancer.sh` (CI
comprise) ; RIVEN (`smoke-ciel`) inchangé ; le clic exact 23/23.
Harnais final : **122 verdicts, 0 rouge**.

---

## 20. Le socle — plus rien ne se recouvre au bas de l'écran (26/09, capture de Paul)

**Paul, capture à l'appui (RENOBOOST IA isolé, session ouverte) :** *« beaucoup
de chevauchements, je ne suis pas fan — résous ça pour que ce soit clair, organisé
et ergonomique ; une fois fait, tu me montres. »*

### Ce qui était cassé — lu dans le code, puis mesuré

| Constat | Source |
|---|---|
| Le cartouche de parole se pose à « bandeau + 12 px »… et le dock de Léo **au même endroit** : ils se recouvrent **par construction** | `css/finubar-bandeau.css` l. 77 · `css/leo.css` l. 481 |
| Le cadrage du ciel ne connaissait pas le dock (arrivé après lui) | `margesDuMobilier`, `js/ciel-noeud.mjs` |
| La parole grandit avec son texte (139 px sur RENOBOOST IA) : le ciel réservait la hauteur du moment, un cap plus bavard recouvrait une étoile | `css/ciel-noeud.css` (`min-height` seul) |
| La recommandation de Léo était dite **deux fois** : dans le dock et dans la colonne « Léo — commençons par ça » du bandeau | `js/leo-navigation.mjs` · `js/finubar-bandeau.mjs` |
| Au téléphone, sur l'accueil, le ciel n'avait plus que **166 px sur 844**, et trois étoiles sous la parole | mesuré |

### Le parti pris — un SOCLE, une voix

1. **De bas en haut, sans recouvrement** : le bandeau Finubar, le dock de Léo, le
   cartouche de parole. Les deux hauteurs sont mesurées (`--fb-hauteur`,
   `--leo-dock-hauteur`), jamais supposées.
2. **Le ciel réserve tout le socle**, et recadre quand le bandeau ou le dock
   changent de taille — **jamais au survol** : la parole n'est pas observée, sa
   hauteur est fixe. Sinon l'étoile partirait sous le curseur (le clic raté du lot 1).
3. **Le cartouche de parole est compact et de hauteur fixe** (6,4 rem) : nom et
   état sur une ligne, résumé sur deux au plus, consigne épinglée en bas, et
   relisible (elle était en encre de parchemin sur la nuit).
4. **Une voix, une fois** : quand le dock porte la recommandation, le bandeau
   retire sa colonne « Léo » et rend la place aux signaux.
5. **Au téléphone, sur l'accueil seulement**, la parole se retire : un téléphone ne
   survole pas, et elle n'y redisait que le foyer, que le fil d'Ariane nomme déjà.
   Ailleurs (pas de bandeau), elle garde sa place au-dessus du dock.

### Mesures — `tests/smoke-socle.mjs` (écran de Paul reproduit : index, session, 6 dépôts sous RENOBOOST IA, dock monté)

**Rouge d'abord : 19 rouges sur 44** (parole × dock à toutes les tailles, étoiles
sous la parole à 390 px, recommandation dite deux fois partout) → **0 sur 44**.

| Écran | Hauteur de ciel libre avant | après |
|---|---|---|
| RENOBOOST IA · 1872 × 850 | 338 px, **avec** recouvrements | 309 px, sans |
| RENOBOOST IA · 1280 × 800 | 288 px, **avec** recouvrements | 259 px, sans |
| RENOBOOST IA · 390 × 844 | **166 px**, 2 étoiles sous la parole | **301 px** |

Le bureau rend ~30 px : c'est le prix d'un étage qui ne recouvre plus rien. Le
téléphone en gagne 135.

**Éprouvé du côté où ça cède** : la règle d'empilement retirée → **6 rouges** ;
le dock retiré du cadrage → **3 rouges**, dont une étoile sous le dock que le clic
n'atteint plus — exactement le symptôme de la capture.

**Et le survol ne déplace rien** (bureau, 1872 et 1280) : 0 étoile déplacée,
cartouche du survol sans recouvrement.

**Le patrimoine** : `npm test` **42/42** ; `bash tests/lancer.sh` sortie 0,
**45/45** harnais (les 44 d'avant + `smoke-socle`), dont `smoke-lv4-coque`,
`smoke-accueil-finubar`, `smoke-leo-partout` et `smoke-clic-exact` inchangés.

### Limites, nommément

- Le dock est **monté par le harnais** : `js/leo-partout.js` ne le pose qu'avec une
  vraie session Supabase, que le bac à sable n'a pas. Ce qui est prouvé est la mise
  en page, pas la condition de montage.
- À 1280 × 800, le nom le plus bas (RENOBOOST-CONSOLE) finit **8 px** au-dessus du
  cartouche : la marge prévue, tenue, mais serrée.
- Le cartouche compact tronque un résumé de plus de deux lignes (points de
  suspension) ; le texte entier reste dans le DOM du cartouche et dans le registre.
  ⚠️ **L'étiquette accessible d'une étoile ne porte PAS le résumé** — son nom, son
  type, son état et ses liens seulement (`js/ciel.js` l. 1118, lu). Donc au
  téléphone, sur l'accueil, où la parole se retire, **le résumé n'est plus dit du
  tout**. Assumé pour ce lot (le fil nomme le foyer, l'étoile se nomme elle-même),
  mais c'est une perte, et elle est écrite ici plutôt que tue.

---

## 21. Sauvegarde de palier (26/09, fin d'après-midi) — dry run, audit de sécurité, consolidation

**Paul : « sauvegarde de palier — on fait une pause ici ; consolide le code,
audit de sécu, dry run ».** Rien de neuf côté produit : ce passage attaque ce qui
a été livré depuis ce matin, corrige ce qui cède, et laisse la branche propre.

### Dry run — ce qui a été sondé

| Sonde | Résultat |
|---|---|
| Le socle sur une coque **sans** bandeau Finubar (NAGA, dock monté), puis 1280 → 390 → 1280 | **a tenu** — mais **aucun harnais ne le couvrait** : ajouté à `smoke-socle` ; la règle retirée → 3 rouges |
| Le cartouche compact au survol, blason compris (ADRAMELECH, IMLADRIK, TAO) à 1280 et 390 | **a tenu** — 102 px constants, aucun élément ne déborde |
| Le décompte des verdicts de `smoke-socle` | **a cédé** : deux passages à 1280 portaient le même nom, le second ÉCRASAIT le premier — un rouge à l'aller effacé par un vert au retour (« 3 lignes ❌, 2 rouges »). Noms rendus uniques, et un garde qui **lève une erreur** sur tout verdict en double — posé aussi dans `smoke-clic-exact`, `smoke-lv4-coque`, `smoke-noms-lisibles` (aucun doublon caché trouvé chez eux) |

### Audit de sécurité — un agent `securite-auditeur` isolé, constats VÉRIFIÉS avant d'être corrigés

| # | Constat | Vérification | Suite |
|---|---|---|---|
| **S1** · moyen · **antérieur à la branche** | Les noms et jalons des astres Finubar (texte écrit dans les FINUBAR.md de huit dépôts) entraient **en `innerHTML` brut** dans le cartouche de parole. La règle « rien n'entre en innerHTML qui ne vienne du registre statique » était devenue fausse le 02/09, avec la greffe | **Prouvé au navigateur** : un `<img>` et un `<a href>` injectés dans le cartouche (`smoke-parole-echappement`, 4 rouges sur 7). La CSP bloque le script, pas un lien de hameçonnage | **Corrigé** : `echapper()` sur tout texte du cartouche (`js/ciel-noeud.mjs`), commentaires de sécurité réécrits → 0 rouge sur 7 |
| **S3** · faible | Le plancher des noms n'avait pas de borne haute : scène écrasée → police de **896,5** unités (mesuré) | contrôle ajouté à `smoke-noms-lisibles`, vu rouge | **Corrigé** : plancher borné par `PLAFOND_NOM` → 20 |
| **S2** · faible | Le jeton local du serveur impeccable (incident du §17) survivait dans un objet git **local**, jamais poussé | `git cat-file -e 6f07b0e` → présent | **Nettoyé** : reflog expiré, `gc` → l'objet n'existe plus |
| **S4** · info | La maquette affirmait « `design/` est servi en clair » — faux (`.vercelignore` + `PREFIXES_PRIVES`) | lu dans `middleware.js` l. 79 | **Corrigé**, et la fixture datée (vrai le 02/09, faux aujourd'hui) |

**Vérifié sans rien trouver** (par l'agent, relu) : les chemins neufs posent du texte par `textContent` ou des nombres ; aucun style ni script inline (CSP `'self'` respectée) ; l'événement `ultima:mobilier` est borné à un recadrage par image, sans boucle ; aucun secret ni PII dans les lignes ajoutées.

### Consolidation

- **La variante « figure » est retirée** du moteur (`disposerEnFigure`, `hacher`, l'option `disposition`) et de la maquette : A8 a retenu la couronne ; un code qu'aucune page n'active est un code qu'on croira un jour disponible. Le §18.3 la retirait au lot 2b ; c'est fait dès maintenant.
- Aucun reste de sabotage, de `console.log` hors harnais, ni de `TODO` dans le diff de la séance (grep).

### Patrimoine après le palier

`npm test` **42/42** ; `bash tests/lancer.sh` sortie 0, **46/46** harnais (les 45
d'avant + `smoke-parole-echappement`).

### Leçons à écrire en fin de séance (pas avant — règle de `memoire/LECONS.md`)

1. *Un objet de verdicts indexé par nom avale les doublons* — le rouge disparaît sans bruit.
2. *Une règle de sécurité écrite en commentaire périme avec la donnée* : « le registre est statique » était vrai jusqu'à la greffe Finubar.

---

## 22. Sur l'iPhone de Paul (26/09, 16:19) — le téléphone respire, RIVEN n'est plus une impasse

**Paul, capture iPhone à l'appui :** *« Go merge tout. Attention chevauchement sur
mobile, c'est vraiment pas pratique, corrige. Aussi il n'y a pas de possibilité de
retour en arrière sur un projet en bout de chaîne : j'étais sur RIVEN, impossible
de faire un retour arrière. »* — PR #293 fusionnée d'abord (`4244999`), la faille
S1 avec elle.

### Le téléphone — à la hauteur RÉELLE de Safari, pas à celle de l'écran

La capture datait d'avant la fusion (colonne « Léo » en double, ULTIMA absente).
Remesuré sur le code fusionné à **390 × 664** — la page qui reste une fois les
barres de Safari déduites, pas les 844 px de l'écran : plus de recouvrement, mais
le bandeau Finubar prenait **200 px** et le ciel n'en gardait que **179**.

**Correctif** : au téléphone, le bandeau s'ouvre **replié** sur son en-tête — nom,
**date de collecte**, compte (« hors de portée » compris : rien de ce qui ne se cache
jamais n'est caché) — avec un bouton « Voir les signaux » (`aria-expanded`,
`aria-controls`, 40 px). Un toucher déplie, un autre replie ; le ciel suit (le
bandeau est observé). Sur ordinateur, rien ne change.

| 390 × 664 | avant | après |
|---|---|---|
| bandeau | 201 px | **90 px** replié |
| ciel libre | **179 px** | **290 px** |

`smoke-socle` : **69 verdicts**, rouge d'abord (pas de bouton, ciel 179), vert après ;
aussi à 375 × 667 ; déplié puis replié, **rien ne se recouvre** ; ordinateur témoin.

### RIVEN — la cause est l'application installée

`manifest.webmanifest` déclare `display: standalone` : sur l'écran d'accueil de
l'iPhone, **il n'y a pas de bouton retour du navigateur**. Une page sans son propre
retour est une impasse. RIVEN était la seule page du registre dans ce cas.

**Correctif** : « ↞ GRIMA » en tête de l'en-tête de RIVEN — son **parent exact** dans
le registre, 40 px, même registre visuel que le « ↞ Boussole » des coques.

**Le harnais lit le registre** (`tests/smoke-retour-feuilles.mjs`) : chaque feuille
(une cible, aucun enfant) doit offrir au téléphone un lien **que le doigt atteint**
vers un de ses ancêtres. Une feuille ajoutée demain est contrôlée sans une ligne de
plus. Rouge d'abord (RIVEN : 3 rouges), vert après ; deux sabotages rougissent.

**Ce qu'il a trouvé en plus** : le retour d'**ALTHEA** menait à `ultima.html`, une
constellation **sœur** — ALTHEA est une étoile de la racine. Il mène désormais à
`index.html`. ⚠️ `smoke-althea` exigeait `ultima.html` depuis le 14/09 — il
encodait le piège des deux « Ultima » (le produit = l'accueil, la supra-division =
`ultima.html`) que le journal du 07/08 décrit mot pour mot, cinq semaines après
qu'ALTHEA a été remontée à la racine sur demande de Paul. Son attente se **lit
désormais dans le registre** : elle ne peut plus diverger de lui.

### Deux fautes d'instrument, trouvées et corrigées dans le même passage

1. **Une boîte n'est pas un doigt.** Le premier jet du retour de RIVEN était en
   position absolue : au téléphone, le cartouche ULTIMA le **recouvrait** — la boîte
   était parfaite, le harnais vert, la capture montrait l'inverse. Le harnais
   demande maintenant au navigateur ce qu'il y a au centre du lien
   (`elementFromPoint`) ; le lien est remis dans le flux.
2. **Masquer l'écran de connexion ne connecte pas.** `js/app.js` rend l'en-tête
   `inert` tant que l'écran de connexion est visible ; le harnais levait l'écran sans
   lever l'inertie, et mesurait une page qui n'existe pour personne.

**Patrimoine** : `bash tests/lancer.sh` sortie 0, **47/47** harnais (+ `smoke-retour-feuilles`) ; `npm test` 42/42.

### Limites, nommément

- **Sans session**, l'écran de connexion de RIVEN couvre tout, retour compris : un
  visiteur non connecté y reste bloqué en application installée. Ce n'était pas le
  cas de Paul (connecté) ; à traiter avec l'écran de connexion, pas ici.
- Le repli du bandeau n'est pas mémorisé : il se rouvre replié à chaque visite. Voulu
  (le ciel d'abord) ; à reconsidérer si Paul l'ouvre à chaque fois.
- Aucune preuve sur un **vrai** iPhone : Chromium en émulation tactile.

---

## 23. Deux étoiles à venir : DOKLĚS et SYMPHO — À CADRER, rien n'est construit (26/09)

**Paul :** *« On va devoir ajouter 2 étoiles : DOKLĚS et SYMPHO. Deux nouveaux
projets, on va cadrer ça ensuite. »*

Consigné pour ne pas être oublié, **pas** pour être fait : aucune ligne du
registre, aucune étoile, aucun dépôt Finubar n'est touché tant que le cadrage
n'a pas eu lieu (A6). Les noms s'écrivent tels que Paul les a donnés — **DOKLĚS**,
avec le **Ě** (e caron) : il devra passer tel quel dans le registre, les noms
d'étoiles (capitales Georgia du lot 2a) et le fil d'Ariane, sans être « simplifié »
en DOKLES.

**Ce que le cadrage devra trancher** (questions, pas réponses) :
1. **Où** chaque étoile s'accroche : sous quelle constellation (ALPHA le
   professionnel ? NAGA ? la racine ?) — c'est ce qui fixe le chemin, le fil et le
   retour d'une feuille (§22 : toute feuille doit mener à son parent).
2. **Ce qu'elle est** : une porte vers une page (une `cible`), une coque avec des
   caps, ou un **astre Finubar** (un dépôt suivi, `ciel` déclaré dans son grain) ?
3. **Quel dépôt** porte chaque projet, s'il y en a un — et s'il doit entrer dans
   `finubar/depots.json`.
4. Ce que chacune **dit** au survol : `etat` et `resume`, lus à leur source, jamais
   inventés (Principe 3 de `PRODUCT.md`).

---

## 24. Les bandeaux et les messages — critique impeccable, puis correctifs (26/09, soir)

**Paul :** *« Utilise le skill /impeccable pour corriger les bandeaux et les messages,
pas le fond de carte stellaire ou les étoiles. »*

**La critique** : deux évaluations isolées (A revue de design, B détecteur + mesures
au navigateur). **21/40**. Chaque constat a été **vérifié avant d'être retenu** — un
rapport d'agent se vérifie, il ne se croit pas.

| Retenu (vérifié) | Preuve | Correctif |
|---|---|---|
| **La recommandation de Léo ne se lance d'aucun bouton** : elle vise un projet Finubar, greffé au ciel mais absent de `NOEUDS` → `destination` nulle, « Reprendre » grisé, et masqué au téléphone | `js/leo-navigation.mjs` `recommandationDepuisFinubar` | bouton **« Y aller »** qui isole le projet au ciel (même chemin que le clic d'un signal du bandeau) ; au téléphone il est visible, « Aller à… » devient une loupe de 44 px |
| **« FINUBAR · ce matin »** sur un agrégat de l'avant-veille | `js/finubar-bandeau.mjs` | « FINUBAR », et la date **suivie de son âge** (« · il y a 2 jours ») ; « Rien n'appelle en ce moment. » |
| **L'accueil s'appelle « ULTIMA »** dans le fil — « ULTIMA › ULTIMA › NAGA » est possible — et « ↞ Boussole » sur deux coques | registre `racine.nom`, `alpha.html`, `ultima.html` | le fil dit **« Accueil »** pour la racine ; « ↞ Accueil » |
| **Cibles tactiles** : « Fermer » 21 px, fil 24, retour 28, dock/onglets/signaux 40 | mesuré (B) | **≥ 44 px** au doigt (`pointer: coarse`) |
| **Placeholder du panneau à 1,36:1** | mesuré (B), `stellaire.css:134` | encre de parchemin sur le parchemin |
| **Panneau au téléphone** : 704 px pour 664, dernier résultat hors d'atteinte ; **le focus s'échappe** d'un `aria-modal` | mesuré (B) | hauteur = l'écran, défilement interne ; Tab et Maj+Tab restent dans le panneau |
| **Bandeau** : `aria-label` sur un `div` sans rôle, nom perdu | arbre d'accessibilité (B) | `role="region"` |
| **Légende gravée sous le bandeau et le dock** | `elementsFromPoint` (B) | retirée quand le socle est là (elle est décorative, `aria-hidden`) |
| **Textes sous 12 px** : surligne 10,6, date/compte 11, « LÉO » 11,5, état 10,9 | mesuré (B) | plancher 12 px |
| **Le socle parle « application »** : bouton bleu plein `#1a5a78`, halos et ombres larges (détecteur : thin-border + wide-shadow, dark-glow) | détecteur (B), relu | l'or gravé du produit ; ombres resserrées |

| Écarté | Pourquoi |
|---|---|
| Dire une panne de Finubar dans le bandeau | **décision testée** : fail-closed, rien ne transparaît sur erreur (`smoke-accueil-finubar` ①) |
| Renommer « Ultima Lv3 » | le titre de Paul, protégé par `smoke-boussole` |
| Masquer l'état « Ouvert » | il distingue une porte ouverte d'une porte « À venir » |
| « hors de portée » → autre chose | vocabulaire posé le 17/08, à dessein |
| « survole un cap » au téléphone | **faux constat** : cette invite n'est affichée nulle part (les coques ont retiré la leur) |
| dark-glow / rayures de `.boussole-plateau` | **faux positifs** : classe absente des pages scannées |
| Tutoiement de l'écran de connexion | un choix de ton — à Paul, pas fait |

**Critères** : un harnais neuf (`tests/smoke-bandeaux.mjs`), **rouge d'abord**, vert
après ; patrimoine complet vert ; captures bureau + téléphone.
**Pre-mortem** : « Y aller » qui isole le mauvais parent (→ le harnais clique et lit
l'adresse) ; une cible agrandie qui déborde et recouvre (→ `smoke-socle` rejoué) ; le
piège de focus qui bloque Échap (→ contrôlé).

### Livré (même soir)

- **« Y aller »** : la proposition de Léo se lance, au bureau comme au téléphone
  (un seul chemin partagé avec les signaux du bandeau : `allerAuProjet`, dans
  `js/ciel-noeud.mjs`). Si le projet n'est pas au ciel de la page, le bouton ouvre la
  recherche plutôt que de ne rien faire.
- **Le bandeau** : « FINUBAR », puis « collecté le 2026-09-02 · il y a 24 jours » ;
  `role="region"` ; « Rien n'appelle en ce moment. ». `ageDe` a son test unitaire
  (`tests/unit-finubar-age.mjs`, changement d'heure compris).
- **Le fil** dit « Accueil » ; les coques disent « ↞ Accueil ».
- **44 px au doigt** partout dans le périmètre ; **12 px** au plus petit ;
  placeholder à ~6,9:1 ; panneau à la hauteur de l'écran, focus piégé (Tab et
  Maj+Tab), Échap le ferme toujours.
- **L'or gravé** à la place du bleu d'application ; halo sans décalage retiré ;
  ombres resserrées. La loupe est un **SVG dessiné** (pas un glyphe).
- Détecteur : **14 → 13** constats — celui du périmètre (bandeau) a disparu ; les
  13 restants sont les faux positifs du cadran et l'espacement des capitales
  (connexion, surligne), assumé.

⚠️ **Régression trouvée par le patrimoine, et corrigée** : les signaux passés à
44 px allongeaient le bandeau déplié (217 → 236 px) et, au téléphone, l'étoile
ULTIMA passait sous le dock. Signaux dépliés, le dock se met désormais de côté —
une chose à la fois — et revient au repli. `smoke-socle` le tient (73 verdicts).

**Harnais** : `smoke-bandeaux` **32 rouges → 0/45** ; le piège de focus a d'abord
été mal éprouvé (16 tabulations en alternance, vert sur un panneau qui fuyait) —
durci à 30 dans chaque sens, il a rougi (19 et 15 sorties) avant d'être vert.

**Patrimoine** : `npm test` **43/43** ; `bash tests/lancer.sh` sortie 0, **48/48** harnais (+ `smoke-bandeaux`).

---

## 25. Lot 2b — LIVRÉ le 26/09 au soir, sur go de Paul (« tutoiement, go lot 2b »)

### Ce qui a été fait

| Pièce | Où | Garde-fou |
|---|---|---|
| **La figure** (`asterisme: true`) et **le rang** (`eclatParPoids: true`) activés sur les coques de navigation — et nulle part ailleurs | `js/ciel-noeud.mjs` | `tests/smoke-carte-celeste.mjs` (neuf) |
| **La figure s'éteint quand le ciel s'efface** autour d'un choix — sinon ses traits pendaient vers des étoiles éteintes | `css/ciel-noeud.css` (règle de l'état isolant, et sa ceinture `reduced-motion`) | idem ; **sabotage** : la règle retirée → 5 rouges |
| `disposerEnFigure` et `hacher` | `js/ciel.js` | **déjà retirés au lot 2a** (§19) — rien à faire, vérifié au `grep` |

### ⚠️ Une régression, trouvée par le patrimoine et corrigée dans le passage

Premier jet vert sur son propre harnais (129/129)… et **`smoke-tao` rouge** : les
deux étoiles de TAO se touchaient à **45 px** au bureau, **30 px** après. La zone
qui reçoit le doigt suivait le rayon de l'étoile ; le rang rapetissant les
feuilles, il rapetissait aussi leur cible. **Le rang doit changer l'éclat, jamais
la cible.** Corrigé dans `js/ciel.js` : la zone se calcule sur le rayon qu'aurait
l'étoile sans le rang (ou le rayon réel s'il est plus grand) — TAO revient à 45.
`smoke-carte-celeste` porte désormais la cible, sur les sept écrans ; **sabotage**
(la zone rebranchée sur le rayon réel) → 1 rouge, TAO à 30 px.

⚠️ **Et ce que le témoin a appris en passant, qui n'est pas de ce lot** : mesuré sur
le code d'AVANT le lot, les étoiles des coques se touchent à **25 px au téléphone**,
partout, et 26 à 31 px au bureau sauf TAO et NAGA. C'est le plancher que le moteur
promet (`RAYON_CAPTATION_MIN`, 24 px — WCAG 2.5.8), pas les 44 px que le reste du
socle tient depuis le §24. Non corrigé ici : agrandir les zones peut les faire se
recouvrir entre étoiles proches, et `smoke-clic-exact` (le clic exact, lot 1) en
dépend — c'est un lot à part, avec sa mesure. **Consigné pour Paul.**

### A9-3 — mesuré avant de construire, et il n'y avait rien à construire (EB)

La question du §18.3 : les noms de constellation reviennent-ils une fois le foyer
posé ? **Non, et c'est voulu** : sur un menu, le moteur les tait (`amasMuet`,
`js/ciel.js`) parce que le titre et le fil les disent mieux. Mesuré sur les six
écrans : **0 nom de constellation peint**, et la figure est nommée **par le fil**
(NAGA, GRIMA, ALPHA isolé) **ou par le titre** à la racine d'une page (ULTIMA,
ALPHA). Un cartouche de plus aurait été un troisième nom pour la même chose. Le
harnais tient les deux faits.

### Mesures — `smoke-carte-celeste`, 390 et 1280 px, caméra posée

| Écran | Étoiles | Traits (visibles/attendus) | Rang (tête / feuille) |
|---|---|---|---|
| Racine | 3 | 2/2 | 4,05 / 2,82 · 7,74 / 5,38 |
| TAO | 2 | 1/1 | un seul rang (deux feuilles) |
| ULTIMA | 2 | 1/1 | un seul rang |
| NAGA | 3 | 2/2 | un seul rang (§14.2 : trois têtes) |
| GRIMA | 2 | 1/1 | 2,99 / 2,08 · 7,14 / 4,97 |
| ALPHA sans session | 2 | 1/1 | un seul rang (RENOBOOST IA n'a de dépôts qu'après la greffe) |
| ALPHA, session ouverte | 2 | 1/1 | 2,04 / 1,42 · 5,39 / 3,75 |

Partout : **aucun trait vers une étoile absente, aucun trait à travers un nom**,
encre parchemin `#cdc3ad`, groupe `aria-hidden`, figure éteinte sous l'état
isolant, **rien ne bouge en `reduced-motion`** (NAGA et ALPHA, 1,5 s).

**Vu rouge d'abord** : sur la tête d'avant, **91 rouges sur 129** (avant l'ajout de TAO et de la cible ; 162 verdicts au final). Le seuil du
rang est exigeant à dessein — **tête ≥ 1,3 × feuille** : sans l'option, le nombre
de liens donnait déjà un écart (2,25 contre 1,91 sur GRIMA, 18 %) qu'un simple
« plus grand » aurait compté comme un rang. Avec : **44 %**, partout.

### Et le tutoiement de la porte (même go)

Paul tranche le point laissé ouvert au §24 : **l'écran de connexion tutoie**, comme
Léo. « ton interface unique », « tu reçois un lien de connexion par e-mail »,
« Regarde ta boîte mail » — dans `index.html`, `riven.html`, `js/boussole-auth.js`
et `js/app.js`. `tests/unit-connexion-tutoiement.mjs` le tient (4 rouges avant).
⚠️ Hors de ce qui a été tranché, et donc pas touché : **le reste de RIVEN vouvoie
encore** (`js/app.js`, `js/dictee.js`), et le mail du lien est rédigé côté Supabase.

### Limites, nommément

- **ALPHA session ouverte n'a que 2 étoiles** au ciel (RENOBOOST IA et YCOME) :
  les dépôts vivent un cran plus bas. Le pire cas à 24 étoiles reste celui de la
  maquette (§17), où la figure s'efface d'elle-même — aucun écran réel n'en
  approche.
- Le **tap sur un vrai téléphone** n'est toujours pas prouvé par un harnais.
- RIVEN n'active rien : son témoin reste `smoke-ciel`.

**Patrimoine** : `npm test` **44/44** (+ `unit-connexion-tutoiement`) ; `bash tests/lancer.sh`
sortie 0, **49/49** harnais (+ `smoke-carte-celeste`, 162 verdicts), `smoke-tao` et
`smoke-ciel` (RIVEN) verts sans retouche.

### Dry run DR (palier 20 min, déclenché à 19:19, fait à 19:50)

**Cédé — et corrigé dans le passage** : le contrôle « rien ne bouge en
`reduced-motion` » relevait les traits à 1,5 s d'écart et concluait « immobile ».
Rejoué **sans** la préférence : immobiles aussi, la caméra une fois posée. **Il ne
pouvait pas échouer.** Remplacé par un contrôle APPARIÉ sur le seul mouvement que
le lot ajoute, l'extinction de la figure : 0,22 s sans la préférence (témoin),
0 s avec. **Sabotage** (ceinture `reduced-motion` retirée) → 2 rouges.

**Sondé, et résisté** :
- `unit-connexion-tutoiement` : « Consultez votre boîte mail » glissé dans
  `js/boussole-auth.js` → rouge ; « vous recevez » dans `riven.html` → rouge ;
- les deux harnais neufs sont bien exécutés : `run-unit.mjs` et `lancer.sh`
  découvrent `unit-*` et `smoke-*` d'eux-mêmes, et la CI appelle ces deux scripts
  (`npm test`, `npm run test:browser`) — ⚠️ sur PR et sur `main` seulement, pas sur
  un simple push de branche ; d'où le patrimoine local avant chaque push ;
- RIVEN : le correctif de la cible ne s'exerce que sous `eclatParPoids`
  (`rayonCible = rayon` sinon) — `smoke-ciel` vert sans retouche.

---

## 26. Au téléphone, le ciel respire en profondeur et chaque étoile se touche (27/09, « diagnostic puis go la suite »)

### Le diagnostic — la cible n'était pas le vrai problème

Parti du constat du §25 (étoiles à 25 px au doigt), mesuré sur l'écran le plus
dense du produit, **RENOBOOST IA isolé, six dépôts, session ouverte, dock monté,
à la hauteur réelle de Safari** (390 × 664) :

| | Avant |
|---|---|
| Ciel utile | **205 px** — dont ~140 pris par « Bienvenue / Sur quoi est-ce qu'on travaille aujourd'hui ? », que le fil rend redondant un cran plus bas |
| Voisins les plus proches | **29 px** — des cibles de 44 px s'y seraient recouvertes (2 paires, 8 noms voisins couverts) |
| Noms | PROJET PREDICT et PROJET AGENDA **se croisaient** — et aucun harnais ne le voyait : `smoke-noms-lisibles` ne monte pas la session à 664 px |
| À 320 px | voisins à **16 px**, zones de 25 px qui **se recouvraient déjà** : un toucher entre deux étoiles allait à celle du dessus |

### Ce qui a été fait

| Pièce | Où |
|---|---|
| **(A) L'accueil se replie sous isolement**, au téléphone (≤ 560 px) : titre masqué à l'œil mais **lu par le lecteur d'écran**, invite retirée ; à la racine et au bureau, rien ne change | `js/ciel-noeud.mjs` (classe `ciel-profond`, posée avant la mesure du mobilier), `css/ciel-noeud.css` |
| **(B) La cible du doigt : 44 px**, option `cibleDoigtPx` convertie par l'échelle écran (comme `plancherNomPx`), **bornée par la demi-distance à la voisine** — plancher compris : le toucher va toujours à l'étoile la plus proche. Seulement au pointeur grossier, sur les coques ; RIVEN et la souris ne changent pas | `js/ciel.js`, `js/ciel-noeud.mjs` |
| **(C) Les traits de la figure ne prennent plus le doigt** — trouvé au dry run (ci-dessous) | `js/ciel.js` (`pointer-events: none` sur le groupe) |

### Mesures — `tests/smoke-cibles-telephone.mjs` (neuf), dock monté

| RENOBOOST IA | Ciel | Voisins | Cible | Recouvrements | Noms croisés |
|---|---|---|---|---|---|
| 390 × 664 | 205 → **296 px** | 29 → **58 px** | 25 → **44 px** | 0 | 1 → **0** |
| 375 × 667 | 208 → **299 px** | 28 → **54 px** | 25 → **44 px** | 0 | 2 → **0** |
| 320 × 568 | — | 16 px | **16 px** (toute la demi-distance) | 2 → **0** | — |

**Vu rouge d'abord** : 26 rouges sur la tête d'avant. **Sabotages** : borne retirée →
9 et 8 recouvrements à 320 et 300 px ; noms croisés → rouge sur l'ancien code.
Un **seuil inventé** a été retiré en route (« ciel ≥ 300 px », rouge à 296 sur un
écran sain) : remplacé par la valeur qui se dérive — deux voisins à ≥ 44 px pour
que deux cibles pleines ne se recouvrent pas.

### Dry run DR (déclenché à 11:29, fait à 11:45)

**Cédé — et corrigé dans le passage** : « ce que le doigt atteint » (le navigateur
interrogé au bord de chaque cible) a trouvé que **les traits de la figure, livrés
au lot 2b, captaient le toucher** : 5 touchers sur 12 perdus à 390 × 664. Le groupe
n'avait pas `pointer-events: none`, contrairement aux liens et au décor. Corrigé
dans le moteur. Le contrôle aléatoire ne suffisait pas à le tenir (il ne tombe
sur un trait qu'au gré de la caméra) : un contrôle **déterministe** — le milieu de
chaque trait ne répond jamais « le trait » — vit dans `smoke-carte-celeste` ;
**sabotage → 14 rouges**.

**Et une faute d'instrument** : le point « vers la voisine » était pris à 45 % du
chemin sans borne, donc hors de la cible quand la voisine est loin — le ciel vide
y répondait, à raison. Borné à 21 px.

**Sondé, et résisté** : la conversion px → unités se relit au redimensionnement
(ouvert à 390, rétréci à 300 : 44 px, 0 recouvrement) ; à 300 px la conversion se
prouve (échelle < 1, cibles à 44 sur la racine) ; `smoke-clic-exact` et `smoke-ciel`
(RIVEN) verts.

### Limites, nommément

- **Sous 360 px, l'écran à six dépôts n'a pas la place de 24 px par étoile** : chaque
  étoile y reçoit sa demi-distance entière (16 px à 320). La cible est juste — le
  plus proche gagne — mais petite. Le remède serait de la place (moins de mobilier
  ou un ciel qui défile), pas une cible plus grande.
- Le **téléphone couché** (plus large que 560 px, peu haut) garde l'accueil déplié.
- Le **tap sur un vrai téléphone** n'est toujours pas prouvé autrement que par
  `elementFromPoint` sous émulation tactile.

**Patrimoine** : `npm test` **44/44** ; `bash tests/lancer.sh` sortie 0, **50/50** harnais
(+ `smoke-cibles-telephone`, 160 verdicts ; `smoke-carte-celeste` 178).

---

## 27. Lot 3 — LIVRÉ le 27/09, sur go de Paul (« go lot 3 »)

A7 était rendu (l'anneau de Léo au survol reviendra avec J3) : le lot se réduisait
au §14.3, et c'est ce qui a été fait.

### Ce qui a été fait

| Pièce | Où |
|---|---|
| **Un lien vers un dépôt s'ouvre sur lui.** Juste après la greffe Finubar, si aucun foyer n'est posé, l'adresse est relue et le foyer posé — sans historique, comme un lien direct. `idDeLAdresse` garde sa triple garde, relue sur le registre greffé ; un choix déjà fait ne se fait pas voler | `js/ciel-noeud.mjs` (rappel de `chargerFinubar`) |
| **Le harnais** `tests/smoke-depots-partout.mjs` (neuf) — l'agrégat RÉEL (`api/_lib/finubar-macro.mjs`), servi avec 800 ms de retard | `tests/` |

### Mesures

| Contrôle | Avant | Après |
|---|---|---|
| `alpha.html#renoboost-ia`, Finubar retardé de 800 ms | ALPHA entier (4 dépôts d'ALPHA, RENOBOOST IA, YCOME) | **RENOBOOST IA isolé** : ses 5 dépôts + LE SITE, rien d'autre |
| Le même, Finubar sans retard | ALPHA entier | **RENOBOOST IA isolé** |
| Entrées d'historique ajoutées | — | **0** (2 → 2) |
| Sans session | aucun astre | aucun astre, aucun isolement — **fail-closed intact** |
| `#__proto__`, `#constructor`, `#inexistant`, `ultima.html#renoboost-ia` | ignorées | ignorées, greffe comprise |
| Dépôts réels depuis l'accueil | — | **9/9 en ≤ 2 clics** : 4 à un clic (sous ALPHA), 5 à deux (sous RENOBOOST IA) |

**Vu rouge d'abord** : 6 rouges sur la tête d'avant (la course et sa variante sans
retard). Verrou de la course : aucun dépôt au ciel avant la réponse retardée — le
harnais prouve que l'ordre fautif se produit bien.

⚠️ **Une faute d'instrument, trouvée par la mesure ④** : le premier jet cherchait
*dix* dépôts au ciel et déclarait Ultima manquant. Or le dépôt rangé à la racine
**n'a pas d'étoile, à dessein** — « le projet EST le ciel qu'on regarde »
(`js/adaptateur-finubar.mjs`, `greffer`). Il s'atteint en zéro clic. Le harnais
lit désormais cette règle au lieu de la contredire.

**Patrimoine** : `npm test` **44/44** ; `bash tests/lancer.sh` sortie 0, **51/51** harnais
(+ `smoke-depots-partout`, 24 verdicts, 26 après le dry run).

### Dry run DR (palier 20 min, fait à 19:23)

**Sondé, et résisté** :
- **Une seconde greffe ne ramène pas de force.** La session se rafraîchit seule
  (`TOKEN_REFRESHED`) et relance la greffe : isolé sur RENOBOOST IA par le lien,
  remonté d'un cran par le fil, on reste sur ALPHA. Contrôle ajouté (① ter) ;
  **sabotage** (la remontée garde le fragment `#renoboost-ia`) → rouge : la greffe
  suivante ramenait sur RENOBOOST IA.
- La greffe qui arrive AVANT l'adresse (① bis), les adresses forgées dont
  `#__proto__` (③), l'historique (2 → 2), le fail-closed sans session (②).

**Non éprouvable par l'écran, nommément** : la garde « un choix déjà fait ne se fait
pas voler » (`isole ? null : …`). Avant la greffe, ALPHA n'a aucun cap qui
s'isole ; et quand on isole ailleurs, l'adresse suit le choix — la relire donne le
même foyer. La garde est défensive ; aucun parcours ne la distingue aujourd'hui.

**Cédé** : rien.
