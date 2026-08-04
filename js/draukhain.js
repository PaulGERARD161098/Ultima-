// Ultima — quadrant DRAUKHAIN (v1) : la carte des serments, la volonté au-delà
// du possible — la foi inébranlable de Paul, entretenue flamme après flamme.
// Miroir EXACT de js/zekrom.js pour la partie idéaux→serments (règle cardinale :
// un serment SANS flamme est « à raviver » = INVITATION POSITIVE à nourrir la foi,
// JAMAIS un défaut ni un reproche ; DRAUKHAIN rappelle, ne juge pas — l'exact
// pendant du « à orienter » de ZEKROM, côté volonté).
// Le registre DERRIÈRE AUTH, données réelles uniquement (fail-closed partout) :
//   GET /api/serments (serments + flammes), POST /api/serments, POST /api/flammes,
//   DELETE /api/flammes. AUCUNE donnée en dur, aucun mode démo (§5 : intime).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var LIBELLE_NATURE = {
    citation: 'citation',
    victoire: 'victoire',
    rappel: 'rappel'
  };

  var etat = {
    session: null,
    serments: [],
    flammes: [],
    liens: [],          // passerelles v2 SORTANTES : serment → idéal ZEKROM | page MINETHNIR
    futurs: [],         // passerelles ENTRANTES : un futur VRANESH qui menace/sert ce serment
    ideauxListe: [],     // idéaux disponibles (picker « Idéal »)
    pagesListe: [],      // pages MINETHNIR disponibles (picker « Page »)
    ideaux: {},          // id idéal → intitulé (résolution du libellé)
    pages: {},           // id page → titre|date lisible (résolution du libellé)
    vue: 'tous'
  };

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte !== undefined && texte !== null) { element.textContent = texte; }
    return element;
  }

  // Date lisible et pure (repli quand une page MINETHNIR n'a pas de titre).
  function dateLisible(iso) {
    if (typeof iso !== 'string' || !iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    return d.toLocaleDateString('fr-FR');
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['draukhain-chargement', 'draukhain-auth', 'draukhain-erreur', 'draukhain-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- Filtre pur (testable) : serments visibles selon la vue ----------
  //   'vivants' → uniquement les serments entretenus (a_raviver === false,
  //               soit au moins une flamme) ;
  //   'tous'    → toute la carte.
  function sermentsVisibles(serments, vue) {
    var liste = Array.isArray(serments) ? serments : [];
    if (vue === 'vivants') {
      return liste.filter(function (s) { return s && s.a_raviver === false; });
    }
    return liste;
  }

  // Les flammes d'un serment (rattachées par serment_id).
  function flammesDe(sermentId) {
    return etat.flammes.filter(function (f) { return f && f.serment_id === sermentId; });
  }

  // Les passerelles d'un serment (rattachées par serment_id).
  function liensDe(sermentId) {
    return etat.liens.filter(function (l) { return l && l.serment_id === sermentId; });
  }

  // Les futurs VRANESH qui touchent ce serment (passerelles ENTRANTES).
  // Un futur ADVENU passe devant : ce n'est plus une hypothèse, c'est arrivé.
  function futursDe(sermentId) {
    return etat.futurs
      .filter(function (f) { return f && f.serment_id === sermentId; })
      .slice()
      .sort(function (a, b) { return (b.advenu === true) - (a.advenu === true); });
  }

  // Libellé d'un idéal MINETHNIR/ZEKROM depuis les tables de correspondance.
  // Dégradation propre : si la cible n'a pas pu être résolue (idéaux/pages non
  // chargés, table absente…), on affiche un libellé neutre — jamais d'erreur.
  function libelleLien(lien) {
    if (!lien) { return ''; }
    if (lien.ideal_id) {
      var intitule = etat.ideaux[lien.ideal_id];
      return intitule ? ('Idéal : ' + intitule) : 'idéal lié';
    }
    if (lien.entree_id) {
      var titre = etat.pages[lien.entree_id];
      return titre ? ('Page : ' + titre) : 'page liée';
    }
    return '';
  }

  // Libellé d'une page MINETHNIR : son titre, sinon sa date lisible.
  function libellePage(entree) {
    var titre = (entree && entree.titre) ? String(entree.titre).trim() : '';
    if (titre) { return titre; }
    return dateLisible(entree && entree.created_at);
  }

  // Construit les listes de cibles + les tables id→libellé (résolution + pickers).
  function indexerCibles(ideaux, entrees) {
    etat.ideauxListe = (Array.isArray(ideaux) ? ideaux : []).map(function (i) {
      return { id: i.id, intitule: (i.intitule || '').trim() };
    });
    etat.pagesListe = (Array.isArray(entrees) ? entrees : []).map(function (e) {
      return { id: e.id, label: libellePage(e) };
    });
    etat.ideaux = {};
    etat.ideauxListe.forEach(function (i) { etat.ideaux[i.id] = i.intitule; });
    etat.pages = {};
    etat.pagesListe.forEach(function (p) { etat.pages[p.id] = p.label; });
  }

  // Libellé du compte de flammes (pastille du cartouche).
  function libelleCompte(n) {
    return n <= 1 ? (n + ' flamme') : (n + ' flammes');
  }

  // ---------- Rendu des flammes d'un serment ----------

  function rendreFlammes(serment, carte) {
    var flammes = flammesDe(serment.id);
    if (serment.a_raviver === true || flammes.length === 0) {
      // « à raviver » : une INVITATION POSITIVE, jamais un reproche.
      carte.appendChild(el('span', 'zekrom-aorienter', 'à raviver'));
      carte.appendChild(el('p', 'zekrom-invite',
        'Ravive la foi : glisse une citation, une victoire ou un rappel qui rallume ce serment.'));
    } else {
      var liste = el('ul', 'zekrom-directions');
      flammes.forEach(function (f) {
        liste.appendChild(rendreFlamme(f, serment));
      });
      carte.appendChild(liste);
    }
    carte.appendChild(construireFormFlamme(serment));
  }

  function rendreFlamme(flamme, serment) {
    var item = el('li', 'zekrom-direction');
    // Nature en petite étiquette (small-caps, cerne or).
    item.appendChild(el('span', 'zekrom-registre',
      LIBELLE_NATURE[flamme.nature] || flamme.nature || ''));
    item.appendChild(el('span', 'zekrom-retro-talent', ' ' + String(flamme.texte || '')));
    var retirer = el('button', 'zekrom-retro-detacher', 'retirer');
    retirer.type = 'button';
    retirer.setAttribute('aria-label',
      'Retirer cette flamme du serment « ' + (serment.intitule || '') + ' »');
    retirer.addEventListener('click', function () { retirerFlamme(flamme.id); });
    item.appendChild(retirer);
    return item;
  }

  function construireFormFlamme(serment) {
    var form = el('form', 'zekrom-direction-form');
    form.dataset.sermentId = serment.id;

    var champ = el('input', 'zekrom-direction-input');
    champ.type = 'text';
    champ.name = 'texte';
    champ.maxLength = 2000;
    champ.autocomplete = 'off';
    champ.setAttribute('aria-label', 'Ajouter une flamme au serment « ' + (serment.intitule || '') + ' »');
    champ.placeholder = 'une citation, une victoire, un rappel…';

    var nature = el('select', 'zekrom-retro-select');
    nature.name = 'nature';
    nature.setAttribute('aria-label', 'Nature de la flamme');
    [['citation', 'citation — une parole qui rallume'],
     ['victoire', 'victoire — une preuve déjà vécue'],
     ['rappel', 'rappel — un pourquoi à ne pas perdre']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      nature.appendChild(opt);
    });

    var bouton = el('button', 'zekrom-bouton zekrom-bouton-direction', 'Raviver');
    bouton.type = 'submit';

    form.appendChild(champ);
    form.appendChild(nature);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreFlamme(serment.id, champ.value, nature.value);
    });
    return form;
  }

  // ---------- Passerelles (v2) : d'où naît le serment, où il se suit ----------
  //   « Un serment naît d'un idéal (ZEKROM) » et « se suit dans le journal
  //   (MINETHNIR) ». Manuel : Paul relie et détache chaque passerelle.

  function optionsCibles(type) {
    if (type === 'ideal') {
      return etat.ideauxListe.map(function (i) {
        return [i.id, i.intitule || '(idéal sans intitulé)'];
      });
    }
    return etat.pagesListe.map(function (p) {
      return [p.id, p.label || '(page sans titre)'];
    });
  }

  function construireFormLien(serment) {
    var form = el('form', 'zekrom-retro-form');
    form.dataset.sermentId = serment.id;

    var selType = el('select', 'zekrom-retro-select');
    selType.name = 'type';
    selType.setAttribute('aria-label', 'Type de passerelle');
    [['ideal', 'Idéal (ZEKROM)'],
     ['page', 'Page (MINETHNIR)']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      selType.appendChild(opt);
    });

    var selCible = el('select', 'zekrom-retro-select');
    selCible.name = 'cible';
    selCible.setAttribute('aria-label', 'Cible à relier');

    function peupler() {
      selCible.textContent = '';
      optionsCibles(selType.value).forEach(function (paire) {
        var opt = el('option', null, paire[1]);
        opt.value = paire[0];
        selCible.appendChild(opt);
      });
    }
    peupler();
    selType.addEventListener('change', peupler);

    var bouton = el('button', 'zekrom-bouton zekrom-bouton-lien', 'Relier');
    bouton.type = 'submit';

    form.appendChild(selType);
    form.appendChild(selCible);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreLien(serment.id, selType.value, selCible.value);
    });
    return form;
  }

  function rendrePasserelles(serment, carte) {
    var section = el('section', 'zekrom-retro');
    section.appendChild(el('h4', 'zekrom-retro-entete',
      'Passerelles — d’où naît ce serment, où il se suit'));

    var liens = liensDe(serment.id);
    if (liens.length === 0) {
      section.appendChild(el('p', 'zekrom-retro-vide',
        'Aucune passerelle pour l’instant — relie un idéal ZEKROM ou une page MINETHNIR.'));
    } else {
      var liste = el('ul', 'zekrom-retro-liste');
      liens.forEach(function (lien) {
        var item = el('li', 'zekrom-retro-item');
        var libelle = libelleLien(lien);
        item.appendChild(el('span', 'zekrom-retro-talent', libelle));
        var detacher = el('button', 'zekrom-retro-detacher', 'détacher');
        detacher.type = 'button';
        detacher.setAttribute('aria-label', 'Détacher « ' + libelle + ' »');
        detacher.addEventListener('click', function () { detacherLien(lien.id); });
        item.appendChild(detacher);
        liste.appendChild(item);
      });
      section.appendChild(liste);
    }

    // Picker d'ajout : présent dès qu'au moins une cible existe. Sans idéal ni
    // page chargés, on se contente d'une aide (dégradation propre, jamais bloquant).
    if (etat.ideauxListe.length === 0 && etat.pagesListe.length === 0) {
      section.appendChild(el('p', 'zekrom-retro-aide',
        'Aucun idéal ni page à relier pour l’instant — capte un idéal dans ZEKROM ou écris une page dans MINETHNIR.'));
    } else {
      section.appendChild(construireFormLien(serment));
    }
    carte.appendChild(section);
  }

  // ---------- LE RETOUR DE LA PASSERELLE (2026-08-04) ----------
  // `scenario_liens` reliait déjà un futur VRANESH à un serment — mais seul
  // VRANESH lisait ce lien. Depuis DRAUKHAIN, un serment ne savait RIEN des
  // futurs qui le menacent ou qui le servent : le pont était à sens unique, et
  // le sens manquant était celui qui compte le jour où un futur ADVIENT.
  // Rien de nouveau n'est écrit ici : on montre, on ne crée pas. Le lien se
  // pose et se détache depuis VRANESH, là où le futur se pense.
  var LIBELLE_RAPPORT = { menace: 'menace', sert: 'sert' };

  function rendreFuturs(serment, carte) {
    var futurs = futursDe(serment.id);
    if (futurs.length === 0) {
      // Rien à dire : on n'ouvre pas une section vide pour la remplir de vide.
      // (L'invitation à relier vit dans VRANESH, au bon endroit.)
      return;
    }

    var section = el('section', 'zekrom-retro draukhain-futurs');
    section.appendChild(el('h4', 'zekrom-retro-entete',
      'Les futurs qui le touchent — depuis VRANESH'));

    var liste = el('ul', 'zekrom-retro-liste');
    futurs.forEach(function (f) {
      var item = el('li', 'zekrom-retro-item' + (f.advenu ? ' draukhain-futur--advenu' : ''));
      // Le rapport d'abord : ce futur SERT ou MENACE — c'est ce qu'on lit en premier.
      if (f.rapport) {
        item.appendChild(el('span', 'zekrom-registre', LIBELLE_RAPPORT[f.rapport] || f.rapport));
      }
      item.appendChild(el('span', 'zekrom-retro-talent', ' ' + String(f.deroule || '')));
      if (f.theme) {
        item.appendChild(el('span', 'zekrom-retro-note', ' — ' + nomCourt(f.theme)));
      }
      if (f.advenu === true) {
        item.appendChild(el('span', 'draukhain-futur-sceau', 'advenu'));
      }
      liste.appendChild(item);
    });
    section.appendChild(liste);

    var aller = el('a', 'zekrom-retro-aide', 'Voir ces futurs dans VRANESH ↝');
    aller.href = 'vranesh.html';
    section.appendChild(aller);
    carte.appendChild(section);
  }

  // ---------- La voie jalonnée (forme A, dictée Paul 2026-07-30) ----------
  // « Montrer un avancement, un cheminement — aller de l'avant, devenir
  // meilleur. » Un serment = UNE VOIE : le serment prêté → les flammes
  // franchies → « tu es ici » → l'horizon, la route SORTANT de la carte.
  // Jamais de ligne d'arrivée ni de barre qui se remplit : on progresse
  // toujours. Trois fonctions PURES ci-dessous (jalons, points, tracé), toutes
  // exercées par le harnais ; le rendu DOM reste createElement/textContent.

  var VOIE_SVG_NS = 'http://www.w3.org/2000/svg';
  var VOIE_LARGEUR = 1000;  // repère du viewBox
  var VOIE_HAUTEUR = 128;
  var VOIE_X_DEBUT = 9;     // en % du plateau (marge pour l'étiquette)
  var VOIE_X_FIN = 92;
  var VOIE_Y_CREUX = 68;    // en % — étiquette AU-DESSOUS
  var VOIE_Y_CRETE = 32.8;  // en % — étiquette AU-DESSUS
  var VOIE_MAX_FLAMMES = 3; // au-delà, les plus anciennes tiennent en une borne

  // Les jalons d'un serment, du départ à l'horizon (PURE).
  // 0 flamme : on se tient au départ, « raviver » est la borne devant soi —
  // l'invitation cardinale de DRAUKHAIN, jamais un reproche.
  function jalonsVoie(serment, flammes) {
    var liste = Array.isArray(flammes) ? flammes : [];
    var jalons = [{
      cle: 'depart',
      titre: 'Le serment prêté',
      note: dateLisible(serment && serment.created_at),
      etat: liste.length === 0 ? 'ici' : 'franchi'
    }];

    if (liste.length > VOIE_MAX_FLAMMES) {
      var caches = liste.length - VOIE_MAX_FLAMMES;
      jalons.push({
        cle: 'resume',
        titre: caches + (caches > 1 ? ' flammes' : ' flamme'),
        note: 'déjà ravivées',
        etat: 'franchi'
      });
    }

    liste.slice(-VOIE_MAX_FLAMMES).forEach(function (f, i, gardees) {
      var dernier = (i === gardees.length - 1);
      jalons.push({
        cle: 'flamme-' + f.id,
        titre: dernier ? 'Tu es ici' : (LIBELLE_NATURE[f.nature] || f.nature || 'flamme'),
        note: dernier
          ? libelleCompte(liste.length) + ' — ' + (LIBELLE_NATURE[f.nature] || f.nature || '')
          : dateLisible(f.created_at),
        etat: dernier ? 'ici' : 'franchi'
      });
    });

    if (liste.length === 0) {
      jalons.push({
        cle: 'raviver',
        titre: 'À raviver',
        note: 'une citation, une victoire, un rappel',
        etat: 'devant'
      });
    }

    jalons.push({
      cle: 'horizon',
      titre: (serment && serment.horizon) ? serment.horizon : 'L’horizon',
      note: 'la route continue',
      etat: 'devant'
    });
    return jalons;
  }

  // Les points de la voie, en % du plateau — creux et crêtes en alternance,
  // le premier toujours en creux (PURE).
  function pointsVoie(n) {
    var total = (typeof n === 'number' && n > 1) ? Math.floor(n) : 2;
    var pas = (VOIE_X_FIN - VOIE_X_DEBUT) / (total - 1);
    var points = [];
    for (var i = 0; i < total; i += 1) {
      points.push({
        x: VOIE_X_DEBUT + (pas * i),
        y: (i % 2 === 0) ? VOIE_Y_CREUX : VOIE_Y_CRETE
      });
    }
    return points;
  }

  // Le tracé (attribut `d`) qui relie les points, poignées horizontales pour
  // une ondulation douce ; coordonnées du viewBox (PURE).
  function cheminVoie(points) {
    var liste = Array.isArray(points) ? points : [];
    if (liste.length < 2) { return ''; }
    function ux(p) { return (p.x / 100) * VOIE_LARGEUR; }
    function uy(p) { return (p.y / 100) * VOIE_HAUTEUR; }
    var d = 'M ' + ux(liste[0]).toFixed(1) + ' ' + uy(liste[0]).toFixed(1);
    for (var i = 1; i < liste.length; i += 1) {
      var xa = ux(liste[i - 1]), ya = uy(liste[i - 1]);
      var xb = ux(liste[i]), yb = uy(liste[i]);
      var dx = (xb - xa) / 2;
      d += ' C ' + (xa + dx).toFixed(1) + ' ' + ya.toFixed(1)
        + ' ' + (xb - dx).toFixed(1) + ' ' + yb.toFixed(1)
        + ' ' + xb.toFixed(1) + ' ' + yb.toFixed(1);
    }
    return d;
  }

  // La queue : la route quitte la carte dans l'élan du dernier jalon (PURE).
  function queueVoie(points) {
    var liste = Array.isArray(points) ? points : [];
    if (liste.length === 0) { return ''; }
    var dernier = liste[liste.length - 1];
    var x = (dernier.x / 100) * VOIE_LARGEUR;
    var y = (dernier.y / 100) * VOIE_HAUTEUR;
    // Après une crête on redescend, après un creux on remonte : l'élan continue.
    var fin = (dernier.y < 50) ? Math.min(y + 12, VOIE_HAUTEUR - 4) : Math.max(y - 12, 4);
    var reste = VOIE_LARGEUR - x;
    return 'M ' + x.toFixed(1) + ' ' + y.toFixed(1)
      + ' C ' + (x + reste * 0.4).toFixed(1) + ' ' + y.toFixed(1)
      + ' ' + (x + reste * 0.75).toFixed(1) + ' ' + ((y + fin) / 2).toFixed(1)
      + ' ' + VOIE_LARGEUR + ' ' + fin.toFixed(1);
  }

  function svgVoie(nom, attributs) {
    var noeud = document.createElementNS(VOIE_SVG_NS, nom);
    Object.keys(attributs).forEach(function (cle) {
      noeud.setAttribute(cle, attributs[cle]);
    });
    return noeud;
  }

  function rendreVoie(serment) {
    var flammes = flammesDe(serment.id);
    var jalons = jalonsVoie(serment, flammes);
    var points = pointsVoie(jalons.length);
    var trace = cheminVoie(points);

    var section = el('div', 'voie');
    var plateau = el('div', 'voie-plateau');

    // 1. Le tracé — décor pur, jamais lu : toute l'information est dans la liste.
    var svg = svgVoie('svg', {
      'class': 'voie-route',
      viewBox: '0 0 ' + VOIE_LARGEUR + ' ' + VOIE_HAUTEUR,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
      focusable: 'false'
    });
    svg.appendChild(svgVoie('path', { 'class': 'route-fond', d: trace, pathLength: '100' }));

    // Part parcourue : jusqu'au jalon « tu es ici » (pathLength=100 → en %).
    var indexIci = 0;
    jalons.forEach(function (j, i) { if (j.etat === 'ici') { indexIci = i; } });
    var parcourue = (indexIci / (jalons.length - 1)) * 100;
    if (parcourue > 0) {
      svg.appendChild(svgVoie('path', {
        'class': 'route-faite',
        d: trace,
        pathLength: '100',
        'stroke-dasharray': parcourue.toFixed(1) + ' 100'
      }));
    }
    svg.appendChild(svgVoie('path', { 'class': 'route-queue', d: queueVoie(points) }));
    plateau.appendChild(svg);

    // 2. Les bornes — c'est ELLES que lisent l'œil et le lecteur d'écran.
    var liste = el('ol', 'voie-bornes');
    liste.setAttribute('aria-label',
      'Le cheminement du serment « ' + (serment.intitule || '') + ' »');
    jalons.forEach(function (jalon, i) {
      var borne = el('li', 'borne borne--' + (jalon.etat === 'franchi' ? 'franchie' : jalon.etat)
        + (points[i].y < 50 ? ' borne--haut' : ' borne--bas')
        + (jalon.cle === 'horizon' ? ' borne--horizon' : ''));
      borne.style.setProperty('--x', points[i].x.toFixed(2) + '%');
      borne.style.setProperty('--y', points[i].y.toFixed(2) + '%');
      borne.appendChild(el('span', 'borne-sceau'));
      var titre = el('span', 'borne-titre', jalon.titre);
      if (jalon.note) { titre.appendChild(el('span', 'borne-note', jalon.note)); }
      borne.appendChild(titre);
      liste.appendChild(borne);
    });
    plateau.appendChild(liste);

    section.appendChild(plateau);
    return section;
  }

  // ---------- LA VOÛTE DES SERMENTS (forme A, dictée Paul 2026-08-04) ----------
  // « J'aime bien l'outil, mais la forme n'est pas adaptée. Essayons de faire
  //   quelque chose de plus visuel — une belle cartographie. »
  //
  // Ce que la voûte répare, et qu'aucune vue ne faisait : les serments
  // COEXISTENT (on ne voyait jamais qu'un serment à la fois) et les FILS vers
  // les caps voisins SE VOIENT — le lien entrant depuis VRANESH existait en
  // base sans avoir nulle part où s'afficher.
  //
  // Chaque vue a désormais UN travail, et un seul : la voûte montre l'ensemble,
  // le foyer montre UN serment, le registre sert à écrire.
  //
  // Le repère est repris de la maquette éprouvée (design/preview-draukhain-carto)
  // et mesuré aux volumes 1 / 5 / 12 : cadre ET croisements d'étiquettes.
  var VOUTE = {
    L: 640, H: 420, CX: 330, CY: 214,
    MARGE: 8,          // air incompressible entre un texte et le bord
    LARGEUR_CAR: 6.1   // largeur moyenne d'un signe à 12 px dans cette serif
  };

  // Les caps voisins, en cartouches de bord. L'ordre est celui du récit : d'où
  // le serment naît, ce qui le menace ou le sert, où il se suit.
  var CAPS_VOUTE = [
    { cle: 'zekrom', nom: 'ZEKROM', role: 'l’idéal dont il naît', x: 74, y: 58 },
    { cle: 'vranesh', nom: 'VRANESH', role: 'ce qui le menace ou le sert', x: 566, y: 58 },
    { cle: 'minethnir', nom: 'MINETHNIR', role: 'où il se suit', x: 74, y: 362 }
  ];

  // Les caps auxquels ce serment est relié, sortants ET entrants confondus.
  // Les entrants viennent de `futursDe` (jointure servie par /api/serments) :
  // le fil de VRANESH est la moitié du pont qui manquait à DRAUKHAIN.
  function capsDe(sermentId) {
    var vus = {};
    liensDe(sermentId).forEach(function (lien) {
      if (lien.ideal_id) { vus.zekrom = true; }
      if (lien.entree_id) { vus.minethnir = true; }
    });
    if (futursDe(sermentId).length > 0) { vus.vranesh = true; }
    return CAPS_VOUTE.filter(function (c) { return vus[c.cle] === true; });
  }

  // La couronne de la voûte : n serments répartis autour du cœur du cap, le
  // premier plein Nord. Fonction PURE (aucun DOM) → testable unitairement.
  // Même motif que `couronne()` du foyer, avec DEUX différences dictées par la
  // mesure : le budget de signes se calcule sur la place réelle de chaque côté,
  // et un nom plein Nord ou plein Sud se pose AU-DESSUS / EN DESSOUS — sinon il
  // vient croiser les étiquettes de ses deux voisins (constat mesuré en maquette).
  function couronneVoute(n) {
    var out = [];
    if (n <= 0) { return out; }
    var rayon = n === 1 ? 0 : Math.min(132, 84 + n * 4);
    for (var i = 0; i < n; i += 1) {
      var angle = (-90 + i * (360 / n)) * Math.PI / 180;
      var cos = n === 1 ? 0 : Math.cos(angle);
      var sin = n === 1 ? 0 : Math.sin(angle);
      var x = VOUTE.CX + rayon * cos;
      var y = VOUTE.CY + rayon * sin;
      var ancre = cos < -0.15 ? 'end' : (cos > 0.15 ? 'start' : 'middle');
      var dispo;
      if (ancre === 'end') { dispo = x - 2 * VOUTE.MARGE; }
      else if (ancre === 'start') { dispo = VOUTE.L - x - 2 * VOUTE.MARGE; }
      else { dispo = 2 * Math.min(x, VOUTE.L - x) - VOUTE.MARGE; }
      out.push({
        x: x, y: y, ancre: ancre,
        // Décalage vertical du nom : à côté du feu sur les flancs, au-dessus
        // au Nord, en dessous au Sud.
        dy: ancre !== 'middle' ? 3 : (y <= VOUTE.CY ? -26 : 32),
        signes: Math.max(0, Math.floor(dispo / VOUTE.LARGEUR_CAR))
      });
    }
    return out;
  }

  // Le budget de signes de `couronneVoute` reste une ESTIMATION : il suppose un
  // signe de largeur moyenne. Un nom tout en capitales est plus large que cette
  // moyenne — au pire cas à douze, une étiquette débordait de 7 px du cadre, et
  // c'est la mesure du harnais qui l'a dit, pas l'œil. On repasse donc derrière
  // l'estimation avec la largeur RÉELLEMENT tracée : on retire des signes tant
  // que le texte dépasse sa place. Sous 6 signes utiles, on n'écrit rien — un
  // moignon ne reconnaît rien, et la parole sous la carte dit tout, elle.
  function ajusterAuCadre(etiquette) {
    if (!etiquette || typeof etiquette.getBBox !== 'function') { return; }
    var brut = (etiquette.textContent || '').replace(/…$/, '');
    if (!brut) { return; }
    for (var garde = 0; garde < 40; garde += 1) {
      var boite = etiquette.getBBox();
      if (!boite || boite.width === 0) { return; }
      if (boite.x >= VOUTE.MARGE - 0.5
        && boite.x + boite.width <= VOUTE.L - VOUTE.MARGE + 0.5) { return; }
      brut = brut.slice(0, -1).replace(/\s+$/, '');
      if (brut.length < 6) { etiquette.textContent = ''; return; }
      etiquette.textContent = brut + '…';
    }
  }

  // Une énumération se dit en français : « A, B et C » — jamais « A et B et C ».
  function enumerer(noms) {
    if (noms.length <= 1) { return noms.join(''); }
    return noms.slice(0, -1).join(', ') + ' et ' + noms[noms.length - 1];
  }

  function paroleVouteRepos() {
    var zone = document.getElementById('draukhain-voute-parole');
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'voute-parole-repos',
      etat.serments.length === 0
        ? 'Aucun serment scellé pour l’instant — le premier allumera la voûte.'
        : 'Survole un feu — il te dit ce qu’il est. Clique-le pour ouvrir son foyer.'));
  }

  // UNE ligne au survol : le nom, ce qui l'entretient, ce à quoi il tient.
  function paroleVoute(serment) {
    var zone = document.getElementById('draukhain-voute-parole');
    if (!zone) { return; }
    zone.textContent = '';
    zone.appendChild(el('span', 'voute-parole-nom', nomCourt(serment.intitule)));

    var suite = ' — ' + libelleCompte(flammesDe(serment.id).length);
    var caps = capsDe(serment.id).map(function (c) { return c.nom; });
    if (caps.length > 0) { suite += ' · relié à ' + enumerer(caps); }
    zone.appendChild(document.createTextNode(suite));

    // Le rapport d'un futur au serment se dit en toutes lettres — et un futur
    // ADVENU se signale : ce n'est plus une hypothèse, c'est arrivé.
    futursDe(serment.id).forEach(function (futur) {
      var verbe = futur.rapport === 'menace' ? 'menace' : 'sert';
      var theme = futur.theme ? nomCourt(futur.theme) : '';
      zone.appendChild(document.createTextNode(
        ' · un futur ' + (futur.advenu === true ? 'ADVENU ' : '') + verbe
        + ' ce serment' + (theme ? ' (' + theme + ')' : '')));
    });
  }

  function rendreVoute() {
    var section = document.getElementById('draukhain-voute');
    var cadre = document.getElementById('draukhain-voute-dessin');
    if (!section || !cadre) { return; }
    section.hidden = false;
    cadre.textContent = '';
    cadre.classList.remove('a-choix');

    var serments = Array.isArray(etat.serments) ? etat.serments : [];
    if (serments.length === 0) { paroleVouteRepos(); return; }

    // Le cœur du cap — seulement quand il y a une couronne autour de lui : à un
    // seul serment, le feu du serment occupe déjà le centre.
    var anneau = svgEl('circle', 'voute-anneau');
    anneau.setAttribute('cx', String(VOUTE.CX));
    anneau.setAttribute('cy', String(VOUTE.CY));
    anneau.setAttribute('r', '30');
    cadre.appendChild(anneau);
    if (serments.length > 1) {
      var coeur = svgEl('path', 'voute-coeur');
      coeur.setAttribute('d', traceFlamme(VOUTE.CX, VOUTE.CY + 11, 22));
      cadre.appendChild(coeur);
      var coeurFeu = svgEl('path', 'voute-coeur-feu');
      coeurFeu.setAttribute('d', traceFlamme(VOUTE.CX, VOUTE.CY + 9, 10));
      cadre.appendChild(coeurFeu);
    }

    // Les cartouches des caps voisins, avec le compte de fils qui y aboutit.
    CAPS_VOUTE.forEach(function (cap) {
      var n = serments.filter(function (s) {
        return capsDe(s.id).some(function (c) { return c.cle === cap.cle; });
      }).length;
      var g = svgEl('g', 'voute-cap');
      var rect = svgEl('rect', 'voute-cartouche');
      rect.setAttribute('x', String(cap.x - 52));
      rect.setAttribute('y', String(cap.y - 17));
      rect.setAttribute('width', '104');
      rect.setAttribute('height', '34');
      rect.setAttribute('rx', '5');
      var nom = svgEl('text', 'voute-cap-nom');
      nom.setAttribute('x', String(cap.x));
      nom.setAttribute('y', String(cap.y - 2));
      nom.textContent = cap.nom;
      var role = svgEl('text', 'voute-cap-role');
      role.setAttribute('x', String(cap.x));
      role.setAttribute('y', String(cap.y + 10));
      role.textContent = n === 0 ? 'aucun fil' : (n + (n > 1 ? ' fils' : ' fil'));
      g.appendChild(rect); g.appendChild(nom); g.appendChild(role);
      cadre.appendChild(g);
    });

    var places = couronneVoute(serments.length);

    // Les fils d'abord : ils passent SOUS les feux.
    serments.forEach(function (serment, i) {
      capsDe(serment.id).forEach(function (cap) {
        var fil = svgEl('path', 'voute-fil');
        fil.setAttribute('d', 'M' + places[i].x + ' ' + places[i].y
          + ' Q ' + ((places[i].x + cap.x) / 2) + ' ' + ((places[i].y + cap.y) / 2 - 26)
          + ' ' + cap.x + ' ' + (cap.y + (cap.cle === 'minethnir' ? -18 : 18)));
        fil.dataset.serment = serment.id;
        cadre.appendChild(fil);
      });
    });

    serments.forEach(function (serment, i) {
      var place = places[i];
      var flammes = flammesDe(serment.id);
      var n = flammes.length;
      var g = svgEl('g', 'voute-feu');
      g.dataset.id = serment.id;
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      // L'étiquette peut être bornée par la place ; l'intitulé entier vit ici,
      // pour le lecteur d'écran comme pour le harnais.
      g.setAttribute('aria-label', (serment.intitule || '') + ' — ' + libelleCompte(n));

      if (n > 0) {
        var halo = svgEl('circle', 'voute-halo');
        halo.setAttribute('cx', String(place.x));
        halo.setAttribute('cy', String(place.y));
        halo.setAttribute('r', String(11 + n * 1.9));
        halo.setAttribute('opacity', String(Math.min(0.16, 0.04 + n * 0.022)));
        g.appendChild(halo);
        var feu = svgEl('path', 'voute-feu-trace');
        feu.setAttribute('d', traceFlamme(place.x, place.y + 8, 17 + Math.min(8, n * 1.4)));
        g.appendChild(feu);
        var coeurFlamme = svgEl('path', 'voute-feu-coeur');
        coeurFlamme.setAttribute('d', traceFlamme(place.x, place.y + 6, 8));
        g.appendChild(coeurFlamme);
      } else {
        var braise = svgEl('circle', 'voute-braise');
        braise.setAttribute('cx', String(place.x));
        braise.setAttribute('cy', String(place.y));
        braise.setAttribute('r', '9');
        g.appendChild(braise);
      }

      var etiquette = svgEl('text', 'voute-nom');
      etiquette.setAttribute('x', String(place.x
        + (place.ancre === 'end' ? -14 : (place.ancre === 'start' ? 14 : 0))));
      etiquette.setAttribute('y', String(place.y + place.dy));
      etiquette.setAttribute('text-anchor', place.ancre);
      // Sous 6 signes une étiquette ne reconnaît plus rien : mieux vaut le vide
      // qu'un moignon — la parole sous la carte, elle, dit tout.
      etiquette.textContent = place.signes >= 6
        ? etiquetteFlamme(nomCourt(serment.intitule), Math.min(26, place.signes))
        : '';
      g.appendChild(etiquette);

      var zone = svgEl('circle', 'voute-zone');
      zone.setAttribute('cx', String(place.x));
      zone.setAttribute('cy', String(place.y));
      zone.setAttribute('r', '16');
      g.appendChild(zone);

      function viser() {
        cadre.classList.add('a-choix');
        Array.prototype.forEach.call(cadre.querySelectorAll('.voute-feu'), function (o) {
          o.classList.toggle('is-actif', o === g);
        });
        Array.prototype.forEach.call(cadre.querySelectorAll('.voute-fil'), function (f) {
          f.classList.toggle('is-vif', f.dataset.serment === serment.id);
        });
        paroleVoute(serment);
      }
      function relacher() {
        cadre.classList.remove('a-choix');
        g.classList.remove('is-actif');
        Array.prototype.forEach.call(cadre.querySelectorAll('.voute-fil'), function (f) {
          f.classList.remove('is-vif');
        });
        paroleVouteRepos();
      }
      g.addEventListener('mouseenter', viser);
      g.addEventListener('mouseleave', relacher);
      g.addEventListener('focus', viser);
      g.addEventListener('blur', relacher);
      g.addEventListener('click', function () { ouvrirFoyer(serment); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrirFoyer(serment); }
      });

      cadre.appendChild(g);
    });

    // L'estimation posée, on la corrige sur la largeur réellement tracée : les
    // étiquettes ne sont ajustées qu'une fois toutes dans le document.
    Array.prototype.forEach.call(cadre.querySelectorAll('.voute-nom'), ajusterAuCadre);

    paroleVouteRepos();
  }

  // ---------- LE FOYER DES SERMENTS (forme A, dictée Paul 2026-08-01) ----------
  // « Sortir de la fiche textuelle statique : un affichage progressif,
  //   dynamique, évolutif. » Forme A choisie sur preview, avec deux consignes
  //   explicites : GARDER LE CHAMP LEXICAL DU FEU, et UNE FLAMME AU CENTRE.
  //
  // Le serment est un FEU QU'ON ENTRETIENT : au centre sa flamme, autour les
  // flammes posées (citations, victoires, rappels), et un halo dont l'éclat
  // croît avec leur nombre — la discipline SE VOIT. Un serment sans flamme est
  // un cercle de braise : il ne demande qu'un souffle, jamais un reproche.
  // Rien ne « finit » : un foyer s'entretient ou s'éteint (ni ligne d'arrivée,
  // ni pourcentage, ni sommet).
  //
  // Grammaire commune à VRANESH : les NOMS d'abord, un clic déploie UN serment,
  // le survol donne UNE LIGNE, le clic donne TOUT. Les intitulés sont intimes :
  // createElement/textContent uniquement, rien dans le HTML servi.

  // Le repère est plus large que haut : les étiquettes des flammes vivent à
  // gauche et à droite du foyer, il leur faut une GOUTTIÈRE. Sans elle, elles
  // sortaient du cadre (constat de Paul sur la preview du 2026-08-01).
  var FOYER = {
    L: 300, H: 200, CX: 150, CY: 100, RAYON_CERCLE: 20,
    MARGE: 6,          // air incompressible entre un texte et le bord
    LARGEUR_CAR: 3.6   // largeur moyenne d'un signe à 7 px dans cette serif
  };
  var NS_SVG = 'http://www.w3.org/2000/svg';
  var sermentOuvert = null;

  function svgEl(nom, classe) {
    var element = document.createElementNS(NS_SVG, nom);
    if (classe) { element.setAttribute('class', classe); }
    return element;
  }

  // Le NOM SEUL du serment : un intitulé « X — le pourquoi » se porte « X ».
  function nomCourt(intitule) {
    var texte = (intitule || '').trim();
    var coupe = texte.split(/\s+[—–-]\s+/)[0];
    return coupe.trim() || texte;
  }

  // L'étiquette d'une flamme : de quoi la reconnaître, pas de quoi la lire.
  function etiquetteFlamme(texte, borne) {
    var max = borne || 22;
    var t = (texte || '').trim();
    if (!t) { return 'une flamme'; }
    var phrase = t.split(/[.;:!?]/)[0].trim() || t;
    if (phrase.length <= max) { return phrase; }
    var mots = phrase.slice(0, max).split(' ');
    if (mots.length > 1) { mots.pop(); }
    return mots.join(' ') + '…';
  }

  // La couronne : n flammes réparties autour du foyer, la première plein Nord.
  // Fonction PURE (aucun DOM) → testable unitairement.
  function couronne(n) {
    var out = [];
    if (n <= 0) { return out; }
    var rayon = 30 + n * 4;
    for (var i = 0; i < n; i += 1) {
      var angle = (-90 + i * (360 / n)) * Math.PI / 180;
      var cos = Math.cos(angle), sin = Math.sin(angle);
      var x = FOYER.CX + rayon * cos;
      var ancre = cos < -0.15 ? 'end' : (cos > 0.15 ? 'start' : 'middle');
      // La place RÉELLEMENT disponible de ce côté-là, en unités du repère. On
      // en déduit combien de signes l'étiquette peut porter — plutôt que de
      // tronquer à l'aveugle et d'espérer que ça tienne.
      var dispo;
      if (ancre === 'end') { dispo = x - FOYER.MARGE - FOYER.MARGE; }
      else if (ancre === 'start') { dispo = FOYER.L - x - FOYER.MARGE - FOYER.MARGE; }
      else { dispo = 2 * Math.min(x, FOYER.L - x) - FOYER.MARGE; }
      out.push({
        x: x,
        y: FOYER.CY + rayon * sin,
        cos: cos,
        // Le texte fuit le centre : à gauche il s'aligne à droite, et vice versa.
        ancre: ancre,
        // Borne haute de l'étiquette, en signes. Jamais moins de 6 : en dessous
        // une étiquette ne reconnaît plus rien, mieux vaut alors ne rien écrire.
        signes: Math.max(0, Math.floor(dispo / FOYER.LARGEUR_CAR))
      });
    }
    return out;
  }

  // L'éclat du halo : il croît avec le nombre de flammes, mais plafonne — un
  // foyer bien tenu éclaire, il n'aveugle pas. Fonction PURE.
  function eclat(n) {
    if (n <= 0) { return null; }
    return { rayon: 20 + n * 5, opacite: Math.min(0.18, 0.04 + n * 0.03) };
  }

  // Le dessin d'une flamme (gravure), posé en (x, y). `hauteur` porte la
  // nature : une victoire brûle plus haut qu'un rappel.
  function traceFlamme(x, y, hauteur) {
    var l = hauteur * 0.42;
    return 'M' + x + ' ' + (y - hauteur)
      + ' q ' + l + ' ' + (hauteur * 0.62) + ' 0 ' + hauteur
      + ' q ' + (-l) + ' ' + (-hauteur * 0.38) + ' 0 ' + (-hauteur) + ' Z';
  }

  function hauteurFlamme(nature) {
    if (nature === 'victoire') { return 11; }
    if (nature === 'citation') { return 9; }
    return 7.5;
  }

  // ---- Le cartouche de côté ----

  function coteRepos(texte) {
    var cote = document.getElementById('draukhain-foyer-cote');
    if (!cote) { return; }
    cote.textContent = '';
    cote.appendChild(el('p', 'foyer-cote-repos', texte));
  }

  function coteFlamme(serment, flamme, rang, total, detail) {
    var cote = document.getElementById('draukhain-foyer-cote');
    if (!cote) { return; }
    cote.textContent = '';
    cote.appendChild(el('h3', 'foyer-cote-titre', etiquetteFlamme(flamme.texte, 40)));
    cote.appendChild(el('p', 'foyer-cote-rang', nomCourt(serment.intitule)
      + ' — flamme ' + rang + ' sur ' + total
      + ' · ' + (LIBELLE_NATURE[flamme.nature] || flamme.nature || 'rappel')));
    cote.appendChild(el('p', 'foyer-cote-texte', flamme.texte || ''));

    if (!detail) {
      cote.appendChild(el('p', 'foyer-cote-invite', 'Clique la flamme pour voir le serment entier ↝'));
      return;
    }
    var dl = el('dl', 'foyer-cote-detail');
    if (serment.pourquoi) {
      dl.appendChild(el('dt', null, 'Pourquoi ce serment'));
      dl.appendChild(el('dd', null, serment.pourquoi));
    }
    if (serment.horizon) {
      dl.appendChild(el('dt', null, 'Horizon'));
      dl.appendChild(el('dd', null, serment.horizon));
    }
    var liens = liensDe(serment.id);
    dl.appendChild(el('dt', null, 'Passerelles'));
    if (liens.length === 0) {
      dl.appendChild(el('dd', null, 'Aucune — relie ce serment dans le registre.'));
    } else {
      liens.forEach(function (lien) {
        var lu = libelleLien(lien);
        dl.appendChild(el('dd', null, (lu.prefixe || '') + (lu.nom || '')));
      });
    }
    if (dl.childNodes.length > 0) { cote.appendChild(dl); }

    var aller = el('a', 'foyer-cote-lien', 'Ouvrir ce serment dans le registre ↝');
    aller.href = '#draukhain-serment-' + serment.id;
    cote.appendChild(aller);
  }

  // ---- Le dessin du foyer ----

  function dessinerFoyer(serment) {
    var cadre = document.getElementById('draukhain-foyer-dessin');
    var titre = document.getElementById('draukhain-foyer-nom');
    if (!cadre || !titre) { return; }
    cadre.textContent = '';
    titre.textContent = nomCourt(serment.intitule);

    var flammes = flammesDe(serment.id);
    var n = flammes.length;

    // Le halo : posé AVANT tout, sans animation d'opacité (elle écraserait
    // l'éclat calculé — piège relevé en preview).
    var lueur = eclat(n);
    if (lueur) {
      var halo = svgEl('circle', 'foyer-halo');
      halo.setAttribute('cx', String(FOYER.CX));
      halo.setAttribute('cy', String(FOYER.CY));
      halo.setAttribute('r', String(lueur.rayon));
      halo.setAttribute('opacity', String(lueur.opacite));
      cadre.appendChild(halo);
    }

    var cercle = svgEl('circle', n === 0 ? 'foyer-cercle--braise' : 'foyer-cercle');
    cercle.setAttribute('cx', String(FOYER.CX));
    cercle.setAttribute('cy', String(FOYER.CY));
    cercle.setAttribute('r', String(FOYER.RAYON_CERCLE));
    cadre.appendChild(cercle);

    // LA FLAMME AU CENTRE (consigne de Paul) : le feu du serment lui-même. Elle
    // grandit un peu avec ce qui l'entretient, et reste dessinée en encre pâle
    // quand le foyer n'est que braise — présente, jamais éteinte.
    var hauteurCentre = 14 + Math.min(6, n * 1.5);
    var centre = svgEl('path', n === 0 ? 'foyer-flamme-centre--braise' : 'foyer-flamme-centre');
    centre.setAttribute('d', traceFlamme(FOYER.CX, FOYER.CY + hauteurCentre / 2, hauteurCentre));
    cadre.appendChild(centre);
    if (n > 0) {
      var coeur = svgEl('path', 'foyer-flamme-coeur');
      coeur.setAttribute('d', traceFlamme(FOYER.CX, FOYER.CY + hauteurCentre / 2 - 1,
        hauteurCentre * 0.45));
      cadre.appendChild(coeur);
    }

    if (n === 0) {
      var mot = svgEl('text', 'foyer-mot');
      mot.setAttribute('x', String(FOYER.CX));
      mot.setAttribute('y', String(FOYER.CY + 48));
      mot.setAttribute('text-anchor', 'middle');
      mot.textContent = 'braise — il ne demande qu’un souffle';
      cadre.appendChild(mot);
      return;
    }

    couronne(n).forEach(function (place, i) {
      var flamme = flammes[i];
      var g = svgEl('g', 'foyer-flamme-g');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', etiquetteFlamme(flamme.texte) + ' — '
        + (LIBELLE_NATURE[flamme.nature] || 'rappel'));

      var tige = svgEl('path', 'foyer-tige');
      tige.setAttribute('d', 'M' + FOYER.CX + ' ' + FOYER.CY + ' L ' + place.x + ' ' + place.y);
      tige.style.animationDelay = (i * 110) + 'ms';

      var feu = svgEl('path', 'foyer-flamme foyer-flamme--'
        + (flamme.nature || 'rappel'));
      feu.setAttribute('d', traceFlamme(place.x, place.y, hauteurFlamme(flamme.nature)));
      feu.style.animationDelay = (i * 110 + 200) + 'ms';

      var etiquette = svgEl('text', 'foyer-etiquette');
      etiquette.setAttribute('x', String(place.x + (place.ancre === 'end' ? -6
        : (place.ancre === 'start' ? 6 : 0))));
      etiquette.setAttribute('y', String(place.y + 14));
      etiquette.setAttribute('text-anchor', place.ancre);
      // Sous 6 signes, une étiquette ne reconnaît plus rien : on l'omet plutôt
      // que d'afficher un moignon. Le cartouche de côté dit tout, lui.
      // DEUX bornes, et la plus serrée gagne : la place réellement disponible
      // (elle protège le cadre) ET 22 signes (elle protège l'intention — une
      // étiquette sert à RECONNAÎTRE la flamme, pas à la lire ; le cartouche de
      // côté dit tout). Sous 6 signes on n'écrit rien : un moignon ne reconnaît
      // rien et salit le dessin.
      etiquette.textContent = place.signes >= 6
        ? etiquetteFlamme(flamme.texte, Math.min(22, place.signes))
        : '';
      etiquette.style.animationDelay = (i * 110 + 200) + 'ms';

      var zone = svgEl('circle', 'foyer-zone');
      zone.setAttribute('cx', String(place.x));
      zone.setAttribute('cy', String(place.y));
      zone.setAttribute('r', '12');

      g.appendChild(tige); g.appendChild(feu);
      g.appendChild(etiquette); g.appendChild(zone);

      function entrer() {
        g.classList.add('is-actif');
        coteFlamme(serment, flamme, i + 1, n, false);
      }
      function sortir() {
        if (!g.classList.contains('is-choisie')) { g.classList.remove('is-actif'); }
      }
      function choisir() {
        Array.prototype.forEach.call(cadre.querySelectorAll('.foyer-flamme-g'), function (o) {
          o.classList.remove('is-choisie'); o.classList.remove('is-actif');
        });
        g.classList.add('is-choisie'); g.classList.add('is-actif');
        coteFlamme(serment, flamme, i + 1, n, true);
      }
      g.addEventListener('mouseenter', entrer);
      g.addEventListener('mouseleave', sortir);
      g.addEventListener('focus', entrer);
      g.addEventListener('blur', sortir);
      g.addEventListener('click', choisir);
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(); }
      });
      cadre.appendChild(g);
    });

    // Les tiges se dessinent du centre vers la flamme : longueur MESURÉE, un
    // dasharray fixe couperait les plus longues.
    Array.prototype.forEach.call(cadre.querySelectorAll('.foyer-tige'), function (t) {
      var L = t.getTotalLength ? t.getTotalLength() : 0;
      if (!L) { return; }
      t.style.strokeDasharray = L;
      t.style.strokeDashoffset = L;
    });
  }

  function ouvrirFoyer(serment) {
    sermentOuvert = serment.id;
    var retour = document.getElementById('draukhain-foyer-retour');
    if (retour) { retour.hidden = false; }
    // Le feu choisi reste marqué sur la voûte : on sait toujours quel serment
    // le foyer est en train de montrer.
    Array.prototype.forEach.call(
      document.querySelectorAll('#draukhain-voute-dessin .voute-feu'),
      function (g) { g.setAttribute('aria-pressed', String(g.dataset.id === serment.id)); });
    dessinerFoyer(serment);
    coteRepos(flammesDe(serment.id).length === 0
      ? 'Ce serment n’a pas encore de flamme — un souffle suffit à le raviver.'
      : 'Survole une flamme — elle te dit ce qu’elle est. Clique-la pour tout voir.');
  }

  function fermerFoyer() {
    sermentOuvert = null;
    var cadre = document.getElementById('draukhain-foyer-dessin');
    var titre = document.getElementById('draukhain-foyer-nom');
    var retour = document.getElementById('draukhain-foyer-retour');
    if (cadre) { cadre.textContent = ''; }
    if (titre) { titre.textContent = ''; }
    if (retour) { retour.hidden = true; }
    Array.prototype.forEach.call(
      document.querySelectorAll('#draukhain-voute-dessin .voute-feu'),
      function (g) { g.setAttribute('aria-pressed', 'false'); });
    coteRepos('Clique un feu sur la voûte — son foyer s’allume.');
  }

  // Le foyer ne porte plus sa propre rangée de noms : c'est la VOÛTE qui
  // désigne le serment (une seule liste de serments à l'écran, plus deux).
  function rendreFoyer() {
    var section = document.getElementById('draukhain-foyer');
    if (!section) { return; }
    var serments = Array.isArray(etat.serments) ? etat.serments : [];
    section.hidden = false;

    if (serments.length === 0) {
      coteRepos('Aucun serment scellé pour l’instant — le premier allumera la voûte.');
      return;
    }

    // Rafraîchissement après écriture : si un foyer était ouvert, on le rouvre.
    if (sermentOuvert) {
      var encore = serments.filter(function (s) { return s.id === sermentOuvert; });
      if (encore.length === 1) { ouvrirFoyer(encore[0]); return; }
      sermentOuvert = null;
    }
    fermerFoyer();
  }

  function rendreSerment(serment) {
    var carte = el('article', 'zekrom-ideal');
    carte.id = 'draukhain-serment-' + serment.id;
    if (serment.a_raviver === true) { carte.classList.add('zekrom-ideal--a-orienter'); }

    var entete = el('header', 'zekrom-ideal-entete');
    entete.appendChild(el('h3', 'zekrom-ideal-intitule', serment.intitule || ''));
    entete.appendChild(el('span', 'zekrom-registre',
      libelleCompte(flammesDe(serment.id).length)));
    carte.appendChild(entete);

    if (serment.pourquoi) {
      carte.appendChild(el('p', 'zekrom-horizon', 'Pourquoi : ' + serment.pourquoi));
    }
    if (serment.horizon) {
      carte.appendChild(el('p', 'zekrom-horizon', 'Horizon : ' + serment.horizon));
    }

    // La voie jalonnée : le cheminement du serment, avant le détail des flammes.
    carte.appendChild(rendreVoie(serment));

    rendreFlammes(serment, carte);
    rendreFuturs(serment, carte);
    rendrePasserelles(serment, carte);
    return carte;
  }

  function rendreSerments() {
    var conteneur = document.getElementById('draukhain-serments');
    if (!conteneur) { return; }
    conteneur.textContent = '';

    var visibles = sermentsVisibles(etat.serments, etat.vue);
    var note = document.getElementById('draukhain-vue-note');
    if (note) {
      note.textContent = etat.vue === 'vivants'
        ? 'Tes serments vivants — ceux qu’au moins une flamme entretient.'
        : 'Toute la carte — un serment sans flamme reste entier, simplement « à raviver ».';
    }

    if (visibles.length === 0) {
      conteneur.appendChild(el('p', 'zekrom-vide', etat.vue === 'vivants'
        ? 'Aucun serment vivant pour l’instant — ravive une flamme pour qu’un serment entretienne sa foi.'
        : 'Aucun serment scellé pour l’instant — scelle ton premier vœu ci-dessus.'));
      return;
    }
    visibles.forEach(function (s) { conteneur.appendChild(rendreSerment(s)); });
  }

  // ---------- Bascule de vue ----------

  function poserVue(vue) {
    etat.vue = (vue === 'vivants') ? 'vivants' : 'tous';
    var bTous = document.getElementById('draukhain-vue-tous');
    var bVivants = document.getElementById('draukhain-vue-vivants');
    if (bTous) { bTous.setAttribute('aria-pressed', String(etat.vue === 'tous')); }
    if (bVivants) { bVivants.setAttribute('aria-pressed', String(etat.vue === 'vivants')); }
    rendreSerments();
    rendreVoute();
    rendreFoyer();
  }

  // ---------- Écritures (Bearer, erreurs génériques) ----------

  function messageForm(texte, estErreur) {
    var zone = document.getElementById('draukhain-form-message');
    if (!zone) { return; }
    zone.textContent = texte || '';
    zone.classList.toggle('zekrom-form-message--erreur', Boolean(estErreur));
  }

  // Appel générique authentifié (POST par défaut ; méthode surchargeable).
  async function appelApi(chemin, corps, methode) {
    if (!etat.session || !etat.session.access_token) { return { ok: false, status: 401 }; }
    var reponse;
    try {
      reponse = await fetch(chemin, {
        method: methode || 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        },
        body: JSON.stringify(corps)
      });
    } catch (e) {
      return { ok: false, status: 0 };
    }
    var data = null;
    try { data = await reponse.json(); } catch (e) { data = null; }
    return { ok: reponse.ok && data && data.ok === true, status: reponse.status, data: data };
  }

  async function soumettreSerment(form) {
    var intitule = (form.elements.intitule.value || '').trim();
    if (!intitule) { messageForm('L’intitulé du serment est requis.', true); return; }
    var pourquoi = (form.elements.pourquoi.value || '').trim();
    var horizon = (form.elements.horizon.value || '').trim();
    var corps = { intitule: intitule };
    if (pourquoi) { corps.pourquoi = pourquoi; }
    if (horizon) { corps.horizon = horizon; }

    messageForm('Enregistrement…', false);
    var res = await appelApi('/api/serments', corps);
    if (res.status === 401) { montrer('draukhain-auth'); return; }
    if (!res.ok) { messageForm('Enregistrement impossible. Réessaie.', true); return; }
    form.reset();
    messageForm('Serment scellé — ravive sa première flamme pour entretenir la foi.', false);
    await rafraichir();
  }

  async function soumettreFlamme(sermentId, texte, nature) {
    var propre = (texte || '').trim();
    if (!propre) { return; }
    var res = await appelApi('/api/flammes', {
      serment_id: sermentId, texte: propre, nature: nature || 'citation'
    });
    if (res.status === 401) { montrer('draukhain-auth'); return; }
    if (!res.ok) { messageForm('Flamme non enregistrée. Réessaie.', true); return; }
    await rafraichir();
  }

  async function retirerFlamme(flammeId) {
    if (!flammeId) { return; }
    var res = await appelApi('/api/flammes', { id: flammeId }, 'DELETE');
    if (res.status === 401) { montrer('draukhain-auth'); return; }
    if (!res.ok) { messageForm('Flamme non retirée. Réessaie.', true); return; }
    await rafraichir();
  }

  // Relier une passerelle : exactement UNE cible (idéal ZEKROM OU page MINETHNIR).
  async function soumettreLien(sermentId, type, cibleId) {
    if (!sermentId || !cibleId) { return; }
    var corps = { serment_id: sermentId };
    if (type === 'ideal') { corps.ideal_id = cibleId; }
    else { corps.entree_id = cibleId; }
    var res = await appelApi('/api/serment-liens', corps);
    if (res.status === 401) { montrer('draukhain-auth'); return; }
    if (!res.ok) { messageForm('Passerelle non reliée. Réessaie.', true); return; }
    await rafraichir();
  }

  async function detacherLien(lienId) {
    if (!lienId) { return; }
    var res = await appelApi('/api/serment-liens', { id: lienId }, 'DELETE');
    if (res.status === 401) { montrer('draukhain-auth'); return; }
    if (!res.ok) { messageForm('Passerelle non détachée. Réessaie.', true); return; }
    await rafraichir();
  }

  // ---------- Flux : session → API → registre (fail-closed partout) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function lireJson(chemin) {
    var reponse = await fetch(chemin, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + etat.session.access_token
      }
    });
    return reponse;
  }

  async function chargerRegistre() {
    var reponse;
    try {
      reponse = await lireJson('/api/serments');
    } catch (e) {
      montrer('draukhain-erreur');
      return false;
    }
    // Fail-closed : une 401 ferme tout.
    if (reponse.status === 401) {
      montrer('draukhain-auth');
      return false;
    }
    var contenu = null;
    try { contenu = await reponse.json(); } catch (e) { contenu = null; }

    if (!reponse.ok || !contenu || contenu.ok !== true) {
      montrer('draukhain-erreur');
      return false;
    }
    etat.serments = (contenu.data && contenu.data.serments) || [];
    etat.flammes = (contenu.data && contenu.data.flammes) || [];
    etat.liens = (contenu.data && contenu.data.liens) || [];
    etat.futurs = (contenu.data && contenu.data.futurs) || [];

    // Cibles des passerelles (idéaux ZEKROM + pages MINETHNIR) : enrichissement
    // pour résoudre les libellés et peupler les pickers. Chargées APRÈS le check
    // 401 du registre : leur échec ne bloque jamais le rendu des serments.
    await chargerCibles();

    // Le registre se montre AVANT de dessiner : la voûte MESURE ses étiquettes
    // (getBBox), et une mesure prise dans un conteneur `hidden` vaut zéro —
    // elle rabotait chaque nom jusqu'au vide. Une géométrie ne se mesure que
    // sur une page effectivement mise en page.
    montrer('draukhain-registre');
    rendreSerments();
    rendreVoute();
    rendreFoyer();
    accueillirLeo();
    return true;
  }

  // ---------- Léo sur DRAUKHAIN (boucle ④, 2026-07-30) ----------
  // Le cartouche du majordome + ses MAINS sur le cap : Paul dicte « ravive tel
  // serment avec… » ou « scelle le serment… », Léo propose, Paul confirme,
  // l'écriture part vers les API existantes avec le Bearer de session.
  // Fail-closed : pas de module, pas de session → rien du tout.
  // §5 intime : le cartouche ne restitue que des COMPTES, jamais un contenu.
  function accueillirLeo() {
    if (!window.UltimaLeo || !etat.session || !etat.session.access_token) { return; }
    var total = etat.serments.length;
    var aRaviver = etat.serments.filter(function (s) { return s && s.a_raviver === true; }).length;
    var etatCarte = total === 0
      ? 'Aucun serment scellé pour l’instant.'
      : (total === 1 ? '1 serment scellé' : total + ' serments scellés')
        + (aRaviver > 0
          ? ' — ' + (aRaviver === 1 ? '1 attend' : aRaviver + ' attendent') + ' d’être ravivé'
            + (aRaviver === 1 ? '' : 's') + '.'
          : ', tous entretenus.');

    var propositions = [];
    if (aRaviver > 0) {
      propositions.push({
        message: 'Ravive un serment : une citation, une victoire, un rappel — dicte-le-moi.',
        action: null
      });
    }
    propositions.push({
      message: 'Sceller un nouveau serment ? Dicte-le-moi, je te le propose avant d’écrire.',
      action: null
    });

    window.UltimaLeo.accueillirQuadrant({
      quadrant: 'imladrik',
      blason: 'epee',
      salutation: 'Bienvenue, Paul. Voici l’état de tes serments.',
      sections: [
        { titre: 'Où on en est', classe: 'leo-section-etat', lignes: [etatCarte] }
      ],
      propositions: propositions,
      propositionsVide: 'Rien à raviver aujourd’hui — ta parole tient.',
      // Les mains : candidats de résolution des serments dictés (id + libellé
      // seuls — aucun contenu de flamme ne quitte la page).
      voix: {
        quadrant: 'imladrik',
        jeton: etat.session.access_token,
        candidats: {
          serments: etat.serments.map(function (s) {
            return { id: s.id, libelle: (s.intitule || '').trim() };
          })
        },
        // Les yeux de Léo : de quoi répondre « où j'en suis » sur ce cap.
        // Comptes + INTITULÉS (ceux que Paul nomme lui-même quand il dicte) —
        // jamais le texte d'une flamme, jamais un identifiant.
        etat: {
          compteurs: {
            'serments scellés': total,
            'serments à raviver': aRaviver,
            'flammes vivantes': etat.flammes.length
          },
          listes: {
            'Les serments de Paul (cap DRAUKHAIN)': etat.serments
              .slice(0, 40)
              .map(function (s) {
                var item = { libelle: (s.intitule || '').trim() };
                if (s.a_raviver === true) { item.marque = 'à raviver'; }
                else { item.marque = libelleCompte(flammesDe(s.id).length); }
                return item;
              })
              .filter(function (i) { return Boolean(i.libelle); })
          }
        }
      }
    });
  }

  // Lit /api/ideaux (ZEKROM) et /api/imladrik (MINETHNIR) en parallèle. Toute
  // panne (table absente, erreur, réseau) → tables vides = libellés neutres et
  // pickers vides, sans jamais empêcher l'affichage des serments (§5, fail-soft).
  async function chargerCibles() {
    indexerCibles([], []);
    var repIdeaux, repPages;
    try {
      var res = await Promise.all([lireJson('/api/ideaux'), lireJson('/api/imladrik')]);
      repIdeaux = res[0];
      repPages = res[1];
    } catch (e) {
      return;
    }
    var cIdeaux = null, cPages = null;
    try { cIdeaux = await repIdeaux.json(); } catch (e) { cIdeaux = null; }
    try { cPages = await repPages.json(); } catch (e) { cPages = null; }
    var ideaux = (repIdeaux.ok && cIdeaux && cIdeaux.ok === true &&
      cIdeaux.data && cIdeaux.data.ideaux) || [];
    var entrees = (repPages.ok && cPages && cPages.ok === true &&
      cPages.data && cPages.data.entrees) || [];
    indexerCibles(ideaux, entrees);
  }

  async function rafraichir() {
    await chargerRegistre();
  }

  function brancherFormulaires() {
    var retourFoyer = document.getElementById('draukhain-foyer-retour');
    if (retourFoyer) { retourFoyer.addEventListener('click', fermerFoyer); }
    var formSerment = document.getElementById('draukhain-form-serment');
    if (formSerment) {
      formSerment.addEventListener('submit', function (e) {
        e.preventDefault();
        soumettreSerment(formSerment);
      });
    }
    var bTous = document.getElementById('draukhain-vue-tous');
    var bVivants = document.getElementById('draukhain-vue-vivants');
    if (bTous) { bTous.addEventListener('click', function () { poserVue('tous'); }); }
    if (bVivants) { bVivants.addEventListener('click', function () { poserVue('vivants'); }); }
  }

  async function demarrer() {
    montrer('draukhain-chargement');
    brancherFormulaires();
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('draukhain-auth');
      return;
    }
    var cfg = window.ULTIMA_CONFIG;
    var session = null;
    try {
      var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      var resultat = await client.auth.getSession();
      session = (resultat && resultat.data && resultat.data.session) || null;
    } catch (e) {
      session = null;
    }
    if (!session || !session.access_token) {
      montrer('draukhain-auth');
      return;
    }
    etat.session = session;
    await chargerRegistre();
  }

  // Fonctions pures exposées pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaDraukhain = {
    sermentsVisibles: sermentsVisibles,
    nomCourt: nomCourt,
    etiquetteFlamme: etiquetteFlamme,
    couronne: couronne,
    couronneVoute: couronneVoute,
    eclat: eclat
  };

  demarrer().catch(function () { montrer('draukhain-erreur'); });
})();
