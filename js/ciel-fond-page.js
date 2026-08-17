// LE FOND ÉTOILÉ DES PAGES DE TRAVAIL (LV5 / P5a).
// ---------------------------------------------------------------------------
// Demandé par Paul le 2026-08-17 : « mettre le fond aux étoiles partout », puis
// « embarque-les aussi et crée un affichage cohérent en conséquence, en fonction
// des projets ».
//
// LE PRINCIPE, ET IL TIENT EN UNE PHRASE : le fond étoilé devient le SOL COMMUN
// d'Ultima ; ce qui varie d'une page à l'autre, ce n'est pas le fond, c'est la
// densité du mobilier posé dessus (cadrage §16). Ce fichier livre le sol. Les
// registres — ciel, atelier, instrument — sont affaire de CSS.
//
// TROIS DIFFÉRENCES AVEC LE FOND DU CIEL, et chacune a sa raison :
//
//   ① AUCUNE BOUCLE D'ANIMATION. Le ciel a une caméra qui glisse, donc il
//      redessine. Une page de travail, non : on y reste vingt minutes à écrire,
//      et un canvas qui se repeint soixante fois par seconde pendant ce temps
//      est une batterie qui se vide pour rien. Le champ est peint UNE FOIS, puis
//      au redimensionnement seulement.
//   ② UNE PROJECTION FIXE, pas une caméra. Sans mouvement, la perspective n'a
//      rien à dire : on garde l'échelle et la parallaxe des nappes (qui donnent
//      la profondeur au repos) et l'on jette la rotation.
//   ③ IL EST DERRIÈRE TOUT, ET NE TOUCHE À RIEN. `position: fixed`, `z-index`
//      négatif, `aria-hidden`, `pointer-events: none`. Le contenu de la page
//      n'est pas déplacé d'un pixel — c'est le critère ① du cadrage, et il se
//      mesure avant/après.
//
// RÉEMPLOI PLUTÔT QUE RECOPIE : la peinture vient de `js/ciel-fond.js`, déjà
// éprouvée sur les huit coques et sur RIVEN. Un second champ d'étoiles écrit à
// côté aurait divergé du premier au premier réglage (règle du 2026-07-30).
(function () {
  'use strict';

  // La profondeur de champ, en unités du même monde que le ciel : les nappes de
  // `ciel-fond.js` sont posées entre 1,35 et 3,8 fois ce rayon.
  var RAYON_MONDE = 300;
  // La focale du ciel, reprise telle quelle : c'est elle qui donne aux grains
  // lointains leur petitesse, et l'harmonie entre les pages en dépend.
  var FOCALE = 620;
  // La distance de l'observateur. Choisie pour que le champ remplisse largement
  // l'écran sans que les grains proches deviennent des taches.
  var DISTANCE = 520;

  function monter(cible) {
    if (!window.UltimaCielFond) { return null; }
    var fond = window.UltimaCielFond.creer({ rayonMonde: RAYON_MONDE });
    fond.canvas.classList.add('ciel-fond-page');
    (cible || document.body).insertBefore(fond.canvas, (cible || document.body).firstChild);

    // LA PROJECTION FIXE. Même forme que celle du ciel — l'échelle décroît avec
    // la profondeur, ce qui donne les trois nappes — mais sans rotation ni
    // tangage : il n'y a pas de caméra à suivre.
    // Le décentrage vertical (0,62) reprend l'aplatissement du champ stellaire :
    // un amas est une lentille, pas une bille.
    function projeter(p) {
      var profondeur = p.z + DISTANCE + RAYON_MONDE * 2;
      if (profondeur < 60) { return null; }
      var echelle = FOCALE / profondeur;
      return {
        sx: fond.vbW / 2 + p.x * echelle,
        sy: fond.vbH / 2 + p.y * echelle,
        echelle: echelle,
        profondeur: profondeur
      };
    }

    function peindre() {
      var l = window.innerWidth;
      var h = window.innerHeight;
      // Le viewBox EST la surface, en pixels CSS : sans caméra, il n'y a aucune
      // raison d'introduire un second repère — et c'est un repère de moins qui
      // peut se décaler (le défaut de phase payé sur P1).
      fond.poser(l, h, l, h);
      fond.peindre(projeter, {});
    }

    peindre();
    // Au redimensionnement SEULEMENT. Groupé dans un `requestAnimationFrame`
    // pour ne pas repeindre à chaque pixel pendant qu'on tire une fenêtre.
    var enAttente = false;
    window.addEventListener('resize', function () {
      if (enAttente) { return; }
      enAttente = true;
      window.requestAnimationFrame(function () { enAttente = false; peindre(); });
    });
    return fond;
  }

  window.UltimaFondPage = { monter: monter };

  // Auto-montage sur toute page qui le déclare. Le fond est un CHOIX de page,
  // pas un effet de bord de l'inclusion du script : une page qui charge le
  // fichier sans le déclarer ne doit rien voir changer.
  if (document.body && document.body.hasAttribute('data-fond-etoile')) {
    monter(document.body);
  } else if (!document.body) {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.body.hasAttribute('data-fond-etoile')) { monter(document.body); }
    });
  }
})();
