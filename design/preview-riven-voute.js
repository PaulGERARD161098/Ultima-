// Script de la preview « preview-riven-voute ».
// FICHIER SÉPARÉ, ET C'EST LA RAISON D'ÊTRE DE CE COMMENTAIRE : la CSP
// d'Ultima pose `script-src 'self'` SANS 'unsafe-inline'. Un <script> en
// ligne est donc silencieusement bloqué en preview Vercel — la page s'affiche,
// stylée, et reste vide. Même motif que preview-draukhain-carto.js.

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var LIBELLES_TYPE = {
    artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier'
  };
  var COULEURS_TYPE = {
    artisan: '#f2a15a', partenaire: '#7cb8ea', lead: '#6fd39b', chantier: '#b995e8'
  };
  var LIBELLES_STATUT = {
    actif: 'Actif', prospect: 'Prospect', en_cours: 'En cours',
    termine: 'Terminé', inactif: 'Inactif'
  };
  var LIBELLES_RELATION = {
    apport_affaires: "Apport d'affaires",
    sous_traitance: 'Sous-traitance',
    chantier_commun: 'Chantier commun'
  };
  // ④ Le TYPE est porté par le MOTIF du trait — les liens sont blancs.
  var MOTIFS_RELATION = {
    apport_affaires: null, sous_traitance: '7 5', chantier_commun: '1.5 5'
  };
  var LIBELLES_STATUT_RELATION = {
    idee: 'Idée', contact_etabli: 'Contact établi', en_cours: 'En cours',
    fructueux: 'Fructueux', arrete: 'Arrêté'
  };
  // ④ L'AVANCEMENT est porté par l'ÉCLAT.
  var OPACITE_STATUT = {
    idee: 0.22, contact_etabli: 0.42, en_cours: 0.62, fructueux: 0.92, arrete: 0.14
  };

  // ------------------------------------------------------------------
  // Données inventées, écrites à la main pour ressembler à un vrai carnet.
  // Elles portent les champs de la migration 0024 (nature, prestations,
  // zone, effectif, fiabilité/réactivité/prix, disponibilité).
  // ------------------------------------------------------------------
  var FICHES = [
    { id: 'n1', nom: 'Roux & Fils', type: 'artisan', statut: 'actif', metier: 'Plomberie',
      ville: 'Montreuil', nature: 'Artisan indépendant', prestations: 'Sanitaire, réseaux, dépannage. Bon en rénovation d’immeuble ancien.',
      zone: '93, 75 est', effectif: 6, fiabilite: 5, reactivite: 4, prix: 3, dispo: 'Sous 48 h' },
    { id: 'n2', nom: 'SARL Delmas', type: 'artisan', statut: 'actif', metier: 'Plomberie',
      ville: 'Bagnolet', nature: 'Entreprise', prestations: 'Gros œuvre plomberie, colonnes montantes.',
      zone: '93', effectif: 14, fiabilite: 4, reactivite: 3, prix: 2, dispo: 'Chargé jusqu’en septembre' },
    { id: 'n3', nom: 'Atelier Vanneau', type: 'artisan', statut: 'actif', metier: 'Menuiserie',
      ville: 'Pantin', nature: 'Artisan indépendant', prestations: 'Menuiserie sur mesure, agencement, parquet.',
      zone: '93, 75', effectif: 3, fiabilite: 5, reactivite: 5, prix: 4, dispo: 'Deux semaines d’attente' },
    { id: 'n4', nom: 'Ets Aubry', type: 'artisan', statut: 'actif', metier: 'Électricité',
      ville: 'Romainville', nature: 'Entreprise', prestations: 'Courants forts et faibles, mise aux normes, tableaux.',
      zone: '93, 94', effectif: 11, fiabilite: 4, reactivite: 4, prix: 3, dispo: 'Sous une semaine' },
    { id: 'n5', nom: 'Perrin Électricité', type: 'artisan', statut: 'prospect', metier: 'Électricité',
      ville: 'Les Lilas', nature: 'Artisan indépendant', prestations: 'Rénovation d’appartements, petits chantiers.',
      zone: '93', effectif: 2, fiabilite: 3, reactivite: 5, prix: 4, dispo: 'Disponible' },
    { id: 'n6', nom: 'Maçonnerie Lombard', type: 'artisan', statut: 'actif', metier: 'Maçonnerie',
      ville: 'Noisy-le-Sec', nature: 'Entreprise', prestations: 'Structure, ouvertures, reprise en sous-œuvre.',
      zone: '93, 77 ouest', effectif: 22, fiabilite: 5, reactivite: 3, prix: 2, dispo: 'À partir d’octobre' },
    { id: 'n7', nom: 'Cazaux Frères', type: 'artisan', statut: 'inactif', metier: 'Maçonnerie',
      ville: 'Rosny', nature: 'Entreprise', prestations: 'Maçonnerie générale.',
      zone: '93', effectif: 8, fiabilite: 2, reactivite: 2, prix: 3, dispo: '' },
    { id: 'n8', nom: 'Charpentes Marchal', type: 'artisan', statut: 'actif', metier: 'Charpente',
      ville: 'Villemomble', nature: 'Entreprise', prestations: 'Charpente traditionnelle, ossature bois, surélévation.',
      zone: '93, 77, 95', effectif: 9, fiabilite: 5, reactivite: 4, prix: 3, dispo: 'Sous trois semaines' },
    { id: 'n9', nom: 'Belin Couverture', type: 'artisan', statut: 'actif', metier: 'Couverture',
      ville: 'Bondy', nature: 'Artisan indépendant', prestations: 'Zinc, tuile, étanchéité, gouttières.',
      zone: '93', effectif: 4, fiabilite: 4, reactivite: 5, prix: 3, dispo: 'Sous 48 h' },
    { id: 'n10', nom: 'Maison Thibault', type: 'artisan', statut: 'prospect', metier: 'Couverture',
      ville: 'Le Raincy', nature: 'Artisan indépendant', prestations: 'Couverture ardoise, monuments anciens.',
      zone: '93, 77', effectif: 5, fiabilite: 4, reactivite: 3, prix: 5, dispo: '' },
    { id: 'n11', nom: 'Peinture Estève', type: 'artisan', statut: 'actif', metier: 'Peinture',
      ville: 'Montreuil', nature: 'Artisan indépendant', prestations: 'Peinture décorative, enduits à la chaux, patines.',
      zone: '75, 93', effectif: 3, fiabilite: 5, reactivite: 4, prix: 4, dispo: 'Disponible' },
    { id: 'n12', nom: 'Sorel Rénovation', type: 'artisan', statut: 'actif', metier: 'Peinture',
      ville: 'Vincennes', nature: 'Entreprise', prestations: 'Peinture, revêtements, remise en état locative.',
      zone: '94, 75', effectif: 12, fiabilite: 3, reactivite: 4, prix: 2, dispo: 'Sous une semaine' },
    { id: 'n13', nom: 'Chauffage Nadaud', type: 'artisan', statut: 'actif', metier: 'Chauffage',
      ville: 'Neuilly-Plaisance', nature: 'Entreprise', prestations: 'PAC, chaudières, plancher chauffant. RGE.',
      zone: '93, 77', effectif: 7, fiabilite: 5, reactivite: 4, prix: 3, dispo: 'Sous une semaine' },
    { id: 'n14', nom: 'Cabinet Vergne', type: 'partenaire', statut: 'actif', metier: 'Architecture',
      ville: 'Paris 11e', nature: 'Bureau d’études', prestations: 'Maîtrise d’œuvre, permis, suivi de chantier.',
      zone: 'Île-de-France', effectif: 5, fiabilite: 5, reactivite: 3, prix: 4, dispo: 'Sur rendez-vous' },
    { id: 'n15', nom: 'Brossard Ingénierie', type: 'partenaire', statut: 'actif', metier: 'Architecture',
      ville: 'Paris 12e', nature: 'Bureau d’études', prestations: 'Structure, thermique, diagnostics.',
      zone: 'Île-de-France', effectif: 8, fiabilite: 4, reactivite: 4, prix: 4, dispo: 'Sous deux semaines' },
    { id: 'n16', nom: 'Agence Tissot', type: 'partenaire', statut: 'actif', metier: 'Apport d’affaires',
      ville: 'Montreuil', nature: 'Apporteur d’affaires', prestations: 'Gestion locative, syndic. Envoie des chantiers réguliers.',
      zone: '93', effectif: 18, fiabilite: 4, reactivite: 5, prix: 0, dispo: 'Toujours joignable' },
    { id: 'n17', nom: 'Chapron Immobilier', type: 'partenaire', statut: 'prospect', metier: 'Apport d’affaires',
      ville: 'Vincennes', nature: 'Apporteur d’affaires', prestations: 'Transactions, marchands de biens.',
      zone: '94', effectif: 6, fiabilite: 3, reactivite: 3, prix: 0, dispo: '' },
    { id: 'n18', nom: 'Copropriété Voltaire', type: 'chantier', statut: 'en_cours', metier: 'Réhabilitation',
      ville: 'Paris 11e', nature: 'Institution', prestations: 'Réfection des parties communes, colonnes, toiture.',
      zone: '75', effectif: 0, fiabilite: 0, reactivite: 0, prix: 0, dispo: 'Livraison prévue en mars' },
    { id: 'n19', nom: 'Maison Osmond', type: 'chantier', statut: 'termine', metier: 'Réhabilitation',
      ville: 'Le Perreux', nature: 'Particulier', prestations: 'Surélévation, création d’un étage.',
      zone: '94', effectif: 0, fiabilite: 0, reactivite: 0, prix: 0, dispo: '' },
    { id: 'n20', nom: 'Résidence Faure', type: 'lead', statut: 'prospect', metier: 'Réhabilitation',
      ville: 'Nogent', nature: 'Institution', prestations: 'Ravalement + toiture, à chiffrer.',
      zone: '94', effectif: 0, fiabilite: 0, reactivite: 0, prix: 0, dispo: 'Relance début septembre' }
  ];

  // ② Les personnes vivent à part et se rattachent à 0, 1 ou N fiches,
  //    avec un rôle par rattachement.
  var PERSONNES = [
    { id: 'p1', nom: 'Godefroy Meunier', tel: '06 12 …', rattachements: [
      { fiche: 'n1', role: 'Gérant' }, { fiche: 'n18', role: 'Conducteur de travaux' } ] },
    { id: 'p2', nom: 'Mathilde Vasseur', tel: '06 34 …', rattachements: [
      { fiche: 'n16', role: 'Gestionnaire' } ] },
    { id: 'p3', nom: 'Armand Roux', tel: '06 55 …', rattachements: [
      { fiche: 'n1', role: 'Chef d’équipe' } ] },
    { id: 'p4', nom: 'Solène Vergne', tel: '06 78 …', rattachements: [
      { fiche: 'n14', role: 'Architecte' }, { fiche: 'n18', role: 'Maître d’œuvre' } ] },
    { id: 'p5', nom: 'Bastien Lombard', tel: '06 90 …', rattachements: [
      { fiche: 'n6', role: 'Gérant' } ] },
    { id: 'p6', nom: 'Irène Estève', tel: '06 21 …', rattachements: [
      { fiche: 'n11', role: 'Gérante' } ] },
    { id: 'p7', nom: 'Côme Nadaud', tel: '06 43 …', rattachements: [
      { fiche: 'n13', role: 'Gérant' } ] },
    { id: 'p8', nom: 'Léonie Brossard', tel: '06 65 …', rattachements: [
      { fiche: 'n15', role: 'Ingénieure structure' } ] },
    // Une personne SANS aucun rattachement : c'est licite, et c'était la
    // demande n°2 de Paul. Elle n'apparaît pas au ciel — elle vit au registre.
    { id: 'p9', nom: 'Hugues Nadal', tel: '06 87 …', rattachements: [] }
  ];

  var RELATIONS = [
    { id: 'r1', source: 'n16', cible: 'n1', type: 'apport_affaires', statut: 'fructueux' },
    { id: 'r2', source: 'n16', cible: 'n4', type: 'apport_affaires', statut: 'en_cours' },
    { id: 'r3', source: 'n1', cible: 'n13', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r4', source: 'n6', cible: 'n8', type: 'chantier_commun', statut: 'en_cours' },
    { id: 'r5', source: 'n14', cible: 'n18', type: 'chantier_commun', statut: 'en_cours' },
    { id: 'r6', source: 'n14', cible: 'n6', type: 'apport_affaires', statut: 'contact_etabli' },
    { id: 'r7', source: 'n9', cible: 'n8', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r8', source: 'n11', cible: 'n12', type: 'sous_traitance', statut: 'idee' },
    { id: 'r9', source: 'n17', cible: 'n12', type: 'apport_affaires', statut: 'idee' },
    { id: 'r10', source: 'n15', cible: 'n13', type: 'chantier_commun', statut: 'contact_etabli' },
    { id: 'r11', source: 'n4', cible: 'n18', type: 'sous_traitance', statut: 'en_cours' },
    { id: 'r12', source: 'n3', cible: 'n19', type: 'sous_traitance', statut: 'fructueux' },
    { id: 'r13', source: 'n16', cible: 'n20', type: 'apport_affaires', statut: 'contact_etabli' }
  ];

  // ------------------------------------------------------------------
  // Géométrie — identique à la maquette d'arbitrage, valeurs CALIBRÉES par
  // la mesure : écart minimal 34 u, cible tactile 27,2 px à 390 / 768 /
  // 1280 px de large (plancher WCAG : 24 px).
  // ------------------------------------------------------------------
  var R_ETOILE_MIN = 3.2;
  var ESPACE_MIN = 34;
  var RAYON_CAPTATION = ESPACE_MIN * 0.4;
  var MARGE_X = 24, HAUT = 46, H_NOM = 46, MARGE_BAS = 38, ESP_V = 26;
  // Ce qui dépasse d'une étoile de bord : l'orbite d'une personne (jusqu'à
  // 24 u), sa pastille et son halo (~8), soit ~34 u au-delà du centre. Sans
  // cette réserve sur les quatre côtés, les orbites sortaient du viewBox —
  // constat du harnais, sur l'écran réel où les personnes sont affichées.
  var MARGE_HALO = 34;
  var MAX_NOMS_PERMANENTS = 6;   // ③ les noms, à la demande

  function normaliser(t) {
    return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function svg(nom, attrs) {
    var el = document.createElementNS(SVG_NS, nom);
    if (attrs) { Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); }); }
    return el;
  }
  function texte(attrs, contenu) {
    var t = svg('text', attrs); t.textContent = contenu; return t;
  }

  function grouper(fiches) {
    var index = Object.create(null), ordre = [];
    fiches.forEach(function (f) {
      var brut = (f.metier || '').trim();
      var cle = brut ? normaliser(brut) : ' a-classer';
      if (!index[cle]) {
        index[cle] = { cle: cle, nom: brut || 'À classer', fiches: [] };
        ordre.push(cle);
      }
      index[cle].fiches.push(f);
    });
    var groupes = ordre.map(function (c) { return index[c]; });
    groupes.sort(function (a, b) {
      if (a.cle === ' a-classer') { return 1; }
      if (b.cle === ' a-classer') { return -1; }
      if (b.fiches.length !== a.fiches.length) { return b.fiches.length - a.fiches.length; }
      return a.nom.localeCompare(b.nom, 'fr');
    });
    groupes.forEach(function (g) {
      g.fiches.sort(function (x, y) { return (x.nom || '').localeCompare(y.nom || '', 'fr'); });
    });
    return groupes;
  }

  function rayonAmas(n) {
    if (n <= 1) { return 0; }
    return Math.max(30, Math.sqrt(n) * ESPACE_MIN * 0.62);
  }
  function positionsAmas(n, R) {
    var pts = [], ANGLE_OR = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var rr = R * Math.sqrt((i + 0.5) / n), th = i * ANGLE_OR;
      pts.push({ x: Math.cos(th) * rr, y: Math.sin(th) * rr * 0.82 });
    }
    return pts;
  }
  function colonnes(vbW) {
    if (vbW >= 1040) { return 3; }
    if (vbW >= 760) { return 2; }
    return 1;
  }

  // ① VOÛTE : mosaïque de constellations, hauteur de chaque bloc calculée
  //    AVANT la pose — zéro chevauchement par construction.
  function layoutVoute(groupes, largeurCible) {
    var vbW = Math.max(320, Math.min(1240, largeurCible || 900));
    var cols = colonnes(vbW);
    var cellW = (vbW - 2 * MARGE_X) / cols;
    var blocs = groupes.map(function (g) {
      var rx = Math.min(rayonAmas(g.fiches.length), cellW / 2 - MARGE_HALO);
      var ry = rx * 0.82;
      return {
        groupe: g, rx: rx, ry: ry,
        hauteur: H_NOM + MARGE_HALO + 2 * ry + MARGE_BAS
      };
    });
    var y = HAUT, amas = [];
    for (var i = 0; i < blocs.length; i += cols) {
      var rangee = blocs.slice(i, i + cols);
      var hRangee = rangee.reduce(function (m, b) { return Math.max(m, b.hauteur); }, 0);
      rangee.forEach(function (b, k) {
        var cx = MARGE_X + k * cellW + cellW / 2;
        var cy = y + H_NOM + MARGE_HALO + b.ry;
        var pts = positionsAmas(b.groupe.fiches.length, b.rx).map(function (p, j) {
          return { fiche: b.groupe.fiches[j], x: cx + p.x, y: cy + p.y };
        });
        amas.push({ groupe: b.groupe, nomY: y + 16, cx: cx, cy: cy, rx: b.rx, ry: b.ry, etoiles: pts });
      });
      y += hRangee + ESP_V;
    }
    return { vbW: vbW, vbH: Math.max(300, y + 6), amas: amas };
  }

  // Figure de constellation : arbre couvrant minimal — chaque étoile reliée à
  // sa plus proche voisine déjà reliée, comme sur une planche d'atlas.
  function figure(etoiles) {
    if (etoiles.length < 2) { return []; }
    var dedans = [0], dehors = [], segments = [], i;
    for (i = 1; i < etoiles.length; i++) { dehors.push(i); }
    while (dehors.length) {
      var meilleur = null;
      dedans.forEach(function (a) {
        dehors.forEach(function (b, kb) {
          var dx = etoiles[a].x - etoiles[b].x, dy = etoiles[a].y - etoiles[b].y;
          var d = dx * dx + dy * dy;
          if (!meilleur || d < meilleur.d) { meilleur = { a: a, b: b, kb: kb, d: d }; }
        });
      });
      segments.push([meilleur.a, meilleur.b]);
      dedans.push(meilleur.b);
      dehors.splice(meilleur.kb, 1);
    }
    return segments;
  }

  function etoileDe(g, cx, cy, rayon, couleur) {
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon * 3.4, fill: couleur, opacity: '0.13' }));
    var p = rayon * 3.1;
    g.appendChild(svg('path', {
      d: 'M' + cx + ',' + (cy - p) + ' L' + (cx + rayon * 0.5) + ',' + (cy - rayon * 0.5) +
         ' L' + (cx + p) + ',' + cy + ' L' + (cx + rayon * 0.5) + ',' + (cy + rayon * 0.5) +
         ' L' + cx + ',' + (cy + p) + ' L' + (cx - rayon * 0.5) + ',' + (cy + rayon * 0.5) +
         ' L' + (cx - p) + ',' + cy + ' L' + (cx - rayon * 0.5) + ',' + (cy - rayon * 0.5) + ' Z',
      fill: couleur, opacity: '0.55'
    }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon * 1.7, fill: couleur, opacity: '0.75' }));
    g.appendChild(svg('circle', { cx: cx, cy: cy, r: rayon, fill: '#fffaf0' }));
  }

  // ------------------------------------------------------------------
  // État de l'écran
  // ------------------------------------------------------------------
  var etat = {
    recherche: '',
    types: { artisan: true, partenaire: true, lead: true, chantier: true },
    choisie: null   // id de la fiche ouverte au panneau
  };

  function personnesDe(idFiche) {
    var res = [];
    PERSONNES.forEach(function (p) {
      p.rattachements.forEach(function (r) {
        if (r.fiche === idFiche) { res.push({ personne: p, role: r.role }); }
      });
    });
    return res;
  }
  function relationsDe(idFiche) {
    return RELATIONS.filter(function (r) { return r.source === idFiche || r.cible === idFiche; });
  }
  function fiche(id) {
    return FICHES.filter(function (f) { return f.id === id; })[0] || null;
  }

  // Magnitude : le poids dans le réseau (relations + personnes rattachées).
  // C'est ce que ni l'arbre ni la carte ne montraient : qui est central.
  function magnitudes() {
    var m = Object.create(null);
    FICHES.forEach(function (f) { m[f.id] = 0; });
    RELATIONS.forEach(function (r) {
      if (m[r.source] !== undefined) { m[r.source] += 1; }
      if (m[r.cible] !== undefined) { m[r.cible] += 1; }
    });
    PERSONNES.forEach(function (p) {
      p.rattachements.forEach(function (r) { if (m[r.fiche] !== undefined) { m[r.fiche] += 1; } });
    });
    return m;
  }

  // Une fiche « correspond » si elle passe les filtres de type ET la recherche.
  // La recherche couvre les champs de détail : c'est ce qui rend les onze
  // champs de 0024 utiles au quotidien.
  function correspond(f) {
    if (!etat.types[f.type]) { return false; }
    var q = normaliser(etat.recherche).trim();
    if (!q) { return true; }
    var foin = normaliser([
      f.nom, f.metier, f.ville, f.nature, f.prestations, f.zone, f.dispo,
      LIBELLES_TYPE[f.type], LIBELLES_STATUT[f.statut]
    ].join(' '));
    return q.split(/\s+/).every(function (mot) { return foin.indexOf(mot) !== -1; });
  }

  // ------------------------------------------------------------------
  // Rendu du ciel
  // ------------------------------------------------------------------
  function rendreCiel() {
    var hote = document.getElementById('scene');
    var groupes = grouper(FICHES);
    var layout = layoutVoute(groupes, hote.clientWidth);
    var mags = magnitudes();
    var magMax = 1;
    Object.keys(mags).forEach(function (k) { if (mags[k] > magMax) { magMax = mags[k]; } });

    hote.textContent = '';
    var racine = svg('svg', {
      'class': 'ciel', viewBox: '0 0 ' + layout.vbW + ' ' + layout.vbH,
      preserveAspectRatio: 'xMidYMin meet', role: 'group',
      'aria-label': 'Voûte du réseau : ' + FICHES.length + ' fiches en ' + groupes.length + ' constellations'
    });

    // Poussière d'étoiles : décorative, déterministe, muette.
    var fond = svg('g', { 'aria-hidden': 'true' });
    var s = 7;
    function alea() { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }
    for (var i = 0; i < Math.round(layout.vbW * layout.vbH / 2600); i++) {
      // Le rayon d'abord, le centre ensuite : un grain tiré à l'abscisse 0
      // dépasserait du cadre de son propre rayon. Un dépassement d'une unité
      // reste un dépassement — le harnais le voit, on ne le tolère pas.
      var r = 0.4 + alea() * 0.9;
      fond.appendChild(svg('circle', {
        cx: (r + alea() * (layout.vbW - 2 * r)).toFixed(1),
        cy: (r + alea() * (layout.vbH - 2 * r)).toFixed(1),
        r: r.toFixed(2), fill: '#dce8f7',
        opacity: (0.12 + alea() * 0.3).toFixed(2)
      }));
    }
    racine.appendChild(fond);

    var nebuleuses = svg('g', { 'aria-hidden': 'true' });
    layout.amas.forEach(function (a) {
      nebuleuses.appendChild(svg('ellipse', {
        cx: a.cx, cy: a.cy, rx: a.rx + 34, ry: a.ry + 30, fill: '#2a4a72', opacity: '0.16'
      }));
    });
    racine.appendChild(nebuleuses);

    var pos = Object.create(null);
    layout.amas.forEach(function (a) {
      a.etoiles.forEach(function (e) { pos[e.fiche.id] = e; });
    });

    // Tracés de figure : très fins, pointillés. Ils dessinent, ils ne disent rien.
    var gFig = svg('g', {
      'aria-hidden': 'true', fill: 'none', stroke: '#9fc4e8',
      'stroke-width': '0.7', 'stroke-dasharray': '3 4', opacity: '0.3'
    });
    layout.amas.forEach(function (a) {
      figure(a.etoiles).forEach(function (seg) {
        var p = a.etoiles[seg[0]], q = a.etoiles[seg[1]];
        gFig.appendChild(svg('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y }));
      });
    });
    racine.appendChild(gFig);

    // ④ Les liens : BLANCS et fins. Motif = type, éclat = avancement.
    var gLiens = svg('g', {
      'class': 'liens', 'aria-hidden': 'true', fill: 'none', stroke: '#ffffff',
      'stroke-width': '0.9', 'stroke-linecap': 'round'
    });
    RELATIONS.forEach(function (r) {
      var a = pos[r.source], b = pos[r.cible];
      if (!a || !b) { return; }
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var dx = b.x - a.x, dy = b.y - a.y;
      var lg = Math.sqrt(dx * dx + dy * dy) || 1;
      var c = Math.min(28, lg * 0.12);
      var trait = svg('path', {
        d: 'M' + a.x + ',' + a.y + ' Q' + (mx - dy / lg * c) + ',' + (my + dx / lg * c) +
           ' ' + b.x + ',' + b.y,
        opacity: String(OPACITE_STATUT[r.statut] || 0.5)
      });
      if (MOTIFS_RELATION[r.type]) { trait.setAttribute('stroke-dasharray', MOTIFS_RELATION[r.type]); }
      trait.setAttribute('data-a', r.source);
      trait.setAttribute('data-b', r.cible);
      gLiens.appendChild(trait);
    });
    racine.appendChild(gLiens);

    // ② Les personnes, en orbite de CHAQUE fiche où elles travaillent.
    var gOrb = svg('g', {});
    PERSONNES.forEach(function (p, ip) {
      p.rattachements.forEach(function (r, k) {
        var anc = pos[r.fiche];
        if (!anc) { return; }
        var rayonOrbite = 16 + (ip % 3) * 4;
        var angle = ip * 2.399963 + k * 1.9;
        var ox = anc.x + Math.cos(angle) * rayonOrbite;
        var oy = anc.y + Math.sin(angle) * rayonOrbite * 0.8;
        gOrb.appendChild(svg('line', {
          x1: anc.x, y1: anc.y, x2: ox, y2: oy,
          stroke: '#f2ead6', 'stroke-width': '0.5', opacity: '0.34'
        }));
        var g = svg('g', {
          'class': 'etoile', tabindex: '0', role: 'button',
          'aria-label': p.nom + ', ' + r.role + ' — ' +
            (fiche(r.fiche) ? fiche(r.fiche).nom : '') +
            (p.rattachements.length > 1 ? ', rattachée à ' + p.rattachements.length + ' fiches' : '')
        });
        var t = svg('title');
        t.textContent = p.nom + ' — ' + r.role;
        g.appendChild(t);
        g.appendChild(svg('circle', {
          'class': 'halo-focus', cx: ox, cy: oy, r: 8, fill: 'none',
          stroke: '#f2ead6', 'stroke-width': '1'
        }));
        g.appendChild(svg('circle', { cx: ox, cy: oy, r: 2.2, fill: '#f2ead6', opacity: '0.92' }));
        g.appendChild(svg('circle', {
          'class': 'zone-clic', cx: ox, cy: oy, r: 9, fill: '#000000', 'fill-opacity': '0'
        }));
        gOrb.appendChild(g);
      });
    });
    racine.appendChild(gOrb);

    // Les étoiles : une fiche = une étoile.
    var gEtoiles = svg('g', { 'font-family': 'Georgia, "Times New Roman", serif' });
    var lourdes = Object.create(null);
    FICHES.slice().sort(function (a, b) {
      var d = (mags[b.id] || 0) - (mags[a.id] || 0);
      return d !== 0 ? d : (a.nom || '').localeCompare(b.nom || '', 'fr');
    }).slice(0, MAX_NOMS_PERMANENTS).forEach(function (f) { lourdes[f.id] = true; });

    layout.amas.forEach(function (a) {
      a.etoiles.forEach(function (e) {
        var f = e.fiche;
        var mag = mags[f.id] || 0;
        var rayon = R_ETOILE_MIN + Math.min(3.4, (mag / magMax) * 3.4);
        var couleur = COULEURS_TYPE[f.type] || '#dddddd';
        var eteinte = !correspond(f);
        var g = svg('g', {
          'class': 'etoile scintille' + (eteinte ? ' etoile--eteinte' : '') +
            (etat.choisie === f.id ? ' etoile--choisie' : ''),
          tabindex: '0', role: 'button', 'data-fiche-id': f.id,
          'aria-label': f.nom + ', ' + LIBELLES_TYPE[f.type] + ', ' + f.metier + ', ' +
            LIBELLES_STATUT[f.statut] + ', ' + mag + ' lien' + (mag > 1 ? 's' : '')
        });
        var t = svg('title');
        t.textContent = f.nom + ' — ' + LIBELLES_TYPE[f.type];
        g.appendChild(t);
        g.appendChild(svg('circle', {
          'class': 'halo-choix', cx: e.x, cy: e.y, r: rayon * 5.2,
          fill: 'none', stroke: '#d8bd82', 'stroke-width': '1.2'
        }));
        g.appendChild(svg('circle', {
          'class': 'halo-focus', cx: e.x, cy: e.y, r: rayon * 4.6,
          fill: 'none', stroke: '#fffaf0', 'stroke-width': '1'
        }));
        etoileDe(g, e.x, e.y, rayon, couleur);
        // ③ Six noms permanents ; les autres posés mais transparents — ils
        //    existent pour le lecteur d'écran, se révèlent au survol et au focus.
        var permanent = !!lourdes[f.id];
        g.appendChild(texte({
          'class': 'etoile-nom' + (permanent ? '' : ' etoile-nom--demande'),
          x: e.x, y: e.y + rayon * 3.4 + 10, 'text-anchor': 'middle',
          'font-size': '9.5', fill: '#e8dfc8', opacity: permanent ? '0.85' : '0'
        }, f.nom.length > 18 ? f.nom.slice(0, 17) + '…' : f.nom));
        g.appendChild(svg('circle', {
          'class': 'zone-clic', cx: e.x, cy: e.y, r: RAYON_CAPTATION,
          fill: '#000000', 'fill-opacity': '0'
        }));
        gEtoiles.appendChild(g);
      });
    });
    racine.appendChild(gEtoiles);

    var gNoms = svg('g', {
      'font-family': 'Georgia, "Times New Roman", serif',
      'text-anchor': 'middle', fill: '#d8bd82'
    });
    layout.amas.forEach(function (a) {
      gNoms.appendChild(texte({
        x: a.cx, y: a.nomY, 'font-size': '11.5', 'letter-spacing': '3.2', opacity: '0.92'
      }, a.groupe.nom.toUpperCase()));
      gNoms.appendChild(texte({
        x: a.cx, y: a.nomY + 14, 'font-size': '9.5', 'letter-spacing': '1.2',
        opacity: '0.7', 'font-style': 'italic'
      }, a.groupe.fiches.length + (a.groupe.fiches.length > 1 ? ' fiches' : ' fiche')));
    });
    racine.appendChild(gNoms);

    brancherCiel(racine);
    hote.appendChild(racine);
  }

  // Concentration + ouverture de fiche : un seul jeu d'écouteurs délégués.
  function brancherCiel(racine) {
    var vifs = [];
    function eteindre() {
      vifs.forEach(function (t) { t.classList.remove('lien--vif'); });
      vifs = [];
      racine.classList.remove('ciel--concentre');
    }
    function allumer(cible) {
      var etoile = cible && cible.closest ? cible.closest('[data-fiche-id]') : null;
      if (!etoile) { eteindre(); return; }
      eteindre();
      var id = etoile.getAttribute('data-fiche-id');
      var liens = racine.querySelectorAll(
        '.liens path[data-a="' + id + '"], .liens path[data-b="' + id + '"]');
      Array.prototype.forEach.call(liens, function (t) {
        t.classList.add('lien--vif'); vifs.push(t);
      });
      racine.classList.add('ciel--concentre');
    }
    racine.addEventListener('mouseover', function (e) { allumer(e.target); });
    racine.addEventListener('mouseleave', eteindre);
    racine.addEventListener('focusin', function (e) { allumer(e.target); });
    racine.addEventListener('focusout', eteindre);
    racine.addEventListener('click', function (e) {
      var g = e.target.closest ? e.target.closest('[data-fiche-id]') : null;
      if (g) { ouvrirFiche(g.getAttribute('data-fiche-id')); }
    });
    racine.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') { return; }
      var g = e.target.closest ? e.target.closest('[data-fiche-id]') : null;
      if (g) { e.preventDefault(); ouvrirFiche(g.getAttribute('data-fiche-id')); }
    });
  }

  // ------------------------------------------------------------------
  // Le panneau de fiche — le vrai sujet de la boucle suivante :
  // « renseigner les contacts et les mettre en relation ».
  // ------------------------------------------------------------------
  function jauge(valeur) {
    var d = document.createElement('span');
    d.className = 'jauge';
    for (var i = 1; i <= 5; i++) {
      var pt = document.createElement('i');
      if (i <= valeur) { pt.className = 'plein'; }
      d.appendChild(pt);
    }
    return d;
  }
  function ligneChamp(dl, libelle, valeur) {
    if (!valeur && valeur !== 0) { return; }
    var d = document.createElement('div');
    d.className = 'champ';
    var dt = document.createElement('dt'); dt.textContent = libelle;
    var dd = document.createElement('dd');
    if (valeur instanceof Node) { dd.appendChild(valeur); } else { dd.textContent = valeur; }
    d.appendChild(dt); d.appendChild(dd);
    dl.appendChild(d);
  }
  function section(hote, titre) {
    var s = document.createElement('section');
    s.className = 'section';
    var h = document.createElement('h3'); h.textContent = titre;
    s.appendChild(h);
    hote.appendChild(s);
    return s;
  }

  function ouvrirFiche(id) {
    var f = fiche(id);
    if (!f) { return; }
    etat.choisie = id;
    var panneau = document.getElementById('panneau');
    panneau.hidden = false;
    document.getElementById('corps').classList.add('corps--panneau-ouvert');
    panneau.textContent = '';

    var tete = document.createElement('div');
    tete.className = 'panneau-tete';
    var h2 = document.createElement('h2');
    h2.textContent = f.nom;
    h2.tabIndex = -1;
    var fermer = document.createElement('button');
    fermer.type = 'button'; fermer.className = 'fermer';
    fermer.setAttribute('aria-label', 'Fermer la fiche');
    fermer.textContent = '×';
    fermer.addEventListener('click', fermerFiche);
    tete.appendChild(h2); tete.appendChild(fermer);
    panneau.appendChild(tete);

    var badges = document.createElement('div');
    badges.className = 'badges';
    var bType = document.createElement('span');
    bType.className = 'badge badge--type';
    bType.style.color = COULEURS_TYPE[f.type];
    bType.textContent = LIBELLES_TYPE[f.type];
    badges.appendChild(bType);
    var bStatut = document.createElement('span');
    bStatut.className = 'badge';
    bStatut.textContent = LIBELLES_STATUT[f.statut];
    badges.appendChild(bStatut);
    var bMetier = document.createElement('span');
    bMetier.className = 'badge';
    bMetier.textContent = f.metier;
    badges.appendChild(bMetier);
    panneau.appendChild(badges);

    var sId = section(panneau, 'Ce qu’ils font');
    var dl1 = document.createElement('dl');
    dl1.style.margin = '0';
    ligneChamp(dl1, 'Nature', f.nature);
    ligneChamp(dl1, 'Prestations', f.prestations);
    ligneChamp(dl1, 'Zone', f.zone);
    ligneChamp(dl1, 'Ville', f.ville);
    if (f.effectif) { ligneChamp(dl1, 'Effectif', f.effectif + ' personnes'); }
    sId.appendChild(dl1);

    if (f.fiabilite || f.reactivite || f.prix || f.dispo) {
      var sQ = section(panneau, 'Ce qu’ils valent');
      var dl2 = document.createElement('dl');
      dl2.style.margin = '0';
      if (f.fiabilite) { ligneChamp(dl2, 'Fiabilité', jauge(f.fiabilite)); }
      if (f.reactivite) { ligneChamp(dl2, 'Réactivité', jauge(f.reactivite)); }
      if (f.prix) { ligneChamp(dl2, 'Niveau de prix', jauge(f.prix)); }
      ligneChamp(dl2, 'Disponibilité', f.dispo);
      sQ.appendChild(dl2);
    }

    // Les personnes rattachées — la notion neuve du 10/08, rendue visible.
    var sP = section(panneau, 'Qui y travaille');
    var gens = personnesDe(f.id);
    if (!gens.length) {
      var vP = document.createElement('p');
      vP.className = 'vide';
      vP.textContent = 'Personne n’est encore rattaché à cette fiche.';
      sP.appendChild(vP);
    } else {
      var ulP = document.createElement('ul');
      ulP.className = 'liste';
      gens.forEach(function (item) {
        var li = document.createElement('li');
        var nom = document.createElement('span');
        nom.textContent = item.personne.nom;
        var role = document.createElement('span');
        role.className = 'role';
        var autres = item.personne.rattachements.length - 1;
        role.textContent = item.role + (autres > 0 ? ' — et ' + autres + ' autre' + (autres > 1 ? 's' : '') + ' fiche' + (autres > 1 ? 's' : '') : '');
        li.appendChild(nom); li.appendChild(role);
        ulP.appendChild(li);
      });
      sP.appendChild(ulP);
    }
    var actP = document.createElement('div');
    actP.className = 'actions';
    var bRatt = document.createElement('button');
    bRatt.type = 'button'; bRatt.className = 'bouton';
    bRatt.textContent = 'Rattacher une personne';
    bRatt.addEventListener('click', function () { signaler('Rattacher une personne'); });
    actP.appendChild(bRatt);
    sP.appendChild(actP);

    // Les relations — « la mise en relation ensemble » de la dictée.
    var sR = section(panneau, 'Avec qui ils travaillent');
    var rels = relationsDe(f.id);
    if (!rels.length) {
      var vR = document.createElement('p');
      vR.className = 'vide';
      vR.textContent = 'Aucun rapprochement pour l’instant.';
      sR.appendChild(vR);
    } else {
      var ulR = document.createElement('ul');
      ulR.className = 'liste';
      rels.forEach(function (r) {
        var autreId = r.source === f.id ? r.cible : r.source;
        var autre = fiche(autreId);
        var li = document.createElement('li');
        var nom = document.createElement('span');
        nom.textContent = autre ? autre.nom : '(inconnu)';
        var etatRel = document.createElement('span');
        etatRel.className = 'etat';
        etatRel.textContent = LIBELLES_RELATION[r.type] + ' · ' + LIBELLES_STATUT_RELATION[r.statut];
        var voir = document.createElement('button');
        voir.type = 'button';
        voir.textContent = 'voir';
        voir.addEventListener('click', function () { ouvrirFiche(autreId); });
        li.appendChild(nom); li.appendChild(etatRel); li.appendChild(voir);
        ulR.appendChild(li);
      });
      sR.appendChild(ulR);
    }
    var actR = document.createElement('div');
    actR.className = 'actions';
    var bRel = document.createElement('button');
    bRel.type = 'button'; bRel.className = 'bouton';
    bRel.textContent = 'Créer une relation';
    bRel.addEventListener('click', function () { signaler('Créer une relation'); });
    var bMod = document.createElement('button');
    bMod.type = 'button'; bMod.className = 'bouton';
    bMod.textContent = 'Modifier la fiche';
    bMod.addEventListener('click', function () { signaler('Modifier la fiche'); });
    actR.appendChild(bRel); actR.appendChild(bMod);
    sR.appendChild(actR);

    var note = document.createElement('p');
    note.className = 'note-maquette';
    note.textContent = 'Maquette : les trois boutons ci-dessus ne font rien encore. ' +
      'Ce sont eux, et les formulaires derrière, qui font la boucle suivante — ' +
      'renseigner les contacts et les mettre en relation.';
    panneau.appendChild(note);

    rendreCiel();
    h2.focus();
  }

  function signaler(quoi) {
    window.alert('Maquette — « ' + quoi + ' » sera le sujet de la boucle suivante.');
  }

  function fermerFiche() {
    etat.choisie = null;
    var panneau = document.getElementById('panneau');
    panneau.hidden = true;
    panneau.textContent = '';
    document.getElementById('corps').classList.remove('corps--panneau-ouvert');
    rendreCiel();
  }

  // ------------------------------------------------------------------
  // Barre d'outils
  // ------------------------------------------------------------------
  function construireFiltres() {
    var hote = document.getElementById('filtres');
    hote.textContent = '';
    Object.keys(LIBELLES_TYPE).forEach(function (t) {
      var l = document.createElement('label');
      l.className = 'filtre';
      var c = document.createElement('input');
      c.type = 'checkbox'; c.checked = etat.types[t];
      c.addEventListener('change', function () {
        etat.types[t] = c.checked;
        rendreCiel(); majCompte();
      });
      var pastille = document.createElement('span');
      pastille.className = 'pastille';
      pastille.style.background = COULEURS_TYPE[t];
      var txt = document.createElement('span');
      txt.textContent = LIBELLES_TYPE[t];
      l.appendChild(c); l.appendChild(pastille); l.appendChild(txt);
      hote.appendChild(l);
    });
  }

  function majCompte() {
    var visibles = FICHES.filter(correspond).length;
    var libres = PERSONNES.filter(function (p) { return p.rattachements.length === 0; }).length;
    var el = document.getElementById('compte');
    el.textContent = '';
    var b = document.createElement('b');
    b.textContent = visibles + ' / ' + FICHES.length;
    el.appendChild(b);
    var suite = document.createTextNode(
      ' fiches · ' + PERSONNES.length + ' personnes' +
      (libres ? ' (dont ' + libres + ' sans fiche)' : '') +
      ' · ' + RELATIONS.length + ' relations');
    el.appendChild(suite);
  }

  document.getElementById('recherche').addEventListener('input', function (e) {
    etat.recherche = e.target.value;
    rendreCiel(); majCompte();
  });
  ['bouton-arbre', 'bouton-carte', 'bouton-ajouter'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () {
      signaler(document.getElementById(id).textContent);
    });
  });

  var minuteur = null;
  window.addEventListener('resize', function () {
    if (minuteur) { window.clearTimeout(minuteur); }
    minuteur = window.setTimeout(rendreCiel, 140);
  });

  construireFiltres();
  majCompte();
  rendreCiel();
})();
