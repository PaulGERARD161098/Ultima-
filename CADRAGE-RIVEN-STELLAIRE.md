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
2. **La couche stellaire** : `css/stellaire.css`, jetons dérivés de ceux de
   `ciel.css` (une seule source chromatique pour le ciel et sa page).
   **Rien ne la conditionne** — ni attribut, ni bascule : une page l'a parce
   qu'elle charge le fichier, et c'est le seul interrupteur (arbitrage de Paul,
   2026-08-12 : « ça doit être comme ça tout le temps »). `styles.css` **n'est
   pas modifié** — c'est la garantie de non-fuite vers les 14 autres pages.
3. **Le retrait de l'arbre** : onglet, `#espace-arbre`, `js/arbre.js`, CSS
   dédié, `tests/smoke-arbre.mjs`. **Inventaire assertion par assertion avant
   suppression** : celles qui ne parlent pas de l'arbre (recherche, états vides,
   ouverture de fiche) **migrent** vers `smoke-ciel` / `smoke-contacts`.
   **VRANESH** (`vranesh.html`, l'arbre d'IMLADRIK) n'est **pas** touché.
4. **Le retrait de la carte** : onglet, `#espace-carte`, `js/carte.js`, le
   `<script>` Leaflet, les 43 appels `UltimaCarte` de `app.js`, la légende, le
   cadre gravé, la fixture Leaflet des harnais. **La donnée reste** (§5).
5. **Le resserrage de la CSP** (`middleware.js`) : les domaines de tuiles et
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

- **Le mot de l'état vide** : « Votre ciel n'a pas encore d'étoile ».
- **La rose des vents devenue rose stellaire** sur l'Accueil.
- **« Situer la ville »** à la place de « Trouver sur la carte ».
- **La carte 2D / 3D** — la phrase de Paul (« la carte en 2d bien, il faut
  pouvoir la passer en 3D aussi ») admet deux lectures qui ne mènent pas au
  même travail. **Question posée, non tranchée** : voir le registre ci-dessous.

**La routine de mesure** (`fondEffectif` / `contraste`, superposition alpha et
pire-cas sur les fonds en dégradé) est écrite pour **migrer telle quelle** dans
le harnais de l'étape 6. Elle n'est pas jetable.

---

### Registre des arbitrages — pris par Paul, 2026-08-12

| Question | Décision |
|---|---|
| Le sort de la carte | **Supprimée** aussi. RIVEN est le ciel, et rien d'autre. **Rouvert** par la phrase du soir (voir ci-dessous). |
| La portée du thème | **Toute la page RIVEN** — accueil, fiches, formulaires, contacts, onglets. |
| Le sort de l'arbre | **Suppression franche** : code, CSS, harnais. VRANESH intact. |
| Le rendu stellaire | **Validé** — « c'est bien comme ça ». |
| Le nom | **Thème stellaire**, tout le temps, sans interrupteur. Le mot « registre de nuit » est retiré. |
| Le ciel de la maquette | **Le vrai moteur**, pas un dessin. |

### ⏳ Actions Paul

- ✅ **Maquette livrée et corrigée** (étape ①) — `design/preview-riven-stellaire.html` :
  33 couples mesurés, 0 défaut, vrai ciel 3D, 30 étoiles, 0 hors cadre.
- 🔴 **UNE QUESTION BLOQUE L'ÉTAPE ②** : « la carte en 2d bien, il faut pouvoir
  la passer en 3D aussi ». Deux lectures :
  ① **la carte géographique** (Leaflet) reste et gagne une vue 3D — ce qui
  **annule** l'arbitrage « carte supprimée » ; ② **le ciel** garde une vue à
  plat (2D) doublée de la vue en volume, la carte restant supprimée.
  *Le travail n'est pas le même : ① rouvre la carte, la CSP et le géocodage ;
  ② ajoute une bascule au ciel.* **Non tranché, non commencé.**
- **Gate middleware** (étape ⑤, CSP resserrée) au moment de la fusion —
  **suspendu** à la réponse ci-dessus.
- **Arbitrages de forme, réversibles d'un mot** : le mot de l'état vide, la rose
  stellaire, « Situer la ville ».
