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

- **MAEDRETHNIR — le journal intime.** Renommage du journal existant. Tout
  l'acquis de la boucle 1 (table `imladrik_entrees`, API, atelier d'écriture,
  sauvegarde Drive) **devient le cap MAEDRETHNIR** — rien n'est reconstruit,
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
- **Caps v1 (3)** : MAEDRETHNIR (**Ouvert** — le journal existant), VRANESH
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
  une page MAEDRETHNIR. **Renommage front seul** : API `/api/imladrik*`,
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

## 4 bis. MAEDRETHNIR — le diagnostic du 2026-08-01 (boucle ①, EL)

**Constat de départ** : le cap est complet — table `imladrik_entrees` (0012),
API `/api/imladrik`, atelier d'écriture, sauvegarde Drive, Léo au régime §5 le
plus strict — et pourtant **le journal est VIDE (0 page en base)**. Les
passerelles scénario → page MAEDRETHNIR (0018) restent à 0 lien, faute de pages.

**Boucle ① menée en dictée** (zéro code, format 6 points, EL). Trois questions
fermées à Paul, ses réponses :
1. **Où écris-tu ?** « N'importe où, en déplacement, en train de marcher souvent. »
2. **Qu'est-ce que l'app Claude te donne que MAEDRETHNIR ne donne pas ?**
   « Commande vocale, accès rapide, interface iPhone très simple, accessible en
   **2 clics du pouce**. »
3. **Qu'est-ce qui déclenche une entrée ?** « Une sensation, un jalon, une
   petite victoire, une accumulation. »

**LA CAUSE, NOMMÉE (critère de réussite de la boucle ①)** :
> **MAEDRETHNIR n'est pas atteignable au moment où l'envie d'écrire arrive.**
> Elle surgit **en marchant, au pouce et à la voix** ; le cap suppose un écran,
> une session et quatre niveaux de navigation avant le premier mot.

**Ce que le diagnostic ferme et ce qu'il ouvre** :
- Ce n'est **ni** un problème de forme **ni** un problème de contenu : c'est un
  problème de **DISTANCE**. Refaire l'affichage n'aurait rien changé — et
  l'aurait fait croire réglé.
- Le journal restera vide tant que la distance ne sera pas réduite. Toute
  boucle MAEDRETHNIR passe donc **après** l'entrée en écriture au pouce.
- **La réponse 3 est un acquis pour plus tard** : les déclencheurs de Paul sont
  *une sensation · un jalon · une petite victoire · une accumulation*. C'est le
  vocabulaire naturel du cap — il servira la forme de lecture (boucle ③), pas
  la capture. Ne pas le réinventer, ne pas le forcer maintenant.

**Constat technique relevé au passage** (à vérifier sur l'iPhone de Paul avant
d'en conclure quoi que ce soit) : `manifest.webmanifest` a `start_url: "/"` —
une icône d'accueil ouvre donc la console, jamais l'écriture. Et `js/dictee.js`
n'affiche son micro que si `SpeechRecognition`/`webkitSpeechRecognition` existe ;
là où l'API manque, **la dictée clavier iOS reste disponible** dans un champ
ordinaire — c'est elle qui porterait la voix.

## 5. VRANESH — mini-vision v1 (cadrage fin à l'ouverture de sa boucle)

- **Objets** : *situations* (« un cas donné ») → *scénarios* (futurs
  potentiels de la situation : déroulé en mots, vraisemblance/impact
  qualitatifs, signaux avant-coureurs, parade préparée).
- **Posture** : anticipation sereine, pas anxiété — Kalamn-talaen aide à
  dérouler les embranchements puis à **revenir au présent**.
- **Passerelles** ✅ **construites (v2, 2026-07-25)** : un scénario peut pointer
  un objectif DRAUKHAIN (ce qu'il *menace* ou *sert*) ou une page MAEDRETHNIR
  (d'où vient la question). Table `scenario_liens` (migration 0018), cible XOR.
- **La boussole puis L'ARBRE** ✅ **livré et validé par Paul (2026-08-01)** —
  « les différents thèmes de futurs sous forme de boussole comme IMLADRIK, puis
  depuis chaque thème des ramifications comme des branches qui poussent ».
  **Correspondance actée** : un **thème de futurs = une situation** (le cas
  donné) ; une **branche = un scénario**.
  - **v1 (matin) : rejetée par Paul.** Les branches poussaient directement sur
    la rose et le registre complet s'affichait dessous. Verdict : « c'est trop
    gros, c'est trop général et surtout il y a trop de textes. L'affichage n'est
    vraiment pas très heureux. » **Leçon à ne pas reperdre : sur un cap intime,
    la densité est le défaut principal — pas le manque d'information.**
  - **v2 retenue — AFFICHAGE À LA DEMANDE, en trois étages** (Forme ① de
    `design/preview-vranesh-arbre.html`, choisie sur preview avant tout code) :
    ① la rose ne porte que le **NOM** du thème (`nomCourt` : le sous-titre après
    le tiret cadratin tombe) + une pastille de compte ; ② un **CLIC** ouvre
    l'**arbre** du thème et **efface la rose** — un tronc qui part de la base,
    une branche par futur, une **étiquette de quelques mots** par branche
    (`etiquetteBranche`, bornée à 34 signes, tirée de la 1ʳᵉ phrase du déroulé —
    option **zéro migration**, un vrai champ « titre » reste possible) ;
    ③ le **côté** donne **UNE LIGNE** au survol, **TOUT** au clic (signaux,
    parade, passerelles) + un lien vers le registre.
  - **Le registre détaillé passe en `<details>` REPLIÉ.** Rien n'est retiré
    (écriture, passerelles, dénouement) : on l'ouvre pour **écrire**, pas pour
    **consulter**. C'est lui qui produisait le mur de texte.
  - **Réutilisation** : géométrie de la rose = noyau Lv3
    (`window.UltimaBoussoleNoyau.positions`, couvert par `unit-registre-lv3`) ;
    habillage = `css/boussole.css`. `css/vranesh-boussole.css` n'ajoute que
    l'arbre. La **charpente** de l'arbre est une fonction pure (`charpente`).
  - **Deux pièges tombés en route, à retenir** : ① une **pousse** en
    `stroke-dasharray` fixe **coupe** tout trait plus long que lui — la longueur
    se **mesure** (`getTotalLength`) ; ② le centre de la boîte englobante d'une
    **courbe** est du vide : il faut une **zone de préhension** large, sinon la
    branche se rate à la souris (et le harnais vise le bourgeon).
  - **Différence essentielle avec les boussoles Lv3** : ici les caps portent des
    **intitulés dictés par Paul** — de la donnée intime. Donc **rien en
    innerHTML** (createElement/textContent partout), **rien dans le HTML servi**,
    rendu seulement après session validée. Le harnais prouve la retenue **par
    l'ABSENCE** : aucun intitulé dans la page servie, aucun sous-titre sur la
    rose, aucun déroulé complet sur l'arbre, ni signaux ni parade au simple
    survol, aucun scénario visible à l'arrivée. La vraisemblance se lit à
    l'**épaisseur** du trait ET en toutes lettres (jamais la couleur seule).
- **L'ADVENU — « la branche qui a poussé »** ✅ **construit (2026-08-01)**,
  **migration `0019` écrite et NON appliquée — gate Paul** : quand un futur est
  advenu, Paul revient sur l'arbre et **désigne la branche qui a poussé** — soit
  l'un des scénarios déjà anticipés, soit **une branche neuve** si ce qui est
  arrivé n'avait pas été prévu (cas absorbé par le modèle 0017 : un scénario
  ordinaire, simplement constaté au lieu d'être anticipé). Les autres branches
  potentielles sont alors **supprimées**.
  - **Modèle** : `situations.scenario_advenu_id` + `advenu_le`, scellés par une
    FK sur le **triplet** `(owner_id, situation_id, id)` de `scenarios` — la
    contrainte garantit à elle seule que la branche retenue appartient au même
    owner ET à cette situation, sans trigger. `situations_etat` étendue
    (`scenario_advenu_id`, `advenu_le`, `advenue`).
  - **DÉCISION DE PAUL — suppression réelle.** Léo avait proposé d'élaguer sans
    détruire (garder les futurs non réalisés, marqués) ; **Paul a redit sa
    consigne, elle prime**. Ce que la suppression exige en retour, et qui est
    tenu : ① elle est **portée par l'API, jamais par la base** — aucun ON DELETE
    en cascade ni trigger ne coupe une branche tout seul ; ② le front la fait
    **confirmer en deux temps**, en annonçant **combien** de branches tombent ;
    ③ la branche retenue est **protégée par la FK avant** que les autres ne
    soient coupées — un échec en cours de route laisse le thème dénoué mais
    complet, jamais l'inverse.
  - **`validateDenouement` est SÉPARÉ de `validateSituation`** : le dénouement
    déclenche une suppression irréversible, il ne doit jamais voyager en
    passager clandestin d'une modification d'intitulé. `advenu_le` n'est pas
    accepté du client — la date vient du serveur.
  - **Rouvrir** un thème (`scenario_advenu_id: null`) ne supprime rien.
  - **Migration `0019` APPLIQUÉE en prod le 2026-08-01** (go de Paul « on merge,
    je veux pouvoir tester »). Vérifié après coup : situations intactes, RLS
    active sur `situations` et `scenarios` (4 policies chacune), vues en
    `security_invoker`. ⏭ **Advisors post-DDL non joués** (l'appel demande une
    approbation d'outil non accordée) — contrôle fait à la main à la place.
- **Peuplé le 2026-07-31 (dictée de Paul)** : VRANESH n'est plus vide. Deux
  situations réelles, toutes deux complètes (aucune « à explorer ») —
  **LIANDRA** (5 scénarios) et **THORIOL** (3 scénarios). Écriture par les mains
  de Léo, contenu **en base sous RLS uniquement** : le repo n'en garde que le nom
  (lexique vocal), jamais un déroulé ni un contexte (§5). Passerelles
  scénario → serment DRAUKHAIN **disponibles mais non encore utilisées**.

## 6. DRAUKHAIN — mini-vision v1 (cadrage fin à l'ouverture de sa boucle)

- **Objets** : *serments* (objectifs formulés : le quoi, le pourquoi profond,
  l'horizon) ; *flammes* (rappels de foi : citations choisies, victoires
  passées consignées) ; *relecture* périodique de la volonté — rappel,
  jamais jugement.
- **Passerelles** ✅ **construites (v2, 2026-07-25)** : un serment peut naître
  d'un idéal ZEKROM (idéal → serment) et se suivre dans MAEDRETHNIR (pages liées).
  Table `serment_liens` (migration 0018), cible XOR.
- 🔶 **BOUCLE OUVERTE (2026-08-04) — la forme, pas le fond.** Paul : « j'aime
  bien l'outil, mais la forme n'est pas adaptée ; essayons quelque chose de plus
  visuel — une belle cartographie ». **État des lieux + trois formes livrés en
  maquette** (`design/preview-draukhain-carto.html`), **zéro ligne de production
  touchée**. Six constats, tous chiffrés : ① la page s'ouvre sur un formulaire,
  pas sur une carte ; ② trois représentations du même objet cohabitent (rangée de
  boutons + foyer + voie jalonnée) ; ③ le dessin n'a rien à dessiner (**1 serment,
  0 flamme** en base — toute la grammaire du foyer est du code qui ne s'exprime
  jamais) ; ④ ce n'est pas une cartographie mais une liste et un détail (jamais
  plus d'un serment à l'écran) ; ⑤ ~~**la passerelle est borgne**~~ — **FERMÉ le
  2026-08-04 (PR #140, fil VRANESH)** : `GET /api/serments` sert désormais les
  futurs entrants et un serment montre ce qui le *menace* ou le *sert*, l'advenu
  en tête. Le constat était juste, il ne l'est plus — deux fils l'ont diagnostiqué
  le même jour, l'un l'a écrit, l'autre l'a corrigé ; ⑥ le repli sans JS
  d'`imladrik.html` annonce encore « DRAUKHAIN —
  à venir ». Trois formes au choix : **A la voûte** (les serments coexistent, les
  fils vers ZEKROM/VRANESH/MAEDRETHNIR se voient — **reco**), **B le brasier**
  (la plus belle, aucune place pour les fils), **C la frise** (la plus solide en
  volume, mais une liste reste une liste). Chaque forme est **mesurée** aux trois
  volumes 1/5/12 : bbox contre viewBox **et croisement des étiquettes** — ce
  second critère manquait à la règle du 2026-08-01 et a rattrapé deux noms qui se
  chevauchaient en forme A.
- ✅ **LA VOÛTE LIVRÉE (2026-08-04, Paul : forme A + « la date sur la flamme »).**
  `draukhain.html` s'ouvre désormais sur la **voûte** : tous les serments à la
  fois, les fils vers les caps voisins tissés en encre pâle, allumés au survol ;
  le clic ouvre le **foyer** du serment visé. Chaque vue a UN travail et un seul
  — la voûte l'ensemble, le foyer un serment, le registre l'écriture (la rangée
  de boutons du foyer disparaît : c'était la troisième liste). « Sceller un
  serment » passe **derrière** la carte (miroir de « l'image d'abord » acté sur
  VRANESH). Le fil entrant depuis VRANESH — **fermé côté serveur par la PR #140,
  menée en parallèle le même jour** — se voit désormais **sur la carte** : le
  futur qui *menace* ou *sert* un serment se dit dans la parole, et un futur
  **advenu** s'y signale ; le déroulé, lui, reste dans la fiche (§5, prouvé par
  l'ABSENCE). Front seul : `css/draukhain-voute.css`, `js/draukhain.js`,
  `draukhain.html`.
  **Les deux serments réels de Paul** sont scellés en base (dictée du jour).
- ✅ **LA DATE DE CE QUE LA FLAMME RACONTE (2026-08-04, « ok go » de Paul).**
  Migration `0020_flammes_survenu_le.sql` **APPLIQUÉE en prod** : colonne
  `survenu_le date` optionnelle sur `flammes`, additive, RLS inchangée. Le
  champ se saisit au formulaire de flamme (optionnel, `max` = aujourd'hui) et
  **se lit** sur la flamme, en français, posé avant le texte — on cherche la
  date avant de lire l'histoire. `validateFlamme` porte le **miroir exact du
  CHECK** (`estJourPasse` : format `AAAA-MM-JJ` strict, borne haute à J+1 pour
  absorber le fuseau, refus par défaut). Preuve par l'ABSENCE aux deux bouts :
  aucune clé `survenu_le` n'est envoyée quand le champ est vide, et une flamme
  sans date n'en affiche aucune.
- ⏳ **Attendu de Paul** : l'histoire de l'exemple vécu cette semaine, à consigner
  en flamme « victoire » datée sur le serment « ne plus jamais perdre mon calme ».

## 7. Séquencement (une boucle à la fois, directive EB)

- **✅ B0 (cadrage)** : cadrage + prototype statique. Zéro code produit.
- **✅ B1 — la carto en prod (2026-07-24, go Paul « go b1 »)** : `imladrik.html`
  est devenue la cartographie boussole Kalamn-talaen (3 caps autour du médaillon
  épée + dragon, légende gravée) ; le journal a migré vers `maedrethnir.html`
  (renommage front seul — `js/imladrik.js`, API `/api/imladrik*`, migrations
  `0012`/`0014`, RLS **inchangés**). Carto muette et sans donnée (§5) sur le
  langage de `css/boussole.css` (réutilisé) + `js/imladrik-carto.js` (clone du
  cœur de `boussole.js`, sans cockpit) + `css/imladrik-carto.css`. Console : état
  IMLADRIK « En chantier » → « Accéder ». Harnais : `smoke-imladrik` reciblé sur
  MAEDRETHNIR, `smoke-imladrik-carto` créé, `smoke-console` mis à jour ; patrimoine
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
  **`serment_liens`** (serment → idéal ZEKROM *ou* page MAEDRETHNIR) et
  **`scenario_liens`** (scénario → serment DRAUKHAIN, rapport *menace*/*sert*,
  *ou* page MAEDRETHNIR). Migration `0018_imladrik_passerelles.sql` (ancrages
  composites manquants sur `imladrik_entrees` + `scenarios`, puis 2 tables +
  RLS) **ÉCRITE, **APPLIQUÉE en prod (2026-07-26, solo)** — gate §5 (dépend de 0016 + 0017)**. API
  `api/serment-liens.js` + `api/scenario-liens.js` ; liens repliés dans les GET
  `/api/serments` et `/api/situations` (dégradation propre à `[]` si 0018 pas
  appliquée). Front : section « Passerelles » sur `draukhain.html` et
  `vranesh.html`. Harnais `unit-imladrik-passerelles` + extensions smoke.
  **✅ FAIT — appliqué 2026-07-26 (solo) (ex-reste : appliquer `0018` (après 0016 + 0017) en prod + go.**

## 8. Décisions attendues de Paul

1. **Les noms** tels qu'orthographiés — MAEDRETHNIR / VRANESH / DRAUKHAIN /
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
  tel quel par VRANESH et MAEDRETHNIR quand leur tour viendra. Tokens de
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

**✅ BOUCLE ④ LIVRÉE (2026-07-30) — dicter dans IMLADRIK.** Le manque est
comblé : `OUTILS_PAR_QUADRANT.imladrik` n'est plus vide.
- **Serveur** (`api/_lib/leo.js`) : 5 outils — `proposer_page_journal`
  (MAEDRETHNIR), `proposer_serment` + `proposer_flamme` (DRAUKHAIN),
  `proposer_situation` + `proposer_scenario` (VRANESH). Écritures **pures**,
  aucun outil de suppression (principe L2b §0 intact). Ajout d'un support
  **`enum`** au catalogue (source unique) : il descend dans le schéma tool-use
  ET dans `validerProposition` — une nature ou une vraisemblance hors liste est
  **rejetée**, jamais corrigée en silence. Reformulations déterministes : c'est
  ce texte, jamais la prose du modèle, que Paul confirme.
- **Front** : les 5 gabarits d'exécution dans `js/leo-accueil.js` (bornes
  alignées sur les validateurs serveur — `horizon` refusé au-delà de 200 plutôt
  que tronqué ; `serment_ref`/`situation_ref` résolus localement) ; le cartouche
  de Léo monté sur `draukhain.html`, `vranesh.html` et `maedrethnir.html`.
- **§5 intime, tenu à la lettre** : le cartouche ne restitue que des **comptes**
  (« 2 serments scellés, 1 attend d'être ravivé ») — jamais un intitulé, jamais
  une ligne de contenu ; fail-closed sans session.
- **Le micro** : le composant de dictée vocale a été **extrait** de `js/app.js`
  vers **`js/dictee.js`** (code inchangé, ses deux dépendances au shell de RIVEN
  découplées : région d'annonce créée à la demande, toast devenu un signal
  injectable). Il équipe désormais le champ « Parler à Léo » sur tous les
  quadrants. RIVEN le consomme à comportement identique.
- **Chaîne prouvée de bout en bout** (`smoke-draukhain` §D) : micro → la dictée
  atterrit dans le champ → POST `/api/leo` avec le Bearer et le quadrant → carte
  de confirmation = reformulation **serveur** → **aucune écriture** → confirmation
  → POST `/api/flammes` avec le Bearer. Patrimoine COMPLET vert (824).
- **⏭ Reste ouvert** : Léo ne sait pas encore *lire* IMLADRIK pour répondre
  « où j'en suis » en détail (le cartouche donne les comptes, pas plus) — c'est
  la marche suivante si Paul la veut.

## 11. Les YEUX de Léo — répondre « où j'en suis » (livré 2026-07-30)

Boucle enchaînée sur go Paul (« go lecture Léo »), en réponse au reste ouvert
du §10 : Léo savait **écrire** dans IMLADRIK, pas le **lire**.

- **Le front calcule, le serveur valide.** Chaque page du quadrant joint à la
  question un **état borné** (`voix.etat`), calculé sur les données **déjà
  chargées** — aucun second fetch, aucune requête supplémentaire.
- **Forme unique et générique** (réutilisable par les autres quadrants) :
  `{ compteurs: { 'libellé': nombre }, listes: { 'libellé': [ { libelle, marque? } ] } }`.
  Bornes dures : 12 compteurs, 4 listes, 40 entrées par liste, 200 caractères
  par intitulé, entiers 0..99999. `validerEtatQuadrant` est **fail-closed** :
  une clé surnuméraire, un type inattendu, une borne dépassée → **rejet de
  l'ensemble**, jamais un rattrapage silencieux (même règle que les mains).
- **Règle de minimisation (§5), explicite** : des **comptes** et des
  **intitulés** — ceux que Paul nomme lui-même quand il dicte — et **rien
  d'autre**. Jamais le texte d'une flamme, le déroulé d'un scénario, le
  `pourquoi`/`horizon` d'un serment, ni **aucun identifiant**. MAEDRETHNIR est au
  régime le plus strict : **comptes + la date de la dernière page**, jamais un
  titre (un titre de page de journal est déjà de l'intime).
- **Le prompt reste honnête** : le bloc d'état se termine par une consigne
  déterministe — « ce qui n'y figure pas, tu ne le sais pas ; tu n'as pas le
  contenu des pages, des flammes ni des scénarios : ne fais jamais semblant de
  les avoir lus ».
- **Coût** : l'état voyage dans un **second bloc système, hors cache**, pour ne
  pas invalider le préfixe stable (le cache du prompt par quadrant est préservé).
- **Compatibilité** : `etat` absent → l'appel repart **exactement** comme avant
  (RIVEN, ADRAMELECH, NICOL BOLAS inchangés).
- Harnais : `unit-leo-voix` (+6 verdicts : absence, nominal, fail-closed,
  bornes, rendu déterministe, système stable sans donnée) et `smoke-draukhain`
  §D (+6 : état transmis, comptes réels, intitulés marqués, **aucun texte de
  flamme**, **aucun identifiant**, ni pourquoi ni horizon). Patrimoine COMPLET
  vert (**866**).

## 12. AMATSU — le dragon de l'air (dicté par Paul le 2026-10-18)

**Les mots de Paul** (dictée vocale recopiée ; seule la ponctuation est posée) :
> Sur IMLADRIK, créons un nouveau dragon : **Amatsu, le dragon de l'air**.
> Symbole de la liberté, de la colère, de la force de la nature ; celui qui
> apporte la fraîcheur de la bise et la terreur de l'ouragan. L'air est un élément
> indispensable à ma vie, tant par ce qu'il représente — liberté, force indomptée,
> force qui se donne à tous sans juger — que par ce qu'il est : un pilier du monde,
> de la nature, des saisons. Si je suis l'air et les vents, je ne peux pas me
> tromper. Une décision, un projet, une idée me rendra-t-elle plus libre ? C'est
> ça, le rôle d'Amatsu. La liberté, c'est aussi ma cohérence avec moi-même, mes
> choix et ma paix. L'air, c'est aussi la volatilité : vigilance, donc, à ne pas me
> laisser emporter par le vent.

⚠️ La dictée se termine sur « Agence à » — un mot coupé. Il n'est **pas
interprété** : question posée à Paul (§12.4 ①).

### 12.1 Ce qu'Amatsu est — lu dans ces mots, rien d'ajouté

Les sept dragons en place **portent chacun un objet** : des pages (MAEDRETHNIR),
des futurs (VRANESH), des serments (DRAUKHAIN), des idées (ADRAMELECH), des
talents (RESHIRAM), des idéaux (ZEKROM), des technos (ZOH SHIA). **Amatsu ne
porte pas d'objet : il pose une question à ceux des autres.** « Une décision, un
projet, une idée me rendra-t-elle plus libre ? » — la décision, le projet, l'idée
existent déjà ailleurs (une idée ADRAMELECH, un serment DRAUKHAIN, une situation
VRANESH, un chantier RIVEN, un choix du jour). Amatsu est **le souffle qui les
traverse** et rend une lecture sur un seul axe, la liberté, que Paul décline
lui-même en trois vents :
1. **la bise** — *plus libre ?* (la liberté gagnée ou perdue) ;
2. **le souffle égal** — *cohérent avec moi-même, mes choix, ma paix ?* ;
3. **l'ouragan** — *emporté par le vent ?* (la volatilité : l'élan du moment qui
   se prend pour une décision).

Ce qu'il n'est pas : ni un juge (« des rappels, pas du jugement », console §3.4),
ni une note ; ni un doublon de ZEKROM (l'idéal dit où Paul veut aller ; Amatsu
dit si *ce pas-ci* le rend plus libre), ni de DRAUKHAIN (la volonté tient le cap ;
Amatsu vérifie que le cap ne devient pas une cage).

### 12.2 ✅ Boucle 1 — l'étoile (livrée le 2026-10-18)

Même geste que ZOH SHIA le 04/10 et qu'IFULVIN : **une étoile d'attente**. AMATSU
paraît dans la constellation des DRAGONS, « AMATSU » puis « Dragon de l’air » ;
au survol, Léo dit les mots de Paul et que la forme reste à décider. Aucune page,
aucune cible, aucune table, aucune API : rien n'est promis que ce qui existe.
- Registre `js/registre-lv3.mjs` (huitième enfant de `constellation-dragons`,
  blason « portail » provisoire) ; repli sans JavaScript d'`imladrik.html` (dit,
  sans lien) ; lexique vocal.
- **Les verrous des harnais sont REFIXÉS, pas relâchés** : « sept dragons »
  devient « huit » (ni sept, ni neuf) dans douze harnais ; « tous à page » devient
  « sept à page, AMATSU seul attend, nommé » — un neuvième dragon sans page ferait
  rougir ces lignes.
- Mesuré au navigateur (`smoke-dragons-epithetes`, à 300 · 320 · 360 · 390 · 414 · 1280 px) : huit étoiles, seize lignes, aucun croisement, rien hors du ciel, épithètes ≥ 11 px et contraste ≥ 5,0. **Le premier passage a cédé à 300 et 320 px** — le mode de défaillance (a) du pre-mortem : la couronne des huit n'y est plus qu'une colonne de 70 px de large, et l'épithète de RESHIRAM mordait le cœur de ZOH SHIA, sans place dessous, dessus ni à côté à hauteur d'étoile. **Corrigé dans le même passage, dans le moteur** (`js/ciel.js`) : les quatre poses en **diagonale** de la carte gravée, réservées aux noms à deux lignes — à côté et décalé, sous la hauteur de l'étoile d'abord (le nom reste « dessous »), à droite puis à gauche, puis au-dessus. Rouge avant, vert après, sur le même cas ; à 360 px et au-delà, pas un pixel n'a bougé (mesuré). Patrimoine complet : 59 harnais navigateur et 65 suites unitaires verts sur l'arbre final, en trois passages — le premier arrêté par les épithètes (ci-dessus), le second par un verrou à sept oublié dans le harnais plein écran, le troisième par un verrou à sept noms dans le retour des feuilles : deux verrous **trouvés par la mesure, pas par la recherche** (le motif `, 7]` et une liste de noms échappaient au grep). Une seule ligne reste rouge, `maquette300_390_noms` de `smoke-riven-nebuleuses`, **identique sur `origin/main` pur dans ce conteneur** (témoin rejoué dans un worktree) : l'écart d'environnement déjà consigné le 08/10, vert en CI, étranger à cette boucle.

### 12.3 Boucle 2 — le contenu (À CADRER, format 6 points — rien n'est codé)

① **But** : Paul soumet une décision, un projet ou une idée à Amatsu et obtient,
datée, sa lecture aux trois vents — puis peut la relire quand le vent est retombé.
*Ligne MS* : aucun client, aucun contrat — c'est le perso d'IMLADRIK, dont
l'objectif propre est préservé (complément du 12/10). On le fait quand même parce
que c'est le filtre des choix de Paul, choix pros compris : un contrat qui
enferme n'est pas un bon contrat.
② **Étapes pressenties** : a) la grille des trois vents, figée avec Paul ; b) la
voie d'entrée ; c) la lecture (où elle se dépose et se relit) ; d) harnais et
preuve par l'ABSENCE (§5).
③ **Moyens — ligne ZS** : l'alternative de l'année n'est pas un écran de saisie,
c'est **l'agent qui converse** : Paul dicte « Amatsu, ce projet… » à Léo depuis
n'importe quel quadrant, Léo pose les trois vents et dépose la lecture — une
**main** de plus dans `OUTILS_PAR_QUADRANT` (§10), confirmation avant écriture,
zéro contenu en logs. Côté données, deux options : **(a) zéro table** — la
lecture est une **passerelle** posée sur l'objet jugé (idée, serment, situation,
chantier), à cible XOR comme `serment_liens`/`scenario_liens` (0018) ; **(b) une
table `amatsu_lectures`** (owner_id, cible XOR ou texte libre, trois vents, date)
pour ce qui n'a d'objet nulle part (une décision du jour). Reco : (a) d'abord,
(b) si Paul veut juger ce qui n'a pas d'objet.
④ **Critères** : une lecture réelle dictée par Paul, visible après auth seulement,
aucune ligne de contenu dans le HTML servi ni dans les logs ; fail-closed ; le
harnais prouve l'ABSENCE (rien au simple survol).
⑤ **Pas dans la boucle** : aucun score, aucune note chiffrée de la liberté ;
aucun automate qui juge seul (Léo propose, Paul tranche) ; aucune page avant que
la voie vocale soit prouvée (leçon MAEDRETHNIR §4 bis : la distance tue le cap).
⑥ **Pre-mortem** : (a) *Amatsu devient un formulaire de plus* → mort par distance
⇒ la voix d'abord, jamais d'écran en premier ; (b) *il doublonne ZEKROM ou
DRAUKHAIN* ⇒ Amatsu ne stocke aucun objet nouveau, il lit ceux qui existent ;
(c) *la lecture devient un verdict qui culpabilise* ⇒ trois questions, jamais une
note, formulées en invitation (règle cardinale positive des caps) ; (d) *l'ouragan
juge la bise* — une lecture rendue un jour de vent ⇒ chaque lecture est datée et
se **relit** (le vent retombe) ; (e) *la dictée déforme le nom* ⇒ lexique vocal
posé en boucle 1.

### 12.4 Décisions de Paul — ✅ TRANCHÉES le 2026-10-18 (panneaux, 15 h 20 UTC)

1. **Le mot coupé « Agence à… »** : *rien, la phrase était finie* — résidu de dictée, ignoré.
2. **Le nom et l'épithète** : **AMATSU — Dragon de l’air**, figés au lexique. **Le blason
   se dessine en boucle 2** (la bise, une spirale de vent) ; le « portail » reste provisoire.
3. **La forme** : **C — A puis B.** D'abord le souffle transversal par la voix de Léo
   (2a), prouvé en réel ; la page et son registre de lectures ensuite (2b).
4. **La grille** : **les trois vents** — plus libre ? · cohérent avec moi-même, mes
   choix, ma paix ? · emporté par le vent ? Trois questions, jamais une note.

*(Les questions telles qu'elles ont été posées, pour mémoire :)*

### 12.5 Boucle 2a — le souffle par la voix de Léo (cadrée et bâtie le 2026-10-18)

① **But.** Depuis n'importe quelle page où Léo est montée (RIVEN, ADRAMELECH,
IMLADRIK), Paul dicte « Amatsu, … » et soumet une décision, un projet, une
idée ; Léo pose les trois vents, puis propose d'enregistrer la **lecture** —
l'objet soumis et les trois réponses de Paul, dans ses mots, datées par le
serveur. Elle s'écrit sous l'anneau vert (journalisée, défaisable d'un clic).
*Ligne MS* : aucun client, aucun contrat — c'est le perso ; dit tel quel.
② **Étapes.** a) la migration, écrite et **NON appliquée** ; b) le validateur
miroir et la route ; c) la main de Léo (catalogue, prompt, reformulation) ;
d) le défaire ; e) le gabarit front ; f) le blason ; g) les harnais ; h) la
preuve réelle — **après** le go de Paul sur la migration.
③ **Moyens — ligne ZS.** Aucune technologie nouvelle : le tool-use de l'API
Claude déjà en service, une table, une route, zéro écran. Ce qui est posé :
- `supabase/migrations/20261018160000_amatsu_lectures.sql` — `amatsu_lectures`
  (objet 200 · bise 500 · souffle 500 · ouragan 500 · created_at), RLS par
  owner, **aucune policy UPDATE** (une lecture se relit, ne se corrige pas),
  anon sans droit, paire (owner_id, id) unique pour les passerelles de la 2b.
  ✅ **Appliquée le 2026-10-19 par Paul** (éditeur SQL), après une relecture qui a
  trouvé et fermé une faille : le revoke ne visait qu'anon, et Supabase laissait
  UPDATE et TRUNCATE au rôle connecté — TRUNCATE passe sous la RLS (prouvé en
  l'exécutant, `unit-amatsu-validate` §9). Contrôle relu après application :
  rls true · policies DELETE,INSERT,SELECT · connecté sans update ni truncate ·
  anon sans lecture · 0 ligne.
- `api/_lib/validate.js` (`validateLectureAmatsu`, bornes lues dans le SQL par
  le harnais) · `api/amatsu-lectures.js` (GET / POST / DELETE, miroir de
  `flammes`).
- `api/_lib/leo.js` : `proposer_lecture_amatsu`, **premier outil transversal**
  du catalogue (`quadrant` en liste : riven, adramelech, imladrik — NICOL
  BOLAS reste sans main), **vert**, quatre arguments **requis** ; la règle du
  prompt : poser les trois vents avant d'appeler, jamais une note ni un
  verdict de sa main ; la reformulation déterministe nomme les trois vents.
- `api/_lib/leo-execution.js` : `DEFAIRES` (table `amatsu_lectures`, sans
  retouche) et `DEPENDANCES` (rien ne naît dessus en 2a).
- `js/leo-accueil.js` : le gabarit (POST, corps exact, aucune `_ref`).
- `js/blasons.mjs` : le blason **amatsu** — les trois vents de la carte gravée,
  deux souffles qui s'enroulent, le troisième qui file et se prolonge d'or.
④ **Critères de réussite.** Unitaires verts avec les verrous **refixés** (onze
outils, dix verts, treize mains servies, chaque vert son défaire) ;
`unit-amatsu-validate` prouve le miroir API ↔ SQL et les invariants de la
migration ; `smoke-draukhain` §G prouve la chaîne : proposition → carte au
texte serveur → **rien d'écrit avant le clic** → un POST au corps exact, avec
le Bearer. **Preuve réelle** : une lecture dictée par Paul, visible via GET
après auth. ✅ **FAITE en production le 2026-10-19** (après la fusion de #399,
`abe073b`) : Paul a d'abord dicté deux vents sur trois — Léo n'a RIEN écrit et a
demandé le troisième (pre-mortem (a) tenu en réel) ; au troisième, la carte, la
confirmation, et la lecture en base à 19:42:09 UTC (compte relu par Paul : 1),
quatre secondes après l'appel de Léo (`leo_appels` : tentee 19:42:00 → reussie
19:42:05). Aucune ligne dans `leo_ecritures` sur la période : la lecture est
passée par la carte confirmée, pas par une écriture faite seule. ⚠️ La preview
n'a pas permis la preuve : elle ne voyait pas `ULTIMA_PROPRIETAIRES` malgré
« Production and Preview » coché et deux redéploiements (piste non vérifiée :
« Separate Production Secret Values »).
⑤ **Pas dans la 2a.** Pas de page, pas de registre de relecture (2b) ; pas de
passerelle vers l'objet jugé (2b) ; pas de NICOL BOLAS ; pas de « yeux » (état
transmis à Léo) ; pas de score.
⑥ **Pre-mortem.** (a) *Léo appelle l'outil avant d'avoir posé les vents* ⇒ les
quatre arguments sont requis côté schéma ET validation, et le prompt le dit ;
(b) *le vert « sans demander » enregistre des réponses inventées* ⇒ la règle
commune exige chaque valeur mot pour mot dans le dernier message de Paul :
trois réponses sur trois tours retombent sur la carte, c'est voulu ; (c) *la
table n'existe pas en prod* ⇒ POST → 500 générique, la carte dit l'échec, rien
n'est perdu ni inventé — et c'est le gate qui le veut ; (d) *un onzième vert
entre en silence* ⇒ `unit-leo-anneau` le nomme à la main, et il l'a fait.

1. **Le mot coupé** : la dictée s'arrête sur « Agence à… » — que suivait-il ?
2. **Le nom et l'épithète** : AMATSU / « Dragon de l’air » — figés au lexique dès
   validation.
3. **La forme de la boucle 2** : (A) le souffle transversal — Léo, à la voix,
   depuis n'importe quel cap, lecture déposée en passerelle sur l'objet jugé
   (**reco**) ; (B) un cap à page avec son registre de lectures ; (C) A puis B.
4. **La grille** : les trois vents — *plus libre ? · cohérent (moi-même, mes
   choix, ma paix) ? · emporté (volatilité) ?* — ou une autre.
5. **Le blason** : « portail » provisoire ; un blason propre (la bise, une
   spirale de vent) à dessiner en boucle 2 ?

### 12.6 Boucle 2b — relire les lectures (cadrage du 2026-10-19, RIEN DE CODÉ)

**Point de départ mesuré** : la 2a est fusionnée (`abe073b`) ; une lecture réelle en
base ; `GET /api/amatsu-lectures` existe déjà (bornée à 200, plus récentes d'abord) ;
l'étoile AMATSU est inerte par décision ; aucune policy UPDATE sur `amatsu_lectures`.

**Découpage proposé (EB : une boucle à la fois)** :
- **2b-α — la maquette** : deux ou trois formes en page statique, données fictives,
  zéro code produit (patron de `design/preview-draukhain-carto.html`). Paul choisit.
- **2b-β — la page de relecture** dans la forme choisie, et l'étoile qui s'ouvre.
- **2b-γ — le regard d'après** *(sur décision)* : relire, c'est pouvoir ajouter un
  regard daté sous une lecture, sans jamais toucher l'originale.
- **2c — la passerelle** vers l'objet jugé : boucle suivante, pas la 2b.

① **But.** Paul ouvre l'étoile AMATSU et relit ses lectures quand le vent est
retombé : d'abord l'objet et la date, les trois vents au clic. *Ligne MS* : aucun
client, aucun contrat — c'est le perso d'IMLADRIK ; dit tel quel.

② **Étapes de la 2b-β.**
a) une coque `amatsu.html` sur le patron des pages intimes d'IMLADRIK
(`draukhain.html` : coque du ciel, `data-leo-quadrant="imladrik"`, cartouche de Léo
monté) ; b) `js/amatsu.js` : rendu **après session** depuis la route existante,
`createElement`/`textContent` seulement ; c) le registre : `cible: 'amatsu.html'`,
état ouvert, parole réécrite, repli sans JavaScript avec lien ; d) un harnais
`smoke-amatsu` ; e) **refixer les verrous** : 13 verdicts dans 9 harnais exigent
aujourd'hui « AMATSU seul attend » (`smoke-draukhain`, `smoke-imladrik-carto`,
`smoke-retour-feuilles`, `unit-adaptateur-lv4`, `unit-amatsu-validate`,
`unit-leo-anneau`, `unit-leo-defaire`, `unit-leo-mains`, `unit-registre-lv3`) ;
IFULVIN redevient la seule étoile inerte, nommée.

③ **Moyens — ligne ZS.** Aucune technologie nouvelle, aucun coût nouveau : une page
statique, une route déjà en production, le vocabulaire de `css/boussole.css` et de
la voûte. *Alternative de l'année* : la relecture **à la voix**, « Amatsu,
relis-moi mes lectures », par les yeux de Léo — zéro écran. *Verdict* : complément
utile, pas un remplacement. Paul a choisi la forme C (la page après la voix), et
relire demande une vue calme d'ensemble que la voix rend mal au-delà de trois
lectures. Aucune capacité évolutive ni tarif en jeu : pas de source datée requise.

④ **Critères de réussite, vérifiables.**
- L'étoile s'ouvre sur `amatsu.html` ; après connexion, la page compte autant de
  lectures que la base (compte relu par Paul).
- Au repos : objet et date seulement. Au clic : les trois vents.
- Sans session (401) : rien ne s'affiche. Le HTML servi ne porte aucune lecture.
- Le harnais le prouve **par l'absence** (aucun vent au simple survol, aucun
  contenu dans la page servie), chaque verdict éprouvé en le cassant.
- Patrimoine vert, CI verte, les 13 verrous refixés nommément.

⑤ **Pas dans la 2b.** La passerelle (2c) ; écrire depuis la page — la voix reste
l'entrée (leçon MAEDRETHNIR §4 bis : un formulaire de plus meurt de distance) ;
aucun score, aucune tendance ni courbe de la liberté (« jamais une note ») ;
aucune suppression depuis la page.

⑥ **Pre-mortem.**
(a) *Un mur de texte* — VRANESH v1 a été rejeté pour ça ⇒ affichage à la demande :
objet et date d'abord, les vents au clic ;
(b) *l'intime fuit* dans le HTML, les logs ou une erreur ⇒ rendu après session,
`textContent`, page muette, absence prouvée ;
(c) *la page n'est jamais ouverte* ⇒ l'étoile y mène, et la carte de Léo peut
proposer « relire dans AMATSU » après une lecture ;
(d) *relire devient corriger* — le vent du jour réécrit par celui d'après ⇒
l'originale reste immuable (aucune policy UPDATE, déjà en base) ; un regard
d'après, s'il vient, est un ajout séparé et daté ;
(e) *un verrou oublié* ⇒ les 13 verdicts sont listés ci-dessus et refixés un à un ;
(f) *pro et perso se mêlent* par la passerelle ⇒ passerelle reportée en 2c, et les
chantiers RIVEN exclus par défaut.

**Formes à maquetter (2b-α)** :
- **la rose des vents** — les lectures disposées autour d'une rose de carte savante,
  une par aire de vent ; le registre le plus juste, à éprouver en volume ;
- **le livre de bord** — une ligne par lecture : la date, l'objet, trois petits
  signes de vent ; le plus lisible quand les lectures s'accumulent ;
- **le ciel des vents** — les lectures comme étoiles dans le moteur du ciel déjà en
  place ; capitalise le plus, mais un ciel d'intimes risque la densité.

**Décisions de Paul (19/10, sur panneaux)** : le découpage est retenu, α puis β ;
le regard d'après vient **plus tard, en γ** ; **une seule forme à maquetter, la rose
des vents**. Maquette : `design/preview-amatsu-rose.html` (données fictives, mesure
de soi exposée dans `window.__mesureAmatsu`, repli en liste sous 52 rem). La 2b-β
ne se code qu'après le go de Paul sur la maquette.

**2b-β — BÂTIE le 19/10, sur le go de Paul (« go, la rose des vents »)** :
`amatsu.html` (coque des pages intimes, `data-leo-quadrant="imladrik"`),
`css/amatsu-rose.css`, `js/amatsu.js` (rendu après session depuis
`GET /api/amatsu-lectures`, `createElement`/`textContent`, lectures mal formées
écartées) ; l'étoile s'ouvre (`cible: 'amatsu.html'`, « Ouvert », parole réécrite),
le repli sans JavaScript y mène. Au-delà de douze, onze souffles puis « N plus
anciennes » qui mène au livre. Harnais `tests/smoke-amatsu.mjs`.
- *Ce que la mesure a corrigé en route* : dans la colonne des quadrants (880 px), la
  rose tombait à 450 px et ses étiquettes à 7 px, « zéro croisement » restant vert ⇒
  page AMATSU élargie à 1160 px, parole sous la rose entre 52 et 72 rem, et un verdict
  de taille RENDUE (objet ≥ 12 px à 1280 et 1000 px), éprouvé en le cassant.
- *Les verrous refixés* : la liste de 13 verdicts ci-dessus était trop large — les
  mentions d'AMATSU dans `smoke-draukhain` et les unitaires de Léo portent sur la
  voix (2a), pas sur l'étoile inerte, et sont restées vertes sans retouche. Refixés
  nommément : voir le journal du 19/10.
