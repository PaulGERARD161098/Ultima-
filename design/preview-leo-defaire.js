// Maquette B1 ⑤ — le clic « Défaire » joué sur données fictives (aucun appel
// réseau). Il montre ce que Paul verra : le geste défait, le bouton qui
// disparaît, l'annonce au lecteur d'écran.
(function () {
  'use strict';
  var annonce = document.getElementById('apercu-annonce');
  var textes = {
    idee: "Défait : l'idée « Un atelier bois pour les apprentis » est retirée. Rien d'autre n'a bougé.",
    'idee-ecran': 'Défait par toi, à l’instant',
    relance: 'Défait par toi, à l’instant'
  };
  document.querySelectorAll('.leo-defaire').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var cas = bouton.getAttribute('data-cas');
      var bulle = bouton.closest('.apercu-issue');
      var ligne = bouton.closest('.apercu-geste');
      var etat = null;
      if (bulle) {
        bulle.setAttribute('data-etat', 'defait');
        etat = bulle.querySelector('.apercu-issue-texte');
      } else if (ligne) {
        ligne.setAttribute('data-etat', 'defait');
        // Défait : la cible n'existe plus, son nom disparaît avec elle.
        var cible = ligne.querySelector('.apercu-cible');
        if (cible) { cible.remove(); }
        etat = ligne.querySelector('.apercu-etat');
      }
      etat.textContent = textes[cas];
      annonce.textContent = textes[cas];
      // Le bouton disparaît : le focus va à ce qu'il est devenu, jamais à la
      // page (dry run du 02/10 — il tombait sur <body>).
      etat.setAttribute('tabindex', '-1');
      bouton.remove();
      etat.focus();
    });
  });
})();
