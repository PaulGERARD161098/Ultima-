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
    liens: [],
    // Tables de résolution des cibles de passerelles (best-effort, dégradables).
    sermentsListe: [],   // [{ id, libelle }] pour le picker Objectif DRAUKHAIN
    sermentsParId: {},   // id → intitulé (résolution d'un lien)
    pagesListe: [],      // [{ id, libelle }] pour le picker Page MINETHNIR
    pagesParId: {},      // id → libellé (titre sinon date lisible)
    vue: 'toutes'
  };

  var LIBELLE_RAPPORT = { menace: 'menace', sert: 'sert' };

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

  // Les passerelles (scenario_liens) d'un scénario, rattachées par scenario_id.
  function liensDe(scenarioId) {
    return etat.liens.filter(function (l) { return l && l.scenario_id === scenarioId; });
  }

  // Date lisible en français (repli si created_at absent/illisible).
  function dateLisible(iso) {
    if (!iso) { return 'page liée'; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return 'page liée'; }
    try {
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  // Libellé d'une page MINETHNIR : son titre, sinon sa date lisible.
  function libellePage(page) {
    var titre = (page && page.titre ? String(page.titre) : '').trim();
    if (titre) { return titre; }
    return dateLisible(page && page.created_at);
  }

  // Résolution d'une passerelle → { prefixe, nom }. Dégradation propre : libellé
  // neutre si la cible n'a pas pu être résolue (table de cibles indisponible).
  function libelleLien(lien) {
    if (lien && lien.serment_id) {
      return { prefixe: 'Objectif : ', nom: etat.sermentsParId[lien.serment_id] || 'serment lié' };
    }
    if (lien && lien.entree_id) {
      return { prefixe: 'Page : ', nom: etat.pagesParId[lien.entree_id] || 'page liée' };
    }
    return { prefixe: '', nom: 'passerelle' };
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

    // Passerelles v2 : relier ce futur à un objectif DRAUKHAIN ou une page MINETHNIR.
    item.appendChild(rendrePasserelles(scenario));
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

  // ---------- Passerelles v2 : relier un scénario à un objectif DRAUKHAIN
  //            (rapport menace/sert) OU à une page MINETHNIR (§5 CADRAGE-IMLADRIK). ----------

  function rendrePasserelles(scenario) {
    var section = el('section', 'zekrom-retro');
    section.appendChild(el('h4', 'zekrom-retro-entete', 'Passerelles'));

    var liens = liensDe(scenario.id);
    if (liens.length === 0) {
      section.appendChild(el('p', 'zekrom-retro-vide',
        'Aucune passerelle — relie ce futur à un objectif qu’il menace ou qu’il sert, ou à la page d’où vient la question.'));
    } else {
      var liste = el('ul', 'zekrom-retro-liste');
      liens.forEach(function (lien) { liste.appendChild(rendreLien(lien, scenario)); });
      section.appendChild(liste);
    }
    section.appendChild(construireFormLien(scenario));
    return section;
  }

  function rendreLien(lien, scenario) {
    var item = el('li', 'zekrom-retro-item');
    var resolu = libelleLien(lien);
    item.appendChild(el('span', 'zekrom-retro-note', resolu.prefixe));
    item.appendChild(el('span', 'zekrom-retro-talent', resolu.nom));
    // Rapport (menace/sert) : pastille, UNIQUEMENT quand la cible est un serment.
    if (lien.serment_id && lien.rapport) {
      item.appendChild(el('span', 'zekrom-registre',
        '(' + (LIBELLE_RAPPORT[lien.rapport] || lien.rapport) + ')'));
    }
    var detacher = el('button', 'zekrom-retro-detacher', 'détacher');
    detacher.type = 'button';
    detacher.setAttribute('aria-label',
      'Détacher cette passerelle du scénario « ' + String(scenario.deroule || '') + ' »');
    detacher.addEventListener('click', function () { detacherLien(lien.id); });
    item.appendChild(detacher);
    return item;
  }

  function construireFormLien(scenario) {
    var form = el('form', 'zekrom-retro-form');
    form.dataset.scenarioId = scenario.id;

    // 1. Type de cible : Objectif DRAUKHAIN ou Page MINETHNIR.
    var typeSel = el('select', 'zekrom-retro-select');
    typeSel.name = 'cible-type';
    typeSel.setAttribute('aria-label', 'Type de passerelle à relier');
    [['serment', 'Objectif DRAUKHAIN'], ['entree', 'Page MINETHNIR']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      typeSel.appendChild(opt);
    });

    // 2a. Sélecteur d'objectif (serment) — vide/absent d'options si non chargé.
    var sermentSel = el('select', 'zekrom-retro-select');
    sermentSel.name = 'serment';
    sermentSel.setAttribute('aria-label', 'Objectif DRAUKHAIN à relier');
    etat.sermentsListe.forEach(function (s) {
      var opt = el('option', null, s.libelle);
      opt.value = s.id;
      sermentSel.appendChild(opt);
    });

    // 2b. Rapport au serment : ce que ce futur MENACE ou SERT.
    var rapportSel = el('select', 'zekrom-retro-select');
    rapportSel.name = 'rapport';
    rapportSel.setAttribute('aria-label', 'Rapport à l’objectif');
    [['menace', 'menace — ce futur menace cet objectif'],
     ['sert', 'sert — ce futur sert cet objectif']].forEach(function (paire) {
      var opt = el('option', null, paire[1]);
      opt.value = paire[0];
      rapportSel.appendChild(opt);
    });
    rapportSel.value = 'menace';

    // 2c. Sélecteur de page MINETHNIR.
    var pageSel = el('select', 'zekrom-retro-select');
    pageSel.name = 'entree';
    pageSel.setAttribute('aria-label', 'Page MINETHNIR à relier');
    etat.pagesListe.forEach(function (p) {
      var opt = el('option', null, p.libelle);
      opt.value = p.id;
      pageSel.appendChild(opt);
    });

    var bouton = el('button', 'zekrom-bouton zekrom-bouton-lien', 'Relier');
    bouton.type = 'submit';

    // Bascule d'affichage selon le type choisi (via .hidden, jamais de style inline).
    function majVisibilite() {
      var estServ = typeSel.value === 'serment';
      sermentSel.hidden = !estServ;
      rapportSel.hidden = !estServ;
      pageSel.hidden = estServ;
    }
    typeSel.addEventListener('change', majVisibilite);
    majVisibilite();

    form.appendChild(typeSel);
    form.appendChild(sermentSel);
    form.appendChild(rapportSel);
    form.appendChild(pageSel);
    form.appendChild(bouton);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      soumettreLien(scenario.id, typeSel.value, sermentSel.value, rapportSel.value, pageSel.value);
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

  async function soumettreLien(scenarioId, type, sermentId, rapport, entreeId) {
    if (!scenarioId) { return; }
    var corps;
    if (type === 'serment') {
      if (!sermentId) { messageForm('Choisis un objectif à relier.', true); return; }
      corps = { scenario_id: scenarioId, serment_id: sermentId };
      // rapport UNIQUEMENT avec un serment (contrat API).
      if (rapport) { corps.rapport = rapport; }
    } else {
      if (!entreeId) { messageForm('Choisis une page à relier.', true); return; }
      corps = { scenario_id: scenarioId, entree_id: entreeId };
    }
    var res = await appelApi('/api/scenario-liens', corps);
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    if (!res.ok) { messageForm('Passerelle non créée. Réessaie.', true); return; }
    await rafraichir();
  }

  async function detacherLien(lienId) {
    if (!lienId) { return; }
    var res = await appelApi('/api/scenario-liens', { id: lienId }, 'DELETE');
    if (res.status === 401) { montrer('vranesh-auth'); return; }
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

  // Lecture best-effort d'une source de cibles (serments / pages). Renvoie data ou
  // null — jamais d'exception propagée : une cible indisponible dégrade le picker
  // et les libellés, mais n'empêche JAMAIS le rendu des situations.
  async function lireCible(chemin) {
    try {
      var rep = await lireJson(chemin);
      if (!rep.ok) { return null; }
      var c = await rep.json();
      if (!c || c.ok !== true) { return null; }
      return c.data || null;
    } catch (e) {
      return null;
    }
  }

  async function chargerServments() {
    var data = await lireCible('/api/serments');
    var serments = (data && data.serments) || [];
    serments.forEach(function (s) {
      if (s && s.id) {
        var lib = (s.intitule ? String(s.intitule) : '').trim();
        etat.sermentsParId[s.id] = lib;
        etat.sermentsListe.push({ id: s.id, libelle: lib || 'serment lié' });
      }
    });
  }

  async function chargerPages() {
    var data = await lireCible('/api/imladrik');
    var entrees = (data && data.entrees) || [];
    entrees.forEach(function (p) {
      if (p && p.id) {
        var lib = libellePage(p);
        etat.pagesParId[p.id] = lib;
        etat.pagesListe.push({ id: p.id, libelle: lib });
      }
    });
  }

  async function chargerCibles() {
    etat.sermentsListe = [];
    etat.sermentsParId = {};
    etat.pagesListe = [];
    etat.pagesParId = {};
    await Promise.all([chargerServments(), chargerPages()]);
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
    etat.liens = (contenu.data && contenu.data.liens) || [];

    // Cibles des passerelles (best-effort, dégradation propre).
    await chargerCibles();

    rendreSituations();
    montrer('vranesh-registre');
    accueillirLeo();
    return true;
  }

  // ---------- Léo sur VRANESH (boucle ④, 2026-07-30) ----------
  // Miroir strict de DRAUKHAIN : le cartouche + les mains sur le cap. Paul
  // dicte « ouvre la situation… » ou « si tel cas, il pourrait se passer… »,
  // Léo propose, Paul confirme, l'écriture part vers /api/situations et
  // /api/scenarios. Fail-closed sans module ni session ; §5 : comptes seuls.
  function accueillirLeo() {
    if (!window.UltimaLeo || !etat.session || !etat.session.access_token) { return; }
    var total = etat.situations.length;
    var aExplorer = etat.situations.filter(function (s) { return s && s.a_explorer === true; }).length;
    var etatCarte = total === 0
      ? 'Aucune situation ouverte pour l’instant.'
      : (total === 1 ? '1 situation ouverte' : total + ' situations ouvertes')
        + (aExplorer > 0
          ? ' — ' + (aExplorer === 1 ? '1 reste' : aExplorer + ' restent') + ' à explorer.'
          : ', toutes anticipées.');

    var propositions = [];
    if (aExplorer > 0) {
      propositions.push({
        message: 'Explore un futur possible : dicte-moi le déroulé, je te le propose.',
        action: null
      });
    }
    propositions.push({
      message: 'Un cas donné à anticiper ? Dicte-le-moi, rien n’est ouvert sans ton accord.',
      action: null
    });

    window.UltimaLeo.accueillirQuadrant({
      quadrant: 'imladrik',
      blason: 'epee',
      salutation: 'Bienvenue, Paul. Voici les futurs que tu explores.',
      sections: [
        { titre: 'Où on en est', classe: 'leo-section-etat', lignes: [etatCarte] }
      ],
      propositions: propositions,
      propositionsVide: 'Rien à explorer aujourd’hui — tes futurs sont cartographiés.',
      voix: {
        quadrant: 'imladrik',
        jeton: etat.session.access_token,
        candidats: {
          situations: etat.situations.map(function (s) {
            return { id: s.id, libelle: (s.intitule || '').trim() };
          })
        }
      }
    });
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
