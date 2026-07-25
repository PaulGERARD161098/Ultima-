// Ultima — quadrant VRANESH (v1) : la carte des futurs potentiels, anticiper ce
// qui PEUT advenir à partir d'un cas donné — puis revenir sereinement au présent.
// Miroir EXACT de js/draukhain.js (situations ↔ serments, scénarios ↔ flammes ;
// règle cardinale : une situation SANS scénario est « à explorer » = INVITATION
// POSITIVE à imaginer ses futurs, JAMAIS un manque ni un reproche ; VRANESH
// anticipe sereinement, ne rumine pas — l'exact pendant du « à raviver » de
// DRAUKHAIN, côté anticipation).
// Le registre DERRIÈRE AUTH, données réelles uniquement (fail-closed partout) :
//   GET /api/situations (situations + scenarios), POST /api/situations,
//   DELETE /api/situations, POST /api/scenarios, DELETE /api/scenarios.
//   AUCUNE donnée en dur, aucun mode démo (§5 : intime).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var LIBELLE_VRAISEMBLANCE = {
    faible: 'faible',
    moyenne: 'moyenne',
    forte: 'forte'
  };

  var etat = {
    session: null,
    situations: [],
    scenarios: [],
    vue: 'toutes'
  };

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte !== undefined && texte !== null) { element.textContent = texte; }
    return element;
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['vranesh-chargement', 'vranesh-auth', 'vranesh-erreur', 'vranesh-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- Filtre pur (testable) : situations visibles selon la vue ----------
  //   'anticipees' → uniquement les situations déjà anticipées (a_explorer === false,
  //                  soit au moins un scénario) ;
  //   'toutes'     → toute la carte.
  function situationsVisibles(situations, vue) {
    var liste = Array.isArray(situations) ? situations : [];
    if (vue === 'anticipees') {
      return liste.filter(function (s) { return s && s.a_explorer === false; });
    }
    return liste;
  }

  // Les scénarios d'une situation (rattachés par situation_id).
  function scenariosDe(situationId) {
    return etat.scenarios.filter(function (sc) { return sc && sc.situation_id === situationId; });
  }

  // Libellé du compte de scénarios (pastille du cartouche).
  function libelleCompte(n) {
    return n <= 1 ? (n + ' scénario') : (n + ' scénarios');
  }

  // ---------- Rendu des scénarios d'une situation ----------

  function rendreScenarios(situation, carte) {
    var scenarios = scenariosDe(situation.id);
    if (situation.a_explorer === true || scenarios.length === 0) {
      // « à explorer » : une INVITATION POSITIVE, jamais un manque.
      carte.appendChild(el('span', 'zekrom-aorienter', 'à explorer'));
      carte.appendChild(el('p', 'zekrom-invite',
        'Imagine ses futurs : déroule sereinement ce qui peut advenir, un scénario après l’autre, puis reviens au présent.'));
    } else {
      var liste = el('ul', 'zekrom-directions');
      scenarios.forEach(function (sc) {
        liste.appendChild(rendreScenario(sc, situation));
      });
      carte.appendChild(liste);
    }
    carte.appendChild(construireFormScenario(situation));
  }

  function rendreScenario(scenario, situation) {
    var item = el('li', 'zekrom-direction');
    // Vraisemblance en petite pastille (small-caps, cerne or).
    item.appendChild(el('span', 'zekrom-registre',
      LIBELLE_VRAISEMBLANCE[scenario.vraisemblance] || scenario.vraisemblance || ''));
    item.appendChild(el('span', 'zekrom-retro-talent', ' ' + String(scenario.deroule || '')));

    // Signes avant-coureurs et parade préparée : petits paragraphes étiquetés,
    // rendus seulement s'ils sont renseignés.
    if (scenario.signaux) {
      item.appendChild(el('p', 'zekrom-horizon', 'Signes avant-coureurs : ' + scenario.signaux));
    }
    if (scenario.parade) {
      item.appendChild(el('p', 'zekrom-horizon', 'Parade préparée : ' + scenario.parade));
    }

    var retirer = el('button', 'zekrom-retro-detacher', 'retirer');
    retirer.type = 'button';
    retirer.setAttribute('aria-label',
      'Retirer ce scénario de la situation « ' + (situation.intitule || '') + ' »');
    retirer.addEventListener('click', function () { retirerScenario(scenario.id); });
    item.appendChild(retirer);
    return item;
  }

  function construireFormScenario(situation) {
    var form = el('form', 'zekrom-direction-form');
    form.dataset.situationId = situation.id;

    var champ = el('input', 'zekrom-direction-input');
    champ.type = 'text';
    champ.name = 'deroule';
    champ.maxLength = 2000;
    champ.autocomplete = 'off';
    champ.setAttribute('aria-label', 'Ajouter un scénario à la situation « ' + (situation.intitule || '') + ' »');
    champ.placeholder = 'ce qui peut advenir…';

    var vraisemblance = el('select', 'zekrom-retro-select');
    vraisemblance.name = 'vraisemblance';
    vraisemblance.setAttribute('aria-label', 'Vraisemblance du scénario');
    [['faible', 'faible — un futur possible mais peu probable'],
     ['moyenne', 'moyenne — un futur plausible'],
     ['forte', 'forte — un futur probable']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      vraisemblance.appendChild(opt);
    });
    vraisemblance.value = 'moyenne';

    var signaux = el('input', 'zekrom-direction-input');
    signaux.type = 'text';
    signaux.name = 'signaux';
    signaux.maxLength = 2000;
    signaux.autocomplete = 'off';
    signaux.setAttribute('aria-label', 'Signes avant-coureurs (optionnel)');
    signaux.placeholder = 'signes avant-coureurs… (optionnel)';

    var parade = el('input', 'zekrom-direction-input');
    parade.type = 'text';
    parade.name = 'parade';
    parade.maxLength = 2000;
    parade.autocomplete = 'off';
    parade.setAttribute('aria-label', 'Parade préparée (optionnel)');
    parade.placeholder = 'parade préparée… (optionnel)';

    var bouton = el('button', 'zekrom-bouton zekrom-bouton-direction', 'Anticiper');
    bouton.type = 'submit';

    form.appendChild(champ);
    form.appendChild(vraisemblance);
    form.appendChild(signaux);
    form.appendChild(parade);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreScenario(situation.id, champ.value, vraisemblance.value, signaux.value, parade.value);
    });
    return form;
  }

  // ---------- Rendu d'une situation ----------

  function rendreSituation(situation) {
    var carte = el('article', 'zekrom-ideal');
    carte.id = 'vranesh-situation-' + situation.id;
    if (situation.a_explorer === true) { carte.classList.add('zekrom-ideal--a-orienter'); }

    var entete = el('header', 'zekrom-ideal-entete');
    entete.appendChild(el('h3', 'zekrom-ideal-intitule', situation.intitule || ''));
    entete.appendChild(el('span', 'zekrom-registre',
      libelleCompte(scenariosDe(situation.id).length)));
    carte.appendChild(entete);

    if (situation.contexte) {
      carte.appendChild(el('p', 'zekrom-horizon', 'Contexte : ' + situation.contexte));
    }

    rendreScenarios(situation, carte);
    return carte;
  }

  function rendreSituations() {
    var conteneur = document.getElementById('vranesh-situations');
    if (!conteneur) { return; }
    conteneur.textContent = '';

    var visibles = situationsVisibles(etat.situations, etat.vue);
    var note = document.getElementById('vranesh-vue-note');
    if (note) {
      note.textContent = etat.vue === 'anticipees'
        ? 'Tes situations anticipées — celles dont au moins un futur est déjà déroulé.'
        : 'Toute la carte — une situation sans scénario reste entière, simplement « à explorer ».';
    }

    if (visibles.length === 0) {
      conteneur.appendChild(el('p', 'zekrom-vide', etat.vue === 'anticipees'
        ? 'Aucune situation anticipée pour l’instant — déroule un premier futur pour qu’une situation soit anticipée.'
        : 'Aucune situation posée pour l’instant — pose ton premier cas ci-dessus.'));
      return;
    }
    visibles.forEach(function (s) { conteneur.appendChild(rendreSituation(s)); });
  }

  // ---------- Bascule de vue ----------

  function poserVue(vue) {
    etat.vue = (vue === 'anticipees') ? 'anticipees' : 'toutes';
    var bToutes = document.getElementById('vranesh-vue-toutes');
    var bAnticipees = document.getElementById('vranesh-vue-anticipees');
    if (bToutes) { bToutes.setAttribute('aria-pressed', String(etat.vue === 'toutes')); }
    if (bAnticipees) { bAnticipees.setAttribute('aria-pressed', String(etat.vue === 'anticipees')); }
    rendreSituations();
  }

  // ---------- Écritures (Bearer, erreurs génériques) ----------

  function messageForm(texte, estErreur) {
    var zone = document.getElementById('vranesh-form-message');
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

  async function soumettreSituation(form) {
    var intitule = (form.elements.intitule.value || '').trim();
    if (!intitule) { messageForm('L’intitulé de la situation est requis.', true); return; }
    var contexte = (form.elements.contexte.value || '').trim();
    var corps = { intitule: intitule };
    if (contexte) { corps.contexte = contexte; }

    messageForm('Enregistrement…', false);
    var res = await appelApi('/api/situations', corps);
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    if (!res.ok) { messageForm('Enregistrement impossible. Réessaie.', true); return; }
    form.reset();
    messageForm('Situation posée — déroule son premier futur pour commencer à l’anticiper.', false);
    await rafraichir();
  }

  async function soumettreScenario(situationId, deroule, vraisemblance, signaux, parade) {
    var propre = (deroule || '').trim();
    if (!propre) { return; }
    var corps = {
      situation_id: situationId,
      deroule: propre,
      vraisemblance: vraisemblance || 'moyenne'
    };
    var sig = (signaux || '').trim();
    var par = (parade || '').trim();
    if (sig) { corps.signaux = sig; }
    if (par) { corps.parade = par; }

    var res = await appelApi('/api/scenarios', corps);
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    if (!res.ok) { messageForm('Scénario non enregistré. Réessaie.', true); return; }
    await rafraichir();
  }

  async function retirerScenario(scenarioId) {
    if (!scenarioId) { return; }
    var res = await appelApi('/api/scenarios', { id: scenarioId }, 'DELETE');
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    if (!res.ok) { messageForm('Scénario non retiré. Réessaie.', true); return; }
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
      reponse = await lireJson('/api/situations');
    } catch (e) {
      montrer('vranesh-erreur');
      return false;
    }
    // Fail-closed : une 401 ferme tout.
    if (reponse.status === 401) {
      montrer('vranesh-auth');
      return false;
    }
    var contenu = null;
    try { contenu = await reponse.json(); } catch (e) { contenu = null; }

    if (!reponse.ok || !contenu || contenu.ok !== true) {
      montrer('vranesh-erreur');
      return false;
    }
    etat.situations = (contenu.data && contenu.data.situations) || [];
    etat.scenarios = (contenu.data && contenu.data.scenarios) || [];

    rendreSituations();
    montrer('vranesh-registre');
    return true;
  }

  async function rafraichir() {
    await chargerRegistre();
  }

  function brancherFormulaires() {
    var formSituation = document.getElementById('vranesh-form-situation');
    if (formSituation) {
      formSituation.addEventListener('submit', function (e) {
        e.preventDefault();
        soumettreSituation(formSituation);
      });
    }
    var bToutes = document.getElementById('vranesh-vue-toutes');
    var bAnticipees = document.getElementById('vranesh-vue-anticipees');
    if (bToutes) { bToutes.addEventListener('click', function () { poserVue('toutes'); }); }
    if (bAnticipees) { bAnticipees.addEventListener('click', function () { poserVue('anticipees'); }); }
  }

  async function demarrer() {
    montrer('vranesh-chargement');
    brancherFormulaires();
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('vranesh-auth');
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
      montrer('vranesh-auth');
      return;
    }
    etat.session = session;
    await chargerRegistre();
  }

  // Fonction pure exposée pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaVranesh = { situationsVisibles: situationsVisibles };

  demarrer().catch(function () { montrer('vranesh-erreur'); });
})();
