// Ultima — AMATSU, le dragon de l'air (boucle 2b-β, CADRAGE-IMLADRIK.md §12.6) :
// la rose des vents des lectures. Forme validée par Paul le 19/10 sur la maquette
// design/preview-amatsu-rose.html.
// La page RELIT, elle n'écrit pas : une lecture se dicte à Léo (« Amatsu, … »).
// Au repos, chaque souffle dit sa date et son objet ; les trois vents ne paraissent
// qu'au clic (leçon VRANESH v1 : sur un cap intime, la densité est le défaut).
// DERRIÈRE AUTH, données réelles uniquement (fail-closed partout) :
//   GET /api/amatsu-lectures. AUCUNE donnée en dur, aucun mode démo (§5 : intime).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var CX = 450, CY = 360, R_ANNEAU = 200, R_SOUFFLE = 238, R_ETIQUETTE = 256;
  // Douze aires au plus sur la rose : au-delà, les plus anciennes se résument en
  // un seul souffle qui mène au livre (mesuré sur la maquette : zéro croisement à
  // douze étiquettes, 1280 px).
  var AIRES_MAX = 12;
  var LONGUEUR_ETIQUETTE = 26;
  var VENTS = [
    { cle: 'bise', nom: 'La bise', q: 'Plus libre ?' },
    { cle: 'souffle', nom: 'Le souffle', q: 'Cohérent avec moi-même, mes choix, ma paix ?' },
    { cle: 'ouragan', nom: 'L’ouragan', q: 'Emporté par le vent ?' }
  ];
  // Les huit vents des portulans, par leur initiale : Tramontane au nord, puis
  // Grec, Levant, Siroc, Ostro, Libeccio, Ponant, Maestro.
  var INITIALES = ['T', 'G', 'L', 'S', 'O', 'L', 'P', 'M'];

  var etat = { session: null, lectures: [], choisie: -1 };

  // ---------- Fonctions pures (exposées aux harnais, aucune donnée réelle) ----------

  // Une lecture n'est rendue que si sa forme est celle de la base : texte partout,
  // date lisible. Le reste est écarté, jamais affiché à moitié.
  function lecturesValides(liste) {
    return (Array.isArray(liste) ? liste : []).filter(function (l) {
      return l && typeof l.objet === 'string' && l.objet.trim() !== ''
        && typeof l.bise === 'string' && typeof l.souffle === 'string'
        && typeof l.ouragan === 'string'
        && typeof l.created_at === 'string' && !isNaN(new Date(l.created_at).getTime());
    });
  }

  // Les souffles de la rose, dans l'ordre (la plus récente au nord). Au-delà de
  // douze, onze lectures puis un souffle « N plus anciennes ».
  function disposer(n) {
    var total = Math.max(0, Math.floor(Number(n) || 0));
    var souffles = [];
    var lectures = total > AIRES_MAX ? AIRES_MAX - 1 : total;
    for (var i = 0; i < lectures; i++) { souffles.push({ type: 'lecture', index: i }); }
    if (total > AIRES_MAX) { souffles.push({ type: 'anciennes', nombre: total - lectures, premier: lectures }); }
    return souffles;
  }

  // « 17 oct. » ; l'année s'ajoute quand elle n'est pas celle de `maintenant`.
  function dateCourte(iso, maintenant) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    var ref = maintenant instanceof Date ? maintenant : new Date();
    var options = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== ref.getFullYear()) { options.year = 'numeric'; }
    return d.toLocaleDateString('fr-FR', options);
  }

  function dateLongue(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function court(texte, max) {
    var t = String(texte || '').trim();
    return t.length <= max ? t : t.slice(0, max - 1) + '…';
  }

  // ---------- Petits outils DOM ----------

  function el(nom, classe, texte, parent) {
    var n = document.createElement(nom);
    if (classe) { n.className = classe; }
    if (texte !== undefined && texte !== null) { n.textContent = texte; }
    if (parent) { parent.appendChild(n); }
    return n;
  }

  function svg(nom, attrs, parent) {
    var n = document.createElementNS(NS, nom);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) { parent.appendChild(n); }
    return n;
  }

  function vider(n) { while (n && n.firstChild) { n.removeChild(n.firstChild); } }

  function pt(angleDeg, r) {
    var a = (angleDeg - 90) * Math.PI / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['amatsu-chargement', 'amatsu-auth', 'amatsu-erreur', 'amatsu-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- La rose, dessinée une fois : seize pointes calculées ----------

  function dessinerRose() {
    var g = document.getElementById('amatsu-rose-fond');
    if (!g || g.firstChild) { return; }
    svg('circle', { cx: CX, cy: CY, r: R_ANNEAU, class: 'amatsu-anneau' }, g);
    svg('circle', { cx: CX, cy: CY, r: R_ANNEAU - 14, class: 'amatsu-anneau-fin' }, g);
    for (var k = 0; k < 16; k++) {
      var angle = k * 22.5;
      var principale = k % 2 === 0;
      var long = principale ? 168 : 112;
      var large = principale ? 16 : 10;
      var bout = pt(angle, long), g1 = pt(angle - 90, large), g2 = pt(angle + 90, large);
      if (principale) {
        svg('polygon', { points: [CX, CY, bout.x, bout.y, g1.x, g1.y].join(' '), class: 'amatsu-pointe-claire' }, g);
        svg('polygon', { points: [CX, CY, bout.x, bout.y, g2.x, g2.y].join(' '), class: 'amatsu-pointe-sombre' }, g);
      } else {
        svg('polygon', { points: [g1.x, g1.y, bout.x, bout.y, g2.x, g2.y, CX, CY].join(' '), class: 'amatsu-demi' }, g);
      }
    }
    svg('circle', { cx: CX, cy: CY, r: 9, class: 'amatsu-pointe-claire' }, g);
    INITIALES.forEach(function (lettre, i) {
      var p = pt(i * 45, R_ANNEAU - 30 + (i === 0 ? -2 : 0));
      var t = svg('text', { x: p.x, y: p.y, class: 'amatsu-initiale' + (i === 0 ? ' amatsu-nord' : ''), 'aria-hidden': 'true' }, g);
      t.textContent = lettre;
    });
  }

  // ---------- Les souffles : une lecture par aire ----------

  function etiqueter(s, angle, ligne1, ligne2) {
    var pe = pt(angle, R_ETIQUETTE);
    var sin = Math.sin(angle * Math.PI / 180), cos = Math.cos(angle * Math.PI / 180);
    var ancre = Math.abs(sin) < 0.3 ? 'middle' : (sin > 0 ? 'start' : 'end');
    var y = ancre === 'middle' ? (cos > 0 ? pe.y - 26 : pe.y + 16) : pe.y - 4;
    var texte = svg('text', { class: 'amatsu-etiquette', 'text-anchor': ancre, 'aria-hidden': 'true' }, s);
    var t1 = svg('tspan', { x: pe.x, y: y, class: 'amatsu-e-date' }, texte);
    t1.textContent = ligne1;
    var t2 = svg('tspan', { x: pe.x, dy: 18, class: 'amatsu-e-objet' }, texte);
    t2.textContent = ligne2;
  }

  function activer(noeud, action) {
    noeud.addEventListener('click', action);
    noeud.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); action(); }
    });
  }

  function dessinerSouffles() {
    var g = document.getElementById('amatsu-souffles');
    vider(g);
    var souffles = disposer(etat.lectures.length);
    var maintenant = new Date();
    souffles.forEach(function (souffle, rang) {
      var angle = rang * (360 / souffles.length);
      var p = pt(angle, R_SOUFFLE), pa = pt(angle, R_ANNEAU);
      var s = svg('g', { class: 'amatsu-souffle', tabindex: '0', role: 'button' }, g);
      svg('line', { x1: pa.x, y1: pa.y, x2: p.x, y2: p.y, class: 'amatsu-trait' }, s);
      svg('circle', { cx: p.x, cy: p.y, r: 22, class: 'amatsu-zone' }, s);
      svg('circle', { cx: p.x, cy: p.y, r: 7, class: 'amatsu-point' }, s);
      if (souffle.type === 'anciennes') {
        var libelle = souffle.nombre + ' plus anciennes';
        s.classList.add('amatsu-anciennes');
        s.setAttribute('aria-label', libelle + ' — dans le livre des lectures');
        etiqueter(s, angle, 'Le livre', libelle);
        activer(s, function () { allerAuLivre(souffle.premier); });
        return;
      }
      var lecture = etat.lectures[souffle.index];
      var date = dateCourte(lecture.created_at, maintenant);
      s.setAttribute('data-i', String(souffle.index));
      s.setAttribute('aria-pressed', 'false');
      s.setAttribute('aria-label', lecture.objet + ', ' + date);
      etiqueter(s, angle, date, court(lecture.objet, LONGUEUR_ETIQUETTE));
      activer(s, function () { choisir(souffle.index); });
    });
  }

  // ---------- Le livre : toutes les lectures ----------

  function dessinerLivre() {
    var ol = document.getElementById('amatsu-livre');
    vider(ol);
    var maintenant = new Date();
    etat.lectures.forEach(function (lecture, i) {
      var li = el('li', null, null, ol);
      var b = el('button', null, null, li);
      b.type = 'button';
      b.id = 'amatsu-livre-' + i;
      b.setAttribute('data-i', String(i));
      b.setAttribute('aria-pressed', 'false');
      el('span', 'amatsu-d', dateCourte(lecture.created_at, maintenant), b);
      el('span', 'amatsu-o', lecture.objet, b);
      b.addEventListener('click', function () { choisir(i); });
    });
  }

  function allerAuLivre(index) {
    var cible = document.getElementById('amatsu-livre-' + index);
    if (!cible) { return; }
    if (typeof cible.scrollIntoView === 'function') { cible.scrollIntoView({ block: 'center' }); }
    cible.focus();
  }

  // ---------- La parole : les trois vents, au clic seulement ----------

  function iconeVent(cle) {
    var s = svg('svg', { viewBox: '0 0 32 32', 'aria-hidden': 'true', focusable: 'false' });
    var g = svg('g', { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' }, s);
    if (cle === 'bise') { svg('path', { d: 'M5 13 H20 a4 4 0 1 0 -4 -4' }, g); }
    if (cle === 'souffle') { svg('path', { d: 'M5 16 H27 M9 21 H23' }, g); }
    if (cle === 'ouragan') { svg('path', { d: 'M16 16 m0 -2 a2 2 0 1 1 -2 2 a5 5 0 0 1 5 -5 a8 8 0 0 1 8 8' }, g); }
    return s;
  }

  function dessinerParole() {
    var p = document.getElementById('amatsu-parole');
    vider(p);
    var lecture = etat.lectures[etat.choisie];
    if (!lecture) {
      el('h3', null, etat.lectures.length ? 'Choisis un souffle' : 'La rose attend son premier vent', p);
      el('p', 'amatsu-repos', etat.lectures.length
        ? 'Les trois vents de la lecture paraissent ici, au clic. Rien ne s’ouvre au simple survol.'
        : 'Dis « Amatsu, … » à Léo : elle te pose les trois vents, et la lecture souffle ici.', p);
      return;
    }
    el('p', 'amatsu-date', dateLongue(lecture.created_at), p);
    el('h3', null, lecture.objet, p);
    var ul = el('ul', 'amatsu-vents', null, p);
    VENTS.forEach(function (v) {
      var li = el('li', null, null, ul);
      li.appendChild(iconeVent(v.cle));
      var bloc = el('div', null, null, li);
      el('span', 'amatsu-q', v.nom + ' — ' + v.q, bloc);
      el('span', 'amatsu-r', lecture[v.cle] || '—', bloc);
    });
  }

  // Le choix se marque EN PLACE (aria-pressed) : rien n'est redessiné, le focus
  // reste où Paul l'a posé.
  function marquer() {
    Array.prototype.forEach.call(
      document.querySelectorAll('#amatsu-souffles .amatsu-souffle[data-i], #amatsu-livre button[data-i]'),
      function (n) { n.setAttribute('aria-pressed', String(Number(n.getAttribute('data-i')) === etat.choisie)); });
  }

  function choisir(i) {
    etat.choisie = (etat.choisie === i) ? -1 : i;
    marquer();
    dessinerParole();
  }

  function rendre() {
    dessinerRose();
    dessinerSouffles();
    dessinerLivre();
    marquer();
    dessinerParole();
    var vide = document.getElementById('amatsu-vide');
    if (vide) { vide.hidden = etat.lectures.length > 0; }
    var livre = document.querySelector('.amatsu-livre');
    if (livre) { livre.hidden = etat.lectures.length === 0; }
    montrer('amatsu-registre');
  }

  // ---------- Chargement (après session seulement) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function chargerLectures() {
    var reponse;
    try {
      reponse = await fetch('/api/amatsu-lectures', {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + etat.session.access_token }
      });
    } catch (e) {
      montrer('amatsu-erreur');
      return;
    }
    // Fail-closed : une 401 ferme tout.
    if (reponse.status === 401) { montrer('amatsu-auth'); return; }
    var contenu = null;
    try { contenu = await reponse.json(); } catch (e) { contenu = null; }
    if (!reponse.ok || !contenu || contenu.ok !== true || !Array.isArray(contenu.data)) {
      montrer('amatsu-erreur');
      return;
    }
    etat.lectures = lecturesValides(contenu.data);
    etat.choisie = -1;
    rendre();
  }

  async function demarrer() {
    montrer('amatsu-chargement');
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('amatsu-auth');
      return;
    }
    var cfg = window.ULTIMA_CONFIG;
    var session = null;
    try {
      var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      var resultat = await client.auth.getSession();
      session = (resultat && resultat.data && resultat.data.session) || null;
    } catch (e) {
      session = null;
    }
    if (!session || !session.access_token) { montrer('amatsu-auth'); return; }
    etat.session = session;
    await chargerLectures();
  }

  // Échap referme les vents : la rose revient au repos.
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && etat.choisie !== -1) { etat.choisie = -1; marquer(); dessinerParole(); }
  });

  window.UltimaAmatsu = {
    disposer: disposer,
    dateCourte: dateCourte,
    court: court,
    lecturesValides: lecturesValides
  };

  demarrer().catch(function () { montrer('amatsu-erreur'); });
})();
