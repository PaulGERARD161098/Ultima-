// Ultima — quadrant RESHIRAM (v1) : la carte des talents, ancrée sur preuve.
// Le registre DERRIÈRE AUTH, données réelles uniquement :
//   - fail-closed : sans config, sans session ou sur échec API (401), la page
//     n'affiche AUCUNE donnée — seul le cartouche « Authentification requise »
//     est montré (le flux lien-magique vit sur traveler.html) ;
//   - avec session : GET /api/talents (Bearer) → talents (vue talents_etat, donc
//     nb_preuves + a_etayer) + preuves (rattachées par talent_id). AUCUN talent en
//     dur ici : les données personnelles ne viennent QUE de l'API authentifiée (RLS) ;
//   - saisie ancrée sur preuve : dresser un talent, puis Léo CHALLENGE tout talent
//     « à étayer » (0 preuve) — « sur quoi tu bases ça ? un fait, un chiffre » ;
//   - vue « mon offre réelle » : ne montre que les talents étayés (a_etayer=false).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var LIBELLE_NIVEAU = {
    notion: 'notion',
    pratique: 'pratique',
    maitrise: 'maîtrise'
  };

  var etat = {
    session: null,
    talents: [],
    preuves: [],
    vue: 'tous',
    // Capital réseau (RESHIRAM LIT RIVEN, sens unique — on n'affiche que ce que
    // l'API renvoie, on ne pointe que par node_id, on ne loggue rien).
    refs: [],
    capital: [],
    reseau: [],
    capitalIndisponible: false
  };

  var LIBELLE_TYPE = {
    artisan: 'artisan',
    partenaire: 'partenaire',
    lead: 'lead',
    chantier: 'chantier'
  };

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte !== undefined && texte !== null) { element.textContent = texte; }
    return element;
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['reshiram-chargement', 'reshiram-auth', 'reshiram-erreur', 'reshiram-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- Filtre pur (testable) : talents visibles selon la vue ----------
  //   'offre' → uniquement les talents étayés (a_etayer === false) ;
  //   'tous'  → toute la carte.
  function talentsVisibles(talents, vue) {
    var liste = Array.isArray(talents) ? talents : [];
    if (vue === 'offre') {
      return liste.filter(function (t) { return t && t.a_etayer === false; });
    }
    return liste;
  }

  // Les preuves d'un talent (rattachées par talent_id).
  function preuvesDe(talentId) {
    return etat.preuves.filter(function (p) { return p && p.talent_id === talentId; });
  }

  // ---------- Capital réseau (pur, testable) ----------
  // La ligne agrégée de la vue talents_capital_reseau pour un talent, ou un
  // capital vide si le talent n'y figure pas encore.
  function capitalDe(capital, talentId) {
    var liste = Array.isArray(capital) ? capital : [];
    var ligne = liste.find(function (c) { return c && c.talent_id === talentId; });
    if (!ligne) { return { nb_contacts: 0, secteurs_reseau: [] }; }
    return {
      nb_contacts: Number(ligne.nb_contacts) || 0,
      secteurs_reseau: Array.isArray(ligne.secteurs_reseau) ? ligne.secteurs_reseau : []
    };
  }

  // Les liens (refs) d'un talent, et le nom résolu d'une fiche RIVEN par node_id
  // (jamais de PII stockée : on lit la projection minimale renvoyée par l'API).
  function refsDe(talentId) {
    return etat.refs.filter(function (r) { return r && r.talent_id === talentId; });
  }

  function ficheDe(nodeId) {
    return etat.reseau.find(function (n) { return n && n.id === nodeId; }) || null;
  }

  // ---------- Rendu d'un talent ----------

  function rendreSecteurs(talent, carte) {
    var secteurs = Array.isArray(talent.secteurs) ? talent.secteurs : [];
    if (secteurs.length === 0) {
      carte.appendChild(el('span', 'reshiram-transversal', 'transversal'));
      return;
    }
    var liste = el('ul', 'reshiram-secteurs');
    secteurs.forEach(function (s) {
      liste.appendChild(el('li', 'reshiram-secteur', String(s)));
    });
    carte.appendChild(liste);
  }

  function rendrePreuves(talent, carte) {
    var preuves = preuvesDe(talent.id);
    if (talent.a_etayer === true || preuves.length === 0) {
      carte.appendChild(el('span', 'reshiram-aetayer', 'à étayer'));
      // Léo challenge l'auto-complaisance : rien d'idéalisé sans preuve.
      carte.appendChild(el('p', 'reshiram-defi',
        'Sur quoi tu bases ça ? Ajoute une preuve — un fait, un chiffre.'));
    } else {
      var liste = el('ul', 'reshiram-preuves');
      preuves.forEach(function (p) {
        liste.appendChild(el('li', 'reshiram-preuve', String(p.contenu || '')));
      });
      carte.appendChild(liste);
    }
    // Formulaire d'ajout de preuve, présent sur chaque talent.
    carte.appendChild(construireFormPreuve(talent));
  }

  function construireFormPreuve(talent) {
    var form = el('form', 'reshiram-preuve-form');
    form.dataset.talentId = talent.id;
    var champ = el('input', 'reshiram-preuve-input');
    champ.type = 'text';
    champ.name = 'contenu';
    champ.maxLength = 2000;
    champ.autocomplete = 'off';
    champ.setAttribute('aria-label', 'Ajouter une preuve à « ' + (talent.nom || '') + ' »');
    champ.placeholder = 'un fait, un chiffre…';
    var bouton = el('button', 'reshiram-bouton reshiram-bouton-preuve', 'Étayer');
    bouton.type = 'submit';
    form.appendChild(champ);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettrePreuve(talent.id, champ.value);
    });
    return form;
  }

  // ---------- Panneau « capital réseau » (LIT RIVEN, sens unique) ----------

  function rendreCapitalCompte(talent, section) {
    var cap = capitalDe(etat.capital, talent.id);
    if (cap.nb_contacts === 0) {
      section.appendChild(el('p', 'reshiram-capital-compte reshiram-capital-compte--vide',
        'Aucune fiche reliée — relie un contact RIVEN que ce talent mobilise.'));
      return;
    }
    var mot = cap.nb_contacts > 1 ? ' contacts mobilisables' : ' contact mobilisable';
    var compte = el('p', 'reshiram-capital-compte');
    compte.appendChild(el('strong', 'reshiram-capital-nombre', String(cap.nb_contacts)));
    compte.appendChild(el('span', null, mot));
    section.appendChild(compte);
    if (cap.secteurs_reseau.length > 0) {
      var liste = el('ul', 'reshiram-capital-secteurs');
      cap.secteurs_reseau.forEach(function (s) {
        liste.appendChild(el('li', 'reshiram-capital-secteur', String(s)));
      });
      section.appendChild(liste);
    }
  }

  function rendreFicheReliee(ref, section) {
    var fiche = ficheDe(ref.node_id);
    var ligne = el('div', 'reshiram-capital-fiche');
    ligne.appendChild(el('span', 'reshiram-capital-nom', (fiche && fiche.nom) || 'fiche RIVEN'));
    if (fiche && fiche.type) {
      ligne.appendChild(el('span', 'reshiram-capital-type',
        LIBELLE_TYPE[fiche.type] || fiche.type));
    }
    var detacher = el('button', 'reshiram-bouton-detacher', 'Détacher');
    detacher.type = 'button';
    detacher.setAttribute('aria-label',
      'Détacher « ' + ((fiche && fiche.nom) || 'fiche RIVEN') + ' »');
    detacher.addEventListener('click', function () { detacherRef(ref.id); });
    ligne.appendChild(detacher);
    section.appendChild(ligne);
  }

  function construireFormRelier(talent, section) {
    var dejaRelies = refsDe(talent.id).map(function (r) { return r.node_id; });
    var dispo = etat.reseau.filter(function (n) { return dejaRelies.indexOf(n.id) === -1; });

    if (etat.reseau.length === 0) {
      section.appendChild(el('p', 'reshiram-capital-aide',
        'Aucune fiche RIVEN à relier — ajoute des contacts dans RIVEN d’abord.'));
      return;
    }
    if (dispo.length === 0) {
      section.appendChild(el('p', 'reshiram-capital-aide',
        'Toutes tes fiches RIVEN sont déjà reliées à ce talent.'));
      return;
    }

    var form = el('form', 'reshiram-capital-form');
    var select = el('select', 'reshiram-capital-select');
    select.name = 'node_id';
    select.setAttribute('aria-label', 'Fiche RIVEN à relier à « ' + (talent.nom || '') + ' »');
    var vide = el('option', null, 'Relier une fiche RIVEN…');
    vide.value = '';
    select.appendChild(vide);
    dispo.forEach(function (n) {
      var libelle = n.nom || 'fiche RIVEN';
      if (n.secteur_activite) { libelle += ' (' + n.secteur_activite + ')'; }
      var opt = el('option', null, libelle);
      opt.value = n.id;
      select.appendChild(opt);
    });

    var bouton = el('button', 'reshiram-bouton reshiram-bouton-relier', 'Relier');
    bouton.type = 'submit';

    form.appendChild(select);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      relierFiche(talent.id, select.value);
    });
    section.appendChild(form);
  }

  function rendreCapitalReseau(talent, carte) {
    var section = el('section', 'reshiram-capital');
    section.appendChild(el('h4', 'reshiram-capital-titre', 'Capital réseau'));

    if (etat.capitalIndisponible) {
      section.appendChild(el('p', 'reshiram-capital-aide',
        'Capital réseau indisponible pour l’instant.'));
      carte.appendChild(section);
      return;
    }

    rendreCapitalCompte(talent, section);
    refsDe(talent.id).forEach(function (ref) { rendreFicheReliee(ref, section); });
    construireFormRelier(talent, section);
    carte.appendChild(section);
  }

  function rendreTalent(talent) {
    var carte = el('article', 'reshiram-talent');
    carte.id = 'reshiram-talent-' + talent.id;
    if (talent.a_etayer === true) { carte.classList.add('reshiram-talent--a-etayer'); }

    var entete = el('header', 'reshiram-talent-entete');
    entete.appendChild(el('h3', 'reshiram-talent-nom', talent.nom || ''));
    entete.appendChild(el('span', 'reshiram-niveau',
      LIBELLE_NIVEAU[talent.niveau] || talent.niveau || ''));
    carte.appendChild(entete);

    rendreSecteurs(talent, carte);

    if (talent.plus_value) {
      carte.appendChild(el('p', 'reshiram-plusvalue', 'Plus-value : ' + talent.plus_value));
    }

    rendrePreuves(talent, carte);
    rendreCapitalReseau(talent, carte);
    return carte;
  }

  function rendreTalents() {
    var conteneur = document.getElementById('reshiram-talents');
    if (!conteneur) { return; }
    conteneur.textContent = '';

    var visibles = talentsVisibles(etat.talents, etat.vue);
    var note = document.getElementById('reshiram-vue-note');
    if (note) {
      note.textContent = etat.vue === 'offre'
        ? 'Ce que tu peux proposer aujourd’hui — uniquement les talents étayés (au moins une preuve).'
        : 'Toute la carte — un talent sans preuve reste « à étayer », pas un talent affirmé.';
    }

    if (visibles.length === 0) {
      conteneur.appendChild(el('p', 'reshiram-vide', etat.vue === 'offre'
        ? 'Aucun talent étayé pour l’instant — étaye un talent d’une preuve pour qu’il entre dans ton offre réelle.'
        : 'Aucun talent dressé pour l’instant — dresse ton premier talent ci-dessus.'));
      return;
    }
    visibles.forEach(function (t) { conteneur.appendChild(rendreTalent(t)); });
  }

  // ---------- Bascule de vue ----------

  function poserVue(vue) {
    etat.vue = (vue === 'offre') ? 'offre' : 'tous';
    var bTous = document.getElementById('reshiram-vue-tous');
    var bOffre = document.getElementById('reshiram-vue-offre');
    if (bTous) { bTous.setAttribute('aria-pressed', String(etat.vue === 'tous')); }
    if (bOffre) { bOffre.setAttribute('aria-pressed', String(etat.vue === 'offre')); }
    rendreTalents();
  }

  // ---------- Écritures (Bearer, erreurs génériques) ----------

  function messageForm(texte, estErreur) {
    var zone = document.getElementById('reshiram-form-message');
    if (!zone) { return; }
    zone.textContent = texte || '';
    zone.classList.toggle('reshiram-form-message--erreur', Boolean(estErreur));
  }

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

  async function soumettreTalent(form) {
    var nom = (form.elements.nom.value || '').trim();
    if (!nom) { messageForm('Le nom du talent est requis.', true); return; }
    var secteurs = (form.elements.secteurs.value || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });
    var plusValue = (form.elements.plus_value.value || '').trim();
    var corps = {
      nom: nom,
      secteurs: secteurs,
      niveau: form.elements.niveau.value || 'notion'
    };
    if (plusValue) { corps.plus_value = plusValue; }

    messageForm('Enregistrement…', false);
    var res = await appelApi('/api/talents', corps);
    if (res.status === 401) { montrer('reshiram-auth'); return; }
    if (!res.ok) { messageForm('Enregistrement impossible. Réessaie.', true); return; }
    form.reset();
    messageForm('Talent dressé — étaye-le d’une preuve pour qu’il compte.', false);
    await rafraichir();
  }

  async function soumettrePreuve(talentId, contenu) {
    var texte = (contenu || '').trim();
    if (!texte) { return; }
    var res = await appelApi('/api/preuves', { talent_id: talentId, contenu: texte });
    if (res.status === 401) { montrer('reshiram-auth'); return; }
    if (!res.ok) { messageForm('Preuve non enregistrée. Réessaie.', true); return; }
    await rafraichir();
  }

  // Relier / détacher une fiche RIVEN (lien lecture seule ; jamais d'écriture RIVEN).
  async function relierFiche(talentId, nodeId) {
    if (!nodeId) { return; }
    var res = await appelApi('/api/talent-refs', { talent_id: talentId, node_id: nodeId });
    if (res.status === 401) { montrer('reshiram-auth'); return; }
    if (res.status === 409) { messageForm('Déjà reliée.', true); return; }
    if (!res.ok) { messageForm('Lien non enregistré. Réessaie.', true); return; }
    await rafraichir();
  }

  async function detacherRef(refId) {
    if (!refId) { return; }
    var res = await appelApi('/api/talent-refs', { id: refId }, 'DELETE');
    if (res.status === 401) { montrer('reshiram-auth'); return; }
    if (!res.ok) { messageForm('Lien non détaché. Réessaie.', true); return; }
    await rafraichir();
  }

  // ---------- Flux : session → API → registre (fail-closed partout) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function chargerRegistre() {
    var reponse;
    try {
      reponse = await fetch('/api/talents', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        }
      });
    } catch (e) {
      montrer('reshiram-erreur');
      return false;
    }
    if (reponse.status === 401) { montrer('reshiram-auth'); return false; } // fail-closed
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      montrer('reshiram-erreur');
      return false;
    }
    etat.talents = (corps.data && corps.data.talents) || [];
    etat.preuves = (corps.data && corps.data.preuves) || [];
    // Second appel : le capital réseau. Un 401 reste fail-closed global ; tout
    // autre échec dégrade le panneau en « indisponible » sans casser la carte.
    var statutCapital = await chargerCapital();
    if (statutCapital === 'auth') { montrer('reshiram-auth'); return false; }
    rendreTalents();
    montrer('reshiram-registre');
    return true;
  }

  // GET /api/talent-refs (même Bearer). Renvoie 'auth' sur 401 (fail-closed),
  // true sinon (succès → refs/capital/reseau rangés ; échec → indisponible).
  async function chargerCapital() {
    etat.refs = [];
    etat.capital = [];
    etat.reseau = [];
    etat.capitalIndisponible = false;
    var reponse;
    try {
      reponse = await fetch('/api/talent-refs', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        }
      });
    } catch (e) {
      etat.capitalIndisponible = true;
      return true;
    }
    if (reponse.status === 401) { return 'auth'; } // fail-closed global
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      etat.capitalIndisponible = true;
      return true;
    }
    etat.refs = (corps.data && corps.data.refs) || [];
    etat.capital = (corps.data && corps.data.capital) || [];
    etat.reseau = (corps.data && corps.data.reseau) || [];
    return true;
  }

  // Re-lecture après écriture (talents_etat recalcule a_etayer/nb_preuves).
  async function rafraichir() {
    await chargerRegistre();
  }

  function brancherFormulaires() {
    var formTalent = document.getElementById('reshiram-form-talent');
    if (formTalent) {
      formTalent.addEventListener('submit', function (e) {
        e.preventDefault();
        soumettreTalent(formTalent);
      });
    }
    var bTous = document.getElementById('reshiram-vue-tous');
    var bOffre = document.getElementById('reshiram-vue-offre');
    if (bTous) { bTous.addEventListener('click', function () { poserVue('tous'); }); }
    if (bOffre) { bOffre.addEventListener('click', function () { poserVue('offre'); }); }
  }

  async function demarrer() {
    montrer('reshiram-chargement');
    brancherFormulaires();
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('reshiram-auth'); // pas de mode démo : données perso uniquement
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
      montrer('reshiram-auth');
      return;
    }
    etat.session = session;
    await chargerRegistre();
  }

  // Fonctions pures exposées pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaReshiram = { talentsVisibles: talentsVisibles, capitalDe: capitalDe };

  demarrer().catch(function () { montrer('reshiram-erreur'); });
})();
