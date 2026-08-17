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
  // Les deux efforts chiffrés de la migration 0003, notés de 1 à 5. Ils vivaient
  // en base et étaient validés par l'API depuis le 2026-07-03 sans qu'aucun
  // écran ne puisse les atteindre — branchés le 2026-08-12.
  var CHAMPS_EFFORT = ['effort_temps', 'effort_energie'];
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
    // RIVEN 0024 — les PERSONNES, séparées des nœuds. Une personne peut n'avoir
    // AUCUN rattachement (elle existe quand même) ou en avoir plusieurs (elle
    // sert plusieurs fiches, avec un rôle sur chacune).
    personnes: [],
    rattachements: [],
    modeDemo: true,
    client: null,        // client supabase-js (mode connecté)
    session: null,
    onglet: 'accueil',   // espace actif : accueil | ciel | contacts
    registreContacts: 'fiches', // onglet Contacts : fiches | personnes
    noeudCourant: null,  // id du nœud affiché dans la fiche
    noeudEnEdition: null, // id du nœud en cours d'édition dans le formulaire
    personneCourante: null,   // id de la personne affichée dans la fiche
    personneEnEdition: null,  // id de la personne en cours d'édition
    noeudARattacher: null,    // fiche cible du formulaire de rattachement
    // Corriger sans détruire (2026-08-12) : l'objet qu'on répare garde son id.
    relationEnEdition: null,     // id de la relation en cours d'édition
    rattachementEnEdition: null, // id du rattachement dont on change le rôle
    noeudNouveau: null,  // id du contact tout juste ajouté (pousse animée, A4)
    // Saisie en SÉRIE (2026-08-12) : combien d'objets créés à la suite sans
    // avoir rouvert le formulaire. Remis à zéro à chaque ouverture par
    // « + Ajouter », incrémenté SEULEMENT après une création confirmée.
    serieNoeuds: 0,
    seriePersonnes: 0,
    // INTENDANT (AD-5c-δ) : dossiers d'approvisionnement adossés aux chantiers.
    // chantiers = dossiers ouverts, besoins = lignes (avec leur `etat`),
    // alertes = alertes J-2 [{chantier_id, node_id, date_pose, manquants}].
    intendant: { chantiers: [], besoins: [], alertes: [], indisponible: false }
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
      { id: 'demo-n1', type: 'artisan', nom: 'Menuiserie Delcourt', secteur_activite: 'Menuiserie', ville: 'Lille', adresse: '12 rue Nationale', telephone: '03 20 55 41 20', email: 'contact@menuiserie-delcourt.fr', statut: 'actif', lat: 50.6292, lng: 3.0573, notes: 'Menuiserie bois et alu. Très fiable sur les délais.' },
      // Fiche de démonstration des quatre axes de détail (0024) : c'est elle
      // que le harnais lit pour prouver que chaque champ atteint la fiche.
      { id: 'demo-n2', type: 'artisan', nom: 'Plomberie Roux & Fils', secteur_activite: 'Plomberie', ville: 'Lyon', adresse: '8 quai Saint-Vincent', telephone: '04 78 30 12 45', email: 'contact@plomberie-roux.fr', statut: 'actif', lat: 45.764, lng: 4.8357, notes: 'Chauffage et sanitaire. Disponible sous 48 h.', nature: 'Entreprise', metiers_secondaires: ['Chauffage', 'Pompe à chaleur'], prestations: 'Sanitaire complet, remplacement de chaudière, pose de PAC air/eau.', zone_intervention: 'Rhône et Ain', rayon_km: 60, effectif: 7, certifications: ['RGE', 'QualiPAC'], fiabilite: 5, reactivite: 4, niveau_prix: 3, disponibilite: 'sous 48 h' },
      { id: 'demo-n3', type: 'artisan', nom: 'Élec Ferrand', secteur_activite: 'Électricité', ville: 'Nantes', adresse: '25 rue de Strasbourg', telephone: '02 40 47 89 12', email: 'ferrand.elec@orange.fr', statut: 'prospect', lat: 47.2184, lng: -1.5536, notes: 'Rencontré au salon Habitat. À rappeler.' },
      { id: 'demo-n4', type: 'partenaire', nom: 'Agence Habitat Sud', secteur_activite: 'Courtage', ville: 'Marseille', adresse: '4 la Canebière', telephone: '04 91 54 22 10', email: 'contact@habitat-sud.fr', statut: 'actif', lat: 43.2965, lng: 5.3698, notes: 'Agence immobilière, apporte des dossiers de rénovation.' },
      { id: 'demo-n5', type: 'partenaire', nom: 'Courtage Bâti Ouest', secteur_activite: 'Courtage', ville: 'Rennes', adresse: '2 place de Bretagne', telephone: '02 99 78 34 56', email: 'contact@bati-ouest.fr', statut: 'actif', lat: 48.1173, lng: -1.6778, notes: 'Courtier travaux, commission 5 %.' },
      { id: 'demo-n6', type: 'lead', nom: 'M. Lambert — rénovation toiture', secteur_activite: 'Toiture', ville: 'Bordeaux', adresse: '18 cours de l’Intendance', telephone: '06 12 34 56 78', email: 'p.lambert@gmail.com', statut: 'prospect', lat: 44.8378, lng: -0.5792, notes: 'Devis envoyé le 15/06, relance prévue.' },
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
    // 0024 — les personnes de la démo, dans la forme EXACTE du GET /api/reseau
    // (mêmes clés, mêmes types) : le harnais n'exerce jamais une donnée que la
    // vraie API ne saurait produire (pre-mortem P7).
    // Le jeu démontre les deux cas neufs, et rien d'autre :
    //   - demo-p3 n'a AUCUN rattachement → une personne sans nœud, licite ;
    //   - demo-p1 en a DEUX, avec deux rôles distincts.
    var personnes = [
      { id: 'demo-p1', nom: 'Karim Roux', fonction: 'Gérant', telephone: '06 11 22 33 44', email: 'k.roux@plomberie-roux.fr', notes: 'Décide seul. Répond mieux le matin.' },
      { id: 'demo-p2', nom: 'Sophie Delcourt', fonction: 'Conductrice de travaux', telephone: '06 55 66 77 88', email: 'sophie@menuiserie-delcourt.fr', notes: '' },
      { id: 'demo-p3', nom: 'Godefroy Aubert', fonction: 'Courtier indépendant', telephone: '06 44 33 22 11', email: 'g.aubert@courtage.fr', notes: 'Rencontré au salon. Aucune entreprise attachée pour le moment.' }
    ];
    var rattachements = [
      { id: 'demo-pn1', personne_id: 'demo-p1', node_id: 'demo-n2', role: 'Gérant' },
      { id: 'demo-pn2', personne_id: 'demo-p1', node_id: 'demo-n8', role: "Référent plomberie" },
      { id: 'demo-pn3', personne_id: 'demo-p2', node_id: 'demo-n1', role: 'Conductrice de travaux' }
    ];
    return {
      noeuds: noeuds,
      relations: relations,
      journal: journal,
      personnes: personnes,
      rattachements: rattachements
    };
  }

  // INTENDANT — jeu de démo : un dossier ouvert sur le chantier Voltaire
  // (pose à J+1, 1 manquant → alerte J-2 exercée par le harnais) ; le chantier
  // Garonne reste SANS dossier (flux « Ouvrir l'intendance » exerçable).
  function donneesDemoIntendant() {
    return {
      chantiers: [
        { id: 'demo-ic1', node_id: 'demo-n8', date_pose: dateLocaleIso(1) }
      ],
      besoins: [
        { id: 'demo-ib1', chantier_id: 'demo-ic1', designation: 'Fenêtre PVC 120×95', quantite: 2, unite: null, mode: 'stock', commande_ref: null, livree_le: null, controle: 'en_attente' },
        { id: 'demo-ib2', chantier_id: 'demo-ic1', designation: 'Aile de recouvrement zinc', quantite: 1, unite: null, mode: 'aucune', commande_ref: null, livree_le: null, controle: 'en_attente' },
        { id: 'demo-ib3', chantier_id: 'demo-ic1', designation: 'Charnières laiton', quantite: 6, unite: null, mode: 'commande', commande_ref: 'BC-2189', livree_le: null, controle: 'en_attente' }
      ]
    };
  }

  // Miroir front de la colonne générée `etat` (0008_intendant.sql) — utilisé
  // en mode démo uniquement ; en connecté, l'état vient toujours de la base.
  function etatBesoinLocal(besoin) {
    if (besoin.mode === 'stock') { return 'couvert'; }
    if (besoin.mode === 'commande') {
      if (besoin.controle === 'conforme') { return 'couvert'; }
      if (besoin.controle === 'casse') { return 'manquant'; }
      return 'commande_en_attente';
    }
    return 'manquant';
  }

  // Miroir front de computeAlertesJ2 (api/_lib/intendant.js) : les chantiers
  // dont la pose est dans [aujourd'hui, +2 j] avec au moins un manquant.
  function calculerAlertesJ2Local(chantiers, besoins) {
    var aujourdHui = dateLocaleIso(0);
    var manquants = {};
    besoins.forEach(function (b) {
      if (b.etat === 'manquant') {
        manquants[b.chantier_id] = (manquants[b.chantier_id] || 0) + 1;
      }
    });
    var alertes = [];
    chantiers.forEach(function (c) {
      if (!c.date_pose) { return; }
      var jours = -joursDeRetard(c.date_pose, aujourdHui); // futur → positif
      if (jours < 0 || jours > 2) { return; }
      var nb = manquants[c.id] || 0;
      if (nb < 1) { return; }
      alertes.push({ chantier_id: c.id, node_id: c.node_id, date_pose: c.date_pose, manquants: nb });
    });
    return alertes;
  }

  // Recalcul après chaque mutation : états (démo seulement — en connecté les
  // lignes reviennent de l'API avec leur `etat` généré) puis alertes J-2.
  function recalculerIntendant() {
    var d = etat.intendant;
    if (etat.modeDemo) {
      d.besoins.forEach(function (b) { b.etat = etatBesoinLocal(b); });
    }
    d.alertes = calculerAlertesJ2Local(d.chantiers, d.besoins);
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
      etat.personnes = demo.personnes;
      etat.rattachements = demo.rattachements;
      var demoIntendant = donneesDemoIntendant();
      etat.intendant.chantiers = demoIntendant.chantiers;
      etat.intendant.besoins = demoIntendant.besoins;
      etat.intendant.indisponible = false;
      recalculerIntendant();
      rafraichir();
      saluerParLeo();
      return;
    }
    if (!etat.session) {
      etat.noeuds = [];
      etat.relations = [];
      etat.journal = [];
      etat.personnes = [];
      etat.rattachements = [];
      etat.intendant = { chantiers: [], besoins: [], alertes: [], indisponible: false };
      rafraichir();
      return;
    }
    // Un seul GET agrégé par domaine, lancés de front (jamais de N+1).
    // L'intendance est fail-soft : son échec ne bloque jamais le réseau.
    var promesseIntendant = appelApi('/api/intendant').catch(function () { return null; });
    try {
      var data = await appelApi('/api/reseau');
      etat.noeuds = (data && data.nodes) || [];
      etat.relations = (data && data.edges) || [];
      etat.journal = (data && data.journal) || [];
      etat.personnes = (data && data.personnes) || [];
      etat.rattachements = (data && data.rattachements) || [];
    } catch (e) {
      toast('Chargement du réseau impossible.', 'erreur');
      return;
    }
    var dataIntendant = await promesseIntendant;
    if (dataIntendant) {
      etat.intendant.chantiers = dataIntendant.chantiers || [];
      etat.intendant.besoins = dataIntendant.besoins || [];
      etat.intendant.alertes = dataIntendant.alertes_j2 || [];
      etat.intendant.indisponible = false;
    } else {
      etat.intendant = { chantiers: [], besoins: [], alertes: [], indisponible: true };
    }
    rafraichir();
    saluerParLeo();
  }

  // Léo (boucle L1) : cartouche d'accueil une fois les données bootées —
  // démo comme connecté, jamais sur l'écran de connexion (la branche sans
  // session ne signale pas). Le module js/leo-accueil.js gère « une fois
  // par session de navigation » et le fail-closed (pas de données → rien).
  function saluerParLeo() {
    if (!window.UltimaLeo) { return; }
    window.UltimaLeo.accueillir(
      {
        noeuds: etat.noeuds,
        relations: etat.relations,
        journal: etat.journal,
        // AD-5c-δ : les alertes J-2 de l'INTENDANT (fail-soft côté Léo).
        intendant: { alertes_j2: etat.intendant.alertes }
      },
      { ouvrirCible: ouvrirCibleDepuisAccueil },
      // L2 : la voix, uniquement avec une session réelle (jamais en démo).
      // L2b : candidats de résolution locale des cibles dictées ({ id,
      // libelle } minimaux — jamais envoyés à l'IA) + toast de succès.
      (etat.session && etat.session.access_token)
        ? {
            quadrant: 'riven',
            jeton: etat.session.access_token,
            candidats: {
              cibles: etat.noeuds.map(function (n) {
                return { id: n.id, libelle: n.nom || '' };
              }),
              chantiers: etat.intendant.chantiers.map(function (c) {
                return { id: c.id, libelle: nomNoeud(c.node_id) };
              })
            },
            notifier: function (message) { toast(message, 'succes'); },
            // Les YEUX de Léo sur RIVEN (boucle ①, 2026-08-01) : l'état borné
            // du quadrant, calculé sur les données DÉJÀ chargées par la page.
            etat: etatRiven()
          }
        : null
    );
  }

  // L'état borné de RIVEN — ce que Léo « voit » pour répondre « où j'en suis ».
  //
  // ARBITRAGE DE PAUL (2026-08-01) : « je valide les noms dans l'IA, mais bien
  // protégés. » Les NOMS partent donc — c'est ce qui permet à Léo d'être utile
  // (« relance Untel » plutôt que « 3 relances dues »). « Bien protégés » se
  // traduit en règles dures, tenues ici et prouvées PAR L'ABSENCE au harnais :
  //   ① UN NOM, RIEN D'AUTRE. Jamais de téléphone, d'e-mail, d'adresse, de
  //      coordonnées géographiques — ce sont elles qui permettent de JOINDRE
  //      un tiers, pas son nom.
  //   ② JAMAIS DE CONTENU. Aucune note de fiche, aucune note de journal,
  //      aucune prochaine étape : ce que Paul écrit SUR quelqu'un ne sort pas.
  //   ③ JAMAIS D'IDENTIFIANT. Les id restent locaux (règle permanente : le
  //      réseau EST de la PII, IDs uniquement en log — ici, même pas eux).
  //   ④ BORNÉ. 40 entrées par liste au plus (borne serveur), donc jamais un
  //      export du carnet d'adresses.
  //   ⑤ La marque qui accompagne un nom est une CATÉGORIE (type, échéance),
  //      jamais une appréciation ni un chiffre d'affaires.
  function etatRiven() {
    return construireEtatRiven(
      etat.noeuds || [],
      etat.relations || [],
      etat.journal || [],
      (etat.intendant && Array.isArray(etat.intendant.alertes)) ? etat.intendant.alertes : [],
      new Date().toISOString().slice(0, 10)
    );
  }

  // La construction proprement dite : PURE (aucun accès au DOM ni à l'état
  // global) → exercée directement par le harnais, qui cherche dans son résultat
  // les coordonnées, les notes et les identifiants, et exige de NE PAS les y
  // trouver.
  function construireEtatRiven(noeuds, relations, journal, alertes, aujourdHui) {
    function compter(liste, predicat) { return liste.filter(predicat).length; }

    // Un nom, borné, rien d'autre. Le point de passage OBLIGÉ de toute donnée
    // nominative vers l'IA : si un jour un champ s'ajoute à une fiche, il ne
    // peut pas sortir par ici sans qu'on le décide.
    function nomSeul(noeud) {
      return (noeud && noeud.nom ? String(noeud.nom) : '').trim().slice(0, 200);
    }
    function parId(liste) {
      var index = {};
      liste.forEach(function (n) { if (n && n.id) { index[n.id] = n; } });
      return index;
    }
    var noeudParId = parId(noeuds);

    var dues = journal.filter(function (j) {
      return j && j.relance_at && j.relance_at <= aujourdHui && !j.relance_faite;
    });

    var listes = {};

    // ① Les contacts : le nom + sa catégorie. Les plus « vivants » d'abord
    // (leads et relations en cours passent avant les chantiers terminés), pour
    // que la troncature à 40 coupe le moins utile.
    var RANG = { lead: 0, artisan: 1, partenaire: 2, chantier: 3 };
    var contacts = noeuds
      .filter(function (n) { return nomSeul(n); })
      .slice()
      .sort(function (a, b) {
        var ra = RANG[a.type] === undefined ? 9 : RANG[a.type];
        var rb = RANG[b.type] === undefined ? 9 : RANG[b.type];
        if (ra !== rb) { return ra - rb; }
        return nomSeul(a).localeCompare(nomSeul(b), 'fr');
      })
      .slice(0, 40)
      .map(function (n) {
        var item = { libelle: nomSeul(n) };
        var type = (n.type ? String(n.type) : '').trim();
        if (type) { item.marque = type; }
        return item;
      });
    if (contacts.length > 0) { listes['Les contacts du réseau'] = contacts; }

    // ② Les relances dues, nommées : c'est ce qui rend Léo utile. Le NOM du
    // contact et l'échéance — jamais la note ni la prochaine étape écrite.
    var relances = dues
      .map(function (j) {
        var cible = j.node_id ? noeudParId[j.node_id] : null;
        var nom = nomSeul(cible);
        if (!nom) { return null; }
        return {
          libelle: nom,
          marque: j.relance_at < aujourdHui ? 'en retard' : 'aujourd’hui'
        };
      })
      .filter(Boolean)
      .slice(0, 40);
    if (relances.length > 0) { listes['Les relances dues'] = relances; }

    // ③ Les secteurs : un métier, pas une personne.
    var parSecteur = {};
    noeuds.forEach(function (n) {
      var secteur = (n && n.secteur_activite ? String(n.secteur_activite) : '').trim();
      if (!secteur) { return; }
      parSecteur[secteur] = (parSecteur[secteur] || 0) + 1;
    });
    var secteurs = Object.keys(parSecteur)
      .sort(function (a, b) { return parSecteur[b] - parSecteur[a] || a.localeCompare(b, 'fr'); })
      .slice(0, 40)
      .map(function (secteur) {
        return {
          libelle: secteur.slice(0, 200),
          marque: parSecteur[secteur] + (parSecteur[secteur] > 1 ? ' contacts' : ' contact')
        };
      });
    if (secteurs.length > 0) { listes['Les secteurs du réseau'] = secteurs; }

    return {
      compteurs: {
        'contacts au réseau': noeuds.length,
        'artisans': compter(noeuds, function (n) { return n && n.type === 'artisan'; }),
        'partenaires': compter(noeuds, function (n) { return n && n.type === 'partenaire'; }),
        'leads actifs': compter(noeuds, function (n) {
          return n && n.type === 'lead' && n.statut !== 'termine' && n.statut !== 'inactif';
        }),
        'chantiers': compter(noeuds, function (n) { return n && n.type === 'chantier'; }),
        'relations en cours': compter(relations, function (r) {
          return r && (r.statut === 'en_cours' || r.statut === 'contact_etabli');
        }),
        'relations fructueuses': compter(relations, function (r) {
          return r && r.statut === 'fructueux';
        }),
        'relances dues': dues.length,
        'relances en retard': compter(dues, function (j) { return j.relance_at < aujourdHui; }),
        'chantiers en alerte J-2': alertes.length
      },
      listes: listes
    };
  }

  // Exposé pour les harnais : fonction PURE, aucune donnée réelle embarquée.
  window.UltimaRiven = { construireEtatRiven: construireEtatRiven };

  function rafraichir() {
    rendreAccueil();
    if (etat.onglet === 'ciel') { rendreCiel(); }
    rendreContacts();
    if (etat.noeudCourant && !$('#vue-fiche').hidden) {
      rendreFiche();
    } else if (etat.personneCourante && !$('#vue-fiche').hidden) {
      rendreFichePersonne();
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

  // ---- Personnes (0024) : mêmes gestes que pour un nœud, autre table ----

  async function sauverPersonne(valeurs) {
    if (etat.modeDemo) {
      if (etat.personneEnEdition) {
        var existante = trouverPersonne(etat.personneEnEdition);
        if (existante) { Object.assign(existante, valeurs); }
      } else {
        valeurs.id = idLocal();
        etat.personnes.push(valeurs);
      }
      return valeurs.id || etat.personneEnEdition;
    }
    if (etat.personneEnEdition) {
      await appelApi('/api/reseau/personnes', {
        method: 'PATCH',
        body: JSON.stringify(Object.assign({ id: etat.personneEnEdition }, valeurs))
      });
      await chargerDonnees();
      return etat.personneEnEdition;
    }
    var creee = await appelApi('/api/reseau/personnes', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    await chargerDonnees();
    return creee && creee.id;
  }

  async function supprimerPersonne(id) {
    if (etat.modeDemo) {
      etat.personnes = etat.personnes.filter(function (p) { return p.id !== id; });
      // Cascade locale identique à la FK on delete cascade : les rattachements
      // partent, AUCUNE fiche n'est touchée.
      etat.rattachements = etat.rattachements.filter(function (r) {
        return r.personne_id !== id;
      });
      return;
    }
    await appelApi('/api/reseau/personnes', {
      method: 'DELETE',
      body: JSON.stringify({ id: id })
    });
    await chargerDonnees();
  }

  async function creerRattachement(valeurs) {
    if (etat.modeDemo) {
      valeurs.id = idLocal();
      etat.rattachements.push(valeurs);
      return;
    }
    await appelApi('/api/reseau/rattachements', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    await chargerDonnees();
  }

  // Corriger le rôle SANS détacher : le lien garde son id, la personne n'est
  // ni recréée ni retirée du registre. L'API `PATCH` existait depuis 0024 ; le
  // front ne l'appelait nulle part.
  async function majRattachement(id, valeurs) {
    if (etat.modeDemo) {
      var lien = etat.rattachements.find(function (r) { return r.id === id; });
      if (lien) { Object.assign(lien, valeurs); }
      return;
    }
    await appelApi('/api/reseau/rattachements', {
      method: 'PATCH',
      body: JSON.stringify(Object.assign({ id: id }, valeurs))
    });
    await chargerDonnees();
  }

  async function supprimerRattachement(id) {
    if (etat.modeDemo) {
      etat.rattachements = etat.rattachements.filter(function (r) { return r.id !== id; });
      return;
    }
    await appelApi('/api/reseau/rattachements', {
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

  // ---------- INTENDANT (AD-5c-δ) : mutations du dossier d'approvisionnement ----------
  // Démo : mutations en mémoire + recalcul local (miroir de la colonne générée).
  // Connecté : l'API renvoie la ligne à jour (avec son `etat` dérivé en base) ;
  // on l'applique à l'état puis on recalcule les alertes — zéro re-fetch.

  function remplacerLigneIntendant(liste, ligne) {
    var i = liste.findIndex(function (x) { return x.id === ligne.id; });
    if (i !== -1) { liste[i] = ligne; }
  }

  async function ouvrirDossierIntendant(nodeId, datePose) {
    if (etat.modeDemo) {
      etat.intendant.chantiers.push({ id: idLocal(), node_id: nodeId, date_pose: datePose || null });
      recalculerIntendant();
      return;
    }
    var corps = { node_id: nodeId };
    if (datePose) { corps.date_pose = datePose; }
    var cree = await appelApi('/api/intendant/chantiers', {
      method: 'POST',
      body: JSON.stringify(corps)
    });
    if (cree) { etat.intendant.chantiers.push(cree); }
    recalculerIntendant();
  }

  async function majDossierIntendant(id, valeurs) {
    if (etat.modeDemo) {
      var dossier = etat.intendant.chantiers.find(function (c) { return c.id === id; });
      if (dossier) { Object.assign(dossier, valeurs); }
      recalculerIntendant();
      return;
    }
    var maj = await appelApi('/api/intendant/chantiers', {
      method: 'PATCH',
      body: JSON.stringify(Object.assign({ id: id }, valeurs))
    });
    if (maj) { remplacerLigneIntendant(etat.intendant.chantiers, maj); }
    recalculerIntendant();
  }

  async function creerBesoinIntendant(valeurs) {
    if (etat.modeDemo) {
      etat.intendant.besoins.push(Object.assign({
        id: idLocal(),
        unite: null,
        mode: 'aucune',
        commande_ref: null,
        livree_le: null,
        controle: 'en_attente'
      }, valeurs));
      recalculerIntendant();
      return;
    }
    var cree = await appelApi('/api/intendant/besoins', {
      method: 'POST',
      body: JSON.stringify(valeurs)
    });
    if (cree) { etat.intendant.besoins.push(cree); }
    recalculerIntendant();
  }

  async function majBesoinIntendant(id, valeurs) {
    if (etat.modeDemo) {
      var besoin = etat.intendant.besoins.find(function (b) { return b.id === id; });
      if (besoin) { Object.assign(besoin, valeurs); }
      recalculerIntendant();
      return;
    }
    var maj = await appelApi('/api/intendant/besoins', {
      method: 'PATCH',
      body: JSON.stringify(Object.assign({ id: id }, valeurs))
    });
    if (maj) { remplacerLigneIntendant(etat.intendant.besoins, maj); }
    recalculerIntendant();
  }

  async function supprimerBesoinIntendant(id) {
    if (!etat.modeDemo) {
      await appelApi('/api/intendant/besoins', {
        method: 'DELETE',
        body: JSON.stringify({ id: id })
      });
    }
    etat.intendant.besoins = etat.intendant.besoins.filter(function (b) { return b.id !== id; });
    recalculerIntendant();
  }

  function trouverNoeud(id) {
    return etat.noeuds.find(function (n) { return n.id === id; }) || null;
  }

  function trouverRelation(id) {
    return etat.relations.find(function (r) { return r.id === id; }) || null;
  }

  // ---- Lectures dérivées des rattachements (0024) ----
  // Jamais stockées : recalculées à chaque rendu, donc toujours exactes.

  function trouverPersonne(id) {
    return etat.personnes.find(function (p) { return p.id === id; }) || null;
  }

  // Les personnes DE cette fiche, ordonnées par nom (l'ordre du registre).
  function rattachementsDuNoeud(nodeId) {
    return etat.rattachements
      .filter(function (r) { return r.node_id === nodeId; })
      .map(function (r) { return { lien: r, personne: trouverPersonne(r.personne_id) }; })
      .filter(function (paire) { return paire.personne !== null; })
      .sort(function (a, b) {
        return (a.personne.nom || '').localeCompare(b.personne.nom || '', 'fr');
      });
  }

  // Les fiches DE cette personne. Zéro est un résultat licite, pas une anomalie.
  function rattachementsDeLaPersonne(personneId) {
    return etat.rattachements
      .filter(function (r) { return r.personne_id === personneId; })
      .map(function (r) { return { lien: r, noeud: trouverNoeud(r.node_id) }; })
      .filter(function (paire) { return paire.noeud !== null; })
      .sort(function (a, b) {
        return (a.noeud.nom || '').localeCompare(b.noeud.nom || '', 'fr');
      });
  }

  function nomNoeud(id) {
    var noeud = trouverNoeud(id);
    return (noeud && noeud.nom) || 'nœud supprimé';
  }

  // ---------- Navigation par onglets ----------

  var SECTIONS_ONGLETS = {
    accueil: '#espace-accueil',
    ciel: '#espace-ciel',
    contacts: '#espace-contacts'
  };

  function activerOnglet(nom) {
    if (!SECTIONS_ONGLETS[nom]) { return; }
    etat.onglet = nom;
    // Le panneau fiche/formulaire est un overlay global (A3) : il ne se masque
    // plus tout seul avec l'espace Carte. On le ferme donc à chaque changement
    // d'onglet (comportement d'origine). Les flux qui rouvrent une fiche/un
    // formulaire appellent activerOnglet AVANT d'ouvrir : l'ordre est préservé.
    if (!$('#panneau').hidden) { fermerPanneau(); }
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
    if (nom === 'ciel') {
      rendreCiel();
    } else if (window.UltimaCiel) {
      // Quitter le ciel arrête sa boucle d'animation. Sans cela elle
      // continuerait de tourner sous un onglet caché, pour rien.
      window.UltimaCiel.arreter();
    }
    if (nom === 'accueil') { rendreAccueil(); }
    if (nom === 'contacts') { rendreContacts(); }
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
    // La carte menait le regard sur une position ; le ciel le mène sur une
    // étoile. C'est le même geste — « montre-moi ce contact » — dans la seule
    // forme qui reste.
    activerOnglet('ciel');
    ouvrirFiche(noeud.id);
    $('#panneau-titre').focus();
  }

  function ouvrirFormDepuisAccueil(nodeId) {
    activerOnglet('ciel');
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

  // Puce des suggestions. C'était un arbre gravé ; l'arbre n'existe plus, et
  // une puce qui montre un objet disparu ment au lecteur. C'est une ÉTOILE —
  // le lieu où la suggestion mène désormais.
  function svgEtoileSuggestion() {
    var svg = svgElement('svg', {
      'class': 'lieu', viewBox: '0 0 24 24', width: '26', height: '26', 'aria-hidden': 'true'
    });
    var g = svgElement('g', {
      fill: '#efe3c6', stroke: '#3b2f1c', 'stroke-width': '1.4', 'stroke-linejoin': 'round'
    });
    g.appendChild(svgElement('path', {
      d: 'M12 3 L13.9 9.4 L20.5 10.4 L15.7 14.6 L17.2 21 L12 17.6 L6.8 21 L8.3 14.6 L3.5 10.4 L10.1 9.4 Z'
    }));
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
  // ---------- R5 : le rapprochement inédit ----------

  // Une DEMANDE est un lead ou un chantier qui nomme un métier ; une OFFRE est
  // un artisan qui exerce ce métier (principal ou secondaire). On ne propose
  // que ce couple-là : c'est le seul dont on puisse DIRE la raison. Rapprocher
  // « un partenaire et un artisan » a été écarté — sans critère de
  // correspondance, ce serait tous les partenaires × tous les artisans, donc
  // du bruit présenté comme un conseil.
  function metiersDuNoeud(noeud) {
    var liste = [];
    if (noeud.secteur_activite) { liste.push(normaliserTexte(noeud.secteur_activite)); }
    if (Array.isArray(noeud.metiers_secondaires)) {
      noeud.metiers_secondaires.forEach(function (m) {
        if (m) { liste.push(normaliserTexte(m)); }
      });
    }
    return liste;
  }

  function estClos(noeud) {
    return noeud.statut === 'termine' || noeud.statut === 'inactif';
  }

  function dejaRelies(a, b) {
    return etat.relations.some(function (r) {
      return (r.source_id === a && r.target_id === b) ||
        (r.source_id === b && r.target_id === a);
    });
  }

  function meilleurRapprochement() {
    var demandes = etat.noeuds.filter(function (n) {
      return (n.type === 'lead' || n.type === 'chantier') && !estClos(n) && n.secteur_activite;
    });
    var offres = etat.noeuds.filter(function (n) {
      return n.type === 'artisan' && !estClos(n);
    });
    var candidats = [];
    demandes.forEach(function (demandeur) {
      var besoin = normaliserTexte(demandeur.secteur_activite);
      offres.forEach(function (fournisseur) {
        if (dejaRelies(demandeur.id, fournisseur.id)) { return; }
        if (metiersDuNoeud(fournisseur).indexOf(besoin) === -1) { return; }
        candidats.push({
          demandeur: demandeur,
          fournisseur: fournisseur,
          type: demandeur.type === 'chantier' ? 'sous_traitance' : 'apport_affaires',
          motif: (fournisseur.nom || 'cet artisan') + ' fait ' +
            demandeur.secteur_activite.toLowerCase(),
          memeVille: !!(demandeur.ville && fournisseur.ville &&
            normaliserTexte(demandeur.ville) === normaliserTexte(fournisseur.ville))
        });
      });
    });
    if (!candidats.length) { return null; }
    // Départage DÉTERMINISTE : la fiabilité connue d'abord, puis la proximité,
    // puis l'alphabet — jamais l'ordre d'arrivée en base.
    candidats.sort(function (a, b) {
      var fa = typeof a.fournisseur.fiabilite === 'number' ? a.fournisseur.fiabilite : -1;
      var fb = typeof b.fournisseur.fiabilite === 'number' ? b.fournisseur.fiabilite : -1;
      if (fa !== fb) { return fb - fa; }
      if (a.memeVille !== b.memeVille) { return a.memeVille ? -1 : 1; }
      var na = (a.demandeur.nom || '') + '|' + (a.fournisseur.nom || '');
      var nb = (b.demandeur.nom || '') + '|' + (b.fournisseur.nom || '');
      return na.localeCompare(nb, 'fr');
    });
    return candidats[0];
  }

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

    // R5 — LE RAPPROCHEMENT INÉDIT (2026-08-12). Placée juste APRÈS R1, et
    // c'est un défaut trouvé par le harnais : rangée en cinquième position,
    // elle ne s'affichait JAMAIS. Le moteur plafonne à trois suggestions, et
    // R1+R2+R3 remplissent les trois places dans n'importe quel réseau réel —
    // la seule règle qui apprend quelque chose à Paul était affamée par trois
    // règles d'entretien. L'ordre dit la valeur : une relance en retard passe
    // d'abord (c'est urgent), puis une affaire possible, et seulement ensuite
    // « untel n'a pas de téléphone ». Les règles R1 à R4 réveillent
    // ce que Paul a DÉJÀ saisi ; celle-ci est la seule qui lui apprend quelque
    // chose : deux fiches qui se répondent et ne se connaissent pas. C'est la
    // demande du 2026-07-06 — Léo propose, il n'écrit jamais seul : l'action
    // ouvre le formulaire PRÉ-REMPLI, aucune écriture n'a lieu ici.
    if (suggestions.length < 3) {
      var paire = meilleurRapprochement();
      if (paire) {
        suggestions.push({
          message: (paire.demandeur.nom || '(sans nom)') + ' et ' +
            (paire.fournisseur.nom || '(sans nom)') + ' ne sont pas encore reliés — ' +
            paire.motif + '. On les rapproche ?',
          action: function () {
            activerOnglet('ciel');
            ouvrirFormRelation(paire.demandeur.id, {
              idCible: paire.fournisseur.id,
              type: paire.type
            });
            $('#panneau-titre').focus();
          }
        });
      }
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
            " n'a pas encore de ville renseignée. On la situe ?",
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
        bouton.appendChild(svgEtoileSuggestion());
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
      activerOnglet('ciel');
      toast('Touchez une étoile pour ouvrir sa fiche et noter où vous en êtes.');
    }));
    // « Voir la carte » devient « Voir le ciel » : le raccourci mène là où le
    // réseau se regarde, et il n'y a plus qu'un endroit pour cela.
    bloc.appendChild(boutonRaccourci('Voir le ciel', 'bouton-parchemin', function () {
      activerOnglet('ciel');
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
        ' Commencez par ajouter votre premier contact : il allumera sa première étoile.'));
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

  // Secteurs d\u00e9j\u00e0 saisis, d\u00e9doublonn\u00e9s par forme normalis\u00e9e (minuscules +
  // accents retir\u00e9s), tri\u00e9s alpha fr. Premi\u00e8re graphie rencontr\u00e9e conserv\u00e9e
  // pour l'affichage (comme on regroupera les contacts par secteur en A3).
  function secteursConnus() {
    var vus = Object.create(null);
    etat.noeuds.forEach(function (n) {
      var brut = (n.secteur_activite || '').trim();
      if (!brut) { return; }
      var cle = normaliserTexte(brut);
      if (!vus[cle]) { vus[cle] = brut; }
    });
    return Object.keys(vus).map(function (cle) { return vus[cle]; })
      .sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  }

  // M\u00eame r\u00e8gle que secteursConnus, appliqu\u00e9e \u00e0 n'importe quelle liste de
  // valeurs d\u00e9j\u00e0 saisies (fonctions des personnes, r\u00f4les des rattachements) :
  // d\u00e9doublonnage par forme normalis\u00e9e, premi\u00e8re graphie conserv\u00e9e, tri fr.
  // D3 (0006) : texte libre + suggestions, jamais de liste ferm\u00e9e.
  function valeursConnues(valeursBrutes) {
    var vus = Object.create(null);
    valeursBrutes.forEach(function (valeur) {
      var brut = (valeur || '').trim();
      if (!brut) { return; }
      var cle = normaliserTexte(brut);
      if (!vus[cle]) { vus[cle] = brut; }
    });
    return Object.keys(vus).map(function (cle) { return vus[cle]; })
      .sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  }

  function remplirDatalist(selecteur, valeurs) {
    var dl = $(selecteur);
    if (!dl) { return; }
    dl.textContent = '';
    valeurs.forEach(function (valeur) {
      var opt = document.createElement('option');
      opt.value = valeur;
      dl.appendChild(opt);
    });
  }

  function majDatalistFonctions() {
    remplirDatalist('#liste-fonctions', valeursConnues(
      etat.personnes.map(function (p) { return p.fonction; })
    ));
  }

  function majDatalistRoles() {
    // Les r\u00f4les d\u00e9j\u00e0 employ\u00e9s ET les fonctions connues : au moment de rattacher,
    // \u00ab G\u00e9rant \u00bb est le plus souvent d\u00e9j\u00e0 quelque part dans le registre.
    remplirDatalist('#liste-roles', valeursConnues(
      etat.rattachements.map(function (r) { return r.role; })
        .concat(etat.personnes.map(function (p) { return p.fonction; }))
    ));
  }

  // Alimente la datalist de suggestions du formulaire depuis l'\u00e9tat courant
  // (aucun appel r\u00e9seau : les secteurs viennent des contacts d\u00e9j\u00e0 charg\u00e9s).
  function majDatalistSecteurs() {
    var dl = $('#liste-secteurs');
    if (!dl) { return; }
    dl.textContent = '';
    secteursConnus().forEach(function (valeur) {
      var opt = document.createElement('option');
      opt.value = valeur;
      dl.appendChild(opt);
    });
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

  // Puce « lieu » colorée par type (le type est aussi écrit en toutes
  // lettres — la couleur ne porte jamais l'information seule). La palette
  // vivait dans carte.js ; rapatriée ici à sa suppression, elle portait encore
  // les valeurs du JOUR, choisies pour le parchemin. L'étape ④ ayant fait
  // passer l'Accueil à la nuit, ce sont désormais celles du CIEL
  // (js/ciel.js, COULEURS_NUIT) — à l'identique, sans retouche. Une seule
  // vérité chromatique pour une seule donnée : c'est la règle qu'on s'était
  // donnée en supprimant mes couleurs inventées, elle vaut aussi ici.
  var COULEURS_TYPE = {
    artisan: '#f2a15a', partenaire: '#7cb8ea', lead: '#6fd39b', chantier: '#b995e8'
  };
  function svgLieuContact(type) {
    var couleurs = COULEURS_TYPE;
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
    var registres = $('#contacts-registres');

    // Non connecté (config présente, pas de session) : bloc unique.
    if (!etat.modeDemo && !etat.session) {
      compteur.textContent = '';
      outils.hidden = true;
      boutonAjouter.hidden = true;
      registres.hidden = true;
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
    registres.hidden = false;

    // Registre PERSONNES (0024) : les gens, qui n'ont besoin d'aucun nœud.
    // Branche entière et distincte — le registre des fiches, plus bas, est
    // celui d'avant, non modifié.
    if (etat.registreContacts === 'personnes') {
      boutonAjouter.textContent = '+ Ajouter une personne';
      rendreRegistrePersonnes(conteneur, compteur, outils);
      return;
    }
    boutonAjouter.textContent = '+ Ajouter un contact';

    // Connecté (ou démo), aucune donnée : invitation au premier contact.
    if (etat.noeuds.length === 0) {
      compteur.textContent = '0 contact';
      outils.hidden = true;
      conteneur.appendChild(blocEtatContacts(
        "Votre réseau est vide pour l'instant.",
        'Commencez par ajouter votre premier contact : il allumera sa première étoile.',
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

  // ---------- Registre des personnes (0024) ----------

  // Une entrée de registre dit, en une ligne, ce qu'on cherche à savoir avant
  // d'appeler quelqu'un : qui, quel rôle, et sur combien de fiches. « Aucune
  // fiche » est écrit en toutes lettres — c'est un état normal, pas un manque.
  function itemPersonne(personne) {
    var item = document.createElement('li');
    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'item-personne';

    var textes = document.createElement('span');
    textes.className = 'item-contact-textes';
    var nom = document.createElement('span');
    nom.className = 'item-personne-nom';
    nom.textContent = personne.nom || '(sans nom)';
    textes.appendChild(nom);

    var nb = rattachementsDeLaPersonne(personne.id).length;
    var detail = document.createElement('span');
    detail.className = 'item-contact-detail';
    detail.textContent = (personne.fonction || 'Sans fonction') + ' · ' +
      (nb === 0 ? 'aucune fiche' : (nb === 1 ? '1 fiche' : nb + ' fiches'));
    textes.appendChild(detail);
    bouton.appendChild(textes);

    if (nb === 0) {
      var badges = document.createElement('span');
      badges.className = 'item-contact-badges';
      var libre = document.createElement('span');
      libre.className = 'badge-a-rattacher';
      libre.textContent = 'À rattacher';
      badges.appendChild(libre);
      bouton.appendChild(badges);
    }

    bouton.addEventListener('click', function () { ouvrirFichePersonne(personne.id); });
    item.appendChild(bouton);
    return item;
  }

  // Recherche du registre : nom et fonction. La ville n'existe pas ici — une
  // personne n'a pas d'adresse propre, elle en emprunte à ses fiches.
  function personneCorrespond(personne, terme) {
    return normaliserTexte(personne.nom).indexOf(terme) !== -1 ||
           normaliserTexte(personne.fonction).indexOf(terme) !== -1;
  }

  function rendreRegistrePersonnes(conteneur, compteur, outils) {
    if (etat.personnes.length === 0) {
      compteur.textContent = '0 personne';
      outils.hidden = true;
      conteneur.appendChild(blocEtatContacts(
        'Aucune personne enregistrée.',
        "Une personne se note seule : elle n'a besoin d'aucune fiche, et pourra en servir plusieurs.",
        '+ Ajouter une personne',
        function () { ouvrirFormPersonneDepuisRegistre(); }));
      return;
    }

    outils.hidden = false;
    compteur.textContent = etat.personnes.length +
      (etat.personnes.length > 1 ? ' personnes' : ' personne');

    var brut = $('#contacts-recherche').value.trim();
    var terme = normaliserTexte(brut);
    var visibles = etat.personnes.filter(function (p) {
      if (!terme) { return true; }
      return personneCorrespond(p, terme);
    }).sort(function (a, b) {
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    });

    if (visibles.length === 0) {
      var aucune = document.createElement('p');
      aucune.className = 'contacts-aucun';
      aucune.textContent = 'Aucune personne ne correspond à “' + brut + '”.';
      conteneur.appendChild(aucune);
      return;
    }

    var liste = document.createElement('ul');
    liste.className = 'liste-contacts';
    visibles.forEach(function (p) { liste.appendChild(itemPersonne(p)); });
    conteneur.appendChild(liste);
  }

  // Le formulaire de personne s'ouvre SUR PLACE, dans l'onglet Contacts : il
  // n'y a aucune raison de basculer sur le ciel pour saisir quelqu'un qui n'y
  // apparaîtra pas (contrairement à ouvrirFormDepuisAccueil, qui lui y va parce
  // que la fiche créée s'y place).
  function ouvrirFormPersonneDepuisRegistre() {
    ouvrirFormPersonne(null);
    $('#panneau-titre').focus();
  }

  function changerRegistreContacts(registre) {
    if (etat.registreContacts === registre) { return; }
    etat.registreContacts = registre;
    // La recherche ne traverse pas les registres : un terme tapé pour trouver
    // une ville n'a aucun sens dans le registre des personnes.
    $('#contacts-recherche').value = '';
    document.querySelectorAll('.contacts-registre').forEach(function (bouton) {
      var actif = bouton.getAttribute('data-registre') === registre;
      bouton.setAttribute('aria-selected', actif ? 'true' : 'false');
    });
    rendreContacts();
  }

  // ---------- Ciel : la SEULE forme du réseau (2026-08-13) ----------

  // La vue à plat est un RÉGLAGE, pas un état d'écran : elle survit au
  // rechargement. `localStorage` et non `sessionStorage` — un appareil qui
  // peine le fait à chaque ouverture, pas seulement dans l'onglet du jour.
  var CLE_CIEL_PLAT = 'ultima-ciel-plat';
  function cielPlatRetenu() {
    try { return window.localStorage.getItem(CLE_CIEL_PLAT) === '1'; } catch (e) { return false; }
  }
  function retenirCielPlat(actif) {
    try { window.localStorage.setItem(CLE_CIEL_PLAT, actif ? '1' : '0'); } catch (e) { /* navigation privée */ }
  }

  // Ouverture d'une fiche depuis une étoile : la fiche est un overlay global,
  // on l'ouvre SANS quitter le ciel. Cette fonction vivait dans le bloc de
  // l'arbre — elle n'était pas à l'arbre, elle était PARTAGÉE : le ciel s'en
  // sert depuis le 2026-08-11. Supprimer le bloc l'a emportée avec lui, et le
  // ciel a perdu l'ouverture de ses fiches pendant trois minutes. Rangée ici,
  // chez son seul appelant.
  function ouvrirFicheDepuisEtoile(nodeId) {
    var noeud = nodeId ? trouverNoeud(nodeId) : null;
    if (!noeud) {
      toast("Ce contact n'existe plus.", 'erreur');
      return;
    }
    ouvrirFiche(noeud.id);
    $('#panneau-titre').focus();
  }
  // La charpente vient de l'arbre (états vides, recherche par mise en évidence
  // et non par réduction, libellés) : elle lui survit, c'est tout ce qui reste
  // de lui et c'était la partie qui valait d'être gardée.

  function rendreCiel() {
    var scene = $('#ciel-scene');
    if (!scene) { return; }
    var outils = $('#ciel-outils');
    var boutonAjouter = $('#ciel-ajouter');
    var message = $('#ciel-message');
    if (window.UltimaCiel) { window.UltimaCiel.arreter(); }
    scene.textContent = '';
    if (message) { message.textContent = ''; }

    // Non connecté : invitation, pas de ciel.
    if (!etat.modeDemo && !etat.session) {
      if (outils) { outils.hidden = true; }
      if (boutonAjouter) { boutonAjouter.hidden = true; }
      scene.appendChild(blocEtatCiel(
        'Connectez-vous pour voir votre réseau',
        '— le ciel vous attend'));
      return;
    }
    if (boutonAjouter) { boutonAjouter.hidden = false; }

    if (etat.noeuds.length === 0) {
      if (outils) { outils.hidden = true; }
      scene.appendChild(blocEtatCiel(
        'Votre ciel attend sa première étoile',
        '— touchez +'));
      return;
    }
    if (outils) { outils.hidden = false; }

    // Recherche : MISE EN ÉVIDENCE, pas réduction. Une étoile qui ne
    // correspond pas s'efface sans quitter sa place — sinon on perdrait
    // l'orientation dans le volume, qui est justement ce qu'on y gagne.
    var champ = $('#ciel-recherche');
    var brut = champ ? champ.value.trim() : '';
    var terme = normaliserTexte(brut);
    var correspond = function (noeud) {
      return !terme || correspondAuTerme(noeud, terme);
    };

    var instance = window.UltimaCiel.rendre(scene, {
      noeuds: etat.noeuds,
      personnes: etat.personnes,
      rattachements: etat.rattachements,
      relations: etat.relations
    }, {
      surClicNoeud: ouvrirFicheDepuisEtoile,
      surClicPersonne: ouvrirFichePersonneDepuisCiel,
      libellesType: LIBELLES_TYPE,
      libellesStatut: LIBELLES_STATUT,
      correspond: correspond,
      // LE FOND ÉTOILÉ, ici aussi (Paul, 2026-08-17 : « mettre le fond aux
      // étoiles partout »). RIVEN garde en revanche son AMAS DE RÉSEAU — pas de
      // couronne : celle-ci range deux à quatre caps de menu, et RIVEN affiche
      // des centaines de fiches groupées par métier, où la position PORTE de
      // l'information. Le fond est un décor, la disposition est une donnée : l'un
      // se partage partout, l'autre non.
      fond: true,
      plat: cielPlatRetenu()
    });

    // L'aide de navigation revit à chaque rendu, et s'efface au premier geste.
    var aide = document.createElement('p');
    aide.id = 'ciel-aide';
    aide.className = 'ciel-aide';
    aide.textContent = 'Faites glisser pour tourner autour du réseau · ' +
      '+ et − pour approcher · Tab pour passer d’une étoile à l’autre';
    scene.appendChild(aide);
    scene.addEventListener('pointerdown', function () {
      aide.classList.add('est-effacee');
    }, { once: true });

    if (instance) {
      instance.derive($('#ciel-derive') && $('#ciel-derive').checked);
      if (etat.noeudCourant) { instance.choisir(etat.noeudCourant); }
      // Le bouton dit ce que le MOTEUR fait, pas ce que le réglage demande :
      // sous `prefers-reduced-motion`, le ciel s'impose à plat et le bouton
      // doit le refléter, sinon il ment.
      majBoutonPlat(instance.estPlat());
    }

    if (terme && message) {
      var nb = etat.noeuds.filter(correspond).length;
      message.textContent = nb === 0
        ? 'Aucun contact ne correspond à “' + brut + '”.'
        : (nb + (nb > 1 ? ' contacts mis en évidence.' : ' contact mis en évidence.'));
      // ZÉRO RÉSULTAT → CRÉATION PRÉ-REMPLIE. Cette fonction vivait dans la
      // recherche de la carte ; elle est morte avec elle le 2026-08-13, et le
      // diagnostic l'a signalée comme la SEULE perte fonctionnelle du
      // démontage. Paul a demandé de la porter : la voici, à l'identique —
      // même garde (connexion), même geste (le terme devient le nom, le
      // curseur au bout), même mot.
      if (nb === 0) {
        var boutonCreer = document.createElement('button');
        boutonCreer.type = 'button';
        boutonCreer.id = 'ciel-creer-depuis-recherche';
        boutonCreer.className = 'bouton bouton-secondaire ciel-creer';
        boutonCreer.textContent = '+ Ajouter “' + tronquer(brut, 40) + '” comme contact';
        boutonCreer.addEventListener('click', function () { creerDepuisRechercheCiel(brut); });
        message.appendChild(document.createElement('br'));
        message.appendChild(boutonCreer);
      }
    }
  }

  // Le terme cherché devient le nom du contact à créer. Repris mot pour mot de
  // `ajouterDepuisRecherche`, l'ancienne fonction de la carte.
  function creerDepuisRechercheCiel(brut) {
    if (!etat.modeDemo && !etat.session) {
      toast('Connectez-vous pour ajouter un contact.', 'erreur');
      return;
    }
    ouvrirFormNoeud(null);
    var champNom = $('#noeud-nom');
    champNom.value = brut;
    champNom.focus();
    try { champNom.setSelectionRange(brut.length, brut.length); } catch (e) { /* non sélectionnable */ }
  }

  function majBoutonPlat(actif) {
    var bouton = $('#ciel-plat');
    if (!bouton) { return; }
    bouton.setAttribute('aria-pressed', actif ? 'true' : 'false');
    bouton.textContent = actif ? 'En volume' : 'À plat';
    bouton.setAttribute('aria-label', actif
      ? 'Revenir au ciel en volume'
      : 'Vue à plat : figer le ciel, sans relief ni mouvement');
  }

  // État vide du ciel : sans bouton — le
  // « + Ajouter un contact » vit déjà sous la scène.
  function blocEtatCiel(texteFort, texteSuite) {
    var bloc = document.createElement('div');
    bloc.className = 'ciel-bloc-etat';
    var texte = document.createElement('p');
    var fort = document.createElement('strong');
    fort.textContent = texteFort;
    texte.appendChild(fort);
    texte.appendChild(document.createTextNode(' ' + texteSuite));
    bloc.appendChild(texte);
    return bloc;
  }

  // Une pastille en orbite ouvre la fiche de la personne, pas celle du nœud :
  // depuis le 2026-08-10 ce sont deux notions distinctes.
  function ouvrirFichePersonneDepuisCiel(personneId) {
    var personne = personneId ? trouverPersonne(personneId) : null;
    if (!personne) {
      toast("Cette personne n'existe plus.", 'erreur');
      return;
    }
    ouvrirFichePersonne(personne.id);
    $('#panneau-titre').focus();
  }

  // ---------- Panneau latéral ----------

  function ouvrirPanneau(vue, titre) {
    $('#panneau').hidden = false;
    $('#panneau-titre').textContent = titre;
    $('#vue-fiche').hidden = vue !== 'fiche';
    $('#form-noeud').hidden = vue !== 'noeud';
    $('#form-relation').hidden = vue !== 'relation';
    $('#form-personne').hidden = vue !== 'personne';
    $('#form-rattachement').hidden = vue !== 'rattachement';
  }

  function fermerPanneau() {
    $('#panneau').hidden = true;
    etat.noeudCourant = null;
    etat.noeudEnEdition = null;
    etat.personneCourante = null;
    etat.personneEnEdition = null;
    etat.noeudARattacher = null;
    etat.relationEnEdition = null;
    etat.rattachementEnEdition = null;
    reinitialiserGeo(); // l'aperçu et l'état de recherche ne survivent pas
  }

  // ---------- Fiche ----------

  function ouvrirFiche(id) {
    etat.noeudCourant = id;
    etat.personneCourante = null; // une seule fiche à l'écran, jamais deux
    // Toute ouverture de fiche efface le halo de recherche ; la sélection d'un
    // résultat le repose juste après (un seul halo, toujours à jour).
    reinitialiserGeo(); // sortie du formulaire (enregistrement ou annulation)
    var noeud = trouverNoeud(id);
    ouvrirPanneau('fiche', (noeud && noeud.nom) || 'Fiche');
    rendreFiche();
    signalerDecouverteDictee();
  }

  // ---- Mise en forme des champs de détail (0024) ----
  // Chacune renvoie une CHAÎNE ou une valeur fausse : ligneDetail se charge
  // seule d'omettre la ligne quand le champ n'est pas renseigné. Un 0 licite
  // (rayon nul, effectif nul) rend « 0 km » / « 0 » — chaîne, donc affichée.

  function listeEnTexte(valeurs) {
    if (!Array.isArray(valeurs) || valeurs.length === 0) { return ''; }
    return valeurs.join(' · ');
  }

  function nombreAvecUnite(valeur, unite) {
    if (typeof valeur !== 'number' || !isFinite(valeur)) { return ''; }
    return unite ? String(valeur) + ' ' + unite : String(valeur);
  }

  function noteSurCinq(valeur) {
    if (typeof valeur !== 'number' || !isFinite(valeur)) { return ''; }
    return String(valeur) + '/5';
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

    // AD-5c-δ : bandeau d'alerte J-2 en tête de fiche (chantier seulement).
    if (noeud.type === 'chantier') {
      var alerteJ2 = alerteIntendantPourNoeud(noeud.id);
      if (alerteJ2) { conteneur.appendChild(bandeauAlerteJ2(alerteJ2)); }
    }

    var dl = document.createElement('dl');
    dl.className = 'fiche-details';
    ligneDetail(dl, "Secteur d'activité", noeud.secteur_activite);
    // 0024 — les autres métiers, juste sous le principal : ils décrivent la
    // fiche sans jamais la déplacer de branche.
    ligneDetail(dl, 'Autres métiers', listeEnTexte(noeud.metiers_secondaires));
    ligneDetail(dl, 'Nature', noeud.nature);
    ligneDetail(dl, 'Ville', noeud.ville);
    ligneDetail(dl, 'Adresse', noeud.adresse);
    ligneDetail(dl, 'Téléphone', noeud.telephone);
    ligneDetail(dl, 'E-mail', noeud.email);
    ligneDetail(dl, 'Prestations', noeud.prestations);
    ligneDetail(dl, "Zone d'intervention", noeud.zone_intervention);
    ligneDetail(dl, 'Rayon', nombreAvecUnite(noeud.rayon_km, 'km'));
    ligneDetail(dl, 'Effectif', nombreAvecUnite(noeud.effectif, null));
    ligneDetail(dl, 'Certifications', listeEnTexte(noeud.certifications));
    ligneDetail(dl, 'Fiabilité', noteSurCinq(noeud.fiabilite));
    ligneDetail(dl, 'Réactivité', noteSurCinq(noeud.reactivite));
    ligneDetail(dl, 'Niveau de prix', noteSurCinq(noeud.niveau_prix));
    ligneDetail(dl, 'Disponibilité', noeud.disponibilite);
    ligneDetail(dl, 'Notes', noeud.notes);
    conteneur.appendChild(dl);

    rendrePersonnesDeLaFiche(conteneur, noeud);

    // AD-5c-δ : la check-list d'approvisionnement, adossée à la fiche chantier.
    if (noeud.type === 'chantier') {
      rendreIntendance(conteneur, noeud);
    }

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
        // Le pilotage (0003) : ce que Paul attend du rapprochement, et ce qu'il
        // lui coûte. Affiché seulement s'il est renseigné — un rapprochement
        // non pesé n'est pas une anomalie à signaler.
        if (relation.interet_qualitatif) {
          var interet = document.createElement('span');
          interet.className = 'item-relation-note';
          interet.textContent = 'Intérêt : ' + relation.interet_qualitatif;
          texte.appendChild(interet);
        }
        var efforts = CHAMPS_EFFORT
          .filter(function (champ) { return typeof relation[champ] === 'number'; })
          .map(function (champ) {
            return (champ === 'effort_temps' ? 'temps' : 'énergie') + ' ' + relation[champ] + '/5';
          });
        if (efforts.length) {
          var ligneEffort = document.createElement('span');
          ligneEffort.className = 'item-relation-note';
          ligneEffort.textContent = 'Effort : ' + efforts.join(', ');
          texte.appendChild(ligneEffort);
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

        // Corriger sans détruire : le type, la note et le pilotage se reprennent
        // ici. La relation garde son id — donc son journal.
        var modifier = document.createElement('button');
        modifier.type = 'button';
        modifier.className = 'bouton bouton-secondaire bouton-modifier-relation';
        modifier.textContent = 'Modifier';
        modifier.setAttribute('aria-label',
          'Modifier la relation avec ' + ((autre && autre.nom) || 'ce nœud'));
        modifier.addEventListener('click', function () {
          ouvrirFormRelation(null, { idEdition: relation.id });
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
        actionsRelation.appendChild(modifier);
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

  // ---------- Personnes rattachées (0024) ----------

  // Bloc « Personnes » d'une fiche : qui, avec quel rôle ICI, et de quoi les
  // joindre. Détacher retire le lien — jamais la personne, qui reste au
  // registre : c'est tout l'objet de la boucle.
  function rendrePersonnesDeLaFiche(conteneur, noeud) {
    var sousTitre = document.createElement('h3');
    sousTitre.className = 'fiche-sous-titre';
    sousTitre.textContent = 'Personnes';
    conteneur.appendChild(sousTitre);

    var paires = rattachementsDuNoeud(noeud.id);

    if (paires.length === 0) {
      var vide = document.createElement('p');
      vide.className = 'aucune-personne';
      vide.textContent = 'Aucune personne rattachée.';
      conteneur.appendChild(vide);
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-personnes';
      paires.forEach(function (paire) {
        var item = document.createElement('li');
        item.className = 'item-personne-liee';

        var texte = document.createElement('button');
        texte.type = 'button';
        texte.className = 'item-personne-texte';
        var nom = document.createElement('span');
        nom.className = 'item-personne-nom';
        nom.textContent = paire.personne.nom || '(sans nom)';
        texte.appendChild(nom);
        // Le rôle affiché est celui du RATTACHEMENT (ici), pas la fonction
        // générale de la personne : la même personne peut être gérante d'un
        // côté et apporteuse d'affaires de l'autre.
        var role = paire.lien.role || paire.personne.fonction;
        if (role) {
          var detail = document.createElement('span');
          detail.className = 'item-personne-detail';
          detail.textContent = role;
          texte.appendChild(detail);
        }
        if (paire.personne.telephone) {
          var tel = document.createElement('span');
          tel.className = 'item-personne-detail';
          tel.textContent = paire.personne.telephone;
          texte.appendChild(tel);
        }
        texte.addEventListener('click', function () {
          ouvrirFichePersonne(paire.personne.id);
        });
        item.appendChild(texte);

        // Corriger le rôle sans détacher : jusqu'ici il fallait retirer la
        // personne puis la rattacher — donc détruire le lien pour le réparer.
        var majRole = document.createElement('button');
        majRole.type = 'button';
        majRole.className = 'bouton bouton-secondaire bouton-role';
        majRole.textContent = 'Rôle';
        majRole.setAttribute('aria-label',
          'Modifier le rôle de ' + (paire.personne.nom || 'cette personne'));
        majRole.addEventListener('click', function () {
          ouvrirFormRattachement(noeud.id, { idEdition: paire.lien.id });
        });
        item.appendChild(majRole);

        var detacher = document.createElement('button');
        detacher.type = 'button';
        detacher.className = 'bouton bouton-danger bouton-detacher';
        detacher.setAttribute('aria-label', 'Détacher ' + (paire.personne.nom || 'cette personne'));
        detacher.textContent = '×';
        detacher.addEventListener('click', function () {
          if (!window.confirm('Détacher cette personne de la fiche ? Elle reste au registre.')) { return; }
          supprimerRattachement(paire.lien.id).then(function () {
            toast('Personne détachée.');
            rafraichir();
          }).catch(function () {
            toast('Détachement impossible.', 'erreur');
          });
        });
        item.appendChild(detacher);
        liste.appendChild(item);
      });
      conteneur.appendChild(liste);
    }

    var actionsPersonnes = document.createElement('div');
    actionsPersonnes.className = 'actions-personnes';
    var rattacher = document.createElement('button');
    rattacher.type = 'button';
    rattacher.id = 'fiche-rattacher';
    rattacher.className = 'bouton bouton-secondaire';
    rattacher.textContent = 'Rattacher une personne';
    rattacher.addEventListener('click', function () { ouvrirFormRattachement(noeud.id); });
    actionsPersonnes.appendChild(rattacher);
    conteneur.appendChild(actionsPersonnes);
  }

  function ouvrirFichePersonne(id) {
    etat.personneCourante = id;
    etat.noeudCourant = null;
    var personne = trouverPersonne(id);
    ouvrirPanneau('fiche', (personne && personne.nom) || 'Personne');
    rendreFichePersonne();
  }

  // Fiche d'une personne : ses coordonnées, et les fiches qu'elle sert. Zéro
  // fiche est un état NORMAL, énoncé comme tel — pas une erreur à corriger.
  function rendreFichePersonne() {
    var personne = trouverPersonne(etat.personneCourante);
    var conteneur = $('#vue-fiche');
    conteneur.textContent = '';
    if (!personne) { fermerPanneau(); return; }

    $('#panneau-titre').textContent = personne.nom || 'Personne';

    var badges = document.createElement('div');
    badges.className = 'badges';
    var badgePersonne = document.createElement('span');
    badgePersonne.className = 'badge badge-personne';
    badgePersonne.textContent = 'Personne';
    badges.appendChild(badgePersonne);
    conteneur.appendChild(badges);

    var dl = document.createElement('dl');
    dl.className = 'fiche-details';
    ligneDetail(dl, 'Fonction', personne.fonction);
    ligneDetail(dl, 'Téléphone', personne.telephone);
    ligneDetail(dl, 'E-mail', personne.email);
    ligneDetail(dl, 'Notes', personne.notes);
    conteneur.appendChild(dl);

    var sousTitre = document.createElement('h3');
    sousTitre.className = 'fiche-sous-titre';
    sousTitre.textContent = 'Fiches rattachées';
    conteneur.appendChild(sousTitre);

    var paires = rattachementsDeLaPersonne(personne.id);
    if (paires.length === 0) {
      var vide = document.createElement('p');
      vide.className = 'aucune-personne';
      vide.textContent = "Rattachée à aucune fiche pour l'instant.";
      conteneur.appendChild(vide);
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-personnes';
      paires.forEach(function (paire) {
        var item = document.createElement('li');
        item.className = 'item-personne-liee';
        var bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'item-personne-texte';
        var nom = document.createElement('span');
        nom.className = 'item-personne-nom';
        nom.textContent = paire.noeud.nom || '(sans nom)';
        bouton.appendChild(nom);
        var detail = document.createElement('span');
        detail.className = 'item-personne-detail';
        detail.textContent = (LIBELLES_TYPE[paire.noeud.type] || paire.noeud.type) +
          (paire.lien.role ? ' · ' + paire.lien.role : '');
        bouton.appendChild(detail);
        bouton.addEventListener('click', function () { ouvrirFiche(paire.noeud.id); });
        item.appendChild(bouton);
        liste.appendChild(item);
      });
      conteneur.appendChild(liste);
    }

    var actions = document.createElement('div');
    actions.className = 'actions-fiche';

    var modifier = document.createElement('button');
    modifier.type = 'button';
    modifier.className = 'bouton bouton-secondaire';
    modifier.textContent = 'Modifier';
    modifier.addEventListener('click', function () { ouvrirFormPersonne(personne.id); });

    var supprimer = document.createElement('button');
    supprimer.type = 'button';
    supprimer.className = 'bouton bouton-danger';
    supprimer.textContent = 'Supprimer';
    supprimer.addEventListener('click', function () {
      if (!window.confirm('Supprimer cette personne ? Les fiches du réseau ne sont pas touchées.')) { return; }
      supprimerPersonne(personne.id).then(function () {
        toast('Personne supprimée.');
        fermerPanneau();
        rafraichir();
      }).catch(function () {
        toast('Suppression impossible.', 'erreur');
      });
    });

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

  // ---------- INTENDANT (AD-5c-δ) : section « Intendance » de la fiche chantier ----------
  // La check-list, pas l'ERP : date de pose, lignes de besoins avec leur état
  // généré (couvert / commande en attente / manquant), ajout, couverture,
  // livraison, contrôle réception, suppression. Compteur « manquants détectés
  // à J-2 » (métrique de preuve du cadrage §9.2). DOM : createElement/textContent.

  var LIBELLES_ETAT_BESOIN = {
    couvert: 'Couvert',
    commande_en_attente: 'Commande en attente',
    manquant: 'Manquant'
  };
  var MODES_BESOIN = ['aucune', 'stock', 'commande'];
  var LIBELLES_MODE_BESOIN = {
    aucune: 'À couvrir',
    stock: 'Stock propre',
    commande: 'Commande'
  };

  function alerteIntendantPourNoeud(nodeId) {
    return etat.intendant.alertes.find(function (a) { return a.node_id === nodeId; }) || null;
  }

  // « aujourd'hui » / « dans N jour(s) » pour une date de pose à venir.
  function libelleJoursPose(datePose) {
    var jours = -joursDeRetard(datePose, dateLocaleIso(0));
    if (jours <= 0) { return "aujourd'hui"; }
    return 'dans ' + jours + (jours > 1 ? ' jours' : ' jour');
  }

  // Bandeau d'alerte J-2 en tête de fiche : sobre, encre rouge, relisible.
  function bandeauAlerteJ2(alerte) {
    var bandeau = document.createElement('p');
    bandeau.className = 'bandeau-j2';
    bandeau.setAttribute('role', 'status');
    bandeau.textContent = 'Pose ' + libelleJoursPose(alerte.date_pose) + ' — ' +
      alerte.manquants + (alerte.manquants > 1 ? ' manquants' : ' manquant') + '.';
    return bandeau;
  }

  function paragrapheIntendance(texte) {
    var p = document.createElement('p');
    p.className = 'aucune-relation';
    p.textContent = texte;
    return p;
  }

  // Une mutation d'intendance : succès → toast + re-rendu ; échec → toast
  // générique (jamais de détail technique) + rappel optionnel (revert UI).
  function executerMutationIntendance(promesse, messageSucces, surEchec) {
    promesse.then(function () {
      if (messageSucces) { toast(messageSucces); }
      rafraichir();
    }).catch(function (e) {
      if (typeof surEchec === 'function') { surEchec(); }
      toast(e && e.message ? e.message : 'Mise à jour impossible.', 'erreur');
    });
  }

  // Dossier absent : ouverture sobre (date de pose optionnelle).
  function formOuvrirIntendance(noeud) {
    var form = document.createElement('form');
    form.className = 'form-intendance';

    var intro = document.createElement('p');
    intro.className = 'aucune-relation';
    intro.textContent = "Aucun dossier d'approvisionnement pour ce chantier.";
    form.appendChild(intro);

    var labelDate = document.createElement('label');
    labelDate.className = 'intendance-label';
    labelDate.appendChild(document.createTextNode('Date de pose (optionnelle)'));
    var champDate = document.createElement('input');
    champDate.type = 'date';
    labelDate.appendChild(champDate);
    form.appendChild(labelDate);

    var bouton = document.createElement('button');
    bouton.type = 'submit';
    bouton.className = 'bouton bouton-secondaire';
    bouton.textContent = "Ouvrir l'intendance";
    form.appendChild(bouton);

    form.addEventListener('submit', function (evenement) {
      evenement.preventDefault();
      bouton.disabled = true; // anti double-tap (unicité un dossier/chantier)
      executerMutationIntendance(
        ouvrirDossierIntendant(noeud.id, champDate.value || null),
        'Intendance ouverte.',
        function () { bouton.disabled = false; }
      );
    });
    return form;
  }

  // Ligne de besoin : désignation + état visible, puis gestes de pilotage.
  function itemBesoinIntendance(besoin) {
    var item = document.createElement('li');
    item.className = 'item-besoin';

    var entete = document.createElement('div');
    entete.className = 'item-besoin-entete';
    var titre = document.createElement('span');
    titre.className = 'item-besoin-titre';
    titre.textContent = besoin.designation + ' — ' + besoin.quantite +
      (besoin.unite ? ' ' + besoin.unite : '');
    entete.appendChild(titre);
    var badgeEtat = document.createElement('span');
    var classeEtat = besoin.etat === 'couvert' ? 'couvert'
      : (besoin.etat === 'commande_en_attente' ? 'attente' : 'manquant');
    badgeEtat.className = 'badge-etat badge-etat-' + classeEtat;
    badgeEtat.textContent = LIBELLES_ETAT_BESOIN[besoin.etat] || besoin.etat;
    entete.appendChild(badgeEtat);
    item.appendChild(entete);

    var actions = document.createElement('div');
    actions.className = 'item-besoin-actions';

    // Couverture : quitter le mode commande efface ses attributs (cohérence
    // API/CHECK 0008 : aucun attribut de commande hors mode commande).
    var selectMode = document.createElement('select');
    selectMode.setAttribute('aria-label', 'Couverture — ' + besoin.designation);
    MODES_BESOIN.forEach(function (m) {
      var option = document.createElement('option');
      option.value = m;
      option.textContent = LIBELLES_MODE_BESOIN[m];
      selectMode.appendChild(option);
    });
    selectMode.value = besoin.mode || 'aucune';
    selectMode.addEventListener('change', function () {
      var valeurs = { mode: selectMode.value };
      if (selectMode.value !== 'commande') {
        valeurs.commande_ref = null;
        valeurs.fournisseur_node_id = null;
        valeurs.livree_le = null;
        valeurs.controle = 'en_attente';
      }
      executerMutationIntendance(
        majBesoinIntendant(besoin.id, valeurs),
        'Ligne mise à jour.',
        function () { selectMode.value = besoin.mode || 'aucune'; }
      );
    });
    actions.appendChild(selectMode);

    if (besoin.mode === 'commande') {
      var champRef = document.createElement('input');
      champRef.type = 'text';
      champRef.maxLength = 120;
      champRef.placeholder = 'Réf. commande';
      champRef.setAttribute('aria-label', 'Référence de commande — ' + besoin.designation);
      champRef.value = besoin.commande_ref || '';
      champRef.addEventListener('change', function () {
        executerMutationIntendance(
          majBesoinIntendant(besoin.id, { commande_ref: champRef.value.trim() || null }),
          'Ligne mise à jour.',
          function () { champRef.value = besoin.commande_ref || ''; }
        );
      });
      actions.appendChild(champRef);

      if (!besoin.livree_le) {
        var boutonLivree = document.createElement('button');
        boutonLivree.type = 'button';
        boutonLivree.className = 'bouton bouton-secondaire';
        boutonLivree.textContent = "Livrée aujourd'hui";
        boutonLivree.addEventListener('click', function () {
          executerMutationIntendance(
            majBesoinIntendant(besoin.id, { livree_le: dateLocaleIso(0) }),
            'Livraison notée — contrôlez la réception.'
          );
        });
        actions.appendChild(boutonLivree);
      } else if (besoin.controle === 'en_attente') {
        // Contrôle réception : « couvert » = livré ET contrôlé conforme.
        var mention = document.createElement('span');
        mention.className = 'item-besoin-mention';
        mention.textContent = 'Livrée le ' + dateLisible(besoin.livree_le) + ' — contrôle :';
        actions.appendChild(mention);

        var boutonConforme = document.createElement('button');
        boutonConforme.type = 'button';
        boutonConforme.className = 'bouton bouton-secondaire';
        boutonConforme.textContent = 'Conforme';
        boutonConforme.addEventListener('click', function () {
          executerMutationIntendance(
            majBesoinIntendant(besoin.id, { controle: 'conforme' }),
            'Réception conforme — besoin couvert.'
          );
        });
        actions.appendChild(boutonConforme);

        var boutonCasse = document.createElement('button');
        boutonCasse.type = 'button';
        boutonCasse.className = 'bouton bouton-danger';
        boutonCasse.textContent = 'Cassé';
        boutonCasse.addEventListener('click', function () {
          executerMutationIntendance(
            majBesoinIntendant(besoin.id, { controle: 'casse' }),
            'Casse signalée — le besoin repasse en manquant.'
          );
        });
        actions.appendChild(boutonCasse);
      } else if (besoin.controle === 'conforme') {
        var conforme = document.createElement('span');
        conforme.className = 'item-besoin-mention';
        conforme.textContent = 'Livrée le ' + dateLisible(besoin.livree_le) + ' · conforme';
        actions.appendChild(conforme);
      } else {
        var casse = document.createElement('span');
        casse.className = 'item-besoin-mention item-besoin-casse';
        casse.textContent = 'Livrée le ' + dateLisible(besoin.livree_le) + ' · cassée';
        actions.appendChild(casse);

        var relancer = document.createElement('button');
        relancer.type = 'button';
        relancer.className = 'bouton bouton-secondaire';
        relancer.textContent = 'Relancer la commande';
        relancer.addEventListener('click', function () {
          executerMutationIntendance(
            majBesoinIntendant(besoin.id, { livree_le: null, controle: 'en_attente' }),
            'Commande relancée — en attente.'
          );
        });
        actions.appendChild(relancer);
      }
    }

    var retirer = document.createElement('button');
    retirer.type = 'button';
    retirer.className = 'bouton-lien-danger';
    retirer.textContent = 'Retirer';
    retirer.addEventListener('click', function () {
      if (!window.confirm('Retirer cette ligne de la check-list ?')) { return; }
      executerMutationIntendance(supprimerBesoinIntendant(besoin.id), 'Ligne retirée.');
    });
    actions.appendChild(retirer);

    item.appendChild(actions);
    return item;
  }

  // Formulaire d'ajout : désignation (dictée vocale, motif existant) +
  // quantité + mode ; la référence de commande n'apparaît qu'en mode commande.
  function formAjoutBesoin(dossier) {
    var form = document.createElement('form');
    form.className = 'form-besoin';

    var champDesignation = document.createElement('input');
    champDesignation.type = 'text';
    champDesignation.maxLength = 200;
    champDesignation.required = true;
    champDesignation.placeholder = 'Désignation (ex. : fenêtre 120×95)';
    champDesignation.setAttribute('aria-label', 'Désignation du besoin');
    form.appendChild(champDesignation);
    attacherDictee(champDesignation); // le formulaire est recréé à chaque rendu

    var ligne = document.createElement('div');
    ligne.className = 'form-besoin-ligne';
    var champQuantite = document.createElement('input');
    champQuantite.type = 'number';
    champQuantite.min = '0';
    champQuantite.step = 'any';
    champQuantite.value = '1';
    champQuantite.setAttribute('aria-label', 'Quantité');
    ligne.appendChild(champQuantite);

    var selectMode = document.createElement('select');
    selectMode.setAttribute('aria-label', 'Mode de couverture');
    MODES_BESOIN.forEach(function (m) {
      var option = document.createElement('option');
      option.value = m;
      option.textContent = LIBELLES_MODE_BESOIN[m];
      selectMode.appendChild(option);
    });
    ligne.appendChild(selectMode);
    form.appendChild(ligne);

    var champRef = document.createElement('input');
    champRef.type = 'text';
    champRef.maxLength = 120;
    champRef.placeholder = 'Réf. commande';
    champRef.setAttribute('aria-label', 'Référence de commande');
    champRef.hidden = true;
    form.appendChild(champRef);
    selectMode.addEventListener('change', function () {
      champRef.hidden = selectMode.value !== 'commande';
    });

    var bouton = document.createElement('button');
    bouton.type = 'submit';
    bouton.className = 'bouton bouton-secondaire';
    bouton.textContent = 'Ajouter le besoin';
    form.appendChild(bouton);

    form.addEventListener('submit', function (evenement) {
      evenement.preventDefault();
      var designation = champDesignation.value.trim();
      if (!designation) { return; }
      var quantite = parseFloat(champQuantite.value);
      if (!isFinite(quantite) || quantite <= 0) {
        toast('Indiquez une quantité supérieure à zéro.', 'erreur');
        return;
      }
      var valeurs = {
        chantier_id: dossier.id,
        designation: designation,
        quantite: quantite,
        mode: selectMode.value
      };
      var ref = champRef.value.trim();
      if (selectMode.value === 'commande' && ref) { valeurs.commande_ref = ref; }
      executerMutationIntendance(creerBesoinIntendant(valeurs), 'Besoin ajouté.');
    });
    return form;
  }

  function rendreIntendance(conteneur, noeud) {
    var sousTitre = document.createElement('h3');
    sousTitre.className = 'fiche-sous-titre';
    sousTitre.textContent = 'Intendance';
    conteneur.appendChild(sousTitre);

    var section = document.createElement('section');
    section.className = 'section-intendance';
    section.setAttribute('aria-label', "Intendance — approvisionnement du chantier");
    conteneur.appendChild(section);

    if (etat.intendant.indisponible) {
      section.appendChild(paragrapheIntendance('Intendance indisponible pour le moment.'));
      return;
    }

    var dossier = etat.intendant.chantiers.find(function (c) {
      return c.node_id === noeud.id;
    }) || null;

    if (!dossier) {
      section.appendChild(formOuvrirIntendance(noeud));
      return;
    }

    // Date de pose : modifiable en place (vider le champ efface la date).
    var labelPose = document.createElement('label');
    labelPose.className = 'intendance-label';
    labelPose.appendChild(document.createTextNode('Date de pose'));
    var champPose = document.createElement('input');
    champPose.type = 'date';
    champPose.value = dossier.date_pose || '';
    champPose.addEventListener('change', function () {
      executerMutationIntendance(
        majDossierIntendant(dossier.id, { date_pose: champPose.value || null }),
        'Date de pose mise à jour.',
        function () { champPose.value = dossier.date_pose || ''; }
      );
    });
    labelPose.appendChild(champPose);
    section.appendChild(labelPose);

    // Compteur de preuve (cadrage §9.2) : manquants détectés à J-2.
    var alerte = alerteIntendantPourNoeud(noeud.id);
    var compteur = document.createElement('p');
    compteur.className = 'intendance-compteur';
    compteur.textContent = 'Manquants détectés à J-2 : ' + (alerte ? alerte.manquants : 0);
    section.appendChild(compteur);

    var besoins = etat.intendant.besoins.filter(function (b) {
      return b.chantier_id === dossier.id;
    });
    if (besoins.length === 0) {
      section.appendChild(paragrapheIntendance('Aucun besoin noté pour le moment.'));
    } else {
      var liste = document.createElement('ul');
      liste.className = 'liste-besoins';
      besoins.forEach(function (b) { liste.appendChild(itemBesoinIntendance(b)); });
      section.appendChild(liste);
    }

    section.appendChild(formAjoutBesoin(dossier));
  }

  // ---------- Dictée vocale : le composant partagé (js/dictee.js) ----------
  // Le composant a quitté ce fichier le 2026-07-30 (boucle ④) pour servir aussi
  // le cartouche de Léo sur les autres quadrants. RIVEN le consomme ici, à
  // comportement identique ; script absent → aucun micro, aucune erreur.

  var Reco = Boolean(window.UltimaDictee && window.UltimaDictee.disponible());
  if (window.UltimaDictee) { window.UltimaDictee.configurer({ signaler: toast }); }

  function attacherDictee(champ, libelle, options) {
    if (!window.UltimaDictee) { return; }
    window.UltimaDictee.attacher(champ, libelle, options);
  }

  // Micros des champs statiques du panneau. (La région d'annonce partagée est
  // désormais créée à la demande par le composant — js/dictee.js.)
  function initDictee() {
    if (!Reco) { return; } // API absente : l'interface d'avant, complète, sans bruit
    attacherDictee($('#noeud-notes'), 'Notes');
    attacherDictee($('#relation-notes'), 'Note de la relation');
    // Dictée en mode REMPLACEMENT sur la recherche du ciel. Ce mode n'avait
    // qu'un champ, celui de la recherche carte : supprimé le 2026-08-13, il
    // aurait emporté la capacité avec lui. Elle est TRANSFÉRÉE, pas ajoutée —
    // même raison qu'à l'origine : une transcription imparfaite ne corrompt
    // rien dans un champ de recherche, le résultat est visible et gratuit à
    // corriger.
    attacherDictee($('#ciel-recherche'), null, { remplacer: true });
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

  // ---------- Géocodage d'adresse : « Situer la ville » (v3-⑤) ----------
  // La CARTE est supprimée (2026-08-13) mais le géocodage RESTE : les
  // coordonnées continuent d'être renseignées, sans écran pour les montrer.
  // Motif, consigné au cadrage : une suppression d'écran se revient d'un
  // `git revert` ; un trou de données, non.
  // Geste explicite, jamais de recherche à la frappe (politique Nominatim
  // ≤ 1 req/s). Le géocodage est une aide, jamais un péage : « Enregistrer »
  // fonctionne toujours, position ou pas. Aucune adresse en console/logs.

  var GEO_LIMITE = 3;         // 3 résultats max : zéro scroll, lisible au pouce
  var GEO_TIMEOUT_MS = 8000;  // filet front (le serveur coupe à 5 s)
  var GEO_CADENCE_MS = 1000;  // anti-rafale : 1 s de repos après chaque réponse
  var GEO_LIBELLE_BOUTON = 'Situer la ville';
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

  // Sélection (tap ou auto) : champs remplis, confirmation. L'aperçu sur la
  // carte est parti avec elle — la confirmation écrite reste, et c'est elle
  // qui portait déjà la preuve du choix.
  function choisirResultatGeo(resultat) {
    $('#noeud-lat').value = String(resultat.lat);
    $('#noeud-lng').value = String(resultat.lng);
    fermerListeGeo(false);
    afficherConfirmationGeo('Position : ', resultat.libelle);
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
    $('#noeud-adresse').focus();
  }

  // Saisie manuelle dans le details : la ligne dit d'où vient la position.
  function surSaisieManuelleGeo(evenement) {
    if (!evenement.isTrusted) { return; }
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
      afficherConfirmationGeo('Position enregistrée', '');
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

  // ---------- Formulaire nœud (ajout / édition) ----------

  // Les quatre axes de détail (0024), rangés par la façon dont on les LIT et
  // on les ÉCRIT — pas par axe métier : c'est ce découpage-là qui évite trois
  // fois le même code dans ouvrirFormNoeud et soumettreFormNoeud.
  var CHAMPS_DETAIL_TEXTE = ['nature', 'prestations', 'zone_intervention', 'disponibilite'];
  var CHAMPS_DETAIL_LISTE = ['metiers_secondaires', 'certifications'];
  var CHAMPS_DETAIL_NOMBRE = ['rayon_km', 'effectif', 'fiabilite', 'reactivite', 'niveau_prix'];

  // Tableau → champ de saisie. La virgule est le séparateur, l'espace suit :
  // c'est ce qu'on relit sans y penser, et ce qu'on retape sans se tromper.
  function listeEnSaisie(valeurs) {
    return Array.isArray(valeurs) ? valeurs.join(', ') : '';
  }

  // Champ de saisie → tableau. Les entrées vides disparaissent (« a,,b » et
  // « a, b, » donnent le même résultat) ; un champ vide donne un tableau vide,
  // que l'appelant traduit en null — une seule convention pour « rien »,
  // partagée avec l'API (checkOptionalTags) et la base (riven_tags_valides).
  function saisieEnListe(brut) {
    return (brut || '').split(',')
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return t.length > 0; });
  }

  function ouvrirFormNoeud(idEdition) {
    etat.noeudEnEdition = idEdition || null;
    var noeud = idEdition ? trouverNoeud(idEdition) : null;
    $('#noeud-type').value = noeud ? noeud.type : 'artisan';
    $('#noeud-nom').value = noeud ? (noeud.nom || '') : '';
    $('#noeud-statut').value = noeud ? noeud.statut : 'prospect';
    $('#noeud-secteur_activite').value = noeud ? (noeud.secteur_activite || '') : '';
    majDatalistSecteurs();
    $('#noeud-ville').value = noeud ? (noeud.ville || '') : '';
    $('#noeud-adresse').value = noeud ? (noeud.adresse || '') : '';
    $('#noeud-telephone').value = noeud ? (noeud.telephone || '') : '';
    $('#noeud-email').value = noeud ? (noeud.email || '') : '';
    $('#noeud-lat').value = noeud && typeof noeud.lat === 'number' ? String(noeud.lat) : '';
    $('#noeud-lng').value = noeud && typeof noeud.lng === 'number' ? String(noeud.lng) : '';
    $('#noeud-notes').value = noeud ? (noeud.notes || '') : '';
    // 0024 — les quatre axes. Le pli reste FERMÉ à l'ouverture : le flux court
    // (nom + type + statut) n'est jamais rallongé par ces champs.
    CHAMPS_DETAIL_TEXTE.forEach(function (champ) {
      $('#noeud-' + champ).value = noeud ? (noeud[champ] || '') : '';
    });
    CHAMPS_DETAIL_LISTE.forEach(function (champ) {
      $('#noeud-' + champ).value = noeud ? listeEnSaisie(noeud[champ]) : '';
    });
    CHAMPS_DETAIL_NOMBRE.forEach(function (champ) {
      $('#noeud-' + champ).value =
        noeud && typeof noeud[champ] === 'number' && isFinite(noeud[champ])
          ? String(noeud[champ]) : '';
    });
    $('#noeud-detail').open = false;
    // On n'enchaîne pas des MODIFICATIONS : le bouton n'a de sens qu'en
    // création. Et le compteur repart de zéro à chaque ouverture — sinon il
    // annoncerait une série qui n'a pas eu lieu (pre-mortem P7).
    etat.serieNoeuds = 0;
    $('#noeud-enchainer').hidden = !!idEdition;
    majCompteurSerie('#noeud-serie', 0, 'fiche');
    preparerGeoPourNoeud(noeud);
    ouvrirPanneau('noeud', idEdition ? 'Modifier le nœud' : 'Ajouter un nœud');
  }

  // ---------- Saisie en série (2026-08-12) ----------

  // Un envoi n'est « enchaîné » que si le bouton qui l'a déclenché est celui-là.
  // Lecture DÉFENSIVE : sans `submitter`, on retombe sur le comportement
  // d'avant (le formulaire se ferme sur la fiche) — jamais l'inverse.
  function envoiEnchaine(evenement, identifiant) {
    return !!(evenement && evenement.submitter && evenement.submitter.id === identifiant);
  }

  function majCompteurSerie(selecteur, compte, mot) {
    var ligne = $(selecteur);
    if (compte <= 0) {
      ligne.textContent = '';
      ligne.hidden = true;
      return;
    }
    ligne.textContent = compte + ' ' + mot + (compte > 1 ? 's' : '') + ' créée' +
      (compte > 1 ? 's' : '') + ' à la suite.';
    ligne.hidden = false;
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
    ['ville', 'adresse', 'secteur_activite', 'telephone', 'email', 'notes']
      .concat(CHAMPS_DETAIL_TEXTE)
      .forEach(function (champ) {
        var brut = $('#noeud-' + champ).value.trim();
        if (brut) {
          valeurs[champ] = brut;
        } else if (etat.noeudEnEdition) {
          valeurs[champ] = null;
        }
      });
    // Listes (0024) : vide → omis à la création, null en édition (vidage) —
    // exactement la règle des champs texte, jamais un tableau vide sur le fil.
    CHAMPS_DETAIL_LISTE.forEach(function (champ) {
      var tags = saisieEnListe($('#noeud-' + champ).value);
      if (tags.length) {
        valeurs[champ] = tags;
      } else if (etat.noeudEnEdition) {
        valeurs[champ] = null;
      }
    });
    // Nombres et échelles (0024) : même règle. Une saisie non numérique est
    // refusée AVANT l'appel — l'API la refuserait, autant le dire tout de suite.
    for (var i = 0; i < CHAMPS_DETAIL_NOMBRE.length; i++) {
      var champNombre = CHAMPS_DETAIL_NOMBRE[i];
      var brutNombre = $('#noeud-' + champNombre).value.trim();
      if (!brutNombre) {
        if (etat.noeudEnEdition) { valeurs[champNombre] = null; }
        continue;
      }
      var nombre = Number(brutNombre);
      if (!isFinite(nombre) || !Number.isInteger(nombre)) {
        toast('Les nombres du détail doivent être entiers.', 'erreur');
        return;
      }
      valeurs[champNombre] = nombre;
    }
    if (!valeurs.nom || TYPES.indexOf(valeurs.type) === -1 || STATUTS.indexOf(valeurs.statut) === -1) {
      toast('Formulaire incomplet.', 'erreur');
      return;
    }
    try {
      var creation = !etat.noeudEnEdition;
      // Une série n'a de sens qu'en création (le bouton est masqué en édition,
      // la garde le redit ici : l'interface et la logique ne se font pas
      // mutuellement confiance).
      var enchainer = creation && envoiEnchaine(evenement, 'noeud-enchainer');
      var id = await sauverNoeud(valeurs);
      toast(etat.noeudEnEdition ? 'Nœud mis à jour.' : 'Nœud ajouté.');
      etat.noeudEnEdition = null;
      // A4 : à la création seulement, la nouvelle feuille pousse à l'écran.
      etat.noeudNouveau = creation ? id : null;
      rafraichir();
      // Tout ce qui suit est APRÈS l'await : un échec d'écriture n'atteint
      // jamais ces lignes, la saisie reste donc intacte à l'écran (P1).
      if (enchainer) {
        etat.serieNoeuds += 1;
        viderFormNoeudPourSuivant();
        majCompteurSerie('#noeud-serie', etat.serieNoeuds, 'fiche');
        return;
      }
      if (id && trouverNoeud(id)) { ouvrirFiche(id); } else { fermerPanneau(); }
    } catch (e) {
      toast('Enregistrement impossible.', 'erreur');
    }
  }

  // Ce qui SURVIT d'une fiche à la suivante : le contexte de la série — on
  // saisit une tournée d'artisans du même métier dans la même ville. Ce qui
  // part : tout ce qui identifie la fiche précédente.
  function viderFormNoeudPourSuivant() {
    ['nom', 'adresse', 'telephone', 'email', 'lat', 'lng', 'notes'].forEach(function (champ) {
      $('#noeud-' + champ).value = '';
    });
    CHAMPS_DETAIL_TEXTE.concat(CHAMPS_DETAIL_LISTE, CHAMPS_DETAIL_NOMBRE)
      .forEach(function (champ) { $('#noeud-' + champ).value = ''; });
    $('#noeud-detail').open = false;
    majDatalistSecteurs(); // la fiche qu'on vient de créer enrichit la liste
    preparerGeoPourNoeud(null);
    $('#noeud-nom').focus();
  }

  // ---------- Formulaire personne (0024) ----------

  // Ce formulaire ne crée AUCUN nœud. C'est la demande de Paul, et c'est aussi
  // la garantie technique : sauverPersonne n'écrit que dans `personnes`.
  function ouvrirFormPersonne(idEdition) {
    etat.personneEnEdition = idEdition || null;
    var personne = idEdition ? trouverPersonne(idEdition) : null;
    $('#personne-nom').value = personne ? (personne.nom || '') : '';
    $('#personne-fonction').value = personne ? (personne.fonction || '') : '';
    $('#personne-telephone').value = personne ? (personne.telephone || '') : '';
    $('#personne-email').value = personne ? (personne.email || '') : '';
    $('#personne-notes').value = personne ? (personne.notes || '') : '';
    etat.seriePersonnes = 0;
    $('#personne-enchainer').hidden = !!idEdition;
    majCompteurSerie('#personne-serie', 0, 'personne');
    majDatalistFonctions();
    ouvrirPanneau('personne', idEdition ? 'Modifier la personne' : 'Ajouter une personne');
  }

  async function soumettreFormPersonne(evenement) {
    evenement.preventDefault();
    var valeurs = { nom: $('#personne-nom').value.trim() };
    if (!valeurs.nom) {
      toast('Le nom est obligatoire.', 'erreur');
      return;
    }
    ['fonction', 'telephone', 'email', 'notes'].forEach(function (champ) {
      var brut = $('#personne-' + champ).value.trim();
      if (brut) {
        valeurs[champ] = brut;
      } else if (etat.personneEnEdition) {
        valeurs[champ] = null;
      }
    });
    try {
      var enchainer = !etat.personneEnEdition && envoiEnchaine(evenement, 'personne-enchainer');
      var id = await sauverPersonne(valeurs);
      toast(etat.personneEnEdition ? 'Personne mise à jour.' : 'Personne ajoutée.');
      etat.personneEnEdition = null;
      rafraichir();
      if (enchainer) {
        etat.seriePersonnes += 1;
        // Une personne ne partage rien avec la suivante — même une fonction
        // commune est l'exception. On vide tout, et on rend le curseur.
        ['nom', 'fonction', 'telephone', 'email', 'notes'].forEach(function (champ) {
          $('#personne-' + champ).value = '';
        });
        majDatalistFonctions();
        majCompteurSerie('#personne-serie', etat.seriePersonnes, 'personne');
        $('#personne-nom').focus();
        return;
      }
      if (id && trouverPersonne(id)) { ouvrirFichePersonne(id); } else { fermerPanneau(); }
    } catch (e) {
      toast('Enregistrement impossible.', 'erreur');
    }
  }

  // ---------- Formulaire rattachement (0024) ----------

  // Valeur sentinelle du select : « je n'en choisis aucune, j'en crée une ».
  // Ce n'est pas un identifiant — aucune personne ne peut la porter.
  var RATTACHEMENT_NOUVELLE = '__nouvelle__';

  function ouvrirFormRattachement(nodeId, options) {
    var noeud = trouverNoeud(nodeId);
    if (!noeud) { return; }
    var opts = options || {};
    var lien = opts.idEdition
      ? etat.rattachements.find(function (r) { return r.id === opts.idEdition; })
      : null;
    if (opts.idEdition && !lien) { return; }
    etat.noeudARattacher = nodeId;
    etat.rattachementEnEdition = lien ? lien.id : null;

    // ÉDITION du rôle : la personne et la fiche sont figées — c'est le rôle,
    // et lui seul, qu'on répare. Le lien garde son id.
    if (lien) {
      var personneLiee = trouverPersonne(lien.personne_id);
      $('#rattachement-source').textContent = 'Sur : ' + (noeud.nom || '(sans nom)');
      var selectFige = $('#rattachement-personne');
      selectFige.textContent = '';
      var seule = document.createElement('option');
      seule.value = lien.personne_id;
      seule.textContent = (personneLiee && personneLiee.nom) || 'Personne';
      selectFige.appendChild(seule);
      selectFige.value = lien.personne_id;
      selectFige.disabled = true;
      $('#rattachement-nouvelle').hidden = true;
      $('#rattachement-role').value = lien.role || '';
      $('#rattachement-envoyer').textContent = 'Enregistrer';
      majDatalistRoles();
      ouvrirPanneau('rattachement', 'Modifier le rôle');
      return;
    }

    $('#rattachement-source').textContent = 'Sur : ' + (noeud.nom || '(sans nom)');
    var select = $('#rattachement-personne');
    select.disabled = false;
    $('#rattachement-envoyer').textContent = 'Rattacher';
    select.textContent = '';
    // Créer est offert EN TÊTE — visible sans dérouler cinquante noms — mais
    // n'est pas la valeur retenue tant qu'une personne existe (voir plus bas) :
    // la parade au doublon est que créer reste un choix conscient.
    var optionNeuve = document.createElement('option');
    optionNeuve.value = RATTACHEMENT_NOUVELLE;
    optionNeuve.textContent = '➕ Créer une nouvelle personne';
    select.appendChild(optionNeuve);
    // Une personne déjà rattachée à CETTE fiche n'est pas proposée : le doublon
    // est interdit en base (unique de 0024), autant ne pas l'offrir.
    var dejaLa = {};
    etat.rattachements.forEach(function (r) {
      if (r.node_id === nodeId) { dejaLa[r.personne_id] = true; }
    });
    var premiereExistante = '';
    etat.personnes.slice().sort(function (a, b) {
      return (a.nom || '').localeCompare(b.nom || '', 'fr');
    }).forEach(function (p) {
      if (dejaLa[p.id]) { return; }
      var option = document.createElement('option');
      option.value = p.id;
      option.textContent = (p.nom || '(sans nom)') + (p.fonction ? ' — ' + p.fonction : '');
      select.appendChild(option);
      if (!premiereExistante) { premiereExistante = p.id; }
    });
    // Registre vide (l'état RÉEL de la base de Paul le 2026-08-12) : la seule
    // option est « créer », donc le pli s'ouvre. Le formulaire ne refuse PLUS
    // de s'ouvrir — c'était un cul-de-sac : le geste devenait inatteignable.
    select.value = premiereExistante || RATTACHEMENT_NOUVELLE;
    $('#rattachement-nom').value = '';
    $('#rattachement-fonction').value = '';
    $('#rattachement-telephone').value = '';
    majPliNouvellePersonne();
    $('#rattachement-role').value = '';
    majDatalistRoles();
    majDatalistFonctions();
    ouvrirPanneau('rattachement', 'Rattacher une personne');
  }

  // Le pli des trois champs ne paraît que si « créer » est retenu : le flux
  // court d'hier (choisir + rôle + Rattacher) garde exactement ses touchers.
  function majPliNouvellePersonne() {
    var neuve = $('#rattachement-personne').value === RATTACHEMENT_NOUVELLE;
    $('#rattachement-nouvelle').hidden = !neuve;
  }

  async function soumettreFormRattachement(evenement) {
    evenement.preventDefault();
    var choix = $('#rattachement-personne').value;
    var cible = etat.noeudARattacher;
    if (!choix || !cible) {
      toast('Formulaire incomplet.', 'erreur');
      return;
    }

    // Corriger le rôle : une seule écriture, le lien garde son id, la personne
    // reste rattachée pendant toute l'opération.
    if (etat.rattachementEnEdition) {
      var idLien = etat.rattachementEnEdition;
      var roleRepare = $('#rattachement-role').value.trim();
      try {
        await majRattachement(idLien, { role: roleRepare || null });
        toast('Rôle mis à jour.');
        etat.rattachementEnEdition = null;
        etat.noeudARattacher = null;
        rafraichir();
        ouvrirFiche(cible);
      } catch (e) {
        toast('Mise à jour du rôle impossible.', 'erreur');
      }
      return;
    }

    // Cas « créer sur place » : DEUX écritures, dans cet ordre, et l'échec de
    // la seconde ne doit jamais être muet — la personne existerait alors au
    // registre sans que Paul le sache (pre-mortem P5).
    var personneId = choix;
    if (choix === RATTACHEMENT_NOUVELLE) {
      var nom = $('#rattachement-nom').value.trim();
      if (!nom) {
        toast('Le nom de la personne est obligatoire.', 'erreur');
        return;
      }
      var neuve = { nom: nom };
      ['fonction', 'telephone'].forEach(function (champ) {
        var brut = $('#rattachement-' + champ).value.trim();
        if (brut) { neuve[champ] = brut; }
      });
      try {
        // `sauverPersonne` branche sur `personneEnEdition` : un reliquat d'une
        // édition abandonnée (Échap) transformerait cette CRÉATION en mise à
        // jour de quelqu'un d'autre. On l'annule explicitement.
        etat.personneEnEdition = null;
        personneId = await sauverPersonne(neuve);
      } catch (e) {
        toast('Création de la personne impossible.', 'erreur');
        return;
      }
      if (!personneId) {
        toast('Création de la personne impossible.', 'erreur');
        return;
      }
    }

    var valeurs = { personne_id: personneId, node_id: cible };
    var role = $('#rattachement-role').value.trim();
    if (role) { valeurs.role = role; }
    try {
      await creerRattachement(valeurs);
      toast(choix === RATTACHEMENT_NOUVELLE ? 'Personne créée et rattachée.' : 'Personne rattachée.');
      etat.noeudARattacher = null;
      rafraichir();
      ouvrirFiche(cible);
    } catch (e) {
      // La personne, elle, est bien née : on le DIT, au lieu de laisser croire
      // que rien ne s'est passé.
      toast(choix === RATTACHEMENT_NOUVELLE
        ? 'Personne créée, mais rattachement impossible : elle est au registre.'
        : 'Rattachement impossible.', 'erreur');
      if (choix === RATTACHEMENT_NOUVELLE) { rafraichir(); }
    }
  }

  // ---------- Formulaire relation ----------

  // idCible / typePrerempli : la suggestion R5 ouvre ce formulaire DÉJÀ garni.
  // idEdition : on répare une relation existante — elle garde son id.
  function ouvrirFormRelation(idSource, options) {
    var opts = options || {};
    var edition = opts.idEdition ? trouverRelation(opts.idEdition) : null;
    if (opts.idEdition && !edition) { return; }
    var depart = edition ? edition.source_id : idSource;
    var source = trouverNoeud(depart);
    if (!source) { return; }
    etat.noeudCourant = depart;
    etat.relationEnEdition = edition ? edition.id : null;

    $('#relation-source').textContent = 'Depuis : ' + (source.nom || '(sans nom)');
    var select = $('#relation-cible');
    select.textContent = '';
    // En ÉDITION la cible est FIGÉE, et on le dit à l'écran : en changer ne
    // corrigerait pas cette relation, cela en désignerait une autre — et le
    // journal qui lui est adossé deviendrait un faux témoignage.
    var candidats = edition
      ? etat.noeuds.filter(function (n) { return n.id === edition.target_id; })
      : etat.noeuds.filter(function (n) { return n.id !== depart; });
    candidats.forEach(function (n) {
      var option = document.createElement('option');
      option.value = n.id;
      option.textContent = (n.nom || '(sans nom)') + ' — ' + (LIBELLES_TYPE[n.type] || n.type);
      select.appendChild(option);
    });
    if (!select.options.length) {
      toast('Aucun autre nœud à relier.', 'erreur');
      return;
    }
    select.disabled = !!edition;
    if (edition) {
      select.value = edition.target_id;
    } else if (opts.idCible && trouverNoeud(opts.idCible)) {
      select.value = opts.idCible;
    }
    $('#relation-type').value = edition
      ? (edition.type || 'apport_affaires')
      : (opts.type || 'apport_affaires');
    $('#relation-notes').value = edition ? (edition.notes || '') : '';
    $('#relation-interet_qualitatif').value = edition ? (edition.interet_qualitatif || '') : '';
    CHAMPS_EFFORT.forEach(function (champ) {
      $('#relation-' + champ).value =
        edition && typeof edition[champ] === 'number' ? String(edition[champ]) : '';
    });
    // Le pli reste FERMÉ : relier deux fiches doit rester un geste court.
    $('#relation-pilotage-pli').open = false;
    $('#relation-envoyer').textContent = edition ? 'Enregistrer' : 'Créer la relation';
    ouvrirPanneau('relation', edition ? 'Modifier la relation' : 'Relier deux nœuds');
  }

  async function soumettreFormRelation(evenement) {
    evenement.preventDefault();
    var type = $('#relation-type').value;
    var retour = etat.noeudCourant;
    if (!retour || !LIBELLES_RELATION[type]) {
      toast('Formulaire incomplet.', 'erreur');
      return;
    }

    // Les champs de pilotage suivent la convention du reste du produit :
    // vide → omis à la création, `null` en édition (vidage effectif).
    var pilotage = {};
    var interet = $('#relation-interet_qualitatif').value.trim();
    if (interet) {
      pilotage.interet_qualitatif = interet;
    } else if (etat.relationEnEdition) {
      pilotage.interet_qualitatif = null;
    }
    for (var i = 0; i < CHAMPS_EFFORT.length; i++) {
      var champ = CHAMPS_EFFORT[i];
      var brut = $('#relation-' + champ).value;
      if (!brut) {
        if (etat.relationEnEdition) { pilotage[champ] = null; }
        continue;
      }
      var note = Number(brut);
      if (!isFinite(note) || !Number.isInteger(note) || note < 1 || note > 5) {
        toast('Les efforts se notent de 1 à 5.', 'erreur');
        return;
      }
      pilotage[champ] = note;
    }

    // ÉDITION — on n'envoie QUE ce que le formulaire porte. Le statut et la
    // raison d'arrêt n'y sont pas : ils ne peuvent donc pas être écrasés par
    // une correction de note ou de type.
    if (etat.relationEnEdition) {
      var maj = Object.assign({
        type: type,
        notes: $('#relation-notes').value.trim() || null
      }, pilotage);
      var idRepare = etat.relationEnEdition;
      try {
        await majRelation(idRepare, maj);
        toast('Relation mise à jour.');
        etat.relationEnEdition = null;
        rafraichir();
        ouvrirFiche(retour);
      } catch (e) {
        toast(e.message || 'Mise à jour impossible.', 'erreur');
      }
      return;
    }

    var valeurs = Object.assign({
      source_id: retour,
      target_id: $('#relation-cible').value,
      type: type,
      notes: $('#relation-notes').value.trim()
    }, pilotage);
    if (!valeurs.target_id) {
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

  // A4 (garde-fou a11y) : tant que l'overlay de connexion couvre l'écran,
  // l'application derrière ne doit être atteignable ni au clavier ni au
  // lecteur d'écran. On passe `inert` sur chaque région de l'app (tout le
  // <body> sauf l'overlay lui-même et les toasts, qui doivent rester
  // annoncés au-dessus). `inert` est ignoré sans erreur là où il n'existe
  // pas : jamais de casse. Non appelé en mode démo (pas d'overlay).
  function majInertApp(overlayVisible) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el.id === 'ecran-connexion' || el.id === 'toasts' ||
          el.tagName === 'SCRIPT') { return; }
      if (overlayVisible) { el.setAttribute('inert', ''); }
      else { el.removeAttribute('inert'); }
    });
  }

  function majAuthUi() {
    if (etat.modeDemo) { return; }
    $('#form-connexion').hidden = Boolean(etat.session);
    $('#bouton-deconnexion').hidden = !etat.session;
    // A1 : écran de connexion plein écran tant qu'aucune session n'est ouverte
    // (jamais en mode démo — majAuthUi ne s'exécute pas dans ce cas).
    var overlayVisible = !etat.session;
    $('#ecran-connexion').hidden = !overlayVisible;
    majInertApp(overlayVisible);
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

  // Connexion via Google (OAuth). Le provider Google doit être activé côté
  // Supabase (Auth → Providers) avec des identifiants OAuth Google Cloud ;
  // le verrou mono-utilisateur se fait côté Google (écran de consentement en
  // mode Test, Paul seul autorisé) — voir CADRAGE-ULTIMA.md, LV2-② Auth.
  // signInWithOAuth redirige le navigateur vers Google puis revient sur
  // window.location.origin : navigation top-level, pas bloquée par la CSP.
  async function seConnecterGoogle() {
    if (!etat.client) { return; }
    try {
      var resultat = await etat.client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (resultat.error) { throw resultat.error; }
    } catch (e) {
      toast('Connexion Google impossible.', 'erreur');
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
      // Le bouton suit le registre affiché : une fiche ici, une personne là.
      if (etat.registreContacts === 'personnes') {
        ouvrirFormPersonneDepuisRegistre();
        return;
      }
      // On reste sur Contacts — motif de `#ciel-ajouter`.
      // `ouvrirFormDepuisAccueil` bascule sur la Carte : c'est juste depuis
      // l'ACCUEIL (on va quelque part), faux depuis le registre (on y est
      // déjà). Le défaut se voyait à l'annulation : on atterrissait sur la
      // carte au lieu de retrouver sa liste. Trouvé par le harnais, 2026-08-12.
      ouvrirFormNoeud(null);
      $('#panneau-titre').focus();
    });

    document.querySelectorAll('.contacts-registre').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        changerRegistreContacts(bouton.getAttribute('data-registre'));
      });
    });

    $('#contacts-recherche').addEventListener('input', rendreContacts);

    // ---- Commandes du ciel ----
    $('#ciel-ajouter').addEventListener('click', function () {
      if (!etat.modeDemo && !etat.session) {
        toast('Connectez-vous pour ajouter un contact.', 'erreur');
        return;
      }
      ouvrirFormNoeud(null); // panneau overlay : on reste sur le ciel
    });
    $('#ciel-recherche').addEventListener('input', rendreCiel);
    // Le zoom par boutons : la seule voie sur un téléphone, où il n'y a pas de
    // molette — et celle-ci fait défiler la page (elle ne zoome qu'avec Ctrl).
    $('#ciel-approcher').addEventListener('click', function () {
      var vue = window.UltimaCiel && window.UltimaCiel.courant();
      if (vue) { vue.zoomer(-0.18); }
    });
    $('#ciel-reculer').addEventListener('click', function () {
      var vue = window.UltimaCiel && window.UltimaCiel.courant();
      if (vue) { vue.zoomer(0.18); }
    });
    // « Tout voir » : la sortie de secours du volume. On peut s'être approché
    // d'une constellation et avoir perdu les autres de vue — un geste ramène au
    // cadrage MESURÉ, celui qui fait tenir tout le réseau dans l'écran.
    $('#ciel-tout-voir').addEventListener('click', function () {
      var vue = window.UltimaCiel && window.UltimaCiel.courant();
      if (vue) { vue.toutVoir(); }
    });
    $('#ciel-plat').addEventListener('click', function () {
      var vue = window.UltimaCiel && window.UltimaCiel.courant();
      if (!vue) { return; }
      var versPlat = !vue.estPlat();
      vue.plat(versPlat);
      // On retient l'état RÉEL : si le système impose le mode réduit, le clic
      // n'a pas basculé et il ne faut pas mémoriser le contraire.
      var reel = vue.estPlat();
      retenirCielPlat(reel);
      majBoutonPlat(reel);
      if (reel !== versPlat) {
        toast('Votre appareil demande moins de mouvement : le ciel reste à plat.');
      }
    });

    $('#ciel-derive').addEventListener('change', function (e) {
      var vue = window.UltimaCiel && window.UltimaCiel.courant();
      if (vue) { vue.derive(e.target.checked); }
    });


    $('#bouton-fermer-panneau').addEventListener('click', fermerPanneau);
    $('#bouton-annuler-noeud').addEventListener('click', function () {
      if (etat.noeudCourant) { ouvrirFiche(etat.noeudCourant); } else { fermerPanneau(); }
    });
    $('#bouton-annuler-relation').addEventListener('click', function () {
      etat.relationEnEdition = null;
      if (etat.noeudCourant) { ouvrirFiche(etat.noeudCourant); } else { fermerPanneau(); }
    });
    // Annuler une personne : on revient à SA fiche si on l'éditait, sinon on
    // ferme — jamais sur la fiche d'un nœud, où l'on n'était pas.
    $('#bouton-annuler-personne').addEventListener('click', function () {
      var retour = etat.personneEnEdition || etat.personneCourante;
      etat.personneEnEdition = null;
      if (retour && trouverPersonne(retour)) { ouvrirFichePersonne(retour); } else { fermerPanneau(); }
    });
    $('#bouton-annuler-rattachement').addEventListener('click', function () {
      var retour = etat.noeudARattacher;
      etat.noeudARattacher = null;
      etat.rattachementEnEdition = null;
      if (retour && trouverNoeud(retour)) { ouvrirFiche(retour); } else { fermerPanneau(); }
    });

    $('#rattachement-personne').addEventListener('change', majPliNouvellePersonne);

    $('#form-noeud').addEventListener('submit', soumettreFormNoeud);
    $('#form-relation').addEventListener('submit', soumettreFormRelation);
    $('#form-personne').addEventListener('submit', soumettreFormPersonne);
    $('#form-rattachement').addEventListener('submit', soumettreFormRattachement);
    $('#form-connexion').addEventListener('submit', envoyerLienMagique);
    var boutonGoogle = $('#bouton-google');
    if (boutonGoogle) { boutonGoogle.addEventListener('click', seConnecterGoogle); }
    $('#bouton-deconnexion').addEventListener('click', seDeconnecter);

    document.addEventListener('keydown', function (evenement) {
      if (evenement.key === 'Escape' && !$('#panneau').hidden) { fermerPanneau(); }
    });
  }

  // ---------- Démarrage ----------

  async function demarrer() {
    brancherEvenements();
    initDictee(); // micros des champs statiques (sans API : ne fait rien)
    initGeocodage(); // « Situer la ville » du formulaire nœud
    // Le CIEL est l'écran d'arrivée depuis le 2026-08-11 (décision de Paul :
    // « la 3d devient accueil »), et depuis le 2026-08-13 il est la SEULE forme
    // du réseau : l'usage a tranché, l'arbre est supprimé. Les données arrivent
    // juste après (chargerDonnees → rafraichir) : le ciel se peuple sans
    // changement d'onglet.
    activerOnglet('ciel');
    await initAuth();
    await chargerDonnees();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
