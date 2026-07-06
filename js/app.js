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

  var etat = {
    noeuds: [],
    relations: [],
    filtres: { types: new Set(TYPES), statuts: new Set(STATUTS) },
    modeDemo: true,
    client: null,        // client supabase-js (mode connecté)
    session: null,
    noeudCourant: null,  // id du nœud affiché dans la fiche
    noeudEnEdition: null // id du nœud en cours d'édition dans le formulaire
  };

  function $(selecteur) { return document.querySelector(selecteur); }

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
      { id: 'demo-r1', source_id: 'demo-n4', target_id: 'demo-n2', type: 'apport_affaires', notes: 'Dossiers copropriétés du 6e arrondissement.' },
      { id: 'demo-r2', source_id: 'demo-n5', target_id: 'demo-n6', type: 'apport_affaires', notes: 'Lead transmis en juin.' },
      { id: 'demo-r3', source_id: 'demo-n4', target_id: 'demo-n7', type: 'apport_affaires', notes: '' },
      { id: 'demo-r4', source_id: 'demo-n1', target_id: 'demo-n8', type: 'chantier_commun', notes: 'Lot menuiseries extérieures.' },
      { id: 'demo-r5', source_id: 'demo-n2', target_id: 'demo-n8', type: 'chantier_commun', notes: 'Lot plomberie.' },
      { id: 'demo-r6', source_id: 'demo-n2', target_id: 'demo-n3', type: 'sous_traitance', notes: 'Sous-traite l’électricité sur les petits chantiers.' }
    ];
    return { noeuds: noeuds, relations: relations };
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
      rafraichir();
      return;
    }
    if (!etat.session) {
      etat.noeuds = [];
      etat.relations = [];
      rafraichir();
      return;
    }
    try {
      var data = await appelApi('/api/reseau');
      etat.noeuds = (data && data.nodes) || [];
      etat.relations = (data && data.edges) || [];
      rafraichir();
    } catch (e) {
      toast('Chargement du réseau impossible.', 'erreur');
    }
  }

  function rafraichir() {
    window.UltimaCarte.rendre(etat.noeuds, etat.relations, etat.filtres);
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
      etat.noeuds = etat.noeuds.filter(function (n) { return n.id !== id; });
      etat.relations = etat.relations.filter(function (r) {
        return r.source_id !== id && r.target_id !== id;
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
      return;
    }
    await appelApi('/api/reseau/edges', {
      method: 'DELETE',
      body: JSON.stringify({ id: id })
    });
    await chargerDonnees();
  }

  function trouverNoeud(id) {
    return etat.noeuds.find(function (n) { return n.id === id; }) || null;
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
  }

  // ---------- Fiche ----------

  function ouvrirFiche(id) {
    etat.noeudCourant = id;
    var noeud = trouverNoeud(id);
    ouvrirPanneau('fiche', (noeud && noeud.nom) || 'Fiche');
    rendreFiche();
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

        item.appendChild(texte);
        item.appendChild(suppr);
        liste.appendChild(item);
      });
      conteneur.appendChild(liste);
    }

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
    ouvrirPanneau('noeud', idEdition ? 'Modifier le nœud' : 'Ajouter un nœud');
  }

  async function soumettreFormNoeud(evenement) {
    evenement.preventDefault();
    var lat = parseFloat($('#noeud-lat').value);
    var lng = parseFloat($('#noeud-lng').value);
    if (!isFinite(lat) || !isFinite(lng)) {
      toast('Latitude et longitude sont requises.', 'erreur');
      return;
    }
    var valeurs = {
      type: $('#noeud-type').value,
      nom: $('#noeud-nom').value.trim(),
      statut: $('#noeud-statut').value,
      lat: lat,
      lng: lng
    };
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
      // CDN Leaflet inaccessible : on signale sans planter.
      toast('Bibliothèque de carte indisponible. Rechargez la page.', 'erreur');
      return;
    }
    window.UltimaCarte.init('carte', { surClicNoeud: ouvrirFiche });
    brancherEvenements();
    await initAuth();
    await chargerDonnees();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
