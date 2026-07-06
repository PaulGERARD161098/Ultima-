// Module carte Leaflet — exposé en global : window.UltimaCarte
(function () {
  'use strict';

  var COULEURS_TYPE = {
    artisan: '#e8781e',
    partenaire: '#1e6fb8',
    lead: '#1f8a4c',
    chantier: '#7a3fb5'
  };

  var STYLES_RELATION = {
    apport_affaires: { color: '#1e6fb8', weight: 3, opacity: 0.75, dashArray: null },
    sous_traitance: { color: '#e8781e', weight: 3, opacity: 0.75, dashArray: '10 7' },
    chantier_commun: { color: '#7a3fb5', weight: 3, opacity: 0.75, dashArray: '2 7' }
  };

  var carte = null;
  var coucheRelations = null;
  var coucheNoeuds = null;
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
        color: '#ffffff',
        weight: 2,
        fillColor: COULEURS_TYPE[n.type] || '#555555',
        fillOpacity: 0.95
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

  window.UltimaCarte = {
    init: init,
    rendre: rendre,
    invaliderTaille: invaliderTaille,
    COULEURS_TYPE: COULEURS_TYPE
  };
})();
