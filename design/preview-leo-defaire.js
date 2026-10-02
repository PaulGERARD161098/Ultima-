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
      if (bulle) {
        bulle.setAttribute('data-etat', 'defait');
        bulle.querySelector('.apercu-issue-texte').textContent = textes[cas];
      } else if (ligne) {
        ligne.setAttribute('data-etat', 'defait');
        ligne.querySelector('.apercu-etat').textContent = textes[cas];
      }
      annonce.textContent = textes[cas];
      bouton.remove();
    });
  });
})();
