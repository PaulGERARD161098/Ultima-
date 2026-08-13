# CADRAGE — LV4 : la console en constellations

> Format 6 points (**directive EL**). Phase 2 de la demande dictée par Paul le
> 2026-08-12 : *« on verra si on ne peut pas passer sur un thème stellaire, un
> thème galaxie, un thème constellation pour Ultima LV4 […] quand on arrive
> dans la constellation, on a les constellations plutôt que la boussole, mais
> ça, ça vient dans un deuxième temps. D'abord on termine RIVEN, on voit
> comment ça rend, et ensuite on s'adapte. »*
>
> **RIVEN est terminé et jugé** (« c'est bien comme ça », 2026-08-12 ; thème
> stellaire fusionné le 2026-08-13). Le deuxième temps est ouvert.
>
> **Précision de Paul, 2026-08-13 : « le tout en 3D ».** La console ne recevra
> donc pas un dessin de constellations à plat : elle recevra **le ciel de
> RIVEN**, en volume, avec sa perspective, sa dérive et sa vue à plat de
> secours. C'est une décision d'architecture autant que de forme — voir §1.

## 0. Le constat — mesuré

La console n'est pas une page : c'est **un moteur, un registre et neuf coques**.

| | |
|---|---|
| Le registre de navigation | `js/registre-lv3.mjs` — **21 nœuds**, données pures, zéro DOM |
| Le moteur de rendu | `js/boussole-noyau.mjs` — **334 lignes**, un seul moteur pour tous les étages |
| L'habillage | `css/boussole.css` — **397 lignes** |
| Les pages-coques | **9** : `index`, `ultima`, `alpha`, `grima`, `naga`, `bcp`, `adramelech`, `imladrik`, `tao` |
| Les harnais qui y touchent | **14**, dont `smoke-boussole` (60), `smoke-quadrants` (65), `smoke-console` (45) — **170 assertions** sur ces trois-là |

**Ce que cette architecture nous donne, et c'est décisif** : une page-coque ne
porte ni SVG, ni logique — `<body data-noeud="…">` et le moteur fait le reste.
**Changer le rendu de la console, c'est changer UN fichier**, pas neuf.

## 1. ① Le but — ce qui sera vrai à la fin

**On n'arrive plus sur une boussole, on arrive dans un ciel — en volume.**
Chaque écran de la console est une **constellation en 3D** : ses caps sont des
**étoiles**, son cœur une étoile plus vive, et l'on passe d'un écran à l'autre
en touchant une étoile — exactement comme on passait d'un cap à l'autre. Le
registre des 21 nœuds **ne bouge pas d'une ligne** : ce qui change est la façon
de le dessiner.

### ⚠️ LA DÉCISION D'ARCHITECTURE : un seul moteur pour tout Ultima

« Le tout en 3D » ferme une question que je m'apprêtais à trancher de travers.
Il n'y aura **pas** de second moteur de constellations : la console est rendue
par **`js/ciel.js`**, celui de RIVEN — 3D en SVG, sans bibliothèque, focusable
au clavier, éprouvé par 54 assertions et posé en production depuis le
2026-08-11.

Ce que ça donne gratuitement, et qu'un rendu neuf aurait fallu réécrire :
la perspective et la dérive, la concentration au survol, les cibles tactiles
mesurées (≥ 24 px), le cadre qui suit sa boîte, **et la vue à plat livrée
aujourd'hui** — la console héritera du même recours quand l'appareil peine.

Ce qui reste à écrire est donc **un adaptateur**, pas un moteur : traduire un
nœud du registre en ce que `ciel.js` sait lire — les caps deviennent des
étoiles d'une même constellation (le nom de l'écran), les passerelles entre
jumeaux deviennent des liens. *La directive EB dit « capitaliser sur
l'existant » ; ici l'existant fait 90 % du travail.*

Le thème stellaire (`css/stellaire.css`, déjà écrit et éprouvé sur RIVEN) est
posé sur les neuf coques. **Aucune couleur nouvelle n'est inventée.**

## 2. ② Les étapes — dans cet ordre

1. **La maquette d'abord** (`design/preview-lv4-constellations.html`), et elle
   charge **le vrai `js/ciel.js`** — leçon du 2026-08-12 : une maquette qui
   redessine le moteur qu'elle prétend montrer fait juger une régression que
   personne n'a décidée. Elle rend **trois écrans réels du registre** — la
   racine (3 caps), un macro-quadrant (GRIMA), un quadrant terminal
   (ADRAMELECH) — plus les états que personne ne dessine : **un cap « à
   venir »** (cible nulle), **une passerelle** entre deux caps jumeaux, le
   focus clavier, et **l'écran le plus chargé du registre**. Bandeau de mesure
   embarqué. **→ arbitrage de Paul.**
2. **L'adaptateur registre → ciel** : une fonction pure qui traduit un nœud du
   registre en `{noeuds, relations}` pour `ciel.js`. Elle vit avec le registre
   (module ES pur, testable sans navigateur), pas dans le moteur. Le noyau
   `boussole-noyau.mjs` appelle le ciel au lieu de dessiner sa rose.
3. **Le thème sur les neuf coques** : elles chargent `css/stellaire.css`.
4. **Les harnais** : les 170 assertions des trois harnais de navigation sont
   **reprises une par une**, jamais supprimées en bloc (méthode éprouvée sur
   l'arbre : sept assertions sauvées sur 55 parce qu'elles ne parlaient pas de
   lui).
5. **Patrimoine COMPLET** + **preview Vercel** livrée à Paul.

## 3. ③ Les moyens

| Créé | `design/preview-lv4-constellations.html` · l'adaptateur (module pur) · `tests/unit-lv4-adaptateur.mjs` · `tests/smoke-lv4-stellaire.mjs` |
|---|---|
| **Modifié** | `js/boussole-noyau.mjs` · `css/boussole.css` · les **9 coques** (deux `<link>` et un `<script>` chacune) · `smoke-boussole` · `smoke-quadrants` · `smoke-console` · les harnais de quadrants concernés |
| **Intouché** | `js/ciel.js` — **le moteur ne change pas**, on l'alimente · `js/registre-lv3.mjs` (les 21 nœuds) · `js/blasons.mjs` · `css/styles.css` · RIVEN · les API · la base |

## 4. ④ Critères de réussite — mesurés

1. **Aucun nœud perdu** : pour chacun des 21 nœuds, autant d'étoiles que le
   registre déclare d'enfants, chacune menant à la **même cible** qu'aujourd'hui.
   Comparaison automatique **registre ↔ DOM rendu**, nœud par nœud.
2. **La navigation tient** : depuis la racine, chaque chemin jusqu'à une feuille
   reste parcourable — au doigt **et au clavier** (Tab, Entrée).
3. **Le cadre tient dans l'écran** sur 390 × 844 **et** 1670 × 900, centres des
   étoiles et libellés dans le `viewBox` (critère du produit, `smoke-ciel`).
4. **Lisibilité prouvée** : contraste WCAG AA sur les neuf écrans, luminance de
   fond < 0,20 — mêmes seuils, même routine que `smoke-stellaire`.
5. **Zéro perte d'assertion** : la baisse ne dépasse pas le nombre d'assertions
   **proprement** « boussole » (rose des vents, aiguilles, angles des caps).
6. **Les états rares sont rendus** : cap « à venir » non cliquable et dit comme
   tel, passerelle visible entre jumeaux, écran le plus chargé sans collision.
7. **Patrimoine COMPLET vert, sortie 0.**

## 5. ⑤ Ce qu'on ne fait PAS

- **On ne touche pas au registre.** Aucun nœud ajouté, retiré ou renommé : ce
  serait changer la navigation ET son rendu dans la même boucle.
- **On ne fait pas « un seul ciel pour tout Ultima »** — Paul a tranché pour
  *un écran = une constellation*. La plongée continue reste une idée, pas une
  boucle ouverte.
- **On ne touche pas à l'archipel d'ADRAMELECH** (`idees.html`) : c'est une vue
  de données, pas un écran de navigation. Son sort se cadrera seul.
- **On n'ajoute aucune fonctionnalité** au passage.

## 6. ⑥ Pre-mortem

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **Une cible se perd** : un cap ne mène plus où il menait, et personne ne s'en aperçoit avant Paul. | Critère 1 : comparaison **registre ↔ DOM** sur les 21 nœuds, automatique. C'est le registre qui fait foi. |
| 2 | **La beauté mange la navigation** : joli ciel, mais on ne sait plus où l'on est ni comment revenir. | La maquette rend le retour, le titre et le cartouche de Léo. Critère 2 : chaque chemin reste parcourable, clavier compris. |
| 3 | **Les caps se chevauchent** sur l'écran le plus chargé. | La maquette éprouve le **pire cas construit**, pas l'écran moyen (leçon du foyer DRAUKHAIN). |
| 4 | **Le cap « à venir » devient cliquable** — ou disparaît. | État rendu dans la maquette, assertion dédiée (critère 6). |
| 5 | **Les passerelles entre jumeaux sautent** : elles n'existent que sur deux nœuds, on les oublie. | Rendues dans la maquette, assertées (critère 6). |
| 6 | **On supprime 170 assertions parce qu'elles parlent de « caps »** alors qu'elles parlent de navigation. | Reprise **une par une**, comme pour l'arbre. La méthode a déjà sauvé sept assertions sur 55. |
| 7 | **Un harnais tient sur la palette** et vire au rouge sans défaut réel. | Précédent connu (`smoke-antique`, 2026-08-13) : les tests lisent les **jetons**, pas des littéraux. |
| 8 | **Mon instrument suppose ce qu'il mesure** (précédent du 2026-08-13 : un vert franc sur un cartouche illisible). | La routine corrigée est reprise telle quelle, et **une capture d'écran est regardée** à chaque étape — la mesure ne remplace pas l'œil, elle le complète. |
| 9 | **Squash-merge** : la branche repart de `origin/main` avant tout nouveau commit. | Règle du 2026-07-22, appliquée trois fois aujourd'hui. |
| 10 | **On touche à `ciel.js` « juste un peu » pour la console**, et on casse RIVEN — le même moteur sert désormais deux écrans. | Le moteur est **intouché** (§3) : tout passe par l'adaptateur et les options. Si une modification s'avère inévitable, les 54 assertions de `smoke-ciel` sont le garde-fou, et elles tournent avant/après. |
| 11 | **Le ciel est fait pour des dizaines d'étoiles, la console en a trois à huit** : une constellation de trois points peut paraître vide, ou trop écartée. | La maquette éprouve le **plus petit** écran (3 caps) autant que le plus chargé. Le ciel a déjà un plancher mesuré pour les réseaux minuscules (`reseauMinusculeGardeUnPlancher`, `smoke-ciel`). |
| 12 | **Les noms des caps disparaissent** : `ciel.js` n'affiche en permanence que les six étoiles les plus « lourdes ». | Sur la console, **tout cap doit porter son nom** — c'est un menu, pas un réseau. Option explicite à passer au moteur, et assertion dédiée. |

---

### Registre des arbitrages — pris par Paul, 2026-08-13

| Question | Décision |
|---|---|
| La portée | **Tous les écrans de la console** — les neuf coques. La boussole disparaît d'Ultima. |
| Le sens | **Un écran = une constellation**, ses caps sont ses étoiles. Le registre ne bouge pas. |
| Le rendu | **En 3D** — « le tout en 3D ». C'est `js/ciel.js`, le moteur de RIVEN, qui rend la console. Pas de second moteur. |

### ⏳ Actions Paul

- **Go sur la maquette** (étape 1) — prochaine action, et la seule.
- Reste au registre, non bloquant : les index de performance en INFO (S2).
