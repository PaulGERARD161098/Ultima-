// Ultima — quadrant ZEKROM (v1) : la carte des idéaux, tournée vers le cap,
// + la passerelle R↔Z (LV2-③) : le rétroplanning manuel depuis chaque idéal.
// Miroir de js/reshiram.js pour la partie idéaux (règle cardinale INVERSE : le réel
// ne bride pas l'idéal ; « à orienter » = invitation, jamais dévaluation).
// Passerelle : depuis un idéal, relier un talent RESHIRAM réel avec une nature
//   - 'acquis'      = ce talent (que j'ai) rend l'idéal possible ;
//   - 'a_construire' = cet idéal appelle ce talent, qui me manque.
// Le panneau affiche le bilan « ce que j'ai déjà / ce qui me manque ». Manuel v1.
// Le registre DERRIÈRE AUTH, données réelles uniquement (fail-closed partout) :
//   GET /api/ideaux (idéaux + directions), /api/talents (les talents à relier),
//   /api/passerelles (les liens + le rétroplanning). AUCUNE donnée en dur.
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var LIBELLE_REGISTRE = {
    vision: 'vision',
    volonte: 'volonté',
    projet: 'projet'
  };

  var etat = {
    session: null,
    ideaux: [],
    directions: [],
    talents: [],
    passerelles: [],
    vue: 'tous'
  };

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

  // Les liens (passerelles) d'un idéal.
  function liensDe(idealId) {
    return etat.passerelles.filter(function (p) { return p && p.ideal_id === idealId; });
  }

  // Nom d'un talent depuis son id (les talents viennent de /api/talents).
  function nomTalent(talentId) {
    var t = etat.talents.filter(function (x) { return x && x.id === talentId; })[0];
    return t ? (t.nom || '') : '(talent supprimé)';
  }

  // ---------- Rendu d'un idéal ----------

  function rendreDirections(ideal, carte) {
    var directions = directionsDe(ideal.id);
    if (ideal.a_orienter === true || directions.length === 0) {
      carte.appendChild(el('span', 'zekrom-aorienter', 'à orienter'));
      carte.appendChild(el('p', 'zekrom-invite',
        'Vers quoi ce rêve t’emmène ? Formule une direction — le premier cap.'));
    } else {
      var liste = el('ul', 'zekrom-directions');
      directions.forEach(function (d) {
        liste.appendChild(el('li', 'zekrom-direction', String(d.formulation || '')));
      });
      carte.appendChild(liste);
    }
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

  // ---------- Rétroplanning (passerelle R↔Z) : par idéal ----------

  function rendreGroupeLiens(carte, titre, liens, classeVide, texteVide) {
    var groupe = el('div', 'zekrom-retro-groupe');
    groupe.appendChild(el('h5', 'zekrom-retro-titre', titre));
    if (liens.length === 0) {
      groupe.appendChild(el('p', classeVide, texteVide));
    } else {
      var liste = el('ul', 'zekrom-retro-liste');
      liens.forEach(function (p) {
        var item = el('li', 'zekrom-retro-item');
        item.appendChild(el('span', 'zekrom-retro-talent', nomTalent(p.talent_id)));
        if (p.note) { item.appendChild(el('span', 'zekrom-retro-note', ' — ' + p.note)); }
        var detacher = el('button', 'zekrom-retro-detacher', 'détacher');
        detacher.type = 'button';
        detacher.setAttribute('aria-label', 'Détacher « ' + nomTalent(p.talent_id) + ' »');
        detacher.addEventListener('click', function () { detacherLien(p.id); });
        item.appendChild(detacher);
        liste.appendChild(item);
      });
      groupe.appendChild(liste);
    }
    carte.appendChild(groupe);
  }

  function construireFormLien(ideal) {
    var form = el('form', 'zekrom-retro-form');
    // Talents non encore reliés à cet idéal (on ne relie pas deux fois la paire).
    var dejaLies = liensDe(ideal.id).map(function (p) { return p.talent_id; });
    var dispo = etat.talents.filter(function (t) { return dejaLies.indexOf(t.id) === -1; });

    if (etat.talents.length === 0) {
      form.appendChild(el('p', 'zekrom-retro-aide',
        'Aucun talent réel à relier pour l’instant — dresse tes talents dans RESHIRAM.'));
      var lien = el('a', 'zekrom-retro-vers-reshiram', 'Ouvrir RESHIRAM');
      lien.href = 'reshiram.html';
      form.appendChild(lien);
      return form;
    }
    if (dispo.length === 0) {
      form.appendChild(el('p', 'zekrom-retro-aide',
        'Tous tes talents sont déjà reliés à cet idéal.'));
      return form;
    }

    var selTalent = el('select', 'zekrom-retro-select');
    selTalent.name = 'talent_id';
    selTalent.setAttribute('aria-label', 'Talent à relier');
    dispo.forEach(function (t) {
      var opt = el('option', null, t.nom || '(sans nom)');
      opt.value = t.id;
      selTalent.appendChild(opt);
    });

    var selNature = el('select', 'zekrom-retro-select');
    selNature.name = 'nature';
    selNature.setAttribute('aria-label', 'Nature du lien');
    [['acquis', 'je l’ai déjà — il rend l’idéal possible'],
     ['a_construire', 'il me manque — à construire']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      selNature.appendChild(opt);
    });

    var bouton = el('button', 'zekrom-bouton zekrom-bouton-lien', 'Relier');
    bouton.type = 'submit';

    form.appendChild(selTalent);
    form.appendChild(selNature);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreLien(ideal.id, selTalent.value, selNature.value);
    });
    return form;
  }

  function rendreRetroplanning(ideal, carte) {
    var section = el('section', 'zekrom-retro');
    section.appendChild(el('h4', 'zekrom-retro-entete', 'Rétroplanning — ce que j’ai, ce qui me manque'));

    var liens = liensDe(ideal.id);
    var acquis = liens.filter(function (p) { return p.nature === 'acquis'; });
    var aConstruire = liens.filter(function (p) { return p.nature === 'a_construire'; });

    rendreGroupeLiens(section, 'Ce que j’ai déjà', acquis,
      'zekrom-retro-vide', 'Aucun talent réel relié pour l’instant.');
    rendreGroupeLiens(section, 'Ce qui me manque', aConstruire,
      'zekrom-retro-vide', 'Aucun manque identifié pour l’instant.');

    section.appendChild(construireFormLien(ideal));
    carte.appendChild(section);
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
    rendreRetroplanning(ideal, carte);
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

  async function soumettreLien(idealId, talentId, nature) {
    if (!talentId) { return; }
    var res = await appelApi('/api/passerelles', {
      ideal_id: idealId, talent_id: talentId, nature: nature || 'acquis'
    });
    if (res.status === 401) { montrer('zekrom-auth'); return; }
    if (!res.ok) { messageForm('Lien non enregistré. Réessaie.', true); return; }
    await rafraichir();
  }

  async function detacherLien(lienId) {
    if (!lienId) { return; }
    var res = await appelApi('/api/passerelles', { id: lienId }, 'DELETE');
    if (res.status === 401) { montrer('zekrom-auth'); return; }
    if (!res.ok) { messageForm('Lien non détaché. Réessaie.', true); return; }
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
    var repIdeaux, repTalents, repPasserelles;
    try {
      // Les 3 lectures en parallèle : idéaux (+directions), talents (à relier),
      // passerelles (+rétroplanning). Toutes derrière le même Bearer.
      var resultats = await Promise.all([
        lireJson('/api/ideaux'),
        lireJson('/api/talents'),
        lireJson('/api/passerelles')
      ]);
      repIdeaux = resultats[0];
      repTalents = resultats[1];
      repPasserelles = resultats[2];
    } catch (e) {
      montrer('zekrom-erreur');
      return false;
    }
    // Fail-closed : une 401 sur n'importe quelle lecture ferme tout.
    if (repIdeaux.status === 401 || repTalents.status === 401 || repPasserelles.status === 401) {
      montrer('zekrom-auth');
      return false;
    }
    var cIdeaux = null, cTalents = null, cPasserelles = null;
    try { cIdeaux = await repIdeaux.json(); } catch (e) { cIdeaux = null; }
    try { cTalents = await repTalents.json(); } catch (e) { cTalents = null; }
    try { cPasserelles = await repPasserelles.json(); } catch (e) { cPasserelles = null; }

    if (!repIdeaux.ok || !cIdeaux || cIdeaux.ok !== true) {
      montrer('zekrom-erreur');
      return false;
    }
    etat.ideaux = (cIdeaux.data && cIdeaux.data.ideaux) || [];
    etat.directions = (cIdeaux.data && cIdeaux.data.directions) || [];
    // Talents et passerelles sont un enrichissement : s'ils échouent, la carte des
    // idéaux reste utilisable (le rétroplanning se dégrade sans casser).
    etat.talents = (repTalents.ok && cTalents && cTalents.ok === true &&
      cTalents.data && cTalents.data.talents) || [];
    etat.passerelles = (repPasserelles.ok && cPasserelles && cPasserelles.ok === true &&
      cPasserelles.data && cPasserelles.data.passerelles) || [];

    rendreIdeaux();
    montrer('zekrom-registre');
    return true;
  }

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
      montrer('zekrom-auth');
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
