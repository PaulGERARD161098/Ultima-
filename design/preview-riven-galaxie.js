// Script de la preview « preview-riven-galaxie ».
// FICHIER SÉPARÉ, ET C'EST LA RAISON D'ÊTRE DE CE COMMENTAIRE : la CSP
// d'Ultima pose `script-src 'self'` SANS 'unsafe-inline'. Un <script> en
// ligne est donc silencieusement bloqué en preview Vercel — la page s'affiche,
// stylée, et reste vide. Même motif que preview-draukhain-carto.js.

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ------------------------------------------------------------------
  // 0. Générateur déterministe. Pas de Math.random : même graine, même
  //    ciel, à chaque ouverture. C'est la règle du layout d'arbre (A3),
  //    elle vaut pour la voûte.
  // ------------------------------------------------------------------
  function graine(s) {
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var TYPES = ['artisan', 'partenaire', 'lead', 'chantier'];
  var LIBELLES_TYPE = {
    artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier'
  };
  var COULEURS_TYPE = {
    artisan: '#f2a15a', partenaire: '#7cb8ea', lead: '#6fd39b', chantier: '#b995e8'
  };
  var METIERS = [
    'Plomberie', 'Électricité', 'Maçonnerie', 'Charpente', 'Peinture',
    'Menuiserie', 'Couverture', 'Terrassement', 'Chauffage', 'Carrelage'
  ];
  var ZONES = ['Paris intra-muros', 'Petite couronne', 'Grande couronne', 'Province'];
  var RACINES = [
    'Roux', 'Vasseur', 'Delmas', 'Vanneau', 'Aubry', 'Perrin', 'Lombard', 'Cazaux',
    'Marchal', 'Belin', 'Thibault', 'Estève', 'Nadaud', 'Gauthier', 'Sorel', 'Rimbaud',
    'Chastel', 'Vergne', 'Brossard', 'Meunier', 'Tissot', 'Chapron', 'Faure', 'Osmond'
  ];
  var FORMES = ['SARL ', 'Atelier ', 'Ets ', '', 'Maison ', ''];
  var SUFFIXES = [' & Fils', '', '', ' SAS', '', ' Frères'];
  var PRENOMS = ['Godefroy', 'Mathilde', 'Armand', 'Solène', 'Bastien', 'Irène', 'Côme', 'Léonie'];
  var TYPES_RELATION = ['apport_affaires', 'sous_traitance', 'chantier_commun'];
  var LIBELLES_RELATION = {
    apport_affaires: "Apport d'affaires",
    sous_traitance: 'Sous-traitance',
    chantier_commun: 'Chantier commun'
  };
  // Le TYPE est porté par le motif du trait — pas par la couleur : les liens
  // sont blancs (demande de Paul). Double codage conservé (§ arbitrage ④).
  var MOTIFS_RELATION = {
    apport_affaires: null, sous_traitance: '7 5', chantier_commun: '1.5 5'
  };
  var STATUTS_RELATION = ['idee', 'contact_etabli', 'en_cours', 'fructueux'];
  // L'AVANCEMENT est porté par l'intensité : une idée est pâle, un
  // rapprochement fructueux brille.
  var OPACITE_STATUT = { idee: 0.22, contact_etabli: 0.42, en_cours: 0.62, fructueux: 0.92 };
  var LIBELLES_STATUT_RELATION = {
    idee: 'Idée', contact_etabli: 'Contact établi', en_cours: 'En cours', fructueux: 'Fructueux'
  };

  // ------------------------------------------------------------------
  // 1. Un jeu de données inventé, stable pour un volume donné.
  // ------------------------------------------------------------------
  function fabriquerDonnees(volume) {
    var r = graine(20260811 + volume);
    var fiches = [];
    var i;
    for (i = 0; i < volume; i++) {
      var nom = FORMES[Math.floor(r() * FORMES.length)] +
        RACINES[i % RACINES.length] +
        SUFFIXES[Math.floor(r() * SUFFIXES.length)];
      fiches.push({
        id: 'f' + i,
        nom: nom,
        type: TYPES[Math.floor(r() * TYPES.length)],
        metier: METIERS[Math.floor(r() * Math.min(METIERS.length, 3 + Math.floor(volume / 9)))],
        zone: ZONES[Math.floor(r() * ZONES.length)]
      });
    }
    // Personnes : certaines rattachées à deux fiches (le cas qui compte).
    var personnes = [];
    var nbPersonnes = Math.max(2, Math.round(volume * 0.45));
    for (i = 0; i < nbPersonnes; i++) {
      var att = [fiches[Math.floor(r() * fiches.length)].id];
      if (r() < 0.22 && fiches.length > 1) {
        var second = fiches[Math.floor(r() * fiches.length)].id;
        if (second !== att[0]) { att.push(second); }
      }
      personnes.push({
        id: 'p' + i,
        nom: PRENOMS[i % PRENOMS.length] + ' ' + RACINES[(i * 5) % RACINES.length].charAt(0) + '.',
        fiches: att
      });
    }
    // Relations : des rapprochements, souvent d'une constellation à l'autre.
    var relations = [];
    var nbRelations = Math.max(2, Math.round(volume * 0.55));
    for (i = 0; i < nbRelations; i++) {
      var a = fiches[Math.floor(r() * fiches.length)];
      var b = fiches[Math.floor(r() * fiches.length)];
      if (!a || !b || a.id === b.id) { continue; }
      relations.push({
        id: 'r' + i,
        source: a.id,
        cible: b.id,
        type: TYPES_RELATION[Math.floor(r() * TYPES_RELATION.length)],
        statut: STATUTS_RELATION[Math.floor(r() * STATUTS_RELATION.length)]
      });
    }
    return { fiches: fiches, personnes: personnes, relations: relations };
  }

  // ------------------------------------------------------------------
  // 2. Regroupement en constellations. Même règle que l'arbre : la valeur
  //    normalisée fait le groupe, la première graphie fait le nom, le
  //    sans-valeur est regroupé à part et passe en dernier.
  // ------------------------------------------------------------------
  function normaliser(t) {
    return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function grouper(fiches, critere) {
    var index = Object.create(null);
    var ordre = [];
    fiches.forEach(function (f) {
      var brut = (critere === 'zone' ? f.zone : f.metier) || '';
      var cle = brut ? normaliser(brut) : ' a-classer';
      if (!index[cle]) {
        index[cle] = { cle: cle, nom: brut || 'À classer', fiches: [] };
        ordre.push(cle);
      }
      index[cle].fiches.push(f);
    });
    var groupes = ordre.map(function (c) { return index[c]; });
    groupes.sort(function (a, b) {
      if (a.cle === ' a-classer') { return 1; }
      if (b.cle === ' a-classer') { return -1; }
      if (b.fiches.length !== a.fiches.length) { return b.fiches.length - a.fiches.length; }
      return a.nom.localeCompare(b.nom, 'fr');
    });
    groupes.forEach(function (g) {
      g.fiches.sort(function (x, y) { return (x.nom || '').localeCompare(y.nom || '', 'fr'); });
    });
    return groupes;
  }

  // ------------------------------------------------------------------
  // 3. Layouts. Purs : mêmes données + même largeur => mêmes coordonnées.
  //    Aucune lecture du DOM, aucun aléa. Testables seuls.
  // ------------------------------------------------------------------
  var R_ETOILE_MIN = 3.2;   // rayon de base d'une étoile (magnitude 0)
  // Distance minimale entre deux étoiles. Calibrée par la MESURE, pas par le
  // goût : à 26 u la cible tactile tombait à 20,8 px, sous le plancher WCAG de
  // 24 px. À 34 u elle repasse au-dessus. Le chiffre vient du panneau Mesure.
  var ESPACE_MIN = 34;
  // Rayon de la zone qui reçoit le doigt : borné à 40 % de l'écart minimal,
  // donc deux disques voisins ne se touchent jamais. Sa traduction en pixels
  // réels est MESURÉE à l'écran (panneau Mesure) — c'est elle qui décide si
  // le ciel est utilisable au pouce, pas l'impression qu'il en donne.
  var RAYON_CAPTATION = ESPACE_MIN * 0.4;

  // Rayon d'un amas contenant n étoiles, tel que l'espacement moyen tienne.
  function rayonAmas(n) {
    if (n <= 1) { return 0; }
    return Math.max(30, Math.sqrt(n) * ESPACE_MIN * 0.62);
  }

  // Spirale de Vogel : l'angle d'or répartit n points sans trou ni paquet.
  // Déterministe, et c'est ce qui donne au groupe son allure d'amas stellaire.
  function positionsAmas(n, R) {
    var pts = [];
    var ANGLE_OR = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var rr = R * Math.sqrt((i + 0.5) / n);
      var th = i * ANGLE_OR;
      pts.push({ x: Math.cos(th) * rr, y: Math.sin(th) * rr * 0.82 });
    }
    return pts;
  }

  // --- Disposition VOÛTE : les constellations en mosaïque, sur toute la
  //     largeur. Paliers en escalier comme l'arbre (A3) : plus l'écran est
  //     large, plus le ciel prend de colonnes — jamais une colonne centrale
  //     avec deux tiers de vide de chaque côté. Le pouce fait défiler. ---
  var MARGE_X = 24;
  var HAUT = 46;
  var H_NOM = 46;          // nom + sous-titre de la constellation, AU-DESSUS
  // Place réservée sous l'amas au nom de la fiche la plus basse : l'étoile la
  // plus basse est à cy+ry, son nom ~32 u plus bas. Mesuré, pas estimé.
  var MARGE_BAS = 38;
  var ESP_V = 26;          // entre deux rangées de constellations

  function colonnesVoute(vbW) {
    if (vbW >= 1040) { return 3; }
    if (vbW >= 760) { return 2; }
    return 1;
  }

  function layoutVoute(groupes, largeurCible) {
    // Le viewBox SUIT la largeur réelle : une unité vaut à peu près un pixel.
    // Un plancher à 620 (hérité des paliers de l'arbre) écrasait tout de 42 %
    // sur un téléphone de 390 px et ramenait la cible tactile à 15,6 px —
    // mesuré, pas supposé. Le ciel n'a pas de largeur intrinsèque à préserver.
    var vbW = Math.max(320, Math.min(1240, largeurCible || 900));
    var cols = colonnesVoute(vbW);
    var cellW = (vbW - 2 * MARGE_X) / cols;

    // Chaque constellation devient un bloc mesuré AVANT d'être posé : on
    // connaît sa hauteur, donc la rangée connaît la sienne. Zéro chevauchement
    // par construction, pas par espoir.
    var blocs = groupes.map(function (g) {
      var n = g.fiches.length;
      var rx = Math.min(rayonAmas(n), cellW / 2 - 16);
      var ry = rx * 0.82;
      return { groupe: g, rx: rx, ry: ry, hauteur: H_NOM + 2 * ry + MARGE_BAS };
    });

    var y = HAUT;
    var amas = [];
    for (var i = 0; i < blocs.length; i += cols) {
      var rangee = blocs.slice(i, i + cols);
      var hRangee = rangee.reduce(function (m, b) { return Math.max(m, b.hauteur); }, 0);
      rangee.forEach(function (b, k) {
        var cx = MARGE_X + k * cellW + cellW / 2;
        var cy = y + H_NOM + b.ry;
        var pts = positionsAmas(b.groupe.fiches.length, b.rx).map(function (p, j) {
          return { fiche: b.groupe.fiches[j], x: cx + p.x, y: cy + p.y };
        });
        amas.push({
          groupe: b.groupe, nomY: y + 16, cx: cx, cy: cy,
          rx: b.rx, ry: b.ry, etoiles: pts
        });
      });
      y += hRangee + ESP_V;
    }
    return { vbW: vbW, vbH: Math.max(320, y + 6), amas: amas };
  }

  // --- Disposition GALAXIE : les constellations enroulées autour d'un noyau. ---
  function layoutGalaxie(groupes, largeurCible) {
    // Le viewBox SUIT la largeur réelle : une unité vaut à peu près un pixel.
    // Un plancher à 620 (hérité des paliers de l'arbre) écrasait tout de 42 %
    // sur un téléphone de 390 px et ramenait la cible tactile à 15,6 px —
    // mesuré, pas supposé. Le ciel n'a pas de largeur intrinsèque à préserver.
    var vbW = Math.max(320, Math.min(1240, largeurCible || 900));
    var vbH = Math.round(vbW * 0.72);
    var cx = vbW / 2, cy = vbH / 2;
    var n = groupes.length;
    var amas = groupes.map(function (g, i) {
      var R = rayonAmas(g.fiches.length);
      // Bras spiral : l'angle avance, le rayon croît — le plus fourni au coeur.
      var t = n <= 1 ? 0 : i / (n - 1);
      var angle = i * 2.399963 + 0.6;               // angle d'or, en radians
      var dist = (Math.min(vbW, vbH) * 0.13) + t * (Math.min(vbW, vbH) * 0.33);
      var gx = cx + Math.cos(angle) * dist;
      var gy = cy + Math.sin(angle) * dist * 0.78;
      var pts = positionsAmas(g.fiches.length, R).map(function (p, k) {
        return { fiche: g.fiches[k], x: gx + p.x, y: gy + p.y };
      });
      return {
        groupe: g, nomY: gy - R * 0.82 - 10, cx: gx, cy: gy,
        rx: R, ry: R * 0.82, etoiles: pts
      };
    });
    return { vbW: vbW, vbH: vbH, amas: amas, noyau: { x: cx, y: cy } };
  }

  // --- Figure de constellation : l'arbre couvrant minimal des étoiles de
  //     l'amas. C'est exactement ainsi qu'on relie les étoiles d'une figure :
  //     chacune à sa plus proche voisine déjà reliée. Déterministe. ---
  function figure(etoiles) {
    if (etoiles.length < 2) { return []; }
    var dedans = [0];
    var dehors = [];
    var i;
    for (i = 1; i < etoiles.length; i++) { dehors.push(i); }
    var segments = [];
    while (dehors.length) {
      var meilleur = null;
      dedans.forEach(function (a) {
        dehors.forEach(function (b, kb) {
          var dx = etoiles[a].x - etoiles[b].x;
          var dy = etoiles[a].y - etoiles[b].y;
          var d = dx * dx + dy * dy;
          if (!meilleur || d < meilleur.d) { meilleur = { a: a, b: b, kb: kb, d: d }; }
        });
      });
      segments.push([meilleur.a, meilleur.b]);
      dedans.push(meilleur.b);
      dehors.splice(meilleur.kb, 1);
    }
    return segments;
  }

  // ------------------------------------------------------------------
  // 4. Rendu SVG. createElementNS + textContent uniquement — jamais
  //    innerHTML : c'est la règle de production, la maquette la respecte
  //    pour préfigurer le code, pas pour faire joli.
  // ------------------------------------------------------------------
  function svg(nom, attrs) {
    var el = document.createElementNS(SVG_NS, nom);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }
  function texte(attrs, contenu) {
    var t = svg('text', attrs);
    t.textContent = contenu;
    return t;
  }

  // Magnitude : le poids du contact dans le réseau (relations + personnes).
  // Une information neuve, que ni l'arbre ni la carte ne montrent : qui est
  // central, qui est isolé.
  function magnitudes(donnees) {
    var m = Object.create(null);
    donnees.fiches.forEach(function (f) { m[f.id] = 0; });
    donnees.relations.forEach(function (r) {
      if (m[r.source] !== undefined) { m[r.source] += 1; }
      if (m[r.cible] !== undefined) { m[r.cible] += 1; }
    });
    donnees.personnes.forEach(function (p) {
      p.fiches.forEach(function (id) { if (m[id] !== undefined) { m[id] += 1; } });
    });
    return m;
  }

  function etoileDe(g, cx, cy, rayon, couleur) {
    // Une étoile gravée : un disque, un halo, et quatre pointes fines.
    g.appendChild(svg('circle', {
      cx: cx, cy: cy, r: rayon * 3.4, fill: couleur, opacity: '0.13'
    }));
    var pointes = rayon * 3.1;
    g.appendChild(svg('path', {
      d: 'M' + cx + ',' + (cy - pointes) + ' L' + (cx + rayon * 0.5) + ',' + (cy - rayon * 0.5) +
         ' L' + (cx + pointes) + ',' + cy + ' L' + (cx + rayon * 0.5) + ',' + (cy + rayon * 0.5) +
         ' L' + cx + ',' + (cy + pointes) + ' L' + (cx - rayon * 0.5) + ',' + (cy + rayon * 0.5) +
         ' L' + (cx - pointes) + ',' + cy + ' L' + (cx - rayon * 0.5) + ',' + (cy - rayon * 0.5) + ' Z',
      fill: couleur, opacity: '0.55'
    }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon, fill: '#fffaf0' }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon * 1.7, fill: couleur, opacity: '0.75' }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon, fill: '#fffaf0' }));
  }

  // --- Concentration : au survol ou au focus d'une étoile, le ciel s'éteint
  //     et seuls SES liens brillent. Un seul jeu d'écouteurs délégués sur la
  //     racine, jamais un par étoile — à 90 étoiles la différence compte.
  //     Le focus clavier déclenche la même chose que la souris : ce qui se
  //     découvre au doigt se découvre aussi à la tabulation. ---
  function brancherConcentration(racine) {
    var vifs = [];
    function eteindre() {
      vifs.forEach(function (t) { t.classList.remove('lien--vif'); });
      vifs = [];
      racine.classList.remove('ciel--concentre');
    }
    function allumer(cible) {
      var etoile = cible && cible.closest ? cible.closest('[data-fiche-id]') : null;
      if (!etoile) { eteindre(); return; }
      var id = etoile.getAttribute('data-fiche-id');
      eteindre();
      var liens = racine.querySelectorAll(
        '.liens path[data-a="' + id + '"], .liens path[data-b="' + id + '"]'
      );
      Array.prototype.forEach.call(liens, function (t) {
        t.classList.add('lien--vif');
        vifs.push(t);
      });
      racine.classList.add('ciel--concentre');
    }
    racine.addEventListener('mouseover', function (e) { allumer(e.target); });
    racine.addEventListener('mouseleave', eteindre);
    racine.addEventListener('focusin', function (e) { allumer(e.target); });
    racine.addEventListener('focusout', eteindre);
  }

  var etatUI = {
    dispo: 'voute', volume: 24, critere: 'metier',
    personnes: false, liens: true, figures: true, noms: false
  };

  function rendre() {
    var hote = document.getElementById('ciel-hote');
    var donnees = fabriquerDonnees(etatUI.volume);
    var groupes = grouper(donnees.fiches, etatUI.critere);
    var largeur = hote.clientWidth || 900;
    var layout = etatUI.dispo === 'galaxie'
      ? layoutGalaxie(groupes, largeur)
      : layoutVoute(groupes, largeur);
    var mags = magnitudes(donnees);
    var magMax = 1;
    Object.keys(mags).forEach(function (k) { if (mags[k] > magMax) { magMax = mags[k]; } });

    hote.textContent = '';
    var racine = svg('svg', {
      'class': 'ciel',
      viewBox: '0 0 ' + layout.vbW + ' ' + layout.vbH,
      preserveAspectRatio: 'xMidYMin meet',
      role: 'group',
      'aria-label': 'Voûte du réseau : ' + donnees.fiches.length + ' fiches réparties en ' +
        groupes.length + ' constellations'
    });

    // --- Poussière d'étoiles de fond : muette, déterministe, jamais devant. ---
    var fond = svg('g', { 'aria-hidden': 'true' });
    var rp = graine(77);
    for (var i = 0; i < Math.round(layout.vbW * layout.vbH / 2600); i++) {
      fond.appendChild(svg('circle', {
        cx: (rp() * layout.vbW).toFixed(1),
        cy: (rp() * layout.vbH).toFixed(1),
        r: (0.4 + rp() * 0.9).toFixed(2),
        fill: '#dce8f7',
        opacity: (0.12 + rp() * 0.30).toFixed(2)
      }));
    }
    racine.appendChild(fond);

    // --- Nébuleuses : le halo très doux qui donne son territoire à chaque
    //     constellation. Décoratif, jamais porteur d'information seule. ---
    var nebuleuses = svg('g', { 'aria-hidden': 'true' });
    layout.amas.forEach(function (a) {
      nebuleuses.appendChild(svg('ellipse', {
        cx: a.cx, cy: a.cy, rx: a.rx + 34, ry: a.ry + 30,
        fill: '#2a4a72', opacity: '0.16'
      }));
    });
    racine.appendChild(nebuleuses);

    // --- Index des positions, pour les liens et les orbites. ---
    var pos = Object.create(null);
    layout.amas.forEach(function (a) {
      a.etoiles.forEach(function (e) { pos[e.fiche.id] = e; });
    });

    // --- Tracés de constellation : très fins, pointillés, à peine là.
    //     Ils dessinent la figure ; ils ne doivent JAMAIS se confondre avec
    //     un lien de relation (qui, lui, est une information). ---
    if (etatUI.figures) {
      var gFig = svg('g', {
        'aria-hidden': 'true', fill: 'none', stroke: '#9fc4e8',
        'stroke-width': '0.7', 'stroke-dasharray': '3 4', opacity: '0.34'
      });
      layout.amas.forEach(function (a) {
        figure(a.etoiles).forEach(function (seg) {
          var p = a.etoiles[seg[0]], q = a.etoiles[seg[1]];
          gFig.appendChild(svg('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y }));
        });
      });
      racine.appendChild(gFig);
    }

    // --- Liens de relation : BLANCS et FINS (la demande). Le type par le
    //     motif, l'avancement par l'intensité. Légère courbure : un lien ne
    //     se confond pas avec un tracé de figure, même superposé. ---
    var nbLiens = 0;
    if (etatUI.liens) {
      var gLiens = svg('g', {
        'class': 'liens', 'aria-hidden': 'true', fill: 'none', stroke: '#ffffff',
        'stroke-width': '0.9', 'stroke-linecap': 'round'
      });
      donnees.relations.forEach(function (r) {
        var a = pos[r.source], b = pos[r.cible];
        if (!a || !b) { return; }
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var dx = b.x - a.x, dy = b.y - a.y;
        var lg = Math.sqrt(dx * dx + dy * dy) || 1;
        var courbe = Math.min(28, lg * 0.12);
        var trait = svg('path', {
          d: 'M' + a.x + ',' + a.y + ' Q' + (mx - dy / lg * courbe) + ',' +
             (my + dx / lg * courbe) + ' ' + b.x + ',' + b.y,
          opacity: String(OPACITE_STATUT[r.statut] || 0.5)
        });
        if (MOTIFS_RELATION[r.type]) { trait.setAttribute('stroke-dasharray', MOTIFS_RELATION[r.type]); }
        // Les deux extrémités sont inscrites sur le trait : c'est ce qui permet
        // d'allumer le voisinage d'une étoile sans re-parcourir les données.
        trait.setAttribute('data-a', r.source);
        trait.setAttribute('data-b', r.cible);
        gLiens.appendChild(trait);
        nbLiens += 1;
      });
      racine.appendChild(gLiens);
    }

    // --- Personnes en orbite : la seconde notion de RIVEN. Une personne
    //     rattachée à deux fiches orbite les deux — c'est ce qui rend le
    //     rattachement multiple visible d'un coup d'œil. ---
    var nbOrbites = 0;
    if (etatUI.personnes) {
      var gOrb = svg('g', {});
      donnees.personnes.forEach(function (p, ip) {
        p.fiches.forEach(function (idFiche, k) {
          var anc = pos[idFiche];
          if (!anc) { return; }
          var rayonOrbite = 15 + (ip % 3) * 4;
          var angle = (ip * 2.399963) + k * 1.9;
          var ox = anc.x + Math.cos(angle) * rayonOrbite;
          var oy = anc.y + Math.sin(angle) * rayonOrbite * 0.8;
          var lien = svg('line', {
            x1: anc.x, y1: anc.y, x2: ox, y2: oy,
            stroke: '#f2ead6', 'stroke-width': '0.5', opacity: '0.34'
          });
          gOrb.appendChild(lien);
          var g = svg('g', {
            'class': 'etoile',
            tabindex: '0', role: 'button',
            'aria-label': p.nom + ', personne rattachée' + (p.fiches.length > 1 ? ' à 2 fiches' : '')
          });
          var titre = svg('title');
          titre.textContent = p.nom;
          g.appendChild(titre);
          g.appendChild(svg('circle', {
            'class': 'halo-focus', cx: ox, cy: oy, r: 7,
            fill: 'none', stroke: '#f2ead6', 'stroke-width': '1'
          }));
          g.appendChild(svg('circle', { cx: ox, cy: oy, r: 2.1, fill: '#f2ead6', opacity: '0.9' }));
          gOrb.appendChild(g);
          nbOrbites += 1;
        });
      });
      racine.appendChild(gOrb);
    }

    // --- Les étoiles : une fiche = une étoile. Magnitude = poids réseau. ---
    var gEtoiles = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif' });
    // Noms affichés en permanence : les SIX étoiles les plus lourdes du ciel,
    // pas « toutes celles au-dessus d'un seuil ». Un seuil laisse le nombre
    // dériver avec la charge — à 90 fiches il en affichait 19, qui se
    // chevauchaient. Six, c'est six, quelle que soit la taille du réseau.
    var MAX_NOMS_PERMANENTS = 6;
    var lourdes = Object.create(null);
    if (donnees.fiches.length <= MAX_NOMS_PERMANENTS) {
      // Petit réseau : la place existe, tout le monde est nommé. C'est l'état
      // d'aujourd'hui (5 fiches) — il ne doit pas donner un ciel anonyme.
      donnees.fiches.forEach(function (f) { lourdes[f.id] = true; });
    } else {
      donnees.fiches.slice().sort(function (a, b) {
        var d = (mags[b.id] || 0) - (mags[a.id] || 0);
        return d !== 0 ? d : (a.nom || '').localeCompare(b.nom || '', 'fr');
      }).slice(0, MAX_NOMS_PERMANENTS).forEach(function (f) { lourdes[f.id] = true; });
    }
    var nomsAffiches = 0;
    layout.amas.forEach(function (a) {
      a.etoiles.forEach(function (e) {
        var f = e.fiche;
        var mag = mags[f.id] || 0;
        var rayon = R_ETOILE_MIN + Math.min(3.4, (mag / magMax) * 3.4);
        var couleur = COULEURS_TYPE[f.type] || '#dddddd';
        var g = svg('g', {
          'class': 'etoile scintille',
          tabindex: '0', role: 'button',
          'data-fiche-id': f.id,
          'aria-label': f.nom + ', ' + LIBELLES_TYPE[f.type] + ', ' + a.groupe.nom +
            ', ' + mag + ' lien' + (mag > 1 ? 's' : '')
        });
        var titre = svg('title');
        titre.textContent = f.nom + ' — ' + LIBELLES_TYPE[f.type];
        g.appendChild(titre);
        g.appendChild(svg('circle', {
          'class': 'halo-focus', cx: e.x, cy: e.y, r: rayon * 4.6,
          fill: 'none', stroke: '#fffaf0', 'stroke-width': '1'
        }));
        etoileDe(g, e.x, e.y, rayon, couleur);
        // Zone de captation : un disque invisible, de rayon borné pour que
        // deux voisines ne se disputent JAMAIS le doigt. C'est elle, et elle
        // seule, qui reçoit le survol, le clic et le tap.
        g.appendChild(svg('circle', {
          'class': 'zone-clic', cx: e.x, cy: e.y, r: RAYON_CAPTATION,
          fill: '#000000', 'fill-opacity': '0'
        }));
        // Le nom : permanent pour les six plus lourdes (ou tout, si Paul coche
        // « Tous les noms » — pour voir le mur). Sinon il est POSÉ QUAND MÊME,
        // transparent : il existe dans le DOM pour le lecteur d'écran et se
        // révèle au survol comme au focus clavier. Rien n'est caché à personne.
        var permanent = etatUI.noms || lourdes[f.id];
        g.appendChild(texte({
          'class': 'etoile-nom' + (permanent ? '' : ' etoile-nom--demande'),
          x: e.x, y: e.y + rayon * 3.4 + 10,
          'text-anchor': 'middle', 'font-size': '9.5', fill: '#e8dfc8',
          opacity: permanent ? '0.85' : '0'
        }, f.nom.length > 18 ? f.nom.slice(0, 17) + '…' : f.nom));
        if (permanent) { nomsAffiches += 1; }
        gEtoiles.appendChild(g);
      });
    });
    racine.appendChild(gEtoiles);

    // --- Noms de constellation : capitales espacées, or pâle. Le registre
    //     des atlas anciens — le même vocabulaire que les cartouches. ---
    var gNoms = svg('g', {
      'font-family': 'Georgia, "Times New Roman", serif',
      'text-anchor': 'middle', fill: '#d8bd82'
    });
    layout.amas.forEach(function (a) {
      var etiquette = a.groupe.nom.toUpperCase();
      gNoms.appendChild(texte({
        x: a.cx, y: a.nomY, 'font-size': '11.5', 'letter-spacing': '3.2', opacity: '0.92'
      }, etiquette));
      gNoms.appendChild(texte({
        x: a.cx, y: a.nomY + 14, 'font-size': '9.5', 'letter-spacing': '1.2',
        opacity: '0.7', 'font-style': 'italic'
      }, a.groupe.fiches.length + (a.groupe.fiches.length > 1 ? ' fiches' : ' fiche')));
    });
    racine.appendChild(gNoms);

    brancherConcentration(racine);
    hote.appendChild(racine);
    mesurer(racine, layout, donnees, groupes, nbLiens, nomsAffiches);
  }

  // ------------------------------------------------------------------
  // 5. MESURE. Le foyer DRAUKHAIN débordait alors qu'il avait été « validé
  //    en le regardant ». Une géométrie se mesure : bbox réelle contre
  //    viewBox, et distance minimale entre deux étoiles.
  // ------------------------------------------------------------------
  function mesurer(racine, layout, donnees, groupes, nbLiens, nomsAffiches) {
    var bb;
    try { bb = racine.getBBox(); } catch (e) { bb = null; }
    var hors = null;
    if (bb) {
      hors = (bb.x < -0.5) || (bb.y < -0.5) ||
        (bb.x + bb.width > layout.vbW + 0.5) ||
        (bb.y + bb.height > layout.vbH + 0.5);
    }
    // Distance minimale entre deux étoiles (toutes constellations confondues).
    var toutes = [];
    layout.amas.forEach(function (a) { a.etoiles.forEach(function (e) { toutes.push(e); }); });
    var dmin = Infinity, i, j;
    for (i = 0; i < toutes.length; i++) {
      for (j = i + 1; j < toutes.length; j++) {
        var dx = toutes[i].x - toutes[j].x, dy = toutes[i].y - toutes[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < dmin) { dmin = d; }
      }
    }
    if (dmin === Infinity) { dmin = 0; }

    var cible = document.getElementById('mesure');
    cible.textContent = '';
    function ligne(libelle, valeur, classe) {
      var p = document.createElement('div');
      var l = document.createElement('span');
      l.textContent = libelle + ' : ';
      var v = document.createElement('b');
      if (classe) { v.className = classe; }
      v.textContent = valeur;
      p.appendChild(l); p.appendChild(v);
      cible.appendChild(p);
    }
    ligne('viewBox', Math.round(layout.vbW) + ' × ' + Math.round(layout.vbH));
    if (bb) {
      ligne('bbox du contenu',
        Math.round(bb.x) + ',' + Math.round(bb.y) + ' → ' +
        Math.round(bb.x + bb.width) + ',' + Math.round(bb.y + bb.height));
      ligne('Débordement', hors ? 'OUI — le ciel déborde de son cadre' : 'aucun',
        hors ? 'verdict-ko' : 'verdict-ok');
    }
    ligne('Constellations', String(groupes.length));
    ligne('Étoiles (fiches)', String(donnees.fiches.length));
    ligne('Liens tracés', String(nbLiens));
    ligne('Noms lisibles à l’écran', nomsAffiches + ' sur ' + donnees.fiches.length);
    ligne('Écart minimal entre 2 étoiles', dmin.toFixed(1) + ' u',
      dmin >= 14 ? 'verdict-ok' : 'verdict-ko');

    // La mesure qui tranche vraiment : la cible tactile en PIXELS RÉELS à la
    // largeur d'écran du moment. 24 px est le plancher WCAG 2.2 (AA) ; en
    // dessous, le doigt de Paul rate l'étoile — quelle que soit sa beauté.
    var largeurAffichee = racine.getBoundingClientRect().width;
    var pxParUnite = largeurAffichee / layout.vbW;
    var ciblePx = 2 * RAYON_CAPTATION * pxParUnite;
    var ecartPx = dmin * pxParUnite;
    ligne('Cible tactile réelle', ciblePx.toFixed(1) + ' px (plancher 24 px)',
      ciblePx >= 24 ? 'verdict-ok' : 'verdict-ko');
    ligne('Écart réel entre 2 étoiles', ecartPx.toFixed(1) + ' px');

    var note = document.createElement('p');
    note.style.margin = '.6rem 0 0';
    note.style.fontStyle = 'italic';
    note.style.opacity = '.75';
    if (ciblePx < 24) {
      note.textContent = 'À cette largeur d’écran, une étoile est plus petite ' +
        'que le plancher tactile : au doigt, il faut pouvoir zoomer, ou n’ouvrir ' +
        'qu’une constellation à la fois. C’est le point à trancher pour le mobile.';
    } else {
      note.textContent = 'Aucune étoile n’en touche une autre, et la cible tient ' +
        'sous le pouce : le ciel est manipulable tel quel.';
    }
    cible.appendChild(note);
  }

  // ------------------------------------------------------------------
  // 6. Légende — l'information est toujours portée par du texte, jamais
  //    par le seul dessin (registre antique et sérieux, double codage).
  // ------------------------------------------------------------------
  function construireLegende() {
    var hote = document.getElementById('legende');
    hote.textContent = '';
    TYPES.forEach(function (t) {
      var l = document.createElement('div');
      l.className = 'legende-ligne';
      var s = svg('svg', { width: '22', height: '18', 'aria-hidden': 'true' });
      var g = svg('g');
      etoileDe(g, 11, 9, 3.4, COULEURS_TYPE[t]);
      s.appendChild(g);
      l.appendChild(s);
      var txt = document.createElement('span');
      txt.textContent = LIBELLES_TYPE[t] + ' — une fiche du réseau';
      l.appendChild(txt);
      hote.appendChild(l);
    });
    Object.keys(MOTIFS_RELATION).forEach(function (t) {
      var l = document.createElement('div');
      l.className = 'legende-ligne';
      var s = svg('svg', { width: '22', height: '18', 'aria-hidden': 'true' });
      var trait = svg('line', {
        x1: '1', y1: '9', x2: '21', y2: '9', stroke: '#ffffff',
        'stroke-width': '0.9', opacity: '0.9'
      });
      if (MOTIFS_RELATION[t]) { trait.setAttribute('stroke-dasharray', MOTIFS_RELATION[t]); }
      s.appendChild(trait);
      l.appendChild(s);
      var txt = document.createElement('span');
      txt.textContent = LIBELLES_RELATION[t] + ' — lien blanc, le motif dit le type';
      l.appendChild(txt);
      hote.appendChild(l);
    });
    STATUTS_RELATION.forEach(function (st) {
      var l = document.createElement('div');
      l.className = 'legende-ligne';
      var s = svg('svg', { width: '22', height: '18', 'aria-hidden': 'true' });
      s.appendChild(svg('line', {
        x1: '1', y1: '9', x2: '21', y2: '9', stroke: '#ffffff',
        'stroke-width': '0.9', opacity: String(OPACITE_STATUT[st])
      }));
      l.appendChild(s);
      var txt = document.createElement('span');
      txt.textContent = LIBELLES_STATUT_RELATION[st] + ' — l’éclat dit l’avancement';
      l.appendChild(txt);
      hote.appendChild(l);
    });
    var l2 = document.createElement('div');
    l2.className = 'legende-ligne';
    var s2 = svg('svg', { width: '22', height: '18', 'aria-hidden': 'true' });
    s2.appendChild(svg('circle', { cx: '11', cy: '9', r: '2.1', fill: '#f2ead6' }));
    l2.appendChild(s2);
    var t2 = document.createElement('span');
    t2.textContent = 'Personne — en orbite de la ou des fiches où elle travaille';
    l2.appendChild(t2);
    hote.appendChild(l2);
    var l3 = document.createElement('div');
    l3.className = 'legende-ligne';
    var s3 = svg('svg', { width: '22', height: '18', 'aria-hidden': 'true' });
    s3.appendChild(svg('line', {
      x1: '1', y1: '9', x2: '21', y2: '9', stroke: '#9fc4e8',
      'stroke-width': '0.7', 'stroke-dasharray': '3 4', opacity: '0.34'
    }));
    l3.appendChild(s3);
    var t3 = document.createElement('span');
    t3.textContent = 'Tracé de figure — dessine la constellation, ne dit rien de plus';
    l3.appendChild(t3);
    hote.appendChild(l3);
  }

  // ------------------------------------------------------------------
  // 7. Commandes
  // ------------------------------------------------------------------
  function brancherSegments(id, cle, transformer) {
    var hote = document.getElementById(id);
    hote.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-val]') : null;
      if (!b) { return; }
      Array.prototype.forEach.call(hote.querySelectorAll('button'), function (autre) {
        autre.setAttribute('aria-pressed', autre === b ? 'true' : 'false');
      });
      var v = b.getAttribute('data-val');
      etatUI[cle] = transformer ? transformer(v) : v;
      rendre();
    });
  }
  function brancherBascule(id, cle) {
    var el = document.getElementById(id);
    el.addEventListener('change', function () { etatUI[cle] = el.checked; rendre(); });
  }

  brancherSegments('seg-dispo', 'dispo');
  brancherSegments('seg-volume', 'volume', function (v) { return parseInt(v, 10); });
  brancherSegments('seg-critere', 'critere');
  brancherBascule('opt-personnes', 'personnes');
  brancherBascule('opt-liens', 'liens');
  brancherBascule('opt-figures', 'figures');
  brancherBascule('opt-noms', 'noms');

  var minuteur = null;
  window.addEventListener('resize', function () {
    if (minuteur) { window.clearTimeout(minuteur); }
    minuteur = window.setTimeout(rendre, 140);
  });

  construireLegende();
  rendre();
})();
