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
- **KALAMN-TALAEN — la boussole centrale, symbole épée et dragon.** C'est
  **le guide, l'agent d'IMLADRIK** : successeur nommé de l'« agent-devperso »
  provisionné en `CADRAGE-CONSOLE.md §7`. Principe verrouillé respecté
  (2026-07-16) : **sous-agent de Léo**, jamais interlocuteur direct de Paul —
  à l'écran c'est la voix du quadrant (cartouche de parole sous la boussole),
  en session c'est un sous-agent que Léo dispatche et synthétise.

## 3. La cartographie — forme

- **Centre** : médaillon-boussole **Kalamn-talaen** — épée dressée (la lame
  fait l'aiguille Nord) + dragon enroulé autour de la lame, gravure encre sur
  parchemin, cerne d'or. **Légende gravée sous le médaillon :
  « Kalamn-talaen »** (italique, registre carte savante).
- **Caps v1 (3)** : MINETHNIR (**Ouvert** — le journal existant), VRANESH
  (À venir), DRAUKHAIN (À venir). Aiguilles du centre vers chaque cap,
  rehaussées au survol — même patron que `js/boussole.js`.
- **Parole** : cartouche sous la rose ; au repos « Survole un cap —
  Kalamn-talaen t'en dit l'essentiel », au survol la parole du cap.
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
- **Passerelles** : un scénario peut pointer un objectif DRAUKHAIN (ce qu'il
  menace ou sert) ou une page MINETHNIR (d'où vient la question).

## 6. DRAUKHAIN — mini-vision v1 (cadrage fin à l'ouverture de sa boucle)

- **Objets** : *serments* (objectifs formulés : le quoi, le pourquoi profond,
  l'horizon) ; *flammes* (rappels de foi : citations choisies, victoires
  passées consignées) ; *relecture* périodique de la volonté — rappel,
  jamais jugement.
- **Passerelles** : un serment peut naître d'un idéal ZEKROM (idéal →
  serment) et se suivre dans MINETHNIR (pages liées).

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
  miroir 0010) **ÉCRITE, NON APPLIQUÉE** (gate §5 intime → go Paul). API
  `api/serments.js` + `api/flammes.js` (requireUser, owner_id serveur-only,
  validation miroir des CHECK). Front `draukhain.html` + `js/draukhain.js`
  (carte des serments, badge « à raviver » en invitation, bascule « mes serments
  vivants », fail-closed, textContent only) — cap DRAUKHAIN ouvert dans la
  cartographie. Harnais `unit-draukhain-validate` + `smoke-draukhain` ;
  patrimoine COMPLET (22 harnais) vert. **⏳ Reste Paul : appliquer `0016` en
  prod + go.**
- **B3 — VRANESH v1.**

## 8. Décisions attendues de Paul

1. **Les noms** tels qu'orthographiés — MINETHNIR / VRANESH / DRAUKHAIN /
   KALAMN-TALAEN — figés au lexique dès validation.
2. **Le sigle** : l'épée au soleil reste le blason console d'IMLADRIK, la
   boussole épée+dragon restant interne au quadrant ? (reco : oui)
3. **L'ordre** : DRAUKHAIN (B2) avant VRANESH (B3) ? (reco : oui)
4. **Go B1** (implémentation de la carto) après validation du prototype.
