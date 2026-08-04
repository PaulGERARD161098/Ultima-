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
    rendreDenouement(situation, carte);
    return carte;
  }

  // ---------- LE DÉNOUEMENT : « la branche qui a poussé » (0019) ----------
  // Dictée Paul : quand le futur est advenu, il revient sur l'arbre et désigne
  // la branche qui a poussé — l'une des anticipées, ou une neuve si l'imprévu
  // est arrivé — et les autres branches potentielles sont SUPPRIMÉES.
  // La coupe est irréversible : elle se fait en DEUX temps (demander, puis
  // confirmer en sachant combien de branches tombent). Aucune boîte système —
  // la confirmation vit dans la page, donc lisible, stylée et vérifiable.

  function scenarioAdvenu(situation) {
    if (!situation || !situation.scenario_advenu_id) { return null; }
    var trouves = scenariosDe(situation.id).filter(function (sc) {
      return sc && sc.id === situation.scenario_advenu_id;
    });
    return trouves.length > 0 ? trouves[0] : null;
  }

  function rendreDenouement(situation, carte) {
    var scenarios = scenariosDe(situation.id);
    var bloc = el('section', 'zekrom-retro vranesh-denouement');

    // ---- Déjà advenu : on montre la branche qui a poussé, et on peut rouvrir.
    if (situation.advenue === true) {
      bloc.classList.add('vranesh-denouement--advenu');
      bloc.appendChild(el('h4', 'zekrom-retro-entete', 'La branche qui a poussé'));
      var advenu = scenarioAdvenu(situation);
      bloc.appendChild(el('p', 'vranesh-advenu-deroule',
        advenu ? (advenu.deroule || '') : 'Ce futur n’est plus dans la carte.'));
      if (situation.advenu_le) {
        bloc.appendChild(el('p', 'zekrom-retro-note',
          'Advenu — constaté le ' + dateLisible(situation.advenu_le) + '.'));
      }
      var rouvrir = el('button', 'zekrom-retro-detacher', 'Rouvrir ce thème');
      rouvrir.type = 'button';
      rouvrir.addEventListener('click', function () { poserDenouement(situation.id, null); });
      bloc.appendChild(rouvrir);
      carte.appendChild(bloc);
      return;
    }

    // Un thème « à explorer » n'a rien à trancher : on ne lui propose pas de
    // dénouement, on le laisse à son invitation. (Le jour où il aura des
    // branches, la question se posera d'elle-même.)
    if (scenarios.length === 0) { return; }

    // ---- Pas encore tranché : proposer de désigner la branche.
    bloc.appendChild(el('h4', 'zekrom-retro-entete', 'Ce futur est-il advenu ?'));
    bloc.appendChild(el('p', 'zekrom-retro-note',
      'Désigne la branche qui a poussé. Les autres branches potentielles seront '
      + 'supprimées — le geste est définitif.'));

    var form = el('form', 'zekrom-form vranesh-denouement-form');
    form.setAttribute('novalidate', 'novalidate');

    var champChoix = el('div', 'zekrom-champ');
    var idChoix = 'vranesh-advenu-' + situation.id;
    var labelChoix = el('label', null, 'La branche qui a poussé');
    labelChoix.setAttribute('for', idChoix);
    champChoix.appendChild(labelChoix);
    var choix = document.createElement('select');
    choix.id = idChoix;
    choix.className = 'zekrom-select';
    scenarios.forEach(function (sc) {
      var option = document.createElement('option');
      option.value = sc.id;
      option.textContent = sc.deroule || '';
      choix.appendChild(option);
    });
    var optionNeuve = document.createElement('option');
    optionNeuve.value = '';
    optionNeuve.textContent = 'Autre chose est arrivé — une branche neuve';
    choix.appendChild(optionNeuve);
    champChoix.appendChild(choix);
    form.appendChild(champChoix);

    // La branche neuve : « en créer une autre si nouvelle branche ».
    var champNeuf = el('div', 'zekrom-champ vranesh-branche-neuve');
    champNeuf.hidden = true;
    var idNeuf = 'vranesh-advenu-neuf-' + situation.id;
    var labelNeuf = el('label', null, 'Ce qui est réellement arrivé');
    labelNeuf.setAttribute('for', idNeuf);
    champNeuf.appendChild(labelNeuf);
    var neuf = document.createElement('input');
    neuf.id = idNeuf;
    neuf.type = 'text';
    neuf.maxLength = 2000;
    neuf.autocomplete = 'off';
    neuf.placeholder = 'le futur qui n’avait pas été anticipé…';
    champNeuf.appendChild(neuf);
    form.appendChild(champNeuf);

    choix.addEventListener('change', function () {
      champNeuf.hidden = choix.value !== '';
    });

    // Deux temps : demander, puis confirmer en sachant ce qui tombe.
    var actions = el('div', 'zekrom-form-actions');
    var demander = el('button', 'zekrom-bouton', 'Cette branche a poussé');
    demander.type = 'submit';
    actions.appendChild(demander);
    var messageDeno = el('span', 'zekrom-form-message');
    messageDeno.setAttribute('role', 'status');
    messageDeno.setAttribute('aria-live', 'polite');
    actions.appendChild(messageDeno);
    form.appendChild(actions);

    var confirmation = el('div', 'vranesh-confirmation');
    confirmation.hidden = true;
    form.appendChild(confirmation);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var choisi = choix.value;
      var texteNeuf = neuf.value.trim();
      if (!choisi && texteNeuf.length === 0) {
        messageDeno.textContent = 'Dis-moi ce qui est arrivé.';
        messageDeno.classList.add('zekrom-form-message--erreur');
        return;
      }
      messageDeno.textContent = '';
      messageDeno.classList.remove('zekrom-form-message--erreur');

      // Combien de branches tombent : toutes sauf celle qui a poussé. Une
      // branche neuve n'existe pas encore en base → toutes les anticipées.
      var coupees = choisi ? Math.max(0, scenarios.length - 1) : scenarios.length;

      confirmation.textContent = '';
      confirmation.hidden = false;
      confirmation.appendChild(el('p', 'vranesh-confirmation-texte',
        coupees === 0
          ? 'Aucune autre branche à couper. Confirmer ?'
          : (coupees === 1
            ? 'Confirmer ? L’autre branche potentielle sera supprimée définitivement.'
            : 'Confirmer ? Les ' + coupees + ' autres branches potentielles seront '
              + 'supprimées définitivement.')));
      var confirmer = el('button', 'zekrom-bouton vranesh-confirmer', 'Confirmer la coupe');
      confirmer.type = 'button';
      confirmer.addEventListener('click', function () {
        if (choisi) { poserDenouement(situation.id, choisi); }
        else { poserDenouementNeuf(situation.id, texteNeuf); }
      });
      var annuler = el('button', 'zekrom-retro-detacher', 'Annuler');
      annuler.type = 'button';
      annuler.addEventListener('click', function () {
        confirmation.hidden = true;
        confirmation.textContent = '';
      });
      confirmation.appendChild(confirmer);
      confirmation.appendChild(annuler);
      confirmer.focus();
    });

    bloc.appendChild(form);
    carte.appendChild(bloc);
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

  // ---------- LA BOUSSOLE DES FUTURS, PUIS L'ARBRE (v2, dictée Paul 2026-08-01) ----------
  // Constat de Paul sur la v1 : « c'est trop gros, c'est trop général et surtout
  // il y a trop de textes. L'affichage n'est vraiment pas très heureux. »
  // Forme retenue (Forme ① de design/preview-vranesh-arbre.html) — AFFICHAGE À
  // LA DEMANDE, en trois étages, jamais tout d'un coup :
  //   ① la ROSE ne porte que les NOMS des thèmes (+ une pastille de compte) ;
  //   ② un CLIC sur un thème remplace la rose par SON ARBRE : un tronc qui part
  //      de la base, des branches qui s'en détachent, une étiquette de quelques
  //      mots par branche ;
  //   ③ un SURVOL de branche l'illumine et donne UNE LIGNE sur le côté ; un CLIC
  //      déplie le détail (signaux, parade, passerelles).
  //   un THÈME = une SITUATION · une BRANCHE = un SCÉNARIO.
  //
  // Les caps portent des intitulés dictés, donc de la donnée intime : tout est
  // écrit en createElement/textContent, jamais en innerHTML, et rien n'est rendu
  // avant que la session ait été validée (chargerRegistre est déjà fail-closed).

  var GEO = {
    RAYON_CAP: 40,        // rayon des caps sur la rose (viewBox 0..100)
    RAYON_AIGUILLE: 30    // longueur des aiguilles depuis le centre
  };
  // L'arbre vit dans son propre repère (viewBox 0 0 300 196), tronc au milieu.
  // Le repère a été ÉLARGI de 240 à 300 le 2026-08-04 : à 240, les étiquettes
  // des branches de gauche sortaient du cadre chez Paul (constat en capture).
  // La largeur ne se règle pas à l'œil — elle est bornée branche par branche
  // ci-dessous, et mesurée par le harnais (motif DRAUKHAIN, foyer #135).
  var ARBRE = {
    L: 300, H: 196, TRONC_X: 150, PIED: 186,
    HAUT_MIN: 46, PREMIERE: 158, ECART: 24, PORTEE: 52, MONTEE: 20,
    MARGE: 5,               // air incompressible entre un texte et le bord
    LARGEUR_CAR: 4.4,       // largeur moyenne d'un signe à 8,5 px dans cette serif
    LARGEUR_CAR_SCEAU: 6.2, // idem pour l'étiquette agrandie d'un futur advenu
    ETIQ_MAX: 24,           // au-delà, on ne reconnaît plus, on lit — c'est le rôle du côté
    ETIQ_MIN: 6             // en deçà, une étiquette ne reconnaît plus rien : on n'écrit pas
  };
  var NS_SVG = 'http://www.w3.org/2000/svg';
  var boussoleEnAttente = false;   // un seul réveil armé à la fois
  var themeOuvert = null;          // id de la situation dont l'arbre est déplié

  // La géométrie de la rose vient du NOYAU (window.UltimaBoussoleNoyau, posé par
  // js/boussole-noyau.mjs) : on ne recopie pas sa trigonométrie, déjà couverte
  // par tests/unit-registre-lv3.mjs.
  function positionsCaps(n) {
    var noyau = window.UltimaBoussoleNoyau;
    if (!noyau || typeof noyau.positions !== 'function') { return null; }
    return noyau.positions(n);
  }

  function svgEl(nom, classe) {
    var element = document.createElementNS(NS_SVG, nom);
    if (classe) { element.setAttribute('class', classe); }
    return element;
  }

  // ---- Deux réductions de texte, pures et testables ----

  // Le NOM SEUL du thème. Paul : « il faut juste que ça s'affiche, après je sais
  // à quoi ça correspond. » Un intitulé « LIANDRA — l'amour et le devoir » se
  // porte donc « LIANDRA » sur son cap. Sans séparateur, on garde tout.
  function nomCourt(intitule) {
    var texte = (intitule || '').trim();
    var coupe = texte.split(/\s+[—–-]\s+/)[0];
    return coupe.trim() || texte;
  }

  // L'étiquette d'une branche : de quoi la reconnaître, pas de quoi la lire.
  // Première phrase du déroulé, bornée — le détail vit dans le cartouche.
  // `borne` = le nombre de signes que la place RÉELLE peut porter (calculé par
  // charpente) ; sans borne, la valeur de référence hors cadre (aria-label,
  // titre du cartouche), qui n'a pas de bord à respecter.
  function etiquetteBranche(deroule, borne) {
    var max = borne || 34;
    var texte = (deroule || '').trim();
    if (!texte) { return 'un futur'; }
    var phrase = texte.split(/[.;:!?]/)[0].trim() || texte;
    if (phrase.length <= max) { return phrase; }
    var mots = phrase.slice(0, max).split(' ');
    if (mots.length > 1) { mots.pop(); }
    return mots.join(' ') + '…';
  }

  // La charpente de l'arbre : n branches réparties le long du tronc, en
  // alternance gauche/droite, de la base vers le haut. Fonction PURE (aucun
  // DOM) → testable unitairement.
  function charpente(n) {
    var out = [];
    if (n <= 0) { return out; }
    var haut = Math.max(ARBRE.HAUT_MIN, ARBRE.PREMIERE + 6 - n * ARBRE.ECART);
    var pas = (ARBRE.PREMIERE - haut) / Math.max(1, n - 1);
    for (var i = 0; i < n; i += 1) {
      var y = (n === 1) ? 126 : (ARBRE.PREMIERE - i * pas);
      var sens = (i % 2 === 0) ? -1 : 1;
      var bx = ARBRE.TRONC_X + sens * (ARBRE.PORTEE + (i % 3) * 6);
      var by = y - ARBRE.MONTEE;
      var tx = bx + sens * 6;
      // La place RÉELLEMENT disponible pour l'étiquette de CETTE branche, en
      // unités du repère : à gauche le texte s'aligne à droite et court vers le
      // bord gauche, à droite l'inverse. On en déduit combien de signes elle
      // peut porter — plutôt que de tronquer à l'aveugle et d'espérer.
      var dispo = (sens < 0) ? (tx - ARBRE.MARGE) : (ARBRE.L - tx - ARBRE.MARGE);
      out.push({
        sens: sens,
        ax: ARBRE.TRONC_X, ay: y,
        cx: ARBRE.TRONC_X + sens * 28, cy: y - 5,
        bx: bx, by: by,
        tx: tx, ty: by - 7,
        dispo: dispo,
        signes: Math.max(0, Math.floor(dispo / ARBRE.LARGEUR_CAR))
      });
    }
    return { haut: haut, branches: out };
  }

  function medaillon() {
    var svg = svgEl('svg');
    svg.setAttribute('viewBox', '0 0 72 72');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var fond = svgEl('circle');
    fond.setAttribute('cx', '36'); fond.setAttribute('cy', '36'); fond.setAttribute('r', '33');
    fond.setAttribute('fill', '#f9f1dc');
    fond.setAttribute('stroke', '#a9884a');
    fond.setAttribute('stroke-width', '2.4');
    svg.appendChild(fond);
    var cerne = svgEl('circle');
    cerne.setAttribute('cx', '36'); cerne.setAttribute('cy', '36'); cerne.setAttribute('r', '28.5');
    cerne.setAttribute('fill', 'none');
    cerne.setAttribute('stroke', '#5a4118');
    cerne.setAttribute('stroke-width', '1');
    svg.appendChild(cerne);
    ['M36 56 V 40',
     'M36 40 C 36 32, 28 30, 24 22',
     'M36 40 C 36 30, 36 26, 36 20',
     'M36 40 C 36 32, 44 30, 48 22'].forEach(function (d, i) {
      var trait = svgEl('path');
      trait.setAttribute('d', d);
      trait.setAttribute('stroke', '#3b2f1c');
      trait.setAttribute('stroke-width', i === 0 ? '2.6' : '2');
      trait.setAttribute('fill', 'none');
      trait.setAttribute('stroke-linecap', 'round');
      svg.appendChild(trait);
    });
    return svg;
  }

  // ---- ③ Le cartouche de côté : une ligne au survol, tout au clic ----

  function coteRepos(texte) {
    var cote = document.getElementById('vranesh-parole');
    if (!cote) { return; }
    cote.textContent = '';
    cote.classList.remove('is-actif');
    cote.classList.remove('is-advenu');
    cote.appendChild(el('p', 'parole-defaut', texte));
  }

  function coteBranche(situation, scenario, rang, total, detail) {
    var cote = document.getElementById('vranesh-parole');
    if (!cote) { return; }
    cote.textContent = '';
    cote.classList.add('is-actif');
    var advenue = situation.advenue === true && scenario.id === situation.scenario_advenu_id;

    cote.appendChild(el('p', 'parole-nom', etiquetteBranche(scenario.deroule)));
    cote.appendChild(el('p', 'parole-etat', nomCourt(situation.intitule)
      + ' — futur ' + rang + ' sur ' + total
      + (advenue ? ' · la branche qui a poussé'
                 : ' · vraisemblance ' + (LIBELLE_VRAISEMBLANCE[scenario.vraisemblance] || 'moyenne'))));
    cote.appendChild(el('p', 'parole-texte', scenario.deroule || ''));

    if (advenue) { cote.classList.add('is-advenu'); }

    if (!detail) {
      cote.appendChild(el('p', 'parole-action', advenue
        ? 'Clique la branche pour tout voir ↝'
        : 'Clique la branche pour tout voir — et pour dire si c’est elle qui a poussé ↝'));
      return;
    }

    var dl = el('dl', 'vranesh-cote-detail');
    if (scenario.signaux) {
      dl.appendChild(el('dt', null, 'Signes avant-coureurs'));
      dl.appendChild(el('dd', null, scenario.signaux));
    }
    if (scenario.parade) {
      dl.appendChild(el('dt', null, 'Parade préparée'));
      dl.appendChild(el('dd', null, scenario.parade));
    }
    var liens = liensDe(scenario.id);
    dl.appendChild(el('dt', null, 'Passerelles'));
    if (liens.length === 0) {
      dl.appendChild(el('dd', null, 'Aucune — relie ce futur à un objectif dans le registre.'));
    } else {
      liens.forEach(function (lien) {
        var lu = libelleLien(lien);
        dl.appendChild(el('dd', null, lu.prefixe + lu.nom
          + (lien.rapport ? ' (' + (LIBELLE_RAPPORT[lien.rapport] || lien.rapport) + ')' : '')));
      });
    }
    if (dl.childNodes.length > 0) { cote.appendChild(dl); }

    var aller = el('a', 'vranesh-cote-lien', 'Ouvrir ce futur dans le registre ↝');
    aller.href = '#vranesh-situation-' + situation.id;
    cote.appendChild(aller);

    // Le geste vit LÀ OÙ Paul regarde : sur la branche qu'il vient de cliquer.
    cote.appendChild(actionDenouement(situation, scenario, total));
  }

  // ---- Choisir la branche DEPUIS L'ARBRE (dictée Paul 2026-08-04 : « je clique
  //      sur une branche, ça me donne le choix… il faut que je puisse
  //      sélectionner le futur qui soit advenu »).
  //      Le dénouement existait déjà, mais uniquement au fond du registre replié,
  //      sous forme de menu déroulant : hors du regard, donc hors d'usage. Il est
  //      ici porté par la branche elle-même — sans rien relâcher de la garde,
  //      puisque la coupe est irréversible : DEUX TEMPS, et la confirmation dit
  //      combien de branches tombent avant qu'aucune ne tombe.
  function actionDenouement(situation, scenario, total) {
    var zone = el('div', 'vranesh-cote-action');

    // Déjà tranché : on ne repropose pas de trancher, on rappelle l'état et on
    // laisse rouvrir (aucune suppression à la réouverture).
    if (situation.advenue === true) {
      if (situation.advenu_le) {
        zone.appendChild(el('p', 'vranesh-cote-scelle',
          'Advenu — constaté le ' + dateLisible(situation.advenu_le) + '.'));
      }
      var rouvrir = el('button', 'zekrom-retro-detacher vranesh-cote-rouvrir', 'Rouvrir ce thème');
      rouvrir.type = 'button';
      rouvrir.setAttribute('aria-label',
        'Rouvrir le thème « ' + nomCourt(situation.intitule) +' » — le futur redevient ouvert');
      rouvrir.addEventListener('click', function () { poserDenouement(situation.id, null); });
      zone.appendChild(rouvrir);
      return zone;
    }

    var demander = el('button', 'zekrom-bouton vranesh-cote-choisir', 'Cette branche a poussé');
    demander.type = 'button';
    demander.setAttribute('aria-label',
      'Désigner « ' + etiquetteBranche(scenario.deroule) + ' » comme le futur advenu');

    var confirmation = el('div', 'vranesh-confirmation vranesh-cote-confirmation');
    confirmation.hidden = true;

    demander.addEventListener('click', function () {
      var coupees = Math.max(0, total - 1);
      confirmation.textContent = '';
      confirmation.hidden = false;
      confirmation.appendChild(el('p', 'vranesh-confirmation-texte',
        coupees === 0
          ? 'Aucune autre branche à couper. Confirmer ?'
          : (coupees === 1
            ? 'Confirmer ? L’autre branche potentielle sera supprimée définitivement.'
            : 'Confirmer ? Les ' + coupees + ' autres branches potentielles seront '
              + 'supprimées définitivement.')));
      var confirmer = el('button', 'zekrom-bouton vranesh-confirmer', 'Confirmer la coupe');
      confirmer.type = 'button';
      confirmer.addEventListener('click', function () {
        poserDenouement(situation.id, scenario.id);
      });
      var annuler = el('button', 'zekrom-retro-detacher vranesh-cote-annuler', 'Annuler');
      annuler.type = 'button';
      annuler.addEventListener('click', function () {
        confirmation.hidden = true;
        confirmation.textContent = '';
        demander.focus();
      });
      confirmation.appendChild(confirmer);
      confirmation.appendChild(annuler);
      confirmer.focus();
    });

    zone.appendChild(demander);
    zone.appendChild(confirmation);
    return zone;
  }

  // ---- ② L'arbre d'un thème : un tronc, des branches ----

  function dessinerArbre(situation) {
    var cadre = document.getElementById('vranesh-arbre-dessin');
    var titre = document.getElementById('vranesh-arbre-nom');
    if (!cadre || !titre) { return; }
    cadre.textContent = '';
    titre.textContent = nomCourt(situation.intitule);

    var scenarios = scenariosDe(situation.id);
    var plan = charpente(scenarios.length);
    var haut = scenarios.length ? plan.haut : 96;

    var tronc = svgEl('path', 'vranesh-tronc vranesh-pousse');
    tronc.setAttribute('d', 'M' + ARBRE.TRONC_X + ' ' + ARBRE.PIED
      + ' C ' + (ARBRE.TRONC_X - 3) + ' 156, ' + (ARBRE.TRONC_X + 3) + ' 126, '
      + ARBRE.TRONC_X + ' ' + haut);
    cadre.appendChild(tronc);

    if (scenarios.length === 0) {
      var vide = svgEl('text', 'vranesh-arbre-vide');
      vide.setAttribute('x', String(ARBRE.TRONC_X));
      vide.setAttribute('y', '100');
      vide.setAttribute('text-anchor', 'middle');
      vide.textContent = 'aucun futur déroulé — la base attend ses branches';
      cadre.appendChild(vide);
      amorcerPousse(cadre);
      return;
    }

    plan.branches.forEach(function (b, i) {
      var sc = scenarios[i];
      var advenue = situation.advenue === true && sc.id === situation.scenario_advenu_id;
      var g = svgEl('g', 'vranesh-branche-g' + (advenue ? ' is-advenue' : ''));
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', etiquetteBranche(sc.deroule) + ' — '
        + (advenue ? 'la branche qui a poussé'
                   : 'vraisemblance ' + (LIBELLE_VRAISEMBLANCE[sc.vraisemblance] || 'moyenne')));

      var d = 'M' + b.ax + ' ' + b.ay + ' Q ' + b.cx + ' ' + b.cy + ' ' + b.bx + ' ' + b.by;
      var trait = svgEl('path', 'vranesh-branche vranesh-pousse vranesh-branche--'
        + (advenue ? 'advenue' : (sc.vraisemblance || 'moyenne')));
      trait.setAttribute('d', d);
      trait.style.animationDelay = (i * 90) + 'ms';
      var bourgeon = svgEl('circle', 'vranesh-bourgeon');
      bourgeon.setAttribute('cx', String(b.bx));
      bourgeon.setAttribute('cy', String(b.by));
      // La branche qui a poussé porte un bourgeon franchement plus gros : c'est
      // elle qu'on lit d'abord quand le thème est dénoué.
      bourgeon.setAttribute('r', advenue ? '5.5' : '3');
      var etiquette = svgEl('text', 'vranesh-etiquette');
      etiquette.setAttribute('x', String(b.tx));
      etiquette.setAttribute('y', String(b.ty));
      etiquette.setAttribute('text-anchor', b.sens < 0 ? 'end' : 'start');
      // Le budget de signes vient de la place réelle. Une branche advenue écrit
      // plus gros : son budget se recalcule à cette largeur-là, sinon elle
      // déborderait précisément là où on veut qu'elle se voie. En deçà du
      // minimum, on n'écrit rien plutôt que d'écrire dehors — le bourgeon et le
      // cartouche de côté portent alors seuls l'information.
      var budget = advenue
        ? Math.floor(b.dispo / ARBRE.LARGEUR_CAR_SCEAU)
        : b.signes;
      etiquette.textContent = budget >= ARBRE.ETIQ_MIN
        ? etiquetteBranche(sc.deroule, Math.min(ARBRE.ETIQ_MAX, budget))
        : '';
      // Zone de préhension généreuse : une courbe fine se rate à la souris.
      var zone = svgEl('path', 'vranesh-branche-zone');
      zone.setAttribute('d', d);

      g.appendChild(trait); g.appendChild(bourgeon);
      g.appendChild(etiquette); g.appendChild(zone);

      function entrer() {
        g.classList.add('is-actif');
        // Un futur ADVENU ne se replie jamais en une ligne : il a tranché, il
        // reste ouvert en grand même au simple survol.
        coteBranche(situation, sc, i + 1, scenarios.length, advenue);
      }
      function sortir() {
        if (!g.classList.contains('is-choisie')) { g.classList.remove('is-actif'); }
      }
      function choisir() {
        Array.prototype.forEach.call(cadre.querySelectorAll('.vranesh-branche-g'), function (o) {
          o.classList.remove('is-choisie'); o.classList.remove('is-actif');
        });
        g.classList.add('is-choisie'); g.classList.add('is-actif');
        coteBranche(situation, sc, i + 1, scenarios.length, true);
      }
      g.addEventListener('mouseenter', entrer);
      g.addEventListener('mouseleave', sortir);
      g.addEventListener('focus', entrer);
      g.addEventListener('blur', sortir);
      g.addEventListener('click', choisir);
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(); }
      });
      cadre.appendChild(g);
    });
    amorcerPousse(cadre);
  }

  // La pousse : chaque trait se dessine de son attache vers son bout. La
  // longueur est MESURÉE (getTotalLength) puis posée en style — un dasharray
  // fixe couperait tout trait plus long que lui.
  function amorcerPousse(racine) {
    Array.prototype.forEach.call(racine.querySelectorAll('.vranesh-pousse'), function (t) {
      var L = t.getTotalLength ? t.getTotalLength() : 0;
      if (!L) { return; }
      t.style.strokeDasharray = L;
      t.style.strokeDashoffset = L;
    });
  }

  function ouvrirArbre(situation) {
    var plateau = document.getElementById('vranesh-plateau');
    var scene = document.getElementById('vranesh-arbre');
    if (!plateau || !scene) { return; }
    themeOuvert = situation.id;
    plateau.hidden = true;
    scene.hidden = false;
    dessinerArbre(situation);

    // Un thème dénoué s'ouvre SUR SON DÉNOUEMENT : le futur qui a poussé est
    // déplié d'emblée, en grand — plus rien à survoler, il n'y a plus qu'un
    // futur et c'est lui qui oriente le reste (dictée Paul 2026-08-04).
    var advenu = scenarioAdvenu(situation);
    var sceau = document.getElementById('vranesh-arbre-sceau');
    scene.classList.toggle('is-advenu', Boolean(advenu));
    if (sceau) { sceau.hidden = !advenu; }
    if (advenu) {
      coteBranche(situation, advenu, 1, scenariosDe(situation.id).length, true);
    } else {
      coteRepos(scenariosDe(situation.id).length === 0
        ? 'Ce thème n’a pas encore de futur — il attend qu’on lui en imagine.'
        : 'Survole une branche — elle te dit ce qu’elle est. Clique-la pour tout '
          + 'voir, et pour désigner celle qui a poussé.');
    }
    var retour = document.getElementById('vranesh-arbre-retour');
    if (retour) { retour.focus(); }
  }

  function fermerArbre() {
    var plateau = document.getElementById('vranesh-plateau');
    var scene = document.getElementById('vranesh-arbre');
    if (!plateau || !scene) { return; }
    themeOuvert = null;
    scene.hidden = true;
    scene.classList.remove('is-advenu');
    var sceau = document.getElementById('vranesh-arbre-sceau');
    if (sceau) { sceau.hidden = true; }
    plateau.hidden = false;
    coteRepos('Clique un thème — son arbre se déplie.');
  }

  // ---- ① La rose : les NOMS des thèmes, rien d'autre ----

  function rendreBoussole() {
    var section = document.getElementById('vranesh-boussole');
    var plateau = document.getElementById('vranesh-plateau');
    var scene = document.getElementById('vranesh-arbre');
    if (!section || !plateau || !scene) { return; }

    plateau.textContent = '';
    var themes = Array.isArray(etat.situations) ? etat.situations : [];

    if (themes.length === 0) {
      section.hidden = false;
      plateau.hidden = false;
      scene.hidden = true;
      plateau.appendChild(el('p', 'vranesh-boussole-vide',
        'Aucun thème de futurs pour l’instant — pose une première situation ci-dessous, '
        + 'elle deviendra un cap de ta boussole.'));
      coteRepos('Clique un thème — son arbre se déplie.');
      return;
    }

    var pts = positionsCaps(themes.length);
    // Le noyau de géométrie est un MODULE, donc différé : le registre (une seule
    // requête locale) peut être rendu avant qu'il ne soit évalué. On redessine
    // alors à `load`, qui arrive toujours après l'exécution des modules.
    if (!pts) {
      section.hidden = true;
      if (!boussoleEnAttente && document.readyState !== 'complete') {
        boussoleEnAttente = true;
        window.addEventListener('load', function () {
          boussoleEnAttente = false;
          rendreBoussole();
        }, { once: true });
      }
      return;
    }
    section.hidden = false;

    var svg = svgEl('svg', 'vranesh-aiguilles');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    themes.forEach(function (t, i) {
      var aiguille = svgEl('g', 'aiguille');
      var trait = svgEl('line', 'aiguille-trait');
      trait.setAttribute('x1', '50'); trait.setAttribute('y1', '50');
      trait.setAttribute('x2', String(50 + GEO.RAYON_AIGUILLE * pts[i].cos));
      trait.setAttribute('y2', String(50 + GEO.RAYON_AIGUILLE * pts[i].sin));
      var pointe = svgEl('circle', 'aiguille-pointe');
      pointe.setAttribute('cx', String(50 + GEO.RAYON_AIGUILLE * pts[i].cos));
      pointe.setAttribute('cy', String(50 + GEO.RAYON_AIGUILLE * pts[i].sin));
      pointe.setAttribute('r', '2.1');
      aiguille.appendChild(trait); aiguille.appendChild(pointe);
      svg.appendChild(aiguille);
    });
    plateau.appendChild(svg);

    var coeur = el('div', 'boussole-coeur');
    coeur.setAttribute('aria-hidden', 'true');
    coeur.appendChild(medaillon());
    plateau.appendChild(coeur);

    themes.forEach(function (situation, i) {
      var scenarios = scenariosDe(situation.id);
      var etatCap = situation.advenue === true
        ? 'advenu'
        : (situation.a_explorer === true ? 'à explorer' : libelleCompte(scenarios.length));
      // Un cap OUVRE l'arbre : c'est un bouton, pas un lien vers le registre.
      var cap = document.createElement('button');
      cap.type = 'button';
      cap.className = 'cap'
        + (situation.a_explorer === true ? ' cap--avenir' : '')
        + (situation.advenue === true ? ' cap--advenu' : '');
      cap.style.left = (50 + GEO.RAYON_CAP * pts[i].cos) + '%';
      cap.style.top = (50 + GEO.RAYON_CAP * pts[i].sin) + '%';
      cap.setAttribute('aria-label', nomCourt(situation.intitule) + ' — ' + etatCap);

      var corps = el('span', 'cap-corps');
      corps.appendChild(el('span', 'cap-nom', nomCourt(situation.intitule)));
      corps.appendChild(el('span', 'cap-etat', etatCap));
      cap.appendChild(corps);
      cap.addEventListener('click', function () { ouvrirArbre(situation); });
      plateau.appendChild(cap);
    });

    plateau.classList.add('is-pret');

    // Rafraîchissement après écriture : si un arbre était ouvert, on le rouvre.
    if (themeOuvert) {
      var encore = themes.filter(function (t) { return t.id === themeOuvert; });
      if (encore.length === 1) { ouvrirArbre(encore[0]); return; }
      themeOuvert = null;
    }
    plateau.hidden = false;
    scene.hidden = true;
    coteRepos('Clique un thème — son arbre se déplie.');
  }

  // ---------- Bascule de vue ----------

  function poserVue(vue) {
    etat.vue = (vue === 'anticipees') ? 'anticipees' : 'toutes';
    var retourArbre = document.getElementById('vranesh-arbre-retour');
    if (retourArbre) { retourArbre.addEventListener('click', fermerArbre); }
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

  // ---- Le dénouement (0019) : désigner la branche qui a poussé ----
  // scenarioId null → rouvrir le thème (aucune suppression).
  // Sinon → le serveur protège d'abord la branche retenue, PUIS coupe les
  // autres. Le geste a déjà été confirmé dans la page ; ici, on l'émet.
  async function poserDenouement(situationId, scenarioId) {
    if (!situationId) { return; }
    var res = await appelApi('/api/situations',
      { id: situationId, scenario_advenu_id: scenarioId || null }, 'PATCH');
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    if (!res.ok) {
      messageForm(scenarioId
        ? 'La branche n’a pas été retenue. Rien n’a été supprimé.'
        : 'Le thème n’a pas été rouvert. Réessaie.', true);
      return;
    }
    await rafraichir();
  }

  // « En créer une autre si nouvelle branche » : l'imprévu s'écrit d'abord
  // comme un scénario ordinaire, puis se désigne comme advenu. En deux appels,
  // et dans cet ordre — si le second échoue, la branche neuve est déjà en base
  // et rien n'a été coupé : Paul peut recommencer sans avoir rien perdu.
  async function poserDenouementNeuf(situationId, deroule) {
    if (!situationId || !deroule) { return; }
    var res = await appelApi('/api/scenarios',
      { situation_id: situationId, deroule: deroule }, 'POST');
    if (res.status === 401) { montrer('vranesh-auth'); return; }
    var cree = res.ok && res.data && res.data.data ? res.data.data : null;
    if (!cree || !cree.id) {
      messageForm('La branche neuve n’a pas été écrite. Rien n’a été supprimé.', true);
      return;
    }
    await poserDenouement(situationId, cree.id);
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
    rendreBoussole();
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
        },
        // Les yeux de Léo : comptes + intitulés des situations — jamais le
        // déroulé d'un scénario, jamais un identifiant.
        etat: {
          compteurs: {
            'situations ouvertes': total,
            'situations à explorer': aExplorer,
            'futurs écrits': etat.scenarios.length
          },
          listes: {
            'Les situations de Paul (cap VRANESH)': etat.situations
              .slice(0, 40)
              .map(function (s) {
                var item = { libelle: (s.intitule || '').trim() };
                item.marque = (s.a_explorer === true) ? 'à explorer' : 'anticipée';
                return item;
              })
              .filter(function (i) { return Boolean(i.libelle); })
          }
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
    var retourArbre = document.getElementById('vranesh-arbre-retour');
    if (retourArbre) { retourArbre.addEventListener('click', fermerArbre); }
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

  // Fonctions pures exposées pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaVranesh = {
    situationsVisibles: situationsVisibles,
    nomCourt: nomCourt,
    etiquetteBranche: etiquetteBranche,
    charpente: charpente
  };

  demarrer().catch(function () { montrer('vranesh-erreur'); });
})();
