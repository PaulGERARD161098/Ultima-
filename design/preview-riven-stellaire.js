/* Maquette RIVEN — thème stellaire. Script de la maquette UNIQUEMENT.
   Trois choses, et rien d'autre :
     ① le commutateur d'états (l'app n'a pas d'états « à montrer », une
        maquette si — c'est même sa raison d'être) ;
     ② un jeu de données INVENTÉ, donné au vrai moteur `js/ciel.js` ;
     ③ le BANDEAU DE MESURE, qui applique le critère ④ du cadrage : le
        contraste se calcule, il ne se regarde pas.

   Ce que ce fichier ne fait PAS, et c'est le correctif du jour : il ne
   dessine plus de ciel. La première version en dessinait un, plat, « pour la
   démonstration » — et Paul a immédiatement demandé où était passé le 3D. Une
   maquette qui remplace le moteur qu'elle prétend montrer ne montre plus rien. */
(function () {
  'use strict';

  // ======================================================================
  // ①  Commutateur d'états
  // ======================================================================

  var ETATS = {
    accueil:    { espace: 'etat-accueil',    onglet: 'accueil'  },
    ciel:       { espace: 'etat-ciel',       onglet: 'ciel'     },
    contacts:   { espace: 'etat-contacts',   onglet: 'contacts' },
    fiche:      { espace: 'etat-ciel',       onglet: 'ciel',     panneau: 'fiche' },
    formulaire: { espace: 'etat-ciel',       onglet: 'ciel',     panneau: 'formulaire' },
    vide:       { espace: 'etat-vide',       onglet: 'ciel'     },
    deconnecte: { espace: 'etat-deconnecte', onglet: 'ciel'     },
    toast:      { espace: 'etat-contacts',   onglet: 'contacts', toast: true }
  };
  var ESPACES = ['etat-accueil', 'etat-ciel', 'etat-contacts', 'etat-vide', 'etat-deconnecte'];

  function appliquerEtat(nom) {
    var etat = ETATS[nom];
    if (!etat) { return; }

    ESPACES.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { section.hidden = id !== etat.espace; }
    });

    var panneau = document.getElementById('panneau');
    panneau.hidden = !etat.panneau;
    document.getElementById('vue-fiche').hidden = etat.panneau !== 'fiche';
    document.getElementById('form-noeud').hidden = etat.panneau !== 'formulaire';
    document.getElementById('panneau-titre').textContent =
      etat.panneau === 'formulaire' ? 'Modifier la fiche' : 'Fiche';

    document.getElementById('toasts').hidden = !etat.toast;

    document.querySelectorAll('.barre-onglets .onglet').forEach(function (bouton) {
      if (bouton.getAttribute('data-onglet') === etat.onglet) {
        bouton.setAttribute('aria-current', 'page');
      } else {
        bouton.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('.mq-etats .mq-bouton').forEach(function (bouton) {
      if (bouton.getAttribute('data-etat') === nom) {
        bouton.setAttribute('aria-pressed', 'true');
      } else {
        bouton.removeAttribute('aria-pressed');
      }
    });

    // Même règle que js/app.js : on rend en entrant, on ARRÊTE en sortant.
    // Une boucle d'animation qui tourne sous un écran caché est une batterie
    // qui se vide pour rien.
    if (etat.espace === 'etat-ciel') {
      rendreLeCiel();
    } else if (window.UltimaCiel) {
      window.UltimaCiel.arreter();
    }
  }

  // ======================================================================
  // ②  Les données — INVENTÉES, et données au vrai moteur
  // ======================================================================
  //
  // Six secteurs : `secteur_activite` est ce qui fait la constellation
  // (js/ciel.js, fonction `grouper`). Dix-huit fiches, dix personnes dont
  // deux rattachées à deux fiches (c'est ce cas-là qui rend le rattachement
  // multiple visible), vingt-deux relations de trois natures.

  var NOEUDS = [
    { id: 'n1',  nom: 'Maison Vaillant',          type: 'artisan',     statut: 'actif',    secteur_activite: 'Couverture',   ville: 'Melun' },
    { id: 'n2',  nom: 'Atelier Roquefeuil',       type: 'artisan',     statut: 'actif',    secteur_activite: 'Couverture',   ville: 'Melun' },
    { id: 'n3',  nom: 'Toitures du Loing',        type: 'artisan',     statut: 'prospect', secteur_activite: 'Couverture',   ville: 'Nemours' },
    { id: 'n4',  nom: 'Bois & Cadre',             type: 'artisan',     statut: 'actif',    secteur_activite: 'Menuiserie',   ville: 'Provins' },
    { id: 'n5',  nom: 'Menuiserie Estampe',       type: 'artisan',     statut: 'actif',    secteur_activite: 'Menuiserie',   ville: 'Melun' },
    { id: 'n6',  nom: 'Fenêtres Aubelin',         type: 'artisan',     statut: 'inactif',  secteur_activite: 'Menuiserie',   ville: 'Fontainebleau' },
    { id: 'n7',  nom: 'Plomberie Cavelier',       type: 'artisan',     statut: 'actif',    secteur_activite: 'Plomberie',    ville: 'Melun' },
    { id: 'n8',  nom: 'Sanitaires Brévent',       type: 'artisan',     statut: 'prospect', secteur_activite: 'Plomberie',    ville: 'Nemours' },
    { id: 'n9',  nom: 'Maçonnerie Delaunay',      type: 'artisan',     statut: 'actif',    secteur_activite: 'Maçonnerie',   ville: 'Provins' },
    { id: 'n10', nom: 'Pierre & Chaux',           type: 'artisan',     statut: 'actif',    secteur_activite: 'Maçonnerie',   ville: 'Moret' },
    { id: 'n11', nom: 'Fondations Tercier',       type: 'artisan',     statut: 'prospect', secteur_activite: 'Maçonnerie',   ville: 'Melun' },
    { id: 'n12', nom: 'Cabinet Ferrand & Fils',   type: 'partenaire',  statut: 'actif',    secteur_activite: 'Architecture', ville: 'Fontainebleau' },
    { id: 'n13', nom: 'Atelier Marnier',          type: 'partenaire',  statut: 'actif',    secteur_activite: 'Architecture', ville: 'Melun' },
    { id: 'n14', nom: 'Volts & Compagnie',        type: 'artisan',     statut: 'actif',    secteur_activite: 'Électricité',  ville: 'Melun' },
    { id: 'n15', nom: 'Réseaux Lambert',          type: 'artisan',     statut: 'inactif',  secteur_activite: 'Électricité',  ville: 'Provins' },
    { id: 'n16', nom: 'Résidence des Quatre-Vents', type: 'lead',      statut: 'prospect', secteur_activite: 'Syndic',       ville: 'Nemours' },
    { id: 'n17', nom: 'Les Trois-Ormes',          type: 'chantier',    statut: 'en_cours', secteur_activite: 'Rénovation',   ville: 'Melun' },
    { id: 'n18', nom: 'Grange de Vaux',           type: 'chantier',    statut: 'termine',  secteur_activite: 'Rénovation',   ville: 'Moret' }
  ];

  var PERSONNES = [
    { id: 'p1', nom: 'Godefroy Lasserre' }, { id: 'p2', nom: 'Marion Delcourt' },
    { id: 'p3', nom: 'Sylvain Bréaud' },    { id: 'p4', nom: 'Alix Ferrand' },
    { id: 'p5', nom: 'Camille Estampe' },   { id: 'p6', nom: 'Noé Cavelier' },
    { id: 'p7', nom: 'Irène Delaunay' },    { id: 'p8', nom: 'Basile Tercier' },
    { id: 'p9', nom: 'Hélène Marnier' },    { id: 'p10', nom: 'Youna Kerbrat' }
  ];

  var RATTACHEMENTS = [
    { personne_id: 'p1', node_id: 'n1',  role: 'gérant' },
    { personne_id: 'p1', node_id: 'n17', role: 'référent chantier' }, // deux fiches
    { personne_id: 'p2', node_id: 'n1',  role: 'conductrice de travaux' },
    { personne_id: 'p3', node_id: 'n2',  role: 'gérant' },
    { personne_id: 'p4', node_id: 'n12', role: 'architecte' },
    { personne_id: 'p4', node_id: 'n17', role: 'maîtrise d’œuvre' },        // deux fiches
    { personne_id: 'p5', node_id: 'n5',  role: 'gérante' },
    { personne_id: 'p6', node_id: 'n7',  role: 'gérant' },
    { personne_id: 'p7', node_id: 'n9',  role: 'gérante' },
    { personne_id: 'p8', node_id: 'n11', role: 'commercial' },
    { personne_id: 'p9', node_id: 'n13', role: 'architecte' },
    { personne_id: 'p10', node_id: 'n16', role: 'syndic' }
  ];

  var RELATIONS = [
    { source_id: 'n1',  target_id: 'n12', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n1',  target_id: 'n17', type: 'chantier_commun', statut: 'actif' },
    { source_id: 'n2',  target_id: 'n17', type: 'chantier_commun', statut: 'actif' },
    { source_id: 'n12', target_id: 'n17', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n5',  target_id: 'n17', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n7',  target_id: 'n17', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n9',  target_id: 'n17', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n14', target_id: 'n17', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n9',  target_id: 'n18', type: 'chantier_commun', statut: 'inactif' },
    { source_id: 'n10', target_id: 'n18', type: 'chantier_commun', statut: 'inactif' },
    { source_id: 'n4',  target_id: 'n18', type: 'sous_traitance',  statut: 'inactif' },
    { source_id: 'n12', target_id: 'n13', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n13', target_id: 'n16', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n1',  target_id: 'n2',  type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n3',  target_id: 'n16', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n7',  target_id: 'n8',  type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n14', target_id: 'n15', type: 'sous_traitance',  statut: 'inactif' },
    { source_id: 'n5',  target_id: 'n6',  type: 'sous_traitance',  statut: 'inactif' },
    { source_id: 'n10', target_id: 'n11', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n4',  target_id: 'n12', type: 'apport_affaires', statut: 'actif' },
    { source_id: 'n11', target_id: 'n17', type: 'sous_traitance',  statut: 'actif' },
    { source_id: 'n8',  target_id: 'n16', type: 'apport_affaires', statut: 'actif' }
  ];

  var LIBELLES_TYPE = {
    artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier'
  };
  var LIBELLES_STATUT = {
    actif: 'actif', prospect: 'prospect', en_cours: 'en cours',
    termine: 'terminé', inactif: 'inactif'
  };

  function rendreLeCiel() {
    var scene = document.getElementById('ciel-scene');
    if (!scene || !window.UltimaCiel) { return; }
    if (!scene.clientWidth || !scene.clientHeight) { return; } // boîte pas encore posée
    window.UltimaCiel.rendre(scene, {
      noeuds: NOEUDS, personnes: PERSONNES,
      rattachements: RATTACHEMENTS, relations: RELATIONS
    }, { libellesType: LIBELLES_TYPE, libellesStatut: LIBELLES_STATUT });
  }

  // ======================================================================
  // ③  Le bandeau de MESURE — critère ④ du cadrage
  // ======================================================================

  // Les fonds en dégradé n'ont pas de `background-color` lisible. On leur
  // substitue leur teinte la plus CLAIRE (le halo, pas le bord) : c'est le
  // PIRE CAS pour du texte crème, et un pire cas se construit, il ne s'espère
  // pas (leçon du foyer DRAUKHAIN, 2026-08-01).
  var FONDS_DEGRADE = [
    { selecteur: '.ciel-scene', couleur: [14, 27, 47] },
    { selecteur: 'body', couleur: [14, 26, 46] }
  ];

  function versRGBA(texte) {
    var m = /rgba?\(([^)]+)\)/.exec(texte || '');
    if (!m) { return null; }
    var n = m[1].split(',').map(function (v) { return parseFloat(v); });
    return { r: n[0], v: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  }

  function superposer(bas, haut) { // haut par-dessus bas, alpha du haut
    return {
      r: haut.a * haut.r + (1 - haut.a) * bas.r,
      v: haut.a * haut.v + (1 - haut.a) * bas.v,
      b: haut.a * haut.b + (1 - haut.a) * bas.b,
      a: 1
    };
  }

  function fondEffectif(element) {
    var couches = [];
    var noeud = element;
    while (noeud && noeud.nodeType === 1) {
      var style = getComputedStyle(noeud);
      var fond = versRGBA(style.backgroundColor);
      if (fond && fond.a > 0) { couches.push(fond); }
      if (/gradient/.test(style.backgroundImage)) {
        var trouve = null;
        FONDS_DEGRADE.forEach(function (entree) {
          if (!trouve && noeud.matches(entree.selecteur)) { trouve = entree.couleur; }
        });
        couches.push({ r: (trouve || [10, 18, 32])[0], v: (trouve || [10, 18, 32])[1],
                       b: (trouve || [10, 18, 32])[2], a: 1 });
        break;
      }
      noeud = noeud.parentElement;
    }
    if (!couches.length) { return { r: 10, v: 18, b: 32, a: 1 }; }
    var resultat = couches[couches.length - 1];
    for (var i = couches.length - 2; i >= 0; i -= 1) {
      resultat = superposer(resultat, couches[i]);
    }
    return resultat;
  }

  function canal(v) {
    var c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(couleur) {
    return 0.2126 * canal(couleur.r) + 0.7152 * canal(couleur.v) + 0.0722 * canal(couleur.b);
  }
  function contraste(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function hexa(couleur) {
    return '#' + [couleur.r, couleur.v, couleur.b].map(function (v) {
      return ('0' + Math.round(v).toString(16)).slice(-2);
    }).join('');
  }

  var mesures = {}; // libellé → mesure (accumulées sur TOUS les états)

  function mesurerEtatCourant() {
    document.querySelectorAll('[data-mesure]').forEach(function (element) {
      if (!element.getClientRects().length) { return; } // invisible : rien à mesurer
      var style = getComputedStyle(element);
      var texte = versRGBA(style.color);
      if (!texte) { return; }
      var fond = fondEffectif(element.parentElement || element);
      if (texte.a < 1) { texte = superposer(fond, texte); }

      var taille = parseFloat(style.fontSize);
      var gras = parseInt(style.fontWeight, 10) >= 700;
      var grand = taille >= 24 || (taille >= 18.66 && gras);
      var exige = grand ? 3 : 4.5;
      var ratio = contraste(texte, fond);

      mesures[element.getAttribute('data-mesure')] = {
        libelle: element.getAttribute('data-mesure'),
        texte: hexa(texte),
        fond: hexa(fond),
        ratio: ratio,
        exige: exige,
        conforme: ratio >= exige,
        luminanceFond: luminance(fond)
      };
    });
  }

  function rendreMesures() {
    var lignes = Object.keys(mesures).map(function (cle) { return mesures[cle]; });
    lignes.sort(function (a, b) { return a.ratio - b.ratio; }); // les pires en tête

    var corps = document.getElementById('mq-lignes');
    corps.innerHTML = '';
    var defauts = 0;
    var fondLePlusClair = 0;

    lignes.forEach(function (mesure) {
      if (!mesure.conforme) { defauts += 1; }
      if (mesure.luminanceFond > fondLePlusClair) { fondLePlusClair = mesure.luminanceFond; }
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + mesure.libelle + '</td>' +
        '<td><span class="mq-echantillon" style="background:' + mesure.texte + '"></span>' + mesure.texte + '</td>' +
        '<td><span class="mq-echantillon" style="background:' + mesure.fond + '"></span>' + mesure.fond + '</td>' +
        '<td>' + mesure.ratio.toFixed(2) + ':1</td>' +
        '<td>' + mesure.exige.toFixed(1) + ':1</td>' +
        '<td class="' + (mesure.conforme ? 'mq-ok' : 'mq-defaut') + '">' +
          (mesure.conforme ? 'conforme' : 'DÉFAUT') + '</td>';
      corps.appendChild(tr);
    });

    var verdict = document.getElementById('mq-verdict');
    verdict.textContent = defauts === 0
      ? lignes.length + ' couples mesurés · 0 défaut'
      : lignes.length + ' couples mesurés · ' + defauts + ' DÉFAUT' + (defauts > 1 ? 'S' : '');
    verdict.className = 'mq-verdict ' + (defauts === 0 ? 'mq-verdict--ok' : 'mq-verdict--defaut');

    document.getElementById('mq-luminance').textContent =
      'Fond le plus clair rencontré : luminance ' + fondLePlusClair.toFixed(4) +
      ' (plancher du cadrage : < 0,20 — ' + (fondLePlusClair < 0.2 ? 'tenu' : 'DÉPASSÉ') + ').' +
      ' Mesures accumulées sur les huit états, pas sur le seul état affiché.';

    // Exposé pour le harnais : une maquette qui se mesure doit pouvoir être
    // interrogée par un test, pas seulement lue par un humain.
    window.MAQUETTE_STELLAIRE = {
      mesures: lignes, defauts: defauts, luminanceMax: fondLePlusClair,
      etoiles: document.querySelectorAll('.ciel-etoile').length
    };
  }

  // ======================================================================
  //  Amorçage : on parcourt les huit états une fois, on mesure chacun, puis
  //  on revient au Ciel. Mesurer le seul état affiché ne prouverait rien —
  //  un écran non éprouvé est un écran cassé (leçon du 2026-08-12).
  // ======================================================================

  function amorcer() {
    document.querySelectorAll('.mq-etats .mq-bouton').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        appliquerEtat(bouton.getAttribute('data-etat'));
        mesurerEtatCourant();
        rendreMesures();
      });
    });

    var corpsMesure = document.getElementById('mq-mesure-corps');
    document.getElementById('mq-replier').addEventListener('click', function () {
      var replie = corpsMesure.hidden;
      corpsMesure.hidden = !replie;
      this.textContent = replie ? 'Replier' : 'Déplier';
    });

    Object.keys(ETATS).forEach(function (nom) {
      appliquerEtat(nom);
      mesurerEtatCourant();
    });

    appliquerEtat('ciel');
    rendreMesures();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', amorcer);
  } else {
    amorcer();
  }
}());
