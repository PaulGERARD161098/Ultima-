// Module Ciel du réseau — exposé en global : window.UltimaCiel
//
// La vue d'arrivée de RIVEN depuis le 2026-08-11 (décision de Paul). Le réseau
// n'est plus un arbre à plat mais un VOLUME : une fiche est une étoile, un
// métier est une région de l'espace, une personne orbite la ou les fiches où
// elle travaille, et une relation est un trait blanc qui traverse le vide.
//
// Zéro bibliothèque, et c'est un choix argumenté : la CSP d'Ultima pose
// `script-src 'self'` (un CDN est bloqué), un moteur 3D vendorisé pèserait
// ~600 Ko pour quelques dizaines d'étoiles, et un canvas WebGL coûterait le
// focus clavier, le lecteur d'écran et le texte réel. La perspective tient en
// quinze lignes de trigonométrie et le rendu reste en SVG : chaque étoile
// demeure un élément du document, focusable et lisible.
//
// Contrat hérité de js/arbre.js — supprimé le 2026-08-13, mais sa discipline
// reste la règle ici : module auto-contenu, exposé en global, injection 100 %
// createElementNS / textContent, jamais innerHTML. Plus un
// `arreter()` : une boucle d'animation qui tourne dans un onglet caché est une
// batterie qui se vide pour rien.
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---- Géométrie du monde (unités de viewBox) ----
  // L'orientation d'ouverture, nommée : « Tout voir » y revient. DÉCLARÉE ICI, au
  // niveau du module, et non dans `rendre` : la disposition en Gémeaux se calcule
  // avant que la caméra existe, et une `var` locale aurait valu `undefined` à cet
  // instant (hoisting) — le placement se serait fait sur des NaN, en silence.
  var YAW_OUVERTURE = 0.6, PITCH_OUVERTURE = -0.28;
  var RAYON_MONDE = 300;
  var ANGLE_OR = Math.PI * (3 - Math.sqrt(5));
  var FOCALE = 620;
  var R_ETOILE_MIN = 3.2;
  // Lot 2 (26/09) : ce qu'une tête gagne sur une feuille, et l'intensité d'un
  // trait de figure. Réglés sur la maquette, pas au jugé.
  var AMPLITUDE_RANG = 1.4;
  var OPACITE_FIGURE = 0.38;
  var ESPACE_MIN = 34;
  // Plancher de la zone qui reçoit le doigt. Calibré par la mesure, pas au
  // jugé : sous cette valeur la cible tactile passe sous les 24 px du plancher
  // WCAG, et une fiche lointaine devient impossible à toucher.
  var RAYON_CAPTATION_MIN = 12.5;
  var ZOOM_MIN = 0.55, ZOOM_MAX = 1.9;
  var MAX_NOMS_PERMANENTS = 6;

  // ---- LV4 : les trois capacités du 2026-08-13, TOUTES inactives par défaut --
  // Elles servent le ciel qui se déplie (CADRAGE-LV4-CIEL-DEPLIE.md §2). RIVEN
  // n'en active aucune : sans option, pas une seule de ces valeurs n'est lue,
  // et le chemin de rendu reste celui d'hier, à l'octet près.
  //
  // Au-delà de ce seuil, « tous les noms » redevient « les six plus lourdes » :
  // un menu se lit d'un coup d'œil, un réseau non. 14 — le registre plafonne à
  // 4 caps aujourd'hui, le pire cas construit en compte 12 ; deux de marge, et
  // au-delà on dégrade au lieu de rendre illisible.
  var SEUIL_TOUS_NOMS = 14;
  // Provision de bord, en unités de viewBox, pour le cadrage serré. Ce n'est
  // PAS un confort : à courte distance l'étoile plafonne à r=9 mais traîne son
  // halo de choix (r × 5,4 = 48,6) et son nom (posé à r × 3,6 + 9 = 41,4 sous
  // elle). Sans provision, « cadrer sur les étoiles » ferait sortir du cadre
  // exactement ce qu'on cherchait à montrer.
  //
  // 50 d'abord, DÉDUIT du halo (48,6, arrondi au-dessus). Porté à 64 le
  // 2026-08-13, et pas pour arrondir : le halo n'est pas le pire des deux. Le
  // NOM est posé à r × 3,6 + 9 = 41,4 sous l'étoile et descend encore de sa
  // propre hauteur, plafonnée à 20 — soit 61. À 50, la coque pilote mesurait
  // 1,4 de marge résiduelle : dans le cadre au sens strict, et le nom du cap du
  // bas TOUCHAIT le filet. Vu sur capture, confirmé par la mesure.
  // 64 borne les deux — mais appliqué AUX QUATRE CÔTÉS il serrait pour rien :
  // l'occupation retombait à 58 % sur 390 px à douze objets, sous l'exigence.
  // Or les deux géométries ne sont pas la même. En bas, le nom DESCEND tout
  // entier sous l'étoile : il faut 64. Sur les côtés, il est CENTRÉ sur elle,
  // et seule sa moitié dépasse ; c'est le halo (48,6) qui borne. D'où deux
  // marges, une par géométrie, au lieu d'une moyenne qui n'est juste nulle part.
  //
  // ET LE PARI LATÉRAL ÉTAIT FAUX. Première version : « le nom est centré, donc
  // sa moitié suffit — 52 ». Le pire cas construit (des noms de 20 caractères,
  // la longueur où le moteur tronque) a répondu **93,7 unités de débord**. Une
  // constante ne peut pas borner une largeur de texte qu'elle ne connaît pas.
  // La marge latérale se MESURE donc sur les libellés réellement peints ; celle
  // du bas reste une constante, parce que la hauteur d'une ligne, elle, est
  // bornée par le plafond de police.
  var MARGE_CADRAGE = 64;   // haut et bas : l'étoile, son halo, et son nom dessous
  var MARGE_HALO = 52;      // côtés : l'étoile et son halo, AVANT le nom
  // Repli tant qu'aucun libellé n'a encore été mesuré (première image) : la
  // valeur prudente d'hier. Mieux vaut une image trop large qu'une image
  // débordante — on resserre à la mesure suivante, pas avant.
  var DEMI_NOM_INCONNU = 64;
  // Plafond de taille du nom quand on cadre serré. Sans lui, `10 × échelle`
  // suit la caméra sans borne et un ciel de trois objets s'écrit en capitales
  // de 30 px. 20 px = échelle 2,0 ; RIVEN plafonne à 1,65 même zoom à fond
  // (ZOOM_MIN 0,55), donc ce plafond ne peut pas le toucher.
  var PLAFOND_NOM = 20;
  // Plafond de la cible du doigt, en unités : 44 px sur une scène à l'échelle
  // 0,5 donnent 44 — au-delà, c'est une scène effondrée, pas un téléphone.
  var PLAFOND_CIBLE = 44;

  var MOTIFS_RELATION = {
    apport_affaires: null, sous_traitance: '7 5', chantier_commun: '1.5 5'
  };
  var OPACITE_STATUT_RELATION = {
    idee: 0.22, contact_etabli: 0.42, en_cours: 0.62, fructueux: 0.92, arrete: 0.14
  };
  var COULEUR_DEFAUT = '#cccccc';
  // Les quatre familles de carte.js, remontées en luminosité : sur fond de
  // nuit, les teintes du parchemin deviennent illisibles.
  var COULEURS_NUIT = {
    artisan: '#f2a15a', partenaire: '#7cb8ea', lead: '#6fd39b', chantier: '#b995e8'
  };

  var CLE_A_CLASSER = ' a-classer';
  var LABEL_A_CLASSER = 'À classer';

  // Même règle de normalisation que la datalist des secteurs.
  function normaliser(texte) {
    return (texte || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function svg(nom, attributs) {
    var el = document.createElementNS(SVG_NS, nom);
    if (attributs) {
      Object.keys(attributs).forEach(function (cle) {
        el.setAttribute(cle, attributs[cle]);
      });
    }
    return el;
  }
  function texteSvg(attributs, contenu) {
    var t = svg('text', attributs);
    t.textContent = contenu; // texte réel : jamais innerHTML
    return t;
  }
  function tronquer(nom, max) {
    var s = nom || '(sans nom)';
    return s.length <= max ? s : s.slice(0, max - 1).replace(/\s+$/, '') + '…';
  }

  // ---- Répartition déterministe : la spirale de Fibonacci sur la sphère.
  //      Ni paquet ni trou, et le même jeu de données donne toujours le même
  //      ciel — c'est la règle de layout d'A3, transposée en volume. ----
  function pointSphere(n, i) {
    var y = n <= 1 ? 0 : 1 - (i / (n - 1)) * 2;
    var rayon = Math.sqrt(Math.max(0, 1 - y * y));
    var theta = ANGLE_OR * i;
    return { x: Math.cos(theta) * rayon, y: y, z: Math.sin(theta) * rayon };
  }

  // ---- Regroupement par métier principal : mêmes règles que l'arbre (la
  //      première graphie fait l'étiquette, les sans-secteur vont ensemble). ----
  // `regrouper` (option, RIVEN lot 2 du 2026-09-30) : une fonction noeud →
  // { cle, label } qui remplace le regroupement par secteur — RIVEN y range ses
  // fiches par NÉBULEUSE (js/nebuleuses-riven.js). ABSENTE, le chemin est celui
  // d'hier à l'octet près : les autres pages qui chargent ce moteur ne la
  // passent pas.
  function grouper(noeuds, regrouper) {
    var index = Object.create(null);
    var ordre = [];
    (noeuds || []).forEach(function (n) {
      var cle, label;
      var choix = regrouper ? regrouper(n) : null;
      if (choix && choix.cle) {
        cle = choix.cle;
        label = choix.label || LABEL_A_CLASSER;
      } else {
        var brut = (n.secteur_activite || '').trim();
        cle = brut ? normaliser(brut) : CLE_A_CLASSER;
        label = brut || LABEL_A_CLASSER;
      }
      if (!index[cle]) {
        index[cle] = { cle: cle, label: label, noeuds: [], parNebuleuse: !!(choix && choix.cle) };
        ordre.push(cle);
      }
      index[cle].noeuds.push(n);
    });
    var groupes = ordre.map(function (c) { return index[c]; });
    groupes.sort(function (a, b) {
      if (a.cle === CLE_A_CLASSER) { return 1; }
      if (b.cle === CLE_A_CLASSER) { return -1; }
      if (b.noeuds.length !== a.noeuds.length) { return b.noeuds.length - a.noeuds.length; }
      return a.label.localeCompare(b.label, 'fr');
    });
    groupes.forEach(function (g) {
      g.noeuds.sort(function (x, y) {
        var parNom = (x.nom || '').localeCompare(y.nom || '', 'fr');
        if (parNom !== 0) { return parNom; }
        return (x.id || '') < (y.id || '') ? -1 : ((x.id || '') > (y.id || '') ? 1 : 0);
      });
    });
    return groupes;
  }

  // ---- Construction du monde : PURE (aucun DOM), donc testable seule.
  //      Deux appels sur les mêmes données produisent les mêmes coordonnées. ----
  function construireMonde(noeuds, regrouper) {
    var groupes = grouper(noeuds, regrouper);
    var etoiles = [];
    groupes.forEach(function (g, ig) {
      var dir = pointSphere(groupes.length, ig);
      // Les métiers les plus fournis siègent plus près du centre : le réseau a
      // un cœur, et il se voit sans qu'on ait à le dire.
      var eloignement = RAYON_MONDE * (0.52 + 0.48 * (1 - Math.min(1, g.noeuds.length / 6)));
      var centre = {
        x: dir.x * eloignement,
        y: dir.y * eloignement * 0.72,
        z: dir.z * eloignement
      };
      g.centre = centre;
      var n = g.noeuds.length;
      var rayonAmas = 26 + Math.sqrt(n) * (ESPACE_MIN * 0.59);
      g.noeuds.forEach(function (noeud, k) {
        var p = pointSphere(Math.max(n, 2), k);
        // Rayon modulé : un amas est un VOLUME, pas une coquille creuse.
        var rr = rayonAmas * (0.55 + 0.45 * ((k * 7 % 11) / 10));
        etoiles.push({
          noeud: noeud, groupe: g,
          x: centre.x + p.x * rr,
          y: centre.y + p.y * rr,
          z: centre.z + p.z * rr
        });
      });
    });
    // Le rayon RÉELLEMENT occupé, mesuré sur les étoiles construites — et non
    // la constante RAYON_MONDE, qui ne décrit que la sphère où l'on POSE les
    // centres de constellation. Mesuré, il vaut 255 à 278 selon le réseau :
    // la constante (300) le SUR-comptait, et cadrer sur elle reculait la
    // caméra pour rien. Cadrer sur la donnée réelle grossit les étoiles.
    // Calculé UNE fois ici (fonction pure, appelée au montage), jamais dans la
    // boucle d'animation.
    var rayon = 0;
    etoiles.forEach(function (e) {
      var d = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
      if (d > rayon) { rayon = d; }
    });
    return { groupes: groupes, etoiles: etoiles, rayon: Math.max(80, rayon) };
  }

  // ---- Recentrage sur les étoiles — option `cadrerSurLesEtoiles` (LV4) ----
  //
  // LE DÉFAUT QU'ELLE CORRIGE, mesuré le 2026-08-13 sur la maquette du
  // dépliage : les trois galaxies occupaient 7,9 % du cadre, et pousser l'API
  // publique à son plafond d'approche n'allait pas au-delà de 37,6 %.
  //
  // LA CAUSE : la caméra tourne autour de l'ORIGINE, et `distanceIdeale()`
  // cadre une sphère centrée sur elle. Or un étage LV4 n'a qu'UN groupe (tous
  // les caps d'un écran partagent le même « secteur ») : `construireMonde` pose
  // son centre à `eloignement` de l'origine — 228 pour trois objets — et serre
  // les étoiles dans un amas de 55 de rayon autour de ce centre. La caméra
  // cadrait donc une sphère de 250 pour montrer un nuage de 55, centré ailleurs
  // qu'où elle regardait. Elle cadrait du vide, très correctement.
  //
  // LE REMÈDE : translater les étoiles pour que leur barycentre TOMBE sur
  // l'origine, et retenir leur étendue RÉELLE. Rien d'autre ne bouge — la
  // projection, la visée, le glissé travaillent tous sur ces coordonnées-là.
  // C'est le même geste que la correction du 2026-08-12 (cadrer sur le rayon
  // mesuré plutôt que sur la constante), poussé jusqu'au centre.
  //
  // Le plancher `Math.max(80, …)` de `construireMonde` n'est PAS repris ici :
  // majorer le rayon recule la caméra pour rien, et c'est précisément le défaut
  // qu'on corrige. Fonction pure au sens utile : elle ne touche ni au DOM ni au
  // réseau, et deux appels sur le même monde donnent le même résultat.
  // LA COURONNE — LA DISPOSITION DES ÉCRANS DE NAVIGATION (LV5).
  // ---------------------------------------------------------------------------
  // Dicté par Paul le 2026-08-17 : « la rotation sur ULTIMA n'est pas folle, ça ne
  // me paraît pas à la page par rapport à ce qui existe ailleurs dans l'outil :
  // IL FAUT LES MÊMES STANDARDS PARTOUT. »
  //
  // Ce qui a mené ici, et il faut le dire : la veille, j'avais posé les Gémeaux
  // comme un cas SPÉCIAL, réservé à deux caps JUMEAUX, en argumentant qu'opposer
  // deux caps sans lien « affirmerait une symétrie que le registre ne déclare
  // pas ». Paul a tranché l'inverse, et il a raison sur le fond : un outil qui
  // range ses écrans de trois façons différentes n'a pas de forme, il a des
  // exceptions. **Les Gémeaux ne sont pas un cas spécial : c'est le cas n = 2 de
  // la couronne.** Un seul mécanisme, tous les écrans.
  //
  // Le défaut qu'elle corrige : `construireMonde` range les étoiles comme un amas
  // de RÉSEAU — ce qui convient à RIVEN (des centaines de fiches sans ordre) et
  // pas du tout à un MENU de deux à quatre caps, qu'il empile en colonne en
  // laissant la largeur vide (mesuré : 0 unité d'écart horizontal sur ULTIMA).
  //
  // POURQUOI CES COORDONNÉES. La caméra s'ouvre tournée (yaw) et plongeante
  // (pitch). Poser la couronne dans le plan XY du MONDE la montrerait de biais,
  // écrasée — la forme serait dans les données et pas à l'écran, ce qui ne sert à
  // rien. On part donc de la position VOULUE À L'ÉCRAN (u, v) et on remonte aux
  // coordonnées du monde en annulant la rotation :
  //     x1 = x·cos(yaw) + z·sin(yaw)   et   z1 = −x·sin(yaw) + z·cos(yaw)
  //   → x = u·cos(yaw), z = u·sin(yaw) donne x1 = u ET z1 = 0 ;
  //     y2 = y·cos(pitch) − z1·sin(pitch) = y·cos(pitch)
  //   → y = v / cos(pitch) donne y2 = v.
  // Toutes les étoiles tombent ainsi sur le cercle voulu, À LA MÊME PROFONDEUR.
  //
  // L'INCLINAISON ET L'IRRÉGULARITÉ SONT VOULUES. Une couronne parfaitement
  // alignée et parfaitement régulière est un CADRAN — c'est précisément la
  // boussole qu'on vient de quitter. Le léger basculement et la variation de
  // rayon font lire une constellation. Elles sont déterministes : même écran,
  // même ciel (règle du repo depuis le layout d'arbre).
  var INCLINAISON = 0.17;      // ~10° : assez pour n'être pas un axe, trop peu pour bancaler
  // LA COURONNE EST UNE ELLIPSE, ET ELLE ÉPOUSE LA ZONE UTILE.
  // Un CERCLE ne peut pas remplir un cadre qui n'est pas carré : sur un
  // téléphone (390 × 608 utiles), le cadrage recule la caméra jusqu'à ce que le
  // cercle tienne en LARGEUR, et toute la hauteur reste vide. Mesuré avant
  // correction : 0,557 d'occupation sur ULTIMA à 390 px, et **0,20 sur NICOL
  // BOLAS** (quatre caps, quatre noms larges) — très loin des 60 % exigés, alors
  // que le même écran remplit 75 % sur un ordinateur.
  // En donnant au nuage le rapport d'aspect du cadre, le cadrage serré remplit
  // les DEUX axes en même temps au lieu de buter sur le plus étroit.
  // ---- L'ASTÉRISME (lot 2 de la carte céleste, arbitrage A2 de Paul, 26/09) --
  // La FIGURE d'une constellation : l'arbre couvrant minimal de ses étoiles, sur
  // leurs coordonnées PLANES. n − 1 traits, tout relié, aucune boucle — et, parce
  // qu'un arbre de longueur minimale dans le plan ne se croise jamais lui-même,
  // aucun trait qui en coupe un autre. C'est ce qui le rend lisible comme une
  // figure plutôt que comme un graphe.
  // PURE et DÉTERMINISTE : les points sont triés par id avant tout, et les
  // égalités de distance se départagent par id — la même constellation dessine
  // donc la même figure, dans quelque ordre que ses étoiles arrivent.
  // Prim en O(n²) : n ne dépasse pas deux douzaines sur un écran de navigation.
  // Testée sans navigateur : `tests/unit-asterisme.mjs`.
  function asterisme(points) {
    var pts = (points || []).slice().sort(function (a, b) {
      return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
    });
    var n = pts.length;
    if (n < 2) { return []; }
    function d(i, j) { return Math.hypot(pts[i].u - pts[j].u, pts[i].v - pts[j].v); }
    // On part de la première étoile (le plus petit id) : `meilleure[k]` est la
    // plus courte distance de k à l'arbre déjà tracé, `depuis[k]` l'étoile qui
    // la réalise.
    var dans = [], meilleure = [], depuis = [];
    for (var k = 0; k < n; k++) {
      dans.push(k === 0);
      meilleure.push(k === 0 ? 0 : d(0, k));
      depuis.push(0);
    }
    var aretes = [];
    for (var pas = 1; pas < n; pas++) {
      var choix = -1;
      for (var j = 0; j < n; j++) {
        if (dans[j]) { continue; }
        // À distance égale, le plus petit id gagne : j croît, donc « strictement
        // plus petit » suffit à garder le premier rencontré.
        if (choix === -1 || meilleure[j] < meilleure[choix]) { choix = j; }
      }
      dans[choix] = true;
      aretes.push([pts[depuis[choix]].id, pts[choix].id]);
      for (var m = 0; m < n; m++) {
        if (dans[m]) { continue; }
        var dm = d(choix, m);
        if (dm < meilleure[m]) { meilleure[m] = dm; depuis[m] = choix; }
      }
    }
    return aretes;
  }

  // `aspect` vaut 1 par défaut : sans zone utile connue, la couronne reste un
  // cercle et se comporte comme avant.
  function disposerEnCouronne(monde, yaw, pitch, aspect) {
    var n = monde.etoiles.length;
    if (n < 2) { return monde; }
    var R = monde.rayon * 0.62;
    // Racine carrée : on répartit l'écart de forme entre les deux axes au lieu
    // de tout mettre sur un seul, ce qui garde une ellipse et non un segment.
    // La plage est large exprès : l'aspect utile réel va de ~0,35 (téléphone à
    // quatre caps) à ~2,3 (écran large à deux caps). La borner trop serré
    // reviendrait à refuser au nuage la forme du cadre — le défaut qu'on corrige.
    var etirement = Math.sqrt(Math.max(0.2, Math.min(5, aspect || 1)));
    var Rx = R * etirement;
    var Ry = R / etirement;
    // Exposés pour la variante « figure », qui se décale DANS cette ellipse.
    monde.ellipse = { Rx: Rx, Ry: Ry };
    // LE DÉPART DÉPEND DE n, et les deux cas se justifient :
    //   — à DEUX, l'horizontale est la seule qui remplisse la largeur ; partir du
    //     haut les empilerait, c'est-à-dire exactement le défaut qu'on corrige ;
    //   — à TROIS et plus, on part du haut, ce qui reprend l'idiome de la boussole
    //     (« premier cap plein Nord, puis sens horaire ») et garde au produit son
    //     vocabulaire.
    // L'AXE DE L'OPPOSITION SUIT LA DIMENSION LA PLUS LONGUE DE LA PLACE UTILE.
    // À deux caps, opposer HORIZONTALEMENT est juste sur un écran large — c'est
    // ce que Paul a validé sur TAO — et faux sur un téléphone, où la largeur est
    // la dimension courte : mesuré 0,548 d'occupation contre 0,72 avant la
    // couronne. **« En opposé » ne dit pas « à l'horizontale »** : haut/bas est
    // une opposition tout autant, et c'est la seule qui remplisse un cadre
    // étroit. Le standard ne change pas, il s'applique à la forme du cadre.
    var horizontal = (aspect || 1) >= 1;
    // À QUATRE, ON ÉVITE LES POSITIONS LATÉRALES EXTRÊMES. Un point pile sur
    // l'axe horizontal pousse son nom au plus loin, et c'est le nom qui borne le
    // cadrage. En partant à 45°, les quatre points se placent « en coins » :
    // aucun n'atteint le maximum latéral, et le nuage respire.
    var depart = (n === 2
      ? (horizontal ? 0 : -Math.PI / 2)
      : (n === 4 ? -Math.PI / 4 : -Math.PI / 2)) + INCLINAISON;
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var cp = Math.max(0.2, Math.cos(pitch));
    // LES NOMS LONGS VONT AUX POSITIONS VERTICALES, et ce n'est pas un détail de
    // rangement : c'est ce qui décide du cadrage.
    // Un nom en position latérale extrême déborde de toute sa demi-largeur — et
    // c'est cette demi-largeur qui borne la distance de la caméra, donc la taille
    // de tout le ciel. Le MÊME nom placé en haut ou en bas ne coûte que la
    // hauteur d'une ligne de texte.
    // Mesuré sur ADRAMELECH à 390 px, dont un cap s'appelle « RAPPROCHEMENTS » :
    // 0,337 d'occupation, contre 0,696 sur NAGA qui a trois caps aussi mais des
    // noms courts. **La longueur d'un libellé décidait de la taille du ciel.**
    // On apparie donc les noms les plus longs aux positions les moins latérales.
    // La longueur en CARACTÈRES suffit ici : les demi-largeurs réelles ne sont
    // mesurées qu'après la première image peinte, et attendre pour disposer
    // ferait sauter le ciel sous les yeux.
    var positions = [];
    for (var k = 0; k < n; k++) {
      var ak = depart + (k * 2 * Math.PI) / n;
      positions.push({ a: ak, lateralite: Math.abs(Math.cos(ak)) });
    }
    positions.sort(function (p1, p2) { return p1.lateralite - p2.lateralite; });
    var parLongueur = monde.etoiles.slice().sort(function (e1, e2) {
      return (e2.noeud.nom || '').length - (e1.noeud.nom || '').length;
    });
    var placement = Object.create(null);
    parLongueur.forEach(function (e, rang) { placement[e.noeud.id] = positions[rang].a; });

    monde.etoiles.forEach(function (e, i) {
      var a = placement[e.noeud.id];
      if (a === undefined) { a = depart + (i * 2 * Math.PI) / n; }
      // Rayon modulé, déterministe : une couronne au compas ferait un cadran.
      var irregulier = 1 + 0.07 * Math.cos(i * 2.399);
      var u = Math.cos(a) * Rx * irregulier;
      var v = Math.sin(a) * Ry * irregulier;
      // Le PLAN de la disposition : c'est sur lui que l'astérisme se calcule. Le
      // monde 3D en est une rotation, et un arbre calculé en 3D puis projeté
      // pourrait se croiser à l'écran.
      e.plan = { u: u, v: v };
      e.x = u * cy;
      e.z = u * sy;
      e.y = v / cp;
    });
    return monde;
  }

  // ---- LA FIGURE IRRÉGULIÈRE A ÉTÉ RETIRÉE (A8, 26/09) ------------------------
  // Une variante `disposition: 'figure'` a existé le temps que Paul tranche A8
  // sur capture. Il a retenu la couronne (V1) : la figure n'égalait pas la
  // couronne sur les critères mesurés (occupation plus basse, un chevauchement
  // de noms ajouté — CADRAGE-2026-09-25-carte-celeste.md §17). Code qu'aucune
  // page n'active = code qu'on croira un jour disponible ; il est parti.

  function recentrerSurLesEtoiles(monde) {
    var n = monde.etoiles.length;
    if (!n) { monde.rayonReel = monde.rayon; return monde; }
    var cx = 0, cy = 0, cz = 0;
    monde.etoiles.forEach(function (e) { cx += e.x; cy += e.y; cz += e.z; });
    cx /= n; cy /= n; cz /= n;
    var rayon = 0;
    monde.etoiles.forEach(function (e) {
      e.x -= cx; e.y -= cy; e.z -= cz;
      var d = Math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
      if (d > rayon) { rayon = d; }
    });
    monde.groupes.forEach(function (g) {
      if (g.centre) { g.centre.x -= cx; g.centre.y -= cy; g.centre.z -= cz; }
    });
    // Un objet unique a une étendue nulle : sans plancher, la caméra viendrait
    // se poser dessus. 12 — le rayon d'une étoile au repos, soit « on la voit,
    // on ne la traverse pas ».
    monde.rayonReel = Math.max(12, rayon);
    return monde;
  }

  // ---- Magnitude : le poids de la fiche dans le réseau (relations reçues et
  //      données + personnes rattachées). C'est une information que ni l'arbre
  //      ni la carte ne montraient : qui est central, qui est isolé. ----
  function magnitudes(noeuds, relations, rattachements) {
    var m = Object.create(null);
    (noeuds || []).forEach(function (n) { m[n.id] = 0; });
    (relations || []).forEach(function (r) {
      if (m[r.source_id] !== undefined) { m[r.source_id] += 1; }
      if (m[r.target_id] !== undefined) { m[r.target_id] += 1; }
    });
    (rattachements || []).forEach(function (r) {
      if (m[r.node_id] !== undefined) { m[r.node_id] += 1; }
    });
    return m;
  }

  // ==================================================================
  // Instance courante : une seule à la fois (un seul ciel à l'écran).
  // ==================================================================
  var courant = null;

  function arreter() {
    if (courant && courant.image) {
      window.cancelAnimationFrame(courant.image);
      courant.image = null;
    }
    if (courant && courant.surRedimension) {
      window.removeEventListener('resize', courant.surRedimension);
      courant.surRedimension = null;
    }
    courant = null;
  }

  function rendre(conteneur, donnees, options) {
    if (!conteneur) { return null; }
    arreter(); // jamais deux boucles d'animation en vol
    options = options || {};

    var noeuds = (donnees && donnees.noeuds) || [];
    var personnes = (donnees && donnees.personnes) || [];
    var rattachements = (donnees && donnees.rattachements) || [];
    var relations = (donnees && donnees.relations) || [];
    var libelles = options.libellesType || {};
    var statuts = options.libellesStatut || {};
    var correspond = options.correspond;

    // LV4 — les trois options, toutes fausses par défaut : RIVEN passe ici sans
    // rien changer à ce qu'il faisait hier.
    var cadrageSerre = !!options.cadrerSurLesEtoiles;
    // LOT 2 DE LA CARTE CÉLESTE (26/09) — deux options, INACTIVES PAR DÉFAUT :
    // RIVEN n'en active aucune, et son harnais le vérifie (71 verdicts).
    //   · `asterisme`     : la figure, n − 1 traits par constellation ;
    //   · `eclatParPoids` : la taille d'une étoile dit son RANG (`noeud.poids`,
    //                       posé par l'adaptateur), plus son nombre de liens.
    // (Une troisième, `disposition: 'figure'`, a été retirée après A8.)
    var avecAsterisme = !!options.asterisme;
    // LES NÉBULEUSES (boucle B d'IFULVIN, 30/09) — OPT-IN : `[{ ids, teinte }]`.
    // Le moteur ne fait que traduire des identifiants d'étoiles en points du
    // monde ; la peinture est celle de la couche de fond. Sans l'option (ou
    // sans fond), le rendu est strictement celui d'hier.
    var nebuleusesDemandees = Array.isArray(options.nebuleuses) ? options.nebuleuses : [];
    var eclatParPoids = !!options.eclatParPoids;
    // ⛔ CES CONTRÔLES ATMOSPHÉRIQUES NE SONT PAS « PREVIEW ONLY », malgré ce
    // que disait ce commentaire jusqu'au 19/09 : `js/app.js` pose `stellarV2: true`
    // sur RIVEN, en PRODUCTION. Un commentaire qui dément le code d'à côté est
    // pire qu'une absence de commentaire — il fait croire à une isolation qui
    // n'existe pas, et c'est précisément ce qu'on vérifie avant une bascule.
    // Ce qui reste vrai : l'option est OPT-IN. Tout appelant qui ne passe ni
    // `atmosphere` ni `stellarV2` garde exactement le rendu d'hier.
    var atmosphere = options.atmosphere || (options.stellarV2 ? {
      eclat: 0.94,
      eclatVoiles: 0.82,
      eclatFilaments: 0.72,
      contrasteProfondeur: 1
    } : null);

    var monde = construireMonde(noeuds, typeof options.regrouper === 'function' ? options.regrouper : null);
    // LES GÉMEAUX, avant le recentrage : deux caps jumeaux se posent en
    // OPPOSITION plutôt qu'empilés. L'orientation d'ouverture est passée en
    // argument parce que le placement en dépend (voir `disposerEnOpposition`) —
    // et `cam` n'existe pas encore ici, ce qui est justement pourquoi les deux
    // constantes sont déclarées avant elle.
    // (La couronne est posée dans `dimensionner()` : elle a besoin du viewBox et
    // des marges, qui ne sont pas encore connus ici. Premier jet : elle était
    // appelée à cet endroit, avec un viewBox encore à sa valeur par défaut de
    // 900 × 560 — donc un rapport d'aspect faux sur tous les écrans.)
    if (cadrageSerre) { recentrerSurLesEtoiles(monde); }
    // Rayon de RÉFÉRENCE des effets de profondeur (opacité, seuil « proche »).
    // Hors cadrage serré c'est la constante d'hier, à l'identique : ces deux
    // effets sont réglés pour un réseau de 300 de rayon, et les rebaser sur le
    // monde mesuré changerait le rendu de RIVEN — ce que l'étape ② s'interdit.
    // En cadrage serré la constante MENT : sur un nuage de 55, elle place le
    // seuil « proche » derrière tout le monde et éteint tous les noms.
    var rayonRef = cadrageSerre ? monde.rayonReel : RAYON_MONDE;

    var parId = Object.create(null);
    monde.etoiles.forEach(function (e) { parId[e.noeud.id] = e; });
    var mags = magnitudes(noeuds, relations, rattachements);
    var magMax = 1;
    Object.keys(mags).forEach(function (k) { if (mags[k] > magMax) { magMax = mags[k]; } });

    // Noms permanents : les six plus lourdes. Un seuil laisserait le nombre
    // dériver avec la taille du réseau et rendrait le ciel illisible ; six,
    // c'est six. Les autres noms existent quand même dans le document et se
    // révèlent au survol comme au focus clavier.
    // LV4 — « tous les noms » : sur un MENU, une entrée sans nom est une entrée
    // perdue ; six sur douze, c'est la moitié du menu muette. Le seuil dégrade
    // au lieu de casser : au-delà, on retombe sur les six plus lourdes.
    var tousLesNoms = !!options.tousLesNoms && noeuds.length <= SEUIL_TOUS_NOMS;
    var lourdes = Object.create(null);
    if (tousLesNoms || noeuds.length <= MAX_NOMS_PERMANENTS) {
      noeuds.forEach(function (n) { lourdes[n.id] = true; });
    } else {
      noeuds.slice().sort(function (a, b) {
        var d = (mags[b.id] || 0) - (mags[a.id] || 0);
        return d !== 0 ? d : (a.nom || '').localeCompare(b.nom || '', 'fr');
      }).slice(0, MAX_NOMS_PERMANENTS).forEach(function (n) { lourdes[n.id] = true; });
    }

    var vbW = 900, vbH = 560;
    // LE CADRE SUIT LA BOÎTE RÉELLE (correctif du 2026-08-12, mesuré).
    // Avant : vbH se déduisait de la LARGEUR seule (× 0,56 en large). Sur un
    // écran large et court — 1670 × 900, celui de Paul — le SVG réclamait
    // 934 px de haut dans une scène qui n'en offre que 689 : `overflow:hidden`
    // en coupait 245, soit UN QUART DU CIEL, et la page ne défilait pas. Le
    // bas du réseau n'était pas « hors champ », il était supprimé.
    // Une proportion choisie a priori ne peut pas connaître la hauteur
    // disponible : elle se MESURE.
    function dimensionner() {
      var largeurBoite = conteneur.clientWidth || 900;
      var hauteurBoite = conteneur.clientHeight || 0;
      vbW = Math.max(320, Math.min(1240, largeurBoite));
      // Repli sur l'ancienne proportion tant que la boîte n'a pas de hauteur
      // (montage avant mise en page) : mieux vaut un cadre approché qu'aucun.
      vbH = hauteurBoite > 120
        ? Math.max(200, Math.round(vbW * (hauteurBoite / largeurBoite)))
        : Math.round(vbW * (vbW < 600 ? 1.02 : 0.56));
      // LV5 / P2 — les marges utiles se recalculent ICI, avec le viewBox dont
      // elles dépendent : elles sont données en pixels CSS et le facteur de
      // conversion change à chaque redimensionnement.
      calculerMarges();
      // LV5 — le fond se pose sur la MÊME boîte et le MÊME viewBox, au même
      // instant. C'est le seul endroit du moteur qui connaît les deux, donc le
      // seul où la conversion peut être juste. (`fond` est hoistée : au premier
      // appel, au montage, elle vaut `undefined` et ce bloc ne fait rien — le
      // fond est posé par le second appel, juste après sa création.)
      if (fond) {
        // La boîte peut n'avoir aucune hauteur au montage ; on prend alors
        // celle que le viewBox implique, plutôt qu'un canvas de zéro pixel.
        var hCSS = hauteurBoite > 120 ? hauteurBoite : largeurBoite * (vbH / vbW);
        fond.poser(largeurBoite, hCSS, vbW, vbH);
      }
      // LA COURONNE SE RECALCULE ICI, et c'est le seul endroit possible : elle a
      // besoin du viewBox ET des marges, et `dimensionner` est la seule fonction
      // qui connaisse les deux au même instant. Bénéfice second, gratuit : la
      // disposition suit la rotation du téléphone au lieu de rester celle du
      // montage.
      // `monde` est défini ici — le premier appel de `dimensionner` a lieu après
      // sa construction. Le recentrage suit, sinon `rayonReel` décrirait le nuage
      // d'AVANT la couronne et le cadrage serré viserait à côté.
      if (options.couronne && monde && monde.etoiles) {
        // L'ASPECT SE CALCULE SUR LA PLACE LAISSÉE AUX ÉTOILES, PAS SUR LE CADRE.
        // Deuxième correction du même défaut, et la mesure a été formelle : avec
        // l'aspect du cadre brut, l'ellipse ne changeait RIEN (0,555 contre 0,557
        // sur ULTIMA à 390 px). La forme du nuage n'était pas la limite — les
        // NOMS le sont. Un nom occupe la même largeur quelle que soit la distance
        // de la caméra : reculer éloigne les étoiles sans jamais rétrécir leurs
        // libellés (leçon du 2026-08-13, payée une seconde fois ici).
        // Sur 390 px, `MARGE_HALO + DEMI_NOM` mange 112 unités de CHAQUE côté :
        // il ne reste que 166 unités utiles en largeur contre 480 en hauteur.
        // L'aspect réel est donc de 0,35 — la couronne doit y être franchement
        // VERTICALE. Sur un 1240, le même calcul donne 2,0 et elle s'étale.
        // C'est du responsive au sens propre : on empile sur un téléphone parce
        // que c'est la seule forme qui remplisse, on étale sur un écran large
        // parce qu'on peut.
        var lU = vbW - mUtile.gauche - mUtile.droite;
        var hU = vbH - mUtile.haut - mUtile.bas;
        var placeLargeur = Math.max(30, lU - 2 * (MARGE_HALO + DEMI_NOM_INCONNU));
        var placeHauteur = Math.max(30, hU - 2 * MARGE_CADRAGE);
        disposerEnCouronne(monde, YAW_OUVERTURE, PITCH_OUVERTURE, placeLargeur / placeHauteur);
        if (cadrageSerre) { recentrerSurLesEtoiles(monde); }
        // La disposition vient de changer : la figure se recalcule sur elle.
        if (gAsterisme) { calculerAsterisme(); }
      }
    }
    // La distance ne se choisit pas une fois pour toutes : elle se DÉDUIT du
    // cadre ET du monde. À la distance D, la demi-hauteur visible vaut
    // (cadre/2)·(D/FOCALE) ; pour que le monde tienne, il faut
    // D ≥ rayon·FOCALE·2/cadre.
    //
    // Correction du 2026-08-12 : le rayon est celui du monde CONSTRUIT
    // (mesuré : 255 à 278 selon le réseau), non la constante RAYON_MONDE (300)
    // qui le SUR-comptait. Cadrer sur la donnée réelle rapproche donc la
    // caméra — les étoiles gagnent en taille sans que rien ne sorte du cadre.
    // Le plancher `430` a disparu : c'était une constante de confort, et elle
    // contredisait le principe même de la fonction — le recul se déduit, il ne
    // se plafonne pas par le bas.
    // La provision de libellé (le nom d'une constellation est peint 38·échelle
    // + 12 au-dessus de son étoile) est réglée à 20 : valeur MESURÉE suffisante
    // sur les six configurations éprouvées, et pas davantage — majorer ici
    // éloignerait la caméra et rapetisserait le ciel sans rien protéger.
    // La demi-largeur du nom de chaque étoile, en unités de viewBox, MESURÉE
    // sur le texte peint (voir la mesure dans `dessiner`). DÉCLARÉE ICI, avant
    // `distanceIdeale`, parce que celle-ci s'exécute dès le montage : laissée
    // plus bas, la hoisting de `var` la rendait `undefined` au premier appel et
    // le cadrage plantait avant la première image.
    var demiNoms = Object.create(null);
    var nomsMesures = false;
    var DEBORD_LIBELLE = 20;

    // ---- LV5 / P2 — LA ZONE UTILE : le cadrage apprend que le cadre est
    //      PARTIELLEMENT OCCUPÉ. -------------------------------------------
    // Le défaut, mesuré sur la maquette plein écran à 390 px : le mobilier
    // (bandeau, parole, retour) RECOUVRAIT deux galaxies. Il ne volait aucun
    // clic — il les cachait, ce qui est un défaut distinct qu'aucune assertion
    // de captation ne voit.
    // La cause n'est pas la mise en page, c'est le cadrage : il remplit 60 à
    // 75 % de la plus petite dimension du CADRE ENTIER, donc il pousse les
    // objets jusqu'aux bords — précisément là où le mobilier est posé. Rétrécir
    // le ciel serait renoncer à ce que Paul a demandé ; il faut lui dire où il
    // a le droit de peindre.
    //
    // ET CELA DEMANDE DEUX CHOSES, PAS UNE — c'est le piège de cette étape :
    //   ① la caméra RECULE, puisque la place utile est plus petite ;
    //   ② le CENTRE OPTIQUE SE DÉCALE, puisque le milieu de la zone utile
    //      n'est plus le milieu du viewBox. Sans ②, on aurait reculé pour rien :
    //      les objets resteraient centrés dans le cadre entier et continueraient
    //      d'entrer sous le mobilier, simplement plus petits.
    //
    // Les marges sont données en PIXELS CSS par l'appelant — c'est ce qu'une
    // coque connaît de son mobilier — et converties ici en unités de viewBox.
    // Faire porter la conversion à l'appelant serait lui demander de connaître
    // le viewBox du moteur : la même erreur de repère que celle payée sur P1.
    // `margesUtiles` accepte un OBJET ou une FONCTION, et la fonction est la
    // forme juste — la seule qui reste vraie. Premier jet : un objet, mesuré une
    // fois par l'appelant au montage. Le harnais l'a pris en défaut en
    // grossissant le titre : la marge haute restait à 119 alors que le bandeau
    // avait doublé de hauteur. Une mesure prise une fois est une constante qui a
    // eu raison un jour.
    // Le moteur DEMANDE donc la place à chaque fois qu'il redimensionne — c'est
    // lui qui sait quand il en a besoin, et l'appelant n'a plus à s'abonner à
    // quoi que ce soit.
    var margesDemandees = options.margesUtiles || null;
    var mUtile = { haut: 0, bas: 0, gauche: 0, droite: 0 };
    function calculerMarges() {
      if (!margesDemandees) { mUtile = { haut: 0, bas: 0, gauche: 0, droite: 0 }; return; }
      var largeurCSS = conteneur.clientWidth || vbW;
      var k = largeurCSS > 0 ? vbW / largeurCSS : 1;
      var m = typeof margesDemandees === 'function' ? margesDemandees() : margesDemandees;
      if (!m) { mUtile = { haut: 0, bas: 0, gauche: 0, droite: 0 }; return; }
      // Plafond par axe (50 % en hauteur, 40 % en largeur) : au-delà, ce ne
      // serait plus un ciel avec du mobilier, ce serait du mobilier avec un peu
      // de ciel. Un garde-fou qui
      // dit non valait mieux qu'une scène qui s'effondre sans le dire.
      // ⚠️ RELEVÉ À 50 % LE 27/09, et mesuré. Au bureau, le socle complet
      // (parole + dock de Léo + bandeau Finubar, empilés depuis le 26/09) prend
      // 45 % des 800 px de haut. Plafonné à 40 %, le moteur rognait la marge et
      // laissait le ciel peindre 39 px SOUS la parole — sans le dire, ce qui est
      // exactement ce que ce garde-fou devait empêcher. Invisible à deux étoiles
      // sur ALPHA ; à quatre (DOKLĚS, SYMPHO), RENOBOOST IA y tombait
      // (`smoke-socle`). À 50 %, le ciel garde encore 233 unités de haut.
      var maxV = vbH * 0.5, maxH = vbW * 0.4;
      mUtile = {
        haut: Math.max(0, Math.min(maxV, (m.haut || 0) * k)),
        bas: Math.max(0, Math.min(maxV, (m.bas || 0) * k)),
        gauche: Math.max(0, Math.min(maxH, (m.gauche || 0) * k)),
        droite: Math.max(0, Math.min(maxH, (m.droite || 0) * k))
      };
    }
    // Le centre OPTIQUE : le milieu de la zone utile. Sans marges, c'est
    // exactement le milieu du viewBox — donc le comportement d'hier, au pixel.
    function centreX() { return (mUtile.gauche + (vbW - mUtile.droite)) / 2; }
    function centreY() { return (mUtile.haut + (vbH - mUtile.bas)) / 2; }

    function distanceIdeale() {
      // La plus petite dimension de la ZONE UTILE, et non du cadre : sans
      // marges, les deux sont identiques.
      var largeurUtile = vbW - mUtile.gauche - mUtile.droite;
      var hauteurUtile = vbH - mUtile.haut - mUtile.bas;
      var cadre = Math.max(160, Math.min(largeurUtile, hauteurUtile));
      if (!cadrageSerre) {
        return ((monde.rayon + DEBORD_LIBELLE) * FOCALE * 2) / cadre * 1.06;
      }
      // CADRAGE SERRÉ — la contrainte s'écrit sur CHAQUE étoile, à l'orientation
      // où la caméra se trouve, et sur CHAQUE axe séparément.
      //
      // Première version (mesurée, insuffisante) : borner par le rayon du nuage,
      // en supposant la pire étoile à la fois latérale de R et avancée de R.
      // C'est vrai pour une sphère quelconque, et c'est FAUX pour douze points :
      // aucune étoile n'est jamais aux deux extrêmes en même temps. Cette
      // majoration reculait la caméra pour un danger qui n'existait pas, et
      // l'occupation plafonnait à 45,8 % au lieu des 60 % exigés.
      //
      // Écrite sur les étoiles réelles : à la distance D, l'étoile i tombe à
      // x1·FOCALE/(D + z2) du centre. Il faut donc, pour chacune et sur chaque
      // axe, D ≥ |x1|·FOCALE/utileX − z2. Le maximum de ces bornes EST la
      // distance la plus serrée qui garde tout le monde dedans — la
      // contradiction relevée par la maquette n'en était pas une, c'était une
      // formule trop prudente d'un côté et trop naïve de l'autre.
      //
      // Le coût est O(n) sur un MENU (n ≤ 14 par le seuil), et cette fonction
      // n'est pas appelée par image en mode ordinaire. En cadrage serré elle
      // l'est — c'est le prix de la justesse quand on tourne le monde, et il se
      // compte en quelques dizaines d'opérations.
      var utileY = Math.max(40, hauteurUtile / 2 - MARGE_CADRAGE);
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var d = 0;
      monde.etoiles.forEach(function (e) {
        var x1 = e.x * cy + e.z * sy;
        var z1 = -e.x * sy + e.z * cy;
        var y2 = e.y * cp - z1 * sp;
        var z2 = e.y * sp + z1 * cp;
        // La place utile LATÉRALE est propre à CHAQUE étoile : elle dépend de
        // la largeur de son propre nom, mesurée sur le texte peint.
        var demiNom = demiNoms[e.noeud.id];
        if (demiNom === undefined) { demiNom = DEMI_NOM_INCONNU; }
        var utileX = Math.max(40, largeurUtile / 2 - MARGE_HALO - demiNom);
        var parX = (Math.abs(x1) * FOCALE) / utileX - z2;
        var parY = (Math.abs(y2) * FOCALE) / utileY - z2;
        if (parX > d) { d = parX; }
        if (parY > d) { d = parY; }
      });
      // Plancher : la caméra ne traverse pas le nuage, quoi qu'il arrive.
      // (J'ai cru un moment que ce plancher bridait la couronne — elle est plate,
      // donc il n'y aurait rien à protéger. MESURÉ : le lever ne change RIEN
      // (0,588 et 0,500 avant comme après). Le diagnostic était faux et la
      // modification a été retirée : une correction qui ne prouve rien ne reste
      // pas dans le code. La contrainte vient bien de la largeur des libellés.)
      return Math.max(d, monde.rayonReel * 1.35, 90);
    }

    dimensionner();
    // (L'orientation d'ouverture est déclarée au niveau du module : le placement
    // des Gémeaux en a besoin AVANT que `cam` existe.)
    var cam = {
      yaw: YAW_OUVERTURE, pitch: PITCH_OUVERTURE, distance: 0,
      cibleYaw: YAW_OUVERTURE, ciblePitch: PITCH_OUVERTURE, cibleDistance: 0
    };
    // Le zoom est gardé en FACTEUR, pas en distance absolue : il survit ainsi
    // à un changement de cadre (rotation du téléphone, ouverture du panneau).
    var zoom = 1;
    cam.distance = cam.cibleDistance = distanceIdeale();

    var moinsDAnimation = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // VUE À PLAT (2026-08-13, demande de Paul : « si jamais je n'ai pas assez de
    // réseau ou quoi, je peux switcher au mode 2D »). Le volume reste le défaut.
    // Ce mode ne double AUCUN calcul : c'est le même monde, la même projection,
    // la même géométrie — la profondeur est simplement neutralisée et la boucle
    // d'animation ne repart pas. Ce qu'il économise n'est pas du réseau (le ciel
    // n'en consomme aucun, tout est calculé ici) mais du CALCUL et de la
    // BATTERIE : une boucle qui tourne en continu.
    // `prefers-reduced-motion` l'impose d'office — la préférence système
    // d'abord, le réglage de Paul ensuite.
    var plat = !!options.plat || moinsDAnimation;
    // Sans cadrage serré : aucun plafond, donc la ligne du nom se calcule
    // exactement comme hier (`Math.min(Infinity, …)` ne retire rien).
    var plafondNom = cadrageSerre ? PLAFOND_NOM : Infinity;
    // LE PLANCHER DE LISIBILITÉ EST UNE TAILLE D'ÉCRAN — lot 2a (26/09).
    // `7.5` est en unités du viewBox : il ne vaut 7,5 px que tant que le
    // viewBox vaut l'écran. Mesuré en production : 7,5 px à 360 et 390 px de
    // large, quand la revue demandait des noms qu'on lise le soir. L'option
    // `plancherNomPx` exprime le plancher en pixels CSS et le convertit par
    // l'échelle RÉELLE du SVG (`getScreenCTM`), relue à chaque redimensionnement.
    // Inactive par défaut : RIVEN et tout autre appelant gardent 7,5 au pixel.
    // ⛔ UNE seule fonction pour les trois endroits qui lisent le plancher (la
    // pose du nom, le repli de largeur, le retrait des traits) : trois copies
    // d'un seuil finissent par diverger.
    var plancherNomPx = +options.plancherNomPx > 0 ? +options.plancherNomPx : 0;
    var plancherCourant = null;
    function plancherNom() {
      if (!plancherNomPx) { return 7.5; }
      if (plancherCourant !== null) { return plancherCourant; }
      var ctm = null;
      try { ctm = racine.getScreenCTM(); } catch (e) { ctm = null; }
      // Pas encore dans le document (première image avant la mise en page) :
      // on répond à l'échelle 1 SANS la retenir — figer 1 ici laisserait le
      // plancher faux jusqu'au prochain redimensionnement.
      if (!ctm || !isFinite(ctm.a) || ctm.a <= 0) { return Math.max(7.5, plancherNomPx); }
      // Borné par le PLAFOND : une scène presque effondrée (échelle ~0,01)
      // donnait un plancher de ~900 unités — mesuré (audit S3, 26/09). Un
      // plancher de lisibilité ne doit jamais faire grossir un nom au-delà de
      // ce que le cadrage le plus serré autorise.
      plancherCourant = Math.min(PLAFOND_NOM, Math.max(7.5, plancherNomPx / ctm.a));
      return plancherCourant;
    }

    // LA CIBLE DU DOIGT, EN PIXELS D'ÉCRAN (27/09). Même conversion que le
    // plancher des noms, même piège : `RAYON_CAPTATION_MIN` est en unités du
    // viewBox, et rendait 25 px au téléphone — sous les 44 px que tout le reste
    // de l'écran tient au doigt. `cibleDoigtPx` est le DIAMÈTRE visé ; le moteur
    // le borne par la moitié de la distance à l'étoile voisine (plus bas), si
    // bien qu'aucune zone n'en recouvre jamais une autre. Inactive par défaut :
    // RIVEN ne la demande pas.
    var cibleDoigtPx = +options.cibleDoigtPx > 0 ? +options.cibleDoigtPx : 0;
    var cibleCourante = null;
    function rayonCibleDoigt() {
      if (!cibleDoigtPx) { return 0; }
      if (cibleCourante !== null) { return cibleCourante; }
      var ctm = null;
      try { ctm = racine.getScreenCTM(); } catch (e) { ctm = null; }
      // Hors du document : pas d'agrandissement, et rien de retenu.
      if (!ctm || !isFinite(ctm.a) || ctm.a <= 0) { return 0; }
      // Borné comme le plancher des noms (audit S3) : une scène effondrée ne
      // doit pas donner des zones de plusieurs centaines d'unités.
      cibleCourante = Math.min(PLAFOND_CIBLE, (cibleDoigtPx / 2) / ctm.a);
      return cibleCourante;
    }

    // Les ancres des nébuleuses, recalculées À CHAQUE IMAGE depuis les étoiles
    // du monde (au plus cinq : coût nul). Calculées une fois, elles se
    // périmeraient à la première couronne recomposée par une rotation d'écran.
    var cacheEpsilon = null;
    function optionsDuFond() {
      var base = atmosphere || { eclat: 1 };
      if (!nebuleusesDemandees.length || !monde || !monde.etoiles) { return base; }
      var parId = Object.create(null);
      monde.etoiles.forEach(function (e) { parId[e.noeud.id] = e; });
      // ε : distance monde au plus proche voisin, parmi TOUTES les étoiles de
      // l'écran. Une étoile seule (IFULVIN) prend 36 — trois fois le plancher
      // du rayon réel recentré.
      // Le calcul est en n² : il ne se refait que si les étoiles ont BOUGÉ
      // (signature des positions, en n). Refait à chaque image, il coûtait
      // cher dès que RIVEN passe ses centaines de fiches (relecture du 30/09) ;
      // la valeur rendue est la même qu'avant, à l'identique.
      var signature = monde.etoiles.length;
      for (var s = 0; s < monde.etoiles.length; s++) {
        var q = monde.etoiles[s];
        signature += q.x * 1.31 + q.y * 1.73 + q.z * 2.17;
      }
      var epsilon;
      if (cacheEpsilon && cacheEpsilon.signature === signature) {
        epsilon = cacheEpsilon.valeur;
      } else {
        epsilon = Infinity;
        for (var i = 0; i < monde.etoiles.length; i++) {
          for (var j = i + 1; j < monde.etoiles.length; j++) {
            var a = monde.etoiles[i]; var b = monde.etoiles[j];
            var d = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) + (a.z - b.z) * (a.z - b.z));
            if (d > 0 && d < epsilon) { epsilon = d; }
          }
        }
        if (!isFinite(epsilon)) { epsilon = 36; }
        cacheEpsilon = { signature: signature, valeur: epsilon };
      }
      var liste = [];
      nebuleusesDemandees.forEach(function (neb) {
        var membres = (neb && neb.ids || []).map(function (id) { return parId[id]; })
          .filter(Boolean).map(function (e) { return { x: e.x, y: e.y, z: e.z }; });
        if (!membres.length) { return; }
        var bx = 0; var by = 0; var bz = 0;
        membres.forEach(function (m) { bx += m.x; by += m.y; bz += m.z; });
        liste.push({
          teinte: neb.teinte,
          membres: membres,
          barycentre: { x: bx / membres.length, y: by / membres.length, z: bz / membres.length },
          epsilon: epsilon
        });
      });
      return Object.assign({}, base, { nebuleuses: liste });
    }

    function projeter(p) {
      // À plat : ni rotation ni perspective. Une échelle unique, les
      // coordonnées du monde telles quelles — la carte du ciel, pas le ciel.
      if (plat) {
        var echellePlate = FOCALE / cam.distance;
        return {
          sx: centreX() + p.x * echellePlate,
          sy: centreY() + p.y * echellePlate,
          echelle: echellePlate,
          profondeur: cam.distance
        };
      }
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      var x1 = p.x * cy + p.z * sy;
      var z1 = -p.x * sy + p.z * cy;
      var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var y2 = p.y * cp - z1 * sp;
      var z2 = p.y * sp + z1 * cp;
      var profondeur = z2 + cam.distance;
      if (profondeur < 60) { return null; } // derrière la caméra : rien à dessiner
      var echelle = FOCALE / profondeur;
      return {
        // Le centre OPTIQUE, pas le centre du cadre : c'est ce qui empêche les
        // objets d'entrer sous le mobilier. Sans marges déclarées, les deux
        // valeurs sont égales et rien ne change.
        sx: centreX() + x1 * echelle, sy: centreY() + y2 * echelle,
        echelle: echelle, profondeur: profondeur
      };
    }

    // Amène un point face à la caméra. C'est la réponse au reproche fait à
    // toute interface en volume : sans cela, la tabulation enverrait le focus
    // sur une étoile située derrière le spectateur.
    function viser(p) {
      cam.cibleYaw = Math.atan2(-p.x, p.z);
      var cy = Math.cos(cam.cibleYaw), sy = Math.sin(cam.cibleYaw);
      var z1 = -p.x * sy + p.z * cy;
      cam.ciblePitch = Math.atan2(p.y, z1 + cam.distance);
    }
    // Écart d'angles ramené dans [-π, π] : sans quoi la caméra fait le tour du
    // monde par le mauvais côté au passage de ±π.
    function ecartAngle(a, b) {
      var d = (a - b) % (Math.PI * 2);
      if (d > Math.PI) { d -= Math.PI * 2; }
      if (d < -Math.PI) { d += Math.PI * 2; }
      return d;
    }

    // ---- Construction du SVG : une seule fois. Ensuite on ne fait que
    //      déplacer — recréer les étoiles à chaque image serait absurde. ----
    conteneur.textContent = '';

    // LV5 — LA COUCHE DE FOND, inactive par défaut. Même méthode que les trois
    // capacités de LV4 : sans l'option, pas une ligne de ce qui suit ne
    // s'exécute et le chemin de rendu reste celui d'hier. RIVEN ne l'active
    // pas ; ses assertions doivent passer sans une retouche.
    // Le fond est un DÉCOR : il se monte AVANT le SVG (donc dessous), il est
    // `aria-hidden`, et il ne reçoit aucun événement. Il n'a pas de caméra —
    // il reçoit `projeter` à chaque image, ce qui rend une dérive entre les
    // deux couches structurellement impossible (voir l'en-tête de
    // `js/ciel-fond.js`).
    var fond = null;
    if (options.fond && window.UltimaCielFond) {
      fond = window.UltimaCielFond.creer({ rayonMonde: RAYON_MONDE });
      conteneur.appendChild(fond.canvas);
      // Second appel, et il est nécessaire : le premier a eu lieu au montage,
      // avant que `fond` existe. Idempotent — il recalcule les mêmes vbW/vbH.
      dimensionner();
    }

    var racine = svg('svg', {
      'class': 'ciel-svg', viewBox: '0 0 ' + vbW + ' ' + vbH,
      preserveAspectRatio: 'xMidYMid meet', role: 'group',
      'aria-label': 'Le réseau en volume : ' + noeuds.length +
        (noeuds.length > 1 ? ' contacts répartis en ' : ' contact réparti en ') +
        monde.groupes.length + (monde.groupes.length > 1 ? ' constellations' : ' constellation')
    });

    // Poussière lointaine : muette, déterministe, jamais devant.
    // LV5 — quand la couche de fond est active, cette poussière-ci ne se crée
    // PAS : deux champs de grains superposés, c'est deux vérités sur le même
    // décor, et 130 éléments SVG animés pour rien. Le fond canvas en peint des
    // milliers, avec la parallaxe en plus.
    var gDecorFond = svg('g', { 'class': 'ciel-decor', 'aria-hidden': 'true' });
    var poussiere = [];
    var graine = 11;
    function alea() {
      graine = (graine * 1103515245 + 12345) % 2147483648;
      return graine / 2147483648;
    }
    for (var i = 0; !fond && i < 130; i++) {
      var grain = svg('circle', {
        cx: 0, cy: 0, r: (0.3 + alea() * 0.8).toFixed(2),
        fill: '#cfe0f5', opacity: (0.10 + alea() * 0.26).toFixed(2)
      });
      poussiere.push({ el: grain, a: alea() * Math.PI * 2, b: alea() * Math.PI, r: 0.6 + alea() * 0.45 });
      gDecorFond.appendChild(grain);
    }
    racine.appendChild(gDecorFond);

    // Les liens : BLANCS et fins (demande de Paul). Le MOTIF dit le type,
    // l'ÉCLAT dit l'avancement — le double codage de la carte est conservé,
    // sans quoi le blanc uniforme perdrait l'information du type.
    // LA FIGURE — HORS DE `relations`, et c'est tout l'enjeu : la taille d'une
    // étoile se calcule sur son nombre de liens (`magnitudes`). Un trait
    // d'astérisme compté comme un lien ferait grossir l'étoile au milieu d'une
    // chaîne — un éclat qui ne dirait rien que la forme de l'arbre. Il vit donc
    // dans son propre groupe, muet pour le lecteur d'écran (un trait n'a rien à
    // dire), et il ne s'allume pas au survol : ce n'est pas une relation.
    // Sa couleur est une encre du produit, jamais l'or de l'appel (voir plus bas).
    var gAsterisme = null, piecesAsterisme = [];
    function calculerAsterisme() {
      while (gAsterisme.firstChild) { gAsterisme.removeChild(gAsterisme.firstChild); }
      piecesAsterisme = [];
      monde.groupes.forEach(function (grp) {
        var points = grp.noeuds.map(function (n) {
          var e = parId[n.id];
          var p = e && e.plan ? e.plan : { u: e.x, v: e.y };
          return { id: n.id, u: p.u, v: p.v };
        });
        asterisme(points).forEach(function (paire) {
          var trait = svg('line', { 'class': 'ciel-trait-figure' });
          trait.setAttribute('data-a', paire[0]);
          trait.setAttribute('data-b', paire[1]);
          gAsterisme.appendChild(trait);
          piecesAsterisme.push({ a: paire[0], b: paire[1], el: trait });
        });
      });
    }
    if (avecAsterisme) {
      gAsterisme = svg('g', {
        // L'ENCRE PARCHEMIN `#cdc3ad` (`--encre-douce`, déjà au produit), PAS
        // L'OR : l'or `#e6c67d` dit « il y a quelque chose à faire ici »
        // (engagement 3 de PRODUCT.md). Des traits or convergeant vers une étoile
        // qui appelle se liraient comme un chemin vers elle — critique du lot 2.
        'class': 'ciel-asterisme', 'aria-hidden': 'true', stroke: '#cdc3ad',
        'stroke-linecap': 'round', fill: 'none',
        // ⛔ UN TRAIT NE PREND PAS LE DOIGT (dry run DR du 27/09). Sans cette
        // ligne, un toucher qui tombait sur un trait, à côté d'une étoile,
        // n'atteignait RIEN : le trait est au-dessus des zones de captation.
        // Mesuré sur RENOBOOST IA à 390 × 664 : 5 touchers sur 12 perdus. Posé
        // ICI, sur le groupe, et non dans une feuille de style : la figure ne
        // dépend d'aucune règle qu'une page pourrait oublier de charger.
        'pointer-events': 'none'
      });
      calculerAsterisme();
      racine.appendChild(gAsterisme);
    }

    var gLiens = svg('g', {
      'class': 'ciel-liens', 'aria-hidden': 'true', stroke: '#ffffff',
      'stroke-width': '0.9', 'stroke-linecap': 'round', fill: 'none'
    });
    var piecesLien = [];
    (relations || []).forEach(function (r) {
      if (!parId[r.source_id] || !parId[r.target_id]) { return; }
      var ligne = svg('line', {
        opacity: String(OPACITE_STATUT_RELATION[r.statut] || 0.5)
      });
      if (MOTIFS_RELATION[r.type]) { ligne.setAttribute('stroke-dasharray', MOTIFS_RELATION[r.type]); }
      ligne.setAttribute('data-a', r.source_id);
      ligne.setAttribute('data-b', r.target_id);
      gLiens.appendChild(ligne);
      piecesLien.push({ relation: r, el: ligne });
    });
    racine.appendChild(gLiens);

    // LE NOM GRAVÉ SUR LA PASSERELLE (LV5 / P3) — la moitié manquante de la
    // fonction ④ de l'inventaire LV4. Le trait existait, son nom avait disparu.
    //
    // DANS SON PROPRE GROUPE, ET CE N'EST PAS DE LA MISE EN PAGE : `gLiens` est
    // `aria-hidden="true"` — un trait n'a rien à dire à un lecteur d'écran. Mais
    // « ⇄ rétroplanning » est une INFORMATION sur la relation, et elle n'est
    // portée par l'étiquette d'aucune des deux étoiles. Posé dans `gLiens`, le
    // nom aurait été peint pour l'œil et muet pour tout le reste : une perte
    // d'accessibilité déguisée en gain visuel.
    // LA COULEUR ET LA POLICE SE POSENT SUR LE GROUPE, comme pour les noms de
    // constellation. Sans elles, un `<text>` SVG est peint en NOIR et en
    // sans-serif : invisible sur fond de nuit, et étranger au registre gravé.
    // Trouvé en relisant la création des autres libellés avant de lancer la
    // page — pas en la regardant, où l'on n'aurait rien vu du tout, ce qui est
    // exactement le problème.
    // `#d8bd82` est l'or clair DÉJÀ employé par le produit pour ce qui est
    // gravé ; on n'invente aucune couleur (règle du 2026-08-13).
    var gNomsLien = svg('g', {
      'class': 'ciel-liens-noms',
      'font-family': 'Georgia, "Times New Roman", serif',
      fill: '#d8bd82'
    });
    var piecesNomLien = [];
    piecesLien.forEach(function (pl) {
      if (!pl.relation.libelle) { return; }
      var t = texteSvg({
        'class': 'ciel-nom-lien', 'font-size': '9', 'letter-spacing': '1.4',
        'text-anchor': 'middle', opacity: '0'
      }, pl.relation.libelle);
      gNomsLien.appendChild(t);
      piecesNomLien.push({ lien: pl, el: t });
    });
    if (piecesNomLien.length) { racine.appendChild(gNomsLien); }

    // Les personnes en orbite : la notion séparée du nœud le 2026-08-10.
    // Une personne rattachée à deux fiches orbite les deux — c'est ce qui
    // rend le rattachement multiple visible d'un coup d'œil.
    var gOrbites = svg('g', {});
    var piecesOrbite = [];
    var parPersonne = Object.create(null);
    (personnes || []).forEach(function (p) { parPersonne[p.id] = p; });
    var comptePar = Object.create(null);
    (rattachements || []).forEach(function (r) {
      comptePar[r.personne_id] = (comptePar[r.personne_id] || 0) + 1;
    });
    (rattachements || []).forEach(function (r, ir) {
      if (!parId[r.node_id]) { return; }
      var personne = parPersonne[r.personne_id];
      var nomPersonne = (personne && personne.nom) || 'Personne';
      var role = (r.role || '').trim();
      var autres = (comptePar[r.personne_id] || 1) - 1;
      var trait = svg('line', { stroke: '#f2ead6', 'stroke-width': '0.5', opacity: '0.3' });
      var g = svg('g', {
        'class': 'ciel-etoile ciel-personne', tabindex: '0', role: 'button',
        'data-personne-id': r.personne_id,
        'aria-label': nomPersonne + (role ? ', ' + role : '') + ', chez ' +
          (parId[r.node_id].noeud.nom || '(sans nom)') +
          (autres > 0 ? ', rattachée à ' + (autres + 1) + ' fiches' : '')
      });
      var titre = svg('title');
      titre.textContent = nomPersonne + (role ? ' — ' + role : '');
      g.appendChild(titre);
      var halo = svg('circle', { 'class': 'ciel-halo-focus', fill: 'none', stroke: '#f2ead6', 'stroke-width': '1' });
      var pastille = svg('circle', { fill: '#f2ead6', opacity: '0.9' });
      var zone = svg('circle', { 'class': 'ciel-zone', fill: '#000000', 'fill-opacity': '0' });
      g.appendChild(halo); g.appendChild(pastille); g.appendChild(zone);
      gOrbites.appendChild(trait);
      gOrbites.appendChild(g);
      piecesOrbite.push({
        ancre: r.node_id, g: g, trait: trait, halo: halo, pastille: pastille, zone: zone,
        angle: ir * ANGLE_OR + 0.7, rayon: 15 + (ir % 3) * 4
      });
    });
    racine.appendChild(gOrbites);

    // Les étoiles : une fiche = une étoile.
    var gEtoiles = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif' });
    var pieces = [];
    monde.etoiles.forEach(function (e) {
      var noeud = e.noeud;
      var mag = mags[noeud.id] || 0;
      var couleur = COULEURS_NUIT[noeud.type] || COULEUR_DEFAUT;
      var nomComplet = noeud.nom || '(sans nom)';
      var libelleType = libelles[noeud.type] || noeud.type || '';
      var libelleStatut = statuts[noeud.statut] || noeud.statut || '';
      var g = svg('g', {
        'class': 'ciel-etoile', tabindex: '0', role: 'button',
        'data-noeud-id': noeud.id,
        'aria-label': nomComplet + ', ' + libelleType +
          (e.groupe.parNebuleuse ? ', nébuleuse ' + e.groupe.label
            : (e.groupe.cle === CLE_A_CLASSER ? ', sans secteur' : ', secteur ' + e.groupe.label)) +
          (libelleStatut ? ', ' + libelleStatut : '') +
          ', ' + mag + ' lien' + (mag > 1 ? 's' : '')
      });
      var titre = svg('title');
      titre.textContent = nomComplet;
      g.appendChild(titre);
      var haloChoix = svg('circle', { 'class': 'ciel-halo-choix', fill: 'none', stroke: '#d8bd82', 'stroke-width': '1.2' });
      var haloFocus = svg('circle', { 'class': 'ciel-halo-focus', fill: 'none', stroke: '#fffaf0', 'stroke-width': '1' });
      // L'ÉTOILE AFFINÉE (LV5, demande de Paul le 2026-08-17 : « pour les
      // symboles de mes projets, peut-on affiner ? une étoile plus brillante et
      // fine peut-être ? »).
      // Le diagnostic, fait sur le code et confirmé sur capture : la COROLLE
      // (un disque de 1,7 rayon à 75 % d'opacité) écrasait tout le reste — d'où
      // l'aspect « pastille grise » au lieu d'une étoile. Les branches, larges
      // d'un demi-rayon à leur base, étaient trapues.
      // Ce qui change : la lueur se resserre et gagne en intensité, les branches
      // s'allongent et s'affinent en RAIS, la corolle se réduit à un simple
      // liseré autour du cœur, et le cœur passe au blanc PUR. Un point vif et
      // quatre rais fins — c'est ce qui fait lire « étoile » plutôt que « point ».
      var lueur = svg('circle', { fill: couleur, opacity: '0.20' });
      var branches = svg('path', { fill: couleur, opacity: '0.62' });
      var corolle = svg('circle', { fill: couleur, opacity: '0.55' });
      var coeur = svg('circle', { fill: '#ffffff' });
      var permanent = !!lourdes[noeud.id];
      var nom = texteSvg({
        'class': 'ciel-nom' + (permanent ? '' : ' ciel-nom--demande'),
        'text-anchor': 'middle', fill: '#e8dfc8', 'font-size': '9.5',
        opacity: permanent ? '0.85' : '0'
      }, tronquer(nomComplet, 20));
      var zone = svg('circle', { 'class': 'ciel-zone', fill: '#000000', 'fill-opacity': '0' });
      [haloChoix, haloFocus, lueur, branches, corolle, coeur, nom, zone].forEach(function (el) {
        g.appendChild(el);
      });
      // ---- POURQUOI L'ÉTOILE N'EST PAS UNE ANCRE ----------------------------
      // La boussole faisait de chaque cap un `<a href>`. On a ESSAYÉ de porter
      // cela au ciel, le 2026-08-13, en enveloppant chaque étoile d'une ancre
      // SVG — pour ne pas troquer en silence le clic du milieu et l'ouverture
      // dans un nouvel onglet. MESURÉ : enveloppée, l'étoile PERD LE FOCUS
      // CLAVIER. Le focus tombait sur `body` dans l'instant, là où le ciel nu
      // le garde (comparaison faite sur RIVEN, même geste, focus stable).
      // Le clavier passe avant le clic du milieu : l'ancre a été retirée, et la
      // perte est DÉCLARÉE au lieu d'être payée en douce (voir §13 du cadrage).
      gEtoiles.appendChild(g);
      pieces.push({
        etoile: e, g: g, haloChoix: haloChoix, haloFocus: haloFocus, lueur: lueur,
        branches: branches, corolle: corolle, coeur: coeur, nom: nom, zone: zone, mag: mag
      });
    });
    racine.appendChild(gEtoiles);

    // Noms de constellation : capitales espacées, or pâle — le vocabulaire des
    // cartouches, transposé en perspective.
    var gNomsAmas = svg('g', {
      'class': 'ciel-decor', 'aria-hidden': 'true', 'text-anchor': 'middle',
      'font-family': 'Georgia, "Times New Roman", serif', fill: '#d8bd82'
    });
    var piecesAmas = monde.groupes.map(function (g) {
      var t = texteSvg({
        'class': 'ciel-nom-amas', 'font-size': '11', 'letter-spacing': '3'
      }, g.label.toUpperCase());
      gNomsAmas.appendChild(t);
      return { groupe: g, el: t };
    });
    racine.appendChild(gNomsAmas);

    conteneur.appendChild(racine);

    // ---- Concentration : au survol ou au focus, le ciel s'éteint et seuls
    //      les liens de l'étoile visée brillent. Un seul jeu d'écouteurs
    //      délégués — jamais un par étoile. ----
    var vifs = [];
    function eteindre() {
      vifs.forEach(function (t) { t.classList.remove('ciel-lien--vif'); });
      vifs = [];
      racine.classList.remove('ciel--concentre');
    }
    function allumer(cible) {
      var etoile = cible && cible.closest ? cible.closest('[data-noeud-id]') : null;
      if (!etoile) { eteindre(); return; }
      eteindre();
      var id = etoile.getAttribute('data-noeud-id');
      var liens = racine.querySelectorAll(
        '.ciel-liens line[data-a="' + id + '"], .ciel-liens line[data-b="' + id + '"]');
      Array.prototype.forEach.call(liens, function (t) {
        t.classList.add('ciel-lien--vif');
        vifs.push(t);
      });
      racine.classList.add('ciel--concentre');
    }
    racine.addEventListener('mouseover', function (e) { allumer(e.target); });
    racine.addEventListener('mouseleave', eteindre);
    racine.addEventListener('focusin', function (e) {
      allumer(e.target);
      var g = e.target.closest ? e.target.closest('[data-noeud-id]') : null;
      // ON NE VISE QUE LE FOCUS CLAVIER (2026-09-25, lot 1 de la carte céleste).
      // Un clic donne AUSSI le focus à l'étoile, dès l'appui : viser alors
      // recentrait la caméra sur elle, et elle partait de sous le doigt avant
      // le relâchement — mesuré : 176 → 630 px en 300 ms, et le `click`
      // n'atteignait plus aucune étoile. `:focus-visible` est faux sur un focus
      // donné par un pointeur, vrai sur un focus donné par Tab — c'est le
      // navigateur qui le dit, pas une minuterie.
      // ⛔ ET PAS SUR UNE COURONNE (critique impeccable du lot 2, 26/09). Viser
      // fait pivoter la caméra vers l'étoile : sur un réseau en volume (RIVEN),
      // c'est ce qui ramène une étoile de derrière. Sur une couronne, toutes les
      // étoiles font déjà face au spectateur — et pivoter les couchait de
      // profil : mesuré, 877 px d'étendue → 0 sur NAGA, toutes les étoiles sur
      // une même verticale. La figure n'existait que pour la souris.
      if (g && parId[g.getAttribute('data-noeud-id')] && !options.couronne
          && (!g.matches || g.matches(':focus-visible'))) {
        viser(parId[g.getAttribute('data-noeud-id')]);
      }
    });
    racine.addEventListener('focusout', eteindre);

    function declencher(cible) {
      if (aGlisse) { return; } // un glissement n'ouvre pas une fiche
      var g = cible && cible.closest ? cible.closest('[data-noeud-id]') : null;
      if (g && typeof options.surClicNoeud === 'function') {
        options.surClicNoeud(g.getAttribute('data-noeud-id'));
        return;
      }
      var p = cible && cible.closest ? cible.closest('[data-personne-id]') : null;
      if (p && typeof options.surClicPersonne === 'function') {
        options.surClicPersonne(p.getAttribute('data-personne-id'));
      }
    }
    racine.addEventListener('click', function (e) { declencher(e.target); });
    racine.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') { return; }
      var g = e.target.closest ? e.target.closest('[data-noeud-id], [data-personne-id]') : null;
      if (g) { e.preventDefault(); declencher(e.target); }
    });

    // ---- Navigation : glisser pour tourner. La capture du pointeur n'est
    //      prise QU'UNE FOIS le glissement engagé — la prendre dès l'appui
    //      redirige le `click` vers le conteneur et aucune fiche ne s'ouvre. ----
    var saisie = null, aGlisse = false, survol = false;
    conteneur.addEventListener('pointerenter', function () { survol = true; });
    conteneur.addEventListener('pointerleave', function () { if (!saisie) { survol = false; } });
    conteneur.addEventListener('pointerdown', function (e) {
      saisie = {
        x: e.clientX, y: e.clientY, yaw: cam.cibleYaw, pitch: cam.ciblePitch,
        pointeur: e.pointerId, capture: false
      };
      aGlisse = false;
      conteneur.classList.add('ciel-scene--saisie');
    });
    conteneur.addEventListener('pointermove', function (e) {
      if (!saisie) { return; }
      var dx = e.clientX - saisie.x, dy = e.clientY - saisie.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        aGlisse = true;
        if (!saisie.capture && conteneur.setPointerCapture) {
          try {
            conteneur.setPointerCapture(saisie.pointeur);
            saisie.capture = true;
          } catch (err) { /* sans capture, la rotation fonctionne quand même */ }
        }
      }
      // À plat, il n'y a rien à tourner : le glissement ne fait rien, et
      // surtout il ne réveille pas la boucle pour rien.
      if (plat) { return; }
      cam.cibleYaw = saisie.yaw + dx * 0.006;
      // Le pitch est BORNÉ : au-delà on passe par-dessus le pôle et le monde
      // se retourne — on ne perd jamais le haut et le bas.
      cam.ciblePitch = Math.max(-1.15, Math.min(1.15, saisie.pitch + dy * 0.005));
    });
    function relacher() {
      saisie = null;
      conteneur.classList.remove('ciel-scene--saisie');
      window.setTimeout(function () { aGlisse = false; }, 0);
    }
    conteneur.addEventListener('pointerup', relacher);
    conteneur.addEventListener('pointercancel', relacher);

    // LA MOLETTE FAIT DÉFILER LA PAGE (demande de Paul, 2026-08-11). Elle ne
    // zoome qu'avec Ctrl/⌘ — la convention des cartes embarquées. Sans cela la
    // scène confisque chaque cran et la page ne descend jamais.
    conteneur.addEventListener('wheel', function (e) {
      if (!e.ctrlKey && !e.metaKey) { return; } // pas de preventDefault : la page défile
      e.preventDefault();
      zoomer(e.deltaY * 0.0011);
    }, { passive: false });

    function zoomer(delta) {
      zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta));
      cam.cibleDistance = distanceIdeale() * zoom;
      relancer();
    }

    // Retour au cadrage mesuré : tout le réseau dans l'écran. On rétablit AUSSI
    // l'orientation d'ouverture — s'être approché d'une constellation s'accompagne
    // presque toujours d'avoir tourné le monde, et un recul seul laisserait Paul
    // devant un ciel cadré mais désorienté.
    function toutVoir() {
      zoom = 1;
      cam.cibleDistance = distanceIdeale();
      cam.cibleYaw = YAW_OUVERTURE;
      cam.ciblePitch = PITCH_OUVERTURE;
      relancer();
    }

    // SUR UN MENU, LA PROFONDEUR N'A PAS LE DROIT D'ÉTEINDRE UNE ENTRÉE.
    // Demande de Paul le 2026-08-17 : « une étoile plus brillante ». Mesuré sur
    // les coques : les caps sortaient à 0,49 / 0,66 / 0,69 d'opacité — la moitié
    // de l'éclat perdue par un effet de profondeur réglé pour RIVEN, où des
    // centaines de fiches se chevauchent et où l'estompage PORTE de
    // l'information. Sur un menu de deux à quatre caps, il n'informe de rien et
    // fait juste hésiter à cliquer.
    // Le plancher monte donc à 0,82 quand la couronne est active — la profondeur
    // reste lisible (la taille et la lueur la disent encore) mais ne mange plus
    // l'éclat. RIVEN garde son plancher d'origine, à la valeur près.
    var PLANCHER_OPACITE = options.couronne ? 0.82 : 0.18;
    function opaciteProfondeur(profondeur) {
      var t = (profondeur - (cam.distance - rayonRef)) / (2 * rayonRef);
      return Math.max(PLANCHER_OPACITE, Math.min(1, 1.06 - t * 0.9));
    }

    var derive = 0, imagesDepuisTri = 99;

    // LV5 — LE COÛT RÉEL D'UNE IMAGE, et il a fallu deux instruments pour
    // l'obtenir. Le premier mesurait l'intervalle entre deux images : il a
    // répondu 16,4 ms sur un téléphone comme sur un écran de bureau, à trois
    // objets comme à quarante — parce qu'il lisait la CADENCE DE L'ÉCRAN, pas
    // le travail. Un instrument qui rend la même valeur quoi qu'on lui montre
    // ne mesure rien ; il aurait déclaré « budget tenu » jusqu'au jour où le
    // ciel rame, et ce jour-là il aurait encore dit 16,4.
    // Celui-ci chronomètre l'intérieur de `dessiner` : le fond, la projection,
    // les étoiles. Moyenne glissante, parce qu'une image isolée ne dit rien
    // (le ramasse-miettes en gonfle une de temps en temps).
    var coutImage = 0;
    var imagesMesurees = 0;
    // La CADENCE, c'est-à-dire l'intervalle réellement observé entre deux
    // images. Elle mesure ce que le chronomètre ci-dessus ne voit pas : ce que
    // le navigateur paie à COMPOSER le canvas et les étoiles. Mesuré le
    // 2026-08-16 sur 1670 × 900 à quarante objets — travail 4,67 ms, cadence
    // 44,6 ms. Aucun des deux instruments ne suffit seul ; il fallait les deux
    // pour savoir que le coût n'était pas dans le JavaScript.
    var cadence = 0;
    var derniereImage = 0;

    function dessiner() {
      var chrono = performance.now();
      if (derniereImage) {
        var ecart = chrono - derniereImage;
        cadence = cadence ? cadence + (ecart - cadence) * 0.1 : ecart;
      }
      derniereImage = chrono;

      // LA DÉGRADATION AUTOMATIQUE. Après 45 images — le temps que la page se
      // pose, les premières étant toujours lentes —, si la cadence reste
      // au-dessus de 28 ms (moins de 36 images par seconde), le fond rend de la
      // place. Deux crans, puis on s'arrête : au-delà, ce ne serait plus un
      // ciel, et le vrai remède serait ailleurs.
      // Le compteur repart à zéro après chaque allègement, pour laisser à la
      // mesure le temps de dire si ça a suffi.
      if (fond && imagesMesurees > 45 && cadence > 28) {
        if (fond.alleger()) { imagesMesurees = 0; cadence = 0; }
      }
      // En cadrage serré, la bonne distance DÉPEND de l'orientation : tourner
      // le monde change quelle étoile est la plus excentrée. On la recalcule
      // donc à chaque image — sans quoi un simple glissé du doigt sortirait du
      // cadre ce que le cadrage promettait d'y garder. Le facteur de zoom de
      // Paul est conservé : c'est un multiplicateur, pas une distance.
      if (cadrageSerre) { cam.cibleDistance = distanceIdeale() * zoom; }
      // Approche douce vers la cible : la caméra glisse, elle ne saute pas.
      cam.yaw += ecartAngle(cam.cibleYaw, cam.yaw) * 0.11;
      cam.pitch += (cam.ciblePitch - cam.pitch) * 0.11;
      cam.distance += (cam.cibleDistance - cam.distance) * 0.11;

      // Dérive : seulement si Paul l'a demandée, jamais quand la main approche
      // (une cible qui bouge est une cible qu'on rate) ni sous prefers-reduced-motion.
      if (etatDerive && !saisie && !survol && !moinsDAnimation) {
        derive += 0.0009;
        cam.cibleYaw += 0.0009;
        cam.yaw += 0.0009;
      }

      var projetes = Object.create(null);

      // LV5 — le fond, d'abord : il est derrière tout. Il reçoit `projeter`,
      // la fonction que les étoiles utilisent à la ligne suivante — pas une
      // copie, pas une caméra parallèle. Les deux couches ne peuvent pas se
      // déphaser parce qu'elles ne font qu'une seule projection.
      if (fond) { fond.peindre(projeter, optionsDuFond()); }

      poussiere.forEach(function (p) {
        var d = RAYON_MONDE * 3.1 * p.r;
        var pr = projeter({
          x: Math.cos(p.a + derive * 0.3) * Math.sin(p.b) * d,
          y: Math.cos(p.b) * d * 0.6,
          z: Math.sin(p.a + derive * 0.3) * Math.sin(p.b) * d
        });
        if (!pr || pr.sx < 0 || pr.sx > vbW || pr.sy < 0 || pr.sy > vbH) {
          p.el.setAttribute('display', 'none');
          return;
        }
        p.el.removeAttribute('display');
        p.el.setAttribute('cx', pr.sx.toFixed(1));
        p.el.setAttribute('cy', pr.sy.toFixed(1));
      });

      // L'ÉCHELLE COMMUNE de l'éclat par le rang : la moyenne des échelles de
      // l'image. Calculée AVANT la boucle des étoiles, qui en a besoin pour la
      // première ; les projections faites ici sont reprises telles quelles.
      var echelleCommune = 1;
      if (eclatParPoids && pieces.length) {
        var sommeEchelles = 0, nbEchelles = 0;
        pieces.forEach(function (piece) {
          var prc = projeter(piece.etoile);
          projetes[piece.etoile.noeud.id] = prc;
          if (prc) { sommeEchelles += prc.echelle; nbEchelles++; }
        });
        if (nbEchelles) { echelleCommune = sommeEchelles / nbEchelles; }
      }

      // LA DEMI-DISTANCE AU VOISIN, pour borner la cible du doigt. Seules
      // comptent les étoiles PEINTES (dans le cadre, à la même règle que le
      // masquage plus bas) : une étoile hors champ ne se touche pas.
      var demiVoisin = null;
      if (cibleDoigtPx && pieces.length) {
        demiVoisin = Object.create(null);
        var peintes = [];
        pieces.forEach(function (piece) {
          var prv = projetes[piece.etoile.noeud.id] || projeter(piece.etoile);
          projetes[piece.etoile.noeud.id] = prv;
          if (prv && prv.sx >= -40 && prv.sx <= vbW + 40 && prv.sy >= -40 && prv.sy <= vbH + 40) {
            peintes.push({ id: piece.etoile.noeud.id, x: prv.sx, y: prv.sy });
          }
        });
        peintes.forEach(function (a) {
          var d = Infinity;
          peintes.forEach(function (b) {
            if (b !== a) { d = Math.min(d, Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))); }
          });
          demiVoisin[a.id] = d / 2;
        });
      }

      pieces.forEach(function (piece) {
        var pr = projetes[piece.etoile.noeud.id] || projeter(piece.etoile);
        projetes[piece.etoile.noeud.id] = pr;
        // ON NE MASQUE JAMAIS L'ÉTOILE QUI A LE FOCUS. `display: none` retire
        // l'élément de la séquence de tabulation, et le navigateur RENVOIE alors
        // le focus sur `body` — sans que rien dans notre code n'ait appelé `blur`.
        //
        // Mesuré le 2026-08-17 : `display=none` puis `display=null` sur l'étoile
        // qu'on venait d'atteindre au clavier, à 100 ms d'intervalle. La caméra
        // glisse vers sa position (approche asymptotique) et une étoile passe
        // FUGITIVEMENT au-delà de la bordure de 40 unités : une seule image
        // masquée suffit à éjecter qui navigue au clavier.
        // Un objet qu'on vient de choisir ne disparaît pas — et s'il sort
        // vraiment du cadre, il vaut mieux le laisser peint à son bord que de
        // faire perdre sa place à l'utilisateur.
        //
        // *Ce défaut a été trouvé par un harnais que j'ai d'abord cru fautif : il
        // annonçait « halo éteint », et il désignait une éjection du focus au
        // clavier. Trois fois j'ai retouché le test avant d'écouter ce qu'il
        // disait.*
        var aLeFocus = piece.g === document.activeElement
          || (document.activeElement && piece.g.contains(document.activeElement));
        if (!aLeFocus
            && (!pr || pr.sx < -40 || pr.sx > vbW + 40 || pr.sy < -40 || pr.sy > vbH + 40)) {
          piece.g.setAttribute('display', 'none');
          return;
        }
        if (!pr) { piece.g.removeAttribute('display'); return; }
        piece.g.removeAttribute('display');
        // L'ÉCLAT : par défaut le nombre de liens (RIVEN) ; sous `eclatParPoids`,
        // le RANG — une tête, qui contient quelque chose, plus vive qu'une
        // feuille. Jamais la fraîcheur : un délaissé qui pâlit est un reproche.
        var surcroit = eclatParPoids
          ? (piece.etoile.noeud.poids ? AMPLITUDE_RANG : 0)
          : Math.min(3.2, (piece.mag / magMax) * 3.2);
        // ⚠️ SOUS `eclatParPoids`, LA PROFONDEUR NE TOUCHE PLUS LA TAILLE.
        // Mesuré par la critique du lot 2 : la perspective faisait varier une
        // étoile de 6,3 à 7,7 à elle seule — une feuille au premier plan
        // dépassait une tête au fond, et le rang devenait illisible. L'échelle
        // est donc celle, commune, de l'image ; la profondeur reste portée par
        // l'opacité.
        var rayon;
        if (eclatParPoids) {
          // LE RANG EST UN RAPPORT, APPLIQUÉ SOUS LE PLAFOND. Premier jet :
          // `(R_ETOILE_MIN + surcroît) × échelle`, borné à 9 — caméra proche,
          // têtes ET feuilles atteignaient la borne et le rang disparaissait
          // (mesuré : trois rayons à 7,74 sur la racine). Le plafond s'applique
          // donc à la feuille, et la tête garde toujours son surcroît relatif.
          var rapportRang = 1 + AMPLITUDE_RANG / R_ETOILE_MIN;
          var baseRang = Math.max(1.6, Math.min(9 / rapportRang, R_ETOILE_MIN * echelleCommune * 1.05));
          rayon = baseRang * (piece.etoile.noeud.poids ? rapportRang : 1);
        } else {
          rayon = Math.max(1.6, Math.min(9, (R_ETOILE_MIN + surcroit) * pr.echelle * 1.05));
        }
        pr.rayon = rayon;
        // ⛔ LE RANG CHANGE L'ÉCLAT, JAMAIS LA CIBLE DU DOIGT (lot 2b, 26/09).
        // La zone de captation se calcule sur le rayon qu'aurait l'étoile SANS
        // le rang (la règle d'avant, nombre de liens et perspective), ou sur le
        // rayon réel s'il est plus grand. Premier jet : elle suivait le rayon
        // réel, et une feuille rapetissée devenait plus dure à toucher — les deux
        // étoiles de TAO passées de 45 à 30 px au bureau (`smoke-tao`).
        var rayonCible = rayon;
        if (eclatParPoids) {
          rayonCible = Math.max(rayon, Math.max(1.6, Math.min(9,
            (R_ETOILE_MIN + Math.min(3.2, (piece.mag / magMax) * 3.2)) * pr.echelle * 1.05)));
        }
        var op = opaciteProfondeur(pr.profondeur);
        var attenue = correspond && !correspond(piece.etoile.noeud);
        piece.g.setAttribute('opacity', (attenue ? op * 0.14 : op).toFixed(3));

        var x = pr.sx, y = pr.sy;
        piece.coeur.setAttribute('cx', x); piece.coeur.setAttribute('cy', y);
        // LE CŒUR : plus petit et BLANC PUR. Une étoile brille par son centre,
        // pas par sa surface.
        piece.coeur.setAttribute('r', (rayon * 0.86).toFixed(2));
        // LA COROLLE : un liseré, plus un disque. C'est le changement qui pèse le
        // plus dans le rendu — à 1,7 rayon elle faisait la pastille.
        piece.corolle.setAttribute('cx', x); piece.corolle.setAttribute('cy', y);
        piece.corolle.setAttribute('r', (rayon * 1.15).toFixed(2));
        // LA LUEUR : resserrée (2,8 au lieu de 3,6) et plus intense. Large et
        // pâle, elle brouillait le contour ; serrée et franche, elle fait le halo.
        piece.lueur.setAttribute('cx', x); piece.lueur.setAttribute('cy', y);
        piece.lueur.setAttribute('r', (rayon * 2.8).toFixed(2));
        // LES BRANCHES : des RAIS. Plus longues (4,6 rayons contre 3,1) et
        // quatre fois plus fines à la base (0,22 rayon contre 0,5) — c'est le
        // rapport longueur/largeur qui fait lire une étoile plutôt qu'une croix.
        // Elles restent sous le halo de choix (5,4 rayons), donc la marge de
        // cadrage ne bouge pas : rien ne sort du cadre qui n'en sortait déjà.
        var p3 = rayon * 4.6;
        var e3 = rayon * 0.22;
        piece.branches.setAttribute('d',
          'M' + x + ',' + (y - p3) + ' L' + (x + e3) + ',' + (y - e3) +
          ' L' + (x + p3) + ',' + y + ' L' + (x + e3) + ',' + (y + e3) +
          ' L' + x + ',' + (y + p3) + ' L' + (x - e3) + ',' + (y + e3) +
          ' L' + (x - p3) + ',' + y + ' L' + (x - e3) + ',' + (y - e3) + ' Z');
        piece.haloFocus.setAttribute('cx', x); piece.haloFocus.setAttribute('cy', y);
        piece.haloFocus.setAttribute('r', (rayon * 4.4).toFixed(2));
        piece.haloChoix.setAttribute('cx', x); piece.haloChoix.setAttribute('cy', y);
        piece.haloChoix.setAttribute('r', (rayon * 5.4).toFixed(2));
        // La zone qui reçoit le doigt ne rétrécit PAS autant que l'étoile :
        // sans ce plancher, la moitié du réseau devient intouchable.
        piece.zone.setAttribute('cx', x); piece.zone.setAttribute('cy', y);
        var rayonZone = Math.max(RAYON_CAPTATION_MIN, rayonCible * 2.4);
        // AU DOIGT, LA ZONE S'ARRÊTE À MI-CHEMIN DE LA VOISINE : le toucher va
        // toujours à l'étoile la plus PROCHE, jamais à celle qui est dessinée
        // par-dessus. La cible de 44 px s'ajoute au plancher, et les deux sont
        // bornés par cette demi-distance — y compris le plancher : mesuré le
        // 27/09 sur RENOBOOST IA à 320 px, six dépôts à 16 px les uns des autres,
        // et des zones de 25 px qui se recouvraient déjà. Un toucher entre deux
        // étoiles tombait sur celle du dessus. Sans l'option (RIVEN, souris),
        // rien ne change.
        if (demiVoisin) {
          var demi = demiVoisin[piece.etoile.noeud.id];
          rayonZone = Math.min(Math.max(rayonZone, rayonCibleDoigt()), isFinite(demi) ? demi : Infinity);
        }
        piece.zone.setAttribute('r', rayonZone.toFixed(2));

        var proche = pr.profondeur < cam.distance - rayonRef * 0.25;
        piece.nom.setAttribute('x', x);
        piece.nom.setAttribute('y', (y + rayon * 3.6 + 9).toFixed(1));
        piece.nom.setAttribute('font-size',
          Math.max(plancherNom(), Math.min(plafondNom, 10 * pr.echelle)).toFixed(1));
        if (!piece.nom.classList.contains('ciel-nom--demande')) {
          // SUR UN MENU, la profondeur n'a pas le droit d'éteindre un nom.
          // Mesuré le 2026-08-13 : rendre les douze noms « permanents » n'en
          // laissait lire que quatre — les autres retombaient à 0,25 parce
          // qu'elles étaient au fond. Un nom permanent illisible n'est pas un
          // nom permanent ; le premier jet de la capacité ② était donc à moitié
          // faux, et c'est la mesure qui l'a dit, pas la relecture.
          // La profondeur reste lisible : elle est portée par l'étoile
          // elle-même (taille et opacité), qui, elle, continue de s'estomper.
          // `attenue` (le filtre de recherche) garde tous ses droits.
          // SUR UN MENU (`tousLesNoms`), le nom est à pleine opacité (30/09).
          // Mesuré sous les lettres à 390 px : à 0,85, NICOL BOLAS lisait
          // 3,86:1 et ZEKROM 3,72:1 AVANT toute nébuleuse — sous le seuil de
          // 4,5. Un nom de menu est une commande : il se lit, point. RIVEN
          // (réseau de personnes) garde 0,85. `tests/smoke-nebuleuses.mjs`.
          piece.nom.setAttribute('opacity',
            attenue ? '0.25' : (tousLesNoms ? '1' : (proche ? '0.85' : '0.25')));
        }
      });

      // LES NOMS DISENT AU CADRAGE LA PLACE QU'ILS PRENNENT — une fois, à la
      // première image peinte. Une constante ne peut pas borner une largeur de
      // texte : elle dépend de la police, de la langue, du nom. On la mesure
      // donc sur le texte réel.
      // NON CIRCULAIRE, et c'est la condition pour que ça tienne : la largeur
      // est ramenée au PLAFOND de police (`PLAFOND_NOM`), la taille maximale
      // qu'un nom puisse atteindre. On obtient une borne supérieure stable, qui
      // ne bouge plus quand la caméra s'approche — sans quoi cadrer changerait
      // la mesure qui décide du cadrage, et la caméra oscillerait sans fin.
      if (cadrageSerre && !nomsMesures && pieces.length) {
        nomsMesures = true;
        var brut = [];
        var plusLarge = 0;
        pieces.forEach(function (piece) {
          var police = parseFloat(piece.nom.getAttribute('font-size')) || 1;
          var largeur = 0;
          try { largeur = piece.nom.getComputedTextLength(); } catch (e) { largeur = 0; }
          // Largeur ramenée au plafond de police : la borne supérieure.
          var auPlafond = largeur > 0 ? largeur * (plafondNom / police) : 0;
          brut.push({ id: piece.etoile.noeud.id, largeur: auPlafond });
          if (auPlafond > plusLarge) { plusLarge = auPlafond; }
        });

        // LA POLICE CÈDE AVANT LA CAMÉRA — et c'est une limite physique, pas un
        // réglage. Mesuré : vingt caractères à 20 px font 422 unités de large
        // dans un cadre de 362. Aucune distance ne corrige cela, parce que le
        // libellé est peint en unités d'ÉCRAN, plafonnées : reculer la caméra
        // éloigne les étoiles sans jamais rétrécir leurs noms. À vouloir tenir
        // le cadrage avec la seule caméra, on obtenait soit un nom coupé (94
        // unités dehors), soit un ciel réduit à 20 % du cadre. Sur un écran
        // étroit, c'est donc le NOM qui rapetisse — jamais sous le plancher de
        // lisibilité de 7,5.
        var dispo = Math.max(60, vbW - 2 * MARGE_HALO);
        if (plusLarge > dispo) {
          // Plafonné à 1 : sur un écran où le plancher dépasserait le plafond,
          // ce repli ne doit pas GROSSIR les noms qu'il est là pour réduire.
          var facteur = Math.min(1, Math.max(plancherNom() / plafondNom, dispo / plusLarge));
          plafondNom = plafondNom * facteur;
          brut.forEach(function (b) { b.largeur = b.largeur * facteur; });
        }
        brut.forEach(function (b) { demiNoms[b.id] = b.largeur / 2; });
        cam.cibleDistance = distanceIdeale() * zoom;
      }

      // LES NOMS NE SE CROISENT PAS (27/09, lot DOKLĚS / SYMPHO). Un nom se pose
      // SOUS son étoile ; mais au téléphone l'ellipse de la couronne est haute
      // et étroite, et à huit étoiles le sommet et sa voisine en diagonale ne
      // sont plus qu'à 14 px de hauteur l'un de l'autre : mesuré sur ALPHA à
      // 390 × 664, ARTIDISPO et RENOBOOST IA se chevauchaient.
      // LA RÈGLE, celle des cartes gravées : un nom qui en croiserait un autre
      // passe AU-DESSUS de son étoile — l'étoile la plus haute des deux, donc
      // côté extérieur de la couronne. Trois gardes : la place au-dessus doit
      // rester dans la ZONE UTILE (jamais sous le fil ni l'en-tête), n'y croiser
      // aucun autre nom, et le passage ne vaut que sur un menu où tous les noms
      // sont permanents (RIVEN ne change pas). Sinon rien ne bouge — un nom
      // croisé vaut mieux qu'un nom poussé sous le mobilier.
      // Le retrait des traits de la figure suit (`retrait`, plus bas).
      var nomDessus = Object.create(null);
      if (cadrageSerre && tousLesNoms && pieces.length > 1) {
        var boitesNoms = [];
        pieces.forEach(function (piece) {
          var idN = piece.etoile.noeud.id, prN = projetes[idN];
          if (!prN || piece.g.getAttribute('display') === 'none' || demiNoms[idN] === undefined) { return; }
          var fsN = parseFloat(piece.nom.getAttribute('font-size')) || 10;
          var rN = prN.rayon || R_ETOILE_MIN;
          boitesNoms.push({
            id: idN, nom: piece.nom, x: prN.sx, sy: prN.sy, fs: fsN,
            // `demiNoms` est mesuré au PLAFOND de police : ramené ici à la
            // police réellement peinte.
            hw: demiNoms[idN] * (fsN / plafondNom),
            yBas: prN.sy + rN * 3.6 + 9, yHaut: prN.sy - rN * 2.6 - 3
          });
        });
        boitesNoms.forEach(function (b) { b.y = b.yBas; });
        var boiteNom = function (b, y) {
          return { x0: b.x - b.hw, x1: b.x + b.hw, y0: y - b.fs * 0.8, y1: y + b.fs * 0.3 };
        };
        var seCroisent = function (u, v) { return u.x0 < v.x1 && v.x0 < u.x1 && u.y0 < v.y1 && v.y0 < u.y1; };
        boitesNoms.sort(function (u, v) { return u.sy - v.sy; });
        boitesNoms.forEach(function (a) {
          var enBas = boiteNom(a, a.yBas);
          var gene = boitesNoms.some(function (b) { return b !== a && seCroisent(enBas, boiteNom(b, b.y)); });
          if (!gene) { return; }
          var enHaut = boiteNom(a, a.yHaut);
          if (enHaut.y0 < mUtile.haut + 2) { return; }
          var libre = boitesNoms.every(function (b) { return b === a || !seCroisent(enHaut, boiteNom(b, b.y)); });
          if (!libre) { return; }
          a.y = a.yHaut;
          nomDessus[a.id] = true;
          a.nom.setAttribute('y', a.yHaut.toFixed(1));
        });
      }

      piecesLien.forEach(function (pl) {
        var a = projetes[pl.relation.source_id], b = projetes[pl.relation.target_id];
        if (!a || !b) { pl.el.setAttribute('display', 'none'); return; }
        pl.el.removeAttribute('display');
        pl.el.setAttribute('x1', a.sx.toFixed(1)); pl.el.setAttribute('y1', a.sy.toFixed(1));
        pl.el.setAttribute('x2', b.sx.toFixed(1)); pl.el.setAttribute('y2', b.sy.toFixed(1));
        var opBase = OPACITE_STATUT_RELATION[pl.relation.statut] || 0.5;
        pl.el.setAttribute('opacity',
          (opBase * opaciteProfondeur((a.profondeur + b.profondeur) / 2)).toFixed(3));
        pl.el.setAttribute('stroke-width',
          (0.55 + 0.75 * ((a.echelle + b.echelle) / 2)).toFixed(2));
      });

      // LE TRAIT S'ARRÊTE AVANT L'ÉTOILE — la convention de gravure des cartes
      // célestes, et le correctif d'un défaut mesuré par la critique du lot 2 :
      // tout trait qui descendait d'une étoile traversait le nom posé sous elle
      // (2 à 3 traversées par écran). On retire à chaque bout le halo, et, quand
      // le trait part vers le bas, la hauteur du nom.
      // Le retrait, c'est la SORTIE du trait hors du rectangle du nom, ou le
      // halo si le trait ne passe pas par le nom. Premier jet : « s'il descend,
      // la hauteur du nom » — faux pour un trait en diagonale, qui ressort par
      // le CÔTÉ d'un nom large (ADRAMELECH, mesuré). Le rectangle suit la pose
      // réelle du nom : centré sur l'étoile, ligne de base à `rayon × 3,6 + 9`,
      // demi-largeur mesurée (`demiNoms`, au plafond de police : une borne
      // haute, donc on retire un peu trop plutôt que pas assez).
      function retrait(p, id, ux, uy) {
        var r = p.rayon || R_ETOILE_MIN;
        var halo = r * 2.6;
        var fs = Math.max(plancherNom(), Math.min(plafondNom, 10 * p.echelle));
        // Le nom est SOUS l'étoile, sauf s'il est passé au-dessus pour ne pas en
        // croiser un autre (plus haut) : le rectangle suit la pose réelle.
        var base = nomDessus[id] ? -(r * 2.6 + 3) : r * 3.6 + 9;
        var hw = demiNoms[id] || 40;
        var bx0 = -hw, bx1 = hw, by0 = base - fs * 0.8, by1 = base + fs * 0.3;
        var tmin = -Infinity, tmax = Infinity;
        if (Math.abs(ux) < 1e-9) { if (bx0 > 0 || bx1 < 0) { return halo; } }
        else { var a1 = bx0 / ux, a2 = bx1 / ux; tmin = Math.max(tmin, Math.min(a1, a2)); tmax = Math.min(tmax, Math.max(a1, a2)); }
        if (Math.abs(uy) < 1e-9) { if (by0 > 0 || by1 < 0) { return halo; } }
        else { var b1 = by0 / uy, b2 = by1 / uy; tmin = Math.max(tmin, Math.min(b1, b2)); tmax = Math.min(tmax, Math.max(b1, b2)); }
        return tmax > Math.max(tmin, 0) ? Math.max(halo, tmax + 3) : halo;
      }
      piecesAsterisme.forEach(function (pa) {
        var a = projetes[pa.a], b = projetes[pa.b];
        if (!a || !b) { pa.el.setAttribute('display', 'none'); return; }
        var dx = b.sx - a.sx, dy = b.sy - a.sy, lg = Math.hypot(dx, dy) || 1;
        var ux = dx / lg, uy = dy / lg;
        var ra = retrait(a, pa.a, ux, uy), rb = retrait(b, pa.b, -ux, -uy);
        if (lg - ra - rb < 8) { pa.el.setAttribute('display', 'none'); return; }
        pa.el.removeAttribute('display');
        pa.el.setAttribute('x1', (a.sx + ux * ra).toFixed(1)); pa.el.setAttribute('y1', (a.sy + uy * ra).toFixed(1));
        pa.el.setAttribute('x2', (b.sx - ux * rb).toFixed(1)); pa.el.setAttribute('y2', (b.sy - uy * rb).toFixed(1));
        pa.el.setAttribute('opacity',
          (OPACITE_FIGURE * opaciteProfondeur((a.profondeur + b.profondeur) / 2)).toFixed(3));
        pa.el.setAttribute('stroke-width', (0.45 + 0.3 * ((a.echelle + b.echelle) / 2)).toFixed(2));
      });

      // Le nom de la passerelle, au milieu de l'arc.
      piecesNomLien.forEach(function (pn) {
        var a = projetes[pn.lien.relation.source_id];
        var b = projetes[pn.lien.relation.target_id];
        if (!a || !b) { pn.el.setAttribute('opacity', '0'); return; }
        var mx = (a.sx + b.sx) / 2, my = (a.sy + b.sy) / 2;
        // Hors cadre, on se TAIT au lieu de peindre au bord : un nom coupé en
        // deux se lit plus mal qu'un nom absent. Même règle que l'étiquette de
        // constellation, et pour la même raison.
        if (mx < 34 || mx > vbW - 34 || my < 16 || my > vbH - 16) {
          pn.el.setAttribute('opacity', '0');
          return;
        }
        var ech = (a.echelle + b.echelle) / 2;
        // LE DÉCALAGE EST PERPENDICULAIRE AU TRAIT, et c'est une correction vue
        // sur capture. Premier jet : « 5 unités au-dessus ». Cela suffit pour un
        // lien horizontal et échoue dès qu'il est INCLINÉ — et depuis que les
        // Gémeaux opposent RESHIRAM et ZEKROM en diagonale, il l'est : le trait
        // traversait « ⇄ rétroplanning » en plein milieu des lettres.
        // La normale au segment, elle, s'éloigne du trait quelle que soit sa
        // pente. Le signe est choisi pour que le nom monte : sur une carte, une
        // légende se pose au-dessus de ce qu'elle nomme.
        var dx = b.sx - a.sx, dy = b.sy - a.sy;
        var lg = Math.max(1, Math.hypot(dx, dy));
        var nx = -dy / lg, ny = dx / lg;
        if (ny > 0) { nx = -nx; ny = -ny; }
        // LE RECUL SE MESURE SUR LE TEXTE, PAS SUR UNE CONSTANTE (30/09). « 8
        // unités » ne valait que pour un trait presque horizontal : depuis que
        // RESHIRAM et ZEKROM siègent chez les DRAGONS, empilés presque à la
        // VERTICALE, le trait passait au milieu de « ⇄ rétroplanning » (70 px
        // de large). Le centre de la boîte du nom s'écarte donc du trait de la
        // demi-projection de la boîte sur la normale, plus une marge :
        // |nx|·largeur/2 + |ny|·hauteur/2 + 4. `tests/smoke-imladrik-carto` A3.
        var fsP = Math.max(7, Math.min(13, 9 * ech));
        pn.el.setAttribute('font-size', fsP.toFixed(1));
        var largeurNom = 0;
        try { largeurNom = pn.el.getComputedTextLength(); } catch (e) { largeurNom = 0; }
        if (!(largeurNom > 0)) { largeurNom = fsP * 0.6 * ((pn.el.textContent || '').length || 1); }
        var hauteurNom = fsP;
        var recul = Math.abs(nx) * largeurNom / 2 + Math.abs(ny) * hauteurNom / 2 + 4;
        // `y` est la LIGNE DE BASE : le centre de la boîte est ~0,32 em au-dessus.
        pn.el.setAttribute('x', (mx + nx * recul).toFixed(1));
        pn.el.setAttribute('y', (my + ny * recul + 0.32 * fsP).toFixed(1));
        pn.el.setAttribute('opacity',
          (0.8 * opaciteProfondeur((a.profondeur + b.profondeur) / 2)).toFixed(3));
      });

      piecesOrbite.forEach(function (po) {
        var a = projetes[po.ancre];
        if (!a) {
          po.g.setAttribute('display', 'none');
          po.trait.setAttribute('display', 'none');
          return;
        }
        po.g.removeAttribute('display'); po.trait.removeAttribute('display');
        var r = po.rayon * a.echelle * 1.1;
        var ox = a.sx + Math.cos(po.angle) * r;
        var oy = a.sy + Math.sin(po.angle) * r * 0.85;
        var op = opaciteProfondeur(a.profondeur);
        po.g.setAttribute('opacity', op.toFixed(3));
        po.trait.setAttribute('opacity', (op * 0.3).toFixed(3));
        po.trait.setAttribute('x1', a.sx.toFixed(1)); po.trait.setAttribute('y1', a.sy.toFixed(1));
        po.trait.setAttribute('x2', ox.toFixed(1)); po.trait.setAttribute('y2', oy.toFixed(1));
        po.pastille.setAttribute('cx', ox.toFixed(1)); po.pastille.setAttribute('cy', oy.toFixed(1));
        po.pastille.setAttribute('r', Math.max(1.1, 2.2 * a.echelle).toFixed(2));
        po.halo.setAttribute('cx', ox.toFixed(1)); po.halo.setAttribute('cy', oy.toFixed(1));
        po.halo.setAttribute('r', Math.max(5, 7 * a.echelle).toFixed(2));
        po.zone.setAttribute('cx', ox.toFixed(1)); po.zone.setAttribute('cy', oy.toFixed(1));
        po.zone.setAttribute('r', '9');
      });

      // EN CADRAGE SERRÉ, LES ÉTIQUETTES DE CONSTELLATION SE TAISENT.
      // Ce n'est pas un goût, c'est une conséquence géométrique — et la règle a
      // dû être élargie deux fois, chaque fois sur une capture.
      //   — Avec un groupe UNIQUE, le centre de l'amas EST le barycentre, donc
      //     l'origine : son nom tombe toujours au milieu des entrées, par
      //     construction. Et il les répète : un étage LV4 nomme son groupe
      //     d'après l'écran, si bien que « ULTIMA » s'écrivait trois fois — en
      //     titre, en étiquette d'amas, et en nom d'étoile.
      //   — Avec DEUX groupes (un cap déplié montre ses enfants), l'étiquette du
      //     second se posait en travers de la première étoile dépliée : « GRIMA »
      //     écrit sur RIVEN. Le nom du groupe est déjà dit ailleurs — c'est le
      //     cap qu'on survole, et le cartouche de Léo l'annonce en toutes
      //     lettres au même instant.
      // Sur un MENU, une étiquette de constellation ne dit donc jamais rien que
      // le titre ou le cartouche ne disent mieux. Elle se tait, tout le temps.
      // (RIVEN, lui, garde les siennes : ce sont des métiers, et elles sont la
      // seule chose qui les nomme.)
      var amasMuet = cadrageSerre;
      piecesAmas.forEach(function (pa) {
        if (amasMuet) { pa.el.setAttribute('opacity', '0'); return; }
        var pr = projeter(pa.groupe.centre);
        // Seule la moitié AVANT parle : sinon un nom lointain vient se poser
        // sur une étoile proche et le ciel devient illisible.
        if (!pr || pr.profondeur > cam.distance ||
            pr.sx < 30 || pr.sx > vbW - 30 || pr.sy < 20 || pr.sy > vbH - 20) {
          pa.el.setAttribute('opacity', '0');
          return;
        }
        // Le nom de constellation suit la même règle que celui des étoiles :
        // à courte distance, `12 × échelle` l'écrivait en 36 px et le posait
        // 126 unités au-dessus de l'amas — un titre à cheval sur tout le ciel.
        // Vu sur une CAPTURE, pas dans la mesure : le harnais ne regardait que
        // les étoiles, et cette étiquette n'en est pas une. Le trou a été
        // rebouché des deux côtés — le plafond ici, la mesure dans le harnais.
        var eNom = cadrageSerre ? Math.min(pr.echelle, PLAFOND_NOM / 12) : pr.echelle;
        pa.el.setAttribute('x', pr.sx.toFixed(1));
        pa.el.setAttribute('y', (pr.sy - 38 * eNom - 12).toFixed(1));
        pa.el.setAttribute('font-size', Math.max(8, 12 * eNom).toFixed(1));
        pa.el.setAttribute('opacity', (opaciteProfondeur(pr.profondeur) * 0.85).toFixed(3));
      });

      // Ordre de rendu : les proches par-dessus les lointaines. Réordonner à
      // chaque image coûterait cher pour rien — l'opacité et la taille portent
      // déjà l'essentiel de la profondeur.
      imagesDepuisTri += 1;
      // JAMAIS pendant qu'une étoile a le focus : réordonner par appendChild
      // détache l'élément du document et le réinsère, ce qui LUI ARRACHE LE
      // FOCUS — la touche Entrée n'ouvrait alors plus aucune fiche. Le tri est
      // cosmétique, le focus est fonctionnel : le focus gagne.
      // SUR UNE COURONNE, ON NE TRIE PAS — et c'est une correction
      // d'ACCESSIBILITÉ, pas une optimisation.
      //
      // Le tri réordonne les étoiles par profondeur avec `appendChild`, qui
      // DÉTACHE l'élément avant de le réinsérer : un élément détaché perd le
      // focus. La garde `!gEtoiles.contains(document.activeElement)` protège le
      // cas simple, mais pas la course entre la prise du focus et l'image
      // suivante.
      // Or la couronne pose toutes les étoiles dans le MÊME PLAN (z1 = 0) : leurs
      // profondeurs ne diffèrent plus que d'un cheveu, et comme la caméra glisse
      // sans fin (approche asymptotique), l'ordre du tri ALTERNE d'une fois sur
      // l'autre. Le moteur réinsérait donc les étoiles en boucle, pour rien, et
      // arrachait le focus à qui venait de le prendre — mesuré : focus sur
      // l'étoile à t+0, retombé sur `body` à t+100 ms.
      // Sur un plan, aucune étoile n'est devant une autre : il n'y a rien à
      // trier. RIVEN, lui, est un vrai volume et garde son tri.
      //
      // *Trouvé par un harnais que j'ai d'abord cru fautif. Il criait « halo
      // éteint » et désignait un défaut plus grave que celui qu'il mesurait :
      // au clavier, on pouvait se faire éjecter de l'étoile qu'on venait
      // d'atteindre.*
      if (!options.couronne && imagesDepuisTri > 6
          && !gEtoiles.contains(document.activeElement)) {
        imagesDepuisTri = 0;
        var ordonnees = pieces.slice()
          .filter(function (p) { return projetes[p.etoile.noeud.id]; })
          .sort(function (a, b) {
            return projetes[b.etoile.noeud.id].profondeur - projetes[a.etoile.noeud.id].profondeur;
          });
        // ON NE RÉINSÈRE QUE SI L'ORDRE CHANGE VRAIMENT, et ce n'est pas une
        // optimisation : c'est une correction d'ACCESSIBILITÉ.
        //
        // `appendChild` DÉTACHE l'élément du document avant de le réinsérer, et
        // un élément détaché PERD LE FOCUS. La garde ci-dessus l'évite quand une
        // étoile est déjà focalisée — mais elle ne peut rien contre la course :
        // entre le moment où quelqu'un prend le focus et l'image suivante, le tri
        // se déclenche sur l'état d'avant et arrache ce focus. Mesuré le
        // 2026-08-17 : après un `focus()` sur une étoile, `document.activeElement`
        // était retombé sur `body`.
        //
        // POURQUOI C'EST APPARU AVEC LA COURONNE : elle pose toutes les étoiles à
        // la MÊME profondeur (z1 = 0, par construction). Le tri n'a donc plus
        // rien à trier — mais il réinsérait quand même les huit éléments, à
        // chaque fois, pour rien. Un travail inutile qui coûtait le focus.
        //
        // *C'est un harnais qui l'a trouvé : il criait « halo éteint » et j'ai
        // d'abord cru qu'il se trompait. Il avait raison, et il désignait un
        // défaut plus grave que celui qu'il mesurait.*
        var change = false;
        for (var t = 0; t < ordonnees.length; t++) {
          if (gEtoiles.childNodes[t] !== ordonnees[t].g) { change = true; break; }
        }
        if (change) {
          ordonnees.forEach(function (p) { gEtoiles.appendChild(p.g); });
        }
      }

      // À plat, la boucle s'ARRÊTE dès que la caméra a fini de glisser : c'est
      // tout l'intérêt du mode. `courant.image = null` est le signal qu'aucune
      // image n'est en vol — `relancer()` la redemande quand quelque chose
      // change (zoom, cadrage, sélection, redimensionnement).
      // Le chronomètre se ferme AVANT la demande d'image suivante : ce qu'on
      // veut connaître est le temps passé à dessiner, pas celui passé à
      // attendre l'écran.
      var passe = performance.now() - chrono;
      imagesMesurees++;
      coutImage = imagesMesurees === 1 ? passe : coutImage + (passe - coutImage) * 0.1;

      var poseeSurSaCible = Math.abs(cam.distance - cam.cibleDistance) < 0.5;
      if (courant && plat && poseeSurSaCible && !saisie) {
        courant.image = null;
        return;
      }
      if (courant) { courant.image = window.requestAnimationFrame(dessiner); }
    }

    function relancer() {
      if (courant && courant.image === null) {
        courant.image = window.requestAnimationFrame(dessiner);
      }
    }

    var etatDerive = false;

    function surRedimension() {
      var avant = vbW, avantH = vbH;
      dimensionner();
      // La HAUTEUR aussi, et ce n'est pas de la prudence : elle change seule
      // dès qu'un panneau s'ouvre ou que la barre d'URL d'un téléphone se
      // rétracte. Tant que le ciel vivait dans un plateau à proportions fixes,
      // le défaut ne se voyait pas ; en plein écran, le viewBox resterait
      // périmé pendant que le fond, lui, se repose sur la boîte réelle — et
      // les deux couches se décaleraient. Un test sur la largeur seule ne
      // protège que la moitié des cas.
      if (vbW !== avant || vbH !== avantH) {
        racine.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH);
      }
      // L'échelle écran a pu changer même à viewBox égal (le SVG se pose en
      // `meet` dans une boîte qui a bougé) : le plancher se relit.
      plancherCourant = null;
      cibleCourante = null;
      cam.cibleDistance = distanceIdeale() * zoom;
      relancer(); // à plat, la boucle dort : un cadre qui change la réveille
    }
    window.addEventListener('resize', surRedimension);

    courant = {
      image: null,
      surRedimension: surRedimension,
      racine: racine,
      // Le cadre suit la largeur réelle : sans cela, l'ouverture du panneau
      // rétrécit la scène sans toucher au viewBox et la cible tactile s'effondre.
      ajusterCadre: surRedimension,
      zoomer: zoomer,
      toutVoir: toutVoir,
      viser: function (idNoeud) { if (parId[idNoeud]) { viser(parId[idNoeud]); relancer(); } },
      // LV4 — APPROCHER un nœud : la caméra le met face à elle ET s'en
      // rapproche. `viser` seul tournait le monde sans jamais réduire la
      // distance ; c'est ce qui manquait au dépliage, où cliquer une galaxie
      // doit donner le sentiment d'y entrer, pas de la regarder de loin.
      // Le facteur reste borné par ZOOM_MIN/ZOOM_MAX : approcher n'est pas un
      // droit de traverser le monde. Renvoie false si le nœud est inconnu —
      // l'appelant sait alors que rien n'a bougé, au lieu de le supposer.
      zoomerVers: function (idNoeud, facteur) {
        if (!parId[idNoeud]) { return false; }
        viser(parId[idNoeud]);
        var f = typeof facteur === 'number' ? facteur : ZOOM_MIN;
        zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, f));
        cam.cibleDistance = distanceIdeale() * zoom;
        relancer();
        return true;
      },
      choisir: function (idNoeud) {
        pieces.forEach(function (p) {
          if (p.etoile.noeud.id === idNoeud) { p.g.classList.add('ciel-etoile--choisie'); }
          else { p.g.classList.remove('ciel-etoile--choisie'); }
        });
        relancer();
      },
      derive: function (actif) { etatDerive = !!actif; relancer(); },
      // La bascule. `moinsDAnimation` garde la main : si le système demande
      // moins de mouvement, on ne repart pas en volume sur un clic.
      plat: function (actif) {
        plat = moinsDAnimation ? true : !!actif;
        relancer(); // dans les deux sens : il faut redessiner
      },
      estPlat: function () { return plat; },
      nbEtoiles: pieces.length,
      nbLiens: piecesLien.length,
      nbOrbites: piecesOrbite.length,
      nbConstellations: monde.groupes.length,
      // Ce que le cadrage a réellement décidé — pour que le harnais mesure la
      // géométrie au lieu de la regarder (règle du 2026-08-01).
      cadrageSerre: cadrageSerre,
      rayonEtoiles: cadrageSerre ? monde.rayonReel : monde.rayon,
      // La distance RÉELLE de la caméra, pas sa consigne. Sans elle, un harnais
      // qui veut prouver qu'on s'est approché en est réduit à regarder grossir
      // l'étoile — or son rayon PLAFONNE à 9 : la mesure sature et déclare
      // immobile une caméra qui a parcouru la moitié du monde. Constaté le
      // 2026-08-13 ; l'instrument mentait, pas le moteur.
      distance: function () { return cam.distance; },
      nbNomsPermanents: Object.keys(lourdes).length,

      // ---- LV5 : de quoi MESURER la couche de fond, jamais la regarder ----
      // Un canvas qui n'a pas peint est noir — exactement comme un beau ciel.
      // Ces trois entrées existent pour que le harnais puisse trancher entre
      // les deux sans se fier à l'apparence.
      aUnFond: !!fond,
      nbGrains: function () { return fond ? fond.nbGrains() : 0; },
      // LV5 / P2 — LA ZONE UTILE, en unités de viewBox. Exposée parce qu'un
      // harnais qui veut juger le remplissage doit connaître le DÉNOMINATEUR :
      // rapporter l'étendue des étoiles au cadre entier alors qu'un quart est
      // rendu au mobilier revient à exiger 83 % de la place restante. Le
      // critère des 60 % ne baisse pas, il se mesure sur la surface où le ciel
      // a le droit de peindre.
      zoneUtile: function () {
        return {
          gauche: mUtile.gauche, droite: mUtile.droite,
          haut: mUtile.haut, bas: mUtile.bas,
          largeur: vbW - mUtile.gauche - mUtile.droite,
          hauteur: vbH - mUtile.haut - mUtile.bas,
          centreX: centreX(), centreY: centreY()
        };
      },
      // Le coût moyen d'une image, en millisecondes de travail réel.
      coutImage: function () { return coutImage; },
      cadence: function () { return cadence; },
      imagesMesurees: function () { return imagesMesurees; },
      // Combien de crans le fond a rendus pour tenir la cadence. 0 = il n'a
      // jamais eu besoin de reculer.
      // ⛔ ET CE QUE `cransDeFond` PERMET DE NE PAS CROIRE. `nbGrains()` rend le
      // champ RÉEL, crans compris : sous charge, le fond coupe 40 % par cran
      // (deux au plus). Un harnais qui compare le remplissage de deux fenêtres
      // sans lire ceci compare deux échelles différentes sans le savoir.
      // Mesuré le 20/09 : 5200 grains à 1670 px isolément, 3120 — exactement
      // 5200 × 0,6, un cran — en exécution enchaînée, et « la densité suit la
      // surface » virait au rouge alors que la règle était tenue.
      cransDeFond: function () { return fond ? fond.crans() : 0; },
      // LE POINT TÉMOIN, et il est NON CIRCULAIRE. Il rend la position écran
      // qu'un point du MONDE occupe selon la couche de fond. Le harnais la
      // compare à celle que le NAVIGATEUR mesure sur l'étoile correspondante
      // (`getBoundingClientRect`) : deux chemins indépendants, un seul verdict.
      // Comparer ma formule à une seconde version de ma formule ne prouverait
      // rien — c'est la leçon des deux instruments écartés le 2026-08-13.
      temoin: function (idNoeud) {
        if (!fond || !parId[idNoeud]) { return null; }
        return fond.temoin(parId[idNoeud], projeter);
      }
    };
    courant.image = window.requestAnimationFrame(dessiner);
    return courant;
  }

  window.UltimaCiel = {
    rendre: rendre,
    arreter: arreter,
    construireMonde: construireMonde,
    asterisme: asterisme,
    recentrerSurLesEtoiles: recentrerSurLesEtoiles,
    grouper: grouper,
    magnitudes: magnitudes,
    courant: function () { return courant; },
    CLE_A_CLASSER: CLE_A_CLASSER,
    LABEL_A_CLASSER: LABEL_A_CLASSER
  };
})();
