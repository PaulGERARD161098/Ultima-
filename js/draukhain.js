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
    liens: [],          // passerelles v2 : serment → idéal ZEKROM | page MINETHNIR
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

  // ---------- Rendu d'un serment ----------

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

    rendreFlammes(serment, carte);
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

    // Cibles des passerelles (idéaux ZEKROM + pages MINETHNIR) : enrichissement
    // pour résoudre les libellés et peupler les pickers. Chargées APRÈS le check
    // 401 du registre : leur échec ne bloque jamais le rendu des serments.
    await chargerCibles();

    rendreSerments();
    montrer('draukhain-registre');
    return true;
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

  // Fonction pure exposée pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaDraukhain = { sermentsVisibles: sermentsVisibles };

  demarrer().catch(function () { montrer('draukhain-erreur'); });
})();
