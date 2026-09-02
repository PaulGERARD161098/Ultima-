// LA PORTE D'ENTRÉE PASSE AU CIEL (2026-09-02, demandé par Paul : « même cette
// page il faut la changer — thème stellaire aussi »).
// ---------------------------------------------------------------------------
// L'écran de connexion portait une carte antique dessinée : mer moirée, terres
// ocre, rose des vents. Elle datait de l'accueil d'avant LV5 — depuis, l'outil
// entier est devenu un ciel. Une porte qui montre autre chose que la maison est
// une porte qui ment, même joliment.
//
// RÉEMPLOI PLUTÔT QUE RECOPIE : le champ d'étoiles vient de `js/ciel-fond.js`
// via `js/ciel-fond-page.js`, exactement celui des huit coques et des pages de
// travail. Un second champ écrit à côté aurait divergé du premier au premier
// réglage (règle du 2026-07-30).
//
// ⛔ IL NE TOUCHE PAS À L'AUTHENTIFICATION. Ce module ne lit aucune session, ne
// décide de rien, n'appelle rien : il peint. `js/boussole-auth.js` reste le seul
// à ouvrir et fermer la porte — c'est une surface sous gate, et un décor n'est
// pas une raison d'y entrer.
(function () {
  'use strict';

  // ON NE PEINT QU'À LA PREMIÈRE OUVERTURE DE LA PORTE. Le cas ordinaire est
  // Paul déjà connecté : l'écran ne paraît jamais, et peindre un champ
  // d'étoiles pour un élément qui restera `hidden` toute la session serait du
  // travail rendu à personne — sur RIVEN, une page de travail, cela se paierait
  // à chaque ouverture.
  function armer() {
    var ecran = document.getElementById('ecran-connexion');
    if (!ecran) { return; }
    var decor = ecran.querySelector('.ecran-decor');
    if (!decor || !window.UltimaFondPage) { return; }

    var monte = false;
    function peindreSiVisible() {
      if (monte || ecran.hasAttribute('hidden')) { return; }
      monte = true;
      window.UltimaFondPage.monter(decor);
      if (observateur) { observateur.disconnect(); }
    }

    // `hidden` est posé et retiré par boussole-auth : on l'observe, on ne le
    // devine pas. Un minuteur aurait marché la plupart du temps — c'est-à-dire
    // qu'il aurait échoué le jour où le réseau est lent, sans rien dire.
    var observateur = typeof MutationObserver === 'function'
      ? new MutationObserver(peindreSiVisible)
      : null;
    if (observateur) { observateur.observe(ecran, { attributes: true, attributeFilter: ['hidden'] }); }
    peindreSiVisible(); // déjà ouvert au chargement (config absente, par exemple)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armer);
  } else {
    armer();
  }
})();
