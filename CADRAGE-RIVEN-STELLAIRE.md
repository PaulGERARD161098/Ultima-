# CADRAGE — RIVEN en thème stellaire : une seule forme, le ciel

> Format 6 points (**directive EL**). Demande de Paul, **2026-08-12**, dictée :
> *« on a mis en place l'installation de la carte […] j'aimerais qu'on fasse un
> remodeling de la forme et qu'on applique le thème constellation, le thème
> sombre à la page, que là il y a un mix entre le côté galaxie, le côté sombre
> et l'ancien affichage de l'arbre et de l'archipel. Donc remodélisons tout ça :
> on supprime l'arbre et on garde que la constellation et le modèle 3D pour tout
> RIVEN. […] Et puis on verra si on ne peut pas passer sur un thème stellaire,
> un thème constellation pour Ultima LV4 : quand on arrive, on a les
> constellations plutôt que la boussole — mais ça, ça vient dans un deuxième
> temps. D'abord on termine RIVEN, on voit comment ça rend, ensuite on s'adapte.
> Cadre bien ça. »*

**Deux mots rendus par la reconnaissance vocale, tranchés en début de session** :
« la page **dagueuse** » → **la page RIVEN** (`riven.html`, seule page qui porte
le mix constaté) ; « nos **côtosiers racines** » → **les écrans racines
d'Ultima**, c'est-à-dire la console LV4. Un troisième mot est laissé de côté à
dessein : **« l'archipel » n'est pas sur RIVEN** — c'est la vue des idées
d'ADRAMELECH (`idees.html`). Il ne relève donc pas de cette boucle ; il ne sera
concerné que si le thème stellaire gagne la console (phase 2, §7).

---

## 0. Le constat — mesuré, pas supposé

Le mix que Paul voit n'est **pas un défaut de finition** : il est structurel.
`riven.html` (966 lignes) empile **cinq espaces** dans **deux registres
chromatiques incompatibles**, et un seul est de nuit.

| Espace | Registre actuel | Sort décidé |
|---|---|---|
| `#espace-accueil` (pilotage Léo) | parchemin (`styles.css`) | **passe en nuit** |
| `#espace-ciel` (constellations, 3D) | **nuit** (`css/ciel.css`) | **devient la forme unique** |
| `#espace-arbre` (arbre gravé) | parchemin | **supprimé** |
| `#espace-carte` (Leaflet + OSM) | parchemin | **supprimé** |
| `#espace-contacts` (registre) | parchemin | **passe en nuit** |

Le régime stellaire existe déjà, il est **bon, et il est enfermé** : `ciel.css`
(142 lignes) déclare ses jetons — `--ciel-nuit-haute #0a1220`, `--ciel-or
#a9884a`, `--ciel-creme #f2ead6` — **scopés à `.espace-ciel`**. Son propre
commentaire dit le parti pris à tenir : *« le thème sombre n'est PAS un dark
mode : c'est un atlas céleste gravé »*. Deux lignes plus bas, le fichier admet
la couture que Paul a fini par voir : *« l'entête et les outils vivent HORS de
la scène, sur le parchemin d'Ultima »*. **La frontière était déjà écrite dans
le code ; la demande de Paul est de la déplacer au bord de la page.**

Ampleur mesurée du retrait (ce n'est pas un « on enlève deux onglets ») :

- **Arbre** : `js/arbre.js` **445 lignes**, ~90 lignes dans `js/app.js`,
  38 déclarations dans `styles.css`, `tests/smoke-arbre.mjs` **55 assertions**.
- **Carte** : `js/carte.js` **273 lignes**, **43 mentions** dans `app.js` dont
  des chemins **partagés** (recherche, ouverture de fiche, surbrillance,
  `activerOnglet`), le `<script>` Leaflet, et **10 fichiers de harnais** qui
  chargent la fixture Leaflet.
- **CSP** : `middleware.js` autorise aujourd'hui `tile.openstreetmap.org`,
  `*.tile.openstreetmap.org` et `unpkg.com` **uniquement pour la carte**.
  Vérifié : **Leaflet n'est chargé que par `riven.html`**. Le retrait de la
  carte **rétrécit donc la surface d'attaque** — le correctif S3 d'hier
  (tuiles débloquées) devient sans objet, et sa ligne disparaît.

## 1. ① Le but — ce qui sera vrai à la fin

**RIVEN n'a plus qu'une forme : le ciel.** On y arrive dans un atlas céleste et
on n'en sort plus : accueil, constellations, fiches, formulaires, registre des
contacts, barre d'onglets, toasts — **tout est du même bord de la nuit**. Aucun
écran de RIVEN ne renvoie au parchemin, aucun arbre, aucune carte. Le registre
antique et sérieux (2026-07-08) **tient** : il change de fond, pas de nature —
encre de nuit jamais noire, filets dorés, capitales espacées, lisibilité et
accessibilité intactes.

Et le moyen d'y arriver est conçu pour **resservir** (directive EB) : le
thème stellaire devient une **couche de jetons réutilisable**, pas un patch de
`riven.html`. C'est cette couche que la phase 2 posera sur la console LV4.

## 2. ② Les étapes — dans cet ordre, aucune n'ouvre avant que la précédente ne ferme

1. **La maquette d'abord** (`design/preview-riven-stellaire.html`, données inventées,
   zéro CDN). Elle rend **tous** les états dans le thème stellaire : accueil de
   pilotage, ciel, **fiche**, **formulaire de saisie**, registre des contacts,
   toast, barre d'onglets, états vides et non connecté. Elle porte son **bandeau
   de mesure** : contraste calculé de chaque couple texte/fond. *Motif : la
   pratique éprouvée du 2026-08-01 (VRANESH, DRAUKHAIN) — et surtout, c'est ici
   qu'un « on remplace un mix par un autre » se voit pour rien, au lieu de se
   découvrir après avoir touché 18 harnais.* **→ arbitrage de Paul.**
2. ✅ **FAIT le 2026-08-13 — le retrait de l'arbre** : onglet, `#espace-arbre`, `js/arbre.js`, CSS
   dédié, `tests/smoke-arbre.mjs`. **Inventaire assertion par assertion avant
   suppression** : celles qui ne parlent pas de l'arbre (recherche, états vides,
   ouverture de fiche) **migrent** vers `smoke-ciel` / `smoke-contacts`.
   **VRANESH** (`vranesh.html`, l'arbre d'IMLADRIK) n'est **pas** touché.
3. ✅ **FAIT le 2026-08-13 — le retrait de la carte** : onglet, `#espace-carte`, `js/carte.js`, le
   `<script>` Leaflet, les 43 appels `UltimaCarte` de `app.js`, la légende, le
   cadre gravé, la fixture Leaflet des harnais. **La donnée reste** (§5).
4. ✅ **FAITE le 2026-08-13 — la couche stellaire** : `css/stellaire.css`, jetons dérivés de ceux de
   `ciel.css` (une seule source chromatique pour le ciel et sa page), plus les
   **quatre règles de `ciel.css`** relevées au §8. **Rien ne la conditionne** —
   ni attribut, ni bascule : une page l'a parce qu'elle charge le fichier, et
   c'est le seul interrupteur (arbitrage de Paul : « ça doit être comme ça tout
   le temps »). `styles.css` **n'est pas modifié** — garantie de non-fuite vers
   les 14 autres pages.

   > **L'ordre a changé le 2026-08-12, et c'est un gain, pas un détail.** Le
   > cadrage plaçait la couche stellaire AVANT les retraits. C'était thémer
   > l'arbre et la carte — 38 règles de `styles.css` et une légende — quelques
   > heures avant de les supprimer. **On retire d'abord, on thème ce qui
   > reste.**
5. ✅ **FAIT le 2026-08-13 — le resserrage de la CSP** (`middleware.js`) : les domaines de tuiles et
   `unpkg.com` tombent. `smoke-csp.mjs` est retourné pour **prouver l'absence**
   (règle du 2026-07-30). **GATE middleware.**
6. **Patrimoine COMPLET** (`bash tests/lancer.sh` en entier, règle du
   2026-07-22), sur les **deux écrans** 390 × 844 et 1670 × 900 (règle du cadre,
   2026-08-12) — puis **preview Vercel** livrée à Paul avec la page à ouvrir.

## 3. ③ Les moyens — fichiers touchés, et eux seuls

| Créé | `design/preview-riven-stellaire.html` · `css/stellaire.css` |
|---|---|
| **Modifié** | `riven.html` · `js/app.js` · `js/ciel.js` (jetons rapatriés) · `css/ciel.css` · `middleware.js` (gate) · `tests/smoke-ciel.mjs` · `smoke-contacts` · `smoke-recherche` · `smoke-flux-fiche` · `smoke-accueil*` · `smoke-antique` · `smoke-csp` · `tests/lancer.sh` |
| **Supprimé** | `js/arbre.js` · `js/carte.js` · `tests/smoke-arbre.mjs` |
| **Intouché** | `css/styles.css` · les 14 autres pages · `vranesh.html` · `api/**` · la base (aucune migration) |

## 4. ④ Critères de réussite — vérifiables, mesurés, aucun « ça a l'air bien »

*Rappel de la règle du 2026-08-01 : « ça a l'air bien » n'est pas un critère,
c'est l'absence de critère.*

1. **Aucun jeton parchemin ne survit sur RIVEN.** Un harnais parcourt les trois
   espaces restants **plus** la fiche, le formulaire et un toast ouverts, et
   exige de chaque conteneur une **luminance de fond < 0,20**. Mesuré par
   `getComputedStyle`, pas jugé à l'œil.
2. **Lisibilité prouvée** : tout couple texte/fond de RIVEN atteint **4,5:1**
   (WCAG AA ; 3:1 pour les grands titres). Calculé dans le harnais.
3. **L'arbre et la carte n'existent plus** : `grep -rn "arbre\|carte\|leaflet"`
   sur `riven.html` et `js/app.js` ne rend **aucune** occurrence fonctionnelle
   (VRANESH exclu du périmètre) ; les onglets sont **trois**.
4. **La CSP ne connaît plus les tuiles** : `smoke-csp.mjs` **cherche** les
   domaines OSM et `unpkg` dans l'entête et exige de **ne pas les y trouver**.
5. **Non-fuite prouvée** : `smoke-console`, `smoke-quadrants`, `smoke-idees`,
   `smoke-imladrik`, `smoke-vranesh`, `smoke-draukhain` passent **sans une seule
   retouche** — c'est la preuve que la couche stellaire n'a pas débordé.
6. **Zéro perte de couverture** : la baisse d'assertions ne dépasse pas le
   nombre d'assertions **proprement** « arbre » et « carte » recensées à
   l'étape 3. Tout le reste a migré.
7. **Le cadre tient dans l'écran** sur 390 × 844 **et** 1670 × 900, ciel compris.
8. **Patrimoine COMPLET vert, sortie 0.**
9. **Aucune migration, aucune colonne supprimée** : `supabase/migrations/`
   inchangé.

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **On ne touche pas à la donnée géographique.** `/api/geocode`, les colonnes
  lat/lon et le géocodage à la saisie **restent en service** : les coordonnées
  continuent d'être renseignées même sans écran pour les montrer. *Motif : une
  suppression d'écran se revient d'un `git revert` ; un trou de données, non.*
  Seul le **libellé** du bouton change — « Trouver sur la carte » n'a plus
  d'objet, il devient **« Situer la ville »** (EL principe 4 : un mot posé au
  hasard est une faute au même titre qu'une variable mal nommée).
- **On ne touche pas à la console LV4** ni à la boussole : c'est la phase 2, et
  Paul l'a explicitement mise après (« ça vient dans un deuxième temps »).
- **On ne touche pas à l'archipel** d'ADRAMELECH ni à aucun autre quadrant.
- **On ne refait pas le ciel** : ni sa géométrie, ni sa 3D, ni ses interactions.
  Il est l'acquis ; on lui donne la page, on ne le redessine pas.
- **On n'ajoute aucune fonctionnalité** au passage. Patch minimal, style
  existant, pas de refonte (directive de discipline).

## 6. ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| # | Le mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **Le noir devient un « dark mode » générique** : Ultima perd son registre antique et gagne une interface d'app quelconque. | Les jetons dérivent de `ciel.css` (atlas céleste gravé), pas d'une palette neuve. La maquette tranche **avant** le code. |
| 2 | **Illisible** : l'encre sépia posée sur la nuit, les filets dorés qui disparaissent. | Le contraste est **calculé** (critère 2), jamais regardé. Le défaut sort au bandeau de mesure de la maquette. |
| 3 | **Le thème fuit** : `styles.css` est partagé par 14 pages, une variable redéfinie et la console vire au noir sans prévenir. | La couche vit dans son propre fichier, chargé page par page ; `styles.css` n'est pas modifié ; six harnais d'autres quadrants doivent passer **sans retouche** (critère 5). |
| 4 | **Le retrait de la carte casse des chemins invisibles** : `UltimaCarte` est appelé dans la recherche, l'ouverture de fiche, la surbrillance — 43 fois. | Le retrait est **guidé par les harnais existants** (`smoke-recherche`, `smoke-flux-fiche`, `smoke-contacts`), qui doivent rester verts **sans changer d'attente fonctionnelle**. |
| 5 | **Trou de données géographiques** : le géocodage part avec la carte, et six mois plus tard plus une seule coordonnée n'est rattrapable. | §5 : l'API, les colonnes et le géocodage à la saisie restent. Seul l'écran disparaît. |
| 6 | **On remplace un mix par un autre** : la fiche ou le formulaire oubliés, restés blancs au milieu de la nuit. | La maquette rend **tous** les états, y compris fiche, formulaire, toast et états vides. Le critère 1 les ouvre pour les mesurer. |
| 7 | **La suppression de `smoke-arbre.mjs` emporte de la couverture** qui ne parlait pas de l'arbre (55 assertions, toutes ne sont pas « arbre »). | Inventaire assertion par assertion **avant** suppression ; migration vers `smoke-ciel`/`smoke-contacts` ; critère 6 chiffré. |
| 8 | **La CSP casse autre chose** : un autre écran chargeait Leaflet sans qu'on le sache. | Déjà vérifié — `leaflet` n'apparaît que dans `riven.html` et les fixtures de test. **La preuve est refaite au moment du patch**, pas reprise de confiance. |
| 9 | **Conflit de fusion** : une session parallèle avance `main` pendant la boucle. | Branche repartie de `origin/main` avant tout nouveau commit (règle du 2026-07-22) ; fusion sans délai une fois verte (règle du 2026-07-30). |
| 10 | **On fait la phase 2 en passant** : la console y gagne du noir « tant qu'on y est », et plus rien n'est arbitrable. | §5 l'interdit explicitement. Paul juge le rendu de RIVEN **d'abord**. |

## 7. La suite — phase 2, cadrée ici, **non exécutée**

Ce que Paul a demandé pour « **Ultima LV4** », et qui **attend son verdict sur
le rendu de RIVEN** : le thème stellaire posé sur les **écrans racines**, et,
à l'arrivée dans la console, **des constellations à la place de la boussole**.

Deux choses sont déjà acquises pour ce jour-là, et c'est délibéré :

- **La couche `css/stellaire.css` est écrite pour resservir** — la console la charge
  et déclare l'attribut, rien d'autre. Aucun travail de thème à refaire.
- **Le savoir-faire « constellations » est capitalisé** dans `js/ciel.js` et les
  maquettes `design/preview-riven-{galaxie,voute,3d}.html`, déjà arbitrées le
  2026-08-11.

Ce qui **reste entièrement à cadrer** le moment venu, et qu'on n'anticipe pas
ici : ce qu'une constellation **représente** sur la console (un quadrant ? un
chantier en cours ?), le sort de la boussole (remplacée ou reléguée), et
l'atterrissage de l'archipel d'ADRAMELECH dans un ciel. **Un cadrage propre,
le jour venu.**

---

## 8. Étape ① — FAITE, puis CORRIGÉE par Paul

`design/preview-riven-stellaire.html` (+ `.css` + `.js`, données inventées,
zéro ressource externe, script en fichier séparé car la CSP d'Ultima interdit
`'unsafe-inline'` — une maquette à script inline serait **blanche** sur la
preview Vercel). Elle rend **les huit états** et se mesure elle-même.

### Le verdict de Paul, et les deux défauts qu'il a vus en dix secondes

*« alors c'est bien comme ça »* — le thème est **validé**. Puis, dans la même
phrase, deux constats que la mesure ne pouvait pas produire :

1. **« où est l'accueil 3D comme avant ? »** — ma maquette dessinait un ciel
   **plat**, de fabrication maison, « pour la démonstration ». Le vrai écran
   d'arrivée est un volume depuis le 2026-08-11. *Une maquette qui remplace le
   moteur qu'elle prétend montrer ne montre plus rien : elle a fait juger à
   Paul une régression que personne n'avait décidée.* **Corrigé** : la maquette
   charge désormais `../js/ciel.js` et `../css/ciel.css` du produit et leur
   donne 18 fiches, 12 personnes et 22 relations inventées. Le ciel qu'on y
   voit **est** celui d'Ultima.
2. **« enlève registre de nuit, ça doit être comme ça tout le temps, thème
   stellaire et galaxies »** — le mot « registre » supposait un choix parmi
   d'autres. **Il n'y en a pas.** Renommé partout : le thème est **stellaire**,
   la couche à naître est `css/stellaire.css`, et **rien ne la conditionne** —
   ni attribut, ni bascule. Une page l'a parce qu'elle charge le fichier ;
   l'interrupteur est à la porte, pas dans le CSS.

### DEUX FOIS J'AI INVENTÉ CE QUI EXISTAIT DÉJÀ

*Le même travers, deux fois dans la même journée, et c'est la leçon de cette
étape :* la maquette a écrit **des couleurs de type** et **un mot d'état vide**
qui vivaient déjà dans le produit — `COULEURS_NUIT` dans `js/ciel.js`, et
« **Votre ciel attend sa première étoile — touchez +** » dans `js/app.js`,
posés tous deux le 2026-08-11 avec le ciel lui-même. J'ai même **présenté à
Paul comme un arbitrage à rendre** un mot qui était rendu depuis deux jours.
**Corrigé** : la maquette reprend les valeurs et les mots du produit. *Avant
d'inventer quoi que ce soit dans une maquette, chercher si le produit le porte
déjà — la directive EB le disait, et je ne l'ai pas appliquée à ma propre
maquette.*

### Ce que le chargement du VRAI ciel a révélé — et qu'aucune imitation n'aurait dit

- **Les couleurs de type existaient déjà.** `js/ciel.js` porte `COULEURS_NUIT`
  (artisan `#f2a15a`, partenaire `#7cb8ea`, lead `#6fd39b`, chantier `#b995e8`)
  depuis le 2026-08-11, toutes **au-dessus de 7:1**. Ma maquette en avait
  inventé de parallèles : deux vérités chromatiques pour une seule donnée,
  c'est-à-dire une de trop. **Les miennes sont supprimées**, celles de
  `ciel.js` adoptées.
- **Quatre règles de `ciel.css` s'appuient encore sur le parchemin** — relevé
  exact, obtenu en chargeant le fichier au lieu de le lire :
  `.ciel-cartouche h2` et `.ciel-bascule` (`--encre-sepia`),
  `.ciel-cartouche .ciel-sous` et `.ciel-message` (`--encre-sepia-douce`).
  C'est la liste de ce que l'étape ② devra déplacer, ni plus ni moins.

### Mesuré au navigateur, sur 390 × 844 ET 1670 × 900

| | |
|---|---|
| Couples texte/fond mesurés (sur les 8 états) | **33** |
| Défauts de contraste (seuils WCAG AA) | **0** |
| Pire couple | **6,03:1** — bouton « Supprimer », seuil 4,5 |
| Luminance du fond le plus clair | **0,0191** (plancher du cadrage : < 0,20) |
| Étoiles rendues par le vrai moteur | **30** (18 fiches + 12 personnes en orbite) |
| Étoiles hors cadre · libellés d'amas hors cadre | **0 · 0** (après convergence) |

*La mesure avait fait son travail avant publication : le bleu partenaire du jour
(`#1e6fb8`) tombe à **3,28:1** sur le fond stellaire, **sous le seuil AA**.*

**Et une mesure fausse a été jetée en route** : mon premier contrôle de
géométrie comparait la `getBBox()` du SVG à son `viewBox` et criait au
débordement. Faux instrument — halos et zones de captation débordent
**volontairement** et sont rognés. Le harnais du produit mesure les **centres**
des étoiles et des libellés ; repris tel quel, il dit **0 hors cadre**.
*Un critère mal choisi produit un défaut qui n'existe pas, aussi sûrement qu'un
critère absent laisse passer celui qui existe.*

### Reste à arbitrer

- **La rose des vents devenue rose stellaire** sur l'Accueil.
- **« Situer la ville »** à la place de « Trouver sur la carte ».
- **La carte 2D / 3D** — la phrase de Paul (« la carte en 2d bien, il faut
  pouvoir la passer en 3D aussi ») admet deux lectures qui ne mènent pas au
  même travail. **Question posée, non tranchée** : voir le registre ci-dessous.

**La routine de mesure** (`fondEffectif` / `contraste`, superposition alpha et
pire-cas sur les fonds en dégradé) est écrite pour **migrer telle quelle** dans
le harnais de l'étape 6. Elle n'est pas jetable.

## 9. La bascule « à plat » du ciel — cadrée à part (format 6 points)

Demandée par Paul le 2026-08-12 : *« on regarde bien la 3D, mais si jamais je
n'ai pas assez de réseau ou quoi, je peux switcher au mode 2D »*. Le cadrage
ne la portait pas ; elle ne part donc pas sans son cadrage.

**Une correction de motif, d'abord, parce qu'elle change le critère de
réussite.** Le ciel 3D ne consomme **aucun réseau** : tout est calculé dans
l'appareil, en SVG, sans une requête. Ce qu'il coûte, c'est du **calcul et de
la batterie** — une boucle d'animation qui tourne tant que l'écran est ouvert.
La bascule est donc justifiée, mais pas par ce qu'on croyait : elle sert
l'**appareil qui peine**, la **fin de batterie**, et la **lecture d'un coup
d'œil sans que rien ne bouge**. Un mode « économe » qui n'économiserait rien de
mesurable serait un bouton décoratif.

① **Le but.** Le ciel garde le volume **par défaut** — c'est l'écran d'arrivée
validé le 2026-08-11, on n'y touche pas. Un bouton le fait passer à une **vue à
plat** : mêmes étoiles, mêmes constellations, mêmes noms, **aucune animation,
aucune perspective**. Le choix est **retenu** d'une visite à l'autre.

② **Les étapes.** (a) `js/ciel.js` gagne une option `plat` : la projection perd
sa profondeur, la boucle d'animation ne démarre pas ; (b) un bouton dans
`#ciel-outils`, à côté de « Tout voir » ; (c) le choix est mémorisé
(`localStorage`) et relu à l'ouverture ; (d) le harnais.

③ **Les moyens.** `js/ciel.js` · `riven.html` · `css/ciel.css` ·
`tests/smoke-ciel.mjs`. **Rien d'autre.**

④ **Les critères de réussite — mesurés.**
- En mode plat, **zéro image d'animation** demandée après stabilisation
  (`requestAnimationFrame` compté par le harnais, pas supposé).
- **Aucune étoile perdue** : le même nombre d'étoiles, de libellés d'amas et de
  liens qu'en volume — un mode dégradé qui perd de la donnée est un bug.
- **Toutes dans le cadre** (critère du produit : centres contre `viewBox`).
- Le choix **survit au rechargement**.
- Le bouton dit son état (`aria-pressed`), et le mode plat s'impose **d'office**
  si `prefers-reduced-motion` est déclaré — la préférence système d'abord.

⑤ **Ce qu'on ne fait PAS.** Aucun autre réglage, aucun « mode économie »
global, aucune bascule sur les autres écrans. Le volume reste le défaut : la
2D est un recours, pas une alternative posée sur le même plan.

⑥ **Pre-mortem.**
- *Le mode plat devient un second moteur à maintenir* → il ne duplique rien :
  même code, profondeur neutralisée, boucle non démarrée.
- *On perd des étoiles à plat sans le voir* → le critère 2 les compte.
- *La bascule ne fait rien de mesurable* → le critère 1 compte les images.
- *Le réglage mémorisé enferme Paul dans un mode qu'il a oublié d'avoir choisi*
  → l'état est écrit sur le bouton, visible à chaque ouverture.

**Ordre** : cette bascule vient **après** les retraits et la couche stellaire.
Elle touche `ciel.js`, qu'on veut stable pendant qu'on démonte autour de lui.

## 10. Étape ② — le retrait de l'arbre. Ce que le démontage a appris

**Fait le 2026-08-13**, au go de Paul (« Go — enlève arbre »).

| Retiré | Volume |
|---|---|
| `js/arbre.js` | **445 lignes**, supprimé |
| `js/app.js` | **103 lignes** (bloc « Onglet Arbre », écouteurs, re-rendu au redimensionnement, dispatch) |
| `css/styles.css` | le bloc « Espace Arbre » entier |
| `riven.html` | l'espace, l'onglet, le script |
| `tests/smoke-arbre.mjs` | **55 assertions**, supprimé après inventaire |

**Vérifié : patrimoine COMPLET, 56 harnais, sortie 0, aucun verdict faux.**

### Trois choses que seul le démontage pouvait révéler

1. **Le ciel dépendait d'une fonction rangée chez l'arbre.**
   `ouvrirFicheDepuisArbre` vivait dans le bloc « Onglet Arbre » — mais c'est le
   CIEL qui l'appelle depuis le 2026-08-11. La supprimer avec son bloc a cassé
   l'ouverture des fiches depuis les étoiles. **Rétablie sous son vrai nom**,
   `ouvrirFicheDepuisEtoile`, rangée chez son seul appelant. *Un bloc de code
   n'appartient pas à ce dont parle son titre : il appartient à qui l'appelle.*
2. **Le ciel EMPRUNTAIT trois classes CSS à l'arbre** — `champ-recherche-arbre`,
   `arbre-recherche`, `arbre-ajouter`. Supprimer le CSS de l'arbre aurait
   dépouillé la barre d'outils du ciel **sans qu'aucun harnais ne le voie** (un
   bouton nu reste un bouton cliquable). Les règles partagées **survivent sous
   les noms du ciel** ; le reste est parti.
3. **Des mots visibles parlaient encore de l'arbre.** Le formulaire disait
   *« le métier principal : c'est lui qui fait la branche de l'arbre »* et
   *« n'ajoutent pas de branche à l'arbre »*. Sans arbre, ces phrases sont
   fausses — elles parlent maintenant de **constellation**. La puce des
   suggestions de Léo, un arbre gravé, est devenue une **étoile** : une icône
   qui montre un objet disparu ment au lecteur.

### La couverture n'a pas baissé — c'est mesuré, pas espéré

Sur les 55 assertions de `smoke-arbre.mjs`, **sept ne parlaient pas de l'arbre**.
Elles ont été **écrites dans `smoke-ciel.mjs` et vues vertes AVANT** que le
fichier ne soit supprimé :

- **le double codage** — le type dit en toutes lettres dans l'étiquette
  accessible, jamais par la seule couleur ;
- **le mouvement réduit** — mesuré par CONSTAT : la dérive activée, on relève la
  position d'une étoile, on attend, on la relève. Elle bouge sans préférence,
  elle est immobile sous `prefers-reduced-motion` ;
- **l'état vide** — le message exact, les outils cachés, le bouton d'ajout.

*Deux frictions techniques, notées parce qu'elles resserviront* : dans un
volume, on ne clique pas une étoile qui dérive (couper la dérive d'abord), et
les zones de captation se chevauchent — le vidage du réseau passe par
`dispatchEvent`, le pointage réel restant couvert par `tapOuvreLaBonneFiche`.

**Le compteur d'onglets est devenu le compteur du démontage** : `cinqOnglets`
est devenu `quatreOnglets`, et deviendra `troisOnglets` quand la carte partira.

## 11. Étape ③ — le retrait de la carte, et ce qu'il a coûté

**Fait le 2026-08-13** (« Ok go / Merge tout »).

| Retiré | Volume |
|---|---|
| `js/carte.js` | **273 lignes**, supprimé |
| `js/app.js` | l'espace, les **43 appels** `UltimaCarte`, la recherche carte (v3-⑥), les filtres, l'état `filtres` |
| `riven.html` | l'espace, l'onglet, la légende, **Leaflet** (script + feuille de style) |
| `middleware.js` | **tous les domaines tiers** de la CSP |
| `tests/` | `smoke-recherche.mjs` supprimé, `smoke-antique.mjs` réduit de moitié, **la fixture Leaflet retirée de 14 harnais et de `lancer.sh`** |

**Vérifié : patrimoine COMPLET depuis un cache VIERGE — 55 harnais,
742 verdicts, sortie 0.**

### Le gain de sécurité, chiffré

La CSP est passée de **trois hôtes tiers autorisés** (`unpkg.com`,
`tile.openstreetmap.org`, `*.tile.openstreetmap.org`) à **zéro**. Et
`'unsafe-inline'` sur `style-src`, qui n'existait que parce que Leaflet posait
des styles inline sur ses marqueurs, **est tombé avec lui**. `smoke-csp.mjs`
est retourné : il **cherche** ces domaines et exige de **ne pas les trouver**
(règle du 2026-07-30), et vérifie qu'aucune requête ne sort vers un tiers.
*Le correctif S3 de la veille — le domaine nu des tuiles, qui bloquait 100 % du
fond de carte — n'a plus d'objet : il n'y a plus de tuile.*

### Quatre pièges, dont un vrai bug que j'ai introduit

1. **Un écouteur orphelin a tout cassé.** `#bouton-ajouter` était le bouton de
   la barre d'outils de la carte : parti avec elle, son
   `addEventListener` a levé une TypeError qui a arrêté `brancherEvenements`
   — donc les données ne se chargeaient plus **du tout**, et le ciel restait
   vide. *Un harnais l'a vu ; un coup d'œil à l'écran ne l'aurait pas vu, la
   page s'affichant parfaitement.* Un **audit complet des identifiants**
   référencés par `app.js` et absents de `riven.html` a suivi : zéro restant.
2. **Quatre chemins menaient encore à la carte** (`activerOnglet('carte')`) :
   ouvrir une cible depuis l'Accueil, ouvrir un formulaire, la suggestion de
   rapprochement de Léo, le raccourci « Voir la carte ». Tous mènent au
   **ciel**. Le raccourci s'appelle désormais **« Voir le ciel »**.
3. **La dictée en mode remplacement allait mourir sans qu'on le voie.**
   `dictee.js` porte une option `remplacer` (chaque dictée remplace au lieu
   d'ajouter) qui n'avait **qu'un seul porteur** : le champ de recherche de la
   carte. Elle est **transférée** à la recherche du ciel — pas ajoutée : la
   capacité existait, elle change de champ.
4. **Des phrases promettaient une carte** : « il apparaîtra sur la carte »,
   « n'est pas encore placé sur la carte », « Position enregistrée sur la
   carte ». Réécrites. Le bouton du formulaire dit **« Situer la ville »**.

### ⚠️ UNE PERTE FONCTIONNELLE RÉELLE, à arbitrer

La recherche de la carte offrait : **0 résultat → création du contact
pré-remplie avec le terme cherché**. La recherche du ciel ne le fait pas — elle
dit seulement qu'il n'y a pas de résultat. *Ce n'est pas un oubli de démontage :
c'est une fonction qui vivait dans l'écran supprimé.* Elle est petite, elle est
utile, et elle mérite d'être **portée dans le ciel** — cadrée avec la bascule
2D (§9), pas en douce aujourd'hui.

### Ce que la carte laisse derrière elle, intact

`/api/geocode`, les colonnes `lat`/`lng`, le géocodage à la saisie et la
confirmation écrite de la position. **Aucune migration, aucune donnée
supprimée.** Le harnais du géocodage a été retourné : il ne vérifie plus
l'aperçu sur la carte mais **les coordonnées retenues par le formulaire** —
c'est-à-dire ce qui compte.

## 12. Étape ④ — le thème stellaire posé. Ce que l'instrument a appris

**Fait le 2026-08-13**, au go de Paul (« Ok pour les deux, on avance »).

`css/stellaire.css` : **une redéfinition de jetons**, et huit règles de
composant — pas une de plus. `css/styles.css` n'est pas modifié d'une ligne
pour le thème ; les quatorze autres pages ne bougent pas.

**Mesuré** (`tests/smoke-stellaire.mjs`, nouveau) : **278 couples texte/fond**
sur **sept états** — ciel, accueil, contacts, fiche, formulaire, connexion,
toast. **0 défaut de contraste. Fond le plus clair : luminance 0,0698** pour un
plancher à 0,20. Patrimoine COMPLET : **56 harnais, 755 verdicts, sortie 0**.

### Le pari des jetons, chiffré

Sur les dix règles de composant que j'avais écrites **par anticipation**, la
mesure en a gardé **une seule** (le bandeau « Mode démo », fond crème en dur).
Les neuf autres suivaient déjà les jetons — et l'une d'elles **cassait** la
plaque de relance : `.panneau-bois` porte un dégradé en `var(--parchemin)`,
donc il basculait tout seul ; ma règle l'avait remplacé par un aplat, et
`smoke-antique` l'a dit. *J'avais écrit dans ce fichier « une règle seulement
là où la mesure l'exige », puis j'en ai écrit dix avant la première mesure.*

Les quatre règles de `ciel.css` relevées au §8 (celles qui s'appuyaient sur
`--encre-sepia`) n'ont **pas eu besoin d'être touchées** : le jeton redéfini
les emmène. C'était exactement le pari de la couche.

### 🔻 MON INSTRUMENT MENTAIT, ET C'EST UNE CAPTURE D'ÉCRAN QUI L'A DIT

Le harnais rendait un vert franc pendant que le cartouche « ULTIMA » s'affichait
**doré sur parchemin clair**, en haut de chaque écran. Raison : devant un fond
en dégradé qu'il ne savait pas lire, il **supposait « sombre »**. Il supposait
donc le résultat qu'il prétendait mesurer.

Pire : ma première correction avait doré le TITRE (mesuré à 1,61:1 en encre
sépia) — le harnais était passé au vert et j'avais **aggravé** le défaut, en
posant de l'or sur du crème (1,47:1). Corrigé deux fois :

- l'instrument **lit les couleurs écrites dans le dégradé** et retient la plus
  claire (le pire cas), au lieu d'une liste blanche et d'un fallback optimiste ;
- la **plaque entière** passe la nuit, fond compris — ce qu'il fallait faire
  depuis le début.

*Un instrument qui suppose ce qu'il mesure est pire qu'une absence de mesure :
il donne le droit de ne pas regarder.*

### Deux défauts trouvés par d'AUTRES harnais que le mien

1. **`smoke-connexion`** a vu ce que je ne visitais pas : l'écran de connexion
   (crème sur blanc cassé, 1,15:1). Le champ portait son fond en dur sous un
   sélecteur plus spécifique que ma règle générique. Corrigé — **et l'écran est
   désormais mesuré** par `smoke-stellaire`.
2. **`smoke-intendant`** a refusé mes badges à fond translucide : il lit
   `backgroundColor` sans composer l'alpha et trouvait 1,00:1. Il avait raison
   deux fois — le contraste réel tombait à **4,32:1**, sous le seuil. Fonds
   rendus **opaques** : mesurables par n'importe quel harnais, et entre 6 et
   8:1.

### Un test qui tient sur ce qui ne doit pas changer

`smoke-antique` exigeait littéralement `rgb(246, 238, 217)` et
`rgb(59, 47, 28)` : la palette du parchemin, gravée dans le test. Il est passé
au rouge alors que la plaque faisait exactement ce qu'on lui demande — suivre
ses jetons. Il **lit désormais les jetons** et vérifie qu'ils sont respectés.
Ce qu'il protège n'a pas bougé d'un mot : registre gravé, sans bois, sans
cursive. *Un test doit tenir sur ce qui ne doit pas changer, pas sur ce qui a
le droit de changer.*

### La perte fonctionnelle est réparée

**« 0 résultat → création pré-remplie »**, seule fonction perdue au démontage
de la carte, est **portée dans la recherche du ciel** : même garde (connexion),
même geste (le terme cherché devient le nom, curseur au bout), même mot
(« + Ajouter “…” comme contact »). Éprouvée par trois assertions neuves dans
`smoke-ciel`.

### Un défaut ANTÉRIEUR, trouvé au passage

Sur 390 px — l'écran de Paul — la ligne de relation de la fiche cassait son
titre **une lettre par ligne** (« Ap / po / rt / d'a / ffa / ires ») : le select
de statut et les deux boutons prenaient toute la largeur. **Antérieur au thème**
(mesuré identique sans lui : 494 px de haut pour une relation), trouvé par une
capture d'écran. Corrigé (`flex-wrap`), et **mesuré** désormais : largeur du
texte ≥ 150 px, hauteur de ligne ≤ 200 px.

---

### Registre des arbitrages — pris par Paul, 2026-08-12

| Question | Décision |
|---|---|
| Le sort de la carte | **Supprimée** aussi. RIVEN est le ciel, et rien d'autre. **Confirmé** le soir même : « la carte » de la phrase du soir désignait le CIEL, pas la carte géographique. |
| La portée du thème | **Toute la page RIVEN** — accueil, fiches, formulaires, contacts, onglets. |
| Le sort de l'arbre | **Suppression franche** : code, CSS, harnais. VRANESH intact. |
| Le rendu stellaire | **Validé** — « c'est bien comme ça ». |
| Le nom | **Thème stellaire**, tout le temps, sans interrupteur. Le mot « registre de nuit » est retiré. |
| Le ciel de la maquette | **Le vrai moteur**, pas un dessin. |

### ⏳ Actions Paul

- ✅ **Étape ④ FAITE : le thème stellaire est posé** (2026-08-13). 278 couples
  mesurés sur 7 écrans, 0 défaut, fond le plus clair à 0,0698. Détail au §12 —
  dont **mon instrument qui mentait**, deux défauts trouvés par d'autres
  harnais, et un défaut de mise en page antérieur au thème.
- ✅ **La perte fonctionnelle est réparée** : « 0 résultat → création
  pré-remplie » vit dans la recherche du ciel.
- ✅ **Étape ③ FAITE : la carte est supprimée** (2026-08-13). CSP à **zéro
  hôte tiers**, `'unsafe-inline'` tombé, fixture Leaflet retirée du patrimoine.
  **55 harnais, 742 verdicts, sortie 0, cache vierge.** Détail au §11 — dont
  **une perte fonctionnelle à arbitrer** (0 résultat → création pré-remplie).
- ✅ **Étape ② FAITE : l'arbre est supprimé** (2026-08-13). 445 lignes de
  `js/arbre.js`, 103 lignes d'`app.js`, ~190 lignes de `styles.css`, l'espace,
  l'onglet, le harnais. **Patrimoine COMPLET vert : 56 harnais, sortie 0,
  aucun verdict faux.** Trois surprises, toutes consignées au §10.
- ✅ **Maquette livrée et corrigée** (étape ①) — `design/preview-riven-stellaire.html` :
  33 couples mesurés, 0 défaut, vrai ciel 3D, 30 étoiles, 0 hors cadre.
- ✅ **La question du soir est TRANCHÉE** (voir §9) : « la carte » désignait le
  **ciel**. La carte géographique reste supprimée ; le ciel gagne une **bascule
  vers une vue à plat**.
- **Gate middleware** (étape ⑤, CSP resserrée) au moment de la fusion.
- **Arbitrages de forme, réversibles d'un mot** : le mot de l'état vide, la rose
  stellaire, « Situer la ville ».
