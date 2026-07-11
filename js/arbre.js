// Module Arbre des contacts — exposé en global : window.UltimaArbre
// Le pivot A3 : un arbre gravé sur parchemin dessiné À PARTIR DES DONNÉES
// (etat.noeuds), pas statique. Tronc = réseau, branches = secteurs d'activité,
// feuilles = contacts. Layout DÉTERMINISTE calculé (même données → même arbre),
// zéro chevauchement, croissance verticale. Injection DOM 100 % createElementNS
// / textContent (jamais innerHTML). Cohérent avec le décor SVG de l'Accueil et
// avec carte.js (module auto-contenu, exposé en global).
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---- Géométrie du layout (toutes les mesures en unités viewBox) ----
  var FEUILLE_W = 178;         // étiquette-contact (échelle physique constante)
  var FEUILLE_H = 40;
  var GAP_X = 14;              // espacement horizontal entre feuilles
  var GAP_Y = 14;              // espacement vertical entre rangées

  // Paliers en escalier : plus l'écran est large, plus l'arbre gagne de colonnes
  // (feuilles à échelle constante ~178 px), donc moins de rangées et un arbre
  // plus court. minLargeur == vbW pour les paliers desktop : au seuil, le SVG
  // s'affiche à l'échelle 1 sans débordement. La base (mobile) est le plancher.
  // Grille interne = cols*178 + (cols-1)*14 <= vbW à chaque palier (no-scroll-X).
  var PALIERS = [
    { minLargeur: 1240, cols: 6, vbW: 1240 }, // desktop large (1138 <= 1240)
    { minLargeur: 1040, cols: 5, vbW: 1040 }, // desktop        (946 <= 1040)
    { minLargeur:  820, cols: 4, vbW:  820 }, // tablette large  (754 <= 820)
    { minLargeur:    0, cols: 3, vbW:  620 }  // base / mobile   (562 <= 620)
  ];

  // PUR : même largeur -> même palier (fonction en escalier). Aucune lecture DOM,
  // aucun état. Choisit le plus grand palier dont vbW <= largeurCible ; base en
  // plancher (largeur absente / 0 / conteneur détaché -> palier base).
  function choisirPalier(largeurPx) {
    var l = (typeof largeurPx === 'number' && largeurPx > 0) ? largeurPx : 0;
    for (var i = 0; i < PALIERS.length; i++) {
      if (l >= PALIERS[i].minLargeur) { return PALIERS[i]; }
    }
    return PALIERS[PALIERS.length - 1];
  }

  var BANNIERE_H = 26;
  var ESP_BANNIERE_GRILLE = 16; // bannière -> première rangée
  var ESP_BANDE = 42;          // entre deux secteurs (bandes)
  var TOP_PAD = 34;            // respiration en tête (couronne)
  var BOTTOM_PAD = 78;         // pied : sol + racines
  var MAX_NOM = 20;            // troncature visuelle (nom complet en aria-label)

  var CLE_A_CLASSER = ' a-classer'; // sentinelle : toujours triée en dernier
  var LABEL_A_CLASSER = 'À classer';

  var COULEUR_DEFAUT = '#555555';

  // Normalisation identique à app.normaliserTexte (NFD + diacritiques + bas de
  // casse). Dupliquée ici pour garder le module auto-contenu et testable seul ;
  // c'est la même règle que la datalist des secteurs (A2).
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
    if (s.length <= max) { return s; }
    return s.slice(0, max - 1).replace(/\s+$/, '') + '…';
  }

  // Largeur de grille pour c colonnes, et abscisse de départ (grille centrée).
  function largeurGrille(cols) {
    return cols * FEUILLE_W + (cols - 1) * GAP_X;
  }
  function departX(cols, vbW) {
    return Math.round((vbW - largeurGrille(cols)) / 2);
  }

  // ---- Regroupement déterministe par secteur normalisé ----
  // Première graphie rencontrée conservée pour l'étiquette (même règle qu'A2).
  // « À classer » regroupe les sans-secteur. Ordre des branches : localeCompare
  // fr sur la forme normalisée, « À classer » forcé en dernier. Ordre des
  // contacts : par nom (localeCompare fr), départage par id (stabilité totale).
  function grouper(noeuds) {
    var groupes = Object.create(null);
    var ordre = [];
    (noeuds || []).forEach(function (n) {
      var brut = (n.secteur_activite || '').trim();
      var cle = brut ? normaliser(brut) : CLE_A_CLASSER;
      if (!groupes[cle]) {
        groupes[cle] = { cle: cle, label: brut || LABEL_A_CLASSER, contacts: [] };
        ordre.push(cle);
      }
      groupes[cle].contacts.push(n);
    });
    var branches = ordre.map(function (cle) { return groupes[cle]; });
    branches.sort(function (a, b) {
      if (a.cle === CLE_A_CLASSER) { return b.cle === CLE_A_CLASSER ? 0 : 1; }
      if (b.cle === CLE_A_CLASSER) { return -1; }
      return a.label.localeCompare(b.label, 'fr');
    });
    branches.forEach(function (branche) {
      branche.contacts.sort(function (a, b) {
        var parNom = (a.nom || '').localeCompare(b.nom || '', 'fr');
        if (parNom !== 0) { return parNom; }
        return (a.id || '') < (b.id || '') ? -1 : ((a.id || '') > (b.id || '') ? 1 : 0);
      });
    });
    return branches;
  }

  // ---- Layout déterministe : positions calculées depuis les seules données ----
  // Retourne une structure pure (aucun DOM) : testable directement. Deux appels
  // sur le même jeu de données produisent une structure identique.
  function calculerLayout(noeuds, largeurCible) {
    var palier = choisirPalier(largeurCible);
    var vbW = palier.vbW;
    var branches = grouper(noeuds);
    var y = TOP_PAD;
    var nbContacts = 0;
    var bandes = branches.map(function (branche) {
      var n = branche.contacts.length;
      var cols = Math.min(palier.cols, n) || 1;
      var rangees = Math.ceil(n / cols);
      var gx = departX(cols, vbW);
      var gridTop = y + BANNIERE_H + ESP_BANNIERE_GRILLE;
      var contacts = branche.contacts.map(function (noeud, k) {
        var r = Math.floor(k / cols);
        var c = k % cols;
        return {
          noeud: noeud,
          x: gx + c * (FEUILLE_W + GAP_X),
          y: gridTop + r * (FEUILLE_H + GAP_Y)
        };
      });
      nbContacts += n;
      var hauteurGrille = rangees * FEUILLE_H + (rangees - 1) * GAP_Y;
      var bande = {
        cle: branche.cle,
        label: branche.label,
        bannerY: y,
        gridTop: gridTop,
        gridW: largeurGrille(cols),
        hauteurGrille: hauteurGrille,
        rangees: rangees,
        contacts: contacts
      };
      y = gridTop + hauteurGrille + ESP_BANDE;
      return bande;
    });
    var hauteur = bandes.length
      ? (y - ESP_BANDE + BOTTOM_PAD)
      : (TOP_PAD + BOTTOM_PAD);
    return {
      largeur: vbW,
      hauteur: hauteur,
      viewBox: '0 0 ' + vbW + ' ' + hauteur,
      nbBranches: bandes.length,
      nbContacts: nbContacts,
      bandes: bandes
    };
  }

  // ---- Décor gravé (sol, tronc, feuillage) : muet pour les lecteurs d'écran ----
  function dessinerDecor(racine, layout) {
    var defs = svg('defs');
    var filtre = svg('filter', { id: 'arbre-rough', x: '-4%', y: '-4%', width: '108%', height: '108%' });
    filtre.appendChild(svg('feTurbulence', {
      type: 'fractalNoise', baseFrequency: '0.02', numOctaves: '2', seed: '4', result: 'n'
    }));
    filtre.appendChild(svg('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '3' }));
    defs.appendChild(filtre);
    var grad = svg('radialGradient', { id: 'arbre-feuillage', cx: '48%', cy: '40%', r: '70%' });
    grad.appendChild(svg('stop', { offset: '0%', 'stop-color': '#93ac62' }));
    grad.appendChild(svg('stop', { offset: '100%', 'stop-color': '#6f8f4a' }));
    defs.appendChild(grad);
    racine.appendChild(defs);

    var cx = layout.largeur / 2;
    var solY = layout.hauteur - BOTTOM_PAD + 34;

    // Sol : butte herbeuse.
    var sol = svg('g', { filter: 'url(#arbre-rough)' });
    sol.appendChild(svg('ellipse', { cx: cx, cy: solY, rx: 250, ry: 30, fill: '#cdbc85', opacity: '0.7' }));
    sol.appendChild(svg('ellipse', { cx: cx, cy: solY - 6, rx: 188, ry: 22, fill: '#a7b06b', opacity: '0.5' }));
    racine.appendChild(sol);

    // Touffes d'herbe au pied (registre planche : quelques brins gravés).
    var herbe = svg('g', {
      fill: 'none', stroke: '#6f8f4a', 'stroke-width': '1.6',
      'stroke-linecap': 'round', opacity: '0.8'
    });
    herbe.appendChild(svg('path', {
      d: 'M' + (cx - 130) + ',' + (solY - 6) + ' q2,-11 6,-15' +
         ' M' + (cx - 122) + ',' + (solY - 4) + ' q0,-9 5,-14' +
         ' M' + (cx + 110) + ',' + (solY - 8) + ' q2,-11 6,-15' +
         ' M' + (cx + 120) + ',' + (solY - 5) + ' q0,-9 5,-14' +
         ' M' + (cx - 60) + ',' + (solY + 4) + ' q2,-9 5,-13' +
         ' M' + (cx + 64) + ',' + (solY + 3) + ' q-2,-9 -5,-13'
    }));
    racine.appendChild(herbe);

    // Feuillage doux derrière chaque bande (canopée par étage), avec une seconde
    // touche plus dense, décalée déterministiquement selon l'étage (variation
    // naturelle du feuillage, sans jamais toucher aux positions des feuilles).
    var canopee = svg('g', { fill: 'url(#arbre-feuillage)', opacity: '0.22', filter: 'url(#arbre-rough)' });
    var canopeeDense = svg('g', { fill: '#557a3a', opacity: '0.14', filter: 'url(#arbre-rough)' });
    layout.bandes.forEach(function (bande, i) {
      var cyF = bande.gridTop + bande.hauteurGrille / 2;
      var sens = (i % 2) ? 1 : -1; // alternance gauche/droite, déterministe
      canopee.appendChild(svg('ellipse', {
        cx: cx, cy: cyF, rx: bande.gridW / 2 + 34, ry: bande.hauteurGrille / 2 + 40
      }));
      canopeeDense.appendChild(svg('ellipse', {
        cx: cx + sens * 26, cy: cyF - 14,
        rx: bande.gridW / 4 + 22, ry: bande.hauteurGrille / 3 + 24
      }));
    });
    racine.appendChild(canopee);
    racine.appendChild(canopeeDense);

    // Tronc central (encre + bois), du sol à la couronne, derrière les feuilles.
    var hautTronc = TOP_PAD + 6;
    var tronc = svg('g', { filter: 'url(#arbre-rough)' });
    tronc.appendChild(svg('path', {
      d: 'M' + (cx - 14) + ',' + solY +
         ' C' + (cx - 17) + ',' + (solY - 120) + ' ' + (cx - 6) + ',' + hautTronc + ' ' + (cx - 3) + ',' + hautTronc +
         ' L' + (cx + 3) + ',' + hautTronc +
         ' C' + (cx + 6) + ',' + hautTronc + ' ' + (cx + 17) + ',' + (solY - 120) + ' ' + (cx + 14) + ',' + solY + ' Z',
      fill: '#6b4a2b', stroke: '#5a4118', 'stroke-width': '2.2'
    }));
    // Racines.
    tronc.appendChild(svg('path', {
      d: 'M' + (cx - 12) + ',' + (solY - 4) + ' Q' + (cx - 42) + ',' + (solY + 6) + ' ' + (cx - 66) + ',' + (solY + 2) +
         ' M' + (cx + 12) + ',' + (solY - 2) + ' Q' + (cx + 42) + ',' + (solY + 8) + ' ' + (cx + 66) + ',' + (solY + 4),
      fill: 'none', stroke: '#5a4118', 'stroke-width': '3', 'stroke-linecap': 'round'
    }));
    // Nervures d'écorce (registre gravure) : quelques filets suivant le tronc.
    var nervures = svg('g', {
      fill: 'none', stroke: '#5a4118', 'stroke-width': '1.1',
      opacity: '0.5', 'stroke-linecap': 'round', filter: 'url(#arbre-rough)'
    });
    var midTronc = (hautTronc + solY) / 2;
    nervures.appendChild(svg('path', {
      d: 'M' + (cx - 5) + ',' + (solY - 40) + ' Q' + (cx - 9) + ',' + midTronc + ' ' + (cx - 4) + ',' + (hautTronc + 40) +
         ' M' + (cx + 6) + ',' + (solY - 30) + ' Q' + (cx + 10) + ',' + midTronc + ' ' + (cx + 4) + ',' + (hautTronc + 60)
    }));
    racine.appendChild(nervures);

    // Branche du tronc vers chaque bannière : courbe organique (léger balancement
    // latéral alterné par étage), plus vivante que le trait droit. Purement
    // décoratif — les positions logiques (layout) restent inchangées.
    var branchages = svg('g', {
      fill: 'none', stroke: '#6b4a2b', 'stroke-width': '3.4', 'stroke-linecap': 'round', filter: 'url(#arbre-rough)'
    });
    var cerneBranches = svg('g', {
      fill: 'none', stroke: '#5a4118', 'stroke-width': '1.1', opacity: '0.45',
      'stroke-linecap': 'round', filter: 'url(#arbre-rough)'
    });
    var sprigs = svg('g', {
      fill: '#6f8f4a', stroke: '#4f7038', 'stroke-width': '1', opacity: '0.85', filter: 'url(#arbre-rough)'
    });
    layout.bandes.forEach(function (bande, i) {
      var yB = bande.bannerY + BANNIERE_H;
      var sens = (i % 2) ? 1 : -1;
      var sway = 11 * sens;
      var d = 'M' + cx + ',' + (yB + 46) +
        ' C' + (cx + sway) + ',' + (yB + 30) +
        ' ' + (cx - sway) + ',' + (yB + 16) +
        ' ' + cx + ',' + yB;
      branchages.appendChild(svg('path', { d: d }));
      cerneBranches.appendChild(svg('path', { d: d }));
      // Deux brins de feuillage de part et d'autre de la bannière (dans l'espace
      // libre latéral : aucune collision avec les étiquettes, sous la bannière).
      var bx = cx + sens * 58;
      var by = yB + 8;
      sprigs.appendChild(svg('path', {
        d: 'M' + bx + ',' + by + ' q' + (sens * 12) + ',-9 ' + (sens * 18) + ',-2' +
           ' q' + (-sens * 4) + ',9 ' + (-sens * 18) + ',2 Z'
      }));
      sprigs.appendChild(svg('path', {
        d: 'M' + (cx - sens * 46) + ',' + (by + 6) +
           ' q' + (-sens * 10) + ',-8 ' + (-sens * 16) + ',-1' +
           ' q' + (sens * 4) + ',8 ' + (sens * 16) + ',1 Z'
      }));
    });
    racine.appendChild(branchages);
    racine.appendChild(cerneBranches);
    racine.appendChild(sprigs);
  }

  // ---- Bannières de secteur ----
  function dessinerBannieres(racine, layout) {
    var g = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif', 'font-size': '12.5', 'font-weight': '700' });
    var cx = layout.largeur / 2;
    layout.bandes.forEach(function (bande) {
      var largeur = Math.max(84, Math.min(layout.largeur - 40, bande.label.length * 8.4 + 26));
      var x = Math.round(cx - largeur / 2);
      g.appendChild(svg('rect', {
        x: x, y: bande.bannerY, width: Math.round(largeur), height: BANNIERE_H,
        rx: 4, fill: '#f4e6bd', stroke: '#a9884a', 'stroke-width': '1.3'
      }));
      g.appendChild(texteSvg({
        x: cx, y: bande.bannerY + 17, 'text-anchor': 'middle', fill: '#4a3512'
      }, bande.label));
    });
    racine.appendChild(g);
  }

  // ---- Feuilles-contacts : pastille couleur du type + nom + type en toutes
  //      lettres (double codage). Chaque feuille est focusable et activable. ----
  function dessinerFeuilles(racine, layout, options) {
    var couleurs = options.couleurs || {};
    var libelles = options.libellesType || {};
    var correspond = options.correspond;
    var idNouveau = options.noeudNouveau || null; // feuille à faire pousser (A4)
    var g = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif' });
    var index = 0;
    layout.bandes.forEach(function (bande) {
      bande.contacts.forEach(function (item) {
        var noeud = item.noeud;
        var type = noeud.type;
        var libelleType = libelles[type] || type || '';
        var nomComplet = noeud.nom || '(sans nom)';
        var attenue = correspond && !correspond(noeud);
        var pousse = idNouveau && noeud.id === idNouveau; // A4 : nouvelle entrée

        var feuille = svg('g', {
          'class': 'arbre-feuille' + (attenue ? ' arbre-feuille--attenuee' : '') +
            (pousse ? ' arbre-feuille--pousse' : ''),
          tabindex: '0',
          role: 'button',
          'data-noeud-id': noeud.id,
          'aria-label': nomComplet + ', ' + libelleType +
            (bande.cle === CLE_A_CLASSER ? ', sans secteur' : ', secteur ' + bande.label)
        });
        // <title> : nom réel complet (infobulle + repli lecteur d'écran).
        var titleEl = svg('title');
        titleEl.textContent = nomComplet;
        feuille.appendChild(titleEl);

        var lx = item.x;
        var ly = item.y;
        feuille.appendChild(svg('rect', {
          'class': 'arbre-feuille-cadre',
          // Arrondi légèrement varié (déterministe par index) : étiquettes de
          // planche gravées, jamais deux tout à fait identiques. Reste dans la
          // boîte du layout — la garantie d'anti-chevauchement d'A3 est intacte.
          x: lx, y: ly, width: FEUILLE_W, height: FEUILLE_H, rx: (index % 2 ? 6 : 4.5),
          fill: '#fff3d6', stroke: '#a9884a', 'stroke-width': '1.3'
        }));
        var pcx = lx + 17;
        var pcy = ly + FEUILLE_H / 2;
        feuille.appendChild(svg('circle', {
          cx: pcx, cy: pcy, r: 6.5, fill: couleurs[type] || COULEUR_DEFAUT,
          stroke: '#fff3d6', 'stroke-width': '2.4'
        }));
        feuille.appendChild(svg('circle', {
          cx: pcx, cy: pcy, r: 8.6, fill: 'none', stroke: '#5a4118', 'stroke-width': '1'
        }));
        feuille.appendChild(texteSvg({
          x: lx + 32, y: ly + 17, 'font-size': '12.5', 'font-weight': '700', fill: '#3d2c10'
        }, tronquer(nomComplet, MAX_NOM)));
        feuille.appendChild(texteSvg({
          x: lx + 32, y: ly + 31, 'font-size': '10', 'font-style': 'italic', fill: '#6e5320'
        }, libelleType));

        g.appendChild(feuille);
        index += 1;
      });
    });
    racine.appendChild(g);
    return index;
  }

  // ---- Rendu complet : construit le SVG dans `conteneur` et branche un seul
  //      délégué d'événements (clic + clavier). Réutilisable à chaque re-render. ----
  function rendre(conteneur, noeuds, options) {
    options = options || {};
    if (!options.couleurs) {
      options.couleurs = (window.UltimaCarte && window.UltimaCarte.COULEURS_TYPE) || {};
    }
    // Largeur réelle du conteneur au rendu -> palier discret -> layout pur.
    // Déterminisme : pour une largeur donnée, palier, viewBox et positions sont
    // identiques à chaque appel. Marqueur data-palier (attribut, pas de style
    // inline -> CSP OK) : la CSS élargit le SVG au VB_W du palier.
    var largeurCible = conteneur.clientWidth;
    var palier = choisirPalier(largeurCible);
    conteneur.setAttribute('data-palier', String(palier.cols)); // "3" | "4" | "5" | "6"
    var layout = calculerLayout(noeuds, largeurCible);
    conteneur.textContent = '';

    var racine = svg('svg', {
      'class': 'arbre-svg',
      viewBox: layout.viewBox,
      preserveAspectRatio: 'xMidYMin meet',
      role: 'group',
      'aria-label': 'Arbre du réseau : ' + layout.nbContacts +
        (layout.nbContacts > 1 ? ' contacts répartis en ' : ' contact réparti en ') +
        layout.nbBranches + (layout.nbBranches > 1 ? ' branches (secteurs)' : ' branche (secteur)')
    });

    dessinerDecor(racine, layout);
    dessinerBannieres(racine, layout);
    dessinerFeuilles(racine, layout, options);

    if (typeof options.surClicNoeud === 'function') {
      var surClic = options.surClicNoeud;
      var declencher = function (cible) {
        var g = cible && cible.closest ? cible.closest('[data-noeud-id]') : null;
        if (g) { surClic(g.getAttribute('data-noeud-id')); }
      };
      racine.addEventListener('click', function (e) { declencher(e.target); });
      racine.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          var g = e.target && e.target.closest ? e.target.closest('[data-noeud-id]') : null;
          if (g) { e.preventDefault(); surClic(g.getAttribute('data-noeud-id')); }
        }
      });
    }

    conteneur.appendChild(racine);
    return layout;
  }

  window.UltimaArbre = {
    calculerLayout: calculerLayout,
    choisirPalier: choisirPalier,
    rendre: rendre,
    CLE_A_CLASSER: CLE_A_CLASSER,
    LABEL_A_CLASSER: LABEL_A_CLASSER
  };
})();
