# CADRAGE-IMLADRIK — la cartographie boussole du développement personnel

> Dicté par Paul le 2026-07-24. Même méthode que les autres quadrants : on
> **cadre AVANT tout code**. Cette boucle (B0) livre le cadrage + un
> **prototype statique** (`design/preview-imladrik-boussole.html`) — **zéro
> code produit**. Source de pilotage : `CADRAGE-ULTIMA.md` (ÉTAT) ; vision
> quadrant : `CADRAGE-CONSOLE.md §3.4`. Ce fichier ne double aucun autre doc.

## 1. Vision — d'une page-journal à une cartographie

IMLADRIK cesse d'être une page unique (le journal livré en boucle 1) pour
devenir une **cartographie en mode boussole**, sur le modèle de la boussole
LV2 de l'accueil d'Ultima — mais tout entière au registre **développement
personnel**. Au centre, le guide ; autour, les caps du quadrant. Même
mécanique éprouvée : registre extensible (un cap = une entrée), survol/focus
→ illumination + parole dans un cartouche, clic → entrée dans le cap.

## 2. Les noms (dictés par Paul, 2026-07-24 — univers des dragons d'Imladrik)

- **MINETHNIR — le journal intime.** Renommage du journal existant. Tout
  l'acquis de la boucle 1 (table `imladrik_entrees`, API, atelier d'écriture,
  sauvegarde Drive) **devient le cap MINETHNIR** — rien n'est reconstruit,
  on renomme et on range (directive EB : capitaliser).
- **VRANESH — les différents futurs potentiels.** Anticiper, prévoir ce qui
  peut se passer **dans un cas donné** : situations → scénarios
  (embranchements « si X, alors… »), signaux à surveiller, parades préparées.
  Distinct de ZEKROM (hors IMLADRIK — idéaux/cap directionnel) : VRANESH ne
  dit pas ce que Paul **veut**, il explore ce qui **peut arriver**.
- **DRAUKHAIN — la volonté au-delà du possible.** Ne pas oublier les
  objectifs, entretenir la **volonté inébranlable**, ne pas perdre la foi.
  Absorbe le module « objectifs de vie » provisionné au cadrage console
  (§3.4) + la règle « des rappels, pas du jugement ».
- **KALAMN-TALAEN — la boussole centrale, symbole épée et dragon.** C'est le
  **nom gravé de la boussole** d'IMLADRIK (l'emblème au centre de la carte),
  **pas un agent** (correction Paul 2026-07-25). L'agent unique d'Ultima reste
  **Léo** (principe verrouillé 2026-07-16) : c'est Léo qui guide et dont la
  parole se dépose dans le cartouche sous la boussole. Les mots
  « Kalamn-talaen » restent gravés sous le médaillon (décision Paul : garder
  les mots sur la boussole centrale). L'« agent-devperso » provisionné en
  `CADRAGE-CONSOLE.md §7` n'a donc pas lieu d'être : Léo couvre le quadrant.

## 3. La cartographie — forme

- **Centre** : médaillon-boussole **Kalamn-talaen** — épée dressée (la lame
  fait l'aiguille Nord) + dragon enroulé autour de la lame, gravure encre sur
  parchemin, cerne d'or. **Légende gravée sous le médaillon :
  « Kalamn-talaen »** (italique, registre carte savante).
- **Caps v1 (3)** : MINETHNIR (**Ouvert** — le journal existant), VRANESH
  (À venir), DRAUKHAIN (À venir). Aiguilles du centre vers chaque cap,
  rehaussées au survol — même patron que `js/boussole.js`.
- **Parole** : cartouche sous la rose ; au repos « Survole un cap — Léo t'en
  dit l'essentiel », au survol la parole de Léo sur le cap (Léo = agent unique).
- **Extensible** : les modules restants du cadrage console §3.4 (valeurs &
  principes, citations, quart d'heure quotidien, suggestions culturelles)
  deviendront des caps — une entrée de registre chacun, les caps se
  redistribuent seuls.
- **Registre** : antique et sérieux (2026-07-08), jamais au prix de la
  lisibilité/accessibilité.

## 4. Articulation avec l'existant (capitaliser, zéro refonte)

- **Pages (reco Léo, à trancher en B1)** : `imladrik.html` devient la
  cartographie (la porte du quadrant) ; le journal est déplacé tel quel vers
  une page MINETHNIR. **Renommage front seul** : API `/api/imladrik*`,
  migrations `0012`/`0014`, RLS et harnais inchangés — aucune migration.
- **Blason du quadrant** : l'« épée au soleil » (figée 2026-07-17) **reste**
  le sigle d'IMLADRIK sur la console `ultima.html`. La boussole épée+dragon
  est un objet **interne** au quadrant, pas un remplacement du sigle
  (→ arbitrage §8 si Paul préfère l'inverse).
- **Sécurité (§5 console, inchangée)** : intime → fail-closed, RLS par
  owner, pas de mode démo. La cartographie elle-même est **statique et
  muette** (aucune donnée intime dans le HTML servi) ; toute donnée vivante
  (compteurs, dernière page) n'apparaîtrait qu'après auth, motif cockpit
  LV2-⑤ (comptes seuls, jamais de contenu).

## 5. VRANESH — mini-vision v1 (cadrage fin à l'ouverture de sa boucle)

- **Objets** : *situations* (« un cas donné ») → *scénarios* (futurs
  potentiels de la situation : déroulé en mots, vraisemblance/impact
  qualitatifs, signaux avant-coureurs, parade préparée).
- **Posture** : anticipation sereine, pas anxiété — Kalamn-talaen aide à
  dérouler les embranchements puis à **revenir au présent**.
- **Passerelles** ✅ **construites (v2, 2026-07-25)** : un scénario peut pointer
  un objectif DRAUKHAIN (ce qu'il *menace* ou *sert*) ou une page MINETHNIR
  (d'où vient la question). Table `scenario_liens` (migration 0018), cible XOR.

## 6. DRAUKHAIN — mini-vision v1 (cadrage fin à l'ouverture de sa boucle)

- **Objets** : *serments* (objectifs formulés : le quoi, le pourquoi profond,
  l'horizon) ; *flammes* (rappels de foi : citations choisies, victoires
  passées consignées) ; *relecture* périodique de la volonté — rappel,
  jamais jugement.
- **Passerelles** ✅ **construites (v2, 2026-07-25)** : un serment peut naître
  d'un idéal ZEKROM (idéal → serment) et se suivre dans MINETHNIR (pages liées).
  Table `serment_liens` (migration 0018), cible XOR.

## 7. Séquencement (une boucle à la fois, directive EB)

- **✅ B0 (cadrage)** : cadrage + prototype statique. Zéro code produit.
- **✅ B1 — la carto en prod (2026-07-24, go Paul « go b1 »)** : `imladrik.html`
  est devenue la cartographie boussole Kalamn-talaen (3 caps autour du médaillon
  épée + dragon, légende gravée) ; le journal a migré vers `minethnir.html`
  (renommage front seul — `js/imladrik.js`, API `/api/imladrik*`, migrations
  `0012`/`0014`, RLS **inchangés**). Carto muette et sans donnée (§5) sur le
  langage de `css/boussole.css` (réutilisé) + `js/imladrik-carto.js` (clone du
  cœur de `boussole.js`, sans cockpit) + `css/imladrik-carto.css`. Console : état
  IMLADRIK « En chantier » → « Accéder ». Harnais : `smoke-imladrik` reciblé sur
  MINETHNIR, `smoke-imladrik-carto` créé, `smoke-console` mis à jour ; patrimoine
  COMPLET (21 harnais) vert.
- **✅ B2 — DRAUKHAIN v1 (2026-07-25, go Paul « ok go »)** : la volonté au-delà
  du possible, miroir strict de ZEKROM. Modèle **serments** (le quoi + le
  pourquoi profond + l'horizon) → **flammes** (rappels de foi : nature
  citation/victoire/rappel + texte). Règle cardinale POSITIVE : serment sans
  flamme = **« à raviver »** = invitation à nourrir la foi, jamais un reproche
  (« des rappels, pas du jugement »). Migration `0016_draukhain_serments.sql`
  (2 tables + 2 vues `serments_etat`/`serments_vivants`, RLS + scellement AD-4,
  miroir 0010) **ÉCRITE, **APPLIQUÉE en prod (2026-07-26, solo)**** (gate §5 intime → go Paul). API
  `api/serments.js` + `api/flammes.js` (requireUser, owner_id serveur-only,
  validation miroir des CHECK). Front `draukhain.html` + `js/draukhain.js`
  (carte des serments, badge « à raviver » en invitation, bascule « mes serments
  vivants », fail-closed, textContent only) — cap DRAUKHAIN ouvert dans la
  cartographie. Harnais `unit-draukhain-validate` + `smoke-draukhain` ;
  patrimoine COMPLET (22 harnais) vert. **✅ FAIT — appliqué 2026-07-26 (solo) (ex-reste : appliquer `0016` en
  prod + go.**
- **✅ B3 — VRANESH v1 (2026-07-25, « ensuite on avance »)** : les futurs
  potentiels, miroir strict de DRAUKHAIN/ZEKROM. Modèle **situations** (« un cas
  donné » + contexte) → **scénarios** (le déroulé du futur + vraisemblance
  faible/moyenne/forte + signaux avant-coureurs + parade préparée). Règle
  cardinale POSITIVE : situation sans scénario = **« à explorer »** = invitation
  à imaginer ses futurs. Migration `0017_vranesh_situations.sql` (2 tables +
  vues `situations_etat`/`situations_anticipees`, RLS + scellement AD-4, miroir
  0016) **ÉCRITE, **APPLIQUÉE en prod (2026-07-26, solo)**** (gate §5 intime → go Paul). API
  `api/situations.js` + `api/scenarios.js`. Front `vranesh.html` + `js/vranesh.js`
  (fail-closed, textContent only, badge « à explorer », bascule « situations
  anticipées »). Cap VRANESH ouvert dans la carto → **le quadrant IMLADRIK est
  complet (3 caps ouverts)**. Harnais `unit-vranesh-validate` + `smoke-vranesh`.
  **✅ FAIT — appliqué 2026-07-26 (solo) (ex-reste : appliquer `0017` en prod + go.**
- **✅ B4 — Passerelles v2 (2026-07-25, « établis les passerelles v2, termine
  les boucles »)** : la mémoire inter-cap. Deux tables de liens à **cible XOR**,
  double scellement AD-4, miroir de la passerelle R↔Z (0011) :
  **`serment_liens`** (serment → idéal ZEKROM *ou* page MINETHNIR) et
  **`scenario_liens`** (scénario → serment DRAUKHAIN, rapport *menace*/*sert*,
  *ou* page MINETHNIR). Migration `0018_imladrik_passerelles.sql` (ancrages
  composites manquants sur `imladrik_entrees` + `scenarios`, puis 2 tables +
  RLS) **ÉCRITE, **APPLIQUÉE en prod (2026-07-26, solo)** — gate §5 (dépend de 0016 + 0017)**. API
  `api/serment-liens.js` + `api/scenario-liens.js` ; liens repliés dans les GET
  `/api/serments` et `/api/situations` (dégradation propre à `[]` si 0018 pas
  appliquée). Front : section « Passerelles » sur `draukhain.html` et
  `vranesh.html`. Harnais `unit-imladrik-passerelles` + extensions smoke.
  **✅ FAIT — appliqué 2026-07-26 (solo) (ex-reste : appliquer `0018` (après 0016 + 0017) en prod + go.**

## 8. Décisions attendues de Paul

1. **Les noms** tels qu'orthographiés — MINETHNIR / VRANESH / DRAUKHAIN /
   KALAMN-TALAEN — figés au lexique dès validation.
2. **Le sigle** : l'épée au soleil reste le blason console d'IMLADRIK, la
   boussole épée+dragon restant interne au quadrant ? (reco : oui)
3. **L'ordre** : DRAUKHAIN (B2) avant VRANESH (B3) ? (reco : oui)
4. **Go B1** (implémentation de la carto) après validation du prototype.

## 9. L'affichage de la progression — « le cheminement » (dicté 2026-07-30)

**Constat de Paul** : les gros pavés-quadrants ne sont « pas très gracieux »
pour montrer les **projets en cours**. Pour IMLADRIK en particulier — c'est du
développement personnel — l'affichage doit dire **une progression, un
cheminement** : aller de l'avant, progresser, devenir meilleur.

**Maquette (zéro code produit)** :
`design/preview-imladrik-cheminement.html` — trois formes, chiffres et
intitulés **fictifs** (§5 : aucune donnée intime dans le repo).

- **A — La voie jalonnée** (reco Léo). Une **route gravée par projet** :
  d'où l'on part → bornes franchies → **« tu es ici »** → ce qui vient →
  l'horizon, la route sortant de la carte (**jamais de ligne d'arrivée**).
  Un pavé devient une ligne : plusieurs projets tiennent dans la hauteur d'un
  seul quadrant. Se replie en liste verticale sur téléphone (même grammaire,
  sans SVG). Réemployable **hors IMLADRIK** (console, autres quadrants).
- **B — L'ascension**. L'altitude dit le progrès ; très juste pour un objectif
  **unique** (un serment, un idéal ZEKROM) mais installe un **sommet**, donc une
  fin, et n'en montre qu'un par écran. → réserve pour une vue de détail.
- **C — Les anneaux de Kalamn-talaen**. Progression du centre vers le large,
  sans dernier anneau ; symboliquement juste et raccord avec la boussole, mais
  « où j'en suis / le prochain pas » s'y lit mal, et fait doublon avec la
  boussole déjà en place. → écarté.

**Ce que la forme A consomme (données déjà en prod, aucune migration)** :
`serments_etat` / `serments_vivants` (bornes = flammes, badge « à raviver »),
`situations_etat` / `situations_anticipees` (bornes = scénarios, « à explorer »),
`imladrik_entrees` (jalons d'écriture). Règle §5 tenue : **comptes et dates
seulement, jamais de contenu** ; fail-closed, rien dans le HTML servi.

**✅ Décisions de Paul (2026-07-30)** : ① **forme A** ; ② **IMLADRIK seul**
(ni console ni autres quadrants pour l'instant) ; ③ **un serment = une voie**
(sa reco suivie) ; ④ **boucle « dicter dans IMLADRIK » ouverte** (§10).

**✅ v1 LIVRÉE (2026-07-30)** — la voie jalonnée sur **DRAUKHAIN**, la page où
les serments vivent déjà derrière auth (§5 tenue : la carto `imladrik.html`
reste muette, aucune donnée intime dans un HTML servi).
- `css/voie.css` : vocabulaire **neutre** (`voie-*`, `borne-*`), réemployable
  tel quel par VRANESH et MINETHNIR quand leur tour viendra. Tokens de
  `css/styles.css`, zéro valeur en dur. Repli en colonne sous 46 rem.
- `js/draukhain.js` : trois fonctions **pures** — `jalonsVoie` (départ →
  flammes → « tu es ici » → horizon), `pointsVoie` (creux/crêtes alternés),
  `cheminVoie` + `queueVoie` (le tracé et sa sortie de carte). Rendu en
  `createElement`/`textContent` et `createElementNS` (jamais d'innerHTML) ;
  le SVG est `aria-hidden`, toute l'information vit dans la liste des bornes.
- **Règles de la forme, tenues et prouvées au harnais** : jamais de ligne
  d'arrivée (l'horizon reste « devant », la route sort de la carte), **aucune
  barre de progression ni pourcentage**, et pour un serment sans flamme on se
  tient **au départ** avec « à raviver » comme borne devant soi — l'invitation
  cardinale, jamais un reproche.
- Au-delà de 3 flammes, les plus anciennes se résument en une borne franchie.
- Harnais : 13 assertions ajoutées à `smoke-draukhain` ; patrimoine COMPLET
  vert (779 assertions). Aucune migration, aucune touche à l'auth/API/données.

## 10. Dicter DANS Ultima — l'état réel (constat 2026-07-30)

Question de Paul : « puis-je dicter *ouvre tel projet et renseigne cela*,
en particulier sur IMLADRIK, et voir où j'en suis depuis l'app ? »

**Non, pas encore sur IMLADRIK.** Ce qui existe déjà :
- **Les mains de Léo** (`api/_lib/leo.js`, boucle L2b) : catalogue d'outils
  par quadrant, proposition → **reformulation déterministe** → confirmation de
  Paul avant toute écriture. Couvre **ADRAMELECH** (capturer/enrichir une idée)
  et **RIVEN** (besoin de chantier, note de journal, relance datée).
- **La dictée vocale par champ** (Web Speech API, `js/app.js`) : bouton micro
  qui **ajoute** au champ, jamais ne remplace — **RIVEN uniquement**.
- Le cartouche Léo est monté sur `traveler.html`, `bcp.html`, `adramelech.html`.

**Le manque** : `OUTILS_PAR_QUADRANT.imladrik` est **vide** — le commentaire
« pas d'API de données » date d'avant les migrations `0016 → 0018`, appliquées
depuis. Les APIs existent donc (`serments`, `flammes`, `situations`,
`scenarios`, `imladrik/entrees`), mais Léo n'a **aucune main** dessus, aucune
page IMLADRIK ne monte le cartouche, et aucun champ n'y a de micro.

**Boucle à ouvrir (à cadrer, gate §5 intime)** : monter le cartouche Léo +
le micro sur les pages IMLADRIK, et ouvrir 3 à 4 outils miroirs de l'existant
(`proposer_page_journal`, `proposer_flamme`, `proposer_scenario`, et un
`proposer_serment`/`proposer_situation`), **toujours** avec confirmation avant
écriture et **zéro contenu dicté en logs**. S'y ajoute le « où j'en suis » :
un état de progression lu après auth (comptes et dates seuls) — c'est
exactement ce que consomme la forme A du §9.
