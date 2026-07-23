// Ultima — quadrant ZEKROM (v1) : la carte des idéaux, tournée vers le cap.
// Miroir de js/reshiram.js (ZEKROM ↔ RESHIRAM), avec la règle cardinale INVERSE :
//   - RESHIRAM ancre un talent sur une PREUVE (rien d'idéalisé sans preuve) ;
//   - ZEKROM capte un IDÉAL et l'oriente en DIRECTION (le cap). Le réel ne bride
//     pas l'expression : un idéal sans direction reste un idéal PLEIN — « à
//     orienter » est une INVITATION à formuler le cap, jamais une dévaluation.
// Le registre DERRIÈRE AUTH, données réelles uniquement :
//   - fail-closed : sans config, sans session ou sur échec API (401), la page
//     n'affiche AUCUNE donnée — seul le cartouche « Authentification requise »
//     est montré (le flux lien-magique vit sur traveler.html) ;
//   - avec session : GET /api/ideaux (Bearer) → ideaux (vue ideaux_etat, donc
//     nb_directions + a_orienter) + directions (rattachées par ideal_id). AUCUN
//     idéal en dur ici : les données perso ne viennent QUE de l'API authentifiée (RLS) ;
//   - vue « mon cap directionnel » : ne montre que les idéaux orientés (a_orienter=false).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var LIBELLE_REGISTRE = {
    vision: 'vision',
    volonte: 'volonté',
    projet: 'projet'
  };

  var etat = { session: null, ideaux: [], directions: [], vue: 'tous' };

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte !== undefined && texte !== null) { element.textContent = texte; }
    return element;
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['zekrom-chargement', 'zekrom-auth', 'zekrom-erreur', 'zekrom-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- Filtre pur (testable) : idéaux visibles selon la vue ----------
  //   'cap'  → uniquement les idéaux orientés (a_orienter === false) ;
  //   'tous' → toute la carte.
  function ideauxVisibles(ideaux, vue) {
    var liste = Array.isArray(ideaux) ? ideaux : [];
    if (vue === 'cap') {
      return liste.filter(function (i) { return i && i.a_orienter === false; });
    }
    return liste;
  }

  // Les directions d'un idéal (rattachées par ideal_id).
  function directionsDe(idealId) {
    return etat.directions.filter(function (d) { return d && d.ideal_id === idealId; });
  }

  // ---------- Rendu d'un idéal ----------

  function rendreDirections(ideal, carte) {
    var directions = directionsDe(ideal.id);
    if (ideal.a_orienter === true || directions.length === 0) {
      carte.appendChild(el('span', 'zekrom-aorienter', 'à orienter'));
      // Léo INVITE (jamais ne dévalue) : formuler le cap de ce rêve.
      carte.appendChild(el('p', 'zekrom-invite',
        'Vers quoi ce rêve t’emmène ? Formule une direction — le premier cap.'));
    } else {
      var liste = el('ul', 'zekrom-directions');
      directions.forEach(function (d) {
        liste.appendChild(el('li', 'zekrom-direction', String(d.formulation || '')));
      });
      carte.appendChild(liste);
    }
    // Formulaire d'ajout de direction, présent sur chaque idéal.
    carte.appendChild(construireFormDirection(ideal));
  }

  function construireFormDirection(ideal) {
    var form = el('form', 'zekrom-direction-form');
    form.dataset.idealId = ideal.id;
    var champ = el('input', 'zekrom-direction-input');
    champ.type = 'text';
    champ.name = 'formulation';
    champ.maxLength = 2000;
    champ.autocomplete = 'off';
    champ.setAttribute('aria-label', 'Formuler une direction pour « ' + (ideal.intitule || '') + ' »');
    champ.placeholder = 'le cap, la direction…';
    var bouton = el('button', 'zekrom-bouton zekrom-bouton-direction', 'Orienter');
    bouton.type = 'submit';
    form.appendChild(champ);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreDirection(ideal.id, champ.value);
    });
    return form;
  }

  function rendreIdeal(ideal) {
    var carte = el('article', 'zekrom-ideal');
    carte.id = 'zekrom-ideal-' + ideal.id;
    if (ideal.a_orienter === true) { carte.classList.add('zekrom-ideal--a-orienter'); }

    var entete = el('header', 'zekrom-ideal-entete');
    entete.appendChild(el('h3', 'zekrom-ideal-intitule', ideal.intitule || ''));
    entete.appendChild(el('span', 'zekrom-registre',
      LIBELLE_REGISTRE[ideal.registre] || ideal.registre || ''));
    carte.appendChild(entete);

    if (ideal.horizon) {
      carte.appendChild(el('p', 'zekrom-horizon', 'Horizon : ' + ideal.horizon));
    }

    rendreDirections(ideal, carte);
    return carte;
  }

  function rendreIdeaux() {
    var conteneur = document.getElementById('zekrom-ideaux');
    if (!conteneur) { return; }
    conteneur.textContent = '';

    var visibles = ideauxVisibles(etat.ideaux, etat.vue);
    var note = document.getElementById('zekrom-vue-note');
    if (note) {
      note.textContent = etat.vue === 'cap'
        ? 'Ton cap directionnel — les idéaux déjà formulés en direction (au moins un cap).'
        : 'Toute la carte — un idéal sans direction reste un idéal plein, simplement « à orienter ».';
    }

    if (visibles.length === 0) {
      conteneur.appendChild(el('p', 'zekrom-vide', etat.vue === 'cap'
        ? 'Aucun idéal orienté pour l’instant — formule une direction pour qu’un rêve entre dans ton cap.'
        : 'Aucun idéal capté pour l’instant — capte ton premier rêve ci-dessus.'));
      return;
    }
    visibles.forEach(function (i) { conteneur.appendChild(rendreIdeal(i)); });
  }

  // ---------- Bascule de vue ----------

  function poserVue(vue) {
    etat.vue = (vue === 'cap') ? 'cap' : 'tous';
    var bTous = document.getElementById('zekrom-vue-tous');
    var bCap = document.getElementById('zekrom-vue-cap');
    if (bTous) { bTous.setAttribute('aria-pressed', String(etat.vue === 'tous')); }
    if (bCap) { bCap.setAttribute('aria-pressed', String(etat.vue === 'cap')); }
    rendreIdeaux();
  }

  // ---------- Écritures (Bearer, erreurs génériques) ----------

  function messageForm(texte, estErreur) {
    var zone = document.getElementById('zekrom-form-message');
    if (!zone) { return; }
    zone.textContent = texte || '';
    zone.classList.toggle('zekrom-form-message--erreur', Boolean(estErreur));
  }

  async function appelApi(chemin, corps) {
    if (!etat.session || !etat.session.access_token) { return { ok: false, status: 401 }; }
    var reponse;
    try {
      reponse = await fetch(chemin, {
        method: 'POST',
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

  async function soumettreIdeal(form) {
    var intitule = (form.elements.intitule.value || '').trim();
    if (!intitule) { messageForm('L’intitulé de l’idéal est requis.', true); return; }
    var horizon = (form.elements.horizon.value || '').trim();
    var corps = {
      intitule: intitule,
      registre: form.elements.registre.value || 'vision'
    };
    if (horizon) { corps.horizon = horizon; }

    messageForm('Enregistrement…', false);
    var res = await appelApi('/api/ideaux', corps);
    if (res.status === 401) { montrer('zekrom-auth'); return; }
    if (!res.ok) { messageForm('Enregistrement impossible. Réessaie.', true); return; }
    form.reset();
    messageForm('Idéal capté — formule sa direction pour tracer le cap.', false);
    await rafraichir();
  }

  async function soumettreDirection(idealId, formulation) {
    var texte = (formulation || '').trim();
    if (!texte) { return; }
    var res = await appelApi('/api/directions', { ideal_id: idealId, formulation: texte });
    if (res.status === 401) { montrer('zekrom-auth'); return; }
    if (!res.ok) { messageForm('Direction non enregistrée. Réessaie.', true); return; }
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
      reponse = await fetch('/api/ideaux', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        }
      });
    } catch (e) {
      montrer('zekrom-erreur');
      return false;
    }
    if (reponse.status === 401) { montrer('zekrom-auth'); return false; } // fail-closed
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      montrer('zekrom-erreur');
      return false;
    }
    etat.ideaux = (corps.data && corps.data.ideaux) || [];
    etat.directions = (corps.data && corps.data.directions) || [];
    rendreIdeaux();
    montrer('zekrom-registre');
    return true;
  }

  // Re-lecture après écriture (ideaux_etat recalcule a_orienter/nb_directions).
  async function rafraichir() {
    await chargerRegistre();
  }

  function brancherFormulaires() {
    var formIdeal = document.getElementById('zekrom-form-ideal');
    if (formIdeal) {
      formIdeal.addEventListener('submit', function (e) {
        e.preventDefault();
        soumettreIdeal(formIdeal);
      });
    }
    var bTous = document.getElementById('zekrom-vue-tous');
    var bCap = document.getElementById('zekrom-vue-cap');
    if (bTous) { bTous.addEventListener('click', function () { poserVue('tous'); }); }
    if (bCap) { bCap.addEventListener('click', function () { poserVue('cap'); }); }
  }

  async function demarrer() {
    montrer('zekrom-chargement');
    brancherFormulaires();
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('zekrom-auth'); // pas de mode démo : données perso uniquement
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
      montrer('zekrom-auth');
      return;
    }
    etat.session = session;
    await chargerRegistre();
  }

  // Fonctions pures exposées pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaZekrom = { ideauxVisibles: ideauxVisibles };

  demarrer().catch(function () { montrer('zekrom-erreur'); });
})();
