/* Maquette RIVEN — registre de nuit. Script de la maquette UNIQUEMENT.
   Trois choses, et rien d'autre :
     ① le commutateur d'états (l'app n'a pas d'états « à montrer », une
        maquette si — c'est même sa raison d'être) ;
     ② un ciel statique de démonstration, graine fixe, données inventées ;
     ③ le BANDEAU DE MESURE, qui applique le critère ④ du cadrage : le
        contraste se calcule, il ne se regarde pas.

   Aucune ligne d'ici n'ira en production : c'est un brouillon d'arbitrage. */
(function () {
  'use strict';

  // ======================================================================
  // ①  Commutateur d'états
  // ======================================================================

  // Chaque état dit : quel espace est visible, quel onglet est courant, et
  // ce qui flotte par-dessus (panneau fiche, panneau formulaire, toast).
  var ETATS = {
    accueil:    { espace: 'etat-accueil',    onglet: 'accueil'  },
    ciel:       { espace: 'etat-ciel',       onglet: 'ciel'     },
    contacts:   { espace: 'etat-contacts',   onglet: 'contacts' },
    fiche:      { espace: 'etat-ciel',       onglet: 'ciel',     panneau: 'fiche' },
    formulaire: { espace: 'etat-ciel',       onglet: 'ciel',     panneau: 'formulaire' },
    vide:       { espace: 'etat-vide',       onglet: 'ciel'     },
    deconnecte: { espace: 'etat-deconnecte', onglet: 'ciel'     },
    toast:      { espace: 'etat-contacts',   onglet: 'contacts', toast: true }
  };
  var ESPACES = ['etat-accueil', 'etat-ciel', 'etat-contacts', 'etat-vide', 'etat-deconnecte'];

  function appliquerEtat(nom) {
    var etat = ETATS[nom];
    if (!etat) { return; }

    ESPACES.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { section.hidden = id !== etat.espace; }
    });

    var panneau = document.getElementById('panneau');
    panneau.hidden = !etat.panneau;
    document.getElementById('vue-fiche').hidden = etat.panneau !== 'fiche';
    document.getElementById('form-noeud').hidden = etat.panneau !== 'formulaire';
    document.getElementById('panneau-titre').textContent =
      etat.panneau === 'formulaire' ? 'Modifier la fiche' : 'Fiche';

    document.getElementById('toasts').hidden = !etat.toast;

    document.querySelectorAll('.barre-onglets .onglet').forEach(function (bouton) {
      if (bouton.getAttribute('data-onglet') === etat.onglet) {
        bouton.setAttribute('aria-current', 'page');
      } else {
        bouton.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('.mq-etats .mq-bouton').forEach(function (bouton) {
      if (bouton.getAttribute('data-etat') === nom) {
        bouton.setAttribute('aria-pressed', 'true');
      } else {
        bouton.removeAttribute('aria-pressed');
      }
    });

    if (etat.espace === 'etat-ciel') { dessinerCiel(); }
  }

  // ======================================================================
  // ②  Le ciel de démonstration — statique, graine fixe, tout inventé
  // ======================================================================
  //
  // Ce n'est PAS le ciel d'Ultima (js/ciel.js : 3D, dérive, concentration).
  // C'est une réduction suffisante pour juger ce que la maquette arbitre :
  // le cadre, le cartouche, les outils et le voisinage du ciel — c'est-à-dire
  // tout ce qui vivait sur le parchemin jusqu'à aujourd'hui.

  var GRAINE = 20260812;
  function alea() { // générateur déterministe : deux ouvertures, même ciel
    GRAINE = (GRAINE * 1103515245 + 12345) % 2147483648;
    return GRAINE / 2147483648;
  }

  var CONSTELLATIONS = [
    { nom: 'COUVERTURE', etoiles: 5 },
    { nom: 'MENUISERIE', etoiles: 4 },
    { nom: 'PLOMBERIE', etoiles: 3 },
    { nom: 'MAÇONNERIE', etoiles: 5 },
    { nom: 'ARCHITECTURE', etoiles: 3 },
    { nom: 'ÉLECTRICITÉ', etoiles: 4 }
  ];

  function dessinerCiel() {
    var scene = document.getElementById('ciel-scene');
    if (!scene) { return; }
    var largeur = scene.clientWidth;
    var hauteur = scene.clientHeight;
    if (!largeur || !hauteur) { return; }

    GRAINE = 20260812; // même ciel à chaque redessin (redimensionnement compris)

    var ancien = scene.querySelector('.ciel-svg');
    if (ancien) { ancien.remove(); }

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ciel-svg');
    // Le viewBox épouse la BOÎTE RÉELLE, jamais une proportion choisie a
    // priori : c'est le correctif du 2026-08-12, et il vaut aussi pour une
    // maquette — sans quoi elle mentirait sur le cadrage.
    svg.setAttribute('viewBox', '0 0 ' + largeur + ' ' + hauteur);
    svg.setAttribute('aria-hidden', 'true');

    var cx = largeur / 2;
    var cy = hauteur / 2;
    var rayon = Math.min(largeur, hauteur) * 0.34;

    // Poussière d'étoiles : le fond, jamais un contenu.
    var poussiere = '';
    for (var p = 0; p < 90; p += 1) {
      poussiere += '<circle cx="' + (alea() * largeur).toFixed(1) +
        '" cy="' + (alea() * hauteur).toFixed(1) +
        '" r="' + (0.4 + alea() * 0.9).toFixed(2) +
        '" fill="#f2ead6" opacity="' + (0.08 + alea() * 0.22).toFixed(2) + '"/>';
    }

    var liens = '';
    var etoiles = '';
    var noms = '';
    var centres = [];

    CONSTELLATIONS.forEach(function (constellation, index) {
      var angle = (index / CONSTELLATIONS.length) * Math.PI * 2 - Math.PI / 2;
      var ccx = cx + Math.cos(angle) * rayon;
      var ccy = cy + Math.sin(angle) * rayon * 0.78; // le ciel est plus large que haut
      centres.push({ x: ccx, y: ccy });

      var points = [];
      for (var e = 0; e < constellation.etoiles; e += 1) {
        var a = alea() * Math.PI * 2;
        var d = (0.25 + alea() * 0.75) * (rayon * 0.42);
        points.push({ x: ccx + Math.cos(a) * d, y: ccy + Math.sin(a) * d * 0.8 });
      }

      // Les liens de la constellation : traits blancs FINS (demande de Paul,
      // 2026-08-11), une chaîne d'étoile en étoile.
      for (var l = 1; l < points.length; l += 1) {
        liens += '<line x1="' + points[l - 1].x.toFixed(1) + '" y1="' + points[l - 1].y.toFixed(1) +
          '" x2="' + points[l].x.toFixed(1) + '" y2="' + points[l].y.toFixed(1) +
          '" stroke="#ffffff" stroke-width="0.7" opacity="0.42"/>';
      }

      points.forEach(function (point, rang) {
        var taille = rang === 0 ? 4.2 : 2.6 + alea() * 1.2;
        etoiles += '<g>' +
          '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) +
            '" r="' + (taille * 2.6).toFixed(1) + '" fill="#d8bd82" opacity="0.10"/>' +
          '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) +
            '" r="' + taille.toFixed(1) + '" fill="#f2ead6"/>' +
          '</g>';
      });

      // Le nom de la constellation : or, capitales espacées — le cartouche
      // gravé, transposé au ciel.
      noms += '<text x="' + ccx.toFixed(1) + '" y="' + (ccy - rayon * 0.46).toFixed(1) +
        '" text-anchor="middle" font-size="11" letter-spacing="2.5" fill="#d8bd82" ' +
        'opacity="0.85" font-family="Palatino, Georgia, serif">' + constellation.nom + '</text>';
    });

    // Trois liens INTER-constellations : les relations qui traversent les
    // métiers. Ce sont elles qui font le réseau, et elles doivent se voir.
    [[0, 3], [1, 4], [2, 5]].forEach(function (paire) {
      var a = centres[paire[0]];
      var b = centres[paire[1]];
      liens += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
        '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) +
        '" stroke="#ffffff" stroke-width="0.5" opacity="0.16"/>';
    });

    svg.innerHTML = '<g>' + poussiere + '</g><g>' + liens + '</g><g>' + etoiles + '</g><g>' + noms + '</g>';
    scene.insertBefore(svg, scene.firstChild);
  }

  // ======================================================================
  // ③  Le bandeau de MESURE — critère ④ du cadrage
  // ======================================================================

  // Les fonds en dégradé n'ont pas de `background-color` lisible. On leur
  // substitue leur teinte la plus CLAIRE (le halo, pas le bord) : c'est le
  // PIRE CAS pour du texte crème, et un pire cas se construit, il ne s'espère
  // pas (leçon du foyer DRAUKHAIN, 2026-08-01).
  var FONDS_DEGRADE = [
    { selecteur: '.ciel-scene', couleur: [14, 27, 47] },
    { selecteur: 'body', couleur: [14, 26, 46] }
  ];

  function versRGBA(texte) {
    var m = /rgba?\(([^)]+)\)/.exec(texte || '');
    if (!m) { return null; }
    var n = m[1].split(',').map(function (v) { return parseFloat(v); });
    return { r: n[0], v: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  }

  function superposer(bas, haut) { // haut par-dessus bas, alpha du haut
    return {
      r: haut.a * haut.r + (1 - haut.a) * bas.r,
      v: haut.a * haut.v + (1 - haut.a) * bas.v,
      b: haut.a * haut.b + (1 - haut.a) * bas.b,
      a: 1
    };
  }

  function fondEffectif(element) {
    var couches = [];
    var noeud = element;
    while (noeud && noeud.nodeType === 1) {
      var style = getComputedStyle(noeud);
      var fond = versRGBA(style.backgroundColor);
      if (fond && fond.a > 0) { couches.push(fond); }
      if (/gradient/.test(style.backgroundImage)) {
        var trouve = null;
        FONDS_DEGRADE.forEach(function (entree) {
          if (!trouve && noeud.matches(entree.selecteur)) { trouve = entree.couleur; }
        });
        couches.push({ r: (trouve || [10, 18, 32])[0], v: (trouve || [10, 18, 32])[1],
                       b: (trouve || [10, 18, 32])[2], a: 1 });
        break;
      }
      noeud = noeud.parentElement;
    }
    if (!couches.length) { return { r: 10, v: 18, b: 32, a: 1 }; }
    var resultat = couches[couches.length - 1];
    for (var i = couches.length - 2; i >= 0; i -= 1) {
      resultat = superposer(resultat, couches[i]);
    }
    return resultat;
  }

  function canal(v) {
    var c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(couleur) {
    return 0.2126 * canal(couleur.r) + 0.7152 * canal(couleur.v) + 0.0722 * canal(couleur.b);
  }
  function contraste(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function hexa(couleur) {
    return '#' + [couleur.r, couleur.v, couleur.b].map(function (v) {
      return ('0' + Math.round(v).toString(16)).slice(-2);
    }).join('');
  }

  var mesures = {}; // libellé → mesure (accumulées sur TOUS les états)

  function mesurerEtatCourant() {
    document.querySelectorAll('[data-mesure]').forEach(function (element) {
      if (!element.getClientRects().length) { return; } // invisible : rien à mesurer
      var style = getComputedStyle(element);
      var texte = versRGBA(style.color);
      if (!texte) { return; }
      var fond = fondEffectif(element.parentElement || element);
      if (texte.a < 1) { texte = superposer(fond, texte); }

      var taille = parseFloat(style.fontSize);
      var gras = parseInt(style.fontWeight, 10) >= 700;
      var grand = taille >= 24 || (taille >= 18.66 && gras);
      var exige = grand ? 3 : 4.5;
      var ratio = contraste(texte, fond);

      mesures[element.getAttribute('data-mesure')] = {
        libelle: element.getAttribute('data-mesure'),
        texte: hexa(texte),
        fond: hexa(fond),
        ratio: ratio,
        exige: exige,
        conforme: ratio >= exige,
        luminanceFond: luminance(fond)
      };
    });
  }

  function rendreMesures() {
    var lignes = Object.keys(mesures).map(function (cle) { return mesures[cle]; });
    lignes.sort(function (a, b) { return a.ratio - b.ratio; }); // les pires en tête

    var corps = document.getElementById('mq-lignes');
    corps.innerHTML = '';
    var defauts = 0;
    var fondLePlusClair = 0;

    lignes.forEach(function (mesure) {
      if (!mesure.conforme) { defauts += 1; }
      if (mesure.luminanceFond > fondLePlusClair) { fondLePlusClair = mesure.luminanceFond; }
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + mesure.libelle + '</td>' +
        '<td><span class="mq-echantillon" style="background:' + mesure.texte + '"></span>' + mesure.texte + '</td>' +
        '<td><span class="mq-echantillon" style="background:' + mesure.fond + '"></span>' + mesure.fond + '</td>' +
        '<td>' + mesure.ratio.toFixed(2) + ':1</td>' +
        '<td>' + mesure.exige.toFixed(1) + ':1</td>' +
        '<td class="' + (mesure.conforme ? 'mq-ok' : 'mq-defaut') + '">' +
          (mesure.conforme ? 'conforme' : 'DÉFAUT') + '</td>';
      corps.appendChild(tr);
    });

    var verdict = document.getElementById('mq-verdict');
    verdict.textContent = defauts === 0
      ? lignes.length + ' couples mesurés · 0 défaut'
      : lignes.length + ' couples mesurés · ' + defauts + ' DÉFAUT' + (defauts > 1 ? 'S' : '');
    verdict.className = 'mq-verdict ' + (defauts === 0 ? 'mq-verdict--ok' : 'mq-verdict--defaut');

    document.getElementById('mq-luminance').textContent =
      'Fond le plus clair rencontré : luminance ' + fondLePlusClair.toFixed(4) +
      ' (plancher du cadrage : < 0,20 — ' + (fondLePlusClair < 0.2 ? 'tenu' : 'DÉPASSÉ') + ').' +
      ' Mesures accumulées sur les huit états, pas sur le seul état affiché.';

    // Exposé pour le harnais : une maquette qui se mesure doit pouvoir être
    // interrogée par un test, pas seulement lue par un humain.
    window.MAQUETTE_NUIT = { mesures: lignes, defauts: defauts, luminanceMax: fondLePlusClair };
  }

  // ======================================================================
  //  Amorçage : on parcourt les huit états une fois, on mesure chacun, puis
  //  on revient au Ciel. Mesurer le seul état affiché ne prouverait rien —
  //  un écran non éprouvé est un écran cassé (leçon du 2026-08-12).
  // ======================================================================

  function amorcer() {
    document.querySelectorAll('.mq-etats .mq-bouton').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        appliquerEtat(bouton.getAttribute('data-etat'));
        mesurerEtatCourant();
        rendreMesures();
      });
    });

    var corpsMesure = document.getElementById('mq-mesure-corps');
    document.getElementById('mq-replier').addEventListener('click', function () {
      var replie = corpsMesure.hidden;
      corpsMesure.hidden = !replie;
      this.textContent = replie ? 'Replier' : 'Déplier';
    });

    Object.keys(ETATS).forEach(function (nom) {
      appliquerEtat(nom);
      mesurerEtatCourant();
    });

    appliquerEtat('ciel');
    rendreMesures();

    var minuteur = null;
    window.addEventListener('resize', function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(dessinerCiel, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', amorcer);
  } else {
    amorcer();
  }
}());
