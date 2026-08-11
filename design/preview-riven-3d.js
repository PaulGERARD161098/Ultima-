// Script de la preview « RIVEN en 3D ».
// FICHIER SÉPARÉ : la CSP d'Ultima pose `script-src 'self'` sans
// 'unsafe-inline'. Un <script> en ligne y est bloqué en silence — la page
// s'affiche, stylée, et reste vide. Leçon payée le 2026-08-11.
//
// Zéro bibliothèque. La perspective tient en une quinzaine de lignes de
// trigonométrie ; importer 600 Ko de moteur 3D pour vingt étoiles serait un
// mauvais marché, et un canvas WebGL coûterait le focus clavier, le lecteur
// d'écran et le texte réel. Ici chaque étoile reste un élément du document.
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var LIBELLES_TYPE = {
    artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier'
  };
  var COULEURS_TYPE = {
    artisan: '#f2a15a', partenaire: '#7cb8ea', lead: '#6fd39b', chantier: '#b995e8'
  };
  var LIBELLES_STATUT = {
    actif: 'Actif', prospect: 'Prospect', en_cours: 'En cours',
    termine: 'Terminé', inactif: 'Inactif'
  };
  var LIBELLES_RELATION = {
    apport_affaires: "Apport d'affaires",
    sous_traitance: 'Sous-traitance',
    chantier_commun: 'Chantier commun'
  };
  var MOTIFS_RELATION = {
    apport_affaires: null, sous_traitance: '7 5', chantier_commun: '1.5 5'
  };
  var LIBELLES_STATUT_RELATION = {
    idee: 'Idée', contact_etabli: 'Contact établi', en_cours: 'En cours',
    fructueux: 'Fructueux', arrete: 'Arrêté'
  };
  var OPACITE_STATUT = {
    idee: 0.22, contact_etabli: 0.42, en_cours: 0.62, fructueux: 0.92, arrete: 0.14
  };

  // ------------------------------------------------------------------
  // Données inventées — les mêmes que la voûte à plat, pour que la
  // comparaison porte sur le RENDU et sur rien d'autre.
  // ------------------------------------------------------------------
  var FICHES = [
    { id: 'n1', nom: 'Roux & Fils', type: 'artisan', statut: 'actif', metier: 'Plomberie',
      ville: 'Montreuil', nature: 'Artisan indépendant', prestations: 'Sanitaire, réseaux, dépannage.',
      zone: '93, 75 est', effectif: 6, dispo: 'Sous 48 h' },
    { id: 'n2', nom: 'SARL Delmas', type: 'artisan', statut: 'actif', metier: 'Plomberie',
      ville: 'Bagnolet', nature: 'Entreprise', prestations: 'Gros œuvre plomberie, colonnes montantes.',
      zone: '93', effectif: 14, dispo: 'Chargé jusqu’en septembre' },
    { id: 'n3', nom: 'Atelier Vanneau', type: 'artisan', statut: 'actif', metier: 'Menuiserie',
      ville: 'Pantin', nature: 'Artisan indépendant', prestations: 'Menuiserie sur mesure, agencement.',
      zone: '93, 75', effectif: 3, dispo: 'Deux semaines d’attente' },
    { id: 'n4', nom: 'Ets Aubry', type: 'artisan', statut: 'actif', metier: 'Électricité',
      ville: 'Romainville', nature: 'Entreprise', prestations: 'Courants forts et faibles, mise aux normes.',
      zone: '93, 94', effectif: 11, dispo: 'Sous une semaine' },
    { id: 'n5', nom: 'Perrin Électricité', type: 'artisan', statut: 'prospect', metier: 'Électricité',
      ville: 'Les Lilas', nature: 'Artisan indépendant', prestations: 'Rénovation d’appartements.',
      zone: '93', effectif: 2, dispo: 'Disponible' },
    { id: 'n6', nom: 'Maçonnerie Lombard', type: 'artisan', statut: 'actif', metier: 'Maçonnerie',
      ville: 'Noisy-le-Sec', nature: 'Entreprise', prestations: 'Structure, ouvertures, reprise en sous-œuvre.',
      zone: '93, 77 ouest', effectif: 22, dispo: 'À partir d’octobre' },
    { id: 'n7', nom: 'Cazaux Frères', type: 'artisan', statut: 'inactif', metier: 'Maçonnerie',
      ville: 'Rosny', nature: 'Entreprise', prestations: 'Maçonnerie générale.',
      zone: '93', effectif: 8, dispo: '' },
    { id: 'n8', nom: 'Charpentes Marchal', type: 'artisan', statut: 'actif', metier: 'Charpente',
      ville: 'Villemomble', nature: 'Entreprise', prestations: 'Charpente traditionnelle, ossature bois.',
      zone: '93, 77, 95', effectif: 9, dispo: 'Sous trois semaines' },
    { id: 'n9', nom: 'Belin Couverture', type: 'artisan', statut: 'actif', metier: 'Couverture',
      ville: 'Bondy', nature: 'Artisan indépendant', prestations: 'Zinc, tuile, étanchéité.',
      zone: '93', effectif: 4, dispo: 'Sous 48 h' },
    { id: 'n10', nom: 'Maison Thibault', type: 'artisan', statut: 'prospect', metier: 'Couverture',
      ville: 'Le Raincy', nature: 'Artisan indépendant', prestations: 'Couverture ardoise, monuments anciens.',
      zone: '93, 77', effectif: 5, dispo: '' },
    { id: 'n11', nom: 'Peinture Estève', type: 'artisan', statut: 'actif', metier: 'Peinture',
      ville: 'Montreuil', nature: 'Artisan indépendant', prestations: 'Peinture décorative, enduits à la chaux.',
      zone: '75, 93', effectif: 3, dispo: 'Disponible' },
    { id: 'n12', nom: 'Sorel Rénovation', type: 'artisan', statut: 'actif', metier: 'Peinture',
      ville: 'Vincennes', nature: 'Entreprise', prestations: 'Peinture, revêtements, remise en état.',
      zone: '94, 75', effectif: 12, dispo: 'Sous une semaine' },
    { id: 'n13', nom: 'Chauffage Nadaud', type: 'artisan', statut: 'actif', metier: 'Chauffage',
      ville: 'Neuilly-Plaisance', nature: 'Entreprise', prestations: 'PAC, chaudières, plancher chauffant. RGE.',
      zone: '93, 77', effectif: 7, dispo: 'Sous une semaine' },
    { id: 'n14', nom: 'Cabinet Vergne', type: 'partenaire', statut: 'actif', metier: 'Architecture',
      ville: 'Paris 11e', nature: 'Bureau d’études', prestations: 'Maîtrise d’œuvre, permis, suivi de chantier.',
      zone: 'Île-de-France', effectif: 5, dispo: 'Sur rendez-vous' },
    { id: 'n15', nom: 'Brossard Ingénierie', type: 'partenaire', statut: 'actif', metier: 'Architecture',
      ville: 'Paris 12e', nature: 'Bureau d’études', prestations: 'Structure, thermique, diagnostics.',
      zone: 'Île-de-France', effectif: 8, dispo: 'Sous deux semaines' },
    { id: 'n16', nom: 'Agence Tissot', type: 'partenaire', statut: 'actif', metier: 'Apport d’affaires',
      ville: 'Montreuil', nature: 'Apporteur d’affaires', prestations: 'Gestion locative, syndic.',
      zone: '93', effectif: 18, dispo: 'Toujours joignable' },
    { id: 'n17', nom: 'Chapron Immobilier', type: 'partenaire', statut: 'prospect', metier: 'Apport d’affaires',
      ville: 'Vincennes', nature: 'Apporteur d’affaires', prestations: 'Transactions, marchands de biens.',
      zone: '94', effectif: 6, dispo: '' },
    { id: 'n18', nom: 'Copropriété Voltaire', type: 'chantier', statut: 'en_cours', metier: 'Réhabilitation',
      ville: 'Paris 11e', nature: 'Institution', prestations: 'Réfection des parties communes, toiture.',
      zone: '75', effectif: 0, dispo: 'Livraison prévue en mars' },
    { id: 'n19', nom: 'Maison Osmond', type: 'chantier', statut: 'termine', metier: 'Réhabilitation',
      ville: 'Le Perreux', nature: 'Particulier', prestations: 'Surélévation, création d’un étage.',
      zone: '94', effectif: 0, dispo: '' },
    { id: 'n20', nom: 'Résidence Faure', type: 'lead', statut: 'prospect', metier: 'Réhabilitation',
      ville: 'Nogent', nature: 'Institution', prestations: 'Ravalement + toiture, à chiffrer.',
      zone: '94', effectif: 0, dispo: 'Relance début septembre' }
  ];

  var PERSONNES = [
    { id: 'p1', nom: 'Godefroy Meunier', rattachements: [
      { fiche: 'n1', role: 'Gérant' }, { fiche: 'n18', role: 'Conducteur de travaux' } ] },
    { id: 'p2', nom: 'Mathilde Vasseur', rattachements: [{ fiche: 'n16', role: 'Gestionnaire' }] },
    { id: 'p3', nom: 'Armand Roux', rattachements: [{ fiche: 'n1', role: 'Chef d’équipe' }] },
    { id: 'p4', nom: 'Solène Vergne', rattachements: [
      { fiche: 'n14', role: 'Architecte' }, { fiche: 'n18', role: 'Maître d’œuvre' } ] },
    { id: 'p5', nom: 'Bastien Lombard', rattachements: [{ fiche: 'n6', role: 'Gérant' }] },
    { id: 'p6', nom: 'Irène Estève', rattachements: [{ fiche: 'n11', role: 'Gérante' }] },
    { id: 'p7', nom: 'Côme Nadaud', rattachements: [{ fiche: 'n13', role: 'Gérant' }] },
    { id: 'p8', nom: 'Léonie Brossard', rattachements: [{ fiche: 'n15', role: 'Ingénieure structure' }] },
    { id: 'p9', nom: 'Hugues Nadal', rattachements: [] }
  ];

  var RELATIONS = [
    { id: 'r1', source: 'n16', cible: 'n1', type: 'apport_affaires', statut: 'fructueux' },
    { id: 'r2', source: 'n16', cible: 'n4', type: 'apport_affaires', statut: 'en_cours' },
    { id: 'r3', source: 'n1', cible: 'n13', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r4', source: 'n6', cible: 'n8', type: 'chantier_commun', statut: 'en_cours' },
    { id: 'r5', source: 'n14', cible: 'n18', type: 'chantier_commun', statut: 'en_cours' },
    { id: 'r6', source: 'n14', cible: 'n6', type: 'apport_affaires', statut: 'contact_etabli' },
    { id: 'r7', source: 'n9', cible: 'n8', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r8', source: 'n11', cible: 'n12', type: 'sous_traitance', statut: 'idee' },
    { id: 'r9', source: 'n17', cible: 'n12', type: 'apport_affaires', statut: 'idee' },
    { id: 'r10', source: 'n15', cible: 'n13', type: 'chantier_commun', statut: 'contact_etabli' },
    { id: 'r11', source: 'n4', cible: 'n18', type: 'sous_traitance', statut: 'en_cours' },
    { id: 'r12', source: 'n3', cible: 'n19', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r13', source: 'n16', cible: 'n20', type: 'apport_affaires', statut: 'contact_etabli' }
  ];

  function svg(nom, attrs) {
    var el = document.createElementNS(SVG_NS, nom);
    if (attrs) { Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); }
    return el;
  }
  function texte(attrs, contenu) {
    var t = svg('text', attrs); t.textContent = contenu; return t;
  }
  function normaliser(t) {
    return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function fiche(id) {
    for (var i = 0; i < FICHES.length; i++) { if (FICHES[i].id === id) { return FICHES[i]; } }
    return null;
  }
  function personnesDe(id) {
    var res = [];
    PERSONNES.forEach(function (p) {
      p.rattachements.forEach(function (r) {
        if (r.fiche === id) { res.push({ personne: p, role: r.role }); }
      });
    });
    return res;
  }
  function relationsDe(id) {
    return RELATIONS.filter(function (r) { return r.source === id || r.cible === id; });
  }

  // ------------------------------------------------------------------
  // 1. PLACEMENT DANS L'ESPACE. C'est ici que la 3D gagne son droit
  //    d'exister : une constellation n'est plus une case de mosaïque, c'est
  //    une RÉGION DU VIDE. Les métiers sont répartis sur une sphère par la
  //    spirale de Fibonacci (aucun paquet, aucun trou), et chaque fiche
  //    occupe un volume autour du centre de son métier.
  //    Déterministe : mêmes données, même ciel, à chaque ouverture.
  // ------------------------------------------------------------------
  var RAYON_MONDE = 300;
  var ANGLE_OR = Math.PI * (3 - Math.sqrt(5));

  function pointsSurSphere(n, i) {
    // i-ème point d'une répartition de n points sur la sphère unité.
    var y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    var rayon = Math.sqrt(Math.max(0, 1 - y * y));
    var theta = ANGLE_OR * i;
    return { x: Math.cos(theta) * rayon, y: y, z: Math.sin(theta) * rayon };
  }

  function construireMonde() {
    var index = Object.create(null);
    var ordre = [];
    FICHES.forEach(function (f) {
      var cle = normaliser(f.metier) || ' a-classer';
      if (!index[cle]) {
        index[cle] = { cle: cle, nom: f.metier || 'À classer', fiches: [] };
        ordre.push(cle);
      }
      index[cle].fiches.push(f);
    });
    var groupes = ordre.map(function (c) { return index[c]; });
    groupes.sort(function (a, b) {
      if (b.fiches.length !== a.fiches.length) { return b.fiches.length - a.fiches.length; }
      return a.nom.localeCompare(b.nom, 'fr');
    });

    var etoiles = [];
    groupes.forEach(function (g, ig) {
      var dir = pointsSurSphere(groupes.length, ig);
      // Les constellations les plus fournies siègent un peu plus près du
      // centre : le réseau a un cœur, et il se voit.
      var eloignement = RAYON_MONDE * (0.52 + 0.48 * (1 - g.fiches.length / 6));
      var centre = {
        x: dir.x * eloignement, y: dir.y * eloignement * 0.72, z: dir.z * eloignement
      };
      var n = g.fiches.length;
      var rayonAmas = 26 + Math.sqrt(n) * 20;
      g.centre = centre;
      g.fiches.forEach(function (f, k) {
        var p = pointsSurSphere(Math.max(n, 2), k);
        // Rayon modulé pour occuper un VOLUME, pas une coquille creuse.
        var rr = rayonAmas * (0.55 + 0.45 * ((k * 7 % 11) / 10));
        etoiles.push({
          fiche: f, groupe: g,
          x: centre.x + p.x * rr,
          y: centre.y + p.y * rr,
          z: centre.z + p.z * rr
        });
      });
    });
    return { groupes: groupes, etoiles: etoiles };
  }

  var MONDE = construireMonde();
  var PAR_ID = Object.create(null);
  MONDE.etoiles.forEach(function (e) { PAR_ID[e.fiche.id] = e; });

  // Magnitude : le poids dans le réseau (relations + personnes rattachées).
  var MAGS = (function () {
    var m = Object.create(null);
    FICHES.forEach(function (f) { m[f.id] = 0; });
    RELATIONS.forEach(function (r) {
      if (m[r.source] !== undefined) { m[r.source] += 1; }
      if (m[r.cible] !== undefined) { m[r.cible] += 1; }
    });
    PERSONNES.forEach(function (p) {
      p.rattachements.forEach(function (r) { if (m[r.fiche] !== undefined) { m[r.fiche] += 1; } });
    });
    return m;
  })();
  var MAG_MAX = (function () {
    var max = 1;
    Object.keys(MAGS).forEach(function (k) { if (MAGS[k] > max) { max = MAGS[k]; } });
    return max;
  })();

  // ------------------------------------------------------------------
  // 2. LA CAMÉRA. Deux angles et une distance — c'est tout ce qu'il faut.
  // ------------------------------------------------------------------
  // Distance de départ : assez près pour que le réseau REMPLISSE le champ. À
  // 780 le monde flottait au loin, au milieu d'un écran vide — on regardait
  // une maquette au lieu d'être dedans.
  var cam = {
    yaw: 0.6, pitch: -0.28, distance: 0,
    cibleYaw: 0.6, ciblePitch: -0.28, cibleDistance: 0
  };
  // Zoom de Paul, en FACTEUR et non en distance absolue : il survit ainsi à
  // un changement de cadre (ouverture du panneau, rotation du téléphone)
  // au lieu d'être écrasé par le recalcul.
  var zoomUtilisateur = 1;
  var FOCALE = 620;
  var ZOOM_MIN = 0.55, ZOOM_MAX = 1.9;

  // La bonne distance ne se choisit pas une fois pour toutes : elle se DÉDUIT
  // du cadre. À la distance D, la demi-hauteur visible vaut (cadre/2)·(D/FOCALE) ;
  // pour que le monde entier tienne, il faut D ≥ RAYON_MONDE·FOCALE·2/cadre.
  // Une constante confortable sur un large écran fait sortir la moitié du
  // réseau du champ sur un téléphone — constaté sur un écran de 390 px, où
  // l'étoile visée n'était tout simplement plus dessinée.
  function distanceIdeale() {
    var cadre = Math.min(vbW, vbH);
    return Math.max(430, (RAYON_MONDE * FOCALE * 2) / Math.max(160, cadre) * 1.06);
  }

  // Projette un point du monde vers l'écran. Renvoie null s'il passe
  // derrière la caméra — un point derrière soi ne se dessine pas.
  function projeter(p, vbW, vbH) {
    var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    var x1 = p.x * cy + p.z * sy;
    var z1 = -p.x * sy + p.z * cy;
    var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    var y2 = p.y * cp - z1 * sp;
    var z2 = p.y * sp + z1 * cp;
    var profondeur = z2 + cam.distance;
    if (profondeur < 60) { return null; }
    var echelle = FOCALE / profondeur;
    return {
      sx: vbW / 2 + x1 * echelle,
      sy: vbH / 2 + y2 * echelle,
      echelle: echelle,
      profondeur: profondeur
    };
  }

  // Amène un point face à la caméra. C'est la réponse au reproche fait à
  // toute interface 3D : la tabulation ne doit pas envoyer le focus sur une
  // étoile cachée derrière le spectateur. Ici, le monde vient à elle.
  function viser(p) {
    cam.cibleYaw = Math.atan2(-p.x, p.z);
    var cy = Math.cos(cam.cibleYaw), sy = Math.sin(cam.cibleYaw);
    var z1 = -p.x * sy + p.z * cy;
    cam.ciblePitch = Math.atan2(p.y, z1 + cam.distance);
  }

  // Différence d'angles ramenée dans [-π, π] : sans quoi la caméra ferait le
  // tour du monde par le mauvais côté quand on passe de +3,1 à -3,1 rad.
  function ecartAngle(a, b) {
    var d = (a - b) % (Math.PI * 2);
    if (d > Math.PI) { d -= Math.PI * 2; }
    if (d < -Math.PI) { d += Math.PI * 2; }
    return d;
  }

  // ------------------------------------------------------------------
  // 3. ÉTAT
  // ------------------------------------------------------------------
  var etat = {
    recherche: '', types: { artisan: true, partenaire: true, lead: true, chantier: true },
    // La dérive est OFFERTE, pas imposée. Elle est belle au repos, mais une
    // étoile qui avance en permanence est une étoile qu'on vise mal — au doigt
    // comme à la souris. Par défaut le ciel est fixe et on le tourne soi-même ;
    // qui veut la vie coche la case.
    choisie: null, derive: false, brume: true, saisie: false, survol: false
  };
  var moinsDAnimation = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function correspond(f) {
    if (!etat.types[f.type]) { return false; }
    var q = normaliser(etat.recherche).trim();
    if (!q) { return true; }
    var foin = normaliser([
      f.nom, f.metier, f.ville, f.nature, f.prestations, f.zone, f.dispo,
      LIBELLES_TYPE[f.type], LIBELLES_STATUT[f.statut]
    ].join(' '));
    return q.split(/\s+/).every(function (mot) { return foin.indexOf(mot) !== -1; });
  }

  // ------------------------------------------------------------------
  // 4. CONSTRUCTION DU SVG — une seule fois. Ensuite on ne fait plus que
  //    déplacer : recréer 20 étoiles à chaque image serait absurde.
  // ------------------------------------------------------------------
  var hote = document.getElementById('scene');
  var racine = null, gPoussiere = null, gLiens = null, gEtoiles = null, gOrbites = null;
  var vbW = 900, vbH = 560;
  var pieces = [];      // une par étoile : { etoile, g, parts... }
  var piecesLien = [];  // une par relation
  var piecesOrbite = []; // une par rattachement de personne
  var poussiere = [];

  function dimensionner() {
    vbW = Math.max(320, Math.min(1240, hote.clientWidth || 900));
    vbH = vbW < 600 ? Math.round(vbW * 1.02) : Math.round(vbW * 0.56);
  }

  // Le cadre suit la largeur RÉELLE de la scène. Sans cela, l'ouverture du
  // panneau rétrécit la scène sans toucher au viewBox : tout est réduit d'un
  // quart, et la cible tactile tombe de 25,8 px à 18,7 px — mesuré, pas
  // supposé. Les positions étant recalculées à chaque image, il suffit de
  // remettre le cadre à la bonne taille ; rien n'est reconstruit.
  function ajusterCadre() {
    if (!racine) { return; }
    var avant = vbW;
    dimensionner();
    if (vbW !== avant) { racine.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH); }
    cam.cibleDistance = distanceIdeale() * zoomUtilisateur;
    if (!cam.distance) { cam.distance = cam.cibleDistance; }
  }

  function construireSvg() {
    dimensionner();
    if (racine && racine.parentNode) { racine.parentNode.removeChild(racine); }
    pieces = []; piecesLien = []; piecesOrbite = []; poussiere = [];

    racine = svg('svg', {
      'class': 'ciel', viewBox: '0 0 ' + vbW + ' ' + vbH,
      preserveAspectRatio: 'xMidYMid meet', role: 'group',
      'aria-label': 'Le réseau en trois dimensions : ' + FICHES.length +
        ' fiches réparties en ' + MONDE.groupes.length + ' constellations'
    });

    // Poussière lointaine : elle ne tourne pas avec le monde mais dérive
    // légèrement — c'est ce décalage qui donne la sensation de vide.
    gPoussiere = svg('g', { 'class': 'decor', 'aria-hidden': 'true' });
    var s = 11;
    function alea() { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }
    for (var i = 0; i < 150; i++) {
      var c = svg('circle', {
        cx: 0, cy: 0, r: (0.3 + alea() * 0.8).toFixed(2),
        fill: '#cfe0f5', opacity: (0.10 + alea() * 0.28).toFixed(2)
      });
      poussiere.push({ el: c, a: alea() * Math.PI * 2, b: alea() * Math.PI, r: 0.6 + alea() * 0.45 });
      gPoussiere.appendChild(c);
    }
    racine.appendChild(gPoussiere);

    gLiens = svg('g', {
      'class': 'liens', 'aria-hidden': 'true', stroke: '#ffffff',
      'stroke-width': '0.9', 'stroke-linecap': 'round', fill: 'none'
    });
    RELATIONS.forEach(function (r) {
      if (!PAR_ID[r.source] || !PAR_ID[r.cible]) { return; }
      var ligne = svg('line', { opacity: String(OPACITE_STATUT[r.statut] || 0.5) });
      if (MOTIFS_RELATION[r.type]) { ligne.setAttribute('stroke-dasharray', MOTIFS_RELATION[r.type]); }
      ligne.setAttribute('data-a', r.source);
      ligne.setAttribute('data-b', r.cible);
      gLiens.appendChild(ligne);
      piecesLien.push({ relation: r, el: ligne });
    });
    racine.appendChild(gLiens);

    gOrbites = svg('g', {});
    racine.appendChild(gOrbites);

    gEtoiles = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif' });
    MONDE.etoiles.forEach(function (e) {
      var f = e.fiche;
      var mag = MAGS[f.id] || 0;
      var couleur = COULEURS_TYPE[f.type] || '#dddddd';
      var g = svg('g', {
        'class': 'etoile', tabindex: '0', role: 'button', 'data-fiche-id': f.id,
        'aria-label': f.nom + ', ' + LIBELLES_TYPE[f.type] + ', ' + f.metier + ', ' +
          LIBELLES_STATUT[f.statut] + ', ' + mag + ' lien' + (mag > 1 ? 's' : '')
      });
      var titre = svg('title');
      titre.textContent = f.nom + ' — ' + LIBELLES_TYPE[f.type];
      g.appendChild(titre);
      var haloChoix = svg('circle', {
        'class': 'halo-choix', fill: 'none', stroke: '#d8bd82', 'stroke-width': '1.2'
      });
      var haloFocus = svg('circle', {
        'class': 'halo-focus', fill: 'none', stroke: '#fffaf0', 'stroke-width': '1'
      });
      var lueur = svg('circle', { fill: couleur, opacity: '0.14' });
      var branches = svg('path', { fill: couleur, opacity: '0.5' });
      var corolle = svg('circle', { fill: couleur, opacity: '0.75' });
      var coeur = svg('circle', { fill: '#fffaf0' });
      var nom = texte({
        'class': 'etoile-nom', 'text-anchor': 'middle', fill: '#e8dfc8', 'font-size': '9.5'
      }, f.nom.length > 20 ? f.nom.slice(0, 19) + '…' : f.nom);
      var zone = svg('circle', { 'class': 'zone-clic', fill: '#000000', 'fill-opacity': '0' });
      [haloChoix, haloFocus, lueur, branches, corolle, coeur, nom, zone].forEach(function (el) {
        g.appendChild(el);
      });
      gEtoiles.appendChild(g);
      pieces.push({
        etoile: e, g: g, haloChoix: haloChoix, haloFocus: haloFocus, lueur: lueur,
        branches: branches, corolle: corolle, coeur: coeur, nom: nom, zone: zone,
        mag: mag, couleur: couleur
      });
    });
    racine.appendChild(gEtoiles);

    // Les personnes en orbite : une pastille par rattachement, posée près de
    // sa fiche dans le plan de l'écran (elle suit donc l'étoile en 3D).
    PERSONNES.forEach(function (p, ip) {
      p.rattachements.forEach(function (r, k) {
        if (!PAR_ID[r.fiche]) { return; }
        var trait = svg('line', { stroke: '#f2ead6', 'stroke-width': '0.5', opacity: '0.3' });
        var g = svg('g', {
          'class': 'etoile', tabindex: '0', role: 'button',
          'aria-label': p.nom + ', ' + r.role + ' — ' + fiche(r.fiche).nom +
            (p.rattachements.length > 1 ? ', rattachée à ' + p.rattachements.length + ' fiches' : '')
        });
        var titre = svg('title');
        titre.textContent = p.nom + ' — ' + r.role;
        g.appendChild(titre);
        var halo = svg('circle', { 'class': 'halo-focus', fill: 'none', stroke: '#f2ead6', 'stroke-width': '1' });
        var pastille = svg('circle', { fill: '#f2ead6', opacity: '0.9' });
        var zone = svg('circle', { 'class': 'zone-clic', fill: '#000000', 'fill-opacity': '0' });
        g.appendChild(halo); g.appendChild(pastille); g.appendChild(zone);
        gOrbites.appendChild(trait);
        gOrbites.appendChild(g);
        piecesOrbite.push({
          ancre: r.fiche, g: g, trait: trait, halo: halo, pastille: pastille, zone: zone,
          angle: ip * 2.399963 + k * 1.9, rayon: 15 + (ip % 3) * 4
        });
      });
    });

    // Les noms de constellation, projetés depuis le centre de chaque région.
    gNomsAmas = svg('g', {
      'class': 'decor',
      'font-family': 'Georgia, "Times New Roman", serif', 'text-anchor': 'middle',
      fill: '#d8bd82', 'aria-hidden': 'true'
    });
    piecesAmas = MONDE.groupes.map(function (g) {
      var t = texte({ 'font-size': '11', 'letter-spacing': '3' }, g.nom.toUpperCase());
      gNomsAmas.appendChild(t);
      return { groupe: g, el: t };
    });
    racine.appendChild(gNomsAmas);

    brancherCiel();
    hote.appendChild(racine);
    ajusterCadre();
  }
  var gNomsAmas = null, piecesAmas = [];

  // ------------------------------------------------------------------
  // 5. LA BOUCLE — on ne touche que des attributs.
  // ------------------------------------------------------------------
  // Plancher de la zone qui reçoit le doigt, en unités de viewBox. Calibré par
  // la mesure et non au jugé : à 11, la plus petite cible tombait à 22 px, sous
  // le plancher WCAG de 24. À 12,5 elle repasse au-dessus sur les trois
  // largeurs. C'est le prix de la profondeur, et il se paie ici.
  var RAYON_CAPTATION_MIN = 12.5;
  var derniereMesure = { fps: 0, visibles: 0, cibleMin: 0, hors: 0 };
  var images = 0, dernierTop = 0, fpsCourant = 0;
  var deriveAngle = 0;

  function opaciteProfondeur(profondeur) {
    if (!etat.brume) { return 1; }
    // Loin = pâle. Bornes choisies pour que le fond du monde reste lisible.
    var t = (profondeur - (cam.distance - RAYON_MONDE)) / (2 * RAYON_MONDE);
    return Math.max(0.18, Math.min(1, 1.06 - t * 0.9));
  }

  function dessiner(horodatage) {
    // Approche douce vers la cible : la caméra glisse, elle ne saute pas.
    cam.yaw += ecartAngle(cam.cibleYaw, cam.yaw) * 0.11;
    cam.pitch += (cam.ciblePitch - cam.pitch) * 0.11;
    cam.distance += (cam.cibleDistance - cam.distance) * 0.11;

    // La dérive s'arrête dès que la main approche. Une cible qui bouge en
    // permanence est une cible qu'on rate — le harnais l'a constaté avant
    // Paul, en refusant de cliquer une étoile « jamais stable ». Le ciel vit
    // quand on le regarde, il se fige quand on agit.
    if (etat.derive && !etat.saisie && !etat.survol && !moinsDAnimation) {
      deriveAngle += 0.0009;
      cam.cibleYaw += 0.0009;
      cam.yaw += 0.0009;
    }

    var projetes = Object.create(null);
    var visibles = 0, cibleMin = Infinity, hors = 0;

    // --- Poussière : une sphère lointaine, tournée avec le monde. ---
    poussiere.forEach(function (p) {
      var d = RAYON_MONDE * 3.1 * p.r;
      var pt = {
        x: Math.cos(p.a + deriveAngle * 0.3) * Math.sin(p.b) * d,
        y: Math.cos(p.b) * d * 0.6,
        z: Math.sin(p.a + deriveAngle * 0.3) * Math.sin(p.b) * d
      };
      var pr = projeter(pt, vbW, vbH);
      if (!pr || pr.sx < 0 || pr.sx > vbW || pr.sy < 0 || pr.sy > vbH) {
        p.el.setAttribute('display', 'none');
        return;
      }
      p.el.removeAttribute('display');
      p.el.setAttribute('cx', pr.sx.toFixed(1));
      p.el.setAttribute('cy', pr.sy.toFixed(1));
    });

    // --- Étoiles ---
    pieces.forEach(function (piece) {
      var pr = projeter(piece.etoile, vbW, vbH);
      projetes[piece.etoile.fiche.id] = pr;
      if (!pr) { piece.g.setAttribute('display', 'none'); return; }
      // Hors champ : on ne dessine pas. Rien ne « déborde » d'un viewBox en
      // 3D — ce qui sort du cadre sort du champ de vision.
      if (pr.sx < -40 || pr.sx > vbW + 40 || pr.sy < -40 || pr.sy > vbH + 40) {
        piece.g.setAttribute('display', 'none');
        hors += 1;
        return;
      }
      piece.g.removeAttribute('display');
      visibles += 1;

      var rayon = (3.1 + Math.min(3.2, (piece.mag / MAG_MAX) * 3.2)) * pr.echelle * 1.05;
      rayon = Math.max(1.6, Math.min(9, rayon));
      var op = opaciteProfondeur(pr.profondeur);
      var eteinte = !correspond(piece.etoile.fiche);
      var opFinale = eteinte ? op * 0.14 : op;

      piece.g.setAttribute('opacity', opFinale.toFixed(3));
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
      // une fiche lointaine reste atteignable. Sans ce plancher, la 3D rend
      // la moitié du réseau intouchable — c'est le coût caché de la
      // profondeur, et il se corrige ici.
      var rZone = Math.max(RAYON_CAPTATION_MIN, rayon * 2.4);
      piece.zone.setAttribute('cx', x); piece.zone.setAttribute('cy', y);
      piece.zone.setAttribute('r', rZone.toFixed(2));
      if (rZone < cibleMin) { cibleMin = rZone; }

      // Le nom : seulement au premier plan, sinon le vide devient un mur de
      // texte — le reproche fait à la boussole VRANESH le 01/08.
      var proche = pr.profondeur < cam.distance - RAYON_MONDE * 0.25;
      piece.nom.setAttribute('x', x);
      piece.nom.setAttribute('y', (y + rayon * 3.6 + 9).toFixed(1));
      piece.nom.setAttribute('font-size', Math.max(7.5, 10 * pr.echelle).toFixed(1));
      piece.nom.setAttribute('opacity', proche && !eteinte ? '0.82' : '0');
    });

    // --- Liens ---
    piecesLien.forEach(function (pl) {
      var a = projetes[pl.relation.source], b = projetes[pl.relation.cible];
      if (!a || !b) { pl.el.setAttribute('display', 'none'); return; }
      pl.el.removeAttribute('display');
      pl.el.setAttribute('x1', a.sx.toFixed(1)); pl.el.setAttribute('y1', a.sy.toFixed(1));
      pl.el.setAttribute('x2', b.sx.toFixed(1)); pl.el.setAttribute('y2', b.sy.toFixed(1));
      var opBase = OPACITE_STATUT[pl.relation.statut] || 0.5;
      var opProf = opaciteProfondeur((a.profondeur + b.profondeur) / 2);
      pl.el.setAttribute('opacity', (opBase * opProf).toFixed(3));
      pl.el.setAttribute('stroke-width', (0.55 + 0.75 * ((a.echelle + b.echelle) / 2)).toFixed(2));
    });

    // --- Personnes en orbite ---
    piecesOrbite.forEach(function (po) {
      var a = projetes[po.ancre];
      if (!a) { po.g.setAttribute('display', 'none'); po.trait.setAttribute('display', 'none'); return; }
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
      po.zone.setAttribute('r', '8');
    });

    // --- Noms de constellation ---
    piecesAmas.forEach(function (pa) {
      var pr = projeter(pa.groupe.centre, vbW, vbH);
      if (!pr || pr.sx < 30 || pr.sx > vbW - 30 || pr.sy < 20 || pr.sy > vbH - 20) {
        pa.el.setAttribute('opacity', '0');
        return;
      }
      // Seuls les noms de la MOITIÉ AVANT s'affichent. Les dix constellations
      // annoncées à la fois se chevauchaient en profondeur — un nom lointain
      // vient se poser sur une étoile proche. Ce qui est derrière se tait ;
      // il suffit de tourner pour le faire parler.
      if (pr.profondeur > cam.distance) { pa.el.setAttribute('opacity', '0'); return; }
      var op = opaciteProfondeur(pr.profondeur);
      pa.el.setAttribute('x', pr.sx.toFixed(1));
      pa.el.setAttribute('y', (pr.sy - 38 * pr.echelle - 12).toFixed(1));
      pa.el.setAttribute('font-size', Math.max(8, 12 * pr.echelle).toFixed(1));
      pa.el.setAttribute('opacity', (op * 0.85).toFixed(3));
    });

    // --- Ordre de rendu : les proches par-dessus les lointaines. On ne
    //     réordonne que si la caméra a bougé — pas à chaque image pour rien.
    if (imagesDepuisTri > 6) {
      imagesDepuisTri = 0;
      var triables = pieces.slice().filter(function (p) { return projetes[p.etoile.fiche.id]; });
      triables.sort(function (a, b) {
        return projetes[b.etoile.fiche.id].profondeur - projetes[a.etoile.fiche.id].profondeur;
      });
      triables.forEach(function (p) { gEtoiles.appendChild(p.g); });
    }
    imagesDepuisTri += 1;

    // --- Compteur d'images par seconde ---
    images += 1;
    if (!dernierTop) { dernierTop = horodatage; }
    if (horodatage - dernierTop >= 1000) {
      fpsCourant = Math.round((images * 1000) / (horodatage - dernierTop));
      images = 0; dernierTop = horodatage;
      derniereMesure = {
        fps: fpsCourant, visibles: visibles,
        cibleMin: cibleMin === Infinity ? 0 : cibleMin, hors: hors
      };
      majMesure();
    }
    requestAnimationFrame(dessiner);
  }
  var imagesDepuisTri = 99;

  // ------------------------------------------------------------------
  // 6. INTERACTIONS
  // ------------------------------------------------------------------
  function brancherCiel() {
    var vifs = [];
    function eteindre() {
      vifs.forEach(function (t) { t.classList.remove('lien--vif'); });
      vifs = [];
      racine.classList.remove('ciel--concentre');
    }
    function allumer(cible) {
      var etoile = cible && cible.closest ? cible.closest('[data-fiche-id]') : null;
      if (!etoile) { eteindre(); return; }
      eteindre();
      var id = etoile.getAttribute('data-fiche-id');
      var liens = racine.querySelectorAll(
        '.liens line[data-a="' + id + '"], .liens line[data-b="' + id + '"]');
      Array.prototype.forEach.call(liens, function (t) {
        t.classList.add('lien--vif'); vifs.push(t);
      });
      racine.classList.add('ciel--concentre');
    }
    racine.addEventListener('mouseover', function (e) { allumer(e.target); });
    racine.addEventListener('mouseleave', eteindre);
    racine.addEventListener('focusin', function (e) {
      allumer(e.target);
      // Le focus clavier RAMÈNE l'étoile face à la caméra : sans cela, Tab
      // enverrait le focus derrière le spectateur, sur une étoile invisible.
      var g = e.target.closest ? e.target.closest('[data-fiche-id]') : null;
      if (g && PAR_ID[g.getAttribute('data-fiche-id')]) {
        viser(PAR_ID[g.getAttribute('data-fiche-id')]);
      }
    });
    racine.addEventListener('focusout', eteindre);
    racine.addEventListener('click', function (e) {
      if (aGlisse) { return; } // un glissement n'ouvre pas une fiche
      var g = e.target.closest ? e.target.closest('[data-fiche-id]') : null;
      if (g) { ouvrirFiche(g.getAttribute('data-fiche-id')); }
    });
    racine.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') { return; }
      var g = e.target.closest ? e.target.closest('[data-fiche-id]') : null;
      if (g) { e.preventDefault(); ouvrirFiche(g.getAttribute('data-fiche-id')); }
    });
  }

  var saisie = null, aGlisse = false;
  hote.addEventListener('pointerenter', function () { etat.survol = true; });
  hote.addEventListener('pointerleave', function () { if (!saisie) { etat.survol = false; } });
  hote.addEventListener('pointerdown', function (e) {
    saisie = { x: e.clientX, y: e.clientY, yaw: cam.cibleYaw, pitch: cam.ciblePitch,
      pointeur: e.pointerId, capture: false };
    aGlisse = false;
    etat.saisie = true;
    hote.classList.add('scene--saisie');
    // PAS de setPointerCapture ici : capturer dès l'appui redirige le `click`
    // vers la scène, si bien que l'écouteur du SVG ne le reçoit jamais et
    // qu'aucune étoile ne s'ouvre. La capture n'est prise qu'une fois le
    // glissement engagé — là où elle sert vraiment.
  });
  hote.addEventListener('pointermove', function (e) {
    if (!saisie) { return; }
    var dx = e.clientX - saisie.x, dy = e.clientY - saisie.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      aGlisse = true;
      // C'est maintenant que la capture sert : le doigt peut sortir de la
      // scène sans que la rotation se bloque en route.
      if (!saisie.capture && hote.setPointerCapture) {
        try { hote.setPointerCapture(saisie.pointeur); saisie.capture = true; } catch (err) { /* sans capture, on tourne quand même */ }
      }
      var aide = document.getElementById('aide-navigation');
      if (aide) { aide.classList.add('effacee'); }
    }
    cam.cibleYaw = saisie.yaw + dx * 0.006;
    // Le pitch est BORNÉ : au-delà, on passe par-dessus le pôle et le monde
    // se retourne — on ne perd jamais le haut et le bas.
    cam.ciblePitch = Math.max(-1.15, Math.min(1.15, saisie.pitch + dy * 0.005));
  });
  function relacher() {
    saisie = null; etat.saisie = false;
    hote.classList.remove('scene--saisie');
    window.setTimeout(function () { aGlisse = false; }, 0);
  }
  hote.addEventListener('pointerup', relacher);
  hote.addEventListener('pointercancel', relacher);
  hote.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomUtilisateur = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
      zoomUtilisateur + e.deltaY * 0.0011));
    cam.cibleDistance = distanceIdeale() * zoomUtilisateur;
  }, { passive: false });

  // ------------------------------------------------------------------
  // 7. PANNEAU DE FICHE — identique en esprit à la voûte à plat : le rendu
  //    change, pas ce qu'on vient chercher.
  // ------------------------------------------------------------------
  function ligneChamp(dl, libelle, valeur) {
    if (!valeur && valeur !== 0) { return; }
    var d = document.createElement('div');
    d.className = 'champ';
    var dt = document.createElement('dt'); dt.textContent = libelle;
    var dd = document.createElement('dd'); dd.textContent = valeur;
    d.appendChild(dt); d.appendChild(dd);
    dl.appendChild(d);
  }
  function section(hoteEl, titre) {
    var s = document.createElement('section');
    s.className = 'section';
    var h = document.createElement('h3'); h.textContent = titre;
    s.appendChild(h); hoteEl.appendChild(s);
    return s;
  }
  function signaler(quoi) {
    window.alert('Maquette — « ' + quoi + ' » sera le sujet de la boucle suivante.');
  }

  function ouvrirFiche(id) {
    var f = fiche(id);
    if (!f) { return; }
    etat.choisie = id;
    pieces.forEach(function (p) {
      p.g.classList.toggle('etoile--choisie', p.etoile.fiche.id === id);
    });
    if (PAR_ID[id]) { viser(PAR_ID[id]); }

    var panneau = document.getElementById('panneau');
    panneau.hidden = false;
    document.getElementById('corps').classList.add('corps--panneau-ouvert');
    panneau.textContent = '';
    ajusterCadre();

    var tete = document.createElement('div');
    tete.className = 'panneau-tete';
    var h2 = document.createElement('h2');
    h2.textContent = f.nom; h2.tabIndex = -1;
    var fermer = document.createElement('button');
    fermer.type = 'button'; fermer.className = 'fermer';
    fermer.setAttribute('aria-label', 'Fermer la fiche');
    fermer.textContent = '×';
    fermer.addEventListener('click', fermerFiche);
    tete.appendChild(h2); tete.appendChild(fermer);
    panneau.appendChild(tete);

    var badges = document.createElement('div');
    badges.className = 'badges';
    [[LIBELLES_TYPE[f.type], COULEURS_TYPE[f.type]], [LIBELLES_STATUT[f.statut], null],
      [f.metier, null]].forEach(function (b) {
      var el = document.createElement('span');
      el.className = 'badge';
      if (b[1]) { el.style.color = b[1]; el.style.borderColor = 'currentColor'; }
      el.textContent = b[0];
      badges.appendChild(el);
    });
    panneau.appendChild(badges);

    var s1 = section(panneau, 'Ce qu’ils font');
    var dl = document.createElement('dl');
    dl.style.margin = '0';
    ligneChamp(dl, 'Nature', f.nature);
    ligneChamp(dl, 'Prestations', f.prestations);
    ligneChamp(dl, 'Zone', f.zone);
    ligneChamp(dl, 'Ville', f.ville);
    if (f.effectif) { ligneChamp(dl, 'Effectif', f.effectif + ' personnes'); }
    ligneChamp(dl, 'Disponibilité', f.dispo);
    s1.appendChild(dl);

    var s2 = section(panneau, 'Qui y travaille');
    var gens = personnesDe(f.id);
    if (!gens.length) {
      var v = document.createElement('p');
      v.className = 'vide';
      v.textContent = 'Personne n’est encore rattaché à cette fiche.';
      s2.appendChild(v);
    } else {
      var ul = document.createElement('ul');
      ul.className = 'liste';
      gens.forEach(function (item) {
        var li = document.createElement('li');
        var nom = document.createElement('span');
        nom.textContent = item.personne.nom;
        var role = document.createElement('span');
        role.className = 'role';
        var autres = item.personne.rattachements.length - 1;
        role.textContent = item.role +
          (autres > 0 ? ' — et ' + autres + ' autre fiche' : '');
        li.appendChild(nom); li.appendChild(role);
        ul.appendChild(li);
      });
      s2.appendChild(ul);
    }
    var a2 = document.createElement('div');
    a2.className = 'actions';
    var bRatt = document.createElement('button');
    bRatt.type = 'button'; bRatt.className = 'bouton';
    bRatt.textContent = 'Rattacher une personne';
    bRatt.addEventListener('click', function () { signaler('Rattacher une personne'); });
    a2.appendChild(bRatt);
    s2.appendChild(a2);

    var s3 = section(panneau, 'Avec qui ils travaillent');
    var rels = relationsDe(f.id);
    if (!rels.length) {
      var v3 = document.createElement('p');
      v3.className = 'vide';
      v3.textContent = 'Aucun rapprochement pour l’instant.';
      s3.appendChild(v3);
    } else {
      var ul3 = document.createElement('ul');
      ul3.className = 'liste';
      rels.forEach(function (r) {
        var autreId = r.source === f.id ? r.cible : r.source;
        var autre = fiche(autreId);
        var li = document.createElement('li');
        var nom = document.createElement('span');
        nom.textContent = autre ? autre.nom : '(inconnu)';
        var et = document.createElement('span');
        et.className = 'etat';
        et.textContent = LIBELLES_RELATION[r.type] + ' · ' + LIBELLES_STATUT_RELATION[r.statut];
        var voir = document.createElement('button');
        voir.type = 'button';
        voir.textContent = 'voler jusqu’à';
        voir.addEventListener('click', function () { ouvrirFiche(autreId); });
        li.appendChild(nom); li.appendChild(et); li.appendChild(voir);
        ul3.appendChild(li);
      });
      s3.appendChild(ul3);
    }
    var a3 = document.createElement('div');
    a3.className = 'actions';
    ['Créer une relation', 'Modifier la fiche'].forEach(function (libelle) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bouton';
      b.textContent = libelle;
      b.addEventListener('click', function () { signaler(libelle); });
      a3.appendChild(b);
    });
    s3.appendChild(a3);

    var note = document.createElement('p');
    note.className = 'note-maquette';
    note.textContent = 'Maquette : « voler jusqu’à » fait pivoter le ciel vers ' +
      'l’autre fiche — c’est ce que la 3D permet et que la vue à plat ne pouvait pas. ' +
      'Les boutons d’action, eux, ne font encore rien.';
    panneau.appendChild(note);

    h2.focus();
  }

  function fermerFiche() {
    etat.choisie = null;
    pieces.forEach(function (p) { p.g.classList.remove('etoile--choisie'); });
    var panneau = document.getElementById('panneau');
    panneau.hidden = true;
    panneau.textContent = '';
    document.getElementById('corps').classList.remove('corps--panneau-ouvert');
    ajusterCadre();
  }

  // ------------------------------------------------------------------
  // 8. BARRE D'OUTILS ET MESURE
  // ------------------------------------------------------------------
  function construireFiltres() {
    var hoteF = document.getElementById('filtres');
    hoteF.textContent = '';
    Object.keys(LIBELLES_TYPE).forEach(function (t) {
      var l = document.createElement('label');
      l.className = 'filtre';
      var c = document.createElement('input');
      c.type = 'checkbox'; c.checked = etat.types[t];
      c.addEventListener('change', function () { etat.types[t] = c.checked; majCompte(); });
      var pastille = document.createElement('span');
      pastille.className = 'pastille';
      pastille.style.background = COULEURS_TYPE[t];
      var txt = document.createElement('span');
      txt.textContent = LIBELLES_TYPE[t];
      l.appendChild(c); l.appendChild(pastille); l.appendChild(txt);
      hoteF.appendChild(l);
    });
  }

  function majCompte() {
    var visibles = FICHES.filter(correspond).length;
    var libres = PERSONNES.filter(function (p) { return p.rattachements.length === 0; }).length;
    var el = document.getElementById('compte');
    el.textContent = '';
    var b = document.createElement('b');
    b.textContent = visibles + ' / ' + FICHES.length;
    el.appendChild(b);
    el.appendChild(document.createTextNode(
      ' fiches · ' + PERSONNES.length + ' personnes' +
      (libres ? ' (dont ' + libres + ' sans fiche)' : '') +
      ' · ' + RELATIONS.length + ' relations'));
  }

  function majMesure() {
    var cible = document.getElementById('mesure');
    if (!cible) { return; }
    var largeurAffichee = racine.getBoundingClientRect().width;
    var pxParUnite = largeurAffichee / vbW;
    var ciblePx = derniereMesure.cibleMin * 2 * pxParUnite;
    cible.textContent = '';
    function ligne(libelle, valeur, classe) {
      var d = document.createElement('div');
      var l = document.createElement('span');
      l.textContent = libelle + ' : ';
      var v = document.createElement('b');
      if (classe) { v.className = classe; }
      v.textContent = valeur;
      d.appendChild(l); d.appendChild(v);
      cible.appendChild(d);
    }
    ligne('Images par seconde', derniereMesure.fps + ' i/s',
      derniereMesure.fps >= 50 ? 'verdict-ok' : (derniereMesure.fps >= 30 ? '' : 'verdict-ko'));
    ligne('Étoiles dans le champ', derniereMesure.visibles + ' sur ' + FICHES.length +
      (derniereMesure.hors ? ' (' + derniereMesure.hors + ' hors champ)' : ''));
    ligne('Plus petite cible tactile', ciblePx.toFixed(1) + ' px (plancher 24 px)',
      ciblePx >= 24 ? 'verdict-ok' : 'verdict-ko');
    ligne('Éléments animés', (pieces.length + piecesLien.length + piecesOrbite.length +
      poussiere.length) + ' (aucune bibliothèque chargée)');
    var p = document.createElement('p');
    p.textContent = ciblePx >= 24
      ? 'La zone qui reçoit le doigt ne rétrécit pas autant que l’étoile : même au ' +
        'fond du vide, une fiche reste atteignable.'
      : 'Une étoile lointaine passe sous le plancher tactile : c’est le coût de la ' +
        'profondeur, à corriger en relevant le plancher de captation.';
    cible.appendChild(p);
  }

  document.getElementById('recherche').addEventListener('input', function (e) {
    etat.recherche = e.target.value;
    majCompte();
  });
  document.getElementById('opt-derive').addEventListener('change', function (e) {
    etat.derive = e.target.checked;
  });
  document.getElementById('opt-brume').addEventListener('change', function (e) {
    etat.brume = e.target.checked;
  });
  ['bouton-plat', 'bouton-arbre', 'bouton-ajouter'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () {
      signaler(document.getElementById(id).textContent);
    });
  });

  var minuteur = null;
  window.addEventListener('resize', function () {
    if (minuteur) { window.clearTimeout(minuteur); }
    minuteur = window.setTimeout(function () { construireSvg(); }, 160);
  });

  construireFiltres();
  majCompte();
  construireSvg();
  requestAnimationFrame(dessiner);
})();
