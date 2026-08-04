// Script de la maquette DRAUKHAIN — SÉPARÉ de la page à dessein.
// Le CSP d'Ultima pose `script-src 'self'` SANS 'unsafe-inline' (middleware.js) :
// un <script> inline serait bloqué sur la preview Vercel et la maquette
// s'ouvrirait muette, trois cartouches vides. Un fichier servi en propre passe.
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  // Jeu de maquette — INVENTÉ (§5). Douze serments, du plus nourri au plus nu.
  // `f` = nombre de flammes ; `fils` = caps reliés (z=ZEKROM, v=VRANESH, m=MINETHNIR).
  // ---------------------------------------------------------------------
  var SERMENTS = [
    { nom: 'Tenir la parole donnée',   f: 3, fils: ['z'] },
    { nom: 'La forge quotidienne',     f: 5, fils: ['z', 'm'] },
    { nom: 'Ne rien devoir au hasard', f: 2, fils: ['v'] },
    { nom: 'Bâtir avant de parler',    f: 0, fils: [] },
    { nom: 'L’heure du matin',    f: 4, fils: ['m'] },
    { nom: 'Dire non sans trembler',   f: 0, fils: ['v'] },
    { nom: 'La patience du chêne',     f: 2, fils: ['v', 'm'] },
    { nom: 'Transmettre ce que je sais', f: 1, fils: ['z'] },
    { nom: 'Le corps comme outil',     f: 1, fils: [] },
    { nom: 'L’argent sert, il ne commande pas', f: 3, fils: ['z', 'v'] },
    { nom: 'Ne pas fuir le conflit utile', f: 0, fils: [] },
    { nom: 'Marcher chaque jour',      f: 6, fils: ['m', 'v'] }
  ];

  var CAPS = {
    z: { nom: 'ZEKROM',    role: 'l’idéal dont il naît', x: 74,  y: 58 },
    v: { nom: 'VRANESH',   role: 'ce qui le menace ou le sert', x: 566, y: 58 },
    m: { nom: 'MINETHNIR', role: 'où il se suit', x: 74, y: 362 }
  };

  var NS = 'http://www.w3.org/2000/svg';
  var CARTE = { L: 640, H: 420, CX: 330, CY: 214, MARGE: 8, LARGEUR_CAR: 6.1 };

  var etat = { forme: 'A', volume: 1 };

  function jeu() { return SERMENTS.slice(0, etat.volume); }

  function svgEl(nom, classe) {
    var e = document.createElementNS(NS, nom);
    if (classe) { e.setAttribute('class', classe); }
    return e;
  }
  function attrs(e, o) {
    Object.keys(o).forEach(function (k) { e.setAttribute(k, String(o[k])); });
    return e;
  }
  function el(nom, classe, texte) {
    var e = document.createElement(nom);
    if (classe) { e.className = classe; }
    if (texte !== undefined) { e.textContent = texte; }
    return e;
  }
  function compteFlammes(n) {
    if (n === 0) { return 'à raviver'; }
    return n + (n > 1 ? ' flammes' : ' flamme');
  }

  // Le tracé d'une flamme gravée, posée en (x, y), de hauteur donnée.
  // Motif repris tel quel de js/draukhain.js — réemployé, pas réinventé.
  function traceFlamme(x, y, h) {
    var l = h * 0.42;
    return 'M' + x + ' ' + (y - h)
      + ' q ' + l + ' ' + (h * 0.62) + ' 0 ' + h
      + ' q ' + (-l) + ' ' + (-h * 0.38) + ' 0 ' + (-h) + ' Z';
  }

  // Budget de signes d'une étiquette : la place RÉELLEMENT disponible de son
  // côté, jamais une troncature à l'aveugle (règle du 2026-08-01).
  function borner(texte, signes) {
    var t = (texte || '').trim();
    if (signes < 6) { return ''; }
    if (t.length <= signes) { return t; }
    var mots = t.slice(0, signes).split(' ');
    if (mots.length > 1) { mots.pop(); }
    return mots.join(' ') + '…';
  }

  // ---------------------------------------------------------------------
  // FORME A — LA VOÛTE : les serments en couronne autour du cœur du cap,
  // les caps voisins en cartouches de bord, les fils tissés entre les deux.
  // ---------------------------------------------------------------------
  function couronne(n) {
    var out = [];
    if (n <= 0) { return out; }
    var rayon = n === 1 ? 0 : Math.min(132, 84 + n * 4);
    for (var i = 0; i < n; i += 1) {
      var angle = (-90 + i * (360 / n)) * Math.PI / 180;
      var cos = n === 1 ? 0 : Math.cos(angle);
      var sin = n === 1 ? 0 : Math.sin(angle);
      var x = CARTE.CX + rayon * cos;
      var y = CARTE.CY + rayon * sin;
      var ancre = cos < -0.15 ? 'end' : (cos > 0.15 ? 'start' : 'middle');
      var dispo;
      if (ancre === 'end') { dispo = x - 2 * CARTE.MARGE; }
      else if (ancre === 'start') { dispo = CARTE.L - x - 2 * CARTE.MARGE; }
      else { dispo = 2 * Math.min(x, CARTE.L - x) - CARTE.MARGE; }
      out.push({
        x: x, y: y, ancre: ancre,
        signes: Math.max(0, Math.floor(dispo / CARTE.LARGEUR_CAR))
      });
    }
    return out;
  }

  function rendreA() {
    var svg = document.getElementById('svg-a');
    svg.textContent = '';
    svg.classList.remove('a-choix');
    var serments = jeu();

    // Le cœur du cap : la flamme qui ne s'éteint pas (blason DRAUKHAIN).
    var anneau = svgEl('circle', 'n-cercle-or');
    attrs(anneau, { cx: CARTE.CX, cy: CARTE.CY, r: 30 });
    svg.appendChild(anneau);
    if (serments.length > 1) {
      var coeur = svgEl('path', 'n-coeur');
      coeur.setAttribute('d', traceFlamme(CARTE.CX, CARTE.CY + 11, 22));
      svg.appendChild(coeur);
      var coeurFeu = svgEl('path', 'n-coeur-feu');
      coeurFeu.setAttribute('d', traceFlamme(CARTE.CX, CARTE.CY + 9, 10));
      svg.appendChild(coeurFeu);
    }

    // Les cartouches des caps voisins, avec le compte de fils qui y aboutit.
    Object.keys(CAPS).forEach(function (cle) {
      var cap = CAPS[cle];
      var n = serments.filter(function (s) { return s.fils.indexOf(cle) !== -1; }).length;
      var g = svgEl('g', 'c-g');
      var rect = svgEl('rect', 'c-cartouche');
      attrs(rect, { x: cap.x - 52, y: cap.y - 17, width: 104, height: 34, rx: 5 });
      var nom = svgEl('text', 'c-nom');
      attrs(nom, { x: cap.x, y: cap.y - 2 });
      nom.textContent = cap.nom;
      var role = svgEl('text', 'c-role');
      attrs(role, { x: cap.x, y: cap.y + 10 });
      role.textContent = n === 0 ? 'aucun fil' : (n + (n > 1 ? ' fils' : ' fil'));
      g.appendChild(rect); g.appendChild(nom); g.appendChild(role);
      svg.appendChild(g);
    });

    var places = couronne(serments.length);
    var groupes = [];

    // Les fils d'abord (ils passent SOUS les feux).
    serments.forEach(function (s, i) {
      s.fils.forEach(function (cle) {
        var cap = CAPS[cle];
        var fil = svgEl('path', 'f-fil');
        fil.setAttribute('d', 'M' + places[i].x + ' ' + places[i].y
          + ' Q ' + ((places[i].x + cap.x) / 2) + ' ' + ((places[i].y + cap.y) / 2 - 26)
          + ' ' + cap.x + ' ' + (cap.y + (cle === 'm' ? -18 : 18)));
        fil.dataset.serment = String(i);
        svg.appendChild(fil);
      });
    });

    serments.forEach(function (s, i) {
      var p = places[i];
      var g = svgEl('g', 'n-g');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', s.nom + ' — ' + compteFlammes(s.f));

      if (s.f > 0) {
        var halo = svgEl('circle', 'n-halo');
        attrs(halo, { cx: p.x, cy: p.y, r: 11 + s.f * 1.9,
          opacity: Math.min(0.16, 0.04 + s.f * 0.022) });
        g.appendChild(halo);
        var feu = svgEl('path', 'n-feu');
        feu.setAttribute('d', traceFlamme(p.x, p.y + 8, 17 + Math.min(8, s.f * 1.4)));
        g.appendChild(feu);
        var coeurF = svgEl('path', 'n-feu-coeur');
        coeurF.setAttribute('d', traceFlamme(p.x, p.y + 6, 8));
        g.appendChild(coeurF);
      } else {
        var braise = svgEl('circle', 'n-braise');
        attrs(braise, { cx: p.x, cy: p.y, r: 9 });
        g.appendChild(braise);
      }

      // Un feu plein Nord ou plein Sud n'a personne à sa gauche ni à sa droite :
      // son nom se pose AU-DESSUS s'il est en haut, EN DESSOUS s'il est en bas —
      // sinon il vient croiser les étiquettes de ses deux voisins (constat
      // mesuré sur la première passe à douze serments).
      var nom = svgEl('text', 'n-nom');
      var dy = p.ancre !== 'middle' ? 3 : (p.y <= CARTE.CY ? -26 : 32);
      attrs(nom, { x: p.x + (p.ancre === 'end' ? -14 : (p.ancre === 'start' ? 14 : 0)),
        y: p.y + dy, 'text-anchor': p.ancre });
      nom.textContent = borner(s.nom, Math.min(26, p.signes));
      g.appendChild(nom);

      var zone = svgEl('circle', 'n-zone');
      attrs(zone, { cx: p.x, cy: p.y, r: 16 });
      g.appendChild(zone);

      function allumer() {
        svg.classList.add('a-choix');
        groupes.forEach(function (o) { o.classList.remove('is-actif'); });
        g.classList.add('is-actif');
        Array.prototype.forEach.call(svg.querySelectorAll('.f-fil'), function (f) {
          f.classList.toggle('is-vif', f.dataset.serment === String(i));
        });
        parole('parole-a', s);
      }
      function eteindre() {
        svg.classList.remove('a-choix');
        g.classList.remove('is-actif');
        Array.prototype.forEach.call(svg.querySelectorAll('.f-fil'), function (f) {
          f.classList.remove('is-vif');
        });
        repos('parole-a', 'Survole un feu — il te dit ce qu’il est.');
      }
      g.addEventListener('mouseenter', allumer);
      g.addEventListener('mouseleave', eteindre);
      g.addEventListener('focus', allumer);
      g.addEventListener('blur', eteindre);

      groupes.push(g);
      svg.appendChild(g);
    });
  }

  // ---------------------------------------------------------------------
  // FORME B — LE BRASIER : un seul feu, chaque serment en est une flamme.
  // ---------------------------------------------------------------------
  function rendreB() {
    var svg = document.getElementById('svg-b');
    svg.textContent = '';
    var serments = jeu();
    // Le brasier a son propre repère, plus bas que large : un feu couché sur son
    // lit de braise n'a que faire de la hauteur d'une carte.
    var base = 236;
    var pas = 560 / (serments.length + 1);

    var lit = svgEl('path', 'n-cercle-or');
    lit.setAttribute('d', 'M 44 ' + base + ' Q 320 ' + (base + 22) + ' 596 ' + base);
    svg.appendChild(lit);

    serments.forEach(function (s, i) {
      var x = 40 + pas * (i + 1);
      var hauteur = 40 + s.f * 12;
      var g = svgEl('g', 'n-g');
      attrs(g, { tabindex: '0', role: 'button' });
      g.setAttribute('aria-label', s.nom + ' — ' + compteFlammes(s.f));

      if (s.f > 0) {
        var halo = svgEl('circle', 'n-halo');
        attrs(halo, { cx: x, cy: base - hauteur / 2, r: hauteur * 0.44,
          opacity: Math.min(0.16, 0.04 + s.f * 0.022) });
        g.appendChild(halo);
        var feu = svgEl('path', 'n-feu');
        feu.setAttribute('d', traceFlamme(x, base, hauteur));
        g.appendChild(feu);
        var coeurF = svgEl('path', 'n-feu-coeur');
        coeurF.setAttribute('d', traceFlamme(x, base - 4, hauteur * 0.42));
        g.appendChild(coeurF);
      } else {
        var braise = svgEl('circle', 'n-braise');
        attrs(braise, { cx: x, cy: base - 12, r: 10 });
        g.appendChild(braise);
      }

      // Deux rangs d'étiquettes en alternance : à douze flammes, un rang
      // unique se chevaucherait. La place disponible fixe le budget de signes.
      var rang = i % 2;
      var nom = svgEl('text', 'n-nom');
      attrs(nom, { x: x, y: base + 24 + rang * 18, 'text-anchor': 'middle' });
      nom.textContent = borner(s.nom, Math.floor((pas * 1.9) / CARTE.LARGEUR_CAR));
      g.appendChild(nom);

      var zone = svgEl('rect', 'n-zone');
      attrs(zone, { x: x - pas / 2, y: base - hauteur - 14, width: pas, height: hauteur + 60 });
      g.appendChild(zone);

      g.addEventListener('mouseenter', function () { parole('parole-b', s); });
      g.addEventListener('focus', function () { parole('parole-b', s); });
      g.addEventListener('mouseleave', function () {
        repos('parole-b', 'Survole une flamme — elle te dit ce qu’elle est.');
      });
      g.addEventListener('blur', function () {
        repos('parole-b', 'Survole une flamme — elle te dit ce qu’elle est.');
      });
      svg.appendChild(g);
    });
  }

  // ---------------------------------------------------------------------
  // FORME C — LA FRISE DES STÈLES.
  // ---------------------------------------------------------------------
  function rendreC() {
    var frise = document.getElementById('frise-c');
    frise.textContent = '';
    jeu().forEach(function (s) {
      var b = el('button', 'stele');
      b.type = 'button';

      var svg = document.createElementNS(NS, 'svg');
      attrs(svg, { viewBox: '0 0 60 68', focusable: 'false', 'aria-hidden': 'true' });
      if (s.f > 0) {
        var feu = svgEl('path', 'n-feu');
        feu.setAttribute('d', traceFlamme(30, 46, 26 + Math.min(14, s.f * 2.6)));
        svg.appendChild(feu);
        var coeurF = svgEl('path', 'n-feu-coeur');
        coeurF.setAttribute('d', traceFlamme(30, 43, 11));
        svg.appendChild(coeurF);
      } else {
        var braise = svgEl('circle', 'n-braise');
        attrs(braise, { cx: 30, cy: 38, r: 11 });
        svg.appendChild(braise);
      }
      var socle = svgEl('path', 'n-cercle-or');
      socle.setAttribute('d', 'M 12 54 H 48');
      svg.appendChild(socle);
      b.appendChild(svg);

      b.appendChild(el('span', 'stele-nom', s.nom));
      b.appendChild(el('span', 'stele-compte', compteFlammes(s.f)));

      var fils = el('span', 'stele-fils');
      s.fils.forEach(function (cle) {
        fils.appendChild(el('span', 'fil-pastille', CAPS[cle].nom));
      });
      b.appendChild(fils);

      b.addEventListener('mouseenter', function () { parole('parole-c', s); });
      b.addEventListener('focus', function () { parole('parole-c', s); });
      b.addEventListener('mouseleave', function () {
        repos('parole-c', 'Survole une stèle — elle te dit ce qu’elle est.');
      });
      b.addEventListener('blur', function () {
        repos('parole-c', 'Survole une stèle — elle te dit ce qu’elle est.');
      });
      frise.appendChild(b);
    });
  }

  // ---------------------------------------------------------------------
  // La parole : UNE ligne au survol (grammaire actée le 2026-08-01).
  // ---------------------------------------------------------------------
  function parole(id, s) {
    var zone = document.getElementById(id);
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'parole-nom', s.nom));
    var suite = ' — ' + compteFlammes(s.f);
    if (s.fils.length) {
      suite += ' · relié à ' + s.fils.map(function (c) { return CAPS[c].nom; }).join(' et ');
    }
    zone.appendChild(document.createTextNode(suite));
  }
  function repos(id, texte) {
    var zone = document.getElementById(id);
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'parole-repos', texte));
  }

  // ---------------------------------------------------------------------
  // LA MESURE — règle permanente du 2026-08-01 : une géométrie se mesure,
  // elle ne se valide pas à l'œil. On compare l'emprise réelle du dessin au
  // viewBox, et on compte les mots affichés au repos.
  // ---------------------------------------------------------------------
  function mesurer() {
    var zone = document.getElementById('mesure');
    zone.textContent = '';
    var panneau = document.getElementById('panneau-' + etat.forme);
    var svg = panneau.querySelector('.carte-svg');

    if (svg) {
      // ① LE CADRE : l'emprise réelle du dessin contre SON viewBox (chaque forme
      //    a le sien — on le lit sur l'élément, on ne le suppose pas).
      var vb = svg.viewBox.baseVal;
      var min = { x: Infinity, y: Infinity }, max = { x: -Infinity, y: -Infinity };
      Array.prototype.forEach.call(svg.querySelectorAll('text, path, circle, rect'), function (n) {
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

      // ② LES CROISEMENTS : tenir dans le cadre ne suffit pas — deux étiquettes
      //    qui se chevauchent sont illisibles à l'intérieur du cadre. On teste
      //    chaque paire d'étiquettes, et chaque étiquette contre les cartouches
      //    des caps voisins. (Manque relevé sur la première passe : la forme A
      //    était « au vert » alors que deux noms se croisaient plein Nord.)
      var boites = [];
      Array.prototype.forEach.call(svg.querySelectorAll('.n-nom, .c-cartouche'), function (n) {
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

    var texte = (panneau.querySelector('.cartouche').textContent || '')
      .replace(/\s+/g, ' ').trim();
    var mots = texte ? texte.split(' ').length : 0;
    zone.appendChild(el('span', null, 'mots à l’écran : ' + mots));
    zone.appendChild(el('span', null, 'serments : ' + etat.volume));
  }

  // ---------------------------------------------------------------------
  // Bascules.
  // ---------------------------------------------------------------------
  function rendre() {
    ['A', 'B', 'C'].forEach(function (f) {
      document.getElementById('panneau-' + f).hidden = (f !== etat.forme);
    });
    if (etat.forme === 'A') { rendreA(); repos('parole-a', 'Survole un feu — il te dit ce qu’il est.'); }
    if (etat.forme === 'B') { rendreB(); repos('parole-b', 'Survole une flamme — elle te dit ce qu’elle est.'); }
    if (etat.forme === 'C') { rendreC(); repos('parole-c', 'Survole une stèle — elle te dit ce qu’elle est.'); }
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
