// Script de la maquette THORIOL — SÉPARÉ de la page, à dessein.
// Le CSP d'Ultima pose `script-src 'self'` SANS 'unsafe-inline' (middleware.js,
// matcher '/:path*' — donc /design/* aussi) : un <script> inline serait bloqué
// sur la preview Vercel et la maquette s'ouvrirait MUETTE. Constat du
// 2026-08-04, appliqué ici dès la première ligne.
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Jeu de maquette — INVENTÉ (§5). Un même but, plusieurs moyens.
  //   etat : 'tenu' (il porte) | 'reserve' (prêt, jamais employé) | 'ecarte'
  //   cause : pourquoi il a cassé — c'est ELLE qu'on anticipe.
  // L'ordre compte : le volume 1 doit tomber sur le plan tenu, le volume 3 sur
  // les trois états (c'est le réel d'aujourd'hui : THORIOL porte 3 futurs).
  // ---------------------------------------------------------------------
  var PLANS = [
    { nom: 'Le bouche-à-oreille du réseau', etat: 'tenu' },
    { nom: 'La recommandation d’un pair', etat: 'reserve' },
    { nom: 'La prospection directe', etat: 'ecarte', cause: 'trop lente pour la trésorerie' },
    { nom: 'L’offre d’essai à prix coûtant', etat: 'reserve' },
    { nom: 'Le partenariat avec un installateur', etat: 'reserve' },
    { nom: 'La vitrine en ligne', etat: 'ecarte', cause: 'aucun passage sans référence' },
    { nom: 'Le salon professionnel', etat: 'reserve' },
    { nom: 'La sous-traitance pour un confrère', etat: 'reserve' }
  ];

  var NS = 'http://www.w3.org/2000/svg';
  var L = 640, H = 400, MARGE = 10, LARGEUR_CAR = 6.1;
  var etat = { forme: 'A', volume: 3 };

  var LIBELLE = { tenu: 'le plan tenu', reserve: 'en réserve', ecarte: 'écarté' };

  function jeu() { return PLANS.slice(0, etat.volume); }
  function par(e) { return jeu().filter(function (p) { return p.etat === e; }); }

  function svgEl(nom, classe) {
    var n = document.createElementNS(NS, nom);
    if (classe) { n.setAttribute('class', classe); }
    return n;
  }
  function attrs(n, o) {
    Object.keys(o).forEach(function (k) { n.setAttribute(k, String(o[k])); });
    return n;
  }
  function el(nom, classe, texte) {
    var n = document.createElement(nom);
    if (classe) { n.className = classe; }
    if (texte !== undefined) { n.textContent = texte; }
    return n;
  }

  // Budget de signes : la place RÉELLEMENT disponible, jamais une troncature à
  // l'aveugle (règle du 2026-08-01, motif DRAUKHAIN/VRANESH réemployé).
  function borner(texte, signes) {
    var t = (texte || '').trim();
    if (signes < 6) { return ''; }
    if (t.length <= signes) { return t; }
    var mots = t.slice(0, signes).split(' ');
    if (mots.length > 1) { mots.pop(); }
    return mots.join(' ') + '…';
  }

  function texteSvg(classe, x, y, ancre, contenu) {
    var t = svgEl('text', classe);
    attrs(t, { x: x, y: y, 'text-anchor': ancre });
    t.textContent = contenu;
    return t;
  }

  // La terre : le trait de sol et sa hachure. Commun aux formes A et B — c'est
  // l'élément de THORIOL, il ne se dessine pas deux fois de deux façons.
  function poserLaTerre(svg, ySol, legende) {
    var sol = svgEl('path', 't-sol');
    sol.setAttribute('d', 'M' + MARGE + ' ' + ySol + ' H ' + (L - MARGE));
    svg.appendChild(sol);
    for (var x = MARGE + 6; x < L - MARGE; x += 16) {
      var h = svgEl('path', 't-hachure');
      h.setAttribute('d', 'M' + x + ' ' + ySol + ' l -7 12');
      svg.appendChild(h);
    }
    if (legende) {
      svg.appendChild(texteSvg('t-legende', L - MARGE - 2, ySol + 26, 'end', legende));
    }
  }

  // ---------------------------------------------------------------------
  // FORME A — LE CHANTIER : l'ouvrage monte depuis la terre.
  //   · le plan TENU  = l'assise en place, sur le socle ;
  //   · les RÉSERVES  = des pierres d'attente, taillées, rangées de côté ;
  //   · les ÉCARTÉS   = des pierres fendues au pied, la cause sous la fente.
  // ---------------------------------------------------------------------
  function rendreA() {
    var svg = document.getElementById('svg-a');
    svg.textContent = '';
    svg.classList.remove('a-choix');
    var groupes = [];
    var Y_SOL = 300;

    poserLaTerre(svg, Y_SOL, 'la terre — le socle d’où l’on bâtit');

    // Le socle : ce qui est déjà acquis, sous l'assise du jour.
    var socle = svgEl('rect', 't-socle');
    attrs(socle, { x: 120, y: Y_SOL - 26, width: 250, height: 26, rx: 2 });
    svg.appendChild(socle);
    svg.appendChild(texteSvg('t-legende', 245, Y_SOL - 8, 'middle', 'le projet, déjà bâti'));

    // ① L'assise tenue.
    var tenu = par('tenu')[0];
    if (tenu) {
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', tenu.nom + ' — ' + LIBELLE.tenu);
      var pierre = svgEl('rect', 'p-tenu');
      attrs(pierre, { x: 120, y: Y_SOL - 62, width: 250, height: 34, rx: 2 });
      g.appendChild(pierre);
      g.appendChild(texteSvg('t-nom', 245, Y_SOL - 40, 'middle', borner(tenu.nom, 38)));
      g.appendChild(texteSvg('t-etat', 245, Y_SOL - 70, 'middle', 'l’assise en place'));
      var zone = svgEl('rect', 'z-zone');
      attrs(zone, { x: 120, y: Y_SOL - 62, width: 250, height: 34 });
      g.appendChild(zone);
      brancher(g, groupes, svg, tenu, 'parole-a');
      svg.appendChild(g);
    }

    // ② Les pierres d'attente : taillées, alignées, prêtes.
    var reserves = par('reserve');
    svg.appendChild(texteSvg('t-legende', 505, 46, 'middle', 'les pierres d’attente'));
    reserves.forEach(function (p, i) {
      var y = 62 + i * 34;
      if (y > Y_SOL - 44) { return; }   // au-delà, la pile sortirait de la terre
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', p.nom + ' — ' + LIBELLE.reserve);
      var pierre = svgEl('rect', 'p-reserve');
      attrs(pierre, { x: 400, y: y, width: 210, height: 26, rx: 2 });
      g.appendChild(pierre);
      g.appendChild(texteSvg('t-nom', 505, y + 18, 'middle', borner(p.nom, 32)));
      var zone = svgEl('rect', 'z-zone');
      attrs(zone, { x: 400, y: y, width: 210, height: 26 });
      g.appendChild(zone);
      brancher(g, groupes, svg, p, 'parole-a');
      svg.appendChild(g);
    });

    // ③ Les pierres fendues, au pied de l'ouvrage, cause dessous.
    var ecartes = par('ecarte');
    ecartes.forEach(function (p, i) {
      var x = 30 + i * 175;
      var y = Y_SOL + 44;
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', p.nom + ' — ' + LIBELLE.ecarte + ' : ' + (p.cause || ''));
      var pierre = svgEl('rect', 'p-ecarte');
      attrs(pierre, { x: x, y: y, width: 160, height: 24, rx: 2 });
      g.appendChild(pierre);
      var fissure = svgEl('path', 'p-fissure');
      fissure.setAttribute('d', 'M' + (x + 74) + ' ' + y + ' l 8 8 l -7 8 l 6 8');
      g.appendChild(fissure);
      g.appendChild(texteSvg('t-nom', x + 80, y - 8, 'middle', borner(p.nom, 26)));
      g.appendChild(texteSvg('t-cause', x + 80, y + 38, 'middle', borner(p.cause, 30)));
      var zone = svgEl('rect', 'z-zone');
      attrs(zone, { x: x, y: y, width: 160, height: 24 });
      g.appendChild(zone);
      brancher(g, groupes, svg, p, 'parole-a');
      svg.appendChild(g);
    });
  }

  // ---------------------------------------------------------------------
  // FORME B — LA GREFFE : « faire pousser une nouvelle branche, même projet ».
  //   · le TRONC      = le projet, enraciné dans la terre ;
  //   · la branche TENUE   = feuillue, elle porte ;
  //   · les ÉCARTÉS   = moignons secs, cicatrisés, cause dessous ;
  //   · les RÉSERVES  = greffes ligaturées au tronc, en attente de pousse.
  // ---------------------------------------------------------------------
  function rendreB() {
    var svg = document.getElementById('svg-b');
    svg.textContent = '';
    svg.classList.remove('a-choix');
    var groupes = [];
    var Y_SOL = 300, TRONC_X = 300;

    poserLaTerre(svg, Y_SOL, 'la terre — les appuis');

    // Les racines : ce sur quoi le projet tient. Le pendant souterrain du socle.
    [-1, 1].forEach(function (sens) {
      [22, 52, 84].forEach(function (portee, i) {
        var r = svgEl('path', 'p-racine');
        r.setAttribute('d', 'M' + TRONC_X + ' ' + Y_SOL
          + ' q ' + (sens * portee * 0.5) + ' ' + (14 + i * 4)
          + ' ' + (sens * portee) + ' ' + (26 + i * 8));
        svg.appendChild(r);
      });
    });

    // Le tronc : le projet lui-même, il ne change pas.
    var tronc = svgEl('path', 'p-tenu');
    tronc.setAttribute('d', 'M' + (TRONC_X - 9) + ' ' + Y_SOL
      + ' L ' + (TRONC_X - 6) + ' 150 L ' + (TRONC_X + 6) + ' 150 L ' + (TRONC_X + 9) + ' ' + Y_SOL + ' Z');
    svg.appendChild(tronc);
    svg.appendChild(texteSvg('t-legende', TRONC_X, 140, 'middle', 'le projet'));

    // ① La branche qui porte : à droite, feuillue, franche.
    var tenu = par('tenu')[0];
    if (tenu) {
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', tenu.nom + ' — ' + LIBELLE.tenu);
      var br = svgEl('path', 'p-tenu');
      attrs(br, { fill: 'none' });
      br.setAttribute('d', 'M' + TRONC_X + ' 232 Q 380 210 452 164');
      g.appendChild(br);
      [[452, 164], [430, 152], [408, 174]].forEach(function (pt, i) {
        var f = svgEl('ellipse', 'p-feuille');
        attrs(f, { cx: pt[0], cy: pt[1], rx: 11 - i, ry: 6, transform: 'rotate(-28 ' + pt[0] + ' ' + pt[1] + ')' });
        g.appendChild(f);
      });
      // Le nom monte à 132/145 : à huit plans, la pile des greffes atteignait
      // 184 et venait croiser ces deux lignes (croisement MESURÉ, pas supposé).
      g.appendChild(texteSvg('t-nom', 470, 132, 'start', borner(tenu.nom, 26)));
      g.appendChild(texteSvg('t-etat', 470, 145, 'start', 'elle porte aujourd’hui'));
      var zone = svgEl('circle', 'z-zone');
      attrs(zone, { cx: 440, cy: 168, r: 34 });
      g.appendChild(zone);
      brancher(g, groupes, svg, tenu, 'parole-b');
      svg.appendChild(g);
    }

    // ② Les greffes ligaturées : prêtes à pousser, sur le MÊME tronc.
    // La pile des greffes est BORNÉE à trois : au-delà, le tronc se hérisse et
    // les étiquettes se croisent. Le reste tient en une borne chiffrée — motif
    // repris de la voie DRAUKHAIN (VOIE_MAX_FLAMMES), réemployé, pas réinventé.
    var reserves = par('reserve');
    var MAX_GREFFES = 3;
    if (reserves.length > MAX_GREFFES) {
      var reste = reserves.length - MAX_GREFFES;
      svg.appendChild(texteSvg('t-etat', TRONC_X + 82, 282, 'start',
        '+ ' + reste + (reste > 1 ? ' autres greffes prêtes' : ' autre greffe prête')));
    }
    reserves.slice(0, MAX_GREFFES).forEach(function (p, i) {
      var y = 258 - i * 26;
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', p.nom + ' — ' + LIBELLE.reserve);
      var pousse = svgEl('path', 'p-reserve');
      pousse.setAttribute('d', 'M' + TRONC_X + ' ' + y + ' q 46 -6 74 -22');
      g.appendChild(pousse);
      // La ligature : la marque du greffon. C'est elle qui dit « prêt, pas encore ».
      var lig = svgEl('path', 'p-ligature');
      lig.setAttribute('d', 'M' + (TRONC_X + 10) + ' ' + (y - 5) + ' l 0 10');
      g.appendChild(lig);
      g.appendChild(texteSvg('t-nom', TRONC_X + 82, y - 24, 'start', borner(p.nom, 30)));
      var zone = svgEl('rect', 'z-zone');
      attrs(zone, { x: TRONC_X, y: y - 30, width: 250, height: 26 });
      g.appendChild(zone);
      brancher(g, groupes, svg, p, 'parole-b');
      svg.appendChild(g);
    });

    // ③ Les moignons secs : coupés, cicatrisés, la cause gravée dessous.
    var ecartes = par('ecarte');
    ecartes.forEach(function (p, i) {
      var y = 250 - i * 46;
      var g = svgEl('g', 'g-plan');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', p.nom + ' — ' + LIBELLE.ecarte + ' : ' + (p.cause || ''));
      var moignon = svgEl('path', 'p-ecarte');
      moignon.setAttribute('d', 'M' + TRONC_X + ' ' + y + ' l -46 -10 l -14 6');
      g.appendChild(moignon);
      // La cicatrice : deux traits croisés au point de coupe.
      var cic = svgEl('path', 'p-fissure');
      cic.setAttribute('d', 'M' + (TRONC_X - 66) + ' ' + (y - 8) + ' l -8 8 M' + (TRONC_X - 74) + ' ' + (y - 8) + ' l 8 8');
      g.appendChild(cic);
      g.appendChild(texteSvg('t-nom', TRONC_X - 86, y - 6, 'end', borner(p.nom, 24)));
      g.appendChild(texteSvg('t-cause', TRONC_X - 86, y + 8, 'end', borner(p.cause, 28)));
      var zone = svgEl('rect', 'z-zone');
      attrs(zone, { x: TRONC_X - 260, y: y - 20, width: 260, height: 32 });
      g.appendChild(zone);
      brancher(g, groupes, svg, p, 'parole-b');
      svg.appendChild(g);
    });
  }

  // ---------------------------------------------------------------------
  // FORME C — LE REGISTRE GRAVÉ : aucun dessin, trois blocs, causes en entier.
  // ---------------------------------------------------------------------
  function rendreC() {
    var zone = document.getElementById('registre-c');
    zone.textContent = '';
    [['tenu', 'Ce qui porte aujourd’hui'],
     ['reserve', 'Ce qui est prêt — les plans B'],
     ['ecarte', 'Ce qui a cassé, et pourquoi']].forEach(function (paire) {
      var liste = par(paire[0]);
      if (liste.length === 0) { return; }
      var bloc = el('div', 'registre-bloc');
      bloc.appendChild(el('h4', null, paire[1]));
      liste.forEach(function (p) {
        var ligne = el('div', 'registre-ligne');
        ligne.tabIndex = 0;
        ligne.appendChild(el('span', 'pastille', LIBELLE[p.etat]));
        ligne.appendChild(el('span', 'registre-nom', p.nom));
        if (p.cause) { ligne.appendChild(el('span', 'registre-cause', '— ' + p.cause)); }
        ligne.addEventListener('mouseenter', function () { parole('parole-c', p); });
        ligne.addEventListener('focus', function () { parole('parole-c', p); });
        ligne.addEventListener('mouseleave', function () { repos('parole-c'); });
        ligne.addEventListener('blur', function () { repos('parole-c'); });
        bloc.appendChild(ligne);
      });
      zone.appendChild(bloc);
    });
  }

  // ---------------------------------------------------------------------
  // La parole : UNE ligne au survol (grammaire actée le 2026-08-01).
  // ---------------------------------------------------------------------
  var REPOS = {
    'parole-a': 'Survole une pierre — elle te dit ce qu’elle est.',
    'parole-b': 'Survole une branche — elle te dit ce qu’elle est.',
    'parole-c': 'Survole une ligne — elle te dit ce qu’elle est.'
  };

  function parole(id, p) {
    var zone = document.getElementById(id);
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'parole-nom', p.nom));
    var suite = ' — ' + LIBELLE[p.etat];
    if (p.etat === 'ecarte' && p.cause) { suite += ' : ' + p.cause; }
    if (p.etat === 'reserve') { suite += ' — prêt à prendre le relais'; }
    zone.appendChild(document.createTextNode(suite));
  }
  function repos(id) {
    var zone = document.getElementById(id);
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'parole-repos', REPOS[id] || ''));
  }

  function brancher(g, groupes, svg, p, idParole) {
    function allumer() {
      svg.classList.add('a-choix');
      groupes.forEach(function (o) { o.classList.remove('is-actif'); });
      g.classList.add('is-actif');
      parole(idParole, p);
    }
    function eteindre() {
      svg.classList.remove('a-choix');
      g.classList.remove('is-actif');
      repos(idParole);
    }
    g.addEventListener('mouseenter', allumer);
    g.addEventListener('mouseleave', eteindre);
    g.addEventListener('focus', allumer);
    g.addEventListener('blur', eteindre);
    groupes.push(g);
  }

  // ---------------------------------------------------------------------
  // LA MESURE — règle du 2026-08-01, complétée le 2026-08-04 : tenir dans le
  // cadre ne suffit pas, deux étiquettes qui se croisent sont illisibles À
  // L'INTÉRIEUR du cadre. On mesure donc les deux.
  // ---------------------------------------------------------------------
  function mesurer() {
    var zone = document.getElementById('mesure');
    zone.textContent = '';
    var panneau = document.getElementById('panneau-' + etat.forme);
    var svg = panneau.querySelector('.carte-svg');

    if (svg) {
      var vb = svg.viewBox.baseVal;
      var min = { x: Infinity, y: Infinity }, max = { x: -Infinity, y: -Infinity };
      Array.prototype.forEach.call(svg.querySelectorAll('text, path, rect, circle, ellipse'), function (n) {
        if (n.classList.contains('z-zone')) { return; }   // zone de préhension : invisible
        var b;
        try { b = n.getBBox(); } catch (e) { return; }
        if (!b || (b.width === 0 && b.height === 0)) { return; }
        min.x = Math.min(min.x, b.x); min.y = Math.min(min.y, b.y);
        max.x = Math.max(max.x, b.x + b.width); max.y = Math.max(max.y, b.y + b.height);
      });
      var dedans = min.x >= vb.x - 0.5 && min.y >= vb.y - 0.5
        && max.x <= vb.x + vb.width + 0.5 && max.y <= vb.y + vb.height + 0.5;
      zone.appendChild(el('span', dedans ? 'ok' : 'ko',
        'cadre : ' + Math.round(min.x) + '…' + Math.round(max.x) + ' × '
        + Math.round(min.y) + '…' + Math.round(max.y)
        + (dedans ? ' — tout tient ✓' : ' — ça déborde ✗')));

      var boites = [];
      Array.prototype.forEach.call(svg.querySelectorAll('.t-nom, .t-cause, .t-etat'), function (n) {
        var b;
        try { b = n.getBBox(); } catch (e) { return; }
        if (b && b.width > 0) { boites.push(b); }
      });
      var croisements = 0;
      for (var i = 0; i < boites.length; i += 1) {
        for (var j = i + 1; j < boites.length; j += 1) {
          var a = boites[i], c = boites[j];
          if (a.x < c.x + c.width - 1 && c.x < a.x + a.width - 1
            && a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1) { croisements += 1; }
        }
      }
      zone.appendChild(el('span', croisements === 0 ? 'ok' : 'ko',
        croisements === 0 ? 'étiquettes : aucun croisement ✓'
          : 'étiquettes : ' + croisements + ' croisement(s) ✗'));
    }

    // Les trois exigences : une forme qui en rate une est écartée. On les
    // vérifie sur le RENDU, pas sur l'intention.
    var rendu = (panneau.textContent || '').toLowerCase();
    var attendus = [
      ['le plan tenu', par('tenu').length === 0 || rendu.indexOf('porte') !== -1],
      ['les réserves', par('reserve').length === 0 || rendu.indexOf('prêt') !== -1
        || rendu.indexOf('attente') !== -1 || rendu.indexOf('réserve') !== -1],
      ['les causes', par('ecarte').length === 0
        || par('ecarte').every(function (p) { return rendu.indexOf(p.cause.slice(0, 14).toLowerCase()) !== -1; })]
    ];
    var manques = attendus.filter(function (a) { return !a[1]; }).map(function (a) { return a[0]; });
    zone.appendChild(el('span', manques.length === 0 ? 'ok' : 'ko',
      manques.length === 0 ? 'les trois états sont dits ✓' : 'manque : ' + manques.join(', ') + ' ✗'));

    var texte = (panneau.querySelector('.cartouche').textContent || '').replace(/\s+/g, ' ').trim();
    zone.appendChild(el('span', null, 'mots à l’écran : ' + (texte ? texte.split(' ').length : 0)));
    zone.appendChild(el('span', null, 'plans : ' + etat.volume));
  }

  // ---------------------------------------------------------------------
  // Bascules.
  // ---------------------------------------------------------------------
  function rendre() {
    ['A', 'B', 'C'].forEach(function (f) {
      document.getElementById('panneau-' + f).hidden = (f !== etat.forme);
    });
    if (etat.forme === 'A') { rendreA(); repos('parole-a'); }
    if (etat.forme === 'B') { rendreB(); repos('parole-b'); }
    if (etat.forme === 'C') { rendreC(); repos('parole-c'); }
    mesurer();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-forme]'), function (b) {
    b.addEventListener('click', function () {
      etat.forme = b.dataset.forme;
      Array.prototype.forEach.call(document.querySelectorAll('[data-forme]'), function (o) {
        o.setAttribute('aria-pressed', String(o === b));
      });
      rendre();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-volume]'), function (b) {
    b.addEventListener('click', function () {
      etat.volume = parseInt(b.dataset.volume, 10);
      Array.prototype.forEach.call(document.querySelectorAll('[data-volume]'), function (o) {
        o.setAttribute('aria-pressed', String(o === b));
      });
      rendre();
    });
  });

  rendre();
})();
