# CADRAGE — RIVEN en nébuleuses : le Ciel à plat, groupé par grand secteur

> Format 6 points (**directive EL**). Demande de Paul, **2026-09-30**, après
> l'entrée des 39 contacts du Club de la Concorde : *« je ne vois pas trop les
> étoiles nouvelles, il y a trop d'overlap : créons des nébuleuses par secteur
> d'activité, qui regroupent les domaines, et dedans il doit y avoir les
> étoiles »*. Deux aperçus lui ont été montrés (A : nébuleuses ; B : que les
> étoiles). Sa réponse : *« A, go pour cadrer la boucle. J'aime ta maquette,
> gardons ce format. »*
>
> ⛔ **Ce document CADRE. Il n'exécute rien.** La boucle de code s'ouvre au go
> de Paul sur ce cadrage (EL, principe 3).

---

## 0. Ce qui existe — mesuré le 30/09, pas supposé

**La base** (lecture seule, projet Ultima, remesurée le 30/09 après l'ajout
des 4 cartes du salon BATIMAT) : **54 fiches**, **39 secteurs distincts**,
**5 fiches sans secteur**, **1 relation**, **1 rattachement** (Henry Huvey →
RénoBoost IA), 43 personnes. La maquette, elle, a été construite sur les
50 fiches d'avant ce dernier ajout.

**Le Ciel actuel de RIVEN** : `js/ciel.js` (2 071 lignes). Chaque secteur
distinct y devient un amas sur une sphère 3D (`grouper` → `construireMonde`).
Trente-sept secteurs donnent trente-sept amas de une ou deux étoiles, dont les
libellés se recouvrent. C'est le constat de Paul.

**`js/ciel.js` est partagé, largement.** Dix pages le chargent : `adramelech`,
`alpha`, `bcp`, `imladrik`, `index`, `omega`, `riven`, `stellar-v2`, `tao`,
`vranesh`. `js/ciel-noeud.mjs`, `js/leo-navigation.mjs` et `js/vranesh.js`
s'en servent, ainsi que six aperçus de `design/`. RIVEN l'appelle depuis
`js/app.js` (`rendre(scene, …)` avec `surClicNoeud`, `surClicPersonne`,
`correspond`, `plat`, `fond`, `stellarV2`). **Et une autre séance le modifie
en ce moment** : la PR #315 (brouillon, IFULVIN) y ajoute une option
`nebuleuses`, qui peint des brumes autour d'étoiles restées en 3D, pour
IMLADRIK.

**La maquette validée** : deux fichiers HTML autonomes, construits sur les 50
fiches réelles, **gardés hors du dépôt** parce que la liste du cocktail est
confidentielle. Ce qui y a été mesuré au navigateur (Chromium, 1 280 et 390 px
de large) :
- 9 nébuleuses, 50 étoiles, 0 erreur de console ;
- **0 chevauchement de noms** dans chacune des 9 nébuleuses approchées, aux
  deux largeurs. La mesure a été éprouvée sur un cas connu : l'aperçu B, sur
  390 px, en montre 22 ;
- les titres restent lisibles sur 390 px grâce à des noms courts
  (« Conseil & services », « Industrie & tech »…).

### ⚠️ La décision qui change — à confirmer au go

Le 12/08, Paul avait retenu **« le modèle 3D pour tout RIVEN »**
(`CADRAGE-RIVEN-STELLAIRE.md`). Le 30/09, en réponse à un message qui disait
« la maquette est à plat ; dans le vrai Ciel, les nébuleuses seraient placées
dans le volume 3D actuel », il a écrit **« gardons ce format »**.

Lecture retenue : **le Ciel de RIVEN devient la carte à plat de la maquette.**
Le volume 3D, sa rotation et sa dérive lente sont retirés **de RIVEN
seulement**. Les autres écrans gardent `ciel.js` tel qu'il est. Si Paul voulait
dire « des nébuleuses, mais dans le volume 3D », ce cadrage est faux dès §1 :
c'est la première chose que son go confirme.

---

## 1. ① Le but — ce qui sera vrai à la fin

**Dans RIVEN, onglet Ciel, Paul voit ses contacts en neuf nébuleuses, trouve
une étoile nouvelle en deux gestes, et lit chaque nom sans qu'aucun en
recouvre un autre.**

1. **Vue d'ensemble** : les 9 nébuleuses de la maquette, chacune avec son
   titre et le nombre de ses étoiles (le nom court sous 600 px de large).
   Aucun titre n'en recouvre un autre.
2. **S'approcher** : toucher une nébuleuse, ou l'atteindre au clavier puis
   appuyer sur Entrée, la cadre. Les noms de ses étoiles apparaissent,
   **jamais superposés**. Le panneau liste ses domaines, puis sous chacun ses
   étoiles, et les personnes rattachées à ces fiches.
3. **Ouvrir** : toucher une étoile d'une nébuleuse approchée ouvre sa fiche,
   exactement comme aujourd'hui (`surClicNoeud`). Une personne du panneau
   ouvre sa fiche personne (`surClicPersonne`).
4. **Revenir** : « Tout voir », ou la touche Échap, ramène à la vue
   d'ensemble.
5. **Chercher** : le champ de recherche garde son rôle. Les étoiles qui
   correspondent restent vives, les autres s'éteignent. Si elles tiennent
   toutes dans une seule nébuleuse, le Ciel s'en approche.
6. **Ne rien perdre de ce qui s'affiche aujourd'hui** : la relation (un trait
   fin entre deux étoiles) et les personnes rattachées (dans le panneau).

**Les neuf nébuleuses, et ce qu'elles regroupent** (base du 30/09) :

| Nébuleuse | Étoiles | Domaines regroupés (secteurs saisis) |
|---|---|---|
| Conseil & services aux entreprises | 11 | Conseil, Conseil - …, Audit, Recouvrement, Recrutement, Services - finances |
| BTP & rénovation | 11 | BTP - …, Tuyautiste, Isolation - …, CVC, Ventilation - …, Rénovation - IA |
| Industrie & technologie | 6 | Aéronautique…, Holding industrielle, Ingénierie, Logiciel, Technologie |
| Institutions & associatif | 5 | Politique, Études, Associatif, Médico-social |
| Médias & édition | 6 | Médias…, Édition |
| Énergie & environnement | 4 | Énergie…, Environnement |
| Finance & banque | 3 | Banque…, Finance - … |
| Commerce, luxe & arts | 3 | Retail, Luxe, Art |
| À classer | 5 | fiches sans secteur, et tout secteur que la table ne reconnaît pas |

La correspondance se fait sur **le début du secteur saisi**, sans casse ni
espaces superflus : « Conseil - direction financière » va dans Conseil. Un
secteur inconnu ne se perd pas : il tombe dans « À classer », qui est **visible
et compté**.

---

## 2. ② Les étapes

0. **Inventaire des harnais.** Quinze harnais `tests/smoke-*.mjs` ouvrent
   `riven.html` et parlent d'étoiles ou du Ciel. Relever, un par un, les
   contrôles qui supposent le volume 3D : rotation, dérive, bouton « à plat »,
   amas par secteur. **Ce relevé fixe la taille réelle de la boucle** : il se
   fait avant la première ligne de code.
1. **La maquette entre au dépôt, sans donnée réelle** :
   `design/preview-riven-nebuleuses.html`, alimentée par les données de
   démonstration de l'application et par une série fictive de 50 fiches aux
   noms de longueur réelle. C'est elle que les harnais ouvrent.
2. **La logique pure, testée seule.** La table des neuf nébuleuses, les
   règles secteur → nébuleuse et le placement des étoiles vivent dans une
   fonction sans DOM : `tests/unit-riven-nebuleuses.mjs`. Les 39 secteurs du
   30/09 tombent chacun dans la nébuleuse attendue ; le vide et l'inconnu dans
   « À classer ».
3. **Le module de rendu** : `js/ciel-nebuleuses.js`, exposé en global comme
   `ciel.js` et injecté sans `innerHTML`. Il reprend les options dont RIVEN se
   sert : `surClicNoeud`, `surClicPersonne`, `correspond`, `libellesType`, et
   `choisir()` pour la fiche courante.
4. **Le branchement dans RIVEN** : `js/app.js` appelle le nouveau module pour
   l'onglet Ciel. `riven.html` perd les boutons « à plat » et « dérive
   lente », qui n'ont plus d'objet. Le texte d'aide change : il ne dit plus
   « faites glisser pour tourner ».
5. **Le harnais** : `tests/smoke-riven-nebuleuses.mjs`, à 390 et à 1 280 px.
   Il reprend l'instrument de mesure des chevauchements de la maquette.
6. **Les harnais relevés à l'étape 0** sont réécrits pour le nouveau Ciel,
   dans la même boucle. Aucun n'est désactivé ni sauté.
7. **Vérification** : `npm test`, `bash tests/lancer.sh` en entier, en local.
   Puis la preview Vercel, que **Paul regarde sur son téléphone**.

---

## 3. ③ Les moyens

| Touché | Quoi |
|---|---|
| `js/ciel-nebuleuses.js` | nouveau : rendu SVG, interactions, clavier, ARIA |
| `js/app.js` | le branchement de l'onglet Ciel (une quarantaine de lignes) |
| `riven.html` | la balise du module, la barre d'outils du Ciel |
| `css/ciel.css` | les styles des nébuleuses et du panneau, sur les jetons existants |
| `design/preview-riven-nebuleuses.html` | la maquette, données fictives |
| `tests/unit-riven-nebuleuses.mjs`, `tests/smoke-riven-nebuleuses.mjs` | nouveaux |
| harnais de l'étape 0 | réécrits |
| **`js/ciel.js`** | **intouché** |

**Pas de base, pas d'API, pas de migration** : aucun gate SQL. Les données
arrivent déjà par `GET /api/reseau`.

**Qui fait quoi** : `front-carto` implémente, `graphisme` valide la palette
des neuf teintes (contraste des titres sur la brume), `interface-ux` juge les
parcours (approcher, ouvrir, revenir, chercher), `verificateur` éprouve le
tout de bout en bout.

---

## 4. ④ Les critères de réussite — vérifiables

| # | Critère | Comment on le sait |
|---|---|---|
| C1 | Les 39 secteurs du 30/09 tombent dans leur nébuleuse ; seules les 5 fiches sans secteur sont « À classer » | test unitaire |
| C2 | Vue d'ensemble : 0 titre de nébuleuse recouvert, à 390 et à 1 280 px | harnais, mesure des boîtes réellement peintes |
| C3 | Chaque nébuleuse approchée : **0 nom recouvert**, à 390 et à 1 280 px | harnais — et le **sabotage** du placement le fait virer au rouge |
| C4 | Une étoile touchée ouvre sa fiche ; une personne du panneau ouvre la sienne | harnais |
| C5 | Au clavier : Tab atteint les nébuleuses, Entrée approche, Tab parcourt les étoiles, Entrée ouvre, Échap revient ; noms à 12 px au moins, cibles tactiles de 24 px au moins | harnais |
| C6 | `js/ciel.js` n'a pas bougé d'un octet, et toute la suite `tests/lancer.sh` est verte | `git diff --stat` vide sur ce fichier, sortie du lanceur |
| C7 | Aucune erreur de console ; aucune tâche de plus de 50 ms pendant l'animation d'approche, en émulation mobile | harnais (`PerformanceObserver` longtask) |
| C8 | Paul valide la preview sur son téléphone | son go |

---

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **Les nébuleuses des autres écrans** : ALPHA, OMEGA, IMLADRIK. Pour
  IMLADRIK, c'est #315, portée par une autre séance.
- **Reclasser un secteur depuis l'interface**, ou ranger la table en base. La
  table vit dans le code pour cette boucle. Si Paul veut un jour reclasser
  lui-même, ce sera une boucle à part, avec migration, donc un gate.
- **Les 42 personnes non rattachées** comme étoiles à part : elles sont
  représentées par leurs fiches, et restent dans Contacts → Personnes.
- **La recherche sur les notes** (trouver « Concorde ») : petite évolution
  distincte, déjà signalée à Paul.
- **Toute modification des secteurs saisis.**

---

## 6. ⑥ Le pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| **Conflit avec #315**, qui modifie `ciel.js` en parallèle | Module à part : `ciel.js` n'est pas touché (C6). |
| **Les harnais du Ciel 3D virent au rouge**, et on découvre la taille réelle en cours de route | Inventaire à l'étape 0, avant le code ; réécriture dans la même boucle, jamais de test sauté. |
| **Un réseau plus grand** (l'import iPhone prévoit ~500 contacts) : à 100 étoiles dans une nébuleuse, « 0 chevauchement » devient impossible à 12 px | Règle posée dès maintenant : **un nom ne se superpose jamais. S'il n'a pas de place, il se cache, et le panneau le donne.** Le harnais tourne aussi sur une série fictive de 300 fiches. |
| **Les brumes font saccader l'approche sur téléphone** : le filtre de turbulence recalculé à chaque image | Brumes peintes une fois, puis déplacées comme une image pendant le mouvement ; mesuré (C7). |
| **Un secteur nouveau disparaît en silence** | Il tombe dans « À classer », visible et compté ; le test unitaire fige les 39 secteurs du jour. |
| **On perd ce que le Ciel montre aujourd'hui** | La relation reste un trait, les personnes rattachées restent dans le panneau (§1, point 6). |
| **« Gardons ce format » mal lu** (à plat ou en 3D) | Première chose que le go de Paul confirme (§0). |
| **Une donnée réelle entre au dépôt** par la maquette ou une fixture | Maquette et fixtures fictives ; la maquette aux vraies données reste hors dépôt. |

---

## ⏳ Ce qu'il faut à Paul pour ouvrir la boucle

1. **Confirmer la lecture** : le Ciel de RIVEN devient la carte à plat de la
   maquette ; le volume 3D est retiré de RIVEN, et seulement de RIVEN.
2. **Valider ou corriger les neuf nébuleuses** et leurs domaines (§1).
3. **Le go.**
