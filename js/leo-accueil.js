// Ultima — Léo, cartouche d'accueil du quadrant TRAVELER (boucle L1).
// Le majordome « muet mais juste » : à l'entrée dans l'app, un cartouche au
// registre antique récapitule l'état DÉJÀ CHARGÉ par js/app.js (nœuds,
// relations, journal) avec des règles déterministes — les mêmes que l'onglet
// Accueil (relances dues, idée dormante U9). AUCUNE IA, aucun appel réseau,
// aucun coût : le cartouche se nourrit de l'état, jamais d'un second fetch.
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var CLE_SESSION = 'ultima-leo-accueil-vu';
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

  // ---------- Rendu du cartouche (createElement/textContent uniquement) ----------

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

  // Blason boussole du quadrant TRAVELER (repris du sceau de la console),
  // muet : le nom « Léo » est porté par le titre du cartouche.
  function svgBoussole() {
    var svg = svgEl('svg', {
      'class': 'leo-blason', viewBox: '0 0 72 72', 'aria-hidden': 'true', focusable: 'false'
    });
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '33', fill: '#f9f1dc', stroke: '#a9884a', 'stroke-width': '2.4' }));
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '28.5', fill: 'none', stroke: '#5a4118', 'stroke-width': '1' }));
    svg.appendChild(svgEl('path', {
      d: 'M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z', fill: '#3b2f1c'
    }));
    var traits = svgEl('g', { stroke: '#5a4118', 'stroke-width': '1.3', 'stroke-linecap': 'round' });
    traits.appendChild(svgEl('path', { d: 'M36 36 L50 22 M36 36 L50 50 M36 36 L22 50 M36 36 L22 22' }));
    svg.appendChild(traits);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '2.4', fill: '#f9f1dc', stroke: '#5a4118', 'stroke-width': '1' }));
    return svg;
  }

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

  // Ouvre le cartouche. `donnees` = { noeuds, relations, journal } (l'état
  // déjà chargé par app.js) ; `actions.ouvrirCible(nodeId)` mène à la fiche.
  // Une fois par session de navigation (sessionStorage) ; fail-closed :
  // pas de données ou stockage indisponible → pas de cartouche, en silence.
  function accueillir(donnees, actions) {
    actions = actions || {};
    if (!donnees || !Array.isArray(donnees.noeuds) || donnees.noeuds.length === 0) { return; }
    try {
      if (window.sessionStorage.getItem(CLE_SESSION)) { return; }
      window.sessionStorage.setItem(CLE_SESSION, '1');
    } catch (e) {
      return; // stockage indisponible (navigation privée stricte) : fail-closed
    }

    var recap = calculerRecap(donnees);
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

    // En-tête : blason boussole + « Léo » + salutation sobre.
    var entete = el('header', 'leo-entete');
    entete.appendChild(svgBoussole());
    var titres = el('div', 'leo-titres');
    var titre = el('h2', 'leo-titre', 'Léo');
    titre.id = 'leo-titre';
    titres.appendChild(titre);
    titres.appendChild(el('p', 'leo-salutation', 'Bienvenue, Paul. Voici où nous en sommes.'));
    entete.appendChild(titres);
    cartouche.appendChild(entete);

    // 1. Où on en est : la dernière note du journal.
    var sectionEtat = el('section', 'leo-section leo-section-etat');
    sectionEtat.appendChild(sousTitre('Où on en est'));
    if (recap.dernierJournal) {
      var pJournal = el('p', 'leo-journal');
      pJournal.appendChild(el('span', 'leo-journal-date',
        'Le ' + dateLisible(recap.dernierJournal.date) + ' — '));
      pJournal.appendChild(document.createTextNode('« ' + recap.dernierJournal.note + ' »'));
      pJournal.appendChild(el('span', 'leo-journal-cible', ' (' + recap.dernierJournal.cible + ')'));
      sectionEtat.appendChild(pJournal);
    } else {
      sectionEtat.appendChild(el('p', 'leo-vide', 'Aucune note au journal pour l’instant.'));
    }
    cartouche.appendChild(sectionEtat);

    // 2. Travaux en cours : relances dues + leads à suivre.
    var sectionTravaux = el('section', 'leo-section leo-section-travaux');
    sectionTravaux.appendChild(sousTitre('Travaux en cours'));
    var listeTravaux = el('ul', 'leo-travaux');
    lignesTravaux(recap).forEach(function (ligne) {
      listeTravaux.appendChild(el('li', 'leo-travail', ligne));
    });
    sectionTravaux.appendChild(listeTravaux);
    cartouche.appendChild(sectionTravaux);

    // 3. Propositions (1-3, déterministes) : chacune mène à la fiche visée.
    var sectionPropositions = el('section', 'leo-section leo-section-propositions');
    sectionPropositions.appendChild(sousTitre('Propositions'));
    if (recap.propositions.length === 0) {
      sectionPropositions.appendChild(el('p', 'leo-vide',
        "Rien d'urgent aujourd'hui — votre réseau est à jour."));
    } else {
      var liste = el('ul', 'leo-propositions');
      recap.propositions.forEach(function (proposition) {
        var item = el('li');
        var bouton = el('button', 'leo-proposition', proposition.message);
        bouton.type = 'button';
        bouton.addEventListener('click', function () {
          fermer();
          if (proposition.nodeId && typeof actions.ouvrirCible === 'function') {
            actions.ouvrirCible(proposition.nodeId);
          }
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

  window.UltimaLeo = {
    calculerRecap: calculerRecap,
    accueillir: accueillir
  };
})();
