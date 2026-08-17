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
  var RAYON_MONDE = 300;
  var ANGLE_OR = Math.PI * (3 - Math.sqrt(5));
  var FOCALE = 620;
  var R_ETOILE_MIN = 3.2;
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
  function grouper(noeuds) {
    var index = Object.create(null);
    var ordre = [];
    (noeuds || []).forEach(function (n) {
      var brut = (n.secteur_activite || '').trim();
      var cle = brut ? normaliser(brut) : CLE_A_CLASSER;
      if (!index[cle]) {
        index[cle] = { cle: cle, label: brut || LABEL_A_CLASSER, noeuds: [] };
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
  function construireMonde(noeuds) {
    var groupes = grouper(noeuds);
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

    var monde = construireMonde(noeuds);
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
      // Plafond à 40 % par axe : au-delà, ce ne serait plus un ciel avec du
      // mobilier, ce serait du mobilier avec un peu de ciel. Un garde-fou qui
      // dit non valait mieux qu'une scène qui s'effondre sans le dire.
      var maxV = vbH * 0.4, maxH = vbW * 0.4;
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
      return Math.max(d, monde.rayonReel * 1.35, 90);
    }

    dimensionner();
    // L'orientation d'ouverture, nommée : « Tout voir » y revient.
    var YAW_OUVERTURE = 0.6, PITCH_OUVERTURE = -0.28;
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
          (e.groupe.cle === CLE_A_CLASSER ? ', sans secteur' : ', secteur ' + e.groupe.label) +
          (libelleStatut ? ', ' + libelleStatut : '') +
          ', ' + mag + ' lien' + (mag > 1 ? 's' : '')
      });
      var titre = svg('title');
      titre.textContent = nomComplet;
      g.appendChild(titre);
      var haloChoix = svg('circle', { 'class': 'ciel-halo-choix', fill: 'none', stroke: '#d8bd82', 'stroke-width': '1.2' });
      var haloFocus = svg('circle', { 'class': 'ciel-halo-focus', fill: 'none', stroke: '#fffaf0', 'stroke-width': '1' });
      var lueur = svg('circle', { fill: couleur, opacity: '0.14' });
      var branches = svg('path', { fill: couleur, opacity: '0.5' });
      var corolle = svg('circle', { fill: couleur, opacity: '0.75' });
      var coeur = svg('circle', { fill: '#fffaf0' });
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
      if (g && parId[g.getAttribute('data-noeud-id')]) {
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

    function opaciteProfondeur(profondeur) {
      var t = (profondeur - (cam.distance - rayonRef)) / (2 * rayonRef);
      return Math.max(0.18, Math.min(1, 1.06 - t * 0.9));
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
      if (fond) { fond.peindre(projeter, { eclat: 1 }); }

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

      pieces.forEach(function (piece) {
        var pr = projeter(piece.etoile);
        projetes[piece.etoile.noeud.id] = pr;
        if (!pr || pr.sx < -40 || pr.sx > vbW + 40 || pr.sy < -40 || pr.sy > vbH + 40) {
          piece.g.setAttribute('display', 'none');
          return;
        }
        piece.g.removeAttribute('display');
        var rayon = Math.max(1.6, Math.min(9,
          (R_ETOILE_MIN + Math.min(3.2, (piece.mag / magMax) * 3.2)) * pr.echelle * 1.05));
        var op = opaciteProfondeur(pr.profondeur);
        var attenue = correspond && !correspond(piece.etoile.noeud);
        piece.g.setAttribute('opacity', (attenue ? op * 0.14 : op).toFixed(3));

        var x = pr.sx, y = pr.sy;
        piece.coeur.setAttribute('cx', x); piece.coeur.setAttribute('cy', y);
        piece.coeur.setAttribute('r', rayon.toFixed(2));
        piece.corolle.setAttribute('cx', x); piece.corolle.setAttribute('cy', y);
        piece.corolle.setAttribute('r', (rayon * 1.7).toFixed(2));
        piece.lueur.setAttribute('cx', x); piece.lueur.setAttribute('cy', y);
        piece.lueur.setAttribute('r', (rayon * 3.6).toFixed(2));
        var p3 = rayon * 3.1;
        piece.branches.setAttribute('d',
          'M' + x + ',' + (y - p3) + ' L' + (x + rayon * 0.5) + ',' + (y - rayon * 0.5) +
          ' L' + (x + p3) + ',' + y + ' L' + (x + rayon * 0.5) + ',' + (y + rayon * 0.5) +
          ' L' + x + ',' + (y + p3) + ' L' + (x - rayon * 0.5) + ',' + (y + rayon * 0.5) +
          ' L' + (x - p3) + ',' + y + ' L' + (x - rayon * 0.5) + ',' + (y - rayon * 0.5) + ' Z');
        piece.haloFocus.setAttribute('cx', x); piece.haloFocus.setAttribute('cy', y);
        piece.haloFocus.setAttribute('r', (rayon * 4.4).toFixed(2));
        piece.haloChoix.setAttribute('cx', x); piece.haloChoix.setAttribute('cy', y);
        piece.haloChoix.setAttribute('r', (rayon * 5.4).toFixed(2));
        // La zone qui reçoit le doigt ne rétrécit PAS autant que l'étoile :
        // sans ce plancher, la moitié du réseau devient intouchable.
        piece.zone.setAttribute('cx', x); piece.zone.setAttribute('cy', y);
        piece.zone.setAttribute('r', Math.max(RAYON_CAPTATION_MIN, rayon * 2.4).toFixed(2));

        var proche = pr.profondeur < cam.distance - rayonRef * 0.25;
        piece.nom.setAttribute('x', x);
        piece.nom.setAttribute('y', (y + rayon * 3.6 + 9).toFixed(1));
        piece.nom.setAttribute('font-size',
          Math.max(7.5, Math.min(plafondNom, 10 * pr.echelle)).toFixed(1));
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
          piece.nom.setAttribute('opacity',
            attenue ? '0.25' : ((proche || tousLesNoms) ? '0.85' : '0.25'));
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
          var facteur = Math.max(7.5 / plafondNom, dispo / plusLarge);
          plafondNom = plafondNom * facteur;
          brut.forEach(function (b) { b.largeur = b.largeur * facteur; });
        }
        brut.forEach(function (b) { demiNoms[b.id] = b.largeur / 2; });
        cam.cibleDistance = distanceIdeale() * zoom;
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
        pn.el.setAttribute('x', mx.toFixed(1));
        // 5 unités au-dessus du trait : posé DESSUS, le nom se fait barrer par
        // lui — le trait passe pile à la hauteur des lettres.
        pn.el.setAttribute('y', (my - 5).toFixed(1));
        pn.el.setAttribute('font-size', Math.max(7, Math.min(13, 9 * ech)).toFixed(1));
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
      if (imagesDepuisTri > 6 && !gEtoiles.contains(document.activeElement)) {
        imagesDepuisTri = 0;
        pieces.slice().filter(function (p) { return projetes[p.etoile.noeud.id]; })
          .sort(function (a, b) {
            return projetes[b.etoile.noeud.id].profondeur - projetes[a.etoile.noeud.id].profondeur;
          })
          .forEach(function (p) { gEtoiles.appendChild(p.g); });
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
    recentrerSurLesEtoiles: recentrerSurLesEtoiles,
    grouper: grouper,
    magnitudes: magnitudes,
    courant: function () { return courant; },
    CLE_A_CLASSER: CLE_A_CLASSER,
    LABEL_A_CLASSER: LABEL_A_CLASSER
  };
})();
