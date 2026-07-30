# CADRAGE-LV3 — les deux supra-divisions et la boussole comme forme unique

> Dicté par Paul le **2026-07-30**. Cadre de la boucle en cours : **cadrer +
> montrer en preview**. Aucun code produit tant que Paul n'a pas tranché le §9.
> Ce document complète `CADRAGE-CONSOLE.md` (§2bis LV2) — il ne le remplace pas.

---

## 0. Ce que Paul a dicté (reformulation retenue)

1. **On passe à Ultima Lv3.**
2. On regroupe en **deux supra-divisions** :
   - **ULTIMA** — les projets **personnels** ;
   - **ALPHA** — les projets **professionnels**.
3. Dans **ALPHA** : **YCOME** et **RENOBOOST IA**.
4. Dans **ULTIMA** : **TAO** (précision ajoutée par Paul juste après).
5. **Chaque supra-division, chaque quadrant et chaque cap doit reprendre
   l'affichage et la forme de la boussole IMLADRIK.**

Ce que cela change au réel : LV2 avait **une** boussole (l'accueil) et, en
dessous, des formes hétérogènes (grille 2×2 pour la console, arborescence pour
TAO, antichambres en colonne pour NICOL BOLAS / ADRAMELECH). Lv3 dit : **la
boussole n'est plus l'écran d'accueil, c'est la forme de la navigation** — le
même patron, gravé à l'identique, à tous les étages.

---

## 1. L'arbre Lv3

```
/                     ULTIMA — la racine  (boussole, cœur : sceau monde-anneau)
│
├── ULTIMA            supra-division PERSONNELLE  (boussole, cœur : rose des vents)
│   ├── RIVEN         le réseau commercial                → traveler.html   (outil)
│   ├── NICOL BOLAS   le pilotage financier               → bcp.html        (boussole)
│   │   └── ABAQUE — le simulateur de lancement           → abaque.html     (outil)
│   ├── ADRAMELECH    la bibliothèque d'idées             → adramelech.html (boussole)
│   │   └── LES ARCHIPELS — la carte des idées            → idees.html      (outil)
│   ├── IMLADRIK      le développement personnel          → imladrik.html   (boussole ✅ acquise)
│   │   ├── MINETHNIR  le journal intime                  → minethnir.html  (outil)
│   │   ├── VRANESH    les futurs potentiels              → vranesh.html    (outil)
│   │   └── DRAUKHAIN  la volonté au-delà du possible     → draukhain.html  (outil)
│   └── TAO           la voie — le réel et l'idéal        → tao.html        (boussole)
│       ├── RESHIRAM   le travail de la réalité           → reshiram.html   (outil)
│       └── ZEKROM     la quête de l'idéal                → zekrom.html     (outil)
│
└── ALPHA             supra-division PROFESSIONNELLE  (boussole, cœur : alpha gravé)
    ├── RENOBOOST IA  le socle rémunérateur   → https://www.renoboostia.fr  (externe, ouvert)
    └── YCOME         la plateforme externe   → à brancher (URL attendue de Paul)
```

**Ce qui bouge par rapport à LV2 :**

| Nœud | LV2 (aujourd'hui) | Lv3 (cible) |
| --- | --- | --- |
| `/` | boussole à 4 caps (Ultima, Renoboost, Ycome, Tao) | boussole à **2 caps** : ULTIMA, ALPHA |
| `ultima.html` | **grille 2×2** des quadrants | **boussole à 5 caps** (les 4 quadrants + TAO) |
| `alpha.html` | *n'existe pas* | **nouvelle page** — boussole à 2 caps |
| `tao.html` | **arborescence** (tronc + 2 branches) | **boussole à 2 caps** + passerelle rétroplanning |
| `bcp.html` / `adramelech.html` | antichambres en colonne | **boussoles** (caps §4.3) |
| `imladrik.html` | **boussole** Kalamn-talaen | inchangée — c'est **le modèle** |
| `traveler.html`, `abaque.html`, `idees.html`, `minethnir.html`, `vranesh.html`, `draukhain.html`, `reshiram.html`, `zekrom.html` | outils | **inchangés** (ce sont des feuilles, pas des nœuds) |

---

## 2. La forme unique — « le patron IMLADRIK »

La référence est `imladrik.html` + `js/imladrik-carto.js` + `css/boussole.css`.
Anatomie en **cinq pièces**, dans cet ordre, sans exception :

1. **Le retour** — `↞ <nom du parent>`, aligné à gauche, discret. La racine n'en a pas.
2. **Le bandeau** — sceau du nœud (médaillon gravé) + surligne (le nom du nœud,
   petites capitales espacées) + titre + invite *« Léo te guide — survole un cap. »*
3. **Le plateau** — les caps répartis **en rose** (premier cap plein Nord, puis
   sens horaire, à parts égales), reliés au centre par des **aiguilles**
   pointillées qui s'allument au survol/focus du cap.
4. **Le cœur** — médaillon d'or gravé propre au nœud, **avec sa légende
   gravée dessous** (c'est la signature de la forme IMLADRIK : `Kalamn-talaen`).
5. **Le cartouche « parole de Léo »** — sous le plateau : nom du cap, état,
   *signal « à traiter »* (si actionnable), *« en cours »* (agrégats cockpit),
   le résumé, puis l'action (« Clique pour entrer ↝ » / « nouvel onglet ↗ » /
   « Cap en préparation »). Au repos : *« Survole un cap — Léo t'en dit l'essentiel. »*

**Règles de la forme** (elles ne se négocient pas d'un écran à l'autre) :

- **Un cap = un blason gravé + un nom + un état.** Rien d'autre sur le plateau.
- **Zéro donnée dans le HTML servi** : le plateau est muet ; les chiffres
  n'arrivent qu'après authentification, côté client (`/api/cockpit`, Bearer),
  et **seulement des comptes** — jamais de contenu, jamais de PII.
- **Clavier = souris** : `focus` allume exactement ce qu'allume `mouseenter` ;
  un cap « à venir » ne navigue pas mais parle.
- **Repli `<noscript>`** : la liste des caps ouvrables reste atteignable.
- **Registre antique** : disque parchemin, cerne or, emblème encre — la palette
  et les blasons existants sont réutilisés tels quels, on n'en redessine aucun.

### 2.1 Règle de forme — nœud vs feuille

> **Est une boussole tout nœud qui a au moins deux enfants.
> Reste un outil toute feuille (la page où l'on travaille vraiment).**

C'est la règle qui rend « chaque supra-division, quadrant et cap » applicable
sans absurdité : on ne met pas une rose des vents à un seul cap, et on ne
transforme pas la carte de RIVEN — qui *est déjà* une carte — en boussole.

Conséquence immédiate : **RIVEN reste un accès direct** à `traveler.html`
(une seule porte aujourd'hui). Dès qu'un deuxième cap existe (l'arbre des
relations extrait, les chantiers, les secteurs), RIVEN prend la forme boussole
sans rien changer d'autre — une entrée de registre suffit.

---

## 3. Nommage — le point à trancher

**« ULTIMA » désigne deux choses** dans l'arbre ci-dessus : l'outil entier (la
racine) **et** la supra-division personnelle. C'est cohérent (Ultima est le
monde de Paul, le pro n'en est qu'un secteur) mais c'est une ambiguïté réelle
dans les fils de discussion et dans le code (`id: 'ultima'` existe déjà pour le
cap console).

Le couple **ALPHA / ULTIMA** se tient très bien en latin : *alpha* la première,
*ultima* la dernière — du premier au dernier, tout est couvert. Recommandation :
**on garde les noms dictés**, et on lève l'ambiguïté par l'affichage :

- racine : surligne *« Ultima Lv3 »*, titre **« Bienvenue »**, cœur = sceau
  monde-anneau, légende gravée **« Ultima »** ;
- supra-division perso : surligne *« Supra-division »*, titre **« ULTIMA »**,
  cœur = rose des vents, légende gravée **« le personnel »** ;
- supra-division pro : titre **« ALPHA »**, légende gravée **« le professionnel »**.

Côté code, les identifiants deviennent explicites : `racine`, `ultima-perso`,
`alpha`, pour ne jamais confondre avec le cap `ultima` de LV2.

---

## 4. Contenu de chaque boussole

### 4.1 Racine `/` — 2 caps

| Cap | Blason | État | Cible |
| --- | --- | --- | --- |
| **ULTIMA** | rose des vents (existant) | Ouvert | `ultima.html` |
| **ALPHA** | alpha gravé (**à dessiner**) | Ouvert | `alpha.html` |

Cœur : sceau monde-anneau (déjà dans `index.html`), légende « Ultima ».
Signal cockpit : le badge « à traiter » remonte **agrégé** au niveau
supra-division (ULTIMA cumule RIVEN + TAO ; ALPHA n'a pas d'agrégat — pas de
données internes).

### 4.2 ULTIMA (perso) `ultima.html` — 5 caps

RIVEN · NICOL BOLAS · ADRAMELECH · IMLADRIK · TAO — blasons **déjà dessinés**
(les 4 quadrants dans `ultima.html`, le yin-yang du TAO dans `js/boussole.js`).
Cœur : rose des vents. La grille 2×2 disparaît.

### 4.3 ALPHA (pro) `alpha.html` — 2 caps

| Cap | Blason | État | Cible |
| --- | --- | --- | --- |
| **RENOBOOST IA** | étoile en essor (existant) | Ouvert | `https://www.renoboostia.fr` ↗ |
| **YCOME** | portail (existant) | À venir | ⏳ URL attendue de Paul |

### 4.4 TAO `tao.html` — 2 caps + passerelle

RESHIRAM (aile blanche) et ZEKROM (aile noire), reliés par la **passerelle
pointillée** déjà supportée par le moteur (champ `lien`), légendée
« ⇄ rétroplanning ». Cœur : yin-yang. L'arborescence actuelle est remplacée ;
`css/tao.css` devient inutile.

> ⚠️ Constaté en preview : à **deux caps**, ils sont diamétralement opposés
> (Nord / Sud) et la passerelle droite **passe derrière le médaillon** — donc
> invisible. Parade à retenir en L3 : la tracer **en arc** contournant le cœur,
> avec sa mention gravée « ⇄ rétroplanning » posée sur l'arc.

### 4.5 NICOL BOLAS et ADRAMELECH — caps **proposés** (à valider par Paul)

Ces deux quadrants n'ont aujourd'hui qu'une antichambre. Passer à la boussole
suppose de nommer leurs caps. Proposition minimale, sans rien construire :

- **NICOL BOLAS** : `ABAQUE` (ouvert → `abaque.html`), `REVENUS & CHARGES`
  (à venir), `IMPÔTS` (à venir), `ÉCHÉANCIER` (à venir).
- **ADRAMELECH** : `LES ARCHIPELS` (ouvert → `idees.html`),
  `LES RAPPROCHEMENTS` (à venir).

---

## 5. Implémentation — un noyau, un registre

Aujourd'hui la même mécanique est écrite **deux fois** (`js/boussole.js` et
`js/imladrik-carto.js`, ~90 % identiques). Lv3 en ferait **six ou sept**. Donc :

- **`js/boussole-noyau.js`** — le moteur unique : géométrie, aiguilles,
  passerelles, cœur + légende, caps, parole de Léo, cockpit. Il rend
  **n'importe quel nœud** à partir de son identifiant.
- **`js/registre-lv3.js`** — l'arbre entier en données : `id`, `nom`, `parent`,
  `cible`, `externe`, `etat`, `resume`, `blason`, `legende`, `lien`.
- Chaque page-nœud (`index.html`, `ultima.html`, `alpha.html`, `tao.html`,
  `bcp.html`, `adramelech.html`, `imladrik.html`) devient une **coque de ~40
  lignes** : `<body data-noeud="…">` + bandeau + plateau vide + cartouche +
  `<noscript>`.
- **Ajouter un projet = une entrée dans le registre.** C'est l'engagement
  d'extensibilité de LV2, tenu à tous les étages (directive JL : tout nouveau
  besoin est une extension d'Ultima).

`js/boussole-auth.js` (session + hook cockpit) est réutilisé tel quel ;
`js/imladrik-carto.js` et `css/tao.css` sont supprimés en fin de séquence.

### 5.1 Ce qui n'est PAS touché

Auth, middleware, RLS, API, migrations, données : **rien**. Lv3 est une
refonte de **navigation** — front pur. `.vercelignore` et `estCheminPrive`
n'ont pas à bouger (les nouvelles pages sont des coques muettes).

### 5.2 Patrimoine de vérification

- Reciblage : `smoke-boussole` (2 caps au lieu de 4), `smoke-console`
  (`ultima.html` devient une boussole), `smoke-quadrants`, `smoke-tao`,
  `smoke-imladrik-carto` (doit rester **vert sans modification** — c'est la
  preuve que le noyau est fidèle au modèle).
- Nouveaux : `smoke-alpha`, `unit-registre-lv3` (l'arbre est cohérent : pas de
  parent orphelin, pas de cible morte, tout nœud a un blason et une légende).
- **Avant toute fusion : `bash tests/lancer.sh` en ENTIER** (leçon 2026-07-22).

---

## 6. Séquencement — une boucle à la fois

| # | Boucle | Contenu | Risque |
| --- | --- | --- | --- |
| **L1** | Le noyau | `boussole-noyau.js` + `registre-lv3.js`, `imladrik.html` rebranché dessus (iso-rendu prouvé par `smoke-imladrik-carto` intact) | faible |
| **L2** | Les deux supra-divisions | racine à 2 caps + `alpha.html` + `ultima.html` en boussole à 5 caps ; retours repointés | moyen (tous les liens d'entrée) |
| **L3** | TAO en boussole | remplace l'arborescence ; passerelle rétroplanning | faible |
| **L4** | Les deux antichambres | NICOL BOLAS + ADRAMELECH en boussoles (caps §4.5, après validation) | faible |

Chaque boucle : livrée → patrimoine COMPLET vert → commit → PR → annotation.

---

## 7. Risques

- **RC-Lv3-1 — un clic de plus.** Renoboost passait de l'accueil en 1 clic, il
  en demandera 2. *Parade :* ALPHA est plein Nord et RENOBOOST IA est le
  premier cap de sa rose ; le chemin reste de deux gestes prévisibles.
- **RC-Lv3-2 — la rose à 5 caps.** Cinq caps sur `ultima.html` serrent le
  plateau en mobile : **vérifié en preview à 390 px**, c'est lisible mais juste
  (la légende du cœur frôle la rangée basse, « NICOL BOLAS » touche le bord).
  *Parade :* les blasons et libellés se réduisent déjà (`@media 480px`) ;
  prévoir en L2 un cran de plus (rayon des caps à 36 % sous 480 px) et repasser
  le harnais avant fusion. Réglage attenant : **aiguilles raccourcies**
  (rayon 30 → 24), sinon la pointe barre le badge d'état du cap.
- **RC-Lv3-3 — dérive de forme.** Chaque page qui redessine « un peu » sa
  boussole recrée l'hétérogénéité qu'on supprime. *Parade :* le noyau est la
  **seule** source du rendu ; une coque ne contient aucun SVG de cap.

---

## 8. Preview

`design/preview-lv3-boussoles.html` — maquette **statique et navigable**
(zéro code produit, aucune donnée) : la racine, les deux supra-divisions, TAO,
et les deux antichambres proposées, toutes rendues au patron IMLADRIK, avec un
fil d'Ariane pour descendre et remonter l'arbre.

---

## 9. ⏳ Décisions attendues de Paul

1. **Noms** : on garde **ULTIMA** (perso) et **ALPHA** (pro) tels quels, avec
   les légendes gravées « le personnel » / « le professionnel » pour lever
   l'ambiguïté avec la racine ? *(reco : oui)*
2. **RIVEN** : il reste un **accès direct** à la carte tant qu'il n'a qu'une
   porte (règle §2.1), ou tu veux sa boussole tout de suite avec des caps à
   nommer ? *(reco : accès direct)*
3. **Caps de NICOL BOLAS et ADRAMELECH** (§4.5) : validés tels quels, ou tu les
   nommes autrement ?
4. **Blason d'ALPHA** : l'alpha grec gravé (proposé en preview), ou un autre
   emblème ?
5. **Go L1** (le noyau) — c'est la boucle qui ne change rien à l'écran et rend
   tout le reste possible.
