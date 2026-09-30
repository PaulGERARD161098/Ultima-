# CADRAGE — IFULVIN, la constellation des ARMES, la constellation des DRAGONS

> Format 6 points (**directive EL**). Dicté par Paul le 2026-09-29, à la suite
> de la restructuration OMEGA. Graphie **IFULVIN**, telle que Paul l'a donnée :
> « Ifu » seul n'existe pas (correction Paul, 29/09) — on ne l'abrège jamais,
> ni dans le registre, ni dans une réponse, ni dans un libellé.
>
> ⛔ **Ce document CADRE. Il n'exécute rien** : Paul a dit « on y viendra plus
> tard, mais c'est comme ça que tu vas le cadrer déjà ». Aucune ligne de code,
> aucune migration. La boucle de code s'ouvre à son go (EB).

## 0. Ce qui existe déjà — on capitalise (EB)

| Acquis | Où |
|---|---|
| IMLADRIK est un **macro-projet** à 5 caps (MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, TAO), rendu par le noyau commun | `js/registre-lv3.mjs` (boucle OMEGA du 29/09) |
| Le réseau **en cercles concentriques** a déjà été dicté le 21/09 : idée **ADR-005 « Le Cercle »**, modèle BNI mesuré, et le point qui bloquait — **plat ou concentrique ?** | `CADRAGE-RESEAU-CERCLES.md` §1, §2, §4 |
| Un voile de nébuleuse existe déjà dans le fond du ciel (pré-rendu 256 px) | `js/ciel-fond.js` l. 76 |
| RIVEN = le réseau commercial (artisans, partenaires, leads) | `riven.html` |

⚠️ **Deux constats à ne pas perdre.**
1. Paul dit maintenant « cercles concentriques de réseau partout » : **il
   tranche §4 de CADRAGE-RESEAU-CERCLES.md en faveur du concentrique.** Ce n'est
   pas encore une règle d'admission — c'est le sens du projet. Le document du
   21/09 reste la source du modèle BNI et de ses modes de défaillance ; on ne le
   recopie pas ici.
2. IFULVIN **n'est pas une deuxième version de RIVEN**. Paul : « ça correspond un
   peu avec RIVEN, mais c'est un projet très spécial ». RIVEN gère un réseau
   commercial **existant** ; IFULVIN est un réseau **à bâtir**, par cercles.

## ① Le but — ce qui sera vrai à la fin de la boucle de structure

Dans IMLADRIK, deux **constellations** — deux nébuleuses lisibles comme telles —
regroupent des caps :

- **La constellation des ARMES.** Premier macro-projet : **IFULVIN**, l'arme
  principale de Paul pour se développer et développer ses projets. *Son réseau,
  son Magnum Opus, sa plus belle arme, son épée.* Cœur : des cercles
  concentriques de réseau, partout.
- **La constellation des DRAGONS.** MAEDRETHNIR, VRANESH, DRAUKHAIN (arbitrage
  Paul 29/09).

ADRAMELECH et TAO restent **directement** sous IMLADRIK (arbitrage Paul 29/09) ;
IMLADRIK passe donc de 5 caps à 4 entrées : les deux constellations + ADRAMELECH
+ TAO.

## ② Les étapes — dans l'ordre, une boucle chacune

1. **Boucle A — la structure, sans contenu métier.** *(30/09 — arbitrage
   Paul : « option 1, assouplis la règle pour les constellations ». Un nœud
   `constellation: true` est une boussole dès UN cap ; l'exception est un
   drapeau explicite, vérifié par `verifierRegistre`, jamais une déduction.)* Deux nœuds-constellation
   dans le registre (`constellation-armes`, `constellation-dragons`) ; les 3
   dragons y sont rangés ; `ifulvin` y entre comme **étoile d'attente** (nom,
   état « À venir », une phrase, aucune cible — modèle DOKLĚS/SYMPHO, Principe 3
   de PRODUCT.md : on ne dit que ce qui est su). Harnais transposés.
2. **Boucle B — les nébuleuses.** Rendu visuel des deux nébuleuses : un voile
   coloré par constellation derrière ses étoiles. Chaque nébuleuse a sa teinte
   (ARMES / DRAGONS), sans jamais coûter la lisibilité ni le contraste des noms.
   Cadrage visuel préalable par `graphisme` (spécifie) → `front-carto`
   (implémente) ; maquette avant le code (EL).
3. **Boucle C — IFULVIN prend corps.** Seulement quand Paul a tranché §⑤ : règle
   d'entrée et unité de mesure des cercles. Elle se cadre alors comme un projet à
   part entière (`CADRAGE-IFULVIN-…`), avec son schéma et sa RLS.

## ③ Les moyens

- Fichiers : `js/registre-lv3.mjs`, `imladrik.html` (repli `<noscript>`),
  `js/adaptateur-lv4.mjs` / `js/ciel-noeud.mjs` (rendu d'un étage à 4 entrées dont
  2 sont des constellations), `js/ciel-fond.js` (voile), `tests/`.
- Agents : `graphisme`, `front-carto`, `interface-ux`, `verificateur`.
- Aucune donnée en base à l'étape A/B : rien à migrer, aucun gate SQL.

## ④ Critères de réussite (vérifiables)

- A : le registre passe `unit-registre-lv3` ; IMLADRIK = 4 entrées ; les deux
  constellations ont chacune ≥ 1 enfant ; IFULVIN est atteignable **sans
  JavaScript** (repli `<noscript>` égal au registre) et `aria-disabled` (aucune
  page promise) ; la graphie IFULVIN est vérifiée par assertion (jamais « Ifu »).
- B : contraste des noms sur nébuleuse mesuré (`smoke-fond-contraste`, étendu) ;
  le clic va à l'étoile visée (`smoke-clic-exact`, étendu aux 2 constellations) ;
  zéro erreur console.
- Chaque harnais est validé par un sabotage volontaire (il doit virer au rouge).

## ⑤ Ce qu'on ne fait PAS dans cette boucle

- Aucune règle d'admission, aucune table, aucun écran de réseau IFULVIN.
- On **ne re-décide pas** plat vs concentrique (dit : concentrique) ni le modèle
  BNI (`CADRAGE-RESEAU-CERCLES.md`).
- On ne touche ni à RIVEN, ni au contenu de MAEDRETHNIR / VRANESH / DRAUKHAIN.
- Pas de nouvel outil à côté d'Ultima (directive JL).

**À trancher par Paul avant la boucle C (registre des arbitrages)** :
1. IFULVIN **remplace-t-il** l'idée ADR-005 « Le Cercle » ou en est-il le projet
   d'exécution ? (Je n'en déduis rien.)
2. Un membre entre-t-il dans un cercle **par parrainage du cercle visé**, ou
   autrement ? (§4 du 21/09.)
3. Le nom des cercles / des niveaux (les gravures de la carte savante).

## ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| On code IFULVIN comme un RIVEN bis (fiches, filtres, leads) | ⑤ : IFULVIN reste étoile d'attente jusqu'à la boucle C |
| Le nom dérive (« Ifu », « Ifulvine »…) | assertion sur la graphie exacte dans le registre et les harnais |
| Les nébuleuses embellissent mais rendent les noms illisibles | critère B mesuré, pas jugé à l'œil ; teinte plafonnée |
| Le clic « rate » une étoile dans une constellation (défaut déjà payé le 25/09) | `smoke-clic-exact` étendu ; dépliage au survol non ajouté |
| Un cap disparaît en changeant de rang (ADRAMELECH, TAO) | test « chaque cap du registre est atteignable depuis l'accueil » |
| On ouvre la boucle C par enthousiasme, sans §⑤ tranché | gate EL : elle ne s'ouvre pas tant que les 3 arbitrages ne sont pas rendus |

**Décisions attendues de Paul** : les 3 arbitrages du §⑤. **Prochaine action
unique** : finir la boucle OMEGA (tests, commit), puis boucle A.

---

## ⑦ BOUCLE B — les nébuleuses (cadrage 6 points, 30/09, « go solo, enchaîne sur les nébuleuses »)

> ✅ **Fait le 30/09** — fusionné avec la boucle C (#316, `4b8e2de`). Boucle A : #313. Harnais : `tests/smoke-nebuleuses.mjs` (5 sabotages mordent). Boucle C (dictée le même jour) : TAO supprimé, DRAGONS = MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM ⇄ ZEKROM, étoiles indépendantes sauf la passerelle.

**① But.** Sur l'écran IMLADRIK, la constellation des ARMES et celle des DRAGONS
se lisent comme **deux nébuleuses** : un voile coloré, propre à chacune,
enveloppe leur étoile. Quand on plonge dans l'une (`#constellation-armes`,
`#constellation-dragons`), sa nébuleuse enveloppe les étoiles qu'elle contient.
Deux teintes distinctes, dans le registre antique et nocturne d'Ultima.

**② Étapes.**
1. Spécification visuelle (agent `graphisme`) : deux teintes, rayon, éclat
   plafonné, comportement sous `prefers-reduced-motion` et à 390 px.
2. Moteur : une option **opt-in** `nebuleuses` de `UltimaCiel.rendre` —
   `[{ ids: [...], teinte }]` — peinte **par la couche de fond**
   (`js/ciel-fond.js`), avec la projection du moteur (aucune caméra propre : la
   règle de phase du LV5 tient). Sans l'option, rendu strictement identique.
3. Registre : `nebuleuse: 'armes' | 'dragons'` sur les deux constellations ;
   `js/ciel-noeud.mjs` en déduit les groupes (étoile de la constellation à
   l'écran parent ; ses enfants quand elle est isolée).
4. Harnais : mesure de pixels sous chaque nébuleuse (teinte présente, et
   différente entre les deux) ; contraste des noms inchangé ; phase tenue ;
   aucun autre écran touché.

**③ Moyens.** `js/ciel.js` (option, transmission des positions projetées),
`js/ciel-fond.js` (voile ancré), `js/registre-lv3.mjs`, `js/ciel-noeud.mjs`,
`tests/`. Aucune donnée, aucun SQL, aucune dépendance.

**④ Critères de réussite (vérifiables).**
- Sur `imladrik.html` : la moyenne de couleur d'un disque autour de l'étoile
  ARMES diffère mesurablement de celle autour de DRAGONS, et de la même zone
  **sans** l'option (témoin).
- La nébuleuse suit son étoile : écart de phase ≤ 1 px (même méthode que
  `smoke-lv5-fond`).
- Contraste des noms : `smoke-fond-contraste` et `smoke-noms-lisibles` verts,
  étendus à `imladrik.html` et ses deux isolements.
- Tous les autres écrans (accueil, ALPHA, OMEGA, TAO, BCP, ADRAMELECH, RIVEN) :
  aucun pixel de nébuleuse (l'option n'y est pas passée).
- Zéro erreur console ; coût de peinture sous le budget de `smoke-lv5-fond`.

**⑤ Hors périmètre.** Aucune armoirie nouvelle (blasons provisoires gardés) ;
aucune animation propre aux nébuleuses ; pas de contenu IFULVIN ; RIVEN
intouché.

**⑥ Pre-mortem.**

| Mode de défaillance | Ce qui le prévient |
|---|---|
| La nébuleuse glisse sous l'étoile (deux repères) | peinte par le fond avec la projection du moteur ; test de phase |
| Elle écrase les noms (contraste) | éclat plafonné, mesuré par `smoke-fond-contraste` |
| Elle déborde sur les autres écrans | option opt-in, passée seulement si un nœud visible porte `nebuleuse` ; test négatif |
| Test vert par le mauvais chemin (mesure sur fond déjà coloré) | témoin sans l'option, sabotage (teinte identique ⇒ rouge) |
| Le rendu « embellit » au détriment du sérieux antique | teintes spécifiées par `graphisme`, capture relue avant commit |
