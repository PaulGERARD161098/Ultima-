// Module Ciel en nébuleuses — la vue À PLAT de RIVEN. Exposé en global :
// window.UltimaNebuleuses
//
// Décision de Paul, 2026-09-30 (CADRAGE-RIVEN-NEBULEUSES.md, lot 1) : quarante
// secteurs donnaient quarante amas dont les noms se recouvraient. Ici, neuf
// nébuleuses — une par grand secteur, lues dans js/nebuleuses-riven.js — posées
// à plat. Toucher une nébuleuse s'en approche et fait paraître ses noms ;
// toucher une étoile d'une nébuleuse approchée ouvre sa fiche. C'est la maquette
// que Paul a validée (« j'aime ta maquette, gardons ce format »), portée telle
// quelle.
//
// ⛔ LE VOLUME 3D RESTE : js/ciel.js n'est pas touché par ce module. Le bouton
// « À plat / En volume » de RIVEN passe de l'un à l'autre (js/app.js).
//
// ⛔ UN NOM NE SE SUPERPOSE JAMAIS À UN AUTRE. Chaque nom essaie quatre places
// autour de son étoile ; s'il n'en trouve aucune de libre, il se CACHE, et le
// panneau le donne. Les largeurs sont mesurées, pas estimées. Le harnais
// tests/smoke-riven-nebuleuses.mjs le vérifie sur les boîtes réellement peintes,
// et le sabotage de ce placement le fait virer au rouge.
//
// Mêmes disciplines que js/ciel.js : injection 100 % createElementNS /
// textContent, jamais innerHTML ; `arreter()` libère tout ce qui écoute.
// Les classes `ciel-svg`, `ciel-etoile`, `ciel-zone` et l'attribut
// `data-noeud-id` sont repris À DESSEIN : une étoile reste une étoile pour les
// styles et les harnais, quelle que soit la vue.
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var ANGLE_OR = Math.PI * (3 - Math.sqrt(5));
  var COTE = 1000;               // le viewBox est carré : 0 0 1000 1000
  var DUREE_APPROCHE = 450;      // ms — celle de la maquette validée
  var TAILLE_NOM_PX = 12;        // plancher de lisibilité des noms
  var TAILLE_TITRE_PX = 12;      // plancher des titres de nébuleuse
  var CIBLE_TACTILE_PX = 12;     // rayon : 24 px de diamètre, plancher WCAG
  var LARGEUR_ETROITE = 600;     // en deçà, les titres prennent leur nom court

  // Les teintes des étoiles, par type : discrètes, pour que la brume reste la
  // couleur qui compte. Un artisan est plus chaud, comme sur la carte.
  var TEINTE_ETOILE = { artisan: '#f5c894', partenaire: '#f2ead6', lead: '#d6efe2', chantier: '#e6dbf6' };

  var courant = null;
  var numero = 0;  // préfixe des identifiants SVG, un par instance
  // La nébuleuse approchée survit à un nouveau rendu (une frappe dans la
  // recherche, une fiche enregistrée) : sans cette mémoire, chaque mise à jour
  // renverrait Paul à la vue d'ensemble au milieu de sa lecture.
  // TROIS états, et la différence compte : `undefined` = Paul n'a encore rien
  // choisi ; `null` = il a demandé la vue d'ensemble ; une clé = il s'est
  // approché d'une nébuleuse. Seul le premier laisse la fiche ouverte décider
  // où regarder — sinon « Tout voir » serait annulé à la frappe suivante.
  var memoire = { active: undefined };

  function el(nom, attrs, parent) {
    var e = document.createElementNS(NS, nom);
    if (attrs) { for (var k in attrs) { e.setAttribute(k, attrs[k]); } }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function html(nom, classe, parent) {
    var e = document.createElement(nom);
    if (classe) { e.className = classe; }
    if (parent) { parent.appendChild(e); }
    return e;
  }
  function moinsDAnimation() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function pluriel(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }
  // Tout ce qui s'affiche passe par ici : une valeur qui n'est pas une chaîne
  // (null, un nombre) ne doit jamais casser le rendu de toute la carte.
  function texte(x) { return x == null ? '' : String(x); }
  function propre(objet, cle) { return Object.prototype.hasOwnProperty.call(objet, cle) ? objet[cle] : undefined; }
  // Une graine fixe : le même ciel à chaque ouverture.
  function hasard(graine) {
    var s = graine;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  // Combien d'unités de viewBox font `px` pixels à l'écran, letterbox compris.
  function unitesPour(svg, px) {
    var vb = svg.getAttribute('viewBox').split(' ').map(Number);
    var b = svg.getBoundingClientRect();
    var parUnite = Math.min(b.width / vb[2], b.height / vb[3]);
    return parUnite > 0 ? px / parUnite : px;
  }
  function estEtroit(svg) {
    var l = svg.getBoundingClientRect().width;
    return l > 0 && l < LARGEUR_ETROITE;
  }

  // Le placement des noms. Pour chaque étoile : dessous, dessus, à droite, à
  // gauche, puis les quatre diagonales — la place qui recouvre le moins ce qui est déjà posé (les autres
  // étoiles comprises) ET qui déborde le moins du cadre visible : un nom coupé
  // par le bord n'est pas plus lisible qu'un nom recouvert. Au-delà d'un
  // demi-pixel carré de gêne, le nom se cache. Rend le nombre de noms cachés.
  function poserEtiquettes(items, t, cadre, obstacles) {
    var poses = items.map(function (e) { return [e.x - t * 0.45, e.x + t * 0.45, e.y - t * 0.45, e.y + t * 0.45]; })
      .concat(obstacles || []);
    function recouvre(b) {
      var s = 0;
      for (var i = 0; i < poses.length; i++) {
        var p = poses[i];
        var dx = Math.min(b[1], p[1]) - Math.max(b[0], p[0]);
        var dy = Math.min(b[3], p[3]) - Math.max(b[2], p[2]);
        if (dx > 0 && dy > 0) { s += dx * dy; }
      }
      return s;
    }
    // La part d'une boîte qui sort du cadre [x0, x1, y0, y1].
    function deborde(b, c) {
      var aire = (b[1] - b[0]) * (b[3] - b[2]);
      var dx = Math.max(0, Math.min(b[1], c[1]) - Math.max(b[0], c[0]));
      var dy = Math.max(0, Math.min(b[3], c[3]) - Math.max(b[2], c[2]));
      return aire - dx * dy;
    }
    var caches = 0;
    var plusHaut = null, plusBas = 0; // marges de hauteur mesurées une fois (voir plus bas)
    // L'ordre compte : les étoiles les plus entourées se nomment d'abord, tant
    // qu'il reste des places libres autour d'elles ; les isolées trouvent
    // toujours une place ensuite.
    var voisinage = t * 4;
    var ordre = items.map(function (e) {
      var n = 0;
      items.forEach(function (o) { if (o !== e && Math.abs(o.x - e.x) < voisinage && Math.abs(o.y - e.y) < voisinage) { n++; } });
      return { e: e, n: n };
    }).sort(function (a, b) { return b.n - a.n; }).map(function (x) { return x.e; });
    ordre.forEach(function (e) {
      var tx = e.texte;
      tx.removeAttribute('display');
      tx.setAttribute('font-size', t.toFixed(2));
      tx.setAttribute('stroke-width', (t * 0.28).toFixed(2));
      tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('x', e.x.toFixed(2));
      tx.setAttribute('y', e.y.toFixed(2));
      if (courant && courant._sansEvitement) { return; } // sabotage réservé au harnais
      var w = tx.getComputedTextLength() || t * 8;
      // LA HAUTEUR D'UN NOM SE MESURE AUSSI (03/11/2026). Les boîtes ci-dessous
      // supposaient 0,9 em au-dessus de la ligne de base et 0,3 em dessous. Avec
      // Inter (et les polices système de l'iPhone), la boîte réelle est plus
      // haute : deux noms empilés se touchaient de 1 à 1,6 px
      // (`smoke-riven-nebuleuses`, maquette 300 fiches à 390 px). On lit donc la
      // boîte peinte, et chaque bord ne s'ÉLARGIT que si la police l'exige —
      // jamais plus étroit qu'avant.
      // Police et taille sont communes à tous les noms du passage : UNE mesure
      // suffit. Une par nom forçait un recalcul de mise en page à chaque nom, et
      // l'approche dépassait 50 ms (même harnais, `approcheSansTacheDePlusDe50ms`).
      if (plusHaut === null) {
        var bb = null;
        try { bb = tx.getBBox(); } catch (_) { bb = null; }
        plusHaut = bb && bb.height > 0 ? Math.max(0, (e.y - bb.y) - t * 0.95) : 0;
        plusBas = bb && bb.height > 0 ? Math.max(0, (bb.y + bb.height - e.y) - t * 0.2) : 0;
      }
      function boite(x0, x1, base, haut, bas) {
        return [x0, x1, base - haut - plusHaut, base + bas + plusBas];
      }
      var places = [
        ['middle', e.x, e.y + t * 1.45, boite(e.x - w / 2, e.x + w / 2, e.y + t * 1.45, t * 0.9, t * 0.25)],
        ['middle', e.x, e.y - t * 0.85, boite(e.x - w / 2, e.x + w / 2, e.y - t * 0.85, t * 0.9, t * 0.3)],
        ['start', e.x + t * 0.8, e.y + t * 0.35, boite(e.x + t * 0.7, e.x + t * 0.8 + w, e.y + t * 0.35, t * 0.95, t * 0.2)],
        ['end', e.x - t * 0.8, e.y + t * 0.35, boite(e.x - t * 0.8 - w, e.x - t * 0.7, e.y + t * 0.35, t * 0.95, t * 0.2)],
        // Les diagonales, en dernier recours avant de cacher le nom.
        ['start', e.x + t * 0.5, e.y + t * 1.3, boite(e.x + t * 0.4, e.x + t * 0.5 + w, e.y + t * 1.3, t * 0.85, t * 0.3)],
        ['end', e.x - t * 0.5, e.y + t * 1.3, boite(e.x - t * 0.5 - w, e.x - t * 0.4, e.y + t * 1.3, t * 0.85, t * 0.3)],
        ['start', e.x + t * 0.5, e.y - t * 0.75, boite(e.x + t * 0.4, e.x + t * 0.5 + w, e.y - t * 0.75, t * 0.9, t * 0.3)],
        ['end', e.x - t * 0.5, e.y - t * 0.75, boite(e.x - t * 0.5 - w, e.x - t * 0.4, e.y - t * 0.75, t * 0.9, t * 0.3)]
      ];
      var meilleure = null, score = Infinity;
      places.forEach(function (p) {
        var s = recouvre(p[3]) + (cadre ? deborde(p[3], cadre) : 0);
        if (s < score - 0.01) { score = s; meilleure = p; }
      });
      if (score > 0.5) { tx.setAttribute('display', 'none'); caches++; return; }
      tx.setAttribute('text-anchor', meilleure[0]);
      tx.setAttribute('x', meilleure[1].toFixed(2));
      tx.setAttribute('y', meilleure[2].toFixed(2));
      poses.push(meilleure[3]);
    });
    return caches;
  }

  // Les nébuleuses sur une grille : autant de colonnes que la racine du nombre,
  // la dernière rangée centrée. Le rayon croît avec la racine de l'effectif,
  // plafonné pour qu'aucune nébuleuse ne déborde sur sa voisine.
  function disposer(groupes) {
    var k = groupes.length;
    var cols = Math.max(1, Math.ceil(Math.sqrt(k)));
    var rangs = Math.max(1, Math.ceil(k / cols));
    var lc = COTE / cols, hc = COTE / rangs;
    groupes.forEach(function (g, i) {
      var col = i % cols, rang = Math.floor(i / cols);
      var dansLeRang = rang === rangs - 1 ? k - cols * (rangs - 1) : cols;
      g.x = (col + 0.5 + (cols - dansLeRang) / 2) * lc;
      g.y = (rang + 0.5) * hc + 10;
      g.r = Math.min(0.4 * Math.min(lc, hc), 62 + 22 * Math.sqrt(g.noeuds.length));
    });
  }

  function arreter() {
    if (courant) { courant._liberer(); courant = null; }
  }

  function rendre(scene, donnees, options) {
    arreter();
    var T = window.UltimaNebuleusesRiven;
    if (!scene || !T) { return null; }
    options = options || {};
    donnees = donnees || {};
    var noeuds = donnees.noeuds || [];
    var surClicNoeud = typeof options.surClicNoeud === 'function' ? options.surClicNoeud : function () {};
    var surClicPersonne = typeof options.surClicPersonne === 'function' ? options.surClicPersonne : function () {};
    var correspond = typeof options.correspond === 'function' ? options.correspond : function () { return true; };
    var libellesType = options.libellesType || {};
    var reduit = moinsDAnimation();

    var groupes = T.repartir(noeuds);
    disposer(groupes);

    // Les personnes rattachées, par fiche : elles vivent dans le panneau.
    var personnesParId = Object.create(null);
    (donnees.personnes || []).forEach(function (p) { if (p && p.id) { personnesParId[p.id] = p; } });
    var rattacheesParFiche = Object.create(null);
    (donnees.rattachements || []).forEach(function (r) {
      var p = r && personnesParId[r.personne_id];
      if (!p) { return; }
      (rattacheesParFiche[r.node_id] = rattacheesParFiche[r.node_id] || []).push({ personne: p, role: r.role || '' });
    });

    // ---- La charpente : la carte, et le panneau à côté ----
    var cadre = html('div', 'neb-cadre', scene);
    var svg = el('svg', {
      'class': 'ciel-svg neb-svg', viewBox: '0 0 ' + COTE + ' ' + COTE,
      role: 'group',
      'aria-label': 'Le réseau en ' + pluriel(groupes.length, 'nébuleuse') + ', ' + pluriel(noeuds.length, 'fiche') +
        '. Tab pour aller d’une nébuleuse à l’autre, Entrée pour s’approcher, Échap pour revenir.'
    }, cadre);
    var panneau = html('aside', 'neb-panneau', cadre);
    panneau.setAttribute('aria-label', 'Détail des nébuleuses');
    panneau.setAttribute('aria-live', 'polite');

    var prefixe = 'neb' + (++numero) + '-';
    var defs = el('defs', {}, svg);
    var brume = el('filter', { id: prefixe + 'brume', x: '-40%', y: '-40%', width: '180%', height: '180%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.011', numOctaves: '3', seed: '7', result: 'bruit' }, brume);
    el('feDisplacementMap', { 'in': 'SourceGraphic', in2: 'bruit', scale: '55' }, brume);
    el('feGaussianBlur', { stdDeviation: '6' }, brume);

    // Le fond d'étoiles : un décor, jamais une donnée.
    var alea = hasard(42), fond = el('g', { 'aria-hidden': 'true', 'class': 'neb-fond' }, svg);
    for (var f = 0; f < 170; f++) {
      el('circle', { cx: (alea() * COTE).toFixed(1), cy: (alea() * COTE).toFixed(1),
        r: (0.4 + alea() * 1.1).toFixed(2), fill: '#f2ead6', opacity: (0.08 + alea() * 0.3).toFixed(2) }, fond);
    }
    var coucheLiens = el('g', { 'class': 'ciel-liens neb-liens', 'aria-hidden': 'true' }, svg);
    var coucheNebuleuses = el('g', { 'class': 'neb-nebuleuses' }, svg);
    var bulle = el('g', { 'class': 'neb-bulle', 'aria-hidden': 'true', display: 'none' }, svg);
    var bulleTexte = el('text', { 'class': 'neb-nom', 'text-anchor': 'middle' }, bulle);

    var etoileParId = Object.create(null);
    var active = null;
    var jeton = 0;

    groupes.forEach(function (g) {
      var n = g.nebuleuse, k = g.noeuds.length;
      var id = prefixe + 'g-' + n.cle;
      var degrade = el('radialGradient', { id: id }, defs);
      var rgb = n.rgb.join(',');
      el('stop', { offset: '0%', 'stop-color': 'rgb(' + rgb + ')', 'stop-opacity': '.55' }, degrade);
      el('stop', { offset: '55%', 'stop-color': 'rgb(' + rgb + ')', 'stop-opacity': '.2' }, degrade);
      el('stop', { offset: '100%', 'stop-color': 'rgb(' + rgb + ')', 'stop-opacity': '0' }, degrade);

      g.libelle = n.nom + ', ' + pluriel(k, 'fiche') + '. Entrée pour s’approcher.';
      g.groupe = el('g', {
        'class': 'nebuleuse neb-nebuleuse', 'data-nebuleuse': n.cle, tabindex: '0', role: 'button',
        'aria-label': g.libelle
      }, coucheNebuleuses);
      el('circle', { cx: g.x, cy: g.y, r: (g.r * 1.18).toFixed(1), fill: 'url(#' + id + ')', filter: 'url(#' + prefixe + 'brume)', 'class': 'neb-brume' }, g.groupe);
      el('circle', { cx: g.x, cy: g.y, r: (g.r * 0.62).toFixed(1), fill: 'url(#' + id + ')', opacity: '.55' }, g.groupe);
      // L'anneau de focus clavier : visible seulement sous :focus-visible (css/ciel.css).
      el('circle', { cx: g.x, cy: g.y, r: (g.r * 1.02).toFixed(1), fill: 'none', 'class': 'neb-focus' }, g.groupe);
      g.titre = el('text', { x: g.x, 'text-anchor': 'middle', 'class': 'neb-titre' }, g.groupe);
      g.compte = el('text', { x: g.x, 'text-anchor': 'middle', 'class': 'neb-compte' }, g.groupe);
      g.compte.textContent = pluriel(k, 'fiche') + (g.domaines.length ? ' · ' + pluriel(g.domaines.length, 'domaine') : '');
      // Le groupe des noms s'accroche APRÈS les étoiles (fin de boucle) : peints
      // avant, ils passaient sous les cœurs.
      g.noms = el('g', { 'class': 'neb-noms', 'aria-hidden': 'true', display: 'none' });
      g.etoiles = [];

      var decalage = n.cle.length * 0.7;
      g.noeuds.forEach(function (noeud, i) {
        var rayon = g.r * 0.6 * Math.sqrt((i + 0.5) / k), angle = i * ANGLE_OR + decalage;
        var e = { noeud: noeud, g: g, x: g.x + Math.cos(angle) * rayon, y: g.y + 14 + Math.sin(angle) * rayon * 0.9 };
        var nom = texte(noeud.nom) || '(sans nom)';
        var secteur = texte(noeud.secteur_activite).trim();
        var etiquette = nom + ', ' + (texte(propre(libellesType, noeud.type)) || texte(noeud.type) || 'fiche') +
          (secteur ? ', ' + secteur : '');
        // Hors de la nébuleuse approchée, une étoile n'est ni sur le chemin de
        // Tab ni dans l'arbre d'accessibilité : elle vit dans le bouton de sa
        // nébuleuse, et un bouton ne contient pas de bouton (basculerTab).
        e.el = el('g', {
          'class': 'ciel-etoile neb-etoile', 'data-noeud-id': texte(noeud.id), tabindex: '-1', role: 'button',
          'aria-hidden': 'true', 'aria-label': etiquette + '. Entrée pour ouvrir la fiche.'
        }, g.groupe);
        e.zone = el('circle', { 'class': 'ciel-zone', cx: e.x.toFixed(1), cy: e.y.toFixed(1), r: '12', fill: 'transparent' }, e.el);
        // Le halo et le cœur ont une taille À L'ÉCRAN, pas dans le viewBox : sans
        // cela, ils grossissent avec l'approche et mangent les noms (poserTitres).
        e.halo = el('circle', { cx: e.x.toFixed(1), cy: e.y.toFixed(1), r: '10', fill: '#f2ead6', opacity: '.1' }, e.el);
        e.coeur = el('circle', { 'class': 'neb-coeur', cx: e.x.toFixed(1), cy: e.y.toFixed(1), r: '3.4',
          fill: propre(TEINTE_ETOILE, noeud.type) || TEINTE_ETOILE.partenaire }, e.el);
        e.texte = el('text', { 'class': 'neb-nom' }, g.noms);
        e.texte.textContent = nom;
        if (!correspond(noeud)) { e.el.classList.add('neb-eteinte'); }

        e.el.addEventListener('click', function (evt) {
          if (active !== g) { return; } // la nébuleuse s'approche d'abord (l'événement remonte)
          evt.stopPropagation();
          surClicNoeud(noeud.id);
        });
        e.el.addEventListener('keydown', function (evt) {
          if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); evt.stopPropagation(); surClicNoeud(noeud.id); }
        });
        e.el.addEventListener('pointerenter', function () { if (active !== g) { montrerBulle(e); } });
        e.el.addEventListener('pointerleave', cacherBulle);
        g.etoiles.push(e);
        if (noeud.id != null) { etoileParId[noeud.id] = e; }
      });
      g.groupe.appendChild(g.noms);

      g.groupe.addEventListener('click', function (evt) {
        evt.stopPropagation();
        if (active !== g) { approcher(g); }
      });
      g.groupe.addEventListener('keydown', function (evt) {
        if (evt.target !== g.groupe) { return; }
        if (evt.key === 'Enter' || evt.key === ' ') { evt.preventDefault(); approcher(g); }
      });
    });

    // Les relations : un trait fin entre deux étoiles, sous les nébuleuses.
    (donnees.relations || []).forEach(function (r) {
      var a = etoileParId[r.source_id], b = etoileParId[r.target_id];
      if (!a || !b) { return; }
      el('line', { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), 'class': 'ciel-lien neb-lien' }, coucheLiens);
    });

    function montrerBulle(e) {
      var t = unitesPour(svg, TAILLE_NOM_PX);
      bulleTexte.textContent = texte(e.noeud.nom) || '(sans nom)';
      bulleTexte.setAttribute('font-size', t.toFixed(2));
      bulleTexte.setAttribute('stroke-width', (t * 0.28).toFixed(2));
      bulleTexte.setAttribute('x', e.x.toFixed(2));
      bulleTexte.setAttribute('y', (e.y - t * 0.9).toFixed(2));
      bulle.removeAttribute('display');
    }
    function cacherBulle() { bulle.setAttribute('display', 'none'); }

    // ---- Les titres : lisibles à toute largeur ----
    function poserTitres() {
      var etroit = estEtroit(svg);
      var cible = unitesPour(svg, CIBLE_TACTILE_PX);
      groupes.forEach(function (g) {
        var tt = Math.max(17, unitesPour(svg, TAILLE_TITRE_PX));
        var tc = Math.max(11.5, unitesPour(svg, 10));
        var haut = g.y - g.r * 0.86;
        if (active === g) {
          var vue = cadreDe(g);
          tt = unitesPour(svg, 19); tc = unitesPour(svg, 13);
          haut = vue[1] + tt * 1.4;
        }
        g.titre.textContent = (etroit && active !== g) ? g.nebuleuse.court : g.nebuleuse.nom;
        g.titre.setAttribute('font-size', tt.toFixed(2));
        g.titre.setAttribute('y', haut.toFixed(2));
        g.compte.setAttribute('font-size', tc.toFixed(2));
        g.compte.setAttribute('y', (haut + tt * 1.05).toFixed(2));
        if (etroit && active !== g) { g.compte.setAttribute('display', 'none'); } else { g.compte.removeAttribute('display'); }
        var rCoeur = Math.min(3.4, unitesPour(svg, 4)).toFixed(2);
        var rHalo = Math.min(10, unitesPour(svg, 11)).toFixed(2);
        g.etoiles.forEach(function (e) {
          e.zone.setAttribute('r', Math.max(10, cible).toFixed(2));
          e.coeur.setAttribute('r', rCoeur);
          e.halo.setAttribute('r', rHalo);
        });
      });
    }
    // Le titre et le compte de la nébuleuse approchée sont des obstacles : un
    // nom ne se pose pas dessus.
    function boite(texte) {
      if (texte.getAttribute('display') === 'none') { return null; }
      var b = texte.getBBox();
      return b.width > 0 ? [b.x, b.x + b.width, b.y, b.y + b.height] : null;
    }
    function poserNoms(g) {
      g.noms.removeAttribute('display');
      var vb = svg.getAttribute('viewBox').split(' ').map(Number);
      var obstacles = [boite(g.titre), boite(g.compte)].filter(Boolean);
      g.caches = poserEtiquettes(g.etoiles.map(function (e) { return { x: e.x, y: e.y, texte: e.texte }; }),
        unitesPour(svg, TAILLE_NOM_PX), [vb[0], vb[0] + vb[2], vb[1], vb[1] + vb[3]], obstacles);
    }
    // Le cadre d'une nébuleuse approchée ÉPOUSE la forme de l'écran : un
    // téléphone, plus haut que large, gagne de la hauteur ; un grand écran, de
    // la largeur. Un cadre carré laissait des bandes vides que les noms
    // n'avaient pas le droit d'occuper. Sur un écran étroit, l'approche serre
    // aussi un peu plus : les étoiles tiennent dans 0,6 rayon.
    function cadreDe(g) {
      var c = g.r * (estEtroit(svg) ? 0.74 : 0.82);
      var b = svg.getBoundingClientRect();
      var forme = b.width > 0 && b.height > 0 ? b.width / b.height : 1;
      var l = forme >= 1 ? 2 * c * forme : 2 * c;
      var h = forme >= 1 ? 2 * c : 2 * c / forme;
      return [g.x - l / 2, g.y + 14 - h / 2, l, h];
    }

    // ---- La caméra : le viewBox, animé ----
    function viser(cible, fin) {
      var mon = ++jeton;
      if (reduit) { svg.setAttribute('viewBox', cible.join(' ')); if (fin) { fin(); } return; }
      var depart = svg.getAttribute('viewBox').split(' ').map(Number), t0 = null;
      function pas(t) {
        if (mon !== jeton || !courant || courant.svg !== svg) { return; }
        if (t0 === null) { t0 = t; }
        var p = Math.min(1, (t - t0) / DUREE_APPROCHE);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        svg.setAttribute('viewBox', depart.map(function (v, i) { return (v + (cible[i] - v) * e).toFixed(2); }).join(' '));
        if (p < 1) { window.requestAnimationFrame(pas); } else if (fin) { fin(); }
      }
      window.requestAnimationFrame(pas);
    }

    function approcher(g, sansAnimation) {
      cacherBulle();
      if (active && active !== g) { active.noms.setAttribute('display', 'none'); basculerTab(active, false); }
      active = g; memoire.active = g.nebuleuse.cle;
      basculerTab(g, true);
      remplirPanneau();
      var cible = cadreDe(g);
      var fin = function () { poserTitres(); poserNoms(g); };
      if (sansAnimation) { svg.setAttribute('viewBox', cible.join(' ')); fin(); } else { viser(cible, fin); }
    }
    function toutVoir() {
      cacherBulle();
      var quittee = active;
      // Le focus était sur une étoile de la nébuleuse quittée : il revient sur
      // la nébuleuse, pas sur une étoile qui sort du chemin de Tab.
      var focusDedans = !!(quittee && quittee.groupe.contains(document.activeElement));
      if (quittee) { quittee.noms.setAttribute('display', 'none'); basculerTab(quittee, false); }
      active = null; memoire.active = null;
      remplirPanneau();
      if (focusDedans) { quittee.groupe.focus(); }
      viser([0, 0, COTE, COTE], poserTitres);
    }
    // Au clavier, seules les étoiles de la nébuleuse approchée sont sur le
    // chemin de Tab : cinquante arrêts de plus rendraient la carte impraticable.
    // Et un bouton ne contient pas de bouton : approchée, la nébuleuse devient
    // un simple groupe nommé, et ses étoiles entrent dans l'arbre
    // d'accessibilité ; sinon elle est UN bouton, et ses étoiles n'y sont pas.
    function basculerTab(g, actif) {
      g.groupe.setAttribute('role', actif ? 'group' : 'button');
      g.groupe.setAttribute('tabindex', actif ? '-1' : '0');
      g.groupe.setAttribute('aria-label', actif ? g.nebuleuse.nom : g.libelle);
      g.etoiles.forEach(function (e) {
        e.el.setAttribute('tabindex', actif ? '0' : '-1');
        if (actif) { e.el.removeAttribute('aria-hidden'); } else { e.el.setAttribute('aria-hidden', 'true'); }
      });
    }

    // ---- Le panneau ----
    function bouton(texte, action, parent, classe) {
      var b = html('button', classe || 'neb-lien-panneau', parent);
      b.type = 'button';
      b.textContent = texte;
      b.addEventListener('click', action);
      return b;
    }
    function remplirPanneau() {
      // Le bouton activé disparaît avec l'ancien contenu : si le focus était
      // dans le panneau, il va au titre du nouveau, au lieu de tomber sur <body>.
      var focusDedans = panneau.contains(document.activeElement);
      panneau.textContent = '';
      var titre = html('h3', 'neb-panneau-titre', panneau);
      titre.tabIndex = -1;
      if (focusDedans) { window.setTimeout(function () { titre.focus(); }, 0); }
      if (!active) {
        titre.textContent = pluriel(groupes.length, 'nébuleuse') + ', ' + pluriel(noeuds.length, 'fiche');
        var liste = html('ul', 'neb-liste', panneau);
        groupes.forEach(function (g) {
          var li = html('li', '', liste);
          var b = bouton('', function () { approcher(g); }, li, 'neb-lien-panneau neb-entree');
          var pastille = html('span', 'neb-pastille', b);
          pastille.style.background = 'rgb(' + g.nebuleuse.rgb.join(',') + ')';
          pastille.setAttribute('aria-hidden', 'true');
          b.appendChild(document.createTextNode(g.nebuleuse.nom + ' — ' + g.noeuds.length));
          if (g.domaines.length) { html('div', 'neb-domaines', li).textContent = g.domaines.join(' · '); }
        });
        return;
      }
      titre.textContent = active.nebuleuse.nom;
      bouton('← Toutes les nébuleuses', toutVoir, panneau, 'neb-retour');
      var parDomaine = Object.create(null), ordre = [];
      active.etoiles.forEach(function (e) {
        var d = texte(e.noeud.secteur_activite).trim() || 'Sans secteur';
        if (!parDomaine[d]) { parDomaine[d] = []; ordre.push(d); }
        parDomaine[d].push(e);
      });
      ordre.sort(function (a, b) { return a.localeCompare(b, 'fr'); });
      var ul = html('ul', 'neb-liste', panneau);
      ordre.forEach(function (d) {
        var li = html('li', '', ul);
        html('div', 'neb-domaines', li).textContent = d;
        parDomaine[d].sort(function (a, b) { return texte(a.noeud.nom).localeCompare(texte(b.noeud.nom), 'fr'); })
          .forEach(function (e) {
            bouton(texte(e.noeud.nom) || '(sans nom)', function () { surClicNoeud(e.noeud.id); }, li, 'neb-fiche');
            (rattacheesParFiche[e.noeud.id] || []).forEach(function (rp) {
              bouton('↳ ' + (texte(rp.personne.nom) || '(sans nom)') + (rp.role ? ' — ' + texte(rp.role) : ''),
                function () { surClicPersonne(rp.personne.id); }, li, 'neb-personne');
            });
          });
      });
      if (active.caches) {
        html('p', 'neb-note', panneau).textContent = pluriel(active.caches, 'nom') +
          ' sans place sur la carte : ' + (active.caches > 1 ? 'ils sont' : 'il est') + ' dans cette liste.';
      }
    }

    // ---- Les écouteurs de l'instance, libérés par arreter() ----
    function surFond() { if (active) { toutVoir(); } }
    // Échap traité ici ne remonte pas : sans cela, le gestionnaire global de la
    // page fermerait AUSSI la fiche ouverte (même motif que js/app.js).
    function surTouche(evt) {
      if (evt.key === 'Escape' && active) { evt.preventDefault(); evt.stopPropagation(); toutVoir(); }
    }
    svg.addEventListener('click', surFond);
    cadre.addEventListener('keydown', surTouche);
    var attente = null;
    function surTaille() {
      if (attente) { return; }
      attente = window.requestAnimationFrame(function () {
        attente = null;
        // L'écran a changé de forme : le cadre de la nébuleuse approchée suit.
        if (active) { svg.setAttribute('viewBox', cadreDe(active).join(' ')); }
        poserTitres();
        if (active) { poserNoms(active); }
      });
    }
    var observateur = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(surTaille) : null;
    if (observateur) { observateur.observe(svg); } else { window.addEventListener('resize', surTaille); }

    var instance = {
      svg: svg,
      estPlat: function () { return true; },
      plat: function () {},
      derive: function () {},
      // + approche la nébuleuse la plus proche du centre de la vue ; − revient.
      zoomer: function (delta) {
        if (delta > 0) { toutVoir(); return; }
        if (active || !groupes.length) { return; }
        var proche = groupes.slice().sort(function (a, b) {
          return Math.hypot(a.x - 500, a.y - 500) - Math.hypot(b.x - 500, b.y - 500);
        })[0];
        approcher(proche);
      },
      toutVoir: toutVoir,
      approcher: function (cle) {
        var g = groupes.filter(function (x) { return x.nebuleuse.cle === cle; })[0];
        if (g) { approcher(g); }
      },
      // La fiche ouverte s'allume toujours ; elle ne déplace la carte que si
      // rien d'autre n'a décidé où regarder (ni une recherche, ni un choix de
      // Paul — « Tout voir » compris).
      choisir: function (id) {
        var e = etoileParId[id];
        Object.keys(etoileParId).forEach(function (k) { etoileParId[k].el.classList.remove('ciel-etoile--choisie'); });
        if (!e) { return; }
        e.el.classList.add('ciel-etoile--choisie');
        if (!vueDecidee && active !== e.g) { approcher(e.g, true); }
      },
      etat: function () {
        return {
          active: active ? active.nebuleuse.cle : null,
          nebuleuses: groupes.map(function (g) { return { cle: g.nebuleuse.cle, fiches: g.noeuds.length, caches: g.caches || 0 }; })
        };
      },
      _liberer: function () {
        jeton++;
        svg.removeEventListener('click', surFond);
        cadre.removeEventListener('keydown', surTouche);
        if (observateur) { observateur.disconnect(); } else { window.removeEventListener('resize', surTaille); }
        if (attente) { window.cancelAnimationFrame(attente); attente = null; }
      },
      _sansEvitement: false
    };
    courant = instance;

    // ---- Premier état ----
    poserTitres();
    remplirPanneau();
    // La recherche : si toutes les fiches trouvées tiennent dans une seule
    // nébuleuse, on s'en approche. Sinon, on reprend la nébuleuse où l'on était.
    var trouvees = noeuds.filter(correspond);
    var enRecherche = trouvees.length > 0 && trouvees.length < noeuds.length;
    var vueDecidee = enRecherche || memoire.active !== undefined;
    var reprise = null;
    if (enRecherche) {
      var cles = trouvees.map(function (n) { return T.cleDe(n.secteur_activite); });
      if (cles.every(function (c) { return c === cles[0]; })) {
        reprise = groupes.filter(function (g) { return g.nebuleuse.cle === cles[0]; })[0];
      }
    } else if (memoire.active) {
      reprise = groupes.filter(function (g) { return g.nebuleuse.cle === memoire.active; })[0];
    }
    if (reprise) { approcher(reprise, true); }
    return instance;
  }

  window.UltimaNebuleuses = {
    rendre: rendre,
    arreter: arreter,
    courant: function () { return courant; },
    // Pour le harnais seulement : oublier la nébuleuse retenue entre deux pages.
    oublier: function () { memoire.active = undefined; }
  };
})();
