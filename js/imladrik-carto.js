/* IMLADRIK — la cartographie du développement personnel (B1).
   ------------------------------------------------------------------
   Même mécanique que la boussole d'accueil (js/boussole.js), réduite au
   quadrant : une rose interne dont chaque cap est un pan d'IMLADRIK. Au
   centre, KALAMN-TALAEN (épée + dragon) = le guide ; sa parole se dépose
   dans le cartouche sous la carte au survol/focus. Clic → on entre dans le cap.

   Muette et sans donnée : la carto ne contient AUCUNE donnée intime (§5) —
   le journal MINETHNIR vit derrière auth sur sa propre page. Ici, que du
   texte statique défini dans ce fichier → aucune surface XSS.

   EXTENSIBILITÉ — ajouter un cap (valeurs, citations, quart d'heure…) =
   UNE entrée dans CAPS. Les caps se redistribuent seuls autour de la rose. */
(function () {
  'use strict';

  // ============================ REGISTRE ============================
  // cible  : page interne (même onglet) ; null = cap « à venir ».
  // etat   : libellé du badge (Ouvert / À venir).
  // resume : la parole de Kalamn-talaen, sous la carte au survol/focus.
  // blason : SVG gravé (registre antique), inséré tel quel (statique).
  var CAPS = [
    {
      id: 'minethnir',
      nom: 'MINETHNIR',
      cible: 'minethnir.html',
      etat: 'Ouvert',
      resume: 'Le journal intime. Tes pages, l’atelier d’écriture, la sauvegarde '
        + 'Drive — tout l’acquis, sous son vrai nom. Écris librement : rien ne se perd.',
      blason: blasonPlume(),
    },
    {
      id: 'vranesh',
      nom: 'VRANESH',
      cible: null,
      etat: 'À venir',
      resume: 'Les différents futurs potentiels. Dans un cas donné, dérouler ce '
        + 'qui peut arriver : scénarios, signaux à surveiller, parades préparées. '
        + 'Anticiper sereinement, puis revenir au présent.',
      blason: blasonBifurcation(),
    },
    {
      id: 'draukhain',
      nom: 'DRAUKHAIN',
      cible: 'draukhain.html',
      etat: 'Ouvert',
      resume: 'La volonté au-delà du possible. Tes serments et tes flammes : ne '
        + 'jamais oublier tes objectifs, entretenir la volonté inébranlable, ne '
        + 'pas perdre la foi. Des rappels, pas du jugement.',
      blason: blasonFlamme(),
    },
  ];

  // ============================ GÉOMÉTRIE ============================
  var RAYON_CAP = 40;      // distance des caps au centre (% du plateau)
  var RAYON_AIGUILLE = 30; // longueur des aiguilles (unités viewBox 0..100)
  var DEPART = -90;        // premier cap plein Nord, puis sens horaire

  function positions(n) {
    var pas = 360 / n;
    var out = [];
    for (var i = 0; i < n; i += 1) {
      var rad = (DEPART + i * pas) * Math.PI / 180;
      out.push({ cos: Math.cos(rad), sin: Math.sin(rad) });
    }
    return out;
  }

  // ============================== RENDU ==============================
  function demarrer() {
    var plateau = document.getElementById('boussole-plateau');
    var parole = document.getElementById('boussole-parole');
    if (!plateau || !parole) return;

    var paroleDefaut = parole.innerHTML; // conservé pour le retour au repos
    var pts = positions(CAPS.length);
    var ns = 'http://www.w3.org/2000/svg';

    // 1. Aiguilles (SVG en fond, sous les caps).
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'boussole-aiguilles');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var aiguilles = [];
    CAPS.forEach(function (cap, i) {
      var x = 50 + RAYON_AIGUILLE * pts[i].cos;
      var y = 50 + RAYON_AIGUILLE * pts[i].sin;
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'aiguille');
      var trait = document.createElementNS(ns, 'line');
      trait.setAttribute('x1', '50'); trait.setAttribute('y1', '50');
      trait.setAttribute('x2', String(x)); trait.setAttribute('y2', String(y));
      trait.setAttribute('class', 'aiguille-trait');
      var pointe = document.createElementNS(ns, 'circle');
      pointe.setAttribute('cx', String(x)); pointe.setAttribute('cy', String(y));
      pointe.setAttribute('r', '2.1');
      pointe.setAttribute('class', 'aiguille-pointe');
      g.appendChild(trait); g.appendChild(pointe);
      svg.appendChild(g);
      aiguilles.push(g);
    });
    plateau.appendChild(svg);

    // 2. Cœur : Kalamn-talaen (décor stable, toujours visible) + légende gravée.
    var coeur = document.createElement('div');
    coeur.className = 'boussole-coeur';
    coeur.setAttribute('aria-hidden', 'true');
    coeur.innerHTML = kalamnTalaen();
    plateau.appendChild(coeur);

    var legende = document.createElement('p');
    legende.className = 'kalamn-legende';
    legende.setAttribute('aria-hidden', 'true');
    legende.textContent = 'Kalamn-talaen';
    plateau.appendChild(legende);

    // 3. Parole de Kalamn-talaen (cartouche sous la carte).
    var actif = null;
    function afficherResume(cap) {
      actif = cap;
      parole.classList.add('is-actif');
      parole.innerHTML =
        '<p class="parole-nom">' + cap.nom + '</p>' +
        '<p class="parole-etat">' + cap.etat + '</p>' +
        '<p class="parole-texte">' + cap.resume + '</p>' +
        '<p class="parole-action">' +
          (cap.cible ? 'Clique pour entrer ↝' : 'Cap en préparation') +
        '</p>';
    }
    function reinitResume() {
      actif = null;
      parole.classList.remove('is-actif');
      parole.innerHTML = paroleDefaut;
    }

    // 4. Les caps, disposés autour de la rose.
    CAPS.forEach(function (cap, i) {
      var estOuvrable = Boolean(cap.cible);
      var el = document.createElement(estOuvrable ? 'a' : 'div');
      el.className = 'cap' + (estOuvrable ? '' : ' cap--avenir');
      el.dataset.id = cap.id;
      el.style.left = (50 + RAYON_CAP * pts[i].cos) + '%';
      el.style.top = (50 + RAYON_CAP * pts[i].sin) + '%';
      el.setAttribute('aria-label', cap.nom + ' — ' + cap.etat);

      if (estOuvrable) {
        el.setAttribute('href', cap.cible);
      } else {
        el.setAttribute('role', 'button');
        el.setAttribute('aria-disabled', 'true');
        el.tabIndex = 0;
      }

      el.innerHTML =
        '<span class="cap-blason">' + cap.blason + '</span>' +
        '<span class="cap-corps">' +
          '<span class="cap-nom">' + cap.nom + '</span>' +
          '<span class="cap-etat">' + cap.etat + '</span>' +
        '</span>';

      function activer() {
        el.classList.add('is-actif');
        aiguilles[i].classList.add('is-actif');
        afficherResume(cap);
      }
      function desactiver() {
        el.classList.remove('is-actif');
        aiguilles[i].classList.remove('is-actif');
        reinitResume();
      }
      el.addEventListener('mouseenter', activer);
      el.addEventListener('mouseleave', desactiver);
      el.addEventListener('focus', activer);
      el.addEventListener('blur', desactiver);

      // Cap « à venir » : Entrée/Espace ne navigue pas, montre juste la parole.
      if (!estOuvrable) {
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activer(); }
        });
      }

      plateau.appendChild(el);
    });

    plateau.classList.add('is-pret');
  }

  // ===================== KALAMN-TALAEN (le guide) =====================
  // Le centre : épée dressée (la lame fait l'aiguille Nord) enlacée d'un dragon,
  // gravure encre sur médaillon d'or. Emblème du guide d'IMLADRIK.
  function kalamnTalaen() {
    return '<svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">'
      + '<defs><radialGradient id="kt-or" cx="38%" cy="32%" r="78%">'
      + '<stop offset="0" stop-color="#f4e6bd"/>'
      + '<stop offset="55%" stop-color="#e3cd93"/>'
      + '<stop offset="100%" stop-color="#cbab63"/></radialGradient></defs>'
      + '<circle cx="60" cy="60" r="55" fill="url(#kt-or)" stroke="#6e5320" stroke-width="2.6"/>'
      + '<circle cx="60" cy="60" r="49" fill="none" stroke="#6e5320" stroke-width="1" opacity="0.7"/>'
      + '<circle cx="60" cy="60" r="45" fill="none" stroke="#a9884a" stroke-width="0.8"/>'
      + '<g fill="#6e5320">'
      + '<circle cx="60" cy="8.5" r="1.7"/><circle cx="60" cy="111.5" r="1.7"/>'
      + '<circle cx="8.5" cy="60" r="1.7"/><circle cx="111.5" cy="60" r="1.7"/></g>'
      // dragon : corps serpentin derrière la lame
      + '<g fill="none" stroke="#3b2f1c" stroke-width="3.2" stroke-linecap="round">'
      + '<path d="M38 82 C 30 74, 30 62, 42 58 C 54 54, 70 56, 76 46"/>'
      + '<path d="M76 46 C 80 39, 76 31, 68 30"/></g>'
      + '<path d="M38 82 C 42 88, 50 90, 57 87 L 53 83 C 48 85, 43 84, 40 80 Z" fill="#3b2f1c"/>'
      + '<path d="M47 57 C 42 47, 46 38, 56 34 C 52 40, 52 46, 55 51 Z" fill="#3b2f1c" opacity="0.85"/>'
      // la lame (l'aiguille Nord), par-dessus le corps
      + '<g fill="#3b2f1c">'
      + '<path d="M60 14 L62.4 20 L62.4 74 L57.6 74 L57.6 20 Z"/>'
      + '<rect x="49" y="74" width="22" height="3.6" rx="1.8"/>'
      + '<rect x="58.1" y="77.6" width="3.8" height="8"/>'
      + '<circle cx="60" cy="89" r="3.1"/></g>'
      + '<path d="M60 18 V 72" stroke="#e0c48a" stroke-width="0.9" opacity="0.75"/>'
      // avant-corps du dragon par-dessus la lame (enroulement)
      + '<path d="M52 66 C 58 63, 66 63, 70 58" fill="none" stroke="#3b2f1c" stroke-width="3.2" stroke-linecap="round"/>'
      // tête tournée vers la lame, œil d'or
      + '<path d="M68 30 C 63 29, 59 31, 57 35 C 61 36, 66 36, 69 34 L 74 33 L 69.5 31.5 Z" fill="#3b2f1c"/>'
      + '<circle cx="64.5" cy="32.5" r="1" fill="#e8cf8f"/>'
      + '<path d="M67 29.5 l 1.5 -3.5 l 1.5 3" fill="none" stroke="#3b2f1c" stroke-width="1.1" stroke-linecap="round"/>'
      + '</svg>';
  }

  // ======================= BLASONS (gravures) =======================
  // Même langage que css/boussole.css : disque parchemin, cerne or, emblème encre.
  function disque(interieur, label) {
    return '<svg class="cap-blason-svg" viewBox="0 0 72 72" role="img" '
      + 'aria-label="Blason gravé : ' + label + '" focusable="false">'
      + '<circle cx="36" cy="36" r="33" fill="#f9f1dc" stroke="#a9884a" stroke-width="2.4"/>'
      + '<circle cx="36" cy="36" r="28.5" fill="none" stroke="#5a4118" stroke-width="1"/>'
      + interieur + '</svg>';
  }

  function blasonPlume() {
    // MINETHNIR — la plume sur la ligne écrite (le journal).
    return disque(
      '<path d="M46 16 C 38 20, 30 30, 27 44 L 29.5 45 C 35 33, 41 24, 48 19 Z" fill="#3b2f1c"/>'
      + '<path d="M43 22 C 39 27, 35 33, 32 40" stroke="#e0c48a" stroke-width="0.8" fill="none" opacity="0.8"/>'
      + '<path d="M27 44 L 24.5 50 L 30 47.5 Z" fill="#3b2f1c"/>'
      + '<path d="M22 55 H 50" stroke="#3b2f1c" stroke-width="1.6" stroke-linecap="round"/>'
      + '<path d="M22 55 H 38" stroke="#a9884a" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/>',
      'une plume d’écriture sur une ligne');
  }

  function blasonBifurcation() {
    // VRANESH — le chemin qui bifurque, trois futurs (étoiles).
    return disque(
      '<path d="M36 56 V 40" stroke="#3b2f1c" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
      + '<path d="M36 40 C 36 32, 28 30, 24 22" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<path d="M36 40 C 36 30, 36 26, 36 20" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<path d="M36 40 C 36 32, 44 30, 48 22" stroke="#3b2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>'
      + '<g fill="#a9884a">'
      + '<path d="M24 14 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/>'
      + '<path d="M36 10 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/>'
      + '<path d="M48 14 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 Z"/></g>',
      'un chemin qui bifurque vers trois futurs');
  }

  function blasonFlamme() {
    // DRAUKHAIN — la flamme qui ne s'éteint pas, sur son socle.
    return disque(
      '<path d="M36 15 C 42 23, 48 28, 48 38 C 48 47, 43 53, 36 54'
      + ' C 29 53, 24 47, 24 38 C 24 31, 28 27, 30 23'
      + ' C 31 27, 33 29, 36 30 C 34 25, 34 20, 36 15 Z" fill="#3b2f1c"/>'
      + '<path d="M36 32 C 39 36, 41 38, 41 42 C 41 47, 39 49, 36 50'
      + ' C 33 49, 31 47, 31 42 C 31 38, 33 36, 36 32 Z" fill="#e8cf8f"/>'
      + '<path d="M26 58 H 46" stroke="#3b2f1c" stroke-width="2" stroke-linecap="round"/>',
      'une flamme qui ne s’éteint pas');
  }

  // Exposé pour les harnais (noms des caps — donnée statique, aucune PII).
  window.UltimaImladrikCarto = { noms: CAPS.map(function (c) { return c.nom; }) };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
