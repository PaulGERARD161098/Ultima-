// Maquette RIVEN en nébuleuses — données FICTIVES (voir l'en-tête du .html).
(function () {
  'use strict';

  // Les secteurs saisis en base le 2026-09-30, avec leur effectif : la carte
  // fictive a la même forme que la vraie. Débuts réels (ce que la table lit),
  // suites neutralisées — le détail désignait parfois une entreprise. Le vide
  // compte quatre fiches.
  var SECTEURS = [
    ['Conseil', 4], ['Conseil - secteur A', 1], ['Conseil - secteur B', 2],
    ['Audit - conseil', 1], ['Recouvrement de créances - secteur A', 1],
    ['Recrutement - secteur A', 1], ['Services - finances - secteur A', 1],
    ['Banque - secteur A', 1], ['Banque privée', 1], ['Finance - secteur A', 1],
    ['Médias', 1], ['Médias - presse', 2], ['Médias - secteur B', 2], ['Édition', 1],
    ['Aéronautique', 1], ['Aéronautique - secteur A', 1], ['Holding industrielle - secteur A', 1],
    ['Ingénierie - secteur A', 1], ['Logiciel - secteur A', 1],
    ['Technologie - secteur A', 1],
    ['BTP - secteur A', 1], ["BTP - tout corps d'état", 3], ['BTP - secteur B', 1],
    ['Tuyautiste', 1], ['Isolation - secteur A', 1], ['Isolation - secteur B', 1],
    ['CVC - Relationnel', 1], ['Ventilation - secteur A', 1], ['Rénovation - IA', 2],
    ['Énergie', 1], ['Énergie - secteur A', 1], ['Énergie - secteur B', 1], ['Environnement - secteur A', 1],
    ['Politique - secteur A', 2], ['Études - secteur A', 1],
    ['Associatif - secteur A', 1], ['Médico-social - secteur A', 1],
    ['Retail', 1], ['Luxe - secteur A', 1], ['Art - secteur A', 1], ['', 4]
  ];
  // Des noms inventés, de longueurs réelles (jusqu'à trente caractères).
  var PRENOMS = ['Aurèle', 'Bérénice', 'Clovis', 'Domitille', 'Éloi', 'Faustine', 'Gauthier', 'Hortense', 'Isaure',
    'Jean-Baptiste', 'Kilian', 'Léontine', 'Mathurin', 'Nausicaa', 'Octave', 'Pétronille', 'Quentin', 'Roseline',
    'Sixtine', 'Tancrède', 'Ursule', 'Valérien', 'Wandrille', 'Xavière', 'Yolande', 'Zénobe', 'Anne-Sophie', 'Pierre-Marie'];
  var NOMS = ['Vauquelin', 'de Montmirail-Val', 'Cassagnes', 'Lefébure', 'de Rochemaure', 'Brunetière', 'Aubriot',
    'de Kerguelen-Saint-Aubin', 'Pellerin', 'Delafosse', 'Marbeuf', 'Castelbajac-Neuvic', 'Orsini', 'Thévenot',
    'de La Tour-Maubourg', 'Villeneuve', 'Quenet', 'Grandsire', 'Hautecloque', 'Esquerré'];
  var BTP = /^(btp|tuyaut|isolation|cvc|ventilation|rénovation)/i;

  // Au plus trente caractères, comme le plus long nom réel (vingt-huit).
  function nomFictif(i) {
    for (var d = 0; d < NOMS.length; d++) {
      var nom = PRENOMS[i % PRENOMS.length] + ' ' + NOMS[(i * 7 + d) % NOMS.length];
      if (nom.length <= 30) { return nom; }
    }
    return PRENOMS[i % PRENOMS.length];
  }

  var params = new URLSearchParams(window.location.search);
  var cible = Math.max(1, Math.min(600, parseInt(params.get('n') || '54', 10) || 54));
  var liste = [];
  SECTEURS.forEach(function (s) { for (var i = 0; i < s[1]; i++) { liste.push(s[0]); } });
  var graine = 7;
  function alea() { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; }
  var noeuds = [];
  for (var i = 0; i < cible; i++) {
    var secteur = i < liste.length ? liste[i] : liste[Math.floor(alea() * liste.length)];
    noeuds.push({
      id: 'fictif-' + (i + 1),
      nom: nomFictif(i),
      type: BTP.test(secteur) && i % 3 === 0 ? 'artisan' : 'partenaire',
      secteur_activite: secteur,
      statut: 'prospect'
    });
  }
  var donnees = {
    noeuds: noeuds,
    personnes: [{ id: 'fictif-p1', nom: 'Honorine Delacroix-Vallon' }],
    rattachements: [{ personne_id: 'fictif-p1', node_id: 'fictif-1', role: 'Associée' }],
    relations: [{ source_id: 'fictif-1', target_id: 'fictif-24' }, { source_id: 'fictif-12', target_id: 'fictif-30' }]
  };
  document.getElementById('apercu-neb-note').textContent =
    noeuds.length + ' fiches fictives. Touchez une nébuleuse pour vous en approcher, une étoile pour « ouvrir » sa fiche.';
  var ouvert = document.getElementById('apercu-neb-ouvert');
  var surClicNoeud = function (id) {
    var n = noeuds.filter(function (x) { return x.id === id; })[0];
    ouvert.textContent = 'Fiche ouverte : ' + (n ? n.nom : id);
  };
  var libellesType = { artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier' };
  if (params.get('vue') === 'volume') {
    // Le volume (lot 3) : les mêmes réglages que RIVEN dans js/app.js.
    var T = window.UltimaNebuleusesRiven;
    var brumes = T.repartir(noeuds).map(function (g) {
      var pas = Math.max(1, Math.ceil(g.noeuds.length / 12));
      return {
        ids: g.noeuds.filter(function (n, i) { return i % pas === 0; }).map(function (n) { return n.id; }),
        teinte: T.teinte(g.nebuleuse)
      };
    });
    var vue = window.UltimaCiel.rendre(document.getElementById('ciel-scene'), donnees, {
      surClicNoeud: surClicNoeud,
      libellesType: libellesType,
      fond: true,
      stellarV2: true,
      regrouper: function (noeud) {
        var n = T.nebuleuseDe(noeud && noeud.secteur_activite);
        return { cle: n.cle === T.CLE_A_CLASSER ? window.UltimaCiel.CLE_A_CLASSER : 'neb-' + n.cle, label: n.nom, court: n.court };
      },
      nebuleuses: brumes
    });
    var bouton = document.getElementById('apercu-neb-tout-voir');
    bouton.hidden = false;
    bouton.addEventListener('click', function () { vue.toutVoir(); });
    return;
  }
  window.UltimaNebuleuses.rendre(document.getElementById('ciel-scene'), donnees, {
    surClicNoeud: surClicNoeud,
    surClicPersonne: function (id) { ouvert.textContent = 'Personne ouverte : ' + id; },
    libellesType: libellesType
  });
})();
