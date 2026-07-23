/* Ultima LV2 — Boussole d'accueil (macro-projets).
   ------------------------------------------------------------------
   Le niveau au-dessus de la console : une rose des vents dont chaque cap
   pointe vers un MACRO-PROJET de Paul. Survol/focus d'un cap → il s'illumine,
   son aiguille se rehausse et Léo dépose son résumé dans le cartouche sous la
   boussole (zéro surcharge visuelle : la donnée n'apparaît qu'à la demande).
   Clic → ouverture du macro-projet.

   EXTENSIBILITÉ — ajouter un macro-projet = UNE entrée dans MACRO_PROJETS.
   Les caps se redistribuent automatiquement autour de la rose ; aucune autre
   ligne à toucher.

   Vanilla, zéro dépendance, zéro CDN. innerHTML n'insère QUE du contenu
   statique défini ici (aucune donnée utilisateur) → pas de surface XSS. */
(function () {
  'use strict';

  // ============================ REGISTRE ============================
  // cible   : URL interne (même onglet) ou externe ; null = cap « à venir ».
  // externe : true → ouverture nouvel onglet (rel noopener).
  // etat    : libellé du badge (Ouvert / À venir / …).
  // resume  : le mot de Léo, affiché sous la boussole au survol/focus.
  // blason  : SVG gravé (registre antique), inséré tel quel.
  var MACRO_PROJETS = [
    {
      id: 'ultima',
      nom: 'ULTIMA',
      cible: 'ultima.html',
      externe: false,
      etat: 'Ouvert',
      resume: 'La console à quatre quadrants. RIVEN (réseau commercial) est '
        + 'actif ; NICOL BOLAS, ADRAMELECH et IMLADRIK sont en chantier. '
        + 'Entre pour piloter tes données.',
      blason: blasonRose(),
    },
    {
      id: 'renoboost-ia',
      nom: 'RENOBOOST IA',
      cible: 'https://www.renoboostia.fr',
      externe: true,
      etat: 'Ouvert',
      resume: 'Console Renoboost IA — le socle rémunérateur (chantiers + '
        + 'installations à domicile). S’ouvre dans un nouvel onglet.',
      blason: blasonEssor(),
    },
    {
      id: 'ycome',
      nom: 'YCOME',
      cible: null,
      externe: true,
      etat: 'À venir',
      resume: 'Projet YCOME, plateforme externe. Le cap est prêt : transmets-moi '
        + 'son URL et je le branche.',
      blason: blasonPortail(),
    },
    {
      id: 'reshiram',
      nom: 'RESHIRAM',
      cible: 'reshiram.html',
      externe: false,
      etat: 'Ouvert',
      resume: '« Le travail de la réalité » — cartographier tes talents et '
        + 'capacités concrets : ce que tu sais vraiment faire, tes plus-values '
        + 'réelles, ton réseau (lien fort avec RIVEN). Rien que du concret, '
        + 'faits et chiffres. Passerelle avec ZEKROM.',
      blason: blasonAileBlanche(),
      lien: 'zekrom', // passerelle réel ↔ idéal
    },
    {
      id: 'zekrom',
      nom: 'ZEKROM',
      cible: 'zekrom.html',
      externe: false,
      etat: 'Ouvert',
      resume: '« La quête de l’idéal » — tes rêves et volontés hautes, captés '
        + 'librement puis formulés en directions (le cap). Un idéal sans cap '
        + 'reste plein : « à orienter », jamais dévalué. Passerelle avec RESHIRAM '
        + '(rétroplanning idéal → réel).',
      blason: blasonAileNoire(),
    },
  ];

  // ============================ GÉOMÉTRIE ============================
  var RAYON_CAP = 40;      // distance des caps au centre (% du plateau)
  var RAYON_AIGUILLE = 30; // longueur des aiguilles (unités viewBox 0..100)
  var DEPART = -90;        // premier cap plein Nord, puis sens horaire

  function positions(n) {
    // Répartition régulière : n caps → n directions à parts égales.
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
    var pts = positions(MACRO_PROJETS.length);
    var ns = 'http://www.w3.org/2000/svg';

    // 1. Aiguilles (SVG en fond, sous les caps).
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'boussole-aiguilles');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var aiguilles = [];
    MACRO_PROJETS.forEach(function (projet, i) {
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

    // Passerelle(s) : lien visuel entre deux caps liés (RESHIRAM ↔ ZEKROM) —
    // trait pointillé posé DERRIÈRE les aiguilles. `lien` = id du cap jumeau.
    MACRO_PROJETS.forEach(function (projet, i) {
      if (!projet.lien) return;
      var j = MACRO_PROJETS.findIndex(function (p) { return p.id === projet.lien; });
      if (j < 0) return;
      var pont = document.createElementNS(ns, 'line');
      pont.setAttribute('x1', String(50 + RAYON_CAP * pts[i].cos));
      pont.setAttribute('y1', String(50 + RAYON_CAP * pts[i].sin));
      pont.setAttribute('x2', String(50 + RAYON_CAP * pts[j].cos));
      pont.setAttribute('y2', String(50 + RAYON_CAP * pts[j].sin));
      pont.setAttribute('class', 'passerelle');
      svg.insertBefore(pont, svg.firstChild);
    });

    plateau.appendChild(svg);

    // 2. Cœur de la rose (décor stable, toujours visible).
    var coeur = document.createElement('div');
    coeur.className = 'boussole-coeur';
    coeur.setAttribute('aria-hidden', 'true');
    coeur.innerHTML = roseDesVents();
    plateau.appendChild(coeur);

    // 3. Parole de Léo (cartouche sous la boussole).
    function afficherResume(projet) {
      parole.classList.add('is-actif');
      parole.innerHTML =
        '<p class="parole-nom">' + projet.nom + '</p>' +
        '<p class="parole-etat">' + projet.etat + '</p>' +
        '<p class="parole-texte">' + projet.resume + '</p>' +
        '<p class="parole-action">' +
          (projet.cible
            ? (projet.externe ? 'Clique pour ouvrir (nouvel onglet) ↗' : 'Clique pour entrer ↝')
            : 'Cap en préparation') +
        '</p>';
    }
    function reinitResume() {
      parole.classList.remove('is-actif');
      parole.innerHTML = paroleDefaut;
    }

    // 4. Les caps, disposés autour de la rose.
    MACRO_PROJETS.forEach(function (projet, i) {
      var estOuvrable = Boolean(projet.cible);
      var cap = document.createElement(estOuvrable ? 'a' : 'div');
      cap.className = 'cap' + (estOuvrable ? '' : ' cap--avenir');
      cap.dataset.id = projet.id;
      cap.style.left = (50 + RAYON_CAP * pts[i].cos) + '%';
      cap.style.top = (50 + RAYON_CAP * pts[i].sin) + '%';
      cap.setAttribute('aria-label', projet.nom + ' — ' + projet.etat);

      if (estOuvrable) {
        cap.setAttribute('href', projet.cible);
        if (projet.externe) { cap.target = '_blank'; cap.rel = 'noopener noreferrer'; }
      } else {
        cap.setAttribute('role', 'button');
        cap.setAttribute('aria-disabled', 'true');
        cap.tabIndex = 0;
      }

      cap.innerHTML =
        '<span class="cap-blason">' + projet.blason + '</span>' +
        '<span class="cap-corps">' +
          '<span class="cap-nom">' + projet.nom + '</span>' +
          '<span class="cap-etat">' + projet.etat + '</span>' +
        '</span>';

      // Illumination + résumé au survol ET au focus clavier.
      function activer() {
        cap.classList.add('is-actif');
        aiguilles[i].classList.add('is-actif');
        afficherResume(projet);
      }
      function desactiver() {
        cap.classList.remove('is-actif');
        aiguilles[i].classList.remove('is-actif');
        reinitResume();
      }
      cap.addEventListener('mouseenter', activer);
      cap.addEventListener('mouseleave', desactiver);
      cap.addEventListener('focus', activer);
      cap.addEventListener('blur', desactiver);

      // Cap « à venir » : Entrée/Espace ne navigue pas, montre juste le résumé.
      if (!estOuvrable) {
        cap.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activer(); }
        });
      }

      plateau.appendChild(cap);
    });

    plateau.classList.add('is-pret');
  }

  // ======================= BLASONS (gravures) =======================
  // Même langage que css/console.css : disque parchemin, cerne or, emblème encre.
  function disque(interieur, label) {
    return '<svg class="cap-blason-svg" viewBox="0 0 72 72" role="img" '
      + 'aria-label="Blason gravé : ' + label + '" focusable="false">'
      + '<circle cx="36" cy="36" r="33" fill="#f9f1dc" stroke="#a9884a" stroke-width="2.4"/>'
      + '<circle cx="36" cy="36" r="28.5" fill="none" stroke="#5a4118" stroke-width="1"/>'
      + interieur + '</svg>';
  }

  function blasonRose() {
    // Ultima : rose des vents à huit rais (l'emblème de la maison).
    return disque(
      '<path d="M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z" fill="#3b2f1c"/>'
      + '<path d="M36 18 L38.5 33.5 L54 36 L38.5 38.5 L36 54 L33.5 38.5 L18 36 L33.5 33.5 Z" fill="#a9884a" opacity="0.55"/>'
      + '<circle cx="36" cy="36" r="2.4" fill="#f9f1dc" stroke="#5a4118" stroke-width="1"/>',
      'la rose des vents d’Ultima');
  }

  function blasonEssor() {
    // Renoboost IA : l'étoile en essor, sillage montant.
    return disque(
      '<path d="M22 50 L46 26" stroke="#3b2f1c" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
      + '<path d="M28 50 L48 30" stroke="#a9884a" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>'
      + '<path d="M46 22 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z" fill="#3b2f1c"/>',
      'l’étoile en essor de Renoboost IA');
  }

  function blasonPortail() {
    // YCOME : le portail ouvert, flèche sortante (ouverture externe).
    return disque(
      '<path d="M23 51 V37 a13 13 0 0 1 26 0 V51" fill="none" stroke="#3b2f1c" stroke-width="2.4"/>'
      + '<path d="M20 51 H52" stroke="#3b2f1c" stroke-width="2.4" stroke-linecap="round"/>'
      + '<path d="M31 40 h10 m0 0 l-3.6 -3.6 m3.6 3.6 l-3.6 3.6" fill="none" stroke="#a9884a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
      'le portail d’YCOME');
  }

  // Aile plumée (facing right), réutilisée par les deux caps du doublet.
  // remplissage = couleur des plumes ; le cerne encre et les nervures d'or
  // donnent le relief. RESHIRAM = aile blanche, ZEKROM = aile noire (miroir).
  function aile(remplissage) {
    return '<g stroke="#3b2f1c" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">'
      + '<path d="M23 49 C 23 40, 25 32, 33 27 C 40 22, 48 22, 54 23'
      + ' C 49 26, 47 29, 47.5 32 C 44 30, 41 31, 40 34'
      + ' C 43 34, 45 36, 45 39 C 41 37, 38 38, 37 41'
      + ' C 40 41, 42 43, 42 45 C 37 44, 30 47, 23 49 Z" fill="' + remplissage + '"/>'
      + '</g>'
      + '<path d="M27 46 C 31 35, 40 28, 51 25" stroke="#a9884a" stroke-width="0.7" fill="none" opacity="0.6"/>';
  }

  function blasonAileBlanche() {
    // RESHIRAM — l'aile blanche (le dragon blanc de la réalité).
    return disque(aile('#ffffff'), 'l’aile blanche de RESHIRAM');
  }

  function blasonAileNoire() {
    // ZEKROM — l'aile noire (le dragon noir de l'idéal), en miroir.
    return disque(
      '<g transform="translate(72,0) scale(-1,1)">' + aile('#241c12') + '</g>',
      'l’aile noire de ZEKROM');
  }

  function roseDesVents() {
    // Rose centrale décorative (huit rais gravés), au repos dans le cœur.
    return '<svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">'
      + '<circle cx="50" cy="50" r="34" fill="none" stroke="#a9884a" stroke-width="1.2" opacity="0.9"/>'
      + '<circle cx="50" cy="50" r="26" fill="none" stroke="#5a4118" stroke-width="0.8" opacity="0.7"/>'
      + '<path d="M50 12 L56 44 L88 50 L56 56 L50 88 L44 56 L12 50 L44 44 Z" fill="#3b2f1c"/>'
      + '<path d="M50 22 L54 46 L78 50 L54 54 L50 78 L46 54 L22 50 L46 46 Z" fill="#a9884a" opacity="0.5"/>'
      + '<circle cx="50" cy="50" r="3" fill="#f9f1dc" stroke="#5a4118" stroke-width="1"/>'
      + '<text x="50" y="9" text-anchor="middle" font-size="8" fill="#f6eed9" font-style="italic">N</text>'
      + '</svg>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
