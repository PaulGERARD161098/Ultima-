# CADRAGE — L'ACCUEIL PILOTÉ PAR FINUBAR

> Format 6 points (**directive EL**). Dicté par Paul le 2026-09-02 :
> *« un seul écran d'accueil, au bas duquel il y a Finubar, piloté par Léo, qui
> m'oriente vers la priorité du jour avec une coloration des sujets en priorité.
> Ça fait une arborescence — toujours les constellations : les constellations,
> puis les astres — et ça me surligne les passages où il y a de la priorité avec
> de la couleur. Puis les recommandations de Léo : commençons par ça. »*
>
> **⛔ GATE : rien n'est branché en production avant le go de Paul.** Le
> livrable de cette boucle est ce cadrage + la maquette
> `design/preview-accueil-finubar.html`. La suite se prend palier par palier.

---

## 0. Le constat — mesuré le 2026-09-02, pas rappelé de mémoire

### 0.1 Ce que Paul demande EXISTE DÉJÀ AUX TROIS QUARTS (EB : capitaliser)

| Acquis | Preuve, lue ce jour |
|---|---|
| **Le ciel EST l'accueil** — racine + 9 coques rendues par le moteur unique | `index.html` charge `js/ciel-noeud.mjs` ; LV5/P4 |
| **L'arborescence constellations → astres** avec isolement à un étage | `js/adaptateur-lv4.mjs` (`versCiel`, `isolement`), arbitré le 31/08 |
| **Finubar agrège les 8 dépôts** et sait déjà dire par quoi commencer | `finubar/agreger.mjs` : `rangDe`, `agreger`, `cartoucheDuMatin` |
| **La sortie « nœuds + relations » du ciel** — écrite, testée, **branchée nulle part** | `versConstellation()`, en attente depuis le 21/08 : *« tout projet d'ampleur doit être dans la constellation générale, on en reparle »* |
| **La donnée est servie derrière auth** | `GET /api/finubar` → `{ le, projets, macro, cartouche, constellation }`, `requireUser` |

**Ce qui manque n'est donc ni un moteur, ni une donnée, ni un classement :
c'est UN BRANCHEMENT et UNE COULEUR.** C'est aussi, mot pour mot, la boucle
laissée ouverte le 21/08 — cette demande la ferme au lieu d'en ouvrir une.

### 0.2 Où ça se range dans ce qui est déjà cadré

`CADRAGE-LV6-CIEL-VIVANT.md` (déposé le 20/08, **gelé au top départ de Paul**)
décrit exactement deux des trois pièces : **P2 — les étoiles qui appellent** et
**P3 — le cartouche du matin**. La demande du 02/09 ne crée pas un chantier
parallèle : elle **exécute LV6 P2+P3**, avec **une différence de source** qui
la rend beaucoup moins chère —

| | LV6 tel qu'écrit | Ce qui est demandé le 02/09 |
|---|---|---|
| D'où viennent les signaux | `api/cockpit.js` v3, **à étendre** (fraîcheur, orphelines, élan) | **Finubar**, qui existe, agrège déjà et **classe déjà** |
| Ce que le signal dit | l'état des quadrants personnels d'Ultima | l'état des **huit dépôts** — ce sur quoi Paul travaille vraiment |
| Coût | une route à étendre + un module de règles à écrire | **zéro règle nouvelle** : `cartoucheDuMatin` est la règle |

⚠️ **Les deux ne se remplacent pas** : le cockpit parle des quadrants
(ADRAMELECH, ALTHEA, TAO…), Finubar parle des dépôts. Ils peuvent cohabiter sur
le même ciel, chacun sur ses nœuds. **Mais on ne fait pas les deux dans la même
boucle** (EB) : Finubar d'abord, il est prêt.

### 0.3 L'état de Finubar lui-même — collecte relancée ce jour

`node finubar/collecter.mjs`, ce 2026-09-02, après la séance : **8 dépôts, 5
lus, 3 hors séance** (non attachés — angle mort nommé depuis le correctif du
matin), **3 attendent un geste de Paul**, 2 en cours, **24 boucles ouvertes**.

**Réponse à la question de Paul — « le travail du jour est-il bien intégré ? »**
Oui pour le contenu : les cinq journaux portent la séance du 02/09, datée. Et
**Finubar signale lui-même les quatre grains dont l'ancre est en retard** :

| Dépôt | commits de **contenu** depuis sa note | lesquels |
|---|---|---|
| RenoDevis | **2** | `9fe8749`, `c34dd7b` (grain après squash + reprise) |
| RenoBoost | **1** | `56999e8` (le rappel devenu inutile) |
| RenoAgenda | **1** | `e2b7b96` (Directive EL) |
| RenoPredict | **1** | `fc330ba` (Directive EL) |
| Ultima | **0** | recalé par cette séance |

⚠️ **Et la mesure est plus fine qu'il n'y paraît — vérifié dans le code, pas
supposé.** `collecter.mjs` exclut du décompte les fichiers que Finubar écrit
lui-même (`FINUBAR.md`, le rappel de séance, `macro.json`, `finubar-macro.mjs`) :
un commit qui ne fait que recaler un grain ne se signale donc pas à lui-même.
Ce qui est compté est bien « le dépôt a-t-il avancé sur du **contenu** depuis
cette note ». Un `git rev-list` brut, lui, répond 2 à 3 — et aurait fait
conclure à un défaut qui n'existe pas.

**Il n'y a donc rien à réparer dans Finubar**, et c'est le point important : ce
que l'agrégat commité affiche est un **instantané daté**, pas un direct. La
page le dit déjà (`finubar.html` affiche la date de collecte). ⛔ **Le seul
risque, et il naît de cette boucle-ci** : porté sur l'écran d'ACCUEIL, vu tous
les matins, ce chiffre daté prendra l'autorité du temps réel. → §6 n° 1.

---

## 1. ① Le but — ce qui sera vrai à la fin

1. **Un seul écran.** On ouvre Ultima, on voit le ciel et, en bas, Finubar. Pas
   d'onglet à choisir, pas de page à aller chercher.
2. **La couleur oriente.** Une étoile dont la descendance attend quelque chose
   porte une **lueur d'appel** ; la couleur **monte** des astres vers leurs
   constellations, donc depuis la racine on voit *où* ça appelle avant de
   savoir *quoi*.
3. **Léo dit par quoi commencer** — une action, une seule, et c'est celle que
   Finubar a classée première. Elle suit la main qui l'a : si le goulot est un
   geste de Paul, Léo ne propose pas d'aller coder à côté.
4. **Les projets sont DANS le ciel** — les huit dépôts deviennent des astres de
   l'arbre. C'est la boucle du 21/08, fermée.

## 2. ② Les étapes — quatre paliers, un palier = une boucle = une PR

### Jalon 0 — l'écran ne fait jamais passer un instantané pour un direct ⛔ D'ABORD
Trois mots dans le bandeau : **« collecté le <date> »**, au même rang que le
reste, jamais en note de bas de page. Rien d'autre à changer dans `finubar/` :
la mesure y est juste (§0.3). C'est l'ÉCRAN qui, en portant ce chiffre au
premier plan, lui donnerait une fraîcheur qu'il n'a pas.

### P1 — le grain déclare son accroche au ciel
Un champ **`ciel`** dans les huit `FINUBAR.md` : l'id du nœud de navigation
auquel l'astre se rattache (`renoboost-ia`, `racine`, absent → `alpha`).
**Le grain déclare, la carte ne devine pas** — une table de correspondance
tenue à côté serait la deuxième vérité que Finubar s'interdit.
Livrables : le champ lu par `lireGrain` (borné, hostile par défaut), les huit
grains renseignés, l'assertion dans `unit-finubar.mjs`.

### P2 — la greffe et l'appel (le cœur visuel)
`js/adaptateur-finubar.mjs` — module **pur**, promu depuis la maquette :
`greffer(registre, agregat)` et `signaux(registre, agregat)`.
`js/ciel-noeud.mjs` lit `/api/finubar` (le fetch qu'il fait déjà pour le
cockpit), pose `data-appel` sur les étoiles concernées ; `css/stellaire.css`
en fait la lueur. **`js/ciel.js` n'est pas touché** (jurisprudence LV4).
**Fail-closed** : pas de session, route en erreur → aucun signal → le ciel est
strictement celui d'hier.

### P3 — le bandeau du bas
Le rendu de `cartouche` (≤ 3 signaux + 1 action), en bas de l'accueil, tout le
temps — pas un dialogue qui s'ouvre. Il **ne calcule rien** : deux règles de
priorité feraient dire 3 à l'étoile et 2 au bandeau (pre-mortem LV6, n° 8).
Un clic sur un signal **isole sa branche** dans le ciel : un signal qu'on ne
peut pas suivre est une notification, et une notification ne fait rien avancer.

### P4 — (optionnel, à décider après P3) le cockpit rejoint le même ciel
Les signaux des quadrants personnels (ALTHEA en sommeil, idées orphelines…)
sur les mêmes étoiles, avec la même couleur. **Ne pas l'ouvrir avant que P3
ait vécu.**

## 3. ③ Les moyens

| | |
|---|---|
| **Créé** | `js/adaptateur-finubar.mjs` (promu de la maquette) · `tests/unit-adaptateur-finubar.mjs` · `tests/smoke-accueil-finubar.mjs` |
| **Modifié** | `finubar/agreger.mjs` + `collecter.mjs` (jalon 0) · les 8 `FINUBAR.md` (champ `ciel`) · `js/ciel-noeud.mjs` · `css/stellaire.css` · `index.html` (le bandeau) · `tests/lancer.sh` |
| **Intouché** | **`js/ciel.js`** · `js/registre-lv3.mjs` (aucun renommage, aucun nœud retiré) · `api/finubar.js` (elle sert déjà tout) · **la base : aucune migration, aucune écriture — on lit** · auth / middleware / RLS |

**Aucune gate Supabase : pas une ligne de SQL.**

## 4. ④ Les critères de réussite — mesurés

1. **Jalon 0** — la date de collecte est **dans** le bandeau, lisible sans
   survol, et le harnais la cherche : un instantané qui ne dit pas sa date ne
   passe pas la revue.
2. **P2** — signaux à zéro ou sans session → **DOM du ciel identique à
   aujourd'hui** (diff automatisé) ; signal ≥ 1 → `data-appel` présent, compte
   **dit** dans l'`aria-label` (une information portée par la seule couleur
   n'existe pas pour tout le monde) ; `prefers-reduced-motion` respecté ;
   `smoke-ciel` 54/54 avant/après.
3. **P3** — le bandeau ne dépasse pas **35 % de la hauteur** à 390 × 844
   (mesuré : 34 % sur la maquette) ; le ciel garde ses gestes **sous** le
   bandeau (voir le défaut n° 2 ci-dessous) ; liste des mots interdits assertée.
4. **Chaque palier** — `bash tests/lancer.sh` **complet** vert avant fusion.

## 5. ⑤ Ce qu'on ne fait PAS

- **Pas de refonte du moteur** ni du registre de navigation.
- **Pas de notification hors d'Ultima** (mail, push) — la proactivité vit dans
  l'écran. *(La routine « récap du matin » du 02/09 existe déjà, ailleurs.)*
- **Pas d'IA dans les signaux** : de bout en bout déterministe. Léo **porte** la
  parole, elle ne la calcule pas.
- **Aucune donnée Finubar sur une surface publique** (voir §7).
- On ne touche pas au cockpit (c'est P4, et il attend).

## 6. ⑥ Pre-mortem — « c'est livré, et ça a échoué : pourquoi ? »

| # | Le mode de défaillance | Gravité | Ce qui le prévient |
|---|---|---|---|
| 1 | **L'accueil fait passer un instantané pour un direct** — l'agrégat est figé au dernier commit ; vu chaque matin en pleine page, il se lira comme l'état de l'instant, et un jour il aura trois jours de retard sans que rien ne le dise. | **haute** | **Jalon 0** : la date de collecte est dans le bandeau, pas en bas de page. (La mesure de dérive, elle, est juste — vérifiée dans `collecter.mjs`, §0.3.) |
| 2 | **Une étoile peinte n'est plus cliquable** — le bandeau la recouvre, le clic atterrit ailleurs, l'écran répond **et se trompe**. | **fatale** (rien ne la signale) | **Trouvé et corrigé dans la maquette le 02/09** : le ciel s'arrête à la lisière du bandeau, dont la hauteur est **mesurée**, jamais devinée. Le harnais l'assertera. |
| 3 | **La couleur devient un reproche** — les projets délaissés rougissent, Ultima gronde, Paul la fuit : l'effet inverse du but. | haute | Trois teintes tirées de la palette, **aucune rouge** ; l'absence de couleur est un silence, pas une note ; mots interdits assertés. |
| 4 | **Le ciel devient un sapin** — tout appelle, donc plus rien n'appelle. | haute | La couleur ne vient QUE de `rangDe` (0 et 1 = appel, 2 = braise) ; le bandeau reste borné à **3 signaux + 1 action**. Si un jour tout est or, c'est un fait sur le portefeuille, pas un défaut d'écran. |
| 5 | **Deux vérités** — l'étoile dit 3, le bandeau dit 2. | haute | **Un seul fetch**, un seul objet, `cartoucheDuMatin` seule juge. |
| 6 | **La donnée de Finubar fuit en public.** | haute | `design/` **est déployé** (vérifié) : la maquette porte des textes inventés. La production lit `/api/finubar`, derrière `requireUser`. |
| 7 | **L'accroche `ciel` est fausse ou absente** → l'astre se range sous ALPHA sans qu'on le sache. | moyenne | Repli explicite + assertion : tout grain sans `ciel` est **nommé** au rapport de collecte, jamais rangé en silence. |
| 8 | **Le dépliage d'office rend le ciel illisible.** | moyenne | **Mesuré sur la maquette** : à la racine, cinq étoiles sur deux étages se tassent sur un axe. → **éteint par défaut**, l'interrupteur reste pour arbitrage. |
| 9 | **Squash-merge : la branche empile sur l'historique pré-squash.** | moyenne | `git checkout -B <branche> origin/main` après chaque fusion (règle du 22/07). |
| 10 | **On ouvre LV6 en parallèle** et deux chantiers se disputent le même écran. | moyenne | Ce cadrage **est** LV6 P2+P3, source Finubar. LV6 reste gelé pour le reste. |

## 7. 🔒 Ce que la maquette a appris sur la sécurité

**`design/` n'est PAS dans `.vercelignore`** — vérifié le 02/09. Tout fichier
posé là est servi en clair sur le domaine public. Or `finubar/` en a été sorti
le 31/08 précisément pour que l'agrégat ne soit atteignable que par
`/api/finubar`. **Une maquette qui aurait embarqué le vrai agrégat aurait
annulé ce travail en une ligne**, sans qu'aucun test ne le voie.
D'où : fixture à **contenu inventé**, forme réelle. Le fichier autonome à
données réelles (`--reel`) ne se pose ni dans `design/` ni dans le dépôt.

⚠️ **Piste, non traitée ici** : ajouter `design/` aux prefixes privés
serait tentant — mais c'est là que vivent les maquettes que Paul doit pouvoir
ouvrir depuis une preview Vercel. À arbitrer séparément, pas en douce.

## 8. Les arbitrages attendus de Paul

| # | La question | Ma recommandation |
|---|---|---|
| 1 | **L'accroche des dépôts** : les 4 briques sous RENOBOOST IA (qui devient une constellation), `mon-dpe.fr` / `artisan-builder` / `ripair` sous ALPHA, Ultima à la racine ? | **Oui** — c'est la vérité du terrain, et ça donne enfin de la profondeur à ALPHA, qui n'avait qu'une porte. |
| 2 | **La couleur** : trois teintes (or = attend un geste de toi, bleu pâle = a avancé depuis sa note, braise = en cours) ? | **Oui, et jamais de rouge.** L'or est déjà la couleur des cartouches — la lueur ne dénonce pas, elle appelle. |
| 3 | **Le bandeau** : posé en bas en permanence, ou un cartouche qui s'ouvre une fois par jour (ce que proposait LV6 P3) ? | **En permanence.** Un cartouche qui s'ouvre devient un péage au 3ᵉ jour ; le bandeau se lit d'un coup d'œil et ne demande rien. |
| 4 | **Le dépliage d'office** de la branche qui appelle | **Non pour l'instant** — mesuré illisible à la racine (§6 n° 8). À reprendre le jour où une disposition adaptée est arbitrée. |
| 5 | **P4** (les signaux du cockpit sur le même ciel) | **Après P3**, jamais avant. |
