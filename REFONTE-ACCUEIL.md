# CADRAGE — Refonte de l'Accueil : la carte antique comme hub d'Ultima

## ✅ DÉCISIONS ACTÉES (Paul, 2026-07-07)

1. **Direction visuelle B « Age of Mythology »** retenue sur previews (3
   directions montrées : A Ptolémée savant / B mythologie / C hybride livre
   d'enfance). Référence committée : `design/preview-accueil-mythologie.html`
   (autonome, à ouvrir dans un navigateur). Parti pris : mer profonde moirée
   avec monstres discrets, terres ocre/vertes avec relief suggéré, cartouche
   doré « ULTIMA », couleurs de type du projet adoucies sur pastilles à
   anneau crème (#e08a3c, #4a86bd, #3d9663, #8b5cbf), étiquettes-bannières.
   Vigilance implémentation : la pastille seule fait 1,49:1 sur la terre —
   la délimitation repose sur l'anneau crème (10,9:1 sur mer) + cerne foncé,
   l'information est TOUJOURS portée par l'étiquette texte (double codage).
2. **Auth invisible** (et non suppression de la connexion) : une connexion
   par appareil, session persistante — Paul ne revoit jamais l'écran de
   connexion au quotidien. La suppression est refusée (URL jamais secrète,
   réseau commercial = PII, RLS fondée sur le compte). À implémenter dans
   la boucle R3 (persistance de session + retrait des frictions d'auth
   visibles), SANS toucher aux policies RLS.

> Phase cadrage navigation (aucun code). Auteur : interface-ux, 2026-07-07.
> Vision Paul : arriver directement sur une belle et grande carte de France
> antique (Ptolémée / Age of Mythology) qui se consulte et se déplace aisément ;
> points = contacts ; « Ultima » stylisé en haut ; navigation simple et fluide ;
> ludique et imaginaire mais géographie réelle.
> Sources relues : PRODUIT.md, CADRAGE-ULTIMA.md (ÉTAT), ROADMAP-SITE.md,
> AUDIT-2026-07-06.md (U1-U13 — non re-signalés), index.html, js/app.js
> (`activerOnglet`, `rendreAccueil`, `ouvrirCibleDepuisAccueil`), js/carte.js.
> Hors périmètre ici : authentification (décision séparée).

---

## 1. Architecture — la carte antique DEVIENT l'écran d'arrivée (fusion Accueil × Carte)

**Recommandation ferme : fusionner Accueil et Carte en un écran unique — la
carte antique plein écran est l'app au démarrage — et faire revivre les
contenus v3-① (relances, pilotage, suggestions R1-R4, raccourcis) dans un
volet « Aujourd'hui » qui s'ouvre PAR-DESSUS la carte, sans jamais la quitter.**

Pourquoi : la vision de Paul (« on arrive directement sur la carte, les points
sont les contacts ») est incompatible avec un Accueil-écran séparé — aujourd'hui
la carte de livre d'enfance est un décor SANS les vrais points, et la vraie
carte est un 2ᵉ onglet. La fusion supprime le doublon « deux cartes » et fait
de la carte le hub réel (axe n°1 : orientation évidente, on est toujours sur
la carte ou dans un volet refermable qui y ramène).

Structure cible :

- **Écran unique « Carte »** : Leaflet plein écran habillé antique (§2),
  cartouche « Ultima » en haut (titre stylisé — remplace l'entête
  `.entete` actuelle), badge « Aujourd'hui » persistant, bouton flottant
  « + Ajouter », loupe de recherche (v3-⑥, conservée telle quelle).
- **Volet « Aujourd'hui »** (successeur de l'Accueil v3-①) : bottom-sheet
  mobile (~75 % hauteur, carte visible assombrie derrière) / panneau gauche
  desktop. Contenu = EXACTEMENT le DOM produit par `rendreAccueil()` :
  « Bienvenue, Paul », « On fait quoi aujourd'hui ? », Relances à faire
  (cochables « Fait » sur place, comportement conservé), « Où en sont mes
  rapprochements », suggestions R1-R4, raccourcis. Le registre parchemin
  v3-① (rose des vents, cadres dessinés, Caveat) habille le volet : rien du
  travail graphique n'est jeté. Toute action « ouvrir » ferme le volet et
  centre la carte (motif `ouvrirCibleDepuisAccueil` déjà écrit — seul
  `activerOnglet('carte')` devient « fermer le volet »).
- **Barre d'onglets réduite à 2 : Carte · Contacts.** Contacts reste un
  onglet : c'est une liste de travail (saisie progressive, contacts « À
  placer » sans position — ils n'existent PAS sur la carte, il leur faut un
  espace propre).
- **Ouverture du volet** : bouton-cartouche « Aujourd'hui » sous le titre
  Ultima, avec badge chiffré = nombre de relances dues (le radar « rien ne se
  perd » reste visible en permanence, même volet fermé). Si ≥ 1 relance due
  au chargement, le badge est mis en évidence (pas d'ouverture automatique :
  Paul arrive sur SA carte, c'est la promesse).
- **Sortie du volet** : bouton fermer, Échap, tap sur la carte assombrie,
  glissement vers le bas (mobile). Jamais de piège (axe n°1).

Alternatives écartées (1 ligne chacune) :
- *Garder 3 onglets, « Aujourd'hui » remplaçant « Accueil »* : chantier minimal
  (réutilise `activerOnglet`) mais on quitte visuellement la carte à chaque
  consultation → la carte n'est plus le hub ; à garder en repli si le
  bottom-sheet dérape en budget.
- *Tout dans la carte, relances en marqueurs/panneaux dessinés SUR la carte* :
  poétique mais illisible dès 5 relances, et une relance sur relation n'a pas
  de position unique ; effort fort, impact incertain.

Impact chantier : `index.html` (entête → cartouche, section accueil → volet),
`app.js` (démarrage sur `carte`, `activerOnglet` à 2 entrées, `rendreAccueil`
rebranché sur le conteneur du volet), CSS volet ; `rendreAccueil` et ses
sections sont réutilisés tels quels.

---

## 2. Technique carte — (a) Leaflet habillé, avec « voile Ptolémée » au dézoom

**Recommandation ferme : option (a) — Leaflet/OSM conservé, habillage antique
en 3 couches, zéro dépendance nouvelle.**

1. **Tuiles sépia** : filtre CSS sur `.leaflet-tile-pane` uniquement
   (`sepia() + saturate() + contrast()` modérés, calibrage exact = graphisme).
   Aucun JS, aucune tuile nouvelle, politique OSM inchangée.
2. **Décor fixe hors carte** (DOM/SVG au-dessus, `pointer-events: none`
   obligatoire) : cadre parchemin vignetté, cartouche « Ultima » lettré,
   rose des vents (réutiliser le SVG v3-① existant), graticule léger en
   coins. 100 % local (CSP : rien d'externe), réutilisable du registre
   parchemin déjà livré.
3. **Marqueurs et traits redessinés** « sceaux et encre » : mêmes
   `circleMarker`/`polyline` Leaflet, palette recalée par le graphisme
   (couleurs de type conservées en sémantique, liseré encre/blanc conservé).

Effet Ptolémée maximal au niveau France sans casser la continuité : en
zoom ≤ 6, un **voile parchemin semi-opaque + contour de France encré** (SVG
local plein écran, pointer-events: none) se superpose en fondu — les tuiles
modernes disparaissent quand on embrasse la France, et se révèlent en
zoomant vers la rue. Un seul moteur, aucune bascule, géographie réelle à
tous les niveaux (le contour SVG est décoratif, les points restent projetés
par Leaflet — aucune projection maison à écrire).

Alternatives écartées :
- *(b) SVG France maison* : esthétique 100 % maîtrisée et zéro réseau, mais
  zoom limité au niveau ville → contredit le géocodage v3-⑤ (adresse → point
  précis) et « consulter un contact » en zone dense ; projection maison à
  écrire et maintenir = budget fort.
- *(c) hybride SVG ↔ Leaflet* : double moteur, rupture visuelle et de gestes
  à la bascule (l'ennemi du « se déplace aisément »), double maintenance —
  le voile au dézoom de (a) donne 80 % de l'effet pour 10 % du coût.

Pesée demandée : fluidité mobile → (a) garde le pan/zoom natif Leaflet déjà
éprouvé ; géographie réelle → (a) exacte à tous zooms ; dépendances → zéro ;
budget → (a) tient en 1 boucle d'habillage + 1 de finitions.

---

## 3. Navigation cible — les deux parcours de Paul, pas à pas

### Parcours 1 : « j'arrive → je vois la France et mes points → je consulte → je reviens »

1. **Arrivée** : carte de France antique plein écran, centrée France (46.6,
   2.4, zoom 6 — existant), voile Ptolémée actif, points-contacts visibles.
   Cartouche « Ultima » en haut ; dessous, bouton « Aujourd'hui (3) » si
   relances dues. Aucune question « où suis-je ? » : il n'y a qu'un monde.
   - État vide (0 contact) : mot dessiné sur le parchemin — « Votre royaume
     est vide. Touchez + pour placer votre premier contact. » (axe n°2).
2. **Consulter** : pincer/glisser (gestes Leaflet natifs), tap sur un point
   → fiche existante. Mobile : la fiche monte en bottom-sheet (le panneau
   plein écran actuel devient tirable, la carte reste visible au-dessus =
   on sait toujours où on est). Desktop : panneau latéral inchangé.
3. **Revenir** : X, Échap, tap carte, glissement bas → la carte est
   EXACTEMENT où on l'a laissée (pas de recentrage — règle ferme).

Hésitation possible traitée : un point tapé dans une grappe dense → le
tooltip nom au survol existe ; en tap mobile la fiche s'ouvre directement
(pas d'étape intermédiaire). La désambiguïsation de grappe = clustering,
vivier ROADMAP n°5, hors périmètre refonte.

### Parcours 2 : « j'ajoute un contact → son point apparaît »

1. **Bouton flottant « + »** en bas à droite (zone pouce, ≥ 56 px), toujours
   visible sur la carte — remplace le « + Ajouter » de la barre d'outils.
2. Formulaire existant (nom seul requis) + « Trouver sur la carte »
   (géocodage v3-⑤, livré) : adresse → suggestions → aperçu pointillé sur la
   carte (existant) → Enregistrer.
3. **Feedback** : toast succès existant + la carte glisse sur le nouveau
   point (pan doux, coupé si `prefers-reduced-motion` — motif `zoomerSur`
   existant). Le point est là : preuve immédiate (axe n°4).
4. Sans adresse ni position : toast existant complété — « Enregistré.
   Sans position, retrouvez-le dans Contacts (badge À placer). » (le contact
   ne disparaît pas dans un angle mort).

### Où vivent les fonctions

| Fonction | Où | Geste |
|---|---|---|
| Recherche (v3-⑥ en livraison) | loupe dans/près du cartouche, champ dépliable — comportement v3-⑥ conservé tel quel | 1 tap + saisie |
| Ajout rapide | bouton flottant « + » | 1 tap (pouce) |
| Relances / pilotage / suggestions | volet « Aujourd'hui », badge chiffré permanent | 1 tap, retour 1 geste |
| Journal « où j'en suis » / Relier | fiche du nœud (existant) — 2 taps depuis la carte (point → fiche), conforme axe n°5 | 2 taps |
| Contacts sans position | onglet Contacts (existant) | barre du bas |

Gestes pouce : tout l'actionnable vit en bas (barre 2 onglets, « + » flottant,
bottom-sheets tirables) ; le haut (cartouche, badge, loupe) reste consultatif
ou secondaire.

---

## 4. Périmètre en boucles (4, ordonnées, chacune vérifiable par harnais)

**Boucle R1 — L'habillage antique (l'effet immédiat, à faire en premier).**
Sépia tuiles + cadre/cartouche « Ultima » + voile Ptolémée au dézoom +
marqueurs recalés (spec graphisme requise en entrée). L'app démarre sur
l'espace Carte (1 ligne : `activerOnglet('carte')` au boot) — l'Accueil v3-①
reste accessible tel quel en attendant R2 (aucune perte de fonction).
*Critères d'acceptation (verificateur)* : au chargement, l'espace carte est
visible sans geste ; `.leaflet-tile-pane` porte le filtre ; cartouche présent
et `pointer-events: none` sur tout décor (un tap « à travers » le cadre
ouvre bien une fiche) ; à zoom 6 le voile est visible, à zoom 13 absent ;
contraste marqueur/parchemin ≥ 3:1 mesuré ; non-régression smoke existants.

**Boucle R2 — Le volet « Aujourd'hui » (fusion de navigation).**
Bouton-badge sous le cartouche, `rendreAccueil()` rebranché dans le volet
(bottom-sheet mobile / panneau desktop), barre réduite à 2 onglets,
suppression de l'espace accueil-écran.
*Critères* : badge = nombre exact de relances dues (fixtures) ; cocher
« Fait » dans le volet décrémente le badge sans fermer le volet ; « ouvrir »
une relance ferme le volet, centre la carte, ouvre la fiche, focus sur
`#panneau-titre` ; Échap et tap-fond ferment ; focus rendu au bouton-badge ;
aria (`role="dialog"`, `aria-modal`) posés ; il n'existe plus que 2 onglets.

**Boucle R3 — Ergonomie pouce.**
« + » flottant (retrait du bouton de la barre d'outils), fiche mobile en
bottom-sheet tirable, retour-carte « exactement où on était », toast « À
placer » pour contact sans position, pan doux sur le point créé.
*Critères* : cible « + » ≥ 56 px, visible carte seule ; création d'un nœud
géocodé → marqueur présent et centré ; création sans position → toast avec
mention Contacts ; fermeture fiche → `vue()` identique à l'ouverture.

**Boucle R4 — Finitions et garde-fous (avec graphisme).**
Rose des vents, graticule, légende en cartouche repliable, calibrage final
des contrastes, budget perf tenu (§5), `prefers-reduced-motion` partout.
*Critères* : audit contrastes AA sur les 4 types + traits ; 150 nœuds de
fixture rendus sans chute de fluidité au pan (mesure harnais) ; zéro requête
externe nouvelle (décor 100 % local).

R1 en premier : c'est la seule boucle qui change ce que Paul VOIT dès la
première seconde, sans toucher à la navigation (risque minimal, effet
maximal) ; R2 est le cœur navigation ; R3 et R4 polissent. Chaque boucle
enrichit `tests/` (patrimoine, jamais de harnais jetable).

---

## 5. Risques UX — ce qui rendrait la carte antique PIRE que l'actuel, et les garde-fous

Indexés pour le backlog AUDIT (suite de U13) ; U12 (placement par
toucher direct) et le clustering (ROADMAP n°5) déjà consignés — non re-signalés.

- **RA1 — Contraste des points sur sépia** (impact fort × effort faible).
  Les couleurs de type (orange/vert/violet/bleu) peuvent fondre dans le
  parchemin. Garde-fou imposé au graphisme : liseré clair 2 px conservé (ou
  liseré encre foncé), contraste marqueur/fond ≥ 3:1 PROUVÉ sur capture à
  zoom 6 ET 13 avant toute fusion ; les couleurs restent distinctes entre
  elles (pas de « tout brun » : le sépia s'applique aux tuiles, jamais aux
  panes de marqueurs).
- **RA2 — Lisibilité des noms de villes brunis** (fort × faible). Un filtre
  trop appuyé rend les étiquettes OSM illisibles → Paul ne peut plus se
  repérer. Garde-fou : intensité plafonnée (le graphisme calibre, le
  verificateur lit « Lyon » à zoom 6 sur capture).
- **RA3 — Performance mobile du décor** (fort × moyen). Interdits fermes au
  front : aucun filtre SVG type `feTurbulence` sur les couches Leaflet ou
  par-marqueur (le filtre encre v3-① reste réservé aux petits SVG statiques) ;
  un seul filtre CSS, sur le tile-pane seul ; décor fixe en éléments
  composités (pas de repaint au pan). Budget : pan fluide avec 150 nœuds
  (critère R4).
- **RA4 — Le décor vole les gestes** (fort × faible). Cadre, cartouche,
  voile : `pointer-events: none` systématique ; aucun élément décoratif dans
  l'ordre de tabulation ; tap targets ≥ 44 px inchangés. Vérifié en R1.
- **RA5 — Perte du radar relances** (fort × faible). En supprimant
  l'Accueil-écran, les relances ne doivent jamais devenir invisibles :
  badge chiffré permanent sur la carte, jamais dans un menu ; wording du
  bouton : « Aujourd'hui » + nombre. Vérifié en R2.
- **Densité future** (rappel, déjà au vivier) : au-delà de ~100 nœuds les
  sceaux se chevauchent — le clustering ROADMAP n°5 devient prioritaire
  après la refonte ; aucun garde-fou nouveau à inventer ici.
- **Voile Ptolémée trompeur** (moyen × faible) : le contour France décoratif
  ne doit JAMAIS décaler la perception des points (les points restent
  projetés Leaflet au-dessus du voile) ; le voile s'estompe dès que Paul
  zoome — transition en fondu simple, coupée si `prefers-reduced-motion`.

---

## Décisions attendues de Paul (à porter par Léo)

1. Go sur la fusion Accueil × Carte + volet « Aujourd'hui » (§1) — c'est LA
   décision structurante.
2. Go sur l'option technique (a) Leaflet habillé + voile Ptolémée (§2).
3. Go sur l'ordre R1 → R4 (§4), R1 lançable dès la spec graphisme reçue.
