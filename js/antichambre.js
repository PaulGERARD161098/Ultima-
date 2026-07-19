// Ultima — antichambres des quadrants PAS ENCORE BÂTIS (BALTHAZAR GELD, IMLADRIK).
// Un seul script pour les deux coquilles : il lit `data-quadrant` sur <body>
// et ouvre le cartouche Léo « majordome de chantier » (js/leo-accueil.js,
// accueillirQuadrant) — état statique et sincère, aucune donnée personnelle,
// aucun appel réseau, aucune IA. Fail-closed : quadrant inconnu → rien.
(function () {
  'use strict';

  var CHANTIERS = {
    bcp: { blason: 'balance' },
    imladrik: { blason: 'epee' }
  };

  function saluer() {
    if (!window.UltimaLeo || typeof window.UltimaLeo.accueillirQuadrant !== 'function') { return; }
    var quadrant = (document.body && document.body.getAttribute('data-quadrant')) || '';
    var chantier = CHANTIERS[quadrant];
    if (!chantier) { return; }

    window.UltimaLeo.accueillirQuadrant({
      quadrant: quadrant,
      blason: chantier.blason,
      salutation: "Bienvenue, Paul. Ce quadrant n'est pas encore bâti. Voici où en est le chantier.",
      sections: [
        {
          titre: 'État du chantier', classe: 'leo-section-etat',
          lignes: ['En attente de son mini-cadrage (une boucle à la fois, la console d’abord).']
        }
      ],
      propositions: [
        { message: 'Ouvrir le chantier : dictez le cadrage à Léo en session.', action: null }
      ]
    });
  }

  saluer();
})();
