// Module carte Leaflet — exposé en global : window.UltimaCarte
(function () {
  'use strict';

  var COULEURS_TYPE = {
    artisan: '#e8781e',
    partenaire: '#1e6fb8',
    lead: '#1f8a4c',
    chantier: '#7a3fb5'
  };

  // Opacité 0.85 (R1) : traits affirmés sur parchemin ; les statuts de
  // pilotage idée (0.45) / arrêté (0.35 gris) restent inchangés dans rendre().
  var STYLES_RELATION = {
    apport_affaires: { color: '#1e6fb8', weight: 3, opacity: 0.85, dashArray: null },
    sous_traitance: { color: '#e8781e', weight: 3, opacity: 0.85, dashArray: '10 7' },
    chantier_commun: { color: '#7a3fb5', weight: 3, opacity: 0.85, dashArray: '2 7' }
  };

  // Habillage antique (R1) — cf. design/spec-r1-graphisme.md.
  // Bounds du voile Ptolémée : constante unique, géo-ancrage en bloc.
  var BOUNDS_VOILE = [[40.0, -7.8], [52.6, 11.2]];
  // Classes de palier de zoom posées sur #carte (une seule à la fois) :
  // elles pilotent en CSS le régime du filtre sépia et l'opacité du voile.
  var CLASSES_ZOOM = ['zoom-pays', 'zoom-large', 'zoom-region', 'zoom-rue'];

  var carte = null;
  var coucheRelations = null;
  var coucheNoeuds = null;
  var coucheApercu = null;
  var coucheSurbrillance = null;
  var positionApercu = null;
  var positionSurbrillance = null;
  var surClicNoeud = null;

  // Jeton de génération : incrémenté à chaque rendu ; les callbacks
  // capturés par un rendu obsolète s'abandonnent (anti-rendus-concurrents).
  var jetonRendu = 0;

  function init(idConteneur, options) {
    surClicNoeud = (options && options.surClicNoeud) || null;

    carte = L.map(idConteneur, { zoomControl: true });
    // Centrage France métropolitaine
    carte.setView([46.6, 2.4], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; les contributeurs d’<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(carte);

    coucheRelations = L.layerGroup().addTo(carte);
    coucheNoeuds = L.layerGroup().addTo(carte);
    coucheApercu = L.layerGroup().addTo(carte);
    // Surbrillance de recherche (v3-⑥) : au-dessus des nœuds, hors filtres.
    coucheSurbrillance = L.layerGroup().addTo(carte);

    // Voile Ptolémée (R1) : pane décoratif entre tuiles (200) et vecteurs
    // (400), muet (pointer-events none). Le SVG vit dans riven.html
    // (<template id="voile-ptolemee">, 100 % local) et pan/zoome AVEC la
    // carte : jamais de désaccord visuel entre contour et points.
    var paneVoile = carte.createPane('voile');
    paneVoile.style.zIndex = 300;
    paneVoile.style.pointerEvents = 'none';
    paneVoile.classList.add('pane-voile');
    var gabaritVoile = document.getElementById('voile-ptolemee');
    if (gabaritVoile && gabaritVoile.content && gabaritVoile.content.firstElementChild) {
      L.svgOverlay(gabaritVoile.content.firstElementChild, BOUNDS_VOILE,
        { pane: 'voile', interactive: false }).addTo(carte);
    }

    // Classe de palier posée à l'init et à chaque zoomend.
    carte.on('zoomend', appliquerClasseZoom);
    appliquerClasseZoom();
  }

  // Palier d'habillage selon le zoom Leaflet : ≤ 5 voile plein, = 6 voile à
  // 65 %, 7-11 tuiles sépia seules, ≥ 12 sépia allégé (lisibilité des rues).
  function classeZoom(zoom) {
    if (zoom <= 5) { return 'zoom-pays'; }
    if (zoom === 6) { return 'zoom-large'; }
    if (zoom <= 11) { return 'zoom-region'; }
    return 'zoom-rue';
  }

  function appliquerClasseZoom() {
    if (!carte) { return; }
    var conteneur = carte.getContainer();
    var classe = classeZoom(carte.getZoom());
    CLASSES_ZOOM.forEach(function (c) {
      conteneur.classList.toggle(c, c === classe);
    });
  }

  function positionValide(noeud) {
    return typeof noeud.lat === 'number' && isFinite(noeud.lat) &&
           typeof noeud.lng === 'number' && isFinite(noeud.lng);
  }

  function passeFiltres(noeud, filtres) {
    if (!filtres) { return true; }
    if (filtres.types && !filtres.types.has(noeud.type)) { return false; }
    if (filtres.statuts && !filtres.statuts.has(noeud.statut)) { return false; }
    return true;
  }

  // Contenu de tooltip en élément DOM (jamais de HTML construit par chaîne).
  function etiquette(noeud) {
    var el = document.createElement('span');
    el.textContent = noeud.nom || '(sans nom)';
    return el;
  }

  function rendre(noeuds, relations, filtres) {
    if (!carte) { return; }
    var jeton = ++jetonRendu;

    coucheNoeuds.clearLayers();
    coucheRelations.clearLayers();

    var visibles = new Map();
    (noeuds || []).forEach(function (n) {
      if (positionValide(n) && passeFiltres(n, filtres)) {
        visibles.set(n.id, n);
      }
    });

    // Traits de relations : affichés seulement si les deux extrémités sont visibles.
    // Le statut de pilotage module le rendu : idée = esquisse, arrêté = éteint.
    (relations || []).forEach(function (r) {
      var source = visibles.get(r.source_id);
      var cible = visibles.get(r.target_id);
      if (!source || !cible) { return; }
      var style = STYLES_RELATION[r.type] || STYLES_RELATION.apport_affaires;
      var couleur = style.color;
      var opacite = style.opacity;
      if (r.statut === 'arrete') {
        couleur = '#8a8f98';
        opacite = 0.35;
      } else if (r.statut === 'idee') {
        opacite = 0.45;
      }
      L.polyline(
        [[source.lat, source.lng], [cible.lat, cible.lng]],
        { color: couleur, weight: style.weight, opacity: opacite, dashArray: style.dashArray }
      ).addTo(coucheRelations);
    });

    visibles.forEach(function (n) {
      var marqueur = L.circleMarker([n.lat, n.lng], {
        radius: 9,
        color: '#5a4118',      // cerne encre (--cerne-carte, R1)
        weight: 2,
        fillColor: COULEURS_TYPE[n.type] || '#555555',
        fillOpacity: 1         // plein (était 0.95) : fini la transparence boueuse sur parchemin
      });
      marqueur.bindTooltip(etiquette(n), { direction: 'top', offset: [0, -8] });
      marqueur.on('click', function () {
        if (jeton !== jetonRendu) { return; } // rendu obsolète : on abandonne
        if (surClicNoeud) { surClicNoeud(n.id); }
      });
      marqueur.addTo(coucheNoeuds);
    });
  }

  function invaliderTaille() {
    if (carte) { carte.invalidateSize(); }
  }

  // Recentre la carte sur un point (zoom inchangé) — ouverture depuis l'Accueil.
  function centrer(lat, lng) {
    if (carte && isFinite(lat) && isFinite(lng)) { carte.panTo([lat, lng]); }
  }

  // Aperçu de position (géocodage, v3-⑤) : marqueur provisoire distinctif
  // « pas encore enregistré » (cercle en pointillés), un seul à la fois.
  function apercu(lat, lng) {
    if (!carte || !isFinite(lat) || !isFinite(lng)) { return; }
    coucheApercu.clearLayers();
    L.circleMarker([lat, lng], {
      radius: 11,
      color: '#1e6fb8',
      weight: 2,
      dashArray: '4 4',
      fillColor: '#1e6fb8',
      fillOpacity: 0.2
    }).addTo(coucheApercu);
    positionApercu = { lat: lat, lng: lng };
    carte.panTo([lat, lng]);
  }

  // L'aperçu ne survit jamais au formulaire (enregistrement, annulation,
  // fermeture du panneau, nouvelle recherche).
  function effacerApercu() {
    positionApercu = null;
    if (coucheApercu) { coucheApercu.clearLayers(); }
  }

  // Position de l'aperçu courant ({lat,lng} ou null) — observable (harnais).
  function apercuPosition() {
    return positionApercu;
  }

  // ---------- Recherche sur la carte (v3-⑥) : zoom + halo « compas » ----------

  function reduireAnimations() {
    return Boolean(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Zoom « ville » (13) sans jamais dézoomer ; vol doux, coupé si l'utilisateur
  // préfère réduire les animations.
  function zoomerSur(lat, lng) {
    if (!carte || !isFinite(lat) || !isFinite(lng)) { return; }
    var zoom = Math.max(carte.getZoom(), 13);
    if (reduireAnimations()) {
      carte.setView([lat, lng], zoom, { animate: false });
    } else {
      carte.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  }

  // Anneau « compas » détaché autour du résultat trouvé : encre neutre, jamais
  // en concurrence avec les couleurs de type ; un seul à la fois, dans une
  // couche indépendante des filtres (motif apercu/effacerApercu).
  function surligner(lat, lng) {
    if (!carte || !isFinite(lat) || !isFinite(lng)) { return; }
    coucheSurbrillance.clearLayers();
    L.circleMarker([lat, lng], {
      radius: 16,            // marqueur r9 + anneau blanc 2 → anneau détaché
      color: '#1f2937',      // var(--encre)
      weight: 3,
      fill: false,
      opacity: 0.9,
      interactive: false,    // ne vole ni clic ni tooltip au marqueur
      className: 'halo-resultat'
    }).addTo(coucheSurbrillance);
    positionSurbrillance = { lat: lat, lng: lng };
  }

  function effacerSurbrillance() {
    positionSurbrillance = null;
    if (coucheSurbrillance) { coucheSurbrillance.clearLayers(); }
  }

  // Position de la surbrillance courante ({lat,lng} ou null) — observable.
  function surbrillancePosition() {
    return positionSurbrillance;
  }

  // Vue courante ({lat,lng,zoom} ou null) — observable (harnais).
  function vue() {
    if (!carte) { return null; }
    var centre = carte.getCenter();
    return { lat: centre.lat, lng: centre.lng, zoom: carte.getZoom() };
  }

  window.UltimaCarte = {
    init: init,
    rendre: rendre,
    invaliderTaille: invaliderTaille,
    centrer: centrer,
    apercu: apercu,
    effacerApercu: effacerApercu,
    apercuPosition: apercuPosition,
    zoomerSur: zoomerSur,
    surligner: surligner,
    effacerSurbrillance: effacerSurbrillance,
    surbrillancePosition: surbrillancePosition,
    vue: vue,
    COULEURS_TYPE: COULEURS_TYPE
  };
})();
