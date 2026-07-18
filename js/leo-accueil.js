// Ultima — Léo, cartouche d'accueil des quadrants (boucles L1 puis diffusion).
// Le majordome « muet mais juste » : à l'entrée dans un quadrant, un cartouche
// au registre antique récapitule l'état avec des règles déterministes. AUCUNE
// IA, aucun appel réseau, aucun coût : le cartouche se nourrit de l'état déjà
// chargé par la page, jamais d'un second fetch.
//
// Deux entrées publiques :
//   - accueillir(donnees, actions)  — TRAVELER, comportement historique intact
//     (clé sessionStorage d'origine, mêmes règles, même DOM) ;
//   - accueillirQuadrant({quadrant, blason, salutation, sections,
//     propositions}) — le même rendu (dialog accessible, une fois par session
//     PAR quadrant, focus piégé, Échap, fail-closed) pour les autres
//     quadrants ; le CALCUL du récap reste à la charge de chaque quadrant.
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var CLE_SESSION = 'ultima-leo-accueil-vu'; // TRAVELER — clé historique, gardée
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---------- Fonctions PURES (testables via window.UltimaLeo) ----------

  // Date locale au format ISO 'YYYY-MM-DD' (même règle que js/app.js).
  function dateLocaleIso() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // Écart en jours entre une échéance ISO et aujourd'hui (positif = retard).
  function joursDeRetard(echeanceIso, aujourdHuiIso) {
    var a = new Date(echeanceIso + 'T00:00:00');
    var b = new Date(aujourdHuiIso + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function tronquer(texte, max) {
    texte = texte || '';
    return texte.length > max ? texte.slice(0, max) + '…' : texte;
  }

  // 'YYYY-MM-DD' → 'JJ/MM/AAAA' (même forme que dateLisible de js/app.js).
  function dateLisible(iso) {
    if (!iso) { return ''; }
    var morceaux = iso.split('-');
    return morceaux.length === 3 ? morceaux[2] + '/' + morceaux[1] + '/' + morceaux[0] : iso;
  }

  function trouverNoeud(donnees, id) {
    return (donnees.noeuds || []).find(function (n) { return n.id === id; }) || null;
  }

  function nomNoeud(donnees, id) {
    var noeud = trouverNoeud(donnees, id);
    return (noeud && noeud.nom) || 'nœud supprimé';
  }

  function trouverRelation(donnees, id) {
    return (donnees.relations || []).find(function (r) { return r.id === id; }) || null;
  }

  // Libellé court de la cible d'une entrée (même règle que libelleCibleEntree).
  function libelleCible(donnees, entree) {
    if (entree.node_id) { return nomNoeud(donnees, entree.node_id); }
    var relation = trouverRelation(donnees, entree.edge_id);
    if (!relation) { return 'nœud supprimé'; }
    return nomNoeud(donnees, relation.source_id) + ' ↔ ' + nomNoeud(donnees, relation.target_id);
  }

  // Nœud à ouvrir pour une relation : source, repli cible (même règle qu'app.js).
  function noeudCibleRelation(donnees, relation) {
    if (trouverNoeud(donnees, relation.source_id)) { return relation.source_id; }
    if (trouverNoeud(donnees, relation.target_id)) { return relation.target_id; }
    return null;
  }

  function noeudCibleEntree(donnees, entree) {
    if (entree.node_id && trouverNoeud(donnees, entree.node_id)) { return entree.node_id; }
    var relation = trouverRelation(donnees, entree.edge_id);
    return relation ? noeudCibleRelation(donnees, relation) : null;
  }

  // Tri des relances : échéance la plus ancienne d'abord (règle de l'Accueil).
  function trierRelances(a, b) {
    if (a.relance_at !== b.relance_at) { return a.relance_at < b.relance_at ? -1 : 1; }
    var da = a.date_entree || '';
    var db = b.date_entree || '';
    return da < db ? -1 : (da > db ? 1 : 0);
  }

  // Récapitulatif déterministe de Léo, calculé sur l'état chargé (PUR : aucune
  // lecture du DOM ni du réseau). `aujourdHui` est injectable pour les tests.
  // → { dernierJournal, retard, duJour, leadsActifs, propositions }
  function calculerRecap(donnees, aujourdHui) {
    donnees = donnees || {};
    var journal = donnees.journal || [];
    var noeuds = donnees.noeuds || [];
    var relations = donnees.relations || [];
    aujourdHui = aujourdHui || dateLocaleIso();

    // Où on en est : la dernière entrée de journal.
    var derniere = null;
    journal.forEach(function (j) {
      if (!derniere || (j.date_entree || '') > (derniere.date_entree || '')) { derniere = j; }
    });
    var dernierJournal = derniere ? {
      date: derniere.date_entree || '',
      note: tronquer(derniere.note || '', 140),
      cible: libelleCible(donnees, derniere)
    } : null;

    // Relances dues (mêmes règles que relancesDues de l'Accueil), scindées
    // en « en retard » (strictement avant aujourd'hui) et « du jour ».
    var dues = journal.filter(function (j) {
      return j.relance_at && j.relance_at <= aujourdHui && !j.relance_faite;
    }).sort(trierRelances);
    var enRetard = dues.filter(function (j) { return j.relance_at < aujourdHui; });
    var duJour = dues.filter(function (j) { return j.relance_at === aujourdHui; });

    // Leads à suivre : type lead, ni terminé ni inactif.
    var leadsActifs = noeuds.filter(function (n) {
      return n.type === 'lead' && n.statut !== 'termine' && n.statut !== 'inactif';
    }).length;

    // Propositions (1-3), priorisées et déterministes.
    var propositions = [];

    // 1. La relance la plus en retard.
    if (enRetard.length > 0) {
      var pire = enRetard[0];
      var retardJours = joursDeRetard(pire.relance_at, aujourdHui);
      propositions.push({
        genre: 'retard',
        message: 'Relancer « ' + libelleCible(donnees, pire) + ' » — en retard de ' +
          retardJours + (retardJours > 1 ? ' jours.' : ' jour.'),
        nodeId: noeudCibleEntree(donnees, pire)
      });
    }

    // 2. La relance du jour.
    if (duJour.length > 0 && propositions.length < 3) {
      var jour = duJour[0];
      var etape = jour.prochaine_etape || tronquer(jour.note || '', 80);
      propositions.push({
        genre: 'jour',
        message: "Aujourd'hui : « " + etape + ' » (' + libelleCible(donnees, jour) + ').',
        nodeId: noeudCibleEntree(donnees, jour)
      });
    }

    // 3. Idée dormante (règle U9 de l'Accueil : statut « idée », aucune
    //    entrée de journal depuis 14 jours).
    if (propositions.length < 3) {
      var seuil = new Date(aujourdHui + 'T00:00:00');
      seuil.setDate(seuil.getDate() - 14);
      var seuilIso = seuil.getFullYear() + '-' +
        String(seuil.getMonth() + 1).padStart(2, '0') + '-' +
        String(seuil.getDate()).padStart(2, '0');
      var dormantes = relations.filter(function (r) {
        if (r.statut !== 'idee') { return false; }
        return !journal.some(function (j) {
          return j.edge_id === r.id && j.date_entree >= seuilIso;
        });
      }).sort(function (a, b) {
        return nomNoeud(donnees, a.source_id).localeCompare(nomNoeud(donnees, b.source_id), 'fr');
      });
      if (dormantes.length > 0) {
        var dormante = dormantes[0];
        propositions.push({
          genre: 'dormante',
          message: "L'idée « " + nomNoeud(donnees, dormante.source_id) + ' ↔ ' +
            nomNoeud(donnees, dormante.target_id) + ' » dort depuis plus de 14 jours.',
          nodeId: noeudCibleRelation(donnees, dormante)
        });
      }
    }

    return {
      dernierJournal: dernierJournal,
      retard: enRetard.length,
      duJour: duJour.length,
      leadsActifs: leadsActifs,
      propositions: propositions.slice(0, 3)
    };
  }

  // ---------- Briques DOM (createElement/textContent uniquement) ----------

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte) { element.textContent = texte; }
    return element;
  }

  function svgEl(nom, attributs) {
    var element = document.createElementNS(SVG_NS, nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      element.setAttribute(cle, attributs[cle]);
    });
    return element;
  }

  // ---------- Blasons des quadrants (repris des emblèmes de la console),
  // muets : le nom « Léo » est porté par le titre du cartouche. ----------

  function socleBlason() {
    var svg = svgEl('svg', {
      'class': 'leo-blason', viewBox: '0 0 72 72', 'aria-hidden': 'true', focusable: 'false'
    });
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '33', fill: '#f9f1dc', stroke: '#a9884a', 'stroke-width': '2.4' }));
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '28.5', fill: 'none', stroke: '#5a4118', 'stroke-width': '1' }));
    return svg;
  }

  // TRAVELER : la boussole.
  function svgBoussole() {
    var svg = socleBlason();
    svg.appendChild(svgEl('path', {
      d: 'M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z', fill: '#3b2f1c'
    }));
    var traits = svgEl('g', { stroke: '#5a4118', 'stroke-width': '1.3', 'stroke-linecap': 'round' });
    traits.appendChild(svgEl('path', { d: 'M36 36 L50 22 M36 36 L50 50 M36 36 L22 50 M36 36 L22 22' }));
    svg.appendChild(traits);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '2.4', fill: '#f9f1dc', stroke: '#5a4118', 'stroke-width': '1' }));
    return svg;
  }

  // ADRAMELECH : l'ouroboros ailé (mêmes tracés que le blason de la console).
  function svgOuroboros() {
    var svg = socleBlason();
    var aile = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '1.4', 'stroke-linejoin': 'round' });
    aile.appendChild(svgEl('path', {
      d: 'M30 24.5 C 26.5 17.5, 21 12.8, 13.5 12.3 C 15.7 15.2, 15.1 17.8, 12.8 19.6 ' +
         'C 16.3 20, 18.4 22.2, 17.6 25.3 C 20.7 24.3, 23.6 25.7, 25 28.6 ' +
         'C 26.5 26.5, 28.3 25.3, 30 25.5 Z'
    }));
    svg.appendChild(aile);
    var nervures = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '0.9', opacity: '0.85' });
    nervures.appendChild(svgEl('path', { d: 'M29.4 24.8 C 25 20.6, 19.8 16.2, 14.4 13.8' }));
    nervures.appendChild(svgEl('path', { d: 'M29.4 25.4 C 24.6 22.8, 19.4 20.8, 13.8 19.8' }));
    svg.appendChild(nervures);
    svg.appendChild(svgEl('path', {
      d: 'M34.78 22.05 A14 14 0 1 0 37.22 22.05',
      fill: 'none', stroke: '#3b2f1c', 'stroke-width': '3', 'stroke-linecap': 'round'
    }));
    svg.appendChild(svgEl('path', { d: 'M37.2 20.9 L41.2 23 L37.6 23.7 Z', fill: '#3b2f1c' }));
    svg.appendChild(svgEl('path', {
      d: 'M31.4 21.8 C 32.4 19.5, 35.4 18.7, 38 19.9 L 40.6 21.3 L 38.8 22.1 ' +
         'L 40.4 23.5 L 36.8 23.9 C 33.9 24.3, 31.9 23.4, 31.4 21.8 Z',
      fill: '#3b2f1c'
    }));
    svg.appendChild(svgEl('path', { d: 'M32.8 20.2 L 33.6 17.4 L 34.9 19.8 Z', fill: '#3b2f1c' }));
    svg.appendChild(svgEl('circle', { cx: '34.3', cy: '21.3', r: '0.9', fill: '#e0c48a' }));
    svg.appendChild(svgEl('path', {
      d: 'M43 47.5 A14 14 0 0 0 49.8 39',
      fill: 'none', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.6'
    }));
    return svg;
  }

  // BCP : la balance.
  function svgBalance() {
    var svg = socleBlason();
    var traits = svgEl('g', {
      stroke: '#5a4118', 'stroke-width': '1.9', fill: 'none',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    traits.appendChild(svgEl('path', { d: 'M36 22 V49' }));
    traits.appendChild(svgEl('path', { d: 'M20 27 H52' }));
    traits.appendChild(svgEl('path', { d: 'M28 51 Q36 47.5 44 51' }));
    traits.appendChild(svgEl('path', { d: 'M22 27 L17 37 M22 27 L27 37 M15 37 Q22 45 29 37' }));
    traits.appendChild(svgEl('path', { d: 'M50 27 L45 37 M50 27 L55 37 M43 37 Q50 45 57 37' }));
    svg.appendChild(traits);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '22', r: '2.6', fill: '#3b2f1c' }));
    return svg;
  }

  // IMLADRIK : l'épée dressée devant le soleil.
  function svgEpee() {
    var svg = socleBlason();
    var soleil = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '1.6' });
    soleil.appendChild(svgEl('circle', { cx: '36', cy: '29', r: '9.5' }));
    soleil.appendChild(svgEl('path', { d: 'M20.5 29 H 24.5' }));
    soleil.appendChild(svgEl('path', { d: 'M47.5 29 H 51.5' }));
    soleil.appendChild(svgEl('path', { d: 'M25.2 18.2 l 2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M43.9 36.9 l 2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M46.8 18.2 l -2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M28.1 36.9 l -2.9 2.9' }));
    svg.appendChild(soleil);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '29', r: '6.5', fill: 'none', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.7' }));
    var epee = svgEl('g', { fill: '#3b2f1c' });
    epee.appendChild(svgEl('path', { d: 'M36 11.5 L38.2 16.5 L38.2 48 L33.8 48 L33.8 16.5 Z' }));
    epee.appendChild(svgEl('rect', { x: '26.5', y: '48', width: '19', height: '3.4', rx: '1.7' }));
    epee.appendChild(svgEl('rect', { x: '34.2', y: '51.4', width: '3.6', height: '7' }));
    epee.appendChild(svgEl('circle', { cx: '36', cy: '61', r: '2.9' }));
    svg.appendChild(epee);
    svg.appendChild(svgEl('path', { d: 'M36 15.5 V 46.5', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.7' }));
    return svg;
  }

  var BLASONS = {
    boussole: svgBoussole,
    ouroboros: svgOuroboros,
    balance: svgBalance,
    epee: svgEpee
  };

  function sousTitre(texte) {
    return el('h3', 'leo-sous-titre', texte);
  }

  // Phrase des travaux en cours, toujours dessinée (états vides compris).
  function lignesTravaux(recap) {
    var lignes = [];
    if (recap.retard > 0) {
      lignes.push(recap.retard + (recap.retard > 1 ? ' relances en retard' : ' relance en retard'));
    }
    if (recap.duJour > 0) {
      lignes.push(recap.duJour + (recap.duJour > 1 ? " relances aujourd'hui" : " relance aujourd'hui"));
    }
    if (lignes.length === 0) {
      lignes.push('Aucune relance en attente');
    }
    lignes.push(recap.leadsActifs > 0
      ? recap.leadsActifs + (recap.leadsActifs > 1 ? ' leads à suivre' : ' lead à suivre')
      : 'Aucun lead en cours');
    return lignes;
  }

  // ---------- Rendu COMMUN du cartouche (tous quadrants) ----------
  // config = {
  //   cleSession   : clé sessionStorage « déjà vu » (distincte par quadrant),
  //   blason       : 'boussole' | 'ouroboros' | 'balance' | 'epee',
  //   salutation   : phrase d'accueil,
  //   sections     : [{ titre, classe?, noeud? | lignes? | vide? }],
  //   propositions : [{ message, action? }] (l'action s'exécute après fermeture),
  //   propositionsVide : texte de l'état vide de la section Propositions.
  // }
  // Une fois par session de navigation (sessionStorage) ; fail-closed :
  // stockage indisponible ou config invalide → pas de cartouche, en silence.
  function ouvrirCartouche(config) {
    config = config || {};
    if (!config.cleSession || !Array.isArray(config.sections)) { return; }
    try {
      if (window.sessionStorage.getItem(config.cleSession)) { return; }
      window.sessionStorage.setItem(config.cleSession, '1');
    } catch (e) {
      return; // stockage indisponible (navigation privée stricte) : fail-closed
    }

    var focusAvant = document.activeElement;

    var voile = el('div', 'leo-voile');
    var cartouche = el('div', 'leo-cartouche');
    cartouche.id = 'leo-cartouche';
    cartouche.setAttribute('role', 'dialog');
    cartouche.setAttribute('aria-modal', 'true');
    cartouche.setAttribute('aria-labelledby', 'leo-titre');

    function fermer() {
      document.removeEventListener('keydown', surTouche, true);
      voile.remove();
      if (focusAvant && typeof focusAvant.focus === 'function' &&
          document.contains(focusAvant)) {
        focusAvant.focus();
      }
    }

    // Échap ferme ; Tab reste piégé dans le cartouche (aria-modal).
    function surTouche(evenement) {
      if (evenement.key === 'Escape') {
        evenement.stopPropagation(); // l'app derrière ne réagit pas
        fermer();
        return;
      }
      if (evenement.key !== 'Tab') { return; }
      var focusables = cartouche.querySelectorAll('button');
      if (focusables.length === 0) { return; }
      var premier = focusables[0];
      var dernier = focusables[focusables.length - 1];
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      } else if (!cartouche.contains(document.activeElement)) {
        evenement.preventDefault();
        premier.focus();
      }
    }

    // En-tête : blason du quadrant + « Léo » + salutation sobre.
    var entete = el('header', 'leo-entete');
    var blason = BLASONS[config.blason] || svgBoussole;
    entete.appendChild(blason());
    var titres = el('div', 'leo-titres');
    var titre = el('h2', 'leo-titre', 'Léo');
    titre.id = 'leo-titre';
    titres.appendChild(titre);
    titres.appendChild(el('p', 'leo-salutation', config.salutation || 'Bienvenue, Paul.'));
    entete.appendChild(titres);
    cartouche.appendChild(entete);

    // Sections fournies par le quadrant (contenu déjà calculé, jamais fetché ici).
    config.sections.forEach(function (section) {
      var bloc = el('section', 'leo-section' + (section.classe ? ' ' + section.classe : ''));
      bloc.appendChild(sousTitre(section.titre || ''));
      if (section.noeud) {
        bloc.appendChild(section.noeud);
      } else if (Array.isArray(section.lignes)) {
        var liste = el('ul', 'leo-travaux');
        section.lignes.forEach(function (ligne) {
          liste.appendChild(el('li', 'leo-travail', ligne));
        });
        bloc.appendChild(liste);
      } else {
        bloc.appendChild(el('p', 'leo-vide', section.vide || '—'));
      }
      cartouche.appendChild(bloc);
    });

    // Propositions (déterministes) : chacune ferme, puis mène à sa cible.
    var propositions = Array.isArray(config.propositions) ? config.propositions : [];
    var sectionPropositions = el('section', 'leo-section leo-section-propositions');
    sectionPropositions.appendChild(sousTitre('Propositions'));
    if (propositions.length === 0) {
      sectionPropositions.appendChild(el('p', 'leo-vide',
        config.propositionsVide || "Rien d'urgent aujourd'hui."));
    } else {
      var liste = el('ul', 'leo-propositions');
      propositions.forEach(function (proposition) {
        var item = el('li');
        var bouton = el('button', 'leo-proposition', proposition.message);
        bouton.type = 'button';
        bouton.addEventListener('click', function () {
          fermer();
          if (typeof proposition.action === 'function') { proposition.action(); }
        });
        item.appendChild(bouton);
        liste.appendChild(item);
      });
      sectionPropositions.appendChild(liste);
    }
    cartouche.appendChild(sectionPropositions);

    // Pied : fermeture (focus initial dessus).
    var pied = el('footer', 'leo-pied');
    var partir = el('button', 'leo-partir', "C'est parti");
    partir.type = 'button';
    partir.id = 'leo-partir';
    partir.addEventListener('click', fermer);
    pied.appendChild(partir);
    cartouche.appendChild(pied);

    voile.addEventListener('click', function (evenement) {
      if (evenement.target === voile) { fermer(); }
    });
    document.addEventListener('keydown', surTouche, true);

    voile.appendChild(cartouche);
    document.body.appendChild(voile);
    partir.focus();
  }

  // ---------- TRAVELER (comportement historique, inchangé) ----------

  // Ouvre le cartouche. `donnees` = { noeuds, relations, journal } (l'état
  // déjà chargé par app.js) ; `actions.ouvrirCible(nodeId)` mène à la fiche.
  // Fail-closed : pas de données → pas de cartouche, en silence.
  function accueillir(donnees, actions) {
    actions = actions || {};
    if (!donnees || !Array.isArray(donnees.noeuds) || donnees.noeuds.length === 0) { return; }

    var recap = calculerRecap(donnees);

    // 1. Où on en est : la dernière note du journal.
    var noeudEtat;
    if (recap.dernierJournal) {
      noeudEtat = el('p', 'leo-journal');
      noeudEtat.appendChild(el('span', 'leo-journal-date',
        'Le ' + dateLisible(recap.dernierJournal.date) + ' — '));
      noeudEtat.appendChild(document.createTextNode('« ' + recap.dernierJournal.note + ' »'));
      noeudEtat.appendChild(el('span', 'leo-journal-cible', ' (' + recap.dernierJournal.cible + ')'));
    } else {
      noeudEtat = el('p', 'leo-vide', 'Aucune note au journal pour l’instant.');
    }

    ouvrirCartouche({
      cleSession: CLE_SESSION,
      blason: 'boussole',
      salutation: 'Bienvenue, Paul. Voici où nous en sommes.',
      sections: [
        { titre: 'Où on en est', classe: 'leo-section-etat', noeud: noeudEtat },
        { titre: 'Travaux en cours', classe: 'leo-section-travaux', lignes: lignesTravaux(recap) }
      ],
      propositions: recap.propositions.map(function (proposition) {
        return {
          message: proposition.message,
          action: (proposition.nodeId && typeof actions.ouvrirCible === 'function')
            ? function () { actions.ouvrirCible(proposition.nodeId); }
            : null
        };
      }),
      propositionsVide: "Rien d'urgent aujourd'hui — votre réseau est à jour."
    });
  }

  // ---------- Les autres quadrants (diffusion Léo) ----------

  // accueillirQuadrant({ quadrant, blason, salutation, sections, propositions,
  // propositionsVide }) : rendu commun, clé sessionStorage distincte par
  // quadrant. Le contenu (sections/propositions) est calculé par le quadrant
  // appelant — jamais ici. Fail-closed sur config invalide.
  function accueillirQuadrant(options) {
    options = options || {};
    if (!options.quadrant || typeof options.quadrant !== 'string') { return; }
    ouvrirCartouche({
      cleSession: CLE_SESSION + '-' + options.quadrant,
      blason: options.blason,
      salutation: options.salutation,
      sections: Array.isArray(options.sections) ? options.sections : [],
      propositions: options.propositions,
      propositionsVide: options.propositionsVide
    });
  }

  window.UltimaLeo = {
    calculerRecap: calculerRecap,
    accueillir: accueillir,
    accueillirQuadrant: accueillirQuadrant
  };
})();
