// Ultima — état applicatif, données (démo ou API), fiche, formulaires.
// Règle : tout contenu dynamique est injecté via textContent (jamais innerHTML).
(function () {
  'use strict';

  var TYPES = ['artisan', 'partenaire', 'lead', 'chantier'];
  var STATUTS = ['actif', 'prospect', 'en_cours', 'termine', 'inactif'];

  var LIBELLES_TYPE = {
    artisan: 'Artisan',
    partenaire: 'Partenaire',
    lead: 'Lead',
    chantier: 'Chantier'
  };

  var LIBELLES_STATUT = {
    actif: 'Actif',
    prospect: 'Prospect',
    en_cours: 'En cours',
    termine: 'Terminé',
    inactif: 'Inactif'
  };

  var LIBELLES_RELATION = {
    apport_affaires: "Apport d'affaires",
    sous_traitance: 'Sous-traitance',
    chantier_commun: 'Chantier commun'
  };

  // Cycle de vie d'un rapprochement (hybride v1×v2).
  var STATUTS_RELATION = ['idee', 'contact_etabli', 'en_cours', 'fructueux', 'arrete'];
  var LIBELLES_STATUT_RELATION = {
    idee: 'Idée',
    contact_etabli: 'Contact établi',
    en_cours: 'En cours',
    fructueux: 'Fructueux',
    arrete: 'Arrêté'
  };

  var etat = {
    noeuds: [],
    relations: [],
    journal: [],
    filtres: { types: new Set(TYPES), statuts: new Set(STATUTS) },
    modeDemo: true,
    client: null,        // client supabase-js (mode connecté)
    session: null,
    onglet: 'accueil',   // espace actif : accueil | carte | contacts
    noeudCourant: null,  // id du nœud affiché dans la fiche
    noeudEnEdition: null // id du nœud en cours d'édition dans le formulaire
  };

  function $(selecteur) { return document.querySelector(selecteur); }

  // Date locale au format ISO 'YYYY-MM-DD', décalée de N jours (0 = aujourd'hui).
  function dateLocaleIso(decalageJours) {
    var d = new Date();
    d.setDate(d.getDate() + (decalageJours || 0));
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // Écart en jours entre une échéance ISO et aujourd'hui (positif = en retard).
  function joursDeRetard(echeanceIso, aujourdHuiIso) {
    var a = new Date(echeanceIso + 'T00:00:00');
    var b = new Date(aujourdHuiIso + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function tronquer(texte, max) {
    texte = texte || '';
    return texte.length > max ? texte.slice(0, max) + '…' : texte;
  }

  // ---------- Jeu de démo (config Supabase vide) ----------

  function donneesDemo() {
    var noeuds = [
      { id: 'demo-n1', type: 'artisan', nom: 'Menuiserie Delcourt', ville: 'Lille', adresse: '12 rue Nationale', telephone: '03 20 55 41 20', email: 'contact@menuiserie-delcourt.fr', statut: 'actif', lat: 50.6292, lng: 3.0573, notes: 'Menuiserie bois et alu. Très fiable sur les délais.' },
      { id: 'demo-n2', type: 'artisan', nom: 'Plomberie Roux & Fils', ville: 'Lyon', adresse: '8 quai Saint-Vincent', telephone: '04 78 30 12 45', email: 'contact@plomberie-roux.fr', statut: 'actif', lat: 45.764, lng: 4.8357, notes: 'Chauffage et sanitaire. Disponible sous 48 h.' },
      { id: 'demo-n3', type: 'artisan', nom: 'Élec Ferrand', ville: 'Nantes', adresse: '25 rue de Strasbourg', telephone: '02 40 47 89 12', email: 'ferrand.elec@orange.fr', statut: 'prospect', lat: 47.2184, lng: -1.5536, notes: 'Rencontré au salon Habitat. À rappeler.' },
      { id: 'demo-n4', type: 'partenaire', nom: 'Agence Habitat Sud', ville: 'Marseille', adresse: '4 la Canebière', telephone: '04 91 54 22 10', email: 'contact@habitat-sud.fr', statut: 'actif', lat: 43.2965, lng: 5.3698, notes: 'Agence immobilière, apporte des dossiers de rénovation.' },
      { id: 'demo-n5', type: 'partenaire', nom: 'Courtage Bâti Ouest', ville: 'Rennes', adresse: '2 place de Bretagne', telephone: '02 99 78 34 56', email: 'contact@bati-ouest.fr', statut: 'actif', lat: 48.1173, lng: -1.6778, notes: 'Courtier travaux, commission 5 %.' },
      { id: 'demo-n6', type: 'lead', nom: 'M. Lambert — rénovation toiture', ville: 'Bordeaux', adresse: '18 cours de l’Intendance', telephone: '06 12 34 56 78', email: 'p.lambert@gmail.com', statut: 'prospect', lat: 44.8378, lng: -0.5792, notes: 'Devis envoyé le 15/06, relance prévue.' },
      { id: 'demo-n7', type: 'lead', nom: 'Mme Nguyen — extension maison', ville: 'Strasbourg', adresse: '5 rue des Juifs', telephone: '06 98 76 54 32', email: 'nguyen.famille@free.fr', statut: 'prospect', lat: 48.5734, lng: 7.7521, notes: 'Projet 35 m², budget à confirmer.' },
      { id: 'demo-n8', type: 'chantier', nom: 'Réhabilitation immeuble Voltaire', ville: 'Paris', adresse: '112 boulevard Voltaire', telephone: '', email: '', statut: 'en_cours', lat: 48.858, lng: 2.38, notes: 'Lot menuiserie + plomberie. Livraison prévue en septembre.' },
      { id: 'demo-n9', type: 'chantier', nom: 'Maison Garonne', ville: 'Toulouse', adresse: '30 allées Jean-Jaurès', telephone: '', email: '', statut: 'termine', lat: 43.6047, lng: 1.4442, notes: 'Chantier livré en mai, retour client excellent.' }
    ];
    var relations = [
      { id: 'demo-r1', source_id: 'demo-n4', target_id: 'demo-n2', type: 'apport_affaires', statut: 'en_cours', notes: 'Dossiers copropriétés du 6e arrondissement.' },
      { id: 'demo-r2', source_id: 'demo-n5', target_id: 'demo-n6', type: 'apport_affaires', statut: 'contact_etabli', notes: 'Lead transmis en juin.' },
      { id: 'demo-r3', source_id: 'demo-n4', target_id: 'demo-n7', type: 'apport_affaires', statut: 'idee', notes: '' },
      { id: 'demo-r4', source_id: 'demo-n1', target_id: 'demo-n8', type: 'chantier_commun', statut: 'fructueux', notes: 'Lot menuiseries extérieures.' },
      { id: 'demo-r5', source_id: 'demo-n2', target_id: 'demo-n8', type: 'chantier_commun', statut: 'en_cours', notes: 'Lot plomberie.' },
      { id: 'demo-r6', source_id: 'demo-n2', target_id: 'demo-n3', type: 'sous_traitance', statut: 'arrete', raison_arret: 'Plus de disponibilité cette saison.', notes: 'Sous-traite l’électricité sur les petits chantiers.' }
    ];
    // Dates relatives à aujourd'hui (U9) : l'Accueil démontre une relance en
    // retard, une relance du jour et une idée dormante (demo-r3 sans journal).
    var journal = [
      { id: 'demo-j1', node_id: 'demo-n6', edge_id: null, date_entree: dateLocaleIso(-5), note: 'Devis toiture envoyé, attend le retour de la banque.', prochaine_etape: 'Relancer M. Lambert', relance_at: dateLocaleIso(-2), relance_faite: false },
      { id: 'demo-j2', node_id: null, edge_id: 'demo-r1', date_entree: dateLocaleIso(-8), note: 'Deux dossiers transmis ce mois-ci, bonne dynamique.', prochaine_etape: null, relance_at: null, relance_faite: false },
      { id: 'demo-j3', node_id: 'demo-n7', edge_id: null, date_entree: dateLocaleIso(-1), note: 'Plans reçus de l’architecte, chiffrage à préparer.', prochaine_etape: 'Envoyer le chiffrage à Mme Nguyen', relance_at: dateLocaleIso(0), relance_faite: false }
    ];
    return { noeuds: noeuds, relations: relations, journal: journal };
  }

  function idLocal() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
  }

  // ---------- Toasts ----------

  function toast(message, genre) {
    var el = document.createElement('div');
    el.className = 'toast ' + (genre === 'erreur' ? 'toast-erreur' : 'toast-succes');
    el.textContent = message;
    $('#toasts').appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  // ---------- API (mode connecté) ----------

  async function appelApi(chemin, options) {
    options = options || {};
    var entetes = { Accept: 'application/json' };
    if (options.body) { entetes['Content-Type'] = 'application/json'; }
    if (etat.session && etat.session.access_token) {
      entetes.Authorization = 'Bearer ' + etat.session.access_token;
    }
    var reponse = await fetch(chemin, {
      method: options.method || 'GET',
      headers: entetes,
      body: options.body || undefined
    });
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      throw new Error((corps && corps.error) || 'erreur réseau');
    }
    return corps.data;
  }

  // ---------- Chargement des données ----------

  async function chargerDonnees() {
    if (etat.modeDemo) {
      var demo = donneesDemo();
      etat.noeuds = demo.noeuds;
      etat.relations = demo.relations;
      etat.journal = demo.journal;
      rafraichir();
      return;
    }
    if (!etat.session) {
      etat.noeuds = [];
      etat.relations = [];
      etat.journal = [];
      rafraichir();
      return;
    }
    try {
      var data = await appelApi('/api/reseau');
      etat.noeuds = (data && data.nodes) || [];
      etat.relations = (data && data.edges) || [];
      etat.journal = (data && data.journal) || [];
      rafraichir();
    } catch (e) {
      toast('Chargement du réseau impossible.', 'erreur');
    }
  }

  function rafraichir() {
    window.UltimaCarte.rendre(etat.noeuds, etat.relations, etat.filtres);
    rendreAccueil();
    rendreContacts();
    if (etat.noeudCourant && !$('#vue-fiche').hidden) {
      rendreFiche();
    }
  }

  // ---------- Mutations (démo locale ou API) ----------

  async function sauverNoeud(valeurs) {
    if (etat.modeDemo) {
      if (etat.noeudEnEdition) {
        var existant = trouverNoeud(etat.noeudEnEdition);
        if (existant) { Object.assign(existant, valeurs); }
      } else {
        valeurs.id = idLocal();
        etat.noeuds.push(valeurs);
      }
      return valeurs.id || etat.noeudEnEdition;
    }
    if (etat.noeudEnEdition) {
      await appelApi('/api/reseau/nodes', {
        method: 'PATCH',
        body: JSON.stringify(Object.assign({ id: etat.noeudEnEdition }, valeurs))
      });
      await chargerDonnees();
      return etat.noeudEnEdition;
    }
    var cree = await appelApi('/api/reseau/nodes', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    await chargerDonnees();
    return cree && cree.id;
  }

  async function supprimerNoeud(id) {
    if (etat.modeDemo) {
      var relationsSupprimees = {};
      etat.relations = etat.relations.filter(function (r) {
        var garde = r.source_id !== id && r.target_id !== id;
        if (!garde) { relationsSupprimees[r.id] = true; }
        return garde;
      });
      etat.noeuds = etat.noeuds.filter(function (n) { return n.id !== id; });
      // Cascade locale identique aux FK on delete cascade.
      etat.journal = etat.journal.filter(function (j) {
        return j.node_id !== id && !relationsSupprimees[j.edge_id];
      });
      return;
    }
    await appelApi('/api/reseau/nodes', {
      method: 'DELETE',
      body: JSON.stringify({ id: id })
    });
    await chargerDonnees();
  }

  async function creerRelation(valeurs) {
    if (etat.modeDemo) {
      valeurs.id = idLocal();
      etat.relations.push(valeurs);
      return;
    }
    await appelApi('/api/reseau/edges', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    await chargerDonnees();
  }

  async function supprimerRelation(id) {
    if (etat.modeDemo) {
      etat.relations = etat.relations.filter(function (r) { return r.id !== id; });
      etat.journal = etat.journal.filter(function (j) { return j.edge_id !== id; });
      return;
    }
    await appelApi('/api/reseau/edges', {
      method: 'DELETE',
      body: JSON.stringify({ id: id })
    });
    await chargerDonnees();
  }

  // Pilotage d'une relation : statut / raison d'arrêt (hybride v1×v2).
  async function majRelation(id, valeurs) {
    if (etat.modeDemo) {
      var relation = etat.relations.find(function (r) { return r.id === id; });
      if (relation) { Object.assign(relation, valeurs); }
      return;
    }
    await appelApi('/api/reseau/edges', {
      method: 'PATCH',
      body: JSON.stringify(Object.assign({ id: id }, valeurs))
    });
    await chargerDonnees();
  }

  // ---------- Journal « où j'en suis » ----------

  async function creerEntreeJournal(valeurs) {
    if (etat.modeDemo) {
      valeurs.id = idLocal();
      valeurs.date_entree = new Date().toISOString().slice(0, 10);
      valeurs.relance_faite = false;
      etat.journal.unshift(valeurs);
      return;
    }
    await appelApi('/api/reseau/journal', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    await chargerDonnees();
  }

  async function majEntreeJournal(id, valeurs) {
    if (etat.modeDemo) {
      var entree = etat.journal.find(function (j) { return j.id === id; });
      if (entree) { Object.assign(entree, valeurs); }
      return;
    }
    await appelApi('/api/reseau/journal', {
      method: 'PATCH',
      body: JSON.stringify(Object.assign({ id: id }, valeurs))
    });
    await chargerDonnees();
  }

  async function supprimerEntreeJournal(id) {
    if (etat.modeDemo) {
      etat.journal = etat.journal.filter(function (j) { return j.id !== id; });
      return;
    }
    await appelApi('/api/reseau/journal', {
      method: 'DELETE',
      body: JSON.stringify({ id: id })
    });
    await chargerDonnees();
  }

  function trouverNoeud(id) {
    return etat.noeuds.find(function (n) { return n.id === id; }) || null;
  }

  function trouverRelation(id) {
    return etat.relations.find(function (r) { return r.id === id; }) || null;
  }

  function nomNoeud(id) {
    var noeud = trouverNoeud(id);
    return (noeud && noeud.nom) || 'nœud supprimé';
  }

  // ---------- Navigation par onglets ----------

  var SECTIONS_ONGLETS = {
    accueil: '#espace-accueil',
    carte: '#espace-carte',
    contacts: '#espace-contacts'
  };

  function activerOnglet(nom) {
    if (!SECTIONS_ONGLETS[nom]) { return; }
    etat.onglet = nom;
    Object.keys(SECTIONS_ONGLETS).forEach(function (cle) {
      var section = $(SECTIONS_ONGLETS[cle]);
      if (section) { section.hidden = cle !== nom; }
    });
    document.querySelectorAll('.barre-onglets .onglet').forEach(function (bouton) {
      if (bouton.getAttribute('data-onglet') === nom) {
        bouton.setAttribute('aria-current', 'page');
      } else {
        bouton.removeAttribute('aria-current');
      }
    });
    if (nom === 'carte') {
      // Leaflet initialisé dans une section cachée a une taille fausse.
      window.UltimaCarte.invaliderTaille();
    }
    if (nom === 'accueil') { rendreAccueil(); }
    if (nom === 'contacts') { rendreContacts(); }
    // Changement d'onglet : liste de recherche fermée, halo effacé, texte
    // du champ conservé (règles d'état v3-⑥).
    fermerListeRecherche();
    messageRecherche('');
    window.UltimaCarte.effacerSurbrillance();
  }

  // ---------- Accueil : ouverture d'une cible ----------

  // Nœud à ouvrir pour une entrée de journal (nœud direct, sinon relation).
  function noeudCibleEntree(entree) {
    if (entree.node_id && trouverNoeud(entree.node_id)) { return entree.node_id; }
    var relation = trouverRelation(entree.edge_id);
    return relation ? noeudCibleRelation(relation) : null;
  }

  // Nœud à ouvrir pour une relation : source, repli cible si source supprimé.
  function noeudCibleRelation(relation) {
    if (trouverNoeud(relation.source_id)) { return relation.source_id; }
    if (trouverNoeud(relation.target_id)) { return relation.target_id; }
    return null;
  }

  // Libellé court de la cible d'une entrée de journal (pour l'Accueil).
  function libelleCibleEntree(entree) {
    if (entree.node_id) { return nomNoeud(entree.node_id); }
    var relation = trouverRelation(entree.edge_id);
    if (!relation) { return 'nœud supprimé'; }
    return nomNoeud(relation.source_id) + ' ↔ ' + nomNoeud(relation.target_id);
  }

  function ouvrirCibleDepuisAccueil(nodeId) {
    var noeud = nodeId ? trouverNoeud(nodeId) : null;
    if (!noeud) {
      toast("Ce contact n'existe plus.", 'erreur');
      return; // on reste sur l'Accueil
    }
    activerOnglet('carte'); // invalide aussi la taille de la carte
    if (typeof noeud.lat === 'number' && typeof noeud.lng === 'number') {
      window.UltimaCarte.centrer(noeud.lat, noeud.lng);
    }
    ouvrirFiche(noeud.id);
    $('#panneau-titre').focus();
  }

  function ouvrirFormDepuisAccueil(nodeId) {
    activerOnglet('carte');
    ouvrirFormNoeud(nodeId);
    $('#panneau-titre').focus();
  }

  // ---------- Accueil : décor SVG (createElementNS, aria-hidden) ----------

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function svgElement(nom, attributs) {
    var el = document.createElementNS(SVG_NS, nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      el.setAttribute(cle, attributs[cle]);
    });
    return el;
  }

  // Chemin pointillé décoratif sous les titres de section.
  function svgChemin() {
    var svg = svgElement('svg', {
      'class': 'chemin', viewBox: '0 0 320 40',
      preserveAspectRatio: 'none', 'aria-hidden': 'true'
    });
    svg.appendChild(svgElement('path', {
      d: 'M4 32 Q 90 6, 160 22 T 316 12', fill: 'none', stroke: '#8c7a55',
      'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-dasharray': '0.5 9'
    }));
    return svg;
  }

  // Puce « lieu » (maison) des rapprochements.
  function svgLieu() {
    var svg = svgElement('svg', {
      'class': 'lieu', viewBox: '0 0 24 24', width: '26', height: '26', 'aria-hidden': 'true'
    });
    var g = svgElement('g', {
      fill: '#efe3c6', stroke: '#3b2f1c', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
    });
    g.appendChild(svgElement('path', { d: 'M4 11 L12 4 L20 11 V20 H4 Z' }));
    g.appendChild(svgElement('path', { d: 'M10 20 V14 H14 V20', fill: 'none' }));
    svg.appendChild(g);
    return svg;
  }

  // Puce « arbre » des suggestions.
  function svgArbre() {
    var svg = svgElement('svg', {
      'class': 'lieu', viewBox: '0 0 24 24', width: '26', height: '26', 'aria-hidden': 'true'
    });
    var g = svgElement('g', {
      fill: '#efe3c6', stroke: '#3b2f1c', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
    });
    g.appendChild(svgElement('circle', { cx: '12', cy: '9', r: '6' }));
    g.appendChild(svgElement('path', { d: 'M12 15 V21 M9 21 H15', fill: 'none' }));
    svg.appendChild(g);
    return svg;
  }

  // ---------- Accueil : rendu ----------

  function sectionAccueil(classe, titreTexte) {
    var section = document.createElement('section');
    section.className = 'accueil-section ' + classe;
    var idTitre = 'titre-' + classe;
    section.setAttribute('aria-labelledby', idTitre);
    var titre = document.createElement('h3');
    titre.id = idTitre;
    titre.className = 'accueil-sous-titre';
    titre.textContent = titreTexte;
    section.appendChild(titre);
    section.appendChild(svgChemin());
    return section;
  }

  function paragrapheVide(texte) {
    var p = document.createElement('p');
    p.className = 'accueil-vide';
    p.textContent = texte;
    return p;
  }

  // Relances dues : échéance atteinte ou dépassée, non faites.
  function relancesDues() {
    var aujourdHui = dateLocaleIso(0);
    return etat.journal.filter(function (j) {
      return j.relance_at && j.relance_at <= aujourdHui && !j.relance_faite;
    }).sort(function (a, b) {
      if (a.relance_at !== b.relance_at) { return a.relance_at < b.relance_at ? -1 : 1; }
      var da = a.date_entree || '';
      var db = b.date_entree || '';
      return da < db ? -1 : (da > db ? 1 : 0);
    });
  }

  function texteEtape(entree) {
    return entree.prochaine_etape || tronquer(entree.note || '', 80);
  }

  function itemRelance(entree, aujourdHui) {
    var item = document.createElement('li');
    item.className = 'item-relance';

    var ligne = document.createElement('div');
    ligne.className = 'item-relance-ligne';

    var etape = texteEtape(entree);

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'panneau-bois';
    var principal = document.createElement('span');
    principal.className = 'panneau-bois-texte';
    principal.textContent = etape;
    bouton.appendChild(principal);
    var secondaire = document.createElement('span');
    secondaire.className = 'panneau-bois-cible';
    secondaire.textContent = libelleCibleEntree(entree);
    bouton.appendChild(secondaire);
    bouton.addEventListener('click', function () {
      ouvrirCibleDepuisAccueil(noeudCibleEntree(entree));
    });
    ligne.appendChild(bouton);

    var caseLabel = document.createElement('label');
    caseLabel.className = 'case-fait';
    var caseFait = document.createElement('input');
    caseFait.type = 'checkbox';
    caseFait.setAttribute('aria-label', 'Marquer la relance comme faite — ' + etape);
    caseFait.addEventListener('change', function () {
      if (!caseFait.checked) { return; }
      caseFait.disabled = true; // anti double-tap pendant l'appel
      majEntreeJournal(entree.id, { relance_faite: true }).then(function () {
        toast('Relance cochée.');
        rafraichir(); // l'item disparaît, on reste sur l'Accueil
      }).catch(function () {
        caseFait.checked = false;
        caseFait.disabled = false;
        toast('Mise à jour impossible.', 'erreur');
      });
    });
    caseLabel.appendChild(caseFait);
    caseLabel.appendChild(document.createTextNode('Fait'));
    ligne.appendChild(caseLabel);
    item.appendChild(ligne);

    var retard = joursDeRetard(entree.relance_at, aujourdHui);
    var badge = document.createElement('span');
    badge.className = 'badge-echeance' + (retard > 0 ? ' badge-retard' : '');
    badge.textContent = retard > 0 ? 'En retard de ' + retard + ' j' : "Aujourd'hui";
    item.appendChild(badge);

    return item;
  }

  function rendreSectionRelances(conteneur) {
    var dues = relancesDues();
    var titre = dues.length > 0 ? 'Relances à faire (' + dues.length + ')' : 'Relances à faire';
    var section = sectionAccueil('zone-relances', titre);
    if (dues.length === 0) {
      section.appendChild(paragrapheVide('Aucune relance en attente. Tout est à jour.'));
    } else {
      var aujourdHui = dateLocaleIso(0);
      var liste = document.createElement('ul');
      liste.className = 'liste-accueil';
      dues.forEach(function (entree) {
        liste.appendChild(itemRelance(entree, aujourdHui));
      });
      section.appendChild(liste);
    }
    conteneur.appendChild(section);
  }

  // Groupes de pilotage, du plus chaud au plus froid.
  var GROUPES_RAPPROCHEMENTS = [
    { statut: 'en_cours', libelle: 'En cours' },
    { statut: 'contact_etabli', libelle: 'Contact établi' },
    { statut: 'idee', libelle: 'Idée' }
  ];

  function derniereEntreeRelation(relationId) {
    var derniere = null;
    etat.journal.forEach(function (j) {
      if (j.edge_id !== relationId) { return; }
      if (!derniere || (j.date_entree || '') > (derniere.date_entree || '')) { derniere = j; }
    });
    return derniere;
  }

  function itemRapprochement(relation, entree) {
    var item = document.createElement('li');
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'item-rapprochement';
    bouton.appendChild(svgLieu());

    var textes = document.createElement('span');
    textes.className = 'item-rapprochement-textes';

    var noms = document.createElement('span');
    noms.className = 'item-rapprochement-nom';
    noms.textContent = nomNoeud(relation.source_id) + ' ↔ ' + nomNoeud(relation.target_id);
    textes.appendChild(noms);

    var type = document.createElement('span');
    type.className = 'item-rapprochement-type';
    type.textContent = LIBELLES_RELATION[relation.type] || relation.type;
    textes.appendChild(type);

    var note = document.createElement('span');
    note.className = 'item-rapprochement-note';
    note.textContent = entree
      ? 'Le ' + dateLisible(entree.date_entree) + ' : ' + tronquer(entree.note || '', 80)
      : "Rien de noté pour l'instant.";
    textes.appendChild(note);

    bouton.appendChild(textes);
    bouton.addEventListener('click', function () {
      ouvrirCibleDepuisAccueil(noeudCibleRelation(relation));
    });
    item.appendChild(bouton);
    return item;
  }

  function rendreSectionRapprochements(conteneur) {
    var section = sectionAccueil('zone-rapprochements', 'Où en sont mes rapprochements');
    var actives = etat.relations.filter(function (r) {
      return r.statut === 'en_cours' || r.statut === 'contact_etabli' || r.statut === 'idee';
    });

    if (actives.length === 0) {
      section.appendChild(paragrapheVide('Aucun rapprochement en cours. Ouvrez la fiche ' +
        "d'un contact et touchez “Relier” pour lancer une idée."));
      conteneur.appendChild(section);
      return;
    }

    GROUPES_RAPPROCHEMENTS.forEach(function (groupe) {
      var relations = actives.filter(function (r) { return r.statut === groupe.statut; });
      if (relations.length === 0) { return; } // groupe vide : pas de titre

      // Tri : dernière entrée de journal décroissante, sans entrée en dernier.
      var lignes = relations.map(function (r) {
        return { relation: r, entree: derniereEntreeRelation(r.id) };
      }).sort(function (a, b) {
        var da = a.entree ? (a.entree.date_entree || '') : '';
        var db = b.entree ? (b.entree.date_entree || '') : '';
        if (da === db) { return 0; }
        if (!da) { return 1; }
        if (!db) { return -1; }
        return da > db ? -1 : 1;
      });

      var carteGroupe = document.createElement('div');
      carteGroupe.className = 'carte-groupe cadre-dessine';
      var enTete = document.createElement('p');
      enTete.className = 'carte-groupe-titre';
      enTete.appendChild(document.createTextNode(groupe.libelle + ' '));
      var compteur = document.createElement('span');
      compteur.className = 'badge-compteur';
      compteur.textContent = '(' + relations.length + ')';
      enTete.appendChild(compteur);
      carteGroupe.appendChild(enTete);

      var liste = document.createElement('ul');
      liste.className = 'liste-accueil liste-rapprochements';
      lignes.forEach(function (ligne) {
        liste.appendChild(itemRapprochement(ligne.relation, ligne.entree));
      });
      carteGroupe.appendChild(liste);
      section.appendChild(carteGroupe);
    });

    conteneur.appendChild(section);
  }

  // Règles locales R1–R4, au plus 1 suggestion par règle, arrêt à 3.
  function calculerSuggestions() {
    var suggestions = [];
    var aujourdHui = dateLocaleIso(0);

    // R1 — relances strictement en retard : 1 suggestion agrégée.
    var enRetard = etat.journal.filter(function (j) {
      return j.relance_at && j.relance_at < aujourdHui && !j.relance_faite;
    }).sort(function (a, b) {
      if (a.relance_at !== b.relance_at) { return a.relance_at < b.relance_at ? -1 : 1; }
      var da = a.date_entree || '';
      var db = b.date_entree || '';
      return da < db ? -1 : (da > db ? 1 : 0);
    });
    if (enRetard.length > 0) {
      var plusAncienne = enRetard[0];
      var etape = texteEtape(plusAncienne);
      var cible = libelleCibleEntree(plusAncienne);
      var message = enRetard.length === 1
        ? 'Vous avez 1 relance en retard : “' + etape + '” (' + cible + ').'
        : 'Vous avez ' + enRetard.length + ' relances en retard. La plus ancienne : “' +
          etape + '” (' + cible + ').';
      suggestions.push({
        message: message,
        action: function () { ouvrirCibleDepuisAccueil(noeudCibleEntree(plusAncienne)); }
      });
    }

    // R2 — idée dormante : aucune entrée depuis 14 jours.
    if (suggestions.length < 3) {
      var seuil = dateLocaleIso(-14);
      var dormantes = etat.relations.filter(function (r) {
        if (r.statut !== 'idee') { return false; }
        return !etat.journal.some(function (j) {
          return j.edge_id === r.id && j.date_entree >= seuil;
        });
      }).sort(function (a, b) {
        return nomNoeud(a.source_id).localeCompare(nomNoeud(b.source_id), 'fr');
      });
      if (dormantes.length > 0) {
        var dormante = dormantes[0];
        suggestions.push({
          message: "L'idée “" + nomNoeud(dormante.source_id) + ' ↔ ' +
            nomNoeud(dormante.target_id) +
            "” n'a pas bougé depuis plus de 14 jours. On s'en occupe ?",
          action: function () { ouvrirCibleDepuisAccueil(noeudCibleRelation(dormante)); }
        });
      }
    }

    // R3 — contact injoignable : ni téléphone ni e-mail.
    if (suggestions.length < 3) {
      var injoignables = etat.noeuds.filter(function (n) {
        return !n.telephone && !n.email;
      }).sort(function (a, b) {
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
      });
      if (injoignables.length > 0) {
        var injoignable = injoignables[0];
        suggestions.push({
          message: (injoignable.nom || '(sans nom)') +
            " n'a ni téléphone ni e-mail. Complétez sa fiche ?",
          action: function () { ouvrirFormDepuisAccueil(injoignable.id); }
        });
      }
    }

    // R4 — contact sans position (prépare l'onglet Contacts).
    if (suggestions.length < 3) {
      var sansPosition = etat.noeuds.filter(function (n) {
        return typeof n.lat !== 'number' || typeof n.lng !== 'number';
      }).sort(function (a, b) {
        return (a.nom || '').localeCompare(b.nom || '', 'fr');
      });
      if (sansPosition.length > 0) {
        var aPlacer = sansPosition[0];
        suggestions.push({
          message: (aPlacer.nom || '(sans nom)') +
            " n'est pas encore placé sur la carte. On le place ?",
          action: function () { ouvrirFormDepuisAccueil(aPlacer.id); }
        });
      }
    }

    return suggestions.slice(0, 3);
  }

  function rendreSectionSuggestions(conteneur) {
    var section = sectionAccueil('zone-suggestions', 'Léo vous suggère');
    var suggestions = calculerSuggestions();
    if (suggestions.length === 0) {
      section.appendChild(paragrapheVide("Rien d'urgent aujourd'hui — votre réseau est à jour."));
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-accueil';
      suggestions.forEach(function (suggestion) {
        var item = document.createElement('li');
        var bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'item-suggestion';
        bouton.appendChild(svgArbre());
        var texte = document.createElement('span');
        texte.className = 'item-suggestion-texte';
        texte.textContent = suggestion.message;
        bouton.appendChild(texte);
        bouton.addEventListener('click', suggestion.action);
        item.appendChild(bouton);
        liste.appendChild(item);
      });
      section.appendChild(liste);
    }
    conteneur.appendChild(section);
  }

  function boutonRaccourci(libelle, classe, action) {
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'bouton ' + classe;
    bouton.textContent = libelle;
    bouton.addEventListener('click', action);
    return bouton;
  }

  function rendreRaccourcis(conteneur) {
    var bloc = document.createElement('div');
    bloc.className = 'accueil-raccourcis';
    bloc.appendChild(boutonRaccourci('+ Ajouter un contact', 'bouton-primaire', function () {
      ouvrirFormDepuisAccueil(null);
    }));
    bloc.appendChild(boutonRaccourci("Noter où j'en suis", 'bouton-parchemin', function () {
      activerOnglet('carte');
      toast('Touchez un contact sur la carte pour ouvrir sa fiche et noter où vous en êtes.');
    }));
    bloc.appendChild(boutonRaccourci('Voir la carte', 'bouton-parchemin', function () {
      activerOnglet('carte');
    }));
    conteneur.appendChild(bloc);
  }

  function rendreAccueil() {
    var conteneur = $('#accueil-contenu');
    if (!conteneur) { return; }
    conteneur.textContent = '';

    // Non connecté (config présente, pas de session) : bloc unique.
    if (!etat.modeDemo && !etat.session) {
      var blocConnexion = document.createElement('div');
      blocConnexion.className = 'accueil-bloc-etat cadre-dessine';
      var texteConnexion = document.createElement('p');
      texteConnexion.className = 'accueil-etat-texte';
      var fort = document.createElement('strong');
      fort.textContent = 'Connectez-vous pour retrouver votre réseau.';
      texteConnexion.appendChild(fort);
      texteConnexion.appendChild(document.createTextNode(' Le lien de connexion arrive par e-mail.'));
      blocConnexion.appendChild(texteConnexion);
      blocConnexion.appendChild(boutonRaccourci('Se connecter', 'bouton-primaire', function () {
        var champ = $('#champ-email');
        if (champ) { champ.focus(); }
      }));
      conteneur.appendChild(blocConnexion);
      return;
    }

    // Connecté (ou démo), aucune donnée : invitation au premier contact.
    if (etat.noeuds.length === 0) {
      var blocVide = document.createElement('div');
      blocVide.className = 'accueil-bloc-etat cadre-dessine';
      var texteVide = document.createElement('p');
      texteVide.className = 'accueil-etat-texte';
      var fortVide = document.createElement('strong');
      fortVide.textContent = "Votre réseau est vide pour l'instant.";
      texteVide.appendChild(fortVide);
      texteVide.appendChild(document.createTextNode(
        ' Commencez par ajouter votre premier contact : il apparaîtra sur la carte.'));
      blocVide.appendChild(texteVide);
      blocVide.appendChild(boutonRaccourci('+ Ajouter un contact', 'bouton-primaire', function () {
        ouvrirFormDepuisAccueil(null);
      }));
      conteneur.appendChild(blocVide);
      rendreRaccourcis(conteneur);
      return;
    }

    rendreSectionRelances(conteneur);
    rendreSectionRapprochements(conteneur);
    rendreSectionSuggestions(conteneur);
    rendreRaccourcis(conteneur);
  }

  // ---------- Onglet Contacts (registre sobre : liste + recherche) ----------

  // Normalisation de recherche : minuscules, sans accents (NFD + diacritiques).
  function normaliserTexte(texte) {
    return (texte || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Pr\u00e9dicat de recherche partag\u00e9 (Contacts + recherche carte) : nom et ville
  // uniquement, correspondance par inclusion sur texte normalis\u00e9.
  function correspondAuTerme(noeud, terme) {
    return normaliserTexte(noeud.nom).indexOf(terme) !== -1 ||
           normaliserTexte(noeud.ville).indexOf(terme) !== -1;
  }

  function contactAPosition(noeud) {
    return typeof noeud.lat === 'number' && isFinite(noeud.lat) &&
           typeof noeud.lng === 'number' && isFinite(noeud.lng);
  }

  // Puce « lieu » colorée par type : la maison de l'Accueil sur une pastille
  // aux couleurs de la carte (le type est aussi écrit en toutes lettres).
  function svgLieuContact(type) {
    var couleurs = (window.UltimaCarte && window.UltimaCarte.COULEURS_TYPE) || {};
    var svg = svgElement('svg', {
      'class': 'lieu-contact', viewBox: '0 0 24 24', width: '28', height: '28', 'aria-hidden': 'true'
    });
    svg.appendChild(svgElement('circle', {
      cx: '12', cy: '12', r: '11', fill: couleurs[type] || '#555555'
    }));
    var maison = svgElement('g', {
      fill: 'none', stroke: '#ffffff', 'stroke-width': '1.6', 'stroke-linejoin': 'round'
    });
    maison.appendChild(svgElement('path', { d: 'M6.5 11.5 L12 6.5 L17.5 11.5 V17.5 H6.5 Z' }));
    maison.appendChild(svgElement('path', { d: 'M10.5 17.5 V14 H13.5 V17.5' }));
    svg.appendChild(maison);
    return svg;
  }

  function itemContact(noeud) {
    var item = document.createElement('li');
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'item-contact';
    bouton.appendChild(svgLieuContact(noeud.type));

    var textes = document.createElement('span');
    textes.className = 'item-contact-textes';
    var nom = document.createElement('span');
    nom.className = 'item-contact-nom';
    nom.textContent = noeud.nom || '(sans nom)';
    textes.appendChild(nom);
    var detail = document.createElement('span');
    detail.className = 'item-contact-detail';
    detail.textContent = (LIBELLES_TYPE[noeud.type] || noeud.type) +
      (noeud.ville ? ' · ' + noeud.ville : '');
    textes.appendChild(detail);
    bouton.appendChild(textes);

    var badges = document.createElement('span');
    badges.className = 'item-contact-badges';
    var statut = document.createElement('span');
    statut.className = 'badge';
    statut.textContent = LIBELLES_STATUT[noeud.statut] || noeud.statut;
    badges.appendChild(statut);
    if (!contactAPosition(noeud)) {
      var aPlacer = document.createElement('span');
      aPlacer.className = 'badge-a-placer';
      aPlacer.textContent = 'À placer';
      badges.appendChild(aPlacer);
    }
    bouton.appendChild(badges);

    // Même mécanique que l'Accueil : Carte + fiche + centrage + focus titre.
    bouton.addEventListener('click', function () {
      ouvrirCibleDepuisAccueil(noeud.id);
    });
    item.appendChild(bouton);
    return item;
  }

  function blocEtatContacts(texteFort, texteSuite, libelleBouton, action) {
    var bloc = document.createElement('div');
    bloc.className = 'contacts-bloc-etat';
    var texte = document.createElement('p');
    texte.className = 'contacts-etat-texte';
    var fort = document.createElement('strong');
    fort.textContent = texteFort;
    texte.appendChild(fort);
    texte.appendChild(document.createTextNode(' ' + texteSuite));
    bloc.appendChild(texte);
    bloc.appendChild(boutonRaccourci(libelleBouton, 'bouton-primaire', action));
    return bloc;
  }

  function rendreContacts() {
    var conteneur = $('#contacts-contenu');
    if (!conteneur) { return; }
    conteneur.textContent = '';
    var compteur = $('#contacts-compteur');
    var outils = $('#contacts-outils');
    var boutonAjouter = $('#contacts-ajouter');

    // Non connecté (config présente, pas de session) : bloc unique.
    if (!etat.modeDemo && !etat.session) {
      compteur.textContent = '';
      outils.hidden = true;
      boutonAjouter.hidden = true;
      conteneur.appendChild(blocEtatContacts(
        'Connectez-vous pour retrouver votre réseau.',
        'Le lien de connexion arrive par e-mail.',
        'Se connecter',
        function () {
          var champ = $('#champ-email');
          if (champ) { champ.focus(); }
        }));
      return;
    }
    boutonAjouter.hidden = false;

    // Connecté (ou démo), aucune donnée : invitation au premier contact.
    if (etat.noeuds.length === 0) {
      compteur.textContent = '0 contact';
      outils.hidden = true;
      conteneur.appendChild(blocEtatContacts(
        "Votre réseau est vide pour l'instant.",
        'Commencez par ajouter votre premier contact : il apparaîtra sur la carte.',
        '+ Ajouter un contact',
        function () { ouvrirFormDepuisAccueil(null); }));
      return;
    }

    outils.hidden = false;
    compteur.textContent = etat.noeuds.length + (etat.noeuds.length > 1 ? ' contacts' : ' contact');

    var brut = $('#contacts-recherche').value.trim();
    var terme = normaliserTexte(brut);
    var visibles = etat.noeuds.filter(function (n) {
      if (!terme) { return true; }
      return correspondAuTerme(n, terme);
    }).sort(function (a, b) {
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    if (visibles.length === 0) {
      var aucun = document.createElement('p');
      aucun.className = 'contacts-aucun';
      aucun.textContent = 'Aucun contact ne correspond à “' + brut + '”.';
      conteneur.appendChild(aucun);
      return;
    }

    var liste = document.createElement('ul');
    liste.className = 'liste-contacts';
    visibles.forEach(function (n) { liste.appendChild(itemContact(n)); });
    conteneur.appendChild(liste);
  }

  // ---------- Panneau latéral ----------

  function ouvrirPanneau(vue, titre) {
    $('#panneau').hidden = false;
    $('#panneau-titre').textContent = titre;
    $('#vue-fiche').hidden = vue !== 'fiche';
    $('#form-noeud').hidden = vue !== 'noeud';
    $('#form-relation').hidden = vue !== 'relation';
  }

  function fermerPanneau() {
    $('#panneau').hidden = true;
    etat.noeudCourant = null;
    etat.noeudEnEdition = null;
    reinitialiserGeo(); // l'aperçu et l'état de recherche ne survivent pas
  }

  // ---------- Fiche ----------

  function ouvrirFiche(id) {
    etat.noeudCourant = id;
    // Toute ouverture de fiche efface le halo de recherche ; la sélection d'un
    // résultat le repose juste après (un seul halo, toujours à jour).
    window.UltimaCarte.effacerSurbrillance();
    reinitialiserGeo(); // sortie du formulaire (enregistrement ou annulation)
    var noeud = trouverNoeud(id);
    ouvrirPanneau('fiche', (noeud && noeud.nom) || 'Fiche');
    rendreFiche();
    signalerDecouverteDictee();
  }

  function ligneDetail(dl, libelle, valeur) {
    if (!valeur) { return; }
    var dt = document.createElement('dt');
    dt.textContent = libelle;
    var dd = document.createElement('dd');
    dd.textContent = valeur;
    dl.appendChild(dt);
    dl.appendChild(dd);
  }

  function rendreFiche() {
    var noeud = trouverNoeud(etat.noeudCourant);
    var conteneur = $('#vue-fiche');
    conteneur.textContent = '';
    if (!noeud) { fermerPanneau(); return; }

    $('#panneau-titre').textContent = noeud.nom || 'Fiche';

    var badges = document.createElement('div');
    badges.className = 'badges';
    var badgeType = document.createElement('span');
    badgeType.className = 'badge badge-' + noeud.type;
    badgeType.textContent = LIBELLES_TYPE[noeud.type] || noeud.type;
    var badgeStatut = document.createElement('span');
    badgeStatut.className = 'badge';
    badgeStatut.textContent = LIBELLES_STATUT[noeud.statut] || noeud.statut;
    badges.appendChild(badgeType);
    badges.appendChild(badgeStatut);
    conteneur.appendChild(badges);

    var dl = document.createElement('dl');
    dl.className = 'fiche-details';
    ligneDetail(dl, 'Ville', noeud.ville);
    ligneDetail(dl, 'Adresse', noeud.adresse);
    ligneDetail(dl, 'Téléphone', noeud.telephone);
    ligneDetail(dl, 'E-mail', noeud.email);
    ligneDetail(dl, 'Notes', noeud.notes);
    conteneur.appendChild(dl);

    var sousTitre = document.createElement('h3');
    sousTitre.className = 'fiche-sous-titre';
    sousTitre.textContent = 'Relations';
    conteneur.appendChild(sousTitre);

    var liees = etat.relations.filter(function (r) {
      return r.source_id === noeud.id || r.target_id === noeud.id;
    });

    if (liees.length === 0) {
      var vide = document.createElement('p');
      vide.className = 'aucune-relation';
      vide.textContent = 'Aucune relation pour le moment.';
      conteneur.appendChild(vide);
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-relations';
      liees.forEach(function (relation) {
        var autreId = relation.source_id === noeud.id ? relation.target_id : relation.source_id;
        var autre = trouverNoeud(autreId);
        var item = document.createElement('li');
        item.className = 'item-relation';

        var texte = document.createElement('span');
        texte.className = 'item-relation-texte';
        texte.textContent = (LIBELLES_RELATION[relation.type] || relation.type) +
          ' — ' + ((autre && autre.nom) || 'nœud supprimé');
        if (relation.notes) {
          var note = document.createElement('span');
          note.className = 'item-relation-note';
          note.textContent = relation.notes;
          texte.appendChild(note);
        }
        if (relation.statut === 'arrete' && relation.raison_arret) {
          var raison = document.createElement('span');
          raison.className = 'item-relation-note';
          raison.textContent = 'Arrêt : ' + relation.raison_arret;
          texte.appendChild(raison);
        }

        // Pilotage : cycle de vie du rapprochement (un arrêt exige sa raison).
        var pilotage = document.createElement('select');
        pilotage.className = 'select-statut-relation';
        pilotage.setAttribute('aria-label', 'Statut de la relation');
        STATUTS_RELATION.forEach(function (s) {
          var option = document.createElement('option');
          option.value = s;
          option.textContent = LIBELLES_STATUT_RELATION[s];
          pilotage.appendChild(option);
        });
        pilotage.value = relation.statut || 'idee';
        pilotage.addEventListener('change', function () {
          var nouveau = pilotage.value;
          var valeurs = { statut: nouveau };
          if (nouveau === 'arrete') {
            var motif = window.prompt("Raison de l'arrêt (obligatoire) :", relation.raison_arret || '');
            if (motif === null || !motif.trim()) {
              pilotage.value = relation.statut || 'idee';
              toast('Un arrêt doit être justifié.', 'erreur');
              return;
            }
            valeurs.raison_arret = motif.trim();
          }
          majRelation(relation.id, valeurs).then(function () {
            toast('Relation mise à jour.');
            rafraichir();
          }).catch(function (e) {
            pilotage.value = relation.statut || 'idee';
            toast(e.message || 'Mise à jour impossible.', 'erreur');
          });
        });

        var suppr = document.createElement('button');
        suppr.type = 'button';
        suppr.className = 'bouton bouton-danger';
        suppr.textContent = 'Retirer';
        suppr.addEventListener('click', function () {
          supprimerRelation(relation.id).then(function () {
            toast('Relation supprimée.');
            rafraichir();
          }).catch(function () {
            toast('Suppression impossible.', 'erreur');
          });
        });

        var actionsRelation = document.createElement('span');
        actionsRelation.className = 'item-relation-actions';
        actionsRelation.appendChild(pilotage);
        actionsRelation.appendChild(suppr);

        item.appendChild(texte);
        item.appendChild(actionsRelation);
        liste.appendChild(item);
      });
      conteneur.appendChild(liste);
    }

    rendreJournal(conteneur, noeud, liees);

    var actions = document.createElement('div');
    actions.className = 'actions-fiche';

    var relier = document.createElement('button');
    relier.type = 'button';
    relier.className = 'bouton bouton-primaire';
    relier.textContent = 'Relier';
    relier.addEventListener('click', function () { ouvrirFormRelation(noeud.id); });

    var modifier = document.createElement('button');
    modifier.type = 'button';
    modifier.className = 'bouton bouton-secondaire';
    modifier.textContent = 'Modifier';
    modifier.addEventListener('click', function () { ouvrirFormNoeud(noeud.id); });

    var supprimer = document.createElement('button');
    supprimer.type = 'button';
    supprimer.className = 'bouton bouton-danger';
    supprimer.textContent = 'Supprimer';
    supprimer.addEventListener('click', function () {
      if (!window.confirm('Supprimer ce nœud et ses relations ?')) { return; }
      supprimerNoeud(noeud.id).then(function () {
        toast('Nœud supprimé.');
        fermerPanneau();
        rafraichir();
      }).catch(function () {
        toast('Suppression impossible.', 'erreur');
      });
    });

    actions.appendChild(relier);
    actions.appendChild(modifier);
    actions.appendChild(supprimer);
    conteneur.appendChild(actions);
  }

  // ---------- Journal « où j'en suis » (section de la fiche) ----------

  function dateLisible(iso) {
    if (!iso) { return ''; }
    var morceaux = iso.split('-');
    return morceaux.length === 3 ? morceaux[2] + '/' + morceaux[1] + '/' + morceaux[0] : iso;
  }

  // Libellé court de la cible d'une entrée (vide si c'est le nœud courant).
  function libelleCible(entree, noeud) {
    if (entree.node_id === noeud.id) { return ''; }
    var relation = etat.relations.find(function (r) { return r.id === entree.edge_id; });
    if (!relation) { return 'relation supprimée'; }
    var autreId = relation.source_id === noeud.id ? relation.target_id : relation.source_id;
    var autre = trouverNoeud(autreId);
    return 'avec ' + ((autre && autre.nom) || '(sans nom)');
  }

  function rendreJournal(conteneur, noeud, relationsLiees) {
    var sousTitre = document.createElement('h3');
    sousTitre.className = 'fiche-sous-titre';
    sousTitre.textContent = "Journal — où j'en suis";
    conteneur.appendChild(sousTitre);

    var idsRelations = {};
    relationsLiees.forEach(function (r) { idsRelations[r.id] = true; });
    var entrees = etat.journal.filter(function (j) {
      return j.node_id === noeud.id || idsRelations[j.edge_id];
    });

    if (entrees.length === 0) {
      var vide = document.createElement('p');
      vide.className = 'aucune-relation';
      vide.textContent = 'Aucune entrée pour le moment.';
      conteneur.appendChild(vide);
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-journal';
      entrees.forEach(function (entree) {
        var item = document.createElement('li');
        item.className = 'entree-journal';

        var entete = document.createElement('span');
        entete.className = 'entree-journal-entete';
        var cible = libelleCible(entree, noeud);
        entete.textContent = dateLisible(entree.date_entree) + (cible ? ' · ' + cible : '');
        item.appendChild(entete);

        var note = document.createElement('span');
        note.className = 'entree-journal-note';
        note.textContent = entree.note;
        item.appendChild(note);

        if (entree.prochaine_etape) {
          var etape = document.createElement('span');
          etape.className = 'entree-journal-etape';
          etape.textContent = '→ ' + entree.prochaine_etape;
          item.appendChild(etape);
        }

        var pied = document.createElement('span');
        pied.className = 'entree-journal-pied';

        if (entree.relance_at) {
          var relance = document.createElement('label');
          relance.className = 'entree-journal-relance' + (entree.relance_faite ? ' faite' : '');
          var caseFaite = document.createElement('input');
          caseFaite.type = 'checkbox';
          caseFaite.checked = Boolean(entree.relance_faite);
          caseFaite.addEventListener('change', function () {
            majEntreeJournal(entree.id, { relance_faite: caseFaite.checked }).then(function () {
              rafraichir();
            }).catch(function () {
              caseFaite.checked = !caseFaite.checked;
              toast('Mise à jour impossible.', 'erreur');
            });
          });
          relance.appendChild(caseFaite);
          relance.appendChild(document.createTextNode(' Relance le ' + dateLisible(entree.relance_at)));
          pied.appendChild(relance);
        }

        var supprEntree = document.createElement('button');
        supprEntree.type = 'button';
        supprEntree.className = 'bouton-lien-danger';
        supprEntree.textContent = 'Effacer';
        supprEntree.addEventListener('click', function () {
          supprimerEntreeJournal(entree.id).then(function () {
            rafraichir();
          }).catch(function () {
            toast('Suppression impossible.', 'erreur');
          });
        });
        pied.appendChild(supprEntree);
        item.appendChild(pied);

        liste.appendChild(item);
      });
      conteneur.appendChild(liste);
    }

    // Formulaire d'ajout : note obligatoire, cible = nœud ou une relation.
    var form = document.createElement('form');
    form.className = 'form-journal';

    var champNote = document.createElement('textarea');
    champNote.rows = 2;
    champNote.maxLength = 2000;
    champNote.required = true;
    champNote.placeholder = "Où j'en suis…";
    champNote.setAttribute('aria-label', 'Nouvelle entrée de journal');
    form.appendChild(champNote);
    attacherDictee(champNote); // le formulaire est recréé à chaque rendu

    var selectCible = document.createElement('select');
    selectCible.setAttribute('aria-label', "Cible de l'entrée");
    var optionNoeud = document.createElement('option');
    optionNoeud.value = 'noeud';
    optionNoeud.textContent = 'Ce nœud';
    selectCible.appendChild(optionNoeud);
    relationsLiees.forEach(function (r) {
      var autreId = r.source_id === noeud.id ? r.target_id : r.source_id;
      var autre = trouverNoeud(autreId);
      var option = document.createElement('option');
      option.value = r.id;
      option.textContent = 'Relation avec ' + ((autre && autre.nom) || '(sans nom)');
      selectCible.appendChild(option);
    });
    form.appendChild(selectCible);

    var champEtape = document.createElement('input');
    champEtape.type = 'text';
    champEtape.maxLength = 500;
    champEtape.placeholder = 'Prochaine étape (si relance)';
    champEtape.setAttribute('aria-label', 'Prochaine étape');
    form.appendChild(champEtape);
    attacherDictee(champEtape);

    var champRelance = document.createElement('input');
    champRelance.type = 'date';
    champRelance.setAttribute('aria-label', 'Date de relance');
    form.appendChild(champRelance);

    var boutonAjout = document.createElement('button');
    boutonAjout.type = 'submit';
    boutonAjout.className = 'bouton bouton-secondaire';
    boutonAjout.textContent = 'Noter';
    form.appendChild(boutonAjout);

    form.addEventListener('submit', function (evenement) {
      evenement.preventDefault();
      var note = champNote.value.trim();
      if (!note) { return; }
      var valeurs = { note: note };
      if (selectCible.value === 'noeud') {
        valeurs.node_id = noeud.id;
      } else {
        valeurs.edge_id = selectCible.value;
      }
      var etape = champEtape.value.trim();
      if (etape) { valeurs.prochaine_etape = etape; }
      if (champRelance.value) {
        if (!etape) {
          toast('Une relance nécessite une prochaine étape.', 'erreur');
          return;
        }
        valeurs.relance_at = champRelance.value;
      }
      creerEntreeJournal(valeurs).then(function () {
        toast('Entrée notée.');
        rafraichir();
      }).catch(function (e) {
        toast(e.message || 'Enregistrement impossible.', 'erreur');
      });
    });

    conteneur.appendChild(form);
  }

  // ---------- Dictée vocale par champ (Web Speech API, v3-④) ----------
  // Progressive enhancement : API absente (Firefox…) → aucun bouton, zéro bruit.
  // Règles : la dictée AJOUTE (jamais ne remplace), le champ n'est jamais
  // bloqué (le clavier a toujours le dernier mot), une seule écoute à la fois.
  // Vie privée : aucune transcription ni valeur de champ en console/logs.

  var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  var dicteeCourante = null;     // une seule écoute globale, jamais de doublon
  var DICTEE_TIMEOUT_MS = 30000; // filet : jamais d'écoute fantôme

  function annoncerDictee(message) {
    var region = $('#statut-dictee');
    if (region) { region.textContent = message; }
  }

  // Icône micro (spec graphisme) : capsule + arc de captation + pied.
  function svgMicro() {
    var svg = svgElement('svg', {
      viewBox: '0 0 24 24', width: '22', height: '22', 'aria-hidden': 'true',
      fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(svgElement('rect', { x: '9', y: '3.5', width: '6', height: '11', rx: '3' }));
    svg.appendChild(svgElement('path', { d: 'M5.5 11.5 a6.5 6.5 0 0 0 13 0' }));
    svg.appendChild(svgElement('path', { d: 'M12 18 v2.5 M9 20.5 h6' }));
    return svg;
  }

  // Composant unique : enveloppe un champ texte et lui adjoint le bouton micro.
  // options.remplacer (v3-⑥, champ de recherche) : chaque dictée REMPLACE le
  // contenu du champ — une recherche est UNE intention, pas un texte composé.
  // Défaut (sans option) : ajout, comportement v3-④ inchangé.
  function attacherDictee(champ, libelle, options) {
    if (!Reco || !champ || champ.dataset.dicteeAttachee === 'oui') { return; }
    champ.dataset.dicteeAttachee = 'oui';
    if (options && options.remplacer) { champ.dataset.dicteeMode = 'remplacement'; }
    if (!libelle) {
      libelle = champ.getAttribute('aria-label') || '';
      if (!libelle && champ.id) {
        var etiquette = document.querySelector('label[for="' + champ.id + '"]');
        libelle = etiquette ? etiquette.textContent.replace(/\s*\*\s*$/, '').trim() : '';
      }
    }

    var enveloppe = document.createElement('div');
    enveloppe.className = 'champ-vocal';
    champ.parentNode.insertBefore(enveloppe, champ);
    enveloppe.appendChild(champ);

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'bouton-micro';
    bouton.title = 'Dicter';
    bouton.setAttribute('aria-label', 'Dicter — ' + libelle);
    bouton.setAttribute('aria-pressed', 'false');
    bouton.appendChild(svgMicro());
    enveloppe.appendChild(bouton);

    // Ligne d'état visible : double codage couleur + texte pendant l'écoute.
    var etatLigne = document.createElement('p');
    etatLigne.className = 'etat-vocal';
    etatLigne.hidden = true;
    enveloppe.insertAdjacentElement('afterend', etatLigne);

    bouton.addEventListener('click', function () {
      basculerDictee(champ, bouton, etatLigne);
    });

    // Le clavier a toujours le dernier mot : frappe pendant l'écoute → arrêt,
    // interim retiré, texte finalisé et frappe conservés (isTrusted écarte
    // l'évènement input que le composant émet lui-même à la fin).
    champ.addEventListener('keydown', function (evenement) {
      if (evenement.isTrusted && dicteeCourante && dicteeCourante.champ === champ) {
        dicteeCourante.annuler(false);
      }
    });
    champ.addEventListener('input', function (evenement) {
      // Collage, autocomplétion… : la valeur posée par Paul reste telle quelle.
      if (evenement.isTrusted && dicteeCourante && dicteeCourante.champ === champ) {
        dicteeCourante.annuler(true);
      }
    });
  }

  function basculerDictee(champ, bouton, etatLigne) {
    if (dicteeCourante) {
      // Phase de démarrage (entre start() et onstart) : taps ignorés.
      if (!dicteeCourante.demarree) { return; }
      if (dicteeCourante.bouton === bouton) {
        // Re-tap : arrêt, le résultat déjà prononcé est conservé et inséré.
        dicteeCourante.arreter();
        return;
      }
      // Autre champ : l'écoute en cours s'arrête proprement, puis celle-ci démarre.
      dicteeCourante.arreter();
    }
    demarrerDictee(champ, bouton, etatLigne);
  }

  function demarrerDictee(champ, bouton, etatLigne) {
    var reco = new Reco();
    reco.lang = 'fr-FR';
    reco.continuous = false;      // arrêt auto sur silence : le chemin nominal
    reco.interimResults = true;   // les mots apparaissent pendant que Paul parle
    reco.maxAlternatives = 1;

    var remplacer = champ.dataset.dicteeMode === 'remplacement';
    var base = champ.value;
    var separateur = base && !/\s$/.test(base) ? ' ' : '';

    var session = {
      champ: champ,
      bouton: bouton,
      demarree: false,
      terminee: false,
      finalise: '',
      interim: '',
      plafondSignale: false,
      minuteur: null
    };

    // Tronque au maxlength du champ (l'affectation programmatique l'ignore).
    function plafonner(valeur) {
      var max = champ.maxLength;
      if (max > 0 && valeur.length > max) {
        valeur = valeur.slice(0, max);
        if (!session.plafondSignale) {
          session.plafondSignale = true;
          toast('Limite de texte atteinte.', 'erreur');
        }
      }
      return valeur;
    }

    // Valeur affichée. Mode ajout (défaut) : base + séparateur + dicté.
    // Mode remplacement : le texte dicté remplace tout — mais tant que rien
    // n'est dicté (ou en cas d'erreur), la valeur d'origine reste intacte.
    function afficher() {
      var texte = session.finalise + session.interim;
      if (remplacer) {
        champ.value = texte ? plafonner(texte) : base;
      } else {
        champ.value = texte ? plafonner(base + separateur + texte) : base;
      }
    }

    function curseurEnFin() {
      var fin = champ.value.length;
      try { champ.setSelectionRange(fin, fin); } catch (e) { /* champ non sélectionnable */ }
    }

    function reposUi() {
      bouton.setAttribute('aria-pressed', 'false');
      bouton.classList.remove('ecoute');
      etatLigne.hidden = true;
      etatLigne.textContent = '';
      if (dicteeCourante === session) { dicteeCourante = null; }
    }

    function clore() {
      if (session.minuteur) { clearTimeout(session.minuteur); session.minuteur = null; }
      session.terminee = true;
      reposUi();
    }

    // Fin nominale : texte posé, curseur en fin, écouteurs du champ prévenus.
    function finaliser() {
      if (session.terminee) { return; }
      clore();
      afficher(); // un interim sans final est conservé (mieux qu'une perte)
      curseurEnFin();
      annoncerDictee('Dictée terminée.');
      champ.dispatchEvent(new Event('input', { bubbles: true }));
    }

    session.arreter = function () {
      if (session.terminee) { return; }
      reposUi(); // repos immédiat : jamais deux écoutes affichées à la fois
      try { reco.stop(); } catch (e) { finaliser(); }
    };

    session.annuler = function (garderValeur) {
      if (session.terminee) { return; }
      clore();
      try { reco.abort(); } catch (e) { /* déjà arrêté */ }
      if (!garderValeur) {
        session.interim = ''; // l'interim est retiré, le finalisé est conservé
        afficher();
        curseurEnFin();
      }
      annoncerDictee('Dictée terminée.');
    };

    reco.onstart = function () { session.demarree = true; };

    reco.onresult = function (evenement) {
      if (session.terminee) { return; }
      var interim = '';
      for (var i = evenement.resultIndex; i < evenement.results.length; i++) {
        var resultat = evenement.results[i];
        var transcription = (resultat[0] && resultat[0].transcript) || '';
        if (resultat.isFinal) { session.finalise += transcription; } else { interim += transcription; }
      }
      session.interim = interim;
      afficher();
    };

    reco.onerror = function (evenement) {
      var code = (evenement && evenement.error) || '';
      if (session.terminee || code === 'aborted') { return; }
      clore();
      session.interim = ''; // jamais d'interim fantôme
      afficher();
      curseurEnFin();
      bouton.classList.add('erreur');
      setTimeout(function () { bouton.classList.remove('erreur'); }, 1200);
      if (code === 'no-speech') {
        toast("Je n'ai rien entendu. Touchez le micro et réessayez.", 'erreur');
      } else if (code === 'not-allowed' || code === 'service-not-allowed') {
        toast('Micro refusé. Autorisez le micro dans les réglages du navigateur, ou tapez votre texte.', 'erreur');
      } else {
        toast("La dictée n'a pas abouti. Réessayez, ou tapez votre texte.", 'erreur');
      }
    };

    reco.onend = function () { finaliser(); };

    dicteeCourante = session;
    bouton.setAttribute('aria-pressed', 'true');
    bouton.classList.add('ecoute');
    etatLigne.textContent = 'Je vous écoute…';
    etatLigne.hidden = false;
    annoncerDictee('Je vous écoute…');
    session.minuteur = setTimeout(function () { session.arreter(); }, DICTEE_TIMEOUT_MS);
    try {
      reco.start(); // la demande d'autorisation micro n'arrive qu'ici, jamais au chargement
    } catch (e) {
      clore();
      toast("La dictée n'a pas abouti. Réessayez, ou tapez votre texte.", 'erreur');
    }
  }

  // Région d'annonce partagée + micros des champs statiques du panneau.
  function initDictee() {
    if (!Reco) { return; } // API absente : l'interface d'avant, complète, sans bruit
    var region = document.createElement('div');
    region.id = 'statut-dictee';
    region.className = 'visuellement-cache';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
    attacherDictee($('#noeud-notes'), 'Notes');
    attacherDictee($('#relation-notes'), 'Note de la relation');
    // Recherche carte (v3-⑥) : dictée en mode remplacement — une transcription
    // imparfaite ne corrompt rien, le résultat est visible et gratuit à corriger.
    attacherDictee($('#recherche-carte'), null, { remplacer: true });
  }

  // Aide contextuelle : un seul toast de découverte, à la première fiche.
  function signalerDecouverteDictee() {
    if (!Reco) { return; }
    try {
      if (window.localStorage.getItem('ultima-dictee-vue')) { return; }
      window.localStorage.setItem('ultima-dictee-vue', '1');
    } catch (e) { return; } // stockage indisponible : pas d'aide, pas d'erreur
    toast("Nouveau : touchez le micro d'un champ pour dicter.");
  }

  // ---------- Géocodage d'adresse : « Trouver sur la carte » (v3-⑤) ----------
  // Geste explicite, jamais de recherche à la frappe (politique Nominatim
  // ≤ 1 req/s). Le géocodage est une aide, jamais un péage : « Enregistrer »
  // fonctionne toujours, position ou pas. Aucune adresse en console/logs.

  var GEO_LIMITE = 3;         // 3 résultats max : zéro scroll, lisible au pouce
  var GEO_TIMEOUT_MS = 8000;  // filet front (le serveur coupe à 5 s)
  var GEO_CADENCE_MS = 1000;  // anti-rafale : 1 s de repos après chaque réponse
  var GEO_LIBELLE_BOUTON = 'Trouver sur la carte';
  var GEO_MESSAGES = {
    vide: "Indiquez d'abord une ville ou une adresse.",
    introuvable: "Adresse introuvable. Essayez avec la ville seule, ou vérifiez l'orthographe.",
    indisponible: "La recherche d'adresse ne répond pas. Réessayez dans un instant — " +
      'ou enregistrez sans position : vous pourrez placer ce contact plus tard.',
    cadence: 'Une recherche à la fois : patientez une seconde puis réessayez.'
  };

  var geoCache = {}; // q → résultats : jamais deux requêtes pour la même adresse
  var geoJeton = 0;  // anti-course : une réponse obsolète s'abandonne

  // Icône épingle (spec graphisme) : goutte + point, trait currentColor.
  function svgEpingle(taille) {
    var svg = svgElement('svg', {
      viewBox: '0 0 24 24', width: String(taille), height: String(taille),
      'aria-hidden': 'true', fill: 'none', stroke: 'currentColor',
      'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(svgElement('path', {
      d: 'M12 21c-4.2-3.7-6.5-7-6.5-10.3a6.5 6.5 0 0 1 13 0C18.5 14 16.2 17.3 12 21Z'
    }));
    svg.appendChild(svgElement('circle', { cx: '12', cy: '10.5', r: '2.5' }));
    return svg;
  }

  // Zone role="status" : messages ET annonces, relisibles (jamais en toast).
  function messageGeo(texte) {
    $('#geo-message').textContent = texte || '';
  }

  function fermerListeGeo(rendreFocus) {
    var liste = $('#geo-suggestions');
    liste.hidden = true;
    liste.textContent = '';
    if (rendreFocus) { $('#geo-bouton').focus(); }
  }

  function afficherConfirmationGeo(texte, adresse) {
    $('#geo-confirmation-texte').textContent = texte;
    $('#geo-confirmation-adresse').textContent = adresse || '';
    $('#geo-confirmation').hidden = false;
  }

  function masquerConfirmationGeo() {
    $('#geo-confirmation').hidden = true;
  }

  // Remise à zéro du composant (ouverture du formulaire, sortie vers la fiche,
  // fermeture du panneau) : l'aperçu ne survit jamais au formulaire.
  function reinitialiserGeo() {
    var bouton = $('#geo-bouton');
    if (!bouton) { return; }
    geoJeton += 1; // toute réponse encore en vol devient obsolète
    messageGeo('');
    fermerListeGeo(false);
    masquerConfirmationGeo();
    bouton.disabled = false;
    $('#geo-bouton-libelle').textContent = GEO_LIBELLE_BOUTON;
    $('#geo-zone').removeAttribute('aria-busy');
    window.UltimaCarte.effacerApercu();
  }

  // Libellé court : sans « France » final, ≤ 80 caractères (repli tronqué).
  function libelleCourtGeo(label) {
    var texte = String(label || '').replace(/,\s*France$/i, '');
    return texte.length > 80 ? texte.slice(0, 79) + '…' : texte;
  }

  // Une requête vers /api/geocode (même origine). Erreurs typées par codeGeo.
  async function appelerGeocode(q) {
    if (Object.prototype.hasOwnProperty.call(geoCache, q)) { return geoCache[q]; }
    var controleur = new AbortController();
    var minuteur = setTimeout(function () { controleur.abort(); }, GEO_TIMEOUT_MS);
    var entetes = { Accept: 'application/json' };
    if (etat.session && etat.session.access_token) {
      entetes.Authorization = 'Bearer ' + etat.session.access_token;
    }
    var reponse;
    try {
      reponse = await fetch('/api/geocode?q=' + encodeURIComponent(q) + '&limit=' + GEO_LIMITE, {
        headers: entetes,
        signal: controleur.signal
      });
    } finally {
      clearTimeout(minuteur);
    }
    if (reponse.status === 429) {
      var erreurCadence = new Error('cadence');
      erreurCadence.codeGeo = 429;
      throw erreurCadence;
    }
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true || !corps.data ||
        !Array.isArray(corps.data.results)) {
      throw new Error('géocodage indisponible');
    }
    var resultats = [];
    corps.data.results.forEach(function (r) {
      var lat = Number(r && r.lat);
      var lng = Number(r && r.lon);
      if (!isFinite(lat) || !isFinite(lng)) { return; }
      resultats.push({ lat: lat, lng: lng, libelle: libelleCourtGeo(r.label) });
    });
    geoCache[q] = resultats; // la politique Nominatim exige la mise en cache
    return resultats;
  }

  // Sélection (tap ou auto) : champs remplis, confirmation, aperçu carte.
  function choisirResultatGeo(resultat) {
    $('#noeud-lat').value = String(resultat.lat);
    $('#noeud-lng').value = String(resultat.lng);
    fermerListeGeo(false);
    afficherConfirmationGeo('Position : ', resultat.libelle);
    window.UltimaCarte.apercu(resultat.lat, resultat.lng);
    $('#geo-confirmation').focus(); // l'écran dit où on en est
  }

  function itemSuggestionGeo(resultat) {
    var item = document.createElement('li');
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'item-resultat';
    var lieu = document.createElement('span');
    lieu.className = 'item-resultat-avant';
    lieu.appendChild(svgEpingle(16));
    bouton.appendChild(lieu);
    var textes = document.createElement('span');
    textes.className = 'item-resultat-textes';
    var virgule = resultat.libelle.indexOf(',');
    var principale = document.createElement('span');
    principale.className = 'item-resultat-principale';
    principale.textContent = virgule === -1 ? resultat.libelle : resultat.libelle.slice(0, virgule);
    textes.appendChild(principale);
    if (virgule !== -1) {
      var detail = document.createElement('span');
      detail.className = 'item-resultat-detail';
      detail.textContent = resultat.libelle.slice(virgule + 1).trim();
      textes.appendChild(detail);
    }
    bouton.appendChild(textes);
    bouton.addEventListener('click', function () { choisirResultatGeo(resultat); });
    item.appendChild(bouton);
    return item;
  }

  function afficherListeGeo(resultats) {
    var liste = $('#geo-suggestions');
    liste.textContent = '';
    var titre = document.createElement('li');
    titre.className = 'liste-resultats-titre';
    titre.textContent = 'Choisissez la bonne adresse :';
    liste.appendChild(titre);
    resultats.forEach(function (r) { liste.appendChild(itemSuggestionGeo(r)); });
    liste.hidden = false;
    var premier = liste.querySelector('.item-resultat');
    if (premier) { premier.focus(); } // l'action attendue est de choisir
  }

  async function rechercherAdresseGeo() {
    var bouton = $('#geo-bouton');
    if (bouton.disabled) { return; }
    messageGeo(''); // un nouveau cycle vide la zone
    fermerListeGeo(false);

    var adresse = $('#noeud-adresse').value.trim();
    var ville = $('#noeud-ville').value.trim();
    var morceaux = [];
    if (adresse) { morceaux.push(adresse); }
    if (ville) { morceaux.push(ville); }
    var q = morceaux.join(', ');
    if (q.length < 3) {
      // Champs vides (ou trop courts pour le serveur) : aucune requête, le
      // bouton reste actif — le message dit quoi faire.
      messageGeo(GEO_MESSAGES.vide);
      return;
    }

    window.UltimaCarte.effacerApercu(); // nouvelle recherche : aperçu effacé
    var jeton = ++geoJeton;
    bouton.disabled = true;
    $('#geo-bouton-libelle').textContent = 'Recherche…';
    $('#geo-zone').setAttribute('aria-busy', 'true');

    var resultats = null;
    var erreur = null;
    try {
      resultats = await appelerGeocode(q);
    } catch (e) {
      erreur = e;
    }
    if (jeton !== geoJeton) { return; } // formulaire réinitialisé entre-temps

    $('#geo-bouton-libelle').textContent = GEO_LIBELLE_BOUTON;
    $('#geo-zone').removeAttribute('aria-busy');
    // Anti-rafale (double protection avec la garde serveur) : 1 s de repos.
    setTimeout(function () { bouton.disabled = false; }, GEO_CADENCE_MS);

    if (erreur) {
      messageGeo(erreur.codeGeo === 429 ? GEO_MESSAGES.cadence : GEO_MESSAGES.indisponible);
      return;
    }
    if (resultats.length === 0) {
      messageGeo(GEO_MESSAGES.introuvable);
    } else if (resultats.length === 1) {
      // Sélection automatique : la confirmation rend le choix visible et
      // réversible, « Enregistrer » reste un acte distinct.
      messageGeo('Adresse trouvée.');
      choisirResultatGeo(resultats[0]);
    } else {
      messageGeo(resultats.length + ' adresses trouvées.');
      afficherListeGeo(resultats);
    }
  }

  // « Changer » : position vidée, retour au champ Adresse pour corriger.
  function changerPositionGeo() {
    $('#noeud-lat').value = '';
    $('#noeud-lng').value = '';
    masquerConfirmationGeo();
    messageGeo('');
    window.UltimaCarte.effacerApercu();
    $('#noeud-adresse').focus();
  }

  // Saisie manuelle dans le details : la ligne dit d'où vient la position.
  function surSaisieManuelleGeo(evenement) {
    if (!evenement.isTrusted) { return; }
    window.UltimaCarte.effacerApercu(); // l'aperçu ne reflète plus une sélection
    var lat = $('#noeud-lat').value.trim();
    var lng = $('#noeud-lng').value.trim();
    if (!lat && !lng) {
      masquerConfirmationGeo();
    } else {
      afficherConfirmationGeo('Position saisie à la main', '');
    }
  }

  // État initial du composant à l'ouverture du formulaire nœud.
  function preparerGeoPourNoeud(noeud) {
    reinitialiserGeo();
    var details = $('#geo-details');
    if (details) { details.open = false; } // fermé par défaut, toujours
    if (noeud && typeof noeud.lat === 'number' && typeof noeud.lng === 'number') {
      // Position déjà connue : on ne re-géocode jamais pour l'afficher (1 req/s).
      afficherConfirmationGeo('Position enregistrée sur la carte', '');
    }
  }

  function initGeocodage() {
    var bouton = $('#geo-bouton');
    if (!bouton) { return; }
    bouton.addEventListener('click', rechercherAdresseGeo);
    $('#geo-changer').addEventListener('click', changerPositionGeo);
    $('#noeud-lat').addEventListener('input', surSaisieManuelleGeo);
    $('#noeud-lng').addEventListener('input', surSaisieManuelleGeo);
    // Échap dans la liste : ferme la liste SANS fermer le panneau (le
    // gestionnaire global d'Échap ne doit pas recevoir l'événement).
    $('#geo-suggestions').addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape') {
        evenement.stopPropagation();
        fermerListeGeo(true);
      }
    });
  }

  // ---------- Recherche sur la carte (v3-⑥) : nom + ville, zoom + halo ----------
  // Client-side sur les nœuds déjà chargés, filtres IGNORÉS (une question
  // nominative gagne toujours sur une vue de tournée). Zéro endpoint.

  var RECHERCHE_SEUIL = 2;   // en dessous : liste fermée, jamais d'état d'erreur
  var RECHERCHE_PLAFOND = 5; // ~280 px : la liste tient sous le pouce sans scroll

  function messageRecherche(texte) {
    var zone = $('#recherche-message');
    if (zone) { zone.textContent = texte || ''; }
  }

  function fermerListeRecherche() {
    var liste = $('#recherche-resultats');
    if (!liste) { return; }
    liste.hidden = true;
    liste.textContent = '';
    $('#recherche-carte').setAttribute('aria-expanded', 'false');
  }

  function majCroixRecherche() {
    $('#recherche-effacer').hidden = $('#recherche-carte').value === '';
  }

  // Vidage complet : champ, croix, liste, message, halo. La carte reste où
  // elle est (Paul travaille peut-être sur la zone trouvée).
  function viderRecherche() {
    $('#recherche-carte').value = '';
    majCroixRecherche();
    fermerListeRecherche();
    messageRecherche('');
    window.UltimaCarte.effacerSurbrillance();
  }

  // Le nœud est-il actuellement visible avec les filtres métier ?
  function noeudVisibleAvecFiltres(noeud) {
    return etat.filtres.types.has(noeud.type) && etat.filtres.statuts.has(noeud.statut);
  }

  // Tri déterministe : nom commençant par le terme, puis nom contenant,
  // puis ville correspondante ; à égalité, ordre alphabétique fr (Contacts).
  function rangRecherche(noeud, terme) {
    var nom = normaliserTexte(noeud.nom);
    if (nom.indexOf(terme) === 0) { return 0; }
    if (nom.indexOf(terme) !== -1) { return 1; }
    return 2;
  }

  // Sélection d'un résultat : zoom + halo + fiche (l'ouverture de fiche
  // efface le halo précédent, on le repose après). Nœud sans position :
  // fiche seule, carte immobile, aucun halo.
  function choisirResultatRecherche(noeud) {
    fermerListeRecherche();
    var masque = !noeudVisibleAvecFiltres(noeud);
    if (contactAPosition(noeud)) {
      window.UltimaCarte.zoomerSur(noeud.lat, noeud.lng);
      ouvrirFiche(noeud.id);
      window.UltimaCarte.surligner(noeud.lat, noeud.lng);
      if (masque) {
        // On ne modifie JAMAIS les filtres en douce : on explique.
        messageRecherche('Ce contact est masqué par vos filtres — le repère montre son emplacement.');
      }
    } else {
      ouvrirFiche(noeud.id);
    }
    $('#panneau-titre').focus();
  }

  // Échec de recherche → début de création : formulaire nœud, Nom pré-rempli
  // (texte tel que saisi), curseur en fin de champ.
  function ajouterDepuisRecherche(brut) {
    if (!etat.modeDemo && !etat.session) {
      toast('Connectez-vous pour ajouter un contact.', 'erreur');
      return;
    }
    fermerListeRecherche();
    messageRecherche('');
    ouvrirFormDepuisAccueil(null);
    var champNom = $('#noeud-nom');
    champNom.value = brut;
    champNom.focus();
    try { champNom.setSelectionRange(brut.length, brut.length); } catch (e) { /* non sélectionnable */ }
  }

  function ligneInfoRecherche(texte) {
    var item = document.createElement('li');
    item.className = 'liste-resultats-vide';
    item.textContent = texte;
    return item;
  }

  function itemResultatRecherche(noeud) {
    var item = document.createElement('li');
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'item-resultat';
    bouton.dataset.resultat = 'oui'; // vrai résultat (≠ bouton « + Ajouter »)

    var avant = document.createElement('span');
    avant.className = 'item-resultat-avant';
    var pastille = document.createElement('span');
    pastille.className = 'pastille pastille-' + noeud.type;
    avant.appendChild(pastille);
    bouton.appendChild(avant);

    var textes = document.createElement('span');
    textes.className = 'item-resultat-textes';
    var principale = document.createElement('span');
    principale.className = 'item-resultat-principale';
    principale.textContent = noeud.nom || '(sans nom)';
    textes.appendChild(principale);
    var detail = document.createElement('span');
    detail.className = 'item-resultat-detail';
    detail.textContent = (LIBELLES_TYPE[noeud.type] || noeud.type) +
      (noeud.ville ? ' · ' + noeud.ville : '');
    textes.appendChild(detail);
    bouton.appendChild(textes);

    if (!contactAPosition(noeud)) {
      var aPlacer = document.createElement('span');
      aPlacer.className = 'badge-a-placer';
      aPlacer.textContent = 'À placer';
      bouton.appendChild(aPlacer);
    }

    bouton.addEventListener('click', function () { choisirResultatRecherche(noeud); });
    item.appendChild(bouton);
    return item;
  }

  // Rendu en direct à chaque frappe (la dictée EST une frappe : l'événement
  // input synthétique passe par ici aussi).
  function rendreRecherche() {
    var champ = $('#recherche-carte');
    var liste = $('#recherche-resultats');
    majCroixRecherche();
    window.UltimaCarte.effacerSurbrillance(); // nouvelle saisie : halo effacé

    var brut = champ.value.trim();
    var terme = normaliserTexte(brut);
    if (terme.length < RECHERCHE_SEUIL) {
      fermerListeRecherche();
      messageRecherche('');
      return;
    }

    var correspondants = etat.noeuds.filter(function (n) {
      return correspondAuTerme(n, terme);
    }).sort(function (a, b) {
      var ecart = rangRecherche(a, terme) - rangRecherche(b, terme);
      if (ecart !== 0) { return ecart; }
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    liste.textContent = '';
    if (correspondants.length === 0) {
      liste.appendChild(ligneInfoRecherche('Aucun contact ne correspond à “' + brut + '”.'));
      var itemAjout = document.createElement('li');
      var boutonAjout = document.createElement('button');
      boutonAjout.type = 'button';
      boutonAjout.className = 'item-resultat item-resultat-ajouter';
      boutonAjout.textContent = '+ Ajouter “' + tronquer(brut, 40) + '” comme contact';
      boutonAjout.addEventListener('click', function () { ajouterDepuisRecherche(brut); });
      itemAjout.appendChild(boutonAjout);
      liste.appendChild(itemAjout);
      messageRecherche('Aucun contact trouvé.');
    } else {
      correspondants.slice(0, RECHERCHE_PLAFOND).forEach(function (n) {
        liste.appendChild(itemResultatRecherche(n));
      });
      if (correspondants.length > RECHERCHE_PLAFOND) {
        var reste = correspondants.length - RECHERCHE_PLAFOND;
        liste.appendChild(ligneInfoRecherche(
          'et ' + reste + (reste > 1 ? ' autres' : ' autre') + ' — précisez votre recherche'));
      }
      messageRecherche(correspondants.length +
        (correspondants.length > 1 ? ' contacts trouvés.' : ' contact trouvé.'));
    }
    liste.hidden = false;
    champ.setAttribute('aria-expanded', 'true');
  }

  function initRecherche() {
    var champ = $('#recherche-carte');
    if (!champ) { return; }
    var liste = $('#recherche-resultats');
    var conteneur = champ.closest('.champ-recherche-carte');

    champ.addEventListener('input', rendreRecherche);

    $('#recherche-effacer').addEventListener('click', function () {
      viderRecherche();
      champ.focus();
    });

    // Clavier dans le champ : ↓ ouvre la navigation, Entrée = 1er résultat,
    // Échap en deux temps (liste → texte) sans jamais piéger (3e temps :
    // propagation au gestionnaire global qui ferme le panneau).
    champ.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'ArrowDown') {
        var premierBouton = liste.querySelector('button');
        if (!liste.hidden && premierBouton) {
          evenement.preventDefault();
          premierBouton.focus();
        }
      } else if (evenement.key === 'Enter') {
        // Seul un vrai résultat se sélectionne à l'Entrée (jamais « + Ajouter »).
        var premierResultat = liste.querySelector('.item-resultat[data-resultat]');
        if (!liste.hidden && premierResultat) {
          evenement.preventDefault();
          premierResultat.click();
        }
      } else if (evenement.key === 'Escape') {
        if (!liste.hidden) {
          evenement.preventDefault(); // le type=search ne vide pas le texte
          evenement.stopPropagation(); // le panneau ne se ferme pas
          fermerListeRecherche();
          messageRecherche('');
        } else if (champ.value !== '') {
          evenement.preventDefault();
          evenement.stopPropagation();
          viderRecherche();
        }
        // Champ vide et liste fermée : l'événement se propage (fermeture panneau).
      }
    });

    // Clavier dans la liste : ↓/↑ circulent, ↑ sur le 1er rend le champ,
    // Échap ferme la liste et rend le focus au champ.
    liste.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape') {
        evenement.preventDefault();
        evenement.stopPropagation();
        champ.focus();
        fermerListeRecherche();
        messageRecherche('');
        return;
      }
      if (evenement.key !== 'ArrowDown' && evenement.key !== 'ArrowUp') { return; }
      var boutons = Array.prototype.slice.call(liste.querySelectorAll('button'));
      var index = boutons.indexOf(document.activeElement);
      if (index === -1) { return; }
      evenement.preventDefault();
      if (evenement.key === 'ArrowDown') {
        if (index < boutons.length - 1) { boutons[index + 1].focus(); }
      } else if (index === 0) {
        champ.focus();
      } else {
        boutons[index - 1].focus();
      }
    });

    // Sortie du composant (Tab, tap ailleurs) : la liste se referme.
    conteneur.addEventListener('focusout', function (evenement) {
      if (evenement.relatedTarget && conteneur.contains(evenement.relatedTarget)) { return; }
      fermerListeRecherche();
    });
  }

  // ---------- Formulaire nœud (ajout / édition) ----------

  function ouvrirFormNoeud(idEdition) {
    etat.noeudEnEdition = idEdition || null;
    var noeud = idEdition ? trouverNoeud(idEdition) : null;
    $('#noeud-type').value = noeud ? noeud.type : 'artisan';
    $('#noeud-nom').value = noeud ? (noeud.nom || '') : '';
    $('#noeud-statut').value = noeud ? noeud.statut : 'prospect';
    $('#noeud-ville').value = noeud ? (noeud.ville || '') : '';
    $('#noeud-adresse').value = noeud ? (noeud.adresse || '') : '';
    $('#noeud-telephone').value = noeud ? (noeud.telephone || '') : '';
    $('#noeud-email').value = noeud ? (noeud.email || '') : '';
    $('#noeud-lat').value = noeud && typeof noeud.lat === 'number' ? String(noeud.lat) : '';
    $('#noeud-lng').value = noeud && typeof noeud.lng === 'number' ? String(noeud.lng) : '';
    $('#noeud-notes').value = noeud ? (noeud.notes || '') : '';
    preparerGeoPourNoeud(noeud);
    ouvrirPanneau('noeud', idEdition ? 'Modifier le nœud' : 'Ajouter un nœud');
  }

  async function soumettreFormNoeud(evenement) {
    evenement.preventDefault();
    var valeurs = {
      type: $('#noeud-type').value,
      nom: $('#noeud-nom').value.trim(),
      statut: $('#noeud-statut').value
    };
    // Position optionnelle (saisie progressive) : les deux champs vont
    // ensemble. Vides → création : champs omis ; édition : null (vidage).
    var latBrut = $('#noeud-lat').value.trim();
    var lngBrut = $('#noeud-lng').value.trim();
    if (!latBrut && !lngBrut) {
      if (etat.noeudEnEdition) {
        valeurs.lat = null;
        valeurs.lng = null;
      }
    } else {
      var lat = parseFloat(latBrut);
      var lng = parseFloat(lngBrut);
      if (!isFinite(lat) || !isFinite(lng)) {
        toast('Latitude et longitude vont ensemble : remplissez les deux, ou aucune.', 'erreur');
        return;
      }
      valeurs.lat = lat;
      valeurs.lng = lng;
    }
    // Champs optionnels : jamais de chaîne vide vers l'API (rejetée pour
    // l'email). Création → champ omis ; édition → null (vidage effectif).
    ['ville', 'adresse', 'telephone', 'email', 'notes'].forEach(function (champ) {
      var brut = $('#noeud-' + champ).value.trim();
      if (brut) {
        valeurs[champ] = brut;
      } else if (etat.noeudEnEdition) {
        valeurs[champ] = null;
      }
    });
    if (!valeurs.nom || TYPES.indexOf(valeurs.type) === -1 || STATUTS.indexOf(valeurs.statut) === -1) {
      toast('Formulaire incomplet.', 'erreur');
      return;
    }
    try {
      var id = await sauverNoeud(valeurs);
      toast(etat.noeudEnEdition ? 'Nœud mis à jour.' : 'Nœud ajouté.');
      etat.noeudEnEdition = null;
      rafraichir();
      if (id && trouverNoeud(id)) { ouvrirFiche(id); } else { fermerPanneau(); }
    } catch (e) {
      toast('Enregistrement impossible.', 'erreur');
    }
  }

  // ---------- Formulaire relation ----------

  function ouvrirFormRelation(idSource) {
    var source = trouverNoeud(idSource);
    if (!source) { return; }
    etat.noeudCourant = idSource;

    $('#relation-source').textContent = 'Depuis : ' + (source.nom || '(sans nom)');
    var select = $('#relation-cible');
    select.textContent = '';
    etat.noeuds.forEach(function (n) {
      if (n.id === idSource) { return; }
      var option = document.createElement('option');
      option.value = n.id;
      option.textContent = (n.nom || '(sans nom)') + ' — ' + (LIBELLES_TYPE[n.type] || n.type);
      select.appendChild(option);
    });
    if (!select.options.length) {
      toast('Aucun autre nœud à relier.', 'erreur');
      return;
    }
    $('#relation-type').value = 'apport_affaires';
    $('#relation-notes').value = '';
    ouvrirPanneau('relation', 'Relier deux nœuds');
  }

  async function soumettreFormRelation(evenement) {
    evenement.preventDefault();
    var valeurs = {
      source_id: etat.noeudCourant,
      target_id: $('#relation-cible').value,
      type: $('#relation-type').value,
      notes: $('#relation-notes').value.trim()
    };
    if (!valeurs.source_id || !valeurs.target_id || !LIBELLES_RELATION[valeurs.type]) {
      toast('Formulaire incomplet.', 'erreur');
      return;
    }
    try {
      await creerRelation(valeurs);
      toast('Relation créée.');
      rafraichir();
      ouvrirFiche(valeurs.source_id);
    } catch (e) {
      toast('Création de la relation impossible.', 'erreur');
    }
  }

  // ---------- Filtres ----------

  function majFiltres() {
    var types = new Set();
    var statuts = new Set();
    document.querySelectorAll('input[data-filtre="type"]:checked').forEach(function (c) {
      types.add(c.value);
    });
    document.querySelectorAll('input[data-filtre="statut"]:checked').forEach(function (c) {
      statuts.add(c.value);
    });
    etat.filtres = { types: types, statuts: statuts };
    rafraichir();
  }

  // ---------- Authentification Supabase (mode connecté) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function initAuth() {
    if (!configPresente()) {
      etat.modeDemo = true;
      $('#bandeau-demo').hidden = false;
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      // CDN supabase-js indisponible : on retombe en mode démo, signalé.
      etat.modeDemo = true;
      $('#bandeau-demo').hidden = false;
      toast('Client Supabase indisponible — mode démo.', 'erreur');
      return;
    }
    etat.modeDemo = false;
    var cfg = window.ULTIMA_CONFIG;
    etat.client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    var resultat = await etat.client.auth.getSession();
    etat.session = (resultat && resultat.data && resultat.data.session) || null;

    etat.client.auth.onAuthStateChange(function (evenement, session) {
      etat.session = session;
      if (evenement === 'SIGNED_IN' || evenement === 'SIGNED_OUT' || evenement === 'TOKEN_REFRESHED') {
        majAuthUi();
        chargerDonnees();
      }
    });

    $('#zone-auth').hidden = false;
    majAuthUi();
  }

  function majAuthUi() {
    if (etat.modeDemo) { return; }
    $('#form-connexion').hidden = Boolean(etat.session);
    $('#bouton-deconnexion').hidden = !etat.session;
  }

  async function envoyerLienMagique(evenement) {
    evenement.preventDefault();
    var email = $('#champ-email').value.trim();
    if (!email || !etat.client) { return; }
    try {
      var resultat = await etat.client.auth.signInWithOtp({
        email: email,
        // Ultima est mono-utilisateur (décision 2026-07-03) : jamais de
        // création de compte via le lien magique.
        options: { emailRedirectTo: window.location.origin, shouldCreateUser: false }
      });
      if (resultat.error) { throw resultat.error; }
      toast('Lien de connexion envoyé. Vérifiez votre boîte mail.');
    } catch (e) {
      toast('Envoi du lien impossible.', 'erreur');
    }
  }

  async function seDeconnecter() {
    if (!etat.client) { return; }
    try {
      await etat.client.auth.signOut();
      toast('Déconnecté.');
    } catch (e) {
      toast('Déconnexion impossible.', 'erreur');
    }
  }

  // ---------- Branchement des événements ----------

  function brancherEvenements() {
    document.querySelectorAll('.barre-onglets .onglet').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        activerOnglet(bouton.getAttribute('data-onglet'));
      });
    });

    $('#contacts-ajouter').addEventListener('click', function () {
      if (!etat.modeDemo && !etat.session) {
        toast('Connectez-vous pour ajouter un contact.', 'erreur');
        return;
      }
      ouvrirFormDepuisAccueil(null);
    });

    $('#contacts-recherche').addEventListener('input', rendreContacts);

    $('#bouton-ajouter').addEventListener('click', function () {
      if (!etat.modeDemo && !etat.session) {
        toast('Connectez-vous pour ajouter un nœud.', 'erreur');
        return;
      }
      ouvrirFormNoeud(null);
    });

    $('#bouton-fermer-panneau').addEventListener('click', fermerPanneau);
    $('#bouton-annuler-noeud').addEventListener('click', function () {
      if (etat.noeudCourant) { ouvrirFiche(etat.noeudCourant); } else { fermerPanneau(); }
    });
    $('#bouton-annuler-relation').addEventListener('click', function () {
      if (etat.noeudCourant) { ouvrirFiche(etat.noeudCourant); } else { fermerPanneau(); }
    });

    $('#form-noeud').addEventListener('submit', soumettreFormNoeud);
    $('#form-relation').addEventListener('submit', soumettreFormRelation);
    $('#form-connexion').addEventListener('submit', envoyerLienMagique);
    $('#bouton-deconnexion').addEventListener('click', seDeconnecter);

    document.querySelectorAll('input[data-filtre]').forEach(function (caseFiltre) {
      caseFiltre.addEventListener('change', majFiltres);
    });

    var boutonFiltres = $('#bouton-filtres');
    boutonFiltres.addEventListener('click', function () {
      var filtres = $('#filtres');
      var ouverts = filtres.classList.toggle('ouverts');
      boutonFiltres.setAttribute('aria-expanded', ouverts ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape' && !$('#panneau').hidden) { fermerPanneau(); }
    });
  }

  // ---------- Démarrage ----------

  async function demarrer() {
    if (typeof window.L === 'undefined') {
      // CDN Leaflet inaccessible : on signale sans planter ; l'Accueil et la
      // navigation restent utilisables (UltimaCarte.rendre ignore l'appel).
      toast('Bibliothèque de carte indisponible. Rechargez la page.', 'erreur');
    } else {
      window.UltimaCarte.init('carte', { surClicNoeud: ouvrirFiche });
    }
    brancherEvenements();
    initDictee(); // micros des champs statiques (sans API : ne fait rien)
    initGeocodage(); // « Trouver sur la carte » du formulaire nœud
    initRecherche(); // recherche nom/ville de l'onglet Carte (v3-⑥)
    activerOnglet('accueil'); // l'app démarre toujours sur l'Accueil
    await initAuth();
    await chargerDonnees();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
